

window.FIREBASE_ROOT = "https://roll20-99914.firebaseio.com/";
window.FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJyb2xsMjAtZGV2QGFwcHNwb3QuZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6InJvbGwyMC1kZXZAYXBwc3BvdC5nc2VydmljZWFjY291bnQuY29tIiwiYXVkIjoiaHR0cHM6Ly9pZGVudGl0eXRvb2xraXQuZ29vZ2xlYXBpcy5jb20vZ29vZ2xlLmlkZW50aXR5LmlkZW50aXR5dG9vbGtpdC52MS5JZGVudGl0eVRvb2xraXQiLCJpYXQiOjE2NTI2NjY0NDEsImV4cCI6MTY1MjY3MDA0MSwidWlkIjo0NTk4MzEsImNsYWltcyI6eyJjdXJyZW50Y2FtcGFpZ24iOiJjYW1wYWlnbi0xMjU5Nzc5Ni1XeXBIc1hVS19OdG5QUmFya0QxQ2RRIiwidXNlcmlkIjo0NTk4MzF9fQ.HxmwWE0QM5O_3Z-JhIfUw5wnxYK8zYt442BrI9DHuB2vE3xOs5ZJgqeto7kzwcAqBJo_olDw-uOWGMY_vhqZnE1HvWWlIYAoajguaxg0QpIxqNhcaDUmdfX5Euc3SGE_dPbKotnvmJtX9_kY3D73cuBgYwZFN-1IaqRPSJYtQlEa8VFexCGTHtj_R4w79Wywr4W7VfhAIma-WUE46unzOxPpvknhVXVdXsMsmzC_8yLCnMIbAPIog30GEZaAv6Bkl_VH9wV2xWuo4RBnkn7KsbwEraP3C1WHEseeTP55k-6_oIMhiOGC-wIFAkjLnXnigx-AE2qNdX4z2MLrZ26TkQ";
window.RANDOM_ENTROPY = "KINslmV7PFINAww2o3bIxmVPlTRwk5BS9CD9fNtlE4wLjKdQ7+AA/cUoOaRBQwYZnvlod1q39i2+t4Wq8p5YQA==";
window.apiKey = "AIzaSyDSuyx7vpT7ZS0EdeX68qVKIQKv9MfSQN0";
window.authDomain = "roll20-dev.firebaseapp.com";
window.databaseURL = "https://roll20-99914.firebaseio.com/";
window.projectId = "roll20-dev";
window.storageBucket = "roll20-dev.appspot.com";
window.messagingSenderId = "717330860670";
window.appId = "1:717330860670:web:8bd50673cd0a383f4b662f";

$(function() {

	$(".tab-content .editor, #apiconsole").each(function() {
		var editor = ace.edit(this);
	    editor.setTheme("ace/theme/monokai");
	    editor.setHighlightActiveLine(false);
	    editor.getSession().setUseWorker(false);
	    editor.getSession().setMode("ace/mode/javascript");
	    if($(this).hasClass("editor")) {
	    	var currentval = ($(this).next("textarea").val());
	    	editor.getSession().setValue(currentval ? currentval : "");
	    }
	});

	$("#scriptorder a:first").tab("show");
	// BUG FIX FOR JQUERY NOT LOADING CHOSEN CORRECTLY IF IT'S HIDDEN ON LOAD
	$(".scripttype").chosen();

	$(".savescript").on("click", function() {
		if($(this).hasClass("disabled")) return;

		$(this).addClass("disabled").text("Saving...");

		var othis = this;

		var $parent = $(this).parents(".script");

		var scriptid = $parent.attr("id").replace("script-", "");

		if($parent.find(".instructions").length === 0) {
			var name = $parent.find("input").val();
			var content = ace.edit($parent.find(".editor")[0]).getSession().getValue();
		}
		else {
			var name = "library";
			var content = {};
			$parent.find("[data-name]").each(function() {
				if($(this).attr("type") === "checkbox" && !$(this).is(":checked")) {
					content[($(this).attr("data-name"))] = false;
				}
				else {
					content[($(this).attr("data-name"))] = $(this).val();
				}
			})
			content["lastsaved"] = Date.now();
		}
		JSON.stringify(content);

		$.post("/campaigns/save_script/12597796/" + scriptid, {name: name, content: content}, function(data) {
			if(data === "success") {
				$(othis).removeClass("disabled").text("Saved!");
				var $tab = $("#scriptorder a[href=#script-"+scriptid+"]");
				if(scriptid === "new") {
					window.location.href = window.location.href + "";
				}
				else if (name != "library") {
					$tab.text(name);
				}
				setTimeout(function() {
					$(othis).text("Save Script");
				}, 2000);

				notifier.child("scriptrestart").set(true);
				notifier.child("errorlock").set(null);

			}
			else {
				alert("Error saving script: " + data);
			}
		});
	});

	$(".restartsandbox").on("click", function() {
		notifier.child("scriptrestart").set(true);
		notifier.child("errorlock").set(null);
	});

	$(".deletescript").on("click", function() {
		var $parent = $(this).parents(".script");
		var scriptid = $parent.attr("id").replace("script-", "");

		scriptdependencies = [];
		_.each(currentscripts, function(script) {
			oscript = {};
			for(var yscript in yamlscripts) {
				if(yamlscripts[yscript].jsoninfo.name.toLowerCase() === script.toLowerCase()) {
					oscript = yamlscripts[yscript];
				}
			}
			if(_.isEmpty(oscript) === false) {
				_.each(oscript.jsoninfo.dependencies, function(dep) {
					scriptdependencies.push(dep.toLowerCase());
				})
			};
		});

		if(scriptdependencies.indexOf($parent.attr("data-scriptname").toLowerCase()) > -1) {
			conf = confirm($parent.attr("data-scriptname") + " has one or more scripts that depend on it to function. Disabling or deleting this script could cause other scripts to stop functioning. Do you wish to continue?");
			if(!conf) {
				return;
			}
		}

		if(confirm("Are you sure you want to delete the script? This can't be undone. Click OK to Delete, Cancel to Keep.")) {
			$.post("/campaigns/delete_script/12597796/" + scriptid, function(data) {
				notifier.child("scriptrestart").set(true);
				notifier.child("errorlock").set(null);
				window.location.href = window.location.href + "";
			});
		}
	});

	$(".togglescript").on("click", function() {
		var $parent = $(this).parents(".script");
		var scriptid = $parent.attr("id").replace("script-", "");
		var othis = this;

		scriptdependencies = [];
		_.each(currentscripts, function(script) {
			oscript = {};
			for(var yscript in yamlscripts) {
				if(yamlscripts[yscript].jsoninfo.name.toLowerCase() === script.toLowerCase()) {
					oscript = yamlscripts[yscript];
				}
			}
			if(_.isEmpty(oscript) === false) {
				_.each(oscript.jsoninfo.dependencies, function(dep) {
					scriptdependencies.push(dep.toLowerCase());
				})
			};
		});

		if(scriptdependencies.indexOf($parent.attr("data-scriptname").toLowerCase()) > -1 && $(this).hasClass("active")) {
			conf = confirm($parent.attr("data-scriptname") + " has one or more scripts that depend on it to function. Disabling or deleting this script could cause other scripts to stop functioning. Do you wish to continue?");
			if(!conf) {
				return;
			}
		}

		if($(this).hasClass("active")) {
			$.post("/campaigns/toggle_script/12597796/" + scriptid, {state: "inactive"}, function(data) {
				notifier.child("scriptrestart").set(true);
				notifier.child("errorlock").set(null);
				$(othis).removeClass("active").addClass("inactive").text("Enable Script");
				setTimeout(function() { window.location.href = window.location.href + ""; }, 500);
			});
		}
		else {
			$.post("/campaigns/toggle_script/12597796/" + scriptid, {state: "active"}, function(data) {
				notifier.child("scriptrestart").set(true);
				notifier.child("errorlock").set(null);
				$(othis).removeClass("inactive").addClass("active").text("Disable Script");
				setTimeout(function() { window.location.href = window.location.href + ""; }, 500);
			});
		}
	});

	$("select[name=scripttype]").on("change", function() {
		var match = "";
		var matchscript;
		$("#script-previews .preview").hide();
		if($("#script-previews .preview[data-shortname=" + $(this).val() + "]").length > 0) {
			$("#script-previews .preview[data-shortname=" + $(this).val() + "]").show();
		}
		else {
			var match = $(this).val();
			_.each(prettyscripts, function(category) {
				_.each(category, function(script) {
					if(script.shortname === match) {
						matchscript = script;
					};
				})
			})
			$("#script-previews").append("<div class='preview' data-shortname='" + matchscript.shortname + "'><h3>" + matchscript.jsoninfo.name + "</h3><p><strong>Version: </strong>" + matchscript.jsoninfo.version + "</p><p><strong>Authors: </strong>" + matchscript.jsoninfo.authors + "</p><div class='instructions'>" + matchscript.mdowninstructions + "</div><div><button class='btn btn-primary addscript' style='margin-top:10px;'>Add Script</button><button class='btn btn-info importscript' style='margin-top:10px; margin-left: 20px;'><span class='pictos'>W</span> Import</button></div></div>");
			$("#script-previews .preview[data-shortname=" + $(this).val() + "]").show();
		};

		$(".addscript").on("click", function() {
			if($(this).hasClass("disabled")) return;

			$(this).addClass("disabled").text("Saving...");

			var othis = this;

			var $parent = $(this).parents(".script");

			var scriptid = "new";
			var name = matchscript.jsoninfo.name;
			var content = matchscript.jsoninfo;
			var shortname = matchscript.shortname;

			var scripts_to_add = [matchscript];
			addscripts = [];
			conflicts = [];
			modifies = {};
			curmodifies = {};
			_.each(matchscript.jsoninfo.conflicts, function(conflict) {
				conflicts.push(conflict.toLowerCase());
			});
			for(var m in matchscript.jsoninfo.modifies) {
				if(!(m in modifies) || modifies[m].toLowerCase().indexOf("write") === -1) {
					modifies[m] = matchscript.jsoninfo.modifies[m];
				}
			}
			scripts_to_add = $.merge(scripts_to_add, dependencycheck(matchscript))
			scripts_to_add = scripts_to_add.filter(function(script) {
				return currentscripts.indexOf(script.jsoninfo.name.toLowerCase()) == -1;
			});
			fatalconflicts = currentscripts.filter(function(script) {
				return conflicts.indexOf(script.toLowerCase()) > -1;
			});
			_.each(currentscripts, function(script) {
				oscript = {};
				for(var yscript in yamlscripts) {
					if(yamlscripts[yscript].jsoninfo.name.toLowerCase() === script.toLowerCase()) {
						oscript = yamlscripts[yscript];
					}
				}
				if(_.isEmpty(oscript) === false) {
					for(var m in oscript.jsoninfo.modifies) {
						if(!(m in curmodifies) || curmodifies[m].toLowerCase().indexOf("write") === -1) {
							curmodifies[m] = oscript.jsoninfo.modifies[m];
						}
					}
				};
			});
			modifieswarning = _.intersection(Object.keys(modifies), Object.keys(curmodifies));

			if(modifieswarning.length > 0) {
				conf = confirm(matchscript.jsoninfo.name + " or it's dependencies read or write fields that are used by other scripts you currently have installed. There is a possibility that these scripts might conflict with each other. Would you like to continue the installation?");
				if(!conf) {
					$(othis).removeClass("disabled").text("Add Script");
					return;
				}
			};

			var scripts_to_add = _.uniq(scripts_to_add, function(script) {
				return script.short…
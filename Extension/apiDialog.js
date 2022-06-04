const apiHandles = {
  directories: {
    // "directory name":{
    //   handle:FileSystemDirectoryHandle,
    //   interfaceID:'string'
    // }
  },
  scriptHandles:{
    // 'scriptname.js':{
    //   r20ID:number|string,
    //   json:FileSystemFileHandle,
    //   active:FileSystemFileHandle,//The handle for the selected version of the script
    //   handles:{"versionNum|base":FileSystemFileHandle}
    // },
  }
};

(function() {
  const $buttonContainer = $('<div>').css({display:'flex',gap:'0.5rem','justify-content':'center'});
  const $playButton = $(`<button class="requires-directory material-icons btn btn-primary" disabled>sync_disabled</button>`);
  $playButton.prop({title:'Pause sync',id:'playButton'});
  $playButton.on('click',toggleSync);
  const $directoryButton = $(`<button class="material-icons btn btn-primary">create_new_folder</button>`);
  $directoryButton.prop('title','Add a new directory');
  const $refreshButton = $(`<button class="requires-directory material-icons btn btn-primary" disabled>replay</button>`);
  $refreshButton.on('click',refreshSync);
  $refreshButton.prop('title','Refresh code');
  $directoryButton.on('click',updateDirectory);
  $buttonContainer.append($playButton,$directoryButton,$refreshButton);

  const $scriptOrder = $('#scriptorder');
  $scriptOrder.css({display:'flex','align-items':'center','flex-wrap':'wrap',gap:'0.5rem 0'});
  const $interface = $('<div>');
  $interface.css({
    'border-radius':'10px',
    display:'grid',
    padding:'15px',
    'box-shadow': 'rgb(204 219 232) 0px 0px 6px 0px inset, rgb(255 255 255 / 50%) -3px -3px 6px 1px inset',
    'margin-bottom':'10px',
    gap:'0.5rem'
  });
  const $instructions = $('<p>').append(`Use the buttons below to control which directories are monitored. The status of a given script that is monitored is given in the script's tab.`);
  $interface.append($('<h3>API Autoupload Extension</h3>'),$instructions,$buttonContainer);
  $scriptOrder.before($interface);

  const $statusContainer = $('<div id="directoryStatusContainer">').css({display:'flex',gap:'0.5rem','flex-wrap':'wrap'});
  $interface.append($statusContainer);

  const $logContainer = $('<div id="autoUpdateLog">').append($('<h4 id="logHeader">Update Log</h4>'));
  $interface.append($logContainer);
  
  const $R20newScript = $('a[href="#script-new"]');
  const $R20newContainer = $R20newScript.parent();
  $R20newScript.remove();

  const addInput = document.createElement('input');
  addInput.type='text';
  addInput.setAttribute('list','foundFiles');
  addInput.id = 'selectedFile';
  addInput.className = 'requires-directory';
  addInput.setAttribute('disabled','');
  const $addFileButton = $('<button class="requires-directory btn btn-primary material-icons" disabled></button>').append('upload_file');
  const foundFiles = document.createElement('datalist');
  foundFiles.id = 'foundFiles';
  $R20newContainer.append(foundFiles,addInput,$addFileButton);
  $R20newContainer.addClass('addContainer');
  $addFileButton.on('click',fileSelect);
  
  const $scriptTabs = $('#scriptorder a');
  $scriptTabs.each(function(){
    const $contents = $(this).contents();
    if(!this.href.endsWith('#script-library') && $contents.length === 1){
      const scriptName = $contents[0].textContent;
      const scriptID = this.href.replace(/.+?script-(\d+)/,'$1');
      const $statusSpan = $(`<span id="status-${scriptID}" class="material-icons">`).append('sync_disabled');
      $contents.before($statusSpan);
      $(this).css({
        'background-color':'#b65050',
        color:'white'
      });
      const scriptContent = Array.from(document.getElementById(`script-${scriptID}`).children);
      scriptContent.forEach((elem)=>elem.style.display = 'none');
      uploadScriptDialog(scriptName,scriptID);
    }
  });
})();
/*
  API Upload Feature plan:
  - Ability to monitor multiple directories
  - Ability to upload code for scripts in game
  - Ability to add new scripts to game
  - Ability to select from multiple versions of a script

  Is it possibles:
  - Ability to test script default settings
  - Export scripts for import to another game
*/
const myRoot = firebase.database().ref();
let lastNewIndex = 111;
let intervalID = 0;
let intervalStart = 0;
let heartbeatID = 0;

let fullCampaignID;

(function(){
  const scriptSource = Array.from(document.querySelectorAll('.container:not(:is(.topbar,.globalfooter)) script:not([src])'))[1].textContent;
  scriptSource.replace(/campaign-\d+?-([^"]+)/,(match,extendID)=>fullCampaignID = extendID);
})();

const campaignID = +window.location.href.replace(/.+?\/(\d+).*/,'$1');
const myNotifier = myRoot.child("api-notifiers").child(`campaign-${campaignID}-${fullCampaignID}`);

/**
 * Adds a status tracker for a directory to the extension's injected interface.
 * @param {FileSystemDirectoryHandle} handle - The handle for the directory that needs to be added to the interface.
 */
function addDirectoryToInterface(handle){
  apiHandles.directories[handle.name] = {handle,interfaceID:lastNewIndex};
  
  const newStatus = document.createElement('span');
  newStatus.id = `status--${lastNewIndex}`;
  newStatus.style.backgroundColor = gtgColor;
  newStatus.className = 'status';
  newStatus.append(handle.name);
  directoryStatusContainer.append(newStatus);
  lastNewIndex++;
}

function updateInterface(){

}
/**
 * Function to update the stored directory handles. Compares each stored handle to the new handle to ensure it is not a duplicate before adding the handle to the storage. This function is created with arrow syntax because it needs to share the same `this` as the function that was actually triggered by the user's click event.
 */
const resetHandles = async ()=>{
  try{
    const direc = await getDirectory();//Query the user for the directory to monitor(directory)));
    if(Object.keys(apiHandles.directories).some(key => direc.name === key)){
      //Need handling for directory already being monitored
      return;
    }
    addDirectoryToInterface(direc);
    const conditionalButtons = Array.from(document.querySelectorAll('.requires-directory'));
    conditionalButtons.forEach((button)=>{
      button.removeAttribute('disabled');
    });
    updateLog(`Began Monitoring ${direc.name} directory`);
    return true;
  }catch(err){
    //Eventually send alert that an invalid directory was sent if the error was for unsafe selection.
  }
}

/**
 * Function to expand the stored directories into the handles for the js files that are contained therein. Will dig down `depth` number of directories to find js and script.json files.
 * @param {FileSystemDirectoryHandle} directoryHandle - the handle for the directory to be expanded.
 * @param {number} [n=0] - How deep the search has gone so far
 * @param {object} [sJSON] - The parsed JSON of the script.json file for this chain if it exists.
 */
async function expandDirectory(directoryHandle,n=0,sJSON){
  const directories = (await mapFromDirectory(directoryHandle, (handle)=>{
    if(handle.kind === 'file' && handle.name.endsWith('.js')){
      const refName = sJSON?.script || handle.name;
      const version = sJSON ?
        directoryHandle.name :
        'base';
      if(refName === handle.name){
        apiHandles.scriptHandles[refName] = apiHandles.scriptHandles[refName] ||
          {handles:{},modified:0};
        if((version === sJSON?.version || version === 'base')){
          apiHandles.scriptHandles[refName].active =  apiHandles.scriptHandles[refName].active ||
            version;
        }
        apiHandles.scriptHandles[refName].handles[version] = handle;
        const existingOptions = Array.from(foundFiles.children)
          .map((n)=>n.textContent);
        if(!apiHandles.scriptHandles[refName].active && existingOptions.every(opt => opt !== refName)){
          const newOpt = document.createElement('option');
          newOpt.append(refName);
          foundFiles.append(newOpt);
        }
      }
    }else if(handle.kind === 'directory'){
      return handle;
    }
  })).filter(handle=>handle);
  if(n >= 5){
    //Need to add feedback that folder structure was too complex
    return;
  }
  if(!sJSON){
    try{
      const jsonHandle = await directoryHandle.getFileHandle('script.json');
      const file = await jsonHandle.getFile();
      const text = await file.text();
      sJSON = JSON.parse(text);
      if(sJSON.script){
        apiHandles.scriptHandles[sJSON.script] = apiHandles.scriptHandles[sJSON.script] ||
          {handles:{},modified:0};
        apiHandles.scriptHandles[sJSON.script].json = sJSON;
      }
    }catch(err){
      //Handling for improper script.json. No handling if no script.json found
    }
  }
  n++;
  const directoryPromise = directories.map(directoryHandle => expandDirectory(directoryHandle,n,sJSON));
  await Promise.all(directoryPromise);
  return;
}

/**
 * Function to trigger selecting a new file to add the sandbox
 */
async function fileSelect(){
  let newName = selectedFile.value.trim();
  if(!newName.endsWith('.js')){
    newName += '.js';
  }
  const existingScript = scriptInGame(newName);
  if(!newName || existingScript){
    //Need feedback about name requirements
    return;
  }
  clearTimers();
  selectedFile.value = '';
  await saveScript('new',newName,'',true);
  const newID = await getLastScriptID();
  uploadScriptDialog(newName,newID);
  startFilePoll();
}

/**
 * Function that clears all the polling and hearbeat timers
 */
function clearTimers(){
  clearTimeout(intervalID);
  intervalID = 0;
  intervalStart = 0;
  clearTimeout(heartbeatID);
  heartbeatID = 0;
}

/**
 * Function to get the existing script names
 */
function existingScriptNames(){
  const scriptPanes = Array.from(document.querySelectorAll('.script.tab-pane:not(:is(#script-library,#script-new))'));
  return scriptPanes.map(div => div.getAttribute('data-scriptname'));
}

/**
 * Checks if a script already exists in game and returns the header a element if it does
 * @param {string} scriptName - Name of the script to look for in game
 * @returns {DOMElement} - The a element (static) of the header for this script
 */
function scriptInGame(scriptName){
  return existingScriptNames()
    .find(t => t === scriptName)
}

/**
 * Saves the updated code to firebase
 * @param {stirng|number} scriptID 
 * @param {string} scriptName 
 * @param {string|object} content 
 * @returns {Promise} - A promise that resolves to the data returned from the xmlhttprequest
 */
function saveScript(scriptID,scriptName,content,restart){
  return new Promise((resolve) =>{
    $.post(`/campaigns/save_script/${campaignID}/${scriptID}`,{name:scriptName,content},async (data)=>{
      if(restart){
        await restartSandbox();
      }
      resolve(data);
    });
  });
}

function getScriptElements(that){
  const scriptID = that.getAttribute('data-scriptid');
  const statusSpan = document.getElementById(`status-${scriptID}`);
  const scriptLink = statusSpan.parentElement;
  const statusItem = scriptLink.parentElement;
  const scriptContainer = document.getElementById(`script-${scriptID}`);
  const scriptName = scriptContainer.getAttribute('data-scriptname');
  return [scriptID,statusSpan,statusItem,scriptContainer,scriptName,scriptLink];
}

async function deleteScript(){
  const [scriptID,statusSpan,statusItem,scriptContainer,scriptName] = getScriptElements(this);
  updateLog(`Removed ${scriptName}`);
  apiHandles.scriptHandles[scriptName].modified = 0;
  apiHandles.scriptHandles[scriptName].active = undefined;
  const deleteDone = await new Promise(resolve =>{
    $.post(`/campaigns/delete_script/${campaignID}/${scriptID}}`, function(data) {
      restartSandbox();
      resolve(data);
    });
  });
  navigateToLibrary();
  statusItem.remove();
  scriptContainer.remove();
}

function navigateToLibrary(){
  const libraryLink = document.querySelector('[href="#script-library"]');
  libraryLink.click();
}

async function disableScript(){
  const [scriptID,statusSpan,statusItem,scriptContainer,scriptName,statusLink] = getScriptElements(this);
  const currStatus = this.className.replace(/.*?((?:in)?active).*/,'$1');
  const statusSwitch = {
    active:['inactive','Enable Script',true,warningColor,'sync_disabled'],
    inactive:['active','Disable Script',false,gtgColor,'sync']
  };
  apiHandles.scriptHandles[scriptName].inactive = statusSwitch[currStatus][2];
  const disableDone = await new Promise(resolve =>{
    $.post(`/campaigns/toggle_script/${campaignID}/${scriptID}`, {state: statusSwitch[currStatus][0]}, function(data) {
      restartSandbox();
      resolve(data);
    });
  });
  this.className = `btn ${statusSwitch[currStatus][0]}`;
  console.log(statusSwitch[currStatus][1]);
  this.replaceChildren(statusSwitch[currStatus][1]);
  statusLink.style.backgroundColor = statusSwitch[currStatus][3];
  statusSpan.replaceChildren(statusSwitch[currStatus][4]);
}

/**
 * Restarts the API sandbox and clears the error display
 */
async function restartSandbox(){
  await myNotifier.child("scriptrestart").set(true);
  await myNotifier.child("errorlock").set(null);
}

/**
 * Function that gets the ID of the last script added to the sandbox by initiating an xmlhttprequest for the existing api page.
 * @returns {Promise} - A Promise that resolves to the new ID.
 */
function getLastScriptID(){
  var xhr = new XMLHttpRequest();
  const newID = new Promise(resolve =>{
    xhr.onload = function() {
      const a = this.responseXML.querySelector('#scriptorder li:nth-last-child(2) a');
      const id = a.href.replace(/.+#script-/,'');
      resolve(id);
    }
  });
  xhr.open("GET", `/campaigns/scripts/${campaignID}`);
  xhr.responseType = "document";
  xhr.send();
  return newID
}

//Polling Functions
/**
 * Starts or restarts the polling of the directories
 * @param {string} [message] - A specific message that should be added to the log when the poll is started
 */
function startFilePoll(){
  intervalStart = Date.now();
  clearTimers();
  updateSandbox('start',intervalStart);
}

/**
 * pauses/resumes file sync
 */
function toggleSync(){
  if(intervalID){
    clearTimers();
    intervalID = 0;
    $('.status').css({'background-color':warningColor});
    playButton.replaceChildren('sync');
    playButton.title = 'Resume Sync';
    updateLog('Paused monitoring');
  }else{
    intervalID = 1;
    $('.status').css({'background-color':warningColor});
    updateLog('Resumed monitoring');
    updateSandbox(undefined,intervalStart);
  }
}

/**
 * Forces a refresh
 */
function refreshSync(){
  updateLog('Reloaded all files');
  startFilePoll();
}

/**
 * 
 * @param {any} start - variable to indicate if this is the start of a poll sequence or not. If the value is truthy, it is the start.
 * @param {number} timeSig - The time signature of the currently active poll sequence.
 * @returns 
 */
async function updateSandbox(start,timeSig){
  let reload = false;
  if(timeSig !== intervalStart) return;
  if(!playButton.title.startsWith('Pause')){
    playButton.replaceChildren('sync_disabled');
    playButton.title = 'Pause Sync';
    $('#monitorScan').removeClass('paused');
  }
  const directoryPromise = Object.values(apiHandles.directories).map(async (direc)=>{
    await expandDirectory(direc.handle);
  });
  await Promise.all(directoryPromise);
  const monitoredScripts = existingScriptNames();
  const monitorPromise = monitoredScripts.map(async (scriptName)=>{
    const handleObj = apiHandles.scriptHandles[scriptName];
    if(!handleObj?.active || handleObj.inactive){
      //Handling for the object not being present or active
      return;
    }
    try{
      const fileRef = handleObj.active;
      const file = await handleObj.handles[fileRef]?.getFile();
      if(!file) return;//Likely need more refined handling for if the handle at the active index is no longer stored.
      if(file.lastModifiedDate > handleObj.modified){
        const code = await file.text();
        const saved = await saveScript(handleObj.r20ID,scriptName,code);
        reload = true;
        if(saved !== 'success'){
          styleScriptHeader({id:handleObj.r20ID,warning:true});
        }else{
          styleScriptHeader({id:handleObj.r20ID,active:true})
        }
        apiHandles.scriptHandles[scriptName].modified = file.lastModifiedDate;
      }
    }catch(err){
      delete handleObj.handles[handleObj.active];
      handleObj.modified = 0;
      handleObj.active = Object.keys(handleObj.handles)[0] || undefined;
      styleScriptHeader({id:handleObj.r20ID,inactive:true})
      //Handling for if the file is no longer present
    }
  });
  await Promise.all(monitorPromise);
  if(reload){
    restartSandbox();
  }
  if(heartbeatID){
    clearTimeout(heartbeatID);
  }
  if(timeSig === intervalStart && (start || intervalID)){
    heartbeatID = setTimeout(heartbeat,5000,'status');
    intervalID = setTimeout(updateSandbox,1000,undefined,timeSig);//Check files every second
  }
}

function styleScriptHeader({id,warning,active,inactive}){
  const span = document.getElementById(`status-${id}`);
  const a = span.parentElement;
  span.replaceChildren(
    inactive ?
      'sync_disabled' :
      warning ?
        'sync_problem' :
        'sync'
  );
  a.style.backgroundColor = inactive ?
    disableColor :
    warning ?
      warningColor :
      gtgColor;
}

(()=>{
  const worker = ()=>{
    if(typeof buildUI !== 'undefined'){
      buildUI();
    }else{
      console.log('functions missing');
      setTimeout(()=>worker(),100);
    }
  };
  worker();
})();
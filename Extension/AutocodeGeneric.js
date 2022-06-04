//Colors for display
const warningColor = '#eddf67';
const gtgColor = '#448744';
const disableColor = '#b65050';

function humanTime(){
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
}

function padTime(time){
  return `${time}`.replace(/^\d$/,'0$&');
}

function updateLog(message){
  const logSpan = document.createElement('span');
  logSpan.append(`${humanTime()} - ${message}`);
  const lastEntry = autoUpdateLog.getElementsByTagName('h4')[0].nextSibling;
  if(lastEntry){
    autoUpdateLog.insertBefore(logSpan,lastEntry);
  }else{
    autoUpdateLog.append(logSpan);
  }
}

function heartbeat(className){
  const containers = className ?
    Array.from(document.getElementsByClassName(className)) :
    [monitorContainer];
  containers.forEach((cont)=>cont.style.backgroundColor = warningColor);
  updateLog('Extension error or connection issue detected');
}

async function updateDirectory(){
  const res = await resetHandles();
  updateInterface();
  if(res){
    startFilePoll();
  }
}

const getDirectory = ()=>{
  if(!window.showDirectoryPicker){
    alert('The autoUpdate extension is not compatible with your browser. Please try with a different browser. This extension is only supported in chromium browsers, although some like Brave have disabled the technology that it runs on.');
    return null;
  }
  try{
    return window.showDirectoryPicker();
  }catch(err){
    return null;
  }
};

/**
 * Function to easily iterate over the contents of a directory Handle.
 * @param {FileSystemDirectoryHandle} directoryHandle - The handle for the directory to be iterated over.
 * @param {function} callback - The function to execute for each handle contained in the directory. Callback is not awaited.
 */
async function forEachInDirectory(directoryHandle,callback){
  for await(let handle of directoryHandle.values()){
    callback(handle);
  }
}

/**
 * Asynchronous version of forEach that also works on objects and other iterables. Awaits the return value of each step before progressing to the next step.
 * @param {object|array} arr - An iterable object
 * @param {function} callback - A function to run for each element of the object. Callback is awaited before progressing to the next item.
 */
async function _forEach(arr,callback){
  for await(let [entry,index] of arr){
    await callback(entry,index)
  }
}

async function _forEachInDirectory(directoryHandle,callback){
  for await(let handle of directoryHandle.values()){
    await callback(handle);
  }
}

/**
 * Function to easily iterate over the contents of a directory Handle and return an array with the return value of the callback function.
 * @param {FileSystemDirectoryHandle} directoryHandle - The handle for the directory to be iterated over.
 * @param {function} callback - The function to execute for each handle contained in the directory. Callback is not awaited.
 * @returns {Promise} - Promise that resolves to an array of the callback return values
 */
async function mapFromDirectory(directoryHandle,callback){
  const retArr = [];
  for await(let handle of directoryHandle.values()){
    const retVal = callback(handle);
    retArr.push(retVal);
  }
  return Promise.all(retArr);
}

/**
 * Function to easily iterate over the contents of a directory Handle and return an array with the return value of the callback function. The result of each callback is awaited before processing the next item.
 * @param {FileSystemDirectoryHandle} directoryHandle - The handle for the directory to be iterated over.
 * @param {function} callback - The function to execute for each handle contained in the directory. Callback is not awaited.
 * @returns {Promise} - A promise that resolves to the array of return values.
 */
async function _mapFromDirectory(directoryHandle,callback){
  const retArr = []
  for await(let handle of directoryHandle.values()){
    const retVal = await callback(handle);
    retArr.push(retVal);
  }
  return retArr;
}

/**
 * Function to create a new container for a script's details. Also adds the appropriate buttons to the scriptorder unordered list.
 * @param {string|number} scriptID - The id of the script to create the container for.
 * @param {string} scriptName - The name of the script
 * @returns 
 */
function createScriptContainer(scriptID,scriptName){
  //Create the actual script container
  const scriptContainer = document.createElement('div');
  scriptContainer.id = `script-${scriptID}`;
  scriptContainer.className = 'script tab-pane';
  scriptContainer.setAttribute('data-scriptname',scriptName);
  const tabContent = Array.from(document.getElementsByClassName('tab-content'))[0];
  tabContent.append(scriptContainer);

  //create the list button
  const listItem = document.createElement('li');

  const statusSpan = document.createElement('span');
  statusSpan.id = `status-${scriptID}`;
  statusSpan.className = 'material-icons';
  statusSpan.append('sync_disabled');
  
  const listA = document.createElement('a');
  listA.href = `#script-${scriptID}`;
  listA.style.backgroundColor = disableColor;
  listA.style.color = 'white';
  listA.setAttribute('data-toggle','tab');

  listA.append(statusSpan,scriptName);
  listItem.append(listA);
  
  const addContainer = Array.from(document.getElementsByClassName('addContainer'))[0];
  scriptorder.insertBefore(listItem,addContainer);

  return scriptContainer;
}

/**
 * Replaces the default script editor pane with upload instructions for the extension.
 * @param {string} scriptName 
 * @param {string|number} scriptID 
 */
function uploadScriptDialog(scriptName,scriptID){
  const scriptHeader = document.createElement('h3');
  scriptHeader.append(scriptName);
  const instructions = document.createElement('p');
  instructions.append('Select a directory where the file for this script exists to begin syncing');

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-scriptid',scriptID);
  deleteButton.addEventListener('click',deleteScript);
  deleteButton.className = 'btn btn-danger';
  deleteButton.append('Delete Script');

  const disableButton = document.createElement('button');
  disableButton.setAttribute('data-scriptid',scriptID);
  disableButton.addEventListener('click',disableScript);
  disableButton.className = 'btn active';
  disableButton.append('Disable Script');

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex space-between';

  buttonContainer.append(disableButton,deleteButton);

  const scriptContainer = document.getElementById(`script-${scriptID}`) || createScriptContainer(scriptID,scriptName);
  scriptContainer.replaceChildren(scriptHeader,instructions,buttonContainer);
  apiHandles.scriptHandles[scriptName] = apiHandles.scriptHandles[scriptName] ||
    {handles:{},modified:0};
  apiHandles.scriptHandles[scriptName].r20ID = +scriptID;
};
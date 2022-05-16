//Colors for display
const warningColor = '#eddf67';
const gtgColor = '#448744';

//Object to hold the directory and file handles
const sheetHandles = {
  directory:null,
  subdirectories:[],
  files:{
    translation:{handle:null,name:'',modified:0,errors:'',selected:false},
    html:{handle:null,name:'',modified:0,errors:'',selected:false},
    css:{handle:null,name:'',modified:0,errors:'',selected:false}
  },
  intervalID:0,
  intervalStart:0,
};
//Cycle tracker for triggering class change that triggers the scanning animation
let cycles = 0;
//CSS words that will cause css to be thrown out. These CSS bits are loggable for more information.
const evilLoggableCSSArr = [
  '\bdata:\b','eval','cookie','\bwindow\b','\bparent\b','\bthis\b', // suspicious javascript-type words
  'behaviou?r','expression','moz-binding','@charset','javascript','vbscript','\<','\\\\w'
];
//High/low byte order characters that will cause css to be thrown out by Roll20
const evilCSSBytes = [
  '[\x7f-\xff]', // high bytes -- suspect
  '[\x00-\x08\x0B\x0C\x0E-\x1F]', // low bytes -- suspect
  '&\#', // bad charset
];
const evilCSSBytesRx = new RegExp(evilCSSBytes.join('|'));

const resetHandles = async ()=>{
  const direc = await getDirectory();//Query the user for the directory to monitor
  if(!direc) return false;
  sheetHandles.directory = direc;
  Object.keys(sheetHandles.files).forEach((key)=>sheetHandles[key] = {handle:null,modified:0,errors:''});//Clear the preexisting handles.
  sheetHandles.intervalID = 0;
  const logs = $('#autoUpdateLog *:nth-child(2) ~ *');
  logs.remove();
  return true;
}

async function updateDirectory(){
  const res = await resetHandles();
  if(res){
    startFilePoll();
  }
}

async function findFiles(){
  //Get the handles for the individual files/directories
  const foundFiles = {
    translation:null,
    html:null,
    css:null
  }
  for await (let handle of sheetHandles.directory.values()){
    if(handle.kind === 'file'){
      const file = await handle.getFile();
      const text = await file.text();
      if(handle.name === 'translation.json'){
        translationSpan.replaceChildren(handle.name);
        foundFiles.translation = handle;
        try{
          JSON.parse(text);
          translationSpan.style['background-color'] = gtgColor;
          sheetHandles.files.translation.errors = '';//The translation JSON is valid!
        }catch(err){
          sheetHandles.files.translation.errors = 'Invalid Translation JSON.';
          translationSpan.style['background-color'] = warningColor
        }
      }else if(handle.name.endsWith('.html')){
        htmlSelect.replaceChildren(handle.name);
        htmlSelect.style['background-color'] = gtgColor;
        foundFiles.html = handle;
        //There aren't really any html errors the extension needs to watch for.
      }else if(handle.name.endsWith('.css')){
        cssSelect.replaceChildren(handle.name);
        foundFiles.css = handle;
        //Check for various CSS evil words that will cause the styling to be thrown out for roll templates
        const evilLogMatch = evilLoggableCSSArr.reduce((memo,test)=>{
          memo[test] = text.match(new RegExp(test),'ig');
          return memo;
        },{});
        const evilBytesMatch = evilCSSBytesRx.test(text);
        sheetHandles.files.css.errors = [];
        let backColor = gtgColor;
        if(evilBytesMatch){
          sheetHandles.files.css.errors.push(`Suspect text found in CSS file. Review for low and/or high byte characters`);
          backColor = warningColor;
        }
        const problems = Object.entries(evilLogMatch)
          .reduce( (memo, [test,found] ) => {
            if(found){
              memo.push(`${test}:${found.join(', ')}`);
            }
            return memo;
          },[]);
        if(problems.length){
          sheetHandles.files.css.errors.push(`Suspect words found in CSS:\n${problems.join('\n')}`);
          backColor = warningColor;
        }
        sheetHandles.files.css.errors = sheetHandles.files.css.errors.join('\n');
        cssSelect.style['background-color'] = backColor;
      }
    }
  }
  Object.entries(foundFiles).forEach(([fileType,handle])=>{
    if(!handle){
      const status = fileType === 'translation' ?
        translationSpan :
        document.getElementById(`${fileType}Select`);
      status.replaceChildren(fileType);
      status.style['background-color'] = warningColor;
      if(sheetHandles.files[fileType].name){
        updateLog(`removed ${sheetHandles.files[fileType].name}`);
      }
    }
    if(!handle){
      sheetHandles.files[fileType].modified = 0;
    }
    sheetHandles.files[fileType].name = handle ? handle.name : '';
    sheetHandles.files[fileType].handle = handle;
  });
  jsonErr.replaceChildren();
  let errorAction = 'hide';
  ['translation','html','css'].forEach((fileType)=>{
    if(sheetHandles.files[fileType].errors){
      errorAction = 'show';
      const errSpan = document.createElement('span');
      errSpan.append(sheetHandles.files[fileType].errors);
      jsonErr.append(errSpan);
    }
  });
  autoDirectoryMonitorSpan.replaceChildren(`Monitoring ${sheetHandles.directory.name}`);
  monitorContainer.style = `background-color:${gtgColor}`;
  autoDirectoryButton.replaceChildren('Change Directory');
  $('#jsonErr')[errorAction]();
}

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

function startFilePoll(){
  if(sheetHandles.intervalID){
    cycles = 0;
    clearTimeout(sheetHandles.intervalID);
  }
  sheetHandles.intervalStart = Date.now()
  updateLog(`Began Monitoring ${sheetHandles.directory.name}`);
  updateSheet('start',sheetHandles.intervalStart);
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

async function updateSheet(start,timeSig){
  if(timeSig !== sheetHandles.intervalStart) return;
  if(!cycles){
    $('#monitorScan').toggleClass('cycled');
  }
  cycles++;
  if(cycles > 3){
    cycles = 0;
  }
  await findFiles();
  const filePromises = Object.entries(sheetHandles.files).map(async ([fileType,obj])=>{
    if(typeof obj !== 'object' || !obj.handle) return;
    const file = await obj.handle.getFile();
    if(file.lastModified > sheetHandles[fileType].modified){
      sheetHandles[fileType].modified = file.lastModified;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      const $input = $(`#sheetsandbox .container .btn.${fileType} input`);
      const input = $input[0];
      input.files = transfer.files;
      updateLog(`updated ${file.name}`);
      $input.change();
    }
  });
  await Promise.all(filePromises);
  if(timeSig === sheetHandles.intervalStart && (start || sheetHandles.intervalID)){
    sheetHandles.intervalID = setTimeout(updateSheet,1000,undefined,timeSig);//Check files every second
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

function createInterface(){
  const logContainer = document.createElement('div');
  logContainer.id = 'autoUpdateLog';
  const logHead = document.createElement('h4');
  logHead.replaceChildren('Update Log');
  const jsonErr = document.createElement('div');
  jsonErr.id = 'jsonErr';
  $('#jsonErr').hide();
  logContainer.replaceChildren(jsonErr,logHead);

  const monitorContainer = document.createElement('div');
  monitorContainer.id = 'monitorContainer';
  monitorContainer.className = 'statusDisplay';
  monitorContainer.style['background-color'] = '#b65050';
  const monitorScan = document.createElement('div');
  monitorScan.id = 'monitorScan';
  const monitorSpan = document.getElementById('autoDirectoryMonitorSpan') ||
    document.createElement('span');
  monitorSpan.id = 'autoDirectoryMonitorSpan';
  monitorSpan.append('No Directory Selected');
  monitorContainer.append(monitorScan,monitorSpan);
  
  const buttonContainer = document.createElement('div');
  const directoryButton = document.createElement('button');
  directoryButton.id = 'autoDirectoryButton';
  directoryButton.replaceChildren('Select Directory');
  directoryButton.className = 'btn';
  directoryButton.addEventListener('click',updateDirectory);
  buttonContainer.replaceChildren(directoryButton);
  buttonContainer.className = `${buttonContainer.className} autoButtonContainer`;
  return [monitorContainer,logContainer,buttonContainer];
}
//Object to hold the directory and file handles
const sheetHandles = {
  directory:null,
  subdirectories:[],
  files:{
    translation:{handle:null,name:'',modified:0,errors:''},
    html:{handle:null,name:'',modified:0,errors:''},
    css:{handle:null,name:'',modified:0,errors:''}
  },
  intervalID:0,
  intervalStart:0,
  heartbeatID:0
};
const templateFileObj = {handle:null,name:'',modified:0,errors:''};
//CSS words that will cause css to be thrown out. These CSS bits are loggable for more information.
const evilLoggableCSSArr = [
  '\\bdata:\\b','eval','cookie','\\bwindow\\b','\\bparent\\b','\\bthis\\b', // suspicious javascript-type words
  'behaviou?r','expression','moz-binding','@charset','javascript','vbscript','\\<','\\\\w'
];
//High/low byte order characters that will cause css to be thrown out by Roll20
const evilCSSBytes = [
  '[\x7f-\xff]', // high bytes -- suspect
  '[\x00-\x08\x0B\x0C\x0E-\x1F]', // low bytes -- suspect
  '&\#', // bad charset
];
const evilCSSBytesRx = new RegExp(evilCSSBytes.join('|'));

function updateInterface(){
  playButton.replaceChildren('sync_disabled');
}

const resetHandles = async ()=>{
  const direc = await getDirectory();//Query the user for the directory to monitor
  if(!direc) return false;
  sheetHandles.directory = direc;
  Object.keys(sheetHandles.files).forEach((key)=>sheetHandles.files[key] = {...templateFileObj});//Clear the preexisting handles.
  sheetHandles.intervalID = 0;
  const logs = $('#autoUpdateLog *:nth-child(2) ~ *');
  logs.remove();
  playButton.disabled = false;
  refreshButton.disabled = false;
  return true;
}

async function findFiles(){
  //Get the handles for the individual files/directories
  const foundFiles = {
    translation:[],
    html:[],
    css:[]
  }
  for await (let handle of sheetHandles.directory.values()){
    if(handle.kind === 'file'){
      const file = await handle.getFile();
      const text = await file.text();
      if(handle.name === 'translation.json'){
        foundFiles.translation.unshift(handle);
        try{
          JSON.parse(text);
          translationSelect.style['background-color'] = gtgColor;
          sheetHandles.files.translation.errors = '';//The translation JSON is valid!
        }catch(err){
          sheetHandles.files.translation.errors = 'Invalid Translation JSON.';
          translationSelect.style['background-color'] = warningColor
        }
      }else if(handle.name.endsWith('.html')){
        htmlSelect.style['background-color'] = gtgColor;
        foundFiles.html.push(handle);
        //There aren't really any html errors the extension needs to watch for.
      }else if(handle.name.endsWith('.css')){
        foundFiles.css.push(handle);
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
    }else if(handle.kind === 'directory' && handle.name === 'translations'){
      for await(let transHandle of handle.values()){
        if(transHandle.kind === 'file' && transHandle.name.endsWith('.json')){
          foundFiles.translation.push(transHandle);
        }
      }
    }
  }
  updateTrackedHandles(foundFiles);
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
  monitorContainer.style['background-color'] = gtgColor;
  autoDirectoryButton.title = 'Change Directory';
  $('#jsonErr')[errorAction]();
}
//Language name conversion from [stackoverflow](https://stackoverflow.com/questions/25131388/how-do-you-convert-a-language-code-to-the-language-name-in-javascript)
//[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames)
// const languageNames = new Intl.DisplayNames(['en'], {
//   type: 'language'
// });

// console.log('en', languageNames.of('en'))
// console.log('en-US', languageNames.of('en-US'))
// console.log('es-MX', languageNames.of('es-MX'))
function updateTrackedHandles(foundFiles){
  Object.entries(foundFiles).forEach(([fileType,handles])=>{
    const currentFile = sheetHandles.files[fileType];
    
    const select = document.getElementById(`${fileType}Select`);
    const options = [];
    if(!handles.length){
      select.style['background-color'] = warningColor;
      currentFile.modified = 0;
      if(currentFile.name){
        updateLog(`Removed ${currentFile.name}`);
      }
      options.push(createCodeOption(fileType.toUpperCase()));
    }
    const handleObj = handles.reduce((memo,handle)=>{
      memo[handle.name] = handle;
      options.push(createCodeOption(handle.name));
      return memo;
    },{});
    const newFile = {...templateFileObj};
    if(!currentFile.handle || !currentFile.handle.isSameEntry(handleObj[currentFile.name])){
      //If the previously selected file no longer exists, look for a new file
      const newHandle = handles[0];//Grab the first file handle that exists currently
      if(newHandle){
        //If there is a handle, then set it as the new file to track
        newFile.name = newHandle.name;
        newFile.handle = newHandle;
      }
      if(currentFile.name && currentFile.name !== newFile.name){
        updateLog(`Removed ${currentFile.name}`);
      }
      sheetHandles.files[fileType] = newFile;//Set the file to track (removes tracking if no handle found)
    }
    const optionIndexArr = [...Array(select.options.length).keys()];
    options.forEach((option)=>{
      if(!optionIndexArr.some((i)=>select.options.item(i).value === option.value)){
        select.append(option);
      }
    });
    select.disabled = options.length > 1 ? false : true;
    if(currentFile.name !== sheetHandles.files[fileType].name){
      select.value = sheetHandles.files[fileType].name || fileType.toUpperCase();
    }
    optionIndexArr.forEach((n)=>{
      const opt = select.options.item(n);
      if(!options.some((option)=>option.value === opt.value)){
        opt.remove();
      }
    });
  });
}

function startFilePoll(message){
  if(sheetHandles.intervalID){
    clearTimeout(sheetHandles.intervalID);
  }
  sheetHandles.intervalStart = Date.now();
  updateLog(message || `Began Monitoring ${sheetHandles.directory.name}`);
  updateSheet('start',sheetHandles.intervalStart);
}

async function updateSheet(start,timeSig){
  if(timeSig !== sheetHandles.intervalStart) return;
  if(!playButton.title.startsWith('Pause')){
    playButton.replaceChildren('sync_disabled');
    playButton.title = 'Pause Sync';
    $('#monitorScan').removeClass('paused');
  }
  await findFiles();
  const filePromises = Object.entries(sheetHandles.files).map(async ([fileType,obj])=>{
    if(typeof obj !== 'object' || !obj.handle) return;
    const file = await obj.handle.getFile();
    if(file.lastModified > sheetHandles.files[fileType].modified){
      sheetHandles.files[fileType].modified = file.lastModified;
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
    if(sheetHandles.heartbeatID){
      clearTimeout(sheetHandles.heartbeatID);
    }
    sheetHandles.heartbeatID = setTimeout(heartbeat,3000);
    sheetHandles.intervalID = setTimeout(updateSheet,1000,undefined,timeSig);//Check files every second
  }
}

function toggleMonitor(){
  if(sheetHandles.intervalID){
    clearTimeout(sheetHandles.intervalID);
    sheetHandles.intervalID = 0;
    autoDirectoryMonitorSpan.replaceChildren(`Paused ${sheetHandles.directory.name}`);
    monitorContainer.style['background-color'] = warningColor;
    $('#monitorScan').addClass('paused');
    playButton.replaceChildren('sync');
    playButton.title = 'Resume Sync';
    updateLog('Paused monitoring');
  }else{
    sheetHandles.intervalID = 1;
    autoDirectoryMonitorSpan.replaceChildren(`Monitoring ${sheetHandles.directory.name}`);
    $('#monitorScan').removeClass('paused');
    updateLog('Resumed monitoring');
    updateSheet(undefined,sheetHandles.intervalStart);
  }
}

function reloadDirectory(){
  ['translation','html','css'].forEach((prop)=>sheetHandles.files[prop].modified = 0);
  console.log('sheetHandles',JSON.parse(JSON.stringify(sheetHandles)));
  startFilePoll('Reloaded all files');
}

async function changeFile(){
  if(!sheetHandles.directory) return;
  console.log(this);
  console.log('exist sheetHandles',JSON.parse(JSON.stringify(sheetHandles)));
  const fileType = this.id.replace(/Select/,'');
  const directoryHandle = fileType === 'translation' && this.value !== 'translation.json' ?
    await sheetHandles.directory.getDirectoryHandle('translations') :
    sheetHandles.directory;
  const fileHandle = await directoryHandle.getFileHandle(this.value);
  sheetHandles.files[fileType].handle = fileHandle;
  sheetHandles.files[fileType].name = fileHandle.name;
  sheetHandles.files[fileType].modified = 0;
  startFilePoll(`Switched ${fileType} to ${fileHandle.name}`);
}

(()=>{
  const worker = ()=>{
    if(typeof buildUI !== 'undefined'){
      buildUI();
    }else{
      setTimeout(()=>worker(),100);
    }
  };
  worker();
})();
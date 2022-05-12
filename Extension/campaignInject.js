const warningColor = '#eddf67';
const gtgColor = '#448744';
const handles = {
  directory:null,
  files:{
    translation:{handle:null,name:'',modified:0,errors:''},
    html:{handle:null,name:'',modified:0,errors:''},
    css:{handle:null,name:'',modified:0,errors:''}
  },
  interval:0
};
let cycles = 0;
const evilLoggableCSSArr = [
  '\bdata:\b','eval','cookie','\bwindow\b','\bparent\b','\bthis\b', // suspicious javascript-type words
  'behaviou?r','expression','moz-binding','@charset','javascript','vbscript','\<','\\\\w'
];

const evilCSSBytes = [
  '[\x7f-\xff]', // high bytes -- suspect
  '[\x00-\x08\x0B\x0C\x0E-\x1F]', // low bytes -- suspect
  '&\#', // bad charset
];
const evilCSSBytesRx = new RegExp(evilCSSBytes.join('|'));

const resetHandles = async ()=>{
  handles.directory = await getDirectory();//Query the user for the directory to monitor
  Object.keys(handles.files).forEach((key)=>handles[key] = {handle:null,modified:0,errors:''});//Clear the preexisting handles.
  handles.interval = 0;
  const logHead = autoUpdateLog.getElementsByTagName('h4')[0];
  autoUpdateLog.replaceChildren(logHead);//Clear the log
}

async function updateDirectory(){
  await resetHandles();
  startFilePoll();
}

async function findFiles(){
  //Get the handles for the individual files/directories
  const foundFiles = {
    translation:null,
    html:null,
    css:null
  }
  for await (let handle of handles.directory.values()){
    if(handle.kind === 'file'){
      const file = await handle.getFile();
      const text = await file.text();
      if(handle.name === 'translation.json'){
        translationSpan.replaceChildren(handle.name);
        foundFiles.translation = handle;
        try{
          JSON.parse(text);
          translationSpan.style['background-color'] = gtgColor;
          handles.files.translation.errors = '';//The translation JSON is valid!
        }catch(err){
          handles.files.translation.errors = 'Invalid Translation JSON.';
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
        handles.files.css.errors = [];
        let backColor = gtgColor;
        if(evilBytesMatch){
          handles.files.css.errors.push(`Suspect text found in CSS file. Review for low and/or high byte characters`);
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
          handles.files.css.errors.push(`Suspect words found in CSS:\n${problems.join('\n')}`);
          backColor = warningColor;
        }
        handles.files.css.errors = handles.files.css.errors.join('\n');
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
      if(handles.files[fileType].name){
        updateLog(`removed ${handles.files[fileType].name}`);
      }
    }
    if(!handle){
      handles.files[fileType].modified = 0;
    }
    handles.files[fileType].name = handle ? handle.name : '';
    handles.files[fileType].handle = handle;
  });
  jsonErr.replaceChildren();
  let errorAction = 'hide';
  ['translation','html','css'].forEach((fileType)=>{
    if(handles.files[fileType].errors){
      const errSpan = document.createElement('span');
      errSpan.append(handles.files[fileType].errors);
      jsonErr.append(errSpan);
    }
  });
  autoDirectoryMonitorSpan.replaceChildren(`Monitoring ${handles.directory.name}`);
  autoDirectoryMonitorSpan.style = `background-color:${gtgColor}`;
  autoDirectoryButton.replaceChildren('Change Directory');
  $('#sheetsandbox p.json-error')[errorAction]();
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
  if(handles.intervalID){
    clearTimeout(handles.interval);
  }
  updateLog(`Began Monitoring ${handles.directory.name}`);
  updateSheet('start');
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

async function updateSheet(start){
  if(!cycles){
    $('#autoDirectoryMonitorSpan').toggleClass('cycled');
  }
  cycles++;
  if(cycles > 3){
    cycles = 0;
  }
  await findFiles();
  const filePromises = Object.entries(handles.files).map(async ([fileType,obj])=>{
    if(typeof obj !== 'object' || !obj.handle) return;
    const file = await obj.handle.getFile();
    if(file.lastModified > handles[fileType].modified){
      handles[fileType].modified = file.lastModified;
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
  if(start || handles.intervalID){
    handles.intervalID = setTimeout(updateSheet,1000);//Check files every second
  }
}

const getDirectory = ()=>{
  if(!window.showDirectoryPicker){
    alert('The autoUpdate extension is not compatible with your browser. Please try with a different browser. This extension is only supported in chromium browsers, although some like Brave have disabled the technology that it runs on.');
    return;
  }
  const verify = confirm('The Roll20 auto update extension will provide a directory interface. The extension will have access to all files in the directory that you select with the picker. You may also get a confirmation dialogue from your chromium browser as well. Do you want to continue?');
  if(!verify) return 'File picker canceled.';
  return window.showDirectoryPicker();
};
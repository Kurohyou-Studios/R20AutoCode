function createSelect(type){
  const select = document.createElement('select');
  select.id = `${type}Select`;
  select.style['background-color'] = '#b65050';
  select.className = 'statusDisplay';
  select.addEventListener('change',changeFile);
  const option = createCodeOption(type.toUpperCase())
  select.append(option);
  select.value = type.toUpperCase();
  select.disabled = true;
  return select;
}

function createCodeOption(value,text){
  const option = document.createElement('option');
  option.value = value;
  option.append(text || value);
  return option;
}

const body = document.getElementsByTagName('body')[0];
body.addEventListener('autoBuilt',async ()=>{
  console.log('Injecting sheet dialog');
  
  const dialogContainer = sheetsandbox.parentElement;
  dialogContainer.style['max-height'] = '100%';
  dialogContainer.overflow = 'auto';

  const R20ButtonContainer = sheetsandbox.getElementsByClassName('container')[0];
  $('#sheetsandbox .container').hide();
  const jsonErr = sheetsandbox.getElementsByClassName('json-error')[0];
  const jsonHR = jsonErr.nextSibling;

  const statusContainer = document.createElement('div');
  statusContainer.id = 'statusContainer';

  const htmlSelect = createSelect('html');

  const cssSelect = createSelect('css');

  const translationSelect = createSelect('translation');

  statusContainer.append(htmlSelect,cssSelect,translationSelect);
  sheetsandbox.insertBefore(statusContainer,jsonErr);

  const instructionP = sheetsandbox.getElementsByTagName('p')[0];
  instructionP.replaceChildren('Use the buttons below to change which directory the game pulls the character sheet from and to reload the character sheet code. Errors found in the code will be noted below the buttons.');
  
  const [monitorContainer,logContainer,buttonContainer] = createInterface();

  sheetsandbox.insertBefore(logContainer,jsonHR);
  sheetsandbox.insertBefore(monitorContainer,R20ButtonContainer);
  sheetsandbox.insertBefore(buttonContainer,R20ButtonContainer);
});

async function createDialog(){
}

function createInterface(){
  const logContainer = document.createElement('div');
  logContainer.id = 'autoUpdateLog';

  const logHead = document.createElement('h4');
  logHead.replaceChildren('Update Log');

  const jsonErr = document.createElement('div');
  jsonErr.id = 'jsonErr';
  logContainer.replaceChildren(jsonErr,logHead);

  const monitorContainer = document.createElement('div');
  monitorContainer.id = 'monitorContainer';
  monitorContainer.className = 'statusDisplay';
  monitorContainer.style['background-color'] = '#b65050';

  const monitorSpan = document.createElement('span');
  monitorSpan.id = 'autoDirectoryMonitorSpan';
  monitorSpan.append('No Directory Selected');

  monitorContainer.append(monitorSpan);

  const directoryButton = document.createElement('button');
  directoryButton.id = 'autoDirectoryButton';
  directoryButton.replaceChildren('drive_folder_upload');
  directoryButton.className = 'btn material-icons';
  directoryButton.title = 'Select directory';
  directoryButton.addEventListener('click',updateDirectory);

  const playButton = document.createElement('button');
  playButton.id = 'playButton';
  playButton.className = 'pause material-icons btn';
  playButton.disabled = true;
  playButton.append('sync');
  playButton.title = 'Pause sync';
  playButton.addEventListener('click',toggleMonitor);

  const refreshButton = document.createElement('button');
  refreshButton.id = 'refreshButton';
  refreshButton.className = 'material-icons btn';
  refreshButton.disabled = true;
  refreshButton.append('replay');
  refreshButton.title = 'Refresh code';
  refreshButton.addEventListener('click',reloadDirectory);

  const buttonContainer = document.createElement('div');
  buttonContainer.replaceChildren(playButton,directoryButton,refreshButton);
  buttonContainer.className = `${buttonContainer.className} autoButtonContainer`;

  return [monitorContainer,logContainer,buttonContainer];
}
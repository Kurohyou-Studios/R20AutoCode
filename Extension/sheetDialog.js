(async function (){
  await new Promise(resolve =>{//Delay to ensure extension resource are loaded
    setTimeout(()=>{
      resolve(true);
    },200);
  });
  console.log('Sheet Dialog injected');
  const dialogContainer = sheetsandbox.parentElement;
  dialogContainer.style['max-height'] = '100%';
  dialogContainer.overflow = 'auto';
  const R20ButtonContainer = sheetsandbox.getElementsByClassName('container')[0];
  $('#sheetsandbox .container').hide();
  const jsonErr = sheetsandbox.getElementsByClassName('json-error')[0];
  const jsonHR = jsonErr.nextSibling;

  const statusContainer = document.createElement('div');
  statusContainer.id = 'statusContainer';
  const htmlSelect = document.createElement('span');
  htmlSelect.id = 'htmlSelect';
  htmlSelect.style['background-color'] = '#b65050';
  htmlSelect.className = 'statusDisplay';
  htmlSelect.append('HTML');
  const cssSelect = document.createElement('span');
  cssSelect.id = 'cssSelect';
  cssSelect.style['background-color'] = '#b65050';
  cssSelect.className = 'statusDisplay';
  cssSelect.append('CSS');
  const translationSpan = document.createElement('span');
  translationSpan.id = 'translationSpan';
  translationSpan.style['background-color'] = '#b65050';
  translationSpan.className = 'statusDisplay';
  translationSpan.append('Translation');
  statusContainer.append(htmlSelect,cssSelect,translationSpan);
  sheetsandbox.insertBefore(statusContainer,jsonErr);

  const instructionP = sheetsandbox.getElementsByTagName('p')[0];
  instructionP.replaceChildren('Use the buttons below to change which directory the game pulls the character sheet from and to reload the character sheet code. Errors found in the code will be noted below the buttons.');
  
  const [monitorContainer,logContainer,buttonContainer] = createInterface();

  sheetsandbox.insertBefore(logContainer,jsonHR);
  sheetsandbox.insertBefore(monitorContainer,R20ButtonContainer);
  sheetsandbox.insertBefore(buttonContainer,R20ButtonContainer);
})();
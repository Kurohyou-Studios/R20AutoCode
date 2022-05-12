/**
 * Description
 * @param {array} args - Array of arguments to pass to the callback function. See the specific Functions below for appropriate arguments.
 * @param {function} func - The callback function
 * @returns {Promise}
 */
 async function accessR20(args,func){
  let [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  const tabId = tab.id;
  return new Promise((resolve,reject) =>{
    chrome.scripting.executeScript({
      func,
      args: args,
      target: {
        tabId
      },
      world: 'MAIN',
    },
    (injectionResults) => {
      resolve(injectionResults[0].result);
    });
  });
}

(async function(){
  const type = await accessR20([],()=>{
    const url = window.location.href;
    let type;
    if(/editor/.test(url) && sheetsandbox){
      const dialogContainer = sheetsandbox.parentElement;
      dialogContainer.style.top = 0;
      dialogContainer.style.left = 0;
      dialogContainer.style['max-height'] = '100%';
      dialogContainer.overflow = 'auto';
      const R20ButtonContainer = sheetsandbox.getElementsByClassName('container')[0];
      $('#sheetsandbox .container').hide();
      const jsonErr = sheetsandbox.getElementsByClassName('json-error')[0];
      const jsonHR = jsonErr.nextSibling;

      const autoErr = document.createElement('div');
      autoErr.id = 'jsonErr';
      $('#autoErr').hide();
      sheetsandbox.insertBefore(autoErr,jsonHR);

      const logContainer = document.createElement('div');
      logContainer.id = 'autoUpdateLog';
      const logHead = document.createElement('h4');
      logHead.replaceChildren('Update Log');
      logContainer.replaceChildren(logHead);
      sheetsandbox.insertBefore(logContainer,jsonHR);

      const statusContainer = document.createElement('div');
      statusContainer.id = 'statusContainer';
      const htmlSelect = document.createElement('span');
      htmlSelect.id = 'htmlSelect';
      htmlSelect.style['background-color'] = '#b65050';
      htmlSelect.append('HTML');
      const cssSelect = document.createElement('span');
      cssSelect.id = 'cssSelect';
      cssSelect.style['background-color'] = '#b65050';
      cssSelect.append('CSS');
      const translationSpan = document.createElement('span');
      translationSpan.id = 'translationSpan';
      translationSpan.style['background-color'] = '#b65050';
      translationSpan.append('Translation');
      statusContainer.append(htmlSelect,cssSelect,translationSpan);
      sheetsandbox.insertBefore(statusContainer,jsonErr);

      const buttonContainer = document.createElement('div');
      const directoryButton = document.createElement('button');
      const instructionP = sheetsandbox.getElementsByTagName('p')[0];
      instructionP.replaceChildren('Use the buttons below to change which directory the game pulls the character sheet from and to reload the character sheet code. Errors found in the code will be noted below the buttons.');
      const monitorSpan = document.getElementById('autoDirectoryMonitorSpan') ||
        document.createElement('span');
      monitorSpan.id = 'autoDirectoryMonitorSpan';
      monitorSpan.append('No Directory Selected');
      monitorSpan.style['background-color'] = '#b65050';

      sheetsandbox.insertBefore(monitorSpan,R20ButtonContainer);
      directoryButton.id = 'autoDirectoryButton';
      directoryButton.replaceChildren('Select Directory');
      directoryButton.className = 'btn';
      directoryButton.addEventListener('click',updateDirectory);

      buttonContainer.replaceChildren(directoryButton);
      buttonContainer.className = `${buttonContainer.className} autoButtonContainer`;
      sheetsandbox.insertBefore(buttonContainer,R20ButtonContainer);
      type = 'sheet sandbox';
    }else if(/scripts/.test(url)){
      type = 'API script page';
    }
    return type;
  });
  popupContainer.replaceChildren(`Autoupload interface added to the ${type}. You can now close the extension's popup.`);
})();
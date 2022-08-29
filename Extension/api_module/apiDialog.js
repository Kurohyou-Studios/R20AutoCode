const apiHandles = {
  directories: {
    // "directory name":{
    //   handle:FileSystemDirectoryHandle,
    //   interfaceID:'string'
    // }
  },
  scriptHandles: {
    // 'scriptname.js':{
    //   r20ID:number|string,
    //   json:FileSystemFileHandle,
    //   active:FileSystemFileHandle,//The handle for the selected version of the script
    //   handles:{"versionNum|base":FileSystemFileHandle}
    // },
  }
};

async function buildUI() {
  console.log('building dialog');
  const interfaceSrc = await fetch(`${extensionID}/api_module/apiDialog.html`).then(res => res.text());
  const $interface = $(interfaceSrc);
  const $scriptOrder = $('#scriptorder');
  $scriptOrder.css({ display: 'flex', 'align-items': 'center', 'flex-wrap': 'wrap', gap: '0.5rem 0' });
  $scriptOrder.before($interface);

  const $statusContainer = $('<div id="directoryStatusContainer">').css({ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' });
  $interface.append($statusContainer);

  const $R20newScript = $('a[href="#script-new"]');
  const $R20newContainer = $R20newScript.parent();
  // $R20newScript.remove();

  const addInput = document.createElement('input');
  addInput.type = 'text';
  addInput.setAttribute('list', 'foundFiles');
  addInput.id = 'selectedFile';
  addInput.className = 'requires-directory';
  addInput.setAttribute('disabled', '');
  const $addFileButton = $('<button class="requires-directory btn btn-primary material-icons" disabled></button>').append('upload_file');
  const foundFiles = document.createElement('datalist');
  foundFiles.id = 'foundFiles';
  const $uploadContainer = $(
    '<li></li>',
    { className: 'addContainer' }
  );
  $uploadContainer.append(foundFiles, addInput, $addFileButton);
  $scriptOrder.append($uploadContainer);
  $addFileButton.on('click', fileSelect);
  const $scriptTabs = $('#scriptorder a');
  $scriptTabs.each(function () {
    const $contents = $(this).contents();
    if (
      !this.href.endsWith('#script-library') &&
      !this.href.endsWith('#script-new') &&
      $contents.length === 1
    ) {
      const scriptName = $contents[0].textContent;
      if (scriptName.endsWith(/\.js/)) {
        const scriptID = this.href.replace(/.+?script-(\d+)/, '$1');
        const $statusSpan = $(`<span id="status-${scriptID}" class="material-icons">`).append('sync_disabled');
        $contents.before($statusSpan);
        $(this).css({
          'background-color': '#b65050',
          color: 'white'
        });
        const scriptContent = Array.from(document.getElementById(`script-${scriptID}`).children);
        scriptContent.forEach((elem) => elem.style.display = 'none');
        uploadScriptDialog(scriptName, scriptID);
      }
    }
  });
}
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
  const $interface = await fetch(`${extensionID}/api_module/apiDialog.html`)
    .then(res => res.text())
    .then(t => $(t));
  const $scriptOrder = $('#scriptorder');
  $scriptOrder.css({ display: 'flex', 'align-items': 'center', 'flex-wrap': 'wrap', gap: '0.5rem 0' });
  $scriptOrder.before($interface);

  const $R20newScript = $('a[href="#script-new"]');
  const $R20newContainer = $R20newScript.parent();
  // $R20newScript.remove();

  const addInput = document.createElement('select');
  addInput.id = 'selectedFile';
  addInput.setAttribute('data-placeholder','Start monitoring a directory');
  addInput.className = 'requires-directory';
  addInput.setAttribute('disabled', '');
  const defOption = document.createElement('option');
  addInput.append(defOption);
  const $addFileButton = $('<button class="requires-directory btn btn-primary material-icons" disabled></button>').append('upload_file');
  const $uploadContainer = $(
    '<li></li>',
    { class: 'addContainer' }
  );
  $uploadContainer.append(addInput, $addFileButton);
  $scriptOrder.append($uploadContainer);
  $addFileButton.on('click', fileSelect);
  const $scriptTabs = $('#scriptorder a');
  
  const $directoryButton = $('#directoryButton');
  $directoryButton.click(updateDirectory);
  const $refreshButton = $('#refreshButton');
  $refreshButton.click(refreshSync);
  const $playButton = $('#playButton');
  $playButton.click(toggleSync);
  $scriptTabs.each(function () {
    const $contents = $(this).contents();
    if (
      !this.href.endsWith('#script-library') &&
      !this.href.endsWith('#script-new') &&
      $contents.length === 1
    ) {
      const scriptName = $contents[0].textContent;
      const scriptID = this.href.replace(/.+?script-(\d+)/, '$1');
      if (scriptName.endsWith(/\.js/)) {
        const $statusSpan = $(`<span id="status-${scriptID}" class="material-icons">`).append('sync_disabled');
        $contents.before($statusSpan);
        $(this).addClass('sync-style');
        const scriptContent = Array.from(document.getElementById(`script-${scriptID}`).children);
        scriptContent.forEach((elem) => elem.style.display = 'none');
        uploadScriptDialog(scriptName, scriptID);
      }
      const containerName = `--script-${scriptID}`;
      $(this).css('--_containerName',containerName);
      $(`#script-${scriptID}`).css('--_containerName', containerName);
    }
  });
  $('#selectedFile').chosen({width:'100%'});
}

// const s = document.createElement('script');
// s.setAttribute('id','SigilInject');
// s.setAttribute('type','text/javascript');
// const scriptURL = chrome.runtime.getURL('inject.js');
// console.log(scriptURL);
// s.setAttribute('src',scriptURL);
// (document.head || document.documentElement).append(s);
(function(){
  console.log('creating Autocode content');
  const body = document.getElementsByTagName('body')[0];
  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.id = `autoUploadScript`;
  
  const interfaceStyle = document.createElement('link');
  interfaceStyle.rel = 'styleSheet';
  interfaceStyle.href = chrome.runtime.getURL('generic_code/interface.css');

  const genericScript = document.createElement('script');
  genericScript.src = chrome.runtime.getURL('generic_code/AutocodeGeneric.js');

  const style = document.createElement('link');
  style.id = `autoUploadStyle`;
  style.rel = 'stylesheet';


  const iconLink = document.createElement('link');
  iconLink.rel = 'stylesheet';
  iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";

  const url = window.location.href;
  const injectJS = document.createElement('script');

  script.dataset.extensionID = genericScript.src.replace(/(chrome-extension:\/\/.+?)\/.+/,'$1');

  if(/editor/.test(url) && typeof sheetsandbox !== 'undefined'){
    //Sheet sandbox detected
    script.src = chrome.runtime.getURL('/campaign_module/campaignInject.js');
    style.href = chrome.runtime.getURL('/campaign_module/campaignInject.css');
    injectJS.src = chrome.runtime.getURL('/campaign_module/sheetDialog.js');
  }else if(/campaigns\/scripts/.test(url)){
    //API Page detected
    script.src = chrome.runtime.getURL('/api_module/apiInject.js');
    style.href = chrome.runtime.getURL('/api_module/apiInject.css');
    injectJS.src = chrome.runtime.getURL('/api_module/apiDialog.js');
  }
  head.append(interfaceStyle,style,iconLink);
  body.append(genericScript,script,injectJS);
  console.log('scripts injected');
})();
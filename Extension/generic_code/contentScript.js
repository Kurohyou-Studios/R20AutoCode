
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
  const mockJS = document.createElement('script');

  const mochaCSS = document.createElement('link');
  mochaCSS.rel = 'stylesheet';
  mochaCSS.href = chrome.runtime.getURL('test_framework/mocha10.css');

  const mochaScript = document.createElement('script');
  mochaScript.src = chrome.runtime.getURL('test_framework/mocha10.js');

  const chaiScript = document.createElement('script');
  chaiScript.src = chrome.runtime.getURL('test_framework/chai.js');

  if(/editor/.test(url) && typeof sheetsandbox !== 'undefined'){
    //Sheet sandbox detected
    script.src = chrome.runtime.getURL('/campaign_module/campaignInject.js');
    style.href = chrome.runtime.getURL('/campaign_module/campaignInject.css');
    injectJS.src = chrome.runtime.getURL('/campaign_module/sheetDialog.js');
    mockJS.src = chrome.runtime.getURL('/campaign_module/mock20Sheetworkers.js');
  }else if(/campaigns\/scripts/.test(url)){
    //Sheet sandbox detected
    script.src = chrome.runtime.getURL('/api_module/apiInject.js');
    style.href = chrome.runtime.getURL('/api_module/apiInject.css');
    injectJS.src = chrome.runtime.getURL('/api_module/apiDialog.js');
    // mockJS.src = chrome.runtime.getURL('/api_module/mock20Sheetworkers.js');
  }
  head.append(interfaceStyle,mochaCSS,mochaScript,chaiScript,style,iconLink);
  body.append(genericScript,script,injectJS,mockJS);
  console.log('scripts injected');
})();
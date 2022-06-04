
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
  interfaceStyle.href = chrome.runtime.getURL('interface.css');
  head.append(interfaceStyle);

  const genericScript = document.createElement('script');
  genericScript.src = chrome.runtime.getURL('AutocodeGeneric.js');
  body.append(genericScript);

  const style = document.createElement('link');
  style.id = `autoUploadStyle`;
  style.rel = 'stylesheet';

  const iconLink = document.createElement('link');
  iconLink.rel = 'stylesheet';
  iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";

  
  const url = window.location.href;
  const injectJS = document.createElement('script');
  if(/editor/.test(url) && sheetsandbox){
    //Sheet sandbox detected
    script.src = chrome.runtime.getURL('campaignInject.js');
    style.href = chrome.runtime.getURL('campaignInject.css');
    injectJS.src = chrome.runtime.getURL('sheetDialog.js');
  }else if(/scripts/.test(url)){
    //Api scripts page detected
    script.src = chrome.runtime.getURL('apiInject.js');
    style.href = chrome.runtime.getURL('apiInject.css');
    injectJS.src = chrome.runtime.getURL('apiDialog.js');
  }
  body.append(script);
  head.append(style);
  head.append(iconLink);
  body.append(injectJS);
})();

// const s = document.createElement('script');
// s.setAttribute('id','SigilInject');
// s.setAttribute('type','text/javascript');
// const scriptURL = chrome.runtime.getURL('inject.js');
// console.log(scriptURL);
// s.setAttribute('src',scriptURL);
// (document.head || document.documentElement).append(s);
(function(){
  const body = document.getElementsByTagName('body')[0];
  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.id = `autoUploadScript`;
  script.src = chrome.runtime.getURL('campaignInject.js');
  body.append(script);
  
  const style = document.createElement('link');
  style.id = `autoUploadStyle`;
  style.rel = 'stylesheet';
  style.href = chrome.runtime.getURL('campaignInject.css');
  head.append(style);

  const iconLink = document.createElement('link');
  iconLink.rel = 'stylesheet';
  iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
  head.append(iconLink);

  
  const url = window.location.href;
  const injectJS = document.createElement('script');
  if(/editor/.test(url) && sheetsandbox){
    //Sheet sandbox detected
    injectJS.src = chrome.runtime.getURL('sheetDialog.js');
  }else if(/scripts/.test(url)){
    //Api scripts page detected
    injectJS.src = chrome.runtime.getURL('apiDialog.js');
  }
  body.append(injectJS);
})();
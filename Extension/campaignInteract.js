
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
  const script = document.getElementById('autoUploadScript') || document.createElement('script');
  script.id = `autoUploadScript`;
  const style = document.getElementById('autoUploadStyle') || document.createElement('link');
  style.id = `autoUploadStyle`;
  script.src = chrome.runtime.getURL('campaignInject.js');

  style.rel = 'stylesheet';
  style.href = chrome.runtime.getURL('campaignInject.css');
  body.append(script);
  head.append(style);
})();
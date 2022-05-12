// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  chrome.action.disable();
  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on example.com pages
    let exampleRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {urlContains: '.roll20.net/editor'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {urlContains: 'https://app.roll20.net/campaigns/scripts'}
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {urlContains: '.roll20staging.net/editor'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {urlContains: 'https://app.roll20.net/campaigns/scripts'}
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };
    console.log(exampleRule);
    // Finally, apply our new array of rules
    let rules = [exampleRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });

});
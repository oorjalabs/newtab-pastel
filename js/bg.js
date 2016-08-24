var UNINSTALL_URL = "http://c306.net/whygo.html?src=nTP&utm_source=nTP%20for%20chrome&utm_medium=chrome_projects&utm_content=uninstall&utm_campaign=chrome_projects";

chrome.runtime.setUninstallURL(UNINSTALL_URL);

chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.create({});
});

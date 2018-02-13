const UNINSTALL_URL = "http://c306.net/whygo.html?src=nTP&utm_source=nTP%20for%20chrome&utm_medium=chrome_projects&utm_content=uninstall&utm_campaign=chrome_projects";
const UPDATE_NOTES_URL = "https://c306.net/apps/updates/app/pastel-new-tab/?utm_source=nTP%20for%20chrome&utm_medium=chrome_projects&utm_content=upgradeNotification_changelog&utm_campaign=chrome_projects";

const CHANGES_ICON = chrome.extension.getURL("img/ic_history_black_24px.svg");
const NOTIFICATION_ICON = chrome.extension.getURL("img/icon128.png");

const UPDATE_NOTIFICATION = false;
const EXTENSION_UPDATED_NOTIFICATION_ID = "extension_updated_notification_id";

chrome.browserAction.onClicked.addListener(tab => chrome.tabs.create({}));

// On install/update handler
chrome.runtime.onInstalled.addListener(details => {
  if(details.reason !== "chrome_update"){
    
    //Log versions to Google Analytics
    let version = chrome.app.getDetails().version;
    
    // Set uninstall url, if not local/dev install
    chrome.management.getSelf(e => 
      e.installType !== "development" && chrome.runtime.setUninstallURL(UNINSTALL_URL)
    );
    
    // Show install/update notification
    if(details.reason === "install" || UPDATE_NOTIFICATION){
      details.version = version;
      ls.set({"extensionUpdated": details});
    }
    
  }  
});

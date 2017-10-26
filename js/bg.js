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
    chrome.management.getSelf(function(e){
      if(e.installType !== "development")
        chrome.runtime.setUninstallURL(UNINSTALL_URL);
    });
    
    // Show install/update notification
    if(details.reason === "install" || UPDATE_NOTIFICATION){
      // showNotification({
      //   title: chrome.i18n.getMessage("shortName") + " " + (details.reason == 'install' ? "Installed" : "Updated"),
      //   message: (details.reason === "install" ? "Installed version " + version : "Upgraded to ver " + version) + ".",
      //   id: EXTENSION_UPDATED_NOTIFICATION_ID,
      //   buttons: [{
      //     title: details.reason === "install" ? "See recent update notes" : "See what's new in this update",
      //     iconUrl: CHANGES_ICON
      //   }],
      // });
    }
    
  }  
});


// chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
  
//   switch(notificationId){
    
//     case EXTENSION_UPDATED_NOTIFICATION_ID:
//       switch(buttonIndex){
//         case 0: // Show changes
//           chrome.tabs.create({url: UPDATE_NOTES_URL});
//           // trackButton(GA_NOTIFICATION_TRACK, EXTENSION_UPDATED_NOTIFICATION_ID, BUTTON_SHOW_CHANGES);
//           break;
          
//       }
//       break;
//   }
  
//   // Clear notification
//   chrome.notifications.clear(notificationId);  
// });



/**
 * showNotification
 * Displays a chrome.notification for the extension with click through URLs and event tracking 
 * @param {object} notif Object with details of notification - title, message, context, iconType
 * @return {null} null
 */
// function showNotification(notif){
//   var options = {
//     type: notif.type || "basic",
//     title: notif.title || "",
//     message: notif.message,
//     contextMessage: notif.contextMessage || "",
//     iconUrl: notif.iconUrl || NOTIFICATION_ICON,
//     isClickable: notif.isClickable || false,
//     requireInteraction: notif.requireInteraction || false,
//   };
  
//   if(notif.buttons)
//     options.buttons = notif.buttons;
  
//   chrome.notifications.create(notif.id || "", options, function(id){
//     console.log("notification: ", id);
//   });
// }


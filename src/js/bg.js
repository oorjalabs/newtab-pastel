const UPDATE_NOTIFICATION = false;
const EXTENSION_UPDATED_NOTIFICATION_ID = "extension_updated_notification_id";

chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({}));

// On install/update handler
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "chrome_update")
        return;
        
    const previousVersion = details.previousVersion ? getVersionNumberFromString(details.previousVersion) : 0;
    
    // Remove uninstall url, if not local/dev install
    chrome.runtime.setUninstallURL("")
    
    // Show install/update notification
    if (details.reason === "install" || UPDATE_NOTIFICATION) {
        ls.set({ "extensionUpdated": details.reason });
    }
    
    // Load colours into storage if installing or updating to first v2 colours version
    const COLOURS_V2 = 1.05;
    if (previousVersion <= COLOURS_V2) {
        ls.set({"allPastels": pastelsArray});
    }
    
    
    // Set up ACS notification alarm if not installed, and notification not shown before
    ls.get({
        "acsNotificationShown": false
    }).then(st => !st.acsNotificationShown && 
        // Check if ACS is installed
        chrome.runtime.sendMessage("einokpbfcmmopbfbpiofaeohhkmcbbcg", "checkAlive", isInstalled => {
            if (!chrome.runtime.lastError && isInstalled) {
                ls.set({
                    "acsNotificationShown": true
                });
                return;
            }
            
            const ONE_DAY_IN_MS = 24 * 3600 * 1000;
            const startDay = Date.now() + (details.reason === "install" ? 5 : 5 / 24) * ONE_DAY_IN_MS;
            
            chrome.alarms.create("alarm_acs_cws_notif", {
                "when": randomDate(startDay, startDay + 1 * ONE_DAY_IN_MS, 8, 19).getTime(), // 5-24 hours (+5 days if onInstall)
            });
        })
    );

});


chrome.alarms.onAlarm.addListener(alarm => {
    
    if (alarm.name !== "alarm_acs_cws_notif") {
        return console.log("Unidentified alarm: " + alarm.name);
    }
    
    // Show ACS notification acs is not installed
    return chrome.runtime.sendMessage("einokpbfcmmopbfbpiofaeohhkmcbbcg", "checkAlive", isInstalled => {
        
        if (!chrome.runtime.lastError && isInstalled) {
            ls.set({
                "acsNotificationShown": true
            });
            return;
        }
        
        // Show notification, and mark as shown
        ls.set({
            "extensionUpdated": NOTIFICATIONS.ACS_CWS.ID,
            "acsNotificationShown": true
        });
        
    });
    
});


/**
 * Parses version number, after removing date, from version string
 * @param {string} versionString Version string as returned by manifest
 * @param {boolean} [asString=false] If true, return `7` as `7.0`
 * @return {number} Version number
 */
function getVersionNumberFromString(versionString, asString = false) {
    const vArr = versionString.split(".")
    
    if (vArr.length < 4)
        return versionString;
    
    const version = parseFloat(`${vArr[2]}.${vArr[3] < 10 ? `0${parseInt(vArr[3])}` : vArr[3]}`);
    
    if (asString) {
        return Number.isInteger(version) ? `${version}.0` : Number.isInteger(version * 10) ? `${version}0` : `${version}`;
    }
    
    return version;
}


/**
 * @param {number} start 
 * @param {number} end 
 * @param {number} startHour 
 * @param {number} endHour 
 * @return {Date}
 */
function randomDate(start, end, startHour, endHour) {
    let date = new Date(+start + Math.random() * (end - start));
    const hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    if (date <= Date.now())
        date.setDate(date.getDate() + 1);
    return date;
}


function getSaturation (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let s, l = (max + min) / 2;
    
    if (max == min) {
        s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    }
    
    return Math.round(s * 100);
}

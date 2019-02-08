const UPDATE_NOTIFICATION = false;
const EXTENSION_UPDATED_NOTIFICATION_ID = "extension_updated_notification_id";

chrome.browserAction.onClicked.addListener(_ => chrome.tabs.create({}));

// On install/update handler
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "chrome_update")
        return;
        
    const version = chrome.app.getDetails().version;
    
    // Set uninstall url, if not local/dev install
    chrome.management.getSelf(e =>
        e.installType !== "development" && chrome.runtime.setUninstallURL(URLS.UNINSTALL)
    );
        
    // Show install/update notification
    if (details.reason === "install" || UPDATE_NOTIFICATION) {
        details.version = version;
        ls.set({
            "extensionUpdated": details
        });
    }
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

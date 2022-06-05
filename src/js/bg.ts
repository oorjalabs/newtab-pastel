const UPDATE_NOTIFICATION = false;
const EXTENSION_UPDATED_NOTIFICATION_ID = "extension_updated_notification_id";

chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({}));

// On install/update handler
chrome.runtime.onInstalled.addListener(onInstall);

/**
 * @param details
 */
async function onInstall(details: chrome.runtime.InstalledDetails) {
    if (details.reason === "chrome_update") {
        return;
    }

    const previousVersion = details.previousVersion ? Utils.getVersionNumberFromString(details.previousVersion) : 0;

    // Remove uninstall url, if not local/dev install
    chrome.runtime.setUninstallURL("");

    // Show install/update notification
    if (details.reason === "install" || (UPDATE_NOTIFICATION && previousVersion < 1.1)) {
        await ls.set({"extensionUpdated": details.reason});
    }

    // Load colours into storage if installing or updating to first v2 colours version
    const COLOURS_V2 = 1.05;
    if (previousVersion <= COLOURS_V2 && defaultPastels) {
        await ls.set({"allPastels": defaultPastels});
    }


    // Set up ACS notification alarm if not installed, and notification not shown before
    const st = await ls.get<boolean>({
        "acsNotificationShown": false,
    });

    if (st.acsNotificationShown) {
        return;
    }

    // Check if ACS is installed
    chrome.runtime.sendMessage(
        "einokpbfcmmopbfbpiofaeohhkmcbbcg",
        "checkAlive",
        async isInstalled => {
            if (!chrome.runtime.lastError && isInstalled) {
                await ls.set({"acsNotificationShown": true});
                return;
            }

            // 5-24 hours (+5 days if onInstall), between 8AM and 7 PM
            const ONE_DAY_IN_MS = 24 * 3600 * 1000;
            const startDay = Date.now() + (details.reason === "install" ? 5 : 5 / 24) * ONE_DAY_IN_MS;
            const when = Utils.randomDate(
                startDay, startDay + 1 * ONE_DAY_IN_MS,
                8, 19
            ).getTime();

            chrome.alarms.create("alarm_acs_cws_notif", {"when": when});
        }
    );
}


chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name !== "alarm_acs_cws_notif") {
        return console.log("Unidentified alarm: " + alarm.name);
    }

    // Show ACS notification acs is not installed
    return chrome.runtime.sendMessage("einokpbfcmmopbfbpiofaeohhkmcbbcg", "checkAlive", isInstalled => {
        if (!chrome.runtime.lastError && isInstalled) {
            ls.set({
                "acsNotificationShown": true,
            });
            return;
        }

        // Show notification, and mark as shown
        ls.set({
            "extensionUpdated": NOTIFICATIONS.ACS_CWS.ID,
            "acsNotificationShown": true,
        });
    });
});

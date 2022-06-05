const UPDATE_NOTIFICATION = true;
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

    const previousVersion = details.previousVersion ? getVersionNumberFromString(details.previousVersion) : 0;

    // Remove uninstall url, if not local/dev install
    chrome.runtime.setUninstallURL("");

    // Show install/update notification
    if (details.reason === "install" || (UPDATE_NOTIFICATION && previousVersion < 1.1)) {
        await ls.set({"extensionUpdated": details.reason});
    }

    // Load colours into storage if installing or updating to first v2 colours version
    const COLOURS_V2 = 1.05;
    if (previousVersion <= COLOURS_V2) {
        await ls.set({"allPastels": pastelsArray});
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
            const when = randomDate(
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


/**
 * Parses version number, after removing date, from version string
 * @param versionString Version string as returned by manifest. Expected to be
 * in the format `yyyy.mmdd.major.minor`. If not, the version string is
 * returned as it is.
 * @param asString Defaults `false`. If `true`, return `7` as `"7.0"`
 * @return `major.minor` part of version string returned as a number or string.
 */
function getVersionNumberFromString(versionString: string, asString = false): number|string {
    const versionParts = versionString.split(".");

    if (versionParts.length < 4) {
        // Unknown version format. Doesn't match our format of `yyyy.mmdd.major.minor`
        return versionString;
    }

    if (isNaN(Number(versionString[2])) || isNaN(Number(versionString[3]))) {
        // Unknown version format. Minor and Major need to be numbers.
        return versionString;
    }

    const major = versionParts[2];
    const minor = Number(versionParts[3]) < 10 ? `0${parseInt(versionParts[3])}` : versionParts[3];

    const version = Number(`${major}.${minor}`);

    if (asString) {
        if (Number.isInteger(version)) {
            return `${version}.0`;
        } else if (Number.isInteger(version * 10)) {
            return `${version}0`;
        } else {
            return String(version);
        }
    }

    return version;
}


/**
 * Get a random date between [start] and [end] dates within [startHour] and [endHour]s of day.
 * @param {number} start
 * @param {number} end
 * @param {number} startHour
 * @param {number} endHour
 * @return {Date}
 */
function randomDate(
    start: number,
    end: number,
    startHour: number,
    endHour: number
): Date {
    const date = new Date(+start + Math.random() * (end - start));
    const hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    if (date.getTime() <= Date.now()) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}

/**
 * @param hex;
 * @returns;
 */
function getSaturation(hex: string): number {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let s; const l = (max + min) / 2;

    if (max == min) {
        s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    }

    return Math.round(s * 100);
}

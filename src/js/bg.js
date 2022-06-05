const UPDATE_NOTIFICATION = true;
const EXTENSION_UPDATED_NOTIFICATION_ID = "extension_updated_notification_id";
chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({}));
// On install/update handler
chrome.runtime.onInstalled.addListener(onInstall);
/**
 * @param details
 */
async function onInstall(details) {
    if (details.reason === "chrome_update") {
        return;
    }
    const previousVersion = details.previousVersion ? getVersionNumberFromString(details.previousVersion) : 0;
    // Remove uninstall url, if not local/dev install
    chrome.runtime.setUninstallURL("");
    // Show install/update notification
    if (details.reason === "install" || (UPDATE_NOTIFICATION && previousVersion < 1.1)) {
        await ls.set({ "extensionUpdated": details.reason });
    }
    // Load colours into storage if installing or updating to first v2 colours version
    const COLOURS_V2 = 1.05;
    if (previousVersion <= COLOURS_V2) {
        await ls.set({ "allPastels": pastelsArray });
    }
    // Set up ACS notification alarm if not installed, and notification not shown before
    const st = await ls.get({
        "acsNotificationShown": false,
    });
    if (st.acsNotificationShown) {
        return;
    }
    // Check if ACS is installed
    chrome.runtime.sendMessage("einokpbfcmmopbfbpiofaeohhkmcbbcg", "checkAlive", async (isInstalled) => {
        if (!chrome.runtime.lastError && isInstalled) {
            await ls.set({ "acsNotificationShown": true });
            return;
        }
        // 5-24 hours (+5 days if onInstall), between 8AM and 7 PM
        const ONE_DAY_IN_MS = 24 * 3600 * 1000;
        const startDay = Date.now() + (details.reason === "install" ? 5 : 5 / 24) * ONE_DAY_IN_MS;
        const when = randomDate(startDay, startDay + 1 * ONE_DAY_IN_MS, 8, 19).getTime();
        chrome.alarms.create("alarm_acs_cws_notif", { "when": when });
    });
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
function getVersionNumberFromString(versionString, asString = false) {
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
        }
        else if (Number.isInteger(version * 10)) {
            return `${version}0`;
        }
        else {
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
function randomDate(start, end, startHour, endHour) {
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
function getSaturation(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let s;
    const l = (max + min) / 2;
    if (max == min) {
        s = 0; // achromatic
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    }
    return Math.round(s * 100);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQztBQUNqQyxNQUFNLGlDQUFpQyxHQUFHLG1DQUFtQyxDQUFDO0FBRTlFLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRXpFLDRCQUE0QjtBQUM1QixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbEQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUsU0FBUyxDQUFDLE9BQXdDO0lBQzdELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxlQUFlLEVBQUU7UUFDcEMsT0FBTztLQUNWO0lBRUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUcsaURBQWlEO0lBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRW5DLG1DQUFtQztJQUNuQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLENBQUMsbUJBQW1CLElBQUksZUFBZSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1FBQ2hGLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQ3REO0lBRUQsa0ZBQWtGO0lBQ2xGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQztJQUN4QixJQUFJLGVBQWUsSUFBSSxVQUFVLEVBQUU7UUFDL0IsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUMs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LEVBQUUsRUFBRTtRQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNwQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGFBQWEsQ0FBQyxHQUFXO0lBQzlCLE1BQU0sTUFBTSxHQUFHLDJDQUEyQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVyRSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDaEMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVoQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQztJQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxDQUFDO0lBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWpDLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRTtRQUNaLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxhQUFhO0tBQ3ZCO1NBQU07UUFDSCxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDdkQ7SUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUMifQ==
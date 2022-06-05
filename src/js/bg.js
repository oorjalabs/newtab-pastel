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
    const previousVersion = details.previousVersion ? Utils.getVersionNumberFromString(details.previousVersion) : 0;
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
        const when = Utils.randomDate(startDay, startDay + 1 * ONE_DAY_IN_MS, 8, 19).getTime();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQztBQUNqQyxNQUFNLGlDQUFpQyxHQUFHLG1DQUFtQyxDQUFDO0FBRTlFLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRXpFLDRCQUE0QjtBQUM1QixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbEQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUsU0FBUyxDQUFDLE9BQXdDO0lBQzdELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxlQUFlLEVBQUU7UUFDcEMsT0FBTztLQUNWO0lBRUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhILGlEQUFpRDtJQUNqRCxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVuQyxtQ0FBbUM7SUFDbkMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxDQUFDLG1CQUFtQixJQUFJLGVBQWUsR0FBRyxHQUFHLENBQUMsRUFBRTtRQUNoRixNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztLQUN0RDtJQUVELGtGQUFrRjtJQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDeEIsSUFBSSxlQUFlLElBQUksVUFBVSxFQUFFO1FBQy9CLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFDLFlBQVksRUFBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDO0tBQzlDO0lBR0Qsb0ZBQW9GO0lBQ3BGLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBVTtRQUM3QixzQkFBc0IsRUFBRSxLQUFLO0tBQ2hDLENBQUMsQ0FBQztJQUVILElBQUksRUFBRSxDQUFDLG9CQUFvQixFQUFFO1FBQ3pCLE9BQU87S0FDVjtJQUVELDRCQUE0QjtJQUM1QixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FDdEIsa0NBQWtDLEVBQ2xDLFlBQVksRUFDWixLQUFLLEVBQUMsV0FBVyxFQUFDLEVBQUU7UUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLFdBQVcsRUFBRTtZQUMxQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBQyxzQkFBc0IsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQzdDLE9BQU87U0FDVjtRQUVELDBEQUEwRDtRQUMxRCxNQUFNLGFBQWEsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztRQUN2QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDO1FBQzFGLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQ3pCLFFBQVEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxHQUFHLGFBQWEsRUFDdEMsQ0FBQyxFQUFFLEVBQUUsQ0FDUixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRVosTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNoRSxDQUFDLENBQ0osQ0FBQztBQUNOLENBQUM7QUFHRCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDdEMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLHFCQUFxQixFQUFFO1FBQ3RDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0Q7SUFFRCw2Q0FBNkM7SUFDN0MsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxrQ0FBa0MsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLEVBQUU7UUFDOUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLFdBQVcsRUFBRTtZQUMxQyxFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUNILHNCQUFzQixFQUFFLElBQUk7YUFDL0IsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsdUNBQXVDO1FBQ3ZDLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDSCxrQkFBa0IsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDNUMsc0JBQXNCLEVBQUUsSUFBSTtTQUMvQixDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=
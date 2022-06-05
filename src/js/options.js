$(() => {
    // Add feedback link with version number
    $("#feedback").attr("href", getFeedbackUrl());
    $(".action_links").on("click", e => {
        switch (e.currentTarget.id) {
            case "delete":
                chrome.management.uninstallSelf({
                    showConfirmDialog: true,
                }, () => {
                    const err = chrome.runtime.lastError;
                    if (err)
                        console.warn("Couldn't uninstall", err);
                });
                break;
            case "donate":
                $("#charity_picker").show();
                break;
        }
    });
});
/**
 * @returns;
 */
function getFeedbackUrl() {
    const osName = navigator.platform || "-";
    const osVersionString = `${getChromeVersion()}__${osName}`;
    return `${URLS.FEEDBACK}&entry.391219820=${osVersionString}`;
}
/**
 * Get Chrome version from userAgent
 * @return Version of Chrome being used, or "none found"
 */
function getChromeVersion() {
    const uaStr = window.navigator.userAgent;
    const uaStrs = uaStr.match(/(Chrome\/\S+)\s/i);
    return uaStrs[0] || "none found";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBQyxDQUFDLEdBQUcsRUFBRTtJQUNILHdDQUF3QztJQUN4QyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBRzlDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsS0FBSyxRQUFRO2dCQUNULE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO29CQUM1QixpQkFBaUIsRUFBRSxJQUFJO2lCQUMxQixFQUFFLEdBQUcsRUFBRTtvQkFDSixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztvQkFDckMsSUFBSSxHQUFHO3dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3JELENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU07WUFFVixLQUFLLFFBQVE7Z0JBQ1QsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzVCLE1BQU07U0FDYjtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7QUFHSDs7R0FFRztBQUNILFNBQVMsY0FBYztJQUNuQixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQztJQUN6QyxNQUFNLGVBQWUsR0FBRyxHQUFHLGdCQUFnQixFQUFFLEtBQUssTUFBTSxFQUFFLENBQUM7SUFFM0QsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLG9CQUFvQixlQUFlLEVBQUUsQ0FBQztBQUNqRSxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxnQkFBZ0I7SUFDckIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDekMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBRS9DLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQztBQUNyQyxDQUFDIn0=
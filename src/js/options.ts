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
                    if (err) console.warn("Couldn't uninstall", err);
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
function getFeedbackUrl(): string {
    const osName = navigator.platform || "-";
    const osVersionString = `${getChromeVersion()}__${osName}`;

    return `${URLS.FEEDBACK}&entry.391219820=${osVersionString}`;
}

/**
 * Get Chrome version from userAgent
 * @return Version of Chrome being used, or "none found"
 */
function getChromeVersion(): string {
    const uaStr = window.navigator.userAgent;
    const uaStrs = uaStr.match(/(Chrome\/\S+)\s/i);

    return uaStrs[0] || "none found";
}

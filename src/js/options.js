var detailsTimer;

$(document).ready(() => {
    
    // Add feedback link with version number
    $("#feedback").attr("href", getFeedbackUrl());
    
    
    $(".action_links").on("click", e => {
        
        switch (e.currentTarget.id) {
            
            case "delete":
                chrome.management.uninstallSelf({
                    showConfirmDialog: true
                }, _ => {
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


function getFeedbackUrl() {
    
    let feedback_url;
    
    const osName = navigator.platform || "-";
    const osVersionString = `${getChromeVersion()}__${osName}`;
    
    feedback_url = `${URLS.FEEDBACK}&entry.391219820=${osVersionString}`;
    
    return feedback_url;
}

/**
 * Get Chrome version from userAgent
 * @return {string} Version of Chrome being used, or "none found"
 */
function getChromeVersion() {
    const uaStr = window.navigator.userAgent;
    const uaStrs = uaStr.match(/(Chrome\/\S+)\s/i);

    return uaStrs[0] || "none found";
}




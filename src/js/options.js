var detailsTimer;

$(document).ready(() => {
    
    // Add feedback link with version number
    $("#feedback").attr("href", URLS.FEEDBACK);
    
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

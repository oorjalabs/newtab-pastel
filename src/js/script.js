var lightness = "95%";
var saturation = "100%";
var clockTimeout;
var hourFormat = TWENTY_FOUR_HOUR_FORMAT;

$(document).ready(() => {
    
    // If pinned colour, set that as background color
    setPinnedColour(localStorage.pinnedColour);
    
    ls.get({
        "twentyfourhourclock": DEFAULT_TWENTY_FOUR_HOUR_CLOCK,
        "showClock": DEFAULT_SHOW_CLOCK,
        "showTopSites": DEFAULT_SHOW_TOP_SITES,
        "topSitesPermission_firstAsk": false,
        "extensionUpdated": DEFAULT_EXTENSION_UPDATED
    }, st => {
        
        // Set clock format
        setClockFormat(st.twentyfourhourclock);
        
        // Show/hide clock
        showClock(st.showClock);
        
        // Show top sites
        if (!st.topSitesPermission_firstAsk)
            $("#top_sites_link").addClass("grab_attention");
        else
            showTopSites(st.showTopSites);
        
        showUpdatedModal(st.extensionUpdated);
    });
    
    
    // Open options page
    $("#settings_link").on("click", () => chrome.runtime.openOptionsPage());
    
    
    // Toggle site visibility in storage
    $("#top_sites_link").on("click", () => {
        
        ls.set({
            "topSitesPermission_firstAsk": true
        });
        $("#top_sites_link").removeClass("grab_attention");
        
        ls.get({
            showTopSites: DEFAULT_SHOW_TOP_SITES
        }, st => {
            
            let newShowTopSites = !st.showTopSites;
            
            // If changing from false to true, check if we have permission
            if (!st.showTopSites) {
                chrome.permissions.contains({
                    permissions: ["topSites"]
                }, result => {
                    
                    // The extension has the permissions.
                    // Save setting as true, action will happen in storage change handler
                    if (result)
                        ls.set({
                            showTopSites: newShowTopSites
                        });
                        
                        
                    else {
                        // The extension doesn't have the permissions.
                        // Request permission. 
                        chrome.permissions.request({
                            permissions: ["topSites"]
                        }, granted => {
                            
                            // If granted, set setting as true, 
                            if (granted)
                                ls.set({
                                    showTopSites: newShowTopSites
                                });
                                
                            // If not granted, do nothing (or show modal)
                            else {
                                console.warn("Permission not granted");
                            }
                            
                        });
                    }
                });
            }
            
            // Setting it off, so just save the new setting
            else
                ls.set({
                    showTopSites: newShowTopSites
                });
        });
    });
    
    
    // Toggle clock visibility in storage
    $("#clock_link").on("click", () =>
        ls.get({
                showClock: DEFAULT_SHOW_CLOCK
            }, st =>
            ls.set({
                showClock: !st.showClock
            })
        )
    );
            
            
    // Toggle clock type in storage
    $("#hr_link").on("click", () =>
        ls.get({
                twentyfourhourclock: DEFAULT_TWENTY_FOUR_HOUR_CLOCK
            }, st =>
            ls.set({
                twentyfourhourclock: !st.twentyfourhourclock
            })
        )
    );
            
            
    // Save pinned colour to storage.
    // Actual pinning happens in storage.onchanged handler
    $("#pin_colour_link").on("click", () =>
            
        ls.get({
            pinnedColour: DEFAULT_PINNED_COLOUR
        }, st => {
            
            if (!!st.pinnedColour) {
                
                ls.remove("pinnedColour");
                localStorage.removeItem("pinnedColour");
                
            } else {
                
                let bgcolor = $("body").css("background-color");
                ls.set({
                    pinnedColour: bgcolor
                });
                localStorage.pinnedColour = bgcolor;
                
            }
        })
    );
        
        
    $("#seeChangesButton").on("click", () => ls.set({
        extensionUpdated: false
    }));
    
    
    $("#closeButton").on("click", () => {
        ls.set({
            extensionUpdated: false
        })
        return false;
    });
    
    
    chrome.storage.onChanged.addListener((changes, area) => {
        
        if (changes.twentyfourhourclock)
            setClockFormat(changes.twentyfourhourclock.newValue);
        
        if (changes.showClock)
            showClock(changes.showClock.newValue);
        
        if (changes.showTopSites)
            showTopSites(changes.showTopSites.newValue);
        
        if (changes.pinnedColour)
            setPinnedColour(localStorage.pinnedColour);
        
        if (changes.extensionUpdated)
            showUpdatedModal(changes.extensionUpdated.newValue);
    });
});


function showClock(show) {
    
    if (clockTimeout)
        clearTimeout(clockTimeout);
    
    if (show) {
        $("#clock, #hr_link").show();
        clock();
    } else
        $("#clock, #hr_link").hide();
}


function setClockFormat(isTwentyFourHour) {
    
    if (isTwentyFourHour) {
        hourFormat = TWENTY_FOUR_HOUR_FORMAT;
        $("#ic_clock_type").addClass("twelve");
    } else {
        hourFormat = TWELVE_HOUR_FORMAT;
        $("#ic_clock_type").removeClass("twelve");
    }
    
    if (clockTimeout)
        clearTimeout(clockTimeout);
    
    clock();
}


function showTopSites(show) {
    
    if (show) {
        
        ls.get({
            "topSites": DEFAULT_TOP_SITES
        }, st => {
            
            $("#topSites").text("");
            
            st.topSites
                .forEach(site =>
                    $("#topSites").append(`<a href="${site.url}" class="top_site_link">${site.title}</a>`)
                );
                    
            $("#topSites").fadeIn("fast");
            $("#top_sites_link").addClass("showing");
                    
            // Fetch top sites from API, and update in storage
            chrome.topSites.get(topSites => {
                
                let err = chrome.runtime.lastError;
                if (err) {
                    console.warn("Error: ", err);
                    return;
                }
                
                topSites = topSites
                    .filter(site => !/^chrome(\-extension)?\:\/\//.test(site.url))
                    .slice(0, Math.min(topSites.length, TOP_SITE_COUNT));
                
                ls.set({
                    "topSites": topSites
                });
                
                // Update sites on screen
                if (!arraysEqual(st.topSites, topSites)) {
                    $("#topSites").text("");
                    
                    topSites
                        .forEach(site =>
                            $("#topSites").append(`<a href="${site.url}" class="top_site_link">${site.title}</a>`)
                        );
                }
                
            });
            
        });
        
    } else {
        
        $("#topSites").text("").fadeOut("fast");
        $("#top_sites_link").removeClass("showing");
        
    }
}


function setPinnedColour(colour) {
    if (!!colour) {
        $("body").css("background-color", colour); //set color
        $("#pin_colour_link").addClass("pinned");
    } else {
        changeColor();
        $("#pin_colour_link").removeClass("pinned");
    }
}


function showUpdatedModal(details) {
    
    if (details) {
        
        if (details.reason && details.reason === "update") {
            $("#installed").text("Extension updated");
            $("#seeChangesButton").text("See what's new");
        } else {
            $("#installed").text("Welcome to pastel new tab");
            $("#seeChangesButton").text("Recent update notes");
        }
        
        $("#version").text(`v. ${details.version}`);
        $("#closeButton").text(`Dismiss`);
        $("#updatedModal").show();
    } else {
        $("#updatedModal").hide();
    }
}


function clock() {
    $("#clock").html(moment().format(hourFormat));
    clockTimeout = setTimeout(function () {
        clock();
    }, 500);
}


function changeColor() {
    let col = parseInt((Date.now() % 1000) * 360 / 1000)
    // let col = parseInt(Math.random() * 360); //randomize color
    
    let colorString = "hsl(" + col + ", " + saturation + ", " + lightness + ")";
    $("body").css("background-color", colorString); //set color
    
    let hex = "#" + tinycolor(colorString).toHex(); //translate to hex
    console.log("changeColor", hex, colorString);
}


function removeTopSitesPermission(callback) {
    chrome.permissions.remove({
        permissions: ["topSites"]
    }, callback);
}


function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

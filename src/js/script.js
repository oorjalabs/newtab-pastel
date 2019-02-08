var lightness = "95%";
var saturation = "100%";
var clockTimeout;
var hourFormat = TWENTY_FOUR_HOUR_FORMAT;

$(document).ready(() => {
    
    // If pinned colour, set that as background color
    setPinnedColour(localStorage.pinnedColour);
    
    ls.get({
        "twentyfourhourclock": DEFAULTS.TWENTY_FOUR_HOUR_CLOCK,
        "showClock": DEFAULTS.SHOW_CLOCK,
        "showTopSites": DEFAULTS.SHOW_TOP_SITES,
        "fontStyle": DEFAULTS.FONT_STYLE,
        "topSitesPermission_firstAsk": false,
        "extensionUpdated": DEFAULTS.EXTENSION_UPDATED
    }, st => {
        
        setFont(st.fontStyle);
        
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
            "showTopSites": DEFAULTS.SHOW_TOP_SITES
        }, st => {
            
            const newShowTopSites = !st.showTopSites;
            
            // Setting it off, so just save the new setting
            if (st.showTopSites) {
                return ls.set({ showTopSites: newShowTopSites });
            }
            
            // Changing from false to true, check if we have permission
            chrome.permissions.contains({
                "permissions": ["topSites"]
            }, result => {
                
                // The extension has the permissions.
                // Save setting as true, action will happen in storage change handler
                if (result)
                    return ls.set({"showTopSites": newShowTopSites});
                    
                // The extension doesn't have the permissions.
                // Request permission. 
                chrome.permissions.request({
                    "permissions": ["topSites"]
                }, granted => {
                    
                    // If granted, set setting as true, 
                    if (granted)
                        return ls.set({"showTopSites": newShowTopSites});
                        
                    // If not granted, do nothing (or show modal)
                    console.warn("Permission not granted");
                    
                });
            });
            
        });
    });
    
    
    // Toggle clock visibility in storage
    $("#clock_link").on("click", () =>
        ls.get({
            "showClock": DEFAULTS.SHOW_CLOCK
        }, st =>
            ls.set({ "showClock": !st.showClock })
        )
    );
    
    
    // Toggle clock type in storage
    $("#hr_link").on("click", () =>
        ls.get({
            "twentyfourhourclock": DEFAULTS.TWENTY_FOUR_HOUR_CLOCK
        }, st =>
            ls.set({ "twentyfourhourclock": !st.twentyfourhourclock })
        )
    );
    
    
    // Toggle clock type in storage
    $("#font_link").on("click", () =>
        ls.get({
            "fontStyle": DEFAULTS.FONT_STYLE
        }, st =>
            ls.set({ "fontStyle": st.fontStyle === FONT_STYLES.SANS ? FONT_STYLES.SERIF : FONT_STYLES.SANS})
        )
    );
    
    
    // Save pinned colour to storage.
    // Actual pinning happens in storage.onchanged handler
    $("#pin_colour_link").on("click", () =>
        
        ls.get({
            pinnedColour: DEFAULTS.PINNED_COLOUR
        }, st => {
            
            if (!!st.pinnedColour) {
                ls.remove("pinnedColour");
                localStorage.removeItem("pinnedColour");
                return;
            }
            
            const bgcolor = $("body").css("background-color");
            ls.set({
                pinnedColour: bgcolor
            });
            localStorage.pinnedColour = bgcolor;
            
        })
    );
        
        
    $("#seeChangesButton").on("click", () => ls.set({ extensionUpdated: false }));
    
    
    $("#closeButton").on("click", () => {
        ls.set({ extensionUpdated: false })
        return false;
    });
    
    
    
    
    chrome.storage.onChanged.addListener(changes => {
        
        if (changes.twentyfourhourclock)
            setClockFormat(changes.twentyfourhourclock.newValue);
        
        if (changes.showClock)
            showClock(changes.showClock.newValue);
        
        if (changes.showTopSites)
            showTopSites(changes.showTopSites.newValue);
        
        if (changes.pinnedColour)
            setPinnedColour(localStorage.pinnedColour);
        
        if (changes.fontStyle)
            setFont(changes.fontStyle.newValue);
        
        if (changes.extensionUpdated)
            showUpdatedModal(changes.extensionUpdated.newValue);
    });
});


/**
 * @param {string} fontStyle Of type `FONT_STYLES`
 */
function setFont(fontStyle) {
    const body = document.getElementsByTagName("body")[0];
    body.classList.remove(FONT_STYLES.SANS, FONT_STYLES.SERIF);
    body.classList.add(fontStyle);
}


/**
 * @param {boolean} show 
 */
function showClock(show) {
    
    if (clockTimeout)
        clearTimeout(clockTimeout);
    
    if (show) {
        $("#clock, #hr_link").show();
        clock();
        return;
    }
    
    $("#clock, #hr_link").hide();
}


/**
 * @param {boolean} isTwentyFourHour 
 */
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


/**
 * @param {boolean} show 
 */
function showTopSites(show) {
    
    if (!show) {
        $("#topSites").text("").fadeOut("fast");
        $("#top_sites_link").removeClass("showing");
        return;
    }
    
    ls.get({
        "topSites": DEFAULTS.TOP_SITES
    }, st => {
        
        $("#topSites").text("");
        
        const topSitesString = st.topSites.reduce((acc, site) => `${acc}<a href="${site.url}" class="top_site_link">${site.title}</a>`, "");
        $("#topSites").append(topSitesString).fadeIn("fast");
        
        $("#top_sites_link").addClass("showing");
        
        // Fetch top sites from API, and update in storage
        chrome.topSites.get(topSites => {
            
            const err = chrome.runtime.lastError;
            if (err) {
                console.warn("Error: ", err);
                return;
            }
            
            topSites = topSites
                .filter(site => !/^chrome(\-extension)?\:\/\//.test(site.url))
                .slice(0, Math.min(topSites.length, TOP_SITE_COUNT));
            
            if (arraysEqual(st.topSites, topSites)) {
                return;
            }
            
            // Update sites
            ls.set({ "topSites": topSites });
            
            const topSitesString = st.topSites.reduce((acc, site) => `${acc}<a href="${site.url}" class="top_site_link">${site.title}</a>`, "");
            $("#topSites").text("").append(topSitesString);
            
        });
        
    });
}


/**
 * @param {string} colour 
 */
function setPinnedColour(colour) {
    if (!!colour) {
        $("body").css("background-color", colour); //set color
        $("#pin_colour_link").addClass("pinned");
        return;
    }
    changeColor();
    $("#pin_colour_link").removeClass("pinned");
}


/**
 * 
 * @param {{reason?: string, version?: string}} [details]
 */
function showUpdatedModal(details) {
    
    if (!details) {
        return $("#updatedModal").hide();
    }
        
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
}


function clock() {
    $("#clock").text(moment().format(hourFormat));
    clockTimeout = setTimeout(clock, 500);
}


function changeColor() {
    const col = parseInt((Date.now() % 1000) * 360 / 1000)
    // let col = parseInt(Math.random() * 360); //randomize color
    
    const colorString = `hsl(${col}, ${saturation}, ${lightness})`;
    $("body").css("background-color", colorString); //set color
    
    const hex = "#" + tinycolor(colorString).toHex(); //translate to hex
    console.log("changeColor", hex, colorString);
}


/**
 * @param {function} callback 
 */
function removeTopSitesPermission(callback) {
    chrome.permissions.remove({
        permissions: ["topSites"]
    }, callback);
}


/**
 * @param {[*]} arr1 
 * @param {[*]} arr2 
 */
function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

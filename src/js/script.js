var clockTimeout;
var hourFormat = TWENTY_FOUR_HOUR_FORMAT;

const pastels = (localStorage.allPastels || "").split(",");
const lightness = "95%";
const saturation = "100%";
let currentColour;

const customColourSet = {
    current: undefined,
    new: undefined
}

const settings = {
    "darkColour": false,
    "fontStyle": DEFAULTS.FONT_STYLE,
    "pinnedColour": DEFAULTS.PINNED_COLOUR,
    "showClock": DEFAULTS.SHOW_CLOCK,
    "showTopSites": DEFAULTS.SHOW_TOP_SITES,
    "twentyfourhourclock": DEFAULTS.TWENTY_FOUR_HOUR_CLOCK,
}

$(document).ready(() => {
    
    // If pinned colour, set that as background color
    setPinnedColour(localStorage.darkColour == "true" ? DARK_COLOUR : localStorage.pinnedColour);
    
    // After initial colour has been displayed, do further colour changes with transition
    setTimeout(() => $("body").css({ "transition-duration": "1s" }), 2000);
    
    ls.get({
        "darkColour": false,
        "extensionUpdated": DEFAULTS.EXTENSION_UPDATED,
        "fontStyle": DEFAULTS.FONT_STYLE,
        "pinnedColour": DEFAULTS.PINNED_COLOUR,
        "showClock": DEFAULTS.SHOW_CLOCK,
        "showTopSites": DEFAULTS.SHOW_TOP_SITES,
        "topSitesPermission_firstAsk": false,
        "twentyfourhourclock": DEFAULTS.TWENTY_FOUR_HOUR_CLOCK,
    }, st => {
        
        settings.darkColour = st.darkColour;
        settings.fontStyle = st.fontStyle;
        settings.pinnedColour = st.pinnedColour;
        settings.showClock = st.showClock;
        settings.showTopSites = st.showTopSites;
        settings.twentyfourhourclock = st.twentyfourhourclock;
        
        setFont(settings.fontStyle);
        
        // Set clock format
        setClockFormat(settings.twentyfourhourclock);
        
        // Show/hide clock
        showClock(settings.showClock);
        
        // Show top sites
        if (!st.topSitesPermission_firstAsk)
            $("#top_sites_link").addClass("grab_attention");
        else
            showTopSites(settings.showTopSites);
        
        st.extensionUpdated && showUpdatedModal(st.extensionUpdated);
    });
    
    
    // Show tab options on hovering over bottom half of the screen
    $("#hoverHalf").hover(
        _ => $("#bottomHalf").addClass("entered"), 
        _ => $("#bottomHalf").removeClass("entered")
    );
    
    
    // Open options page
    $("#settings_link").on("click", () => chrome.runtime.openOptionsPage());
    
    
    // Toggle site visibility in storage
    $("#top_sites_link").on("click", () => {
        
        ls.set({ "topSitesPermission_firstAsk": true });
        
        $("#top_sites_link").removeClass("grab_attention");
        
        // Setting it off, so just save the new setting
        if (settings.showTopSites) {
            return ls.set({ showTopSites: !settings.showTopSites });
        }
        
        // Changing from false to true, check if we have permission
        chrome.permissions.contains({
            "permissions": ["topSites"]
        }, result => {
            
            // The extension has the permissions.
            // Save setting as true, action will happen in storage change handler
            if (result)
                return ls.set({"showTopSites": !settings.showTopSites});
                
            // The extension doesn't have the permissions.
            // Request permission. 
            chrome.permissions.request({
                "permissions": ["topSites"]
            }, granted => {
                
                // If granted, set setting as true, 
                if (granted)
                    return ls.set({"showTopSites": !settings.showTopSites});
                    
                // If not granted, do nothing (or show modal)
                console.warn("Permission not granted");
                
            });
        });
        
    });
    
    
    // Toggle clock visibility in storage
    $("#clock_link").on("click", () => {
        ls.set({ "showClock": !settings.showClock })
    });
    
    
    // Toggle clock type in storage
    $("#hr_link").on("click", () => {
        ls.set({ "twentyfourhourclock": !settings.twentyfourhourclock })
    });
    
    
    // Toggle clock type in storage
    $("#font_link").on("click", () => {
        ls.set({ "fontStyle": settings.fontStyle === FONT_STYLES.SANS ? FONT_STYLES.SERIF : FONT_STYLES.SANS})
    });
    
    
    // Toggle dark colour in storage
    $("#go_dark").on("click", () => {
        localStorage.darkColour = !settings.darkColour;
        ls.set({ "darkColour": !settings.darkColour });
    });
    
    
    /**
     * Toggle pinned colour.
     * If there's a pinned colour, un-pin it.
     * If there's no pinned colour, save the current colour as pinned. Actual pinning happens in storage.onchanged handler
     */
    $("#pin_colour_link").on("click", () => {
        
        // Remove pinned colour
        if (!!settings.pinnedColour) {
            localStorage.removeItem("pinnedColour");
            ls.remove("pinnedColour");
            return;
        }
        
        // Set pinned colour
        savePinnedColour(currentColour);
    });
    
    
    // Show custom colour modal
    $("#set_custom_colour").on("click", showCustomColourModal);
    
    
    // Show selected colour in background when selecting new colour
    $("#custom_colour_input").on("change", e => {
        customColourSet.new = e.currentTarget.value.toLowerCase();
        setColour(customColourSet.new)
    });
    
    
    // Apply and save custom colour
    $("#save_custom_colour").on("click", () => {
        showCustomColourModal(false);
        
        /**
         * 1. If colour is same as current colour, and is pinned, do nothing
         * 2. If colour is same as current colour, but not pinned, pin it
         * 3. If colour is not the current colour, 
         * - but is already in pastel colours, pin it
         * - is not in pastel colours, add it to pastels, and pin it
         */
        
        if (customColourSet.current == customColourSet.new) {
            // Colour not changed, and already pinned - nothing to do
            if (customColourSet.current == settings.pinnedColour) 
                return;
            
            // Colour not changed, but not pinned - pin it
            savePinnedColour(customColourSet.current);
            return;
        }
        
        // Colour changed - add it to pastels, and pin it
        customColourSet.current = customColourSet.new;
        addToPastels(customColourSet.new);
        savePinnedColour(customColourSet.new);
    });
    
    
    // Hide modal if outer modal is touched, reset colour to previous
    $(".modalOuter").on("click", e => {
        if (e.target != e.currentTarget) {
            return true;
        }
        
        setColour(customColourSet.current)
        return showCustomColourModal(false);
    })
    
    
    $("#notification_action").on("click", () => ls.set({ extensionUpdated: false }));
    
    
    $("#notification_close").on("click", () => {
        ls.set({ extensionUpdated: false })
        return false;
    });
    
    
    chrome.storage.onChanged.addListener(changes => {
        
        if (changes.twentyfourhourclock) {
            settings.twentyfourhourclock = changes.twentyfourhourclock.newValue;
            setClockFormat(changes.twentyfourhourclock.newValue);
        }
        
        if (changes.showClock){
            settings.showClock = changes.showClock.newValue;
            showClock(changes.showClock.newValue);
        }
        
        if (changes.showTopSites){
            settings.showTopSites = changes.showTopSites.newValue;
            showTopSites(changes.showTopSites.newValue, toggle = true);
        }
        
        if (changes.pinnedColour){
            settings.pinnedColour = changes.pinnedColour.newValue;
            setPinnedColour(settings.darkColour ? DARK_COLOUR : settings.pinnedColour);
        }
        
        if (changes.fontStyle){
            settings.fontStyle = changes.fontStyle.newValue;
            setFont(changes.fontStyle.newValue);
        }
        
        if (changes.extensionUpdated){
            settings.extensionUpdated = changes.extensionUpdated.newValue;
            showUpdatedModal(changes.extensionUpdated.newValue);
        }
        
        if (changes.darkColour) {
            settings.darkColour = changes.darkColour.newValue;
            setPinnedColour(settings.darkColour ? DARK_COLOUR : settings.pinnedColour)
        }
    });
});


/**
 * Show or hide custom colour modal
 * @param {Boolean} [show] Optional parameter to hide modal
 */
function showCustomColourModal(show = true) {
    
    if (!show) {
        $("#customColourModal").fadeOut("fast", () => $("#customColourModal").addClass("hide"));
        return;
    }
    
    $("#customColourModal").fadeIn("fast").removeClass("hide");
    $("#custom_colour_input").val(currentColour);
    $("#custom_colour_input").focus()
    
    // Reset custom set to current colour
    customColourSet.current = currentColour;
    customColourSet.new = currentColour;
    
}


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
 * @param {boolean} [toggle=false] 
 */
function showTopSites(show, toggle = false) {
    
    const topSitesDiv = $("#topSites");
    
    if (!show) {
        if (!toggle) {
            topSitesDiv.hide().text("");
        } else {
            topSitesDiv.slideToggle(_ => topSitesDiv.text(""))
        }
        $("#top_sites_link").removeClass("showing");
        return;
    }
    
    ls.get({
        "topSites": DEFAULTS.TOP_SITES
    }, st => {
        
        const topSitesString = st.topSites.reduce((acc, site) => `${acc}<a href="${site.url}" class="top_site_link">${site.title}</a>`, "");
        
        topSitesDiv.text("").append(topSitesString);//[toggle ? "slideToggle" : "hide"]();
        toggle ? topSitesDiv.slideToggle() : topSitesDiv.show();
        
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
            topSitesDiv.text("").append(topSitesString);
            
        });
        
    });
}


/**
 * @param {string} colour 
 */
function setPinnedColour(colour) {
    if (!!colour) {
        setColour(colour); //set color
        $("#pin_colour_link").addClass("pinned");
        return;
    }
    
    changeColour();
    $("#pin_colour_link").removeClass("pinned");
}


/**
 * @param {string|boolean} [reason]
 */
function showUpdatedModal(reason) {
    
    if (!reason) {
        return $("#notificationModal").hide().addClass("hide");
    }
    
    switch (reason) {
        
        // Updated
        case NOTIFICATIONS.UPDATED.ID: {
            $("#notificationTitle").text(NOTIFICATIONS.UPDATED.TITLE);
            $("#notification_action").text(NOTIFICATIONS.UPDATED.ACTION_TITLE).attr("href", NOTIFICATIONS.UPDATED.ACTION_URL);
            $("#context_message").text(NOTIFICATIONS.UPDATED.CONTEXT_MESSAGE);
            break;
        }
        
        // Promote ACS
        case NOTIFICATIONS.ACS_CWS.ID: {
            $("#notificationTitle").text(NOTIFICATIONS.ACS_CWS.TITLE);
            $("#notification_action").text(NOTIFICATIONS.ACS_CWS.ACTION_TITLE).attr("href", NOTIFICATIONS.ACS_CWS.ACTION_URL);
            $("#context_message").text(NOTIFICATIONS.ACS_CWS.CONTEXT_MESSAGE);
            break;
        }
        
        // Install
        default: {
            $("#notificationTitle").text(NOTIFICATIONS.INSTALLED.TITLE);
            $("#notification_action").text(NOTIFICATIONS.INSTALLED.ACTION_TITLE).attr("href", NOTIFICATIONS.INSTALLED.ACTION_URL);
            $("#context_message").text(NOTIFICATIONS.INSTALLED.CONTEXT_MESSAGE);
        }
    }
        
    $("#notificationModal").show().removeClass("hide");
}


function clock() {
    $("#clock").text(moment().format(hourFormat));
    clockTimeout = setTimeout(clock, 500);
}


function changeColour() {
    const pastelCount = pastels.length;
    const colourIndex = Math.round(Math.random() * pastelCount);
    const col = parseInt((Date.now() % 1000) * 360 / 1000);
    const colourString = pastelCount > 0 ? pastels[colourIndex] : `hsl(${col}, ${saturation}, ${lightness})`;
    
    setColour(colourString); //set color
}


/**
 * @param {string} colour Of type `'#ffffff'`
 */
function setColour(colour) {
    currentColour = colour;
    $("body").css("background-color", colour).attr("data-colour", colour); //set color
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


/**
 * Adds a colour to saved list of pastel colours
 * @param {string} colourString Colour string to add to pastels list
 */
function addToPastels(colourString = "") {
    if (!colourString) return;
    
    const pastels = (localStorage.allPastels || "").split(",");
    
    if (pastels.includes(colourString)) return;
    
    pastels.push(colourString);
    localStorage.allPastels = pastels.join(",");
}


/**
 * Save a colour as pinned, or remove pinning
 * @param {String?} colourString Colour to set as pinned colour. If empty, remove current pinned colour
 */
function savePinnedColour(colourString = "") {
    if (!colourString) return;
    
    localStorage.pinnedColour = colourString;
    ls.set({ "pinnedColour": colourString }); 
}

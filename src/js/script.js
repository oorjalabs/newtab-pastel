// f9fbe4
(function () {
    let clockTimeout;
    let hourFormat = TWENTY_FOUR_HOUR_FORMAT;
    const DARK_MODE_CLASS_NAME = "dark_mode";
    const AUTO_DARK_MODE_CLASS_NAME = "auto_dark_mode";
    const lightness = "95%";
    const saturation = "100%";
    let currentColour;
    let customColourModalShowing = false;
    const customColourSet = {
        "current": undefined,
        "new": undefined,
    };
    setColourForTheme(localStorage.useSystemTheme == "true", localStorage.pinnedColour, localStorage.darkColour == "true");
    // After initial colour has been displayed, do further colour changes with transition
    setTimeout(() => $("body").css({ "transition-duration": "1s" }), 2000);
    $(async () => {
        $("#customColourModalInner").hide();
        const st = await ls.get({
            "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            "darkColour": DEFAULTS.DARK_COLOUR,
            "extensionUpdated": DEFAULTS.EXTENSION_UPDATED,
            "fontStyle": DEFAULTS.FONT_STYLE,
            "pinnedColour": DEFAULTS.PINNED_COLOUR,
            "showClock": DEFAULTS.SHOW_CLOCK,
            "showTopSites": DEFAULTS.SHOW_TOP_SITES,
            "topSitesPermission_firstAsk": false,
            "twentyfourhourclock": DEFAULTS.TWENTY_FOUR_HOUR_CLOCK,
        });
        setColourForTheme(st.useSystemTheme, st.pinnedColour, st.darkColour, false);
        setFont(st.fontStyle);
        // Set clock format
        setClockFormat(st.twentyfourhourclock);
        // Show/hide clock
        showClock(st.showClock);
        // Show top sites
        if (!st.topSitesPermission_firstAsk) {
            $("#top_sites_link").addClass("grab_attention");
        }
        else {
            showTopSites(st.showTopSites);
        }
        st.extensionUpdated && showUpdatedModal(st.extensionUpdated);
        // Show tab options on hovering over bottom half of the screen
        $("#hoverHalf").hover(() => $("#bottomHalf").addClass("entered"), () => $("#bottomHalf").removeClass("entered"));
        // Open options page
        $("#settings_link").on("click", () => chrome.runtime.openOptionsPage());
        // Toggle site visibility in storage
        $("#top_sites_link").on("click", async () => {
            ls.set({ "topSitesPermission_firstAsk": true });
            $("#top_sites_link").removeClass("grab_attention");
            const st = await ls.get({ "showTopSites": DEFAULTS.SHOW_TOP_SITES });
            // Setting it off, so just save the new setting
            if (st.showTopSites) {
                return ls.set({ "showTopSites": !st.showTopSites });
            }
            // Changing from false to true, check if we have permission
            const result = await new Promise(resolve => {
                chrome.permissions.contains({
                    "permissions": ["topSites"],
                }, resolve);
            });
            // The extension has the permissions.
            // Save setting as true, action will happen in storage change handler
            if (result) {
                ls.set({ "showTopSites": true });
                return;
            }
            // The extension doesn't have the permissions.
            // Request permission.
            const granted = await new Promise(resolve => {
                chrome.permissions.request({
                    "permissions": ["topSites"],
                }, resolve);
            });
            // If granted, set setting as true,
            if (granted) {
                ls.set({ "showTopSites": true });
                return;
            }
            // If not granted, do nothing (or show modal)
            console.warn("Permission not granted");
        });
        // Toggle clock visibility in storage
        $("#clock_link").on("click", async () => {
            const st = await ls.get({ "showClock": DEFAULTS.SHOW_CLOCK });
            ls.set({ "showClock": !st.showClock });
        });
        // Toggle clock type in storage
        $("#hr_link").on("click", async () => {
            const st = await ls.get({ "twentyfourhourclock": DEFAULTS.TWENTY_FOUR_HOUR_CLOCK });
            ls.set({ "twentyfourhourclock": !st.twentyfourhourclock });
        });
        // Toggle clock type in storage
        $("#font_link").on("click", async () => {
            const st = await ls.get({ "fontStyle": DEFAULTS.FONT_STYLE });
            ls.set({ "fontStyle": st.fontStyle === FONT_STYLES.SANS ? FONT_STYLES.SERIF : FONT_STYLES.SANS });
        });
        // Toggle dark colour in storage
        $("#go_dark").on("click", async (e) => {
            if (e.currentTarget.classList.contains("disabled"))
                return;
            const st = await ls.get({ "darkColour": DEFAULTS.DARK_COLOUR });
            ls.set({ "darkColour": !st.darkColour });
            localStorage.darkColour = !st.darkColour;
        });
        // Toggle useSystemTheme in storage
        $("#auto_dark").on("click", async () => {
            const st = await ls.get({ "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME });
            const useSystemTheme = !st.useSystemTheme;
            ls.set({ "useSystemTheme": useSystemTheme });
            localStorage.useSystemTheme = useSystemTheme;
        });
        $("#default_ntp_link").on("click", () => {
            chrome.tabs.update({ url: "chrome-search://local-ntp/local-ntp.html" });
        });
        /**
         * Toggle pinned colour.
         * If there's a pinned colour, un-pin it.
         * If there's no pinned colour, save the current colour as pinned.
         * Actual pinning happens in storage.onchanged handler
         */
        $("#pin_colour_link").on("click", async (e) => {
            if (e.currentTarget.classList.contains("disabled"))
                return;
            const st = await ls.get({ "pinnedColour": DEFAULTS.PINNED_COLOUR });
            // Remove pinned colour
            if (st.pinnedColour) {
                localStorage.removeItem("pinnedColour");
                ls.remove("pinnedColour");
                return;
            }
            // Set pinned colour
            savePinnedColour(currentColour);
        });
        // Show custom colour modal
        $("#set_custom_colour").on("click", e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            showCustomColourModal();
        });
        // Show selected colour in background when selecting new colour
        $("#custom_colour_input").on("change", e => {
            customColourSet.new = e.currentTarget.value.toLowerCase();
            setColour(customColourSet.new);
        });
        // Apply and save custom colour
        $("#save_custom_colour").on("click", async () => {
            showCustomColourModal(false);
            /**
             * 1. If colour is same as current colour, and is pinned, do nothing
             * 2. If colour is same as current colour, but not pinned, pin it
             * 3. If colour is not the current colour,
             * - but is already in pastel colours, pin it
             * - is not in pastel colours, add it to pastels, and pin it
             */
            // Chose dark colour, do nothing
            if (customColourSet.new == DARK_COLOUR)
                return;
            // Colour not changed
            if (customColourSet.current == customColourSet.new) {
                const st = await ls.get({ "pinnedColour": DEFAULTS.PINNED_COLOUR });
                // Colour not changed, and already pinned - nothing to do
                if (customColourSet.current == st.pinnedColour) {
                    return;
                }
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
        $(":not(#customColourModalInner)").on("click", e => {
            if (!customColourModalShowing)
                return;
            if ($(e.target).parents("#customColourModal").length > 0)
                return;
            setColour(customColourSet.current);
            showCustomColourModal(false);
            return;
        });
        $("#notification_action").on("click", () => ls.set({ extensionUpdated: false }));
        $("#notification_close").on("click", () => {
            ls.set({ extensionUpdated: false });
            return false;
        });
        // If system theme is enabled, set mode according to system preferences
        if (window.matchMedia) {
            window.matchMedia("(prefers-color-scheme: dark)").onchange = onSystemThemeChanged;
        }
    });
    chrome.storage.onChanged.addListener(async (changes) => {
        if (changes.twentyfourhourclock) {
            setClockFormat(changes.twentyfourhourclock.newValue);
        }
        if (changes.showClock) {
            showClock(changes.showClock.newValue);
        }
        if (changes.showTopSites) {
            showTopSites(changes.showTopSites.newValue, true);
        }
        if (changes.pinnedColour || changes.darkColour || changes.useSystemTheme) {
            const st = await ls.get({
                "pinnedColour": DEFAULTS.PINNED_COLOUR,
                "darkColour": DEFAULTS.DARK_COLOUR,
                "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            });
            setColourForTheme(st.useSystemTheme, st.pinnedColour, st.darkColour);
        }
        if (changes.fontStyle) {
            setFont(changes.fontStyle.newValue ? changes.fontStyle.newValue : DEFAULTS.FONT_STYLE);
        }
        if (changes.extensionUpdated) {
            showUpdatedModal(changes.extensionUpdated.newValue);
        }
    });
    /**
     * @param e
     */
    async function onSystemThemeChanged(e) {
        const st = await ls.get({
            "darkColour": DEFAULTS.DARK_COLOUR,
            "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            "pinnedColour": DEFAULTS.PINNED_COLOUR,
        });
        setColourForTheme(st.useSystemTheme, st.pinnedColour, st.darkColour);
    }
    /**
     * @param {boolean} useSystemTheme
     * @param {string} pinnedColour
     * @param {boolean} darkPinned
     * @param forceChange default `true`
     */
    function setColourForTheme(useSystemTheme, pinnedColour, darkPinned, forceChange = true) {
        const isSystemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        // Toggle auto dark button and enable/disable go dark button based on useSystemTheme
        if (useSystemTheme) {
            document.body && document.body.classList.add(AUTO_DARK_MODE_CLASS_NAME);
            $("#go_dark").addClass("disabled");
        }
        else {
            document.body && document.body.classList.remove(AUTO_DARK_MODE_CLASS_NAME);
            $("#go_dark").removeClass("disabled");
        }
        // Toggle go dark button if dark pinned and not using system theme
        if (!useSystemTheme && darkPinned) {
            document.body && document.body.classList.add(DARK_MODE_CLASS_NAME);
        }
        else {
            document.body && document.body.classList.remove(DARK_MODE_CLASS_NAME);
        }
        if ((useSystemTheme && isSystemDark) ||
            (!useSystemTheme && darkPinned)) {
            document.body && document.body.classList.add(DARK_THEME);
            // If dark enabled, or auto enabled and system theme is dark
            $("#pin_colour_link").removeClass("switched_on").addClass("disabled");
            setPinnedColour(DARK_COLOUR);
        }
        else {
            document.body && document.body.classList.remove(DARK_THEME);
            // If pinned colour, set that as background color
            $("#pin_colour_link")[pinnedColour ? "addClass" : "removeClass"]("switched_on").removeClass("disabled");
            // Don't redo random colour
            if (!forceChange && !pinnedColour)
                return;
            setPinnedColour(pinnedColour);
        }
    }
    /**
     * Show or hide custom colour modal
     * @param show Optional parameter to hide modal, default `true`
     */
    async function showCustomColourModal(show = true) {
        if (!show) {
            $("#customColourModalInner").fadeOut("fast", () => $("#customColourModalInner").addClass("hide"));
            customColourModalShowing = false;
            return;
        }
        const st = await ls.get({
            "darkColour": DEFAULTS.DARK_COLOUR,
            "pinnedColour": DEFAULTS.PINNED_COLOUR,
        });
        const initialColour = st.pinnedColour ? st.pinnedColour :
            st.darkColour ? await getSomeColour() :
                currentColour;
        $("#customColourModalInner")
            .css({ "visibility": "visible" })
            .fadeIn("fast")
            .removeClass("hide");
        $("#custom_colour_input").val(initialColour);
        $("#custom_colour_input").trigger("focus");
        // Reset custom set to current colour
        customColourSet.current = currentColour;
        customColourSet.new = currentColour;
        customColourModalShowing = true;
    }
    /**
     * @param {string} fontStyle Of type `FONT_STYLES`
     */
    function setFont(fontStyle) {
        const body = document.body;
        body.classList.remove(FONT_STYLES.SANS, FONT_STYLES.SERIF);
        body.classList.add(fontStyle);
    }
    /**
     * @param {boolean} show
     */
    function showClock(show) {
        if (clockTimeout) {
            clearTimeout(clockTimeout);
        }
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
        }
        else {
            hourFormat = TWELVE_HOUR_FORMAT;
            $("#ic_clock_type").removeClass("twelve");
        }
        if (clockTimeout) {
            clearTimeout(clockTimeout);
        }
        clock();
    }
    /**
     * @param {boolean} show
     * @param {boolean} [toggle=false]
     */
    async function showTopSites(show, toggle = false) {
        const topSitesDiv = $("#topSites");
        if (!show) {
            if (!toggle) {
                topSitesDiv.hide().text("");
            }
            else {
                topSitesDiv.slideToggle(() => topSitesDiv.text(""));
            }
            $("#top_sites_link").removeClass("showing");
            return;
        }
        // Get and show top sites from storage
        const st = await ls.get({
            "topSites": DEFAULTS.TOP_SITES,
        });
        let topSitesString = st.topSites.reduce((acc, site) => {
            return `
                ${acc}<a 
                    href="${site.url}" 
                    class="top_site_link" 
                    title="${site.title}"
                ><img class="top_site_icon" src="chrome://favicon/size/16@2x/${site.url}">${site.title}</a>
            `;
        }, "");
        topSitesDiv.text("").append(topSitesString); // [toggle ? "slideToggle" : "hide"]();
        toggle ? topSitesDiv.slideToggle() : topSitesDiv.show();
        $("#top_sites_link").addClass("showing");
        // Fetch top sites from API, and update in storage and view
        let topSites = await new Promise(resolve => chrome.topSites.get(resolve));
        const err = chrome.runtime.lastError;
        if (err) {
            console.warn("Error: ", err);
            return;
        }
        topSites = topSites
            .filter(site => !/^chrome(-extension)?:\/\//.test(site.url))
            .slice(0, Math.min(topSites.length, TOP_SITE_COUNT));
        if (arraysEqual(st.topSites, topSites)) {
            return;
        }
        // Update sites
        ls.set({ "topSites": topSites });
        topSitesString = st.topSites.reduce((acc, site) => {
            return `${acc}<a href="${site.url}" class="top_site_link">${site.title}</a>`;
        }, "");
        topSitesDiv.text("").append(topSitesString);
    }
    /**
     * @param {string} colour
     */
    function setPinnedColour(colour) {
        if (colour) {
            setColour(colour); // set color
            return;
        }
        // Get and set a random colour
        getSomeColour().then(setColour);
        // setColour(getSomeColour());
    }
    /**
     * @param {string|boolean} [reason]
     */
    function showUpdatedModal(reason) {
        if (!reason) {
            $("#notificationModal").hide().addClass("hide");
            return;
        }
        switch (reason) {
            // Updated
            case NOTIFICATIONS.UPDATED.ID: {
                $("#notificationTitle").text(NOTIFICATIONS.UPDATED.TITLE);
                $("#notification_action")
                    .text(NOTIFICATIONS.UPDATED.ACTION_TITLE)
                    .attr("href", NOTIFICATIONS.UPDATED.ACTION_URL);
                $("#context_message").text(NOTIFICATIONS.UPDATED.CONTEXT_MESSAGE);
                break;
            }
            // Promote ACS
            case NOTIFICATIONS.ACS_CWS.ID: {
                $("#notificationTitle").text(NOTIFICATIONS.ACS_CWS.TITLE);
                $("#notification_action")
                    .text(NOTIFICATIONS.ACS_CWS.ACTION_TITLE)
                    .attr("href", NOTIFICATIONS.ACS_CWS.ACTION_URL);
                $("#context_message").text(NOTIFICATIONS.ACS_CWS.CONTEXT_MESSAGE);
                break;
            }
            // Install
            default: {
                $("#notificationTitle").text(NOTIFICATIONS.INSTALLED.TITLE);
                $("#notification_action")
                    .text(NOTIFICATIONS.INSTALLED.ACTION_TITLE)
                    .attr("href", NOTIFICATIONS.INSTALLED.ACTION_URL);
                $("#context_message").text(NOTIFICATIONS.INSTALLED.CONTEXT_MESSAGE);
            }
        }
        $("#notificationModal").show().removeClass("hide");
    }
    /** */
    function clock() {
        $("#clock").text(moment().format(hourFormat));
        clockTimeout = setTimeout(clock, 500);
    }
    /** */
    async function getSomeColour() {
        const st = await ls.get({ "allPastels": defaultPastels });
        const pastelCount = st.allPastels.length;
        const colourIndex = Math.round(Math.random() * pastelCount);
        const col = ((Date.now() % 1000) * 360 / 1000).toFixed(0);
        const colourString = pastelCount > 0 ? st.allPastels[colourIndex] : `hsl(${col}, ${saturation}, ${lightness})`;
        return colourString;
    }
    /**
     * @param {string} colour Of type `'#ffffff'`
     */
    function setColour(colour) {
        currentColour = colour;
        $("body").css("background-color", colour).attr("data-colour", colour); // set color
    }
    /**
     * @param arr1
     * @param arr2
     * @returns;
     */
    function arraysEqual(arr1, arr2) {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    }
    /**
     * Adds a colour to saved list of pastel colours
     * @param colourString Colour string to add to pastels list
     */
    async function addToPastels(colourString = "") {
        if (!colourString) {
            return;
        }
        const st = await ls.get({ "allPastels": defaultPastels });
        if (st.allPastels.includes(colourString)) {
            return;
        }
        st.allPastels.push(colourString);
        await ls.set({ "allPastels": st.allPastels });
    }
    /**
     * Save a colour as pinned, or remove pinning
     * @param {String?} colourString Colour to set as pinned colour. If empty, remove current pinned colour
     */
    function savePinnedColour(colourString = "") {
        if (!colourString)
            return;
        ls.set({ "pinnedColour": colourString });
        localStorage.pinnedColour = colourString;
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxDQUFDO0lBQ0csSUFBSSxZQUFvQixDQUFDO0lBQ3pCLElBQUksVUFBVSxHQUFHLHVCQUF1QixDQUFDO0lBRXpDLE1BQU0sb0JBQW9CLEdBQUcsV0FBVyxDQUFDO0lBQ3pDLE1BQU0seUJBQXlCLEdBQUcsZ0JBQWdCLENBQUM7SUFFbkQsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUMxQixJQUFJLGFBQXFCLENBQUM7SUFDMUIsSUFBSSx3QkFBd0IsR0FBRyxLQUFLLENBQUM7SUFFckMsTUFBTSxlQUFlLEdBQTJCO1FBQzVDLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLEtBQUssRUFBRSxTQUFTO0tBQ25CLENBQUM7SUFFRixpQkFBaUIsQ0FDYixZQUFZLENBQUMsY0FBYyxJQUFJLE1BQU0sRUFDckMsWUFBWSxDQUFDLFlBQVksRUFDekIsWUFBWSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQ3BDLENBQUM7SUFDRixxRkFBcUY7SUFDckYsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxxQkFBcUIsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXJFLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNULENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXBDLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNwQixnQkFBZ0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCO1lBQzNDLFlBQVksRUFBRSxRQUFRLENBQUMsV0FBVztZQUNsQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsaUJBQWlCO1lBQzlDLFdBQVcs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
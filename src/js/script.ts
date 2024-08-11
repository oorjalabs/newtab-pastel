// f9fbe4
(function() {
    let clockTimeout: number;
    let hourFormat = TWENTY_FOUR_HOUR_FORMAT;

    const DARK_MODE_CLASS_NAME = "dark_mode";
    const AUTO_DARK_MODE_CLASS_NAME = "auto_dark_mode";

    const lightness = "95%";
    const saturation = "100%";
    let currentColour: string;
    let customColourModalShowing = false;

    const customColourSet: Record<string, string> = {
        "current": undefined,
        "new": undefined,
    };

    setColourForTheme(
        localStorage.useSystemTheme == "true",
        localStorage.pinnedColour,
        localStorage.darkColour == "true"
    );

    // After initial colour has been displayed, do further colour changes with transition
    setTimeout(() => $("body").css({"transition-duration": "1s"}), 2000);

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
        }) as {
            "useSystemTheme": boolean,
            "darkColour": boolean,
            "extensionUpdated": boolean,
            "fontStyle": FONT_STYLES,
            "pinnedColour": string,
            "showClock": boolean,
            "showTopSites": boolean,
            "topSitesPermission_firstAsk": boolean,
            "twentyfourhourclock": boolean,
        };

        setColourForTheme(
            st.useSystemTheme,
            st.pinnedColour,
            st.darkColour,
            false
        );

        setFont(st.fontStyle);

        // Set clock format
        setClockFormat(st.twentyfourhourclock);

        // Show/hide clock
        showClock(st.showClock);

        // Show top sites
        if (!st.topSitesPermission_firstAsk) {
            $("#top_sites_link").addClass("grab_attention");
        } else {
            showTopSites(st.showTopSites);
        }

        st.extensionUpdated && showUpdatedModal(st.extensionUpdated);


        // Show tab options on hovering over bottom half of the screen
        $("#hoverHalf").hover(
            () => $("#bottomHalf").addClass("entered"),
            () => $("#bottomHalf").removeClass("entered")
        );


        // Open options page
        $("#settings_link").on("click", () => chrome.runtime.openOptionsPage());


        // Toggle site visibility in storage
        $("#top_sites_link").on("click", async () => {
            ls.set({"topSitesPermission_firstAsk": true});

            $("#top_sites_link").removeClass("grab_attention");

            const st = await ls.get<boolean>({"showTopSites": DEFAULTS.SHOW_TOP_SITES});

            // Setting it off, so just save the new setting
            if (st.showTopSites) {
                await ls.set({"showTopSites": !st.showTopSites});
                return;
            }

            // Changing from false to true, check if we have permission
            const result = await new Promise<boolean>(resolve => {
                chrome.permissions.contains({
                    "permissions": ["topSites"],
                }, resolve);
            });

            // The extension has the permissions.
            // Save setting as true, action will happen in storage change handler
            if (result) {
                await ls.set({"showTopSites": true});
                return;
            }

            // The extension doesn't have the permissions.
            // Request permission.
            const granted = await new Promise<boolean>(resolve => {
                chrome.permissions.request({
                    "permissions": ["topSites"],
                }, resolve);
            });

            // If granted, set setting as true,
            if (granted) {
                await ls.set({"showTopSites": true});
                return;
            }

            // If not granted, do nothing (or show modal)
            console.warn("Permission not granted");
        });


        // Toggle clock visibility in storage
        $("#clock_link").on("click", async () => {
            const st = await ls.get({"showClock": DEFAULTS.SHOW_CLOCK});
            ls.set({"showClock": !st.showClock});
        });


        // Toggle clock type in storage
        $("#hr_link").on("click", async () => {
            const st = await ls.get({"twentyfourhourclock": DEFAULTS.TWENTY_FOUR_HOUR_CLOCK});
            ls.set({"twentyfourhourclock": !st.twentyfourhourclock});
        });


        // Toggle clock type in storage
        $("#font_link").on("click", async () => {
            const st = await ls.get({"fontStyle": DEFAULTS.FONT_STYLE});
            ls.set({"fontStyle": st.fontStyle === FONT_STYLES.SANS ? FONT_STYLES.SERIF : FONT_STYLES.SANS});
        });


        // Toggle dark colour in storage
        $("#go_dark").on("click", async e => {
            if (e.currentTarget.classList.contains("disabled")) return;

            const st = await ls.get({"darkColour": DEFAULTS.DARK_COLOUR});
            ls.set({"darkColour": !st.darkColour});
            localStorage.darkColour = !st.darkColour;
        });


        // Toggle useSystemTheme in storage
        $("#auto_dark").on("click", async () => {
            const st = await ls.get({"useSystemTheme": DEFAULTS.USE_SYSTEM_THEME});

            const useSystemTheme = !st.useSystemTheme;

            ls.set({"useSystemTheme": useSystemTheme});
            localStorage.useSystemTheme = useSystemTheme;
        });

        $("#default_ntp_link").on("click", () => {
            chrome.tabs.update({url: "chrome://new-tab-page/"});
        });

        /**
         * Toggle pinned colour.
         * If there's a pinned colour, un-pin it.
         * If there's no pinned colour, save the current colour as pinned.
         * Actual pinning happens in storage.onchanged handler
         */
        $("#pin_colour_link").on("click", async e => {
            if (e.currentTarget.classList.contains("disabled")) return;

            const st = await ls.get({"pinnedColour": DEFAULTS.PINNED_COLOUR});

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
            customColourSet.new = (e.currentTarget as HTMLInputElement).value.toLowerCase();
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
            if (customColourSet.new == DARK_COLOUR) return;

            // Colour not changed
            if (customColourSet.current == customColourSet.new) {
                const st = await ls.get({"pinnedColour": DEFAULTS.PINNED_COLOUR});

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
            if (!customColourModalShowing) return;

            if ($(e.target).parents("#customColourModal").length > 0) return;

            setColour(customColourSet.current);
            showCustomColourModal(false);
            return;
        });


        $("#notification_action").on("click", () => ls.set({extensionUpdated: false}));


        $("#notification_close").on("click", () => {
            ls.set({extensionUpdated: false});
            return false;
        });

        // If system theme is enabled, set mode according to system preferences
        if (window.matchMedia) {
            window.matchMedia("(prefers-color-scheme: dark)").onchange = onSystemThemeChanged;
        }
    });


    chrome.storage.onChanged.addListener(async changes => {
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
            }) as {
                "pinnedColour": string,
                "darkColour": boolean,
                "useSystemTheme": boolean,
            };

            setColourForTheme(
                st.useSystemTheme,
                st.pinnedColour,
                st.darkColour
            );
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
    async function onSystemThemeChanged(e: MediaQueryListEvent) {
        const st = await ls.get({
            "darkColour": DEFAULTS.DARK_COLOUR,
            "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            "pinnedColour": DEFAULTS.PINNED_COLOUR,
        }) as {
            "darkColour": boolean,
            "useSystemTheme": boolean,
            "pinnedColour": string,
        };

        setColourForTheme(
            st.useSystemTheme,
            st.pinnedColour,
            st.darkColour
        );
    }


    /**
     * @param {boolean} useSystemTheme
     * @param {string} pinnedColour
     * @param {boolean} darkPinned
     * @param forceChange default `true`
     */
    function setColourForTheme(
        useSystemTheme: boolean,
        pinnedColour: string,
        darkPinned: boolean,
        forceChange = true
    ) {
        const isSystemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

        // Toggle auto dark button and enable/disable go dark button based on useSystemTheme
        if (useSystemTheme) {
            document.body && document.body.classList.add(AUTO_DARK_MODE_CLASS_NAME);
            $("#go_dark").addClass("disabled");
        } else {
            document.body && document.body.classList.remove(AUTO_DARK_MODE_CLASS_NAME);
            $("#go_dark").removeClass("disabled");
        }

        // Toggle go dark button if dark pinned and not using system theme
        if (!useSystemTheme && darkPinned) {
            document.body && document.body.classList.add(DARK_MODE_CLASS_NAME);
        } else {
            document.body && document.body.classList.remove(DARK_MODE_CLASS_NAME);
        }

        if (
            (useSystemTheme && isSystemDark) ||
            (!useSystemTheme && darkPinned)
        ) {
            document.body && document.body.classList.add(DARK_THEME);

            // If dark enabled, or auto enabled and system theme is dark
            $("#pin_colour_link").removeClass("switched_on").addClass("disabled");
            setPinnedColour(DARK_COLOUR);
        } else {
            document.body && document.body.classList.remove(DARK_THEME);

            // If pinned colour, set that as background color
            $("#pin_colour_link")[pinnedColour ? "addClass" : "removeClass"]("switched_on").removeClass("disabled");

            // Don't redo random colour
            if (!forceChange && !pinnedColour) return;

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
        }) as {
            "pinnedColour": string,
            "darkColour": boolean,
        };

        const initialColour =
            st.pinnedColour ? st.pinnedColour :
                st.darkColour ? await getSomeColour() :
                    currentColour;

        $("#customColourModalInner")
            .css({"visibility": "visible"})
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
    function setFont(fontStyle: string) {
        const body = document.body;
        body.classList.remove(FONT_STYLES.SANS, FONT_STYLES.SERIF);
        body.classList.add(fontStyle);
    }


    /**
     * @param {boolean} show
     */
    function showClock(show: boolean) {
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
    function setClockFormat(isTwentyFourHour: boolean) {
        if (isTwentyFourHour) {
            hourFormat = TWENTY_FOUR_HOUR_FORMAT;
            $("#ic_clock_type").addClass("twelve");
        } else {
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
     * @param toggle default `false`
     */
    async function showTopSites(show: boolean, toggle = false) {
        const topSitesDiv = $("#topSites");

        if (!show) {
            if (!toggle) {
                topSitesDiv.hide().text("");
            } else {
                topSitesDiv.slideToggle(() => topSitesDiv.text(""));
            }
            $("#top_sites_link").removeClass("showing");
            return;
        }

        // Get and show top sites from storage
        const st = await ls.get<TopSite[]>({
            "topSites": DEFAULTS.TOP_SITES,
        });
        
        let topSitesString = st.topSites.reduce((acc, site) => {
            const faviconUrl = createFaviconURL(site.url);
            console.debug("favIcon:", faviconUrl);
            return `
                ${acc}<a 
                    href="${site.url}" 
                    class="top_site_link" 
                    title="${site.title}"
                    ><img class="top_site_icon" src="${faviconUrl}">${site.title}</a>
                    `;
        }, "");

        topSitesDiv.text("").append(topSitesString);// [toggle ? "slideToggle" : "hide"]();
        toggle && !topSitesDiv.is(":visible") ? topSitesDiv.slideToggle() : topSitesDiv.show();

        $("#top_sites_link").addClass("showing");

        // Fetch top sites from API, and update in storage and view
        let topSites = await new Promise<chrome.topSites.MostVisitedURL[]>(resolve => chrome.topSites.get(resolve));

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
        ls.set({"topSites": topSites});

        topSitesString = st.topSites.reduce((acc, site) => {
            return `${acc}<a href="${site.url}" class="top_site_link">${site.title}</a>`;
        }, "" );
        topSitesDiv.text("").append(topSitesString);
    }


    /**
     * Creates a favicon URL for a given url.
     * @param siteUrl URL for the site whose favicon is needed.
     * @returns string
     */
    function createFaviconURL(siteUrl: string) {
        const url = new URL(chrome.runtime.getURL("/_favicon/"));
        url.searchParams.set("pageUrl", siteUrl);
        url.searchParams.set("size", "32");
        return url.toString();
    }

    /**
     * @param {string} colour
     */
    function setPinnedColour(colour: string) {
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
    function showUpdatedModal(reason: string | boolean) {
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
        const st = await ls.get<string[]>({"allPastels": defaultPastels});

        const pastelCount = st.allPastels.length;
        const colourIndex = Math.round(Math.random() * pastelCount);
        const col = ((Date.now() % 1000) * 360 / 1000).toFixed(0);
        const colourString = pastelCount > 0 ? st.allPastels[colourIndex] : `hsl(${col}, ${saturation}, ${lightness})`;

        return colourString;
    }


    /**
     * @param {string} colour Of type `'#ffffff'`
     */
    function setColour(colour: string) {
        currentColour = colour;
        $("body").css("background-color", colour).attr("data-colour", colour); // set color
    }


    /**
     * @param arr1
     * @param arr2
     * @returns;
     */
    function arraysEqual(arr1: unknown[], arr2: unknown[]): boolean {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    }


    /**
     * Adds a colour to saved list of pastel colours
     * @param colourString Colour string to add to pastels list
     */
    async function addToPastels(colourString = ""): Promise<void> {
        if (!colourString) {
            return;
        }

        const st = await ls.get<string[]>({"allPastels": defaultPastels});

        if (st.allPastels.includes(colourString)) {
            return;
        }

        st.allPastels.push(colourString);

        await ls.set({"allPastels": st.allPastels});
    }


    /**
     * Save a colour as pinned, or remove pinning
     * @param {String?} colourString Colour to set as pinned colour. If empty, remove current pinned colour
     */
    function savePinnedColour(colourString: string | null = "") {
        if (!colourString) return;

        ls.set({"pinnedColour": colourString});
        localStorage.pinnedColour = colourString;
    }
})();

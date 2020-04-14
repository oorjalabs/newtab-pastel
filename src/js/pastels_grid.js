(function () {
    
    setColourForTheme(
        localStorage.useSystemTheme == "true",
        localStorage.pinnedColour,
        localStorage.darkColour == "true"
    );
    
    $(document).ready(async () => {
        
        const st = await ls.get({
            "allPastels": defaultPastels,
            "pinnedColour": DEFAULTS.PINNED_COLOUR,
            "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            "darkColour": DEFAULTS.DARK_COLOUR,
        });
        
        setColourForTheme(
            st.useSystemTheme,
            st.pinnedColour,
            st.darkColour,
            false
        );
        
        let pastelGridArray = shuffle(st.allPastels);
        
        const pinnedColour = st.pinnedColour;
        
        if (pinnedColour) {
            const colourIndex = pastelGridArray.indexOf(pinnedColour);
            if (colourIndex > -1) {
                pastelGridArray.splice(colourIndex, 1);
                pastelGridArray.splice(0, 0, pinnedColour);
            }
        }
        
        $("#grid").append(pastelGridArray.map(toHtml).join("\n"));
        
        setPinned(pinnedColour);
        
        $("body").on("click", ".delete_colour", async e => {
            // Get colour string
            const colour = e.currentTarget.dataset.colour;
            
            // Hide and remove the card
            const card = $(`#colour_${colour.replace("#","")}`);
            card.hide(_ => card.remove());
            
            // Remove the card from pastels set
            const st = await ls.get({ "allPastels": defaultPastels });
            const storedPastels = st.allPastels.filter(p => p != colour);
            ls.set({"allPastels": storedPastels});
        });
        
        
        $("body").on("click", ".pin_colour", e => {
            // Get colour string
            const colour = e.currentTarget.dataset.colour;
            
            const pin = $(`#colour_${colour.replace("#","")} .pin_colour`);
            const wasPinned = pin.hasClass("pinned");
            
            // Remove previously pinned card
            $(".pin_colour.pinned").removeClass("pinned");
            
            if (wasPinned) {
                // Remove saved pinned colour
                ls.remove("pinnedColour");
                return;
            }
            
            // Save newly pinned colour
            pin.addClass("pinned");
            
            // Save pinned colour
            ls.set({ "pinnedColour": colour });
        });
        
        
        // If system theme is enabled, set mode according to system preferences
        if (window.matchMedia) {
            window.matchMedia("(prefers-color-scheme: dark)").onchange = onSystemThemeChanged;
        }

    });
    
    
    chrome.storage.onChanged.addListener(async changes => {
        if (!changes) return;
        
        
        if (changes.pinnedColour) {
            setPinned(changes.pinnedColour.newValue);
        }
        
        if (changes.useSystemTheme || changes.darkColour) {
            const st = await ls.get({
                "pinnedColour": DEFAULTS.PINNED_COLOUR,
                "darkColour": DEFAULTS.DARK_COLOUR,
                "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME
            });
            
            setColourForTheme(
                st.useSystemTheme,
                st.pinnedColour,
                st.darkColour
            );
        }
    });
    
    
    /**
     * @param {string} [colour] 
     */
    function setPinned(colour) {
        // Remove previously pinned card
        $(".pin_colour.pinned").removeClass("pinned");
        
        if (!colour)
            return;
        
        colour = colour.replace("#", "");
        
        if (colour) {
            // Set new pinned colour
            $(`#colour_${colour} .pin_colour`).addClass("pinned");
        }
    }
    
    
    /**
     * @param {string} pastel 
     */
    function toHtml(pastel) {
        return `
    <span data-colour="${pastel}" style="background-color: ${pastel}" class="pastel_colour" id="colour_${pastel.replace("#", "")}">
        <div class="colour_contents">
            <span class="colour_name" title="Hex code for colour">${pastel}</span>
            <a class="bottom_btn_links pin_colour" id="" title="Pin colour" data-colour="${pastel}">
                <img src="img/pin.svg">
            </a>
            <a class="bottom_btn_links delete_colour" id="" title="Remove colour" data-colour="${pastel}">
                <img src="img/baseline-close-24px.svg">
            </a>
        </div>
    </span>
    `
    }
    
    
    /**
     * Shuffles array in place. ES6 version
     * @param {[String]} a items An array containing the items.
     * @return {[String]}
     */
    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    
    
    async function onSystemThemeChanged(e) {
        const st = await ls.get({
            "darkColour": DEFAULTS.DARK_COLOUR,
            "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            "pinnedColour": DEFAULTS.PINNED_COLOUR
        });
        
        setColourForTheme(
            st.useSystemTheme,
            st.pinnedColour,
            st.darkColour
        );
    }
    
    
    /**
     * 
     * @param {boolean} useSystemTheme 
     * @param {string} pinnedColour 
     * @param {boolean} darkPinned 
     */
    function setColourForTheme(useSystemTheme, pinnedColour, darkPinned, forceChange = true) {
        
        const isSystemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        
        if (
            (useSystemTheme && isSystemDark) ||
            (!useSystemTheme && darkPinned)
        ) {
            document.body && document.body.classList.add(DARK_THEME);
        } else {
            document.body && document.body.classList.remove(DARK_THEME);
        }
    }
    
})();

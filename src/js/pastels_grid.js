(function () {
    setColourForTheme(localStorage.useSystemTheme == "true", localStorage.pinnedColour, localStorage.darkColour == "true");
    $(async () => {
        const st = await ls.get({
            "allPastels": defaultPastels,
            "pinnedColour": DEFAULTS.PINNED_COLOUR,
            "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            "darkColour": DEFAULTS.DARK_COLOUR,
        });
        setColourForTheme(st.useSystemTheme, st.pinnedColour, st.darkColour, false);
        const pastelGridArray = shuffle(st.allPastels);
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
        $("body").on("click", ".delete_colour", async (e) => {
            // Get colour string
            const colour = e.currentTarget.dataset.colour;
            // Hide and remove the card
            const card = $(`#colour_${colour.replace("#", "")}`);
            card.hide(() => card.remove());
            // Remove the card from pastels set
            const st = await ls.get({ "allPastels": defaultPastels });
            const storedPastels = st.allPastels.filter(p => p != colour);
            ls.set({ "allPastels": storedPastels });
        });
        $("body").on("click", ".pin_colour", e => {
            // Get colour string
            const colour = e.currentTarget.dataset.colour;
            const pin = $(`#colour_${colour.replace("#", "")} .pin_colour`);
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
    chrome.storage.onChanged.addListener(async (changes) => {
        if (!changes)
            return;
        if (changes.pinnedColour) {
            setPinned(changes.pinnedColour.newValue);
        }
        if (changes.useSystemTheme || changes.darkColour) {
            const st = await ls.get({
                "pinnedColour": DEFAULTS.PINNED_COLOUR,
                "darkColour": DEFAULTS.DARK_COLOUR,
                "useSystemTheme": DEFAULTS.USE_SYSTEM_THEME,
            });
            setColourForTheme(st.useSystemTheme, st.pinnedColour, st.darkColour);
        }
    });
    /**
     * @param {string} colour
     */
    function setPinned(colour) {
        // Remove previously pinned card
        $(".pin_colour.pinned").removeClass("pinned");
        if (!colour) {
            return;
        }
        colour = colour.replace("#", "");
        if (colour) {
            // Set new pinned colour
            $(`#colour_${colour} .pin_colour`).addClass("pinned");
        }
    }
    /**
     * @param pastel
     * @returns;
     */
    function toHtml(pastel) {
        return `
    <span 
        data-colour="${pastel}" 
        style="background-color: ${pastel}" 
        class="pastel_colour" 
        id="colour_${pastel.replace("#", "")}">
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
    `;
    }
    /**
     * Shuffles array in place. ES6 version
     * @param items An array containing the items.
     * @return;
     */
    function shuffle(items) {
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        return items;
    }
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
        if ((useSystemTheme && isSystemDark) ||
            (!useSystemTheme && darkPinned)) {
            document.body && document.body.classList.add(DARK_THEME);
        }
        else {
            document.body && document.body.classList.remove(DARK_THEME);
        }
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFzdGVsc19ncmlkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFzdGVsc19ncmlkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUM7SUFDRyxpQkFBaUIsQ0FDYixZQUFZLENBQUMsY0FBYyxJQUFJLE1BQU0sRUFDckMsWUFBWSxDQUFDLFlBQVksRUFDekIsWUFBWSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQ3BDLENBQUM7SUFFRixDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDVCxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDcEIsWUFBWSxFQUFFLGNBQWM7WUFDNUIsY0FBYyxFQUFFLFFBQVEsQ0FBQyxhQUFhO1lBQ3RDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0I7WUFDM0MsWUFBWSxFQUFFLFFBQVEsQ0FBQyxXQUFXO1NBQ3JDLENBS0EsQ0FBQztRQUVGLGlCQUFpQixDQUNiLEVBQUUsQ0FBQyxjQUFjLEVBQ2pCLEVBQUUsQ0FBQyxZQUFZLEVBQ2YsRUFBRSxDQUFDLFVBQVUsRUFDYixLQUFLLENBQ1IsQ0FBQztRQUVGLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFL0MsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQztRQUVyQyxJQUFJLFlBQVksRUFBRTtZQUNkLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2xCLGVBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDOUM7U0FDSjtRQUVELENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFB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
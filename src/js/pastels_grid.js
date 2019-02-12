var clockTimeout;
var hourFormat = TWENTY_FOUR_HOUR_FORMAT;

const pastels = (localStorage.allPastels || "").split(",");
const lightness = "95%";
const saturation = "100%";

$(document).ready(() => {
    const pastelGridString = shuffle(pastels).map(toHtml).join("\n");
    $("#grid").append(pastelGridString);
    
    setPinned(localStorage.pinnedColour);
    
    $("body").on("click", ".delete_colour", e => {
        // Get colour string
        const colour = e.currentTarget.dataset.colour;
        
        // Hide and remove the card
        const card = $(`#colour_${colour.replace("#","")}`);
        card.hide(_ => card.remove());
        
        // Remove the card from pastels set
        const updatedPastels = pastels.filter(p => p != colour);
        localStorage.allPastels = updatedPastels.join(",");
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
            localStorage.removeItem("pinnedColour");
            ls.remove("pinnedColour");
            return;
        }
        
        // Save newly pinned colour
        pin.addClass("pinned");
        
        // Save pinned colour
        localStorage.pinnedColour = colour;
        ls.set({"pinnedColour": colour});
    });
    
    
    chrome.storage.onChanged.addListener(changes => {
        if (!changes || !changes.pinnedColour) {
            return;
        }
        
        setPinned(changes.pinnedColour.newValue);
    });
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
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

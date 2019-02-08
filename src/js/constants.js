const DEFAULTS = {
    "SHOW_CLOCK": true,
    "TWENTY_FOUR_HOUR_CLOCK": false,
    "PINNED_COLOUR": "",
    "SHOW_TOP_SITES": false,
    "EXTENSION_UPDATED": false,
    "TOP_SITES": [{
            title: "Google",
            url: "https://google.co.uk"
        },
        {
            title: "BBC",
            url: "https://bbc.co.uk"
        },
        {
            title: "About the extension",
            url: "https://updatenotes.wordpress.com/category/pastel-new-tab/?utm_source=pastelnewtab&utm_medium=chrome_projects&utm_content=ntp_homepage_links&utm_campaign=chrome_projects"
        },
        {
            title: "Twitter",
            url: "https://twitter.com"
        },
    ]
}

const TWENTY_FOUR_HOUR_FORMAT = "HH:mm";
const TWELVE_HOUR_FORMAT = "h:mm A";

const TOP_SITE_COUNT = 8;

const ICON_URL = {
    "CHANGES": chrome.extension.getURL("img/ic_history_black_24px.svg"),
    "NOTIFICATION": chrome.extension.getURL("img/icon128.png"),
}

const URLS = {
    "UNINSTALL": `http://c306.net/whygo.html?src=nTP&utm_source=nTP%20for%20chrome&utm_medium=chrome_projects&utm_content=uninstall&utm_campaign=chrome_projects&version=${chrome.runtime.getManifest().version}`,
    "UPDATE_NOTES": "https://c306.net/apps/updates/app/pastel-new-tab/?utm_source=nTP%20for%20chrome&utm_medium=chrome_projects&utm_content=upgradeNotification_changelog&utm_campaign=chrome_projects",
    "FEEDBACK": `https://docs.google.com/forms/d/e/1FAIpQLSf9_ku3EUkAOpHjfXGTr4qcWYUmaQpxYEj-WfkDdiwjryrGGQ/viewform?entry.1545185881=Pastel+-+New+tab+for+Chrome&entry.1097111967&entry.1652780603&entry.984758361=Suggest+new+feature+or+improvement&entry.1210432706=Only+if+I+can+find+the+time&entry.1609176506&entry.153422268=${chrome.runtime.getManifest().version}`,
}

const CURRENT_VERSION = chrome.runtime.getManifest().version;
const CURRENT_VERSION_NAME = chrome.runtime.getManifest().version_name;

const FONT_STYLES = {
    SANS: "sans",
    SERIF: "serif",
};

const DEFAULTS = {
    "SHOW_CLOCK": true,
    "TWENTY_FOUR_HOUR_CLOCK": false,
    "PINNED_COLOUR": "",
    "SHOW_TOP_SITES": false,
    "FONT_STYLE": FONT_STYLES.SANS,
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
    "UNINSTALL": `http://c306.net/whygo.html?src=nTP&utm_source=nTP%20for%20chrome&utm_medium=chrome_projects&utm_content=uninstall&utm_campaign=chrome_projects&version=${CURRENT_VERSION}`,
    "UPDATE_NOTES": "https://updatenotes.wordpress.com/category/pastel-new-tab/?utm_source=pastelnewtab&utm_medium=chrome_projects&utm_content=ntp_updated_notification_links&utm_campaign=chrome_projects",
    "FEEDBACK": `https://docs.google.com/forms/d/e/1FAIpQLSf9_ku3EUkAOpHjfXGTr4qcWYUmaQpxYEj-WfkDdiwjryrGGQ/viewform?entry.1545185881=Pastel+-+New+tab+for+Chrome&entry.1097111967&entry.1652780603&entry.984758361=Suggest+new+feature+or+improvement&entry.1210432706=Only+if+I+can+find+the+time&entry.1609176506&entry.153422268=${CURRENT_VERSION}`,
    "ACS_CWS": "https://chrome.google.com/webstore/detail/autoconvert-select-you-se/einokpbfcmmopbfbpiofaeohhkmcbbcg?utm_source=pastel_new_tab&utm_medium=chrome_projects&utm_content=ntp_notif_acs_CWS&utm_campaign=chrome_projects"
}

const NOTIFICATIONS = {
    "UPDATED": {
        ID: "update",
        TITLE: "Extension updated",
        ACTION_TITLE: "See what's new",
        ACTION_URL: URLS.UPDATE_NOTES,
        CONTEXT_MESSAGE: `ver ${CURRENT_VERSION_NAME}`,
    },
    "INSTALLED": {
        ID: "install",
        TITLE: "Welcome to pastel new tab",
        ACTION_TITLE: "Recent update notes",
        ACTION_URL: URLS.UPDATE_NOTES,
        CONTEXT_MESSAGE: `ver ${CURRENT_VERSION_NAME}`,
    },
    "ACS_CWS": {
        ID: "acs_cws",
        TITLE: "New: AutoConvert Select",
        ACTION_TITLE: "See in Chrome Web Store",
        ACTION_URL: URLS.ACS_CWS,
        CONTEXT_MESSAGE: "Automatically convert values from other units, currencies and time zones when selected on a   page",
    }
}

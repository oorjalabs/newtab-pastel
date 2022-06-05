const CURRENT_VERSION = chrome.runtime.getManifest().version;
const CURRENT_VERSION_NAME = chrome.runtime.getManifest().version_name;

enum FONT_STYLES {
    SANS = "sans",
    SERIF = "serif",
}

const DEFAULTS = Object.freeze({
    "USE_SYSTEM_THEME": false,
    "DARK_COLOUR": false,
    "SHOW_CLOCK": true,
    "TWENTY_FOUR_HOUR_CLOCK": false,
    "PINNED_COLOUR": "",
    "SHOW_TOP_SITES": false,
    "FONT_STYLE": FONT_STYLES.SANS,
    "EXTENSION_UPDATED": false,
    "TOP_SITES": [{
        title: "Google",
        url: "https://google.co.uk/",
    },
    {
        title: "BBC",
        url: "https://bbc.co.uk/",
    },
    {
        title: "About the extension",
        // eslint-disable-next-line max-len
        url: "https://updatenotes.wordpress.com/category/pastel-new-tab/?utm_source=pastelnewtab&utm_medium=chrome_projects&utm_content=ntp_homepage_links&utm_campaign=chrome_projects",
    },
    {
        title: "My other apps",
        url: "https://c306.net/apps",
    },
    ],
});


const TWENTY_FOUR_HOUR_FORMAT = "HH:mm";
const TWELVE_HOUR_FORMAT = "h:mm A";

const TOP_SITE_COUNT = 8;

const ICON_URL = Object.freeze({
    "CHANGES": chrome.extension.getURL("img/ic_history_black_24px.svg"),
    "NOTIFICATION": chrome.extension.getURL("img/icon128.png"),
});

const URLS = Object.freeze({
    "UNINSTALL": `http://c306.net/whygo.html?src=nTP&utm_source=nTP%20for%20chrome&utm_medium=chrome_projects&utm_content=uninstall&utm_campaign=chrome_projects&version=${CURRENT_VERSION}`,
    "UPDATE_NOTES": "https://updatenotes.wordpress.com/category/pastel-new-tab/?utm_source=pastelnewtab&utm_medium=chrome_projects&utm_content=ntp_updated_notification_links&utm_campaign=chrome_projects",
    "FEEDBACK": `https://docs.google.com/forms/d/e/1FAIpQLSf9_ku3EUkAOpHjfXGTr4qcWYUmaQpxYEj-WfkDdiwjryrGGQ/viewform?usp=pp_url&entry.1545185881=Pastel+new+tab+for+Chrome&entry.984758361=Suggest+new+feature+or+improvement&entry.1210432706=Only+if+I+can+find+the+time&entry.153422268=${CURRENT_VERSION}`,
    "ACS_CWS": "https://chrome.google.com/webstore/detail/autoconvert-select-you-se/einokpbfcmmopbfbpiofaeohhkmcbbcg?utm_source=pastel_new_tab&utm_medium=chrome_projects&utm_content=ntp_notif_acs_CWS&utm_campaign=chrome_projects",
});

const NOTIFICATIONS = Object.freeze({
    "UPDATED": {
        ID: "update",
        ACTION_URL: URLS.UPDATE_NOTES,
        TITLE: chrome.i18n.getMessage("notif_title_updated"),
        ACTION_TITLE: chrome.i18n.getMessage("notif_action_title_updated"),
        CONTEXT_MESSAGE: chrome.i18n.getMessage("notif_message_updated", CURRENT_VERSION_NAME),
    },
    "INSTALLED": {
        ID: "install",
        ACTION_URL: URLS.UPDATE_NOTES,
        TITLE: chrome.i18n.getMessage("notif_title_installed"),
        ACTION_TITLE: chrome.i18n.getMessage("notif_action_title_installed"),
        CONTEXT_MESSAGE: chrome.i18n.getMessage("notif_message_installed", CURRENT_VERSION_NAME),
    },
    "ACS_CWS": {
        ID: "acs_cws",
        ACTION_URL: URLS.ACS_CWS,
        TITLE: chrome.i18n.getMessage("notif_title_acs"),
        ACTION_TITLE: chrome.i18n.getMessage("notif_action_title_acs"),
        CONTEXT_MESSAGE: chrome.i18n.getMessage("notif_message_acs"),
    },
});

const DARK_COLOUR = "#323639";
const DARK_THEME = "dark_theme";

// rgb(229, 249, 255)
const defaultPastels = [
    "#fcf4fe", "#fdfcf0", "#fef9f3", "#fef0fd", "#ebf7f1", "#f9ebf8",
    "#f3fbeb", "#fbe8e7", "#f5fce8", "#e7f3fe", "#e7feef", "#fee7ea",
    "#e5f3ff", "#f7eaed", "#f1f8e7", "#e5e4fb", "#f9fbe4", "#e2fcea",
    "#e2f2fd", "#fde2f0", "#ffe1e1", "#f5e5f5", "#f6e3f5", "#f7e5f2",
    "#efe0f9", "#f8f9df", "#dffaf3", "#dcfce0", "#defefb", "#fefcda",
    "#fff8da", "#ede5f1", "#f5eae1", "#f1dff5", "#f8ecdf", "#f7f8de",
    "#dcfaf5", "#f5fada", "#d9effc", "#dffcd9", "#fce4db", "#d8dffc",
    "#d9f1fe", "#dff2eb", "#f6d9e0", "#d9f8f7", "#d8f8e7", "#f9eed8",
    "#ebd6f9", "#f9d6de", "#f9edd7", "#d8e3fa", "#fad6d6", "#fae5d6",
    "#d5dcfc", "#ddd2fc", "#d0d6fe", "#fedad1", "#ffd4d2", "#daefea",
    "#d9eef0", "#f2dadc", "#d6e6f4", "#d6f4e9", "#f5f0d4", "#d4e2f6",
    "#f0d5f6", "#f7d6eb", "#d3dff7", "#d4d5f9", "#e2d1f9", "#d1d5fa",
    "#facfd3", "#cfd4fb", "#d7cefb", "#d0e7fc", "#cdfcd0", "#d9cefd",
    "#e4cefd", "#f4fdcc", "#fdcce3", "#fdccea", "#cdcffe", "#cceeff",
    "#eddbd7", "#efeed6", "#e8d7f0", "#d6d4f1", "#d1f4e0", "#cdd5f7",
    "#f7d1ce", "#cff8e8", "#f8f2cf", "#d9cbf9", "#f9cbe6", "#f9d9cc",
    "#faf8ce", "#f6facc", "#f5cdfb", "#decbfc", "#c8defd", "#c8fdcc",
    "#fdc7c9", "#cafee9", "#cfc9fe", "#ffe6c8", "#d6ebe7", "#d3e3ed",
    "#d3ede4", "#edded3", "#eedfd4", "#d1d2f1", "#cef1f0", "#f1cee7",
    "#f2d5d1", "#cef4ef", "#ebcbf4", "#f6dfcc", "#c9f2f6", "#f7cbd5",
    "#eecaf7", "#c8e4f9", "#f9cae9", "#e3c7fa", "#fac5cc", "#c5fbfa",
    "#f6fbc6", "#fcc5e1", "#fcc8c7", "#c3e7fe", "#fee7c5", "#c2e6ff",
    "#c3fff3", "#e9c4ff", "#e7d3e1", "#e7d9d3", "#e8d3d8", "#eccee2",
    "#efcdd8", "#cbf0eb", "#f0d1cc", "#f1c9db", "#eec8f3", "#f5c8d7",
    "#f5c9ea", "#f4c7f5", "#f5e4c5", "#f7dec7", "#cfc5f8", "#c1cbf9",
    "#c4dbf9", "#d6c2f9", "#f9cec3", "#c0c0fa", "#fbe1c0", "#fcd0c2",
    "#bdd5fe", "#bfc9fe", "#fed4bc", "#becfff", "#e6d3d8", "#e7cfe6",
    "#e9ccd2", "#eacedb", "#cbebe7", "#ebcbd7", "#ebd2ca", "#eecaeb",
    "#eedcc7", "#efc7d0", "#cbc5f2", "#c2f4f2", "#d0c2f4", "#f4c3cf",
    "#f4c4d3", "#d5c1f4", "#c0c6f5", "#f6d7c0", "#c0d4f7", "#c0ebf7",
    "#f7e8c0", "#c1f8f1", "#f9e5be", "#f9e6be", "#befadf", "#fad0bc",
    "#faf4bb", "#babcfb", "#bdbafb", "#bdfbfc", "#eebcfc", "#eebdfc",
    "#fcdabc", "#b9f2fc", "#bafcf4", "#fcd3bb", "#bcfddc", "#bafeea",
    "#cfe5db", "#dfc3ec", "#c6c4ed", "#edc4dd", "#eedec6", "#dac4ee",
    "#c1eeda", "#efd0c2", "#c0e1f0", "#dfc1f1", "#f1c0c1", "#bef1eb",
    "#f2bfcf", "#f2c8bd", "#bdc7f3", "#f3c1bd", "#bdc8f4", "#bff4f1",
    "#bbcbf4", "#bfd0f5", "#f5edbd", "#f6b9c7", "#f8bbcb", "#ddbbf9",
    "#f5f9b9", "#c2b6f9", "#bae5fa", "#dbcde1", "#c5d8e5", "#c4c2e9",
    "#c4cdea", "#bdbded", "#eec0ce", "#cfeebc", "#efbfc8", "#bbefda",
    "#bde8f0", "#bdeaf0", "#bcddf1", "#bbc8f3", "#bbe9f3", "#f4dab6",
    "#b8f5e6", "#f5c5b8", "#f5cfb9", "#f5dfb5", "#f6ebb8", "#b6f7d2",
    "#f7b6ce", "#eeb4f9", "#ddcade", "#dfc7cd", "#c6dee0", "#e1c7cc",
    "#c6c5e3", "#c4e3e4", "#c1d8e4", "#c1dde5", "#ebbbc4", "#b9edce",
    "#edbae3", "#b7baee", "#b8deef", "#c9b8ef", "#efcab9", "#b8f0eb",
    "#b0f9da", "#c6dcdb", "#dcc6d8", "#c0e3c8", "#c1c5e3", "#bfe3d2",
    "#bfd6e5", "#cbbbe5", "#bac4e8", "#eab7be", "#ecb7ce", "#b5efe6",
    "#cec3d9", "#d1c4da", "#bbe0d9", "#badde1", "#bbc9e2", "#d3bae2",
    "#b5e7c5", "#ebcbb3", "#ebb0b1", "#ebb0b8", "#b1ede2", "#bfdadb",
    "#bcc2db", "#b7e0e3", "#bbb4e3", "#bbd7d1", "#c2bbd9", "#b7c0db",
    "#dcb8d8", "#b5b4df", "#b8b5df", "#dfc4b4", "#b3d9e1", "#d1b9d6",
    "#b8d6d2", "#b8d8d0",
];

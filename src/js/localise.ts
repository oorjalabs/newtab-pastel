// Inner content
document.querySelectorAll("[data-i18n]").forEach(elem => {
    const text = chrome.i18n.getMessage((elem as HTMLElement).dataset.i18n);
    if (!!text && !chrome.runtime.lastError) {
        elem.innerHTML = text;
    }
});

// Inner content leading
document.querySelectorAll("[data-i18n-leading]").forEach(elem => {
    const text = chrome.i18n.getMessage((elem as HTMLElement).dataset.i18nLeading);
    if (!!text && !chrome.runtime.lastError) {
        const prev = elem.innerHTML;
        elem.innerHTML = text + prev;
    }
});

// Inner content trailing
document.querySelectorAll("[data-i18n-trailing]").forEach(elem => {
    const text = chrome.i18n.getMessage((elem as HTMLElement).dataset.i18nTrailing);
    if (!!text && !chrome.runtime.lastError) {
        elem.innerHTML += text;
    }
});

// Title attribute
document.querySelectorAll("[data-title-i18n]").forEach(elem => {
    const title = chrome.i18n.getMessage((elem as HTMLElement).dataset.titleI18n);
    if (!!title && !chrome.runtime.lastError) {
        elem.setAttribute("title", title);
    }
});

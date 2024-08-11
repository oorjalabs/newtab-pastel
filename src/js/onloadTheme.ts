// To prevent bright flashing when opening new tab with dark mode enabled
const useDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
if (useDark) {
    document.body.classList.add("system_init_dark");
} else {
    document.body.classList.remove("system_init_dark");
}

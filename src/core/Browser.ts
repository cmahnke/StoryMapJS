/*
	Browser handles feature detection for internal use.
	Modern browsers (2022+) only - legacy vendor sniffing removed.
*/

export const ua = navigator.userAgent.toLowerCase();
export const doc = document.documentElement;
export const webkit = ua.includes("webkit");
export const chrome = ua.includes("chrome");
export const firefox = ua.includes("firefox");
export const android = ua.includes("android");
export const mobile = typeof orientation !== "undefined";
export const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
export const webkit3d = "WebKitCSSMatrix" in window;
export let retina = window.devicePixelRatio > 1;
if (!retina && "matchMedia" in window) {
    const windowMediaMatches = window.matchMedia("(min-resolution:144dpi)");
    retina = windowMediaMatches.matches;
}

export const Browser = {
    ie: false,
    webkit: webkit,
    chrome: chrome,
    firefox: firefox,
    android: android,
    ie3d: "transition" in doc.style,
    webkit3d: webkit3d,
    gecko3d: "MozPerspective" in doc.style,
    any3d: webkit3d || "MozPerspective" in doc.style,
    mobile: mobile,
    mobileWebkit: mobile && webkit,
    mobileWebkit3d: mobile && webkit3d,
    touch: touch,
    pointer: true,
    retina: retina,
    orientation: function () {
        const w = window.innerWidth,
            h = window.innerHeight;
        return w > h ? "landscape" : "portrait";
    },
};

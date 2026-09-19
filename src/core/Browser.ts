/*
	Browser - the only feature detection StoryMapJS still needs.
	2022+ browsers only: no vendor sniffing, no legacy engine flags.
*/

export const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

/** Coarse-pointer devices (phones, tablets) - drives the mobile/skinny layouts. */
export const mobile = window.matchMedia?.("(pointer: coarse)").matches ?? false;

export const Browser = {
    touch: touch,
    mobile: mobile,
    orientation: function (): "landscape" | "portrait" {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return w > h ? "landscape" : "portrait";
    },
};

import "./scss/VCO.StoryMap.scss";
export { StoryMap } from "./storymap/StoryMap";
export { loadCSS } from "./core/Load";

/* Used by the editor: */

import MediaType from "./media/MediaType";
export { MediaType };

export { setLanguage } from "./language/Language";

/* Transitional references deprecated as of 0.7.7 */
function trace(msg: unknown): void {
    console.log(msg);
}
window.trace = trace;

function getJSON(url: string, onload: (data: unknown) => void): void {
    fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(`HTTP ${response.status}`);
        })
        .then((data) => onload(data))
        .catch(() => {
            alert("There was a problem with the request.");
        });
}

import { loadCSS } from "./core/Load";
import { StoryMap } from "./storymap/StoryMap";

const VCO = {
    Load: {
        css: loadCSS,
    },
    getJSON: getJSON,
    StoryMap: StoryMap,
};
window.VCO = VCO;

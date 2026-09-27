// const debug = true;

/**
 * Format an ISO-8601-ish timestamp (as found in `date.created_time`, originally
 * from Instagram) as a short, locale-aware date, e.g. "Mar 3, 2013".
 *
 * Falls back to the raw input when it does not parse, so an unusual value
 * shows as-is rather than "Invalid Date".
 */
export function convertUnixTime(str: string, locale?: string): string {
    if (!str) {
        return str;
    }
    // "2013-12-09 01:56:28" is not valid ISO-8601 (space instead of "T"), so
    // normalise it before parsing.
    const parsed = new Date(/^\d{4}-\d{2}-\d{2} /.test(str) ? str.replace(" ", "T") : str);
    if (Number.isNaN(parsed.getTime())) {
        return str;
    }
    return parsed.toLocaleDateString(locale ?? "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Copy the own enumerable properties of `source` onto `target`, limited to
 * `keys` (or all of the source's keys when omitted). Shared body for the two
 * public merge helpers below.
 */
function copyOwn(
    target: Record<string, unknown>,
    source: Record<string, unknown> | null | undefined,
    keys?: Iterable<string>,
): void {
    // `for...in` over a null/undefined source was a silent no-op, and several
    // call sites pass optional values straight through — keep that behaviour.
    if (source == null) {
        return;
    }
    const names = keys ?? Object.keys(source);
    for (const name of names) {
        if (Object.prototype.hasOwnProperty.call(source, name)) {
            target[name] = source[name];
        }
    }
}

/**
 * Shallow-assign every own property of `data_to_merge` onto `data_main`.
 *
 * Despite the name this is *not* a deep merge, and it must not become one:
 * every call site merges a partial options object over a defaults object, and
 * a recursive merge would silently change how nested `map_options` and
 * `overlays` values are combined.
 */
export function mergeData<T extends object>(data_main: T, data_to_merge?: object | null): T {
    copyOwn(
        data_main as Record<string, unknown>,
        data_to_merge as Record<string, unknown> | null | undefined,
    );
    return data_main;
}

/**
 * Like `mergeData`, but only copies keys that already exist in `data_main`.
 * This is what lets storymap *data* override a known option without being able
 * to introduce new ones.
 */
export function updateData<T extends object>(data_main: T, data_to_merge?: object | null): T {
    copyOwn(
        data_main as Record<string, unknown>,
        data_to_merge as Record<string, unknown> | null | undefined,
        Object.keys(data_main),
    );
    return data_main;
}

let _lastStampId = 0;
const _stampKey = "_vco_id";

/** Stamp an object (or function) with a unique id and return it. */
export function stamp(obj: object): number {
    const target = obj as Record<string, unknown>;
    target[_stampKey] = target[_stampKey] || ++_lastStampId;
    return target[_stampKey] as number;
}

/**
 * Index of the entry whose `data[prop]` equals `id`, or -1 when there is no
 * match. Returning -1 matters: a "not found" result of 0 is indistinguishable
 * from "the first slide", so a bad id silently jumped the story to the start
 * (contrast StoryMap.goTo, which range-checks).
 */
export function findArrayNumberByUniqueID(
    id: unknown,
    array: { data: Record<string, unknown> }[],
    prop: string,
): number {
    for (let i = 0; i < array.length; i++) {
        if (array[i].data[prop] === id) {
            return i;
        }
    }
    return -1;
}

/**
 * Clear a timer that may be null/undefined and reset the variable.
 *
 * `clearTimeout(null)` is a harmless no-op at runtime but not assignable to
 * the overloads, and forgetting to null the handle afterwards is what lets a
 * cancelled timer be cleared twice (or, worse, not cleared at all).
 */
export function clearTimer(timer: ReturnType<typeof setTimeout> | null | undefined): void {
    if (timer !== null && timer !== undefined) {
        clearTimeout(timer);
    }
}

export function unique_ID(size: number, prefix?: string): string {
    function getRandomNumber(range: number): number {
        return Math.floor(Math.random() * range);
    }
    function getRandomChar(): string {
        const chars = "abcdefghijklmnopqurstuvwxyz";
        return chars.charAt(getRandomNumber(chars.length));
    }
    function randomID(size: number): string {
        let str = "";
        for (let i = 0; i < size; i++) {
            str += getRandomChar();
        }
        return str;
    }
    if (prefix) {
        return prefix + "-" + randomID(size);
    } else {
        return "vco-" + randomID(size);
    }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m: string, r: string, g: string, b: string) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

// CSS named colors (Colors Level 4) for parseCssColor below.
const NAMED_COLORS: Record<string, [number, number, number]> = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50],
};

function parseRgbComponent(part: string, max: number): number | null {
    const percent = part.endsWith("%");
    const value = parseFloat(part);
    if (!isFinite(value)) {
        return null;
    }
    const scaled = percent ? (value / 100) * max : value;
    return Math.min(max, Math.max(0, Math.round(scaled)));
}

/**
 * Parse any CSS color (hex, rgb()/rgba(), named colors) into {r, g, b}.
 * Unlike hexToRgb this never throws on valid CSS input; returns null only
 * for unparseable values so callers can fall back to a default.
 */
export function parseCssColor(value: string): { r: number; g: number; b: number } | null {
    const input = value.trim().toLowerCase();
    const hex = hexToRgb(input);
    if (hex) {
        return hex;
    }
    const rgb = /^rgba?\(\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)\s*(?:,\s*[^)]+\s*)?\)$/.exec(
        input,
    );
    if (rgb) {
        const r = parseRgbComponent(rgb[1], 255);
        const g = parseRgbComponent(rgb[2], 255);
        const b = parseRgbComponent(rgb[3], 255);
        return r === null || g === null || b === null ? null : { r, g, b };
    }
    const named = NAMED_COLORS[input];
    return named ? { r: named[0], g: named[1], b: named[2] } : null;
}

/**
 * Glide duration for a slide jump, scaled with the distance so out-of-order
 * navigation glides instead of flicking. Shared by the slider and the map
 * so both animations stay in sync, and exposed for transition events.
 */
export function slideTransitionDuration(from: number, to: number): number {
    const steps = Math.abs(to - from);
    return Math.max(600, Math.min(1000 + steps * 120, 2000));
}

/**
 * True when the user prefers reduced motion
 * (`prefers-reduced-motion: reduce`) — slide/map glides collapse to
 * instant changes and autoplay stays off.
 */
export function prefersReducedMotion(): boolean {
    return (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

export function htmlify(str: string): string {
    //if (str.match(/<\s*p[^>]*>([^<]*)<\s*\/\s*p\s*>/)) {
    if (str.match(/<p>[\s\S]*?<\/p>/)) {
        return str;
    } else {
        return "<p>" + str + "</p>";
    }
}

export function getUrlVars(string: string): string[] & Record<string, string> {
    let str: string, hash: string[];
    const vars: string[] = [];
    str = string.toString();
    if (str.match("&#038;")) {
        str = str.replace("&#038;", "&");
    } else if (str.match("&#38;")) {
        str = str.replace("&#38;", "&");
    } else if (str.match("&amp;")) {
        str = str.replace("&amp;", "&");
    }
    const hashes = str.slice(str.indexOf("?") + 1).split("&");
    for (let i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        vars.push(hash[0]);
        (vars as unknown as Record<string, string>)[hash[0]] = hash[1];
    }
    return vars as string[] & Record<string, string>;
}

export const ratio = {
    /**
     * The 16:9 height for a given width, or the 16:9 width for a given
     * height. Returns 0 when neither is a usable number.
     *
     * The old guards were `!== null && !== ""`, which an `undefined` passes
     * through — so a caller that omitted `w` computed `Math.round(NaN)` and
     * wrote `height: "NaNpx"`. A `typeof === "number"` check is what the
     * arithmetic actually needs.
     */
    r16_9: function (size: { w?: number; h?: number }): number {
        if (typeof size.w === "number" && isFinite(size.w)) {
            return Math.round((size.w / 16) * 9);
        }
        if (typeof size.h === "number" && isFinite(size.h)) {
            return Math.round((size.h / 9) * 16);
        }
        return 0;
    },
};

export function getObjectAttributeByIndex(
    obj: Record<string, unknown> | undefined,
    index: number,
): unknown {
    if (typeof obj != "undefined") {
        let i = 0;
        for (const attr in obj) {
            if (index === i) {
                return obj[attr];
            }
            i++;
        }
        return "";
    } else {
        return "";
    }
}

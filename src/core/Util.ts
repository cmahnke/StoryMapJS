// const debug = true;

export function extend<T extends Record<string, unknown>>(
    dest: T,
    ...sources: (Record<string, unknown> | null | undefined)[]
): T {
    // merge src properties into dest
    sources = sources.filter(Boolean);
    for (let j = 0, len = sources.length, src; j < len; j++) {
        src = sources[j] || {};
        for (const i in src) {
            if (Object.hasOwn(src, i)) {
                (dest as Record<string, unknown>)[i] = src[i];
            }
        }
    }
    return dest;
}

export function convertUnixTime(str: string): string {
    // created for Instagram. It's ISO8601-ish
    // 2013-12-09 01:56:28
    const pattern = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
    const date_parts = str.match(pattern)?.slice(1);
    if (!date_parts) {
        return str;
    }
    const date_array = [];
    for (let i = 0; i < date_parts.length; i++) {
        let val = parseInt(date_parts[i]);
        if (i === 1) {
            val = val - 1;
        } // stupid javascript months
        date_array.push(val);
    }
    const date = new Date(
        date_array[0],
        date_array[1],
        date_array[2],
        date_array[3],
        date_array[4],
        date_array[5],
    );
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const time = month + ", " + day + " " + year;
    return time;
}

export function setData(obj: { data?: unknown }, data: unknown): void {
    obj.data = extend(
        {} as Record<string, unknown>,
        obj.data as Record<string, unknown> | undefined,
        data as Record<string, unknown> | undefined,
    );
    const stored = obj.data as Record<string, unknown>;
    if (stored.uniqueid === "") {
        stored.uniqueid = unique_ID(6);
    }
}

export function mergeData<T extends object>(data_main: T, data_to_merge: object): T {
    const target = data_main as Record<string, unknown>;
    const source = data_to_merge as Record<string, unknown>;
    let x;
    for (x in source) {
        if (Object.prototype.hasOwnProperty.call(source, x)) {
            target[x] = source[x];
        }
    }
    return data_main;
}

/**
 *  Like mergeData, except will only try to copy data that already exists
 *  in data_main
 */
export function updateData<T extends object>(data_main: T, data_to_merge: object): T {
    const target = data_main as Record<string, unknown>;
    const source = data_to_merge as Record<string, unknown>;
    let x;
    for (x in data_main) {
        if (Object.prototype.hasOwnProperty.call(source, x)) {
            target[x] = source[x];
        }
    }
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

export function findArrayNumberByUniqueID(
    id: unknown,
    array: { data: Record<string, unknown> }[],
    prop: string,
): number {
    let _n = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i].data[prop] === id) {
            _n = i;
        }
    }
    return _n;
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
    aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255],
    aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220],
    bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42],
    burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255],
    darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169], darkgreen: [0, 100, 0], darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0],
    darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255],
    gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128],
    green: [0, 128, 0], greenyellow: [173, 255, 47], grey: [128, 128, 128],
    honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92],
    indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140],
    lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50],
    linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128],
    oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35],
    orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185],
    peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221],
    powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153],
    red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45],
    silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205],
    slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250],
    springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140],
    teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71],
    turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179],
    white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0],
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
    r16_9: function (size: { w?: number; h?: number }): number {
        if (size.w !== null && (size.w as unknown as string) !== "") {
            return Math.round((size.w / 16) * 9);
        } else if (size.h !== null && (size.h as unknown as string) !== "") {
            return Math.round((size.h / 9) * 16);
        } else {
            return 0;
        }
    },
};

export function urljoin(base_url: string, path: string): string {
    if (base_url.length && base_url.at(-1) === "/") {
        base_url = base_url.substring(0, base_url.length - 1);
    }
    if (path.length && path[0] === "/") {
        path = path.substring(1);
    }
    const url1 = base_url.split("/");
    const url2 = path.split("/");
    const url3 = [];
    for (let i = 0, l = url1.length; i < l; i++) {
        if (url1[i] === "..") {
            url3.pop();
        } else if (url1[i] === ".") {
            continue;
        } else {
            url3.push(url1[i]);
        }
    }
    for (let i = 0, l = url2.length; i < l; i++) {
        if (url2[i] === "..") {
            url3.pop();
        } else if (url2[i] === ".") {
            continue;
        } else {
            url3.push(url2[i]);
        }
    }
    return url3.join("/");
}

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

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
    square: function (size: { w: number; h: number }): { w: number; h: number } {
        const s = {
            w: 0,
            h: 0,
        };
        if (size.w > size.h && size.h > 0) {
            s.h = size.h;
            s.w = size.h;
        } else {
            s.w = size.w;
            s.h = size.w;
        }
        return s;
    },

    r16_9: function (size: { w?: number; h?: number }): number {
        if (size.w !== null && (size.w as unknown as string) !== "") {
            return Math.round((size.w / 16) * 9);
        } else if (size.h !== null && (size.h as unknown as string) !== "") {
            return Math.round((size.h / 9) * 16);
        } else {
            return 0;
        }
    },
    r4_3: function (size: { w?: number; h?: number }): number {
        if (size.w !== null && (size.w as unknown as string) !== "") {
            return Math.round((size.w / 4) * 3);
        } else if (size.h !== null && (size.h as unknown as string) !== "") {
            return Math.round((size.h / 3) * 4);
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

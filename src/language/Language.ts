interface LanguageEntry {
    buttons?: Record<string, string>;
    messages?: Record<string, string>;
    [key: string]: unknown;
}

const localeModules = import.meta.glob("./locale/*.json", { eager: true }) as Record<
    string,
    { default?: Record<string, unknown> }
>;

const EN: Record<string, unknown> = localeModules["./locale/en.json"]?.default || {};

let Language: LanguageEntry = {};

function getLanguage(code) {
    const lang = JSON.parse(JSON.stringify(localeModules[`./locale/${code}.json`]?.default || {}));
    for (const k in EN) {
        if (lang[k]) {
            if (typeof EN[k] == "object") {
                lang[k] = Object.assign(EN[k] as object, lang[k]);
            }
        } else {
            lang[k] = EN[k];
        }
    }
    return lang;
}

function setLanguage(code) {
    Language = getLanguage(code);
    return Language;
}

export { setLanguage, Language };

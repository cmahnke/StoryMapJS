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

function getLanguage(code: string): Record<string, unknown> {
    const lang = structuredClone(localeModules[`./locale/${code}.json`]?.default || {});
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

/**
 * Switch the active UI language.
 *
 * @param code - A locale code for which a locale file exists (e.g. `"en"`).
 * @returns The language entry that is now active.
 */
function setLanguage(code: string): LanguageEntry {
    Language = getLanguage(code);
    return Language;
}

export { setLanguage, Language };

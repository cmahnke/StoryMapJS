const localeModules = import.meta.glob("./locale/*.json", { eager: true }) as Record<string, any>;

const EN = (localeModules["./locale/en.json"] || {}).default || {};

let Language: any = {}

function getLanguage(code) {
    const lang = JSON.parse(JSON.stringify((localeModules[`./locale/${code}.json`] || {}).default || {}));
    for (const k in EN) {
        if (lang[k]) {
            if (typeof(EN[k]) == 'object') {
                lang[k] = Object.assign(EN[k], lang[k]);
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

export { setLanguage, Language }

const localeModules = import.meta.glob("./locale/*.json", { eager: true }) as Record<string, any>;

let EN = (localeModules["./locale/en.json"] || {}).default || {};

var Language: any = {}

function getLanguage(code) {
    var lang = JSON.parse(JSON.stringify((localeModules[`./locale/${code}.json`] || {}).default || {}));
    for (let k in EN) {
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

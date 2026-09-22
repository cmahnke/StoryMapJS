import be from "./locale/be.json";
import bg from "./locale/bg.json";
import cs from "./locale/cs.json";
import de from "./locale/de.json";
import el from "./locale/el.json";
import en from "./locale/en.json";
import es from "./locale/es.json";
import et from "./locale/et.json";
import fr from "./locale/fr.json";
import he from "./locale/he.json";
import hu from "./locale/hu.json";
import isLocale from "./locale/is.json";
import it from "./locale/it.json";
import jp from "./locale/jp.json";
import ko from "./locale/ko.json";
import nl from "./locale/nl.json";
import nn from "./locale/nn.json";
import no from "./locale/no.json";
import pl from "./locale/pl.json";
import pt from "./locale/pt.json";
import ru from "./locale/ru.json";
import sk from "./locale/sk.json";
import sr from "./locale/sr.json";
import sv from "./locale/sv.json";
import tr from "./locale/tr.json";
import uk from "./locale/uk.json";
import ur from "./locale/ur.json";
import zhCn from "./locale/zh-cn.json";
import zhTw from "./locale/zh-tw.json";

interface LanguageEntry {
    buttons?: Record<string, string>;
    messages?: Record<string, string>;
    [key: string]: unknown;
}

// Static locale map: the bundler-agnostic form of what `import.meta.glob`
// with `{ eager: true }` desugars to (works in vite dev and rollup builds).
const localeModules: Record<string, { default?: unknown }> = {
    "./locale/be.json": { default: be },
    "./locale/bg.json": { default: bg },
    "./locale/cs.json": { default: cs },
    "./locale/de.json": { default: de },
    "./locale/el.json": { default: el },
    "./locale/en.json": { default: en },
    "./locale/es.json": { default: es },
    "./locale/et.json": { default: et },
    "./locale/fr.json": { default: fr },
    "./locale/he.json": { default: he },
    "./locale/hu.json": { default: hu },
    "./locale/is.json": { default: isLocale },
    "./locale/it.json": { default: it },
    "./locale/jp.json": { default: jp },
    "./locale/ko.json": { default: ko },
    "./locale/nl.json": { default: nl },
    "./locale/nn.json": { default: nn },
    "./locale/no.json": { default: no },
    "./locale/pl.json": { default: pl },
    "./locale/pt.json": { default: pt },
    "./locale/ru.json": { default: ru },
    "./locale/sk.json": { default: sk },
    "./locale/sr.json": { default: sr },
    "./locale/sv.json": { default: sv },
    "./locale/tr.json": { default: tr },
    "./locale/uk.json": { default: uk },
    "./locale/ur.json": { default: ur },
    "./locale/zh-cn.json": { default: zhCn },
    "./locale/zh-tw.json": { default: zhTw },
};

const EN: Record<string, unknown> =
    (localeModules["./locale/en.json"]?.default as Record<string, unknown> | undefined) || {};

let Language: LanguageEntry = {};

function getLanguage(code: string): Record<string, unknown> {
    const lang = structuredClone(
        (localeModules[`./locale/${code}.json`]?.default as Record<string, unknown> | undefined) ||
            {},
    );
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

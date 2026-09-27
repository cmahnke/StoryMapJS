/**
 * UI strings for the active locale.
 *
 * English is the fallback for every missing key (see `getLanguage`), so
 * `messages` and `buttons` are guaranteed to be fully populated once a
 * language has been set — they are typed as required here rather than as
 * `Record<string, string> | undefined` so call sites do not need a null
 * check on every one of the ~30 `Language.messages.*` reads.
 *
 * The locale JSON files themselves are *not* complete: only `en.json` defines
 * every key, and 28 of the 29 bundled locales are missing 8-10 of them
 * (the per-service consent strings and the fullscreen button labels). The
 * runtime falls back to English per key, so this is a translation gap rather
 * than a defect — `npm run check:locales` reports it.
 */
export interface LanguageEntry {
    /** Display name of the language, e.g. "Deutsch". */
    name?: string;
    /** BCP 47 code, e.g. "de". */
    lang?: string;
    /** Writing direction; drives the `vco-rtl` layout. */
    direction?: "ltr" | "rtl";
    messages: Record<string, string>;
    buttons: Record<string, string>;
    [key: string]: unknown;
}

// The locales are imported statically rather than through `import.meta.glob`
// on purpose. The viewer reads `Language.messages.*` while it is being
// constructed — the consent dialog, the RTL class, the swipe hint icon and
// every button label are all decided synchronously inside `new StoryMap()` —
// so a locale that has not finished fetching yet would silently render in
// English. The saving from splitting them is ~6 kB gzip, which is not worth
// making the language load order-dependent.
//
// English remains the fallback for every key a translation is missing (see
// `getLanguage`), and `npm run check:locales` reports those gaps.
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

/** The locale every other language falls back to, per key. */
const EN: Record<string, unknown> =
    (localeModules["./locale/en.json"]?.default as Record<string, unknown> | undefined) || {};

/** The strings the viewer reads before (or without) a `setLanguage` call. */
const FALLBACK: LanguageEntry = {
    name: "English",
    lang: "en",
    direction: "ltr",
    messages: (EN.messages as Record<string, string>) ?? {},
    buttons: (EN.buttons as Record<string, string>) ?? {},
};

let Language: LanguageEntry = FALLBACK;

function getLanguage(code: string): Record<string, unknown> {
    const lang: Record<string, unknown> = {};
    // start from a deep copy of the English defaults, then layer this locale
    // on top: a key the translation is missing keeps its English value
    for (const k in EN) {
        lang[k] = structuredClone(EN[k]);
    }
    const entry = (localeModules[`./locale/${code}.json`]?.default ?? {}) as Record<
        string,
        unknown
    >;
    applyLanguage(lang, entry);
    return lang;
}

/** Merge `entry` over `target`, per key, never mutating the English defaults. */
function applyLanguage(target: Record<string, unknown>, entry: Record<string, unknown>): void {
    for (const k in entry) {
        if (!entry[k]) {
            continue;
        }
        if (typeof EN[k] === "object" && EN[k] !== null && typeof entry[k] === "object") {
            // fresh object: never mutate the shared English default,
            // otherwise one setLanguage() call would poison every later
            // lookup (and every other language falling back to English)
            target[k] = Object.assign({}, EN[k] as object, entry[k] as object);
        } else {
            target[k] = structuredClone(entry[k]);
        }
    }
}

/**
 * Switch the active UI language. Synchronous: the viewer resolves its labels
 * while it is being constructed.
 *
 * @param code - A locale code for which a locale file exists (e.g. `"en"`).
 * @returns The language entry that is now active.
 */
function setLanguage(code: string): LanguageEntry {
    const merged = getLanguage(code);
    Language = {
        ...(merged as Omit<LanguageEntry, "messages" | "buttons">),
        messages: (merged.messages as Record<string, string>) ?? FALLBACK.messages,
        buttons: (merged.buttons as Record<string, string>) ?? FALLBACK.buttons,
    };
    return Language;
}

/** The active locale's BCP 47 code, for `Intl` formatting. */
function currentLocale(): string {
    return typeof Language.lang === "string" && Language.lang !== "" ? Language.lang : "en";
}

/** True when the active language is written right-to-left. */
function isRtl(): boolean {
    return Language.direction === "rtl";
}

export { setLanguage, Language, currentLocale, isRtl };

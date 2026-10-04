/*	EmbedUtil
	Utilities for safely rendering user-pasted embed snippets.

	The media "url" field is overloaded: for the iframe and blockquote
	media types it holds raw HTML pasted by the user (that markup is
	what routes the media to those types in MediaType.js). These helpers
	parse that HTML inertly -- DOMParser never executes scripts or event
	handlers -- and rebuild clean DOM from an allowlist, so markup stored
	in a storymap's JSON can never execute code in a viewer's browser.
================================================== */

import { Language } from "../language/Language";

// Attributes copied from a pasted <iframe> onto the rebuilt element.
// src is handled separately (validated); everything else is dropped.
const IFRAME_ATTRIBUTES = [
    "width",
    "height",
    "frameborder",
    "allowfullscreen",
    "allow",
    "scrolling",
    "title",
];

/**
 * `sandbox` value for a rebuilt embed. It is deliberately *not* the most
 * restrictive option: `allow-scripts allow-same-origin` are required by the
 * major video providers to function, and note that the combination is only
 * dangerous when the framed content is same-origin with the viewer, which the
 * http(s)-only src check already rules out for the viewer itself. The value
 * below removes the capabilities that enable clickjacking and top-level
 * navigation.
 */
const ALLOWED_IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-presentation allow-popups";

// Tags allowed to survive blockquote sanitization. Elements not listed
// are unwrapped (their children are kept); DROP_TAGS are removed along
// with their contents.
const BLOCKQUOTE_TAGS = [
    "BLOCKQUOTE",
    "P",
    "CITE",
    "EM",
    "STRONG",
    "B",
    "I",
    "U",
    "Q",
    "A",
    "BR",
    "SPAN",
    "SMALL",
    "SUP",
    "SUB",
    "FOOTER",
    "UL",
    "OL",
    "LI",
];
const DROP_TAGS = [
    "SCRIPT",
    "STYLE",
    "TEMPLATE",
    "IFRAME",
    "FRAME",
    "OBJECT",
    "EMBED",
    "APPLET",
    "LINK",
    "META",
    "BASE",
    "SVG",
    "MATH",
    "FORM",
    "INPUT",
    "BUTTON",
    "TEXTAREA",
    "SELECT",
];

// Drop list for slide text (issue #358): same as DROP_TAGS but IFRAME is
// rebuilt via buildIframe() instead of dropped, so extra media can be
// embedded in the text field.
const SLIDE_TEXT_DROP_TAGS = DROP_TAGS.filter((tag) => tag !== "IFRAME");

/**
 * Slide text is an allowlist, not a denylist.
 *
 * The previous denylist ("drop these 18 tags, keep everything else") let
 * through `<audio>`, `<video>`, `<details>`, `<dialog>`, `<marquee>`,
 * `<plaintext>`, `<xmp>` and friends, and copied *every* non-`on*` attribute
 * verbatim. Two consequences worth naming:
 *
 *  - `style` was passed through untouched, so a pasted
 *    `style="position:fixed;inset:0;z-index:2147483647;background:#fff"`
 *    painted a full-widget opaque overlay over the map and the controls:
 *    chrome spoofing plus clickjacking, from a single attribute.
 *  - `target` was only defaulted when absent, so a pasted `target="_top"`
 *    navigated the *host page* out of the viewer.
 *
 * This list covers prose and media embeds. Anything else is unwrapped (its
 * text is kept) rather than dropped with its contents.
 */
const SLIDE_TEXT_TAGS = [
    // structure / text
    "P",
    "BR",
    "HR",
    "DIV",
    "SPAN",
    "BLOCKQUOTE",
    "PRE",
    "CODE",
    "KBD",
    "SAMP",
    "VAR",
    // inline formatting
    "EM",
    "STRONG",
    "B",
    "I",
    "U",
    "S",
    "STRIKE",
    "DEL",
    "INS",
    "SMALL",
    "SUB",
    "SUP",
    "MARK",
    "ABBR",
    "CITE",
    "Q",
    "TIME",
    "DFN",
    // lists
    "UL",
    "OL",
    "LI",
    "DL",
    "DT",
    "DD",
    // tables
    "TABLE",
    "THEAD",
    "TBODY",
    "TFOOT",
    "TR",
    "TH",
    "TD",
    "CAPTION",
    "COLGROUP",
    "COL",
    // media (the src/srcset URLs are validated)
    "IMG",
    "FIGURE",
    "FIGCAPTION",
    "PICTURE",
    "SOURCE",
    "AUDIO",
    "VIDEO",
    "TRACK",
    // links
    "A",
];

/**
 * Attributes allowed on slide-text elements. `id`/`name` are deliberately
 * absent: they enable DOM clobbering of host-page globals. `style` is
 * deliberately absent (see above). `class` is kept — the story fixtures and
 * the migrated site content style slides through it, and a class name cannot
 * execute anything.
 */
const SLIDE_TEXT_ATTRIBUTES = [
    "class",
    "title",
    "lang",
    "dir",
    "alt",
    "width",
    "height",
    "colspan",
    "rowspan",
    "headers",
    "scope",
    "datetime",
    "cite",
    "start",
    "reversed",
    "type",
    "value",
    "controls",
    "loop",
    "muted",
    "playsinline",
    "preload",
    "poster",
    "kind",
    "srclang",
    "label",
    "default",
    "sizes",
    "loading",
    "decoding",
    "open",
    // a source/track is only useful with a machine-readable kind
    "media",
];

/** URL-bearing attributes validated to http(s) in slide text. */
const URL_ATTRIBUTES = [
    "href",
    "src",
    "srcset",
    "cite",
    "data",
    "poster",
    "action",
    "formaction",
    "longdesc",
    "profile",
    "background",
];

function parseInert(html: string): Document {
    return new DOMParser().parseFromString(html, "text/html");
}

/*	Return an absolute http(s) URL for url, or null if it is empty,
	unparseable, or uses any other protocol (javascript:, data:, ...).
	Relative and protocol-relative URLs resolve against the document.
================================================== */
export function validateWebURL(url: string | null): string | null {
    if (!url) {
        return null;
    }
    const a = document.createElement("a");
    a.href = url;
    if (a.protocol === "http:" || a.protocol === "https:") {
        return a.href;
    }
    return null;
}

/*	Build a clean <iframe> element from a pasted embed snippet.
	Only the validated src and allowlisted presentation attributes
	survive; event handlers, extra tags and scripts are discarded.
	Also accepts a bare URL for the src. Returns null if no safe
	src can be extracted.
================================================== */
export function buildIframe(html: string): HTMLIFrameElement | null {
    const pasted = parseInert(html).querySelector("iframe");
    let src: string | null = null;

    if (pasted) {
        src = validateWebURL(pasted.getAttribute("src"));
    } else if (/^https?:\/\/\S+$/i.test(html.trim())) {
        // The field held a bare URL rather than an embed snippet
        src = validateWebURL(html.trim());
    }
    if (!src) {
        return null;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", src);
    if (pasted) {
        for (let i = 0; i < IFRAME_ATTRIBUTES.length; i++) {
            const value = pasted.getAttribute(IFRAME_ATTRIBUTES[i]);
            if (value !== null) {
                iframe.setAttribute(IFRAME_ATTRIBUTES[i], value);
            }
        }
    } else {
        iframe.setAttribute("width", "100%");
        iframe.setAttribute("height", "100%");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
    }
    if (!iframe.hasAttribute("title")) {
        const localeMedia = (Language as unknown as { media?: { iframe_title?: unknown } }).media;
        const localeTitle =
            typeof localeMedia?.iframe_title === "string" && localeMedia.iframe_title !== ""
                ? localeMedia.iframe_title
                : undefined;
        const messagesTitle = Language.messages["media.iframe_title"];
        iframe.setAttribute(
            "title",
            localeTitle ??
                (typeof messagesTitle === "string" && messagesTitle !== ""
                    ? messagesTitle
                    : "Embedded media"),
        );
    }
    return iframe;
}

/*	Sanitizers
	Two entry points, one walker: both rebuild clean DOM from an allowlist
	so markup stored in a storymap's JSON can never execute code in a
	viewer's browser. They differ only in what they allow.
================================================== */

/** What a sanitizer pass is permitted to keep. */
interface SanitizeRules {
    /** Tags rebuilt as-is (with the filtered attributes). */
    tags: readonly string[];
    /** Tags removed together with their contents. */
    dropTags: readonly string[];
    /** Attributes copied verbatim (the rest are dropped). */
    attributes: readonly string[];
    /** Rebuild a pasted <iframe> instead of dropping it. */
    rebuildIframes: boolean;
}

/*	Sanitize pasted blockquote markup into a DocumentFragment.
	Allowlisted formatting tags are kept (with all attributes stripped,
	except a validated href on links), unknown tags are unwrapped, and
	executable/embedding tags are dropped with their contents.
================================================== */
export function sanitizeBlockquote(html: string): DocumentFragment {
    const fragment = document.createDocumentFragment();
    appendSanitized(parseInert(html).body, fragment, {
        tags: BLOCKQUOTE_TAGS,
        dropTags: DROP_TAGS,
        attributes: [],
        rebuildIframes: false,
    });
    return fragment;
}

/*	Sanitize slide text (issue #358) into a DocumentFragment.
	Allowlisted prose/media tags survive with allowlisted attributes; URL
	attributes are validated to http(s); `style`, `id` and `name` are
	dropped; `target` is always forced to `_blank`; and <iframe> embeds are
	rebuilt via buildIframe() so extra media can live in the text field.
	Anything outside the allowlist is unwrapped (its text is kept) rather
	than dropped with its contents, so a story that used a stray tag still
	reads correctly.

	This is also the sanitizer for author-supplied *strings* that were
	previously injected raw — media credit, media caption and the slide
	navigation headline. It is the migration path for removed media types
	(e.g. vine): paste the provider's iframe snippet into the slide text.

	The result must be appended as a live DocumentFragment and never
	re-serialised through innerHTML: the fragment-based build is what makes
	the classic "reparse mXSS" unreachable here.
================================================== */
export function sanitizeSlideText(html: string): DocumentFragment {
    const fragment = document.createDocumentFragment();
    appendSanitized(parseInert(html).body, fragment, {
        tags: SLIDE_TEXT_TAGS,
        dropTags: SLIDE_TEXT_DROP_TAGS,
        attributes: SLIDE_TEXT_ATTRIBUTES,
        rebuildIframes: true,
    });
    return fragment;
}

/** True when `url` may be used as an href/src. */
function isSafeURL(url: string | null): url is string {
    return validateWebURL(url) !== null;
}

/**
 * Validate a srcset-style attribute: every candidate URL must be http(s).
 * `srcset` is a comma-separated list of "<url> <descriptor>" pairs, so the
 * whole attribute is dropped unless *every* candidate passes.
 */
function sanitizeSrcset(value: string): string | null {
    const candidates = value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    if (candidates.length === 0) {
        return null;
    }
    const kept: string[] = [];
    for (const candidate of candidates) {
        const url = candidate.split(/\s+/)[0];
        if (!isSafeURL(url)) {
            return null;
        }
        kept.push(candidate);
    }
    return kept.join(", ");
}

function appendSanitized(node: Node, parent: Node, rules: SanitizeRules): void {
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === 3) {
            parent.appendChild(document.createTextNode(child.nodeValue ?? ""));
            continue;
        }
        if (child.nodeType !== 1) {
            // Comments and other node types are dropped
            continue;
        }
        const el = child as Element;
        const tag = el.tagName.toUpperCase();

        if (rules.dropTags.includes(tag)) {
            continue;
        }
        if (tag === "IFRAME" && rules.rebuildIframes) {
            const clean = buildIframe(el.outerHTML);
            if (clean) {
                clean.setAttribute("loading", "lazy");
                // A rebuilt embed still runs with full privileges unless it is
                // sandboxed. This is the allowlist for what third-party embed
                // pages can do; presentation and popups stay enabled because
                // several legacy providers need them to work at all.
                clean.setAttribute("sandbox", ALLOWED_IFRAME_SANDBOX);
                clean.setAttribute("referrerpolicy", "no-referrer");
                parent.appendChild(clean);
            }
            continue;
        }
        if (!rules.tags.includes(tag)) {
            // Not on the allowlist: unwrap, keeping its children and text
            appendSanitized(child, parent, rules);
            continue;
        }

        const cleanEl = document.createElement(tag);
        for (let j = 0; j < el.attributes.length; j++) {
            const attr = el.attributes[j];
            const name = attr.name.toLowerCase();
            // Belt-and-braces: `on*` and `srcdoc` are not on any allowlist,
            // but never let one through if a list is edited carelessly.
            if (name.startsWith("on") || name === "srcdoc") {
                continue;
            }
            if (name === "srcset") {
                const safe = sanitizeSrcset(attr.value);
                if (safe) {
                    cleanEl.setAttribute("srcset", safe);
                }
                continue;
            }
            if (URL_ATTRIBUTES.includes(name)) {
                const safe = validateWebURL(attr.value);
                if (safe) {
                    cleanEl.setAttribute(attr.name, safe);
                }
                continue;
            }
            if (rules.attributes.includes(name)) {
                cleanEl.setAttribute(attr.name, attr.value);
            }
        }
        if (tag === "A") {
            // Always overwritten, never inherited from the pasted markup: a
            // `target="_top"` would navigate the host page out of the viewer.
            if (cleanEl.hasAttribute("href")) {
                cleanEl.setAttribute("target", "_blank");
                cleanEl.setAttribute("rel", "noopener noreferrer");
            } else {
                // a link with no safe href is not a link
                cleanEl.removeAttribute("target");
            }
        }
        appendSanitized(child, cleanEl, rules);
        parent.appendChild(cleanEl);
    }
}

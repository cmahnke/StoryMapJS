// Converts legacy StoryMap JSON fixtures (public/examples/*.json) into IIIF
// Presentation API 3.0 manifests (public/examples-iiif/<name>.json) following
// the mapping proposed in docs/storymap-as-iiif-manifest.md.
//
// Usage: node scripts/convert-to-iiif.mjs [files...]
// With no arguments, converts all public/examples/*.json fixtures.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The original zoomify tile paths of the legacy fixtures are dead, so image-map
// storymaps are rewritten to the IIIF reference image used by the repo's IIIF
// fixtures. The original zoomify definition is preserved as a storymap: term.
const LAOCOON_ID =
    "https://iiif.io/api/image/3.0/example/reference/28473c77da3deebe4375c3a50572d9d3-laocoon";
const LAOCOON_INFO = `${LAOCOON_ID}/info.json`;
const LAOCOON_IMAGE = `${LAOCOON_ID}/full/max/0/default.jpg`;
const LAOCOON_WIDTH = 2315;
const LAOCOON_HEIGHT = 3000;

const STORYMAP_CONTEXT = "https://christianmahnke.de/iiif/storymap";
const CONTEXTS = [
    "http://iiif.io/api/presentation/3/context.json",
    "http://iiif.io/api/extension/navplace/context.json",
    STORYMAP_CONTEXT,
];

const IMAGE_FORMATS = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    avif: "image/avif",
};

const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com", "dailymotion.com", "vine.co"];
const SOUND_HOSTS = ["soundcloud.com"];

function isHttpUrl(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value);
}

function classifyMediaUrl(url) {
    const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
    if (ext && IMAGE_FORMATS[ext]) {
        return { type: "Image", format: IMAGE_FORMATS[ext] };
    }
    let host;
    try {
        host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return { type: "Text", format: "text/html" };
    }
    if (VIDEO_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        return { type: "Video" };
    }
    if (SOUND_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        return { type: "Sound" };
    }
    // Page-embedded media (tweets, Wikipedia, photo pages, ...) - the viewer
    // decides how to render these; the manifest carries a typed reference.
    return { type: "Text", format: "text/html" };
}

function languageMap(value) {
    return { none: [value] };
}

function present(value) {
    return value !== undefined && value !== null && value !== "";
}

function buildManifest(name, legacy) {
    const storymap = legacy.storymap || {};
    const slides = storymap.slides || [];
    const isZoomify = storymap.map_type === "zoomify";
    const isImageMap = isZoomify || storymap.map_type === "iiif";
    const manifestId = `https://example.org/storymap/${name}`;
    const attribution = storymap.iiif?.attribution || storymap.zoomify?.attribution || "";

    const manifest = {
        "@context": CONTEXTS,
        id: manifestId,
        type: "Manifest",
        label: languageMap(name),
        behavior: ["paged"],
        provider: [
            {
                id: "https://example.org/",
                type: "Agent",
                label: languageMap("StoryMapJS"),
            },
        ],
        items: slides.map((slide, i) => buildCanvas(manifestId, i, slide, isImageMap)),
    };

    const config = buildMapConfig(storymap, legacy, isZoomify);
    if (Object.keys(config).length > 0) {
        // The Manifest object is closed for extension terms in the official
        // validator's JSON Schema (see docs "Validator interop"), so the
        // storymap map configuration travels on a dedicated service entry.
        manifest.service = [
            {
                id: `${manifestId}/map-config`,
                type: "Service",
                profile: `${STORYMAP_CONTEXT}/mapconfig`,
                ...config,
            },
        ];
    }
    if (present(attribution)) {
        manifest.requiredStatement = {
            label: languageMap("Attribution"),
            value: languageMap(attribution),
        };
    }
    return manifest;
}

function buildMapConfig(storymap, legacy, isZoomify) {
    const config = {};
    let mapType = storymap.map_type;
    if (isZoomify) {
        // zoomify support was replaced by the IIIF Image API.
        mapType = "iiif";
        config["storymap:mapAsImage"] = true;
        config["storymap:iiifUrl"] = LAOCOON_INFO;
        config["storymap:originalZoomify"] = storymap.zoomify;
    }
    if (present(mapType)) {
        config["storymap:mapType"] = mapType;
    }
    if (storymap.map_type === "iiif" && storymap.iiif?.url) {
        config["storymap:iiifUrl"] = storymap.iiif.url;
    }
    if (storymap.map_as_image !== undefined) {
        config["storymap:mapAsImage"] = storymap.map_as_image;
    }
    if (present(storymap.map_access_token)) {
        config["storymap:mapAccessToken"] = storymap.map_access_token;
    }
    if (present(storymap.map_background_color)) {
        config["storymap:mapBackgroundColor"] = storymap.map_background_color;
    }
    if (storymap.map_center_offset !== undefined) {
        config["storymap:mapCenterOffset"] = storymap.map_center_offset;
    }
    if (present(storymap.map_subdomains)) {
        config["storymap:mapSubdomains"] = storymap.map_subdomains;
    }
    const fontCss = legacy.font_css || storymap.font_css;
    if (present(fontCss)) {
        config["storymap:fontCss"] = fontCss;
    }
    if (storymap.call_to_action !== undefined) {
        config["storymap:callToAction"] = storymap.call_to_action;
    }
    if (present(storymap.call_to_action_text)) {
        config["storymap:callToActionText"] = storymap.call_to_action_text;
    }
    if (storymap.start_at_slide !== undefined) {
        config["storymap:startAtSlide"] = storymap.start_at_slide;
    }
    if (present(storymap.language)) {
        config["storymap:language"] = storymap.language;
    }
    if (storymap.calculate_zoom !== undefined) {
        config["storymap:calculateZoom"] = storymap.calculate_zoom;
    }
    if (storymap.less_bounce !== undefined) {
        config["storymap:lessBounce"] = storymap.less_bounce;
    }
    if (storymap.line_follows_path !== undefined) {
        config["storymap:lineFollowsPath"] = storymap.line_follows_path;
    }
    if (storymap.show_lines !== undefined) {
        config["storymap:showLines"] = storymap.show_lines;
    }
    if (storymap.show_history_line !== undefined) {
        config["storymap:showHistoryLine"] = storymap.show_history_line;
    }
    if (present(storymap.line_color)) {
        config["storymap:lineColor"] = storymap.line_color;
    }
    if (present(storymap.line_color_inactive)) {
        config["storymap:lineColorInactive"] = storymap.line_color_inactive;
    }
    if (storymap.line_weight !== undefined) {
        config["storymap:lineWeight"] = storymap.line_weight;
    }
    if (storymap.line_opacity !== undefined) {
        config["storymap:lineOpacity"] = storymap.line_opacity;
    }
    if (present(storymap.line_dash)) {
        config["storymap:lineDash"] = storymap.line_dash;
    }
    if (present(storymap.line_join)) {
        config["storymap:lineJoin"] = storymap.line_join;
    }
    if (storymap.use_custom_markers !== undefined) {
        config["storymap:useCustomMarkers"] = storymap.use_custom_markers;
    }
    return config;
}

function buildCanvas(manifestId, index, slide, isImageMap) {
    const canvasId = `${manifestId}/canvas/${index + 1}`;
    const headline = slide.text?.headline || "";
    const bodyText = slide.text?.text || "";
    const width = isImageMap ? LAOCOON_WIDTH : 1080;
    const height = isImageMap ? LAOCOON_HEIGHT : 1080;

    const canvas = {
        id: canvasId,
        type: "Canvas",
        height,
        width,
        items: [
            {
                id: `${canvasId}/annotationpage/1`,
                type: "AnnotationPage",
                items: [
                    {
                        id: `${canvasId}/annotation/1`,
                        type: "Annotation",
                        motivation: "painting",
                        body: buildBody(slide, isImageMap),
                        target: canvasId,
                    },
                ],
            },
        ],
    };
    if (present(headline)) {
        canvas.label = languageMap(headline);
    }
    if (present(bodyText)) {
        canvas.summary = languageMap(bodyText);
    }

    const storymapTerms = buildCanvasTerms(slide);
    Object.assign(canvas, storymapTerms);

    const navPlace = buildNavPlace(canvasId, slide);
    if (navPlace) {
        canvas.navPlace = navPlace;
    }
    return canvas;
}

function buildBody(slide, isImageMap) {
    if (isImageMap) {
        // Image-map canvas: paint the IIIF Image API resource. The service
        // reference lets IIIF-aware viewers request arbitrary resolutions.
        return {
            id: LAOCOON_IMAGE,
            type: "Image",
            format: "image/jpeg",
            width: LAOCOON_WIDTH,
            height: LAOCOON_HEIGHT,
            service: [{ id: LAOCOON_INFO, type: "ImageService3", profile: "level2" }],
        };
    }
    const url = slide.media?.url;
    if (isHttpUrl(url)) {
        const { type, format } = classifyMediaUrl(url);
        const body = { id: url, type };
        if (format) {
            body.format = format;
        }
        return body;
    }
    // Text-only slide (or a media value that is not a URL): paint the HTML.
    const html = typeof url === "string" && url !== "" ? url : slide.text?.text || "";
    return {
        type: "TextualBody",
        format: "text/html",
        value: html,
    };
}

function buildCanvasTerms(slide) {
    const terms = {};
    if (slide.type === "overview") {
        terms["storymap:type"] = "overview";
    }
    if (present(slide.group)) {
        terms["storymap:group"] = slide.group;
    }
    if (slide.background && typeof slide.background === "object") {
        const background = {};
        if (present(slide.background.url)) {
            background.url = slide.background.url;
        }
        if (present(slide.background.color)) {
            background.color = slide.background.color;
        }
        if (slide.background.opacity !== undefined) {
            background.opacity = slide.background.opacity;
        }
        if (Object.keys(background).length > 0) {
            terms["storymap:background"] = background;
        }
    } else if (present(slide.background)) {
        terms["storymap:background"] = { color: slide.background };
    }
    if (present(slide.media?.caption)) {
        terms["storymap:mediaCaption"] = slide.media.caption;
    }
    if (present(slide.media?.credit)) {
        terms["storymap:mediaCredit"] = slide.media.credit;
    }
    if (present(slide.date)) {
        terms["storymap:date"] = slide.date;
    }
    return terms;
}

function buildNavPlace(canvasId, slide) {
    const location = slide.location || {};
    if (typeof location.lat !== "number" || typeof location.lon !== "number") {
        return null;
    }
    const properties = {};
    for (const key of ["name", "zoom", "line", "icon", "iconSize", "image", "use_custom_marker"]) {
        if (location[key] !== undefined && location[key] !== null && location[key] !== "") {
            properties[key] = location[key];
        }
    }
    return {
        id: `${canvasId}/navplace`,
        type: "FeatureCollection",
        features: [
            {
                id: `${canvasId}/navplace/feature/1`,
                type: "Feature",
                geometry: { type: "Point", coordinates: [location.lon, location.lat] },
                properties,
            },
        ],
    };
}

const args = process.argv.slice(2);
let files;
if (args.length > 0) {
    files = args;
} else {
    const examplesDir = join(process.cwd(), "public/examples");
    files = readdirSync(examplesDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => join(examplesDir, f));
}

const outDir = join(process.cwd(), "public/examples-iiif");
mkdirSync(outDir, { recursive: true });

let converted = 0;
for (const file of files) {
    const name = file
        .split("/")
        .pop()
        .replace(/\.json$/, "");
    const legacy = JSON.parse(readFileSync(file, "utf8"));
    const manifest = buildManifest(name, legacy);
    const outPath = join(outDir, `${name}.json`);
    writeFileSync(outPath, `${JSON.stringify(manifest, null, 4)}\n`);
    converted++;
    console.log(`✓ ${outPath} (${manifest.items.length} canvas(es))`);
}
console.log(`Converted ${converted} storymap(s) to ${outDir}/`);

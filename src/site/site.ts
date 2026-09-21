/* Example cards for the landing page. Curated, non-`issue-*` fixtures from
 * public/examples plus remote showcase examples; each card opens the storymap
 * in the built embed player. The page chrome is site.css (compiled from
 * src/scss/site/site.scss by the sitegen vite plugin) — this script only adds
 * the cards and the demo height adjustment. */

interface ExampleEntry {
    /** Local fixture name (public/examples/<id>.json), or a remote storymap JSON url */
    id?: string;
    url?: string;
    /** Thumbnail name under thumbs/ (defaults to the fixture id) */
    thumb?: string;
    title: string;
    kind: string;
}

const EXAMPLES: ExampleEntry[] = [
    { id: "katrina", title: "Hurricane Katrina", kind: "Map" },
    { id: "population", title: "US Population Shifts", kind: "Map" },
    { id: "marktwain", title: "Mark Twain's Travels", kind: "Map" },
    { id: "seurat", title: "A Sunday on La Grande Jatte", kind: "Gigapixel" },
    { id: "iiif-wellcome", title: "Wellcome Collection (IIIF)", kind: "IIIF" },
    { id: "president", title: "A Month in the Life of President Obama", kind: "Map" },
    // remote showcase examples, rendered by the embed player
    {
        url: "https://s3.amazonaws.com/uploads.knightlab.com/storymapjs/a1a349b51799ee49e96bed10cc235e7f/garden-of-earthly-delights/published.json",
        thumb: "bosch-garden",
        title: "The Garden of Earthly Delights – Hieronymus Bosch",
        kind: "Knight Lab example",
    },
    {
        url: "https://uploads.knightlab.com/storymapjs/3df56e350378e51781746bfb2a2ea428/test/published.json",
        thumb: "southern-literary-trail",
        title: "Southern Literary Trail",
        kind: "Georgia Humanities",
    },
];

function card(ex: ExampleEntry): HTMLAnchorElement {
    const target = ex.url ?? "examples/" + ex.id + ".json";
    const thumbId = ex.thumb ?? ex.id ?? "";

    const a = document.createElement("a");
    a.className = "card";
    a.href = `./embed/index.html?url=${encodeURIComponent(target)}`;

    const header = document.createElement("span");
    header.className = "header-image";
    const media = document.createElement("span");
    media.className = "header-image-background bw";
    // build-time screenshots (tasks/build-thumbnails.mjs); fall back to a
    // deterministic two-tone gradient when a thumb is missing
    media.style.backgroundImage = `url('./thumbs/${thumbId}.jpg'), linear-gradient(135deg, #b8b8b8, #646464)`;
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", ex.title);
    header.append(media);

    const body = document.createElement("article");
    body.className = "card-content";
    const title = document.createElement("h3");
    title.textContent = ex.title;
    body.append(title);

    const footer = document.createElement("footer");
    footer.textContent = ex.kind;

    a.append(header, body, footer);
    return a;
}

const target = document.getElementById("examples-cards");
if (target) {
    target.classList.add("cards-link");
    for (const ex of EXAMPLES) {
        target.append(card(ex));
    }
}

// the original sizes the homepage demo to the window height minus 20px
const frame = document.getElementById("demo-frame") as HTMLIFrameElement | null;
if (frame) {
    const size = () => {
        frame.style.height = window.innerHeight - 20 + "px";
    };
    size();
    window.addEventListener("resize", size);
}

/* Example cards for the landing page. Curated, non-`issue-*` fixtures from
 * public/examples; each card opens the fixture in the built embed player.
 * The page chrome is site.css (compiled from src/scss/site/site.scss by
 * tasks/build-docs.mjs) — this script only adds the cards and the demo
 * height adjustment. */

const EXAMPLES: Array<{ id: string; title: string; kind: string }> = [
    { id: "katrina", title: "Hurricane Katrina", kind: "Map" },
    { id: "population", title: "US Population Shifts", kind: "Map" },
    { id: "marktwain", title: "Mark Twain's Travels", kind: "Map" },
    { id: "nightwatch", title: "The Night Watch", kind: "Gigapixel" },
    { id: "seurat", title: "A Sunday on La Grande Jatte", kind: "Gigapixel" },
    { id: "courbet", title: "The Painter's Studio", kind: "Gigapixel" },
    { id: "jansteen", title: "Jan Steen", kind: "Gigapixel" },
    { id: "iiif-wellcome", title: "Wellcome Collection (IIIF)", kind: "IIIF" },
    { id: "president", title: "A Month in the Life of President Obama", kind: "Map" },
];

function card(ex: { id: string; title: string; kind: string }): HTMLAnchorElement {
    const a = document.createElement("a");
    a.className = "card";
    a.href = `./embed/index.html?url=${encodeURIComponent("examples/" + ex.id + ".json")}`;

    const header = document.createElement("span");
    header.className = "header-image";
    const media = document.createElement("span");
    media.className = "header-image-background bw";
    // build-time screenshots (tasks/build-thumbnails.mjs); fall back to a
    // deterministic two-tone gradient when a thumb is missing
    media.style.backgroundImage = `url('./thumbs/${ex.id}.jpg'), linear-gradient(135deg, #b8b8b8, #646464)`;
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

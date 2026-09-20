/* Example cards for the landing page. Curated, non-`issue-*` fixtures from
 * public/examples; each card opens the fixture in the built embed player.
 * The page chrome itself is site.css (compiled from src/scss/site/site.scss
 * by tasks/build-docs.mjs) — this script only adds the cards. */
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
    a.className = "sm-card";
    a.href = `./embed/index.html?url=${encodeURIComponent("examples/" + ex.id + ".json")}`;
    // deterministic two-tone gradient instead of remote thumbnails
    let hash = 0;
    for (let i = 0; i < ex.id.length; i++) {
        hash = (hash * 31 + ex.id.charCodeAt(i)) >>> 0;
    }
    const hue = hash % 360;
    const media = document.createElement("span");
    media.className = "sm-card-media";
    media.style.backgroundImage = `linear-gradient(135deg, hsl(${hue} 30% 30%), hsl(${(hue + 40) % 360} 45% 18%))`;
    const body = document.createElement("span");
    body.className = "sm-card-body";
    const title = document.createElement("h3");
    title.className = "sm-card-title";
    title.textContent = ex.title;
    const kind = document.createElement("p");
    kind.className = "sm-card-kind";
    kind.textContent = ex.kind;
    body.append(title, kind);
    a.append(media, body);
    return a;
}

const target = document.getElementById("examples-cards");
if (target) {
    for (const ex of EXAMPLES) {
        target.append(card(ex));
    }
}

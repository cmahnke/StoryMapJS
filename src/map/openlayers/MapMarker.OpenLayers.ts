import Overlay from "ol/Overlay";
import { fromLonLat } from "ol/proj";
import type { Map as OlMap } from "ol";
import MapMarker from "../MapMarker";
import { clearTimer } from "../../core/Util";
import { sanitizeSlideText } from "../../media/EmbedUtil";
import type { LatLngLiteral, MapMarkerData, StorymapOptions } from "../../types";

/*	MapMarker.OpenLayers
	Produces a marker for OpenLayers maps.

	Default and image markers are rendered as HTML overlays so the
	existing .vco-mapmarker styles apply unchanged.
================================================= */

/** The resolved marker presentation: `marker.*` over `location.*`. */
interface MarkerPresentation {
    icon?: string;
    iconSize?: number[];
    image?: string;
    label?: string;
    popup: boolean;
    audioBadge: boolean;
    useCustomMarker?: boolean;
}

export default class OpenLayersMapMarker extends MapMarker {
    declare "_overlay": Overlay;
    declare "_onMarkerClickBound": ((e: Event) => void) | null;
    /** marker.popup: the active marker opens its card when clicked. */
    declare "_popup_enabled": boolean;
    /** marker.audioBadge: flag a slide that has narration or audio media. */
    declare "_audio_badge": boolean;
    /**
     * The popup card while it is open. `declare` fields are undefined until
     * assigned, so every read below is a truthiness check, never `=== null`,
     * and there is no constructor to initialise them: `MapMarker`'s own
     * constructor already runs `_initLayout()` → `_createMarker()`, which
     * assigns the flags, and initialising afterwards would wipe them.
     */
    declare "_popup_el": HTMLElement | null;
    /** Escape-to-close, detached in dispose(). */
    declare "_onPopupKeyBound": ((e: KeyboardEvent) => void) | null;
    /** Mirrors `active()`, as a flag rather than a method reference. */
    declare "_is_active": boolean;

    /*	Create Marker
    ================================================== */
    /**
     * The merged marker presentation: `marker.*` wins, `location.*` is the
     * legacy spelling and still works (docs/plans/iiif-media-tours.md §2).
     * `location` also stays the carrier of geography, so lat/lon are read
     * from it alone — presentation never moves a marker.
     */
    _presentation(d?: MapMarkerData): MarkerPresentation {
        const location = (d?.location ?? {}) as Record<string, unknown>;
        const marker = (d?.marker ?? {}) as Record<string, unknown>;
        return {
            icon: (marker.icon as string | undefined) ?? (location.icon as string | undefined),
            iconSize:
                (marker.iconSize as number[] | undefined) ??
                (location.iconSize as number[] | undefined),
            image: (marker.image as string | undefined) ?? (location.image as string | undefined),
            // in a manifest the label arrives as the navPlace property `name`
            label: (marker.label as string | undefined) ?? (location.name as string | undefined),
            popup: Boolean(marker.popup ?? location.popup),
            audioBadge: Boolean(marker.audioBadge ?? location.audioBadge),
            useCustomMarker: location.use_custom_marker as boolean | undefined,
        };
    }

    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void {
        const location = d?.location;
        if (location && typeof location.lat == "number" && typeof location.lon == "number") {
            this.data.real_marker = true;
            const presentation = this._presentation(d);
            this._popup_enabled = presentation.popup;
            this._audio_badge = presentation.audioBadge;
            const use_custom_marker = o?.use_custom_markers || presentation.useCustomMarker;
            if (use_custom_marker && presentation.icon) {
                this._custom_icon = {
                    url: presentation.icon,
                    size: presentation.iconSize || [48, 48],
                    anchor: this._customIconAnchor(presentation.iconSize),
                };
            } else if (use_custom_marker && presentation.image) {
                this._custom_image_icon = presentation.image;
            }

            this._marker = this._createMarkerElement(d as MapMarkerData, o);
            // kept as a field so dispose() can detach it; the inline arrow
            // had no other handle
            this._onMarkerClickBound = (e: Event) => {
                e.stopPropagation();
                // the active marker's card toggles instead of navigating:
                // the slide is already showing, and a popup that also moved
                // the story would be impossible to dismiss
                if (this._popup_enabled && this._is_active) {
                    this._togglePopup();
                    return;
                }
                this._onMarkerClick(e);
            };
            this._marker.addEventListener("click", this._onMarkerClickBound);
            // Escape closes the card; the listener is on the document and is
            // detached in dispose(), so a torn-down map leaves nothing behind
            this._onPopupKeyBound = (e: KeyboardEvent) => {
                if (e.key === "Escape") this._closePopup();
            };
            document.addEventListener("keydown", this._onPopupKeyBound);
        }
    }

    _createMarkerElement(d: MapMarkerData, o?: StorymapOptions): HTMLDivElement {
        const el = document.createElement("div");
        el.title = d.text && d.text.headline ? d.text.headline : "";

        if (this._custom_icon) {
            // custom icon markers render only their image (like the
            // original Leaflet L.icon): no vco-mapmarker class, otherwise
            // the default pin glyph (::before) would show next to the image
            el.className = "vco-mapmarker-custom";
            const img = document.createElement("img");
            img.src = this._custom_icon.url;
            img.style.width = this._custom_icon.size[0] + "px";
            img.style.height = "auto";
            el.appendChild(img);
            el.style.marginLeft = -this._custom_icon.anchor[0] + "px";
            el.style.marginTop = -this._custom_icon.anchor[1] + "px";
        } else if (this._custom_image_icon) {
            el.className = "vco-mapmarker-image-icon";
            const img = document.createElement("img");
            img.src = this._custom_image_icon;
            img.style.width = "48px";
            img.style.height = "auto";
            el.appendChild(img);
            el.style.marginLeft = "-24px";
            el.style.marginTop = "-48px";
        } else {
            el.className = "vco-mapmarker " + this.media_icon_class;
        }
        return el;
    }

    /**
     * The marker's {lat, lon}, or null when it is a non-georeferenced marker
     * (an overview slide, or a slide with only an image region). `_createMarker`
     * already established this for a real marker, but returning it from one
     * place means the type checker can see it too.
     */
    latLon(): LatLngLiteral | null {
        const location = this.data.location;
        if (!this.data.real_marker || !location) {
            return null;
        }
        if (typeof location.lat !== "number" || typeof location.lon !== "number") {
            return null;
        }
        return { lat: location.lat, lon: location.lon };
    }

    _addTo(m: OlMap): void {
        const latlon = this.latLon();
        if (latlon && this._marker) {
            // Image-space maps (IIIF) use EPSG:4326 with raw image pixel coordinates
            const is_image_space = m.getView().getProjection().getCode() === "EPSG:4326";
            const position = is_image_space
                ? [latlon.lon, latlon.lat]
                : fromLonLat([latlon.lon, latlon.lat]);

            // Default pins anchor on their tip: OL's inline styles override
            // any CSS top/left, so the alignment is done here — bottom-center
            // positioning plus a 1px offset lands the pin tip (the bottommost
            // glyph pixel, measured against the coordinate via
            // getPixelFromCoordinate) exactly on the coordinate, so the route
            // lines meet the markers' tips.
            const is_default_pin = !this._custom_icon && !this._custom_image_icon;
            this._overlay = new Overlay({
                element: this._marker,
                position: position,
                stopEvent: false,
                ...(is_default_pin ? { positioning: "bottom-center", offset: [0, 1] } : {}),
            });
            m.addOverlay(this._overlay);
        }
    }

    _removeFrom(m: OlMap): void {
        if (this.data.real_marker && this._overlay) {
            m.removeOverlay(this._overlay);
        }
    }

    /**
     * Terminal teardown: detach the click listener and drop the overlay and
     * element. Called by the map's dispose(); the marker must not be used
     * afterwards.
     */
    /*  Marker popup and audio badge
    ================================================== */

    /**
     * Toggle the popup card for the *active* marker. Inactive markers keep
     * their original behaviour — a click navigates — so a popup never
     * swallows navigation on a map full of pins.
     *
     * The card is a DOM element parented to the marker element and positioned
     * with CSS, which is how it survives a move to the vector renderer
     * (docs/plans/issue-159-vector-markers.md): only the anchor is the
     * marker's, and that is `latLon()`.
     */
    _togglePopup(): void {
        if (!this._popup_enabled) return;
        if (this._popup_el) {
            this._closePopup();
            return;
        }
        const el = this._createPopupElement();
        if (el === null) return;
        this._marker.appendChild(el);
        this._popup_el = el;
        this._marker.classList.add("vco-mapmarker-popup-open");
    }

    _closePopup(): void {
        if (!this._popup_el) return;
        this._popup_el.parentNode?.removeChild(this._popup_el);
        this._popup_el = null;
        this._marker?.classList?.remove("vco-mapmarker-popup-open");
    }

    get popupOpen(): boolean {
        return Boolean(this._popup_el);
    }

    /**
     * Headline, a sanitized excerpt, the media thumb and an audio control.
     * Every piece of text goes through `sanitizeSlideText` — a slide's text
     * is untrusted input and a marker card is no different (the stored-XSS
     * audit made that lesson once; a label is attacker-controlled text like
     * any other).
     */
    _createPopupElement(): HTMLElement | null {
        const data = this.data as unknown as {
            text?: { headline?: string; text?: string };
            media?: { thumb?: string | null; url?: string | null; caption?: string | null };
        };
        const card = document.createElement("div");
        card.className = "vco-marker-popup";
        // a dialog-ish card, not a modal: no focus trap, Escape closes
        card.setAttribute("role", "group");
        card.setAttribute("aria-label", data.text?.headline ?? "Slide details");

        const close = document.createElement("button");
        close.type = "button";
        close.className = "vco-marker-popup-close";
        close.setAttribute("aria-label", "Close");
        close.textContent = "\u00d7";
        close.addEventListener("click", (e) => {
            e.stopPropagation();
            this._closePopup();
        });
        card.appendChild(close);

        if (data.media?.thumb) {
            const img = document.createElement("img");
            img.className = "vco-marker-popup-thumb";
            img.src = data.media.thumb;
            img.alt = data.media.caption ?? "";
            img.loading = "lazy";
            card.appendChild(img);
        }

        const body = document.createElement("div");
        body.className = "vco-marker-popup-body";
        if (data.text?.headline) {
            const h = document.createElement("h3");
            h.className = "vco-marker-popup-headline";
            h.appendChild(sanitizeSlideText(data.text.headline));
            body.appendChild(h);
        }
        if (data.text?.text) {
            const p = document.createElement("p");
            p.className = "vco-marker-popup-excerpt";
            p.appendChild(sanitizeSlideText(data.text.text));
            body.appendChild(p);
        }
        card.appendChild(body);
        return card;
    }

    /**
     * A small indicator on markers whose slide has narration or audio media
     * (the Micrio affordance). Recomputed on activation, because a slide's
     * media may only be known once it is resolved.
     */
    _updateAudioBadge(): void {
        if (!this._audio_badge) return;
        const media = (this.data as unknown as { media?: { mediatype?: { type?: string } } }).media;
        const kind = media?.mediatype?.type;
        const audible = kind === "audio" || kind === "video" || !!this.data.narration;
        this._marker.classList.toggle("vco-mapmarker-has-audio", audible);
    }

    dispose(): void {
        const marker = this._marker as unknown as HTMLElement | null;
        this._closePopup();
        if (this._onPopupKeyBound) {
            document.removeEventListener("keydown", this._onPopupKeyBound);
            this._onPopupKeyBound = null;
        }
        if (this._onMarkerClickBound) {
            marker?.removeEventListener?.("click", this._onMarkerClickBound);
            this._onMarkerClickBound = null;
        }
        if (this._overlay) {
            this._overlay.setElement(undefined);
            this._overlay = null as unknown as Overlay;
        }
        // via the parent so a non-DOM stand-in (a test double) is tolerated
        marker?.parentNode?.removeChild(marker);
        this._marker = null as unknown as HTMLDivElement;
    }

    _active(a: boolean): void {
        this._is_active = a;
        if (!a) {
            // navigating away closes the card: a popup belongs to its stop
            this._closePopup();
        } else {
            this._updateAudioBadge();
        }
        if (this.data.media && this.data.media.mediatype) {
            this.media_icon_class = "vco-mapmarker-icon vco-icon-" + this.data.media.mediatype.type;
        } else {
            this.media_icon_class = "vco-mapmarker-icon vco-icon-plaintext";
        }
        if (this.data.real_marker) {
            if (this._custom_icon) {
                // custom icons look the same active or not (as in the
                // original Leaflet version): only the stacking changes
                if (!a) {
                    clearTimer(this.timer);
                }
                this._marker.style.zIndex = a ? "1000" : "";
            } else if (this._custom_image_icon) {
                if (a) {
                    this._marker.classList.remove("vco-mapmarker-image-icon");
                    this._marker.classList.add("vco-mapmarker-image-icon-active");
                    this._marker.style.zIndex = "1000";
                } else {
                    clearTimer(this.timer);
                    this._marker.classList.remove("vco-mapmarker-image-icon-active");
                    this._marker.classList.add("vco-mapmarker-image-icon");
                    this._marker.style.zIndex = "";
                }
            } else if (a) {
                this._marker.classList.remove("vco-mapmarker");
                this._marker.classList.add("vco-mapmarker-active");
                this._marker.style.zIndex = "1000";
            } else {
                clearTimer(this.timer);
                this._marker.classList.remove("vco-mapmarker-active");
                this._marker.classList.add("vco-mapmarker");
                this._marker.style.zIndex = "";
            }
            // place-name label on the active marker (issue #243)
            const old_label = this._marker.querySelector(".vco-marker-label");
            if (old_label) {
                old_label.remove();
            }
            if (a && this.options.marker_labels && this.data.text?.headline) {
                const label = document.createElement("div");
                label.className = "vco-marker-label";
                label.textContent = this.data.text.headline;
                this._marker.appendChild(label);
            }
            // refresh media icon class
            const icon_el = this._marker.querySelector(".vco-mapmarker-icon");
            if (icon_el) {
                icon_el.className = this.media_icon_class;
            } else if (!this._custom_icon && !this._custom_image_icon) {
                this._marker.className =
                    (a ? "vco-mapmarker-active " : "vco-mapmarker ") + this.media_icon_class;
            }
        }
    }

    _customIconAnchor(size?: number[]): number[] {
        if (size) {
            return [size[0] * 0.5, size[1]];
        } else {
            return [24, 48];
        }
    }

    _location(): LatLngLiteral | null {
        return this.latLon();
    }
}

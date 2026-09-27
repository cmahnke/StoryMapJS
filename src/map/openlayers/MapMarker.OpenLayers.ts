import Overlay from "ol/Overlay";
import { fromLonLat } from "ol/proj";
import type { Map as OlMap } from "ol";
import MapMarker from "../MapMarker";
import { clearTimer } from "../../core/Util";
import type { LatLngLiteral, MapMarkerData, StorymapOptions } from "../../types";

/*	MapMarker.OpenLayers
	Produces a marker for OpenLayers maps.

	Default and image markers are rendered as HTML overlays so the
	existing .vco-mapmarker styles apply unchanged.
================================================= */

export default class OpenLayersMapMarker extends MapMarker {
    declare "_overlay": Overlay;

    /*	Create Marker
    ================================================== */
    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void {
        const location = d?.location;
        if (location && typeof location.lat == "number" && typeof location.lon == "number") {
            this.data.real_marker = true;
            const use_custom_marker = o?.use_custom_markers || location.use_custom_marker;
            if (use_custom_marker && location.icon) {
                this._custom_icon = {
                    url: location.icon,
                    size: location.iconSize || [48, 48],
                    anchor: this._customIconAnchor(location.iconSize),
                };
            } else if (use_custom_marker && location.image) {
                this._custom_image_icon = location.image;
            }

            this._marker = this._createMarkerElement(d as MapMarkerData, o);
            this._marker.addEventListener("click", (e) => {
                e.stopPropagation();
                this._onMarkerClick(e);
            });
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

    _active(a: boolean): void {
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

import Overlay from "ol/Overlay";
import { fromLonLat } from "ol/proj";
import MapMarker from "../MapMarker";

/*	MapMarker.OpenLayers
	Produces a marker for OpenLayers maps.

	Default and image markers are rendered as HTML overlays so the
	existing .vco-mapmarker styles apply unchanged.
================================================== */

export default class OpenLayersMapMarker extends MapMarker {
    declare data: any;
    declare "_custom_icon": any;
    declare "_icon": any;
    declare "_custom_image_icon": any;
    declare "_marker": any;
    declare "_overlay": any;
    declare "media_icon_class": any;
    declare "timer": any;
    declare "on": any;
    declare "fire": any;
    declare "_el": any;

    /*	Create Marker
    ================================================== */
    _createMarker(d, o) {
        if (d.location && typeof(d.location.lat) == 'number' && typeof(d.location.lon) == 'number') {
            this.data.real_marker = true;
            const use_custom_marker = o.use_custom_markers || d.location.use_custom_marker;
            if (use_custom_marker && d.location.icon) {
                this._custom_icon = {
                    url: d.location.icon,
                    size: d.location.iconSize || [48, 48],
                    anchor: this._customIconAnchor(d.location.iconSize)
                };
            } else if (use_custom_marker && d.location.image) {
                this._custom_image_icon = d.location.image;
            }

            this._marker = this._createMarkerElement(d, o);
            this._marker.addEventListener("click", (e) => {
                e.stopPropagation();
                this._onMarkerClick(e);
            });
        }
    }

    _createMarkerElement(d, o) {
        const el = document.createElement("div");
        el.className = "vco-mapmarker " + this.media_icon_class;
        el.title = d.text && d.text.headline ? d.text.headline : "";

        if (this._custom_icon) {
            const img = document.createElement("img");
            img.src = this._custom_icon.url;
            img.style.width = this._custom_icon.size[0] + "px";
            img.style.height = "auto";
            el.appendChild(img);
            el.style.marginLeft = -this._custom_icon.anchor[0] + "px";
            el.style.marginTop = -this._custom_icon.anchor[1] + "px";
        } else if (this._custom_image_icon) {
            const img = document.createElement("img");
            img.src = this._custom_image_icon;
            img.style.width = "48px";
            img.style.height = "auto";
            el.appendChild(img);
            el.style.marginLeft = "-24px";
            el.style.marginTop = "-48px";
        }
        return el;
    }

    _addTo(m) {
        if (this.data.real_marker) {
            const d = this.data;
            // Image-space maps (IIIF) use EPSG:4326 with raw image pixel coordinates
            const is_image_space = m.getView().getProjection().getCode() === "EPSG:4326";
            const position = is_image_space
                ? [d.location.lon, d.location.lat]
                : fromLonLat([d.location.lon, d.location.lat]);

            this._overlay = new Overlay({
                element: this._marker,
                position: position,
                stopEvent: false,
            });
            m.addOverlay(this._overlay);
        }
    }

    _removeFrom(m) {
        if (this.data.real_marker && this._overlay) {
            m.removeOverlay(this._overlay);
        }
    }

    _createPopup(d, o) {
        // popups intentionally not implemented (matching Leaflet version)
    }

    _active(a) {
        if (this.data.media && this.data.media.mediatype) {
            this.media_icon_class = "vco-mapmarker-icon vco-icon-" + this.data.media.mediatype.type;
        } else {
            this.media_icon_class = "vco-mapmarker-icon vco-icon-plaintext";
        }
        if (this.data.real_marker) {
            if (a) {
                this._marker.classList.remove("vco-mapmarker");
                this._marker.classList.add("vco-mapmarker-active");
                this._marker.style.zIndex = "1000";
            } else {
                clearTimeout(this.timer);
                this._marker.classList.remove("vco-mapmarker-active");
                this._marker.classList.add("vco-mapmarker");
                this._marker.style.zIndex = "";
            }
            // refresh media icon class
            const icon_el = this._marker.querySelector(".vco-mapmarker-icon");
            if (icon_el) {
                icon_el.className = this.media_icon_class;
            } else if (!this._custom_icon && !this._custom_image_icon) {
                this._marker.className = (a ? "vco-mapmarker-active " : "vco-mapmarker ") + this.media_icon_class;
            }
        }
    }

    _customIconAnchor(size) {
        if (size) {
            return [size[0] * 0.5, size[1]];
        } else {
            return [24, 48];
        }
    }

    _location() {
        if (this.data.real_marker) {
            return { lat: this.data.location.lat, lon: this.data.location.lon };
        } else {
            return {};
        }
    }
}

import OlMap from "ol/Map";
import View from "ol/View";
import type { Control } from "ol/control";
import type { Interaction } from "ol/interaction";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import VectorTileLayer from "ol/layer/VectorTile";
import { XYZ, OSM, IIIF } from "ol/source";
import VectorSource from "ol/source/Vector";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { Style, Stroke } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import type Projection from "ol/proj/Projection";
import { boundingExtent, getIntersection } from "ol/extent";
import type { Extent } from "ol/extent";
import TileGrid from "ol/tilegrid/TileGrid";
import type ImageTile from "ol/ImageTile";
import OverviewMap from "ol/control/OverviewMap";
import { defaults as interactionDefaults } from "ol/interaction";
import { applyStyle } from "ol-mapbox-style";
import IIIFInfo, { type ImageInformationResponse } from "ol/format/IIIFInfo";

import "ol/ol.css";

import Map from "../Map";
import OpenLayersMapMarker from "./MapMarker.OpenLayers";
import { padCroppedZoomifyTile } from "./zoomifyTiles";
import type { LinePoint, ViewToOptions } from "../types";
import type { LatLngLiteral, StorymapSlide, StorymapSlideLocation } from "../../types";
import { consentManagerOf, consentMessage, type ConsentManager } from "../../storymap/Consent";

/*	Map.OpenLayers
	Creates a Map using OpenLayers
================================================= */

const MAX_ZOOM = 19;

/**
 * Zoom ladder for image-space maps (issue #465): rung 0 shows any image fully
 * zoomed out, finer rungs reach sub-pixel detail. It keeps view zooms,
 * marker zooms and tile loading on one consistent ladder (tile enqueueing
 * silently drops tiles otherwise).
 */
const IMAGE_RESOLUTIONS = Array.from({ length: 25 }, (_, i) => 2 ** (16 - i));

export default class OpenLayers extends Map {
    declare "_map": OlMap;
    declare "_tile_layer": TileLayer;
    declare "_line": VectorLayer;
    declare "_line_active": VectorLayer;
    declare "_tile_layer_mini": TileLayer | null;
    declare "_mini_map": OverviewMap;
    declare "_markers": OpenLayersMapMarker[];
    /** App-level stacked overlays (see the `overlays` option) */
    declare "_overlay_layers": TileLayer[];
    /** rAF handle of the running active-line draw animation */
    declare "_line_animation": number | null;

    /*	Create the Map
	================================================== */
    _createMap(): void {
        const is_image_map = this.options.map_type === "iiif" && this.options.map_as_image;

        // Caller-supplied OpenLayers options: controls/interactions replace the
        // defaults, view merges over the computed default, other options pass through
        const user_map_options = this.options.map_options ?? {};
        const { element: _element, view: user_view, ...passthrough } = user_map_options;
        const user_view_options = (user_view ?? {}) as Record<string, unknown>;

        // bbox limitation (map_bbox): the view center is constrained to the
        // box (constrainOnlyCenter) — a hard extent constraint would pin the
        // center and resolution whenever the viewport fills or aspect-clips
        // the box, undoing the panel offset and spreading the markers out
        // (probed: a 640x800 viewport aspect-clips a wide bbox, so the
        // strict constraint locks the zoom and the route overflows). Image-
        // space maps use raw pixel coordinates.
        const bbox_extent = this._bboxExtent();

        this._map = new OlMap({
            ...passthrough,
            target: this._el.map,
            controls: (user_map_options.controls as Control[]) ?? [],
            interactions: (user_map_options.interactions as Interaction[]) ?? [],
            view: new View({
                projection: is_image_map ? "EPSG:4326" : "EPSG:3857",
                center: [0, 0],
                zoom: 0,
                minZoom: 0,
                maxZoom: is_image_map ? IMAGE_RESOLUTIONS.length - 1 : MAX_ZOOM,
                // image maps live outside the 4326 world: opt out of the
                // global-projection constraints (they cap resolution at
                // fit-the-world and clamp the center to [-90, 90]) and use
                // the image zoom ladder instead of the default one
                // (issue #465)
                ...(is_image_map ? { multiWorld: true, resolutions: IMAGE_RESOLUTIONS } : {}),
                // legacy zoomify: the image pyramid needs zooms where the
                // world is smaller than the viewport (the original renderer
                // showed the painting at ~487px in a 1280px window)
                ...(this.options.map_type === "zoomify" ? { multiWorld: true } : {}),
                ...(bbox_extent ? { extent: bbox_extent, constrainOnlyCenter: true } : {}),
                ...user_view_options,
            }),
        });

        this._map.on("loadend", () => {
            this._onMapLoaded(undefined);
        });

        // keep the marker overlays above the layer canvases: OL pins the
        // overlay container at z-index 0 (inline), and during pan/zoom
        // animations the composited canvases can transiently paint over it —
        // the marker icons flicker
        const overlay_container = this._el.map.querySelector(".ol-overlaycontainer");
        if (overlay_container) {
            (overlay_container as HTMLElement).style.zIndex = "1";
        }

        // Create Tile Layer
        // Tile Layer — GDPR consent mode defers it until the visitor allows
        // map tiles (the consent bar renders over the map)
        const consent = consentManagerOf(this.options);
        const tile_service = consentMessage("consent_service_tiles", "map tiles");
        if (this.options.consent_required && consent) {
            if (consent.isGranted(tile_service)) {
                this._addTileLayer();
            } else if (!consent.isDenied(tile_service)) {
                void this._requestTileConsent(consent, tile_service);
            }
            // denied → the map renders with background color and markers only
        } else {
            this._addTileLayer();
        }

        // Create Overall Connection Line
        this._line = this._createLine();
        this._line.setStyle(this._lineStyle(this.options.line_color_inactive));
        this._addLineToMap(this._line);
        this._line.setZIndex(10);
        this._line.setOpacity(this.options.line_opacity);

        // Create Active Line
        this._line_active = this._createLine();
        this._line_active.setStyle(this._lineStyle(this.options.line_color));
        this._addLineToMap(this._line_active);
        this._line_active.setZIndex(11);
        this._line_active.setOpacity(1);

        if (this.options.map_as_image) {
            this._line_active.setVisible(false);
            this._line.setVisible(false);
        }

        // Stacked raster overlays (base tiles 1.., below the route lines)
        this._overlay_layers = [];
        this._buildOverlays();

        // Native interactions (pan/zoom), no scroll zoom by default
        const interactions = interactionDefaults({ mouseWheelZoom: false });
        interactions.forEach((i) => this._map.addInteraction(i));

        // Attribution
        this._updateAttribution();
    }

    /** Extra attribution fragments (e.g. overlay credits), always listed last. */
    declare "_extra_attributions": string[];

    /**
     * Append extra attribution fragments and refresh the line. Hosts with
     * custom layers use this instead of rewriting `.vco-map-attribution`.
     */
    setExtraAttributions(parts: string[]): void {
        this._extra_attributions = [...parts];
        this._updateAttribution();
    }

    /**
     * (Re)render the attribution line for the current map type. Called at
     * creation and on every `map_type` switch, which previously left the
     * initial text stale.
     */
    _updateAttribution(): void {
        const extras = this._extra_attributions ?? [];
        const parts = [this._getAttribution(this.options.map_type), ...extras]
            .filter(Boolean)
            .join(" | ");
        let el = this._el.map.querySelector(".vco-map-attribution") as HTMLElement | null;
        if (!el) {
            this._el.map.insertAdjacentHTML("beforeend", `<div class="vco-map-attribution"></div>`);
            el = this._el.map.querySelector(".vco-map-attribution") as HTMLElement | null;
        }
        if (el) {
            el.innerHTML = parts;
        }
    }

    _getAttribution(map_type: string): string {
        const parts = [
            "<a href='https://storymap.knightlab.com/' target='_blank' class='vco-knightlab-brand'><span>&#x25a0;</span> StoryMapJS</a>",
        ];
        if (map_type === "osm" || map_type === "" || map_type.startsWith("osm")) {
            parts.push(
                "© <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
            );
        }
        if (this.options.attribution) {
            parts.push(this.options.attribution);
        }
        return parts.join(" | ");
    }

    /*	Create Tile Layer
	================================================== */
    /**
     * Create the tile layer and register its load handler. Deferred until
     * the visitor allows map tiles in consent mode.
     */
    _addTileLayer(): void {
        this._tile_layer = this._createTileLayer(this.options.map_type);
        // explicit stack order (base tiles 0, overlays 1.., route lines
        // 10/11): the switch path re-adds the tile layer last, which used
        // to bury the route lines under fresh tiles
        this._tile_layer.setZIndex(0);
        this._map.addLayer(this._tile_layer);
    }

    /**
     * Ask for tile consent, then attach the layers if allowed.
     */
    async _requestTileConsent(consent: ConsentManager, tile_service: string) {
        if (await consent.request(tile_service, "", this._el.map)) {
            this._onTilesAllowed();
        }
    }

    /*	Stacked overlays (the `overlays` option)
    ================================================== */
    /**
     * (Re)build the stacked raster overlays from the `overlays` option.
     * Overlays sit above the base tiles (z 1..n) and below the route lines
     * (z 10/11); every entry accepts any `map_type` value plus declarative
     * presentation, so hosts no longer capture and patch layer objects.
     */
    _buildOverlays(): void {
        for (const layer of this._overlay_layers) {
            this._map.removeLayer(layer);
        }
        this._overlay_layers = [];
        const consent = consentManagerOf(this.options);
        const tile_service = consentMessage("consent_service_tiles", "map tiles");
        if (
            this.options.consent_required &&
            consent &&
            !consent.isGranted(tile_service)
        ) {
            return;
        }
        const overlays = this.options.overlays ?? [];
        overlays.forEach((entry, i) => {
            const layer = this._createTileLayer(entry.map_type);
            layer.setZIndex(1 + i);
            if (entry.opacity !== undefined) {
                layer.setOpacity(entry.opacity);
            }
            if (entry.visible !== undefined) {
                layer.setVisible(entry.visible);
            }
            if (entry.className) {
                // OpenLayers exposes no className setter; overriding the
                // per-frame getClassName hook paints this layer into its own
                // container div, which blend modes can then target
                const className = entry.className;
                layer.getClassName = () => className;
            }
            if (entry.extent) {
                const extent = this._lonLatBboxToExtent(entry.extent);
                if (extent) {
                    layer.setExtent(extent);
                }
            }
            this._map.addLayer(layer);
            this._overlay_layers.push(layer);
            this._paintOverlayBlend(entry);
        });
        this._syncOverlayAttributions();
    }

    /**
     * Convert a lon/lat clip box to view units. Only meaningful on
     * mercator maps; image-space maps (iiif/zoomify) and malformed
     * boxes yield null (no constraint).
     */
    _lonLatBboxToExtent(bbox: [number, number, number, number]): Extent | null {
        if (
            !Array.isArray(bbox) ||
            bbox.length !== 4 ||
            bbox.some((n) => typeof n !== "number" || !isFinite(n))
        ) {
            return null;
        }
        if (this._map.getView().getProjection().getCode() !== "EPSG:3857") {
            return null;
        }
        return boundingExtent([fromLonLat([bbox[0], bbox[1]]), fromLonLat([bbox[2], bbox[3]])]);
    }

    /**
     * Apply an overlay's blend mode to its layer container. The container
     * div only exists once the layer has rendered, so retry on later
     * frames (bounded: rendering settles within a frame or two of any
     * add/visibility change).
     */
    _paintOverlayBlend(
        entry: { className?: string; blendMode?: string },
        retries = 60,
    ): void {
        if (!entry.blendMode || !entry.className) {
            return;
        }
        // OpenLayers replaces the container class wholesale (it is not
        // merged with the default), so match every safe token instead of
        // assuming a lone class name
        const tokens = entry.className.split(/\s+/).filter((token) => /^[\w-]+$/.test(token));
        if (tokens.length === 0) {
            return;
        }
        const el = this._el.map.querySelector("." + tokens.join("."));
        if (el) {
            (el as HTMLElement).style.mixBlendMode = entry.blendMode;
            return;
        }
        // the container div only exists once the layer has rendered
        if (retries > 0) {
            requestAnimationFrame(() => this._paintOverlayBlend(entry, retries - 1));
        }
    }

    /** Refresh the attribution line with the visible overlays' credits. */
    _syncOverlayAttributions(): void {
        const overlays = this.options.overlays ?? [];
        const parts: string[] = [];
        this._overlay_layers.forEach((layer, i) => {
            const credit = overlays[i]?.attribution;
            if (credit && layer.getVisible()) {
                parts.push(credit);
            }
        });
        this.setExtraAttributions(parts);
    }

    /** Number of stacked overlay layers (see the `overlays` option). */
    getOverlayCount(): number {
        return this._overlay_layers.length;
    }

    /** Show or hide a stacked overlay by index (re-syncs attribution). */
    setOverlayVisible(index: number, visible: boolean): void {
        const layer = this._overlay_layers[index];
        if (!layer) {
            return;
        }
        layer.setVisible(visible);
        const entry = (this.options.overlays ?? [])[index];
        if (entry && visible) {
            this._paintOverlayBlend(entry);
        }
        this._syncOverlayAttributions();
    }

    /** Set a stacked overlay's opacity by index. */
    setOverlayOpacity(index: number, opacity: number): void {
        this._overlay_layers[index]?.setOpacity(opacity);
    }

    /**
     * Map tiles were allowed: attach the main tile layer, create the
     * minimap's deferred layer if it was withheld, then re-fit.
     */
    _onTilesAllowed(): void {
        this._addTileLayer();
        this._buildOverlays();
        if (!this._tile_layer_mini) {
            this._tile_layer_mini = this._createTileLayer(this.options.map_type);
        }
        if (this._mini_map && this._tile_layer_mini) {
            const overview = this._mini_map.getOverviewMap();
            if (!overview.getLayers().getLength()) {
                overview.addLayer(this._tile_layer_mini);
            }
        }
        if (this._markers.length > 0 && this.current_marker < this._markers.length) {
            const marker = this._markers[this.current_marker];
            if (marker.data.type === "overview") {
                this._markerOverview();
            } else if (this._hasLocation(marker.data)) {
                this._fitView(this._map, [[marker.data.location.lon, marker.data.location.lat]], 0);
            }
        }
    }

    /**
     * Legacy zoomify image pyramid: the levels (image size per level), the
     * max zoom and the mercator bounds the image occupies (stretched from
     * the world's top-left corner, the original renderer's mapping).
     */
    _zoomifyPyramid(): {
        sizes: Array<[number, number]>;
        maxZoom: number;
        extent: number[];
        tileGrid: TileGrid;
    } | null {
        const zoomify = this.options.zoomify;
        if (!zoomify || typeof zoomify !== "object" || !zoomify.path) return null;
        const width = zoomify.width ?? 600;
        const height = zoomify.height ?? 600;

        // pyramid levels: halve the image size until ≤ 256
        const sizes: Array<[number, number]> = [];
        let w = width;
        let h = height;
        while (w > 256 || h > 256) {
            sizes.push([w, h]);
            w = Math.floor(w / 2);
            h = Math.floor(h / 2);
        }
        sizes.push([w, h]);
        sizes.reverse(); // [0] = smallest level

        const maxZoom = sizes.length - 1;
        const worldPx = 256 * 2 ** maxZoom;
        const extent = [
            -20037508.342789244,
            20037508.342789244 - (height / worldPx) * 40075016.68557849,
            -20037508.342789244 + (width / worldPx) * 40075016.68557849,
            20037508.342789244,
        ];
        // tile grid over the image's mercator bounds: the tiles keep their
        // natural size (the legacy renderer clamped edge tiles the same way).
        // One extra level below zoom 0 lets the overview show the complete
        // image (the smallest pyramid tile downscaled)
        const tileGrid = new TileGrid({
            extent,
            origin: [extent[0], extent[3]],
            resolutions: Array.from(
                { length: maxZoom + 2 },
                (_, i) => 40075016.68557849 / (256 * 2 ** (i - 1)),
            ),
            tileSize: 256,
        });
        return { sizes, maxZoom, extent, tileGrid };
    }

    /**
     * The zoomify overview state: the best-fit pyramid level for a map
     * window (the level whose image, times the tolerance, fits the window —
     * the legacy `_getBestFitZoom`) and the image's mercator center.
     */
    _zoomifyOverview(mapSize: [number, number]): { zoom: number; center: number[] } | null {
        const pyramid = this._zoomifyPyramid();
        if (!pyramid) return null;
        const tolerance = (this.options.zoomify as { tolerance?: number })?.tolerance ?? 0.9;
        let zoom = pyramid.maxZoom;
        while (zoom > 0) {
            const size = pyramid.sizes[zoom];
            if (
                size[0] * tolerance < (mapSize[0] || 1) &&
                size[1] * tolerance < (mapSize[1] || 1)
            ) {
                break;
            }
            zoom--;
        }
        const center = [
            (pyramid.extent[0] + pyramid.extent[2]) / 2,
            (pyramid.extent[1] + pyramid.extent[3]) / 2,
        ];
        return { zoom, center };
    }

    _createTileLayer(map_type: string): TileLayer {
        // issue #473: custom OpenLayers tile layer/source factory first —
        // the base layer, overlays, minimap and runtime map_type switches
        // all funnel through here, so one check covers them
        const factory = this.options.tile_source_factory;
        if (typeof factory === "function") {
            const custom = factory(map_type, {
                options: this.options,
                createDefault: () => this._createDefaultTileLayer(map_type),
            });
            if (custom) {
                // layers (TileLayer and siblings exposing getSource) pass
                // through; a bare Source is wrapped in a TileLayer
                if (
                    typeof (custom as unknown as { getSource?: unknown }).getSource ===
                    "function"
                ) {
                    return custom as TileLayer;
                }
                // any tile-capable Source satisfies the TileLayer generic
                return new TileLayer({ source: custom as unknown as XYZ });
            }
        }
        return this._createDefaultTileLayer(map_type);
    }

    _createDefaultTileLayer(map_type: string): TileLayer {
        const _map_type_arr = map_type.split(":");

        switch (_map_type_arr[0]) {
            case "mapbox": {
                if (_map_type_arr.length > 2) {
                    // mapbox://styles/<user>/<style> URLs render via the
                    // Mapbox styles tiles API (requires map_access_token)
                    const this_mapbox_map = _map_type_arr[2].slice("//styles/".length);
                    const mapbox_url =
                        "https://api.mapbox.com/styles/v1/" +
                        this_mapbox_map +
                        "/tiles/256/{z}/{x}/{y}@2x?access_token=" +
                        this.options.map_access_token;
                    return new TileLayer({
                        source: new XYZ({
                            url: mapbox_url,
                            attributions: [],
                            crossOrigin: "anonymous",
                        }),
                    });
                }
                console.error(
                    "StoryMapJS: legacy 'mapbox:<style>' map types are no longer supported (the Mapbox v4 tile API was retired); use 'mapbox://styles/<user>/<style>' with map_access_token instead.",
                );
                return new TileLayer({ source: new OSM({ attributions: [] }) });
            }

            case "stadia": {
                let style_url = "osm:standard";
                if (_map_type_arr.length > 1) {
                    style_url = _map_type_arr.slice(1).join(":");
                    if (this.options.map_access_token) {
                        style_url = `${style_url}?api_key=${this.options.map_access_token}`;
                    }
                }
                return new TileLayer({
                    source: new XYZ({
                        url: `https://tiles.stadiamaps.com/tiles/${style_url}/{z}/{x}/{y}.png`,
                        attributions: [],
                    }),
                });
            }

            case "stamen":
                this._map.getViewport().style.backgroundColor = "#FFFFFF";
                return new TileLayer({
                    source: new XYZ({
                        url: "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}.png",
                        attributions: [],
                    }),
                });

            case "iiif": {
                const iiif_layer: TileLayer = new TileLayer();
                fetch(this.options.iiif.url)
                    .then((r) => r.json())
                    .then((info: unknown) => {
                        // parse the service description into proper tile
                        // source options (base URL, version, tiling) so tile
                        // URLs are valid and the grid matches the service
                        const parsed = new IIIFInfo(
                            info as ImageInformationResponse,
                        ).getTileSourceOptions();
                        const fallback = info as { width?: number; height?: number };
                        if (
                            typeof fallback.width !== "number" ||
                            typeof fallback.height !== "number"
                        ) {
                            console.error(
                                "IIIF info.json is missing width/height:",
                                this.options.iiif.url,
                            );
                            return;
                        }
                        const source = new IIIF({
                            ...(parsed ?? {}),
                            projection: "EPSG:4326",
                            size: [fallback.width, fallback.height],
                            crossOrigin: "anonymous",
                            attributions: this.options.iiif.attribution || [],
                        });
                        iiif_layer.setSource(source);
                        if (source.getState() === "ready") {
                            this._markerOverview();
                        } else {
                            source.once("change", () => {
                                if (source.getState() === "ready") {
                                    this._markerOverview();
                                }
                            });
                        }
                    })
                    .catch((err) =>
                        console.error(
                            "IIIF info.json could not be loaded:",
                            this.options.iiif.url,
                            err?.stack || err,
                        ),
                    );
                return iiif_layer;
            }

            case "http":
            case "https":
                // style JSON URLs (e.g. https://tiles.openfreemap.org/styles/bright)
                // render a vector style, tile template URLs stay raster
                if (!map_type.includes("{z}")) {
                    return this._createVectorStyleLayer(map_type);
                }
                return new TileLayer({
                    source: new XYZ({ url: map_type, attributions: [], crossOrigin: "anonymous" }),
                });

            case "ch-watercolor":
                return new TileLayer({
                    source: new XYZ({
                        url: "https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg",
                        attributions: [],
                        maxZoom: 16,
                    }),
                });

            case "zoomify": {
                // Legacy zoomify support: the image pyramid tiles are placed
                // over the image's mercator bounds (the original renderer's
                // mapping). Locations use native lat/lon. The tile grid's
                // ladder is shifted one level down so the overview can show
                // the complete image.
                const pyramid = this._zoomifyPyramid();
                if (!pyramid) {
                    console.error(
                        "StoryMapJS: map_type 'zoomify' needs a zoomify image pyramid (path, width, height) in the storymap data.",
                    );
                    return new TileLayer({ source: new OSM({ attributions: [] }) });
                }
                const path = (this.options.zoomify as { path?: string }).path ?? "";
                const { sizes, maxZoom: pyramidMaxZoom } = pyramid;
                const gridX = (z: number) => Math.ceil(sizes[z][0] / 256);
                const gridY = (z: number) => Math.ceil(sizes[z][1] / 256);

                return new TileLayer({
                    source: new XYZ({
                        tileGrid: pyramid.tileGrid,
                        crossOrigin: "anonymous",
                        attributions: [],
                        tileUrlFunction: (tile: number[]) => {
                            const [tileZ, x, y] = tile;
                            // the ladder is shifted one level down: mercator
                            // zoom z serves the pyramid level max(0, z - 1)
                            const z = Math.max(0, tileZ - 1);
                            if (z > pyramidMaxZoom) return undefined;
                            if (x < 0 || x >= gridX(z) || y < 0 || y >= gridY(z)) {
                                return undefined;
                            }
                            // TileGroup index: the running tile number ÷ 256
                            let num = 0;
                            for (let zz = 0; zz < z; zz++) {
                                num += gridX(zz) * gridY(zz);
                            }
                            num += y * gridX(z) + x;
                            return `${path}TileGroup${Math.floor(num / 256)}/${z}-${x}-${y}.jpg`;
                        },
                        // Zoomify edge tiles are cropped to the image bounds
                        // (e.g. a 256x19 bottom strip); OpenLayers draws the
                        // loaded image over the whole 256x256 tile box, which
                        // stretched those strips across the cell (the smeared
                        // bottom in the Bosch overview, stretched right/bottom
                        // edges in the Literary Trail). Pad them onto a full
                        // tile canvas instead.
                        tileLoadFunction: (tile, src) => {
                            const imageTile = tile as ImageTile;
                            const image = imageTile.getImage() as HTMLImageElement;
                            image.onload = () => padCroppedZoomifyTile(imageTile, image);
                            image.src = src;
                        },
                    }),
                });
            }

            case "osm": {
                // "osm:<style>" uses an OpenFreeMap vector style (osm:bright ->
                // https://tiles.openfreemap.org/styles/bright), plain "osm" stays
                // the classic raster tiles
                const style_name = _map_type_arr.length > 1 ? _map_type_arr[1] : "";
                if (style_name) {
                    return this._createVectorStyleLayer(
                        `https://tiles.openfreemap.org/styles/${style_name}`,
                    );
                }
                return new TileLayer({ source: new OSM({ attributions: [] }) });
            }
            default: {
                // Relative/custom templates (./tiles/{z}/{x}/{y}.png,
                // /tiles/{z}/..., tiles/{z}/...): render as raster XYZ so
                // consumers on subpaths (GitLab Pages), bundlers (Vite) and
                // the Electron kiosk server don't have to expand to an
                // absolute http(s):// URL first. Style JSON paths without
                // {z} render as vector styles, anything else falls back to
                // OSM.
                if (map_type.includes("{z}")) {
                    return new TileLayer({
                        source: new XYZ({
                            url: map_type,
                            attributions: [],
                            crossOrigin: "anonymous",
                        }),
                    });
                }
                if (map_type.includes("/") || map_type.endsWith(".json")) {
                    return this._createVectorStyleLayer(map_type);
                }
                return new TileLayer({ source: new OSM({ attributions: [] }) });
            }
        }
    }

    _createVectorStyleLayer(style_url: string): TileLayer {
        // Mapbox style JSONs (OpenFreeMap, Mapbox) are applied onto a single
        // vector tile layer, including its background and label decluttering
        const layer = new VectorTileLayer({ declutter: true, updateWhileAnimating: true });
        applyStyle(layer, style_url).catch((err: unknown) =>
            console.error("Vector map style could not be loaded:", style_url, err),
        );
        return layer as unknown as TileLayer;
    }

    /*	Create Mini Map
	================================================== */
    _createMiniMap(): void {
        if (this.options.map_as_image) {
            this.zoom_min_max.min = 0;
        }

        if (!this.bounds_array) {
            this.bounds_array = this._getAllMarkersBounds(this._markers);
        }

        // consent mode: the minimap layer is only created once map tiles are
        // allowed — creating an IIIF/vector layer object fetches info.json or
        // the style JSON immediately, which must not happen while denied
        const consent = consentManagerOf(this.options);
        const tile_service = consentMessage("consent_service_tiles", "map tiles");
        const tiles_allowed = !(
            this.options.consent_required &&
            consent &&
            !consent.isGranted(tile_service)
        );
        this._tile_layer_mini = tiles_allowed ? this._createTileLayer(this.options.map_type) : null;
        const is_image_map = this.options.map_type === "iiif" && this.options.map_as_image;
        // Legacy zoomify maps are mercator-based: the minimap fits the image's
        // mercator bounds with a free zoom so the whole image stays visible
        // at a downscaled (sharp) pyramid level
        const is_zoomify = this.options.map_type === "zoomify";
        const zoomify_pyramid = is_zoomify ? this._zoomifyPyramid() : null;
        // the overview needs the pyramid's full ladder (including the R0
        // floor below default zoom 0): fit() settles on a fractional zoom
        // containing the whole image, which minZoom: 0 on the default ladder
        // would clip back to a cropped upscale
        const zoomify_resolutions = zoomify_pyramid
            ? zoomify_pyramid.tileGrid.getResolutions()
            : null;
        // Constrain a standard mercator overview to an explicit lon/lat box
        // (overview_extent); image maps keep their own views below. Without
        // a constraint the default overview view roams the whole world.
        const overview_extent =
            !is_image_map && !zoomify_pyramid && this.options.overview_extent
                ? this._lonLatBboxToExtent(this.options.overview_extent)
                : null;
        this._mini_map = new OverviewMap({
            ...(is_image_map || zoomify_pyramid
                ? {
                      view: (() => {
                          const view = new View({
                              projection: this._map.getView().getProjection(),
                              center: this._map.getView().getCenter(),
                              zoom: this.zoom_min_max.min || 0,
                              // same reasoning as the main image view: no world
                              // constraints
                              ...(is_image_map
                                  ? {
                                        multiWorld: true,
                                        resolutions: IMAGE_RESOLUTIONS,
                                        minZoom: 0,
                                        maxZoom: IMAGE_RESOLUTIONS.length - 1,
                                    }
                                  : {}),
                              ...(zoomify_pyramid && zoomify_resolutions
                                  ? {
                                        // show the whole image: the zoom stays
                                        // free on the pyramid ladder so fit()
                                        // settles on the fractional resolution
                                        // containing the image bounds (a pinned
                                        // zoom stuck the smallest, blurry
                                        // pyramid level on screen, cropped);
                                        // the center stays within the image
                                        // bounds
                                        constrainOnlyCenter: true,
                                        extent: zoomify_pyramid.extent,
                                        resolutions: zoomify_resolutions,
                                        minZoom: 0,
                                        maxZoom: zoomify_resolutions.length - 1,
                                        center: [
                                            (zoomify_pyramid.extent[0] +
                                                zoomify_pyramid.extent[2]) /
                                                2,
                                            (zoomify_pyramid.extent[1] +
                                                zoomify_pyramid.extent[3]) /
                                                2,
                                        ],
                                    }
                                  : {}),
                          });
                          return view;
                      })(),
                  }
                : {}),
            ...(overview_extent
                ? {
                      view: new View({
                          projection: this._map.getView().getProjection(),
                          center: [
                              (overview_extent[0] + overview_extent[2]) / 2,
                              (overview_extent[1] + overview_extent[3]) / 2,
                          ],
                          extent: overview_extent,
                          constrainOnlyCenter: false,
                      }),
                  }
                : {}),
            layers: this._tile_layer_mini ? [this._tile_layer_mini] : [],
            // NB: label = the button shown when COLLAPSED (expands the
            // minimap), collapseLabel = shown when EXPANDED (collapses it) —
            // the chevrons point outward when collapsed and inward when open
            collapseLabel: "\u00ab",
            label: "\u00bb",
            collapsed: true,
        });
        this._map.addControl(this._mini_map);

        if (zoomify_pyramid) {
            // show the image pyramid's extent in the minimap: with the zoom
            // free, fit() picks the fractional resolution containing the
            // whole image, so the overview serves the smallest pyramid level
            // downscaled (sharp) instead of a cropped upscale
            const overview_map = this._mini_map.getOverviewMap();
            const fitZoomifyMini = () => {
                const raw_size = overview_map.getSize();
                // the minimap starts collapsed (no layout size yet) in its
                // 150x100 box — fall back to that until it expands
                const size =
                    raw_size && raw_size[0] >= 50 && raw_size[1] >= 50
                        ? raw_size
                        : [150, 100];
                overview_map.getView().fit(zoomify_pyramid.extent, {
                    size: size,
                });
            };
            fitZoomifyMini();
            // re-fit once the minimap expands: the collapsed size is unknown
            // at creation time
            overview_map.on("change:size", fitZoomifyMini);
        } else if (!is_zoomify && this.bounds_array && this.bounds_array.length) {
            // the minimap shows the story's world: with a bbox set, markers
            // outside of the box are unreachable and must not skew the fit
            this._fitView(this._mini_map.getOverviewMap(), this.bounds_array, 0, this._bboxExtent() !== null);
        }

        if (this.options.map_type === "iiif" && this.options.map_as_image) {
            // in image mode there are no geo markers to fit, so show the
            // whole image instead (issues #465, #355)
            this._fitMiniMapToImage();
        }
    }

    _fitMiniMapToImage(): void {
        if (!this._tile_layer_mini) return;
        const fit_mini_image = () => {
            try {
                const mini_source = this._tile_layer_mini?.getSource() as {
                    getTileGrid?: () => { getExtent(): number[] };
                } | null;
                const grid = mini_source?.getTileGrid?.();
                if (grid) {
                    const overview_map = this._mini_map.getOverviewMap();
                    const raw_size = overview_map.getSize();
                    // the minimap may still be collapsed (no layout size yet)
                    const size =
                        raw_size && raw_size[0] >= 50 && raw_size[1] >= 50 ? raw_size : [150, 150];
                    overview_map.getView().fit(grid.getExtent(), {
                        size: size,
                    });
                }
            } catch (e) {
                console.warn("IIIF minimap fit failed:", e);
            }
        };
        const mini_source = this._tile_layer_mini.getSource();
        if (mini_source) {
            if (mini_source.getState() === "ready") {
                fit_mini_image();
            } else {
                mini_source.once("change", () => {
                    if (mini_source.getState() === "ready") fit_mini_image();
                });
            }
        } else {
            // the mini layer sets its source asynchronously
            this._tile_layer_mini.once("change:source", () => {
                const src = this._tile_layer_mini?.getSource();
                if (!src) return;
                if (src.getState() === "ready") {
                    fit_mini_image();
                } else {
                    src.once("change", () => {
                        if (src.getState() === "ready") fit_mini_image();
                    });
                }
            });
        }
    }

    /*	Create Markers
	================================================== */
    _createMarker(d: StorymapSlide): void {
        const marker = new OpenLayersMapMarker(d, this.options);
        marker.on("markerclick", this._onMarkerClick, this);
        this._addMarker(marker);
        this._markers.push(marker);
        marker.marker_number = this._markers.length - 1;
        this.fire("markerAdded", marker);
    }

    _addMarker(marker: OpenLayersMapMarker): void {
        marker.addTo(this._map);
    }

    /**
     * Position marker overlays on the unwrapped longitude path so they sit on
     * the same world copy as the fitted view and the line (issue #381).
     * Image-space coordinates are not degrees and stay untouched.
     */
    _afterCreateMarkers(): void {
        if (this._map.getView().getProjection().getCode() === "EPSG:4326") {
            return;
        }
        const real = this._markers.filter(
            (m) => m.data.real_marker && m.data.location?.lon !== undefined,
        );
        const unwrapped = this._unwrapLongitudes(real.map((m) => m.data.location.lon as number));
        real.forEach((m, i) => {
            m._overlay?.setPosition(fromLonLat([unwrapped[i], m.data.location.lat as number]));
        });
    }

    _removeMarker(marker: OpenLayersMapMarker): void {
        if (marker && marker.data.real_marker) {
            marker._removeFrom(this._map);
        }
    }

    /*	Marker helpers
	================================================== */
    _getAllMarkersBounds(markers_array: OpenLayersMapMarker[]): number[][] {
        const coords = [];
        for (let i = 0; i < markers_array.length; i++) {
            if (markers_array[i].data.real_marker) {
                coords.push([
                    markers_array[i].data.location.lon,
                    markers_array[i].data.location.lat,
                ]);
            }
        }
        // unwrap dateline crossings so fits don't span the whole globe
        // (issue #381)
        const lons = this._unwrapLongitudes(coords.map((c) => c[0] as number));
        return coords.map((c, i) => [lons[i], c[1]]);
    }

    /**
     * Normalize a longitude sequence so consecutive values differ by at most
     * 180 degrees: markers keep their raw coordinates (OpenLayers wraps the
     * display), but fits and lines use the unwrapped path (issue #381).
     */
    _unwrapLongitudes(lons: number[]): number[] {
        if (lons.length === 0) return [];
        const out = [lons[0]];
        for (let i = 1; i < lons.length; i++) {
            let lon = lons[i];
            while (lon - out[i - 1] > 180) lon -= 360;
            while (lon - out[i - 1] < -180) lon += 360;
            out.push(lon);
        }
        return out;
    }

    _markerCoordsToViewCoords(coords: number[][]): number[][] {
        const is_image_space = this._map.getView().getProjection().getCode() === "EPSG:4326";
        if (is_image_space) return coords.map((c) => [c[0], c[1]]);
        return coords.map((c) => fromLonLat(c));
    }

    /**
     * The View extent for the `map_bbox` option, or `null` when unset. The
     * view uses it with `constrainOnlyCenter` (see _createMap).
     */
    _bboxExtent(): number[] | null {
        const bbox = this.options.map_bbox as number[] | null | undefined;
        if (!bbox || bbox.length !== 4) return null;
        const is_image_space = this.options.map_type === "iiif" && this.options.map_as_image;
        if (is_image_space) return bbox;
        // NB: fromLonLat transforms a single [lon, lat] pair — transform the
        // two corners separately
        const min = fromLonLat([bbox[0], bbox[1]]);
        const max = fromLonLat([bbox[2], bbox[3]]);
        return [min[0], min[1], max[0], max[1]];
    }
    /**
     * The slide content panel can be opaque — it then covers part of the map
     * and the effective visible area shrinks. Returns the pixel padding for
     * the covered side (right in landscape, bottom in portrait) so fits keep
     * the story inside the visible region; transparent panels and panels
     * that do not overlap the map (map_area "left") add nothing.
     */
    _opaquePanelPadding(): [number, number, number, number] {
        const padding: [number, number, number, number] = [15, 15, 15, 15];
        if (typeof document === "undefined") return padding;
        const panel = document.querySelector(".vco-storyslider .vco-slide.vco-active .vco-text");
        if (!panel) return padding;
        const bg = getComputedStyle(panel).backgroundColor;
        const match = /rgba?\(([^)]+)\)/.exec(bg);
        if (!match) return padding;
        const parts = match[1]
            .split(/[,\s/]+/)
            .filter((v) => v !== "")
            .map(Number);
        const alpha = parts.length >= 4 ? parts[3] : 1;
        if (alpha < 0.9) return padding;
        const map_rect = this._el.map.getBoundingClientRect();
        const panel_rect = panel.getBoundingClientRect();
        if (!map_rect.width || !panel_rect.width) return padding;
        // the panel must actually overlap the map (it does not in the
        // map_area "left" layout, where map and panel sit side by side)
        const overlaps =
            panel_rect.left < map_rect.right &&
            panel_rect.right > map_rect.left &&
            panel_rect.top < map_rect.bottom &&
            panel_rect.bottom > map_rect.top;
        if (!overlaps) return padding;
        const layout = this.options.layout;
        if (layout === "portrait") {
            padding[2] += Math.max(0, map_rect.bottom - panel_rect.top);
        } else {
            padding[1] += Math.max(0, panel_rect.right - map_rect.left);
        }
        return padding;
    }

    /**
     * Fit the given coordinates. With `clamp_to_bbox` (the strict bbox
     * layout, map_area "left"), markers outside of the box are unreachable
     * by design — they must not skew the fit target, so the extent is
     * intersected with the box and the in-box markers compose the view.
     */
    _fitView(ol_map: OlMap, coords: number[][], duration = 0, clamp_to_bbox = false): void {
        if (!coords || !coords.length) return;
        const view_coords = this._markerCoordsToViewCoords(coords);
        let extent = boundingExtent(view_coords);
        if (clamp_to_bbox) {
            const bbox = this._bboxExtent();
            if (bbox) {
                const clamped = getIntersection(extent, bbox as Extent);
                // getIntersection returns an inverted (empty) extent when the
                // boxes are disjoint — fit the box itself in that case
                extent =
                    clamped[0] <= clamped[2] && clamped[1] <= clamped[3]
                        ? clamped
                        : (bbox as Extent);
            }
        }
        ol_map.getView().fit(extent, {
            size: ol_map.getSize(),
            padding: this._opaquePanelPadding(),
            maxZoom: 12,
            duration: duration,
            easing: this.options.ease as ((t: number) => number) | undefined,
        });
    }

    _calculateMarkerZooms(): void {
        for (let i = 0; i < this._markers.length; i++) {
            if (this._markers[i].data.location) {
                const marker = this._markers[i];
                let marker_location, calculated_zoom;

                // MARKER LOCATION
                if (marker.data.type && marker.data.type === "overview") {
                    marker_location = this._getMapCenter(true);
                } else {
                    marker_location = marker.location();
                }

                // Fit-based zoom: zoom the view to this marker and neighbors
                const prev_marker =
                    i > 0 ? this._markers[i - 1].location() : this._getMapCenter(true);
                const next_marker =
                    i < this._markers.length - 1
                        ? this._markers[i + 1].location()
                        : this._getMapCenter(true);

                const prev_marker_zoom = this._calculateZoomChange(prev_marker, marker_location);
                const next_marker_zoom = this._calculateZoomChange(next_marker, marker_location);

                if (prev_marker_zoom && prev_marker_zoom < next_marker_zoom) {
                    calculated_zoom = prev_marker_zoom;
                } else if (next_marker_zoom) {
                    calculated_zoom = next_marker_zoom;
                } else {
                    calculated_zoom = prev_marker_zoom;
                }

                if (
                    this.options.map_center_offset &&
                    (this.options.map_center_offset.left !== 0 ||
                        this.options.map_center_offset.top !== 0)
                ) {
                    calculated_zoom = calculated_zoom - 1;
                }

                marker.data.location.zoom = calculated_zoom;
            }
        }
    }

    /*	Line
	================================================== */

    /**
     * Stroke style for the route lines: the dash pattern and line join are
     * applied at init too, matching the original rendering (the lines are
     * dashed "5,5" by default, not solid).
     */
    _lineStyle(color: string): Style {
        return new Style({
            stroke: new Stroke({
                color: color,
                width: this.options.line_weight,
                lineDash: String(this.options.line_dash)
                    .split(",")
                    .map((v) => Number(v)),
                lineJoin: this.options.line_join as CanvasLineJoin,
            }),
        });
    }

    _createLine(d?: StorymapSlide): VectorLayer {
        return new VectorLayer({
            source: new VectorSource({ features: [] }),
            // re-render vector geometry during view animations: without it
            // the animated line drawing is only painted after the
            // transition finishes
            updateWhileAnimating: true,
            style: this._lineStyle(this.options.line_color),
        });
    }

    _addLineToMap(line: VectorLayer): void {
        // honor the show_lines option
        line.setVisible(this.options.show_lines);
        this._map.addLayer(line);
    }

    _addToLine(line: VectorLayer, d: LinePoint): void {
        // Append a point to the line's geometry
        const source = line.getSource();
        let feature = source.getFeatures()[0];
        if (!feature) {
            feature = new Feature({ geometry: new LineString([]) });
            source.addFeature(feature);
        }
        const coords = feature.getGeometry().getCoordinates();
        let lon = d.location.lon;
        // unwrap dateline crossings against the previous point (issue #381).
        // NB: read the previous longitude straight from meters — toLonLat()
        // wraps into [-180, 180] and would collapse already-unwrapped values.
        if (coords.length > 0 && lon !== undefined) {
            const last_lon = coords[coords.length - 1][0] / 111319.49079327358;
            while (lon - last_lon > 180) lon -= 360;
            while (lon - last_lon < -180) lon += 360;
        }
        coords.push(this._toViewCoords({ lat: d.location.lat, lon }));
        feature.getGeometry().setCoordinates(coords);
    }

    /**
     * Replace a line's geometry. With `animate.duration > 0` only the latest
     * hop animates, in sync with the view animation: the already-traveled
     * prefix stays drawn while the new segment traces progressively, so half
     * way through the pan the old connections are fully red and only half
     * the new hop is. Backward navigation mirrors this: the traveled prefix
     * stays drawn while the far end pulls back along the abandoned hop.
     */
    _replaceLines(
        line: VectorLayer,
        array: LinePoint[],
        animate?: {
            duration: number;
            retractFrom?: LinePoint[] | null;
            growFrom?: LinePoint[] | null;
        },
    ): void {
        const toLonLat = (d: LinePoint): number[] => {
            const lat = d.location ? d.location.lat : d.lat;
            const lon = d.location ? d.location.lon : d.lon;
            return [lon as number, lat as number];
        };
        const pts = array.map(toLonLat);
        const lons = this._unwrapLongitudes(pts.map((p) => p[0] as number));
        const unwrapped = pts.map((p, i) => [lons[i], p[1]]);
        const view_coords = this._markerCoordsToViewCoords(unwrapped);
        const source = line.getSource();

        const setGeometry = (coords: number[][]) => {
            source.clear();
            source.addFeature(new Feature({ geometry: new LineString(coords) }));
        };

        this._cancelLineAnimation();

        const duration = animate?.duration ?? 0;
        if (duration <= 0 || view_coords.length < 2) {
            setGeometry(view_coords);
            return;
        }

        // The already-traveled prefix, as a leading subsequence of the
        // target path: verified point-by-point so the shared joint cannot
        // drift (both go through the same unwrap + view projection).
        // Falls back to 0 (whole-path animation) on any mismatch.
        const leadingLength = (candidate: LinePoint[]): number => {
            const raw = candidate.map(toLonLat);
            if (raw.length < 1 || raw.length >= unwrapped.length) {
                return 0;
            }
            const cl = this._unwrapLongitudes(raw.map((p) => p[0] as number));
            for (let i = 0; i < raw.length; i++) {
                if (cl[i] !== unwrapped[i][0] || raw[i][1] !== unwrapped[i][1]) {
                    return 0;
                }
            }
            return raw.length;
        };

        // Retraction (backward navigation): the animation path is the route
        // up to the previous marker (retractFrom); the traveled prefix
        // [0..current] stays drawn while the abandoned tail shrinks back to
        // the joint — the far end pulls back from the old marker to the new
        // one.
        const retract_raw = (animate?.retractFrom ?? []).map(toLonLat);
        let tail: number[][] | null = null;
        if (retract_raw.length > 0) {
            const rl = this._unwrapLongitudes(retract_raw.map((p) => p[0] as number));
            const retract_unwrapped = retract_raw.map((p, i) => [rl[i], p[1]]);
            // The target must be the leading subsequence of the retraction
            // path; otherwise fall back to whole-path truncation below.
            let match = unwrapped.length >= 2 && unwrapped.length < retract_unwrapped.length;
            for (let i = 0; match && i < unwrapped.length; i++) {
                if (
                    retract_unwrapped[i][0] !== unwrapped[i][0] ||
                    retract_unwrapped[i][1] !== unwrapped[i][1]
                ) {
                    match = false;
                }
            }
            if (match) {
                tail = this._markerCoordsToViewCoords(retract_unwrapped).slice(
                    unwrapped.length - 1,
                );
            }
        }
        const tail_total = tail ? this._pathLength(tail) : 0;

        // Growth (forward navigation): the already-traveled prefix
        // [0..previous] (growFrom) stays drawn while only the new hop
        // [prev..current] traces progressively.
        const grow_len = leadingLength(animate?.growFrom ?? []);
        const prefix = grow_len >= 1 ? view_coords.slice(0, grow_len) : null;
        const suffix = grow_len >= 1 ? view_coords.slice(grow_len - 1) : null;
        const suffix_total = suffix ? this._pathLength(suffix) : 0;

        const easing = this.options.ease as ((t: number) => number) | undefined;
        const start_time = performance.now();
        if (prefix) {
            // Seed the already-traveled prefix so it stays red from frame 0
            // (also heals a partially-drawn line when a running animation
            // is cancelled by rapid stepping).
            setGeometry(prefix);
        }
        const step = (now: number) => {
            const t = Math.min(1, Math.max(0, (now - start_time) / duration));
            const eased = easing ? easing(t) : t;
            if (tail && tail_total > 0) {
                // pull the far end back along the abandoned hop
                const drawn = tail_total - eased * tail_total;
                const drawn_tail = this._truncatePath(tail, drawn);
                setGeometry([...view_coords, ...drawn_tail.slice(1)]);
                if (t >= 1) {
                    setGeometry(view_coords);
                }
            } else if (prefix && suffix && suffix_total > 0) {
                const drawn_suffix = this._truncatePath(suffix, eased * suffix_total);
                setGeometry([...prefix, ...drawn_suffix.slice(1)]);
                if (t >= 1) {
                    setGeometry(view_coords);
                }
            } else {
                const total_length = this._pathLength(view_coords);
                setGeometry(this._truncatePath(view_coords, eased * total_length));
            }
            this._line_animation = t < 1 ? requestAnimationFrame(step) : null;
        };
        this._line_animation = requestAnimationFrame(step);
    }

    /** Cancel a running active-line draw animation. */
    _cancelLineAnimation(): void {
        if (this._line_animation !== null) {
            cancelAnimationFrame(this._line_animation);
            this._line_animation = null;
        }
    }

    /** Total euclidean length of a path in view coordinates. */
    _pathLength(coords: number[][]): number {
        let total = 0;
        for (let i = 1; i < coords.length; i++) {
            total += Math.hypot(coords[i][0] - coords[i - 1][0], coords[i][1] - coords[i - 1][1]);
        }
        return total;
    }

    /**
     * The prefix of the path up to `length` (in view units), with the cut
     * point interpolated inside its segment.
     */
    _truncatePath(coords: number[][], length: number): number[][] {
        if (length <= 0 || coords.length < 2) {
            return [];
        }
        const out = [coords[0]];
        let acc = 0;
        for (let i = 1; i < coords.length; i++) {
            const seg = Math.hypot(
                coords[i][0] - coords[i - 1][0],
                coords[i][1] - coords[i - 1][1],
            );
            if (acc + seg >= length) {
                const f = (length - acc) / seg;
                out.push([
                    coords[i - 1][0] + f * (coords[i][0] - coords[i - 1][0]),
                    coords[i - 1][1] + f * (coords[i][1] - coords[i - 1][1]),
                ]);
                return out;
            }
            acc += seg;
            out.push(coords[i]);
        }
        return out;
    }

    /*	Map
	================================================== */
    _panTo(loc: LatLngLiteral, animate?: boolean): void {
        this._map.getView().animate({
            center: this._toViewCoords(loc),
            duration: this.options.duration,
            easing: this.options.ease as ((t: number) => number) | undefined,
        });
    }

    _zoomTo(z: number, animate?: boolean): void {
        this._map.getView().animate({
            zoom: z,
            duration: this.options.duration,
            easing: this.options.ease as ((t: number) => number) | undefined,
        });
    }

    _viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void {
        let _animate = true,
            _duration = this.options.duration,
            _zoom = this._getMapZoom(),
            _location: LatLngLiteral = { lat: loc.lat, lon: loc.lon };

        // Show Active Line
        if (!this.options.map_as_image) {
            this._line_active.setVisible(true);
        }

        if (loc.zoom !== undefined && loc.zoom !== null) {
            _zoom = loc.zoom;
        }

        // Options
        if (opts) {
            if (opts.duration !== undefined) {
                if (opts.duration === 0) {
                    _animate = false;
                } else {
                    _duration = opts.duration;
                }
            }

            if (opts.zoom && this.options.calculate_zoom) {
                _zoom = opts.zoom;
            }
        }

        // OFFSET
        if (this.options.map_center_offset) {
            _location = this._getMapCenterOffset(_location, _zoom);
        }

        this._map.getView().animate({
            center: this._toViewCoords(_location),
            zoom: _zoom,
            duration: _animate ? _duration : 0,
            easing: this.options.ease as ((t: number) => number) | undefined,
        });

        if (this._mini_map && this.options.width > this.options.skinny_size) {
            if (_zoom - 1 <= this.zoom_min_max.min) {
                this._mini_map.setCollapsed(true);
            } else {
                this._mini_map.setCollapsed(false);
            }
        }
    }

    _toViewCoords(loc: LatLngLiteral): number[] {
        const is_image_space = this._map.getView().getProjection().getCode() === "EPSG:4326";
        if (is_image_space) return [loc.lon, loc.lat];
        return fromLonLat([loc.lon, loc.lat]);
    }

    _getMapZoom(): number {
        // fractional zoom on purpose: overview fits produce non-integer zooms and
        // rounding here would snap the view on the next navigation
        return this._map.getView().getZoom() || 0;
    }

    _getMapCenter(offset?: boolean): LatLngLiteral {
        const center = toLonLat(
            this._map.getView().getCenter(),
            this._map.getView().getProjection(),
        );
        return { lat: center[1], lon: center[0] };
    }

    _getMapCenterOffset(location: LatLngLiteral, zoom: number): LatLngLiteral {
        // Offset the center by map_center_offset pixels at the given zoom
        const view = this._map.getView();
        const projection = view.getProjection();
        const center = this._toViewCoords(location);
        const resolution = view.getResolutionForZoom(zoom);
        return this._fromViewCoords(
            [
                center[0] - this.options.map_center_offset.left * resolution,
                center[1] + this.options.map_center_offset.top * resolution,
            ],
            projection,
        );
    }

    _fromViewCoords(coord: number[], projection: Projection): LatLngLiteral {
        if (projection.getCode() === "EPSG:4326") return { lat: coord[1], lon: coord[0] };
        // linear lon inversion without dateline wrapping (issue #381);
        // lat uses the exact mercator inverse (6378137 = the 3857 sphere radius)
        const c = toLonLat(coord, projection);
        return { lat: c[1], lon: (coord[0] / 6378137) * (180 / Math.PI) };
    }

    _getBoundsZoom(
        origin: LatLngLiteral,
        destination: LatLngLiteral,
        correct_for_center?: boolean,
    ): number {
        const coords = [
            [origin.lon !== undefined ? origin.lon : origin.lng, origin.lat],
            [destination.lon, destination.lat],
        ];
        const view_coords = this._markerCoordsToViewCoords(coords);
        const extent = boundingExtent(view_coords);
        const size = this._map.getSize();
        if (!size || !size[0] || !size[1]) return 0;

        const resolution_x = (extent[2] - extent[0]) / size[0];
        const resolution_y = (extent[3] - extent[1]) / size[1];
        const resolution = Math.max(resolution_x, resolution_y) * 3; // padding factor
        if (!isFinite(resolution) || resolution <= 0) return 0;

        const z = this._map.getView().getZoomForResolution(resolution);
        if (z === undefined || !isFinite(z)) return 0;
        return Math.max(0, Math.round(z));
    }

    _initialMapLocation(): void {
        // OpenLayers renders independently; nothing to subscribe for initial location
    }

    /**
     * Great-circle (haversine) length of the route through all markers in
     * kilometers (issue #341).
     */
    getRouteDistance(): number | undefined {
        const coords = this._markers
            .map((m) => m.location())
            .filter((l): l is LatLngLiteral => !!l && isFinite(l.lat) && isFinite(l.lon));
        if (coords.length < 2) {
            return undefined;
        }
        const R = 6371;
        let total = 0;
        for (let i = 1; i < coords.length; i++) {
            const d_lat = ((coords[i].lat - coords[i - 1].lat) * Math.PI) / 180;
            const d_lon = ((coords[i].lon - coords[i - 1].lon) * Math.PI) / 180;
            const a =
                Math.sin(d_lat / 2) ** 2 +
                Math.cos((coords[i - 1].lat * Math.PI) / 180) *
                    Math.cos((coords[i].lat * Math.PI) / 180) *
                    Math.sin(d_lon / 2) ** 2;
            total += 2 * R * Math.asin(Math.sqrt(a));
        }
        return total;
    }

    _markerOverview(duration?: number): void {
        // Hide Active Line
        this._cancelLineAnimation();
        this._line_active.setVisible(false);

        // repeated presses while an overview animation is running snap
        // instantly instead of restarting the ~1s animation
        if (duration && this._map.getView().getAnimating()) {
            duration = 0;
        }

        if (this.options.map_type === "zoomify") {
            // legacy zoomify: show the whole image centered at the best-fit
            // pyramid level (the original renderer's overview); with the
            // panel offset the legacy renderer drops one zoom level
            const size = this._map.getSize();
            const overview = this._zoomifyOverview([size?.[0] || 1280, size?.[1] || 450]);
            if (overview) {
                const offset =
                    this.options.map_center_offset &&
                    (this.options.map_center_offset.left !== 0 ||
                        this.options.map_center_offset.top !== 0);
                // with the panel offset the legacy renderer drops one zoom
                // level (the mercator zoom = the pyramid level)
                const view_zoom = offset ? overview.zoom - 1 : overview.zoom;
                // offset the center directly in view coords (a lat/lon
                // round-trip would corrupt the zoomify target)
                const resolution = this._map.getView().getResolutionForZoom(view_zoom);
                const center_view = [
                    overview.center[0] - (this.options.map_center_offset?.left ?? 0) * resolution,
                    overview.center[1] + (this.options.map_center_offset?.top ?? 0) * resolution,
                ];
                this._map.getView().animate({
                    center: center_view,
                    zoom: view_zoom,
                    duration: duration ?? this._transition_duration,
                    easing: this.options.ease as ((t: number) => number) | undefined,
                });
            }
        } else if (this.options.map_type === "iiif" && this.options.map_as_image) {
            const source = this._tile_layer?.getSource();
            if (!source) {
                return;
            }
            const fit = () => {
                try {
                    const grid = source.getTileGrid();
                    if (grid) {
                        // compute the fit target directly and animate once (a
                        // fit() followed by setCenter() would cancel the fit
                        // animation, issue #465)
                        const extent = grid.getExtent();
                        const size = this._map.getSize();
                        const resolution_x = (extent[2] - extent[0]) / (size[0] || 1);
                        const resolution_y = (extent[3] - extent[1]) / (size[1] || 1);
                        const resolution = Math.max(resolution_x, resolution_y);
                        const view = this._map.getView();
                        const zoom = view.getZoomForResolution(resolution);
                        const overview_center = this.options.map_overview_center;
                        const center_px = overview_center
                            ? this._toViewCoords({
                                  lat: overview_center.lat,
                                  lon: overview_center.lon,
                              })
                            : [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
                        const projection = view.getProjection();
                        const location = this._fromViewCoords(center_px, projection);
                        const offset_location = this._getMapCenterOffset(location, zoom);
                        view.animate({
                            center: this._toViewCoords(offset_location),
                            zoom: zoom,
                            duration: duration ?? this._transition_duration,
                            easing: this.options.ease as ((t: number) => number) | undefined,
                        });
                    }
                } catch (e) {
                    console.warn("IIIF overview fit failed:", e);
                }
            };

            if (source.getState() === "ready") {
                fit();
            } else {
                source.once("change", () => {
                    if (source.getState() === "ready") fit();
                });
            }
        } else {
            this.bounds_array = this._getAllMarkersBounds(this._markers);

            // user-selected overview centerpoint (issues #107, #271): fit the
            // zoom to the markers but center on the configured location
            const overview_center = this.options.map_overview_center;
            if (overview_center && this.bounds_array && this.bounds_array.length) {
                const view_coords = this._markerCoordsToViewCoords(this.bounds_array);
                const extent = boundingExtent(view_coords);
                const size = this._map.getSize();
                const resolution = Math.max(
                    (extent[2] - extent[0]) / (size[0] || 1),
                    (extent[3] - extent[1]) / (size[1] || 1),
                );
                const zoom = Math.max(
                    0,
                    Math.round(this._map.getView().getZoomForResolution(resolution)) - 1,
                );
                const offset_location = this._getMapCenterOffset(
                    { lat: overview_center.lat, lon: overview_center.lon },
                    zoom,
                );
                this._map.getView().animate({
                    center: this._toViewCoords(offset_location),
                    zoom: zoom,
                    duration: duration ?? this._transition_duration,
                    easing: this.options.ease as ((t: number) => number) | undefined,
                });
            } else if (
                this.options.map_center_offset &&
                (this.options.map_center_offset.left !== 0 ||
                    this.options.map_center_offset.top !== 0)
            ) {
                if (this.bounds_array && this.bounds_array.length) {
                    const view_coords = this._markerCoordsToViewCoords(this.bounds_array);
                    const extent = boundingExtent(view_coords);
                    const size = this._map.getSize();
                    const resolution_x = (extent[2] - extent[0]) / (size[0] || 1);
                    const resolution_y = (extent[3] - extent[1]) / (size[1] || 1);
                    const resolution = Math.max(resolution_x, resolution_y);
                    const zoom = Math.max(
                        0,
                        Math.round(this._map.getView().getZoomForResolution(resolution)) - 1,
                    );
                    const center_px = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
                    const projection = this._map.getView().getProjection();
                    const location = this._fromViewCoords(center_px, projection);
                    const offset_location = this._getMapCenterOffset(location, zoom);
                    this._map.getView().animate({
                        center: this._toViewCoords(offset_location),
                        zoom: zoom,
                        duration: duration ?? this._transition_duration,
                        easing: this.options.ease as ((t: number) => number) | undefined,
                    });
                }
            } else {
                // fit instantly, then shift the center by the panel offset
                // and animate there so the markers clear the story panel;
                // with the strict bbox layout markers outside of the box are
                // unreachable — they must not skew the fit target
                this._fitView(this._map, this.bounds_array, 0, this._bboxExtent() !== null);
                const view = this._map.getView();
                const zoom = view.getZoom();
                if (zoom !== undefined) {
                    const center = this._fromViewCoords(view.getCenter(), view.getProjection());
                    const offset_location = this._getMapCenterOffset(center, zoom);
                    view.animate({
                        center: this._toViewCoords(offset_location),
                        zoom: zoom,
                        duration: duration ?? this._transition_duration,
                        easing: this.options.ease as ((t: number) => number) | undefined,
                    });
                }
            }
        }

        if (this._mini_map) {
            this._mini_map.setCollapsed(true);
        }
    }

    /**
     * Swap the minimap's layer for the current `map_type` (mirrors the
     * initial `_createMiniMap` fitting: zoomify extent, IIIF image extent,
     * otherwise the marker bounds). No-op when no minimap exists yet.
     */
    _refreshMiniMapLayer(): void {
        if (!this._mini_map) return;
        const overview = this._mini_map.getOverviewMap();
        overview.getLayers().clear();
        const consent = consentManagerOf(this.options);
        const tile_service = consentMessage("consent_service_tiles", "map tiles");
        const tiles_allowed = !(
            this.options.consent_required &&
            consent &&
            !consent.isGranted(tile_service)
        );
        if (!tiles_allowed) {
            this._tile_layer_mini = null;
            return;
        }
        this._tile_layer_mini = this._createTileLayer(this.options.map_type);
        overview.addLayer(this._tile_layer_mini);
        const is_zoomify = this.options.map_type === "zoomify";
        const zoomify_pyramid = is_zoomify ? this._zoomifyPyramid() : null;
        if (zoomify_pyramid) {
            const raw_size = overview.getSize();
            const size =
                raw_size && raw_size[0] >= 50 && raw_size[1] >= 50 ? raw_size : [150, 100];
            overview.getView().fit(zoomify_pyramid.extent, { size: size });
        } else if (this.bounds_array && this.bounds_array.length) {
            this._fitView(overview, this.bounds_array, 0, this._bboxExtent() !== null);
        }
        if (this.options.map_type === "iiif" && this.options.map_as_image) {
            this._fitMiniMapToImage();
        }
    }

    /*	Display
	================================================== */
    /**
     * Re-apply runtime-changed options (driven by StoryMap.setMapOptions).
     * Only keys with an immediate effect are handled here; everything else is
     * picked up on the next navigation or layout pass.
     */
    applyOptions(keys: string[]): void {
        for (const key of keys) {
            switch (key) {
                case "map_type": {
                    // Rebuild the main + minimap tile layers for the new type
                    if (this._tile_layer) {
                        this._map.removeLayer(this._tile_layer);
                    }
                    const consent = consentManagerOf(this.options);
                    const tile_service = consentMessage("consent_service_tiles", "map tiles");
                    if (!(
                        this.options.consent_required &&
                        consent &&
                        !consent.isGranted(tile_service)
                    )) {
                        this._tile_layer = this._createTileLayer(this.options.map_type);
                        this._tile_layer.setZIndex(0);
                        this._map.addLayer(this._tile_layer);
                    }
                    this._refreshMiniMapLayer();
                    this._updateAttribution();
                    this._el.map.style.backgroundColor = this.options.map_background_color;
                    break;
                }
                case "overlays": {
                    // Rebuild the stacked overlays from the new option value
                    this._buildOverlays();
                    break;
                }
                case "show_lines":
                case "line_color":
                case "line_color_inactive":
                case "line_weight":
                case "line_opacity":
                case "line_dash":
                case "line_join": {
                    const stroke = (color: string) => this._lineStyle(color);
                    this._line.setStyle(stroke(this.options.line_color_inactive));
                    this._line.setOpacity(this.options.line_opacity);
                    this._line.setVisible(this.options.show_lines);
                    this._line_active.setStyle(stroke(this.options.line_color));
                    this._line_active.setVisible(this.options.show_lines);
                    break;
                }
                case "map_background_color":
                    this._el.map.style.backgroundColor = this.options.map_background_color;
                    break;
                case "map_bbox": {
                    // recreate the view so the new extent constraint applies,
                    // preserving center and zoom
                    const view = this._map.getView();
                    const center = view.getCenter();
                    const zoom = view.getZoom();
                    const extent = this._bboxExtent();
                    this._map.setView(
                        new View({
                            projection: view.getProjection(),
                            center: center,
                            zoom: zoom,
                            minZoom: view.getMinZoom(),
                            maxZoom: view.getMaxZoom(),
                            ...(extent ? { extent: extent } : {}),
                        }),
                    );
                    break;
                }
                default:
                    // map_center_offset, duration, ease, calculate_zoom etc.
                    // take effect on the next navigation
                    break;
            }
        }
        // Re-fit the current view in case layer changes altered the rendering
        if (this._markers.length > 0 && this.current_marker < this._markers.length) {
            const marker = this._markers[this.current_marker];
            if (marker.data.type === "overview") {
                this._markerOverview();
            } else if (marker.data.location) {
                this._viewTo(marker.data.location, { duration: 0 });
            }
        }
    }

    _updateMapDisplay(animate?: boolean, d?: number, instant?: boolean): void {
        if (animate) {
            const duration = d ? d : this.options.duration;
            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(() => {
                this._refreshMap(false);
            }, duration);
        } else {
            if (!this.timer) {
                // size changes (resize/fullscreen) re-fit instantly so marker
                // overlays don't chase an animated view
                this._refreshMap(instant !== false);
            }
        }

        if (this._mini_map) {
            this._mini_map.setCollapsed(this._el.container.offsetWidth < this.options.skinny_size);
        }
    }

    _refreshMap(instant = false): void {
        if (this._map) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            this._map.updateSize();

            // Check to see if it's an overview
            const marker = this._markers[this.current_marker];
            if (marker && marker.data.type && marker.data.type === "overview") {
                this._markerOverview(instant ? 0 : undefined);
                if (instant) {
                    this._map.renderSync();
                }
            } else if (marker && marker.data.location) {
                if (instant) {
                    this._setViewInstant(marker.data.location, this._getMapZoom());
                } else {
                    this._viewTo(marker.data.location, {
                        zoom: this._getMapZoom(),
                    });
                }
            }
        }
    }

    /**
     * Set the view synchronously (resize path): OL's animate() applies its
     * end state asynchronously which can leave marker overlays rendering
     * stale positions after a size change.
     */
    _setViewInstant(loc: StorymapSlideLocation, zoom: number): void {
        let _location: LatLngLiteral = { lat: loc.lat, lon: loc.lon };
        if (this.options.map_center_offset) {
            _location = this._getMapCenterOffset(_location, zoom);
        }
        const view = this._map.getView();
        view.setZoom(zoom);
        view.setCenter(this._toViewCoords(_location));
        this._map.renderSync();
    }
}

export { OpenLayers };

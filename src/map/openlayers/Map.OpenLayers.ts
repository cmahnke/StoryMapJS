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
import { boundingExtent } from "ol/extent";
import TileGrid from "ol/tilegrid/TileGrid";
import OverviewMap from "ol/control/OverviewMap";
import { defaults as interactionDefaults } from "ol/interaction";
import { applyStyle } from "ol-mapbox-style";
import IIIFInfo, { type ImageInformationResponse } from "ol/format/IIIFInfo";

import "ol/ol.css";

import Map from "../Map";
import OpenLayersMapMarker from "./MapMarker.OpenLayers";
import type { LinePoint, ViewToOptions } from "../types";
import type { LatLngLiteral, StorymapSlide, StorymapSlideLocation } from "../../types";
import { consentManagerOf, consentMessage } from "../../storymap/Consent";

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
    declare "_tile_layer_mini": TileLayer;
    declare "_mini_map": OverviewMap;
    declare "_markers": OpenLayersMapMarker[];
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

        // bbox limitation (map_bbox): nothing outside of the box can be
        // visible — image-space maps use raw pixel coordinates
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
                ...(bbox_extent ? { extent: bbox_extent } : {}),
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
                consent.request(tile_service, "", this._el.map).then((allowed) => {
                    if (allowed) {
                        this._onTilesAllowed();
                    }
                });
            }
            // denied → the map renders with background color and markers only
        } else {
            this._addTileLayer();
        }

        // Create Overall Connection Line
        this._line = this._createLine();
        this._line.setStyle(this._lineStyle(this.options.line_color_inactive));
        this._addLineToMap(this._line);
        this._line.setOpacity(this.options.line_opacity);

        // Create Active Line
        this._line_active = this._createLine();
        this._line_active.setStyle(this._lineStyle(this.options.line_color));
        this._addLineToMap(this._line_active);
        this._line_active.setOpacity(1);

        if (this.options.map_as_image) {
            this._line_active.setVisible(false);
            this._line.setVisible(false);
        }

        // Native interactions (pan/zoom), no scroll zoom by default
        const interactions = interactionDefaults({ mouseWheelZoom: false });
        interactions.forEach((i) => this._map.addInteraction(i));

        // Attribution
        const attribution = this._getAttribution(this.options.map_type);
        if (attribution) {
            this._el.map.insertAdjacentHTML(
                "beforeend",
                `<div class="vco-map-attribution">${attribution}</div>`,
            );
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
        // The IIIF layer sets its source asynchronously (after the info.json fetch)
        if (this._tile_layer.getSource()) {
            this._tile_layer.getSource().on("tileloadend", () => {
                this._onTilesLoaded(undefined);
            });
        }
        this._map.addLayer(this._tile_layer);
    }

    /**
     * Map tiles were allowed: attach the main tile layer and the minimap's
     * deferred layer, then re-fit.
     */
    _onTilesAllowed(): void {
        this._addTileLayer();
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
            } else if (marker.location()) {
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
        // natural size (the legacy renderer clamped edge tiles the same way)
        const tileGrid = new TileGrid({
            extent,
            origin: [extent[0], extent[3]],
            resolutions: Array.from(
                { length: maxZoom + 1 },
                (_, i) => 40075016.68557849 / (256 * 2 ** i),
            ),
            tileSize: 256,
        });
        return { sizes, maxZoom, extent, tileGrid };
    }

    _createTileLayer(map_type: string): TileLayer {
        const _map_type_arr = map_type.split(":");

        switch (_map_type_arr[0]) {
            case "mapbox": {
                let mapbox_url;
                if (_map_type_arr.length > 2) {
                    // new form mapbox URL:
                    // mapbox://styles/nuknightlab/cjl6w8oio0agu2sltd04tp1kx
                    const this_mapbox_map = _map_type_arr[2].slice("//styles/".length);
                    mapbox_url =
                        "https://api.mapbox.com/styles/v1/" +
                        this_mapbox_map +
                        "/tiles/256/{z}/{x}/{y}@2x?access_token=" +
                        this.options.map_access_token;
                } else {
                    // legacy configuration
                    // nuknightlab.cjl6w8oio0agu2sltd04tp1kx
                    const mapbox_name = _map_type_arr[1];
                    mapbox_url =
                        "https://api.tiles.mapbox.com/v4/" +
                        mapbox_name +
                        "/{z}/{x}/{y}.png?access_token=" +
                        this.options.map_access_token;
                }
                return new TileLayer({
                    source: new XYZ({
                        url: mapbox_url,
                        attributions: [],
                        crossOrigin: "anonymous",
                    }),
                });
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
                        const fallback = info as { width: number; height: number };
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
                            this._onTilesLoaded(undefined);
                        } else {
                            source.once("change", () => {
                                if (source.getState() === "ready") {
                                    this._markerOverview();
                                    this._onTilesLoaded(undefined);
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
                // mapping). Locations use native lat/lon.
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
                            const [z, x, y] = tile;
                            if (z < 0 || z > pyramidMaxZoom) return undefined;
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
            default: // osm is the default now
                return new TileLayer({ source: new OSM({ attributions: [] }) });
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

        this._tile_layer_mini = this._createTileLayer(this.options.map_type);
        // consent mode: the minimap layer is only attached once map tiles
        // are allowed (creating the layer object loads nothing)
        const consent = consentManagerOf(this.options);
        const tile_service = consentMessage("consent_service_tiles", "map tiles");
        const tiles_allowed = !(
            this.options.consent_required &&
            consent &&
            !consent.isGranted(tile_service)
        );
        const is_image_map = this.options.map_type === "iiif" && this.options.map_as_image;
        // Legacy zoomify maps are mercator-based: give the minimap a view
        // constrained to the pyramid's upper levels and fit the image's
        // mercator bounds — a fixed zoom pins it to the smallest, blurry
        // pyramid level
        const is_zoomify = this.options.map_type === "zoomify";
        const zoomify_pyramid = is_zoomify ? this._zoomifyPyramid() : null;
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
                              ...(zoomify_pyramid
                                  ? {
                                        // keep the minimap within the
                                        // pyramid's crisp levels
                                        minZoom: Math.max(0, zoomify_pyramid.maxZoom - 2),
                                        maxZoom: zoomify_pyramid.maxZoom,
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
            layers: tiles_allowed ? [this._tile_layer_mini] : [],
            collapseLabel: "\u00bb",
            label: "\u00ab",
            collapsed: true,
        });
        this._map.addControl(this._mini_map);

        if (zoomify_pyramid) {
            // show the image pyramid's extent in the minimap
            this._mini_map.getOverviewMap().getView().fit(zoomify_pyramid.extent, {
                size: this._mini_map.getOverviewMap().getSize(),
            });
        } else if (!is_zoomify && this.bounds_array && this.bounds_array.length) {
            this._fitView(this._mini_map.getOverviewMap(), this.bounds_array);
        }

        if (this.options.map_type === "iiif" && this.options.map_as_image) {
            // in image mode there are no geo markers to fit, so show the
            // whole image instead (issues #465, #355)
            this._fitMiniMapToImage();
        }
    }

    _fitMiniMapToImage(): void {
        const fit_mini_image = () => {
            try {
                const mini_source = this._tile_layer_mini.getSource() as {
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
                const src = this._tile_layer_mini.getSource();
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

    /*	Create Background Map
	================================================== */
    _createBackgroundMap(tiles: unknown): void {
        // Not needed with OpenLayers: the tile layer renders directly
    }

    _onTilesLoaded(e?: unknown): void {
        // Tiles have rendered; nothing further to do in OpenLayers
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
     * The View extent for the `map_bbox` option, or `null` when unset.
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
     * the story inside the visible region; transparent panels add nothing.
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
        const layout = this.options.layout;
        if (layout === "portrait") {
            padding[2] += Math.max(0, map_rect.bottom - panel_rect.top);
        } else {
            padding[1] += Math.max(0, panel_rect.right - map_rect.left);
        }
        return padding;
    }

    _fitView(ol_map: OlMap, coords: number[][], duration = 0): void {
        if (!coords || !coords.length) return;
        const view_coords = this._markerCoordsToViewCoords(coords);
        const extent = boundingExtent(view_coords);
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
     * Replace a line's geometry. With `animate.duration > 0` the active line
     * is drawn progressively, in sync with the view animation: the target
     * path is truncated by cumulative length at the eased progress, so half
     * way through the pan only half the route is red.
     */
    _replaceLines(
        line: VectorLayer,
        array: LinePoint[],
        animate?: { duration: number; retractFrom?: LinePoint[] },
    ): void {
        const pts = array.map((d) => {
            const lat = d.location ? d.location.lat : d.lat;
            const lon = d.location ? d.location.lon : d.lon;
            return [lon, lat];
        });
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

        // Retraction (backward navigation): the animation path is the route
        // up to the previous marker (retractFrom); the drawn length shrinks
        // from its full extent down to the new path's length — the far end
        // pulls back from the old marker to the new one.
        const retract_coords = animate?.retractFrom
            ? this._markerCoordsToViewCoords(
                  (() => {
                      const r = (animate.retractFrom ?? []).map((d) => {
                          const lat = d.location ? d.location.lat : d.lat;
                          const lon = d.location ? d.location.lon : d.lon;
                          return [lon, lat];
                      });
                      const rl = this._unwrapLongitudes(r.map((p) => p[0] as number));
                      return r.map((p, i) => [rl[i], p[1]]);
                  })(),
              )
            : null;
        const retract_total = retract_coords ? this._pathLength(retract_coords) : 0;
        const target_total = this._pathLength(view_coords);

        const easing = this.options.ease as ((t: number) => number) | undefined;
        const start_time = performance.now();
        const step = (now: number) => {
            const t = Math.min(1, Math.max(0, (now - start_time) / duration));
            const eased = easing ? easing(t) : t;
            if (retract_coords && retract_total > target_total) {
                // pull the far end back along the retraction path
                const drawn = retract_total - eased * (retract_total - target_total);
                setGeometry(this._truncatePath(retract_coords, drawn));
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

    _getMapLocation(m: LatLngLiteral): unknown {
        return this._map.getPixelFromCoordinate(this._toViewCoords(m));
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

        if (this.options.map_type === "iiif" && this.options.map_as_image) {
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
                // and animate there so the markers clear the story panel
                this._fitView(this._map, this.bounds_array, 0);
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
                    // Rebuild the tile layer for the new map type
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
                        this._map.addLayer(this._tile_layer);
                    }
                    this._el.map.style.backgroundColor = this.options.map_background_color;
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

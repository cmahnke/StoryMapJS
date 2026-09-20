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
import OverviewMap from "ol/control/OverviewMap";
import { defaults as interactionDefaults } from "ol/interaction";
import { applyStyle } from "ol-mapbox-style";
import IIIFInfo, { type ImageInformationResponse } from "ol/format/IIIFInfo";

import "ol/ol.css";

import Map from "../Map";
import OpenLayersMapMarker from "./MapMarker.OpenLayers";
import type { LinePoint, ViewToOptions } from "../types";
import type { LatLngLiteral, StorymapSlide, StorymapSlideLocation } from "../../types";

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

    /*	Create the Map
	================================================== */
    _createMap(): void {
        const is_image_map = this.options.map_type === "iiif" && this.options.map_as_image;

        // Caller-supplied OpenLayers options: controls/interactions replace the
        // defaults, view merges over the computed default, other options pass through
        const user_map_options = this.options.map_options ?? {};
        const { element: _element, view: user_view, ...passthrough } = user_map_options;
        const user_view_options = (user_view ?? {}) as Record<string, unknown>;

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
                ...user_view_options,
            }),
        });

        this._map.on("loadend", () => {
            this._onMapLoaded(undefined);
        });

        // Create Tile Layer
        this._tile_layer = this._createTileLayer(this.options.map_type);
        // The IIIF layer sets its source asynchronously (after the info.json fetch)
        if (this._tile_layer.getSource()) {
            this._tile_layer.getSource().on("tileloadend", () => {
                this._onTilesLoaded(undefined);
            });
        }

        // Add Tile Layer
        this._map.addLayer(this._tile_layer);

        // Create Overall Connection Line
        this._line = this._createLine();
        this._line.setStyle(
            new Style({
                stroke: new Stroke({
                    color: this.options.line_color_inactive,
                    width: this.options.line_weight,
                }),
            }),
        );
        this._addLineToMap(this._line);
        this._line.setOpacity(this.options.line_opacity);

        // Create Active Line
        this._line_active = this._createLine();
        this._line_active.setStyle(
            new Style({
                stroke: new Stroke({
                    color: this.options.line_color,
                    width: this.options.line_weight,
                }),
            }),
        );
        this._addLineToMap(this._line_active);
        this._line.setOpacity(this.options.line_opacity);

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
        const layer = new VectorTileLayer({ declutter: true });
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
        const is_image_map = this.options.map_type === "iiif" && this.options.map_as_image;
        this._mini_map = new OverviewMap({
            view: new View({
                projection: this._map.getView().getProjection(),
                center: this._map.getView().getCenter(),
                zoom: this.zoom_min_max.min || 0,
                // same reasoning as the main image view: no world constraints
                ...(is_image_map
                    ? {
                          multiWorld: true,
                          resolutions: IMAGE_RESOLUTIONS,
                          minZoom: 0,
                          maxZoom: IMAGE_RESOLUTIONS.length - 1,
                      }
                    : {}),
            }),
            layers: [this._tile_layer_mini],
            collapseLabel: "\u00bb",
            label: "\u00ab",
            collapsed: true,
        });
        this._map.addControl(this._mini_map);

        if (this.bounds_array && this.bounds_array.length) {
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
        return coords;
    }

    _markerCoordsToViewCoords(coords: number[][]): number[][] {
        const is_image_space = this._map.getView().getProjection().getCode() === "EPSG:4326";
        if (is_image_space) return coords.map((c) => [c[0], c[1]]);
        return coords.map((c) => fromLonLat(c));
    }

    _fitView(ol_map: OlMap, coords: number[][], duration = 0): void {
        if (!coords || !coords.length) return;
        const view_coords = this._markerCoordsToViewCoords(coords);
        const extent = boundingExtent(view_coords);
        ol_map.getView().fit(extent, {
            size: ol_map.getSize(),
            padding: [15, 15, 15, 15],
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

    _createLine(d?: StorymapSlide): VectorLayer {
        return new VectorLayer({
            source: new VectorSource({ features: [] }),
            style: new Style({
                stroke: new Stroke({
                    color: this.options.line_color,
                    width: this.options.line_weight,
                }),
            }),
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
        coords.push(this._toViewCoords({ lat: d.location.lat, lon: d.location.lon }));
        feature.getGeometry().setCoordinates(coords);
    }

    _replaceLines(line: VectorLayer, array: LinePoint[]): void {
        const pts = array.map((d) => {
            const lat = d.location ? d.location.lat : d.lat;
            const lon = d.location ? d.location.lon : d.lon;
            return [lon, lat];
        });
        const source = line.getSource();
        source.clear();
        source.addFeature(
            new Feature({ geometry: new LineString(this._markerCoordsToViewCoords(pts)) }),
        );
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
        const c = toLonLat(coord, projection);
        return { lat: c[1], lon: c[0] };
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

    _markerOverview(duration?: number): void {
        // Hide Active Line
        this._line_active.setVisible(false);

        if (this.options.map_type === "iiif" && this.options.map_as_image) {
            const source = this._tile_layer.getSource();
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
                        const center_px = [
                            (extent[0] + extent[2]) / 2,
                            (extent[1] + extent[3]) / 2,
                        ];
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

            if (
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
                    this._tile_layer = this._createTileLayer(this.options.map_type);
                    this._map.addLayer(this._tile_layer);
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
                    const stroke = (color: string) =>
                        new Style({
                            stroke: new Stroke({
                                color: color,
                                width: this.options.line_weight,
                                lineDash: String(this.options.line_dash)
                                    .split(",")
                                    .map((v) => Number(v)),
                                lineJoin: this.options.line_join as CanvasLineJoin,
                            }),
                        });
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

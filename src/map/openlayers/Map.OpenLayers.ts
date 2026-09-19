import OlMap from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, OSM, IIIF } from "ol/source";
import VectorSource from "ol/source/Vector";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { Style, Stroke } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import { boundingExtent } from "ol/extent";
import OverviewMap from "ol/control/OverviewMap";
import { defaults as interactionDefaults } from "ol/interaction";

import "ol/ol.css";

import { classMixin } from "../../core/Util";
import Map from "../Map";
import Events from "../../core/Events";
import OpenLayersMapMarker from "./MapMarker.OpenLayers";

/*	Map.OpenLayers
	Creates a Map using OpenLayers
================================================== */

const MAX_ZOOM = 19;

export default class OpenLayers extends Map {
    declare "_map": any;
    declare "_el": any;
    declare "options": any;
    declare "_tile_layer": any;
    declare "_image_layer": any;
    declare "_line": any;
    declare "_line_active": any;
    declare "zoom_min_max": any;
    declare "bounds_array": any;
    declare "_markers": any;
    declare "_tile_layer_mini": any;
    declare "_mini_map": any;
    declare "fire": any;
    declare "timer": any;
    declare "current_marker": any;

    /*	Create the Map
	================================================== */
    _createMap() {
        const is_image_map = this.options.map_type === "iiif" && this.options.map_as_image;

        this._map = new OlMap({
            target: this._el.map,
            controls: [],
            interactions: [],
            view: new View({
                projection: is_image_map ? "EPSG:4326" : "EPSG:3857",
                center: [0, 0],
                zoom: 0,
                minZoom: 0,
                maxZoom: is_image_map ? 12 : MAX_ZOOM,
            }),
        });

        this._map.on("loadend", () => {
            this._onMapLoaded(undefined);
        });

        // Create Tile Layer
        this._tile_layer = this._createTileLayer(this.options.map_type);
        // The IIIF layer sets its source asynchronously (after the info.json fetch)
        if (this._tile_layer.getSource()) {
            this._tile_layer.getSource().on("tilesloadend", () => {
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
        this._map.addLayer(this._line);
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
        this._map.addLayer(this._line_active);
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

    _getAttribution(map_type) {
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
    _createTileLayer(map_type) {
        const _map_type_arr = map_type.split(":");

        switch (_map_type_arr[0]) {
            case "mapbox": {
                let mapbox_url;
                if (_map_type_arr.length > 2) {
                    // new form mapbox URL:
                    // mapbox://styles/nuknightlab/cjl6w8oio0agu2sltd04tp1kx
                    const this_mapbox_map = _map_type_arr[2].substr("//styles/".length);
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
                const iiif_layer = new TileLayer();
                fetch(this.options.iiif.url)
                    .then((r) => r.json())
                    .then((info) => {
                        const source = new IIIF({
                            url: this.options.iiif.url,
                            projection: "EPSG:4326",
                            size: [info.width, info.height],
                            attributions: this.options.iiif.attribution || [],
                        } as any);
                        iiif_layer.setSource(source);
                        source.once("change", () => {
                            if (source.getState() === "ready") {
                                this._markerOverview();
                                this._onTilesLoaded(undefined);
                            }
                        });
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

            case "osm":
            default: // osm is the default now
                return new TileLayer({ source: new OSM({ attributions: [] }) });
        }
    }

    /*	Create Mini Map
	================================================== */
    _createMiniMap() {
        if (this.options.map_as_image) {
            this.zoom_min_max.min = 0;
        }

        if (!this.bounds_array) {
            this.bounds_array = this._getAllMarkersBounds(this._markers);
        }

        this._tile_layer_mini = this._createTileLayer(this.options.map_type);
        this._mini_map = new OverviewMap({
            view: new View({
                projection: this._map.getView().getProjection(),
                center: this._map.getView().getCenter(),
                zoom: this.zoom_min_max.min || 0,
            }),
            layers: [this._tile_layer_mini],
            collapseLabel: "\u00bb",
            label: "\u00ab",
            collapsed: false,
        });
        this._map.addControl(this._mini_map);

        if (this.bounds_array && this.bounds_array.length) {
            this._fitView(this._mini_map.getOverviewMap(), this.bounds_array);
        }
    }

    /*	Create Background Map
	================================================== */
    _createBackgroundMap(tiles) {
        // Not needed with OpenLayers: the tile layer renders directly
    }

    _onTilesLoaded(e) {
        // Tiles have rendered; nothing further to do in OpenLayers
    }

    /*	Create Markers
	================================================== */
    _createMarker(d) {
        const marker = new OpenLayersMapMarker(d, this.options);
        marker.on("markerclick", this._onMarkerClick, this);
        this._addMarker(marker);
        this._markers.push(marker);
        marker.marker_number = this._markers.length - 1;
        this.fire("markerAdded", marker);
    }

    _addMarker(marker) {
        marker.addTo(this._map);
    }

    _removeMarker(marker) {
        if (marker && marker.data.real_marker) {
            marker._removeFrom(this._map);
        }
    }

    /*	Marker helpers
	================================================== */
    _getAllMarkersBounds(markers_array) {
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

    _markerCoordsToViewCoords(coords) {
        const is_image_space = this._map.getView().getProjection().getCode() === "EPSG:4326";
        if (is_image_space) return coords.map((c) => [c[0], c[1]]);
        return coords.map((c) => fromLonLat(c));
    }

    _fitView(ol_map, coords) {
        if (!coords || !coords.length) return;
        const view_coords = this._markerCoordsToViewCoords(coords);
        const extent = boundingExtent(view_coords);
        ol_map.getView().fit(extent, {
            size: ol_map.getSize(),
            padding: [15, 15, 15, 15],
            maxZoom: 12,
        });
    }

    _calculateMarkerZooms() {
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
                    (this.options.map_center_offset && this.options.map_center_offset.left !== 0) ||
                    this.options.map_center_offset.top !== 0
                ) {
                    calculated_zoom = calculated_zoom - 1;
                }

                marker.data.location.zoom = calculated_zoom;
            }
        }
    }

    /*	Line
	================================================== */

    _createLine(d?): any {
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

    _addLineToMap(line) {
        this._map.addLayer(line);
    }

    _addToLine(line, d) {
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

    _replaceLines(line, array) {
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
    _panTo(loc, animate) {
        this._map.getView().animate({
            center: this._toViewCoords(loc),
            duration: this.options.duration,
        });
    }

    _zoomTo(z, animate) {
        this._map.getView().animate({ zoom: z, duration: this.options.duration });
    }

    _viewTo(loc, opts?) {
        let _animate = true,
            _duration = this.options.duration,
            _zoom = this._getMapZoom(),
            _location = { lat: loc.lat, lon: loc.lon };

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
                    _duration = this.options.duration;
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
        });

        if (this._mini_map && this.options.width > this.options.skinny_size) {
            if (_zoom - 1 <= this.zoom_min_max.min) {
                this._mini_map.setCollapsed(true);
            } else {
                this._mini_map.setCollapsed(false);
            }
        }
    }

    _toViewCoords(loc) {
        const is_image_space = this._map.getView().getProjection().getCode() === "EPSG:4326";
        if (is_image_space) return [loc.lon, loc.lat];
        return fromLonLat([loc.lon, loc.lat]);
    }

    _getMapLocation(m) {
        return this._map.getPixelFromCoordinate(this._toViewCoords(m));
    }

    _getMapZoom() {
        return Math.round(this._map.getView().getZoom() || 0);
    }

    _getMapCenter(offset) {
        const center = toLonLat(
            this._map.getView().getCenter(),
            this._map.getView().getProjection(),
        );
        return { lat: center[1], lon: center[0] };
    }

    _getMapCenterOffset(location, zoom) {
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

    _fromViewCoords(coord, projection) {
        if (projection.getCode() === "EPSG:4326") return { lat: coord[1], lon: coord[0] };
        const c = toLonLat(coord, projection);
        return { lat: c[1], lon: c[0] };
    }

    _getBoundsZoom(origin, destination, correct_for_center) {
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

    _initialMapLocation() {
        // OpenLayers renders independently; nothing to subscribe for initial location
    }

    _markerOverview() {
        // Hide Active Line
        this._line_active.setVisible(false);

        if (this.options.map_type === "iiif" && this.options.map_as_image) {
            const source = this._tile_layer.getSource();
            const fit = () => {
                try {
                    const grid = source.getTileGrid();
                    if (grid) {
                        this._map.getView().fit(grid.getExtent(), {
                            size: this._map.getSize(),
                            padding: [0, 0, 0, 0],
                        });
                        if (this.options.map_center_offset) {
                            const view = this._map.getView();
                            const zoom = view.getZoom();
                            const center = this._getMapCenterOffset(
                                { lat: view.getCenter()[1], lon: view.getCenter()[0] },
                                zoom,
                            );
                            view.setCenter(this._toViewCoords(center));
                        }
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
                (this.options.map_center_offset && this.options.map_center_offset.left !== 0) ||
                this.options.map_center_offset.top !== 0
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
                        duration: this.options.duration,
                    });
                }
            } else {
                this._fitView(this._map, this.bounds_array);
            }
        }

        if (this._mini_map) {
            this._mini_map.setCollapsed(true);
        }
    }

    /*	Display
	================================================== */
    _updateMapDisplay(animate, d) {
        if (animate) {
            const duration = d ? d : this.options.duration;
            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(() => {
                this._refreshMap();
            }, duration);
        } else {
            if (!this.timer) {
                this._refreshMap();
            }
        }

        if (this._mini_map) {
            this._mini_map.setCollapsed(this._el.container.offsetWidth < this.options.skinny_size);
        }
    }

    _refreshMap() {
        if (this._map) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            this._map.updateSize();

            // Check to see if it's an overview
            if (
                this._markers[this.current_marker].data.type &&
                this._markers[this.current_marker].data.type === "overview"
            ) {
                this._markerOverview();
            } else {
                this._viewTo(this._markers[this.current_marker].data.location, {
                    zoom: this._getMapZoom(),
                });
            }
        }
    }
}

classMixin(OpenLayers, Events);
export { OpenLayers };

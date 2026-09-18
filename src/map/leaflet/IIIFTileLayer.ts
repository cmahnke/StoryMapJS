import * as L from "leaflet";

/*	IIIFTileLayer
	Displays an IIIF Image API (v2/v3) image as a Leaflet tile layer.

	Uses the info.json to determine image dimensions and maximum zoom,
	then requests image regions as tiles:
	{base}/{region}/{size}/{rotation}/{quality}.{format}
================================================== */

const DEFAULT_TILE_SIZE = 256;
const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default class IIIFTileLayer extends L.TileLayer {
    declare _info: any;
    declare _infoUrl: string;
    declare _imgWidth: number;
    declare _imgHeight: number;
    declare _maxZoomImage: number; // zoom where image renders 1:1
    declare _maxNativeZoom: number;

    constructor(infoUrl, options = {}) {
        const layerOptions: any = {
            tileSize: DEFAULT_TILE_SIZE,
            noWrap: true,
            updateWhenIdle: true,
            minZoom: 0,
            maxZoom: 8,
            attribution: "",
            ...options
        };
        super(infoUrl, layerOptions);

        this._infoUrl = infoUrl;
        this._info = null;
        this._imgWidth = 0;
        this._imgHeight = 0;
        this._maxZoomImage = 0;
        this._maxNativeZoom = 0;

        fetch(infoUrl)
            .then((r) => r.json())
            .then((info) => this._initFromInfo(info))
            .catch((err) => console.error("IIIF info.json could not be loaded:", infoUrl, err?.stack || err));
    }

    _initFromInfo(info) {
        this._info = info;

        const width = info.width || 0;
        const height = info.height || 0;
        if (!width || !height) {
            console.error("IIIF info.json has no dimensions:", info);
            return;
        }

        const tiles = (info.tiles && info.tiles[0]) || {};
        const scaleFactors: number[] = tiles.scaleFactors || [];
        const maxSF = Math.max(1, ...scaleFactors);

        // Deepest zoom where one tile (256px) renders image pixels 1:1
        this._imgWidth = width;
        this._imgHeight = height;
        this._maxZoomImage = Math.ceil(Math.log2(Math.max(width, height) / DEFAULT_TILE_SIZE));
        // Don't request smaller regions than the server's declared scale factors
        this._maxNativeZoom = Math.max(0, this._maxZoomImage - Math.round(Math.log2(maxSF)));

        this.options.maxZoom = this._maxZoomImage + 3; // allow upscaled overzoom
        this.options.maxNativeZoom = this._maxNativeZoom;
        this.options.minZoom = 0;

        this.fire("infoLoaded");
        this.redraw();
    }

    getTileUrl(coords) {
        if (!this._info) {
            return BLANK_TILE;
        }

        const z = Math.min(coords.z, this._maxZoomImage);
        const sf = Math.pow(2, this._maxZoomImage - z);

        // Tile lies outside the image bounds
        const maxX = Math.ceil(this._imgWidth / (DEFAULT_TILE_SIZE * sf));
        const maxY = Math.ceil(this._imgHeight / (DEFAULT_TILE_SIZE * sf));
        if (coords.x < 0 || coords.y < 0 || coords.x >= maxX || coords.y >= maxY) {
            return BLANK_TILE;
        }

        const base = this._infoUrl.replace(/\/info\.json$/, "");

        // Region covered by this tile, in image pixels
        const x0 = Math.max(0, Math.round(coords.x * DEFAULT_TILE_SIZE * sf));
        const y0 = Math.max(0, Math.round(coords.y * DEFAULT_TILE_SIZE * sf));
        const rw = Math.min(DEFAULT_TILE_SIZE * sf, this._imgWidth - x0);
        const rh = Math.min(DEFAULT_TILE_SIZE * sf, this._imgHeight - y0);

        if (rw <= 0 || rh <= 0) {
            return BLANK_TILE;
        }

        // Requested output size (downscaled by the scale factor)
        const w = Math.ceil(rw / sf);
        const h = Math.ceil(rh / sf);

        // v2 uses "@id", v3 "id" - but the base URL is the same for both
        return `${base}/${x0},${y0},${rw},${rh}/${w},${h}/0/default.jpg`;
    }

    /*	Bounds of the image in geographic coordinates (for fitting the map)
	================================================== */
    getIIIFBounds(map) {
        const crs = map.options.crs;
        const topleft = crs.pointToLatLng(L.point(0, 0), 0);
        const bottomright = crs.pointToLatLng(
            L.point(this._imgWidth / Math.pow(2, this._maxZoomImage), this._imgHeight / Math.pow(2, this._maxZoomImage)),
            0
        );
        return L.latLngBounds(topleft, bottomright);
    }

    /*	Center/zoom that fits the image into the given map (overview mode)
	================================================== */
    getCenterZoom(map) {
        const size = map.getSize();
        const crs = map.options.crs;

        // Before the info.json has loaded, return a safe default
        if (!this._imgWidth || !this._imgHeight) {
            return { center: crs.pointToLatLng(L.point(0, 0), 0), zoom: 0 };
        }

        let zoom = 0;
        if (this._imgWidth && this._imgHeight) {
            const fit_zoom_x = size.x / (this._imgWidth / Math.pow(2, this._maxZoomImage));
            const fit_zoom_y = size.y / (this._imgHeight / Math.pow(2, this._maxZoomImage));
            zoom = Math.floor(Math.log2(Math.min(fit_zoom_x, fit_zoom_y)));
            zoom = Math.max(0, Math.min(zoom, this._maxZoomImage));
        }

        const center_px = L.point(
            (this._imgWidth / Math.pow(2, this._maxZoomImage)) / 2,
            (this._imgHeight / Math.pow(2, this._maxZoomImage)) / 2
        );
        const center = crs.pointToLatLng(center_px, zoom);

        return { center: center, zoom: zoom };
    }
}

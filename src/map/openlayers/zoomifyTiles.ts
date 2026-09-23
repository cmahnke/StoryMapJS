import type ImageTile from "ol/ImageTile";

/** Zoomify tiles are always addressed on a 256px grid. */
export const ZOOMIFY_TILE_SIZE = 256;

/**
 * Pad a cropped Zoomify edge tile onto a full tile canvas.
 *
 * Zoomify edge tiles are cropped to the image bounds (e.g. a 256x19 bottom
 * strip), but OpenLayers draws the loaded image over the whole 256x256 tile
 * box — stretching those strips across the cell (the smeared bottom in the
 * Bosch overview, stretched right/bottom edges in the Literary Trail). The
 * crop is top-left aligned in the tile cell, so draw it at (0, 0) and leave
 * the rest transparent: the per-tile clamp of the original Leaflet renderer.
 * Full-size tiles are left untouched for OpenLayers' own load handling.
 */
export function padCroppedZoomifyTile(tile: ImageTile, image: HTMLImageElement): void {
    if (
        image.naturalWidth !== ZOOMIFY_TILE_SIZE ||
        image.naturalHeight !== ZOOMIFY_TILE_SIZE
    ) {
        const canvas = document.createElement("canvas");
        canvas.width = ZOOMIFY_TILE_SIZE;
        canvas.height = ZOOMIFY_TILE_SIZE;
        canvas.getContext("2d")?.drawImage(image, 0, 0);
        tile.setImage(canvas);
    }
}

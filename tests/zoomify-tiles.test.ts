import { test, expect, vi, afterEach } from "vitest";
import type ImageTile from "ol/ImageTile";
import { padCroppedZoomifyTile, ZOOMIFY_TILE_SIZE } from "../src/map/openlayers/zoomifyTiles";

const realCreateElement = document.createElement.bind(document);

function fakeCanvas() {
    const drawImage = vi.fn();
    const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({ drawImage })),
        __drawImage: drawImage,
    };
    return canvas;
}

let canvases: ReturnType<typeof fakeCanvas>[];
vi.spyOn(document, "createElement").mockImplementation(((tag: string, ...rest: unknown[]) => {
    if (tag === "canvas") {
        const canvas = fakeCanvas();
        canvases.push(canvas);
        return canvas;
    }
    return (realCreateElement as (...args: unknown[]) => unknown)(tag, ...rest);
}) as typeof document.createElement);

afterEach(() => {
    canvases = [];
});

function fakeTile() {
    return { setImage: vi.fn() } as unknown as ImageTile;
}

function fakeImage(w: number, h: number) {
    return { naturalWidth: w, naturalHeight: h } as HTMLImageElement;
}

test("full-size tiles are left untouched", () => {
    canvases = [];
    const tile = fakeTile();
    padCroppedZoomifyTile(tile, fakeImage(256, 256));
    expect(canvases.length).toBe(0);
    expect(tile.setImage as unknown as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
});

test("cropped edge tiles are padded onto a full tile canvas, top-left aligned", () => {
    canvases = [];
    const tile = fakeTile();
    const image = fakeImage(256, 19);
    padCroppedZoomifyTile(tile, image);
    expect(canvases.length).toBe(1);
    expect(canvases[0].width).toBe(ZOOMIFY_TILE_SIZE);
    expect(canvases[0].height).toBe(ZOOMIFY_TILE_SIZE);
    expect(canvases[0].__drawImage).toHaveBeenCalledWith(image, 0, 0);
    expect(tile.setImage as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        canvases[0],
    );
});

test("cropped right-column tiles are padded too", () => {
    canvases = [];
    const tile = fakeTile();
    padCroppedZoomifyTile(tile, fakeImage(88, 256));
    expect(canvases.length).toBe(1);
    expect(tile.setImage as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalled();
});

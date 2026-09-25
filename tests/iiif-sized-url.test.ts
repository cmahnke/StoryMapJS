import { describe, expect, it } from "vitest";
import { iiifSizedUrl } from "../src/media/types/Image";

/**
 * Responsive image sizes (perf, backwards-compatible): IIIF Image API
 * URLs request a container-matched width, everything else renders
 * byte-identically (golden URLs unchanged).
 */
describe("iiifSizedUrl", () => {
    it("rewrites the size component of IIIF image URLs", () => {
        expect(
            iiifSizedUrl("https://iiif.example.org/iiif/2/image/full/max/0/default.jpg", 600),
        ).toBe("https://iiif.example.org/iiif/2/image/full/600,/0/default.jpg");
        expect(
            iiifSizedUrl(
                "https://iiif.example.org/iiif/3/prefix/image%2Fid/full/full/0/default.jpg",
                320,
            ),
        ).toBe("https://iiif.example.org/iiif/3/prefix/image%2Fid/full/320,/0/default.jpg");
    });

    it("keeps the query string", () => {
        expect(
            iiifSizedUrl("https://iiif.example.org/iiif/2/i/full/max/0/default.jpg?x=1", 600),
        ).toBe("https://iiif.example.org/iiif/2/i/full/600,/0/default.jpg?x=1");
    });

    it("leaves non-IIIF URLs byte-identical (golden)", () => {
        for (const url of [
            "https://example.com/photo.jpg",
            "https://example.com/photo.webp?v=2",
            "https://tiles.example.com/{z}/{x}/{y}.png",
            "https://example.com/assets/photo-large.jpeg",
        ]) {
            expect(iiifSizedUrl(url, 600)).toBe(url);
        }
    });

    it("returns null/invalid widths unchanged", () => {
        expect(iiifSizedUrl(null, 600)).toBeNull();
        expect(iiifSizedUrl("https://iiif.example.org/iiif/2/i/full/max/0/default.jpg", 0)).toBe(
            "https://iiif.example.org/iiif/2/i/full/max/0/default.jpg",
        );
    });
});

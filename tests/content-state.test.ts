import { describe, expect, it } from "vitest";
import {
    CONTENT_STATE_PARAM,
    decodeContentState,
    encodeContentState,
    formatContentState,
    parseContentState,
} from "../src/storymap/content-state";

/**
 * IIIF Content State 1.0. The spec
 * defines four forms and a client should accept all of them; the awkward part is
 * the encoding rule, which is deliberately asymmetric — a plain URI is never
 * encoded, a JSON-LD form always is.
 */
describe("content state", () => {
    describe("the encoding of §6.1", () => {
        it("matches the spec's own example byte for byte", () => {
            // the condensed Target Body from §6.3.2, verbatim, and the
            // encoding the spec publishes for it
            const target =
                '{"id":"https://example.org/object1/canvas7#xywh=1000,2000,1000,2000",' +
                '"type":"Canvas","partOf":[{"id":"https://example.org/object1/manifest",' +
                '"type":"Manifest"}]}';
            expect(encodeContentState(target)).toBe(
                "JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUub3JnJTJGb2JqZWN0" +
                    "MSUyRmNhbnZhczclMjN4eXdoJTNEMTAwMCUyQzIwMDAlMkMxMDAwJTJDMjAwMCUyMiUy" +
                    "QyUyMnR5cGUlMjIlM0ElMjJDYW52YXMlMjIlMkMlMjJwYXJ0T2YlMjIlM0ElNUIlN0Il" +
                    "MjJpZCUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGZXhhbXBsZS5vcmclMkZvYmplY3QxJTJG" +
                    "bWFuaWZlc3QlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q",
            );
        });

        it("survives non-ASCII text, which base64 alone would mangle", () => {
            const original = '{"id":"https://example.org/canvas/1","label":"Grüße — 日本語"}';
            expect(decodeContentState(encodeContentState(original))).toBe(original);
        });

        it("carries no characters a URL would re-encode", () => {
            const encoded = encodeContentState(
                '{"id":"https://example.org/c/1?a=1&b=2#xywh=1,2,3,4"}',
            );
            expect(encoded).not.toMatch(/[+/=]/);
        });

        it("rejects a length that cannot be restored to a base64 multiple", () => {
            // 4n+1 is unrecoverable, and the spec's own sample code throws
            expect(() => decodeContentState("abcde")).toThrow(/InvalidLengthError/);
        });
    });

    describe("reading the four forms", () => {
        it("2.2.4 Target URI — a plain string, unencoded", () => {
            expect(parseContentState("https://example.org/canvas/3")).toEqual({
                id: "https://example.org/canvas/3",
            });
        });

        it("2.2.4 with an xywh fragment", () => {
            expect(parseContentState("https://example.org/canvas/3#xywh=10,20,30,40")).toEqual({
                id: "https://example.org/canvas/3",
                region: [10, 20, 30, 40],
            });
        });

        it("2.2.3 Target Body — the encoded JSON-LD fragment", () => {
            const body = JSON.stringify({
                id: "https://example.org/canvas/7#xywh=100,200,100,200",
                type: "Canvas",
                partOf: [{ id: "https://example.org/manifest", type: "Manifest" }],
            });
            expect(parseContentState(encodeContentState(body))).toEqual({
                id: "https://example.org/canvas/7",
                region: [100, 200, 100, 200],
            });
        });

        it("2.2.1 full Annotation, with the contentState motivation", () => {
            const annotation = {
                "@context": "http://iiif.io/api/presentation/3/context.json",
                id: "https://example.org/bookmark/1",
                type: "Annotation",
                motivation: ["contentState"],
                target: {
                    id: "https://example.org/canvas/2#xywh=1,2,3,4",
                    type: "Canvas",
                    partOf: [{ id: "https://example.org/manifest", type: "Manifest" }],
                },
            };
            expect(parseContentState(encodeContentState(JSON.stringify(annotation)))).toEqual({
                id: "https://example.org/canvas/2",
                region: [1, 2, 3, 4],
            });
        });

        it("inline JSON-LD, which the spec's other mechanisms allow unencoded", () => {
            // data-iiif-content, paste and drag-and-drop all pass JSON-LD
            // through *without* content-state-encoding
            expect(
                parseContentState('{"id":"https://example.org/canvas/5","type":"Canvas"}'),
            ).toEqual({ id: "https://example.org/canvas/5" });
        });

        it("5.2 a SpecificResource with an xywh selector", () => {
            const annotation = {
                type: "Annotation",
                motivation: ["contentState"],
                target: {
                    type: "SpecificResource",
                    source: {
                        id: "https://example.org/canvas/9",
                        type: "Canvas",
                        partOf: [{ id: "https://example.org/manifest", type: "Manifest" }],
                    },
                    selector: { type: "ImageApiSelector", value: "xywh=pixel:5,6,7,8" },
                },
            };
            expect(parseContentState(encodeContentState(JSON.stringify(annotation)))).toEqual({
                id: "https://example.org/canvas/9",
                region: [5, 6, 7, 8],
            });
        });

        it("5.3 several targets — the first, since a storymap is linear", () => {
            const annotation = {
                type: "Annotation",
                motivation: "contentState",
                target: [
                    { id: "https://example.org/a/canvas/37", type: "Canvas" },
                    { id: "https://example.org/b/canvas/99", type: "Canvas" },
                ],
            };
            expect(parseContentState(JSON.stringify(annotation))).toEqual({
                id: "https://example.org/a/canvas/37",
            });
        });

        it("returns null for anything it cannot act on", () => {
            for (const value of [
                null,
                undefined,
                "",
                "   ",
                "not a uri and not base64!!",
                '{"no":"target"}',
            ]) {
                expect(parseContentState(value), String(value)).toBeNull();
            }
        });
    });

    describe("writing", () => {
        it("a whole canvas is a plain URI, which the spec says not to encode", () => {
            expect(formatContentState({ id: "https://example.org/canvas/3" })).toBe(
                "https://example.org/canvas/3",
            );
        });

        it("a region is the Target Body form, content-state-encoded", () => {
            // §2.2.5: a bare URI cannot express part of a resource, so the
            // JSON-LD form is the only one that can carry a region
            const value = formatContentState(
                { id: "https://example.org/canvas/7", region: [1, 2, 3, 4] },
                "https://example.org/manifest",
            );
            expect(value).not.toMatch(/^https/);
            expect(JSON.parse(decodeContentState(value))).toEqual({
                id: "https://example.org/canvas/7#xywh=1,2,3,4",
                type: "Canvas",
                partOf: [{ id: "https://example.org/manifest", type: "Manifest" }],
            });
        });

        it("round-trips through the reader either way", () => {
            for (const state of [
                { id: "https://example.org/canvas/3" },
                {
                    id: "https://example.org/canvas/7",
                    region: [1, 2, 3, 4] as [number, number, number, number],
                },
            ]) {
                expect(parseContentState(formatContentState(state))).toEqual(state);
            }
        });
    });

    it("uses the parameter name the spec names", () => {
        expect(CONTENT_STATE_PARAM).toBe("iiif-content");
    });
});

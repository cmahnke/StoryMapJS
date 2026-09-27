import { HtmlMediaBase, type HtmlMediaKind } from "./HtmlMedia";

/*	Media.Video
	A <video> element with a single <source> child.
================================================== */

export default class Video extends HtmlMediaBase {
    protected spec() {
        return {
            kind: "video" as HtmlMediaKind,
            extensions: { mp4: "mp4", webm: "webm" },
        };
    }
}

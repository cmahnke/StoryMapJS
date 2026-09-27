import { HtmlMediaBase, type HtmlMediaKind } from "./HtmlMedia";

/*	Media.Audio
	An <audio> element with a single <source> child.
================================================== */

export default class Audio extends HtmlMediaBase {
    protected spec() {
        return {
            kind: "audio" as HtmlMediaKind,
            extensions: { mp3: "mpeg", wav: "wav", m4a: "mp4" },
        };
    }
}

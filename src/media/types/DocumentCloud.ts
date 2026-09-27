import { WebsiteBase } from "./Website";

/*	Media.DocumentCloud
	Embeds a DocumentCloud document viewer (issue #437) — the same iframe
	embed as the website type, with its own CSS class.
================================================= */

export default class DocumentCloud extends WebsiteBase {
    protected extraClass(): string {
        return "vco-media-documentcloud";
    }
}

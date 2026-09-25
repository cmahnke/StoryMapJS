import { test, expect } from "vitest";
// Vitest runs in the jsdom environment (vitest.config.ts)

const { buildIframe, sanitizeBlockquote, sanitizeSlideText, validateWebURL } =
    await import("../src/media/EmbedUtil");

/*	validateWebURL
================================================== */

test("validateWebURL accepts http and https", () => {
    expect(validateWebURL("https://example.com/a")).toBe("https://example.com/a");
    expect(validateWebURL("http://example.com/a")).toBe("http://example.com/a");
});

test("validateWebURL resolves relative and protocol-relative URLs", () => {
    // relative URLs resolve against the document origin (stock jsdom
    // default: http://localhost:3000/)
    expect(validateWebURL("/foo")).toBe("http://localhost:3000/foo");
    expect(validateWebURL("//example.com/x")).toBe("http://example.com/x");
});

test("validateWebURL rejects non-web protocols and empty values", () => {
    expect(validateWebURL("javascript:alert(1)")).toBe(null);
    expect(validateWebURL("data:text/html,<script>alert(1)</script>")).toBe(null);
    expect(validateWebURL("vbscript:x")).toBe(null);
    expect(validateWebURL("")).toBe(null);
    expect(validateWebURL(null)).toBe(null);
});

/*	buildIframe
================================================== */

test("buildIframe extracts src and presentation attributes from an embed code", () => {
    const iframe = buildIframe(
        '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
    );
    expect(iframe).toBeTruthy();
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe.getAttribute("src")).toBe("https://www.youtube.com/embed/abc123");
    expect(iframe.getAttribute("width")).toBe("560");
    expect(iframe.getAttribute("height")).toBe("315");
    expect(iframe.getAttribute("frameborder")).toBe("0");
    expect(iframe.hasAttribute("allowfullscreen")).toBe(true);
});

test("buildIframe strips event handlers and unknown attributes", () => {
    const iframe = buildIframe(
        '<iframe src="https://example.com/" onload="alert(1)" name="evil" srcdoc="<script>alert(1)</script>"></iframe>',
    );
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("onload")).toBe(null);
    expect(iframe.getAttribute("name")).toBe(null);
    expect(iframe.getAttribute("srcdoc")).toBe(null);
});

test("buildIframe discards markup outside the iframe", () => {
    const iframe = buildIframe(
        '<img src=x onerror="alert(1)"><iframe src="https://example.com/"></iframe><script>alert(1)</script>',
    );
    expect(iframe).toBeTruthy();
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe.getAttribute("src")).toBe("https://example.com/");
});

test("buildIframe rejects javascript: src", () => {
    expect(buildIframe('<iframe src="javascript:alert(1)"></iframe>')).toBe(null);
});

test("buildIframe rejects an iframe with no src", () => {
    expect(buildIframe("<iframe></iframe>")).toBe(null);
});

test("buildIframe accepts a bare URL that routed to the iframe type", () => {
    const iframe = buildIframe("https://example.com/iframe-demo");
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("src")).toBe("https://example.com/iframe-demo");
    expect(iframe.getAttribute("width")).toBe("100%");
});

test("buildIframe returns null for text that is neither embed nor URL", () => {
    expect(buildIframe("this mentions iframe but embeds nothing")).toBe(null);
});

/*	sanitizeBlockquote
================================================== */

function renderedHTML(fragment: Node) {
    const div = document.createElement("div");
    div.appendChild(fragment);
    return div.innerHTML;
}

test("sanitizeBlockquote keeps quote structure and text", () => {
    const html = renderedHTML(
        sanitizeBlockquote(
            "<blockquote><p>Truth is <em>rarely</em> pure.</p><cite>Oscar Wilde</cite></blockquote>",
        ) as Node,
    );
    expect(html).toBe(
        "<blockquote><p>Truth is <em>rarely</em> pure.</p><cite>Oscar Wilde</cite></blockquote>",
    );
});

test("sanitizeBlockquote drops script tags and their contents", () => {
    const html = renderedHTML(
        sanitizeBlockquote("<blockquote>quote</blockquote><script>alert(1)</script>") as Node,
    );
    expect(html).toBe("<blockquote>quote</blockquote>");
});

test("sanitizeBlockquote strips event handler and style attributes", () => {
    const html = renderedHTML(
        sanitizeBlockquote(
            '<blockquote onclick="alert(1)" style="color:red">quote</blockquote>',
        ) as Node,
    );
    expect(html).toBe("<blockquote>quote</blockquote>");
});

test("sanitizeBlockquote unwraps unknown tags but keeps their text", () => {
    const html = renderedHTML(
        sanitizeBlockquote("<div><blockquote>quote</blockquote><h1>heading</h1></div>") as Node,
    );
    expect(html).toBe("<blockquote>quote</blockquote>heading");
});

test("sanitizeBlockquote drops img-based XSS entirely", () => {
    const html = renderedHTML(
        sanitizeBlockquote('<blockquote>q<img src=x onerror="alert(1)"></blockquote>') as Node,
    );
    expect(html).toBe("<blockquote>q</blockquote>");
});

test("sanitizeBlockquote keeps links with valid href, drops javascript: href", () => {
    const good = renderedHTML(
        sanitizeBlockquote(
            '<blockquote><a href="https://example.com/">link</a></blockquote>',
        ) as Node,
    );
    expect(good).toBe(
        '<blockquote><a href="https://example.com/" target="_blank">link</a></blockquote>',
    );

    const bad = renderedHTML(
        sanitizeBlockquote(
            '<blockquote><a href="javascript:alert(1)">link</a></blockquote>',
        ) as Node,
    );
    expect(bad).toBe("<blockquote><a>link</a></blockquote>");
});

/*	sanitizeSlideText (issue #358)
================================================== */

test("sanitizeSlideText rebuilds iframe embeds with a validated src", () => {
    const html = renderedHTML(
        sanitizeSlideText(
            '<p>extra media:</p><iframe src="https://example.com/embed/123" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
        ) as Node,
    );
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://example.com/embed/123"');
    expect(html).toContain('width="560"');
    expect(html).toContain("loading=");
});

test("sanitizeSlideText drops javascript: iframes but keeps surrounding text", () => {
    const html = renderedHTML(
        sanitizeSlideText(
            '<p>before</p><iframe src="javascript:alert(1)"></iframe><p>after</p>',
        ) as Node,
    );
    expect(html).not.toContain("<iframe");
    expect(html).toContain("before");
    expect(html).toContain("after");
});

test("sanitizeSlideText strips scripts and event handlers but keeps formatting", () => {
    const html = renderedHTML(
        sanitizeSlideText(
            '<p class="intro" onclick="alert(1)">Hello <strong>world</strong></p><script>alert(1)</script><ul><li>one <code>x</code></li></ul>',
        ) as Node,
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onclick");
    expect(html).toContain("<strong>world</strong>");
    expect(html).toContain("<code>x</code>");
    expect(html).toContain('class="intro"');
});

test("sanitizeSlideText drops javascript: links but keeps the link text", () => {
    const html = renderedHTML(
        sanitizeSlideText('<p><a href="javascript:alert(1)">click</a></p>') as Node,
    );
    expect(html).toContain("click");
    expect(html).not.toContain("javascript:");
});

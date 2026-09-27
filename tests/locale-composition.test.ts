import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import en from "../src/language/locale/en.json";

/**
 * The consent service name is substituted into a sentence, so the two halves
 * have to compose. `{service}` may be substituted with a service whose name
 * starts with a vowel, a consonant, or nothing Latin at all, which is what
 * broke the Hungarian article and left stray spaces in the CJK templates.
 */
describe("locale composition", () => {
    const dir = join(process.cwd(), "src/language/locale");
    const locales = readdirSync(dir)
        // .expected-gaps.json shares the directory but is not a locale
        .filter((f) => f.endsWith(".json") && !f.startsWith("."))
        .map((f) => f.replace(/\.json$/, ""));

    function messages(locale: string): Record<string, string> {
        const raw = readFileSync(join(dir, `${locale}.json`), "utf8").replace(/^\uFEFF/, "");
        return (JSON.parse(raw) as { messages: Record<string, string> }).messages;
    }

    it("every locale that has both halves keeps the {service} placeholder", () => {
        for (const locale of locales) {
            const m = messages(locale);
            if (m.consent_message === undefined || m.consent_service_tiles === undefined) {
                continue;
            }
            expect(m.consent_message, `${locale} consent_message`).toContain("{service}");
            expect(m.consent_blocked, `${locale} consent_blocked`).toContain("{service}");
        }
    });

    it("no locale leaves a stray space around a substituted service", () => {
        for (const locale of locales) {
            const m = messages(locale);
            for (const [template, service] of [
                [m.consent_message, m.consent_service_tiles],
                [m.consent_blocked, m.consent_service_fonts],
            ] as const) {
                if (template === undefined || service === undefined) continue;
                const rendered = template.replace("{service}", service);
                expect(rendered, `${locale}`).not.toMatch(/ {2,}/);
                expect(rendered.trim(), `${locale}`).toBe(rendered);
                // French and several others put a space before "?" as a
                // typographic convention, so a general "no space before
                // punctuation" rule would be wrong
            }
        }
    });

    it("CJK templates do not pad the substitution with a space", () => {
        // These scripts do not separate words with spaces, so "{service} の"
        // and "来自 {service} 的" render with a stray gap. This is what the
        // first pass got wrong.
        for (const locale of ["jp", "zh-cn", "zh-tw", "ko"]) {
            const m = messages(locale);
            expect(m.consent_message, `${locale}`).not.toMatch(/\{\service\}\s/);
            expect(m.consent_message, `${locale}`).not.toMatch(/\s\{service\}/);
            expect(m.consent_blocked, `${locale}`).not.toMatch(/\{\service\}\s/);
            expect(m.consent_blocked, `${locale}`).not.toMatch(/\s\{service\}/);
        }
    });

    it("the Hungarian template avoids an article that depends on the word", () => {
        // "a(z)" is only correct when the substituted word starts with a
        // vowel; the service names start with consonants in every locale, so
        // the template must not reach for an article at all.
        const m = messages("hu");
        expect(m.consent_message).not.toMatch(/\ba\(z\)\s*\{service\}/);
        expect(m.consent_blocked).not.toMatch(/\ba\(z\)\s*\{service\}/);
    });

    it("a substituted service is never empty", () => {
        for (const locale of locales) {
            const m = messages(locale);
            for (const key of ["consent_service_tiles", "consent_service_fonts"]) {
                const value = m[key];
                if (value === undefined) continue;
                expect(value.trim(), `${locale} ${key}`).not.toBe("");
            }
        }
    });

    it("English, the reference, still composes", () => {
        const rendered = en.messages.consent_message.replace(
            "{service}",
            en.messages.consent_service_tiles,
        );
        expect(rendered).toBe("Load content from map tiles?");
    });
});

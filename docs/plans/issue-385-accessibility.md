# Issue #385 — accessibility: document the limits, hide the off-screen slides

> **Status.** §1 implemented (with `inert`: the iframe-preload probe passed);
> remainder proposed. Line numbers verified against the current tree.

`docs/KNOWN_ISSUES.md:97` marks #385 `partially applies`, noted as _"wave
landed: alt text, aria-live announcements, real buttons, reduced motion,
pinch-zoom"_. That note overstates what the suite actually guarantees, and the
gap is not visible from the tests:

- **Reduced motion covers 3 JS gates and 1 CSS block out of roughly 7
  motion sources.** JS gates three call sites (`StorySlider.ts:358`,
  `StoryMap.ts:1418`, `:1784`); CSS has exactly one block
  (`VCO.Slide.scss:174-177`). Unguarded: the infinite loading spinner
  (`VCO.Message.scss:51`), the background cross-fade
  (`StorySlider.ts:563-589`), the 3-second nav intro (`:653-670`),
  `scrollBy({behavior: "smooth"})` (`Slide.ts:363`).
- **The live-region assertion cannot fail.**
  `e2e/accessibility-live-region.spec.ts:23-25` compares the announcement
  against `el.dataset.previous`, and **no code in `src/` sets `dataset`**
  — so it degenerates to `.not.toBe("")` and never checks what was
  announced or that it changed.
- **Automated coverage is 8 tests (18 assertions) across 4 spec files**,
  with no axe, pa11y, Lighthouse, `eslint-plugin-jsx-a11y`, or a11y CI job
  anywhere (`package.json`, `eslint.config.js`, `.github/workflows/ci.yml`).

**This plan does not pursue conformance.** §508 conformance is determined per
deliverable, for a specific agency, against a specific baseline — not by a
library's test suite — and **no VPAT is claimed**. The goal is narrower: make
the limitations honestly documented, fix the one defect that makes the
documentation indefensible, and stop the documentation decaying.

---

## 1. Hide inactive slides from assistive tech

The single largest defect, and the one remediation this plan keeps.

`StorySlider._createSlides` (`StorySlider.ts:224-252`) builds every slide up
front. Positioning is a `left` transform (`:633`), and `SlideBase.show()` /
`hide()` are **literally empty**:

```ts
// src/slider/Slide.ts:185-189
show() {
    // Positioning is handled by StorySlider._updateDisplay
}

hide() {}
```

There is no `aria-hidden` and no `inert` anywhere on a slide — the only two
`aria-hidden` uses in `src/` are `SlideNav.ts:208` (an empty, non-focusable
div) and `StoryMap.ts:1672` (narration audio). A screen-reader user browsing
the widget therefore reads **every slide's headline, body and caption**,
including the ones translated off-screen.

### 1.1 Change

Toggle `aria-hidden="true"` and `inert` in `setActive()`
(`src/slider/Slide.ts:226-249`), at the same place `this.active` is already
flipped. One attribute write on the active slide, two on the inactive one.

Implemented with both attributes: the iframe-preload probe (§1.2) passed —
an inactive slide holding an iframe still builds its frame
(`tests/slide-visibility.test.ts`) — so no fallback was needed.

### 1.2 Resolve the `inert` risk first

`inert` on a slide containing an `<iframe>` can interfere with
`preloadSlides()`. **Probe that before committing to it.** If it does interfere,
ship `aria-hidden` alone — that alone fixes the exposure, which is the actual
defect — and record `inert` as a follow-up. Do not block the documentation on
it.

### 1.3 Tests

- With three slides, assert exactly one `.vco-slide` is exposed to assistive
  tech and that it is the active one; assert it changes on `goTo()`.
- Assert an inactive slide holding an iframe is still preloaded after the
  change (this is the regression §1.2 is about).

### 1.4 Specs this will disturb

`issue-472-keyboard.spec.ts` and `e2e/keyboard.spec.ts` click
`.vco-storyslider`, which is the container and is unaffected.
`accessibility-live-region.spec.ts` reads the region across slides and needs a
re-read. `e2e/known-issues/issue-305-start-at-slide.spec.ts` and the hash
bookmark specs assert on `current_slide`, which is state, not ARIA — unaffected.

---

## 2. Repair the assertion that cannot fail

`docs/RENOVATION_PLAN.md` and commit `babe4384` ("delete the tests that cannot
fail, and repair the ones that lie") set the precedent. Two items:

1. **`e2e/accessibility-live-region.spec.ts:17-28`** — capture the announced
   text _before_ `goTo()`, assert it **changed**, and add a case for a
   headline-less slide asserting the `Slide N of M` fallback
   (`StorySlider.ts:379-383`).
2. **`src/slider/StorySlider.ts:57-60`** — the element-cache doc comment says
   `live_region` "only exists when the slide announcements are enabled (the
   `a11y` option), so it starts out null". **There is no `a11y` option**
   (`rg 'a11y' src/` matches only that comment and two prose comments); the
   region is created unconditionally at `StorySlider.ts:685-689`. Correct the
   comment. Do **not** add the option — a host that embeds two viewers on one
   page currently gets two polite regions, which is correct, and an off-switch
   is not needed.

---

## 3. Accessibility section in README

A `## Accessibility` section stating what is and is not supported, per verified
evidence. No aspirational claims.

### 3.1 Supported, and guarded by a test

- Text alternatives on slide images, with a decorative `alt=""` branch
  (`Image.ts:88`, `_altText()` at `:102-115`); `alt` round-trips through IIIF
  `accessibilitySummary` (`iiif.ts:922-948`, `to-iiif.ts:774-775`).
- Menubar actions are real `<button>` elements (`MenuBar.ts:298-339`).
- Slide nav arrows are focusable with `aria-label`, operable with Enter and
  Space (`SlideNav.ts:196-199`, `:226-232`).
- Slide changes are announced through a polite `aria-live` / `role="status"`
  region (`StorySlider.ts:698-700`, `:379-383`).
- Reduced motion collapses the slide glide and keeps autoplay off
  (`accessibility-reduced-motion.spec.ts`).
- No positive `tabindex` anywhere — the two uses are both `"0"`
  (`SlideNav.ts:197`, `StorySlider.ts:763`).
- The embed page does not disable zoom (`accessibility-embed.spec.ts`).
- Inactive slides are hidden from assistive tech (`aria-hidden` + `inert`
  in `Slide.setActive()`), and the layer switcher exposes a real disclosure
  button with grouped radio/checkbox rows (`LayersControl.ts`).
- Author `<table>` semantics survive the sanitizer, including `scope` and
  `colspan` (`tests/embed_util.test.ts:280-292`).

### 3.2 Known limitations — not fixed in this repository

| Limitation                                                                                                                                                                                                                                                                                                                                                        | Evidence                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Map markers are pointer-only.** No keyboard route reaches any marker or its popup; the slide panel is the keyboard route to every slide.                                                                                                                                                                                                                        | `MapMarker.OpenLayers.ts:104`, `:114-143`                                                                                                                      |
| **No captions or transcripts for `audio`/`video`.** `media.subtitles` is opt-in and its `srclang` is hardcoded `"en"`. Providing captions is a host responsibility.                                                                                                                                                                                               | `HtmlMedia.ts:83-97`                                                                                                                                           |
| **Narration audio is `aria-hidden="true"` with no transcript.** A deliberate policy, previously undocumented.                                                                                                                                                                                                                                                     | `StoryMap.ts:1736`                                                                                                                                             |
| **Focus moves in exactly one place.** The layer panel returns focus to its disclosure button on Escape (`LayersControl.ts:197`); slide changes, consent dialogs and marker popups never move focus. There is no `.focus()` call elsewhere in `src/`. The consent dialog is visually modal with no `role="dialog"`, no trap and no Escape.                         | `VCO.Consent.scss:6-18`, `Consent.ts:307-380`                                                                                                                  |
| **Every `aria-label` is hardcoded English** — `"Next slide"`, `"3 / 12"`, `"Slide details"`, `"Close"`, `"Slide N of M"`, `"Subtitles"`. None are locale keys, so `npm run check:locales` cannot see them.                                                                                                                                                        | `SlideNav.ts:198-199`, `MenuBar.ts:214`, `MapMarker.OpenLayers.ts:292,297`, `StorySlider.ts:382` (a `textContent` fallback, not a label), `HtmlMedia.ts:92-93` |
| **Contrast below 4.5:1 in several places**: muted slide dates, media load-error text (`$ui-background-color` on the error panel), `#999` credits and blockquotes, the menubar focus ring (whose `outline-color` equals its own `background`), and landing-page links. No ratios cited — the exact pairs drift with the theme variables and are re-measured in §6. | `VCO.Media.Text.scss:38-44`, `VCO.Media.scss:29-35,160`, `Typography.scss:138`, `VCO.MenuBar.Button.scss:36-41`, `site.scss:411,508`                           |
| **Sparse `focus-visible` coverage**: none for the storyslider container, the nav arrows, or consent buttons; menubar buttons, layer rows and the popup close button have it.                                                                                                                                                                                      | `VCO.MenuBar.Button.scss:36`, `VCO.Layers.scss:88`, `VCO.MapMarker.scss:192`                                                                                   |
| **Contrast over author background images cannot be guaranteed.** `background.url`, `text_color` and `text_background_color` are author-controlled, and full-bleed slide text relies on a `text-shadow`.                                                                                                                                                           | `StoryMap.ts:1232-1238`, `Slide.ts:432-447`, `VCO.Media.Text.scss:70-87`                                                                                       |
| **Reflow below 320 CSS px is untested.** `.vco-skinny` breaks at `skinny_size: 650` (`StoryMap.ts:302`, checked at `:1433`), and the landscape layout hard-codes `width: 50%` (`VCO.StoryMap.scss:80-86`).                                                                                                                                                        | no `320`/`reflow` e2e test                                                                                                                                     |
| **Third-party embed accessibility is the vendor's conformance** (YouTube, Vimeo, Dailymotion, Facebook, SoundCloud, DocumentCloud, Google Docs, Flickr, Twitter/X, Wikipedia). The viewer guarantees only that a frame exists.                                                                                                                                    | `src/media/types/*`                                                                                                                                            |
| **Author headings in slide text are stripped.** `h1`–`h6` are not in the sanitizer's allowlist, so an author's `<h3>` is unwrapped to bare text.                                                                                                                                                                                                                  | `EmbedUtil.ts:103-164`                                                                                                                                         |

---

## 4. Correct the #385 row, keep the verdict

Replace the `wave landed` note with a pointer to the README section and the one
thing this plan fixed, and keep `partially applies`. Add that §508 conformance
is decided per deliverable by an external audit and that **no VPAT or ACR is
claimed**.

Do **not** split the row into per-provision rows. That was the earlier
proposal; with remediation out of scope there is nothing to close independently,
and a single honest row is more useful than five permanently-partial ones.

---

## 5. Keep the documentation true

Add `@axe-core/playwright` and one spec that asserts the harness, the embed page
(both the `?url=` and prompt paths) and the landing page carry **no violation of
the rules §3.1 claims to meet**: `frame-title`, `image-alt`, `heading-order`,
`link-name`, `button-name`, `aria-hidden-focus`. Wire it into
`.github/workflows/ci.yml` as a blocking step.

Deliberately **omit** `color-contrast`, `region` and `landmark-one-main`: those
are the known limitations listed in §3.2, and including them would make the job
permanently red, which is how a permanently-red gate stops being read.

Expect first-run failures on `image-alt` (custom/icon markers,
`MapMarker.OpenLayers.ts:122-126`, `:131-135`) and `frame-title` (nine
self-built iframes with no accessible name: `EmbedUtil.ts:274-279`,
`Website.ts:33`, `Facebook.ts:30`, `DailyMotion.ts:36`, `Vimeo.ts:40`, and the
YouTube player options). Those two are **cheap fixes** — `img.alt = ""` on a
decorative marker image, and a `title` on each constructed iframe — and should
land in the same commit as the gate so it can be green on arrival. They are
listed in §6 as a courtesy, not as scope creep.

---

## 6. Identified but deliberately out of scope

Recorded so the next reader knows these were found, not missed. None are planned
here.

| Gap                                                                                                                                                                                                                                                    | Fix                                                                                                  | Where                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Custom/image-icon marker `<img>` have no `alt`                                                                                                                                                                                                         | `img.alt = ""` — decorative, the parent div carries `title`                                          | `MapMarker.OpenLayers.ts:123-127`, `:132-136`                                                                                         |
| Nine self-built `<iframe>`s have no accessible name                                                                                                                                                                                                    | set `title` from a locale key                                                                        | `EmbedUtil.ts:273-278`, `Website.ts:33`, `Facebook.ts:30`, `DailyMotion.ts:36`, `Vimeo.ts:40`, the API-injected YouTube player iframe |
| `.vco-slide-calltoaction` is a click-only `<div>`                                                                                                                                                                                                      | real `<button type="button">`, following the `MenuBar.ts:298-339` precedent                          | `Slide.ts:378-391` (div `:379-383`, `click` `:390`)                                                                                   |
| `.vco-slide-scroll-hint` is a click-only `<div>`                                                                                                                                                                                                       | `<button>` with `aria-label`                                                                         | `Slide.ts:335-352` (div `:347`, `click` `:349`)                                                                                       |
| Menubar focus ring is its own background colour                                                                                                                                                                                                        | `outline-color: $color-dark`, restore default bg on focus                                            | `VCO.MenuBar.Button.scss:36-41`                                                                                                       |
| Four missing `:focus-visible` rules; nav label reveals on `:hover` only                                                                                                                                                                                | add rules; reveal on `:focus-visible` too                                                            | `VCO.StorySlider.scss`, `VCO.SlideNav.scss:92-97`, `VCO.Consent.scss:36-60`                                                           |
| Slide date `<h3>` emitted **before** the headline `<h2>` — a heading skip in the wrong direction                                                                                                                                                       | emit after, and as `<p class="vco-headline-date">`                                                   | `Text.ts:135` (`h3`), `:146` (`h2`)                                                                                                   |
| Suspect sub-4.5:1 colour pairs (dates, load-error text, credits, landing links — candidates, not measured verdicts)                                                                                                                                    | darken toward `$color-text`                                                                          | `VCO.Media.Text.scss:38-44`, `VCO.Media.scss:29-35,160`, `Typography.scss:138`, `VCO.SnapMap.scss:37,71`, `site.scss:411,508`         |
| Reduced motion covers 1 of ~6 motion sources                                                                                                                                                                                                           | one global `prefers-reduced-motion` block; gate `Slide.ts:346`, `StorySlider.ts:553-577`, `:643-658` | `VCO.StoryMap.scss`                                                                                                                   |
| Embed form and load errors are silent to AT                                                                                                                                                                                                            | `role="alert"`, `aria-invalid`, `aria-describedby`                                                   | `public/embed/index.html:128-136`, `:172-175`, `:192-194`                                                                             |
| `src/scss/core/Reset.scss` is dead (`.vco-storyjs` at `:4`, but the container is `.vco-storymap`) yet still compiled into the bundle, and carries `ol/ul { list-style: none }` (`:114-117`) — a VoiceOver list-semantics bug if it were ever re-scoped | delete, or re-scope **and** drop the list rule                                                       | `src/scss/core/Reset.scss`                                                                                                            |
| The dark theme (`Variables.Dark.scss`) ships but is in no `@use` list                                                                                                                                                                                  | finish or delete                                                                                     | `src/scss/VCO.StoryMap.scss:14-42`                                                                                                    |
| `VCO.Media.Wikipedia.scss` styles `h4` while the sanitizer strips it                                                                                                                                                                                   | delete the dead rules, or add `H2`–`H4` to the allowlist (a security-relevant change)                | `Wikipedia.ts:114`, `EmbedUtil.ts:103-164`                                                                                            |

---

## 7. What cannot be closed in this repository at all

Eight items need an external audit or a VAT. Listed so the README's silence on
them reads as deliberate rather than as an oversight.

- Contrast of slide text over author background images, and of marker pins over
  arbitrary third-party basemap tiles. Both depend on pixels no static analysis
  can bound.
- Real screen-reader behaviour. All eight existing assertions are DOM-attribute
  assertions; nothing has been checked with NVDA, JAWS or VoiceOver. The
  non-blocking browser matrix (`playwright.config.ts:3-16`, `continue-on-error`
  at `:60-93`) is the only place WebKit-adjacent behaviour would surface.
- Reflow at 320 CSS px across real devices and zoom levels.
- Touch-target sizes — `e2e/known-issues/issue-288-mobile-navigation.spec.ts`
  self-skips when Playwright does not report touch, so the 44×44 claims in
  `VCO.SlideNav.scss:47-54` and `VCO.Slide.scss:163-164` are untested.
- The §508 conformance claim itself.

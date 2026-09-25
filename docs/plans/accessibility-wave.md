# Accessibility Wave (tracks upstream #385)

Upstream #385 ("Do projects created with StoryMap JS meet web
accessibility standards and Section 508?") stays `n/a` in
`docs/KNOWN_ISSUES.md` — it is a question, not a bug. This wave is the
answer-in-progress: five sliceable, independently shippable commits.
After each commit, update the `#385` notes to reference the landed
slice (counts unchanged).

## 1. `fix: allow pinch-zoom in the embed player` (S)

- `public/embed/index.html:10` sets `maximum-scale=1.0` (WCAG 1.4.4
  failure; the landing page `index.html:5` is already correct). Drop
  `maximum-scale`, keep `initial-scale=1`.
- E2E: assert the embed viewport meta has no `maximum-scale`.
- Gates: targeted Playwright, `prettier --check`.

## 2. `feat: honor prefers-reduced-motion` (S)

- Gate `Animate` durations (`src/slider/StorySlider.ts:265-268`,
  `src/storymap/StoryMap.ts:740-762` → duration 0 / instant when
  `matchMedia("(prefers-reduced-motion: reduce)")` matches) and
  default autoplay off under `reduce` (`StoryMap.ts:854-881`).
- E2E with `emulateMedia: { reducedMotion: "reduce" }`: instant
  transitions, no autoplay advance.
- Gates: `lint`, `typecheck`, targeted Playwright, prettier.

## 3. `feat: announce slide changes to assistive tech` (S)

- `aria-live="polite"` status region updated in `StorySlider.goTo`
  (`src/slider/StorySlider.ts:243-313`); optional focus to the slide
  heading on navigation.
- E2E: live-region text tracks `#slide-N` navigation.
- Gates: `lint`, `typecheck`, targeted Playwright, prettier.

## 4. `fix: real buttons for slider nav and menubar` (M)

- `src/slider/SlideNav.ts:72,203-205` (`div` + click-only) and
  `src/ui/MenuBar.ts:237-256` (four `span`s + click-only) become
  `<button>`s with accessible labels, keeping classes; add
  `:focus-visible` styles. (Today the widget's only ARIA is the
  progressbar plus the panel `tabindex`.)
- E2E: Tab-to-focus + Enter-operable navigation.
- Gates: `lint`, `typecheck`, `npm test`, keyboard/slider e2e,
  prettier.

## 5. `feat: image alt text end-to-end` (M)

- `src/media/types/Image.ts:23-41` never sets `alt` (only
  credit/caption in `src/media/Media.ts:323-336`). Add `alt` through
  schema → IIIF mapping → render + fixture.
- E2E: `alt` present on slide images.
- Gates: `lint`, `typecheck`, `npm test`, `npm run validate`,
  targeted Playwright, prettier.

# Repository Guidelines

## Project Structure & Module Organization

StoryMapJS is a viewer-only TypeScript library. Library modules live under `src/` in domain folders (`core`, `map`, `media`, `slider`, `storymap`, `ui`, `dom`, `animation`, `language`, `site`); styles are SASS in `src/scss`; the embed page and demo fixtures are in `public/`. Vite (`vite.config.ts`, `--mode lib` then `--mode pages`) bundles the library (ESM `dist/js/storymap.js` plus bundled `dist/js/storymap.d.ts` via unplugin-dts), the widget CSS in `dist/css`, and the demo pages; site assets (font themes, docs, site chrome) generate into `public/` via the `plugins/sitegen.ts` Vite plugin, shared with the Vite dev server. The JSON Schema for storymap data lives in `schema/` and the CLI validator in `scripts/`.

## Build, Test, and Development Commands

Run `npm install` once (Node >= 22). Use `npm run dev` for a live dev server with HMR. `npm run build` generates production bundles, demo pages and font CSS, and `npm run preview` serves the built `dist/`. Quality gates: `npm run lint` (ESLint + Stylelint), `npm run typecheck` (strict, `strictNullChecks` included), `npm run validate` (storymap JSON schema), `npm run validate:iiif` (IIIF manifests), `npm run check:locales` (translation gaps), `npm run format:check` (Prettier), `npm test` (Vitest), `npm run test:e2e` (Playwright over all examples + embed page).

## Coding Style & Naming Conventions

Write ES2022 TypeScript with four-space indentation, semicolons, and descriptive camelCase identifiers; constructors and classes stay PascalCase. New map code belongs in `src/map/openlayers`; media types in `src/media/types`. Styles are SASS in `src/scss` mirroring their JS counterparts; vendor prefixes are not used (2022+ browsers only).

## Testing Guidelines

Vitest unit specs live in `tests/` (jsdom). Playwright e2e specs live in `e2e/` and run against `vite preview` via the built bundle; they cover every JSON fixture in `public/examples/`, the IIIF rendering path, and the embed page. Add browser fixtures under `public/examples/` and keep them valid per the schema (`npm run validate`).

## Commit & Pull Request Guidelines

Use concise, present-tense commit messages (`replace zoomify with iiif image api tile layer`) and group related changes. Reference issues in the footer (`Refs #123`). Pull requests should summarize motivation, list test results or manual verification, and include UI screenshots or screencasts when rendering changes.

## Planning

Working plans live in `docs/plans/`; the directory is gitignored and plans
are never committed. Code and test comments may reference plan files for
rationale, but only sections that exist — and prefer the maintained docs
(`docs/*.md`, `schema/`) for anything durable, since plans are scratch and
may be deleted.

## Security & Configuration Tips

Never commit real keys. Map credentials (Mapbox/Stadia tokens) come from storymap data options, not the repo.

## CI

GitHub Actions runs lint, typecheck, validation, unit tests, build and e2e on every push/PR (`.github/workflows/ci.yml`), attaches a built `dist/` zip to GitHub Releases on `v*` tags (`.github/workflows/package.yml`), and deploys the site plus the TypeDoc API reference to GitHub Pages (`.github/workflows/pages.yml`). `chore(deps)` is automated by `.github/dependabot.yml`.

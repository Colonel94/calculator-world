# Calculator World

86 free calculators across 11 categories, built as static HTML for [GitHub Pages](https://colonel94.github.io/calculator-world/). No backend, database, runtime framework, paid service or production npm dependency.

## Build and verify

Use Node.js 22 or newer. No install step is required for the build and unit/site tests.

```sh
npm run build
npm test
npm run serve
```

Preview at `http://127.0.0.1:4173/calculator-world/`. The prefix matches production. Generated HTML and assets are committed so **Pages continues deploying main / repository root**, without a settings change. `.nojekyll` avoids Jekyll processing. The quality workflow rebuilds, tests and checks that generated files match the sources.

## Architecture

- `src/catalog.mjs`: definitions, formulas, field constraints, content, conversion constants and categories.
- `src/core.mjs`: validation, formatting, date arithmetic, stable loan and savings helpers.
- `scripts/build.mjs`: shared layout, forms, navigation, related links, breadcrumbs, metadata, sitemap and supporting pages.
- `src/styles.css` and `src/app.mjs`: responsive styling and accessible browser interactions.
- `assets/tools/*.mjs`: generated per-calculator modules. Pages load their own definition plus common utilities, not the entire catalog.
- `src/config.mjs`: origin, base path, preserved Search Console value and inactive integration settings.
- `src/integrations.mjs`: central future analytics/advertising integration point; no remote trackers or ads are loaded.
- `tests/`: independent reference fixtures for every calculator, edge cases, conversion round trips and generated-site checks.

Edit source files, rebuild and commit both source and output. Do not edit generated HTML directly. If a tool is removed or renamed, explicitly remove obsolete generated HTML/module files and decide on redirects; the generator intentionally does not recursively delete files.

## Add a calculator

1. Add an `add(...)` catalog definition with a stable filename ID, category, metadata, fields, formula, limitations, worked example and FAQ. `solve` returns named numeric or explanatory string results.
2. Use shared field factories and helpers. Required numeric values must be finite, within field constraints and no larger than one trillion in magnitude. Outputs beyond the safe numeric range are rejected. Financial calculations avoid intermediate cent rounding; displayed financial results use at most two decimal places.
3. Keep solvers self-contained. Generated modules import core helpers; converters serialize their unit table. Add new helpers to both core and the generator import list when needed.
4. Add an independently calculated named-output fixture to `tests/calculators.test.mjs`, plus relevant edge cases. Do not derive expectations from the production function.
5. Run `npm run check`, inspect narrow/wide layouts, and commit rebuilt output. Homepage, category, related links and sitemap update automatically.

## Browser checks

`scripts/browser-check.mjs` uses Playwright as an optional developer tool. Install it and Chromium in your development environment, or set `PLAYWRIGHT_MODULE` to an existing installation and `BROWSER_EXECUTABLE` to Chrome/Edge. Start the preview server, then run `node scripts/browser-check.mjs`.

It exercises all 86 calculators at 1280 and 390 px, representative tools at 320 and 768 px, all category/support pages, search, errors, reset, live updates, keyboard submission, input labels, overflow and browser errors. Results/screenshots go to ignored `qa/`. Responsive Chromium checks do not replace physical iPhone/Safari or Android testing.

## Search and indexing

The sitemap contains 102 indexable URLs: homepage, 86 calculators, 11 categories and four support pages. The noindex 404 is excluded. Original calculator paths are retained. Every page has distinct title/description, one H1, a production canonical, crawlable links and the original Search Console tag. Breadcrumb schema mirrors visible content.

Submit `https://colonel94.github.io/calculator-world/sitemap.xml` in the existing Search Console property after deployment. **Project-subdirectory robots.txt does not govern crawling**: crawlers request `https://colonel94.github.io/robots.txt`. Root policy must be managed in the account-level Pages repository or future custom-domain root. An absent root robots file does not itself prevent crawling. See [Google’s robots scope rules](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt#file-location-and-range-of-validity).

## Advertising and analytics later

See [integration instructions](docs/INTEGRATIONS.md). No fake ads, publisher IDs, analytics IDs, active trackers, cookies or local storage are shipped. Contact routes to the public repository issue tracker.

## Review records

- [Audit and implementation](docs/AUDIT.md)
- [Validation](docs/VALIDATION.md)
- [Formula sources](docs/SOURCES.md)

No claim is made about guaranteed search ranking, traffic, field Core Web Vitals, AdSense approval or income.

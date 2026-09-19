# Validation record

`npm run check` rebuilds output and runs 181 Node tests. All 86 tools have independently specified named-output reference fixtures. Tests exercise generated browser modules as well as source definitions.

Validation covers missing, blank, invalid, negative, zero, decimal, huge and boundary values as applicable. Dedicated cases cover zero/tiny interest, amortization balance, debt payoff, signed percentages, fractions, leap-day birthdays, century leap rules, DST-independent intervals, overnight shifts, weekend schedules and all conversion-unit pairs.

All 103 HTML documents are checked for language, one H1, unique title/description, canonical, Search Console token, unique IDs, labels, breadcrumb JSON and local file/fragment links. Sitemap coverage must equal the 102 indexable pages. Tracking state and small calculator asset budgets are checked.

## Browser checks

Headless Chrome on Windows:

| Viewport | Calculators exercised | Other pages |
| --- | ---: | --- |
| 1280 × 900 | 86 | All 11 categories and 5 support/error pages |
| 390 × 844 | 86 | All 11 categories and 5 support/error pages |
| 320 × 740 | 3 representative tools | All 11 categories and 5 support/error pages |
| 768 × 1024 | 3 representative tools | All 11 categories and 5 support/error pages |

Search, no-results state, default calculations, invalid input, reset, live update and keyboard submission pass. No console errors, failed resources or horizontal overflow were observed. Desktop homepage and mobile calculator screenshots were inspected. The reproducible browser script writes local results/screenshots to ignored qa/.

These checks are not a full WCAG audit, external HTML-validator certification, physical iPhone/Safari test or field Core Web Vitals measurement. Native browser parsing and semantic checks cover practical HTML basics. No external fonts, images or third-party runtime requests are needed. Real field metrics require traffic.

## Deployment compatibility

Generated root-level files and .nojekyll preserve main/root GitHub Pages deployment. CI rebuilds, tests and detects generated-file drift. Search Console account status, indexing success and AdSense approval cannot be proven by repository tests.

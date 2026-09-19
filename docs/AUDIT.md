# Audit and implementation — September 19, 2026

Baseline: 199471f on main. Inspected all 34 tracked files: 25 calculator pages, homepage, three support pages, shared JavaScript/CSS, robots, sitemap and README. No tests, workflows, build configuration, dependencies or repository-specific agent instructions existed.

## Original calculator review

| Tool | Finding and resolution |
| --- | --- |
| Age | Future births silently clamped to zero; reject ordering errors, add reference date and state leap-day convention. |
| BMI | Correct formula; expand adult-only limitations and link CDC. |
| Break-even | Contribution guard existed; constrain negative costs and retain whole-unit ceiling. |
| Car loan | Invalid terms and large exponentials could break output; stable amortization, bounds, deposit/trade-in/fees added. |
| Compound interest | Annual formula correct but unexplained; add explicit compounding frequency and finite-range checks. |
| Concrete | Correct formula; fixed allowance becomes editable, with structural limitations explained. |
| Days between dates | Correct UTC approach retained; explain elapsed versus inclusive counts. |
| Discount | Unbounded discounts could produce negative prices; constrain to 0–100%. |
| Electricity cost | Correct formula but negative values accepted; validate power, hours and price, explain assumptions. |
| Fuel cost | Correct formula but generic content; add trip example, units and exclusions. |
| Fuel efficiency | Correct positive guards retained; preserve L/100 km and km/L and add explicit US mpg. |
| Loan | Zero-rate case existed; replace unstable exponential expression with log1p/expm1, constrain whole-month term. |
| Markup | Correct formula; validate and distinguish markup from margin. |
| Mortgage | Unguarded amount/rate/term; stable formula and extra monthly costs added. |
| Paint | Coverage guard existed; add whole coats and nonnegative area, explain coverage. |
| Percentage | Metadata promised unsupported operations; align copy with percent-of, increase and decrease results. |
| Percentage change | Keep zero-base guard and absolute denominator; explain negative-base convention. |
| Profit margin | Zero denominators falsely gave 0%; now show undefined while retaining profit. |
| ROI | Positive investment guard correct; validate final value and distinguish annualized return. |
| Hourly salary | Invalid schedules accepted; constrain hours/weeks and explain gross monthly averaging. |
| Square footage | Approximate factor replaced with exact 0.09290304 m²/ft². |
| Tile | Correct ceiling/waste formula retained with stronger dimensional validation and layout limits. |
| Tip | Invalid people silently replaced with one and fractions allowed; require a positive whole count. |
| Unit price | Correct positive quantity guard retained; add a second package and matching-unit explanation. |
| VAT | Correct add-only arithmetic expanded to extraction with editable rate and FTA reference. |

## Cross-site changes

- Required inputs no longer become zero through Number(null) or blank strings; nonfinite outputs are rejected.
- Inline solvers and duplicated pages replaced with source definitions and a deterministic Node generator.
- Search gains status/no-results feedback; 11 categories provide crawlable navigation.
- Each tool has specific formula, example, assumptions, FAQ and related tools instead of repeated filler.
- Shared labeled forms, announcements, keyboard focus, skip link and mobile layouts fix inconsistencies.
- About, Privacy and Terms gain full structure and metadata. Contact and a noindex 404 are added.
- Visible AdSense reservation boxes removed; only hidden central integration points remain. Analytics stays off.
- Existing correct subdirectory canonicals are preserved and tested. Original sitemap omitted the homepage; the generated sitemap covers all 102 indexable URLs.
- Search Console tag preserved exactly. Domain-root robots limitation documented.

## Scope

Expanded **25 to 86 calculators**, adding 61 tools and preserving all original calculator URLs. Eleven hubs cover Money & Finance, Business, Shopping, Math, Dates & Time, Health & Fitness, Automotive, Home & Construction, Energy, Conversions and Everyday Life.

UAE use cases include sourced but editable VAT, AED-compatible salary math, rent instalments/shares and entered fuel prices. No gratuity, statutory payroll, rent-cap or government-fee rules were invented. APR including fees, tax liability, medical risk and structural stair design were excluded rather than approximated misleadingly. BMI is numeric and informational. No address, phone number or customer-service promise was invented.

## Next five improvements

1. Prioritize tools and indexing fixes using actual Search Console query data.
2. Add amortization schedules and optional CSV export to popular borrowing tools.
3. Expand independent examples and references on the most-used pages.
4. Enable privacy-conscious analytics only with a real account and appropriate consent implementation.
5. Introduce approved ads with measured mobile layout and accidental-click checks.

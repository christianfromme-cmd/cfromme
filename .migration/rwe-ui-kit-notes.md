# RWE UI Kit excerpt — reference for /en/rwe-careers-portal/ migration

Provided by the user (README from a curated Pattern Lab export). Use this to inform block
selection, structure, and styling decisions. The actual `.hbs` / `.markup-only.html` sources
were in a zip that could not be attached, so only this mapping is available.

## Block → RWE Pattern Lab source mapping

| EDS block | Page usage | RWE Pattern Lab source | Confidence |
|---|---|---|---|
| ticker | "Latest at #TeamRWE" rotating news strip | `atoms-shortnews-shortnews` (+ `-element`, `-docs`) | High |
| cards (cards-article) | "Explore open jobs", "Opportunities at RWE" grids | `molecules-tic01-tic01` variants (default, only-image, only-text, with-video, expandable) | High |
| columns (columns-promo) | Side-by-side promo boxes | `molecules-tea01r-tea01r-grid-full-width`, `-image-top-25`, `-image-top-50` | High |
| columns (columns-about) | "Keep the world moving" text+image | `molecules-tea01r-tea01r-image-right` | High |
| columns (columns-pullquote) | Katja van Doren attributed quote | Not in excerpt — possibly `basics-text-*` | — |
| gallery | "Global impact" world map → static country-card grid | `atoms-gallery-n-gallery` (+ `atoms-picture-n-picture`) | Medium — confirm static grid vs Swiper carousel |
| faq-list | FAQ accordion | `molecules-acc01-acc01` (+ `-ol`, `acc01Item-hidden`, `-docs`) | High |
| interactive world map | — | Not in excerpt — likely bespoke JS map widget | — |
| Glassdoor reviews carousel | "Voices" reviews | Not in excerpt — may reuse gallery Swiper | — |
| consent-gated social feed | — | Not in excerpt — third-party/consent integration | — |

## Gaps (no UI Kit component — rebuild/integrate)
1. columns-pullquote — no dedicated quote pattern; may be plain text.
2. interactive world map — bespoke JS widget outside pattern library.
3. Glassdoor reviews carousel — no Glassdoor pattern; card markup/API not in export.
4. consent-gated social feed — third-party/consent-management integration.

## Foundation tokens referenced
- `atoms-grid-*` — grid wrapper + column-width partials (bas01–bas06, ext03–ext06)
- `basics-colors-*` — primary/secondary/accent + energy-source palette
- `basics-text-*` — headings, subline, paragraph, inline
- `basics-icons-*` — icon + icon holder
- `_global-css/nkStylesExtended.css` — font-face + spacing scale (design tokens)
- `_global-css/nkStyles.css` — atomic utility classes

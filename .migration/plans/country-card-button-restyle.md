# Gallery Country-Card Link Restyle Plan

## Problem

The country-card links in the migrated **"Global impact"** gallery render as **filled pill buttons** (solid teal "About…" + outlined "Careers website"). The live RWE site (per the provided screenshot) styles them as **plain text links**, not buttons:

- **"About RWE in the Americas"** → bold, dark teal/petrol text link — no background, no border.
- **"Careers website"** → teal text link with a **green right-arrow icon** trailing the label — no background.

Root cause: EDS button decoration (`decorateButtons` in `scripts.js`) has auto-converted these links into `<p class="button-wrapper"><a class="button primary">`, so the global pill-button styles from `styles/styles.css` apply on top of (and conflict with) the gallery CSS. The selected element confirms this:
`<a href="http://americas.rwe.com" class="button primary">About RWE in the Americas</a>`

## Goal

Make the gallery card links render as RWE text links (matching the live hotspot-panel `ll01`-style links) instead of pill buttons — a bold teal "About…" link and a teal "Careers website" link with a trailing arrow icon.

## Approach

Undo the button auto-decoration for links inside the gallery block, then style them as text links scoped to `.gallery`. Two coordinated changes:

1. **`blocks/gallery/gallery.js`** — after building the card, strip EDS button classes on card links (`button`, `primary`, `secondary`) and unwrap/neutralize `p.button-wrapper` (mirrors the pattern already used in `ticker.js`'s `unwrapButtons`). Tag the links so CSS can distinguish primary ("About") vs. secondary ("Careers website").
2. **`blocks/gallery/gallery.css`** — replace the pill CTA rules (lines ~85–131) with text-link styling: teal color, bold "About" link, "Careers website" link with a trailing arrow icon (CSS mask/inline SVG), no background/border.

## Notes / constraints

- The provided screenshot is the authoritative target. Confirm exact computed values from the live site where possible (open a country hotspot `+` in Playwright and read the panel `<a>` styles: color, weight, font-size, arrow glyph/spacing); fall back to the screenshot + brand tokens if the panel is not reachable.
- Source link atom is RWE `.link` / `link--internal` / `link--external` (arrow icon). The arrow on "Careers website" is the external/internal link affordance.
- Keep all changes scoped to `.gallery`; do **not** modify global button styles in `styles.css`.
- Only the selected block (`gallery`) is affected. `.plain.html` content stays as-is (links + hrefs unchanged) — the change is decoration + CSS, not content.
- Preserve card layout (links align toward card bottom; description flexes) and the no-image card gradient band.

## Checklist

- [ ] Read `blocks/gallery/gallery.js` and confirm current decoration output vs. the `a.button.primary` seen in the selected element
- [ ] (If reachable) In Playwright, open a live country hotspot and extract computed `<a>` styles: color, font-weight, font-size, text-decoration, arrow icon glyph + gap; else use screenshot + `styles/brand.css` tokens
- [ ] Update `gallery.js`: strip `button`/`primary`/`secondary` classes and neutralize `p.button-wrapper` on card links; tag primary ("About") vs. secondary ("Careers website") links
- [ ] Rewrite gallery CSS CTA rules (~lines 85–131): teal text links, bold "About" link, "Careers website" link with trailing green arrow icon; remove filled/outlined pill backgrounds and borders
- [ ] Ensure the global `a.button.primary` pill styling no longer wins (specificity or class removal) for gallery links
- [ ] Keep bottom-alignment of links and the no-image gradient band intact
- [ ] Run `npm run lint` (eslint + stylelint) — must pass clean
- [ ] Reload preview; compare the gallery card links against the screenshot/live site (up to 3 refinement iterations)
- [ ] Report the corrected link style and any remaining differences

## Out of scope

- Interactive map/hotspot behavior (remains a static grid fallback)
- Other blocks and the site-wide button system
- Font swap (pending RWE Sans files being dropped into `fonts/`)

---
*Execution requires Execute mode — this plan makes no file changes yet.*

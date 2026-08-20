# RWE Careers — Fonts, UI-Kit Patterns & Gallery Link Restyle Plan

## File access — resolved

You confirmed the files live in the **shared folder on the GitHub repo** (pushed to the remote), not in this local working tree. That's why my scans came up empty — this session only sees the current local checkout. In Execute mode the first step is to **fetch them from the remote** (`git fetch`, then locate the fonts + `ui-kit/` folder on the branch/commit that contains them, and check them out into the working tree). Until they're pulled locally I can't read/wire them, so Work items B and C below start with retrieval.

> Note: a Figma-to-EDS plugin is available, but these are Handlebars/Pattern Lab files + binary fonts, not Figma sources — it's not needed here. I'll keep working from the provided files.

## Work item A — Gallery country-card links (ready now, independent)

The country-card links render as filled/outlined **pill buttons** (`<a class="button primary">`) because EDS button-decoration wrapped them; the live site shows **plain RWE text links** — a bold teal "About…" link and a "Careers website" link with a trailing green arrow. Fix by unwrapping button decoration for gallery links in `blocks/gallery/gallery.js` and restyling as text links in `blocks/gallery/gallery.css` (scoped to `.gallery`; no global button changes). Content/`.plain.html` unchanged.

## Work item B — RWE Sans font integration (after fetch)

Once the fonts are pulled from the remote into `fonts/`:
- Add `@font-face` per weight in `styles/fonts.css` (light→300, regular→400, medium→500, bold→700).
- Point `--body-font-family` / `--heading-font-family` in `styles/brand.css` at "RWE Sans" (keep the system fallback stack).
- Add preload `<link>` hints in `head.html` for LCP weights (regular + bold) only.
- Convert `.otf`/`.ttf` → `.woff2` if needed; check each file size.
- **Licensing gate:** confirm the project is authorized to self-host RWE Sans publicly before enabling (EDS serves fonts on the open web).

## Work item C — UI-Kit patterns & tokens (after fetch)

With `ui-kit/` (incl. `component designs`/`patterns` and the `nkStyles*` CSS) available:
- Read `ui-kit/nkStylesExtended.css` + `nkStyles.css` for the real spacing scale / design tokens; fold relevant values into `styles/brand.css` / `styles/styles.css`.
- Use the `patterns` (`.hbs` / markup) to cross-verify the migrated blocks against authoritative RWE markup (as done earlier for shortnews/tea01r/tic01), tightening any block that diverges.

## Checklist

### A. Gallery links (ready)
- [ ] Read `blocks/gallery/gallery.js` to confirm decoration output vs. the `a.button.primary` in the selected element
- [ ] (If reachable) open a live country hotspot in Playwright and extract link computed styles (color, weight, size, arrow icon + gap); else use the screenshot + `styles/brand.css` tokens
- [ ] Update `gallery.js`: strip `button`/`primary`/`secondary` classes, neutralize `p.button-wrapper`, tag primary ("About") vs. secondary ("Careers website") links
- [ ] Rewrite gallery CSS CTA rules (~lines 85–131): teal text links, bold "About", "Careers website" with trailing green arrow; remove pill backgrounds/borders
- [ ] Ensure the global `a.button.primary` pill styling no longer wins for gallery links
- [ ] `npm run lint` clean; reload preview and compare to screenshot/live (≤3 iterations)

### C0. Fetch files from GitHub remote (prereq for B & C)
- [ ] `git fetch` all; identify the branch/commit that contains the fonts + `ui-kit/` folder
- [ ] Check the files into the working tree (merge/checkout the branch, or copy from it) so `fonts/` and `ui-kit/` are readable locally
- [ ] Inventory what arrived: font files (weights/formats/sizes), `ui-kit/nkStyles*.css`, `ui-kit/component designs`/`patterns`

### B. Fonts (after C0)
- [ ] Confirm RWE Sans is licensed for public self-hosting
- [ ] Convert to woff2 if delivered as otf/ttf; verify sizes
- [ ] Add `@font-face` per weight in `styles/fonts.css`
- [ ] Repoint font-family tokens in `styles/brand.css` to "RWE Sans" (retain fallback)
- [ ] Add preload `<link>` hints for regular + bold in `head.html`
- [ ] `npm run lint`; reload preview; verify the real typeface renders across blocks and LCP stays healthy

### C. UI-Kit patterns & tokens (after C0)
- [ ] Read `nkStylesExtended.css` / `nkStyles.css`; fold real spacing/type tokens into `styles/`
- [ ] Cross-verify migrated blocks against the `patterns` markup; tighten any divergences
- [ ] `npm run lint`; reload preview; confirm no regressions

## Recommended sequencing

Do **A (gallery links) now** — it's independent and unblocked. Then run **C0 (fetch)**, followed by **B (fonts)** and **C (tokens/patterns)** once the files are in the working tree.

## Out of scope
- Interactive map/hotspot behavior (gallery stays a static grid fallback)
- Navigation/header migration
- Figma plugin (not applicable to these file types)

---
*Execution requires Execute mode — this plan makes no file changes yet. Work items B and C additionally require fetching the fonts/UI-Kit from the GitHub remote into the working tree (step C0).*

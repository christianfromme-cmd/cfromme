/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-stage (image variant). Base block: hero-stage.
 * Source: RWE sub-page single-image stage `.stage.sta01--compact` (e.g.
 *   https://www.rwe.com/en/rwe-careers-portal/what-we-offer/).
 * Generated: 2026-08-25
 *
 * A non-carousel image stage: a full-bleed background photo with a compact
 * title panel (headline + subheading) overlaid lower-left, and the RWE
 * impact-print motif as a decorative watermark.
 *
 * Follows the Hero library convention — a 1-column table with 3 rows:
 *   row 1: block name (+ "image" variant token)
 *   row 2: background image (single cell)
 *   row 3: title + subheading (single cell)
 * The impact-print graphic is intentionally NOT captured: it is decorative and
 * rendered by the block CSS as a watermark, never as standalone content.
 */
export default function parse(element, { document }) {
  // --- Background image (row 2) ---
  let bg = element.querySelector('img:not(.impact-print-image)');
  if (!bg) {
    // The stage delivers the photo as a background-image inside an inline
    // responsive <style> (media-query variants), so there is no <img> for the
    // importer to pick up. Rather than hand-build an <img> with an absolute
    // src — which skips the image pipeline and leaves the photo hot-linked to
    // www.rwe.com — emit a placeholder carrying an inline
    // `background-image: url(...)` style. The built-in
    // WebImporter.rules.transformBackgroundImages rule (run after parsing) then
    // converts it into a real <img>, and adjustImageUrls + the localization
    // sidecar rehost it as a same-origin asset, exactly like every other image.
    const styleText = Array.from(element.querySelectorAll('style'))
      .map((s) => s.textContent)
      .join('\n');
    const urls = [...styleText.matchAll(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/g)]
      .map((m) => m[1]);
    if (urls.length) {
      // Prefer the highest-resolution variant (largest `mw=` width param).
      const widthOf = (u) => {
        const m = u.match(/[?&]mw=(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      };
      const best = urls.reduce((a, b) => (widthOf(b) >= widthOf(a) ? b : a));
      bg = document.createElement('div');
      // Exact `background-image: url(` spacing so transformBackgroundImages matches.
      bg.setAttribute('style', `background-image: url('${best}')`);
    }
  }

  // --- Text (row 3): title + subheading ---
  const textCell = [];
  const heading = element.querySelector('h1, h2, .headline');
  if (heading) textCell.push(heading);
  const subheading = element.querySelector('h3, .subheadline');
  if (subheading) textCell.push(subheading);

  if (!bg && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-stage (image)',
    cells: [
      [bg || ''],
      [textCell.length ? textCell : ''],
    ],
  });
  element.replaceWith(block);
}

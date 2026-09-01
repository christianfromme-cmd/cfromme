/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-video. Base block: columns (emits the `columns-about`
 * block name + CSS so it renders identically to the landing "keep the world
 * moving" text+video split — a multi-column columns layout).
 * Source: content-page archetype "Shaping the energy future together" section
 *   (`section[data-tpl="grid-bas-03"]` on why-work-here). Left column: two-tone
 *   H2 + intro paragraphs; right column: an inline `data-tpl="video"` player.
 * Generated: 2026-09-01
 *
 * The RWE video player loads its source via JS at runtime (canto.global), so
 * there is no importable stream. The best static capture is the player's
 * `poster` frame plus a link to the video, mirroring the career-video approach
 * in columns-about. We:
 *   - lift the intro paragraphs OUT as default content immediately before the
 *     block (the columns-about block pulls the preceding default-content
 *     paragraphs into its left text column), and
 *   - emit a 2-column columns row: [heading] | [poster + video link].
 * The poster is emitted as a `background-image: url(...)` div so the built-in
 * transformBackgroundImages rule turns it into a real <picture><img> and
 * adjustImageUrls localizes it.
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('h1, h2, h3');
  const paras = Array.from(element.querySelectorAll('.content p'));
  const videoEl = element.querySelector('video');

  if (!heading && !videoEl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Media cell: poster image (as background-image for the pipeline) + link ---
  const mediaCell = [];
  if (videoEl) {
    const poster = videoEl.getAttribute('poster');
    if (poster) {
      const posterDiv = document.createElement('div');
      // Exact `background-image: url(` spacing so transformBackgroundImages matches.
      posterDiv.setAttribute('style', `background-image: url('${poster}')`);
      mediaCell.push(posterDiv);
    }
    const source = videoEl.querySelector('source[src], source[data-src]');
    const src = source
      ? (source.getAttribute('src') || source.getAttribute('data-src'))
      : videoEl.getAttribute('data-url');
    if (src) {
      const link = document.createElement('a');
      link.setAttribute('href', src);
      link.textContent = 'Watch video';
      mediaCell.push(link);
    }
  }

  // --- Emit intro paragraphs as default content before the block ---
  paras.forEach((p) => element.before(p));

  const headingCell = heading ? [heading] : [''];
  const cells = mediaCell.length
    ? [[headingCell, mediaCell]]
    : [[headingCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-about', cells });
  element.replaceWith(block);
}

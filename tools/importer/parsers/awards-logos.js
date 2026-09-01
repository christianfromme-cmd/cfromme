/* eslint-disable */
/* global WebImporter */
/**
 * Parser for awards-logos. Base block: columns (emitted as the `columns` block
 * with a `logos` variant token so block CSS can constrain the logo row).
 * Source: content-page archetype "Our awards" section (`section[data-tpl="lll01"]`
 *   on why-work-here) — an H2 followed by <ul class="logos"> of award <img>s.
 * Generated: 2026-09-01
 *
 * Left unmapped these logos fall to default content and render as a huge,
 * misaligned vertical list. We lift the "Our awards" heading OUT as default
 * content before the block, then emit a single columns row with one cell per
 * logo image so the block lays them out as a constrained horizontal row.
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('h1, h2, h3, .headline');
  const imgs = Array.from(element.querySelectorAll('ul.logos li img, ul li img'));

  if (!imgs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Heading as default content immediately before the block.
  if (heading) element.before(heading);

  // One columns row: one cell per logo.
  const row = imgs.map((img) => [img]);
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (logos)',
    cells: [row],
  });
  element.replaceWith(block);
}

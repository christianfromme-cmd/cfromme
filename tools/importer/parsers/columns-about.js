/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-about. Base block: columns.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (section:nth-of-type(3) .rwe-tick01)
 * Generated: 2026-08-19
 *
 * Side-by-side "keep the world moving" block: heading + body paragraphs on the
 * left, embedded career video on the right. The page-templates selector matches
 * two `.rwe-tick01` wrappers (text column + video column) that together form ONE
 * two-column block. The parser builds the full 2-column block from the enclosing
 * row on the first invocation and removes the leftover wrapper on the second so
 * only a single columns table is produced.
 */
export default function parse(element, { document }) {
  const row = element.closest('.row') || element.parentElement;

  // Second (and later) matches inside an already-processed row: drop the leftover.
  if (row && row.hasAttribute('data-columns-about-done')) {
    element.remove();
    return;
  }
  if (row) row.setAttribute('data-columns-about-done', '1');

  // Left column: nearest heading (the "keep the world moving" H2 lives in a
  // sibling wrapper) plus the body paragraphs from the text .rwe-tick01.
  const leftCol = [];
  let heading = null;
  let scope = element;
  while (scope && !heading) {
    scope = scope.parentElement;
    if (scope) heading = scope.querySelector('h1, h2');
  }
  if (heading) leftCol.push(heading);

  const textWrapper = element.querySelector('.content') || element;
  Array.from(textWrapper.querySelectorAll(':scope > p')).forEach((p) => leftCol.push(p));
  if (!leftCol.length) leftCol.push(element);

  // Right column: the embedded video (prefer the real <video>, else its container).
  const rightCol = [];
  const video = (row || document).querySelector('video');
  const videoContainer = (row || document).querySelector('.videoplayer-container, .video-container');
  if (video) rightCol.push(video);
  else if (videoContainer) rightCol.push(videoContainer);

  const cells = [];
  if (rightCol.length) cells.push([leftCol, rightCol]);
  else cells.push([leftCol]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-about', cells });
  element.replaceWith(block);
}

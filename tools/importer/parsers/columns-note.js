/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-note. Base block: columns.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (section.color-background-2.energy-waves-grid)
 * Generated: 2026-08-19
 *
 * Single styled rich-text note ("Note on inclusive language") with inline links,
 * framed by decorative energy-wave graphics (dropped) and an <rwe-cv-matcher>
 * custom element (dropped). Modeled as a single-column columns block: one row,
 * one cell holding the note's rich-text paragraphs.
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.content');
  const noteCell = [];

  if (content) {
    const paras = Array.from(content.querySelectorAll(':scope > p'));
    if (paras.length) paras.forEach((p) => noteCell.push(p));
    else noteCell.push(content);
  }

  if (!noteCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[noteCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-note', cells });
  element.replaceWith(block);
}

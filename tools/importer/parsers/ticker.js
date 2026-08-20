/* eslint-disable */
/* global WebImporter */
/**
 * Parser for ticker. Base block: ticker (bespoke, no vanilla base).
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (.short-news)
 * Generated: 2026-08-19
 *
 * 'Latest at #TeamRWE' rotating short-news strip. Header H2 + repeating items,
 * each with an H4 heading, a description paragraph and a 'Read more' link.
 * slick-cloned duplicates are excluded. Modeled as a 1-column block: the
 * heading row, then one row per news item holding [heading, paragraph, link].
 */
export default function parse(element, { document }) {
  const cells = [];

  const heading = element.querySelector('.short-news__header h2, h2');
  if (heading) cells.push([[heading]]);

  // Real items only — drop slick-cloned duplicates the slider inserts.
  const items = Array.from(element.querySelectorAll('.slider-element:not(.slick-cloned)'));

  items.forEach((item) => {
    const itemCell = [];
    const h4 = item.querySelector('h4');
    if (h4) itemCell.push(h4);
    const desc = item.querySelector('.description-text p, .description-text');
    if (desc) itemCell.push(desc);
    const link = item.querySelector('a[href]');
    if (link) itemCell.push(link);
    if (itemCell.length) cells.push([itemCell]);
  });

  if (cells.length <= (heading ? 1 : 0)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'ticker', cells });
  element.replaceWith(block);
}

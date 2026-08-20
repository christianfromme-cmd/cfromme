/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-pullquote. Base block: columns.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (section:nth-of-type(5) > div.container)
 * Generated: 2026-08-19
 *
 * Attributed pull-quote: a portrait photo + name/role on the left, and the H4
 * headline + long quote on the right. Modeled as a 2-column columns block:
 * left cell = [portrait, name, role], right cell = [H4, quote].
 */
export default function parse(element, { document }) {
  const portrait = element.querySelector('.round-image__image img, img');
  const name = element.querySelector('.round-image__image-title, .round-image__image-title strong');
  const role = element.querySelector('.round-image__image-subtitle');
  const quoteHeading = element.querySelector('h4, .headline4');
  const quoteBody = element.querySelector('.round-image__body .content, .round-image__body');

  const leftCol = [];
  if (portrait) leftCol.push(portrait);
  if (name) leftCol.push(name);
  if (role) leftCol.push(role);

  const rightCol = [];
  if (quoteHeading) rightCol.push(quoteHeading);
  if (quoteBody) {
    const paras = Array.from(quoteBody.querySelectorAll(':scope > p'));
    if (paras.length) paras.forEach((p) => rightCol.push(p));
    else rightCol.push(quoteBody);
  }

  if (!leftCol.length && !rightCol.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[leftCol, rightCol]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-pullquote', cells });
  element.replaceWith(block);
}

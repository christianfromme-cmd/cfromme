/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-social. Base block: embed (social).
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (section:nth-of-type(10) .rwe-tick01)
 * Generated: 2026-08-19
 *
 * Consent-gated social media feed placeholder: 'RWE @ Social Media' H2 plus two
 * explanatory paragraphs (one with an inline link to open the cookie popup).
 * There is NO real embed URL in the source (posts only render after consent), so
 * this is modeled as a single-column embed/text placeholder capturing the heading
 * and paragraphs. One row, one cell holding [heading, ...paragraphs].
 */
export default function parse(element, { document }) {
  const contentCell = [];

  const heading = element.querySelector('h2, .headline');
  if (heading) contentCell.push(heading);

  const content = element.querySelector('.content');
  if (content) {
    const paras = Array.from(content.querySelectorAll(':scope > p'));
    if (paras.length) paras.forEach((p) => contentCell.push(p));
    else contentCell.push(content);
  }

  if (!contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-social', cells });
  element.replaceWith(block);
}

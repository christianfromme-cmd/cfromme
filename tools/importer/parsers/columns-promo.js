/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base block: columns.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (section.teaser-grid--full-width)
 * Generated: 2026-08-19
 *
 * Full-width image/video-left promo teaser. The whole teaser is wrapped in a
 * single <a href>; content: media (video), H3 title, paragraph and a CTA whose
 * visible label lives in a `.btn span` (not a real anchor). Modeled as a
 * 2-column columns block: left cell = media, right cell = [title, paragraph, cta].
 */
export default function parse(element, { document }) {
  const article = element.querySelector('article.tea01--image-left') || element;

  const media = article.querySelector('video, .media-container');
  const heading = article.querySelector('h3, .headline');
  const desc = article.querySelector('.content p, header > p, p:not(.image-caption)');

  const anchor = article.querySelector('a[href]');
  const label = article.querySelector('.btn span, .btn');

  const rightCol = [];
  if (heading) rightCol.push(heading);
  if (desc) rightCol.push(desc);
  if (anchor && anchor.getAttribute('href')) {
    const cta = document.createElement('a');
    cta.setAttribute('href', anchor.getAttribute('href'));
    cta.textContent = (label ? label.textContent : anchor.textContent).trim();
    if (cta.textContent) rightCol.push(cta);
  }

  if (!heading && !desc) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (media) cells.push([[media], rightCol]);
  else cells.push([rightCol]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}

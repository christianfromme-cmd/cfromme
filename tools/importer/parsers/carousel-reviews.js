/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-reviews. Base block: carousel.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (.sli01--text-components.sli01--carousel)
 * Generated: 2026-08-19
 *
 * 'Voices from #TeamRWE' rotating review slider — 3 slides, each with a Glassdoor
 * logo and a short quoted review. Carousel is a 2-column block: each row = one
 * slide -> [image (logo), text cell (quote)]. slick-cloned duplicates excluded.
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.slider-slide:not(.slick-cloned)'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('.slider-slide'));

  const cells = [];

  slides.forEach((slide) => {
    const logo = slide.querySelector('.logos img, img');
    const content = slide.querySelector('.content');
    const textCell = [];
    if (content) textCell.push(content);
    cells.push([logo || '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-reviews', cells });
  element.replaceWith(block);
}

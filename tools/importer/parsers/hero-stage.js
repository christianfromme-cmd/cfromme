/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-stage. Base block: hero.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (.sli01--stage-components.sli01--carousel)
 * Generated: 2026-08-19
 *
 * Rotating hero stage carousel. Each slide has a background/foreground media
 * (video or image), an H1 headline, an H3 subheading and one CTA link.
 * Hero is a 1-column block: name row, then one 1-cell row per slide holding
 * the media + text + CTA for that slide.
 */
export default function parse(element, { document }) {
  // Real slides only (drop slick-cloned duplicates).
  let slides = Array.from(element.querySelectorAll('.slider-slide:not(.slick-cloned)'));
  if (!slides.length) slides = [element];

  const cells = [];

  slides.forEach((slide) => {
    const contentCell = [];

    // Media: prefer a video, else a real (non-decorative) image.
    const video = slide.querySelector('video');
    const img = slide.querySelector('img:not(.impact-print-image)');
    if (video) contentCell.push(video);
    else if (img) contentCell.push(img);

    const heading = slide.querySelector('h1, h2, .headline');
    if (heading) contentCell.push(heading);

    const subheading = slide.querySelector('h3, .subheadline');
    if (subheading) contentCell.push(subheading);

    const cta = slide.querySelector('a[href]');
    if (cta) contentCell.push(cta);

    if (contentCell.length) cells.push([contentCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-stage', cells });
  element.replaceWith(block);
}

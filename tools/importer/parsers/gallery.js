/* eslint-disable */
/* global WebImporter */
/**
 * Parser for gallery. Base block: gallery (bespoke; interactive hotspot map has
 * NO UI Kit source — modeled as a static grid of country cards, the import fallback).
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (.hotspot-component)
 * Generated: 2026-08-19
 *
 * Interactive world map with 17 country/region hotspots. Each hotspot
 * (.hotspot__entry) has a teaser image, an H2 country headline, a description
 * (with an "About RWE in ..." link) and a "Careers website" link. Modeled as a
 * 2-column grid: each row = [teaser image, text cell (headline, description, links)].
 */
export default function parse(element, { document }) {
  const entries = Array.from(element.querySelectorAll('.hotspot__entry'));
  if (!entries.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  entries.forEach((entry) => {
    const img = entry.querySelector('.entry-media img, img.entry-image, img');

    const textCell = [];
    const headline = entry.querySelector('.entry-headline, h2, h3');
    if (headline) textCell.push(headline);

    const description = entry.querySelector('.entry-description');
    if (description) {
      const paras = Array.from(description.querySelectorAll(':scope > p'));
      if (paras.length) paras.forEach((p) => textCell.push(p));
      else textCell.push(description);
    }

    const careersLink = entry.querySelector('.entry-link a[href]');
    if (careersLink) textCell.push(careersLink);

    cells.push([img || '', textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'gallery', cells });
  element.replaceWith(block);
}

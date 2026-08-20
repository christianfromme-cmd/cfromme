/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base block: cards.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (card grids)
 * Generated: 2026-08-19
 *
 * Repeating promo/opportunity cards. Each card is an <article class="tea01--image-left">
 * wrapped in a single <a href> (the whole card is linked). Content: optional photo,
 * an H3 title, a paragraph and a CTA whose visible label sits in a `.btn span`
 * (not a real anchor). The source photos are CSS-background <div>s (no <img>), so
 * these cards are effectively image-less -> 1-column "cards (no images)" layout.
 * Each row holds one card cell: [image?, heading, paragraph, cta-link].
 * If a real <img> photo exists on a card it becomes a 2-column row
 * ([image, textCell]); otherwise a 1-column row ([textCell]).
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('article.tea01--image-left'));
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Detect whether ANY card has a real content image (ignore decorative
  // impact-print svg). Keep column count consistent across all rows.
  const hasImages = cards.some((card) => !!card.querySelector(
    'img:not(.impact-print-image):not(.impact-print-image__wrapper img)',
  ));

  const cells = [];

  cards.forEach((card) => {
    const textCell = [];

    const heading = card.querySelector('h3, .headline');
    if (heading) textCell.push(heading);

    const desc = card.querySelector('.content p, header > p, p:not(.image-caption)');
    if (desc) textCell.push(desc);

    // The whole card is linked; build a real CTA link using the card href and
    // the visible button label.
    const anchor = card.querySelector('a[href]');
    const label = card.querySelector('.btn span, .btn');
    if (anchor && anchor.getAttribute('href')) {
      const cta = document.createElement('a');
      cta.setAttribute('href', anchor.getAttribute('href'));
      cta.textContent = (label ? label.textContent : anchor.textContent).trim();
      if (cta.textContent) textCell.push(cta);
    }

    if (hasImages) {
      const img = card.querySelector('img:not(.impact-print-image)');
      cells.push([img || '', textCell]);
    } else {
      cells.push([textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base block: cards.
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (card grids) and the
 * "Discover more about us" / "Driving ideas" teaser rows + the standalone
 * "Insights from #TeamRWE" teaser on the why-work-here content-page archetype.
 * Generated: 2026-08-19, updated 2026-09-01
 *
 * Repeating promo/opportunity cards. Each card is an <article class="tea01--image-left">
 * wrapped in a single <a href> (the whole card is linked). Content: optional photo,
 * an H3 title, a paragraph and a CTA whose visible label sits in a `.btn span`
 * (not a real anchor).
 *
 * IMAGE HANDLING (archetype-general): RWE tea01r teasers deliver their photo as a
 * CSS `background-image` inside an inline responsive <style> block (media-query
 * variants) — there is NO <img>. Rather than hot-linking an absolute src (which
 * skips the image pipeline), we extract the highest-resolution variant and emit a
 * placeholder <div> carrying an inline `background-image: url('...')` style. The
 * built-in WebImporter.rules.transformBackgroundImages rule (run after parsing)
 * converts it into a real <picture><img>, and adjustImageUrls localizes it —
 * exactly like tools/importer/parsers/hero-stage-image.js. Cards that ship a real
 * <img>/<picture> keep it as-is. If ANY card has an image the whole grid uses
 * 2-column rows [image, textCell] to keep column counts consistent.
 */

/**
 * Extract the highest-resolution background-image URL from a card's inline
 * responsive <style> block and emit a <div> carrying it as an inline style so
 * transformBackgroundImages can turn it into a real image.
 */
function bgImageEl(card, document) {
  const styleText = Array.from(card.querySelectorAll('style'))
    .map((s) => s.textContent)
    .join('\n');
  const urls = [...styleText.matchAll(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/g)]
    .map((m) => m[1]);
  if (!urls.length) return null;
  const widthOf = (u) => {
    const m = u.match(/[?&]mw=(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };
  const best = urls.reduce((a, b) => (widthOf(b) >= widthOf(a) ? b : a));
  const div = document.createElement('div');
  // Exact `background-image: url(` spacing so transformBackgroundImages matches.
  div.setAttribute('style', `background-image: url('${best}')`);
  return div;
}

export default function parse(element, { document }) {
  // Two card shapes across the archetype:
  //  - <article class="tea01--image-left"> teasers (Discover more / Driving ideas /
  //    Insights) whose photo is a CSS background-image, and
  //  - <div data-tpl="tic01" class="rwe-tick01"> "Key reasons" cards (inside the
  //    sli01 slider) which carry a real <figure><picture><img>.
  const cards = Array.from(
    element.querySelectorAll('article.tea01--image-left, div.rwe-tick01:has(figure)'),
  );
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // The "Key reasons" cards live inside an sli01 slider and are rwe-tick01
  // (white card, RWE-blue text, image on top, no CTA button) that the live site
  // paginates 3-per-view with arrows + dots. Detect that source and emit the
  // `slider` variant so the block decorates as a carousel; the tea01--image-left
  // teasers stay the default gradient-panel grid.
  const isSlider = !!element.closest('[data-tpl="sli01"]')
    || !!element.querySelector('[data-tpl="sli01"]')
    || cards.every((c) => c.matches('div.rwe-tick01'));

  // Resolve each card's image up-front: a real content <img> (ignore the
  // decorative impact-print svg) or, failing that, the extracted background-image.
  const images = cards.map((card) => {
    const real = card.querySelector(
      'img:not(.impact-print-image):not(.impact-print-image__wrapper img)',
    );
    return real || bgImageEl(card, document);
  });
  const hasImages = images.some(Boolean);

  const cells = [];

  cards.forEach((card, i) => {
    const textCell = [];

    const heading = card.querySelector('h3, .headline');
    if (heading) textCell.push(heading);

    const desc = card.querySelector('.content p, header > p, p:not(.image-caption)');
    if (desc) textCell.push(desc);

    // The whole card is linked; build a real CTA link using the card href and
    // the visible button label. Slider (rwe-tick01) cards show no CTA button on
    // the live site, so skip it for them.
    if (!isSlider) {
      const anchor = card.querySelector('a[href]');
      const label = card.querySelector('.btn span, .btn');
      if (anchor && anchor.getAttribute('href')) {
        const cta = document.createElement('a');
        cta.setAttribute('href', anchor.getAttribute('href'));
        cta.textContent = (label ? label.textContent : anchor.textContent).trim();
        if (cta.textContent) textCell.push(cta);
      }
    }

    if (hasImages) {
      cells.push([images[i] || '', textCell]);
    } else {
      cells.push([textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: isSlider ? 'cards-article (slider)' : 'cards-article',
    cells,
  });
  element.replaceWith(block);
}

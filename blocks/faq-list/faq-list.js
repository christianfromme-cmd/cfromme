/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'faq-list-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'faq-list-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'faq-list-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}

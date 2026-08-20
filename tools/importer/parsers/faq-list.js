/* eslint-disable */
/* global WebImporter */
/**
 * Parser for faq-list. Base block: accordion (bespoke FAQ variant).
 * Source: https://www.rwe.com/en/rwe-careers-portal/ (.acc01-faq)
 * Generated: 2026-08-19
 *
 * FAQ accordion of 4 collapsible Q&A items. Each accordion-item has a question
 * (button label in the headline) and a rich-text answer (with inline links).
 * Modeled as an accordion/2-column block: each row = [question, answer].
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.accordion-item'));
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    // Question: use the visible label text as a heading.
    const label = item.querySelector('.accordion-item__button-label, .accordion-item__button, .accordion-item__headline');
    const questionCell = [];
    if (label) {
      const q = document.createElement('p');
      q.textContent = label.textContent.trim();
      questionCell.push(q);
    }

    // Answer: the rich-text content of the panel.
    const answerCell = [];
    const content = item.querySelector('.accordion-item__content .content, .accordion-item__content');
    if (content) {
      const nodes = Array.from(content.querySelectorAll(':scope > p, :scope > ul, :scope > ol'));
      if (nodes.length) nodes.forEach((n) => answerCell.push(n));
      else answerCell.push(content);
    }

    cells.push([questionCell, answerCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'faq-list', cells });
  element.replaceWith(block);
}

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Tag the structural regions by their content, so styling does not depend on
  // how the CMS nests the authored markup:
  //   breadcrumb | Recommend (share) | find-us-on + contact | link columns | legal
  const sections = [...footer.querySelectorAll(':scope > .section')];
  const linksSection = sections.find((s) => s.querySelectorAll('h3').length >= 2);
  const legalSection = [...sections].reverse()
    .find((s) => /disclaimer|imprint|©/i.test(s.textContent));
  const crumbSection = sections.find((s) => s !== linksSection && s !== legalSection
    && !s.querySelector('h1, h2, h3, h4, h5, h6') && s.querySelector('a'));
  const shareSection = sections.find((s) => /^\s*Recommend/i.test(s.textContent));
  const socialSection = sections.find((s) => s !== linksSection && s !== legalSection
    && s !== crumbSection && s !== shareSection);

  if (crumbSection) crumbSection.classList.add('footer-breadcrumb');
  if (shareSection) shareSection.classList.add('footer-share');
  if (socialSection) socialSection.classList.add('footer-social');
  if (legalSection) legalSection.classList.add('footer-legal');

  // Link columns. Depending on how the CMS nests the authored markup the
  // middle section arrives either as a flat sequence of (h3, ul) pairs OR as
  // separate wrapper <div>s each holding one (h3, ul). Normalise both into a
  // single .footer-cols grid of .footer-col groups keyed off each heading.
  if (linksSection) {
    linksSection.classList.add('footer-links');
    const wrapper = linksSection.querySelector(':scope > .default-content-wrapper') || linksSection;

    // Unwrap nested <div>s until the headings/lists are direct children of the
    // wrapper (the CMS may nest each column one or two levels deep).
    let guard = 0;
    while (guard < 5 && [...wrapper.children].some((c) => c.tagName === 'DIV')) {
      [...wrapper.children].forEach((child) => {
        if (child.tagName === 'DIV') child.replaceWith(...child.childNodes);
      });
      guard += 1;
    }

    const cols = document.createElement('div');
    cols.className = 'footer-cols';
    let current = null;
    [...wrapper.children].forEach((node) => {
      if (/^H[1-6]$/.test(node.tagName)) {
        current = document.createElement('div');
        current.className = 'footer-col';
        cols.append(current);
      }
      if (!current) {
        current = document.createElement('div');
        current.className = 'footer-col';
        cols.append(current);
      }
      current.append(node);
    });
    wrapper.append(cols);
  }

  block.append(footer);
}

/*
 * anchor-nav — RWE quick-jump button grid.
 * Auto-blocked (see scripts.js buildAnchorNavAutoBlocks) from a run of in-page
 * anchor links on sub-pages like "What we offer". Renders as a responsive grid
 * of solid teal buttons (3 columns desktop, matching the live cta01 grid).
 */

/**
 * loads and decorates the block
 * @param {Element} block The anchor-nav block element
 */
export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.className = 'anchor-nav-list';
  nav.setAttribute('aria-label', 'On this page');

  block.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.classList.add('anchor-nav-item');
    nav.append(a);
  });

  block.textContent = '';
  block.append(nav);
}

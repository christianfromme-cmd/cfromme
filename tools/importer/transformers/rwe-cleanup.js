/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: RWE (Sitecore) site-wide cleanup.
 *
 * Removes non-authorable RWE site chrome and slider control scaffolding so the
 * import contains only page-level authorable content.
 *
 * All selectors below were verified against migration-work/cleaned.html and the
 * live-DOM analysis captured in migration-work/page-structure.json:
 *  - #breadcrumb-top ....... breadcrumb nav (cleaned.html line 73)
 *  - .slick-cloned ......... duplicated carousel/ticker slides (cleaned.html lines 111, 274, 302, 329, 356, 383)
 *  - .slider-prev / .slider-next / .slider-dots / .slick-dots / .slick-arrow
 *    / .slider-nav / .scroll-down-btn / .slider-navigation ... content-less
 *    slider controls (cleaned.html lines 9, 56, 57, 101-105, 1585, 1634-1637)
 *  - #off-screen-wrap > header, .navigation-wrapper, #breadcrumb-bottom,
 *    #main-footer, #TextSnippetShare, #BackToTop, #usercentrics-root ...
 *    global header/nav/footer/share/consent chrome present on the live page
 *    (from live-DOM analysis; the scraper already stripped these from
 *    cleaned.html, but the validation hook runs against the live URL).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie / consent management overlay (blocks parsing, non-authorable).
    WebImporter.DOMUtils.remove(element, ['#usercentrics-root']);

    // Remove duplicated (cloned) carousel/ticker slides BEFORE block parsing so
    // carousel/ticker parsers don't emit duplicate cells.
    WebImporter.DOMUtils.remove(element, ['.slick-cloned']);

    // Content-less slider controls (arrows, dots, prev/next, scroll button).
    // Removed before parsing so they don't leak into block cells.
    WebImporter.DOMUtils.remove(element, [
      '.slider-prev',
      '.slider-next',
      '.slider-dots',
      '.slick-dots',
      '.slick-arrow',
      '.slider-nav',
      '.slider-navigation',
      '.scroll-down-btn',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global RWE chrome (header/nav, breadcrumbs, footer, share, back-to-top).
    WebImporter.DOMUtils.remove(element, [
      '#off-screen-wrap > header',
      '.navigation-wrapper',
      '#breadcrumb-top',
      '#breadcrumb-bottom',
      '#main-footer',
      '#TextSnippetShare',
      '#BackToTop',
    ]);

    // Safe technical element removal.
    WebImporter.DOMUtils.remove(element, ['script', 'style', 'noscript']);
  }
}

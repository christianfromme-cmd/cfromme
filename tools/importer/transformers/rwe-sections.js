/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: RWE section breaks + Section Metadata.
 *
 * RWE (Sitecore) wraps every block in nested <section>/<div.container>/<div.row>/
 * <div.grid-content.col-sm-12> layers. EDS section boundaries are:
 *   - the hero <header>/<section> (rendered from <div data-region="hero"> > section, outside <main>), and
 *   - the direct <section> children of <main>.
 *
 * Every section except the first (hero) gets an <hr> break. Sections that RWE
 * renders with the `color-background-2` tint get a Section Metadata block with
 * style "tinted".
 *
 * CONTENT-DRIVEN: which sections are tinted varies per page — the careers
 * landing page, "Why work here", "What we offer" etc. each tint different
 * sections. We therefore detect the tint from the SOURCE `color-background-2`
 * class on each section at beforeTransform (while the original DOM is intact),
 * NOT from hardcoded nth-of-type positions. This keeps the rule correct across
 * every careers-portal archetype instead of only the page it was authored on.
 *
 * These boundary elements are the outer main > section wrappers, NOT the inner
 * block elements the parsers replace, so they survive block parsing. We still use
 * the before/after-hook + marker pattern: <hr> markers are inserted in
 * beforeTransform (while every section element exists), and Section Metadata is
 * anchored to those markers in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';
const TINTED_MARKER_ATTR = 'data-excat-section-tinted';
// RWE's tinted background modifier on a source <section>.
const TINTED_CLASS = 'color-background-2';

/**
 * Collect the ordered EDS section boundaries directly from the source DOM.
 * Hero first (no leading break), then each direct <section> child of <main>.
 * A per-page template override (payload.template.sections) still wins when the
 * classification pipeline provided explicit selectors.
 */
function collectSections(element) {
  const hero = element.querySelector('[data-region="hero"] > section');
  const mainSections = [...element.querySelectorAll('main > section')];
  const list = [];
  if (hero) list.push({ el: hero, isHero: true });
  mainSections.forEach((el) => list.push({ el, isHero: false }));
  return list;
}

export default function transform(hookName, element, payload) {
  // If the classification pipeline supplied explicit per-page section selectors,
  // honour them (with content-driven tint detection); otherwise derive the
  // boundaries straight from the DOM.
  const templateSections = payload && payload.template && payload.template.sections
    && payload.template.sections.length > 1
    ? payload.template.sections
    : null;

  if (hookName === 'beforeTransform') {
    const sections = templateSections
      ? templateSections.map((s) => ({ el: element.querySelector(s.selector), isHero: s.id === 'hero' }))
      : collectSections(element);

    // Insert a section-break <hr> before every section (except the first).
    // A tinted section flags ITS OWN opening break; the Section Metadata block is
    // then inserted right AFTER that break in afterTransform, making it the FIRST
    // block of the section it styles (the EDS convention — verified against the
    // careers landing page, where the metadata leads its section's content).
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const { el } = sections[i];
      if (!el) continue; // selector didn't match — skip, never guess
      // Detect tint from the section's OWN class (not a subtree match, which
      // would flag a layout wrapper — and its earlier, untinted content — when a
      // tinted section is nested inside it).
      const tinted = el.classList.contains(TINTED_CLASS);
      if (i === 0 && !tinted) continue; // first section: no leading break

      const hr = document.createElement('hr');
      hr.setAttribute(SECTION_MARKER_ATTR, `s${i}`);
      if (tinted) hr.setAttribute(TINTED_MARKER_ATTR, 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Anchor a "tinted" Section Metadata block right AFTER each flagged break, so
    // it is the first block of the tinted section it styles.
    const markers = [...element.querySelectorAll(`[${TINTED_MARKER_ATTR}="true"]`)];
    markers.forEach((marker) => {
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: 'tinted' },
      });
      marker.after(metadataBlock);
      marker.removeAttribute(TINTED_MARKER_ATTR);
    });
  }
}

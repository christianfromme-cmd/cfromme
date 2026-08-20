/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: RWE section breaks + Section Metadata.
 *
 * RWE (Sitecore) wraps every block in nested <section>/<div.container>/<div.row>/
 * <div.grid-content.col-sm-12> layers. EDS section boundaries are:
 *   - the hero <header>/<section> (rendered from <div data-region="hero"> > section, outside <main>), and
 *   - the 13 direct <section> children of <main>.
 *
 * That is 14 EDS sections → 13 <hr> breaks (one before every section except the
 * first/hero). Five sections use RWE's `color-background-2` tint and get a
 * Section Metadata block with style "tinted": rc3/rc5/rc6/rc9/rc13, which are the
 * main > section:nth-of-type(2|4|6|9|13) elements (verified in
 * migration-work/cleaned.html lines 431, 620, 774, 1568, 1928 and
 * migration-work/page-structure.json).
 *
 * These boundary selectors are the outer main > section wrappers, NOT the inner
 * block elements the parsers replace, so they survive block parsing. We still use
 * the reference before/after-hook + marker pattern: <hr> markers are inserted in
 * beforeTransform (while every section element exists), and Section Metadata is
 * anchored to those markers in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// DOM-verified section boundaries, in document order. First entry (hero) gets no
// leading break. `style: 'tinted'` marks the color-background-2 sections.
const SECTIONS = [
  { id: 'hero', selector: '[data-region="hero"] > section', style: null },
  { id: 'rc2', selector: 'main > section:nth-of-type(1)', style: null },
  { id: 'rc3', selector: 'main > section:nth-of-type(2)', style: 'tinted' },
  { id: 'rc4', selector: 'main > section:nth-of-type(3)', style: null },
  { id: 'rc5', selector: 'main > section:nth-of-type(4)', style: 'tinted' },
  { id: 'rc-quote', selector: 'main > section:nth-of-type(5)', style: null },
  { id: 'rc6', selector: 'main > section:nth-of-type(6)', style: 'tinted' },
  { id: 'rc7', selector: 'main > section:nth-of-type(7)', style: null },
  { id: 'rc8', selector: 'main > section:nth-of-type(8)', style: null },
  { id: 'rc9', selector: 'main > section:nth-of-type(9)', style: 'tinted' },
  { id: 'rc10', selector: 'main > section:nth-of-type(10)', style: null },
  { id: 'rc11', selector: 'main > section:nth-of-type(11)', style: null },
  { id: 'rc-faqcta', selector: 'main > section:nth-of-type(12)', style: null },
  { id: 'rc13', selector: 'main > section:nth-of-type(13)', style: 'tinted' },
];

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections
    && payload.template.sections.length > 1)
    ? payload.template.sections
    : SECTIONS;

  if (hookName === 'beforeTransform') {
    // Insert section-break markers now, before parsers can replace any element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Anchor each styled section's Section Metadata to its marker <hr> (or the
    // original element if it happened to survive parsing).
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // first section never gets a real leading break
      }
    }
  }
}

/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroStageParser from './parsers/hero-stage.js';
import tickerParser from './parsers/ticker.js';
import cardsArticleParser from './parsers/cards-article.js';
import columnsAboutParser from './parsers/columns-about.js';
import columnsPullquoteParser from './parsers/columns-pullquote.js';
import columnsPromoParser from './parsers/columns-promo.js';
import columnsNoteParser from './parsers/columns-note.js';
import galleryParser from './parsers/gallery.js';
import carouselReviewsParser from './parsers/carousel-reviews.js';
import embedSocialParser from './parsers/embed-social.js';
import faqListParser from './parsers/faq-list.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/rwe-cleanup.js';
import sectionsTransformer from './transformers/rwe-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-stage': heroStageParser,
  ticker: tickerParser,
  'cards-article': cardsArticleParser,
  'columns-about': columnsAboutParser,
  'columns-pullquote': columnsPullquoteParser,
  'columns-promo': columnsPromoParser,
  'columns-note': columnsNoteParser,
  gallery: galleryParser,
  'carousel-reviews': carouselReviewsParser,
  'embed-social': embedSocialParser,
  'faq-list': faqListParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, sections transformer last (adds <hr> + section metadata)
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'careers-portal',
  description: "RWE careers portal landing page: hero stage carousel, 'Latest at #TeamRWE' shortnews ticker, job/opportunity card grids, centered intro content sections, interactive world map (hotspot) with adjacent text, image-left teaser (about), partner/reviews logo slider, FAQ accordion, and closing energy-waves grid.",
  urls: [
    'https://www.rwe.com/en/rwe-careers-portal/',
  ],
  blocks: [
    {
      name: 'hero-stage',
      instances: ['#off-screen-content > div > header .sli01--stage-components.sli01--carousel'],
    },
    {
      name: 'ticker',
      instances: ['#off-screen-content > div > main .short-news'],
    },
    {
      name: 'cards-article',
      instances: [
        '#off-screen-content > div > main div.row:has(> div[class*="col-md"] article.tea01--image-left)',
      ],
    },
    {
      name: 'columns-about',
      instances: ['#off-screen-content > div > main .rwe-tick01:has(figure)'],
    },
    {
      name: 'columns-pullquote',
      instances: ['#off-screen-content > div > main > section:nth-of-type(5) > div.container'],
    },
    {
      name: 'columns-promo',
      instances: ['#off-screen-content > div > main > section.teaser-grid--full-width'],
    },
    {
      name: 'columns-note',
      instances: ['#off-screen-content > div > main > section.color-background-2.energy-waves-grid'],
    },
    {
      name: 'gallery',
      instances: ['#off-screen-content > div > main > section:nth-of-type(7) .hotspot-component'],
    },
    {
      name: 'carousel-reviews',
      instances: ['#off-screen-content > div > main > section.color-background-2:nth-of-type(9) .sli01--text-components.sli01--carousel'],
    },
    {
      name: 'embed-social',
      instances: ['#off-screen-content > div > main > section.color-background-2:has(.sli01--text-components) + section .rwe-tick01'],
    },
    {
      name: 'faq-list',
      instances: ['#off-screen-content > div > main .acc01-faq'],
    },
    {
      name: 'section-rc3',
      instances: ['#off-screen-content > div > main > section.color-background-2:nth-of-type(2)'],
      section: 'tinted',
    },
    {
      name: 'section-rc5',
      instances: ['#off-screen-content > div > main > section.color-background-2:nth-of-type(4)'],
      section: 'tinted',
    },
    {
      name: 'section-rc6',
      instances: ['#off-screen-content > div > main > section.color-background-2:nth-of-type(6)'],
      section: 'tinted',
    },
    {
      name: 'section-rc9',
      instances: ['#off-screen-content > div > main > section.color-background-2:nth-of-type(9)'],
      section: 'tinted',
    },
    {
      name: 'section-rc13',
      instances: ['#off-screen-content > div > main > section.color-background-2.energy-waves-grid'],
      section: 'tinted',
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - DOM element to transform (typically document.body)
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Skips section-* entries — those are handled by the sections transformer.
 * @param {Document} document
 * @param {Object} template - PAGE_TEMPLATE
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks
    .filter((blockDef) => !blockDef.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      });
    });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup: consent root, cloned slides, slider controls)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (remove RWE chrome + add section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

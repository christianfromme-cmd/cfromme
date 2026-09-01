/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-careers-portal.js
  var import_careers_portal_exports = {};
  __export(import_careers_portal_exports, {
    default: () => import_careers_portal_default
  });

  // tools/importer/parsers/hero-stage.js
  function parse(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(".slider-slide:not(.slick-cloned)"));
    if (!slides.length) slides = [element];
    const cells = [];
    slides.forEach((slide) => {
      const contentCell = [];
      const video = slide.querySelector("video");
      const img = slide.querySelector("img:not(.impact-print-image)");
      if (video) contentCell.push(video);
      else if (img) contentCell.push(img);
      const heading = slide.querySelector("h1, h2, .headline");
      if (heading) contentCell.push(heading);
      const subheading = slide.querySelector("h3, .subheadline");
      if (subheading) contentCell.push(subheading);
      const cta = slide.querySelector("a[href]");
      if (cta) contentCell.push(cta);
      if (contentCell.length) cells.push([contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-stage", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-stage-image.js
  function parse2(element, { document: document2 }) {
    let bg = element.querySelector("img:not(.impact-print-image)");
    if (!bg) {
      const styleText = Array.from(element.querySelectorAll("style")).map((s) => s.textContent).join("\n");
      const urls = [...styleText.matchAll(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/g)].map((m) => m[1]);
      if (urls.length) {
        const widthOf = (u) => {
          const m = u.match(/[?&]mw=(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        };
        const best = urls.reduce((a, b) => widthOf(b) >= widthOf(a) ? b : a);
        bg = document2.createElement("div");
        bg.setAttribute("style", `background-image: url('${best}')`);
      }
    }
    const textCell = [];
    const heading = element.querySelector("h1, h2, .headline");
    if (heading) textCell.push(heading);
    const subheading = element.querySelector("h3, .subheadline");
    if (subheading) textCell.push(subheading);
    if (!bg && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "hero-stage (image)",
      cells: [
        [bg || ""],
        [textCell.length ? textCell : ""]
      ]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/ticker.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    const heading = element.querySelector(".short-news__header h2, h2");
    if (heading) cells.push([[heading]]);
    const items = Array.from(element.querySelectorAll(".slider-element:not(.slick-cloned)"));
    items.forEach((item) => {
      const itemCell = [];
      const h4 = item.querySelector("h4");
      if (h4) itemCell.push(h4);
      const desc = item.querySelector(".description-text p, .description-text");
      if (desc) itemCell.push(desc);
      const link = item.querySelector("a[href]");
      if (link) itemCell.push(link);
      if (itemCell.length) cells.push([itemCell]);
    });
    if (cells.length <= (heading ? 1 : 0)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "ticker", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function bgImageEl(card, document2) {
    const styleText = Array.from(card.querySelectorAll("style")).map((s) => s.textContent).join("\n");
    const urls = [...styleText.matchAll(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/g)].map((m) => m[1]);
    if (!urls.length) return null;
    const widthOf = (u) => {
      const m = u.match(/[?&]mw=(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    };
    const best = urls.reduce((a, b) => widthOf(b) >= widthOf(a) ? b : a);
    const div = document2.createElement("div");
    div.setAttribute("style", `background-image: url('${best}')`);
    return div;
  }
  function parse4(element, { document: document2 }) {
    const cards = Array.from(
      element.querySelectorAll("article.tea01--image-left, div.rwe-tick01:has(figure)")
    );
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const isSlider = !!element.closest('[data-tpl="sli01"]') || !!element.querySelector('[data-tpl="sli01"]') || cards.every((c) => c.matches("div.rwe-tick01"));
    const images = cards.map((card) => {
      const real = card.querySelector(
        "img:not(.impact-print-image):not(.impact-print-image__wrapper img)"
      );
      return real || bgImageEl(card, document2);
    });
    const hasImages = images.some(Boolean);
    const cells = [];
    cards.forEach((card, i) => {
      const textCell = [];
      const heading = card.querySelector("h3, .headline");
      if (heading) textCell.push(heading);
      const desc = card.querySelector(".content p, header > p, p:not(.image-caption)");
      if (desc) textCell.push(desc);
      if (!isSlider) {
        const anchor = card.querySelector("a[href]");
        const label = card.querySelector(".btn span, .btn");
        if (anchor && anchor.getAttribute("href")) {
          const cta = document2.createElement("a");
          cta.setAttribute("href", anchor.getAttribute("href"));
          cta.textContent = (label ? label.textContent : anchor.textContent).trim();
          if (cta.textContent) textCell.push(cta);
        }
      }
      if (hasImages) {
        cells.push([images[i] || "", textCell]);
      } else {
        cells.push([textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document2, {
      name: isSlider ? "cards-article (slider)" : "cards-article",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-about.js
  function parse5(element, { document: document2 }) {
    const row = element.closest(".row") || element.parentElement;
    if (row && row.hasAttribute("data-columns-about-done")) {
      element.remove();
      return;
    }
    if (row) row.setAttribute("data-columns-about-done", "1");
    const leftCol = [];
    let heading = null;
    let scope = element;
    while (scope && !heading) {
      scope = scope.parentElement;
      if (scope) heading = scope.querySelector("h1, h2");
    }
    if (heading) leftCol.push(heading);
    const textWrapper = element.querySelector(".content") || element;
    Array.from(textWrapper.querySelectorAll(":scope > p")).forEach((p) => leftCol.push(p));
    if (!leftCol.length) leftCol.push(element);
    const rightCol = [];
    const video = (row || document2).querySelector("video");
    const videoContainer = (row || document2).querySelector(".videoplayer-container, .video-container");
    if (video) rightCol.push(video);
    else if (videoContainer) rightCol.push(videoContainer);
    const cells = [];
    if (rightCol.length) cells.push([leftCol, rightCol]);
    else cells.push([leftCol]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-about", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video.js
  function parse6(element, { document: document2 }) {
    const heading = element.querySelector("h1, h2, h3");
    const paras = Array.from(element.querySelectorAll(".content p"));
    const videoEl = element.querySelector("video");
    if (!heading && !videoEl) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const mediaCell = [];
    if (videoEl) {
      const poster = videoEl.getAttribute("poster");
      if (poster) {
        const posterDiv = document2.createElement("div");
        posterDiv.setAttribute("style", `background-image: url('${poster}')`);
        mediaCell.push(posterDiv);
      }
      const source = videoEl.querySelector("source[src], source[data-src]");
      const src = source ? source.getAttribute("src") || source.getAttribute("data-src") : videoEl.getAttribute("data-url");
      if (src) {
        const link = document2.createElement("a");
        link.setAttribute("href", src);
        link.textContent = "Watch video";
        mediaCell.push(link);
      }
    }
    paras.forEach((p) => element.before(p));
    const headingCell = heading ? [heading] : [""];
    const cells = mediaCell.length ? [[headingCell, mediaCell]] : [[headingCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-about", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/awards-logos.js
  function parse7(element, { document: document2 }) {
    const heading = element.querySelector("h1, h2, h3, .headline");
    const imgs = Array.from(element.querySelectorAll("ul.logos li img, ul li img"));
    if (!imgs.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (heading) element.before(heading);
    const row = imgs.map((img) => [img]);
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "columns (logos)",
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-pullquote.js
  function parse8(element, { document: document2 }) {
    const portrait = element.querySelector(".round-image__image img, img");
    const name = element.querySelector(".round-image__image-title, .round-image__image-title strong");
    const role = element.querySelector(".round-image__image-subtitle");
    const quoteHeading = element.querySelector("h4, .headline4");
    const quoteBody = element.querySelector(".round-image__body .content, .round-image__body");
    const leftCol = [];
    if (portrait) leftCol.push(portrait);
    if (name) leftCol.push(name);
    if (role) leftCol.push(role);
    const rightCol = [];
    if (quoteHeading) rightCol.push(quoteHeading);
    if (quoteBody) {
      const paras = Array.from(quoteBody.querySelectorAll(":scope > p"));
      if (paras.length) paras.forEach((p) => rightCol.push(p));
      else rightCol.push(quoteBody);
    }
    if (!leftCol.length && !rightCol.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[leftCol, rightCol]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-pullquote", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse9(element, { document: document2 }) {
    const article = element.querySelector("article.tea01--image-left") || element;
    const media = article.querySelector("video, .media-container");
    const heading = article.querySelector("h3, .headline");
    const desc = article.querySelector(".content p, header > p, p:not(.image-caption)");
    const anchor = article.querySelector("a[href]");
    const label = article.querySelector(".btn span, .btn");
    const rightCol = [];
    if (heading) rightCol.push(heading);
    if (desc) rightCol.push(desc);
    if (anchor && anchor.getAttribute("href")) {
      const cta = document2.createElement("a");
      cta.setAttribute("href", anchor.getAttribute("href"));
      cta.textContent = (label ? label.textContent : anchor.textContent).trim();
      if (cta.textContent) rightCol.push(cta);
    }
    if (!heading && !desc) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (media) cells.push([[media], rightCol]);
    else cells.push([rightCol]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-note.js
  function parse10(element, { document: document2 }) {
    const content = element.querySelector(".content");
    const noteCell = [];
    if (content) {
      const paras = Array.from(content.querySelectorAll(":scope > p"));
      if (paras.length) paras.forEach((p) => noteCell.push(p));
      else noteCell.push(content);
    }
    if (!noteCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[noteCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-note", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/gallery.js
  function parse11(element, { document: document2 }) {
    const entries = Array.from(element.querySelectorAll(".hotspot__entry"));
    if (!entries.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    entries.forEach((entry) => {
      const img = entry.querySelector(".entry-media img, img.entry-image, img");
      const textCell = [];
      const headline = entry.querySelector(".entry-headline, h2, h3");
      if (headline) textCell.push(headline);
      const description = entry.querySelector(".entry-description");
      if (description) {
        const paras = Array.from(description.querySelectorAll(":scope > p"));
        if (paras.length) paras.forEach((p) => textCell.push(p));
        else textCell.push(description);
      }
      const careersLink = entry.querySelector(".entry-link a[href]");
      if (careersLink) textCell.push(careersLink);
      cells.push([img || "", textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-reviews.js
  function parse12(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(".slider-slide:not(.slick-cloned)"));
    if (!slides.length) slides = Array.from(element.querySelectorAll(".slider-slide"));
    const cells = [];
    slides.forEach((slide) => {
      const logo = slide.querySelector(".logos img, img");
      const content = slide.querySelector(".content");
      const textCell = [];
      if (content) textCell.push(content);
      cells.push([logo || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-reviews", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-social.js
  function parse13(element, { document: document2 }) {
    const contentCell = [];
    const heading = element.querySelector("h2, .headline");
    if (heading) contentCell.push(heading);
    const content = element.querySelector(".content");
    if (content) {
      const paras = Array.from(content.querySelectorAll(":scope > p"));
      if (paras.length) paras.forEach((p) => contentCell.push(p));
      else contentCell.push(content);
    }
    if (!contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-social", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/faq-list.js
  function parse14(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".accordion-item"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const label = item.querySelector(".accordion-item__button-label, .accordion-item__button, .accordion-item__headline");
      const questionCell = [];
      if (label) {
        const q = document2.createElement("p");
        q.textContent = label.textContent.trim();
        questionCell.push(q);
      }
      const answerCell = [];
      const content = item.querySelector(".accordion-item__content .content, .accordion-item__content");
      if (content) {
        const nodes = Array.from(content.querySelectorAll(":scope > p, :scope > ul, :scope > ol"));
        if (nodes.length) nodes.forEach((n) => answerCell.push(n));
        else answerCell.push(content);
      }
      cells.push([questionCell, answerCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "faq-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/rwe-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["#usercentrics-root"]);
      WebImporter.DOMUtils.remove(element, [
        "#target-group-select",
        // language / target-group switcher nav (las01r)
        "#off-screen-app-drawer",
        // search drawer wrapper ("Enter search term")
        "#search-drawer",
        '[data-tpl="ses01"]',
        // search form component (fallback if drawer id absent)
        '[data-tpl="target-group-select"]',
        'nav[data-tpl="las01r"]',
        '[data-link-name="Language-Switch"]'
      ]);
      WebImporter.DOMUtils.remove(element, [".slick-cloned"]);
      WebImporter.DOMUtils.remove(element, [
        ".slider-prev",
        ".slider-next",
        ".slider-dots",
        ".slick-dots",
        ".slick-arrow",
        ".slider-nav",
        ".slider-navigation",
        ".scroll-down-btn"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#off-screen-wrap > header",
        ".navigation-wrapper",
        "#breadcrumb-top",
        "#breadcrumb-bottom",
        "#main-footer",
        "#TextSnippetShare",
        "#BackToTop"
      ]);
      WebImporter.DOMUtils.remove(element, [
        'img[src*="accountinsight"]',
        'img[src*="/track/"]'
      ]);
      WebImporter.DOMUtils.remove(element, ["script", "style", "noscript"]);
    }
  }

  // tools/importer/transformers/rwe-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var TINTED_MARKER_ATTR = "data-excat-section-tinted";
  var TINTED_CLASS = "color-background-2";
  function collectSections(element) {
    const hero = element.querySelector('[data-region="hero"] > section');
    const mainSections = [...element.querySelectorAll("main > section")];
    const list = [];
    if (hero) list.push({ el: hero, isHero: true });
    mainSections.forEach((el) => list.push({ el, isHero: false }));
    return list;
  }
  function transform2(hookName, element, payload) {
    const templateSections = payload && payload.template && payload.template.sections && payload.template.sections.length > 1 ? payload.template.sections : null;
    if (hookName === "beforeTransform") {
      const sections = templateSections ? templateSections.map((s) => ({ el: element.querySelector(s.selector), isHero: s.id === "hero" })) : collectSections(element);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const { el } = sections[i];
        if (!el) continue;
        const tinted = el.classList.contains(TINTED_CLASS);
        if (i === 0 && !tinted) continue;
        const hr = document.createElement("hr");
        hr.setAttribute(SECTION_MARKER_ATTR, `s${i}`);
        if (tinted) hr.setAttribute(TINTED_MARKER_ATTR, "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const markers = [...element.querySelectorAll(`[${TINTED_MARKER_ATTR}="true"]`)];
      markers.forEach((marker) => {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: "tinted" }
        });
        marker.after(metadataBlock);
        marker.removeAttribute(TINTED_MARKER_ATTR);
      });
    }
  }

  // tools/importer/import-careers-portal.js
  var parsers = {
    "hero-stage": parse,
    "hero-stage-image": parse2,
    ticker: parse3,
    "cards-article": parse4,
    "columns-about": parse5,
    "columns-video": parse6,
    "awards-logos": parse7,
    "columns-pullquote": parse8,
    "columns-promo": parse9,
    "columns-note": parse10,
    gallery: parse11,
    "carousel-reviews": parse12,
    "embed-social": parse13,
    "faq-list": parse14
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "careers-portal",
    description: "RWE careers portal landing page: hero stage carousel, 'Latest at #TeamRWE' shortnews ticker, job/opportunity card grids, centered intro content sections, interactive world map (hotspot) with adjacent text, image-left teaser (about), partner/reviews logo slider, FAQ accordion, and closing energy-waves grid.",
    urls: [
      "https://www.rwe.com/en/rwe-careers-portal/"
    ],
    blocks: [
      {
        name: "hero-stage",
        instances: ["#off-screen-content > div > header .sli01--stage-components.sli01--carousel"]
      },
      {
        name: "hero-stage-image",
        instances: ["#off-screen-content .stage.sta01--compact", '#off-screen-content [data-tpl="sta01"]']
      },
      {
        name: "ticker",
        instances: ["#off-screen-content > div > main .short-news"]
      },
      {
        name: "cards-article",
        instances: [
          // Discover more / Driving ideas teaser rows (image-left tea01r, bg-image photos).
          '#off-screen-content > div > main div.row:has(> div[class*="col-md"] article.tea01--image-left)',
          // "Key reasons to work with RWE" cards: the sli01 slider wraps 6 tic01
          // cards, each with a real <figure><picture>. Content-page archetype only
          // (data-tpl present) — leaves the landing carousel untouched.
          '#off-screen-content > div > main [data-tpl="sli01"]:has(.rwe-tick01 figure)',
          // Standalone "Insights from #TeamRWE" teaser (single full-width tea01r,
          // bg-image photo) — rendered as a one-card grid.
          '#off-screen-content > div > main div.grid-content.col-sm-12:has(> article[data-tpl="tea01r"])'
        ]
      },
      {
        name: "columns-about",
        // Landing page: the "keep the world moving" text+video pair (the scraped
        // landing DOM has data-tpl stripped, so these wrappers carry no data-tpl).
        // The `:not([data-tpl])` guard keeps this landing-specific match while
        // preventing it from swallowing the why-work-here "Key reasons" tic01 cards
        // (data-tpl="tic01") and the Shaping video card (inside data-tpl grid-bas-03),
        // which are handled by cards-article / columns-video on the content-page archetype.
        instances: ["#off-screen-content > div > main .rwe-tick01:has(figure):not([data-tpl])"]
      },
      {
        name: "columns-video",
        // "Shaping the energy future together": two-tone heading + intro paras +
        // an inline video player. Content-page archetype (data-tpl grid-bas-03).
        instances: ['#off-screen-content > div > main section[data-tpl="grid-bas-03"]:has(video)']
      },
      {
        name: "awards-logos",
        // "Our awards": lll01 logo list. Content-page archetype (data-tpl lll01).
        instances: ['#off-screen-content > div > main section[data-tpl="lll01"]']
      },
      {
        name: "columns-pullquote",
        instances: ["#off-screen-content > div > main > section:nth-of-type(5) > div.container"]
      },
      {
        name: "columns-promo",
        instances: ["#off-screen-content > div > main > section.teaser-grid--full-width"]
      },
      {
        name: "columns-note",
        instances: ["#off-screen-content > div > main > section.color-background-2.energy-waves-grid"]
      },
      {
        name: "gallery",
        instances: ["#off-screen-content > div > main > section:nth-of-type(7) .hotspot-component"]
      },
      {
        name: "carousel-reviews",
        instances: ["#off-screen-content > div > main > section.color-background-2:nth-of-type(9) .sli01--text-components.sli01--carousel"]
      },
      {
        name: "embed-social",
        instances: ["#off-screen-content > div > main > section.color-background-2:has(.sli01--text-components) + section .rwe-tick01"]
      },
      {
        name: "faq-list",
        instances: [
          "#off-screen-content > div > main .acc01-faq",
          "#off-screen-content > div > main section:has(.accordion-item)"
        ]
      },
      {
        name: "section-rc3",
        instances: ["#off-screen-content > div > main > section.color-background-2:nth-of-type(2)"],
        section: "tinted"
      },
      {
        name: "section-rc5",
        instances: ["#off-screen-content > div > main > section.color-background-2:nth-of-type(4)"],
        section: "tinted"
      },
      {
        name: "section-rc6",
        instances: ["#off-screen-content > div > main > section.color-background-2:nth-of-type(6)"],
        section: "tinted"
      },
      {
        name: "section-rc9",
        instances: ["#off-screen-content > div > main > section.color-background-2:nth-of-type(9)"],
        section: "tinted"
      },
      {
        name: "section-rc13",
        instances: ["#off-screen-content > div > main > section.color-background-2.energy-waves-grid"],
        section: "tinted"
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.filter((blockDef) => !blockDef.name.startsWith("section-")).forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_careers_portal_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_careers_portal_exports);
})();

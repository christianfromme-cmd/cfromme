import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorates the "slider" variant: white rwe-tick01-style cards paginated
 * 3-per-view (2 on tablet, 1 on mobile) with prev/next arrows and page dots,
 * matching the live RWE "Key reasons" sli01 slider.
 * @param {Element} block
 * @param {HTMLUListElement} ul The already-built card list
 */
function decorateSlider(block, ul) {
  const cards = [...ul.children];

  const viewport = document.createElement('div');
  viewport.className = 'cards-article-viewport';
  viewport.append(ul);

  const controls = document.createElement('div');
  controls.className = 'cards-article-controls';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-article-arrow cards-article-prev';
  prev.setAttribute('aria-label', 'Previous');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-article-arrow cards-article-next';
  next.setAttribute('aria-label', 'Next');

  const dotsNav = document.createElement('div');
  dotsNav.className = 'cards-article-dots';
  dotsNav.setAttribute('role', 'tablist');

  block.textContent = '';
  block.append(viewport, controls);
  controls.append(prev, dotsNav, next);

  // perPage is responsive; recomputed on resize. Pagination is index-based so
  // the same logic drives 1/2/3-up without rebuilding the DOM.
  const perPage = () => {
    if (window.matchMedia('(width >= 900px)').matches) return 3;
    if (window.matchMedia('(width >= 600px)').matches) return 2;
    return 1;
  };

  let page = 0;
  let dots = [];

  const pageCount = () => Math.max(1, Math.ceil(cards.length / perPage()));

  function goTo(i) {
    const pages = pageCount();
    page = Math.max(0, Math.min(i, pages - 1));
    // Shift the track by whole pages; each card is (100 / perPage)% wide, so a
    // page step is a 100% translate of the viewport.
    ul.style.transform = `translateX(-${page * 100}%)`;
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === page);
      d.setAttribute('aria-selected', idx === page ? 'true' : 'false');
    });
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
    // Expose per-page count to CSS so each card is sized to the current view.
    ul.style.setProperty('--cards-per-page', perPage());
  }

  const renderDots = () => {
    dotsNav.textContent = '';
    dots = Array.from({ length: pageCount() }, (unused, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'cards-article-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsNav.append(dot);
      return dot;
    });
  };

  prev.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));

  let resizeRAF;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(() => {
      renderDots();
      goTo(Math.min(page, pageCount() - 1));
    });
  });

  renderDots();
  goTo(0);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // Only optimize same-origin (AEM media bus) images. External images
    // (e.g. www.rwe.com) don't understand the ?width/format/optimize params
    // and break under a webp <source>, so keep them as a plain lazy <img>.
    let isExternal = true;
    try {
      isExternal = new URL(img.src, window.location.href).origin !== window.location.origin;
    } catch { /* keep as external */ }
    if (isExternal) {
      img.setAttribute('loading', 'lazy');
      return;
    }
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Slider variant (RWE sli01 "Key reasons"): paginated carousel of white cards.
  if (block.classList.contains('slider')) {
    decorateSlider(block, ul);
    return;
  }

  block.textContent = '';
  block.append(ul);
}

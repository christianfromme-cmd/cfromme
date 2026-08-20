// Inline defaults (this boilerplate's aem.js does not export fetchPlaceholders).
const placeholders = {
  previousSlide: 'Previous item',
  nextSlide: 'Next item',
  showSlide: 'Show item',
  of: 'of',
};

// RWE "Latest at #TeamRWE" short-news header icon. Local copy of the RWE UI Kit
// source file (icons/kurznachrichtenmodul-info.svg) — no external request.
const NEWS_ICON = '<img src="/icons/kurznachrichtenmodul-info.svg" alt="" loading="lazy">';

function showSlide(block, index = 0) {
  const slides = block.querySelectorAll('.ticker-slide');
  if (!slides.length) return;
  let target = index;
  if (target < 0) target = slides.length - 1;
  if (target >= slides.length) target = 0;
  block.dataset.activeSlide = target;

  slides.forEach((slide, idx) => {
    const active = idx === target;
    slide.setAttribute('aria-hidden', String(!active));
    slide.querySelectorAll('a').forEach((link) => {
      if (active) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.ticker-slide-indicator button').forEach((button, idx) => {
    if (idx === target) {
      button.setAttribute('disabled', 'true');
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    }
  });
}

function unwrapButtons(scope) {
  // The RWE ticker uses plain text links (teal + arrow), not pill buttons.
  // Undo EDS button auto-decoration inside slides.
  scope.querySelectorAll('a.button').forEach((link) => {
    link.classList.remove('button', 'primary', 'secondary', 'accent');
    link.classList.add('ticker-cta');
    const wrapper = link.closest('.button-container, .button-wrapper');
    if (wrapper) wrapper.classList.remove('button-container', 'button-wrapper');
  });
  // Also tag any remaining standalone links as CTAs.
  scope.querySelectorAll('p > a:only-child').forEach((link) => {
    link.classList.add('ticker-cta');
  });
}

let tickerId = 0;
export default async function decorate(block) {
  tickerId += 1;
  block.setAttribute('id', `ticker-${tickerId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'News ticker');

  const rows = [...block.querySelectorAll(':scope > div')];

  // The first row holds the section heading ("Latest at #TeamRWE").
  const header = document.createElement('div');
  header.classList.add('ticker-header');
  const headerRow = rows.shift();
  if (headerRow) {
    const heading = headerRow.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const icon = document.createElement('span');
      icon.classList.add('ticker-header-icon');
      icon.innerHTML = NEWS_ICON;
      header.append(icon);
      header.append(heading);
      block.setAttribute('aria-label', heading.textContent.trim());
    } else {
      while (headerRow.firstElementChild) {
        const cell = headerRow.firstElementChild;
        while (cell.firstChild) header.append(cell.firstChild);
        cell.remove();
      }
    }
    headerRow.remove();
  }

  // Remaining rows are the rotating items.
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('ticker-slides');

  rows.forEach((row, idx) => {
    const slide = document.createElement('li');
    slide.classList.add('ticker-slide');
    slide.dataset.slideIndex = idx;
    slide.setAttribute('id', `ticker-${tickerId}-item-${idx}`);

    // Each item is one or two cells. A cell holding only a picture/image is the
    // item thumbnail (shown right, as on the source); the other cell is the text.
    const cells = [...row.querySelectorAll(':scope > div')];
    let imageCell = null;
    const textCell = document.createElement('div');
    textCell.classList.add('ticker-slide-text');
    cells.forEach((c) => {
      const pic = c.querySelector('picture, img');
      const onlyMedia = pic && !c.textContent.trim();
      if (onlyMedia && !imageCell) {
        imageCell = document.createElement('div');
        imageCell.classList.add('ticker-slide-image');
        imageCell.append(pic);
      } else {
        while (c.firstChild) textCell.append(c.firstChild);
      }
    });
    if (!cells.length) { while (row.firstChild) textCell.append(row.firstChild); }

    unwrapButtons(textCell);
    slide.append(textCell);
    if (imageCell) slide.append(imageCell);

    const labelledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
    if (labelledBy && labelledBy.id) {
      slide.setAttribute('aria-labelledby', labelledBy.id);
    }

    slidesWrapper.append(slide);
    row.remove();
  });

  const isSingle = rows.length < 2;

  // Vertical navigation column: prev chevron, dot indicators, next chevron.
  const nav = document.createElement('div');
  nav.classList.add('ticker-navigation');

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.classList.add('slide-prev');
  prevButton.setAttribute('aria-label', placeholders.previousSlide);

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.classList.add('slide-next');
  nextButton.setAttribute('aria-label', placeholders.nextSlide);

  const indicators = document.createElement('ol');
  indicators.classList.add('ticker-slide-indicators');

  rows.forEach((row, idx) => {
    const indicator = document.createElement('li');
    indicator.classList.add('ticker-slide-indicator');
    indicator.dataset.targetSlide = idx;
    indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide} ${idx + 1} ${placeholders.of} ${rows.length}"></button>`;
    indicators.append(indicator);
  });

  if (!isSingle) {
    nav.append(prevButton, indicators, nextButton);
  }

  const viewport = document.createElement('div');
  viewport.classList.add('ticker-viewport');
  if (!isSingle) viewport.append(nav);
  viewport.append(slidesWrapper);

  block.append(header, viewport);

  showSlide(block, 0);

  if (!isSingle) {
    prevButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
    nextButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
    indicators.querySelectorAll('.ticker-slide-indicator button').forEach((button, idx) => {
      button.addEventListener('click', () => showSlide(block, idx));
    });

    // Auto-advance, pausing on hover/focus for accessibility.
    let timer = setInterval(() => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    }, 6000);
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
      }, 6000);
    };
    block.addEventListener('mouseenter', stop);
    block.addEventListener('mouseleave', start);
    block.addEventListener('focusin', stop);
    block.addEventListener('focusout', start);
  }
}

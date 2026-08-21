/*
 * Embed Social — "RWE @ Social Media"
 * -----------------------------------------------------------------------------
 * Rebuilds the live rwe.com social-media area as an author-managed masonry grid
 * of social post cards (matching the live Flockler layout: RWE avatar + name,
 * network icon, post text with "show more", optional image/video media, and a
 * relative-time + external-link footer).
 *
 * Authoring contract (div-grid rows):
 *   Row 1  → intro: a heading (h2) + one or more paragraphs of copy.
 *   Row 2+ → one post card each. A card cell contains:
 *              - optional <picture> (the post media). Wrap it in an <a> to mark
 *                it as a video — a circular play overlay is added.
 *              - the post text (paragraphs / rich text).
 *              - a final link whose TEXT is the relative time ("1 wk. ago") and
 *                whose HREF is the external post URL → becomes the card footer.
 *
 * Variants:
 *   (default)  → render the authored cards.
 *   "live"     → load RWE's live Flockler social wall once the visitor has given
 *                consent, replacing the authored cards. Until consent is granted
 *                the authored cards remain as the fallback view. This reuses the
 *                same Flockler site + wall the live rwe.com careers page uses.
 */

const LINKEDIN_ICON = '<img class="embed-social-network" src="/icons/rwe-social-linkedin-blue.svg" alt="LinkedIn" loading="lazy" width="24" height="24">';
const RWE_AVATAR = '<img class="embed-social-avatar" src="/icons/rwe-logo.svg" alt="" aria-hidden="true" loading="lazy">';
const TIME_ICON = '<img src="/icons/rwe-time.svg" alt="" aria-hidden="true" loading="lazy" width="16" height="16">';
const EXTERN_ICON = '<img src="/icons/rwe-extern.svg" alt="" aria-hidden="true" loading="lazy" width="14" height="14">';

// RWE's Flockler social wall (same account/wall as the live rwe.com careers
// page: "HR career social wall EN (LinkedIn only)").
const FLOCKLER_SITE = '1740543370f005f9a7ee89ffd1e28277';
const FLOCKLER_WALL = '1973f081d510ac80a2f9c9713a49f9e5';
const FLOCKLER_SRC = `https://plugins.flockler.com/embed/${FLOCKLER_SITE}/${FLOCKLER_WALL}`;

/**
 * Returns the first row IF it looks like the intro (has a heading, no media).
 * @param {Element} block The block element
 * @returns {Element|null} the intro row, if present
 */
function extractIntro(block) {
  const firstRow = block.querySelector(':scope > div');
  if (!firstRow) return null;
  if (firstRow.querySelector('h1, h2, h3, h4, h5, h6') && !firstRow.querySelector('picture')) {
    return firstRow;
  }
  return null;
}

/**
 * Builds the card header (RWE avatar + name + network icon).
 * @returns {Element} the header element
 */
function buildHeader() {
  const header = document.createElement('div');
  header.className = 'embed-social-card-header';
  header.innerHTML = `<span class="embed-social-account">${RWE_AVATAR}<span class="embed-social-account-name">RWE</span></span>${LINKEDIN_ICON}`;
  return header;
}

/**
 * Builds the media area from the cell's first <picture>, if any, and removes it
 * from the cell. A picture wrapped in a link is treated as a video (play overlay).
 * @param {Element} cell The card cell
 * @returns {Element|null} the media element, or null when there is no media
 */
function buildMedia(cell) {
  const picture = cell.querySelector('picture');
  if (!picture) return null;

  const link = picture.closest('a');
  const media = document.createElement('div');
  media.className = 'embed-social-card-media';

  if (link) {
    media.classList.add('is-video');
    link.classList.add('embed-social-media-link');
    link.setAttribute('aria-label', 'Play video');
    const overlay = document.createElement('span');
    overlay.className = 'embed-social-play';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<img src="/icons/rwe-play.svg" alt="" width="28" height="28">';
    link.append(overlay);
    media.append(link);
  } else {
    media.append(picture);
  }

  // Drop the now-consumed media (and any emptied wrapping paragraph) from the cell.
  const wrapper = (link || picture).closest('p');
  if (wrapper && !wrapper.textContent.trim()) wrapper.remove();
  return media;
}

/**
 * Builds the footer (relative time + external-link icon) from the cell's last
 * link, and removes that link from the cell.
 * @param {Element} cell The card cell
 * @returns {Element|null} the footer element, or null when there is no footer link
 */
function buildFooter(cell) {
  const links = [...cell.querySelectorAll('a')];
  const footerLink = links[links.length - 1];
  if (!footerLink) return null;

  const timeText = footerLink.textContent.trim();
  const href = footerLink.getAttribute('href');

  const footer = document.createElement('div');
  footer.className = 'embed-social-card-footer';

  const time = document.createElement('span');
  time.className = 'embed-social-time';
  time.innerHTML = `${TIME_ICON}<span>${timeText}</span>`;
  footer.append(time);

  if (href && href !== '#') {
    const ext = document.createElement('a');
    ext.className = 'embed-social-extern';
    ext.href = href;
    ext.target = '_blank';
    ext.rel = 'noopener noreferrer';
    ext.setAttribute('aria-label', 'View post on LinkedIn');
    ext.innerHTML = EXTERN_ICON;
    footer.append(ext);
  }

  const wrap = footerLink.closest('p');
  footerLink.remove();
  if (wrap && !wrap.textContent.trim() && !wrap.querySelector('img, picture')) wrap.remove();
  return footer;
}

/**
 * Builds one post card from an authored row.
 * @param {Element} row The authored card row
 * @returns {Element} the decorated card article
 */
function buildCard(row) {
  const cell = row.querySelector(':scope > div') || row;

  const card = document.createElement('article');
  card.className = 'embed-social-card';
  card.append(buildHeader());

  const media = buildMedia(cell);
  if (media) card.append(media);

  const footer = buildFooter(cell);

  const body = document.createElement('div');
  body.className = 'embed-social-card-body';
  body.append(...cell.childNodes);
  if (body.textContent.trim()) card.append(body);

  if (footer) card.append(footer);
  return card;
}

/**
 * Adds an expandable "SHOW MORE…" control to a card body whose text overflows
 * the clamp. Must run after the card is in the document so heights are known.
 * @param {Element} body The card body element
 */
function addShowMore(body) {
  // Overflowing when the natural content is taller than the clamped box.
  if (body.scrollHeight - body.clientHeight < 4) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'embed-social-showmore';
  toggle.textContent = 'Show more…';
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const expanded = body.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Show less' : 'Show more…';
  });

  body.after(toggle);
}

/**
 * Loads RWE's Flockler social wall into the block, replacing the authored
 * fallback cards. Injects the Flockler container + embed script once; the
 * script self-initialises from the container id. Safe to call multiple times.
 * @param {Element} block The block element
 * @param {Element} fallback The authored grid to hide once the wall loads
 */
function loadFlocklerWall(block, fallback) {
  if (block.dataset.flocklerLoaded === 'true') return;
  block.dataset.flocklerLoaded = 'true';

  const container = document.createElement('div');
  container.className = 'embed-social-feed';
  container.id = `flockler-embed-${FLOCKLER_WALL}`;
  block.append(container);

  const script = document.createElement('script');
  script.src = FLOCKLER_SRC;
  script.async = true;
  // Once Flockler has populated the wall, hide the authored fallback cards.
  script.addEventListener('load', () => {
    block.classList.add('feed-loaded');
    if (fallback) fallback.setAttribute('hidden', '');
  });
  document.head.append(script);
}

/**
 * Wires the live variant to the site consent layer: load the Flockler wall when
 * consent is (or becomes) granted, otherwise leave the authored fallback shown.
 * @param {Element} block The block element
 * @param {Element} fallback The authored grid
 */
function initLiveFeed(block, fallback) {
  const onUpdate = (e) => {
    if (e.detail && e.detail.consented) loadFlocklerWall(block, fallback);
  };
  window.addEventListener('consent.update', onUpdate);
  // Handle the case where consent was already granted before this block loaded.
  const params = new URLSearchParams(window.location.search).get('consent');
  if (params && ['accept', 'true', '1', 'yes'].includes(params.toLowerCase())) {
    loadFlocklerWall(block, fallback);
  }
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const isLive = block.classList.contains('live');
  const rows = [...block.querySelectorAll(':scope > div')];

  const introRow = extractIntro(block);
  const intro = document.createElement('div');
  intro.className = 'embed-social-intro';
  if (introRow) {
    intro.append(...introRow.childNodes);
    introRow.remove();
  }

  const cardRows = rows.filter((r) => r !== introRow);
  const grid = document.createElement('div');
  grid.className = 'embed-social-grid';
  cardRows.forEach((row) => grid.append(buildCard(row)));

  block.textContent = '';
  if (intro.childNodes.length) block.append(intro);
  block.append(grid);

  // After layout, add a "SHOW MORE…" control to any card whose text is clamped.
  requestAnimationFrame(() => {
    grid.querySelectorAll('.embed-social-card-body').forEach(addShowMore);
  });

  if (isLive) {
    // The authored grid is the fallback shown before consent; once the visitor
    // consents, RWE's live Flockler wall loads and replaces it.
    initLiveFeed(block, grid);
  }
}

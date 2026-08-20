import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * gallery — RWE careers "Global impact" interactive hotspot map.
 *
 * The live RWE page renders this as a world map with teal "+" markers placed
 * over each region; clicking a marker opens a popover with that country's
 * headline, description and links. We reproduce that here: the authored rows
 * (country name + copy + links) become both the hotspot popovers AND an
 * accessible country list beneath the map.
 *
 * The map background image and per-country marker coordinates are design
 * properties of this specific map (not authored), so they live here keyed by
 * the country heading text. A country with no matching coordinate still shows
 * in the list; it simply gets no marker.
 */

// Source map background (RWE Sitecore asset, 1600x1066).
const MAP_IMAGE = 'https://www.rwe.com/-/media/RWE/karriere-bei-rwe/TIC01-globale-karte.jpg?h=1066&iar=0&w=1600&hash=FABD411891B946D285C6271A830139BD';
const MAP_ALT = 'A map view of Europe featuring parts of the USA and Asia. The countries are shaded in various green tones.';

// Marker positions (top%, left%) as on the live map, keyed by a normalized
// version of the country heading text.
const HOTSPOTS = {
  'rwe in the americas': { top: 45, left: 15.78 },
  'rwe in australia': { top: 41, left: 87.2 },
  'rwe in the benelux': { top: 55, left: 45 },
  'rwe in china': { top: 15, left: 79 },
  'rwe in denmark': { top: 41, left: 48.2 },
  'rwe in germany (headquarter)': { top: 53, left: 50 },
  'rwe in france': { top: 63, left: 40.5 },
  'rwe in greece': { top: 84, left: 63 },
  'rwe in india': { top: 22, left: 73 },
  'rwe in indonesia': { top: 34, left: 82 },
  'rwe in ireland': { top: 42.2, left: 32.4 },
  'rwe in italy': { top: 73, left: 50 },
  'rwe in japan': { top: 14, left: 90 },
  'rwe in poland': { top: 52, left: 58.5 },
  'rwe in singapore': { top: 30, left: 80 },
  'rwe in spain': { top: 75, left: 31 },
  'rwe in the united kingdom': { top: 45.8, left: 39 },
};

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();

let galleryId = 0;

/* Build the accessible country list (also the small-screen experience). Each
   entry keeps the authored heading, copy and RWE-styled text links. */
function buildListItem(row) {
  const li = document.createElement('li');
  while (row.firstElementChild) li.append(row.firstElementChild);
  [...li.children].forEach((div) => {
    if (div.children.length === 1 && div.querySelector('picture')) {
      div.className = 'gallery-card-image';
    } else if (div.children.length === 0) {
      div.remove();
    } else {
      div.className = 'gallery-card-body';
      div.querySelectorAll('h2').forEach((h2) => {
        const h3 = document.createElement('h3');
        h3.className = h2.className;
        while (h2.firstChild) h3.append(h2.firstChild);
        h2.replaceWith(h3);
      });
      div.querySelectorAll('a').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary', 'accent');
        const wrapper = a.closest('.button-container, .button-wrapper');
        if (wrapper) wrapper.classList.remove('button-container', 'button-wrapper');
        const isCareers = /careers/i.test((a.textContent || '').trim());
        a.classList.add(isCareers ? 'gallery-link-careers' : 'gallery-link-about');
      });
    }
  });
  if (!li.querySelector('.gallery-card-image')) li.classList.add('gallery-card-no-image');
  return li;
}

/* Position the shared popover near its marker, clamped inside the map. */
function positionPopover(map, popover, marker) {
  const mapRect = map.getBoundingClientRect();
  const mRect = marker.getBoundingClientRect();
  const markerCx = (mRect.left + mRect.width / 2) - mapRect.left;
  const markerCy = (mRect.top + mRect.height / 2) - mapRect.top;

  // measure popover
  popover.style.left = '0px';
  popover.style.top = '0px';
  const pw = popover.offsetWidth;
  const ph = popover.offsetHeight;
  const gap = 14;

  // horizontal: centre on marker, clamp within map
  let left = markerCx - pw / 2;
  left = Math.max(8, Math.min(left, mapRect.width - pw - 8));

  // vertical: prefer below the marker; flip above if it would overflow
  let top = markerCy + gap + mRect.height / 2;
  if (top + ph > mapRect.height && markerCy - gap - ph - mRect.height / 2 > 0) {
    top = markerCy - gap - ph - mRect.height / 2;
    popover.dataset.placement = 'above';
  } else {
    popover.dataset.placement = 'below';
  }
  top = Math.max(8, Math.min(top, mapRect.height - ph - 8));

  popover.style.left = `${Math.round(left)}px`;
  popover.style.top = `${Math.round(top)}px`;
}

export default function decorate(block) {
  galleryId += 1;
  const rows = [...block.children];

  // Build the country list. It stays in the DOM as the data source for the
  // popovers and as a screen-reader-accessible alternative to the visual map,
  // but is visually hidden — details are shown only on marker click.
  const list = document.createElement('ul');
  list.className = 'gallery-list gallery-list-visually-hidden';
  const entries = rows.map((row) => buildListItem(row));
  entries.forEach((li) => list.append(li));

  // Optimize any same-origin images in the list (external stay as-is).
  list.querySelectorAll('picture > img').forEach((img) => {
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

  // Build the interactive map.
  const mapWrap = document.createElement('div');
  mapWrap.className = 'gallery-map';

  const img = document.createElement('img');
  img.className = 'gallery-map-image';
  img.src = MAP_IMAGE;
  img.alt = MAP_ALT;
  img.loading = 'lazy';
  img.width = 1600;
  img.height = 1066;
  mapWrap.append(img);

  const hotspots = document.createElement('div');
  hotspots.className = 'gallery-hotspots';
  mapWrap.append(hotspots);

  const popover = document.createElement('div');
  popover.className = 'gallery-popover';
  popover.id = `gallery-${galleryId}-popover`;
  popover.setAttribute('role', 'dialog');
  popover.hidden = true;
  const popClose = document.createElement('button');
  popClose.type = 'button';
  popClose.className = 'gallery-popover-close';
  popClose.setAttribute('aria-label', 'Close');
  const popBody = document.createElement('div');
  popBody.className = 'gallery-popover-body';
  popover.append(popClose, popBody);
  mapWrap.append(popover);

  let activeMarker = null;
  const closePopover = () => {
    popover.hidden = true;
    if (activeMarker) {
      activeMarker.setAttribute('aria-expanded', 'false');
      activeMarker.classList.remove('is-active');
      activeMarker = null;
    }
  };
  const openPopover = (marker, li) => {
    popBody.innerHTML = '';
    // clone the authored image + body (heading + copy + links) into the popover
    const image = li.querySelector('.gallery-card-image');
    if (image) popBody.append(image.cloneNode(true));
    const body = li.querySelector('.gallery-card-body');
    if (body) popBody.append(body.cloneNode(true));
    popover.hidden = false;
    positionPopover(mapWrap, popover, marker);
    marker.setAttribute('aria-expanded', 'true');
    marker.classList.add('is-active');
    activeMarker = marker;
    popClose.focus();
  };

  // Create a marker for every country that has a coordinate.
  entries.forEach((li, idx) => {
    const heading = li.querySelector('h3, h2');
    const key = norm(heading?.textContent);
    const pos = HOTSPOTS[key];
    if (!pos) return;
    const label = heading.textContent.trim();

    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'gallery-hotspot';
    marker.style.top = `${pos.top}%`;
    marker.style.left = `${pos.left}%`;
    marker.setAttribute('aria-label', label);
    marker.setAttribute('aria-expanded', 'false');
    marker.setAttribute('aria-controls', popover.id);
    marker.dataset.country = key;
    li.id = li.id || `gallery-${galleryId}-country-${idx}`;

    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeMarker === marker) { closePopover(); return; }
      if (activeMarker) closePopover();
      openPopover(marker, li);
    });
    hotspots.append(marker);
  });

  popClose.addEventListener('click', () => {
    const returnTo = activeMarker;
    closePopover();
    if (returnTo) returnTo.focus();
  });
  // Dismiss on outside click / Escape.
  document.addEventListener('click', (e) => {
    if (!popover.hidden && !popover.contains(e.target) && !e.target.closest('.gallery-hotspot')) {
      closePopover();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popover.hidden) {
      const returnTo = activeMarker;
      closePopover();
      if (returnTo) returnTo.focus();
    }
  });
  window.addEventListener('resize', () => { if (!popover.hidden && activeMarker) positionPopover(mapWrap, popover, activeMarker); });

  block.textContent = '';
  block.append(mapWrap, list);
}

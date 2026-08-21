import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

// White (negative) icons in the RWE stroke style, for the dark brand bar. The
// world icon is the official UI-kit asset (icons/rwe-world.svg); the rest are
// simple UI glyphs rendered inline to stay tiny and match the bar.
const ICONS = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></g></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></g></svg>',
  contact: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>',
  apps: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path stroke-linecap="round" d="M17.5 14.5v6M14.5 17.5h6"/></g></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/></g></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="6 9 12 15 18 9"/></svg>',
  world: '<img src="/icons/rwe-world.svg" alt="" aria-hidden="true" loading="lazy" width="20" height="20">',
};

/** Builds a brand-bar item (icon + label) as a link or button. */
function barItem({
  tag = 'a', icon, label, href, cls, ariaLabel,
}) {
  const el = document.createElement(tag);
  el.className = `nav-bar-item ${cls || ''}`.trim();
  if (tag === 'a' && href) el.href = href;
  if (tag === 'button') el.type = 'button';
  if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
  el.innerHTML = `<span class="nav-bar-icon">${icon}</span><span class="nav-bar-label">${label}</span>`;
  return el;
}

/**
 * loads and decorates the header (RWE corporate brand bar)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav content as a fragment (brand / sections / tools)
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const brandGroup = nav.children[0];
  const sectionsGroup = nav.children[1];
  const toolsGroup = nav.children[2];

  // --- Brand: white RWE logo, centered ---
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandHref = brandGroup?.querySelector('a')?.getAttribute('href') || '/en/';
  brand.innerHTML = `<a href="${brandHref}" aria-label="RWE home"><img class="nav-logo" src="/icons/rwe-logo-white.svg" alt="RWE" width="96" height="28"></a>`;

  // --- Tools links (RWE Global / Contact / Apps & Tools) from the nav content ---
  const toolLinks = toolsGroup ? [...toolsGroup.querySelectorAll('a')] : [];
  const appsLink = toolLinks.find((a) => /apps/i.test(a.textContent));
  const globalLink = toolLinks.find((a) => /global/i.test(a.textContent));
  const contactLink = toolLinks.find((a) => /contact/i.test(a.textContent) && a !== appsLink);

  // --- Left cluster: Menu toggle + Contact + Apps & Tools ---
  const left = document.createElement('div');
  left.className = 'nav-left';
  const menuToggle = barItem({
    tag: 'button', icon: ICONS.menu, label: 'Menu', cls: 'nav-menu-toggle', ariaLabel: 'Open menu',
  });
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', 'nav-menu-panel');
  left.append(menuToggle);
  if (contactLink) {
    left.append(barItem({ icon: ICONS.contact, label: contactLink.textContent.trim(), href: contactLink.getAttribute('href') }));
  }
  if (appsLink) {
    left.append(barItem({ icon: ICONS.apps, label: appsLink.textContent.trim(), href: appsLink.getAttribute('href') }));
  }

  // --- Right cluster: RWE Global + Search + Language ---
  const right = document.createElement('div');
  right.className = 'nav-right';
  if (globalLink) {
    right.append(barItem({
      icon: ICONS.world, label: globalLink.textContent.trim(), href: globalLink.getAttribute('href'), cls: 'nav-item-global',
    }));
  }
  right.append(barItem({
    tag: 'button', icon: ICONS.search, label: 'Search', cls: 'nav-item-search', ariaLabel: 'Search',
  }));
  right.append(barItem({
    tag: 'button', icon: ICONS.chevron, label: 'English', cls: 'nav-item-lang', ariaLabel: 'Select a language',
  }));

  // --- Menu panel: the careers section links (hidden until Menu is opened) ---
  const panel = document.createElement('div');
  panel.className = 'nav-menu-panel';
  panel.id = 'nav-menu-panel';
  panel.setAttribute('hidden', '');
  if (sectionsGroup) panel.append(sectionsGroup);

  // assemble bar
  nav.textContent = '';
  nav.append(left, brand, right);

  const openMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuToggle.querySelector('.nav-bar-icon').innerHTML = open ? ICONS.close : ICONS.menu;
    if (open) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
    document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  };
  menuToggle.addEventListener('click', () => {
    openMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      openMenu(false);
      menuToggle.focus();
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav, panel);
  block.append(navWrapper);
}

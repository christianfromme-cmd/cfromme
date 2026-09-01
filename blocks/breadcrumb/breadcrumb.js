/*
 * breadcrumb — RWE top breadcrumb trail.
 * Auto-blocked (see scripts.js buildBreadcrumbAutoBlock) from the page path, not
 * authored per-page — mirroring the live "RWE › RWE Careers › Why work here"
 * trail that the source site renders as global chrome. The final crumb is the
 * current page (the page's <h1>, or a title-cased path segment) and is not a
 * link.
 */

const HOME_LABEL = 'RWE';

// Known path-segment → display-label overrides. Segments not listed here are
// title-cased from their slug (e.g. "why-work-here" → "Why work here").
const LABELS = {
  en: 'RWE',
  'rwe-careers-portal': 'RWE Careers',
  'karriere-bei-rwe': 'RWE Karriere',
};

/** Title-cases a URL slug: "early-careers" → "Early careers". */
function labelFromSlug(slug) {
  const text = decodeURIComponent(slug).replace(/-/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * loads and decorates the block
 * @param {Element} block The breadcrumb block element
 */
export default function decorate(block) {
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);
  if (!segments.length) {
    block.remove();
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb-nav';
  nav.setAttribute('aria-label', 'Breadcrumb');
  const list = document.createElement('ol');
  list.className = 'breadcrumb-list';

  // Home crumb.
  const crumbs = [{ label: HOME_LABEL, href: `/${segments[0]}/` }];

  // Intermediate + current crumbs from the remaining path segments.
  let href = `/${segments[0]}`;
  for (let i = 1; i < segments.length; i += 1) {
    href += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    let label = LABELS[segments[i]] || labelFromSlug(segments[i]);
    // The current page prefers its own <h1> text for an accurate label.
    if (isLast) {
      const h1 = document.querySelector('main h1');
      if (h1 && h1.textContent.trim()) label = h1.textContent.trim();
    }
    crumbs.push({ label, href: isLast ? null : `${href}/` });
  }

  crumbs.forEach((crumb, idx) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item';
    if (crumb.href && idx < crumbs.length - 1) {
      const a = document.createElement('a');
      a.href = crumb.href;
      a.textContent = crumb.label;
      li.append(a);
    } else {
      li.setAttribute('aria-current', 'page');
      li.textContent = crumb.label;
    }
    list.append(li);
  });

  nav.append(list);
  block.replaceChildren(nav);
}

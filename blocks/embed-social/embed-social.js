/*
 * Embed Social (placeholder)
 * -----------------------------------------------------------------------------
 * The original "RWE @ Social Media" area on rwe.com is a consent-gated social
 * media feed (Flockler) that only renders after the visitor activates "comfort
 * cookies". That third-party integration has no UI Kit source and is not being
 * rebuilt here. This block renders a tasteful, centered intro (heading + copy)
 * with a subtle bordered/tinted panel indicating where the live feed would
 * appear once the consent-management integration is wired up.
 */

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // The authored structure is a single cell containing a heading and copy.
  const cell = block.querySelector(':scope > div > div') || block;

  const intro = document.createElement('div');
  intro.className = 'embed-social-intro';
  // Move the authored heading + copy into the intro wrapper.
  intro.append(...cell.childNodes);

  // Placeholder panel standing in for the consent-gated live feed.
  const panel = document.createElement('div');
  panel.className = 'embed-social-panel';
  panel.setAttribute('role', 'note');
  panel.setAttribute('aria-label', 'Social media feed placeholder');

  const icon = document.createElement('span');
  icon.className = 'embed-social-panel-icon';
  icon.setAttribute('aria-hidden', 'true');

  const note = document.createElement('p');
  note.className = 'embed-social-panel-note';
  note.textContent = 'Our latest social posts appear here once you accept comfort cookies.';

  panel.append(icon, note);

  block.textContent = '';
  block.append(intro, panel);
}

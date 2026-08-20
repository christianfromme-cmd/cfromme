import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'gallery-card-image';
      } else if (div.children.length === 0) {
        /* empty image cell (cards without a picture) — drop it */
        div.remove();
      } else {
        div.className = 'gallery-card-body';
        /* demote authored country-name <h2> to <h3>: these cards sit under the
           section's "Global impact" <h2>, so h3 keeps a valid heading outline */
        div.querySelectorAll('h2').forEach((h2) => {
          const h3 = document.createElement('h3');
          h3.className = h2.className;
          while (h2.firstChild) h3.append(h2.firstChild);
          h2.replaceWith(h3);
        });
        /* Undo EDS button auto-decoration and tag links as RWE text links.
           Live site: "About …" links are bold blue (#00b1eb), "Careers …"
           links are teal (#00a19f) with a trailing arrow. Detect by text so
           the careers-only cards (India, Indonesia, Singapore) style correctly. */
        div.querySelectorAll('a').forEach((a) => {
          a.classList.remove('button', 'primary', 'secondary', 'accent');
          const wrapper = a.closest('.button-container, .button-wrapper');
          if (wrapper) wrapper.classList.remove('button-container', 'button-wrapper');
          const isCareers = /careers/i.test((a.textContent || '').trim());
          a.classList.add(isCareers ? 'gallery-link-careers' : 'gallery-link-about');
        });
      }
    });
    /* flag cards that have no image so CSS can render them gracefully */
    if (!li.querySelector('.gallery-card-image')) li.classList.add('gallery-card-no-image');
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}

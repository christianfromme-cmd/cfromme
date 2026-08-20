import { createOptimizedPicture } from '../../scripts/aem.js';

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
  block.textContent = '';
  block.append(ul);
}

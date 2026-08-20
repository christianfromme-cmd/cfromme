export default function decorate(block) {
  const rows = [...block.children];
  block.classList.add(`columns-pullquote-${rows[0]?.children.length || 0}-cols`);

  rows.forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        // cell that holds the portrait + attribution (name / role)
        col.classList.add('columns-pullquote-portrait');
        const img = pic.querySelector('img');
        if (img) {
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
        }
      } else {
        // cell that holds the heading + quotation
        col.classList.add('columns-pullquote-quote');
      }
    });
  });
}

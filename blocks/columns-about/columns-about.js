export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-about-${cols.length}-cols`);

  // two-tone headline: the source colours the first line (before the <br>)
  // in the petrol/teal accent and the remainder in brand blue.
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const br = heading.querySelector('br');
    if (br && heading.firstChild && heading.firstChild !== br) {
      const span = document.createElement('span');
      span.className = 'columns-about-highlight';
      while (heading.firstChild && heading.firstChild !== br) {
        span.appendChild(heading.firstChild);
      }
      heading.insertBefore(span, br);
    }
  }

  // classify columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-about-img-col');
        }
      } else if (!col.querySelector('h1, h2, h3, h4, h5, h6')) {
        // no picture and no heading -> media / video placeholder column
        col.classList.add('columns-about-video-col');
      }
    });
  });
}

/**
 * columns-about — "From here, we can keep the world moving – forward."
 * Live layout: headline full-width on top, then a two-column row with the
 * intro text on the left and the career video on the right.
 *
 * In the authored content the three intro paragraphs are section default
 * content placed *before* this block, while the block itself holds only the
 * headline + video. To reproduce the live order we lift the headline to a
 * full-width top row and pull the preceding intro paragraphs into the left
 * column beside the video.
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];

  // Identify the headline cell and the video/media cell.
  let headingCell = null;
  let videoCell = null;
  cells.forEach((cell) => {
    if (cell.querySelector('h1, h2, h3, h4, h5, h6')) headingCell = cell;
    else videoCell = cell;
  });

  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  // Two-tone headline: the source colours the first line (before the <br>)
  // in the petrol/teal accent and the remainder in brand blue.
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

  // Pull the preceding intro paragraphs (section default content) into the
  // left text column. They live in the .default-content-wrapper that precedes
  // this block's wrapper in the same section.
  const textContent = document.createElement('div');
  textContent.className = 'columns-about-text';
  const wrapper = block.closest('.columns-about-wrapper') || block.parentElement;
  let prev = wrapper ? wrapper.previousElementSibling : null;
  while (prev && !prev.classList.contains('default-content-wrapper')) {
    prev = prev.previousElementSibling;
  }
  if (prev) {
    while (prev.firstChild) textContent.append(prev.firstChild);
    prev.remove();
  }

  // Video / media column.
  if (videoCell) videoCell.classList.add('columns-about-video-col');

  // Rebuild the block: heading (full width) then [text | video].
  block.textContent = '';

  if (headingCell) {
    headingCell.classList.add('columns-about-heading');
    block.append(headingCell);
  }

  const columns = document.createElement('div');
  columns.className = 'columns-about-columns';
  if (textContent.childNodes.length) columns.append(textContent);
  if (videoCell) columns.append(videoCell);
  block.append(columns);
}

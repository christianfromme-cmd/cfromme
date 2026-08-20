/**
 * columns-promo — full-bleed promo teaser.
 * Left: background media (autoplay video or image). Right: gradient text panel
 * with heading, copy and CTA. Mirrors the RWE tea01r--image-left teaser.
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];

  cells.forEach((cell) => {
    // Media cell: a link/anchor pointing at a video, or a picture.
    const videoLink = cell.querySelector('a[href$=".webm"], a[href$=".mp4"]');
    const picture = cell.querySelector('picture');

    if (videoLink) {
      cell.classList.add('columns-promo-media');
      const video = document.createElement('video');
      video.className = 'columns-promo-video';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      const source = document.createElement('source');
      source.src = videoLink.getAttribute('href');
      source.type = videoLink.getAttribute('href').endsWith('.mp4') ? 'video/mp4' : 'video/webm';
      video.append(source);
      // replace the placeholder <p><a></a></p> markup with the video
      cell.textContent = '';
      cell.append(video);
      // Kick off playback (autoplay attribute can be ignored until in DOM).
      video.play?.().catch(() => {});
    } else if (picture) {
      cell.classList.add('columns-promo-media');
    } else {
      cell.classList.add('columns-promo-body');
    }
  });
}

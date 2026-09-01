/**
 * columns-promo — full-bleed promo teaser.
 * Left: background media (autoplay video or image). Right: gradient text panel
 * with heading, copy and CTA. Mirrors the RWE tea01r--image-left teaser.
 * @param {Element} block
 */
// RWE media is authored as root-relative paths (/-/media/...) that only resolve
// on www.rwe.com; rewrite to absolute so the video loads from our host.
const RWE_ORIGIN = 'https://www.rwe.com';
// Still shown behind the promo video as a poster/fallback, so a branded image
// remains if cross-origin video playback is blocked.
const PROMO_POSTER = 'https://www.rwe.com/-/media/RWE/karriere-bei-rwe/home/TIC01-vorschaubild-karriere-video.jpg';

const absolutize = (url) => (url && url.startsWith('/-/media/') ? RWE_ORIGIN + url : url);

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];

  cells.forEach((cell) => {
    // Media cell: a link/anchor pointing at a video, or a picture.
    const videoLink = cell.querySelector('a[href*=".webm"], a[href*=".mp4"], a[href*=".ashx"]');
    const picture = cell.querySelector('picture');

    if (videoLink) {
      cell.classList.add('columns-promo-media');
      const href = absolutize(videoLink.getAttribute('href'));

      // Poster/fallback still behind the video.
      const fallback = document.createElement('img');
      fallback.className = 'columns-promo-media-fallback';
      fallback.src = PROMO_POSTER;
      fallback.alt = '';
      fallback.loading = 'lazy';

      const video = document.createElement('video');
      video.className = 'columns-promo-video';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('poster', PROMO_POSTER);

      // Offer both webm + mp4 (matching live) for cross-browser playback. The
      // authored link is usually the webm; derive its mp4 companion from RWE's
      // naming convention (…-webm.webm -> ….mp4) when only one is present.
      const sources = [];
      if (href.endsWith('.webm')) {
        sources.push({ src: href, type: 'video/webm' });
        sources.push({ src: href.replace(/-webm\.webm$/, '.mp4').replace(/\.webm$/, '.mp4'), type: 'video/mp4' });
      } else if (href.endsWith('.mp4')) {
        sources.push({ src: href, type: 'video/mp4' });
      } else {
        sources.push({ src: href, type: 'video/mp4' });
      }
      const seen = new Set();
      sources.forEach(({ src, type }) => {
        if (seen.has(src)) return;
        seen.add(src);
        const source = document.createElement('source');
        source.src = src;
        source.type = type;
        video.append(source);
      });

      // replace the placeholder <p><a></a></p> markup with the fallback + video
      cell.textContent = '';
      cell.append(fallback, video);
      // Kick off playback (autoplay attribute can be ignored until in DOM).
      video.play?.().catch(() => {});
    } else if (picture) {
      cell.classList.add('columns-promo-media');
    } else {
      cell.classList.add('columns-promo-body');
    }
  });
}

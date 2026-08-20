/**
 * hero-stage — full-width rotating stage carousel.
 * Each authored row becomes a slide (headline, subheading, one CTA).
 * @param {Element} block
 */
// RWE media is authored as root-relative paths (/-/media/...) that only resolve
// on www.rwe.com; rewrite them to absolute so they load from our host.
const RWE_ORIGIN = 'https://www.rwe.com';
// Hero background video (careers stage). The authored .ashx has extra mp4/webm
// variants and a poster still, kept here so the stage shows branded media even
// if cross-origin video playback is blocked.
const HERO_VIDEO_SOURCES = [
  { src: 'https://www.rwe.com/-/media/D964E9814ED241FC9E590FC022207052.ashx', type: 'video/mp4' },
];
const HERO_POSTER = 'https://www.rwe.com/-/media/RWE/karriere-bei-rwe/home/TIC01-vorschaubild-karriere-video.jpg';

const absolutize = (url) => {
  if (!url) return url;
  if (url.startsWith('/-/media/')) return RWE_ORIGIN + url;
  return url;
};

/* Build the stage background: a muted, looping, autoplaying video with a poster
   image behind it. If the browser can't play the (cross-origin) video, the
   poster image remains visible; the CSS gradient sits behind that as a final
   fallback. Decorative — hidden from assistive tech. */
function buildHeroMedia(videoHref) {
  const media = document.createElement('div');
  media.className = 'hero-stage-media';
  media.setAttribute('aria-hidden', 'true');

  const img = document.createElement('img');
  img.className = 'hero-stage-media-fallback';
  img.src = HERO_POSTER;
  img.alt = '';
  img.loading = 'eager';
  media.append(img);

  const video = document.createElement('video');
  video.className = 'hero-stage-video';
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('poster', HERO_POSTER);
  const sources = videoHref
    ? [{ src: absolutize(videoHref), type: 'video/mp4' }, ...HERO_VIDEO_SOURCES]
    : HERO_VIDEO_SOURCES;
  const seen = new Set();
  sources.forEach(({ src, type }) => {
    if (seen.has(src)) return;
    seen.add(src);
    const source = document.createElement('source');
    source.src = src;
    source.type = type;
    video.append(source);
  });
  media.append(video);
  video.play?.().catch(() => {});
  return media;
}

export default function decorate(block) {
  const slides = [...block.children];

  // Clean up + tag each slide.
  slides.forEach((slide, slideIdx) => {
    slide.classList.add('hero-stage-slide');
    const inner = slide.firstElementChild || slide;
    inner.classList.add('hero-stage-content');

    // Pull out any authored background-media link (/-/media/*.ashx video ref).
    // The first slide's video becomes the stage background; the empty <a>/<p>
    // wrappers are then removed.
    inner.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const isMedia = /\/-\/media\/.*(\.ashx|\.mp4|\.webm)/i.test(href);
      if (isMedia && !a.textContent.trim()) {
        if (!block.querySelector('.hero-stage-media')) {
          block.prepend(buildHeroMedia(href));
        }
        const p = a.closest('p');
        a.remove();
        if (p && !p.textContent.trim() && !p.children.length) p.remove();
        return;
      }
      if (!a.textContent.trim() && !a.querySelector('picture, img')) {
        const p = a.closest('p');
        a.remove();
        if (p && !p.textContent.trim() && !p.children.length) p.remove();
      }
    });

    // Only the first slide keeps <h1> (one H1 per page). Demote later slides'
    // headline to <h2> — visually identical (styled via .hero-stage-headline),
    // but preserves a valid heading hierarchy across the rotating slides.
    let headline = inner.querySelector('h1');
    if (headline) {
      headline.classList.add('hero-stage-headline');
      if (slideIdx > 0) {
        const h2 = document.createElement('h2');
        h2.className = headline.className;
        while (headline.firstChild) h2.append(headline.firstChild);
        headline.replaceWith(h2);
        headline = h2;
      }
    }

    // Two-tone headline: the lead phrase (up to the first comma) is accented
    // and set on its own line, matching the source stage design.
    if (headline && headline.childNodes.length === 1
      && headline.firstChild.nodeType === Node.TEXT_NODE) {
      const text = headline.textContent;
      const commaIdx = text.indexOf(',');
      if (commaIdx > 0 && commaIdx < text.length - 1) {
        const lead = document.createElement('span');
        lead.className = 'hero-stage-headline-accent';
        lead.textContent = text.slice(0, commaIdx + 1);
        headline.textContent = '';
        headline.append(lead, ` ${text.slice(commaIdx + 1).trim()}`);
      }
    }

    // The last standalone link is the CTA.
    const cta = [...inner.querySelectorAll('a')].pop();
    if (cta) {
      cta.classList.add('hero-stage-cta');
      const p = cta.closest('p');
      if (p) p.classList.add('hero-stage-cta-wrapper');
    }
  });

  const total = slides.length;
  if (total <= 1) return;

  // Dots.
  const dotsNav = document.createElement('div');
  dotsNav.className = 'hero-stage-dots';
  dotsNav.setAttribute('role', 'tablist');
  const dots = slides.map((s, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-stage-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show slide ${idx + 1} of ${total}`);
    dotsNav.append(dot);
    return dot;
  });

  // Navigation arrows.
  const prev = document.createElement('button');
  prev.className = 'hero-stage-arrow hero-stage-prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous slide');

  const next = document.createElement('button');
  next.className = 'hero-stage-arrow hero-stage-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next slide');

  // Autoplay.
  let current = 0;
  let timer;

  const goTo = (i) => {
    current = (i + total) % total;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === current);
      d.setAttribute('aria-selected', idx === current ? 'true' : 'false');
    });
  };

  const startAutoplay = () => { timer = setInterval(() => goTo(current + 1), 7000); };
  const resetAutoplay = () => { clearInterval(timer); startAutoplay(); };

  dots.forEach((dot, idx) => dot.addEventListener('click', () => { goTo(idx); resetAutoplay(); }));
  prev.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
  next.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

  block.append(prev, next, dotsNav);

  goTo(0);
  startAutoplay();

  block.addEventListener('mouseenter', () => clearInterval(timer));
  block.addEventListener('mouseleave', startAutoplay);
}

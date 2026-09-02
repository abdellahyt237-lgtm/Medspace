/* MedSpace Medical Visual Asset System
 * One source of truth for specialty/course visuals, with context-aware frames.
 */
(() => {
  const cache = new Map();
  const fallback = '/static/assets/ui/image-fallback.svg';

  const contexts = {
    specialty_card: { className: 'image-frame image-frame--specialty-card', loading: 'lazy' },
    specialty_hero: { className: 'image-frame image-frame--specialty-hero', loading: 'eager' },
    course_card: { className: 'image-frame image-frame--course-card', loading: 'lazy' },
    course_hero: { className: 'image-frame image-frame--course-hero', loading: 'eager' },
    reader_cover: { className: 'image-frame image-frame--reader-cover', loading: 'eager' }
  };

  function visualForLesson(lesson) {
    return {
      src: lesson?.image || lesson?.specialty_image || fallback,
      alt: lesson?.image_alt || lesson?.title || lesson?.module || 'MedSpace visual',
      accent: lesson?.accent || '#61E1D0',
      specialtyId: lesson?.specialty_id || ''
    };
  }

  function visualForSpecialty(module) {
    return {
      src: module?.image || fallback,
      alt: module?.alt || module?.name || 'MedSpace specialty',
      accent: module?.accent || '#61E1D0',
      specialtyId: module?.id || ''
    };
  }

  function frame(context, visual, options = {}) {
    const cfg = contexts[context] || contexts.course_card;
    const wrap = document.createElement('div');
    wrap.className = cfg.className;
    wrap.dataset.imageContext = context;
    wrap.style.setProperty('--image-accent', visual.accent);
    const img = document.createElement('img');
    img.src = visual.src;
    img.alt = visual.alt;
    img.loading = options.loading || cfg.loading;
    img.decoding = 'async';
    img.addEventListener('error', () => {
      if (img.src.endsWith(fallback)) return;
      img.src = fallback;
      wrap.classList.add('is-fallback');
    });
    wrap.appendChild(img);
    if (options.overlay !== false) {
      const sheen = document.createElement('span');
      sheen.className = 'image-frame__sheen';
      wrap.appendChild(sheen);
    }
    return wrap;
  }

  function preload(src) {
    if (!src || cache.has(src)) return;
    const img = new Image();
    img.src = src;
    cache.set(src, img);
  }

  function applyPagePalette(accent, root = document.documentElement) {
    if (!accent) return;
    root.style.setProperty('--visual-accent', accent);
    root.style.setProperty('--visual-soft', `color-mix(in srgb, ${accent} 10%, transparent)`);
    root.style.setProperty('--visual-line', `color-mix(in srgb, ${accent} 24%, var(--line))`);
  }

  window.MedSpaceImages = { contexts, visualForLesson, visualForSpecialty, frame, preload, applyPagePalette };
})();

(async function () {
  'use strict';

  const carousel = document.querySelector('[data-hero-carousel]');
  const track = document.querySelector('[data-hero-track]');
  const prevButton = document.querySelector('[data-hero-prev]');
  const nextButton = document.querySelector('[data-hero-next]');
  const dots = document.querySelector('[data-hero-dots]');
  const caption = document.querySelector('[data-hero-caption]');

  if (!carousel || !track) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (window.RaykelsSiteReady) {
    await window.RaykelsSiteReady;
  }

  const siteHomepage = window.RaykelsSite?.homepage || {};

  if (siteHomepage.heroEnabled === false) {
    carousel.hidden = true;
    return;
  }

  const rotationSeconds = Number(siteHomepage.rotationSeconds);

  const ROTATION_MS =
    Number.isFinite(rotationSeconds) && rotationSeconds > 0
      ? rotationSeconds * 1000
      : 6000;

  const autoRotate = siteHomepage.autoRotate !== false;

  let mediaItems = [];
  let currentIndex = 0;
  let timer = null;
  let paused = false;
  let touchStartX = 0;
  let touchStartY = 0;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getProductMedia(product) {
    const media = [];

    const images = Array.isArray(product?.images)
      ? product.images
      : [];

    const videos = Array.isArray(product?.videos)
      ? product.videos
      : [];

    images.forEach((item, index) => {
      const url = typeof item === 'string'
        ? item
        : item?.url;

      if (!url) return;

      media.push({
        id: item?.id || `${product.id}-image-${index}`,
        type: 'image',
        url,
        title: item?.title || product?.name || 'RAYKELS',
        alt: item?.alt || product?.name || 'RAYKELS product',
        productId: product.id,
        productName: product.name,
        category: product.category
      });
    });

    videos.forEach((item, index) => {
      const url = typeof item === 'string'
        ? item
        : item?.url;

      if (!url) return;

      media.push({
        id: item?.id || `${product.id}-video-${index}`,
        type: 'video',
        url,
        poster: item?.poster || item?.thumbnail || '',
        title: item?.title || product?.name || 'RAYKELS',
        productId: product.id,
        productName: product.name,
        category: product.category
      });
    });

    return media;
  }

  function buildMediaPool(products) {
    const pool = [];

    products.forEach(product => {
      if (!product || product.published === false) return;

      getProductMedia(product).forEach(media => {
        pool.push(media);
      });
    });

    return pool;
  }

  function createSlide(media, index) {
    const isActive = index === currentIndex;

    if (media.type === 'video') {
      const poster = media.poster
        ? ` poster="${escapeHtml(media.poster)}"`
        : '';

      return `
        <article
          class="hero-catalogue-slide${isActive ? ' active' : ''}"
          data-hero-slide="${index}"
          aria-hidden="${isActive ? 'false' : 'true'}"
        >
          <video
            class="hero-catalogue-media-element"
            data-hero-video
            src="${escapeHtml(media.url)}"
            ${poster}
            muted
            playsinline
            loop
            preload="${isActive ? 'auto' : 'metadata'}"
            aria-label="${escapeHtml(media.title)}"
          ></video>
        </article>
      `;
    }

    return `
      <article
        class="hero-catalogue-slide${isActive ? ' active' : ''}"
        data-hero-slide="${index}"
        aria-hidden="${isActive ? 'false' : 'true'}"
      >
        <img
          class="hero-catalogue-media-element"
          src="${escapeHtml(media.url)}"
          alt="${escapeHtml(media.alt)}"
          loading="${isActive ? 'eager' : 'lazy'}"
          decoding="async"
        >
      </article>
    `;
  }

  function render() {
    if (!mediaItems.length) {
      track.innerHTML = `
        <div class="hero-catalogue-loading">
          <span>RAYKELS COLLECTION</span>
        </div>
      `;

      if (caption) caption.textContent = '';
      if (dots) dots.innerHTML = '';
      return;
    }

    track.innerHTML = mediaItems
      .map(createSlide)
      .join('');

    renderDots();
    update();
  }

  function renderDots() {
    if (!dots) return;

    dots.innerHTML = mediaItems
      .map((media, index) => `
        <button
          type="button"
          class="hero-catalogue-dot${index === currentIndex ? ' active' : ''}"
          data-hero-dot="${index}"
          aria-label="Show ${escapeHtml(media.productName || 'Raykels media')}"
          aria-current="${index === currentIndex ? 'true' : 'false'}"
        ></button>
      `)
      .join('');

    dots.querySelectorAll('[data-hero-dot]').forEach(button => {
      button.addEventListener('click', () => {
        goTo(Number(button.dataset.heroDot));
        restartAutoPlay();
      });
    });
  }

  function updateCaption() {
    if (!caption || !mediaItems[currentIndex]) return;

    const media = mediaItems[currentIndex];

    caption.innerHTML = `
      <span class="hero-catalogue-caption-category">
        ${escapeHtml(media.category || 'RAYKELS COLLECTION')}
      </span>
      <strong>${escapeHtml(media.productName || 'Luxury Collection')}</strong>
    `;
  }

  function update() {
    const slides = track.querySelectorAll('[data-hero-slide]');

    slides.forEach((slide, index) => {
      const active = index === currentIndex;

      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    if (dots) {
      dots.querySelectorAll('[data-hero-dot]').forEach((dot, index) => {
        const active = index === currentIndex;

        dot.classList.toggle('active', active);
        dot.setAttribute(
          'aria-current',
          active ? 'true' : 'false'
        );
      });
    }

    updateCaption();
    controlVideoPlayback();
  }

  function controlVideoPlayback() {
    const videos = track.querySelectorAll('[data-hero-video]');

    videos.forEach((video, index) => {
      if (index === currentIndex && !paused && !prefersReducedMotion) {
        video.play().catch(() => {});
      } else {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (_) {}
      }
    });
  }

  function goTo(index) {
    if (!mediaItems.length) return;

    currentIndex =
      (index + mediaItems.length) % mediaItems.length;

    update();
  }

  function startAutoPlay() {
    if (
      prefersReducedMotion ||
      !autoRotate ||
      mediaItems.length <= 1 ||
      paused
    ) {
      return;
    }

    stopAutoPlay();

    timer = setInterval(() => {
      goTo(currentIndex + 1);
    }, ROTATION_MS);
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  function pause() {
    paused = true;
    stopAutoPlay();
    controlVideoPlayback();
  }

  function resume() {
    paused = false;
    controlVideoPlayback();
    startAutoPlay();
  }

  function handleVisibility() {
    if (document.hidden) {
      pause();
    } else {
      resume();
    }
  }

  function setupTouch() {
    carousel.addEventListener(
      'touchstart',
      event => {
        const touch = event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        stopAutoPlay();
      },
      { passive: true }
    );

    carousel.addEventListener(
      'touchend',
      event => {
        const touch = event.changedTouches[0];

        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (
          Math.abs(deltaX) > 50 &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {
          if (deltaX < 0) {
            goTo(currentIndex + 1);
          } else {
            goTo(currentIndex - 1);
          }
        }

        restartAutoPlay();
      },
      { passive: true }
    );
  }

  async function init() {
    try {
      if (!window.RaykelsCatalogAPI?.loadCatalog) {
        throw new Error(
          'Raykels catalog API is not available.'
        );
      }

      const catalog =
        await window.RaykelsCatalogAPI.loadCatalog();

      mediaItems = buildMediaPool(catalog);

      render();
      startAutoPlay();
      setupTouch();

      // Let the opening brand message introduce the experience,
      // then give the catalogue media visual priority.
      const heroContent = document.querySelector('.hero-catalogue .hero-content');

      if (heroContent && mediaItems.length > 1 && !prefersReducedMotion) {
        window.setTimeout(() => {
          heroContent.classList.add('hero-message-faded');
        }, 3000);
      }
    } catch (error) {
      console.error(
        'Raykels hero catalogue failed:',
        error
      );

      track.innerHTML = `
        <div class="hero-catalogue-loading">
          <span>RAYKELS COLLECTION</span>
        </div>
      `;
    }
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      goTo(currentIndex - 1);
      restartAutoPlay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      goTo(currentIndex + 1);
      restartAutoPlay();
    });
  }

  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', resume);

  carousel.addEventListener('focusin', pause);
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) {
      resume();
    }
  });

  document.addEventListener(
    'visibilitychange',
    handleVisibility
  );

  init();
})();

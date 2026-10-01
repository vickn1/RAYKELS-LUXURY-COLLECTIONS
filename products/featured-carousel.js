(function () {
  'use strict';

  const carousel = document.querySelector('[data-product-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-carousel-track]');
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const dots = document.querySelector('[data-carousel-dots]');

  let products = [];
  let currentIndex = 0;
  let gridPage = 0;
  let timer = null;

  let featuredSettings = {
    enabled: true,
    autoRotate: true,
    rotationSeconds: 5,
    displayMode: 'carousel'
  };

  function getFeaturedRotationMs() {
    const seconds = Number(
      featuredSettings.rotationSeconds
    );

    return Number.isFinite(seconds) && seconds > 0
      ? seconds * 1000
      : 5000;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getMedia(product) {
    return window.RaykelsCatalogAPI?.getProductMedia
      ? window.RaykelsCatalogAPI.getProductMedia(product)
      : [];
  }

  function createMedia(media, product) {
    if (!media) {
      return '<div class="product-carousel-placeholder">RAYKELS</div>';
    }

    if (media.type === 'video') {
      const poster = media.poster
        ? ` poster="${escapeHtml(media.poster)}"`
        : '';

      return `
        <video
          class="product-carousel-media"
          src="${escapeHtml(media.url)}"
          ${poster}
          muted
          loop
          playsinline
          controls
          preload="metadata"
          aria-label="${escapeHtml(
            media.title ||
            product.name ||
            'Product video'
          )}"
        ></video>
      `;
    }

    return `
      <img
        class="product-carousel-media"
        src="${escapeHtml(media.url)}"
        alt="${escapeHtml(
          media.alt ||
          product.name ||
          'Product image'
        )}"
        loading="lazy"
      >
    `;
  }

  function getGridPageSize() {
    if (window.innerWidth <= 600) return 2;
    if (window.innerWidth <= 900) return 4;
    return 6;
  }

  function getVisibleProducts() {
    if (featuredSettings.displayMode !== 'grid') {
      return products;
    }

    const pageSize = getGridPageSize();
    const totalPages = Math.max(
      1,
      Math.ceil(products.length / pageSize)
    );

    gridPage = gridPage % totalPages;

    const start = gridPage * pageSize;

    return products.slice(
      start,
      start + pageSize
    );
  }

  function render() {
    if (!products.length) {
      track.innerHTML = `
        <div class="product-carousel-empty">
          <p>Our latest pieces will appear here soon.</p>
        </div>
      `;

      prevButton.hidden = true;
      nextButton.hidden = true;
      dots.innerHTML = '';

      return;
    }

    const isGrid = featuredSettings.displayMode === 'grid';

    carousel.classList.toggle(
      'is-grid',
      isGrid
    );

    track.classList.toggle(
      'is-grid',
      isGrid
    );

    prevButton.hidden = isGrid;
    nextButton.hidden = isGrid;
    dots.hidden = isGrid;

    const visibleProducts = getVisibleProducts();

    track.innerHTML = visibleProducts.map((product, index) => {
      const media = getMedia(product)[0];

      const price =
        window.RaykelsCatalogAPI?.getEffectivePrice
          ? window.RaykelsCatalogAPI.getEffectivePrice(product)
          : null;

      const formattedPrice =
        window.RaykelsCatalogAPI?.formatPrice &&
        price !== null
          ? window.RaykelsCatalogAPI.formatPrice(price)
          : '';

      return `
        <article
          class="product-carousel-slide${
            index === currentIndex ? ' active' : ''
          }"
          data-slide="${index}"
        >
          <a
            class="product-carousel-product"
            href="product.html?id=${encodeURIComponent(
              product.id
            )}"
            aria-label="View ${escapeHtml(
              product.name || 'product'
            )}"
          >
            <div class="product-carousel-media-wrap">
              ${createMedia(media, product)}
            </div>

            <div class="product-carousel-info">
              <p class="product-carousel-category">
                ${escapeHtml(product.category || '')}
              </p>

              <h3>
                ${escapeHtml(
                  product.name || 'RAYKELS Product'
                )}
              </h3>

              ${
                formattedPrice
                  ? `<strong>${escapeHtml(
                      formattedPrice
                    )}</strong>`
                  : ''
              }
            </div>
          </a>
        </article>
      `;
    }).join('');

    renderDots();

    if (featuredSettings.displayMode === 'grid') {
      track.style.transform = '';

      track.querySelectorAll('.product-carousel-slide')
        .forEach(slide => {
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        });
    } else {
      updatePosition();
    }

    setupVideos();
  }

  function renderDots() {
    dots.innerHTML = products.map((product, index) => `
      <button
        type="button"
        class="product-carousel-dot${
          index === currentIndex ? ' active' : ''
        }"
        data-carousel-dot="${index}"
        aria-label="Show ${
          escapeHtml(product.name || `product ${index + 1}`)
        }"
        aria-current="${
          index === currentIndex ? 'true' : 'false'
        }"
      ></button>
    `).join('');

    dots
      .querySelectorAll('[data-carousel-dot]')
      .forEach(button => {
        button.addEventListener('click', () => {
          goTo(Number(button.dataset.carouselDot));
          restartAutoPlay();
        });
      });
  }

  function updatePosition() {
    if (featuredSettings.displayMode === 'grid') {
      return;
    }

    const slides =
      track.querySelectorAll('.product-carousel-slide');

    slides.forEach((slide, index) => {
      const active = index === currentIndex;

      slide.classList.toggle('active', active);

      slide.setAttribute(
        'aria-hidden',
        active ? 'false' : 'true'
      );
    });

    dots
      .querySelectorAll('[data-carousel-dot]')
      .forEach((dot, index) => {
        const active = index === currentIndex;

        dot.classList.toggle('active', active);

        dot.setAttribute(
          'aria-current',
          active ? 'true' : 'false'
        );
      });

    track.style.transform =
      `translateX(-${currentIndex * 100}%)`;

    prevButton.disabled = products.length <= 1;
    nextButton.disabled = products.length <= 1;
  }

  function goTo(index) {
    if (!products.length) return;

    currentIndex =
      (index + products.length) % products.length;

    updatePosition();
  }

  function setupVideos() {
    track.querySelectorAll('video').forEach(video => {
      video.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });

      video.addEventListener('mouseleave', () => {
        video.pause();
      });
    });
  }

  function startAutoPlay() {
    if (!featuredSettings.autoRotate) return;
    if (products.length <= 1) return;

    stopAutoPlay();

    timer = setInterval(() => {
      if (featuredSettings.displayMode === 'grid') {
        const pageSize = getGridPageSize();
        const totalPages = Math.max(
          1,
          Math.ceil(products.length / pageSize)
        );

        if (totalPages <= 1) return;

        gridPage = (gridPage + 1) % totalPages;
        render();
        return;
      }

      goTo(currentIndex + 1);
    }, getFeaturedRotationMs());
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restartAutoPlay() {
    startAutoPlay();
  }

  async function init() {
    try {
      if (window.RaykelsSiteReady) {
        await window.RaykelsSiteReady;
      }

      const homepage =
        window.RaykelsSite?.homepage || {};

      const settings =
        homepage.featuredProducts || {};

      featuredSettings = {
        enabled: settings.enabled !== false,
        autoRotate: settings.autoRotate !== false,
        rotationSeconds:
          Number(settings.rotationSeconds) > 0
            ? Number(settings.rotationSeconds)
            : 5,
        displayMode:
          settings.displayMode === 'grid'
            ? 'grid'
            : 'carousel'
      };

      if (!featuredSettings.enabled) {
        carousel.hidden = true;
        return;
      }

      if (!window.RaykelsCatalogAPI?.loadCatalog) {
        throw new Error(
          'Raykels catalog API is not available.'
        );
      }

      const catalog =
        await window.RaykelsCatalogAPI.loadCatalog();

      products = catalog.filter(product => {
        return product &&
          product.published !== false &&
          getMedia(product).length > 0;
      });

      const featured = products.filter(
        product => product.featured === true
      );

      if (featured.length) {
        products = featured;
      }

      render();
      startAutoPlay();

      console.log(
        `Raykels Featured Pieces loaded: ${products.length} products`
      );

    } catch (error) {
      console.error(
        'Raykels Featured Pieces failed:',
        error
      );

      track.innerHTML = `
        <div class="product-carousel-empty">
          <p>
            Products could not be loaded right now.
          </p>
        </div>
      `;
    }
  }

  prevButton.addEventListener('click', () => {
    goTo(currentIndex - 1);
    restartAutoPlay();
  });

  nextButton.addEventListener('click', () => {
    goTo(currentIndex + 1);
    restartAutoPlay();
  });

  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);

  carousel.addEventListener('focusin', stopAutoPlay);
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutoPlay();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  init();
})();

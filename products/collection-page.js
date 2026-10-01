(function () {
  'use strict';

  const config = window.RaykelsCollectionConfig;

  if (!config) {
    console.error('Raykels collection configuration is missing.');
    return;
  }

  const grid = document.querySelector('[data-product-grid]');

  if (!grid) return;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getMedia(product) {
    if (window.RaykelsCatalogAPI?.getProductMedia) {
      return window.RaykelsCatalogAPI.getProductMedia(product);
    }

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
        type: 'image',
        url,
        alt: item?.alt || product?.name || 'RAYKELS product image',
        id: item?.id || `${product.id}-image-${index}`
      });
    });

    videos.forEach((item, index) => {
      const url = typeof item === 'string'
        ? item
        : item?.url;

      if (!url) return;

      media.push({
        type: 'video',
        url,
        poster: item?.poster || item?.thumbnail || '',
        title: item?.title || product?.name || 'RAYKELS product video',
        id: item?.id || `${product.id}-video-${index}`
      });
    });

    return media;
  }

  function getPrimaryMedia(product) {
    const media = getMedia(product);
    return media.length ? media[0] : null;
  }

  function createMedia(product) {
    const media = getPrimaryMedia(product);

    if (!media) {
      return `
        <div class="product-media product-media-placeholder">
          RAYKELS
        </div>
      `;
    }

    if (media.type === 'video') {
      const poster = media.poster
        ? ` poster="${escapeHtml(media.poster)}"`
        : '';

      return `
        <video
          class="product-media product-media-video"
          src="${escapeHtml(media.url)}"
          ${poster}
          muted
          loop
          playsinline
          preload="metadata"
          aria-label="${escapeHtml(
            media.title || product.name || 'Product video'
          )}"
        ></video>
      `;
    }

    return `
      <img
        class="product-media"
        src="${escapeHtml(media.url)}"
        alt="${escapeHtml(
          media.alt || product.name || 'RAYKELS product'
        )}"
        loading="lazy"
      >
    `;
  }

  function getPrice(product) {
    if (window.RaykelsCatalogAPI?.getEffectivePrice) {
      return window.RaykelsCatalogAPI.getEffectivePrice(product);
    }

    return product?.pricing?.salePrice ??
      product?.pricing?.price ??
      product?.price ??
      null;
  }

  function formatPrice(product) {
    const price = getPrice(product);

    if (
      price === null ||
      price === undefined ||
      price === ''
    ) {
      return '';
    }

    if (window.RaykelsCatalogAPI?.formatPrice) {
      return window.RaykelsCatalogAPI.formatPrice(price);
    }

    return `₦${Number(price).toLocaleString('en-NG')}`;
  }

  function render(products) {
    if (!products.length) {
      grid.innerHTML = `
        <div class="empty-catalogue">
          <h2>${escapeHtml(
            config.emptyTitle || config.title || 'Collection'
          )}</h2>
          <p>${escapeHtml(
            config.emptyMessage ||
            'Our latest collection will appear here soon.'
          )}</p>
        </div>
      `;

      return;
    }

    grid.innerHTML = products.map(product => {
      const price = formatPrice(product);

      return `
        <article class="product-card">

          <a
            href="product.html?id=${encodeURIComponent(product.id)}"
            class="product-image-link"
            aria-label="View ${escapeHtml(
              product.name || 'product'
            )}"
          >
            ${createMedia(product)}
          </a>

          <div class="product-card-content">

            <p class="product-card-category">
              ${escapeHtml(product.subcategory || '')}
            </p>

            <h2>
              ${escapeHtml(
                product.name || 'RAYKELS Product'
              )}
            </h2>

            <p>
              ${escapeHtml(product.description || '')}
            </p>

            ${
              price
                ? `<strong>${escapeHtml(price)}</strong>`
                : ''
            }

            <button
              type="button"
              class="add-to-cart"
              data-product-id="${escapeHtml(product.id)}"
            >
              Add to Cart
            </button>

          </div>

        </article>
      `;
    }).join('');

    setupVideos();
  }

  function setupVideos() {
    grid.querySelectorAll('.product-media-video')
      .forEach(video => {

        video.muted = true;
        video.playsInline = true;

        /*
         * Mobile browsers do not have mouse hover.
         * Attempt autoplay when the video enters the viewport.
         */
        const tryPlay = () => {
          video.play().catch(() => {});
        };

        const stopVideo = () => {
          video.pause();
        };

        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver(
            entries => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  tryPlay();
                } else {
                  stopVideo();
                }
              });
            },
            {
              threshold: 0.35
            }
          );

          observer.observe(video);
        } else {
          tryPlay();
        }

        /* Desktop hover support */
        video.addEventListener('mouseenter', tryPlay);
        video.addEventListener('mouseleave', stopVideo);

        /* Mobile/touch support */
        video.addEventListener('touchstart', tryPlay, {
          passive: true
        });

        video.addEventListener('click', () => {
          if (video.paused) {
            tryPlay();
          } else {
            stopVideo();
          }
        });
      });
  }

  function setupFilters(products) {
    const filterRoot = document.querySelector(
      config.filterSelector
    );

    if (!filterRoot) {
      render(products);
      return;
    }

    const knownSubcategories = [
      ...new Set(
        products
          .map(product => String(product.subcategory || '').trim())
          .filter(Boolean)
      )
    ];

    /*
     * Preserve an existing "All" control if the page has one.
     * Any old/generated variety buttons are rebuilt from the catalogue.
     */
    const allButton = filterRoot.querySelector(
      '[data-subcategory="all"]'
    );

    filterRoot.querySelectorAll(
      '[data-subcategory]:not([data-subcategory="all"])'
    ).forEach(button => button.remove());

    if (!allButton) {
      const newAll = document.createElement('button');
      newAll.type = 'button';
      newAll.className = 'active';
      newAll.dataset.subcategory = 'all';
      newAll.textContent = 'All';
      filterRoot.prepend(newAll);
    }

    const allControl = filterRoot.querySelector(
      '[data-subcategory="all"]'
    );

    knownSubcategories.forEach(subcategory => {
      const button = document.createElement('button');

      button.type = 'button';
      button.dataset.subcategory = subcategory;
      button.textContent = subcategory;

      filterRoot.appendChild(button);
    });

    const filters = filterRoot.querySelectorAll(
      '[data-subcategory]'
    );

    filters.forEach(button => {
      button.addEventListener('click', () => {
        filters.forEach(item => {
          item.classList.remove('active');
        });

        button.classList.add('active');

        const selected = button.dataset.subcategory;

        const filtered =
          selected === 'all'
            ? products
            : products.filter(product =>
                String(product.subcategory || '').trim() === selected
              );

        render(filtered);
      });
    });

    if (allControl) {
      allControl.classList.add('active');
    }
  }

  function setupCart() {
    document.addEventListener('click', event => {
      const productLink =
        event.target.closest('.product-image-link');

      if (productLink) {
        const productId =
          new URL(productLink.href, window.location.origin)
            .searchParams.get('id');

        const product =
          window.RaykelsCatalogAPI?.getProductById
            ? window.RaykelsCatalogAPI.getProductById(productId)
            : null;

        if (
          product &&
          window.RaykelsAnalytics &&
          typeof window.RaykelsAnalytics.productClick === 'function'
        ) {
          window.RaykelsAnalytics.productClick({
            productId: product.id,
            productName: product.name,
            category: product.category || ''
          });
        }

        return;
      }

      const button =
        event.target.closest('.add-to-cart');

      if (!button) return;

      const productId =
        button.dataset.productId;

      if (!productId) return;

      if (!window.RaykelsCart?.addToCart) {
        console.error(
          'Raykels cart API is unavailable.'
        );
        return;
      }

      window.RaykelsCart.addToCart(
        productId,
        1
      );

      const product =
        window.RaykelsCatalogAPI?.getProductById
          ? window.RaykelsCatalogAPI.getProductById(
              productId
            )
          : null;

      const price = product
        ? getPrice(product)
        : 0;

      if (
        typeof fbq === 'function' &&
        product
      ) {
        fbq('track', 'AddToCart', {
          content_ids: [product.id],
          content_name: product.name,
          content_type: 'product',
          value: Number(price || 0),
          currency: 'NGN'
        });
      }

      if (
        typeof gtag === 'function' &&
        product
      ) {
        gtag('event', 'add_to_cart', {
          currency: 'NGN',
          value: Number(price || 0),
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: Number(price || 0),
            quantity: 1
          }]
        });
      }

      button.textContent = 'Added ✓';

      window.setTimeout(() => {
        button.textContent = 'Add to Cart';
      }, 1500);
    });
  }

  async function init() {
    try {
      if (
        !window.RaykelsCatalogAPI?.loadCatalog
      ) {
        throw new Error(
          'Raykels catalog API is unavailable.'
        );
      }

      const catalog =
        await window.RaykelsCatalogAPI.loadCatalog();

      let products = catalog.filter(product =>
        product &&
        product.published !== false &&
        product.category === config.category &&
        getMedia(product).length > 0
      );

      if (
        config.defaultSubcategory &&
        config.defaultSubcategory !== 'all'
      ) {
        products = products.filter(product =>
          product.subcategory ===
          config.defaultSubcategory
        );
      }

      setupFilters(products);
      render(products);
      setupCart();

      console.log(
        `Raykels ${config.title || config.category} collection loaded: ${products.length} products`
      );

    } catch (error) {
      console.error(
        'Raykels collection page failed:',
        error
      );

      grid.innerHTML = `
        <div class="empty-catalogue">
          <h2>Collection unavailable</h2>
          <p>Please try again shortly.</p>
        </div>
      `;
    }
  }

  init();
})();

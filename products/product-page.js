async function loadProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    showProductError('No product was selected.');
    return;
  }

  const products =
    await window.RaykelsCatalogAPI.loadCatalog();

  const product =
    products.find(item => item.id === productId);

  if (!product) {
    showProductError('Product not found.');
    return;
  }

  document.title =
    `${product.name} | RAYKELS LUXURY COLLECTIONS`;

  const name =
    document.querySelector('[data-product-name]');

  const description =
    document.querySelector('[data-product-description]');

  const price =
    document.querySelector('[data-product-price]');

  const image =
    document.querySelector('[data-product-image]');

  const gallery =
    document.querySelector('[data-product-gallery]');

  const quantity =
    document.querySelector('[data-product-quantity]');

  const addButton =
    document.querySelector('[data-product-add]');

  const variantArea =
    document.querySelector('[data-product-variants]');

  if (name) {
    name.textContent = product.name;
  }

  if (description) {
    description.textContent =
      product.description || '';
  }

  const video =
    document.querySelector('[data-product-video]');

  const media =
    window.RaykelsCatalogAPI.getProductMedia(product);

  const mediaEmpty =
    document.querySelector('[data-product-media-empty]');

  function showMedia(mediaItem) {
    if (!mediaItem) {
      if (image) image.hidden = true;
      if (video) video.hidden = true;
      if (mediaEmpty) mediaEmpty.hidden = false;
      return;
    }

    if (mediaEmpty) {
      mediaEmpty.hidden = true;
    }

    if (mediaItem.type === 'video') {
      if (image) {
        image.hidden = true;
        image.removeAttribute('src');
      }

      if (video) {
        video.pause();
        video.hidden = false;
        video.controls = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.muted = true;
        video.innerHTML = '';

        const source = document.createElement('source');
        source.src = mediaItem.url;

        const extension = String(mediaItem.url || '')
          .split('?')[0]
          .split('.')
          .pop()
          .toLowerCase();

        const mimeTypes = {
          mp4: 'video/mp4',
          webm: 'video/webm',
          mov: 'video/quicktime'
        };

        if (mimeTypes[extension]) {
          source.type = mimeTypes[extension];
        }

        video.appendChild(source);

        if (mediaItem.poster) {
          video.poster = mediaItem.poster;
        } else {
          video.removeAttribute('poster');
        }

        const tryPlay = () => {
          video.play().catch(() => {});
        };

        video.addEventListener('loadedmetadata', tryPlay, {
          once: true
        });

        video.load();

        console.log(
          'RAYKELS VIDEO MEDIA:',
          mediaItem.url
        );
      }

      return;
    }

    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.removeAttribute('poster');
      video.load();
      video.hidden = true;
    }

    if (image) {
      image.hidden = false;
      image.src = mediaItem.url;
      image.alt = mediaItem.alt || product.name;
    }
  }

  if (media.length) {
    showMedia(media[0]);
  }

  if (gallery && media.length) {
    gallery.innerHTML = media
      .map((item, index) => {
        if (item.type === 'video') {
          return `
            <button
              type="button"
              class="product-thumbnail product-thumbnail-video ${
                index === 0 ? 'active' : ''
              }"
              data-media-index="${index}"
              aria-label="View ${item.title || `Video ${index + 1}`}">
              ${
                item.poster
                  ? `<img
                      src="${item.poster}"
                      alt="${item.title || `Video ${index + 1}`}">`
                  : `<span class="product-thumbnail-video-icon">▶</span>`
              }
              <span class="product-thumbnail-video-label">VIDEO</span>
            </button>
          `;
        }

        return `
          <button
            type="button"
            class="product-thumbnail ${
              index === 0 ? 'active' : ''
            }"
            data-media-index="${index}"
            aria-label="View ${item.alt}">
            <img
              src="${item.url}"
              alt="${item.alt}">
          </button>
        `;
      })
      .join('');

    gallery.addEventListener('click', event => {
      const thumbnail =
        event.target.closest('.product-thumbnail');

      if (!thumbnail) return;

      const index =
        Number(thumbnail.dataset.mediaIndex);

      if (!Number.isInteger(index) || !media[index]) {
        return;
      }

      showMedia(media[index]);

      gallery
        .querySelectorAll('.product-thumbnail')
        .forEach(item =>
          item.classList.remove('active')
        );

      thumbnail.classList.add('active');
    });
  }

  const variants =
    window.RaykelsCatalogAPI.getProductVariants(product);

  let selectedVariant = null;

  function updatePrice() {
    const effectivePrice =
      window.RaykelsCatalogAPI.getEffectivePrice(
        product,
        selectedVariant
      );

    const regularPrice =
      window.RaykelsCatalogAPI.getProductPrice(
        product,
        selectedVariant
      );

    const salePrice =
      window.RaykelsCatalogAPI.getProductSalePrice(
        product,
        selectedVariant
      );

    if (!price) return;

    if (
      salePrice !== null &&
      regularPrice !== null &&
      salePrice < regularPrice
    ) {
      price.innerHTML = `
        <span class="product-sale-price">
          ${window.RaykelsCatalogAPI.formatPrice(
            salePrice
          )}
        </span>
        <del>
          ${window.RaykelsCatalogAPI.formatPrice(
            regularPrice
          )}
        </del>
      `;
    } else if (effectivePrice !== null) {
      price.textContent =
        window.RaykelsCatalogAPI.formatPrice(
          effectivePrice
        );
    } else {
      price.textContent = 'Price on request';
    }
  }

  function updateAvailability() {
    if (!addButton) return;

    /*
     * Customer-facing availability is catalogue-based.
     * If the product is listed, customers may request it.
     * Inventory is reviewed by the administrator after order submission.
     */
    addButton.disabled = false;
    addButton.textContent = 'Add to Cart';
  }

  function renderVariants() {
    if (!variantArea || !variants.length) {
      updatePrice();
      updateAvailability();
      return;
    }

    variantArea.innerHTML = `
      <div class="product-variant-list">
        ${variants
          .map((variant, index) => `
            <button
              type="button"
              class="product-variant-option ${
                index === 0 ? 'active' : ''
              }"
              data-variant-id="${variant.id}">
              <span>
                ${variant.name || 'Option ' + (index + 1)}
              </span>
              ${
                Number.isFinite(Number(variant.price))
                  ? `
                    <small>
                      ${window.RaykelsCatalogAPI.formatPrice(
                        window.RaykelsCatalogAPI.getEffectivePrice(
                          product,
                          variant
                        )
                      )}
                    </small>
                  `
                  : ''
              }
            </button>
          `)
          .join('')}
      </div>
    `;

    selectedVariant = variants[0] || null;

    variantArea.addEventListener('click', event => {
      const option =
        event.target.closest(
          '.product-variant-option'
        );

      if (!option) return;

      selectedVariant =
        variants.find(
          variant =>
            String(variant.id) ===
            String(option.dataset.variantId)
        ) || null;

      variantArea
        .querySelectorAll(
          '.product-variant-option'
        )
        .forEach(item =>
          item.classList.remove('active')
        );

      option.classList.add('active');

      updatePrice();
      updateAvailability();
    });

    updatePrice();
    updateAvailability();
  }

  renderVariants();

  if (!variants.length) {
    updatePrice();
    updateAvailability();
  }

  if (addButton) {
    addButton.addEventListener('click', () => {
      const selectedQuantity =
        Math.max(
          1,
          Math.floor(
            Number(quantity?.value) || 1
          )
        );

      const added =
        window.RaykelsCart.addToCart(
          product.id,
          selectedQuantity,
          selectedVariant
        );

      if (!added) return;

      addButton.textContent =
        'Added to Cart ✓';

      setTimeout(() => {
        updateAvailability();
      }, 1800);
    });
  }

  const effectivePrice =
    window.RaykelsCatalogAPI.getEffectivePrice(
      product,
      selectedVariant
    );

  if (typeof fbq === 'function') {
    fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: Number(effectivePrice || 0),
      currency: 'NGN'
    });
  }

  if (typeof gtag === 'function') {
    gtag('event', 'view_item', {
      currency: 'NGN',
      value: Number(effectivePrice || 0),
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: Number(effectivePrice || 0),
        quantity: 1
      }]
    });
  }

  if (
    window.RaykelsAnalytics &&
    typeof window.RaykelsAnalytics.productView === 'function'
  ) {
    window.RaykelsAnalytics.productView({
      productId: product.id,
      productName: product.name,
      category: product.category || ''
    });
  }

  console.log(
    'Raykels product loaded:',
    product
  );
}

function showProductError(message) {
  const container =
    document.querySelector(
      '[data-product-container]'
    );

  if (container) {
    container.innerHTML =
      `<p>${message}</p>`;
  }
}

loadProductPage();

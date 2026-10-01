async function loadCatalog() {
  try {
    const response = await fetch('/api/products');

    if (!response.ok) {
      throw new Error(`Catalog request failed: ${response.status}`);
    }

    const data = await response.json();

    window.RaykelsCatalog = Array.isArray(data.products)
      ? data.products.filter(product => product && product.published !== false)
      : [];

    console.log(
      `Raykels catalog loaded: ${window.RaykelsCatalog.length} products`
    );

    return window.RaykelsCatalog;
  } catch (error) {
    console.error('Raykels catalog could not be loaded:', error);
    window.RaykelsCatalog = [];
    return [];
  }
}

function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return 'Price on request';
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
}

function getProductPrice(product, variant = null) {
  if (variant && Number.isFinite(Number(variant.price))) {
    return Number(variant.price);
  }

  if (product?.pricing && Number.isFinite(Number(product.pricing.price))) {
    return Number(product.pricing.price);
  }

  if (Number.isFinite(Number(product?.price))) {
    return Number(product.price);
  }

  return null;
}

function getProductSalePrice(product, variant = null) {
  if (
    variant &&
    variant.salePrice !== null &&
    Number.isFinite(Number(variant.salePrice))
  ) {
    return Number(variant.salePrice);
  }

  if (
    product?.pricing &&
    product.pricing.salePrice !== null &&
    Number.isFinite(Number(product.pricing.salePrice))
  ) {
    return Number(product.pricing.salePrice);
  }

  return null;
}

function getEffectivePrice(product, variant = null) {
  const salePrice = getProductSalePrice(product, variant);
  const regularPrice = getProductPrice(product, variant);

  return salePrice !== null ? salePrice : regularPrice;
}

function getProductVariants(product) {
  return Array.isArray(product?.variants)
    ? product.variants
    : [];
}

function getProductMedia(product) {
  const media = [];

  const images = Array.isArray(product?.images) ? product.images : [];
  const videos = Array.isArray(product?.videos) ? product.videos : [];

  images.forEach((item, index) => {
    const url = typeof item === 'string' ? item : item?.url;
    if (!url) return;

    media.push({
      id: item?.id || `${product.id || 'product'}-image-${index}`,
      type: 'image',
      url,
      alt: item?.alt || product?.name || 'RAYKELS product image',
      title: item?.title || product?.name || ''
    });
  });

  videos.forEach((item, index) => {
    const url = typeof item === 'string' ? item : item?.url;
    if (!url) return;

    media.push({
      id: item?.id || `${product.id || 'product'}-video-${index}`,
      type: 'video',
      url,
      title: item?.title || product?.name || 'RAYKELS product video',
      poster: item?.poster || item?.thumbnail || ''
    });
  });

  return media;
}

function getProductPrimaryMedia(product) {
  return getProductMedia(product)[0] || null;
}

function getProductsByCategory(category) {
  return window.RaykelsCatalog.filter(
    product => product.category === category
  );
}

function getProductsBySubcategory(category, subcategory) {
  return window.RaykelsCatalog.filter(
    product =>
      product.category === category &&
      product.subcategory === subcategory
  );
}

function getFeaturedProducts() {
  return window.RaykelsCatalog.filter(
    product => product.featured === true
  );
}

function getProductById(id) {
  return window.RaykelsCatalog.find(
    product => product.id === id
  );
}

window.RaykelsCatalogAPI = {
  loadCatalog,
  formatPrice,
  getProductPrice,
  getProductSalePrice,
  getEffectivePrice,
  getProductVariants,
  getProductMedia,
  getProductPrimaryMedia,
  getProductsByCategory,
  getProductsBySubcategory,
  getFeaturedProducts,
  getProductById
};

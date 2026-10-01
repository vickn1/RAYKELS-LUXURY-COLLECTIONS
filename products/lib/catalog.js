import {
  getProductMedia,
  getProductPrimaryMedia,
  getProductImageForVariant,
  getProductImages,
  getProductVideos
} from './product-media.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeProduct(product) {
  if (!product || typeof product !== 'object') {
    return null;
  }

  return {
    ...clone(product),

    media: getProductMedia(product),
    primaryMedia: getProductPrimaryMedia(product),

    images: getProductImages(product),
    videos: getProductVideos(product),

    getVariantImage(variant = null) {
      return getProductImageForVariant(
        product,
        variant
      );
    }
  };
}

export function normalizeProducts(products) {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .map(normalizeProduct)
    .filter(Boolean);
}

export async function loadCatalog(
  baseUrl = '/api/products'
) {
  const response = await fetch(baseUrl);

  if (!response.ok) {
    throw new Error(
      `Catalog request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return normalizeProducts(data.products);
}

export const RaykelsCatalogAPI = {
  loadCatalog,
  normalizeProduct,
  normalizeProducts
};

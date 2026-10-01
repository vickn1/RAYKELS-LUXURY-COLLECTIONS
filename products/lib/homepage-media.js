const MODES = new Set(['catalogue', 'selected']);

function isUsableMedia(media) {
  return Boolean(
    media &&
    typeof media.id === 'string' &&
    media.id &&
    typeof media.url === 'string' &&
    media.url
  );
}

function isEligibleProduct(product) {
  return Boolean(
    product &&
    product.published === true &&
    Array.isArray(product.media)
  );
}

export function getCatalogueHomepageMedia(products) {
  if (!Array.isArray(products)) return [];

  const media = [];

  for (const product of products) {
    if (!isEligibleProduct(product)) continue;

    for (const item of product.media) {
      if (!isUsableMedia(item)) continue;

      media.push({
        ...item,
        productId: product.id,
        productName: product.name || '',
        category: product.category || '',
        featured: product.featured === true
      });
    }
  }

  return media;
}

export function getSelectedHomepageMedia(products, selections = []) {
  if (!Array.isArray(products) || !Array.isArray(selections)) {
    return [];
  }

  const byProduct = new Map(
    products.map(product => [product?.id, product])
  );

  const result = [];

  for (const selection of selections) {
    const product = byProduct.get(selection?.productId);

    if (!isEligibleProduct(product)) continue;

    const media = product.media.find(
      item => item?.id === selection?.mediaId
    );

    if (!isUsableMedia(media)) continue;

    result.push({
      ...media,
      productId: product.id,
      productName: product.name || '',
      category: product.category || '',
      featured: product.featured === true
    });
  }

  return result;
}

export function resolveHomepageMedia({
  products,
  mode = 'catalogue',
  selections = []
} = {}) {
  if (!MODES.has(mode)) {
    throw new Error(`Unsupported homepage media mode: ${mode}`);
  }

  if (mode === 'selected') {
    return getSelectedHomepageMedia(products, selections);
  }

  return getCatalogueHomepageMedia(products);
}

export const HOMEPAGE_MEDIA_MODES = Object.freeze({
  CATALOGUE: 'catalogue',
  SELECTED: 'selected'
});

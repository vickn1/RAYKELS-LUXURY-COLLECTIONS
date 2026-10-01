const MEDIA_FIELDS = {
  image: 'images',
  video: 'videos'
};

function normalizeItem(item, type, index, productId) {
  const field = MEDIA_FIELDS[type];

  if (typeof item === 'string') {
    return {
      id: `${productId || 'product'}-${type}-${index}`,
      type,
      url: item,
      alt: type === 'image' ? 'RAYKELS product image' : '',
      title: '',
      poster: ''
    };
  }

  if (!item || typeof item !== 'object' || !item.url) {
    return null;
  }

  return {
    id: item.id || `${productId || 'product'}-${type}-${index}`,
    type,
    url: item.url,
    alt: item.alt || '',
    title: item.title || '',
    poster: item.poster || item.thumbnail || ''
  };
}

function collectMedia(product) {
  const result = [];

  for (const type of ['image', 'video']) {
    const field = MEDIA_FIELDS[type];
    const items = Array.isArray(product?.[field])
      ? product[field]
      : [];

    items.forEach((item, index) => {
      const normalized = normalizeItem(
        item,
        type,
        index,
        product?.id
      );

      if (normalized) {
        result.push(normalized);
      }
    });
  }

  return result;
}

export function getProductMedia(product) {
  if (!product || typeof product !== 'object') {
    return [];
  }

  const allMedia = collectMedia(product);

  if (!Array.isArray(product.mediaOrder)) {
    return allMedia;
  }

  const byId = new Map(
    allMedia.map(media => [media.id, media])
  );

  const ordered = [];

  for (const id of product.mediaOrder) {
    const media = byId.get(id);

    if (media) {
      ordered.push(media);
      byId.delete(id);
    }
  }

  // Preserve valid media that was not included in mediaOrder.
  for (const media of allMedia) {
    if (byId.has(media.id)) {
      ordered.push(media);
      byId.delete(media.id);
    }
  }

  return ordered;
}

export function getProductPrimaryMedia(product) {
  return getProductMedia(product)[0] || null;
}

export function getProductImageForVariant(product, variant = null) {
  const media = getProductMedia(product);

  if (Array.isArray(variant?.imageIds)) {
    for (const id of variant.imageIds) {
      const match = media.find(
        item => item.type === 'image' && item.id === id
      );

      if (match) {
        return match;
      }
    }
  }

  return media.find(item => item.type === 'image') || null;
}

export function getProductImages(product) {
  return getProductMedia(product)
    .filter(item => item.type === 'image');
}

export function getProductVideos(product) {
  return getProductMedia(product)
    .filter(item => item.type === 'video');
}

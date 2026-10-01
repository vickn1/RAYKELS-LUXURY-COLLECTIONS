export const PRODUCT_CATEGORIES = [
  'hair',
  'bags',
  'shoes',
  'children'
];

const MEDIA_TYPES = new Set(['image', 'video']);

function isNonNegativeNumber(value) {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0;
}

function validateStringArray(value, field, errors) {
  if (value === undefined) return;

  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array.`);
    return;
  }

  value.forEach((item, index) => {
    if (typeof item !== 'string') {
      errors.push(`${field}[${index}] must be a string.`);
    }
  });
}

function validateMediaList(value, field, errors) {
  if (value === undefined) return;

  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array.`);
    return;
  }

  const ids = new Set();

  value.forEach((item, index) => {
    if (typeof item === 'string') {
      return;
    }

    if (!item || typeof item !== 'object') {
      errors.push(`${field}[${index}] must be a string or object.`);
      return;
    }

    if (typeof item.url !== 'string' || !item.url.trim()) {
      errors.push(`${field}[${index}].url is required.`);
    }

    if (item.id !== undefined) {
      if (typeof item.id !== 'string' || !item.id.trim()) {
        errors.push(`${field}[${index}].id must be a non-empty string.`);
      } else if (ids.has(item.id)) {
        errors.push(`${field} contains duplicate id "${item.id}".`);
      } else {
        ids.add(item.id);
      }
    }

    for (const key of ['title', 'alt', 'poster']) {
      if (
        item[key] !== undefined &&
        typeof item[key] !== 'string'
      ) {
        errors.push(`${field}[${index}].${key} must be a string.`);
      }
    }
  });
}

function collectMediaIds(product) {
  const ids = new Set();

  for (const field of ['images', 'videos']) {
    const list = Array.isArray(product[field])
      ? product[field]
      : [];

    list.forEach((item, index) => {
      if (item && typeof item === 'object' && item.id) {
        ids.add(item.id);
      } else if (typeof item === 'string') {
        ids.add(`${field}-${index}`);
      }
    });
  }

  return ids;
}

function validateMediaOrder(product, errors) {
  if (product.mediaOrder === undefined) return;

  if (!Array.isArray(product.mediaOrder)) {
    errors.push('mediaOrder must be an array.');
    return;
  }

  const availableIds = collectMediaIds(product);
  const seen = new Set();

  product.mediaOrder.forEach((id, index) => {
    if (typeof id !== 'string' || !id.trim()) {
      errors.push(`mediaOrder[${index}] must be a non-empty string.`);
      return;
    }

    if (seen.has(id)) {
      errors.push(`mediaOrder contains duplicate id "${id}".`);
      return;
    }

    seen.add(id);

    if (!availableIds.has(id)) {
      errors.push(
        `mediaOrder[${index}] references unknown media id "${id}".`
      );
    }
  });
}

function validateVariants(variants, errors) {
  if (variants === undefined) return;

  if (!Array.isArray(variants)) {
    errors.push('variants must be an array.');
    return;
  }

  variants.forEach((variant, index) => {
    if (!variant || typeof variant !== 'object') {
      errors.push(`variants[${index}] must be an object.`);
      return;
    }

    if (
      variant.name !== undefined &&
      typeof variant.name !== 'string'
    ) {
      errors.push(`variants[${index}].name must be a string.`);
    }

    if (
      variant.value !== undefined &&
      typeof variant.value !== 'string'
    ) {
      errors.push(`variants[${index}].value must be a string.`);
    }

    if (
      variant.price !== undefined &&
      variant.price !== '' &&
      !isNonNegativeNumber(Number(variant.price))
    ) {
      errors.push(`variants[${index}].price must be a non-negative number.`);
    }

    if (variant.imageIds !== undefined) {
      if (!Array.isArray(variant.imageIds)) {
        errors.push(`variants[${index}].imageIds must be an array.`);
      } else {
        variant.imageIds.forEach((id, idIndex) => {
          if (typeof id !== 'string' || !id.trim()) {
            errors.push(
              `variants[${index}].imageIds[${idIndex}] must be a string.`
            );
          }
        });
      }
    }
  });
}

export function validateProduct(product, options = {}) {
  const errors = [];
  const partial = options.partial === true;

  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    return {
      valid: false,
      errors: ['Product must be an object.']
    };
  }

  if (!partial || product.name !== undefined) {
    if (
      typeof product.name !== 'string' ||
      !product.name.trim()
    ) {
      errors.push('name is required.');
    }
  }

  if (!partial || product.category !== undefined) {
    if (!PRODUCT_CATEGORIES.includes(product.category)) {
      errors.push(
        `category must be one of: ${PRODUCT_CATEGORIES.join(', ')}.`
      );
    }
  }

  for (const field of [
    'brand',
    'subcategory',
    'description',
    'sku',
    'currency'
  ]) {
    if (
      product[field] !== undefined &&
      typeof product[field] !== 'string'
    ) {
      errors.push(`${field} must be a string.`);
    }
  }

  if (product.pricing !== undefined) {
    if (
      !product.pricing ||
      typeof product.pricing !== 'object' ||
      Array.isArray(product.pricing)
    ) {
      errors.push('pricing must be an object.');
    } else {
      if (
        product.pricing.price !== undefined &&
        !isNonNegativeNumber(product.pricing.price)
      ) {
        errors.push('pricing.price must be a non-negative number.');
      }

      if (
        product.pricing.salePrice !== undefined &&
        product.pricing.salePrice !== null &&
        !isNonNegativeNumber(product.pricing.salePrice)
      ) {
        errors.push(
          'pricing.salePrice must be null or a non-negative number.'
        );
      }
    }
  }

  if (product.attributes !== undefined) {
    if (
      !product.attributes ||
      typeof product.attributes !== 'object' ||
      Array.isArray(product.attributes)
    ) {
      errors.push('attributes must be an object.');
    } else {
      for (const field of [
        'colours',
        'sizes',
        'lengths',
        'materials',
        'ageRanges'
      ]) {
        validateStringArray(
          product.attributes[field],
          `attributes.${field}`,
          errors
        );
      }
    }
  }

  if (product.inventory !== undefined) {
    if (
      !product.inventory ||
      typeof product.inventory !== 'object' ||
      Array.isArray(product.inventory)
    ) {
      errors.push('inventory must be an object.');
    } else {
      if (
        product.inventory.stock !== undefined &&
        !isNonNegativeNumber(product.inventory.stock)
      ) {
        errors.push('inventory.stock must be a non-negative number.');
      }

      if (
        product.inventory.trackStock !== undefined &&
        typeof product.inventory.trackStock !== 'boolean'
      ) {
        errors.push('inventory.trackStock must be a boolean.');
      }
    }
  }

  for (const field of [
    'available',
    'featured',
    'published'
  ]) {
    if (
      product[field] !== undefined &&
      typeof product[field] !== 'boolean'
    ) {
      errors.push(`${field} must be a boolean.`);
    }
  }

  validateVariants(product.variants, errors);
  validateMediaList(product.images, 'images', errors);
  validateMediaList(product.videos, 'videos', errors);
  validateMediaOrder(product, errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

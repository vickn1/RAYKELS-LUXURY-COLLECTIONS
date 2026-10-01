export const PRODUCT_CATEGORIES = [
  'hair',
  'bags',
  'shoes',
  'children'
];

const MEDIA_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime']
};

function validateMediaList(value, field, errors) {
  if (value === undefined) return;

  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array.`);
    return;
  }

  value.forEach((item, index) => {
    if (typeof item === 'string') {
      if (!item.trim()) {
        errors.push(`${field}[${index}] is invalid.`);
      }
      return;
    }

    if (!item || typeof item !== 'object') {
      errors.push(`${field}[${index}] must be a string or object.`);
      return;
    }

    if (!item.url || typeof item.url !== 'string') {
      errors.push(`${field}[${index}] must have a valid URL.`);
    }

    if (item.id !== undefined && typeof item.id !== 'string') {
      errors.push(`${field}[${index}].id must be a string.`);
    }

    if (item.title !== undefined && typeof item.title !== 'string') {
      errors.push(`${field}[${index}].title must be a string.`);
    }

    if (item.alt !== undefined && typeof item.alt !== 'string') {
      errors.push(`${field}[${index}].alt must be a string.`);
    }

    if (item.poster !== undefined && typeof item.poster !== 'string') {
      errors.push(`${field}[${index}].poster must be a string.`);
    }
  });
}

function validateList(value, field, errors) {
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

function validateVariants(value, errors) {
  if (value === undefined) return;

  if (!Array.isArray(value)) {
    errors.push('Variants must be an array.');
    return;
  }

  value.forEach((variant, index) => {
    if (!variant || typeof variant !== 'object') {
      errors.push(`variants[${index}] must be an object.`);
      return;
    }

    if (variant.name !== undefined &&
        typeof variant.name !== 'string') {
      errors.push(`variants[${index}].name must be a string.`);
    }

    if (variant.value !== undefined &&
        typeof variant.value !== 'string') {
      errors.push(`variants[${index}].value must be a string.`);
    }

    if (
      variant.price !== undefined &&
      variant.price !== '' &&
      (!Number.isFinite(Number(variant.price)) ||
        Number(variant.price) < 0)
    ) {
      errors.push(`variants[${index}].price is invalid.`);
    }
  });
}

export function validateProduct(
  product,
  { partial = false } = {}
) {
  const errors = [];

  if (!product || typeof product !== 'object') {
    return {
      valid: false,
      errors: ['Product must be an object.']
    };
  }

  if (!partial || product.name !== undefined) {
    if (!product.name || typeof product.name !== 'string') {
      errors.push('Product name is required.');
    }
  }

  if (!partial || product.category !== undefined) {
    if (!PRODUCT_CATEGORIES.includes(product.category)) {
      errors.push('Invalid product category.');
    }
  }

  const stringFields = [
    'brand',
    'subcategory',
    'description',
    'sku',
    'currency'
  ];

  for (const field of stringFields) {
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
      errors.push('Pricing must be an object.');
    } else {
      if (
        product.pricing.price !== undefined &&
        (!Number.isFinite(Number(product.pricing.price)) ||
          Number(product.pricing.price) < 0)
      ) {
        errors.push('Invalid product price.');
      }

      if (
        product.pricing.salePrice !== null &&
        product.pricing.salePrice !== undefined &&
        (!Number.isFinite(Number(product.pricing.salePrice)) ||
          Number(product.pricing.salePrice) < 0)
      ) {
        errors.push('Invalid sale price.');
      }
    }
  }

  if (product.attributes !== undefined) {
    if (
      !product.attributes ||
      typeof product.attributes !== 'object' ||
      Array.isArray(product.attributes)
    ) {
      errors.push('Attributes must be an object.');
    } else {
      validateList(
        product.attributes.colours,
        'attributes.colours',
        errors
      );
      validateList(
        product.attributes.sizes,
        'attributes.sizes',
        errors
      );
      validateList(
        product.attributes.lengths,
        'attributes.lengths',
        errors
      );
      validateList(
        product.attributes.materials,
        'attributes.materials',
        errors
      );
      validateList(
        product.attributes.ageRanges,
        'attributes.ageRanges',
        errors
      );
    }
  }

  if (product.inventory !== undefined) {
    if (
      !product.inventory ||
      typeof product.inventory !== 'object' ||
      Array.isArray(product.inventory)
    ) {
      errors.push('Inventory must be an object.');
    } else {
      if (
        product.inventory.stock !== undefined &&
        (!Number.isFinite(Number(product.inventory.stock)) ||
          Number(product.inventory.stock) < 0)
      ) {
        errors.push('Invalid stock quantity.');
      }

      if (
        product.inventory.trackStock !== undefined &&
        typeof product.inventory.trackStock !== 'boolean'
      ) {
        errors.push('inventory.trackStock must be a boolean.');
      }
    }
  }

  if (
    product.available !== undefined &&
    typeof product.available !== 'boolean'
  ) {
    errors.push('available must be a boolean.');
  }

  if (
    product.featured !== undefined &&
    typeof product.featured !== 'boolean'
  ) {
    errors.push('featured must be a boolean.');
  }

  if (
    product.published !== undefined &&
    typeof product.published !== 'boolean'
  ) {
    errors.push('published must be a boolean.');
  }

  validateVariants(product.variants, errors);
  validateMediaList(product.images, 'images', errors);
  validateMediaList(product.videos, 'videos', errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

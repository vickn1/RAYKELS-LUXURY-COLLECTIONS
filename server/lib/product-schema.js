export const PRODUCT_CATEGORIES = [
  'hair',
  'bags',
  'shoes',
  'children'
];

export function validateProduct(product, { partial = false } = {}) {
  const errors = [];

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

  if (product.pricing !== undefined) {
    if (typeof product.pricing !== 'object') {
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

  if (product.inventory !== undefined) {
    if (typeof product.inventory !== 'object') {
      errors.push('Inventory must be an object.');
    } else if (
      product.inventory.stock !== undefined &&
      (!Number.isFinite(Number(product.inventory.stock)) ||
        Number(product.inventory.stock) < 0)
    ) {
      errors.push('Invalid stock quantity.');
    }
  }

  if (product.variants !== undefined && !Array.isArray(product.variants)) {
    errors.push('Variants must be an array.');
  }

  if (product.images !== undefined && !Array.isArray(product.images)) {
    errors.push('Images must be an array.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getProductStock(product, variant = null) {
  if (
    variant &&
    Number.isFinite(Number(variant.stock))
  ) {
    return Number(variant.stock);
  }

  if (
    product?.inventory &&
    Number.isFinite(Number(product.inventory.stock))
  ) {
    return Number(product.inventory.stock);
  }

  if (Number.isFinite(Number(product?.stock))) {
    return Number(product.stock);
  }

  return 0;
}

export function isTracked(product) {
  return product?.inventory?.trackStock !== false;
}

export function isAvailable(product, variant = null) {
  if (product?.available === false) {
    return false;
  }

  if (variant?.available === false) {
    return false;
  }

  if (!isTracked(product)) {
    return true;
  }

  return getProductStock(product, variant) > 0;
}

export function getAvailableStock(product, variant = null) {
  if (!isTracked(product)) {
    return Infinity;
  }

  return getProductStock(product, variant);
}

export function validateRequestedQuantity(
  product,
  variant,
  quantity
) {
  if (!isAvailable(product, variant)) {
    return {
      valid: false,
      error: variant
        ? `Selected variant is unavailable or out of stock: ${product.name}`
        : `Product is unavailable or out of stock: ${product.name}`
    };
  }

  if (!isTracked(product)) {
    return {
      valid: true,
      available: Infinity
    };
  }

  const available = getAvailableStock(
    product,
    variant
  );

  if (quantity > available) {
    return {
      valid: false,
      error:
        `Insufficient stock for ${product.name}. ` +
        `Requested ${quantity}, available ${available}.`
    };
  }

  return {
    valid: true,
    available
  };
}

export function decrementStock(
  product,
  variant,
  quantity
) {
  if (!isTracked(product)) {
    return;
  }

  if (
    variant &&
    Number.isFinite(Number(variant.stock))
  ) {
    variant.stock =
      Number(variant.stock) - quantity;
    return;
  }

  if (
    product.inventory &&
    Number.isFinite(Number(product.inventory.stock))
  ) {
    product.inventory.stock =
      Number(product.inventory.stock) - quantity;
    return;
  }

  if (Number.isFinite(Number(product.stock))) {
    product.stock =
      Number(product.stock) - quantity;
  }
}

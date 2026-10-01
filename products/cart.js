const RAYKELS_CART_KEY = 'raykels_cart';

function getCart() {
  try {
    const stored = localStorage.getItem(RAYKELS_CART_KEY);
    const cart = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(cart)) return [];

    return cart.filter(
      item =>
        item &&
        typeof item.productId === 'string' &&
        Number.isFinite(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );
  } catch (error) {
    console.error('Raykels cart could not be loaded:', error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(
    RAYKELS_CART_KEY,
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new CustomEvent('raykels-cart-updated')
  );
}

function createCartItemKey(productId, variantId = null) {
  return variantId
    ? `${productId}::${variantId}`
    : productId;
}

function addToCart(productId, quantity = 1, variant = null) {
  const product =
    window.RaykelsCatalogAPI.getProductById(productId);

  if (!product) {
    console.error('Product not found:', productId);
    return false;
  }

  const amount = Math.max(1, Math.floor(Number(quantity) || 1));

  const variantId = variant?.id || null;
  const cartItemKey =
    createCartItemKey(productId, variantId);

  const cart = getCart();

  const existing = cart.find(
    item => item.cartItemKey === cartItemKey
  );

  if (existing) {
    existing.quantity += amount;
  } else {
    cart.push({
      cartItemKey,
      productId,
      variantId,

      variant: variant
        ? {
            id: variant.id || null,
            name: variant.name || '',
            sku: variant.sku || '',
            colour: variant.colour || '',
            size: variant.size || '',
            length: variant.length || '',
            material: variant.material || ''
          }
        : null,

      quantity: amount
    });
  }

  saveCart(cart);

  console.log(
    'Added to Raykels cart:',
    product.name,
    variant?.name || ''
  );

  return true;
}

function removeFromCart(cartItemKey) {
  const cart = getCart().filter(
    item =>
      item.cartItemKey !== cartItemKey &&
      !(
        !item.cartItemKey &&
        item.productId === cartItemKey
      )
  );

  saveCart(cart);
}

function updateCartQuantity(cartItemKey, quantity) {
  const cart = getCart();

  const item = cart.find(
    item =>
      item.cartItemKey === cartItemKey ||
      (
        !item.cartItemKey &&
        item.productId === cartItemKey
      )
  );

  if (!item) return;

  const amount = Number(quantity);

  if (!Number.isFinite(amount) || amount < 1) {
    removeFromCart(cartItemKey);
    return;
  }

  item.quantity = Math.floor(amount);

  if (!item.cartItemKey) {
    item.cartItemKey =
      createCartItemKey(
        item.productId,
        item.variantId || null
      );
  }

  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );
}

function getCartItemProduct(item) {
  return window.RaykelsCatalogAPI.getProductById(
    item.productId
  );
}

function getCartItemVariant(item, product) {
  if (!item.variantId || !product) return null;

  const variants =
    window.RaykelsCatalogAPI.getProductVariants(product);

  return (
    variants.find(
      variant => variant.id === item.variantId
    ) || null
  );
}

function getCartItemPrice(item) {
  const product = getCartItemProduct(item);

  if (!product) return null;

  const variant =
    getCartItemVariant(item, product);

  return window.RaykelsCatalogAPI.getEffectivePrice(
    product,
    variant
  );
}

function getCartTotal() {
  return getCart().reduce((total, item) => {
    const price = getCartItemPrice(item);

    if (!Number.isFinite(Number(price))) {
      return total;
    }

    return total +
      Number(price) * Number(item.quantity);
  }, 0);
}

window.RaykelsCart = {
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartCount,
  getCartTotal,
  getCartItemProduct,
  getCartItemVariant,
  getCartItemPrice
};

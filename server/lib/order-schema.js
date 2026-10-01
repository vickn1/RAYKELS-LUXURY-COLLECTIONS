export const FULFILMENT_METHODS = [
  'home_delivery',
  'office_pickup'
];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'ready',
  'completed',
  'cancelled'
];

export function validateOrder(order) {
  const errors = [];

  if (!order.customer || typeof order.customer !== 'object') {
    errors.push('Customer information is required.');
  } else {
    if (!order.customer.name) {
      errors.push('Customer name is required.');
    }

    if (!order.customer.phone) {
      errors.push('Customer phone is required.');
    }
  }

  if (!order.fulfilment || typeof order.fulfilment !== 'object') {
    errors.push('Fulfilment information is required.');
  } else {
    if (!FULFILMENT_METHODS.includes(order.fulfilment.method)) {
      errors.push('Invalid fulfilment method.');
    }

    if (order.fulfilment.method === 'home_delivery') {
      const delivery = order.fulfilment.delivery;

      if (!delivery || typeof delivery !== 'object') {
        errors.push('Delivery information is required.');
      } else {
        if (!delivery.address) {
          errors.push('Delivery address is required.');
        }

        if (!delivery.city) {
          errors.push('Delivery city is required.');
        }

        if (!delivery.state) {
          errors.push('Delivery state is required.');
        }
      }
    }

    if (order.fulfilment.method === 'office_pickup') {
      if (!order.fulfilment.pickup) {
        errors.push('Pickup information is required.');
      }
    }
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item.');
  } else {
    order.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Item ${index + 1}: product ID is required.`);
      }

      if (!item.productName) {
        errors.push(`Item ${index + 1}: product name is required.`);
      }

      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        errors.push(`Item ${index + 1}: invalid quantity.`);
      }

      if (
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) < 0
      ) {
        errors.push(`Item ${index + 1}: invalid unit price.`);
      }

      if (
        !Number.isFinite(Number(item.subtotal)) ||
        Number(item.subtotal) < 0
      ) {
        errors.push(`Item ${index + 1}: invalid subtotal.`);
      }
    });
  }

  if (!order.payment || typeof order.payment !== 'object') {
    errors.push('Payment information is required.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

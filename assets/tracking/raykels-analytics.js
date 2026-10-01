(function () {
  'use strict';

  const VISITOR_KEY = 'raykels_analytics_visitor';
  const SESSION_KEY = 'raykels_analytics_session';
  const SESSION_STARTED_KEY = 'raykels_analytics_session_started';

  const SESSION_WINDOW = 30 * 60 * 1000;

  function createId(prefix) {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === 'function'
    ) {
      return `${prefix}_${window.crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 12)}`;
  }

  function getVisitorId() {
    try {
      let id = localStorage.getItem(VISITOR_KEY);

      if (!id) {
        id = createId('visitor');
        localStorage.setItem(VISITOR_KEY, id);
      }

      return id;
    } catch (error) {
      return createId('visitor');
    }
  }

  function getSessionId() {
    try {
      const now = Date.now();
      const started = Number(
        sessionStorage.getItem(SESSION_STARTED_KEY) || 0
      );

      let id = sessionStorage.getItem(SESSION_KEY);

      if (
        !id ||
        !started ||
        now - started > SESSION_WINDOW
      ) {
        id = createId('session');

        sessionStorage.setItem(
          SESSION_KEY,
          id
        );

        sessionStorage.setItem(
          SESSION_STARTED_KEY,
          String(now)
        );
      }

      return id;
    } catch (error) {
      return createId('session');
    }
  }

  const visitorId = getVisitorId();
  let sessionId = getSessionId();

  function send(event, metadata = {}) {
    if (!event) return;

    const payload = {
      event,
      visitorId,
      sessionId,
      metadata: {
        page:
          metadata.page ||
          window.location.pathname,

        productId:
          metadata.productId || '',

        productName:
          metadata.productName || '',

        category:
          metadata.category || '',

        searchTerm:
          metadata.searchTerm || '',

        filter:
          metadata.filter || '',

        quantity:
          Number.isInteger(Number(metadata.quantity))
            ? Number(metadata.quantity)
            : null
      }
    };

    const body = JSON.stringify(payload);

    try {
      if (
        navigator.sendBeacon &&
        typeof navigator.sendBeacon === 'function'
      ) {
        const blob = new Blob(
          [body],
          { type: 'application/json' }
        );

        const queued = navigator.sendBeacon(
          '/api/analytics/events',
          blob
        );

        if (queued) return;
      }
    } catch (error) {
      // Fall through to fetch.
    }

    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body,
      keepalive: true
    }).catch(() => {
      // Analytics must never break the storefront.
    });
  }

  function pageView(metadata = {}) {
    send('page_view', metadata);
  }

  function productView(metadata = {}) {
    send('product_view', metadata);
  }

  function productClick(metadata = {}) {
    send('product_click', metadata);
  }

  function search(metadata = {}) {
    send('search', metadata);
  }

  function filter(metadata = {}) {
    send('filter', metadata);
  }

  function addToCart(metadata = {}) {
    send('add_to_cart', metadata);
  }

  function checkoutStarted(metadata = {}) {
    send('checkout_started', metadata);
  }

  function orderSubmitted(metadata = {}) {
    send('order_submitted', metadata);
  }

  window.RaykelsAnalytics = {
    visitorId,
    getSessionId: () => sessionId,
    send,
    pageView,
    productView,
    productClick,
    search,
    filter,
    addToCart,
    checkoutStarted,
    orderSubmitted
  };
})();

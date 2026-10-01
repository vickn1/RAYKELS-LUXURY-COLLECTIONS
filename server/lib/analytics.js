import path from 'path';
import crypto from 'crypto';
import {
  ensureJsonFile,
  readJson,
  writeJson
} from './data-store.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_FILE = path.join(
  DATA_DIR,
  'analytics.json'
);

const DEFAULT_ANALYTICS = {
  events: []
};

ensureJsonFile(
  ANALYTICS_FILE,
  DEFAULT_ANALYTICS
);

const ALLOWED_EVENTS = new Set([
  'page_view',
  'product_view',
  'product_click',
  'search',
  'filter',
  'add_to_cart',
  'checkout_started',
  'order_submitted'
]);

const MAX_EVENTS = 50000;
const SESSION_WINDOW_MS = 30 * 60 * 1000;

function cleanString(value, maxLength = 200) {
  return String(value || '')
    .trim()
    .slice(0, maxLength);
}

function createAnonymousId() {
  return crypto.randomBytes(16).toString('hex');
}

export function createAnalyticsIdentity() {
  return {
    visitorId: createAnonymousId(),
    sessionId: createAnonymousId()
  };
}

export function isAllowedEvent(eventName) {
  return ALLOWED_EVENTS.has(eventName);
}

export function recordAnalyticsEvent(input = {}) {
  const eventName = cleanString(input.event, 50);

  if (!isAllowedEvent(eventName)) {
    throw new Error('Unsupported analytics event.');
  }

  const visitorId = cleanString(
    input.visitorId,
    100
  );

  const sessionId = cleanString(
    input.sessionId,
    100
  );

  if (!visitorId || !sessionId) {
    throw new Error(
      'Analytics visitorId and sessionId are required.'
    );
  }

  const data = readJson(
    ANALYTICS_FILE,
    DEFAULT_ANALYTICS
  );

  const metadata = input.metadata &&
    typeof input.metadata === 'object'
      ? input.metadata
      : {};

  const event = {
    id: `event_${Date.now()}_${crypto
      .randomBytes(4)
      .toString('hex')}`,
    event: eventName,
    visitorId,
    sessionId,
    page: cleanString(metadata.page, 300),
    productId: cleanString(metadata.productId, 150),
    productName: cleanString(metadata.productName, 200),
    category: cleanString(metadata.category, 100),
    searchTerm: cleanString(metadata.searchTerm, 200),
    filter: cleanString(metadata.filter, 200),
    quantity: Number.isInteger(Number(metadata.quantity))
      ? Number(metadata.quantity)
      : null,
    timestamp: new Date().toISOString()
  };

  data.events.push(event);

  if (data.events.length > MAX_EVENTS) {
    data.events = data.events.slice(-MAX_EVENTS);
  }

  writeJson(ANALYTICS_FILE, data);

  return event;
}

function getEvents() {
  const data = readJson(
    ANALYTICS_FILE,
    DEFAULT_ANALYTICS
  );

  return Array.isArray(data.events)
    ? data.events
    : [];
}

function uniqueCount(values) {
  return new Set(
    values.filter(Boolean)
  ).size;
}

export function getAnalyticsSummary() {
  const events = getEvents();

  const visitors = uniqueCount(
    events.map(event => event.visitorId)
  );

  const sessions = uniqueCount(
    events.map(event => event.sessionId)
  );

  const pageViews = events.filter(
    event => event.event === 'page_view'
  );

  const productViews = events.filter(
    event => event.event === 'product_view'
  );

  const productClicks = events.filter(
    event => event.event === 'product_click'
  );

  const addToCart = events.filter(
    event => event.event === 'add_to_cart'
  );

  const checkoutStarted = events.filter(
    event => event.event === 'checkout_started'
  );

  const ordersSubmitted = events.filter(
    event => event.event === 'order_submitted'
  );

  const productCounts = {};

  for (const event of productViews) {
    if (!event.productId) continue;

    const key = event.productId;

    if (!productCounts[key]) {
      productCounts[key] = {
        productId: key,
        productName: event.productName || key,
        views: 0
      };
    }

    productCounts[key].views += 1;
  }

  const popularProducts = Object.values(
    productCounts
  )
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const pageCounts = {};

  for (const event of pageViews) {
    if (!event.page) continue;

    pageCounts[event.page] =
      (pageCounts[event.page] || 0) + 1;
  }

  const popularPages = Object.entries(pageCounts)
    .map(([page, views]) => ({
      page,
      views
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    totals: {
      events: events.length,
      visitors,
      sessions,
      pageViews: pageViews.length,
      productViews: productViews.length,
      productClicks: productClicks.length,
      addToCart: addToCart.length,
      checkoutStarted: checkoutStarted.length,
      ordersSubmitted: ordersSubmitted.length
    },
    funnel: {
      visitors,
      productViews: productViews.length,
      addToCart: addToCart.length,
      checkoutStarted: checkoutStarted.length,
      ordersSubmitted: ordersSubmitted.length
    },
    popularProducts,
    popularPages,
    recentEvents: events
      .slice(-20)
      .reverse()
      .map(event => ({
        event: event.event,
        page: event.page,
        productName: event.productName,
        timestamp: event.timestamp
      }))
  };
}

export function getAnalyticsEvents(limit = 100) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    500
  );

  return getEvents()
    .slice(-safeLimit)
    .reverse();
}

export function isSessionActive(events, sessionId) {
  const sessionEvents = events
    .filter(event => event.sessionId === sessionId)
    .sort(
      (a, b) =>
        new Date(b.timestamp) -
        new Date(a.timestamp)
    );

  if (!sessionEvents.length) return false;

  return (
    Date.now() -
      new Date(sessionEvents[0].timestamp).getTime()
  ) < SESSION_WINDOW_MS;
}

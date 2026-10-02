const EVENT_STATUSES = Object.freeze([
  'pending',
  'published',
  'processed',
  'failed',
  'cancelled'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateEvent(event) {
  const errors = [];

  if (!event || typeof event !== 'object') {
    return {
      valid: false,
      errors: ['Event must be an object.']
    };
  }

  if (typeof event.id !== 'string' || !event.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof event.type !== 'string' || !event.type.trim()) {
    errors.push('type must be a non-empty string.');
  }

  if (typeof event.source !== 'string' || !event.source.trim()) {
    errors.push('source must be a non-empty string.');
  }

  if (
    event.contractId !== undefined &&
    (typeof event.contractId !== 'string' || !event.contractId.trim())
  ) {
    errors.push('contractId must be a non-empty string.');
  }

  if (
    event.timestamp !== undefined &&
    (typeof event.timestamp !== 'string' || !event.timestamp.trim())
  ) {
    errors.push('timestamp must be a non-empty string.');
  }

  if (
    event.status !== undefined &&
    !EVENT_STATUSES.includes(event.status)
  ) {
    errors.push(
      `status must be one of: ${EVENT_STATUSES.join(', ')}.`
    );
  }

  if (
    event.payload !== undefined &&
    (typeof event.payload !== 'object' || event.payload === null)
  ) {
    errors.push('payload must be an object.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizeEvent(event) {
  const validation = validateEvent(event);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(event),
    status: event.status ?? 'pending',
    timestamp: event.timestamp ?? new Date().toISOString(),
    payload: clone(event.payload ?? {})
  });
}

export function createCanonicalEvents(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Events source must be an array.');
  }

  const records = source.map(normalizeEvent);
  const index = new Map();

  for (const event of records) {
    if (index.has(event.id)) {
      throw new Error(`Duplicate event id: ${event.id}`);
    }

    index.set(event.id, event);
  }

  function list() {
    return clone(records);
  }

  function get(id) {
    return clone(index.get(String(id)) ?? null);
  }

  function has(id) {
    return index.has(String(id));
  }

  function validate(event) {
    return validateEvent(event);
  }

  function normalize(event) {
    return normalizeEvent(event);
  }

  function search(query) {
    const normalized = String(query ?? '')
      .trim()
      .toLowerCase();

    if (!normalized) {
      return [];
    }

    return records
      .filter(event =>
        JSON.stringify(event)
          .toLowerCase()
          .includes(normalized)
      )
      .map(clone);
  }

  return Object.freeze({
    list,
    get,
    has,
    validate,
    normalize,
    search
  });
}

export const CanonicalEvents = Object.freeze({
  create: createCanonicalEvents,
  statuses: EVENT_STATUSES,
  validate: validateEvent,
  normalize: normalizeEvent
});

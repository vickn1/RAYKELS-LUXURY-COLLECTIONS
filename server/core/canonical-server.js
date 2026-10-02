const SERVER_STATUSES = Object.freeze([
  'active',
  'stopped',
  'degraded',
  'disabled'
]);

const HTTP_METHODS = Object.freeze([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateServer(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['Server record must be an object.']
    };
  }

  if (typeof record.id !== 'string' || !record.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof record.owner !== 'string' || !record.owner.trim()) {
    errors.push('owner must be a non-empty string.');
  }

  if (typeof record.method !== 'string' ||
      !HTTP_METHODS.includes(record.method)) {
    errors.push(
      `method must be one of: ${HTTP_METHODS.join(', ')}.`
    );
  }

  if (typeof record.path !== 'string' || !record.path.trim()) {
    errors.push('path must be a non-empty string.');
  }

  if (
    record.status !== undefined &&
    !SERVER_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${SERVER_STATUSES.join(', ')}.`
    );
  }

  if (
    record.contractId !== undefined &&
    (typeof record.contractId !== 'string' ||
      !record.contractId.trim())
  ) {
    errors.push('contractId must be a non-empty string.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizeServer(record) {
  const validation = validateServer(record);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(record),
    status: record.status ?? 'active'
  });
}

export function createCanonicalServer(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Server source must be an array.');
  }

  const records = source.map(normalizeServer);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate server id: ${record.id}`);
    }

    index.set(record.id, record);
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

  function validate(record) {
    return validateServer(record);
  }

  function normalize(record) {
    return normalizeServer(record);
  }

  function isActive(id) {
    return index.get(String(id))?.status === 'active';
  }

  function search(query) {
    const normalized = String(query ?? '')
      .trim()
      .toLowerCase();

    if (!normalized) {
      return [];
    }

    return records
      .filter(record =>
        JSON.stringify(record)
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
    isActive,
    search
  });
}

export const CanonicalServer = Object.freeze({
  create: createCanonicalServer,
  statuses: SERVER_STATUSES,
  methods: HTTP_METHODS,
  validate: validateServer,
  normalize: normalizeServer
});

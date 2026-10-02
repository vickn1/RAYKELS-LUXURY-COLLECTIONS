const SERVICE_STATUSES = Object.freeze([
  'running',
  'stopped',
  'degraded',
  'disabled'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateService(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['Service record must be an object.']
    };
  }

  if (typeof record.id !== 'string' || !record.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof record.owner !== 'string' || !record.owner.trim()) {
    errors.push('owner must be a non-empty string.');
  }

  if (typeof record.endpointId !== 'string' || !record.endpointId.trim()) {
    errors.push('endpointId must be a non-empty string.');
  }

  if (
    record.status !== undefined &&
    !SERVICE_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${SERVICE_STATUSES.join(', ')}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizeService(record) {
  const validation = validateService(record);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(record),
    status: record.status ?? 'running'
  });
}

export function createCanonicalService(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Service source must be an array.');
  }

  const records = source.map(normalizeService);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate service id: ${record.id}`);
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
    return validateService(record);
  }

  function normalize(record) {
    return normalizeService(record);
  }

  function isRunning(id) {
    return index.get(String(id))?.status === 'running';
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
    isRunning,
    search
  });
}

export const CanonicalService = Object.freeze({
  create: createCanonicalService,
  statuses: SERVICE_STATUSES,
  validate: validateService,
  normalize: normalizeService
});

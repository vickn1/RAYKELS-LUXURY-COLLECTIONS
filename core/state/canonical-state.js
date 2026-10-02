const STATE_STATUSES = Object.freeze([
  'active',
  'stale',
  'unknown',
  'error'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateState(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['State record must be an object.']
    };
  }

  if (typeof record.id !== 'string' || !record.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof record.owner !== 'string' || !record.owner.trim()) {
    errors.push('owner must be a non-empty string.');
  }

  if (
    record.status !== undefined &&
    !STATE_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${STATE_STATUSES.join(', ')}.`
    );
  }

  if (
    record.version !== undefined &&
    (typeof record.version !== 'string' || !record.version.trim())
  ) {
    errors.push('version must be a non-empty string.');
  }

  if (
    record.value !== undefined &&
    (typeof record.value !== 'object' || record.value === null)
  ) {
    errors.push('value must be an object.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizeState(record) {
  const validation = validateState(record);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(record),
    status: record.status ?? 'active',
    version: record.version ?? '1.0.0',
    value: clone(record.value ?? {})
  });
}

export function createCanonicalState(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('State source must be an array.');
  }

  const records = source.map(normalizeState);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate state id: ${record.id}`);
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
    return validateState(record);
  }

  function normalize(record) {
    return normalizeState(record);
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
    search
  });
}

export const CanonicalState = Object.freeze({
  create: createCanonicalState,
  statuses: STATE_STATUSES,
  validate: validateState,
  normalize: normalizeState
});

const STORAGE_STATUSES = Object.freeze([
  'active',
  'readonly',
  'disabled'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateStorage(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['Storage record must be an object.']
    };
  }

  if (typeof record.id !== 'string' || !record.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof record.owner !== 'string' || !record.owner.trim()) {
    errors.push('owner must be a non-empty string.');
  }

  if (typeof record.type !== 'string' || !record.type.trim()) {
    errors.push('type must be a non-empty string.');
  }

  if (
    record.status !== undefined &&
    !STORAGE_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${STORAGE_STATUSES.join(', ')}.`
    );
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

function normalizeStorage(record) {
  const validation = validateStorage(record);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(record),
    status: record.status ?? 'active',
    value: clone(record.value ?? {})
  });
}

export function createCanonicalStorage(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Storage source must be an array.');
  }

  const records = source.map(normalizeStorage);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate storage id: ${record.id}`);
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
    return validateStorage(record);
  }

  function normalize(record) {
    return normalizeStorage(record);
  }

  function read(id, fallback = null) {
    const record = index.get(String(id));

    if (!record || record.status === 'disabled') {
      return clone(fallback);
    }

    return clone(record.value);
  }

  function canWrite(id) {
    const record = index.get(String(id));

    return Boolean(
      record &&
      record.status === 'active'
    );
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
    read,
    canWrite,
    search
  });
}

export const CanonicalStorage = Object.freeze({
  create: createCanonicalStorage,
  statuses: STORAGE_STATUSES,
  validate: validateStorage,
  normalize: normalizeStorage
});

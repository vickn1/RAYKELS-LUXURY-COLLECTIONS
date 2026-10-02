const FILESYSTEM_STATUSES = Object.freeze([
  'active',
  'readonly',
  'disabled'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateFilesystem(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['Filesystem record must be an object.']
    };
  }

  if (typeof record.id !== 'string' || !record.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof record.owner !== 'string' || !record.owner.trim()) {
    errors.push('owner must be a non-empty string.');
  }

  if (typeof record.path !== 'string' || !record.path.trim()) {
    errors.push('path must be a non-empty string.');
  }

  if (
    record.status !== undefined &&
    !FILESYSTEM_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${FILESYSTEM_STATUSES.join(', ')}.`
    );
  }

  if (
    record.metadata !== undefined &&
    (typeof record.metadata !== 'object' || record.metadata === null)
  ) {
    errors.push('metadata must be an object.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizeFilesystem(record) {
  const validation = validateFilesystem(record);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(record),
    status: record.status ?? 'active',
    metadata: clone(record.metadata ?? {})
  });
}

export function createCanonicalFilesystem(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Filesystem source must be an array.');
  }

  const records = source.map(normalizeFilesystem);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate filesystem id: ${record.id}`);
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
    return validateFilesystem(record);
  }

  function normalize(record) {
    return normalizeFilesystem(record);
  }

  function resolve(id) {
    const record = index.get(String(id));

    return record ? record.path : null;
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
    resolve,
    canWrite,
    search
  });
}

export const CanonicalFilesystem = Object.freeze({
  create: createCanonicalFilesystem,
  statuses: FILESYSTEM_STATUSES,
  validate: validateFilesystem,
  normalize: normalizeFilesystem
});

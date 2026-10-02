const PERMISSION_STATUSES = Object.freeze([
  'active',
  'disabled',
  'revoked'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validatePermission(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['Permission record must be an object.']
    };
  }

  if (typeof record.id !== 'string' || !record.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof record.actor !== 'string' || !record.actor.trim()) {
    errors.push('actor must be a non-empty string.');
  }

  if (typeof record.action !== 'string' || !record.action.trim()) {
    errors.push('action must be a non-empty string.');
  }

  if (typeof record.resource !== 'string' || !record.resource.trim()) {
    errors.push('resource must be a non-empty string.');
  }

  if (
    record.status !== undefined &&
    !PERMISSION_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${PERMISSION_STATUSES.join(', ')}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizePermission(record) {
  const validation = validatePermission(record);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(record),
    status: record.status ?? 'active'
  });
}

export function createCanonicalPermissions(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Permission source must be an array.');
  }

  const records = source.map(normalizePermission);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate permission id: ${record.id}`);
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
    return validatePermission(record);
  }

  function normalize(record) {
    return normalizePermission(record);
  }

  function isAllowed(actor, action, resource) {
    return records.some(record =>
      record.status === 'active' &&
      record.actor === actor &&
      record.action === action &&
      record.resource === resource
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
    isAllowed,
    search
  });
}

export const CanonicalPermissions = Object.freeze({
  create: createCanonicalPermissions,
  statuses: PERMISSION_STATUSES,
  validate: validatePermission,
  normalize: normalizePermission
});

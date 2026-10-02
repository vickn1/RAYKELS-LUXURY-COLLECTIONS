const AUDIT_STATUSES = Object.freeze([
  'recorded',
  'reviewed',
  'resolved',
  'dismissed'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateAudit(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['Audit record must be an object.']
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
    !AUDIT_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${AUDIT_STATUSES.join(', ')}.`
    );
  }

  if (
    record.details !== undefined &&
    (typeof record.details !== 'object' || record.details === null)
  ) {
    errors.push('details must be an object.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizeAudit(record) {
  const validation = validateAudit(record);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(record),
    status: record.status ?? 'recorded',
    details: clone(record.details ?? {})
  });
}

export function createCanonicalAudit(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Audit source must be an array.');
  }

  const records = source.map(normalizeAudit);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate audit id: ${record.id}`);
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
    return validateAudit(record);
  }

  function normalize(record) {
    return normalizeAudit(record);
  }

  function isResolved(id) {
    return index.get(String(id))?.status === 'resolved';
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
    isResolved,
    search
  });
}

export const CanonicalAudit = Object.freeze({
  create: createCanonicalAudit,
  statuses: AUDIT_STATUSES,
  validate: validateAudit,
  normalize: normalizeAudit
});

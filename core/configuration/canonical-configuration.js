const CONFIGURATION_STATUSES = Object.freeze([
  'active',
  'disabled',
  'deprecated'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateConfiguration(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: ['Configuration record must be an object.']
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
    !CONFIGURATION_STATUSES.includes(record.status)
  ) {
    errors.push(
      `status must be one of: ${CONFIGURATION_STATUSES.join(', ')}.`
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

function normalizeConfiguration(record) {
  const validation = validateConfiguration(record);

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

export function createCanonicalConfiguration(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Configuration source must be an array.');
  }

  const records = source.map(normalizeConfiguration);
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate configuration id: ${record.id}`);
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
    return validateConfiguration(record);
  }

  function normalize(record) {
    return normalizeConfiguration(record);
  }

  function getValue(id, fallback = null) {
    const record = index.get(String(id));

    if (!record || record.status !== 'active') {
      return clone(fallback);
    }

    return clone(record.value);
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
    getValue,
    search
  });
}

export const CanonicalConfiguration = Object.freeze({
  create: createCanonicalConfiguration,
  statuses: CONFIGURATION_STATUSES,
  validate: validateConfiguration,
  normalize: normalizeConfiguration
});

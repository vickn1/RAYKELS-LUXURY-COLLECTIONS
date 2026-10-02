const CONTRACT_TYPES = Object.freeze([
  'api',
  'frontend',
  'backend',
  'service',
  'event',
  'storage',
  'configuration'
]);

const CONTRACT_STATUSES = Object.freeze([
  'planned',
  'active',
  'deprecated',
  'disabled'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateContract(contract) {
  const errors = [];

  if (!contract || typeof contract !== 'object') {
    return {
      valid: false,
      errors: ['Contract must be an object.']
    };
  }

  if (typeof contract.id !== 'string' || !contract.id.trim()) {
    errors.push('id must be a non-empty string.');
  }

  if (typeof contract.owner !== 'string' || !contract.owner.trim()) {
    errors.push('owner must be a non-empty string.');
  }

  if (!CONTRACT_TYPES.includes(contract.type)) {
    errors.push(`type must be one of: ${CONTRACT_TYPES.join(', ')}.`);
  }

  if (
    contract.status !== undefined &&
    !CONTRACT_STATUSES.includes(contract.status)
  ) {
    errors.push(
      `status must be one of: ${CONTRACT_STATUSES.join(', ')}.`
    );
  }

  if (
    contract.version !== undefined &&
    (typeof contract.version !== 'string' || !contract.version.trim())
  ) {
    errors.push('version must be a non-empty string.');
  }

  if (
    contract.dependencies !== undefined &&
    !Array.isArray(contract.dependencies)
  ) {
    errors.push('dependencies must be an array.');
  }

  if (
    contract.consumers !== undefined &&
    !Array.isArray(contract.consumers)
  ) {
    errors.push('consumers must be an array.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function normalizeContract(contract) {
  const validation = validateContract(contract);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  return Object.freeze({
    ...clone(contract),
    status: contract.status ?? 'active',
    version: contract.version ?? '1.0.0',
    dependencies: clone(contract.dependencies ?? []),
    consumers: clone(contract.consumers ?? [])
  });
}

export function createCanonicalContracts(source = []) {
  if (!Array.isArray(source)) {
    throw new TypeError('Contracts source must be an array.');
  }

  const records = source.map(normalizeContract);
  const index = new Map();

  for (const contract of records) {
    if (index.has(contract.id)) {
      throw new Error(`Duplicate contract id: ${contract.id}`);
    }

    index.set(contract.id, contract);
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

  function validate(contract) {
    return validateContract(contract);
  }

  function normalize(contract) {
    return normalizeContract(contract);
  }

  function search(query) {
    const normalized = String(query ?? '')
      .trim()
      .toLowerCase();

    if (!normalized) {
      return [];
    }

    return records
      .filter(contract =>
        JSON.stringify(contract)
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

export const CanonicalContracts = Object.freeze({
  create: createCanonicalContracts,
  types: CONTRACT_TYPES,
  statuses: CONTRACT_STATUSES,
  validate: validateContract,
  normalize: normalizeContract
});

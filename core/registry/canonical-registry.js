const COLLECTIONS = Object.freeze([
  'components',
  'capabilities',
  'contracts',
  'settings'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateRecord(record, collection) {
  if (!record || typeof record !== 'object') {
    throw new TypeError(`${collection} record must be an object.`);
  }

  if (typeof record.id !== 'string' || !record.id.trim()) {
    throw new Error(`${collection} record requires a non-empty id.`);
  }

  return true;
}

function validateRegistry(registry) {
  if (!registry || typeof registry !== 'object') {
    throw new TypeError('Registry must be an object.');
  }

  for (const collection of COLLECTIONS) {
    if (!Array.isArray(registry[collection])) {
      throw new Error(`Registry collection "${collection}" must be an array.`);
    }

    for (const record of registry[collection]) {
      validateRecord(record, collection);
    }
  }

  return true;
}

function createIndex(records) {
  const index = new Map();

  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate registry id: ${record.id}`);
    }

    index.set(record.id, record);
  }

  return index;
}

export function createCanonicalRegistry(source = {}) {
  const registry = {
    registryId: source.registryId ?? 'raykels.system',
    registryVersion: source.registryVersion ?? '2.0.0',
    status: source.status ?? 'active',
    components: clone(source.components ?? []),
    capabilities: clone(source.capabilities ?? []),
    contracts: clone(source.contracts ?? []),
    settings: clone(source.settings ?? [])
  };

  validateRegistry(registry);

  const indexes = Object.freeze({
    components: createIndex(registry.components),
    capabilities: createIndex(registry.capabilities),
    contracts: createIndex(registry.contracts),
    settings: createIndex(registry.settings)
  });

  function getRegistry() {
    return clone(registry);
  }

  function getComponent(id) {
    return clone(indexes.components.get(String(id)) ?? null);
  }

  function getModule(id) {
    return getComponent(id);
  }

  function getCapability(id) {
    return clone(indexes.capabilities.get(String(id)) ?? null);
  }

  function getContract(id) {
    return clone(indexes.contracts.get(String(id)) ?? null);
  }

  function getSetting(id) {
    return clone(indexes.settings.get(String(id)) ?? null);
  }

  function getDependencies(id) {
    const component = indexes.components.get(String(id));

    if (!component) {
      return [];
    }

    return clone(component.dependencies ?? []);
  }

  function getConsumers(id) {
    const component = indexes.components.get(String(id));

    if (!component) {
      return [];
    }

    return clone(component.consumers ?? []);
  }

  function search(query) {
    const normalized = String(query ?? '').trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    const results = [];

    for (const collection of COLLECTIONS) {
      for (const record of registry[collection]) {
        const haystack = JSON.stringify(record).toLowerCase();

        if (haystack.includes(normalized)) {
          results.push({
            collection,
            id: record.id,
            owner: record.owner ?? null,
            status: record.status ?? null
          });
        }
      }
    }

    return results;
  }

  return Object.freeze({
    getRegistry,
    getComponent,
    getModule,
    getCapability,
    getContract,
    getSetting,
    getDependencies,
    getConsumers,
    search
  });
}

export const CanonicalRegistry = Object.freeze({
  create: createCanonicalRegistry,
  collections: COLLECTIONS
});

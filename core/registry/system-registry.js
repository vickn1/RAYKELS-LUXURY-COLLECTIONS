import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const REGISTRY_FILE = path.join(
  ROOT_DIR,
  'core',
  'registry',
  'system-registry.json'
);

function loadRegistry() {
  const raw = fs.readFileSync(REGISTRY_FILE, 'utf8');
  const registry = JSON.parse(raw);

  if (
    !registry ||
    typeof registry !== 'object' ||
    !Array.isArray(registry.modules) ||
    !Array.isArray(registry.capabilities) ||
    !Array.isArray(registry.contracts) ||
    !Array.isArray(registry.settings)
  ) {
    throw new Error('Invalid Raykels system registry.');
  }

  return registry;
}

export function getSystemRegistry() {
  return loadRegistry();
}

export function getModule(id) {
  return loadRegistry().modules.find(
    module => module.id === id
  ) || null;
}

export function getCapability(id) {
  return loadRegistry().capabilities.find(
    capability => capability.id === id
  ) || null;
}

export function getContract(id) {
  return loadRegistry().contracts.find(
    contract => contract.id === id
  ) || null;
}

export function getSetting(id) {
  return loadRegistry().settings.find(
    setting => setting.id === id
  ) || null;
}

export function searchRegistry(query) {
  const registry = loadRegistry();

  const normalized = String(query || '')
    .trim()
    .toLowerCase();

  if (!normalized) {
    return [];
  }

  const results = [];

  for (const module of registry.modules) {
    const haystack = [
      module.id,
      module.name,
      module.owner,
      module.api
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (haystack.includes(normalized)) {
      results.push({
        type: 'module',
        id: module.id,
        name: module.name,
        owner: module.owner,
        status: module.status
      });
    }
  }

  for (const capability of registry.capabilities) {
    const haystack = [
      capability.id,
      capability.owner,
      capability.status
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (haystack.includes(normalized)) {
      results.push({
        type: 'capability',
        id: capability.id,
        owner: capability.owner,
        permissionLevel: capability.permissionLevel,
        status: capability.status
      });
    }
  }

  for (const contract of registry.contracts) {
    const haystack = [
      contract.id,
      contract.owner,
      contract.type,
      contract.method,
      contract.path,
      contract.source,
      contract.function
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (haystack.includes(normalized)) {
      results.push({
        type: 'contract',
        id: contract.id,
        owner: contract.owner,
        type: contract.type,
        status: contract.status
      });
    }
  }

  for (const setting of registry.settings) {
    const haystack = [
      setting.id,
      setting.name,
      setting.owner,
      setting.type,
      setting.status
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (haystack.includes(normalized)) {
      results.push({
        type: 'setting',
        id: setting.id,
        name: setting.name,
        owner: setting.owner,
        type: setting.type,
        status: setting.status
      });
    }
  }

  return results;
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanonicalRegistry } from './canonical-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_FILE = path.join(__dirname, 'system-registry.json');

function readSourceRegistry() {
  const raw = fs.readFileSync(SOURCE_FILE, 'utf8');
  return JSON.parse(raw);
}

function translateSource(source) {
  return {
    registryId: source.registryId,
    registryVersion: '2.0.0',
    status: source.status,

    components: (source.modules ?? []).map(module => ({
      ...module,
      type: module.type ?? 'system-component',
      version: module.version ?? '1.0.0',
      dependencies: module.dependencies ?? [],
      consumers: module.consumers ?? [],
      securityLevel: module.securityLevel ?? 0
    })),

    capabilities: source.capabilities ?? [],
    contracts: source.contracts ?? [],
    settings: source.settings ?? []
  };
}

export function loadCanonicalRegistry() {
  return createCanonicalRegistry(
    translateSource(readSourceRegistry())
  );
}

export const CoreRegistry = Object.freeze({
  load: loadCanonicalRegistry
});

import { CoreRegistry } from '../registry/index.js';
import { createCanonicalContracts } from './canonical-contracts.js';

function translateRegistryContract(contract) {
  const typeMap = {
    'frontend-contract': 'frontend'
  };

  return {
    ...contract,
    type: typeMap[contract.type] ?? contract.type
  };
}

export function loadCanonicalContracts() {
  const registry = CoreRegistry.load();

  const sourceContracts =
    registry.getRegistry().contracts ?? [];

  const translatedContracts =
    sourceContracts.map(translateRegistryContract);

  return createCanonicalContracts(translatedContracts);
}

export const CoreContracts = Object.freeze({
  load: loadCanonicalContracts
});

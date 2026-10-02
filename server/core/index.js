import { CoreContracts } from '../../core/contracts/index.js';
import { createCanonicalServer } from './canonical-server.js';

export function loadCanonicalServer(source = []) {
  const contracts = CoreContracts.load(source);

  const server = contracts.list()
    .filter(contract =>
      contract.type === 'api' ||
      contract.type === 'backend' ||
      contract.type === 'service'
    )
    .map(contract => ({
      id: `server.${contract.id}`,
      owner: contract.owner,
      method: contract.method ?? 'GET',
      path: contract.path ?? `/${contract.id}`,
      contractId: contract.id,
      status: contract.status === 'active'
        ? 'active'
        : 'disabled'
    }));

  return createCanonicalServer(server);
}

export const CoreServer = Object.freeze({
  load: loadCanonicalServer
});

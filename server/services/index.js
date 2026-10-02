import { CoreServer } from '../core/index.js';
import { createCanonicalService } from './canonical-service.js';

export function loadCanonicalServices() {
  const server = CoreServer.load();

  const services = server.list().map(endpoint => ({
    id: `service.${endpoint.id}`,
    owner: endpoint.owner,
    endpointId: endpoint.id,
    status: endpoint.status === 'active'
      ? 'running'
      : 'disabled'
  }));

  return createCanonicalService(services);
}

export const CoreServices = Object.freeze({
  load: loadCanonicalServices
});

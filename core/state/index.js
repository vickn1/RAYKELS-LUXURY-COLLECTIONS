import { CoreEvents } from '../events/index.js';
import { createCanonicalState } from './canonical-state.js';

export function loadCanonicalState(source = []) {
  const events = CoreEvents.load(source);

  const records = events.list().map(event => ({
    id: event.id,
    owner: event.source,
    status: event.status === 'failed' ? 'error' : 'active',
    version: '1.0.0',
    value: {
      eventType: event.type,
      contractId: event.contractId ?? null,
      payload: event.payload
    }
  }));

  return createCanonicalState(records);
}

export const CoreState = Object.freeze({
  load: loadCanonicalState
});

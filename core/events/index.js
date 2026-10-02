import { CoreContracts } from '../contracts/index.js';
import { createCanonicalEvents } from './canonical-events.js';

export function loadCanonicalEvents(source = []) {
  const contracts = CoreContracts.load();

  for (const event of source) {
    if (
      event.contractId !== undefined &&
      !contracts.has(event.contractId)
    ) {
      throw new Error(
        `Unknown contractId: ${event.contractId}`
      );
    }
  }

  return createCanonicalEvents(source);
}

export const CoreEvents = Object.freeze({
  load: loadCanonicalEvents
});

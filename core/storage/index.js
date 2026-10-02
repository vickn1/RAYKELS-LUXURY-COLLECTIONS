import { CoreConfiguration } from '../configuration/index.js';
import { createCanonicalStorage } from './canonical-storage.js';

export function loadCanonicalStorage(source = []) {
  const configuration = CoreConfiguration.load(source);

  const storage = configuration.list().map(config => ({
    id: `storage.${config.id}`,
    owner: config.owner,
    type: 'configuration',
    status: config.status === 'active'
      ? 'active'
      : 'disabled',
    value: {
      configurationId: config.id,
      configuration: config.value
    }
  }));

  return createCanonicalStorage(storage);
}

export const CoreStorage = Object.freeze({
  load: loadCanonicalStorage
});

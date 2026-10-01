import path from 'path';
import { ensureJsonFile, readJson, writeJson } from './data-store.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const PAYMENT_SETTINGS_FILE = path.join(
  DATA_DIR,
  'payment-settings.json'
);

const DEFAULT_PAYMENT_SETTINGS = {
  bankTransfer: {
    enabled: true,
    bankName: '',
    accountName: '',
    accountNumber: '',
    instructions: ''
  }
};

ensureJsonFile(
  PAYMENT_SETTINGS_FILE,
  DEFAULT_PAYMENT_SETTINGS
);

export function getPaymentSettings() {
  return readJson(
    PAYMENT_SETTINGS_FILE,
    DEFAULT_PAYMENT_SETTINGS
  );
}

export function savePaymentSettings(settings) {
  const current = getPaymentSettings();

  const next = {
    ...DEFAULT_PAYMENT_SETTINGS,
    ...current,
    ...settings,
    bankTransfer: {
      ...DEFAULT_PAYMENT_SETTINGS.bankTransfer,
      ...(current.bankTransfer || {}),
      ...(settings.bankTransfer || {})
    }
  };

  writeJson(PAYMENT_SETTINGS_FILE, next);

  return next;
}

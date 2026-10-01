import path from 'path';
import {
  ensureJsonFile,
  readJson,
  writeJson
} from './data-store.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const SITE_FILE = path.join(DATA_DIR, 'site.json');

const DEFAULT_SITE_SETTINGS = {
  homepage: {
    heroEnabled: true,
    heroSource: 'catalogue',
    autoRotate: true,
    rotationSeconds: 5,

    featuredProducts: {
      enabled: true,
      displayMode: 'carousel',
      autoRotate: true,
      rotationSeconds: 5,
      productIds: [],
      pinnedProductIds: []
    },

    collectionsEnabled: true,
    servicesEnabled: true
  }
};

function normalizeProductIds(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map(id => String(id || '').trim())
        .filter(Boolean)
    )
  ];
}

function normalizeSiteSettings(site) {
  const current = site && typeof site === 'object'
    ? site
    : {};

  const homepage = current.homepage &&
    typeof current.homepage === 'object'
    ? current.homepage
    : {};

  const featured = homepage.featuredProducts &&
    typeof homepage.featuredProducts === 'object'
    ? homepage.featuredProducts
    : {};

  const displayMode =
    featured.displayMode === 'grid'
      ? 'grid'
      : 'carousel';

  const rotationSeconds =
    Number.isFinite(Number(featured.rotationSeconds)) &&
    Number(featured.rotationSeconds) > 0
      ? Number(featured.rotationSeconds)
      : DEFAULT_SITE_SETTINGS.homepage
          .featuredProducts.rotationSeconds;

  return {
    ...current,

    homepage: {
      ...DEFAULT_SITE_SETTINGS.homepage,
      ...homepage,

      featuredProducts: {
        ...DEFAULT_SITE_SETTINGS.homepage.featuredProducts,
        ...featured,

        displayMode,
        autoRotate: featured.autoRotate !== false,
        rotationSeconds,

        productIds: normalizeProductIds(
          featured.productIds
        ),

        pinnedProductIds: normalizeProductIds(
          featured.pinnedProductIds
        )
      },

      collectionsEnabled:
        homepage.collectionsEnabled !== false,

      servicesEnabled:
        homepage.servicesEnabled !== false
    }
  };
}

ensureJsonFile(
  SITE_FILE,
  {
    template: 'raykels-luxury',
    templateVersion: '2.0.0',
    brand: {
      name: 'RAYKELS LUXURY COLLECTIONS',
      shortName: 'RAYKELS'
    },
    catalogue: {
      mainCategories: [
        'hair',
        'bags',
        'shoes'
      ],
      secondaryCategories: [
        'children'
      ]
    },
    services: [],
    ...DEFAULT_SITE_SETTINGS
  }
);

export function getSiteSettings() {
  return normalizeSiteSettings(
    readJson(SITE_FILE, {})
  );
}

export function saveSiteSettings(settings) {
  const current = getSiteSettings();

  const next = normalizeSiteSettings({
    ...current,
    ...settings,
    homepage: {
      ...current.homepage,
      ...(settings?.homepage || {})
    }
  });

  writeJson(SITE_FILE, next);

  return next;
}

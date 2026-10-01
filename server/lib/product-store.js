import fs from 'node:fs';
import path from 'node:path';

const DATA_FILE = path.resolve(
  process.cwd(),
  'data/products.json'
);

function ensureStore() {
  const directory = path.dirname(DATA_FILE);

  fs.mkdirSync(directory, { recursive: true });

  if (!fs.existsSync(DATA_FILE)) {
    writeStore({ products: [] });
  }
}

function readStore() {
  ensureStore();

  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(raw);

  if (!data || !Array.isArray(data.products)) {
    throw new Error('Product store is invalid.');
  }

  return data;
}

function writeStore(data) {
  const directory = path.dirname(DATA_FILE);

  fs.mkdirSync(directory, { recursive: true });

  const temporaryFile = `${DATA_FILE}.tmp`;

  fs.writeFileSync(
    temporaryFile,
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8'
  );

  fs.renameSync(temporaryFile, DATA_FILE);
}

export function listProducts() {
  return readStore().products;
}

export function findProduct(id) {
  return listProducts().find(
    product => product.id === id
  ) || null;
}

export function createProduct(product) {
  const data = readStore();

  if (data.products.some(item => item.id === product.id)) {
    throw new Error(`Product "${product.id}" already exists.`);
  }

  data.products.push(product);
  writeStore(data);

  return product;
}

export function updateProduct(id, product) {
  const data = readStore();

  const index = data.products.findIndex(
    item => item.id === id
  );

  if (index === -1) {
    return null;
  }

  data.products[index] = product;
  writeStore(data);

  return product;
}

export function deleteProduct(id) {
  const data = readStore();

  const index = data.products.findIndex(
    item => item.id === id
  );

  if (index === -1) {
    return null;
  }

  const [removed] = data.products.splice(index, 1);

  writeStore(data);

  return removed;
}

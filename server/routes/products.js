import express from 'express';

import {
  listProducts,
  findProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../lib/product-store.js';

import { validateProduct } from '../lib/product-schema.js';

const router = express.Router();

function sendValidationError(res, validation) {
  return res.status(400).json({
    error: 'Invalid product.',
    details: validation.errors
  });
}

router.get('/', (req, res) => {
  res.json({
    products: listProducts()
  });
});

router.get('/:id', (req, res) => {
  const product = findProduct(req.params.id);

  if (!product) {
    return res.status(404).json({
      error: 'Product not found.'
    });
  }

  return res.json(product);
});

router.post('/', (req, res) => {
  const validation = validateProduct(req.body);

  if (!validation.valid) {
    return sendValidationError(res, validation);
  }

  if (!req.body.id) {
    return res.status(400).json({
      error: 'Product id is required.'
    });
  }

  if (findProduct(req.body.id)) {
    return res.status(409).json({
      error: 'Product already exists.'
    });
  }

  const now = new Date().toISOString();

  const product = {
    ...req.body,
    createdAt: req.body.createdAt || now,
    updatedAt: now
  };

  createProduct(product);

  return res.status(201).json(product);
});

router.put('/:id', (req, res) => {
  const existing = findProduct(req.params.id);

  if (!existing) {
    return res.status(404).json({
      error: 'Product not found.'
    });
  }

  const candidate = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString()
  };

  const validation = validateProduct(candidate);

  if (!validation.valid) {
    return sendValidationError(res, validation);
  }

  const product = updateProduct(
    existing.id,
    candidate
  );

  return res.json(product);
});

router.delete('/:id', (req, res) => {
  const product = deleteProduct(req.params.id);

  if (!product) {
    return res.status(404).json({
      error: 'Product not found.'
    });
  }

  return res.json({
    success: true,
    product
  });
});

export default router;

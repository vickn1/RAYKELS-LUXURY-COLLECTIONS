import express from 'express';
import multer from 'multer';

import {
  findProduct,
  updateProduct
} from '../lib/product-store.js';

import {
  saveMedia
} from '../lib/media-store.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 20,
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const allowed = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]);

    if (!allowed.has(file.mimetype)) {
      return callback(
        new Error('Unsupported media type.')
      );
    }

    callback(null, true);
  }
});

router.post(
  '/products/:productId',
  upload.array('media', 20),
  (req, res) => {
    const product = findProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found.'
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        error: 'No media files uploaded.'
      });
    }

    const saved = [];

    try {
      for (const file of req.files) {
        const media = saveMedia({
          productId: product.id,
          mimeType: file.mimetype,
          size: file.size,
          buffer: file.buffer
        });

        saved.push(media);
      }

      const images = Array.isArray(product.images)
        ? [...product.images]
        : [];

      const videos = Array.isArray(product.videos)
        ? [...product.videos]
        : [];

      for (const media of saved) {
        if (media.type === 'image') {
          images.push(media);
        } else {
          videos.push(media);
        }
      }

      const updatedProduct = {
        ...product,
        images,
        videos,
        updatedAt: new Date().toISOString()
      };

      updateProduct(product.id, updatedProduct);

      return res.status(201).json({
        success: true,
        media: saved,
        product: updatedProduct
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message || 'Media upload failed.'
      });
    }
  }
);

export default router;

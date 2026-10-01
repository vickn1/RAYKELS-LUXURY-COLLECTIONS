import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ensureJsonFile, readJson, writeJson, createId } from './server/lib/data-store.js';
import { validateProduct } from './server/lib/product-schema.js';
import { validateOrder } from './server/lib/order-schema.js';
import {
  validateRequestedQuantity,
  decrementStock
} from './server/lib/inventory.js';
import {
  getPaymentSettings,
  savePaymentSettings
} from './server/lib/payment-settings.js';
import {
  getSiteSettings,
  saveSiteSettings
} from './server/lib/site-settings.js';

import {
  recordAnalyticsEvent,
  getAnalyticsSummary,
  getAnalyticsEvents,
  isAllowedEvent
} from './server/lib/analytics.js';

import {
  getAdminCredentials,
  verifyPassword,
  isLoginRateLimited,
  recordFailedLogin,
  clearLoginAttempts,
  createAdminSession,
  destroyAdminSession,
  getSessionCookieName,
  getSessionTtl,
  requireAdmin
} from './server/lib/admin-auth.js';

const app = express();

const PORT = process.env.PORT || 3000;

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

const PRODUCTS_FILE =
  path.join(DATA_DIR, 'products.json');

const ORDERS_FILE =
  path.join(DATA_DIR, 'orders.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, 'products'), {
  recursive: true
});
fs.mkdirSync(path.join(UPLOADS_DIR, 'hero'), {
  recursive: true
});

ensureJsonFile(PRODUCTS_FILE, {
  products: []
});

ensureJsonFile(ORDERS_FILE, {
  orders: []
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');

  if (!origin) {
    return res.status(403).json({
      error: 'Same-origin request required.'
    });
  }

  const expectedOrigin =
    `${req.protocol}://${req.get('host')}`;

  if (origin !== expectedOrigin) {
    return res.status(403).json({
      error: 'Cross-origin request blocked.'
    });
  }

  next();
}

app.use(
  '/uploads',
  express.static(UPLOADS_DIR)
);

const SITE_FILE = path.join(DATA_DIR, 'site.json');

ensureJsonFile(SITE_FILE, {
  template: 'raykels-luxury',
  templateVersion: '2.0.0',
  brand: {
    name: 'RAYKELS LUXURY COLLECTIONS',
    shortName: 'RAYKELS'
  },
  catalogue: {
    mainCategories: ['hair', 'bags', 'shoes'],
    secondaryCategories: ['children']
  },
  services: [],
  homepage: {
    heroEnabled: true,
    heroSource: 'catalogue',
    autoRotate: true,
    rotationSeconds: 5
  }
});

app.get('/api/site', (req, res) => {
  try {
    const site = readJson(SITE_FILE, {});
    res.json(site);
  } catch (error) {
    console.error('Site configuration error:', error);
    res.status(500).json({
      error: 'Could not load site configuration.'
    });
  }
});


app.get('/api/admin/site-settings', requireAdmin, (req, res) => {
  try {
    res.json(getSiteSettings());
  } catch (error) {
    console.error('Admin site settings load error:', error);
    res.status(500).json({
      error: 'Could not load site settings.'
    });
  }
});

app.put(
  '/api/admin/site-settings',
  requireAdmin,
  requireSameOrigin,
  (req, res) => {
    try {
      const incoming = req.body || {};

      const settings = saveSiteSettings({
        homepage: incoming.homepage || {}
      });

      res.json(settings);
    } catch (error) {
      console.error('Admin site settings save error:', error);
      res.status(500).json({
        error: 'Could not save site settings.'
      });
    }
  }
);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Raykels Admin API',
    time: new Date().toISOString()
  });
});

app.post('/api/admin/login', (req, res) => {
  try {
    if (isLoginRateLimited(req)) {
      return res.status(429).json({
        error: 'Too many login attempts. Please try again later.'
      });
    }

    const credentials = getAdminCredentials();

    if (
      !credentials ||
      !credentials.username ||
      !credentials.password
    ) {
      return res.status(503).json({
        error: 'Administrator account has not been configured.'
      });
    }

    const username = String(req.body?.username || '');
    const password = String(req.body?.password || '');

    if (
      username !== credentials.username ||
      !verifyPassword(password, credentials.password)
    ) {
      recordFailedLogin(req);

      return res.status(401).json({
        error: 'Invalid administrator credentials.'
      });
    }

    clearLoginAttempts(req);

    const session = createAdminSession(req);
    const maxAge = Math.floor(getSessionTtl() / 1000);
    const secure = process.env.NODE_ENV === 'production'
      ? '; Secure'
      : '';

    res.setHeader(
      'Set-Cookie',
      `${getSessionCookieName()}=${encodeURIComponent(session.token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`
    );

    res.json({
      authenticated: true,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Admin login error:', error);

    res.status(500).json({
      error: 'Administrator login failed.'
    });
  }
});

app.post('/api/admin/logout', requireAdmin, requireSameOrigin, (req, res) => {
  try {
    destroyAdminSession(req);

    res.setHeader(
      'Set-Cookie',
      `${getSessionCookieName()}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
    );

    res.json({
      authenticated: false
    });
  } catch (error) {
    console.error('Admin logout error:', error);

    res.status(500).json({
      error: 'Administrator logout failed.'
    });
  }
});

app.get('/api/admin/session', requireAdmin, (req, res) => {
  res.json({
    authenticated: true,
    expiresAt: req.adminSession.expiresAt
  });
});

/* =========================================================
 * ADMIN PAYMENT SETTINGS
 * Bank details are private admin-managed configuration.
 * ======================================================= */

app.get('/api/admin/payment-settings', requireAdmin, (req, res) => {
  try {
    const settings = getPaymentSettings();

    res.json(settings);
  } catch (error) {
    console.error('Payment settings load error:', error);

    res.status(500).json({
      error: 'Could not load payment settings.'
    });
  }
});

app.put(
  '/api/admin/payment-settings',
  requireAdmin,
  requireSameOrigin,
  (req, res) => {
    try {
      const incoming = req.body || {};
      const bankTransfer = incoming.bankTransfer || {};

      const settings = savePaymentSettings({
        bankTransfer: {
          enabled:
            bankTransfer.enabled !== false,

          bankName:
            String(bankTransfer.bankName || '').trim(),

          accountName:
            String(bankTransfer.accountName || '').trim(),

          accountNumber:
            String(bankTransfer.accountNumber || '').trim(),

          instructions:
            String(bankTransfer.instructions || '').trim()
        }
      });

      res.json(settings);
    } catch (error) {
      console.error('Payment settings save error:', error);

      res.status(500).json({
        error: 'Could not save payment settings.'
      });
    }
  }
);


/* =========================================================
 * PUBLIC PAYMENT SETTINGS
 * Read-only customer-facing payment information.
 * ======================================================= */

app.post('/api/analytics/events', (req, res) => {
  try {
    const body = req.body || {};
    const event = String(body.event || '').trim();
    const visitorId = String(body.visitorId || '').trim();
    const sessionId = String(body.sessionId || '').trim();

    if (!event || !isAllowedEvent(event)) {
      return res.status(400).json({
        error: 'Unsupported analytics event.'
      });
    }

    if (!visitorId || !sessionId) {
      return res.status(400).json({
        error: 'Analytics visitor and session identifiers are required.'
      });
    }

    const savedEvent = recordAnalyticsEvent({
      event,
      visitorId,
      sessionId,
      metadata: body.metadata
    });

    res.status(201).json({
      success: true,
      event: savedEvent
    });
  } catch (error) {
    console.error('Analytics event error:', error);

    res.status(400).json({
      error: error.message || 'Could not record analytics event.'
    });
  }
});

app.get(
  '/api/admin/analytics',
  requireAdmin,
  (req, res) => {
    try {
      res.json(getAnalyticsSummary());
    } catch (error) {
      console.error('Analytics summary error:', error);

      res.status(500).json({
        error: 'Could not load analytics.'
      });
    }
  }
);

app.get(
  '/api/admin/analytics/events',
  requireAdmin,
  (req, res) => {
    try {
      const limit = Number(req.query.limit || 100);

      res.json({
        events: getAnalyticsEvents(limit)
      });
    } catch (error) {
      console.error('Analytics events error:', error);

      res.status(500).json({
        error: 'Could not load analytics events.'
      });
    }
  }
);

app.get('/api/payment-settings', (req, res) => {
  try {
    const settings = getPaymentSettings();
    const transfer = settings?.bankTransfer || {};

    res.json({
      bankTransfer: {
        enabled: transfer.enabled !== false,
        bankName: String(transfer.bankName || ''),
        accountName: String(transfer.accountName || ''),
        accountNumber: String(transfer.accountNumber || ''),
        instructions: String(transfer.instructions || '')
      }
    });
  } catch (error) {
    console.error(
      'Public payment settings error:',
      error
    );

    res.status(500).json({
      error: 'Could not load payment settings.'
    });
  }
});

app.get('/api/products', (req, res) => {
  try {
    const data =
      JSON.parse(
        fs.readFileSync(
          PRODUCTS_FILE,
          'utf8'
        )
      );

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Could not load products.'
    });
  }
});


app.post('/api/products', requireAdmin, requireSameOrigin, (req, res) => {
  try {
    const data = readJson(PRODUCTS_FILE, { products: [] });
    const product = { ...req.body };

    const validation = validateProduct(product);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid product.',
        details: validation.errors
      });
    }

    if (!product.id) {
      product.id = createId('product');
    }

    const existing = data.products.findIndex(
      item => item.id === product.id
    );

    if (existing !== -1) {
      return res.status(409).json({
        error: 'A product with this ID already exists.'
      });
    }

    const now = new Date().toISOString();

    product.createdAt = now;
    product.updatedAt = now;

    data.products.push(product);
    writeJson(PRODUCTS_FILE, data);

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Failed to create product.'
    });
  }
});


app.put('/api/products/:id', requireAdmin, requireSameOrigin, (req, res) => {
  try {
    const data = readJson(PRODUCTS_FILE, { products: [] });

    const index = data.products.findIndex(
      item => item.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        error: 'Product not found.'
      });
    }

    const updates = { ...req.body };

    delete updates.id;

    const candidate = {
      ...data.products[index],
      ...updates
    };

    const validation = validateProduct(
      candidate,
      { partial: true }
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid product update.',
        details: validation.errors
      });
    }

    candidate.id = data.products[index].id;
    candidate.updatedAt = new Date().toISOString();

    // Remove physical media files that are no longer referenced
    // by the updated product.
    const oldProduct = data.products[index];

    const oldMedia = [
      ...(Array.isArray(oldProduct.images) ? oldProduct.images : []),
      ...(Array.isArray(oldProduct.videos) ? oldProduct.videos : [])
    ];

    const newMediaUrls = new Set([
      ...(Array.isArray(candidate.images) ? candidate.images : []),
      ...(Array.isArray(candidate.videos) ? candidate.videos : [])
    ].map(item => {
      return typeof item === 'string' ? item : item?.url;
    }).filter(Boolean));

    for (const media of oldMedia) {
      const mediaUrl = typeof media === 'string' ? media : media?.url;

      if (!mediaUrl || newMediaUrls.has(mediaUrl)) {
        continue;
      }

      try {
        const pathname = new URL(mediaUrl, 'http://localhost').pathname;

        if (!pathname.startsWith('/uploads/products/')) {
          continue;
        }

        const relativePath = pathname
          .replace(/^\/uploads\//, '')
          .split('/')
          .map(part => decodeURIComponent(part))
          .join(path.sep);

        const filePath = path.resolve(UPLOADS_DIR, relativePath);
        const productsRoot = path.resolve(UPLOADS_DIR, 'products');

        if (
          filePath.startsWith(productsRoot + path.sep) &&
          fs.existsSync(filePath) &&
          fs.statSync(filePath).isFile()
        ) {
          fs.unlinkSync(filePath);
          console.log('Removed unused product media:', filePath);
        }
      } catch (mediaError) {
        console.error('Could not remove unused product media:', mediaError);
      }
    }

    data.products[index] = candidate;

    writeJson(PRODUCTS_FILE, data);

    res.json(candidate);
  } catch (error) {
    console.error('Update product error:', error);

    res.status(500).json({
      error: 'Could not update product.'
    });
  }
});

app.delete('/api/products/:id', requireAdmin, requireSameOrigin, (req, res) => {
  try {
    const data = readJson(PRODUCTS_FILE, { products: [] });

    const index = data.products.findIndex(
      item => item.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        error: 'Product not found.'
      });
    }

    const product = data.products[index];

    data.products.splice(index, 1);

    writeJson(PRODUCTS_FILE, data);

    const productUploadDir = path.join(
      UPLOADS_DIR,
      'products',
      product.id
    );

    if (fs.existsSync(productUploadDir)) {
      fs.rmSync(productUploadDir, {
        recursive: true,
        force: true
      });
    }

    res.json({
      success: true,
      id: product.id,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Delete product error:', error);

    res.status(500).json({
      error: 'Could not delete product.'
    });
  }
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = req.params.productId;

    if (!productId) {
      return cb(new Error('Product ID is required.'));
    }

    const dir = path.join(
      UPLOADS_DIR,
      'products',
      productId
    );

    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname).toLowerCase();

    const baseName =
      path.basename(
        file.originalname,
        extension
      )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const filename =
      `${Date.now()}-${baseName || 'image'}${extension}`;

    cb(null, filename);
  }
});

const productUpload = multer({
  storage: productStorage,

  limits: {
    fileSize: 100 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowed =
      [
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ];

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error(
          'Only JPG, PNG, WebP, MP4, WebM and MOV videos are allowed.'
        )
      );
    }

    cb(null, true);
  }
});


const pendingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadId = req.params.uploadId;
    if (!uploadId) return cb(new Error('Upload ID is required.'));

    const dir = path.join(
      UPLOADS_DIR,
      'products',
      '_pending',
      uploadId
    );

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    cb(
      null,
      `${Date.now()}-${baseName || 'image'}${extension}`
    );
  }
});

const pendingUpload = multer({
  storage: pendingStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error('Only JPG, PNG and WebP images are allowed.')
      );
    }

    cb(null, true);
  }
});

app.post(
  '/api/uploads/pending/:uploadId',
  requireAdmin,
  requireSameOrigin,
  pendingUpload.array('images', 20),
  (req, res) => {
    try {
      const uploadId = req.params.uploadId;

      const files = (req.files || []).map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/products/_pending/${uploadId}/${file.filename}`
      }));

      res.json({
        ok: true,
        uploadId,
        files
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Temporary image upload failed.'
      });
    }
  }
);

app.post(
  '/api/uploads/products/:productId',
  requireAdmin,
  requireSameOrigin,
  productUpload.array('images', 20),
  (req, res) => {
    try {
      const productId =
        req.params.productId;

      const data =
        JSON.parse(
          fs.readFileSync(
            PRODUCTS_FILE,
            'utf8'
          )
        );

      const product =
        data.products.find(
          item => item.id === productId
        );

      if (!product) {
        return res.status(404).json({
          error: 'Product not found.'
        });
      }

      if (!Array.isArray(product.images)) {
        product.images = [];
      }

      if (!Array.isArray(product.videos)) {
        product.videos = [];
      }

      const uploadedImages = [];
      const uploadedVideos = [];

      for (const [index, file] of (req.files || []).entries()) {
        const url =
          `/uploads/products/${productId}/${file.filename}`;

        if (file.mimetype.startsWith('video/')) {
          uploadedVideos.push({
            id:
              `${productId}-video-${Date.now()}-${index}`,

            url,

            type: 'video',

            label: 'product',

            title:
              `${product.name} video ${product.videos.length + uploadedVideos.length + 1}`
          });
        } else {
          uploadedImages.push({
            id:
              `${productId}-image-${Date.now()}-${index}`,

            url,

            type: 'image',

            label: 'product',

            alt:
              `${product.name} image ${product.images.length + uploadedImages.length + 1}`
          });
        }
      }

      product.images.push(...uploadedImages);
      product.videos.push(...uploadedVideos);

      fs.writeFileSync(
        PRODUCTS_FILE,
        JSON.stringify(data, null, 2)
      );

      res.status(201).json({
        success: true,
        productId,
        images: uploadedImages,
        videos: uploadedVideos
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message ||
          'Could not upload product images.'
      });
    }
  }
);

app.post('/api/orders', (req, res) => {
  try {
    const productsData = readJson(
      PRODUCTS_FILE,
      { products: [] }
    );

    const ordersData = readJson(
      ORDERS_FILE,
      { orders: [] }
    );

    const incoming = req.body || {};

    const itemsInput = Array.isArray(incoming.items)
      ? incoming.items
      : [];

    if (itemsInput.length === 0) {
      return res.status(400).json({
        error: 'Order must contain at least one item.'
      });
    }

    const fulfilment = incoming.fulfilment || {};

    const order = {
      id: createId('order'),
      customer: incoming.customer || {},
      fulfilment,
      payment: incoming.payment || {},
      items: [],
      totals: {
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        currency: 'NGN'
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    /*
     * Resolve products and variants first.
     * Duplicate product/variant lines are aggregated so stock
     * validation cannot be bypassed by splitting quantities.
     */
    const resolvedItems = [];
    const quantityByStockKey = new Map();

    for (const item of itemsInput) {
      const product = productsData.products.find(
        product => product.id === item.productId
      );

      if (!product) {
        return res.status(400).json({
          error: `Product not found: ${item.productId}`
        });
      }

      let variant = null;

      if (item.variantId) {
        variant = Array.isArray(product.variants)
          ? product.variants.find(
              entry => entry.id === item.variantId
            )
          : null;

        if (!variant) {
          return res.status(400).json({
            error:
              `Variant not found for product: ${product.name}`
          });
        }
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          error: `Invalid quantity for: ${product.name}`
        });
      }

      const stockKey =
        `${product.id}::${variant?.id || 'product'}`;

      quantityByStockKey.set(
        stockKey,
        (quantityByStockKey.get(stockKey) || 0) + quantity
      );

      resolvedItems.push({
        item,
        product,
        variant,
        quantity,
        stockKey
      });
    }

    /*
     * Aggregate unique product/variant requests for later admin
     * confirmation. Stock is intentionally NOT committed here.
     * Inventory is re-checked and decremented only when an
     * administrator confirms the order.
     */
    const stockRequests = new Map();

    for (const resolved of resolvedItems) {
      if (stockRequests.has(resolved.stockKey)) {
        continue;
      }

      stockRequests.set(resolved.stockKey, resolved);
    }

    /*
     * Build the authoritative order using server-side
     * product, variant and pricing data.
     */
    for (const resolved of resolvedItems) {
      const {
        product,
        variant,
        quantity
      } = resolved;

      const basePrice =
        variant && variant.price !== undefined
          ? Number(variant.price)
          : Number(product.pricing?.price || 0);

      const salePrice =
        variant && variant.salePrice !== undefined
          ? variant.salePrice
          : product.pricing?.salePrice;

      const unitPrice =
        salePrice !== null &&
        salePrice !== undefined &&
        Number(salePrice) >= 0
          ? Number(salePrice)
          : basePrice;

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          error: `Invalid price for: ${product.name}`
        });
      }

      const subtotal = unitPrice * quantity;

      order.items.push({
        productId: product.id,
        productName: product.name,
        variantId: variant?.id || null,
        variant: variant
          ? {
              name: variant.name || '',
              colour: variant.colour || '',
              size: variant.size || '',
              length: variant.length || '',
              material: variant.material || ''
            }
          : null,
        quantity,
        unitPrice,
        subtotal
      });

      order.totals.subtotal += subtotal;
    }

    /*
     * Delivery fee is determined during admin review.
     * Customer checkout does not establish the final charge.
     */
    order.totals.deliveryFee = 0;
    order.totals.total = order.totals.subtotal;

    const validation = validateOrder(order);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid order.',
        details: validation.errors
      });
    }

    /*
     * Customer submission creates only the pending request.
     * Inventory remains untouched until administrator confirmation.
     */
    const originalOrders =
      JSON.stringify(ordersData);

    ordersData.orders.push(order);

    try {
      writeJson(ORDERS_FILE, ordersData);
    } catch (writeError) {
      try {
        writeJson(
          ORDERS_FILE,
          JSON.parse(originalOrders)
        );
      } catch (rollbackOrdersError) {
        console.error(
          'Order rollback failed:',
          rollbackOrdersError
        );
      }

      throw writeError;
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);

    res.status(500).json({
      error: 'Could not create order.'
    });
  }
});


app.post('/api/orders/:id/confirm', requireAdmin, requireSameOrigin, (req, res) => {
  try {
    const productsData = readJson(
      PRODUCTS_FILE,
      { products: [] }
    );

    const ordersData = readJson(
      ORDERS_FILE,
      { orders: [] }
    );

    const order = ordersData.orders.find(
      entry => entry.id === req.params.id
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.'
      });
    }

    if (order.status !== 'pending') {
      return res.status(409).json({
        error: `Only pending orders can be confirmed. Current status: ${order.status}.`
      });
    }

    const incoming = req.body || {};
    const confirmedQuantities =
      incoming.confirmedQuantities &&
      typeof incoming.confirmedQuantities === 'object'
        ? incoming.confirmedQuantities
        : {};

    const deliveryFee = Number(incoming.deliveryFee || 0);

    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
      return res.status(400).json({
        error: 'Invalid delivery fee.'
      });
    }

    /*
     * Work on cloned data first. Nothing is written until every
     * product, quantity, price and stock check succeeds.
     */
    const productsSnapshot =
      JSON.stringify(productsData);

    const ordersSnapshot =
      JSON.stringify(ordersData);

    const confirmedItems = [];
    const stockChanges = [];

    for (const item of order.items) {
      const product = productsData.products.find(
        entry => entry.id === item.productId
      );

      if (!product) {
        return res.status(409).json({
          error: `Product no longer exists: ${item.productName}`
        });
      }

      let variant = null;

      if (item.variantId) {
        variant = Array.isArray(product.variants)
          ? product.variants.find(
              entry => entry.id === item.variantId
            )
          : null;

        if (!variant) {
          return res.status(409).json({
            error:
              `Variant no longer exists for product: ${product.name}`
          });
        }
      }

      const stockKey =
        `${product.id}::${variant?.id || 'product'}`;

      const requestedQuantity =
        Number(item.quantity);

      const rawConfirmed =
        Object.prototype.hasOwnProperty.call(
          confirmedQuantities,
          stockKey
        )
          ? Number(confirmedQuantities[stockKey])
          : requestedQuantity;

      if (
        !Number.isInteger(rawConfirmed) ||
        rawConfirmed < 1
      ) {
        return res.status(400).json({
          error:
            `Invalid confirmed quantity for: ${product.name}`
        });
      }

      if (rawConfirmed > requestedQuantity) {
        return res.status(400).json({
          error:
            `Confirmed quantity cannot exceed requested quantity for: ${product.name}`
        });
      }


      const basePrice =
        variant && variant.price !== undefined
          ? Number(variant.price)
          : Number(product.pricing?.price || 0);

      const salePrice =
        variant && variant.salePrice !== undefined
          ? variant.salePrice
          : product.pricing?.salePrice;

      const unitPrice =
        salePrice !== null &&
        salePrice !== undefined &&
        Number(salePrice) >= 0
          ? Number(salePrice)
          : basePrice;

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(409).json({
          error: `Invalid current price for: ${product.name}`
        });
      }

      const subtotal =
        unitPrice * rawConfirmed;

      confirmedItems.push({
        ...item,
        unitPrice,
        quantity: rawConfirmed,
        subtotal,
        requestedQuantity,
        confirmedQuantity: rawConfirmed
      });

    }

    const subtotal = confirmedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    order.items = confirmedItems;
    order.confirmation = {
      confirmedAt: new Date().toISOString(),
      confirmedBy: 'admin',
      adminNote:
        typeof incoming.adminNote === 'string'
          ? incoming.adminNote.trim()
          : ''
    };

    order.totals = {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      currency: 'NGN'
    };

    order.status = 'confirmed';
    order.updatedAt = new Date().toISOString();

    try {
      writeJson(PRODUCTS_FILE, productsData);
      writeJson(ORDERS_FILE, ordersData);
    } catch (writeError) {
      try {
        writeJson(
          PRODUCTS_FILE,
          JSON.parse(productsSnapshot)
        );
      } catch (rollbackProductsError) {
        console.error(
          'Product rollback failed:',
          rollbackProductsError
        );
      }

      try {
        writeJson(
          ORDERS_FILE,
          JSON.parse(ordersSnapshot)
        );
      } catch (rollbackOrdersError) {
        console.error(
          'Order rollback failed:',
          rollbackOrdersError
        );
      }

      throw writeError;
    }

    res.json(order);
  } catch (error) {
    console.error(
      'Confirm order error:',
      error
    );

    res.status(500).json({
      error: 'Could not confirm order.'
    });
  }
});

app.get('/api/orders/:id', requireAdmin, (req, res) => {
  try {
    const data = readJson(
      ORDERS_FILE,
      { orders: [] }
    );

    const order = data.orders.find(
      entry => entry.id === req.params.id
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.'
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Load order error:', error);

    res.status(500).json({
      error: 'Could not load order.'
    });
  }
});

app.get('/api/orders', requireAdmin, (req, res) => {
  try {
    const data =
      JSON.parse(
        fs.readFileSync(
          ORDERS_FILE,
          'utf8'
        )
      );

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Could not load orders.'
    });
  }
});

app.use(
  express.static(ROOT_DIR)
);

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log(
    'RAYKELS ADMIN SERVER RUNNING'
  );
  console.log(
    `http://localhost:${PORT}`
  );
  console.log('');
});

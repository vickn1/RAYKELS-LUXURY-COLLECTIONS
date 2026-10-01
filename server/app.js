import express from 'express';
import productsRouter from './routes/products.js';
import uploadsRouter from './routes/uploads.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use('/api/products', productsRouter);
app.use('/api/uploads', uploadsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'raykels-api'
  });
});

export default app;

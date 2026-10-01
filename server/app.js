import express from 'express';
import productsRouter from './routes/products.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use('/api/products', productsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'raykels-api'
  });
});

export default app;

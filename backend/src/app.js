const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy — trust its
// X-Forwarded-* headers so req.ip/req.protocol reflect the real client,
// not the proxy. Needed for accurate rate limiting and for constructing
// correct https:// URLs (e.g. product image links).
app.set('trust proxy', 1);

// The frontend (Vercel) and backend (Render) are deliberately different
// origins. Helmet's default Cross-Origin-Resource-Policy is "same-origin",
// which blocks the frontend's <img> tags from loading product images
// served from here. Product images are public by design, so allow
// cross-origin embedding.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.clientUrls,
    credentials: true,
  })
);
app.use(express.json());
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const addressRoutes = require('./routes/address.routes');
const shopRoutes = require('./routes/shop.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const couponRoutes = require('./routes/coupon.routes');
const notificationRoutes = require('./routes/notification.routes');
const ownerRoutes = require('./routes/owner.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    name: 'Localit API',
    description: 'Local Multi-Shop Delivery Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Centralized 404 & error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;

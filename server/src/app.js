const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const healthRoutes = require('./routes/health.routes');

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.use('/api', healthRoutes);

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

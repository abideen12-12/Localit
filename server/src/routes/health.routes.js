const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

router.get('/health', async (req, res, next) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        server: 'healthy',
        database: 'connected (PostgreSQL)',
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      services: {
        server: 'healthy',
        database: 'disconnected',
      },
      error: error.message,
    });
  }
});

module.exports = router;

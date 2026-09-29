require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Localit API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Localit API] Health check endpoint: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down Localit server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

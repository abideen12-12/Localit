/**
 * Centralized error handler middleware.
 * Sanitizes errors and returns standard JSON response without leaking stack traces in production.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Specific handling for Prisma unique constraint violations (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
  }

  // Specific handling for Prisma not found errors (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record not found.',
    });
  }

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  return res.status(statusCode).json(response);
}

module.exports = errorHandler;

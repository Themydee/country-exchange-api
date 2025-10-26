/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.message.includes('API request timed out') || err.message.includes('ECONNABORTED')) {
    statusCode = 503;
    message = 'External data source unavailable';
  }

  if (err.message.includes('Failed to fetch')) {
    statusCode = 503;
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(err.details && { details: err.details })
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Route not found'
  });
}

/**
 * Create validation error
 */
function createValidationError(errors) {
  const error = new Error('Validation failed');
  error.statusCode = 400;
  error.details = errors;
  return error;
}

/**
 * Create not found error
 */
function createNotFoundError(resource = 'Resource') {
  const error = new Error(`${resource} not found`);
  error.statusCode = 404;
  return error;
}

/**
 * Create service unavailable error
 */
function createServiceUnavailableError(details) {
  const error = new Error('External data source unavailable');
  error.statusCode = 503;
  error.details = details;
  return error;
}

export { errorHandler, notFoundHandler, createValidationError, createNotFoundError, createServiceUnavailableError };
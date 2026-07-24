function errorHandler(err, req, res, next) {
  const isDatabaseError =
    err &&
    (err.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'EHOSTUNREACH' ||
      err.code === '57P01' ||
      err.code === '08006' ||
      err.code === '08001' ||
      /database|postgres|connection|timeout/i.test(err.message || ''));

  console.error(`[${new Date().toISOString()}] [ERR] ${req.method} ${req.originalUrl} ::`, err);

  if (isDatabaseError) {
    return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
  }
  if (err.name === 'MulterError' || /image/i.test(err.message || '')) {
    return res.status(400).json({ error: err.message });
  }
  const status = err.status || 500;
  return res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
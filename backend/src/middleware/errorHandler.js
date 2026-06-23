function errorHandler(err, req, res, next) {
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos (apertura duplicada)' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;

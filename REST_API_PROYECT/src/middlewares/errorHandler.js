function errorHandler(err, req, res, next) {
  // Errores nuestros (404, 400...)
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  // Nickname duplicado (RN-01)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor unico' });
  }
  // Campo obligatorio vacío, rol inválido, etc.
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Datos invalidos',
      detalles: err.errors.map((e) => e.message)
    });
  }
  // Cualquier otra cosa: no exponemos detalles internos
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

export { errorHandler };
// Middleware para manejo global de errores
export const errorHandler = (error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
};

// Middleware para manejar rutas no encontradas
export const notFound = (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
};

// Middleware para validación de datos
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Los siguientes campos son requeridos: ${missingFields.join(', ')}` 
      });
    }
    
    next();
  };
};

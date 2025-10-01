import upload from '../config/multer.js';

// Middleware para subir archivo
export const uploadMiddleware = upload.single('file');

// Subir archivo
export const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    res.json({
      message: 'Archivo subido exitosamente',
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

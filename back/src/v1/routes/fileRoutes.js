import express from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import * as fileController from '../../controllers/fileController.js';

const router = express.Router();

// Ruta protegida para subir archivos
router.post('/upload', 
  authenticateToken, 
  fileController.uploadMiddleware,
  fileController.uploadFile
);

export default router;

import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import * as estadisticaController from '../../controllers/estadisticaController.js';

const router = express.Router();

// Ruta protegida solo para administradores
router.get('/', 
  authenticateToken, 
  requireRole([1]),
  estadisticaController.getEstadisticas
);

export default router;

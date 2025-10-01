import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateRequired } from '../../middlewares/errorHandler.js';
import * as servicioController from '../../controllers/servicioController.js';

const router = express.Router();

// Rutas públicas
router.get('/', servicioController.getAllServicios);
router.get('/:id', servicioController.getServicioById);

// Rutas protegidas (solo administradores)
router.post('/', 
  authenticateToken, 
  requireRole([1]),
  validateRequired(['descripcion', 'importe']),
  servicioController.createServicio
);

router.put('/:id', 
  authenticateToken, 
  requireRole([1]),
  servicioController.updateServicio
);

router.delete('/:id', 
  authenticateToken, 
  requireRole([1]),
  servicioController.deleteServicio
);

export default router;

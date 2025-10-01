import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateRequired } from '../../middlewares/errorHandler.js';
import * as salonController from '../../controllers/salonController.js';

const router = express.Router();

// Rutas públicas
router.get('/', salonController.getAllSalones);
router.get('/:id', salonController.getSalonById);

// Rutas protegidas (solo administradores)
router.post('/', 
  authenticateToken, 
  requireRole([1]),
  validateRequired(['titulo', 'direccion', 'importe']),
  salonController.createSalon
);

router.put('/:id', 
  authenticateToken, 
  requireRole([1]),
  salonController.updateSalon
);

router.delete('/:id', 
  authenticateToken, 
  requireRole([1]),
  salonController.deleteSalon
);

export default router;

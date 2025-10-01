import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateRequired } from '../../middlewares/errorHandler.js';
import * as turnoController from '../../controllers/turnoController.js';

const router = express.Router();

// Rutas públicas
router.get('/', turnoController.getAllTurnos);
router.get('/:id', turnoController.getTurnoById);

// Rutas protegidas (solo administradores)
router.post('/', 
  authenticateToken, 
  requireRole([1]),
  validateRequired(['orden', 'hora_desde', 'hora_hasta']),
  turnoController.createTurno
);

router.put('/:id', 
  authenticateToken, 
  requireRole([1]),
  turnoController.updateTurno
);

router.delete('/:id', 
  authenticateToken, 
  requireRole([1]),
  turnoController.deleteTurno
);

export default router;

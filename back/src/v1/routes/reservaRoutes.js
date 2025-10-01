import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateRequired } from '../../middlewares/errorHandler.js';
import * as reservaController from '../../controllers/reservaController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de reservas
router.get('/', reservaController.getAllReservas);
router.get('/:id', reservaController.getReservaById);

router.post('/', 
  validateRequired(['fecha_reserva', 'salon_id', 'turno_id']),
  reservaController.createReserva
);

router.put('/:id', reservaController.updateReserva);
router.delete('/:id', reservaController.deleteReserva);

export default router;

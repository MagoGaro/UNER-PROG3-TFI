import express from 'express';
import authRoutes from './authRoutes.js';
import salonRoutes from './salonRoutes.js';
import servicioRoutes from './servicioRoutes.js';
import turnoRoutes from './turnoRoutes.js';
import reservaRoutes from './reservaRoutes.js';
import fileRoutes from './fileRoutes.js';
import estadisticaRoutes from './estadisticaRoutes.js';

const router = express.Router();

// Rutas de la API v1
router.use('/auth', authRoutes);
router.use('/salones', salonRoutes);
router.use('/servicios', servicioRoutes);
router.use('/turnos', turnoRoutes);
router.use('/reservas', reservaRoutes);
router.use('/files', fileRoutes);
router.use('/estadisticas', estadisticaRoutes);

export default router;

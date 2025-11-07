import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import * as reporteController from '../../controllers/reporteController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Generación de reportes de reservas (PDF y CSV)
 */

/**
 * @swagger
 * /api/v1/reportes/pdf:
 *   get:
 *     summary: Genera un reporte PDF de todas las reservas
 *     description: Requiere rol administrador. Genera un PDF con todas las reservas activas incluyendo datos del cliente, salón, turno y servicios.
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: No hay reservas para generar el reporte
 *       500:
 *         description: Error al generar el reporte
 */
router.get(
  '/pdf',
  authenticateToken,
  requireRole([1]),
  reporteController.generarReportePDF
);

/**
 * @swagger
 * /api/v1/reportes/csv:
 *   get:
 *     summary: Genera un reporte CSV de todas las reservas
 *     description: Requiere rol administrador. Genera un archivo CSV con todas las reservas activas incluyendo datos del cliente, salón, turno y servicios.
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV generado exitosamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: No hay reservas para generar el reporte
 *       500:
 *         description: Error al generar el reporte
 */
router.get(
  '/csv',
  authenticateToken,
  requireRole([1]),
  reporteController.generarReporteCSV
);

export default router;


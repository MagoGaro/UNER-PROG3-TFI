import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import * as estadisticaController from '../../controllers/estadisticaController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Estadísticas
 *   description: Informes estadísticos generados mediante stored procedures (solo administradores)
 */

/**
 * @swagger
 * /api/v1/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas del sistema
 *     description: Requiere rol administrador. Todas las estadísticas se generan mediante stored procedures.
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_reservas:
 *                   type: integer
 *                   example: 45
 *                   description: Total de reservas activas
 *                 reservas_por_mes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mes:
 *                         type: string
 *                         example: "2025-01"
 *                       cantidad:
 *                         type: integer
 *                         example: 5
 *                   description: Cantidad de reservas por mes (últimos 12 meses)
 *                 salones_populares:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       salon_id:
 *                         type: integer
 *                       titulo:
 *                         type: string
 *                       cantidad_reservas:
 *                         type: integer
 *                   description: Salones más populares ordenados por cantidad de reservas
 *                 ingresos_totales:
 *                   type: number
 *                   example: 1500000.00
 *                   description: Ingresos totales de todas las reservas activas
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes (solo administradores)
 *       500:
 *         description: Error interno del servidor
 */
// Ruta protegida solo para administradores
router.get('/', 
  authenticateToken, 
  requireRole([1]),
  estadisticaController.getEstadisticas
);

export default router;

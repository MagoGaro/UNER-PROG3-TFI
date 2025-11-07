import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateCreateReserva, validateUpdateReserva, validateId } from '../../middlewares/validators.js';
import * as reservaController from '../../controllers/reservaController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Gestión de reservas de salones
 */

/**
 * @swagger
 * /api/v1/reservas:
 *   get:
 *     summary: Lista todas las reservas
 *     description: Los clientes solo ven sus propias reservas. Los administradores y empleados ven todas las reservas.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   reserva_id:
 *                     type: integer
 *                     example: 1
 *                   fecha_reserva:
 *                     type: string
 *                     format: date
 *                     example: "2025-11-20"
 *                   salon_titulo:
 *                     type: string
 *                     example: "Salón Principal"
 *                   nombre:
 *                     type: string
 *                     example: "Juan"
 *                   apellido:
 *                     type: string
 *                     example: "Pérez"
 *                   hora_desde:
 *                     type: string
 *                     example: "18:00"
 *                   hora_hasta:
 *                     type: string
 *                     example: "22:00"
 *                   tematica:
 *                     type: string
 *                     example: "Superhéroes"
 *                   importe_total:
 *                     type: number
 *                     example: 150000.00
 *       401:
 *         description: Token ausente o inválido
 *       500:
 *         description: Error interno del servidor
 */
// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de reservas
router.get('/', reservaController.getAllReservas);

/**
 * @swagger
 * /api/v1/reservas/{id}:
 *   get:
 *     summary: Obtiene una reserva por ID
 *     description: Los clientes solo pueden ver sus propias reservas. Los administradores y empleados pueden ver cualquier reserva.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reserva_id:
 *                   type: integer
 *                 fecha_reserva:
 *                   type: string
 *                   format: date
 *                 salon_id:
 *                   type: integer
 *                 turno_id:
 *                   type: integer
 *                 tematica:
 *                   type: string
 *                 importe_total:
 *                   type: number
 *                 servicios:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Reserva no encontrada
 *       401:
 *         description: Token ausente o inválido
 */
router.get('/:id', validateId, reservaController.getReservaById);

/**
 * @swagger
 * /api/v1/reservas:
 *   post:
 *     summary: Crea una nueva reserva
 *     description: Cualquier usuario autenticado puede crear una reserva. Se notifica automáticamente a los administradores.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha_reserva
 *               - salon_id
 *               - turno_id
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-20"
 *               salon_id:
 *                 type: integer
 *                 example: 1
 *               turno_id:
 *                 type: integer
 *                 example: 1
 *               tematica:
 *                 type: string
 *                 example: "Superhéroes"
 *               foto_cumpleaniero:
 *                 type: string
 *                 nullable: true
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *                       example: 1
 *                     importe:
 *                       type: number
 *                       example: 15000.00
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reserva creada exitosamente"
 *                 reserva_id:
 *                   type: integer
 *                 importe_total:
 *                   type: number
 *       400:
 *         description: Datos inválidos o salón no disponible
 *       401:
 *         description: Token ausente o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', 
  validateCreateReserva,
  reservaController.createReserva
);

/**
 * @swagger
 * /api/v1/reservas/{id}:
 *   put:
 *     summary: Actualiza una reserva
 *     description: Solo los administradores pueden modificar reservas. Se notifica automáticamente al cliente cuando se actualiza.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-21"
 *               salon_id:
 *                 type: integer
 *                 example: 2
 *               turno_id:
 *                 type: integer
 *                 example: 2
 *               tematica:
 *                 type: string
 *                 example: "Princesas"
 *               foto_cumpleaniero:
 *                 type: string
 *                 nullable: true
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *                     importe:
 *                       type: number
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       400:
 *         description: Datos inválidos o salón no disponible
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes (solo administradores)
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', 
  requireRole([1]),
  validateUpdateReserva, 
  reservaController.updateReserva
);

/**
 * @swagger
 * /api/v1/reservas/{id}:
 *   delete:
 *     summary: Elimina una reserva (soft delete)
 *     description: Solo los administradores pueden eliminar reservas. Se realiza un soft delete (activo = 0).
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes (solo administradores)
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', 
  requireRole([1]),
  validateId, 
  reservaController.deleteReserva
);

export default router;

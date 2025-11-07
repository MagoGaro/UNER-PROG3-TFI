import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateCreateTurno, validateUpdateTurno, validateId } from '../../middlewares/validators.js';
import * as turnoController from '../../controllers/turnoController.js';

const router = express.Router();

// Rutas públicas
router.get('/', turnoController.getAllTurnos);
router.get('/:id', validateId, turnoController.getTurnoById);

// Rutas protegidas (administradores y empleados)
router.post('/', 
  authenticateToken, 
  requireRole([1, 2]),
  validateCreateTurno,
  turnoController.createTurno
);

router.put('/:id', 
  authenticateToken, 
  requireRole([1, 2]),
  validateUpdateTurno,
  turnoController.updateTurno
);

router.delete('/:id', 
  authenticateToken, 
  requireRole([1, 2]),
  validateId,
  turnoController.deleteTurno
);

export default router;


/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Catálogo público de turnos
 */

/**
 * @swagger
 * /api/v1/turnos:
 *   get:
 *     summary: Lista todos los turnos disponibles
 *     tags: [Turnos]
 *     security: []   # público, no requiere token
 *     responses:
 *       200:
 *         description: Lista de turnos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Turno' }
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   get:
 *     summary: Obtiene un turno por ID
 *     tags: [Turnos]
 *     security: []   # público, no requiere token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Turno' }
 *       404:
 *         description: Turno no encontrado
 */

/**
 * @swagger
 * /api/v1/turnos:
 *   post:
 *     summary: Crea un nuevo turno
 *     description: Requiere rol administrador o empleado.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orden
 *               - hora_desde
 *               - hora_hasta
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 1
 *               hora_desde:
 *                 type: string
 *                 example: "18:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "22:00"
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   put:
 *     summary: Actualiza un turno
 *     description: Requiere rol administrador o empleado.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *               hora_desde:
 *                 type: string
 *               hora_hasta:
 *                 type: string
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Turno no encontrado
 */

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   delete:
 *     summary: Elimina un turno (soft delete)
 *     description: Requiere rol administrador o empleado. Se realiza un soft delete (activo = 0).
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     responses:
 *       200:
 *         description: Turno eliminado exitosamente
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Turno no encontrado
 */

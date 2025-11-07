import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateCreateServicio, validateUpdateServicio, validateId } from '../../middlewares/validators.js';
import * as servicioController from '../../controllers/servicioController.js';

const router = express.Router();

// Rutas públicas
router.get('/', servicioController.getAllServicios);
router.get('/:id', validateId, servicioController.getServicioById);

// Rutas protegidas (administradores y empleados)
router.post('/', 
  authenticateToken, 
  requireRole([1, 2]),
  validateCreateServicio,
  servicioController.createServicio
);

router.put('/:id', 
  authenticateToken, 
  requireRole([1, 2]),
  validateUpdateServicio,
  servicioController.updateServicio
);

router.delete('/:id', 
  authenticateToken, 
  requireRole([1, 2]),
  validateId,
  servicioController.deleteServicio
);

export default router;


/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Catálogo público de servicios
 */

/**
 * @swagger
 * /api/v1/servicios:
 *   get:
 *     summary: Lista todos los servicios disponibles
 *     tags: [Servicios]
 *     security: []   # público, no requiere token
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Servicio' }
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/servicios/{id}:
 *   get:
 *     summary: Obtiene un servicio por ID
 *     tags: [Servicios]
 *     security: []   # público, no requiere token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Servicio' }
 *       404:
 *         description: Servicio no encontrado
 */

/**
 * @swagger
 * /api/v1/servicios:
 *   post:
 *     summary: Crea un nuevo servicio
 *     description: Requiere rol administrador o empleado.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - importe
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Animación temática"
 *               importe:
 *                 type: number
 *                 example: 15000.00
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */

/**
 * @swagger
 * /api/v1/servicios/{id}:
 *   put:
 *     summary: Actualiza un servicio
 *     description: Requiere rol administrador o empleado.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               importe:
 *                 type: number
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Servicio no encontrado
 */

/**
 * @swagger
 * /api/v1/servicios/{id}:
 *   delete:
 *     summary: Elimina un servicio (soft delete)
 *     description: Requiere rol administrador o empleado. Se realiza un soft delete (activo = 0).
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Servicio eliminado exitosamente
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Servicio no encontrado
 */

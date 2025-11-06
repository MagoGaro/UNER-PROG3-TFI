import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateRequired } from '../../middlewares/errorHandler.js';
import * as salonController from '../../controllers/salonController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Salones
 *   description: Catálogo público de salones
 */

/**
 * @swagger
 * /api/v1/salones:
 *   get:
 *     summary: Lista todos los salones disponibles
 *     tags: [Salones]
 *     security: []   # público, no requiere token
 *     responses:
 *       200:
 *         description: Lista de salones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Salon' }
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', salonController.getAllSalones);

/**
 * @swagger
 * /api/v1/salones/{id}:
 *   get:
 *     summary: Obtiene un salón por ID
 *     tags: [Salones]
 *     security: []   # público, no requiere token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del salón
 *     responses:
 *       200:
 *         description: Salón encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Salon' }
 *       404:
 *         description: Salón no encontrado
 */
router.get('/:id', salonController.getSalonById);

/**
 * @swagger
 * /api/v1/salones:
 *   post:
 *     summary: Crea un salón
 *     description: Requiere rol administrador.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, capacidad, direccion]
 *             properties:
 *               nombre: { type: string, example: "Salón Infantil Arcoiris" }
 *               capacidad: { type: integer, example: 50 }
 *               direccion: { type: string, example: "Av. Rivadavia 4500" }
 *     responses:
 *       201:
 *         description: Salón creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */
router.post(
  '/',
  authenticateToken,
  requireRole([1]),
  validateRequired(['nombre', 'capacidad', 'direccion']),
  salonController.createSalon
);

/**
 * @swagger
 * /api/v1/salones/{id}:
 *   put:
 *     summary: Actualiza un salón
 *     description: Requiere rol administrador.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               capacidad: { type: integer }
 *               direccion: { type: string }
 *     responses:
 *       200:
 *         description: Salón actualizado
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Salón no encontrado
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole([1]),
  salonController.updateSalon
);

/**
 * @swagger
 * /api/v1/salones/{id}:
 *   delete:
 *     summary: Elimina un salón
 *     description: Requiere rol administrador.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Salón eliminado
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Salón no encontrado
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole([1]),
  salonController.deleteSalon
);

export default router;

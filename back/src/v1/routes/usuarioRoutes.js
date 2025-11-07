import express from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { validateCreateUsuario, validateUpdateUsuario, validateId } from '../../middlewares/validators.js';
import * as usuarioController from '../../controllers/usuarioController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios (solo administradores)
 */

/**
 * @swagger
 * /api/v1/usuarios:
 *   get:
 *     summary: Lista todos los usuarios
 *     description: Requiere rol administrador.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   usuario_id:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: "Juan"
 *                   apellido:
 *                     type: string
 *                     example: "Pérez"
 *                   nombre_usuario:
 *                     type: string
 *                     example: "juan@correo.com"
 *                   tipo_usuario:
 *                     type: integer
 *                     example: 3
 *                   celular:
 *                     type: string
 *                     example: "3442123456"
 *                   foto:
 *                     type: string
 *                     nullable: true
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */
/**
 * @swagger
 * /api/v1/usuarios/clientes:
 *   get:
 *     summary: Lista todos los clientes
 *     description: Requiere rol empleado o administrador.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   usuario_id:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: "Juan"
 *                   apellido:
 *                     type: string
 *                     example: "Pérez"
 *                   nombre_usuario:
 *                     type: string
 *                     example: "juan@correo.com"
 *                   tipo_usuario:
 *                     type: integer
 *                     example: 3
 *                   celular:
 *                     type: string
 *                     example: "3442123456"
 *                   foto:
 *                     type: string
 *                     nullable: true
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */
router.get(
  '/clientes',
  authenticateToken,
  requireRole([1, 2]),
  usuarioController.getAllClientes
);

router.get(
  '/',
  authenticateToken,
  requireRole([1]),
  usuarioController.getAllUsuarios
);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     description: Requiere rol administrador.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario_id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 apellido:
 *                   type: string
 *                 nombre_usuario:
 *                   type: string
 *                 tipo_usuario:
 *                   type: integer
 *                 celular:
 *                   type: string
 *                 foto:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */
router.get(
  '/:id',
  authenticateToken,
  requireRole([1]),
  validateId,
  usuarioController.getUsuarioById
);

/**
 * @swagger
 * /api/v1/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     description: Requiere rol administrador.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *               - tipo_usuario
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "María"
 *               apellido:
 *                 type: string
 *                 example: "González"
 *               nombre_usuario:
 *                 type: string
 *                 example: "maria@correo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "password123"
 *               tipo_usuario:
 *                 type: integer
 *                 description: 1=Administrador, 2=Empleado, 3=Cliente
 *                 example: 3
 *               celular:
 *                 type: string
 *                 example: "3442123456"
 *               foto:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */
router.post(
  '/',
  authenticateToken,
  requireRole([1]),
  validateCreateUsuario,
  usuarioController.createUsuario
);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario
 *     description: Requiere rol administrador.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *               tipo_usuario:
 *                 type: integer
 *                 description: 1=Administrador, 2=Empleado, 3=Cliente
 *               celular:
 *                 type: string
 *               foto:
 *                 type: string
 *               contrasenia:
 *                 type: string
 *                 description: Nueva contraseña (opcional)
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole([1]),
  validateUpdateUsuario,
  usuarioController.updateUsuario
);

/**
 * @swagger
 * /api/v1/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario (soft delete)
 *     description: Requiere rol administrador. No se puede eliminar el propio usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       400:
 *         description: No se puede eliminar el propio usuario
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Permisos insuficientes
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole([1]),
  validateId,
  usuarioController.deleteUsuario
);

export default router;


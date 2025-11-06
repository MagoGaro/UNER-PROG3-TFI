import express from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import { validateRequired } from '../../middlewares/errorHandler.js';
import * as authController from '../../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de Autenticación y Perfil
 */


 /**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "reserva_app"
 *               contrasenia:
 *                 type: string
 *                 example: "1exitosa."
 *     responses:
 *       200:
 *         description: Login exitoso. Devuelve token JWT y datos del usuario.
 *       401:
 *         description: Credenciales inválidas.
 */

router.post(
  '/login',
  validateRequired(['nombre_usuario', 'contrasenia']),
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Maria Julieta"
 *               apellido:
 *                 type: string
 *                 example: "Gutierrez"
 *               nombre_usuario:
 *                 type: string
 *                 example: "juli@correo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "passwordSeguro123"
 *               tipo_usuario:
 *                 type: number
 *                 description: Tipo de usuario (ej. 1=Admin, 3=Cliente)
 *                 example: 3
 *               celular:
 *                 type: string
 *                 example: "3442123456"
 *     responses:
 *       '201':
 *         description: Usuario creado exitosamente.
 *       '400':
 *         description: El nombre de usuario ya existe o faltan campos.
 */
router.post(
  '/register',
  validateRequired([
    'nombre',
    'apellido',
    'nombre_usuario',
    'contrasenia',
    'tipo_usuario',
  ]),
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Datos del perfil del usuario.
 *       '401':
 *         description: Token no válido o no provisto.
 *       '404':
 *         description: Usuario no encontrado.
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Actualiza el perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
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
 *               celular:
 *                 type: string
 *               foto:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Perfil actualizado exitosamente.
 *       '401':
 *         description: Token no válido o no provisto.
 */
router.put('/profile', authenticateToken, authController.updateProfile);

export default router;


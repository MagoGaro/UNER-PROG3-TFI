import express from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import * as fileController from '../../controllers/fileController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Archivos
 *   description: Gestión de carga de archivos (imágenes)
 */

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: Sube un archivo (imagen)
 *     description: Requiere autenticación. Permite subir imágenes para perfiles de usuario o fotos de cumpleañeros en reservas.
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen a subir
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Archivo subido exitosamente"
 *                 filename:
 *                   type: string
 *                   example: "foto-1234567890.jpg"
 *                 path:
 *                   type: string
 *                   example: "/uploads/foto-1234567890.jpg"
 *       400:
 *         description: No se proporcionó archivo o formato inválido
 *       401:
 *         description: Token ausente o inválido
 *       500:
 *         description: Error al procesar el archivo
 */
// Ruta protegida para subir archivos
router.post('/upload', 
  authenticateToken, 
  fileController.uploadMiddleware,
  fileController.uploadFile
);

export default router;

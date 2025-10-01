import express from 'express';
import { authenticateToken } from '../../middlewares/auth.js';
import { validateRequired } from '../../middlewares/errorHandler.js';
import * as authController from '../../controllers/authController.js';

const router = express.Router();

// Rutas de autenticación
router.post('/login', 
  validateRequired(['nombre_usuario', 'contrasenia']),
  authController.login
);

router.post('/register', 
  validateRequired(['nombre', 'apellido', 'nombre_usuario', 'contrasenia', 'tipo_usuario']),
  authController.register
);

router.get('/profile', 
  authenticateToken, 
  authController.getProfile
);

router.put('/profile', 
  authenticateToken, 
  authController.updateProfile
);

export default router;

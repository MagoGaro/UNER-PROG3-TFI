import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Middleware de autenticación JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar tipo de usuario
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};

// Middleware para verificar que el usuario es propietario del recurso o administrador
export const requireOwnershipOrAdmin = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.usuario_id;
  const isAdmin = req.user.tipo_usuario === 1;

  // Si es administrador, puede acceder a cualquier recurso
  if (isAdmin) {
    return next();
  }

  // Si no es administrador, verificar que el ID del recurso coincida con el usuario
  if (parseInt(id) !== userId) {
    return res.status(403).json({ error: 'Acceso denegado: solo puedes acceder a tus propios recursos' });
  }

  next();
};

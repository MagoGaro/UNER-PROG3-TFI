import { body, param, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Error de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para autenticación
export const validateLogin = [
  body('nombre_usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .trim()
    .isLength({ min: 3 })
    .withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
  body('contrasenia')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

export const validateRegister = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('nombre_usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
  body('contrasenia')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('tipo_usuario')
    .notEmpty()
    .withMessage('El tipo de usuario es requerido')
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Administrador), 2 (Empleado) o 3 (Cliente)'),
  body('celular')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('El celular debe tener entre 10 y 20 caracteres'),
  handleValidationErrors
];

// Validaciones para reservas
export const validateCreateReserva = [
  body('fecha_reserva')
    .notEmpty()
    .withMessage('La fecha de reserva es requerida')
    .isISO8601()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)')
    .toDate(),
  body('salon_id')
    .notEmpty()
    .withMessage('El salón es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del salón debe ser un número entero positivo'),
  body('turno_id')
    .notEmpty()
    .withMessage('El turno es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero positivo'),
  body('tematica')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La temática no puede exceder 255 caracteres'),
  body('foto_cumpleaniero')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ruta de la foto no puede exceder 255 caracteres'),
  body('servicios')
    .optional()
    .isArray()
    .withMessage('Los servicios deben ser un array'),
  body('servicios.*.servicio_id')
    .if(body('servicios').isArray())
    .isInt({ min: 1 })
    .withMessage('El ID del servicio debe ser un número entero positivo'),
  handleValidationErrors
];

export const validateUpdateReserva = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la reserva debe ser un número entero positivo'),
  body('fecha_reserva')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)')
    .toDate(),
  body('salon_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del salón debe ser un número entero positivo'),
  body('turno_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero positivo'),
  body('tematica')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La temática no puede exceder 255 caracteres'),
  body('foto_cumpleaniero')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ruta de la foto no puede exceder 255 caracteres'),
  body('servicios')
    .optional()
    .isArray()
    .withMessage('Los servicios deben ser un array'),
  handleValidationErrors
];

// Validaciones para usuarios
export const validateCreateUsuario = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('nombre_usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
  body('contrasenia')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('tipo_usuario')
    .notEmpty()
    .withMessage('El tipo de usuario es requerido')
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Administrador), 2 (Empleado) o 3 (Cliente)'),
  body('celular')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('El celular debe tener entre 10 y 20 caracteres'),
  body('foto')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ruta de la foto no puede exceder 255 caracteres'),
  handleValidationErrors
];

export const validateUpdateUsuario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('nombre_usuario')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
  body('tipo_usuario')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('El tipo de usuario debe ser 1 (Administrador), 2 (Empleado) o 3 (Cliente)'),
  body('celular')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('El celular debe tener entre 10 y 20 caracteres'),
  body('foto')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ruta de la foto no puede exceder 255 caracteres'),
  body('contrasenia')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

// Validaciones para salones
export const validateCreateSalon = [
  body('titulo')
    .notEmpty()
    .withMessage('El título es requerido')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('La dirección debe tener entre 5 y 255 caracteres'),
  body('latitud')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número entre -90 y 90'),
  body('longitud')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número entre -180 y 180'),
  body('capacidad')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero positivo'),
  body('importe')
    .notEmpty()
    .withMessage('El importe es requerido')
    .isFloat({ min: 0 })
    .withMessage('El importe debe ser un número positivo'),
  handleValidationErrors
];

export const validateUpdateSalon = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del salón debe ser un número entero positivo'),
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('direccion')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('La dirección debe tener entre 5 y 255 caracteres'),
  body('latitud')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número entre -90 y 90'),
  body('longitud')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número entre -180 y 180'),
  body('capacidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero positivo'),
  body('importe')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El importe debe ser un número positivo'),
  handleValidationErrors
];

// Validaciones para servicios
export const validateCreateServicio = [
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres'),
  body('importe')
    .notEmpty()
    .withMessage('El importe es requerido')
    .isFloat({ min: 0 })
    .withMessage('El importe debe ser un número positivo'),
  handleValidationErrors
];

export const validateUpdateServicio = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del servicio debe ser un número entero positivo'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('La descripción debe tener entre 3 y 255 caracteres'),
  body('importe')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El importe debe ser un número positivo'),
  handleValidationErrors
];

// Validaciones para turnos
export const validateCreateTurno = [
  body('orden')
    .notEmpty()
    .withMessage('El orden es requerido')
    .isInt({ min: 1 })
    .withMessage('El orden debe ser un número entero positivo'),
  body('hora_desde')
    .notEmpty()
    .withMessage('La hora de inicio es requerida')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('La hora de inicio debe tener formato HH:MM:SS'),
  body('hora_hasta')
    .notEmpty()
    .withMessage('La hora de fin es requerida')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('La hora de fin debe tener formato HH:MM:SS'),
  handleValidationErrors
];

export const validateUpdateTurno = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero positivo'),
  body('orden')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El orden debe ser un número entero positivo'),
  body('hora_desde')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('La hora de inicio debe tener formato HH:MM:SS'),
  body('hora_hasta')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('La hora de fin debe tener formato HH:MM:SS'),
  handleValidationErrors
];

// Validaciones para parámetros de ID
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors
];


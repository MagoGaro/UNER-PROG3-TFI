import { UsuarioDAO } from '../dao/usuarioDAO.js';
import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios (solo administradores)
export const getAllUsuarios = async (req, res) => {
  try {
    const rows = await UsuarioDAO.findAll();
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los clientes (empleados y administradores)
export const getAllClientes = async (req, res) => {
  try {
    const rows = await UsuarioDAO.findAllClientes();
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuario por ID (solo administradores)
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await UsuarioDAO.findById(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo usuario (solo administradores)
export const createUsuario = async (req, res) => {
  try {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;

    if (!nombre || !apellido || !nombre_usuario || !contrasenia || !tipo_usuario) {
      return res.status(400).json({ error: 'Nombre, apellido, nombre_usuario, contrasenia y tipo_usuario son requeridos' });
    }

    // Verificar si el usuario ya existe
    const exists = await UsuarioDAO.existsByNombreUsuario(nombre_usuario);
    if (exists) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    // Validar tipo de usuario
    if (![1, 2, 3].includes(tipo_usuario)) {
      return res.status(400).json({ error: 'Tipo de usuario inválido. Debe ser 1 (Administrador), 2 (Empleado) o 3 (Cliente)' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    // Insertar nuevo usuario
    const usuario_id = await UsuarioDAO.create(nombre, apellido, nombre_usuario, hashedPassword, tipo_usuario, celular);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario_id: usuario_id
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar usuario (solo administradores)
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, contrasenia } = req.body;

    // Verificar que el usuario existe
    const usuarioExistente = await UsuarioDAO.findById(id);
    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si se proporciona un nuevo nombre_usuario, verificar que no esté en uso por otro usuario
    if (nombre_usuario && nombre_usuario !== usuarioExistente.nombre_usuario) {
      const exists = await UsuarioDAO.existsByNombreUsuario(nombre_usuario);
      if (exists) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
    }

    // Validar tipo de usuario si se proporciona
    if (tipo_usuario && ![1, 2, 3].includes(tipo_usuario)) {
      return res.status(400).json({ error: 'Tipo de usuario inválido. Debe ser 1 (Administrador), 2 (Empleado) o 3 (Cliente)' });
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      nombre: nombre || usuarioExistente.nombre,
      apellido: apellido || usuarioExistente.apellido,
      nombre_usuario: nombre_usuario || usuarioExistente.nombre_usuario,
      tipo_usuario: tipo_usuario || usuarioExistente.tipo_usuario,
      celular: celular !== undefined ? celular : usuarioExistente.celular,
      foto: foto !== undefined ? foto : usuarioExistente.foto
    };

    // Si se proporciona una nueva contraseña, encriptarla
    if (contrasenia) {
      const hashedPassword = await bcrypt.hash(contrasenia, 10);
      // Actualizar contraseña por separado
      const connection = getConnection();
      await connection.execute(
        'UPDATE usuarios SET contrasenia = ?, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?',
        [hashedPassword, id]
      );
    }

    const updated = await UsuarioDAO.update(
      id,
      datosActualizacion.nombre,
      datosActualizacion.apellido,
      datosActualizacion.nombre_usuario,
      datosActualizacion.tipo_usuario,
      datosActualizacion.celular,
      datosActualizacion.foto
    );

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar usuario (soft delete) - solo administradores
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuario = await UsuarioDAO.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir que un administrador se elimine a sí mismo
    if (parseInt(id) === req.user.usuario_id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    const deleted = await UsuarioDAO.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


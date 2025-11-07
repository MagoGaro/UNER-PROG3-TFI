import { UsuarioService } from '../services/usuarioService.js';

// Obtener todos los usuarios (solo administradores)
export const getAllUsuarios = async (req, res) => {
  try {
    const rows = await UsuarioService.getAllUsuarios();
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los clientes (empleados y administradores)
export const getAllClientes = async (req, res) => {
  try {
    const rows = await UsuarioService.getAllClientes();
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
    const usuario = await UsuarioService.getUsuarioById(id);

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

    const usuario_id = await UsuarioService.createUsuario({
      nombre,
      apellido,
      nombre_usuario,
      contrasenia,
      tipo_usuario,
      celular,
      foto
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario_id: usuario_id
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.message === 'El nombre de usuario ya existe' || error.message.includes('Tipo de usuario inválido')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar usuario (solo administradores)
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, contrasenia } = req.body;

    const updated = await UsuarioService.updateUsuario(id, {
      nombre,
      apellido,
      nombre_usuario,
      tipo_usuario,
      celular,
      foto,
      contrasenia
    });

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error.message === 'El nombre de usuario ya está en uso' || error.message.includes('Tipo de usuario inválido')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar usuario (soft delete) - solo administradores
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un administrador se elimine a sí mismo
    if (parseInt(id) === req.user.usuario_id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    const deleted = await UsuarioService.deleteUsuario(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


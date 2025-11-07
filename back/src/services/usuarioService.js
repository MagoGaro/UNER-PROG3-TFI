import { UsuarioDAO } from '../dao/usuarioDAO.js';
import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class UsuarioService {
  // Obtener todos los usuarios activos
  static async getAllUsuarios() {
    return await UsuarioDAO.findAll();
  }

  // Obtener todos los clientes activos (tipo_usuario = 3)
  static async getAllClientes() {
    return await UsuarioDAO.findAllClientes();
  }

  // Obtener usuario por ID
  static async getUsuarioById(usuario_id) {
    return await UsuarioDAO.findById(usuario_id);
  }

  // Verificar si el usuario existe por nombre de usuario
  static async userExists(nombre_usuario) {
    return await UsuarioDAO.existsByNombreUsuario(nombre_usuario);
  }

  // Crear nuevo usuario
  static async createUsuario(userData) {
    // Verificar si el usuario ya existe
    const exists = await UsuarioDAO.existsByNombreUsuario(userData.nombre_usuario);
    if (exists) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Validar tipo de usuario
    if (![1, 2, 3].includes(userData.tipo_usuario)) {
      throw new Error('Tipo de usuario inválido. Debe ser 1 (Administrador), 2 (Empleado) o 3 (Cliente)');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.contrasenia, 10);

    // Crear usuario
    return await UsuarioDAO.create(
      userData.nombre,
      userData.apellido,
      userData.nombre_usuario,
      hashedPassword,
      userData.tipo_usuario,
      userData.celular
    );
  }

  // Actualizar usuario
  static async updateUsuario(usuario_id, updateData) {
    // Verificar que el usuario existe
    const usuarioExistente = await UsuarioDAO.findById(usuario_id);
    if (!usuarioExistente) {
      return null;
    }

    // Si se proporciona un nuevo nombre_usuario, verificar que no esté en uso por otro usuario
    if (updateData.nombre_usuario && updateData.nombre_usuario !== usuarioExistente.nombre_usuario) {
      const exists = await UsuarioDAO.existsByNombreUsuario(updateData.nombre_usuario);
      if (exists) {
        throw new Error('El nombre de usuario ya está en uso');
      }
    }

    // Validar tipo de usuario si se proporciona
    if (updateData.tipo_usuario && ![1, 2, 3].includes(updateData.tipo_usuario)) {
      throw new Error('Tipo de usuario inválido. Debe ser 1 (Administrador), 2 (Empleado) o 3 (Cliente)');
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      nombre: updateData.nombre || usuarioExistente.nombre,
      apellido: updateData.apellido || usuarioExistente.apellido,
      nombre_usuario: updateData.nombre_usuario || usuarioExistente.nombre_usuario,
      tipo_usuario: updateData.tipo_usuario || usuarioExistente.tipo_usuario,
      celular: updateData.celular !== undefined ? updateData.celular : usuarioExistente.celular,
      foto: updateData.foto !== undefined ? updateData.foto : usuarioExistente.foto
    };

    // Si se proporciona una nueva contraseña, encriptarla y actualizarla por separado
    if (updateData.contrasenia) {
      const hashedPassword = await bcrypt.hash(updateData.contrasenia, 10);
      const connection = getConnection();
      await connection.execute(
        'UPDATE usuarios SET contrasenia = ?, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?',
        [hashedPassword, usuario_id]
      );
    }

    // Actualizar usuario
    return await UsuarioDAO.update(
      usuario_id,
      datosActualizacion.nombre,
      datosActualizacion.apellido,
      datosActualizacion.nombre_usuario,
      datosActualizacion.tipo_usuario,
      datosActualizacion.celular,
      datosActualizacion.foto
    );
  }

  // Eliminar usuario (soft delete)
  static async deleteUsuario(usuario_id) {
    // Verificar que el usuario existe
    const usuario = await UsuarioDAO.findById(usuario_id);
    if (!usuario) {
      return false;
    }

    return await UsuarioDAO.delete(usuario_id);
  }
}


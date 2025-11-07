import { getConnection } from '../config/database.js';

export class UsuarioDAO {
  // Obtener usuario por nombre de usuario
  static async findByNombreUsuario(nombre_usuario) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = 1',
      [nombre_usuario]
    );
    return rows[0] || null;
  }

  // Verificar si el usuario existe
  static async existsByNombreUsuario(nombre_usuario) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT usuario_id FROM usuarios WHERE nombre_usuario = ?',
      [nombre_usuario]
    );
    return rows.length > 0;
  }

  // Obtener usuario por ID
  static async findById(usuario_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado, modificado FROM usuarios WHERE usuario_id = ? AND activo = 1',
      [usuario_id]
    );
    return rows[0] || null;
  }

  // Crear nuevo usuario
  static async create(nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular]
    );
    return result.insertId;
  }

  // Actualizar perfil de usuario
  static async updateProfile(usuario_id, nombre, apellido, celular, foto) {
    const connection = getConnection();
    await connection.execute(
      'UPDATE usuarios SET nombre = ?, apellido = ?, celular = ?, foto = ?, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?',
      [nombre, apellido, celular, foto, usuario_id]
    );
  }

  // Obtener todos los usuarios activos
  static async findAll() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado, modificado FROM usuarios WHERE activo = 1 ORDER BY apellido, nombre'
    );
    return rows;
  }

  // Actualizar usuario (para administradores)
  static async update(usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE usuarios SET nombre = ?, apellido = ?, nombre_usuario = ?, tipo_usuario = ?, celular = ?, foto = ?, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ? AND activo = 1',
      [nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, usuario_id]
    );
    return result.affectedRows > 0;
  }

  // Eliminar usuario (soft delete)
  static async delete(usuario_id) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE usuarios SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?',
      [usuario_id]
    );
    return result.affectedRows > 0;
  }

  // Obtener todos los clientes activos (tipo_usuario = 3)
  static async findAllClientes() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado, modificado FROM usuarios WHERE tipo_usuario = 3 AND activo = 1 ORDER BY apellido, nombre'
    );
    return rows;
  }
}


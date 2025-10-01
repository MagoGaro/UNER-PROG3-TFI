import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from '../config/database.js';
import { config } from '../config/index.js';

export class AuthService {
  // Verificar credenciales de usuario
  static async validateCredentials(nombre_usuario, contrasenia) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = 1',
      [nombre_usuario]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(contrasenia, user.contrasenia);

    if (!validPassword) {
      return null;
    }

    return user;
  }

  // Generar token JWT
  static generateToken(user) {
    return jwt.sign(
      { 
        usuario_id: user.usuario_id, 
        nombre_usuario: user.nombre_usuario,
        tipo_usuario: user.tipo_usuario 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  // Verificar si el usuario ya existe
  static async userExists(nombre_usuario) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT usuario_id FROM usuarios WHERE nombre_usuario = ?',
      [nombre_usuario]
    );
    return rows.length > 0;
  }

  // Crear nuevo usuario
  static async createUser(userData) {
    const connection = getConnection();
    const hashedPassword = await bcrypt.hash(userData.contrasenia, 10);
    
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular) VALUES (?, ?, ?, ?, ?, ?)',
      [userData.nombre, userData.apellido, userData.nombre_usuario, hashedPassword, userData.tipo_usuario, userData.celular]
    );

    return result.insertId;
  }

  // Obtener perfil de usuario
  static async getUserProfile(usuario_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto FROM usuarios WHERE usuario_id = ?',
      [usuario_id]
    );
    return rows[0] || null;
  }

  // Actualizar perfil de usuario
  static async updateUserProfile(usuario_id, updateData) {
    const connection = getConnection();
    const { nombre, apellido, celular, foto } = updateData;
    
    await connection.execute(
      'UPDATE usuarios SET nombre = ?, apellido = ?, celular = ?, foto = ?, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?',
      [nombre, apellido, celular, foto, usuario_id]
    );
  }
}

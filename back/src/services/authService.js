import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioDAO } from '../dao/usuarioDAO.js';
import { config } from '../config/index.js';

export class AuthService {
  static async validateCredentials(nombre_usuario, contrasenia) {
    const user = await UsuarioDAO.findByNombreUsuario(nombre_usuario);

    if (!user) {
      return null;
    }

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
    return await UsuarioDAO.existsByNombreUsuario(nombre_usuario);
  }

  // Crear nuevo usuario
  static async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.contrasenia, 10);
    return await UsuarioDAO.create(
      userData.nombre,
      userData.apellido,
      userData.nombre_usuario,
      hashedPassword,
      userData.tipo_usuario,
      userData.celular
    );
  }

  // Obtener perfil de usuario
  static async getUserProfile(usuario_id) {
    return await UsuarioDAO.findById(usuario_id);
  }

  // Actualizar perfil de usuario
  static async updateUserProfile(usuario_id, updateData) {
    const { nombre, apellido, celular, foto } = updateData;
    await UsuarioDAO.updateProfile(usuario_id, nombre, apellido, celular, foto);
  }
}

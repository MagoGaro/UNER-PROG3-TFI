import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioDAO } from '../dao/usuarioDAO.js';
import { config } from '../config/index.js';

// Login de usuario
export const login = async (req, res) => {
  try {
    const { nombre_usuario, contrasenia } = req.body;

    if (!nombre_usuario || !contrasenia) {
      return res.status(400).json({ error: 'Usuario y contrasenia son requeridos' });
    }

    const user = await UsuarioDAO.findByNombreUsuario(nombre_usuario);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(contrasenia, user.contrasenia);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        usuario_id: user.usuario_id, 
        nombre_usuario: user.nombre_usuario,
        tipo_usuario: user.tipo_usuario 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        usuario_id: user.usuario_id,
        nombre: user.nombre,
        apellido: user.apellido,
        nombre_usuario: user.nombre_usuario,
        tipo_usuario: user.tipo_usuario,
        celular: user.celular,
        foto: user.foto
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular } = req.body;

    if (!nombre || !apellido || !nombre_usuario || !contrasenia || !tipo_usuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const exists = await UsuarioDAO.existsByNombreUsuario(nombre_usuario);
    if (exists) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
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
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const user = await UsuarioDAO.findById(req.user.usuario_id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar perfil del usuario
export const updateProfile = async (req, res) => {
  try {
    const { nombre, apellido, celular, foto } = req.body;
    const usuario_id = req.user.usuario_id;

    await UsuarioDAO.updateProfile(usuario_id, nombre, apellido, celular, foto);

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

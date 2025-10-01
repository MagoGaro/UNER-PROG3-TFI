import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  __dirname
};

export default config;

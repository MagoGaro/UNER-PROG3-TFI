import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'reservas',
  port: process.env.DB_PORT || 3306
};

let connection;

// Conectar a la base de datos
export const connectDB = async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexión a la base de datos establecida');
    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    console.log('Continuando sin conexión a base de datos para pruebas...');
    return null;
  }
};

// Obtener conexión
export const getConnection = () => {
  if (!connection) {
    throw new Error('Base de datos no conectada');
  }
  return connection;
};

export default dbConfig;

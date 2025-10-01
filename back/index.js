import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/database.js';
import { config } from './src/config/index.js';
import upload from './src/config/multer.js';
import { errorHandler, notFound } from './src/middlewares/errorHandler.js';
import v1Routes from './src/v1/routes/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/v1', v1Routes);

// Middleware para manejo de errores
app.use(notFound);
app.use(errorHandler);

// Inicio del servidor
const startServer = async () => {
  await connectDB();
  
  app.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto ${config.port}`);
    console.log(`API disponible en: http://localhost:${config.port}/api`);
  });
};

startServer().catch(console.error);

export default app;

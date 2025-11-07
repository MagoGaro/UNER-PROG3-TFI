import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Definición de las opciones de Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Reservas de Salones",
      version: "1.0.0",
      description: "API para la gestión de reservas en un sistema de turnos.",
    },
    servers: [
  {
    url: "http://localhost:3000",
    description: "Servidor de Desarrollo Local",
  },
],

    components: {
  // 🔐 Seguridad
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },

  // 📘 Schemas reutilizables
  schemas: {
    AuthLoginInput: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'may@ejemplo.com' },
        password: { type: 'string', example: '123456' },
      },
    },
    AuthLoginResponse: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
    User: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        nombre: { type: 'string', example: 'Mayra Rossetto' },
        email: { type: 'string', format: 'email', example: 'may@ejemplo.com' },
        rol: { type: 'string', example: 'admin' },
      },
    },
    Reserva: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 12 },
        fecha_reserva: { type: 'string', format: 'date', example: '2025-11-20' },
        salon_id: { type: 'integer', example: 2 },
        turno_id: { type: 'integer', example: 1 },
        estado: { type: 'string', example: 'confirmada' },
      },
    },
    ReservaInput: {
      type: 'object',
      required: ['fecha_reserva', 'salon_id', 'turno_id'],
      properties: {
        fecha_reserva: { type: 'string', format: 'date', example: '2025-11-20' },
        salon_id: { type: 'integer', example: 2 },
        turno_id: { type: 'integer', example: 1 },
      },
    },
    Salon: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 3 },
        nombre: { type: 'string', example: 'Salón Infantil Arcoiris' },
        capacidad: { type: 'integer', example: 50 },
        direccion: { type: 'string', example: 'Av. Rivadavia 4500' },
      },
    },
    Servicio: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 5 },
        nombre: { type: 'string', example: 'Animación temática' },
        descripcion: { type: 'string', example: 'Incluye payasos y juegos' },
        precio: { type: 'number', example: 15000 },
      },
    },
    Turno: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 2 },
        hora_inicio: { type: 'string', example: '18:00' },
        hora_fin: { type: 'string', example: '22:00' },
        disponible: { type: 'boolean', example: true },
      },
    },
  },
},

    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Apunta a los archivos de rutas donde están los comentarios JSDoc
  apis: ["./src/v1/routes/*.js"], // <--- Volvimos a la ruta relativa
};

// Genera la especificación (el "manual")
const swaggerSpec = swaggerJSDoc(options);

// Exportamos una función para ser usada en index.js
export const swaggerDocs = (app, port) => {
  // Ruta para ver la UI de Swagger
  app.use(
    "/api-docs", // Esta es la URL que visitarás en el navegador
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec) 
  );

  // Ruta para ver el archivo JSON de la especificación
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `📑 Documentación disponible en http://localhost:${port}/api-docs`
  );
};

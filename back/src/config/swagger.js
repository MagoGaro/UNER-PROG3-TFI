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
        url: "http://localhost:3000/api/v1",
        description: "Servidor de Desarrollo Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
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

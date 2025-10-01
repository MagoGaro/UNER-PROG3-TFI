export const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reservas',
    port: process.env.DB_PORT || 3306
  },
  server: {
    port: process.env.PORT || 3000
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui',
    expiresIn: '24h'
  },
  upload: {
    path: process.env.UPLOAD_PATH || 'uploads/'
  }
};


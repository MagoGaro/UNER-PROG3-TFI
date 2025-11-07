import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validar que las credenciales estén configuradas
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
  console.warn('⚠️  ADVERTENCIA: Variables SMTP_USER o SMTP_PASS no configuradas.');
  console.warn('   Las notificaciones por email no funcionarán hasta configurar estas variables.');
  console.warn('   Ver: back/CONFIGURACION_EMAIL.md para más información.');
}

// Configuración del transporter de nodemailer
// Solo crear el transporter si las credenciales están disponibles
let transporter = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  // Verificar conexión (opcional, para desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Error en configuración de email:', error.message);
        console.error('   Verifica que SMTP_USER y SMTP_PASS estén correctamente configurados en .env');
      } else {
        console.log('✅ Servidor de email listo para enviar mensajes');
      }
    });
  }
} else {
  // Crear un transporter "dummy" que no hará nada pero evitará errores
  // Incluye el método use() para compatibilidad con nodemailer-express-handlebars
  transporter = {
    sendMail: async (options) => {
      console.warn('⚠️  Intento de envío de email ignorado: credenciales SMTP no configuradas');
      console.warn('   Configura SMTP_USER y SMTP_PASS en tu archivo .env');
      return { messageId: 'dummy' };
    },
    verify: (callback) => {
      callback(new Error('Credenciales SMTP no configuradas'));
    },
    use: (plugin, options) => {
      // Método dummy para compatibilidad con nodemailer-express-handlebars
      // No hace nada pero evita el error
      return transporter;
    }
  };
}

export { transporter };
export default transporter;


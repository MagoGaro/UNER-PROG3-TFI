import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validar que las credenciales estén configuradas
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Configuración básica del transporter de nodemailer
let transporter = null;

if (smtpUser && smtpPass) {
  // Configuración básica para Gmail
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  // Verificar conexión
  if (process.env.NODE_ENV !== 'production') {
    transporter.verify((error, success) => {
      if (error) {
        console.error('Error en configuración de email:', error.message);
      } else {
        console.log('Servidor de email listo para enviar mensajes');
      }
    });
  }
} else {
  console.warn('Credenciales SMTP no configuradas');

  transporter = {
    sendMail: async (options) => {
      console.warn('Intento de envío de email ignorado: credenciales SMTP no configuradas');
      console.warn(`Email que se intentó enviar: ${options.subject || 'Sin asunto'}`);
      return { messageId: 'dummy-' + Date.now() };
    },
    verify: (callback) => {
      if (callback) {
        callback(new Error('Credenciales SMTP no configuradas'));
      }
    },
    use: function(plugin, options) {
      return this;
    }
  };
}

export { transporter };
export default transporter;


import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { transporter } from '../config/nodemailer.js';
import { UsuarioDAO } from '../dao/usuarioDAO.js';
import { ReservaDAO } from '../dao/reservaDAO.js';
import { SalonDAO } from '../dao/salonDAO.js';
import { TurnoDAO } from '../dao/turnoDAO.js';
import { ReservaServicioDAO } from '../dao/reservaServicioDAO.js';
import { ServicioDAO } from '../dao/servicioDAO.js';
import { getConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar handlebars para nodemailer solo si el transporter es válido
// Verificar si el transporter tiene el método use (es un transporter real de nodemailer)
if (typeof transporter.use === 'function') {
  transporter.use('compile', hbs({
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.join(__dirname, '../templates/email/partials'),
      layoutsDir: path.join(__dirname, '../templates/email/layouts'),
      defaultLayout: 'main'
    },
    viewPath: path.join(__dirname, '../templates/email'),
    extName: '.hbs'
  }));
} else {
  console.warn('⚠️  Handlebars no configurado: credenciales SMTP no disponibles');
}

export class NotificationService {
  // Obtener emails de todos los administradores
  static async getAdminEmails() {
    try {
      const connection = getConnection();
      const [rows] = await connection.execute(
        'SELECT nombre_usuario FROM usuarios WHERE tipo_usuario = 1 AND activo = 1'
      );
      return rows.map(row => row.nombre_usuario);
    } catch (error) {
      console.error('Error al obtener emails de administradores:', error);
      return [];
    }
  }

  // Notificar a administradores cuando se crea una reserva
  static async notifyAdminNewReserva(reserva_id) {
    try {
      // Obtener datos completos de la reserva
      const reserva = await ReservaDAO.findById(reserva_id);
      if (!reserva) {
        console.error('Reserva no encontrada para notificación');
        return;
      }

      const cliente = await UsuarioDAO.findById(reserva.usuario_id);
      const salon = await SalonDAO.findById(reserva.salon_id);
      const turno = await TurnoDAO.findById(reserva.turno_id);
      const servicios = await ReservaServicioDAO.findByReservaId(reserva_id);
      
      // Obtener detalles de servicios
      const serviciosDetalle = [];
      for (const rs of servicios) {
        const servicio = await ServicioDAO.findById(rs.servicio_id);
        if (servicio) {
          serviciosDetalle.push({
            descripcion: servicio.descripcion,
            importe: rs.importe
          });
        }
      }

      // Obtener emails de administradores
      const adminEmails = await this.getAdminEmails();
      
      if (adminEmails.length === 0) {
        console.log('No hay administradores para notificar');
        return;
      }

      // Preparar datos para el template
      const importeTotal = parseFloat(reserva.importe_total) || 0;
      const emailData = {
        cliente: {
          nombre: `${cliente.nombre} ${cliente.apellido}`,
          email: cliente.nombre_usuario
        },
        reserva: {
          id: reserva.reserva_id,
          fecha: new Date(reserva.fecha_reserva).toLocaleDateString('es-AR'),
          salon: salon.titulo,
          turno: `${turno.hora_desde} - ${turno.hora_hasta}`,
          tematica: reserva.tematica || 'No especificada',
          importe_total: importeTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
        },
        servicios: serviciosDetalle.map(s => ({
          descripcion: s.descripcion,
          importe: parseFloat(s.importe).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
        }))
      };

      // Enviar email a cada administrador
      for (const email of adminEmails) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Nueva Reserva Creada - Sistema de Reservas',
            template: 'nueva-reserva-admin',
            context: emailData
          });
        } catch (emailError) {
          console.error(`Error al enviar email a ${email}:`, emailError.message);
        }
      }

      console.log(`Notificaciones enviadas a ${adminEmails.length} administrador(es)`);
    } catch (error) {
      console.error('Error al enviar notificación a administradores:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  // Notificar a cliente cuando se confirma una reserva
  static async notifyClienteReservaConfirmada(reserva_id) {
    try {
      // Obtener datos completos de la reserva
      const reserva = await ReservaDAO.findById(reserva_id);
      if (!reserva) {
        console.error('Reserva no encontrada para notificación');
        return;
      }

      const cliente = await UsuarioDAO.findById(reserva.usuario_id);
      if (!cliente) {
        console.error('Cliente no encontrado para notificación');
        return;
      }

      const salon = await SalonDAO.findById(reserva.salon_id);
      const turno = await TurnoDAO.findById(reserva.turno_id);
      const servicios = await ReservaServicioDAO.findByReservaId(reserva_id);
      
      // Obtener detalles de servicios
      const serviciosDetalle = [];
      for (const rs of servicios) {
        const servicio = await ServicioDAO.findById(rs.servicio_id);
        if (servicio) {
          serviciosDetalle.push({
            descripcion: servicio.descripcion,
            importe: rs.importe
          });
        }
      }

      // Preparar datos para el template
      const importeTotal = parseFloat(reserva.importe_total) || 0;
      const emailData = {
        cliente: {
          nombre: `${cliente.nombre} ${cliente.apellido}`
        },
        reserva: {
          id: reserva.reserva_id,
          fecha: new Date(reserva.fecha_reserva).toLocaleDateString('es-AR'),
          salon: salon.titulo,
          direccion: salon.direccion,
          turno: `${turno.hora_desde} - ${turno.hora_hasta}`,
          tematica: reserva.tematica || 'No especificada',
          importe_total: importeTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
        },
        servicios: serviciosDetalle.map(s => ({
          descripcion: s.descripcion,
          importe: parseFloat(s.importe).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
        }))
      };

      // Enviar email al cliente
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: cliente.nombre_usuario,
          subject: 'Reserva Confirmada - Sistema de Reservas',
          template: 'reserva-confirmada-cliente',
          context: emailData
        });
        console.log(`Notificación de confirmación enviada a ${cliente.nombre_usuario}`);
      } catch (emailError) {
        console.error(`Error al enviar email a ${cliente.nombre_usuario}:`, emailError.message);
      }
    } catch (error) {
      console.error('Error al enviar notificación al cliente:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }
}


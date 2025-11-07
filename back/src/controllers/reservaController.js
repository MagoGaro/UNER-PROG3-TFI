import { ReservaDAO } from '../dao/reservaDAO.js';
import { ReservaServicioDAO } from '../dao/reservaServicioDAO.js';
import { SalonDAO } from '../dao/salonDAO.js';
import { TurnoDAO } from '../dao/turnoDAO.js';
import { ServicioDAO } from '../dao/servicioDAO.js';
import { NotificationService } from '../services/notificationService.js';

// Obtener todas las reservas
export const getAllReservas = async (req, res) => {
  try {
    // Si no es administrador, solo mostrar sus propias reservas
    const usuario_id = req.user.tipo_usuario !== 1 ? req.user.usuario_id : null;
    const rows = await ReservaDAO.findAll(usuario_id);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener reserva por ID
export const getReservaById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.tipo_usuario !== 1 ? req.user.usuario_id : null;
    
    const reserva = await ReservaDAO.findById(id, usuario_id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Obtener servicios de la reserva
    const servicios = await ReservaServicioDAO.findByReservaId(id);
    res.json({ ...reserva, servicios });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nueva reserva
export const createReserva = async (req, res) => {
  try {
    console.log('Se recibio un POST/reserva');
    console.log('Cuerpo de la solicitud:', req.body);

    const { fecha_reserva, salon_id, turno_id, tematica = null, foto_cumpleaniero = null, servicios } = req.body;

    if (!fecha_reserva || !salon_id || !turno_id) {
      return res.status(400).json({ error: 'Fecha, salón y turno son requeridos' });
    }

    // Verificar que el salón existe y está activo
    const salon = await SalonDAO.findById(salon_id);
    if (!salon) {
      return res.status(400).json({ error: 'Salón no encontrado' });
    }

    // Verificar que el turno existe y está activo
    const turno = await TurnoDAO.findById(turno_id);
    if (!turno) {
      return res.status(400).json({ error: 'Turno no encontrado' });
    }

    // Verificar disponibilidad del salón en la fecha y turno
    const disponible = await ReservaDAO.checkAvailability(fecha_reserva, salon_id, turno_id);
    if (!disponible) {
      return res.status(400).json({ error: 'El salón ya está reservado para esa fecha y turno' });
    }

    // Calcular importe total
    let importe_total = parseFloat(salon.importe);
    let importe_salon = parseFloat(salon.importe);

    // Crear la reserva
    const reservaData = {
      fecha_reserva,
      salon_id,
      usuario_id: req.user.usuario_id,
      turno_id,
      tematica,
      foto_cumpleaniero,
      importe_salon,
      importe_total
    };

    const reserva_id = await ReservaDAO.create(reservaData);

    // Agregar servicios si se proporcionan
    if (servicios && servicios.length > 0) {
      for (const servicio of servicios) {
        const servicioData = await ServicioDAO.findById(servicio.servicio_id);
        
        if (servicioData) {
          const importe_servicio = parseFloat(servicio.importe || servicioData.importe);
          importe_total += importe_servicio;

          await ReservaServicioDAO.create(reserva_id, servicio.servicio_id, importe_servicio);
        }
      }

      // Actualizar el importe total de la reserva
      await ReservaDAO.updateImporteTotal(reserva_id, importe_total);
    }

    // Notificar a administradores sobre la nueva reserva (asíncrono, no bloquea la respuesta)
    NotificationService.notifyAdminNewReserva(reserva_id).catch(err => {
      console.error('Error al enviar notificación a administradores:', err);
    });

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reserva_id: reserva_id,
      importe_total: importe_total
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar reserva (solo administradores)
export const updateReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_reserva, salon_id, turno_id, tematica, foto_cumpleaniero, servicios } = req.body;

    // Verificar que la reserva existe (solo administradores pueden modificar)
    const reserva = await ReservaDAO.findById(id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Verificar disponibilidad si se cambia fecha, salón o turno
    if (fecha_reserva || salon_id || turno_id) {
      const fecha = fecha_reserva || reserva.fecha_reserva;
      const salon = salon_id || reserva.salon_id;
      const turno = turno_id || reserva.turno_id;

      const disponible = await ReservaDAO.checkAvailability(fecha, salon, turno, id);
      if (!disponible) {
        return res.status(400).json({ error: 'El salón ya está reservado para esa fecha y turno' });
      }
    }

    // Actualizar la reserva
    const reservaData = {
      fecha_reserva: fecha_reserva || reserva.fecha_reserva,
      salon_id: salon_id || reserva.salon_id,
      turno_id: turno_id || reserva.turno_id,
      tematica,
      foto_cumpleaniero
    };
    await ReservaDAO.update(id, reservaData);

    // Actualizar servicios si se proporcionan
    if (servicios) {
      // Eliminar servicios existentes
      await ReservaServicioDAO.deleteByReservaId(id);

      // Agregar nuevos servicios
      let importe_total = parseFloat(reserva.importe_salon);

      for (const servicio of servicios) {
        const servicioData = await ServicioDAO.findById(servicio.servicio_id);
        
        if (servicioData) {
          const importe_servicio = parseFloat(servicio.importe || servicioData.importe);
          importe_total += importe_servicio;

          await ReservaServicioDAO.create(id, servicio.servicio_id, importe_servicio);
        }
      }

      // Actualizar el importe total
      await ReservaDAO.updateImporteTotal(id, importe_total);
    }

    // Si el administrador actualiza la reserva, se considera confirmada
    // Notificar al cliente sobre la confirmación (asíncrono, no bloquea la respuesta)
    NotificationService.notifyClienteReservaConfirmada(id).catch(err => {
      console.error('Error al enviar notificación al cliente:', err);
    });

    res.json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar reserva (solo administradores)
export const deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la reserva existe (solo administradores pueden eliminar)
    const reserva = await ReservaDAO.findById(id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Eliminar servicios asociados
    await ReservaServicioDAO.deleteByReservaId(id);

    // Marcar reserva como inactiva
    await ReservaDAO.delete(id);

    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

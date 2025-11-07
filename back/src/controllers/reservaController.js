import { ReservaService } from '../services/reservaService.js';
import { NotificationService } from '../services/notificationService.js';

// Obtener todas las reservas
export const getAllReservas = async (req, res) => {
  try {
    // Si no es administrador, solo mostrar sus propias reservas
    const usuario_id = req.user.tipo_usuario !== 1 ? req.user.usuario_id : null;
    const rows = await ReservaService.getAllReservas(usuario_id);
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
    
    const reserva = await ReservaService.getReservaWithServices(id, usuario_id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(reserva);
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
    const salon = await ReservaService.validateSalon(salon_id);
    if (!salon) {
      return res.status(400).json({ error: 'Salón no encontrado' });
    }

    // Verificar que el turno existe y está activo
    const turno = await ReservaService.validateTurno(turno_id);
    if (!turno) {
      return res.status(400).json({ error: 'Turno no encontrado' });
    }

    // Verificar disponibilidad del salón en la fecha y turno
    const disponible = await ReservaService.checkAvailability(fecha_reserva, salon_id, turno_id);
    if (!disponible) {
      return res.status(400).json({ error: 'El salón ya está reservado para esa fecha y turno' });
    }

    // Calcular importe total inicial
    const { importe_total, importe_salon } = await ReservaService.calculateTotal(salon_id, servicios || []);

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

    const { reserva_id, importe_total: totalFinal } = await ReservaService.createReservaWithServices(reservaData, servicios || []);

    // Notificar a administradores sobre la nueva reserva (asíncrono, no bloquea la respuesta)
    NotificationService.notifyAdminNewReserva(reserva_id).catch(err => {
      console.error('Error al enviar notificación a administradores:', err);
    });

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reserva_id: reserva_id,
      importe_total: totalFinal
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

    // Preparar datos de actualización
    const reservaData = {
      fecha_reserva,
      salon_id,
      turno_id,
      tematica,
      foto_cumpleaniero
    };

    // Actualizar reserva usando el servicio
    const resultado = await ReservaService.updateReserva(id, reservaData, servicios);

    if (resultado === null) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (resultado === false) {
      return res.status(400).json({ error: 'El salón ya está reservado para esa fecha y turno' });
    }

    // Si el administrador actualiza la reserva, se considera confirmada
    // Notificar al cliente sobre la confirmación (asíncrono, no bloquea la respuesta)
    NotificationService.notifyClienteReservaConfirmada(id).catch(err => {
      console.error('Error al enviar notificación al cliente:', err);
    });

    res.json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    if (error.message === 'El salón ya está reservado para esa fecha y turno') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar reserva (solo administradores)
export const deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar reserva usando el servicio
    const deleted = await ReservaService.deleteReserva(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

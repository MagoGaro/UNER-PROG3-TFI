import { ReservaDAO } from '../dao/reservaDAO.js';
import { ReservaServicioDAO } from '../dao/reservaServicioDAO.js';
import { SalonDAO } from '../dao/salonDAO.js';
import { TurnoDAO } from '../dao/turnoDAO.js';
import { ServicioDAO } from '../dao/servicioDAO.js';

export class ReservaService {
  // Obtener todas las reservas (con filtro opcional por usuario)
  static async getAllReservas(usuario_id = null) {
    return await ReservaDAO.findAll(usuario_id);
  }

  // Obtener reserva por ID (con filtro opcional por usuario)
  static async getReservaById(reserva_id, usuario_id = null) {
    return await ReservaDAO.findById(reserva_id, usuario_id);
  }

  // Obtener reserva con servicios (con filtro opcional por usuario)
  static async getReservaWithServices(reserva_id, usuario_id = null) {
    const reserva = await ReservaDAO.findById(reserva_id, usuario_id);
    if (!reserva) {
      return null;
    }

    // Obtener servicios de la reserva
    const servicios = await ReservaServicioDAO.findByReservaId(reserva_id);
    return { ...reserva, servicios };
  }

  // Verificar disponibilidad
  static async checkAvailability(fecha_reserva, salon_id, turno_id, reserva_id = null) {
    return await ReservaDAO.checkAvailability(fecha_reserva, salon_id, turno_id, reserva_id);
  }

  // Validar salón
  static async validateSalon(salon_id) {
    return await SalonDAO.findById(salon_id);
  }

  // Validar turno
  static async validateTurno(turno_id) {
    return await TurnoDAO.findById(turno_id);
  }

  // Calcular importe total
  static async calculateTotal(salon_id, servicios = []) {
    const salon = await this.validateSalon(salon_id);
    if (!salon) {
      throw new Error('Salón no encontrado');
    }

    let importe_total = parseFloat(salon.importe);
    let importe_salon = parseFloat(salon.importe);

    if (servicios && servicios.length > 0) {
      for (const servicio of servicios) {
        const servicioData = await ServicioDAO.findById(servicio.servicio_id);

        if (servicioData) {
          const importe_servicio = parseFloat(servicio.importe || servicioData.importe);
          importe_total += importe_servicio;
        }
      }
    }

    return { importe_total, importe_salon };
  }

  // Crear reserva con servicios (actualiza importe_total automáticamente)
  static async createReservaWithServices(reservaData, servicios = []) {
    let importe_total = reservaData.importe_total || parseFloat(reservaData.importe_salon);

    // Si hay servicios, calcular el importe total
    if (servicios && servicios.length > 0) {
      const salon = await SalonDAO.findById(reservaData.salon_id);
      if (salon) {
        importe_total = parseFloat(salon.importe);
        for (const servicio of servicios) {
          const servicioData = await ServicioDAO.findById(servicio.servicio_id);
          if (servicioData) {
            const importe_servicio = parseFloat(servicio.importe || servicioData.importe);
            importe_total += importe_servicio;
          }
        }
      }
    }

    // Actualizar el importe_total en reservaData
    reservaData.importe_total = importe_total;

    // Crear la reserva
    const reserva_id = await ReservaDAO.create(reservaData);

    // Agregar servicios si se proporcionan
    if (servicios && servicios.length > 0) {
      for (const servicio of servicios) {
        const servicioData = await ServicioDAO.findById(servicio.servicio_id);

        if (servicioData) {
          const importe_servicio = parseFloat(servicio.importe || servicioData.importe);
          await ReservaServicioDAO.create(reserva_id, servicio.servicio_id, importe_servicio);
        }
      }
    }

    return { reserva_id, importe_total };
  }

  // Actualizar reserva con servicios
  static async updateReserva(reserva_id, reservaData, servicios = null) {
    // Verificar que la reserva existe
    const reserva = await ReservaDAO.findById(reserva_id);
    if (!reserva) {
      return null;
    }

    // Verificar disponibilidad si se cambia fecha, salón o turno
    if (reservaData.fecha_reserva || reservaData.salon_id || reservaData.turno_id) {
      const fecha = reservaData.fecha_reserva || reserva.fecha_reserva;
      const salon = reservaData.salon_id || reserva.salon_id;
      const turno = reservaData.turno_id || reserva.turno_id;

      const disponible = await ReservaDAO.checkAvailability(fecha, salon, turno, reserva_id);
      if (!disponible) {
        throw new Error('El salón ya está reservado para esa fecha y turno');
      }
    }

    // Preparar datos de actualización
    const updateData = {
      fecha_reserva: reservaData.fecha_reserva || reserva.fecha_reserva,
      salon_id: reservaData.salon_id || reserva.salon_id,
      turno_id: reservaData.turno_id || reserva.turno_id,
      tematica: reservaData.tematica !== undefined ? reservaData.tematica : reserva.tematica,
      foto_cumpleaniero: reservaData.foto_cumpleaniero !== undefined ? reservaData.foto_cumpleaniero : reserva.foto_cumpleaniero
    };

    // Actualizar la reserva
    await ReservaDAO.update(reserva_id, updateData);

    // Actualizar servicios si se proporcionan
    if (servicios !== null) {
      // Eliminar servicios existentes
      await ReservaServicioDAO.deleteByReservaId(reserva_id);

      // Calcular nuevo importe total
      const salon = await SalonDAO.findById(updateData.salon_id);
      let importe_total = parseFloat(salon.importe);

      // Agregar nuevos servicios
      if (servicios && servicios.length > 0) {
        for (const servicio of servicios) {
          const servicioData = await ServicioDAO.findById(servicio.servicio_id);
          
          if (servicioData) {
            const importe_servicio = parseFloat(servicio.importe || servicioData.importe);
            importe_total += importe_servicio;
            await ReservaServicioDAO.create(reserva_id, servicio.servicio_id, importe_servicio);
          }
        }
      }

      // Actualizar el importe total
      await ReservaDAO.updateImporteTotal(reserva_id, importe_total);
    }

    return true;
  }

  // Eliminar reserva (soft delete)
  static async deleteReserva(reserva_id) {
    // Verificar que la reserva existe
    const reserva = await ReservaDAO.findById(reserva_id);
    if (!reserva) {
      return false;
    }

    // Eliminar servicios asociados
    await ReservaServicioDAO.deleteByReservaId(reserva_id);

    // Marcar reserva como inactiva
    await ReservaDAO.delete(reserva_id);

    return true;
  }

  // Verificar permisos de acceso a reserva
  static async checkReservaAccess(reserva_id, usuario_id, tipo_usuario) {
    // Si es administrador, puede acceder a cualquier reserva
    if (tipo_usuario === 1) {
      return true;
    }

    // Si no es administrador, verificar que la reserva pertenece al usuario
    return await ReservaDAO.checkAccess(reserva_id, usuario_id);
  }
}

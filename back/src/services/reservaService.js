import { ReservaDAO } from '../dao/reservaDAO.js';
import { ReservaServicioDAO } from '../dao/reservaServicioDAO.js';
import { SalonDAO } from '../dao/salonDAO.js';
import { TurnoDAO } from '../dao/turnoDAO.js';
import { ServicioDAO } from '../dao/servicioDAO.js';

export class ReservaService {
  static async checkAvailability(fecha_reserva, salon_id, turno_id, reserva_id = null) {
    return await ReservaDAO.checkAvailability(fecha_reserva, salon_id, turno_id, reserva_id);
  }

  static async validateSalon(salon_id) {
    return await SalonDAO.findById(salon_id);
  }

  static async validateTurno(turno_id) {
    return await TurnoDAO.findById(turno_id);
  }

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

  static async createReservaWithServices(reservaData, servicios = []) {
    const reserva_id = await ReservaDAO.create(reservaData);

    if (servicios && servicios.length > 0) {
      for (const servicio of servicios) {
        const servicioData = await ServicioDAO.findById(servicio.servicio_id);

        if (servicioData) {
          const importe_servicio = parseFloat(servicio.importe || servicioData.importe);
          await ReservaServicioDAO.create(reserva_id, servicio.servicio_id, importe_servicio);
        }
      }
    }

    return reserva_id;
  }

  // Obtener reserva con servicios
  static async getReservaWithServices(reserva_id) {
    const reserva = await ReservaDAO.findById(reserva_id);
    if (!reserva) {
      return null;
    }

    // Obtener servicios de la reserva
    const servicios = await ReservaServicioDAO.findByReservaId(reserva_id);
    return { ...reserva, servicios };
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

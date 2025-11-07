import { TurnoDAO } from '../dao/turnoDAO.js';

export class TurnoService {
  // Obtener todos los turnos activos
  static async getAllTurnos() {
    return await TurnoDAO.findAll();
  }

  // Obtener turno por ID
  static async getTurnoById(turno_id) {
    return await TurnoDAO.findById(turno_id);
  }

  // Crear nuevo turno
  static async createTurno(orden, hora_desde, hora_hasta) {
    return await TurnoDAO.create(orden, hora_desde, hora_hasta);
  }

  // Actualizar turno
  static async updateTurno(turno_id, orden, hora_desde, hora_hasta) {
    return await TurnoDAO.update(turno_id, orden, hora_desde, hora_hasta);
  }

  // Eliminar turno (soft delete)
  static async deleteTurno(turno_id) {
    return await TurnoDAO.delete(turno_id);
  }
}


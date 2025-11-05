import { getConnection } from '../config/database.js';

export class ReservaServicioDAO {
  // Obtener servicios de una reserva
  static async findByReservaId(reserva_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT rs.*, s.descripcion FROM reservas_servicios rs JOIN servicios s ON rs.servicio_id = s.servicio_id WHERE rs.reserva_id = ?',
      [reserva_id]
    );
    return rows;
  }

  // Agregar servicio a reserva
  static async create(reserva_id, servicio_id, importe) {
    const connection = getConnection();
    await connection.execute(
      'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
      [reserva_id, servicio_id, importe]
    );
  }

  // Eliminar todos los servicios de una reserva
  static async deleteByReservaId(reserva_id) {
    const connection = getConnection();
    await connection.execute(
      'DELETE FROM reservas_servicios WHERE reserva_id = ?',
      [reserva_id]
    );
  }
}


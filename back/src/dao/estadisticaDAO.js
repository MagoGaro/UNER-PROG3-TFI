import { getConnection } from '../config/database.js';

export class EstadisticaDAO {
  // Obtener total de reservas activas (usando stored procedure)
  static async getTotalReservas() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'CALL sp_get_total_reservas()'
    );
    return rows[0][0].total;
  }

  // Obtener reservas por mes (últimos 12 meses) (usando stored procedure)
  static async getReservasPorMes() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'CALL sp_get_reservas_por_mes()'
    );
    return rows[0];
  }

  // Obtener salones más populares (usando stored procedure)
  static async getSalonesPopulares() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'CALL sp_get_salones_populares()'
    );
    return rows[0];
  }

  // Obtener ingresos totales (usando stored procedure)
  static async getIngresosTotales() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'CALL sp_get_ingresos_totales()'
    );
    return rows[0][0].total_ingresos || 0;
  }
}


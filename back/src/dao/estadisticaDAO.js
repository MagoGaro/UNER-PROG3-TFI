import { getConnection } from '../config/database.js';

export class EstadisticaDAO {
  // Obtener total de reservas activas
  static async getTotalReservas() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as total FROM reservas WHERE activo = 1'
    );
    return rows[0].total;
  }

  // Obtener reservas por mes (últimos 12 meses)
  static async getReservasPorMes() {
    const connection = getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        DATE_FORMAT(fecha_reserva, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM reservas 
      WHERE activo = 1 
      GROUP BY DATE_FORMAT(fecha_reserva, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `);
    return rows;
  }

  // Obtener salones más populares
  static async getSalonesPopulares() {
    const connection = getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        s.titulo,
        COUNT(r.reserva_id) as reservas
      FROM salones s
      LEFT JOIN reservas r ON s.salon_id = r.salon_id AND r.activo = 1
      GROUP BY s.salon_id, s.titulo
      ORDER BY reservas DESC
    `);
    return rows;
  }

  // Obtener ingresos totales
  static async getIngresosTotales() {
    const connection = getConnection();
    const [rows] = await connection.execute(`
      SELECT SUM(importe_total) as total_ingresos
      FROM reservas 
      WHERE activo = 1
    `);
    return rows[0].total_ingresos || 0;
  }
}


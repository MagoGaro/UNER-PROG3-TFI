import { getConnection } from '../config/database.js';

// Obtener estadísticas (solo administradores)
export const getEstadisticas = async (req, res) => {
  try {
    const connection = getConnection();

    // Total de reservas
    const [totalReservas] = await connection.execute(
      'SELECT COUNT(*) as total FROM reservas WHERE activo = 1'
    );

    // Reservas por mes
    const [reservasPorMes] = await connection.execute(`
      SELECT 
        DATE_FORMAT(fecha_reserva, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM reservas 
      WHERE activo = 1 
      GROUP BY DATE_FORMAT(fecha_reserva, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `);

    // Salones más populares
    const [salonesPopulares] = await connection.execute(`
      SELECT 
        s.titulo,
        COUNT(r.reserva_id) as reservas
      FROM salones s
      LEFT JOIN reservas r ON s.salon_id = r.salon_id AND r.activo = 1
      GROUP BY s.salon_id, s.titulo
      ORDER BY reservas DESC
    `);

    // Ingresos totales
    const [ingresos] = await connection.execute(`
      SELECT SUM(importe_total) as total_ingresos
      FROM reservas 
      WHERE activo = 1
    `);

    res.json({
      total_reservas: totalReservas[0].total,
      reservas_por_mes: reservasPorMes,
      salones_populares: salonesPopulares,
      ingresos_totales: ingresos[0].total_ingresos || 0
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

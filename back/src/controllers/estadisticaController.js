import { EstadisticaDAO } from '../dao/estadisticaDAO.js';

// Obtener estadísticas (solo administradores)
export const getEstadisticas = async (req, res) => {
  try {
    // Total de reservas
    const totalReservas = await EstadisticaDAO.getTotalReservas();

    // Reservas por mes
    const reservasPorMes = await EstadisticaDAO.getReservasPorMes();

    // Salones más populares
    const salonesPopulares = await EstadisticaDAO.getSalonesPopulares();

    // Ingresos totales
    const ingresosTotales = await EstadisticaDAO.getIngresosTotales();

    res.json({
      total_reservas: totalReservas,
      reservas_por_mes: reservasPorMes,
      salones_populares: salonesPopulares,
      ingresos_totales: ingresosTotales
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

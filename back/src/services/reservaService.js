import { getConnection } from '../config/database.js';

export class ReservaService {
  // Verificar disponibilidad de salón
  static async checkAvailability(fecha_reserva, salon_id, turno_id, reserva_id = null) {
    const connection = getConnection();
    let query = 'SELECT reserva_id FROM reservas WHERE fecha_reserva = ? AND salon_id = ? AND turno_id = ? AND activo = 1';
    let params = [fecha_reserva, salon_id, turno_id];

    if (reserva_id) {
      query += ' AND reserva_id != ?';
      params.push(reserva_id);
    }

    const [rows] = await connection.execute(query, params);
    return rows.length === 0;
  }

  // Verificar que el salón existe y está activo
  static async validateSalon(salon_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM salones WHERE salon_id = ? AND activo = 1',
      [salon_id]
    );
    return rows[0] || null;
  }

  // Verificar que el turno existe y está activo
  static async validateTurno(turno_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM turnos WHERE turno_id = ? AND activo = 1',
      [turno_id]
    );
    return rows[0] || null;
  }

  // Calcular importe total de la reserva
  static async calculateTotal(salon_id, servicios = []) {
    const salon = await this.validateSalon(salon_id);
    if (!salon) {
      throw new Error('Salón no encontrado');
    }

    let importe_total = parseFloat(salon.importe);
    let importe_salon = parseFloat(salon.importe);

    if (servicios && servicios.length > 0) {
      const connection = getConnection();
      for (const servicio of servicios) {
        const [servicioData] = await connection.execute(
          'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
          [servicio.servicio_id]
        );

        if (servicioData.length > 0) {
          const importe_servicio = parseFloat(servicio.importe || servicioData[0].importe);
          importe_total += importe_servicio;
        }
      }
    }

    return { importe_total, importe_salon };
  }

  // Crear reserva con servicios
  static async createReservaWithServices(reservaData, servicios = []) {
    const connection = getConnection();
    
    // Crear la reserva
    const [result] = await connection.execute(
      'INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, tematica, foto_cumpleaniero, importe_salon, importe_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [reservaData.fecha_reserva, reservaData.salon_id, reservaData.usuario_id, reservaData.turno_id, reservaData.tematica, reservaData.foto_cumpleaniero, reservaData.importe_salon, reservaData.importe_total]
    );

    const reserva_id = result.insertId;

    // Agregar servicios si se proporcionan
    if (servicios && servicios.length > 0) {
      for (const servicio of servicios) {
        const [servicioData] = await connection.execute(
          'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
          [servicio.servicio_id]
        );

        if (servicioData.length > 0) {
          const importe_servicio = parseFloat(servicio.importe || servicioData[0].importe);
          
          await connection.execute(
            'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
            [reserva_id, servicio.servicio_id, importe_servicio]
          );
        }
      }
    }

    return reserva_id;
  }

  // Obtener reserva con servicios
  static async getReservaWithServices(reserva_id) {
    const connection = getConnection();
    
    const [reserva] = await connection.execute(`
      SELECT r.*, s.titulo as salon_titulo, u.nombre, u.apellido, t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ? AND r.activo = 1
    `, [reserva_id]);

    if (reserva.length === 0) {
      return null;
    }

    // Obtener servicios de la reserva
    const [servicios] = await connection.execute(
      'SELECT rs.*, s.descripcion FROM reservas_servicios rs JOIN servicios s ON rs.servicio_id = s.servicio_id WHERE rs.reserva_id = ?',
      [reserva_id]
    );

    return { ...reserva[0], servicios };
  }

  // Verificar permisos de acceso a reserva
  static async checkReservaAccess(reserva_id, usuario_id, tipo_usuario) {
    const connection = getConnection();
    
    // Si es administrador, puede acceder a cualquier reserva
    if (tipo_usuario === 1) {
      return true;
    }

    // Si no es administrador, verificar que la reserva pertenece al usuario
    const [rows] = await connection.execute(
      'SELECT usuario_id FROM reservas WHERE reserva_id = ? AND activo = 1',
      [reserva_id]
    );

    return rows.length > 0 && rows[0].usuario_id === usuario_id;
  }
}

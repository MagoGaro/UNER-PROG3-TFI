import { getConnection } from '../config/database.js';

export class ReservaDAO {
  // Obtener todas las reservas (con filtro opcional por usuario)
  static async findAll(usuario_id = null) {
    const connection = getConnection();
    let query = `
      SELECT r.*, s.titulo as salon_titulo, u.nombre, u.apellido, t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1
    `;
    
    if (usuario_id) {
      query += ' AND r.usuario_id = ?';
      const [rows] = await connection.execute(query, [usuario_id]);
      return rows;
    }
    
    const [rows] = await connection.execute(query);
    return rows;
  }

  // Obtener reserva por ID
  static async findById(reserva_id, usuario_id = null) {
    const connection = getConnection();
    let query = `
      SELECT r.*, s.titulo as salon_titulo, u.nombre, u.apellido, t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ? AND r.activo = 1
    `;
    
    const params = [reserva_id];
    if (usuario_id) {
      query += ' AND r.usuario_id = ?';
      params.push(usuario_id);
    }
    
    const [rows] = await connection.execute(query, params);
    return rows[0] || null;
  }

  // Verificar disponibilidad de salón en fecha y turno
  static async checkAvailability(fecha_reserva, salon_id, turno_id, reserva_id = null) {
    const connection = getConnection();
    let query = 'SELECT reserva_id FROM reservas WHERE fecha_reserva = ? AND salon_id = ? AND turno_id = ? AND activo = 1';
    const params = [fecha_reserva, salon_id, turno_id];
    
    if (reserva_id) {
      query += ' AND reserva_id != ?';
      params.push(reserva_id);
    }
    
    const [rows] = await connection.execute(query, params);
    return rows.length === 0;
  }

  // Crear nueva reserva
  static async create(reservaData) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, tematica, foto_cumpleaniero, importe_salon, importe_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        reservaData.fecha_reserva,
        reservaData.salon_id,
        reservaData.usuario_id,
        reservaData.turno_id,
        reservaData.tematica,
        reservaData.foto_cumpleaniero,
        reservaData.importe_salon,
        reservaData.importe_total
      ]
    );
    return result.insertId;
  }

  // Actualizar reserva
  static async update(reserva_id, reservaData) {
    const connection = getConnection();
    await connection.execute(
      'UPDATE reservas SET fecha_reserva = ?, salon_id = ?, turno_id = ?, tematica = ?, foto_cumpleaniero = ?, modificado = CURRENT_TIMESTAMP WHERE reserva_id = ?',
      [
        reservaData.fecha_reserva,
        reservaData.salon_id,
        reservaData.turno_id,
        reservaData.tematica,
        reservaData.foto_cumpleaniero,
        reserva_id
      ]
    );
  }

  // Actualizar importe total de reserva
  static async updateImporteTotal(reserva_id, importe_total) {
    const connection = getConnection();
    await connection.execute(
      'UPDATE reservas SET importe_total = ? WHERE reserva_id = ?',
      [importe_total, reserva_id]
    );
  }

  // Eliminar reserva (soft delete)
  static async delete(reserva_id) {
    const connection = getConnection();
    await connection.execute(
      'UPDATE reservas SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE reserva_id = ?',
      [reserva_id]
    );
  }

  // Verificar que la reserva existe y pertenece al usuario (o es admin)
  static async findByIdWithUserCheck(reserva_id, usuario_id = null) {
    const connection = getConnection();
    let query = 'SELECT * FROM reservas WHERE reserva_id = ? AND activo = 1';
    const params = [reserva_id];
    
    if (usuario_id) {
      query += ' AND usuario_id = ?';
      params.push(usuario_id);
    }
    
    const [rows] = await connection.execute(query, params);
    return rows[0] || null;
  }

  // Verificar acceso a reserva
  static async checkAccess(reserva_id, usuario_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT usuario_id FROM reservas WHERE reserva_id = ? AND activo = 1',
      [reserva_id]
    );
    return rows.length > 0 && rows[0].usuario_id === usuario_id;
  }
}


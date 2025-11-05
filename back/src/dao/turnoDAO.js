import { getConnection } from '../config/database.js';

export class TurnoDAO {
  // Obtener todos los turnos activos
  static async findAll() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM turnos WHERE activo = 1 ORDER BY orden'
    );
    return rows;
  }

  // Obtener turno por ID
  static async findById(turno_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM turnos WHERE turno_id = ? AND activo = 1',
      [turno_id]
    );
    return rows[0] || null;
  }

  // Crear nuevo turno
  static async create(orden, hora_desde, hora_hasta) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?, ?, ?)',
      [orden, hora_desde, hora_hasta]
    );
    return result.insertId;
  }

  // Actualizar turno
  static async update(turno_id, orden, hora_desde, hora_hasta) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE turnos SET orden = ?, hora_desde = ?, hora_hasta = ?, modificado = CURRENT_TIMESTAMP WHERE turno_id = ?',
      [orden, hora_desde, hora_hasta, turno_id]
    );
    return result.affectedRows > 0;
  }

  // Eliminar turno (soft delete)
  static async delete(turno_id) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE turnos SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE turno_id = ?',
      [turno_id]
    );
    return result.affectedRows > 0;
  }
}


import { getConnection } from '../config/database.js';

export class ServicioDAO {
  // Obtener todos los servicios activos
  static async findAll() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM servicios WHERE activo = 1 ORDER BY descripcion'
    );
    return rows;
  }

  // Obtener servicio por ID
  static async findById(servicio_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
      [servicio_id]
    );
    return rows[0] || null;
  }

  // Crear nuevo servicio
  static async create(descripcion, importe) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)',
      [descripcion, importe]
    );
    return result.insertId;
  }

  // Actualizar servicio
  static async update(servicio_id, descripcion, importe) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE servicios SET descripcion = ?, importe = ?, modificado = CURRENT_TIMESTAMP WHERE servicio_id = ?',
      [descripcion, importe, servicio_id]
    );
    return result.affectedRows > 0;
  }

  // Eliminar servicio (soft delete)
  static async delete(servicio_id) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE servicios SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE servicio_id = ?',
      [servicio_id]
    );
    return result.affectedRows > 0;
  }
}


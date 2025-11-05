import { getConnection } from '../config/database.js';

export class SalonDAO {
  // Obtener todos los salones activos
  static async findAll() {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM salones WHERE activo = 1 ORDER BY titulo'
    );
    return rows;
  }

  // Obtener salón por ID
  static async findById(salon_id) {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM salones WHERE salon_id = ? AND activo = 1',
      [salon_id]
    );
    return rows[0] || null;
  }

  // Crear nuevo salón
  static async create(titulo, direccion, latitud, longitud, capacidad, importe) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO salones (titulo, direccion, latitud, longitud, capacidad, importe) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, direccion, latitud, longitud, capacidad, importe]
    );
    return result.insertId;
  }

  // Actualizar salón
  static async update(salon_id, titulo, direccion, latitud, longitud, capacidad, importe) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE salones SET titulo = ?, direccion = ?, latitud = ?, longitud = ?, capacidad = ?, importe = ?, modificado = CURRENT_TIMESTAMP WHERE salon_id = ?',
      [titulo, direccion, latitud, longitud, capacidad, importe, salon_id]
    );
    return result.affectedRows > 0;
  }

  // Eliminar salón (soft delete)
  static async delete(salon_id) {
    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE salones SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE salon_id = ?',
      [salon_id]
    );
    return result.affectedRows > 0;
  }
}


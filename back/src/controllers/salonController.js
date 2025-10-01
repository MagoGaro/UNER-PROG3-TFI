import { getConnection } from '../config/database.js';

// Obtener todos los salones
export const getAllSalones = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM salones WHERE activo = 1 ORDER BY titulo'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener salones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener salón por ID
export const getSalonById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM salones WHERE salon_id = ? AND activo = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Salón no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener salón:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo salón (solo administradores)
export const createSalon = async (req, res) => {
  try {
    const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;

    if (!titulo || !direccion || !importe) {
      return res.status(400).json({ error: 'Título, dirección e importe son requeridos' });
    }

    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO salones (titulo, direccion, latitud, longitud, capacidad, importe) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, direccion, latitud, longitud, capacidad, importe]
    );

    res.status(201).json({
      message: 'Salón creado exitosamente',
      salon_id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear salón:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar salón (solo administradores)
export const updateSalon = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;

    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE salones SET titulo = ?, direccion = ?, latitud = ?, longitud = ?, capacidad = ?, importe = ?, modificado = CURRENT_TIMESTAMP WHERE salon_id = ?',
      [titulo, direccion, latitud, longitud, capacidad, importe, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Salón no encontrado' });
    }

    res.json({ message: 'Salón actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar salón:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar salón (solo administradores)
export const deleteSalon = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE salones SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE salon_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Salón no encontrado' });
    }

    res.json({ message: 'Salón eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar salón:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

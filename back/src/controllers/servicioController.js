import { getConnection } from '../config/database.js';

// Obtener todos los servicios
export const getAllServicios = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM servicios WHERE activo = 1 ORDER BY descripcion'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicio por ID
export const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo servicio (solo administradores)
export const createServicio = async (req, res) => {
  try {
    const { descripcion, importe } = req.body;

    if (!descripcion || !importe) {
      return res.status(400).json({ error: 'Descripción e importe son requeridos' });
    }

    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)',
      [descripcion, importe]
    );

    res.status(201).json({
      message: 'Servicio creado exitosamente',
      servicio_id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar servicio (solo administradores)
export const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, importe } = req.body;

    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE servicios SET descripcion = ?, importe = ?, modificado = CURRENT_TIMESTAMP WHERE servicio_id = ?',
      [descripcion, importe, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar servicio (solo administradores)
export const deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE servicios SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE servicio_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

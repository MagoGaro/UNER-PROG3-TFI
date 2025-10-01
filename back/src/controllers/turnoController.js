import { getConnection } from '../config/database.js';

// Obtener todos los turnos
export const getAllTurnos = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM turnos WHERE activo = 1 ORDER BY orden'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener turno por ID
export const getTurnoById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM turnos WHERE turno_id = ? AND activo = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo turno (solo administradores)
export const createTurno = async (req, res) => {
  try {
    const { orden, hora_desde, hora_hasta } = req.body;

    if (!orden || !hora_desde || !hora_hasta) {
      return res.status(400).json({ error: 'Orden, hora desde y hora hasta son requeridos' });
    }

    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?, ?, ?)',
      [orden, hora_desde, hora_hasta]
    );

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno_id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar turno (solo administradores)
export const updateTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { orden, hora_desde, hora_hasta } = req.body;

    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE turnos SET orden = ?, hora_desde = ?, hora_hasta = ?, modificado = CURRENT_TIMESTAMP WHERE turno_id = ?',
      [orden, hora_desde, hora_hasta, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json({ message: 'Turno actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar turno (solo administradores)
export const deleteTurno = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE turnos SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE turno_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json({ message: 'Turno eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

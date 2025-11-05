import { TurnoDAO } from '../dao/turnoDAO.js';

// Obtener todos los turnos
export const getAllTurnos = async (req, res) => {
  try {
    const rows = await TurnoDAO.findAll();
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
    const turno = await TurnoDAO.findById(id);

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json(turno);
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

    const turno_id = await TurnoDAO.create(orden, hora_desde, hora_hasta);

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno_id: turno_id
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

    const updated = await TurnoDAO.update(id, orden, hora_desde, hora_hasta);

    if (!updated) {
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

    const deleted = await TurnoDAO.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json({ message: 'Turno eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

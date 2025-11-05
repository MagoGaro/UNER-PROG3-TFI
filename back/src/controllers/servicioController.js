import { ServicioDAO } from '../dao/servicioDAO.js';

// Obtener todos los servicios
export const getAllServicios = async (req, res) => {
  try {
    const rows = await ServicioDAO.findAll();
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
    const servicio = await ServicioDAO.findById(id);

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json(servicio);
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

    const servicio_id = await ServicioDAO.create(descripcion, importe);

    res.status(201).json({
      message: 'Servicio creado exitosamente',
      servicio_id: servicio_id
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

    const updated = await ServicioDAO.update(id, descripcion, importe);

    if (!updated) {
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

    const deleted = await ServicioDAO.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

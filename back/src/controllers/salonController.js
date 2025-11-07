import { SalonService } from '../services/salonService.js';

// Obtener todos los salones
export const getAllSalones = async (req, res) => {
  try {
    const rows = await SalonService.getAllSalones();
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
    const salon = await SalonService.getSalonById(id);

    if (!salon) {
      return res.status(404).json({ error: 'Salón no encontrado' });
    }

    res.json(salon);
  } catch (error) {
    console.error('Error al obtener salón:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo salón (solo administradores)

export const createSalon = async (req, res) => {
  try {

    const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;

    if (!titulo || !direccion || capacidad == null || importe == null) {
      return res.status(400).json({ error: 'Título, dirección e importe son requeridos' });
    }

    const salon_id = await SalonService.createSalon(titulo, direccion, latitud ?? null, longitud ?? null, capacidad, importe);

    res.status(201).json({
      message: 'Salón creado exitosamente',
      salon_id: salon_id
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

    const updated = await SalonService.updateSalon(id, titulo, direccion, latitud, longitud, capacidad, importe);

    if (!updated) {
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

    const deleted = await SalonService.deleteSalon(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Salón no encontrado' });
    }

    res.json({ message: 'Salón eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar salón:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

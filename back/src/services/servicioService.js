import { ServicioDAO } from '../dao/servicioDAO.js';

export class ServicioService {
  // Obtener todos los servicios activos
  static async getAllServicios() {
    return await ServicioDAO.findAll();
  }

  // Obtener servicio por ID
  static async getServicioById(servicio_id) {
    return await ServicioDAO.findById(servicio_id);
  }

  // Crear nuevo servicio
  static async createServicio(descripcion, importe) {
    return await ServicioDAO.create(descripcion, importe);
  }

  // Actualizar servicio
  static async updateServicio(servicio_id, descripcion, importe) {
    return await ServicioDAO.update(servicio_id, descripcion, importe);
  }

  // Eliminar servicio (soft delete)
  static async deleteServicio(servicio_id) {
    return await ServicioDAO.delete(servicio_id);
  }
}


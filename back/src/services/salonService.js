import { SalonDAO } from '../dao/salonDAO.js';

export class SalonService {
  // Obtener todos los salones activos
  static async getAllSalones() {
    return await SalonDAO.findAll();
  }

  // Obtener salón por ID
  static async getSalonById(salon_id) {
    return await SalonDAO.findById(salon_id);
  }

  // Crear nuevo salón
  static async createSalon(titulo, direccion, latitud, longitud, capacidad, importe) {
    return await SalonDAO.create(titulo, direccion, latitud, longitud, capacidad, importe);
  }

  // Actualizar salón
  static async updateSalon(salon_id, titulo, direccion, latitud, longitud, capacidad, importe) {
    return await SalonDAO.update(salon_id, titulo, direccion, latitud, longitud, capacidad, importe);
  }

  // Eliminar salón (soft delete)
  static async deleteSalon(salon_id) {
    return await SalonDAO.delete(salon_id);
  }
}


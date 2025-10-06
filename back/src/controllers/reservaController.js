import { getConnection } from '../config/database.js';

// Obtener todas las reservas
export const getAllReservas = async (req, res) => {
  try {
    const connection = getConnection();
    let query = `
      SELECT r.*, s.titulo as salon_titulo, u.nombre, u.apellido, t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1
    `;

    // Si no es administrador, solo mostrar sus propias reservas
    if (req.user.tipo_usuario !== 1) {
      query += ' AND r.usuario_id = ?';
      const [rows] = await connection.execute(query, [req.user.usuario_id]);
      return res.json(rows);
    }

    const [rows] = await connection.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener reserva por ID
export const getReservaById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    let query = `
      SELECT r.*, s.titulo as salon_titulo, u.nombre, u.apellido, t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ? AND r.activo = 1
    `;

    // Si no es administrador, verificar que la reserva pertenece al usuario
    if (req.user.tipo_usuario !== 1) {
      query += ' AND r.usuario_id = ?';
      const [rows] = await connection.execute(query, [id, req.user.usuario_id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Obtener servicios de la reserva
      const [servicios] = await connection.execute(
        'SELECT rs.*, s.descripcion FROM reservas_servicios rs JOIN servicios s ON rs.servicio_id = s.servicio_id WHERE rs.reserva_id = ?',
        [id]
      );

      return res.json({ ...rows[0], servicios });
    }

    const [rows] = await connection.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Obtener servicios de la reserva
    const [servicios] = await connection.execute(
      'SELECT rs.*, s.descripcion FROM reservas_servicios rs JOIN servicios s ON rs.servicio_id = s.servicio_id WHERE rs.reserva_id = ?',
      [id]
    );

    res.json({ ...rows[0], servicios });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nueva reserva
export const createReserva = async (req, res) => {
  try {
    console.log('Se recibio un POST/reserva');
    console.log('Cuerpo de la solicitud:', req.body);

    const { fecha_reserva, salon_id, turno_id, tematica = null, foto_cumpleaniero = null, servicios } = req.body;

    if (!fecha_reserva || !salon_id || !turno_id) {
      return res.status(400).json({ error: 'Fecha, salón y turno son requeridos' });
    }

    const connection = getConnection();

    // Verificar que el salón existe y está activo
    const [salon] = await connection.execute(
      'SELECT * FROM salones WHERE salon_id = ? AND activo = 1',
      [salon_id]
    );

    if (salon.length === 0) {
      return res.status(400).json({ error: 'Salón no encontrado' });
    }

    // Verificar que el turno existe y está activo
    const [turno] = await connection.execute(
      'SELECT * FROM turnos WHERE turno_id = ? AND activo = 1',
      [turno_id]
    );

    if (turno.length === 0) {
      return res.status(400).json({ error: 'Turno no encontrado' });
    }

    // Verificar disponibilidad del salón en la fecha y turno
    const [reservasExistentes] = await connection.execute(
      'SELECT reserva_id FROM reservas WHERE fecha_reserva = ? AND salon_id = ? AND turno_id = ? AND activo = 1',
      [fecha_reserva, salon_id, turno_id]
    );

    if (reservasExistentes.length > 0) {
      return res.status(400).json({ error: 'El salón ya está reservado para esa fecha y turno' });
    }

    // Calcular importe total
    let importe_total = parseFloat(salon[0].importe);
    let importe_salon = parseFloat(salon[0].importe);

    // Crear la reserva
    const [result] = await connection.execute(
      'INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, tematica, foto_cumpleaniero, importe_salon, importe_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fecha_reserva, salon_id, req.user.usuario_id, turno_id, tematica, foto_cumpleaniero, importe_salon, importe_total]
    );

    const reserva_id = result.insertId;

    // Agregar servicios si se proporcionan
    if (servicios && servicios.length > 0) {
      for (const servicio of servicios) {
        const [servicioData] = await connection.execute(
          'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
          [servicio.servicio_id]
        );

        if (servicioData.length > 0) {
          const importe_servicio = parseFloat(servicio.importe || servicioData[0].importe);
          importe_total += importe_servicio;

          await connection.execute(
            'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
            [reserva_id, servicio.servicio_id, importe_servicio]
          );
        }
      }

      // Actualizar el importe total de la reserva
      await connection.execute(
        'UPDATE reservas SET importe_total = ? WHERE reserva_id = ?',
        [importe_total, reserva_id]
      );
    }

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reserva_id: reserva_id,
      importe_total: importe_total
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar reserva
export const updateReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_reserva, salon_id, turno_id, tematica, foto_cumpleaniero, servicios } = req.body;

    const connection = getConnection();

    // Verificar que la reserva existe y pertenece al usuario (o es administrador)
    let query = 'SELECT * FROM reservas WHERE reserva_id = ? AND activo = 1';
    let params = [id];

    if (req.user.tipo_usuario !== 1) {
      query += ' AND usuario_id = ?';
      params.push(req.user.usuario_id);
    }

    const [reserva] = await connection.execute(query, params);

    if (reserva.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Verificar disponibilidad si se cambia fecha, salón o turno
    if (fecha_reserva || salon_id || turno_id) {
      const fecha = fecha_reserva || reserva[0].fecha_reserva;
      const salon = salon_id || reserva[0].salon_id;
      const turno = turno_id || reserva[0].turno_id;

      const [reservasExistentes] = await connection.execute(
        'SELECT reserva_id FROM reservas WHERE fecha_reserva = ? AND salon_id = ? AND turno_id = ? AND activo = 1 AND reserva_id != ?',
        [fecha, salon, turno, id]
      );

      if (reservasExistentes.length > 0) {
        return res.status(400).json({ error: 'El salón ya está reservado para esa fecha y turno' });
      }
    }

    // Actualizar la reserva
    await connection.execute(
      'UPDATE reservas SET fecha_reserva = ?, salon_id = ?, turno_id = ?, tematica = ?, foto_cumpleaniero = ?, modificado = CURRENT_TIMESTAMP WHERE reserva_id = ?',
      [fecha_reserva, salon_id, turno_id, tematica, foto_cumpleaniero, id]
    );

    // Actualizar servicios si se proporcionan
    if (servicios) {
      // Eliminar servicios existentes
      await connection.execute('DELETE FROM reservas_servicios WHERE reserva_id = ?', [id]);

      // Agregar nuevos servicios
      let importe_total = parseFloat(reserva[0].importe_salon);

      for (const servicio of servicios) {
        const [servicioData] = await connection.execute(
          'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
          [servicio.servicio_id]
        );

        if (servicioData.length > 0) {
          const importe_servicio = parseFloat(servicio.importe || servicioData[0].importe);
          importe_total += importe_servicio;

          await connection.execute(
            'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
            [id, servicio.servicio_id, importe_servicio]
          );
        }
      }

      // Actualizar el importe total
      await connection.execute(
        'UPDATE reservas SET importe_total = ? WHERE reserva_id = ?',
        [importe_total, id]
      );
    }

    res.json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar reserva
export const deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = getConnection();

    // Verificar que la reserva existe y pertenece al usuario (o es administrador)
    let query = 'SELECT * FROM reservas WHERE reserva_id = ? AND activo = 1';
    let params = [id];

    if (req.user.tipo_usuario !== 1) {
      query += ' AND usuario_id = ?';
      params.push(req.user.usuario_id);
    }

    const [reserva] = await connection.execute(query, params);

    if (reserva.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Eliminar servicios asociados
    await connection.execute('DELETE FROM reservas_servicios WHERE reserva_id = ?', [id]);

    // Marcar reserva como inactiva
    await connection.execute(
      'UPDATE reservas SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE reserva_id = ?',
      [id]
    );

    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

import puppeteer from 'puppeteer';
import createCsvWriter from 'csv-writer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { ReservaDAO } from '../dao/reservaDAO.js';
import { ReservaServicioDAO } from '../dao/reservaServicioDAO.js';
import { SalonDAO } from '../dao/salonDAO.js';
import { TurnoDAO } from '../dao/turnoDAO.js';
import { UsuarioDAO } from '../dao/usuarioDAO.js';
import { ServicioDAO } from '../dao/servicioDAO.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener todas las reservas con datos completos para reportes
async function obtenerReservasCompletas() {
  const reservas = await ReservaDAO.findAll();
  const reservasCompletas = [];

  for (const reserva of reservas) {
    // Los datos básicos ya vienen del JOIN en findAll
    const cliente = await UsuarioDAO.findById(reserva.usuario_id);
    const salon = await SalonDAO.findById(reserva.salon_id);
    const turno = await TurnoDAO.findById(reserva.turno_id);
    const serviciosReserva = await ReservaServicioDAO.findByReservaId(reserva.reserva_id);
    
    // Obtener detalles completos de servicios
    const serviciosDetalle = [];
    for (const rs of serviciosReserva) {
      const servicio = await ServicioDAO.findById(rs.servicio_id);
      if (servicio) {
        serviciosDetalle.push({
          descripcion: servicio.descripcion,
          importe: parseFloat(rs.importe)
        });
      }
    }

    reservasCompletas.push({
      reserva_id: reserva.reserva_id,
      fecha_reserva: reserva.fecha_reserva,
      cliente: {
        nombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : `${reserva.nombre} ${reserva.apellido}`,
        email: cliente ? cliente.nombre_usuario : 'N/A',
        celular: cliente ? (cliente.celular || 'N/A') : 'N/A'
      },
      salon: {
        titulo: salon ? salon.titulo : reserva.salon_titulo,
        direccion: salon ? salon.direccion : 'N/A',
        capacidad: salon ? salon.capacidad : 'N/A'
      },
      turno: {
        hora_desde: turno ? turno.hora_desde : reserva.hora_desde,
        hora_hasta: turno ? turno.hora_hasta : reserva.hora_hasta
      },
      tematica: reserva.tematica || 'No especificada',
      servicios: serviciosDetalle,
      importe_salon: parseFloat(reserva.importe_salon || 0),
      importe_total: parseFloat(reserva.importe_total || 0),
      creado: reserva.creado
    });
  }

  return reservasCompletas;
}

// Generar reporte PDF
export const generarReportePDF = async (req, res) => {
  try {
    const reservas = await obtenerReservasCompletas();

    if (reservas.length === 0) {
      return res.status(404).json({ error: 'No hay reservas para generar el reporte' });
    }

    // Generar HTML para el PDF
    const htmlContent = generarHTMLReporte(reservas);

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-reservas.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar reporte PDF:', error);
    res.status(500).json({ error: 'Error al generar el reporte PDF' });
  }
};

// Generar reporte CSV
export const generarReporteCSV = async (req, res) => {
  try {
    const reservas = await obtenerReservasCompletas();

    if (reservas.length === 0) {
      return res.status(404).json({ error: 'No hay reservas para generar el reporte' });
    }

    // Preparar datos para CSV
    const csvData = [];
    for (const r of reservas) {
      const serviciosTexto = r.servicios.map(s => `${s.descripcion} ($${s.importe})`).join('; ');
      
      csvData.push({
        'ID Reserva': r.reserva_id,
        'Fecha Reserva': r.fecha_reserva,
        'Cliente': r.cliente.nombre,
        'Email Cliente': r.cliente.email,
        'Celular Cliente': r.cliente.celular,
        'Salón': r.salon.titulo,
        'Dirección Salón': r.salon.direccion,
        'Capacidad Salón': r.salon.capacidad,
        'Turno': `${r.turno.hora_desde} - ${r.turno.hora_hasta}`,
        'Temática': r.tematica,
        'Servicios': serviciosTexto || 'Ninguno',
        'Importe Salón': r.importe_salon,
        'Importe Total': r.importe_total,
        'Fecha Creación': r.creado
      });
    }

    // Crear archivo CSV temporal
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: path.join(__dirname, '../../temp/reporte-reservas.csv'),
      header: [
        { id: 'ID Reserva', title: 'ID Reserva' },
        { id: 'Fecha Reserva', title: 'Fecha Reserva' },
        { id: 'Cliente', title: 'Cliente' },
        { id: 'Email Cliente', title: 'Email Cliente' },
        { id: 'Celular Cliente', title: 'Celular Cliente' },
        { id: 'Salón', title: 'Salón' },
        { id: 'Dirección Salón', title: 'Dirección Salón' },
        { id: 'Capacidad Salón', title: 'Capacidad Salón' },
        { id: 'Turno', title: 'Turno' },
        { id: 'Temática', title: 'Temática' },
        { id: 'Servicios', title: 'Servicios' },
        { id: 'Importe Salón', title: 'Importe Salón' },
        { id: 'Importe Total', title: 'Importe Total' },
        { id: 'Fecha Creación', title: 'Fecha Creación' }
      ]
    });

    // Asegurar que existe el directorio temp
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    await csvWriter.writeRecords(csvData);

    // Leer y enviar el archivo CSV
    const csvBuffer = fs.readFileSync(path.join(__dirname, '../../temp/reporte-reservas.csv'));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-reservas.csv');
    res.send(csvBuffer);

    // Eliminar archivo temporal después de enviarlo
    setTimeout(() => {
      try {
        fs.unlinkSync(path.join(__dirname, '../../temp/reporte-reservas.csv'));
      } catch (err) {
        console.error('Error al eliminar archivo temporal:', err);
      }
    }, 1000);
  } catch (error) {
    console.error('Error al generar reporte CSV:', error);
    res.status(500).json({ error: 'Error al generar el reporte CSV' });
  }
};

// Función auxiliar para generar HTML del reporte
function generarHTMLReporte(reservas) {
  let serviciosHTML = '';
  let reservasHTML = '';

  reservas.forEach((r, index) => {
    const serviciosList = r.servicios.map(s => 
      `<li>${s.descripcion} - $${s.importe.toLocaleString('es-AR')}</li>`
    ).join('');

    reservasHTML += `
      <div class="reserva-item" style="page-break-inside: avoid; margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="color: #4CAF50; margin-top: 0;">Reserva #${r.reserva_id}</h3>
        
        <div class="info-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
          <div>
            <h4 style="color: #666; margin-bottom: 10px;">📅 Información de la Reserva</h4>
            <p><strong>Fecha:</strong> ${new Date(r.fecha_reserva).toLocaleDateString('es-AR')}</p>
            <p><strong>Temática:</strong> ${r.tematica}</p>
            <p><strong>Importe Total:</strong> <span style="color: #4CAF50; font-size: 1.2em; font-weight: bold;">$${r.importe_total.toLocaleString('es-AR')}</span></p>
          </div>
          
          <div>
            <h4 style="color: #666; margin-bottom: 10px;">👤 Información del Cliente</h4>
            <p><strong>Nombre:</strong> ${r.cliente.nombre}</p>
            <p><strong>Email:</strong> ${r.cliente.email}</p>
            <p><strong>Celular:</strong> ${r.cliente.celular}</p>
          </div>
        </div>

        <div class="info-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
          <div>
            <h4 style="color: #666; margin-bottom: 10px;">🏢 Información del Salón</h4>
            <p><strong>Salón:</strong> ${r.salon.titulo}</p>
            <p><strong>Dirección:</strong> ${r.salon.direccion}</p>
            <p><strong>Capacidad:</strong> ${r.salon.capacidad} personas</p>
            <p><strong>Importe Salón:</strong> $${r.importe_salon.toLocaleString('es-AR')}</p>
          </div>
          
          <div>
            <h4 style="color: #666; margin-bottom: 10px;">⏰ Información del Turno</h4>
            <p><strong>Horario:</strong> ${r.turno.hora_desde} - ${r.turno.hora_hasta}</p>
          </div>
        </div>

        ${r.servicios.length > 0 ? `
        <div class="servicios-section" style="margin-top: 15px;">
          <h4 style="color: #666; margin-bottom: 10px;">🎁 Servicios Incluidos</h4>
          <ul style="list-style: none; padding: 0;">
            ${serviciosList}
          </ul>
        </div>
        ` : '<p><em>No se incluyeron servicios adicionales</em></p>'}
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Reservas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #4CAF50;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .summary {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 30px;
        }
        .summary p {
          margin: 5px 0;
        }
        .reserva-item {
          background-color: #fff;
        }
        @media print {
          .reserva-item {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Reporte de Reservas</h1>
        <p>Sistema de Gestión de Reservas PROGIII</p>
        <p>Fecha de generación: ${new Date().toLocaleString('es-AR')}</p>
      </div>
      
      <div class="summary">
        <h3 style="margin-top: 0; color: #4CAF50;">Resumen</h3>
        <p><strong>Total de reservas:</strong> ${reservas.length}</p>
        <p><strong>Importe total:</strong> $${reservas.reduce((sum, r) => sum + r.importe_total, 0).toLocaleString('es-AR')}</p>
      </div>

      ${reservasHTML}
    </body>
    </html>
  `;
}


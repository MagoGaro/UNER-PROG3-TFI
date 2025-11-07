-- =============================================
-- Stored Procedures para Estadísticas
-- Sistema de Gestión de Reservas de Salones
-- =============================================

-- Eliminar stored procedures si existen (para recrearlos)
DROP PROCEDURE IF EXISTS sp_get_total_reservas;
DROP PROCEDURE IF EXISTS sp_get_reservas_por_mes;
DROP PROCEDURE IF EXISTS sp_get_salones_populares;
DROP PROCEDURE IF EXISTS sp_get_ingresos_totales;

-- =============================================
-- Stored Procedure: sp_get_total_reservas
-- Descripción: Obtiene el total de reservas activas
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_get_total_reservas()
BEGIN
    SELECT COUNT(*) as total 
    FROM reservas 
    WHERE activo = 1;
END$$

DELIMITER ;

-- =============================================
-- Stored Procedure: sp_get_reservas_por_mes
-- Descripción: Obtiene las reservas agrupadas por mes (últimos 12 meses)
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_get_reservas_por_mes()
BEGIN
    SELECT 
        DATE_FORMAT(fecha_reserva, '%Y-%m') as mes,
        COUNT(*) as cantidad
    FROM reservas 
    WHERE activo = 1 
    GROUP BY DATE_FORMAT(fecha_reserva, '%Y-%m')
    ORDER BY mes DESC
    LIMIT 12;
END$$

DELIMITER ;

-- =============================================
-- Stored Procedure: sp_get_salones_populares
-- Descripción: Obtiene los salones más populares ordenados por cantidad de reservas
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_get_salones_populares()
BEGIN
    SELECT 
        s.salon_id,
        s.titulo,
        COUNT(r.reserva_id) as reservas
    FROM salones s
    LEFT JOIN reservas r ON s.salon_id = r.salon_id AND r.activo = 1
    WHERE s.activo = 1
    GROUP BY s.salon_id, s.titulo
    ORDER BY reservas DESC;
END$$

DELIMITER ;

-- =============================================
-- Stored Procedure: sp_get_ingresos_totales
-- Descripción: Obtiene el total de ingresos de todas las reservas activas
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_get_ingresos_totales()
BEGIN
    SELECT COALESCE(SUM(importe_total), 0) as total_ingresos
    FROM reservas 
    WHERE activo = 1;
END$$

DELIMITER ;


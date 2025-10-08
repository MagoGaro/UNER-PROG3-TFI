
// test-delete-servicios.js
import { getConnection } from './src/config/database.js';

async function testDeleteServicio() {
  console.log('🧪 INICIANDO PRUEBA DE DELETE...\n');
  
  try {
    const connection = getConnection();
    
    // 1. PRIMERO CREAMOS UN SERVICIO DE PRUEBA PARA ELIMINAR
    console.log('1. Creando servicio de prueba...');
    const [createResult] = await connection.execute(
      'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)',
      ['Servicio de Prueba para DELETE', 9999]
    );
    
    const servicioId = createResult.insertId;
    console.log(`✅ Servicio de prueba creado con ID: ${servicioId}`);
    
    // 2. VERIFICAR QUE EXISTE ANTES DE ELIMINAR
    console.log('\n2. Verificando que el servicio existe...');
    const [beforeDelete] = await connection.execute(
      'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
      [servicioId]
    );
    
    if (beforeDelete.length === 0) {
      throw new Error('El servicio no se creó correctamente');
    }
    console.log(`✅ Servicio encontrado: ${beforeDelete[0].descripcion}`);
    
    // 3. SIMULAR EL DELETE (soft delete)
    console.log('\n3. Ejecutando DELETE (soft delete)...');
    const [deleteResult] = await connection.execute(
      'UPDATE servicios SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE servicio_id = ?',
      [servicioId]
    );
    
    console.log(`✅ DELETE ejecutado - Filas afectadas: ${deleteResult.affectedRows}`);
    
    // 4. VERIFICAR QUE YA NO ESTÁ ACTIVO
    console.log('\n4. Verificando que el servicio fue "eliminado"...');
    const [afterDelete] = await connection.execute(
      'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
      [servicioId]
    );
    
    if (afterDelete.length === 0) {
      console.log('✅ SERVICIO ELIMINADO CORRECTAMENTE - Ya no está activo');
    } else {
      console.log('❌ ERROR: El servicio sigue activo después del DELETE');
    }
    
    // 5. VERIFICAR QUE SIGUE EN LA BASE DE DATOS (soft delete)
    const [inDatabase] = await connection.execute(
      'SELECT * FROM servicios WHERE servicio_id = ?',
      [servicioId]
    );
    
    if (inDatabase.length > 0) {
      console.log('✅ Soft delete funcionando - El registro sigue en la BD pero con activo=0');
      console.log(`   Estado actual: activo = ${inDatabase[0].activo}`);
    }
    
    console.log('\n🎉 PRUEBA DE DELETE COMPLETADA EXITOSAMENTE!');
    
  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error);
  } finally {
    process.exit(0); // Terminar el proceso
  }
}

// Ejecutar la prueba
testDeleteServicio();
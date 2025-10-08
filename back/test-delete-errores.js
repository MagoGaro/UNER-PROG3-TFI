
// test-delete-errores.js
import { getConnection } from './src/config/database.js';

async function testDeleteErrores() {
  console.log('🧪 INICIANDO PRUEBAS DE ERRORES EN DELETE...\n');
  
  try {
    const connection = getConnection();
    
    // 1. INTENTAR ELIMINAR SERVICIO QUE NO EXISTE
    console.log('1. Probando DELETE de servicio inexistente...');
    const servicioInexistenteId = 9999;
    
    const [result1] = await connection.execute(
      'UPDATE servicios SET activo = 0 WHERE servicio_id = ?',
      [servicioInexistenteId]
    );
    
    console.log(`   Filas afectadas: ${result1.affectedRows}`);
    if (result1.affectedRows === 0) {
      console.log('✅ CORRECTO: No se afectaron filas al eliminar servicio inexistente');
    }
    
    // 2. INTENTAR ELIMINAR SERVICIO YA ELIMINADO
    console.log('\n2. Probando DELETE de servicio ya eliminado...');
    
    // Primero encontrar un servicio ya eliminado
    const [eliminados] = await connection.execute(
      'SELECT servicio_id FROM servicios WHERE activo = 0 LIMIT 1'
    );
    
    if (eliminados.length > 0) {
      const servicioYaEliminadoId = eliminados[0].servicio_id;
      const [result2] = await connection.execute(
        'UPDATE servicios SET activo = 0 WHERE servicio_id = ?',
        [servicioYaEliminadoId]
      );
      
      console.log(`   Filas afectadas: ${result2.affectedRows}`);
      if (result2.affectedRows === 0) {
        console.log('✅ CORRECTO: No se afectaron filas al eliminar servicio ya eliminado');
      }
    } else {
      console.log('   ℹ️  No hay servicios eliminados para probar');
    }
    
    console.log('\n🎉 PRUEBAS DE ERRORES COMPLETADAS!');
    
  } catch (error) {
    console.error('❌ ERROR EN LAS PRUEBAS:', error);
  } finally {
    process.exit(0);
  }
}

testDeleteErrores();
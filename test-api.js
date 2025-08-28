// Script de prueba para verificar la API
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Probando API del backend...\n');

  try {
    // 1. Probar endpoint de promociones-carrusel
    console.log('1️⃣ Probando GET /api/promociones-carrusel...');
    const carruselResponse = await fetch(`${API_BASE_URL}/promociones-carrusel`);
    const carruselData = await carruselResponse.json();
    
    if (carruselResponse.ok) {
      console.log('✅ Carrusel API funcionando');
      console.log('   Estado:', carruselData.estado);
      console.log('   Carruseles encontrados:', carruselData.carruseles?.length || 0);
      if (carruselData.carruseles?.length > 0) {
        console.log('   Primer carrusel:', carruselData.carruseles[0]);
      }
    } else {
      console.log('❌ Error en carrusel API:', carruselData);
    }

    console.log('\n2️⃣ Probando GET /api/obtener_promociones...');
    const promocionesResponse = await fetch(`${API_BASE_URL}/obtener_promociones`);
    const promocionesData = await promocionesResponse.json();
    
    if (promocionesResponse.ok) {
      console.log('✅ Promociones API funcionando');
      console.log('   Estado:', promocionesData.estado);
      console.log('   Promociones encontradas:', promocionesData.promociones?.length || 0);
      if (promocionesData.promociones?.length > 0) {
        const primeraPromo = promocionesData.promociones[0];
        console.log('   Primera promoción:', {
          id: primeraPromo.id,
          institucion: primeraPromo.institucion,
          estado: primeraPromo.estado,
          fecha_inicio: primeraPromo.fecha_inicio,
          fecha_fin: primeraPromo.fecha_fin
        });
      }
    } else {
      console.log('❌ Error en promociones API:', promocionesData);
    }

    // 3. Probar endpoint de debug
    console.log('\n3️⃣ Probando GET /api/debug-promociones...');
    const debugResponse = await fetch(`${API_BASE_URL}/debug-promociones`);
    const debugData = await debugResponse.json();
    
    if (debugResponse.ok) {
      console.log('✅ Debug API funcionando');
      console.log('   Total promociones:', debugData.total);
      if (debugData.promociones?.length > 0) {
        console.log('   Estados de promociones:');
        const estados = {};
        debugData.promociones.forEach(p => {
          estados[p.estado] = (estados[p.estado] || 0) + 1;
        });
        Object.entries(estados).forEach(([estado, count]) => {
          console.log(`     ${estado}: ${count}`);
        });
      }
    } else {
      console.log('❌ Error en debug API:', debugData);
    }

  } catch (error) {
    console.error('💥 Error conectando con la API:', error.message);
    console.log('\n🔧 Verifica que:');
    console.log('   1. El servidor backend esté corriendo en puerto 3001');
    console.log('   2. La base de datos MySQL esté funcionando');
    console.log('   3. Las credenciales de la BD sean correctas');
  }
}

// Ejecutar la prueba
testAPI();

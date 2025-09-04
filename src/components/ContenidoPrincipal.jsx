import React, { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import { useCarrusel } from '../context/CarruselContext'

const ContenidoPrincipal = () => {
  // Usar el contexto para controlar la visibilidad de carruseles
  const { carruseles: carruselConfig, getCarruselVisible } = useCarrusel();
  
  // Estado para las promociones dinámicas
  const [carruseles, setCarruseles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para cada carrusel
  const [currentImages, setCurrentImages] = useState({})
  
  // Control de última actualización para evitar actualizaciones innecesarias
  const [ultimaActualizacion, setUltimaActualizacion] = useState(0)

  // Función para cargar promociones
  const cargarPromociones = async (actualizar = false) => {
    console.log('🚀 Iniciando carga de promociones...', { actualizar, timestamp: new Date().toISOString() });
    try {
      setLoading(true)
      
      // Verificar conectividad con el backend
      const startTime = Date.now();
      const response = await apiService.obtenerPromocionesCarrusel()
      const responseTime = Date.now() - startTime;
      
      console.log('📊 Respuesta del API:', response);
      console.log('⏱️ Tiempo de respuesta:', responseTime, 'ms');
      
      if (response.estado === 'exito') {
        // Filtrar solo promociones activas (aunque el backend ya lo hace, es una doble verificación)
        const promocionesActivas = response.carruseles.filter(carrusel => 
          carrusel.imagenes && carrusel.imagenes.length > 0
        );
        
        console.log('✅ Promociones activas filtradas:', promocionesActivas);
        
        setCarruseles(promocionesActivas)
        setUltimaActualizacion(Date.now())
        
        // Inicializar estados de navegación para cada carrusel
        const estadosIniciales = promocionesActivas.reduce((acc, carrusel) => {
          acc[carrusel.id] = 0
          return acc
        }, {})
        setCurrentImages(estadosIniciales)
        
        // Mostrar mensaje de éxito
        if (actualizar) {
          console.log('🎉 Carrusel actualizado exitosamente');
        }
      } else {
        console.error('❌ Error en respuesta del API:', response);
        setError('Error al cargar las promociones')
      }
    } catch (error) {
      console.error('💥 Error al cargar promociones:', error);
      
      // Verificar si es un error de conectividad
      if (error.message.includes('fetch') || error.message.includes('network')) {
        setError('❌ No se puede conectar con el servidor. Verifica que el backend esté corriendo en puerto 3001.')
      } else {
        setError('Error al cargar las promociones: ' + error.message)
      }
    } finally {
      setLoading(false)
      console.log('🏁 Carga de promociones completada');
    }
  }

  // Cargar promociones solo una vez al montar el componente
  useEffect(() => {
    cargarPromociones()
  }, [])

  // Escuchar cambios en el localStorage para actualización inmediata
  useEffect(() => {
    console.log('🔧 Configurando event listeners en ContenidoPrincipal...');
    
    const handleStorageChange = (e) => {
      console.log('📡 Evento storage detectado:', e.key, e.newValue);
      if (e.key === 'promocionEstadoCambiado') {
        // Actualizar inmediatamente cuando cambie el estado de una promoción
        console.log('🔄 Estado de promoción cambiado, recargando carruseles...');
        cargarPromociones()
        // Limpiar el flag
        localStorage.removeItem('promocionEstadoCambiado')
      }
    }

    // Escuchar evento personalizado para actualización más rápida
    const handlePromocionEstadoCambiado = (e) => {
      console.log('🎯 Evento personalizado recibido:', e.detail);
      console.log('🔄 Recargando carruseles desde evento personalizado...');
      cargarPromociones()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('promocionEstadoCambiado', handlePromocionEstadoCambiado)
    
    console.log('✅ Event listeners configurados correctamente');
    
    return () => {
      console.log('🧹 Limpiando event listeners...');
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('promocionEstadoCambiado', handlePromocionEstadoCambiado)
    }
  }, [])

  // Funciones de navegación reutilizables
  const nextImage = (carruselId) => {
    setCurrentImages(prev => ({
      ...prev,
      [carruselId]: (prev[carruselId] + 1) % carruseles.find(c => c.id === carruselId).imagenes.length
    }))
  }

  const prevImage = (carruselId) => {
    const carrusel = carruseles.find(c => c.id === carruselId)
    setCurrentImages(prev => ({
      ...prev,
      [carruselId]: (prev[carruselId] - 1 + carrusel.imagenes.length) % carrusel.imagenes.length
    }))
  }

  // Componente de carrusel reutilizable
  const Carrusel = ({ carrusel }) => {
    const currentImage = currentImages[carrusel.id] || 0
    const totalImages = carrusel.imagenes.length

    return (
      <div className="mb-0">
        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <div className="relative h-[200px] md:h-[500px] overflow-hidden">
              {carrusel.imagenes.map((imagen, index) => (
               <img
               key={index}
               src={imagen}
               alt={`Promoción ${carrusel.institucion} ${index + 1}`}
               className={`absolute inset-0 w-full h-full object-contain transition-transform duration-700 ease-in-out ${
                 index === currentImage ? 'translate-x-0' : 
                 index < currentImage ? '-translate-x-full' : 'translate-x-full'
               }`}
               />
              ))}
            </div>
          </div>
          
          {/* Navegación */}
          {totalImages > 1 && currentImage > 0 && (
            <button
              onClick={() => prevImage(carrusel.id)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-orange-500 rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {totalImages > 1 && currentImage < totalImages - 1 && (
            <button
              onClick={() => nextImage(carrusel.id)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-orange-500 rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Información de la institución - REMOVIDO */}
      </div>
    )
  }

  // Mostrar loading mientras se cargan las promociones
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[1090px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando promociones...</p>
          </div>
        </div>
      </section>
    )
  }

  // Mostrar error si algo falló
  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[1090px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Mostrar mensaje si no hay promociones
  if (carruseles.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[1090px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              No hay promociones disponibles
            </h2>
            <p className="text-gray-600">
              Las promociones aparecerán aquí una vez que sean cargadas desde el formulario.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-1 md:py-16 bg-white">
      <div className="max-w-[1090px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sección de header */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center mb-2 md:mb-0">
          <div className="flex justify-start">
            <img 
              src="/images/culturaaaaaaaaaalaccesssssslogo-04.png" 
              alt="Logo CULTURALL ACCESS - Nuevo León"
              className="rounded-lg max-w-xs h-auto"
            />
          </div>
          <div className="space-y-1 ml-0 md:ml-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  PROMOCIONES VIGENTES
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  Presentando tarjeta y hasta agotar disponibilidad
                </p>
                
              
              </div>
              
            </div>
          </div>
        </div>

        {/* Carruseles dinámicos desde la base de datos */}
        {carruseles.map(carrusel => {
          // Solo mostrar el carrusel si está configurado como visible Y tiene promociones
          const carruselId = carrusel.institucion.toLowerCase().includes('ballet') ? 'principal' : 
                            carrusel.institucion.toLowerCase().includes('teatro') ? 'secundario' : 'destacados';
          
          const isVisible = getCarruselVisible(carruselId);
          const hasPromociones = carrusel.imagenes && carrusel.imagenes.length > 0;
          
          // Solo mostrar si está visible Y tiene promociones activas
          if (!isVisible || !hasPromociones) {
            return null;
          }
          
          // Los carruseles se muestran en el orden que vienen del backend:
          // - Los más antiguos aparecen primero (arriba)
          // - Los nuevos se agregan abajo
          return <Carrusel key={carrusel.id} carrusel={carrusel} />;
        })}
        
        {/* Mensaje cuando no hay carruseles visibles */}
        {carruseles.filter(carrusel => {
          const carruselId = carrusel.institucion.toLowerCase().includes('ballet') ? 'principal' : 
                            carrusel.institucion.toLowerCase().includes('teatro') ? 'secundario' : 'destacados';
          return getCarruselVisible(carruselId) && carrusel.imagenes && carrusel.imagenes.length > 0;
        }).length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay promociones activas disponibles
            </h3>
            <p className="text-gray-500">
              Las promociones aparecerán aquí una vez que sean activadas desde el AdminDashboard.
            </p>
          </div>
        )}
        
      </div>
    </section>
  )
}

export default ContenidoPrincipal

import React, { useState, useEffect } from 'react'
import { apiService } from '../apis'
import { useCarrusel } from '../context/CarruselContext'

const ContenidoPrincipal = () => {
  // Usar el contexto para controlar la visibilidad de carruseles, tamaño y textos editables
  const { carruseles: carruselConfig, getCarruselVisible, getClaseTamanoCarrusel, textosPromociones } = useCarrusel();
  
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
    try {
      setLoading(true)
      setError(null) // Limpiar errores previos
      
      // Verificar conectividad con el backend
      // Usar el endpoint completo que incluye fechas
      const response = await apiService.obtenerPromocionesAdmin()
      
      if (response.estado === 'exito' || response.success === true) {
        // Normalizar URLs de imágenes (cuando vienen relativas del backend)
        const BASE_HOST = 'https://culturallaccess.com';
        const normalizeUrl = (url) => {
          if (!url) return url;
          return url.startsWith('http') ? url : `${BASE_HOST}${url}`;
        };

        // Obtener promociones del endpoint completo
        const promociones = response.promociones || response.data || [];
        
        // Mapear, filtrar y ordenar promociones alfabéticamente por institución (A-Z)
        const promocionesActivas = promociones
          .map(promocion => ({
            ...promocion,
            imagenes: [promocion.imagen_principal, promocion.imagen_secundaria]
              .filter(Boolean)
              .map(normalizeUrl)
          }))
          .filter(carrusel => {
            // Verificar que tenga imágenes
            if (!carrusel.imagenes || carrusel.imagenes.length === 0) {
              return false;
            }
            
            // Verificar estado
            if (carrusel.estado === 'inactiva' || carrusel.estado === 'expirada') {
              return false;
            }
            
            // Verificar que no esté expirada por fecha
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            // Buscar fecha de fin en diferentes campos posibles
            const fechaFinStr = carrusel.fecha_fin || carrusel.fechaFin || carrusel.fecha_final;
            
            if (!fechaFinStr) {
              return true; // Sin fecha de fin, mostrar siempre
            }
            
            const fechaFin = new Date(fechaFinStr);
            fechaFin.setHours(23, 59, 59, 999);
            
            // Si está expirada, no mostrar
            if (hoy > fechaFin) {
              return false;
            }
            
            return true;
          })
          .sort((a, b) => {
            // Ordenar alfabéticamente por institución (A-Z)
            const institucionA = (a.institucion || '').toLowerCase();
            const institucionB = (b.institucion || '').toLowerCase();
            return institucionA.localeCompare(institucionB, 'es', { sensitivity: 'base' });
          });
        
        setCarruseles(promocionesActivas)
        setUltimaActualizacion(Date.now())
        
        // Inicializar estados de navegación para cada carrusel
        const estadosIniciales = promocionesActivas.reduce((acc, carrusel) => {
          acc[carrusel.id] = 0
          return acc
        }, {})
        setCurrentImages(estadosIniciales)
      } else {
        setError('Error al cargar las promociones: ' + (response.mensaje || 'Respuesta inválida del servidor'))
      }
    } catch (error) {
      
      // Verificar si es un error de conectividad
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        setError('❌ No se puede conectar con el servidor. Verifica que el backend esté corriendo en https://culturallaccess.com')
      } else if (error.message.includes('404')) {
        setError('❌ El endpoint no existe. Verifica que el backend tenga configurado el endpoint /promociones-carrusel')
      } else if (error.message.includes('500')) {
        setError('❌ Error interno del servidor. Revisa los logs del backend')
      } else {
        setError('Error al cargar las promociones: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Cargar promociones solo una vez al montar el componente
  useEffect(() => {
    cargarPromociones()
  }, [])

  // Escuchar cambios en el localStorage para actualización inmediata
  useEffect(() => {
    
    const handleStorageChange = (e) => {
      if (e.key === 'promocionEstadoCambiado') {
        // Actualizar inmediatamente cuando cambie el estado de una promoción
        cargarPromociones()
        // Limpiar el flag
        localStorage.removeItem('promocionEstadoCambiado')
      }
    }

    // Escuchar evento personalizado para actualización más rápida
    const handlePromocionEstadoCambiado = (e) => {
      cargarPromociones()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('promocionEstadoCambiado', handlePromocionEstadoCambiado)
    
    
    return () => {
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
    const totalImages = carrusel.imagenes?.length || 0

    return (
      <div className="mb-6 sm:mb-8 md:mb-10">
        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <div className={`relative w-full max-w-[855px] mx-auto overflow-hidden`} style={{ aspectRatio: '855/334', height: '334px' }}>
              {carrusel.imagenes.map((imagen, index) => (
               <img
               key={index}
               src={imagen}
               alt={`Promoción ${carrusel.institucion} ${index + 1}`}
               className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-in-out ${
                 index === currentImage ? 'translate-x-0' : 
                 index < currentImage ? '-translate-x-full' : 'translate-x-full'
               }`}
               style={{ objectFit: 'cover', objectPosition: 'center' }}
               />
              ))}
              
              {/* Navegación - Botones responsivos sobre las imágenes */}
              {totalImages > 1 && currentImage > 0 && (
                <button
                  onClick={() => prevImage(carrusel.id)}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-orange-500 rounded-full p-2 sm:p-3 transition-all duration-200 shadow-lg hover:shadow-xl z-20"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {totalImages > 1 && currentImage < totalImages - 1 && (
                <button
                  onClick={() => nextImage(carrusel.id)}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-orange-500 rounded-full p-2 sm:p-3 transition-all duration-200 shadow-lg hover:shadow-xl z-20"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
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
    <section className="py-4 sm:py-8 md:py-12 lg:py-16 bg-white">
      <div className="max-w-[100%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%] xl:max-w-[1090px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Sección de header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="flex justify-center">
            <img 
              src="/images/culturaaaaaaaaaalaccesssssslogo-04.png" 
              alt="Logo CULTURALL ACCESS - Nuevo León"
              className="rounded-lg max-w-[200px] sm:max-w-[250px] md:max-w-xs h-auto"
            />
          </div>
          <div className="space-y-2 sm:space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start">
              <div>
                <h1 className="font-semibold text-gray-800 text-center" style={{ fontSize: '20px' }}>
                  PROMOCIONES VIGENTES - MARZO
                </h1>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg font-medium text-center">
                  Presentando tarjeta y sujetas a disponibilidad
                </p>
              </div>
              
            </div>
          </div>
        </div>

        {/* Carruseles dinámicos desde la base de datos */}
        {carruseles.map(carrusel => {
          // Clasificar cada promoción en su carrusel correspondiente
          // Si el carrusel asignado no está visible, usar 'destacados' como fallback
          let carruselId = carrusel.institucion.toLowerCase().includes('ballet') ? 'principal' : 
                          carrusel.institucion.toLowerCase().includes('teatro') ? 'secundario' : 'destacados';
          
          // Verificar si el carrusel asignado está visible, si no, usar 'destacados'
          const carruselAsignadoVisible = getCarruselVisible(carruselId);
          if (!carruselAsignadoVisible && carruselId !== 'destacados') {
            // Si el carrusel asignado no está visible, usar 'destacados' como fallback
            carruselId = 'destacados';
          }
          
          const isVisible = getCarruselVisible(carruselId);
          const hasPromociones = carrusel.imagenes && carrusel.imagenes.length > 0;
          
          // Mostrar TODAS las promociones que pertenecen a carruseles visibles
          if (!hasPromociones) {
            return null;
          }
          
          // Si el carrusel al que pertenece NO está visible, no mostrarlo
          if (!isVisible) {
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

import React, { createContext, useContext, useState, useEffect } from 'react'
import { institucionesService } from '../apis/instituciones/institucionesService'

const InstitucionesContext = createContext()

// Lista base de instituciones culturales (fallback en caso de error de conexión)
const institucionesBase = [
  'Amigos de la Historia Mexicana',
  'Ballet de Monterrey',
  'Bread Coffee Roasters',
  'Café Belmonte',
  'Casa Coa',
  'Casa de la Cultura de Nuevo León',
  'Casa Motis',
  'Casa Musa',
  'Centro Roberto Garza Sada',
  'Cineteca de Nuevo León',
  'CONARTE',
  'Constelación Feria de Arte',
  'Dramático',
  'Teatro Dramático',
  'El Lingote Restaurante',
  'Escuela Superior de Música y Danza de Monterrey',
  'La Superior',
  'Fondo de Cultura Económica',
  'Fondo Editorial de Nuevo León',
  'Fototeca de Nuevo León',
  'Heart Ego',
  'Horno 3',
  'La Gran Audiencia',
  'La Milarca',
  'Librería Bruma',
  'Librería Sentido',
  'Monstera Coffee Bar',
  'Museo 31',
  'Museo del Acero Horno 3',
  'Museo de Arte Contemporáneo de Monterrey (MARCO)',
  'Museo de la Batalla',
  'Museo de Historia Mexicana',
  'Museo del Noreste',
  'Museo del Palacio',
  'Museo del Vidrio (MUVI)',
  'Museo Estatal de Culturas Populares de Nuevo León',
  'Museo Regional de Nuevo León El Obispado',
  'Papalote Museo del Niño Monterrey',
  'Salón de la Fama de Beisbol Mexicano',
  'Fama Monterrey',
  'Saxy Jazz Club',
  'Secretaría de Cultura',
  'Seabird Coffee',
  'Teatro de la Ciudad',
  'Vaso Roto Ediciones'
]

export const InstitucionesProvider = ({ children }) => {
  const [instituciones, setInstituciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Función para cargar instituciones desde la API (reutilizable)
  const cargarInstituciones = async () => {
    try {
      setCargando(true)
      setError(null)
      console.log('🔄 Cargando instituciones desde la API...')
      const data = await institucionesService.obtenerInstituciones()
      
      console.log('📥 Datos recibidos de la API:', data)
      console.log('📥 Tipo de datos:', Array.isArray(data) ? 'Array' : typeof data)
      
      // Si la respuesta es un array de objetos con propiedad 'nombre', extraer solo los nombres
      // Si es un array de strings, usarlo directamente
      const nombresInstituciones = Array.isArray(data) 
        ? data.map(inst => {
            const nombre = typeof inst === 'string' ? inst : inst.nombre
            console.log('📝 Procesando institución:', inst, '-> nombre:', nombre)
            return nombre
          }).filter(Boolean)
        : []
      
      console.log('✅ Instituciones procesadas:', nombresInstituciones)
      console.log('📊 Total de instituciones:', nombresInstituciones.length)
      
      // Verificar si "Luztopía" está en la lista
      const tieneLuztopia = nombresInstituciones.some(inst => 
        inst.toLowerCase().includes('luztopía') || inst.toLowerCase().includes('luztopia')
      )
      console.log('🔍 ¿Contiene "Luztopía"?', tieneLuztopia)
      if (tieneLuztopia) {
        const luztopia = nombresInstituciones.find(inst => 
          inst.toLowerCase().includes('luztopía') || inst.toLowerCase().includes('luztopia')
        )
        console.log('✅ Encontrada:', luztopia)
      } else {
        console.warn('⚠️ "Luztopía" NO encontrada en la lista recibida')
        console.log('📋 Primeras 5 instituciones:', nombresInstituciones.slice(0, 5))
        console.log('📋 Últimas 5 instituciones:', nombresInstituciones.slice(-5))
      }
      
      if (nombresInstituciones.length > 0) {
        setInstituciones(nombresInstituciones)
        console.log('✅ Lista de instituciones actualizada en el contexto')
      } else {
        console.warn('⚠️ No se encontraron instituciones, usando lista base')
        // Si no hay instituciones en la BD, usar la lista base
        setInstituciones(institucionesBase)
      }
    } catch (err) {
      console.error('❌ Error al cargar instituciones desde la API:', err)
      setError(err.message)
      // En caso de error, usar la lista base como fallback
      setInstituciones(institucionesBase)
    } finally {
      setCargando(false)
    }
  }

  // Cargar instituciones desde la API al inicializar
  useEffect(() => {
    cargarInstituciones()
  }, [])

  const agregarInstitucion = async (nuevaInstitucion) => {
    if (!nuevaInstitucion) {
      console.warn('⚠️ Intento de agregar institución vacía')
      return
    }

    // Normalizar el nombre para comparación (trim y case-insensitive)
    const nombreNormalizado = nuevaInstitucion.trim()
    console.log('➕ Intentando agregar institución:', nombreNormalizado)
    
    const existe = instituciones.some(inst => 
      inst.trim().toLowerCase() === nombreNormalizado.toLowerCase()
    )

    if (existe) {
      console.warn('⚠️ La institución ya existe:', nombreNormalizado)
      return
    }

    try {
      console.log('📤 Creando institución en la base de datos...')
      // Crear la institución en la base de datos
      await institucionesService.crearInstitucion(nombreNormalizado)
      console.log('✅ Institución creada en la BD:', nombreNormalizado)
      
      // Recargar todas las instituciones desde la API para asegurar sincronización
      // Esto garantiza que todos los componentes vean la lista actualizada
      console.log('🔄 Recargando lista completa de instituciones...')
      await cargarInstituciones()
      
      console.log('✅ Institución agregada y lista recargada:', nombreNormalizado)
    } catch (err) {
      console.error('❌ Error al agregar institución:', err)
      throw err // Propagar el error para que el componente pueda manejarlo
    }
  }

  const obtenerInstituciones = () => {
    return instituciones
  }

  const buscarInstituciones = async (termino) => {
    if (!termino.trim()) return instituciones
    
    try {
      // Buscar en la API
      const resultados = await institucionesService.buscarInstituciones(termino)
      const nombres = Array.isArray(resultados)
        ? resultados.map(inst => typeof inst === 'string' ? inst : inst.nombre).filter(Boolean)
        : []
      return nombres.length > 0 ? nombres : instituciones.filter(inst =>
        inst.toLowerCase().includes(termino.toLowerCase())
      )
    } catch (err) {
      console.error('Error al buscar instituciones:', err)
      // Fallback a búsqueda local
      return instituciones.filter(inst =>
        inst.toLowerCase().includes(termino.toLowerCase())
      )
    }
  }

  const value = {
    instituciones,
    cargando,
    error,
    agregarInstitucion,
    obtenerInstituciones,
    buscarInstituciones,
    recargarInstituciones: cargarInstituciones
  }

  return (
    <InstitucionesContext.Provider value={value}>
      {children}
    </InstitucionesContext.Provider>
  )
}

export const useInstituciones = () => {
  const context = useContext(InstitucionesContext)
  if (!context) {
    throw new Error('useInstituciones debe ser usado dentro de InstitucionesProvider')
  }
  return context
}




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

  // Cargar instituciones desde la API al inicializar
  useEffect(() => {
    const cargarInstituciones = async () => {
      try {
        setCargando(true)
        setError(null)
        const data = await institucionesService.obtenerInstituciones()
        
        // Si la respuesta es un array de objetos con propiedad 'nombre', extraer solo los nombres
        // Si es un array de strings, usarlo directamente
        const nombresInstituciones = Array.isArray(data) 
          ? data.map(inst => typeof inst === 'string' ? inst : inst.nombre).filter(Boolean)
          : []
        
        if (nombresInstituciones.length > 0) {
          setInstituciones(nombresInstituciones)
        } else {
          // Si no hay instituciones en la BD, usar la lista base
          setInstituciones(institucionesBase)
        }
      } catch (err) {
        console.error('Error al cargar instituciones desde la API:', err)
        setError(err.message)
        // En caso de error, usar la lista base como fallback
        setInstituciones(institucionesBase)
      } finally {
        setCargando(false)
      }
    }

    cargarInstituciones()
  }, [])

  const agregarInstitucion = async (nuevaInstitucion) => {
    if (!nuevaInstitucion || instituciones.includes(nuevaInstitucion)) {
      return
    }

    try {
      // Crear la institución en la base de datos
      await institucionesService.crearInstitucion(nuevaInstitucion)
      // Actualizar el estado local
      setInstituciones(prev => [...prev, nuevaInstitucion])
    } catch (err) {
      console.error('Error al agregar institución:', err)
      // Aún así agregar localmente para mejor UX, pero mostrar error
      setInstituciones(prev => [...prev, nuevaInstitucion])
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
    buscarInstituciones
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




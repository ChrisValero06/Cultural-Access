import React, { createContext, useContext, useState, useEffect } from 'react'

const InstitucionesContext = createContext()

// Lista base de instituciones culturales
const institucionesBase = [
  'Ballet de Monterrey',
  'Bread Coffee Roasters',
  'Café Belmonte',
  'Casa Coa',
  'Casa de la Cultura de Nuevo León',
  'Casa Motis',
  'Casa Musa',
  'Centro Roberto Garza Sada',
  'Cineteca de Nuevo León',
  'Constelación Feria de Arte',
  'Dramático',
  'El Lingote Restaurante',
  'Escuela Superior de Música y Danza de Monterrey',
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
  'Saxy Jazz Club',
  'Secretaría de Cultura',
  'Seabird Coffee',
  'Teatro de la Ciudad',
  'Vaso Roto Ediciones'
]

export const InstitucionesProvider = ({ children }) => {
  const [instituciones, setInstituciones] = useState(institucionesBase)

  // Cargar instituciones guardadas del localStorage al inicializar
  useEffect(() => {
    const institucionesGuardadas = localStorage.getItem('instituciones-culturales')
    if (institucionesGuardadas) {
      try {
        const institucionesParseadas = JSON.parse(institucionesGuardadas)
        // Combinar instituciones base con las guardadas, eliminando duplicados
        const institucionesCombinadas = [...new Set([...institucionesBase, ...institucionesParseadas])]
        setInstituciones(institucionesCombinadas)
      } catch (error) {
        setInstituciones(institucionesBase)
      }
    }
  }, [])

  // Guardar instituciones en localStorage cuando cambien
  useEffect(() => {
    if (instituciones.length > institucionesBase.length) {
      const institucionesNuevas = instituciones.filter(inst => !institucionesBase.includes(inst))
      localStorage.setItem('instituciones-culturales', JSON.stringify(institucionesNuevas))
    }
  }, [instituciones])

  const agregarInstitucion = (nuevaInstitucion) => {
    if (nuevaInstitucion && !instituciones.includes(nuevaInstitucion)) {
      setInstituciones(prev => [...prev, nuevaInstitucion])
    }
  }

  const obtenerInstituciones = () => {
    return instituciones
  }

  const buscarInstituciones = (termino) => {
    if (!termino.trim()) return instituciones
    return instituciones.filter(inst =>
      inst.toLowerCase().includes(termino.toLowerCase())
    )
  }

  const value = {
    instituciones,
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




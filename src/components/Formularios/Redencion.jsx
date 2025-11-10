import React, { useState, useRef, useEffect } from 'react'
import { imagenes } from '../../constants/imagenes'
import { apiService } from '../../apis'
import { useInstituciones } from '../../context/InstitucionesContext'

const Redencion = () => {
  const { instituciones, buscarInstituciones } = useInstituciones()
  
  const [formData, setFormData] = useState({
    institucion: '',
    numeroTarjeta: '',
    fecha: new Date().toISOString().split('T')[0], // Fecha de hoy en formato YYYY-MM-DD
    tipoPromocion: ''
  })

  const [showInstituciones, setShowInstituciones] = useState(false)
  const [filteredInstituciones, setFilteredInstituciones] = useState([])
  const autocompleteRef = useRef(null)

  // Instituciones que requieren tipo de promoción
  const institucionesConPromocion = [
    'Museo de Arte Contemporáneo de Monterrey (MARCO)',
    'Museo de Historia Mexicana'
  ]

  // Verificar si se debe mostrar el campo de tipo de promoción
  // Solo para las instituciones específicas: MARCO y Museo de Historia Mexicana
  const mostrarTipoPromocion = (() => {
    const institucionLower = formData.institucion.toLowerCase().trim()
    
    // Usar la lista de instituciones para verificar
    return institucionesConPromocion.some(inst => {
      const instLower = inst.toLowerCase()
      
      // Verificar MARCO (debe contener "marco" y "arte contemporáneo")
      if (instLower.includes('marco') && instLower.includes('arte contemporáneo')) {
        return institucionLower.includes('marco') && institucionLower.includes('arte contemporáneo')
      }
      
      // Verificar otras instituciones por coincidencia
      return institucionLower.includes(instLower) || instLower.includes(institucionLower)
    })
  })()

  // Verificar si es específicamente MARCO
  const esMarco = (() => {
    const institucionLower = formData.institucion.toLowerCase().trim()
    return institucionLower.includes('marco') && institucionLower.includes('arte contemporáneo')
  })()

  // Opciones de promoción para MARCO
  const promocionesMarco = [
    { value: 'Descuento en entrada', label: 'Descuento en entrada' },
    { value: 'Entrada gratuita', label: 'Entrada gratuita' },
    { value: '2x1 en entrada', label: '2x1 en entrada' },
    { value: 'Descuento en tienda', label: 'Descuento en tienda' },
    { value: 'Descuento en restaurante', label: 'Descuento en restaurante' },
    { value: 'Acceso a eventos especiales', label: 'Acceso a eventos especiales' },
    { value: 'Visita guiada gratuita', label: 'Visita guiada gratuita' }
  ]

  // Opciones de promoción para Museo de Historia Mexicana
  const promocionesHistoriaMexicana = [
    { value: 'Descuento', label: 'Descuento' },
    { value: '2x1', label: '2x1' },
    { value: 'Entrada Gratuita', label: 'Entrada Gratuita' },
    { value: 'Promoción Especial', label: 'Promoción Especial' },
    { value: 'Descuento en restaurante', label: 'Descuento en restaurante' }
  ]

  // Las instituciones ahora vienen del contexto global

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Si cambia la institución, limpiar el tipo de promoción
    if (name === 'institucion') {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        tipoPromocion: '' // Limpiar tipo de promoción al cambiar institución
      }))
      
      if (value.trim() === '') {
        setFilteredInstituciones([])
        setShowInstituciones(false)
      } else {
        const filtered = buscarInstituciones(value)
        setFilteredInstituciones(filtered)
        setShowInstituciones(filtered.length > 0)
      }
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }))
    }
  }

  const handleInstitucionFocus = () => {
    if (formData.institucion.trim() === '') {
      setFilteredInstituciones(instituciones)
      setShowInstituciones(true)
    } else {
      const filtered = buscarInstituciones(formData.institucion)
      setFilteredInstituciones(filtered)
      setShowInstituciones(filtered.length > 0)
    }
  }

  // NUEVO: Alternar manualmente el dropdown con flecha
  const toggleDropdownInstituciones = () => {
    if (!showInstituciones) {
      // Mostrar el listado completo para facilitar la selección
      setFilteredInstituciones(instituciones)
      setShowInstituciones(true)
    } else {
      setShowInstituciones(false)
    }
  }

  // NUEVO: Limpiar para poder elegir otra opción rápidamente
  const handleClearInstitucion = () => {
    setFormData(prev => ({ ...prev, institucion: '', tipoPromocion: '' }))
    setFilteredInstituciones(instituciones)
    setShowInstituciones(true)
  }

  // Función para establecer la fecha de hoy
  const setTodayDate = () => {
    setFormData(prev => ({ 
      ...prev, 
      fecha: new Date().toISOString().split('T')[0] 
    }))
  }

  const selectInstitucion = (institucion) => {
    setFormData(prevState => ({
      ...prevState,
      institucion: institucion,
      tipoPromocion: '' // Limpiar tipo de promoción al cambiar institución
    }))
    setShowInstituciones(false)
  }

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowInstituciones(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Validar que todos los campos estén llenos
      if (!formData.institucion || !formData.numeroTarjeta || !formData.fecha) {
        alert('Por favor, completa todos los campos')
        return
      }

      // Validar tipo de promoción si es requerido
      if (mostrarTipoPromocion && !formData.tipoPromocion) {
        alert('Por favor, selecciona el tipo de promoción')
        return
      }

      // Normalizar fecha a YYYY-MM-DD
      const normalizeToISODate = (val) => {
        if (!val) return ''
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val // ya es ISO
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          const [d, m, y] = val.split('/')
          return `${y}-${m}-${d}`
        }
        const date = new Date(val)
        if (!isNaN(date)) return date.toISOString().slice(0, 10)
        return val
      }

      const fechaISO = normalizeToISODate(formData.fecha)

      // Enviar datos al backend
      const response = await apiService.crearControlAcceso({
        institucion: formData.institucion,
        numeroTarjeta: formData.numeroTarjeta
      })

      if (response.success === true || response.estado === 'exito') {
        alert('Registro de control de acceso creado exitosamente!')
        
        // Limpiar el formulario
        setFormData({
          institucion: '',
          numeroTarjeta: '',
          fecha: new Date().toISOString().split('T')[0], // Resetear a fecha de hoy
          tipoPromocion: ''
        })
      } else {
        alert('Error al crear el registro: ' + (response.message || response.error || 'Error desconocido'))
      }
      
    } catch (error) {
      
      // Mostrar error más específico
      if (error.message.includes('Failed to fetch')) {
        alert('Error de conexión: No se puede conectar al servidor. Verifica que el backend esté corriendo.')
      } else if (error.message.includes('HTTP error')) {
        alert('Error del servidor: ' + error.message)
      } else {
        alert('Error al enviar el formulario: ' + error.message)
      }
    }
  }

  return (
    <div className="relative overflow-hidden h-full">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-orange-500 backdrop-blur-sm shadow-lg">
        <div className="max-w-[1090px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6 space-x-8">
            {/* Logo izquierdo */}
            <div className="flex items-center">
              <img 
                src={imagenes.logoIzquierdo} 
                alt="Logo CULTURA NL" 
                className="w-24 h-24 object-contain"
              />
            </div>
            
            {/* Título central */}
            <h1 className="uppercase text-[clamp(0.8rem,4.2vw,4.2rem)] leading-tight font-bold text-center px-5" style={{ fontFamily: "'Neue Haas Grotesk Display', sans-serif", fontWeight: 700 }}>
          <span className="text-white">CULTUR</span>
          <span className="text-black ml-1">ALL ACCESS</span>
        </h1>
            
            {/* Logo derecho */}
            <div className="flex items-center">
              <img 
                src={imagenes.logoDerecho} 
                alt="Logo NL" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Fondo naranja con rayas diagonales */}
      <div className="absolute inset-0">
        <img 
          src="/images/BACKGROUND-06.png" 
          alt="Fondo Cultural Access"
          className="w-full h-full object-cover"
        />
       
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full flex flex-col pt-20">
        {/* Header con logos */}
        <div className="flex flex-row items-center justify-center pb-5 pt-6">
          
              
            
            
        </div>

        {/* Formulario centrado */}
        <div className="flex-1 flex items-center justify-center px-6 py-20 pb-32">
          <div className="bg-orange-500 rounded-2xl p-10 shadow-2xl max-w-[1090px] w-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Campo Institución */}
              <div>
                <label htmlFor="institucion" className="block text-base font-bold text-gray-800 mb-2 text-white">
                  INSTITUCIÓN*
                </label>
                <div className="relative" ref={autocompleteRef}>
                  <input
                    type="text"
                    id="institucion"
                    name="institucion"
                    value={formData.institucion}
                    onChange={handleChange}
                    onFocus={handleInstitucionFocus}
                    required
                    className="w-full pr-24 px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Busca o escribe el nombre de la institución"
                  />

                  {/* Botones de acción dentro del input */}
                  <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
                    {formData.institucion && (
                      <button
                        type="button"
                        onClick={handleClearInstitucion}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        title="Limpiar y elegir otra"
                      >
                        Limpiar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleDropdownInstituciones}
                      className="p-2 rounded bg-white hover:bg-orange-50 shadow"
                      title="Mostrar lista"
                    >
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Dropdown de autocomplete */}
                  {showInstituciones && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-orange-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredInstituciones.map((institucion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-orange-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors text-gray-800 font-medium text-base"
                          onClick={() => selectInstitucion(institucion)}
                        >
                          {institucion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Tipo de Promoción - Solo visible para MARCO y Museo de Historia Mexicana */}
              {mostrarTipoPromocion && (
                <div>
                  <label htmlFor="tipoPromocion" className="block text-base font-bold text-gray-800 mb-2 text-white">
                    TIPO DE PROMOCIÓN*
                  </label>
                  <div className="relative">
                    <select
                      id="tipoPromocion"
                      name="tipoPromocion"
                      value={formData.tipoPromocion}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base appearance-none"
                    >
                      <option value="" className="text-gray-500">Selecciona el tipo de promoción</option>
                      {esMarco ? (
                        // Opciones específicas para MARCO
                        promocionesMarco.map((promo) => (
                          <option key={promo.value} value={promo.value} className="text-black">
                            {promo.label}
                          </option>
                        ))
                      ) : (
                        // Opciones para Museo de Historia Mexicana
                        promocionesHistoriaMexicana.map((promo) => (
                          <option key={promo.value} value={promo.value} className="text-black">
                            {promo.label}
                          </option>
                        ))
                      )}
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Campo Número de Tarjeta */}
              <div>
                <label htmlFor="numeroTarjeta" className="block text-base font-bold text-gray-800 mb-2 text-white">
                  NÚMERO DE TARJETA*
                </label>
                <input
                  type="text"
                  id="numeroTarjeta"
                  name="numeroTarjeta"
                  value={formData.numeroTarjeta}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                  placeholder="Ingresa el número de tarjeta"
                />
              </div>

              {/* Campo Fecha */}
              <div>
                <label htmlFor="fecha" className="block text-base font-bold text-gray-800 mb-2 text-white">
                  FECHA*
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                    className="w-full pr-24 px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base"
                  />
                  <div className="absolute inset-y-0 right-10 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={setTodayDate}
                      className="px-3 py-1 text-xs bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors font-medium"
                      title="Establecer fecha de hoy"
                    >
                      Hoy
                    </button>
                  </div>
                </div>
              </div>

              {/* Eliminado: Campo Origen de Registro */}

              {/* Botón Enviar */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-orange-400 focus:ring-4 focus:ring-orange-200 transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Redencion


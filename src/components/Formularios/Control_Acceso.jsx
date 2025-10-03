import React, { useState, useRef, useEffect } from 'react'
import { imagenes } from '../../constants/imagenes'
import { apiService } from '../../services/apiService'
import { useInstituciones } from '../../context/InstitucionesContext'

const ControlAcceso = () => {
  const { instituciones, buscarInstituciones } = useInstituciones()
  
  const [formData, setFormData] = useState({
    institucion: '',
    numeroTarjeta: '',
    fecha: new Date().toISOString().split('T')[0] // Fecha de hoy en formato YYYY-MM-DD
  })

  const [showInstituciones, setShowInstituciones] = useState(false)
  const [filteredInstituciones, setFilteredInstituciones] = useState([])
  const autocompleteRef = useRef(null)

  // Las instituciones ahora vienen del contexto global

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))

    // Filtrar instituciones si es el campo institución
    if (name === 'institucion') {
      if (value.trim() === '') {
        setFilteredInstituciones([])
        setShowInstituciones(false)
      } else {
        const filtered = buscarInstituciones(value)
        setFilteredInstituciones(filtered)
        setShowInstituciones(filtered.length > 0)
      }
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
    setFormData(prev => ({ ...prev, institucion: '' }))
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
      institucion: institucion
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

      // Enviar datos al backend
      const response = await apiService.crearControlAcceso({
        institucion: formData.institucion,
        numeroTarjeta: formData.numeroTarjeta,
        fecha: formData.fecha
      })

      if (response.success === true) {
        alert('Registro de control de acceso creado exitosamente!')
        
        // Limpiar el formulario
        setFormData({
          institucion: '',
          numeroTarjeta: '',
          fecha: new Date().toISOString().split('T')[0] // Resetear a fecha de hoy
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
            <h1 className="uppercase text-7xl font-bold text-center">
              <span className="text-white">CULTUR</span>
              <span className="text-black ml-2">ALL ACCESS</span>
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

export default ControlAcceso

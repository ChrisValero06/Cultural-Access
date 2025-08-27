import React, { useState, useEffect, useRef } from 'react'
import { imagenes } from '../../constants/imagenes'
import { apiService } from '../../services/apiService'

const CargarPromo = () => {
  const [formData, setFormData] = useState({
    institucion: '',
    tipoPromocion: '',
    disciplina: '',
    beneficios: '',
    comentariosRestricciones: '',
    fechaInicio: '',
    fechaFin: '',
    imagenPrincipal: null,
    imagenSecundaria: null
  })

  const [showInstituciones, setShowInstituciones] = useState(false)
  const [filteredInstituciones, setFilteredInstituciones] = useState([])
  const autocompleteRef = useRef(null)

  const [showTiposPromocion,setShowTiposPromocion] = useState(false)
  const [filteredTiposPromocion, setFilteredTiposPromocion] = useState([])
  const autocompleteRefTiposPromocion = useRef(null)

  const [showDisciplina, setShowDisciplina] = useState(false)
  const [filteredDisciplina, setFilteredDisciplina] = useState([])
  const autocompleteRefDisciplina = useRef(null)

  // Lista de instituciones culturales
  const instituciones = [
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

  // Lista de tipos de promoción
  const tiposPromocion = [
    'Entradas gratuitas',
    'Descuentos',
    'Acceso prioritario',
    'Descuentos para la educación',
    'Visitas guiadas exclusivas',
    'Descuentos en publicaciones CONARTE',
    'Asistencia a conferencias',
    'Descuentos en cafés/comida',
    'Boletos 2x4',
    'Descuentos por temporada',
    'Otra'
  ]

  // Lista de disciplinas
  const disciplinas = [
    'Artes Plásticas',
    'Cine',
    'Danza',
    'Teatro',
    'Música',
    'Literatura',
    'Diseño Gráfico',
    'Arquitectura',
    'Arte Textil',
    'Otra'
  ]

  // Cerrar autocomplete cuando se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowInstituciones(false)
        setFilteredInstituciones([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cerrar autocomplete cuando se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRefTiposPromocion.current && !autocompleteRefTiposPromocion.current.contains(event.target)) {
        setShowTiposPromocion(false)
        setFilteredTiposPromocion([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cerrar autocomplete cuando se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRefDisciplina.current && !autocompleteRefDisciplina.current.contains(event.target)) {
        setShowDisciplina(false)
        setFilteredDisciplina([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData(prevState => ({
        ...prevState,
        [name]: files[0]
      }))
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }))

      // Filtrar instituciones para el autocomplete
      if (name === 'institucion') {
        if (value.trim() === '') {
          setFilteredInstituciones([])
          setShowInstituciones(false)
        } else {
          const filtered = instituciones.filter(inst =>
            inst.toLowerCase().includes(value.toLowerCase())
          )
          setFilteredInstituciones(filtered)
          setShowInstituciones(filtered.length > 0)
        }
      }

      // Filtrar tipos de promoción para el autocomplete
      if (name === 'tipoPromocion') {
        if (value.trim() === '') {
          setFilteredTiposPromocion([])
          setShowTiposPromocion(false)
        } else {
          const filtered = tiposPromocion.filter(inst =>
            inst.toLowerCase().includes(value.toLowerCase())
          )
          setFilteredTiposPromocion(filtered)
          setShowTiposPromocion(filtered.length > 0)
        }
      }

      // Filtrar disciplinas para el autocomplete
      if (name === 'disciplina') {
        if (value.trim() === '') {
          setFilteredDisciplina([])
          setShowDisciplina(false)
        } else {
          const filtered = disciplinas.filter(inst =>
            inst.toLowerCase().includes(value.toLowerCase())
          )
          setFilteredDisciplina(filtered)
          setShowDisciplina(filtered.length > 0)
        }
      }
    }
  }

  const selectInstitucion = (institucion) => {
    setFormData(prevState => ({
      ...prevState,
      institucion: institucion
    }))
    setShowInstituciones(false)
    setFilteredInstituciones([])
  }

  const handleInstitucionFocus = () => {
    if (formData.institucion.trim() === '') {
      setFilteredInstituciones(instituciones)
      setShowInstituciones(true)
    }
  }

  const selectTipoPromocion = (tipoPromocion) => {
    setFormData(prevState => ({
      ...prevState,
      tipoPromocion: tipoPromocion
    }))
    setShowTiposPromocion(false)
    setFilteredTiposPromocion([])
  }

  const handleTipoPromocionFocus = () => {
    if (formData.tipoPromocion.trim() === '') {
      setFilteredTiposPromocion(tiposPromocion)
      setShowTiposPromocion(true)
    }
  }

  const selectDisciplina = (disciplina) => {
    setFormData(prevState => ({
      ...prevState,
      disciplina: disciplina
    }))
    setShowDisciplina(false)
    setFilteredDisciplina([])
  }

  const handleDisciplinaFocus = () => {
    if (formData.disciplina.trim() === '') {
      setFilteredDisciplina(disciplinas)
      setShowDisciplina(true)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // Verificar que se haya seleccionado la imagen principal
      if (!formData.imagenPrincipal) {
        setMessage('Por favor selecciona una imagen principal para la promoción')
        setIsSubmitting(false)
        return
      }

      // Subir imagen principal
      const imagenPrincipalResult = await apiService.subirImagen(
        formData.imagenPrincipal, 
        `principal_${Date.now()}`
      )

      let imagenSecundariaUrl = null
      if (formData.imagenSecundaria) {
        const imagenSecundariaResult = await apiService.subirImagen(
          formData.imagenSecundaria, 
          `secundaria_${Date.now()}`
        )
        imagenSecundariaUrl = imagenSecundariaResult.url
      }

      // Preparar datos para la base de datos
      const promocionData = {
        institucion: formData.institucion,
        tipo_promocion: formData.tipoPromocion,
        disciplina: formData.disciplina,
        beneficios: formData.beneficios,
        comentarios_restricciones: formData.comentariosRestricciones,
        fecha_inicio: formData.fechaInicio,
        fecha_fin: formData.fechaFin,
        imagen_principal: imagenPrincipalResult.url,
        imagen_secundaria: imagenSecundariaUrl
      }

      // Crear promoción en la base de datos
      const result = await apiService.crearPromocion(promocionData)

      if (result.estado === 'exito') {
        setMessage('¡Promoción cargada exitosamente! Será mostrada en el carrusel principal.')
        // Limpiar formulario
        setFormData({
          institucion: '',
          tipoPromocion: '',
          disciplina: '',
          beneficios: '',
          comentariosRestricciones: '',
          fechaInicio: '',
          fechaFin: '',
          imagenPrincipal: null,
          imagenSecundaria: null
        })
      } else {
        setMessage('Error al crear la promoción: ' + result.mensaje)
      }
    } catch (error) {
      console.error('Error al enviar promoción:', error)
      setMessage('Error al enviar la promoción. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative overflow-hidden h-full">
      {/* Fondo naranja con rayas diagonales */}
      <div className="absolute inset-0">
        <img 
          src="/images/BACKGROUND-06.png" 
          alt="Fondo Cultural Access"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header con logos */}
        <div className="flex flex-row items-center justify-center py-6 space-x-8">
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

        {/* Formulario centrado */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="bg-orange-500 rounded-2xl p-8 shadow-2xl max-w-[1090px] w-full max-h-full overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título del formulario */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">CARGAR PROMOCIÓN</h2>
                <p className="text-orange-100 text-base">Completa los datos de la nueva promoción</p>
              </div>

              {/* Campo Institución */}
              <div>
                <label htmlFor="institucion" className="block text-base font-bold text-gray-800 mb-2">
                  INSTITUCIÓN *
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
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Busca o escribe el nombre de la institución"
                  />
                  
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

              {/* Campo Tipo de Promoción */}
              <div>
                <label htmlFor="tipoPromocion" className="block text-base font-bold text-gray-800 mb-2">
                  TIPO DE PROMOCIÓN *
                </label>
                <div className="relative" ref={autocompleteRefTiposPromocion}>
                  <input
                    type="text"
                    id="tipoPromocion"
                    name="tipoPromocion"
                    value={formData.tipoPromocion}
                    onChange={handleChange}
                    onFocus={handleTipoPromocionFocus}
                    required
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Busca o escribe el tipo de promoción"
                  />
                  
                  {/* Dropdown de autocomplete */}
                  {showTiposPromocion && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-orange-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredTiposPromocion.map((tipoPromocion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-orange-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors text-gray-800 font-medium text-base"
                          onClick={() => selectTipoPromocion(tipoPromocion)}
                        >
                          {tipoPromocion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Disciplina */}
              <div>
                <label htmlFor="disciplina" className="block text-base font-bold text-gray-800 mb-2">
                  DISCIPLINA *
                </label>
                <div className="relative" ref={autocompleteRefDisciplina}>
                  <input
                    type="text"
                    id="disciplina"
                    name="disciplina"
                    value={formData.disciplina}
                    onChange={handleChange}
                    onFocus={handleDisciplinaFocus}
                    required
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Busca o escribe la disciplina"
                  />
                  
                  {/* Dropdown de autocomplete */}
                  {showDisciplina && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-orange-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDisciplina.map((disciplina, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-orange-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors text-gray-800 font-medium text-base"
                          onClick={() => selectDisciplina(disciplina)}
                        >
                          {disciplina}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Beneficios */}
              <div>
                <label htmlFor="beneficios" className="block text-base font-bold text-gray-800 mb-2">
                  BENEFICIOS *
                </label>
                <textarea
                  id="beneficios"
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black resize-none text-base placeholder:text-gray-500"
                  placeholder="Descripción de la promoción"
                />
              </div>

              {/* Campo Comentarios o Restricciones */}
              <div>
                <label htmlFor="comentariosRestricciones" className="block text-base font-bold text-gray-800 mb-2">
                  COMENTARIOS O RESTRICCIONES *
                </label>
                <textarea
                  id="comentariosRestricciones"
                  name="comentariosRestricciones"
                  value={formData.comentariosRestricciones}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black resize-none text-base placeholder:text-gray-500"
                  placeholder="Describe las limitantes de tu promoción"
                />
              </div>

              {/* Campos de fecha en fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Fecha de Inicio */}
                <div>
                  <label htmlFor="fechaInicio" className="block text-base font-bold text-gray-800 mb-2">
                    INICIO DE LA PROMOCIÓN *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="fechaInicio"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleChange}
                      required
                      className="w-full px-9 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Campo Fecha de Fin */}
                <div>
                  <label htmlFor="fechaFin" className="block text-base font-bold text-gray-800 mb-2">
                    FIN DE LA PROMOCIÓN *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="fechaFin"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleChange}
                      required
                      className="w-full px-9 py-3 border-2 border-orange-400 rounded-lg focus:border-transparent transition duration-200 bg-white text-black text-base"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos de imagen en fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Imagen Principal */}
                <div>
                  <label htmlFor="imagenPrincipal" className="block text-base font-bold text-gray-800 mb-2">
                    IMAGEN PRINCIPAL *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="imagenPrincipal"
                      name="imagenPrincipal"
                      onChange={handleChange}
                      accept="image/*"
                      required
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-orange-100 mt-1">Esta imagen se mostrará en el carrusel principal</p>
                </div>

                {/* Campo Imagen Secundaria */}
                <div>
                  <label htmlFor="imagenSecundaria" className="block text-base font-bold text-gray-800 mb-2">
                    IMAGEN SECUNDARIA
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="imagenSecundaria"
                      name="imagenSecundaria"
                      onChange={handleChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-orange-100 mt-1">Imagen adicional para la promoción (opcional)</p>
                </div>
              </div>

              {/* Texto de campos obligatorios */}
              <p className="text-sm text-orange-100 italic">*Campo obligatorio</p>

              {/* Mensaje de estado */}
              {message && (
                <div className={`p-4 rounded-lg text-center font-medium ${
                  message.includes('exitosamente') 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {message}
                </div>
              )}

              {/* Botón Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-bold py-4 px-6 rounded-lg transition duration-200 transform shadow-lg text-base ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-500 focus:ring-4 focus:ring-orange-200 hover:scale-105'
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Texto adicional fuera del formulario */}
        <div className="text-center pb-4 px-6">
          <p className="text-white text-base leading-relaxed max-w-[1090px] mx-auto">
            Tendrán derecho a participar aquellas instituciones culturales públicas y público-
            privadas que operen en el estado de Nuevo León, al igual que espacios culturales como
            museos, galerías, teatros, auditorios, centros de arte, bibliotecas, y centros culturales que
            cumplan con los criterios de promoción de la cultura, calidad de actividades ofrecidas y
            su accesibilidad al público.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CargarPromo;

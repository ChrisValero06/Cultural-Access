import React, { useState, useEffect } from 'react'
import { imagenes } from '../../constants/imagenes'
import { apiService } from '../../apis'

const DATA = {
  institucion: ['Ballet de Monterrey', 'Bread Coffee Roasters', 'Café Belmonte', 'Casa Coa', 'Casa de la Cultura de Nuevo León', 'Casa Motis', 'Casa Musa', 'Centro Roberto Garza Sada', 'Cineteca de Nuevo León', 'Constelación Feria de Arte', 'Dramático', 'El Lingote Restaurante', 'Escuela Superior de Música y Danza de Monterrey', 'Fondo de Cultura Económica', 'Fondo Editorial de Nuevo León', 'Fototeca de Nuevo León', 'Heart Ego', 'Horno 3', 'La Gran Audiencia', 'La Milarca', 'Librería Bruma', 'Librería Sentido', 'Monstera Coffee Bar', 'Museo 31', 'Museo del Acero Horno 3', 'Museo de Arte Contemporáneo de Monterrey (MARCO)', 'Museo de la Batalla', 'Museo de Historia Mexicana', 'Museo del Noreste', 'Museo del Palacio', 'Museo del Vidrio (MUVI)', 'Museo Estatal de Culturas Populares de Nuevo León', 'Museo Regional de Nuevo León El Obispado', 'Papalote Museo del Niño Monterrey', 'Salón de la Fama de Beisbol Mexicano', 'Saxy Jazz Club', 'Secretaría de Cultura', 'Seabird Coffee', 'Teatro de la Ciudad', 'Vaso Roto Ediciones'],
  tipoPromocion: ['Entradas gratuitas', 'Descuentos', 'Acceso prioritario', 'Descuentos para la educación', 'Visitas guiadas exclusivas', 'Descuentos en publicaciones CONARTE', 'Asistencia a conferencias', 'Descuentos en cafés/comida', 'Boletos 2x4', 'Descuentos por temporada', 'Otra'],
  disciplina: ['Artes Plásticas', 'Cine', 'Danza', 'Teatro', 'Música', 'Literatura', 'Diseño Gráfico', 'Arquitectura', 'Arte Textil', 'Otra']
}

const SelectField = ({ id, name, label, value, onChange, options, placeholder = 'Selecciona una opción', required = true }) => (
  <div>
    <label htmlFor={id} className="block text-base font-bold text-white mb-2">{label}{required ? '*' : ''}</label>
    <div className="relative">
      <select id={id} name={name} value={value} onChange={onChange} required={required}
        className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base appearance-none">
        <option value="" disabled>{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
)

const LargeTextInput = ({ id, name, label, placeholder, value, onChange, onBlur, limit, required = true }) => {
  const isOverLimit = value.length > limit
  const isNearLimit = value.length > limit * 0.8
  const borderColor = isOverLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : 'border-orange-400'
  const textColor = isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'
  return (
    <div>
      <label htmlFor={id} className="block text-base font-bold text-white mb-2">{label}{required ? '*' : ''}</label>
      <input id={id} name={name} type="text" value={value} onChange={onChange} onBlur={onBlur} required={required} maxLength={limit} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500 ${borderColor}`}
        placeholder={placeholder} />
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-orange-100">Máximo {limit} caracteres</p>
        <span className={`text-xs font-medium ${textColor}`}>{value.length}/{limit}</span>
      </div>
    </div>
  )
}

const CargarPromoFunctional = () => {
  const [formData, setFormData] = useState({
    institucion: '', tipoPromocion: '', disciplina: '', beneficios: '',
    comentariosRestricciones: '', fechaInicio: '', fechaFin: '',
    imagenPrincipal: null, imagenSecundaria: null, logo: null
  })
  const [currentImage, setCurrentImage] = useState(0)
  const [carruselEjemplo, setCarruselEjemplo] = useState({ imagenes: [] })
  const [logoPreview, setLogoPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const LIMITS = { beneficios: 100, comentarios: 100 }

  const nextImage = () => setCurrentImage(prev => (prev + 1) % carruselEjemplo.imagenes.length)
  const prevImage = () => setCurrentImage(prev => (prev - 1 + carruselEjemplo.imagenes.length) % carruselEjemplo.imagenes.length)

  useEffect(() => {
    return () => carruselEjemplo.imagenes.forEach(url => url?.startsWith?.('blob:') && URL.revokeObjectURL(url))
  }, [])

  const normalizeSpanishText = (rawText, ensureFinalPunctuation = false) => {
    let text = (rawText || '').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]*([,;:])[ \t]*/g, '$1 ').replace(/[ \t]*\.[ \t]*/g, '. ').replace(/[ \t]+([.!?,;:])/g, '$1').replace(/([.!?]){2,}/g, '$1')
    if (ensureFinalPunctuation) text = text.replace(/^\s+|\s+$/g, '')
    if (text.length > 0) text = text.charAt(0).toUpperCase() + text.slice(1)
    if (ensureFinalPunctuation && text && !/[.!?…]$/.test(text.trim())) text += '.'
    return text
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
      if (name === 'imagenPrincipal' && files[0]) {
        const imageUrl = URL.createObjectURL(files[0])
        setCarruselEjemplo(prev => ({ imagenes: [imageUrl, ...prev.imagenes.slice(1)] }))
        setCurrentImage(0)
      } else if (name === 'imagenSecundaria' && files[0]) {
        const imageUrl = URL.createObjectURL(files[0])
        setCarruselEjemplo(prev => ({ imagenes: [...prev.imagenes.slice(0, 1), imageUrl, ...prev.imagenes.slice(2)] }))
      } else if (name === 'logo' && files[0]) {
        setLogoPreview(URL.createObjectURL(files[0]))
      }
    } else {
      const nextValue = ['beneficios', 'comentariosRestricciones'].includes(name) ? normalizeSpanishText(value, false) : value
      setFormData(prev => ({ ...prev, [name]: nextValue }))
    }
  }

  const handleBlurNormalize = (e) => {
    const { name } = e.target
    setFormData(prev => ({ ...prev, [name]: normalizeSpanishText(prev[name], true) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      if (formData.beneficios.length > LIMITS.beneficios) {
        setMessage(`El campo "Beneficios" excede el límite de ${LIMITS.beneficios} caracteres`)
        return
      }
      if (formData.comentariosRestricciones.length > LIMITS.comentarios) {
        setMessage(`El campo "Comentarios o Restricciones" excede el límite de ${LIMITS.comentarios} caracteres`)
        return
      }
      if (!formData.imagenPrincipal) {
        setMessage('Por favor selecciona una imagen principal para la promoción')
        return
      }

      const imagenPrincipalResult = await apiService.subirImagen(formData.imagenPrincipal, `principal_${Date.now()}`)
      let imagenSecundariaUrl = null
      if (formData.imagenSecundaria) {
        const imagenSecundariaResult = await apiService.subirImagen(formData.imagenSecundaria, `secundaria_${Date.now()}`)
        imagenSecundariaUrl = imagenSecundariaResult.url
      }

      const promocionData = {
        institucion: formData.institucion, tipo_promocion: formData.tipoPromocion, disciplina: formData.disciplina,
        beneficios: formData.beneficios, comentarios_restricciones: formData.comentariosRestricciones,
        fecha_inicio: formData.fechaInicio, fecha_fin: formData.fechaFin,
        imagen_principal: imagenPrincipalResult.url, imagen_secundaria: imagenSecundariaUrl
      }

      const result = await apiService.crearPromocion(promocionData)

      if (result?.success || result?.estado === 'exito') {
        setMessage('¡Promoción cargada exitosamente! Será mostrada en el carrusel principal.')
        setFormData({ institucion: '', tipoPromocion: '', disciplina: '', beneficios: '', comentariosRestricciones: '', fechaInicio: '', fechaFin: '', imagenPrincipal: null, imagenSecundaria: null, logo: null })
        setLogoPreview(null)
      } else {
        setMessage('Error al crear la promoción: ' + (result?.message || result?.error || ''))
      }
    } catch (error) {
      setMessage('Error al enviar la promoción. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const TextInput = ({ id, name, label, placeholder, value, onChange, required = true, listId }) => (
    <div>
      <label htmlFor={id} className="block text-base font-bold text-white mb-2">{label}{required ? '*' : ''}</label>
      <input id={id} name={name} type="text" value={value} onChange={onChange} required={required} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} list={listId}
        className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
        placeholder={placeholder} />
    </div>
  )

  const TextAreaField = ({ name, label, placeholder, value, onChange, onBlur, limit, required = true }) => {
    const isOverLimit = value.length > limit
    const isNearLimit = value.length > limit * 0.8
    const borderColor = isOverLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : 'border-orange-400'
    const textColor = isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'
    return (
      <div>
        <label htmlFor={name} className="block text-base font-bold text-white mb-2">{label}*</label>
        <textarea id={name} name={name} value={value} onChange={onChange} onBlur={onBlur} required={required} rows="3" maxLength={limit}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black resize-none text-base placeholder:text-gray-500 ${borderColor}`}
          placeholder={placeholder} />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-orange-100">Máximo {limit} caracteres</p>
          <span className={`text-xs font-medium ${textColor}`}>{value.length}/{limit}</span>
        </div>
      </div>
    )
  }

  const DateField = ({ name, label, value, onChange }) => (
    <div>
      <label htmlFor={name} className="block text-base font-bold text-white mb-2">{label}*</label>
      <div className="relative">
        <input type="date" id={name} name={name} value={value} onChange={onChange} required
          className="w-full px-9 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]" />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => document.getElementById(name).showPicker()}>
          <svg className="w-5 h-5 text-orange-600 hover:text-orange-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  )

  const FileField = ({ name, label, value, onChange, accept, required = false, description }) => (
    <div>
      <label htmlFor={name} className="block text-base font-bold text-white mb-2">{label}{required ? '*' : ''}</label>
      <div className="relative">
        <input type="file" id={name} name={name} onChange={onChange} accept={accept} required={required}
          className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600" />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      {description && <p className="text-xs text-orange-100 mt-1">{description}</p>}
    </div>
  )

  return (
    <div className="relative overflow-hidden h-full">
      <div className="absolute inset-0">
        <img src="/images/BACKGROUND-06.png" alt="Fondo Cultural Access" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-row items-center justify-center py-6 space-x-8">
          <div className="flex items-center">
            <img src={imagenes.logoIzquierdo} alt="Logo CULTURA NL" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="uppercase text-7xl font-bold text-center">
            <span className="text-white">CULTUR</span>
            <span className="text-black ml-2">ALL ACCESS</span>
          </h1>
          <div className="flex items-center">
            <img src={imagenes.logoDerecho} alt="Logo NL" className="w-16 h-16 object-contain" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1400px] max-h-full">
            <div className="bg-orange-500 rounded-2xl p-6 shadow-2xl overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold text-white mb-2">CARGAR PROMOCIÓN</h2>
                  <p className="text-orange-100 text-base">Completa los datos de la nueva promoción</p>
                </div>

                <SelectField
                  id="institucion"
                  name="institucion"
                  label="INSTITUCIÓN"
                  value={formData.institucion}
                  onChange={handleChange}
                  options={DATA.institucion}
                  placeholder="Selecciona la institución"
                />

                <SelectField
                  id="tipoPromocion"
                  name="tipoPromocion"
                  label="TIPO DE PROMOCIÓN"
                  value={formData.tipoPromocion}
                  onChange={handleChange}
                  options={DATA.tipoPromocion}
                  placeholder="Selecciona el tipo de promoción"
                />

                <SelectField
                  id="disciplina"
                  name="disciplina"
                  label="DISCIPLINA"
                  value={formData.disciplina}
                  onChange={handleChange}
                  options={DATA.disciplina}
                  placeholder="Selecciona la disciplina"
                />

                <LargeTextInput id="beneficios" name="beneficios" label="BENEFICIOS" placeholder="Descripción de la promoción" value={formData.beneficios} onChange={handleChange} onBlur={handleBlurNormalize} limit={LIMITS.beneficios} />

                <LargeTextInput id="comentariosRestricciones" name="comentariosRestricciones" label="COMENTARIOS O RESTRICCIONES" placeholder="Describe las limitantes de tu promoción" value={formData.comentariosRestricciones} onChange={handleChange} onBlur={handleBlurNormalize} limit={LIMITS.comentarios} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateField name="fechaInicio" label="INICIO DE LA PROMOCIÓN" value={formData.fechaInicio} onChange={handleChange} />
                  <DateField name="fechaFin" label="FIN DE LA PROMOCIÓN" value={formData.fechaFin} onChange={handleChange} />
                </div>

                {/*FileField name="logo" label="LOGO DE LA INSTITUCIÓN" value={formData.logo} onChange={handleChange} accept="image/*" description="Logo pequeño que aparecerá en la esquina de la imagen" />*/}

                {<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileField name="imagenPrincipal" label="IMAGEN PRINCIPAL" value={formData.imagenPrincipal} onChange={handleChange} accept="image/*" required={false} description="Esta imagen se mostrará en el carrusel principal" />
                  <FileField name="imagenSecundaria" label="IMAGEN SECUNDARIA" value={formData.imagenSecundaria} onChange={handleChange} accept="image/*" required={false} description="Imagen adicional para la promoción (opcional)" />
                </div>}

                <p className="text-sm text-orange-100 italic">*Campo obligatorio</p>

                {message && (
                  <div className={`p-4 rounded-lg text-center font-medium ${
                    message.includes('exitosamente') 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {message}
                  </div>
                )}

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

            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">VISTA PREVIA</h3>
                <p className="text-orange-100 text-sm">Tu promoción se verá así en el carrusel</p>
              </div>
              
              <div className="relative w-[855px] h-[333.993px] mx-auto">
                <div className="overflow-hidden shadow-2xl">
                  <div className="relative w-full h-full overflow-hidden">
                    {carruselEjemplo.imagenes.map((imagen, index) => (
                      <img
                        key={index}
                        src={imagen}
                        alt={`Ejemplo promoción ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out ${
                          index === currentImage ? 'translate-x-0' : 
                          index < currentImage ? '-translate-x-full' : 'translate-x-full'
                        }`}
                      />
                    ))}
                    
                    {currentImage === 0 && (
                      <>
                        {logoPreview && <div className="absolute bottom-4 right-4 z-20"><img src={logoPreview} alt="Logo institución" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" /></div>}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4 sm:p-6 mt-4 sm:mt-0">
                          {formData.institucion && <div className="mb-3 sm:mb-4 mt-2 sm:mt-2"><span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-white text-lg sm:text-3xl font-extrabold tracking-tight" style={{fontFamily: 'Poppins, sans-serif'}}>{formData.institucion}</span></div>}
                          {formData.tipoPromocion && <div><span className="inline-block px-8 sm:px-8 py-0.5 sm:py-0.5 text-white text-lg sm:text-3xl font-bold" style={{fontFamily: 'Poppins, sans-serif'}}>{formData.tipoPromocion}</span></div>}
                        </div>
                      </>
                    )}

                    {currentImage === 1 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4 sm:p-6">
                        {formData.beneficios && <div className="mb-4 sm:mb-6"><span className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-white text-base sm:text-xl font-bold leading-relaxed whitespace-pre-line" style={{fontFamily: 'Poppins, sans-serif'}}>{formData.beneficios}</span></div>}
                        {formData.comentariosRestricciones && <div><span className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-white text-sm sm:text-lg font-medium leading-relaxed whitespace-pre-line" style={{fontFamily: 'Poppins, sans-serif'}}>{formData.comentariosRestricciones}</span></div>}
                      </div>
                    )}
                  </div>
                </div>
                
                {currentImage > 0 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-orange-500 rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                {currentImage < carruselEjemplo.imagenes.length - 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-orange-500 rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pb-4 px-6">
          <p className="text-white text-base leading-relaxed max-w-[1090px] mx-auto">
            Tendrán derecho a participar aquellas instituciones culturales públicas y público-privadas que operen en el estado de Nuevo León, al igual que espacios culturales como museos, galerías, teatros, auditorios, centros de arte, bibliotecas, y centros culturales que cumplan con los criterios de promoción de la cultura, calidad de actividades ofrecidas y su accesibilidad al público.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CargarPromoFunctional



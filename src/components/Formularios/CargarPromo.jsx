import React, { useState, useEffect } from 'react'
import { imagenes } from '../../constants/imagenes'
import { apiService } from '../../apis'
import { API_CONFIG } from '../../config/api.js'
import { useInstituciones } from '../../context/InstitucionesContext'

const DATA = {
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
  const { instituciones, cargando: cargandoInstituciones } = useInstituciones()
  
  const [formData, setFormData] = useState({
    institucion: '', tipoPromocion: '', disciplina: '', beneficios: '',
    comentariosRestricciones: '', fechaInicio: '', fechaFin: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const LIMITS = { beneficios: 100, comentarios: 100 }

  const normalizeSpanishText = (rawText, ensureFinalPunctuation = false) => {
    let text = (rawText || '').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]*([,;:])[ \t]*/g, '$1 ').replace(/[ \t]*\.[ \t]*/g, '. ').replace(/[ \t]+([.!?,;:])/g, '$1').replace(/([.!?]){2,}/g, '$1')
    if (ensureFinalPunctuation) text = text.replace(/^\s+|\s+$/g, '')
    if (text.length > 0) text = text.charAt(0).toUpperCase() + text.slice(1)
    if (ensureFinalPunctuation && text && !/[.!?…]$/.test(text.trim())) text += '.'
    return text
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = ['beneficios', 'comentariosRestricciones'].includes(name) ? normalizeSpanishText(value, false) : value
    setFormData(prev => ({ ...prev, [name]: nextValue }))
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

      const promocionData = {
        institucion: formData.institucion, 
        tipo_promocion: formData.tipoPromocion, 
        disciplina: formData.disciplina,
        beneficios: formData.beneficios, 
        comentarios_restricciones: formData.comentariosRestricciones,
        fecha_inicio: formData.fechaInicio, 
        fecha_fin: formData.fechaFin
      }

      // ⭐⭐ JSON COMPLETO QUE SE ESTÁ ENVIANDO
      const datosCompletos = {
        url: `${API_CONFIG.BASE_URL}/promociones`,
        metodo: 'POST',
        promocionData: promocionData,
        datos_formulario: {
          institucion: formData.institucion,
          tipoPromocion: formData.tipoPromocion,
          disciplina: formData.disciplina,
          beneficios: formData.beneficios,
          comentariosRestricciones: formData.comentariosRestricciones,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin
        },
        validaciones: {
          beneficios_length: formData.beneficios.length,
          beneficios_limit: LIMITS.beneficios,
          comentarios_length: formData.comentariosRestricciones.length,
          comentarios_limit: LIMITS.comentarios
        },
        timestamp: new Date().toISOString()
      }

      

      const result = await apiService.crearPromocion(promocionData)
      
      

      // ⭐⭐ MOSTRAR INFORMACIÓN DE CORREOS DESTINATARIOS EN EL FRONTEND
      if (result?.email_info) {
        console.log('═══════════════════════════════════════════════════════')
        console.log('📧 INFORMACIÓN DE CORREOS DESTINATARIOS:')
        console.log('═══════════════════════════════════════════════════════')
        
        // Manejar diferentes estructuras de respuesta del backend
        let destinatarios = [];
        let totalDestinatarios = 0;
        
        // Si viene la estructura esperada (destinatarios)
        if (result.email_info.destinatarios && Array.isArray(result.email_info.destinatarios)) {
          destinatarios = result.email_info.destinatarios;
          totalDestinatarios = result.email_info.total_destinatarios || destinatarios.length;
        }
        // Si viene la estructura de Nodemailer (accepted)
        else if (result.email_info.accepted && Array.isArray(result.email_info.accepted)) {
          destinatarios = result.email_info.accepted;
          totalDestinatarios = destinatarios.length;
        }
        // Si viene en envelope.to
        else if (result.email_info.envelope?.to && Array.isArray(result.email_info.envelope.to)) {
          destinatarios = result.email_info.envelope.to;
          totalDestinatarios = destinatarios.length;
        }
        
        console.log('📧 Total destinatarios:', totalDestinatarios)
        console.log('📧 Correos destinatarios:')
        if (destinatarios.length > 0) {
          destinatarios.forEach((email, index) => {
            console.log(`   ${index + 1}. ${email}`)
          })
        } else {
          console.log('   (No se encontraron destinatarios en la respuesta)')
        }
        
        // Mostrar información adicional si está disponible
        if (result.email_info.rejected && Array.isArray(result.email_info.rejected) && result.email_info.rejected.length > 0) {
          console.log('📧 Correos rechazados:', result.email_info.rejected)
        }
        
        if (result.email_info.mensaje) {
          console.log('📧 Mensaje:', result.email_info.mensaje)
        }
        
        if (result.email_info.messageId) {
          console.log('📧 Message ID:', result.email_info.messageId)
        }
        
        console.log('═══════════════════════════════════════════════════════')
      } else {
        console.warn('▲▲ El backend no devolvió información de correos destinatarios.')
        console.warn('▲▲ Asegúrate de que el router del servidor incluya email_info en la respuesta.')
      }

      if (result?.success || result?.estado === 'exito') {
        setMessage('¡Promoción cargada exitosamente!')
        setFormData({ institucion: '', tipoPromocion: '', disciplina: '', beneficios: '', comentariosRestricciones: '', fechaInicio: '', fechaFin: '' })
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
          <h1 className="uppercase text-[clamp(0.8rem,4.2vw,4.2rem)] leading-tight font-bold text-center px-5" style={{ fontFamily: "'Neue Haas Grotesk Display', sans-serif", fontWeight: 700 }}>
          <span className="text-white">CULTUR</span>
          <span className="text-black ml-1">ALL ACCESS</span>
        </h1>
          <div className="flex items-center">
            <img src={imagenes.logoDerecho} alt="Logo NL" className="w-16 h-16 object-contain" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[800px] max-h-full">
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
                  options={cargandoInstituciones ? [] : instituciones}
                  placeholder={cargandoInstituciones ? 'Cargando instituciones...' : 'Selecciona la institución'}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default CargarPromoFunctional



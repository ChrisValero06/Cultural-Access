import React, { useState } from 'react'
import { newsletterService } from '../apis'

const NewsletterSuscribete = () => {
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setMensaje(null)
    try {
      await newsletterService.suscribirNewsletter(correo.trim())
      setMensaje({ tipo: 'exito', texto: '¡Listo! Te suscribiste al newsletter.' })
      setCorreo('')
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'No se pudo completar la suscripción' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="border-b border-orange-400 pb-4 mb-4 md:pb-10 md:mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h3 className="text-sm md:text-lg font-semibold text-white">Newsletter</h3>
        <p className="text-xs md:text-sm text-orange-100">Recibe en tu correo las nuevas promociones culturales de Nuevo León.</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full md:w-auto">
        <div className="flex">
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Ingresa tu correo electrónico"
            className="flex-1 md:w-72 px-3 py-2 rounded-l-lg text-sm text-gray-800 bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={enviando}
            className="px-4 py-2 rounded-r-lg bg-gray-900 text-white text-sm font-semibold uppercase hover:bg-black transition-colors disabled:opacity-60"
          >
            {enviando ? 'Enviando...' : 'Suscríbete'}
          </button>
        </div>
        {mensaje && (
          <p className={`text-xs mt-2 ${mensaje.tipo === 'exito' ? 'text-white' : 'text-red-100 font-semibold'}`}>
            {mensaje.texto}
          </p>
        )}
      </form>
    </div>
  )
}

export default NewsletterSuscribete

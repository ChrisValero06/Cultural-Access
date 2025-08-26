  import React, { useState } from 'react'
  import { imagenes } from '../../constants/imagenes'

  const ControlAcceso = () => {
    const [formData, setFormData] = useState({
      institucion: '',
      numeroTarjeta: '',
      fecha: ''
    })

    const handleChange = (e) => {
      const { name, value } = e.target
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }))
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      console.log('Datos del formulario:', formData)
      // Aquí puedes agregar la lógica para enviar los datos
      alert('Formulario enviado correctamente!')
    }

    return (
      <div className="relative overflow-hidden h-full">
        {/* Header fijo */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-orange-500 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="bg-orange-500 rounded-2xl p-10 shadow-2xl max-w-3xl w-full">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Campo Institución */}
                <div>
                  <label htmlFor="institucion" className="block text-sm font-bold text-gray-800 mb-2">
                    INSTITUCIÓN *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="institucion"
                      name="institucion"
                      value={formData.institucion}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white"
                      placeholder="Ingresa el nombre de la institución"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Campo Número de Tarjeta */}
                <div>
                  <label htmlFor="numeroTarjeta" className="block text-sm font-bold text-gray-800 mb-2">
                    NÚMERO DE TARJETA *
                  </label>
                  <input
                    type="text"
                    id="numeroTarjeta"
                    name="numeroTarjeta"
                    value={formData.numeroTarjeta}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white"
                    placeholder="Ingresa el número de tarjeta"
                  />
                </div>

                {/* Campo Fecha */}
                <div>
                  <label htmlFor="fecha" className="block text-sm font-bold text-gray-800 mb-2">
                    FECHA *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="fecha"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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

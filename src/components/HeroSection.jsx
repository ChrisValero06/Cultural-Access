import React from 'react'
import { imagenes } from '../constants/imagenes'

const HeroSection = () => {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Fondo de imagen */}
      <div className="absolute inset-0">
        <img 
          src="/images/Header.jpg" 
          alt="Fondo Cultural Access"
          className="w-full h-full object-cover"
        />
        {/* Overlay para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 text-left px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Título principal */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 leading-tight">
          ¿Qué es CulturAll Access?
        </h1>
        
        {/* Descripción */}
        <p className="text-lg sm:text-xl lg:text-2xl text-white leading-relaxed max-w-3xl">
          Este proyecto de la Secretaría de Cultura del Gobierno del Estado reconoce y valora la participación de la ciudadanía en la vida cultural de Nuevo León. A través de él, se ofrecen beneficios y promociones exclusivas para quienes disfrutan de la oferta cultural del estado: productos, eventos, talleres, exposiciones, conciertos y mucho más.
        </p>
      </div>
    </section>
  )
}

export default HeroSection

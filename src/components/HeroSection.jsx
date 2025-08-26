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
      
      {/* Contenido principal con layout de dos columnas */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Columna izquierda - Texto */}
        <div className="text-left lg:w-1/2 lg:pr-8 mb-8 lg:mb-0">
          {/* Logo oficial */}
          <div className="mb-6 flex justify-center lg:justify-start">
            <img 
              src="/images/culturaaaaaaaaaalaccesssssslogo-04.png" 
              alt="Cultural Access Logo"
              className="h-20 w-auto"
            />
          </div>
          
          {/* Título principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-8 leading-tight">
            ¿Qué es CulturAll Access?
          </h1>
          
          {/* Descripción */}
          <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed">
            Este proyecto de la Secretaría de Cultura del Gobierno del Estado reconoce y valora la participación de la ciudadanía en la vida cultural de Nuevo León. A través de él, se ofrecen beneficios y promociones exclusivas para quienes disfrutan de la oferta cultural del estado: productos, eventos, talleres, exposiciones, conciertos y mucho más.
          </p>
        </div>
        
        {/* Columna derecha - Imagen */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="/images/Arco Milarca_Home 2.png" 
              alt="Logo Cultural Access"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

import React from 'react'
import { imagenes } from '../constants/imagenes'

const HeroSection = () => {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center ">
      {/* Fondo de imagen */}
      <div className="absolute inset-0">
        <img 
          src="/images/Header.jpg" 
          alt="Fondo Cultural Access"
          className="w-full h-full object-cover"
        />
        {/* Overlay para mejorar legibilidad del texto */}
        <div className=""></div>
      </div>
      
      {/* Contenido principal con layout de dos columnas */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1090px] mx-auto w-full">
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
          <h1 className="font_8 wixui-rich-text__text text-white mb-4 text-left font-bold tracking-tight leading-tight" style={{ fontSize: '28px' }}>
            ¿Qué es CulturAll Access?
          </h1>
          
          {/* Descripción */}
          <p className=" font_8 wixui-rich-text__text  text-left" style={{ fontSize: '16px' }}>
            Este proyecto de la Secretaría de Cultura del Gobierno del Estado reconoce y valora la participación de la ciudadanía en la vida cultural de Nuevo León. A través de él, se ofrecen beneficios y promociones exclusivas para quienes disfrutan de la oferta cultural del estado: productos, eventos, talleres, exposiciones, conciertos y mucho más.
          </p>
        </div>
        
        {/* Columna derecha - Imagen */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <div className="relative w-96 h-96 lg:w-[28rem] lg:h-[28rem] ">
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

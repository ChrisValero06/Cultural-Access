import React from 'react'

const BarraNaranja = () => {
  return (
    <div className="w-full bg-orange-500 h-20 sm:h-28 relative overflow-hidden flex items-center justify-center">
      {/* Banner para desktop - se oculta en móvil */}
      <img 
        src="/images/Banner LAB.png" 
        alt="Banner LABNL"
        className="hidden sm:block h-full w-auto object-contain"
      />
      
      {/* Banner para móvil - más grande */}
      <img 
        src="/images/Banner LAB-movil.png" 
        alt="Banner LABNL"
        className="block sm:hidden h-20 w-auto object-contain"
      />
    </div>
  )
}

export default BarraNaranja

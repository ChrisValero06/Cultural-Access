import React from 'react'

const BarraNaranja = () => {
  return (
    <div className="w-full bg-orange-500 h-32 sm:h-24 relative overflow-hidden flex items-center justify-center py-2 px-4">
      {/* Banner para desktop - se oculta en móvil */}
      {/* <img 
        src="/images/Banner LAB.png" 
        alt="Banner LAB"
        className="hidden sm:block h-full w-auto object-contain"
      /> */}
      
      {/* Banner para móvil - más grande */}
      {/* <img 
        src="/images/Banner LAB-movil.png" 
        alt="Banner LAB"
        className="block sm:hidden h-full w-auto object-contain"
      /> */}
    </div>
  )
}

export default BarraNaranja

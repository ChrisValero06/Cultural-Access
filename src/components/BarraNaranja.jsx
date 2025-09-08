import React from 'react'

const BarraNaranja = () => {
  return (
    <div className="w-full bg-orange-500 h-9 sm:h-9 relative overflow-hidden flex items-center justify-center">
      {/* Banner para desktop - se oculta en móvil */}
      <img 
        src="/images/" 
        alt=""
        className="hidden sm:block h-full w-auto object-contain"
      />
      
      {/* Banner para móvil - más grande */}
      <img 
        src="/images/Banner" 
        alt=""
        className="block sm:hidden h-20 w-auto object-contain"
      />
    </div>
  )
}

export default BarraNaranja

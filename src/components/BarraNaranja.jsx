import React from 'react'

const BarraNaranja = () => {
  return (
    <div className="w-full bg-orange-400 h-20 relative overflow-hidden flex items-center justify-center">
      {/* Imagen del Banner LAB más pequeña y centrada */}
      <img 
        src="/images/Banner LAB.png" 
        alt="Banner LABNL"
        className="h-full w-auto object-contain"
      />
    </div>
  )
}

export default BarraNaranja

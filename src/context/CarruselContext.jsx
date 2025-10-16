import React, { createContext, useContext, useState, useEffect } from 'react';

const CarruselContext = createContext();

export const useCarrusel = () => {
  const context = useContext(CarruselContext);
  if (!context) {
    throw new Error('useCarrusel debe ser usado dentro de CarruselProvider');
  }
  return context;
};

export const CarruselProvider = ({ children }) => {
  const [carruseles, setCarruseles] = useState({
    principal: { 
      activo: true, 
      nombre: 'Carrusel Principal', 
      descripcion: 'Carrusel principal de promociones destacadas',
      visible: true
    },
    secundario: { 
      activo: false, 
      nombre: 'Carrusel Secundario', 
      descripcion: 'Carrusel secundario de promociones',
      visible: false
    },
    destacados: { 
      activo: true, 
      nombre: 'Carrusel de Destacados', 
      descripcion: 'Carrusel de promociones destacadas',
      visible: true
    }
  });

  // Estado para el tamaño uniforme de todos los carruseles
  const [tamanoCarrusel, setTamanoCarrusel] = useState({
    movil: 'h-[200px] sm:h-[250px]',      // Tamaño para móviles (responsivo)
    desktop: 'md:h-[300px] lg:h-[350px] xl:h-[400px]'  // Tamaño para desktop (responsivo)
  });

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('carruselState');
    const savedTamano = localStorage.getItem('tamanoCarruselState');
    
    if (savedState) {
      try {
        setCarruseles(JSON.parse(savedState));
      } catch (error) {
      }
    }
    
    if (savedTamano) {
      try {
        setTamanoCarrusel(JSON.parse(savedTamano));
      } catch (error) {
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carruselState', JSON.stringify(carruseles));
  }, [carruseles]);

  useEffect(() => {
    localStorage.setItem('tamanoCarruselState', JSON.stringify(tamanoCarrusel));
  }, [tamanoCarrusel]);

  const toggleCarrusel = (carruselId) => {
    setCarruseles(prev => ({
      ...prev,
      [carruselId]: {
        ...prev[carruselId],
        activo: !prev[carruselId].activo,
        visible: !prev[carruselId].visible
      }
    }));
  };

  const activarCarrusel = (carruselId) => {
    setCarruseles(prev => ({
      ...prev,
      [carruselId]: {
        ...prev[carruselId],
        activo: true,
        visible: true
      }
    }));
  };

  const desactivarCarrusel = (carruselId) => {
    setCarruseles(prev => ({
      ...prev,
      [carruselId]: {
        ...prev[carruselId],
        activo: false,
        visible: false
      }
    }));
  };

  const getCarruselActivo = (carruselId) => {
    return carruseles[carruselId]?.activo || false;
  };

  const getCarruselVisible = (carruselId) => {
    const visible = carruseles[carruselId]?.visible || false;
    console.log(`🔍 Verificando visibilidad de ${carruselId}:`, { visible, carrusel: carruseles[carruselId] });
    return visible;
  };

  const getAllCarruseles = () => {
    return carruseles;
  };

  // Funciones para manejar el tamaño de los carruseles
  const cambiarTamanoCarrusel = (movil, desktop) => {
    setTamanoCarrusel({
      movil: movil || tamanoCarrusel.movil,
      desktop: desktop || tamanoCarrusel.desktop
    });
  };

  const getTamanoCarrusel = () => {
    return tamanoCarrusel;
  };

  const getClaseTamanoCarrusel = () => {
    return `${tamanoCarrusel.movil} ${tamanoCarrusel.desktop}`;
  };

  const value = { 
    carruseles, 
    toggleCarrusel, 
    activarCarrusel, 
    desactivarCarrusel, 
    getCarruselActivo, 
    getCarruselVisible,
    getAllCarruseles,
    tamanoCarrusel,
    cambiarTamanoCarrusel,
    getTamanoCarrusel,
    getClaseTamanoCarrusel
  };

  return (
    <CarruselContext.Provider value={value}>
      {children}
    </CarruselContext.Provider>
  );
};

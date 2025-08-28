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

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('carruselState');
    if (savedState) {
      try {
        setCarruseles(JSON.parse(savedState));
      } catch (error) {
        console.error('Error cargando estado del carrusel:', error);
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carruselState', JSON.stringify(carruseles));
  }, [carruseles]);

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
    return carruseles[carruselId]?.visible || false;
  };

  const getAllCarruseles = () => {
    return carruseles;
  };

  const value = { 
    carruseles, 
    toggleCarrusel, 
    activarCarrusel, 
    desactivarCarrusel, 
    getCarruselActivo, 
    getCarruselVisible,
    getAllCarruseles 
  };

  return (
    <CarruselContext.Provider value={value}>
      {children}
    </CarruselContext.Provider>
  );
};

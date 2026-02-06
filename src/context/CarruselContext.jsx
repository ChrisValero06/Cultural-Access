import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { configService } from '../apis/config/configService';

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
    movil: 'h-[334px]',      // Altura fija 334px
    desktop: 'h-[334px]'  // Altura fija 334px
  });

  // Textos editables de la sección promociones (título y subtítulo)
  const [textosPromociones, setTextosPromociones] = useState({
    titulo: 'PROMOCIONES VIGENTES - FEBRERO',
    subtitulo: 'Presentando tarjeta y sujetas a disponibilidad'
  });

  // Cargar estado desde backend (textos) y localStorage al inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('carruselState');
    const savedTamano = localStorage.getItem('tamanoCarruselState');
    const savedTextos = localStorage.getItem('textosPromocionesState');

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

    // Textos: primero intentar backend; si no hay endpoint o falla, usar localStorage
    const defaults = { titulo: 'PROMOCIONES VIGENTES - FEBRERO', subtitulo: 'Presentando tarjeta y sujetas a disponibilidad' };
    configService.getTextosPromociones().then((data) => {
      if (data && typeof data.titulo === 'string' && typeof data.subtitulo === 'string') {
        setTextosPromociones({ titulo: data.titulo, subtitulo: data.subtitulo });
        return;
      }
      if (savedTextos) {
        try {
          const parsed = JSON.parse(savedTextos);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setTextosPromociones({
              titulo: typeof parsed.titulo === 'string' ? parsed.titulo : defaults.titulo,
              subtitulo: typeof parsed.subtitulo === 'string' ? parsed.subtitulo : defaults.subtitulo
            });
          }
        } catch (error) {
          setTextosPromociones(defaults);
        }
      }
    }).catch(() => {
      if (savedTextos) {
        try {
          const parsed = JSON.parse(savedTextos);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setTextosPromociones({
              titulo: typeof parsed.titulo === 'string' ? parsed.titulo : defaults.titulo,
              subtitulo: typeof parsed.subtitulo === 'string' ? parsed.subtitulo : defaults.subtitulo
            });
          }
        } catch (error) {
          setTextosPromociones(defaults);
        }
      }
    });
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carruselState', JSON.stringify(carruseles));
  }, [carruseles]);

  useEffect(() => {
    localStorage.setItem('tamanoCarruselState', JSON.stringify(tamanoCarrusel));
  }, [tamanoCarrusel]);

  useEffect(() => {
    localStorage.setItem('textosPromocionesState', JSON.stringify(textosPromociones));
  }, [textosPromociones]);

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

  const actualizarTextosPromociones = (titulo, subtitulo) => {
    setTextosPromociones(prev => {
      const next = {
        ...prev,
        ...(titulo !== undefined && { titulo }),
        ...(subtitulo !== undefined && { subtitulo })
      };
      // Persistir en backend (si el endpoint existe)
      configService.updateTextosPromociones(next).catch(() => {});
      return next;
    });
  };

  const value = useMemo(() => ({
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
    getClaseTamanoCarrusel,
    textosPromociones: textosPromociones || { titulo: 'PROMOCIONES VIGENTES - FEBRERO', subtitulo: 'Presentando tarjeta y sujetas a disponibilidad' },
    actualizarTextosPromociones
  }), [carruseles, tamanoCarrusel, textosPromociones]);

  return (
    <CarruselContext.Provider value={value}>
      {children}
    </CarruselContext.Provider>
  );
};

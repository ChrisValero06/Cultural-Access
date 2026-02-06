import React, { useState } from 'react';
import { useCarrusel } from '../../../context/CarruselContext';

const ConfiguracionCarrusel = () => {
  const {
    carruseles,
    toggleCarrusel,
    getCarruselVisible,
    tamanoCarrusel,
    cambiarTamanoCarrusel,
    getClaseTamanoCarrusel,
    textosPromociones,
    actualizarTextosPromociones
  } = useCarrusel();

  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [nuevoTamanoMovil, setNuevoTamanoMovil] = useState(tamanoCarrusel.movil);
  const [nuevoTamanoDesktop, setNuevoTamanoDesktop] = useState(tamanoCarrusel.desktop);

  // Opciones predefinidas de tamaños responsivos
  const opcionesTamaño = {
    movil: [
      { valor: 'h-[150px] sm:h-[200px]', etiqueta: 'Pequeño (150px-200px)' },
      { valor: 'h-[200px] sm:h-[250px]', etiqueta: 'Mediano (200px-250px)' },
      { valor: 'h-[250px] sm:h-[300px]', etiqueta: 'Grande (250px-300px)' },
      { valor: 'h-[300px] sm:h-[350px]', etiqueta: 'Extra Grande (300px-350px)' }
    ],
    desktop: [
      { valor: 'md:h-[250px] lg:h-[300px] xl:h-[350px]', etiqueta: 'Pequeño (250px-350px)' },
      { valor: 'md:h-[300px] lg:h-[350px] xl:h-[400px]', etiqueta: 'Mediano (300px-400px)' },
      { valor: 'md:h-[350px] lg:h-[400px] xl:h-[450px]', etiqueta: 'Grande (350px-450px)' },
      { valor: 'md:h-[400px] lg:h-[450px] xl:h-[500px]', etiqueta: 'Extra Grande (400px-500px)' },
      { valor: 'md:h-[450px] lg:h-[500px] xl:h-[550px]', etiqueta: 'Muy Grande (450px-550px)' }
    ]
  };

  const handleGuardarTamaño = () => {
    cambiarTamanoCarrusel(nuevoTamanoMovil, nuevoTamanoDesktop);
    setMostrarConfiguracion(false);
  };

  const handleResetearTamaño = () => {
    setNuevoTamanoMovil('h-[200px] sm:h-[250px]');
    setNuevoTamanoDesktop('md:h-[300px] lg:h-[350px] xl:h-[400px]');
    cambiarTamanoCarrusel('h-[200px] sm:h-[250px]', 'md:h-[300px] lg:h-[350px] xl:h-[400px]');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🎠 Configuración de Carruseles Responsivos
        </h3>
        <button
          onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          {mostrarConfiguracion ? 'Ocultar' : 'Configurar'}
        </button>
      </div>

      {/* Textos editables de la sección Promociones (página principal) */}
      <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          📝 Textos de la sección Promociones
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          Estos textos se muestran en la página principal sobre los carruseles. Los cambios se guardan automáticamente.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={textosPromociones?.titulo ?? ''}
              onChange={(e) => actualizarTextosPromociones(e.target.value, undefined)}
              placeholder="Ej: PROMOCIONES VIGENTES - FEBRERO"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <input
              type="text"
              value={textosPromociones?.subtitulo ?? ''}
              onChange={(e) => actualizarTextosPromociones(undefined, e.target.value)}
              placeholder="Ej: Presentando tarjeta y sujetas a disponibilidad"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionCarrusel;


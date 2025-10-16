import React, { useState } from 'react';
import { useCarrusel } from '../../../context/CarruselContext';

const ConfiguracionCarrusel = () => {
  const { 
    carruseles, 
    toggleCarrusel, 
    getCarruselVisible, 
    tamanoCarrusel, 
    cambiarTamanoCarrusel,
    getClaseTamanoCarrusel 
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

      {/* Estado actual de los carruseles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(carruseles).map(([key, carrusel]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">{carrusel.nombre}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                getCarruselVisible(key) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {getCarruselVisible(key) ? 'Visible' : 'Oculto'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{carrusel.descripcion}</p>
            <button
              onClick={() => toggleCarrusel(key)}
              className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                getCarruselVisible(key)
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {getCarruselVisible(key) ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        ))}
      </div>

      {/* Configuración de tamaño */}
      {mostrarConfiguracion && (
        <div className="border-t pt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">
            📏 Tamaño Responsivo de Carruseles
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tamaño móvil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño en Móvil (xs, sm)
              </label>
              <select
                value={nuevoTamanoMovil}
                onChange={(e) => setNuevoTamanoMovil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {opcionesTamaño.movil.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            {/* Tamaño desktop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño en Desktop (md, lg, xl)
              </label>
              <select
                value={nuevoTamanoDesktop}
                onChange={(e) => setNuevoTamanoDesktop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {opcionesTamaño.desktop.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista previa del tamaño actual */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Vista Previa del Tamaño Actual:</h5>
            <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
              {getClaseTamanoCarrusel()}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <strong>Breakpoints:</strong><br/>
              • Móvil (xs): 0-640px<br/>
              • Small (sm): 640-768px<br/>
              • Medium (md): 768-1024px<br/>
              • Large (lg): 1024-1280px<br/>
              • Extra Large (xl): 1280px+
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleGuardarTamaño}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium"
            >
              💾 Guardar Cambios
            </button>
            <button
              onClick={handleResetearTamaño}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium"
            >
              🔄 Restablecer Responsivo
            </button>
            <button
              onClick={() => setMostrarConfiguracion(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionCarrusel;


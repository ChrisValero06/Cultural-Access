import React, { useEffect, useState } from 'react';
import { newsletterService } from '../../../../apis';

const ESTADOS = {
  borrador: { label: 'Borrador', clase: 'bg-gray-100 text-gray-700' },
  programada: { label: 'Programada', clase: 'bg-blue-100 text-blue-800' },
  enviada: { label: 'Enviada', clase: 'bg-green-100 text-green-800' },
};

const CampanasLista = ({ onNueva, onEditar }) => {
  const [campanas, setCampanas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await newsletterService.obtenerCampanas();
      setCampanas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (campana) => {
    if (!window.confirm(`¿Eliminar la campaña "${campana.nombre}"?`)) return;
    try {
      await newsletterService.eliminarCampana(campana.id);
      setCampanas((prev) => prev.filter((c) => c.id !== campana.id));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const verPreview = async (campana) => {
    try {
      const html = await newsletterService.previewCampanaGuardada(campana.id);
      setPreview({ nombre: campana.nombre, html });
    } catch (err) {
      alert('Error al cargar la vista previa: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Campañas de newsletter</h2>
          <p className="text-sm text-gray-500">Se envían a la audiencia de Mailchimp.</p>
        </div>
        <button
          onClick={onNueva}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          + Nueva campaña
        </button>
      </div>

      {cargando && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          {error}
          <button onClick={cargar} className="ml-3 underline">Reintentar</button>
        </div>
      )}

      {!cargando && !error && campanas.length === 0 && (
        <div className="text-center text-gray-500 py-12 border border-dashed border-gray-300 rounded-lg">
          No hay campañas todavía.{' '}
          <button onClick={onNueva} className="text-orange-600 underline">Crear la primera</button>
        </div>
      )}

      <div className="space-y-3">
        {campanas.map((c) => {
          const estado = ESTADOS[c.estado] || ESTADOS.borrador;
          return (
            <div key={c.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-orange-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800 truncate">{c.nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estado.clase}`}>{estado.label}</span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{c.asunto}</p>
                {c.estado === 'enviada' && c.enviada_en && (
                  <p className="text-xs text-gray-400 mt-0.5">Enviada: {new Date(c.enviada_en).toLocaleString('es-MX')}</p>
                )}
                {c.estado === 'programada' && c.programada_para && (
                  <p className="text-xs text-blue-600 mt-0.5">Programada: {new Date(c.programada_para).toLocaleString('es-MX')}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => verPreview(c)}
                  className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
                >
                  Vista previa
                </button>
                {c.estado !== 'enviada' && (
                  <>
                    <button
                      onClick={() => onEditar(c.id)}
                      className="text-sm text-gray-700 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminar(c)}
                      className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-lg w-full max-w-3xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-gray-800">{preview.nombre}</span>
              <button onClick={() => setPreview(null)} className="text-gray-500 hover:text-gray-800 text-xl leading-none">×</button>
            </div>
            <iframe title="Vista previa" srcDoc={preview.html} className="flex-1 w-full rounded-b-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampanasLista;

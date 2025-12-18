import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../apis';
import useDocumentTitle from '../../../../hooks/useDocumentTitle';

const ReportesRedenciones = () => {
  useDocumentTitle('Reportes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState('');
  const [tipoPromocionSeleccionado, setTipoPromocionSeleccionado] = useState('');
  const [redenciones, setRedenciones] = useState([]);
  const [redencionesFiltradas, setRedencionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reporteGenerado, setReporteGenerado] = useState(false);

  useEffect(() => {
    cargarRedenciones();
  }, []);

  const cargarRedenciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todas las redenciones con paginación
      let todasLasRedenciones = [];
      let offset = 0;
      const limit = 100;
      let hayMas = true;
      const idsVistos = new Set(); // Para evitar duplicados

      while (hayMas) {
        const response = await apiService.obtenerControlAcceso({ limit, offset });
        const redencionesData = response.data || response.redenciones || response || [];
        
        if (Array.isArray(redencionesData)) {
          // Filtrar duplicados basados en el ID
          const redencionesSinDuplicados = redencionesData.filter(redencion => {
            const id = redencion.id;
            if (!id) {
              // Si no tiene ID, usar una combinación de campos únicos como clave
              const claveUnica = `${redencion.institucion || ''}_${redencion.numero_tarjeta || redencion.numeroTarjeta || ''}_${redencion.fecha || redencion.fecha_redencion || ''}`;
              if (idsVistos.has(claveUnica)) {
                return false; // Duplicado
              }
              idsVistos.add(claveUnica);
              return true;
            }
            
            if (idsVistos.has(id)) {
              return false; // Duplicado
            }
            idsVistos.add(id);
            return true;
          });
          
          todasLasRedenciones = [...todasLasRedenciones, ...redencionesSinDuplicados];
          
          // Si recibimos menos registros que el límite, no hay más datos
          if (redencionesData.length < limit) {
            hayMas = false;
          } else {
            offset += limit;
          }
        } else {
          hayMas = false;
        }
        
        // Límite de seguridad para evitar bucles infinitos
        if (offset > 5000) {
          hayMas = false;
        }
      }

      // Eliminar duplicados finales por si acaso (basado en ID)
      const redencionesUnicas = todasLasRedenciones.filter((redencion, index, self) => {
        const id = redencion.id;
        if (id) {
          return index === self.findIndex(r => r.id === id);
        }
        // Si no tiene ID, usar combinación de campos
        const claveUnica = `${redencion.institucion || ''}_${redencion.numero_tarjeta || redencion.numeroTarjeta || ''}_${redencion.fecha || redencion.fecha_redencion || ''}`;
        return index === self.findIndex(r => {
          const otraClave = `${r.institucion || ''}_${r.numero_tarjeta || r.numeroTarjeta || ''}_${r.fecha || r.fecha_redencion || ''}`;
          return otraClave === claveUnica;
        });
      });

      setRedenciones(redencionesUnicas);
    } catch (err) {
      setError('Error al cargar redenciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor, selecciona ambas fechas (inicio y fin)');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filtrar redenciones por rango de fechas e institución
      const fechaInicioObj = new Date(fechaInicio);
      fechaInicioObj.setHours(0, 0, 0, 0);
      
      const fechaFinObj = new Date(fechaFin);
      fechaFinObj.setHours(23, 59, 59, 999);

      const filtradas = redenciones.filter(redencion => {
        // Filtrar por fecha (puede venir como 'fecha' o 'fecha_redencion')
        const fechaRedencion = redencion.fecha || redencion.fecha_redencion || redencion.created_at;
        if (!fechaRedencion) {
          return false; // Excluir redenciones sin fecha
        }

        const fecha = new Date(fechaRedencion);
        if (fecha < fechaInicioObj || fecha > fechaFinObj) {
          return false;
        }

        // Filtrar por institución si está seleccionada (comparar sin acentos)
        if (institucionSeleccionada) {
          const institucionRedencion = redencion.institucion || '';
          if (normalizarTexto(institucionRedencion) !== normalizarTexto(institucionSeleccionada)) {
            return false;
          }
        }

        // Filtrar por tipo de promoción si está seleccionado
        if (tipoPromocionSeleccionado) {
          const tipoPromocionRedencion = redencion.tipo_promocion || redencion.tipoPromocion || '';
          if (tipoPromocionRedencion.toLowerCase().trim() !== tipoPromocionSeleccionado.toLowerCase().trim()) {
            return false;
          }
        }

        return true;
      });

      setRedencionesFiltradas(filtradas);
      setReporteGenerado(true);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setInstitucionSeleccionada('');
    setTipoPromocionSeleccionado('');
    setRedencionesFiltradas([]);
    setReporteGenerado(false);
  };

  // Obtener tipos de promoción únicos para la institución seleccionada
  const tiposPromocionDisponibles = React.useMemo(() => {
    if (!institucionSeleccionada) return [];
    
    const redencionesInstitucion = redenciones.filter(r => {
      const institucion = r.institucion || '';
      return normalizarTexto(institucion) === normalizarTexto(institucionSeleccionada);
    });
    
    const tipos = redencionesInstitucion
      .map(r => r.tipo_promocion || r.tipoPromocion)
      .filter(Boolean)
      .filter((tipo, index, self) => self.indexOf(tipo) === index)
      .sort();
    
    return tipos;
  }, [institucionSeleccionada, redenciones]);

  // Determinar si se debe mostrar el campo de tipo de promoción
  const mostrarTipoPromocion = tiposPromocionDisponibles.length > 1;

  // Estadísticas de redenciones filtradas
  const estadisticas = React.useMemo(() => {
    if (!reporteGenerado || redencionesFiltradas.length === 0) {
      return null;
    }

    // Agrupar por institución y tipo de promoción
    const porInstitucion = {};
    const porTipoPromocion = {};

    redencionesFiltradas.forEach(r => {
      const institucion = r.institucion || 'Sin institución';
      const tipoPromocion = r.tipo_promocion || r.tipoPromocion || 'Sin tipo';
      
      // Contar por institución
      porInstitucion[institucion] = (porInstitucion[institucion] || 0) + 1;
      
      // Contar por tipo de promoción
      porTipoPromocion[tipoPromocion] = (porTipoPromocion[tipoPromocion] || 0) + 1;
    });

    return {
      total: redencionesFiltradas.length,
      porInstitucion,
      porTipoPromocion
    };
  }, [redencionesFiltradas, reporteGenerado]);

  const exportarReporte = async () => {
    if (redencionesFiltradas.length === 0) {
      alert('No hay datos para exportar. Genera un reporte primero.');
      return;
    }

    try {
      // Cargar SheetJS desde CDN
      const loadXLSX = () => new Promise((resolve, reject) => {
        if (window.XLSX) return resolve(window.XLSX);
        const existing = document.querySelector('script[data-xlsx]');
        if (existing) {
          existing.addEventListener('load', () => resolve(window.XLSX));
          existing.addEventListener('error', reject);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-xlsx', '1');
        script.onload = () => resolve(window.XLSX);
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const XLSX = await loadXLSX();

      const headers = [
        'ID', 'Institución', 'Número de Tarjeta', 'Fecha', 'Tipo de Promoción', 'Estado'
      ];

      const rows = redencionesFiltradas.map(r => {
        const fecha = r.fecha || r.fecha_redencion || r.created_at || '';
        const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-MX') : '';

        return [
          r.id || '',
          r.institucion || '',
          r.numero_tarjeta || r.numeroTarjeta || '',
          fechaFormateada,
          r.tipo_promocion || r.tipoPromocion || '',
          r.estado || ''
        ];
      });

      const aoa = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Redenciones');
      
      const nombreInstitucion = institucionSeleccionada 
        ? institucionSeleccionada.replace(/\s+/g, '_').toLowerCase() 
        : 'todas';
      const nombreArchivo = `reporte_redenciones_${nombreInstitucion}_${fechaInicio}_${fechaFin}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    } catch (err) {
      alert('Error al exportar el reporte: ' + err.message);
    }
  };

  // Función para normalizar texto removiendo acentos y caracteres especiales
  const normalizarTexto = (texto) => {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/\s+/g, ' '); // Eliminar espacios múltiples
  };

  // Preparar lista de instituciones para el dropdown (eliminar duplicados normalizando)
  const institucionesUnicas = React.useMemo(() => {
    const institucionesMap = new Map();
    
    redenciones.forEach(r => {
      const institucion = r.institucion;
      if (!institucion) return;
      
      // Normalizar: trim, lowercase, eliminar acentos y espacios múltiples
      const normalizada = normalizarTexto(institucion);
      
      // Si no existe en el mapa, guardarlo
      // Preferir la versión con acentos (más caracteres después de normalizar indica acentos)
      if (!institucionesMap.has(normalizada)) {
        institucionesMap.set(normalizada, institucion.trim());
      } else {
        // Si ya existe, preferir la versión con acentos (León > Leon)
        const existente = institucionesMap.get(normalizada);
        if (institucion.trim().length > existente.length) {
          institucionesMap.set(normalizada, institucion.trim());
        }
      }
    });
    
    // Convertir a array y ordenar alfabéticamente
    const institucionesArray = Array.from(institucionesMap.values());
    
    return institucionesArray.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [redenciones]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reportes de Redenciones</h2>

      {/* Filtros */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className={`grid grid-cols-1 ${mostrarTipoPromocion ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio *
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin *
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institución
            </label>
            <select
              value={institucionSeleccionada}
              onChange={(e) => {
                setInstitucionSeleccionada(e.target.value);
                setTipoPromocionSeleccionado(''); // Limpiar tipo de promoción al cambiar institución
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todas las instituciones</option>
              {institucionesUnicas.map(inst => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          {mostrarTipoPromocion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Promoción
              </label>
              <select
                value={tipoPromocionSeleccionado}
                onChange={(e) => setTipoPromocionSeleccionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                {tiposPromocionDisponibles.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={generarReporte}
            disabled={loading || !fechaInicio || !fechaFin}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar Reporte
              </>
            )}
          </button>

          <button
            onClick={limpiarFiltros}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Limpiar Filtros
          </button>

          {reporteGenerado && redencionesFiltradas.length > 0 && (
            <button
              onClick={exportarReporte}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar a Excel
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reporteGenerado && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-800 font-medium text-lg">
                 Reporte generado: <span className="font-bold text-xl">{redencionesFiltradas.length}</span> redención(es) encontrada(s)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {institucionSeleccionada && (
                <p className="text-blue-700 text-sm">
                  <span className="font-semibold">Institución:</span> {institucionSeleccionada}
                </p>
              )}
              {tipoPromocionSeleccionado && (
                <p className="text-blue-700 text-sm">
                  <span className="font-semibold">Tipo de Promoción:</span> {tipoPromocionSeleccionado}
                </p>
              )}
              <p className="text-blue-700 text-sm">
                <span className="font-semibold">Período:</span> {new Date(fechaInicio).toLocaleDateString('es-MX')} - {new Date(fechaFin).toLocaleDateString('es-MX')}
              </p>
            </div>
            
            {/* Estadísticas detalladas */}
            {estadisticas && institucionSeleccionada && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-blue-800 font-semibold mb-2"> Estadísticas:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-blue-700 text-sm">
                      <span className="font-medium">Total de redenciones:</span> {estadisticas.total}
                    </p>
                    {institucionSeleccionada && (
                      <p className="text-blue-700 text-sm">
                        <span className="font-medium">En {institucionSeleccionada}:</span> {estadisticas.porInstitucion[institucionSeleccionada] || 0}
                      </p>
                    )}
                  </div>
                  {mostrarTipoPromocion && tiposPromocionDisponibles.length > 0 && (
                    <div>
                      <p className="text-blue-700 text-sm font-medium mb-1">Por tipo de promoción:</p>
                      {tiposPromocionDisponibles.map(tipo => {
                        const count = redencionesFiltradas.filter(r => 
                          (r.tipo_promocion || r.tipoPromocion || '') === tipo
                        ).length;
                        if (count === 0) return null;
                        return (
                          <p key={tipo} className="text-blue-700 text-sm ml-2">
                            • {tipo}: <span className="font-semibold">{count}</span>
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla de resultados */}
      {reporteGenerado && redencionesFiltradas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Institución</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Número de Tarjeta</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tipo de Promoción</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {redencionesFiltradas.map((redencion) => {
                const fecha = redencion.fecha || redencion.fecha_redencion || redencion.created_at || '';
                const fechaFormateada = fecha 
                  ? new Date(fecha).toLocaleDateString('es-MX')
                  : '-';

                return (
                  <tr key={redencion.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{redencion.id || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{redencion.institucion || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{redencion.numero_tarjeta || redencion.numeroTarjeta || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{fechaFormateada}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{redencion.tipo_promocion || redencion.tipoPromocion || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{redencion.estado || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reporteGenerado && redencionesFiltradas.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">
            No se encontraron redenciones con los criterios seleccionados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportesRedenciones;


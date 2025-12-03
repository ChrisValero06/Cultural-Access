import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../apis';

const ReportesUsuarios = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [perfilSeleccionado, setPerfilSeleccionado] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reporteGenerado, setReporteGenerado] = useState(false);

  // Mapeo de IDs de perfil a nombres legibles
  const perfilMap = {
    'francisco_murga': 'Francisco Murga',
    'alejandro_olachea': 'Alejandro Olachea',
    'raymundo_ibarra': 'Raymundo Ibarra',
    'karla_acevedo': 'Karla Acevedo',
    'pepe': 'Pepe',
    'jose': 'Jose',
    'labnl': 'LABNL',
    'admin': 'Pepe',
    '': 'Todos los usuarios'
  };

  const perfiles = [
    { value: '', label: 'Todos los usuarios' },
    { value: 'francisco_murga', label: 'Francisco Murga' },
    { value: 'alejandro_olachea', label: 'Alejandro Olachea' },
    { value: 'raymundo_ibarra', label: 'Raymundo Ibarra' },
    { value: 'karla_acevedo', label: 'Karla Acevedo' },
    { value: 'jose', label: 'Jose' },
    { value: 'labnl', label: 'LABNL' }
  ];

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.obtenerUsuarios();
      const usuariosData = response.data || response.usuarios || response || [];
      setUsuarios(usuariosData);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
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
      // Filtrar usuarios por rango de fechas y perfil
      const fechaInicioObj = new Date(fechaInicio);
      fechaInicioObj.setHours(0, 0, 0, 0);
      
      const fechaFinObj = new Date(fechaFin);
      fechaFinObj.setHours(23, 59, 59, 999);

      const filtrados = usuarios.filter(usuario => {
        // Filtrar por fecha_registro
        if (usuario.fecha_registro) {
          const fechaRegistro = new Date(usuario.fecha_registro);
          if (fechaRegistro < fechaInicioObj || fechaRegistro > fechaFinObj) {
            return false;
          }
        } else {
          // Si no tiene fecha_registro, usar fecha_nacimiento como fallback (no ideal pero mejor que nada)
          return false; // Excluir usuarios sin fecha de registro
        }

        // Filtrar por perfil si está seleccionado
        if (perfilSeleccionado && usuario.registrado_por !== perfilSeleccionado) {
          return false;
        }

        return true;
      });

      setUsuariosFiltrados(filtrados);
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
    setPerfilSeleccionado('');
    setUsuariosFiltrados([]);
    setReporteGenerado(false);
  };

  const exportarReporte = async () => {
    if (usuariosFiltrados.length === 0) {
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
        'ID', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Género', 'Email',
        'Teléfono', 'Calle y Número', 'Municipio', 'Estado', 'Colonia', 'Código Postal',
        'Edad', 'Estado Civil', 'Estudios', 'CURP', 'Estado de Nacimiento', 'Fecha de Nacimiento',
        'Número de Tarjeta', 'Acepta Info', 'Registrado Por', 'Fecha de Registro'
      ];

      const rows = usuariosFiltrados.map(u => {
        const registradoPor = u.registrado_por 
          ? (perfilMap[u.registrado_por] || u.registrado_por)
          : 'SIN PERFIL';

        return [
          u.id,
          u.nombre || '',
          u.apellido_paterno || '',
          u.apellido_materno || '',
          u.genero || '',
          u.email || '',
          u.telefono || '',
          u.calle_numero || '',
          u.municipio || '',
          u.estado || '',
          u.colonia || '',
          u.codigo_postal || '',
          u.edad || '',
          u.estado_civil || '',
          u.estudios || '',
          u.curp || '',
          u.estado_nacimiento || '',
          u.fecha_nacimiento || '',
          u.numero_tarjeta || '',
          u.acepta_info || '',
          registradoPor,
          u.fecha_registro || ''
        ];
      });

      const aoa = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Usuarios');
      
      const nombreArchivo = `reporte_usuarios_${perfilSeleccionado ? perfilMap[perfilSeleccionado].replace(' ', '_') : 'todos'}_${fechaInicio}_${fechaFin}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    } catch (err) {
      alert('Error al exportar el reporte: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reportes de Usuarios Registrados</h2>

      {/* Filtros */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              Usuario/Perfil
            </label>
            <select
              value={perfilSeleccionado}
              onChange={(e) => setPerfilSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {perfiles.map(perfil => (
                <option key={perfil.value} value={perfil.value}>
                  {perfil.label}
                </option>
              ))}
            </select>
          </div>
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

          {reporteGenerado && usuariosFiltrados.length > 0 && (
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
            <p className="text-blue-800 font-medium">
              📊 Reporte generado: <span className="font-bold">{usuariosFiltrados.length}</span> usuario(s) encontrado(s)
            </p>
            {perfilSeleccionado && (
              <p className="text-blue-700 text-sm mt-1">
                Usuario: <span className="font-semibold">{perfilMap[perfilSeleccionado]}</span>
              </p>
            )}
            <p className="text-blue-700 text-sm">
              Período: {new Date(fechaInicio).toLocaleDateString('es-MX')} - {new Date(fechaFin).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>
      )}

      {/* Tabla de resultados */}
      {reporteGenerado && usuariosFiltrados.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Apellidos</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Registrado Por</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => {
                const registradoPor = usuario.registrado_por 
                  ? (perfilMap[usuario.registrado_por] || usuario.registrado_por)
                  : 'SIN PERFIL';

                return (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{usuario.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{usuario.nombre || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {usuario.apellido_paterno || ''} {usuario.apellido_materno || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{usuario.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{usuario.telefono || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{registradoPor}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {usuario.fecha_registro 
                        ? new Date(usuario.fecha_registro).toLocaleDateString('es-MX')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reporteGenerado && usuariosFiltrados.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">
            No se encontraron usuarios con los criterios seleccionados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportesUsuarios;


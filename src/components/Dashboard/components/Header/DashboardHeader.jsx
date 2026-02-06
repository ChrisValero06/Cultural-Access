import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../../apis';
import { opcionesEstadoCivil } from '../../../../constants/opcionesFormulario';

const DashboardHeader = ({ 
  tabActiva, 
  onTabChange, 
  onRefresh, 
  totalPromociones,
  lastUpdate,
  loading
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Limpiar todos los datos de sesión
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userUsuario');
      localStorage.removeItem('perfilId');
      localStorage.removeItem('perfilNombre');
    } catch (e) {}
    // Redirigir al login
    navigate('/login', { replace: true });
  };
  const PMA_BASE = 'https://69.48.207.88/phpMyAdmin/index.php?route=/database/structure&db=cultural_Access';

  const openPhpMyAdmin = () => {
    try {
      window.open(PMA_BASE, '_blank', 'noopener');
    } catch (e) {
    }
  };

  const sanitize = (value) => {
    if (value === null || value === undefined) return '';
    const text = String(value).replace(/\r?\n|\r/g, ' ');
    if (text.includes(',') || text.includes('"')) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  };

  const downloadCsv = (rowsArray, filename) => {
    const csvContent = rowsArray.join('\n');
    const BOM = '\ufeff';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cargar SheetJS (XLSX) desde CDN una sola vez
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

  // Exportar a Excel usando headers (array) y rows (array de arrays)
  const exportToXlsx = async (headers, rows, filenameBase) => {
    const XLSX = await loadXLSX();
    const aoa = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${filenameBase}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportPromociones = async () => {
    try {
      const res = await fetch('/api/promociones?all=1');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const headers = [
        'id','institucion','tipo_promocion','disciplina','beneficios','comentarios_restricciones','fecha_inicio','fecha_fin','estado','imagen_principal','imagen_secundaria','fecha_creacion'
      ];
      const list = data.data || data.promociones || data.rows || [];
      const rows = list.map(p => [
        sanitize(p.id),
        sanitize(p.institucion),
        sanitize(p.tipo_promocion),
        sanitize(p.disciplina),
        sanitize(p.beneficios),
        sanitize(p.comentarios_restricciones),
        sanitize(p.fecha_inicio),
        sanitize(p.fecha_fin),
        sanitize(p.estado),
        sanitize(p.imagen_principal),
        sanitize(p.imagen_secundaria),
        sanitize(p.fecha_creacion)
      ].join(','));
      // Para Excel: usamos arrays, no CSV
      const xlsxRows = list.map(p => [
        p.id, p.institucion, p.tipo_promocion, p.disciplina, p.beneficios,
        p.comentarios_restricciones, p.fecha_inicio, p.fecha_fin, p.estado,
        p.imagen_principal, p.imagen_secundaria, p.fecha_creacion
      ]);
      await exportToXlsx(headers, xlsxRows, 'promociones');
    } catch (e) {
      alert('No se pudo exportar promociones: ' + e.message);
    }
  };

  const exportControlAcceso = async () => {
    try {
      
      // Intentar primero con all=1 para obtener todos los registros
      let res = await fetch('/api/controlacceso?all=1');
      
      // Si falla, intentar sin parámetros y luego hacer paginación
      if (!res.ok) {
        res = await fetch('/api/controlacceso');
      }
      
      if (!res.ok) throw new Error('HTTP ' + res.status);
      
      let data = await res.json();
      let list = data.data || data.datos || data.rows || [];
      
      // Detectar el límite real del backend basado en la respuesta
      // Si recibimos 101 registros, el límite podría ser 101, no 100
      const reportedLimit = data.limit || 100;
      const actualLimit = list.length >= reportedLimit ? list.length : reportedLimit;
      const totalRecords = data.total || data.count; // Total conocido del backend (puede ser undefined)
      
      // SIEMPRE hacer paginación si recibimos exactamente el límite o más
      // Esto asegura que obtengamos todos los registros incluso si el backend no reporta el total
      if (list.length >= actualLimit) {
        const allRecords = [...list];
        let offset = list.length; // Empezar desde donde terminamos
        let hasMore = true;
        let consecutiveEmpty = 0; // Contador para detectar cuando ya no hay más registros
        
        while (hasMore) {
          const paginatedRes = await fetch(`/api/controlacceso?limit=${actualLimit}&offset=${offset}`);
          if (!paginatedRes.ok) {
            break;
          }
          
          const paginatedData = await paginatedRes.json();
          const paginatedList = paginatedData.data || paginatedData.datos || paginatedData.rows || [];
          
          if (paginatedList.length === 0) {
            consecutiveEmpty++;
            // Si recibimos 2 respuestas vacías consecutivas, asumimos que no hay más registros
            if (consecutiveEmpty >= 2) {
              hasMore = false;
              break;
            }
            // Incrementar offset y continuar
            offset += actualLimit;
            continue;
          }
          
          consecutiveEmpty = 0; // Resetear contador si recibimos datos
          allRecords.push(...paginatedList);
          
          // Si recibimos menos que el límite, significa que ya no hay más registros
          if (paginatedList.length < actualLimit) {
            hasMore = false;
          } else {
            // Continuar con la siguiente página
            offset += actualLimit;
          }
          
          // Protección: evitar bucles infinitos (máximo 50 páginas = ~5000 registros)
          if (allRecords.length >= 5000) {
            hasMore = false;
          }
        }
        
        list = allRecords;
      } else {
      }
      
      const headers = ['id_institucion','institucion','numero_tarjeta','fecha'];
      const xlsxRows = list.map(a => [
        a.id_institucion, a.institucion, a.numero_tarjeta, a.fecha
      ]);
      
      await exportToXlsx(headers, xlsxRows, 'control_acceso');
    } catch (e) {
    }
  };

  const exportUsuarios = async () => {
    try {
      const res = await fetch('/api/usuario');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const headers = [
        'id','nombre','apellido_paterno','apellido_materno','genero','email','telefono','calle_numero','municipio','estado','colonia','codigo_postal','edad','estado_civil','estudios','curp','estado_nacimiento','fecha_nacimiento','numero_tarjeta','acepta_info','registrado_por','fecha_registro'
      ];
      
      // Mapeo de IDs de perfil a nombres legibles
      const perfilMap = {
        'francisco_murga': 'Francisco Murga',
        'alejandro_olachea': 'Alejandro Olachea',
        'raymundo_ibarra': 'Raymundo Ibarra',
        'karla_acevedo': 'Karla Acevedo',
        'pepe': 'Pepe',
        'jose': 'Jose',
        'labnl': 'LABNL',
        'admin': 'Pepe' // Compatibilidad con registros antiguos
      };
      const list = data.data || data.usuarios || data.rows || [];
      
      // Mapeo de valores a etiquetas en mayúsculas para estado civil
      const estadoCivilMap = {
        'soltero': 'SOLTERO (A)',
        'casado': 'CASADO (A)',
        'viudo': 'VIUDO (A)',
        'divorciado': 'DIVORCIADO (A)',
        'union_libre': 'UNIÓN LIBRE',
        'sociedad_convivencia': 'SOCIEDAD DE CONVIVENCIA',
        'prefiero_no_decir': 'PREFIERO NO DECIR'
      };
      
      // Obtener valores de estado civil para selección aleatoria
      const valoresEstadoCivil = opcionesEstadoCivil.map(op => op.value);
      
      const xlsxRows = list.map(u => {
        // Normalizar estado civil: si está vacío, asignar uno aleatorio y convertir a mayúsculas
        let estadoCivil = u.estado_civil;
        if (!estadoCivil || estadoCivil.trim() === '') {
          // Seleccionar un estado civil aleatorio
          const randomIndex = Math.floor(Math.random() * valoresEstadoCivil.length);
          const valorAleatorio = valoresEstadoCivil[randomIndex];
          estadoCivil = estadoCivilMap[valorAleatorio] || valorAleatorio.toUpperCase();
        } else {
          // Convertir el valor existente a mayúsculas usando el mapeo si existe
          const valorLower = String(estadoCivil).toLowerCase().trim();
          estadoCivil = estadoCivilMap[valorLower] || String(estadoCivil).toUpperCase();
        }
        
        // Función auxiliar para convertir a mayúsculas
        const toUpper = (value) => value ? String(value).toUpperCase() : '';
        
        // Convertir todos los campos de texto a mayúsculas
        const nombre = toUpper(u.nombre);
        const apellidoPaterno = toUpper(u.apellido_paterno);
        const apellidoMaterno = toUpper(u.apellido_materno);
        const genero = toUpper(u.genero);
        const email = toUpper(u.email);
        const telefono = toUpper(u.telefono);
        const calleNumero = toUpper(u.calle_numero);
        const municipio = toUpper(u.municipio);
        const estado = toUpper(u.estado);
        const colonia = toUpper(u.colonia);
        const codigoPostal = toUpper(u.codigo_postal);
        const edad = toUpper(u.edad);
        const estudios = toUpper(u.estudios);
        const curp = toUpper(u.curp);
        const estadoNacimiento = toUpper(u.estado_nacimiento);
        const numeroTarjeta = toUpper(u.numero_tarjeta);
        const aceptaInfo = toUpper(u.acepta_info);
        
        // Obtener nombre del perfil que registró
        const registradoPor = u.registrado_por 
          ? (perfilMap[u.registrado_por] || u.registrado_por.toUpperCase())
          : 'SIN PERFIL';
        
        return [
          u.id, nombre, apellidoPaterno, apellidoMaterno, genero, email,
          telefono, calleNumero, municipio, estado, colonia, codigoPostal,
          edad, estadoCivil, estudios, curp, estadoNacimiento, u.fecha_nacimiento,
          numeroTarjeta, aceptaInfo, registradoPor, u.fecha_registro
        ];
      });
      await exportToXlsx(headers, xlsxRows, 'usuarios');
    } catch (e) {
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white"> Panel de Control CulturAll Access</h1>
            <p className="mt-2 text-orange-100">Gestiona promociones</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-orange-100">
              {tabActiva === 'promociones' && `Total: ${totalPromociones} promociones`}
            </span>
            {lastUpdate && (
              <span className="text-xs text-orange-200">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            {loading && (
              <span className="text-xs text-orange-200 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-200 mr-1"></div>
                Cargando...
              </span>
            )}
            <button
              onClick={openPhpMyAdmin}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-medium text-sm whitespace-nowrap"
              title="Abrir phpMyAdmin"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              Base de Datos
            </button>
            <button
              onClick={onRefresh}
              className="bg-white text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button
              onClick={exportPromociones}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Exportar Promociones
            </button>
            <button
              onClick={exportControlAcceso}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Exportar Redención
            </button>
            <button
              onClick={exportUsuarios}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Exportar Usuarios
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        {/* Pestañas de navegación */}
        <div className="mt-6">
          <div className="flex space-x-1 bg-orange-400 rounded-lg p-1">
            <button
              onClick={() => onTabChange('promociones')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'promociones'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
              Promociones
            </button>
            <button
              onClick={() => onTabChange('estadisticas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'estadisticas'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
             Estadísticas
            </button>
            <button
              onClick={() => onTabChange('instituciones')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'instituciones'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
              Instituciones
            </button>
            <button
              onClick={() => onTabChange('configuracion')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'configuracion'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
              Configuración
            </button>
            <button
              onClick={() => navigate('/reportes')}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-black hover:text-white hover:bg-orange-500"
            >
              Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
import React from 'react';

const DashboardHeader = ({ 
  tabActiva, 
  onTabChange, 
  onRefresh, 
  totalPromociones
}) => {
  const PMA_BASE = 'https://culturallaccess.residente.mx/phpmyadmin';

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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPromociones = async () => {
    try {
      const res = await fetch('https://culturallaccess.residente.mx/api/obtener_promociones');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const headers = [
        'id','institucion','tipo_promocion','disciplina','beneficios','comentarios_restricciones','fecha_inicio','fecha_fin','estado','imagen_principal','imagen_secundaria','fecha_creacion'
      ];
      const rows = (data.promociones || []).map(p => [
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
      downloadCsv([headers.join(','), ...rows], `promociones_${new Date().toISOString().slice(0,10)}.csv`);
    } catch (e) {
      alert('No se pudo exportar promociones.');
    }
  };

  const exportControlAcceso = async () => {
    try {
      const res = await fetch('https://culturallaccess.residente.mx/api/control-acceso');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const headers = ['id_institucion','institucion','numero_tarjeta','fecha','estado'];
      const rows = (data.datos || []).map(a => [
        sanitize(a.id_institucion),
        sanitize(a.institucion),
        sanitize(a.numero_tarjeta),
        sanitize(a.fecha),
        sanitize(a.estado)
      ].join(','));
      downloadCsv([headers.join(','), ...rows], `control_acceso_${new Date().toISOString().slice(0,10)}.csv`);
    } catch (e) {
      alert('No se pudo exportar control de acceso.');
    }
  };

  const exportUsuarios = async () => {
    try {
      const res = await fetch('https://culturallaccess.residente.mx/api/usuarios');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const headers = [
        'id','nombre','apellido_paterno','apellido_materno','genero','email','telefono','calle_numero','municipio','estado','colonia','codigo_postal','edad','estado_civil','estudios','curp','estado_nacimiento','fecha_nacimiento','numero_tarjeta','acepta_info','fecha_registro'
      ];
      const rows = (data.usuarios || []).map(u => [
        sanitize(u.id),
        sanitize(u.nombre),
        sanitize(u.apellido_paterno),
        sanitize(u.apellido_materno),
        sanitize(u.genero),
        sanitize(u.email),
        sanitize(u.telefono),
        sanitize(u.calle_numero),
        sanitize(u.municipio),
        sanitize(u.estado),
        sanitize(u.colonia),
        sanitize(u.codigo_postal),
        sanitize(u.edad),
        sanitize(u.estado_civil),
        sanitize(u.estudios),
        sanitize(u.curp),
        sanitize(u.estado_nacimiento),
        sanitize(u.fecha_nacimiento),
        sanitize(u.numero_tarjeta),
        sanitize(u.acepta_info),
        sanitize(u.fecha_registro)
      ].join(','));
      downloadCsv([headers.join(','), ...rows], `usuarios_${new Date().toISOString().slice(0,10)}.csv`);
    } catch (e) {
      alert('No se pudo exportar usuarios.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🎭 Panel de Control Cultural Access</h1>
            <p className="mt-2 text-orange-100">Gestiona promociones</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-orange-100">
              {tabActiva === 'promociones' && `Total: ${totalPromociones} promociones`}
            </span>
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
              Exportar Control Acceso
            </button>
            <button
              onClick={exportUsuarios}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Exportar Usuarios
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
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-orange-100 hover:text-white hover:bg-orange-500'
              }`}
            >
              🎭 Promociones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
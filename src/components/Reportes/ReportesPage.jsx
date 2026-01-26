import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { apiService } from '../../apis';

const ReportesPage = () => {
  useDocumentTitle('Reportes');
  const navigate = useNavigate();
  
  const [tipoReporte, setTipoReporte] = useState('usuarios');
  
  // Estados para Usuarios
  const [fechaInicioUsuarios, setFechaInicioUsuarios] = useState('');
  const [fechaFinUsuarios, setFechaFinUsuarios] = useState('');
  const [perfilSeleccionado, setPerfilSeleccionado] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState(null);
  const [reporteUsuariosGenerado, setReporteUsuariosGenerado] = useState(false);

  // Estados para Redenciones
  const [fechaInicioRedenciones, setFechaInicioRedenciones] = useState('');
  const [fechaFinRedenciones, setFechaFinRedenciones] = useState('');
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState('');
  const [redenciones, setRedenciones] = useState([]);
  const [redencionesFiltradas, setRedencionesFiltradas] = useState([]);
  const [loadingRedenciones, setLoadingRedenciones] = useState(false);
  const [errorRedenciones, setErrorRedenciones] = useState(null);
  const [reporteRedencionesGenerado, setReporteRedencionesGenerado] = useState(false);

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
    const isAuthed = apiService.isAuthenticated();
    if (!isAuthed) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    cargarUsuarios();
    cargarRedenciones();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      setErrorUsuarios(null);
      const response = await apiService.obtenerUsuarios();
      const data = response.data || response.usuarios || response || [];
      setUsuarios(data);
    } catch (err) {
      setErrorUsuarios('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const cargarRedenciones = async () => {
    try {
      setLoadingRedenciones(true);
      setErrorRedenciones(null);
      
      let todasLasRedenciones = [];
      
      // Intentar obtener todos con all=1 primero
      try {
        const resAll = await fetch('/api/controlacceso?all=1');
        if (resAll.ok) {
          const dataAll = await resAll.json();
          const listAll = dataAll.data || dataAll.datos || dataAll.rows || [];
          if (Array.isArray(listAll) && listAll.length > 100) {
            todasLasRedenciones = listAll;
            console.log('Cargados con all=1:', listAll.length);
          }
        }
      } catch (e) {
        console.log('all=1 no funcionó, usando paginación');
      }

      // Si no obtuvimos suficientes, usar paginación agresiva
      if (todasLasRedenciones.length < 100) {
        todasLasRedenciones = [];
        let offset = 0;
        const limit = 500; // Límite más alto
        let hayMas = true;
        let intentos = 0;

        while (hayMas && intentos < 50) {
          intentos++;
          try {
            const res = await fetch(`/api/controlacceso?limit=${limit}&offset=${offset}`);
            if (!res.ok) {
              console.log('Error en paginación:', res.status);
              break;
            }
            
            const data = await res.json();
            const list = data.data || data.datos || data.rows || [];
            
            console.log(`Página ${intentos}: offset=${offset}, recibidos=${Array.isArray(list) ? list.length : 0}`);
            
            if (Array.isArray(list) && list.length > 0) {
              todasLasRedenciones = [...todasLasRedenciones, ...list];
              
              if (list.length < limit) {
                hayMas = false;
              } else {
                offset += list.length;
              }
            } else {
              hayMas = false;
            }
          } catch (e) {
            console.log('Error en paginación:', e);
            hayMas = false;
          }
        }
      }

      // Eliminar duplicados por ID
      const idsVistos = new Set();
      const redencionesUnicas = todasLasRedenciones.filter(r => {
        const id = r.id;
        if (!id) return true;
        if (idsVistos.has(id)) return false;
        idsVistos.add(id);
        return true;
      });

      console.log('TOTAL REDENCIONES CARGADAS:', redencionesUnicas.length);
      setRedenciones(redencionesUnicas);
    } catch (err) {
      console.error('Error al cargar redenciones:', err);
      setErrorRedenciones('Error al cargar redenciones: ' + err.message);
    } finally {
      setLoadingRedenciones(false);
    }
  };

  const generarReporteUsuarios = () => {
    if (!fechaInicioUsuarios || !fechaFinUsuarios) {
      alert('Por favor, selecciona ambas fechas');
      return;
    }

    if (new Date(fechaInicioUsuarios) > new Date(fechaFinUsuarios)) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    const fechaInicioObj = new Date(fechaInicioUsuarios);
    fechaInicioObj.setHours(0, 0, 0, 0);
    
    const fechaFinObj = new Date(fechaFinUsuarios);
    fechaFinObj.setHours(23, 59, 59, 999);

    const filtrados = usuarios.filter(usuario => {
      if (!usuario.fecha_registro) return false;
      const fechaRegistro = new Date(usuario.fecha_registro);
      if (fechaRegistro < fechaInicioObj || fechaRegistro > fechaFinObj) return false;
      if (perfilSeleccionado && usuario.registrado_por !== perfilSeleccionado) return false;
      return true;
    });

    setUsuariosFiltrados(filtrados);
    setReporteUsuariosGenerado(true);
  };

  const generarReporteRedenciones = () => {
    // Permitir generar sin filtros (mostrar todas)
    if (fechaInicioRedenciones && fechaFinRedenciones) {
      if (new Date(fechaInicioRedenciones) > new Date(fechaFinRedenciones)) {
        alert('La fecha de inicio no puede ser posterior a la fecha de fin');
        return;
      }
    }

    const filtradas = redenciones.filter(redencion => {
      // Filtrar por institución si está seleccionada
      if (institucionSeleccionada) {
        const inst = (redencion.institucion || '').toLowerCase().trim();
        if (inst !== institucionSeleccionada.toLowerCase().trim()) {
          return false;
        }
      }

      // Solo filtrar por fecha si AMBAS fechas están seleccionadas
      if (fechaInicioRedenciones && fechaFinRedenciones) {
        const fecha = redencion.fecha || redencion.fecha_redencion || redencion.created_at || redencion.fecha_registro;
        if (!fecha) {
          return false;
        }

        const fechaInicioObj = new Date(fechaInicioRedenciones);
        fechaInicioObj.setHours(0, 0, 0, 0);
        
        const fechaFinObj = new Date(fechaFinRedenciones);
        fechaFinObj.setHours(23, 59, 59, 999);

        const fechaRedencion = new Date(fecha);
        if (isNaN(fechaRedencion.getTime())) {
          return false;
        }
        if (fechaRedencion < fechaInicioObj || fechaRedencion > fechaFinObj) {
          return false;
        }
      }

      return true;
    });

    console.log('Reporte generado:', filtradas.length, 'de', redenciones.length);
    setRedencionesFiltradas(filtradas);
    setReporteRedencionesGenerado(true);
  };

  // Mostrar TODAS las redenciones sin filtro
  const mostrarTodasRedenciones = () => {
    setRedencionesFiltradas(redenciones);
    setReporteRedencionesGenerado(true);
    console.log('Mostrando TODAS las redenciones:', redenciones.length);
  };

  const limpiarFiltrosUsuarios = () => {
    setFechaInicioUsuarios('');
    setFechaFinUsuarios('');
    setPerfilSeleccionado('');
    setUsuariosFiltrados([]);
    setReporteUsuariosGenerado(false);
  };

  const limpiarFiltrosRedenciones = () => {
    setFechaInicioRedenciones('');
    setFechaFinRedenciones('');
    setInstitucionSeleccionada('');
    setRedencionesFiltradas([]);
    setReporteRedencionesGenerado(false);
  };

  const institucionesUnicas = [...new Set(
    redenciones.map(r => r.institucion).filter(Boolean)
  )].sort();

  const exportarUsuarios = async () => {
    if (usuariosFiltrados.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const loadXLSX = () => new Promise((resolve, reject) => {
        if (window.XLSX) return resolve(window.XLSX);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = () => resolve(window.XLSX);
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const XLSX = await loadXLSX();
      const headers = ['ID', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Email', 'Teléfono', 'Registrado Por', 'Fecha Registro'];
      const rows = usuariosFiltrados.map(u => [
        u.id, u.nombre || '', u.apellido_paterno || '', u.apellido_materno || '',
        u.email || '', u.telefono || '',
        perfilMap[u.registrado_por] || u.registrado_por || 'SIN PERFIL',
        u.fecha_registro || ''
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      XLSX.writeFile(wb, `reporte_usuarios_${fechaInicioUsuarios}_${fechaFinUsuarios}.xlsx`);
    } catch (err) {
      alert('Error al exportar: ' + err.message);
    }
  };

  const exportarRedenciones = async () => {
    if (redencionesFiltradas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const loadXLSX = () => new Promise((resolve, reject) => {
        if (window.XLSX) return resolve(window.XLSX);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = () => resolve(window.XLSX);
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const XLSX = await loadXLSX();
      const headers = ['ID', 'Institución', 'Número de Tarjeta', 'Fecha', 'Tipo Promoción', 'Estado'];
      const rows = redencionesFiltradas.map(r => [
        r.id || '', r.institucion || '', r.numero_tarjeta || r.numeroTarjeta || '',
        r.fecha || r.fecha_redencion || '', r.tipo_promocion || r.tipoPromocion || '',
        r.estado || ''
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Redenciones');
      XLSX.writeFile(wb, `reporte_redenciones_${institucionSeleccionada || 'todas'}.xlsx`);
    } catch (err) {
      alert('Error al exportar: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userUsuario');
    localStorage.removeItem('perfilId');
    localStorage.removeItem('perfilNombre');
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      {/* Header naranja */}
      <header style={{ 
        background: 'linear-gradient(to right, #f97316, #ea580c)', 
        padding: '24px 0',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                Reportes CulturAll Access
              </h1>
              <p style={{ color: '#fed7aa', marginTop: '8px', fontSize: '14px' }}>
                Genera y exporta reportes de usuarios y redenciones
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/AdminDashboard')}
                style={{
                  backgroundColor: 'white',
                  color: '#ea580c',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Ir al Dashboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '4px', 
              backgroundColor: '#fb923c', 
              borderRadius: '8px', 
              padding: '4px',
              width: 'fit-content'
            }}>
              <button
                onClick={() => setTipoReporte('usuarios')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px',
                  backgroundColor: tipoReporte === 'usuarios' ? 'white' : 'transparent',
                  color: tipoReporte === 'usuarios' ? '#1f2937' : '#1f2937',
                  boxShadow: tipoReporte === 'usuarios' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Usuarios Registrados
              </button>
              <button
                onClick={() => setTipoReporte('redenciones')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px',
                  backgroundColor: tipoReporte === 'redenciones' ? 'white' : 'transparent',
                  color: tipoReporte === 'redenciones' ? '#1f2937' : '#1f2937',
                  boxShadow: tipoReporte === 'redenciones' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Redenciones
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ flex: 1, padding: '32px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* REPORTE DE USUARIOS */}
          {tipoReporte === 'usuarios' && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {/* Título del reporte */}
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#fafafa'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  Reporte de Usuarios Registrados
                </h2>
              </div>

              {/* Filtros */}
              <div style={{ padding: '24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      value={fechaInicioUsuarios}
                      onChange={(e) => setFechaInicioUsuarios(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      value={fechaFinUsuarios}
                      onChange={(e) => setFechaFinUsuarios(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Usuario/Perfil
                    </label>
                    <select
                      value={perfilSeleccionado}
                      onChange={(e) => setPerfilSeleccionado(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                    >
                      {perfiles.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={generarReporteUsuarios}
                    disabled={loadingUsuarios || !fechaInicioUsuarios || !fechaFinUsuarios}
                    style={{
                      backgroundColor: (!fechaInicioUsuarios || !fechaFinUsuarios) ? '#fdba74' : '#f97316',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: (!fechaInicioUsuarios || !fechaFinUsuarios) ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {loadingUsuarios ? 'Cargando...' : 'Generar Reporte'}
                  </button>
                  <button
                    onClick={limpiarFiltrosUsuarios}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Limpiar Filtros
                  </button>
                  {reporteUsuariosGenerado && usuariosFiltrados.length > 0 && (
                    <button
                      onClick={exportarUsuarios}
                      style={{
                        backgroundColor: '#16a34a',
                        color: 'white',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Exportar a Excel
                    </button>
                  )}
                </div>
              </div>

              {/* Resultados */}
              <div style={{ padding: '24px' }}>
                {errorUsuarios && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    color: '#dc2626', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    marginBottom: '16px' 
                  }}>
                    {errorUsuarios}
                  </div>
                )}

                {reporteUsuariosGenerado && (
                  <div style={{ 
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #bfdbfe', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '20px' 
                  }}>
                    <p style={{ color: '#1e40af', fontWeight: '500', margin: 0, fontSize: '15px' }}>
                      Reporte generado: <strong>{usuariosFiltrados.length}</strong> usuario(s) encontrado(s)
                    </p>
                    <p style={{ color: '#3b82f6', fontSize: '13px', marginTop: '4px' }}>
                      Período: {new Date(fechaInicioUsuarios).toLocaleDateString('es-MX')} - {new Date(fechaFinUsuarios).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                )}

                {reporteUsuariosGenerado && usuariosFiltrados.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f97316' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>ID</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Nombre</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Apellidos</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Email</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Registrado Por</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Fecha Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuariosFiltrados.map((u, idx) => (
                          <tr key={u.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px' }}>{u.id}</td>
                            <td style={{ padding: '12px 16px', fontWeight: '500' }}>{u.nombre || '-'}</td>
                            <td style={{ padding: '12px 16px' }}>{u.apellido_paterno || ''} {u.apellido_materno || ''}</td>
                            <td style={{ padding: '12px 16px' }}>{u.email || '-'}</td>
                            <td style={{ padding: '12px 16px' }}>{perfilMap[u.registrado_por] || u.registrado_por || 'SIN PERFIL'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-MX') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {reporteUsuariosGenerado && usuariosFiltrados.length === 0 && (
                  <div style={{ 
                    backgroundColor: '#fefce8', 
                    border: '1px solid #fef08a', 
                    padding: '24px', 
                    borderRadius: '8px', 
                    textAlign: 'center' 
                  }}>
                    <p style={{ color: '#a16207', fontWeight: '500', margin: 0 }}>
                      No se encontraron usuarios con los criterios seleccionados.
                    </p>
                  </div>
                )}

                {!reporteUsuariosGenerado && (
                  <div style={{ 
                    backgroundColor: '#f3f4f6', 
                    padding: '40px', 
                    borderRadius: '8px', 
                    textAlign: 'center' 
                  }}>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      Selecciona las fechas y haz clic en "Generar Reporte" para ver los resultados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPORTE DE REDENCIONES */}
          {tipoReporte === 'redenciones' && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {/* Título del reporte */}
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#fafafa'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  Reporte de Redenciones
                </h2>
              </div>

              {/* Filtros */}
              <div style={{ padding: '24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Fecha Inicio {!institucionSeleccionada && '*'}
                    </label>
                    <input
                      type="date"
                      value={fechaInicioRedenciones}
                      onChange={(e) => setFechaInicioRedenciones(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Fecha Fin {!institucionSeleccionada && '*'}
                    </label>
                    <input
                      type="date"
                      value={fechaFinRedenciones}
                      onChange={(e) => setFechaFinRedenciones(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Institución
                    </label>
                    <select
                      value={institucionSeleccionada}
                      onChange={(e) => setInstitucionSeleccionada(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Todas las instituciones</option>
                      {institucionesUnicas.map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={generarReporteRedenciones}
                    disabled={loadingRedenciones}
                    style={{
                      backgroundColor: loadingRedenciones ? '#fdba74' : '#f97316',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: loadingRedenciones ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {loadingRedenciones ? 'Cargando...' : 'Generar Reporte'}
                  </button>
                  <button
                    onClick={limpiarFiltrosRedenciones}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Limpiar Filtros
                  </button>
                  <button
                    onClick={mostrarTodasRedenciones}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Mostrar Todas ({redenciones.length})
                  </button>
                  {reporteRedencionesGenerado && redencionesFiltradas.length > 0 && (
                    <button
                      onClick={exportarRedenciones}
                      style={{
                        backgroundColor: '#16a34a',
                        color: 'white',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Exportar a Excel
                    </button>
                  )}
                </div>
              </div>

              {/* Resultados */}
              <div style={{ padding: '24px' }}>
                {errorRedenciones && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    color: '#dc2626', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    marginBottom: '16px' 
                  }}>
                    {errorRedenciones}
                  </div>
                )}

                {reporteRedencionesGenerado && (
                  <div style={{ 
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #bfdbfe', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '20px' 
                  }}>
                    <p style={{ color: '#1e40af', fontWeight: '500', margin: 0, fontSize: '15px' }}>
                      Reporte generado: <strong>{redencionesFiltradas.length}</strong> redención(es) encontrada(s)
                    </p>
                    {institucionSeleccionada && (
                      <p style={{ color: '#3b82f6', fontSize: '13px', marginTop: '4px' }}>
                        Institución: {institucionSeleccionada}
                      </p>
                    )}
                  </div>
                )}

                {reporteRedencionesGenerado && redencionesFiltradas.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f97316' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>ID</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Institución</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>No. Tarjeta</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Fecha</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Tipo Promoción</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontWeight: '500' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {redencionesFiltradas.map((r, idx) => (
                          <tr key={r.id || idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px' }}>{r.id || '-'}</td>
                            <td style={{ padding: '12px 16px', fontWeight: '500' }}>{r.institucion || '-'}</td>
                            <td style={{ padding: '12px 16px' }}>{r.numero_tarjeta || r.numeroTarjeta || '-'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              {(r.fecha || r.fecha_redencion) 
                                ? new Date(r.fecha || r.fecha_redencion).toLocaleDateString('es-MX') 
                                : '-'}
                            </td>
                            <td style={{ padding: '12px 16px' }}>{r.tipo_promocion || r.tipoPromocion || '-'}</td>
                            <td style={{ padding: '12px 16px' }}>{r.estado || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {reporteRedencionesGenerado && redencionesFiltradas.length === 0 && (
                  <div style={{ 
                    backgroundColor: '#fefce8', 
                    border: '1px solid #fef08a', 
                    padding: '24px', 
                    borderRadius: '8px', 
                    textAlign: 'center' 
                  }}>
                    <p style={{ color: '#a16207', fontWeight: '500', margin: 0 }}>
                      No se encontraron redenciones con los criterios seleccionados.
                    </p>
                  </div>
                )}

                {!reporteRedencionesGenerado && (
                  <div style={{ 
                    backgroundColor: '#f3f4f6', 
                    padding: '40px', 
                    borderRadius: '8px', 
                    textAlign: 'center' 
                  }}>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      Selecciona una institución o las fechas y haz clic en "Generar Reporte" para ver los resultados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportesPage;

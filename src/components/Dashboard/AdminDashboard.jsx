import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { useCarrusel } from '../../context/CarruselContext';
import DashboardHeader from './components/Header/DashboardHeader';
import DashboardContent from './components/Content/DashboardContent';
import EditarPromocionModal from './components/Modals/EditarPromocionModal';
import EditarRegistroModal from './components/Modals/EditarRegistroModal';
import EditarControlAccesoModal from './components/Modals/EditarControlAccesoModal';

const AdminDashboard = () => {
  // Estados para promociones
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('');
  
  // Estados para registros
  const [registros, setRegistros] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [searchTermRegistros, setSearchTermRegistros] = useState('');
  const [filterGenero, setFilterGenero] = useState('');
  const [filterEdad, setFilterEdad] = useState('');
  
  // Estados para control de acceso
  const [controlAcceso, setControlAcceso] = useState([]);
  const [loadingControlAcceso, setLoadingControlAcceso] = useState(false);
  const [searchTermControlAcceso, setSearchTermControlAcceso] = useState('');
  const [filterInstitucionControlAcceso, setFilterInstitucionControlAcceso] = useState('');
  
  // Estado para la pestaña activa
  const [tabActiva, setTabActiva] = useState('promociones');
  
  // Estados para modales de edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);
  const [editandoForm, setEditandoForm] = useState({
    institucion: '',
    tipo_promocion: '',
    disciplina: '',
    beneficios: '',
    comentarios_restricciones: '',
    fecha_inicio: '',
    fecha_fin: '',
    imagen_principal: '',
    imagen_secundaria: ''
  });

  // Estados para modal de registros
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);
  const [editandoFormRegistro, setEditandoFormRegistro] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    genero: '',
    edad: '',
    numero_tarjeta: '',
    estado: 'activo'
  });

  // Estados para modal de control de acceso
  const [modalControlAccesoAbierto, setModalControlAccesoAbierto] = useState(false);
  const [controlAccesoEditando, setControlAccesoEditando] = useState(null);
  const [editandoFormControlAcceso, setEditandoFormControlAcceso] = useState({
    institucion: '',
    numero_tarjeta: '',
    fecha: '',
    hora: '',
    estado: 'activo',
    comentarios: ''
  });

  // Usar el contexto para controlar carruseles
  const { carruseles, activarCarrusel, desactivarCarrusel } = useCarrusel();

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerPromociones();
      
      if (response.estado === 'exito') {
        setPromociones(response.promociones);
      } else {
        setError('Error al cargar las promociones');
      }
    } catch (error) {
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarRegistros = async () => {
    try {
      setLoadingRegistros(true);
      const response = await fetch('http://localhost:3001/api/usuarios');
      const data = await response.json();
      
      if (data.success) {
        // Mapear los datos para que coincidan con la estructura esperada
        const registrosMapeados = data.usuarios.map(usuario => ({
          ...usuario,
          estado: usuario.estado_usuario || 'activo', // Mapear estado_usuario a estado
          created_at: usuario.fecha_registro // Mapear fecha_registro a created_at
        }));
        setRegistros(registrosMapeados);
      } else {
        setError('Error al cargar los registros');
      }
    } catch (error) {
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoadingRegistros(false);
    }
  };

  const cargarControlAcceso = async () => {
    try {
      setLoadingControlAcceso(true);
      const response = await apiService.obtenerControlAcceso();
      
      if (response.estado === 'exito') {
        setControlAcceso(response.datos);
      } else {
        setError('Error al cargar el control de acceso');
      }
    } catch (error) {
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoadingControlAcceso(false);
    }
  };

  // Filtrar promociones
  const promocionesFiltradas = promociones.filter(promocion => {
    const matchesSearch = promocion.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promocion.tipo_promocion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promocion.disciplina.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInstitucion = filterInstitucion === '' || 
                              promocion.institucion.toLowerCase().includes(filterInstitucion.toLowerCase());
    
    const matchesDisciplina = filterDisciplina === '' || 
                             promocion.disciplina.toLowerCase().includes(filterDisciplina.toLowerCase());
    
    return matchesSearch && matchesInstitucion && matchesDisciplina;
  });

  // Filtrar registros
  const registrosFiltrados = registros.filter(registro => {
    const matchesSearch = registro.nombre.toLowerCase().includes(searchTermRegistros.toLowerCase()) ||
                         registro.apellido_paterno.toLowerCase().includes(searchTermRegistros.toLowerCase()) ||
                         registro.apellido_materno.toLowerCase().includes(searchTermRegistros.toLowerCase()) ||
                         registro.email.toLowerCase().includes(searchTermRegistros.toLowerCase()) ||
                         registro.numero_tarjeta.includes(searchTermRegistros);
    
    const matchesGenero = filterGenero === '' || registro.genero === filterGenero;
    const matchesEdad = filterEdad === '' || registro.edad === filterEdad;
    
    return matchesSearch && matchesGenero && matchesEdad;
  });

  // Filtrar control de acceso
  const controlAccesoFiltrado = controlAcceso.filter(acceso => {
    const matchesSearch = acceso.institucion.toLowerCase().includes(searchTermControlAcceso.toLowerCase()) ||
                         acceso.numero_tarjeta.includes(searchTermControlAcceso);
    
    const matchesInstitucion = filterInstitucionControlAcceso === '' || 
                              acceso.institucion.toLowerCase().includes(filterInstitucionControlAcceso.toLowerCase());
    
    return matchesSearch && matchesInstitucion;
  });

  const getStatusBadge = (fechaInicio, fechaFin, estado) => {
    // Si es solo un estado (para registros y control de acceso)
    if (fechaInicio === undefined && fechaFin === undefined) {
      switch (estado) {
        case 'activo':
          return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">🟢 Activo</span>;
        case 'inactivo':
          return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">🟡 Inactivo</span>;
        case 'suspendido':
          return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🔴 Suspendido</span>;
        case 'bloqueado':
          return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🚫 Bloqueado</span>;
        default:
          return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">❓ Desconocido</span>;
      }
    }
    
    // Para promociones (con fechas)
    // Si el estado está definido en la base de datos, usarlo
    if (estado && estado !== 'activa') {
      if (estado === 'inactiva') {
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">🟡 Inactiva</span>;
      } else if (estado === 'expirada') {
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🔴 Expirada</span>;
      }
    }
    
    // Si no hay estado definido, calcular por fechas
    const today = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (today < inicio) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">🔵 Próximamente</span>;
    } else if (today >= inicio && today <= fin) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">🟢 Activa</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🔴 Expirada</span>;
    }
  };

  // Función para manejar edición
  const handleEditar = (promocion) => {
    setPromocionEditando(promocion);
    setEditandoForm({
      institucion: promocion.institucion,
      tipo_promocion: promocion.tipo_promocion,
      disciplina: promocion.disciplina,
      beneficios: promocion.beneficios,
      comentarios_restricciones: promocion.comentarios_restricciones,
      fecha_inicio: promocion.fecha_inicio,
      fecha_fin: promocion.fecha_fin,
      imagen_principal: promocion.imagen_principal || '',
      imagen_secundaria: promocion.imagen_secundaria || ''
    });
    setModalAbierto(true);
  };

  // Función para cambiar de pestaña
  const handleTabChange = (tab) => {
    setTabActiva(tab);
    
    // Cargar datos según la pestaña seleccionada
    if (tab === 'registros' && registros.length === 0) {
      cargarRegistros();
    } else if (tab === 'control-acceso' && controlAcceso.length === 0) {
      cargarControlAcceso();
    }
  };

  // Funciones para limpiar filtros
  const handleClearFiltersPromociones = () => {
    setSearchTerm('');
    setFilterInstitucion('');
    setFilterDisciplina('');
  };

  const handleClearFiltersRegistros = () => {
    setSearchTermRegistros('');
    setFilterGenero('');
    setFilterEdad('');
  };

  const handleClearFiltersControlAcceso = () => {
    setSearchTermControlAcceso('');
    setFilterInstitucionControlAcceso('');
  };

  // Función para manejar cambio de estado
  const handleCambiarEstado = async (promocion) => {
    try {
      const nuevoEstado = promocion.estado === 'activa' ? 'inactiva' : 'activa';
      
      const response = await apiService.cambiarEstadoPromocion(promocion.id, nuevoEstado);
      
      if (response.estado === 'exito') {
        // Actualizar la lista local
        setPromociones(prev => prev.map(p => 
          p.id === promocion.id ? { ...p, estado: nuevoEstado } : p
        ));
        
        // Mostrar mensaje de confirmación
        
        // Método 1: BroadcastChannel (más confiable)
        try {
          const broadcastChannel = new BroadcastChannel('promocion-updates');
          broadcastChannel.postMessage({
            type: 'promocionEstadoCambiado',
            promocionId: promocion.id,
            nuevoEstado: nuevoEstado
          });
          broadcastChannel.close();
          console.log('✅ Mensaje enviado por BroadcastChannel');
        } catch (error) {
          console.warn('⚠️ BroadcastChannel no disponible, usando métodos alternativos');
        }
        
        // Método 2: localStorage como respaldo
        localStorage.setItem('promocionEstadoCambiado', Date.now().toString());
        
        // Método 3: Evento personalizado como respaldo
        window.dispatchEvent(new CustomEvent('promocionEstadoCambiado', {
          detail: { promocionId: promocion.id, nuevoEstado }
        }));
        
        console.log('✅ Todos los métodos de comunicación ejecutados');
       
      }
    } catch (error) {
      setError('Error al cambiar el estado de la promoción.');
    }
  };

  // Función para manejar eliminación
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      try {
        const response = await apiService.eliminarPromocion(id);
        
        if (response.estado === 'exito') {
          // Actualizar la lista local
          setPromociones(prev => prev.filter(p => p.id !== id));
        }
          } catch (error) {
      // Error silencioso al eliminar promoción
    }
    }
  };

  // Función para guardar cambios del modal
  const handleGuardarCambios = async () => {
    try {
      console.log('Datos a enviar:', editandoForm);
      console.log('ID de promoción:', promocionEditando.id);
      
      const response = await apiService.actualizarPromocion(promocionEditando.id, editandoForm);
      
      console.log('Respuesta del servidor:', response);
      
      if (response.estado === 'exito') {
        // Actualizar la lista local
        setPromociones(prev => prev.map(p => 
          p.id === promocionEditando.id ? { ...p, ...editandoForm } : p
        ));
        setModalAbierto(false);
        setPromocionEditando(null);
        alert('Promoción actualizada exitosamente');
      } else {
        alert('Error al actualizar la promoción: ' + (response.mensaje || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      alert('Error al actualizar la promoción: ' + error.message);
    }
  };

  // Funciones para manejar CRUD de Registros
  const handleEditarRegistro = (registro) => {
    setRegistroEditando(registro);
    setEditandoFormRegistro({
      nombre: registro.nombre || '',
      apellido_paterno: registro.apellido_paterno || '',
      apellido_materno: registro.apellido_materno || '',
      email: registro.email || '',
      telefono: registro.telefono || '',
      genero: registro.genero || '',
      edad: registro.edad || '',
      numero_tarjeta: registro.numero_tarjeta || '',
      estado: registro.estado || 'activo'
    });
    setModalRegistroAbierto(true);
  };

  const handleCambiarEstadoRegistro = async (registro) => {
    try {
      const nuevoEstado = registro.estado === 'activo' ? 'inactivo' : 'activo';
      
      // Aquí harías la llamada a la API para cambiar el estado
      // const response = await apiService.cambiarEstadoRegistro(registro.id, nuevoEstado);
      
      // Por ahora, actualizamos solo localmente
      setRegistros(prev => prev.map(r => 
        r.id === registro.id ? { ...r, estado: nuevoEstado } : r
      ));
      
      alert(`Registro ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar el estado del registro: ' + error.message);
    }
  };

  const handleEliminarRegistro = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        // Aquí harías la llamada a la API para eliminar
        // const response = await apiService.eliminarRegistro(id);
        
        // Por ahora, eliminamos solo localmente
        setRegistros(prev => prev.filter(r => r.id !== id));
        alert('Registro eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar el registro: ' + error.message);
      }
    }
  };

  const handleGuardarCambiosRegistro = async () => {
    try {
      // Aquí harías la llamada a la API para actualizar
      // const response = await apiService.actualizarRegistro(registroEditando.id, editandoFormRegistro);
      
      // Por ahora, actualizamos solo localmente
      setRegistros(prev => prev.map(r => 
        r.id === registroEditando.id ? { ...r, ...editandoFormRegistro } : r
      ));
      
      setModalRegistroAbierto(false);
      setRegistroEditando(null);
      alert('Registro actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar el registro: ' + error.message);
    }
  };

  // Funciones para manejar CRUD de Control de Acceso
  const handleEditarControlAcceso = (acceso) => {
    setControlAccesoEditando(acceso);
    setEditandoFormControlAcceso({
      institucion: acceso.institucion || '',
      numero_tarjeta: acceso.numero_tarjeta || '',
      fecha: acceso.fecha || '',
      hora: acceso.hora || '',
      estado: acceso.estado || 'activo',
      comentarios: acceso.comentarios || ''
    });
    setModalControlAccesoAbierto(true);
  };

  const handleCambiarEstadoControlAcceso = async (acceso) => {
    try {
      const nuevoEstado = acceso.estado === 'activo' ? 'inactivo' : 'activo';
      
      // Aquí harías la llamada a la API para cambiar el estado
      // const response = await apiService.cambiarEstadoControlAcceso(acceso.id, nuevoEstado);
      
      // Por ahora, actualizamos solo localmente
      setControlAcceso(prev => prev.map(a => 
        a.id === acceso.id ? { ...a, estado: nuevoEstado } : a
      ));
      
      alert(`Control de acceso ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar el estado del control de acceso: ' + error.message);
    }
  };

  const handleEliminarControlAcceso = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de control de acceso?')) {
      try {
        // Aquí harías la llamada a la API para eliminar
        // const response = await apiService.eliminarControlAcceso(id);
        
        // Por ahora, eliminamos solo localmente
        setControlAcceso(prev => prev.filter(a => a.id !== id));
        alert('Registro de control de acceso eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar el registro de control de acceso: ' + error.message);
      }
    }
  };

  const handleGuardarCambiosControlAcceso = async () => {
    try {
      // Aquí harías la llamada a la API para actualizar
      // const response = await apiService.actualizarControlAcceso(controlAccesoEditando.id, editandoFormControlAcceso);
      
      // Por ahora, actualizamos solo localmente
      setControlAcceso(prev => prev.map(a => 
        a.id === controlAccesoEditando.id ? { ...a, ...editandoFormControlAcceso } : a
      ));
      
      setModalControlAccesoAbierto(false);
      setControlAccesoEditando(null);
      alert('Control de acceso actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar el control de acceso: ' + error.message);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando promociones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-800">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4 text-red-600">{error}</p>
          <button 
            onClick={cargarPromociones}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        tabActiva={tabActiva}
        onTabChange={handleTabChange}
        onRefresh={() => {
          if (tabActiva === 'promociones') cargarPromociones();
          else if (tabActiva === 'registros') cargarRegistros();
          else if (tabActiva === 'control-acceso') cargarControlAcceso();
        }}
        totalPromociones={promociones.length}
        totalRegistros={registros.length}
        totalControlAcceso={controlAcceso.length}
      />

      <DashboardContent
        tabActiva={tabActiva}
        // Estados de promociones
        promocionesFiltradas={promocionesFiltradas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterInstitucion={filterInstitucion}
        setFilterInstitucion={setFilterInstitucion}
        filterDisciplina={filterDisciplina}
        setFilterDisciplina={setFilterDisciplina}
        onEditar={handleEditar}
        onCambiarEstado={handleCambiarEstado}
        onEliminar={handleEliminar}
        getStatusBadge={getStatusBadge}
        onClearFiltersPromociones={handleClearFiltersPromociones}
        // Estados de registros
        registrosFiltrados={registrosFiltrados}
        searchTermRegistros={searchTermRegistros}
        setSearchTermRegistros={setSearchTermRegistros}
        filterGenero={filterGenero}
        setFilterGenero={setFilterGenero}
        filterEdad={filterEdad}
        setFilterEdad={setFilterEdad}
        onClearFiltersRegistros={handleClearFiltersRegistros}
        onEditarRegistro={handleEditarRegistro}
        onCambiarEstadoRegistro={handleCambiarEstadoRegistro}
        onEliminarRegistro={handleEliminarRegistro}
        // Estados de control de acceso
        controlAccesoFiltrado={controlAccesoFiltrado}
        searchTermControlAcceso={searchTermControlAcceso}
        setSearchTermControlAcceso={setSearchTermControlAcceso}
        filterInstitucionControlAcceso={filterInstitucionControlAcceso}
        setFilterInstitucionControlAcceso={setFilterInstitucionControlAcceso}
        onClearFiltersControlAcceso={handleClearFiltersControlAcceso}
        onEditarControlAcceso={handleEditarControlAcceso}
        onCambiarEstadoControlAcceso={handleCambiarEstadoControlAcceso}
        onEliminarControlAcceso={handleEliminarControlAcceso}
      />

      <EditarPromocionModal
        modalAbierto={modalAbierto}
        setModalAbierto={setModalAbierto}
        editandoForm={editandoForm}
        setEditandoForm={setEditandoForm}
        onGuardarCambios={handleGuardarCambios}
      />

      <EditarRegistroModal
        modalAbierto={modalRegistroAbierto}
        setModalAbierto={setModalRegistroAbierto}
        editandoForm={editandoFormRegistro}
        setEditandoForm={setEditandoFormRegistro}
        onGuardarCambios={handleGuardarCambiosRegistro}
      />

      <EditarControlAccesoModal
        modalAbierto={modalControlAccesoAbierto}
        setModalAbierto={setModalControlAccesoAbierto}
        editandoForm={editandoFormControlAcceso}
        setEditandoForm={setEditandoFormControlAcceso}
        onGuardarCambios={handleGuardarCambiosControlAcceso}
      />
    </div>
  );
};

export default AdminDashboard;
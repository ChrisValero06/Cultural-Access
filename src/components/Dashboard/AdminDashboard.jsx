import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { useCarrusel } from '../../context/CarruselContext';
import DashboardHeader from './components/Header/DashboardHeader';
import DashboardContent from './components/Content/DashboardContent';
import EditarPromocionModal from './components/Modals/EditarPromocionModal';

const AdminDashboard = () => {
  // Estados para promociones
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  
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

  // Usar el contexto para controlar carruseles
  const { carruseles, activarCarrusel, desactivarCarrusel } = useCarrusel();

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Intentando cargar promociones (admin, all=1)...');
      const response = await apiService.obtenerPromocionesAdmin();
      console.log('📡 Respuesta recibida:', response);
      
      if (response && response.estado === 'exito') {
        setPromociones(response.promociones || []);
        setLastUpdate(new Date());
        console.log('✅ Promociones cargadas exitosamente:', response.promociones?.length || 0);
      } else if (response && response.success === true && response.data) {
        // Si la respuesta tiene success: true y data, usar esa estructura
        setPromociones(response.data || []);
        setLastUpdate(new Date());
        console.log('✅ Promociones cargadas (formato success):', response.data?.length || 0);
      } else if (response && response.promociones) {
        // Si no hay estado pero sí hay promociones, asumir éxito
        setPromociones(response.promociones);
        setLastUpdate(new Date());
        console.log('✅ Promociones cargadas (sin estado):', response.promociones.length);
      } else {
        console.error('❌ Error en respuesta:', response);
        setError('Error al cargar las promociones: ' + (response?.mensaje || 'Respuesta inválida'));
      }
    } catch (error) {
      console.error('💥 Error al cargar promociones:', error);
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (fechaInicio, fechaFin, estado) => {
    // Solo para promociones (con fechas)
    
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

  // Función para cambiar de pestaña (solo promociones)
  const handleTabChange = (tab) => {
    setTabActiva('promociones');
  };

  // Funciones para limpiar filtros
  const handleClearFiltersPromociones = () => {
    setSearchTerm('');
    setFilterInstitucion('');
    setFilterDisciplina('');
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
        
        // Comunicación entre ventanas (opcional)
        try {
          const broadcastChannel = new BroadcastChannel('promocion-updates');
          broadcastChannel.postMessage({
            type: 'promocionEstadoCambiado',
            promocionId: promocion.id,
            nuevoEstado: nuevoEstado
          });
          broadcastChannel.close();
        } catch (error) {}
        localStorage.setItem('promocionEstadoCambiado', Date.now().toString());
        window.dispatchEvent(new CustomEvent('promocionEstadoCambiado', {
          detail: { promocionId: promocion.id, nuevoEstado }
        }));
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
      const response = await apiService.actualizarPromocion(promocionEditando.id, editandoForm);
      if (response.estado === 'exito') {
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
      alert('Error al actualizar la promoción: ' + error.message);
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
        <div className="text-center text-gray-800 max-w-2xl mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error al Cargar el Dashboard</h2>
          <p className="mb-4 text-red-600">{error}</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">Posibles soluciones:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Verifica tu conexión a internet</li>
              <li>• El servidor puede estar temporalmente fuera de servicio</li>
              <li>• Revisa la consola del navegador (F12) para más detalles</li>
              <li>• Intenta recargar la página</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={cargarPromociones}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              🔄 Reintentar
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              🔄 Recargar Página
            </button>
          </div>
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
        }}
        totalPromociones={promociones.length}
        lastUpdate={lastUpdate}
        loading={loading}
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
      />

      <EditarPromocionModal
        modalAbierto={modalAbierto}
        setModalAbierto={setModalAbierto}
        editandoForm={editandoForm}
        setEditandoForm={setEditandoForm}
        onGuardarCambios={handleGuardarCambios}
      />
    </div>
  );
};

export default AdminDashboard;
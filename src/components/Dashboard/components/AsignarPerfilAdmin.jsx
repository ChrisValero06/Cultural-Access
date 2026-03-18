import React, { useState, useEffect } from 'react';

const PERFILES = [
  { value: 'francisco_murga', label: 'Francisco Murga' },
  { value: 'alejandro_olachea', label: 'Alejandro Olachea' },
  { value: 'raymundo_ibarra', label: 'Raymundo Ibarra' },
  { value: 'karla_acevedo', label: 'Karla Acevedo' },
  { value: 'jose', label: 'Jose' },
  { value: 'labnl', label: 'LABNL' },
  { value: 'francisco', label: 'Francisco' },
  { value: 'planeacion', label: 'Planeación' },
];

const AsignarPerfilAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfilesSeleccionados, setPerfilesSeleccionados] = useState({});
  const [guardando, setGuardando] = useState({});

  useEffect(() => {
    cargarUsuariosSinPerfil();
  }, []);

  const cargarUsuariosSinPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      let todos = [];

      try {
        const res = await fetch('/api/usuario?all=1');
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data.usuarios || data.rows || [];
          if (Array.isArray(list) && list.length > 100) {
            todos = list;
          }
        }
      } catch (e) {}

      if (todos.length < 100) {
        todos = [];
        let offset = 0;
        const limit = 500;
        let hayMas = true;
        let intentos = 0;

        while (hayMas && intentos < 50) {
          intentos++;
          try {
            const res = await fetch(`/api/usuario?limit=${limit}&offset=${offset}`);
            if (!res.ok) break;
            const data = await res.json();
            const page = data.data || data.usuarios || data.rows || [];
            if (Array.isArray(page) && page.length > 0) {
              todos = [...todos, ...page];
              if (page.length < limit) hayMas = false;
              else offset += page.length;
            } else {
              hayMas = false;
            }
          } catch (e) { hayMas = false; }
        }
      }

      // Eliminar duplicados
      const idsVistos = new Set();
      todos = todos.filter(u => {
        if (!u.id) return true;
        if (idsVistos.has(u.id)) return false;
        idsVistos.add(u.id);
        return true;
      });

      const sinPerfil = todos.filter(u => !u.registrado_por);
      setUsuarios(sinPerfil);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePerfilChange = (userId, perfil) => {
    setPerfilesSeleccionados(prev => ({ ...prev, [userId]: perfil }));
  };

  const handleGuardar = async (usuario) => {
    const perfil = perfilesSeleccionados[usuario.id];
    if (!perfil) {
      alert('Selecciona un perfil primero');
      return;
    }

    setGuardando(prev => ({ ...prev, [usuario.id]: true }));
    try {
      const res = await fetch(`/api/usuario/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrado_por: perfil }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      // Quitar el usuario de la lista local
      setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardando(prev => ({ ...prev, [usuario.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button onClick={cargarUsuariosSinPerfil} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Usuarios Sin Perfil</h2>
          <p className="text-gray-500 mt-1">{usuarios.length} usuarios sin perfil asignado</p>
        </div>
        <button
          onClick={cargarUsuariosSinPerfil}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {usuarios.length === 0 ? (
        <div className="bg-green-50 border border-green-300 text-green-700 px-6 py-8 rounded-lg text-center">
          <p className="text-lg font-semibold">Todos los usuarios tienen perfil asignado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Tarjeta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignar Perfil</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map(usuario => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {[usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    {usuario.numero_tarjeta || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {usuario.fecha_registro ? usuario.fecha_registro.toString().slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={perfilesSeleccionados[usuario.id] || ''}
                      onChange={e => handlePerfilChange(usuario.id, e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {PERFILES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleGuardar(usuario)}
                      disabled={!perfilesSeleccionados[usuario.id] || guardando[usuario.id]}
                      className="bg-orange-600 text-white px-4 py-1 rounded text-sm hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {guardando[usuario.id] ? 'Guardando...' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AsignarPerfilAdmin;

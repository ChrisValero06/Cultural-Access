import React, { useState, useEffect } from 'react';

const EstadisticasPerfiles = () => {
  const [estadisticas, setEstadisticas] = useState({
    francisco_murga: 0,
    alejandro_olachea: 0,
    raymundo_ibarra: 0,
    karla_acevedo: 0,
    pepe: 0,
    jose: 0,
    labnl: 0,
    sinPerfil: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://culturallaccess.com/api/usuario', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      const usuarios = data.data || data || [];

      // Contar usuarios por perfil
      const stats = {
        francisco_murga: usuarios.filter(u => u.registrado_por === 'francisco_murga').length,
        alejandro_olachea: usuarios.filter(u => u.registrado_por === 'alejandro_olachea').length,
        raymundo_ibarra: usuarios.filter(u => u.registrado_por === 'raymundo_ibarra').length,
        karla_acevedo: usuarios.filter(u => u.registrado_por === 'karla_acevedo').length,
        pepe: usuarios.filter(u => u.registrado_por === 'pepe' || u.registrado_por === 'admin').length, // Incluir 'admin' para compatibilidad
        jose: usuarios.filter(u => u.registrado_por === 'jose').length,
        labnl: usuarios.filter(u => u.registrado_por === 'labnl').length,
        sinPerfil: usuarios.filter(u => !u.registrado_por || u.registrado_por === null).length,
        total: usuarios.length
      };

      setEstadisticas(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const perfilActual = localStorage.getItem('perfilId');
  const perfilNombre = localStorage.getItem('perfilNombre') || 'Usuario';

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
        <p>Error: {error}</p>
        <button 
          onClick={cargarEstadisticas}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Estadísticas de Registros
        </h2>
        <p className="text-gray-600">
          Perfil actual: <span className="font-semibold">{perfilNombre}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Tarjeta Francisco Murga */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Francisco Murga</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{estadisticas.francisco_murga}</div>
          <p className="text-blue-100 text-sm">usuarios registrados</p>
        </div>

        {/* Tarjeta Alejandro Olachea */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Alejandro Olachea</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{estadisticas.alejandro_olachea}</div>
          <p className="text-purple-100 text-sm">usuarios registrados</p>
        </div>

        {/* Tarjeta Raymundo Ibarra */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Raymundo Ibarra</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{estadisticas.raymundo_ibarra}</div>
          <p className="text-green-100 text-sm">usuarios registrados</p>
        </div>

        {/* Tarjeta Karla Acevedo */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Karla Acevedo</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{estadisticas.karla_acevedo}</div>
          <p className="text-pink-100 text-sm">usuarios registrados</p>
        </div>

        {/* Tarjeta Pepe */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Pepe</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{estadisticas.pepe}</div>
          <p className="text-indigo-100 text-sm">usuarios registrados</p>
        </div>

        {/* Tarjeta Jose */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Jose</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{estadisticas.jose}</div>
          <p className="text-amber-100 text-sm">usuarios registrados</p>
        </div>

        {/* Tarjeta LABNL */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">LABNL</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{estadisticas.labnl}</div>
          <p className="text-teal-100 text-sm">usuarios registrados</p>
        </div>
      </div>

      {/* Tarjeta Total */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Total General</h3>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-5xl font-bold mb-2">{estadisticas.total}</div>
          <p className="text-orange-100 text-lg">usuarios totales registrados</p>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Desglose Detallado</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Francisco Murga</span>
            <span className="font-bold text-blue-600">{estadisticas.francisco_murga} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Alejandro Olachea</span>
            <span className="font-bold text-purple-600">{estadisticas.alejandro_olachea} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Raymundo Ibarra</span>
            <span className="font-bold text-green-600">{estadisticas.raymundo_ibarra} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Karla Acevedo</span>
            <span className="font-bold text-pink-600">{estadisticas.karla_acevedo} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Pepe</span>
            <span className="font-bold text-indigo-600">{estadisticas.pepe} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Jose</span>
            <span className="font-bold text-amber-600">{estadisticas.jose} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">LABNL</span>
            <span className="font-bold text-teal-600">{estadisticas.labnl} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Sin perfil asignado</span>
            <span className="font-bold text-gray-600">{estadisticas.sinPerfil} usuarios</span>
          </div>
          <div className="flex justify-between items-center py-2 pt-2 border-t-2 border-gray-300">
            <span className="text-gray-800 font-semibold text-lg">Total General</span>
            <span className="font-bold text-orange-600 text-xl">{estadisticas.total} usuarios</span>
          </div>
        </div>
      </div>

      {/* Botón para actualizar */}
      <div className="mt-6">
        <button
          onClick={cargarEstadisticas}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition duration-200"
        >
          Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
};

export default EstadisticasPerfiles;


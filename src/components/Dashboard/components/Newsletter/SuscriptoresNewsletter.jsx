import React, { useEffect, useState } from 'react';
import { newsletterService } from '../../../../apis';

const SuscriptoresNewsletter = () => {
  const [suscriptores, setSuscriptores] = useState([]);
  const [totalMailchimp, setTotalMailchimp] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await newsletterService.obtenerSuscriptores();
      setSuscriptores(data.suscriptores || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
    newsletterService.obtenerConteoAudiencia()
      .then((data) => setTotalMailchimp(data.total))
      .catch(() => setTotalMailchimp(null));
  };

  useEffect(() => {
    cargar();
  }, []);

  const darDeBaja = async (s) => {
    if (!window.confirm(`¿Dar de baja a ${s.correo_electronico}? También se dará de baja en Mailchimp.`)) return;
    try {
      await newsletterService.eliminarSuscriptor(s.id);
      setSuscriptores((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      alert('Error al dar de baja: ' + err.message);
    }
  };

  const filtrados = suscriptores.filter((s) =>
    s.correo_electronico.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Suscriptores</h2>
          <p className="text-sm text-gray-500">
            {suscriptores.length} registrados desde el sitio
            {totalMailchimp !== null && ` · ${totalMailchimp} contactos en la audiencia de Mailchimp`}
          </p>
        </div>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar correo..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
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

      {!cargando && !error && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de registro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No hay suscriptores.</td>
                </tr>
              )}
              {filtrados.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-sm text-gray-800">{s.correo_electronico}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.created_at).toLocaleString('es-MX')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => darDeBaja(s)} className="text-sm text-red-600 hover:underline">
                      Dar de baja
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

export default SuscriptoresNewsletter;

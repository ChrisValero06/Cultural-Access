import React, { useState } from 'react';

const API_BASE = import.meta.env.DEV ? '/api' : 'https://culturallaccess.com/api';

const TarjetasAdmin = () => {
  const [busqueda, setBusqueda] = useState('');
  const [tarjetaInfo, setTarjetaInfo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tarjetasBaja, setTarjetasBaja] = useState([]);
  const [cargandoBaja, setCargandoBaja] = useState(false);
  const [tabActiva, setTabActiva] = useState('buscar');

  const buscarTarjeta = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    setTarjetaInfo(null);
    setMensaje('');
    const numeroOriginal = busqueda.trim();
    const numeroNormalizado = numeroOriginal.replace(/^0+/, '') || numeroOriginal;
    try {
      // Buscar redenciones — intentar con número original y normalizado
      let redenciones = [];
      for (const num of [...new Set([numeroOriginal, numeroNormalizado])]) {
        const res = await fetch(`${API_BASE}/controlacceso/tarjeta/${encodeURIComponent(num)}?limit=100`);
        const data = await res.json();
        console.log(`[TarjetasAdmin] tarjeta=${num} status=${res.status} response=`, data);
        const found = Array.isArray(data) ? data : (data.data || data.datos || data.rows || []);
        if (found.length > 0) { redenciones = found; break; }
      }

      // Buscar usuario por tarjeta (verificar-tarjeta endpoint)
      let usuario = null;
      try {
        const resU = await fetch(`${API_BASE}/usuario/verificar-tarjeta`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numero_tarjeta: busqueda.trim() })
        });
        if (resU.ok) {
          const dataU = await resU.json();
          usuario = dataU.usuario || dataU.data || dataU || null;
          if (usuario && !usuario.nombre) usuario = null;
        }
      } catch (_) {}

      setTarjetaInfo({ redenciones, usuario, numero: busqueda.trim() });

      // Verificar si ya está dada de baja
      const resBaja = await fetch(`${API_BASE}/tarjetas-baja/${encodeURIComponent(numeroNormalizado)}`).catch(() => null);
      if (resBaja && resBaja.ok) {
        const dataBaja = await resBaja.json();
        if (dataBaja.activo === false || dataBaja.baja === true) {
          setMensaje('⚠️ Esta tarjeta ya está dada de baja.');
        }
      }
    } catch (err) {
      setMensaje('Error al buscar la tarjeta: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const darDeBaja = async () => {
    if (!tarjetaInfo) return;
    if (!window.confirm(`¿Confirmas dar de baja la tarjeta ${tarjetaInfo.numero}? No podrá usarse en redenciones.`)) return;
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/tarjetas-baja`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_tarjeta: tarjetaInfo.numero, motivo: 'Baja por administrador' })
      });
      if (res.ok) {
        setMensaje('✅ Tarjeta dada de baja correctamente.');
      } else {
        const err = await res.json().catch(() => ({}));
        setMensaje('❌ Error: ' + (err.message || res.status));
      }
    } catch (err) {
      setMensaje('❌ Error al dar de baja: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarTarjetasBaja = async () => {
    setCargandoBaja(true);
    try {
      const res = await fetch(`${API_BASE}/tarjetas-baja`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : (data.data || data.tarjetas || []);
      setTarjetasBaja(lista);
    } catch (err) {
      setMensaje('Error al cargar lista: ' + err.message);
    } finally {
      setCargandoBaja(false);
    }
  };

  const reactivar = async (numero) => {
    if (!window.confirm(`¿Reactivar la tarjeta ${numero}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/tarjetas-baja/${encodeURIComponent(numero)}`, { method: 'DELETE' });
      if (res.ok) {
        setTarjetasBaja(prev => prev.filter(t => t.numero_tarjeta !== numero));
        setMensaje('✅ Tarjeta reactivada.');
      } else {
        setMensaje('❌ No se pudo reactivar.');
      }
    } catch (err) {
      setMensaje('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Gestión de Tarjetas</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Busca, consulta y da de baja números de tarjeta</p>
      </div>

      {/* Tabs internas */}
      <div style={{ display: 'flex', gap: '4px', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        {[['buscar', 'Buscar Tarjeta'], ['lista', 'Tarjetas Dadas de Baja']].map(([key, label]) => (
          <button key={key} onClick={() => { setTabActiva(key); if (key === 'lista') cargarTarjetasBaja(); }}
            style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
              backgroundColor: tabActiva === key ? '#f97316' : 'white', color: tabActiva === key ? 'white' : '#374151',
              boxShadow: tabActiva === key ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>
        {mensaje && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px',
            backgroundColor: mensaje.startsWith('✅') ? '#f0fdf4' : mensaje.startsWith('⚠️') ? '#fefce8' : '#fef2f2',
            border: `1px solid ${mensaje.startsWith('✅') ? '#bbf7d0' : mensaje.startsWith('⚠️') ? '#fef08a' : '#fecaca'}`,
            color: mensaje.startsWith('✅') ? '#166534' : mensaje.startsWith('⚠️') ? '#a16207' : '#dc2626' }}>
            {mensaje}
          </div>
        )}

        {/* TAB: BUSCAR */}
        {tabActiva === 'buscar' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscarTarjeta()}
                placeholder="Número de tarjeta..."
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              <button onClick={buscarTarjeta} disabled={cargando}
                style={{ padding: '10px 24px', backgroundColor: '#f97316', color: 'white', border: 'none',
                  borderRadius: '8px', fontWeight: '500', cursor: cargando ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                {cargando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {tarjetaInfo && (
              <div>
                {/* Info del usuario */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px', fontSize: '15px' }}>
                    Tarjeta: {tarjetaInfo.numero}
                  </h3>
                  {tarjetaInfo.usuario ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#1e3a8a' }}>
                      <span><strong>Nombre:</strong> {tarjetaInfo.usuario.nombre} {tarjetaInfo.usuario.apellido_paterno} {tarjetaInfo.usuario.apellido_materno}</span>
                      <span><strong>Email:</strong> {tarjetaInfo.usuario.email || '-'}</span>
                      <span><strong>Teléfono:</strong> {tarjetaInfo.usuario.telefono || '-'}</span>
                      <span><strong>Registrado por:</strong> {tarjetaInfo.usuario.registrado_por || '-'}</span>
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No se encontró usuario asociado a esta tarjeta.</p>
                  )}
                </div>

                {/* Historial de redenciones */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '12px', fontSize: '15px' }}>
                    Historial de Redenciones ({tarjetaInfo.redenciones.length})
                  </h3>
                  {tarjetaInfo.redenciones.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f97316' }}>
                            {['Institución', 'Tipo Promoción', 'Fecha', 'Estado'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'white', fontWeight: '500' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tarjetaInfo.redenciones.map((r, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '10px 14px' }}>{r.institucion || '-'}</td>
                              <td style={{ padding: '10px 14px' }}>{r.tipo_promocion || '-'}</td>
                              <td style={{ padding: '10px 14px' }}>{r.fecha || r.fecha_redencion || '-'}</td>
                              <td style={{ padding: '10px 14px' }}>{r.estado || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>Esta tarjeta no tiene redenciones registradas.</p>
                  )}
                </div>

                {/* Botón dar de baja */}
                <button onClick={darDeBaja} disabled={cargando}
                  style={{ padding: '10px 24px', backgroundColor: '#dc2626', color: 'white', border: 'none',
                    borderRadius: '8px', fontWeight: '500', cursor: cargando ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                  Dar de Baja esta Tarjeta
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: LISTA DE BAJAS */}
        {tabActiva === 'lista' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: '600', color: '#374151', fontSize: '15px', margin: 0 }}>
                Tarjetas Dadas de Baja ({tarjetasBaja.length})
              </h3>
              <button onClick={cargarTarjetasBaja} disabled={cargandoBaja}
                style={{ padding: '8px 16px', backgroundColor: '#f97316', color: 'white', border: 'none',
                  borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '13px' }}>
                {cargandoBaja ? 'Cargando...' : 'Recargar'}
              </button>
            </div>
            {tarjetasBaja.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f97316' }}>
                    {['Número de Tarjeta', 'Motivo', 'Fecha Baja', 'Acción'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'white', fontWeight: '500' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tarjetasBaja.map((t, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '500' }}>{t.numero_tarjeta}</td>
                      <td style={{ padding: '10px 14px' }}>{t.motivo || '-'}</td>
                      <td style={{ padding: '10px 14px' }}>{t.fecha_baja ? t.fecha_baja.split('T')[0] : '-'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => reactivar(t.numero_tarjeta)}
                          style={{ padding: '6px 14px', backgroundColor: '#16a34a', color: 'white', border: 'none',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                          Reactivar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ backgroundColor: '#f3f4f6', padding: '32px', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280' }}>No hay tarjetas dadas de baja.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetasAdmin;

import React, { useEffect, useRef, useState } from 'react';
import { apiService, newsletterService } from '../../../../apis';

const FORM_INICIAL = {
  nombre: '',
  asunto: '',
  from_name: 'CulturAll Access',
  titulo: '',
  intro_texto: '',
  footer_texto: 'Secretaría de Cultura de Nuevo León',
  color_primario: '#F97316',
  bloques: [],
};

const TIPOS_BLOQUE = {
  portada: { label: 'Imagen de portada', nuevo: () => ({ tipo: 'portada', url: '', link: '' }) },
  promociones: { label: 'Promociones', nuevo: () => ({ tipo: 'promociones', titulo: 'Promociones del mes', cta_texto: 'Ver todas las promociones', cta_link: 'https://culturallaccess.com', items: [] }) },
  texto: { label: 'Texto', nuevo: () => ({ tipo: 'texto', titulo: '', texto: '', alineacion: 'izquierda' }) },
  imagen: { label: 'Imagen', nuevo: () => ({ tipo: 'imagen', url: '', link: '', caption: '' }) },
  boton: { label: 'Botón', nuevo: () => ({ tipo: 'boton', texto: '', url: 'https://culturallaccess.com' }) },
  separador: { label: 'Separador', nuevo: () => ({ tipo: 'separador' }) },
};

const inputClase = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';

const Campo = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
    {children}
  </label>
);

// La respuesta de promociones cambia de forma según el endpoint que conteste
function extraerPromociones(data) {
  if (Array.isArray(data)) return data;
  return data?.promociones || data?.data || [];
}

function promocionVigente(p) {
  if (p.estado && p.estado !== 'activa') return false;
  if (!p.fecha_fin) return true;
  const fin = new Date(p.fecha_fin);
  fin.setHours(23, 59, 59);
  return fin >= new Date();
}

const CampoImagen = ({ valor, onChange }) => {
  const [subiendo, setSubiendo] = useState(false);

  const subir = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSubiendo(true);
    try {
      onChange(await newsletterService.subirImagenNewsletter(file));
    } catch (err) {
      alert('Error al subir la imagen: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL de la imagen o súbela →"
        className={inputClase}
      />
      <label className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${subiendo ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
        {subiendo ? 'Subiendo...' : 'Subir'}
        <input type="file" accept="image/*" onChange={subir} disabled={subiendo} className="hidden" />
      </label>
    </div>
  );
};

const SelectorPromociones = ({ promociones, seleccionadas, onAgregar }) => {
  const [busqueda, setBusqueda] = useState('');
  const idsSeleccionados = new Set(seleccionadas.map((p) => p.id));
  const termino = busqueda.trim().toLowerCase();
  const opciones = promociones
    .filter((p) => !idsSeleccionados.has(p.id))
    .filter((p) => !termino || [p.institucion, p.tipo_promocion, p.disciplina].some((v) => (v || '').toLowerCase().includes(termino)))
    .slice(0, 8);

  return (
    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar promoción vigente por institución, tipo o disciplina..."
        className={inputClase}
      />
      <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
        {opciones.length === 0 && <p className="text-xs text-gray-500 px-1 py-2">Sin resultados.</p>}
        {opciones.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onAgregar(p)}
            className="w-full text-left px-2 py-1.5 rounded hover:bg-orange-100 text-sm"
          >
            <span className="font-medium text-gray-800">{p.institucion}</span>
            <span className="text-gray-500"> · {[p.tipo_promocion, p.disciplina].filter(Boolean).join(' · ')}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const EditorBloque = ({ bloque, onChange, promociones }) => {
  const set = (campo) => (e) => onChange({ ...bloque, [campo]: e.target.value });

  switch (bloque.tipo) {
    case 'portada':
      return (
        <div className="space-y-3">
          <Campo label="Imagen (ancho completo, 1200px recomendado)">
            <CampoImagen valor={bloque.url} onChange={(url) => onChange({ ...bloque, url })} />
          </Campo>
          <Campo label="Link al hacer clic (opcional)">
            <input type="text" value={bloque.link} onChange={set('link')} className={inputClase} />
          </Campo>
        </div>
      );

    case 'promociones': {
      const items = bloque.items || [];
      const agregar = (p) => onChange({
        ...bloque,
        items: [...items, {
          id: p.id,
          institucion: p.institucion,
          tipo_promocion: p.tipo_promocion,
          disciplina: p.disciplina,
          beneficios: p.beneficios,
          fecha_fin: p.fecha_fin,
          imagen: p.imagen_principal,
        }],
      });
      const quitar = (id) => onChange({ ...bloque, items: items.filter((i) => i.id !== id) });

      return (
        <div className="space-y-3">
          <Campo label="Título de la sección">
            <input type="text" value={bloque.titulo} onChange={set('titulo')} className={inputClase} />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Texto del botón (vacío = sin botón)">
              <input type="text" value={bloque.cta_texto} onChange={set('cta_texto')} className={inputClase} />
            </Campo>
            <Campo label="Link del botón">
              <input type="text" value={bloque.cta_link} onChange={set('cta_link')} className={inputClase} />
            </Campo>
          </div>
          {items.length > 0 && (
            <ul className="space-y-1">
              {items.map((i) => (
                <li key={i.id} className="flex items-center justify-between bg-orange-50 rounded px-3 py-1.5 text-sm">
                  <span className="truncate"><strong>{i.institucion}</strong> · {i.tipo_promocion}</span>
                  <button type="button" onClick={() => quitar(i.id)} className="text-red-600 hover:underline ml-2 shrink-0">Quitar</button>
                </li>
              ))}
            </ul>
          )}
          <SelectorPromociones promociones={promociones} seleccionadas={items} onAgregar={agregar} />
        </div>
      );
    }

    case 'texto':
      return (
        <div className="space-y-3">
          <Campo label="Título (opcional)">
            <input type="text" value={bloque.titulo} onChange={set('titulo')} className={inputClase} />
          </Campo>
          <Campo label="Texto (deja una línea en blanco para separar párrafos)">
            <textarea rows={5} value={bloque.texto} onChange={set('texto')} className={inputClase} />
          </Campo>
          <Campo label="Alineación">
            <select value={bloque.alineacion} onChange={set('alineacion')} className={inputClase}>
              <option value="izquierda">Izquierda</option>
              <option value="centro">Centro</option>
              <option value="derecha">Derecha</option>
            </select>
          </Campo>
        </div>
      );

    case 'imagen':
      return (
        <div className="space-y-3">
          <Campo label="Imagen">
            <CampoImagen valor={bloque.url} onChange={(url) => onChange({ ...bloque, url })} />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Link (opcional)">
              <input type="text" value={bloque.link} onChange={set('link')} className={inputClase} />
            </Campo>
            <Campo label="Pie de foto (opcional)">
              <input type="text" value={bloque.caption} onChange={set('caption')} className={inputClase} />
            </Campo>
          </div>
        </div>
      );

    case 'boton':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Texto del botón">
            <input type="text" value={bloque.texto} onChange={set('texto')} className={inputClase} />
          </Campo>
          <Campo label="Link">
            <input type="text" value={bloque.url} onChange={set('url')} className={inputClase} />
          </Campo>
        </div>
      );

    default:
      return <p className="text-xs text-gray-500">Línea divisoria entre secciones.</p>;
  }
};

const CampanaEditor = ({ campanaId, onVolver }) => {
  const [id, setId] = useState(campanaId);
  const [form, setForm] = useState(FORM_INICIAL);
  const [estado, setEstado] = useState('borrador');
  const [cargando, setCargando] = useState(!!campanaId);
  const [promociones, setPromociones] = useState([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [ocupado, setOcupado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [correoPrueba, setCorreoPrueba] = useState('');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const previewTimer = useRef(null);

  useEffect(() => {
    apiService.obtenerPromocionesAdmin()
      .then((data) => setPromociones(extraerPromociones(data).filter(promocionVigente)))
      .catch(() => setPromociones([]));

    if (!campanaId) return;
    newsletterService.obtenerCampana(campanaId)
      .then((c) => {
        setForm({
          nombre: c.nombre || '',
          asunto: c.asunto || '',
          from_name: c.from_name || '',
          titulo: c.titulo || '',
          intro_texto: c.intro_texto || '',
          footer_texto: c.footer_texto || '',
          color_primario: c.color_primario || FORM_INICIAL.color_primario,
          bloques: Array.isArray(c.bloques) ? c.bloques : [],
        });
        setEstado(c.estado);
      })
      .catch((err) => setMensaje({ tipo: 'error', texto: 'Error al cargar la campaña: ' + err.message }))
      .finally(() => setCargando(false));
  }, [campanaId]);

  // Vista previa en vivo con debounce para no saturar el servidor mientras se escribe
  useEffect(() => {
    if (cargando) return;
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      newsletterService.previewCampana(form).then(setPreviewHtml).catch(() => {});
    }, 600);
    return () => clearTimeout(previewTimer.current);
  }, [form, cargando]);

  const setCampo = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const agregarBloque = (tipo) => setForm((prev) => ({ ...prev, bloques: [...prev.bloques, TIPOS_BLOQUE[tipo].nuevo()] }));

  const actualizarBloque = (index, bloque) => setForm((prev) => ({
    ...prev,
    bloques: prev.bloques.map((b, i) => (i === index ? bloque : b)),
  }));

  const quitarBloque = (index) => setForm((prev) => ({ ...prev, bloques: prev.bloques.filter((_, i) => i !== index) }));

  const moverBloque = (index, delta) => setForm((prev) => {
    const destino = index + delta;
    if (destino < 0 || destino >= prev.bloques.length) return prev;
    const bloques = [...prev.bloques];
    [bloques[index], bloques[destino]] = [bloques[destino], bloques[index]];
    return { ...prev, bloques };
  });

  const mostrar = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 6000);
  };

  // Guarda y devuelve el id; las acciones de envío siempre guardan antes para mandar lo último
  const guardar = async () => {
    if (!form.nombre.trim() || !form.asunto.trim()) {
      throw new Error('El nombre y el asunto son obligatorios');
    }
    if (id) {
      const c = await newsletterService.actualizarCampana(id, form);
      setEstado(c.estado);
      return id;
    }
    const c = await newsletterService.crearCampana(form);
    setId(c.id);
    setEstado(c.estado);
    return c.id;
  };

  const ejecutar = async (accion, fn, exito) => {
    setOcupado(accion);
    try {
      await fn();
      mostrar('exito', exito);
    } catch (err) {
      mostrar('error', err.message);
    } finally {
      setOcupado(null);
    }
  };

  const handleGuardar = () => ejecutar('guardar', guardar, 'Campaña guardada');

  const handlePrueba = () => {
    if (!correoPrueba.trim()) return mostrar('error', 'Escribe el correo para la prueba');
    ejecutar('prueba', async () => {
      const campanaGuardada = await guardar();
      await newsletterService.enviarPrueba(campanaGuardada, correoPrueba.trim());
    }, `Prueba enviada a ${correoPrueba.trim()}`);
  };

  const handleProgramar = () => {
    const fecha = new Date(fechaProgramada);
    if (!fechaProgramada || isNaN(fecha)) return mostrar('error', 'Elige fecha y hora');
    if (fecha.getMinutes() % 15 !== 0) return mostrar('error', 'Mailchimp solo permite horas en :00, :15, :30 o :45');
    if (!window.confirm(`¿Programar el envío para el ${fecha.toLocaleString('es-MX')}?`)) return;
    ejecutar('programar', async () => {
      const campanaGuardada = await guardar();
      await newsletterService.programarCampana(campanaGuardada, fecha.toISOString());
      setEstado('programada');
    }, `Campaña programada para el ${fecha.toLocaleString('es-MX')}`);
  };

  const handleEnviar = async () => {
    let total = null;
    try {
      total = (await newsletterService.obtenerConteoAudiencia()).total;
    } catch { /* el conteo es solo informativo */ }
    const destino = total !== null ? `${total} contactos` : 'toda la audiencia de Mailchimp';
    if (!window.confirm(`¿Enviar ahora "${form.asunto}" a ${destino}? Esta acción no se puede deshacer.`)) return;

    ejecutar('enviar', async () => {
      const campanaGuardada = await guardar();
      await newsletterService.enviarCampana(campanaGuardada);
      setEstado('enviada');
    }, 'Campaña enviada');
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const enviada = estado === 'enviada';
  const botonAccion = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onVolver} className="text-sm text-gray-600 hover:text-orange-600">← Volver a campañas</button>
        {estado === 'programada' && (
          <span className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            Programada · al guardar cambios se cancela la programación
          </span>
        )}
      </div>

      {mensaje && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {mensaje.texto}
        </div>
      )}

      {enviada && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
          Esta campaña ya fue enviada y no se puede modificar.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Editor ── */}
        <fieldset disabled={enviada || !!ocupado} className="space-y-5 min-w-0">
          <section className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Datos del correo</h3>
            <Campo label="Nombre interno de la campaña *">
              <input type="text" value={form.nombre} onChange={setCampo('nombre')} placeholder="Ej. Newsletter octubre 2026" className={inputClase} />
            </Campo>
            <Campo label="Asunto *">
              <input type="text" value={form.asunto} onChange={setCampo('asunto')} placeholder="Lo que verán en su bandeja de entrada" className={inputClase} />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Nombre del remitente">
                <input type="text" value={form.from_name} onChange={setCampo('from_name')} className={inputClase} />
              </Campo>
              <Campo label="Color principal">
                <div className="flex gap-2">
                  <input type="color" value={form.color_primario} onChange={setCampo('color_primario')} className="h-9 w-12 border border-gray-300 rounded cursor-pointer" />
                  <input type="text" value={form.color_primario} onChange={setCampo('color_primario')} className={inputClase} />
                </div>
              </Campo>
            </div>
          </section>

          <section className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Encabezado y pie</h3>
            <Campo label="Título principal (opcional)">
              <input type="text" value={form.titulo} onChange={setCampo('titulo')} className={inputClase} />
            </Campo>
            <Campo label="Texto de introducción (opcional)">
              <textarea rows={3} value={form.intro_texto} onChange={setCampo('intro_texto')} className={inputClase} />
            </Campo>
            <Campo label="Texto del pie (opcional)">
              <textarea rows={2} value={form.footer_texto} onChange={setCampo('footer_texto')} className={inputClase} />
            </Campo>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-gray-800">Contenido</h3>
            {form.bloques.length === 0 && (
              <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                Agrega bloques con los botones de abajo.
              </p>
            )}
            {form.bloques.map((bloque, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-orange-600">{TIPOS_BLOQUE[bloque.tipo]?.label || bloque.tipo}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <button type="button" onClick={() => moverBloque(index, -1)} disabled={index === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30" title="Subir">↑</button>
                    <button type="button" onClick={() => moverBloque(index, 1)} disabled={index === form.bloques.length - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30" title="Bajar">↓</button>
                    <button type="button" onClick={() => quitarBloque(index)} className="px-2 py-1 rounded text-red-600 hover:bg-red-50">Quitar</button>
                  </div>
                </div>
                <EditorBloque bloque={bloque} onChange={(b) => actualizarBloque(index, b)} promociones={promociones} />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {Object.entries(TIPOS_BLOQUE).map(([tipo, { label }]) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => agregarBloque(tipo)}
                  className="text-sm border border-orange-300 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-50"
                >
                  + {label}
                </button>
              ))}
            </div>
          </section>

          <section className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
            <button onClick={handleGuardar} type="button" className={`${botonAccion} w-full bg-gray-800 text-white hover:bg-gray-900`}>
              {ocupado === 'guardar' ? 'Guardando...' : 'Guardar borrador'}
            </button>

            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">Enviar prueba</span>
              <div className="flex gap-2">
                <input type="email" value={correoPrueba} onChange={(e) => setCorreoPrueba(e.target.value)} placeholder="tu@correo.com" className={inputClase} />
                <button onClick={handlePrueba} type="button" className={`${botonAccion} shrink-0 bg-blue-600 text-white hover:bg-blue-700`}>
                  {ocupado === 'prueba' ? 'Enviando...' : 'Enviar prueba'}
                </button>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">Programar envío (minutos :00, :15, :30 o :45)</span>
              <div className="flex gap-2">
                <input type="datetime-local" step={900} value={fechaProgramada} onChange={(e) => setFechaProgramada(e.target.value)} className={inputClase} />
                <button onClick={handleProgramar} type="button" className={`${botonAccion} shrink-0 bg-indigo-600 text-white hover:bg-indigo-700`}>
                  {ocupado === 'programar' ? 'Programando...' : 'Programar'}
                </button>
              </div>
            </div>

            <button onClick={handleEnviar} type="button" className={`${botonAccion} w-full bg-orange-500 text-white hover:bg-orange-600`}>
              {ocupado === 'enviar' ? 'Enviando...' : 'Enviar ahora a toda la audiencia'}
            </button>
          </section>
        </fieldset>

        {/* ── Vista previa ── */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-xs text-gray-600 border-b">
              <strong>Asunto:</strong> {form.asunto || '—'} · <strong>De:</strong> {form.from_name || '—'}
            </div>
            <iframe title="Vista previa del correo" srcDoc={previewHtml} className="w-full h-[80vh] bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampanaEditor;

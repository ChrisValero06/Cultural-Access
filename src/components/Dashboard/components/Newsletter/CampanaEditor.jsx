import React, { useEffect, useRef, useState } from 'react';
import { apiService, newsletterService } from '../../../../apis';
import './newsletterFonts.css';

const ESTILO_TEXTO_DEF = (fuente = 'montserrat', tamano = 14, extras = {}) => ({
  fuente,
  tamano,
  negrita: false,
  cursiva: false,
  color: '',
  ...extras,
});

const CAJA_CREMA_DEFAULT = '#FFF7ED';

const BLOQUE_EDITORIAL_NUEVO = () => ({
  tipo: 'editorial',
  titulo: 'CulturAll Access',
  subtitulo: 'Cultura, acceso y promociones',
  intro_caja: '',
  caja_bg: CAJA_CREMA_DEFAULT,
  cta1_texto: 'Leer más',
  cta1_link: 'https://culturallaccess.com',
  etiqueta_dia: 'SÁBADO',
  imagen_1: '',
  imagen_2: '',
  seccion2_titulo: '',
  seccion2_subtitulo: '',
  seccion2_texto: '',
  seccion2_caja_bg: CAJA_CREMA_DEFAULT,
  cta2_texto: 'Leer más',
  cta2_link: 'https://culturallaccess.com',
  galeria_titulo: 'ALGO ESPECIAL HOY',
  imagen_3: '',
  imagen_4: '',
  imagen_5: '',
  cierre_titulo: 'PERMÍTETE SER FELIZ',
  cierre_texto: '',
  follow_texto: 'SÍGUENOS',
  social_facebook: '',
  social_x: '',
  social_instagram: '',
  // Tipografía editable por campo (se aplica en el HTML del correo)
  estilos: {
    titulo: ESTILO_TEXTO_DEF('montserrat', 34),
    subtitulo: ESTILO_TEXTO_DEF('montserrat', 13, { cursiva: true }),
    intro_caja: ESTILO_TEXTO_DEF('montserrat', 13),
    seccion2_titulo: ESTILO_TEXTO_DEF('montserrat', 13),
    seccion2_subtitulo: ESTILO_TEXTO_DEF('montserrat', 13, { cursiva: true }),
    seccion2_texto: ESTILO_TEXTO_DEF('montserrat', 13),
    galeria_titulo: ESTILO_TEXTO_DEF('montserrat', 13),
    cierre_titulo: ESTILO_TEXTO_DEF('montserrat', 18),
    cierre_texto: ESTILO_TEXTO_DEF('montserrat', 12),
  },
});

const OPCIONES_FUENTE = [
  { value: 'montserrat-thin', label: 'Montserrat Thin' },
  { value: 'montserrat-extralight', label: 'Montserrat ExtraLight' },
  { value: 'montserrat-light', label: 'Montserrat Light' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'montserrat-medium', label: 'Montserrat Medium' },
  { value: 'montserrat-semibold', label: 'Montserrat SemiBold' },
  { value: 'montserrat-bold', label: 'Montserrat Bold' },
  { value: 'montserrat-extrabold', label: 'Montserrat ExtraBold' },
  { value: 'montserrat-black', label: 'Montserrat Black' },
  { value: 'poppins-thin', label: 'Poppins Thin' },
  { value: 'poppins-extralight', label: 'Poppins ExtraLight' },
  { value: 'poppins-light', label: 'Poppins Light' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'poppins-medium', label: 'Poppins Medium' },
  { value: 'poppins-semibold', label: 'Poppins SemiBold' },
  { value: 'poppins-bold', label: 'Poppins Bold' },
  { value: 'poppins-extrabold', label: 'Poppins ExtraBold' },
  { value: 'poppins-black', label: 'Poppins Black' },
];

/** Stack CSS + peso base (solo Montserrat y Poppins) */
const PREVIEW_FUENTE = {
  'montserrat-thin': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 100 },
  'montserrat-extralight': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 200 },
  'montserrat-light': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 300 },
  montserrat: { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 400 },
  'montserrat-medium': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 500 },
  'montserrat-semibold': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 600 },
  'montserrat-bold': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 700 },
  'montserrat-extrabold': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 800 },
  'montserrat-black': { family: 'Montserrat, Helvetica, Arial, sans-serif', weight: 900 },
  'poppins-thin': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 100 },
  'poppins-extralight': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 200 },
  'poppins-light': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 300 },
  poppins: { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 400 },
  'poppins-medium': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 500 },
  'poppins-semibold': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 600 },
  'poppins-bold': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 700 },
  'poppins-extrabold': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 800 },
  'poppins-black': { family: 'Poppins, Helvetica, Arial, sans-serif', weight: 900 },
};

const OPCIONES_TAMANO = [11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 34, 38, 42];

/** Valor guardado (texto + <strong>) → HTML del contentEditable */
function valorAHtmlEditor(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;strong&gt;/gi, '<strong>')
    .replace(/&lt;\/strong&gt;/gi, '</strong>')
    .replace(/&lt;b&gt;/gi, '<strong>')
    .replace(/&lt;\/b&gt;/gi, '</strong>')
    .replace(/\n/g, '<br>');
}

/** HTML del editor → valor con solo <strong> y saltos de línea */
function htmlEditorAValor(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = String(html || '');

  const walk = (node) => {
    let out = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.textContent || '';
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'br') {
          out += '\n';
        } else if (tag === 'strong' || tag === 'b') {
          out += `<strong>${walk(child)}</strong>`;
        } else if (tag === 'div' || tag === 'p') {
          if (out && !out.endsWith('\n')) out += '\n';
          out += walk(child);
        } else {
          out += walk(child);
        }
      }
    }
    return out;
  };

  return walk(tmp).replace(/\n+$/, '');
}

const FORM_INICIAL = {
  nombre: '',
  asunto: '',
  from_name: 'CulturAll Access',
  titulo: '',
  intro_texto: '',
  footer_texto: 'Secretaría de Cultura de Nuevo León',
  color_primario: '#F97316', // Naranja CulturAll Access
  // Nueva campaña ya trae el diseño del mockup abierto (mapa + Imagen 1–5)
  bloques: [BLOQUE_EDITORIAL_NUEVO()],
};

const CAFES_VIEJOS = new Set(['#8B6F5C', '#A89080', '#8D7361', '#8D7663']);
function colorPrimarioMarca(color) {
  const c = String(color || '').toUpperCase();
  if (!c || CAFES_VIEJOS.has(c)) return '#F97316';
  return color || '#F97316';
}

const TIPOS_BLOQUE = {
  editorial: {
    label: 'Diseño editorial (mockup)',
    nuevo: BLOQUE_EDITORIAL_NUEVO,
  },
  portada: { label: 'Imagen de portada', nuevo: () => ({ tipo: 'portada', url: '', link: '' }) },
  promociones: { label: 'Promociones', nuevo: () => ({ tipo: 'promociones', titulo: 'Promociones del mes', cta_texto: 'Ver todas las promociones', cta_link: 'https://culturallaccess.com', items: [] }) },
  texto: { label: 'Texto', nuevo: () => ({ tipo: 'texto', titulo: '', texto: '', alineacion: 'izquierda' }) },
  imagen: { label: 'Imagen', nuevo: () => ({ tipo: 'imagen', url: '', link: '', caption: '' }) },
  boton: { label: 'Botón', nuevo: () => ({ tipo: 'boton', texto: '', url: 'https://culturallaccess.com' }) },
  separador: { label: 'Separador', nuevo: () => ({ tipo: 'separador' }) },
};

const inputClase = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
const SITE_URL = 'https://culturallaccess.com';

const Campo = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
    {children}
  </label>
);

/** Color de fondo de la caja crema (intro / promoción 2) */
const CampoColorCaja = ({ label, valor, onChange }) => {
  const hex = valor && /^#[0-9a-f]{6}$/i.test(valor) ? valor : CAJA_CREMA_DEFAULT;
  return (
    <Campo label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={valor || CAJA_CREMA_DEFAULT}
          onChange={(e) => onChange(e.target.value)}
          className={inputClase}
          placeholder={CAJA_CREMA_DEFAULT}
        />
      </div>
    </Campo>
  );
};

/** Texto + barra de tipografía (fuente, tamaño, negrita, cursiva, color).
 *  Negrita: con selección → solo ese tramo (<strong>); sin selección → todo el campo. */
const CampoTextoEstilable = ({
  label,
  valor,
  onChangeTexto,
  estilo = {},
  onChangeEstilo,
  multilinea = false,
  filas = 3,
  placeholder = '',
}) => {
  const e = { fuente: 'montserrat', tamano: 14, negrita: false, cursiva: false, color: '', ...estilo };
  const setEstilo = (patch) => onChangeEstilo({ ...e, ...patch });
  const previewMeta = PREVIEW_FUENTE[e.fuente] || PREVIEW_FUENTE.montserrat;
  const previewFont = previewMeta.family;
  const previewWeight = e.negrita ? Math.max(previewMeta.weight, 700) : previewMeta.weight;
  const editorRef = useRef(null);
  const syncingRef = useRef(false);
  const [negritaInlineActiva, setNegritaInlineActiva] = useState(false);

  // Sincronizar HTML del editor cuando el valor llega desde fuera (carga / undo remoto)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const actual = htmlEditorAValor(el.innerHTML);
    if (actual === (valor || '')) return;
    syncingRef.current = true;
    el.innerHTML = valorAHtmlEditor(valor || '') || '';
    syncingRef.current = false;
  }, [valor]);

  const emitirDesdeEditor = () => {
    const el = editorRef.current;
    if (!el || syncingRef.current) return;
    onChangeTexto(htmlEditorAValor(el.innerHTML));
  };

  const haySeleccionEnEditor = () => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    return el.contains(sel.anchorNode) && el.contains(sel.focusNode);
  };

  const actualizarEstadoNegritaInline = () => {
    try {
      setNegritaInlineActiva(!!document.queryCommandState('bold'));
    } catch {
      setNegritaInlineActiva(false);
    }
  };

  const aplicarNegrita = () => {
    const el = editorRef.current;
    if (!el) {
      setEstilo({ negrita: !e.negrita });
      return;
    }

    if (haySeleccionEnEditor()) {
      el.focus();
      document.execCommand('bold', false);
      // Solo el tramo seleccionado: apagar negrita de campo completo
      if (e.negrita) setEstilo({ negrita: false });
      emitirDesdeEditor();
      actualizarEstadoNegritaInline();
      return;
    }

    // Sin selección → negrita a todo el campo (CSS font-weight)
    setEstilo({ negrita: !e.negrita });
  };

  const estiloEditor = {
    fontFamily: previewFont,
    fontSize: `${Math.min(18, e.tamano)}px`,
    fontWeight: previewWeight,
    fontStyle: e.cursiva ? 'italic' : 'normal',
    color: e.color || undefined,
    minHeight: multilinea ? `${Math.max(2, filas) * 1.5}rem` : undefined,
    whiteSpace: multilinea ? 'pre-wrap' : 'nowrap',
    overflowX: multilinea ? undefined : 'auto',
  };

  const botonNegritaActivo = e.negrita || negritaInlineActiva;

  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-semibold text-gray-600">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-lg">
        <select
          value={e.fuente}
          onChange={(ev) => setEstilo({ fuente: ev.target.value })}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white max-w-[11rem]"
          title="Tipografía"
        >
          {OPCIONES_FUENTE.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={e.tamano}
          onChange={(ev) => setEstilo({ tamano: Number(ev.target.value) })}
          className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white"
          title="Tamaño"
        >
          {OPCIONES_TAMANO.map((n) => (
            <option key={n} value={n}>{n}px</option>
          ))}
        </select>
        <button
          type="button"
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={aplicarNegrita}
          className={`text-xs font-bold px-2 py-1 rounded border ${botonNegritaActivo ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300 text-gray-700'}`}
          title="Negrita: selección = solo ese texto; sin selección = todo el campo"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => setEstilo({ cursiva: !e.cursiva })}
          className={`text-xs italic px-2 py-1 rounded border ${e.cursiva ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300 text-gray-700'}`}
          title="Cursiva"
        >
          I
        </button>
        <label className="flex items-center gap-1 text-xs text-gray-600 px-1" title="Color del texto">
          <span>Color</span>
          <input
            type="color"
            value={e.color && /^#[0-9a-f]{6}$/i.test(e.color) ? e.color : '#3A322C'}
            onChange={(ev) => setEstilo({ color: ev.target.value })}
            className="h-6 w-7 border border-gray-300 rounded cursor-pointer bg-white"
          />
        </label>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`${inputClase} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none`}
        style={estiloEditor}
        onInput={emitirDesdeEditor}
        onBlur={emitirDesdeEditor}
        onKeyUp={actualizarEstadoNegritaInline}
        onMouseUp={actualizarEstadoNegritaInline}
        onKeyDown={(ev) => {
          if (!multilinea && ev.key === 'Enter') ev.preventDefault();
          if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'b') {
            ev.preventDefault();
            aplicarNegrita();
          }
        }}
      />
    </div>
  );
};

function urlPreviewImagen(ruta) {
  if (!ruta) return '';
  const limpia = String(ruta).trim();
  if (!limpia) return '';
  if (limpia.startsWith('http://') || limpia.startsWith('https://') || limpia.startsWith('blob:')) return limpia;
  // En localhost /images/... no existe: siempre previsualizar desde el sitio público
  if (limpia.startsWith('/')) return `${SITE_URL}${limpia}`;
  return `${SITE_URL}/images/uploads/${limpia.replace(/^images\/uploads\//, '')}`;
}

function asegurarBloqueEditorial(bloques) {
  const lista = Array.isArray(bloques) ? [...bloques] : [];
  const plantilla = BLOQUE_EDITORIAL_NUEVO();
  const defsEstilos = plantilla.estilos;
  const normalizados = lista.map((b) => {
    if (b?.tipo !== 'editorial') return b;
    // Migrar bloques viejos: campos nuevos (p. ej. seccion2_subtitulo, caja_bg) + estilos faltantes
    const estilosMerged = { ...defsEstilos, ...(b.estilos || {}) };
    // Título zona 2: banner full-width como galería (antes default 28 en columna estrecha)
    if (Number(estilosMerged.seccion2_titulo?.tamano) === 28) {
      estilosMerged.seccion2_titulo = { ...estilosMerged.seccion2_titulo, tamano: 13 };
    }
    return {
      ...plantilla,
      ...b,
      seccion2_subtitulo: typeof b.seccion2_subtitulo === 'string' ? b.seccion2_subtitulo : '',
      caja_bg: /^#[0-9a-f]{6}$/i.test(b.caja_bg || '') ? b.caja_bg : CAJA_CREMA_DEFAULT,
      seccion2_caja_bg: /^#[0-9a-f]{6}$/i.test(b.seccion2_caja_bg || '') ? b.seccion2_caja_bg : CAJA_CREMA_DEFAULT,
      estilos: estilosMerged,
    };
  });
  if (normalizados.some((b) => b?.tipo === 'editorial')) return normalizados;
  return [BLOQUE_EDITORIAL_NUEVO(), ...normalizados];
}

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

const MAX_IMAGEN_MB = 10;
const MAX_IMAGEN_BYTES = MAX_IMAGEN_MB * 1024 * 1024;
const MSG_IMAGEN_PESADA = `La imagen es pesada. Máximo ${MAX_IMAGEN_MB} MB (mejor menos de 2 MB).`;

const CampoImagen = ({ valor, onChange, altoPreview = 'h-28' }) => {
  const [subiendo, setSubiendo] = useState(false);
  const [rota, setRota] = useState(false);
  const [errorSubida, setErrorSubida] = useState('');
  const preview = urlPreviewImagen(valor);

  useEffect(() => {
    setRota(false);
  }, [valor]);

  const subir = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorSubida('');
    if (file.size > MAX_IMAGEN_BYTES) {
      setErrorSubida(MSG_IMAGEN_PESADA);
      return;
    }
    setSubiendo(true);
    try {
      onChange(await newsletterService.subirImagenNewsletter(file));
    } catch (err) {
      const raw = String(err?.message || err || '');
      const pesada = /file too large|LIMIT_FILE_SIZE|entity too large|413|pesada|demasiado grande/i.test(raw);
      setErrorSubida(pesada ? MSG_IMAGEN_PESADA : (raw || 'No se pudo subir la imagen'));
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className={`${altoPreview} w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center`}>
        {preview && !rota ? (
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
            onError={() => setRota(true)}
          />
        ) : (
          <span className="text-xs text-gray-400 px-3 text-center">
            {valor ? 'No se pudo cargar la vista previa · vuelve a Subir' : 'Sin imagen · usa Subir'}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={valor || ''}
          onChange={(e) => {
            setErrorSubida('');
            onChange(e.target.value);
          }}
          placeholder="URL de la imagen o súbela →"
          className={inputClase}
        />
        <label className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${subiendo ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
          {subiendo ? 'Subiendo...' : 'Subir'}
          <input type="file" accept="image/*" onChange={subir} disabled={subiendo} className="hidden" />
        </label>
        {valor ? (
          <button type="button" onClick={() => { setErrorSubida(''); onChange(''); }} className="shrink-0 px-2 text-xs text-red-600 hover:bg-red-50 rounded-lg">
            Quitar
          </button>
        ) : null}
      </div>
      {errorSubida ? (
        <p className="text-xs font-medium text-red-600" role="alert">{errorSubida}</p>
      ) : null}
    </div>
  );
};

/** Slot visual para cada foto del diseño editorial */
const SlotImagenEditorial = ({ numero, titulo, ayuda, valor, onChange, forma = 'cuadrada' }) => (
  <div className="rounded-xl border-2 border-orange-200 bg-orange-50/40 p-3 space-y-2">
    <div className="flex items-start gap-2">
      <span className="shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
        {numero}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">{titulo}</p>
        <p className="text-xs text-gray-500">{ayuda}</p>
      </div>
    </div>
    <CampoImagen valor={valor} onChange={onChange} altoPreview={forma === 'horizontal' ? 'h-24' : forma === 'vertical' ? 'h-40' : 'h-32'} />
  </div>
);

const MapaLayoutEditorial = () => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-1.5">
    <p className="text-xs font-semibold text-amber-900 mb-2">Mapa del correo — dónde va cada imagen</p>
    <div className="grid grid-cols-2 gap-1.5 text-[10px] leading-tight text-center font-semibold">
      <div className="rounded bg-white border border-amber-100 p-3 text-gray-500 flex items-center justify-center">Textos cabecera</div>
      <div className="rounded bg-orange-500 text-white p-3">① IMG 1 · arriba derecha</div>
      <div className="rounded bg-orange-400 text-white p-3">② IMG 2 · horizontal</div>
      <div className="rounded bg-white border border-amber-100 p-3 text-gray-500 flex items-center justify-center">Título + texto 2</div>
    </div>
    <p className="text-[10px] text-amber-800/80 text-center pt-1">Galería (3 fotos)</p>
    <div className="grid grid-cols-3 gap-1.5 text-[10px] leading-tight text-center font-semibold">
      <div className="rounded bg-orange-300 text-white p-3">③ IMG 3</div>
      <div className="rounded bg-orange-400 text-white p-3">④ IMG 4</div>
      <div className="rounded bg-orange-500 text-white p-3">⑤ IMG 5</div>
    </div>
    <div className="rounded bg-white border border-amber-100 p-2 text-[10px] text-gray-400 text-center">Cierre + Síguenos</div>
  </div>
);

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
    case 'editorial': {
      const estilos = bloque.estilos || {};
      const setEstiloCampo = (clave) => (nuevoEstilo) => onChange({
        ...bloque,
        estilos: { ...estilos, [clave]: nuevoEstilo },
      });

      return (
        <div className="space-y-4">
          <MapaLayoutEditorial />
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            En cada texto puedes cambiar tipografía, tamaño, negrita, cursiva y color. Con negrita: si seleccionas texto solo se pone en negrita esa parte; si no hay selección, se aplica a todo el campo. Se refleja en la vista previa del correo.
          </p>

          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Promoción 1</h4>
            <CampoTextoEstilable
              label="Título (ej. Inspirational Blog / CulturAll Access)"
              valor={bloque.titulo}
              onChangeTexto={(v) => onChange({ ...bloque, titulo: v })}
              estilo={estilos.titulo}
              onChangeEstilo={setEstiloCampo('titulo')}
            />
            <CampoTextoEstilable
              label="Subtítulo"
              valor={bloque.subtitulo}
              onChangeTexto={(v) => onChange({ ...bloque, subtitulo: v })}
              estilo={estilos.subtitulo}
              onChangeEstilo={setEstiloCampo('subtitulo')}
            />
            <CampoTextoEstilable
              label="Texto de la caja beige (intro)"
              valor={bloque.intro_caja}
              onChangeTexto={(v) => onChange({ ...bloque, intro_caja: v })}
              estilo={estilos.intro_caja}
              onChangeEstilo={setEstiloCampo('intro_caja')}
              multilinea
              filas={4}
            />
            <CampoColorCaja
              label="Color de fondo de la caja"
              valor={bloque.caja_bg}
              onChange={(v) => onChange({ ...bloque, caja_bg: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Botón 1 — texto">
                <input type="text" value={bloque.cta1_texto || ''} onChange={set('cta1_texto')} className={inputClase} />
              </Campo>
              <Campo label="Botón 1 — link">
                <input type="text" value={bloque.cta1_link || ''} onChange={set('cta1_link')} className={inputClase} />
              </Campo>
            </div>
            <Campo label="Etiqueta día (ej. SÁBADO)">
              <input type="text" value={bloque.etiqueta_dia || ''} onChange={set('etiqueta_dia')} className={inputClase} />
            </Campo>
            <SlotImagenEditorial
              numero="1"
              titulo="Imagen 1 — arriba derecha"
              ayuda="Cuadrada/vertical del hero. En el correo se ve ~218×218 px. Máximo recomendado sin perder calidad (retina): 436×436 px (o 600×600). JPG < 300–500 KB."
              valor={bloque.imagen_1 || ''}
              onChange={(url) => onChange({ ...bloque, imagen_1: url })}
              forma="vertical"
            />
          </div>

          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Promoción 2</h4>
            <CampoTextoEstilable
              label="Título (ej. New day)"
              valor={bloque.seccion2_titulo}
              onChangeTexto={(v) => onChange({ ...bloque, seccion2_titulo: v })}
              estilo={estilos.seccion2_titulo}
              onChangeEstilo={setEstiloCampo('seccion2_titulo')}
            />
            <CampoTextoEstilable
              label="Subtítulo (dentro de la caja)"
              valor={bloque.seccion2_subtitulo}
              onChangeTexto={(v) => onChange({ ...bloque, seccion2_subtitulo: v })}
              estilo={estilos.seccion2_subtitulo}
              onChangeEstilo={setEstiloCampo('seccion2_subtitulo')}
            />
            <CampoTextoEstilable
              label="Texto (dentro de la caja)"
              valor={bloque.seccion2_texto}
              onChangeTexto={(v) => onChange({ ...bloque, seccion2_texto: v })}
              estilo={estilos.seccion2_texto}
              onChangeEstilo={setEstiloCampo('seccion2_texto')}
              multilinea
              filas={3}
            />
            <CampoColorCaja
              label="Color de fondo de la caja"
              valor={bloque.seccion2_caja_bg}
              onChange={(v) => onChange({ ...bloque, seccion2_caja_bg: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Botón 2 — texto">
                <input type="text" value={bloque.cta2_texto || ''} onChange={set('cta2_texto')} className={inputClase} />
              </Campo>
              <Campo label="Botón 2 — link">
                <input type="text" value={bloque.cta2_link || ''} onChange={set('cta2_link')} className={inputClase} />
              </Campo>
            </div>
            <SlotImagenEditorial
              numero="2"
              titulo="Imagen 2 — mitad de página"
              ayuda="Horizontal a la izquierda. En el correo se ve ~248×162 px. Máximo recomendado sin perder calidad (retina): 496×324 px (o 800×520). JPG < 300–500 KB."
              valor={bloque.imagen_2 || ''}
              onChange={(url) => onChange({ ...bloque, imagen_2: url })}
              forma="horizontal"
            />
          </div>

          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Promociones</h4>
            <CampoTextoEstilable
              label="Título galería"
              valor={bloque.galeria_titulo}
              onChangeTexto={(v) => onChange({ ...bloque, galeria_titulo: v })}
              estilo={estilos.galeria_titulo}
              onChangeEstilo={setEstiloCampo('galeria_titulo')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SlotImagenEditorial
                numero="3"
                titulo="Imagen 3"
                ayuda="Galería · izquierda. Display ~152×220 px. Máximo recomendado: 304×440 px (o 400×580). JPG < 300–500 KB."
                valor={bloque.imagen_3 || ''}
                onChange={(url) => onChange({ ...bloque, imagen_3: url })}
                forma="vertical"
              />
              <SlotImagenEditorial
                numero="4"
                titulo="Imagen 4"
                ayuda="Galería · centro. Display ~152×220 px. Máximo recomendado: 304×440 px (o 400×580). JPG < 300–500 KB."
                valor={bloque.imagen_4 || ''}
                onChange={(url) => onChange({ ...bloque, imagen_4: url })}
                forma="vertical"
              />
              <SlotImagenEditorial
                numero="5"
                titulo="Imagen 5"
                ayuda="Galería · derecha. Display ~152×220 px. Máximo recomendado: 304×440 px (o 400×580). JPG < 300–500 KB."
                valor={bloque.imagen_5 || ''}
                onChange={(url) => onChange({ ...bloque, imagen_5: url })}
                forma="vertical"
              />
            </div>
            <CampoTextoEstilable
              label="Frase de cierre"
              valor={bloque.cierre_titulo}
              onChangeTexto={(v) => onChange({ ...bloque, cierre_titulo: v })}
              estilo={estilos.cierre_titulo}
              onChangeEstilo={setEstiloCampo('cierre_titulo')}
            />
            <CampoTextoEstilable
              label="Texto de cierre"
              valor={bloque.cierre_texto}
              onChangeTexto={(v) => onChange({ ...bloque, cierre_texto: v })}
              estilo={estilos.cierre_texto}
              onChangeEstilo={setEstiloCampo('cierre_texto')}
              multilinea
              filas={2}
            />
            <Campo label="Texto barra inferior (SÍGUENOS)">
              <input type="text" value={bloque.follow_texto || ''} onChange={set('follow_texto')} className={inputClase} />
            </Campo>
            <div className="grid grid-cols-1 gap-2">
              <Campo label="Link Facebook (opcional)">
                <input type="text" value={bloque.social_facebook || ''} onChange={set('social_facebook')} className={inputClase} />
              </Campo>
              <Campo label="Link X / Twitter (opcional)">
                <input type="text" value={bloque.social_x || ''} onChange={set('social_x')} className={inputClase} />
              </Campo>
              <Campo label="Link Instagram (opcional)">
                <input type="text" value={bloque.social_instagram || ''} onChange={set('social_instagram')} className={inputClase} />
              </Campo>
            </div>
          </div>
        </div>
      );
    }

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
        const bloquesCargados = Array.isArray(c.bloques) ? c.bloques : [];
        setForm({
          nombre: c.nombre || '',
          asunto: c.asunto || '',
          from_name: c.from_name || '',
          titulo: c.titulo || '',
          intro_texto: c.intro_texto || '',
          footer_texto: c.footer_texto || '',
          color_primario: colorPrimarioMarca(c.color_primario),
          // Siempre incluir el diseño editorial (mapa + Imagen 1–5) aunque haya otros bloques
          bloques: asegurarBloqueEditorial(bloquesCargados),
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
      newsletterService.previewCampana(form)
        .then(setPreviewHtml)
        .catch((err) => {
          setPreviewHtml(`<div style="padding:24px;font-family:sans-serif;color:#b91c1c;">
            <strong>No se pudo generar la vista previa.</strong><br>
            ${String(err?.message || err)}<br><br>
            Si editas el diseño editorial y no cambia nada, el servidor API aún no tiene la plantilla nueva (hay que desplegar/reiniciar el backend).
          </div>`);
        });
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
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              El diseño del mockup está en el bloque <strong>Diseño editorial (mockup)</strong> (mapa + Imagen 1 a 5).
              El bloque solo llamado <strong>Imagen</strong> es una foto suelta: puedes <strong>Quitar</strong>lo si no lo necesitas.
            </p>
            {form.bloques.length === 0 && (
              <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                No hay bloques. Agrega “Diseño editorial (mockup)” para el layout con 5 imágenes.
              </p>
            )}
            {form.bloques.map((bloque, index) => (
              <div key={index} className={`border rounded-lg p-4 ${bloque.tipo === 'editorial' ? 'border-orange-300 bg-orange-50/20' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-orange-600">{TIPOS_BLOQUE[bloque.tipo]?.label || bloque.tipo}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <button type="button" onClick={() => moverBloque(index, -1)} disabled={index === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30" title="Subir">↑</button>
                    <button type="button" onClick={() => moverBloque(index, 1)} disabled={index === form.bloques.length - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30" title="Bajar">↓</button>
                    <button type="button" onClick={() => quitarBloque(index)} className="px-2 py-1 rounded text-red-600 hover:bg-red-50">Quitar</button>
                  </div>
                </div>
                {bloque.tipo === 'imagen' && (
                  <p className="text-xs text-gray-500 mb-3">
                    Esto no es el mockup. Baja o sube hasta <strong>Diseño editorial</strong> para las 5 fotos del layout.
                  </p>
                )}
                <EditorBloque bloque={bloque} onChange={(b) => actualizarBloque(index, b)} promociones={promociones} />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {Object.entries(TIPOS_BLOQUE).map(([tipo, { label }]) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => agregarBloque(tipo)}
                  className={tipo === 'editorial'
                    ? 'text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 font-semibold'
                    : 'text-sm border border-orange-300 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-50'}
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

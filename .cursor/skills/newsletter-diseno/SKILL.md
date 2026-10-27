---
name: newsletter-diseno
description: >-
  Diseño y estructura del newsletter HTML de CulturAll Access (mockup tipo blog
  inspiracional con 5 imágenes y textos editables). Usar cuando se trabaje el
  editor de campañas, preview HTML, bloques de newsletter, o se pida cambiar el
  diseño del correo que se envía.
---

# Newsletter — diseño CulturAll Access

## Dónde vive el HTML

- **Front:** `src/components/Dashboard/components/Newsletter/` (editor, preview iframe).
- **API HTML:** `newsletterService.previewCampana` → backend `POST /newsletter/preview`.
- El HTML final del correo lo genera el **backend**. Cambiar el look del envío implica tocar plantilla del API + campos del editor en front.

Campos globales del form: `nombre`, `asunto`, `from_name`, `titulo`, `intro_texto`, `footer_texto`, `color_primario`, `bloques[]`.

Bloques actuales: `portada`, `promociones`, `texto`, `imagen`, `boton`, `separador`.

## Mapa del mockup (referencia visual)

Paleta sugerida: crema `#F5EBE0`, blanco, marrón `#8D6E63` (botones/footer). Títulos serif; cuerpo sans. Esquinas rectas (emails).

### Zona 1 — Cabecera (2 columnas)

| Slot | Qué es | Campo editable sugerido | Imagen |
|------|--------|-------------------------|--------|
| Título | Ej. "CulturAll Access" / "Inspirational Blog" | `titulo` | — |
| Subtítulo | Ej. "Cultura, acceso y promociones" | `intro_texto` (1ª línea) o campo `subtitulo` nuevo | — |
| Caja beige + párrafos | Texto introductorio | `intro_texto` o bloque `texto` | — |
| Botón "Leer más" | CTA principal | bloque `boton` o `cta_texto`/`cta_link` | — |
| Etiqueta día | Ej. "SÁBADO" | campo `etiqueta_dia` | — |
| **Imagen 1** | Foto hero vertical (derecha) | bloque `portada` / `imagen_1` | **Imagen 1** |
| "NEWSLETTER" + fecha | Meta | `etiqueta_meta` + `fecha_display` | — |

### Zona 2 — Destacado horizontal

| Slot | Qué es | Campo | Imagen |
|------|--------|-------|--------|
| **Imagen 2** | Foto horizontal izquierda | `imagen_2` | **Imagen 2** |
| Título | Ej. "New day" / nombre promo | `seccion2_titulo` | — |
| Párrafo | Resumen | `seccion2_texto` | — |
| Botón | CTA | `seccion2_cta` + link | — |

### Zona 3 — Galería "algo especial"

| Slot | Qué es | Campo | Imagen |
|------|--------|-------|--------|
| Título sección | Ej. "ALGO ESPECIAL HOY" | `galeria_titulo` | — |
| **Imagen 3** | Columna izq. | `imagen_3` | **Imagen 3** |
| **Imagen 4** | Centro | `imagen_4` | **Imagen 4** |
| **Imagen 5** | Derecha | `imagen_5` | **Imagen 5** |

### Zona 4 — Cierre + footer

| Slot | Qué es | Campo |
|------|--------|-------|
| Frase cierre | Ej. "PERMÍTETE SER FELIZ" | `cierre_titulo` |
| Texto cierre | Párrafo corto | `cierre_texto` |
| Barra "SÍGUENOS" | Footer social | `footer_texto` + links redes |

## Resumen rápido de imágenes

1. **Imagen 1** — hero vertical arriba derecha  
2. **Imagen 2** — horizontal mitad de página  
3. **Imagen 3** — galería izquierda  
4. **Imagen 4** — galería centro  
5. **Imagen 5** — galería derecha  

Textos del mockup son placeholder; en producción usar copy de CulturAll / Secretaría de Cultura NL.

## Al implementar el nuevo diseño

1. No romper envío/prueba/programar existentes.
2. Preferir HTML table-based + CSS inline (clientes de correo).
3. Imágenes con URL absolutas HTTPS (subida vía `subirImagenNewsletter`).
4. Mantener preview en iframe del editor.
5. Si se agregan campos nuevos al form, mapearlos también en el body que manda `crearCampana` / `actualizarCampana`.

## Archivos clave

- `src/apis/newsletter/newsletterService.js`
- `src/components/Dashboard/components/Newsletter/CampanaEditor.jsx`
- `src/components/Dashboard/components/Newsletter/CampanasLista.jsx`
- `src/components/NewsletterSuscribete.jsx`

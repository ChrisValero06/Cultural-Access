---
name: newsletter-diseno
description: >-
  Diseño editorial del newsletter CulturAll Access (mockup con 5 imágenes).
  Usar al editar campañas, preview HTML, bloques editorial, o plantilla de envío.
---

# Newsletter — diseño editorial

## Cómo usarlo en el admin

1. Nueva campaña → **+ Diseño editorial (mockup)**
2. Completar textos e **Imagen 1…5**
3. Color sugerido: `#8D6E63`
4. Guardar / vista previa / enviar

Sin bloque `editorial`, se usa la plantilla clásica (logo naranja).

## Archivos

| Pieza | Ruta |
|-------|------|
| HTML envío | `Cultural-Access-Backend/backend/services/newsletterTemplate.js` → `renderEditorial` |
| Mailchimp imgs | `mailchimpService.js` → sube `imagen_1`…`imagen_5` |
| Editor | `Cultural-Access/src/.../Newsletter/CampanaEditor.jsx` bloque `editorial` |

Datos en `bloques` JSON (sin ALTER SQL).

## Mapa Imagen / texto

1. **Imagen 1** — hero vertical arriba derecha (+ etiqueta día / NEWSLETTER / fecha)
2. **Imagen 2** — horizontal zona media
3. **Imagen 3–5** — galería
4. Textos: `titulo`, `subtitulo`, `intro_caja`, CTAs, `seccion2_*`, `galeria_titulo`, `cierre_*`, redes

## Email-safe

Tablas + CSS inline. Stack en móvil (`.nl-stack`).

---
name: newsletter-diseno
description: >-
  Diseño editorial del newsletter CulturAll Access (mockup collage premium).
  Usar al editar campañas, preview HTML, bloques editorial, o plantilla de envío.
---

# Newsletter — mockup editorial premium

## Objetivo

Replicar el mockup lifestyle (no naranja chillón): blanco + crema + taupe + café,
collage con capas detrás de fotos, tipografía serif, botones con sombra offset.

## Paleta fija en `renderEditorial`

| Uso | Hex |
|-----|-----|
| Acento / botones / footer | `#8B6F5C` |
| Barra SÁBADO / capa centro | `#A89080` |
| Caja texto | `#F3E8DB` |
| Capas detrás de fotos | `#EAD9C8` |

La plantilla editorial **no** usa `#F97316` (se veía pobre junto al mockup).

## Archivos

- Backend HTML: `newsletterTemplate.js` → `renderEditorial`, `fotoConCapa`, `botonEditorial`
- Front editor: `CampanaEditor.jsx` bloque `editorial`
- Obligatorias visualmente: **Imagen 1…5** (sin fotos no se parece al mockup)

## Deploy

Cambios = **backend**. `git pull` + reiniciar Node en el servidor.

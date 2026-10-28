---
name: newsletter-diseno
description: >-
  Diseño editorial del newsletter CulturAll Access (mockup con 5 imágenes).
  Usar al editar campañas, preview HTML, bloques editorial, o plantilla de envío.
---

# Newsletter — diseño editorial (mockup)

## Objetivo visual

Replicar el mockup lifestyle: título serif, caja crema, SÁBADO + Imagen 1,
NEWSLETTER/fecha, Imagen 2 + “New day”, galería 3 cols, cierre, barra FOLLOW US.

Paleta mockup: acento `#A67C65`, crema `#F5E6D3`. Si `color_primario` es `#F97316`,
la plantilla editorial usa terracota del mockup automáticamente.

## Cómo usarlo

1. Campaña → bloque **Diseño editorial (mockup)** (viene por defecto)
2. Completar textos e **Imagen 1…5**
3. Color sugerido: `#A67C65`
4. Guardar / preview / enviar

## Archivos

| Pieza | Ruta |
|-------|------|
| HTML | `Cultural-Access-Backend/backend/services/newsletterTemplate.js` → `renderEditorial` |
| Mailchimp | `mailchimpService.js` → `imagen_1`…`imagen_5` |
| Editor | `CampanaEditor.jsx` bloque `editorial` |

## Mapa

1. **Imagen 1** — arriba derecha (bajo SÁBADO)
2. **Imagen 2** — mitad izquierda (fondo crema offset)
3. **Imagen 3–5** — galería
4. Textos en campos del bloque `editorial`

## Deploy

Cambios de plantilla = **backend**. Tras push: `git pull` + reiniciar Node en el servidor.

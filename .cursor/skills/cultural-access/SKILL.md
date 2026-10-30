---
name: cultural-access
description: >-
  Convenciones del proyecto CulturAll Access (React/Vite front + API Node).
  Usar en tareas de promociones, redención/control de acceso, límites por
  tarjeta, dashboard admin, instituciones, newsletter o APIs de este sistema.
---

# CulturAll Access — contexto

## Repos

| Rol | Ruta |
|-----|------|
| Frontend | `C:/Users/chris/OneDrive/Documents/CNL/Cultural-Access` |
| Backend | `C:/Users/chris/OneDrive/Documents/CNL/Cultural-Access-Backend` |

- Front: Vite + React. API base `https://culturallaccess.com/api` (DEV: proxy `/api`).
- Backend: Node en `Cultural-Access-Backend/backend/` (`server.js`, `router/`, `models/`).
- MySQL: tabla `promociones` ya incluye `limitar_uso` (TINYINT) y `limite_uso` (`una_vez` \| `mensual` \| NULL).

## Redención / límites por tarjeta

Front: `Cultural-Access/src/components/Formularios/Redencion.jsx`  
Backend control: `Cultural-Access-Backend/backend/router/controlacceso.js`  
Promos API: `Cultural-Access-Backend/backend/router/promociones.js`

Antes del POST, el front (si hay `tipoPromocion`):

1. Carga promo y lee `limite_uso` / `limitar_uso`.
2. Historial `GET /controlacceso/tarjeta/:numero`.
3. `una_vez` → bloquea si ya existe misma institución+tipo.
4. `mensual` o `limitar_uso=1` → bloquea si ya hubo en el mes actual.
5. Si falla la verificación → no registra.

En DB, si `limite_uso` es NULL y `limitar_uso=0`, **no hay límite** (comportamiento actual de muchas filas).

**Importante:** el dropdown de redención usa el catálogo `tipos_promocion`, pero el tope se lee de la tabla `promociones`. Si solo existe el tipo en catálogo (asignado a la institución) y **no hay fila** en `promociones` con el mismo `institucion` + `tipo_promocion` y `limite_uso`/`limitar_uso`, el sistema **no bloquea**. Crear el tipo no basta: hace falta la promoción (o un UPDATE/INSERT con límite).

Crear/editar promo debe persistir `limite_uso` y `limitar_uso`:
- Front envía ambos en FormData/JSON (`promocionesService.crearPromocion` / `actualizarPromocion*`).
- Backend: `router/promociones.js` normaliza; `models/Promocion.js` **incluye** ambos en `create` (antes se perdían).
- Valores: `una_vez` | `mensual` | null; `limitar_uso` = 1 si hay límite, 0 si no.
- El check server-side (POST `/api/controlacceso`) usa esa config aunque la promo esté inactiva/vencida.

## Newsletter

- Front: `src/components/Dashboard/components/Newsletter/`
- Backend: `backend/router/newsletter.js`, `backend/services/newsletterTemplate.js`
- SQL: `backend/sql/newsletter.sql`
- Skill de diseño: `newsletter-diseno`

## Idioma

Respuestas al usuario en **español**.

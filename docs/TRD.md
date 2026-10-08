# TRD · eventsmc.xyz

## Stack

- **Astro 7** con salida estática (`output: 'static'`, `build.format: 'file'`, `trailingSlash: 'never'`). Cada página se genera como `/ruta.html`, y `cleanUrls` de Vercel la sirve sin extensión, así que las URLs no cambian respecto a la web anterior.
- **Vercel**: `vercel.json` fija framework `astro`, `astro build` y la salida en `dist`. Las funciones de `api/` (sugerencias, solicitudes de acceso y apelaciones) siguen siendo funciones de Vercel en Node y reenvían a webhooks de Discord.
- **Dependencias**: `astro`, `@astrojs/sitemap`, `gsap` y `@fontsource` (Poppins, Inter variable y Roboto Mono). No hay framework de interfaz.

## Datos

| Origen | Cuándo | Uso |
|---|---|---|
| `src/data/site.ts` | Al compilar | Enlaces, productos, estados, precios de Events+ (con los IDs de plan de Paymenter: 37/40, 38/41 y 39/42) y precios del BOT |
| `api.eventsmc.xyz/api/downloads` | Al compilar y cada 60 s con la pestaña visible | Contador de descargas |
| `api.eventsmc.xyz/api/events` | Al compilar | Próximo evento (portada y Calendar) |
| `POST api.eventsmc.xyz/api/downloads/hit` | Al pulsar una descarga | `{ cid }`: id anónimo guardado en `localStorage.ec_dl_id`; el backend espera una hora por persona |

Si la API no responde al compilar, los componentes muestran su estado neutro y no ceros.

## Recursos externos que no se pueden mover

- `public/access-request.js` lo carga calendar.eventsmc.xyz (`window.EventsAccessRequest`). Se sirve con CORS para ese origen.
- `public/splash.js` es la pantalla de arranque compartida. Con movimiento reducido no aparece, y al terminar el logo vuela hasta `.hdr .brand-logo`.
- Otros proyectos enlazan a `icon.png` y `og.png`.

## Rendimiento

- **Imágenes:** `astro:assets` las sirve en WebP con `srcset` y dimensiones. 2,1 MB de PNG pasan a entre 5 y 45 KB por imagen. Solo el hero carga en `eager`.
- **JS:** GSAP (unos 27 KB comprimido) solo en la portada, con `import()`. Las demás páginas llevan entre 1 y 3 KB.
- **CSS:** unos 5 KB comprimido por página. Lo que va en `_astro/` tiene caché `immutable` de un año.
- **Fuentes:** de la propia web, recortadas a latín, con `font-display: swap`.

## Accesibilidad

Enlace para saltar al contenido, menú desplegable tipo disclosure, menú móvil y diálogos con `<dialog>` nativo, errores de formulario asociados a cada campo, `prefers-reduced-motion` y foco compatible con `forced-colors`.

## Despliegue

Rama → preview de Vercel (protegida con su acceso) → merge a `main` → producción. El sitemap se genera en `sitemap-index.xml`, y `/sitemap.xml` se reescribe hacia él.

## Pruebas

No hay test runner. Se usa Chrome sin interfaz por CDP (el script de capturas de la sesión) a 390, 900 y 1440 px, con movimiento reducido emulado y comprobando que no haya errores de consola ni desbordamiento horizontal.

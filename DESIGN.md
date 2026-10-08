# Events · Design System

La línea de diseño de todo Events: eventsmc.xyz, clientes.eventsmc.xyz, el panel y Events Client. Este archivo describe lo que está construido. La fuente de los valores es `src/styles/tokens.css`, y clientes lleva una copia (`events-server/paymenter/theme/css/app.css`).

## Principios

1. **El producto es la ilustración.** Se enseñan capturas reales del launcher, del panel y del calendario. Nada de dibujos genéricos ni de interfaces recreadas que no existen.
2. **Un solo azul pide acción.** `--action` / `--action-solid` aparecen en una sola acción principal por vista. Todo lo demás es neutro.
3. **La atmósfera no se toca.** Los morados y azules intensos (`--nebula-*`, `--rim`) solo están en el cielo de fondo y en el horizonte del planeta. Nunca en botones, enlaces ni texto.
4. **Escala, no elevación.** Los controles responden a la pulsación encogiendo (0,97). Nada se levanta al pasar el ratón.
5. **Todo dato es real.** Las cifras salen de la API (descargas, eventos) o de `src/data/site.ts`. Lo que no existe no se pone.

## Color

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#05060d` | Fondo de todas las páginas |
| `--bg-raised` | `#090b18` | Campos, filas hundidas, cabecera de tabla |
| `--surface` · `-2` · `-3` | `#0d1122` · `#131a30` · `#1b2340` | Paneles, cajas, elementos seleccionados |
| `--text` · `-2` · `-3` | `#f2f4fc` · `#aab2cf` · `#8189ab` | Títulos y texto fuerte · texto · notas (8,9:1 y 5,4:1 sobre `--surface`) |
| `--border` · `-strong` | `rgba(170,182,255,.09)` · `.17` | Separadores y contornos |
| `--action` | `#5b8cff` | Enlaces, foco, estado activo, progreso |
| `--action-solid` | `#4766e6` | Botón principal con texto blanco (4,87:1) |
| `--success` · `--warning` · `--danger` | `#34d17a` · `#f5b03c` · `#f05468` | Estados (siempre con texto) |
| `--p-*` | client, plus, whitelist, blacklist, calendar, bot, allys, hosting | Tono de cada producto: su marca, líneas de 2 px y etiquetas |
| `--nebula-violet` · `--nebula-blue` · `--rim` | `#6b3cff` · `#2348ff` · `#b9a8ff` | Solo atmósfera |

## Tipografía

- **Poppins** 600/700/800 para titulares y cifras grandes. Tracking de −0,02 a −0,035 em.
- **Inter** (variable) para texto e interfaz.
- **Roboto Mono** 500, solo para códigos (`XXXX-XXXX-XXXX`), versiones y comandos.
- Escala fluida: `--fs-display` (2,6–5 rem), `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-lead`, cuerpo de 16 px, `--fs-small` y `--fs-xs`.
- Las fuentes se sirven desde la propia web con `@fontsource`, recortadas a latín.

## Espacio, forma y profundidad

- Espaciado en pasos de 4 px (`--s-1` a `--s-10`). Las secciones usan `.section` (72–136 px) o `.section-tight`.
- Contenedor de 1200 px (`.wrap`) y de 760 px para lectura (`.wrap-narrow`). El margen lateral es `--gutter`.
- Radios: 6 · 10 · 14 · 20 · 28 px y `--r-full`. Los controles van a 10–14 px; los paneles, a 20–28 px.
- Sombras en 4 niveles teñidos de marino (`--shadow-1…4`). El cristal (`backdrop-filter`) solo en la cabecera, los menús y las capas superpuestas.

## Componentes

| Componente | Archivo | Notas |
|---|---|---|
| Botón | `.btn` + `-primary` / `-secondary` / `-ghost`, `-sm` / `-lg` | Altura de 38, 46 o 54 px; icono de 18 px |
| Cabecera | `components/Header.astro` | Menú desplegable de productos (tipo disclosure, Escape y clic fuera) y menú móvil en `<dialog>` |
| Pie | `components/Footer.astro` | Productos, recursos, legal y Enviar una sugerencia |
| Cabecera de página | `components/PageHero.astro` | Marca del producto, título (con línea atenuada opcional), entradilla, acciones, imagen y horizonte |
| Pantallas del producto | `components/HeroStack.astro` | Tres capturas reales en capas, con entrada y paralaje (GSAP) |
| Horizonte | `components/Horizon.astro` | El planeta del logo; solo en aperturas y cierres |
| Lista de funciones | `components/FeatureList.astro` | Filas sobre líneas finas, no tarjetas |
| Pasos | `components/Steps.astro` | Solo cuando el orden es la información |
| Comandos | `components/Commands.astro` | Lista de definiciones en monoespaciada |
| Llamada | `components/Callout.astro` | Una frase y su acción (apelaciones) |
| Diálogo | `dialog.dlg` en `global.css` | `<dialog>` nativo, `@starting-style`, Escape y clic fuera |
| Campo | `.field` + `.input` | Etiqueta encima, error con `aria-describedby` y `aria-invalid` |
| Marca de producto | `.mark` con `--tone` | Fondo al 13 % y borde al 32 % del tono |
| Estado | `.status.on` / `.soon` | Punto de color y texto |
| Icono | `components/Icon.astro` | Trazo de 1,8 px, paths de Lucide; los de marca, rellenos |

## Movimiento

- Tokens: `--t-press` 120 ms, `--t-fast` 180 ms, `--t-base` 240 ms y `--t-slow` 480 ms. Curvas: `--ease-out` (cubic-bezier(.23,1,.32,1)), `--ease-in-out` y `--spring` (el muelle de Events Client).
- **Entre páginas:** View Transitions nativas (`@view-transition { navigation: auto }`). La cabecera se queda quieta y el contenido entra con un fundido y 6 px de desplazamiento.
- **Al aparecer:** `[data-reveal]` hace subir los elementos 14 px en 700 ms, con un retraso escalonado (`--i`). El contenido es visible sin JS.
- **Portada (GSAP):** las capas de `HeroStack` entran en abanico y siguen al puntero con `quickTo`. «Así se vive un evento» sincroniza su reloj con el paso visible (IntersectionObserver).
- **Pantalla de arranque** (`public/splash.js`): el logo se dibuja y vuela hasta la cabecera. Solo sale en la primera página de la pestaña.
- **Movimiento reducido:** sin desplazamientos ni escalas, sin pantalla de arranque y sin GSAP. Los fundidos se mantienen.
- **Prohibido:** animaciones infinitas fuera de una carga, elevación al pasar el ratón y animar acciones de teclado repetidas.

## Accesibilidad

- Enlace para saltar al contenido, un solo `h1` por página y `main#main`.
- Foco visible con `:focus-visible` (2 px en `--action`), que también funciona en `forced-colors`.
- Estados siempre con texto; iconos decorativos con `aria-hidden`.
- Formularios: errores asociados a cada campo y un solo `role="alert"` o `role="status"`.
- Contraste comprobado: texto 4,5:1 como mínimo y botón principal 4,87:1.

## Lo que no se hace

Etiquetas pequeñas encima de cada título, texto con degradado, tarjetas iguales de icono + título + texto como estructura de página, emojis como iconos, monoespaciada decorativa, bordes laterales de color en tarjetas, cristal en el contenido e interfaces de producto inventadas.

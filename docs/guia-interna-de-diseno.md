# Guía interna de diseño

Para quien diseñe o programe algo de Events. La [Guía de marca](../brand/Events-Guia-de-marca.pdf) dice cómo se ve la marca; esta guía, cómo se construye. Los valores están en [DESIGN.md](../DESIGN.md).

## Antes de empezar

- **¿Existe ya la pieza?** Mira `src/components/` y las clases de `src/styles/global.css` antes de crear nada.
- **¿El dato es real?** Precios, planes, enlaces y estados salen de `src/data/site.ts`. Las cifras en directo, de `src/data/live.ts` (al compilar) y `src/scripts/live.ts` (en el navegador). Un número no se escribe a mano en una página.
- **¿Hay producto que enseñar?** Usa una captura real (`src/assets/shots/`) con `<Image>` de `astro:assets`. Si no existe la captura, se hace; no se dibuja una interfaz.

## Tokens y nombres

- Colores, espacios, radios, sombras y tiempos se usan **siempre** como variable (`var(--surface)`), nunca con el valor escrito.
- Nombres de tokens: `--{familia}-{nivel}` (`--text-2`, `--s-5`, `--r-lg`, `--t-fast`) y `--p-{producto}` para los tonos de producto.
- Clases: cortas y descriptivas en la página (`.sys-row`, `.plan-price`). Los componentes usan `<style>` con ámbito propio; lo global vive en `global.css`.
- Un token nuevo se añade primero a `tokens.css`, se documenta en DESIGN.md y se copia a clientes.

## Maquetación

- Contenedor `.wrap` (1200 px) o `.wrap-narrow` (760 px) y márgenes de sección `.section` / `.section-tight`.
- Rejillas con `grid-template-columns` explícitas que pasan a una columna por debajo de 760–980 px. Prueba siempre a 375, 768, 1280 y 1920 px.
- Ritmo: más espacio encima de un título que debajo, y bloques densos alternados con otros tranquilos.
- Las tarjetas son la excepción (planes, licencias). Las listas van en filas sobre líneas finas.

## Jerarquía y texto

- Un `h1` por página. Los títulos dicen algo («Un evento tiene dos lados.»), no son rótulos («Características»).
- Una segunda línea atenuada (`.dim`, `titleDim`) sirve para el matiz. No hay etiquetas encima del título.
- Los textos siguen la regla de Events: conciso, sin explicar lo obvio y sin tranquilizar. El dato concreto vale más que la frase.
- El nombre del producto va completo y separado: «Events Client», nunca «EventsClient».

## Color en la práctica

- Por vista, **un** botón `btn-primary`. Las demás acciones son `btn-secondary` o `btn-ghost`.
- El tono de producto (`--tone`) se pone en el contenedor de la página y lo heredan `.mark`, los iconos de `FeatureList` y los comandos.
- Los estados llevan punto de color **y** texto.

## Movimiento

- Antes de animar algo: ¿explica un cambio, confirma una acción u orienta? Si no, no se anima.
- Al entrar, ease-out; al salir, más rápido. Hover y pulsación en 120–240 ms, siempre con `transition` (que se puede interrumpir) y no con `@keyframes`.
- Los hovers que mueven algo van dentro de `@media (hover: hover) and (pointer: fine)`.
- GSAP solo se usa en la portada y se carga con `import()` cuando hace falta. Para todo lo demás basta CSS.
- Cada animación necesita su versión con `prefers-reduced-motion: reduce`.

## Estados que siempre hay que diseñar

Vacío (con el siguiente paso), cargando, error (qué ha pasado y qué hacer), éxito, deshabilitado, foco y móvil. Los formularios validan en el cliente con los mismos mensajes que la función de `api/`.

## Cosas que evitar

- Etiquetas pequeñas en mayúsculas encima de cada título.
- Texto con degradado.
- Tres tarjetas iguales como sección.
- Emojis como iconos.
- Halos y degradados que laten.
- Elevación al pasar el ratón.
- Cristal sobre el contenido.
- Cifras inventadas, testimonios o logos de clientes sin permiso.
- Recrear una interfaz del producto en vez de capturarla.

## Revisión antes de publicar

1. `npm run build` sin avisos.
2. Capturas a 375, 768 y 1440 px, sin desbordamiento horizontal.
3. Navegar con el teclado por la cabecera, el menú móvil, los diálogos y los formularios.
4. Emular movimiento reducido.
5. Lighthouse en móvil: LCP por debajo de 2 s y CLS por debajo de 0,05.
6. La pregunta final: ¿parece hecho por un equipo de producto o generado? Si es lo segundo, otra pasada.

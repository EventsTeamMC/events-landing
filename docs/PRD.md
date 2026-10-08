# PRD · eventsmc.xyz

## Problema

La web anterior no explicaba Events como un ecosistema. Además:
- Parecía hecha por una IA: emojis, degradados y las mismas tarjetas en todas las páginas.
- Se contradecía: «Todo es gratis», productos «En desarrollo» que ya estaban publicados y precios que no cuadraban.
- Repetía la cabecera y el pie a mano en 17 archivos.

Los planes se vendían también en clientes.eventsmc.xyz, con otra copia del mismo texto.

## Para quién

- **Studios y organizadores** de eventos de Minecraft, que pagan Events+ y Events BOT.
- **Jugadores**, que descargan Events Client y entran con un código.

La portada se diseña para los dos públicos a partes iguales.

## Objetivos

1. Que un studio entienda en un pantallazo qué es Events, para quién es y qué hacer después.
2. Que un jugador descargue Events Client sin buscar.
3. Que eventsmc.xyz sea el único sitio donde se publican los planes, y que cada «Contratar» lleve directo a la compra con el periodo elegido.
4. Una línea de diseño reutilizable en clientes y en el panel.

## Qué se ha construido

| Página | Contenido |
|---|---|
| `/` | Hero con capturas reales (Events Client, Panel, Calendar), los dos lados de un evento, la noche de un evento hora a hora, el directorio de productos, datos en directo (descargas y próximo evento), Events+ y cierre |
| `/client` | El launcher con capturas reales, funciones, pasos y el panel para studios |
| `/download` | Detección del sistema, la descarga principal, todas las plataformas y el canal Beta |
| `/plus` | Precios: Mensual o Trimestral, planes 1, 3 y 5, Custom y SelfHosted, plan gratuito, ventajas, comparativa y preguntas |
| `/bot` | Licencias, módulos con precio y hosting de bots, con enlace directo a la compra |
| `/whitelist`, `/blacklist`, `/calendar` | Producto, funciones, pasos, comandos y privacidad |
| `/appeal` | Formulario de apelación accesible |
| Legales y `/404` | Texto legal sin cambios, plantilla común y un índice |

## Fuera de alcance

Varios idiomas, un blog o novedades, testimonios y logos de studios. La lista de studios que aceptan salir llegará más adelante.

## Métricas

- Clics en «Descargar» (contador propio).
- Clics en «Contratar» hacia clientes.
- LCP en móvil por debajo de 2 s y CLS por debajo de 0,05.

## Pendiente

- Datos del titular en `/plus/condiciones`.
- Lista de studios con permiso para aparecer.
- Nombre del futuro studio de creación de eventos (hoy aparece como «Events Team» en algunos eventos de Calendar).

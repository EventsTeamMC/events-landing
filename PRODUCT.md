# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro, decidido por Raül el 7 de octubre de 2026. Genera la web estática y se despliega en Vercel. Las funciones serverless de `api/` (sugerencias, solicitudes de acceso y apelaciones, que se reenvían a webhooks de Discord) se mantienen.

## Users

La portada se diseña **a partes iguales para dos públicos**:

- **Studios y organizadores**: equipos hispanohablantes que montan eventos de Minecraft, a veces con cientos de jugadores. Gestionan sus instancias en panel.eventsmc.xyz y son quienes pagan Events+ y Events BOT.
- **Jugadores**: entran a los eventos con Events Client y nunca pagan nada. Casi siempre llegan porque su studio les ha pasado un enlace o un código.

Hay audiencias secundarias:

- **Staff de comunidades de Discord**: usan Events Whitelist y Events Blacklist.
- **Gente que busca qué jugar**: consulta calendar.eventsmc.xyz.

## Product Purpose

Events es el ecosistema para los eventos de Minecraft. Un studio prepara la instancia exacta de su evento: versión, loader, mods y archivos. Sus jugadores entran con un código, sin instalar nada a mano. El studio lo controla todo desde un panel: acceso, whitelist, baneos, jugadores en directo y estadísticas.

La landing consigue su objetivo cuando un studio entiende que puede montar su próximo evento sobre Events, y cuando un jugador descarga el launcher y entra.

## Positioning

**Se entra con un código.** El jugador abre Events Client, escribe el código del evento y la instancia queda lista para jugar. Detrás hay un panel donde el studio decide quién entra y qué se ejecuta. El resto del ecosistema (Whitelist, Blacklist, Calendar, BOT) se conecta a ese mismo evento.

(Raül delegó la frase del posicionamiento. Este eje lo propuso el diseño y está pendiente de que Raül lo valide al ver la dirección.)

## Operating Context

- Los eventos se anuncian en Discord. Los studios tienen servidores de Discord con sus propios bots.
- Webs y dominios: panel.eventsmc.xyz (panel de studios), clientes.eventsmc.xyz (Paymenter: pagos, servicios y facturas), calendar.eventsmc.xyz, status.eventsmc.xyz, hosting.eventsmc.xyz (Pterodactyl, para bots) y api.eventsmc.xyz.
- Descargas de Windows (x64 y ARM64), macOS (universal) y Linux (AppImage). Se publican en GitHub Releases (`EventsTeamMC/events-client-releases`).

## Capabilities and Constraints

**Productos disponibles**
- **Events Client**: launcher de escritorio, versión 1.0.x. Admite Vanilla, Forge, Fabric, NeoForge y Quilt. Las cuentas pueden ser Microsoft u offline, vinculadas a Discord.
- **Panel** (panel.eventsmc.xyz): importación de `.mrpack`, editor de archivos, códigos, whitelist, baneos por jugador o por IP, jugadores en directo y personalización de marca.
- **Events Whitelist** y **Events Blacklist**: bots de Discord. Blacklist es gratis para siempre y guarda con un hash HMAC el servidor que reporta.
- **Events Calendar**: calendario público de eventos.
- **Events+**: suscripción por studio.
- **Events BOT**: bot de Discord propio, con licencia de pago único, módulos y hosting a 2 €/mes. También hay hosting de bots genérico.

**Próximamente**: Events Allys, el hosting de Minecraft y los mods protegidos en RAM.
**Eliminados**: "Custom Bot" y "Events Panel", porque ya existen como Events BOT y panel.

**Precios de Events+**
- La fuente es `events-server/backend/plans.js`.
- Events+ 1, 3 y 5 cuestan 0,99, 1,99 y 3,99 € al mes. El trimestre cuesta el triple.
- Custom y SelfHosted se piden por Discord.
- Events+ 5 es gratis para todos los studios hasta el 1 de enero de 2027.
- El plan gratuito tiene límites desde el 1 de octubre de 2026: 1 instancia, 500 MB, 2 cuentas de staff y 100 jugadores a la vez por studio.

**Compra**: los planes se publican **solo en la landing**. Cada botón "Contratar" lleva directamente a la compra en clientes.eventsmc.xyz (`/products/<categoría>/<producto>/checkout?plan=<id>`). clientes.eventsmc.xyz no tiene escaparate propio.

**Datos en directo**
- `api.eventsmc.xyz/api/downloads` da el total de descargas.
- `api.eventsmc.xyz/api/events` da los eventos públicos: nombre, fecha, studio, imagen y color.

**Idioma**: solo español.

**Pendiente**: los datos legales del titular en `plus/condiciones`, que todavía tienen placeholders.

## Brand Commitments

- El nombre se escribe **Events**, y los productos **Events Client**, **Events+**, **Events BOT**, etc. Siempre con espacio, nunca "EventsClient".
- El logo es un planeta con anillo, monocromo. La pantalla de arranque, que dibuja el logo, debe aparecer en todas las webs de Events (lo pidió Raül).
- El diseño de Events Client gusta mucho y es la referencia de línea, pero no hay que copiarlo.
- Debe haber una sola línea de diseño para todo Events: landing, área de clientes y panel.
- Los textos son concisos y profesionales, y no explican lo obvio (ver la regla de textos de Raül).
- No había guía de marca: se crea ahora. La guía de un antiguo socio (Astrol Nodes) solo sirve como modelo de formato.

## Evidence on Hand

- Hay 1180 descargas, con contador en directo.
- Hay eventos públicos reales en Calendar.
- **Studios que han confirmado que pueden aparecer**: Events Team, L0LAME Studio, Caos Remake Studio, Paella Club, NexoStudio y superstrellaa. De momento la web solo muestra cifras; la lista de studios con permiso llegará más adelante.
- Capturas reales del launcher y del panel en `public/shots/`.
- **No hay testimonios, logos de terceros, casos de estudio ni prensa.** No se inventan.

## Product Principles

1. **Enseñar el producto, no describirlo.** Una interfaz real explica más que un párrafo.
2. **Cada dato, real y en directo**, o no se pone.
3. **El jugador no paga nunca.** Events+ es para quien organiza.
4. **Cuesta lo mismo entrar a un evento con 10 jugadores que con 500.**
5. **Una sola línea en todo Events.** Quien pasa de la web al launcher o al panel no debe notar el salto.

## Accessibility & Inclusion

WCAG 2.2 AA como base: navegable con teclado, `prefers-reduced-motion` en todo (también en la pantalla de arranque), contraste mínimo de 4,5:1 en texto y formularios con errores asociados a cada campo.

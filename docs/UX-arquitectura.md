# Arquitectura UX · eventsmc.xyz

## Navegación

- **Cabecera:** el logo (a `/`), Productos (desplegable con Client, Panel, Whitelist, Blacklist, Calendar y BOT), Events+ y Calendario. A la derecha, «Área de clientes» (enlace discreto) y «Descargar» (el único botón azul).
- **Móvil:** el menú se abre en un `<dialog>` con la lista de productos, Events+ y, abajo, Descargar y Área de clientes.
- **Pie:** Productos, Recursos (descargas, área de clientes, apelaciones, calendario y estado del servicio), Legal, Discord y Enviar una sugerencia.

## Relato de la portada

1. **Qué es:** «Todo lo que necesita un evento de Minecraft.», con las capturas reales de Events Client, el Panel y Calendar.
2. **Para quién:** «Un evento tiene dos lados.» A un lado quien juega, al otro quien organiza; el código de acceso los une.
3. **Cómo funciona:** «Así se vive un evento con Events.» De la semana antes al día después, con el producto que trabaja en cada momento.
4. **Qué puede hacer:** «Cada pieza funciona sola.» Directorio de productos, con el hosting y Allys como «Próximamente».
5. **Por qué confiar:** descargas en directo, el próximo evento real, la privacidad de Blacklist y el estado del servicio.
6. **Para el studio:** Events+ desde 0,99 €/mes, con enlace a los planes.
7. **Siguiente paso:** Descargar, Abrir el panel o Discord.

## Recorridos

| Quién | Entrada | Camino |
|---|---|---|
| Jugador | Enlace de su studio, buscador | `/` o `/client` → «Descargar» → `/download` (detecta el sistema) |
| Studio nuevo | `/` | «Organizo eventos» → «Un evento tiene dos lados» → Abrir el panel o `/plus` |
| Studio que paga | `/plus` | «Contratar Events+ N» → `clientes…/products/events-plus/events-plus-N/checkout?plan=ID` |
| Bot propio | `/bot` | Contratar → `clientes…/products/hosting/events-bot/checkout` |
| Sancionado | Launcher, bot, pie | `/appeal?type=launcher\|blacklist\|discord` (la categoría llega ya marcada) |

## Relación con clientes.eventsmc.xyz

La web vende y clientes cobra y gestiona. clientes no tiene escaparate:
- `/` lleva a la cuenta.
- Las categorías vuelven a esta web (`/plus#planes`, `/bot#precios`).
- Cada producto abre su compra directamente.

## Estados

- **Datos en directo:** se pinta el valor del momento de la compilación y luego se refresca. Si no hay eventos, se enlaza al calendario.
- **Formularios:** error junto a cada campo, mensaje general en `role="alert"` o `role="status"` y confirmación de envío. Sin conexión, el mensaje lo dice.
- **Movimiento reducido:** todo el contenido sigue visible y no aparece la pantalla de arranque.

# events-landing

La web pública de Events, [eventsmc.xyz](https://www.eventsmc.xyz). Está hecha con Astro, se genera como HTML estático y se despliega en Vercel.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/
npm run preview   # sirve dist/
```

## Estructura

```
src/
  styles/tokens.css    tokens de diseño de Events (fuente única; clientes lleva una copia)
  styles/global.css    base, botones, formularios, diálogos y transiciones de página
  data/site.ts         enlaces, productos, estados, precios e IDs de planes de Paymenter
  data/live.ts         datos en directo de api.eventsmc.xyz leídos al compilar
  components/          Header, Footer, Logo, Icon, LauncherDemo, Horizon, PageHero…
  layouts/             Base (todas las páginas) y Legal (textos legales)
  pages/               una página por URL; las URLs no cambian
  content/legal/       textos legales tal cual, en HTML
  scripts/             JS de cliente: portada (GSAP) y contador de descargas
  assets/shots/        capturas; Astro las sirve en WebP con srcset
public/                se sirve tal cual: splash.js, access-request.js, icon.png, og.png…
api/                   funciones de Vercel: sugerencias, solicitudes de acceso, apelaciones
```

## Reglas que no se ven en el código

- **Precios y enlaces:** salen solo de `src/data/site.ts`. Los números de Events+ los fija `events-server/backend/plans.js`; si no coinciden, manda ese archivo. Cada «Contratar» lleva directamente al checkout de clientes.eventsmc.xyz con el plan mensual (`?plan=<id>`). De momento no se vende trimestral ni anual.
- **`public/access-request.js`:** también lo carga calendar.eventsmc.xyz. No se borra ni se renombra.
- **`public/splash.js`:** es la pantalla de arranque compartida con el panel. Al terminar, el logo vuela hasta el de la cabecera. Con movimiento reducido no aparece.
- **Variables de entorno en Vercel:** `SUGGESTIONS_WEBHOOK_URL`, `ACCESS_WEBHOOK_URL` y `APPEAL_WEBHOOK_URL`.
- **`plus/condiciones`:** todavía tiene los datos del titular sin rellenar.

La documentación de diseño está en `PRODUCT.md`, en `DESIGN.md` y en `docs/`.

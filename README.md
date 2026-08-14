# Events — Landing

Sitio estático e **independiente** (sin backend, sin build step). Pensado para Vercel.
Es un *hub* multi-producto: la home lista todos los productos del ecosistema Events y cada
uno tiene su propia página de presentación.

```
landing/
├── vercel.json        # headers + cleanUrls
├── api/               # funciones serverless (Node) — el único "backend" del sitio
│   ├── suggest.js         # buzón de sugerencias anónimo (home)
│   ├── access-request.js  # solicitud de acceso al panel del calendario
│   └── appeal.js          # apelaciones de baneos (/appeal)
└── public/            # ← lo que se publica
    ├── index.html     # hub: todos los productos (Blacklist, Client, y "Próximamente")
    ├── blacklist.html # presentación de Events Blacklist (/blacklist)
    ├── client.html    # presentación de Events Client (/client)
    ├── download.html  # descargas de Events Client (/download)
    ├── appeal.html    # apelar un baneo: Discord, launcher o Blacklist (/appeal)
    ├── appeal.js      # lógica del formulario de apelaciones
    ├── blacklist/     # legales de Blacklist (terms, privacy)
    ├── styles.css
    ├── main.js
    ├── icon.png
    ├── logo.svg
    └── shots/         # capturas reales del launcher/panel
```

> `cleanUrls: true` sirve `client.html` en `/client`, `blacklist.html` en `/blacklist`, etc.

## Variables de entorno (Vercel → Settings → Environment Variables)

Las URLs de los webhooks **solo** viven aquí: nunca en el código ni en el navegador.
Si falta una, su formulario responde un 500 con un mensaje claro en vez de romperse.

| Variable | Para qué |
|---|---|
| `SUGGESTIONS_WEBHOOK_URL` | Buzón de sugerencias de la home (`/api/suggest`) |
| `ACCESS_WEBHOOK_URL` | Solicitudes de acceso al panel del calendario (`/api/access-request`) |
| `APPEAL_WEBHOOK_URL` | Apelaciones de baneos de `/appeal` (`/api/appeal`) |

Todas son webhooks de Discord (`https://discord.com/api/webhooks/…`). Después de
añadirlas o cambiarlas hay que **redeploy**: las funciones leen `process.env` al arrancar.

### Apelaciones (`/appeal`)

Un solo formulario para las tres categorías: baneo del Discord de Events, sanción de
Events Client y baneo falso en la red de Blacklist. Se puede enlazar con la categoría
ya elegida: `/appeal?type=discord`, `?type=launcher`, `?type=blacklist`.

Límite de **una apelación cada 5 minutos por IP** (`WINDOW_MS` en `api/appeal.js`),
más un campo trampa anti-bots y `allowed_mentions: []` para que ningún texto de un
desconocido pueda pingar al canal.

## Desplegar en Vercel

**Opción A — desde el dashboard (más fácil)**
1. vercel.com → *Add New… → Project* → importa este repo.
2. **Root Directory**: `landing`
3. **Framework Preset**: `Other`
4. Build Command: *(vacío)* · Output Directory: `public`
5. Deploy.

**Opción B — CLI**
```bash
npm i -g vercel
cd landing
vercel            # preview
vercel --prod     # producción
```

## Antes de publicar

Edita `public/main.js`:
- `DISCORD` → tu invitación real de Discord.
- `RELEASES` → si el repo de releases cambia.

> El botón de descarga detecta el SO del visitante y apunta a la *release* más
> reciente. **Si el repo de GitHub es privado, ese enlace dará 404 a los
> visitantes** — usa un repo público solo para releases (ver más abajo).

## Actualizar las capturas

```bash
cp ../docs/screenshots/*.png public/shots/
```

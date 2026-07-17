# Events Client — Landing

Sitio estático e **independiente** (sin backend, sin build step). Pensado para Vercel.

```
landing/
├── vercel.json        # headers + cleanUrls
└── public/            # ← lo que se publica
    ├── index.html
    ├── styles.css
    ├── main.js
    ├── icon.png
    ├── logo.svg
    └── shots/         # capturas reales del launcher/panel
```

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

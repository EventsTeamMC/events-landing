// Vercel serverless function (Node runtime). Recibe una solicitud de acceso al
// panel de Events (para publicar en el calendario) y la reenvía a un webhook de
// Discord, donde se aprueba manualmente.
//
// IMPORTANTE: la URL del webhook vive SOLO en la variable de entorno
// ACCESS_WEBHOOK_URL (configurada en el proyecto de Vercel), nunca en el código
// ni en el navegador. Es la misma razón que en suggest.js: cualquiera puede leer
// este archivo, pero no puede extraer la URL ni usarla para spamear el canal.

const WEBHOOK_URL = process.env.ACCESS_WEBHOOK_URL;

// Rate limit best-effort en memoria: se reinicia en cada cold start, pero
// mientras la instancia esté caliente frena reenvíos rápidos desde la misma IP.
const lastSubmission = new Map();
const WINDOW_MS = 60_000;

// El calendario vive en otro subdominio, así que necesita CORS explícito.
const ALLOWED_ORIGINS = [
  'https://calendar.eventsmc.xyz',
  'https://eventsmc.xyz',
  'https://www.eventsmc.xyz',
];

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  if (!WEBHOOK_URL) { res.status(500).json({ error: 'Las solicitudes de acceso no están configuradas todavía' }); return; }

  const b = req.body || {};

  // Campo trampa: invisible para personas, los bots rellenan todo lo que ven.
  // Si viene relleno fingimos éxito y no enviamos nada.
  if (str(b.website, 100)) { res.status(200).json({ ok: true }); return; }

  const discord = str(b.discord, 60);
  const studio = str(b.studio, 80);
  const members = String(b.members || '').replace(/[^\d]/g, '').slice(0, 9);
  const invite = str(b.invite, 200);
  const note = str(b.note, 700);

  if (discord.length < 2) { res.status(400).json({ error: 'Escribe tu nombre de Discord' }); return; }
  if (studio.length < 2) { res.status(400).json({ error: 'Escribe el nombre de tu studio' }); return; }
  if (!members) { res.status(400).json({ error: 'Indica cuántos miembros tenéis' }); return; }
  // El enlace se publica en un canal: solo invitaciones reales de Discord.
  if (!/^https:\/\/(discord\.gg|discord\.com\/invite)\/[\w-]+$/i.test(invite)) {
    res.status(400).json({ error: 'El enlace debe ser una invitación de Discord (https://discord.gg/…)' });
    return;
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const last = lastSubmission.get(ip);
  if (last && now - last < WINDOW_MS) {
    res.status(429).json({ error: 'Ya has enviado una solicitud hace un momento. Espera un minuto.' });
    return;
  }
  lastSubmission.set(ip, now);

  try {
    const r = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Solicitudes de acceso',
        avatar_url: 'https://eventsmc.xyz/icon.png',
        // Texto libre de un desconocido: nunca debe poder disparar @everyone.
        allowed_mentions: { parse: [] },
        embeds: [{
          title: '📥 Solicitud de acceso al panel',
          color: 0x22d3ee,
          fields: [
            { name: 'Discord', value: discord, inline: true },
            { name: 'Studio', value: studio, inline: true },
            { name: 'Miembros', value: members, inline: true },
            { name: 'Servidor', value: invite, inline: false },
            ...(note ? [{ name: 'Mensaje', value: note, inline: false }] : []),
          ],
          footer: { text: 'Events Calendar · aprobar manualmente' },
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    if (!r.ok) { res.status(502).json({ error: 'No se pudo enviar la solicitud' }); return; }
    res.status(200).json({ ok: true });
  } catch {
    res.status(502).json({ error: 'No se pudo enviar la solicitud' });
  }
};

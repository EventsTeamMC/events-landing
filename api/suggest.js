// Vercel serverless function (Node runtime). Recibe una sugerencia anónima desde
// el formulario del landing y la reenvía a un webhook de Discord.
//
// IMPORTANTE: la URL del webhook vive SOLO en la variable de entorno
// SUGGESTIONS_WEBHOOK_URL (configurada en el proyecto de Vercel), nunca en el
// código ni en el navegador. Así, aunque cualquiera puede leer el código fuente de
// este archivo, no puede extraer la URL real ni usarla para spamear el canal.

const WEBHOOK_URL = process.env.SUGGESTIONS_WEBHOOK_URL;

// Rate limit best-effort en memoria: se reinicia con cada cold start de la función,
// pero mientras la instancia esté caliente frena reenvíos rápidos desde la misma IP.
const lastSubmission = new Map();
const WINDOW_MS = 20_000;
const MAX_LEN = 500;
const MIN_LEN = 3;

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  if (!WEBHOOK_URL) {
    res.status(500).json({ error: 'El buzón de sugerencias no está configurado todavía' });
    return;
  }

  const body = req.body || {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  // Campo trampa: invisible para personas, los bots de formularios suelen rellenar
  // todos los campos que encuentran. Si viene relleno, fingimos éxito sin enviar nada.
  const honeypot = typeof body.website === 'string' ? body.website.trim() : '';
  if (honeypot) {
    res.status(200).json({ ok: true });
    return;
  }

  if (message.length < MIN_LEN || message.length > MAX_LEN) {
    res.status(400).json({ error: `El mensaje debe tener entre ${MIN_LEN} y ${MAX_LEN} caracteres` });
    return;
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const last = lastSubmission.get(ip);
  if (last && now - last < WINDOW_MS) {
    res.status(429).json({ error: 'Espera unos segundos antes de enviar otra sugerencia' });
    return;
  }
  lastSubmission.set(ip, now);

  try {
    const discordRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Sugerencias Events',
        avatar_url: 'https://eventsmc.xyz/icon.png',
        // allowed_mentions vacío: el mensaje es texto libre de un desconocido, así
        // que nunca debe poder disparar un @everyone/@here ni pingar a nadie.
        allowed_mentions: { parse: [] },
        content: message.slice(0, 1900),
      }),
    });

    if (!discordRes.ok) {
      res.status(502).json({ error: 'No se pudo enviar la sugerencia' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch {
    res.status(502).json({ error: 'No se pudo enviar la sugerencia' });
  }
};

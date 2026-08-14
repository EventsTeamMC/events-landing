// Vercel serverless function (Node runtime). Recibe una apelación de baneo
// (Discord de Events, Events Client o la red de Events Blacklist) desde
// /appeal y la reenvía a un webhook de Discord, donde el staff la revisa.
//
// IMPORTANTE: la URL del webhook vive SOLO en la variable de entorno
// APPEAL_WEBHOOK_URL (configurada en el proyecto de Vercel), nunca en el código
// ni en el navegador. Misma razón que en suggest.js y access-request.js:
// cualquiera puede leer este archivo, pero no puede extraer la URL ni usarla
// para spamear el canal.

const WEBHOOK_URL = process.env.APPEAL_WEBHOOK_URL;

// Rate limit best-effort en memoria: se reinicia en cada cold start, pero
// mientras la instancia esté caliente frena reenvíos rápidos desde la misma IP.
// Una apelación no es un formulario que se rellene dos veces seguidas: 5 minutos
// no molestan a nadie legítimo y sí frenan a quien insiste.
const lastSubmission = new Map();
const WINDOW_MS = 5 * 60_000;
const MAX_TRACKED_IPS = 5000;

const CATEGORIES = {
  discord: {
    label: 'Baneo del Discord de Events',
    emoji: '💬',
    color: 0x5865f2,
  },
  launcher: {
    label: 'Sanción en Events Client',
    emoji: '🎮',
    color: 0x5b8cff,
  },
  blacklist: {
    label: 'Baneo falso en Events Blacklist',
    emoji: '🛡️',
    color: 0xf0456b,
  },
};

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// El texto lo escribe un desconocido y acaba dentro de un embed: cortamos los
// caracteres que romperían el formato o simularían menciones/enlaces del staff.
const clean = (s) => s.replace(/[`*_~|]/g, '').replace(/\s{3,}/g, '  ');

// La tabla de rate limit crece con cada IP nueva; sin esto una instancia caliente
// acabaría reteniendo memoria indefinidamente.
function prune(now) {
  if (lastSubmission.size < MAX_TRACKED_IPS) return;
  for (const [ip, t] of lastSubmission) {
    if (now - t > WINDOW_MS) lastSubmission.delete(ip);
  }
  if (lastSubmission.size >= MAX_TRACKED_IPS) lastSubmission.clear();
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  if (!WEBHOOK_URL) { res.status(500).json({ error: 'Las apelaciones no están configuradas todavía' }); return; }

  const b = req.body || {};

  // Campo trampa: invisible para personas, los bots rellenan todo lo que ven.
  // Si viene relleno fingimos éxito y no enviamos nada.
  if (str(b.website, 100)) { res.status(200).json({ ok: true }); return; }

  const category = str(b.category, 20);
  const cat = CATEGORIES[category];
  if (!cat) { res.status(400).json({ error: 'Elige qué tipo de baneo quieres apelar' }); return; }

  const discord = str(b.discord, 60);
  const discordId = String(b.discordId || '').replace(/[^\d]/g, '').slice(0, 20);
  const reason = str(b.reason, 300);
  const appeal = str(b.appeal, 1500);
  const when = str(b.when, 60);
  const evidence = str(b.evidence, 300);
  const mcnick = str(b.mcnick, 16);
  const guild = str(b.guild, 100);

  if (discord.length < 2) { res.status(400).json({ error: 'Escribe tu usuario de Discord' }); return; }
  // Un ID de Discord es un snowflake: 17-20 dígitos. Sin él no se puede
  // localizar el baneo, así que no aceptamos apelaciones sin ID.
  if (!/^\d{17,20}$/.test(discordId)) {
    res.status(400).json({ error: 'Tu ID de Discord debe ser el número de 17-20 dígitos (activa el Modo desarrollador para copiarlo)' });
    return;
  }
  if (reason.length < 2) { res.status(400).json({ error: 'Indica qué motivo te dieron (si no lo sabes, escríbelo)' }); return; }
  if (appeal.length < 40) { res.status(400).json({ error: 'Explica tu apelación con algo más de detalle (mínimo 40 caracteres)' }); return; }
  if (category === 'launcher' && !/^[A-Za-z0-9_]{3,16}$/.test(mcnick)) {
    res.status(400).json({ error: 'Escribe tu nick de Minecraft (3-16 caracteres, sin espacios)' });
    return;
  }
  if (category === 'blacklist' && guild.length < 2) {
    res.status(400).json({ error: 'Indica en qué servidor te banearon (nombre o ID)' });
    return;
  }
  // El enlace se publica en un canal del staff: solo http(s), nada de javascript:
  if (evidence && !/^https?:\/\/[^\s]+$/i.test(evidence)) {
    res.status(400).json({ error: 'El enlace de pruebas debe empezar por https://' });
    return;
  }
  if (b.agree !== true) { res.status(400).json({ error: 'Confirma que lo que cuentas es cierto' }); return; }

  const ip = getClientIp(req);
  const now = Date.now();
  const last = lastSubmission.get(ip);
  if (last && now - last < WINDOW_MS) {
    // El mensaje no dice cuánto queda ni cuál es la ventana: ese dato solo le
    // sirve a quien está midiendo cada cuánto puede reenviar.
    res.status(429).json({ error: 'Ya has enviado una apelación hace poco. Inténtalo de nuevo más tarde.' });
    return;
  }
  prune(now);
  lastSubmission.set(ip, now);

  const fields = [
    { name: 'Usuario', value: clean(discord), inline: true },
    { name: 'ID de Discord', value: discordId, inline: true },
    { name: 'Categoría', value: cat.label, inline: true },
  ];
  if (mcnick && category === 'launcher') fields.push({ name: 'Nick de Minecraft', value: clean(mcnick), inline: true });
  if (guild && category === 'blacklist') fields.push({ name: 'Servidor que le baneó', value: clean(guild), inline: true });
  if (when) fields.push({ name: '¿Cuándo?', value: clean(when), inline: true });
  fields.push({ name: 'Motivo que le dieron', value: clean(reason), inline: false });
  if (evidence) fields.push({ name: 'Pruebas', value: evidence, inline: false });

  try {
    const r = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Apelaciones Events',
        avatar_url: 'https://eventsmc.xyz/icon.png',
        // Texto libre de un desconocido: nunca debe poder disparar @everyone.
        allowed_mentions: { parse: [] },
        embeds: [{
          title: `${cat.emoji} Apelación · ${cat.label}`,
          // La apelación va en la descripción y no en un field: los fields se
          // cortan a 1024 caracteres y aquí caben los 1500 que acepta el form.
          description: clean(appeal),
          color: cat.color,
          fields,
          footer: { text: 'Events · revisar y responder por Discord' },
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    if (!r.ok) { res.status(502).json({ error: 'No se pudo enviar la apelación' }); return; }
    res.status(200).json({ ok: true });
  } catch {
    res.status(502).json({ error: 'No se pudo enviar la apelación' });
  }
};

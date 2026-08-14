/* Access request dialog.
 *
 * Studios are approved by hand, so nothing here grants access — it only sends a
 * request to a Discord channel where a human decides. Shared by the landing and
 * by calendar.eventsmc.xyz (which loads it cross-origin), so it must not assume
 * anything about the surrounding page beyond the CSS variables.
 *
 * Any element with [data-request-access] opens it.
 */
(function () {
  // www, not the apex: the apex 308-redirects, and a CORS preflight that gets
  // redirected fails outright — the calendar calls this cross-origin.
  var ENDPOINT = 'https://www.eventsmc.xyz/api/access-request';

  /* The widget ships its OWN styles.
   *
   * These rules used to live in the landing's stylesheet, which the calendar
   * never loads — so on calendar.eventsmc.xyz the dialog rendered as raw,
   * unstyled HTML. A cross-origin widget cannot assume the host page has its
   * CSS; carrying it here is the only way it looks the same everywhere.
   * Values are literal rather than var(--…) for exactly the same reason. */
  var CSS = [
    '.ar-veil{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;',
    'background:rgba(4,6,12,.72);backdrop-filter:blur(6px);overflow-y:auto;',
    'font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55}',
    '.ar-modal{position:relative;width:min(520px,100%);max-height:92vh;overflow-y:auto;background:#111729;',
    'border:1px solid #2a3552;border-radius:16px;padding:28px 26px;box-shadow:0 30px 80px rgba(0,0,0,.6);color:#eef2fb}',
    '.ar-modal *{box-sizing:border-box}',
    '.ar-modal h2{font-family:"Outfit",system-ui,sans-serif;font-size:23px;margin:0 0 6px;font-weight:800;color:#eef2fb}',
    '.ar-sub{color:#93a0bd;font-size:14px;margin:0 0 20px}',
    '.ar-x{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:8px;background:#1e2740;',
    'border:1px solid #2a3552;color:#eef2fb;cursor:pointer;font-size:14px;line-height:1;padding:0}',
    '.ar-x:hover{border-color:#22d3ee;color:#67e8f9}',
    '.ar-f{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}',
    '.ar-f>span{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#5f6b8a}',
    '.ar-f input,.ar-f textarea{padding:11px 13px;background:#0b1020;border:1px solid #2a3552;border-radius:10px;',
    'color:#eef2fb;font-size:14px;font-family:inherit;resize:vertical;width:100%}',
    '.ar-f input:focus,.ar-f textarea:focus{outline:none;border-color:#22d3ee;box-shadow:0 0 0 3px rgba(34,211,238,.16)}',
    '.ar-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important}',
    '.ar-msg{min-height:18px;font-size:13px;margin-bottom:6px}',
    '.ar-msg.bad{color:#ff8080}',
    '.ar-send{width:100%;padding:13px;border-radius:10px;border:0;cursor:pointer;font-weight:700;font-size:15px;',
    'font-family:inherit;background:linear-gradient(135deg,#67e8f9,#22d3ee);color:#04222a}',
    '.ar-send:hover{filter:brightness(1.06)}',
    '.ar-send:disabled{opacity:.6;cursor:default}',
    '.ar-alt{background:#1e2740!important;color:#eef2fb!important;margin-top:10px}',
    '.ar-alt:hover{background:#26304d!important}',
    '.ar-done{text-align:center;padding:10px 0}',
    '.ar-done-ic{font-size:40px;margin-bottom:10px}',
    '.ar-done h3{font-family:"Outfit",system-ui,sans-serif;font-size:19px;margin:0 0 8px}',
    '.ar-done p{color:#93a0bd;font-size:14px;margin:0 0 18px}',
    // Motion. The blur and the scale animate together so the veil reads as a
    // material arriving rather than a grey box fading in, and the dialog leaves
    // along the path it came by instead of vanishing — if it grew out of the
    // middle of the screen, that is where it has to shrink back to.
    '@keyframes ar-veil-in{from{opacity:0;backdrop-filter:blur(0px);-webkit-backdrop-filter:blur(0px)}',
    'to{opacity:1;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}}',
    '@keyframes ar-veil-out{from{opacity:1;backdrop-filter:blur(6px)}to{opacity:0;backdrop-filter:blur(0px)}}',
    '@keyframes ar-card-in{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}',
    '@keyframes ar-card-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(16px) scale(.96)}}',
    // Enter and exit are the same curve read in opposite directions, so the way
    // back retraces the way in.
    '.ar-veil{animation:ar-veil-in .2s cubic-bezier(.32,.72,0,1) both}',
    '.ar-modal{animation:ar-card-in .34s cubic-bezier(.32,.72,0,1) both}',
    '.ar-veil.ar-out{animation:ar-veil-out .2s cubic-bezier(1,0,.68,.28) both}',
    '.ar-veil.ar-out .ar-modal{animation:ar-card-out .24s cubic-bezier(1,0,.68,.28) both}',
    '.ar-send,.ar-x{transition:transform .1s cubic-bezier(.32,.72,0,1),filter .13s,background .13s,border-color .13s}',
    '.ar-send:active,.ar-x:active{transform:scale(.97)}',
    '.ar-f input,.ar-f textarea{transition:border-color .14s,box-shadow .14s,background .14s}',
    '@keyframes ar-pop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}',
    '.ar-done-ic{display:inline-block;animation:ar-pop .45s cubic-bezier(.16,1,.3,1) both}',
    // Reduced motion keeps the fade — the thing that says something happened —
    // and drops only the travel.
    '@media (prefers-reduced-motion:reduce){.ar-modal,.ar-done-ic{animation:none!important}',
    '.ar-veil,.ar-veil.ar-out{animation-duration:.12s!important}}',
    '@media (max-width:520px){.ar-modal{padding:22px 18px}}',
  ].join('');
  function ensureStyles() {
    if (document.getElementById('ar-styles')) return;
    var st = document.createElement('style');
    st.id = 'ar-styles';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var onKey = null;

  function close() {
    var v = document.getElementById('ar-veil');
    if (onKey) { document.removeEventListener('keydown', onKey); onKey = null; }
    document.documentElement.style.overflow = '';
    if (!v || v.classList.contains('ar-out')) return;
    // Let it leave the way it arrived. The id goes first so a second open()
    // during those 200ms builds a fresh dialog instead of being refused.
    v.id = '';
    v.classList.add('ar-out');
    var gone = false;
    var drop = function () { if (!gone) { gone = true; v.remove(); } };
    v.addEventListener('animationend', drop);
    setTimeout(drop, 400);   // animation cancelled or never ran
  }

  function open() {
    if (document.getElementById('ar-veil')) return;
    ensureStyles();
    var v = document.createElement('div');
    v.id = 'ar-veil';
    v.className = 'ar-veil';
    v.innerHTML =
      '<div class="ar-modal" role="dialog" aria-modal="true" aria-labelledby="ar-h">' +
        '<button class="ar-x" id="ar-x" aria-label="Cerrar">✕</button>' +
        '<h2 id="ar-h">Solicitar acceso</h2>' +
        '<p class="ar-sub">Las cuentas se aprueban a mano. Cuéntanos quién eres y te escribimos por Discord.</p>' +
        '<form id="ar-form" novalidate>' +
          '<label class="ar-f"><span>Tu usuario de Discord *</span><input name="discord" maxlength="60" placeholder="usuario" required></label>' +
          '<label class="ar-f"><span>Nombre del studio *</span><input name="studio" maxlength="80" placeholder="Mi Studio" required></label>' +
          '<label class="ar-f"><span>Miembros de la comunidad *</span><input name="members" type="number" min="1" max="100000000" placeholder="250" required></label>' +
          '<label class="ar-f"><span>Invitación a vuestro Discord *</span><input name="invite" maxlength="200" placeholder="https://discord.gg/…" required></label>' +
          '<label class="ar-f"><span>¿Algo que añadir? (opcional)</span><textarea name="note" rows="3" maxlength="700" placeholder="Qué tipo de eventos organizáis…"></textarea></label>' +
          // Honeypot: hidden from people, bots fill everything they find.
          '<input name="website" tabindex="-1" autocomplete="off" class="ar-hp" aria-hidden="true">' +
          '<div class="ar-msg" id="ar-msg" role="alert"></div>' +
          '<button class="ar-send" type="submit" id="ar-send">Enviar solicitud</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(v);
    document.documentElement.style.overflow = 'hidden';

    document.getElementById('ar-x').addEventListener('click', close);
    v.addEventListener('click', function (e) { if (e.target === v) close(); });
    // Held on the module so closing by any route unbinds it — closing with the
    // ✕ used to leave this listener behind for the rest of the session.
    onKey = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    setTimeout(function () { var i = v.querySelector('input'); if (i) i.focus(); }, 40);

    document.getElementById('ar-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      var btn = document.getElementById('ar-send');
      var msg = document.getElementById('ar-msg');
      var body = {
        discord: f.discord.value, studio: f.studio.value, members: f.members.value,
        invite: f.invite.value, note: f.note.value, website: f.website.value,
      };
      msg.className = 'ar-msg';
      if (!body.discord.trim() || !body.studio.trim() || !body.members || !body.invite.trim()) {
        msg.textContent = 'Rellena los campos marcados con *'; msg.classList.add('bad'); return;
      }
      btn.disabled = true; btn.textContent = 'Enviando…';
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (r) {
          if (!r.ok) throw new Error((r.j && r.j.error) || 'No se pudo enviar');
          f.innerHTML = '<div class="ar-done"><div class="ar-done-ic">✅</div>' +
            '<h3>Solicitud enviada</h3><p>La revisamos a mano y te escribimos por Discord. Gracias por publicar en el calendario.</p>' +
            '<button type="button" class="ar-send" id="ar-close2">Cerrar</button></div>';
          document.getElementById('ar-close2').addEventListener('click', close);
        })
        .catch(function (err) {
          msg.textContent = err.message || 'No se pudo enviar la solicitud';
          msg.classList.add('bad');
          btn.disabled = false; btn.textContent = 'Enviar solicitud';
        });
    });
  }

  /* Delegated so it also works for buttons added after load (the calendar builds
     its detail panel dynamically). */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-request-access]');
    if (t) { e.preventDefault(); open(); }
  });

  // ensureStyles is exposed so the calendar can reuse the same look for its
  // own small "do you already have an account?" step.
  window.EventsAccessRequest = { open: open, close: close, ensureStyles: ensureStyles };
})();

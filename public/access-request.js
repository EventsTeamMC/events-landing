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
    // Events' design tokens, as literals (see above). Space navy surfaces, one
    // blue for the action, Poppins for the title when the page has it.
    '.ar-veil{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:16px;',
    'background:rgba(3,4,12,.66);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);overflow-y:auto;',
    'font-family:"Inter","Inter Variable",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}',
    '.ar-modal{position:relative;width:min(560px,100%);max-height:calc(100dvh - 32px);overflow-y:auto;background:#0c1022;',
    'border-radius:24px;padding:28px;color:#aab2cf;',
    'box-shadow:0 0 0 1px rgba(170,182,255,.17),0 40px 90px -20px rgba(3,2,20,.9)}',
    '.ar-modal *{box-sizing:border-box}',
    '.ar-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:4px}',
    '.ar-modal h2{font-family:"Poppins",system-ui,sans-serif;font-size:22px;line-height:1.25;margin:0;font-weight:700;color:#f2f4fc;letter-spacing:-.01em}',
    '.ar-sub{color:#8189ab;font-size:14px;margin:6px 0 22px}',
    '.ar-x{flex:none;display:grid;place-items:center;width:36px;height:36px;margin:-6px -6px 0 0;border-radius:10px;background:transparent;',
    'border:0;color:#8189ab;cursor:pointer;padding:0;font-size:16px}',
    '.ar-x:hover{background:rgba(255,255,255,.06);color:#f2f4fc}',
    '.ar-x:focus-visible,.ar-send:focus-visible{outline:2px solid #5b8cff;outline-offset:2px}',
    // The calendar's own step puts the close button straight in the modal.
    '.ar-modal>.ar-x{position:absolute;top:18px;right:18px;margin:0}',
    '.ar-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 12px}',
    '.ar-f{display:flex;flex-direction:column;gap:6px}',
    '.ar-f.ar-wide{grid-column:1/-1}',
    '.ar-f>span{font-size:13px;font-weight:600;color:#f2f4fc}',
    '.ar-f>span i{font-style:normal;font-weight:400;color:#8189ab}',
    '.ar-f input,.ar-f textarea{padding:11px 13px;background:#070915;border:1px solid rgba(170,182,255,.17);border-radius:12px;',
    'color:#f2f4fc;font-size:14px;font-family:inherit;resize:vertical;width:100%}',
    '.ar-f input::placeholder,.ar-f textarea::placeholder{color:#5d6588}',
    '.ar-f input:focus,.ar-f textarea:focus{outline:none;border-color:#5b8cff;box-shadow:0 0 0 3px rgba(91,140,255,.2)}',
    '.ar-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important}',
    '.ar-msg{min-height:20px;font-size:13px;margin:12px 0 4px}',
    '.ar-msg.bad{color:#ff8a9a}',
    '.ar-send{display:block;width:100%;padding:13px 18px;border-radius:12px;border:0;cursor:pointer;font-weight:600;font-size:15px;',
    'font-family:inherit;background:#4766e6;color:#fff;box-shadow:0 10px 30px -10px rgba(71,102,230,.7)}',
    '.ar-send:hover{background:#5274f0}',
    '.ar-send:disabled{opacity:.6;cursor:default}',
    '.ar-alt{background:rgba(255,255,255,.06)!important;color:#f2f4fc!important;box-shadow:none!important;margin-top:10px}',
    '.ar-alt:hover{background:rgba(255,255,255,.1)!important}',
    '.ar-done{text-align:center;padding:12px 0 4px}',
    '.ar-done-ic{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:50%;margin-bottom:14px;',
    'background:rgba(52,211,153,.14);color:#34d399}',
    '.ar-done h3{font-family:"Poppins",system-ui,sans-serif;font-size:19px;margin:0 0 6px;color:#f2f4fc}',
    '.ar-done p{color:#8189ab;font-size:14px;margin:0 0 20px}',
    // Motion: enter and exit on the same curve, read in opposite directions.
    '@keyframes ar-veil-in{from{opacity:0}to{opacity:1}}',
    '@keyframes ar-veil-out{from{opacity:1}to{opacity:0}}',
    '@keyframes ar-card-in{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}',
    '@keyframes ar-card-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(12px) scale(.97)}}',
    '.ar-veil{animation:ar-veil-in .2s cubic-bezier(.32,.72,0,1) both}',
    '.ar-modal{animation:ar-card-in .32s cubic-bezier(.32,.72,0,1) both}',
    '.ar-veil.ar-out{animation:ar-veil-out .18s cubic-bezier(1,0,.68,.28) both}',
    '.ar-veil.ar-out .ar-modal{animation:ar-card-out .2s cubic-bezier(1,0,.68,.28) both}',
    '.ar-send,.ar-x{transition:transform .1s cubic-bezier(.32,.72,0,1),background .13s,color .13s}',
    '.ar-send:active,.ar-x:active{transform:scale(.97)}',
    '.ar-f input,.ar-f textarea{transition:border-color .14s,box-shadow .14s}',
    '@keyframes ar-pop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}',
    '.ar-done-ic{animation:ar-pop .4s cubic-bezier(.16,1,.3,1) both}',
    '@media (prefers-reduced-motion:reduce){.ar-modal,.ar-done-ic,.ar-veil.ar-out .ar-modal{animation:none!important}}',
    '@media (max-width:560px){.ar-modal{padding:22px 18px;border-radius:20px}.ar-grid{grid-template-columns:1fr}}',
  ].join('');
  var ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_OK = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
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
        '<div class="ar-head"><h2 id="ar-h">Publicar en el calendario</h2>' +
        '<button type="button" class="ar-x" id="ar-x" aria-label="Cerrar">' + ICON_X + '</button></div>' +
        '<p class="ar-sub">Las cuentas de studio se aprueban a mano. Te escribimos por Discord.</p>' +
        '<form id="ar-form" novalidate>' +
          '<div class="ar-grid">' +
          '<label class="ar-f"><span>Tu usuario de Discord</span><input name="discord" maxlength="60" placeholder="usuario" autocomplete="username" required></label>' +
          '<label class="ar-f"><span>Nombre del studio</span><input name="studio" maxlength="80" placeholder="Mi Studio" autocomplete="organization" required></label>' +
          '<label class="ar-f"><span>Miembros de la comunidad</span><input name="members" type="number" inputmode="numeric" min="1" max="100000000" placeholder="250" required></label>' +
          '<label class="ar-f"><span>Invitación a vuestro Discord</span><input name="invite" maxlength="200" placeholder="https://discord.gg/…" inputmode="url" required></label>' +
          '<label class="ar-f ar-wide"><span>Algo más <i>(opcional)</i></span><textarea name="note" rows="3" maxlength="700" placeholder="Qué eventos organizáis"></textarea></label>' +
          '</div>' +
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
        msg.textContent = 'Faltan campos por rellenar.'; msg.classList.add('bad'); return;
      }
      btn.disabled = true; btn.textContent = 'Enviando…';
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (r) {
          if (!r.ok) throw new Error((r.j && r.j.error) || 'No se pudo enviar');
          f.innerHTML = '<div class="ar-done"><div class="ar-done-ic">' + ICON_OK + '</div>' +
            '<h3>Solicitud enviada</h3><p>Te escribimos por Discord.</p>' +
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

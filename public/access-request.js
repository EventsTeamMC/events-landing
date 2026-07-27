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
  var ENDPOINT = 'https://eventsmc.xyz/api/access-request';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function close() {
    var v = document.getElementById('ar-veil');
    if (v) v.remove();
    document.documentElement.style.overflow = '';
  }

  function open() {
    if (document.getElementById('ar-veil')) return;
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
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
    });
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

  window.EventsAccessRequest = { open: open, close: close };
})();

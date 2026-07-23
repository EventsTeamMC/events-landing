/* Events Client landing — tiny progressive enhancements, no dependencies. */
(function () {
  var DISCORD = 'https://discord.gg/2T7DDmpxYr';
  // Stable "latest" download URLs — GitHub always serves the newest release's
  // asset from this path, so the landing never needs updating per version.
  var DL_BASE = 'https://github.com/EventsTeamMC/events-client-releases/releases/latest/download/';
  var DOWNLOADS = {
    windows: { file: 'Events-Client-win.exe', label: 'Windows' },
    mac: { file: 'Events-Client-mac-universal.dmg', label: 'macOS' },
    linux: { file: 'Events-Client-linux-x86_64.AppImage', label: 'Linux' },
  };

  // Year in the footer.
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Discord links.
  ['foot-discord', 'cta-discord'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = DISCORD;
  });

  // Detect the visitor's OS.
  var ua = navigator.userAgent;
  var osKey = /Macintosh|Mac OS X/i.test(ua) ? 'mac' : (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) ? 'linux' : 'windows';
  var dl = DOWNLOADS[osKey];

  // Home page copy: name the visitor's OS.
  var osEl = document.getElementById('dl-os');
  if (osEl) osEl.textContent = dl.label;

  // Download page: highlight the matching card, wire the hero button.
  var primary = document.getElementById('dl-primary');
  if (primary) {
    primary.href = DL_BASE + dl.file;
    primary.textContent = 'Descargar para ' + dl.label;
  }
  var detected = document.getElementById('dl-detected');
  if (detected) detected.textContent = 'Detectado: ' + dl.label;
  var card = document.querySelector('.dl-card[data-os="' + osKey + '"]');
  if (card) card.classList.add('detected');

  // Sticky nav border once scrolled.
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 8); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu.
  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', function () { nav.classList.toggle('open'); });
  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); });
  });

  // ---- Buzón de sugerencias (botón 💡 en el nav + popup, en todas las páginas) ----
  (function () {
    var modalHtml =
      '<div class="suggest-overlay" id="suggest-overlay" aria-hidden="true">' +
        '<div class="suggest-modal" role="dialog" aria-modal="true" aria-labelledby="suggest-modal-title">' +
          '<button type="button" class="suggest-close" id="suggest-close" aria-label="Cerrar">✕</button>' +
          '<span class="suggest-modal-ic">💡</span>' +
          '<h3 id="suggest-modal-title">¿Tienes una sugerencia?</h3>' +
          '<p>Cuéntanos qué te gustaría ver en el ecosistema Events. Se envía de forma anónima.</p>' +
          '<form id="suggest-modal-form" class="suggest-form">' +
            '<textarea name="message" maxlength="500" rows="4" placeholder="Tu idea o sugerencia..." required></textarea>' +
            '<input type="text" name="website" class="hp-field" tabindex="-1" autocomplete="off">' +
            '<button type="submit" class="btn btn-primary btn-sm">Enviar sugerencia</button>' +
            '<p class="suggest-status" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    var overlay = document.getElementById('suggest-overlay');
    var closeBtn = document.getElementById('suggest-close');

    function openModal() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      var ta = overlay.querySelector('textarea');
      if (ta) ta.focus();
    }
    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

    // Botón 💡 en el nav de cualquier página que lo tenga.
    if (nav) {
      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-suggest';
      trigger.setAttribute('aria-label', 'Enviar una sugerencia');
      trigger.title = 'Enviar una sugerencia';
      trigger.textContent = '💡';
      trigger.addEventListener('click', openModal);
      var burgerEl = document.getElementById('burger');
      if (burgerEl) nav.insertBefore(trigger, burgerEl); else nav.appendChild(trigger);
    }

    window.EventsSuggest = { open: openModal, close: closeModal };
  })();

  // Envía el texto de un formulario de sugerencia a /api/suggest y actualiza su
  // propio estado (deshabilita el botón mientras envía, muestra éxito/error).
  function wireSuggestForm(form) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var textarea = form.querySelector('textarea[name="message"]');
      var honeypot = form.querySelector('input[name="website"]');
      var button = form.querySelector('button[type="submit"]');
      var status = form.querySelector('.suggest-status');
      var message = textarea ? textarea.value.trim() : '';

      if (message.length < 3) {
        if (status) { status.textContent = 'Escribe un poco más antes de enviar.'; status.className = 'suggest-status err'; }
        return;
      }

      if (button) button.disabled = true;
      if (status) { status.textContent = 'Enviando…'; status.className = 'suggest-status'; }

      fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, website: honeypot ? honeypot.value : '' }),
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok) {
            if (status) { status.textContent = '¡Gracias! La sugerencia se ha enviado.'; status.className = 'suggest-status ok'; }
            form.reset();
            setTimeout(function () {
              if (window.EventsSuggest) window.EventsSuggest.close();
              if (status) status.textContent = '';
            }, 1800);
          } else {
            if (status) { status.textContent = (result.data && result.data.error) || 'No se pudo enviar. Inténtalo de nuevo.'; status.className = 'suggest-status err'; }
          }
        })
        .catch(function () {
          if (status) { status.textContent = 'No se pudo enviar. Revisa tu conexión.'; status.className = 'suggest-status err'; }
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
    });
  }

  wireSuggestForm(document.getElementById('suggest-modal-form'));
  wireSuggestForm(document.getElementById('suggest-card-form'));

  // Reveal sections as they enter the viewport.
  var targets = document.querySelectorAll('.section > .h2, .section > .sub, .products-head, .product, .card, .feat, .step, .cta, .shot-row figure, .panel-shot, .checks, .priv, .cmd-card');
  targets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }
})();

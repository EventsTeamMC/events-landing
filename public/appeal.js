/* Página de apelaciones (/appeal) — sin dependencias, mismo estilo que main.js.
 *
 * Aquí no se decide nada: el formulario solo manda la apelación a /api/appeal,
 * que la reenvía a un canal privado del staff. Toda la validación se repite en
 * el servidor; la de aquí existe para no gastar un envío en un formulario a
 * medio rellenar.
 *
 * El límite de reenvíos lo aplica SOLO el servidor: este archivo se sirve tal
 * cual y cualquiera lo lee, así que una copia del contador aquí sería publicar
 * cada cuánto se puede reintentar. */
(function () {
  var form = document.getElementById('appeal-form');
  if (!form) return;

  var ENDPOINT = '/api/appeal';

  var status = document.getElementById('ap-status');
  var button = document.getElementById('ap-send');
  var counter = document.getElementById('ap-count');
  var textarea = form.querySelector('textarea[name="appeal"]');
  var onlyBlocks = form.querySelectorAll('.ap-only');
  var cats = form.querySelectorAll('.ap-cat');

  function say(text, kind) {
    if (!status) return;
    status.textContent = text || '';
    status.className = 'ap-status' + (kind ? ' ' + kind : '');
  }

  /* ---- categoría: pinta la tarjeta elegida y enseña solo sus campos ---- */
  function syncCategory() {
    var checked = form.querySelector('input[name="category"]:checked');
    var value = checked ? checked.value : '';
    cats.forEach(function (label) {
      var input = label.querySelector('input');
      label.classList.toggle('on', !!input && input.checked);
    });
    onlyBlocks.forEach(function (block) {
      var mine = block.getAttribute('data-only') === value;
      block.hidden = !mine;
      // Un campo oculto no debe seguir contando como relleno de otra categoría.
      if (!mine) block.querySelectorAll('input').forEach(function (i) { i.value = ''; });
    });
  }
  form.querySelectorAll('input[name="category"]').forEach(function (r) {
    r.addEventListener('change', syncCategory);
  });

  // Enlaces tipo /appeal?type=blacklist (o #blacklist) llegan con la categoría
  // ya elegida: el launcher y el bot pueden mandar aquí a la gente directamente.
  var hint = (new URLSearchParams(location.search).get('type') || location.hash.replace('#', '')).toLowerCase();
  var preset = form.querySelector('input[name="category"][value="' + hint.replace(/[^a-z]/g, '') + '"]');
  if (preset) { preset.checked = true; }
  syncCategory();

  /* ---- contador del textarea ---- */
  if (textarea && counter) {
    var updateCount = function () {
      counter.textContent = textarea.value.trim().length;
      counter.parentNode.classList.toggle('short', textarea.value.trim().length > 0 && textarea.value.trim().length < 40);
    };
    textarea.addEventListener('input', updateCount);
    updateCount();
  }

  function fail(message, name) {
    say(message, 'err');
    var field = name && form.querySelector('[name="' + name + '"]');
    if (field && !field.closest('[hidden]')) { field.focus(); }
    return false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var checked = form.querySelector('input[name="category"]:checked');
    var v = function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el ? el.value.trim() : '';
    };

    if (!checked) return fail('Elige qué tipo de baneo quieres apelar');
    var category = checked.value;
    var body = {
      category: category,
      discord: v('discord'),
      discordId: v('discordId').replace(/[^\d]/g, ''),
      reason: v('reason'),
      when: v('when'),
      appeal: v('appeal'),
      evidence: v('evidence'),
      mcnick: v('mcnick'),
      guild: v('guild'),
      agree: !!form.querySelector('[name="agree"]').checked,
      website: v('website'),
    };

    if (body.discord.length < 2) return fail('Escribe tu usuario de Discord', 'discord');
    if (!/^\d{17,20}$/.test(body.discordId)) return fail('Tu ID de Discord es el número de 17-20 dígitos, no el @usuario', 'discordId');
    if (category === 'launcher' && !/^[A-Za-z0-9_]{3,16}$/.test(body.mcnick)) return fail('Escribe tu nick de Minecraft (3-16 caracteres, sin espacios)', 'mcnick');
    if (category === 'blacklist' && body.guild.length < 2) return fail('Indica en qué servidor te banearon', 'guild');
    if (body.reason.length < 2) return fail('Indica qué motivo te dieron (si no lo sabes, escríbelo)', 'reason');
    if (body.appeal.length < 40) return fail('Explica tu apelación con algo más de detalle (mínimo 40 caracteres)', 'appeal');
    if (body.evidence && !/^https?:\/\/[^\s]+$/i.test(body.evidence)) return fail('El enlace de pruebas debe empezar por https://', 'evidence');
    if (!body.agree) return fail('Confirma que lo que cuentas es cierto', 'agree');

    button.disabled = true;
    var label = button.textContent;
    button.textContent = 'Enviando…';
    say('Enviando tu apelación…');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.j.error || 'No se pudo enviar la apelación');
        form.innerHTML =
          '<div class="ap-done">' +
            '<div class="ap-done-ic">✅</div>' +
            '<h3>Apelación enviada</h3>' +
            '<p>Ya está en manos del staff. La revisamos a mano y te respondemos por Discord — ' +
            'asegúrate de tener los mensajes directos abiertos. No hace falta que la envíes otra vez.</p>' +
            '<a class="btn btn-ghost" href="/">Volver al inicio</a>' +
          '</div>';
      })
      .catch(function (err) {
        say(err.message || 'No se pudo enviar. Revisa tu conexión.', 'err');
        button.disabled = false;
        button.textContent = label;
      });
  });
})();

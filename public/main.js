/* Events Client landing — tiny progressive enhancements, no dependencies. */
(function () {
  var RELEASES = 'https://github.com/EventsTeamMC/events-client/releases/latest';
  var DISCORD = 'https://discord.gg/eventsclient'; // ← cámbialo por tu invitación real

  // Year in the footer.
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Discord link.
  var fd = document.getElementById('foot-discord');
  if (fd) fd.href = DISCORD;

  // Point the main download button at the visitor's OS.
  var ua = navigator.userAgent;
  var os = /Macintosh|Mac OS X/i.test(ua) ? 'macOS' : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? 'Linux' : 'Windows';
  var main = document.getElementById('dl-main');
  if (main) { main.textContent = '▶ Descargar para ' + os; main.href = RELEASES; }

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

  // Reveal sections as they enter the viewport.
  var targets = document.querySelectorAll('.section > .h2, .section > .sub, .card, .feat, .step, .cta, .shot-row figure, .panel-shot, .checks');
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

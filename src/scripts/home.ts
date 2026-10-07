/*
 * Home page behaviour:
 *  - the launcher demo plays its sequence once when it comes into view (GSAP,
 *    loaded only here and only when motion is allowed);
 *  - "Así se vive un evento" keeps its clock in sync with the step in view;
 *  - live numbers and the next event refresh from the API.
 */
import { refreshDownloads } from './live';

const API = 'https://api.eventsmc.xyz/api';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

export function initHome() {
    demo();
    night();
    refreshDownloads();
    refreshNextEvent();
}

/* ------------------------------------------------------------ demo */
function demo() {
    const root = document.querySelector<HTMLElement>('[data-ld]');
    if (!root) return;
    const replay = document.querySelector<HTMLButtonElement>('[data-ld-replay]');
    const finish = () => { root.dataset.state = 'done'; };

    if (reduce.matches || root.dataset.state !== 'pre') { finish(); return; }
    // Never leave the demo half-built if the library fails to arrive.
    const guard = window.setTimeout(finish, 6000);

    const io = new IntersectionObserver(async ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        try {
            const { gsap } = await import('gsap');
            window.clearTimeout(guard);
            const tl = build(gsap, root);
            tl.eventCallback('onComplete', () => { finish(); if (replay) replay.hidden = false; });
            replay?.addEventListener('click', () => { replay.hidden = true; root.dataset.state = 'pre'; tl.restart(); });
        } catch { finish(); }
    }, { threshold: 0.45 });
    io.observe(root);
}

function build(gsap: typeof import('gsap').gsap, root: HTMLElement) {
    const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
    const chars = root.querySelectorAll('.ld-code > span');
    const count = q('[data-ld-count]');
    const counter = { n: 0 };
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.5 });

    tl.set(q('[data-ld-redeem]'), { autoAlpha: 1 })
        .set(q('.ld-card'), { scale: 1, autoAlpha: 1 })
        .set(chars, { autoAlpha: 0, y: 4 })
        .set(q('.ld-caret'), { autoAlpha: 1 })
        .set(q('[data-ld-btn]'), { scale: 1 })
        .set(q('[data-ld-tile]'), { autoAlpha: 0, scale: 0.6 })
        .set(q('[data-ld-sync]'), { autoAlpha: 0 })
        .set(q('[data-ld-bar]'), { scaleX: 0 })
        .set(q('[data-ld-play]'), { autoAlpha: 0, scale: 0.92 })
        .set(q('[data-ld-toast]'), { autoAlpha: 0, y: 10 })
        .call(() => { counter.n = 0; count.textContent = '0'; });

    // Typing: one character at a time, slightly uneven like a person.
    chars.forEach((c, i) => tl.to(c, { autoAlpha: 1, y: 0, duration: 0.12 }, i === 0 ? '+=0.2' : `+=${0.05 + ((i * 37) % 5) / 100}`));

    tl.to(q('.ld-caret'), { autoAlpha: 0, duration: 0.1 }, '+=0.25')
        .to(q('[data-ld-btn]'), { scale: 0.96, duration: 0.1, ease: 'power2.out' })
        .to(q('[data-ld-btn]'), { scale: 1, duration: 0.18 })
        .to(q('.ld-card'), { scale: 0.97, autoAlpha: 0, duration: 0.28, ease: 'power2.in' }, '+=0.05')
        .to(q('[data-ld-redeem]'), { autoAlpha: 0, duration: 0.35 }, '<0.1')
        .to(q('[data-ld-tile]'), { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, '<0.05')
        .to(q('[data-ld-toast]'), { autoAlpha: 1, y: 0, duration: 0.4 }, '<0.1')
        .to(q('[data-ld-sync]'), { autoAlpha: 1, duration: 0.3 }, '<0.2')
        .to(q('[data-ld-bar]'), { scaleX: 1, duration: 2.1, ease: 'power2.inOut' }, '<')
        .to(counter, { n: 212, duration: 2.1, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(counter.n)); } }, '<')
        .to(q('[data-ld-toast]'), { autoAlpha: 0, y: 6, duration: 0.3, ease: 'power2.in' }, '-=0.8')
        .to(q('[data-ld-sync]'), { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, '+=0.15')
        .to(q('[data-ld-play]'), { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.4)' }, '<0.1');
    return tl;
}

/* ------------------------------------------------------------ the night */
function night() {
    const steps = document.querySelectorAll<HTMLElement>('[data-step]');
    const faces = document.querySelectorAll<HTMLElement>('[data-clock]');
    if (!steps.length) return;
    const set = (i: number) => {
        steps.forEach((s) => s.classList.toggle('on', Number(s.dataset.step) === i));
        faces.forEach((f) => f.classList.toggle('on', Number(f.dataset.clock) === i));
    };
    set(0);
    const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) set(Number((e.target as HTMLElement).dataset.step));
    }, { rootMargin: '-45% 0px -50% 0px' });
    steps.forEach((s) => io.observe(s));
}

/* ------------------------------------------------------------ next event */
async function refreshNextEvent() {
    const root = document.querySelector<HTMLElement>('[data-ld]');
    if (!root) return;
    try {
        const r = await fetch(`${API}/events`);
        const list: any[] = (await r.json()).data || [];
        const now = Date.now();
        const next = list
            .filter((e) => !e.hidden && !e.ended && e.type !== 'series' && e.startsAt && new Date(e.startsAt).getTime() > now - 3 * 3600e3)
            .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
        const nameEl = root.querySelector('[data-ld-name]');
        if (!next || !nameEl || nameEl.textContent === next.name) return;
        nameEl.textContent = next.name;
        const studio = root.querySelector('[data-ld-studio]');
        if (studio) studio.textContent = next.studioName || next.sponsor || '';
        const when = root.querySelector('[data-ld-when]');
        if (when) {
            const d = new Date(next.startsAt);
            const day = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' }).replace('.', '');
            const t = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
            when.textContent = `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${t}`;
        }
        if (next.image) root.querySelectorAll<HTMLImageElement>('[data-ld-img]').forEach((img) => { img.src = next.image; });
        if (next.color) root.style.setProperty('--tone', next.color);
    } catch { /* keep what the build rendered */ }
}

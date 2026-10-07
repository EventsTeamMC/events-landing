/*
 * Home page behaviour:
 *  - the three real product captures fan in once, then follow the pointer a
 *    little (deeper layers move more), with a spring so it never feels glued;
 *  - "Así se vive un evento" keeps its clock in sync with the step in view;
 *  - the download counter refreshes from the API.
 * GSAP is loaded only here and only when motion is allowed.
 */
import { refreshDownloads } from './live';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

export function initHome() {
    stack();
    night();
    refreshDownloads();
}

/* ------------------------------------------------------------ hero stack */
async function stack() {
    const root = document.querySelector<HTMLElement>('[data-stack]');
    if (!root || reduce.matches) return;
    const layers = [...root.querySelectorAll<HTMLElement>('.hs-layer')];
    const { gsap } = await import('gsap');

    gsap.from(layers, {
        y: (i) => 40 + i * 18, rotateX: 8, rotateY: -10, opacity: 0, scale: 0.96,
        duration: 1.1, ease: 'expo.out', stagger: 0.12, clearProps: 'opacity,scale',
    });

    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const movers = layers.map((el) => ({
        depth: Number(el.dataset.depth) || 1,
        x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
        ry: gsap.quickTo(el, 'rotateY', { duration: 1.1, ease: 'power3.out' }),
        rx: gsap.quickTo(el, 'rotateX', { duration: 1.1, ease: 'power3.out' }),
    }));
    const area = root.closest('.hero') || root;
    area.addEventListener('pointermove', (e) => {
        const r = root.getBoundingClientRect();
        const nx = ((e as PointerEvent).clientX - (r.left + r.width / 2)) / r.width;
        const ny = ((e as PointerEvent).clientY - (r.top + r.height / 2)) / r.height;
        for (const m of movers) {
            m.x(nx * 14 * m.depth); m.y(ny * 10 * m.depth);
            m.ry(nx * 4); m.rx(-ny * 3);
        }
    });
    area.addEventListener('pointerleave', () => { for (const m of movers) { m.x(0); m.y(0); m.ry(0); m.rx(0); } });
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

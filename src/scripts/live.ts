/*
 * The download counter.
 *
 * Total = GitHub's historical base + the clicks counted here (the backend waits
 * one hour per person, so a triple click is one download). Links still point
 * straight at GitHub: if the API is down, downloading works and only the count
 * is lost. Read on load and every 60 s while the tab is visible.
 */
const API = 'https://api.eventsmc.xyz/api';

function render(n: unknown) {
    if (typeof n !== 'number') return;
    document.querySelectorAll<HTMLElement>('[data-dl-count]').forEach((el) => { el.textContent = n.toLocaleString('es-ES'); });
}

export function refreshDownloads() {
    if (!document.querySelector('[data-dl-count]')) return;
    const load = async () => {
        if (document.hidden) return;
        try {
            const r = await fetch(`${API}/downloads`, { cache: 'no-store' });
            render((await r.json())?.data?.total);
        } catch { /* keep the last value */ }
    };
    load();
    window.setInterval(load, 60_000);
    document.addEventListener('visibilitychange', load);
}

/* Anonymous, stable id per browser: Cloudflare hides real IPs, so the one-hour
 * wait needs something to key on. It identifies no one. */
function clientId(): string {
    try {
        let v = localStorage.getItem('ec_dl_id');
        if (!v) { v = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(); localStorage.setItem('ec_dl_id', v); }
        return v;
    } catch { return ''; }
}

export function countDownloadClicks() {
    document.querySelectorAll<HTMLAnchorElement>('a[data-dl]').forEach((a) => a.addEventListener('click', async () => {
        try {
            const r = await fetch(`${API}/downloads/hit`, {
                method: 'POST', keepalive: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cid: clientId() }),
            });
            const j = r.ok ? await r.json() : null;
            if (!j?.data) return;
            render(j.data.total);
            if (j.data.counted) document.querySelectorAll<HTMLElement>('[data-dl-thanks]').forEach((el) => { el.hidden = false; });
        } catch { /* counting never blocks a download */ }
    }));
}

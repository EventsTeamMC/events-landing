/*
 * Live data read once at build time so the first paint already shows real
 * numbers (no layout shift, nothing invented). The page refreshes them in the
 * browser afterwards. If the API is unreachable at build, values are null and
 * the components show their own neutral state instead of zeros.
 */
import { LINKS } from './site';

export interface LiveEvent {
    name: string;
    studio: string;
    startsAt: string;
    image: string | null;
    color: string | null;
    category: string | null;
}

async function get<T>(path: string): Promise<T | null> {
    try {
        const r = await fetch(`${LINKS.api}${path}`, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) return null;
        const j = await r.json();
        return (j && j.data) ?? null;
    } catch {
        return null;
    }
}

export async function getDownloads(): Promise<number | null> {
    const d = await get<{ total: number }>('/downloads');
    return d && typeof d.total === 'number' ? d.total : null;
}

export async function getUpcoming(): Promise<LiveEvent[]> {
    const list = (await get<any[]>('/events')) || [];
    const now = Date.now();
    return list
        .filter((e) => !e.hidden && !e.ended && e.type !== 'series' && e.startsAt && new Date(e.startsAt).getTime() > now - 3 * 3600e3)
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
        .map((e) => ({
            name: String(e.name),
            studio: String(e.studioName || e.sponsor || ''),
            startsAt: String(e.startsAt),
            image: e.image || null,
            color: e.color || null,
            category: e.category || null,
        }));
}

/* "sábado 10 oct · 22:00", in Madrid time, as the launcher shows it. */
export function eventWhen(iso: string): string {
    const d = new Date(iso);
    const day = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' }).replace('.', '');
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${time}`;
}

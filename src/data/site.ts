/*
 * Everything the site states as a fact lives here once: links, products,
 * statuses and prices. Pages read from this file; nothing is typed twice.
 *
 * Events+ numbers come from events-server/backend/plans.js. Plan ids are the
 * monthly Paymenter plans at clientes.eventsmc.xyz: for now Events+ is sold
 * monthly only, so each "Contratar" lands on the checkout with that plan.
 */

export const LINKS = {
    discord: 'https://discord.gg/2T7DDmpxYr',
    panel: 'https://panel.eventsmc.xyz',
    calendar: 'https://calendar.eventsmc.xyz',
    status: 'https://status.eventsmc.xyz',
    clientes: 'https://clientes.eventsmc.xyz',
    hosting: 'https://hosting.eventsmc.xyz',
    releases: 'https://github.com/EventsTeamMC/events-client-releases/releases',
    whitelistInvite: 'https://discord.com/oauth2/authorize?client_id=1529559292938555405',
    blacklistInvite: 'https://discord.com/oauth2/authorize?client_id=1528203943367151706',
    whitelistPlugin: 'https://github.com/EventsTeamMC/events-whitelist-plugin-releases/releases/latest/download/EventsWhitelist.jar',
    api: 'https://api.eventsmc.xyz/api',
} as const;

const DL = 'https://github.com/EventsTeamMC/events-client-releases/releases/latest/download';
export const DOWNLOADS = {
    windows: { label: 'Windows', req: 'Windows 10 u 11 · 64 bits', file: '.exe', href: `${DL}/Events-Client-win-x64.exe`, alt: { label: 'ARM64', href: `${DL}/Events-Client-win-arm64.exe` } },
    mac: { label: 'macOS', req: 'macOS 11 o superior · Apple Silicon e Intel', file: '.dmg', href: `${DL}/Events-Client-mac-universal.dmg`, alt: { label: '.zip', href: `${DL}/Events-Client-mac-universal.zip` } },
    linux: { label: 'Linux', req: 'AppImage · x86_64', file: '.AppImage', href: `${DL}/Events-Client-linux-x86_64.AppImage`, alt: null },
} as const;

export type ProductId = 'client' | 'panel' | 'whitelist' | 'blacklist' | 'calendar' | 'bot' | 'plus' | 'allys' | 'hosting';

export interface Product {
    id: ProductId;
    name: string;
    kind: string;
    line: string;
    href: string;
    external?: boolean;
    icon: string;
    tone: string;
    status: 'on' | 'soon';
}

export const PRODUCTS: Product[] = [
    { id: 'client', name: 'Events Client', kind: 'Launcher', line: 'Entra a cualquier evento con un código.', href: '/client', icon: 'gamepad', tone: 'var(--p-client)', status: 'on' },
    { id: 'panel', name: 'Panel', kind: 'Para studios', line: 'Instancias, archivos, códigos y whitelist.', href: LINKS.panel, external: true, icon: 'panel', tone: 'var(--p-client)', status: 'on' },
    { id: 'whitelist', name: 'Events Whitelist', kind: 'Bot de Discord', line: 'Registro de nicks desde Discord.', href: '/whitelist', icon: 'list-checks', tone: 'var(--p-whitelist)', status: 'on' },
    { id: 'blacklist', name: 'Events Blacklist', kind: 'Bot de Discord', line: 'Baneos compartidos entre comunidades.', href: '/blacklist', icon: 'shield', tone: 'var(--p-blacklist)', status: 'on' },
    { id: 'calendar', name: 'Events Calendar', kind: 'Calendario', line: 'Todos los eventos, en un calendario.', href: 'https://calendar.eventsmc.xyz', icon: 'calendar', tone: 'var(--p-calendar)', status: 'on' },
    { id: 'bot', name: 'Events BOT', kind: 'Bot propio', line: 'Tu bot de Discord: tickets, logs y más.', href: '/bot', icon: 'bot', tone: 'var(--p-bot)', status: 'on' },
    { id: 'plus', name: 'Events+', kind: 'Suscripción', line: 'Más instancias y cola prioritaria.', href: '/plus', icon: 'sparkle', tone: 'var(--p-plus)', status: 'on' },
    { id: 'allys', name: 'Events Allys', kind: 'Red de alianzas', line: 'Comunidades aliadas que comparten eventos.', href: '', icon: 'users', tone: 'var(--p-allys)', status: 'soon' },
    { id: 'hosting', name: 'Hosting de Minecraft', kind: 'Servidores', line: 'Servidores de Minecraft para tus eventos.', href: '', icon: 'server', tone: 'var(--p-hosting)', status: 'soon' },
];

export const product = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;

/* ------------------------------------------------------------ Events+ */
const checkout = (slug: string, plan: number) => `${LINKS.clientes}/products/events-plus/${slug}/checkout?plan=${plan}`;

export interface PlusPlan {
    id: 'plus1' | 'plus3' | 'plus5';
    name: string;
    instances: number;
    monthly: number;
    note: string;
    href: string;
    features: string[];
    pick?: boolean;
}

export const PLUS_PLANS: PlusPlan[] = [
    {
        id: 'plus1', name: 'Events+ 1', instances: 1, monthly: 0.99,
        note: 'Para el studio que monta un evento cada vez.',
        href: checkout('events-plus-1', 37),
        features: ['1 instancia activa', 'Sin tope de jugadores a la vez', 'Cola prioritaria para tus jugadores', '1 GB de archivos por instancia', 'Estadísticas de 7 días', '3 cuentas de staff', 'Enlace corto que instala y canjea'],
    },
    {
        id: 'plus3', name: 'Events+ 3', instances: 3, monthly: 1.99, pick: true,
        note: 'El evento en marcha, el ensayo y el siguiente.',
        href: checkout('events-plus-3', 38),
        features: ['3 instancias activas', 'Todo lo de Events+ 1', 'Descargas con prioridad doble', '2 GB por instancia', 'Estadísticas de 30 días', '8 cuentas de staff', 'Aperturas programadas y códigos masivos', '1 destaque al mes en Explorar', 'Soporte prioritario'],
    },
    {
        id: 'plus5', name: 'Events+ 5', instances: 5, monthly: 3.99,
        note: 'Varios eventos vivos y un equipo detrás.',
        href: checkout('events-plus-5', 39),
        features: ['5 instancias activas', 'Todo lo de Events+ 3', 'Prioridad de descarga máxima', '4 GB por instancia', 'Estadísticas de 3 meses', '20 cuentas de staff', '3 destaques al mes y destaque en Calendar y Discord', 'Acceso al canal Beta'],
    },
];

export const FREE_LIMITS = 'Plan gratuito: 1 instancia, 500 MB, 2 cuentas de staff y 100 jugadores a la vez por studio.';

/* ------------------------------------------------------------ Events BOT */
export const BOT = {
    checkout: `${LINKS.clientes}/products/hosting/events-bot/checkout`,
    hostingCheckout: `${LINKS.clientes}/products/hosting/hosting-bot/checkout`,
    hostingMonthly: 2.0,
    modules: [
        { name: 'Tickets', price: 2.0, line: 'Panel con categorías y formulario, reclamar, transferir, prioridades, transcripciones y valoraciones.' },
        { name: 'Logging', price: 1.25, line: 'Mensajes editados y borrados, entradas, salidas, roles y canales.' },
        { name: 'Niveles', price: 1.0, line: 'Experiencia por actividad, ranking y roles de recompensa.' },
        { name: 'Sorteos', price: 0.75, line: 'Requisitos, papeletas extra y repesca.' },
        { name: 'Counting', price: 0.5, line: 'Un canal para contar entre todos.' },
        { name: 'Autoreacciones', price: 0.5, line: 'Reacciones automáticas por canal o por palabra.' },
    ],
    licenses: [
        { name: 'Base', price: 3.0, what: 'Los módulos que elijas', note: 'La base sola no trae funciones: añade al menos un módulo.', features: ['General y Utils incluidos', 'Módulos sueltos, ampliables después', '512 MB de RAM y 2 copias de seguridad'] },
        { name: 'Pack Completo', price: 7.0, what: 'Todos los módulos, y los que salgan', note: 'Por separado, 9,00 €.', features: ['Los 6 módulos, General y Utils', 'Los módulos nuevos, sin pagar más', '512 MB de RAM y 2 copias de seguridad'], pick: true },
    ],
};

export const eur = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

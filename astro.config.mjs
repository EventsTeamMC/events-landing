import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static site on Vercel. `build.format: 'file'` writes /client.html instead of
// /client/index.html, so with vercel.json's cleanUrls every URL stays exactly
// as it was before the move to Astro (no trailing slashes, no redirects).
export default defineConfig({
    site: 'https://www.eventsmc.xyz',
    output: 'static',
    trailingSlash: 'never',
    build: { format: 'file', inlineStylesheets: 'auto' },
    prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
    integrations: [
        sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/plus/condiciones') }),
    ],
});

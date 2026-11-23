// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL : domaine définitif (canonical, sitemap). BASE_PATH : sous-dossier de la préversion GitHub Pages.
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.la-paillote-en-chaume.com',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
});

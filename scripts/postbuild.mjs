// Après « astro build » : sitemap.xml, robots.txt, pages de renvoi des anciennes adresses .htm, .nojekyll.
// PREVIEW=1 (version de test) : robots.txt bloque tout, en-tête noindex (Cloudflare/Netlify), pages déjà en noindex.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname;
const SITE = (process.env.SITE_URL || 'https://www.la-paillote-en-chaume.com').replace(/\/$/, '');
const BASE = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const PREVIEW = process.env.PREVIEW === '1';
const today = new Date().toISOString().slice(0, 10);

const urls = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') {
      const html = readFileSync(p, 'utf8');
      if (/<html[^>]*data-sitemap="yes"/.test(html)) urls.push('/' + relative(dist, p).replace(/index\.html$/, ''));
    }
  }
})(dist);
urls.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
const prio = (u) => (u === '/' ? '1.0' : u.split('/').length <= 3 ? '0.8' : '0.6');
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><priority>${prio(u)}</priority></url>`).join('\n')}\n</urlset>\n`);

const robots = PREVIEW
  ? 'User-agent: *\nDisallow: /\n'
  : `# Moteurs de recherche et assistants IA bienvenus (SEO et GEO)\nUser-agent: *\nAllow: /\nDisallow: /panier/\nDisallow: /commande/\nDisallow: /api/\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
writeFileSync(join(dist, 'robots.txt'), robots);

// Pages de renvoi des anciennes adresses (utile quand l'hébergeur ne lit pas .htaccess, ex. GitHub Pages).
const rules = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));
for (const [from, to] of rules) {
  const target = BASE + to;
  writeFileSync(join(dist, from.replace(/^\//, '')), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Page déplacée</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE}${to}"><meta http-equiv="refresh" content="0; url=${target}"></head><body><p>Cette page a déménagé : <a href="${target}">${SITE}${to}</a></p></body></html>\n`);
}
writeFileSync(join(dist, '.nojekyll'), '');
if (PREVIEW) writeFileSync(join(dist, '_headers'), '/*\n  X-Robots-Tag: noindex\n');
console.log(`postbuild : ${urls.length} pages au sitemap, ${rules.length} renvois${PREVIEW ? ' (préversion, noindex)' : ''}`);

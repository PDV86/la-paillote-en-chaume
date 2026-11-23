// Contrôles SEO sur dist/ : un seul H1, title et meta, canonical, alt, liens internes, JSON-LD valide, fichiers clés.
// « npm run check -- --prod » échoue aussi s'il reste des mentions [À VALIDER] / [À COMPLÉTER].
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
const dist = new URL('../dist/', import.meta.url).pathname;
const SITE = (process.env.SITE_URL || 'https://www.la-paillote-en-chaume.com').replace(/\/$/, '');
const BASE = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const PROD = process.argv.includes('--prod');
const pages = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f === 'index.html') pages.push(p); } })(dist);
const paths = new Set(pages.map((p) => '/' + relative(dist, p).replace(/index\.html$/, '')));
const problems = []; const todos = {};
for (const file of pages) {
  const path = '/' + relative(dist, file).replace(/index\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const h1 = (html.match(/<h1[\s>]/g) || []).length; if (h1 !== 1) problems.push(`${path} : ${h1} H1`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || ''; if (!title) problems.push(`${path} : pas de title`); else if (title.length > 68) problems.push(`${path} : title ${title.length} car.`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '').replace(/&#39;|&amp;|&quot;/g, 'x'); if (!desc) problems.push(`${path} : pas de meta description`); else if (desc.length > 165 || desc.length < 110) problems.push(`${path} : meta ${desc.length} car.`);
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]; if (path !== '/404/' && canon !== SITE + path) problems.push(`${path} : canonical ${canon}`);
  for (const m of html.matchAll(/<img([^>]*)>/g)) if (!/\balt=/.test(m[1])) problems.push(`${path} : image sans alt`);
  for (const m of html.matchAll(/href="([^"#?]*)"/g)) {
    let h = m[1]; if (!h.startsWith('/') || h.startsWith('//')) continue;
    if (BASE && h.startsWith(BASE + '/')) h = h.slice(BASE.length); else if (BASE) { problems.push(`${path} : lien sans préfixe ${h}`); continue; }
    if (/\.(xml|txt|ico|svg|png|webp|jpg|pdf|json|php|css|js)$/.test(h) || h.startsWith('/_astro/') || h.startsWith('/pics/')) continue;
    if (!h.endsWith('/')) problems.push(`${path} : lien sans slash final ${h}`); else if (!paths.has(h)) problems.push(`${path} : lien interne cassé ${h}`);
  }
  for (const m of html.matchAll(/<script type="application\/(?:ld\+)?json"[^>]*>([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { problems.push(`${path} : JSON invalide`); } }
  const n = (html.replace(/<script[\s\S]*?<\/script>/g, '').match(/\[À (VALIDER|COMPLÉTER)/g) || []).length; if (n) todos[path] = n;
}
for (const f of ['sitemap.xml', 'robots.txt', 'llms.txt', '404.html', '.htaccess', 'api/catalogue.json']) if (!existsSync(join(dist, f))) problems.push(`fichier manquant : ${f}`);
const nTodo = Object.values(todos).reduce((a, b) => a + b, 0);
console.log(`${pages.length} pages contrôlées · ${nTodo} mentions à valider sur ${Object.keys(todos).length} pages`);
if (PROD && nTodo) problems.push(...Object.entries(todos).map(([p, n]) => `${p} : ${n} mention(s) [À VALIDER] restantes`));
if (problems.length) { console.log(problems.join('\n')); process.exit(1); } else console.log('✔ aucun problème');

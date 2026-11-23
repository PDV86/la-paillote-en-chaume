// Génère public/.htaccess (hébergement Apache, ex. Hostinger) à partir de public/_redirects.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../public/', import.meta.url);
const rules = readFileSync(new URL('_redirects', root), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));
const esc = (s) => s.replace(/^\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const out = `# Généré par scripts/build-htaccess.mjs — ne pas modifier à la main.
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddDefaultCharset UTF-8

<IfModule mod_rewrite.c>
RewriteEngine On
# HTTPS et www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteRule ^ https://www.la-paillote-en-chaume.com%{REQUEST_URI} [R=301,L]
# Anciennes adresses
${rules.map(([from, to, code]) => `RewriteRule ^${esc(from)}$ ${to} [R=${code || 301},L]`).join('\n')}
# Slash final
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} !/$
RewriteCond %{REQUEST_URI} !\\.[a-zA-Z0-9]{2,5}$
RewriteRule ^(.*)$ /$1/ [R=301,L]
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml text/plain application/xml
</IfModule>
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/webp "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType image/png "access plus 1 year"
ExpiresByType image/svg+xml "access plus 1 year"
ExpiresByType font/woff2 "access plus 1 year"
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType text/html "access plus 0 seconds"
</IfModule>
<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
<FilesMatch "\\.(webp|jpe?g|png|svg|woff2)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
</IfModule>
`;
writeFileSync(new URL('.htaccess', root), out);
console.log(`.htaccess : ${rules.length} redirections`);

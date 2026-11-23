# la-paillote-en-chaume.com — nouveau site (Astro)

Site de SEREPI – La paillote en chaume : boutique de tuiles de chaume (particuliers TTC / professionnels HT),
paillotes Bora et Moorea, renouvellement du chaume, guides, devis. Site statique Astro + TypeScript,
construit pour le référencement Google (SEO) et les moteurs IA (GEO), sur le modèle de pepitesdevin-site.

**Version de test** : https://pdv86.github.io/la-paillote-en-chaume/ — publiée automatiquement à chaque modification
de `main` (`.github/workflows/pages.yml`). Non indexée, commandes et formulaires simulés.
Les mentions en jaune « [À VALIDER] » / « [À COMPLÉTER] » restent à trancher avant la mise en ligne.

## Commandes
- `npm install` puis `npm run build` → `dist/` prêt à déposer (sitemap, robots, llms.txt, `.htaccess`, renvois des anciennes pages).
- `npm run check` → contrôles SEO sur `dist/` (un seul H1, title et meta, canonical, alt, liens internes, JSON-LD).
- `npm run check -- --prod` → échoue tant qu’il reste des mentions à valider.
- Version de test en local : `PREVIEW=1 BASE_PATH=/la-paillote-en-chaume npm run build`.

## Où est quoi
- `src/data/catalogue.ts` — produits et prix HT (tuile 23 € / 19 € dès 12, cône 65 €, tuile d’angle 28 €), modèles, frais de port.
  Source unique : pages, panier, `api/catalogue.json` (prix recalculés par le serveur) et `llms.txt`.
- `src/data/site.ts` — coordonnées (même téléphone que la fiche Google), mentions légales, menus, références clients.
- `src/data/faq.ts`, `src/data/guides.ts`, `src/data/realisations.ts` — FAQ, guides, mur de réalisations.
- `src/lib/seo.ts` — JSON-LD : Organization/OnlineStore, WebSite, BreadcrumbList, Product + Offer (prix dégressif,
  expédition, retours 14 jours), FAQPage, HowTo, Article, ItemList.
- `src/scripts/shop.ts` — affichage TTC/HT, panier, calculateur, visionneuse, formulaires.
- `public/_redirects` — anciennes pages `.htm` → nouvelles adresses (301). `scripts/build-htaccess.mjs` en tire `.htaccess`.
- `public/api/` — `devis.php` (demande par e-mail avec photos) et `commande.php` (Stripe Checkout ou virement),
  secrets dans `config.php` (non versionné, modèle `config.example.php`).
- `public/images/` — photos SEREPI en WebP (480 à 2000 px).

## Mise en ligne (à faire le moment venu)
1. Trancher les mentions à valider, rédiger les CGV et les mentions légales, arrêter la grille de frais de port.
2. `npm run build` sans `PREVIEW` ni `BASE_PATH`, puis `npm run check -- --prod`.
3. Déposer `dist/` chez l’hébergeur (Apache/PHP, ex. Hostinger comme Pépites de Vin) ; créer `api/config.php`.
4. Copier le dossier `pics/` de l’ancien site (notices PDF) à la racine : leurs adresses ne changent pas.
5. Search Console : soumettre `sitemap.xml`, vérifier les redirections des anciennes pages `.htm`.

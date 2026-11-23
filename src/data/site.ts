// Coordonnées et réglages généraux. Toute valeur entre crochets « [À VALIDER] » / « [À COMPLÉTER] »
// s'affiche en jaune sur le site de test et bloque la mise en production (npm run check -- --prod).

export const SITE = {
  url: 'https://www.la-paillote-en-chaume.com',
  name: 'La paillote en chaume',
  company: 'SEREPI',
  brand: 'SEREPI - La paillote en chaume',
  tagline: 'Paillotes et tuiles de chaume naturel',
  since: 'depuis une vingtaine d’années',
  // Même numéro que la fiche Google Business Profile « La Paillote en Chaume » (cohérence NAP).
  tel: '06 37 10 94 63',
  telIntl: '+33637109463',
  email: 'info@la-paillote-en-chaume.com',
  emailTodo: '[À VALIDER : adresse e-mail qui reçoit les commandes]',
  hours: '[À VALIDER : horaires de réponse]',
  responseTime: '[À VALIDER : délai de réponse]',
  // Entreprise sans adresse affichée (livraison uniquement), comme sur la fiche Google.
  area: 'Livraison France entière, Corse comprise',
  ogImage: '/images/og-la-paillote-en-chaume.jpg',
  logo: '/favicon.svg',
  googleProfile: '', // [À COMPLÉTER : lien de la fiche Google]
  tva: 0.2,
  shipDelay: 'expédiées sous 8 jours',
  legal: {
    form: '[À COMPLÉTER : forme juridique et capital]',
    siren: '[À COMPLÉTER : SIREN]',
    rcs: '[À COMPLÉTER : RCS]',
    tvaNumber: '[À COMPLÉTER : n° de TVA intracommunautaire]',
    address: '[À COMPLÉTER : adresse du siège social]',
    director: '[À COMPLÉTER : directeur de la publication]',
    host: '[À COMPLÉTER : hébergeur]',
    mediator: '[À COMPLÉTER : médiateur de la consommation]',
  },
} as const;

export const NAV = [
  { label: 'Tuiles de chaume', path: '/tuiles-de-chaume/' },
  { label: 'Renouveler son chaume', path: '/renouvellement-chaume/' },
  { label: 'Paillotes', path: '/paillotes-en-chaume/' },
  { label: 'Professionnels', path: '/professionnels/' },
  { label: 'Réalisations', path: '/realisations/' },
  { label: 'Conseils', path: '/conseils/' },
] as const;

export const FOOTER_LINKS = [
  { label: 'Tuiles de chaume', path: '/tuiles-de-chaume/' },
  { label: 'Calculateur de tuiles', path: '/calculateur-tuiles-de-chaume/' },
  { label: 'Renouveler son chaume', path: '/renouvellement-chaume/' },
  { label: 'Paillote Bora', path: '/paillotes-en-chaume/bora/' },
  { label: 'Paillote Moorea', path: '/paillotes-en-chaume/moorea/' },
  { label: 'Professionnels', path: '/professionnels/' },
  { label: 'Réalisations', path: '/realisations/' },
  { label: 'Conseils et guides', path: '/conseils/' },
  { label: 'Notices de montage', path: '/notices-de-montage/' },
  { label: 'Livraison', path: '/livraison/' },
  { label: 'Questions fréquentes', path: '/faq/' },
  { label: 'Contact', path: '/contact/' },
] as const;

/** Références clients reprises du site actuel. */
export const REFS = ['Bois Masson', 'Lou Pignada', 'Cigoland', 'New Beach', 'Les Pierres Couchées', 'Alsafun', 'Garbiso'];

import { SITE } from '../data/site';
import { TVA, type Product } from '../data/catalogue';
import { IMAGES } from '../data/images';

export type Crumb = { name: string; path: string };

export const abs = (p: string) => (p.startsWith('http') ? p : SITE.url + p);
export const imgAbs = (key: string, w?: number) => {
  const m = IMAGES[key];
  const width = w && m?.widths.includes(w) ? w : m?.widths[m.widths.length - 1];
  return abs(`/images/${key}-${width}.webp`);
};

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\[À (VALIDER|COMPLÉTER)[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();

/** Entité principale, reprise sur toutes les pages (même @id partout : utile au SEO comme aux moteurs IA). */
export function orgGraph() {
  return [
    {
      '@type': ['Organization', 'OnlineStore'],
      '@id': ORG_ID,
      name: SITE.brand,
      alternateName: [SITE.name, SITE.company],
      url: SITE.url + '/',
      logo: { '@type': 'ImageObject', url: abs('/images/logo-512.png'), width: 512, height: 512 },
      image: abs(SITE.ogImage),
      telephone: SITE.telIntl,
      description: 'SEREPI fournit des paillotes en chaume à monter soi-même et vend en ligne des tuiles de chaume naturel (roseau d’Afrique du Sud) pour couvrir ou renouveler tout modèle de paillote. Livraison France entière.',
      areaServed: { '@type': 'Country', name: 'France' },
      knowsAbout: ['tuiles de chaume', 'chaume naturel', 'paillote en chaume', 'parasol en chaume', 'roseau Thamnochortus', 'renouvellement de toiture en chaume'],
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: SITE.telIntl, availableLanguage: ['French'], areaServed: 'FR' }],
      ...(SITE.googleProfile ? { sameAs: [SITE.googleProfile] } : {}),
    },
    { '@type': 'WebSite', '@id': SITE_ID, url: SITE.url + '/', name: SITE.name, alternateName: SITE.brand, publisher: { '@id': ORG_ID }, inLanguage: 'fr-FR' },
  ];
}

export function webPageLd(o: { path: string; title: string; description: string; type?: string; image?: string; dateModified?: string }) {
  return {
    '@type': o.type || 'WebPage',
    '@id': `${abs(o.path)}#webpage`,
    url: abs(o.path),
    name: o.title,
    description: o.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    ...(o.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: abs(o.image) } } : {}),
    ...(o.dateModified ? { dateModified: o.dateModified } : {}),
  };
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return { '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })) };
}

export function faqLd(items: readonly (readonly [string, string])[]) {
  return { '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) };
}

/** Fiche produit : prix TTC (prix payé par un particulier), palier dégressif, retour 14 jours (droit légal de rétractation). */
export function productLd(p: Product, path: string) {
  const price = (ht: number) => (Math.round(ht * (1 + TVA) * 100) / 100).toFixed(2);
  const specs: any[] = [];
  if (p.unitHT != null) {
    specs.push({ '@type': 'UnitPriceSpecification', price: price(p.unitHT), priceCurrency: 'EUR', valueAddedTaxIncluded: true, ...(p.tier ? { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: 1, maxValue: p.tier.min - 1, unitCode: 'C62' } } : {}) });
    if (p.tier) specs.push({ '@type': 'UnitPriceSpecification', price: price(p.tier.unitHT), priceCurrency: 'EUR', valueAddedTaxIncluded: true, eligibleQuantity: { '@type': 'QuantitativeValue', minValue: p.tier.min, unitCode: 'C62' } });
  }
  return {
    '@type': 'Product',
    '@id': `${abs(path)}#product`,
    name: p.name,
    description: strip(p.intro),
    sku: `SEREPI-${p.id.toUpperCase()}`,
    brand: { '@type': 'Brand', name: SITE.company },
    category: 'Tuiles de chaume',
    material: 'Roseau Thamnochortus d’Afrique du Sud',
    ...(p.image ? { image: [imgAbs(p.image)] } : {}),
    additionalProperty: p.specs.map(([n, v]) => ({ '@type': 'PropertyValue', name: n, value: strip(v) })),
    ...(p.unitHT != null
      ? {
          offers: {
            '@type': 'Offer',
            url: abs(path),
            priceCurrency: 'EUR',
            price: price(p.unitHT),
            priceSpecification: specs,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': ORG_ID },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
              deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 8, unitCode: 'DAY' } },
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'FR',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: 14,
              returnMethod: 'https://schema.org/ReturnByMail',
            },
          },
        }
      : {}),
  };
}

export function howToLd(o: { path: string; name: string; description: string; steps: { name: string; text: string }[]; supply?: string[]; tool?: string[] }) {
  return {
    '@type': 'HowTo',
    '@id': `${abs(o.path)}#howto`,
    name: o.name,
    description: o.description,
    inLanguage: 'fr-FR',
    ...(o.supply ? { supply: o.supply.map((s) => ({ '@type': 'HowToSupply', name: s })) } : {}),
    ...(o.tool ? { tool: o.tool.map((s) => ({ '@type': 'HowToTool', name: s })) } : {}),
    step: o.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text, url: `${abs(o.path)}#etape-${i + 1}` })),
  };
}

export function articleLd(o: { path: string; title: string; description: string; image?: string; datePublished: string; dateModified: string }) {
  return {
    '@type': 'Article',
    '@id': `${abs(o.path)}#article`,
    headline: o.title,
    description: o.description,
    inLanguage: 'fr-FR',
    mainEntityOfPage: { '@id': `${abs(o.path)}#webpage` },
    image: [o.image ? abs(o.image) : abs(SITE.ogImage)],
    datePublished: o.datePublished,
    dateModified: o.dateModified,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

export function itemListLd(path: string, items: { name: string; path: string }[]) {
  return { '@type': 'ItemList', '@id': `${abs(path)}#list`, itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })) };
}

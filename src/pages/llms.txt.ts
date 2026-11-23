// llms.txt : fiche d'identité lisible par les assistants IA (ChatGPT, Claude, Perplexity, Gemini…).
// Généré depuis les mêmes données que le site : les prix et les quantités restent à jour.
import { SITE } from '../data/site';
import { PRODUCTS, MODELS, TVA } from '../data/catalogue';
import { GUIDES } from '../data/guides';
import { FAQ_ALL } from '../data/faq';
import { plain } from '../lib/text';
const U = (p: string) => SITE.url + p;
const e = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
export const GET = () => {
  const lines = [
    `# ${SITE.brand}`,
    '',
    `> SEREPI vend en ligne des tuiles de chaume naturel (roseau Thamnochortus d’Afrique du Sud) pour couvrir ou renouveler le toit de toute paillote, SEREPI ou d’une autre marque, et fournit sur demande la paillote en chaume Bora (Ø 2 m) à monter soi-même. Vente à distance uniquement, aux particuliers (prix TTC) et aux professionnels (prix HT), livraison France entière, Corse comprise. Commandes expédiées sous 8 jours sur palette filmée.`,
    '',
    '## Faits clés',
    `- Entreprise : SEREPI, marque « La paillote en chaume », ${SITE.since}.`,
    `- Téléphone : ${SITE.tel}. Site : ${SITE.url}/`,
    ...PRODUCTS.map((p) => `- ${p.name} (${p.spec}) : ${p.unitHT != null ? `${e(p.unitHT)} HT (${e(p.unitHT * (1 + TVA))} TTC) ${p.per}` : 'prix sur demande'}${p.tier ? `, ${e(p.tier.unitHT)} HT (${e(p.tier.unitHT * (1 + TVA))} TTC) dès ${p.tier.min} unités` : ''}. ${U(`/tuiles-de-chaume/${p.slug}/`)}`),
    `- Paillote Bora : Ø 2,00 m, 3 rangées, 8 tuiles standard et 1 cône de faîtage, structure acier, mât en pin Ø 100 mm traité autoclave classe 4. Sur devis. ${U('/paillotes-en-chaume/bora/')}`,
    `- Paillote Moorea : Ø 2,80 m, 5 rangées, structure aluminium ; bientôt de nouveau proposée, tuiles de rechange disponibles. ${U('/paillotes-en-chaume/moorea/')}`,
    '- Environ 4 tuiles par m² de toiture mesurée en pente. Pente conseillée : 30° à 40°.',
    '- Durée de vie du chaume : 8 à 12 ans selon le climat (plus de 12 ans au soleil, 6 à 12 ans en climat tempéré). Aucun entretien ; l’hivernage la prolonge.',
    '- Fixation des tuiles : crochets en nylon, clous ou agrafes. Rangées du bas vers le haut, cône de faîtage au sommet.',
    '- Professionnels (campings, bars de plage, parcs de loisirs, résidences, golfs) : prix HT, devis dédié dès 4 paillotes.',
    '- SEREPI ne réalise pas de toitures de chaumières et ne propose pas de structures sur mesure pour le moment.',
    '',
    '## Pages principales',
    `- [Tuiles de chaume (boutique)](${U('/tuiles-de-chaume/')})`,
    `- [Renouveler le chaume d’une paillote](${U('/renouvellement-chaume/')})`,
    `- [Calculateur de tuiles de chaume](${U('/calculateur-tuiles-de-chaume/')})`,
    `- [Paillotes en chaume](${U('/paillotes-en-chaume/')})`,
    `- [Professionnels](${U('/professionnels/')})`,
    `- [Livraison et retours](${U('/livraison/')})`,
    `- [Questions fréquentes](${U('/faq/')})`,
    `- [Notices de montage](${U('/notices-de-montage/')})`,
    `- [Contact et devis](${U('/devis/')})`,
    '',
    '## Guides',
    ...GUIDES.map((g) => `- [${g.title}](${U(`/conseils/${g.slug}/`)}) : ${g.short}`),
    '',
    '## Questions fréquentes',
    ...FAQ_ALL.map(([q, a]) => `- ${q} ${plain(a)}`),
    '',
  ];
  void MODELS;
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

// Catalogue et prix. Prix de référence en euros HORS TAXES ; le site affiche le TTC aux particuliers
// et le HT aux professionnels. Source unique : les pages, le panier, le JSON servi à l'API de commande
// (/api/catalogue.json) et llms.txt lisent tous ce fichier.

export type Tier = { min: number; unitHT: number };
export type Product = {
  id: string;
  slug: string;
  name: string;
  cartName: string;
  short: string;
  spec: string;
  pack: string;
  per: string;            // « la tuile », « le cône »…
  unitHT: number | null;  // null = prix à confirmer, non commandable en ligne
  tier?: Tier;            // prix dégressif à partir de N unités
  priceTodo?: string;
  image?: string;         // clé dans IMAGES
  alt: string;
  intro: string;
  details: string[];
  specs: [string, string][];
  usage: string;
  faq: [string, string][];
};

export const TVA = 0.2;

export const PRODUCTS: Product[] = [
  {
    id: 'tuile',
    slug: 'tuile-standard',
    name: 'Tuile de chaume standard',
    cartName: 'Tuile de chaume standard 80 × 42 cm',
    short: 'La tuile qui couvre l’essentiel du toit, en roseau d’Afrique du Sud.',
    spec: '80 × 42 cm · ép. 5 cm',
    pack: 'Vendue à l’unité · 4 tuiles ≈ 1 m²',
    per: 'la tuile',
    unitHT: 23,
    tier: { min: 12, unitHT: 19 },
    image: 'produit-tuile-standard',
    alt: 'Tuile de chaume standard en roseau, 80 × 42 cm, vue de face',
    intro: 'La tuile de chaume standard est un panneau souple de roseau d’Afrique du Sud, prêt à fixer sur la structure d’une paillote. Elle sert à couvrir un toit neuf comme à renouveler le chaume d’une paillote existante, quel que soit son modèle.',
    details: [
      'Tiges de roseau Thamnochortus liées entre elles par une capsule en polyuréthane renforcée d’une maille nylon : la tuile reste souple et épouse la forme du toit.',
      'Chaque tuile est munie en partie haute de crochets en nylon pour une pose rapide. Elle peut aussi être clouée ou agrafée.',
      'Les rangées se superposent du bas vers le haut ; le sommet du toit se coiffe d’un cône de faîtage.',
    ],
    specs: [
      ['Dimensions', '80 × 42 cm'],
      ['Épaisseur', '5 cm'],
      ['Matière', 'Roseau Thamnochortus d’Afrique du Sud, capsule polyuréthane et maille nylon'],
      ['Fixation', 'Crochets nylon fournis, ou clous, ou agrafes'],
      ['Couverture', 'Environ 4 tuiles par m² de toiture'],
      ['Pente conseillée', '30° à 40°'],
      ['Durée de vie', '8 à 12 ans selon le climat'],
    ],
    usage: 'Une paillote Bora (Ø 2 m) demande 8 tuiles standard et 1 cône de faîtage.',
    faq: [
      ['Le prix est-il plus bas à partir de 12 tuiles ?', 'Oui. En dessous de 12 tuiles, la tuile standard est à 23 € HT. À partir de 12 tuiles, elle passe à 19 € HT, pour toutes les tuiles de la commande.'],
      ['Combien de tuiles pour ma paillote ?', 'Une Bora (Ø 2 m) demande 8 tuiles et 1 cône. Pour un autre toit, comptez environ 4 tuiles par m² de toiture mesurée en pente : le calculateur fait le compte.'],
    ],
  },
  {
    id: 'cone',
    slug: 'cone-de-faitage',
    name: 'Cône de faîtage',
    cartName: 'Cône de faîtage Ø 85 cm',
    short: 'Le chapeau de chaume qui coiffe le sommet des toits ronds.',
    spec: 'Ø 85 cm · ép. 5 cm',
    pack: 'Vendu à l’unité',
    per: 'le cône',
    unitHT: 65,
    image: 'produit-cone-de-faitage',
    alt: 'Cône de faîtage en chaume de 85 cm de diamètre, vu de face',
    intro: 'Le cône de faîtage, aussi appelé chapeau de chaume, se pose en dernier au sommet d’un toit rond ou conique. Il recouvre le haut des dernières rangées de tuiles et assure l’étanchéité du sommet.',
    details: [
      'Il se pose sur le haut de la structure une fois toutes les rangées de tuiles en place.',
      'L’intérieur du cône se fixe à la structure par des fils, puis on l’ajuste pour qu’aucun jour n’apparaisse entre les tuiles.',
    ],
    specs: [
      ['Diamètre', '85 cm'],
      ['Épaisseur', '5 cm'],
      ['Matière', 'Roseau Thamnochortus d’Afrique du Sud'],
      ['Usage', 'Sommet des paillotes et parasols à toit rond (Bora, Moorea…)'],
    ],
    usage: 'Un cône par toit rond : la Bora en demande un.',
    faq: [
      ['Faut-il un cône pour chaque paillote ?', 'Oui, un cône coiffe le sommet de chaque toit rond ou conique. Les toits à deux pans se terminent par des faîtières en V.'],
    ],
  },
  {
    id: 'angle',
    slug: 'tuile-d-angle',
    name: 'Tuile d’angle',
    cartName: 'Tuile d’angle 74 × 56 cm',
    short: 'Pour couvrir les arêtes des toits à plusieurs pans.',
    spec: '74 × 56 cm · ép. 5 cm',
    pack: 'Vendue à l’unité',
    per: 'la tuile',
    unitHT: 28,
    image: 'produit-tuile-d-angle',
    alt: 'Tuile d’angle en chaume de 74 × 56 cm, vue de face',
    intro: 'La tuile d’angle couvre les arêtes des toits à plusieurs pans, là où deux pans se rejoignent. Elle complète les tuiles standard sur les paillotes et kiosques à toit pyramidal.',
    details: ['Elle se pose sur les arêtes, après les tuiles standard des pans.'],
    specs: [
      ['Dimensions', '74 × 56 cm'],
      ['Épaisseur', '5 cm'],
      ['Matière', 'Roseau Thamnochortus d’Afrique du Sud'],
      ['Usage', 'Arêtes des toits à plusieurs pans'],
    ],
    usage: 'Une tuile d’angle par rangée et par arête. [À VALIDER : règle de pose]',
    faq: [],
  },
  {
    id: 'faitiere',
    slug: 'faitiere-en-v',
    name: 'Faîtière en V',
    cartName: 'Faîtière en V',
    short: 'Pour le faîtage horizontal des toits à deux pans.',
    spec: '80 × 42 cm · ép. 5 cm',
    pack: 'Vendue à l’unité',
    per: 'la faîtière',
    unitHT: null,
    priceTodo: '[À VALIDER : 65 € ou 72 € HT]',
    alt: 'Faîtière en V en chaume',
    intro: 'La faîtière en V couvre la ligne de faîtage horizontale des toits à deux pans. Elle se pose à cheval sur le sommet, après les tuiles standard des deux pans.',
    details: ['Elle se pose à cheval sur la ligne de faîtage.'],
    specs: [
      ['Dimensions', '80 × 42 cm'],
      ['Épaisseur', '5 cm'],
      ['Matière', 'Roseau Thamnochortus d’Afrique du Sud'],
      ['Usage', 'Faîtage horizontal des toits à deux pans'],
    ],
    usage: 'Le nombre de faîtières dépend de la longueur du faîtage. [À VALIDER : règle de pose]',
    faq: [],
  },
];

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

/** Modèles de paillote : utilisés par le calculateur et les pages paillotes. */
export const MODELS = [
  { id: 'bora', name: 'Bora', diam: '2,00 m', rows: 3, tiles: 8 as number | null, cones: 1, available: true, slug: 'bora' },
  { id: 'moorea', name: 'Moorea', diam: '2,80 m', rows: 5, tiles: null as number | null, cones: 1, available: false, slug: 'moorea' },
  { id: 'acapulco', name: 'Acapulco', diam: '3,80 m', rows: 6, tiles: null as number | null, cones: 1, available: false, slug: '' },
] as const;

export const TILES_PER_M2 = 4; // [À VALIDER : règle] - le site actuel indique « boîte de 6 ≈ 1,5 m² »

export const unitPrice = (p: Product, qty: number) => (p.tier && qty >= p.tier.min ? p.tier.unitHT : p.unitHT ?? 0);
export const ttc = (ht: number) => Math.round(ht * (1 + TVA) * 100) / 100;
export const eur = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

/** Frais de port : la grille par zone n'est pas encore arrêtée (classeur « SEREPI_frais_de_livraison.xlsx »). */
export const SHIPPING = {
  ready: false,
  todo: '[À VALIDER : grille de frais de port par zone]',
};

// Questions fréquentes. Chaque réponse commence par la réponse directe (lisible telle quelle
// par Google et par les assistants IA), puis précise. Sources : site actuel, notices SEREPI, décisions de Thomas.

export type QA = readonly [string, string];

export const FAQ_COMMANDE: QA[] = [
  ['Puis-je commander une paillote complète en ligne ?', 'Pas pour le moment. La paillote Bora se commande sur demande : appelez-nous ou envoyez une demande de devis, nous établissons un prix et un délai. La Moorea sera de nouveau proposée prochainement. Les tuiles de chaume, cônes de faîtage et tuiles d’angle se commandent en ligne et sont expédiés sous 8 jours.'],
  ['Le prix de la tuile est-il plus bas à partir de 12 tuiles ?', 'Oui. La tuile de chaume standard est à 23 € HT l’unité en dessous de 12 tuiles, puis à 19 € HT à partir de 12 tuiles, pour toutes les tuiles de la commande.'],
  ['Les professionnels voient-ils les prix hors taxes ?', 'Oui. Le sélecteur « Pro » en haut de page affiche tous les prix hors taxes. La commande professionnelle demande la raison sociale et le numéro SIRET, et la facture fait apparaître la TVA. À partir de 4 paillotes, un devis dédié est établi.'],
  ['Comment puis-je payer ?', 'Par carte bancaire sur une page de paiement sécurisé, ou par virement. [À VALIDER : prestataire de paiement]'],
  ['Livrez-vous partout en France ?', 'Oui, France entière, Corse comprise. Les commandes sont expédiées sous 8 jours, sur palette filmée ; le délai de transport dépend ensuite de la destination. [À VALIDER : délai de transport et grille de frais de port par zone]'],
];

export const FAQ_CHAUME: QA[] = [
  ['Vendez-vous des tuiles pour une paillote d’une autre marque ?', 'Oui. Le renouvellement du chaume est possible pour tous les modèles de paillote, SEREPI ou non : les tuiles se posent sur la structure existante, par crochets en nylon, clous ou agrafes. Le calculateur donne les quantités à partir du modèle ou de la surface de toiture.'],
  ['Combien de tuiles faut-il pour une paillote Bora ?', 'Une paillote Bora de 2 m de diamètre demande 8 tuiles de chaume standard et 1 cône de faîtage.'],
  ['Combien de temps dure le chaume ?', 'De 8 à 12 ans selon le climat. Il peut dépasser 12 ans dans les régions ensoleillées ou les endroits abrités ; en climat tempéré et humide, comptez plutôt 6 à 12 ans. Démonter les tuiles pendant l’hiver prolonge leur durée de vie.'],
  ['Puis-je remplacer seulement le chaume ?', 'Oui. La structure de la paillote dure : seule la couverture se remplace. Tuiles, cônes de faîtage et tuiles d’angle sont vendus à l’unité et expédiés sous 8 jours.'],
  ['Le chaume demande-t-il un entretien ?', 'Non, la couverture en tuiles de roseau ne demande pas d’entretien. Pour la faire durer plus longtemps, vous pouvez démonter les tuiles en hiver et les remettre au printemps.'],
  ['Quelle pente pour un toit en tuiles de chaume ?', 'Une pente comprise entre 30° et 40° par rapport au sol. C’est elle qui garantit le meilleur écoulement de l’eau et donc l’étanchéité de la couverture.'],
  ['Comment se fixent les tuiles de chaume ?', 'Chaque tuile porte en partie haute des crochets en nylon qui s’accrochent à la structure. Les tuiles peuvent aussi être clouées ou agrafées sur une charpente en bois. Les rangées se posent du bas vers le haut et se recouvrent ; un cône de faîtage coiffe le sommet.'],
  ['De quoi est fait le chaume SEREPI ?', 'De roseau d’Afrique du Sud, de la variété Thamnochortus : une tige rigide, solide et pleine. Les tiges sont liées entre elles par une capsule en polyuréthane renforcée d’une maille nylon, ce qui donne des panneaux souples, appelés tuiles, qui épousent la forme du toit.'],
];

export const FAQ_PAILLOTE: QA[] = [
  ['Puis-je monter la paillote moi-même ?', 'Oui. Les paillotes SEREPI sont conçues pour être montées et démontées sans professionnel. Chaque modèle a sa notice de montage.'],
  ['En quoi est faite la structure des paillotes ?', 'La structure est en acier pour la Bora, en aluminium anodisé pour la Moorea, sur un mât central en pin traité autoclave classe 4 de forte section. Le chaume se fixe dessus par crochets en nylon.'],
  ['Réalisez-vous des toitures de chaumières ?', 'Non. SEREPI fournit des paillotes en chaume à monter soi-même et les tuiles de chaume pour renouveler toute paillote, quel que soit son modèle.'],
  ['Fabriquez-vous des paillotes sur mesure ?', 'Pas pour le moment. Les pergolas, kiosques et bars sur mesure ne sont pas proposés ; nous fournissons en revanche les tuiles de chaume pour couvrir votre propre structure.'],
];

export const FAQ_ALL: QA[] = [...FAQ_COMMANDE, ...FAQ_CHAUME, ...FAQ_PAILLOTE];

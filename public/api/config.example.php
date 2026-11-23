<?php
// Copier en config.php sur l'hébergement (jamais dans le dépôt) puis remplir.
return [
  'mail_to'        => 'info@la-paillote-en-chaume.com',   // boîte qui reçoit devis et commandes [À VALIDER]
  'mail_from'      => 'site@la-paillote-en-chaume.com',   // expéditeur technique du domaine
  'site_url'       => 'https://www.la-paillote-en-chaume.com',
  'stripe_secret'  => '',                                 // sk_live_… (laisser vide : paiement par carte désactivé)
  'rib'            => "[À COMPLÉTER : titulaire, IBAN, BIC]",
  // Frais de port HT selon le code postal et le nombre de pièces. Retourner null tant que la grille n'est pas arrêtée.
  'frais_port'     => function (string $cp, int $nbPieces): ?float { return null; },
];

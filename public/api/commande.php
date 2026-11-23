<?php
// Commande en ligne : recalcule le panier à partir du catalogue (jamais les prix envoyés par le navigateur),
// puis ouvre le paiement Stripe Checkout (carte) ou confirme une commande payable par virement.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
function fail(int $code, string $msg) { http_response_code($code); echo json_encode(['error' => $msg]); exit; }
$cfg = @include __DIR__ . '/config.php';
if (!is_array($cfg)) fail(503, 'configuration absente');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'méthode');
$in = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($in) || empty($in['lines']) || !is_array($in['lines'])) fail(400, 'panier vide');

$cat = json_decode((string)file_get_contents(__DIR__ . '/catalogue.json'), true);
$byId = []; foreach ($cat['products'] as $p) $byId[$p['id']] = $p;
$tva = (float)$cat['tva'];

// Client
$c = is_array($in['customer'] ?? null) ? $in['customer'] : [];
$g = fn(string $k, int $max = 200) => mb_substr(trim((string)($c[$k] ?? '')), 0, $max);
$pro = ($in['client'] ?? '') === 'pro';
foreach (['prenom', 'nom', 'email', 'telephone', 'adresse', 'cp', 'ville'] as $k) if ($g($k) === '') fail(422, "champ manquant : $k");
if (!filter_var($g('email'), FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{5}$/', $g('cp'))) fail(422, 'e-mail ou code postal invalide');
if (empty($c['cgv'])) fail(422, 'CGV non acceptées');
if ($pro && ($g('societe') === '' || !preg_match('/^\d{14}$/', preg_replace('/\s/', '', $g('siret'))))) fail(422, 'raison sociale ou SIRET invalide');

// Lignes recalculées
$lines = []; $ht = 0.0; $pieces = 0;
foreach ($in['lines'] as $l) {
  $id = (string)($l['id'] ?? ''); $q = (int)($l['qty'] ?? 0);
  if (!isset($byId[$id]) || $q < 1 || $q > 999) fail(422, 'ligne invalide');
  $p = $byId[$id];
  $u = (!empty($p['tier']) && $q >= (int)$p['tier']['min']) ? (float)$p['tier']['unitHT'] : (float)$p['unitHT'];
  $lines[] = ['name' => $p['name'], 'qty' => $q, 'unitHT' => $u, 'totalHT' => round($u * $q, 2)];
  $ht += $u * $q; $pieces += $q;
}
$port = ($cfg['frais_port'])($g('cp'), $pieces);
if ($port === null || empty($cat['shippingReady'])) fail(503, 'frais de port non configurés');
$ht = round($ht + $port, 2); $ttc = round($ht * (1 + $tva), 2);
$num = 'C' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));
$eur = fn(float $n) => number_format($n, 2, ',', ' ') . ' €';

$recap = "Commande $num (" . ($pro ? 'professionnel' : 'particulier') . ")\n\n";
foreach ($lines as $l) $recap .= "- {$l['qty']} × {$l['name']} à " . $eur($l['unitHT']) . ' HT = ' . $eur($l['totalHT']) . " HT\n";
$recap .= '- Livraison : ' . $eur($port) . " HT\n\nTotal HT : " . $eur($ht) . "\nTotal TTC : " . $eur($ttc) . "\n\n"
  . ($pro ? 'Société : ' . $g('societe') . ' · SIRET : ' . $g('siret') . ' · TVA : ' . $g('tva') . ' · Réf. : ' . $g('reference') . "\n" : '')
  . 'Client : ' . $g('prenom') . ' ' . $g('nom') . ' · ' . $g('email') . ' · ' . $g('telephone') . "\n"
  . 'Livraison : ' . $g('adresse') . ', ' . $g('cp') . ' ' . $g('ville') . "\nPrécisions : " . $g('precisions', 1000) . "\n";
$mail = function (string $to, string $subject, string $body, string $replyTo) use ($cfg) {
  $h = "From: SEREPI <{$cfg['mail_from']}>\r\nReply-To: $replyTo\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8";
  return mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $h);
};

if (($c['paiement'] ?? '') === 'virement') {
  $mail($cfg['mail_to'], "Commande $num · virement attendu", $recap, $g('email'));
  $mail($g('email'), "Votre commande SEREPI $num", "Bonjour,\n\nMerci pour votre commande.\n\n$recap\nRèglement par virement :\n{$cfg['rib']}\nIndiquez la référence $num. La commande est expédiée sous 8 jours après réception du virement.\n\nSEREPI – La paillote en chaume", $cfg['mail_to']);
  echo json_encode(['html' => '<h2 class="t" style="font-size:22px">Commande enregistrée</h2><p>Référence <b>' . $num . '</b>. Les coordonnées bancaires vous ont été envoyées par e-mail ; la commande est expédiée sous 8 jours après réception du virement.</p>']);
  exit;
}

// Paiement par carte : Stripe Checkout (montants TTC en centimes).
if (empty($cfg['stripe_secret'])) fail(503, 'paiement par carte non configuré');
$form = ['mode' => 'payment', 'locale' => 'fr', 'customer_email' => $g('email'), 'client_reference_id' => $num,
  'success_url' => $cfg['site_url'] . '/commande-confirmee/?n=' . $num, 'cancel_url' => $cfg['site_url'] . '/panier/', 'metadata[commande]' => $num];
$i = 0;
foreach ($lines as $l) {
  $form["line_items[$i][quantity]"] = $l['qty'];
  $form["line_items[$i][price_data][currency]"] = 'eur';
  $form["line_items[$i][price_data][unit_amount]"] = (int)round($l['unitHT'] * (1 + $tva) * 100);
  $form["line_items[$i][price_data][product_data][name]"] = $l['name'];
  $i++;
}
$form["line_items[$i][quantity]"] = 1;
$form["line_items[$i][price_data][currency]"] = 'eur';
$form["line_items[$i][price_data][unit_amount]"] = (int)round($port * (1 + $tva) * 100);
$form["line_items[$i][price_data][product_data][name]"] = 'Livraison sur palette';
$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query($form), CURLOPT_USERPWD => $cfg['stripe_secret'] . ':', CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20]);
$res = json_decode((string)curl_exec($ch), true); curl_close($ch);
if (empty($res['url'])) fail(502, 'paiement indisponible');
$mail($cfg['mail_to'], "Commande $num · paiement carte en cours", $recap, $g('email'));
echo json_encode(['redirect' => $res['url']]);

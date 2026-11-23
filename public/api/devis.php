<?php
// Formulaire de devis / contact : envoie la demande par e-mail (photos jointes) à SEREPI.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
$cfg = @include __DIR__ . '/config.php';
if (!is_array($cfg)) { http_response_code(503); echo json_encode(['error' => 'configuration absente']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'méthode']); exit; }
if (!empty($_POST['site_web'])) { echo json_encode(['ok' => true]); exit; } // robot

$f = fn(string $k, int $max = 2000) => mb_substr(trim((string)($_POST[$k] ?? '')), 0, $max);
$nom = $f('nom', 120); $email = $f('email', 160); $cp = $f('cp', 5);
if ($nom === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{5}$/', $cp) || empty($_POST['rgpd'])) {
  http_response_code(422); echo json_encode(['error' => 'champs obligatoires']); exit;
}
$projets = ['renouvellement' => 'Renouveler le chaume', 'bora' => 'Paillote Bora complète', 'volume' => 'Paillotes en volume', 'question' => 'Question'];
$body = "Nouvelle demande depuis le site\n\n"
  . 'Projet : ' . ($projets[$f('projet', 20)] ?? '?') . "\n"
  . 'Profil : ' . $f('profil', 20) . "\n"
  . 'Modèle : ' . $f('modele', 20) . ' · Quantité : ' . $f('quantite', 6) . "\n"
  . "Nom : $nom\nÉtablissement : " . $f('societe', 160) . "\nE-mail : $email\nTéléphone : " . $f('telephone', 30) . "\nCode postal : $cp\n\n"
  . "Message :\n" . $f('message', 5000) . "\n";

$boundary = 'b' . bin2hex(random_bytes(12));
$parts = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$body\r\n";
$total = 0; $n = 0;
if (!empty($_FILES['photos']['tmp_name']) && is_array($_FILES['photos']['tmp_name'])) {
  foreach ($_FILES['photos']['tmp_name'] as $i => $tmp) {
    if ($n >= 5 || !is_uploaded_file($tmp)) continue;
    $size = (int)$_FILES['photos']['size'][$i]; $total += $size;
    $mime = mime_content_type($tmp) ?: '';
    if ($total > 8 * 1024 * 1024 || !str_starts_with($mime, 'image/')) continue;
    $name = preg_replace('/[^A-Za-z0-9._-]/', '_', (string)$_FILES['photos']['name'][$i]);
    $parts .= "--$boundary\r\nContent-Type: $mime; name=\"$name\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$name\"\r\n\r\n" . chunk_split(base64_encode((string)file_get_contents($tmp))) . "\r\n";
    $n++;
  }
}
$parts .= "--$boundary--";
$headers = "From: SEREPI site <{$cfg['mail_from']}>\r\nReply-To: $email\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$boundary\"";
$subject = '=?UTF-8?B?' . base64_encode("Demande de devis · $nom · $cp") . '?=';
if (!mail($cfg['mail_to'], $subject, $parts, $headers)) { http_response_code(500); echo json_encode(['error' => 'envoi']); exit; }
echo json_encode(['ok' => true]);

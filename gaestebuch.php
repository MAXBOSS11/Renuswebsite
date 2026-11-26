<?php
// Gästebuch für renny bossi's rezepte
header('Content-Type: application/json; charset=utf-8');

$ordner = __DIR__ . '/gaestebuch-daten';
$datei  = $ordner . '/eintraege.json';
if (!is_dir($ordner)) mkdir($ordner, 0755, true);
if (!is_file($ordner . '/.htaccess')) file_put_contents($ordner . '/.htaccess', "Require all denied\n");

$eintraege = is_file($datei) ? json_decode(file_get_contents($datei), true) : [];
if (!is_array($eintraege)) $eintraege = [];

function antwort($daten, $code = 200) {
  http_response_code($code);
  echo json_encode($daten, JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Spam-Falle: Dieses Feld ist unsichtbar, nur Roboter füllen es aus
  if (!empty($_POST['website'])) antwort(['ok' => true]);

  $name = trim(strip_tags($_POST['name'] ?? ''));
  $text = trim(strip_tags($_POST['nachricht'] ?? ''));

  if ($name === '' || $text === '')
    antwort(['ok' => false, 'fehler' => 'Bitte Name und Nachricht ausfüllen.'], 400);
  if (mb_strlen($name) > 60 || mb_strlen($text) > 1000)
    antwort(['ok' => false, 'fehler' => 'Der Text ist zu lang.'], 400);
  if (preg_match('~https?://|www\.~i', $name . ' ' . $text))
    antwort(['ok' => false, 'fehler' => 'Links sind leider nicht erlaubt.'], 400);

  // Höchstens 1 Eintrag pro Minute pro Besucher
  $wer = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . 'renny-salz');
  foreach ($eintraege as $e) {
    if (($e['wer'] ?? '') === $wer && time() - $e['zeit'] < 60)
      antwort(['ok' => false, 'fehler' => 'Bitte warte kurz, bevor du nochmals schreibst.'], 429);
  }

  array_unshift($eintraege, ['name' => $name, 'text' => $text, 'zeit' => time(), 'wer' => $wer]);
  $eintraege = array_slice($eintraege, 0, 500);
  file_put_contents($datei, json_encode($eintraege, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

$liste = array_map(fn($e) => ['name' => $e['name'], 'text' => $e['text'], 'zeit' => $e['zeit']], $eintraege);
antwort(['ok' => true, 'eintraege' => $liste]);

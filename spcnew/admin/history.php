<?php
declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/health.php';
require __DIR__ . '/../includes/layout.php';

require_admin();

$month = (string) ($_GET['m'] ?? '');
$term = trim((string) ($_GET['q'] ?? ''));
if ($month !== '' && !valid_month($month)) {
    $month = '';
}

$sql = 'SELECT r.*, u.name AS user_name, u.user_code, u.phone
    FROM readings r JOIN users u ON u.id = r.user_id WHERE 1=1';
$params = [];
if ($month !== '') {
    [$start, $end] = month_bounds($month);
    $sql .= ' AND r.recorded_on >= ? AND r.recorded_on < ?';
    $params[] = $start;
    $params[] = $end;
}
if ($term !== '') {
    $like = '%' . addcslashes($term, '%_\\') . '%';
    $sql .= " AND (u.name LIKE ? ESCAPE '\\' OR u.user_code LIKE ? ESCAPE '\\' OR u.phone LIKE ? ESCAPE '\\')";
    array_push($params, $like, $like, $like);
}
$sql .= ' ORDER BY r.recorded_on DESC, r.id DESC LIMIT 300';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

page_header('සියලු ඉතිහාසය', 'ahistory');
?>
<section class="hello slim">
    <div>
        <p class="eyebrow">පරිපාලක</p>
        <h1>සියලු දෙනාගේ ඉතිහාසය</h1>
        <p class="muted">නම, හැඳුනුම හෝ දුරකථනයෙන් සොයන්න. මාසයකට සීමා කළ හැක.</p>
    </div>
</section>
<form class="search" method="get">
    <input name="q" value="<?= e($term) ?>" placeholder="නම, හැඳුනුම හෝ දුරකථනය">
    <input type="month" name="m" value="<?= e($month) ?>">
    <button class="btn btn-navy" type="submit">පෙන්වන්න</button>
</form>
<section class="card">
    <p class="muted">පෙන්වන්නේ <?= count($rows) ?>ක්, උපරිම 300.</p>
    <?php readings_table($rows, false, true); ?>
</section>
<?php
page_footer();

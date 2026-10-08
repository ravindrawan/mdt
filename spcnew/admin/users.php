<?php
declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/health.php';
require __DIR__ . '/../includes/layout.php';

require_admin();

$term = trim((string) ($_GET['q'] ?? ''));
$sql = "SELECT u.*,
    (SELECT COUNT(*) FROM readings r WHERE r.user_id = u.id) AS reading_count,
    (SELECT MAX(recorded_on) FROM readings r WHERE r.user_id = u.id) AS last_on
    FROM users u WHERE u.role = 'user'";
$params = [];
if ($term !== '') {
    $like = '%' . addcslashes($term, '%_\\') . '%';
    $sql .= " AND (u.name LIKE ? ESCAPE '\\' OR u.user_code LIKE ? ESCAPE '\\' OR u.phone LIKE ? ESCAPE '\\')";
    $params = [$like, $like, $like];
}
$sql .= ' ORDER BY u.created_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$users = $stmt->fetchAll();

page_header('ගිණුම්', 'users');
?>
<section class="hello slim">
    <div>
        <p class="eyebrow">ගිණුම් පාලනය</p>
        <h1>ලියාපදිංචි පුද්ගලයන්</h1>
        <p class="muted">නම, දුරකථනය, තත්ත්වය සහ මුරපදය වෙනස් කිරීම එක් එක් ගිණුම තුළ.</p>
    </div>
</section>

<form class="search" method="get">
    <input name="q" value="<?= e($term) ?>" placeholder="නම, හැඳුනුම හෝ දුරකථනය">
    <button class="btn btn-navy" type="submit">සොයන්න</button>
</form>

<section class="card">
    <?php if (!$users): ?>
        <div class="empty"><strong>ගිණුම් හමු නොවුණා</strong><p>පරිශීලකයන් ලියාපදිංචි වූ පසු මෙතන පෙනේ.</p></div>
    <?php else: ?>
        <div class="table-wrap"><table class="grid">
            <thead><tr><th>නම</th><th>හැඳුනුම</th><th>දුරකථනය</th><th>තත්ත්වය</th><th>මැනුම්</th><th>අවසන්</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($users as $person): ?>
                <tr class="<?= $person['status'] === 'active' ? '' : 'is-off' ?>">
                    <td><?= e($person['name']) ?></td>
                    <td><?= e($person['user_code']) ?></td>
                    <td><?= e(format_phone((string) $person['phone'])) ?></td>
                    <td><?= $person['status'] === 'active' ? '<span class="pill good">සක්‍රිය</span>' : '<span class="pill bad">නවතා ඇත</span>' ?></td>
                    <td><?= (int) $person['reading_count'] ?></td>
                    <td><?= $person['last_on'] ? e(nice_date((string) $person['last_on'])) : '—' ?></td>
                    <td><a class="btn btn-tiny btn-navy" href="<?= e(url('admin/user.php?id=' . (int) $person['id'])) ?>">විවෘත කරන්න</a></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table></div>
    <?php endif; ?>
</section>
<?php
page_footer();

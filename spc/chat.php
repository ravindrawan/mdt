<?php
declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/health.php';
require __DIR__ . '/includes/chatbot.php';
require __DIR__ . '/includes/layout.php';

$user = require_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    if (isset($_POST['quick']) && trim((string) $_POST['quick']) !== '') {
        $text = trim((string) $_POST['quick']);
    } else {
        $text = trim((string) ($_POST['body'] ?? ''));
    }
    if ($text === '') {
        flash('info', 'පණිවිඩයක් ලියන්න.');
    } elseif (mb_strlen($text) > 500) {
        flash('bad', 'පණිවිඩය අකුරු 500ට වඩා දිගයි.');
    } else {
        $now = date('Y-m-d H:i:s');
        $insert = db()->prepare('INSERT INTO messages (user_id, sender, body, created_at) VALUES (?, ?, ?, ?)');
        $insert->execute([(int) $user['id'], 'user', $text, $now]);
        $reply = chat_reply((int) $user['id'], (string) $user['name'], $text);
        $insert->execute([(int) $user['id'], 'bot', $reply, date('Y-m-d H:i:s')]);
    }
    redirect('chat.php');
}

$stmt = db()->prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY id ASC LIMIT 80');
$stmt->execute([(int) $user['id']]);
$messages = $stmt->fetchAll();
$prompts = [
    'මගේ සීනි ගැන කියන්න',
    'පීඩනය හොඳද?',
    'කොලෙස්ටරෝල් අඩු කරගන්නේ කොහොමද?',
    'BMI ගැන උපදෙසක්',
    'මේ මාසය කොහොමද?',
    'අද මම මොනවා කන්නද?',
];

page_header('සංවාදය', 'chat');
?>
<section class="chat-head">
    <div>
        <p class="eyebrow">සෞඛ්‍ය සංවාදය</p>
        <h1>ඔබේ සටහන් අනුව අහන්න</h1>
    </div>
</section>
<section class="chat-shell">
    <div class="chat-log" id="chat-log">
        <article class="bubble bot">
            <p>ආයුබෝවන් <?= e((string) $user['name']) ?>. මම SPC සහායකයා. ඔබේ සීනි, පීඩනය, කොලෙස්ටරෝල් සහ BMI බලලා කෑම, ඇවිදීම සහ මේ මාසය ගැන කියන්න පුළුවන්. මෙය වෛද්‍ය විනිශ්චයක් නොවේ.</p>
        </article>
        <?php foreach ($messages as $message): ?>
            <article class="bubble <?= $message['sender'] === 'user' ? 'me' : 'bot' ?>">
                <p><?= nl2br(e((string) $message['body'])) ?></p>
                <time><?= e(date('m-d H:i', strtotime((string) $message['created_at']))) ?></time>
            </article>
        <?php endforeach; ?>
    </div>
    <form method="post" class="chat-form">
        <?= csrf_field() ?>
        <div class="chips">
            <?php foreach ($prompts as $prompt): ?>
                <button type="submit" name="quick" value="<?= e($prompt) ?>"><?= e($prompt) ?></button>
            <?php endforeach; ?>
        </div>
        <div class="composer">
            <textarea name="body" rows="2" maxlength="500" placeholder="උදා: මගේ පීඩනය ගැන කියන්න"></textarea>
            <button class="btn btn-navy" type="submit" name="send" value="1">යවන්න</button>
        </div>
        <p class="help">සහායකයා ඔබේ සටහන් අනුව උපදෙස් දෙයි. වෛද්‍යවරයෙකු වෙනුවට නොවේ.</p>
    </form>
</section>
<?php
page_footer();

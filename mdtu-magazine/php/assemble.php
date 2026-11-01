<?php

const PAGE_SIZE = [
    'editorial' => 2,
    'training' => 2,
    'milestones' => 2,
    'language' => 2,
    'scholarship' => 2,
    'creative' => 2,
    'plans' => 4,
];

const FLOW_ORDER = ['editorial', 'training', 'milestones', 'language', 'scholarship', 'creative', 'plans'];

const PAGE_BODY = 214;
const PAGE_HEAD = 26;
const STATS_MM = 36;
const BREAK_MM = 8;
const LARGE_MM = 42;
const LINE_MM = 4.8;

function page_size(string $slug): int
{
    return PAGE_SIZE[$slug] ?? 2;
}

function body_chars(array $article): int
{
    $en = function_exists('mb_strlen') ? mb_strlen((string) ($article['body_en'] ?? '')) : strlen((string) ($article['body_en'] ?? ''));
    $si = function_exists('mb_strlen') ? mb_strlen((string) ($article['body_si'] ?? '')) : strlen((string) ($article['body_si'] ?? ''));
    return max($en, $si);
}

function chars_per_line(string $role): int
{
    return $role === 'lead' ? 42 : 58;
}

function text_mm(int $chars, string $role): float
{
    $lines = max(1, (int) ceil(max($chars, 1) / chars_per_line($role)));
    return 11 + $lines * LINE_MM;
}

function card_mm(int $chars, string $role): float
{
    $photo = $role === 'lead' ? 58 : 30;
    return max($photo, text_mm($chars, $role)) + 4;
}

function chars_for_mm(string $role, float $budget): int
{
    $textRoom = max(LINE_MM, $budget - 4 - 11);
    $lines = max(1, (int) floor($textRoom / LINE_MM));
    return $lines * chars_per_line($role);
}

function photo_count(array $article, ?array $photoMap): int
{
    if (!$photoMap) {
        return 0;
    }
    return (int) ($photoMap[$article['id']] ?? 0);
}

function is_essay(array $article, int $photos): bool
{
    return ($article['category_slug'] ?? '') === 'creative' && $photos >= 3;
}

function page_head(array $items, bool $statsUsed): float
{
    $stats = !$statsUsed && isset($items[0]) && $items[0]['category_slug'] === 'training';
    return PAGE_HEAD + ($stats ? STATS_MM : 0);
}

function measure_items(array $items, ?array $photoMap, float $head): float
{
    $used = $head;
    foreach ($items as $index => $article) {
        $prev = $items[$index - 1] ?? null;
        if ($prev && $prev['category_slug'] !== $article['category_slug']) {
            $used += BREAK_MM;
        }
        $photos = photo_count($article, $photoMap);
        if (is_essay($article, $photos)) {
            $used += 200;
            continue;
        }
        $used += card_mm(body_chars($article), $index === 0 ? 'lead' : 'row');
    }
    return $used;
}

function fits(array $items, array $article, ?array $photoMap, bool $statsUsed): string
{
    $room = PAGE_BODY - measure_items($items, $photoMap, page_head($items, $statsUsed));
    $last = $items ? $items[count($items) - 1] : null;
    $extra = $last && $last['category_slug'] !== $article['category_slug'] ? BREAK_MM : 0;
    $space = $room - $extra;
    if (is_essay($article, photo_count($article, $photoMap))) {
        return $space >= 180 ? 'full' : 'new';
    }
    $cost = card_mm(body_chars($article), 'row');
    if ($space >= $cost) {
        return 'full';
    }
    if ($space >= LARGE_MM) {
        return 'trim';
    }
    return 'new';
}

function pack_flow(array $articles, ?array $photoMap): array
{
    $pages = [];
    $current = [];
    $statsUsed = false;
    $close = function () use (&$pages, &$current, &$statsUsed) {
        if (!$current) {
            return;
        }
        $stats = !$statsUsed && $current[0]['category_slug'] === 'training';
        if ($stats) {
            $statsUsed = true;
        }
        $pages[] = ['items' => $current, 'stats' => $stats];
        $current = [];
    };
    foreach ($articles as $article) {
        $essay = is_essay($article, photo_count($article, $photoMap));
        if (!$current) {
            $current = [$article];
            if ($essay) {
                $close();
            }
            continue;
        }
        $decision = fits($current, $article, $photoMap, $statsUsed);
        if ($decision === 'new') {
            $close();
            $current = [$article];
            if ($essay) {
                $close();
            }
            continue;
        }
        $current[] = $article;
        if ($essay) {
            $close();
        }
    }
    $close();
    return $pages;
}

function limits_for(array $items, ?array $photoMap, bool $stats): array
{
    $head = PAGE_HEAD + ($stats ? STATS_MM : 0);
    $used = $head;
    $plan = [];
    foreach ($items as $index => $article) {
        $prev = $items[$index - 1] ?? null;
        $extra = $prev && $prev['category_slug'] !== $article['category_slug'] ? BREAK_MM : 0;
        $used += $extra;
        $role = $index === 0 ? 'lead' : 'row';
        $photos = photo_count($article, $photoMap);
        $essay = is_essay($article, $photos);
        $room = max(0, PAGE_BODY - $used);
        $chars = body_chars($article);
        $cost = $essay ? min(200, $room) : card_mm($chars, $role);
        $limit = !$essay && $cost > $room ? chars_for_mm($role, max(40, $room)) : $chars;
        $used += min($cost, $room);
        $plan[] = [
            'article' => $article,
            'role' => $role,
            'limit' => (int) $limit,
            'essay' => $essay,
            'fresh' => !$prev || $prev['category_slug'] !== $article['category_slug'],
        ];
    }
    return $plan;
}

function photo_map_for(array $pool): array
{
    if (!$pool) {
        return [];
    }
    $ids = array_map(fn($article) => $article['id'], $pool);
    $marks = implode(',', array_fill(0, count($ids), '?'));
    $rows = db_all("SELECT article_id, COUNT(*) AS n FROM media WHERE article_id IN ($marks) GROUP BY article_id", $ids);
    $map = [];
    foreach ($rows as $row) {
        $map[$row['article_id']] = (int) $row['n'];
    }
    return $map;
}

function assemble_magazine($magazineId): array
{
    $mag = db_get('SELECT * FROM magazines WHERE id = ?', [$magazineId]);
    if (!$mag) {
        fail(404, 'Issue not found');
    }
    if ($mag['status'] !== 'draft') {
        fail(409, 'Unpublish the issue before reassembling it.');
    }
    return db_tx(function () use ($mag, $magazineId) {
        $now = now_iso();
        db_run(
            'UPDATE articles SET magazine_id = NULL, page_number = NULL, featured = 0, updated_at = ? WHERE magazine_id = ?',
            [$now, $magazineId]
        );
        $pool = db_all(
            'SELECT a.*, c.slug AS category_slug, u.designation_en, u.designation_si
             FROM articles a
             JOIN categories c ON c.id = a.category_id
             JOIN users u ON u.id = a.user_id
             WHERE a.status = \'approved\' AND a.magazine_id IS NULL AND a.target_year = ? AND a.target_month = ?
             ORDER BY a.created_at ASC, a.id ASC',
            [$mag['year'], $mag['month']]
        );
        $photoMap = photo_map_for($pool);
        $used = [];
        $takeAll = function (string $slug) use ($pool, &$used) {
            return array_values(array_filter($pool, function ($article) use ($slug, &$used) {
                return $article['category_slug'] === $slug && !isset($used[$article['id']]);
            }));
        };
        $place = function (array $list, int $page) use (&$used, $magazineId, $now) {
            foreach ($list as $index => $article) {
                $used[$article['id']] = true;
                db_run(
                    'UPDATE articles SET magazine_id = ?, page_number = ?, sort_order = ?, featured = 0, updated_at = ? WHERE id = ?',
                    [$magazineId, $page, $index, $now, $article['id']]
                );
            }
        };
        $page = 2;
        $editorials = $takeAll('editorial');
        usort($editorials, function ($a, $b) {
            $score = function ($row) {
                return preg_match('/director|අධ්‍යක්ෂ/iu', ($row['designation_en'] ?? '') . ' ' . ($row['designation_si'] ?? '')) ? 1 : 0;
            };
            return $score($a) <=> $score($b);
        });
        if ($editorials) {
            $place(array_slice($editorials, 0, page_size('editorial')), $page);
            $page += 1;
        }
        $flow = array_slice($editorials, page_size('editorial'));
        foreach (FLOW_ORDER as $slug) {
            if ($slug === 'editorial') {
                continue;
            }
            foreach ($takeAll($slug) as $article) {
                $flow[] = $article;
            }
        }
        foreach (pack_flow($flow, $photoMap) as $packed) {
            $place($packed['items'], $page);
            $page += 1;
        }
        $placed = array_values(array_filter($pool, function ($article) use (&$used) {
            return isset($used[$article['id']]) && $article['category_slug'] !== 'editorial';
        }));
        $pick = function (string $slug) use ($placed) {
            foreach ($placed as $article) {
                if ($article['category_slug'] === $slug) {
                    return $article;
                }
            }
            return null;
        };
        $features = array_values(array_filter([
            $pick('training'),
            $pick('milestones'),
            $pick('scholarship') ?: $pick('language'),
        ]));
        $features = array_slice($features, 0, 3);
        foreach ($placed as $article) {
            if (count($features) >= 3) {
                break;
            }
            $ids = array_column($features, 'id');
            if (!in_array($article['id'], $ids, false)) {
                $features[] = $article;
            }
        }
        foreach (array_slice($features, 0, 3) as $article) {
            db_run('UPDATE articles SET featured = 1, updated_at = ? WHERE id = ?', [$now, $article['id']]);
        }
        db_run('UPDATE magazines SET updated_at = ? WHERE id = ?', [$now, $magazineId]);
        return [
            'placed' => count($used),
            'pages' => max(0, $page - 2),
            'featured' => min(3, count($features)),
        ];
    });
}

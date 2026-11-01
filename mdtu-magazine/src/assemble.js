const { nowIso } = require('./format');

const PAGE_SIZE = {
  editorial: 2,
  training: 2,
  milestones: 2,
  language: 2,
  scholarship: 2,
  creative: 2,
  plans: 4
};

const ORDER = ['editorial', 'training', 'milestones', 'language', 'scholarship', 'creative', 'plans'];

const PAGE_BODY = 214;
const PAGE_HEAD = 26;
const STATS = 36;
const BREAK = 8;
const LARGE = 42;
const LINE = 4.8;

function pageSize(slug) {
  return PAGE_SIZE[slug] || 2;
}

function bodyChars(article) {
  return Math.max(
    String(article.body_en || '').length,
    String(article.body_si || '').length
  );
}

function charsPerLine(role) {
  return role === 'lead' ? 42 : 58;
}

function textMm(chars, role) {
  const lines = Math.max(1, Math.ceil(Math.max(chars, 1) / charsPerLine(role)));
  return 11 + lines * LINE;
}

function cardMm(chars, role) {
  const photo = role === 'lead' ? 58 : 30;
  return Math.max(photo, textMm(chars, role)) + 4;
}

function charsForMm(role, budget) {
  const textRoom = Math.max(LINE, budget - 4 - 11);
  const lines = Math.max(1, Math.floor(textRoom / LINE));
  return lines * charsPerLine(role);
}

function photoCount(article, photoMap) {
  if (!photoMap) return 0;
  return photoMap.get(article.id) || 0;
}

function isEssay(article, photos) {
  return article.category_slug === 'creative' && photos >= 3;
}

function pageHead(items, statsUsed) {
  const stats = !statsUsed && items[0] && items[0].category_slug === 'training';
  return PAGE_HEAD + (stats ? STATS : 0);
}

function measure(items, photoMap, head) {
  let used = head;
  items.forEach((article, index) => {
    const prev = items[index - 1];
    if (prev && prev.category_slug !== article.category_slug) used += BREAK;
    const photos = photoCount(article, photoMap);
    if (isEssay(article, photos)) {
      used += 200;
      return;
    }
    used += cardMm(bodyChars(article), index === 0 ? 'lead' : 'row');
  });
  return used;
}

function fits(items, article, photoMap, statsUsed) {
  const room = PAGE_BODY - measure(items, photoMap, pageHead(items, statsUsed));
  const extra = items.length && items[items.length - 1].category_slug !== article.category_slug ? BREAK : 0;
  const space = room - extra;
  if (isEssay(article, photoCount(article, photoMap))) return space >= 180 ? 'full' : 'new';
  const cost = cardMm(bodyChars(article), 'row');
  if (space >= cost) return 'full';
  if (space >= LARGE) return 'trim';
  return 'new';
}

function packFlow(articles, photoMap) {
  const pages = [];
  let current = [];
  let statsUsed = false;
  function close() {
    if (!current.length) return;
    const stats = !statsUsed && current[0].category_slug === 'training';
    if (stats) statsUsed = true;
    pages.push({ items: current, stats });
    current = [];
  }
  articles.forEach((article) => {
    const essay = isEssay(article, photoCount(article, photoMap));
    if (!current.length) {
      current = [article];
      if (essay) close();
      return;
    }
    const decision = fits(current, article, photoMap, statsUsed);
    if (decision === 'new') {
      close();
      current = [article];
      if (essay) close();
      return;
    }
    current.push(article);
    if (essay) close();
  });
  close();
  return pages;
}

function limitsFor(items, photoMap, stats) {
  const head = PAGE_HEAD + (stats ? STATS : 0);
  let used = head;
  return items.map((article, index) => {
    const prev = items[index - 1];
    const extra = prev && prev.category_slug !== article.category_slug ? BREAK : 0;
    used += extra;
    const role = index === 0 ? 'lead' : 'row';
    const photos = photoCount(article, photoMap);
    const essay = isEssay(article, photos);
    const room = Math.max(0, PAGE_BODY - used);
    const chars = bodyChars(article);
    const cost = essay ? Math.min(200, room) : cardMm(chars, role);
    const limit = !essay && cost > room ? charsForMm(role, Math.max(40, room)) : chars;
    used += Math.min(cost, room);
    return {
      article,
      role,
      limit,
      essay,
      fresh: !prev || prev.category_slug !== article.category_slug
    };
  });
}

function assembleMagazine(db, magazineId) {
  const mag = db.get('SELECT * FROM magazines WHERE id = ?', [magazineId]);
  if (!mag) {
    const error = new Error('Issue not found');
    error.status = 404;
    throw error;
  }
  if (mag.status !== 'draft') {
    const error = new Error('Unpublish the issue before reassembling it.');
    error.status = 409;
    throw error;
  }

  return db.transaction(() => {
    const now = nowIso();
    db.run(
      `UPDATE articles
       SET magazine_id = NULL, page_number = NULL, featured = 0, updated_at = ?
       WHERE magazine_id = ?`,
      [now, magazineId]
    );

    const pool = db.all(
      `SELECT a.*, c.slug AS category_slug, u.designation_en, u.designation_si
       FROM articles a
       JOIN categories c ON c.id = a.category_id
       JOIN users u ON u.id = a.user_id
       WHERE a.status = 'approved'
         AND a.magazine_id IS NULL
         AND a.target_year = ?
         AND a.target_month = ?
       ORDER BY a.created_at ASC, a.id ASC`,
      [mag.year, mag.month]
    );
    const photoRows = pool.length
      ? db.all(
        `SELECT article_id, COUNT(*) AS n FROM media WHERE article_id IN (${pool.map(() => '?').join(',')}) GROUP BY article_id`,
        pool.map((article) => article.id)
      )
      : [];
    const photoMap = new Map(photoRows.map((row) => [row.article_id, Number(row.n) || 0]));

    const used = new Set();
    function takeAll(slug) {
      return pool.filter((article) => article.category_slug === slug && !used.has(article.id));
    }

    function place(list, page) {
      list.forEach((article, index) => {
        used.add(article.id);
        db.run(
          `UPDATE articles
           SET magazine_id = ?, page_number = ?, sort_order = ?, featured = 0, updated_at = ?
           WHERE id = ?`,
          [magazineId, page, index, now, article.id]
        );
      });
    }

    let page = 2;
    let editorials = takeAll('editorial');
    editorials = editorials.slice().sort((a, b) => {
      const score = (row) => (/director|අධ්‍යක්ෂ/i.test(`${row.designation_en} ${row.designation_si}`) ? 1 : 0);
      return score(a) - score(b);
    });
    if (editorials.length) {
      place(editorials.slice(0, pageSize('editorial')), page);
      page += 1;
    }

    const flow = editorials.slice(pageSize('editorial'));
    ORDER.filter((slug) => slug !== 'editorial').forEach((slug) => {
      flow.push(...takeAll(slug));
    });
    packFlow(flow, photoMap).forEach((packed) => {
      place(packed.items, page);
      page += 1;
    });

    const placed = pool.filter((article) => used.has(article.id) && article.category_slug !== 'editorial');
    const pick = (slug) => placed.find((article) => article.category_slug === slug);
    const features = [pick('training'), pick('milestones'), pick('scholarship') || pick('language')]
      .filter(Boolean)
      .slice(0, 3);
    placed.forEach((article) => {
      if (features.length >= 3) return;
      if (!features.includes(article)) features.push(article);
    });
    features.slice(0, 3).forEach((article) => {
      db.run('UPDATE articles SET featured = 1, updated_at = ? WHERE id = ?', [now, article.id]);
    });

    db.run('UPDATE magazines SET updated_at = ? WHERE id = ?', [now, magazineId]);
    return {
      placed: used.size,
      pages: Math.max(0, page - 2),
      featured: Math.min(3, features.length)
    };
  });
}

function reflowMagazine(db, magazineId) {
  const mag = db.get('SELECT * FROM magazines WHERE id = ?', [magazineId]);
  if (!mag) {
    const error = new Error('Issue not found');
    error.status = 404;
    throw error;
  }
  return db.transaction(() => {
    const now = nowIso();
    const pool = db.all(
      `SELECT a.*, c.slug AS category_slug, u.designation_en, u.designation_si
       FROM articles a
       JOIN categories c ON c.id = a.category_id
       JOIN users u ON u.id = a.user_id
       WHERE a.magazine_id = ?
       ORDER BY a.page_number, a.sort_order, a.id`,
      [magazineId]
    );
    const photoRows = pool.length
      ? db.all(
        `SELECT article_id, COUNT(*) AS n FROM media WHERE article_id IN (${pool.map(() => '?').join(',')}) GROUP BY article_id`,
        pool.map((article) => article.id)
      )
      : [];
    const photoMap = new Map(photoRows.map((row) => [row.article_id, Number(row.n) || 0]));
    const groups = new Map(ORDER.map((slug) => [slug, []]));
    const extra = [];
    pool.forEach((article) => {
      if (groups.has(article.category_slug)) groups.get(article.category_slug).push(article);
      else extra.push(article);
    });
    const editorials = groups.get('editorial');
    let page = 2;
    function place(list, pageNumber) {
      list.forEach((article, index) => {
        db.run(
          'UPDATE articles SET page_number = ?, sort_order = ?, updated_at = ? WHERE id = ?',
          [pageNumber, index, now, article.id]
        );
      });
    }
    if (editorials.length) {
      place(editorials.slice(0, pageSize('editorial')), page);
      page += 1;
    }
    const flow = editorials.slice(pageSize('editorial'));
    ORDER.filter((slug) => slug !== 'editorial').forEach((slug) => flow.push(...groups.get(slug)));
    flow.push(...extra);
    packFlow(flow, photoMap).forEach((packed) => {
      place(packed.items, page);
      page += 1;
    });
    db.run('UPDATE magazines SET updated_at = ? WHERE id = ?', [now, magazineId]);
    return { placed: pool.length, pages: Math.max(0, page - 2) };
  });
}

module.exports = {
  assembleMagazine,
  reflowMagazine,
  pageSize,
  packFlow,
  fits,
  limitsFor,
  isEssay
};

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('./src/db');
const { assembleMagazine, pageSize, fits } = require('./src/assemble');
const { monthName, issueSeries, nowIso, parseJson } = require('./src/format');
const { loadBundle, renderPages, renderIssueDocument, issueStats } = require('./src/render');
const { renderPdf } = require('./src/pdf');

const PORT = Number(process.env.PORT) || 3000;
const uploadDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(session({
  name: 'retreat.sid',
  secret: process.env.SESSION_SECRET || 'retreat-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
}));

const previewTokens = new Map();
const loginAttempts = new Map();

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function audit(userId, action, entity, entityId, detail) {
  db.run(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId || null, action, entity, entityId || null, clean(detail, 500), nowIso()]
  );
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name_en: user.full_name_en,
    full_name_si: user.full_name_si,
    role: user.role,
    designation_en: user.designation_en,
    designation_si: user.designation_si,
    phone: user.phone,
    avatar_path: user.avatar_path,
    active: !!user.active
  };
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Sign in required.' });
  const user = db.get('SELECT * FROM users WHERE id = ?', [req.session.user.id]);
  if (!user || !user.active) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'This account is not active.' });
  }
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Administrators only.' });
    next();
  });
}

function hydrateArticle(article) {
  if (!article) return null;
  const program = db.get('SELECT * FROM programs WHERE article_id = ?', [article.id]);
  const media = db.all('SELECT id, path, mime, caption_en, caption_si, created_at FROM media WHERE article_id = ? ORDER BY id', [article.id]);
  const category = db.get('SELECT slug, name_en, name_si FROM categories WHERE id = ?', [article.category_id]);
  return {
    ...article,
    category_slug: category ? category.slug : '',
    category_en: category ? category.name_en : '',
    category_si: category ? category.name_si : '',
    program: program ? { ...program, metrics: parseJson(program.metrics_json, {}) } : null,
    media
  };
}

function seriesOf(magazine) {
  const rows = db.all('SELECT id, year, month FROM magazines');
  return issueSeries(rows).get(magazine.id) || { volume: 1, number: 1 };
}

function magazineCard(magazine, articles) {
  const series = seriesOf(magazine);
  return {
    id: magazine.id,
    slug: magazine.slug,
    month: magazine.month,
    year: magazine.year,
    volume: series.volume,
    number: series.number,
    title_en: magazine.title_en,
    title_si: magazine.title_si,
    summary_en: magazine.summary_en,
    summary_si: magazine.summary_si,
    highlights: parseJson(magazine.highlights_json, []),
    cover_path: magazine.cover_path,
    status: magazine.status,
    label_en: `${monthName(magazine.month, 'en')} ${magazine.year}`,
    label_si: `${monthName(magazine.month, 'si')} ${magazine.year}`,
    stats: issueStats(articles || [])
  };
}

function articlesForMagazine(id) {
  return db.all(
    `SELECT a.*, c.slug AS category_slug, p.participants
     FROM articles a
     JOIN categories c ON c.id = a.category_id
     LEFT JOIN programs p ON p.article_id = a.id
     WHERE a.magazine_id = ?`,
    [id]
  );
}

function readArticleInput(body) {
  const titleEn = clean(body.title_en, 220);
  const titleSi = clean(body.title_si, 220);
  const bodyEn = clean(body.body_en, 8000);
  const bodySi = clean(body.body_si, 8000);
  if (titleEn.length < 3 || titleSi.length < 2) throw fail(400, 'Titles are required in both English and Sinhala.');
  if (bodyEn.length < 10 || bodySi.length < 5) throw fail(400, 'Write the piece in both English and Sinhala.');
  const month = Number(body.target_month);
  const year = Number(body.target_year);
  if (month < 1 || month > 12 || year < 2024 || year > 2100) throw fail(400, 'Choose the issue month and year.');
  const category = db.get('SELECT * FROM categories WHERE id = ? OR slug = ?', [Number(body.category_id) || 0, clean(body.category, 40)]);
  if (!category) throw fail(400, 'Choose a contribution stream.');
  return {
    category,
    title_en: titleEn,
    title_si: titleSi,
    body_en: bodyEn,
    body_si: bodySi,
    excerpt_en: clean(body.excerpt_en, 300),
    excerpt_si: clean(body.excerpt_si, 300),
    byline_en: clean(body.byline_en, 160),
    byline_si: clean(body.byline_si, 160),
    target_month: month,
    target_year: year,
    program: {
      start_date: clean(body.start_date, 10) || null,
      end_date: clean(body.end_date, 10) || null,
      target_group_en: clean(body.target_group_en, 220),
      target_group_si: clean(body.target_group_si, 220),
      venue_en: clean(body.venue_en, 220),
      venue_si: clean(body.venue_si, 220),
      participants: body.participants === '' || body.participants == null ? null : Math.max(0, Number(body.participants) || 0),
      outcomes_en: clean(body.outcomes_en, 2000),
      outcomes_si: clean(body.outcomes_si, 2000),
      metrics: {
        sessions: Number(body.sessions) || 0,
        hours: Number(body.hours) || 0,
        satisfaction: Number(body.satisfaction) || 0
      }
    }
  };
}

function saveProgram(articleId, program) {
  const existing = db.get('SELECT id FROM programs WHERE article_id = ?', [articleId]);
  const params = [
    program.start_date,
    program.end_date,
    program.target_group_en,
    program.target_group_si,
    program.venue_en,
    program.venue_si,
    program.participants,
    program.outcomes_en,
    program.outcomes_si,
    JSON.stringify(program.metrics || {})
  ];
  if (existing) {
    db.run(
      `UPDATE programs SET start_date=?, end_date=?, target_group_en=?, target_group_si=?, venue_en=?, venue_si=?,
        participants=?, outcomes_en=?, outcomes_si=?, metrics_json=? WHERE article_id=?`,
      [...params, articleId]
    );
  } else {
    db.run(
      `INSERT INTO programs
        (article_id, start_date, end_date, target_group_en, target_group_si, venue_en, venue_si, participants, outcomes_en, outcomes_si, metrics_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [articleId, ...params]
    );
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safe = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '';
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safe}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(fail(400, 'Only JPG, PNG, WEBP or GIF images are accepted.'));
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'retreat' });
});

app.get('/api/public/home', (req, res) => {
  const magazines = db.all(`SELECT * FROM magazines WHERE status = 'published' ORDER BY year DESC, month DESC`);
  const cards = magazines.map((magazine) => magazineCard(magazine, articlesForMagazine(magazine.id)));
  res.json({ featured: cards[0] || null, archive: cards.slice(1) });
});

app.get('/api/public/magazines/:slug', (req, res) => {
  const magazine = db.get(`SELECT * FROM magazines WHERE slug = ? AND status = 'published'`, [req.params.slug]);
  if (!magazine) return res.status(404).json({ error: 'That issue is not published.' });
  res.json(magazineCard(magazine, articlesForMagazine(magazine.id)));
});

app.get('/api/public/magazines/:slug/pages', (req, res) => {
  const bundle = loadBundle(req.params.slug);
  if (!bundle || bundle.magazine.status !== 'published') return res.status(404).json({ error: 'That issue is not published.' });
  const lang = req.query.lang === 'si' || req.query.lang === 'ta' ? req.query.lang : 'en';
  res.json({ slug: bundle.magazine.slug, lang, title_en: bundle.magazine.title_en, title_si: bundle.magazine.title_si, pages: renderPages(bundle, lang) });
});

app.get('/magazine/:slug/print', (req, res) => {
  const bundle = loadBundle(req.params.slug);
  if (!bundle) return res.status(404).send('Issue not found');
  const token = previewTokens.get(String(req.query.token || ''));
  const adminSession = req.session.user && req.session.user.role === 'admin';
  const tokenOk = token && token.slug === bundle.magazine.slug && token.exp > Date.now();
  if (bundle.magazine.status !== 'published' && !adminSession && !tokenOk) {
    return res.status(404).send('Issue not found');
  }
  const lang = req.query.lang === 'si' || req.query.lang === 'ta' ? req.query.lang : 'en';
  res.type('html').send(renderIssueDocument(bundle, lang, { autoprint: req.query.autoprint === '1' }));
});

app.get('/api/public/magazines/:slug/pdf', asyncRoute(async (req, res) => {
  const magazine = db.get(`SELECT * FROM magazines WHERE slug = ? AND status = 'published'`, [req.params.slug]);
  if (!magazine) return res.status(404).json({ error: 'That issue is not published.' });
  const lang = req.query.lang === 'si' || req.query.lang === 'ta' ? req.query.lang : 'en';
  const url = `http://127.0.0.1:${PORT}/magazine/${magazine.slug}/print?lang=${lang}`;
  try {
    const pdf = await renderPdf(url);
    const name = `The-Trainer-${magazine.slug}-${lang.toUpperCase()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.send(Buffer.from(pdf));
  } catch (error) {
    res.status(503).json({
      error: error.message,
      fallback: `/magazine/${magazine.slug}/print?lang=${lang}&autoprint=1`
    });
  }
}));

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || 'local';
  const attempt = loginAttempts.get(ip) || { n: 0, t: Date.now() };
  if (Date.now() - attempt.t > 15 * 60 * 1000) {
    attempt.n = 0;
    attempt.t = Date.now();
  }
  if (attempt.n >= 8) return res.status(429).json({ error: 'Too many sign-in attempts. Wait a few minutes.' });
  const loginName = clean(req.body.email, 190).toLowerCase();
  const password = String(req.body.password || '');
  const user = db.get('SELECT * FROM users WHERE username = ? OR email = ?', [loginName, loginName]);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    attempt.n += 1;
    loginAttempts.set(ip, attempt);
    return res.status(401).json({ error: 'Username or password is incorrect.' });
  }
  if (!user.active) return res.status(403).json({ error: 'This account has been deactivated.' });
  loginAttempts.delete(ip);
  req.session.user = { id: user.id, role: user.role, email: user.email };
  audit(user.id, 'login', 'user', user.id, loginName);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.put('/api/auth/profile', requireAuth, (req, res) => {
  const nameEn = clean(req.body.full_name_en, 160);
  const nameSi = clean(req.body.full_name_si, 160);
  if (nameEn.length < 3 || nameSi.length < 2) return res.status(400).json({ error: 'Give your name in both languages.' });
  db.run(
    `UPDATE users SET full_name_en=?, full_name_si=?, designation_en=?, designation_si=?, phone=?, updated_at=? WHERE id=?`,
    [nameEn, nameSi, clean(req.body.designation_en, 160), clean(req.body.designation_si, 160), clean(req.body.phone, 40), nowIso(), req.user.id]
  );
  res.json({ user: publicUser(db.get('SELECT * FROM users WHERE id = ?', [req.user.id])) });
});

app.put('/api/auth/password', requireAuth, (req, res) => {
  const next = String(req.body.password || '');
  const current = String(req.body.current_password || '');
  if (!bcrypt.compareSync(current, req.user.password_hash)) return res.status(400).json({ error: 'Current password is incorrect.' });
  if (next.length < 8) return res.status(400).json({ error: 'Use at least 8 characters.' });
  db.run('UPDATE users SET password_hash=?, updated_at=? WHERE id=?', [bcrypt.hashSync(next, 10), nowIso(), req.user.id]);
  audit(req.user.id, 'password', 'user', req.user.id, 'self');
  res.json({ ok: true });
});

app.get('/api/categories', requireAuth, (req, res) => {
  const rows = db.all('SELECT * FROM categories ORDER BY sort_order');
  const visible = req.user.role === 'admin' ? rows : rows.filter((row) => row.slug !== 'editorial');
  res.json({ categories: visible });
});

app.get('/api/articles', requireAuth, (req, res) => {
  const ownOnly = req.user.role !== 'admin' || req.query.mine === '1';
  const rows = ownOnly
    ? db.all('SELECT * FROM articles WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id])
    : db.all('SELECT * FROM articles ORDER BY updated_at DESC');
  res.json({ articles: rows.map(hydrateArticle) });
});

app.post('/api/articles', requireAuth, (req, res, next) => {
  try {
  if (req.body.category === 'editorial' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Leadership messages are filed by the editor.' });
  }
  const input = readArticleInput(req.body);
  const now = nowIso();
  const result = db.run(
    `INSERT INTO articles
      (user_id, category_id, magazine_id, title_en, title_si, body_en, body_si, excerpt_en, excerpt_si, byline_en, byline_si,
       status, featured, page_number, sort_order, target_month, target_year, reviewer_notes, submitted_at, reviewed_at, created_at, updated_at)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, NULL, 0, ?, ?, '', NULL, NULL, ?, ?)`,
    [req.user.id, input.category.id, input.title_en, input.title_si, input.body_en, input.body_si, input.excerpt_en, input.excerpt_si, input.byline_en, input.byline_si, input.target_month, input.target_year, now, now]
  );
  saveProgram(result.id, input.program);
  audit(req.user.id, 'create', 'article', result.id, input.title_en);
  res.status(201).json({ article: hydrateArticle(db.get('SELECT * FROM articles WHERE id = ?', [result.id])) });
  } catch (error) { next(error); }
});

app.put('/api/articles/:id', requireAuth, (req, res, next) => {
  try {
  const article = db.get('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  if (!article) return res.status(404).json({ error: 'Piece not found.' });
  const admin = req.user.role === 'admin';
  if (!admin && article.user_id !== req.user.id) return res.status(403).json({ error: 'You can edit only your own drafts.' });
  if (!admin && !['draft', 'rejected'].includes(article.status)) {
    return res.status(409).json({ error: 'This piece is already with the editor.' });
  }
  if (article.status === 'published' && !admin) return res.status(409).json({ error: 'Published pieces stay with the issue.' });
  const input = readArticleInput(req.body);
  db.run(
    `UPDATE articles SET category_id=?, title_en=?, title_si=?, body_en=?, body_si=?, excerpt_en=?, excerpt_si=?, byline_en=?, byline_si=?,
      target_month=?, target_year=?, updated_at=? WHERE id=?`,
    [input.category.id, input.title_en, input.title_si, input.body_en, input.body_si, input.excerpt_en, input.excerpt_si, input.byline_en, input.byline_si, input.target_month, input.target_year, nowIso(), article.id]
  );
  saveProgram(article.id, input.program);
  res.json({ article: hydrateArticle(db.get('SELECT * FROM articles WHERE id = ?', [article.id])) });
  } catch (error) { next(error); }
});

app.post('/api/articles/:id/submit', requireAuth, (req, res) => {
  const article = db.get('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  if (!article || (article.user_id !== req.user.id && req.user.role !== 'admin')) {
    return res.status(404).json({ error: 'Piece not found.' });
  }
  if (!['draft', 'rejected'].includes(article.status)) return res.status(409).json({ error: 'Only a draft or a returned piece can be submitted.' });
  const now = nowIso();
  db.run(`UPDATE articles SET status='submitted', reviewer_notes='', submitted_at=?, updated_at=? WHERE id=?`, [now, now, article.id]);
  audit(req.user.id, 'submit', 'article', article.id, article.title_en);
  res.json({ article: hydrateArticle(db.get('SELECT * FROM articles WHERE id = ?', [article.id])) });
});

app.post('/api/articles/:id/publish', requireAdmin, (req, res) => {
  const article = db.get('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  if (!article) return res.status(404).json({ error: 'Piece not found.' });
  const category = db.get('SELECT slug FROM categories WHERE id = ?', [article.category_id]);
  const magazine = db.get('SELECT * FROM magazines WHERE year = ? AND month = ?', [article.target_year, article.target_month]);
  const now = nowIso();
  if (!magazine) {
    db.run(`UPDATE articles SET status='approved', updated_at=? WHERE id=?`, [now, article.id]);
    audit(req.user.id, 'approve', 'article', article.id, article.title_en);
    return res.json({ article: hydrateArticle(db.get('SELECT * FROM articles WHERE id = ?', [article.id])), placed: false });
  }
  const live = magazine.status === 'published' ? 'published' : 'approved';
  if (category && category.slug === 'editorial') {
    const others = db.all(
      `SELECT a.id, a.page_number FROM articles a
       JOIN categories c ON c.id = a.category_id
       WHERE a.magazine_id = ? AND c.slug = 'editorial' AND a.id != ?
       ORDER BY a.page_number, a.sort_order`,
      [magazine.id, article.id]
    );
    const room = pageSize('editorial');
    let page = 2;
    let sort = 0;
    const onTwo = others.filter((row) => Number(row.page_number) === 2);
    if (onTwo.length < room) {
      db.run(
        `UPDATE articles SET sort_order = sort_order + 1, updated_at = ? WHERE magazine_id = ? AND page_number = 2 AND id != ?`,
        [now, magazine.id, article.id]
      );
    } else {
      const lastPage = others.reduce((max, row) => Math.max(max, Number(row.page_number) || 2), 2);
      const onLast = others.filter((row) => Number(row.page_number) === lastPage);
      if (onLast.length < room) {
        page = lastPage;
        sort = onLast.length;
      } else {
        const maxPage = db.get('SELECT COALESCE(MAX(page_number), 1) AS n FROM articles WHERE magazine_id = ?', [magazine.id]).n;
        page = Math.max(2, Number(maxPage) + 1);
      }
    }
    db.run(
      `UPDATE articles SET magazine_id=?, page_number=?, sort_order=?, status=?, updated_at=? WHERE id=?`,
      [magazine.id, page, sort, live, now, article.id]
    );
  } else {
    db.run(`UPDATE articles SET status='approved', updated_at=? WHERE id=?`, [now, article.id]);
  }
  audit(req.user.id, 'publish-piece', 'article', article.id, article.title_en);
  const placed = !!(category && category.slug === 'editorial');
  res.json({ article: hydrateArticle(db.get('SELECT * FROM articles WHERE id = ?', [article.id])), placed, issue: magazine.slug });
});

app.post('/api/articles/:id/media', requireAuth, (req, res) => {
  upload.single('file')(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message || 'Upload failed.' });
    const article = db.get('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (!article) return res.status(404).json({ error: 'Piece not found.' });
    if (article.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your piece.' });
    if (!req.file) return res.status(400).json({ error: 'Choose an image.' });
    const result = db.run(
      `INSERT INTO media (article_id, magazine_id, user_id, filename, path, mime, caption_en, caption_si, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [article.id, article.magazine_id, req.user.id, req.file.filename, `/uploads/${req.file.filename}`, req.file.mimetype, clean(req.body.caption_en, 255), clean(req.body.caption_si, 255), nowIso()]
    );
    res.status(201).json({ media: db.get('SELECT * FROM media WHERE id = ?', [result.id]) });
  });
});

app.delete('/api/media/:id', requireAuth, (req, res) => {
  const media = db.get('SELECT * FROM media WHERE id = ?', [req.params.id]);
  if (!media) return res.status(404).json({ error: 'Image not found.' });
  const article = media.article_id ? db.get('SELECT * FROM articles WHERE id = ?', [media.article_id]) : null;
  const owns = article && article.user_id === req.user.id;
  if (!owns && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your image.' });
  if (article && req.user.role !== 'admin' && !['draft', 'rejected'].includes(article.status)) {
    return res.status(409).json({ error: 'Images on a submitted piece stay until the editor returns it.' });
  }
  if (media.path.startsWith('/uploads/')) {
    fs.unlink(path.join(__dirname, 'public', media.path), () => {});
  }
  db.run('DELETE FROM media WHERE id = ?', [media.id]);
  res.json({ ok: true });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const count = (sql) => db.get(sql).n;
  res.json({
    users: count('SELECT COUNT(*) AS n FROM users'),
    active_users: count('SELECT COUNT(*) AS n FROM users WHERE active = 1'),
    pending: count(`SELECT COUNT(*) AS n FROM articles WHERE status = 'submitted'`),
    drafts: count(`SELECT COUNT(*) AS n FROM articles WHERE status = 'draft'`),
    published_issues: count(`SELECT COUNT(*) AS n FROM magazines WHERE status = 'published'`),
    draft_issues: count(`SELECT COUNT(*) AS n FROM magazines WHERE status = 'draft'`),
    audit: db.all('SELECT a.*, u.full_name_en FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 8')
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const size = 8;
  const q = `%${clean(req.query.q, 80)}%`;
  const role = clean(req.query.role, 20);
  const filters = ['(full_name_en LIKE ? OR full_name_si LIKE ? OR email LIKE ? OR username LIKE ?)'];
  const params = [q, q, q, q];
  if (role === 'admin' || role === 'contributor') {
    filters.push('role = ?');
    params.push(role);
  }
  if (req.query.active === '0' || req.query.active === '1') {
    filters.push('active = ?');
    params.push(Number(req.query.active));
  }
  const where = `WHERE ${filters.join(' AND ')}`;
  const total = db.get(`SELECT COUNT(*) AS n FROM users ${where}`, params).n;
  const users = db.all(
    `SELECT * FROM users ${where} ORDER BY active DESC, full_name_en LIMIT ? OFFSET ?`,
    [...params, size, (page - 1) * size]
  ).map(publicUser);
  res.json({ users, page, pages: Math.max(1, Math.ceil(total / size)), total });
});

function usernameOf(value) {
  return clean(value, 32).toLowerCase();
}

function validUsername(value) {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(value);
}

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const username = usernameOf(req.body.username);
  const email = clean(req.body.email, 190).toLowerCase();
  const nameEn = clean(req.body.full_name_en, 160);
  const nameSi = clean(req.body.full_name_si, 160);
  const role = req.body.role === 'admin' ? 'admin' : 'contributor';
  if (!validUsername(username)) return res.status(400).json({ error: 'Username must be 3–32 letters or numbers.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email.' });
  if (nameEn.length < 3 || nameSi.length < 2) return res.status(400).json({ error: 'Name is required in both languages.' });
  if (db.get('SELECT id FROM users WHERE username = ?', [username])) return res.status(409).json({ error: 'That username is already in use.' });
  if (db.get('SELECT id FROM users WHERE email = ?', [email])) return res.status(409).json({ error: 'That email is already in use.' });
  const temporary = clean(req.body.password, 80) || `Rt${crypto.randomBytes(4).toString('hex')}#1`;
  if (temporary.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const now = nowIso();
  const result = db.run(
    `INSERT INTO users (username, email, password_hash, full_name_en, full_name_si, role, designation_en, designation_si, phone, avatar_path, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', 1, ?, ?)`,
    [username, email, bcrypt.hashSync(temporary, 10), nameEn, nameSi, role, clean(req.body.designation_en, 160), clean(req.body.designation_si, 160), clean(req.body.phone, 40), now, now]
  );
  audit(req.user.id, 'create', 'user', result.id, username);
  res.status(201).json({ user: publicUser(db.get('SELECT * FROM users WHERE id = ?', [result.id])), temporary_password: temporary });
});

app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
  const user = db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  if (user.id === req.user.id && req.body.active === false) return res.status(400).json({ error: 'You cannot deactivate your own account.' });
  if (user.id === req.user.id && req.body.role && req.body.role !== 'admin') return res.status(400).json({ error: 'You cannot remove your own admin role.' });
  const role = req.body.role === 'admin' || req.body.role === 'contributor' ? req.body.role : user.role;
  const active = req.body.active === false || req.body.active === 0 ? 0 : 1;
  const username = usernameOf(req.body.username) || user.username;
  if (!validUsername(username)) return res.status(400).json({ error: 'Username must be 3–32 letters or numbers.' });
  const taken = db.get('SELECT id FROM users WHERE username = ? AND id <> ?', [username, user.id]);
  if (taken) return res.status(409).json({ error: 'That username is already in use.' });
  db.run(
    `UPDATE users SET username=?, full_name_en=?, full_name_si=?, role=?, designation_en=?, designation_si=?, phone=?, active=?, updated_at=? WHERE id=?`,
    [
      username,
      clean(req.body.full_name_en, 160) || user.full_name_en,
      clean(req.body.full_name_si, 160) || user.full_name_si,
      role,
      clean(req.body.designation_en, 160),
      clean(req.body.designation_si, 160),
      clean(req.body.phone, 40),
      active,
      nowIso(),
      user.id
    ]
  );
  audit(req.user.id, active ? 'update' : 'deactivate', 'user', user.id, user.email);
  res.json({ user: publicUser(db.get('SELECT * FROM users WHERE id = ?', [user.id])) });
});

app.post('/api/admin/users/:id/reset-password', requireAdmin, (req, res) => {
  const user = db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  const temporary = `Rt${crypto.randomBytes(4).toString('hex')}#1`;
  db.run('UPDATE users SET password_hash=?, updated_at=? WHERE id=?', [bcrypt.hashSync(temporary, 10), nowIso(), user.id]);
  audit(req.user.id, 'reset-password', 'user', user.id, user.email);
  res.json({ temporary_password: temporary });
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const user = db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  if (user.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
  const writings = db.get('SELECT COUNT(*) AS n FROM articles WHERE user_id = ?', [user.id]).n;
  if (writings) return res.status(409).json({ error: 'This account has submissions. Deactivate it instead of deleting it.' });
  db.run('DELETE FROM users WHERE id = ?', [user.id]);
  audit(req.user.id, 'delete', 'user', user.id, user.email);
  res.json({ ok: true });
});

app.get('/api/admin/articles', requireAdmin, (req, res) => {
  const status = clean(req.query.status, 20);
  const category = clean(req.query.category, 40);
  const q = `%${clean(req.query.q, 80)}%`;
  const filters = ['(a.title_en LIKE ? OR a.title_si LIKE ?)'];
  const params = [q, q];
  if (['draft', 'submitted', 'approved', 'rejected', 'published'].includes(status)) {
    filters.push('a.status = ?');
    params.push(status);
  }
  if (category) {
    filters.push('c.slug = ?');
    params.push(category);
  }
  const rows = db.all(
    `SELECT a.* FROM articles a JOIN categories c ON c.id = a.category_id
     WHERE ${filters.join(' AND ')} ORDER BY a.updated_at DESC LIMIT 200`,
    params
  );
  res.json({ articles: rows.map(hydrateArticle) });
});

app.post('/api/admin/articles/:id/review', requireAdmin, (req, res) => {
  const article = db.get('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  if (!article) return res.status(404).json({ error: 'Piece not found.' });
  if (article.status === 'published') return res.status(409).json({ error: 'Unpublish the issue before changing a published piece.' });
  const decision = req.body.decision === 'reject' ? 'rejected' : 'approved';
  const notes = clean(req.body.notes, 1000);
  if (decision === 'rejected' && notes.length < 3) return res.status(400).json({ error: 'Write a short note explaining the return.' });
  const now = nowIso();
  db.run(
    `UPDATE articles SET status=?, reviewer_notes=?, reviewed_at=?, updated_at=? WHERE id=?`,
    [decision, notes, now, now, article.id]
  );
  audit(req.user.id, decision, 'article', article.id, article.title_en);
  res.json({ article: hydrateArticle(db.get('SELECT * FROM articles WHERE id = ?', [article.id])) });
});

app.get('/api/admin/magazines', requireAdmin, (req, res) => {
  const magazines = db.all('SELECT * FROM magazines ORDER BY year DESC, month DESC');
  res.json({
    magazines: magazines.map((magazine) => ({
      ...magazineCard(magazine, articlesForMagazine(magazine.id)),
      summary_en: magazine.summary_en,
      summary_si: magazine.summary_si
    }))
  });
});

app.post('/api/admin/magazines', requireAdmin, (req, res) => {
  const month = Number(req.body.month);
  const year = Number(req.body.year);
  const titleEn = clean(req.body.title_en, 200);
  const titleSi = clean(req.body.title_si, 200);
  if (month < 1 || month > 12 || year < 2024 || year > 2100) return res.status(400).json({ error: 'Choose a valid month and year.' });
  if (titleEn.length < 3 || titleSi.length < 2) return res.status(400).json({ error: 'The issue needs a title in both languages.' });
  const slug = `${year}-${String(month).padStart(2, '0')}`;
  if (db.get('SELECT id FROM magazines WHERE slug = ?', [slug])) return res.status(409).json({ error: 'That month already has an issue.' });
  const highlights = Array.isArray(req.body.highlights) ? req.body.highlights.slice(0, 4).map((item) => ({
    en: clean(item.en, 240),
    si: clean(item.si, 240)
  })).filter((item) => item.en || item.si) : [];
  const now = nowIso();
  const result = db.run(
    `INSERT INTO magazines (slug, month, year, title_en, title_si, summary_en, summary_si, highlights_json, cover_path, status, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, ?, ?)`,
    [slug, month, year, titleEn, titleSi, clean(req.body.summary_en, 2000), clean(req.body.summary_si, 2000), JSON.stringify(highlights), `/assets/covers/${slug}.svg`, now, now]
  );
  audit(req.user.id, 'create', 'magazine', result.id, slug);
  res.status(201).json({ magazine: db.get('SELECT * FROM magazines WHERE id = ?', [result.id]) });
});

app.put('/api/admin/magazines/:id', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
  const highlights = Array.isArray(req.body.highlights) ? req.body.highlights.slice(0, 4).map((item) => ({
    en: clean(item.en, 240),
    si: clean(item.si, 240)
  })).filter((item) => item.en || item.si) : parseJson(magazine.highlights_json, []);
  db.run(
    `UPDATE magazines SET title_en=?, title_si=?, summary_en=?, summary_si=?, highlights_json=?, updated_at=? WHERE id=?`,
    [
      clean(req.body.title_en, 200) || magazine.title_en,
      clean(req.body.title_si, 200) || magazine.title_si,
      clean(req.body.summary_en, 2000),
      clean(req.body.summary_si, 2000),
      JSON.stringify(highlights),
      nowIso(),
      magazine.id
    ]
  );
  res.json({ magazine: db.get('SELECT * FROM magazines WHERE id = ?', [magazine.id]) });
});

function saveIssueImage(column) {
  return (req, res) => {
    upload.single('file')(req, res, (error) => {
      if (error) return res.status(400).json({ error: error.message || 'Upload failed.' });
      const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
      if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
      if (!req.file) return res.status(400).json({ error: 'Choose a photograph.' });
      const image = `/uploads/${req.file.filename}`;
      db.run(`UPDATE magazines SET ${column}=?, updated_at=? WHERE id=?`, [image, nowIso(), magazine.id]);
      db.run(
        `INSERT INTO media (article_id, magazine_id, user_id, filename, path, mime, caption_en, caption_si, created_at)
         VALUES (NULL, ?, ?, ?, ?, ?, '', '', ?)`,
        [magazine.id, req.user.id, req.file.filename, image, req.file.mimetype, nowIso()]
      );
      res.json({ path: image, [column]: image });
    });
  };
}

function coverPayload(body, auto) {
  const saved = {};
  ['mast_en', 'mast_si', 'mast_ta', 'tri', 'vol', 'issue_en', 'issue_si', 'issue_ta', 'unit_en', 'unit_si', 'unit_ta', 'title_en', 'title_si', 'title_ta'].forEach((key) => {
    const value = clean(body[key], 400);
    if (value && value !== String(auto[key] || '').trim()) saved[key] = value;
  });
  ['en', 'si', 'ta'].forEach((lang) => {
    const key = `lines_${lang}`;
    const lines = [0, 1, 2].map((index) => clean(body[`line_${lang}_${index}`], 300));
    const automatic = (auto[key] || []).concat(['', '', '']).slice(0, 3).map((line) => String(line || '').trim());
    const same = lines.every((line, index) => line === automatic[index]);
    if (!same) saved[key] = lines;
  });
  return saved;
}

app.post('/api/admin/magazines/:id/cover-text', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
  const series = seriesOf(magazine);
  const articles = db.all(
    `SELECT a.*, c.slug AS category_slug
     FROM articles a JOIN categories c ON c.id = a.category_id
     WHERE a.magazine_id = ?
     ORDER BY a.page_number, a.sort_order, a.id`,
    [magazine.id]
  );
  const { auto } = coverFields({ ...magazine, volume: series.volume, number: series.number }, articles);
  const saved = req.body && req.body.reset ? {} : coverPayload(req.body || {}, auto);
  db.run('UPDATE magazines SET cover_copy_json = ?, updated_at = ? WHERE id = ?', [JSON.stringify(saved), nowIso(), magazine.id]);
  res.json({ cover: coverFields({ ...magazine, cover_copy_json: JSON.stringify(saved), volume: series.volume, number: series.number }, articles) });
});

app.post('/api/admin/magazines/:id/cover', requireAdmin, saveIssueImage('cover_path'));
app.post('/api/admin/magazines/:id/back', requireAdmin, saveIssueImage('back_path'));

app.post('/api/admin/magazines/:id/assemble', requireAdmin, (req, res) => {
  try {
    const result = assembleMagazine(db, Number(req.params.id));
    audit(req.user.id, 'assemble', 'magazine', Number(req.params.id), `${result.placed} pieces`);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

app.post('/api/admin/magazines/:id/assign', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  const article = db.get('SELECT * FROM articles WHERE id = ?', [req.body.articleId]);
  if (!magazine || !article) return res.status(404).json({ error: 'Issue or piece not found.' });
  if (magazine.status !== 'draft') return res.status(409).json({ error: 'Unpublish the issue before changing its layout.' });
  if (!['approved', 'submitted'].includes(article.status) && article.magazine_id !== magazine.id) {
    return res.status(409).json({ error: 'Approve the piece before placing it.' });
  }
  const page = Number(req.body.page);
  if (!Number.isInteger(page) || page < 2 || page > 48) {
    return res.status(400).json({ error: 'Inner pages start at 2. The cover is page 1 and is built from the photograph and featured stories.' });
  }
  const category = db.get('SELECT slug FROM categories WHERE id = ?', [article.category_id]);
  const onPage = db.all(
    `SELECT a.*, c.slug AS category_slug
     FROM articles a JOIN categories c ON c.id = a.category_id
     WHERE a.magazine_id = ? AND a.page_number = ? AND a.id != ?
     ORDER BY a.sort_order, a.id`,
    [magazine.id, page, article.id]
  );
  const incomingSlug = category ? category.slug : '';
  const hasEditorial = onPage.some((row) => row.category_slug === 'editorial');
  const hasOther = onPage.some((row) => row.category_slug !== 'editorial');
  if (incomingSlug === 'editorial' && (hasOther || onPage.length >= pageSize('editorial'))) {
    return res.status(409).json({ error: 'The leadership page holds its own pieces. Start the next piece on a new page.' });
  }
  if (incomingSlug !== 'editorial' && hasEditorial) {
    return res.status(409).json({ error: 'The leadership page is already full. Start this piece on a new page.' });
  }
  if (onPage.length >= 6) {
    return res.status(409).json({ error: 'This page is full. Start the next piece on a new page.' });
  }
  if (onPage.length && incomingSlug !== 'editorial') {
    const ids = onPage.map((row) => row.id);
    const photos = db.all(
      `SELECT article_id, COUNT(*) AS n FROM media WHERE article_id IN (${ids.map(() => '?').join(',')}) GROUP BY article_id`,
      ids
    );
    const photoMap = new Map(photos.map((row) => [row.article_id, Number(row.n) || 0]));
    const openers = db.all(
      `SELECT a.page_number, c.slug AS category_slug
       FROM articles a JOIN categories c ON c.id = a.category_id
       WHERE a.magazine_id = ? AND a.page_number >= 2 AND a.page_number < ?
       ORDER BY a.page_number, a.sort_order, a.id`,
      [magazine.id, page]
    );
    const seen = new Set();
    let statsUsed = false;
    openers.forEach((row) => {
      if (seen.has(row.page_number)) return;
      seen.add(row.page_number);
      if (row.category_slug === 'training') statsUsed = true;
    });
    const decision = fits(onPage, { ...article, category_slug: incomingSlug }, photoMap, statsUsed);
    if (decision === 'new') {
      return res.status(409).json({ error: 'Only a small gap is left on this page. Start this piece on a new page.' });
    }
  }
  const sort = db.get('SELECT COALESCE(MAX(sort_order), -1) AS n FROM articles WHERE magazine_id = ? AND page_number = ?', [magazine.id, page]).n + 1;
  const now = nowIso();
  db.run(
    `UPDATE articles SET magazine_id=?, page_number=?, sort_order=?, status=CASE WHEN status='submitted' THEN 'approved' ELSE status END, updated_at=? WHERE id=?`,
    [magazine.id, page, sort, now, article.id]
  );
  res.json({ article: hydrateArticle(db.get('SELECT * FROM articles WHERE id = ?', [article.id])) });
});

app.post('/api/admin/magazines/:id/feature', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  const article = db.get('SELECT * FROM articles WHERE id = ? AND magazine_id = ?', [req.body.articleId, req.params.id]);
  if (!magazine || !article) return res.status(404).json({ error: 'Place the piece in this issue first.' });
  if (magazine.status !== 'draft') return res.status(409).json({ error: 'Unpublish the issue before changing the cover lines.' });
  const featured = req.body.featured ? 1 : 0;
  if (featured) {
    const count = db.get('SELECT COUNT(*) AS n FROM articles WHERE magazine_id = ? AND featured = 1 AND id != ?', [magazine.id, article.id]).n;
    if (count >= 3) return res.status(409).json({ error: 'The cover holds three lines. Remove one first.' });
  }
  db.run('UPDATE articles SET featured=?, updated_at=? WHERE id=?', [featured, nowIso(), article.id]);
  res.json({ ok: true });
});

app.post('/api/admin/magazines/:id/unassign', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
  if (magazine.status !== 'draft') return res.status(409).json({ error: 'Unpublish the issue before changing its layout.' });
  db.run(
    `UPDATE articles SET magazine_id=NULL, page_number=NULL, featured=0, updated_at=? WHERE id=? AND magazine_id=?`,
    [nowIso(), req.body.articleId, magazine.id]
  );
  res.json({ ok: true });
});

app.post('/api/admin/magazines/:id/publish', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
  const placed = db.get('SELECT COUNT(*) AS n FROM articles WHERE magazine_id = ?', [magazine.id]).n;
  if (!placed) return res.status(409).json({ error: 'Assemble or place at least one piece before publishing.' });
  const now = nowIso();
  db.run(`UPDATE magazines SET status='published', published_at=?, updated_at=? WHERE id=?`, [now, now, magazine.id]);
  db.run(`UPDATE articles SET status='published', updated_at=? WHERE magazine_id=?`, [now, magazine.id]);
  audit(req.user.id, 'publish', 'magazine', magazine.id, magazine.slug);
  res.json({ ok: true });
});

app.post('/api/admin/magazines/:id/unpublish', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
  const now = nowIso();
  db.run(`UPDATE magazines SET status='draft', updated_at=? WHERE id=?`, [now, magazine.id]);
  db.run(`UPDATE articles SET status='approved', updated_at=? WHERE magazine_id=? AND status='published'`, [now, magazine.id]);
  audit(req.user.id, 'unpublish', 'magazine', magazine.id, magazine.slug);
  res.json({ ok: true });
});

app.get('/api/admin/magazines/:slug/pages', requireAdmin, (req, res) => {
  const bundle = loadBundle(req.params.slug);
  if (!bundle) return res.status(404).json({ error: 'Issue not found.' });
  const lang = req.query.lang === 'si' || req.query.lang === 'ta' ? req.query.lang : 'en';
  res.json({ slug: bundle.magazine.slug, lang, pages: renderPages(bundle, lang) });
});

app.get('/api/admin/magazines/:id/pdf', requireAdmin, asyncRoute(async (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
  const lang = req.query.lang === 'si' || req.query.lang === 'ta' ? req.query.lang : 'en';
  const token = crypto.randomBytes(16).toString('hex');
  previewTokens.set(token, { slug: magazine.slug, exp: Date.now() + 120000 });
  const url = `http://127.0.0.1:${PORT}/magazine/${magazine.slug}/print?lang=${lang}&token=${token}`;
  try {
    const pdf = await renderPdf(url);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="The-Trainer-${magazine.slug}-${lang.toUpperCase()}.pdf"`);
    res.send(Buffer.from(pdf));
  } catch (error) {
    res.status(503).json({ error: error.message, fallback: `/magazine/${magazine.slug}/print?lang=${lang}` });
  }
}));

app.get('/api/admin/issue/:id', requireAdmin, (req, res) => {
  const magazine = db.get('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
  if (!magazine) return res.status(404).json({ error: 'Issue not found.' });
  const placed = db.all(
    `SELECT a.*, c.slug AS category_slug, u.full_name_en AS author_en
     FROM articles a JOIN categories c ON c.id = a.category_id JOIN users u ON u.id = a.user_id
     WHERE a.magazine_id = ? ORDER BY a.page_number, a.sort_order`,
    [magazine.id]
  );
  const pool = db.all(
    `SELECT a.*, c.slug AS category_slug, u.full_name_en AS author_en
     FROM articles a JOIN categories c ON c.id = a.category_id JOIN users u ON u.id = a.user_id
     WHERE a.magazine_id IS NULL AND a.status IN ('approved', 'submitted') AND a.target_year = ? AND a.target_month = ?
     ORDER BY a.status, a.title_en`,
    [magazine.year, magazine.month]
  );
  const series = seriesOf(magazine);
  const view = { ...magazine, highlights: parseJson(magazine.highlights_json, []), volume: series.volume, number: series.number };
  res.json({
    magazine: view,
    placed,
    pool,
    cover: coverFields(view, placed)
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'journal.html'));
});

['/index.html', '/about.html', '/programmes.html', '/courses.html', '/scholarships.html', '/downloads.html', '/contact.html'].forEach((page) => {
  app.get(page, (req, res) => res.redirect('/'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'Unexpected server error.' : error.message });
});

db.init();
app.listen(PORT, () => {
  console.log(`The Trainer is running at http://127.0.0.1:${PORT}`);
  console.log('Admin  admin  /  123');
  console.log('Staff  nimal.perera@mdtu.local  /  Retreat#Staff1');
});

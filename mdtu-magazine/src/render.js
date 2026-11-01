const { get, all } = require('./db');
const { limitsFor, isEssay } = require('./assemble');
const {
  monthName, issueSeries, formatRange, parseJson, esc, paragraphs
} = require('./format');

const GROUPS = [
  { slug: 'training', en: 'Programmes & progress', si: 'වැඩසටහන් හා ප්‍රගතිය', ta: 'பயிற்சிகளும் முன்னேற்றமும்' },
  { slug: 'milestones', en: 'Milestones', si: 'සන්ධිස්ථාන', ta: 'மைல்கற்கள்' },
  { slug: 'language', en: 'Language & external courses', si: 'භාෂා හා බාහිර පාඨමාලා', ta: 'மொழி மற்றும் வெளிப்புற பாடநெறிகள்' },
  { slug: 'scholarship', en: 'Foreign scholarships', si: 'විදේශ ශිෂ්‍යත්ව', ta: 'வெளிநாட்டு உதவித்தொகை' },
  { slug: 'creative', en: 'Creative corner', si: 'නිර්මාණ කොන', ta: 'படைப்பு மூலை' },
  { slug: 'plans', en: 'The month ahead', si: 'ඉදිරි මාසය', ta: 'வரும் மாதம்' }
];

function tr(lang, en, si, ta) {
  if (lang === 'si') return si;
  if (lang === 'ta') return ta;
  return en;
}

function mastName(lang) {
  return tr(lang, 'The Trainer', 'පුහුණුකරු', 'பயிற்சியாளர்');
}

function safeLangOf(lang) {
  return lang === 'si' || lang === 'ta' ? lang : 'en';
}

function pick(article, lang, enKey, siKey) {
  const si = article[siKey];
  const en = article[enKey];
  if (lang === 'si' && si) return si;
  return en || si || '';
}

function loadBundle(slug) {
  const magazine = get('SELECT * FROM magazines WHERE slug = ?', [slug]);
  if (!magazine) return null;
  magazine.highlights = parseJson(magazine.highlights_json, []);
  const identity = issueSeries(all('SELECT id, year, month FROM magazines')).get(magazine.id) || { volume: 1, number: 1 };
  magazine.volume = identity.volume;
  magazine.number = identity.number;
  const articles = all(
    `SELECT a.*, c.slug AS category_slug, c.name_en AS category_en, c.name_si AS category_si,
            u.full_name_en AS author_en, u.full_name_si AS author_si,
            u.designation_en AS role_en, u.designation_si AS role_si, u.avatar_path,
            p.start_date, p.end_date, p.target_group_en, p.target_group_si,
            p.venue_en, p.venue_si, p.participants, p.outcomes_en, p.outcomes_si, p.metrics_json
     FROM articles a
     JOIN categories c ON c.id = a.category_id
     JOIN users u ON u.id = a.user_id
     LEFT JOIN programs p ON p.article_id = a.id
     WHERE a.magazine_id = ?
     ORDER BY a.page_number, a.sort_order, a.id`,
    [magazine.id]
  ).map((article) => ({
    ...article,
    metrics: parseJson(article.metrics_json, {})
  }));
  const media = all(
    `SELECT * FROM media
     WHERE magazine_id = ?
        OR article_id IN (SELECT id FROM articles WHERE magazine_id = ?)
     ORDER BY id`,
    [magazine.id, magazine.id]
  );
  const mediaByArticle = new Map();
  media.forEach((item) => {
    if (!item.article_id) return;
    const list = mediaByArticle.get(item.article_id) || [];
    list.push(item);
    mediaByArticle.set(item.article_id, list);
  });
  return { magazine, articles, mediaByArticle };
}

function issueStats(articles) {
  const training = articles.filter((article) => article.category_slug === 'training');
  const language = articles.filter((article) => article.category_slug === 'language');
  const scholarships = articles.filter((article) => article.category_slug === 'scholarship');
  const participants = training.reduce((sum, article) => sum + (Number(article.participants) || 0), 0);
  return {
    workshops: training.length,
    participants,
    language: language.length,
    scholarships: scholarships.length
  };
}

function onPage(articles, page) {
  return articles.filter((article) => Number(article.page_number) === page);
}

function photoFigure(item, lang, extra = '') {
  if (!item) {
    return `<figure class="m-photo m-ph ${extra}"></figure>`;
  }
  const caption = lang === 'si' ? (item.caption_si || item.caption_en) : (item.caption_en || item.caption_si);
  return `<figure class="m-photo ${extra}"><img src="${esc(item.path)}" alt="${esc(caption || '')}">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
}

function metaLine(article, lang) {
  const bits = [];
  const range = formatRange(article.start_date, article.end_date, lang);
  if (range) bits.push(range);
  const venue = pick(article, lang, 'venue_en', 'venue_si');
  if (venue) bits.push(venue);
  if (article.participants) {
    bits.push(tr(lang, `${article.participants} participants`, `සහභාගිවන්නන් ${article.participants}`, `${article.participants} பங்கேற்பாளர்கள்`));
  }
  return bits.join(' · ');
}

function metricChips(article, lang) {
  const metrics = article.metrics || {};
  const chips = [];
  if (metrics.sessions) chips.push(`<li><b>${esc(metrics.sessions)}</b><span>${tr(lang, 'sessions', 'සැසි', 'அமர்வுகள்')}</span></li>`);
  if (metrics.hours) chips.push(`<li><b>${esc(metrics.hours)}</b><span>${tr(lang, 'hours', 'පැය', 'மணி')}</span></li>`);
  if (metrics.satisfaction) chips.push(`<li><b>${esc(metrics.satisfaction)}%</b><span>${tr(lang, 'satisfaction', 'තෘප්තිය', 'திருப்தி')}</span></li>`);
  if (!chips.length) return '';
  return `<ul class="m-metrics">${chips.join('')}</ul>`;
}

function runHead(magazine, lang, section) {
  const when = `${monthName(magazine.month, lang)} ${magazine.year}`;
  return `<header class="m-runhead"><span>${esc(mastName(lang))}</span><span class="m-dot">·</span><span>${esc(when)}</span><span class="m-runsec">${esc(section)}</span></header>`;
}

function runFoot(page, lang) {
  const unit = tr(lang, 'The Trainer', 'පුහුණුකරු', 'பயிற்சியாளர்');
  return `<footer class="m-runfoot"><span>${unit}</span><span>${String(page).padStart(2, '0')}</span></footer>`;
}

function sheet(lang, inner, extra = '') {
  const face = lang === 'si' ? 'si' : lang === 'ta' ? 'ta' : '';
  return `<section class="sheet ${extra} ${face}">${inner}</section>`;
}

function coverImage(magazine, articles, mediaByArticle) {
  const uploaded = magazine.cover_path && !/\/assets\/covers\//.test(magazine.cover_path);
  if (uploaded) return magazine.cover_path;
  const featured = articles.filter((article) => article.featured && article.category_slug !== 'editorial');
  const pool = featured.length ? featured : articles.filter((article) => article.category_slug !== 'editorial');
  for (const article of pool) {
    const photo = (mediaByArticle.get(article.id) || [])[0];
    if (photo) return photo.path;
  }
  return magazine.cover_path || '/assets/covers/2026-10.svg';
}

function coverSource(articles) {
  const lines = articles.filter((article) => article.featured).slice(0, 3);
  if (!lines.length) {
    lines.push(...articles.filter((article) => article.category_slug !== 'editorial').slice(0, 3));
  }
  return lines;
}

function coverLine(article, lang) {
  if (!article) return '';
  return pick(article, lang, 'excerpt_en', 'excerpt_si') || pick(article, lang, 'title_en', 'title_si');
}

function coverAuto(magazine, articles) {
  const volume = String(magazine.volume || 1).padStart(2, '0');
  const number = String(magazine.number || 1).padStart(2, '0');
  const lines = coverSource(articles);
  const pack = (lang) => [0, 1, 2].map((index) => coverLine(lines[index], lang));
  return {
    mast_en: 'The Trainer',
    mast_si: 'පුහුණුකරු',
    mast_ta: 'பயிற்சியாளர்',
    tri: 'The Trainer · පුහුණුකරු · பயிற்சியாளர்',
    vol: `Vol. ${volume}\nNo. ${number}`,
    issue_en: `${monthName(magazine.month, 'en')} ${magazine.year} · Vol. ${volume} No. ${number}`,
    issue_si: `${monthName(magazine.month, 'si')} ${magazine.year} · Vol. ${volume} No. ${number}`,
    issue_ta: `${monthName(magazine.month, 'ta')} ${magazine.year} · Vol. ${volume} No. ${number}`,
    unit_en: 'Management Development and Training Unit · North Western Provincial Council',
    unit_si: 'කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය · වයඹ පළාත් සභාව',
    unit_ta: 'முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சி அலகு · வடமேல் மாகாண சபை',
    title_en: magazine.title_en || '',
    title_si: magazine.title_si || '',
    title_ta: magazine.title_en || '',
    lines_en: pack('en'),
    lines_si: pack('si'),
    lines_ta: pack('ta')
  };
}

function coverSaved(magazine) {
  const saved = parseJson(magazine.cover_copy_json, {});
  return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
}

function coverFields(magazine, articles) {
  const auto = coverAuto(magazine, articles);
  const saved = coverSaved(magazine);
  return { auto, saved };
}

function coverValue(saved, auto, key) {
  const value = String(saved[key] || '').trim();
  return value || auto[key] || '';
}

function coverLines(saved, auto, lang) {
  const key = `lines_${lang}`;
  if (Array.isArray(saved[key])) {
    return saved[key].map((line) => String(line || '').trim()).filter(Boolean);
  }
  return (auto[key] || []).map((line) => String(line || '').trim()).filter(Boolean);
}

function pageCover(bundle, lang) {
  const { magazine, articles, mediaByArticle } = bundle;
  const { auto, saved } = coverFields(magazine, articles);
  const face = lang === 'si' || lang === 'ta' ? lang : 'en';
  const items = coverLines(saved, auto, face).map((line) => `<li>${esc(line)}</li>`).join('');
  const cover = coverImage(magazine, articles, mediaByArticle);
  const volHtml = esc(coverValue(saved, auto, 'vol')).replace(/\n/g, '<br>');
  return sheet(lang, `
    <div class="cover-bleed"><img src="${esc(cover)}" alt=""></div>
    <div class="cover-shade"></div>
    <div class="cover-frame"></div>
    <header class="cover-banner"><img src="/assets/official-header.jpg" alt=""></header>
    <div class="cover-vol">${volHtml}</div>
    <h1 class="cover-mast">${esc(coverValue(saved, auto, `mast_${face}`))}</h1>
    <p class="cover-tri">${esc(coverValue(saved, auto, 'tri'))}</p>
    <div class="cover-bottom">
      <p class="cover-issue">${esc(coverValue(saved, auto, `issue_${face}`))}</p>
      <p class="cover-unit">${esc(coverValue(saved, auto, `unit_${face}`))}</p>
      <h2 class="cover-title">${esc(coverValue(saved, auto, `title_${face}`))}</h2>
      <ul class="cover-lines">${items}</ul>
    </div>
  `, 'cover front');
}

function pageEditorial(bundle, lang, sourcePage, displayPage, displayOf) {
  const { magazine, articles, mediaByArticle } = bundle;
  const desk = onPage(articles, sourcePage);
  const message = desk[0];
  const director = desk[1];
  const kicker = tr(lang, "Deputy Chief Secretary's message", 'නියෝජ්‍ය ප්‍රධාන ලේකම්ගේ අදහස', 'துணை பிரதம செயலாளரின் செய்தி');
  const tocTitle = tr(lang, 'In this issue', 'මෙම කලාපයේ', 'இந்த இதழில்');
  const noteKicker = tr(lang, "Director's note", 'අධ්‍යක්ෂගේ සටහන', 'இயக்குநர் குறிப்பு');
  const photos = message ? (mediaByArticle.get(message.id) || []) : [];
  const portrait = (photos[0] && photos[0].path) || (message && message.avatar_path) || '/assets/portraits/dcs.svg';
  const named = message && (message.byline_en || message.byline_si);
  const name = named
    ? pick(message, lang, 'byline_en', 'byline_si')
    : (message ? pick(message, lang, 'author_en', 'author_si') : (lang === 'si' ? 'නායකත්ව මේසය' : 'Leadership desk'));
  const role = named
    ? tr(lang, 'Deputy Chief Secretary (Training)', 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)', 'துணை பிரதம செயலாளர் (பயிற்சி)')
    : (message ? pick(message, lang, 'role_en', 'role_si') : '');
  const toc = GROUPS.map((group) => {
    const rows = articles.filter((article) => article.category_slug === group.slug);
    if (!rows.length) return '';
    const page = displayOf.get(Number(rows[0].page_number)) || rows[0].page_number || '';
    return `<li><span class="m-toc-title"><span>${esc(tr(lang, group.en, group.si, group.ta))}</span></span><span class="m-toc-page">${esc(page)}</span></li>`;
  }).join('');
  const directorHtml = director ? `
    <div class="m-note">
      <p class="m-kicker">${noteKicker}</p>
      <h3>${esc(pick(director, lang, 'title_en', 'title_si'))}</h3>
      ${paragraphs(pick(director, lang, 'body_en', 'body_si'), 520)}
      <p class="m-by">${esc(pick(director, lang, 'author_en', 'author_si'))}</p>
    </div>` : '';
  const body = message
    ? paragraphs(pick(message, lang, 'body_en', 'body_si'), 900)
    : `<p>${tr(lang, 'The leadership message for this issue has not been filed yet.', 'මෙම කලාපය සඳහා නායකත්ව පණිවිඩය තවම ලියා නැත.', 'இந்த இதழுக்கான தலைமைச் செய்தி இன்னும் இல்லை.')}</p>`;
  return sheet(lang, `
    <div class="m-frame"></div>
    <div class="m-pad">
      ${runHead(magazine, lang, tr(lang, 'Leadership', 'පණිවිඩය', 'தலைமை'))}
      <div class="m-ed">
        <div>
          <p class="m-kicker">${kicker}</p>
          <h2 class="m-h2">${esc(message ? pick(message, lang, 'title_en', 'title_si') : tr(lang, 'Message', 'පණිවිඩය', 'செய்தி'))}</h2>
          <div class="m-portrait">
            <img src="${esc(portrait)}" alt="">
            <div><strong>${esc(name)}</strong><span>${esc(role)}</span></div>
          </div>
          <div class="m-copy">${body}</div>
          <p class="m-sign">${esc(name)}</p>
        </div>
        <aside>
          <h3 class="m-aside-h">${tocTitle}</h3>
          <ol class="m-toc">${toc}</ol>
          ${directorHtml}
        </aside>
      </div>
      ${runFoot(displayPage, lang)}
    </div>
  `);
}

function storyCard(article, lang, media, mode, limit) {
  const photo = photoFigure((media || [])[0], lang);
  const title = pick(article, lang, 'title_en', 'title_si');
  const cap = limit || (mode === 'lead' ? 680 : 280);
  return `<article class="m-${mode}">
    ${photo}
    <div>
      <h3>${esc(title)}</h3>
      <p class="m-meta">${esc(metaLine(article, lang))}</p>
      <div class="m-copy">${paragraphs(pick(article, lang, 'body_en', 'body_si'), cap)}</div>
      ${metricChips(article, lang)}
    </div>
  </article>`;
}

function pageProgram(bundle, lang, page, opts) {
  const { magazine, articles, mediaByArticle } = bundle;
  const rows = onPage(articles, opts.source || page);
  const stats = opts.stats ? issueStats(articles) : null;
  const statHtml = stats ? `
    <div class="m-stats">
      <div><b>${stats.workshops}</b><span>${lang === 'si' ? 'වැඩමුළු' : 'Workshops'}</span></div>
      <div><b>${stats.participants}</b><span>${lang === 'si' ? 'සහභාගිවන්නන්' : 'Participants'}</span></div>
      <div><b>${stats.language}</b><span>${lang === 'si' ? 'භාෂා පන්ති' : 'Language courses'}</span></div>
      <div><b>${stats.scholarships}</b><span>${lang === 'si' ? 'විදේශ අනුයුක්ති' : 'Overseas attachments'}</span></div>
    </div>` : '';
  const cards = rows.map((article, index) => storyCard(
    article,
    lang,
    mediaByArticle.get(article.id),
    index === 0 && opts.lead ? 'lead' : 'row'
  )).join('');
  const empty = rows.length ? '' : `<p class="m-quiet">${lang === 'si' ? 'මෙම කොටස සඳහා අනුමත ලිපි තවම යොදා නැත.' : 'Approved pieces have not yet been placed in this section.'}</p>`;
  return sheet(lang, `
    <div class="m-frame"></div>
    <div class="m-pad">
      ${runHead(magazine, lang, opts.section || tr(lang, 'Programmes', 'වැඩසටහන්', 'பயிற்சி'))}
      <p class="m-kicker">${esc(opts.kicker)}</p>
      <h2 class="m-h2">${esc(opts.title)}</h2>
      ${opts.dek ? `<p class="m-dek">${esc(opts.dek)}</p>` : ''}
      ${statHtml}
      <div class="m-stack">${cards}${empty}</div>
      ${runFoot(page, lang)}
    </div>
  `);
}

function pageSplit(bundle, lang, page, opts) {
  const { magazine, articles, mediaByArticle } = bundle;
  const rows = onPage(articles, opts.source || page);
  const cards = rows.map((article) => {
    const photo = photoFigure((mediaByArticle.get(article.id) || [])[0], lang, 'm-slim');
    return `<article class="m-course">
      ${photo}
      <div>
        <p class="m-kicker">${esc(pick(article, lang, 'category_en', 'category_si'))}</p>
        <h3>${esc(pick(article, lang, 'title_en', 'title_si'))}</h3>
        <p class="m-meta">${esc(metaLine(article, lang))}</p>
        <div class="m-copy">${paragraphs(pick(article, lang, 'body_en', 'body_si'), 420)}</div>
        ${article.outcomes_en || article.outcomes_si ? `<p class="m-outcome">${esc(pick(article, lang, 'outcomes_en', 'outcomes_si'))}</p>` : ''}
      </div>
    </article>`;
  }).join('');
  const empty = rows.length ? '' : `<p class="m-quiet">${lang === 'si' ? 'මෙම පිටුව සඳහා අන්තර්ගතය තවම නැත.' : 'This page is waiting for approved contributions.'}</p>`;
  return sheet(lang, `
    <div class="m-frame"></div>
    <div class="m-pad">
      ${runHead(magazine, lang, opts.section)}
      <p class="m-kicker">${esc(opts.kicker)}</p>
      <h2 class="m-h2">${esc(opts.title)}</h2>
      <p class="m-dek">${esc(opts.dek)}</p>
      <div class="m-courses">${cards}${empty}</div>
      ${runFoot(page, lang)}
    </div>
  `);
}

function pageCreative(bundle, lang, sourcePage, displayPage) {
  const { magazine, articles, mediaByArticle } = bundle;
  const rows = onPage(articles, sourcePage);
  const feature = rows[0];
  const second = rows[1];
  const poemSource = feature ? pick(feature, lang, 'body_en', 'body_si') : '';
  const poem = feature
    ? `<div class="m-poem">${poemSource.split(/\n{2,}/).map((stanza) => `<p>${esc(stanza).replace(/\n/g, '<br>')}</p>`).join('')}</div>`
    : '';
  const secondHtml = second ? `
    <aside class="m-sidepiece">
      <p class="m-kicker">${lang === 'si' ? 'සටහන' : 'Note'}</p>
      <h3>${esc(pick(second, lang, 'title_en', 'title_si'))}</h3>
      <div class="m-copy">${paragraphs(pick(second, lang, 'body_en', 'body_si'), 420)}</div>
      <p class="m-by">${esc(pick(second, lang, 'author_en', 'author_si'))}</p>
    </aside>` : '';
  return sheet(lang, `
    <div class="m-frame"></div>
    <div class="m-pad">
      ${runHead(magazine, lang, lang === 'si' ? 'නිර්මාණ' : 'Nirmana')}
      <p class="m-kicker">${lang === 'si' ? 'කාර්ය මණ්ඩල නිර්මාණ' : 'Staff creative corner'}</p>
      <h2 class="m-h2">${esc(feature ? pick(feature, lang, 'title_en', 'title_si') : (lang === 'si' ? 'නිර්මාණ' : 'Creative corner'))}</h2>
      ${feature ? `<p class="m-by">${esc(pick(feature, lang, 'author_en', 'author_si'))} · ${esc(pick(feature, lang, 'role_en', 'role_si'))}</p>` : ''}
      <div class="m-spread">
        <div>${poem}${feature ? photoFigure((mediaByArticle.get(feature.id) || [])[0], lang, 'm-wide') : ''}</div>
        ${secondHtml}
      </div>
      ${runFoot(displayPage, lang)}
    </div>
  `);
}

function pageEssay(bundle, lang, sourcePage, displayPage) {
  const { magazine, articles, mediaByArticle } = bundle;
  const feature = onPage(articles, sourcePage)[0];
  const photos = feature ? (mediaByArticle.get(feature.id) || []) : [];
  const cells = [0, 1, 2, 3].map((index) => photoFigure(photos[index], lang, 'm-cell')).join('');
  return sheet(lang, `
    <div class="m-frame"></div>
    <div class="m-pad">
      ${runHead(magazine, lang, lang === 'si' ? 'නිර්මාණ' : 'Nirmana')}
      <p class="m-kicker">${lang === 'si' ? 'ඡායාරූප රචනය' : 'Photo essay'}</p>
      <h2 class="m-h2">${esc(feature ? pick(feature, lang, 'title_en', 'title_si') : (lang === 'si' ? 'රාමු' : 'Frames'))}</h2>
      <div class="m-essay">
        <div class="m-copy">${feature ? paragraphs(pick(feature, lang, 'body_en', 'body_si'), 420) : ''}</div>
        <p class="m-by">${feature ? esc(pick(feature, lang, 'author_en', 'author_si')) : ''}</p>
        <div class="m-grid">${cells}</div>
      </div>
      ${runFoot(displayPage, lang)}
    </div>
  `);
}

function backImage(magazine, articles, mediaByArticle) {
  const uploaded = magazine.back_path && !/\/assets\/covers\//.test(magazine.back_path);
  if (uploaded) return magazine.back_path;
  return coverImage(magazine, articles, mediaByArticle);
}

function pageBack(bundle, lang) {
  const { magazine, articles, mediaByArticle } = bundle;
  const when = `${monthName(magazine.month, lang)} ${magazine.year}`;
  const photo = backImage(magazine, articles, mediaByArticle);
  const volume = String(magazine.volume || 1).padStart(2, '0');
  const number = String(magazine.number || 1).padStart(2, '0');
  const imprint = tr(
    lang,
    'Management Development and Training Unit · North Western Provincial Council',
    'කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය · වයඹ පළාත් සභාව',
    'முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சி அலகு · வடமேல் மாகாண சபை'
  );
  const authors = [];
  const seen = new Set();
  articles.forEach((article) => {
    const name = pick(article, lang, 'author_en', 'author_si');
    if (!name || seen.has(name)) return;
    seen.add(name);
    authors.push(name);
  });
  const shown = authors.slice(0, 5);
  if (authors.length > shown.length) {
    const more = authors.length - shown.length;
    shown.push(tr(lang, `and ${more} more`, `තව ${more} දෙනෙක්`, `மேலும் ${more}`));
  }
  const items = shown.map((name) => `<li>${esc(name)}</li>`).join('');
  const creditLabel = tr(lang, 'Contributors to this issue', 'මෙම කලාපයට දායක වූවන්', 'இந்த இதழின் பங்களிப்பாளர்கள்');
  return sheet(lang, `
    <div class="cover-bleed"><img src="${esc(photo)}" alt=""></div>
    <div class="cover-shade"></div>
    <div class="cover-frame"></div>
    <header class="cover-banner"><img src="/assets/official-header.jpg" alt=""></header>
    <div class="cover-vol">Vol. ${volume}<br>No. ${number}</div>
    <h1 class="cover-mast">${esc(mastName(lang))}</h1>
    <p class="cover-tri">The Trainer · පුහුණුකරු · பயிற்சியாளர்</p>
    <div class="cover-bottom">
      <p class="cover-issue">${esc(when)} · Vol. ${volume} No. ${number}</p>
      <p class="cover-unit">${esc(imprint)}</p>
      <h2 class="cover-title">${esc(creditLabel)}</h2>
      <ul class="cover-lines">${items}</ul>
    </div>
  `, 'cover');
}

function dominant(rows) {
  const counts = new Map();
  rows.forEach((row) => counts.set(row.category_slug, (counts.get(row.category_slug) || 0) + 1));
  let best = rows[0] ? rows[0].category_slug : 'training';
  let bestCount = -1;
  counts.forEach((count, slug) => {
    if (count > bestCount) {
      best = slug;
      bestCount = count;
    }
  });
  return best;
}

function sectionCopy(slug, lang, stats, firstTraining) {
  if (slug === 'scholarship') {
    return {
      section: tr(lang, 'Overseas', 'විදේශ', 'வெளிநாடு'),
      kicker: tr(lang, 'Foreign scholarships', 'විදේශ ශිෂ්‍යත්ව', 'வெளிநாட்டு உதவித்தொகை'),
      title: tr(lang, 'Engagements abroad', 'ලෝකය සමඟ', 'வெளிநாட்டு ஈடுபாடு'),
      dek: tr(lang, 'Progress from officers away, written so the home team can use it.', 'පිටත සිටින නිලධාරීන්ගේ ප්‍රගතිය, ගෙදර කණ්ඩායමට කියවිය හැකි ලෙස.', 'வெளியே இருக்கும் அதிகாரிகளின் முன்னேற்றம், உள்ளக அணி பயன்படுத்தும் வகையில்.')
    };
  }
  if (slug === 'plans') {
    return {
      section: tr(lang, 'Ahead', 'ඉදිරිය', 'முன்னோக்கி'),
      kicker: tr(lang, 'The month ahead', 'ඊළඟ මාසය', 'வரும் மாதம்'),
      title: tr(lang, 'What is already dated', 'දින නියමිත දේ', 'தேதியிடப்பட்டவை'),
      dek: tr(lang, 'The next dates already on the book.', 'පොතේ දැනටමත් ඇති ඊළඟ දින.', 'ஏற்கெனவே பதிவான அடுத்த நாட்கள்.')
    };
  }
  if (slug === 'editorial') {
    return {
      section: tr(lang, 'Leadership', 'පණිවිඩය', 'தலைமை'),
      kicker: tr(lang, 'Continued', 'දිගටම', 'தொடர்ச்சி'),
      title: tr(lang, 'From the desk', 'මේසයෙන්', 'மேசையிலிருந்து'),
      dek: ''
    };
  }
  if (slug === 'language') {
    return {
      section: tr(lang, 'Bhasha', 'භාෂා', 'மொழி'),
      kicker: tr(lang, 'Language and external courses', 'භාෂා හා බාහිර පාඨමාලා', 'மொழி மற்றும் வெளிப்புற பாடநெறிகள்'),
      title: tr(lang, 'Language and external courses', 'භාෂාව සහ බාහිර පන්ති', 'மொழி மற்றும் வெளிப்புற வகுப்புகள்'),
      dek: tr(lang, 'Counter language, and the courses taught with an outside faculty.', 'කවුළුවේ භාෂාව, සහ බාහිර ආයතන සමඟ ඉගෙන ගන්නා දේ.', 'சேவை மொழியும், வெளி நிறுவனங்களுடன் கற்கும் பாடநெறிகளும்.')
    };
  }
  if (slug === 'milestones') {
    return {
      section: tr(lang, 'Milestones', 'සන්ධිස්ථාන', 'மைல்கற்கள்'),
      kicker: tr(lang, 'Milestones', 'සන්ධිස්ථාන', 'மைல்கற்கள்'),
      title: tr(lang, 'What the month kept', 'මාසය රඳවා ගත් දේ', 'இம்மாதம் நிலைத்தவை'),
      dek: ''
    };
  }
  if (slug === 'creative') {
    return {
      section: tr(lang, 'Nirmana', 'නිර්මාණ', 'படைப்பு'),
      kicker: tr(lang, 'Staff creative corner', 'කාර්ය මණ්ඩල නිර්මාණ', 'பணியாளர் படைப்பு'),
      title: tr(lang, 'Creative corner', 'නිර්මාණ කොන', 'படைப்பு மூலை'),
      dek: ''
    };
  }
  return {
    section: tr(lang, 'Programmes', 'වැඩසටහන්', 'பயிற்சி'),
    kicker: firstTraining
      ? tr(lang, 'Training', 'පුහුණුව', 'பயிற்சி')
      : tr(lang, 'Continued', 'දිගටම', 'தொடர்ச்சி'),
    title: firstTraining
      ? tr(lang, 'The month in training', 'මාසයේ පුහුණුව', 'பயிற்சி மாதம்')
      : tr(lang, 'In the hall and the lab', 'ශාලාවේ සහ විද්‍යාගාරයේ', 'மண்டபத்திலும் ஆய்வகத்திலும்'),
    dek: firstTraining
      ? tr(
        lang,
        `${stats.workshops} workshops. ${stats.participants} participants.`,
        `වැඩමුළු ${stats.workshops} ක්. සහභාගිවන්නන් ${stats.participants} දෙනෙක්.`,
        `${stats.workshops} பயிலரங்குகள். ${stats.participants} பங்கேற்பாளர்கள்.`
      )
      : ''
  };
}

function pageFlow(bundle, lang, sourcePage, displayPage, opts) {
  const { magazine, articles, mediaByArticle } = bundle;
  const rows = onPage(articles, sourcePage);
  const photoMap = new Map(rows.map((article) => [article.id, (mediaByArticle.get(article.id) || []).length]));
  const plan = limitsFor(rows, photoMap, opts.stats);
  const copy = sectionCopy(rows[0] ? rows[0].category_slug : 'training', lang, opts.issueStats, opts.stats);
  const statHtml = opts.stats ? `
    <div class="m-stats">
      <div><b>${opts.issueStats.workshops}</b><span>${lang === 'si' ? 'වැඩමුළු' : 'Workshops'}</span></div>
      <div><b>${opts.issueStats.participants}</b><span>${lang === 'si' ? 'සහභාගිවන්නන්' : 'Participants'}</span></div>
      <div><b>${opts.issueStats.language}</b><span>${lang === 'si' ? 'භාෂා පන්ති' : 'Language courses'}</span></div>
      <div><b>${opts.issueStats.scholarships}</b><span>${lang === 'si' ? 'විදේශ අනුයුක්ති' : 'Overseas attachments'}</span></div>
    </div>` : '';
  const cards = plan.map((item, index) => {
    const label = sectionCopy(item.article.category_slug, lang, opts.issueStats, false);
    const rule = item.fresh && index > 0 ? `<p class="m-kicker m-break">${esc(label.kicker)}</p>` : '';
    return `${rule}${storyCard(item.article, lang, mediaByArticle.get(item.article.id), item.role, item.limit)}`;
  }).join('');
  return sheet(lang, `
    <div class="m-frame"></div>
    <div class="m-pad">
      ${runHead(magazine, lang, copy.section)}
      <p class="m-kicker">${esc(copy.kicker)}</p>
      <h2 class="m-h2">${esc(copy.title)}</h2>
      ${copy.dek ? `<p class="m-dek">${esc(copy.dek)}</p>` : ''}
      ${statHtml}
      <div class="m-flow">${cards}</div>
      ${runFoot(displayPage, lang)}
    </div>
  `);
}

function renderPages(bundle, lang) {
  const safeLang = safeLangOf(lang);
  const numbers = [...new Set(bundle.articles.map((article) => Number(article.page_number)).filter((page) => page >= 2))]
    .sort((a, b) => a - b);
  const displayOf = new Map(numbers.map((page, index) => [page, index + 2]));
  const stats = issueStats(bundle.articles);
  const pages = [pageCover(bundle, safeLang)];
  let editorialSeen = false;
  let trainingSeen = false;
  numbers.forEach((page) => {
    const rows = onPage(bundle.articles, page);
    if (!rows.length) return;
    const display = displayOf.get(page);
    const editorialOnly = rows.every((article) => article.category_slug === 'editorial');
    if (editorialOnly && !editorialSeen) {
      editorialSeen = true;
      pages.push(pageEditorial(bundle, safeLang, page, display, displayOf));
      return;
    }
    const photos = bundle.mediaByArticle.get(rows[0].id) || [];
    if (rows.length === 1 && isEssay(rows[0], photos.length)) {
      pages.push(pageEssay(bundle, safeLang, page, display));
      return;
    }
    const statsHere = rows[0].category_slug === 'training' && !trainingSeen;
    if (statsHere) trainingSeen = true;
    pages.push(pageFlow(bundle, safeLang, page, display, { stats: statsHere, issueStats: stats }));
  });
  pages.push(pageBack(bundle, safeLang));
  return pages;
}

function renderIssueDocument(bundle, lang, options = {}) {
  const safeLang = safeLangOf(lang);
  const { magazine } = bundle;
  const label = `${monthName(magazine.month, safeLang)} ${magazine.year}`;
  const title = `${mastName(safeLang)} · ${label}`;
  const pages = renderPages(bundle, safeLang).join('\n');
  const autoprint = options.autoprint
    ? '<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 500); });</script>'
    : '';
  const pdfHref = magazine.status === 'published'
    ? `/api/public/magazines/${esc(magazine.slug)}/pdf?lang=${safeLang}`
    : '';
  return `<!DOCTYPE html>
<html lang="${safeLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,620;1,9..144,520&family=Outfit:wght@340;420;560&family=Noto+Sans+Sinhala:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="/css/magazine.css">
</head>
<body class="print-preview ${safeLang === 'si' ? 'si' : safeLang === 'ta' ? 'ta' : ''}">
  <div class="m-toolbar noprint">
    <a href="/journal.html">${esc(mastName(safeLang))}</a>
    <strong>${esc(label)}</strong>
    <a href="?lang=en">English</a>
    <a href="?lang=si">සිංහල</a>
    <a href="?lang=ta">தமிழ்</a>
    <button type="button" onclick="window.print()">${tr(safeLang, 'Print / Save PDF', 'මුද්‍රණය / PDF ලෙස සුරකින්න', 'அச்சிடு / PDF ஆக சேமி')}</button>
    ${pdfHref ? `<a class="m-solid" href="${pdfHref}">${tr(safeLang, 'Download PDF', 'PDF බාගත කරන්න', 'PDF பதிவிறக்கம்')}</a>` : ''}
  </div>
  ${pages}
  ${autoprint}
</body>
</html>`;
}

module.exports = { loadBundle, renderPages, renderIssueDocument, issueStats, coverFields };

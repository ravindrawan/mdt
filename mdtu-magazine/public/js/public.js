let homeCache = null;

function textOf(item, enKey, siKey) {
  const lang = currentLang();
  return lang === 'si' ? (item[siKey] || item[enKey] || '') : (item[enKey] || item[siKey] || '');
}

function renderHome() {
  const hero = document.getElementById('hero');
  const highlights = document.getElementById('highlights');
  const archive = document.getElementById('archive');
  if (!homeCache || !homeCache.featured) {
    hero.innerHTML = `<p>${escapeHtml(t('loading'))}</p>`;
    return;
  }
  const issue = homeCache.featured;
  const lang = currentLang();
  const month = MONTHS[lang][issue.month - 1];
  const title = textOf(issue, 'title_en', 'title_si');
  const summary = textOf(issue, 'summary_en', 'summary_si');
  hero.innerHTML = `
    <div class="hero-cover" style="background-image:url('${escapeHtml(issue.cover_path)}')">
      <span>Vol. ${String(issue.volume).padStart(2, '0')} · No. ${String(issue.number).padStart(2, '0')}</span>
    </div>
    <div class="hero-copy">
      <p class="kicker">${escapeHtml(t('latest'))} · ${escapeHtml(monthLabel(issue.month, issue.year, lang))}</p>
      <p class="display hero-month">${escapeHtml(month)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(summary)}</p>
      <div class="actions">
        <a class="btn" href="/reader.html?issue=${encodeURIComponent(issue.slug)}">${escapeHtml(t('read'))}</a>
        <button class="btn gold" type="button" id="heroDownload">${escapeHtml(t('download'))}</button>
      </div>
    </div>`;
  document.getElementById('heroDownload').onclick = () => downloadPdf(issue.slug);
  const stats = issue.stats || {};
  document.getElementById('stats').innerHTML = [
    [stats.workshops, t('workshops')],
    [stats.participants, t('participants')],
    [stats.language, t('language_courses')],
    [stats.scholarships, t('overseas')]
  ].map(([n, label]) => `<div><strong>${escapeHtml(n ?? 0)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
  const lines = issue.highlights || [];
  highlights.innerHTML = lines.map((line, index) => `
    <article>
      <div class="num">${String(index + 1).padStart(2, '0')}</div>
      <p>${escapeHtml(lang === 'si' ? line.si || line.en : line.en || line.si)}</p>
    </article>`).join('');
  renderArchive();
}

function renderArchive() {
  const archive = document.getElementById('archive');
  const q = (document.getElementById('archiveSearch').value || '').trim().toLowerCase();
  const lang = currentLang();
  const rows = (homeCache.archive || []).filter((issue) => {
    const blob = `${issue.title_en} ${issue.title_si} ${monthLabel(issue.month, issue.year, 'en')} ${monthLabel(issue.month, issue.year, 'si')}`.toLowerCase();
    return !q || blob.includes(q);
  });
  archive.innerHTML = rows.length ? rows.map((issue) => `
    <article class="card">
      <div class="card-cover" style="background-image:url('${escapeHtml(issue.cover_path)}')">
        <span>${escapeHtml(monthLabel(issue.month, issue.year, lang))}</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(textOf(issue, 'title_en', 'title_si'))}</h3>
        <div class="actions">
          <a class="btn" href="/reader.html?issue=${encodeURIComponent(issue.slug)}">${escapeHtml(t('read'))}</a>
          <button class="btn line" type="button" data-pdf="${escapeHtml(issue.slug)}">${escapeHtml(t('download'))}</button>
        </div>
      </div>
    </article>`).join('') : `<p>${escapeHtml(t('empty_archive'))}</p>`;
}

document.getElementById('archive').addEventListener('click', (event) => {
  const button = event.target.closest('[data-pdf]');
  if (button) downloadPdf(button.dataset.pdf);
});
document.getElementById('archiveSearch').addEventListener('input', renderArchive);
window.addEventListener('retreat:lang', renderHome);

api('/api/public/home').then((data) => {
  homeCache = data;
  renderHome();
}).catch(() => {
  document.getElementById('hero').innerHTML = `<p>${escapeHtml(t('loading'))}</p>`;
});

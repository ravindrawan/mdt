const UNIT_NAV = [
  ['/', 'site_nav_home'],
  ['/about.html', 'site_nav_about'],
  ['/programmes.html', 'site_nav_programmes'],
  ['/courses.html', 'site_nav_courses'],
  ['/scholarships.html', 'site_nav_scholarships'],
  ['/downloads.html', 'site_nav_downloads'],
  ['/journal.html', 'site_nav_journal'],
  ['/contact.html', 'site_nav_contact']
];

function unitPath() {
  const path = location.pathname;
  if (path === '/' || path.endsWith('/index.html')) return '/';
  return path;
}

function renderChrome() {
  const top = document.getElementById('unit-top');
  const foot = document.getElementById('unit-foot');
  if (!top || !foot) return;
  const here = unitPath();
  const lang = currentLang();
  const links = UNIT_NAV.map(([href, key]) => {
    const on = href === here ? ' class="is-on"' : '';
    return `<a href="${href}"${on}>${escapeHtml(t(key))}</a>`;
  }).join('');
  top.innerHTML = `
    <div class="topbar u-top">
      <div class="wrap">
        <a href="/">${escapeHtml(t('unit_short'))}</a>
        <div class="cluster">
          <div class="langs">
            <button type="button" data-set-lang="en" class="${lang === 'en' ? 'is-on' : ''}">English</button>
            <button type="button" data-set-lang="si" class="${lang === 'si' ? 'is-on' : ''}">සිංහල</button>
            <button type="button" data-set-lang="ta" class="${lang === 'ta' ? 'is-on' : ''}">தமிழ்</button>
          </div>
          <a href="/login.html" data-session>${escapeHtml(t('staff_login'))}</a>
        </div>
      </div>
    </div>
    <div class="u-banner-bar">
      <img src="/assets/official-header.jpg" alt="කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය · වයඹ පළාත් සභාව">
    </div>
    <nav class="u-nav"><div class="wrap">${links}</div></nav>`;
  reflectSession();
  foot.innerHTML = `
    <div class="wrap">
      <div>
        <strong>${escapeHtml(t('site_foot'))}</strong>
        <p>${escapeHtml(t('city'))}</p>
      </div>
      <div>
        <p>info@mdtu.nw.gov.lk</p>
        <p><a href="/journal.html">${escapeHtml(t('site_nav_journal'))}</a></p>
      </div>
    </div>`;
}

function issueTitle(issue) {
  return textOf(issue, 'title_en', 'title_si');
}

function textOf(item, enKey, siKey) {
  return currentLang() === 'si' ? (item[siKey] || item[enKey] || '') : (item[enKey] || item[siKey] || '');
}

async function loadLatest() {
  const box = document.getElementById('latest-issue');
  if (!box) return;
  try {
    const data = await api('/api/public/home');
    const issue = data.featured;
    if (!issue) {
      box.innerHTML = `<p>${escapeHtml(t('site_dl_empty'))}</p>`;
      return;
    }
    const lang = currentLang();
    box.innerHTML = `
      <img src="${escapeHtml(issue.cover_path)}" alt="">
      <div>
        <p class="u-kicker">${escapeHtml(monthLabel(issue.month, issue.year, lang))}</p>
        <h3>${escapeHtml(issueTitle(issue))}</h3>
        <p>${escapeHtml(textOf(issue, 'summary_en', 'summary_si'))}</p>
        <div class="u-actions">
          <a class="u-btn" href="/reader.html?issue=${encodeURIComponent(issue.slug)}">${escapeHtml(t('read'))}</a>
          <button class="u-btn line" type="button" id="latestPdf">${escapeHtml(t('download'))}</button>
        </div>
      </div>`;
    document.getElementById('latestPdf').onclick = () => downloadPdf(issue.slug);
  } catch (error) {
    box.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function loadDownloads() {
  const box = document.getElementById('download-list');
  if (!box) return;
  try {
    const data = await api('/api/public/home');
    const issues = [data.featured, ...(data.archive || [])].filter(Boolean);
    if (!issues.length) {
      box.innerHTML = `<p>${escapeHtml(t('site_dl_empty'))}</p>`;
      return;
    }
    const lang = currentLang();
    box.innerHTML = issues.map((issue) => `
      <button type="button" data-pdf="${escapeHtml(issue.slug)}">
        <span><strong>The Trainer</strong> · ${escapeHtml(monthLabel(issue.month, issue.year, lang))} — ${escapeHtml(issueTitle(issue))}</span>
        <span>${escapeHtml(t('download'))}</span>
      </button>`).join('');
  } catch (error) {
    box.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('#download-list [data-pdf]');
  if (button) downloadPdf(button.dataset.pdf);
});

function bootSite() {
  renderChrome();
  loadLatest();
  loadDownloads();
}

document.addEventListener('DOMContentLoaded', bootSite);
window.addEventListener('retreat:lang', bootSite);

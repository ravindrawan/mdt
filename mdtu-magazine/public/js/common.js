function currentLang() {
  const stored = localStorage.getItem('retreat-lang');
  return stored === 'si' || stored === 'ta' ? stored : 'en';
}

function applyI18n() {
  const lang = currentLang();
  document.documentElement.lang = lang;
  document.body.classList.toggle('lang-si', lang === 'si');
  document.body.classList.toggle('lang-ta', lang === 'ta');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (el.tagName === 'TITLE') document.title = value;
    else el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-set-lang]').forEach((el) => {
    el.classList.toggle('is-on', el.dataset.setLang === lang);
  });
}

function setLang(lang) {
  localStorage.setItem('retreat-lang', lang === 'si' || lang === 'ta' ? lang : 'en');
  applyI18n();
  window.dispatchEvent(new CustomEvent('retreat:lang'));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function toast(message) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 4200);
}

async function api(url, options = {}) {
  const opts = { ...options };
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    opts.body = JSON.stringify(opts.body);
  }
  const response = await fetch(url, opts);
  const type = response.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error((data && data.error) || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function downloadPdf(slug, adminId) {
  const lang = currentLang();
  const url = adminId
    ? `/api/admin/magazines/${adminId}/pdf?lang=${lang}`
    : `/api/public/magazines/${slug}/pdf?lang=${lang}`;
  const response = await fetch(url);
  if (!response.ok || !(response.headers.get('content-type') || '').includes('pdf')) {
    let fallback = `/magazine/${slug}/print?lang=${lang}&autoprint=1`;
    try {
      const data = await response.json();
      if (data.fallback) fallback = data.fallback;
    } catch { /* print page remains the fallback */ }
    window.open(fallback, '_blank');
    const langNow = currentLang();
    toast(langNow === 'si'
      ? 'බ්‍රවුසරයේ PDF සුරැකුම විවෘත විය.'
      : langNow === 'ta'
        ? 'PDF சேமிக்க உலாவி அச்சுப் பக்கம் திறக்கப்படுகிறது.'
        : 'Opening the browser print view to save a PDF.');
    return;
  }
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `The-Trainer-${slug}-${lang.toUpperCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  si: ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'],
  ta: ['ஜனவரி', 'பெப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்']
};

function monthLabel(month, year, lang) {
  const names = MONTHS[lang] || MONTHS.en;
  return `${names[month - 1]} ${year}`;
}

async function reflectSession() {
  const slots = document.querySelectorAll('[data-session]');
  if (!slots.length) return;
  let user = null;
  try {
    const data = await api('/api/auth/me');
    user = data.user;
  } catch { user = null; }
  slots.forEach((el) => {
    if (user) {
      el.textContent = t('logout');
      el.setAttribute('href', '/login.html');
      el.dataset.logout = '';
    } else {
      el.textContent = t('staff_login');
      el.setAttribute('href', '/login.html');
      el.removeAttribute('data-logout');
    }
  });
}

document.addEventListener('click', async (event) => {
  const language = event.target.closest('[data-set-lang]');
  if (language) {
    setLang(language.dataset.setLang);
    return;
  }
  const out = event.target.closest('[data-logout]');
  if (!out) return;
  event.preventDefault();
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* session is already gone */ }
  location.href = '/login.html';
});

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  reflectSession();
});
window.addEventListener('retreat:lang', reflectSession);

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SI = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
const MONTHS_TA = ['ஜனவரி', 'பெப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];

function monthName(month, lang) {
  const list = lang === 'si' ? MONTHS_SI : lang === 'ta' ? MONTHS_TA : MONTHS_EN;
  return list[(Number(month) || 1) - 1] || '';
}

function volumeFor(year) {
  return Math.max(1, Number(year) - 2025);
}

function issueSeries(magazines) {
  const sorted = [...magazines].sort((a, b) => a.year - b.year || a.month - b.month || a.id - b.id);
  const firstYear = sorted.length ? Number(sorted[0].year) : 2026;
  const count = new Map();
  const series = new Map();
  sorted.forEach((magazine) => {
    const number = (count.get(magazine.year) || 0) + 1;
    count.set(magazine.year, number);
    series.set(magazine.id, {
      volume: Math.max(1, Number(magazine.year) - firstYear + 1),
      number
    });
  });
  return series;
}

function formatDate(iso, lang) {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  const month = monthName(m, lang);
  return lang === 'si' ? `${y} ${month} ${d}` : `${d} ${month} ${y}`;
}

function formatRange(start, end, lang) {
  if (!start) return '';
  if (!end || start === end) return formatDate(start, lang);
  return `${formatDate(start, lang)} – ${formatDate(end, lang)}`;
}

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value || '');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function paragraphs(text, limit) {
  let clean = String(text || '').trim();
  if (limit && clean.length > limit) {
    clean = `${clean.slice(0, limit).replace(/\s+\S*$/, '')}…`;
  }
  if (!clean) return '';
  return clean.split(/\n{2,}/).map((part) => `<p>${esc(part).replace(/\n/g, '<br>')}</p>`).join('');
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  MONTHS_EN,
  MONTHS_SI,
  monthName,
  volumeFor,
  issueSeries,
  formatDate,
  formatRange,
  parseJson,
  esc,
  paragraphs,
  nowIso
};

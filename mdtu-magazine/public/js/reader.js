const params = new URLSearchParams(location.search);
const slug = params.get('issue') || '2026-10';
const preview = params.get('preview') === '1';
if (params.get('lang') === 'si' || params.get('lang') === 'en' || params.get('lang') === 'ta') setLang(params.get('lang'));

let pages = [];
let index = 0;
const titleEl = document.getElementById('readerTitle');
const countEl = document.getElementById('pageCount');
const thumbs = document.getElementById('thumbs');
const fitbox = document.getElementById('fitbox');
const scaleEl = document.getElementById('scale');

function fit() {
  const sheet = scaleEl.querySelector('.sheet');
  const stage = document.getElementById('stage');
  if (!sheet) return;
  scaleEl.style.transform = 'none';
  const sw = sheet.offsetWidth;
  const sh = sheet.offsetHeight;
  const s = Math.min((stage.clientWidth - 36) / sw, (stage.clientHeight - 28) / sh);
  fitbox.style.width = `${sw * s}px`;
  fitbox.style.height = `${sh * s}px`;
  scaleEl.style.transform = `scale(${s})`;
}

function show(next, animate) {
  index = Math.max(0, Math.min(pages.length - 1, next));
  scaleEl.innerHTML = pages[index] || '';
  if (animate) {
    const sheet = scaleEl.querySelector('.sheet');
    if (sheet) sheet.classList.add('turn');
  }
  countEl.textContent = `${index + 1} / ${pages.length || 0}`;
  thumbs.querySelectorAll('button').forEach((button, i) => button.classList.toggle('is-on', i === index));
  fit();
}

async function loadPages() {
  const lang = currentLang();
  const url = preview
    ? `/api/admin/magazines/${encodeURIComponent(slug)}/pages?lang=${lang}`
    : `/api/public/magazines/${encodeURIComponent(slug)}/pages?lang=${lang}`;
  try {
    const data = await api(url);
    pages = data.pages || [];
    const title = lang === 'si' ? data.title_si : data.title_en;
    titleEl.textContent = title || slug;
    thumbs.innerHTML = pages.map((_, i) => `<button class="thumb" type="button" data-page="${i}">${i + 1}</button>`).join('');
    show(Math.min(index, pages.length - 1), false);
  } catch (error) {
    titleEl.textContent = error.message;
  }
}

document.getElementById('prev').onclick = () => show(index - 1, true);
document.getElementById('next').onclick = () => show(index + 1, true);
document.getElementById('download').onclick = () => downloadPdf(slug);
thumbs.onclick = (event) => {
  const button = event.target.closest('[data-page]');
  if (button) show(Number(button.dataset.page), true);
};
document.getElementById('full').onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};
window.addEventListener('resize', fit);
window.addEventListener('retreat:lang', loadPages);
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') show(index + 1, true);
  if (event.key === 'ArrowLeft') show(index - 1, true);
});

let startX = 0;
document.getElementById('stage').addEventListener('pointerdown', (event) => { startX = event.clientX; });
document.getElementById('stage').addEventListener('pointerup', (event) => {
  const delta = event.clientX - startX;
  if (delta > 50) show(index - 1, true);
  if (delta < -50) show(index + 1, true);
});

loadPages();

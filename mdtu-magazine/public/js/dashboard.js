const state = { me: null, categories: [], articles: [], editing: null };

function statusLabel(status) {
  return t(status || 'draft');
}

function showPanel(name) {
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.panel !== name);
  });
  document.querySelectorAll('[data-go]').forEach((button) => {
    button.classList.toggle('is-on', button.dataset.go === name);
  });
}

function programFields(article) {
  const program = (article && article.program) || {};
  const metrics = program.metrics || {};
  return {
    start_date: program.start_date || '',
    end_date: program.end_date || '',
    target_group_en: program.target_group_en || '',
    target_group_si: program.target_group_si || '',
    venue_en: program.venue_en || '',
    venue_si: program.venue_si || '',
    participants: program.participants ?? '',
    outcomes_en: program.outcomes_en || '',
    outcomes_si: program.outcomes_si || '',
    sessions: metrics.sessions || '',
    hours: metrics.hours || '',
    satisfaction: metrics.satisfaction || ''
  };
}

function fillForm(article) {
  const form = document.getElementById('pieceForm');
  form.reset();
  state.editing = article ? article.id : null;
  const values = {
    category_id: article ? article.category_id : (state.categories[0] && state.categories[0].id),
    target_month: article ? article.target_month : new Date().getMonth() + 1,
    target_year: article ? article.target_year : new Date().getFullYear(),
    title_en: article ? article.title_en : '',
    title_si: article ? article.title_si : '',
    excerpt_en: article ? article.excerpt_en : '',
    excerpt_si: article ? article.excerpt_si : '',
    body_en: article ? article.body_en : '',
    body_si: article ? article.body_si : '',
    ...programFields(article)
  };
  Object.entries(values).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value ?? '';
  });
  const photos = document.getElementById('existingPhotos');
  photos.innerHTML = article && article.media ? article.media.map((item) => `
    <div class="mini"><img src="${escapeHtml(item.path)}" alt="" style="width:72px;height:48px;object-fit:cover">
      <button type="button" data-drop-media="${item.id}">${escapeHtml(t('remove'))}</button></div>`).join('') : '';
  const category = state.categories.find((item) => String(item.id) === String(form.elements.category_id.value));
  document.getElementById('streamHelp').textContent = category
    ? (currentLang() === 'si' ? category.description_si : category.description_en)
    : '';
  document.getElementById('programBlock').classList.toggle('hidden', category && category.slug === 'creative');
}

function renderList() {
  const host = document.getElementById('pieceList');
  const lang = currentLang();
  if (!state.articles.length) {
    host.innerHTML = `<p>${escapeHtml(t('no_rows'))}</p>`;
    return;
  }
  host.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>${escapeHtml(t('title_en'))}</th><th>${escapeHtml(t('stream'))}</th><th>${escapeHtml(t('status'))}</th><th></th></tr></thead>
    <tbody>${state.articles.map((article) => `<tr>
      <td><strong>${escapeHtml(lang === 'si' ? article.title_si : article.title_en)}</strong>
        ${article.reviewer_notes ? `<div class="form-note">${escapeHtml(article.reviewer_notes)}</div>` : ''}</td>
      <td>${escapeHtml(lang === 'si' ? article.category_si : article.category_en)}</td>
      <td><span class="chip ${escapeHtml(article.status)}">${escapeHtml(statusLabel(article.status))}</span></td>
      <td>${['draft', 'rejected'].includes(article.status) ? `<button class="btn line" type="button" data-edit="${article.id}">${escapeHtml(t('edit'))}</button>` : ''}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

function renderProfile() {
  const me = state.me;
  const form = document.getElementById('profileForm');
  ['full_name_en', 'full_name_si', 'designation_en', 'designation_si', 'phone'].forEach((key) => {
    form.elements[key].value = me[key] || '';
  });
  document.getElementById('who').textContent = currentLang() === 'si' ? me.full_name_si || me.full_name_en : me.full_name_en;
}

async function refresh() {
  const data = await api('/api/articles');
  state.articles = data.articles;
  renderList();
}

document.body.addEventListener('click', async (event) => {
  const go = event.target.closest('[data-go]');
  if (go) {
    showPanel(go.dataset.go);
    if (go.dataset.go === 'composer' && !state.editing) fillForm(null);
    return;
  }
  const edit = event.target.closest('[data-edit]');
  if (edit) {
    const article = state.articles.find((item) => String(item.id) === edit.dataset.edit);
    showPanel('composer');
    fillForm(article);
    return;
  }
  const drop = event.target.closest('[data-drop-media]');
  if (drop) {
    await api(`/api/media/${drop.dataset.dropMedia}`, { method: 'DELETE' });
    await refresh();
    fillForm(state.articles.find((item) => item.id === state.editing));
  }
});

document.getElementById('pieceForm').addEventListener('change', (event) => {
  if (event.target.name !== 'category_id') return;
  const category = state.categories.find((item) => String(item.id) === event.target.value);
  document.getElementById('streamHelp').textContent = category
    ? (currentLang() === 'si' ? category.description_si : category.description_en) : '';
  document.getElementById('programBlock').classList.toggle('hidden', category && category.slug === 'creative');
});

document.getElementById('pieceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const submit = event.submitter && event.submitter.dataset.act === 'submit';
  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload.photos;
  try {
    const saved = state.editing
      ? await api(`/api/articles/${state.editing}`, { method: 'PUT', body: payload })
      : await api('/api/articles', { method: 'POST', body: payload });
    const id = saved.article.id;
    const files = form.elements.photos.files;
    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      await api(`/api/articles/${id}/media`, { method: 'POST', body: data });
    }
    if (submit) await api(`/api/articles/${id}/submit`, { method: 'POST' });
    toast(submit ? t('submit') : t('save_draft'));
    state.editing = null;
    await refresh();
    showPanel('list');
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById('profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const payload = Object.fromEntries(new FormData(event.target).entries());
    const data = await api('/api/auth/profile', { method: 'PUT', body: payload });
    state.me = data.user;
    renderProfile();
    toast(t('save'));
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById('passwordForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api('/api/auth/password', { method: 'PUT', body: Object.fromEntries(new FormData(event.target).entries()) });
    event.target.reset();
    toast(t('change_password'));
  } catch (error) {
    toast(error.message);
  }
});

window.addEventListener('retreat:lang', () => {
  renderList();
  renderProfile();
});

(async function boot() {
  try {
    const me = await api('/api/auth/me');
    state.me = me.user;
    if (me.user.role === 'admin') document.getElementById('adminLink').classList.remove('hidden');
    const categories = await api('/api/categories');
    state.categories = categories.categories;
    const select = document.querySelector('[name="category_id"]');
    select.innerHTML = state.categories.map((category) => `<option value="${category.id}">${escapeHtml(currentLang() === 'si' ? category.name_si : category.name_en)}</option>`).join('');
    const month = document.querySelector('[name="target_month"]');
    month.innerHTML = MONTHS.en.map((name, index) => `<option value="${index + 1}">${escapeHtml(name)}</option>`).join('');
    renderProfile();
    fillForm(null);
    await refresh();
    showPanel('list');
  } catch {
    location.href = '/login.html';
  }
}());

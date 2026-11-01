const state = {
  tab: 'overview',
  me: null,
  categories: [],
  mine: [],
  editing: null,
  deskId: null,
  stats: null,
  users: { users: [], page: 1, pages: 1, total: 0 },
  query: '',
  articles: [],
  filter: 'submitted',
  magazines: [],
  issueId: null,
  detail: null
};

function showTab(tab) {
  state.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((panel) => panel.classList.toggle('hidden', panel.dataset.tab !== tab));
  document.querySelectorAll('[data-go]').forEach((button) => button.classList.toggle('is-on', button.dataset.go === tab));
  if (tab === 'composer' && !state.editing) fillPiece(null);
  if (tab === 'desk') loadDesk();
}

function fillPiece(article) {
  const form = document.getElementById('pieceForm');
  form.reset();
  state.editing = article ? article.id : null;
  const values = {
    category_id: article ? article.category_id : (state.categories[0] && state.categories[0].id),
    target_month: article ? article.target_month : new Date().getMonth() + 1,
    target_year: article ? article.target_year : new Date().getFullYear(),
    title_en: article ? article.title_en : '',
    title_si: article ? article.title_si : '',
    body_en: article ? article.body_en : '',
    body_si: article ? article.body_si : ''
  };
  Object.entries(values).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value ?? '';
  });
  const category = state.categories.find((item) => String(item.id) === String(form.elements.category_id.value));
  document.getElementById('streamHelp').textContent = category
    ? (currentLang() === 'si' ? category.description_si : category.description_en)
    : '';
  document.getElementById('existingPhotos').innerHTML = article && article.media
    ? article.media.map((item) => `<div class="mini"><img src="${escapeHtml(item.path)}" alt="" style="width:72px;height:48px;object-fit:cover"></div>`).join('')
    : '';
}

function renderMine() {
  const host = document.getElementById('pieceList');
  const lang = currentLang();
  if (!state.mine.length) {
    host.innerHTML = `<p>${escapeHtml(t('no_rows'))}</p>`;
    return;
  }
  host.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>${escapeHtml(t('title_en'))}</th><th>${escapeHtml(t('stream'))}</th><th>${escapeHtml(t('status'))}</th><th></th></tr></thead>
    <tbody>${state.mine.map((article) => `<tr>
      <td><strong>${escapeHtml(lang === 'si' ? article.title_si : article.title_en)}</strong></td>
      <td>${escapeHtml(lang === 'si' ? article.category_si : article.category_en)}</td>
      <td><span class="chip ${escapeHtml(article.status)}">${escapeHtml(t(article.status))}</span></td>
      <td><button class="btn line" type="button" data-edit-piece="${article.id}">${escapeHtml(t('edit'))}</button></td>
    </tr>`).join('')}</tbody></table></div>`;
}

async function loadMine() {
  state.mine = (await api('/api/articles?mine=1')).articles;
  renderMine();
}

function loadDesk() {
  const form = document.getElementById('dcsForm');
  const month = Number(form.elements.target_month.value);
  const year = Number(form.elements.target_year.value);
  const article = state.mine.find((item) => item.category_slug === 'editorial' && item.target_month === month && item.target_year === year);
  state.deskId = article ? article.id : null;
  if (!article) {
    form.elements.byline_en.value = '';
    form.elements.byline_si.value = '';
    form.elements.body_en.value = '';
    form.elements.body_si.value = '';
    document.getElementById('dcsPhoto').innerHTML = '';
    return;
  }
  ['byline_en', 'byline_si', 'title_en', 'title_si', 'body_en', 'body_si'].forEach((key) => {
    form.elements[key].value = article[key] || '';
  });
  document.getElementById('dcsPhoto').innerHTML = article.media && article.media[0]
    ? `<img src="${escapeHtml(article.media[0].path)}" alt="" style="width:96px;height:120px;object-fit:cover">`
    : '';
}

async function savePiece(form, editingId, act) {
  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload.photos;
  delete payload.photo;
  const saved = editingId
    ? await api(`/api/articles/${editingId}`, { method: 'PUT', body: payload })
    : await api('/api/articles', { method: 'POST', body: payload });
  const id = saved.article.id;
  const input = form.elements.photos || form.elements.photo;
  const files = input && input.files ? input.files : [];
  for (const file of files) {
    const data = new FormData();
    data.append('file', file);
    await api(`/api/articles/${id}/media`, { method: 'POST', body: data });
  }
  if (act === 'submit') await api(`/api/articles/${id}/submit`, { method: 'POST' });
  if (act === 'publish') {
    const result = await api(`/api/articles/${id}/publish`, { method: 'POST' });
    toast(result.placed ? t('published_piece') : t('approved_piece'));
  } else {
    toast(act === 'submit' ? t('submit') : t('save_draft'));
  }
  state.editing = null;
  state.deskId = null;
  form.reset();
  await loadMine();
  showTab('mine');
}

async function loadStats() {
  state.stats = await api('/api/admin/stats');
  const s = state.stats;
  document.getElementById('statGrid').innerHTML = [
    [s.pending, t('pending')],
    [s.users, t('accounts')],
    [s.published_issues, t('published')],
    [s.draft_issues, t('open_issues')]
  ].map(([n, label]) => `<article><strong>${n}</strong><span>${escapeHtml(label)}</span></article>`).join('');
  document.getElementById('audit').innerHTML = (s.audit || []).map((row) =>
    `<div class="mini"><span>${escapeHtml(row.action)} · ${escapeHtml(row.entity)}</span><span>${escapeHtml(row.full_name_en || '')}</span></div>`
  ).join('') || `<p>${escapeHtml(t('no_rows'))}</p>`;
}

async function loadUsers() {
  const data = await api(`/api/admin/users?page=${state.users.page || 1}&q=${encodeURIComponent(state.query)}`);
  state.users = data;
  const lang = currentLang();
  document.getElementById('userTable').innerHTML = data.users.length ? `<div class="table-wrap"><table>
    <thead><tr><th>${escapeHtml(t('login_user'))}</th><th>${escapeHtml(t('name_en'))}</th><th>${escapeHtml(t('email'))}</th><th>${escapeHtml(t('role'))}</th><th>${escapeHtml(t('status'))}</th><th>${escapeHtml(t('actions'))}</th></tr></thead>
    <tbody>${data.users.map((user) => `<tr>
      <td><strong>${escapeHtml(user.username || '')}</strong></td>
      <td><strong>${escapeHtml(lang === 'si' ? user.full_name_si || user.full_name_en : user.full_name_en)}</strong><div class="form-note">${escapeHtml(lang === 'si' ? user.designation_si : user.designation_en)}</div></td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(t(user.role))}</td>
      <td><span class="chip">${escapeHtml(user.active ? t('active') : t('inactive'))}</span></td>
      <td class="filters">
        <button class="btn line" type="button" data-edit-user="${user.id}">${escapeHtml(t('edit'))}</button>
        <button class="btn line" type="button" data-reset="${user.id}">${escapeHtml(t('reset'))}</button>
        <button class="btn line" type="button" data-active="${user.id}" data-on="${user.active ? '0' : '1'}">${escapeHtml(user.active ? t('deactivate') : t('activate'))}</button>
        <button class="textish danger" type="button" data-delete-user="${user.id}">${escapeHtml(t('delete'))}</button>
      </td>
    </tr>`).join('')}</tbody></table></div>` : `<p>${escapeHtml(t('no_rows'))}</p>`;
  document.getElementById('userPager').innerHTML = `<span>${escapeHtml(t('page'))} ${data.page} ${escapeHtml(t('of'))} ${data.pages} · ${data.total}</span>
    <button class="btn line" type="button" id="userPrev" ${data.page <= 1 ? 'disabled' : ''}>${escapeHtml(t('prev'))}</button>
    <button class="btn line" type="button" id="userNext" ${data.page >= data.pages ? 'disabled' : ''}>${escapeHtml(t('next'))}</button>`;
}

async function loadArticles() {
  state.articles = (await api(`/api/admin/articles?status=${encodeURIComponent(state.filter)}`)).articles;
  const lang = currentLang();
  document.getElementById('queue').innerHTML = state.articles.length ? `<div class="table-wrap"><table>
    <thead><tr><th>${escapeHtml(t('title_en'))}</th><th>${escapeHtml(t('stream'))}</th><th>${escapeHtml(t('status'))}</th><th>${escapeHtml(t('actions'))}</th></tr></thead>
    <tbody>${state.articles.map((article) => `<tr>
      <td><strong>${escapeHtml(lang === 'si' ? article.title_si : article.title_en)}</strong>
        <div class="form-note">${escapeHtml(article.body_en.slice(0, 180))}</div></td>
      <td>${escapeHtml(lang === 'si' ? article.category_si : article.category_en)}<div class="form-note">${escapeHtml(monthLabel(article.target_month, article.target_year, lang))}</div></td>
      <td><span class="chip ${escapeHtml(article.status)}">${escapeHtml(t(article.status))}</span></td>
      <td class="filters">
        ${article.status !== 'published' ? `<button class="btn" type="button" data-review="approved" data-id="${article.id}">${escapeHtml(t('approve'))}</button>
        <button class="btn line" type="button" data-review="rejected" data-id="${article.id}">${escapeHtml(t('reject'))}</button>` : ''}
      </td>
    </tr>`).join('')}</tbody></table></div>` : `<p>${escapeHtml(t('no_rows'))}</p>`;
}

async function loadMagazines() {
  state.magazines = (await api('/api/admin/magazines')).magazines;
  const lang = currentLang();
  document.getElementById('issueList').innerHTML = state.magazines.map((magazine) => `
    <button class="btn line ${magazine.id === state.issueId ? 'gold' : ''}" type="button" data-issue="${magazine.id}">
      ${escapeHtml(monthLabel(magazine.month, magazine.year, lang))} · ${escapeHtml(t(magazine.status))}
    </button>`).join('');
  if (state.issueId) await loadIssue(state.issueId);
}

async function loadIssue(id) {
  state.issueId = Number(id);
  state.detail = await api(`/api/admin/issue/${id}`);
  const { magazine, placed, pool } = state.detail;
  const lang = currentLang();
  const used = [...new Set(placed.map((article) => article.page_number).filter((page) => page >= 2))].sort((a, b) => a - b);
  const nextPage = (used.length ? used[used.length - 1] : 1) + 1;
  const choices = used.length ? [...used, nextPage] : [2];
  const pages = used.map((page) => {
    const rows = placed.filter((article) => article.page_number === page);
    return `<section class="slot"><h3>${escapeHtml(t('page'))} ${page}</h3>
      ${rows.map((article) => `<div class="mini">
        <span>${article.featured ? '★ ' : ''}${escapeHtml(lang === 'si' ? article.title_si : article.title_en)}</span>
        <span class="filters">
          <button type="button" class="textish" data-feature="${article.id}" data-on="${article.featured ? '0' : '1'}">${escapeHtml(article.featured ? t('unfeature') : t('feature'))}</button>
          <button type="button" class="textish danger" data-unassign="${article.id}">${escapeHtml(t('remove'))}</button>
        </span>
      </div>`).join('') || `<p class="form-note">${escapeHtml(t('no_rows'))}</p>`}
    </section>`;
  });
  document.getElementById('layout').innerHTML = pages.join('') || `<p class="form-note">${escapeHtml(t('pages_follow'))}</p>`;
  showIssueThumb('coverThumb', magazine.cover_path);
  showIssueThumb('backThumb', magazine.back_path);
  document.getElementById('pool').innerHTML = pool.length ? pool.map((article) => `
    <div class="mini">
      <span><span class="chip ${escapeHtml(article.status)}">${escapeHtml(t(article.status))}</span> ${escapeHtml(article.title_en)}</span>
      <span class="filters">
        <select data-page-for="${article.id}">${choices.map((page) => `<option value="${page}">${page === nextPage && used.length ? escapeHtml(t('new_page')) : page}</option>`).join('')}</select>
        <button class="btn line" type="button" data-assign="${article.id}">${escapeHtml(t('place'))}</button>
      </span>
    </div>`).join('') : `<p>${escapeHtml(t('no_rows'))}</p>`;
  const vol = String(magazine.volume || 1).padStart(2, '0');
  const num = String(magazine.number || 1).padStart(2, '0');
  document.getElementById('issueTitle').textContent = `Vol. ${vol} · No. ${num} — ${monthLabel(magazine.month, magazine.year, lang)} — ${lang === 'si' ? magazine.title_si : magazine.title_en}`;
  fillCoverText(state.detail.cover);
  document.getElementById('pubBtn').textContent = magazine.status === 'published' ? t('unpublish') : t('publish');
  document.getElementById('pubBtn').dataset.mode = magazine.status === 'published' ? 'unpublish' : 'publish';
}

document.body.addEventListener('click', async (event) => {
  const go = event.target.closest('[data-go]');
  if (go) {
    if (go.dataset.go === 'composer') state.editing = null;
    showTab(go.dataset.go);
    return;
  }
  const editPiece = event.target.closest('[data-edit-piece]');
  if (editPiece) {
    const article = state.mine.find((item) => String(item.id) === editPiece.dataset.editPiece);
    if (article && article.category_slug === 'editorial') {
      const form = document.getElementById('dcsForm');
      form.elements.target_month.value = article.target_month;
      form.elements.target_year.value = article.target_year;
      showTab('desk');
      loadDesk();
      return;
    }
    showTab('composer');
    fillPiece(article);
    return;
  }
  if (event.target.id === 'userPrev' && state.users.page > 1) {
    state.users.page -= 1;
    await loadUsers();
  }
  if (event.target.id === 'userNext' && state.users.page < state.users.pages) {
    state.users.page += 1;
    await loadUsers();
  }
  const reset = event.target.closest('[data-reset]');
  if (reset) {
    const data = await api(`/api/admin/users/${reset.dataset.reset}/reset-password`, { method: 'POST' });
    toast(`${t('temp_password')}: ${data.temporary_password}`);
  }
  const toggle = event.target.closest('[data-active]');
  if (toggle) {
    const user = state.users.users.find((item) => String(item.id) === toggle.dataset.active);
    await api(`/api/admin/users/${user.id}`, { method: 'PUT', body: { ...user, active: toggle.dataset.on === '1' } });
    await loadUsers();
  }
  const remove = event.target.closest('[data-delete-user]');
  if (remove) {
    if (!confirm(t('delete'))) return;
    try {
      await api(`/api/admin/users/${remove.dataset.deleteUser}`, { method: 'DELETE' });
      await loadUsers();
    } catch (error) {
      toast(error.message);
    }
  }
  const editUser = event.target.closest('[data-edit-user]');
  if (editUser) {
    const user = state.users.users.find((item) => String(item.id) === editUser.dataset.editUser);
    const form = document.getElementById('userForm');
    form.elements.id.value = user.id;
    ['username', 'full_name_en', 'full_name_si', 'email', 'designation_en', 'designation_si', 'phone', 'role'].forEach((key) => {
      form.elements[key].value = user[key] || '';
    });
    form.elements.email.disabled = true;
    document.getElementById('userDialog').showModal();
  }
  const review = event.target.closest('[data-review]');
  if (review) {
    const notes = review.dataset.review === 'rejected' ? prompt(t('note')) : '';
    if (review.dataset.review === 'rejected' && !notes) return;
    try {
      await api(`/api/admin/articles/${review.dataset.id}/review`, { method: 'POST', body: { decision: review.dataset.review, notes } });
      await loadArticles();
      await loadStats();
    } catch (error) {
      toast(error.message);
    }
  }
  const issue = event.target.closest('[data-issue]');
  if (issue) {
    await loadIssue(issue.dataset.issue);
    await loadMagazines();
  }
  if (event.target.id === 'assemble' && state.issueId) {
    try {
      const result = await api(`/api/admin/magazines/${state.issueId}/assemble`, { method: 'POST' });
      toast(`${result.placed}`);
      await loadIssue(state.issueId);
    } catch (error) {
      toast(error.message);
    }
  }
  if (event.target.id === 'pubBtn' && state.issueId) {
    const mode = event.target.dataset.mode;
    try {
      await api(`/api/admin/magazines/${state.issueId}/${mode}`, { method: 'POST' });
      await loadMagazines();
      await loadStats();
    } catch (error) {
      toast(error.message);
    }
  }
  if (event.target.id === 'previewBtn' && state.detail) {
    location.href = `/reader.html?issue=${state.detail.magazine.slug}&preview=1`;
  }
  if (event.target.id === 'proofBtn' && state.detail) {
    downloadPdf(state.detail.magazine.slug, state.detail.magazine.id);
  }
  const assign = event.target.closest('[data-assign]');
  if (assign) {
    const page = document.querySelector(`[data-page-for="${assign.dataset.assign}"]`).value;
    try {
      await api(`/api/admin/magazines/${state.issueId}/assign`, { method: 'POST', body: { articleId: Number(assign.dataset.assign), page: Number(page) } });
      await loadIssue(state.issueId);
    } catch (error) {
      toast(error.message);
    }
  }
  const unassign = event.target.closest('[data-unassign]');
  if (unassign) {
    await api(`/api/admin/magazines/${state.issueId}/unassign`, { method: 'POST', body: { articleId: Number(unassign.dataset.unassign) } });
    await loadIssue(state.issueId);
  }
  const feature = event.target.closest('[data-feature]');
  if (feature) {
    try {
      await api(`/api/admin/magazines/${state.issueId}/feature`, { method: 'POST', body: { articleId: Number(feature.dataset.feature), featured: feature.dataset.on === '1' } });
      await loadIssue(state.issueId);
    } catch (error) {
      toast(error.message);
    }
  }
});

function showIssueThumb(id, path) {
  const thumb = document.getElementById(id);
  if (path && !/\/assets\/covers\//.test(path)) {
    thumb.src = path;
    thumb.hidden = false;
  } else {
    thumb.removeAttribute('src');
    thumb.hidden = true;
  }
}

function bindIssueImage(formId, fileId, thumbId, route, readyKey) {
  const form = document.getElementById(formId);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.issueId) return;
    const file = document.getElementById(fileId).files[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    try {
      const data = await api(`/api/admin/magazines/${state.issueId}/${route}`, { method: 'POST', body });
      const thumb = document.getElementById(thumbId);
      thumb.src = `${data.path}?t=${Date.now()}`;
      thumb.hidden = false;
      document.getElementById(fileId).value = '';
      toast(t(readyKey));
    } catch (error) {
      toast(error.message);
    }
  });
  document.getElementById(fileId).addEventListener('change', () => {
    if (document.getElementById(fileId).files[0]) form.requestSubmit();
  });
}

bindIssueImage('coverForm', 'coverFile', 'coverThumb', 'cover', 'cover_ready');
bindIssueImage('backForm', 'backFile', 'backThumb', 'back', 'back_ready');

const COVER_FIELDS = ['mast_en', 'mast_si', 'mast_ta', 'tri', 'vol', 'issue_en', 'issue_si', 'issue_ta', 'unit_en', 'unit_si', 'unit_ta', 'title_en', 'title_si', 'title_ta'];

function coverInput(form, key) {
  return form.elements[key];
}

function fillCoverText(cover) {
  const form = document.getElementById('coverTextForm');
  if (!form || !cover) return;
  const auto = cover.auto || {};
  const saved = cover.saved || {};
  COVER_FIELDS.forEach((key) => {
    const input = coverInput(form, key);
    const automatic = auto[key] || '';
    input.dataset.auto = automatic;
    const custom = String(saved[key] || '').trim();
    input.value = custom || automatic;
  });
  [0, 1, 2].forEach((index) => {
    ['en', 'si', 'ta'].forEach((lang) => {
      const key = `line_${lang}_${index}`;
      const input = coverInput(form, key);
      const automatic = ((auto[`lines_${lang}`] || [])[index]) || '';
      const customLines = saved[`lines_${lang}`];
      input.dataset.auto = automatic;
      input.value = Array.isArray(customLines) ? (customLines[index] || '') : automatic;
    });
  });
}

document.getElementById('coverTextForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.issueId) return;
  const form = event.target;
  const body = {};
  COVER_FIELDS.forEach((key) => {
    const input = coverInput(form, key);
    const value = input.value.trim();
    body[key] = value === String(input.dataset.auto || '').trim() ? '' : value;
  });
  [0, 1, 2].forEach((index) => {
    ['en', 'si', 'ta'].forEach((lang) => {
      const input = coverInput(form, `line_${lang}_${index}`);
      body[`line_${lang}_${index}`] = input.value.trim();
    });
  });
  try {
    const data = await api(`/api/admin/magazines/${state.issueId}/cover-text`, { method: 'POST', body });
    state.detail.cover = data.cover;
    fillCoverText(data.cover);
    toast(t('cover_text_ready'));
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById('coverTextReset').addEventListener('click', async () => {
  if (!state.issueId) return;
  try {
    const data = await api(`/api/admin/magazines/${state.issueId}/cover-text`, { method: 'POST', body: { reset: true } });
    state.detail.cover = data.cover;
    fillCoverText(data.cover);
    toast(t('cover_text_ready'));
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById('pieceForm').addEventListener('change', (event) => {
  if (event.target.name !== 'category_id') return;
  const category = state.categories.find((item) => String(item.id) === event.target.value);
  document.getElementById('streamHelp').textContent = category
    ? (currentLang() === 'si' ? category.description_si : category.description_en) : '';
});

document.getElementById('pieceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await savePiece(event.target, state.editing, event.submitter && event.submitter.dataset.act);
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById('dcsForm').addEventListener('change', (event) => {
  if (event.target.name === 'target_month' || event.target.name === 'target_year') loadDesk();
});

document.getElementById('dcsForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await savePiece(event.target, state.deskId, event.submitter && event.submitter.dataset.act);
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById('userSearch').addEventListener('input', async (event) => {
  state.query = event.target.value;
  state.users.page = 1;
  await loadUsers();
});

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.onclick = async () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-on', item === button));
    await loadArticles();
  };
});

document.getElementById('openUser').onclick = () => {
  const form = document.getElementById('userForm');
  form.reset();
  form.elements.id.value = '';
  form.elements.email.disabled = false;
  document.getElementById('userDialog').showModal();
};

document.getElementById('userForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());
  try {
    if (payload.id) {
      const existing = state.users.users.find((item) => String(item.id) === payload.id);
      await api(`/api/admin/users/${payload.id}`, { method: 'PUT', body: { ...existing, ...payload, active: existing.active } });
    } else {
      const data = await api('/api/admin/users', { method: 'POST', body: payload });
      toast(`${t('temp_password')}: ${data.temporary_password}`);
    }
    document.getElementById('userDialog').close();
    await loadUsers();
    await loadStats();
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById('openIssue').onclick = () => document.getElementById('issueDialog').showModal();
document.getElementById('issueForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.month = Number(payload.month);
  payload.year = Number(payload.year);
  payload.highlights = [1, 2, 3].map((n) => ({ en: payload[`h${n}en`] || '', si: payload[`h${n}si`] || '' }));
  try {
    await api('/api/admin/magazines', { method: 'POST', body: payload });
    document.getElementById('issueDialog').close();
    form.reset();
    await loadMagazines();
  } catch (error) {
    toast(error.message);
  }
});

window.addEventListener('retreat:lang', async () => {
  renderMine();
  await loadStats();
  await loadUsers();
  await loadArticles();
  await loadMagazines();
});

(async function boot() {
  try {
    const me = await api('/api/auth/me');
    if (me.user.role !== 'admin') {
      location.href = '/dashboard.html';
      return;
    }
    document.getElementById('who').textContent = me.user.full_name_en;
    state.me = me.user;
    state.categories = (await api('/api/categories')).categories;
    const pieceCategory = document.querySelector('#pieceForm [name="category_id"]');
    pieceCategory.innerHTML = state.categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name_en)}</option>`).join('');
    const monthOptions = MONTHS.en.map((name, index) => `<option value="${index + 1}">${name}</option>`).join('');
    document.querySelector('#pieceForm [name="target_month"]').innerHTML = monthOptions;
    document.querySelector('#dcsForm [name="target_month"]').innerHTML = monthOptions;
    document.querySelector('#pieceForm [name="target_year"]').value = new Date().getFullYear();
    document.querySelector('#dcsForm [name="target_year"]').value = new Date().getFullYear();
    const month = document.querySelector('#issueForm [name="month"]');
    month.innerHTML = monthOptions;
    await loadMine();
    fillPiece(null);
    await loadStats();
    await loadUsers();
    await loadArticles();
    await loadMagazines();
    const draft = state.magazines.find((magazine) => magazine.status === 'draft') || state.magazines[0];
    if (draft) await loadIssue(draft.id);
    showTab('overview');
  } catch {
    location.href = '/login.html';
  }
}());

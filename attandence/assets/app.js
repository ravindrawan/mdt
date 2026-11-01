'use strict';

const CURRENT_YEAR = new Date().getFullYear();
const HOURS_PER_DAY = 6;
const TARGET_HOURS = 12;
const DEFAULT_DESIGNATIONS = ['Management Assistant', 'Development Officer', 'Executive Officer', 'Office Assistant'];

const state = {
    year: CURRENT_YEAR,
    activeTab: 'add-record',
    user: null,
    settings: {},
    programs: [],
    records: [],
    progress: [],
    plans: [],
    staffMatrix: [],
    resourcePersons: [],
    staffCerts: [],
    notifications: [],
    chat: [],
    users: [],
    chatUsers: [],
    offices: [],
    designations: [],
    officers: [],
    uploadLimitMB: 10,
};

let attRecords = [];
let certRecords = [];

// ===================== Utilities =====================

function $(id) { return document.getElementById(id); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function escTx(value) {
    return '<span class="notranslate">' + esc(tx(value)) + '</span>';
}

let sourceIndexKey = '';
let sourceIndex = null;
function sourceText(text) {
    const t = String(text ?? '').trim();
    if (!t || typeof tx !== 'function') return t;
    const cached = (typeof officerCache === 'object' && officerCache) ? Object.keys(officerCache).length : 0;
    const key = uiLang() + ':' + state.officers.length + ':' + state.records.length + ':' + state.offices.length + ':' + cached;
    if (key !== sourceIndexKey) {
        const map = new Map();
        const add = (s) => {
            if (!s) return;
            map.set(s, s);
            const shown = tx(s);
            if (shown && !map.has(shown)) map.set(shown, s);
        };
        state.officers.forEach(o => { add(o.name); add(o.designation); add(o.office); });
        state.records.forEach(r => { add(r.name); add(r.designation); add(r.office); });
        if (typeof officerCache === 'object' && officerCache) {
            Object.values(officerCache).forEach(o => { if (o) { add(o.name); add(o.designation); add(o.office); } });
        }
        state.offices.forEach(add);
        state.designations.forEach(add);
        state.staffMatrix.forEach(m => add(m.office));
        sourceIndex = map;
        sourceIndexKey = key;
    }
    return sourceIndex.get(t) || t;
}

function showOfficerField(id, value) {
    const el = $(id);
    if (!el) return;
    el.dataset.src = value || '';
    el.value = tx(value || '');
}

function readOfficerField(id) {
    const el = $(id);
    if (!el) return '';
    const cur = el.value.trim();
    const src = el.dataset.src || '';
    if (src && (cur === src || cur === tx(src))) return src;
    return sourceText(cur);
}

const ROLE_LABELS = { super: 'Super Admin', admin: 'Admin', superuser: 'Superuser' };

function role() { return state.user ? state.user.role : 'none'; }
function isAdmin() { return role() === 'admin' || role() === 'super'; }
function currentName() { return state.user ? state.user.username : 'Guest User'; }

function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseISO(d) {
    const [y, m, day] = String(d).split('-').map(Number);
    return new Date(y, (m || 1) - 1, day || 1);
}

function formatDateLong(d) {
    if (!d) return '';
    return parseISO(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "22 & 23 September 2026" when all dates share a month, otherwise a full list. */
function formatProgramDates(dates) {
    const list = (dates || []).filter(Boolean).slice().sort();
    if (list.length === 0) return '';
    if (list.length === 1) return formatDateLong(list[0]);
    const sameMonth = list.every(d => d.slice(0, 7) === list[0].slice(0, 7));
    if (sameMonth) {
        const days = list.map(d => String(parseInt(d.slice(8), 10)));
        const month = parseISO(list[0]).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        return `${days.slice(0, -1).join(', ')} & ${days[days.length - 1]} ${month}`;
    }
    return list.map(formatDateLong).join(', ');
}

function absentList(rec) {
    return String(rec.absentDates || '').split(',').map(s => s.trim()).filter(Boolean);
}

function effHours(rec) {
    if (typeof rec.effectiveHours === 'number') return rec.effectiveHours;
    return Math.max(0, (parseInt(rec.hours, 10) || 0) - HOURS_PER_DAY * absentList(rec).length);
}

function nicCentury(yy) {
    const nowYy = new Date().getFullYear() % 100;
    return (parseInt(yy, 10) > nowYy) ? '19' : '20';
}

function convertNicFormat(nicStr) {
    const clean = String(nicStr || '').replace(/\s+/g, '').toUpperCase();
    if (!clean || clean.includes('*')) return '';
    if (/^\d{12}$/.test(clean)) return clean;
    const m = clean.match(/^(\d{2})(\d{3})(\d{4})[VX]$/);
    if (m) return `${nicCentury(m[1])}${m[1]}${m[2]}0${m[3]}`;
    const digits = clean.replace(/\D+/g, '');
    if (digits.length === 12) return digits;
    if (digits.length === 9 && /[VX]/.test(clean)) {
        return `${nicCentury(digits.slice(0, 2))}${digits.slice(0, 2)}${digits.slice(2, 5)}0${digits.slice(5, 9)}`;
    }
    return clean.replace(/[^0-9A-Z]/g, '');
}

function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const PASSWORD_EYE_OPEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const PASSWORD_EYE_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';

function togglePasswordVisibility(inputId, btn) {
    const input = $(inputId);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.title = show ? 'Hide password' : 'Show password';
    btn.innerHTML = show ? PASSWORD_EYE_OFF : PASSWORD_EYE_OPEN;
}

function notify(message, type = 'success') {
    const box = $('toastContainer');
    if (!box) { alert(message); return; }
    const colors = { success: 'bg-emerald-600', error: 'bg-rose-600', info: 'bg-indigo-900', warning: 'bg-amber-600' };
    const el = document.createElement('div');
    el.className = `${colors[type] || colors.info} text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-lg shadow-2xl pointer-events-auto transition-opacity duration-300`;
    el.textContent = message;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, type === 'error' ? 7000 : 4000);
}

function setBusy(on, text) {
    const o = $('busyOverlay');
    if (!o) return;
    if (text) $('busyOverlayText').textContent = text;
    o.classList.toggle('hidden', !on);
}

function setDbStatus(ok, message) {
    const st = $('liveStatus');
    const banner = $('dbStatusBanner');
    if (ok) {
        st.className = 'bg-emerald-950 text-emerald-400 border border-emerald-600 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1';
        st.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Database Connected';
        banner.classList.add('hidden');
    } else {
        st.className = 'bg-rose-950 text-rose-300 border border-rose-600 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1';
        st.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-400"></span> Database Offline';
        banner.textContent = '⚠️ ' + message;
        banner.classList.remove('hidden');
    }
}

async function api(action, { body = null, params = {} } = {}) {
    const qs = new URLSearchParams({ action, ...params });
    const opts = { method: 'GET', credentials: 'same-origin', headers: {} };
    if (body !== null) {
        opts.method = 'POST';
        opts.headers['Content-Type'] = 'application/json';
        opts.headers['X-MDTU-Request'] = '1';
        opts.body = JSON.stringify(body);
    }
    let res;
    try {
        res = await fetch('api.php?' + qs.toString(), opts);
    } catch (e) {
        setDbStatus(false, 'Cannot reach the web server. Make sure Apache is running and open the site through http://localhost/...');
        throw new Error('Cannot reach the server. Check your connection.');
    }
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        // Some hosts print PHP startup warnings before the JSON; read the JSON part if there is one
        const start = text.search(/[{[]/);
        try {
            if (start <= 0) throw e;
            data = JSON.parse(text.slice(start));
        } catch (e2) {
            setDbStatus(false, 'The server did not return valid data. Open this site through Apache/PHP (http://localhost/...), not as a file.');
            throw new Error('Invalid server response.');
        }
    }
    if (res.status === 503) {
        setDbStatus(false, data.message || 'Database is offline.');
    } else {
        setDbStatus(true);
    }
    if (!res.ok || (data && data.status === 'error')) {
        if (res.status === 401 && state.user) {
            state.user = null;
            updateAuthUI();
        }
        if (res.status === 403 && state.user && /change your password/i.test((data && data.message) || '')) {
            openChangePasswordModal(true);
        }
        throw new Error((data && data.message) || `Request failed (${res.status})`);
    }
    return data;
}

const post = (action, body = {}, params = {}) => api(action, { body, params });

function submitButtons(form) {
    return [...form.querySelectorAll('button, input[type="submit"]')].filter(el => {
        const type = (el.getAttribute('type') || (el.tagName === 'BUTTON' ? 'submit' : '')).toLowerCase();
        return type === 'submit';
    });
}

/** One click starts the save. Further clicks do nothing until that save finishes. */
function guardSubmit(fn) {
    return async function (event) {
        const form = event && event.target && event.target.tagName === 'FORM' ? event.target : null;
        if (form && form.dataset.submitting === '1') {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        const buttons = form ? submitButtons(form) : [];
        const labels = buttons.map(b => b.tagName === 'BUTTON' ? b.textContent : b.value);
        if (form) form.dataset.submitting = '1';
        buttons.forEach(b => {
            b.disabled = true;
            if (b.tagName === 'BUTTON') b.textContent = 'Please wait...';
            else b.value = 'Please wait...';
        });
        try {
            return await fn(event);
        } finally {
            if (form) delete form.dataset.submitting;
            buttons.forEach((b, i) => {
                b.disabled = false;
                if (b.tagName === 'BUTTON') b.textContent = labels[i];
                else b.value = labels[i];
            });
        }
    };
}

document.addEventListener('submit', event => {
    const form = event.target;
    if (form && form.dataset && form.dataset.submitting === '1') {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

function fileToDataUrl(file, maxMb) {
    maxMb = Math.min(maxMb, state.uploadLimitMB || maxMb);
    return new Promise((resolve, reject) => {
        if (file.size > maxMb * 1024 * 1024) {
            reject(new Error(`File is too large. Maximum size is ${maxMb} MB.`));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the file.'));
        reader.readAsDataURL(file);
    });
}

function readExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                resolve(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
            } catch (err) {
                reject(new Error('This Excel file could not be read.'));
            }
        };
        reader.onerror = () => reject(new Error('Could not read the file.'));
        reader.readAsArrayBuffer(file);
    });
}

function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ===================== Startup & data loading =====================

async function loadAll() {
    try {
        const d = await api('bootstrap', { params: { year: state.year } });
        Object.assign(state, {
            user: d.user,
            settings: d.settings || {},
            programs: d.programs || [],
            resourcePersons: d.resourcePersons || [],
            notifications: d.notifications || [],
            chat: d.chat || [],
            staffMatrix: d.staffMatrix || [],
            staffCerts: d.staffCerts || [],
            records: d.records || [],
            progress: d.progress || [],
            plans: d.plans || [],
            users: d.users || [],
            chatUsers: d.chatUsers || [],
            offices: d.offices || [],
            designations: d.designations || [],
            officers: d.officers || [],
            uploadLimitMB: d.uploadLimitMB || 10,
        });
        if (d.sessionExpired) notify('Your session expired after 30 minutes without activity. Please log in again.', 'warning');
    } catch (e) {
        notify(e.message, 'error');
    }
    const firstLoad = !state.booted;
    state.booted = true;
    renderAll();
    if (state.user && state.user.mustChangePassword) openChangePasswordModal(true);
    else if (firstLoad && state.user) switchTab('home');
}

function renderAll() {
    applyTemplate();
    updateNewsAlertUI();
    updateAuthUI();
    populateYearSelector();
    updateProgramDropdowns();
    updateOfficeDropdowns();
    renderNotifications();
    renderLiveChatMessages();
    renderMasterResourcePersonsTable();
    renderAnnualStaffMatrixTable();
    renderTrainingPlanTable();
    renderUserAccountsTable();
    refreshActiveTab();
}

async function reloadRecords() {
    if (!state.user) return;
    state.records = await api('get_data', { params: { year: state.year } });
    updateOfficeDropdowns();
    refreshActiveTab();
}

async function pollMessages() {
    if (document.hidden) return;
    try {
        const [chat, notifs] = await Promise.all([api('get_chat'), api('get_notifications')]);
        state.chat = chat;
        state.notifications = notifs;
        renderLiveChatMessages();
        renderNotifications();
    } catch (e) { /* status banner already shows the problem */ }
}

function populateYearSelector() {
    const sel = $('activeYearSelect');
    if (!sel) return;
    const years = new Set();
    for (let y = CURRENT_YEAR + 1; y >= CURRENT_YEAR - 4; y--) years.add(y);
    state.programs.forEach(p => years.add(parseInt(String(p.firstDate).slice(0, 4), 10)));
    sel.innerHTML = [...years].filter(Boolean).sort((a, b) => b - a)
        .map(y => `<option value="${y}" ${y === state.year ? 'selected' : ''}>${y}</option>`).join('');
}

function switchYear() {
    state.year = parseInt($('activeYearSelect').value, 10) || CURRENT_YEAR;
    loadAll();
}

// ===================== Navigation =====================

const TAB_RENDERERS = {
    'home': () => renderHome(),
    'cert-register': () => initCertRegister(),
    'audit-log': () => initAuditLog(),
    'archive-tab': () => loadServerBackups(),
    'dashboard': () => renderDashboard(),
    'confirm-attendance': () => renderConfirmAttendanceTable(),
    'manage-programs': () => renderConfiguredProgramsTable(),
    'progress-reports': () => renderProgressPresentations(),
    'progress-detail-report': () => renderProgressDetailReport(),
    'training-plan-report': () => renderTrainingPlanTable(),
    'resource-persons-master-report': () => renderMasterResourcePersonsTable(),
    'analytics': () => renderAnalytics(),
    'resource-report': () => renderResourceReport(),
    'duty-report': () => renderDutyReport(),
    'pending': () => renderPendingReport(),
    'completed': () => renderCompletedReport(),
    'training-namelist-report': () => filterTrainingNamelist(),
    'participation-list': () => renderParticipationList(),
    'office-count-report': () => renderOfficeCountReport(),
    'office-report': () => generateOfficeReport(),
    'office-designation-report': () => generateOfficeDesignationReport(),
    'progress-entry': () => refreshProgressEntryPanels(),
    'user-management': () => renderUserAccountsTable(),
    'template-settings': () => fillTemplateForm(),
    'certificate': () => fitCertificates(),
    'attendance-cert': () => fitCertificates(),
};

function canSeeView(view) {
    const r = role();
    if (view.classList.contains('super-admin-only')) return r === 'super';
    if (view.classList.contains('admin-only') || view.classList.contains('only-admin-and-super')) return isAdmin();
    if (view.classList.contains('super-user-only')) return r === 'superuser';
    if (view.classList.contains('logged-in-only')) return r !== 'none';
    return true;
}

function defaultTab() { return state.user ? 'home' : 'add-record'; }

function switchTab(tabId) {
    let target = $('view-' + tabId);
    if (!target || !canSeeView(target)) {
        tabId = defaultTab();
        target = $('view-' + tabId);
    }
    qsa('.tab-view').forEach(v => v.classList.add('hidden'));
    qsa('.tab-btn').forEach(b => b.classList.remove('active'));
    target.classList.remove('hidden');
    const btn = $('tab-' + tabId);
    if (btn) {
        btn.classList.add('active');
        const group = btn.closest('details.nav-group');
        if (group) group.open = true;
    }
    if (tabId === 'home') qsa('details.nav-group').forEach(g => { g.open = false; });
    state.activeTab = tabId;
    updateBreadcrumb();
    closeMobileSidebar();
    window.scrollTo({ top: 0, behavior: window.innerWidth < 768 ? 'smooth' : 'auto' });
    refreshActiveTab();
}

function updateBreadcrumb() {
    const bar = $('breadcrumbBar');
    if (!bar) return;
    const btn = $('tab-' + state.activeTab);
    const show = !!state.user && state.activeTab !== 'home';
    bar.classList.toggle('hidden', !show);
    if (show) $('breadcrumbTitle').textContent = btn ? btn.textContent.trim() : '';
}

function refreshActiveTab() {
    const fn = TAB_RENDERERS[state.activeTab];
    if (fn) fn();
}

function toggleMobileSidebar() {
    const open = $('sidebarNav').classList.toggle('open');
    $('sidebarOverlay').classList.toggle('hidden', !open);
}

function closeMobileSidebar() {
    $('sidebarNav').classList.remove('open');
    $('sidebarOverlay').classList.add('hidden');
}

// ===================== Authentication =====================

function toggleAuthModal() {
    $('authModal').classList.toggle('hidden');
    if (!$('authModal').classList.contains('hidden')) $('loginUsername').focus();
}

async function handleLogin(e) {
    e.preventDefault();
    const authBtn = $('authBtn');
    const authLabel = authBtn ? authBtn.textContent : '';
    if (authBtn) {
        authBtn.disabled = true;
        authBtn.textContent = 'Please wait...';
    }
    setBusy(true, 'Please wait...');
    try {
        const res = await post('login', { username: $('loginUsername').value.trim(), password: $('loginPassword').value });
        state.user = res.user;
        $('loginPassword').value = '';
        await loadAll();
        if (!$('authModal').classList.contains('hidden')) toggleAuthModal();
        notify(`Logged in as ${res.user.username} (${res.user.role.toUpperCase()})`);
        if (!res.user.mustChangePassword) switchTab('home');
    } catch (err) {
        notify(err.message, 'error');
    } finally {
        setBusy(false);
        if (authBtn) {
            authBtn.disabled = false;
            if (!state.user) authBtn.textContent = authLabel || '🔐 Login';
        }
    }
}

async function handleLogout() {
    try { await post('logout'); } catch (e) { /* ignore */ }
    closeChangePasswordModal(true);
    state.user = null;
    state.auditLoaded = false;
    auditRows = [];
    regRows = [];
    state.records = [];
    state.progress = [];
    state.plans = [];
    state.users = [];
    state.chatUsers = [];
    switchTab('add-record');
    await loadAll();
    notify('Logged out successfully.', 'info');
}

function updateAuthUI() {
    const r = role();
    const loggedIn = r !== 'none';
    // Page sections (.tab-view) are shown only by switchTab; here we toggle menus and controls.
    const show = (sel, on) => qsa(sel).forEach(el => { if (!el.classList.contains('tab-view')) el.classList.toggle('hidden', !on); });
    show('.logged-in-only', loggedIn);
    show('.admin-only', isAdmin());
    show('.only-admin-and-super', isAdmin());
    show('.super-admin-only', r === 'super');
    show('.super-user-only', r === 'superuser');

    const msgCard = $('userSendMessageCard');
    if (msgCard) msgCard.classList.toggle('hidden', isAdmin());

    const authBtn = $('authBtn');
    if (loggedIn) {
        authBtn.textContent = `🔓 Logout (${state.user.username})`;
        authBtn.onclick = handleLogout;
    } else {
        authBtn.textContent = '🔐 Login';
        authBtn.onclick = toggleAuthModal;
    }

    const badge = $('sidebarUserBadge');
    if (badge) badge.innerHTML = loggedIn ? `👤 <strong class="text-white">${esc(state.user.username)}</strong><br><span class="text-amber-400 font-bold uppercase">${esc(ROLE_LABELS[r] || r)}</span>
        <button onclick="openChangePasswordModal(false)" class="block mt-1.5 text-[10px] text-indigo-200 hover:text-white underline">🔑 Change password</button>` : '';
    const chatBadge = $('chatUserBadge');
    if (chatBadge) chatBadge.textContent = `User: ${currentName()}`;

    // Logged-in users navigate from the dashboard, so the long menu groups start folded
    if (state.navRole !== r) {
        state.navRole = r;
        qsa('details.nav-group').forEach(g => { g.open = !loggedIn; });
    }

    const active = $('view-' + state.activeTab);
    if (!active || !canSeeView(active)) {
        switchTab(defaultTab());
    } else {
        qsa('.tab-view').forEach(v => v.classList.toggle('hidden', v !== active));
        const btn = $('tab-' + state.activeTab);
        const group = btn && btn.closest('details.nav-group');
        if (group) group.open = true;
        updateBreadcrumb();
    }

    updateChatRecipientOptions();
    updateNotificationRecipientOptions();
}

// ===================== Certificate template / settings =====================

const DEFAULT_STATE_EMBLEM = 'assets/sl-emblem.png';
const DEFAULT_SIGNATURE = 'assets/peththawadu-signature.png';

function setTemplateImages(imgSel, defaultSel, url) {
    qsa(imgSel).forEach(img => {
        if (url) { img.src = url; img.classList.remove('hidden'); } else { img.removeAttribute('src'); img.classList.add('hidden'); }
    });
    qsa(defaultSel).forEach(el => el.classList.toggle('hidden', !!url));
}

function applyTemplate() {
    const s = state.settings;
    setTemplateImages('.tpl-logo', '.tpl-logo-default', s.logo);
    setTemplateImages('.tpl-signature', '.tpl-signature-default', s.signature || DEFAULT_SIGNATURE);
    setTemplateImages('.tpl-seal', '.tpl-seal-default', s.seal);
    qsa('.tpl-emblem').forEach(img => { img.src = s.stateEmblem || DEFAULT_STATE_EMBLEM; });
    const name = s.signatoryName || '';
    qsa('.tpl-sig-name').forEach(el => { el.textContent = name; });
    qsa('.tpl-sig-name-script').forEach(el => { el.textContent = name.replace(/^(Mr|Mrs|Ms|Miss|Dr|Prof|Rev)\.?\s+/i, ''); });
    qsa('.tpl-sig-title').forEach(el => { el.textContent = s.signatoryTitle || ''; });
    const orgLine = [s.orgAddress, s.orgPhone ? 'Tel: ' + s.orgPhone : ''].filter(Boolean).join('  ·  ');
    qsa('.tpl-org-line').forEach(el => { el.textContent = orgLine; });
}

function fillTemplateForm() {
    const s = state.settings;
    $('settingMadamName').value = s.signatoryName || '';
    $('settingMadamTitle').value = s.signatoryTitle || '';
    $('settingOrgAddress').value = s.orgAddress || '';
    $('settingOrgPhone').value = s.orgPhone || '';
    $('settingPublicBaseUrl').value = s.publicBaseUrl || '';
    $('settingCurrentBaseUrl').textContent = currentBaseUrl();
}

async function saveSettings(values, successMsg) {
    const res = await post('save_settings', { settings: values });
    state.settings = res.settings;
    applyTemplate();
    updateNewsAlertUI();
    if (successMsg) notify(successMsg);
}

async function uploadTemplateAsset(type, event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const dataUrl = await fileToDataUrl(file, 3);
        await saveSettings({ [type]: dataUrl }, 'Template image saved to the database.');
    } catch (err) {
        notify(err.message, 'error');
    }
    event.target.value = '';
}

async function removeTemplateAsset(type, label = type) {
    if (!confirm(`Remove the ${label} image?`)) return;
    try { await saveSettings({ [type]: '' }, 'Image removed.'); } catch (err) { notify(err.message, 'error'); }
}

async function saveTemplateDetails(e) {
    e.preventDefault();
    try {
        await saveSettings({
            signatoryName: $('settingMadamName').value,
            signatoryTitle: $('settingMadamTitle').value,
            orgAddress: $('settingOrgAddress').value,
            orgPhone: $('settingOrgPhone').value,
            publicBaseUrl: $('settingPublicBaseUrl').value,
        }, 'Template details saved.');
        fillTemplateForm();
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ===================== Alerts =====================

function updateNewsAlertUI() {
    const text = state.settings.alertText || 'MDTU Training Management System';
    if ($('headerAlertTickerText')) $('headerAlertTickerText').textContent = text;
    if ($('chatTickerAlertContent')) $('chatTickerAlertContent').textContent = text;
}

function openNewAlertModal() {
    if (!isAdmin()) { notify('Only Admin and Super Admin can manage alerts.', 'error'); return; }
    $('modalAlertTextInput').value = state.settings.alertText || '';
    $('alertManageModal').classList.remove('hidden');
}
function openManageAlertModal() { openNewAlertModal(); }
function editCurrentAlert() { openNewAlertModal(); }
function closeManageAlertModal() { $('alertManageModal').classList.add('hidden'); }

async function saveNewAlert(e) {
    e.preventDefault();
    const text = $('modalAlertTextInput').value.trim();
    if (!text) return;
    try {
        await saveSettings({ alertText: text }, 'Alert updated.');
        closeManageAlertModal();
    } catch (err) { notify(err.message, 'error'); }
}

async function deleteCurrentAlert() {
    if (!isAdmin() || !confirm('Reset this alert to the default text?')) return;
    try { await saveSettings({ alertText: 'MDTU System Live Support Active.' }, 'Alert reset.'); } catch (err) { notify(err.message, 'error'); }
}

// ===================== Programs (dropdowns + admin setup) =====================

function programById(id) {
    return state.programs.find(p => String(p.id) === String(id));
}

function programLabel(p) {
    return `${p.name} — ${formatProgramDates(p.dates)} — ${p.venue}`;
}

function isoToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDaysIso(iso, days) {
    const [y, m, d] = String(iso).split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function programEndDate(p) {
    const dates = ((p && p.dates) || []).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice().sort();
    if (dates.length) return dates[dates.length - 1];
    return /^\d{4}-\d{2}-\d{2}$/.test(p && p.firstDate) ? p.firstDate : '';
}

/** Listed on Add Training Record only from the last day of the program through 7 days later. */
function programOpenForRecord(p, today) {
    const end = programEndDate(p);
    if (!end) return false;
    const now = today || isoToday();
    return now >= end && now <= addDaysIso(end, 7);
}

function updateProgramDropdowns() {
    const optionHtml = (list) => list.map(p => `<option value="${p.id}">${esc(programLabel(p))}</option>`).join('');
    const options = optionHtml(state.programs);
    const openOptions = optionHtml(state.programs.filter(p => programOpenForRecord(p)));
    const setSelect = (id, first, html) => {
        const el = $(id);
        if (!el) return;
        const prev = el.value;
        el.innerHTML = first + html;
        if ([...el.options].some(o => o.value === prev)) el.value = prev;
    };
    setSelect('trainingNameSelect', '<option value="">-- Select the program you attended --</option>', openOptions);
    setSelect('adminConfirmProgramSelect', '<option value="">-- All Programs --</option>', options);
    setSelect('analyticsTrainingSelect', '<option value="all">All Programs</option>', options);
    setSelect('tnFilterProgram', '<option value="">-- All Programs --</option>', options);
    setSelect('resourceProgramSelect', '<option value="">All Programs</option>', options);

    const venues = [...new Set(state.programs.map(p => p.venue))];
    if ($('venueDatalist')) $('venueDatalist').innerHTML = venues.map(v => `<option value="${esc(v)}">`).join('');
    if ($('resourcePersonDatalist')) $('resourcePersonDatalist').innerHTML = knownResourceNames().map(name => `<option value="${esc(name)}">`).join('');
    refreshResourcePersonSelects();
}

function rpName(rp) {
    return typeof rp === 'string' ? rp : ((rp && rp.name) || '');
}

function rpNames(list) {
    return (list || []).map(rpName).filter(Boolean);
}

function onProgramSelected() {
    const p = programById($('trainingNameSelect').value);
    const container = $('resourceRatingsContainer');
    if (!p) {
        $('venueInput').value = '';
        $('dateInput').value = '';
        $('hoursInput').value = '';
        container.innerHTML = '<p class="text-xs text-slate-500">Select a program above to view and evaluate resource persons.</p>';
        return;
    }
    $('venueInput').value = p.venue;
    $('dateInput').value = formatProgramDates(p.dates);
    $('hoursInput').value = `${p.hours} Hours`;
    const names = rpNames(p.resourcePersons);
    container.innerHTML = names.length === 0
        ? '<p class="text-xs text-slate-500">No resource persons listed for this program.</p>'
        : names.map(rp => `
            <div class="bg-white p-3 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <span class="text-xs font-bold text-indigo-950">${esc(rp)}</span>
                <select name="lecturerRating" data-lecturer="${esc(rp)}" class="p-1.5 text-xs border rounded font-bold text-amber-600 outline-none">
                    <option value="5" selected>5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 Stars ⭐⭐⭐⭐</option>
                    <option value="3">3 Stars ⭐⭐⭐</option>
                    <option value="2">2 Stars ⭐⭐</option>
                    <option value="1">1 Star ⭐</option>
                </select>
            </div>`).join('');
}

function renderConfiguredProgramsTable() {
    const tbody = $('configuredProgramsTableBody');
    if (!tbody) return;
    if (state.programs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">No programs yet. Add the first program above.</td></tr>';
        return;
    }
    tbody.innerHTML = state.programs.map(p => {
        const count = state.records.filter(r => r.programId === p.id).length;
        return `
            <tr class="border-b hover:bg-slate-50 align-top">
                <td class="p-2 font-bold">${esc(p.name)}${p.fileNo ? `<div class="font-mono text-[10px] font-semibold text-slate-500">File No: ${esc(p.fileNo)}</div>` : ''}</td>
                <td class="p-2">📍 ${esc(p.venue)}</td>
                <td class="p-2 font-mono text-[11px]">${esc(p.dates.join(', '))}</td>
                <td class="p-2 text-center font-bold text-amber-700">${p.hours}h</td>
                <td class="p-2">${esc(rpNames(p.resourcePersons).join(', ') || '-')}${p.coordinators && p.coordinators.length ? `<div class="text-[10px] text-teal-700 mt-1">Coord: ${esc(p.coordinators.map(c => c.name).join(', '))}</div>` : ''}${p.assistantCoordinators && p.assistantCoordinators.length ? `<div class="text-[10px] text-cyan-700 mt-1">Asst: ${esc(p.assistantCoordinators.map(c => c.name).join(', '))}</div>` : ''}${p.kksHelpers && p.kksHelpers.length ? `<div class="text-[10px] text-amber-800 mt-1">KKS: ${esc(p.kksHelpers.map(c => c.name).join(', '))}</div>` : ''}</td>
                <td class="p-2 text-center leading-5">${p.issueCompletion ? '<div class="font-bold text-emerald-700">Completion</div>' : ''}${p.issueAttendance ? '<div class="font-bold text-amber-700">Attendance</div>' : ''}${!p.issueCompletion && !p.issueAttendance ? '<span class="text-slate-400">Not ticked</span>' : ''}</td>
                <td class="p-2 text-center font-bold">${count}</td>
                <td class="p-2 text-center whitespace-nowrap">
                    <button onclick="editProgram(${p.id})" class="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold">Edit</button>
                    <button onclick="openStaffCertsForProgram(${p.id})" class="bg-amber-600 text-white px-2 py-1 rounded text-[10px] font-bold">Staff certs</button>
                    <button onclick="deleteProgram(${p.id})" class="bg-rose-600 text-white px-2 py-1 rounded text-[10px] font-bold">Delete</button>
                </td>
            </tr>`;
    }).join('');
}

const FILE_NO_PREFIX = 'NWP/CS/T/';

function fileNoSuffix(fileNo) {
    let s = String(fileNo || '').trim().toUpperCase();
    const bare = FILE_NO_PREFIX.replace(/\/$/, '');
    if (s.startsWith(bare)) s = s.slice(bare.length);
    return s.replace(/^\/+/, '');
}

function fullFileNo(input) {
    const rest = fileNoSuffix(input);
    return rest ? FILE_NO_PREFIX + rest : '';
}

function parseDateList(str) {
    return [...new Set(String(str).split(',').map(d => d.trim()).filter(Boolean))].sort();
}

function addProgramDate() {
    const picked = $('progDatePicker').value;
    if (!picked) { notify('Choose a date first.', 'warning'); return; }
    const dates = parseDateList($('progDatesConfig').value);
    if (!dates.includes(picked)) dates.push(picked);
    $('progDatesConfig').value = dates.sort().join(', ');
    $('progDatePicker').value = '';
    calculateProgramHours();
}

function calculateProgramHours() {
    const dates = parseDateList($('progDatesConfig').value);
    $('progFirstDateConfig').value = /^\d{4}-\d{2}-\d{2}$/.test(dates[0] || '') ? dates[0] : '';
    $('progHoursConfig').value = dates.length ? dates.length * HOURS_PER_DAY : '';
}

function personKey(name) {
    return String(name || '').toLowerCase()
        .replace(/\./g, ' ')
        .replace(/\b(mr|mrs|ms|miss|dr|prof|rev|sir)\b/g, ' ')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function knownResourceNames() {
    const map = new Map();
    const add = (name) => {
        const clean = String(name || '').trim();
        const key = personKey(clean);
        if (key && !map.has(key)) map.set(key, clean);
    };
    state.resourcePersons.forEach(r => add(r.name));
    state.programs.forEach(p => (p.resourcePersons || []).forEach(rp => add(rpName(rp))));
    return [...map.values()].sort((a, b) => a.localeCompare(b));
}

function resourceNameByKey() {
    const map = new Map();
    knownResourceNames().forEach(name => map.set(personKey(name), name));
    return map;
}

function onResourceNameBlur(input) {
    const typed = input.value.trim();
    const original = input.dataset.original || '';
    const existing = resourceNameByKey().get(personKey(typed));
    const row = input.closest('.resource-person-row');
    const known = directoryResourceByName(existing || typed);
    if (row && known) {
        const nicEl = row.querySelector('.resource-person-nic');
        const fieldEl = row.querySelector('.resource-person-field');
        if (nicEl && !nicEl.value.trim() && known.nic) nicEl.value = known.nic;
        if (fieldEl && !fieldEl.value.trim() && known.field) fieldEl.value = known.field;
    }
    if (!existing || existing === typed) return;
    if (original && personKey(original) === personKey(typed)) return;
    input.value = existing;
    notify(`Matched to the existing resource person: ${existing}`, 'info');
}

function fillResourcePersonSelect(select, selected) {
    const names = knownResourceNames();
    const current = selected || '';
    select.innerHTML = '<option value="">-- All saved resource persons --</option>' + names.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
    if (current && [...select.options].some(o => o.value === current)) select.value = current;
}

function refreshResourcePersonSelects() {
    qsa('.resource-person-select').forEach(select => {
        const input = select.parentElement.querySelector('.resource-person-input');
        fillResourcePersonSelect(select, input ? input.value.trim() : select.value);
    });
}

function onResourcePersonPicked(select) {
    const row = select.closest('.resource-person-row') || select.parentElement;
    const input = row.querySelector('.resource-person-input');
    if (!input || !select.value) return;
    input.value = select.value;
    input.dataset.original = select.value;
    const known = state.resourcePersons.find(r => r.name === select.value);
    const nic = row.querySelector('.resource-person-nic');
    const field = row.querySelector('.resource-person-field');
    if (nic && known && known.nic) nic.value = known.nic;
    if (field && known && known.field) field.value = known.field;
}

function directoryResourceByName(name) {
    const key = personKey(name);
    if (!key) return null;
    return state.resourcePersons.find(r => personKey(r.name) === key) || null;
}

function addResourcePersonConfigRow(value = '') {
    const item = typeof value === 'string' ? { name: value, nic: '', field: '' } : (value || {});
    const name = item.name || '';
    const known = name ? directoryResourceByName(name) : null;
    const nic = item.nic || (known && known.nic) || '';
    const field = item.field || (known && known.field) || '';
    const div = document.createElement('div');
    div.className = 'resource-person-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-start';
    div.innerHTML = `
        <select class="lg:col-span-3 p-2 text-xs border rounded outline-none bg-white resource-person-select" onchange="onResourcePersonPicked(this)"></select>
        <input type="text" list="resourcePersonDatalist" placeholder="Or type a new name" class="lg:col-span-3 p-2 text-xs border rounded outline-none resource-person-input" onblur="onResourceNameBlur(this)">
        <input type="text" placeholder="NIC / Officer ID (type if missing)" class="lg:col-span-2 p-2 text-xs border rounded outline-none font-mono uppercase resource-person-nic">
        <input type="text" placeholder="Subject field" class="lg:col-span-3 p-2 text-xs border rounded outline-none resource-person-field">
        <button type="button" onclick="this.closest('.resource-person-row').remove()" class="lg:col-span-1 bg-rose-600 text-white px-3 py-2 rounded text-xs font-bold">X</button>`;
    const input = div.querySelector('.resource-person-input');
    input.value = name;
    input.dataset.original = name;
    div.querySelector('.resource-person-nic').value = nic;
    div.querySelector('.resource-person-field').value = field;
    fillResourcePersonSelect(div.querySelector('select'), name);
    $('progResourcePersonsContainer').appendChild(div);
}

function addCoordinatorConfigRow(value = {}) {
    const item = value || {};
    const div = document.createElement('div');
    div.className = 'coordinator-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-start';
    div.innerHTML = `
        <input type="text" placeholder="NIC / Officer ID *" class="lg:col-span-2 p-2 text-xs border rounded outline-none font-mono uppercase coordinator-nic" oninput="handleCoordinatorNicLookup(this)">
        <input type="text" placeholder="Officer Name *" class="lg:col-span-3 p-2 text-xs border rounded outline-none coordinator-name">
        <input type="text" placeholder="Designation" class="lg:col-span-3 p-2 text-xs border rounded outline-none coordinator-designation">
        <input type="text" placeholder="Office / Department" class="lg:col-span-3 p-2 text-xs border rounded outline-none coordinator-office">
        <button type="button" onclick="this.closest('.coordinator-row').remove()" class="lg:col-span-1 bg-rose-600 text-white px-3 py-2 rounded text-xs font-bold">X</button>`;
    div.querySelector('.coordinator-nic').value = item.nic || '';
    div.querySelector('.coordinator-name').value = item.name || '';
    div.querySelector('.coordinator-designation').value = item.designation || 'Training Coordinating Officer';
    div.querySelector('.coordinator-office').value = item.office || '';
    $('progCoordinatorsContainer').appendChild(div);
}

const MAX_ASSISTANT_COORDINATORS = 20;
const MAX_KKS_HELPERS = 5;

function updateAssistantCoordinatorCount() {
    const n = qsa('.assistant-coordinator-row').length;
    if ($('progAssistantCount')) $('progAssistantCount').textContent = `${n} / ${MAX_ASSISTANT_COORDINATORS} added`;
}

function updateKksHelperCount() {
    const n = qsa('.kks-helper-row').length;
    if ($('progKksCount')) $('progKksCount').textContent = `${n} / ${MAX_KKS_HELPERS} added`;
}

function refreshOfficerNicDatalist() {
    const el = $('officerNicDatalist');
    if (!el) return;
    const seen = new Set();
    el.innerHTML = (state.officers || []).map(o => {
        const nic = convertNicFormat(o.nic) || o.nic;
        if (!nic || seen.has(nic)) return '';
        seen.add(nic);
        const label = `${nic} — ${tx(o.name || '')}${o.designation ? ' · ' + tx(designationCanonicalName(o.designation) || o.designation) : ''}${o.office ? ' · ' + tx(officeCanonicalName(o.office) || o.office) : ''}`;
        return `<option value="${esc(nic)}">${esc(label)}</option>`;
    }).filter(Boolean).join('');
}

function addAssistantCoordinatorConfigRow(value = {}) {
    if (qsa('.assistant-coordinator-row').length >= MAX_ASSISTANT_COORDINATORS) {
        notify(`You can add at most ${MAX_ASSISTANT_COORDINATORS} assistant coordinating officers.`, 'warning');
        return;
    }
    const item = value || {};
    const div = document.createElement('div');
    div.className = 'assistant-coordinator-row grid grid-cols-1 sm:grid-cols-12 gap-2 items-start';
    div.innerHTML = `
        <input type="text" placeholder="NIC / Assistant Coordinating Officer ID *" class="sm:col-span-4 p-2 text-xs border rounded outline-none font-mono uppercase assistant-nic" oninput="handleAssistantNicLookup(this)">
        <input type="text" placeholder="Officer Name *" class="sm:col-span-7 p-2 text-xs border rounded outline-none assistant-name">
        <button type="button" onclick="this.closest('.assistant-coordinator-row').remove(); updateAssistantCoordinatorCount();" class="sm:col-span-1 bg-rose-600 text-white px-3 py-2 rounded text-xs font-bold">X</button>`;
    div.querySelector('.assistant-nic').value = item.nic || '';
    div.querySelector('.assistant-name').value = item.name || '';
    $('progAssistantCoordinatorsContainer').appendChild(div);
    updateAssistantCoordinatorCount();
}

function addKksHelperConfigRow(value = {}) {
    if (qsa('.kks-helper-row').length >= MAX_KKS_HELPERS) {
        notify(`You can add at most ${MAX_KKS_HELPERS} සහායක (KKS) helpers per program.`, 'warning');
        return;
    }
    refreshOfficerNicDatalist();
    const item = value || {};
    const div = document.createElement('div');
    div.className = 'kks-helper-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-start bg-white border border-amber-200 rounded-lg p-2 shadow-sm';
    div.innerHTML = `
        <input type="text" list="officerNicDatalist" placeholder="NIC / Officer ID * (pick or type)" class="lg:col-span-3 p-2 text-xs border border-amber-300 rounded outline-none font-mono uppercase kks-nic" oninput="handleKksNicLookup(this)" onchange="handleKksNicLookup(this)">
        <input type="text" placeholder="Name *" class="lg:col-span-3 p-2 text-xs border rounded outline-none kks-name">
        <input type="text" placeholder="Permanent designation" class="lg:col-span-3 p-2 text-xs border rounded outline-none kks-designation" title="Filled from officer directory when NIC is known">
        <input type="text" placeholder="Office" class="lg:col-span-2 p-2 text-xs border rounded outline-none kks-office">
        <button type="button" onclick="this.closest('.kks-helper-row').remove(); updateKksHelperCount();" class="lg:col-span-1 bg-rose-600 text-white px-3 py-2 rounded text-xs font-bold">X</button>
        <p class="lg:col-span-12 text-[10px] text-amber-800 -mt-1">Duty on certificate: <strong>කම්කරු (KKS)</strong> · designation above is the permanent cadre post from the ID.</p>`;
    div.querySelector('.kks-nic').value = item.nic || '';
    div.querySelector('.kks-name').value = item.name || '';
    div.querySelector('.kks-designation').value = item.designation || '';
    div.querySelector('.kks-office').value = item.office || '';
    $('progKksHelpersContainer').appendChild(div);
    updateKksHelperCount();
}

const handleCoordinatorNicLookup = debounce(async (input) => {
    const nic = convertNicFormat(input.value);
    if (nic.length < 9) return;
    const o = await lookupOfficer(nic);
    if (!o) return;
    const row = input.closest('.coordinator-row');
    if (!row) return;
    const name = row.querySelector('.coordinator-name');
    const desig = row.querySelector('.coordinator-designation');
    const office = row.querySelector('.coordinator-office');
    if (name && !name.value.trim()) name.value = o.name || '';
    if (desig && (!desig.value.trim() || desig.value === 'Training Coordinating Officer')) desig.value = o.designation || 'Training Coordinating Officer';
    if (office && !office.value.trim()) office.value = o.office || '';
}, 400);

const handleAssistantNicLookup = debounce(async (input) => {
    const nic = convertNicFormat(input.value);
    if (nic.length < 9) return;
    const o = await lookupOfficer(nic);
    if (!o) return;
    const row = input.closest('.assistant-coordinator-row');
    if (!row) return;
    const name = row.querySelector('.assistant-name');
    if (name && !name.value.trim()) name.value = o.name || '';
}, 400);

const handleKksNicLookup = debounce(async (input) => {
    const raw = String(input.value || '').trim();
    // Datalist may paste "NIC — Name · …"; keep NIC part only.
    const nicPart = raw.split(/\s+[—\-–]\s+/)[0].trim();
    const nic = convertNicFormat(nicPart);
    if (nic.length >= 9 && nic !== nicPart.toUpperCase().replace(/\s+/g, '')) {
        input.value = nic;
    }
    if (nic.length < 9) return;
    const o = await lookupOfficer(nic);
    if (!o) return;
    const row = input.closest('.kks-helper-row');
    if (!row) return;
    const name = row.querySelector('.kks-name');
    const desig = row.querySelector('.kks-designation');
    const office = row.querySelector('.kks-office');
    if (name) name.value = o.name || name.value;
    if (desig) desig.value = designationCanonicalName(o.designation || '') || o.designation || desig.value;
    if (office) office.value = officeCanonicalName(o.office || '') || o.office || office.value;
}, 350);

function resetProgramForm() {
    $('programConfigForm').reset();
    $('progIdConfig').value = '';
    $('progResourcePersonsContainer').innerHTML = '';
    if ($('progCoordinatorsContainer')) $('progCoordinatorsContainer').innerHTML = '';
    if ($('progAssistantCoordinatorsContainer')) $('progAssistantCoordinatorsContainer').innerHTML = '';
    if ($('progKksHelpersContainer')) $('progKksHelpersContainer').innerHTML = '';
    updateAssistantCoordinatorCount();
    updateKksHelperCount();
    if ($('progStaffCertPanel')) $('progStaffCertPanel').classList.add('hidden');
    $('progFormTitle').textContent = '⚙️ Program, Venue & Resource Person Setup';
    $('progSaveBtn').textContent = '💾 Save Program Configuration';
    $('progCancelEditBtn').classList.add('hidden');
}

function editProgram(id) {
    const p = programById(id);
    if (!p) return;
    resetProgramForm();
    $('progIdConfig').value = p.id;
    $('progNameConfig').value = p.name;
    $('progVenueConfig').value = p.venue;
    $('progFileNoConfig').value = fileNoSuffix(p.fileNo);
    $('progDatesConfig').value = p.dates.join(', ');
    $('progFirstDateConfig').value = p.firstDate;
    $('progHoursConfig').value = p.hours;
    (p.resourcePersons || []).forEach(rp => addResourcePersonConfigRow(rp));
    (p.coordinators || []).forEach(c => addCoordinatorConfigRow(c));
    (p.assistantCoordinators || []).slice(0, MAX_ASSISTANT_COORDINATORS).forEach(c => addAssistantCoordinatorConfigRow(c));
    (p.kksHelpers || []).slice(0, MAX_KKS_HELPERS).forEach(c => addKksHelperConfigRow(c));
    $('progIssueCompletion').checked = !!p.issueCompletion;
    $('progIssueAttendance').checked = !!p.issueAttendance;
    $('progFormTitle').textContent = `✏️ Editing: ${p.name}`;
    $('progSaveBtn').textContent = '💾 Update Program';
    $('progCancelEditBtn').classList.remove('hidden');
    renderStaffCertPanel(p.id);
    $('programConfigForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openStaffCertsForProgram(id) {
    editProgram(id);
    if ($('progStaffCertPanel')) $('progStaffCertPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStaffCertPanel(programId) {
    const panel = $('progStaffCertPanel');
    const list = $('progStaffCertList');
    if (!panel || !list) return;
    const rows = (state.staffCerts || []).filter(s => Number(s.programId) === Number(programId));
    if (!rows.length) {
        panel.classList.add('hidden');
        list.innerHTML = '';
        return;
    }
    panel.classList.remove('hidden');
    list.innerHTML = rows.map(s => {
        const role = s.role === 'coordinator' ? 'Coordinating Officer'
            : (s.role === 'assistant' ? 'Assistant Coordinating Officer'
                : (s.role === 'kks' ? 'සහායක / කම්කරු (KKS)' : 'Lecturer'));
        const ready = !!s.showAttendance;
        return `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 border rounded">
            <div class="text-xs">
                <div class="font-bold text-indigo-950">${esc(s.name)} <span class="text-slate-500 font-normal">(${esc(role)})</span></div>
                <div class="font-mono text-[10px] text-slate-600">${esc(s.nic)}${s.field ? ' · ' + esc(s.field) : ''}</div>
                <div class="text-[10px] ${ready ? 'text-emerald-700 font-bold' : 'text-amber-700'}">${ready ? 'Certificate ready' : 'Tick Attendance and save to publish'}</div>
            </div>
            <button type="button" ${ready ? '' : 'disabled'} onclick="previewStaffAttendanceCert(${s.id})" class="bg-amber-600 disabled:opacity-40 text-white text-[10px] font-bold px-3 py-2 rounded">Download / Print</button>
        </div>`;
    }).join('');
}

async function previewStaffAttendanceCert(staffCertId) {
    const s = (state.staffCerts || []).find(x => Number(x.id) === Number(staffCertId));
    if (!s) { notify('Staff certificate not found. Save the program again.', 'error'); return; }
    switchTab('attendance-cert');
    $('attNicInput').value = s.nic;
    await searchAttendanceRecords();
    const sel = $('attProgSelect');
    const want = `s-${s.id}`;
    if ([...sel.options].some(o => o.value === want)) {
        sel.value = want;
        generateAttendanceCertSlip();
    }
}

async function handleSaveProgramConfig(e) {
    e.preventDefault();
    const id = $('progIdConfig').value;
    const payload = {
        id: id ? parseInt(id, 10) : 0,
        name: $('progNameConfig').value.trim(),
        venue: $('progVenueConfig').value.trim(),
        fileNo: fullFileNo($('progFileNoConfig').value),
        dates: parseDateList($('progDatesConfig').value),
        hours: parseInt($('progHoursConfig').value, 10) || 0,
        issueCompletion: $('progIssueCompletion').checked,
        issueAttendance: $('progIssueAttendance').checked,
        resourcePersons: [],
        coordinators: [],
        assistantCoordinators: [],
        kksHelpers: [],
        resourceRenames: [],
    };
    qsa('.resource-person-row').forEach(row => {
        const input = row.querySelector('.resource-person-input');
        const typed = input ? input.value.trim() : '';
        if (!typed) return;
        const original = input.dataset.original || '';
        const existing = resourceNameByKey().get(personKey(typed));
        let name = existing || typed;
        if (original && existing && personKey(original) === personKey(typed) && typed !== existing) {
            payload.resourceRenames.push({ from: existing, to: typed });
            name = typed;
        }
        payload.resourcePersons.push({
            name,
            nic: convertNicFormat(row.querySelector('.resource-person-nic')?.value || ''),
            field: (row.querySelector('.resource-person-field')?.value || '').trim(),
        });
    });
    qsa('.coordinator-row').forEach(row => {
        const nic = convertNicFormat(row.querySelector('.coordinator-nic')?.value || '');
        const name = (row.querySelector('.coordinator-name')?.value || '').trim();
        if (!nic || !name) return;
        payload.coordinators.push({
            nic,
            name,
            designation: (row.querySelector('.coordinator-designation')?.value || '').trim() || 'Training Coordinating Officer',
            office: (row.querySelector('.coordinator-office')?.value || '').trim(),
        });
    });
    qsa('.assistant-coordinator-row').forEach(row => {
        if (payload.assistantCoordinators.length >= MAX_ASSISTANT_COORDINATORS) return;
        const nic = convertNicFormat(row.querySelector('.assistant-nic')?.value || '');
        const name = (row.querySelector('.assistant-name')?.value || '').trim();
        if (!nic || !name) return;
        payload.assistantCoordinators.push({
            nic,
            name,
            designation: 'Assistant Coordinating Officer',
            office: '',
        });
    });
    if (qsa('.assistant-coordinator-row').length > MAX_ASSISTANT_COORDINATORS) {
        notify(`You can add at most ${MAX_ASSISTANT_COORDINATORS} assistant coordinating officers.`, 'error');
        return;
    }
    qsa('.kks-helper-row').forEach(row => {
        if (payload.kksHelpers.length >= MAX_KKS_HELPERS) return;
        const nicRaw = String(row.querySelector('.kks-nic')?.value || '').trim().split(/\s+[—\-–]\s+/)[0];
        const nic = convertNicFormat(nicRaw);
        const name = (row.querySelector('.kks-name')?.value || '').trim();
        if (!nic || !name) return;
        payload.kksHelpers.push({
            nic,
            name,
            designation: (row.querySelector('.kks-designation')?.value || '').trim() || 'කම්කරු (KKS)',
            office: (row.querySelector('.kks-office')?.value || '').trim(),
        });
    });
    if (qsa('.kks-helper-row').length > MAX_KKS_HELPERS) {
        notify(`You can add at most ${MAX_KKS_HELPERS} සහායක (KKS) helpers per program.`, 'error');
        return;
    }
    try {
        const res = await post('save_program', payload);
        state.programs = res.programs;
        if (res.resourcePersons) state.resourcePersons = res.resourcePersons;
        if (res.staffCerts) state.staffCerts = res.staffCerts;
        updateProgramDropdowns();
        renderMasterResourcePersonsTable();
        populateYearSelector();
        const savedId = id ? parseInt(id, 10) : (res.programs.find(p => p.name === payload.name && p.firstDate === payload.dates[0]) || {}).id;
        resetProgramForm();
        notify(id ? 'Program updated (linked records were updated too).' : 'Program saved to the database.');
        if (id) await reloadRecords();
        renderConfiguredProgramsTable();
        if (savedId) {
            editProgram(savedId);
            notify('Staff certificates are listed below the form when Attendance is ticked.', 'info');
        }
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function deleteProgram(id) {
    const p = programById(id);
    if (!p || !confirm(`Delete program "${p.name}"?`)) return;
    try {
        const res = await post('delete_program', { id });
        state.programs = res.programs;
        updateProgramDropdowns();
        renderConfiguredProgramsTable();
        notify('Program deleted.');
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ===================== Add training record =====================

const officerCache = {};

async function lookupOfficer(nic) {
    if (!nic || nic.length < 10) return null;
    if (nic in officerCache) return officerCache[nic];
    try {
        const res = await api('lookup_officer', { params: { nic } });
        officerCache[nic] = res.officer;
        return res.officer;
    } catch (e) {
        return null;
    }
}

function applyOfficerGender(gender) {
    const el = $('genderInput');
    const note = $('genderLockNote');
    if (!el) return;
    const locked = gender === 'Female' || gender === 'Male';
    el.value = locked ? gender : '';
    el.disabled = locked;
    el.classList.toggle('bg-slate-100', locked);
    el.classList.toggle('bg-white', !locked);
    if (note) note.classList.toggle('hidden', !locked);
}

const autoFillOfficer = debounce(async nic => {
    if (!nic || nic.length < 10) {
        if (!nic) applyOfficerGender('');
        return;
    }
    const o = await lookupOfficer(nic);
    if (convertNicFormat($('nicInput').value) !== nic) return;
    if (o) {
        showOfficerField('nameInput', o.name || '');
        showOfficerField('designationInput', designationCanonicalName(o.designation || '') || (o.designation || ''));
        showOfficerField('officeInput', officeCanonicalName(o.office || '') || (o.office || ''));
        $('phoneInput').value = o.phone || '';
        if (o.gender === 'Female' || o.gender === 'Male') applyOfficerGender(o.gender);
        else if (!$('genderInput').value) applyOfficerGender('');
        else $('genderInput').disabled = false;
        $('nicFormatNotice').textContent = `NIC: ${nic} — details loaded from the database ✓`;
    } else {
        applyOfficerGender('');
    }
}, 400);

function useFeedbackPhrase(phrase) {
    const el = $('feedbackInput');
    if (!el) return;
    const cur = el.value.trim();
    if (!cur) el.value = phrase;
    else if (!cur.toLowerCase().includes(phrase.toLowerCase())) el.value = cur.replace(/[.\s]+$/, '') + '. ' + phrase;
    el.focus();
}

function handleNicSmartInput(val) {
    const converted = convertNicFormat(val);
    const notice = $('nicFormatNotice');
    if (notice) {
        notice.textContent = converted && converted !== val.trim().toUpperCase() && converted.length === 12
            ? `Converted Smart NIC: ${converted}` : (converted ? `NIC: ${converted}` : '');
    }
    autoFillOfficer(converted);
}

async function handleSingleSubmit(e) {
    e.preventDefault();
    const program = programById($('trainingNameSelect').value);
    if (!program) { notify('Please select a training program from the list.', 'error'); return; }
    if (!programOpenForRecord(program)) {
        notify('This program can only be submitted from its last day until one week later.', 'error');
        updateProgramDropdowns();
        onProgramSelected();
        return;
    }
    if ($('genderInput').value !== 'Female' && $('genderInput').value !== 'Male') {
        notify('Select Female or Male.', 'error');
        return;
    }
    const feedbackText = $('feedbackInput') ? $('feedbackInput').value.trim() : '';
    if (!feedbackText) {
        notify('Feedback / Constructive Comments is required. Choose a phrase or type a comment.', 'error');
        if ($('feedbackInput')) $('feedbackInput').focus();
        return;
    }

    const payload = {
        nic: convertNicFormat($('nicInput').value),
        name: readOfficerField('nameInput'),
        designation: readOfficerField('designationInput'),
        office: readOfficerField('officeInput'),
        phone: $('phoneInput').value.trim(),
        gender: $('genderInput').value,
        programId: program.id,
        foodRating: parseInt($('foodRatingInput').value, 10),
        coordinationRating: parseInt($('coordinationRatingInput').value, 10),
        feedback: feedbackText,
        lecturerEvals: qsa('select[name="lecturerRating"]').map(sel => ({ lecturer: sel.getAttribute('data-lecturer'), rating: parseInt(sel.value, 10) })),
    };

    const btn = $('saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving to database...';
    try {
        const res = await post('save_record', payload);
        officerCache[payload.nic] = { nic: payload.nic, name: payload.name, designation: payload.designation, office: payload.office, phone: payload.phone, gender: payload.gender };
        if (state.user && res.record.year === state.year) state.records.unshift(res.record);
        state.offices.push(payload.office);
        state.designations.push(payload.designation);
        const known = state.officers.findIndex(o => o.nic === payload.nic);
        if (known >= 0) state.officers[known] = officerCache[payload.nic];
        else if (state.user) state.officers.push(officerCache[payload.nic]);
        updateOfficeDropdowns();
        notify(res.record.confirmed
            ? 'Training record saved and confirmed.'
            : 'Training record saved. MDTU will confirm your attendance before certificates can be downloaded.');
        $('addTrainingForm').reset();
        applyOfficerGender('');
        $('nicFormatNotice').textContent = '';
        onProgramSelected();
    } catch (err) {
        delete officerCache[payload.nic];
        notify(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Training Record & Evaluation';
    }
}

// ===================== Offices =====================

function allOffices() {
    const byKey = {};
    [
        ...state.offices,
        ...state.staffMatrix.map(m => m.office),
        ...state.records.map(r => r.office),
        ...state.progress.map(p => p.office),
        ...state.officers.map(o => o.office),
    ].filter(Boolean).forEach(raw => {
        const key = officeKey(raw);
        if (!key) return;
        byKey[key] = byKey[key] ? preferOfficeLabel(byKey[key], raw) : officeCanonicalName(raw);
    });
    return Object.values(byKey).sort((a, b) => a.localeCompare(b));
}

function updateOfficeDropdowns() {
    const offices = allOffices();
    const opts = offices.map(o => `<option value="${esc(o)}">${esc(tx(o))}</option>`).join('');
    [['officeReportSelect', '<option value="">-- Choose Office --</option>'],
     ['officeDesignationSelect', '<option value="all">All offices</option>'],
     ['presOfficeSelect', '<option value="all">All offices</option>'],
     ['pdrOfficeSelect', '<option value="all">සියලු කාර්යාල</option>'],
     ['dashProgressOffice', '<option value="all">All Offices</option>'],
     ['dutyOfficeSelect', '<option value="">-- Choose Office --</option>'],
     ['pendingOfficeSelect', '<option value="">-- Choose Office --</option>'],
     ['completedOfficeSelect', '<option value="">-- Choose Office --</option>']].forEach(([id, first]) => {
        const el = $(id);
        if (!el) return;
        el.classList.add('notranslate');
        const prev = el.value;
        el.innerHTML = first + opts;
        if ([...el.options].some(o => o.value === prev)) el.value = prev;
    });
    fillSuperuserSelect();
    if ($('officeDatalist')) $('officeDatalist').innerHTML = offices.map(o => `<option value="${esc(tx(o))}">`).join('');

    const designations = [...new Set([...state.designations, ...state.records.map(r => r.designation)].filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    if ($('designationDatalist') && designations.length) $('designationDatalist').innerHTML = designations.map(d => `<option value="${esc(tx(d))}">`).join('');
    if ($('officerNameDatalist')) $('officerNameDatalist').innerHTML = state.officers.map(o => `<option value="${esc(tx(o.name))}">${esc(o.nic)}</option>`).join('');
    refreshOfficerNicDatalist();
}

/** Picking a known officer name (staff only) fills NIC, designation and office. */
function onOfficerNameChosen() {
    const name = $('nameInput').value.trim().toLowerCase();
    const matches = state.officers.filter(o => o.name.toLowerCase() === name || tx(o.name).toLowerCase() === name);
    if (matches.length !== 1) return;
    const o = matches[0];
    $('nameInput').dataset.src = o.name || '';
    if (!$('nicInput').value.trim()) {
        $('nicInput').value = o.nic;
        $('nicFormatNotice').textContent = `NIC: ${o.nic} — details loaded from the database ✓`;
    }
    if (!$('designationInput').value.trim()) showOfficerField('designationInput', o.designation || '');
    if (!$('officeInput').value.trim()) showOfficerField('officeInput', o.office || '');
    if (!$('phoneInput').value.trim()) $('phoneInput').value = o.phone || '';
    if (o.gender === 'Female' || o.gender === 'Male') applyOfficerGender(o.gender);
}

// ===================== Report helpers =====================

/** One row per officer with total confirmed hours (absent days removed). */
function officerTotals(records) {
    const map = new Map();
    records.forEach(r => {
        if (!r.confirmed) return;
        let o = map.get(r.nic);
        if (!o) {
            o = { nic: r.nic, name: r.name, designation: r.designation, office: r.office, hours: 0, programs: 0 };
            map.set(r.nic, o);
        }
        o.hours += effHours(r);
        o.programs += 1;
    });
    return [...map.values()].sort((a, b) => a.office.localeCompare(b.office) || a.name.localeCompare(b.name));
}

function statusBadge(hours) {
    const done = hours >= TARGET_HOURS;
    return `<span class="px-2 py-0.5 rounded text-[10px] font-bold ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${done ? 'Completed' : 'Incomplete'}</span>`;
}

/** Short band: 12+ hours, 6–11 hours, or none (<6). */
function hourBand(hours) {
    const h = Number(hours) || 0;
    if (h >= TARGET_HOURS) return 12;
    if (h >= 6) return 6;
    return 0;
}

function hourBandBadge(hours) {
    const band = hourBand(hours);
    if (band === 12) return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">පැය 12+</span>';
    if (band === 6) return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">පැය 6</span>';
    return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">නැත (0)</span>';
}

function sortByHourBand(a, b) {
    const ba = hourBand(a.hours), bb = hourBand(b.hours);
    if (ba !== bb) return bb - ba; // 12, then 6, then 0
    return String(a.name || '').localeCompare(String(b.name || ''));
}

function emptyRow(cols, text) {
    return `<tr><td colspan="${cols}" class="p-4 text-center text-slate-400">${esc(text)}</td></tr>`;
}

/** Expand short / misspelt post titles to the full English cadre name. */
const DESIGNATION_ALIASES = {
    'dev officer': 'Development Officer',
    'dev. officer': 'Development Officer',
    'dev.officer': 'Development Officer',
    'devo.off': 'Development Officer',
    'devo off': 'Development Officer',
    'devo. off': 'Development Officer',
    'development off': 'Development Officer',
    'development oficer': 'Development Officer',
    'developmet officer': 'Development Officer',
    'deverlopment officer': 'Development Officer',
    'devolopment officer': 'Development Officer',
    'development oficier': 'Development Officer',
    'dev.off': 'Development Officer',
    'mana ass': 'Management Assistant',
    'mana. ass': 'Management Assistant',
    'mana.ass': 'Management Assistant',
    'mana. ass.': 'Management Assistant',
    'managment assistant': 'Management Assistant',
    'mangement assistant': 'Management Assistant',
    'management asst': 'Management Assistant',
    'management asst.': 'Management Assistant',
    'management servise officer': 'Management Service Officer',
    'mangement service officer': 'Management Service Officer',
    'management service oficer': 'Management Service Officer',
    'agri.instructor': 'Agriculture Instructor',
    'agri. instructor': 'Agriculture Instructor',
    'agri instructor': 'Agriculture Instructor',
    'p.k.s': 'Office Assistant',
    'p.k.s.': 'Office Assistant',
    'pks': 'Office Assistant',
    'k.k.s': 'Office Assistant',
    'k.k.s.': 'Office Assistant',
    'kks': 'Office Assistant',
    'labrary assistant': 'Library Assistant',
    'library asst': 'Library Assistant',
    'sanitory labourer': 'Sanitary Labourer',
    'health labour': 'Health Labourer',
    'co-perativedevelopmentofficer': 'Co-operative Development Officer',
    'cooperative development officer': 'Co-operative Development Officer',
};

function designationStripDecorators(name) {
    let s = String(name || '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    s = s.replace(/[*#«»]+/g, '').trim();
    let prev;
    do {
        prev = s;
        s = s.replace(/\s*[\(\[][^\)\]]*[\)\]]\s*$/g, '').trim();
    } while (s !== prev);
    s = s.replace(/\s*[-–—]\s*\d{4}(\s*\(.*\))?\s*$/i, '').trim();
    s = s.replace(/\s*[-–—]\s*(new|gt|old)\s*$/i, '').trim();
    return s;
}

/**
 * Merge cadre title variants into one post, e.g.
 * "Development Officer", "Development Officer (2022)", "Dev. Officer" → "Development Officer".
 */
function designationKey(name) {
    let s = designationStripDecorators(name);
    if (!s) return '';
    s = s.replace(/\./g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    s = s.replace(/\s+/g, ' ');
    if (DESIGNATION_ALIASES[s]) return DESIGNATION_ALIASES[s].toLowerCase();
    // Compact key without spaces for glued abbreviations: Devo.Off → devooff already handled; DevelopmentOficer
    const compact = s.replace(/\s+/g, '');
    if (DESIGNATION_ALIASES[compact]) return DESIGNATION_ALIASES[compact].toLowerCase();
    return s;
}

function designationCanonicalName(name) {
    let s = designationStripDecorators(name);
    if (!s) return '';
    const lookup = s.replace(/\./g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (DESIGNATION_ALIASES[lookup]) return DESIGNATION_ALIASES[lookup];
    const compact = lookup.replace(/\s+/g, '');
    if (DESIGNATION_ALIASES[compact]) return DESIGNATION_ALIASES[compact];
    // Prefer known full titles when key matches an alias target
    const key = designationKey(s);
    const aliasHit = Object.values(DESIGNATION_ALIASES).find(v => v.toLowerCase() === key);
    if (aliasHit) return aliasHit;
    return s;
}

function preferDesignationLabel(a, b) {
    const ca = designationCanonicalName(a);
    const cb = designationCanonicalName(b);
    const score = (t) => {
        let n = String(t || '');
        let s = n.length;
        if (/\./.test(n)) s -= 20; // penalise abbreviations
        if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(n)) s += 8; // Title Case full words
        return s;
    };
    if (score(ca) !== score(cb)) return score(ca) >= score(cb) ? ca : cb;
    return ca.localeCompare(cb) <= 0 ? ca : cb;
}

/** Spelling / department roll-ups so one office is not listed twice. */
const OFFICE_ALIASES = {
    'department of ayurveda': 'Department of Provincial Ayurveda',
    'department of provincial ayurveda': 'Department of Provincial Ayurveda',
    'duputy chief secretarys officepersoneltraining': 'Deputy Chief Secretary\'s Office (Personnel & Training)',
    'duputy chief secretarys office personnel training': 'Deputy Chief Secretary\'s Office (Personnel & Training)',
    'deputy chief secretarys office personel training': 'Deputy Chief Secretary\'s Office (Personnel & Training)',
    'deputy chief secretarys office personnel training': 'Deputy Chief Secretary\'s Office (Personnel & Training)',
};

function officeNormalizeRaw(name) {
    let s = String(name || '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    s = s.replace(/[’']/g, "'");
    s = s.replace(/\bPersonel\b/gi, 'Personnel');
    s = s.replace(/\bDuputy\b/gi, 'Deputy');
    s = s.replace(/\bDeparth?ment\b/gi, 'Department');
    s = s.replace(/\bMethuva\b/gi, 'Department');
    s = s.replace(/\s*\(\s*/g, ' (').replace(/\s*\)\s*/g, ') ').replace(/\s+/g, ' ').trim();
    return s;
}

function officeFingerprint(name) {
    return officeNormalizeRaw(name)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** True when this office is an Ayurveda department sub-unit (dispensary / hospital / drug unit). */
function isAyurvedaSubOffice(name) {
    const s = officeFingerprint(name);
    if (!s) return false;
    if (!/ayurveda|ayurvedic|\u0d86\u0dba\u0dd4\u0dbb\u0dca\u0dc0\u0dda\u0daf/.test(s)) return false;
    if (/^department of (provincial )?ayurveda$/.test(s)) return true;
    return /dispensary|hospital|drugs? manufacturing|welagedara|central dispensary/.test(s)
        || /^department of (provincial )?ayurveda /.test(s)
        || /^ayurveda (central )?dispensary/.test(s)
        || /^ayurveda hospital/.test(s);
}

/**
 * Merge key for offices: spelling variants + all Ayurveda sub-units → one department.
 */
function officeKey(name) {
    const raw = officeNormalizeRaw(name);
    if (!raw) return '';
    if (isAyurvedaSubOffice(raw)) return 'department of provincial ayurveda';
    let fp = officeFingerprint(raw);
    if (OFFICE_ALIASES[fp]) return officeFingerprint(OFFICE_ALIASES[fp]);
    // Common glued form without spaces around punctuation
    const glued = fp.replace(/\s+/g, '');
    for (const [k, v] of Object.entries(OFFICE_ALIASES)) {
        if (k.replace(/\s+/g, '') === glued) return officeFingerprint(v);
    }
    return fp;
}

function officeCanonicalName(name) {
    const raw = officeNormalizeRaw(name);
    if (!raw) return '';
    if (isAyurvedaSubOffice(raw)) return 'Department of Provincial Ayurveda';
    const fp = officeFingerprint(raw);
    if (OFFICE_ALIASES[fp]) return OFFICE_ALIASES[fp];
    const glued = fp.replace(/\s+/g, '');
    for (const [k, v] of Object.entries(OFFICE_ALIASES)) {
        if (k.replace(/\s+/g, '') === glued) return v;
    }
    return raw;
}

function preferOfficeLabel(a, b) {
    const ca = officeCanonicalName(a);
    const cb = officeCanonicalName(b);
    if (ca === 'Department of Provincial Ayurveda' || cb === 'Department of Provincial Ayurveda') {
        return 'Department of Provincial Ayurveda';
    }
    const score = (t) => {
        let n = String(t || '');
        let s = n.length;
        if (/Personel|Duputy|Departhment/i.test(n)) s -= 30;
        if (/Personnel|Deputy|Department/i.test(n)) s += 10;
        return s;
    };
    if (score(ca) !== score(cb)) return score(ca) >= score(cb) ? ca : cb;
    return ca.localeCompare(cb) <= 0 ? ca : cb;
}

function sameOffice(a, b) {
    const ka = officeKey(a);
    const kb = officeKey(b);
    return !!ka && ka === kb;
}

/** Merge count maps so variant titles share one bucket. */
function mergeDesignationCounts(counts) {
    if (!counts || typeof counts !== 'object') return null;
    const byKey = {};
    const labelFor = {};
    Object.keys(counts).forEach(raw => {
        const key = designationKey(raw);
        if (!key) return;
        const label = designationCanonicalName(raw);
        labelFor[key] = labelFor[key] ? preferDesignationLabel(labelFor[key], label) : label;
        byKey[key] = (byKey[key] || 0) + (parseInt(counts[raw], 10) || 0);
    });
    const out = {};
    Object.keys(byKey).forEach(key => { out[labelFor[key] || key] = byKey[key]; });
    return out;
}

function staffCountsFor(office) {
    const key = officeKey(office);
    if (!key) return null;
    const merged = {};
    state.staffMatrix.filter(m => officeKey(m.office) === key).forEach(m => {
        const part = mergeDesignationCounts(m.counts) || {};
        Object.keys(part).forEach(d => {
            merged[d] = (merged[d] || 0) + (parseInt(part[d], 10) || 0);
        });
    });
    return Object.keys(merged).length ? mergeDesignationCounts(merged) : null;
}

function sameDesignation(a, b) {
    const ka = designationKey(a);
    const kb = designationKey(b);
    return !!ka && ka === kb;
}

/**
 * Office (non-MDTU) trainings from progress submissions for the year.
 * Per designation: participants credited by that event's hours (≥12 → c12, ≥6 → c6),
 * plus personHours = Σ(eventHours × participants) for year-end coverage reports.
 * Variant titles are merged (same rules as cadre).
 */
function officeTrainingStats(office) {
    const byKey = {};
    const labelFor = {};
    state.progress.filter(p => sameOffice(p.office, office) && parseInt(p.year, 10) === state.year).forEach(p => {
        (p.otherTrainings || []).forEach(t => {
            const by = t && t.byDesignation && typeof t.byDesignation === 'object' ? t.byDesignation : null;
            if (!by) return;
            const hours = parseInt(t.hours, 10) || 0;
            Object.keys(by).forEach(desig => {
                const n = parseInt(by[desig], 10) || 0;
                if (n <= 0 || !desig) return;
                const key = designationKey(desig);
                if (!key) return;
                const label = designationCanonicalName(desig);
                labelFor[key] = labelFor[key] ? preferDesignationLabel(labelFor[key], label) : label;
                const s = byKey[key] || (byKey[key] = { c12: 0, c6: 0, personHours: 0, participants: 0 });
                s.personHours += hours * n;
                s.participants += n;
                if (hours >= TARGET_HOURS) s.c12 += n;
                else if (hours >= 6) s.c6 += n;
            });
        });
    });
    const map = {};
    Object.keys(byKey).forEach(key => { map[labelFor[key] || key] = byKey[key]; });
    return map;
}

/** @deprecated alias — headcount treated as 12h only when event hours ≥ 12 */
function officeTrainingCompletions(office) {
    const stats = officeTrainingStats(office);
    const map = {};
    Object.keys(stats).forEach(d => { map[d] = stats[d].c12; });
    return map;
}

function mdtuOfficeHoursTotal(office) {
    return officerTotals(state.records.filter(r => sameOffice(r.office, office)))
        .reduce((sum, o) => sum + (Number(o.hours) || 0), 0);
}

function officeInHouseHoursTotal(office) {
    const stats = officeTrainingStats(office);
    return Object.values(stats).reduce((sum, s) => sum + (s.personHours || 0), 0);
}

function designationBreakdown(office) {
    const officers = officerTotals(state.records.filter(r => sameOffice(r.office, office)));
    const counts = staffCountsFor(office);
    const officeStats = officeTrainingStats(office);
    const desigs = counts
        ? Object.keys(counts)
        : [...new Set([
            ...DEFAULT_DESIGNATIONS,
            ...officers.map(o => designationCanonicalName(o.designation)).filter(Boolean),
            ...Object.keys(officeStats),
        ].map(d => designationCanonicalName(d)).filter(Boolean))];
    // Deduplicate fallback list by designation key
    const seen = new Set();
    const uniqueDesigs = [];
    desigs.forEach(d => {
        const key = designationKey(d);
        if (!key || seen.has(key)) return;
        seen.add(key);
        uniqueDesigs.push(designationCanonicalName(d) || d);
    });
    return uniqueDesigs.map(d => {
        const list = officers.filter(o => sameDesignation(o.designation, d));
        const fromRecords12 = list.filter(o => o.hours >= TARGET_HOURS).length;
        const fromRecords6 = list.filter(o => o.hours >= 6 && o.hours < TARGET_HOURS).length;
        const total = counts && counts[d] !== undefined ? parseInt(counts[d], 10) || 0 : list.length;
        const offKey = Object.keys(officeStats).find(k => sameDesignation(k, d));
        const off = (offKey && officeStats[offKey]) || { c12: 0, c6: 0, personHours: 0 };
        const c12 = Math.min(total, fromRecords12 + (off.c12 || 0));
        const c6 = Math.min(Math.max(0, total - c12), fromRecords6 + (off.c6 || 0));
        return {
            designation: d,
            total,
            c12,
            c6,
            none: Math.max(0, total - c12 - c6),
            incomplete: Math.max(0, total - c12),
            mdtuHours: list.reduce((s, o) => s + (Number(o.hours) || 0), 0),
            officeHours: off.personHours || 0,
        };
    }).filter(d => d.total > 0); // hide designations with no cadre / no officers
}

// ===================== Dashboard & reports =====================

function renderDashboard() {
    const officers = officerTotals(state.records);
    const completed = officers.filter(o => o.hours >= TARGET_HOURS).length;
    const rate = officers.length ? Math.round(completed / officers.length * 100) : 0;
    $('statTotalOfficers').textContent = officers.length;
    $('statCompletedOfficers').textContent = completed;
    $('statIncompleteOfficers').textContent = officers.length - completed;
    $('statCompletionRate').textContent = rate + '%';
    if ($('officerDirCountBadge')) {
        $('officerDirCountBadge').textContent = `Officers in directory: ${(state.officers || []).length.toLocaleString()}`;
    }
    renderDashboardProgress();
    const pending = state.records.filter(r => !r.confirmed).length;
    $('overviewTableBody').innerHTML = (pending ? `<tr><td colspan="6" class="p-3 bg-amber-50 text-amber-900 font-bold">⏳ ${pending} record(s) waiting for attendance confirmation — <a href="#" onclick="switchTab('confirm-attendance'); return false;" class="underline">confirm now</a></td></tr>` : '')
        + (officers.length ? officers.map(o => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 font-semibold">${escTx(o.office)}</td>
                <td class="p-3 font-mono">${esc(o.nic)}</td>
                <td class="p-3 font-bold">${escTx(o.name)}</td>
                <td class="p-3">${escTx(o.designation)}</td>
                <td class="p-3 text-center font-bold text-indigo-900">${o.hours}h</td>
                <td class="p-3 text-center">${statusBadge(o.hours)}</td>
            </tr>`).join('') : emptyRow(6, `No confirmed training records for ${state.year}.`));
}

function generateOfficeReport() {
    const office = $('officeReportSelect').value;
    const officers = officerTotals(state.records.filter(r => sameOffice(r.office, office)));
    const header = $('officeReportHeader');
    const section = $('officeCompletedSection');
    if (!office) { header.classList.add('hidden'); section.classList.add('hidden'); return; }
    $('officeReportTitle').textContent = tx(office);
    $('officeReportSubtitle').textContent = `Training Hours Report - ${state.year} (confirmed attendance)`;
    header.classList.remove('hidden');
    section.classList.remove('hidden');
    $('officeCompletedTableBody').innerHTML = officers.length ? officers.map(o => `
        <tr class="border-b">
            <td class="p-2 font-mono">${esc(o.nic)}</td>
            <td class="p-2 font-bold">${escTx(o.name)}</td>
            <td class="p-2">${escTx(o.designation)}</td>
            <td class="p-2 text-center font-bold ${o.hours >= TARGET_HOURS ? 'text-emerald-700' : 'text-amber-700'}">${o.hours}h</td>
        </tr>`).join('') : emptyRow(4, 'No confirmed records for this office.');
}

function generateOfficeDesignationReport() {
    const office = $('officeDesignationSelect').value || 'all';
    const header = $('officeDesignationHeader');
    const tbody = $('officeDesignationTableBody');
    if (!tbody) return;
    const offices = office === 'all' ? allOffices() : [office];
    $('odReportTitle').textContent = office === 'all' ? 'All offices' : tx(office);
    $('odReportSubtitle').textContent = `Designation-wise Hours Summary (${state.year})`;
    header.classList.remove('hidden');
    const rows = offices.flatMap(off => designationBreakdown(off).map(d => ({ office: off, ...d })));
    tbody.innerHTML = rows.length ? rows.map(d => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 font-bold text-indigo-950">${escTx(d.office)}</td>
            <td class="p-3 font-bold">${escTx(d.designation)}</td>
            <td class="p-3 text-center font-bold">${d.total}</td>
            <td class="p-3 text-center text-emerald-700 font-bold">${d.c12}</td>
            <td class="p-3 text-center text-rose-700 font-bold">${d.incomplete}</td>
            <td class="p-3 text-center text-amber-700 font-bold">${d.c6}</td>
            <td class="p-3 text-center font-bold text-indigo-800">${d.mdtuHours || 0}h</td>
            <td class="p-3 text-center font-bold text-teal-800">${d.officeHours || 0}h</td>
        </tr>`).join('') : emptyRow(8, 'No offices to show.');
}

function officeStaffTotal(office) {
    const counts = staffCountsFor(office);
    if (counts && Object.keys(counts).length) {
        return Object.values(counts).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
    }
    const fromDirectory = state.officers.filter(o => sameOffice(o.office, office)).length;
    if (fromDirectory) return fromDirectory;
    return officerTotals(state.records.filter(r => sameOffice(r.office, office))).length;
}

/**
 * Per-office cadre + completion counts (12 / 6 / 0) for one training source:
 * mdtu | office (non-MDTU) | all (either path). No hour-total columns.
 */
function officeCountRowForMode(office, mode) {
    const staff = Math.max(officeStaffTotal(office), 0);
    const officers = officerTotals(state.records.filter(r => sameOffice(r.office, office)));
    const officeStats = officeTrainingStats(office);
    const parts = designationBreakdown(office);
    const cadre = parts.length ? parts.reduce((s, d) => s + d.total, 0) : Math.max(staff, officers.length);

    if (mode === 'mdtu') {
        const c12 = officers.filter(o => o.hours >= TARGET_HOURS).length;
        const c6 = officers.filter(o => o.hours >= 6 && o.hours < TARGET_HOURS).length;
        return { office, staff: cadre, c12, c6, none: Math.max(0, cadre - c12 - c6) };
    }

    if (mode === 'office') {
        let c12 = 0, c6 = 0;
        if (parts.length) {
            parts.forEach(d => {
                const offKey = Object.keys(officeStats).find(k => sameDesignation(k, d.designation));
                const off = (offKey && officeStats[offKey]) || { c12: 0, c6: 0 };
                const oc12 = Math.min(d.total, off.c12 || 0);
                const oc6 = Math.min(Math.max(0, d.total - oc12), off.c6 || 0);
                c12 += oc12;
                c6 += oc6;
            });
        } else {
            c12 = Math.min(cadre, Object.values(officeStats).reduce((s, x) => s + (x.c12 || 0), 0));
            c6 = Math.min(Math.max(0, cadre - c12), Object.values(officeStats).reduce((s, x) => s + (x.c6 || 0), 0));
        }
        return { office, staff: cadre, c12, c6, none: Math.max(0, cadre - c12 - c6) };
    }

    // ALL — MDTU + office combined (designationBreakdown already merges both)
    if (parts.length) {
        return {
            office,
            staff: cadre,
            c12: parts.reduce((s, d) => s + d.c12, 0),
            c6: parts.reduce((s, d) => s + d.c6, 0),
            none: parts.reduce((s, d) => s + d.none, 0),
        };
    }
    const c12 = officers.filter(o => o.hours >= TARGET_HOURS).length;
    const c6 = officers.filter(o => o.hours >= 6 && o.hours < TARGET_HOURS).length;
    return { office, staff: cadre, c12, c6, none: Math.max(0, cadre - c12 - c6) };
}

function renderOfficeCountReport() {
    const body = $('officeCountTableBody');
    const head = $('officeCountTableHead');
    if (!body) return;
    const mode = ($('officeCountHoursMode') && $('officeCountHoursMode').value) || 'all';
    const modeLabel = mode === 'mdtu'
        ? 'MDTU ප්‍රතිපාදන වලින් පුහුණුව ලැබූ නිලධාරීන්'
        : mode === 'office'
            ? 'කාර්යාලීය (non-MDTU) ප්‍රතිපාදන වලින් පුහුණුව ලැබූ නිලධාරීන්'
            : 'පුහුණු තොරතුරු (ALL) — දෙවර්ගයෙන්ම සම්පූර්ණ කළ ගණන';
    const offices = allOffices();
    if ($('officeCountSubtitle')) {
        $('officeCountSubtitle').textContent = `Training year ${state.year} · ${offices.length} office(s) · ${modeLabel}`;
    }

    if (head) {
        head.innerHTML = `<tr class="bg-indigo-900 text-white font-bold">
            <th class="p-3">කාර්යාලය</th>
            <th class="p-3 text-center">සම්පූර්ණ නිලධාරී ගණන (කාඩර්)</th>
            <th class="p-3 text-center text-emerald-300">පැය 12+ සම්පූර්ණ</th>
            <th class="p-3 text-center text-amber-300">පැය 6 සම්පූර්ණ</th>
            <th class="p-3 text-center text-rose-300">එකක්වත් නැති (0)</th>
        </tr>`;
    }

    const rows = offices.map(office => officeCountRowForMode(office, mode));
    const totals = rows.reduce((t, r) => ({
        staff: t.staff + r.staff, c12: t.c12 + r.c12, c6: t.c6 + r.c6, none: t.none + r.none,
    }), { staff: 0, c12: 0, c6: 0, none: 0 });

    body.innerHTML = (rows.length ? rows.map(r => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 font-bold text-indigo-950">${escTx(r.office)}</td>
            <td class="p-3 text-center font-bold">${r.staff}</td>
            <td class="p-3 text-center font-bold text-emerald-700">${r.c12}</td>
            <td class="p-3 text-center font-bold text-amber-700">${r.c6}</td>
            <td class="p-3 text-center font-bold text-rose-700">${r.none}</td>
        </tr>`).join('') : '') + (rows.length ? `
        <tr class="bg-indigo-50 font-black">
            <td class="p-3">Total</td>
            <td class="p-3 text-center">${totals.staff}</td>
            <td class="p-3 text-center text-emerald-800">${totals.c12}</td>
            <td class="p-3 text-center text-amber-800">${totals.c6}</td>
            <td class="p-3 text-center text-rose-800">${totals.none}</td>
        </tr>` : emptyRow(5, 'No offices to show.'));
}

function participationPrograms() {
    return state.programs.filter(p => {
        const dates = (p.dates && p.dates.length) ? p.dates : [p.firstDate].filter(Boolean);
        return dates.some(d => String(d).slice(0, 4) === String(state.year));
    }).sort((a, b) => String(a.firstDate).localeCompare(String(b.firstDate)) || String(a.name).localeCompare(String(b.name)));
}

function programHeldDates(p) {
    if (!p) return [];
    const dates = (p.dates && p.dates.length) ? p.dates.slice() : (p.firstDate ? [p.firstDate] : []);
    return dates.filter(Boolean).sort();
}

function shortDayLabel(d) {
    return parseISO(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dayShareHours(program, dates) {
    const n = Math.max(1, (dates || []).length);
    const total = parseInt(program && program.hours, 10) || (HOURS_PER_DAY * n);
    return Math.round(total / n) || HOURS_PER_DAY;
}

function safeFilePart(value) {
    return String(value || 'Program').replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'Program';
}

function syncParticipationFilters(resetDate) {
    const sel = $('plProgram');
    const dateSel = $('plDate');
    if (!sel || !dateSel) return;
    const prev = sel.value;
    const programs = participationPrograms();
    sel.innerHTML = programs.length
        ? '<option value="">-- Choose a program --</option>' + programs.map(p => `<option value="${p.id}">${esc(p.name)} — ${esc(formatProgramDates(programHeldDates(p)))}</option>`).join('')
        : `<option value="">No programs in ${state.year}</option>`;
    if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
    const prog = programById(sel.value);
    const dates = programHeldDates(prog);
    const prevDate = resetDate ? '' : dateSel.value;
    dateSel.innerHTML = prog
        ? `<option value="">All dates of this program (${esc(formatProgramDates(dates))})</option>`
            + dates.map(d => `<option value="${esc(d)}">${esc(shortDayLabel(d))} only</option>`).join('')
        : '<option value="">Select a program first</option>';
    if ([...dateSel.options].some(o => o.value === prevDate)) dateSel.value = prevDate;
}

function onParticipationProgramChange() {
    syncParticipationFilters(true);
    renderParticipationList(true);
}

function officerByNic(nic) {
    const key = convertNicFormat(nic);
    return state.officers.find(o => convertNicFormat(o.nic) === key) || null;
}

function genderLabel(value) {
    if (value === 'Female') return 'ස්ත්‍රී';
    if (value === 'Male') return 'පුරුෂ';
    return value || '';
}

function participationPerson(rec) {
    const officer = officerByNic(rec.nic);
    return {
        name: tx(rec.name || (officer && officer.name) || ''),
        nic: rec.nic || '',
        designation: tx(rec.designation || (officer && officer.designation) || ''),
        phone: (officer && officer.phone) || '',
        gender: genderLabel(officer && officer.gender),
        office: tx(rec.office || (officer && officer.office) || ''),
    };
}

function participationSelection() {
    const prog = programById($('plProgram') && $('plProgram').value);
    const dates = programHeldDates(prog);
    const day = ($('plDate') && $('plDate').value) || '';
    const records = prog ? state.records.filter(r => String(r.programId) === String(prog.id)) : [];
    const shownDates = day ? dates.filter(d => d === day) : dates;
    const rows = records.filter(r => !day || !absentList(r).includes(day))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }));
    return { prog, dates, day, shownDates, rows, share: dayShareHours(prog, dates) };
}

function renderParticipationList(filtersReady) {
    const head = $('participationListHead');
    const body = $('participationListBody');
    if (!head || !body) return;
    if (!filtersReady) syncParticipationFilters(false);
    const { prog, dates, day, shownDates, rows, share } = participationSelection();
    if (!prog) {
        $('plReportTitle').textContent = `Training year ${state.year}`;
        $('plReportSubtitle').textContent = 'Choose a program to build this list.';
        head.innerHTML = '';
        body.innerHTML = emptyRow(9, 'Choose a program. Each program is downloaded on its own, for the dates it was held.');
        return;
    }
    const absentOnDay = day ? state.records.filter(r => String(r.programId) === String(prog.id) && absentList(r).includes(day)).length : 0;
    $('plReportTitle').textContent = tx(prog.name);
    $('plReportSubtitle').textContent = [
        prog.fileNo ? `File No: ${prog.fileNo}` : '',
        prog.venue ? `Venue: ${tx(prog.venue)}` : '',
        `Dates held: ${formatProgramDates(day ? [day] : dates)}`,
        `Officers: ${rows.length}`,
        day && absentOnDay ? `Absent this day: ${absentOnDay}` : '',
    ].filter(Boolean).join('  |  ');

    const dateHeaders = shownDates.map(d => `<th class="p-2 text-center">${esc(shortDayLabel(d))}</th>`).join('');
    head.innerHTML = `<tr class="bg-indigo-900 text-white font-bold">
        <th class="p-2">#</th>
        <th class="p-2">නම</th>
        <th class="p-2">ජාතික හැඳුනුම්පත් අංකය</th>
        <th class="p-2">තනතුර</th>
        <th class="p-2">දුරකථන අංකය</th>
        <th class="p-2">ස්ත්‍රී/පුරුෂ භාවය</th>
        <th class="p-2">කාර්යාලයේ නම</th>
        ${dateHeaders}<th class="p-2 text-center">Hours</th>
    </tr>`;
    const cols = 8 + shownDates.length;
    body.innerHTML = rows.length ? rows.map((r, i) => {
        const person = participationPerson(r);
        const absent = absentList(r);
        const cells = shownDates.map(d => {
            const present = !absent.includes(d);
            return `<td class="p-2 text-center font-bold ${present ? 'text-emerald-700' : 'text-rose-600'}">${present ? 'Present' : 'Absent'}</td>`;
        }).join('');
        const hours = day ? share : effHours(r);
        return `<tr class="border-b hover:bg-slate-50">
            <td class="p-2 font-mono">${i + 1}</td>
            <td class="p-2 font-bold text-indigo-950">${esc(person.name)}${r.confirmed ? '' : ' <span class="text-[9px] text-amber-600">(pending)</span>'}</td>
            <td class="p-2 font-mono font-bold">${esc(person.nic)}</td>
            <td class="p-2">${esc(person.designation)}</td>
            <td class="p-2 font-mono">${esc(person.phone)}</td>
            <td class="p-2">${esc(person.gender)}</td>
            <td class="p-2">${esc(person.office)}</td>
            ${cells}
            <td class="p-2 text-center font-bold text-emerald-700">${hours}h</td>
        </tr>`;
    }).join('') : emptyRow(cols, day ? 'No officer was present on this date.' : 'No participants are recorded for this program.');
}

function participationSheetRows() {
    const { prog, dates, day, shownDates, rows, share } = participationSelection();
    if (!prog) return null;
    const header = ['#', 'නම', 'ජාතික හැඳුනුම්පත් අංකය', 'තනතුර', 'දුරකථන අංකය', 'ස්ත්‍රී/පුරුෂ භාවය', 'කාර්යාලයේ නම', ...shownDates.map(shortDayLabel), 'Hours'];
    const data = rows.map((r, i) => {
        const person = participationPerson(r);
        const absent = absentList(r);
        return [i + 1, person.name, person.nic, person.designation, person.phone, person.gender, person.office,
            ...shownDates.map(d => absent.includes(d) ? 'Absent' : 'Present'),
            day ? share : effHours(r)];
    });
    return {
        prog, day, dates, rows,
        aoa: [
            ['Management Development and Training Unit - NWP'],
            ['Participations List'],
            ['Program', tx(prog.name)],
            ['File No', prog.fileNo || ''],
            ['Venue', tx(prog.venue || '')],
            ['Dates held', formatProgramDates(day ? [day] : dates)],
            ['Officers', rows.length],
            [],
            header,
            ...data,
        ],
    };
}

function participationFileBase() {
    const { prog, day } = participationSelection();
    if (!prog) return '';
    return `Participations_List_${safeFilePart(prog.name)}_${day || 'all-dates'}_${state.year}`;
}

function downloadParticipationExcel() {
    const sheet = participationSheetRows();
    if (!sheet) { notify('Choose a program first.', 'error'); return; }
    if (typeof XLSX === 'undefined') { notify('Excel library could not be loaded. Check your internet connection.', 'error'); return; }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheet.aoa);
    ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 42 }];
    const headerRow = sheet.aoa.findIndex(row => row[1] === 'නම');
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = headerRow + 1; r <= range.e.r; r++) {
        [2, 4].forEach(c => {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            if (!cell) return;
            cell.t = 's';
            cell.v = String(cell.v ?? '');
        });
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Participations');
    XLSX.writeFile(wb, `${participationFileBase()}.xlsx`);
}

function downloadParticipationPDF() {
    if (!participationSelection().prog) { notify('Choose a program first.', 'error'); return; }
    if (typeof html2pdf === 'undefined') { notify('PDF library could not be loaded. Check your internet connection.', 'error'); return; }
    html2pdf().from($('participationListContainer')).set({
        margin: 8,
        filename: `${participationFileBase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    }).save();
}

function filterTrainingNamelist() {
    const d = $('tnFilterDate').value;
    const p = $('tnFilterProgram').value;
    const prog = programById(p);
    const filtered = state.records.filter(r =>
        (!p || String(r.programId) === p) && (!d || (r.programDates || [r.date]).includes(d)));
    $('tnReportHeader').classList.remove('hidden');
    $('tnReportTitle').textContent = prog ? prog.name : 'All Training Programs';
    $('tnReportSubtitle').textContent = `${prog ? 'Venue: ' + prog.venue + ' | ' : ''}Date: ${d || 'All Dates'} | Total Officers: ${filtered.length}`;
    $('trainingNamelistTableBody').innerHTML = filtered.length ? filtered.map((r, i) => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 font-mono">${i + 1}</td>
            <td class="p-3 font-mono font-bold">${esc(r.nic)}</td>
            <td class="p-3 font-bold text-indigo-950">${escTx(r.name)}${r.confirmed ? '' : ' <span class="text-[9px] text-amber-600">(pending)</span>'}</td>
            <td class="p-3">${escTx(r.office)}</td>
            <td class="p-3">${escTx(r.designation)}</td>
            <td class="p-3 text-center font-bold text-emerald-700">${effHours(r)}h</td>
        </tr>`).join('') : emptyRow(6, 'No participants match these filters.');
}

function renderDutyReport() {
    const body = $('dutyReportTableBody');
    if (!body) return;
    const office = ($('dutyOfficeSelect') && $('dutyOfficeSelect').value) || '';
    if (!office) {
        body.innerHTML = emptyRow(6, 'කාර්යාලයක් තෝරන්න. එහි නිලධාරීන් පැය 12+ / පැය 6 / නැත අනුපිළිවෙලින් පෙන්වයි.');
        return;
    }
    const officers = officerTotals(state.records.filter(r => sameOffice(r.office, office))).slice().sort(sortByHourBand);
    body.innerHTML = officers.length ? officers.map((o, i) => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 font-mono">${i + 1}</td>
            <td class="p-3 font-mono">${esc(o.nic)}</td>
            <td class="p-3 font-bold">${escTx(o.name)}</td>
            <td class="p-3">${escTx(o.designation)}</td>
            <td class="p-3 text-center font-bold text-indigo-900">${o.hours}h</td>
            <td class="p-3 text-center">${hourBandBadge(o.hours)}</td>
        </tr>`).join('') : emptyRow(6, 'No confirmed training records for this office.');
}

function renderPendingReport() {
    const body = $('pendingGroupedTableBody');
    if (!body) return;
    const office = ($('pendingOfficeSelect') && $('pendingOfficeSelect').value) || '';
    const meta = $('pendingReportMeta');
    if (!office) {
        if (meta) meta.textContent = '';
        body.innerHTML = emptyRow(5, 'කාර්යාලයක් තෝරන්න. එහි පැය 12 සම්පූර්ණ නොකළ නිලධාරීන්ගේ තොරතුරු පෙන්වයි.');
        return;
    }
    const list = officerTotals(state.records.filter(r => sameOffice(r.office, office)))
        .filter(o => o.hours < TARGET_HOURS)
        .sort((a, b) => a.hours - b.hours || String(a.name).localeCompare(String(b.name)));
    if (meta) meta.textContent = `${tx(office)} · Incomplete: ${list.length} · Year ${state.year}`;
    body.innerHTML = list.length ? list.map((o, i) => `
        <tr class="border-b hover:bg-rose-50/40">
            <td class="p-3 font-mono">${i + 1}</td>
            <td class="p-3 font-mono font-bold">${esc(o.nic)}</td>
            <td class="p-3 font-bold text-rose-950">${escTx(o.name)}</td>
            <td class="p-3">${escTx(o.designation)}</td>
            <td class="p-3 text-center font-bold text-rose-700">${o.hours}h</td>
        </tr>`).join('') : emptyRow(5, 'This office has no incomplete officers among confirmed records.');
}

function renderCompletedReport() {
    const body = $('completedTableBody');
    if (!body) return;
    const office = ($('completedOfficeSelect') && $('completedOfficeSelect').value) || '';
    const meta = $('completedReportMeta');
    if (!office) {
        if (meta) meta.textContent = '';
        body.innerHTML = emptyRow(5, 'කාර්යාලයක් තෝරන්න. එහි පැය 12+ සම්පූර්ණ කළ නිලධාරීන්ගේ තොරතුරු පෙන්වයි.');
        return;
    }
    const list = officerTotals(state.records.filter(r => sameOffice(r.office, office)))
        .filter(o => o.hours >= TARGET_HOURS)
        .sort((a, b) => b.hours - a.hours || String(a.name).localeCompare(String(b.name)));
    if (meta) meta.textContent = `${tx(office)} · Completed 12+: ${list.length} · Year ${state.year}`;
    body.innerHTML = list.length ? list.map((o, i) => `
        <tr class="border-b hover:bg-emerald-50/40">
            <td class="p-3 font-mono">${i + 1}</td>
            <td class="p-3 font-mono font-bold">${esc(o.nic)}</td>
            <td class="p-3 font-bold text-emerald-950">${escTx(o.name)}</td>
            <td class="p-3">${escTx(o.designation)}</td>
            <td class="p-3 text-center font-bold text-emerald-700">${o.hours}h</td>
        </tr>`).join('') : emptyRow(5, `No officers in this office have completed ${TARGET_HOURS}+ hours yet.`);
}

function lecturerGrade(avg) {
    if (avg >= 4.5) return 'Excellent';
    if (avg >= 3.75) return 'Very Good';
    if (avg >= 3) return 'Good';
    if (avg >= 2) return 'Fair';
    return 'Poor';
}

/** Per-lecturer rating statistics for the selected program (or all programs of the year). */
function lecturerReportData() {
    const programId = $('resourceProgramSelect') ? $('resourceProgramSelect').value : '';
    const records = state.records.filter(r => !programId || String(r.programId) === programId);
    const stats = {};
    let respondents = 0;
    records.forEach(r => {
        const evals = (r.lecturerEvals || []).map(ev => ({ lecturer: ev.lecturer, rating: Math.round(Number(ev.rating)) }))
            .filter(ev => ev.lecturer && ev.rating >= 1 && ev.rating <= 5);
        if (evals.length) respondents += 1;
        evals.forEach(ev => {
            const name = String(ev.lecturer).trim();
            const s = stats[name] = stats[name] || { name, programs: new Map(), sum: 0, n: 0, counts: [0, 0, 0, 0, 0] };
            const prog = programById(r.programId);
            s.programs.set(r.programId || r.trainingName + r.date, prog ? prog.name : r.trainingName);
            s.sum += ev.rating;
            s.n += 1;
            s.counts[5 - ev.rating] += 1;
        });
    });
    const rows = Object.values(stats).map(s => {
        const avg = s.sum / s.n;
        return { ...s, programNames: [...s.programs.values()].filter(Boolean), avg, pct: Math.round(avg / 5 * 100), grade: lecturerGrade(avg) };
    }).sort((a, b) => b.avg - a.avg || b.n - a.n || a.name.localeCompare(b.name));
    const total = rows.reduce((t, r) => t + r.n, 0);
    const overall = total ? rows.reduce((t, r) => t + r.sum, 0) / total : 0;
    return { programId, program: programById(programId), rows, total, overall, respondents };
}

function renderResourceReport() {
    const { rows, total, overall, respondents } = lecturerReportData();
    const card = (label, value, color) => `<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${esc(label)}</p><p class="text-2xl font-black ${color}">${value}</p></div>`;
    $('resourceSummary').innerHTML = card('Lecturers evaluated', rows.length, 'text-indigo-900')
        + card('Total evaluations', total, 'text-emerald-700')
        + card('Participants who rated', respondents, 'text-amber-600')
        + card('Overall average', total ? `${overall.toFixed(2)} / 5` : '-', 'text-rose-700');
    $('resourceReportTableBody').innerHTML = rows.length ? rows.map((r, i) => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-2.5 text-center">${i + 1}</td>
            <td class="p-2.5 font-bold text-indigo-950">${escTx(r.name)}</td>
            <td class="p-2.5 text-[11px]">${r.programNames.map(esc).join('<br>')}</td>
            <td class="p-2.5 text-center font-bold">${r.n}</td>
            ${r.counts.map(c => `<td class="p-2.5 text-center">${c || '-'}</td>`).join('')}
            <td class="p-2.5 text-center font-bold text-amber-600">${r.avg.toFixed(2)}</td>
            <td class="p-2.5 text-center font-bold text-indigo-900">${r.pct}%</td>
            <td class="p-2.5 text-center font-bold">${r.grade}</td>
        </tr>`).join('') : emptyRow(12, 'No lecturer evaluations recorded for this selection.');
}

function lecturerReportFilters(data) {
    const lines = [`Program: ${data.program ? data.program.name : `All programs in ${state.year}`}`];
    if (data.program) lines.push(`File No: ${data.program.fileNo || '-'}    Venue: ${data.program.venue || '-'}    Dates: ${formatProgramDates(data.program.dates)}`);
    lines.push(`Lecturers evaluated: ${data.rows.length}    Total evaluations: ${data.total}    Participants who rated: ${data.respondents}`
        + `    Overall average: ${data.total ? data.overall.toFixed(2) + ' / 5 (' + Math.round(data.overall / 5 * 100) + '%)' : '-'}`);
    lines.push('Rating scale: 5 Excellent, 4 Very Good, 3 Good, 2 Fair, 1 Poor.    Grade by average: 4.50+ Excellent, 3.75+ Very Good, 3.00+ Good, 2.00+ Fair, below 2.00 Poor.');
    return lines;
}

async function lecturerReportPDF(mode) {
    const data = lecturerReportData();
    if (!data.rows.length) { notify('There are no lecturer evaluations for this selection.', 'warning'); return; }
    const printWindow = mode === 'print' ? window.open('', '_blank') : null;
    setBusy(true, 'Preparing PDF...');
    try {
        const center = w => ({ cellWidth: w, halign: 'center' });
        const doc = await buildRegisterPdf({
            title: 'Lecturer Performance & Evaluation Report',
            filters: lecturerReportFilters(data),
            head: ['No', 'Lecturer / Resource Person', 'Programs Conducted', 'Evaluations', 'Rated 5', 'Rated 4', 'Rated 3', 'Rated 2', 'Rated 1', 'Average (out of 5)', 'Percentage', 'Grade'],
            body: data.rows.map((r, i) => [i + 1, r.name, r.programNames.join('\n'), r.n, ...r.counts.map(c => c || '-'), r.avg.toFixed(2), `${r.pct}%`, r.grade]),
            columnStyles: { 0: center(9), 1: { cellWidth: 50, fontStyle: 'bold' }, 2: { cellWidth: 75 }, 3: center(19), 4: center(13), 5: center(13),
                6: center(13), 7: center(13), 8: center(13), 9: center(20), 10: center(19), 11: center(20) },
            signatures: true,
        });
        if (mode === 'print') {
            doc.autoPrint();
            const url = doc.output('bloburl');
            if (printWindow) printWindow.location.href = url; else window.open(url, '_blank');
        } else {
            doc.save(`MDTU_Lecturer_Performance_Report_${todayISO()}.pdf`);
        }
    } catch (err) {
        if (printWindow) printWindow.close();
        notify('Could not create the PDF: ' + err.message, 'error');
    } finally {
        setBusy(false);
    }
}

function lecturerReportExcel() {
    const data = lecturerReportData();
    if (!data.rows.length) { notify('There are no lecturer evaluations for this selection.', 'warning'); return; }
    const rows = data.rows.map((r, i) => ({
        No: i + 1, 'Lecturer / Resource Person': r.name, 'Programs Conducted': r.programNames.join('; '), Evaluations: r.n,
        'Rated 5': r.counts[0], 'Rated 4': r.counts[1], 'Rated 3': r.counts[2], 'Rated 2': r.counts[3], 'Rated 1': r.counts[4],
        'Average (out of 5)': Number(r.avg.toFixed(2)), Percentage: r.pct, Grade: r.grade,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Lecturer Performance');
    XLSX.writeFile(wb, `MDTU_Lecturer_Performance_Report_${todayISO()}.xlsx`);
}

let doughnutChartInstance = null;
let barChartInstance = null;

function renderAnalytics() {
    const p = $('analyticsTrainingSelect').value;
    const prog = programById(p);
    const filtered = state.records.filter(r => !p || p === 'all' || String(r.programId) === p);
    $('analyticsHeaderMeta').textContent = `Program: ${prog ? prog.name : 'All Programs'} | ${prog ? 'Venue: ' + prog.venue + ' | Dates: ' + prog.dates.join(', ') : 'Year: ' + state.year}`;
    $('aStatCount').textContent = filtered.length;

    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const lect = filtered.flatMap(r => (r.lecturerEvals || []).map(e => e.rating));
    const food = filtered.map(r => r.foodRating).filter(Boolean);
    const coord = filtered.map(r => r.coordinationRating).filter(Boolean);
    const aL = avg(lect), aF = avg(food), aC = avg(coord);
    $('aStatLecturer').textContent = `${aL.toFixed(1)} / 5`;
    $('aStatFood').textContent = `${aF.toFixed(1)} / 5`;
    $('aStatCoordination').textContent = `${aC.toFixed(1)} / 5`;

    $('analyticsFeedbackTableBody').innerHTML = filtered.length ? filtered.map(r => `
        <tr class="border-b">
            <td class="p-2.5 font-bold">${esc((r.lecturerEvals || []).map(l => `${l.lecturer} (${l.rating}★)`).join(', ') || '-')}</td>
            <td class="p-2.5 text-center font-bold text-amber-600">${r.foodRating || '-'} ⭐</td>
            <td class="p-2.5 text-center font-bold text-teal-600">${r.coordinationRating || '-'} ⭐</td>
            <td class="p-2.5 text-slate-700">${esc(r.feedback || '-')}</td>
        </tr>`).join('') : emptyRow(4, 'No evaluations for this selection.');

    if (typeof Chart === 'undefined') return;
    const all = [...lect, ...food, ...coord];
    const dist = [all.filter(x => x === 5).length, all.filter(x => x === 4).length, all.filter(x => x === 3).length, all.filter(x => x <= 2).length];
    if (doughnutChartInstance) doughnutChartInstance.destroy();
    doughnutChartInstance = new Chart($('feedbackDoughnutChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['5 Stars', '4 Stars', '3 Stars', '1-2 Stars'], datasets: [{ data: dist, backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'] }] },
        options: { responsive: true, maintainAspectRatio: false },
    });
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart($('quarterlyBarChart').getContext('2d'), {
        type: 'bar',
        data: { labels: ['Lecturer', 'Food', 'Coordination'], datasets: [{ label: 'Average Score (/5)', data: [aL, aF, aC].map(v => +v.toFixed(2)), backgroundColor: ['#4338ca', '#10b981', '#f59e0b'] }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 5 } } },
    });
}

// ===================== Confirm attendance (admin) =====================

function filteredConfirmRecords() {
    const p = $('adminConfirmProgramSelect').value;
    const status = $('adminConfirmStatusSelect').value;
    const q = $('adminConfirmSearch').value.trim().toUpperCase();
    return state.records.filter(r =>
        (!p || String(r.programId) === p) &&
        (!status || (status === 'confirmed' ? r.confirmed : !r.confirmed)) &&
        (!q || r.nic.includes(q) || r.name.toUpperCase().includes(q)));
}

function renderConfirmAttendanceTable() {
    const tbody = $('confirmAttendanceTableBody');
    if (!tbody) return;
    const rows = filteredConfirmRecords();
    $('confirmAttendanceCount').textContent = `${rows.length} record(s) shown · ${state.records.filter(r => !r.confirmed).length} pending in ${state.year}`;
    tbody.innerHTML = rows.length ? rows.map(r => `
        <tr class="border-b align-top ${r.confirmed ? '' : 'bg-amber-50/50'}">
            <td class="p-3 text-center"><input type="checkbox" ${r.confirmed ? 'checked' : ''} onchange="toggleConfirmAttendance(${r.id}, this.checked)" class="w-5 h-5 accent-indigo-900 cursor-pointer" title="Confirm attendance"></td>
            <td class="p-3 text-center"><input type="checkbox" ${r.confirmed && r.showCompletion ? 'checked' : ''} ${r.confirmed ? '' : 'disabled'} onchange="toggleCertificateVisibility(${r.id}, 'showCompletion', this.checked)" class="w-5 h-5 accent-emerald-700 cursor-pointer" title="Show completion certificate to the public"></td>
            <td class="p-3 text-center"><input type="checkbox" ${r.confirmed && r.showAttendance ? 'checked' : ''} ${r.confirmed ? '' : 'disabled'} onchange="toggleCertificateVisibility(${r.id}, 'showAttendance', this.checked)" class="w-5 h-5 accent-amber-600 cursor-pointer" title="Show the attendance certificate"></td>
            <td class="p-3 font-mono">${esc(r.nic)}</td>
            <td class="p-3 font-bold">${escTx(r.name)}<div class="text-[10px] font-normal text-slate-500">${escTx(r.designation)}</div></td>
            <td class="p-3">${escTx(r.office)}</td>
            <td class="p-3">${esc(r.trainingName)}<div class="text-[10px] text-slate-500">📍 ${esc(r.venue || '-')}</div></td>
            <td class="p-3 text-center font-mono">${esc(r.date)}</td>
            <td class="p-3 text-center">
                <input type="text" value="${esc(r.absentDates || '')}" onchange="updateAbsentDates(${r.id}, this.value)" placeholder="${esc((r.programDates || []).join(', '))}" class="w-full p-1.5 text-xs border rounded bg-white font-mono">
            </td>
            <td class="p-3 text-center font-bold">${effHours(r)}/${r.hours}h</td>
            <td class="p-3 text-center"><button onclick="deleteRecord(${r.id})" class="bg-rose-600 text-white px-2 py-1 rounded text-[10px] font-bold">🗑️</button></td>
        </tr>`).join('') : emptyRow(11, 'No records match these filters.');
}

function replaceRecord(rec) {
    const i = state.records.findIndex(r => r.id === rec.id);
    if (i >= 0) state.records[i] = rec;
}

async function toggleConfirmAttendance(id, checked) {
    try {
        const res = await post('update_record', { id, confirmed: checked });
        replaceRecord(res.record);
        notify(checked ? 'Attendance confirmed. Both certificates are published.' : 'Confirmation removed. This officer is taken off the public certificates.', checked ? 'success' : 'info');
    } catch (err) {
        notify(err.message, 'error');
    }
    renderConfirmAttendanceTable();
}

async function toggleCertificateVisibility(id, field, checked) {
    try {
        const res = await post('update_record', { id, [field]: checked });
        replaceRecord(res.record);
        notify(checked ? 'Certificate published.' : 'Certificate hidden from the public.', checked ? 'success' : 'info');
    } catch (err) {
        notify(err.message, 'error');
    }
    renderConfirmAttendanceTable();
}

async function updateAbsentDates(id, value) {
    try {
        const res = await post('update_record', { id, absentDates: value });
        replaceRecord(res.record);
        notify('Absent dates saved.');
    } catch (err) {
        notify(err.message, 'error');
    }
    renderConfirmAttendanceTable();
}

async function confirmAllShown() {
    const ids = filteredConfirmRecords().filter(r => !r.confirmed).map(r => r.id);
    if (!ids.length) { notify('All shown records are already confirmed.', 'info'); return; }
    if (!confirm(`Confirm attendance for ${ids.length} record(s)?`)) return;
    try {
        await post('confirm_bulk', { ids });
        await reloadRecords();
        notify(`${ids.length} record(s) confirmed.`);
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function deleteRecord(id) {
    const r = state.records.find(x => x.id === id);
    if (!r || !confirm(`Delete the record of ${r.name} for "${r.trainingName}"? This cannot be undone.`)) return;
    try {
        await post('delete_record', { id });
        state.records = state.records.filter(x => x.id !== id);
        renderConfirmAttendanceTable();
        notify('Record deleted.');
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ===================== Training history (public) =====================

async function fetchRecordsByNic(rawNic) {
    const nic = convertNicFormat(rawNic);
    if (!nic) throw new Error('Please enter an NIC number.');
    const res = await api('records_by_nic', { params: { nic } });
    if (Array.isArray(res)) return { nic, records: res, staffCerts: [] };
    return { nic, records: res.records || [], staffCerts: res.staffCerts || [] };
}

async function searchOfficerRecords() {
    const resDiv = $('verificationResults');
    const notFound = $('verificationNotFound');
    try {
        const { records } = await fetchRecordsByNic($('verifyNicInput').value);
        if (!records.length) {
            resDiv.classList.add('hidden');
            notFound.classList.remove('hidden');
            return;
        }
        resDiv.classList.remove('hidden');
        notFound.classList.add('hidden');
        const latest = records[0];
        $('vOfficerName').textContent = tx(latest.name);
        $('vOfficerDetails').textContent = `${tx(latest.designation)} - ${tx(latest.office)} (NIC: ${latest.nic})`;
        const confirmed = records.filter(r => r.confirmed);
        const yearHours = confirmed.filter(r => r.year === state.year).reduce((a, r) => a + effHours(r), 0);
        const allHours = confirmed.reduce((a, r) => a + effHours(r), 0);
        $('vTotalHours').textContent = `${yearHours}h / ${allHours}h`;
        $('vHistoryTableBody').innerHTML = records.map((r, i) => `
            <tr class="border-b">
                <td class="p-3">${i + 1}</td>
                <td class="p-3 font-bold">${esc(r.trainingName)}</td>
                <td class="p-3">${esc(r.venue || '-')}</td>
                <td class="p-3 font-mono">${esc((r.programDates || [r.date]).join(', '))}</td>
                <td class="p-3 font-mono text-rose-600">${esc(r.absentDates || '-')}</td>
                <td class="p-3 text-center font-bold text-emerald-700">${effHours(r)}h</td>
                <td class="p-3 text-center">${r.confirmed ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Pending</span>'}</td>
                <td class="p-3 font-mono text-[10px]">${r.confirmed ? `<a href="${esc(verifyUrl(r.certSerial))}" target="_blank" class="text-indigo-700 underline">${esc(r.certSerial)}</a>` : '-'}</td>
            </tr>`).join('');
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ===================== Certificates (attendance + completion) =====================

function currentBaseUrl() {
    return window.location.href.replace(/[?#].*$/, '').replace(/\/[^/]*$/, '');
}

function verifyUrl(serial) {
    const base = (state.settings.publicBaseUrl || currentBaseUrl()).replace(/\/+$/, '');
    return `${base}/verify.php?code=${encodeURIComponent(serial || '')}`;
}

function renderQr(el, text) {
    el.innerHTML = '';
    if (typeof QRCode === 'undefined') {
        el.innerHTML = '<div style="font-size:9px; text-align:center; padding-top:30%;">QR library not loaded</div>';
        return;
    }
    const tmp = document.createElement('div');
    new QRCode(tmp, { text, width: 320, height: 320, colorDark: '#0f172a', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
    const canvas = tmp.querySelector('canvas');
    const img = document.createElement('img');
    img.alt = 'Scan to verify';
    img.src = canvas ? canvas.toDataURL('image/png') : (tmp.querySelector('img') || {}).src || '';
    el.appendChild(img);
}

/** Scales fixed-size A4 certificate sheets down to fit the screen width (mobile friendly). */
function fitCertificates() {
    qsa('.cert-sizer').forEach(sizer => {
        const sheet = sizer.firstElementChild;
        const avail = sizer.parentElement.clientWidth;
        if (!sheet || !avail) return;
        const w = sheet.offsetWidth;
        const h = sheet.offsetHeight;
        const s = Math.min(1, avail / w);
        sheet.style.transform = `scale(${s})`;
        sizer.style.width = `${w * s}px`;
        sizer.style.height = `${h * s}px`;
    });
}

function fitTextWidth(el, maxPx, minPx) {
    let size = maxPx;
    el.style.fontSize = size + 'px';
    while (el.scrollWidth > el.clientWidth && size > minPx) {
        size -= 2;
        el.style.fontSize = size + 'px';
    }
}

function fitTextLines(el, maxPx, minPx, lines) {
    let size = maxPx;
    el.style.fontSize = size + 'px';
    while (el.offsetHeight > size * 1.3 * lines && size > minPx) {
        size -= 1;
        el.style.fontSize = size + 'px';
    }
}

function setCertNotice(id, html, type) {
    const el = $(id);
    if (!html) { el.classList.add('hidden'); return; }
    const cls = { warning: 'bg-amber-50 border-amber-400 text-amber-900', error: 'bg-rose-50 border-rose-400 text-rose-800', success: 'bg-emerald-50 border-emerald-400 text-emerald-800' };
    el.className = `p-3 rounded-lg border text-xs font-bold ${cls[type] || cls.warning}`;
    el.innerHTML = html;
}

function recordOptionLabel(r) {
    if (r.kind === 'staff') {
        const role = r.role === 'coordinator' ? 'Coordinating Officer'
            : (r.role === 'assistant' ? 'Assistant Coordinating Officer'
                : (r.role === 'kks' ? 'සහායක / කම්කරු (KKS)' : 'Lecturer'));
        return `${role}: ${r.trainingName} — ${formatProgramDates(r.programDates)}${r.showAttendance ? '' : ' (not published)'}`;
    }
    return `${r.trainingName} — ${formatProgramDates(r.programDates)}${r.confirmed ? '' : ' (pending confirmation)'}`;
}

function attOptionValue(r) {
    return r.kind === 'staff' ? `s-${r.id}` : `r-${r.id}`;
}

async function searchAttendanceRecords() {
    const sel = $('attProgSelect');
    $('attendanceSlipContainer').classList.add('hidden');
    setAttButtons(false);
    try {
        const { records, staffCerts } = await fetchRecordsByNic($('attNicInput').value);
        attRecords = [
            ...records.map(r => ({ ...r, kind: 'participant' })),
            ...staffCerts.map(s => ({ ...s, kind: 'staff' })),
        ];
        if (!attRecords.length) {
            sel.innerHTML = '<option value="">-- No records found for this NIC --</option>';
            sel.disabled = true;
            setCertNotice('attStatusNotice', 'No training or staff certificate records were found for this NIC number.', 'error');
            return;
        }
        sel.innerHTML = '<option value="">-- Select program --</option>' + attRecords.map(r => `<option value="${attOptionValue(r)}">${esc(recordOptionLabel(r))}</option>`).join('');
        sel.disabled = false;
        setCertNotice('attStatusNotice', '');
        if (attRecords.length === 1) { sel.value = attOptionValue(attRecords[0]); generateAttendanceCertSlip(); }
    } catch (err) {
        notify(err.message, 'error');
    }
}

function setAttButtons(on) {
    $('attDownloadBtn').disabled = !on;
    $('attPrintBtn').disabled = !on;
}

function generateAttendanceCertSlip() {
    const selected = $('attProgSelect').value;
    const r = attRecords.find(x => attOptionValue(x) === selected);
    const container = $('attendanceSlipContainer');
    if (!r) { container.classList.add('hidden'); setAttButtons(false); return; }
    const program = programById(r.programId);
    const published = r.kind === 'staff'
        ? !!r.showAttendance
        : (r.confirmed && r.showAttendance !== false && (!program || program.issueAttendance));
    if (!published) {
        container.classList.add('hidden');
        setAttButtons(false);
        setCertNotice('attStatusNotice', r.kind === 'staff'
            ? 'MDTU has not published the attendance certificate for this coordinating officer / lecturer. Tick Attendance under Programs & Venues and save.'
            : (!r.confirmed
                ? `⏳ Your attendance for "${esc(r.trainingName)}" has not been confirmed by MDTU yet. The certificate will be available after confirmation.`
                : 'MDTU has not published the attendance certificate for this program. Tick it under Programs & Venues and save.'), 'warning');
        return;
    }
    const dates = r.programDates || [r.date];
    const absent = r.kind === 'staff' ? [] : absentList(r);
    const endDate = dates.filter(Boolean).slice().sort().pop() || r.date;
    $('attSlipFileNo').textContent = r.programFileNo || (program && program.fileNo) || '';
    $('attSlipIssueDate').textContent = formatDateLong(endDate);
    $('attSlipName').textContent = tx(r.name);
    $('attSlipNic').textContent = r.nic;
    $('attSlipDesignation').textContent = tx(r.designation || (r.role === 'coordinator' ? 'Training Coordinating Officer'
        : (r.role === 'assistant' ? 'Assistant Coordinating Officer'
            : (r.role === 'kks' ? 'කම්කරු (KKS)'
                : (r.role === 'lecturer' ? 'Lecturer' : '')))));
    $('attSlipOffice').textContent = tx(r.office || '-');
    if ($('attSlipFieldRow')) {
        const showField = r.kind === 'staff' && r.role === 'lecturer' && r.field;
        $('attSlipFieldRow').classList.toggle('hidden', !showField);
        if ($('attSlipField')) $('attSlipField').textContent = showField ? tx(r.field) : '';
    }
    $('attSlipProg').textContent = r.trainingName;
    $('attSlipVenue').textContent = r.venue || (program && program.venue) || '-';
    $('attSlipDates').textContent = formatProgramDates(dates);
    $('attSlipAbsentDates').textContent = absent.map(formatDateLong).join(', ');
    $('attSlipAbsentSection').classList.toggle('hidden', !absent.length);
    $('attSlipHours').textContent = r.kind === 'staff' ? (r.hours || (program && program.hours) || 0) : effHours(r);
    $('attSlipSerial').textContent = r.certSerial;
    $('attSlipVerifyUrl').textContent = `This document is system generated and official attendance can be verified through ${verifyUrl(r.certSerial)}`;
    renderQr($('attSlipQr'), verifyUrl(r.certSerial));
    if ($('attSlipBodyText')) {
        $('attSlipBodyText').textContent = r.kind === 'staff'
            ? (r.role === 'coordinator'
                ? 'This is to certify that the above-named officer served as the Training Coordinating Officer for the above program organized by the Management Development and Training Unit, Chief Secretary’s Office, North Western Province.'
                : (r.role === 'assistant'
                    ? 'This is to certify that the above-named officer served as an Assistant Coordinating Officer for the above program organized by the Management Development and Training Unit, Chief Secretary’s Office, North Western Province.'
                    : (r.role === 'kks'
                        ? 'This is to certify that the above-named officer served as a training support worker / කම්කරු (KKS / සහායක) for the above program organized by the Management Development and Training Unit, Chief Secretary’s Office, North Western Province.'
                        : 'This is to certify that the above-named officer served as a Resource Person / Lecturer for the above program organized by the Management Development and Training Unit, Chief Secretary’s Office, North Western Province.')))
            : 'This is to certify that the above-named officer has successfully participated in the above program organized by the Management Development and Training Unit, Chief Secretary’s Office, North Western Province.';
    }
    if ($('attSlipConfirmText')) {
        $('attSlipConfirmText').textContent = r.kind === 'staff'
            ? '✓ Service officially confirmed and verified by the Deputy Chief Secretary (Training).'
            : '✓ Participation officially confirmed and verified by the Deputy Chief Secretary (Training).';
    }

    setCertNotice('attStatusNotice', '✓ Attendance confirmed. You can download or print the certificate.', 'success');
    container.classList.remove('hidden');
    setAttButtons(true);
    fitCertificates();
}

function currentAttSelection() {
    return attRecords.find(x => attOptionValue(x) === $('attProgSelect').value) || null;
}

async function downloadAttendancePDF() {
    const nic = $('attSlipNic').textContent;
    if (await exportSheet('attendanceCertSheet', 'portrait', `MDTU_Attendance_Certificate_${nic}.pdf`, 'save')) {
        logAttendanceCertificate('pdf');
    }
}

async function printAttendanceCert() {
    if (await exportSheet('attendanceCertSheet', 'portrait', 'MDTU_Attendance_Certificate.pdf', 'print')) {
        logAttendanceCertificate('print');
    }
}

function logAttendanceCertificate(mode) {
    const r = currentAttSelection();
    if (!r) return;
    if (r.kind === 'staff') {
        post('log_certificate', { staffCertId: r.id, type: 'attendance', mode }).catch(() => {});
        return;
    }
    logCertificate(r.id, 'attendance', mode);
}

async function searchOfficerForCert() {
    const sel = $('certProgramSelect');
    $('certificatePreviewArea').classList.add('hidden');
    setCertButtons(false);
    try {
        const { records } = await fetchRecordsByNic($('certNicSearch').value);
        certRecords = records;
        if (!records.length) {
            sel.innerHTML = '<option value="">-- No records found for this NIC --</option>';
            sel.disabled = true;
            setCertNotice('certStatusNotice', 'No training records were found for this NIC number.', 'error');
            return;
        }
        sel.innerHTML = '<option value="">-- Select Attended Program --</option>' + records.map(r => `<option value="${r.id}">${esc(recordOptionLabel(r))}</option>`).join('');
        sel.disabled = false;
        setCertNotice('certStatusNotice', '');
        if (records.length === 1) { sel.value = records[0].id; generateSelectedCertificate(); }
    } catch (err) {
        notify(err.message, 'error');
    }
}

function setCertButtons(on) {
    ['certDownloadBtn', 'certImageBtn', 'certPrintBtn'].forEach(id => { $(id).disabled = !on; });
}

async function generateSelectedCertificate() {
    const r = certRecords.find(x => String(x.id) === $('certProgramSelect').value);
    const area = $('certificatePreviewArea');
    if (!r) { area.classList.add('hidden'); setCertButtons(false); return; }
    const completionProgram = programById(r.programId);
    if (!r.confirmed || r.showCompletion === false || (completionProgram && !completionProgram.issueCompletion)) {
        area.classList.add('hidden');
        setCertButtons(false);
        setCertNotice('certStatusNotice', !r.confirmed
            ? `⏳ Attendance for "${esc(r.trainingName)}" is waiting for MDTU confirmation. The certificate will be available after confirmation.`
            : 'MDTU has not published the completion certificate for this program. Tick it under Programs & Venues and save.', 'warning');
        return;
    }
    if (effHours(r) <= 0) {
        area.classList.add('hidden');
        setCertButtons(false);
        setCertNotice('certStatusNotice', 'This record has no attended hours (all days marked absent), so a completion certificate cannot be issued.', 'error');
        return;
    }
    $('viewStudentName').textContent = tx(r.name);
    $('viewStudentDetails').textContent = `${tx(r.designation)}, ${tx(r.office)}`;
    $('viewCourseTitle').textContent = r.trainingName;
    $('viewCourseVenue').textContent = r.venue || 'MDTU, Kurunegala';
    $('viewCourseDate').textContent = formatProgramDates(r.programDates || [r.date]);
    $('viewCourseHours').textContent = `${effHours(r)} hours`;
    $('certSerialNo').textContent = r.certSerial;
    $('certIssueDate').textContent = formatDateLong(todayISO());
    renderQr($('certQrCode'), verifyUrl(r.certSerial));

    setCertNotice('certStatusNotice', '✓ Attendance confirmed. Certificate ready to download.', 'success');
    area.classList.remove('hidden');
    setCertButtons(true);
    fitCertificates();
    if (document.fonts) await document.fonts.ready;
    fitTextWidth($('viewStudentName'), 56, 30);
    fitTextLines($('viewCourseTitle'), 24, 15, 2);
}

function certFileName(ext) {
    const nic = (certRecords.find(x => String(x.id) === $('certProgramSelect').value) || {}).nic || 'certificate';
    return `MDTU_Certificate_${nic}.${ext}`;
}

async function exportCompletionCert(ext, mode, logMode) {
    if (await exportSheet('certificateContainer', 'landscape', certFileName(ext), mode)) {
        logCertificate($('certProgramSelect').value, 'completion', logMode);
    }
}

function downloadCertPDF() { exportCompletionCert('pdf', 'save', 'pdf'); }
function printCompletionCert() { exportCompletionCert('pdf', 'print', 'print'); }
function downloadCertJPEG() { exportCompletionCert('jpg', 'jpeg', 'jpeg'); }

function waitForImages(root) {
    return Promise.all(Array.from(root.querySelectorAll('img')).filter(img => img.getAttribute('src')).map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = img.onerror = res; })));
}

/** mode: 'save' (PDF download), 'print' (open PDF in a new tab to print), 'jpeg' (image download). */
async function exportSheet(sheetId, orientation, filename, mode) {
    const sheet = $(sheetId);
    if (typeof html2pdf === 'undefined') { notify('PDF library could not be loaded. Check your internet connection.', 'error'); return; }
    const printWindow = mode === 'print' ? window.open('', '_blank') : null;
    setBusy(true, 'Preparing certificate...');
    const prevTransform = sheet.style.transform;
    const touchedImgs = [];
    try {
        if (document.fonts) await document.fonts.ready;
        // html2canvas often mis-reads srcset (@2x) and clips letterhead; force the displayed src only.
        sheet.querySelectorAll('img').forEach(img => {
            touchedImgs.push({
                img,
                srcset: img.getAttribute('srcset'),
                sizes: img.getAttribute('sizes'),
                width: img.style.width,
                maxWidth: img.style.maxWidth,
                height: img.style.height,
            });
            img.removeAttribute('srcset');
            img.removeAttribute('sizes');
            if (img.classList.contains('lh-top-img') || (img.closest && img.closest('.lh-top-img'))) {
                img.style.width = '100%';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }
        });
        await waitForImages(sheet);
        sheet.style.transform = 'none';
        // Force layout at the certificate's fixed A4 pixel size before capture.
        void sheet.offsetWidth;
        const w = sheet.offsetWidth || (orientation === 'landscape' ? 1122 : 793);
        const h = sheet.offsetHeight || (orientation === 'landscape' ? 793 : 1122);
        const bg = sheet.classList.contains('lh-sheet') ? '#ffffff' : '#fffdf6';
        const worker = html2pdf().set({
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: bg,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                width: w,
                height: h,
                windowWidth: w,
                windowHeight: h,
                foreignObjectRendering: false,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation },
            pagebreak: { mode: [] },
        }).from(sheet);

        if (mode === 'jpeg') {
            const canvas = await worker.toCanvas().get('canvas');
            canvas.toBlob(blob => downloadBlob(blob, filename), 'image/jpeg', 0.95);
        } else if (mode === 'print') {
            const url = await worker.output('bloburl');
            if (printWindow) printWindow.location.href = url; else window.open(url, '_blank');
        } else {
            await worker.save();
        }
        return true;
    } catch (err) {
        if (printWindow) printWindow.close();
        notify('Could not create the file: ' + err.message, 'error');
        return false;
    } finally {
        touchedImgs.forEach(t => {
            if (t.srcset != null) t.img.setAttribute('srcset', t.srcset); else t.img.removeAttribute('srcset');
            if (t.sizes != null) t.img.setAttribute('sizes', t.sizes); else t.img.removeAttribute('sizes');
            t.img.style.width = t.width;
            t.img.style.maxWidth = t.maxWidth;
            t.img.style.height = t.height;
        });
        sheet.style.transform = prevTransform;
        setBusy(false);
    }
}

// ===================== Superuser progress =====================

const PROGRESS_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const lookupProgressUser = debounce(async (nic, officeId, desigId, after) => {
    const o = await lookupOfficer(nic);
    if (!o) return;
    showOfficerField(officeId, o.office || '');
    showOfficerField(desigId, o.designation || '');
    if (after) after(o);
}, 400);

function handleSuperuserIdLookup(val) {
    lookupProgressUser(convertNicFormat(val), 'progUserOffice', 'progUserDesignation', o => {
        refreshProgressEntryPanels();
    });
}

function refreshProgressEntryPanels() {
    const office = readOfficerField('progUserOffice');
    autoCalculateOfficeStaffProgress();
    populateAutoMdtuPrograms(office);
    populateOfficeInHouseHistory(office);
    // Rebuild designation inputs on existing office-training rows for the new office cadre.
    qsa('#otherTrainingsContainer .other-train-card').forEach(card => fillOfficeTrainingDesigRows(card));
}

function progressCadreDesignations(office) {
    const counts = staffCountsFor(office) || {};
    return Object.keys(counts)
        .filter(d => (parseInt(counts[d], 10) || 0) > 0)
        .sort((a, b) => a.localeCompare(b))
        .map(d => ({ designation: d, cadre: parseInt(counts[d], 10) || 0 }));
}

function progressSelectedMonthIndex() {
    const m = $('progMonth') ? $('progMonth').value : '';
    const idx = PROGRESS_MONTHS.indexOf(m);
    return idx >= 0 ? idx : -1;
}

function recordInProgressMonth(rec) {
    const want = progressSelectedMonthIndex();
    if (want < 0) return true;
    const raw = rec.date || (Array.isArray(rec.programDates) && rec.programDates[0]) || '';
    const mon = parseInt(String(raw).slice(5, 7), 10);
    if (!mon) return false;
    return mon - 1 === want;
}

function populateAutoMdtuPrograms(officeName) {
    const box = $('progAutoProgramsList');
    if (!box) return;
    const monthName = $('progMonth') ? $('progMonth').value : '';
    if (!officeName) {
        box.innerHTML = '<span class="text-slate-400">කාර්යාලය තෝරා MDTU වැඩසටහන් පෙන්වන්න.</span>';
        return;
    }
    const records = state.records.filter(r => sameOffice(r.office, officeName) && r.confirmed && recordInProgressMonth(r));
    const groups = new Map();
    records.forEach(r => {
        const key = String(r.programId || '') + '|' + String(r.trainingName || '') + '|' + String(r.date || '');
        if (!groups.has(key)) {
            groups.set(key, {
                name: r.trainingName || 'Program',
                date: r.date || '',
                venue: r.venue || '-',
                hours: r.hours || 0,
                count: 0,
            });
        }
        groups.get(key).count += 1;
    });
    const list = [...groups.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.name).localeCompare(String(b.name)));
    if (!list.length) {
        box.innerHTML = `<span class="text-slate-400">${esc(monthName || 'Selected month')} — මෙම කාර්යාලයට තහවුරු කළ MDTU පුහුණු නැත.</span>`;
        return;
    }
    box.innerHTML = `<p class="text-[11px] font-bold text-indigo-900 mb-1">${esc(monthName)} · MDTU වැඩසටහන් ${list.length} · සහභාගී මුළු ${list.reduce((s, p) => s + p.count, 0)}</p>`
        + list.map(p => `<div>✅ ${esc(p.name)} (${esc(p.date)}) @ ${esc(p.venue)} — ${esc(String(p.hours))}h · <strong>සහභාගී: ${p.count}</strong></div>`).join('');
}

function populateOfficeInHouseHistory(officeName) {
    const box = $('progOfficeTrainingsHistory');
    if (!box) return;
    if (!officeName) {
        box.innerHTML = '<span class="text-slate-400">කාර්යාලය තෝරා මෙහි පෙර ඇතුළත් කිරීම් පෙනේ.</span>';
        return;
    }
    const monthOrder = Object.fromEntries(PROGRESS_MONTHS.map((m, i) => [m, i]));
    const rows = [];
    state.progress
        .filter(p => sameOffice(p.office, officeName) && parseInt(p.year, 10) === state.year)
        .forEach(p => {
            (p.otherTrainings || []).forEach(t => {
                if (!t || !t.topic) return;
                const hours = parseInt(t.hours, 10) || 0;
                const by = t.byDesignation && typeof t.byDesignation === 'object' ? t.byDesignation : {};
                const parts = Object.keys(by)
                    .filter(d => (parseInt(by[d], 10) || 0) > 0)
                    .map(d => {
                        const n = parseInt(by[d], 10) || 0;
                        return `${d}: ${n} (${hours * n}h)`;
                    })
                    .join(', ');
                const headcount = Object.values(by).reduce((s, n) => s + (parseInt(n, 10) || 0), 0);
                rows.push({
                    month: p.month || '',
                    topic: t.topic,
                    date: t.date || '',
                    hours,
                    parts,
                    personHours: hours * headcount,
                    sort: monthOrder[p.month] ?? 99,
                });
            });
        });
    rows.sort((a, b) => a.sort - b.sort || String(a.date).localeCompare(String(b.date)));
    if (!rows.length) {
        box.innerHTML = '<span class="text-slate-400">මේ වසරේ මෙම කාර්යාලයට කාර්යාලීය (non-MDTU) පුහුණු ඇතුළත් කර නැත.</span>';
        return;
    }
    const yearOfficeH = rows.reduce((s, r) => s + r.personHours, 0);
    box.innerHTML = `<p class="text-[11px] font-bold text-teal-900 mb-1">මේ වසර · කාර්යාලීය පුහුණු පැය ආවරණය (සහභාගී × පැය): <strong>${yearOfficeH}h</strong></p>`
        + rows.map(r => `
        <div class="border-b border-teal-100 pb-1.5 last:border-0">
            <div class="font-bold text-teal-950">🏫 ${esc(r.month)} — ${esc(r.topic)}${r.date ? ` (${esc(r.date)})` : ''} · වැඩසටහන් පැය ${esc(String(r.hours))}h · ආවරණ ${r.personHours}h</div>
            <div class="text-slate-600">${r.parts ? 'සහභාගී — ' + esc(r.parts) : '<span class="text-slate-400">තනතුරු සහභාගී ගණන් නැත</span>'}</div>
        </div>`).join('');
}

function autoCalculateOfficeStaffProgress() {
    const office = readOfficerField('progUserOffice');
    const tbody = $('progMatrixTableBody');
    const hoursBox = $('progHoursCoverage');
    if (!tbody) return;
    if (!office) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-3 text-center text-slate-400">කාර්යාලය තෝරා කාඩර් බිඳවැටුම පෙන්වන්න.</td></tr>';
        if (hoursBox) hoursBox.innerHTML = '';
        return;
    }
    const rows = designationBreakdown(office);
    tbody.innerHTML = rows.length ? rows.map(d => `
        <tr class="border-b">
            <td class="p-2 font-bold text-slate-800">${escTx(d.designation)}</td>
            <td class="p-2 text-center font-bold">${d.total}</td>
            <td class="p-2 text-center text-emerald-700 font-bold">${d.c12}</td>
            <td class="p-2 text-center text-amber-700 font-bold">${d.c6}</td>
            <td class="p-2 text-center text-rose-700 font-bold">${d.none}</td>
        </tr>`).join('')
        : '<tr><td colspan="5" class="p-3 text-center text-slate-400">මෙම කාර්යාලයට කාඩර් තනතුරු (ගණන &gt; 0) හමු නොවීය. Annual Staff Matrix උඩුගත කර තිබේදැයි පරීක්ෂා කරන්න.</td></tr>';
    // Officer counts (not hours): MDTU-trained, office-trained, combined (ALL).
    const mdtuRow = officeCountRowForMode(office, 'mdtu');
    const officeRow = officeCountRowForMode(office, 'office');
    const allRow = officeCountRowForMode(office, 'all');
    const mdtuN = mdtuRow.c12 + mdtuRow.c6;
    const officeN = officeRow.c12 + officeRow.c6;
    const allN = allRow.c12 + allRow.c6;
    if (hoursBox) {
        hoursBox.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div class="bg-indigo-50 border border-indigo-100 rounded p-2 text-center">
                    <div class="text-[10px] font-bold text-indigo-700 uppercase">MDTU ප්‍රතිපාදන යටතේ පුහුණුව ලැබූ නිලධාරීන්</div>
                    <div class="text-lg font-black text-indigo-950">${mdtuN}</div>
                    <div class="text-[10px] text-slate-500">පැය 12+: ${mdtuRow.c12} · පැය 6: ${mdtuRow.c6}</div>
                </div>
                <div class="bg-teal-50 border border-teal-100 rounded p-2 text-center">
                    <div class="text-[10px] font-bold text-teal-700 uppercase">MDTU නොවන පුහුණුවලින් ලැබූ නිලධාරීන්</div>
                    <div class="text-lg font-black text-teal-950">${officeN}</div>
                    <div class="text-[10px] text-slate-500">පැය 12+: ${officeRow.c12} · පැය 6: ${officeRow.c6}</div>
                </div>
                <div class="bg-emerald-50 border border-emerald-100 rounded p-2 text-center">
                    <div class="text-[10px] font-bold text-emerald-700 uppercase">මුළු ගණන (ALL)</div>
                    <div class="text-lg font-black text-emerald-950">${allN}</div>
                    <div class="text-[10px] text-slate-500">පැය 12+: ${allRow.c12} · පැය 6: ${allRow.c6} · නැති: ${allRow.none}</div>
                </div>
            </div>`;
    }
}

function fillOfficeTrainingDesigRows(card) {
    const wrap = card.querySelector('.other-train-desigs');
    if (!wrap) return;
    const office = readOfficerField('progUserOffice');
    const desigs = progressCadreDesignations(office);
    const prev = {};
    wrap.querySelectorAll('.other-train-desig-row').forEach(row => {
        const name = row.getAttribute('data-desig') || '';
        const input = row.querySelector('.other-train-desig-count');
        if (name) prev[name] = input ? input.value : '';
    });
    if (!desigs.length) {
        wrap.innerHTML = '<p class="text-[11px] text-slate-400">කාර්යාලයේ කාඩර් තනතුරු නැත (හෝ සියල්ල 0). Staff Matrix බලන්න.</p>';
        return;
    }
    wrap.innerHTML = `
        <p class="text-[11px] text-slate-500 mb-1">උඩින් ඇති <strong>පැය</strong> = වැඩසටහනේ කාලය. පහතින් ඇත්තේ තනතුරු අනුව <strong>සහභාගී ගණන</strong> පමණි (පැය නොවේ).</p>
        <table class="w-full text-[11px] border-collapse border border-teal-100">
            <thead><tr class="bg-teal-900 text-white">
                <th class="p-1.5 text-left">තනතුර</th>
                <th class="p-1.5 text-center">කාඩර්</th>
                <th class="p-1.5 text-center">සහභාගී ගණන</th>
            </tr></thead>
            <tbody>
                ${desigs.map(d => `
                    <tr class="border-b other-train-desig-row" data-desig="${esc(d.designation)}">
                        <td class="p-1.5 font-semibold">${escTx(d.designation)}</td>
                        <td class="p-1.5 text-center">${d.cadre}</td>
                        <td class="p-1.5 text-center">
                            <input type="number" min="0" max="${d.cadre}" value="${esc(prev[d.designation] || '0')}"
                                class="other-train-desig-count w-20 p-1 text-xs border rounded text-center font-bold">
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

function addOtherTrainingRow() {
    const box = $('otherTrainingsContainer');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'other-train-card p-3 bg-white border border-teal-200 rounded-lg space-y-2';
    div.innerHTML = `
        <div class="flex gap-2 flex-wrap sm:flex-nowrap items-end">
            <div class="flex-1 min-w-[160px]">
                <label class="block text-[10px] font-bold text-slate-500 mb-0.5">පුහුණු මාතෘකාව *</label>
                <input type="text" placeholder="Office training topic" class="w-full p-2 text-xs border rounded outline-none other-train-topic">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-0.5">දිනය</label>
                <input type="date" class="p-2 text-xs border rounded outline-none other-train-date">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-0.5">වැඩසටහන් පැය</label>
                <input type="number" value="6" min="1" max="50" class="w-20 p-2 text-xs border rounded outline-none other-train-hours" title="Program duration in hours (each participant is credited this many hours)">
            </div>
            <button type="button" onclick="this.closest('.other-train-card').remove()" class="bg-rose-600 text-white px-3 py-2 rounded text-xs font-bold">X</button>
        </div>
        <div class="other-train-desigs overflow-x-auto"></div>`;
    box.appendChild(div);
    fillOfficeTrainingDesigRows(div);
}

function collectOtherTrainings() {
    return qsa('#otherTrainingsContainer .other-train-card').map(card => {
        const topic = (card.querySelector('.other-train-topic')?.value || '').trim();
        const hours = parseInt(card.querySelector('.other-train-hours')?.value, 10) || TARGET_HOURS;
        const date = card.querySelector('.other-train-date')?.value || '';
        const byDesignation = {};
        card.querySelectorAll('.other-train-desig-row').forEach(row => {
            const desig = row.getAttribute('data-desig') || '';
            const n = parseInt(row.querySelector('.other-train-desig-count')?.value, 10) || 0;
            if (desig && n > 0) byDesignation[desig] = n;
        });
        return { topic, hours, date, kind: 'office12h', byDesignation };
    }).filter(t => t.topic);
}

async function handleSaveSuperuserProgress(e) {
    e.preventDefault();
    const form = e.target;
    const otherTrainings = collectOtherTrainings();
    try {
        const file = $('progAttachmentPdf').files[0];
        const pdfAttachment = file ? await fileToDataUrl(file, 10) : null;
        await post('save_progress', {
            year: state.year,
            userId: convertNicFormat($('progUserId').value),
            office: readOfficerField('progUserOffice'),
            designation: readOfficerField('progUserDesignation'),
            month: $('progMonth').value,
            specialRemarks: $('progSpecialRemarks').value.trim(),
            productivityTasks: $('progProductivityTasks').value.trim(),
            otherTrainings,
            pdfAttachment,
        });
        state.progress = await api('get_progress', { params: { year: state.year } });
        Object.keys(progressPdfPageCache).forEach(k => { delete progressPdfPageCache[k]; });
        const office = readOfficerField('progUserOffice');
        const month = $('progMonth').value;
        form.reset();
        $('otherTrainingsContainer').innerHTML = '';
        updateOfficeDropdowns();
        refreshProgressEntryPanels();
        notify('Progress saved. Full details are ready in the Progress Presentation (slides / PDF / Excel).');
        openProgressReport(office, month);
    } catch (err) {
        notify(err.message, 'error');
    }
}

function latestProgressByOfficeMonth(office) {
    const map = {};
    state.progress.filter(p => sameOffice(p.office, office) && parseInt(p.year, 10) === state.year).forEach(p => {
        if (!map[p.month]) map[p.month] = p;
    });
    return map;
}

function inHouseText(sub) {
    return (sub.otherTrainings || []).map(t => {
        const by = t.byDesignation && typeof t.byDesignation === 'object' ? t.byDesignation : {};
        const parts = Object.keys(by).filter(d => (parseInt(by[d], 10) || 0) > 0).map(d => `${d}:${by[d]}`).join(', ');
        return `${t.topic}${t.hours ? ' (' + t.hours + 'h)' : ''}${t.date ? ' ' + t.date : ''}${parts ? ' [' + parts + ']' : ''}`;
    }).join('; ');
}

/** MDTU programs for an office in a named month (January…). */
function mdtuProgramsForOfficeMonth(office, monthName) {
    const want = PROGRESS_MONTHS.indexOf(monthName);
    const records = state.records.filter(r => {
        if (r.office !== office || !r.confirmed) return false;
        if (want < 0) return true;
        const raw = r.date || (Array.isArray(r.programDates) && r.programDates[0]) || '';
        const mon = parseInt(String(raw).slice(5, 7), 10);
        return mon && mon - 1 === want;
    });
    const groups = new Map();
    records.forEach(r => {
        const key = String(r.programId || '') + '|' + String(r.trainingName || '') + '|' + String(r.date || '');
        if (!groups.has(key)) {
            groups.set(key, {
                name: r.trainingName || 'Program',
                date: r.date || '',
                venue: r.venue || '-',
                hours: r.hours || 0,
                count: 0,
            });
        }
        groups.get(key).count += 1;
    });
    return [...groups.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.name).localeCompare(String(b.name)));
}

function officeTrainingsDetailHtml(sub, dark) {
    const list = sub.otherTrainings || [];
    if (!list.length) return `<p class="${dark ? 'text-slate-400' : 'text-slate-500'}">කාර්යාලීය පුහුණු ඇතුළත් කර නැත.</p>`;
    const box = dark ? 'bg-slate-900/60 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800';
    const head = dark ? 'bg-teal-900 text-white' : 'bg-teal-800 text-white';
    return list.map(t => {
        const by = t.byDesignation && typeof t.byDesignation === 'object' ? t.byDesignation : {};
        const rows = Object.keys(by).filter(d => (parseInt(by[d], 10) || 0) > 0);
        const hours = parseInt(t.hours, 10) || 0;
        return `<div class="border ${box} rounded-lg p-2 mb-2">
            <div class="font-bold text-sm">${esc(t.topic || 'Training')}${t.date ? ` · ${esc(t.date)}` : ''} · වැඩසටහන් පැය ${hours}h</div>
            ${rows.length ? `<table class="w-full text-[11px] mt-1 border-collapse">
                <thead><tr class="${head}"><th class="p-1 text-left">තනතුර</th><th class="p-1 text-center">සහභාගී</th><th class="p-1 text-center">ආවරණ පැය</th></tr></thead>
                <tbody>${rows.map(d => {
                    const n = parseInt(by[d], 10) || 0;
                    return `<tr class="border-b border-slate-600/40"><td class="p-1">${esc(d)}</td><td class="p-1 text-center font-bold">${n}</td><td class="p-1 text-center">${hours * n}h</td></tr>`;
                }).join('')}</tbody>
            </table>` : '<p class="text-[11px] opacity-70 mt-1">සහභාගී ගණන් නැත</p>'}
        </div>`;
    }).join('');
}

function cadreBreakdownTableHtml(office, dark) {
    const rows = designationBreakdown(office);
    if (!rows.length) return `<p class="${dark ? 'text-slate-400' : 'text-slate-500'}">කාඩර් තනතුරු නැත.</p>`;
    const head = dark ? 'bg-indigo-900 text-white' : 'bg-indigo-900 text-white';
    const cell = dark ? 'border-slate-600/50 text-slate-100' : 'border-slate-200 text-slate-800';
    return `<table class="w-full text-[11px] border-collapse">
        <thead><tr class="${head}">
            <th class="p-1.5 text-left">තනතුර</th>
            <th class="p-1.5 text-center">කාඩර්</th>
            <th class="p-1.5 text-center text-emerald-200">12+</th>
            <th class="p-1.5 text-center text-amber-200">6h</th>
            <th class="p-1.5 text-center text-rose-200">0</th>
        </tr></thead>
        <tbody>${rows.map(d => `
            <tr class="border-b ${cell}">
                <td class="p-1.5 font-semibold">${escTx(d.designation)}</td>
                <td class="p-1.5 text-center font-bold">${d.total}</td>
                <td class="p-1.5 text-center text-emerald-300 font-bold">${d.c12}</td>
                <td class="p-1.5 text-center text-amber-300 font-bold">${d.c6}</td>
                <td class="p-1.5 text-center text-rose-300 font-bold">${d.none}</td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

function progressSummaryCountsHtml(office, dark) {
    const mdtuRow = officeCountRowForMode(office, 'mdtu');
    const officeRow = officeCountRowForMode(office, 'office');
    const allRow = officeCountRowForMode(office, 'all');
    const card = (title, n, sub, tone) => {
        const bg = dark
            ? (tone === 'indigo' ? 'bg-indigo-950/80 border-indigo-500/40' : tone === 'teal' ? 'bg-teal-950/80 border-teal-500/40' : 'bg-emerald-950/80 border-emerald-500/40')
            : (tone === 'indigo' ? 'bg-indigo-50 border-indigo-200' : tone === 'teal' ? 'bg-teal-50 border-teal-200' : 'bg-emerald-50 border-emerald-200');
        return `<div class="border rounded-lg p-2 text-center ${bg}">
            <div class="text-[9px] font-bold uppercase opacity-80">${title}</div>
            <div class="text-xl font-black">${n}</div>
            <div class="text-[10px] opacity-70">${sub}</div>
        </div>`;
    };
    return `<div class="grid grid-cols-3 gap-2">
        ${card('MDTU පුහුණුව ලැබූ', mdtuRow.c12 + mdtuRow.c6, `12+: ${mdtuRow.c12} · 6: ${mdtuRow.c6}`, 'indigo')}
        ${card('කාර්යාලීය පුහුණුව ලැබූ', officeRow.c12 + officeRow.c6, `12+: ${officeRow.c12} · 6: ${officeRow.c6}`, 'teal')}
        ${card('මුළු (ALL)', allRow.c12 + allRow.c6, `12+: ${allRow.c12} · 6: ${allRow.c6} · 0: ${allRow.none}`, 'emerald')}
    </div>`;
}

function mdtuProgramsSlideHtml(office, monthName, dark) {
    const list = mdtuProgramsForOfficeMonth(office, monthName);
    if (!list.length) return `<p class="${dark ? 'text-slate-400' : 'text-slate-500'}">${esc(monthName)} — තහවුරු කළ MDTU වැඩසටහන් නැත.</p>`;
    return `<p class="text-[11px] mb-1 opacity-80">${esc(monthName)} · වැඩසටහන් ${list.length} · සහභාගී මුළු ${list.reduce((s, p) => s + p.count, 0)}</p>
        <ul class="space-y-1 text-[12px]">${list.map(p =>
            `<li>✅ <strong>${esc(p.name)}</strong> (${esc(p.date)}) @ ${esc(p.venue)} — ${esc(String(p.hours))}h · සහභාගී: <strong>${p.count}</strong></li>`
        ).join('')}</ul>`;
}

const progressPdfPageCache = Object.create(null);
const PROGRESS_PDF_MAX_PAGES = 20;

function progressPdfSrc(sub) {
    const src = sub && sub.pdfAttachment ? String(sub.pdfAttachment).trim() : '';
    if (!src) return '';
    if (src.startsWith('data:') || src.startsWith('blob:') || /^https?:\/\//i.test(src) || src.startsWith('/')) return src;
    return src; // relative uploads/...
}

/** Authenticated force-download URL for a progress submission PDF (by DB id). */
function progressPdfDownloadUrl(sub) {
    const id = sub && sub.id != null ? String(sub.id).trim() : '';
    if (!id) return '';
    return `api.php?action=download_progress_pdf&id=${encodeURIComponent(id)}`;
}

/** Download the attached progress PDF (works from Progress Detail Report / Presentation). */
async function downloadProgressAttachmentPdf(subOrId) {
    const id = typeof subOrId === 'object' && subOrId ? subOrId.id : subOrId;
    if (!id) {
        notify('This submission has no downloadable PDF id.', 'warning');
        return;
    }
    const url = `api.php?action=download_progress_pdf&id=${encodeURIComponent(id)}`;
    setBusy(true, 'Downloading attachment PDF…');
    try {
        const res = await fetch(url, { credentials: 'same-origin', headers: { 'X-MDTU-Request': '1' } });
        const type = (res.headers.get('Content-Type') || '').toLowerCase();
        if (!res.ok || type.includes('application/json')) {
            let msg = `Download failed (${res.status})`;
            try {
                const data = await res.json();
                if (data && data.message) msg = data.message;
            } catch (_) { /* binary error body */ }
            throw new Error(msg);
        }
        const blob = await res.blob();
        let filename = `MDTU_Progress_Attachment_${id}.pdf`;
        const cd = res.headers.get('Content-Disposition') || '';
        const m = cd.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
        if (m && m[1]) filename = decodeURIComponent(m[1].replace(/"/g, '').trim());
        downloadBlob(blob, filename);
        notify('Attachment PDF downloaded.');
    } catch (err) {
        notify(err.message || String(err), 'error');
    } finally {
        setBusy(false);
    }
}
window.downloadProgressAttachmentPdf = downloadProgressAttachmentPdf;

function ensurePdfJsReady() {
    if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js library could not be loaded.');
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
}

/** Rasterize each page of the attached progress PDF (photos/pages) for presentation slides. */
async function progressPdfPageImages(src) {
    if (!src) return [];
    if (progressPdfPageCache[src]) return progressPdfPageCache[src];
    ensurePdfJsReady();
    const loading = pdfjsLib.getDocument({ url: src, withCredentials: false });
    const pdf = await loading.promise;
    const total = Math.min(pdf.numPages || 0, PROGRESS_PDF_MAX_PAGES);
    const images = [];
    for (let i = 1; i <= total; i += 1) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.35 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        images.push(canvas.toDataURL('image/jpeg', 0.88));
    }
    progressPdfPageCache[src] = images;
    return images;
}

const PRES_STYLE_KEY = 'mdtu_pres_style_v1';
const PRES_TEMPLATES = ['classic', 'executive', 'light', 'ribbon'];
const PRES_COLORS = ['amber', 'teal', 'emerald', 'sky', 'crimson', 'gold'];

function getPresentationStyle() {
    let template = $('presTemplateSelect') ? $('presTemplateSelect').value : 'classic';
    let color = $('presColorSelect') ? $('presColorSelect').value : 'amber';
    if (!PRES_TEMPLATES.includes(template)) template = 'classic';
    if (!PRES_COLORS.includes(color)) color = 'amber';
    return { template, color, dark: template !== 'light' };
}

function applyPresentationStyleToDom() {
    const area = $('presentationSlidesArea');
    if (!area) return getPresentationStyle();
    const style = getPresentationStyle();
    area.dataset.presTemplate = style.template;
    area.dataset.presTheme = style.color;
    try {
        localStorage.setItem(PRES_STYLE_KEY, JSON.stringify({ template: style.template, color: style.color }));
    } catch (_) { /* ignore */ }
    const hint = $('presStyleHint');
    if (hint) {
        const tLabel = $('presTemplateSelect') && $('presTemplateSelect').selectedOptions[0]
            ? $('presTemplateSelect').selectedOptions[0].textContent : style.template;
        const cLabel = $('presColorSelect') && $('presColorSelect').selectedOptions[0]
            ? $('presColorSelect').selectedOptions[0].textContent : style.color;
        hint.textContent = `Selected: ${tLabel} · ${cLabel} — preview below; Download PDF uses this look.`;
    }
    return style;
}

function restorePresentationStyleControls() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(PRES_STYLE_KEY) || 'null'); } catch (_) { saved = null; }
    if ($('presTemplateSelect') && saved && PRES_TEMPLATES.includes(saved.template)) {
        $('presTemplateSelect').value = saved.template;
    }
    if ($('presColorSelect') && saved && PRES_COLORS.includes(saved.color)) {
        $('presColorSelect').value = saved.color;
    }
    applyPresentationStyleToDom();
}

function onPresentationStyleChange() {
    applyPresentationStyleToDom();
    renderProgressPresentations();
}

function progressAttachmentSlidesHtml(sub, pageImages, slideNoStart) {
    let n = slideNoStart;
    const slides = [];
    const year = sub.year || state.year;
    const office = sub.office || '';
    const month = sub.month || '';
    const src = progressPdfSrc(sub);
    const { dark } = getPresentationStyle();
    if (!pageImages.length) {
        n += 1;
        slides.push(`
            <div class="slide-card pres-slide p-6 sm:p-8 shadow-2xl flex flex-col justify-between border-4 my-2 w-full">
                <div class="border-b pres-divider pb-3">
                    <h3 class="text-base sm:text-lg font-extrabold pres-title uppercase">📎 Attachment PDF</h3>
                    <p class="text-xs pres-muted">${esc(office)} · ${esc(month)} ${esc(String(year))}</p>
                </div>
                <div class="py-8 text-center space-y-3 text-sm pres-heading">
                    <p>PDF පිටු / ඡායාරූප load කළ නොහැකි විය.</p>
                    ${src ? `<button type="button" onclick="downloadProgressAttachmentPdf(${JSON.stringify(String(sub.id || ''))})" class="inline-block pres-badge font-bold text-xs px-3 py-1.5 rounded">⬇ Download PDF</button>` : ''}
                </div>
                <div class="flex justify-between text-[10px] pres-muted border-t pres-divider pt-3"><span>Attachment</span><span>Slide ${n}</span></div>
            </div>`);
        return { html: slides.join(''), nextSlide: n };
    }
    pageImages.forEach((dataUrl, idx) => {
        n += 1;
        slides.push(`
            <div class="slide-card pres-slide p-4 sm:p-6 shadow-2xl flex flex-col justify-between border-4 my-2 w-full">
                <div class="flex justify-between items-start border-b pres-divider pb-2 gap-2">
                    <div>
                        <h3 class="text-sm sm:text-base font-extrabold pres-title uppercase">📎 Submission attachment</h3>
                        <p class="text-[11px] pres-muted">${esc(office)} · ${esc(month)} ${esc(String(year))} — page ${idx + 1} / ${pageImages.length}</p>
                    </div>
                    <div class="flex gap-1 shrink-0">
                        <button type="button" onclick="downloadProgressAttachmentPdf(${JSON.stringify(String(sub.id || ''))})" class="text-[10px] pres-badge font-bold px-2 py-1 rounded">⬇ Download</button>
                    </div>
                </div>
                <div class="py-2 flex-1 flex items-center justify-center min-h-[360px] pres-panel">
                    <img src="${dataUrl}" alt="Attachment page ${idx + 1}" class="max-h-[460px] max-w-full object-contain rounded shadow-lg" />
                </div>
                <div class="flex justify-between text-[10px] pres-muted border-t pres-divider pt-2"><span>Photos / pages from attached PDF</span><span>Slide ${n}</span></div>
            </div>`);
    });
    return { html: slides.join(''), nextSlide: n };
}

/** Full presentation slide body for one progress submission (all entry fields + attachment pages). */
function progressSubmissionSlidesHtml(sub, slideNoStart, pageImages) {
    let n = slideNoStart;
    const year = sub.year || state.year;
    const office = sub.office || '';
    const month = sub.month || '';
    const slides = [];
    const src = progressPdfSrc(sub);
    const pages = Array.isArray(pageImages) ? pageImages : [];
    const { dark } = getPresentationStyle();

    // Slide A — overview + counts + remarks
    n += 1;
    slides.push(`
        <div class="slide-card pres-slide p-6 sm:p-8 shadow-2xl flex flex-col justify-between border-4 my-2 w-full">
            <div class="flex justify-between items-start border-b pres-divider pb-3 gap-2">
                <div>
                    <h3 class="text-base sm:text-lg font-extrabold pres-title uppercase">${esc(month)} ${esc(String(year))}</h3>
                    <p class="text-xs pres-heading">${esc(office)}</p>
                    <p class="text-[10px] pres-muted mt-0.5">Superuser ID: ${esc(sub.userId || '—')} · තනතුර: ${esc(sub.designation || '—')}</p>
                </div>
                <span class="text-[10px] pres-chip px-2 py-1 rounded">Overview</span>
            </div>
            <div class="py-3 space-y-3 text-sm">
                ${progressSummaryCountsHtml(office, dark)}
                <div class="pres-panel p-3"><p class="text-[10px] font-bold pres-panel-label uppercase">Special remarks &amp; milestones</p><p class="pres-heading whitespace-pre-line">${esc(sub.specialRemarks || 'None')}</p></div>
                <div class="pres-panel p-3"><p class="text-[10px] font-bold pres-panel-label uppercase">Productivity initiatives</p><p class="pres-heading whitespace-pre-line">${esc(sub.productivityTasks || 'None')}</p></div>
                ${src ? `<div class="text-[11px] pres-title flex flex-wrap items-center gap-2">📎 Supporting PDF attached${pages.length ? ` · ${pages.length} page(s) shown in following slides` : ''}
                    <button type="button" onclick="downloadProgressAttachmentPdf(${JSON.stringify(String(sub.id || ''))})" class="pres-badge font-bold text-[10px] px-2 py-0.5 rounded">⬇ Download PDF</button>
                </div>` : ''}
            </div>
            <div class="flex justify-between text-[10px] pres-muted border-t pres-divider pt-3"><span>Submitted ${esc(sub.submittedAt || '')}</span><span>Slide ${n}</span></div>
        </div>`);

    // Slide B — cadre / designation breakdown
    n += 1;
    slides.push(`
        <div class="slide-card pres-slide p-6 sm:p-8 shadow-2xl flex flex-col justify-between border-4 my-2 w-full">
            <div class="border-b pres-divider pb-3">
                <h3 class="text-base sm:text-lg font-extrabold pres-title uppercase">Staff Designation &amp; Hours Summary</h3>
                <p class="text-xs pres-muted">${esc(office)} · Year ${esc(String(year))}</p>
            </div>
            <div class="py-3 overflow-x-auto">${cadreBreakdownTableHtml(office, dark)}</div>
            <div class="flex justify-between text-[10px] pres-muted border-t pres-divider pt-3"><span>${esc(month)}</span><span>Slide ${n}</span></div>
        </div>`);

    // Slide C — MDTU programs that month
    n += 1;
    slides.push(`
        <div class="slide-card pres-slide p-6 sm:p-8 shadow-2xl flex flex-col justify-between border-4 my-2 w-full">
            <div class="border-b pres-divider pb-3">
                <h3 class="text-base sm:text-lg font-extrabold pres-title uppercase">MDTU Auto-Linked Official Programs</h3>
                <p class="text-xs pres-muted">${esc(office)} · ${esc(month)} ${esc(String(year))} (මෙම මාසය පමණයි)</p>
            </div>
            <div class="py-3 pres-heading">${mdtuProgramsSlideHtml(office, month, dark)}</div>
            <div class="flex justify-between text-[10px] pres-muted border-t pres-divider pt-3"><span>MDTU</span><span>Slide ${n}</span></div>
        </div>`);

    // Slide D — office (non-MDTU) trainings entered this month
    n += 1;
    slides.push(`
        <div class="slide-card pres-slide p-6 sm:p-8 shadow-2xl flex flex-col justify-between border-4 my-2 w-full">
            <div class="border-b pres-divider pb-3">
                <h3 class="text-base sm:text-lg font-extrabold pres-title uppercase">කාර්යාලීය පුහුණු (MDTU නොවන)</h3>
                <p class="text-xs pres-muted">${esc(office)} · ${esc(month)} ${esc(String(year))} — මෙම මාසයේ ඇතුළත් කළ තොරතුරු</p>
            </div>
            <div class="py-3 overflow-y-auto max-h-[420px]">${officeTrainingsDetailHtml(sub, dark)}</div>
            <div class="flex justify-between text-[10px] pres-muted border-t pres-divider pt-3"><span>Office trainings</span><span>Slide ${n}</span></div>
        </div>`);

    // Slides E+ — each page / photo from the attached PDF
    if (src) {
        const att = progressAttachmentSlidesHtml(sub, pages, n);
        slides.push(att.html);
        n = att.nextSlide;
    }

    return { html: slides.join(''), nextSlide: n };
}

/** One row per month, January–December, for every selected office. */
function progressMonthRows(officeFilter) {
    const known = [...new Set(state.progress.filter(p => parseInt(p.year, 10) === state.year).map(p => p.office).filter(Boolean))];
    const offices = officeFilter && officeFilter !== 'all' ? [officeFilter] : known.sort((a, b) => a.localeCompare(b));
    if (!offices.length) return emptyRow(6, `No monthly progress submitted for ${state.year}.`);
    return offices.map(office => {
        const byMonth = latestProgressByOfficeMonth(office);
        return PROGRESS_MONTHS.map((month, i) => {
            const sub = byMonth[month];
            const stripe = i % 2 ? 'bg-slate-50' : 'bg-white';
            return `<tr class="border-b ${stripe}">
                <td class="p-2 font-bold text-indigo-950 align-top">${esc(office)}</td>
                <td class="p-2 font-bold align-top whitespace-nowrap">${esc(month)}</td>
                <td class="p-2 align-top whitespace-pre-line">${esc(sub ? (sub.specialRemarks || '—') : '—')}</td>
                <td class="p-2 align-top whitespace-pre-line">${esc(sub ? (sub.productivityTasks || '—') : '—')}</td>
                <td class="p-2 align-top">${esc(sub ? (inHouseText(sub) || '—') : '—')}</td>
                <td class="p-2 text-center align-top font-bold ${sub ? 'text-emerald-700' : 'text-rose-600'}">${sub ? 'Submitted' : 'Not submitted'}</td>
            </tr>`;
        }).join('');
    }).join('');
}

function renderDashboardProgress() {
    const body = $('dashboardProgressBody');
    if (!body) return;
    const office = $('dashProgressOffice') ? $('dashProgressOffice').value : 'all';
    if ($('dashProgressSubtitle')) $('dashProgressSubtitle').textContent = `${state.year} · ${office && office !== 'all' ? office : 'All offices'} · January to December`;
    body.innerHTML = progressMonthRows(office);
}

function superuserChoices() {
    return state.chatUsers.filter(u => u.role === 'superuser').map(u => {
        const id = convertNicFormat(u.username);
        const officer = state.officers.find(o => convertNicFormat(o.nic) === id || o.nic === u.username);
        const bits = [u.username];
        if (officer && officer.name) bits.push(tx(officer.name));
        if (officer && officer.office) bits.push(tx(officer.office));
        return { id: u.username, label: bits.join(' — ') };
    }).sort((a, b) => a.label.localeCompare(b.label));
}

function fillSuperuserSelect() {
    const opts = '<option value="all">සියලු Superusers / All</option>'
        + superuserChoices().map(c => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('');
    ['presUserSelect', 'pdrUserSelect'].forEach(id => {
        const el = $(id);
        if (!el) return;
        const prev = el.value;
        el.innerHTML = opts;
        if ([...el.options].some(o => o.value === prev)) el.value = prev;
    });
}

function onProgressUserChange() {
    if ($('presUserSelect') && $('presUserSelect').value !== 'all' && $('presOfficeSelect')) $('presOfficeSelect').value = 'all';
    renderProgressPresentations();
}

function onProgressOfficeChange() {
    if ($('presOfficeSelect') && $('presOfficeSelect').value !== 'all' && $('presUserSelect')) $('presUserSelect').value = 'all';
    renderProgressPresentations();
}

function progressFilter() {
    const viewType = $('presViewType') ? $('presViewType').value : 'monthly';
    const office = $('presOfficeSelect') ? $('presOfficeSelect').value : 'all';
    const user = $('presUserSelect') ? $('presUserSelect').value : 'all';
    const month = $('presMonthSelect') ? $('presMonthSelect').value : 'all';
    if ($('presMonthWrapper')) $('presMonthWrapper').classList.toggle('hidden', viewType === 'yearly');
    let rows = state.progress.filter(p => parseInt(p.year, 10) === state.year);
    if (user && user !== 'all') {
        const want = convertNicFormat(user);
        rows = rows.filter(p => p.userId === user || convertNicFormat(p.userId) === want);
    } else if (office && office !== 'all') {
        rows = rows.filter(p => sameOffice(p.office, office));
    }
    if (viewType === 'monthly' && month && month !== 'all') rows = rows.filter(p => p.month === month);
    return { viewType, office, month, user, rows };
}

function openMyProgressPresentation() {
    const office = readOfficerField('progUserOffice');
    const month = $('progMonth') ? $('progMonth').value : 'all';
    openProgressReport(office, month);
}

function openProgressReport(office, month) {
    if ($('presViewType')) $('presViewType').value = 'monthly';
    if ($('presMonthSelect')) $('presMonthSelect').value = month || 'all';
    if ($('presUserSelect')) $('presUserSelect').value = 'all';
    const sel = $('presOfficeSelect');
    if (sel && office && [...sel.options].some(o => o.value === office)) sel.value = office;
    switchTab('progress-reports');
}

async function loadProgressAttachmentPages(rows) {
    const map = new Map();
    const jobs = rows.filter(sub => progressPdfSrc(sub)).map(async sub => {
        const key = String(sub.id || '') + '|' + progressPdfSrc(sub);
        try {
            map.set(key, await progressPdfPageImages(progressPdfSrc(sub)));
        } catch (err) {
            console.warn('Progress PDF attachment render failed', err);
            map.set(key, []);
        }
    });
    await Promise.all(jobs);
    return map;
}

function progressAttachmentKey(sub) {
    return String(sub.id || '') + '|' + progressPdfSrc(sub);
}

async function renderProgressPresentations() {
    const body = $('progressMonthTableBody');
    const slides = $('presentationSlidesArea');
    if (!body && !slides) return;
    restorePresentationStyleControls();
    const style = applyPresentationStyleToDom();
    const { viewType, office, month, user, rows } = progressFilter();
    const period = viewType === 'yearly' ? `Year ${state.year}` : (month && month !== 'all' ? `${month} ${state.year}` : `All months ${state.year}`);
    const userLabel = user && user !== 'all' && $('presUserSelect') && $('presUserSelect').selectedOptions[0]
        ? $('presUserSelect').selectedOptions[0].textContent : '';
    const who = userLabel || (!office || office === 'all' ? 'All offices' : office);
    if ($('presReportSubtitle')) $('presReportSubtitle').textContent = `${who} · ${period} · Full submission details + attachments`;
    if (body) {
        body.innerHTML = rows.length ? rows.map(sub => {
            const mdtuN = mdtuProgramsForOfficeMonth(sub.office, sub.month).reduce((s, p) => s + p.count, 0);
            const mRow = officeCountRowForMode(sub.office, 'mdtu');
            const oRow = officeCountRowForMode(sub.office, 'office');
            const aRow = officeCountRowForMode(sub.office, 'all');
            const pdf = progressPdfSrc(sub);
            return `
            <tr class="border-b align-top">
                <td class="p-2 font-bold text-indigo-950">${esc(sub.office)}<div class="text-[10px] text-slate-500 font-normal">${esc(sub.userId || '')}${sub.designation ? ' · ' + esc(sub.designation) : ''}</div></td>
                <td class="p-2 font-bold whitespace-nowrap">${esc(sub.month)}</td>
                <td class="p-2 whitespace-pre-line">${esc(sub.specialRemarks || '—')}</td>
                <td class="p-2 whitespace-pre-line">${esc(sub.productivityTasks || '—')}</td>
                <td class="p-2 text-[11px]">
                    <div><strong>MDTU සහභාගී (${esc(sub.month)}):</strong> ${mdtuN}</div>
                    <div class="mt-1">${esc(inHouseText(sub) || 'කාර්යාලීය පුහුණු නැත')}</div>
                    <div class="mt-1 text-slate-600">MDTU ${mRow.c12 + mRow.c6} · Office ${oRow.c12 + oRow.c6} · ALL ${aRow.c12 + aRow.c6}</div>
                </td>
                <td class="p-2 text-center font-bold text-emerald-700">Submitted${pdf ? `<div class="text-[10px] text-amber-700 mt-1 space-y-1">
                    <button type="button" onclick="downloadProgressAttachmentPdf(${JSON.stringify(String(sub.id || ''))})" class="underline font-bold text-amber-800">⬇ Download PDF</button>
                    ${sub.id ? `<div><a href="${esc(progressPdfDownloadUrl(sub))}" class="underline text-slate-600">Open</a></div>` : ''}
                </div>` : ''}</td>
            </tr>`;
        }).join('') : emptyRow(6, 'No progress submissions for this selection.');
    }
    if (!slides) return;
    if (!rows.length) {
        slides.innerHTML = '<div class="p-8 text-center text-slate-400 font-bold">No progress submissions for this selection.</div>';
        return;
    }
    const needPdf = rows.some(sub => progressPdfSrc(sub));
    if (needPdf) {
        slides.innerHTML = '<div class="p-8 text-center text-amber-200 font-bold">📎 Loading attachment PDF pages / photos into slides…</div>';
    }
    let pageMap = new Map();
    try {
        pageMap = await loadProgressAttachmentPages(rows);
    } catch (err) {
        console.warn(err);
    }
    const offices = [...new Set(rows.map(p => p.office))];
    let n = 0;
    slides.innerHTML = offices.map(off => {
        const mine = rows.filter(p => sameOffice(p.office, off));
        n += 1;
        const attCount = mine.filter(s => progressPdfSrc(s)).length;
        const cover = `
            <div class="slide-card pres-slide p-6 sm:p-10 shadow-2xl flex flex-col justify-between border-4 my-2 w-full">
                <div class="flex justify-between items-center border-b pres-divider pb-4 gap-2">
                    <div>
                        <h3 class="text-[10px] sm:text-xs font-black pres-title uppercase tracking-widest">Management Development and Training Unit - NWP</h3>
                        <h4 class="text-base sm:text-lg font-bold pres-heading">Provincial Training Progress Presentation</h4>
                        <p class="text-[10px] pres-muted mt-1">Full Superuser Monthly &amp; Annual Progress details + PDF attachments</p>
                    </div>
                    <span class="text-xs font-bold pres-badge px-3 py-1 rounded-full uppercase">${esc(viewType)}</span>
                </div>
                <div class="py-8 text-center space-y-3">
                    <h2 class="text-2xl sm:text-4xl font-black pres-hero uppercase">${esc(off)}</h2>
                    <p class="text-sm pres-heading">${esc(period)}</p>
                    <p class="text-xs pres-muted">Submissions: ${mine.length} · PDF attachments: ${attCount} · Theme: ${esc(style.template)} / ${esc(style.color)}</p>
                </div>
                <div class="text-[10px] pres-muted border-t pres-divider pt-3">Slide ${n}</div>
            </div>`;
        const details = mine.map(sub => {
            const built = progressSubmissionSlidesHtml(sub, n, pageMap.get(progressAttachmentKey(sub)) || []);
            n = built.nextSlide;
            return built.html;
        }).join('');
        return cover + details;
    }).join('');
}

async function downloadPresentationPDF() {
    const { rows } = progressFilter();
    if (!rows.length) { notify('Nothing to download for this selection.', 'warning'); return; }
    if (typeof html2pdf === 'undefined') { notify('PDF library could not be loaded. Check your internet connection.', 'error'); return; }
    setBusy(true, 'Preparing presentation PDF (including attachments)…');
    try {
        const style = applyPresentationStyleToDom();
        await renderProgressPresentations();
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const { viewType, office, month, user } = progressFilter();
        const userLabel = user && user !== 'all' && $('presUserSelect') && $('presUserSelect').selectedOptions[0]
            ? $('presUserSelect').selectedOptions[0].textContent : '';
        const who = userLabel ? safeFilePart(userLabel) : (!office || office === 'all' ? 'All_offices' : safeFilePart(office));
        const when = viewType === 'yearly' ? 'yearly' : (month && month !== 'all' ? month : 'all-months');
        await html2pdf().from($('presentationSlidesArea')).set({
            margin: 5,
            filename: `MDTU_Progress_Presentation_${who}_${when}_${style.template}_${style.color}_${state.year}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        }).save();
        notify(`Presentation PDF downloaded (${style.template} · ${style.color}).`);
    } catch (err) {
        notify('Could not create presentation PDF: ' + (err && err.message ? err.message : err), 'error');
    } finally {
        setBusy(false);
    }
}

function exportProgressExcel() {
    const { viewType, office, month, user, rows } = progressFilter();
    if (!rows.length) { notify('Nothing to download for this selection.', 'warning'); return; }
    if (typeof XLSX === 'undefined') { notify('Excel library could not be loaded. Check your internet connection.', 'error'); return; }
    const aoa = [[
        'Office', 'Superuser ID', 'Designation', 'Month', 'Year',
        'Special remarks', 'Productivity',
        'MDTU programs (month)', 'MDTU participants (month)',
        'Office trainings detail',
        'MDTU trained (12+6)', 'Office trained (12+6)', 'ALL trained (12+6)', 'ALL none (0)',
        'PDF attached', 'PDF path', 'Submitted at',
    ]];
    rows.forEach(sub => {
        const progs = mdtuProgramsForOfficeMonth(sub.office, sub.month);
        const mRow = officeCountRowForMode(sub.office, 'mdtu');
        const oRow = officeCountRowForMode(sub.office, 'office');
        const aRow = officeCountRowForMode(sub.office, 'all');
        const pdf = progressPdfSrc(sub);
        aoa.push([
            sub.office,
            sub.userId || '',
            sub.designation || '',
            sub.month,
            sub.year,
            sub.specialRemarks || '',
            sub.productivityTasks || '',
            progs.map(p => `${p.name} (${p.date}) ${p.hours}h x${p.count}`).join(' | '),
            progs.reduce((s, p) => s + p.count, 0),
            inHouseText(sub),
            mRow.c12 + mRow.c6,
            oRow.c12 + oRow.c6,
            aRow.c12 + aRow.c6,
            aRow.none,
            pdf ? 'Yes' : 'No',
            pdf || '',
            sub.submittedAt || '',
        ]);
    });
    // Extra sheet: designation cadre breakdown per office in selection
    const desigAoa = [['Office', 'Designation', 'Cadre', '12h', '6h', 'None', 'MDTU hours', 'Office hours']];
    [...new Set(rows.map(r => r.office))].forEach(off => {
        designationBreakdown(off).forEach(d => {
            desigAoa.push([off, d.designation, d.total, d.c12, d.c6, d.none, d.mdtuHours || 0, d.officeHours || 0]);
        });
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Progress');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(desigAoa), 'Cadre Breakdown');
    const userLabel = user && user !== 'all' && $('presUserSelect') && $('presUserSelect').selectedOptions[0]
        ? $('presUserSelect').selectedOptions[0].textContent : '';
    const who = userLabel ? safeFilePart(userLabel) : (!office || office === 'all' ? 'All_offices' : safeFilePart(office));
    const when = viewType === 'yearly' ? 'yearly' : (month && month !== 'all' ? month : 'all-months');
    XLSX.writeFile(wb, `MDTU_Progress_${who}_${when}_${state.year}.xlsx`);
}

/** Admin / Super Admin: all-users Progress detail report (document style, not slides). */
function progressDetailFilter() {
    const viewType = $('pdrViewType') ? $('pdrViewType').value : 'monthly';
    const office = $('pdrOfficeSelect') ? $('pdrOfficeSelect').value : 'all';
    const user = $('pdrUserSelect') ? $('pdrUserSelect').value : 'all';
    const month = $('pdrMonthSelect') ? $('pdrMonthSelect').value : 'all';
    if ($('pdrMonthWrapper')) $('pdrMonthWrapper').classList.toggle('hidden', viewType === 'yearly');
    let rows = state.progress.filter(p => parseInt(p.year, 10) === state.year);
    if (user && user !== 'all') {
        const want = convertNicFormat(user);
        rows = rows.filter(p => p.userId === user || convertNicFormat(p.userId) === want);
    }
    if (office && office !== 'all') rows = rows.filter(p => sameOffice(p.office, office));
    if (viewType === 'monthly' && month && month !== 'all') rows = rows.filter(p => p.month === month);
    const order = PROGRESS_MONTHS.reduce((m, name, i) => { m[name] = i; return m; }, {});
    rows = [...rows].sort((a, b) => {
        const oi = String(a.office || '').localeCompare(String(b.office || ''));
        if (oi) return oi;
        const mi = (order[a.month] ?? 99) - (order[b.month] ?? 99);
        if (mi) return mi;
        return String(a.userId || '').localeCompare(String(b.userId || ''));
    });
    return { viewType, office, month, user, rows };
}

function progressDetailBlockHtml(sub, pageImages) {
    const office = sub.office || '';
    const month = sub.month || '';
    const year = sub.year || state.year;
    const pdf = progressPdfSrc(sub);
    const pages = Array.isArray(pageImages) ? pageImages : [];
    const progs = mdtuProgramsForOfficeMonth(office, month);
    const mRow = officeCountRowForMode(office, 'mdtu');
    const oRow = officeCountRowForMode(office, 'office');
    const aRow = officeCountRowForMode(office, 'all');
    const pdfBtns = pdf ? `<div class="flex flex-wrap gap-1.5 self-start">
            <button type="button" onclick="downloadProgressAttachmentPdf(${JSON.stringify(String(sub.id || ''))})" class="text-[10px] bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold px-2.5 py-1 rounded shadow">⬇ Download PDF</button>
            ${sub.id ? `<a href="${esc(progressPdfDownloadUrl(sub))}" class="text-[10px] bg-white/15 hover:bg-white/25 text-amber-100 font-bold px-2 py-1 rounded border border-amber-300/40">Open</a>` : (pdf ? `<a href="${esc(pdf)}" target="_blank" rel="noopener" class="text-[10px] bg-white/15 text-amber-100 font-bold px-2 py-1 rounded">Open</a>` : '')}
        </div>` : '';
    return `
    <article class="border border-slate-300 rounded-lg overflow-hidden break-inside-avoid mb-4 shadow-sm">
        <header class="bg-indigo-950 text-white px-3 py-2 flex flex-wrap justify-between gap-2">
            <div>
                <h3 class="text-sm font-black uppercase">${esc(office)} · ${esc(month)} ${esc(String(year))}</h3>
                <p class="text-[10px] text-indigo-200">Superuser: ${esc(sub.userId || '—')} · තනතුර: ${esc(sub.designation || '—')} · Submitted: ${esc(sub.submittedAt || '—')}</p>
            </div>
            ${pdfBtns}
        </header>
        <div class="p-3 space-y-3 text-xs text-slate-800 bg-white">
            <div class="grid grid-cols-3 gap-2">
                <div class="border border-indigo-100 bg-indigo-50 rounded p-2 text-center"><div class="text-[9px] font-bold uppercase text-indigo-700">MDTU trained</div><div class="text-lg font-black">${mRow.c12 + mRow.c6}</div><div class="text-[10px] text-slate-500">12+: ${mRow.c12} · 6: ${mRow.c6}</div></div>
                <div class="border border-teal-100 bg-teal-50 rounded p-2 text-center"><div class="text-[9px] font-bold uppercase text-teal-700">කාර්යාලීය</div><div class="text-lg font-black">${oRow.c12 + oRow.c6}</div><div class="text-[10px] text-slate-500">12+: ${oRow.c12} · 6: ${oRow.c6}</div></div>
                <div class="border border-emerald-100 bg-emerald-50 rounded p-2 text-center"><div class="text-[9px] font-bold uppercase text-emerald-700">ALL</div><div class="text-lg font-black">${aRow.c12 + aRow.c6}</div><div class="text-[10px] text-slate-500">0: ${aRow.none}</div></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="border border-amber-200 bg-amber-50/60 rounded p-2"><p class="text-[9px] font-bold uppercase text-amber-800 mb-1">Special remarks &amp; milestones</p><p class="whitespace-pre-line">${esc(sub.specialRemarks || '—')}</p></div>
                <div class="border border-teal-200 bg-teal-50/60 rounded p-2"><p class="text-[9px] font-bold uppercase text-teal-800 mb-1">Productivity initiatives</p><p class="whitespace-pre-line">${esc(sub.productivityTasks || '—')}</p></div>
            </div>
            <div>
                <p class="text-[9px] font-bold uppercase text-indigo-900 mb-1">MDTU programs (${esc(month)})</p>
                ${progs.length ? `<table class="w-full border-collapse border border-slate-200"><thead><tr class="bg-slate-100"><th class="p-1 text-left border">Program</th><th class="p-1 border">Date</th><th class="p-1 border">Venue</th><th class="p-1 border text-center">Hours</th><th class="p-1 border text-center">Participants</th></tr></thead>
                <tbody>${progs.map(p => `<tr><td class="p-1 border">${esc(p.name)}</td><td class="p-1 border whitespace-nowrap">${esc(p.date)}</td><td class="p-1 border">${esc(p.venue)}</td><td class="p-1 border text-center">${esc(String(p.hours))}h</td><td class="p-1 border text-center font-bold">${p.count}</td></tr>`).join('')}</tbody></table>`
                    : `<p class="text-slate-500">මෙම මාසයේ තහවුරු කළ MDTU වැඩසටහන් නැත.</p>`}
            </div>
            <div>
                <p class="text-[9px] font-bold uppercase text-sky-900 mb-1">කාර්යාලීය පුහුණු (MDTU නොවන)</p>
                ${officeTrainingsDetailHtml(sub, false)}
            </div>
            <div>
                <p class="text-[9px] font-bold uppercase text-indigo-900 mb-1">Staff designation &amp; hours (කාර්යාලය)</p>
                ${cadreBreakdownTableHtml(office, false)}
            </div>
            ${pages.length ? `<div>
                <p class="text-[9px] font-bold uppercase text-fuchsia-900 mb-1">Attachment pages / photos (${pages.length})</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${pages.map((src, i) =>
                    `<div class="border border-slate-200 rounded p-1 bg-slate-50"><p class="text-[9px] text-slate-500 mb-1">Page ${i + 1}</p><img src="${src}" alt="Attachment page ${i + 1}" class="max-w-full max-h-[420px] mx-auto object-contain" /></div>`
                ).join('')}</div>
            </div>` : (pdf ? `<div class="flex flex-wrap items-center gap-2 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 rounded p-2">
                <span>📎 Supporting PDF attached to this submission.</span>
                <button type="button" onclick="downloadProgressAttachmentPdf(${JSON.stringify(String(sub.id || ''))})" class="bg-amber-500 hover:bg-amber-400 text-indigo-950 font-bold px-2.5 py-1 rounded">⬇ Download PDF</button>
            </div>` : '')}
        </div>
    </article>`;
}

async function renderProgressDetailReport() {
    const area = $('progressDetailReportArea');
    if (!area || !isAdmin()) return;
    fillSuperuserSelect();
    const { viewType, office, month, user, rows } = progressDetailFilter();
    const period = viewType === 'yearly'
        ? `Year ${state.year} · all months`
        : (month && month !== 'all' ? `${month} ${state.year}` : `All months ${state.year}`);
    const userLabel = user && user !== 'all' && $('pdrUserSelect') && $('pdrUserSelect').selectedOptions[0]
        ? $('pdrUserSelect').selectedOptions[0].textContent : 'සියලු Superusers';
    const who = (!office || office === 'all') ? 'සියලු කාර්යාල' : office;
    const includePages = !!( $('pdrIncludePdfPages') && $('pdrIncludePdfPages').checked );
    const header = `
        <div class="text-center border-b border-indigo-900 pb-3 mb-4">
            <h3 class="text-xs font-black text-amber-600 uppercase tracking-widest">Management Development and Training Unit - NWP</h3>
            <h4 class="text-base font-black text-indigo-950 uppercase">Progress Detail Report</h4>
            <p class="text-xs font-semibold text-slate-600 mt-1">${esc(who)} · ${esc(userLabel)} · ${esc(period)}</p>
            <p class="text-[10px] text-slate-500">Submissions: ${rows.length} · Document report (not presentation slides)</p>
        </div>`;
    if (!rows.length) {
        area.innerHTML = header + '<p class="p-6 text-center text-slate-500 font-bold">No progress submissions for this selection.</p>';
        return;
    }
    let pageMap = new Map();
    if (includePages && rows.some(sub => progressPdfSrc(sub))) {
        area.innerHTML = header + '<p class="p-4 text-center text-amber-700 font-bold">📎 Loading attachment pages…</p>';
        try { pageMap = await loadProgressAttachmentPages(rows); } catch (e) { console.warn(e); }
    }
    area.innerHTML = header + rows.map(sub =>
        progressDetailBlockHtml(sub, includePages ? (pageMap.get(progressAttachmentKey(sub)) || []) : [])
    ).join('');
}

async function downloadProgressDetailPDF() {
    if (!isAdmin()) return;
    const { rows, viewType, office, month, user } = progressDetailFilter();
    if (!rows.length) { notify('Nothing to download for this selection.', 'warning'); return; }
    if (typeof html2pdf === 'undefined') { notify('PDF library could not be loaded. Check your internet connection.', 'error'); return; }
    setBusy(true, 'Preparing Progress Detail PDF…');
    try {
        await renderProgressDetailReport();
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const userLabel = user && user !== 'all' && $('pdrUserSelect') && $('pdrUserSelect').selectedOptions[0]
            ? $('pdrUserSelect').selectedOptions[0].textContent : '';
        const who = userLabel ? safeFilePart(userLabel) : (!office || office === 'all' ? 'All_offices' : safeFilePart(office));
        const when = viewType === 'yearly' ? 'yearly' : (month && month !== 'all' ? month : 'all-months');
        await html2pdf().from($('progressDetailReportArea')).set({
            margin: [8, 8, 8, 8],
            filename: `MDTU_Progress_Detail_${who}_${when}_${state.year}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, allowTaint: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['article', 'tr', 'img'] },
        }).save();
    } catch (err) {
        notify('Could not create detail PDF: ' + (err && err.message ? err.message : err), 'error');
    } finally {
        setBusy(false);
    }
}

function exportProgressDetailExcel() {
    if (!isAdmin()) return;
    const { viewType, office, month, user, rows } = progressDetailFilter();
    if (!rows.length) { notify('Nothing to download for this selection.', 'warning'); return; }
    if (typeof XLSX === 'undefined') { notify('Excel library could not be loaded. Check your internet connection.', 'error'); return; }
    const aoa = [[
        'Office', 'Superuser ID', 'Designation', 'Month', 'Year',
        'Special remarks', 'Productivity',
        'MDTU programs (month)', 'MDTU participants (month)',
        'Office trainings detail',
        'MDTU trained (12+6)', 'Office trained (12+6)', 'ALL trained (12+6)', 'ALL none (0)',
        'PDF attached', 'PDF path', 'Submitted at',
    ]];
    rows.forEach(sub => {
        const progs = mdtuProgramsForOfficeMonth(sub.office, sub.month);
        const mRow = officeCountRowForMode(sub.office, 'mdtu');
        const oRow = officeCountRowForMode(sub.office, 'office');
        const aRow = officeCountRowForMode(sub.office, 'all');
        const pdf = progressPdfSrc(sub);
        aoa.push([
            sub.office, sub.userId || '', sub.designation || '', sub.month, sub.year,
            sub.specialRemarks || '', sub.productivityTasks || '',
            progs.map(p => `${p.name} (${p.date}) ${p.hours}h x${p.count}`).join(' | '),
            progs.reduce((s, p) => s + p.count, 0),
            inHouseText(sub),
            mRow.c12 + mRow.c6, oRow.c12 + oRow.c6, aRow.c12 + aRow.c6, aRow.none,
            pdf ? 'Yes' : 'No', pdf || '', sub.submittedAt || '',
        ]);
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Progress Detail');
    const userLabel = user && user !== 'all' && $('pdrUserSelect') && $('pdrUserSelect').selectedOptions[0]
        ? $('pdrUserSelect').selectedOptions[0].textContent : '';
    const who = userLabel ? safeFilePart(userLabel) : (!office || office === 'all' ? 'All_offices' : safeFilePart(office));
    const when = viewType === 'yearly' ? 'yearly' : (month && month !== 'all' ? month : 'all-months');
    XLSX.writeFile(wb, `MDTU_Progress_Detail_${who}_${when}_${state.year}.xlsx`);
}

// ===================== Annual training plans =====================

function handleTpUserLookup(val) {
    lookupProgressUser(convertNicFormat(val), 'tpOffice', 'tpDesignation');
}

async function handleSaveTrainingPlan(e) {
    e.preventDefault();
    try {
        const res = await post('save_plan', {
            year: state.year,
            userId: convertNicFormat($('tpUserId').value),
            office: $('tpOffice').value.trim(),
            designation: $('tpDesignation').value.trim(),
            reqGeneral: $('tpRequiredGeneral').value.trim(),
            specialized: $('tpSpecialized').value.trim(),
            departmental: $('tpDepartmental').value.trim(),
            obt: $('tpObt').value.trim(),
        });
        state.plans = res.plans;
        e.target.reset();
        renderTrainingPlanTable();
        notify('Annual training plan saved to the database.');
    } catch (err) {
        notify(err.message, 'error');
    }
}

function renderTrainingPlanTable() {
    const tbody = $('trainingPlanTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.plans.length ? state.plans.map(t => `
        <tr class="border-b hover:bg-slate-50 align-top">
            <td class="p-3 font-bold text-teal-950">${esc(t.office)}</td>
            <td class="p-3 font-semibold text-slate-700">${esc(t.userId)}${t.designation ? ' (' + esc(t.designation) + ')' : ''}</td>
            <td class="p-3 whitespace-pre-line">${esc(t.reqGeneral)}</td>
            <td class="p-3 whitespace-pre-line">${esc(t.specialized || '-')}</td>
            <td class="p-3 whitespace-pre-line">${esc(t.departmental || '-')}</td>
            <td class="p-3 text-teal-700 font-semibold whitespace-pre-line">${esc(t.obt || '-')}</td>
        </tr>`).join('') : emptyRow(6, `No training plans for ${state.year}.`);
}

async function handleMergePrevPlanExcel() {
    const file = $('prevPlanExcelUpload').files[0];
    if (!file) { notify('Please select the previous plan Excel file.', 'warning'); return; }
    try {
        const json = await readExcelRows(file);
        const rows = json.map(r => ({
            userId: String(r['User ID'] || r['Superuser / ID'] || ''),
            office: r['Office Name'] || r['Office'] || '',
            designation: r['Designation'] || '',
            reqGeneral: r['Required General'] || r['Training Name'] || '',
            specialized: r['Specialized'] || '',
            departmental: r['Departmental'] || '',
            obt: r['OBT'] || '',
        }));
        const res = await post('import_plans', { year: state.year, rows });
        state.plans = res.plans;
        renderTrainingPlanTable();
        notify(`${rows.length} plan row(s) merged into the database.`);
    } catch (err) {
        notify(err.message, 'error');
    }
}

function exportTrainingPlanToExcel() {
    const rows = [['Office Name', 'User ID', 'Designation', 'Required General', 'Specialized', 'Departmental', 'OBT']];
    state.plans.forEach(t => rows.push([t.office, t.userId, t.designation, t.reqGeneral, t.specialized, t.departmental, t.obt]));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Annual Training Plan');
    XLSX.writeFile(wb, `Annual_Training_Plan_${state.year}.xlsx`);
}

// ===================== Master data uploads =====================

const RESOURCE_PERSON_COLUMNS = ['Resource Person Name', 'NIC / Officer ID', 'Specialization / Domain', 'Designation & Institution', 'Contact Number', 'Email Address'];

function resourcePersonSheet(rows) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    rows.forEach((row, i) => {
        if (i === 0) return;
        const cell = XLSX.utils.encode_cell({ r: i, c: 3 });
        if (ws[cell]) {
            ws[cell].t = 's';
            ws[cell].v = String(row[3] ?? '');
        }
    });
    ws['!cols'] = [{ wch: 32 }, { wch: 28 }, { wch: 36 }, { wch: 18 }, { wch: 28 }];
    return ws;
}

function downloadResourcePersonTemplate() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, resourcePersonSheet([
        RESOURCE_PERSON_COLUMNS,
        ['Mr. A. B. Perera', '197012345678', 'Information Technology', 'Director, Department of Agriculture', '0771234567', 'abperera@example.com'],
    ]), 'Resource Persons');
    XLSX.writeFile(wb, 'MDTU_Resource_Person_Template.xlsx');
}

function downloadResourcePersonsExcel() {
    const rows = [RESOURCE_PERSON_COLUMNS];
    state.resourcePersons.forEach(r => rows.push([r.name || '', r.nic || '', r.field || '', r.institution || '', r.contact || '', r.email || '']));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, resourcePersonSheet(rows), 'Resource Persons');
    XLSX.writeFile(wb, 'MDTU_Resource_Persons.xlsx');
}

function resourceCell(row, names) {
    for (const name of names) {
        if (row[name] != null && String(row[name]).trim() !== '') return String(row[name]).trim();
    }
    return '';
}

async function uploadResourcePersonsExcel() {
    const input = $('resourcePersonsExcelInput');
    const file = input && input.files[0];
    if (!file) { notify('Please choose an Excel file.', 'warning'); return; }
    const btn = $('resourceUploadBtn');
    if (btn) btn.disabled = true;
    try {
        const json = await readExcelRows(file);
        const rows = json.map(r => {
            let contact = resourceCell(r, ['Contact Number', 'Contact No', 'Phone']);
            if (/^\d{9}$/.test(contact)) contact = '0' + contact;
            return {
                name: resourceCell(r, ['Resource Person Name', 'Name']) || String(Object.values(r)[0] || '').trim(),
                nic: convertNicFormat(resourceCell(r, ['NIC / Officer ID', 'NIC', 'Officer ID'])),
                field: resourceCell(r, ['Specialization / Domain', 'Specialization', 'Field']),
                institution: resourceCell(r, ['Designation & Institution', 'Institution']),
                contact,
                email: resourceCell(r, ['Email Address', 'Email']),
            };
        }).filter(r => r.name && !/^resource person name$/i.test(r.name));
        const res = await post('replace_resource_persons', { rows });
        state.resourcePersons = res.resourcePersons;
        renderMasterResourcePersonsTable();
        updateProgramDropdowns();
        if (input) input.value = '';
        notify(`${res.added} new and ${res.updated} updated. Names and NIC numbers are in the lecturer list.`);
    } catch (err) {
        notify(err.message, 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

function renderMasterResourcePersonsTable() {
    const tbody = $('resourceSharedTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.resourcePersons.length ? state.resourcePersons.map(r => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-2.5 font-bold text-purple-950">${escTx(r.name)}</td>
            <td class="p-2.5 font-mono">${esc(r.nic || '—')}</td>
            <td class="p-2.5">${esc(r.field)}</td>
            <td class="p-2.5">${esc(r.institution)}</td>
            <td class="p-2.5 font-mono">${esc(r.contact)}</td>
            <td class="p-2.5 font-mono text-indigo-700">${esc(r.email)}</td>
        </tr>`).join('') : emptyRow(6, 'No resource persons uploaded yet.');
}

function staffMatrixDesignations() {
    const mergedKeys = new Map(); // key -> label
    state.staffMatrix.forEach(m => {
        const merged = mergeDesignationCounts(m.counts || {}) || {};
        Object.keys(merged).forEach(label => {
            const key = designationKey(label);
            if (!key) return;
            const prev = mergedKeys.get(key);
            mergedKeys.set(key, prev ? preferDesignationLabel(prev, label) : label);
        });
    });
    const fromData = [...mergedKeys.values()].sort((a, b) => a.localeCompare(b));
    return fromData.length ? fromData : ['Development Officer', 'Management Assistant', 'Office Assistant'];
}

function staffMatrixSheet(rows) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = rows[0].map((_, i) => ({ wch: i === 0 ? 42 : 24 }));
    return ws;
}

function downloadStaffMatrixTemplate() {
    const desigs = staffMatrixDesignations();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, staffMatrixSheet([
        ['Office Name', ...desigs],
        ["Chief Secretary's Office", ...desigs.map(() => 0)],
    ]), 'Staff Matrix');
    XLSX.writeFile(wb, `MDTU_Staff_Matrix_Template_${state.year}.xlsx`);
}

/** Staff matrix rows with spelling twins + Ayurveda sub-units rolled into one office. */
function mergedStaffMatrixRows() {
    const byKey = {};
    state.staffMatrix.forEach(m => {
        const key = officeKey(m.office);
        if (!key) return;
        const counts = mergeDesignationCounts(m.counts || {}) || {};
        if (!byKey[key]) {
            byKey[key] = { office: officeCanonicalName(m.office), counts: { ...counts } };
            return;
        }
        byKey[key].office = preferOfficeLabel(byKey[key].office, m.office);
        Object.keys(counts).forEach(d => {
            byKey[key].counts[d] = (byKey[key].counts[d] || 0) + (parseInt(counts[d], 10) || 0);
        });
        byKey[key].counts = mergeDesignationCounts(byKey[key].counts) || {};
    });
    return Object.values(byKey).sort((a, b) => String(a.office).localeCompare(String(b.office)));
}

function downloadStaffMatrixExcel() {
    const desigs = staffMatrixDesignations();
    const rows = [['Office Name', ...desigs]];
    mergedStaffMatrixRows().forEach(m => {
        const counts = m.counts || {};
        rows.push([m.office || '', ...desigs.map(d => counts[d] ?? 0)]);
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, staffMatrixSheet(rows), 'Staff Matrix');
    XLSX.writeFile(wb, `MDTU_Staff_Matrix_${state.year}.xlsx`);
}

function renderStaffMatrixColumnGuide() {
    const box = $('staffMatrixColumnGuide');
    if (!box) return;
    const desigs = staffMatrixDesignations();
    const sample = !state.staffMatrix.length;
    box.innerHTML = `<table class="w-full text-left text-[11px] border-collapse border border-indigo-200 min-w-[520px] bg-white">
        <thead class="bg-indigo-900 text-white"><tr>
            <th class="p-2">Office Name *</th>${desigs.map(d => `<th class="p-2">${esc(d)}</th>`).join('')}
        </tr></thead>
        <tbody><tr>
            <td class="p-2">Required</td>${desigs.map(() => '<td class="p-2">Number</td>').join('')}
        </tr></tbody>
    </table>${sample ? '<p class="text-[11px] text-slate-500 mt-1">The designation columns above are examples. Use the real post names as column headings.</p>' : ''}`;
}

function csvCell(row, names) {
    const keys = Object.keys(row || {});
    for (const want of names) {
        const hit = keys.find(k => String(k).trim().toLowerCase() === want.toLowerCase());
        if (hit != null && row[hit] != null && String(row[hit]).trim() !== '') return String(row[hit]).trim();
    }
    return '';
}

function parseOfficerDirectoryCsv(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                let text = String(reader.result || '');
                if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
                if (typeof XLSX === 'undefined') throw new Error('Excel/CSV library could not be loaded.');
                const wb = XLSX.read(text, { type: 'string', FS: ',', raw: false });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
                const rows = json.map(r => {
                    const nic = csvCell(r, ['National ID', 'NIC', 'nic', 'ID Number']);
                    const oldNic = csvCell(r, ['Old National ID', 'Old NIC', 'oldNic']);
                    const name = csvCell(r, ['Name', 'Officer Name', 'name']);
                    const designation = csvCell(r, ['Designation', 'designation']);
                    const office = csvCell(r, ['Office', 'office', 'Office Name']);
                    const phone = csvCell(r, ['Mobile', 'Phone', 'phone', 'Office telephone', 'Contact']);
                    const gender = csvCell(r, ['Gender', 'gender']);
                    return { nic, oldNic, name, designation, office, phone, gender };
                }).filter(r => r.name && (r.nic || r.oldNic));
                resolve(rows);
            } catch (err) {
                reject(err instanceof Error ? err : new Error('CSV could not be read.'));
            }
        };
        reader.onerror = () => reject(new Error('Could not read the CSV file.'));
        reader.readAsText(file, 'UTF-8');
    });
}

/** Super Admin: upload karyamandala CSV → upsert officers (no duplicates; old+new NIC). */
async function uploadOfficerDirectoryCsv() {
    if (role() !== 'super') {
        notify('Only Super Admin can update the officer directory.', 'error');
        return;
    }
    const input = $('officerDirCsvFile');
    const file = input && input.files[0];
    if (!file) { notify('Please choose the karyamandala CSV file.', 'warning'); return; }
    const btn = $('officerDirUploadBtn');
    const status = $('officerDirUploadStatus');
    const label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Reading CSV…'; }
    if (status) status.textContent = 'Reading file…';
    setBusy(true, 'Updating officer directory…');
    try {
        const rows = await parseOfficerDirectoryCsv(file);
        if (!rows.length) {
            notify('No officer rows found. Need National ID / Old National ID and Name columns.', 'error');
            return;
        }
        const batchSize = 800;
        let inserted = 0;
        let updated = 0;
        let skipped = 0;
        let total = (state.officers || []).length;
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const final = i + batchSize >= rows.length;
            if (btn) btn.textContent = `Uploading ${Math.min(i + batch.length, rows.length)} / ${rows.length}…`;
            if (status) status.textContent = `Uploading batch ${Math.floor(i / batchSize) + 1}… (${Math.min(i + batch.length, rows.length)} / ${rows.length})`;
            const res = await post('import_officers', { rows: batch, final });
            inserted += res.inserted || 0;
            updated += res.updated || 0;
            skipped += res.skipped || 0;
            total = res.total != null ? res.total : total;
            if (final && Array.isArray(res.officers)) {
                state.officers = res.officers;
            }
        }
        updateOfficeDropdowns();
        if ($('officerDirCountBadge')) {
            $('officerDirCountBadge').textContent = `Officers in directory: ${total.toLocaleString()}`;
        }
        if (input) input.value = '';
        if (status) {
            status.textContent = `Done. New: ${inserted} · Updated: ${updated} · Skipped: ${skipped} · Directory total: ${total.toLocaleString()}`;
        }
        notify(`Officer directory updated. New ${inserted}, updated ${updated}, skipped ${skipped}. Total ${total}.`);
    } catch (err) {
        if (status) status.textContent = '';
        notify(err.message || String(err), 'error');
    } finally {
        setBusy(false);
        if (btn) {
            btn.disabled = false;
            btn.textContent = label || '📤 Upload & Update Officers';
        }
    }
}

async function uploadAnnualStaffExcel() {
    const input = $('annualStaffExcelFile');
    const file = input && input.files[0];
    if (!file) { notify('Please select an Excel file.', 'warning'); return; }
    const btn = $('staffUploadBtn');
    const label = btn ? btn.textContent : '';
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Please wait...';
    }
    try {
        const json = await readExcelRows(file);
        const parsed = json.map(row => {
            const keys = Object.keys(row);
            const officeCol = keys.find(k => /^office( name)?$/i.test(k.trim())) || keys[0];
            const counts = {};
            keys.filter(k => k !== officeCol).forEach(k => { counts[k.trim()] = parseInt(row[k], 10) || 0; });
            const officeName = String(row[officeCol] || '').trim();
            // Merge designation variants + roll Ayurveda sub-units / spelling twins into one office.
            return {
                office: officeCanonicalName(officeName),
                counts: mergeDesignationCounts(counts) || {},
                _key: officeKey(officeName),
            };
        }).filter(r => r.office && r._key && !/^office( name)?$/i.test(r.office));
        const byOffice = {};
        parsed.forEach(r => {
            if (!byOffice[r._key]) {
                byOffice[r._key] = { office: r.office, counts: { ...r.counts } };
            } else {
                byOffice[r._key].office = preferOfficeLabel(byOffice[r._key].office, r.office);
                Object.keys(r.counts).forEach(d => {
                    byOffice[r._key].counts[d] = (byOffice[r._key].counts[d] || 0) + (parseInt(r.counts[d], 10) || 0);
                });
                byOffice[r._key].counts = mergeDesignationCounts(byOffice[r._key].counts) || {};
            }
        });
        const rows = Object.values(byOffice);
        if (!rows.length) {
            notify('No offices were found. The first column must be Office Name.', 'error');
            return;
        }
        const res = await post('replace_staff_matrix', { year: state.year, rows });
        state.staffMatrix = res.staffMatrix;
        renderAnnualStaffMatrixTable();
        updateOfficeDropdowns();
        if (input) input.value = '';
        notify(`Staff matrix for ${state.year} saved (${rows.length} offices). Designation + Ayurveda/spelling office variants were merged.`);
    } catch (err) {
        notify(err.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = label || '📤 Upload staff matrix';
        }
    }
}

function renderAnnualStaffMatrixTable() {
    const head = $('annualStaffMatrixHead');
    const body = $('annualStaffMatrixBody');
    if (!head || !body) return;
    renderStaffMatrixColumnGuide();
    if (!state.staffMatrix.length) {
        head.innerHTML = '';
        body.innerHTML = emptyRow(1, `No staff matrix uploaded for ${state.year}.`);
        return;
    }
    const desigs = staffMatrixDesignations();
    head.innerHTML = `<tr><th class="p-2.5">Office</th>${desigs.map(d => `<th class="p-2.5 text-center">${escTx(d)}</th>`).join('')}</tr>`;
    body.innerHTML = mergedStaffMatrixRows().map(m => {
        const counts = m.counts || {};
        return `<tr class="border-b"><td class="p-2.5 font-bold">${escTx(m.office)}</td>${desigs.map(d => `<td class="p-2.5 text-center">${counts[d] ?? 0}</td>`).join('')}</tr>`;
    }).join('');
}

// ===================== Notifications =====================

function updateNotificationRecipientOptions() {
    const sel = $('notifTargetUser');
    if (!sel) return;
    sel.innerHTML = '<option value="all">📢 All Users & Superusers (Broadcast)</option>' +
        state.chatUsers.map(u => `<option value="${esc(u.username)}">${esc(u.username)} (${esc(u.role.toUpperCase())})</option>`).join('');
}

async function handleSendNotification(e) {
    e.preventDefault();
    try {
        const file = $('notifPdfFile').files[0];
        const res = await post('send_notification', {
            target: $('notifTargetUser').value,
            title: $('notifTitle').value.trim(),
            message: $('notifMessage').value.trim(),
            attachment: file ? await fileToDataUrl(file, 10) : null,
        });
        state.notifications = res.notifications;
        renderNotifications();
        e.target.reset();
        notify('Notification sent.');
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function handleUserSendMessage(e) {
    e.preventDefault();
    try {
        await post('user_message', {
            idNo: convertNicFormat($('userMsgIdNo').value),
            phone: $('userMsgPhone').value.trim(),
            message: $('userMsgText').value.trim(),
        });
        e.target.reset();
        notify('Your message was sent to the administration.');
        pollMessages();
    } catch (err) {
        notify(err.message, 'error');
    }
}

function canModifyNotification(n) {
    return isAdmin() || (state.user && n.sender === currentName());
}

async function editNotification(id) {
    const n = state.notifications.find(x => x.id == id);
    if (!n) return;
    const title = prompt('Edit Title:', n.title);
    if (title === null) return;
    const message = prompt('Edit Message:', n.message);
    if (message === null) return;
    try {
        const res = await post('update_notification', { id, title, message });
        state.notifications = res.notifications;
        renderNotifications();
        notify('Message updated.');
    } catch (err) { notify(err.message, 'error'); }
}

async function deleteNotification(id) {
    if (!confirm('Delete this notification?')) return;
    try {
        const res = await post('delete_notification', { id });
        state.notifications = res.notifications;
        renderNotifications();
        notify('Message deleted.');
    } catch (err) { notify(err.message, 'error'); }
}

function renderNotifications() {
    const list = state.notifications;
    const badge = $('floatingInboxBadge');
    if (badge) {
        badge.textContent = list.length;
        badge.style.display = list.length ? '' : 'none';
    }

    const html = list.length ? list.map(n => {
        const inquiry = (n.title || '').startsWith('User Inquiry');
        const mod = canModifyNotification(n);
        return `
            <div class="${inquiry ? 'bg-cyan-100/90 border-cyan-500' : 'bg-amber-50/70 border-amber-400'} p-3 sm:p-4 rounded-xl border shadow-sm space-y-2">
                <div class="flex justify-between items-center text-[10px] gap-2">
                    <span class="${inquiry ? 'bg-cyan-800' : 'bg-amber-600'} text-white font-black px-2 py-0.5 rounded-full uppercase truncate">To: ${esc(n.target)} · From: ${esc(n.sender)}</span>
                    <span class="font-mono text-slate-500 shrink-0">${esc(String(n.createdAt || '').slice(0, 16))}</span>
                </div>
                <div class="flex justify-between items-start gap-2">
                    <h4 class="text-xs sm:text-sm font-bold text-slate-900 break-words">🔔 ${esc(n.title)}</h4>
                    ${mod ? `<div class="flex gap-1 shrink-0">
                        <button onclick="editNotification(${n.id})" class="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded">Edit</button>
                        <button onclick="deleteNotification(${n.id})" class="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded">Delete</button>
                    </div>` : ''}
                </div>
                <p class="text-xs text-slate-800 whitespace-pre-line leading-relaxed break-words">${linkify(n.message)}</p>
                ${n.attachment ? `<a href="${esc(n.attachment)}" target="_blank" download class="inline-flex items-center gap-1.5 bg-indigo-900 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow">📥 Attached Document</a>` : ''}
            </div>`;
    }).join('') : '<p class="text-xs text-slate-400 text-center py-4">No notifications in the inbox.</p>';
    if ($('notificationsContainer')) $('notificationsContainer').innerHTML = html;
    if ($('inboxPopupBody')) $('inboxPopupBody').innerHTML = html;
    renderHeaderYellowAlertList();
}

function renderHeaderYellowAlertList() {
    const bar = $('headerYellowAlertBar');
    const box = $('headerYellowAlertListContainer');
    if (!bar || !box) return;
    const items = state.notifications.filter(n => !(n.title || '').startsWith('User Inquiry')).slice(0, 10);
    bar.classList.toggle('hidden', items.length === 0);
    box.innerHTML = '<span class="font-bold text-amber-900 shrink-0">🔔 Notices:</span>' + items.map(n => `
        <span class="bg-white px-2.5 py-1 rounded border border-amber-300 shadow-sm inline-flex items-center gap-2 shrink-0">
            <button onclick="switchTab('notifications-tab')" class="font-bold text-amber-900">📌 ${esc(n.title)}</button>
            ${n.attachment ? `<a href="${esc(n.attachment)}" target="_blank" download class="bg-indigo-900 text-white text-[10px] px-2 py-0.5 rounded font-bold">📥 PDF</a>` : ''}
        </span>`).join('');
}

function toggleFloatingInbox() {
    $('inboxFloatingPanel').classList.toggle('hidden');
    $('chatFloatingPanel').classList.add('hidden');
}

function toggleFloatingChat() {
    $('chatFloatingPanel').classList.toggle('hidden');
    $('inboxFloatingPanel').classList.add('hidden');
    const box = $('chatPopupBody');
    if (box) box.scrollTop = box.scrollHeight;
}

// ===================== Live chat =====================

function linkify(text) {
    return esc(text).replace(/\bhttps?:\/\/[^\s<]+/gi, url => `<a href="${url}" target="_blank" rel="noopener" class="text-blue-600 underline font-semibold break-all">${url}</a>`);
}

function updateChatRecipientOptions() {
    const group = $('chatUserListGroup');
    if (group) group.innerHTML = state.chatUsers.filter(u => u.username !== currentName())
        .map(u => `<option value="${esc(u.username)}">${esc(u.username)} (${esc(u.role.toUpperCase())})</option>`).join('');
}

async function handleSendLiveChatMessage(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input[type="text"]');
    const sel = form.querySelector('select');
    const text = input.value.trim();
    if (!text) return;
    try {
        const res = await post('send_chat', { recipient: sel ? sel.value : 'all', text });
        state.chat = res.chat;
        input.value = '';
        renderLiveChatMessages();
    } catch (err) {
        notify(err.message, 'error');
    }
}

function renderLiveChatMessages() {
    const me = currentName();
    const html = state.chat.length ? state.chat.map(m => {
        const priv = m.recipient !== 'all';
        const canDelete = state.user && (isAdmin() || m.sender === me);
        return `
            <div class="p-2.5 rounded-lg border ${priv ? 'bg-amber-50/90 border-amber-300' : 'bg-white border-slate-200'} shadow-sm space-y-1 ${m.sender === me ? 'ml-6' : 'mr-6'}">
                <div class="flex justify-between items-center text-[10px] font-bold text-slate-500 gap-2">
                    <span class="truncate">👤 ${esc(m.sender)} → <strong>${esc(m.recipient)}</strong> ${priv ? '<span class="text-rose-600">(🔒 Private)</span>' : ''}</span>
                    <span class="font-mono shrink-0">${esc(String(m.createdAt || '').slice(11, 16))}</span>
                </div>
                <p class="text-xs text-slate-900 break-words">${linkify(m.text)}</p>
                <div class="flex justify-end gap-2">
                    ${m.sender !== me ? `<button onclick="replyToChat('${esc(m.sender).replace(/'/g, '&#39;')}')" class="text-[10px] font-bold text-indigo-700 hover:underline">Reply ↩</button>` : ''}
                    ${canDelete ? `<button onclick="deleteChatMessage(${m.id})" class="text-[10px] font-bold text-rose-600 hover:underline">Delete 🗑️</button>` : ''}
                </div>
            </div>`;
    }).join('') : '<p class="text-xs text-slate-400 text-center py-4">No messages yet.</p>';
    ['chatMessagesBox', 'chatPopupBody'].forEach(id => {
        const box = $(id);
        if (!box) return;
        const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
        box.innerHTML = html;
        if (atBottom || !box.dataset.init) box.scrollTop = box.scrollHeight;
        box.dataset.init = '1';
    });
}

function replyToChat(sender) {
    switchTab('live-chat-tab');
    const sel = $('chatRecipientSelect');
    if ([...sel.options].some(o => o.value === sender)) sel.value = sender;
    else if (isAdmin()) notify('Guests cannot receive private replies. Reply with a broadcast message.', 'info');
    $('chatInputText').focus();
}

async function deleteChatMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        const res = await post('delete_chat', { id });
        state.chat = res.chat;
        renderLiveChatMessages();
    } catch (err) { notify(err.message, 'error'); }
}

// ===================== User accounts =====================

const handleNewUserNicLookup = debounce(async (val) => {
    const nic = convertNicFormat(val);
    if (nic.length < 9) return;
    const o = await lookupOfficer(nic);
    if (!o) return;
    if ($('newUserOfficerName') && !$('newUserOfficerName').value.trim()) $('newUserOfficerName').value = o.name || '';
    if ($('newUserDesignation') && !$('newUserDesignation').value.trim()) $('newUserDesignation').value = o.designation || '';
    if ($('newUserOffice') && !$('newUserOffice').value.trim()) $('newUserOffice').value = o.office || '';
}, 400);

async function handleCreateUser(e) {
    e.preventDefault();
    try {
        const res = await post('create_user', {
            username: $('newUsername').value.trim(),
            password: $('newPassword').value,
            role: $('newRole').value,
            nic: convertNicFormat($('newUserNic')?.value || ''),
            officerName: ($('newUserOfficerName')?.value || '').trim(),
            designation: ($('newUserDesignation')?.value || '').trim(),
            office: ($('newUserOffice')?.value || '').trim(),
        });
        state.users = res.users;
        state.chatUsers = res.users.map(u => ({ username: u.username, role: u.role }));
        e.target.reset();
        renderUserAccountsTable();
        updateChatRecipientOptions();
        updateNotificationRecipientOptions();
        notify('User account created.');
    } catch (err) {
        notify(err.message, 'error');
    }
}

function renderUserAccountsTable() {
    const tbody = $('userAccountsTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.users.length ? state.users.map(u => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-2.5 font-bold text-indigo-950">${esc(u.username)}${state.user && u.id == state.user.id ? ' <span class="text-[9px] text-emerald-600">(you)</span>' : ''}</td>
            <td class="p-2.5 text-[11px]">${u.officerName || u.nic ? `<div class="font-bold text-slate-800">${esc(u.officerName || '-')}</div><div class="font-mono text-[10px] text-slate-500">${esc(u.nic || '')}</div>` : '<span class="text-slate-400">-</span>'}</td>
            <td class="p-2.5 uppercase font-semibold text-xs text-amber-700">${esc(ROLE_LABELS[u.role] || u.role)}</td>
            <td class="p-2.5 text-[10px] font-bold">${Number(u.mustChangePassword)
                ? '<span class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Must change at next login</span>'
                : `<span class="text-emerald-700">✓ Set${u.passwordChangedAt ? ' ' + esc(String(u.passwordChangedAt).slice(0, 10)) : ''}</span>`}</td>
            <td class="p-2.5 font-mono text-[11px]">${u.lastLoginAt ? esc(formatDateTimeShort(u.lastLoginAt)) : '<span class="text-slate-400">never</span>'}</td>
            <td class="p-2.5 font-mono text-[11px]">${esc(String(u.createdAt || '').slice(0, 10))}</td>
            <td class="p-2.5 text-center whitespace-nowrap">
                <button onclick="resetUserPassword(${u.id}, '${esc(u.username)}')" class="bg-indigo-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">Reset Password</button>
                <button onclick="deleteUserAccount(${u.id})" class="bg-rose-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">Delete</button>
            </td>
        </tr>`).join('') : emptyRow(7, 'Log in as Super Admin to manage accounts.');
}

async function resetUserPassword(id, username) {
    const password = prompt(`Temporary password for ${username}\n(at least 8 characters with letters and numbers; the user must change it at the next login):`);
    if (!password) return;
    try {
        const res = await post('reset_password', { id, password });
        state.users = res.users;
        renderUserAccountsTable();
        notify(`Temporary password set for ${username}.`);
    } catch (err) { notify(err.message, 'error'); }
}

async function deleteUserAccount(id) {
    if (!confirm('Delete this user account?')) return;
    try {
        const res = await post('delete_user', { id });
        state.users = res.users;
        renderUserAccountsTable();
        notify('User deleted.');
    } catch (err) { notify(err.message, 'error'); }
}

// ===================== Backup =====================

function archiveLog(msg) {
    const log = $('archiveLogArea');
    if (!log) return;
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

async function downloadBackup(format) {
    archiveLog('Reading all tables from the database...');
    try {
        const res = await api('export_all');
        const stamp = todayISO();
        if (format === 'json') {
            downloadBlob(new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' }), `MDTU_Backup_${stamp}.json`);
        } else {
            const wb = XLSX.utils.book_new();
            Object.entries(res.tables).forEach(([name, rows]) => {
                XLSX.utils.book_append_sheet(wb, rows.length ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([['(empty)']]), name.slice(0, 31));
            });
            XLSX.writeFile(wb, `MDTU_Backup_${stamp}.xlsx`);
        }
        const counts = Object.entries(res.tables).map(([k, v]) => `${k}: ${v.length}`).join(', ');
        archiveLog(`Backup downloaded (${counts}).`);
    } catch (err) {
        archiveLog('Backup failed: ' + err.message);
        notify(err.message, 'error');
    }
}

// ===================== Home dashboard =====================

const TILE_COLORS = {
    sky: 'bg-sky-100 text-sky-700',
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    violet: 'bg-violet-100 text-violet-700',
};

const TILE_HINTS = {
    'add-record': 'Register attendance and give feedback',
    'attendance-cert': 'Download / print the letterhead certificate',
    'certificate': 'Download the completion e-certificate',
    'verification': 'Training history of an officer by NIC',
    'notifications-tab': 'Official notices and messages',
    'live-chat-tab': 'Chat with MDTU support',
    'dashboard': 'Key figures and charts for the year',
    'confirm-attendance': 'Confirm attendance and mark absent days',
    'cert-register': 'List of issued certificates, PDF for files',
    'manage-programs': 'Programs, venues, file numbers, speakers',
    'training-namelist-report': 'Name list of participants per program',
    'participation-list': 'Excel and PDF list for one program, by the dates it was held',
    'progress-reports': 'Presentation slides / PDF / Excel',
    'progress-detail-report': 'All superusers’ progress in one detail report — month or year, PDF',
    'office-count-report': 'Every office: cadre total, 12+ hours, 6 hours, and none',
    'analytics': 'Evaluation results by program',
    'resource-report': 'Ratings of lecturers / resource persons',
    'duty-report': 'Training hours per officer',
    'pending': 'Officers below 12 hours',
    'completed': 'Officers who completed 12 hours',
    'progress-entry': 'Submit the monthly office progress',
    'training-plan-entry': 'Submit the annual training needs',
    'training-plan-report': 'Training plans of all offices',
    'resource-persons-master-report': 'Directory of resource persons. Super Admin can upload and download the list',
    'office-report': '12-hour status by office',
    'office-designation-report': 'Status by designation',
    'template-settings': 'Logos, signature, seal, state emblem',
    'user-management': 'Accounts, passwords and roles',
    'audit-log': 'Who did what and when, integrity check',
    'annual-excel-upload': 'Upload the cadre strength per office',
    'archive-tab': 'Daily server backups and full downloads',
};

function renderHome() {
    if (!state.user) return;
    const hour = new Date().getHours();
    $('homeGreeting').textContent = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    $('homeUserName').textContent = state.user.username;
    $('homeRoleText').textContent = `${ROLE_LABELS[role()] || role()} · Training year ${state.year}`;
    renderHomeStats();

    const pending = state.records.filter(r => !r.confirmed).length;
    const groups = qsa('details.nav-group').filter(canSeeView);
    // Role sections first, the public officer services last
    groups.push(groups.shift());
    $('homeTiles').innerHTML = groups.map(g => {
        const color = TILE_COLORS[g.dataset.tileColor] || TILE_COLORS.indigo;
        const tiles = Array.from(g.querySelectorAll('.tab-btn')).map(b => {
            const id = b.id.replace(/^tab-/, '');
            const text = b.textContent.trim();
            const m = text.match(/^(\S+)\s+(.*)$/);
            const badge = id === 'confirm-attendance' && pending
                ? `<span class="inline-block mt-1 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">${pending} waiting</span>` : '';
            return `<button onclick="switchTab('${id}')" class="home-tile">
                <span class="tile-icon ${color}">${esc(m ? m[1] : '•')}</span>
                <span class="min-w-0">
                    <span class="block text-xs sm:text-sm font-bold text-indigo-950">${esc(m ? m[2] : text)}</span>
                    ${TILE_HINTS[id] ? `<span class="block text-[11px] text-slate-500 leading-snug">${esc(TILE_HINTS[id])}</span>` : ''}
                    ${badge}
                </span>
            </button>`;
        }).join('');
        return `<section>
            <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">${esc(g.querySelector('summary').textContent.trim())}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">${tiles}</div>
        </section>`;
    }).join('');
}

function renderHomeStats() {
    const yearPrograms = state.programs.filter(p => String(p.firstDate).slice(0, 4) === String(state.year)).length;
    const pending = state.records.filter(r => !r.confirmed).length;
    const card = (label, value, color, tab) => `
        <button ${tab ? `onclick="switchTab('${tab}')"` : 'disabled'} class="text-left bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 ${tab ? 'hover:border-indigo-300' : 'cursor-default'}">
            <p class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">${esc(label)}</p>
            <p class="text-2xl sm:text-3xl font-black ${color}">${esc(value)}</p>
        </button>`;
    let html;
    if (isAdmin()) {
        const officers = officerTotals(state.records);
        const done = officers.filter(o => o.hours >= TARGET_HOURS).length;
        html = card(`Records ${state.year}`, state.records.length, 'text-indigo-900', 'training-namelist-report')
            + card('Waiting confirmation', pending, pending ? 'text-rose-600' : 'text-emerald-600', 'confirm-attendance')
            + card(`Programs ${state.year}`, yearPrograms, 'text-amber-600', 'manage-programs')
            + card('Completed 12 hours', `${done}/${officers.length}`, 'text-emerald-700', 'completed');
    } else {
        html = card(`Progress submitted ${state.year}`, state.progress.length, 'text-amber-600', 'progress-entry')
            + card(`Training plans ${state.year}`, state.plans.length, 'text-teal-700', 'training-plan-report')
            + card(`Programs ${state.year}`, yearPrograms, 'text-indigo-900', null)
            + card('Notifications', state.notifications.length, 'text-rose-600', 'notifications-tab');
    }
    $('homeStats').innerHTML = html;
}

// ===================== Change password =====================

function openChangePasswordModal(forced) {
    if (!state.user) return;
    state.forcePasswordChange = !!forced;
    $('changePasswordReason').classList.toggle('hidden', !forced);
    $('cpCancelBtn').classList.toggle('hidden', !!forced);
    $('cpLogoutBtn').classList.toggle('hidden', !forced);
    $('cpUsername').value = state.user.username;
    $('changePasswordModal').classList.remove('hidden');
    closeMobileSidebar();
    $('cpCurrent').focus();
}

function closeChangePasswordModal(force) {
    if (state.forcePasswordChange && !force) return;
    $('changePasswordModal').classList.add('hidden');
    ['cpCurrent', 'cpNew', 'cpConfirm'].forEach(id => { $(id).value = ''; });
    state.forcePasswordChange = false;
}

async function handleChangePassword(e) {
    e.preventDefault();
    const pw = $('cpNew').value;
    if (pw !== $('cpConfirm').value) { notify('The two new passwords do not match.', 'error'); return; }
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
        notify('Password must be at least 8 characters with both letters and numbers.', 'error');
        return;
    }
    try {
        const res = await post('change_password', { currentPassword: $('cpCurrent').value, newPassword: pw });
        const wasForced = state.forcePasswordChange;
        closeChangePasswordModal(true);
        state.user = res.user;
        notify('Password changed successfully.');
        if (wasForced) {
            await loadAll();
            switchTab('home');
        }
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ===================== Server backups =====================

function formatBytes(n) {
    if (n >= 1048576) return (n / 1048576).toFixed(1) + ' MB';
    if (n >= 1024) return Math.round(n / 1024) + ' KB';
    return n + ' B';
}

async function loadServerBackups() {
    const body = $('serverBackupsBody');
    if (!body || role() !== 'super') return;
    try {
        const res = await api('list_backups');
        $('backupKeepDays').textContent = res.keepDays;
        const firstOfMonth = new Set();
        res.backups.slice().reverse().forEach(b => {
            const m = b.date.slice(0, 7);
            if (![...firstOfMonth].some(n => n.startsWith('mdtu_backup_' + m))) firstOfMonth.add(b.name);
        });
        body.innerHTML = res.backups.length ? res.backups.map(b => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-2 font-bold text-indigo-950">${esc(formatDateLong(b.date))}${firstOfMonth.has(b.name) ? ' <span class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">MONTHLY · KEPT</span>' : ''}</td>
                <td class="p-2 font-mono text-[11px]">${esc(b.name)}</td>
                <td class="p-2 text-right">${formatBytes(b.size)}</td>
                <td class="p-2 text-center"><a href="api.php?action=download_backup&amp;name=${encodeURIComponent(b.name)}" class="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[10px] font-bold">⬇ Download</a></td>
            </tr>`).join('')
            : emptyRow(4, res.writable ? 'No server backups yet.' : 'The backups folder cannot be written on this server. Ask the hosting provider to allow PHP to write to the "backups" folder.');
    } catch (err) {
        body.innerHTML = emptyRow(4, err.message);
    }
}

async function createServerBackup() {
    setBusy(true, 'Creating a full backup on the server...');
    try {
        const res = await post('create_backup');
        notify(`Backup created: ${res.name}`);
        archiveLog(`Server backup created: ${res.name}`);
        await loadServerBackups();
    } catch (err) {
        notify(err.message, 'error');
    } finally {
        setBusy(false);
    }
}

// ===================== Audit log =====================

const AUDIT_LABELS = {
    'login.success': '🔓 Login',
    'login.failed': '⛔ Failed login',
    'login.blocked': '🚫 Login blocked',
    'logout': '🔒 Logout',
    'password.changed': '🔑 Password changed',
    'password.change_failed': '⚠️ Wrong current password',
    'user.create': '👤 User created',
    'user.delete': '🗑️ User deleted',
    'user.password_reset': '🔑 Password reset',
    'record.create': '➕ Record added',
    'record.update': '✏️ Record changed',
    'record.confirm_bulk': '✅ Records confirmed',
    'record.delete': '🗑️ Record deleted',
    'program.create': '➕ Program added',
    'program.update': '✏️ Program changed',
    'program.delete': '🗑️ Program deleted',
    'progress.submit': '📈 Progress submitted',
    'plan.create': '📝 Training plan added',
    'plan.import': '📥 Training plans imported',
    'resource_persons.replace': '👥 Resource persons replaced',
    'staff_matrix.replace': '📁 Staff matrix replaced',
    'notification.send': '🔔 Notification sent',
    'notification.update': '✏️ Notification changed',
    'notification.delete': '🗑️ Notification deleted',
    'chat.delete': '🗑️ Chat message deleted',
    'certificate.issue': '🧾 Certificate issued',
    'settings.update': '⚙️ Settings changed',
    'backup.created': '🗄️ Backup created',
    'backup.download': '⬇️ Backup downloaded',
    'audit.verify': '✔️ Integrity check',
    'system.schema_upgrade': '🛠️ System upgrade',
};

let auditRows = [];

function auditDetails(row) {
    try { return row.details ? JSON.parse(row.details) : null; } catch (e) { return row.details; }
}

function auditSummary(row) {
    const d = auditDetails(row);
    if (!d || typeof d !== 'object') return d ? String(d) : '';
    const src = d.deletedRow || d.after || d;
    const parts = [];
    ['name', 'nic', 'program', 'trainingName', 'username', 'title', 'office', 'month', 'type', 'mode', 'certSerial', 'kind', 'reason'].forEach(k => {
        if (src[k] !== undefined && src[k] !== null && src[k] !== '' && typeof src[k] !== 'object') parts.push(`${k}: ${src[k]}`);
    });
    if (d.ids) parts.push(`${d.ids.length} record(s)`);
    if (d.replacedRows) parts.push(`${d.replacedRows.length} old row(s) saved`);
    if (row.action === 'settings.update') parts.push('changed: ' + Object.keys(d).join(', '));
    if (row.action === 'audit.verify') parts.push(d.ok ? `intact (${d.total} entries)` : 'PROBLEM FOUND');
    return parts.join(' · ') || JSON.stringify(d).slice(0, 140);
}

function initAuditLog() {
    if (state.auditLoaded) return;
    state.auditLoaded = true;
    loadAuditLog();
}

async function loadAuditLog() {
    const params = { from: $('auditFrom').value, to: $('auditTo').value, user: $('auditUser').value, q: $('auditSearch').value.trim(), limit: 1000 };
    try {
        const res = await api('get_audit', { params });
        auditRows = res.rows;
        const sel = $('auditUser');
        const cur = sel.value;
        sel.innerHTML = '<option value="">All users</option>' + res.users.map(u => `<option value="${esc(u)}" ${u === cur ? 'selected' : ''}>${esc(u)}</option>`).join('');
        $('auditCount').textContent = `Showing ${res.rows.length} of ${res.total} audit entries (newest first).`;
        $('auditTableBody').innerHTML = res.rows.length ? res.rows.map(r => {
            const danger = /failed|blocked|delete|replace/.test(r.action);
            const d = auditDetails(r);
            return `<tr class="border-b align-top ${danger ? 'bg-rose-50/70' : 'hover:bg-slate-50'}">
                <td class="p-2 font-mono text-[10px] text-slate-400">${r.id}</td>
                <td class="p-2 font-mono text-[11px] whitespace-nowrap">${esc(r.createdAt)}</td>
                <td class="p-2"><span class="font-bold text-indigo-950">${esc(r.username)}</span><br><span class="text-[10px] uppercase text-amber-700 font-bold">${esc(ROLE_LABELS[r.role] || r.role)}</span></td>
                <td class="p-2 font-bold whitespace-nowrap ${danger ? 'text-rose-700' : 'text-slate-800'}">${esc(AUDIT_LABELS[r.action] || r.action)}</td>
                <td class="p-2 text-[11px] text-slate-600">${esc([r.entity, r.entityId].filter(Boolean).join(' #'))}</td>
                <td class="p-2 text-[11px] max-w-md">${d ? `<details><summary class="cursor-pointer text-slate-700">${esc(auditSummary(r))}</summary>
                    <pre class="whitespace-pre-wrap break-all text-[10px] bg-slate-50 border p-2 rounded mt-1 max-h-64 overflow-auto">${esc(typeof d === 'string' ? d : JSON.stringify(d, null, 2))}</pre></details>` : ''}</td>
                <td class="p-2 font-mono text-[10px] text-slate-500">${esc(r.ip || '')}</td>
            </tr>`;
        }).join('') : emptyRow(7, 'No audit entries match these filters.');
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function verifyAuditLog() {
    const box = $('auditIntegrity');
    setBusy(true, 'Checking every audit entry...');
    try {
        const res = await api('verify_audit');
        box.className = 'text-xs font-bold rounded-lg p-3 border ' + (res.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-400');
        box.textContent = res.ok
            ? `✔️ All ${res.total} audit entries are intact. No tampering detected (checked ${new Date().toLocaleString('en-GB')}).`
            : `⚠️ TAMPERING DETECTED: ${res.reason} ${res.total} entries were verified before the problem. Restore from a backup and report this immediately.`;
        loadAuditLog();
    } catch (err) {
        notify(err.message, 'error');
    } finally {
        setBusy(false);
    }
}

async function auditLogPDF() {
    if (!auditRows.length) { notify('There are no audit entries to export.', 'warning'); return; }
    setBusy(true, 'Preparing PDF...');
    try {
        const filters = [
            `Period: ${$('auditFrom').value || 'beginning'} to ${$('auditTo').value || todayISO()}`,
            `User: ${$('auditUser').value || 'All users'}${$('auditSearch').value.trim() ? `   Search: "${$('auditSearch').value.trim()}"` : ''}`,
            `Entries: ${auditRows.length}`,
        ];
        const doc = await buildRegisterPdf({
            title: 'System Audit Log',
            filters,
            head: ['#', 'Date & Time', 'User', 'Action', 'Record', 'Details', 'IP Address'],
            body: auditRows.map(r => [r.id, r.createdAt, `${r.username} (${ROLE_LABELS[r.role] || r.role})`,
                (AUDIT_LABELS[r.action] || r.action).replace(/^\S+\s/, ''), [r.entity, r.entityId].filter(Boolean).join(' #'), auditSummary(r), r.ip || '']),
            columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 30 }, 2: { cellWidth: 34 }, 3: { cellWidth: 36 }, 4: { cellWidth: 34 }, 6: { cellWidth: 26 } },
            signatures: false,
        });
        doc.save(`MDTU_Audit_Log_${todayISO()}.pdf`);
    } catch (err) {
        notify('Could not create the PDF: ' + err.message, 'error');
    } finally {
        setBusy(false);
    }
}

function auditLogExcel() {
    if (!auditRows.length) { notify('There are no audit entries to export.', 'warning'); return; }
    const rows = auditRows.map(r => ({ ID: r.id, 'Date & Time': r.createdAt, User: r.username, Role: r.role, Action: r.action,
        Entity: r.entity || '', 'Entity ID': r.entityId || '', Summary: auditSummary(r), Details: r.details || '', IP: r.ip || '' }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Audit Log');
    XLSX.writeFile(wb, `MDTU_Audit_Log_${todayISO()}.xlsx`);
}

// ===================== Issued certificates register =====================

let regRows = [];

function logCertificate(recordId, type, mode) {
    const id = parseInt(recordId, 10);
    if (id) post('log_certificate', { recordId: id, type, mode }).catch(() => { /* never block the download */ });
}

function initCertRegister() {
    const sel = $('regProgram');
    const cur = sel.value;
    sel.innerHTML = `<option value="">All programs in ${state.year}</option>`
        + state.programs.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.firstDate)})</option>`).join('');
    sel.value = cur && Array.from(sel.options).some(o => o.value === cur) ? cur : '';
    loadCertRegister();
}

async function loadCertRegister() {
    const params = { type: $('regType').value, scope: $('regScope').value, programId: $('regProgram').value, year: state.year,
        from: $('regFrom').value, to: $('regTo').value };
    try {
        const res = await api('cert_register', { params });
        regRows = res.rows;
        renderCertRegister();
    } catch (err) {
        notify(err.message, 'error');
    }
}

function formatDateTimeShort(dt) {
    if (!dt) return '';
    const [d, t] = String(dt).split(' ');
    return `${d} ${String(t || '').slice(0, 5)}`.trim();
}

function renderCertRegister() {
    const issued = regRows.filter(r => r.timesIssued > 0).length;
    const times = regRows.reduce((s, r) => s + r.timesIssued, 0);
    const programs = new Set(regRows.map(r => r.trainingName + r.date)).size;
    const card = (label, value, color) => `<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${esc(label)}</p><p class="text-2xl font-black ${color}">${value}</p></div>`;
    $('regSummary').innerHTML = card('Officers listed', regRows.length, 'text-indigo-900') + card('Certificates issued', issued, 'text-emerald-700')
        + card('Not yet issued', regRows.length - issued, 'text-amber-600') + card(`Downloads / prints · ${programs} program(s)`, times, 'text-rose-700');
    $('regTableBody').innerHTML = regRows.length ? regRows.map((r, i) => `
        <tr class="border-b hover:bg-slate-50 ${r.timesIssued ? '' : 'text-slate-400'}">
            <td class="p-2">${i + 1}</td>
            <td class="p-2 font-mono text-[10px]">${esc(r.certSerial)}</td>
            <td class="p-2 font-bold text-indigo-950">${escTx(r.name)}</td>
            <td class="p-2 font-mono">${esc(r.nic)}</td>
            <td class="p-2">${escTx(r.designation)}<br><span class="text-[10px] text-slate-500">${escTx(r.office)}</span></td>
            <td class="p-2">${esc(r.trainingName)}${r.programFileNo ? `<br><span class="text-[10px] text-slate-500 font-mono">${esc(r.programFileNo)}</span>` : ''}</td>
            <td class="p-2">${esc(formatProgramDates(r.programDates))}</td>
            <td class="p-2 text-center font-bold">${r.effectiveHours}</td>
            <td class="p-2 font-mono text-[10px]">${r.firstIssued ? esc(formatDateTimeShort(r.firstIssued)) : '<span class="text-amber-600 font-bold">Not issued</span>'}</td>
            <td class="p-2 text-center font-bold">${r.timesIssued || '-'}</td>
        </tr>`).join('') : emptyRow(10, 'No certificates match these filters.');
}

function certRegisterTitle() {
    const type = $('regType').value;
    if ($('regScope').value === 'confirmed') return 'Register of Confirmed Participants';
    return type === 'completion' ? 'Register of Issued e-Certificates (Completion)'
        : type === 'any' ? 'Register of Issued Training Certificates' : 'Register of Issued Certificates of Attendance';
}

function certRegisterFilters() {
    const progSel = $('regProgram');
    const from = $('regFrom').value, to = $('regTo').value;
    const lines = [`Program: ${progSel.value ? progSel.options[progSel.selectedIndex].text : `All programs in ${state.year}`}`];
    const program = state.programs.find(p => String(p.id) === progSel.value);
    if (program) lines.push(`File No: ${program.fileNo || '-'}    Venue: ${program.venue || '-'}    Dates: ${formatProgramDates(program.dates)}`);
    lines.push(`Certificate: ${$('regType').options[$('regType').selectedIndex].text}    List: ${$('regScope').options[$('regScope').selectedIndex].text}`
        + (from || to ? `    Issued between: ${from || 'beginning'} and ${to || todayISO()}` : ''));
    lines.push(`Officers listed: ${regRows.length}    Certificates issued: ${regRows.filter(r => r.timesIssued > 0).length}`);
    return lines;
}

/** PDF table layout. For a single program the program name and dates are already in the heading. */
function certRegisterColumns(singleProgram) {
    const issued = r => r.firstIssued ? formatDateTimeShort(r.firstIssued) : 'Not issued';
    const center = w => ({ cellWidth: w, halign: 'center' });
    if (singleProgram) {
        return {
            head: ['No', 'Certificate No', 'Name', 'NIC', 'Designation', 'Office', 'Hours', 'First Issued', 'Times'],
            body: regRows.map((r, i) => [i + 1, r.certSerial, r.name, r.nic, r.designation, r.office, r.effectiveHours, issued(r), r.timesIssued || '-']),
            columnStyles: { 0: center(10), 1: { cellWidth: 36 }, 2: { cellWidth: 58 }, 3: { cellWidth: 28 }, 4: { cellWidth: 40 }, 5: { cellWidth: 53 },
                6: center(13), 7: { cellWidth: 27 }, 8: center(12) },
        };
    }
    return {
        head: ['No', 'Certificate No', 'Name', 'NIC', 'Designation', 'Office', 'Program', 'Program Dates', 'Hours', 'First Issued', 'Times'],
        body: regRows.map((r, i) => [i + 1, r.certSerial, r.name, r.nic, r.designation, r.office, r.trainingName,
            formatProgramDates(r.programDates), r.effectiveHours, issued(r), r.timesIssued || '-']),
        columnStyles: { 0: center(9), 1: { cellWidth: 35 }, 2: { cellWidth: 35 }, 3: { cellWidth: 23 }, 4: { cellWidth: 26 }, 5: { cellWidth: 30 },
            6: { cellWidth: 41 }, 7: { cellWidth: 26 }, 8: center(11), 9: { cellWidth: 26 }, 10: center(11) },
    };
}

async function certRegisterPDF(mode) {
    if (!regRows.length) { notify('The list is empty. Click "Show List" or change the filters.', 'warning'); return; }
    const printWindow = mode === 'print' ? window.open('', '_blank') : null;
    setBusy(true, 'Preparing PDF...');
    try {
        const doc = await buildRegisterPdf({
            title: certRegisterTitle(),
            filters: certRegisterFilters(),
            ...certRegisterColumns(!!$('regProgram').value),
            signatures: true,
        });
        const name = `MDTU_Certificate_Register_${todayISO()}.pdf`;
        if (mode === 'print') {
            doc.autoPrint();
            const url = doc.output('bloburl');
            if (printWindow) printWindow.location.href = url; else window.open(url, '_blank');
        } else {
            doc.save(name);
        }
    } catch (err) {
        if (printWindow) printWindow.close();
        notify('Could not create the PDF: ' + err.message, 'error');
    } finally {
        setBusy(false);
    }
}

function certRegisterExcel() {
    if (!regRows.length) { notify('The list is empty. Click "Show List" or change the filters.', 'warning'); return; }
    const rows = regRows.map((r, i) => ({
        No: i + 1, 'Certificate No': r.certSerial, Name: r.name, NIC: r.nic, Designation: r.designation, Office: r.office,
        Program: r.trainingName, 'File No': r.programFileNo || '', 'Program Dates': formatProgramDates(r.programDates), Hours: r.effectiveHours,
        'Confirmed By': r.confirmedBy || '', 'First Issued': r.firstIssued || '', 'Last Issued': r.lastIssued || '', 'Times Issued': r.timesIssued,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Certificates');
    XLSX.writeFile(wb, `MDTU_Certificate_Register_${todayISO()}.xlsx`);
}

// ===================== Official multi-page register PDF =====================

const pdfImageCache = {};

function loadPdfImage(src) {
    if (!pdfImageCache[src]) {
        pdfImageCache[src] = new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                c.getContext('2d').drawImage(img, 0, 0);
                resolve({ data: c.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
            };
            img.onerror = () => reject(new Error('image not found'));
            img.src = src;
        }).catch(() => null);
    }
    return pdfImageCache[src];
}

/** A4 landscape register on the Chief Secretary's Office heading, with page numbers and signature lines. */
async function buildRegisterPdf({ title, filters = [], head, body, columnStyles = {}, signatures = true }) {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('PDF library could not be loaded. Check your internet connection.');
    const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    if (typeof doc.autoTable !== 'function') throw new Error('PDF table library could not be loaded. Check your internet connection.');
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const [emblem, logo] = await Promise.all([loadPdfImage(state.settings.stateEmblem || DEFAULT_STATE_EMBLEM), loadPdfImage('assets/nwp-logo.png')]);

    const drawHeader = () => {
        const putImage = (img, alias, x, alignRight) => {
            if (!img) return;
            const h = 19, w = h * img.w / img.h;
            doc.addImage(img.data, 'PNG', alignRight ? x - w : x, 7, w, h, alias, 'FAST');
        };
        putImage(emblem, 'stateEmblem', 10, false);
        putImage(logo, 'nwpLogo', W - 10, true);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 26, 26);
        doc.setFontSize(13);
        doc.text("Chief Secretary's Office - North Western Province", W / 2, 12, { align: 'center' });
        doc.setTextColor(30, 27, 75);
        doc.setFontSize(9);
        doc.text('Management Development and Training Unit (MDTU), Kurunegala', W / 2, 17, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(title.toUpperCase(), W / 2, 23.5, { align: 'center' });
        doc.setDrawColor(139, 26, 26);
        doc.setLineWidth(0.6);
        doc.line(10, 28, W - 10, 28);
    };

    drawHeader();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    let y = 33;
    filters.forEach(line => { doc.text(String(line), 10, y); y += 4.2; });

    doc.autoTable({
        head: [head],
        body,
        startY: y,
        margin: { top: 32, left: 10, right: 10, bottom: 14 },
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 7.4, cellPadding: 1.3, overflow: 'linebreak', valign: 'middle', lineColor: [190, 190, 200], lineWidth: 0.15 },
        headStyles: { fillColor: [30, 27, 75], textColor: 255, fontStyle: 'bold', halign: 'center' },
        alternateRowStyles: { fillColor: [246, 247, 255] },
        columnStyles,
        rowPageBreak: 'avoid',
        didDrawPage: data => { if (data.pageNumber > 1) drawHeader(); },
    });

    if (signatures) {
        let sy = doc.lastAutoTable.finalY + 22;
        if (sy > H - 20) {
            doc.addPage();
            drawHeader();
            sy = 55;
        }
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        const labels = ['Prepared by', 'Checked by', 'Approved by'];
        const colW = (W - 20) / labels.length;
        labels.forEach((label, i) => {
            const x = 10 + i * colW + 10;
            doc.setLineDashPattern([0.8, 0.8], 0);
            doc.line(x, sy, x + colW - 25, sy);
            doc.setLineDashPattern([], 0);
            doc.text(`${label} (Name, Signature & Date)`, x, sy + 4.5);
        });
    }

    const pages = doc.getNumberOfPages();
    const stamp = `Generated by the MDTU Training Management System on ${new Date().toLocaleString('en-GB')} by ${currentName()}`;
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(110, 110, 110);
        doc.text(stamp, 10, H - 6);
        doc.text(`Page ${i} of ${pages}`, W - 10, H - 6, { align: 'right' });
    }
    return doc;
}

// ===================== Export helpers =====================

function exportTableToExcel(tableId, filename) {
    const wb = XLSX.utils.table_to_book($(tableId), { sheet: 'Sheet1' });
    XLSX.writeFile(wb, `${filename}_${state.year}.xlsx`);
}

function downloadOfficialReportPDF(containerId, filename) {
    html2pdf().from($(containerId)).set({
        margin: 10,
        filename: `${filename}_${state.year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    }).save();
}

function downloadAnalyticsPDF() {
    html2pdf().from($('pdfContentArea')).set({
        margin: 8,
        filename: `MDTU_Evaluation_Analytics_${state.year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).save();
}

// ===================== Boot =====================

['handleLogin', 'handleChangePassword', 'handleSingleSubmit', 'handleSaveProgramConfig',
 'handleSaveSuperuserProgress', 'handleSaveTrainingPlan', 'handleSendNotification',
 'handleUserSendMessage', 'handleSendLiveChatMessage', 'handleCreateUser',
 'saveTemplateDetails', 'saveNewAlert'].forEach(name => {
    if (typeof window[name] === 'function') window[name] = guardSubmit(window[name]);
});

window.addEventListener('resize', debounce(fitCertificates, 150));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileSidebar(); });
loadAll();
setInterval(pollMessages, 20000);

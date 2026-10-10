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

function convertNicFormat(nicStr) {
    const clean = String(nicStr || '').replace(/\s+/g, '').toUpperCase();
    const m = clean.match(/^(\d{2})(\d{3})(\d{4})[VX]$/);
    return m ? `19${m[1]}${m[2]}0${m[3]}` : clean;
}

function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
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
    'training-plan-report': () => renderTrainingPlanTable(),
    'resource-persons-master-report': () => renderMasterResourcePersonsTable(),
    'analytics': () => renderAnalytics(),
    'resource-report': () => renderResourceReport(),
    'duty-report': () => renderDutyReport(),
    'pending': () => renderPendingReport(),
    'completed': () => renderCompletedReport(),
    'training-namelist-report': () => filterTrainingNamelist(),
    'office-report': () => generateOfficeReport(),
    'office-designation-report': () => generateOfficeDesignationReport(),
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
    try {
        const res = await post('login', { username: $('loginUsername').value.trim(), password: $('loginPassword').value });
        state.user = res.user;
        $('loginPassword').value = '';
        toggleAuthModal();
        await loadAll();
        notify(`Logged in as ${res.user.username} (${res.user.role.toUpperCase()})`);
        if (!res.user.mustChangePassword) switchTab('home');
    } catch (err) {
        notify(err.message, 'error');
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

function updateProgramDropdowns() {
    const options = state.programs.map(p => `<option value="${p.id}">${esc(programLabel(p))}</option>`).join('');
    const setSelect = (id, first) => {
        const el = $(id);
        if (!el) return;
        const prev = el.value;
        el.innerHTML = first + options;
        if ([...el.options].some(o => o.value === prev)) el.value = prev;
    };
    setSelect('trainingNameSelect', '<option value="">-- Select the program you attended --</option>');
    setSelect('adminConfirmProgramSelect', '<option value="">-- All Programs --</option>');
    setSelect('analyticsTrainingSelect', '<option value="all">All Programs</option>');
    setSelect('tnFilterProgram', '<option value="">-- All Programs --</option>');
    setSelect('resourceProgramSelect', '<option value="">All Programs</option>');

    const venues = [...new Set(state.programs.map(p => p.venue))];
    if ($('venueDatalist')) $('venueDatalist').innerHTML = venues.map(v => `<option value="${esc(v)}">`).join('');
    if ($('resourcePersonDatalist')) $('resourcePersonDatalist').innerHTML = state.resourcePersons.map(r => `<option value="${esc(r.name)}">`).join('');
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
    container.innerHTML = p.resourcePersons.length === 0
        ? '<p class="text-xs text-slate-500">No resource persons listed for this program.</p>'
        : p.resourcePersons.map(rp => `
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
        tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400">No programs yet. Add the first program above.</td></tr>';
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
                <td class="p-2">${esc(p.resourcePersons.join(', ') || '-')}</td>
                <td class="p-2 text-center font-bold">${count}</td>
                <td class="p-2 text-center whitespace-nowrap">
                    <button onclick="editProgram(${p.id})" class="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold">Edit</button>
                    <button onclick="deleteProgram(${p.id})" class="bg-rose-600 text-white px-2 py-1 rounded text-[10px] font-bold">Delete</button>
                </td>
            </tr>`;
    }).join('');
}

const FILE_NO_PREFIX = 'NWP/CS/T/2/';

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

function addResourcePersonConfigRow(value = '') {
    const div = document.createElement('div');
    div.className = 'flex gap-2';
    div.innerHTML = `<input type="text" list="resourcePersonDatalist" placeholder="Resource Person / Lecturer Name" class="flex-1 p-2 text-xs border rounded outline-none resource-person-input"><button type="button" onclick="this.parentElement.remove()" class="bg-rose-600 text-white px-3 py-1 rounded text-xs font-bold">X</button>`;
    div.querySelector('input').value = value;
    $('progResourcePersonsContainer').appendChild(div);
}

function resetProgramForm() {
    $('programConfigForm').reset();
    $('progIdConfig').value = '';
    $('progResourcePersonsContainer').innerHTML = '';
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
    p.resourcePersons.forEach(rp => addResourcePersonConfigRow(rp));
    $('progFormTitle').textContent = `✏️ Editing: ${p.name}`;
    $('progSaveBtn').textContent = '💾 Update Program';
    $('progCancelEditBtn').classList.remove('hidden');
    $('programConfigForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        resourcePersons: qsa('.resource-person-input').map(i => i.value.trim()).filter(Boolean),
    };
    try {
        const res = await post('save_program', payload);
        state.programs = res.programs;
        updateProgramDropdowns();
        populateYearSelector();
        resetProgramForm();
        notify(id ? 'Program updated (linked records were updated too).' : 'Program saved to the database.');
        if (id) await reloadRecords();
        renderConfiguredProgramsTable();
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

const autoFillOfficer = debounce(async nic => {
    const o = await lookupOfficer(nic);
    if (o && convertNicFormat($('nicInput').value) === nic) {
        $('nameInput').value = o.name || '';
        $('designationInput').value = o.designation || '';
        $('officeInput').value = o.office || '';
        $('nicFormatNotice').textContent = `NIC: ${nic} — details loaded from the database ✓`;
    }
}, 400);

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

    const payload = {
        nic: convertNicFormat($('nicInput').value),
        name: $('nameInput').value.trim(),
        designation: $('designationInput').value.trim(),
        office: $('officeInput').value.trim(),
        programId: program.id,
        foodRating: parseInt($('foodRatingInput').value, 10),
        coordinationRating: parseInt($('coordinationRatingInput').value, 10),
        feedback: $('feedbackInput').value.trim(),
        lecturerEvals: qsa('select[name="lecturerRating"]').map(sel => ({ lecturer: sel.getAttribute('data-lecturer'), rating: parseInt(sel.value, 10) })),
    };

    const btn = $('saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving to database...';
    try {
        const res = await post('save_record', payload);
        officerCache[payload.nic] = { nic: payload.nic, name: payload.name, designation: payload.designation, office: payload.office };
        if (state.user && res.record.year === state.year) state.records.unshift(res.record);
        state.offices.push(payload.office);
        state.designations.push(payload.designation);
        if (state.user && !state.officers.some(o => o.nic === payload.nic)) state.officers.push(officerCache[payload.nic]);
        updateOfficeDropdowns();
        notify(res.record.confirmed
            ? 'Training record saved and confirmed.'
            : 'Training record saved. MDTU will confirm your attendance before certificates can be downloaded.');
        $('addTrainingForm').reset();
        $('nicFormatNotice').textContent = '';
        onProgramSelected();
    } catch (err) {
        notify(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Training Record & Evaluation';
    }
}

// ===================== Offices =====================

function allOffices() {
    return [...new Set([
        ...state.offices,
        ...state.staffMatrix.map(m => m.office),
        ...state.records.map(r => r.office),
        ...state.progress.map(p => p.office),
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function updateOfficeDropdowns() {
    const offices = allOffices();
    const opts = offices.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
    [['officeReportSelect', '<option value="">-- Choose Office --</option>'],
     ['officeDesignationSelect', '<option value="">-- Select Office --</option>'],
     ['presOfficeSelect', '<option value="all">All Offices</option>'],
     ['dashProgressOffice', '<option value="all">All Offices</option>']].forEach(([id, first]) => {
        const el = $(id);
        if (!el) return;
        const prev = el.value;
        el.innerHTML = first + opts;
        if ([...el.options].some(o => o.value === prev)) el.value = prev;
    });
    if ($('officeDatalist')) $('officeDatalist').innerHTML = offices.map(o => `<option value="${esc(o)}">`).join('');

    const designations = [...new Set([...state.designations, ...state.records.map(r => r.designation)].filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    if ($('designationDatalist') && designations.length) $('designationDatalist').innerHTML = designations.map(d => `<option value="${esc(d)}">`).join('');
    if ($('officerNameDatalist')) $('officerNameDatalist').innerHTML = state.officers.map(o => `<option value="${esc(o.name)}">${esc(o.nic)}</option>`).join('');
}

/** Picking a known officer name (staff only) fills NIC, designation and office. */
function onOfficerNameChosen() {
    const name = $('nameInput').value.trim().toLowerCase();
    const matches = state.officers.filter(o => o.name.toLowerCase() === name);
    if (matches.length !== 1) return;
    const o = matches[0];
    if (!$('nicInput').value.trim()) {
        $('nicInput').value = o.nic;
        $('nicFormatNotice').textContent = `NIC: ${o.nic} — details loaded from the database ✓`;
    }
    if (!$('designationInput').value.trim()) $('designationInput').value = o.designation || '';
    if (!$('officeInput').value.trim()) $('officeInput').value = o.office || '';
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

function emptyRow(cols, text) {
    return `<tr><td colspan="${cols}" class="p-4 text-center text-slate-400">${esc(text)}</td></tr>`;
}

function staffCountsFor(office) {
    const entry = state.staffMatrix.find(m => m.office === office);
    return entry ? entry.counts : null;
}

function designationBreakdown(office) {
    const officers = officerTotals(state.records.filter(r => r.office === office));
    const counts = staffCountsFor(office);
    const desigs = counts ? Object.keys(counts) : [...new Set([...DEFAULT_DESIGNATIONS, ...officers.map(o => o.designation)])];
    return desigs.map(d => {
        const list = officers.filter(o => o.designation === d);
        const c12 = list.filter(o => o.hours >= TARGET_HOURS).length;
        const c6 = list.filter(o => o.hours >= 6 && o.hours < TARGET_HOURS).length;
        const total = counts && counts[d] !== undefined ? parseInt(counts[d], 10) || 0 : list.length;
        return { designation: d, total, c12, c6, none: Math.max(0, total - c12 - c6), incomplete: Math.max(0, total - c12) };
    });
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
    renderDashboardProgress();
    const pending = state.records.filter(r => !r.confirmed).length;
    $('overviewTableBody').innerHTML = (pending ? `<tr><td colspan="6" class="p-3 bg-amber-50 text-amber-900 font-bold">⏳ ${pending} record(s) waiting for attendance confirmation — <a href="#" onclick="switchTab('confirm-attendance'); return false;" class="underline">confirm now</a></td></tr>` : '')
        + (officers.length ? officers.map(o => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 font-semibold">${esc(o.office)}</td>
                <td class="p-3 font-mono">${esc(o.nic)}</td>
                <td class="p-3 font-bold">${esc(o.name)}</td>
                <td class="p-3">${esc(o.designation)}</td>
                <td class="p-3 text-center font-bold text-indigo-900">${o.hours}h</td>
                <td class="p-3 text-center">${statusBadge(o.hours)}</td>
            </tr>`).join('') : emptyRow(6, `No confirmed training records for ${state.year}.`));
}

function generateOfficeReport() {
    const office = $('officeReportSelect').value;
    const officers = officerTotals(state.records.filter(r => r.office === office));
    const header = $('officeReportHeader');
    const section = $('officeCompletedSection');
    if (!office) { header.classList.add('hidden'); section.classList.add('hidden'); return; }
    $('officeReportTitle').textContent = office;
    $('officeReportSubtitle').textContent = `Training Hours Report - ${state.year} (confirmed attendance)`;
    header.classList.remove('hidden');
    section.classList.remove('hidden');
    $('officeCompletedTableBody').innerHTML = officers.length ? officers.map(o => `
        <tr class="border-b">
            <td class="p-2 font-mono">${esc(o.nic)}</td>
            <td class="p-2 font-bold">${esc(o.name)}</td>
            <td class="p-2">${esc(o.designation)}</td>
            <td class="p-2 text-center font-bold ${o.hours >= TARGET_HOURS ? 'text-emerald-700' : 'text-amber-700'}">${o.hours}h</td>
        </tr>`).join('') : emptyRow(4, 'No confirmed records for this office.');
}

function generateOfficeDesignationReport() {
    const office = $('officeDesignationSelect').value;
    const header = $('officeDesignationHeader');
    const tbody = $('officeDesignationTableBody');
    if (!office) { header.classList.add('hidden'); tbody.innerHTML = ''; return; }
    $('odReportTitle').textContent = office;
    $('odReportSubtitle').textContent = `Designation-wise Hours Summary (${state.year})`;
    header.classList.remove('hidden');
    tbody.innerHTML = designationBreakdown(office).map(d => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 font-bold text-indigo-950">${esc(d.designation)}</td>
            <td class="p-3 text-center font-bold">${d.total}</td>
            <td class="p-3 text-center text-emerald-700 font-bold">${d.c12}</td>
            <td class="p-3 text-center text-rose-700 font-bold">${d.incomplete}</td>
            <td class="p-3 text-center text-amber-700 font-bold">${d.c6}</td>
        </tr>`).join('');
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
            <td class="p-3 font-bold text-indigo-950">${esc(r.name)}${r.confirmed ? '' : ' <span class="text-[9px] text-amber-600">(pending)</span>'}</td>
            <td class="p-3">${esc(r.office)}</td>
            <td class="p-3">${esc(r.designation)}</td>
            <td class="p-3 text-center font-bold text-emerald-700">${effHours(r)}h</td>
        </tr>`).join('') : emptyRow(6, 'No participants match these filters.');
}

function renderDutyReport() {
    const officers = officerTotals(state.records);
    $('dutyReportTableBody').innerHTML = officers.length ? officers.map(o => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-3 font-semibold">${esc(o.office)}</td>
            <td class="p-3"><span class="text-slate-500">${esc(o.designation)}</span><br><strong>${esc(o.name)}</strong></td>
            <td class="p-3 text-center font-bold text-indigo-900">${o.hours}h</td>
            <td class="p-3 text-center">${statusBadge(o.hours)}</td>
        </tr>`).join('') : emptyRow(4, `No confirmed records for ${state.year}.`);
}

function renderPendingReport() {
    const groups = {};
    officerTotals(state.records).filter(o => o.hours < TARGET_HOURS).forEach(o => { (groups[o.office] = groups[o.office] || []).push(o); });
    const offices = Object.keys(groups).sort();
    $('pendingGroupedTableBody').innerHTML = offices.length ? offices.map(off => `
        <tr class="border-b align-top">
            <td class="p-3 font-bold">${esc(off)}</td>
            <td class="p-3 text-center font-black text-rose-700">${groups[off].length}</td>
            <td class="p-3">${groups[off].map(o => `${esc(o.name)} <span class="text-slate-500">(${esc(o.nic)} · ${o.hours}h)</span>`).join('<br>')}</td>
        </tr>`).join('') : emptyRow(3, 'No incomplete officers among confirmed records.');
}

function renderCompletedReport() {
    const done = officerTotals(state.records).filter(o => o.hours >= TARGET_HOURS);
    $('completedTableBody').innerHTML = done.length ? done.map(o => `
        <tr class="border-b">
            <td class="p-3 font-semibold">${esc(o.office)}</td>
            <td class="p-3 font-mono">${esc(o.nic)}</td>
            <td class="p-3 font-bold">${esc(o.name)}</td>
            <td class="p-3 text-center font-bold text-emerald-700">${o.hours}h</td>
        </tr>`).join('') : emptyRow(4, `No officers have completed ${TARGET_HOURS} hours yet.`);
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
            <td class="p-2.5 font-bold text-indigo-950">${esc(r.name)}</td>
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
            <td class="p-3 text-center"><input type="checkbox" ${r.confirmed ? 'checked' : ''} onchange="toggleConfirmAttendance(${r.id}, this.checked)" class="w-5 h-5 accent-indigo-900 cursor-pointer"></td>
            <td class="p-3 font-mono">${esc(r.nic)}</td>
            <td class="p-3 font-bold">${esc(r.name)}<div class="text-[10px] font-normal text-slate-500">${esc(r.designation)}</div></td>
            <td class="p-3">${esc(r.office)}</td>
            <td class="p-3">${esc(r.trainingName)}<div class="text-[10px] text-slate-500">📍 ${esc(r.venue || '-')}</div></td>
            <td class="p-3 text-center font-mono">${esc(r.date)}</td>
            <td class="p-3 text-center">
                <input type="text" value="${esc(r.absentDates || '')}" onchange="updateAbsentDates(${r.id}, this.value)" placeholder="${esc((r.programDates || []).join(', '))}" class="w-full p-1.5 text-xs border rounded bg-white font-mono">
            </td>
            <td class="p-3 text-center font-bold">${effHours(r)}/${r.hours}h</td>
            <td class="p-3 text-center"><button onclick="deleteRecord(${r.id})" class="bg-rose-600 text-white px-2 py-1 rounded text-[10px] font-bold">🗑️</button></td>
        </tr>`).join('') : emptyRow(9, 'No records match these filters.');
}

function replaceRecord(rec) {
    const i = state.records.findIndex(r => r.id === rec.id);
    if (i >= 0) state.records[i] = rec;
}

async function toggleConfirmAttendance(id, checked) {
    try {
        const res = await post('update_record', { id, confirmed: checked });
        replaceRecord(res.record);
        notify(checked ? 'Attendance confirmed.' : 'Confirmation removed.', checked ? 'success' : 'info');
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
    return { nic, records: await api('records_by_nic', { params: { nic } }) };
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
        $('vOfficerName').textContent = latest.name;
        $('vOfficerDetails').textContent = `${latest.designation} - ${latest.office} (NIC: ${latest.nic})`;
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
    return `${r.trainingName} — ${formatProgramDates(r.programDates)}${r.confirmed ? '' : ' (pending confirmation)'}`;
}

async function searchAttendanceRecords() {
    const sel = $('attProgSelect');
    $('attendanceSlipContainer').classList.add('hidden');
    setAttButtons(false);
    try {
        const { records } = await fetchRecordsByNic($('attNicInput').value);
        attRecords = records;
        if (!records.length) {
            sel.innerHTML = '<option value="">-- No records found for this NIC --</option>';
            sel.disabled = true;
            setCertNotice('attStatusNotice', 'No training records were found for this NIC number. Submit your record in "Add Training Record" first.', 'error');
            return;
        }
        sel.innerHTML = '<option value="">-- Select program --</option>' + records.map(r => `<option value="${r.id}">${esc(recordOptionLabel(r))}</option>`).join('');
        sel.disabled = false;
        setCertNotice('attStatusNotice', '');
        if (records.length === 1) { sel.value = records[0].id; generateAttendanceCertSlip(); }
    } catch (err) {
        notify(err.message, 'error');
    }
}

function setAttButtons(on) {
    $('attDownloadBtn').disabled = !on;
    $('attPrintBtn').disabled = !on;
}

function generateAttendanceCertSlip() {
    const r = attRecords.find(x => String(x.id) === $('attProgSelect').value);
    const container = $('attendanceSlipContainer');
    if (!r) { container.classList.add('hidden'); setAttButtons(false); return; }
    if (!r.confirmed) {
        container.classList.add('hidden');
        setAttButtons(false);
        setCertNotice('attStatusNotice', `⏳ Your attendance for "${esc(r.trainingName)}" has not been confirmed by MDTU yet. The certificate will be available after confirmation.`, 'warning');
        return;
    }
    const dates = r.programDates || [r.date];
    const absent = absentList(r);
    const program = programById(r.programId);
    const endDate = dates.filter(Boolean).slice().sort().pop() || r.date;
    $('attSlipFileNo').textContent = r.programFileNo || (program && program.fileNo) || '';
    $('attSlipIssueDate').textContent = formatDateLong(endDate);
    $('attSlipName').textContent = r.name;
    $('attSlipNic').textContent = r.nic;
    $('attSlipDesignation').textContent = r.designation;
    $('attSlipOffice').textContent = r.office;
    $('attSlipProg').textContent = r.trainingName;
    $('attSlipVenue').textContent = r.venue || (program && program.venue) || '-';
    $('attSlipDates').textContent = formatProgramDates(dates);
    $('attSlipAbsentDates').textContent = absent.map(formatDateLong).join(', ');
    $('attSlipAbsentSection').classList.toggle('hidden', !absent.length);
    $('attSlipHours').textContent = effHours(r);
    $('attSlipSerial').textContent = r.certSerial;
    $('attSlipVerifyUrl').textContent = `This document is system generated and official attendance can be verified through ${verifyUrl(r.certSerial)}`;
    renderQr($('attSlipQr'), verifyUrl(r.certSerial));

    setCertNotice('attStatusNotice', '✓ Attendance confirmed. You can download or print the certificate.', 'success');
    container.classList.remove('hidden');
    setAttButtons(true);
    fitCertificates();
}

async function downloadAttendancePDF() {
    const nic = $('attSlipNic').textContent;
    if (await exportSheet('attendanceCertSheet', 'portrait', `MDTU_Attendance_Certificate_${nic}.pdf`, 'save')) {
        logCertificate($('attProgSelect').value, 'attendance', 'pdf');
    }
}

async function printAttendanceCert() {
    if (await exportSheet('attendanceCertSheet', 'portrait', 'MDTU_Attendance_Certificate.pdf', 'print')) {
        logCertificate($('attProgSelect').value, 'attendance', 'print');
    }
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
    if (!r.confirmed) {
        area.classList.add('hidden');
        setCertButtons(false);
        setCertNotice('certStatusNotice', `⏳ Attendance for "${esc(r.trainingName)}" is waiting for MDTU confirmation. The certificate will be available after confirmation.`, 'warning');
        return;
    }
    if (effHours(r) <= 0) {
        area.classList.add('hidden');
        setCertButtons(false);
        setCertNotice('certStatusNotice', 'This record has no attended hours (all days marked absent), so a completion certificate cannot be issued.', 'error');
        return;
    }
    $('viewStudentName').textContent = r.name;
    $('viewStudentDetails').textContent = `${r.designation}, ${r.office}`;
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
    try {
        if (document.fonts) await document.fonts.ready;
        await waitForImages(sheet);
        sheet.style.transform = 'none';
        const worker = html2pdf().set({
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fffdf6', scrollX: 0, scrollY: 0 },
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
        sheet.style.transform = prevTransform;
        setBusy(false);
    }
}

// ===================== Superuser progress =====================

const lookupProgressUser = debounce(async (nic, officeId, desigId, after) => {
    const o = await lookupOfficer(nic);
    if (!o) return;
    $(officeId).value = o.office || '';
    $(desigId).value = o.designation || '';
    if (after) after(o);
}, 400);

function handleSuperuserIdLookup(val) {
    lookupProgressUser(convertNicFormat(val), 'progUserOffice', 'progUserDesignation', o => {
        autoCalculateOfficeStaffProgress();
        populateAutoMdtuPrograms(o.office);
    });
}

function populateAutoMdtuPrograms(officeName) {
    const box = $('progAutoProgramsList');
    if (!box) return;
    const progs = [...new Set(state.records.filter(r => r.office === officeName && r.confirmed)
        .map(r => `${r.trainingName} (${r.date}) @ ${r.venue || '-'} - ${r.hours} Hours`))];
    box.innerHTML = progs.length ? progs.map(p => `<div>✅ ${esc(p)}</div>`).join('')
        : '<span class="text-slate-400">No confirmed MDTU trainings recorded yet for this office this year.</span>';
}

function autoCalculateOfficeStaffProgress() {
    const office = $('progUserOffice').value;
    const tbody = $('progMatrixTableBody');
    if (!office || !tbody) return;
    tbody.innerHTML = designationBreakdown(office).map(d => `
        <tr class="border-b">
            <td class="p-2 font-bold text-slate-800">${esc(d.designation)}</td>
            <td class="p-2 text-center font-bold">${d.total}</td>
            <td class="p-2 text-center text-emerald-700 font-bold">${d.c12}</td>
            <td class="p-2 text-center text-amber-700 font-bold">${d.c6}</td>
            <td class="p-2 text-center text-rose-700 font-bold">${d.none}</td>
        </tr>`).join('');
}

function addOtherTrainingRow() {
    const div = document.createElement('div');
    div.className = 'flex gap-2 flex-wrap sm:flex-nowrap';
    div.innerHTML = `
        <input type="text" placeholder="Internal Training Topic" class="flex-1 p-2 text-xs border rounded outline-none other-train-topic min-w-[140px]">
        <input type="number" placeholder="Hours" min="1" max="50" class="w-20 p-2 text-xs border rounded outline-none other-train-hours">
        <input type="date" class="p-2 text-xs border rounded outline-none other-train-date">
        <button type="button" onclick="this.parentElement.remove()" class="bg-rose-600 text-white px-3 py-1 rounded text-xs font-bold">X</button>`;
    $('otherTrainingsContainer').appendChild(div);
}

async function handleSaveSuperuserProgress(e) {
    e.preventDefault();
    const form = e.target;
    const otherTrainings = qsa('#otherTrainingsContainer > div').map(r => ({
        topic: r.querySelector('.other-train-topic').value.trim(),
        hours: r.querySelector('.other-train-hours').value,
        date: r.querySelector('.other-train-date').value,
    })).filter(t => t.topic);
    try {
        const file = $('progAttachmentPdf').files[0];
        const pdfAttachment = file ? await fileToDataUrl(file, 10) : null;
        await post('save_progress', {
            year: state.year,
            userId: convertNicFormat($('progUserId').value),
            office: $('progUserOffice').value.trim(),
            designation: $('progUserDesignation').value.trim(),
            month: $('progMonth').value,
            specialRemarks: $('progSpecialRemarks').value.trim(),
            productivityTasks: $('progProductivityTasks').value.trim(),
            otherTrainings,
            pdfAttachment,
        });
        state.progress = await api('get_progress', { params: { year: state.year } });
        form.reset();
        $('otherTrainingsContainer').innerHTML = '';
        updateOfficeDropdowns();
        notify('Progress report saved to the database.');
    } catch (err) {
        notify(err.message, 'error');
    }
}

const PROGRESS_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function latestProgressByOfficeMonth(office) {
    const map = {};
    state.progress.filter(p => p.office === office && parseInt(p.year, 10) === state.year).forEach(p => {
        if (!map[p.month]) map[p.month] = p;
    });
    return map;
}

function inHouseText(sub) {
    return (sub.otherTrainings || []).map(t => `${t.topic}${t.hours ? ' (' + t.hours + 'h)' : ''}${t.date ? ' ' + t.date : ''}`).join('; ');
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

function renderProgressPresentations() {
    const body = $('progressMonthTableBody');
    if (!body) return;
    const office = $('presOfficeSelect') ? $('presOfficeSelect').value : 'all';
    if ($('presReportSubtitle')) $('presReportSubtitle').textContent = `${state.year} · ${office && office !== 'all' ? office : 'All offices'} · January to December`;
    body.innerHTML = progressMonthRows(office);
}

function downloadPresentationPDF() {
    downloadOfficialReportPDF('presentationPdfContainer', 'Monthly_Progress_All_Months');
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

async function uploadResourcePersonsExcel() {
    const file = $('resourcePersonsExcelInput').files[0];
    if (!file) { notify('Please choose an Excel file.', 'warning'); return; }
    try {
        const json = await readExcelRows(file);
        const rows = json.map(r => ({
            name: r['Resource Person Name'] || r['Name'] || Object.values(r)[0] || '',
            field: r['Field'] || r['Specialization'] || r['Specialization / Domain'] || '',
            institution: r['Institution'] || r['Designation & Institution'] || '',
            contact: String(r['Contact No'] || r['Contact Number'] || r['Phone'] || ''),
            email: r['Email'] || r['Email Address'] || '',
        }));
        const res = await post('replace_resource_persons', { rows });
        state.resourcePersons = res.resourcePersons;
        renderMasterResourcePersonsTable();
        updateProgramDropdowns();
        notify(`${res.resourcePersons.length} resource person(s) saved to the database.`);
    } catch (err) {
        notify(err.message, 'error');
    }
}

function renderMasterResourcePersonsTable() {
    const tbody = $('resourceSharedTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.resourcePersons.length ? state.resourcePersons.map(r => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-2.5 font-bold text-purple-950">${esc(r.name)}</td>
            <td class="p-2.5">${esc(r.field)}</td>
            <td class="p-2.5">${esc(r.institution)}</td>
            <td class="p-2.5 font-mono">${esc(r.contact)}</td>
            <td class="p-2.5 font-mono text-indigo-700">${esc(r.email)}</td>
        </tr>`).join('') : emptyRow(5, 'No resource persons uploaded yet.');
}

async function uploadAnnualStaffExcel() {
    const file = $('annualStaffExcelFile').files[0];
    if (!file) { notify('Please select an Excel file.', 'warning'); return; }
    try {
        const json = await readExcelRows(file);
        const rows = json.map(row => {
            const keys = Object.keys(row);
            const officeKey = keys.find(k => /^office( name)?$/i.test(k.trim())) || keys[0];
            const counts = {};
            keys.filter(k => k !== officeKey).forEach(k => { counts[k.trim()] = parseInt(row[k], 10) || 0; });
            return { office: String(row[officeKey] || '').trim(), counts };
        }).filter(r => r.office);
        const res = await post('replace_staff_matrix', { year: state.year, rows });
        state.staffMatrix = res.staffMatrix;
        renderAnnualStaffMatrixTable();
        updateOfficeDropdowns();
        notify(`Staff matrix for ${state.year} saved (${rows.length} offices).`);
    } catch (err) {
        notify(err.message, 'error');
    }
}

function renderAnnualStaffMatrixTable() {
    const head = $('annualStaffMatrixHead');
    const body = $('annualStaffMatrixBody');
    if (!head || !body) return;
    if (!state.staffMatrix.length) {
        head.innerHTML = '';
        body.innerHTML = emptyRow(1, `No staff matrix uploaded for ${state.year}.`);
        return;
    }
    const desigs = [...new Set(state.staffMatrix.flatMap(m => Object.keys(m.counts)))];
    head.innerHTML = `<tr><th class="p-2.5">Office</th>${desigs.map(d => `<th class="p-2.5 text-center">${esc(d)}</th>`).join('')}</tr>`;
    body.innerHTML = state.staffMatrix.map(m => `
        <tr class="border-b"><td class="p-2.5 font-bold">${esc(m.office)}</td>${desigs.map(d => `<td class="p-2.5 text-center">${m.counts[d] ?? 0}</td>`).join('')}</tr>`).join('');
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

async function handleCreateUser(e) {
    e.preventDefault();
    try {
        const res = await post('create_user', {
            username: $('newUsername').value.trim(),
            password: $('newPassword').value,
            role: $('newRole').value,
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
        </tr>`).join('') : emptyRow(6, 'Log in as Super Admin to manage accounts.');
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
    'analytics': 'Evaluation results by program',
    'resource-report': 'Ratings of lecturers / resource persons',
    'duty-report': 'Training hours per officer',
    'pending': 'Officers below 12 hours',
    'completed': 'Officers who completed 12 hours',
    'progress-entry': 'Submit the monthly office progress',
    'training-plan-entry': 'Submit the annual training needs',
    'progress-reports': 'All 12 months in one table, PDF for files',
    'training-plan-report': 'Training plans of all offices',
    'resource-persons-master-report': 'Directory of resource persons',
    'office-report': '12-hour status by office',
    'office-designation-report': 'Status by designation',
    'template-settings': 'Logos, signature, seal, state emblem',
    'user-management': 'Accounts, passwords and roles',
    'audit-log': 'Who did what and when, integrity check',
    'resource-upload': 'Upload the resource person list',
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
            <td class="p-2 font-bold text-indigo-950">${esc(r.name)}</td>
            <td class="p-2 font-mono">${esc(r.nic)}</td>
            <td class="p-2">${esc(r.designation)}<br><span class="text-[10px] text-slate-500">${esc(r.office)}</span></td>
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

window.addEventListener('resize', debounce(fitCertificates, 150));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileSidebar(); });
loadAll();
setInterval(pollMessages, 20000);

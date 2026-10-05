const state = {
  user: null,
  csrf: "",
  page: "home",
  module: "dashboard",
  catalog: [],
  options: null,
  schema: null,
  editing: null,
  lang: localStorage.getItem("mdtu-lang") || "si",
  theme: localStorage.getItem("mdtu-theme") || "light",
  evalTimer: 0,
  quizKind: "",
  leaving: false,
  activeAt: Date.now(),
  idleTimer: 0,
};

const I18N = {
  si: {
    unit: "කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය",
    org: "වයඹ පළාත් සභාව",
    home: "මුල් පිටුව",
    programmes: "පුහුණු වැඩසටහන්",
    external: "බාහිර පුහුණු පාඨමාලා",
    staff: "කාර්යමණ්ඩලය",
    downloads: "බාගත කිරීම්",
    about: "අප ගැන",
    contact: "අමතන්න",
    signin: "පද්ධතියට ඇතුල් වන්න",
    signout: "ඉවත් වන්න",
    dash: "පාලක පුවරුව",
    username: "පරිශීලක නම",
    password: "මුර පදය",
    enter: "ඇතුල් වන්න",
    notices: "දැනුම්දීම්",
    trainings: "පවත්වන පුහුණු වැඩසටහන්",
    calendar: "පුහුණු දින දර්ශනය",
    scholarships: "විදේශ ශිෂ්‍යත්ව",
    birthdays: "අද උපන්දින",
    photos: "ඡායාරූප",
    all: "සියළුම වැඩසටහන්",
    none: "දැනට වාර්තා නැත.",
    back: "පාලක පුවරුවට",
    footer: "© 2026 කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය - වයඹ පළාත් සභාව · +94 37 2222018",
    searchProg: "වැඩසටහනේ නම",
    searchFile: "ගොනුවේ නම",
    searchStaff: "නම හෝ කාර්යාලය",
    nid: "ජාතික හැඳුනුම්පත් අංකය",
    viewDetails: "විස්තර බලන්න",
    attended: "සහභාගී වූ පුහුණු",
    printLetter: "ලිපිය PDF ලෙස මුද්‍රණය",
    printHint: "මුද්‍රණ කවුළුවෙන් Save as PDF තෝරන්න.",
    noOfficer: "මෙම අංකයට නිලධාරියෙකු හමු නොවීය.",
    noTrainings: "මෙම නිලධාරියා සහභාගී වූ පුහුණු වාර්තා නැත.",
    programme: "පුහුණු වැඩසටහන",
    date: "දිනය",
    place: "ස්ථානය",
    search: "සොයන්න",
    contactBody: "නියෝජ්‍ය ප්‍රධාන ලේකම් (පුද්ගල හා පුහුණු), වයඹ පළාත් සභාව, කුරුණෑගල. දුරකථන +94 37 2222018. ෆැක්ස් +94 37 2223655.",
    suggest: "යෝජනාවක් යවන්න",
    send: "යවන්න",
    themeLight: "ලා",
    themeColor: "වර්ණ",
    themeDark: "අඳුරු",
    resourceNav: "සම්පත්දායක",
    lectureLogin: "දේශක ලියාපදිංචිය",
    rtiLink: "RTI",
    briberyLink: "අල්ලස පිටු දකිමු",
    programLogin: "ඇගයීම",
  },
  ta: {
    unit: "மேலாண்மை அபிவிருத்தி மற்றும் பயிற்சி அலகு",
    org: "வடமேல் மாகாண சபை",
    home: "முகப்பு",
    programmes: "பயிற்சி நிகழ்ச்சிகள்",
    external: "வெளிப்புற பயிற்சிகள்",
    staff: "பணியாளர்கள்",
    downloads: "பதிவிறக்கங்கள்",
    about: "எங்களைப் பற்றி",
    contact: "தொடர்பு",
    signin: "உள்நுழைக",
    signout: "வெளியேறு",
    dash: "கட்டுப்பாட்டு பலகை",
    username: "பயனர் பெயர்",
    password: "கடவுச்சொல்",
    enter: "உள்நுழை",
    notices: "அறிவிப்புகள்",
    trainings: "நடைபெறும் பயிற்சிகள்",
    calendar: "பயிற்சி நாட்காட்டி",
    scholarships: "வெளிநாட்டு உதவித்தொகை",
    birthdays: "இன்றைய பிறந்தநாள்",
    photos: "புகைப்படங்கள்",
    all: "அனைத்து நிகழ்ச்சிகள்",
    none: "பதிவுகள் இல்லை.",
    back: "பலகைக்குத் திரும்பு",
    footer: "© 2026 மேலாண்மை அபிவிருத்தி மற்றும் பயிற்சி அலகு - வடமேல் மாகாண சபை · +94 37 2222018",
    searchProg: "நிகழ்ச்சியின் பெயர்",
    searchFile: "கோப்பு பெயர்",
    searchStaff: "பெயர் அல்லது அலுவலகம்",
    nid: "தேசிய அடையாள எண்",
    viewDetails: "விவரங்களைக் காண்",
    attended: "பங்கேற்ற பயிற்சிகள்",
    printLetter: "கடிதத்தை PDF ஆக அச்சிடு",
    printHint: "அச்சு சாளரத்தில் Save as PDF ஐத் தேர்ந்தெடுக்கவும்.",
    noOfficer: "இந்த எண்ணுக்கு அதிகாரி இல்லை.",
    noTrainings: "இந்த அதிகாரி பங்கேற்ற பயிற்சிப் பதிவு இல்லை.",
    programme: "பயிற்சி",
    date: "திகதி",
    place: "இடம்",
    search: "தேடு",
    contactBody: "துணை பிரதம செயலாளர் (பணியாளர் மற்றும் பயிற்சி), வடமேல் மாகாண சபை, குருணாகல். தொலைபேசி +94 37 2222018. தொலைநகல் +94 37 2223655.",
    suggest: "ஒரு ஆலோசனை அனுப்புக",
    send: "அனுப்பு",
    themeLight: "வெளிர்",
    themeColor: "வண்ணம்",
    themeDark: "இருள்",
    resourceNav: "வள ஆள்",
    lectureLogin: "விரிவுரையாளர் பதிவு",
    rtiLink: "RTI",
    briberyLink: "இலஞ்சத்தை ஒழிப்போம்",
    programLogin: "மதிப்பீடு",
  },
  en: {
    unit: "Management Development and Training Unit",
    org: "North Western Provincial Council",
    home: "Home",
    programmes: "Training programmes",
    external: "External courses",
    staff: "Staff",
    downloads: "Downloads",
    about: "About",
    contact: "Contact",
    signin: "Sign in",
    signout: "Sign out",
    dash: "Dashboard",
    username: "Username",
    password: "Password",
    enter: "Enter",
    notices: "Notices",
    trainings: "Training programmes now",
    calendar: "Training calendar",
    scholarships: "Foreign scholarships",
    birthdays: "Birthdays today",
    photos: "Photographs",
    all: "All programmes",
    none: "Nothing listed yet.",
    back: "Back to dashboard",
    footer: "© 2026 Management Development and Training Unit - North Western Provincial Council · +94 37 2222018",
    searchProg: "Programme name",
    searchFile: "File name",
    searchStaff: "Name or office",
    nid: "National ID number",
    viewDetails: "View details",
    attended: "Training programmes attended",
    printLetter: "Print letter as PDF",
    printHint: "In the print window, choose Save as PDF.",
    noOfficer: "No officer was found for that ID.",
    noTrainings: "This officer has no attended training records.",
    programme: "Programme",
    date: "Date",
    place: "Place",
    search: "Search",
    contactBody: "Deputy Chief Secretary (Personnel and Training), North Western Provincial Council, Kurunegala. Telephone +94 37 2222018. Fax +94 37 2223655.",
    suggest: "Send a suggestion",
    send: "Send",
    resourceNav: "Resource person",
    lectureLogin: "Lecturer registration",
    rtiLink: "RTI",
    briberyLink: "Reject bribery",
    programLogin: "Evaluation",
    themeLight: "Light",
    themeColor: "Color",
    themeDark: "Dark",
  },
};

function t(key) {
  return (I18N[state.lang] || I18N.si)[key] || I18N.si[key] || key;
}

function L(si, ta, en) {
  if (state.lang === "ta") return ta;
  if (state.lang === "en") return en;
  return si;
}

function applyChrome() {
  document.documentElement.lang = state.lang === "si" ? "si" : state.lang === "ta" ? "ta" : "en";
  document.documentElement.dataset.theme = state.theme || "light";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.lang === state.lang);
  });
  document.querySelectorAll("[data-act='theme']").forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.theme === state.theme);
  });
}

const YES = "ඔව්";
const NO = "නැත";
const TYPE_MDTU = "MDTU පුහුණුවකි";

const $ = (sel, root = document) => root.querySelector(sel);
function plainText(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
const esc = (value) => plainText(value).replace(/[&<>"']/g, (ch) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[ch]));

function showDate(value) {
  const text = String(value ?? "");
  if (!text || text.startsWith("0000") || text.startsWith("1111")) return "";
  return text.slice(0, 10);
}

function dateYear(value) {
  const date = showDate(value);
  return /^(19|20)\d{2}-\d{2}-\d{2}$/.test(date) ? date.slice(0, 4) : "";
}

function chosenYear() {
  const asked = state.query?.get("year") || localStorage.getItem("mdtu-year") || localToday().slice(0, 4);
  return /^(19|20)\d{2}$/.test(String(asked)) ? String(asked) : localToday().slice(0, 4);
}

function rememberYear(year) {
  if (/^(19|20)\d{2}$/.test(String(year))) localStorage.setItem("mdtu-year", String(year));
}

function programmeYear(row) {
  if (!row || typeof row !== "object") return "";
  const keys = [];
  for (let i = 1; i <= 10; i += 1) keys.push("atp_day" + i, "ct_day" + i);
  keys.push("day", "atp_requestDate", "pvtt_cstartdate", "pvtt_applydate", "otn_date", "req_adddate", "tapp_trstartdate", "tapp_applieddate", "tratt_startdate", "ot_closingdate", "saved");
  for (const key of keys) {
    const year = dateYear(row[key]);
    if (year) return year;
  }
  const found = String(row.atp_moredays || "").match(/(19|20)\d{2}-\d{2}-\d{2}/);
  return found ? found[0].slice(0, 4) : "";
}

function rowInYear(row, year) {
  return programmeYear(row) === String(year);
}

const YEAR_TABLES = new Set(["cp_atp", "cp_completedtrainings", "cp_privatetrainings", "cp_othertrainings", "cp_trrequirements", "cp_trainingapplications", "cp_trainingattendance", "cp_outsidetrcource"]);
const YEAR_PAGES = new Set(["plan", "cp_atp", "applications", "attendance", "scheduled", "revise", "offweb", "finish", "finish2", "signsheet", "panelsign", "estimate", "modular", "evaluation", "messages", "apply", "cp_privatetrainings", "cp_othertrainings", "cp_trrequirements", "cp_trainingapplications", "cp_trainingattendance", "cp_outsidetrcource", "needs", "settle", "ahead", "attended"]);

function yearChoices() {
  const now = Number(localToday().slice(0, 4));
  const years = [];
  for (let value = now + 1; value >= now - 8; value -= 1) years.push(String(value));
  const current = chosenYear();
  if (!years.includes(current)) years.unshift(current);
  return years;
}

function yearBar() {
  const current = chosenYear();
  const options = yearChoices().map((year) => `<option value="${esc(year)}"${year === current ? " selected" : ""}>${esc(year)}</option>`).join("");
  return `<form class="sheet-tools" id="year-bar"><label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))} <select data-year-pick>${options}</select></label></form>`;
}

function paintYearBar(work) {
  if (!work || work.querySelector("[data-year-pick], select[name=year], input[name=year]")) return;
  work.insertAdjacentHTML("afterbegin", yearBar());
}

function fieldText(value) {
  const date = showDate(value);
  if (date && String(value).includes("-")) return date;
  return String(value ?? "");
}

async function api(action, options = {}) {
  const url = new URL("api.php", window.location.href);
  url.searchParams.set("action", action);
  Object.entries(options.query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });
  const request = { credentials: "same-origin", headers: {} };
  if (options.method === "POST") {
    request.method = "POST";
    request.headers["X-CSRF"] = state.csrf || document.querySelector('meta[name="csrf"]').content;
    if (options.form) {
      request.body = options.form;
    } else {
      request.headers["Content-Type"] = "application/json";
      request.body = JSON.stringify(options.body || {});
    }
  }
  const response = await fetch(url, request);
  if (action === "export") {
    if (!response.ok) throw new Error("The export could not be created.");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const named = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") || "");
    link.download = named ? named[1] : (options.query.table || "export") + ".xls";
    link.click();
    URL.revokeObjectURL(link.href);
    return { ok: true };
  }
  const data = await response.json();
  if (!data.ok) {
    if (response.status === 401 && state.user && action !== "login") {
      state.user = null;
      state.leaving = true;
      location.href = "index.php";
    }
    throw new Error(data.error || "Request failed.");
  }
  const year = chosenYear();
  const query = options.query || {};
  if (action === "list" && YEAR_TABLES.has(query.table) && query.allYears !== "1" && Array.isArray(data.items)) {
    data.items = data.items.filter((row) => rowInYear(row, year));
  }
  if (["modules", "messages", "eval-get"].includes(action) && Array.isArray(data.programmes)) {
    data.programmes = data.programmes.filter((row) => rowInYear(row, year));
  }
  if (action === "modules" && Array.isArray(data.items)) {
    const ids = new Set((data.programmes || []).map((row) => String(row.id)));
    data.items = data.items.filter((row) => ids.has(String(row.atp)) || rowInYear(row, year));
  }
  if (["finish2", "saved-estimates", "offweb-list"].includes(action) && Array.isArray(data.items)) {
    data.items = data.items.filter((row) => rowInYear(row, year));
  }
  return data;
}

function endSession() {
  if (!state.user || state.leaving) return;
  state.leaving = true;
  const csrf = state.csrf;
  state.user = null;
  const url = new URL("api.php", location.href);
  url.searchParams.set("action", "logout");
  fetch(url, {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json", "X-CSRF": csrf || "" },
    body: "{}",
  }).catch(() => {});
}

function armIdle() {
  clearTimeout(state.idleTimer);
  if (!state.user || state.leaving) return;
  state.activeAt = Date.now();
  state.idleTimer = setTimeout(() => {
    endSession();
    location.href = "index.php";
  }, 5 * 60 * 1000);
}

function route() {
  if (state.evalTimer) {
    clearInterval(state.evalTimer);
    state.evalTimer = 0;
  }
  const raw = (location.hash || "#home").slice(1);
  const [path, query = ""] = raw.split("?");
  const bits = path.split("/");
  state.page = bits[0] || "home";
  state.module = decodeURIComponent(bits[1] || "dashboard");
  state.quizKind = bits[2] || "";
  state.query = new URLSearchParams(query);
  if (state.lastModule !== state.module) {
    state.tablePage = 1;
    state.tableQuery = "";
    state.lastModule = state.module;
  }
  document.body.classList.toggle("in-console", state.page === "console");
  document.body.classList.toggle("on-quiz", state.page === "quiz");
  if (state.user && state.page === "home") {
    endSession();
    paintAccount();
  }
  applyChrome();
  if (state.page === "console") renderConsole();
  else renderPublic();
  highlightNav();
}

function highlightNav() {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("href").replace("#", "");
    const current = state.page === "console" ? "console/" + state.module : state.page;
    link.setAttribute("aria-current", target === current || (target === "home" && state.page === "home") ? "page" : "false");
    if (link.getAttribute("aria-current") === "false") link.removeAttribute("aria-current");
  });
}

async function boot() {
  state.csrf = document.querySelector('meta[name="csrf"]').content;
  try {
    const me = await api("me");
    state.user = me.user;
    state.csrf = me.csrf || state.csrf;
  } catch (error) {
    state.bootError = error.message;
  }
  applyChrome();
  paintAccount();
  window.addEventListener("hashchange", route);
  document.body.addEventListener("click", onClick);
  document.body.addEventListener("change", onPickChange);
  document.body.addEventListener("submit", onSubmit);
  $("#menu")?.addEventListener("click", () => $("#nav").classList.toggle("open"));
  ["pointerdown", "keydown"].forEach((name) => {
    document.addEventListener(name, () => { if (state.user) armIdle(); });
  });
  setInterval(() => {
    if (!state.user || state.leaving) return;
    if (Date.now() - state.activeAt > 5 * 60 * 1000) return;
    api("pulse").catch(() => {});
  }, 60000);
  window.addEventListener("pagehide", () => endSession());
  if (state.user) armIdle();
  route();
}

function paintAccount() {
  const slot = $("#account");
  if (!state.user) {
    slot.innerHTML = `<button class="btn" type="button" data-act="login-open">${esc(t("signin"))}</button>`;
    paintChat();
    return;
  }
  slot.innerHTML = `<span class="muted">${esc(state.user.username)}</span>
    <a class="btn" href="#console/dashboard">${esc(t("dash"))}</a>
    <button class="text-btn" type="button" data-act="logout">${esc(t("signout"))}</button>`;
  paintChat();
}

function chatHello() {
  if (!state.user) {
    return L(
      "ආයුබෝවන්. මම උදව්කරු. ලොග් වෙන්නේ නැතුව මට කියන්න පුළුවන් මුල් පිටුව, ලියාපදිංචිය, දැනුම්දීම්, බාගත කිරීම්, සහ දැනට අයදුම් කළ හැකි වැඩසටහන් ගැන විතරයි.\nනිලධාරීන්, අයදුම්, සහ කාර්යාල විස්තර බලන්න පද්ධතියට ඇතුල් වෙන්න.",
      "வணக்கம். உள்நுழையாமல் முகப்பு, பதிவு, அறிவிப்பு, பதிவிறக்கம், திறந்த பயிற்சிகள் மட்டும்.",
      "Hello. Without signing in I can only talk about the home page, registration, notices, downloads, and programmes still open for applications."
    );
  }
  const office = state.user.office || "";
  const role = state.user.role;
  if (role === "User") {
    return L(
      `ආයුබෝවන්. මම පුහුණු වෙබ් අඩවියේ උදව්කරු. යෙදුම කොහොමද පාවිච්චි කරන්නේ කියලා අහන්න. නිලධාරියෙකුගේ නම, හැඳුනුම්පත, අද උපන්දින, හෝ වැඩසටහන් ගැනත් අහන්න.\nඔබට කියන්නේ ${office} කාර්යාලයේ අය ගැන විතරයි.`,
      `வணக்கம். பயிற்சி இணைய உதவியாளர் நான். பயன்பாட்டை எப்படி பயன்படுத்துவது என்று கேளுங்கள்.\nபதில்கள் ${office} அலுவலகம் மட்டும்.`,
      `Hello. I am the training-site helper. Ask how to use the app, or ask about an officer, a birthday, or a programme.\nI only talk about people in ${office}.`
    );
  }
  return L(
    "ආයුබෝවන්. මම පුහුණු වෙබ් අඩවියේ උදව්කරු. යෙදුම කොහොමද පාවිච්චි කරන්නේ කියලා අහන්න. සියලු කාර්යාලවල නිලධාරීන්, උපන්දින, ශිෂ්‍යත්ව, සහ වැඩසටහන් ගැනත් අහන්න පුළුවන්.",
    "வணக்கம். பயிற்சி இணைய உதவியாளர் நான். எல்லா அலுவலகங்களையும் பற்றி கேட்கலாம்.",
    "Hello. I am the training-site helper. Ask how to use the app. I can answer about people, birthdays, scholarships, and programmes in every office."
  );
}

function chatSay(kind, text) {
  const log = $("#helper-log");
  if (!log) return;
  const line = document.createElement("p");
  line.className = kind === "mine" ? "mine" : "bot";
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function paintChat() {
  const who = state.user ? `${state.user.role}|${state.user.office || ""}` : "guest";
  const current = $("#helper");
  if (current && current.dataset.who !== who) current.remove();
  const admin = state.user?.role === "Administrator";
  if (!$("#helper")) {
    const saved = guestChatSaved();
    document.body.insertAdjacentHTML("beforeend", `
      <div id="helper" class="helper" data-who="${esc(who)}">
        <button type="button" class="helper-open" data-act="chat-open">${esc(L("උදව්", "உதவி", "Help"))}</button>
        <section class="helper-panel" hidden>
          <header><strong>${esc(L("උදව්", "உதவி", "Help"))}</strong><button type="button" data-act="chat-close" aria-label="Close">×</button></header>
          <div class="helper-tabs">
            <button type="button" class="helper-tab on" data-act="chat-mode" data-mode="help">${esc(L("උදව්කරු", "உதவியாளர்", "Helper"))}</button>
            ${admin ? "" : `<button type="button" class="helper-tab" data-act="chat-mode" data-mode="admin">${esc(L("Admin එක්ක කතා", "Admin உடன் உரையாடல்", "Chat with Admin"))}</button>`}
            ${admin ? `<button type="button" class="helper-tab" data-act="chat-mode" data-mode="inbox">${esc(L("පණිවිඩ", "செய்திகள்", "Messages"))}</button>` : ""}
          </div>
          <div data-chat-pane="help">
            <div class="helper-log" id="helper-log"></div>
            <form id="helper-form">
              <input name="question" maxlength="500" required>
              <button type="submit">${esc(L("යවන්න", "அனுப்பு", "Send"))}</button>
            </form>
          </div>
          <div data-chat-pane="admin" hidden>
            <div class="helper-log" id="admin-log"></div>
            <form id="admin-chat-form">
              <div class="admin-guest" ${state.user ? "hidden" : ""}>
                <input name="nid" maxlength="20" value="${esc(saved.nid || "")}" placeholder="${esc(L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"))}" ${state.user ? "" : "required"}>
                <input name="phone" maxlength="20" value="${esc(saved.phone || "")}" placeholder="${esc(L("දුරකථන අංකය", "தொலைபேசி எண்", "Phone number"))}" ${state.user ? "" : "required"}>
              </div>
              <div class="admin-send">
                <input name="text" maxlength="500" required placeholder="${esc(L("Admin ට අහන්න...", "Admin இடம் கேளுங்கள்...", "Ask the Admin..."))}">
                <button type="submit">${esc(L("යවන්න", "அனுப்பு", "Send"))}</button>
              </div>
            </form>
          </div>
          <div data-chat-pane="inbox" hidden>
            <div class="helper-log" id="inbox-log"></div>
            <form id="admin-reply-form" hidden>
              <button type="button" data-act="admin-back">${esc(L("ආපසු", "பின்", "Back"))}</button>
              <input name="text" maxlength="500" required placeholder="${esc(L("පිළිතුර...", "பதில்...", "Reply..."))}">
              <button type="submit">${esc(L("යවන්න", "அனுப்பு", "Send"))}</button>
            </form>
          </div>
        </section>
      </div>`);
    chatSay("bot", chatHello());
  }
  const input = document.querySelector("#helper-form input");
  if (input) input.placeholder = L("ඔබේ ප්‍රශ්නය...", "உங்கள் கேள்வி...", "Your question...");
  const open = document.querySelector(".helper-open");
  if (open) open.textContent = L("උදව්", "உதவி", "Help");
}

function guestChatSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem("mdtu-admin-chat") || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    return {};
  }
}

function chatRole(role) {
  if (role === "User") return "User";
  if (role === "Super User") return "Super User";
  if (role === "Administrator") return "පරිපාලක";
  return "ලොග් වෙලා නැත";
}

function paintAdminLines(slot, messages, mineFrom, empty) {
  if (!slot) return;
  slot.innerHTML = "";
  if (!messages.length) {
    const note = document.createElement("p");
    note.className = "bot";
    note.textContent = empty;
    slot.appendChild(note);
    return;
  }
  messages.forEach((row) => {
    const line = document.createElement("p");
    line.className = row.from === mineFrom ? "mine" : "bot";
    line.textContent = `${row.text}${row.time ? `\n${row.time}` : ""}`;
    slot.appendChild(line);
  });
  slot.scrollTop = slot.scrollHeight;
}

function showChatPane(mode) {
  document.querySelectorAll(".helper-tab").forEach((tab) => tab.classList.toggle("on", tab.dataset.mode === mode));
  document.querySelectorAll("[data-chat-pane]").forEach((pane) => {
    pane.hidden = pane.dataset.chatPane !== mode;
  });
  const panel = document.querySelector(".helper-panel");
  if (panel) panel.hidden = false;
  clearInterval(state.adminTimer);
  state.adminTimer = setInterval(() => {
    const openPanel = document.querySelector(".helper-panel");
    if (!openPanel || openPanel.hidden) return;
    if (document.activeElement && openPanel.contains(document.activeElement)) return;
    const current = document.querySelector(".helper-tab.on")?.dataset.mode || "";
    if (current === "admin") loadMyAdminChat();
    if (current === "inbox" && state.adminThread) loadAdminThread(state.adminThread);
    if (current === "inbox" && !state.adminThread) loadAdminInbox();
  }, 8000);
  if (mode === "admin") loadMyAdminChat();
  if (mode === "inbox") {
    state.adminThread = 0;
    const reply = document.getElementById("admin-reply-form");
    if (reply) reply.hidden = true;
    loadAdminInbox();
  }
}

async function loadMyAdminChat() {
  const slot = document.getElementById("admin-log");
  if (!slot) return;
  const saved = guestChatSaved();
  const query = state.user ? {} : { nid: saved.nid || "", phone: saved.phone || "" };
  try {
    const data = await api("admin-chat", { query });
    paintAdminLines(slot, data.messages || [], "person", state.user
      ? "ප්‍රශ්නයක් තියෙනවා නම් මෙතනින් Admin ට ලියන්න. පිළිතුර මෙතනටම එනවා."
      : "ප්‍රශ්නයක් තියෙනවා නම් මෙතනින් Admin ට ලියන්න. ලොග් වෙලා නැත්නම් ජාතික හැඳුනුම්පත් අංකය සහ දුරකථන අංකය දාන්න. පිළිතුර මෙතනටම එනවා.");
  } catch (error) {
    paintAdminLines(slot, [], "person", error.message);
  }
}

async function loadAdminInbox() {
  const slot = document.getElementById("inbox-log");
  if (!slot) return;
  try {
    const data = await api("admin-chat", { query: { box: "1" } });
    const threads = data.threads || [];
    if (!threads.length) {
      slot.innerHTML = `<p class="bot">තවම පණිවිඩ නැහැ.</p>`;
      return;
    }
    slot.innerHTML = threads.map((row) => `<button type="button" class="inbox-person" data-act="admin-open" data-id="${esc(row.id)}">
      <strong>${esc(row.name || chatRole(row.role))}</strong>
      <span>${esc(chatRole(row.role))}${row.office ? ` · ${esc(row.office)}` : ""}</span>
      ${row.nid ? `<span>ජා.හැ. ${esc(row.nid)} · ${esc(row.phone)}</span>` : ""}
      <span>${esc(row.last || "")}</span>
      ${row.wait ? `<b>නව පණිවිඩය</b>` : ""}
    </button>`).join("");
  } catch (error) {
    slot.innerHTML = `<p class="bot">${esc(error.message)}</p>`;
  }
}

async function loadAdminThread(id) {
  const slot = document.getElementById("inbox-log");
  if (!slot) return;
  state.adminThread = id;
  const reply = document.getElementById("admin-reply-form");
  if (reply) reply.hidden = false;
  try {
    const data = await api("admin-chat", { query: { thread: id } });
    const who = data.who || {};
    const head = document.createElement("p");
    head.className = "bot";
    head.textContent = [who.name, chatRole(who.role), who.office, who.nid ? `ජා.හැ. ${who.nid}` : "", who.phone].filter(Boolean).join(" · ");
    paintAdminLines(slot, data.messages || [], "admin", "පණිවිඩ නැහැ.");
    slot.prepend(head);
  } catch (error) {
    paintAdminLines(slot, [], "admin", error.message);
  }
}

async function renderPublic() {
  const pages = {
    home: renderHome,
    register: renderRegister,
    programmes: () => renderDirectory("programmes", t("programmes"), t("searchProg")),
    calendar: renderCalendar,
    downloads: renderDownloads,
    directory: renderStaffHistory,
    profile: renderProfile,
    phones: renderPhones,
    birthdays: renderBirthdays,
    scholarships: () => renderDirectory("scholarships", t("scholarships"), t("searchProg")),
    external: () => renderDirectory("external", t("external"), t("searchProg")),
    programme: renderProgramme,
    about: renderAbout,
    contact: renderContact,
    quiz: renderQuiz,
  };
  const view = $("#stage");
  const draw = pages[state.page] || pages.home;
  view.innerHTML = '<p class="muted">Loading…</p>';
  try {
    await draw(view);
  } catch (error) {
    view.innerHTML = `<div class="error">${esc(error.message)}</div>`;
  }
}

async function renderHome(view) {
  const month = new Date().toISOString().slice(0, 7);
  const [data, cal] = await Promise.all([
    api("home"),
    api("calendar", { query: { month } }),
  ]);
  const slides = data.slides.length
    ? data.slides.map((slide, index) => `<img src="${esc(slide.url)}" alt="" class="${index === 0 ? "on" : ""}">`).join("")
    : '<img class="on" alt="" src="images/wayamba.jpg">';
  const today = localToday();
  const programmes = (data.upcoming || []).filter((item) => {
    const end = programmeEnd(item);
    return end && end >= today;
  }).sort((a, b) => {
    const end = programmeEnd(a).localeCompare(programmeEnd(b));
    return end || Number(b.atp_id) - Number(a.atp_id);
  });
  const leader = data.leader || {};
  state.leader = leader;
  const leaderName = leader.display || "එස්.එම්.පෙත්තාවඩු මහත්මිය";
  const leaderTitle = L("නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)", "துணை பிரதம செயலாளர் (பயிற்சி)", "Deputy Chief Secretary (Training)");
  const leaderLead = L(
    "මෙම ඒකකය නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු) ගේ නායකත්වය යටතේ ක්‍රියාත්මක වේ.",
    "இந்த அலகு துணை பிரதம செயலாளர் (பயிற்சி) தலைமையில் இயங்குகிறது.",
    "The Unit operates under the leadership of the Deputy Chief Secretary (Training)."
  );
  const scholarships = (data.scholarships || []).filter((item) => openOnHome(item.fs_closingdate));
  const external = (data.external || []).filter((item) => openOnHome(item.ot_closingdate));
  view.innerHTML = `
    <div class="home-wrap">
      <div class="home-split">
        <section class="panel">
          <h2>${esc(t("photos"))}</h2>
          <div class="slider" data-slider>${slides}</div>
        </section>
        <section class="panel">
          <h2>${esc(L("නායකත්වය", "தலைமை", "Leadership"))}</h2>
          <div class="pad">
            <button class="leader" type="button" data-act="leader-open">
              ${leaderPhotoHtml(leader, leaderName)}
              <span>
                <strong>${esc(leaderName)}</strong>
                <em>${esc(leaderTitle)}</em>
                <small>${esc(leaderLead)}</small>
                <b>${esc(L("වැඩි විස්තර", "மேலும்", "More"))}</b>
              </span>
            </button>
          </div>
        </section>
      </div>
      <section class="panel register-home">
        <h2>${esc(L("සම්පත්දායක සංචිතය", "வள ஆள்கள்", "Resource persons"))}</h2>
        <div class="pad">
          <p>${esc(L(
            "වයඹ පළාත් පුහුණු වැඩසටහන් සඳහා දේශන හෝ පුහුණු සැසි පවත්වන්නේ නම් සම්පත්දායකයෙකු ලෙස මෙතනින් ලියාපදිංචි වෙන්න. නම, තනතුර, ආයතනය, දුරකථනය, WhatsApp අංකය, ඡායාරූපය, CV එක සහ සහතිකය ඇතුළත් කළ හැක. විෂය ක්ෂේත්‍ර කිහිපයක් එකතු කරන්න. ලැයිස්තුවේ නැති විෂයයක් එතැනම ලියන්න. ලියාපදිංචියෙන් පසු සම්පත්දායක කේතයක් ලැබේ.",
            "வடமேல் மாகாணப் பயிற்சிகளுக்கு விரிவுரை நடத்துபவராக இங்கே பதிவு செய்யுங்கள். பெயர், பதவி, நிறுவனம், தொலைபேசி, WhatsApp, புகைப்படம், CV மற்றும் சான்றிதழைச் சேர்க்கலாம். பல பாடத் துறைகளைச் சேர்க்கலாம். பட்டியலில் இல்லை என்றால் அங்கேயே எழுதுங்கள். பதிவுக்குப் பின் ஒரு வள நபர் குறியீடு கிடைக்கும்.",
            "If you lecture or train for North Western Province programmes, register here as a resource person. Add your name, designation, organisation, telephone, WhatsApp number, photograph, CV, and certificate. Add more than one subject. Type a subject if it is not in the list. After registration you receive a resource-person code."
          ))}</p>
          <p><a class="btn register-cta" href="#register">${esc(L("ලියාපදිංචි වන්න", "பதிவு செய்", "Register"))}</a></p>
        </div>
      </section>
      <div class="home-split">
        <section class="panel">
          <h2>${esc(t("trainings"))}</h2>
          <div class="pad">
            <ul class="list">${programmes.slice(0, 8).map(programmeItem).join("") || `<li>${esc(t("none"))}</li>`}</ul>
            <p><a href="#programmes">${esc(t("all"))}</a></p>
          </div>
        </section>
        <section class="panel">
          <h2>${esc(t("notices"))}</h2>
          <div class="pad notice-pad"><ul class="list">${data.notices.map((item) => `<li>${esc(item.msg_message)}</li>`).join("") || `<li>${esc(t("none"))}</li>`}</ul></div>
        </section>
      </div>
      <div class="home-three">
        <section class="panel">
          <h2>${esc(t("scholarships"))}</h2>
          <div class="pad"><ul class="list">${scholarships.map((item) => `<li><strong>${esc(item.fs_name)}</strong><br><span class="muted">${esc(item.fs_country)}${showDate(item.fs_closingdate) ? " · " + esc(showDate(item.fs_closingdate)) : ""}</span></li>`).join("") || `<li>${esc(t("none"))}</li>`}</ul><p><a href="#scholarships">${esc(t("scholarships"))}</a></p></div>
        </section>
        <section class="panel">
          <h2>${esc(t("external"))}</h2>
          <div class="pad"><ul class="list">${external.map((item) => `<li><strong>${esc(item.ot_training)}</strong><br><span class="muted">${esc(item.ot_institute)}${showDate(item.ot_closingdate) ? " · " + esc(showDate(item.ot_closingdate)) : ""}</span></li>`).join("") || `<li>${esc(t("none"))}</li>`}</ul><p><a href="#external">${esc(t("external"))}</a></p></div>
        </section>
        <section class="panel">
          <h2>${esc(t("birthdays"))}</h2>
          <div class="pad"><div class="bday-line">${data.birthdays.map((item) => `<b>${esc(item.stf_Name)} · ${esc(item.stf_office)}</b>`).join("") || esc(t("none"))}</div><p><a href="#birthdays">${esc(t("birthdays"))}</a></p></div>
        </section>
      </div>
      <section class="panel">
        <h2>${esc(t("calendar"))}</h2>
        <div class="pad">${monthGrid(month, cal.events || [])}<p><a href="#calendar">${esc(t("calendar"))}</a></p></div>
      </section>
    </div>`;
  startSlider();
  view.querySelectorAll("[data-photo]").forEach(useLeaderPhoto);
}

function monthGrid(month, events) {
  const [year, mon] = month.split("-").map(Number);
  const first = new Date(year, mon - 1, 1).getDay();
  const count = new Date(year, mon, 0).getDate();
  const hot = new Set(events.map((event) => Number(String(event.date).slice(8, 10))));
  const heads = ["S", "M", "T", "W", "T", "F", "S"].map((day) => `<span class="mh">${day}</span>`).join("");
  let cells = "";
  for (let i = 0; i < first; i++) cells += "<span></span>";
  for (let day = 1; day <= count; day++) {
    cells += `<a class="${hot.has(day) ? "hot" : ""}" href="#calendar">${day}</a>`;
  }
  const title = new Date(year, mon - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return `<p><strong>${esc(title)}</strong></p><div class="mini-cal">${heads}${cells}</div>`;
}

function openOnHome(value) {
  const date = showDate(value);
  return !date || date >= localToday();
}

function programmeItem(item) {
  const start = showDate(item.atp_day1);
  const end = programmeEnd(item);
  const when = end && start && end !== start ? `${start} – ${end}` : (start || end);
  return `<li><strong><a href="#programme/${esc(item.atp_id)}">${esc(item.atp_trname)}</a></strong><br><span class="muted">${esc(item.atp_location)} · ${esc(when)} ${esc(item.atp_stime || "")}</span></li>`;
}

function startSlider() {
  const frames = document.querySelectorAll("[data-slider] img");
  if (frames.length < 2) return;
  let index = 0;
  clearInterval(state.sliderTimer);
  state.sliderTimer = setInterval(() => {
    const old = frames[index];
    frames.forEach((frame) => frame.classList.remove("prev"));
    old.classList.replace("on", "prev");
    index = (index + 1) % frames.length;
    frames[index].classList.add("on");
    setTimeout(() => old.classList.remove("prev"), 2600);
  }, 6500);
}

function paintSlidePicks() {
  const grid = $("#slide-grid");
  if (!grid) return;
  grid.querySelectorAll("img").forEach((img) => URL.revokeObjectURL(img.src));
  grid.innerHTML = (state.slidePicks || []).map((file, index) => `<div class="slide-thumb" data-slide-index="${index}">
    <img src="${esc(URL.createObjectURL(file))}" alt="">
    <small>${esc(file.name)}</small>
    <button type="button" data-act="slide-drop" data-index="${index}" aria-label="${esc(L("ඉවත් කරන්න", "நீக்கு", "Remove"))}">×</button>
  </div>`).join("");
}

async function renderDownloads() {
  const query = state.query || new URLSearchParams();
  const type = query.get("type") || "";
  const page = query.get("page") || "1";
  const data = await api("public-list", { query: { kind: "downloads", type, page, q: "" } });
  const categories = data.categories || {};
  const icons = DOWNLOAD_ICONS.map(([key, icon]) => `
    <a class="${type === key ? "on" : ""}" href="#downloads?type=${encodeURIComponent(key)}">
      <img src="images/${icon}" alt="">
      <span>${esc(downloadName(key, categories))}</span>
    </a>`).join("");
  const title = type ? downloadName(type, categories) : t("downloads");
  const start = (Math.max(1, Number(page)) - 1) * 100;
  const rows = (data.items || []).map((item, index) => `<tr>
    <td>${start + index + 1}</td>
    <td>${esc(showDate(item.dwn_date))}</td>
    <td>${fileCell(item, "dwn_file")}</td>
    <td>${fileCell(item, "dwn_file2")}</td>
    <td>${fileCell(item, "dwn_file3")}</td>
    <td>${fileCell(item, "dwn_file4")}</td>
    <td>${esc(downloadName(item.dwn_type, categories))}</td>
    <td>${esc(item.dwn_name)}</td>
    <td>${esc(item.dwn_des || "")}</td>
  </tr>`).join("");
  $("#stage").innerHTML = `
    <section class="wrap section">
      <div class="dl-icons">${icons}</div>
      <h2 class="sheet-title">${esc(title)}</h2>
      <div class="table-wrap"><table class="sheet">
        <thead><tr>
          <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
          <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
          <th>${esc(L("ලිපිගොනුව 1", "கோப்பு 1", "File 1"))}</th>
          <th>${esc(L("ලිපිගොනුව 2", "கோப்பு 2", "File 2"))}</th>
          <th>${esc(L("ලිපිගොනුව 3", "கோப்பு 3", "File 3"))}</th>
          <th>${esc(L("ලිපිගොනුව 4", "கோப்பு 4", "File 4"))}</th>
          <th>${esc(L("වර්ගය", "வகை", "Type"))}</th>
          <th>${esc(L("නම", "பெயர்", "Name"))}</th>
          <th>${esc(L("විස්තරය", "விவரம்", "Details"))}</th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="9">${esc(t("none"))}</td></tr>`}</tbody>
      </table></div>
      <div class="pager">
        <a class="btn secondary" href="#downloads?type=${encodeURIComponent(type)}&page=${Math.max(1, Number(page) - 1)}">${esc(L("පෙර", "முந்தைய", "Previous"))}</a>
        <span>${esc(page)}</span>
        <a class="btn secondary" href="#downloads?type=${encodeURIComponent(type)}&page=${Number(page) + 1}">${esc(L("ඊළඟ", "அடுத்து", "Next"))}</a>
      </div>
    </section>`;
}

const DOWNLOAD_ICONS = [
  ["ප්‍රශ්න පත්‍ර", "papers.png"],
  ["ලිපි", "letter.png"],
  ["චක්‍රලේක", "circular.png"],
  ["ආකෘතිපත්‍ර", "form.png"],
  ["නිබන්ධන", "tutes.png"],
  ["ඡායාරූප", "photos.png"],
  ["අයදුම්පත්‍ර", "applications.png"],
  ["වෙනත්", "other.png"],
  ["Notifications", "messages.png"],
];

function downloadName(key, categories) {
  if (key === "Notifications") return L("නිවේදන", "அறிவிப்புகள்", "Notices");
  if (state.lang === "en" && categories[key]) return categories[key];
  const tamil = {
    "ප්‍රශ්න පත්‍ර": "வினாத்தாள்கள்",
    "ලිපි": "கடிதங்கள்",
    "චක්‍රලේක": "சுற்றறிக்கைகள்",
    "ආකෘතිපත්‍ර": "படிவங்கள்",
    "නිබන්ධන": "குறிப்புகள்",
    "ඡායාරූප": "புகைப்படங்கள்",
    "අයදුම්පත්‍ර": "விண்ணப்பங்கள்",
    "වෙනත්": "மற்றவை",
  };
  if (state.lang === "ta" && tamil[key]) return tamil[key];
  return key;
}

function fileCell(item, column) {
  const url = item[column + "_url"];
  if (!url) return "";
  const href = String(url).split("/").map((part) => encodeURIComponent(part)).join("/");
  return `<a href="${esc(href)}">${esc(item[column])}</a>`;
}

async function renderDirectory(kind, title, hint) {
  const query = state.query || new URLSearchParams();
  const q = query.get("q") || "";
  const page = query.get("page") || "1";
  const type = query.get("type") || "";
  const data = await api("public-list", { query: { kind, q, page, type } });
  const cats = kind === "programmes"
    ? `<div class="chips"><a class="chip" href="#programmes">${esc(L("සියල්ල", "அனைத்தும்", "All"))}</a><a class="chip" href="#programmes?type=mdtu">MDTU</a><a class="chip" href="#programmes?type=productivity">${esc(L("ඵලදායිතා", "உற்பத்தி", "Productivity"))}</a></div>`
    : "";
  const table = recordTable(kind, data.items || []);
  $("#stage").innerHTML = `
    <section class="wrap section">
      <h1>${esc(title)}</h1>
      <form class="filters" data-search="${kind}">
        <label>${esc(t("search"))}<input name="q" value="${esc(q)}" placeholder="${esc(hint)}"></label>
        <button class="btn" type="submit">${esc(t("search"))}</button>
      </form>
      ${cats}
      <div class="table-wrap">${table}</div>
      <div class="pager">
        <a class="btn secondary" href="#${kind}?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&page=${Math.max(1, Number(page) - 1)}">${esc(L("පෙර", "முந்தைய", "Previous"))}</a>
        <span>${esc(page)}</span>
        <a class="btn secondary" href="#${kind}?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&page=${Number(page) + 1}">${esc(L("ඊළඟ", "அடுத்து", "Next"))}</a>
      </div>
    </section>`;
}

function recordTable(kind, items) {
  const empty = `<tr><td colspan="5">${esc(t("none"))}</td></tr>`;
  if (kind === "programmes") {
    const body = items.map((item) => `<tr><td><a href="#programme/${esc(item.atp_id)}">${esc(item.atp_trname)}</a></td><td>${esc(item.atp_location || "")}</td><td>${esc(showDate(item.atp_day1))}</td><td>${esc(item.atp_noofdays || "")}</td><td>${esc(item.atp_stime || "")}</td></tr>`).join("") || empty;
    return `<table><thead><tr><th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th><th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th><th>${esc(L("දිනය", "திகதி", "Date"))}</th><th>${esc(L("දින", "நாட்கள்", "Days"))}</th><th>${esc(L("වේලාව", "நேரம்", "Time"))}</th></tr></thead><tbody>${body}</tbody></table>`;
  }
  if (kind === "scholarships") {
    const body = items.map((item) => `<tr><td>${esc(item.fs_name)}</td><td>${esc(item.fs_country || "")}</td><td>${esc(showDate(item.fs_closingdate))}</td><td>${item.url ? `<a href="${esc(String(item.url).split("/").map((part) => encodeURIComponent(part)).join("/"))}">${esc(L("ලිපිය", "கோப்பு", "File"))}</a>` : ""}</td><td>${esc(item.fs_comment || "")}</td></tr>`).join("") || empty;
    return `<table><thead><tr><th>${esc(L("ශිෂ්‍යත්වය", "உதவித்தொகை", "Scholarship"))}</th><th>${esc(L("රට", "நாடு", "Country"))}</th><th>${esc(L("අවසන් දිනය", "கடைசி நாள்", "Closing date"))}</th><th>${esc(L("ලිපිය", "கோப்பு", "File"))}</th><th>${esc(L("විස්තරය", "விவரம்", "Details"))}</th></tr></thead><tbody>${body}</tbody></table>`;
  }
  const body = items.map((item) => `<tr><td>${esc(item.ot_training)}</td><td>${esc(item.ot_institute || "")}</td><td>${esc(showDate(item.ot_closingdate))}</td><td>${esc(item.ot_fees || "")}</td><td>${item.url ? `<a href="${esc(String(item.url).split("/").map((part) => encodeURIComponent(part)).join("/"))}">${esc(L("ලිපිය", "கோப்பு", "File"))}</a>` : ""}</td></tr>`).join("") || empty;
  return `<table><thead><tr><th>${esc(L("පාඨමාලාව", "படிப்பு", "Course"))}</th><th>${esc(L("ආයතනය", "நிறுவனம்", "Institute"))}</th><th>${esc(L("අවසන් දිනය", "கடைசி நாள்", "Closing date"))}</th><th>${esc(L("ගාස්තු", "கட்டணம்", "Fees"))}</th><th>${esc(L("ලිපිය", "கோப்பு", "File"))}</th></tr></thead><tbody>${body}</tbody></table>`;
}

function directoryCard(kind, item) {
  if (kind === "programmes") {
    return `<article class="card"><h3><a href="#programme/${esc(item.atp_id)}">${esc(item.atp_trname)}</a></h3><p class="muted">${esc(item.atp_location)} · ${esc(showDate(item.atp_day1))} · ${esc(item.atp_noofdays)} day(s)</p><p>${esc(item.atp_purpose || item.atp_targetgroup || "")}</p></article>`;
  }
  if (kind === "downloads") {
    const links = ["dwn_file", "dwn_file2", "dwn_file3", "dwn_file4"].filter((key) => item[key + "_url"]).map((key) => `<a href="${esc(item[key + "_url"])}">File</a>`).join(" ");
    return `<article class="card"><span class="chip">${esc(item.category)}</span><h3>${esc(item.dwn_name)}</h3><p>${esc(item.dwn_des || "")}</p><p>${links}</p></article>`;
  }
  if (kind === "directory") {
    return `<article class="card person">${item.photo ? `<img class="avatar-lg" alt="" src="${esc(item.photo)}">` : ""}<div><h3>${esc(item.stf_Name)}</h3><p class="muted">${esc(item.stf_desig)}<br>${esc(item.stf_office)}</p><p>${esc(item.stf_mobile)} ${esc(item.stf_email)}</p></div></article>`;
  }
  if (kind === "scholarships") {
    return `<article class="card"><h3>${esc(item.fs_name)}</h3><p class="muted">${esc(item.fs_country)} · closes ${esc(showDate(item.fs_closingdate))}</p><p>${esc(item.fs_comment || "")}</p>${item.url ? `<a href="${esc(item.url)}">Circular</a>` : ""}</article>`;
  }
  return `<article class="card"><h3>${esc(item.ot_training)}</h3><p class="muted">${esc(item.ot_institute)} · closes ${esc(showDate(item.ot_closingdate))}</p><p>${esc(item.ot_comnt || "")} ${esc(item.ot_fees || "")}</p>${item.url ? `<a href="${esc(item.url)}">Circular</a>` : ""}</article>`;
}

function renderStaffHistory() {
  const nid = state.query?.get("nid") || "";
  $("#stage").innerHTML = `
    <section class="wrap section">
      <h1>${esc(t("staff"))}</h1>
      <form class="filters staff-search" id="staff-history-form">
        <label>${esc(t("nid"))}<input name="nid" value="${esc(nid)}" required></label>
        <button class="btn" type="submit">${esc(t("viewDetails"))}</button>
      </form>
      <div id="staff-result" class="staff-list"></div>
      <div id="paper"></div>
    </section>`;
  if (nid) loadStaffHistory(nid);
}

async function loadStaffHistory(nid) {
  const slot = $("#staff-result");
  try {
    const data = await api("officer-history", { query: { nid } });
    const officer = data.officer;
    const rows = (data.trainings || []).map((row) => `<tr>
      <td>${esc(row.name)}</td>
      <td>${esc(showDate(row.start_date))}</td>
      <td>${esc(row.location || "")}</td>
      <td><button class="btn small" type="button" data-act="print-letter" data-nid="${esc(nid)}" data-atp="${esc(row.atp_id)}">${esc(t("printLetter"))}</button></td>
    </tr>`).join("");
    slot.innerHTML = `
      <article class="card person">${officer.photo ? `<img class="avatar-lg" alt="" src="${esc(officer.photo)}">` : ""}<div><h2>${esc(officer.name)}</h2><p>${esc(officer.designation)}<br>${esc(officer.office)}</p></div></article>
      <h2>${esc(t("attended"))}</h2>
      <p><strong>${esc(L("පුහුණු ප්‍රමාණය", "பயிற்சி எண்ணிக்கை", "Number of trainings"))}: ${(data.trainings || []).length}</strong></p>
      <div class="table-wrap"><table><thead><tr><th>${esc(t("programme"))}</th><th>${esc(t("date"))}</th><th>${esc(t("place"))}</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4">${esc(t("noTrainings"))}</td></tr>`}</tbody></table></div>
      <p class="muted">${esc(t("printHint"))}</p>`;
  } catch (error) {
    slot.innerHTML = `<div class="error">${/not found|No officer/i.test(error.message) ? esc(t("noOfficer")) : esc(error.message)}</div>`;
  }
}

async function printOfficerLetter(nid, atp) {
  const data = await api("officer-letter", { query: { nid, atp } });
  showLetter(data);
}

function renderAbout() {
  const services = [
    [
      L("පුහුණු අවශ්‍යතා හඳුනා ගැනීම සහ සැලසුම්කරණය", "பயிற்சித் தேவைகளை அடையாளம் காணலும் திட்டமிடலும்", "Identifying training needs and planning"),
      [
        L("වයඹ පළාත් රාජ්‍ය ආයතන හා සංවිධානවල පුහුණු අවශ්‍යතා හඳුනා ගැනීම.", "வடமேல் மாகாண அரச நிறுவனங்கள் மற்றும் அமைப்புகளின் பயிற்சித் தேவைகளை அடையாளம் காணுதல்.", "Identifying the training needs of public institutions and organisations in the North Western Province."),
        L("හඳුනාගත් පුහුණු අවශ්‍යතා අනුව පුහුණු වැඩසටහන්, වැඩමුළු සහ සම්මන්ත්‍රණ සකස් කිරීම හා පැවැත්වීම.", "அடையாளம் காணப்பட்ட தேவைகளின்படி பயிற்சிகள், பட்டறைகள் மற்றும் கருத்தரங்குகளைத் தயாரித்து நடத்துதல்.", "Preparing and holding training programmes, workshops and seminars according to the needs identified."),
        L("ආයතනවල ඵලදායීතාව හා කාර්යක්ෂමතාව වර්ධනය කිරීම.", "நிறுவனங்களின் உற்பத்தித்திறனையும் செயல்திறனையும் மேம்படுத்துதல்.", "Improving the productivity and efficiency of institutions."),
        L("පුහුණු අවශ්‍යතා එකතු කිරීම, වාර්ෂික පුහුණු සැලැස්ම සකස් කිරීම, නිලධාරී නාමයෝජනා, පැමිණීම සහ මූල්‍ය වියදම් විධිමත්ව පවත්වාගෙන යාම.", "பயிற்சித் தேவைகளைச் சேகரித்தல், ஆண்டுப் பயிற்சித் திட்டம் தயாரித்தல், அதிகாரி நியமனங்கள், வருகை மற்றும் நிதிச் செலவுகளை முறையாகப் பேணுதல்.", "Collecting training needs, preparing the annual training plan, and properly managing officer nominations, attendance and expenditure."),
      ],
    ],
    [
      L("භාෂා හා කුසලතා සංවර්ධන වැඩසටහන්", "மொழி மற்றும் திறன் மேம்பாட்டுத் திட்டங்கள்", "Language and skills development programmes"),
      [
        L("වෙනත් රාජ්‍ය හා පෞද්ගලික සංවිධාන සමඟ පුහුණු වැඩසටහන් පැවැත්වීම හා සම්බන්ධීකරණය කිරීම.", "பிற அரச மற்றும் தனியார் அமைப்புகளுடன் பயிற்சிகளை நடத்துதலும் ஒருங்கிணைத்தலும்.", "Holding and coordinating training programmes with other public and private organisations."),
        L("රාජ්‍ය භාෂා දෙපාර්තමේන්තුව සහ ජාතික භාෂා අධ්‍යාපන හා පුහුණු ආයතනය සමඟ භාෂා පුහුණු පාඨමාලා පැවැත්වීම සම්බන්ධීකරණය කිරීම.", "அரசகரும மொழிகள் திணைக்களம் மற்றும் தேசிய மொழிக் கல்வி மற்றும் பயிற்சி நிறுவனத்துடன் மொழிப் பயிற்சிநெறிகளை ஒருங்கிணைத்தல்.", "Coordinating language training courses with the Department of Official Languages and the National Institute of Language Education and Training."),
        L("රාජ්‍ය නිලධාරීන්ගේ දැනුම, කුසලතා හා ආකල්ප වැඩි දියුණු කරගැනීම සඳහා විවිධ පුහුණු පාඨමාලා හැදෑරීම පිණිස ජාතික හා ජාත්‍යන්තර අධ්‍යාපනික හා පුහුණු ආයතන වෙත යොමු කිරීම.", "அரச அதிகாரிகளின் அறிவு, திறன் மற்றும் மனப்பான்மையை மேம்படுத்தப் பல்வேறு பயிற்சிநெறிகளைப் பயில தேசிய மற்றும் சர்வதேசக் கல்வி, பயிற்சி நிறுவனங்களுக்குப் பரிந்துரைத்தல்.", "Referring public officers to national and international education and training institutions for courses that improve their knowledge, skills and attitudes."),
      ],
    ],
    [
      L("විදේශීය හා බාහිර පුහුණු අවස්ථා මෙන්ම ප්‍රතිපාදන", "வெளிநாட்டு மற்றும் வெளிப்புறப் பயிற்சி வாய்ப்புகளும் நிதி ஒதுக்கீடுகளும்", "Foreign and external training opportunities and funding"),
      [
        L("විදේශ රටවල් මඟින් සංවිධානය කරන විවිධ පුහුණු පාඨමාලා, වැඩමුළු සහ සම්මන්ත්‍රණ සඳහා සහභාගී වීම සහ රාජ්‍ය නිලධාරීන් යොමු කිරීම.", "வெளிநாடுகள் ஏற்பாடு செய்யும் பயிற்சிநெறிகள், பட்டறைகள் மற்றும் கருத்தரங்குகளில் பங்கேற்றலும் அரச அதிகாரிகளைப் பரிந்துரைத்தலும்.", "Taking part in, and nominating public officers for, training courses, workshops and seminars organised by foreign countries."),
        L("වයඹ පළාතේ රාජ්‍ය නිලධාරීන්ට බාහිර අධ්‍යාපනික හා පුහුණු ආයතන මඟින් පවත්වනු ලබන අධ්‍යාපන හා පුහුණු පාඨමාලා හැදෑරීමට අවශ්‍ය ප්‍රතිපාදන ලබා දීම.", "வடமேல் மாகாண அரச அதிகாரிகள் வெளிப்புறக் கல்வி, பயிற்சி நிறுவனங்கள் நடத்தும் பாடநெறிகளைப் பயிலத் தேவையான நிதியை வழங்குதல்.", "Providing funds for public officers of the province to follow courses run by external education and training institutions."),
      ],
    ],
    [
      L("විශේෂිත සමාජීය හා ආයතනික සේවාවන්", "சிறப்புச் சமூக மற்றும் நிறுவனச் சேவைகள்", "Special social and institutional services"),
      [
        L("වයඹ පළාත් මත්ද්‍රව්‍ය නිවාරණ ඒකකය හරහා රාජ්‍ය නිලධාරීන් හා ප්‍රජාව දැනුවත් කිරීම සඳහා මත්ද්‍රව්‍ය නිවාරණ වැඩසටහන් පැවැත්වීම හා සම්බන්ධීකරණය කිරීම සඳහාත්, උසස් අධ්‍යාපන කටයුතු සඳහා අවශ්‍ය ප්‍රතිපාදන ලබා දීම.", "வடமேல் மாகாண போதைத் தடுப்புப் பிரிவின் ஊடாக அரச அதிகாரிகளுக்கும் சமூகத்துக்கும் விழிப்புணர்வூட்டும் போதைத் தடுப்புத் திட்டங்களை நடத்தவும் ஒருங்கிணைக்கவும், உயர் கல்விக்கும் தேவையான நிதியை வழங்குதல்.", "Providing funds to hold and coordinate drug-prevention programmes that raise awareness among public officers and the community through the North Western Provincial Drug Prevention Unit, and for higher education."),
        L("රාජ්‍ය, රාජ්‍ය නොවන සහ පෞද්ගලික සංවිධාන මඟින් සංවිධානය කර පවත්වනු ලබන විවිධ වැඩසටහන්, වැඩමුළු සහ සම්මන්ත්‍රණ සඳහා පළාත් සභා ශ්‍රවණාගාරය අනුමත ගාස්තු අයකර වෙන්කර දීම.", "அரச, அரச சார்பற்ற மற்றும் தனியார் அமைப்புகள் நடத்தும் நிகழ்ச்சிகள், பட்டறைகள் மற்றும் கருத்தரங்குகளுக்கு அங்கீகரிக்கப்பட்ட கட்டணத்தில் மாகாண சபை அரங்கை ஒதுக்கீடு செய்தல்.", "Reserving the Provincial Council auditorium, for the approved fee, for programmes, workshops and seminars held by public, non-governmental and private organisations."),
        L("පළාත් රාජ්‍ය සේවයේ නිලධාරීන්ගේ විදේශ නිවාඩු අනුමත කිරීමේ කටයුතු සිදු කිරීම.", "மாகாண அரச சேவை அதிகாரிகளின் வெளிநாட்டு விடுமுறைக்கு அனுமதி வழங்கும் பணிகளை மேற்கொள்ளுதல்.", "Processing the approval of overseas leave for officers of the provincial public service."),
      ],
    ],
  ];
  $("#stage").innerHTML = `
    <section class="wrap section about-page">
      <h1>${esc(t("about"))}</h1>
      <header class="about-hero">
        <strong>${esc(L("වයඹ පළාත් සභාවේ කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය", "வடமேல் மாகாண சபையின் முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு", "Management Development and Training Unit, North Western Provincial Council"))}</strong>
        <span>${esc(L("කුරුණෑගල", "குருநாகல்", "Kurunegala"))}</span>
      </header>
      <div class="about-vm">
        <article class="card">
          <h2>${esc(L("දැක්ම", "தொலைநோக்கு", "Vision"))}</h2>
          <p class="about-vision">${esc(L("තිරසර ලෙස සංවර්ධිත වයඹ පළාතක්", "நிலையான அபிவிருத்தியடைந்த வடமேல் மாகாணம்", "A sustainably developed North Western Province"))}</p>
        </article>
        <article class="card">
          <h2>${esc(L("මෙහෙවර", "பணிக்கூற்று", "Mission"))}</h2>
          <p>${esc(L(
            "වයඹ පළාතේ ජනතාවට සැපයෙන පොදු සේවාවන් විශේෂ අන්දමින් ලබා දීමට ඇප කැප වූ කාර්යක්ෂම හා ඵලදායී රාජ්‍ය සේවාවක් ඇති කිරීම පිණිස ප්‍රශස්ත පුහුණුව, පර්යේෂණ, උපදේශක සේවා හා තොරතුරු සේවා ඇතුළු විවිධ මාර්ග වලින් වයඹ පළාත් සභාව තුළ හා වයඹ පළාත් රාජ්‍ය අංශය තුළ මානව සම්පත් සංවර්ධනය හා ඵලදායී කළමනාකරණය ඇති කිරීම අපගේ මෙහෙවර වේ.",
            "வடமேல் மாகாண மக்களுக்கு வழங்கப்படும் பொதுச் சேவைகளைச் சிறப்பாக வழங்க அர்ப்பணிப்புள்ள, திறமையான மற்றும் பயனுள்ள அரச சேவையை உருவாக்கும் நோக்கில், சிறந்த பயிற்சி, ஆராய்ச்சி, ஆலோசனைச் சேவைகள் மற்றும் தகவல் சேவைகள் உள்ளிட்ட பல்வேறு வழிகளில் வடமேல் மாகாண சபையிலும் மாகாண அரச துறையிலும் மனிதவள அபிவிருத்தியையும் பயனுள்ள முகாமைத்துவத்தையும் ஏற்படுத்துவதே எமது பணியாகும்.",
            "Our mission is to develop human resources and effective management within the North Western Provincial Council and the provincial public sector, through the best possible training, research, advisory and information services, so as to build an efficient and effective public service dedicated to serving the people of the province."
          ))}</p>
        </article>
      </div>
      <h2 class="about-head">${esc(L("අපගේ ප්‍රධාන කාර්යභාරය හා සේවාවන්", "எமது முக்கியப் பணிகளும் சேவைகளும்", "Our main role and services"))}</h2>
      <p class="about-lead">${esc(L(
        "කුරුණෑගල කේන්ද්‍ර කරගනිමින් ක්‍රියාත්මක වන වයඹ පළාත් සභාවේ කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය මඟින් පළාත් රාජ්‍ය සේවයේ සංවර්ධනය සහ කාර්යක්ෂමතාව වෙනුවෙන් පහත සඳහන් සේවාවන් සහ කාර්යයන් ඉටු කරනු ලබයි:",
        "குருநாகலை மையமாகக் கொண்டு இயங்கும் வடமேல் மாகாண சபையின் முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு, மாகாண அரச சேவையின் அபிவிருத்திக்கும் செயல்திறனுக்கும் பின்வரும் சேவைகளையும் பணிகளையும் ஆற்றுகிறது:",
        "Based in Kurunegala, the Management Development and Training Unit of the North Western Provincial Council carries out the following services and functions for the development and efficiency of the provincial public service:"
      ))}</p>
      <div class="about-services">
        ${services.map(([title, points], index) => `<article class="card about-service"><span class="about-num">${index + 1}</span><h3>${esc(title)}</h3><ul>${points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></article>`).join("")}
      </div>
      <article class="card about-contact">
        <h2>${esc(L("සම්බන්ධ වන්න", "தொடர்பு கொள்ள", "Contact us"))}</h2>
        <dl>
          <dt>${esc(L("ලිපිනය", "முகவரி", "Address"))}</dt>
          <dd>${esc(L("කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය, කුරුණෑගල, වයඹ පළාත.", "முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு, குருநாகல், வடமேல் மாகாணம்.", "Management Development and Training Unit, Kurunegala, North Western Province."))}</dd>
          <dt>${esc(L("විමසීම්", "விசாரணைகள்", "Enquiries"))}</dt>
          <dd>${esc(L("නියෝජ්‍ය ප්‍රධාන ලේකම් (පුද්ගල හා පුහුණු), වයඹ පළාත් සභාව, කුරුණෑගල.", "துணைப் பிரதம செயலாளர் (ஆளணி மற்றும் பயிற்சி), வடமேல் மாகாண சபை, குருநாகல்.", "Deputy Chief Secretary (Personnel and Training), North Western Provincial Council, Kurunegala."))}</dd>
          <dt>${esc(L("දුරකථන අංකය", "தொலைபேசி", "Telephone"))}</dt>
          <dd><a href="tel:+94372222018">+94 37 2222018</a></dd>
          <dt>${esc(L("ෆැක්ස් අංකය", "தொலைநகல்", "Fax"))}</dt>
          <dd>+94 37 2223655</dd>
          <dt>${esc(L("විද්‍යුත් තැපැල් ලිපිනය", "மின்னஞ்சல்", "Email"))}</dt>
          <dd><a href="mailto:nwptrainingunit@gmail.com">nwptrainingunit@gmail.com</a></dd>
        </dl>
      </article>
    </section>`;
}

function renderContact() {
  $("#stage").innerHTML = `
    <section class="wrap section">
      <h1>${esc(t("contact"))}</h1>
      <div class="grid-2">
      <article class="card">
        <p>${esc(t("contactBody"))}</p>
      </article>
      <form class="card" id="comment-form">
        <h2>${esc(t("suggest"))}</h2>
        <div id="comment-msg"></div>
        <div class="form-grid">
          <label>Name<input name="name" required></label>
          <label>Office<input name="office"></label>
          <label>Telephone<input name="phone"></label>
          <label>Email<input name="email" type="email"></label>
          <label class="wide">Suggestion<textarea name="comment" required></textarea></label>
        </div>
        <p><button class="btn" type="submit">${esc(t("send"))}</button></p>
      </form>
      </div>
    </section>`;
}

async function renderConsole() {
  if (!state.user) {
    $("#stage").innerHTML = `<section class="wrap section"><div class="card"><h1>${esc(t("signin"))}</h1><button class="btn" type="button" data-act="login-open">${esc(t("enter"))}</button></div></section>`;
    return;
  }
  if (!state.catalog.length) {
    const catalog = await api("catalog");
    state.catalog = catalog.items;
    state.options = await api("options");
  }
  if (state.module === "namelist") {
    $("#stage").innerHTML = `
      <section class="work-page classic">
        <p class="crumb"><a href="#console/scheduled">${esc(t("back"))}</a> · ${esc(L("සහභාගී වන්නන්ගේ නාම ලේඛනය", "பங்கேற்பாளர் பெயர்ப்பட்டியல்", "Participants' name list"))}</p>
        <div id="work"><p class="muted">Loading…</p></div>
      </section>`;
    try {
      await renderNameList($("#work"));
    } catch (error) {
      $("#work").innerHTML = `<div class="error">${esc(error.message)}</div>`;
    }
    return;
  }
  const current = state.catalog.find((item) => item.id === state.module) || state.catalog[0];
  if (!current || current.kind === "dashboard" || state.module === "dashboard") {
    $("#stage").innerHTML = `<section id="work"></section>`;
    renderDashboard($("#work"));
    return;
  }
  $("#stage").innerHTML = `
        <section class="work-page${classicPages()[state.module] || ["needs", "plan", "apply", "provision", "cp_atp", "applications", "attendance", "scheduled", "finish", "finish2", "advance", "estimate", "revise", "offweb", "signsheet", "panelsign", "private", "cp_staff", "cp_trainingofficers", "birthdays", "cp_completedtrainings", "signatory", "modular", "evaluation", "messages", "total", "pace", "person", "settle", "ahead", "attended"].includes(state.module) ? " classic" : ""}">
      <p class="crumb"><a href="#console/dashboard">${esc(t("back"))}</a> · ${esc((classicPages()[state.module] || (state.module === "needs" ? classicPages().cp_trrequirements : null))?.title?.() || deliveryTitle(state.module) || current.label)}</p>
      <div id="work"><p class="muted">Loading…</p></div>
    </section>`;
  try {
    await renderModule(current);
    if (YEAR_PAGES.has(state.module)) paintYearBar($("#work"));
  } catch (error) {
    $("#work").innerHTML = `<div class="error">${esc(error.message)}</div>`;
  }
}

async function renderModule(item) {
  const work = $("#work");
  if (!item) return;
  if (item.kind === "dashboard") return renderDashboard(work);
  if (item.kind === "birthdays") return renderBirthdays(work);
  if (item.kind === "table" && item.table === "cp_atp") return renderAnnual(work);
  if (item.kind === "table" && item.table === "cp_completedtrainings") return renderCompleted(work);
  if (item.kind === "table" && item.table === "cp_staff") return renderStaff(work);
  if (item.kind === "table" && item.table === "cp_trainingofficers") return renderOfficers(work);
  if (item.kind === "table" && classicPages()[item.table]) return renderClassic(work, item.table);
  if (item.kind === "table") return renderTable(work, item.table);
  if (item.kind === "needs") return renderNeeds(work);
  if (item.kind === "apply") return renderApply(work);
  if (item.kind === "provision") return renderProvision(work);
  if (item.kind === "plan") return renderPlan(work);
  if (item.kind === "applications") return renderApplications(work);
  if (item.kind === "attendance") return renderAttendance(work);
  if (item.kind === "scheduled") return renderScheduled(work);
  if (item.kind === "finish") return renderFinish(work);
  if (item.kind === "finish2") return renderFinish2(work);
  if (item.kind === "advance") return renderAdvance(work);
  if (item.kind === "reports") return renderReports(work);
  if (item.kind === "private") return renderPrivate(work);
  if (item.kind === "letter") return renderLetter(work);
  if (item.kind === "signatory") return renderSignatory(work);
  if (item.kind === "estimate") return renderEstimate(work);
  if (item.kind === "revise") return renderRevise(work);
  if (item.kind === "offweb") return renderOffweb(work);
  if (item.kind === "signsheet") return renderSignSheet(work);
  if (item.kind === "panelsign") return renderPanelSign(work);
  if (item.kind === "modular") return renderModular(work);
  if (item.kind === "evaluation") return renderEvaluation(work);
  if (item.kind === "messages") return renderMessages(work);
  if (item.kind === "total") return renderTotal(work);
  if (item.kind === "pace") return renderPace(work);
  if (item.kind === "person") return renderPerson(work);
  if (item.kind === "attended") return renderAttended(work);
  if (item.kind === "settle") return renderSettle(work);
  if (item.kind === "ahead") return renderAhead(work);
  work.innerHTML = "<p>This section is not available.</p>";
}

function renderDashboard(work) {
  const role = state.user.role;
  const color = role === "User" ? "#198064" : "#87ceeb";
  const who = [state.user.username, state.user.office, role].filter(Boolean).join(" · ");
  work.innerHTML = `<div class="who-bar">${esc(who)}</div><div class="dash">${boardsFor(role, color)}</div>`;
}

function tile(href, icon, si, ta, en) {
  return `<a class="tile" href="${href}"><img src="images/${encodeURIComponent(icon)}" alt=""><span>${esc(L(si, ta, en))}</span></a>`;
}

function iconRows(tiles, oneRow) {
  const parts = String(tiles || "").split("</a>").map((part) => part.trim()).filter(Boolean).map((part) => `${part}</a>`);
  if (oneRow || parts.length < 2) return `<div class="icon-row single">${parts.join("")}</div>`;
  const mid = Math.ceil(parts.length / 2);
  return `<div class="icon-row">${parts.slice(0, mid).join("")}</div><div class="icon-row">${parts.slice(mid).join("")}</div>`;
}

function board(color, icon, si, ta, en, tiles, oneRow) {
  const ink = color === "#198064" ? "#fff" : "#08324a";
  return `<section class="board"><div class="board-name" style="background:${color};color:${ink}"><img src="images/${encodeURIComponent(icon)}" alt=""><span>${esc(L(si, ta, en))}</span></div><div class="board-icons">${iconRows(tiles, oneRow)}</div></section>`;
}

function deliveryTitle(module) {
  const names = {
    attended: () => L("පුහුණුවලට සහභාගී වූ නිලධාරීන්ගේ නාමලේඛනය", "பயிற்சியில் பங்கேற்ற அதிகாரிகளின் பெயர்ப்பட்டியல்", "Register of officers who attended training"),
    applications: () => L("ඉල්ලීම් කළ අය", "விண்ணப்பதாரர்கள்", "Applicants"),
    attendance: () => L("පුහුණු වැඩමුළු සඳහා තෝරාගත් නිලධාරීන්", "பயிற்சிப் பட்டறைக்குத் தேர்ந்த அதிகாரிகள்", "Officers selected for the workshops"),
    scheduled: () => L("පැවැත්වීමට නියමිත පුහුණු වැඩසටහන්", "நடத்தப்படவுள்ள பயிற்சிகள்", "Programmes due to be held"),
    finish: () => L("වැඩසටහන අවසන් කිරීම පියවර-1", "நிகழ்ச்சியை முடித்தல் படி 1", "Finish the programme, step 1"),
    finish2: () => L("වැඩසටහන අවසන් කිරීම පියවර 2", "நிகழ்ச்சியை முடித்தல் படி 2", "Finish the programme, step 2"),
    advance: () => L("අත්තිකාරම් විස්තර", "முன்பண விவரம்", "Advance details"),
    provision: () => L("ප්‍රතිපාදන", "ஒதுக்கீடு", "Allocations"),
    revise: () => L("සංශෝධිත ඇස්තමේන්තු සැකසීම", "திருத்திய மதிப்பீடு அமைத்தல்", "Prepare a revised estimate"),
    offweb: () => L("වෙබ් අඩවිය මගින් කැඳවීම නොකර පවත්වන පුහුණු ඇතුළත් කිරීම හා ඇස්තමේන්තු සැකසීම", "இணையம் வழியாக அழைக்காமல் நடத்தும் பயிற்சியைச் சேர்த்தல் மற்றும் மதிப்பீடு", "Enter a training not called through the website and prepare the estimate"),
    estimate: () => L("ඉදිරියේදී පැවැත්වීමට නියමිත පුහුණු වැඩසටහන්", "வரவிருக்கும் பயிற்சிகள்", "Upcoming programmes"),
    letter: () => L("කැඳවීමේ ලිපිය", "அழைப்புக் கடிதம்", "Call letter"),
    modular: () => L("මොඩියුලර් සැකසීම", "மட்டு அமைப்பு", "Modular setup"),
    evaluation: () => L("පෙර ඇගයීම සහ පසු ඇගයීම", "முன் மதிப்பீடு மற்றும் பின் மதிப்பீடு", "Pre-evaluation and post-evaluation"),
    messages: () => L("පණිවිඩ", "செய்திகள்", "Messages"),
    total: () => L("Total", "Total", "Total"),
    pace: () => L("මාසික වාර්ෂික ප්‍රගතිය", "மாதாந்திர ஆண்டு முன்னேற்றம்", "Monthly and annual progress"),
    person: () => L("එක් පුද්ගල වාර්තා", "ஒரு நபர் அறிக்கை", "One-person report"),
    settle: () => L("ඇස්තමේන්තු, ආහාර බිල් සහ දීමනා", "மதிப்பீடு, உணவுப் பட்டியல், கொடுப்பனவு", "Estimate, food bills and allowances"),
    ahead: () => L("ප්‍රගති වාර්තා", "முன்னேற்ற அறிக்கை", "Progress reports"),
    signatory: () => L("නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)", "துணைப் பிரதம செயலாளர் (பயிற்சி)", "Deputy Chief Secretary (Training)"),
    signsheet: () => L("අත්සන් පත්‍රය", "கையொப்பப் படிவம்", "Sign sheet"),
    panelsign: () => L("අත්සන් ලේඛණය කාර්යමණ්ඩල හා සම්පත්දායක", "கையொப்பப் பட்டியல்", "Staff and resource-person sign sheet"),
    private: () => L("බාහිර පුහුණු පාඨමාලාව", "வெளிப்புற படிப்பு", "External course"),
    cp_staff: () => L("කාර්යමණ්ඩල ලේඛනය", "பணியாளர் பதிவு", "Staff register"),
    cp_trainingofficers: () => L("පුහුණු නිලධාරීන්", "பயிற்சி அதிகாரிகள்", "Training officers"),
    birthdays: () => L("අද දින උපන්දිනය සමරන නිලධාරීන්", "இன்று பிறந்தநாள் கொண்ட அதிகாரிகள்", "Officers celebrating a birthday today"),
  };
  return names[module] ? names[module]() : "";
}

function boardsFor(role, color) {
  const control = board(color, "control.png", "පාලනය", "கட்டுப்பாடு", "Control", [
    tile("#console/cp_desigs", "designations.png", "තනතුරු", "பதவிகள்", "Designations"),
    tile("#console/offices", "office.png", "කාර්යාල", "அலுவலகங்கள்", "Offices"),
    tile("#console/cp_login", "users.png", "පරිශීලකයන්", "பயனர்கள்", "Users"),
    tile("#console/cp_trainings", "trainings.png", "පුහුණු වැඩසටහන්", "பயிற்சிகள்", "Training programmes"),
    tile("#console/cp_trfields", "subjects.png", "විෂය ක්ෂේත්‍ර", "பாடத் துறைகள்", "Subject fields"),
    tile("#console/cp_treqperiod", "timeframe.png", "පුහුණු අවශ්‍යතා කාල සීමාව", "பயிற்சி தேவை கால வரம்பு", "Training-needs period"),
    tile("#console/cp_slideshowimgs", "photos.png", "මුල් පිටුවේ පෙන්වන රූප", "முகப்பில் காட்டும் படங்கள்", "Pictures on the home page"),
    tile("#console/cp_usercomments", "comments.png", "පරිශීලක යෝජනා", "பயனர் ஆலோசனைகள்", "User suggestions"),
    tile("#console/cp_downloads", "download.png", "බාගත කිරීම්", "பதிவிறக்கங்கள்", "Downloads"),
    tile("#console/cp_services", "services.png", "සේවා", "சேவைகள்", "Services"),
    tile("#console/cp_trcenters", "centers.png", "පුහුණු මධ්‍යස්ථාන", "பயிற்சி மையங்கள்", "Training centres"),
    tile("#console/cp_funds", "funds.png", "අරමුදල්", "நிதி மூலங்கள்", "Funds"),
    tile("#console/cp_messeges", "messages.png", "දැනුම්දීම්", "அறிவிப்புகள்", "Notices"),
    tile("#console/cp_food", "food.png", "ආහාර", "உணவு", "Food"),
    tile("#console/cp_foreignschols", "foreignscholarships.png", "විදේශ ශිෂ්‍යත්ව", "உதவித்தொகை", "Foreign scholarships"),
    tile("#console/cp_outsidetrcource", "privatetrainings.png", "බාහිර පුහුණු පාඨමාලා", "வெளிப்புற பயிற்சிப் படிப்புகள்", "External training courses"),
    tile("#console/cp_appliedforiegnscholars", "scholofficers.png", "ශිෂ්‍යත්ව සඳහා අයදුම් කළ නිලධාරීන්", "உதவித்தொகைக்கு விண்ணப்பித்த அதிகாரிகள்", "Officers who applied for scholarships"),
  ].join(""));
  const plan = board(color, "trainingplan.png", "පුහුණු සැලසුම", "பயிற்சித் திட்டம்", "Training plan", [
    tile("#console/cp_trrequirements", "trainingrequirements.png", "පුහුණු අවශ්‍යතා", "பயிற்சி தேவைகள்", "Training needs"),
    tile("#console/trdate", "trdate.png", "පුහුණු අවශ්‍යතා ලැබුණු අවසන් දිනය", "பயிற்சி தேவைகள் கிடைக்கும் கடைசி நாள்", "Last date for training needs"),
    tile("#console/plan", "preplan.png", "පුහුණු සැලසුම සකස් කිරීම", "பயிற்சித் திட்டம் அமைத்தல்", "Prepare the training plan"),
    tile("#console/cp_atp", "changeplan.png", "පුහුණු සැලසුම වෙනස් කිරීම", "பயிற்சித் திட்டம் மாற்றுதல்", "Change the training plan"),
    tile("#console/cp_resourcepersons", "resourcepersons.png", "සම්පත් දායකයන්", "வள ஆள்கள்", "Resource persons"),
    tile("#console/cp_outsidetrcource", "privatetrainings.png", "පිටස්තර ආයතන මගින් පවත්වන පුහුණු වැඩසටහන්", "வெளி நிறுவனப் பயிற்சிகள்", "Programmes run by outside institutes"),
    tile("#console/apply", "applytr.png", "පුහුණු වැඩසටහන් අයදුම් කිරීම", "பயிற்சி விண்ணப்பம்", "Apply for a programme"),
    tile("#console/provision", "funds.png", "ප්‍රතිපාදන", "ஒதுக்கீடு", "Allocations"),
    tile("#console/provision?tab=move", "budjrept.png", "ප්‍රතිපාදන මාරු කිරීම", "ஒதுக்கீட்டு மாற்றம்", "Allocation transfers"),
  ].join(""), true);
  const conduct = board(color, "conducttraiings.png", "පුහුණු වැඩමුළු ක්‍රියාත්මක කිරීම", "பயிற்சிப் பட்டறை நடத்துதல்", "Running the workshops", [
    tile("#console/applications", "applications.png", "පුහුණු වැඩසටහන් සඳහා අයදුම් කළ අය", "பயிற்சிக்கு விண்ணப்பித்தோர்", "People who applied for programmes"),
    tile("#console/attendance", "selected.png", "පුහුණු වැඩමුළු සඳහා තෝරාගත් නිලධාරීන්", "பயிற்சிப் பட்டறைக்குத் தேர்ந்த அதிகாரிகள்", "Officers selected for the workshops"),
    tile("#console/scheduled", "trlist.png", "පැවැත්වීමට නියමිත පුහුණු වැඩසටහන්", "நடத்தப்படவுள்ள பயிற்சிகள்", "Programmes due to be held"),
    tile("#console/revise", "budjrept.png", "සංශෝධිත ඇස්තමේන්තු සැකසීම", "திருத்திய மதிப்பீடு அமைத்தல்", "Prepare a revised estimate"),
    tile("#console/offweb", "form.png", "වෙබ් අඩවිය මගින් කැඳවීම නොකර පවත්වන පුහුණු ඇතුළත් කිරීම හා ඇස්තමේන්තු සැකසීම", "இணையம் வழியாக அழைக்காமல் நடத்தும் பயிற்சியைச் சேர்த்தல் மற்றும் மதிப்பீடு", "Enter a training not called through the website and prepare the estimate"),
    tile("#console/finish", "complete.png", "වැඩසටහන අවසන් කිරීම පියවර-1", "நிகழ்ச்சியை முடித்தல் படி 1", "Finish the programme, step 1"),
    tile("#console/finish2", "complete.png", "වැඩසටහන අවසන් කිරීම පියවර 2", "நிகழ்ச்சியை முடித்தல் படி 2", "Finish the programme, step 2"),
    tile("#console/cp_completedtrainings", "completed.png", "අවසන් කළ පුහුණු වැඩසටහන්", "முடிந்த பயிற்சிகள்", "Finished training programmes"),
    tile("#console/cp_privatetrainings", "pts.png", "පෞද්ගලික පුහුණු පාඨමාලා සඳහා ප්‍රතිපාදන", "தனியார் படிப்பு நிதி", "Funds for private training courses"),
    tile("#console/cp_othertrainings", "privatetrainings.png", "වෙනත් කාර්යාල මගින් පවත්වන ලද පුහුණු වැඩසටහන්", "பிற அலுவலகப் பயிற்சிகள்", "Programmes conducted by other offices"),
    tile("#console/letter", "letter.png", "කැඳවීමේ ලිපිය", "அழைப்புக் கடிதம்", "Call letter"),
    tile("#console/signatory", "letter.png", "නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)", "துணைப் பிரதம செயலாளர் (பயிற்சி)", "Deputy Chief Secretary (Training)"),
    tile("#console/signsheet", "participatedemps.png", "සහභාගිවූවන්ගේ අත්සන් පත්‍රය", "பங்கேற்றோர் கையொப்பப் படிவம்", "Participants' sign sheet"),
    tile("#console/estimate", "budjrept.png", "ඇස්තමේන්තුව", "மதிப்பீடு", "Estimate"),
    tile("#console/modular", "form.png", "මොඩියුලර් සැකසීම", "மட்டு அமைப்பு", "Modular setup"),
    tile("#console/evaluation", "papers.png", "පෙර ඇගයීම සහ පසු ඇගයීම", "முன் மதிப்பீடு மற்றும் பின் மதிப்பீடு", "Pre-evaluation and post-evaluation"),
    tile("#console/messages", "messages.png", "පණිවිඩ", "செய்திகள்", "Messages"),
    tile("#console/reports", "antrpl.png", "වාර්තා", "அறிக்கைகள்", "Reports"),
  ].join(""));
  const people = board(color, "employees.png", "කාර්යමණ්ඩල තොරතුරු", "பணியாளர் விவரங்கள்", "Staff details", [
    tile("#console/cp_staff", "addemployee.png", "කාර්යමණ්ඩල ලේඛනය", "பணியாளர் பதிவு", "Staff register"),
    tile("#console/cp_staff?tab=blacklist", "blacklist.png", "අසාදු ලේඛනය", "தடைப் பட்டியல்", "Blacklist"),
    tile("#console/cp_trainingofficers", "subjectofficers.png", "පුහුණු නිලධාරීන්", "பயிற்சி அதிகாரிகள்", "Training officers"),
    tile("#console/cp_resourcepersons", "resourcepersons.png", "සම්පත් දායකයන්", "வள ஆள்கள்", "Resource persons"),
    tile("#console/panelsign", "participatedemps.png", "අත්සන් ලේඛණය කාර්යමණ්ඩල හා සම්පත්දායක", "கையொப்பப் பட்டியல்", "Staff and resource-person sign sheet"),
    tile("#console/cp_foriegnscholars", "foriegnscholars.png", "විදේශ ශිෂ්‍යත්ව සඳහා සහභාගී වූ නිලධාරීන්", "உதவித்தொகை பெற்ற அதிகாரிகள்", "Officers who took part in foreign scholarships"),
    tile("#console/birthdays", "birthdays.png", "අද දින උපන්දිනය සමරන නිලධාරීන්", "இன்று பிறந்தநாள் கொண்ட அதிகாரிகள்", "Officers celebrating a birthday today"),
  ].join(""), true);
  const reports = board(color, "reports.png", "වාර්තා", "அறிக்கைகள்", "Reports", [
    tile("#console/ahead?tab=office", "office.png", "කාර්යාල ප්‍රගතිය", "அலுவலக முன்னேற்றம்", "Office progress"),
    tile("#console/ahead?tab=general", "trainingplan.png", "පොදු පුහුණු ප්‍රගතිය", "பொதுப் பயிற்சி முன்னேற்றம்", "General training progress"),
    tile("#console/ahead?tab=special", "trainings.png", "විශේෂ පුහුණු ප්‍රගතිය", "சிறப்புப் பயிற்சி முன்னேற்றம்", "Special training progress"),
    tile("#console/ahead?tab=department", "centers.png", "දෙපාර්තමේන්තු පුහුණු ප්‍රගතිය", "திணைக்களப் பயிற்சி முன்னேற்றம்", "Departmental training progress"),
    tile("#console/ahead?tab=compare", "summary.png", "වාර්ෂික ප්‍රගති සංසන්දනය", "ஆண்டு முன்னேற்ற ஒப்பீடு", "Yearly progress comparison"),
    tile("#console/ahead?tab=drug", "summary.png", "මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන ප්‍රගතිය", "போதை தடுப்பு ஆலோசனை முன்னேற்றம்", "Drug prevention and counselling progress"),
    tile("#console/ahead?tab=tamil", "subjects.png", "දෙමළ භාෂා ප්‍රගතිය", "தமிழ் மொழி முன்னேற்றம்", "Tamil language progress"),
    tile("#console/ahead?tab=external", "privatetrainings.png", "බාහිර පුහුණු ප්‍රගතිය", "வெளிப்புற பயிற்சி முன்னேற்றம்", "External training progress"),
    tile("#console/ahead?tab=foreign", "foreignscholarships.png", "විදේශ පුහුණු ප්‍රගතිය", "வெளிநாட்டு பயிற்சி முன்னேற்றம்", "Foreign training progress"),
    tile("#console/reports?name=annual", "summary.png", "වාර්ෂික පුහුණු සැලසුම් වාර්තාව", "ஆண்டுப் பயிற்சித் திட்ட அறிக்கை", "Annual training-plan report"),
    tile("#console/reports?name=summary", "antrpl.png", "විෂය අනුව පුහුණු වැඩසටහන් සංඛ්‍යාව", "பாடம் வாரியான பயிற்சி எண்ணிக்கை", "Programmes by subject"),
    tile("#console/reports?name=offices", "office.png", "කාර්යාල අනුව පුහුණු වැඩසටහන්", "அலுவலகம் வாரியான பயிற்சிகள்", "Programmes by office"),
    tile("#console/reports?name=summary", "reports.png", "පුහුණු වැඩසටහන් සංඛ්‍යාලේඛන", "பயிற்சி புள்ளிவிவரம்", "Training statistics"),
    tile("#console/reports?name=participants", "participatedemps.png", "පුහුණු වැඩසටහනකට සහභාගී වූ නිලධාරීන්", "பயிற்சியில் பங்கேற்ற அதிகாரிகள்", "Officers who took part in a programme"),
    tile("#console/attended", "participatedemps.png", "පුහුණුවලට සහභාගී වූ නිලධාරීන්ගේ නාමලේඛනය", "பயிற்சியில் பங்கேற்ற அதிகாரிகளின் பெயர்ப்பட்டியல்", "Register of officers who attended training"),
    tile("#console/cp_resourcepersons", "resourcepersons.png", "සම්පත් දායකයන්ගේ විස්තර", "வள ஆள்களின் விவரம்", "Resource-person details"),
    tile("#console/pace", "summary.png", "මාසික වාර්ෂික ප්‍රගතිය", "மாதாந்திர ஆண்டு முன்னேற்றம்", "Monthly and annual progress"),
    tile("#console/person", "reports.png", "එක් පුද්ගල වාර්තා", "ஒரு நபர் அறிக்கை", "One-person report"),
    role === "Administrator" ? tile("#console/total", "summary.png", "Total", "Total", "Total") : "",
    tile("#console/settle?tab=advance", "budjrept.png", "ඇස්තමේන්තු", "மதிப்பீடு", "Estimate"),
    tile("#console/settle?tab=food", "food.png", "ආහාර බිල් පියවීම", "உணவுப் பட்டியல் தீர்வு", "Food bill settlement"),
    tile("#console/settle?tab=pay", "funds.png", "දීමනා සියල්ල", "அனைத்துக் கொடுப்பனவு", "All allowances"),
  ].join(""));
  if (role === "User") {
    return [
      board(color, "employees.png", "කාර්යමණ්ඩලය", "பணியாளர்கள்", "Staff", [
        tile("#console/cp_staff", "addemployee.png", "කාර්යමණ්ඩල ලේඛනය", "பணியாளர் பதிவு", "Staff register"),
        tile("#console/cp_trainingofficers", "subjectofficers.png", "පුහුණු නිලධාරීන්", "பயிற்சி அதிகாரிகள்", "Training officers"),
        tile("#console/cp_resourcepersons", "resourcepersons.png", "සම්පත් දායකයින්", "வள ஆள்கள்", "Resource persons"),
      ].join("")),
      board(color, "trainingplan.png", "පුහුණු සැලැස්ම", "பயிற்சி திட்டம்", "Training plan", [
        tile("#console/needs", "trainingrequirements.png", "අවශ්‍යතාවක් එක් කරන්න", "தேவையை சேர்க்க", "Add a need"),
        tile("#console/cp_trrequirements", "treq.png", "අපේ අවශ්‍යතා", "எமது தேவைகள்", "Our needs"),
        tile("#console/apply", "applytr.png", "පුහුණු වැඩසටහන් අයදුම් කිරීම", "பயிற்சி விண்ணப்பம்", "Apply for a programme"),
        tile("#console/cp_atp", "trlist.png", "වාර්ෂික සැලැස්ම", "ஆண்டுத் திட்டம்", "Annual plan"),
        tile("#console/private", "pts.png", "පෞද්ගලික පාඨමාලාව", "தனியார் படிப்பு", "Private course"),
        tile("#console/letter", "letter.png", "කැඳවීමේ ලිපිය", "அழைப்புக் கடிதம்", "Call letter"),
        tile("#console/signsheet", "selected.png", "අත්සන් පත්‍රය", "கையொப்பப் படிவம்", "Sign sheet"),
      ].join("")),
      board(color, "reports.png", "වාර්තා", "அறிக்கைகள்", "Reports", [
        tile("#console/reports", "antrpl.png", "කාර්යාල වාර්තා", "அலுவலக அறிக்கை", "Office reports"),
        tile("#console/attended", "participatedemps.png", "පුහුණුවලට සහභාගී වූ නිලධාරීන්ගේ නාමලේඛනය", "பயிற்சியில் பங்கேற்ற அதிகாரிகளின் பெயர்ப்பட்டியல்", "Register of officers who attended training"),
        tile("#console/cp_trainingattendance", "participatedemps.png", "පැමිණීම", "வருகை", "Attendance"),
        tile("#console/birthdays", "birthdays.png", "අද දින උපන්දිනය සමරන නිලධාරීන්", "இன்று பிறந்தநாள்", "Birthdays today"),
        tile("#downloads", "download.png", "බාගත කිරීම්", "பதிவிறக்கங்கள்", "Downloads"),
      ].join("")),
    ].join("");
  }
  if (role === "Super User") {
    return [
      board(color, "control.png", "පාලනය", "கட்டுப்பாடு", "Control", [
        tile("#console/cp_downloads", "download.png", "බාගත කිරීම්", "பதிவிறக்கங்கள்", "Downloads"),
        tile("#console/cp_trcenters", "centers.png", "පුහුණු මධ්‍යස්ථාන", "பயிற்சி மையங்கள்", "Training centres"),
        tile("#console/cp_funds", "funds.png", "අරමුදල්", "நிதி மூலங்கள்", "Funds"),
        tile("#console/cp_messeges", "messages.png", "දැනුම්දීම්", "அறிவிப்புகள்", "Notices"),
        tile("#console/cp_food", "food.png", "ආහාර", "உணவு", "Food"),
        tile("#console/cp_foreignschols", "foreignscholarships.png", "විදේශ ශිෂ්‍යත්ව", "உதவித்தொகை", "Foreign scholarships"),
        tile("#console/cp_outsidetrcource", "privatetrainings.png", "බාහිර පුහුණු පාඨමාලා", "வெளிப்புற பயிற்சிப் படிப்புகள்", "External training courses"),
        tile("#console/cp_appliedforiegnscholars", "scholofficers.png", "ශිෂ්‍යත්ව සඳහා අයදුම් කළ නිලධාරීන්", "உதவித்தொகைக்கு விண்ணப்பித்த அதிகாரிகள்", "Officers who applied for scholarships"),
      ].join(""), true),
      board(color, "trainingplan.png", "පුහුණු සැලැස්ම", "பயிற்சி திட்டம்", "Training plan", [
        tile("#console/cp_trrequirements", "trainingrequirements.png", "පුහුණු අවශ්‍යතා", "பயிற்சி தேவைகள்", "Training needs"),
        tile("#console/plan", "preplan.png", "සැලැස්ම සකසන්න", "திட்டம் அமைக்க", "Build the plan"),
        tile("#console/cp_atp", "changeplan.png", "වාර්ෂික සැලැස්ම", "ஆண்டுத் திட்டம்", "Annual plan"),
        tile("#console/apply", "applytr.png", "පුහුණු වැඩසටහන් අයදුම් කිරීම", "பயிற்சி விண்ணப்பம்", "Apply for a programme"),
        tile("#console/provision", "funds.png", "ප්‍රතිපාදන", "ஒதுக்கீடு", "Allocations"),
        tile("#console/provision?tab=move", "budjrept.png", "ප්‍රතිපාදන මාරු කිරීම", "ஒதுக்கீட்டு மாற்றம்", "Allocation transfers"),
        tile("#console/cp_resourcepersons", "resourcepersons.png", "සම්පත් දායකයින්", "வள ஆள்கள்", "Resource persons"),
        tile("#console/cp_outsidetrcource", "privatetrainings.png", "බාහිර පාඨමාලා", "வெளிப்புற படிப்புகள்", "External courses"),
      ].join("")),
      board(color, "conducttraiings.png", "පුහුණු පැවැත්වීම", "பயிற்சி நடத்துதல்", "Conduct training", [
        tile("#console/applications", "applications.png", "අයදුම්පත්", "விண்ணப்பங்கள்", "Applications"),
        tile("#console/attendance", "selected.png", "පුහුණු වැඩමුළු සඳහා තෝරාගත් නිලධාරීන්", "பயிற்சிப் பட்டறைக்குத் தேர்ந்த அதிகாரிகள்", "Officers selected for the workshops"),
        tile("#console/scheduled", "trlist.png", "පැවැත්වීමට නියමිත පුහුණු වැඩසටහන්", "நடத்தப்படவுள்ள பயிற்சிகள்", "Programmes due to be held"),
        tile("#console/revise", "budjrept.png", "සංශෝධිත ඇස්තමේන්තු සැකසීම", "திருத்திய மதிப்பீடு அமைத்தல்", "Prepare a revised estimate"),
        tile("#console/offweb", "form.png", "වෙබ් අඩවිය මගින් කැඳවීම නොකර පවත්වන පුහුණු ඇතුළත් කිරීම හා ඇස්තමේන්තු සැකසීම", "இணையம் வழியாக அழைக்காமல் நடத்தும் பயிற்சியைச் சேர்த்தல் மற்றும் மதிப்பீடு", "Enter a training not called through the website and prepare the estimate"),
        tile("#console/finish", "complete.png", "වැඩසටහන අවසන් කිරීම පියවර-1", "நிகழ்ச்சியை முடித்தல் படி 1", "Finish the programme, step 1"),
        tile("#console/finish2", "complete.png", "වැඩසටහන අවසන් කිරීම පියවර 2", "நிகழ்ச்சியை முடித்தல் படி 2", "Finish the programme, step 2"),
        tile("#console/cp_completedtrainings", "completed.png", "නිම කළ පුහුණු", "முடிந்த பயிற்சிகள்", "Completed"),
        tile("#console/cp_privatetrainings", "pts.png", "බාහිර පාඨමාලා ප්‍රතිපාදන", "வெளிப்புற படிப்பு நிதி", "External course funding"),
        tile("#console/cp_othertrainings", "privatetrainings.png", "වෙනත් කාර්යාලවල පුහුණු", "பிற அலுவலகப் பயிற்சி", "Other offices' programmes"),
        tile("#console/letter", "letter.png", "කැඳවීමේ ලිපිය", "அழைப்புக் கடிதம்", "Call letter"),
        tile("#console/signsheet", "participatedemps.png", "අත්සන් පත්‍රය", "கையொப்பப் படிவம்", "Sign sheet"),
        tile("#console/estimate", "budjrept.png", "ඇස්තමේන්තුව", "மதிப்பீடு", "Cost estimate"),
        tile("#console/modular", "form.png", "මොඩියුලර් සැකසීම", "மட்டு அமைப்பு", "Modular setup"),
        tile("#console/evaluation", "papers.png", "පෙර ඇගයීම සහ පසු ඇගයීම", "முன் மதிப்பீடு மற்றும் பின் மதிப்பீடு", "Pre-evaluation and post-evaluation"),
        tile("#console/messages", "messages.png", "පණිවිඩ", "செய்திகள்", "Messages"),
        tile("#console/reports", "antrpl.png", "වාර්තා", "அறிக்கைகள்", "Reports"),
      ].join("")),
      board(color, "employees.png", "කාර්යමණ්ඩල තොරතුරු", "பணியாளர் விவரங்கள்", "Staff details", [
        tile("#console/cp_staff", "addemployee.png", "කාර්යමණ්ඩල ලේඛනය", "பணியாளர் பதிவு", "Staff register"),
        tile("#console/cp_staff?tab=blacklist", "blacklist.png", "අසාදු ලේඛනය", "தடைப் பட்டியல்", "Blacklist"),
        tile("#console/cp_trainingofficers", "subjectofficers.png", "පුහුණු නිලධාරීන්", "பயிற்சி அதிகாரிகள்", "Training officers"),
        tile("#console/cp_resourcepersons", "resourcepersons.png", "සම්පත් දායකයන්", "வள ஆள்கள்", "Resource persons"),
        tile("#console/panelsign", "participatedemps.png", "අත්සන් ලේඛණය කාර්යමණ්ඩල හා සම්පත්දායක", "கையொப்பப் பட்டியல்", "Staff and resource-person sign sheet"),
        tile("#console/cp_foriegnscholars", "foriegnscholars.png", "විදේශ ශිෂ්‍යත්ව සඳහා සහභාගී වූ නිලධාරීන්", "உதவித்தொகை பெற்ற அதிகாரிகள்", "Scholarship holders"),
        tile("#console/birthdays", "birthdays.png", "අද දින උපන්දිනය සමරන නිලධාරීන්", "இன்று பிறந்தநாள்", "Birthdays today"),
      ].join(""), true),
      reports,
    ].join("");
  }
  return [control, plan, conduct, people, reports].join("");
}

function classicPages() {
  const roles = () => [
    { value: "User", label: L("පරිශීලක", "பயனர்", "User") },
    { value: "Super User", label: L("සුපිරි පරිශීලක", "சூப்பர் பயனர்", "Super User") },
    { value: "Administrator", label: L("පරිපාලක", "நிர்வாகி", "Administrator") },
  ];
  return {
    cp_desigs: {
      title: () => L("තනතුරු", "பதவிகள்", "Designations"),
      add: () => L("තනතුරු ඇතුළත් කරන්න", "பதவியைச் சேர்க்க", "Add a designation"),
      all: () => L("සියළුම තනතුරු", "அனைத்துப் பதவிகள்", "All designations"),
      remove: () => L("මෙම තනතුරු නාමය මකන්නද?", "இந்தப் பதவியை நீக்கவா?", "Delete this designation?"),
      sort: "des_name",
      id: "des_id",
      columns: [{ label: () => L("තනතුරු නාමය", "பதவிப் பெயர்", "Designation name"), key: "des_name" }],
      fields: [{ name: "des_name", label: () => L("තනතුරු නාමය", "பதவிப் பெயர்", "Designation name"), required: true }],
    },
    offices: {
      title: () => L("කාර්යාල", "அலுவலகங்கள்", "Offices"),
      add: () => L("කාර්යාල ඇතුළත් කරන්න", "அலுவலகத்தைச் சேர்க்க", "Add an office"),
      all: () => L("සියලු කාර්යාල", "அனைத்து அலுவலகங்கள்", "All offices"),
      remove: () => L("මෙම කාර්යාලය මකන්නද?", "இந்த அலுவலகத்தை நீக்கவா?", "Delete this office?"),
      sort: "of_name",
      id: "of_id",
      columns: [
        { label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), key: "of_name" },
        { label: () => L("ලිපිනය", "முகவரி", "Address"), key: "of_addr" },
        { label: () => L("දුරකථනය", "தொலைபேசி", "Telephone"), key: "of_tele" },
        { label: () => L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email"), key: "of_email" },
      ],
      fields: [
        { name: "of_name", label: () => L("කාර්යාලයේ නම", "அலுவலகப் பெயர்", "Office name"), required: true },
        { name: "of_headdesig", label: () => L("ආයතන ප්‍රධානියාගේ තනතුර", "தலைவரின் பதவி", "Head of office"), kind: "posts" },
        { name: "of_addr", label: () => L("ලිපිනය", "முகவரி", "Address") },
        { name: "of_tele", label: () => L("දුරකථන අංකය 1", "தொலைபேசி 1", "Telephone 1"), placeholder: "උදා-08122222223" },
        { name: "of_tele2", label: () => L("දුරකථන අංකය 2", "தொலைபேசி 2", "Telephone 2") },
        { name: "of_fax", label: () => L("ෆැක්ස් අංකය", "தொலைநகல்", "Fax") },
        { name: "of_email", label: () => L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email") },
      ],
    },
    cp_login: {
      title: () => L("පරිශීලක ගිණුම්", "பயனர் கணக்குகள்", "User accounts"),
      add: () => L("පරිශීලක ගිණුම් ඇතුළත් කරන්න", "கணக்கைச் சேர்க்க", "Add a user account"),
      all: () => L("සියලු පරිශීලක ගිණුම්", "அனைத்து கணக்குகள்", "All user accounts"),
      remove: () => L("මෙම පරිශීලක ගිණුම මකන්නද?", "இந்தக் கணக்கை நீக்கவா?", "Delete this user account?"),
      sort: "lg_office",
      id: "lg_id",
      columns: [
        { label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), key: "lg_office" },
        { label: () => L("පරිශීලක නම", "பயனர் பெயர்", "Username"), key: "lg_uname" },
      ],
      fields: [
        { name: "lg_office", label: () => L("කාර්යාලයේ නම", "அலுவலகப் பெயர்", "Office name"), kind: "offices", required: true },
        { name: "lg_uname", label: () => L("පරිශීලක නම", "பயனர் பெயர்", "Username"), required: true },
        { name: "lg_pwd", label: () => L("මුර පදය", "கடவுச்சொல்", "Password"), kind: "password" },
        { name: "lg_type", label: () => L("පරිශීලක ගිණුම් වර්ගය", "கணக்கு வகை", "Account type"), kind: "roles", required: true },
      ],
      roles,
    },
    cp_trainings: namePage("cp_trainings", "tr", "පුහුණු වැඩසටහන්", "பயிற்சி பெயர்கள்", "Programme names", "පුහුණු වැඩසටහන", "பயிற்சி பெயர்", "Programme name"),
    cp_trfields: namePage("cp_trfields", "tf", "විෂය ක්ෂේත්‍ර", "பாடத் துறைகள்", "Subject fields", "විෂය ක්ෂේත්‍රය", "பாடத் துறை", "Subject field"),
    cp_services: namePage("cp_services", "ser", "සේවා", "சேவைகள்", "Services", "සේවා නාමය", "சேவையின் பெயர்", "Service name"),
    cp_trcenters: namePage("cp_trcenters", "trc", "පුහුණු මධ්‍යස්ථාන", "பயிற்சி மையங்கள்", "Training centres", "පුහුණු මධ්‍යස්ථානය", "பயிற்சி மையம்", "Training centre"),
    cp_funds: namePage("cp_funds", "fnd", "මූල්‍ය ප්‍රභව", "நிதி மூலங்கள்", "Funding sources", "මූල්‍ය ප්‍රභවය", "நிதி மூலம்", "Funding source"),
    cp_food: {
      title: () => L("ආහාර පාන", "உணவு", "Food"),
      add: () => L("ආහාර පාන ඇතුළත් කරන්න", "உணவைச் சேர்க்க", "Add food or a drink"),
      all: () => L("සියලුම ආහාර පාන", "அனைத்து உணவு", "All food and drinks"),
      remove: () => L("මෙම ආහාරය මකන්නද?", "இதை நீக்கவா?", "Delete this item?"),
      sort: "fd_name",
      id: "fd_id",
      columns: [
        { label: () => L("ආහාර වර්ගය", "உணவு வகை", "Item"), key: "fd_name" },
        { label: () => L("මිල (රුපියල්)", "விலை", "Price (Rs.)"), key: "fd_price" },
      ],
      fields: [
        { name: "fd_name", label: () => L("ආහාර වර්ගය", "உணவு வகை", "Item"), required: true },
        { name: "fd_price", label: () => L("මිල (රුපියල්)", "விலை", "Price (Rs.)"), kind: "number", required: true, placeholder: "උදා:- 22.78" },
      ],
    },
    cp_treqperiod: {
      title: () => L("කාල සීමාව", "கால வரம்பு", "Needs period"),
      add: () => L("කාල පරාසය ඇතුළත් කරන්න", "கால வரம்பை அமைக்க", "Set the application period"),
      all: () => "",
      remove: () => "",
      single: true,
      sort: "trq_sdate",
      id: "trq_id",
      columns: [],
      fields: [
        { name: "trq_sdate", label: () => L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"), kind: "date", required: true },
        { name: "trq_edate", label: () => L("අවසන් දිනය", "இறுதி திகதி", "End date"), kind: "date", required: true },
      ],
    },
    cp_slideshowimgs: {
      title: () => L("මුල් පිටු ඡායාරූප", "முகப்பு படங்கள்", "Home photos"),
      add: () => L("මුල් පිටුව සඳහා ඡායාරූප ඇතුළත් කරන්න", "படத்தைச் சேர்க்க", "Add a home photograph"),
      all: () => L("සියලුම ඡායාරූප", "அனைத்துப் படங்கள்", "All photographs"),
      remove: () => L("මෙම ඡායාරූපය මකන්නද?", "இந்தப் படத்தை நீக்கவா?", "Delete this photograph?"),
      sort: "slp_id",
      sortDesc: true,
      id: "slp_id",
      columns: [
        { label: () => L("ඡායාරූපය", "படம்", "Photograph"), key: "slp_photo", image: true },
        { label: () => L("ඡායාරූපය පෙන්වන්නේ නම්", "காட்ட வேண்டுமா", "Show on home"), key: "slp_status" },
      ],
      fields: [
        { name: "slp_photo", label: () => L("ඡායාරූපය", "படம்", "Photograph"), kind: "file", folder: "slideshow", required: true, hint: () => L("jpg හෝ png. උපරිම 1 MB. ප්‍රමාණය 940px × 318px.", "jpg அல்லது png. அதிகபட்சம் 1 MB.", "jpg or png. Maximum 1 MB. Size 940px × 318px.") },
        { name: "slp_status", label: () => L("ඡායාරූපය පෙන්වන්නේ නම්", "காட்ட வேண்டுமா", "Show on home"), kind: "yesno" },
      ],
    },
    cp_messeges: {
      title: () => L("දැනුම්දීම්", "அறிவிப்புகள்", "Notices"),
      add: () => L("නිවේදන ඇතුළත් කරන්න", "அறிவிப்பைச் சேர்க்க", "Add a notice"),
      all: () => L("සියලුම නිවේදන", "அனைத்து அறிவிப்புகள்", "All notices"),
      remove: () => L("මෙම නිවේදනය මකන්නද?", "இந்த அறிவிப்பை நீக்கவா?", "Delete this notice?"),
      sort: "msg_date",
      sortDesc: true,
      id: "msg_id",
      columns: [
        { label: () => L("ඇතුළත් කළ දිනය", "திகதி", "Date"), key: "msg_date" },
        { label: () => L("නිවේදනය", "அறிவிப்பு", "Notice"), key: "msg_message" },
        { label: () => L("පළකරන්නේ නම්", "வெளியிடவா", "Published"), key: "msg_status" },
      ],
      fields: [
        { name: "msg_date", label: () => L("ඇතුළත් කරන දිනය", "திகதி", "Date"), kind: "date", today: true, required: true },
        { name: "msg_message", label: () => L("නිවේදනය", "அறிவிப்பு", "Notice"), kind: "area", required: true },
        { name: "msg_status", label: () => L("නිවේදනය පළකරන්නේ නම්", "வெளியிடவா", "Publish"), kind: "yesno" },
      ],
    },
    cp_downloads: {
      title: () => L("බාගත කිරීම්", "பதிவிறக்கங்கள்", "Downloads"),
      add: () => L("බාගතකිරීම් ඇතුළත් කරන්න", "பதிவிறக்கத்தைச் சேர்க்க", "Add a download"),
      all: () => L("සියලුම බාගතකිරීම්", "அனைத்து பதிவிறக்கங்கள்", "All downloads"),
      remove: () => L("මෙම ගොනුව මකන්නද?", "இந்தக் கோப்பை நீக்கவா?", "Delete this download?"),
      sort: "dwn_date",
      sortDesc: true,
      id: "dwn_id",
      columns: [
        { label: () => L("දිනය", "திகதி", "Date"), key: "dwn_date" },
        { label: () => L("ලිපිගොනුව 1", "கோப்பு 1", "File 1"), key: "dwn_file" },
        { label: () => L("වර්ගය", "வகை", "Type"), key: "dwn_type" },
        { label: () => L("නම", "பெயர்", "Name"), key: "dwn_name" },
        { label: () => L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"), key: "dwn_training" },
        { label: () => L("විස්තරය", "விவரம்", "Details"), key: "dwn_des" },
      ],
      fields: [
        { name: "dwn_date", label: () => L("දිනය", "திகதி", "Date"), kind: "date", today: true, required: true },
        { name: "dwn_type", label: () => L("වර්ගය", "வகை", "Type"), kind: "downloads", required: true },
        { name: "dwn_name", label: () => L("ලිපිගොනුවේ නම", "கோப்பின் பெயர்", "File name"), required: true },
        { name: "dwn_training", label: () => L("අදාළ පුහුණු වැඩසටහන", "தொடர்புடைய பயிற்சி", "Related programme") },
        { name: "dwn_file", label: () => L("ලිපිගොනුව 1", "கோப்பு 1", "File 1"), kind: "file", folder: "uploads" },
        { name: "dwn_file2", label: () => L("ලිපිගොනුව 2", "கோப்பு 2", "File 2"), kind: "file", folder: "uploads" },
        { name: "dwn_file3", label: () => L("ලිපිගොනුව 3", "கோப்பு 3", "File 3"), kind: "file", folder: "uploads" },
        { name: "dwn_file4", label: () => L("ලිපිගොනුව 4", "கோப்பு 4", "File 4"), kind: "file", folder: "uploads" },
        { name: "dwn_des", label: () => L("විස්තරය", "விவரம்", "Details"), kind: "area" },
      ],
    },
    cp_usercomments: {
      title: () => L("යෝජනා", "ஆலோசனைகள்", "Suggestions"),
      add: () => "",
      all: () => L("සියලුම අදහස් හා යෝජනා", "அனைத்து ஆலோசனைகள்", "All suggestions"),
      remove: () => L("මෙම යෝජනාව මකන්නද?", "இந்த ஆலோசனையை நீக்கவா?", "Delete this suggestion?"),
      listOnly: true,
      sort: "uc_date",
      sortDesc: true,
      id: "uc_id",
      columns: [
        { label: () => L("නම", "பெயர்", "Name"), key: "uc_name" },
        { label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), key: "uc_office" },
        { label: () => L("දුරකථන අංකය", "தொலைபேசி", "Telephone"), key: "uc_tele" },
        { label: () => L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email"), key: "uc_email" },
        { label: () => L("අදහස් / යෝජනාව", "ஆலோசனை", "Suggestion"), key: "uc_comment" },
        { label: () => L("යැවූ දිනය", "திகதி", "Date"), key: "uc_date" },
        { label: () => L("වේලාව", "நேரம்", "Time"), key: "uc_time" },
      ],
      fields: [],
    },
    cp_foreignschols: {
      title: () => L("විදේශ ශිෂ්‍යත්ව", "உதவித்தொகை", "Scholarships"),
      add: () => L("විදේශ ශිෂ්‍යත්ව ඇතුළත් කරන්න", "உதவித்தொகையைச் சேர்க்க", "Add a scholarship"),
      all: () => L("සියලුම විදේශ ශිෂ්‍යත්ව", "அனைத்து உதவித்தொகை", "All scholarships"),
      remove: () => L("මෙම ශිෂ්‍යත්වය මකන්නද?", "இதை நீக்கவா?", "Delete this scholarship?"),
      sort: "fs_closingdate",
      sortDesc: true,
      id: "fs_id",
      columns: [
        { label: () => L("ශිෂ්‍යත්වය", "உதவித்தொகை", "Scholarship"), key: "fs_name" },
        { label: () => L("අයදුම් කළ රට", "நாடு", "Country"), key: "fs_country" },
        { label: () => L("අවසන් දිනය", "இறுதி திகதி", "Closing date"), key: "fs_closingdate" },
        { label: () => L("කෙටි විස්තරය", "குறிப்பு", "Note"), key: "fs_comment" },
      ],
      fields: [
        { name: "fs_file", label: () => L("ලිපි ගොනුව", "கோப்பு", "File"), kind: "file", folder: "foriegnschols", required: true },
        { name: "fs_name", label: () => L("විදේශ ශිෂ්‍යත්වයේ නම", "உதவித்தொகையின் பெயர்", "Scholarship name"), required: true },
        { name: "fs_country", label: () => L("අයදුම් කළ රට", "நாடு", "Country"), required: true },
        { name: "fs_closingdate", label: () => L("අවසන් වන දිනය", "இறுதி திகதி", "Closing date"), kind: "date", required: true },
        { name: "fs_comment", label: () => L("කෙටි විස්තරය", "குறிப்பு", "Short note"), kind: "area" },
      ],
    },
    cp_foriegnscholars: {
      title: () => L("විදේශ ශිෂ්‍යත්ව සඳහා සහභාගී වූ නිලධාරීන්", "உதவித்தொகை பெற்ற அதிகாரிகள்", "Officers who joined a foreign scholarship"),
      add: () => L("විදේශ ශිෂ්‍යත්ව නිලධාරියෙක් ඇතුළත් කරන්න", "அதிகாரியைச் சேர்க்க", "Add an officer"),
      all: () => L("සියලුම විදේශ ශිෂ්‍යත්ව නිලධාරීන්", "அனைத்து அதிகாரிகள்", "All scholarship officers"),
      remove: () => L("මෙම නිලධාරියා මකන්නද?", "இந்த அதிகாரியை நீக்கவா?", "Delete this officer?"),
      sort: "sch_depaturedate",
      sortDesc: true,
      id: "sch_id",
      columns: [
        { label: () => L("හැඳුනුම්පත", "அடையாள எண்", "National ID"), key: "sch_nid" },
        { label: () => L("ශිෂ්‍යත්වය", "உதவித்தொகை", "Scholarship"), key: "sch_name" },
        { label: () => L("රට", "நாடு", "Country"), key: "sch_country" },
        { label: () => L("පිටත් වූ දිනය", "புறப்பாடு", "Departure"), key: "sch_depaturedate" },
        { label: () => L("ආපසු පැමිණි දිනය", "திரும்புதல்", "Return"), key: "sch_arrivedate" },
        { label: () => L("කාලය", "காலம்", "Duration"), key: "sch_duration" },
        { label: () => L("වියදම", "செலவு", "Amount"), key: "sch_spendamnt" },
        { label: () => L("විස්තරය", "குறிப்பு", "Notes"), key: "sch_comment" },
      ],
      fields: [
        { name: "sch_nid", label: () => L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"), required: true },
        { name: "sch_name", label: () => L("ශිෂ්‍යත්වයේ නම", "உதவித்தொகையின் பெயர்", "Scholarship"), required: true },
        { name: "sch_country", label: () => L("රට", "நாடு", "Country"), required: true },
        { name: "sch_depaturedate", label: () => L("පිටත් වූ දිනය", "புறப்பாடு", "Departure"), kind: "date" },
        { name: "sch_arrivedate", label: () => L("ආපසු පැමිණි දිනය", "திரும்புதல்", "Return"), kind: "date" },
        { name: "sch_duration", label: () => L("කාලය", "காலம்", "Duration") },
        { name: "sch_spendamnt", label: () => L("වියදම", "செலவு", "Amount spent") },
        { name: "sch_comment", label: () => L("විස්තරය", "குறிப்பு", "Notes"), kind: "area" },
      ],
    },
    cp_outsidetrcource: {
      title: () => L("බාහිර පාඨමාලා", "வெளிப்புற படிப்புகள்", "External courses"),
      add: () => L("බාහිර ආයතන මගින් පවත්වන පාඨමාලා ඇතුළත් කරන්න", "வெளிப்புற படிப்பைச் சேர்க்க", "Add an external course"),
      all: () => L("බාහිර ආයතන මගින් පවත්වන සියලුම පාඨමාලා", "அனைத்து வெளிப்புற படிப்புகள்", "All external courses"),
      remove: () => L("මෙම පාඨමාලාව මකන්නද?", "இந்தப் படிப்பை நீக்கவா?", "Delete this course?"),
      sort: "ot_closingdate",
      sortDesc: true,
      id: "ot_id",
      columns: [
        { label: () => L("පාඨමාලාව", "படிப்பு", "Course"), key: "ot_training" },
        { label: () => L("පාඨමාලා ආයතනය", "நிறுவனம்", "Institute"), key: "ot_institute" },
        { label: () => L("අවසන් දිනය", "இறுதி திகதி", "Closing date"), key: "ot_closingdate" },
        { label: () => L("කෙටි විස්තරය", "குறிப்பு", "Note"), key: "ot_comnt" },
      ],
      fields: [
        { name: "ot_file", label: () => L("ලිපිගොනුව", "கோப்பு", "File"), kind: "file", folder: "outsidetrainings", required: true },
        { name: "ot_training", label: () => L("පාඨමාලාවේ නම", "படிப்பின் பெயர்", "Course name"), required: true },
        { name: "ot_institute", label: () => L("පාඨමාලා ආයතනය", "நிறுவனம்", "Institute"), required: true },
        { name: "ot_closingdate", label: () => L("ආරම්භ වන / අවසන් දිනය", "திகதி", "Date"), kind: "date", required: true },
        { name: "ot_fees", label: () => L("අයදුම් කාලසීමාව / ගාස්තු", "கட்டணம்", "Fees or period") },
        { name: "ot_comnt", label: () => L("කෙටි විස්තරය", "குறிப்பு", "Short note"), kind: "area" },
      ],
    },
    cp_appliedforiegnscholars: {
      title: () => L("ශිෂ්‍යත්ව අයදුම්", "உதவித்தொகை விண்ணப்பங்கள்", "Scholarship applicants"),
      add: () => L("විදේශ ශිෂ්‍යත්ව සඳහා අයදුම් කළ නිලධාරීන් ඇතුළත් කරන්න", "விண்ணப்பத்தைச் சேர்க்க", "Add a scholarship applicant"),
      all: () => L("සියලුම අයදුම් කළ නිලධාරීන්", "அனைத்து விண்ணப்பங்கள்", "All applicants"),
      remove: () => L("මෙම අයදුම්පත මකන්නද?", "இந்த விண்ணப்பத்தை நீக்கவா?", "Delete this application?"),
      sort: "apsch_applydate",
      sortDesc: true,
      id: "apsch_id",
      columns: [
        { label: () => L("නිලධාරියා", "அதிகாரி", "Officer"), key: "apsch_nid" },
        { label: () => L("ශිෂ්‍යත්වය", "உதவித்தொகை", "Scholarship"), key: "apsch_name" },
        { label: () => L("රට", "நாடு", "Country"), key: "apsch_country" },
        { label: () => L("අයදුම් දිනය", "விண்ணப்ப திகதி", "Applied"), key: "apsch_applydate" },
        { label: () => L("පිටත්වන දිනය", "புறப்படும் திகதி", "Departure"), key: "apsch_depaturedate" },
        { label: () => L("කාල සීමාව", "காலம்", "Duration"), key: "apsch_duration" },
      ],
      fields: [
        { name: "apsch_nid", label: () => L("නිලධාරියාගේ නම / හැඳුනුම්පත", "அதிகாரியின் பெயர்", "Officer name or ID"), required: true },
        { name: "apsch_name", label: () => L("ශිෂ්‍යත්ව වැඩසටහනේ නම", "உதவித்தொகை பெயர்", "Scholarship name"), required: true },
        { name: "apsch_country", label: () => L("සමත්වූ රට", "நாடு", "Country"), required: true },
        { name: "apsch_applydate", label: () => L("අයදුම් කළ දිනය", "விண்ணப்ப திகதி", "Application date"), kind: "date", required: true },
        { name: "apsch_depaturedate", label: () => L("පිටත්වන දිනය", "புறப்படும் திகதி", "Departure date"), kind: "date" },
        { name: "apsch_duration", label: () => L("කාල සීමාව", "காலம்", "Duration") },
        { name: "apsch_comment", label: () => L("කෙටි විස්තරය", "குறிப்பு", "Short note"), kind: "area" },
      ],
    },
    cp_privatetrainings: {
      title: () => L("බාහිර පුහුණු පාඨමාලා සඳහා ප්‍රතිපාදන ලබා දීම", "வெளிப்புற படிப்புகளுக்கான நிதி", "Funding for external courses"),
      add: () => L("අයදුම්පතක් ඇතුළත් කරන්න", "விண்ணப்பத்தைச் சேர்க்க", "Add an application"),
      all: () => L("සියලුම අයදුම්", "அனைத்து விண்ணப்பங்கள்", "All applications"),
      remove: () => L("මෙම අයදුම්පත මකන්නද?", "இந்த விண்ணப்பத்தை நீக்கவா?", "Delete this application?"),
      sort: "pvtt_applydate",
      sortDesc: true,
      id: "pvtt_id",
      columns: [
        { label: () => L("හැඳුනුම්පත", "அடையாள எண்", "National ID"), key: "pvtt_nid" },
        { label: () => L("පාඨමාලාව", "படிப்பு", "Course"), key: "pvtt_cname" },
        { label: () => L("ආයතනය", "நிறுவனம்", "Institute"), key: "pvtt_cinstitute" },
        { label: () => L("ගාස්තුව", "கட்டணம்", "Fees"), key: "pvtt_fees" },
        { label: () => L("ආරම්භය", "தொடக்கம்", "Starts"), key: "pvtt_cstartdate" },
        { label: () => L("අනුමතද", "அனுமதி", "Approved"), key: "pvtt_approved" },
        { label: () => L("සහතිකය", "சான்றிதழ்", "Certificate"), key: "pvtt_certificatesubmit" },
      ],
      fields: [
        { name: "pvtt_nid", label: () => L("නිලධාරියාගේ හැඳුනුම්පත", "அதிகாரி அடையாள எண்", "Officer national ID"), required: true },
        { name: "pvtt_cname", label: () => L("පාඨමාලාවේ නම", "படிப்பின் பெயர்", "Course name"), required: true },
        { name: "pvtt_cinstitute", label: () => L("ආයතනය", "நிறுவனம்", "Institute"), required: true },
        { name: "pvtt_cstartdate", label: () => L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"), kind: "date" },
        { name: "pvtt_cenddate", label: () => L("අවසන් දිනය", "முடியும் திகதி", "End date"), kind: "date" },
        { name: "pvtt_cduration", label: () => L("කාල සීමාව", "காலம்", "Duration") },
        { name: "pvtt_fees", label: () => L("ගාස්තුව", "கட்டணம்", "Fees") },
        { name: "pvtt_relevant", label: () => L("අදාළ වන්නේ ඇයි", "ஏன் தேவை", "Why it is relevant"), kind: "area" },
        { name: "pvtt_approved", label: () => L("අනුමතද", "அனுமதி", "Approved"), kind: "yesno" },
        { name: "pvtt_chequeno", label: () => L("චෙක්පත් අංකය", "காசோலை எண்", "Cheque number") },
        { name: "pvtt_amount", label: () => L("ගෙවූ මුදල", "செலுத்திய தொகை", "Amount paid") },
        { name: "pvtt_comment", label: () => L("වෙනත් විස්තර", "குறிப்பு", "Notes"), kind: "area" },
        { name: "pvtt_certificatesubmit", label: () => L("සහතිකය ලැබුණාද", "சான்றிதழ் கிடைத்ததா", "Certificate received"), kind: "yesno" },
      ],
    },
    cp_othertrainings: {
      title: () => L("වෙනත් කාර්යාල/දෙපාර්තමේන්තු මගින් පැවැත්වූ පුහුණු වැඩසටහන්", "பிற அலுவலகப் பயிற்சிகள்", "Programmes run by other offices"),
      add: () => L("වැඩසටහනක් ඇතුළත් කරන්න", "பயிற்சியைச் சேர்க்க", "Add a programme"),
      all: () => L("සියලුම වැඩසටහන්", "அனைத்துப் பயிற்சிகள்", "All programmes"),
      remove: () => L("මෙම වැඩසටහන මකන්නද?", "இதை நீக்கவா?", "Delete this programme?"),
      sort: "otn_date",
      sortDesc: true,
      id: "otn_id",
      columns: [
        { label: () => L("නිලධාරියා", "அதிகாரி", "Officer"), key: "otn_officer" },
        { label: () => L("වැඩසටහන", "பயிற்சி", "Programme"), key: "otn_programme" },
        { label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), key: "otn_office" },
        { label: () => L("දින ගණන", "நாட்கள்", "Days"), key: "otn_days" },
        { label: () => L("විස්තර", "விவரம்", "Details"), key: "otn_details" },
      ],
      fields: [
        { name: "otn_officer", label: () => L("නිලධාරියාගේ නම / හැඳුනුම්පත", "அதிகாரியின் பெயர்", "Officer name or ID"), required: true },
        { name: "otn_programme", label: () => L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"), required: true },
        { name: "otn_date", label: () => L("පැවැත්වූ දිනය", "நடத்திய திகதி", "Date held"), kind: "date", required: true },
        { name: "otn_office", label: () => L("පැවැත්වූ කාර්යාලය", "நடத்திய அலுவலகம்", "Office that conducted it"), required: true },
        { name: "otn_days", label: () => L("දින ගණන", "நாட்கள்", "Number of days") },
        { name: "otn_details", label: () => L("වෙනත් විස්තර", "பிற விவரம்", "Other details"), kind: "area" },
      ],
    },
    trdate: {
      title: () => L("අවසන් දිනය", "கடைசி நாள்", "Closing date"),
      add: () => L("පුහුණු අවශ්‍යතා ඇතුළත් කිරීමේ අවසන් දිනය", "தேவை சேர்க்கும் கடைசி நாள்", "Last day to enter training needs"),
      all: () => "",
      remove: () => "",
      single: true,
      sort: "trd_date",
      id: "trd_id",
      columns: [],
      fields: [
        { name: "trd_date", label: () => L("මෙම දිනය යන විට අවශ්‍යතා ඇතුළත් කිරීම අහෝසි වේ", "இந்த திகதிக்குப் பின் சேர்க்க முடியாது", "Needs close after this date"), kind: "date", required: true },
      ],
    },
    cp_trrequirements: {
      title: () => L("පුහුණු අවශ්‍යතා", "பயிற்சி தேவைகள்", "Training needs"),
      add: () => L("පුහුණු අවශ්‍යතා ඇතුළත් කරන්න", "தேவையைச் சேர்க்க", "Enter a training need"),
      all: () => L("සියලුම පුහුණු අවශ්‍යතා", "அனைத்து தேவைகள்", "All training needs"),
      remove: () => L("මෙම අවශ්‍යතාව මකන්නද?", "இந்தத் தேவையை நீக்கவா?", "Delete this need?"),
      sheet: true,
      sort: "req_adddate",
      sortDesc: true,
      id: "req_id",
      columns: [
        { label: () => L("දිනය", "திகதி", "Date"), key: "req_adddate" },
        { label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), key: "req_addoffice" },
        { label: () => L("තනතුර", "பதவி", "Designation"), key: "req_post" },
        { label: () => L("පුහුණු අවශ්‍යතාව", "பயிற்சி தேவை", "Training need"), key: "req_training" },
        { label: () => L("වෙනත්", "மற்றவை", "Other"), key: "req_comments" },
        { label: () => L("සැලැස්මට ඇතුළත්ද", "திட்டத்தில் உள்ளதா", "In the plan"), key: "req_isadd" },
      ],
      fields: [
        { name: "req_addoffice", label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), kind: "myoffice", required: true },
        { name: "req_post", label: () => L("තනතුර", "பதவி", "Designation"), kind: "posts", required: true },
        { name: "req_training", label: () => L("පුහුණු අවශ්‍යතාව", "பயிற்சி தேவை", "Training need"), kind: "programmes" },
        { name: "req_other", label: () => L("වෙනත් පුහුණු අවශ්‍යතාව", "வேறு பயிற்சி தேவை", "Other training need") },
        { name: "req_noofemps", label: () => L("නිලධාරීන් ගණන", "அதிகாரிகள் எண்ணிக்கை", "Number of officers"), kind: "number", required: true },
        { name: "req_comments", label: () => L("වෙනත්", "மற்றவை", "Other"), kind: "area" },
      ],
    },
    cp_resourcepersons: {
      title: () => L("සම්පත්දායකයින්", "வள ஆள்கள்", "Resource persons"),
      add: () => L("සම්පත්දායකයෙකු ඇතුළත් කරන්න", "வள ஆளைச் சேர்க்க", "Add a resource person"),
      all: () => L("සියලුම සම්පත්දායකයින්", "அனைத்து வள ஆள்கள்", "All resource persons"),
      remove: () => L("මෙම සම්පත්දායකයා මකන්නද?", "இவரை நீக்கவா?", "Delete this resource person?"),
      sheet: true,
      search: true,
      sort: "rp_name",
      id: "rp_id",
      columns: [
        { label: () => L("හැඳුනුම්පත", "அடையாள எண்", "National ID"), key: "rp_nid" },
        { label: () => L("නම", "பெயர்", "Name"), key: "rp_name" },
        { label: () => L("තනතුර", "பதவி", "Designation"), key: "rp_desig" },
        { label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), key: "rp_office" },
        { label: () => L("දුරකථනය", "தொலைபேசி", "Mobile"), key: "rp_mobile" },
        { label: () => L("WhatsApp", "WhatsApp", "WhatsApp"), key: "rp_whatsapp" },
        { label: () => L("ඡායාරූපය", "புகைப்படம்", "Photo"), key: "rp_photo", image: true },
        { label: () => L("CV", "CV", "CV"), key: "rp_cv", file: true },
        { label: () => L("සහතිකය", "சான்றிதழ்", "Certificate"), key: "rp_certificate", file: true },
        { label: () => L("යාවත්කාල කේතය", "புதுப்பிப்பு குறியீடு", "Update code"), key: "rp_code" },
      ],
      fields: resourceFieldDefs(),
      adminChange: true,
    },
  };
}

function resourceFieldDefs() {
  const subjects = (n) => ({ name: "rp_fld" + n, label: () => L("විෂය ක්ෂේත්‍රය " + n, "பாடத் துறை " + n, "Subject field " + n), kind: "subjects" });
  return [
    { name: "rp_nid", label: () => L("ජාතික හැඳුනුම්පත", "அடையாள எண்", "National ID"), required: true },
    { name: "rp_name", label: () => L("සම්පූර්ණ නම", "முழுப் பெயர்", "Full name"), required: true },
    { name: "rp_dob", label: () => L("උපන් දිනය", "பிறந்த திகதி", "Date of birth"), kind: "date" },
    { name: "rp_gender", label: () => L("ස්ත්‍රී / පුරුෂ", "பாலினம்", "Gender"), kind: "gender" },
    { name: "rp_desig", label: () => L("තනතුර", "பதவி", "Designation"), kind: "posts" },
    { name: "rp_office", label: () => L("කාර්යාලය", "அலுவலகம்", "Office") },
    { name: "rp_mobile", label: () => L("ජංගම දුරකථනය", "கைபேசி", "Mobile"), required: true },
    { name: "rp_whatsapp", label: () => L("WhatsApp අංකය", "WhatsApp எண்", "WhatsApp number") },
    { name: "rp_offtele", label: () => L("කාර්යාල දුරකථනය", "அலுவலக தொலைபேசி", "Office telephone") },
    { name: "rp_hometele", label: () => L("නිවසේ දුරකථනය", "வீட்டுத் தொலைபேசி", "Home telephone") },
    { name: "rp_email", label: () => L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email") },
    { name: "rp_phd", label: () => L("ආචාර්ය උපාධිය", "முனைவர் பட்டம்", "Doctorate") },
    { name: "rp_msc", label: () => L("පශ්චාත් උපාධිය", "முதுகலை", "Master degree") },
    { name: "rp_degree", label: () => L("උපාධිය", "பட்டம்", "Degree") },
    { name: "rp_al", label: () => L("උසස් පෙළ", "உயர்தரம்", "Advanced level") },
    { name: "rp_profq", label: () => L("වෘත්තීය සුදුසුකම්", "தொழில் தகுதி", "Professional qualifications"), kind: "area" },
    { name: "rpexp", label: () => L("පළපුරුද්ද", "அனுபவம்", "Experience"), kind: "area" },
    subjects(1), subjects(2), subjects(3), subjects(4), subjects(5),
    { name: "rp_morefields", label: () => L("තවත් විෂය ක්ෂේත්‍ර (පේළියකට එකක්)", "மேலும் பாடத் துறைகள்", "More subject fields, one on each line"), kind: "area" },
    { name: "rp_photo", label: () => L("ඡායාරූපය", "புகைப்படம்", "Photograph"), kind: "file", folder: "resource", accept: "image/*" },
    { name: "rp_cv", label: () => L("CV (PDF)", "CV (PDF)", "CV (PDF)"), kind: "file", folder: "resource", accept: ".pdf" },
    { name: "rp_certificate", label: () => L("සහතික (PDF)", "சான்றிதழ் (PDF)", "Certificate (PDF)"), kind: "file", folder: "resource", accept: ".pdf" },
    { name: "rp_code", label: () => L("යාවත්කාල කේතය", "புதுப்பிப்பு குறியீடு", "Update code"), kind: "locked" },
  ];
}

function namePage(table, prefix, si, ta, en, fieldSi, fieldTa, fieldEn) {
  const id = prefix + "_id";
  const name = prefix + "_name";
  return {
    title: () => L(si, ta, en),
    add: () => L(si + " ඇතුළත් කරන්න", ta + " சேர்க்க", "Add " + en.toLowerCase()),
    all: () => L("සියලුම " + si, "அனைத்து " + ta, "All " + en.toLowerCase()),
    remove: () => L("මෙය මකන්නද?", "இதை நீக்கவா?", "Delete this record?"),
    sort: name,
    id,
    columns: [{ label: () => L(fieldSi, fieldTa, fieldEn), key: name }],
    fields: [{ name, label: () => L(fieldSi, fieldTa, fieldEn), required: true }],
  };
}

function classicChoices(field, value) {
  if (field.kind === "roles") return classicPages().cp_login.roles();
  if (field.kind === "offices") return (state.options.offices || []).filter((item) => String(item.of_name || "").trim()).map((item) => ({ value: item.of_name, label: item.of_name }));
  if (field.kind === "posts") return [{ value: "", label: "—" }, ...(state.options.designations || []).map((item) => ({ value: item.des_name, label: item.des_name }))];
  if (field.kind === "yesno") return [{ value: "ඔව්", label: L("ඔව්", "ஆம்", "Yes") }, { value: "නැත", label: L("නැත", "இல்லை", "No") }];
  if (field.kind === "downloads") return Object.entries(state.options.downloadTypes || {}).map(([val, label]) => ({ value: val, label: state.lang === "en" ? label : val }));
  if (field.kind === "programmes") return [{ value: "", label: "—" }, ...(state.options.programmes || []).map((item) => ({ value: item.tr_name, label: item.tr_name }))];
  if (field.kind === "subjects") return [{ value: "", label: "—" }, ...(state.options.fields || []).map((item) => ({ value: item.tf_name, label: item.tf_name }))];
  if (field.kind === "funds") return [{ value: "", label: "—" }, ...(state.options.funds || []).map((item) => ({ value: item.fnd_name, label: item.fnd_name }))];
  if (field.kind === "gender") return [{ value: "", label: "—" }, { value: "පුරුෂ", label: L("පුරුෂ", "ஆண்", "Male") }, { value: "ස්ත්‍රී", label: L("ස්ත්‍රී", "பெண்", "Female") }];
  if (field.kind === "services") return [{ value: "", label: "—" }, ...(state.options.services || []).map((item) => ({ value: item.ser_name, label: item.ser_name }))];
  if (field.kind === "class") return [{ value: "", label: "—" }, { value: "I", label: "I" }, { value: "II", label: "II" }, { value: "III", label: "III" }, { value: "සුපිරි", label: L("සුපිරි", "சிறப்பு", "Supra") }];
  if (field.kind === "blacklist") return [{ value: "", label: L("නැත", "இல்லை", "No") }, { value: "Yes", label: L("ඔව්", "ஆம்", "Yes") }];
  if (field.kind === "centres") return [{ value: "", label: "—" }, ...(state.options.centres || []).map((item) => ({ value: item.trc_name, label: item.trc_name })).filter((item) => String(item.value || "").trim())];
  if (field.kind === "plantype") return [
    { value: "MDTU පුහුණුවකි", label: L("MDTU පුහුණුවකි", "MDTU பயிற்சி", "MDTU programme") },
    { value: "ඵලදායිතා පුහුණුවකි", label: L("ඵලදායිතා පුහුණුවකි", "உற்பத்தித் திறன்", "Productivity programme") },
    { value: "විශේෂ පුහුණු", label: L("විශේෂ පුහුණු", "சிறப்புப் பயிற்சி", "Special training") },
    { value: "දෙපාර්තමේන්තු පුහුණු", label: L("දෙපාර්තමේන්තු පුහුණු", "திணைக்களப் பயிற்சி", "Departmental training") },
    { value: "භාෂා පුහුණු", label: L("භාෂා පුහුණු", "மொழிப் பயிற்சி", "Language training") },
    { value: "OBT", label: "OBT" },
    { value: "උපදේශණය හා මත්ද්‍රවය නිවාරණ", label: L("උපදේශණය හා මත්ද්‍රවය නිවාරණ", "ஆலோசனை மற்றும் போதைத் தடுப்பு", "Counselling and drug prevention") },
    { value: "රැස්වීම්", label: L("රැස්වීම්", "கூட்டங்கள்", "Meetings") },
    { value: "උපදේශන කමිටුව", label: L("උපදේශන කමිටුව", "ஆலோசனைக் குழு", "Advisory committee") },
    { value: "ප්‍රගති සමාලෝචන", label: L("ප්‍රගති සමාලෝචන", "முன்னேற்ற மதிப்பாய்வு", "Progress review") },
    { value: "වෙනත්", label: L("වෙනත්", "மற்றவை", "Other") },
  ];
  return [];
}

function classicControl(field, row) {
  const value = row ? fieldText(row[field.name]) : "";
  const required = field.required ? "required" : "";
  const hint = field.hint ? `<span class="classic-hint">${esc(field.hint())}</span>` : "";
  if (field.kind === "password") {
    const note = row ? L("හිස්ව තැබුවොත් පරණ මුරපදය පවතී", "வெறுமையாக விட்டால் பழைய கடவுச்சொல் இருக்கும்", "Leave blank to keep the current password") : "";
    return `<input type="password" name="${esc(field.name)}" autocomplete="new-password" ${row ? "" : "required"} placeholder="${esc(note)}">`;
  }
  if (field.kind === "file") {
    return `<span><input type="text" name="${esc(field.name)}" value="${esc(value)}" hidden><input type="file" accept="${esc(field.accept || "")}" data-upload="${esc(field.name)}" data-folder="${esc(field.folder)}" ${field.required && !value ? "required" : ""}>${value ? `<span class="classic-hint">${esc(value)}</span>` : ""}${hint}</span>`;
  }
  if (field.kind === "locked") {
    return `<input name="${esc(field.name)}" value="${esc(value)}" readonly>`;
  }
  if (field.kind === "myoffice") {
    const office = state.user?.office || value || "";
    if (state.user?.role === "User") return `<input name="${esc(field.name)}" value="${esc(office)}" readonly>`;
    field = { ...field, kind: "offices" };
  }
  if (field.kind === "area") return `<textarea name="${esc(field.name)}" ${required}>${esc(value)}</textarea>`;
  if (field.kind === "date") {
    const shown = value || (!row && field.today ? new Date().toISOString().slice(0, 10) : "");
    return `<input type="date" name="${esc(field.name)}" value="${esc(shown)}" ${required}>`;
  }
  if (field.kind === "number") return `<input type="number" step="any" name="${esc(field.name)}" value="${esc(value)}" ${required} placeholder="${esc(field.placeholder || "")}">`;
  if (["posts", "offices", "roles", "yesno", "downloads", "programmes", "subjects", "funds", "gender", "plantype", "services", "class", "blacklist", "centres"].includes(field.kind)) {
    const picked = value || (field.kind === "yesno" ? "ඔව්" : "");
    const options = classicChoices(field, picked);
    const found = options.some((item) => item.value === picked);
    const extra = picked && !found ? `<option value="${esc(picked)}" selected>${esc(picked)}</option>` : "";
    return `<select name="${esc(field.name)}" ${required}>${extra}${options.map((item) => `<option value="${esc(item.value)}" ${item.value === picked ? "selected" : ""}>${esc(item.label)}</option>`).join("")}</select>`;
  }
  return `<input name="${esc(field.name)}" value="${esc(value)}" ${required} placeholder="${esc(field.placeholder || "")}">${hint}`;
}

function classicCell(row, column) {
  const url = row[column.key + "_url"];
  if (column.image) return url ? `<a href="${esc(url)}" target="_blank" rel="noopener"><img class="staff-photo" alt="" src="${esc(url)}"></a>` : "";
  if (column.file) {
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(column.label())}</a>` : "";
  }
  if (column.key === "rp_whatsapp") {
    const text = String(row.rp_whatsapp || "").trim();
    const digits = text.replace(/\D/g, "");
    if (!text) return "";
    return digits ? `<a href="https://wa.me/${esc(digits)}" target="_blank" rel="noopener">${esc(text)}</a>` : esc(text);
  }
  const text = fieldText(row[column.key]);
  const shown = esc(text.length > 90 ? text.slice(0, 87) + "…" : text);
  return url && text ? `<a href="${esc(url)}" target="_blank" rel="noopener">${shown}</a>` : shown;
}

async function renderClassic(work, table) {
  if (!state.options) state.options = await api("options");
  const spec = classicPages()[table];
  const list = await api("list", { query: { table, limit: 1000, page: 1 } });
  const needle = (state.query?.get("q") || "").trim().toLowerCase();
  const rows = list.items.filter((row) => !needle || Object.values(row).some((value) => String(value || "").toLowerCase().includes(needle))).slice().sort((a, b) => {
    const cmp = String(a[spec.sort] || "").localeCompare(String(b[spec.sort] || ""), "si", { numeric: true });
    return spec.sortDesc ? -cmp : cmp;
  });
  const locked = spec.adminChange && state.user?.role !== "Administrator";
  const requested = locked ? "" : state.query?.get("edit") || "";
  const editing = spec.single ? (rows[0] || null) : rows.find((row) => String(row[spec.id]) === String(requested));
  const editId = editing ? editing[spec.id] : (spec.single ? "1" : requested);
  const tab = spec.listOnly || (!requested && !spec.single && state.query?.get("tab") === "all") ? "all" : "add";
  const saveLabel = editing && !spec.single
    ? L("යාවත්කාලීන කරන්න", "புதுப்பிக்க", "Update")
    : L("ඇතුළත් කරන්න", "சேர்க்க", "Add");
  const fields = spec.fields.filter((field) => field.kind !== "locked" || editing).map((field) => `
    <label class="classic-field"><span>${esc(field.label())}</span>${classicControl(field, editing)}</label>`).join("");
  const head = spec.columns.map((column) => `<th>${esc(column.label())}</th>`).join("");
  const planTicks = table === "cp_trrequirements" && state.user && (state.user.role === "Administrator" || state.user.role === "Super User");
  const planHead = planTicks ? `<th class="tick-cell">${esc(L("සැලැස්මට", "திட்டத்திற்கு", "To the plan"))}</th>` : "";
  const planCell = (row) => {
    if (!planTicks) return "";
    if (inPlan(row.req_isadd)) return `<td class="tick-cell">${esc(L("ඇතුළත්යි", "சேர்க்கப்பட்டது", "Added"))}</td>`;
    return `<td class="tick-cell"><input class="tick" type="checkbox" name="pick" value="${esc(row.req_id)}" aria-label="${esc(L("සැලැස්මට", "திட்டத்திற்கு", "To the plan"))}"></td>`;
  };
  const body = rows.map((row, index) => `<tr>
    <td>${index + 1}</td>
    ${spec.columns.map((column) => `<td>${classicCell(row, column)}</td>`).join("")}
    ${planCell(row)}
    <td class="row-actions">${locked ? "" : `${spec.listOnly ? "" : `<a href="#console/${esc(table)}?edit=${esc(row[spec.id])}">edit</a> `}
      <button class="text-btn small" type="button" data-act="classic-remove" data-table="${esc(table)}" data-id="${esc(row[spec.id])}">delete</button>`}</td>
  </tr>`).join("");
  if (table === "cp_slideshowimgs" && !editing) state.slidePicks = [];
  const form = table === "cp_slideshowimgs" && !editing ? `
    <form class="classic-form" id="slide-many-form">
      <label class="slide-add">+ ${esc(L("ඡායාරූප එකතු කරන්න", "படங்களைச் சேர்க்க", "Add photographs"))}<input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" multiple data-slide-pick hidden></label>
      <span class="classic-hint">${esc(L("ඕනෑම ගණනක් එකවර තෝරන්න පුළුවන්. නැවත ඔබලා තව එකතු කරන්නත් පුළුවන්. jpg හෝ png, හොඳම ප්‍රමාණය 940px × 318px.", "எத்தனை படங்களையும் ஒரே நேரத்தில் தேர்ந்தெடுக்கலாம். jpg அல்லது png.", "Pick as many as you like at once, and press again to add more. jpg or png, best size 940px × 318px."))}</span>
      <div class="slide-grid" id="slide-grid"></div>
      <label class="classic-field"><span>${esc(L("ඡායාරූප පෙන්වන්නේ නම්", "காட்ட வேண்டுமா", "Show on home"))}</span><select name="slp_status"><option value="ඔව්">${esc(L("ඔව්", "ஆம்", "Yes"))}</option><option value="නැත">${esc(L("නැත", "இல்லை", "No"))}</option></select></label>
      <button type="submit">${esc(L("සියල්ල ඇතුළත් කරන්න", "அனைத்தையும் சேர்க்க", "Add them all"))}</button>
      <div id="form-msg"></div>
    </form>` : `
    <form class="classic-form" id="classic-form" data-table="${esc(table)}">
      <input type="hidden" name="${esc(spec.id)}" value="${esc(editId)}">
      ${fields}
      <button type="submit">${esc(saveLabel)}</button>
      <div id="form-msg"></div>
    </form>`;
  const sheet = `
    <div class="table-wrap desig-list">
      <table>
        <thead><tr><th>${esc(L("අනු අංකය", "இல.", "No."))}</th>${head}${planHead}<th></th></tr></thead>
        <tbody>${body || `<tr><td colspan="${spec.columns.length + 2 + (planTicks ? 1 : 0)}">${esc(L("තොරතුරු කිසිවක් නොමැත.", "பதிவுகள் இல்லை.", "Nothing listed yet."))}</td></tr>`}</tbody>
      </table>
    </div>`;
  const tools = (spec.sheet || spec.search) ? `
    <form class="sheet-tools" id="classic-search" data-table="${esc(table)}">
      ${spec.search ? `<input name="q" value="${esc(state.query?.get("q") || "")}" placeholder="${esc(L("නම, අංකය හෝ කාර්යාලය", "பெயர் அல்லது எண்", "Name, ID, or office"))}">` : ""}
      ${spec.search ? `<button type="submit">${esc(L("සොයන්න", "தேடு", "Search"))}</button>` : ""}
      ${spec.sheet ? `<button type="button" data-act="export" data-table="${esc(table)}">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>` : ""}
      ${spec.sheet ? `<label class="file-pick">${esc(L("Excel ඇතුළත් කරන්න", "Excel பதிவேற்றம்", "Upload Excel"))}<input type="file" data-import="${esc(table)}" accept=".xls,.xlsx,.csv"></label>` : ""}
    </form>` : "";
  const planButton = planTicks ? `<form class="sheet-tools" id="plan-pick"><button type="submit">${esc(L("තෝරාගත් ඒවා සැලැස්මට දමන්න", "தேர்ந்தவற்றைத் திட்டத்தில் சேர்க்க", "Add the ticked needs to the plan"))}</button></form>` : "";
  work.dataset.table = table;
  work.innerHTML = tools + (spec.single
    ? `<h2 class="classic-title">${esc(spec.add())}</h2>${form}`
    : spec.listOnly
      ? `<h2 class="classic-title">${esc(spec.all())}</h2>${planButton}${sheet}`
      : `
    <div class="desig-tabs">
      <a class="${tab === "add" ? "on" : ""}" href="#console/${esc(table)}">${esc(spec.add())}</a>
      <a class="${tab === "all" ? "on" : ""}" href="#console/${esc(table)}?tab=all">${esc(spec.all())}</a>
    </div>
    ${tab === "add" ? form : planButton + sheet}`);
  if (planTicks && tab === "all") work.dataset.rows = JSON.stringify(rows);
}

async function renderTable(work, table) {
  const q = $("#record-search")?.value || state.tableQuery || "";
  const page = state.tablePage || 1;
  const [schema, list] = await Promise.all([
    api("schema", { query: { table } }),
    api("list", { query: { table, q, page } }),
  ]);
  state.schema = schema;
  const columns = schema.fields.filter((field) => !field.hidden).slice(0, 6);
  const head = columns.map((field) => `<th>${esc(field.label)}</th>`).join("") + (schema.writable ? "<th></th>" : "");
  const body = list.items.map((row) => `<tr>${columns.map((field) => `<td>${cell(row, field)}</td>`).join("")}${schema.writable ? `<td><button class="text-btn small" type="button" data-act="edit" data-id="${esc(row[schema.primary])}">Edit</button> <button class="text-btn small" type="button" data-act="remove" data-id="${esc(row[schema.primary])}">Delete</button></td>` : ""}</tr>`).join("");
  work.innerHTML = `
    <div class="toolbar">
      <div><p class="kicker">Records</p><h1>${esc(schema.label)}</h1></div>
    </div>
    <form class="filters" id="table-search" data-table="${esc(table)}">
      <label>Search<input id="record-search" name="q" value="${esc(q)}"></label>
      <button class="btn secondary" type="submit">Search</button>
      ${schema.writable ? '<button class="btn" type="button" data-act="create">New record</button>' : ""}
      <button class="btn secondary" type="button" data-act="export" data-table="${esc(table)}">Export</button>
    </form>
    <div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length + 1}">No records.</td></tr>`}</tbody></table></div>
    <div class="pager">
      <button class="btn secondary" type="button" data-act="page" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? "disabled" : ""}>Previous</button>
      <span>${list.total} records · page ${page}</span>
      <button class="btn secondary" type="button" data-act="page" data-page="${page + 1}" ${(page * list.limit) >= list.total ? "disabled" : ""}>Next</button>
    </div>`;
  work.dataset.table = table;
  work.dataset.rows = JSON.stringify(list.items);
}

function cell(row, field) {
  const url = row[field.name + "_url"];
  if (url) return `<a href="${esc(url)}">${esc(row[field.name])}</a>`;
  const text = fieldText(row[field.name]);
  return esc(text.length > 120 ? text.slice(0, 117) + "…" : text);
}

function openEditor(row) {
  const schema = state.schema;
  const fields = schema.fields.map((field) => {
    if (field.hidden && field.name !== "lg_pwd") return "";
    if (field.auto && !row) return "";
    const value = row ? fieldText(row[field.name]) : "";
    return `<label class="${/text/i.test(field.type) ? "wide" : ""}">${esc(field.label)}${control(field, value)}</label>`;
  }).join("");
  const id = row ? row[schema.primary] : "";
  document.body.insertAdjacentHTML("beforeend", `
    <div class="drawer" id="drawer">
      <form class="sheet" id="record-form" data-table="${esc(schema.table)}">
        <input type="hidden" name="${esc(schema.primary)}" value="${esc(id)}">
        <h2>${row ? "Edit" : "New"} ${esc(schema.label)}</h2>
        <div id="form-msg"></div>
        <div class="form-grid">${fields}</div>
        <p><button class="btn" type="submit">Save</button> <button class="btn secondary" type="button" data-act="close">Close</button></p>
      </form>
    </div>`);
}

function control(field, value) {
  const name = field.name;
  const common = `name="${esc(name)}"`;
  if (field.file) {
    return `<input ${common} value="${esc(value)}" data-file="${esc(field.file)}"><input type="file" data-upload="${esc(name)}" data-folder="${esc(field.file)}">`;
  }
  if (name === "lg_type") return select(name, state.options.roles.map((role) => ({ value: role, label: role })), value);
  if (name === "atp_trtype" || name === "ct_trtype") return select(name, state.options.types, value);
  if (name === "dwn_type") return select(name, Object.entries(state.options.downloadTypes).map(([val, label]) => ({ value: val, label })), value);
  if (name === "stf_blacklisted") return select(name, state.options.blacklist, value);
  if (["slp_status", "msg_status", "atp_addhome", "atp_showspecialfacts", "req_isadd", "tapp_isselected", "tapp_isrelevent", "tapp_accomodation", "pvtt_approved", "pvtt_certificatesubmit", "tratt_isparti"].includes(name)) {
    return select(name, state.options.yesno, value);
  }
  if (name.endsWith("office") || ["atp_reqoffice", "lg_office", "req_addoffice", "tapp_office"].includes(name)) {
    return select(name, state.options.offices.map((item) => ({ value: item.of_name, label: item.of_name })), value, true);
  }
  if (/date/i.test(field.type)) return `<input type="date" ${common} value="${esc(value)}">`;
  if (/int|double|decimal|float/i.test(field.type)) return `<input type="number" step="any" ${common} value="${esc(value)}">`;
  if (/text/i.test(field.type)) return `<textarea ${common}>${esc(value)}</textarea>`;
  if (name === "lg_pwd") return `<input type="password" ${common} placeholder="${value ? "Leave blank to keep the current password" : ""}" autocomplete="new-password">`;
  return `<input ${common} value="${esc(value)}">`;
}

function select(name, options, value, allowCustom = false) {
  const found = options.some((item) => item.value === value);
  const extra = allowCustom && value && !found ? `<option value="${esc(value)}" selected>${esc(value)}</option>` : "";
  return `<select name="${esc(name)}">${extra}${options.map((item) => `<option value="${esc(item.value)}" ${item.value === value ? "selected" : ""}>${esc(item.label)}</option>`).join("")}${allowCustom ? '<option value="">Other / blank</option>' : ""}</select>`;
}

async function renderNeeds(work) {
  return renderClassic(work, "cp_trrequirements");
}

async function renderApply(work) {
  const programmes = await api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } });
  state.applyPlans = applyProgrammes(programmes.items);
  paintApplyPick(work);
}

function applyChoices() {
  return (state.applyPlans || []).map((item) => `<option value="${esc(item.atp_id)}">${esc(item.atp_trname)}</option>`).join("");
}

function paintApplyPick(work, note, nid = "") {
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("පුහුණු වැඩසටහන් සඳහා අයදුම් කරන්න", "பயிற்சிகளுக்கு விண்ணப்பிக்க", "Apply for training programmes"))}</h2>
    <h3 class="classic-title">${esc(L("පුහුණු වැඩසටහන අයදුම් කරන්න", "பயிற்சிக்கு விண்ணப்பிக்க", "Apply for a programme"))}</h3>
    <form class="classic-form" id="apply-pick">
      <label class="classic-field"><span>${esc(L("නිලධාරී හැඳුනුම්පත් අංකය", "அதிகாரி அடையாள எண்", "Officer national ID"))} *</span>
        <input name="nid" required autocomplete="off" value="${esc(nid)}"></label>
      <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</span>
        <select name="atp_id" required>${applyChoices() || `<option value="">${esc(L("දැනට අයදුම් කළ හැකි වැඩසටහන් නැත", "விண்ணப்பிக்க நிகழ்ச்சி இல்லை", "No open programmes"))}</option>`}</select>
      </label>
      <button type="submit">${esc(L("අයදුම් කරන්න", "விண்ணப்பிக்க", "Apply"))}</button>
      <div id="form-msg">${note ? `<div class="ok">${esc(note)}</div>` : ""}</div>
    </form>`;
}

async function beginApply(plan, nid) {
  const id = String(nid || "").trim();
  if (!plan || !id) return;
  try {
    const data = await api("profile", { query: { nid: id } });
    const person = data.profile || {};
    if (!person.name) throw new Error(L("හැඳුනුම්පතට නිලධාරියෙකු හමු වුණේ නැහැ.", "அந்த அடையாள எண்ணுக்கு அதிகாரி இல்லை.", "No officer was found for that ID."));
    if (person.blacklisted === "Yes") {
      throw new Error(L(
        `මේ නිලධාරියා අසාදු ලේඛනයේ ඉන්නවා. ${showDate(person.blacklistUntil)} දක්වා කිසිම පුහුණුවකට අයදුම් කළ නොහැක.`,
        `${showDate(person.blacklistUntil)} வரை எந்தப் பயிற்சிக்கும் விண்ணப்பிக்க முடியாது.`,
        `This officer is blacklisted until ${showDate(person.blacklistUntil)} and cannot apply for any programme.`
      ));
    }
    state.applyNid = id;
    state.applyPerson = person;
  } catch (error) {
    const slot = $("#form-msg");
    if (slot) slot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
    return;
  }
  if (specialText(plan)) paintApplySpecial($("#work"), plan);
  else openApplyForm(plan);
}

function openApplyForm(plan) {
  paintApplyForm($("#work"), plan);
  const person = state.applyPerson || {};
  const name = $("#apply-name");
  if (!name) return;
  name.value = person.name || "";
  $("#apply-post").value = person.designation || "";
  $("#apply-office").value = person.office || "";
  $("#apply-mobile").value = person.mobile || "";
  $("#apply-email").value = person.email || "";
  $("#apply-birth").value = showDate(person.birth);
  $("#apply-gender").value = person.gender || "";
  const details = $("#apply-details");
  if (details) details.hidden = !name.value;
}

function specialText(plan) {
  const text = String(plan.atp_specialfacts || "").trim();
  if (!text) return "";
  const flag = String(plan.atp_showspecialfacts || "").trim().toLowerCase();
  if (flag === "නැත" || flag === "no") return "";
  return text;
}

function paintApplySpecial(work, plan) {
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("විශේෂ කරුණු", "சிறப்பு விவரங்கள்", "Special facts"))}</h2>
    <article class="apply-special">
      <p class="prog">${esc(plan.atp_trname)}</p>
      <p>${esc(L("මෙම පුහුණු වැඩසටහන සඳහා ඉදිරිපත් කිරීමේදී පහත සඳහන් විශේෂ කරුණු පිළිබඳව අවධානය යොමු කරන්න.", "விண்ணப்பிக்கும் முன் கீழ்வரும் சிறப்பு விவரங்களைக் கவனியுங்கள்.", "Read these special facts before you apply."))}</p>
      <p class="facts">${esc(specialText(plan))}</p>
      <p class="apply-links">
        <button class="text-btn" type="button" data-act="apply-go" data-id="${esc(plan.atp_id)}">${esc(L("අයදුම් කිරීම සඳහා මෙතන", "விண்ணப்பிக்க இங்கே", "Continue to the application"))}</button>
        <button class="text-btn" type="button" data-act="apply-cancel">${esc(L("අයදුම් කිරීම අවලංගු කරන්න", "விண்ணப்பத்தை ரத்து செய்", "Cancel the application"))}</button>
      </p>
    </article>`;
}

function priorityOptions() {
  let html = "";
  for (let n = 1; n <= 50; n += 1) html += `<option value="${n}">${n}</option>`;
  return html;
}

function yesNoRadios(name) {
  return `<span class="yesno">
    <label><input type="radio" name="${name}" value="ඔව්" ${name === "relevant" ? "checked" : ""} required> ${esc(L("ඔව්", "ஆம்", "Yes"))}</label>
    <label><input type="radio" name="${name}" value="නැත" ${name === "accommodation" ? "checked" : ""}> ${esc(L("නැත", "இல்லை", "No"))}</label>
  </span>`;
}

function paintApplyForm(work, plan) {
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("පුහුණු වැඩසටහනකට අයදුම් කරන්න", "பயிற்சிக்கு விண்ணப்பிக்க", "Apply for a programme"))}</h2>
    <form class="classic-form" id="apply-form">
      <input type="hidden" name="atp_id" value="${esc(plan.atp_id)}">
      <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</span><input value="${esc(plan.atp_trname)}" readonly></label>
      <label class="classic-field"><span>${esc(L("නිලධාරී හැඳුනුම්පත් අංකය", "அதிகாரி அடையாள எண்", "Officer national ID"))}</span><input name="nid" required readonly value="${esc(state.applyNid || "")}"></label>
      <div id="apply-details" hidden>
        <label class="classic-field"><span>${esc(L("නිලධාරියාගේ නම", "அதிகாரி பெயர்", "Officer name"))}</span><input id="apply-name" readonly></label>
        <label class="classic-field"><span>${esc(L("තනතුර", "பதவி", "Designation"))}</span><input id="apply-post" readonly></label>
        <label class="classic-field"><span>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</span><input id="apply-office" readonly></label>
        <label class="classic-field"><span>${esc(L("ජංගම දුරකථන අංකය", "கைபேசி", "Mobile"))}</span><input id="apply-mobile" readonly></label>
        <label class="classic-field"><span>${esc(L("විද්‍යුත් තැපෑල", "மின்னஞ்சல்", "Email"))}</span><input id="apply-email" readonly></label>
        <label class="classic-field"><span>${esc(L("උපන් දිනය", "பிறந்த திகதி", "Date of birth"))}</span><input id="apply-birth" readonly></label>
        <label class="classic-field"><span>${esc(L("ස්ත්‍රී / පුරුෂ", "பாலினம்", "Gender"))}</span><input id="apply-gender" readonly></label>
        <label class="classic-field"><span>${esc(L("රාජකාරියට අදාළද", "பணிக்குத் தொடர்புடையதா", "Relevant to the duties"))}</span>${yesNoRadios("relevant")}</label>
        <label class="classic-field"><span>${esc(L("ප්‍රමුඛත්වය", "முன்னுரிமை", "Priority"))}</span><select name="priority">${priorityOptions()}</select></label>
        <label class="classic-field"><span>${esc(L("නවාතැන් අවශ්‍යද", "தங்குமிடம் வேண்டுமா", "Accommodation needed"))}</span>${yesNoRadios("accommodation")}</label>
        <button type="submit">${esc(L("අයදුම් කරන්න", "விண்ணப்பிக்க", "Apply"))}</button>
      </div>
      <div id="form-msg"></div>
    </form>`;
}

async function fillApplyOfficer(nid) {
  const name = $("#apply-name");
  if (!name) return;
  const details = $("#apply-details");
  if (details) details.hidden = true;
  ["apply-name", "apply-post", "apply-office", "apply-mobile", "apply-email", "apply-birth", "apply-gender"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
  if (!String(nid || "").trim()) return;
  try {
    const data = await api("profile", { query: { nid: String(nid).trim() } });
    const person = data.profile || {};
    name.value = person.name || "";
    $("#apply-post").value = person.designation || "";
    $("#apply-office").value = person.office || "";
    $("#apply-mobile").value = person.mobile || "";
    $("#apply-email").value = person.email || "";
    $("#apply-birth").value = showDate(person.birth);
    $("#apply-gender").value = person.gender || "";
    const details = $("#apply-details");
    if (details) details.hidden = !name.value;
    if (!name.value) {
      const slot = $("#form-msg");
      if (slot) slot.innerHTML = `<div class="error">${esc(L("හැඳුනුම්පතට නිලධාරියෙකු හමු වුණේ නැහැ.", "அந்த அடையாள எண்ணுக்கு அதிகாரி இல்லை.", "No officer was found for that ID."))}</div>`;
    } else {
      const slot = $("#form-msg");
      if (slot) slot.innerHTML = "";
    }
  } catch (error) {
    const details = $("#apply-details");
    if (details) details.hidden = true;
    const slot = $("#form-msg");
    if (slot) slot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
  }
}

function inPlan(value) {
  const text = String(value || "").toLowerCase();
  return value === YES || text === "yes" || text === "ඔව්";
}

async function renderPlan(work) {
  const [list, done] = await Promise.all([
    api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } }),
    api("list", { query: { table: "cp_completedtrainings", limit: 1000, page: 1 } }).catch(() => ({ items: [] })),
  ]);
  const finished = new Set((done.items || []).map((row) => String(row.ct_atpid)));
  const programmes = list.items
    .filter((row) => !inPlan(row.atp_offweb) && (String(row.atp_trname || "").trim() || state.user.role === "Administrator"))
    .slice()
    .sort((a, b) => {
      const left = showDate(a.atp_day1) || "9999-99-99";
      const right = showDate(b.atp_day1) || "9999-99-99";
      if (left !== right) return left < right ? -1 : 1;
      return Number(a.atp_id) - Number(b.atp_id);
    });
  const rows = programmes.map((row, index) => {
    const who = String(row.atp_reqdesig || "").trim() || String(row.atp_targetgroup || "").trim();
    const ended = finished.has(String(row.atp_id)) ? YES : NO;
    const on = inPlan(row.atp_isaddatp);
    const tick = `<input class="plan-tick" type="checkbox" value="${esc(row.atp_id)}" data-on="${on ? "1" : "0"}" ${on ? "checked" : ""}>`;
    return `<tr>
    <td>${index + 1}</td>
    <td>${esc(showDate(row.atp_day1))}</td>
    <td class="wrap-cell">${esc(row.atp_trname)}</td>
    <td class="wrap-cell">${esc(who)}</td>
    <td class="wrap-cell">${esc(row.atp_location)}</td>
    <td>${esc(row.atp_noofparticipants)}</td>
    <td>${esc(ended)}</td>
    <td class="tick-cell">${tick}</td>
  </tr>`;
  }).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("වාර්ෂික පුහුණු සැලැස්ම සකස් කිරීමට ඇතුළත් කළ යුතු පුහුණු වැඩසටහන්", "ஆண்டுத் திட்டத்தில் சேர்க்க வேண்டிய பயிற்சிகள்", "Programmes to include when preparing the annual plan"))}</h2>
    <form class="sheet-tools">
      <button type="button" data-act="export" data-table="cp_atp">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
      <label class="file-pick">${esc(L("Excel ඇතුළත් කරන්න", "Excel பதிவேற்றம்", "Upload Excel"))}<input type="file" data-import="cp_atp" accept=".xls,.xlsx,.csv"></label>
    </form>
    <div class="plan-include-bar"><button type="button" class="pick-yes" data-act="save-plan">${esc(L("පුහුණු සැලස්මට ඇතුළත් කරන්න", "பயிற்சித் திட்டத்தில் சேர்க்க", "Add to the training plan"))}</button></div>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("නාමයෝජනා කරයි", "பரிந்துரை", "Nominated for"))}</th>
        <th>${esc(L("නවාතැන්", "தங்குமிடம்", "Place"))}</th>
        <th>${esc(L("සේවක සංඛ්‍යාව", "பணியாளர் எண்ணிக்கை", "Officers"))}</th>
        <th>${esc(L("අවසන් වීද?", "முடிந்ததா?", "Finished?"))}</th>
        <th>${esc(L("සැලැස්මට ඇතුළත් කරන්න", "திட்டத்தில் சேர்க்க", "Add to the plan"))}</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="8">${esc(L("තොරතුරු කිසිවක් නොමැත.", "பதிவுகள் இல்லை.", "Nothing listed yet."))}</td></tr>`}</tbody>
    </table></div>`;
}

function planDateValue(row, name) {
  return showDate(row[name]);
}

function addDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function daySpan(from, to) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((new Date(ty, tm - 1, td) - new Date(fy, fm - 1, fd)) / 86400000);
}

function shiftPlanDates(form) {
  const start = form.querySelector("#plan-dates input") || form.querySelector("[name=atp_day1]");
  const original = start?.dataset.original || "";
  const next = start?.value || "";
  if (!original || !next || original === next) return;
  const delta = daySpan(original, next);
  form.querySelectorAll("[data-plan-date]").forEach((field) => {
    if (field === start || field.dataset.touched === "1" || !field.dataset.original) return;
    field.value = addDays(field.dataset.original, delta);
  });
}

function planLines(value) {
  return String(value || "").split(/\n/).map((item) => item.trim()).filter(Boolean);
}

function planCount(input) {
  const count = Math.round(Number(input?.value));
  const next = !count || count < 1 ? 1 : Math.min(100, count);
  if (input) input.value = String(next);
  return next;
}

function storedPlanDates(row) {
  const dates = [];
  for (let n = 1; n <= 10; n += 1) dates.push(showDate(row["atp_day" + n]));
  planLines(row.atp_moredays).forEach((item) => dates.push(showDate(item)));
  let last = -1;
  dates.forEach((item, index) => { if (item) last = index; });
  return last < 0 ? [] : dates.slice(0, last + 1);
}

function storedPlanPeople(row) {
  const names = [];
  for (let n = 1; n <= 10; n += 1) names.push(String(row["atp_resourcep" + n] || "").trim());
  planLines(row.atp_moreresource).forEach((item) => names.push(item));
  let last = -1;
  names.forEach((item, index) => { if (item) last = index; });
  return last < 0 ? [] : names.slice(0, last + 1);
}

let planLecturers = [];

function planLine(label, control, dropAct, index) {
  return `<label class="classic-field plan-line"><span>${esc(label)}</span><span class="plan-add-row">${control}<button type="button" class="text-btn small" data-act="${dropAct}" data-index="${index}">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button></span></label>`;
}

function planDateLabel(index) {
  if (index === 0) return L("වැඩ සටහනේ ආරම්භක දිනය", "நிகழ்ச்சியின் தொடக்க திகதி", "Start date of the programme");
  const n = index + 1;
  return L(n + " වන දිනය", n + " ஆம் நாள்", "Day " + n);
}

function paintPlanDates(dates) {
  const slot = $("#plan-dates");
  if (!slot) return;
  const rows = dates.length ? dates : [""];
  slot.innerHTML = rows.map((value, index) => planLine(
    planDateLabel(index),
    `<input type="date" data-plan-date data-original="${esc(value)}" value="${esc(value)}">`,
    "drop-plan-date",
    index
  )).join("");
}

function paintPlanPeople(names) {
  const slot = $("#plan-people");
  if (!slot) return;
  slot.innerHTML = names.map((value, index) => planLine(
    L((index + 1) + " වන සම්පත්දායකයා", (index + 1) + " ஆம் வள ஆள்", "Resource person " + (index + 1)),
    personSelect("plan_person", value, planLecturers),
    "drop-plan-person",
    index
  )).join("");
}

function storedPlanStaff(row) {
  const names = [];
  for (let n = 2; n <= 6; n += 1) names.push(String(row["atp_supportstaff" + n] || "").trim());
  planLines(row.atp_moresupport).forEach((item) => names.push(item));
  let last = -1;
  names.forEach((item, index) => { if (item) last = index; });
  return last < 0 ? [] : names.slice(0, last + 1);
}

function paintPlanStaff(names) {
  const slot = $("#plan-staff");
  if (!slot) return;
  slot.innerHTML = names.map((value, index) => planLine(
    L((index + 1) + " වන සහාය කාර්ය මණ්ඩලය (ජා.හැ.අංකය)", (index + 1) + " ஆம் உதவி பணியாளர் (அடையாள எண்)", "Support staff " + (index + 1) + " (NIC)"),
    `<input name="plan_staff" value="${esc(value)}">`,
    "drop-plan-staff",
    index
  )).join("");
}

function venueField(row) {
  const current = String(row.atp_location || "").trim();
  const names = (state.options?.centres || []).map((item) => String(item.trc_name || "").trim()).filter(Boolean);
  const extra = current && !names.includes(current) ? `<option value="${esc(current)}" selected>${esc(current)}</option>` : "";
  const options = names.map((item) => `<option value="${esc(item)}" ${item === current ? "selected" : ""}>${esc(item)}</option>`).join("");
  return `<label class="classic-field"><span>${esc(L("වැඩමුළුව පැවැත්වෙන ස්ථානය", "பட்டறை நடைபெறும் இடம்", "Workshop venue"))}</span><select name="atp_location"><option value="">—</option>${extra}${options}</select></label>`;
}

const FILE_PREFIX = "NWP/MDTU/2/";

function fileRest(value) {
  const text = String(value || "").trim();
  return text.startsWith(FILE_PREFIX) ? text.slice(FILE_PREFIX.length) : text;
}

function fileFull(value) {
  const text = String(value || "").trim();
  if (!text || text.startsWith("NWP/")) return text;
  return FILE_PREFIX + text;
}

function appendPlanDates(count) {
  const have = [...document.querySelectorAll("#plan-dates input")].map((field) => field.value || "");
  const room = 100 - have.length;
  if (room < 1) {
    alert(L("දින 100කට වඩා එකතු කරන්න බැහැ.", "100 நாட்களுக்கு மேல் சேர்க்க முடியாது.", "You cannot add more than 100 days."));
    return;
  }
  const adding = Math.min(count, room);
  const last = [...have].reverse().find(Boolean) || "";
  for (let step = 1; step <= adding; step += 1) have.push(last ? addDays(last, step) : "");
  paintPlanDates(have);
}

function appendPlanPeople(count) {
  const have = [...document.querySelectorAll("#plan-people select")].map((field) => field.value || "");
  const room = 100 - have.length;
  if (room < 1) {
    alert(L("සම්පත් දායකයන් 100කට වඩා එකතු කරන්න බැහැ.", "100 வள ஆள்களுக்கு மேல் சேர்க்க முடியாது.", "You cannot add more than 100 resource persons."));
    return;
  }
  const adding = Math.min(count, room);
  for (let step = 0; step < adding; step += 1) have.push("");
  paintPlanPeople(have);
}

function appendPlanStaff(count) {
  const have = [...document.querySelectorAll("#plan-staff input")].map((field) => field.value || "");
  const room = 20 - have.length;
  if (room < 1) {
    alert(L("සහාය කාර්ය මණ්ඩලය 20කට වඩා එකතු කරන්න බැහැ.", "20 பேருக்கு மேல் சேர்க்க முடியாது.", "You cannot add more than 20 support staff."));
    return;
  }
  const adding = Math.min(count, room);
  for (let step = 0; step < adding; step += 1) have.push("");
  paintPlanStaff(have);
}

function annualPayload(form) {
  const data = Object.fromEntries(new FormData(form));
  const dates = [...form.querySelectorAll("#plan-dates input")].map((field) => field.value || "");
  const people = [...form.querySelectorAll("#plan-people select")].map((field) => field.value || "");
  const staff = [...form.querySelectorAll("#plan-staff input")].map((field) => field.value || "");
  for (let n = 1; n <= 10; n += 1) {
    data["atp_day" + n] = dates[n - 1] || "";
    data["atp_resourcep" + n] = people[n - 1] || "";
  }
  for (let n = 2; n <= 6; n += 1) data["atp_supportstaff" + n] = staff[n - 2] || "";
  data.atp_moredays = dates.slice(10).map((item) => item.trim()).filter(Boolean).join("\n");
  data.atp_moreresource = people.slice(10).map((item) => item.trim()).filter(Boolean).join("\n");
  data.atp_moresupport = staff.slice(5).map((item) => item.trim()).filter(Boolean).join("\n");
  data.atp_fileno = fileFull(data.atp_fileno);
  delete data.plan_person;
  delete data.plan_staff;
  return data;
}

function annualControl(name, label, kind, row, extra = "") {
  const value = kind === "date" ? planDateValue(row, name) : fieldText(row[name]);
  const wide = kind === "area" ? " wide" : "";
  let control = `<input name="${esc(name)}" value="${esc(value)}">`;
  if (kind === "area") control = `<textarea name="${esc(name)}">${esc(value)}</textarea>`;
  if (kind === "date") {
    const input = `<input type="date" name="${esc(name)}" data-plan-date data-original="${esc(value)}" value="${esc(value)}">`;
    control = name === "atp_lastdateapply"
      ? `<span class="plan-add-row">${input}<button type="button" class="text-btn small" data-act="clear-apply-date">${esc(L("මකන්න", "அழி", "Clear"))}</button></span>`
      : input;
  }
  if (kind === "funds" || kind === "yesno" || kind === "plantype") control = classicControl({ name, kind, label: () => "" }, row);
  if (kind === "people") control = extra;
  return `<label class="classic-field${wide}"><span>${esc(label)}</span>${control}</label>`;
}

function personSelect(name, current, people) {
  const names = people.map((item) => item.rp_name).filter(Boolean);
  const extra = current && !names.includes(current) ? `<option value="${esc(current)}" selected>${esc(current)}</option>` : "";
  const options = names.map((item) => `<option value="${esc(item)}" ${item === current ? "selected" : ""}>${esc(item)}</option>`).join("");
  return `<select name="${esc(name)}"><option value="">—</option>${extra}${options}</select>`;
}

function annualFormFields(editing, publish = true) {
  const text = (name, si, ta, en) => annualControl(name, L(si, ta, en), "text", editing);
  const area = (name, si, ta, en) => annualControl(name, L(si, ta, en), "area", editing);
  const date = (name, si, ta, en) => annualControl(name, L(si, ta, en), "date", editing);
  const startTime = String(editing.atp_stime || "").trim() || "9.00 am";
  const endTime = String(editing.atp_etime || "").trim() || "4.15 pm";
  const cashDesig = String(editing.atp_cashofficerdesig || "").trim() || "නියේජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)";
  const publishFields = publish ? `
            ${annualControl("atp_isaddatp", L("පුහුණු සැලැස්මට ඇතුලත් වේද?", "திட்டத்தில் சேர்க்கவா?", "Include in the training plan?"), "yesno", editing)}
            ${annualControl("atp_addhome", L("මෙම වැඩසටහන මුල් පිටුවට ඇතුලත් කිරීම", "முகப்பில் சேர்த்தல்", "Include this programme on the home page"), "yesno", editing)}
            ${date("atp_lastdateapply", "වැඩමුළුව සඳහා අයදුම් කල හැකි අවසාන දිනය", "விண்ணப்பிக்கும் கடைசி நாள்", "Last date to apply for the workshop")}` : "";
  return `
        <div class="annual-sheet">
          <div class="annual-col">
            ${text("atp_trname", "පුහුණු වැඩ සටහන", "பயிற்சி", "Programme")}
            <label class="classic-field"><span>${esc(L("ලිපි ගොනු අංකය", "கோப்பு எண்", "File number"))}</span><span class="plan-add-row file-prefix"><b>${FILE_PREFIX}</b><input name="atp_fileno" value="${esc(fileRest(editing.atp_fileno))}"></span></label>
            ${text("atp_panelno", "පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number")}
            ${text("atp_supervisor", "පුහුණු වැඩ සටහන අධීක්ෂණය", "பயிற்சி மேற்பார்வை", "Programme supervision")}
            ${area("atp_purpose", "අරමුණ", "நோக்கம்", "Purpose")}
            ${area("atp_content", "අන්තර්ගතය", "உள்ளடக்கம்", "Content")}
            ${text("atp_targetgroup", "ඉලක්කගත කණ්ඩායම", "இலக்கு குழு", "Target group")}
            ${text("atp_nooftrainings", "වැඩමුළු ගණන", "பட்டறை எண்ணிக்கை", "Number of workshops")}
            ${text("atp_noofdays", "එක් වැඩමුළුවකට දින ගණන", "ஒரு பட்டறைக்கான நாட்கள்", "Days for one workshop")}
            ${text("atp_noofparticipants", "සහභාගී කරගන්නා නිලධාරීන් ගණන", "பங்கேற்கும் அதிகாரிகள்", "Number of officers taking part")}
            ${venueField(editing)}
            ${annualControl("atp_fundsource", L("මූල්‍ය ප්‍රභවය", "நிதி மூலம்", "Fund source"), "funds", editing)}
            ${text("atp_bdjet", "එක් වැඩමුළුවක් සඳහා වෙන් කල මුදල (රුපියල්)", "ஒரு பட்டறைக்கான தொகை (ரூபாய்)", "Amount set aside for one workshop (rupees)")}
            <div id="plan-dates"></div>
            <label class="classic-field"><span>${esc(L("තව දින ගණන", "மேலும் நாட்கள்", "More days to add"))}</span><span class="plan-add-row"><input id="plan-date-count" type="number" min="1" max="100" value="1"><button type="button" class="pick-yes" data-act="add-plan-dates">${esc(L("දින එකතු කරන්න", "நாட்களைச் சேர்க்க", "Add dates"))}</button></span></label>
            <label class="classic-field"><span>${esc(L("ආරම්භ වන වෙලාව", "தொடக்க நேரம்", "Start time"))}</span><input name="atp_stime" value="${esc(startTime)}"></label>
            <label class="classic-field"><span>${esc(L("අවසන් වන වෙලාව", "முடியும் நேரம்", "End time"))}</span><input name="atp_etime" value="${esc(endTime)}"></label>
          </div>
          <div class="annual-col">
            <label class="classic-field"><span>${esc(L("එකතු කරන සම්පත් දායකයන් ගණන", "சேர்க்கும் வள ஆள்கள்", "Resource persons to add"))}</span><span class="plan-add-row"><input id="plan-people-count" type="number" min="1" max="100" value="1"><button type="button" class="pick-yes" data-act="add-plan-people">${esc(L("සම්පත් දායකයන් එකතු කරන්න", "வள ஆள்களைச் சேர்க்க", "Add resource persons"))}</button></span></label>
            <div id="plan-people"></div>
            ${text("atp_supportstaff1", "පුහුණු වැඩ සටහන සම්බන්ධීකාරක (ජා.හැ.අංකය)", "ஒருங்கிணைப்பாளர் (அடையாள எண்)", "Coordinator (NIC)")}
            <label class="classic-field"><span>${esc(L("එකතු කරන සහාය කාර්ය මණ්ඩලය ගණන", "சேர்க்கும் உதவி பணியாளர்", "Support staff to add"))}</span><span class="plan-add-row"><input id="plan-staff-count" type="number" min="1" max="20" value="1"><button type="button" class="pick-yes" data-act="add-plan-staff">${esc(L("සහාය කාර්ය මණ්ඩලය එකතු කරන්න", "உதவி பணியாளரைச் சேர்க்க", "Add support staff"))}</button></span></label>
            <div id="plan-staff"></div>
            ${text("atp_cashofficername", "මුදල් භාර නිලධාරියාගේ නම", "பண அதிகாரி பெயர்", "Name of the cash officer")}
            <label class="classic-field"><span>${esc(L("මුදල් භාර නිලධාරියාගේ තනතුර", "பண அதிகாரி பதவி", "Designation of the cash officer"))}</span><input name="atp_cashofficerdesig" value="${esc(cashDesig)}"></label>
            ${area("atp_cashofficerotherdetails", "මුදල් භාර නිලධාරියාගේ වෙනත් විස්තර", "பண அதிகாரி பிற விவரம்", "Other details of the cash officer")}
            ${annualControl("atp_trtype", L("පුහුණු වැඩසටහනේ වර්ගය", "பயிற்சி வகை", "Type of training programme"), "plantype", editing)}
            ${publishFields}
            ${area("atp_otherfacts", "වෙනත් කරුණු", "பிற விவரங்கள்", "Other facts")}
            ${area("atp_specialfacts", "විශේෂ කරුණු", "சிறப்பு விவரங்கள்", "Special facts")}
            ${annualControl("atp_showspecialfacts", L("විශේෂ කරුණු හා එම කරුණු ප්‍රදර්ශනය කිරීම", "சிறப்பு விவரங்களைக் காட்ட", "Show the special facts"), "yesno", editing)}
            ${annualControl("atp_specialfinletter", L("විශේෂ කරුණු කැඳවීම් ලිපියට ඇතුලත් කිරීම", "அழைப்பு கடிதத்தில் சேர்க்க", "Include special facts in the call letter"), "yesno", editing)}
          </div>
        </div>`;
}

async function renderAnnual(work) {
  const list = await api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } });
  const editId = state.query?.get("edit") || "";
  const editing = list.items.find((row) => String(row.atp_id) === String(editId));
  if (editing) {
    let people = [];
    try {
      people = (await api("list", { query: { table: "cp_resourcepersons", limit: 1000, page: 1 } })).items || [];
    } catch (error) {
      people = [];
    }
    planLecturers = people;
    if (!state.options?.centres) {
      try { state.options = Object.assign(state.options || {}, await api("options")); } catch (error) { /* centres stay empty */ }
    }
    const savedDates = storedPlanDates(editing);
    const savedPeople = storedPlanPeople(editing);
    const savedStaff = storedPlanStaff(editing);
    work.innerHTML = `
      <h2 class="classic-title">${esc(editing.atp_trname || L("පුහුණු වැඩසටහන වෙනස් කරන්න", "பயிற்சியைத் திருத்து", "Edit the programme"))}</h2>
      <form class="classic-form old-plan" id="annual-form">
        <input type="hidden" name="atp_id" value="${esc(editing.atp_id)}">
        ${annualFormFields(editing, true)}
        <button type="submit">${esc(L("යාවත්කාලීන කරන්න", "புதுப்பிக்க", "Update"))}</button>
        <div id="form-msg"></div>
      </form>`;
    paintPlanDates(savedDates.length ? savedDates : [""]);
    paintPlanPeople(savedPeople);
    paintPlanStaff(savedStaff);
    return;
  }
  const rows = list.items.filter((row) => inPlan(row.atp_isaddatp) && (String(row.atp_trname || "").trim() || state.user.role === "Administrator")).map((row, index) => {
    const named = String(row.atp_trname || "").trim() !== "";
    const edit = state.user.role === "User" ? "" : `<a href="#console/cp_atp?edit=${esc(row.atp_id)}">edit</a>`;
    const remove = !named && state.user.role === "Administrator" ? ` <button class="text-btn small" type="button" data-act="annual-remove" data-id="${esc(row.atp_id)}">delete</button>` : "";
    return `<tr>
    <td>${index + 1}</td>
    <td>${esc(showDate(row.atp_requestDate))}</td>
    <td>${esc(row.atp_trname)}</td>
    <td>${esc(row.atp_targetgroup)}</td>
    <td>${esc(row.atp_noofparticipants)}</td>
    <td>${esc(showDate(row.atp_day1))}</td>
    <td>${edit}${remove}</td>
  </tr>`;
  }).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("වාර්ෂික පුහුණු සැලැස්ම", "ஆண்டுப் பயிற்சித் திட்டம்", "Annual training plan"))}</h2>
    <form class="sheet-tools">
      <button type="button" data-act="export" data-table="cp_atp">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
      <label class="file-pick">${esc(L("Excel ඇතුළත් කරන්න", "Excel பதிவேற்றம்", "Upload Excel"))}<input type="file" data-import="cp_atp" accept=".xls,.xlsx,.csv"></label>
    </form>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ඉලක්ක කණ්ඩායම", "இலக்கு குழு", "Target group"))}</th>
        <th>${esc(L("සහභාගිවන්නන්", "பங்கேற்பாளர்", "Participants"))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Starts"))}</th>
        <th></th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="7">${esc(L("තොරතුරු කිසිවක් නොමැත.", "பதிவுகள் இல்லை.", "Nothing listed yet."))}</td></tr>`}</tbody>
    </table></div>`;
}

function subjectChoicesHtml(value) {
  const options = classicChoices({ kind: "subjects" }, value);
  const found = !value || options.some((item) => item.value === value);
  const extra = value && !found ? `<option value="${esc(value)}" selected>${esc(value)}</option>` : "";
  return extra + options.map((item) => `<option value="${esc(item.value)}" ${item.value === value ? "selected" : ""}>${esc(item.label)}</option>`).join("");
}

function subjectRowHtml(name, value, removable) {
  const typed = name.endsWith("[]") ? "rp_extra_new[]" : `${name}_new`;
  return `<div class="subject-row">
    <select name="${esc(name)}">${subjectChoicesHtml(value)}</select>
    <input name="${esc(typed)}" placeholder="${esc(L("ලැයිස්තුවේ නැත්නම් මෙතන ලියන්න", "பட்டியலில் இல்லை என்றால் இங்கே எழுதவும்", "If it is not listed, type it here"))}">
    ${removable ? `<button type="button" class="text-btn small" data-act="subject-remove">${esc(L("ඉවත්", "நீக்கு", "Remove"))}</button>` : ""}
  </div>`;
}

function paintSubjects(person) {
  const slot = $("#subject-rows");
  if (!slot) return;
  const rows = [];
  for (let n = 1; n <= 5; n++) {
    const value = String(person?.["rp_fld" + n] || "").trim();
    if (value) rows.push({ name: "rp_fld" + n, value });
  }
  String(person?.rp_morefields || "").split(/\n/).map((item) => item.trim()).filter(Boolean).forEach((value) => {
    rows.push({ name: "rp_extra[]", value });
  });
  if (!rows.length) rows.push({ name: "rp_fld1", value: "" });
  slot.innerHTML = rows.map((row, index) => subjectRowHtml(row.name, row.value, index > 0)).join("");
}

function addSubjectRow() {
  const slot = $("#subject-rows");
  if (!slot) return;
  const used = [...slot.querySelectorAll("select")].map((item) => item.name);
  let next = 1;
  while (next <= 5 && used.includes("rp_fld" + next)) next += 1;
  slot.insertAdjacentHTML("beforeend", subjectRowHtml(next <= 5 ? "rp_fld" + next : "rp_extra[]", "", true));
}

async function renderRegister(view) {
  const options = await api("resource-options");
  const fieldRows = options.fields || [];
  const postRows = options.designations || [];
  const posts = [{ value: "", label: "—" }, ...postRows.map((item) => ({ value: item.des_name, label: item.des_name }))];
  state.options = Object.assign(state.options || {}, { fields: fieldRows.map((item) => ({ tf_name: item.tf_name })), designations: postRows.map((item) => ({ des_name: item.des_name })) });
  const fields = resourceFieldDefs().filter((field) => field.name !== "rp_code").map((field) => {
    if (field.kind === "subjects" || field.name === "rp_morefields") {
      if (field.name === "rp_fld1") {
        return `<div class="classic-field subject-field"><span>${esc(L("විෂය ක්ෂේත්‍ර", "பாடத் துறை", "Subject fields"))}</span><div><div id="subject-rows"></div><button type="button" data-act="subject-add">${esc(L("තව විෂය ක්ෂේත්‍රයක්", "மேலும் ஒரு துறை", "Add another subject"))}</button></div></div>`;
      }
      return "";
    }
    if (field.kind === "posts") {
      return `<label class="classic-field"><span>${esc(field.label())}</span><select name="${esc(field.name)}">${posts.map((item) => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join("")}</select></label>`;
    }
    if (field.kind === "file") {
      const preview = field.name === "rp_photo" ? `<img id="resource-photo" alt="" hidden>` : "";
      return `<label class="classic-field"><span>${esc(field.label())}</span><span>${preview}<input type="file" name="${esc(field.name)}" accept="${esc(field.accept || "")}"></span></label>`;
    }
    return `<label class="classic-field"><span>${esc(field.label())}</span>${classicControl(field, null)}</label>`;
  }).join("");
  view.innerHTML = `
    <section class="wrap section register-page">
      <h1>${esc(L("සම්පත්දායක සංචිතය", "வள ஆள்கள்", "Resource persons"))}</h1>
      <p class="pad-note">${esc(L("අලුතින් ලියාපදිංචි වුණාම යාවත්කාල කේතයක් ලැබෙනවා. එය තියාගන්න. පසුව තොරතුරු වෙනස් කරන්න ඒ කේතය ඕන.", "பதிவுக்குப் பின் ஒரு குறியீடு கிடைக்கும். அதை வைத்து பின்னர் விவரங்களை மாற்றலாம்.", "After you register you receive an update code. Keep it. You need that code to change these details later."))}</p>
      <form class="sheet-tools" id="resource-lookup">
        <input name="nid" placeholder="${esc(L("හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"))}" required>
        <input name="code" placeholder="${esc(L("යාවත්කාල කේතය", "புதுப்பிப்பு குறியீடு", "Update code"))}" required>
        <button type="submit">${esc(L("තොරතුරු ගෙනෙන්න", "விவரங்களைக் காட்டு", "Load my details"))}</button>
      </form>
      <form class="classic-form" id="resource-public">
        <input type="hidden" name="rp_code" value="">
        ${fields}
        <button type="submit">${esc(L("ලියාපදිංචි කරන්න", "பதிவு செய்", "Register"))}</button>
        <div id="form-msg"></div>
      </form>
    </section>`;
  paintSubjects(null);
}

function applicantName(row) {
  return row.stf_Name || row.tratt_name || row.tapp_officerNid || "";
}

function namedPlans(items) {
  return (items || []).filter((item) => String(item.atp_trname || "").trim());
}

function programmeSelect(items, selected) {
  const blank = `<option value="">${esc(L("පුහුණු වැඩසටහන තෝරන්න", "பயிற்சியைத் தேர்ந்தெடுக்க", "Choose a programme"))}</option>`;
  return blank + namedPlans(items).map((item) => `<option value="${esc(item.atp_id)}" ${String(item.atp_id) === String(selected) ? "selected" : ""}>${esc(item.atp_trname)} · ${esc(showDate(item.atp_day1))}</option>`).join("");
}

function applicantProgrammes(items) {
  const today = localToday();
  return namedPlans(items).filter((item) => {
    const start = showDate(item.atp_day1);
    return start && start > today;
  }).sort((a, b) => showDate(a.atp_day1).localeCompare(showDate(b.atp_day1)) || Number(b.atp_id) - Number(a.atp_id));
}

function programmeEndDay(item) {
  const days = [];
  for (let n = 1; n <= 10; n += 1) days.push(showDate(item["atp_day" + n]));
  planLines(item.atp_moredays).forEach((extra) => days.push(showDate(extra)));
  return days.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)).sort().pop() || "";
}

function activeProgrammes(items, keep) {
  const today = localToday();
  return namedPlans(items).filter((item) => String(item.atp_id) === String(keep) || programmeEndDay(item) >= today && programmeEndDay(item) !== "")
    .sort((a, b) => showDate(a.atp_day1).localeCompare(showDate(b.atp_day1)) || Number(b.atp_id) - Number(a.atp_id));
}

function syncApplicantTicks() {
  const boxes = [...document.querySelectorAll(".applicant-fit [data-act=pick-one]")];
  const all = document.querySelector(".applicant-fit [data-act=pick-all]");
  if (!all) return;
  const picked = boxes.filter((box) => box.checked).length;
  all.checked = boxes.length > 0 && picked === boxes.length;
  all.indeterminate = picked > 0 && picked < boxes.length;
}

async function onPickChange(event) {
  const box = event.target;
  if (box instanceof HTMLInputElement && (box.name.endsWith("_new") || box.name === "rp_extra_new[]")) {
    const typed = box.value.trim();
    const select = box.parentElement?.querySelector("select");
    if (!typed || !select) return;
    document.querySelectorAll(".subject-row select").forEach((list) => {
      if (![...list.options].some((option) => option.value === typed)) list.add(new Option(typed, typed));
    });
    select.value = typed;
    box.value = "";
    return;
  }
  if (!(box instanceof HTMLInputElement)) return;
  if (box.dataset.act !== "pick-one" && box.dataset.act !== "pick-all") return;
  if (state.module === "applications") {
    if (box.dataset.act === "pick-all") {
      document.querySelectorAll(".applicant-fit [data-act=pick-one]").forEach((item) => {
        item.checked = box.checked;
        item.closest("tr")?.classList.toggle("is-picked", box.checked);
      });
    } else {
      box.closest("tr")?.classList.toggle("is-picked", box.checked);
    }
    syncApplicantTicks();
    return;
  }
  const selected = box.checked ? YES : NO;
  const ids = box.dataset.act === "pick-all"
    ? [...document.querySelectorAll(".applicant-fit [data-act=pick-one]")].map((item) => item.dataset.id)
    : [box.dataset.id];
  if (!ids.length) {
    box.checked = false;
    return;
  }
  box.disabled = true;
  try {
    await api("select-applicant", { method: "POST", body: { ids, selected } });
    const marked = box.dataset.act === "pick-all" ? box.checked : box.checked;
    const targets = box.dataset.act === "pick-all"
      ? document.querySelectorAll(".applicant-fit [data-act=pick-one]")
      : [box];
    targets.forEach((item) => {
      item.checked = marked;
      item.closest("tr")?.classList.toggle("is-picked", marked);
    });
    syncApplicantTicks();
  } catch (error) {
    box.checked = !box.checked;
    alert(error.message);
  } finally {
    box.disabled = false;
  }
}

async function renderApplications(work) {
  const programmes = await api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } });
  const open = applicantProgrammes(programmes.items || []);
  const asked = state.query?.get("atp") || "";
  const programme = open.find((item) => String(item.atp_id) === String(asked));
  const atp = programme ? asked : "";
  const list = atp ? await api("applicants", { query: { atp } }) : { items: [] };
  const admin = state.user.role === "Administrator";
  const canPick = admin || state.user.role === "Super User";
  const items = list.items || [];
  const rows = items.map((row, index) => {
    const chosen = row.tapp_isselected === YES;
    const tick = canPick
      ? `<input class="tick" type="checkbox" data-act="pick-one" data-id="${esc(row.tapp_id)}" ${chosen ? "checked" : ""} aria-label="${esc(L("තෝරන්න", "தேர்ந்தெடு", "Select"))}">`
      : (chosen ? "✓" : "");
    return `<tr class="${chosen ? "is-picked" : ""}">
      <td>${index + 1}</td>
      <td>${esc(showDate(row.tapp_applieddate))}</td>
      <td class="wrap-cell">${esc(row.tapp_trname)}</td>
      <td>${esc(showDate(row.tapp_trstartdate))}</td>
      <td>${esc(row.tapp_officerNid)}</td>
      <td class="wrap-cell">${esc(applicantName(row))}</td>
      <td class="wrap-cell">${esc(row.stf_desig || row.tratt_desig)}</td>
      <td class="wrap-cell">${esc(row.tapp_office)}</td>
      <td>${esc(row.stf_mobile || row.tratt_mobile)}</td>
      <td class="wrap-cell">${esc(row.tapp_priority)}</td>
      <td class="wrap-cell">${esc(row.tapp_accomodation)}</td>
      <td class="tick-cell">${tick}</td>
      ${admin ? `<td><button class="text-btn small" type="button" data-act="admin-drop" data-id="${esc(row.tapp_id)}">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button></td>` : ""}
    </tr>`;
  }).join("");
  const cols = 12 + (admin ? 1 : 0);
  const pickHead = canPick
    ? `<input class="tick" type="checkbox" data-act="pick-all" aria-label="${esc(L("සියල්ල තෝරන්න", "அனைத்தையும் தேர்ந்தெடு", "Select all"))}">`
    : "";
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("ඉල්ලීම් කළ අය", "விண்ணப்பதாரர்கள்", "Applicants"))}${programme ? ` — ${esc(programme.atp_trname)}` : ""}</h2>
    <form class="sheet-tools" id="pick-programme">
      <select name="atp">${programmeSelect(open, atp)}</select>
      <button type="submit">${esc(L("පෙන්වන්න", "காட்டு", "Show"))}</button>
    </form>
    ${canPick && items.length ? `<form class="sheet-tools" id="include-picked">
      <button type="submit">${esc(L("ඇතුළත් කරන්න", "சேர்க்க", "Include"))}</button>
      <span id="form-msg"></span>
    </form>
    <p class="pick-note">${esc(L("හිසේ හරි ලකුණෙන් සියල්ල තෝරන්න. පේළියේ ලකුණෙන් එක් අයෙක් හෝ කිහිප දෙනෙක් තෝරන්න. ඊට පස්සේ ඇතුළත් කරන්න ඔබන්න. තෝරාගත් අය කොළ පාටින් පෙනේ.", "குறியிட்டு சேர்க்க என்பதை அழுத்தவும். தேர்ந்தவர் பச்சை நிறத்தில் தெரிவர்.", "Tick the people, then press Include. Selected people are shown in green."))}</p>` : ""}
    <div class="table-wrap desig-list applicant-fit"><table>
      <colgroup>
        <col class="col-no"><col class="col-date"><col class="col-programme"><col class="col-date"><col class="col-nid">
        <col class="col-person"><col class="col-person"><col class="col-person"><col class="col-phone"><col class="col-short"><col class="col-short"><col class="col-tick">
        ${admin ? `<col class="col-drop">` : ""}
      </colgroup>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
        <th class="wrap-cell">${esc(L("වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ආරම්භය", "தொடக்கம்", "Starts"))}</th>
        <th>${esc(L("හැඳුනුම්පත", "அடையாள எண்", "ID"))}</th>
        <th class="wrap-cell">${esc(L("නම", "பெயர்", "Name"))}</th>
        <th class="wrap-cell">${esc(L("තනතුර", "பதவி", "Designation"))}</th>
        <th class="wrap-cell">${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
        <th>${esc(L("දුරකථනය", "தொலைபேசி", "Phone"))}</th>
        <th class="wrap-cell">${esc(L("ප්‍රමුඛතාව", "முன்னுரிமை", "Priority"))}</th>
        <th class="wrap-cell">${esc(L("නවාතැන", "தங்குமிடம்", "Stay"))}</th>
        <th class="tick-cell">${pickHead}</th>
        ${admin ? "<th></th>" : ""}
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="${cols}">${esc(atp ? L("අයදුම් කිසිවක් නොමැත.", "விண்ணப்பங்கள் இல்லை.", "No applications.") : L("පුහුණු වැඩසටහනක් තෝරන්න.", "ஒரு பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme."))}</td></tr>`}</tbody>
    </table></div>`;
  syncApplicantTicks();
}

function programmeDayCount(item) {
  if (!item) return 0;
  let count = 0;
  for (let n = 1; n <= 10; n += 1) if (showDate(item["atp_day" + n])) count += 1;
  planLines(item.atp_moredays).forEach((extra) => { if (showDate(extra)) count += 1; });
  if (count) return count;
  const planned = Number(item.atp_noofdays);
  return planned > 0 ? planned : 0;
}

function selectedProgrammes(items, ids) {
  const today = localToday();
  const picked = new Set((ids || []).map(String));
  return namedPlans(items).filter((item) => {
    if (!picked.has(String(item.atp_id))) return false;
    const end = programmeEnd(item);
    return !end || end >= today;
  }).sort((a, b) => showDate(a.atp_day1).localeCompare(showDate(b.atp_day1)) || Number(a.atp_id) - Number(b.atp_id));
}

async function renderAttendance(work) {
  const [programmes, picked] = await Promise.all([
    api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } }),
    api("selected-programmes"),
  ]);
  const open = selectedProgrammes(programmes.items || [], picked.ids || []);
  const asked = state.query?.get("atp") || "";
  const programme = open.find((item) => String(item.atp_id) === String(asked));
  const atp = programme ? asked : "";
  const list = atp ? await api("applicants", { query: { atp, selected: "1" } }) : { items: [] };
  const totalDays = programmeDayCount(programme);
  const rows = (list.items || []).map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td class="wrap-cell">${esc(row.tapp_trname)}</td>
    <td>${esc(row.tapp_officerNid)}</td>
    <td class="wrap-cell">${esc(applicantName(row))}</td>
    <td class="wrap-cell">${esc(row.tapp_office)}</td>
    <td class="wrap-cell">${esc(row.stf_desig || row.tratt_desig)}</td>
    <td>${esc(row.stf_mobile || row.tratt_mobile)}</td>
    <td>${esc(totalDays)}</td>
    <td>${esc(row.tapp_accomodation)}</td>
  </tr>`).join("");
  const options = `<option value="">${esc(L("පුහුණු වැඩසටහන තෝරන්න", "பயிற்சியைத் தேர்ந்தெடுக்க", "Choose a programme"))}</option>`
    + open.map((item) => `<option value="${esc(item.atp_id)}" ${String(item.atp_id) === String(atp) ? "selected" : ""}>${esc(item.atp_trname)}</option>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("පුහුණු වැඩමුළු සඳහා තෝරාගත් නිලධාරීන්", "பயிற்சிப் பட்டறைக்குத் தேர்ந்த அதிகாரிகள்", "Officers selected for the workshops"))}</h2>
    <form class="sheet-tools" id="pick-programme">
      <label>${esc(L("පුහුණු වැඩසටහන තෝරන්න", "பயிற்சியைத் தேர்ந்தெடுக்க", "Choose a programme"))}</label>
      <select name="atp">${options}</select>
      <button type="submit">${esc(L("පෙන්වන්න", "காட்டு", "Show"))}</button>
    </form>
    ${atp ? `<p class="candidate-foot"><a href="#console/signsheet?atp=${esc(atp)}">${esc(L("අත්සන් ලේඛනය", "கையொப்பப் பட்டியல்", "Sign sheet"))}</a></p>` : ""}
    ${atp ? `<div class="candidate-head">
      <span></span>
      <strong>${esc(L("තෝරාගත් නිලධාරීන්", "தேர்ந்த அதிகாரிகள்", "Selected officers"))}</strong>
      <button type="button" data-act="candidate-phones" data-atp="${esc(atp)}">${esc(L("දුරකථන අංක", "தொலைபேசி எண்கள்", "Phone numbers"))}</button>
    </div>
    <div id="phone-paper"></div>` : `<div id="phone-paper"></div>`}
    <div class="table-wrap desig-list applicant-fit"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th class="wrap-cell">${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ඉල්ලූම් කළ නිලධාරියාගේ ජා.හැ.අං.", "அதிகாரி அடையாள எண்", "Officer national ID"))}</th>
        <th class="wrap-cell">${esc(L("නිලධාරියාගේ නම", "அதிகாரி பெயர்", "Officer name"))}</th>
        <th class="wrap-cell">${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
        <th class="wrap-cell">${esc(L("තනතුර", "பதவி", "Designation"))}</th>
        <th>${esc(L("දුරකථන අංකය", "தொலைபேசி எண்", "Phone number"))}</th>
        <th>${esc(L("සම්පූර්ණ දින ගණන", "மொத்த நாட்கள்", "Total days"))}</th>
        <th>${esc(L("නවාතැන් පහසුකම්", "தங்குமிட வசதி", "Accommodation"))}</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="9">${esc(atp ? L("තෝරාගත් නිලධාරීන් නොමැත.", "தேர்ந்த அதிகாரிகள் இல்லை.", "No selected officers.") : L("පුහුණු වැඩසටහනක් තෝරන්න.", "ஒரு பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme."))}</td></tr>`}</tbody>
    </table></div>`;
}

function provisionFields() {
  return [
    ["pv_total", "වර්ෂය සඳහා වෙන් වූ මුළු ප්‍රතිපාදන ප්‍රමාණය", "ஆண்டுக்கான மொத்த ஒதுக்கீடு", "Total allocation set aside for the year"],
    ["pv_general", "පොදු පුහුණු වැඩසටහන් සඳහා ප්‍රතිපාදන", "பொதுப் பயிற்சிகளுக்கான ஒதுக்கீடு", "Allocation for general training programmes"],
    ["pv_department", "දෙපාර්තමේන්තු පුහුණු වැඩසටහන් සඳහා වෙන් වූ ප්‍රතිපාදන", "திணைக்களப் பயிற்சிகளுக்கான ஒதுக்கீடு", "Allocation for departmental training programmes"],
    ["pv_special", "විශේෂ පුහුණු වැඩසටහන් සඳහා වෙන් වූ ප්‍රතිපාදන", "சிறப்புப் பயிற்சிகளுக்கான ஒதுக்கீடு", "Allocation for special training programmes"],
    ["pv_language", "භාෂා වැඩසටහන් සඳහා වෙන් වූ ප්‍රතිපාදන", "மொழி நிகழ்ச்சிகளுக்கான ஒதுக்கீடு", "Allocation for language programmes"],
    ["pv_drug", "මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන ඒකකය සඳහා වෙන් වූ ප්‍රතිපාදන", "போதைத் தடுப்பு மற்றும் ஆலோசனை அலகுக்கான ஒதுக்கீடு", "Allocation for the drug prevention and counselling unit"],
    ["pv_external", "බාහිර පුහුණු පාඨමාලා සඳහා වෙන් වූ ප්‍රතිපාදන", "வெளிப்புற பயிற்சிப் படிப்புகளுக்கான ஒதுக்கீடு", "Allocation for external training courses"],
    ["pv_meeting", "රැස්වීම් සඳහා වෙන් වූ ප්‍රතිපාදන", "கூட்டங்களுக்கான ஒதுக்கீடு", "Allocation for meetings"],
    ["pv_other", "වෙනත් ප්‍රතිපාදන", "பிற ஒதுக்கீடு", "Other allocations"],
  ];
}

function provisionTabs(tab) {
  return `<div class="desig-tabs">
    <a class="${tab === "report" ? "on" : ""}" href="#console/provision?tab=report">${esc(L("සුරැකි ප්‍රතිපාදන", "சேமித்த ஒதுக்கீடு", "Saved allocations"))}</a>
    <a class="${tab === "edit" ? "on" : ""}" href="#console/provision?tab=edit">${esc(L("ප්‍රතිපාදන", "ஒதுக்கீடு", "Allocations"))}</a>
    <a class="${tab === "move" ? "on" : ""}" href="#console/provision?tab=move">${esc(L("ප්‍රතිපාදන මාරු කිරීම", "ஒதுக்கீட்டு மாற்றம்", "Allocation transfers"))}</a>
    <a class="${tab === "sendreport" ? "on" : ""}" href="#console/provision?tab=sendreport">${esc(L("මාරු කිරීම් වාර්තාව", "மாற்ற அறிக்கை", "Transfer report"))}</a>
  </div>`;
}

function provisionSendKinds() {
  return [
    ["general", "පොදු", "பொது", "General"],
    ["special", "විශේෂ", "சிறப்பு", "Special"],
    ["department", "දෙපාර්තමේන්තු", "திணைக்களம்", "Departmental"],
  ];
}

function provisionSendKindLabel(id) {
  const row = provisionSendKinds().find((item) => item[0] === id);
  return row ? L(row[1], row[2], row[3]) : id;
}

function provisionSendTable(data, canAct) {
  const items = data.items || [];
  const rows = items.map((row, index) => `<tr>
      <td>${index + 1}</td>
      <td class="wrap-cell">${esc(row.plan)}</td>
      <td class="wrap-cell">${esc(row.name)}</td>
      <td class="wrap-cell">${esc(row.office)}</td>
      <td>${esc(showDate(row.moved))}</td>
      <td>${esc(progressMoney(row.amount))}</td>
      <td>${esc(provisionSendKindLabel(row.kind))}</td>
      <td class="wrap-cell">${esc(row.letter)}</td>
      <td>${esc(showDate(row.date))}</td>
      ${canAct ? `<td>
        <a class="text-btn small" href="#console/provision?tab=move&year=${esc(data.year)}&send=${esc(row.id)}">${esc(L("සංස්කරණය", "திருத்து", "Edit"))}</a>
        <button type="button" class="text-btn small" data-act="provision-send-delete" data-id="${esc(row.id)}">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button>
      </td>` : ""}
    </tr>`).join("");
  return `<div class="table-wrap desig-list provision-moves"><table>
      <thead><tr>
        <th>#</th>
        <th>${esc(L("සැලසුම් අංකය", "திட்ட எண்", "Plan number"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி நிகழ்ச்சி", "Training programme"))}</th>
        <th>${esc(L("මාරු කළ ආයතනය", "மாற்றிய நிறுவனம்", "Institution transferred to"))}</th>
        <th>${esc(L("මාරු කළ දිනය", "மாற்றிய திகதி", "Transfer date"))}</th>
        <th>${esc(L("මුදල", "தொகை", "Amount"))}</th>
        <th>${esc(L("වැඩසටහන් වර්ගය", "நிகழ்ச்சி வகை", "Programme type"))}</th>
        <th>${esc(L("ලිපියේ අංකය", "கடித எண்", "Letter number"))}</th>
        <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
        ${canAct ? "<th></th>" : ""}
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="${canAct ? 10 : 9}">${esc(L("මේ වර්ෂයේ මාරු කිරීම් නැත.", "இந்த ஆண்டில் மாற்றங்கள் இல்லை.", "No transfers this year."))}</td></tr>`}</tbody>
      <tfoot><tr>
        <th colspan="5">${esc(L("ප්‍රතිපාදන මාරු කළ මුදලේ එකතුව", "மாற்றிய ஒதுக்கீட்டு மொத்தம்", "Total amount transferred"))}</th>
        <th>${esc(progressMoney(data.total))}</th>
        <th colspan="${canAct ? 4 : 3}"></th>
      </tr></tfoot>
    </table></div>`;
}

function bindProvisionSendForm(work, data) {
  const form = work.querySelector("#provision-send-form");
  const pick = form?.querySelector("[name=atp]");
  if (!form || !pick) return;
  pick.addEventListener("change", () => {
    const plan = (data.plans || []).find((item) => String(item.id) === pick.value);
    if (!plan) return;
    form.querySelector("[name=plan]").value = plan.planNo || "";
    form.querySelector("[name=name]").value = plan.name || "";
    if (plan.kind) form.querySelector("[name=kind]").value = plan.kind;
  });
}

function provisionSendFormHtml(data) {
  const year = data.year;
  const row = data.item || {};
  const kinds = provisionSendKinds().map((item) => `<option value="${esc(item[0])}"${row.kind === item[0] ? " selected" : ""}>${esc(L(item[1], item[2], item[3]))}</option>`).join("");
  const plans = [`<option value="">${esc(L("සැලසුමක් තෝරන්න", "திட்டத்தைத் தேர்ந்தெடுக்கவும்", "Choose a plan"))}</option>`]
    .concat((data.plans || []).map((item) => `<option value="${esc(item.id)}"${String(row.atp) === String(item.id) ? " selected" : ""}>${esc(item.planNo || item.id)} — ${esc(item.name)}</option>`))
    .join("");
  const offices = (state.options?.offices || []).map((item) => `<option value="${esc(item.of_name)}"></option>`).join("");
  return `
    <form class="classic-form old-plan" id="provision-send-form">
      <input type="hidden" name="year" value="${esc(year)}">
      <input type="hidden" name="id" value="${esc(row.id || "")}">
      <div class="annual-sheet">
        <div class="annual-col">
          <label class="classic-field"><span>${esc(L("සැලසුම් අංකය", "திட்ட எண்", "Plan number"))}</span>
            <span class="plan-add-row"><select name="atp">${plans}</select></span>
          </label>
          <label class="classic-field"><span>${esc(L("සැලසුම් අංකය (අතින්)", "திட்ட எண் (கைமுறை)", "Plan number (typed)"))}</span><input name="plan" value="${esc(row.plan || "")}"></label>
          <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி நிகழ்ச்சி", "Training programme"))}</span><input name="name" value="${esc(row.name || "")}" required></label>
          <label class="classic-field"><span>${esc(L("මාරු කළ ආයතනය", "மாற்றிய நிறுவனம்", "Institution transferred to"))}</span><input name="office" list="provision-send-offices" value="${esc(row.office || "")}" required></label>
          <datalist id="provision-send-offices">${offices}</datalist>
        </div>
        <div class="annual-col">
          <label class="classic-field"><span>${esc(L("මාරු කළ දිනය", "மாற்றிய திகதி", "Transfer date"))}</span><input type="date" name="moved" value="${esc(row.moved || localToday())}" required></label>
          <label class="classic-field"><span>${esc(L("මුදල (රු.)", "தொகை (ரூ.)", "Amount (Rs.)"))}</span><input name="amount" inputmode="decimal" value="${esc(row.amount || "")}" required></label>
          <label class="classic-field"><span>${esc(L("වැඩසටහන් වර්ගය", "நிகழ்ச்சி வகை", "Programme type"))}</span><select name="kind" required><option value="">—</option>${kinds}</select></label>
          <label class="classic-field"><span>${esc(L("ලිපියේ අංකය", "கடித எண்", "Letter number"))}</span><input name="letter" maxlength="120" value="${esc(row.letter || "")}"></label>
          <label class="classic-field"><span>${esc(L("දිනය", "திகதி", "Date"))}</span><input type="date" name="date" value="${esc(row.date || "")}"></label>
        </div>
      </div>
      <button type="submit">${esc(row.id ? L("යාවත්කාලීන කරන්න", "புதுப்பி", "Update") : L("ඇතුළත් කරන්න", "சேர்", "Add"))}</button>
      ${row.id ? `<a class="btn secondary" href="#console/provision?tab=move&year=${esc(year)}">${esc(L("අලුත් පෝරමය", "புதிய படிவம்", "New form"))}</a>` : ""}
      <div id="form-msg"></div>
    </form>`;
}

function provisionLabel(key) {
  if (key === "new") return L("අලුත් ප්‍රතිපාදන", "புதிய ஒதுக்கீடு", "New allocation");
  const field = provisionFields().find((item) => item[0] === `pv_${key}`);
  return field ? L(field[1], field[2], field[3]) : key;
}

async function renderProvisionMove(work, asked) {
  const sendId = state.query?.get("send") || "";
  const [data, sends] = await Promise.all([
    api("provision-moves", { query: { year: asked } }),
    api("provision-sends", { query: { year: asked, id: sendId } }),
  ]);
  const year = data.year || asked;
  const lines = data.lines || [];
  const moves = data.moves || [];
  const options = lines.map((line) => `<option value="${esc(line.id)}">${esc(provisionLabel(line.id))} (${esc(progressMoney(line.current))})</option>`).join("");
  const years = yearChoices().map((item) => `<option value="${esc(item)}"${item === year ? " selected" : ""}>${esc(item)}</option>`).join("");
  const sum = (key) => lines.reduce((total, line) => total + advanceNumber(line[key]), 0);
  const added = moves.reduce((total, move) => total + (move.from === "new" ? advanceNumber(move.amount) : 0), 0);
  const changeCell = (value) => {
    const number = advanceNumber(value);
    if (Math.abs(number) < 0.005) return "-";
    return `${number > 0 ? "+" : "−"}${progressMoney(Math.abs(number))}`;
  };
  const table = lines.map((line) => `<tr>
      <td class="wrap-cell">${esc(provisionLabel(line.id))}</td>
      <td>${esc(progressMoney(line.original))}</td>
      <td class="${advanceNumber(line.change) < 0 ? "move-out" : advanceNumber(line.change) > 0 ? "move-in" : ""}">${esc(changeCell(line.change))}</td>
      <td><b>${esc(progressMoney(line.current))}</b></td>
    </tr>`).join("");
  const history = moves.map((move, index) => `<tr>
      <td>${index + 1}</td>
      <td>${esc(move.date)}</td>
      <td class="wrap-cell">${esc(provisionLabel(move.from))}</td>
      <td class="wrap-cell">${esc(provisionLabel(move.to))}</td>
      <td>${esc(progressMoney(move.amount))}</td>
      <td class="wrap-cell">${esc(move.ref)}</td>
      <td class="wrap-cell">${esc(move.note)}</td>
      <td>${esc(move.by)}</td>
      ${data.canDelete ? `<td><button type="button" class="text-btn small" data-act="provision-move-delete" data-id="${esc(move.id)}">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button></td>` : ""}
    </tr>`).join("");
  work.innerHTML = `
    ${provisionTabs("move")}
    <h2 class="classic-title">${esc(L("ප්‍රතිපාදන මාරු කිරීම", "ஒதுக்கீட்டு மாற்றம்", "Allocation transfers"))}</h2>
    <form class="sheet-tools" id="provision-move-year">
      <label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))}</label>
      <select name="year">${years}</select>
      <button type="submit">${esc(L("පෙන්වන්න", "காட்டு", "Show"))}</button>
    </form>
    <h3 class="classic-title">${esc(L("ආයතනයකට ප්‍රතිපාදන මාරු කිරීම", "நிறுவனத்துக்கு ஒதுக்கீடு மாற்றுதல்", "Transfer an allocation to an institution"))}</h3>
    ${provisionSendFormHtml({ ...sends, year })}
    <h3 class="classic-title">${esc(L("මාරු කළ ප්‍රතිපාදන", "மாற்றிய ஒதுக்கீடு", "Transferred allocations"))} · ${esc(year)}</h3>
    ${provisionSendTable(sends, true)}
    <p class="scheduled-copy">
      <a class="btn secondary" href="#console/provision?tab=sendreport&year=${esc(year)}">${esc(L("වාර්තාව බලන්න", "அறிக்கையைப் பார்", "Open report"))}</a>
      <button type="button" data-act="provision-send-csv">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
    </p>
    ${data.saved ? `
    <div class="provision-actions">
      <section class="provision-box">
        <h3 class="classic-title">${esc(L("ප්‍රතිපාදන මාරු කිරීම", "ஒதுக்கீட்டு மாற்றம்", "Transfer an allocation"))}</h3>
        <p class="pad-note">${esc(L("එක් ප්‍රතිපාදනයකින් තවත් ප්‍රතිපාදනයකට මුදල් මාරු කරන්න.", "ஒரு ஒதுக்கீட்டிலிருந்து மற்றொன்றுக்கு தொகையை மாற்றவும்.", "Move money from one allocation to another."))}</p>
        <form class="classic-form old-plan" id="provision-move-form">
          <input type="hidden" name="year" value="${esc(year)}">
          <label class="classic-field"><span>${esc(L("දිනය", "திகதி", "Date"))}</span><input type="date" name="date" value="${esc(localToday())}" required></label>
          <label class="classic-field"><span>${esc(L("මාරු කරන ප්‍රතිපාදනය (කොහෙන්ද)", "எந்த ஒதுக்கீட்டிலிருந்து", "Move from"))}</span><select name="from" required>${options}</select></label>
          <label class="classic-field"><span>${esc(L("ලැබෙන ප්‍රතිපාදනය (කොහාටද)", "எந்த ஒதுக்கீட்டுக்கு", "Move to"))}</span><select name="to" required>${options}</select></label>
          <label class="classic-field"><span>${esc(L("මුදල (රු.)", "தொகை (ரூ.)", "Amount (Rs.)"))}</span><input name="amount" inputmode="decimal" required></label>
          <label class="classic-field"><span>${esc(L("ලිපි / අනුමැතිය අංකය", "கடித / அனுமதி எண்", "Letter / approval number"))}</span><input name="ref" maxlength="120"></label>
          <label class="classic-field"><span>${esc(L("හේතුව / සටහන", "காரணம் / குறிப்பு", "Reason / note"))}</span><textarea name="note" rows="2" maxlength="1000"></textarea></label>
          <button type="submit">${esc(L("මාරු කරන්න", "மாற்று", "Transfer"))}</button>
          <div id="form-msg"></div>
        </form>
      </section>
      <section class="provision-box provision-box-add">
        <h3 class="classic-title">${esc(L("අලුත් ප්‍රතිපාදන ඇතුළත් කිරීම", "புதிய ஒதுக்கீடு சேர்த்தல்", "Enter a new allocation"))}</h3>
        <p class="pad-note">${esc(L("වර්ෂය මැද ලැබෙන අලුත් හෝ අතිරේක ප්‍රතිපාදන මෙහි ඇතුළත් කරන්න. මුල් ප්‍රතිපාදන වෙනස් නොවේ.", "ஆண்டின் நடுவில் வரும் புதிய அல்லது கூடுதல் ஒதுக்கீட்டை இங்கே சேர்க்கவும். ஆரம்ப ஒதுக்கீடு மாறாது.", "Enter a new or extra allocation received during the year. The original amounts stay the same."))}</p>
        <form class="classic-form old-plan" id="provision-add-form">
          <input type="hidden" name="year" value="${esc(year)}">
          <input type="hidden" name="from" value="new">
          <label class="classic-field"><span>${esc(L("දිනය", "திகதி", "Date"))}</span><input type="date" name="date" value="${esc(localToday())}" required></label>
          <label class="classic-field"><span>${esc(L("ලැබෙන ප්‍රතිපාදනය", "சேர்க்கும் ஒதுக்கீடு", "Add to"))}</span><select name="to" required>${options}</select></label>
          <label class="classic-field"><span>${esc(L("මුදල (රු.)", "தொகை (ரூ.)", "Amount (Rs.)"))}</span><input name="amount" inputmode="decimal" required></label>
          <label class="classic-field"><span>${esc(L("ලිපි / අනුමැතිය අංකය", "கடித / அனுமதி எண்", "Letter / approval number"))}</span><input name="ref" maxlength="120"></label>
          <label class="classic-field"><span>${esc(L("හේතුව / සටහන", "காரணம் / குறிப்பு", "Reason / note"))}</span><textarea name="note" rows="2" maxlength="1000"></textarea></label>
          <button type="submit">${esc(L("ඇතුළත් කරන්න", "சேர்", "Add"))}</button>
          <div id="form-msg"></div>
        </form>
      </section>
    </div>` : `<p class="pad-note">${esc(L("මේ වර්ෂයට ප්‍රතිපාදන තවම සුරැකලා නැහැ. පළමුව ප්‍රතිපාදන ටැබ් එකෙන් ඇතුළත් කරන්න.", "இந்த ஆண்டுக்கு ஒதுக்கீடு சேமிக்கவில்லை. முதலில் ஒதுக்கீடு தாவலில் சேர்க்கவும்.", "No allocations are saved for this year yet. Enter them on the Allocations tab first."))}</p>`}
    <h3 class="classic-title">${esc(L("ප්‍රතිපාදන සාරාංශය", "ஒதுக்கீட்டுச் சுருக்கம்", "Allocation summary"))} · ${esc(year)}</h3>
    <div class="table-wrap desig-list provision-moves"><table>
      <thead><tr>
        <th>${esc(L("ප්‍රතිපාදනය", "ஒதுக்கீடு", "Allocation"))}</th>
        <th>${esc(L("මුල් ප්‍රතිපාදනය", "ஆரம்ப ஒதுக்கீடு", "Original"))}</th>
        <th>${esc(L("මාරු කිරීම් (+/−)", "மாற்றம் (+/−)", "Transfers (+/−)"))}</th>
        <th>${esc(L("වත්මන් ප්‍රතිපාදනය", "தற்போதைய ஒதுக்கீடு", "Current"))}</th>
      </tr></thead>
      <tbody>${table}</tbody>
      <tfoot><tr><th>${esc(L("එකතුව", "மொத்தம்", "Total"))}</th><th>${esc(progressMoney(sum("original")))}</th><th class="${added > 0.004 ? "move-in" : ""}">${added > 0.004 ? `+${esc(progressMoney(added))}` : "-"}</th><th>${esc(progressMoney(sum("current")))}</th></tr></tfoot>
    </table></div>
    <h3 class="classic-title">${esc(L("මාරු කිරීම් ඉතිහාසය", "மாற்ற வரலாறு", "Transfer history"))}</h3>
    <div class="table-wrap desig-list provision-moves"><table>
      <thead><tr>
        <th>#</th>
        <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
        <th>${esc(L("කොහෙන්ද", "இருந்து", "From"))}</th>
        <th>${esc(L("කොහාටද", "க்கு", "To"))}</th>
        <th>${esc(L("මුදල", "தொகை", "Amount"))}</th>
        <th>${esc(L("ලිපි අංකය", "கடித எண்", "Reference"))}</th>
        <th>${esc(L("සටහන", "குறிப்பு", "Note"))}</th>
        <th>${esc(L("කළේ", "செய்தவர்", "By"))}</th>
        ${data.canDelete ? "<th></th>" : ""}
      </tr></thead>
      <tbody>${history || `<tr><td colspan="${data.canDelete ? 9 : 8}">${esc(L("මේ වර්ෂයේ මාරු කිරීම් නැත.", "இந்த ஆண்டில் மாற்றங்கள் இல்லை.", "No transfers this year."))}</td></tr>`}</tbody>
    </table></div>`;
  const to = work.querySelector("#provision-move-form [name=to]");
  if (to && to.options.length > 1 && !to.value) to.selectedIndex = 1;
  bindProvisionSendForm(work, sends);
  state.provisionSends = sends;
}

async function renderProvisionSendReport(work, asked) {
  const data = await api("provision-sends", { query: { year: asked } });
  const year = data.year || asked;
  const years = yearChoices().map((item) => `<option value="${esc(item)}"${item === year ? " selected" : ""}>${esc(item)}</option>`).join("");
  state.provisionSends = data;
  work.innerHTML = `
    ${provisionTabs("sendreport")}
    <form class="sheet-tools no-print" id="provision-move-year">
      <label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))}</label>
      <select name="year">${years}</select>
      <button type="submit">${esc(L("පෙන්වන්න", "காட்டு", "Show"))}</button>
    </form>
    <article class="letter provision-send-report" id="provision-send-report">
      <h2>${esc(L("ප්‍රතිපාදන මාරු කිරීම් වාර්තාව", "ஒதுக்கீட்டு மாற்ற அறிக்கை", "Allocation transfer report"))}</h2>
      <p class="name-meta"><span>${esc(L("කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය - වයඹ පළාත", "முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு - வடமேல் மாகாணம்", "Management Development and Training Unit - North Western Province"))}</span>
        <span>${esc(year)}</span></p>
      ${provisionSendTable(data, false)}
    </article>
    <p class="scheduled-copy no-print">
      <button type="button" onclick="window.print()">${esc(L("මුද්‍රණය / PDF", "அச்சு / PDF", "Print / PDF"))}</button>
      <button type="button" data-act="provision-send-csv">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
    </p>`;
}

async function renderProvision(work) {
  const askedTab = state.query?.get("tab");
  const tab = askedTab === "edit" || askedTab === "move" || askedTab === "sendreport" ? askedTab : "report";
  const asked = state.query?.get("year") || chosenYear();
  if (tab === "move") return renderProvisionMove(work, asked);
  if (tab === "sendreport") return renderProvisionSendReport(work, asked);
  const query = { year: asked };
  const data = await api("provision", { query });
  const year = data.year || asked;
  const row = data.item || {};
  if (tab === "report") {
    const years = data.years || [];
    const options = years.map((item) => `<option value="${esc(item)}" ${item === year ? "selected" : ""}>${esc(item)}</option>`).join("");
    const current = data.current || {};
    const moved = Boolean(data.moved);
    const lines = provisionFields().map((field) => `<tr><td class="wrap-cell">${esc(L(field[1], field[2], field[3]))}</td><td>${esc(row[field[0]] || "")}</td>${moved ? `<td>${esc(progressMoney(advanceNumber(current[field[0]] ?? row[field[0]])))}</td>` : ""}</tr>`).join("");
    work.innerHTML = `
      ${provisionTabs(tab)}
      <h2 class="classic-title">${esc(L("සුරැකි ප්‍රතිපාදන", "சேமித்த ஒதுக்கீடு", "Saved allocations"))}</h2>
      ${years.length ? `<form class="sheet-tools" id="provision-year">
        <label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))}</label>
        <select name="year">${options}</select>
        <button type="submit">${esc(L("පෙන්වන්න", "காட்டு", "Show"))}</button>
        <a class="btn small" href="#console/provision?tab=edit&year=${esc(year)}">${esc(L("සංස්කරණය කරන්න", "திருத்து", "Edit"))}</a>
      </form>
      <div class="table-wrap desig-list"><table>
        <thead><tr>
          <th>${esc(L("ප්‍රතිපාදනය", "ஒதுக்கீடு", "Allocation"))}</th>
          <th>${esc(L("ප්‍රමාණය", "தொகை", "Amount"))} · ${esc(year)}</th>
          ${moved ? `<th>${esc(L("මාරු කිරීම් පසු", "மாற்றத்துக்குப் பின்", "After transfers"))}</th>` : ""}
        </tr></thead>
        <tbody>${lines}</tbody>
      </table></div>` : `<p class="pad-note">${esc(L("තවම සුරැකි ප්‍රතිපාදන නොමැත. ප්‍රතිපාදන ටැබ් එකෙන් ඇතුළත් කරන්න.", "இன்னும் ஒதுக்கீடு சேமிக்கவில்லை. ஒதுக்கீடு தாவலில் சேர்க்கவும்.", "Nothing has been saved yet. Enter the amounts on the Allocations tab."))}</p>`}`;
    return;
  }
  const money = (field) => `<label class="classic-field"><span>${esc(L(field[1], field[2], field[3]))}</span><input name="${esc(field[0])}" inputmode="decimal" value="${esc(row[field[0]] || "")}"></label>`;
  const fields = provisionFields();
  work.innerHTML = `
    ${provisionTabs(tab)}
    <h2 class="classic-title">${esc(L("ප්‍රතිපාදන", "ஒதுக்கீடு", "Allocations"))}</h2>
    <form class="classic-form old-plan" id="provision-form">
      <label class="classic-field"><span>${esc(L("වර්ෂය", "ஆண்டு", "Year"))}</span><input name="pv_year" inputmode="numeric" value="${esc(year)}"></label>
      <div class="annual-sheet">
        <div class="annual-col">${fields.slice(0, 5).map(money).join("")}</div>
        <div class="annual-col">${fields.slice(5).map(money).join("")}</div>
      </div>
      <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <div id="form-msg"></div>
    </form>`;
}

function advanceNumber(value) {
  const number = Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : 0;
}

function advanceMoney(value) {
  return advanceNumber(value).toFixed(2);
}

function paintAdvance(form) {
  if (!form) return;
  const advance = advanceNumber(form.querySelector("[name=advance]")?.value);
  const spent = advanceNumber(form.querySelector("[name=spent]")?.value);
  const balance = form.querySelector("[data-balance]");
  if (balance) balance.textContent = advanceMoney(advance - spent);
}

function advanceTabs(tab, atp) {
  const formHref = `#console/advance?tab=form${atp ? `&atp=${encodeURIComponent(atp)}` : ""}`;
  const reportHref = `#console/advance?tab=report${atp ? `&atp=${encodeURIComponent(atp)}` : ""}`;
  return `<div class="desig-tabs">
    <a class="${tab === "form" ? "on" : ""}" href="${formHref}">${esc(L("අත්තිකාරම් විස්තර", "முன்பண விவரம்", "Advance details"))}</a>
    <a class="${tab === "report" ? "on" : ""}" href="${reportHref}">${esc(L("සුරැකි අත්තිකාරම්", "சேமித்த முன்பணம்", "Saved advances"))}</a>
  </div>`;
}

function advanceField(label, control) {
  return `<label class="classic-field"><span>${esc(label)}</span>${control}</label>`;
}

async function renderAdvance(work) {
  const tab = state.query?.get("tab") === "report" ? "report" : "form";
  const atp = state.query?.get("atp") || "";
  if (tab === "report") {
    const asked = state.query?.get("year") || chosenYear();
    const data = await api("advances", { query: { year: asked } });
    const years = data.years || [];
    const year = data.year || "";
    const options = years.map((item) => `<option value="${esc(item)}" ${item === year ? "selected" : ""}>${esc(item)}</option>`).join("");
    const rows = (data.items || []).map((row) => `<tr>
      <td>${esc(showDate(row.date))}</td>
      <td class="wrap-cell">${esc(row.planNo)}</td>
      <td class="wrap-cell">${esc(row.name)}</td>
      <td class="wrap-cell">${esc(row.coordinator)}</td>
      <td class="wrap-cell">${esc(row.dates)}</td>
      <td>${esc(row.planEstimate)}</td>
      <td>${esc(row.prepared)}</td>
      <td>${esc(row.advance)}</td>
      <td>${esc(row.attended)}</td>
      <td>${esc(row.spent)}</td>
      <td>${esc(row.balance)}</td>
      <td>${esc(row.government)}</td>
      <td class="wrap-cell">${esc(row.receipt)}</td>
      <td><a href="#console/advance?tab=form&atp=${esc(row.id)}">${esc(L("සංස්කරණය කරන්න", "திருத்து", "Edit"))}</a></td>
    </tr>`).join("");
    const totals = data.totals || {};
    const totalRow = rows ? `<tr>
      <td><strong>${esc(L("එකතුව", "மொத்தம்", "Total"))}</strong></td>
      <td></td><td></td><td></td><td></td>
      <td><strong>${esc(totals.planEstimate || "0.00")}</strong></td>
      <td><strong>${esc(totals.prepared || "0.00")}</strong></td>
      <td><strong>${esc(totals.advance || "0.00")}</strong></td>
      <td><strong>${esc(totals.attended || 0)}</strong></td>
      <td><strong>${esc(totals.spent || "0.00")}</strong></td>
      <td><strong>${esc(totals.balance || "0.00")}</strong></td>
      <td><strong>${esc(totals.government || "0.00")}</strong></td>
      <td></td><td></td>
    </tr>` : "";
    work.innerHTML = `
      ${advanceTabs(tab, atp)}
      <h2 class="classic-title">${esc(L("සුරැකි අත්තිකාරම්", "சேமித்த முன்பணம்", "Saved advances"))}</h2>
      ${years.length ? `<form class="sheet-tools" id="advance-year">
        <label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))}</label>
        <select name="year">${options}</select>
      </form>
      <p class="pad-note">${esc(L("ඉතිරි මුදල = අත්තිකාරම් මුදල − වියදම් වූ මුදල. රාජ්‍ය භාගය වියදම ඇතුළේ තියෙන නිසා ආයෙත් එකතු කරන්නේ නැහැ. වර්ෂයේ එකතුව පහළින් තියෙනවා.", "மீதி = முன்பணம் − செலவு. அரசுப் பங்கு செலவுக்குள் உள்ளது. ஆண்டு மொத்தம் கீழே உள்ளது.", "Balance is the advance minus the amount spent. The government share is already inside the expenditure. The year total is at the bottom."))}</p>
      <div class="table-wrap desig-list"><table>
        <thead><tr>
          <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
          <th>${esc(L("පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number"))}</th>
          <th>${esc(L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"))}</th>
          <th>${esc(L("සම්බන්ධිකරණ නිලධාරියාගේ නම", "ஒருங்கிணைப்பாளர் பெயர்", "Coordinator"))}</th>
          <th>${esc(L("වැඩසටහන පවත්වන දින", "பயிற்சி நடைபெறும் நாட்கள்", "Programme dates"))}</th>
          <th>${esc(L("පුහුණු සැලැස්මේ ඇස්තමේන්තුව", "திட்ட மதிப்பீடு", "Plan estimate"))}</th>
          <th>${esc(L("සකස්කල ඇස්තමේන්තුව", "தயாரித்த மதிப்பீடு", "Prepared estimate"))}</th>
          <th>${esc(L("අත්තිකාරම් මුදල", "முன்பணம்", "Advance"))}</th>
          <th>${esc(L("සහභාගි වූ සංඛ්‍යාව", "பங்கேற்றோர்", "Attended"))}</th>
          <th>${esc(L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Spent"))}</th>
          <th>${esc(L("ඉතිරි මුදල", "மீதி", "Balance"))}</th>
          <th>${esc(L("රාජ්‍ය භාගය", "அரசுப் பங்கு", "Government share"))}</th>
          <th>${esc(L("රිසිටි අංකය", "ரசீது எண்", "Receipt number"))}</th>
          <th>${esc(L("සංස්කරණය", "திருத்தம்", "Edit"))}</th>
        </tr></thead>
        <tbody>${rows}${totalRow}</tbody>
      </table></div>` : `<p class="pad-note">${esc(L("තවම සුරැකි අත්තිකාරම් විස්තර නොමැත.", "இன்னும் முன்பண விவரம் சேமிக்கவில்லை.", "No advance details have been saved yet."))}</p>`}`;
    return;
  }
  if (!atp) {
    work.innerHTML = `
      ${advanceTabs(tab, "")}
      <h2 class="classic-title">${esc(L("අත්තිකාරම් විස්තර", "முன்பண விவரம்", "Advance details"))}</h2>
      <p class="pad-note">${esc(L("පුහුණු වැඩසටහනක් තෝරන්න.", "பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme."))}</p>`;
    return;
  }
  const data = await api("advance", { query: { atp } });
  const row = data.item || {};
  const locked = (value) => `<input value="${esc(value || "")}" readonly>`;
  work.innerHTML = `
    ${advanceTabs(tab, atp)}
    <h2 class="classic-title">${esc(L("අත්තිකාරම් විස්තර", "முன்பண விவரம்", "Advance details"))}</h2>
    <form class="classic-form old-plan" id="advance-form">
      <input type="hidden" name="atp" value="${esc(atp)}">
      <div class="annual-sheet">
        <div class="annual-col">
          ${advanceField(L("දිනය", "திகதி", "Date"), `<input type="date" name="date" value="${esc(showDate(row.date) || localToday())}">`)}
          ${advanceField(L("පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number"), locked(row.planNo))}
          ${advanceField(L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"), locked(row.name))}
          ${advanceField(L("සම්බන්ධිකරණ නිලධාරියාගේ නම", "ஒருங்கிணைப்பாளர் பெயர்", "Coordinator"), locked(row.coordinator))}
          ${advanceField(L("වැඩසටහන පවත්වන දින", "பயிற்சி நடைபெறும் நாட்கள்", "Programme dates"), locked(row.dates))}
          ${advanceField(L("පුහුණු සැලැස්මේ ඇස්තමේන්තුව", "திட்ட மதிப்பீடு", "Plan estimate"), locked(row.planEstimate))}
          ${advanceField(L("සකස්කල ඇස්තමේන්තුව", "தயாரித்த மதிப்பீடு", "Prepared estimate"), locked(row.prepared))}
        </div>
        <div class="annual-col">
          ${advanceField(L("අත්තිකාරම් මුදල", "முன்பணம்", "Advance"), `<input name="advance" inputmode="decimal" value="${esc(row.advance || "0")}">`)}
          ${advanceField(L("සහභාගි වූ සංඛ්‍යාව", "பங்கேற்றோர்", "Number who attended"), locked(row.attended ?? 0))}
          ${advanceField(L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Amount spent from the advance"), `<input name="spent" inputmode="decimal" value="${esc(row.spent || "0")}">`)}
          ${advanceField(L("ඉතිරි මුදල", "மீதி", "Balance"), `<output data-balance>${esc(row.balance || "0.00")}</output>`)}
          ${advanceField(L("රාජ්‍ය භාගය", "அரசுப் பங்கு", "Government share"), `<input name="government" inputmode="decimal" value="${esc(row.government || "0")}">`)}
          ${advanceField(L("රිසිටි අංකය", "ரசீது எண்", "Receipt number"), `<input name="receipt" value="${esc(row.receipt || "0")}">`)}
        </div>
      </div>
      <p class="pad-note">${esc(L("සහභාගි වූ සංඛ්‍යාව පැමිණීම තහවුරු කළ ලැයිස්තුවෙන්. රාජ්‍ය භාගය රාජ්‍ය සේවක සම්පත්දායක දීමනාවෙන් 10%. පුද්ගලික හා විශේෂිත කාණ්ඩ ගණන් නොගනී. ඒ මුදල වියදම ඇතුළේ තියෙනවා. ඉතිරි මුදල = අත්තිකාරම් මුදල − වියදම් වූ මුදල.", "பங்கேற்றோர் உறுதி செய்த பட்டியலில் இருந்து. அரசுப் பங்கு அரசு ஊழியர் வள ஆள் கொடுப்பனவின் 10%. தனியார் மற்றும் சிறப்புப் பிரிவு சேர்க்கப்படாது. அந்தத் தொகை செலவுக்குள் உள்ளது. மீதி = முன்பணம் − செலவு.", "The number who attended comes from the confirmed list. The government share is 10% of government officers' resource-person allowances. Private and special categories are not included. That amount is already inside the expenditure. Balance is the advance minus the amount spent."))}</p>
      <button type="submit">${esc(L("අත්තිකාරම් විස්තර", "முன்பண விவரம்", "Advance details"))}</button>
      <div id="form-msg"></div>
    </form>`;
  paintAdvance(document.getElementById("advance-form"));
}

function moduleTabs(tab) {
  return `<div class="desig-tabs">
    <a class="${tab === "upload" ? "on" : ""}" href="#console/modular?tab=upload">${esc(L("හදපු මොඩියුලය උඩුගත කරන්න", "தயாரித்த தொகுதியை பதிவேற்று", "Upload a module already made"))}</a>
    <a class="${tab === "gemini" ? "on" : ""}" href="#console/modular?tab=gemini">${esc(L("Gemini එකෙන් හදන්න", "Gemini மூலம் உருவாக்கு", "Create with Gemini"))}</a>
    <a class="${tab === "format" ? "on" : ""}" href="#console/modular?tab=format">${esc(L("මොඩියුල ආකෘතිය", "தொகுதிப் படிவம்", "Module format"))}</a>
  </div>`;
}

function moduleDayBlock(day) {
  return `<div class="module-day">
    <h3></h3>
    <label class="classic-field"><span>${esc(L("මාතෘකාව", "தலைப்பு", "Heading"))}</span><input name="dayTitle" value="${esc(day.title || "")}"></label>
    <label class="classic-field"><span>${esc(L("අන්තර්ගතය", "உள்ளடக்கம்", "Content"))}</span><textarea name="dayBody">${esc(day.body || "")}</textarea></label>
    <button type="button" data-act="module-drop-day">${esc(L("මෙම දිනය ඉවත් කරන්න", "இந்த நாளை நீக்கு", "Remove this day"))}</button>
  </div>`;
}

function renumberModuleDays(form) {
  form.querySelectorAll(".module-day").forEach((block, index) => {
    const heading = block.querySelector("h3");
    if (heading) heading.textContent = L("දිනය ", "நாள் ", "Day ") + (index + 1);
  });
}

function moduleListHtml(items) {
  const rows = (items || []).map((row) => `<tr>
    <td class="wrap-cell">${esc(row.title)}</td>
    <td>${esc(row.days || 0)}</td>
    <td>${row.fileUrl ? `<a href="${esc(row.fileUrl)}" target="_blank" rel="noopener">${esc(L("ගොනුව", "கோப்பு", "File"))}</a>` : ""}</td>
    <td><a href="#console/modular?tab=${Number(row.days) > 0 ? "gemini" : "upload"}&id=${esc(row.id)}">${esc(L("සංස්කරණය", "திருத்து", "Edit"))}</a></td>
    <td><button type="button" data-act="module-pdf" data-id="${esc(row.id)}">${esc(L("PDF", "PDF", "PDF"))}</button></td>
  </tr>`).join("");
  if (!rows) return `<p class="pad-note">${esc(L("සුරැකූ මොඩියුල නැත.", "சேமித்த தொகுதிகள் இல்லை.", "There are no saved modules."))}</p>`;
  return `<table class="desig-list">
    <thead><tr>
      <th>${esc(L("මොඩියුලය", "தொகுதி", "Module"))}</th>
      <th>${esc(L("දින", "நாட்கள்", "Days"))}</th>
      <th>${esc(L("ගොනුව", "கோப்பு", "File"))}</th>
      <th></th>
      <th></th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function websiteProgrammeList(programmes) {
  state.moduleProgrammes = programmes || [];
  const rows = state.moduleProgrammes.map((row, index) => {
    const start = showDate(row.day);
    const end = showDate(row.end);
    const when = start && end && start !== end ? `${start} – ${end}` : (start || end);
    const open = row.module
      ? `<a href="#console/modular?tab=gemini&id=${esc(row.module)}">${esc(L("සංස්කරණය", "திருத்து", "Edit"))}</a>`
      : `<button type="button" data-act="module-from-programme" data-index="${index}">${esc(L("මොඩියුලය හදන්න", "தொகுதியை உருவாக்கு", "Make the module"))}</button>`;
    return `<tr>
      <td class="wrap-cell">${esc(row.name)}</td>
      <td class="wrap-cell">${esc(when)}</td>
      <td class="wrap-cell">${esc(row.place || "")}</td>
      <td>${esc(row.days || 1)}</td>
      <td>${open}</td>
    </tr>`;
  }).join("");
  if (!rows) {
    return `<p class="pad-note">${esc(L("වෙබ් අඩවියෙන් ඇස්තමේන්තුව සකස් කළ වැඩසටහන් නැත.", "இணையம் வழியாக மதிப்பீடு செய்யப்பட்ட பயிற்சிகள் இல்லை.", "There are no programmes with an estimate prepared through the website."))}</p>`;
  }
  return `<table class="desig-list">
    <thead><tr>
      <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
      <th>${esc(L("දින", "நாட்கள்", "Dates"))}</th>
      <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
      <th>${esc(L("දින ගණන", "நாள் எண்ணிக்கை", "Days"))}</th>
      <th></th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function geminiBox(gemini) {
  const email = gemini?.email || "";
  const password = gemini?.password || "";
  return `<div class="gemini-box">
    <p>${esc(L("අලුත් මොඩියුලයක් ඕන නම් මෙම ඊමේල් එකෙන් Gemini එකට ඇතුළු වෙලා හදන්න. හදලා මෙතන දිනයකට පිටුවක් විදිහට දාලා සුරකින්න.", "புதிய தொகுதி வேண்டுமானால் இந்த மின்னஞ்சலில் Gemini இல் நுழைந்து உருவாக்கவும். பின்னர் இங்கே ஒரு நாளுக்கு ஒரு பக்கமாக சேமிக்கவும்.", "When a new module is needed, sign in to Gemini with this email and create it. Then save it here as one page for each day."))}</p>
    <label class="classic-field"><span>${esc(L("ඊමේල්", "மின்னஞ்சல்", "Email"))}</span><input readonly value="${esc(email)}"></label>
    <label class="classic-field"><span>${esc(L("මුරපදය", "கடவுச்சொல்", "Password"))}</span><input readonly value="${esc(password)}"></label>
    <p><a class="btn" href="https://gemini.google.com/" target="_blank" rel="noopener">${esc(L("Gemini අරින්න", "Gemini திற", "Open Gemini"))}</a></p>
  </div>`;
}

function sheetDate(value) {
  const text = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || text.startsWith("0000")) return "";
  return text.replace(/-/g, ".");
}

function moduleDayData(day) {
  const raw = String(day?.body || "").trim();
  let extra = {};
  if (raw.startsWith("{")) {
    try {
      extra = JSON.parse(raw) || {};
    } catch (error) {
      extra = {};
    }
  }
  const sessions = Array.isArray(extra.sessions)
    ? extra.sessions.map((row) => ({
      time: row?.time || "",
      session: row?.session || "",
      lecturer: row?.lecturer || "",
      points: row?.points || "",
    }))
    : [];
  return { date: extra.date || "", sessions };
}

function clockMinutes(value) {
  const text = String(value || "").trim();
  const match = text.match(/(\d{1,2})[.:](\d{2})/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const afternoon = /ප\.ව|pm/i.test(text);
  const morning = /පෙ\.ව|am/i.test(text);
  if (afternoon && hour < 12) hour += 12;
  if (morning && hour === 12) hour = 0;
  if (!afternoon && !morning && hour > 0 && hour < 8) hour += 12;
  return hour * 60 + minute;
}

function clockLabel(mins) {
  const hour = Math.floor(mins / 60);
  const minute = String(mins % 60).padStart(2, "0");
  const period = hour < 12 ? "පෙ.ව." : "ප.ව.";
  let show = hour % 12;
  if (show === 0) show = 12;
  return `${period} ${show}.${minute}`;
}

function clockRange(start, end) {
  const left = clockLabel(start);
  const right = clockLabel(end);
  const leftPart = left.split(" ");
  const rightPart = right.split(" ");
  if (leftPart[0] === rightPart[0]) return `${leftPart[0]} ${leftPart.slice(1).join(" ")} – ${rightPart.slice(1).join(" ")}`;
  return `${left} – ${right}`;
}

function lectureRanges(count, startText, endText) {
  const start = clockMinutes(startText) ?? 8 * 60 + 30;
  const end = clockMinutes(endText) ?? 16 * 60;
  const span = Math.max(60, end - start);
  if (count === 2) {
    if (span >= 420) return [[start, start + 180], [end - 180, end]];
    const each = Math.floor(span / 2);
    return [[start, start + each], [end - each, end]];
  }
  if (count === 3) {
    const len = span >= 420 ? 120 : Math.floor(span / 3);
    const first = [start, start + len];
    const last = [end - len, end];
    const mid = Math.max(first[1], Math.round((first[1] + last[0] - len) / 2));
    return [first, [mid, mid + len], last];
  }
  const lunchA = 12 * 60 + 15;
  const lunchB = 13 * 60;
  const blocks = start < lunchA && end > lunchB ? [[start, lunchA], [lunchB, end]] : [[start, end]];
  const total = blocks.reduce((sum, block) => sum + (block[1] - block[0]), 0);
  const slice = Math.max(40, Math.floor(total / count));
  const ranges = [];
  blocks.forEach((block) => {
    let cursor = block[0];
    while (ranges.length < count && cursor + 30 <= block[1]) {
      const stop = Math.min(block[1], cursor + slice);
      ranges.push([cursor, stop]);
      cursor = stop;
    }
  });
  while (ranges.length < count) ranges.push([start, end]);
  return ranges.slice(0, count);
}

function lecturePlan(lecturers, startText, endText) {
  const people = (lecturers || []).filter((item) => item && item.name);
  if (!people.length) return [];
  if (people.length === 1) return [{ part: "", time: "", lecturer: people[0] }];
  return lectureRanges(people.length, startText, endText).map((range, index) => ({
    part: people.length === 2 ? (index === 0 ? "උදේ" : "හවස") : "",
    time: clockRange(range[0], range[1]),
    lecturer: people[index],
  }));
}

function lectureBlock(plan) {
  if (!plan.length) return "";
  const person = (item) => `<ul>
    <li>${esc(L("නම", "பெயர்", "Name"))}: ${esc(item.lecturer.name || "")}</li>
    <li>${esc(L("තනතුර", "பதவி", "Post"))}: ${esc(item.lecturer.post || "")}</li>
    <li>${esc(L("ආයතනය", "நிறுவனம்", "Institution"))}: ${esc(item.lecturer.office || "")}</li>
  </ul>`;
  if (plan.length === 1) {
    return `<div class="sheet-lecture"><p><b>${esc(L("දේශකයා", "விரிவுரையாளர்", "Lecturer"))}</b></p>${person(plan[0])}</div>`;
  }
  return `<div class="sheet-lecture"><p><b>${esc(L("දේශකයන්", "விரிவுரையாளர்கள்", "Lecturers"))}</b></p>${plan.map((item) => `<p><b>${esc([item.part, item.time].filter(Boolean).join(" "))}</b></p>${person(item)}`).join("")}</div>`;
}

function sheetSessionRow(row) {
  return `<tr class="sheet-row">
    <td><input name="sessTime" value="${esc(row.time || "")}"></td>
    <td><input name="sessName" value="${esc(row.session || "")}"></td>
    <td class="lecturer-col"><input name="sessLecturer" value="${esc(row.lecturer || "")}"></td>
    <td><textarea name="sessPoints">${esc(row.points || "")}</textarea></td>
    <td class="sheet-act"><button type="button" data-act="sheet-drop">${esc(L("ඉවත්", "நீக்கு", "Remove"))}</button></td>
  </tr>`;
}

function namedPost(post, name) {
  const role = String(post || "").trim();
  const who = String(name || "").trim();
  if (role && who) return `${role} ${who}`;
  return who || role;
}

function formatDayCard(page, index, total, programme) {
  const parts = moduleDayData(page);
  const date = programme.dates?.[index] || parts.date || "";
  const place = programme.place || "";
  const target = programme.target || "";
  const liaison = programme.liaison || {};
  const plan = lecturePlan(programme.lecturers, programme.stime, programme.etime);
  const many = plan.length > 1 || parts.sessions.some((row) => String(row.lecturer || "").trim());
  const seeded = !parts.sessions.length && plan.length > 1
    ? plan.map((item) => ({ time: [item.part, item.time].filter(Boolean).join(" "), lecturer: item.lecturer.name, session: "", points: "" }))
    : null;
  const sessions = seeded || (parts.sessions.length ? parts.sessions : [{}]);
  const shown = sheetDate(date);
  return `<section class="format-day sheet-page" data-no="${index + 1}" data-date="${esc(date)}">
    <p class="sheet-org">${esc(L("වයඹ පළාත් සභාව", "வயம்ப மாகாண சபை", "North Western Provincial Council"))}<span>${esc(L("කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය", "முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சி அலகு", "Management Development and Training Unit"))}</span><span>${esc(place || "")}</span></p>
    <div class="sheet-meta">
      <p><b>${esc(L("පුහුණු වැඩසටහනේ නම", "பயிற்சியின் பெயர்", "Name of the programme"))}:</b> ${esc(programme.name || "")}</p>
      <p><b>${esc(L("දිනය", "திகதி", "Date"))}:</b> ${esc(shown)}</p>
      <p><b>${esc(L("ඉලක්ක කණ්ඩායම", "இலக்குக் குழு", "Target group"))}:</b> ${esc(target || "")}</p>
    </div>
    ${lectureBlock(plan)}
    <table class="sheet-table${many ? "" : " solo"}">
      <thead><tr>
        <th>${esc(L("කාලය", "நேரம்", "Time"))}</th>
        <th>${esc(L("සැසිය", "அமர்வு", "Session"))}</th>
        <th class="lecturer-col">${esc(L("දේශකයා", "விரிவுரையாளர்", "Lecturer"))}</th>
        <th>${esc(L("විෂය කරුණු සහ ක්‍රියාකාරකම්", "பாடத் தலைப்புகள் மற்றும் செயற்பாடுகள்", "Topics and activities"))}</th>
        <th></th>
      </tr></thead>
      <tbody>${sessions.map((row) => sheetSessionRow(row)).join("")}</tbody>
    </table>
    <p><button type="button" data-act="sheet-add">${esc(L("තව සැසියක්", "மேலும் ஒரு அமர்வு", "Add a session"))}</button></p>
    <ul class="sheet-foot">
      <li>${esc(L("සමායෝජන සම්බන්ධීකරණය", "ஒருங்கிணைப்பு", "Coordination"))}: ${esc(namedPost(programme.coordinatorPost, programme.coordinator))}</li>
      <li>${esc(L("සම්පත්දායක අධීක්ෂණය", "வளநபர் மேற்பார்வை", "Resource-person supervision"))}: ${esc(namedPost(programme.supervisorPost, programme.supervisor))}</li>
      <li>${esc(L("සම්බන්ධීකරණය", "இணைப்பு", "Coordination"))}: ${esc(namedPost(liaison.post, liaison.name))}</li>
    </ul>
    <p class="pad-note">${esc(L("පිටුව ", "பக்கம் ", "Page "))}${index + 1} / ${total}</p>
  </section>`;
}

function paintFormatSearch(query) {
  const box = $("#format-hits");
  if (!box) return;
  const q = String(query || "").trim().toLowerCase();
  const rows = (state.moduleProgrammes || []).filter((item) => !q || String(item.name || "").toLowerCase().includes(q));
  box.innerHTML = rows.map((item) => {
    const href = item.module
      ? `#console/modular?tab=format&id=${encodeURIComponent(item.module)}`
      : `#console/modular?tab=format&atp=${encodeURIComponent(item.id)}`;
    const when = showDate(item.day) || "";
    return `<a class="format-hit" href="${href}"><strong>${esc(item.name)}</strong><span>${esc(when)} · ${esc(L("දින ", "நாள் ", "Days "))}${esc(item.days || 1)}</span></a>`;
  }).join("") || `<p class="pad-note">${esc(L("ගැලපෙන පුහුණුවක් නැත.", "பொருந்தும் பயிற்சி இல்லை.", "No matching programme."))}</p>`;
}

function renderModuleFormat(work, list, current) {
  state.moduleProgrammes = list.programmes || [];
  const atp = state.query?.get("atp") || String(current.atp || "");
  const programme = state.moduleProgrammes.find((item) => String(item.id) === String(atp)) || {};
  const sheet = current.sheet || {};
  const coordinator = current.coordinator || list.coordinator || sheet.coordinator || "";
  const coordinatorPost = current.coordinatorPost || list.coordinatorPost || sheet.coordinatorPost || "නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)";
  const savedDays = current.days || [];
  const dayCount = Math.max(1, Number(programme.days) || Number(sheet.days) || 1);
  const total = Math.max(savedDays.length || 0, programme.id || sheet.name ? dayCount : 0);
  const pages = Array.from({ length: total }, (_, index) => savedDays[index] || { title: "", body: "" });
  const title = programme.name || current.title || sheet.name || "";
  const paper = {
    name: title,
    place: programme.place || sheet.place || "",
    target: programme.target || sheet.target || "",
    dates: (programme.dates && programme.dates.length ? programme.dates : sheet.dates) || [],
    liaison: programme.liaison || sheet.liaison || {},
    supervisor: programme.supervisor || sheet.supervisor || "",
    supervisorPost: programme.supervisorPost || sheet.supervisorPost || "",
    coordinatorPost,
    people: programme.people || sheet.people || [],
    lecturers: programme.lecturers || sheet.lecturers || [],
    stime: programme.stime || sheet.stime || "",
    etime: programme.etime || sheet.etime || "",
    coordinator,
  };
  const peopleJson = JSON.stringify(paper.people || []);
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("මොඩියුලර් සැකසීම", "மட்டு அமைப்பு", "Modular setup"))}</h2>
    <div class="sheet-tools">
      <button type="button" data-act="module-excel">${esc(L("Excel ආකෘතිය බාගත කරන්න", "Excel படிவத்தைப் பதிவிறக்கு", "Download the Excel form"))}</button>
      <label class="btn">${esc(L("Excel උඩුගත කරන්න", "Excel பதிவேற்று", "Upload the Excel"))}<input id="module-excel" type="file" accept=".xls,.xlsx,.csv" hidden></label>
    </div>
    <p class="pad-note">${esc(L("දිනය තීරුවේ 1 කියන්නේ පළමු දවසයි. කාලය, සැසිය, විෂය කරුණු සහ ක්‍රියාකාරකම් පුරවලා උඩුගත කරන්න. එක දවසකට පිටුවක්.", "திகதி நெடுவரிசையில் 1 என்பது முதல் நாள். நேரம், அமர்வு, பாடத் தலைப்புகள் மற்றும் செயற்பாடுகளை நிரப்பிப் பதிவேற்றவும். ஒரு நாளுக்கு ஒரு பக்கம்.", "In the day column, 1 is the first day. Fill time, session, and topics, then upload. One page for each day."))}</p>
    <label class="classic-field"><span>${esc(L("සොයන්න", "தேடு", "Search"))}</span><input id="format-find" placeholder="${esc(L("අකුරක් හෝ වචනයක්", "ஒரு எழுத்து அல்லது சொல்", "A letter or a word"))}"></label>
    <div id="format-hits" class="format-hits"></div>
    ${title ? `<form class="classic-form module-sheet" id="module-format-form">
      <input type="hidden" name="id" value="${esc(current.id || "")}">
      <input type="hidden" name="atp" value="${esc(programme.id || current.atp || atp)}">
      <input type="hidden" name="title" value="${esc(title)}">
      <input type="hidden" name="place" value="${esc(paper.place)}">
      <input type="hidden" name="target" value="${esc(paper.target)}">
      <input type="hidden" name="coordinator" value="${esc(paper.coordinator)}">
      <input type="hidden" name="coordinatorPost" value="${esc(paper.coordinatorPost || "")}">
      <input type="hidden" name="supervisor" value="${esc(paper.supervisor)}">
      <input type="hidden" name="supervisorPost" value="${esc(paper.supervisorPost || "")}">
      <input type="hidden" name="liaisonName" value="${esc(paper.liaison.name || "")}">
      <input type="hidden" name="liaisonPost" value="${esc(paper.liaison.post || "")}">
      <input type="hidden" name="liaisonOffice" value="${esc(paper.liaison.office || "")}">
      <input type="hidden" name="people" value="${esc(peopleJson)}">
      <input type="hidden" name="lecturers" value="${esc(JSON.stringify(paper.lecturers || []))}">
      <input type="hidden" name="stime" value="${esc(paper.stime)}">
      <input type="hidden" name="etime" value="${esc(paper.etime)}">
      ${pages.map((page, index) => formatDayCard(page, index, pages.length, paper)).join("")}
      <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <button type="button" data-act="format-pdf">${esc(L("PDF එක ගන්න", "PDF எடு", "Save PDF"))}</button>
      <div id="form-msg"></div>
    </form>` : `<p class="pad-note">${esc(L("පුහුණුවක් තෝරන්න. දින ගණන පද්ධතියෙන් ගෙන දිනයකට පිටුවක් එනවා.", "ஒரு பயிற்சியைத் தேர்ந்தெடுக்கவும். நாள் எண்ணிக்கை முறைமையிலிருந்து வந்து ஒரு நாளுக்கு ஒரு பக்கம் வரும்.", "Choose a programme. The number of days comes from the system, one page for each day."))}</p>`}`;
  paintFormatSearch("");
}

async function renderModular(work) {
  const id = state.query?.get("id") || "";
  const list = await api("modules");
  let current = { id: "", title: "", days: [], sheet: null };
  if (id) current = await api("module", { query: { id } });
  renderModuleFormat(work, list, current);
}

const EVAL_MARK = { A: "අ", B: "ආ", C: "ඉ", D: "ඊ" };

function evalQuestionsHtml(questions) {
  return Array.from({ length: 10 }, (_, index) => {
    const question = questions[index] || {};
    const correct = ["A", "B", "C", "D"].includes(question.correct) ? question.correct : "A";
    const options = ["A", "B", "C", "D"].map((letter) => `<option value="${letter}"${letter === correct ? " selected" : ""}>${esc(EVAL_MARK[letter])}</option>`).join("");
    const choice = (letter, value) => `<label class="classic-field"><span>${esc(EVAL_MARK[letter])}</span><input name="opt${letter}" value="${esc(value || "")}" required></label>`;
    return `<fieldset class="eval-qedit">
      <legend>${esc(L("ප්‍රශ්නය ", "கேள்வி ", "Question "))}${index + 1}</legend>
      <label class="classic-field"><span>${esc(L("ප්‍රශ්නය", "கேள்வி", "Question"))}</span><textarea name="qtext" required>${esc(question.text || "")}</textarea></label>
      ${choice("A", question.a)}
      ${choice("B", question.b)}
      ${choice("C", question.c)}
      ${choice("D", question.d)}
      <label class="classic-field"><span>${esc(L("නිවැරදි උත්තරය", "சரியான விடை", "Correct answer"))}</span><select name="correct">${options}</select></label>
    </fieldset>`;
  }).join("");
}

function evalLinkBox(token, id) {
  const pre = `${location.origin}${location.pathname}#quiz/${token}/pre`;
  const post = `${location.origin}${location.pathname}#quiz/${token}/post`;
  const line = (label, href) => `<p><span>${esc(label)}</span> <a href="${esc(href)}">${esc(href)}</a> <button type="button" data-act="copy-link" data-link="${esc(href)}">${esc(L("පිටපත් කරන්න", "நகலெடு", "Copy"))}</button></p>`;
  return `<div class="eval-links">
    <h2 class="classic-title">${esc(L("පුහුණු ලාභීන්ගේ සබැඳි", "பயிலுநர்களின் இணைப்பு", "Links for the trainees"))}</h2>
    ${line(L("පෙර ඇගයීම", "முன் மதிப்பீடு", "Pre-evaluation"), pre)}
    ${line(L("පසු ඇගයීම", "பின் மதிப்பீடு", "Post-evaluation"), post)}
    <div class="eval-qrs">
      <div><div id="qr-pre"></div><p>${esc(L("පෙර ඇගයීම", "முன் மதிப்பீடு", "Pre-evaluation"))}</p></div>
      <div><div id="qr-post"></div><p>${esc(L("පසු ඇගයීම", "பின் மதிப்பீடு", "Post-evaluation"))}</p></div>
    </div>
    <p>
      <a class="btn" href="#console/evaluation?tab=present&id=${esc(id)}&kind=pre&q=1">${esc(L("පෙර ඇගයීම ඉදිරිපත් කරන්න", "முன் மதிப்பீட்டைக் காட்டு", "Present the pre-evaluation"))}</a>
      <a class="btn" href="#console/evaluation?tab=present&id=${esc(id)}&kind=post&q=1">${esc(L("පසු ඇගයීම ඉදිරිපත් කරන්න", "பின் மதிப்பீட்டைக் காட்டு", "Present the post-evaluation"))}</a>
      <a class="btn secondary" href="#console/evaluation?tab=report&id=${esc(id)}">${esc(L("සංසන්දන වාර්තාව", "ஒப்பீட்டு அறிக்கை", "Comparison report"))}</a>
    </p>
  </div>`;
}

function paintEvalQr(token) {
  const draw = (id, text) => {
    const node = document.getElementById(id);
    if (!node || typeof QRCode !== "function") return;
    node.innerHTML = "";
    new QRCode(node, { text, width: 168, height: 168, correctLevel: QRCode.CorrectLevel.M });
  };
  draw("qr-pre", `${location.origin}${location.pathname}#quiz/${token}/pre`);
  draw("qr-post", `${location.origin}${location.pathname}#quiz/${token}/post`);
}

async function renderEvaluation(work) {
  const tab = state.query?.get("tab") || "setup";
  if (tab === "present") return renderEvalPresent(work);
  if (tab === "report") return renderEvalReport(work);
  const atp = state.query?.get("atp") || "";
  const data = await api("eval-get", { query: atp ? { atp } : {} });
  const options = (data.programmes || []).map((item) => `<option value="${esc(item.id)}"${String(item.id) === String(atp) ? " selected" : ""}>${esc(item.name)}</option>`).join("");
  const imports = (data.imports || []).filter((item) => String(item.id) !== String(data.eval?.id || ""));
  const importOptions = imports.map((item) => {
    const when = showDate(item.day);
    return `<option value="${esc(item.id)}">${esc(item.title)}${when ? ` · ${esc(when)}` : ""}</option>`;
  }).join("");
  const ready = data.eval?.token && (data.eval.questions || []).length >= 10;
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("පෙර ඇගයීම සහ පසු ඇගයීම", "முன் மதிப்பீடு மற்றும் பின் மதிப்பீடு", "Pre-evaluation and post-evaluation"))}</h2>
    <form class="classic-form" id="eval-pick">
      <label class="classic-field"><span>${esc(L("පුහුණුව සොයන්න", "பயிற்சியைத் தேடு", "Find a programme"))}</span><input name="find" placeholder="${esc(L("පුහුණුවේ නම", "பயிற்சியின் பெயர்", "Programme name"))}"></label>
      <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</span><select name="atp" size="6">${options}</select></label>
    </form>
    ${atp ? `${geminiBox(data.gemini)}
      <p class="pad-note">${esc(L("Gemini එකෙන් ප්‍රශ්න 10ක් හදාගන්න. එක එකට උත්තර 4යි. නිවැරදි උත්තරය සලකුණු කරන්න. එකම පුහුණුව ඊළඟ වතාවේ නම් පරණ ප්‍රශ්න ගේන්න පුළුවන්. පෙර ඇගයීම පුහුණුව පටන් ගන්න දවසේ. පසු ඇගයීම පුහුණුව ඉවර වූ පසු. සබැඳිය පුහුණු ලාභීන්ට දෙන්න.", "Gemini இல் 10 கேள்விகளை உருவாக்கவும். ஒவ்வொன்றுக்கும் 4 விடை. சரியான விடையைக் குறிக்கவும். அதே பயிற்சி மறுபடியும் நடந்தால் பழைய கேள்விகளைக் கொண்டுவரலாம். முன் மதிப்பீடு பயிற்சி தொடங்கும் நாளில். பின் மதிப்பீடு பயிற்சி முடிந்த பின். இணைப்பைப் பயிலுநர்களுக்குக் கொடுங்கள்.", "Make 10 questions in Gemini. Each has 4 answers. Mark the correct one. If the same programme is held again, the old questions can be brought in. Pre-evaluation is on the day the programme starts. Post-evaluation is after it ends. Give the link to the trainees."))}</p>
      <form class="classic-form module-sheet" id="eval-form">
        <input type="hidden" name="atp" value="${esc(atp)}">
        <p class="pad-note">${esc(L("කලින් හදපු ඒ පුහුණුව මෙතනින් තෝරලා ප්‍රශ්න ගේන්න ඔබන්න. ප්‍රශ්න 10ම මේ අලුත් පුහුණුවට එනවා. ඊට පස්සේ සුරකින්න.", "முன்பு உருவாக்கிய அதே பயிற்சியை இங்கே தேர்ந்தெடுத்து கேள்விகளைக் கொண்டுவரவும். 10 கேள்விகளும் இந்தப் புதிய பயிற்சிக்கு வரும். பின்னர் சேமிக்கவும்.", "Choose the earlier programme here and bring the questions. All 10 come into this new programme. Then save."))}</p>
        <label class="classic-field"><span>${esc(L("පරණ පුහුණුවක ප්‍රශ්න", "பழைய பயிற்சிக் கேள்விகள்", "Questions from an earlier programme"))}</span><select id="eval-import"><option value="">${esc(L("තෝරන්න", "தேர்வு", "Choose"))}</option>${importOptions}</select></label>
        <button type="button" data-act="eval-import">${esc(L("ප්‍රශ්න ගේන්න", "கேள்விகளைக் கொண்டுவா", "Bring the questions"))}</button>
        <div id="eval-questions">${evalQuestionsHtml(data.eval?.questions || [])}</div>
        <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
        <div id="form-msg"></div>
      </form>
      ${ready ? evalLinkBox(data.eval.token, data.eval.id) : ""}` : `<p class="pad-note">${esc(L("පුහුණු වැඩසටහනක් තෝරන්න.", "ஒரு பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme."))}</p>`}`;
  if (ready) paintEvalQr(data.eval.token);
}

const TOTAL_FIELDS = [
  ["planned", "සැලසුම්", "திட்டம்", "Planned"],
  ["days", "දින", "நாள்", "Days"],
  ["applied", "අයදුම්", "விண்ணப்பம்", "Applied"],
  ["selected", "තෝරාගත්", "தேர்ந்த", "Selected"],
  ["budget", "ප්‍රතිපාදන", "ஒதுக்கீடு", "Allocation"],
  ["estimate", "ඇස්තමේන්තුව", "மதிப்பீடு", "Estimate"],
  ["revised", "සංශෝධිත", "திருத்திய", "Revised"],
  ["offest", "වෙබ් නොවන", "இணையம் அல்லாத", "Outside the site"],
  ["step1", "පියවර 1", "படி 1", "Step 1"],
  ["step2", "පියවර 2", "படி 2", "Step 2"],
];

function totalNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : 0;
}

function totalSumText(number) {
  const rounded = Math.round(number * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function paintTotalSums() {
  const form = $("#total-form");
  if (!form) return;
  const grand = {};
  TOTAL_FIELDS.forEach(([field]) => { grand[field] = 0; });
  let programmes = 0;
  form.querySelectorAll("table.total-sheet").forEach((table) => {
    const body = table.querySelectorAll("tbody tr.total-row");
    programmes += body.length;
    TOTAL_FIELDS.forEach(([field]) => {
      let sum = 0;
      table.querySelectorAll(`tbody [data-field="${field}"]`).forEach((input) => { sum += totalNumber(input.value); });
      const cell = table.querySelector(`tfoot [data-sum="${field}"]`);
      if (cell) cell.textContent = totalSumText(sum);
      grand[field] += sum;
    });
  });
  const count = $("#total-count");
  if (count) count.textContent = String(programmes);
  TOTAL_FIELDS.forEach(([field]) => {
    const cell = document.querySelector(`[data-grand="${field}"]`);
    if (cell) cell.textContent = totalSumText(grand[field]);
  });
}

function totalRows(form) {
  return [...form.querySelectorAll("tr.total-row")].map((row) => {
    const item = { id: row.dataset.id, category: row.querySelector("[data-field=category]")?.value || "" };
    TOTAL_FIELDS.forEach(([field]) => { item[field] = row.querySelector(`[data-field="${field}"]`)?.value || ""; });
    return item;
  });
}

function splitWrap(ctx, text, width) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= width) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawSplitPage(sheet, officerName, year) {
  const page = document.createElement("canvas");
  page.width = 1240;
  page.height = 1754;
  const ctx = page.getContext("2d");
  const font = '"Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const extras = [
    ["විශේෂ පුහුණු", "special"],
    ["පාඨමාලා", "course"],
    ["විදේශ පුහුණු", "foreign"],
    ["භාෂා පුහුණු", "language"],
  ];
  for (let size = 22; size >= 12; size -= 1) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.fillStyle = "#111";
    const margin = 72;
    const width = page.width - margin * 2;
    let y = margin + size;
    const write = (text, weight, px, gap) => {
      ctx.font = `${weight} ${px}px ${font}`;
      splitWrap(ctx, text, width).forEach((line) => {
        ctx.fillText(line, margin, y);
        y += px + 6;
      });
      y += gap;
    };
    const block = (title, rows, computer) => {
      write(title, 700, size + 1, 4);
      if (!rows.length) {
        write("නැත", 400, Math.max(12, size - 2), 6);
        return;
      }
      rows.forEach((row, index) => {
        const money = computer ? ` · ප්‍රතිපාදන ${row.money || "—"}` : "";
        write(`${index + 1}. ${row.name} — දින ${row.days}${money}`, 400, Math.max(12, size - 2), 1);
      });
      y += 8;
    };
    write("එක් පුද්ගල සැලැස්ම", 700, size + 8, 6);
    write(`වර්ෂය: ${year}`, 400, size, 2);
    write(`සම්බන්ධීකරණ නිලධාරී: ${officerName}`, 700, size, 2);
    write(`Super User: ${sheet.username}`, 700, size, 2);
    write(`දින එකතුව: ${sheet.days?.all || "0"}`, 700, size, 8);
    block(`පොදු පුහුණු · දින ${sheet.days?.general || "0"}`, sheet.general || [], false);
    block(`පරිගණක පුහුණු · දින ${sheet.days?.computer || "0"}`, sheet.computer || [], true);
    write(`දෙපාර්තමේන්තු පුහුණු · දින ${sheet.days?.department || "0"}`, 700, size + 1, 4);
    if (!(sheet.departments || []).length) write("නැත", 400, Math.max(12, size - 2), 6);
    (sheet.departments || []).forEach((dep) => {
      write(`${dep.office} · දින ${dep.days}`, 700, Math.max(12, size - 1), 2);
      (dep.items || []).forEach((row, index) => {
        write(`${index + 1}. ${row.name} — දින ${row.days}`, 400, Math.max(12, size - 2), 1);
      });
      y += 6;
    });
    extras.forEach(([label, key]) => {
      if ((sheet[key] || []).length) block(`${label} · දින ${sheet.days?.[key] || "0"}`, sheet[key], false);
    });
    if (y < page.height - 48) return page;
  }
  return page;
}

async function splitPdf() {
  const plan = state.splitPlan;
  if (!plan?.sheets?.length) {
    alert(L("මේ වර්ෂයේ බෙදන්න පුහුණු නැත.", "இந்த ஆண்டில் பிரிக்கப் பயிற்சி இல்லை.", "There are no programmes to divide for this year."));
    return;
  }
  const images = [];
  for (const sheet of plan.sheets) {
    const typed = document.querySelector(`[data-split-name="${sheet.id}"]`)?.value?.trim() || sheet.username;
    const page = drawSplitPage(sheet, typed, plan.year);
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: page.width, height: page.height });
  }
  saveBlob(jpegPdfPages(images), `ekapudgala-selasma-${plan.year}.pdf`);
}

function splitPreview(split) {
  const names = (rows) => (rows || []).map((row) => esc(row.name)).join(" · ") || esc(L("නැත", "இல்லை", "None"));
  return (split?.sheets || []).map((sheet) => {
    const deps = (sheet.departments || []).map((dep) => `${esc(dep.office)}: ${(dep.items || []).map((row) => esc(row.name)).join(", ")}`).join(" · ") || esc(L("නැත", "இல்லை", "None"));
    return `<article class="split-card">
      <label>${esc(L("සම්බන්ධීකරණ නිලධාරී", "ஒருங்கிணைப்பு அதிகாரி", "Coordination officer"))} <input data-split-name="${esc(sheet.id)}" value="${esc(sheet.username)}"></label>
      <p>Super User: <b>${esc(sheet.username)}</b> · ${esc(L("දින එකතුව", "நாள் கூட்டு", "Days"))}: <b>${esc(sheet.days?.all || "0")}</b></p>
      <p>${esc(L("පොදු පුහුණු", "பொதுப் பயிற்சி", "General"))} (${esc(sheet.days?.general || "0")}): ${names(sheet.general)}</p>
      <p>${esc(L("පරිගණක පුහුණු", "கணினிப் பயிற்சி", "Computer"))} (${esc(sheet.days?.computer || "0")}): ${names(sheet.computer)}</p>
      <p>${esc(L("දෙපාර්තමේන්තු පුහුණු", "திணைக்களப் பயிற்சி", "Department"))} (${esc(sheet.days?.department || "0")}): ${deps}</p>
    </article>`;
  }).join("");
}

const PACE_COLORS = ["#0c4da2", "#128a5a", "#ef7d12", "#8d35c7", "#0e7490", "#c1121f", "#b8860b", "#5c6570"];

function paceSlices(categories, values) {
  return (categories || []).map((category, index) => ({
    label: category.label,
    value: advanceNumber(values?.[category.id]),
    color: PACE_COLORS[index % PACE_COLORS.length],
  })).filter((slice) => slice.value > 0);
}

function paceWrap(ctx, text, width) {
  const lines = [];
  let line = "";
  for (const ch of String(text || "")) {
    const next = line + ch;
    if (ctx.measureText(next).width <= width) line = next;
    else {
      if (line.trim()) lines.push(line.trim());
      line = ch.trim() ? ch : "";
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.length ? lines : [""];
}

function paintPieCanvas(canvas, slices) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  const total = (slices || []).reduce((sum, slice) => sum + slice.value, 0);
  const cx = width * 0.32;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.30;
  ctx.font = '16px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  if (total <= 0) {
    ctx.fillStyle = "#667";
    ctx.fillText("දත්ත නැත", 24, cy);
    return;
  }
  let angle = -Math.PI / 2;
  slices.forEach((slice) => {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  });
  slices.forEach((slice, index) => {
    const y = 36 + index * 28;
    const pct = Math.round((slice.value / total) * 100);
    ctx.fillStyle = slice.color;
    ctx.fillRect(width * 0.58, y - 14, 16, 16);
    ctx.fillStyle = "#1b1b1b";
    ctx.fillText(`${slice.label} ${pct}%`, width * 0.58 + 24, y);
  });
}

function paintPacePies(root) {
  (root || document).querySelectorAll("canvas[data-pie]").forEach((canvas) => {
    paintPieCanvas(canvas, (state.pacePies || {})[canvas.dataset.pie] || []);
  });
}

function paceWorking(data) {
  const original = data?.original || {};
  const revision = data?.revision || {};
  const read = (key) => {
    const field = document.querySelector(`[data-rev="${key}"]`);
    const revised = field ? field.value : (revision[key] || "");
    return String(revised || "").trim() !== "" ? advanceNumber(revised) : advanceNumber(original[key]);
  };
  const amounts = {};
  (data?.categories || []).forEach((category) => { amounts[category.id] = read(category.id); });
  const stated = read("total");
  const summed = Object.values(amounts).reduce((sum, value) => sum + value, 0);
  return { amounts, total: stated > 0 ? stated : summed };
}

function paceCellMap() {
  const cells = {};
  document.querySelectorAll("[data-pace-field]").forEach((input) => {
    const key = `${input.dataset.month}|${input.dataset.category}`;
    if (!cells[key]) cells[key] = { month: input.dataset.month, category: input.dataset.category };
    cells[key][input.dataset.paceField] = input.value;
  });
  return cells;
}

function paceMonthEnd(year, month) {
  const date = new Date(Number(year), Number(month), 0);
  return `${year}-${month}-${String(date.getDate()).padStart(2, "0")}`;
}

function paceRange(data, until) {
  const cats = {};
  const months = [];
  (data.categories || []).forEach((category) => { cats[category.id] = { held: 0, people: 0, spent: 0 }; });
  (data.months || []).forEach((month) => {
    const start = `${data.year}-${month.month}-01`;
    if (until < start) return;
    const end = paceMonthEnd(data.year, month.month);
    const row = {};
    (data.categories || []).forEach((category) => {
      if (until >= end) {
        const cell = (month.rows || {})[category.id] || {};
        row[category.id] = { held: advanceNumber(cell.held), people: advanceNumber(cell.people), spent: advanceNumber(cell.spent) };
      } else {
        const items = (data.items || []).filter((item) => item.month === month.month && item.category === category.id && item.day && item.day <= until);
        row[category.id] = {
          held: items.reduce((sum, item) => sum + (Number(item.held) ? 1 : 0), 0),
          people: items.reduce((sum, item) => sum + advanceNumber(item.people), 0),
          spent: items.reduce((sum, item) => sum + advanceNumber(item.spent), 0),
        };
      }
      cats[category.id].held += row[category.id].held;
      cats[category.id].people += row[category.id].people;
      cats[category.id].spent += row[category.id].spent;
    });
    const any = (data.categories || []).some((category) => row[category.id].held || row[category.id].people || row[category.id].spent);
    if (any) months.push({ month: month.month, label: month.label, rows: row });
  });
  return { months, cats };
}

function paintPaceLive() {
  const data = state.paceData;
  const host = document.querySelector("#pace-report");
  if (!data || !host) return;
  const month = document.querySelector("#pace-month")?.value || "";
  host.querySelectorAll("[data-pace-row]").forEach((row) => {
    row.hidden = month !== "" && row.dataset.month !== month;
  });
  const working = paceWorking(data);
  const spent = {};
  const held = {};
  const people = {};
  (data.categories || []).forEach((category) => {
    spent[category.id] = 0;
    held[category.id] = 0;
    people[category.id] = 0;
  });
  Object.values(paceCellMap()).forEach((cell) => {
    if (spent[cell.category] === undefined) return;
    if (month && cell.month > month) return;
    spent[cell.category] += advanceNumber(cell.spent);
    if (!month || cell.month === month) {
      held[cell.category] += advanceNumber(cell.held);
      people[cell.category] += advanceNumber(cell.people);
    }
  });
  let heldAll = 0;
  let peopleAll = 0;
  let spentAll = 0;
  (data.categories || []).forEach((category) => {
    heldAll += held[category.id];
    peopleAll += people[category.id];
    spentAll += spent[category.id];
    const left = working.amounts[category.id] - spent[category.id];
    const slot = host.querySelector(`[data-left="${category.id}"]`);
    if (slot) slot.textContent = progressMoney(left);
    const used = host.querySelector(`[data-used="${category.id}"]`);
    if (used) used.textContent = progressMoney(spent[category.id]);
    const share = working.amounts[category.id] > 0 ? `${Math.round((spent[category.id] / working.amounts[category.id]) * 100)}%` : "–";
    const pct = host.querySelector(`[data-pct="${category.id}"]`);
    if (pct) pct.textContent = share;
  });
  const leftTotal = working.total - spentAll;
  const totalSlot = host.querySelector("[data-left-total]");
  if (totalSlot) totalSlot.textContent = progressMoney(leftTotal);
  const spentSlot = host.querySelector("[data-spent-total]");
  if (spentSlot) spentSlot.textContent = progressMoney(spentAll);
  const allocSlot = host.querySelector("[data-alloc-total]");
  if (allocSlot) allocSlot.textContent = progressMoney(working.total);
  const copy = host.querySelector(".pace-copy");
  if (copy) {
    const top = (data.categories || []).slice().sort((a, b) => spent[b.id] - spent[a.id])[0];
    const pct = working.total > 0 ? Math.round((spentAll / working.total) * 100) : 0;
    copy.textContent = `මුළු ප්‍රතිපාදනයෙන් ${pct}% වැය වී ඇත. ඉතිරි ප්‍රතිපාදන ${progressMoney(leftTotal)}. ${month ? "තෝරාගත් මාසයේ" : "වර්ෂයේ"} කළ පුහුණු ${heldAll}. පුහුණු ලාභීන් ${peopleAll}. වැඩිම වියදම ${top ? top.label : "—"}.`;
  }
  state.pacePies = {
    alloc: paceSlices(data.categories, working.amounts),
    spent: paceSlices(data.categories, spent),
  };
  paintPacePies(host);
}

function paceHash(year, tab, extra) {
  const params = new URLSearchParams();
  params.set("year", year || chosenYear());
  if (tab === "report") params.set("tab", "report");
  if (extra?.until) params.set("until", extra.until);
  return `#console/pace?${params}`;
}

async function paceDownload(pages, filename, wide) {
  if (document.fonts?.ready) await document.fonts.ready;
  const images = [];
  const width = wide ? 1754 : 1240;
  const height = wide ? 1240 : 1754;
  const font = '"Noto Sans Sinhala", "Source Sans 3", sans-serif';
  for (const page of pages) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#0c4da2";
    ctx.fillRect(0, 0, width, 16);
    let y = 72;
    const margin = 64;
    const textWidth = page.slices?.length ? width * 0.56 : width - margin * 2;
    const write = (text, weight, size, color) => {
      ctx.fillStyle = color || "#1b1b1b";
      ctx.font = `${weight} ${size}px ${font}`;
      paceWrap(ctx, text, textWidth).forEach((line) => {
        if (y > height - 48) return;
        ctx.fillText(line, margin, y);
        y += size + 8;
      });
    };
    write(page.title || "", "700", wide ? 36 : 28, "#0c4da2");
    y += 10;
    (page.lines || []).forEach((line) => write(line, "400", wide ? 24 : 20, "#1b1b1b"));
    if (page.slices?.length) {
      const pie = document.createElement("canvas");
      pie.width = 680;
      pie.height = 340;
      paintPieCanvas(pie, page.slices);
      ctx.drawImage(pie, width - 720, 90, 680, 340);
    }
    if (page.bars?.labels?.length) {
      const bar = document.createElement("canvas");
      bar.width = 1100;
      bar.height = 420;
      paintBarCanvas(bar, page.bars.labels, page.bars.series || []);
      ctx.drawImage(bar, margin, y + 16, Math.min(width - margin * 2, 1100), 380);
    }
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height });
  }
  saveBlob(jpegPdfPages(images, wide ? "841.89" : "595.28", wide ? "595.28" : "841.89"), filename);
}

function paceSlideSet(data, until, saved) {
  const working = paceWorking(data);
  const range = paceRange(data, until);
  const allocLines = (data.categories || []).map((category) => {
    const amount = working.amounts[category.id] || 0;
    const pct = working.total > 0 ? Math.round((amount / working.total) * 100) : 0;
    return `${category.label}: ${progressMoney(amount)} (${pct}%)`;
  });
  const revision = data.revision || {};
  const revised = ["total", "special", "general", "department", "external", "language", "drug", "other"].some((key) => String(revision[key] || "").trim() !== "");
  const slides = [
    { slot: "cover", title: `මාසික වාර්ෂික ප්‍රගතිය · ${data.year}`, lines: [`${data.year} ජනවාරි 01 සිට ${until} දක්වා.`, "ප්‍රතිපාදන, කළ පුහුණු, පුහුණු ලාභීන්, වැය වූ වියදම සහ ඉතිරි ප්‍රතිපාදන."], pie: null },
    { slot: "alloc", title: "මුළු ප්‍රතිපාදනය සහ බිඳවැටීම", lines: [`මුළු ප්‍රතිපාදනය ${progressMoney(working.total)}.`, ...allocLines], pie: "alloc" },
  ];
  if (revised || revision.date || revision.note) {
    const lines = [`සංශෝධන දිනය: ${revision.date || "—"}.`, revision.note || "වර්ෂය මැද සංශෝධිත ප්‍රතිපාදන."];
    (data.categories || []).forEach((category) => {
      if (String(revision[category.id] || "").trim() !== "") lines.push(`${category.label}: ${progressMoney(revision[category.id])}`);
    });
    slides.push({ slot: "revision", title: "වර්ෂය මැද සංශෝධනය", lines, pie: null });
  }
  range.months.forEach((month) => {
    const lines = (data.categories || []).map((category) => {
      const cell = month.rows[category.id];
      return `${category.label}: කළ පුහුණු ${cell.held}, ලාභීන් ${cell.people}, වියදම ${progressMoney(cell.spent)}`;
    });
    slides.push({ slot: `month-${month.month}`, title: month.label, lines, pie: null });
  });
  const leftLines = (data.categories || []).map((category) => {
    const left = (working.amounts[category.id] || 0) - range.cats[category.id].spent;
    return `${category.label}: වියදම ${progressMoney(range.cats[category.id].spent)}, ඉතිරිය ${progressMoney(left)}`;
  });
  const spentAll = Object.values(range.cats).reduce((sum, cell) => sum + cell.spent, 0);
  slides.push({
    slot: "close",
    title: "සම්පූර්ණ ප්‍රගතිය",
    lines: [`${until} දක්වා වැය වූයේ ${progressMoney(spentAll)}. ඉතිරි මුළු ප්‍රතිපාදන ${progressMoney(working.total - spentAll)}.`, ...leftLines],
    pie: "spent",
  });
  const kept = {};
  (saved || []).forEach((slide) => { kept[slide.slot] = slide; });
  return slides.map((slide) => ({
    ...slide,
    title: kept[slide.slot]?.title || slide.title,
    body: kept[slide.slot]?.body || slide.lines.join(" "),
  }));
}

function paceBlankMap(categories) {
  const box = {};
  (categories || []).forEach((category) => { box[category.id] = { held: 0, people: 0, spent: 0 }; });
  return box;
}
function paceAddItem(box, item) {
  const cell = box[item.category];
  if (!cell) return;
  cell.held += Number(item.held) ? 1 : 0;
  cell.people += advanceNumber(item.people);
  cell.spent += advanceNumber(item.spent);
}
function paceAllocMap(data) {
  const original = data.original || {};
  const revision = data.revision || {};
  const amounts = {};
  (data.categories || []).forEach((category) => {
    const revised = String(revision[category.id] || "").trim();
    amounts[category.id] = revised !== "" ? advanceNumber(revised) : advanceNumber(original[category.id]);
  });
  return amounts;
}
function paceCut(data, until) {
  const all = paceBlankMap(data.categories);
  const months = [];
  (data.months || []).forEach((month) => {
    const start = `${data.year}-${month.month}-01`;
    if (until < start) return;
    const end = paceMonthEnd(data.year, month.month);
    const row = paceBlankMap(data.categories);
    (data.items || []).forEach((item) => {
      if (item.month !== month.month || !item.day || item.day > until) return;
      paceAddItem(row, item);
      paceAddItem(all, item);
    });
    months.push({ month: month.month, label: month.label, end: end < until ? end : until, rows: row });
  });
  return { all, months };
}
function paceSheet(title, categories, alloc, stats, remain) {
  const ids = categories.map((category) => category.id);
  const sum = (pick) => ids.reduce((total, id) => total + (Number(pick(id)) || 0), 0);
  const show = (value, money) => money ? progressMoney(value) : String(Math.round(Number(value) || 0));
  const line = (label, pick, money) => `<tr><th>${label}</th>${ids.map((id) => `<td>${show(pick(id), money)}</td>`).join("")}<td>${show(sum(pick), money)}</td></tr>`;
  return `<div class="table-wrap"><table class="pace-sheet">
    <caption>${esc(title)}</caption>
    <thead><tr><th>විස්තරය</th>${categories.map((category) => `<th>${esc(category.label)}</th>`).join("")}<th>මුළු එකතුව</th></tr></thead>
    <tbody>
      ${line("මෙවර ඇති ප්‍රතිපාදන", (id) => alloc[id] || 0, true)}
      ${line("වියදම", (id) => stats[id]?.spent || 0, true)}
      ${line("වැඩසටහන් ගණන", (id) => stats[id]?.held || 0, false)}
      ${line("සහභාගී වූ ගණන", (id) => stats[id]?.people || 0, false)}
      ${line("ඉතිරි ප්‍රතිපාදන", (id) => (alloc[id] || 0) - (remain[id]?.spent || 0), true)}
    </tbody>
  </table></div>`;
}
function paintBarCanvas(canvas, labels, series) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  const max = Math.max(1, ...series.flatMap((item) => item.values));
  const left = 54;
  const top = 36;
  const bottom = height - 78;
  const plotW = width - left - 16;
  const groupW = plotW / Math.max(1, labels.length);
  const barW = Math.max(6, (groupW - 10) / Math.max(1, series.length));
  ctx.strokeStyle = "#d5e3f0";
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(width - 12, bottom);
  ctx.stroke();
  series.forEach((item, index) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(left + index * 78, 10, 12, 12);
    ctx.fillStyle = "#1b1b1b";
    ctx.font = '14px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
    ctx.fillText(item.name, left + index * 78 + 16, 21);
  });
  labels.forEach((label, index) => {
    series.forEach((item, seriesIndex) => {
      const value = Number(item.values[index]) || 0;
      const barH = ((bottom - top) * value) / max;
      const x = left + index * groupW + 6 + seriesIndex * barW;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, bottom - barH, barW - 2, barH);
    });
    ctx.save();
    ctx.translate(left + index * groupW + groupW / 2, bottom + 8);
    ctx.rotate(-0.7);
    ctx.fillStyle = "#1b1b1b";
    ctx.font = '13px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
    ctx.fillText(String(label).slice(0, 18), 0, 0);
    ctx.restore();
  });
}
function paceDateLabel(until) {
  const months = ["", "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජුනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"];
  const bits = String(until || "").split("-");
  const month = months[Number(bits[1])] || bits[1] || "";
  const day = Number(bits[2]) || bits[2] || "";
  return `${month} ${day} වන දිනට කරන ලද`;
}
async function renderPace(work) {
  const year = state.query.get("year") || chosenYear();
  const tab = state.query.get("tab") === "report" ? "report" : "sheet";
  const data = await api("pace", { query: { year } });
  state.paceData = data;
  const categories = data.categories || [];
  const asked = state.query.get("until") || "";
  const today = localToday();
  const until = asked.startsWith(`${data.year}-`) ? asked : (today.startsWith(`${data.year}-`) ? today : `${data.year}-12-31`);
  const alloc = paceAllocMap(data);
  const cut = paceCut(data, until);
  const sumOf = (stats, key) => categories.reduce((total, category) => total + (Number(stats[category.id]?.[key]) || 0), 0);
  const allocTotal = categories.reduce((total, category) => total + (alloc[category.id] || 0), 0);
  const spentTotal = sumOf(cut.all, "spent");
  const heldTotal = sumOf(cut.all, "held");
  const peopleTotal = sumOf(cut.all, "people");
  const leftTotal = allocTotal - spentTotal;
  const yearOptions = yearChoices().map((value) => `<option value="${esc(value)}"${value === String(data.year) ? " selected" : ""}>${esc(value)}</option>`).join("");
  const head = `<h2 class="classic-title">මාසික වාර්ෂික ප්‍රගතිය</h2>
    <p class="progress-tabs">
      <button type="button" class="btn${tab === "sheet" ? "" : " secondary"}" data-act="pace-tab" data-tab="sheet">සාරාංශය</button>
      <button type="button" class="btn${tab === "report" ? "" : " secondary"}" data-act="pace-tab" data-tab="report">වාර්තා</button>
    </p>`;
  const tools = `<form class="sheet-tools" id="pace-until">
    <label>වර්ෂය <select id="pace-year">${yearOptions}</select></label>
    <label>දිනය දක්වා <input type="date" id="pace-date" value="${esc(until)}"></label>
  </form>`;
  state.paceView = { year: data.year, until, categories, alloc, cut, allocTotal, spentTotal, heldTotal, peopleTotal, leftTotal };
  if (tab === "report") {
    const ranked = [...categories].sort((a, b) => (cut.all[b.id]?.spent || 0) - (cut.all[a.id]?.spent || 0));
    const top = ranked[0];
    const analysis = `${data.year} වර්ෂයේ ${paceDateLabel(until)} දක්වා පුහුණු වැඩසටහන් ${heldTotal}ක් පවත්වා ඇත. සහභාගී වූවන් ${Math.round(peopleTotal)}කි. වියදම රු. ${progressMoney(spentTotal)}කි. ඉතිරි ප්‍රතිපාදන රු. ${progressMoney(leftTotal)}කි.${top && (cut.all[top.id]?.spent || 0) > 0 ? ` වැඩිම වියදම ${top.label} සඳහාය.` : ""}`;
    state.pacePies = {
      alloc: paceSlices(categories, alloc),
      spent: paceSlices(categories, Object.fromEntries(categories.map((category) => [category.id, cut.all[category.id]?.spent || 0]))),
    };
    state.paceBars = {
      money: {
        labels: categories.map((category) => category.label),
        series: [
          { name: "ප්‍රතිපාදන", color: "#87ceeb", values: categories.map((category) => alloc[category.id] || 0) },
          { name: "වියදම", color: "#0c4da2", values: categories.map((category) => cut.all[category.id]?.spent || 0) },
        ],
      },
      months: {
        labels: cut.months.map((month) => month.label),
        series: [
          { name: "වැඩසටහන්", color: "#0c4da2", values: cut.months.map((month) => sumOf(month.rows, "held")) },
          { name: "සහභාගී", color: "#198064", values: cut.months.map((month) => sumOf(month.rows, "people")) },
        ],
      },
    };
    const slides = [
      { title: `${data.year} ප්‍රගති වාර්තාව`, body: paceDateLabel(until) },
      { title: "විශ්ලේෂණය", body: analysis },
      { title: "ප්‍රතිපාදන බෙදීම", pie: "alloc" },
      { title: "වියදම බෙදීම", pie: "spent" },
      { title: "ප්‍රතිපාදන සහ වියදම", bar: "money" },
      { title: "මාස අනුව වැඩසටහන්", bar: "months" },
    ];
    work.innerHTML = `${head}${tools}
      <button type="button" class="btn" data-act="pace-show-pdf">ඉදිරිපත් කිරීම PDF</button>
      <section class="pace-dash">
        <article class="pace-card"><span>මෙවර ඇති ප්‍රතිපාදන</span><b>${progressMoney(allocTotal)}</b></article>
        <article class="pace-card"><span>වියදම</span><b>${progressMoney(spentTotal)}</b></article>
        <article class="pace-card"><span>වැඩසටහන් ගණන</span><b>${heldTotal}</b></article>
        <article class="pace-card"><span>සහභාගී වූ ගණන</span><b>${Math.round(peopleTotal)}</b></article>
        <article class="pace-card"><span>ඉතිරි ප්‍රතිපාදන</span><b>${progressMoney(leftTotal)}</b></article>
      </section>
      <p class="pace-copy">${esc(analysis)}</p>
      <div class="pace-charts">
        <section class="pace-chart"><h3>ප්‍රතිපාදන</h3><canvas class="pace-pie" data-pie="alloc" width="640" height="300"></canvas></section>
        <section class="pace-chart"><h3>වියදම</h3><canvas class="pace-pie" data-pie="spent" width="640" height="300"></canvas></section>
        <section class="pace-chart"><h3>ප්‍රතිපාදන සහ වියදම</h3><canvas data-bar="money" width="720" height="340"></canvas></section>
        <section class="pace-chart"><h3>මාස අනුව</h3><canvas data-bar="months" width="720" height="340"></canvas></section>
      </div>
      <h3>ඉදිරිපත් කිරීම</h3>
      <div id="pace-slides">${slides.map((slide) => `<article class="pace-slide">
        <h3 class="pace-slide-title">${esc(slide.title)}</h3>
        ${slide.body ? `<p class="pace-slide-body">${esc(slide.body)}</p>` : ""}
        ${slide.pie ? `<canvas class="pace-pie" data-pie="${esc(slide.pie)}" width="640" height="280"></canvas>` : ""}
        ${slide.bar ? `<canvas data-bar="${esc(slide.bar)}" width="720" height="320"></canvas>` : ""}
      </article>`).join("")}</div>`;
    paintPacePies(work);
    work.querySelectorAll("canvas[data-bar]").forEach((canvas) => {
      const spec = state.paceBars[canvas.dataset.bar];
      if (spec) paintBarCanvas(canvas, spec.labels, spec.series);
    });
    return;
  }
  const running = {};
  const monthly = cut.months.map((month) => {
    categories.forEach((category) => {
      running[category.id] = running[category.id] || { spent: 0 };
      running[category.id].spent += month.rows[category.id]?.spent || 0;
    });
    const remain = {};
    categories.forEach((category) => { remain[category.id] = { spent: running[category.id].spent }; });
    return paceSheet(`ප්‍රගති සාරාංශය (${month.label})`, categories, alloc, month.rows, remain);
  }).join("");
  work.innerHTML = `${head}${tools}
    ${paceSheet(`ප්‍රගති සාරාංශය (${paceDateLabel(until)})`, categories, alloc, cut.all, cut.all)}
    ${monthly}`;
}

function progressPercent(done, plan) {
  const target = Number(plan) || 0;
  const got = Number(done) || 0;
  if (target <= 0) return got > 0 ? "100%" : "–";
  return `${Math.round((got / target) * 100)}%`;
}
function progressMoney(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
function progressFilled(cell) {
  return ["planCount", "heldCount", "planMoney", "spentMoney", "planPeople", "camePeople"].some((key) => Number(cell?.[key]) > 0);
}
function progressTable(categories, rows, items, hideEmpty) {
  const byId = {};
  (items || []).forEach((item) => {
    if (!byId[item.category]) byId[item.category] = [];
    byId[item.category].push(item);
  });
  const line = (category) => {
    const cell = rows[category.id] || {};
    const programmes = (byId[category.id] || []).map((item) =>
      `<li>${esc(item.day || "")} ${esc(item.name)} — ${item.held ? "පැවැත්වූ" : "සැලැස්ම"} · ${progressMoney(item.spentMoney)} / ${progressMoney(item.planMoney)} · ${esc(item.camePeople)} / ${esc(item.planPeople)}</li>`).join("");
    return `<tr>
      <td>${esc(category.label)}</td>
      <td>${esc(cell.planCount || 0)}</td><td>${esc(cell.heldCount || 0)}</td><td>${progressPercent(cell.heldCount, cell.planCount)}</td>
      <td>${progressMoney(cell.planMoney)}</td><td>${progressMoney(cell.spentMoney)}</td><td>${progressPercent(cell.spentMoney, cell.planMoney)}</td>
      <td>${esc(cell.planPeople || 0)}</td><td>${esc(cell.camePeople || 0)}</td><td>${progressPercent(cell.camePeople, cell.planPeople)}</td>
    </tr>${programmes ? `<tr class="progress-detail"><td colspan="10"><ul>${programmes}</ul></td></tr>` : ""}`;
  };
  const band = (title, ids) => {
    const picked = categories.filter((category) => ids.includes(category.id) && (!hideEmpty || progressFilled(rows[category.id]) || (byId[category.id] || []).length));
    if (!picked.length) return "";
    return `<tr class="progress-band"><th colspan="10">${title}</th></tr>${picked.map(line).join("")}`;
  };
  const body = categories.length === 1
    ? line(categories[0])
    : `${band("විශේෂ · පොදු · දෙපාර්තමේන්තු", ["special", "general", "department"])}${band("බාහිර · විදේශ", ["external", "foreign"])}`;
  return `<div class="table-wrap"><table class="progress-table"><thead><tr>
      <th>වර්ගය</th>
      <th>පුහුණු ගණන</th><th>පැවැත්වූ</th><th>ප්‍රගතිය</th>
      <th>මුදල් සැලැස්ම</th><th>වියදම</th><th>මූල්‍ය ප්‍රගතිය</th>
      <th>ලාභීන්</th><th>පැමිණි</th><th>ලාභී ප්‍රගතිය</th>
    </tr></thead><tbody>${body}</tbody></table></div>`;
}
async function renderPerson(work) {
  const year = state.query.get("year") || chosenYear();
  const tab = state.query.get("tab") === "detail" ? "detail" : "summary";
  const data = await api("person", { query: { year } });
  const categories = data.categories || [];
  const asideIds = ["drug", "tamil"];
  const officerCategories = categories.filter((category) => !asideIds.includes(category.id));
  const officers = data.officers || [];
  const metricKeys = ["planCount", "heldCount", "planMoney", "spentMoney", "planPeople", "camePeople"];
  const blankCell = () => ({ planCount: 0, heldCount: 0, planMoney: 0, spentMoney: 0, planPeople: 0, camePeople: 0 });
  const addCell = (total, cell) => metricKeys.forEach((key) => { total[key] += Number(cell?.[key]) || 0; });
  const combined = { annual: {}, months: {} };
  officerCategories.forEach((category) => { combined.annual[category.id] = blankCell(); });
  officers.forEach((officer) => {
    officerCategories.forEach((category) => addCell(combined.annual[category.id], (officer.annual || {})[category.id]));
    (officer.months || []).forEach((month) => {
      const items = (month.items || []).filter((item) => !asideIds.includes(item.category));
      const filled = officerCategories.some((category) => progressFilled((month.rows || {})[category.id]));
      if (!filled && !items.length) return;
      if (!combined.months[month.month]) combined.months[month.month] = { month: month.month, label: month.label, rows: {}, items: [] };
      const bucket = combined.months[month.month];
      officerCategories.forEach((category) => {
        if (!bucket.rows[category.id]) bucket.rows[category.id] = blankCell();
        addCell(bucket.rows[category.id], (month.rows || {})[category.id]);
      });
      bucket.items.push(...items);
    });
  });
  const tally = (annual) => {
    const box = { plan: 0, held: 0, people: 0, came: 0, spent: 0 };
    officerCategories.forEach((category) => {
      const cell = (annual || {})[category.id] || {};
      box.plan += Number(cell.planCount) || 0;
      box.held += Number(cell.heldCount) || 0;
      box.people += Number(cell.planPeople) || 0;
      box.came += Number(cell.camePeople) || 0;
      box.spent += Number(cell.spentMoney) || 0;
    });
    return box;
  };
  const officerCard = (officer, withItems, index, usedCategories) => {
    const shown = usedCategories || officerCategories;
    const months = (officer.months || []).filter((month) => shown.some((category) => progressFilled((month.rows || {})[category.id]) || (month.items || []).some((item) => item.category === category.id))).map((month) =>
      `<h4>${esc(month.label)}</h4>${progressTable(shown, month.rows || {}, withItems ? month.items : [], true)}`).join("");
    const mark = index ? `${index}. ` : "";
    return `<section class="progress-officer" id="officer-${esc(officer.id ?? "all")}">
      <h3>${mark}${esc(officer.username)}</h3>
      <h4>වාර්ෂික ඉලක්ක ප්‍රගතිය</h4>
      ${progressTable(shown, officer.annual || {}, [], false)}
      <h4>මාසික ප්‍රගතිය</h4>
      ${months || `<p class="muted">මේ වර්ෂයට මාසික වැඩසටහන් නැත.</p>`}
    </section>`;
  };
  const asideSection = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return "";
    const annual = blankCell();
    const months = {};
    officers.forEach((officer) => {
      addCell(annual, (officer.annual || {})[categoryId]);
      (officer.months || []).forEach((month) => {
        const items = (month.items || []).filter((item) => item.category === categoryId);
        const row = (month.rows || {})[categoryId] || {};
        if (!progressFilled(row) && !items.length) return;
        if (!months[month.month]) months[month.month] = { month: month.month, label: month.label, rows: { [categoryId]: blankCell() }, items: [] };
        addCell(months[month.month].rows[categoryId], row);
        months[month.month].items.push(...items);
      });
    });
    const monthList = Object.values(months).sort((a, b) => String(a.month).localeCompare(String(b.month)));
    const monthHtml = monthList.map((month) => `<h4>${esc(month.label)}</h4>${progressTable([category], month.rows, tab === "detail" ? month.items : [], true)}`).join("");
    return `<section class="progress-officer" id="aside-${esc(categoryId)}">
      <h3>${esc(category.label)}</h3>
      <h4>වාර්ෂික ඉලක්ක ප්‍රගතිය</h4>
      ${progressTable([category], { [categoryId]: annual }, [], false)}
      <h4>මාසික ප්‍රගතිය</h4>
      ${monthHtml || `<p class="muted">මේ වර්ගයේ මාසික වැඩසටහන් නැත.</p>`}
    </section>`;
  };
  const everyone = {
    id: "all",
    username: "සියලු නිලධාරීන්",
    annual: combined.annual,
    months: Object.values(combined.months).sort((a, b) => String(a.month).localeCompare(String(b.month)))
  };
  const heldValues = {};
  officerCategories.forEach((category) => { heldValues[category.id] = Number((combined.annual[category.id] || {}).heldCount) || 0; });
  state.pacePies = { person: paceSlices(officerCategories, heldValues) };
  const order = officers.map((officer, index) => {
    const box = tally(officer.annual);
    return `<tr data-act="pace-jump" data-jump="officer-${esc(officer.id)}"><td>${index + 1}</td><td>${esc(officer.username)}</td><td>${box.held} / ${box.plan}</td><td>${box.came} / ${box.people}</td><td>${progressMoney(box.spent)}</td></tr>`;
  }).join("");
  const yearOptions = yearChoices().map((value) => `<option value="${esc(value)}"${value === String(year) ? " selected" : ""}>${esc(value)}</option>`).join("");
  const people = officers.map((officer, index) => officerCard(officer, tab === "detail", index + 1)).join("") || `<p class="muted">නිලධාරීන් නැත.</p>`;
  work.innerHTML = `<h2 class="classic-title">එක් පුද්ගල වාර්තා</h2>
    <p class="pad-note">නිලධාරීන්ගේ ගණන්වලට මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන පුහුණු සහ දෙමළ භාෂා පුහුණු ඇතුළත් නැහැ. ඒවා යට වෙනම වගු වල.</p>
    <form class="sheet-tools"><label>වර්ෂය <select id="person-year">${yearOptions}</select></label></form>
    <p class="progress-tabs">
      <button type="button" class="btn${tab === "summary" ? "" : " secondary"}" data-act="person-tab" data-tab="summary">සාරාංශ ප්‍රගති වාර්තාව</button>
      <button type="button" class="btn${tab === "detail" ? "" : " secondary"}" data-act="person-tab" data-tab="detail">විස්තරාත්මක ප්‍රගති වාර්තාව</button>
    </p>
    <section class="pace-top">
      <canvas class="pace-pie" data-pie="person" width="640" height="300"></canvas>
      <div class="table-wrap"><table class="progress-order">
        <thead><tr><th>අංකය</th><th>නිලධාරියා</th><th>පැවැත්වූ</th><th>ලාභීන්</th><th>වියදම</th></tr></thead>
        <tbody>${order}</tbody>
      </table></div>
    </section>
    ${tab === "summary" ? officerCard(everyone, false, 0) : ""}${people}
    ${asideSection("drug")}
    ${asideSection("tamil")}`;
  paintPacePies(work);
}
async function renderTotal(work) {
  const year = state.query?.get("year") || chosenYear();
  const data = await api("total", { query: { year } });
  const split = await api("split", { query: { year: data.year } }).catch(() => null);
  state.splitPlan = split;
  const groups = data.groups || [];
  const years = data.years || [];
  const options = years.map((item) => `<option value="${esc(item)}"${String(item) === String(data.year) ? " selected" : ""}>${esc(item)}</option>`).join("");
  const categoryOptions = (selected) => groups.map((group) => `<option value="${esc(group.id)}"${group.id === selected ? " selected" : ""}>${esc(group.label)}</option>`).join("");
  const head = TOTAL_FIELDS.map((field) => `<th>${esc(L(field[1], field[2], field[3]))}</th>`).join("");
  const foot = TOTAL_FIELDS.map((field) => `<td data-sum="${field[0]}">0</td>`).join("");
  const grand = TOTAL_FIELDS.map((field) => `<span><b>${esc(L(field[1], field[2], field[3]))}</b> <em data-grand="${field[0]}">0</em></span>`).join("");
  const tables = groups.map((group) => {
    const rows = (group.rows || []).map((row) => `<tr class="total-row" data-id="${esc(row.id)}">
      <td class="wrap-cell">${esc(row.name)}</td>
      <td>${esc(showDate(row.day))}</td>
      <td class="wrap-cell">${esc(row.place || "")}</td>
      ${TOTAL_FIELDS.map((field) => `<td><input data-field="${field[0]}" value="${esc(row.values?.[field[0]] || "")}"></td>`).join("")}
      <td><select data-field="category">${categoryOptions(row.category)}</select></td>
    </tr>`).join("");
    return `<section class="total-group">
      <h2 class="classic-title">${esc(group.label)}</h2>
      <p class="pad-note">${esc(L("මේ වර්ගයේ ප්‍රතිපාදන: ", "இந்த வகையின் ஒதுக்கீடு: ", "Allocation for this category: "))}${esc(group.allocation || "0")}</p>
      ${rows ? `<div class="table-wrap desig-list"><table class="total-sheet">
        <thead><tr>
          <th>${esc(L("පුහුණුව", "பயிற்சி", "Programme"))}</th>
          <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
          <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
          ${head}
          <th>${esc(L("වර්ගය", "வகை", "Category"))}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="3">${esc(L("එකතුව", "மொத்தம்", "Total"))}</td>${foot}<td></td></tr></tfoot>
      </table></div>` : `<p class="pad-note">${esc(L("මේ වර්ගයේ පුහුණු නැත.", "இந்த வகையில் பயிற்சி இல்லை.", "No programmes in this category."))}</p>`}
    </section>`;
  }).join("");
  work.innerHTML = `
    <h2 class="classic-title">Total</h2>
    <p class="pad-note">${esc(L("එක් පුහුණුවක් එක පේළියකි. තෝරාගත්තත් නැතත්, මේ වර්ෂයේ ඇතුළත් සියලු පුහුණු මෙහි එනවා. ගණන් පද්ධතියෙන් එනවා. පේළියේ ඉලක්කම වෙනස් කරලා සුරකින්න පුළුවන්. ගණනය කරන්න ඔබූවාම පද්ධතියේ ගණන් ආයෙ එනවා.", "ஒரு பயிற்சி ஒரு வரி. தேர்ந்தாலும் இல்லாவிட்டாலும் இந்த ஆண்டில் சேர்த்த அனைத்துப் பயிற்சிகளும் இங்கே வரும். எண்கள் முறைமையிலிருந்து வரும். வரியின் எண்ணை மாற்றிச் சேமிக்கலாம். கணக்கிடு என்றால் முறைமையின் எண்கள் மீண்டும் வரும்.", "One programme is one row. Every programme entered for this year is here, whether officers were selected or not. The figures come from the system. You can change a figure in the row and save it. Calculate brings the system figures back."))}</p>
    <form class="sheet-tools" id="total-year">
      <label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))} <select name="year">${options}</select></label>
    </form>
    <p class="total-grand">${esc(L("වර්ෂයේ මුළු ප්‍රතිපාදන: ", "ஆண்டின் மொத்த ஒதுக்கீடு: ", "Year allocation: "))}<b>${esc(data.allocationTotal || "0")}</b> · ${esc(L("පුහුණු: ", "பயிற்சி: ", "Programmes: "))}<b id="total-count">0</b></p>
    <p class="total-grand">${grand}</p>
    <form id="total-form">
      <p>
        <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
        <button type="button" data-act="total-calc">${esc(L("ගණනය කරන්න", "கணக்கிடு", "Calculate"))}</button>
      </p>
      <div id="form-msg"></div>
      ${tables}
    </form>
    <section>
      <h2 class="classic-title">${esc(L("එක් පුද්ගල සැලැස්ම", "ஒரு நபர் திட்டம்", "One-person plan"))}</h2>
      <p class="pad-note">${esc(L("මේ වර්ෂයේ දාලා තියෙන සැලැස්ම සම්බන්ධීකරණ නිලධාරීන් දහදෙනාට බෙදලා තියෙනවා. එක් අයෙකුගේ දින ගණන අනිත් අයට සමාන වෙන විදිහට. පොදු පුහුණු, පරිගණක පුහුණු, දෙපාර්තමේන්තු පුහුණු වෙන වෙනම බෙදනවා. දෙපාර්තමේන්තුවක් එකට තියෙනවා. මත්ද්‍රව්‍ය, බාහිර පුහුණු, දෙමළ භාෂා පුහුණු බෙදන්නේ නැහැ. නම ටයිප් කරලා PDF එක ගන්න. එක් අයෙකුට එක් පිටුවක්.", "இந்த ஆண்டின் திட்டம் பத்து ஒருங்கிணைப்பு அதிகாரிகளுக்கும் பிரிக்கப்பட்டுள்ளது. ஒவ்வொருவரின் நாட்களும் சமமாக. பொது, கணினி, திணைக்களப் பயிற்சி தனியே பிரிக்கப்படும். ஒரு திணைக்களம் ஒன்றாக இருக்கும். போதை, வெளி, தமிழ் மொழிப் பயிற்சி பிரிக்கப்படாது. பெயரை எழுதி PDF எடுக்கவும். ஒருவருக்கு ஒரு பக்கம்.", "This year's plan is divided among the ten coordination officers so the days are as equal as possible. General, computer, and department training are divided separately. A department stays together. Drug, external, and Tamil language training are left out. Type the name and take the PDF. One page for each officer."))}</p>
      <p><button type="button" data-act="split-pdf">${esc(L("එක් පුද්ගල සැලැස්ම PDF", "ஒரு நபர் திட்ட PDF", "One-person plan PDF"))}</button></p>
      ${splitPreview(split)}
    </section>`;
  paintTotalSums();
}

function waWebUrl(phone, text) {
  return `https://web.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text || "")}`;
}

function openWhatsAppWeb(kind) {
  const people = (state.messageOfficers || []).filter((person) => person.phone);
  const missing = (state.messageOfficers || []).length - people.length;
  const slot = $("#form-msg");
  if (!people.length) {
    const text = L("දුරකථන අංක තියෙන තෝරාගත් නිලධාරීන් නැත.", "தொலைபேசி எண் உள்ள தேர்ந்த அதிகாரிகள் இல்லை.", "There are no selected officers with a phone number.");
    if (slot) slot.innerHTML = `<div class="error">${esc(text)}</div>`;
    else alert(text);
    return;
  }
  const rows = people.map((person) => {
    const text = kind === "remind" ? person.remind : person.notice;
    return `<li><span>${esc(person.name)} · ${esc(person.mobile || person.phone)}</span> <a class="btn secondary" href="${esc(waWebUrl(person.phone, text))}" target="_blank" rel="noopener">${esc(L("යවන්න", "அனுப்பு", "Send"))}</a></li>`;
  }).join("");
  if (slot) {
    slot.innerHTML = `<div class="ok">${esc(L("WhatsApp Web එක අරිනවා. පණිවිඩය ලියලා තියෙනවා. එතන යවන්න ඔබන්න. ඊළඟ නිලධාරියාටත් යවන්න ඔබන්න.", "WhatsApp Web திறக்கும். செய்தி எழுதப்பட்டிருக்கும். அங்கே அனுப்பு என்பதை அழுத்தவும். அடுத்த அதிகாரிக்கும் அனுப்பு என்பதை அழுத்தவும்.", "WhatsApp Web opens. The message is already written. Press send there. Press send for the next officer too."))}${missing ? ` ${esc(L("අංකය නැති අය ", "எண் இல்லாதவர்கள் ", "Without a number "))}${esc(missing)}.` : ""}</div><ol class="wa-queue">${rows}</ol>`;
  }
  window.open(waWebUrl(people[0].phone, kind === "remind" ? people[0].remind : people[0].notice), "_blank");
}

async function renderMessages(work) {
  const atp = state.query?.get("atp") || "";
  const data = await api("messages", { query: atp ? { atp } : {} });
  const options = (data.programmes || []).map((item) => {
    const when = showDate(item.day);
    return `<option value="${esc(item.id)}"${String(item.id) === String(atp) ? " selected" : ""}>${esc(item.name)}${when ? ` · ${esc(when)}` : ""}</option>`;
  }).join("");
  state.messageOfficers = data.officers || [];
  const officers = state.messageOfficers.map((person) => `<tr>
    <td class="wrap-cell">${esc(person.name)}</td>
    <td class="wrap-cell">${esc(person.email || "")}</td>
    <td>${esc(person.mobile || "")}</td>
  </tr>`).join("");
  const preview = data.preview || {};
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("පණිවිඩ", "செய்திகள்", "Messages"))}</h2>
    <p class="pad-note">${esc(L("ඊමේල් යන්නේ ", "மின்னஞ்சல் அனுப்புவது ", "Email is sent from "))}${esc(data.from || "")}${esc(L(" ගෙන්. තෝරාගත් නිලධාරීන්ටයි.", " இலிருந்து. தேர்ந்த அதிகாரிகளுக்கு.", ". It goes to the selected officers."))}</p>
    <form class="classic-form" id="gmail-app-form">
      <h2 class="classic-title">${esc(L("Gmail යවන මුරපදය", "Gmail அனுப்பும் கடவுச்சொல்", "Gmail sending password"))}</h2>
      <p class="pad-note">${data.gmailApp
        ? esc(L("App password එක සුරැකිලා තියෙනවා. ඊමේල් යවන්න ඔබන්න. වෙනස් කරන්න ඕන නම් අලුත් එක මෙතන දාන්න.", "App password சேமிக்கப்பட்டுள்ளது. மின்னஞ்சல் அனுப்பு என்பதை அழுத்தவும். மாற்ற வேண்டும் என்றால் புதியதை இங்கே இடவும்.", "The app password is saved. Press send email. To change it, enter a new one here."))
        : esc(L("මේ ගිණුමේ සාමාන්‍ය මුරපදය වෙබ් අඩවියෙන් ඊමේල් යවන්න Google එක දෙන්නේ නැහැ. nwptrainingunit@gmail.com එකෙන් Gmail එකට ලොග් වෙලා 2-Step Verification දාන්න. ඊට පස්සේ App passwords වලින් MDTU කියලා මුරපදයක් හදන්න. ඒ අකුරු 16 මෙතන දාලා සුරකින්න.", "இந்தக் கணக்கின் சாதாரண கடவுச்சொல்லை இணையதளத்திலிருந்து மின்னஞ்சல் அனுப்ப Google அனுமதிப்பதில்லை. nwptrainingunit@gmail.com இல் Gmail இல் நுழைந்து 2-Step Verification இயக்கவும். பின்னர் App passwords இல் MDTU என்று ஒரு கடவுச்சொல்லை உருவாக்கவும். அந்த 16 எழுத்துகளை இங்கே இட்டுச் சேமிக்கவும்.", "Google does not allow this account's normal password to send mail from a website. Sign in to Gmail as nwptrainingunit@gmail.com and turn on 2-Step Verification. Then create an app password named MDTU. Enter those 16 characters here and save."))}</p>
      <p>
        <a class="btn secondary" href="https://myaccount.google.com/signinoptions/two-step-verification" target="_blank" rel="noopener">${esc(L("2-Step Verification අරින්න", "2-Step Verification திற", "Open 2-Step Verification"))}</a>
        <a class="btn secondary" href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">${esc(L("App password හදන්න", "App password உருவாக்கு", "Create an app password"))}</a>
      </p>
      <label class="classic-field"><span>${esc(L("App password", "App password", "App password"))}</span><input name="app" type="password" autocomplete="off" placeholder="${esc(L("අකුරු 16", "16 எழுத்துகள்", "16 characters"))}"></label>
      <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <div id="form-msg"></div>
    </form>
    <p class="pad-note">${esc(L("WhatsApp Business දුරකථනයෙන් ලොග් වෙන්න පුළුවන්. WhatsApp Web අරින්න. දුරකථනයේ WhatsApp Business ඇප් එකෙන් QR එක ස්කෑන් කරන්න. ඊට පස්සේ යවන්න ඔබන්න. පණිවිඩය ලියලා තියෙනවා. WhatsApp Web එකේ යවන්න ඔබන්න.", "WhatsApp Business தொலைபேசியில் இருந்து உள்நுழையலாம். WhatsApp Web திறக்கவும். தொலைபேசியின் WhatsApp Business செயலியில் QR ஐ ஸ்கேன் செய்யுங்கள். பின்னர் அனுப்பு என்பதை அழுத்தவும். செய்தி எழுதப்பட்டிருக்கும். WhatsApp Web இல் அனුப்பு என்பதை அழுத்தவும்.", "You can sign in with the WhatsApp Business phone. Open WhatsApp Web. Scan the QR code in the WhatsApp Business app on the phone. Then press send. The message is already written. Press send in WhatsApp Web."))}</p>
    <p><a class="btn secondary" href="https://web.whatsapp.com/" target="_blank" rel="noopener">${esc(L("WhatsApp Web අරින්න", "WhatsApp Web திற", "Open WhatsApp Web"))}</a></p>
    <form class="classic-form" id="message-pick">
      <label class="classic-field"><span>${esc(L("පුහුණුව සොයන්න", "பயிற்சியைத் தேடு", "Find a programme"))}</span><input name="find" placeholder="${esc(L("පුහුණුවේ නම", "பயிற்சியின் பெயர்", "Programme name"))}"></label>
      <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</span><select name="atp" size="6">${options}</select></label>
    </form>
    ${atp ? `<h2 class="classic-title">${esc(L("තෝරාගත් නිලධාරීන්", "தேர்ந்த அதிகாரிகள்", "Selected officers"))}</h2>
      ${officers ? `<table class="desig-list"><thead><tr>
        <th>${esc(L("නම", "பெயர்", "Name"))}</th>
        <th>${esc(L("ඊමේල්", "மின்னஞ்சல்", "Email"))}</th>
        <th>${esc(L("දුරකථන", "தொலைபேசி", "Phone"))}</th>
      </tr></thead><tbody>${officers}</tbody></table>` : `<p class="pad-note">${esc(L("මේ පුහුණුවට තෝරාගත් නිලධාරීන් නැත.", "இந்தப் பயிற்சிக்குத் தேர்ந்த அதிகாரிகள் இல்லை.", "There are no selected officers for this programme."))}</p>`}
      <h2 class="classic-title">${esc(L("පුහුණුව තියෙනවා", "பயிற்சி உள்ளது", "The programme is on"))}</h2>
      <pre class="notify-preview">${esc(preview.notice || "")}</pre>
      <p>
        <button type="button" class="btn" data-act="message-send" data-kind="notice" data-channel="email">${esc(L("ඊමේල් යවන්න", "மின்னஞ்சல் அனுப்பு", "Send email"))}</button>
        <button type="button" class="btn secondary" data-act="message-send" data-kind="notice" data-channel="whatsapp">${esc(L("WhatsApp Web එකෙන් යවන්න", "WhatsApp Web வழியாக அனுப்பு", "Send with WhatsApp Web"))}</button>
      </p>
      <h2 class="classic-title">${esc(L("පසුදා එනවාද", "மறுநாள் வருகிறீர்களா", "Are you coming the next day"))}</h2>
      <pre class="notify-preview">${esc(preview.remind || "")}</pre>
      <p>
        <button type="button" class="btn" data-act="message-send" data-kind="remind" data-channel="email">${esc(L("ඊමේල් යවන්න", "மின்னஞ்சல் அனுப்பு", "Send email"))}</button>
        <button type="button" class="btn secondary" data-act="message-send" data-kind="remind" data-channel="whatsapp">${esc(L("WhatsApp Web එකෙන් යවන්න", "WhatsApp Web வழியாக அனுப்பு", "Send with WhatsApp Web"))}</button>
      </p>
      <div id="form-msg"></div>` : `<p class="pad-note">${esc(L("පුහුණු වැඩසටහනක් තෝරන්න.", "ஒரு பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme."))}</p>`}`;
}

function evalBoardHref(id, kind, q, reveal) {
  return `#console/evaluation?tab=present&id=${encodeURIComponent(id)}&kind=${kind}&q=${q}${reveal ? "&reveal=1" : ""}`;
}

function evalWinners(people) {
  const scored = (people || []).filter((person) => (person.answers || []).length);
  if (!scored.length) return [];
  const top = Math.max(...scored.map((person) => Number(person.score) || 0));
  return scored.filter((person) => Number(person.score) === top);
}

function evalAnswerFeed(people) {
  const feed = [];
  (people || []).forEach((person) => {
    (person.answers || []).forEach((answer) => {
      feed.push({ name: person.name, no: Number(answer.no), at: String(answer.at || ""), ok: !!answer.ok });
    });
  });
  feed.sort((a, b) => b.at.localeCompare(a.at) || b.no - a.no);
  return feed;
}

function paintEvalLive(data, q, end) {
  const slot = $("#eval-live");
  if (!slot) return;
  const people = data.people || [];
  const feed = evalAnswerFeed(people);
  const latest = feed[0] || null;
  if (end) {
    const winners = evalWinners(people);
    const ranked = [...people].filter((person) => (person.answers || []).length).sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)));
    slot.innerHTML = `
      <div class="eval-champion">
        <p>${esc(L("වැඩිම ලකුණු", "அதிக மதிப்பெண்", "Highest marks"))}</p>
        <strong>${esc(winners.map((person) => person.name).join(" · ") || L("තව කිසිවෙක් උත්තර දී නැත", "இன்னும் யாரும் விடையளிக்கவில்லை", "Nobody has answered yet"))}</strong>
        ${winners.length ? `<em>${esc(winners[0].score)} / 100</em>` : ""}
      </div>
      <ol class="eval-rank">${ranked.map((person) => `<li><span>${esc(person.name)}</span><b>${esc(person.score)}</b></li>`).join("")}</ol>`;
    return;
  }
  const answeredLine = (name, no) => `${name} — ${L("ප්‍රශ්නය ", "கேள்வி ", "Question ")}${no} ${L("ට උත්තර දුන්නා", "க்கு விடையளித்தார்", "answered")}`;
  const recent = feed.slice(0, 8).map((item, index) => `<li class="${index === 0 ? "fresh" : ""}"><span>${esc(item.name)}</span><em>${esc(L("ප්‍රශ්නය ", "கேள்வி ", "Question "))}${esc(item.no)} ${esc(L("ට උත්තර දුන්නා", "க்கு விடையளித்தார்", "answered"))}</em></li>`).join("");
  const here = people.map((person) => {
    const answer = (person.answers || []).find((item) => Number(item.no) === Number(q));
    const done = new Set((person.answers || []).map((item) => Number(item.no)));
    const dots = Array.from({ length: 10 }, (_, index) => {
      const no = index + 1;
      const cls = `${done.has(no) ? "on" : ""} ${no === Number(q) ? "here" : ""}`.trim();
      return `<i class="${cls}">${no}</i>`;
    }).join("");
    const stateWord = !answer
      ? L("තව නැත", "இன்னும் இல்லை", "Not yet")
      : (answer.ok ? L("නිවැරදියි", "சரி", "Correct") : L("වැරදියි", "தவறு", "Wrong"));
    return `<li class="${answer ? (answer.ok ? "ok" : "bad") : ""}"><span>${esc(person.name)}</span><span class="eval-dots">${dots}</span><em>${esc(stateWord)}</em>${answer ? `<b>${esc(person.score)} / 100</b>` : ""}</li>`;
  }).join("");
  const waiting = people.filter((person) => !(person.answers || []).some((item) => Number(item.no) === Number(q))).length;
  slot.innerHTML = `
    ${latest ? `<p class="eval-now eval-fresh">${esc(answeredLine(latest.name, latest.no))}</p>` : `<p class="eval-now">${esc(L("තව උත්තර බලා සිටිනවා", "விடைகளுக்காகக் காத்திருக்கிறது", "Waiting for answers"))}</p>`}
    ${recent ? `<ul class="eval-names">${recent}</ul>` : ""}
    <p class="eval-wait">${esc(L("මේ ප්‍රශ්නයට උත්තර දුන්නේ", "இந்தக் கேள்விக்கு விடையளித்தவர்கள்", "Who answered this question"))}</p>
    ${here ? `<ul class="eval-names eval-who">${here}</ul>` : ""}
    <p class="eval-wait">${esc(L("මේ ප්‍රශ්නයට තව උත්තර නැති අය", "இந்தக் கேள்விக்கு இன்னும் விடையில்லாதோர்", "Still to answer this question"))}: ${esc(waiting)}</p>`;
}

async function renderEvalPresent(work) {
  const id = state.query?.get("id") || "";
  const kind = state.query?.get("kind") === "post" ? "post" : "pre";
  const end = state.query?.get("q") === "end";
  const q = end ? 1 : Math.min(10, Math.max(1, Number(state.query?.get("q") || 1)));
  const reveal = state.query?.get("reveal") === "1";
  const data = await api("eval-live", { query: { id, kind, reveal: reveal ? "1" : "" } });
  const question = (data.questions || [])[q - 1] || {};
  const title = kind === "post"
    ? L("පසු ඇගයීම", "பின் மதிப்பீடு", "Post-evaluation")
    : L("පෙර ඇගයීම", "முன் மதிப்பீடு", "Pre-evaluation");
  const options = ["A", "B", "C", "D"].map((letter) => {
    const text = question[letter.toLowerCase()] || "";
    const correct = data.reveal && question.correct === letter;
    return `<div class="eval-option ${letter.toLowerCase()}${correct ? " is-correct" : ""}" data-letter="${letter}"><b>${esc(EVAL_MARK[letter])}</b><span>${esc(text)}</span></div>`;
  }).join("");
  work.innerHTML = `
    <section class="eval-board">
      <header>
        <p>${esc(title)}</p>
        <h2>${esc(data.title || "")}</h2>
        ${end ? "" : `<p>${esc(L("ප්‍රශ්නය", "கேள்வி", "Question"))} ${q} / 10</p>`}
      </header>
      ${end ? "" : `<div class="eval-ask">${esc(question.text || "")}</div><div class="eval-options">${options}</div>`}
      <div id="eval-live"></div>
      <nav class="eval-nav">
        ${end ? "" : `<a class="btn secondary" href="${evalBoardHref(id, kind, Math.max(1, q - 1), reveal)}">${esc(L("පෙර ප්‍රශ්නය", "முந்தைய கேள்வி", "Previous question"))}</a>`}
        ${end || q >= 10 ? `<a class="btn" href="${evalBoardHref(id, kind, "end", reveal)}">${esc(L("අවසානය", "முடிவு", "Finish"))}</a>` : `<a class="btn" href="${evalBoardHref(id, kind, q + 1, reveal)}">${esc(L("ඊළඟ ප්‍රශ්නය", "அடுத்த கேள்வி", "Next question"))}</a>`}
        ${kind === "post" && !data.reveal ? `<a class="btn secondary" href="${evalBoardHref(id, kind, end ? "end" : q, true)}">${esc(L("නිවැරදි උත්තරය පෙන්වන්න", "சரியான விடையைக் காட்டு", "Show the correct answer"))}</a>` : ""}
        <button type="button" class="btn secondary" data-act="eval-full">${esc(L("මුළු තිරය", "முழுத் திரை", "Full screen"))}</button>
        <a class="btn secondary" href="#console/evaluation?tab=report&id=${esc(id)}">${esc(L("සංසන්දන වාර්තාව", "ஒப்பீட்டு அறிக்கை", "Comparison report"))}</a>
      </nav>
    </section>`;
  paintEvalLive(data, q, end);
  state.evalTimer = setInterval(() => {
    api("eval-live", { query: { id, kind, reveal: reveal ? "1" : "" } }).then((fresh) => {
      paintEvalLive(fresh, q, end);
      if (fresh.reveal && !end) {
        const current = (fresh.questions || [])[q - 1] || {};
        document.querySelectorAll(".eval-option").forEach((node) => node.classList.toggle("is-correct", node.dataset.letter === current.correct));
      }
    }).catch(() => {});
  }, 2000);
}

function evalChangeWord(change) {
  if (change === "up") return L("වැඩි වුණා", "உயர்ந்தது", "Improved");
  if (change === "down") return L("අඩු වුණා", "குறைந்தது", "Went down");
  if (change === "same") return L("සමානයි", "சமம்", "The same");
  return "";
}

async function renderEvalReport(work) {
  const id = state.query?.get("id") || "";
  const data = await api("eval-report", { query: { id } });
  const items = data.items || [];
  const rows = items.map((item) => `<tr>
    <td class="wrap-cell">${esc(item.name)}</td>
    <td>${item.pre === null ? "" : esc(item.pre)}</td>
    <td>${item.post === null ? "" : esc(item.post)}</td>
    <td>${item.diff === null ? "" : esc(item.diff)}</td>
    <td class="change-${esc(item.change)}">${esc(evalChangeWord(item.change))}</td>
  </tr>`).join("");
  const bars = items.map((item) => `<div class="eval-person">
    <strong>${esc(item.name)}</strong>
    <div class="eval-bars">
      <i class="pre" style="width:${Math.max(0, Number(item.pre) || 0)}%"></i>
      <i class="post" style="width:${Math.max(0, Number(item.post) || 0)}%"></i>
    </div>
  </div>`).join("");
  const bestPost = items.filter((item) => item.post !== null).sort((a, b) => b.post - a.post)[0];
  const bestGain = items.filter((item) => item.diff !== null).sort((a, b) => b.diff - a.diff)[0];
  work.innerHTML = `
    <section class="eval-report">
      <h2 class="classic-title">${esc(L("පෙර ඇගයීම සහ පසු ඇගයීම සංසන්දනය", "முன் மற்றும் பின் மதிப்பீட்டு ஒப்பீடு", "Pre and post comparison"))}</h2>
      <p>${esc(data.title || "")}</p>
      ${bestPost ? `<div class="eval-champion"><p>${esc(L("වැඩිම ලකුණු", "அதிக மதிப்பெண்", "Highest marks"))}</p><strong>${esc(bestPost.name)}</strong><em>${esc(bestPost.post)} / 100</em></div>` : ""}
      ${bestGain && bestGain.diff > 0 ? `<p class="eval-gain">${esc(bestGain.name)} — ${esc(L("වැඩියෙන්ම වැඩි වුණා", "அதிகம் உயர்ந்தவர்", "Improved the most"))} (+${esc(bestGain.diff)})</p>` : ""}
      <div class="eval-chart">${bars}</div>
      <p class="eval-key"><i class="pre"></i> ${esc(L("පෙර ඇගයීම", "முன் மதிப்பீடு", "Pre-evaluation"))} <i class="post"></i> ${esc(L("පසු ඇගයීම", "பின் மதிப்பீடு", "Post-evaluation"))}</p>
      <table class="desig-list">
        <thead><tr>
          <th>${esc(L("නම", "பெயர்", "Name"))}</th>
          <th>${esc(L("පෙර", "முன்", "Pre"))}</th>
          <th>${esc(L("පසු", "பின்", "Post"))}</th>
          <th>${esc(L("වෙනස", "வித்தியாசம்", "Change"))}</th>
          <th>${esc(L("වැඩි වුණා ද", "உயர்ந்ததா", "Improved?"))}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <button type="button" class="btn" data-act="eval-print">${esc(L("වාර්තාව මුද්‍රණය", "அறிக்கையை அச்சிடு", "Print the report"))}</button>
      <a class="btn secondary" href="#console/evaluation">${esc(L("ආපසු", "பின்", "Back"))}</a>
    </section>`;
}

function evalChoiceText(item) {
  const key = { A: "a", B: "b", C: "c", D: "d" }[item.correct] || "";
  return item[key] || "";
}

function quizDoneHtml(kind, status) {
  const score = `${status.score || 0} / 100`;
  if (kind !== "post") {
    return `<div class="quiz-done"><h2>${esc(L("ස්තූතියි", "நன்றி", "Thank you"))}</h2><p>${esc(score)}</p><p>${esc(L("පෙර ඇගයීමේ නිවැරදි උත්තරය පෙන්වන්නේ නැත.", "முன் மதிப்பீட்டில் சரியான விடை காட்டப்படாது.", "The correct answer is not shown in the pre-evaluation."))}</p></div>`;
  }
  const review = (status.review || []).map((item) => `<li class="${item.ok ? "ok" : "bad"}">
    <strong>${esc(item.no)}. ${esc(item.text)}</strong>
    <span>${esc(L("ඔබේ උත්තරය", "உங்கள் விடை", "Your answer"))}: ${esc(EVAL_MARK[item.choice] || item.choice)}</span>
    <span>${esc(L("නිවැරදි උත්තරය", "சரியான விடை", "Correct answer"))}: ${esc(EVAL_MARK[item.correct] || item.correct)} ${esc(evalChoiceText(item))}</span>
  </li>`).join("");
  return `<div class="quiz-done"><h2>${esc(L("ස්තූතියි", "நன்றி", "Thank you"))}</h2><p>${esc(score)}</p><ol class="quiz-review">${review}</ol></div>`;
}

function paintQuizQuestion(token, kind, nid, opened, status) {
  const card = $("#quiz-card");
  if (!card) return;
  if (status.done) {
    card.innerHTML = quizDoneHtml(kind, status);
    return;
  }
  const answered = new Set((status.answered || []).map((item) => Number(item.no)));
  const question = (opened.questions || []).find((item) => !answered.has(Number(item.no))) || opened.questions?.[0];
  if (!question) {
    card.innerHTML = quizDoneHtml(kind, status);
    return;
  }
  const buttons = ["A", "B", "C", "D"].map((letter) => `<button type="button" class="quiz-choice ${letter.toLowerCase()}" data-act="quiz-choice" data-letter="${letter}" data-no="${esc(question.no)}">${esc(EVAL_MARK[letter])} ${esc(question[letter.toLowerCase()] || "")}</button>`).join("");
  const heading = kind === "post" ? L("පසු ඇගයීම", "பின் மதிப்பீடு", "Post-evaluation") : L("පෙර ඇගයීම", "முன் மதிப்பீடு", "Pre-evaluation");
  card.innerHTML = `
    <p class="quiz-kicker">${esc(heading)}</p>
    <h2>${esc(opened.title || "")}</h2>
    <p class="quiz-progress">${esc(L("ප්‍රශ්නය", "கேள்வி", "Question"))} ${esc(question.no)} / 10</p>
    <h3>${esc(question.text || "")}</h3>
    <div class="quiz-choices">${buttons}</div>`;
  state.quizNow = { token, kind, nid, opened };
}

async function renderQuiz(view) {
  const token = state.module;
  const kind = state.quizKind === "post" ? "post" : "pre";
  const opened = await api("eval-open", { query: { token, kind } });
  const nid = sessionStorage.getItem(`mdtu-quiz-${token}-${kind}`) || "";
  view.innerHTML = `<section class="quiz-card" id="quiz-card"></section>`;
  if (!nid) {
    const heading = kind === "post" ? L("පසු ඇගයීම", "பின் மதிப்பீடு", "Post-evaluation") : L("පෙර ඇගයීම", "முன் மதிப்பீடு", "Pre-evaluation");
    $("#quiz-card").innerHTML = `
      <p class="quiz-kicker">${esc(heading)}</p>
      <h2>${esc(opened.title || "")}</h2>
      <form id="quiz-nid" class="classic-form">
        <label class="classic-field"><span>${esc(L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"))}</span><input name="nid" required autocomplete="off"></label>
        <button type="submit">${esc(L("පටන් ගන්න", "தொடங்கு", "Start"))}</button>
        <div id="form-msg"></div>
      </form>`;
    state.quizNow = { token, kind, opened };
    return;
  }
  const status = await api("eval-state", { query: { token, kind, nid } });
  paintQuizQuestion(token, kind, nid, opened, status);
}

function renderLater(work, title) {
  work.innerHTML = `
    <h2 class="classic-title">${esc(title)}</h2>
    <p class="pad-note">${esc(L("මෙම කොටස පසුව සකසනවා.", "இந்தப் பகுதி பின்னர் அமைக்கப்படும்.", "This part will be added next."))}</p>`;
}

function officerCame(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  return text !== "නැත" && text !== "No" && text !== "no";
}

function nidBoxes(count) {
  return Array.from({ length: count }, () => `<input name="nid" placeholder="${esc(L("ජා.හැ.අංකය", "அடையாள எண்", "National ID"))}">`).join("");
}

async function renderFinish(work) {
  const atp = state.query?.get("atp") || "";
  if (atp) {
    const list = await api("applicants", { query: { atp, selected: "1" } });
    const rows = (list.items || []).map((row, index) => `<tr>
      <td><input type="checkbox" data-nid="${esc(row.tapp_officerNid)}" ${officerCame(row.tratt_isparti) ? "checked" : ""}></td>
      <td>${index + 1}</td>
      <td>${esc(row.tapp_officerNid)}</td>
      <td class="wrap-cell">${esc(applicantName(row))}</td>
      <td class="wrap-cell">${esc(row.stf_desig || row.tratt_desig)}</td>
      <td class="wrap-cell">${esc(row.tapp_office)}</td>
      <td>${esc(row.stf_mobile || row.tratt_mobile)}</td>
    </tr>`).join("");
    work.innerHTML = `
      <h2 class="classic-title">${esc(L("පැමිණි නිලධාරීන් තහවුරු කරන්න", "வந்த அதிகாரிகளை உறுதி செய்", "Confirm the officers who attended"))}</h2>
      <p class="pad-note">${esc(L("පුහුණුවට තෝරාගත් නිලධාරීන්. පැමිණියේ නැත්නම් ඉදිරියේ ඇති හරිය අයින් කරන්න.", "பயிற்சிக்குத் தேர்ந்த அதிகாரிகள். வராவிட்டால் முன்னுள்ள அடையாளத்தை நீக்கவும்.", "Officers selected for the programme. Clear the tick if an officer did not attend."))}</p>
      <form id="confirm-attendance">
        <input type="hidden" name="atp_id" value="${esc(atp)}">
        <div class="table-wrap desig-list"><table>
          <thead><tr>
            <th>${esc(L("පැමිණියා", "வந்தார்", "Attended"))}</th>
            <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
            <th>${esc(L("ජා.හැ.අංකය", "அடையாள எண்", "National ID"))}</th>
            <th>${esc(L("නම", "பெயர்", "Name"))}</th>
            <th>${esc(L("තනතුර", "பதவி", "Designation"))}</th>
            <th>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
            <th>${esc(L("දුරකථනය", "தொலைபேசி", "Phone"))}</th>
          </tr></thead>
          <tbody>${rows || `<tr><td colspan="7">${esc(L("තෝරාගත් නිලධාරීන් නොමැත.", "தேர்ந்த அதிகாரிகள் இல்லை.", "No selected officers."))}</td></tr>`}</tbody>
        </table></div>
        <p><button type="submit">${esc(L("තහවුරු කරන්න", "உறுதி செய்", "Confirm"))}</button></p>
        <div id="form-msg"></div>
      </form>
      <h2 class="classic-title">${esc(L("අයදුම් නොකර ආ නිලධාරියෙකු", "விண்ணப்பிக்காமல் வந்த அதிகாரி", "An officer who did not apply"))}</h2>
      <form class="sheet-tools" id="walkin-form">
        <input type="hidden" name="atp_id" value="${esc(atp)}">
        <input name="nid" placeholder="${esc(L("ජා.හැ.අංකය", "அடையாள எண்", "National ID"))}" required>
        <button type="submit">${esc(L("එකතු කරන්න", "சேர்க்க", "Add"))}</button>
      </form>
      <h2 class="classic-title">${esc(L("වෙබ් අඩවියෙන් අයදුම් නොකළ නිලධාරීන්", "இணையத்தில் விண்ணப்பிக்காத அதிகாரிகள்", "Officers who did not apply on the website"))}</h2>
      <p class="pad-note">${esc(L("වරකට ජා.හැ.අංක 10ක්. නිලධාරීන් 1000 දක්වා එකතු කරන්න පුළුවන්.", "ஒரு முறை 10 அடையாள எண்கள். 1000 அதிகாரிகள் வரை சேர்க்கலாம்.", "Ten ID numbers at a time. You can add up to 1000 officers."))}</p>
      <form id="walkin-many">
        <input type="hidden" name="atp_id" value="${esc(atp)}">
        <div class="nid-grid" id="nid-grid">${nidBoxes(10)}</div>
        <p>
          <button type="button" data-act="more-nids">${esc(L("තව 10ක්", "மேலும் 10", "Add 10 more"))}</button>
          <button type="submit">${esc(L("එකතු කරන්න", "சேர்க்க", "Add"))}</button>
        </p>
        <div id="many-msg"></div>
      </form>
      <h2 class="classic-title">Excel</h2>
      <form class="sheet-tools" id="attendance-upload">
        <input type="hidden" name="atp_id" value="${esc(atp)}">
        <input type="file" name="file" accept=".xls,.xlsx,.csv" required>
        <button type="submit">${esc(L("Excel ඇතුළත් කරන්න", "Excel பதிவேற்றம்", "Upload Excel"))}</button>
        <button type="button" data-act="attendance-format">download format</button>
        <div id="upload-msg"></div>
      </form>`;
    return;
  }
  const saved = await api("saved-estimates");
  const rows = (saved.items || []).map((row) => `<tr>
    <td><a href="#console/finish?atp=${esc(row.id)}">${esc(L("පැමිණි නිලධාරීන් තහවුරු කරන්න", "வந்த அதிகாரிகளை உறுதி செய்", "Confirm the officers who attended"))}</a></td>
    <td><a href="#console/advance?atp=${esc(row.id)}">${esc(L("අත්තිකාරම් විස්තර", "முன்பண விவரம்", "Advance details"))}</a></td>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td>${esc(showDate(row.day))}</td>
    <td>${esc(showDate(row.end))}</td>
    <td class="wrap-cell">${esc(row.file)}</td>
    <td class="wrap-cell">${esc(row.place)}</td>
  </tr>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("වැඩසටහන අවසන් කිරීම පියවර-1", "நிகழ்ச்சியை முடித்தல் படி 1", "Finish the programme, step 1"))}</h2>
    <p class="pad-note">${esc(L("ඇස්තමේන්තුව සකස් කළ සියලුම පුහුණු වැඩසටහන්. සංශෝධනය කළාම සංශෝධිත ඇස්තමේන්තුව තමයි ගන්නේ.", "மதிப்பீடு அமைத்த அனைத்துப் பயிற்சிகளும். திருத்தினால் திருத்திய மதிப்பீடு எடுக்கப்படும்.", "Every programme whose estimate was prepared. If it was revised, the revised estimate is the one used."))}</p>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("පැමිණි නිලධාරීන් තහවුරු කරන්න", "வந்த அதிகாரிகளை உறுதி செய்", "Confirm officers"))}</th>
        <th>${esc(L("අත්තිකාරම් විස්තර", "முன்பண விவரம்", "Advance details"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))}</th>
        <th>${esc(L("අවසන් දිනය", "இறுதி திகதி", "End date"))}</th>
        <th>${esc(L("ලිපිගොනු අංකය", "கோப்பு எண்", "File number"))}</th>
        <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="7">${esc(L("ඇස්තමේන්තුව සකස් කළ වැඩසටහන් නොමැත.", "மதிப்பீடு அமைத்த பயிற்சி இல்லை.", "No programme has a prepared estimate."))}</td></tr>`}</tbody>
    </table></div>`;
}

function foodTabs(tab, atp) {
  const base = `#console/finish2?bill=${encodeURIComponent(atp)}`;
  return `<div class="desig-tabs">
    <a class="${tab === "form" ? "on" : ""}" href="${base}">${esc(L("ආහාර බිල් පියවීම", "உணவுப் பட்டியல் தீர்வு", "Food bill settlement"))}</a>
    <a class="${tab === "report" ? "on" : ""}" href="${base}&tab=report">${esc(L("වාර්තාව", "அறிக்கை", "Report"))}</a>
  </div>`;
}

function foodBillRow(text, amount) {
  return `<div class="food-line">
    <input name="billtext" value="${esc(text || "")}" placeholder="${esc(L("බිල් විස්තර", "பட்டியல் விவரம்", "Bill details"))}">
    <input name="billamount" inputmode="decimal" value="${esc(amount || "")}" placeholder="${esc(L("වියදම", "செலவு", "Amount"))}">
    <button type="button" class="text-btn" data-act="food-drop">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button>
  </div>`;
}

function foodGapText(gap, short) {
  const kind = short
    ? L("හිඟ මුදල", "பற்றாக்குறை", "Shortfall")
    : L("ඉතිරි මුදල", "மீதி", "Balance");
  return `${advanceMoney(Math.abs(advanceNumber(gap)))} (${kind})`;
}

function paintFoodBill(form, fromBills) {
  if (!form) return;
  let bills = 0;
  let anyBill = false;
  form.querySelectorAll("[name=billamount]").forEach((field) => {
    if (String(field.value || "").trim() !== "") anyBill = true;
    bills += advanceNumber(field.value);
  });
  const foodInput = form.querySelector("[name=food]");
  if (fromBills && anyBill && foodInput) foodInput.value = advanceMoney(bills);
  const food = advanceNumber(foodInput?.value);
  const spent = advanceNumber(form.querySelector("[data-spent]")?.value);
  const plan = advanceNumber(form.querySelector("[data-plan]")?.value);
  const total = spent + food;
  const gap = plan - total;
  const totalOut = form.querySelector("[data-total]");
  const gapOut = form.querySelector("[data-gap]");
  if (totalOut) totalOut.textContent = advanceMoney(total);
  if (gapOut) gapOut.textContent = foodGapText(gap, gap < -0.00001);
}

function foodReportHtml(row) {
  const lines = (row.lines || []).map((line, index) => `<tr>
    <td>${index + 1}</td>
    <td>${esc(line.text)}</td>
    <td>${esc(line.amount)}</td>
  </tr>`).join("");
  const pairs = [
    [L("දිනය", "திகதி", "Date"), showDate(row.date)],
    [L("පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number"), row.planNo],
    [L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"), row.name],
    [L("සම්බන්ධිකරණ නිලධාරියාගේ නම", "ஒருங்கிணைப்பாளர் பெயர்", "Coordinator"), row.coordinator],
    [L("වැඩසටහන පවත්වන දින", "பயிற்சி நடைபெறும் நாட்கள்", "Programme dates"), row.dates],
    [L("සහභාගී කරගන්නා නිලධාරීන් ගණන", "சேர்க்கும் அதிகாரிகள்", "Officers to be included"), row.planned],
    [L("සහභාගි වූ සංඛ්‍යාව", "பங்கேற்றோர்", "Number who attended"), row.attended],
    [L("පුහුණු සැලැස්මේ ඇස්තමේන්තුව", "திட்ட மதிப்பீடு", "Plan estimate"), row.planEstimate],
    [L("සකස්කල ඇස්තමේන්තුව", "தயாரித்த மதிப்பீடு", "Prepared estimate"), row.prepared],
    [L("අත්තිකාරම", "முன்பணம்", "Advance"), row.advance],
    [L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Amount spent from the advance"), row.spent],
    [L("ආහාර පාන සඳහා හා අනෙකුත් සේවා සඳහා වියදම", "உணவு பானம் மற்றும் பிற சேவைச் செலவு", "Food, drink and other services"), row.food],
    [L("මුළු වියදම", "மொத்தச் செலவு", "Total expenditure"), row.total],
    [L("පුහුණු සැලැස්මෙන් ඉතිරි හෝ හිඟ මුදල", "திட்ட மீதி அல்லது பற்றாக்குறை", "Balance or shortfall from the plan"), foodGapText(row.gap, row.short)],
  ];
  return `
    <h1>${esc(L("ආහාර බිල් පියවීම", "உணவுப் பட்டியல் தீர்வு", "Food bill settlement"))}</h1>
    <table>
      <tbody>${pairs.map((pair) => `<tr><th>${esc(pair[0])}</th><td>${esc(pair[1] ?? "")}</td></tr>`).join("")}</tbody>
    </table>
    <h2>${esc(L("ආහාර බිල්", "உணவுப் பட்டியல்கள்", "Food bills"))}</h2>
    <table>
      <thead><tr>
        <th>${esc(L("අංකය", "இல.", "No."))}</th>
        <th>${esc(L("බිල් විස්තර", "பட்டியல் விவரம்", "Bill details"))}</th>
        <th>${esc(L("වියදම", "செலவு", "Amount"))}</th>
      </tr></thead>
      <tbody>
        ${lines || `<tr><td colspan="3">${esc(L("ආහාර බිල් නොමැත.", "உணவுப் பட்டியல் இல்லை.", "No food bills."))}</td></tr>`}
        <tr><th colspan="2">${esc(L("ආහාර බිල් එකතුව", "பட்டியல் மொத்தம்", "Food bills total"))}</th><td>${esc(row.food || "0.00")}</td></tr>
      </tbody>
    </table>`;
}

function printFoodBill() {
  const source = document.getElementById("food-report") || document.getElementById("pay-report");
  if (!source) return;
  let sheet = document.getElementById("food-official");
  if (!sheet) {
    sheet = document.createElement("article");
    sheet.id = "food-official";
    sheet.className = "food-official";
    document.body.appendChild(sheet);
  }
  sheet.innerHTML = source.innerHTML;
  document.body.classList.add("printing-food");
  const done = () => document.body.classList.remove("printing-food");
  window.addEventListener("afterprint", done, { once: true });
  window.print();
}

async function renderFoodBill(work, atp) {
  const tab = state.query?.get("tab") === "report" ? "report" : "form";
  const data = await api("foodbill", { query: { atp } });
  const row = data.item || {};
  if (tab === "report") {
    work.innerHTML = `
      ${foodTabs(tab, atp)}
      ${data.closed ? `<p class="finish-done">${esc(L("වැඩසටහන අවසන් කිරීම සාර්ථකව සිදුකරන ලදී", "நிகழ்ச்சி வெற்றிகரமாக முடிக்கப்பட்டது", "The programme was completed successfully."))}</p>` : ""}
      <p class="sheet-tools">
        <a class="btn" href="#console/finish2?bill=${esc(atp)}">${esc(L("සංස්කරණය කරන්න", "திருத்து", "Edit"))}</a>
        <button type="button" class="btn" data-act="food-print">${esc(L("මුද්‍රණය කරන්න", "அச்சிடு", "Print"))}</button>
      </p>
      ${row.saved ? "" : `<p class="pad-note">${esc(L("තවම සුරැකි ආහාර බිල් නොමැත. පෝරමයෙන් සුරකින්න.", "இன்னும் உணவுப் பட்டியல் சேமிக்கவில்லை. படிவத்தில் சேமிக்கவும்.", "No food bill has been saved yet. Save it from the form."))}</p>`}
      <article class="food-report" id="food-report">${foodReportHtml(row)}</article>`;
    return;
  }
  const lines = (row.lines && row.lines.length ? row.lines : [{ text: "", amount: "" }]).map((line) => foodBillRow(line.text, line.amount)).join("");
  const locked = (value) => `<input value="${esc(value ?? "")}" readonly>`;
  work.innerHTML = `
    ${foodTabs(tab, atp)}
    <h2 class="classic-title">${esc(L("ආහාර බිල් පියවීම", "உணவுப் பட்டியல் தீர்வு", "Food bill settlement"))}</h2>
    <form class="classic-form old-plan" id="foodbill-form">
      <input type="hidden" name="atp" value="${esc(atp)}">
      <div class="annual-sheet">
        <div class="annual-col">
          ${advanceField(L("දිනය", "திகதி", "Date"), `<input type="date" name="date" value="${esc(showDate(row.date) || localToday())}">`)}
          ${advanceField(L("පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number"), locked(row.planNo))}
          ${advanceField(L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"), locked(row.name))}
          ${advanceField(L("සම්බන්ධිකරණ නිලධාරියාගේ නම", "ஒருங்கிணைப்பாளர் பெயர்", "Coordinator"), locked(row.coordinator))}
          ${advanceField(L("වැඩසටහන පවත්වන දින", "பயிற்சி நடைபெறும் நாட்கள்", "Programme dates"), locked(row.dates))}
          ${advanceField(L("සහභාගී කරගන්නා නිලධාරීන් ගණන", "சேர்க்கும் அதிகாரிகள்", "Officers to be included"), locked(row.planned))}
          ${advanceField(L("සහභාගි වූ සංඛ්‍යාව", "பங்கேற்றோர்", "Number who attended"), locked(row.attended ?? 0))}
        </div>
        <div class="annual-col">
          ${advanceField(L("පුහුණු සැලැස්මේ ඇස්තමේන්තුව", "திட்ட மதிப்பீடு", "Plan estimate"), `<input data-plan value="${esc(row.planEstimate || "0")}" readonly>`)}
          ${advanceField(L("සකස්කල ඇස්තමේන්තුව", "தயாரித்த மதிப்பீடு", "Prepared estimate"), locked(row.prepared))}
          ${advanceField(L("අත්තිකාරම", "முன்பணம்", "Advance"), `<input name="advance" inputmode="decimal" value="${esc(row.advance || "0")}">`)}
          ${advanceField(L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Amount spent from the advance"), `<input data-spent value="${esc(row.spent || "0")}" readonly>`)}
          ${advanceField(L("ආහාර පාන සඳහා හා අනෙකුත් සේවා සඳහා වියදම", "உணவு பானம் மற்றும் பிற சேவைச் செலவு", "Food, drink and other services"), `<input name="food" inputmode="decimal" value="${esc(row.food || "0")}">`)}
          ${advanceField(L("මුළු වියදම", "மொத்தச் செலவு", "Total expenditure"), `<output data-total>${esc(row.total || "0.00")}</output>`)}
          ${advanceField(L("පුහුණු සැලැස්මෙන් ඉතිරි හෝ හිඟ මුදල", "திட்ட மீதி அல்லது பற்றாக்குறை", "Balance or shortfall from the plan"), `<output data-gap>${esc(foodGapText(row.gap, row.short))}</output>`)}
        </div>
      </div>
      <h2 class="classic-title">${esc(L("ආහාර බිල්", "உணவுப் பட்டியல்கள்", "Food bills"))}</h2>
      <div class="food-lines" id="food-lines">${lines}</div>
      <p><button type="button" data-act="food-add">${esc(L("එකතු කරන්න", "சேர்க்க", "Add"))}</button></p>
      <p class="pad-note">${esc(L("අත්තිකාරම් දෙක තුනක් නම් එකතුව අත්තිකාරම එකේ ලියන්න. ආහාර බිල් දෙකක් නම් ඒවායේ එකතුව ආහාර පාන වියදම කොටුවට යනවා. ඒ කොටුවේ ලියන්නත් පුළුවන්. මුළු වියදම = අත්තිකාරමින් වියදම් වූ මුදල + ආහාර පාන වියදම. ඉතිරි හෝ හිඟ මුදල = පුහුණු සැලැස්මේ ඇස්තමේන්තුව − මුළු වියදම.", "முன்பணம் இரண்டு மூன்று என்றால் கூட்டுத் தொகையை முன்பணத்தில் எழுதவும். இரண்டு பட்டியல்கள் என்றால் கூட்டுத் தொகை உணவுச் செலவுக் கட்டத்தில் வரும். அங்கேயும் எழுதலாம். மொத்தச் செலவு = முன்பணச் செலவு + உணவுச் செலவு. மீதி அல்லது பற்றாக்குறை = திட்ட மதிப்பீடு − மொத்தச் செலவு.", "If there are two or three advances, write their sum in Advance. If there are two food bills, their total goes into the food expense box. You can also type in that box. Total expenditure is the amount spent from the advance plus the food expense. The balance or shortfall is the plan estimate minus the total expenditure."))}</p>
      <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <div id="form-msg"></div>
    </form>`;
  paintFoodBill(document.getElementById("foodbill-form"), false);
}

function allowanceTabs(tab, atp) {
  const base = `#console/finish2?pay=${encodeURIComponent(atp)}`;
  return `<div class="desig-tabs">
    <a class="${tab === "form" ? "on" : ""}" href="${base}">${esc(L("දීමනා ගෙවීම", "கொடுப்பனவு செலுத்துதல்", "Allowance payment"))}</a>
    <a class="${tab === "report" ? "on" : ""}" href="${base}&tab=report">${esc(L("වාර්තාව", "அறிக்கை", "Report"))}</a>
  </div>`;
}

function paintAllowance() {}

function paintOfficeAmount(form) {
  if (!form) return;
  const unit = advanceNumber(form.dataset.officeUnit);
  const count = [...form.querySelectorAll("[name=officeNid]")].filter((field) => field.value.trim()).length;
  const amount = form.querySelector("[name=office]");
  if (amount && unit > 0 && count > 0) amount.value = advanceMoney(unit * count);
  paintAllowance(form);
}

function officeChoiceLabel(person) {
  const nid = String(person?.nid || "").trim();
  const name = String(person?.name || "").trim();
  if (nid && name) return `${nid} — ${name}`;
  return nid || name;
}

function officeChoicesFromPage() {
  try {
    return JSON.parse(document.getElementById("office-choices")?.textContent || "[]");
  } catch (error) {
    return [];
  }
}

function officePersonRow(person, choices) {
  const nid = String(person?.nid || "").trim();
  const name = String(person?.name || "").trim();
  const list = Array.isArray(choices) ? choices : [];
  const known = nid !== "" && list.some((item) => String(item.nid || "").trim() === nid);
  const typing = !known && (nid !== "" || name !== "");
  const options = [`<option value="">${esc(L("තෝරන්න", "தேர்வு செய்", "Select"))}</option>`]
    .concat(list.filter((item) => String(item.nid || "").trim()).map((item) => {
      const id = String(item.nid).trim();
      return `<option value="${esc(id)}" ${known && id === nid ? "selected" : ""}>${esc(officeChoiceLabel(item))}</option>`;
    }))
    .concat(`<option value="__type__" ${typing ? "selected" : ""}>${esc(L("ලැයිස්තුවේ නැත — ටයිප් කරන්න", "பட்டியலில் இல்லை — தட்டச்சு செய்", "Not in the list — type it"))}</option>`);
  return `<div class="food-line office-person">
    <select name="officePick">${options.join("")}</select>
    <span class="office-type" ${typing ? "" : "hidden"}>
      <input name="officeNid" value="${esc(nid)}" ${known ? 'data-from-list="1"' : ""} placeholder="${esc(L("ජා.හැ.අංකය", "அடையாள எண்", "National ID"))}">
      <input name="officeName" value="${esc(name)}" placeholder="${esc(L("නම", "பெயர்", "Name"))}">
    </span>
    <button type="button" class="text-btn" data-act="office-drop">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button>
  </div>`;
}

function applyOfficePick(select) {
  const row = select.closest(".office-person");
  const typeBox = row?.querySelector(".office-type");
  const nid = row?.querySelector("[name=officeNid]");
  const name = row?.querySelector("[name=officeName]");
  if (!row || !typeBox || !nid || !name) return;
  if (select.value === "__type__") {
    typeBox.hidden = false;
    if (nid.dataset.fromList === "1") {
      nid.value = "";
      name.value = "";
      nid.dataset.fromList = "";
    }
    nid.focus();
  } else if (select.value) {
    const found = officeChoicesFromPage().find((item) => String(item.nid) === select.value);
    nid.value = select.value;
    name.value = found?.name || "";
    nid.dataset.fromList = "1";
    typeBox.hidden = true;
  } else {
    nid.value = "";
    name.value = "";
    nid.dataset.fromList = "";
    typeBox.hidden = true;
  }
  paintOfficeAmount(select.closest("#allowance-form"));
}

async function fillOfficeName(field) {
  const row = field.closest(".food-line");
  const name = row?.querySelector("[name=officeName]");
  const form = field.closest("#allowance-form");
  if (!name || !form) return;
  const nid = field.value.trim();
  if (!nid) {
    name.value = "";
    paintOfficeAmount(form);
    return;
  }
  try {
    const data = await api("profile", { query: { nid } });
    name.value = data.profile?.name || name.value;
  } catch (error) {
    name.value = name.value || "";
  }
  paintOfficeAmount(form);
}

function allowanceWithWho(amount, who) {
  const money = amount ?? "";
  const person = String(who || "").trim();
  return person ? `${money} — ${person}` : money;
}

function allowanceReportHtml(row) {
  const pairs = [
    [L("දිනය", "திகதி", "Date"), showDate(row.date)],
    [L("පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number"), row.planNo],
    [L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"), row.name],
    [L("සම්බන්ධිකරණ නිලධාරියාගේ නම", "ஒருங்கிணைப்பாளர் பெயர்", "Coordinator"), row.coordinator],
    [L("වැඩසටහන පවත්වන දින", "பயிற்சி நடைபெறும் நாட்கள்", "Programme dates"), row.dates],
    [L("සහභාගී කරගන්නා නිලධාරීන් ගණන", "சேர்க்கும் அதிகாரிகள்", "Officers to be included"), row.planned],
    [L("සහභාගි වූ සංඛ්‍යාව", "பங்கேற்றோர்", "Number who attended"), row.attended],
    [L("සම්පත්දායක දීමනා", "வள ஆள் கொடுப்பனவு", "Resource-person allowance"), allowanceWithWho(row.resource, row.resourceWho)],
    [L("සමායෝජන දීමනා", "ஒருங்கிணைப்புக் கொடுப்பனவு", "Coordination allowance"), allowanceWithWho(row.coord, row.coordWho)],
    [L("අධීක්ෂණ දීමනා", "மேற்பார்வைக் கொடுப்பனவு", "Supervision allowance"), allowanceWithWho(row.supervise, row.superviseWho)],
    [L("සම්බන්ධිකරණ දීමනා", "இணைப்புக் கொடுப்பனவு", "Liaison allowance"), allowanceWithWho(row.liaise, row.liaiseWho)],
    [L("ගිණුම් අංශය සඳහා දීමනා", "கணக்குப் பிரிவுக் கொடுப்பனவு", "Accounts section allowance"), allowanceWithWho(row.account, row.accountWho)],
    [L("කාර්යාල සහයක දීමනා", "அலுவலக உதவியாளர் கொடுப்பனவு", "Office assistant allowance"), allowanceWithWho(row.office, row.officeWho)],
    [L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Amount spent from the advance"), row.spent],
    [L("මුළු වියදම", "மொத்தச் செலவு", "Total expenditure"), row.total],
  ];
  return `
    <h1>${esc(L("දීමනා ගෙවීම", "கொடுப்பனவு செலுத்துதல்", "Allowance payment"))}</h1>
    <table><tbody>${pairs.map((pair) => `<tr><th>${esc(pair[0])}</th><td>${esc(pair[1] ?? "")}</td></tr>`).join("")}</tbody></table>`;
}

async function renderAllowance(work, atp) {
  const tab = state.query?.get("tab") === "report" ? "report" : "form";
  const data = await api("allowance", { query: { atp } });
  const row = data.item || {};
  if (tab === "report") {
    work.innerHTML = `
      ${allowanceTabs(tab, atp)}
      ${data.closed ? `<p class="finish-done">${esc(L("වැඩසටහන අවසන් කිරීම සාර්ථකව සිදුකරන ලදී", "நிகழ்ச்சி வெற்றிகரமாக முடிக்கப்பட்டது", "The programme was completed successfully."))}</p>` : ""}
      <p class="sheet-tools">
        <a class="btn" href="#console/finish2?pay=${esc(atp)}">${esc(L("සංස්කරණය කරන්න", "திருத்து", "Edit"))}</a>
        <button type="button" class="btn" data-act="food-print">${esc(L("මුද්‍රණය කරන්න", "அச்சிடு", "Print"))}</button>
      </p>
      ${row.saved ? "" : `<p class="pad-note">${esc(L("තවම සුරැකි දීමනා ගෙවීමක් නොමැත. පෝරමයෙන් සුරකින්න.", "இன்னும் கொடுப்பனவு சேமிக்கவில்லை. படிவத்தில் சேமிக்கவும்.", "No allowance payment has been saved yet. Save it from the form."))}</p>`}
      <article class="food-report" id="pay-report">${allowanceReportHtml(row)}</article>`;
    return;
  }
  const box = (name, value, money) => `<input name="${name}" ${money ? 'inputmode="decimal"' : ""} value="${esc(value ?? "")}">`;
  const pay = (amountName, amount, whoName, who) => `<span class="allow-pair"><input name="${amountName}" inputmode="decimal" value="${esc(amount || "0")}"><input name="${whoName}" value="${esc(who || "")}" placeholder="${esc(L("ලැබූ අයගේ නම", "பெற்றவர் பெயர்", "Name of the recipient"))}"></span>`;
  const officePeople = row.officePeople && row.officePeople.length ? row.officePeople : [{ nid: "", name: "" }];
  const officeChoices = row.officeChoices || [];
  work.innerHTML = `
    ${allowanceTabs(tab, atp)}
    <h2 class="classic-title">${esc(L("දීමනා ගෙවීම", "கொடுப்பனவு செலுத்துதல்", "Allowance payment"))}</h2>
    <form class="classic-form old-plan" id="allowance-form" data-office-unit="${esc(row.officeUnit || "0")}">
      <input type="hidden" name="atp" value="${esc(atp)}">
      <script type="application/json" id="office-choices">${JSON.stringify(officeChoices).replace(/</g, "\\u003c")}</script>
      <div class="annual-sheet">
        <div class="annual-col">
          ${advanceField(L("දිනය", "திகதி", "Date"), `<input type="date" name="date" value="${esc(showDate(row.date) || localToday())}">`)}
          ${advanceField(L("පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number"), box("planNo", row.planNo, false))}
          ${advanceField(L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"), box("name", row.name, false))}
          ${advanceField(L("සම්බන්ධිකරණ නිලධාරියාගේ නම", "ஒருங்கிணைப்பாளர் பெயர்", "Coordinator"), box("coordinator", row.coordinator, false))}
          ${advanceField(L("වැඩසටහන පවත්වන දින", "பயிற்சி நடைபெறும் நாட்கள்", "Programme dates"), box("dates", row.dates, false))}
          ${advanceField(L("සහභාගී කරගන්නා නිලධාරීන් ගණන", "சேர்க்கும் அதிகாரிகள்", "Officers to be included"), box("planned", row.planned, false))}
          ${advanceField(L("සහභාගි වූ සංඛ්‍යාව", "பங்கேற்றோர்", "Number who attended"), box("attended", row.attended, false))}
        </div>
        <div class="annual-col">
          ${advanceField(L("සම්පත්දායක දීමනා", "வள ஆள் கொடுப்பனவு", "Resource-person allowance"), pay("resource", row.resource, "resourceWho", row.resourceWho))}
          ${advanceField(L("සමායෝජන දීමනා", "ஒருங்கிணைப்புக் கொடுப்பனவு", "Coordination allowance"), pay("coord", row.coord, "coordWho", row.coordWho))}
          ${advanceField(L("අධීක්ෂණ දීමනා", "மேற்பார்வைக் கொடுப்பனவு", "Supervision allowance"), pay("supervise", row.supervise, "superviseWho", row.superviseWho))}
          ${advanceField(L("සම්බන්ධිකරණ දීමනා", "இணைப்புக் கொடுப்பனவு", "Liaison allowance"), pay("liaise", row.liaise, "liaiseWho", row.liaiseWho))}
          ${advanceField(L("ගිණුම් අංශය සඳහා දීමනා", "கணக்குப் பிரிவுக் கொடுப்பனவு", "Accounts section allowance"), pay("account", row.account, "accountWho", row.accountWho))}
          ${advanceField(L("කාර්යාල සහයක දීමනා", "அலுவலக உதவியாளர் கொடுப்பனவு", "Office assistant allowance"), pay("office", row.office, "officeWho", row.officeWho))}
          <div class="food-lines" id="office-ids">${officePeople.map((person) => officePersonRow(person, officeChoices)).join("")}</div>
          <p><button type="button" data-act="office-add">${esc(L("එකතු කරන්න", "சேர்க்க", "Add"))}</button></p>
          <p class="pad-note">${esc(L("සුරැකූ කාර්යාල සහයකයන් අංකය සහ නම සමඟ මෙම ලැයිස්තුවෙන් තෝරන්න. ලැයිස්තුවේ නැති අයෙකු ටයිප් කර සුරැකූ පසු ඊළඟ වතාවේ ලැයිස්තුවේ පේනවා.", "சேமித்த அலுவலக உதவியாளரை எண்ணும் பெயரும் சேர்ந்து இந்தப் பட்டியலிலிருந்து தேர்வு செய்யவும். பட்டியலில் இல்லாதவரை தட்டச்சு செய்து சேமித்த பின் அடுத்த முறை பட்டியலில் வருவார்.", "Choose a saved office assistant, with the ID and name, from this list. If the person is not listed, type them and save. They appear in the list the next time."))}</p>
          ${advanceField(L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Amount spent from the advance"), `<input name="spent" value="${esc(row.spent || "0")}" readonly>`)}
          ${advanceField(L("මුළු වියදම", "மொத்தச் செலவு", "Total expenditure"), `<output data-total>${esc(row.total || "0.00")}</output>`)}
        </div>
      </div>
      <p class="pad-note">${esc(L("සම්පත්දායකයන්ගේ නම් මේ පුහුණුවෙන්. සමායෝජන දීමනාව නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)ගේ නම. අධීක්ෂණ දීමනාව වැඩසටහන අධීක්ෂණය කරන නිලධාරියා. සම්බන්ධිකරණ දීමනාව සම්බන්ධිකරණ නිලධාරියා. ගිණුම් අංශයේ නම වෙනස් කරන්න පුළුවන්. කාර්යාල සහයක දීමනාවේ නම 1 වන සහාය කාර්ය මණ්ඩලයගෙන්. අත්තිකාරමින් වියදම් වූ මුදල සහ මුළු වියදම ආහාර බිල් පියවීමෙන්.", "வள ஆள்களின் பெயர்கள் இந்தப் பயிற்சியிலிருந்து. ஒருங்கிணைப்புக் கொடுப்பனவு துணைப் பிரதம செயலாளரின் பெயர். மேற்பார்வைப் பயிற்சியை மேற்பார்வையிடும் அதிகாரி. இணைப்புக் கொடுப்பனவு ஒருங்கிணைப்பாளர். கணக்குப் பெயரை மாற்றலாம். அலுவலக உதவியாளர் அடையாள எண்ணிலிருந்து பெயர் வரும். முன்பணச் செலவும் மொத்தச் செலவும் உணவுப் பட்டியலிலிருந்து.", "Resource-person names are from this programme. The coordination allowance shows the Deputy Chief Secretary (Training). Supervision shows the officer who supervises the programme. Liaison shows the coordinating officer. The accounts name can be changed. An office assistant's name comes from the ID number. The amount spent from the advance and the total expenditure come from the food-bill settlement."))}</p>
      <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <div id="form-msg"></div>
    </form>`;
  paintAllowance(document.getElementById("allowance-form"));
}

async function renderFinish2(work) {
  const bill = state.query?.get("bill") || "";
  const pay = state.query?.get("pay") || "";
  if (bill) return renderFoodBill(work, bill);
  if (pay) return renderAllowance(work, pay);
  const saved = await api("finish2");
  const rows = (saved.items || []).map((row) => `<tr>
    <td><a href="#console/finish2?bill=${esc(row.id)}">${esc(L("ආහාර බිල් පියවීම", "உணவுப் பட்டியல் தீர்வு", "Food bill settlement"))}</a></td>
    <td><a href="#console/finish2?pay=${esc(row.id)}">${esc(L("දීමනා ගෙවීම", "கொடுப்பனவு செலுத்துதல்", "Allowance payment"))}</a></td>
    <td class="wrap-cell">${esc(row.name)}${row.closed ? `<div class="finish-done">${esc(L("වැඩසටහන අවසන් කිරීම සාර්ථකව සිදුකරන ලදී", "நிகழ்ச்சி வெற்றிகரமாக முடிக்கப்பட்டது", "The programme was completed successfully."))}</div>` : ""}</td>
    <td>${esc(showDate(row.day))}</td>
    <td>${esc(showDate(row.end))}</td>
    <td class="wrap-cell">${esc(row.file)}</td>
    <td class="wrap-cell">${esc(row.place)}</td>
  </tr>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("වැඩසටහන අවසන් කිරීම පියවර 2", "நிகழ்ச்சியை முடித்தல் படி 2", "Finish the programme, step 2"))}</h2>
    <p class="pad-note">${esc(L("පියවර 1 හි පෙනෙන වැඩසටහන් අතරින් අත්තිකාරම සුරැකූ, නම් ලේඛනය තහවුරු කළ සියල්ල.", "படி 1 இல் தெரியும் பயிற்சிகளில் முன்பணம் சேமித்து, பெயர்ப் பட்டியல் உறுதி செய்த அனைத்தும்.", "Every step 1 programme whose advance was saved and whose name list was confirmed."))}</p>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("ආහාර බිල් පියවීම", "உணவுப் பட்டியல் தீர்வு", "Food bill settlement"))}</th>
        <th>${esc(L("දීමනා ගෙවීම", "கொடுப்பனவு செலுத்துதல்", "Allowance payment"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))}</th>
        <th>${esc(L("අවසන් දිනය", "இறுதி திகதி", "End date"))}</th>
        <th>${esc(L("ලිපිගොනු අංකය", "கோப்பு எண்", "File number"))}</th>
        <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="7">${esc(L("අත්තිකාරම සුරැකූ, නම් ලේඛනය තහවුරු කළ වැඩසටහන් නොමැත.", "முன்பணம் சேமித்து பெயர்ப் பட்டியல் உறுதி செய்த பயிற்சி இல்லை.", "No programme has a saved advance and a confirmed name list."))}</td></tr>`}</tbody>
    </table></div>`;
}

async function renderCompleted(work) {
  const list = await api("list", { query: { table: "cp_completedtrainings", limit: 1000, page: 1, allYears: "1" } });
  const items = list.items || [];
  const years = yearChoices();
  items.forEach((row) => {
    const year = programmeYear(row);
    if (year && !years.includes(year)) years.push(year);
  });
  years.sort((a, b) => b.localeCompare(a));
  const asked = chosenYear();
  const shown = items.filter((row) => programmeYear(row) === asked);
  const options = years.map((year) => `<option value="${esc(year)}" ${year === asked ? "selected" : ""}>${esc(year)}</option>`).join("");
  const rows = shown.map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td>${esc(row.ct_trname)}</td>
    <td>${esc(showDate(row.ct_day1))}</td>
    <td>${esc(row.ct_location)}</td>
    <td>${esc(row.ct_noofactualparticipant)}</td>
    <td>${esc(row.ct_estimate)}</td>
  </tr>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("නිම කළ පුහුණු වැඩසටහන්", "முடிந்த பயிற்சிகள்", "Completed programmes"))}</h2>
    ${years.length ? `<form class="sheet-tools" id="completed-year"><label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))}</label><select name="year">${options}</select></form>` : ""}
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்கம்", "Starts"))}</th>
        <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
        <th>${esc(L("සහභාගිවූවන්", "பங்கேற்பாளர்", "Participants"))}</th>
        <th>${esc(L("ඇස්තමේන්තුව", "மதிப்பீடு", "Estimate"))}</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="6">${esc(L("මේ වර්ෂයට නිම කළ වැඩසටහන් නොමැත.", "இந்த ஆண்டு முடிந்த பயிற்சி இல்லை.", "No completed programme for this year."))}</td></tr>`}</tbody>
    </table></div>
    ${state.user.role === "User" ? "" : `<section>
      <h2 class="classic-title">${esc(L("ඊළඟ වර්ෂයේ පුහුණු වැඩසටහන්", "அடுத்த ஆண்டுப் பயிற்சிகள்", "Next year's programmes"))}</h2>
      <p class="pad-note">${esc(L("ආකෘතිය බාගත කරලා පුහුණු වැඩසටහන්වල නම් ලියන්න. ඒ ගොනුව මෙතන දාන්න. ඒවා තෝරන වර්ෂයේ සැලැස්ම සකස් කිරීමට යනවා.", "வார்ப்புருவைப் பதிவிறக்கம் செய்து பயிற்சிப் பெயர்களை எழுதவும். அந்தக் கோப்பை இங்கே இடவும். அவை தேர்ந்த ஆண்டின் திட்ட அமைப்பிற்குச் செல்லும்.", "Download the template and write the programme names. Upload that file here. They go to plan setup for the year you choose."))}</p>
      <form class="sheet-tools" id="next-plan">
        <label>${esc(L("සැලැස්මේ වර්ෂය", "திட்ட ஆண்டு", "Plan year"))} <input name="year" inputmode="numeric" value="${esc(String(Number(asked) + 1))}"></label>
        <button type="button" data-act="plan-template">${esc(L("ආකෘතිය බාගත කරන්න", "வார்ப்புரு பதிவிறக்கம்", "Download the template"))}</button>
        <label class="file-pick">${esc(L("ලැයිස්තුව උඩුගත කරන්න", "பட்டியல் பதிவேற்றம்", "Upload the list"))}<input type="file" data-next-plan accept=".csv,.xls,.xlsx"></label>
      </form>
    </section>`}`;
}

function renderPrivate(work) {
  work.innerHTML = `
    <h1>Private course application</h1>
    <p class="muted">Ask the unit to fund a course run by another institute. Approval and cheque details are added later by an administrator.</p>
    <form class="card" id="private-form">
      <div class="form-grid">
        <label>Officer national ID<input name="nid" required></label>
        <label>Course<input name="course" required></label>
        <label>Institute<input name="institute" required></label>
        <label>Fees<input name="fees"></label>
        <label>Starts<input name="start" type="date"></label>
        <label>Ends<input name="end" type="date"></label>
        <label>Duration<input name="duration"></label>
        <label>Why it is relevant<input name="relevant"></label>
        <label class="wide">Education<textarea name="education"></textarea></label>
        <label class="wide">Other courses<textarea name="other"></textarea></label>
      </div>
      <p><button class="btn" type="submit">Submit application</button></p>
      <div id="form-msg"></div>
    </form>`;
}

async function renderLetter(work) {
  const nid = (state.query?.get("nid") || "").trim();
  const year = state.query?.get("year") || chosenYear();
  const now = Number(localToday().slice(0, 4));
  const years = [];
  for (let value = now; value >= now - 15; value -= 1) years.push(String(value));
  if (!years.includes(year)) years.unshift(year);
  const options = years.map((item) => `<option value="${esc(item)}" ${item === year ? "selected" : ""}>${esc(item)}</option>`).join("");
  let result = "";
  if (nid) {
    try {
      const data = await api("call-letters", { query: { nid, year } });
      const officer = data.officer || {};
      const rows = (data.items || []).map((row) => `<tr>
        <td class="wrap-cell">${esc(row.name)}</td>
        <td>${esc(showDate(row.day))}</td>
        <td class="wrap-cell">${esc(row.place)}</td>
        <td><button class="text-btn" type="button" data-act="print-letter" data-nid="${esc(nid)}" data-atp="${esc(row.id)}">${esc(L("කැඳවීමේ ලිපිය", "அழைப்புக் கடிதம்", "Call letter"))}</button></td>
      </tr>`).join("");
      result = `
        <p class="pad-note">${esc([officer.name, officer.designation, officer.office].filter(Boolean).join(" · "))}</p>
        <div class="table-wrap desig-list"><table>
          <thead><tr>
            <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
            <th>${esc(L("දිනය", "திகதி", "Date"))}</th>
            <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
            <th></th>
          </tr></thead>
          <tbody>${rows || `<tr><td colspan="4">${esc(L("මේ වර්ෂයේ සහභාගි වූ පුහුණු වැඩසටහන් නොමැත.", "இந்த ஆண்டு பங்கேற்ற பயிற்சி இல்லை.", "No programme this officer attended in this year."))}</td></tr>`}</tbody>
        </table></div>`;
    } catch (error) {
      result = `<div class="error">${esc(error.message)}</div>`;
    }
  }
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("කැඳවීමේ ලිපිය", "அழைப்புக் கடிதம்", "Call letter"))}</h2>
    <form class="classic-form" id="letter-form">
      <label class="classic-field"><span>${esc(L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"))}</span><input name="nid" value="${esc(nid)}" required></label>
      <label class="classic-field"><span>${esc(L("වර්ෂය", "ஆண்டு", "Year"))}</span><select name="year" data-year-pick>${options}</select></label>
      <button type="submit">${esc(L("සොයන්න", "தேடு", "Search"))}</button>
    </form>
    ${result}
    <div id="paper"></div>`;
}

async function renderScheduled(work) {
  const programmes = await api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } });
  const today = localToday();
  const upcoming = namedPlans(programmes.items || []).filter((item) => {
    if (!inPlan(item.atp_isaddatp) && !inPlan(item.atp_isinatp)) return false;
    const end = programmeEnd(item);
    return end && end >= today;
  }).sort((a, b) => showDate(a.atp_day1).localeCompare(showDate(b.atp_day1)) || Number(a.atp_id) - Number(b.atp_id));
  const rows = upcoming.map((row, index) => {
    const id = esc(row.atp_id);
    const people = storedPlanPeople(row).filter(Boolean).map((name) => esc(name)).join("<br>");
    return `<tr>
    <td>${index + 1}</td>
    <td class="wrap-cell">${esc(row.atp_fileno)}</td>
    <td>${esc(showDate(row.atp_day1))}</td>
    <td class="wrap-cell">${esc(row.atp_trname)}</td>
    <td class="wrap-cell">${esc(row.atp_targetgroup)}</td>
    <td>${esc(row.atp_noofparticipants)}</td>
    <td>${esc(row.atp_noofdays)}</td>
    <td class="wrap-cell">${esc(row.atp_location)}</td>
    <td class="wrap-cell">${people}</td>
    <td class="stack-links"><a href="#console/estimate?atp=${id}">${esc(L("ව්‍යාපෘති වාර්තාව හා වියදම් ඇස්තමේන්තුව", "திட்ட அறிக்கையும் செலவு மதிப்பீடும்", "Project report and cost estimate"))}</a></td>
    <td class="stack-links"><a href="#console/namelist?atp=${id}">${esc(L("පුහුණුලාභීන්ගේ නාමලේඛණය", "பயிற்சியாளர் பெயர்ப்பட்டியல்", "Trainees' name list"))}</a></td>
  </tr>`;
  }).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("පැවැත්වීමට නියමිත පුහුණු වැඩසටහන්", "நடத்தப்படவுள்ள பயிற்சிகள்", "Programmes due to be held"))}</h2>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ලිපිගොනු අංකය", "கோப்பு எண்", "File number"))}</th>
        <th>${esc(L("ආරම්භ වන දිනය", "தொடக்க திகதி", "Start date"))}</th>
        <th>${esc(L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ඉලක්කගත කණ්ඩායම", "இலக்கு குழு", "Target group"))}</th>
        <th>${esc(L("සහභාගී වන්නන් සංඛ්‍යාව", "பங்கேற்பாளர் எண்ணிக்கை", "Participants"))}</th>
        <th>${esc(L("පැවැත්වෙන දින ගණන", "நடக்கும் நாட்கள்", "Number of days"))}</th>
        <th>${esc(L("පැවැත්වෙන ස්ථානය", "இடம்", "Place"))}</th>
        <th>${esc(L("සම්පත් දායකයින්", "வள ஆள்கள்", "Resource persons"))}</th>
        <th></th>
        <th></th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="11">${esc(L("පැවැත්වීමට නියමිත වැඩසටහන් නොමැත.", "நடத்தவுள்ள பயிற்சி இல்லை.", "No programmes are due."))}</td></tr>`}</tbody>
    </table></div>
    <p class="scheduled-copy"><button type="button" onclick="window.print()">${esc(L("තොරතුරු පිටපත", "தகவல் நகல்", "Copy of the details"))}</button></p>`;
}

async function renderNameList(work) {
  const atp = state.query?.get("atp") || "";
  const [programmes, list] = await Promise.all([
    api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } }),
    atp ? api("applicants", { query: { atp, selected: "1" } }) : Promise.resolve({ items: [] }),
  ]);
  const plan = (programmes.items || []).find((item) => String(item.atp_id) === String(atp)) || {};
  const rows = list.items || [];
  state.namelist = { programme: plan, rows };
  const body = rows.map((row, index) => `<tr class="${row.blacklisted === "Yes" ? "blacklisted" : ""}">
    <td>${index + 1}</td>
    <td>${esc(row.tapp_officerNid)}</td>
    <td class="wrap-cell">${esc(row.stf_Name || row.tratt_name)}</td>
    <td class="wrap-cell">${esc(row.stf_desig || row.tratt_desig)}</td>
    <td class="wrap-cell">${esc(row.tapp_office)}</td>
    <td>${esc(row.stf_mobile || row.tratt_mobile)}</td>
    <td>${esc(row.stf_sex)}</td>
    <td class="wrap-cell">${esc(row.tapp_accomodation)}</td>
  </tr>`).join("");
  work.innerHTML = `
    <article class="letter name-list" id="name-list">
      <h2>${esc(L("සහභාගී වන්නන්ගේ නාම ලේඛනය", "பங்கேற்பாளர் பெயர்ப்பட்டியல்", "Participants' name list"))}</h2>
      <p class="name-meta">
        <span>${esc(L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme"))} - ${esc(plan.atp_trname || "")}<br>${esc(L("පැවැත්වෙන ස්ථානය", "இடம்", "Place"))} - ${esc(plan.atp_location || "")}</span>
        <span>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))} - ${esc(showDate(plan.atp_day1))}</span>
      </p>
      <table><thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ඉල්ලුම් කල නිලධාරියාගේ ජා.හැ.අ.", "அதிகாரி அடையாள எண்", "Officer national ID"))}</th>
        <th>${esc(L("නිලධාරියාගේ නම", "அதிகாரி பெயர்", "Officer name"))}</th>
        <th>${esc(L("තනතුරු නාමය", "பதவி", "Designation"))}</th>
        <th>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
        <th>${esc(L("ජංගම දුරකථන අංකය", "கைபேசி எண்", "Mobile number"))}</th>
        <th>${esc(L("ස්ත්‍රී/පුරුෂ භාවය", "பாலினம்", "Gender"))}</th>
        <th>${esc(L("නවාතැන් අවශ්‍යතාවය", "தங்குமிடத் தேவை", "Accommodation"))}</th>
      </tr></thead><tbody>${body || `<tr><td colspan="8">${esc(L("තොරතුරු කිසිවක් නොමැත...!", "தகவல் இல்லை...!", "No details...!"))}</td></tr>`}</tbody></table>
    </article>
    <p class="scheduled-copy"><button type="button" data-act="namelist-pdf">${esc(L("PDF බාගත කරන්න", "PDF பதிவிறக்கம்", "Download PDF"))}</button></p>`;
}

function attendedHeaders() {
  return [
    L("අනු අංකය", "இல.", "No."),
    L("දිනය", "திகதி", "Date"),
    L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"),
    L("ජා.හැ.අ.", "அடையாள எண்", "National ID"),
    L("නිලධාරියාගේ නම", "அதிகாரி பெயர்", "Officer name"),
    L("තනතුර", "பதவி", "Designation"),
    L("කාර්යාලය", "அலுவலகம்", "Office"),
    L("ජංගම දුරකථන අංකය", "கைபேசி எண்", "Mobile"),
  ];
}

function attendedCells(row, index) {
  return [String(index + 1), row.date || "", row.programme || "", row.nid || "", row.name || "", row.desig || "", row.office || "", row.mobile || ""];
}

function attendedCaption(data) {
  const parts = [`${L("වර්ෂය", "ஆண்டு", "Year")} - ${data.year}`];
  const plan = (data.programmes || []).find((item) => String(item.id) === String(data.atp));
  if (plan) parts.push(`${L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme")} - ${plan.name}`);
  if (data.office) parts.push(`${L("කාර්යාලය", "அலுவலகம்", "Office")} - ${data.office}`);
  if (data.nid) parts.push(`${L("ජා.හැ.අ.", "அடையாள எண்", "National ID")} - ${data.nid}`);
  return parts.join("   ·   ");
}

async function renderAttended(work) {
  const year = chosenYear();
  const atp = state.query?.get("atp") || "";
  const office = state.query?.get("office") || "";
  const nid = state.query?.get("nid") || "";
  const data = await api("attended", { query: { year, atp, office, nid } });
  const rows = data.items || [];
  state.attended = { ...data, atp, nid };
  const programmes = (data.programmes || []).map((item) => `<option value="${esc(item.id)}"${String(item.id) === String(atp) ? " selected" : ""}>${esc(`${item.date ? item.date + " - " : ""}${item.name || item.id} (${item.people})`)}</option>`).join("");
  const offices = (data.offices || []).map((name) => `<option${name === office ? " selected" : ""}>${esc(name)}</option>`).join("");
  const officeField = data.mine
    ? `<p class="muted">${esc(L("ඔබේ කාර්යාලය", "உங்கள் அலுவலகம்", "Your office"))} - ${esc(data.office || "-")}</p>`
    : `<label>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))} <select name="office"><option value="">${esc(L("සියලු කාර්යාල", "அனைத்து அலுவலகங்கள்", "All offices"))}</option>${offices}</select></label>`;
  const peopleCount = new Set(rows.map((row) => row.nid).filter(Boolean)).size;
  const planCount = new Set(rows.map((row) => row.atp)).size;
  const body = rows.map((row, index) => `<tr>${attendedCells(row, index).map((cell, cellIndex) => `<td${cellIndex === 2 || cellIndex >= 4 ? ' class="wrap-cell"' : ""}>${esc(cell)}</td>`).join("")}</tr>`).join("");
  work.innerHTML = `
    <form class="sheet-tools attended-tools" id="attended-filter">
      <label>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))} <select name="atp"><option value="">${esc(L("සියලු වැඩසටහන්", "அனைத்து பயிற்சிகள்", "All programmes"))}</option>${programmes}</select></label>
      ${officeField}
      <label>${esc(L("ජා.හැ.අ.", "அடையாள எண்", "National ID"))} <input name="nid" value="${esc(nid)}" autocomplete="off" placeholder="${esc(L("හැඳුනුම්පත් අංකය", "அடையாள எண்", "ID number"))}"></label>
      <button type="submit">${esc(L("සොයන්න", "தேடு", "Search"))}</button>
      <button type="button" class="secondary" data-act="attended-clear">${esc(L("පෙරහන් ඉවත් කරන්න", "வடிகட்டியை நீக்கு", "Clear filters"))}</button>
    </form>
    <article class="letter name-list attended-list">
      <h2>${esc(L("පුහුණුවලට සහභාගී වූ නිලධාරීන්ගේ නාමලේඛනය", "பயிற்சியில் பங்கேற்ற அதிகாரிகளின் பெயர்ப்பட்டியல்", "Register of officers who attended training"))}</h2>
      <p class="name-meta"><span>${esc(attendedCaption(state.attended))}</span>
        <span>${esc(L("නිලධාරීන්", "அதிகாரிகள்", "Officers"))} - ${peopleCount} · ${esc(L("වැඩසටහන්", "பயிற்சிகள்", "Programmes"))} - ${planCount} · ${esc(L("පේළි", "வரிசைகள்", "Rows"))} - ${rows.length}</span></p>
      <div class="table-wrap"><table><thead><tr>${attendedHeaders().map((head) => `<th>${esc(head)}</th>`).join("")}</tr></thead>
      <tbody>${body || `<tr><td colspan="8">${esc(L("තොරතුරු කිසිවක් නොමැත...!", "தகவல் இல்லை...!", "No details...!"))}</td></tr>`}</tbody></table></div>
    </article>
    <p class="scheduled-copy">
      <button type="button" data-act="attended-pdf">${esc(L("PDF බාගත කරන්න", "PDF பதிவிறக்கம்", "Download PDF"))}</button>
      <button type="button" class="secondary" data-act="attended-csv">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
    </p>`;
}

function saveAttendedCsv() {
  const data = state.attended;
  if (!data) return;
  const quote = (cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`;
  const lines = [attendedHeaders(), ...(data.items || []).map((row, index) => attendedCells(row, index))];
  const csv = `\uFEFF${lines.map((line) => line.map(quote).join(",")).join("\r\n")}\r\n`;
  saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `sahabagi-namalekanaya-${data.year}.csv`);
}

async function saveAttendedPdf() {
  const data = state.attended;
  if (!data) return;
  await document.fonts.ready;
  const width = 1754;
  const pageH = 1240;
  const margin = 28;
  const tableW = width - margin * 2;
  const widths = [0.04, 0.08, 0.2, 0.1, 0.17, 0.14, 0.17, 0.1].map((part) => tableW * part);
  const fontSize = 13;
  const lineH = fontSize + 5;
  const fontFor = (header) => `${header ? 700 : 400} ${fontSize}px "Noto Sans Sinhala", "Source Sans 3", sans-serif`;
  const measure = document.createElement("canvas").getContext("2d");
  const layoutRow = (cells, header) => {
    measure.font = fontFor(header);
    const wrapped = cells.map((text, index) => canvasWrap(measure, text, Math.max(8, widths[index] - 8)));
    return { wrapped, height: Math.max(...wrapped.map((lines) => lines.length), 1) * lineH + 8, header };
  };
  const headers = attendedHeaders();
  const headerRow = layoutRow(headers, true);
  const items = data.items || [];
  const bodyRows = items.length
    ? items.map((row, index) => layoutRow(attendedCells(row, index), false))
    : [layoutRow([L("තොරතුරු කිසිවක් නොමැත...!", "தகவல் இல்லை...!", "No details...!"), ...headers.slice(1).map(() => "")], false)];
  measure.font = '700 26px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const titleLines = canvasWrap(measure, L("පුහුණුවලට සහභාගී වූ නිලධාරීන්ගේ නාමලේඛනය", "பயிற்சியில் பங்கேற்ற அதிகாரிகளின் பெயர்ப்பட்டியல்", "Register of officers who attended training"), tableW);
  measure.font = '400 16px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const captionLines = canvasWrap(measure, attendedCaption(data), tableW);
  const titleHeight = 20 + titleLines.length * 32 + captionLines.length * 22 + 16;
  const packs = [];
  let cursor = 0;
  let first = true;
  while (first || cursor < bodyRows.length) {
    let used = (first ? titleHeight : 16) + headerRow.height;
    const slice = [];
    while (cursor < bodyRows.length && used + bodyRows[cursor].height <= pageH - 20) {
      slice.push(bodyRows[cursor]);
      used += bodyRows[cursor].height;
      cursor += 1;
    }
    if (!slice.length && cursor < bodyRows.length) {
      slice.push(bodyRows[cursor]);
      cursor += 1;
    }
    packs.push({ first, slice });
    first = false;
  }
  const images = [];
  for (const pack of packs) {
    const page = document.createElement("canvas");
    page.width = width;
    page.height = pageH;
    const ctx = page.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, pageH);
    ctx.fillStyle = "#111111";
    ctx.textBaseline = "middle";
    let y = 18;
    if (pack.first) {
      ctx.font = '700 26px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
      ctx.textAlign = "center";
      titleLines.forEach((line) => { ctx.fillText(line, width / 2, y + 14); y += 32; });
      ctx.font = '400 16px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
      captionLines.forEach((line) => { ctx.fillText(line, width / 2, y + 10); y += 22; });
      y += 12;
    }
    const drawRow = (row, top) => {
      ctx.font = fontFor(row.header);
      ctx.strokeStyle = "#222222";
      ctx.lineWidth = 1;
      let x = margin;
      row.wrapped.forEach((lines, index) => {
        const cellW = widths[index];
        if (row.header) {
          ctx.fillStyle = "#87ceeb";
          ctx.fillRect(x, top, cellW, row.height);
        }
        ctx.strokeRect(x, top, cellW, row.height);
        ctx.fillStyle = "#111111";
        ctx.textAlign = "center";
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 3, top + 2, Math.max(1, cellW - 6), Math.max(1, row.height - 4));
        ctx.clip();
        lines.forEach((line, lineIndex) => ctx.fillText(line, x + cellW / 2, top + 4 + lineH / 2 + lineIndex * lineH));
        ctx.restore();
        x += cellW;
      });
      return top + row.height;
    };
    y = drawRow(headerRow, y);
    pack.slice.forEach((row) => { y = drawRow(row, y); });
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: page.width, height: page.height });
  }
  saveBlob(jpegPdfPages(images, "841.89", "595.28"), `sahabagi-namalekanaya-${data.year}.pdf`);
}

async function renderEstimate(work) {
  const atp = state.query?.get("atp") || "";
  if (atp) {
    work.innerHTML = `<div id="paper"><p class="muted">Loading…</p></div>`;
    try {
      const programmes = await api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } });
      const chosen = (programmes.items || []).find((item) => String(item.atp_id) === String(atp));
      const data = await api("estimate", { query: { id: atp, days: chosen?.atp_noofdays || 1, people: chosen?.atp_noofparticipants || 1 } });
      $("#paper").innerHTML = estimateSheetHtml(data);
      const form = $("#paper .estimate-form");
      if (form) {
        form.dataset.atp = atp;
        if (state.module === "revise") form.dataset.revised = "1";
      }
      form?.addEventListener("focusin", (event) => {
        const input = event.target.closest?.(".est-formula");
        if (!input || input.tagName === "TEXTAREA" || !form.contains(input)) return;
        const formula = input.dataset.formula ?? "";
        const mode = input.dataset.est || "text";
        if (mode !== "sum" && mode !== "detail" && !estimateShowsAnswer(formula, estimateAmount(formula))) return;
        input.value = formula;
        refreshEstimate(form);
      });
      form?.addEventListener("input", (event) => {
        const input = event.target.closest?.(".est-formula");
        if (!input || !form.contains(input)) return;
        input.dataset.formula = input.value;
        if (input.dataset.sumOf) input.dataset.auto = "0";
        refreshEstimate(form);
      });
      form?.addEventListener("focusout", (event) => {
        const input = event.target.closest?.(".est-formula");
        if (!input || !form.contains(input)) return;
        input.dataset.formula = input.value;
        input.dataset.leaving = "1";
        refreshEstimate(form);
        delete input.dataset.leaving;
      });
      if (data.saved) applyEstimateSnapshot(form, data.saved);
      else refreshEstimate(form);
    } catch (error) {
      $("#paper").innerHTML = `<div class="error">${esc(error.message)}</div>`;
    }
    return;
  }
  const [programmes, saved] = await Promise.all([
    api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } }),
    api("saved-estimates"),
  ]);
  const savedRows = (saved.items || []).map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td>${esc(showDate(row.day))}</td>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td class="wrap-cell">${esc(row.file)}</td>
    <td>${esc(row.total)}</td>
    <td><a href="#console/estimate?atp=${esc(row.id)}">${esc(L("විවෘත කරන්න", "திற", "Open"))}</a></td>
  </tr>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("වියදම් ඇස්තමේන්තුව", "செலவு மதிப்பீடு", "Cost estimate"))}</h2>
    <form class="classic-form" id="estimate-form" action="#" method="post">
      <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</span><select name="id" required>${programmeSelect((programmes.items || []).filter((item) => !inPlan(item.atp_offweb)), "")}</select></label>
      <button type="submit">${esc(L("ඇස්තමේන්තුව", "மதிப்பீடு", "Estimate"))}</button>
    </form>
    <h2 class="classic-title">${esc(L("සුරැකි ඇස්තමේන්තු", "சேமித்த மதிப்பீடுகள்", "Saved estimates"))}</h2>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ලිපිගොනු අංකය", "கோப்பு எண்", "File number"))}</th>
        <th>${esc(L("එකතුව", "மொத்தம்", "Total"))}</th>
        <th></th>
      </tr></thead>
      <tbody>${savedRows || `<tr><td colspan="6">${esc(L("සුරැකි ඇස්තමේන්තු නොමැත.", "சேமித்த மதிப்பீடு இல்லை.", "No saved estimates."))}</td></tr>`}</tbody>
    </table></div>
    <div id="paper"></div>`;
}

function addMonths(iso, months) {
  const parts = String(iso || "").slice(0, 10).split("-").map(Number);
  if (parts.length < 3 || !parts[0]) return "";
  const date = new Date(parts[0], parts[1] - 1 + months, parts[2]);
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

function revisedEstimates(items) {
  const today = localToday();
  return (items || []).filter((row) => {
    const end = showDate(row.end) || showDate(row.day);
    if (!end) return true;
    const until = addMonths(end, 3);
    return until && until >= today;
  }).sort((a, b) => {
    const left = showDate(a.end) || showDate(a.day) || "0000-00-00";
    const right = showDate(b.end) || showDate(b.day) || "0000-00-00";
    if (left !== right) return right.localeCompare(left);
    return Number(b.id) - Number(a.id);
  });
}

async function renderRevise(work) {
  if (state.query?.get("atp")) return renderEstimate(work);
  const saved = await api("saved-estimates");
  const rows = revisedEstimates(saved.items).map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td class="wrap-cell">${esc(row.file)}</td>
    <td>${esc(showDate(row.day))}</td>
    <td>${esc(showDate(row.end))}</td>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td class="wrap-cell">${esc(row.target)}</td>
    <td>${esc(row.participants)}</td>
    <td>${esc(row.days)}</td>
    <td class="wrap-cell">${esc(row.place)}</td>
    <td class="wrap-cell">${(row.people || []).filter(Boolean).map((name) => esc(name)).join("<br>")}</td>
    <td>${esc(row.total)}</td>
    <td><a class="btn small" href="#console/revise?atp=${esc(row.id)}">Edit estimate</a></td>
  </tr>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("සංශෝධිත ඇස්තමේන්තු සැකසීම", "திருத்திய மதிப்பீடு அமைத்தல்", "Prepare a revised estimate"))}</h2>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ලිපිගොනු අංකය", "கோப்பு எண்", "File number"))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))}</th>
        <th>${esc(L("අවසන් දිනය", "இறுதி திகதி", "End date"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ඉලක්කගත කණ්ඩායම", "இலக்கு குழு", "Target group"))}</th>
        <th>${esc(L("සහභාගී වන්නන්", "பங்கேற்பாளர்கள்", "Participants"))}</th>
        <th>${esc(L("දින ගණන", "நாட்கள்", "Days"))}</th>
        <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
        <th>${esc(L("සම්පත්දායකයින්", "வள ஆள்கள்", "Resource persons"))}</th>
        <th>${esc(L("එකතුව", "மொத்தம்", "Total"))}</th>
        <th></th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="12">${esc(L("සුරැකි ඇස්තමේන්තු නොමැත.", "சேமித்த மதிப்பீடு இல்லை.", "No saved estimates."))}</td></tr>`}</tbody>
    </table></div>`;
}

async function renderOffweb(work) {
  if (state.query?.get("atp")) return renderEstimate(work);
  let people = [];
  try {
    people = (await api("list", { query: { table: "cp_resourcepersons", limit: 1000, page: 1 } })).items || [];
  } catch (error) {
    people = [];
  }
  planLecturers = people;
  if (!state.options?.centres) {
    try { state.options = Object.assign(state.options || {}, await api("options")); } catch (error) { /* centres stay empty */ }
  }
  const saved = await api("offweb-list");
  const rows = (saved.items || []).map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td>${esc(showDate(row.day))}</td>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td class="wrap-cell">${esc(row.file)}</td>
    <td class="wrap-cell">${esc(row.place)}</td>
    <td><a href="#console/offweb?atp=${esc(row.id)}">${esc(L("ඇස්තමේන්තුව", "மதிப்பீடு", "Estimate"))}</a></td>
  </tr>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("වෙබ් අඩවිය මගින් කැඳවීම නොකර පවත්වන පුහුණු ඇතුළත් කිරීම හා ඇස්තමේන්තු සැකසීම", "இணையம் வழியாக அழைக்காமல் நடத்தும் பயிற்சியைச் சேர்த்தல் மற்றும் மதிப்பீடு", "Enter a training not called through the website and prepare the estimate"))}</h2>
    <p class="pad-note">${esc(L("මෙතනින් ඇතුළත් කරන වැඩසටහන මුල් පිටුවේ පෙන්වන්නේ නැත. පුහුණු වැඩසටහන් සඳහා අයදුම් කරන තැනත් පෙන්වන්නේ නැත.", "இங்கே சேர்க்கும் பயிற்சி முகப்பிலோ விண்ணப்பப் பக்கத்திலோ தெரியாது.", "A programme entered here does not appear on the home page or in the application list."))}</p>
    <form class="classic-form old-plan" id="offweb-form" action="#" method="post">
      ${annualFormFields({
        atp_trtype: TYPE_MDTU,
        atp_showspecialfacts: NO,
        atp_specialfinletter: NO,
        atp_isaddatp: NO,
        atp_addhome: NO,
      }, true)}
      <button type="submit">${esc(L("ඇතුළත් කරලා ඇස්තමේන්තුව සකසන්න", "சேர்த்து மதிப்பீடு அமைக்க", "Enter and prepare the estimate"))}</button>
      <div id="form-msg"></div>
    </form>
    <h2 class="classic-title">${esc(L("ඇතුළත් කළ පුහුණු", "சேர்த்த பயிற்சிகள்", "Entered trainings"))}</h2>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))}</th>
        <th>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</th>
        <th>${esc(L("ලිපිගොනු අංකය", "கோப்பு எண்", "File number"))}</th>
        <th>${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
        <th></th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="6">${esc(L("තවම ඇතුළත් කළ පුහුණු නොමැත.", "இன்னும் பயிற்சி சேர்க்கவில்லை.", "No trainings have been entered."))}</td></tr>`}</tbody>
    </table></div>`;
  paintPlanDates([""]);
  paintPlanPeople([]);
  paintPlanStaff([]);
}

function estimateMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "";
}

function estimateFoodPrice(lines, kind) {
  return (lines || []).reduce((sum, line) => {
    const name = String(line.item || "").toLowerCase();
    const tea = name.includes("tea") || name.includes("තේ") || name.includes("උදේ") || name.includes("උදෑ") || name.includes("සවස") || name.includes("හවස");
    const lunch = name.includes("lunch") || name.includes("දිවා") || name.includes("බත්") || name === "ban";
    if (kind === "tea" && tea) return sum + Number(line.price || 0);
    if (kind === "lunch" && lunch && !tea) return sum + Number(line.price || 0);
    return sum;
  }, 0);
}

function estimateFactor(value) {
  const number = Number(value);
  return Number.isFinite(number) ? String(Math.round(number * 100) / 100) : "0";
}

function estimateAmount(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return 0;
  const expr = (text.startsWith("=") ? text.slice(1) : text).trim().replace(/×/g, "*").replace(/[xX]/g, "*").replace(/,/g, "");
  if (!/^[\d+\-*/().\s]+$/.test(expr) || !/\d/.test(expr)) return null;
  try {
    const value = Function(`"use strict"; return (${expr})`)();
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  } catch (error) {
    return null;
  }
}

function estimateShowsAnswer(raw, amount) {
  const text = String(raw ?? "").trim();
  if (!text || amount === null) return false;
  return text.startsWith("=") || /[xX*+\-/×]/.test(text);
}

function syncEstimateParents(form) {
  form.querySelectorAll("[data-sum-of]").forEach((parent) => {
    if (parent.dataset.auto !== "1") return;
    const parts = [...form.querySelectorAll(`[data-group="${parent.dataset.sumOf}"]`)]
      .map((input) => String(input.dataset.formula || "").trim().replace(/^=/, "").trim())
      .filter((part) => part && estimateAmount(part) !== null);
    parent.dataset.formula = parts.length ? `=${parts.join("+")}` : "";
  });
}

function refreshEstimate(form) {
  if (!form) return;
  form.querySelectorAll(".est-formula").forEach((input) => {
    if (!("formula" in input.dataset)) input.dataset.formula = input.value;
  });
  syncEstimateParents(form);
  form.querySelectorAll(".est-formula").forEach((input) => {
    const mode = input.dataset.est || "text";
    const editing = input.dataset.leaving !== "1" && document.activeElement === input && input.tagName !== "TEXTAREA";
    const formula = editing ? input.value : (input.dataset.formula || "");
    if (editing) input.dataset.formula = formula;
    const amount = estimateAmount(formula);
    input.dataset.amount = String(amount === null ? 0 : amount);
    const outside = input.closest(".est-line")?.querySelector(".est-outside");
    const calc = mode === "sum" || mode === "detail" || estimateShowsAnswer(formula, amount);
    const showFormula = !editing && calc && /[=xX*+\-/×]/.test(formula);
    if (outside) {
      outside.hidden = !showFormula;
      outside.textContent = showFormula ? formula.trim() : "";
    }
    if (editing || input.tagName === "TEXTAREA") return;
    if (!calc) {
      input.value = formula;
      return;
    }
    input.value = amount === null ? "" : estimateMoney(amount);
  });
  let total = 0;
  form.querySelectorAll('.est-formula[data-est="sum"]').forEach((input) => {
    total += Number(input.dataset.amount || 0);
  });
  const money = estimateMoney(total);
  form.querySelectorAll("[data-estimate-total]").forEach((node) => {
    node.textContent = money;
  });
}

function estimateLecturerLine(index, name, formula) {
  const title = String(name || "").trim() || `${index} ${L("වන සම්පත්දායකයා", "ஆம் வள ஆள்", "resource person")}`;
  return `<label class="classic-field est-line est-lecturer"><span data-name="${esc(name || "")}"><span class="est-topic">${esc(title)}</span><small class="est-outside" hidden></small></span><span class="est-formula-row"><input class="est-formula" data-est="detail" data-group="lecture" data-formula="${esc(formula)}" value="${esc(formula)}"><button type="button" class="text-btn small" data-act="estimate-drop-lecturer">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button></span></span></label>`;
}

function renumberEstimateLecturers() {
  document.querySelectorAll("#estimate-lecturers .est-lecturer").forEach((row, index) => {
    const span = row.querySelector(":scope > span");
    const topic = span?.querySelector(".est-topic");
    const name = span?.dataset.name || "";
    if (topic && !name) topic.textContent = `${index + 1} ${L("වන සම්පත්දායකයා", "ஆம் வள ஆள்", "resource person")}`;
  });
}

function addEstimateLecturer() {
  const form = document.querySelector(".estimate-form");
  const list = document.getElementById("estimate-lecturers");
  const anchor = list?.querySelector(".est-add");
  if (!form || !anchor) return;
  const days = Number(form.dataset.days) || 0;
  const next = list.querySelectorAll(".est-lecturer").length + 1;
  anchor.insertAdjacentHTML("beforebegin", estimateLecturerLine(next, "", days ? `=800*${days}` : ""));
  refreshEstimate(form);
}

function estimateApproval(person) {
  const name = String(person || "").trim() || "එස්.එම්.පෙත්තාවඩු මහත්මිය";
  return `ඉහත පාඨමාලාව නියමිත දිනවල පැවැත්වීමටත්, ඒ සඳහා ඇස්තමේන්තුගත වියදම පළාත් සභා අරමුදලින් ලබාගෙන වියදම් දැරීමටත් අනුමැතිය පතමි. මෙම පාඨමාලාවේ සමායෝජක ලෙස ${name} කටයුතු කරනු ඇත.`;
}

function applySignatoryToNote(form) {
  const note = form?.querySelector('[data-key="note"]');
  if (!note) return;
  const sentence = estimateApproval(form.dataset.signatory);
  const text = String(note.dataset.formula || note.value || "");
  if (!text.trim() || text.includes("සමායෝජක ලෙස")) {
    note.dataset.formula = sentence;
    note.value = sentence;
  }
}

function estimateMoneyPrint(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0.00";
  return number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function estimatePrintValue(input) {
  if (!input) return "";
  const mode = input.dataset.est || "text";
  const formula = String(input.dataset.formula || "").trim();
  if (mode === "text") return formula;
  const amount = estimateAmount(formula);
  const shown = estimateMoneyPrint(amount === null ? 0 : amount);
  if (formula && /[=xX*+\-/×]/.test(formula)) {
    const pretty = formula.replace(/^=/, "").replace(/\*/g, " X ").replace(/×/g, " X ").trim();
    return `( ${pretty} ) රු. ${shown}`;
  }
  return `රු. ${shown}`;
}

function estimateOfficialHtml(form) {
  const rows = [];
  form.querySelectorAll(".annual-col .classic-field, .annual-col .est-section").forEach((field) => {
    if (field.closest(".est-add") || field.classList.contains("est-date-add")) return;
    if (field.classList.contains("est-section")) {
      rows.push({ no: "6", label: "වියදම් ඇස්තමේන්තුව", value: "", colon: "", bold: true });
      return;
    }
    if (field.classList.contains("est-date")) {
      if (rows.some((row) => row.no === "3")) return;
      const dates = [...form.querySelectorAll("#estimate-dates input")].map((input) => showDate(input.value)).filter(Boolean);
      rows.push({ no: "3", label: "පුහුණුව පැවැත්වෙන දිනය/දිනයන්", value: dates.join(", "), colon: ":" });
      return;
    }
    const select = field.querySelector("select");
    if (select) {
      rows.push({ no: "5", label: "නේවාසිකද යන වග", value: select.value, colon: ":" });
      return;
    }
    const topic = (field.querySelector(".est-topic") || field.querySelector(":scope > span"))?.textContent.trim() || "";
    if (!topic || topic.startsWith("අනුමැතිය") || topic.startsWith("මුළු එකතුව")) return;
    if (field.classList.contains("est-lecturer")) {
      const holder = field.querySelector(":scope > span");
      let name = holder?.dataset.name || "";
      if (!name) name = field.querySelector(".est-topic")?.textContent.trim() || "";
      rows.push({
        no: "",
        label: name,
        value: estimatePrintValue(field.querySelector(".est-formula")),
        colon: ":",
        person: true,
      });
      return;
    }
    const match = topic.match(/^(\d+(?:\.\d+)?)\s+([\s\S]+)$/);
    const no = match ? match[1] : "";
    const label = match ? match[2] : topic;
    const sectionHead = no === "6" || no === "6.1";
    const lectureHead = no === "6.5" && field.querySelector(".est-formula")?.dataset.auto === "1" && form.querySelector(".est-lecturer");
    if (label === "මගේ අංකය") {
      rows.push({ no: "", label, value: field.querySelector(".est-formula")?.dataset.formula || "", colon: "", mine: true });
      return;
    }
    rows.push({
      no,
      label,
      value: sectionHead || lectureHead ? "" : estimatePrintValue(field.querySelector(".est-formula")),
      colon: sectionHead ? "" : ":",
      indent: !no,
      bold: no === "6",
    });
  });
  const body = rows.map((row) => `<tr class="${row.bold ? "head" : ""} ${row.mine ? "mine" : ""}">
    <td class="num">${esc(row.no || "")}</td>
    <td class="${row.person ? "person" : row.indent ? "indent" : ""}">${esc(row.label)}</td>
    <td class="colon">${esc(row.colon || "")}</td>
    <td>${esc(row.value || "")}</td>
  </tr>`).join("");
  const total = estimateMoneyPrint(String(form.querySelector("[data-estimate-total]")?.textContent || "0").replace(/,/g, ""));
  const note = estimateApproval(form.dataset.signatory);
  const revised = form.dataset.revised === "1" ? `<h1>සංශෝධිත ඇස්තමේන්තුව</h1>` : "";
  return `${revised}<h1>කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය<br>වයඹ පළාත</h1>
    <table class="estimate-grid">${body}
      <tr class="total"><td></td><td class="center">එකතුව</td><td></td><td>රු. ${esc(total)}</td></tr>
      <tr><td colspan="4" class="note">${esc(note)}</td></tr>
    </table>
    <table class="signs">
      <tr><td></td><td>නිර්දේශ කරමි</td><td>අනුමත කරමි</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr class="sign-names">
        <td>..........................................<br>සම්බන්ධීකරණ නිලධාරී</td>
        <td>..........................................<br>සහකාර ප්‍රධාන ලේකම්<br>පුහුණු</td>
        <td>..........................................<br>නියෝජ්‍ය ප්‍රධාන ලේකම්<br>(පුහුණු)<br>වයඹ පළාත්<br>ප්‍රධාන ලේකම් වෙනුවට</td>
      </tr>
    </table>`;
}

function estimateSnapshot(form) {
  refreshEstimate(form);
  return {
    lines: [...form.querySelectorAll(".est-formula[data-key]")].map((input) => ({
      key: input.dataset.key || "",
      formula: input.dataset.formula || "",
      auto: input.dataset.auto || "",
    })),
    dates: [...form.querySelectorAll("#estimate-dates input")].map((input) => input.value),
    lecturers: [...form.querySelectorAll(".est-lecturer")].map((row) => ({
      name: row.querySelector(":scope > span")?.dataset.name || row.querySelector(".est-topic")?.textContent.trim() || "",
      formula: row.querySelector(".est-formula")?.dataset.formula || "",
    })),
    residential: form.querySelector("select")?.value || "",
    total: form.querySelector("[data-estimate-total]")?.textContent || "",
  };
}

function applyEstimateSnapshot(form, saved) {
  if (!form || !saved) return;
  (saved.lines || []).forEach((line) => {
    const input = form.querySelector(`[data-key="${line.key}"]`);
    if (!input) return;
    input.dataset.formula = line.formula || "";
    input.value = line.formula || "";
    if (line.auto === "0" || line.auto === "1") input.dataset.auto = line.auto;
  });
  const dates = document.getElementById("estimate-dates");
  if (dates && Array.isArray(saved.dates)) {
    const values = saved.dates.length ? saved.dates : [""];
    dates.innerHTML = values.map((value, index) => estimateDateRow(value, index)).join("");
  }
  const list = document.getElementById("estimate-lecturers");
  const add = list?.querySelector(".est-add");
  if (list && add && Array.isArray(saved.lecturers)) {
    list.querySelectorAll(".est-lecturer").forEach((row) => row.remove());
    saved.lecturers.forEach((person, index) => {
      add.insertAdjacentHTML("beforebegin", estimateLecturerLine(index + 1, person.name || "", person.formula || ""));
    });
  }
  const residential = form.querySelector("select");
  if (residential && saved.residential) residential.value = saved.residential;
  applySignatoryToNote(form);
  refreshEstimate(form);
}

async function saveEstimate(form) {
  if (!form) return;
  refreshEstimate(form);
  const atp = form.dataset.atp || "";
  if (!atp) throw new Error(L("පුහුණු වැඩසටහනක් තෝරන්න.", "பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme."));
  await api("save-estimate", { method: "POST", body: { id: atp, sheet: estimateSnapshot(form) } });
}

async function printEstimate() {
  const form = document.querySelector(".estimate-form");
  if (!form) return;
  const atp = form.dataset.atp || "";
  if (atp) await saveEstimate(form);
  else refreshEstimate(form);
  let sheet = document.getElementById("estimate-official");
  if (!sheet) {
    sheet = document.createElement("article");
    sheet.id = "estimate-official";
    sheet.className = "estimate-official";
    document.body.appendChild(sheet);
  }
  sheet.innerHTML = `<div class="estimate-fit">${estimateOfficialHtml(form)}</div>`;
  const fit = sheet.querySelector(".estimate-fit");
  fit.style.zoom = "1";
  document.body.classList.add("printing-estimate");
  const people = form.querySelectorAll(".est-lecturer").length;
  const limit = ((297 - 25.4 * 2) / 25.4) * 96;
  const height = fit.scrollHeight;
  if (people <= 8 && height > limit) fit.style.zoom = String(Math.max(0.72, (limit / height) * 0.98));
  const done = () => {
    document.body.classList.remove("printing-estimate");
    fit.style.zoom = "";
  };
  window.addEventListener("afterprint", done, { once: true });
  window.print();
}

function estimateDateValue(value) {
  const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function estimateDateRow(value, index) {
  const label = index === 0
    ? `3 ${L("පුහුණුව පැවැත්වෙන දිනය/දිනයන්", "பயிற்சித் திகதிகள்", "Programme dates")}`
    : L(`${index + 1} වන දිනය`, `${index + 1} ஆம் நாள்`, `Day ${index + 1}`);
  const remove = index === 0 ? "" : `<button type="button" class="text-btn small" data-act="estimate-drop-date">${esc(L("මකන්න", "நீக்கு", "Delete"))}</button>`;
  return `<label class="classic-field est-line est-date"><span><span class="est-topic">${esc(label)}</span></span><span class="est-formula-row"><input type="date" value="${esc(estimateDateValue(value))}">${remove}</span></label>`;
}

function paintEstimateDates(dates) {
  const slot = document.getElementById("estimate-dates");
  if (!slot) return;
  const rows = (dates.length ? dates : [""]).slice(0, 100);
  slot.innerHTML = rows.map((value, index) => estimateDateRow(value, index)).join("");
}

function appendEstimateDates(count) {
  const have = [...document.querySelectorAll("#estimate-dates input")].map((field) => field.value || "");
  const room = 100 - have.length;
  if (room < 1) {
    alert(L("දින 100කට වඩා එකතු කරන්න බැහැ.", "100 நாட்களுக்கு மேல் சேர்க்க முடியாது.", "You cannot add more than 100 days."));
    return;
  }
  const adding = Math.min(count, room);
  const last = [...have].reverse().find(Boolean) || "";
  for (let step = 1; step <= adding; step += 1) have.push(last ? addDays(last, step) : "");
  paintEstimateDates(have);
}

function estimateSheetHtml(data) {
  const days = Number(data.days) || 0;
  const people = Number(data.people) || 0;
  const tea = estimateFoodPrice(data.lines, "tea");
  const lunch = estimateFoodPrice(data.lines, "lunch");
  const lecturers = (data.lecturers || []).map((name) => String(name || "").trim()).filter(Boolean);
  const dateValues = (data.dates || []).map(estimateDateValue).filter(Boolean);
  const field = (label, value, mode = "text", extra = "", key = "") => `<label class="classic-field est-line"><span><span class="est-topic">${label}</span><small class="est-outside" hidden></small></span><input class="est-formula" data-est="${mode}" data-key="${esc(key)}" data-formula="${esc(value || "")}" ${extra} value="${esc(value || "")}"></label>`;
  const area = (label, value, key = "") => `<label class="classic-field est-line"><span>${label}</span><textarea class="est-formula" data-est="text" data-key="${esc(key)}" data-formula="${esc(value || "")}">${esc(value || "")}</textarea></label>`;
  const yesNo = `<label class="classic-field"><span>5 ${esc(L("නේවාසිකද යන වග", "உறைவிடமா", "Residential"))}</span><select><option>${esc(L("නැත", "இல்லை", "No"))}</option><option>${esc(L("ඔව්", "ஆம்", "Yes"))}</option></select></label>`;
  const note = estimateApproval(data.signatory);
  const teaFormula = `=${estimateFactor(people)}*${estimateFactor(tea)}*${estimateFactor(days)}`;
  const lunchFormula = `=${estimateFactor(people)}*${estimateFactor(lunch)}*${estimateFactor(days)}`;
  const gearFormula = `=125*${estimateFactor(days)}*${estimateFactor(people)}`;
  const lecturerLines = lecturers.map((name, index) => estimateLecturerLine(index + 1, name, days ? `=800*${estimateFactor(days)}` : "")).join("");
  const sum = (label, key) => field(label, "", "sum", "", key);
  const left = [
    field(L("මගේ අංකය", "என் இல.", "My number"), data.file, "text", "", "file"),
    area(`1 ${L("පුහුණු වැඩ සටහනේ නම", "பயிற்சியின் பெயர்", "Programme name")}`, data.programme, "name"),
    field(`2 ${L("පුහුණුව ලබන්නේ කවුරුන්ද", "பயிற்சி பெறுவோர்", "Who is trained")}`, data.target, "text", "", "target"),
    `<div id="estimate-dates">${(dateValues.length ? dateValues : [""]).map((value, index) => estimateDateRow(value, index)).join("")}</div>`,
    `<label class="classic-field est-date-add"><span>${esc(L("තව දින ගණන", "மேலும் நாட்கள்", "More days to add"))}</span><span class="est-formula-row"><input id="estimate-date-count" type="number" min="1" max="100" value="1"><button type="button" class="text-btn" data-act="estimate-add-dates">${esc(L("දින එකතු කරන්න", "நாட்களைச் சேர்க்க", "Add dates"))}</button></span></label>`,
    field(`4 ${L("පුහුණුව පැවැත්වෙන ස්ථානය", "பயிற்சி இடம்", "Place")}`, data.place, "text", "", "place"),
    yesNo,
    `<p class="est-section"><span class="est-topic">6 ${esc(L("වියදම් ඇස්තමේන්තුව", "செலவு மதிப்பீடு", "Cost estimate"))}</span></p>`,
    field(`6.1 ${L("ආහාර පාන", "உணவு பானம்", "Food and drink")}`, "", "sum", 'data-sum-of="food" data-auto="1"', "food"),
    field(L("සැහැල්ලු ආහාර හා තේ", "சிற்றுண்டியும் தேநீரும்", "Refreshments and tea"), teaFormula, "detail", 'data-group="food"', "tea"),
    field(L("දිවා ආහාරය", "மதிய உணவு", "Lunch"), lunchFormula, "detail", 'data-group="food"', "lunch"),
    sum(`6.2 ${L("නවාතැන් ගාස්තු", "தங்குமிடக் கட்டணம்", "Accommodation")}`, "6.2"),
    sum(`6.3 ${L("ශාලා ගාස්තු", "மண்டபக் கட்டணம்", "Hall charges")}`, "6.3"),
    sum(`6.4 ${L("ලිපි ද්‍රව්‍ය", "எழுதுபொருள்", "Stationery")}`, "6.4"),
    field(`6.5 ${L("දේශන ගාස්තු", "விரிவுரைக் கட்டணம்", "Lecture fees")}`, "", "sum", 'data-sum-of="lecture" data-auto="1"', "lecture"),
    `<div id="estimate-lecturers">${lecturerLines}<p class="est-add"><button type="button" class="text-btn" data-act="estimate-add-lecturer">${esc(L("සම්පත්දායකයෙකු එක් කරන්න", "வள ஆளைச் சேர்க்க", "Add a resource person"))}</button></p></div>`,
    field(`6.6 ${L("උපකරණ හා නඩත්තු ගාස්තු", "உபகரணப் பராமரிப்பு", "Equipment and maintenance")}`, gearFormula, "sum", "", "6.6"),
    field(`6.7 ${L("සමායෝජක දීමනා", "ஒருங்கிணைப்பாளர் கொடுப்பனவு", "Coordinator allowance")}`, "=650", "sum", "", "6.7"),
    field(`6.8 ${L("වැඩමුළු අධීක්ෂණ දීමනාව", "பட்டறை மேற்பார்வைக் கொடுப்பனவு", "Workshop supervision allowance")}`, "=600", "sum", "", "6.8"),
    field(`6.9 ${L("සම්බන්ධීකරන දීමනා", "இணைப்புக் கொடுப்பனவு", "Coordination allowance")}`, "=500", "sum", "", "6.9"),
    field(`6.10 ${L("ගිණුම් අංශය සඳහා දීමනා", "கணக்குப் பிரிவுக் கொடுப்பனவு", "Accounts section allowance")}`, "=400", "sum", "", "6.10"),
  ].join("");
  const right = [
    field(`6.11 ${L("කම්කරු සහාය දීමනා", "தொழிலாளர் உதவிக் கொடுப்பனவு", "Labour assistance allowance")}`, "=350", "sum", "", "6.11"),
    sum(`6.12 ${L("ඡායා පිටපත්", "புகைப்படப் பிரதிகள்", "Photocopies")}`, "6.12"),
    sum(`6.13 ${L("කාර්යාල පොදු වියදම්", "அலுவலகப் பொதுச் செலவு", "Office overheads")}`, "6.13"),
    sum(`6.14 ${L("බැහැර සම්පත්දායක ගමන් වියදම්", "வெளி வள ஆள் பயணச் செலவு", "Visiting resource-person travel")}`, "6.14"),
    sum(`6.15 ${L("අවිනිශ්චිත වියදම්", "எதிர்பாராச் செலவு", "Contingencies")}`, "6.15"),
    sum(`6.16 ${L("වැට්", "வாட்", "VAT")}`, "6.16"),
    field(`6.17 ${L("මල්ටිමීඩියා/ප්‍රොජෙක්ටර්", "பல்லூடகம்", "Multimedia / projector")}`, "=1500*3", "sum", "", "6.17"),
    sum(`6.18 ${L("සහාය දේශන ගාස්තු", "துணை விரிவுரைக் கட்டணம்", "Assistant lecture fees")}`, "6.18"),
    field(`6.19 ${L("අන්තර්ජාල පහසුකම්", "இணைய வசதி", "Internet facilities")}`, "=170*20*3", "sum", "", "6.19"),
    sum(`6.20 ${L("වෙනත්", "மற்றவை", "Other")}`, "6.20"),
    `<label class="classic-field est-line"><span>${esc(L("අනුමැතිය", "அனுமதி", "Approval"))}</span><textarea class="est-formula est-note" data-est="text" data-key="note" data-formula="${esc(note)}">${esc(note)}</textarea></label>`,
    `<label class="classic-field est-line"><span>${esc(L("මුළු එකතුව", "மொத்தத் தொகை", "Total"))}</span><output class="est-total" data-estimate-total>0.00</output></label>`,
  ].join("");
  return `<form class="classic-form old-plan estimate-form" data-days="${esc(days)}" data-coordinator="${esc(data.coordinator || "")}" data-coordinator-sex="${esc(data.coordinatorSex || "")}" data-signatory="${esc(data.signatory || "")}" action="#" method="post" onsubmit="return false">
    <div class="annual-sheet">
      <div class="annual-col">${left}${right}</div>
    </div>
    <p class="estimate-total"><strong>${esc(L("6 වියදම් ඇස්තමේන්තුවේ මුළු එකතුව", "செலவு மதிப்பீட்டின் மொத்தம்", "Section 6 total"))} <span data-estimate-total>0.00</span></strong></p>
    <p class="estimate-actions"><button type="button" data-act="estimate-save">${esc(L("සුරකින්න", "சேமி", "Save"))}</button><button type="button" data-act="estimate-print">${esc(L("මුද්‍රණය කරන්න", "அச்சிடுக", "Print"))}</button></p>
    <p id="estimate-save-msg"></p>
  </form>`;
}

function signSheetHtml(data) {
  const plan = data.programme || {};
  const days = (data.days || []).map((day) => showDate(day)).filter(Boolean);
  const head = days.map((day) => `<th>${esc(day)}</th>`).join("");
  const body = (data.rows || []).map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td class="wrap-cell">${esc(row.stf_Name || row.tratt_name)}<br>${esc(row.stf_desig || row.tratt_desig)}</td>
    <td>${esc(row.tapp_officerNid)}</td>
    <td class="wrap-cell">${esc(row.tapp_office)}</td>
    <td>${esc(row.stf_mobile || row.tratt_mobile)}</td>
    ${days.map(() => "<td class=\"sign-box\"></td>").join("")}
  </tr>`).join("");
  return `<article class="letter sign-sheet">
    <h2>${esc(L("සහභාගිවන්නන්ගේ අත්සන් ලේඛනය", "பங்கேற்பாளர் கையொப்பப் பட்டியல்", "Participants' sign sheet"))}</h2>
    <p>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))} - ${esc(plan.atp_trname || "")}</p>
    <p>${esc(L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date"))} - ${esc(showDate(plan.atp_day1))} · ${esc(L("ස්ථානය", "இடம்", "Place"))} - ${esc(plan.atp_location || "")}</p>
    <table><thead><tr>
      <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
      <th>${esc(L("නිලධාරියාගේ නම", "அதிகாரி பெயர்", "Officer name"))}</th>
      <th>${esc(L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"))}</th>
      <th>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
      <th>${esc(L("දුරකථන අංකය", "தொலைபேசி எண்", "Phone number"))}</th>
      ${head}
    </tr></thead><tbody>${body || `<tr><td colspan="${5 + days.length}">${esc(L("තෝරාගත් නිලධාරීන් නොමැත.", "தேர்ந்த அதிகாரிகள் இல்லை.", "No selected officers."))}</td></tr>`}</tbody></table>
  </article>`;
}

async function paintSignSheet(id) {
  if (state.module !== "signsheet") return;
  const slot = $("#paper");
  if (!slot || !id) return;
  try {
    const data = await api("signsheet", { query: { id } });
    state.signsheet = data;
    slot.innerHTML = signSheetHtml(data);
  } catch (error) {
    slot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
  }
}

async function renderSignSheet(work) {
  const programmes = await api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } });
  const atp = state.query?.get("atp") || state.query?.get("id") || "";
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("අත්සන් පත්‍රය", "கையொப்பப் படிவம்", "Sign sheet"))}</h2>
    <form class="classic-form" id="sign-form" action="#" method="post">
      <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</span><select name="id">${programmeSelect(activeProgrammes(programmes.items || [], atp), atp)}</select></label>
      <button type="button" data-act="build-sign">${esc(L("අත්සන් ලේඛනය", "கையொப்பப் பட்டியல்", "Sign sheet"))}</button>
      <button type="button" data-act="sign-pdf">${esc(L("PDF බාගත කරන්න", "PDF பதிவிறக்கம்", "Download PDF"))}</button>
    </form>
    <div id="paper"></div>`;
  if (atp) await paintSignSheet(atp);
}

function panelDateLine(days) {
  const real = (days || []).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(String(day)));
  if (!real.length) return "";
  const [year, month, day] = real[0].split("-");
  const bits = [`${year}.${month}.${day}`];
  real.slice(1).forEach((item) => {
    const [itemYear, itemMonth, itemDay] = item.split("-");
    bits.push(itemYear === year && itemMonth === month ? String(Number(itemDay)) : `${itemYear}.${itemMonth}.${itemDay}`);
  });
  return bits.join(", ");
}
function panelDayHead(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day))) return "අත්සන";
  const [year, month, date] = String(day).split("-");
  return `අත්සන\n${year}.${month}.${date}`;
}
function panelDays(data) {
  const real = (data.days || []).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(String(day)));
  return real.length ? real : [""];
}
function panelSheetHtml(data) {
  const days = panelDays(data);
  const heads = days.map((day) => `<th>${panelDayHead(day).split("\n").map((line) => esc(line)).join("<br>")}</th>`).join("");
  const staff = (data.staff || []).map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td class="wrap-cell">${esc(row.name || "")}</td>
    <td class="wrap-cell">${esc(row.post || "")}</td>
    ${days.map(() => `<td class="sign-box"></td>`).join("")}
  </tr>`).join("");
  const panel = (data.panel || []).map((row, index) => {
    const who = [row.name, row.post].filter(Boolean).join(", ");
    return `<tr>
      <td>${String(index + 1).padStart(2, "0")}</td>
      <td class="wrap-cell">${esc(who)}</td>
      <td class="wrap-cell">${esc(row.role || "")}</td>
      <td class="sign-box"></td>
    </tr>`;
  }).join("");
  return `<article class="panel-sign">
    <h2>වයඹ පළාත් සභාව</h2>
    <h3>කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය</h3>
    <h3>${esc(data.name || "")} පිළිබඳ පුහුණු වැඩසටහන</h3>
    <p class="panel-date">${esc(panelDateLine(days))}</p>
    <table>
      <thead><tr>
        <th>අනු අංකය</th><th>නම</th><th>තනතුර</th>${heads}
      </tr></thead>
      <tbody>${staff || `<tr><td colspan="${3 + days.length}">තෝරාගත් නිලධාරීන් නොමැත.</td></tr>`}</tbody>
    </table>
    <p class="panel-label">අත්සන් මණ්ඩලය</p>
    <table>
      <thead><tr>
        <th>අනු අංකය</th><th>නිලධාරියාගේ නම හා තනතුර</th><th>කාර්යභාරය</th><th>අත්සන<br>පොදු දිනටම සඳහා</th>
      </tr></thead>
      <tbody>${panel}</tbody>
    </table>
  </article>`;
}

async function renderPanelSign(work) {
  const [programmes, picked] = await Promise.all([
    api("list", { query: { table: "cp_atp", limit: 1000, page: 1 } }),
    api("selected-programmes"),
  ]);
  const today = localToday();
  const selected = new Set((picked.ids || []).map(String));
  const open = namedPlans(programmes.items || []).filter((item) => {
    if (!selected.has(String(item.atp_id))) return false;
    const end = programmeEnd(item);
    return end && end >= today;
  }).sort((a, b) => showDate(a.atp_day1).localeCompare(showDate(b.atp_day1)) || Number(a.atp_id) - Number(b.atp_id));
  const asked = state.query?.get("id") || "";
  const id = open.some((item) => String(item.atp_id) === String(asked)) ? asked : "";
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("අත්සන් ලේඛණය කාර්යමණ්ඩල හා සම්පත්දායක", "கையொப்பப் பட்டியல்", "Staff and resource-person sign sheet"))}</h2>
    <form class="classic-form" id="panel-form" action="#" method="post">
      <label class="classic-field"><span>${esc(L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"))}</span><select id="panel-programme" name="id">${programmeSelect(open, id)}</select></label>
      <button type="button" data-act="panel-pdf">${esc(L("PDF බාගත කරන්න", "PDF பதிவிறக்கம்", "Download PDF"))}</button>
    </form>
    <div id="paper"></div>`;
  if (!id) return;
  try {
    const data = await api("panelsign", { query: { id } });
    state.panelsign = data;
    $("#paper").innerHTML = panelSheetHtml(data);
  } catch (error) {
    $("#paper").innerHTML = `<div class="error">${esc(error.message)}</div>`;
  }
}

async function renderProgramme() {
  const data = await api("programme", { query: { id: state.module } });
  const plan = data.programme;
  const days = (plan.days || []).map((day) => `<li>${esc(day)}</li>`).join("") || "<li>Dates have not been set.</li>";
  $("#stage").innerHTML = `
    <section class="wrap section">
      <h1>${esc(plan.atp_trname)}</h1>
      <p class="kicker">${esc(plan.atp_trtype || "Training programme")}</p>
      <div class="grid-2">
        <article class="card">
          <p><strong>Place</strong> ${esc(plan.atp_location)}</p>
          <p><strong>Time</strong> ${esc(plan.atp_stime)} – ${esc(plan.atp_etime)}</p>
          <p><strong>Target group</strong> ${esc(plan.atp_targetgroup)}</p>
          <p><strong>Participants</strong> ${esc(plan.atp_noofparticipants)}</p>
          <p><strong>Apply by</strong> ${esc(showDate(plan.atp_lastdateapply))}</p>
          <p>${esc(plan.atp_purpose)}</p>
          <p>${esc(plan.atp_content)}</p>
        </article>
        <article class="card"><h2>Dates</h2><ul class="list">${days}</ul><p class="muted">Offices nominate officers after signing in.</p></article>
      </div>
    </section>`;
}

async function renderCalendar() {
  const month = state.query?.get("month") || new Date().toISOString().slice(0, 7);
  const data = await api("calendar", { query: { month } });
  const start = new Date(month + "-01T00:00:00");
  const days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const lead = start.getDay();
  const byDate = {};
  data.events.forEach((event) => {
    byDate[event.date] = byDate[event.date] || [];
    byDate[event.date].push(event);
  });
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push("<div></div>");
  for (let day = 1; day <= days; day++) {
    const key = month + "-" + String(day).padStart(2, "0");
    const items = (byDate[key] || []).map((event) => `<a href="#programme/${esc(event.id)}">${esc(event.name)}</a>`).join("");
    cells.push(`<div class="day"><strong>${day}</strong>${items}</div>`);
  }
  const previous = new Date(start.getFullYear(), start.getMonth() - 1, 1);
  const next = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const stamp = (date) => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
  $("#stage").innerHTML = `
    <section class="wrap section">
      <p class="kicker">Training calendar</p>
      <h1>${start.toLocaleString("en", { month: "long", year: "numeric" })}</h1>
      <p><a class="btn secondary" href="#calendar?month=${stamp(previous)}">Previous</a> <a class="btn secondary" href="#calendar?month=${stamp(next)}">Next</a></p>
      <div class="calendar"><h3>Sun</h3><h3>Mon</h3><h3>Tue</h3><h3>Wed</h3><h3>Thu</h3><h3>Fri</h3><h3>Sat</h3>${cells.join("")}</div>
    </section>`;
}

function staffFields() {
  return [
    { name: "stf_Photo", label: () => L("ඡායාරූපය", "படம்", "Photograph"), kind: "file", folder: "staff", accept: ".jpg,.jpeg,.png,.gif,.webp" },
    { name: "stf_Nid", label: () => L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"), required: true },
    { name: "stf_Name", label: () => L("නම", "பெயர்", "Name"), required: true },
    { name: "stf_dob", label: () => L("උපන් දිනය", "பிறந்த திகதி", "Date of birth"), kind: "date" },
    { name: "stf_sex", label: () => L("ස්ත්‍රී පුරුෂ භාවය", "பாலினம்", "Gender"), kind: "gender" },
    { name: "stf_desig", label: () => L("තනතුර", "பதவி", "Designation"), kind: "posts" },
    { name: "stf_office", label: () => L("කාර්යාලය", "அலுவலகம்", "Office"), kind: "myoffice" },
    { name: "stf_suboff", label: () => L("උප කාර්යාලය", "துணை அலுவலகம்", "Sub office"), hint: () => L("ලැයිස්තුවේ නැත්නම් මෙතැන ලියන්න", "பட்டியலில் இல்லை என்றால் இங்கே எழுதவும்", "Type it here if it is not in the list") },
    { name: "stf_mobile", label: () => L("ජංගම දුරකථන අංකය", "கைபேசி", "Mobile"), required: true },
    { name: "stf_ofstele", label: () => L("කාර්යාල දුරකථන අංකය", "அலுவலகத் தொலைபேசி", "Office telephone") },
    { name: "stf_email", label: () => L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email") },
    { name: "stf_service", label: () => L("සේවාව", "சேவை", "Service"), kind: "services" },
    { name: "stf_class", label: () => L("පන්තිය", "வகுப்பு", "Class"), kind: "class" },
    { name: "stf_firstappdate", label: () => L("පළමු පත්වීමේ දිනය", "முதல் நியமன திகதி", "First appointment"), kind: "date" },
    { name: "stf_cdesigdate", label: () => L("වර්තමාන තනතුරේ දිනය", "தற்போதைய பதவி திகதி", "Present designation date"), kind: "date" },
  ];
}

function staffPhoto(row) {
  return row.stf_Photo_url ? `<img class="staff-photo" alt="" src="${esc(row.stf_Photo_url)}">` : "";
}

async function renderBlacklist(work) {
  const year = state.query?.get("year") || localToday().slice(0, 4);
  const data = await api("blacklist", { query: { year } });
  const years = (data.years || [Number(year)]).map((item) => String(item));
  if (!years.includes(String(data.year || year))) years.unshift(String(data.year || year));
  const options = years.map((item) => `<option value="${esc(item)}"${String(item) === String(data.year) ? " selected" : ""}>${esc(item)}</option>`).join("");
  const body = (data.items || []).map((row) => `<tr>
    <td class="wrap-cell">${esc(row.bl_name)}</td>
    <td>${esc(showDate(row.bl_from))}</td>
    <td>${esc(showDate(row.bl_from))}</td>
    <td>${esc(showDate(row.bl_until))}</td>
    <td class="wrap-cell">${esc(row.bl_reason)}</td>
  </tr>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("අසාදු ලේඛනගත කරන්න", "தடைப் பட்டியலில் சேர்க்க", "Add to the blacklist"))}</h2>
    <form class="classic-form" id="blacklist-form">
      <label class="classic-field"><span>${esc(L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"))}</span><input name="nid" required></label>
      <label class="classic-field"><span>${esc(L("අසාදු ලේඛනගත කිරීමට හේතුව", "தடைப் பட்டியலுக்கான காரணம்", "Reason for blacklisting"))}</span><textarea name="reason" required></textarea></label>
      <button type="submit">${esc(L("අසාදු ලේඛනයට ඇතුළත් කරන්න", "தடைப் பட்டியலில் சேர்க்க", "Add to the blacklist"))}</button>
      <div id="form-msg"></div>
    </form>
    <h2 class="classic-title">${esc(L("අසාදු ලේඛනය", "தடைப் பட்டியல்", "Blacklist"))}</h2>
    <form class="sheet-tools" id="blacklist-year">
      <label>${esc(L("වර්ෂය", "ஆண்டு", "Year"))} <select name="year">${options}</select></label>
      <button type="submit">${esc(L("පෙන්වන්න", "காட்டு", "Show"))}</button>
    </form>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("නම", "பெயர்", "Name"))}</th>
        <th>${esc(L("අසාදු ලේඛනගත කළ දිනය", "தடை சேர்த்த திகதி", "Date blacklisted"))}</th>
        <th>${esc(L("සිට", "முதல்", "From"))}</th>
        <th>${esc(L("දක්වා", "வரை", "Until"))}</th>
        <th>${esc(L("හේතුව", "காரணம்", "Reason"))}</th>
      </tr></thead>
      <tbody>${body || `<tr><td colspan="5">${esc(L("මේ වර්ෂයේ අසාදු ලේඛනයේ කිසිවෙක් නැත.", "இந்த ஆண்டு தடைப் பட்டியலில் யாரும் இல்லை.", "Nobody is on the blacklist for this year."))}</td></tr>`}</tbody>
    </table></div>`;
}

async function renderStaff(work) {
  if ((state.query?.get("tab") || "") === "blacklist") return renderBlacklist(work);
  if (!state.options) state.options = await api("options");
  const list = await api("list", { query: { table: "cp_staff", limit: 50000, page: 1 } });
  const dropId = state.query?.get("drop") || "";
  const editId = state.query?.get("edit") || "";
  const tab = state.query?.get("tab") || "";
  const dropping = list.items.find((row) => String(row.stf_ID) === String(dropId));
  if (dropping) {
    work.innerHTML = `
      <h2 class="classic-title">${esc(L("නිලධාරියා ඉවත් කරන්න", "அதிகாரியை நீக்கு", "Remove this officer"))}</h2>
      <div class="confirm-person">
        ${staffPhoto(dropping)}
        <div>${esc(dropping.stf_Name)}<br>${esc(dropping.stf_desig)}<br>${esc(dropping.stf_office)}<br>${esc(dropping.stf_mobile)}</div>
      </div>
      <div class="confirm-actions">
        <button type="button" data-act="staff-drop" data-id="${esc(dropping.stf_ID)}">${esc(L("ඉවත් කරන්න", "நீக்கு", "Remove"))}</button>
        <a href="#console/cp_staff?tab=all">${esc(L("නැවත යන්න", "திரும்பு", "Go back"))}</a>
      </div>`;
    return;
  }
  const editing = list.items.find((row) => String(row.stf_ID) === String(editId));
  const showingList = !editId && (tab === "all" || tab === "blacklist");
  if (!showingList) {
    const fields = staffFields().map((field) => `<label class="classic-field"><span>${esc(field.label())}</span>${classicControl(field, editing)}</label>`).join("");
    work.innerHTML = `
      <div class="desig-tabs">
        <a class="on" href="#console/cp_staff">${esc(editing ? L("නිලධාරියා වෙනස් කරන්න", "அதிகாரியைத் திருத்து", "Edit the officer") : L("නිලධාරීන් ඇතුළත් කරන්න", "அதிகாரியைச் சேர்க்க", "Add an officer"))}</a>
        <a href="#console/cp_staff?tab=all">${esc(L("සියලුම නිලධාරීන්", "அனைத்து அதிகாரிகள்", "All officers"))}</a>
      </div>
      <form class="classic-form" id="classic-form" data-table="cp_staff">
        <input type="hidden" name="stf_ID" value="${esc(editing ? editing.stf_ID : "")}">
        ${editing && editing.stf_Photo_url ? `<img class="staff-photo large" alt="" src="${esc(editing.stf_Photo_url)}">` : ""}
        ${fields}
        <button type="submit">${esc(editing ? L("යාවත්කාලීන කරන්න", "புதுப்பிக்க", "Update") : L("ඇතුළත් කරන්න", "சேர்க்க", "Add"))}</button>
        <div id="form-msg"></div>
      </form>`;
    return;
  }
  const office = state.query.get("ofc") || "";
  const post = state.query.get("des") || "";
  const service = state.query.get("ser") || "";
  const needle = (state.query.get("q") || "").trim().toLowerCase();
  const rows = list.items.filter((row) => {
    if (tab === "blacklist" && row.stf_blacklisted !== "Yes") return false;
    if (office && row.stf_office !== office) return false;
    if (post && row.stf_desig !== post) return false;
    if (service && row.stf_service !== service) return false;
    if (!needle) return true;
    const hay = [row.stf_Name, row.stf_Nid, row.stf_mobile, row.stf_ofstele].map((value) => String(value || "").toLowerCase());
    if (hay.some((value) => value.includes(needle))) return true;
    const digits = needle.replace(/\D/g, "");
    if (digits.length < 3) return false;
    return [row.stf_Nid, row.stf_mobile, row.stf_ofstele].some((value) => String(value || "").replace(/\D/g, "").includes(digits));
  });
  const pick = (items, key, selected) => `<option value="">${esc(L("සියල්ල", "அனைத்தும்", "All"))}</option>` + items.filter((item) => String(item[key] || "").trim()).map((item) => `<option value="${esc(item[key])}" ${item[key] === selected ? "selected" : ""}>${esc(item[key])}</option>`).join("");
  const body = rows.map((row, index) => `<tr>
    <td>${index + 1}</td>
    <td>${staffPhoto(row)}</td>
    <td>${esc(row.stf_Nid)}</td>
    <td><a class="${row.on_blacklist === "Yes" ? "staff-blocked" : ""}" href="#console/cp_staff?edit=${esc(row.stf_ID)}">${esc(row.stf_Name)}</a></td>
    <td>${esc(row.stf_desig)}</td>
    <td>${esc(row.stf_office)}</td>
    <td>${esc(row.stf_mobile)}</td>
    <td>${esc(row.stf_email)}</td>
    <td><a href="#console/cp_staff?edit=${esc(row.stf_ID)}">edit</a> <a href="#console/cp_staff?drop=${esc(row.stf_ID)}">delete</a></td>
  </tr>`).join("");
  work.innerHTML = `
    <div class="desig-tabs">
      <a href="#console/cp_staff">${esc(L("නිලධාරීන් ඇතුළත් කරන්න", "அதிகாரியைச் சேர்க்க", "Add an officer"))}</a>
      <a class="${tab === "all" ? "on" : ""}" href="#console/cp_staff?tab=all">${esc(L("සියලුම නිලධාරීන්", "அனைத்து அதிகாரிகள்", "All officers"))}</a>
    </div>
    <h2 class="classic-title">${esc(tab === "blacklist" ? L("අසාදු ලේඛනය", "தடைப் பட்டியல்", "Blacklist") : L("සියලුම නිලධාරීන්", "அனைத்து அதிகாரிகள்", "All officers"))}</h2>
    <form class="sheet-tools" id="staff-filters">
      <select name="ofc">${pick(state.options.offices || [], "of_name", office)}</select>
      <select name="des">${pick(state.options.designations || [], "des_name", post)}</select>
      <select name="ser">${pick(state.options.services || [], "ser_name", service)}</select>
      <input name="q" value="${esc(state.query.get("q") || "")}" placeholder="${esc(L("නම, ජාතික හැඳුනුම්පත් අංකය හෝ දුරකථන අංකය", "பெயர், அடையாள எண் அல்லது தொலைபேசி", "Name, national ID, or phone number"))}">
      <button type="submit">${esc(L("සොයන්න", "தேடு", "Search"))}</button>
    </form>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ඡායාරූපය", "படம்", "Photo"))}</th>
        <th>${esc(L("හැඳුනුම්පත", "அடையாள எண்", "ID"))}</th>
        <th>${esc(L("නම", "பெயர்", "Name"))}</th>
        <th>${esc(L("තනතුර", "பதவி", "Designation"))}</th>
        <th>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
        <th>${esc(L("දුරකථනය", "தொலைபேசி", "Mobile"))}</th>
        <th>${esc(L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email"))}</th>
        <th></th>
      </tr></thead>
      <tbody>${body || `<tr><td colspan="9">${esc(L("තොරතුරු කිසිවක් නොමැත.", "பதிவுகள் இல்லை.", "Nothing listed yet."))}</td></tr>`}</tbody>
    </table></div>`;
}

async function renderOfficers(work) {
  const tab = state.query?.get("tab") || "add";
  const [officers, staff] = await Promise.all([
    api("list", { query: { table: "cp_trainingofficers", limit: 1000, page: 1 } }),
    api("list", { query: { table: "cp_staff", limit: 5000, page: 1 } }),
  ]);
  const have = new Set((officers.items || []).map((row) => String(row.tro_nid)));
  const tabs = `
    <div class="desig-tabs">
      <a class="${tab === "add" ? "on" : ""}" href="#console/cp_trainingofficers">${esc(L("පුහුණු නිලධාරීන් ලෙස ඇතුළත් කරන්න", "பயிற்சி அதிகாரியாகச் சேர்க்க", "Add as a training officer"))}</a>
      <a class="${tab === "nid" ? "on" : ""}" href="#console/cp_trainingofficers?tab=nid">${esc(L("හැඳුනුම්පතෙන් ඇතුළත් කරන්න", "அடையாள எண்ணால் சேர்க்க", "Add by national ID"))}</a>
      <a class="${tab === "all" ? "on" : ""}" href="#console/cp_trainingofficers?tab=all">${esc(L("සියලු පුහුණු නිලධාරීන්", "அனைத்து பயிற்சி அதிகாரிகள்", "All training officers"))}</a>
    </div>`;
  if (tab === "nid") {
    work.innerHTML = `${tabs}
      <h2 class="classic-title">${esc(L("පුහුණු නිලධාරියෙක් ඇතුළත් කරන්න", "பயிற்சி அதிகாரியைச் சேர்க்க", "Add a training officer"))}</h2>
      <form class="classic-form" id="officer-nid">
        <label class="classic-field"><span>${esc(L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"))}</span><input name="nid" required></label>
        <button type="submit">${esc(L("ඇතුළත් කරන්න", "சேர்க்க", "Add"))}</button>
        <div id="form-msg"></div>
      </form>`;
    return;
  }
  if (tab === "all") {
    const body = (officers.items || []).map((row, index) => `<tr>
      <td>${index + 1}</td><td>${esc(row.tro_nid)}</td><td>${esc(row.tro_name)}</td><td>${esc(row.tro_desig)}</td>
      <td>${esc(row.tro_office)}</td><td>${esc(row.tro_mobile)}</td><td>${esc(row.tro_email)}</td>
      <td><button class="text-btn small" type="button" data-act="officer-remove" data-id="${esc(row.tro_id)}">delete</button></td>
    </tr>`).join("");
    work.innerHTML = `${tabs}
      <h2 class="classic-title">${esc(L("සියලු පුහුණු නිලධාරීන්", "அனைத்து பயிற்சி அதிகாரிகள்", "All training officers"))}</h2>
      <div class="table-wrap desig-list"><table>
        <thead><tr>
          <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
          <th>${esc(L("හැඳුනුම්පත", "அடையாள எண்", "ID"))}</th>
          <th>${esc(L("නම", "பெயர்", "Name"))}</th>
          <th>${esc(L("තනතුර", "பதவி", "Designation"))}</th>
          <th>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
          <th>${esc(L("දුරකථනය", "தொலைபேசி", "Mobile"))}</th>
          <th>${esc(L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email"))}</th>
          <th></th>
        </tr></thead>
        <tbody>${body || `<tr><td colspan="8">${esc(L("තොරතුරු කිසිවක් නොමැත.", "பதிவுகள் இல்லை.", "Nothing listed yet."))}</td></tr>`}</tbody>
      </table></div>`;
    return;
  }
  const body = (staff.items || []).map((row, index) => `<tr>
    <td>${index + 1}</td><td>${esc(row.stf_Nid)}</td><td>${esc(row.stf_Name)}</td><td>${esc(row.stf_desig)}</td>
    <td>${esc(row.stf_office)}</td><td>${esc(row.stf_mobile)}</td><td>${esc(row.stf_email)}</td>
    <td>${have.has(String(row.stf_Nid)) ? esc(L("ඇතුළත්යි", "சேர்க்கப்பட்டது", "Added")) : `<button class="text-btn small" type="button" data-act="officer-add" data-nid="${esc(row.stf_Nid)}">+</button>`}</td>
  </tr>`).join("");
  work.innerHTML = `${tabs}
    <h2 class="classic-title">${esc(L("පුහුණු නිලධාරීන් ලෙස ඇතුළත් කරන්න", "பயிற்சி அதிகாரியாகச் சேர்க்க", "Add as a training officer"))}</h2>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("හැඳුනුම්පත", "அடையாள எண்", "ID"))}</th>
        <th>${esc(L("නම", "பெயர்", "Name"))}</th>
        <th>${esc(L("තනතුර", "பதவி", "Designation"))}</th>
        <th>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
        <th>${esc(L("දුරකථනය", "தொலைபேசி", "Mobile"))}</th>
        <th>${esc(L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email"))}</th>
        <th>${esc(L("ඇතුළත් කරන්න", "சேர்க்க", "Add"))}</th>
      </tr></thead>
      <tbody>${body || `<tr><td colspan="8">${esc(L("තොරතුරු කිසිවක් නොමැත.", "பதிவுகள் இல்லை.", "Nothing listed yet."))}</td></tr>`}</tbody>
    </table></div>`;
}

async function renderBirthdays(slot) {
  const data = await api("birthdays", { query: { today: "1" } });
  const rows = (data.people || []).map((person, index) => `<tr>
    <td>${index + 1}</td>
    <td>${person.photo ? `<img class="staff-photo" alt="" src="${esc(person.photo)}">` : ""}</td>
    <td>${esc(person.stf_Name)}</td>
    <td>${esc(person.stf_desig)}</td>
    <td>${esc(person.stf_office)}</td>
    <td>${esc(person.stf_mobile)}</td>
    <td>${esc(person.stf_email)}</td>
  </tr>`).join("");
  const html = `
    <h2 class="classic-title">${esc(L("අද දින උපන්දිනය සමරන නිලධාරීන්", "இன்று பிறந்தநாள் கொண்ட அதிகாரிகள்", "Officers celebrating a birthday today"))} · ${esc(data.today || "")}</h2>
    <div class="table-wrap desig-list"><table>
      <thead><tr>
        <th>${esc(L("අනු අංකය", "இல.", "No."))}</th>
        <th>${esc(L("ඡායාරූපය", "படம்", "Photo"))}</th>
        <th>${esc(L("නම", "பெயர்", "Name"))}</th>
        <th>${esc(L("තනතුර", "பதவி", "Designation"))}</th>
        <th>${esc(L("කාර්යාලය", "அலுவலகம்", "Office"))}</th>
        <th>${esc(L("දුරකථනය", "தொலைபேசி", "Mobile"))}</th>
        <th>${esc(L("විද්‍යුත් ලිපිනය", "மின்னஞ்சல்", "Email"))}</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="7">${esc(L("අද උපන්දින නොමැත.", "இன்று பிறந்தநாள் இல்லை.", "No birthdays today."))}</td></tr>`}</tbody>
    </table></div>`;
  if (slot && slot.id === "work") {
    slot.innerHTML = html;
    return;
  }
  const host = slot || $("#stage");
  host.innerHTML = `<section class="wrap section work-page classic">${html}</section>`;
}

async function renderPhones() {
  const q = state.query?.get("q") || "";
  const data = await api("phones", { query: { q } });
  $("#stage").innerHTML = `
    <section class="wrap section">
      <p class="kicker">Contacts</p>
      <h1>Telephone directory</h1>
      <form class="filters" data-search="phones"><label>Search<input name="q" value="${esc(q)}"></label><button class="btn">Search</button></form>
      <div class="grid-2">
        <article class="card"><h2>Offices</h2><ul class="list">${data.offices.map((item) => `<li><strong>${esc(item.of_name)}</strong><br>${esc(item.of_tele)} ${esc(item.of_tele2)}<br><span class="muted">${esc(item.of_addr)}</span></li>`).join("") || "<li>No offices.</li>"}</ul></article>
        <article class="card"><h2>Officers</h2><ul class="list">${data.staff.map((item) => `<li><strong>${esc(item.stf_Name)}</strong><br>${esc(item.stf_desig)} · ${esc(item.stf_office)}<br>${esc(item.stf_mobile)} ${esc(item.stf_ofstele)}</li>`).join("") || "<li>No officers.</li>"}</ul></article>
      </div>
    </section>`;
}

function renderProfile() {
  const preset = state.module && state.module !== "dashboard" ? state.module : "";
  $("#stage").innerHTML = `
    <section class="wrap section">
      <p class="kicker">Staff</p>
      <h1>Find an officer</h1>
      <form class="filters" id="profile-form"><label>National ID<input name="nid" value="${esc(preset)}" required></label><button class="btn">Look up</button></form>
      <div id="paper"></div>
    </section>`;
  if (preset) document.getElementById("profile-form").requestSubmit();
}

function settleDates(value) {
  return String(value || "").split(",").map((part) => showDate(part.trim())).filter(Boolean).join(", ");
}

function settlePdfButton() {
  return `<p class="sheet-tools"><button type="button" class="btn" data-act="settle-pdf">${esc(L("PDF බාගත කරන්න", "PDF பதிவிறக்கம்", "Download PDF"))}</button></p>`;
}

function settlePayTabs(view) {
  const year = encodeURIComponent(chosenYear());
  const nid = state.query?.get("nid") || "";
  const item = (id, label) => {
    const keep = id === "resource" && nid ? `&nid=${encodeURIComponent(nid)}` : "";
    return `<a class="${view === id ? "on" : ""}" href="#console/settle?year=${year}&tab=pay&view=${id}${keep}">${esc(label)}</a>`;
  };
  return `<div class="desig-tabs">
    ${item("programmes", L("වැඩසටහන්", "பயிற்சிகள்", "Programmes"))}
    ${item("resource", L("සම්පත්දායක", "வள ஆள்", "Resource person"))}
    ${item("coord", L("සමායෝජන", "ஒருங்கிணைப்பு", "Coordination"))}
    ${item("supervise", L("අධීක්ෂණ", "மேற்பார்வை", "Supervision"))}
    ${item("liaise", L("සම්බන්ධීකරණ", "இணைப்பு", "Liaison"))}
    ${item("accounts", L("ගිණුම් අංශය", "கணக்குப் பிரிவு", "Accounts section"))}
    ${item("office", L("කාර්යාල සහය", "அலுவலக உதவி", "Office assistance"))}
    ${item("print", L("මුද්‍රණය", "அச்சிடு", "Print"))}
  </div>`;
}

function settleCountLine(amount, count) {
  return `<p class="pad-note"><strong>${esc(L("ප්‍රමාණය", "தொகை", "Amount"))}</strong> ${esc(amount)} · <strong>${esc(L("පුහුණු වැඩසටහන් ගණන", "பயிற்சி எண்ணிக்கை", "Number of programmes"))}</strong> ${esc(count)}</p>`;
}

function settleMoneyTable(heads, rows, totalCells) {
  const head = heads.map((label) => `<th>${esc(label)}</th>`).join("");
  const body = rows.length ? rows.join("") : `<tr><td colspan="${heads.length}">${esc(L("මේ වර්ෂයට වැඩසටහන් නොමැත.", "இந்த ஆண்டு பயிற்சி இல்லை.", "No programme for this year."))}</td></tr>`;
  const foot = totalCells ? `<tr>${totalCells}</tr>` : "";
  return `<div class="table-wrap desig-list"><table><thead><tr>${head}</tr></thead><tbody>${body}${foot}</tbody></table></div>`;
}

function settleStrong(text) {
  return `<td><strong>${esc(text)}</strong></td>`;
}

function settlePayTable(rows, totals) {
  const body = rows.map((row) => `<tr>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td class="wrap-cell">${esc(settleDates(row.dates))}</td>
    <td>${esc(row.resource)}</td>
    <td>${esc(row.coord)}</td>
    <td>${esc(row.supervise)}</td>
    <td>${esc(row.liaise)}</td>
    <td>${esc(row.account)}</td>
    <td>${esc(row.office)}</td>
    <td>${esc(row.total)}</td>
  </tr>`);
  const total = [
    settleStrong(L("එකතුව", "மொத்தம்", "Total")),
    "<td></td>",
    settleStrong(totals.resource),
    settleStrong(totals.coord),
    settleStrong(totals.supervise),
    settleStrong(totals.liaise),
    settleStrong(totals.account),
    settleStrong(totals.office),
    settleStrong(totals.total),
  ].join("");
  return settleMoneyTable([
    L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"),
    L("දින", "நாட்கள்", "Dates"),
    L("සම්පත්දායක දීමනා", "வள ஆள் கொடுப்பனவு", "Resource-person allowance"),
    L("සමායෝජන දීමනා", "ஒருங்கிணைப்புக் கொடுப்பனவு", "Coordination allowance"),
    L("අධීක්ෂණ දීමනා", "மேற்பார்வைக் கொடுப்பனவு", "Supervision allowance"),
    L("සම්බන්ධීකරණ දීමනා", "இணைப்புக் கொடுப்பனவு", "Liaison allowance"),
    L("ගිණුම් අංශය", "கணக்குப் பிரிவு", "Accounts section"),
    L("කාර්යාල සහයක දීමනා", "அலுவலக உதவியாளர் கொடுப்பனவு", "Office assistant allowance"),
    L("එකතුව", "மொத்தம்", "Total"),
  ], body, total);
}

function settleRoleTable(block) {
  const body = (block.rows || []).map((row) => `<tr>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td class="wrap-cell">${esc(row.who)}</td>
    <td>${esc(row.amount)}</td>
  </tr>`);
  const total = `${settleStrong(L("එකතුව", "மொத்தம்", "Total"))}<td></td>${settleStrong(block.amount)}`;
  return `${settleCountLine(block.amount, block.count)}${settleMoneyTable([
    L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"),
    L("නිලධාරියා", "அதிகாரி", "Officer"),
    L("ප්‍රමාණය", "தொகை", "Amount"),
  ], body, total)}`;
}

function settlePeopleTables(groups, empty) {
  if (!groups.length) return `<p class="pad-note">${esc(empty)}</p>`;
  return groups.map((group) => {
    const who = [group.nid, group.who].filter(Boolean).join(" — ");
    const body = (group.programmes || []).map((row) => `<tr><td class="wrap-cell">${esc(row.name)}</td><td>${esc(row.amount)}</td></tr>`);
    const total = `${settleStrong(L("එකතුව", "மொத்தம்", "Total"))}${settleStrong(group.amount)}`;
    return `<h3>${esc(who || L("නිලධාරියා", "அதிகாரி", "Officer"))}</h3>${settleCountLine(group.amount, group.count)}${settleMoneyTable([
      L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"),
      L("ප්‍රමාණය", "தொகை", "Amount"),
    ], body, total)}`;
  }).join("");
}

function settlePersonBlock(data, nid, plain) {
  const form = plain ? "" : `<form class="classic-form" id="settle-person">
    <label class="classic-field"><span>${esc(L("සම්පත්දායකයාගේ අංකය", "வள ஆள் எண்", "Resource-person ID"))}</span><input name="nid" value="${esc(nid)}"></label>
    <button type="submit">${esc(L("බලන්න", "பார்", "Show"))}</button>
  </form>`;
  if (!nid) return `${form}<p class="pad-note">${esc(L("සම්පත්දායකයාගේ අංකය දාන්න. කළ පුහුණු සහ දීමනා එකතුව එනවා.", "வள ஆள் எண்ணை இடவும். செய்த பயிற்சியும் கொடுப்பனவும் மொத்தமும் வரும்.", "Enter the resource-person ID. The programmes they took and the allowances come together, with the total."))}</p>`;
  if (data.personMissing) return `${form}<p class="pad-note">${esc(L("මේ අංකයට සම්පත්දායකයෙකු නැහැ.", "இந்த எண்ணுக்கு வள ஆள் இல்லை.", "No resource person has this ID."))}</p>`;
  const person = data.person || {};
  const body = (person.rows || []).map((row) => `<tr>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td class="wrap-cell">${esc(settleDates(row.dates))}</td>
    <td>${esc(row.amount)}</td>
  </tr>`);
  const total = `${settleStrong(L("එකතුව", "மொத்தம்", "Total"))}<td></td>${settleStrong(person.total || "0.00")}`;
  const none = body.length ? "" : `<p class="pad-note">${esc(L("මේ වර්ෂයේ මේ සම්පත්දායකයා දේශන කළ වැඩසටහන් නැහැ.", "இந்த ஆண்டு இவர் விரிவுரை செய்த பயிற்சி இல்லை.", "This resource person has no programme this year."))}</p>`;
  return `${form}
    <p class="pad-note">${esc([person.name, person.post, person.nid].filter(Boolean).join(" · "))}</p>
    ${settleCountLine(person.total || "0.00", person.count || 0)}
    ${none}
    ${settleMoneyTable([
      L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"),
      L("දින", "நாட்கள்", "Dates"),
      L("දීමනා", "கொடுப்பனவு", "Allowance"),
    ], body, body.length ? total : "")}`;
}

function settlePrintHtml(data) {
  const nid = state.query?.get("nid") || "";
  return `<h1>${esc(L("දීමනා සියල්ල", "அனைத்துக் கொடுப்பனவு", "All allowances"))} ${esc(data.year || "")}</h1>
    <h2>${esc(L("සියලු වැඩසටහන්", "அனைத்துப் பயிற்சி", "Every programme"))}</h2>
    ${settlePayTable(data.programmes || [], data.payTotals || {})}
    <h2>${esc(L("සමායෝජන දීමනා", "ஒருங்கிணைப்புக் கொடுப்பனவு", "Coordination allowance"))}</h2>
    ${settleRoleTable(data.coord || { amount: "0.00", count: 0, rows: [] })}
    <h2>${esc(L("අධීක්ෂණ දීමනා", "மேற்பார்வைக் கொடுப்பனவு", "Supervision allowance"))}</h2>
    ${settleRoleTable(data.supervise || { amount: "0.00", count: 0, rows: [] })}
    <h2>${esc(L("සම්බන්ධීකරණ දීමනා", "இணைப்புக் கொடுப்பனவு", "Liaison allowance"))}</h2>
    ${settlePeopleTables(data.liaise || [], L("සම්බන්ධීකරණ දීමනා නැහැ.", "இணைப்புக் கொடுப்பனவு இல்லை.", "No liaison allowance."))}
    <h2>${esc(L("ගිණුම් අංශය සඳහා දීමනා", "கணக்குப் பிரிவுக் கொடுப்பனவு", "Accounts section allowance"))}</h2>
    ${settleRoleTable(data.accounts || { amount: "0.00", count: 0, rows: [] })}
    <h2>${esc(L("කාර්යාල සහයක දීමනා", "அலுவலக உதவியாளர் கொடுப்பனவு", "Office assistant allowance"))}</h2>
    ${settlePeopleTables(data.office || [], L("කාර්යාල සහයක දීමනා නැහැ.", "அலுவலக உதவியாளர் கொடுப்பனவு இல்லை.", "No office-assistant allowance."))}
    ${nid ? `<h2>${esc(L("සම්පත්දායකයා", "வள ஆள்", "Resource person"))}</h2>${settlePersonBlock(data, nid, true)}` : ""}`;
}

async function renderSettle(work) {
  const tab = ["food", "pay"].includes(state.query?.get("tab")) ? state.query.get("tab") : "advance";
  const view = ["resource", "coord", "supervise", "liaise", "accounts", "office", "print"].includes(state.query?.get("view")) ? state.query.get("view") : "programmes";
  const data = await api("settle", { query: { year: chosenYear(), nid: state.query?.get("nid") || "" } });
  if (tab === "food") {
    const rows = (data.food || []).map((row) => `<tr>
      <td class="wrap-cell">${esc(row.name)}</td>
      <td class="wrap-cell">${esc(settleDates(row.dates))}</td>
      <td>${esc(row.planEstimate)}</td>
      <td>${esc(row.advance)}</td>
      <td>${esc(row.spent)}</td>
      <td>${esc(row.food)}</td>
      <td>${esc(row.total)}</td>
      <td>${esc(foodGapText(row.gap, row.short))}</td>
    </tr>`);
    const totals = data.foodTotals || {};
    const gap = advanceNumber(totals.gap);
    const total = [
      settleStrong(L("එකතුව", "மொத்தம்", "Total")),
      "<td></td>",
      settleStrong(totals.planEstimate || "0.00"),
      settleStrong(totals.advance || "0.00"),
      settleStrong(totals.spent || "0.00"),
      settleStrong(totals.food || "0.00"),
      settleStrong(totals.total || "0.00"),
      settleStrong(foodGapText(Math.abs(gap), gap < 0)),
    ].join("");
    const table = settleMoneyTable([
      L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"),
      L("දින", "நாட்கள்", "Dates"),
      L("පුහුණු සැලැස්මේ ඇස්තමේන්තුව", "திட்ட மதிப்பீடு", "Plan estimate"),
      L("අත්තිකාරම", "முன்பணம்", "Advance"),
      L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Spent from the advance"),
      L("ආහාර බිල්", "உணவுப் பட்டியல்", "Food bills"),
      L("මුළු වියදම", "மொத்தச் செலவு", "Total expenditure"),
      L("ඉතිරි හෝ හිඟ මුදල", "மீதி அல்லது பற்றாக்குறை", "Balance or shortfall"),
    ], rows, total);
    work.innerHTML = `
      <h2 class="classic-title">${esc(L("සියලුම වැඩසටහන් වල ආහාර බිල් පියවීම", "அனைத்துப் பயிற்சியின் உணவுப் பட்டியல் தீர்வு", "Food bill settlement of every programme"))}</h2>
      ${settlePdfButton()}
      ${table}`;
    return;
  }
  if (tab === "pay") {
    let body = "";
    if (view === "resource") body = settlePersonBlock(data, state.query?.get("nid") || "");
    else if (view === "coord") body = `<h2 class="classic-title">${esc(L("සමායෝජන දීමනා", "ஒருங்கிணைப்புக் கொடுப்பனவு", "Coordination allowance"))}</h2>${settleRoleTable(data.coord || { amount: "0.00", count: 0, rows: [] })}`;
    else if (view === "supervise") body = `<h2 class="classic-title">${esc(L("අධීක්ෂණ දීමනා", "மேற்பார்வைக் கொடுப்பனவு", "Supervision allowance"))}</h2>${settleRoleTable(data.supervise || { amount: "0.00", count: 0, rows: [] })}`;
    else if (view === "liaise") body = `<h2 class="classic-title">${esc(L("සම්බන්ධීකරණ දීමනා", "இணைப்புக் கொடுப்பனவு", "Liaison allowance"))}</h2>${settlePeopleTables(data.liaise || [], L("සම්බන්ධීකරණ දීමනා නැහැ.", "இணைப்புக் கொடுப்பனவு இல்லை.", "No liaison allowance."))}`;
    else if (view === "accounts") body = `<h2 class="classic-title">${esc(L("ගිණුම් අංශය සඳහා දීමනා", "கணக்குப் பிரிவுக் கொடுப்பனவு", "Accounts section allowance"))}</h2><p class="pad-note">${esc(L("ලැබූ මුදල වැඩසටහන අවසන් කිරීම පියවර 2 එකෙන්.", "பெற்ற தொகை நிகழ்ச்சியை முடித்தல் படி 2 இலிருந்து.", "The amount received comes from finish step 2."))}</p>${settleRoleTable(data.accounts || { amount: "0.00", count: 0, rows: [] })}`;
    else if (view === "office") body = `<h2 class="classic-title">${esc(L("කාර්යාල සහයක දීමනා", "அலுவலக உதவியாளர் கொடுப்பனவு", "Office assistant allowance"))}</h2>${settlePeopleTables(data.office || [], L("කාර්යාල සහයක දීමනා නැහැ.", "அலுவலக உதவியாளர் கொடுப்பனவு இல்லை.", "No office-assistant allowance."))}`;
    else if (view === "print") body = `<article class="food-report" id="pay-report">${settlePrintHtml(data)}</article>`;
    else body = `<h2 class="classic-title">${esc(L("සියලු වැඩසටහන් වල දීමනා", "அனைத்துப் பயிற்சிக் கொடுப்பனவு", "Allowances of every programme"))}</h2>${settlePayTable(data.programmes || [], data.payTotals || {})}`;
    work.innerHTML = `${settlePayTabs(view)}<h2 class="classic-title">${esc(L("දීමනා සියල්ල", "அனைத்துக் கொடுப்பனவு", "All allowances"))}</h2>${settlePdfButton()}${body}`;
    return;
  }
  const rows = (data.advances || []).map((row) => `<tr>
    <td>${esc(showDate(row.date))}</td>
    <td class="wrap-cell">${esc(row.planNo)}</td>
    <td class="wrap-cell">${esc(row.name)}</td>
    <td class="wrap-cell">${esc(row.coordinator)}</td>
    <td class="wrap-cell">${esc(settleDates(row.dates))}</td>
    <td>${esc(row.planEstimate)}</td>
    <td>${esc(row.prepared)}</td>
    <td>${esc(row.advance)}</td>
    <td>${esc(row.attended)}</td>
    <td>${esc(row.spent)}</td>
    <td>${esc(row.balance)}</td>
    <td>${esc(row.government)}</td>
    <td class="wrap-cell">${esc(row.receipt)}</td>
  </tr>`);
  const totals = data.advanceTotals || {};
  const total = [
    settleStrong(L("එකතුව", "மொத்தம்", "Total")),
    "<td></td><td></td><td></td><td></td>",
    settleStrong(totals.planEstimate || "0.00"),
    settleStrong(totals.prepared || "0.00"),
    settleStrong(totals.advance || "0.00"),
    settleStrong(totals.attended || 0),
    settleStrong(totals.spent || "0.00"),
    settleStrong(totals.balance || "0.00"),
    settleStrong(totals.government || "0.00"),
    "<td></td>",
  ].join("");
  const table = settleMoneyTable([
    L("දිනය", "திகதி", "Date"),
    L("පුහුණු සැලසුමේ අංකය", "பயிற்சித் திட்ட எண்", "Training plan number"),
    L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme"),
    L("සම්බන්ධීකරණ නිලධාරියා", "ஒருங்கிணைப்பாளர்", "Liaison officer"),
    L("දින", "நாட்கள்", "Dates"),
    L("පුහුණු සැලැස්මේ ඇස්තමේන්තුව", "திட்ட மதிப்பீடு", "Plan estimate"),
    L("සකස්කල ඇස්තමේන්තුව", "தயாரித்த மதிப்பீடு", "Prepared estimate"),
    L("අත්තිකාරම් මුදල", "முன்பணம்", "Advance"),
    L("සහභාගි වූ සංඛ්‍යාව", "பங்கேற்றோர்", "Attended"),
    L("අත්තිකාරමින් වියදම් වූ මුදල", "முன்பணச் செலவு", "Spent"),
    L("ඉතිරි මුදල", "மீதி", "Balance"),
    L("රාජ්‍ය භාගය", "அரசுப் பங்கு", "Government share"),
    L("රිසිටි අංකය", "ரசீது எண்", "Receipt number"),
  ], rows, total);
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("සියලුම වැඩසටහන් වල අත්තිකාරම් පියවීම", "அனைத்துப் பயிற்சியின் முன்பணத் தீர்வு", "Advance settlement of every programme"))}</h2>
    <p class="pad-note">${esc(L("ඉතිරි මුදල = අත්තිකාරම් මුදල − වියදම් වූ මුදල.", "மீதி = முன்பணம் − செலவு.", "Balance is the advance minus the amount spent."))}</p>
    ${settlePdfButton()}
    ${table}`;
}

async function saveSettlePdf() {
  const root = document.getElementById("work");
  if (!root) return;
  if (document.fonts?.ready) await document.fonts.ready;
  const pageW = 1754;
  const pageH = 1240;
  const margin = 36;
  const inner = pageW - margin * 2;
  const fontName = '"Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const canvases = [];
  let canvas;
  let ctx;
  let y = 0;
  const startPage = () => {
    canvas = document.createElement("canvas");
    canvas.width = pageW;
    canvas.height = pageH;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageW, pageH);
    ctx.fillStyle = "#0c4da2";
    ctx.fillRect(0, 0, pageW, 10);
    y = 48;
    canvases.push(canvas);
  };
  const ensure = (need) => {
    if (!canvas || y + need > pageH - 28) startPage();
  };
  const writeLine = (text, size, weight, color) => {
    const source = String(text || "").trim();
    if (!source) return;
    ctx.font = `${weight} ${size}px ${fontName}`;
    canvasWrap(ctx, source, inner).forEach((line) => {
      ensure(size + 10);
      ctx.fillStyle = color || "#08324a";
      ctx.font = `${weight} ${size}px ${fontName}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(line, margin, y + size);
      y += size + 6;
    });
    y += 8;
  };
  const drawTable = (head, body) => {
    const cols = Math.max(head.length, ...body.map((row) => row.length), 1);
    const colW = inner / cols;
    const font = cols > 10 ? 12 : cols > 7 ? 14 : 16;
    const pad = 4;
    const lineH = font + 3;
    const cellLines = (text, bold) => {
      ctx.font = `${bold ? 700 : 400} ${font}px ${fontName}`;
      return canvasWrap(ctx, text, Math.max(8, colW - pad * 2)).slice(0, 5);
    };
    const paintRow = (cells, header, repeatHead) => {
      const lines = cells.map((text, index) => cellLines(text, header || index === 0 && text === "එකතුව"));
      const height = Math.max(lineH + pad * 2, ...lines.map((item) => item.length * lineH + pad * 2));
      if (y + height > pageH - 28) {
        startPage();
        if (repeatHead) paintRow(heading, true, false);
      }
      let x = margin;
      cells.forEach((text, index) => {
        ctx.fillStyle = header ? "#87ceeb" : "#f7fbff";
        ctx.fillRect(x, y, colW, height);
        ctx.strokeStyle = "#5eb6d6";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, colW, height);
        ctx.fillStyle = "#08324a";
        ctx.font = `${header || (index === 0 && text === "එකතුව") ? 700 : 400} ${font}px ${fontName}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        (lines[index] || [""]).forEach((line, lineIndex) => {
          ctx.fillText(line, x + pad, y + pad + lineIndex * lineH);
        });
        x += colW;
      });
      y += height;
    };
    const fit = (cells) => {
      const copy = cells.slice(0, cols);
      while (copy.length < cols) copy.push("");
      return copy;
    };
    const heading = fit(head);
    paintRow(heading, true, false);
    (body.length ? body : [["මේ වර්ෂයට වැඩසටහන් නොමැත."]]).forEach((row) => paintRow(fit(row), false, true));
    y += 18;
  };
  startPage();
  root.querySelectorAll("h1, h2, h3, p.pad-note, table").forEach((node) => {
    if (node.matches("table")) {
      const head = [...node.querySelectorAll("thead th")].map((cell) => cell.textContent.trim());
      const body = [...node.querySelectorAll("tbody tr")].map((row) => [...row.children].map((cell) => cell.textContent.replace(/\s+/g, " ").trim()));
      drawTable(head, body);
      return;
    }
    const size = node.matches("h1") ? 28 : node.matches("h2") ? 24 : node.matches("h3") ? 18 : 15;
    const weight = node.matches("p") ? 400 : 700;
    writeLine(node.textContent, size, weight, node.matches("p") ? "#08324a" : "#0c4da2");
  });
  const images = [];
  for (const page of canvases) {
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: page.width, height: page.height });
  }
  const tab = state.query?.get("tab") === "food" || state.query?.get("tab") === "pay" ? state.query.get("tab") : "advance";
  const view = state.query?.get("view") || "programmes";
  const payNames = {
    programmes: "demana",
    resource: "demana-sampathdayaka",
    coord: "demana-samayojana",
    supervise: "demana-adhikshana",
    liaise: "demana-sambandikarana",
    accounts: "demana-ginum",
    office: "demana-karyalaya",
    print: "demana-warthawa",
  };
  const file = tab === "food" ? "ahara-bill" : tab === "pay" ? (payNames[view] || "demana") : "asthamethu";
  saveBlob(jpegPdfPages(images, "841.89", "595.28"), `${file}-${chosenYear()}.pdf`);
}

function aheadTabs() {
  return [
    ["office", L("කාර්යාල ප්‍රගතිය", "அலுவலக முன்னேற்றம்", "Office progress")],
    ["general", L("පොදු පුහුණු", "பொதுப் பயிற்சி", "General training")],
    ["special", L("විශේෂ පුහුණු", "சிறப்புப் பயிற்சி", "Special training")],
    ["department", L("දෙපාර්තමේන්තු පුහුණු", "திணைக்களப் பயிற்சி", "Departmental training")],
    ["drug", L("මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන ප්‍රගතිය", "போதை தடுப்பு ஆலோசனை முன்னேற்றம்", "Drug prevention and counselling progress")],
    ["tamil", L("දෙමළ භාෂා ප්‍රගතිය", "தமிழ் மொழி முன்னேற்றம்", "Tamil language progress")],
    ["external", L("බාහිර පුහුණු ප්‍රගතිය", "வெளிப்புற பயிற்சி முன்னேற்றம்", "External training progress")],
    ["foreign", L("විදේශ පුහුණු ප්‍රගතිය", "வெளிநாட்டு பயிற்சி முன்னேற்றம்", "Foreign training progress")],
    ["compare", L("වාර්ෂික සංසන්දනය", "ஆண்டு ஒப்பீடு", "Yearly comparison")],
  ];
}

function aheadHref(id) {
  const params = new URLSearchParams();
  params.set("tab", id);
  params.set("year", state.query?.get("year") || chosenYear());
  return `#console/ahead?${params}`;
}

function aheadSpec(kind) {
  if (kind === "general") {
    return {
      kind: "general",
      action: "ahead-general",
      save: "ahead-general-save",
      title: "පොදු පුහුණු ප්‍රගතිය",
      empty: "මෙම වර්ෂයේ පොදු පුහුණු වැඩසටහන් නැත.",
      file: "podu",
      allocSource: "site",
      cards: [
        ["count", L("පුහුණු වැඩසටහන් ගණන", "பயிற்சி நிகழ்ச்சிகள்", "Programmes"), "පුහුණු වැඩසටහන් ගණන"],
        ["people", L("පුහුණුලාභීන් ගණන", "பயனாளிகள்", "Trainees"), "පුහුණුලාභීන් ගණන"],
        ["alloc", L("ප්‍රතිපාදන ප්‍රමාණය", "ஒதுக்கீட்டுத் தொகை", "Provision amount"), "ප්‍රතිපාදන ප්‍රමාණය"],
        ["spent", L("වියදම", "செலவு", "Expenditure"), "වියදම"],
        ["left", L("ඉතිරි ප්‍රතිපාදන", "மீதி", "Remaining provision"), "ඉතිරි ප්‍රතිපාදන"],
      ],
    };
  }
  if (kind === "special") {
    return {
      kind: "special",
      action: "ahead-special",
      save: "ahead-special-save",
      title: "විශේෂ පුහුණු ප්‍රගතිය",
      empty: "මෙම වර්ෂයේ විශේෂ පුහුණු වැඩසටහන් නැත.",
      file: "vishesha",
      allocSource: "site",
      cards: [
        ["count", L("පුහුණු වැඩසටහන් ගණන", "பயிற்சி நிகழ்ச்சிகள்", "Programmes"), "පුහුණු වැඩසටහන් ගණන"],
        ["people", L("පුහුණුලාභීන් ගණන", "பயனாளிகள்", "Trainees"), "පුහුණුලාභීන් ගණන"],
        ["alloc", L("ප්‍රතිපාදන ප්‍රමාණය", "ஒதுக்கீட்டுத் தொகை", "Provision amount"), "ප්‍රතිපාදන ප්‍රමාණය"],
        ["spent", L("වියදම", "செலவு", "Expenditure"), "වියදම"],
        ["left", L("ඉතිරි ප්‍රතිපාදන", "மீதி", "Remaining provision"), "ඉතිරි ප්‍රතිපාදන"],
      ],
    };
  }
  if (kind === "department") {
    return {
      kind: "department",
      action: "ahead-department",
      save: "ahead-department-save",
      title: "දෙපාර්තමේන්තු පුහුණු ප්‍රගතිය",
      empty: "මෙම වර්ෂයේ දෙපාර්තමේන්තු පුහුණු වැඩසටහන් නැත.",
      file: "departments",
      allocSource: "site",
      cards: [
        ["count", L("පුහුණු වැඩසටහන් ගණන", "பயிற்சி நிகழ்ச்சிகள்", "Programmes"), "පුහුණු වැඩසටහන් ගණන"],
        ["people", L("පුහුණුලාභීන් ගණන", "பயனாளிகள்", "Trainees"), "පුහුණුලාභීන් ගණන"],
        ["alloc", L("ප්‍රතිපාදන ප්‍රමාණය", "ஒதுக்கீட்டுத் தொகை", "Provision amount"), "ප්‍රතිපාදන ප්‍රමාණය"],
        ["spent", L("වියදම", "செலவு", "Expenditure"), "වියදම"],
        ["left", L("ඉතිරි ප්‍රතිපාදන", "மீதி", "Remaining provision"), "ඉතිරි ප්‍රතිපාදන"],
      ],
    };
  }
  if (kind === "drug") {
    return {
      kind: "drug",
      action: "ahead-drug",
      save: "ahead-drug-save",
      title: "මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන ප්‍රගතිය",
      empty: "මෙම වර්ෂයේ මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන වැඩසටහන් නැත.",
      file: "mathdravya",
      cards: [
        ["count", L("පුහුණු වැඩසටහන් ගණන", "பயிற்சி நிகழ்ச்சிகள்", "Programmes"), "පුහුණු වැඩසටහන් ගණන"],
        ["spent", L("වියදම", "செலவு", "Expenditure"), "වියදම"],
        ["people", L("පුහුණුලාභීන් ගණන", "பயனாளிகள்", "Trainees"), "පුහුණුලාභීන් ගණන"],
        ["alloc", L("ප්‍රතිපාදන ප්‍රමාණය", "ஒதுக்கீட்டுத் தொகை", "Provision amount"), "ප්‍රතිපාදන ප්‍රමාණය"],
        ["left", L("ඉතිරි ගණන", "மீதி", "Remaining amount"), "ඉතිරි ගණන"],
      ],
    };
  }
  if (kind === "external") {
    return {
      kind: "external",
      action: "ahead-external",
      save: "ahead-external-save",
      title: "බාහිර පුහුණු ප්‍රගතිය",
      empty: "මෙම වර්ෂයේ බාහිර පුහුණු වැඩසටහන් නැත.",
      file: "bahira",
      allocSource: "site",
      cards: [
        ["count", L("මුළු බාහිර පුහුණු ගණන", "மொத்த வெளிப்புறப் பயிற்சிகள்", "Total external programmes"), "මුළු බාහිර පුහුණු ගණන"],
        ["people", L("පුහුණුලාභීන් ගණන", "பயனாளிகள்", "Trainees"), "පුහුණුලාභීන් ගණන"],
        ["alloc", L("බාහිර පුහුණු සඳහා වෙන් ප්‍රතිපාදන ප්‍රමාණය", "வெளிப்புறப் பயிற்சிக்கான ஒதுக்கீடு", "Provision set aside for external training"), "බාහිර පුහුණු සඳහා වෙන් ප්‍රතිපාදන ප්‍රමාණය"],
        ["spent", L("වියදම", "செலவு", "Expenditure"), "වියදම"],
        ["left", L("ඉතිරි ප්‍රතිපාදන ප්‍රමාණය", "மீதமுள்ள ஒதுக்கீடு", "Remaining provision"), "ඉතිරි ප්‍රතිපාදන ප්‍රමාණය"],
      ],
    };
  }
  if (kind === "foreign") {
    return {
      kind: "foreign",
      action: "ahead-foreign",
      save: "ahead-foreign-save",
      title: "විදේශ පුහුණු ප්‍රගතිය",
      empty: "මෙම වර්ෂයේ විදේශ පුහුණු වැඩසටහන් නැත.",
      file: "videsha",
      cards: [
        ["count", L("විදේශ පුහුණු ගණන", "வெளிநாட்டுப் பயிற்சிகள்", "Foreign programmes"), "විදේශ පුහුණු ගණන"],
        ["people", L("පුහුණුලාභීන් ගණන", "பயனாளிகள்", "Trainees"), "පුහුණුලාභීන් ගණන"],
        ["alloc", L("ප්‍රතිපාදන ප්‍රමාණය", "ஒதுக்கீட்டுத் தொகை", "Provision amount"), "ප්‍රතිපාදන ප්‍රමාණය"],
        ["spent", L("වියදම", "செலவு", "Expenditure"), "වියදම"],
        ["left", L("ඉතිරි ප්‍රතිපාදන", "மீதி", "Remaining provision"), "ඉතිරි ප්‍රතිපාදන"],
      ],
    };
  }
  return {
    kind: "tamil",
    action: "ahead-tamil",
    save: "ahead-tamil-save",
    title: "දෙමළ භාෂා ප්‍රගතිය",
    empty: "මෙම වර්ෂයේ දෙමළ භාෂා වැඩසටහන් නැත.",
    file: "demala",
    cards: [
      ["count", L("පුහුණු වැඩසටහන් ගණන", "பயிற்சி நிகழ்ச்சிகள்", "Programmes"), "පුහුණු වැඩසටහන් ගණන"],
      ["spent", L("වියදම", "செலவு", "Expenditure"), "වියදම"],
      ["alloc", L("දෙමළ වැඩමුළු සඳහා වෙන් වූ ප්‍රතිපාදන", "தமிழ் பட்டறைகளுக்காக ஒதுக்கிய ஒதுக்கீடு", "Provision set aside for Tamil workshops"), "දෙමළ වැඩමුළු සඳහා වෙන් වූ ප්‍රතිපාදන"],
      ["left", L("ඉතිරි ප්‍රතිපාදන", "மீதி", "Remaining provision"), "ඉතිරි ප්‍රතිපාදන"],
      ["people", L("පුහුණුලාභීන් ගණන", "பயனாளிகள்", "Trainees"), "පුහුණුලාභීන් ගණන"],
    ],
  };
}

function aheadCardValue(key, pack) {
  if (key === "count") return String(pack.count);
  if (key === "people") return String(Math.round(pack.people));
  if (key === "spent") return progressMoney(pack.spent);
  if (key === "alloc") return progressMoney(pack.alloc);
  return progressMoney(pack.left);
}

function tamilNum(value) {
  const number = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : 0;
}

function tamilFigures(form) {
  const rows = [...form.querySelectorAll("tr[data-id]")].map((tr) => ({
    id: tr.dataset.id,
    name: tr.dataset.name || "",
    days: tr.dataset.days || "",
    place: tr.dataset.place || "",
    money: tr.querySelector("[name=money]")?.value || "",
    spent: tr.querySelector("[name=spent]")?.value || "",
    people: tr.querySelector("[name=people]")?.value || "",
  }));
  const spent = rows.reduce((sum, row) => sum + tamilNum(row.spent), 0);
  const people = rows.reduce((sum, row) => sum + tamilNum(row.people), 0);
  const alloc = form.dataset.allocSource === "site"
    ? tamilNum(form.dataset.alloc || "")
    : rows.reduce((sum, row) => sum + tamilNum(row.money), 0);
  return { rows, count: rows.length, spent, people, alloc, left: alloc - spent };
}

function paintTamilSummary() {
  const form = document.getElementById("ahead-form");
  if (!form) return;
  const pack = tamilFigures(form);
  aheadSpec(form.dataset.kind).cards.forEach(([key]) => {
    const node = document.getElementById(`tamil-${key}`);
    if (node) node.textContent = aheadCardValue(key, pack);
  });
}

function tamilReportHtml(data, spec) {
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const pack = {
    count: rows.length,
    spent: rows.reduce((sum, row) => sum + tamilNum(row.spent), 0),
    people: rows.reduce((sum, row) => sum + tamilNum(row.people), 0),
    alloc: spec.allocSource === "site"
      ? tamilNum(data.allocation)
      : rows.reduce((sum, row) => sum + tamilNum(row.money), 0),
  };
  pack.left = pack.alloc - pack.spent;
  const body = rows.length
    ? rows.map((row, index) => `<tr data-id="${esc(row.id)}" data-name="${esc(row.name)}" data-days="${esc(row.days)}" data-place="${esc(row.place)}">
        <td>${index + 1}</td>
        <td class="left">${esc(row.name)}</td>
        <td class="left">${esc(row.days)}</td>
        <td class="left">${esc(row.place)}</td>
        <td><input name="money" value="${esc(row.money)}" inputmode="decimal"></td>
        <td><input name="spent" value="${esc(row.spent)}" inputmode="decimal"></td>
        <td><input name="people" value="${esc(row.people)}" inputmode="numeric"></td>
      </tr>`).join("")
    : `<tr><td class="left" colspan="7">${esc(spec.empty)}</td></tr>`;
  return `<form id="ahead-form" data-kind="${esc(spec.kind)}" data-alloc-source="${esc(spec.allocSource || "rows")}" data-alloc="${esc(data.allocation || "")}">
    <div class="tamil-tools no-print">
      <button class="btn" type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <button class="btn secondary" type="button" data-act="tamil-detail-pdf">${esc(L("විස්තර PDF", "விவரம் PDF", "Detail PDF"))}</button>
      <button class="btn secondary" type="button" data-act="tamil-summary-pdf">${esc(L("සාරාංශ PDF", "சுருக்கம் PDF", "Summary PDF"))}</button>
      <button class="btn secondary" type="button" data-act="ahead-csv">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
      <button class="btn secondary" type="button" data-act="ahead-print">${esc(L("මුද්‍රණය කරන්න", "அச்சிடு", "Print"))}</button>
      <span class="tamil-note" id="tamil-note"></span>
    </div>
    <div class="tamil-summary">
      ${spec.cards.map(([key, label]) => `<div class="tamil-card"><span>${esc(label)}</span><b id="tamil-${key}">${esc(aheadCardValue(key, pack))}</b></div>`).join("")}
    </div>
    <div class="tamil-scroll">
      <table class="pace-sheet tamil-sheet">
        <thead><tr>
          <th>${esc(L("අංකය", "இல.", "No."))}</th>
          <th class="left">${esc(L("වැඩසටහන", "நிகழ்ச்சி", "Programme"))}</th>
          <th class="left">${esc(L("දින", "நாட்கள்", "Days"))}</th>
          <th class="left">${esc(L("ස්ථානය", "இடம்", "Place"))}</th>
          <th>${esc(L("ප්‍රතිපාදන", "ஒதுக்கீடு", "Provision"))}</th>
          <th>${esc(L("වියදම", "செலவு", "Expenditure"))}</th>
          <th>${esc(L("පුහුණුලාභීන්", "பயனாளிகள்", "Trainees"))}</th>
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  </form>`;
}

function tamilSummaryLines(pack, spec) {
  return spec.cards.map(([key, , label]) => `${label}: ${aheadCardValue(key, pack)}`);
}

function tamilTablePages({ pageW, pageH, margin, title, headers, widths, rows, alignRight, foot }) {
  const fontName = '"Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const measure = document.createElement("canvas").getContext("2d");
  const fontSize = 20;
  const lineH = 28;
  const pad = 10;
  const wrap = (text, width, weight) => {
    measure.font = `${weight} ${fontSize}px ${fontName}`;
    return canvasWrap(measure, text, Math.max(20, width - pad * 2));
  };
  const packed = rows.map((row) => {
    const lines = row.map((cell, col) => wrap(cell, widths[col], 400));
    const height = Math.max(...lines.map((item) => item.length), 1) * lineH + pad * 2;
    return { lines, height };
  });
  const headLines = headers.map((cell, col) => wrap(cell, widths[col], 600));
  const headH = Math.max(...headLines.map((item) => item.length), 1) * lineH + pad * 2;
  const footLines = (foot || []).map((line) => {
    measure.font = `600 ${fontSize}px ${fontName}`;
    return canvasWrap(measure, line, pageW - margin * 2);
  });
  const footH = footLines.reduce((sum, lines) => sum + lines.length * (lineH + 4), 0) + (footLines.length ? 24 : 0);
  const pages = [];
  let index = 0;
  const titleH = 64;
  const paintFoot = (ctx, y) => {
    ctx.textAlign = "left";
    ctx.font = `600 ${fontSize}px ${fontName}`;
    ctx.fillStyle = "#08324a";
    footLines.forEach((lines) => {
      lines.forEach((line) => {
        ctx.fillText(line, margin, y);
        y += lineH + 4;
      });
    });
  };
  while (index < packed.length || pages.length === 0) {
    const canvas = document.createElement("canvas");
    canvas.width = pageW;
    canvas.height = pageH;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageW, pageH);
    ctx.fillStyle = "#08324a";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = `600 32px ${fontName}`;
    ctx.fillText(title, pageW / 2, margin);
    let y = margin + titleH;
    let x = margin;
    ctx.font = `600 ${fontSize}px ${fontName}`;
    headers.forEach((_, col) => {
      ctx.fillStyle = "#87ceeb";
      ctx.fillRect(x, y, widths[col], headH);
      ctx.strokeStyle = "#5eb6d6";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, widths[col], headH);
      ctx.fillStyle = "#08324a";
      ctx.textAlign = "center";
      headLines[col].forEach((line, lineIndex) => {
        ctx.fillText(line, x + widths[col] / 2, y + pad + lineIndex * lineH);
      });
      x += widths[col];
    });
    y += headH;
    const start = index;
    while (index < packed.length) {
      const row = packed[index];
      const last = index === packed.length - 1;
      const need = row.height + (last ? footH : 0);
      if (y + need > pageH - margin && index > start) break;
      x = margin;
      row.lines.forEach((lines, col) => {
        ctx.fillStyle = "#c5eefe";
        ctx.fillRect(x, y, widths[col], row.height);
        ctx.strokeStyle = "#5eb6d6";
        ctx.strokeRect(x, y, widths[col], row.height);
        ctx.fillStyle = "#08324a";
        const right = alignRight.includes(col);
        ctx.textAlign = right ? "right" : "left";
        ctx.font = `400 ${fontSize}px ${fontName}`;
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, right ? x + widths[col] - pad : x + pad, y + pad + lineIndex * lineH);
        });
        x += widths[col];
      });
      y += row.height;
      index += 1;
    }
    if (index >= packed.length && y + footH <= pageH - margin) {
      paintFoot(ctx, y + 16);
      pages.push(canvas);
      break;
    }
    pages.push(canvas);
    if (index >= packed.length) {
      const extra = document.createElement("canvas");
      extra.width = pageW;
      extra.height = pageH;
      const xctx = extra.getContext("2d");
      xctx.fillStyle = "#ffffff";
      xctx.fillRect(0, 0, pageW, pageH);
      xctx.fillStyle = "#08324a";
      xctx.textBaseline = "top";
      xctx.textAlign = "center";
      xctx.font = `600 32px ${fontName}`;
      xctx.fillText(title, pageW / 2, margin);
      paintFoot(xctx, margin + titleH);
      pages.push(extra);
      break;
    }
    if (index === start) break;
  }
  return pages;
}

function tamilSummaryCanvas(pack, year, spec) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext("2d");
  const fontName = '"Noto Sans Sinhala", "Source Sans 3", sans-serif';
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#08324a";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `600 36px ${fontName}`;
  ctx.fillText(spec.title, canvas.width / 2, 80);
  ctx.font = `600 26px ${fontName}`;
  ctx.fillText(`${year}  ·  සාරාංශය`, canvas.width / 2, 132);
  const lines = spec.cards.map(([key, , label]) => [label, aheadCardValue(key, pack)]);
  let y = 220;
  lines.forEach(([label, value]) => {
    ctx.font = `400 22px ${fontName}`;
    const wrapped = canvasWrap(ctx, label, 640);
    const boxH = Math.max(110, 36 + wrapped.length * 30);
    ctx.fillStyle = "#c5eefe";
    ctx.fillRect(120, y, 1000, boxH);
    ctx.strokeStyle = "#5eb6d6";
    ctx.lineWidth = 2;
    ctx.strokeRect(120, y, 1000, boxH);
    ctx.fillStyle = "#08324a";
    ctx.textAlign = "left";
    ctx.font = `400 22px ${fontName}`;
    wrapped.forEach((line, index) => ctx.fillText(line, 148, y + 18 + index * 30));
    ctx.textAlign = "right";
    ctx.font = `600 36px ${fontName}`;
    ctx.fillText(value, 1092, y + boxH - 50);
    y += boxH + 18;
  });
  return canvas;
}

async function tamilPdf(mode) {
  const form = document.getElementById("ahead-form");
  if (!form) return;
  const spec = aheadSpec(form.dataset.kind);
  if (document.fonts?.load) {
    await document.fonts.load("600 32px 'Noto Sans Sinhala'").catch(() => {});
    await document.fonts.load("400 26px 'Noto Sans Sinhala'").catch(() => {});
  }
  if (document.fonts?.ready) await document.fonts.ready;
  const pack = tamilFigures(form);
  const year = chosenYear();
  const canvases = mode === "summary"
    ? [tamilSummaryCanvas(pack, year, spec)]
    : tamilTablePages({
      pageW: 1754,
      pageH: 1240,
      margin: 48,
      title: `${spec.title}  ·  ${year}`,
      headers: ["අංකය", "වැඩසටහන", "දින", "ස්ථානය", "ප්‍රතිපාදන", "වියදම", "පුහුණුලාභීන්"],
      widths: [70, 548, 260, 280, 170, 170, 160],
      rows: pack.rows.length
        ? pack.rows.map((row, index) => [
          String(index + 1),
          row.name,
          row.days,
          row.place,
          progressMoney(tamilNum(row.money)),
          progressMoney(tamilNum(row.spent)),
          String(Math.round(tamilNum(row.people))),
        ])
        : [["", spec.empty, "", "", "", "", ""]],
      alignRight: [0, 4, 5, 6],
      foot: tamilSummaryLines(pack, spec),
    });
  const images = [];
  for (const page of canvases) {
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: page.width, height: page.height });
  }
  const landscape = mode !== "summary";
  saveBlob(
    jpegPdfPages(images, landscape ? "841.89" : "595.28", landscape ? "595.28" : "841.89"),
    `${spec.file}-${mode === "summary" ? "saranshaya" : "visthara"}-${year}.pdf`
  );
}

function officeRowNames() {
  return [
    ["general", "පොදු පුහුණු වැඩසටහන්", "பொதுப் பயிற்சிகள்", "General training programmes"],
    ["special", "විශේෂ පුහුණු වැඩසටහන්", "சிறப்புப் பயிற்சிகள்", "Special training programmes"],
    ["department", "දෙපාර්තමේන්තු පුහුණු වැඩසටහන්", "திணைக்களப் பயிற்சிகள்", "Departmental training programmes"],
    ["language", "භාෂා පුහුණු වැඩසටහන්", "மொழிப் பயிற்சிகள்", "Language training programmes"],
    ["drug", "මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන වැඩසටහන්", "போதைத் தடுப்பு மற்றும் ஆலோசனை", "Drug prevention and counselling"],
    ["external", "බාහිර පුහුණු පාඨමාලා", "வெளிப்புற பயிற்சிப் படிப்புகள்", "External training courses"],
    ["meeting", "සම්මන්ත්‍රණ, රැස්වීම් හා වෙනත් වැඩසටහන්", "கருத்தரங்கு, கூட்டம் மற்றும் பிற", "Seminars, meetings and other programmes"],
  ];
}

function officeMoney(value) {
  return advanceNumber(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function officePct(part, whole) {
  if (!(Number(whole) > 0)) return "0.00";
  return (Number(part) / Number(whole) * 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function officeAdd(rows) {
  return rows.reduce((box, row) => {
    box.plan += Number(row.plan) || 0;
    box.held += Number(row.held) || 0;
    box.target += Number(row.target) || 0;
    box.came += Number(row.came) || 0;
    box.alloc += advanceNumber(row.alloc);
    box.spent += advanceNumber(row.spent);
    return box;
  }, { plan: 0, held: 0, target: 0, came: 0, alloc: 0, spent: 0 });
}

function officeSheet(data) {
  const byId = {};
  (data?.rows || []).forEach((row) => { byId[row.id] = row; });
  const items = officeRowNames().map(([id, si, ta, en], index) => ({ no: String(index + 1), id, label: L(si, ta, en), ...(byId[id] || {}) }));
  const training = items.filter((row) => row.id !== "meeting");
  const meeting = items.find((row) => row.id === "meeting");
  const sub = officeAdd(training);
  const outside = { alloc: advanceNumber(data?.outside?.amount), spent: advanceNumber(data?.outside?.spent) };
  const grand = { plan: sub.plan, held: sub.held, target: sub.target, came: sub.came, alloc: sub.alloc + outside.alloc, spent: sub.spent + outside.spent };
  const physical = officeAdd(items);
  const money = { alloc: physical.alloc + outside.alloc, spent: physical.spent + outside.spent };
  return { items, training, meeting, sub, outside, grand, physical, money };
}

function officeFigures(row, people) {
  const cells = [String(row.plan || 0), String(row.held || 0), officePct(row.held, row.plan)];
  if (people) cells.push(String(row.target || 0), String(row.came || 0), officePct(row.came, row.target));
  else cells.push("", "", "");
  cells.push(officeMoney(row.alloc), officeMoney(row.spent));
  return cells;
}

function officeReportHtml(data) {
  const sheet = officeSheet(data);
  const year = data.year || chosenYear();
  const head = [
    L("අංකය", "இல.", "No."),
    L("විස්තරය", "விவரம்", "Description"),
    L("භෞතික ඉලක්කය (වැඩසටහන්)", "பௌதிக இலக்கு (நிகழ்ச்சி)", "Physical target (programmes)"),
    L("භෞතික ප්‍රගතිය (වැඩසටහන්)", "பௌதிக முன்னேற்றம்", "Physical progress (programmes)"),
    L("ප්‍රතිශතය (%)", "சதவீதம் (%)", "Percent (%)"),
    L("ඉලක්කගත සේවක සංඛ්‍යාව", "இலக்கு ஊழியர்", "Target officers"),
    L("සහභාගී වූ සේවක සංඛ්‍යාව", "பங்கேற்ற ஊழியர்", "Officers who attended"),
    L("ප්‍රතිශතය (%)", "சதவீதம் (%)", "Percent (%)"),
    L("වෙන් කළ ප්‍රතිපාදන (රු.)", "ஒதுக்கீடு (ரூ.)", "Allocation (Rs.)"),
    L("වියදම (රු.)", "செலவு (ரூ.)", "Expenditure (Rs.)"),
  ];
  const line = (no, label, row, kind, people = true) => `<tr class="office-${kind}">
    <td>${esc(no)}</td><td class="wrap-cell">${esc(label)}</td>
    ${officeFigures(row, people).map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`;
  const body = [
    ...sheet.training.map((row) => line(row.no, row.label, row, "item")),
    line("", L("උප එකතුව", "உப கூட்டல்", "Subtotal"), sheet.sub, "sub"),
    line(sheet.meeting.no, sheet.meeting.label, sheet.meeting, "item"),
    line("", L("වෙනත් ආයතන වෙත මාරු කළ ප්‍රතිපාදන", "பிற நிறுவனங்களுக்கு மாற்றிய ஒதுக்கீடு", "Allocation transferred to other institutions"), sheet.outside, "out", false),
    line("", L("මුළු එකතුව", "மொத்தம்", "Grand total"), sheet.grand, "grand"),
  ].join("");
  const outside = data.outside || {};
  return `
    <article class="letter office-sheet" id="office-sheet">
      <h2>${esc(L("ප්‍රගති වාර්තාව", "முன்னேற்ற அறிக்கை", "Progress report"))}</h2>
      <p class="name-meta"><span>${esc(L("කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය - වයඹ පළාත", "முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு - வடமேல் மாகாணம்", "Management Development and Training Unit - North Western Province"))}</span>
        <span>${esc(year)}.01.01 ${esc(L("සිට", "முதல்", "to"))} ${esc(year)}.12.31 ${esc(L("දක්වා", "வரை", ""))}</span></p>
      <p class="muted">${esc(L("භෞතික ඉලක්කය යනු වාර්ෂික සැලැස්මේ වැඩසටහන් ගණනයි. භෞතික ප්‍රගතිය යනු ඇත්තටම පැවැත්වූ වැඩසටහන් ගණනයි. ප්‍රතිපාදන තීරුව, ප්‍රතිපාදන මාරු කිරීම් වලින් පසු වත්මන් මුදලයි.", "பௌதிக இலக்கு என்பது ஆண்டுத் திட்ட நிகழ்ச்சிகள். பௌதிக முன்னேற்றம் என்பது நடத்தப்பட்டவை. ஒதுக்கீடு, மாற்றங்களுக்குப் பிந்தைய தொகை.", "Physical target is the programmes in the annual plan. Physical progress is the programmes actually held. The allocation column is the amount after transfers."))}</p>
      <div class="table-wrap"><table>
        <thead><tr>${head.map((cell) => `<th>${esc(cell)}</th>`).join("")}</tr></thead>
        <tbody>${body}</tbody>
        <tfoot><tr>
          <th></th>
          <th>${esc(L("භෞතික ඉලක්කය / ප්‍රගතිය", "பௌதிக இலக்கு / முன்னேற்றம்", "Physical target / progress"))}</th>
          <th>${sheet.physical.plan}</th><th>${sheet.physical.held}</th><th>${esc(officePct(sheet.physical.held, sheet.physical.plan))}</th>
          <th colspan="3"></th>
          <th>${esc(officeMoney(sheet.money.alloc))}</th><th>${esc(officeMoney(sheet.money.spent))}</th>
        </tr></tfoot>
      </table></div>
    </article>
    <form class="classic-form old-plan no-print" id="office-out">
      <h3 class="classic-title">${esc(L("වෙනත් ආයතන වෙත මාරු කළ ප්‍රතිපාදන", "பிற நிறுவனங்களுக்கு மாற்றிய ஒதுக்கீடு", "Allocation transferred to other institutions"))}</h3>
      <p class="muted">${esc(L("වර්ග අතර මාරු කිරීම් ඉහත තීරුවලම පෙනේ. මෙහි ලියන්නේ වෙනත් ආයතනයකට ලබා දුන් මුදල සහ ඒ සඳහා වියදම පමණයි.", "வகைகளுக்கிடையிலான மாற்றம் மேலுள்ள நிரல்களிலேயே தெரியும். இங்கே பிற நிறுவனத்துக்கு வழங்கிய தொகையையும் அதன் செலவையும் எழுதவும்.", "Transfers between categories already show in the columns above. Enter here only money given to another institution, and what was spent from it."))}</p>
      <input type="hidden" name="year" value="${esc(year)}">
      <label class="classic-field"><span>${esc(L("මාරු කළ ප්‍රතිපාදනය (රු.)", "மாற்றிய ஒதுக்கீடு (ரூ.)", "Amount transferred (Rs.)"))}</span><input name="amount" inputmode="decimal" value="${esc(outside.amount || "")}"></label>
      <label class="classic-field"><span>${esc(L("ඒ සඳහා වියදම (රු.)", "அதற்கான செலவு (ரூ.)", "Expenditure from it (Rs.)"))}</span><input name="spent" inputmode="decimal" value="${esc(outside.spent || "")}"></label>
      <label class="classic-field"><span>${esc(L("සටහන", "குறிப்பு", "Note"))}</span><input name="note" maxlength="500" value="${esc(outside.note || "")}"></label>
      <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <div id="form-msg"></div>
    </form>
    <p class="scheduled-copy no-print">
      <button type="button" data-act="office-print">${esc(L("මුද්‍රණය කරන්න", "அச்சிடு", "Print"))}</button>
      <button type="button" data-act="office-csv">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
    </p>`;
}

function saveOfficeCsv() {
  const data = state.officeReport;
  if (!data) return;
  const sheet = officeSheet(data);
  const quote = (cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`;
  const head = ["No.", "Description", "Physical target", "Physical progress", "Percent", "Target officers", "Attended", "Percent", "Allocation", "Expenditure"];
  const push = (lines, no, label, row, people = true) => lines.push([no, label, ...officeFigures(row, people)]);
  const lines = [head];
  sheet.training.forEach((row) => push(lines, row.no, row.label, row));
  push(lines, "", L("උප එකතුව", "உப கூட்டல்", "Subtotal"), sheet.sub);
  push(lines, sheet.meeting.no, sheet.meeting.label, sheet.meeting);
  push(lines, "", L("වෙනත් ආයතන වෙත මාරු කළ ප්‍රතිපාදන", "பிற நிறுவனங்களுக்கு மாற்றிய ஒதுக்கீடு", "Transferred to other institutions"), sheet.outside, false);
  push(lines, "", L("මුළු එකතුව", "மொத்தம்", "Grand total"), sheet.grand);
  const csv = `\uFEFF${lines.map((line) => line.map(quote).join(",")).join("\r\n")}\r\n`;
  saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `karyalaya-pragathi-${data.year}.csv`);
}

function printAheadSheet(selector) {
  const source = document.querySelector(selector);
  if (!source) return;
  let sheet = document.getElementById("ahead-official");
  if (!sheet) {
    sheet = document.createElement("article");
    sheet.id = "ahead-official";
    sheet.className = "ahead-official";
    document.body.appendChild(sheet);
  }
  sheet.innerHTML = source.innerHTML;
  sheet.querySelectorAll(".tamil-tools, .scheduled-copy, button").forEach((node) => node.remove());
  sheet.querySelectorAll("input").forEach((field) => {
    const span = document.createElement("span");
    span.textContent = field.value;
    field.replaceWith(span);
  });
  document.body.classList.add("printing-ahead");
  const done = () => {
    document.body.classList.remove("printing-ahead");
    sheet.innerHTML = "";
  };
  window.addEventListener("afterprint", done, { once: true });
  window.print();
}

function saveAheadCsv() {
  const form = document.getElementById("ahead-form");
  if (!form) return;
  const spec = aheadSpec(form.dataset.kind);
  const pack = tamilFigures(form);
  const quote = (cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`;
  const lines = [["No.", "Programme", "Days", "Place", "Provision", "Expenditure", "Trainees"]];
  pack.rows.forEach((row, index) => {
    lines.push([index + 1, row.name, row.days, row.place, row.money, row.spent, row.people]);
  });
  lines.push(["", "Total", "", "", progressMoney(pack.alloc), progressMoney(pack.spent), String(Math.round(pack.people))]);
  saveBlob(new Blob([`\uFEFF${lines.map((line) => line.map(quote).join(",")).join("\r\n")}\r\n`], { type: "text/csv;charset=utf-8" }), `${spec.file}-${chosenYear()}.csv`);
}

function compareSheet(data) {
  const years = data.years || [];
  const byYear = {};
  (data.items || []).forEach((item) => {
    const pack = officeSheet(item);
    byYear[item.year] = pack;
  });
  const rows = officeRowNames().map(([id, si, ta, en], index) => ({
    no: String(index + 1),
    id,
    label: L(si, ta, en),
  }));
  return { years, byYear, rows };
}

function compareReportHtml(data) {
  const sheet = compareSheet(data);
  const yearHead = sheet.years.map((year) => `<th>${esc(year)}</th>`).join("");
  const physical = sheet.rows.map((row) => {
    const cells = sheet.years.map((year) => {
      const item = (sheet.byYear[year]?.items || []).find((entry) => entry.id === row.id) || {};
      return `<td>${esc(item.held || 0)} / ${esc(item.plan || 0)}</td>`;
    }).join("");
    return `<tr><td>${esc(row.no)}</td><td class="wrap-cell">${esc(row.label)}</td>${cells}</tr>`;
  }).join("");
  const money = sheet.rows.map((row) => {
    const cells = sheet.years.map((year) => {
      const item = (sheet.byYear[year]?.items || []).find((entry) => entry.id === row.id) || {};
      return `<td>${esc(officeMoney(item.spent))} / ${esc(officeMoney(item.alloc))}</td>`;
    }).join("");
    return `<tr><td>${esc(row.no)}</td><td class="wrap-cell">${esc(row.label)}</td>${cells}</tr>`;
  }).join("");
  return `
    <article class="letter office-sheet" id="compare-sheet">
      <h2>${esc(L("වාර්ෂික ප්‍රගති සංසන්දනය", "ஆண்டு முன்னேற்ற ஒப்பீடு", "Yearly progress comparison"))}</h2>
      <p class="name-meta"><span>${esc(L("කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය - වයඹ පළාත", "முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு - வடமேல் மாகாணம்", "Management Development and Training Unit - North Western Province"))}</span>
        <span>${esc(sheet.years[0] || "")} - ${esc(sheet.years[sheet.years.length - 1] || "")}</span></p>
      <h3>${esc(L("භෞතික ප්‍රගතිය (පැවැත්වූ / සැලැස්ම)", "பௌதிக முன்னேற்றம் (நடத்தியவை / திட்டம்)", "Physical progress (held / plan)"))}</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>${esc(L("අංකය", "இல.", "No."))}</th><th>${esc(L("විස්තරය", "விவரம்", "Description"))}</th>${yearHead}</tr></thead>
        <tbody>${physical}</tbody>
      </table></div>
      <h3>${esc(L("මූල්‍ය ප්‍රගතිය (වියදම / ප්‍රතිපාදන)", "நிதி முன்னேற்றம் (செலவு / ஒதுக்கீடு)", "Financial progress (spent / allocation)"))}</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>${esc(L("අංකය", "இல.", "No."))}</th><th>${esc(L("විස්තරය", "விவரம்", "Description"))}</th>${yearHead}</tr></thead>
        <tbody>${money}</tbody>
      </table></div>
    </article>
    <p class="scheduled-copy no-print">
      <button type="button" data-act="compare-print">${esc(L("මුද්‍රණය කරන්න", "அச்சிடு", "Print"))}</button>
      <button type="button" data-act="compare-csv">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button>
    </p>`;
}

function saveCompareCsv() {
  const data = state.compareReport;
  if (!data) return;
  const sheet = compareSheet(data);
  const quote = (cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`;
  const lines = [["Physical held / plan", "Description", ...sheet.years]];
  sheet.rows.forEach((row) => {
    lines.push([row.no, row.label, ...sheet.years.map((year) => {
      const item = (sheet.byYear[year]?.items || []).find((entry) => entry.id === row.id) || {};
      return `${item.held || 0} / ${item.plan || 0}`;
    })]);
  });
  lines.push([]);
  lines.push(["Financial spent / allocation", "Description", ...sheet.years]);
  sheet.rows.forEach((row) => {
    lines.push([row.no, row.label, ...sheet.years.map((year) => {
      const item = (sheet.byYear[year]?.items || []).find((entry) => entry.id === row.id) || {};
      return `${officeMoney(item.spent)} / ${officeMoney(item.alloc)}`;
    })]);
  });
  saveBlob(new Blob([`\uFEFF${lines.map((line) => line.map(quote).join(",")).join("\r\n")}\r\n`], { type: "text/csv;charset=utf-8" }), `varshika-sansandanaya-${data.year}.csv`);
}

async function renderAhead(work) {
  const tabs = aheadTabs();
  const picked = state.query?.get("tab") || "office";
  const current = tabs.some(([id]) => id === picked) ? picked : "office";
  const title = tabs.find(([id]) => id === current)[1];
  const year = chosenYear();
  const bar = `${yearBar()}<div class="desig-tabs ahead-tabs no-print">
      ${tabs.map(([id, label]) => `<a class="${id === current ? "on" : ""}" href="${aheadHref(id)}">${esc(label)}</a>`).join("")}
    </div>`;
  if (current === "office") {
    work.innerHTML = `${bar}<h1>${esc(title)}</h1><p class="muted">Loading…</p>`;
    const data = await api("ahead-office", { query: { year } });
    if (state.module !== "ahead" || (state.query?.get("tab") || "office") !== "office") return;
    state.officeReport = data;
    work.innerHTML = `${bar}${officeReportHtml(data)}`;
    return;
  }
  if (current === "compare") {
    work.innerHTML = `${bar}<h1>${esc(title)}</h1><p class="muted">Loading…</p>`;
    const data = await api("ahead-compare", { query: { year } });
    if (state.module !== "ahead" || (state.query?.get("tab") || "office") !== "compare") return;
    state.compareReport = data;
    work.innerHTML = `${bar}<h1 class="no-print">${esc(title)}</h1>${compareReportHtml(data)}`;
    return;
  }
  const spec = aheadSpec(current);
  work.innerHTML = `${bar}<h1>${esc(title)}</h1><p class="muted">Loading…</p>`;
  const data = await api(spec.action, { query: { year } });
  if (state.module !== "ahead" || (state.query?.get("tab") || "office") !== current) return;
  work.innerHTML = `${bar}<h1>${esc(title)}</h1>${tamilReportHtml(data, spec)}`;
}

function renderReports(work) {
  const picked = state.query?.get("name") || "summary";
  const reports = [
    ["summary", "Summary"],
    ["annual", "Annual training plan"],
    ["budget", "Budget estimate"],
    ["completed", "Completed programmes"],
    ["private", "Private course funding"],
    ["needs", "Training needs"],
    ["applications", "Applications"],
    ["participants", "Participants"],
    ["offices", "Offices by applications"],
  ];
  const offices = state.user.role === "User" ? "" : `<label>Office<select name="office"><option value="">All offices</option>${state.options.offices.map((item) => `<option value="${esc(item.of_name)}">${esc(item.of_name)}</option>`).join("")}</select></label>`;
  work.innerHTML = `
    <h1>Reports</h1>
    <form class="filters" id="report-form">
      <label>Report<select name="name">${reports.map(([value, label]) => `<option value="${value}" ${value === picked ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      <label>Year<input name="year" data-year-pick value="${esc(chosenYear())}"></label>
      ${offices}
      <button class="btn" type="submit">Run</button>
      <button class="btn secondary" type="button" onclick="window.print()">Print</button>
    </form>
    <div id="report"></div>`;
}

function reportTable(data) {
  if (data.plan) {
    return `<article class="card"><h2>${esc(data.title)}</h2>
      <div class="stat-row">
        <div class="stat"><b>${esc(data.plan.programmes)}</b><span>Planned programmes</span></div>
        <div class="stat"><b>${esc(data.plan.budget)}</b><span>Planned budget</span></div>
        <div class="stat"><b>${esc(data.completed.programmes)}</b><span>Completed</span></div>
        <div class="stat"><b>${esc(data.completed.spent)}</b><span>Spent</span></div>
        <div class="stat"><b>${esc(data.completed.people)}</b><span>Actual participants</span></div>
      </div>
      <ul class="list">${(data.byType || []).map((row) => `<li>${esc(row.label)} · ${esc(row.total)}</li>`).join("")}</ul></article>`;
  }
  const columns = data.columns || [];
  const head = columns.map((column) => `<th>${esc(column.replace(/^.*?_/, "").replaceAll("_", " "))}</th>`).join("");
  const body = (data.items || []).map((row) => `<tr>${columns.map((column) => `<td>${esc(fieldText(row[column]))}</td>`).join("")}</tr>`).join("");
  return `<h2>${esc(data.title)}</h2><div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body || "<tr><td>No rows for that year.</td></tr>"}</tbody></table></div>`;
}

function downloadPlanTemplate() {
  const header = ["පුහුණු වැඩසටහන", "දින ගණන", "සේවක සංඛ්‍යාව", "ස්ථානය", "ඉලක්කගත කණ්ඩායම", "ප්‍රතිපාදන"];
  const csv = `\uFEFF${header.map((cell) => `"${cell}"`).join(",")}\r\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "selasma-akurthiya.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportPhoneSheet() {
  const sheet = state.phoneSheet || { officers: [], subjects: [] };
  const left = sheet.officers || [];
  const right = sheet.subjects || [];
  const rows = Math.max(left.length, right.length, 1);
  const cell = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const body = [`<tr><th>${cell(L("තෝරාගත් නිලධාරීන්ගේ දුරකථන අංක", "தேர்ந்த அதிகாரிகளின் எண்கள்", "Selected officers' phone numbers"))}</th><th>${cell(L("විෂය භාර නිලධාරීන්ගේ දුරකථන අංක", "பொறுப்பு அதிகாரிகளின் எண்கள்", "Subject officers' phone numbers"))}</th></tr>`];
  for (let index = 0; index < rows; index += 1) body.push(`<tr><td>${cell(left[index])}</td><td>${cell(right[index])}</td></tr>`);
  const html = `<html><head><meta charset="utf-8"></head><body><table>${body.join("")}</table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "durakathana-anka.xls";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function onClick(event) {
  const act = event.target.closest("[data-act]")?.dataset;
  if (!act) return;
  if (act.act === "pace-jump") {
    event.preventDefault();
    document.getElementById(act.jump)?.scrollIntoView({ block: "start" });
    return;
  }
  if (act.act === "pace-tab") {
    event.preventDefault();
    const year = document.querySelector("#pace-year")?.value || chosenYear();
    rememberYear(year);
    location.hash = paceHash(year, act.tab, {
      until: document.querySelector("#pace-date")?.value || state.query.get("until") || "",
    });
    return;
  }
  if (act.act === "pace-show-pdf") {
    event.preventDefault();
    const view = state.paceView;
    if (!view) return;
    const lines = (view.categories || []).map((category) => {
      const cell = view.cut.all[category.id] || {};
      const left = (view.alloc[category.id] || 0) - (cell.spent || 0);
      return `${category.label}: ප්‍රතිපාදන ${progressMoney(view.alloc[category.id])}, වියදම ${progressMoney(cell.spent)}, වැඩසටහන් ${cell.held || 0}, සහභාගී ${Math.round(cell.people || 0)}, ඉතිරිය ${progressMoney(left)}`;
    });
    const pages = [
      { title: `${view.year} ප්‍රගති වාර්තාව`, lines: [paceDateLabel(view.until), `ප්‍රතිපාදන ${progressMoney(view.allocTotal)}`, `වියදම ${progressMoney(view.spentTotal)}`, `වැඩසටහන් ${view.heldTotal}`, `සහභාගී ${Math.round(view.peopleTotal)}`, `ඉතිරිය ${progressMoney(view.leftTotal)}`] },
      { title: "විශ්ලේෂණය", lines },
      { title: "ප්‍රතිපාදන බෙදීම", lines: [], slices: state.pacePies?.alloc || [] },
      { title: "වියදම බෙදීම", lines: [], slices: state.pacePies?.spent || [] },
      { title: "ප්‍රතිපාදන සහ වියදම", lines: [], bars: state.paceBars?.money },
      { title: "මාස අනුව වැඩසටහන්", lines: [], bars: state.paceBars?.months },
    ];
    paceDownload(pages, `pace-${view.year}.pdf`, true).catch((error) => alert(error.message));
    return;
  }
  if (act.act === "pace-calc") {
    event.preventDefault();
    const year = document.querySelector("#pace-year")?.value || chosenYear();
    api("pace-calc", { method: "POST", body: { year } }).then(() => route()).catch((error) => alert(error.message));
    return;
  }
  if (act.act === "pace-pdf") {
    event.preventDefault();
    const data = state.paceData;
    if (!data) return;
    const working = paceWorking(data);
    const copy = document.querySelector(".pace-copy")?.textContent || "";
    const lines = [`මුළු ප්‍රතිපාදනය ${progressMoney(working.total)}.`, copy];
    (data.categories || []).forEach((category) => {
      const left = document.querySelector(`[data-left="${category.id}"]`)?.textContent || "";
      const used = document.querySelector(`[data-used="${category.id}"]`)?.textContent || "";
      lines.push(`${category.label}: ප්‍රතිපාදන ${progressMoney(working.amounts[category.id])}, වියදම ${used}, ඉතිරිය ${left}`);
    });
    const month = document.querySelector("#pace-month")?.value || "";
    document.querySelectorAll("[data-pace-row]").forEach((row) => {
      if (row.hidden) return;
      const cells = [...row.querySelectorAll("td")].map((cell) => cell.querySelector("input")?.value || cell.textContent.trim());
      lines.push(cells.join(" · "));
    });
    const chunks = [];
    for (let index = 0; index < lines.length; index += 24) {
      chunks.push({ title: index ? "මාසික වාර්ෂික ප්‍රගතිය" : `මාසික වාර්ෂික ප්‍රගතිය · ${data.year}${month ? " · " + month : ""}`, lines: lines.slice(index, index + 24), slices: index ? null : state.pacePies?.alloc });
    }
    paceDownload(chunks.length ? chunks : [{ title: "මාසික වාර්ෂික ප්‍රගතිය", lines, slices: state.pacePies?.alloc }], `pragathi-${data.year}.pdf`, false).catch((error) => alert(error.message));
    return;
  }
  if (act.act === "pace-slide-pdf") {
    event.preventDefault();
    const data = state.paceData;
    if (!data) return;
    const pages = [...document.querySelectorAll(".pace-slide")].map((slide) => ({
      title: slide.querySelector(".pace-slide-title")?.textContent || "",
      lines: [slide.querySelector(".pace-slide-body")?.textContent || ""],
      slices: state.pacePies?.[slide.querySelector("canvas[data-pie]")?.dataset.pie] || null,
    }));
    paceDownload(pages, `pragathi-presentation-${data.year}.pdf`, true).catch((error) => alert(error.message));
    return;
  }
  if (act.act === "pace-slides-save") {
    event.preventDefault();
    const year = document.querySelector("#pace-year")?.value || chosenYear();
    const until = document.querySelector("#pace-date")?.value || "";
    const slides = [...document.querySelectorAll(".pace-slide")].map((slide) => ({
      slot: slide.dataset.slot,
      title: slide.querySelector(".pace-slide-title")?.textContent || "",
      body: slide.querySelector(".pace-slide-body")?.textContent || "",
    }));
    api("pace-slides-save", { method: "POST", body: { year, until, slides } })
      .then(() => alert("සුරැකුණා."))
      .catch((error) => alert(error.message));
    return;
  }
  if (act.act === "person-tab") {
    event.preventDefault();
    const year = document.querySelector("#person-year")?.value || chosenYear();
    rememberYear(year);
    location.hash = `#console/person?year=${encodeURIComponent(year)}&tab=${encodeURIComponent(act.tab || "summary")}`;
    return;
  }
  if (act.act === "lang") {
    state.lang = act.lang;
    localStorage.setItem("mdtu-lang", state.lang);
    applyChrome();
    paintAccount();
    route();
  }
  if (act.act === "slide-drop") {
    event.preventDefault();
    (state.slidePicks || []).splice(Number(act.index), 1);
    paintSlidePicks();
    return;
  }
  if (act.act === "theme") {
    state.theme = act.theme;
    localStorage.setItem("mdtu-theme", state.theme);
    applyChrome();
  }
  if (act.act === "letter-pdf" || act.act === "letter-image") {
    event.preventDefault();
    saveLetter(act.act === "letter-pdf" ? "pdf" : "image").catch((error) => alert(error.message));
  }
  if (act.act === "format-pdf") {
    event.preventDefault();
    const form = document.querySelector("#module-format-form");
    if (!form) return;
    saveModulePdf(sheetPayload(form)).catch((error) => alert(error.message));
  }
  if (act.act === "module-excel") {
    event.preventDefault();
    const form = document.querySelector("#module-format-form");
    const count = form ? form.querySelectorAll(".format-day").length : 10;
    downloadModuleExcel(count || 10);
  }
  if (act.act === "sheet-add") {
    event.preventDefault();
    const body = event.target.closest(".format-day")?.querySelector("tbody");
    if (body) body.insertAdjacentHTML("beforeend", sheetSessionRow({}));
  }
  if (act.act === "sheet-drop") {
    event.preventDefault();
    const row = event.target.closest("tr");
    const body = row?.parentElement;
    if (!row || !body) return;
    if (body.querySelectorAll("tr").length > 1) row.remove();
    else row.querySelectorAll("input, textarea").forEach((field) => { field.value = ""; });
  }
  if (act.act === "module-pdf") {
    event.preventDefault();
    api("module", { query: { id: act.id } }).then(saveModulePdf).catch((error) => alert(error.message));
  }
  if (act.act === "module-from-programme") {
    event.preventDefault();
    const programme = (state.moduleProgrammes || [])[Number(act.index)];
    const form = document.querySelector("#module-gemini-form");
    if (!programme || !form) return;
    const title = form.querySelector("[name=title]");
    const atp = form.querySelector("[name=atp]");
    const box = form.querySelector("#module-days");
    if (title) title.value = programme.name || "";
    if (atp) atp.value = programme.id || "";
    const count = Math.max(1, Math.min(60, Number(programme.days) || 1));
    if (box) box.innerHTML = Array.from({ length: count }, () => moduleDayBlock({ title: "", body: "" })).join("");
    renumberModuleDays(form);
    form.scrollIntoView({ block: "start" });
  }
  if (act.act === "module-add-day") {
    event.preventDefault();
    const form = event.target.closest("form");
    const box = form?.querySelector("#module-days");
    if (!box) return;
    box.insertAdjacentHTML("beforeend", moduleDayBlock({ title: "", body: "" }));
    renumberModuleDays(form);
  }
  if (act.act === "module-drop-day") {
    event.preventDefault();
    const form = event.target.closest("form");
    const block = event.target.closest(".module-day");
    if (!form || !block || form.querySelectorAll(".module-day").length < 2) return;
    block.remove();
    renumberModuleDays(form);
  }
  if (act.act === "copy-link") {
    event.preventDefault();
    const text = act.link || "";
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
  }
  if (act.act === "total-calc") {
    event.preventDefault();
    const year = $("#total-year [name=year]")?.value || "";
    api("total-calc", { method: "POST", body: { year } }).then(() => route()).catch((error) => alert(error.message));
  }
  if (act.act === "split-pdf") {
    event.preventDefault();
    splitPdf().catch((error) => alert(error.message));
  }
  if (act.act === "plan-template") {
    event.preventDefault();
    downloadPlanTemplate();
  }
  if (act.act === "message-send") {
    event.preventDefault();
    const atp = state.query?.get("atp") || "";
    const slot = $("#form-msg");
    if (act.channel === "whatsapp") {
      openWhatsAppWeb(act.kind);
      return;
    }
    api("messages-send", { method: "POST", body: { atp, kind: act.kind, channel: act.channel } }).then((saved) => {
      if (slot) {
        slot.innerHTML = `<div class="ok">${esc(L("ගියා ", "அனுப்பியது ", "Sent "))}${esc(saved.sent)}. ${esc(L("නැති අය ", "இல்லாதவர்கள் ", "Missing "))}${esc(saved.skipped)}. ${esc(L("ගියේ නැත ", "போகவில்லை ", "Failed "))}${esc(saved.failed)}.</div>`;
      }
    }).catch((error) => {
      if (slot) slot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
      else alert(error.message);
    });
  }
  if (act.act === "eval-full") {
    event.preventDefault();
    document.querySelector(".eval-board")?.requestFullscreen?.();
  }
  if (act.act === "eval-print") {
    event.preventDefault();
    document.body.classList.add("printing-eval");
    window.print();
    window.addEventListener("afterprint", () => document.body.classList.remove("printing-eval"), { once: true });
  }
  if (act.act === "eval-import") {
    event.preventDefault();
    const copy = $("#eval-import")?.value || "";
    const atp = state.query?.get("atp") || "";
    if (!copy) return;
    api("eval-get", { query: { atp, copy } }).then((data) => {
      const box = $("#eval-questions");
      const brought = data.copy || [];
      if (box) box.innerHTML = evalQuestionsHtml(brought);
      const slot = $("#form-msg");
      if (slot) {
        slot.innerHTML = brought.length
          ? `<div class="ok">${esc(L("ප්‍රශ්න ආවා. සුරකින්න ඔබන්න.", "கேள்விகள் வந்தன. சேமிக்கவும்.", "The questions are here. Press save."))}</div>`
          : `<div class="error">${esc(L("ඒ පුහුණුවේ ප්‍රශ්න නැත.", "அந்தப் பயிற்சியில் கேள்விகள் இல்லை.", "That programme has no questions."))}</div>`;
      }
    }).catch((error) => alert(error.message));
  }
  if (act.act === "quiz-choice") {
    event.preventDefault();
    const now = state.quizNow || {};
    const button = event.target.closest("[data-letter]");
    if (!now.token || !now.nid || !button) return;
    button.disabled = true;
    api("eval-answer", {
      method: "POST",
      body: { token: now.token, kind: now.kind, nid: now.nid, no: button.dataset.no, choice: button.dataset.letter },
    }).then(() => api("eval-state", { query: { token: now.token, kind: now.kind, nid: now.nid } })).then((status) => {
      paintQuizQuestion(now.token, now.kind, now.nid, now.opened, status);
    }).catch((error) => {
      button.disabled = false;
      alert(error.message);
    });
  }
  if (act.act === "apply-go") {
    const plan = (state.applyPlans || []).find((item) => String(item.atp_id) === String(act.id));
    if (plan) openApplyForm(plan);
  }
  if (act.act === "apply-cancel") paintApplyPick($("#work"), "", state.applyNid || "");
  if (act.act === "clear-apply-date") {
    const field = document.querySelector("#annual-form [name=atp_lastdateapply]");
    if (field) {
      field.value = "";
      field.dataset.touched = "1";
      field.dataset.original = "";
    }
  }
  if (act.act === "add-plan-dates") appendPlanDates(planCount($("#plan-date-count")));
  if (act.act === "add-plan-people") appendPlanPeople(planCount($("#plan-people-count")));
  if (act.act === "add-plan-staff") appendPlanStaff(planCount($("#plan-staff-count")));
  if (act.act === "estimate-add-lecturer") {
    event.preventDefault();
    addEstimateLecturer();
  }
  if (act.act === "estimate-drop-lecturer") {
    event.preventDefault();
    event.target.closest(".est-lecturer")?.remove();
    renumberEstimateLecturers();
    refreshEstimate(document.querySelector(".estimate-form"));
  }
  if (act.act === "estimate-save") {
    event.preventDefault();
    const form = document.querySelector(".estimate-form");
    saveEstimate(form).then(() => {
      const msg = document.getElementById("estimate-save-msg");
      if (msg) msg.innerHTML = `<span class="ok">${esc(L("සුරැකුණා. Edit estimate ලැයිස්තුවේ පේනවා.", "சேமித்தது. Edit estimate பட்டியலில் தெரியும்.", "Saved. It appears in the Edit estimate list."))}</span>`;
    }).catch((error) => alert(error.message));
  }
  if (act.act === "estimate-print") {
    event.preventDefault();
    printEstimate().catch((error) => alert(error.message));
  }
  if (act.act === "estimate-add-dates") {
    event.preventDefault();
    appendEstimateDates(planCount(document.getElementById("estimate-date-count")));
  }
  if (act.act === "estimate-drop-date") {
    event.preventDefault();
    const row = event.target.closest(".est-date");
    const dates = [...document.querySelectorAll("#estimate-dates input")].map((field) => field.value || "");
    const index = [...document.querySelectorAll("#estimate-dates .est-date")].indexOf(row);
    if (index > 0) {
      dates.splice(index, 1);
      paintEstimateDates(dates);
    }
  }
  if (act.act === "drop-plan-date") {
    const dates = [...document.querySelectorAll("#plan-dates input")].map((field) => field.value || "");
    dates.splice(Number(act.index), 1);
    paintPlanDates(dates.length ? dates : [""]);
  }
  if (act.act === "drop-plan-person") {
    const names = [...document.querySelectorAll("#plan-people select")].map((field) => field.value || "");
    names.splice(Number(act.index), 1);
    paintPlanPeople(names);
  }
  if (act.act === "drop-plan-staff") {
    const names = [...document.querySelectorAll("#plan-staff input")].map((field) => field.value || "");
    names.splice(Number(act.index), 1);
    paintPlanStaff(names);
  }
  if (act.act === "save-plan") {
    const button = event.target.closest("[data-act=save-plan]");
    const changed = [...document.querySelectorAll("#work .plan-tick")].filter((box) => (box.checked ? "1" : "0") !== box.dataset.on);
    if (!changed.length) {
      alert(L("පළමුව ටික් එක දාන්න, නැත්නම් අයින් කරන්න.", "முதலில் குறியை மாற்றவும்.", "Tick or untick a programme first."));
      return;
    }
    if (button) button.disabled = true;
    try {
      for (const box of changed) await setPlanMembership(box.value, box.checked);
      alert(L("සැලස්ම යාවත්කාලීන කළා. ටික් තියෙන ඒවා සැලසුමේ ඉන්නවා. ටික් නැති ඒවා සැලසුමෙන් අයින් වෙනවා.", "திட்டம் புதுப்பிக்கப்பட்டது.", "The plan was updated. Ticked programmes stay in. Unticked ones leave."));
      route();
    } catch (error) {
      if (button) button.disabled = false;
      alert(error.message);
    }
  }
  if (act.act === "print-letter") {
    printOfficerLetter(act.nid, act.atp).catch((error) => {
      const paper = $("#paper");
      if (paper) paper.innerHTML = `<div class="error">${esc(error.message)}</div>`;
    });
  }
  if (act.act === "chat-open") {
    const panel = document.querySelector(".helper-panel");
    if (panel) {
      panel.hidden = false;
      document.querySelector("#helper-form input")?.focus();
    }
  }
  if (act.act === "chat-close") {
    const panel = document.querySelector(".helper-panel");
    if (panel) panel.hidden = true;
    clearInterval(state.adminTimer);
  }
  if (act.act === "chat-mode") {
    event.preventDefault();
    showChatPane(act.mode || "help");
  }
  if (act.act === "admin-open") {
    event.preventDefault();
    loadAdminThread(act.id || "");
  }
  if (act.act === "admin-back") {
    event.preventDefault();
    state.adminThread = 0;
    const reply = document.getElementById("admin-reply-form");
    if (reply) reply.hidden = true;
    loadAdminInbox();
  }
  if (act.act === "login-open") openLogin();
  if (act.act === "leader-open") openLeader();
  if (act.act === "subject-add") addSubjectRow();
  if (act.act === "subject-remove") {
    const row = event.target.closest(".subject-row");
    row?.remove();
    if (!$("#subject-rows")?.querySelector(".subject-row")) paintSubjects(null);
  }
  if (act.act === "close") $("#drawer")?.remove();
  if (act.act === "logout") {
    await api("logout", { method: "POST", body: {} });
    location.href = "index.php";
  }
  if (act.act === "create") openEditor(null);
  if (act.act === "edit") {
    const rows = JSON.parse($("#work").dataset.rows || "[]");
    const primary = state.schema.primary;
    openEditor(rows.find((row) => String(row[primary]) === act.id));
  }
  if (act.act === "classic-remove" && confirm(classicPages()[act.table].remove())) {
    await api("delete", { method: "POST", body: { table: act.table, id: act.id } });
    state.options = await api("options");
    route();
  }
  if (act.act === "remove" && confirm("Delete this record?")) {
    await api("delete", { method: "POST", body: { table: $("#work").dataset.table, id: act.id } });
    route();
  }
  if (act.act === "page") {
    state.tablePage = Number(act.page);
    const item = state.catalog.find((entry) => entry.id === state.module);
    renderModule(item);
  }
  if (act.act === "annual-remove" && confirm(L("හිස් නමක් ඇති මෙම වැඩසටහන ඉවත් කරන්නද?", "பெயர் இல்லாத இந்தப் பயிற்சியை நீக்கவா?", "Remove this programme with an empty name?"))) {
    try {
      await api("delete", { method: "POST", body: { table: "cp_atp", id: act.id } });
      route();
    } catch (error) {
      alert(error.message);
    }
  }
  if (act.act === "staff-drop") {
    await api("delete", { method: "POST", body: { table: "cp_staff", id: act.id } });
    location.hash = "#console/cp_staff?tab=all";
    route();
  }
  if (act.act === "officer-add") {
    try {
      await api("save", { method: "POST", body: { table: "cp_trainingofficers", data: { tro_nid: act.nid } } });
      location.hash = "#console/cp_trainingofficers?tab=all";
      route();
    } catch (error) {
      alert(error.message);
    }
  }
  if (act.act === "officer-remove" && confirm(L("මෙම පුහුණු නිලධාරියා ඉවත් කරන්නද?", "இந்தப் பயிற்சி அதிகாரியை நீக்கவா?", "Remove this training officer?"))) {
    await api("delete", { method: "POST", body: { table: "cp_trainingofficers", id: act.id } });
    route();
  }
  if (act.act === "unselect-officer" && confirm(L("මෙම නිලධාරියා තෝරාගත් ලැයිස්තුවෙන් ඉවත් කරන්නද?", "இவரைத் தேர்ந்த பட்டியலிலிருந்து நீக்கவா?", "Remove this officer from the selected list?"))) {
    await api("select-applicant", { method: "POST", body: { id: act.id, selected: NO } });
    route();
  }
  if (act.act === "admin-drop" && confirm(L("මෙම අයදුම්පත මකන්නද? තෝරාගත් නමක් වුවද මැකෙනවා.", "இந்த விண்ணப்பத்தை நீக்கவா?", "Delete this application, even if the officer was selected?"))) {
    await api("delete-applicant", { method: "POST", body: { id: act.id } });
    route();
  }
  if (act.act === "more-nids") {
    event.preventDefault();
    const grid = document.getElementById("nid-grid");
    if (!grid) return;
    const have = grid.querySelectorAll("input").length;
    if (have >= 1000) {
      alert(L("නිලධාරීන් 1000කට වඩා එකතු කරන්න බැහැ.", "1000 அதிகாரிகளுக்கு மேல் சேர்க்க முடியாது.", "You cannot add more than 1000 officers."));
      return;
    }
    grid.insertAdjacentHTML("beforeend", nidBoxes(Math.min(10, 1000 - have)));
  }
  if (act.act === "food-add") {
    event.preventDefault();
    const list = document.getElementById("food-lines");
    if (!list || list.querySelectorAll(".food-line").length >= 40) return;
    list.insertAdjacentHTML("beforeend", foodBillRow("", ""));
  }
  if (act.act === "office-add") {
    event.preventDefault();
    const list = document.getElementById("office-ids");
    if (!list || list.querySelectorAll(".food-line").length >= 20) return;
    list.insertAdjacentHTML("beforeend", officePersonRow({ nid: "", name: "" }, officeChoicesFromPage()));
  }
  if (act.act === "office-drop") {
    event.preventDefault();
    const form = document.getElementById("allowance-form");
    event.target.closest(".food-line")?.remove();
    const list = document.getElementById("office-ids");
    if (list && !list.querySelector(".food-line")) list.insertAdjacentHTML("beforeend", officePersonRow({ nid: "", name: "" }, officeChoicesFromPage()));
    paintOfficeAmount(form);
  }
  if (act.act === "food-drop") {
    event.preventDefault();
    const form = document.getElementById("foodbill-form");
    event.target.closest(".food-line")?.remove();
    const list = document.getElementById("food-lines");
    if (list && !list.querySelector(".food-line")) list.insertAdjacentHTML("beforeend", foodBillRow("", ""));
    paintFoodBill(form, true);
  }
  if (act.act === "food-print") {
    event.preventDefault();
    printFoodBill();
  }
  if (act.act === "settle-pdf") {
    event.preventDefault();
    saveSettlePdf().catch((error) => alert(error.message));
  }
  if (act.act === "tamil-detail-pdf" || act.act === "tamil-summary-pdf") {
    event.preventDefault();
    tamilPdf(act.act === "tamil-summary-pdf" ? "summary" : "detail").catch((error) => alert(error.message));
  }
  if (act.act === "attendance-format") {
    event.preventDefault();
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="නිලධාරීන්"><Table>
<Row><Cell><Data ss:Type="String">ජා.හැ.අංකය</Data></Cell></Row>
</Table></Worksheet>
</Workbook>`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([xml], { type: "application/vnd.ms-excel" }));
    link.download = "download-format.xls";
    link.click();
    URL.revokeObjectURL(link.href);
  }
  if (act.act === "drop-person" && confirm(L("නොපැමිණි නිසා මෙම නිලධාරියා ඉවත් කරන්නද?", "வராததால் இவரை நீக்கவா?", "Remove this officer because they did not attend?"))) {
    await api("drop-participant", { method: "POST", body: { atp_id: act.atp, nid: act.nid } });
    route();
  }
  if (act.act === "candidate-phones") {
    const phoneSlot = document.getElementById("phone-paper");
    const id = act.atp || "";
    if (!phoneSlot || !id) return;
    try {
      const data = await api("signsheet", { query: { id } });
      state.phoneSheet = {
        officers: data.participantPhones || [],
        subjects: data.officePhones || [],
      };
      const line = (numbers) => esc((numbers || []).join(", ") || L("අංක නොමැත.", "எண்கள் இல்லை.", "No numbers."));
      phoneSlot.innerHTML = `<article class="phone-sheet">
        <h2>${esc(L("තෝරාගත් නිලධාරීන්ගේ දුරකථන අංක", "தேர்ந்த அதிகாரிகளின் எண்கள்", "Selected officers' phone numbers"))}</h2>
        <p>${line(state.phoneSheet.officers)}</p>
        <h2>${esc(L("එම නිලධාරීන් සිටින කාර්යාලවල විෂය භාර නිලධාරීන්ගේ දුරකථන අංක", "அந்த அலுவலகப் பொறுப்பு அதிகாரிகளின் எண்கள்", "Subject officers' phone numbers for those offices"))}</h2>
        <p>${line(state.phoneSheet.subjects)}</p>
        <p class="phone-export"><button type="button" data-act="export-phones">${esc(L("Excel බාගත කරන්න", "Excel பதிவிறக்கம்", "Download Excel"))}</button></p>
      </article>`;
    } catch (error) {
      phoneSlot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
    }
  }
  if (act.act === "sign-pdf") saveSignPdf().catch((error) => alert(error.message));
  if (act.act === "panel-pdf") savePanelPdf().catch((error) => alert(error.message));
  if (act.act === "namelist-pdf") saveNameListPdf().catch((error) => alert(error.message));
  if (act.act === "attended-pdf") saveAttendedPdf().catch((error) => alert(error.message));
  if (act.act === "provision-send-delete") {
    if (!confirm(L("මෙම ප්‍රතිපාදන මාරු කිරීම මකන්නද?", "இந்த மாற்றத்தை நீக்கவா?", "Delete this transfer?"))) return;
    const year = document.querySelector("#provision-send-form [name=year]")?.value || state.query?.get("year") || chosenYear();
    api("provision-send-delete", { method: "POST", body: { id: act.id } })
      .then(() => renderProvisionMove($("#work"), year))
      .catch((error) => alert(error.message));
  }
  if (act.act === "provision-send-csv") {
    const data = state.provisionSends;
    if (!data) return;
    const quote = (cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`;
    const head = ["#", "සැලසුම් අංකය", "පුහුණු වැඩසටහන", "මාරු කළ ආයතනය", "මාරු කළ දිනය", "මුදල", "වැඩසටහන් වර්ගය", "ලිපියේ අංකය", "දිනය"];
    const lines = [head];
    (data.items || []).forEach((row, index) => {
      lines.push([index + 1, row.plan, row.name, row.office, row.moved, row.amount, provisionSendKindLabel(row.kind), row.letter, row.date]);
    });
    lines.push(["", "", "", "", "එකතුව", data.total || "0.00", "", "", ""]);
    saveBlob(new Blob([`\uFEFF${lines.map((line) => line.map(quote).join(",")).join("\r\n")}\r\n`], { type: "text/csv;charset=utf-8" }), `prathipadana-maru-${data.year}.csv`);
  }
  if (act.act === "provision-move-delete") {
    if (!confirm(L("මෙම ප්‍රතිපාදන මාරු කිරීම මකන්නද?", "இந்த மாற்றத்தை நீக்கவா?", "Delete this transfer?"))) return;
    const year = document.querySelector("#provision-move-form [name=year], #provision-add-form [name=year]")?.value || state.query?.get("year") || chosenYear();
    api("provision-move-delete", { method: "POST", body: { id: act.id } })
      .then(() => renderProvisionMove($("#work"), year))
      .catch((error) => alert(error.message));
  }
  if (act.act === "attended-csv") saveAttendedCsv();
  if (act.act === "office-csv") saveOfficeCsv();
  if (act.act === "office-print") printAheadSheet("#office-sheet");
  if (act.act === "ahead-csv") saveAheadCsv();
  if (act.act === "ahead-print") printAheadSheet("#ahead-form");
  if (act.act === "compare-csv") saveCompareCsv();
  if (act.act === "compare-print") printAheadSheet("#compare-sheet");
  if (act.act === "attended-clear") location.hash = `#console/attended?year=${chosenYear()}`;
  if (act.act === "build-sign") {
    const id = document.querySelector("#sign-form [name=id]")?.value || "";
    if (!id) return;
    paintSignSheet(id);
  }
  if (act.act === "export-phones") exportPhoneSheet();
  if (act.act === "export") api("export", { query: { table: act.table } }).catch((error) => alert(error.message));
  if (act.act === "pick") {
    await api("select-applicant", { method: "POST", body: { id: act.id, selected: act.selected } });
    route();
  }
  if (act.act === "to-plan") {
    const rows = JSON.parse($("#work").dataset.rows || "[]");
    const need = rows.find((row) => String(row.req_id) === act.id);
    await addNeedToPlan(need);
    route();
  }
}

function useLeaderPhoto(img) {
  const probe = new Image();
  probe.onload = () => { img.src = img.dataset.photo; };
  probe.src = img.dataset.photo;
}

function leaderPhotoHtml(leader, alt) {
  const photo = String(leader?.photoUrl || "").trim();
  if (photo) return `<img src="${esc(photo)}" alt="${esc(alt || "")}">`;
  return `<img src="images/peththawadu.svg" alt="${esc(alt || "")}" data-photo="images/peththawadu.jpg">`;
}

function openLeader() {
  if ($("#leader-sheet")) return;
  const leader = state.leader || {};
  const leaderName = leader.display || "එස්.එම්.පෙත්තාවඩු මහත්මිය";
  const title = L("නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)", "துணை பிரதம செயலாளர் (பயிற்சி)", "Deputy Chief Secretary (Training)");
  const body = L(
    "මෙම ඒකකය නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු) ගේ නායකත්වය යටතේ ක්‍රියාත්මක වේ. සහකාර ප්‍රධාන ලේකම් (පුහුණු), පරිපාලන නිලධාරී සහ කැපවූ සහායක කාර්ය මණ්ඩලයේ මගපෙන්වීම යටතේ සේවා සපයයි.\n\nඅපගේ පුහුණු වැඩසටහන් වලින් 90%ක් පමණ MDTU හි අනුබද්ධ ශාඛාවක් වන වාරියපොල පුහුණු ආයතනයේ පවත්වනු ලැබේ.",
    "இந்த அலகு துணை பிரதம செயலாளர் (பயிற்சி) தலைமையில் இயங்குகிறது. உதவி பிரதம செயலாளர் (பயிற்சி), நிர்வாக அதிகாரி மற்றும் அர்ப்பணிப்புள்ள உதவிப் பணியாளர்களின் வழிகாட்டுதலுடன் சேவை செய்கிறது.\n\nஎமது பயிற்சிகளில் சுமார் 90% MDTU இன் இணைக் கிளையான வாரியபொல பயிற்சி நிறுவனத்தில் நடைபெறுகிறது.",
    "The Unit operates under the leadership of the Deputy Chief Secretary (Training) and provides its services under the guidance of staff officers, including the Assistant Chief Secretary (Training) and the Administrative Officer, along with dedicated supporting staff.\n\nApproximately 90% of our training programs are conducted at the Wariyapola Training Institute, which functions as an affiliated branch of the MDTU."
  );
  document.body.insertAdjacentHTML("beforeend", `
    <div class="drawer" id="drawer">
      <article class="sheet leader-sheet" id="leader-sheet">
        ${leaderPhotoHtml(leader, leaderName)}
        <h2>${esc(leaderName)}</h2>
        <p class="role">${esc(title)}</p>
        <p>${esc(body).replaceAll("\n", "<br>")}</p>
        <p><button class="btn secondary" type="button" data-act="close">${esc(L("වසන්න", "மூடு", "Close"))}</button></p>
      </article>
    </div>`);
  document.querySelectorAll("#leader-sheet [data-photo]").forEach(useLeaderPhoto);
}

function openLogin() {
  const existing = $("#login-form");
  if (existing) {
    existing.querySelector("input")?.focus();
    return;
  }
  document.body.insertAdjacentHTML("beforeend", `
    <div class="drawer" id="drawer">
      <form class="sheet" id="login-form">
        <h2>${esc(t("signin"))}</h2>
        <div id="form-msg"></div>
        <label>${esc(t("username"))}<input name="username" autocomplete="username" required></label>
        <label>${esc(t("password"))}<input name="password" type="password" autocomplete="current-password" required></label>
        <p><button class="btn" type="submit">${esc(t("enter"))}</button> <button class="btn secondary" type="button" data-act="close">Close</button></p>
      </form>
    </div>`);
}

async function onSubmit(event) {
  const form = event.target;
  if (form.id === "settle-person") {
    event.preventDefault();
    const nid = String(new FormData(form).get("nid") || "").trim();
    const year = chosenYear();
    location.hash = `#console/settle?year=${encodeURIComponent(year)}&tab=pay&view=resource${nid ? `&nid=${encodeURIComponent(nid)}` : ""}`;
    return;
  }
  if (form.id === "admin-chat-form") {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form));
    const text = String(body.text || "").trim();
    if (!text) return;
    if (!state.user) {
      const nid = String(body.nid || "").trim();
      const phone = String(body.phone || "").trim();
      if (!nid || !phone) return;
      localStorage.setItem("mdtu-admin-chat", JSON.stringify({ nid, phone }));
    }
    form.querySelector("[name=text]").value = "";
    try {
      await api("admin-chat-send", { method: "POST", body });
      loadMyAdminChat();
    } catch (error) {
      const slot = document.getElementById("admin-log");
      if (slot) paintAdminLines(slot, [], "person", error.message);
    }
    return;
  }
  if (form.id === "admin-reply-form") {
    event.preventDefault();
    const text = String(new FormData(form).get("text") || "").trim();
    if (!text || !state.adminThread) return;
    form.querySelector("[name=text]").value = "";
    try {
      await api("admin-chat-send", { method: "POST", body: { text, thread: state.adminThread } });
      loadAdminThread(state.adminThread);
    } catch (error) {
      alert(error.message);
    }
    return;
  }
  if (form.id === "ahead-form") {
    event.preventDefault();
    const pack = tamilFigures(form);
    const note = document.getElementById("tamil-note");
    try {
      await api(aheadSpec(form.dataset.kind).save, {
        method: "POST",
        body: {
          year: chosenYear(),
          rows: pack.rows.map((row) => ({ id: row.id, money: row.money, spent: row.spent, people: row.people })),
        },
      });
      if (note) note.textContent = L("සුරකින ලදී", "சேமிக்கப்பட்டது", "Saved");
    } catch (error) {
      if (note) note.textContent = "";
      alert(error.message);
    }
    return;
  }
  if (form.id === "helper-form") {
    event.preventDefault();
    const input = form.querySelector("[name=question]");
    const question = String(input.value || "").trim();
    if (!question) return;
    input.value = "";
    chatSay("mine", question);
    try {
      const saved = await api("chat", { method: "POST", body: { question, lang: state.lang } });
      chatSay("bot", saved.reply || "");
    } catch (error) {
      chatSay("bot", error.message);
    }
  }
  if (form.id === "login-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const data = await api("login", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      state.user = data.user;
      state.leaving = false;
      state.catalog = [];
      armIdle();
      $("#drawer")?.remove();
      paintAccount();
      location.hash = "#console/dashboard";
      route();
    });
  }
  if (form.id === "comment-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      await api("comment", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      form.reset();
      $("#comment-msg").innerHTML = '<div class="ok">Thank you. The suggestion was sent.</div>';
    });
  }
  if (form.id === "classic-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const data = Object.fromEntries(new FormData(form));
      if (String(data.req_other || "").trim()) data.req_training = String(data.req_other).trim();
      delete data.req_other;
      if (form.dataset.table === "cp_trrequirements" && !String(data.req_training || "").trim()) {
        throw new Error(L("පුහුණු අවශ්‍යතාව තෝරන්න.", "பயிற்சி தேவையைத் தேர்ந்தெடுக்கவும்.", "Choose a training need."));
      }
      if (form.dataset.table === "cp_trrequirements" && !data.req_adddate) data.req_adddate = new Date().toISOString().slice(0, 10);
      await api("save", { method: "POST", body: { table: form.dataset.table, data } });
      state.options = await api("options");
      location.hash = `#console/${form.dataset.table}?tab=all`;
      route();
    });
  }
  if (form.id === "slide-many-form") {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const slot = form.querySelector("#form-msg");
    await submitMessage(form, async () => {
      const files = state.slidePicks || [];
      if (!files.length) throw new Error(L("පළමුව ඡායාරූප එකතු කරන්න.", "முதலில் படங்களைச் சேர்க்கவும்.", "Add some photographs first."));
      const status = form.elements.slp_status.value;
      const thumbs = [...form.querySelectorAll(".slide-thumb")];
      const failed = [];
      const left = [];
      button.disabled = true;
      try {
        for (let i = 0; i < files.length; i += 1) {
          slot.innerHTML = `<div class="ok">${esc(L(`${files.length} න් ${i + 1} උඩුගත වෙමින්…`, `${files.length} இல் ${i + 1} பதிவேற்றப்படுகிறது…`, `Uploading ${i + 1} of ${files.length}…`))}</div>`;
          try {
            const body = new FormData();
            body.append("file", files[i]);
            body.append("folder", "slideshow");
            const saved = await api("upload", { method: "POST", form: body });
            await api("save", { method: "POST", body: { table: "cp_slideshowimgs", data: { slp_id: "", slp_photo: saved.name, slp_status: status } } });
            thumbs[i]?.classList.add("done");
          } catch (error) {
            thumbs[i]?.classList.add("fail");
            failed.push(`${files[i].name}: ${error.message}`);
            left.push(files[i]);
          }
        }
      } finally {
        button.disabled = false;
      }
      if (failed.length) {
        state.slidePicks = left;
        paintSlidePicks();
        form.querySelectorAll(".slide-thumb").forEach((thumb) => thumb.classList.add("fail"));
        throw new Error(failed.join(" · "));
      }
      state.slidePicks = [];
      location.hash = "#console/cp_slideshowimgs?tab=all";
      route();
    });
  }
  if (form.id === "record-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const payload = Object.fromEntries(new FormData(form));
      await api("save", { method: "POST", body: { table: form.dataset.table, data: payload } });
      $("#drawer").remove();
      route();
    });
  }
  if (form.id === "table-search" || form.id === "app-search") {
    event.preventDefault();
    state.tablePage = 1;
    state.tableQuery = new FormData(form).get("q") || "";
    const item = state.catalog.find((entry) => entry.id === state.module);
    renderModule(item).catch((error) => { $("#work").innerHTML = `<div class="error">${esc(error.message)}</div>`; });
  }
  if (form.dataset.search) {
    event.preventDefault();
    const q = new FormData(form).get("q") || "";
    location.hash = `#${form.dataset.search}?q=${encodeURIComponent(q)}`;
  }
  if (form.id === "blacklist-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      await api("blacklist-add", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      const next = `#console/cp_staff?tab=blacklist&year=${localToday().slice(0, 4)}`;
      if (location.hash === next) route();
      else location.hash = next;
    });
  }
  if (form.id === "blacklist-year") {
    event.preventDefault();
    const year = new FormData(form).get("year") || localToday().slice(0, 4);
    location.hash = `#console/cp_staff?tab=blacklist&year=${encodeURIComponent(year)}`;
  }
  if (form.id === "staff-filters") {
    event.preventDefault();
    const data = new FormData(form);
    const params = new URLSearchParams({ tab: state.query?.get("tab") === "blacklist" ? "blacklist" : "all" });
    ["ofc", "des", "ser", "q"].forEach((key) => {
      const value = String(data.get(key) || "").trim();
      if (value) params.set(key, value);
    });
    location.hash = `#console/cp_staff?${params}`;
  }
  if (form.id === "officer-nid") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const nid = String(new FormData(form).get("nid") || "").trim();
      await api("save", { method: "POST", body: { table: "cp_trainingofficers", data: { tro_nid: nid } } });
      location.hash = "#console/cp_trainingofficers?tab=all";
      route();
    });
  }
  if (form.id === "classic-search") {
    event.preventDefault();
    const q = new FormData(form).get("q") || "";
    location.hash = `#console/${form.dataset.table}?tab=all&q=${encodeURIComponent(q)}`;
  }
  if (form.id === "plan-pick") {
    event.preventDefault();
    const rows = JSON.parse($("#work").dataset.rows || "[]");
    const ids = [...document.querySelectorAll('#work [name=pick]:checked')].map((box) => box.value);
    if (!ids.length) {
      alert(L("පළමුව අවශ්‍යතා තෝරන්න.", "முதலில் தேவைகளைத் தேர்ந்தெடுக்கவும்.", "Tick at least one need."));
      return;
    }
    try {
      for (const id of ids) {
        const need = rows.find((row) => String(row.req_id) === String(id));
        if (need) await addNeedToPlan(need);
      }
      route();
    } catch (error) {
      alert(error.message);
    }
  }
  if (form.id === "annual-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      await api("save", { method: "POST", body: { table: "cp_atp", data: annualPayload(form) } });
      location.hash = "#console/cp_atp?tab=all";
      route();
    });
  }
  if (form.id === "resource-lookup") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      const found = await api("resource-lookup", { method: "POST", body: data });
      paintSubjects(found.person);
      const target = $("#resource-public");
      Object.entries(found.person).forEach(([key, value]) => {
        const input = target.querySelector(`[name="${CSS.escape(key)}"]`);
        if (!input || input.type === "file" || key.startsWith("rp_fld") || key === "rp_morefields") return;
        const shown = fieldText(value);
        if (input.tagName === "SELECT" && shown && ![...input.options].some((option) => option.value === shown)) {
          input.add(new Option(shown, shown));
        }
        input.value = shown;
      });
      const photo = $("#resource-photo");
      if (photo) {
        photo.hidden = !found.person.rp_photo_url;
        photo.src = found.person.rp_photo_url || "";
      }
      target.querySelector("[name=rp_code]").value = data.code;
      target.querySelector("button[type=submit]").textContent = L("යාවත්කාලීන කරන්න", "புதுப்பிக்க", "Update");
      $("#form-msg").innerHTML = `<div class="ok">${esc(L("තොරතුරු පෙන්වනවා. වෙනස් කරලා යාවත්කාලීන කරන්න.", "விவரங்கள் ஏற்றப்பட்டன. மாற்றிப் புதுப்பிக்கவும்.", "Your details are loaded. Change them and update."))}</div>`;
    } catch (error) {
      alert(error.message);
    }
  }
  if (form.id === "resource-public") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const saved = await api("resource-save", { method: "POST", form: new FormData(form) });
      const note = saved.updated
        ? L("තොරතුරු යාවත්කාලීන වුණා.", "விவரங்கள் புதுப்பிக்கப்பட்டன.", "Your details were updated.")
        : L("ලියාපදිංචිය සාර්ථකයි. මෙම යාවත්කාල කේතය තියාගන්න: ", "பதிவு முடிந்தது. இந்தக் குறியீட்டை வைத்துக்கொள்ளுங்கள்: ", "Registered. Keep this update code: ") + saved.code;
      $("#form-msg").innerHTML = `<div class="ok">${esc(note)}</div>`;
    });
  }
  if (form.id === "need-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const data = Object.fromEntries(new FormData(form));
      await api("save", { method: "POST", body: { table: "cp_trrequirements", data } });
      form.reset();
      route();
    });
  }
  if (form.id === "apply-pick") {
    event.preventDefault();
    const data = new FormData(form);
    const plan = (state.applyPlans || []).find((item) => String(item.atp_id) === String(data.get("atp_id")));
    if (!plan) return;
    await beginApply(plan, data.get("nid"));
  }
  if (form.id === "apply-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const data = Object.fromEntries(new FormData(form));
      if (!$("#apply-name")?.value) throw new Error(L("හැඳුනුම්පතට නිලධාරියෙකු හමු වුණේ නැහැ.", "அந்த அடையாள எண்ணுக்கு அதிகாரி இல்லை.", "No officer was found for that ID."));
      if (state.applyPerson?.blacklisted === "Yes") {
        throw new Error(L(
          `මේ නිලධාරියා අසාදු ලේඛනයේ ඉන්නවා. ${showDate(state.applyPerson.blacklistUntil)} දක්වා කිසිම පුහුණුවකට අයදුම් කළ නොහැක.`,
          `${showDate(state.applyPerson.blacklistUntil)} வரை எந்தப் பயிற்சிக்கும் விண்ணப்பிக்க முடியாது.`,
          `This officer is blacklisted until ${showDate(state.applyPerson.blacklistUntil)} and cannot apply for any programme.`
        ));
      }
      await api("apply", { method: "POST", body: data });
      state.applyNid = "";
      state.applyPerson = null;
      paintApplyPick($("#work"), L("සාර්ථකව අයදුම් කළා.", "விண்ணப்பம் வெற்றிகரமாகச் சேர்க்கப்பட்டது.", "The application was saved."));
    });
  }
  if (form.id === "include-picked") {
    event.preventDefault();
    const boxes = [...document.querySelectorAll(".applicant-fit [data-act=pick-one]")];
    const on = boxes.filter((box) => box.checked).map((box) => box.dataset.id);
    const off = boxes.filter((box) => !box.checked).map((box) => box.dataset.id);
    if (!on.length) {
      const slot = form.querySelector("#form-msg");
      if (slot) slot.innerHTML = `<div class="error">${esc(L("කෙනෙක් තෝරන්න.", "ஒருவரைத் தேர்ந்தெடுக்கவும்.", "Tick at least one person."))}</div>`;
      return;
    }
    await submitMessage(form, async () => {
      await api("select-applicant", { method: "POST", body: { ids: on, selected: YES } });
      if (off.length) await api("select-applicant", { method: "POST", body: { ids: off, selected: NO } });
      const atp = state.query?.get("atp") || "";
      location.hash = `#console/attendance?atp=${encodeURIComponent(atp)}`;
    });
  }
  if (form.id === "pick-programme") {
    event.preventDefault();
    const atp = new FormData(form).get("atp") || "";
    location.hash = `#console/${state.module}?atp=${encodeURIComponent(atp)}`;
  }
  if (form.id === "walkin-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      await api("walkin", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      route();
    });
  }
  if (form.id === "confirm-attendance") {
    event.preventDefault();
    const atp = new FormData(form).get("atp_id") || "";
    const people = [...form.querySelectorAll("[data-nid]")].map((box) => ({ nid: box.dataset.nid, present: box.checked ? 1 : 0 }));
    await submitMessage(form, async () => {
      const saved = await api("confirm-attendance", { method: "POST", body: { atp_id: atp, people } });
      $("#form-msg").innerHTML = `<div class="ok">${esc(L("තහවුරු කළා. නිලධාරීන් ", "உறுதி செய்யப்பட்டது. அதிகாரிகள் ", "Confirmed. Officers "))}${esc(saved.saved)}</div>`;
    });
  }
  if (form.id === "walkin-many") {
    event.preventDefault();
    const atp = new FormData(form).get("atp_id") || "";
    const nids = [...form.querySelectorAll("[name=nid]")].map((field) => field.value.trim()).filter(Boolean);
    const slot = document.getElementById("many-msg");
    if (!nids.length) {
      if (slot) slot.innerHTML = `<div class="error">${esc(L("හැඳුනුම්පත් අංකයක් දෙන්න.", "அடையாள எண்ணை எழுதவும்.", "Enter a national ID."))}</div>`;
      return;
    }
    try {
      const saved = await api("walkin-many", { method: "POST", body: { atp_id: atp, nids } });
      if (slot) slot.innerHTML = `<div class="ok">${esc(L("එකතු කළ නිලධාරීන් ", "சேர்த்த அதிகாரிகள் ", "Officers added: "))}${esc(saved.added)}</div>`;
      route();
    } catch (error) {
      if (slot) slot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
    }
  }
  if (form.id === "attendance-upload") {
    event.preventDefault();
    const body = new FormData(form);
    const slot = document.getElementById("upload-msg");
    try {
      const saved = await api("attendance-upload", { method: "POST", form: body });
      if (slot) slot.innerHTML = `<div class="ok">${esc(L("එකතු කළ නිලධාරීන් ", "சேர்த்த அதிகாரிகள் ", "Officers added: "))}${esc(saved.added)}</div>`;
      route();
    } catch (error) {
      if (slot) slot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
    }
  }
  if (form.id === "attend-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      await api("attendance-save", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      $("#form-msg").innerHTML = '<div class="ok">Attendance was saved.</div>';
    });
  }
  if (form.id === "finish-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      await api("finish", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      $("#form-msg").innerHTML = `<div class="ok">${esc(L("වැඩසටහන අවසන් කළා.", "நிகழ்ச்சி முடிக்கப்பட்டது.", "The programme was closed."))}</div>`;
    });
  }
  if (form.id === "report-form") {
    event.preventDefault();
    try {
      const query = Object.fromEntries(new FormData(form));
      rememberYear(query.year);
      const data = await api("report", { query });
      $("#report").innerHTML = reportTable(data);
    } catch (error) {
      $("#report").innerHTML = `<div class="error">${esc(error.message)}</div>`;
    }
  }
  if (form.id === "private-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      await api("private-apply", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      $("#form-msg").innerHTML = '<div class="ok">The private-course application was submitted.</div>';
    });
  }
  if (form.id === "quiz-nid") {
    event.preventDefault();
    const now = state.quizNow || {};
    const nid = String(new FormData(form).get("nid") || "").trim();
    await submitMessage(form, async () => {
      const who = await api("eval-who", { query: { token: now.token, nid } });
      sessionStorage.setItem(`mdtu-quiz-${now.token}-${now.kind}`, nid);
      const status = await api("eval-state", { query: { token: now.token, kind: now.kind, nid } });
      state.quizNow = { ...now, nid, name: who.name };
      paintQuizQuestion(now.token, now.kind, nid, now.opened, status.name ? status : { ...status, name: who.name });
    });
  }
  if (form.id === "total-form") {
    event.preventDefault();
    const year = $("#total-year [name=year]")?.value || "";
    await submitMessage(form, async () => {
      await api("total-save", { method: "POST", body: { year, rows: totalRows(form) } });
      const slot = form.querySelector("#form-msg");
      if (slot) slot.innerHTML = `<div class="ok">${esc(L("සුරැකුවා.", "சேமித்தது.", "Saved."))}</div>`;
    });
  }
  if (form.id === "gmail-app-form") {
    event.preventDefault();
    const app = String(new FormData(form).get("app") || "");
    await submitMessage(form, async () => {
      await api("messages-gmail", { method: "POST", body: { app } });
      const slot = form.querySelector("#form-msg");
      if (slot) slot.innerHTML = `<div class="ok">${esc(L("App password එක සුරැකුවා. දැන් ඊමේල් යවන්න ඔබන්න.", "App password சேமித்தது. இப்போது மின்னஞ்சல் அனுப்பவும்.", "The app password was saved. Now press send email."))}</div>`;
      const input = form.querySelector("[name=app]");
      if (input) input.value = "";
    });
  }
  if (form.id === "eval-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const atp = new FormData(form).get("atp") || "";
      const questions = [...form.querySelectorAll(".eval-qedit")].map((box) => ({
        text: box.querySelector("[name=qtext]")?.value || "",
        a: box.querySelector("[name=optA]")?.value || "",
        b: box.querySelector("[name=optB]")?.value || "",
        c: box.querySelector("[name=optC]")?.value || "",
        d: box.querySelector("[name=optD]")?.value || "",
        correct: box.querySelector("[name=correct]")?.value || "",
      }));
      await api("eval-save", { method: "POST", body: { atp, questions } });
      const next = `#console/evaluation?atp=${encodeURIComponent(atp)}`;
      if (location.hash === next) route();
      else location.hash = next;
    });
  }
  if (form.id === "module-format-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const packed = sheetPayload(form);
      const saved = await api("module-save", {
        method: "POST",
        body: { id: packed.id, title: packed.title, atp: packed.atp, days: packed.days },
      });
      const next = `#console/modular?id=${encodeURIComponent(saved.id)}`;
      if (location.hash === next) route();
      else location.hash = next;
    });
  }
  if (form.id === "module-upload-form" || form.id === "module-gemini-form") {
    event.preventDefault();
    const slot = form.querySelector("#form-msg");
    if (slot) slot.innerHTML = `<div class="error">${esc(L("මොඩියුලය මෙම ආකෘතියෙන් පමණයි. Gemini එකෙන් හදපු මොඩියුලයක් සුරකින්න බැහැ.", "தொகுதி இந்தப் படிவத்தில் மட்டும். Gemini இல் உருவாக்கிய தொகுதியைச் சேமிக்க முடியாது.", "The module is only this form. A module made in Gemini is not saved."))}</div>`;
  }
  if (form.id === "signatory-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const data = Object.fromEntries(new FormData(form));
      const saved = await api("signatory-save", { method: "POST", body: data });
      const showPreview = (selector, url) => {
        if (!url) return;
        const preview = form.querySelector(selector);
        if (preview) {
          preview.hidden = false;
          preview.src = url;
        }
      };
      showPreview(".sign-preview", saved.url);
      showPreview(".photo-preview", saved.photoUrl);
      $("#form-msg").innerHTML = `<div class="ok">${esc(L("සුරැකුණා.", "சேமித்தது.", "Saved."))}</div>`;
    });
  }
  if (form.id === "letter-form") {
    event.preventDefault();
    const data = new FormData(form);
    const nid = String(data.get("nid") || "").trim();
    const year = String(data.get("year") || "").trim();
    location.hash = `#console/letter?nid=${encodeURIComponent(nid)}&year=${encodeURIComponent(year)}`;
  }
  if (form.id === "estimate-form") {
    event.preventDefault();
    const id = new FormData(form).get("id") || "";
    if (!id) return;
    location.hash = `#console/estimate?atp=${encodeURIComponent(id)}`;
  }
  if (form.id === "pace-form") {
    event.preventDefault();
    const year = document.querySelector("#pace-year")?.value || chosenYear();
    const revision = {};
    document.querySelectorAll("[data-rev]").forEach((input) => { revision[input.dataset.rev] = input.value; });
    const edits = Object.values(paceCellMap()).map((cell) => ({
      month: cell.month,
      category: cell.category,
      held: cell.held || "",
      people: cell.people || "",
      spent: cell.spent || "",
    }));
    await submitMessage(form, async () => {
      await api("pace-save", { method: "POST", body: { year, revision, edits } });
      const slot = form.querySelector("#form-msg");
      if (slot) slot.innerHTML = `<span class="ok">${esc(L("සුරැකුණා.", "சேமித்தது.", "Saved."))}</span>`;
    });
    return;
  }
  if (form.id === "pace-until") {
    event.preventDefault();
  }
  if (form.id === "provision-year") {
    event.preventDefault();
    const year = new FormData(form).get("year") || "";
    location.hash = `#console/provision?tab=report&year=${encodeURIComponent(year)}`;
  }
  if (form.id === "advance-year") {
    event.preventDefault();
    const year = new FormData(form).get("year") || "";
    const atp = state.query?.get("atp") || "";
    location.hash = `#console/advance?tab=report&year=${encodeURIComponent(year)}${atp ? `&atp=${encodeURIComponent(atp)}` : ""}`;
  }
  if (form.id === "advance-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await submitMessage(form, async () => {
      await api("advance-save", { method: "POST", body: data });
      $("#form-msg").innerHTML = `<div class="ok">${esc(L("සුරැකුණා.", "சேமித்தது.", "Saved."))}</div>`;
    });
  }
  if (form.id === "foodbill-form") {
    event.preventDefault();
    const data = new FormData(form);
    const texts = [...form.querySelectorAll("[name=billtext]")];
    const amounts = [...form.querySelectorAll("[name=billamount]")];
    const lines = texts.map((field, index) => ({ text: field.value, amount: amounts[index]?.value || "" }));
    await submitMessage(form, async () => {
      await api("foodbill-save", {
        method: "POST",
        body: { atp: data.get("atp"), date: data.get("date"), advance: data.get("advance"), food: data.get("food"), lines },
      });
      location.hash = `#console/finish2?bill=${encodeURIComponent(data.get("atp") || "")}&tab=report`;
    });
  }
  if (form.id === "allowance-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const nids = [...form.querySelectorAll("[name=officeNid]")];
    const names = [...form.querySelectorAll("[name=officeName]")];
    data.officePeople = nids.map((field, index) => ({ nid: field.value, name: names[index]?.value || "" }));
    await submitMessage(form, async () => {
      await api("allowance-save", { method: "POST", body: data });
      location.hash = `#console/finish2?pay=${encodeURIComponent(data.atp || "")}&tab=report`;
    });
  }
  if (form.id === "provision-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await submitMessage(form, async () => {
      await api("provision-save", { method: "POST", body: data });
      $("#form-msg").innerHTML = `<div class="ok">${esc(L("ප්‍රතිපාදන සුරැකුණා.", "ஒதுக்கீடு சேமித்தது.", "The allocations were saved."))}</div>`;
    });
  }
  if (form.id === "provision-move-year") {
    event.preventDefault();
    const year = new FormData(form).get("year") || "";
    rememberYear(year);
    const tab = state.query?.get("tab") === "sendreport" ? "sendreport" : "move";
    location.hash = `#console/provision?tab=${tab}&year=${encodeURIComponent(year)}`;
  }
  if (form.id === "provision-move-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await submitMessage(form, async () => {
      if (data.from === data.to) throw new Error(L("කොහෙන්ද සහ කොහාටද වෙනස් ප්‍රතිපාදන දෙකක් තෝරන්න.", "வேறு வேறு ஒதுக்கீடுகளைத் தேர்ந்தெடுக்கவும்.", "Choose two different allocations."));
      await api("provision-move-save", { method: "POST", body: data });
      await renderProvisionMove($("#work"), data.year);
      const note = document.querySelector("#provision-move-form #form-msg");
      if (note) note.innerHTML = `<div class="ok">${esc(L("ප්‍රතිපාදන මාරු කිරීම සුරැකුණා. සියලු වාර්තා යාවත්කාලීන විය.", "மாற்றம் சேமிக்கப்பட்டது. அனைத்து அறிக்கைகளும் புதுப்பிக்கப்பட்டன.", "Transfer saved. All reports now use the new amounts."))}</div>`;
    });
  }
  if (form.id === "provision-send-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await submitMessage(form, async () => {
      await api("provision-send-save", { method: "POST", body: data });
      location.hash = `#console/provision?tab=move&year=${encodeURIComponent(data.year || "")}`;
      await renderProvisionMove($("#work"), data.year);
      const note = document.querySelector("#provision-send-form #form-msg");
      if (note) note.innerHTML = `<div class="ok">${esc(L("ප්‍රතිපාදන මාරු කිරීම සුරැකුණා.", "மாற்றம் சேமிக்கப்பட்டது.", "The transfer was saved."))}</div>`;
    });
  }
  if (form.id === "provision-add-form") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await submitMessage(form, async () => {
      await api("provision-move-save", { method: "POST", body: data });
      await renderProvisionMove($("#work"), data.year);
      const note = document.querySelector("#provision-add-form #form-msg");
      if (note) note.innerHTML = `<div class="ok">${esc(L("අලුත් ප්‍රතිපාදන සුරැකුණා. සියලු වාර්තා යාවත්කාලීන විය.", "புதிய ஒதுக்கீடு சேமிக்கப்பட்டது. அனைத்து அறிக்கைகளும் புதுப்பிக்கப்பட்டன.", "New allocation saved. All reports now use the new amounts."))}</div>`;
    });
  }
  if (form.id === "office-out") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await submitMessage(form, async () => {
      await api("ahead-office-save", { method: "POST", body: data });
      const fresh = await api("ahead-office", { query: { year: data.year } });
      state.officeReport = fresh;
      const tabs = document.querySelector(".ahead-tabs");
      $("#work").innerHTML = `${tabs ? tabs.outerHTML : ""}${officeReportHtml(fresh)}`;
      const note = $("#form-msg");
      if (note) note.innerHTML = `<div class="ok">${esc(L("සුරැකුණා. වාර්තාව යාවත්කාලීන විය.", "சேமித்தது. அறிக்கை புதுப்பிக்கப்பட்டது.", "Saved. The report was updated."))}</div>`;
    });
  }
  if (form.id === "offweb-form") {
    event.preventDefault();
    await submitMessage(form, async () => {
      const data = annualPayload(form);
      if (!String(data.atp_trname || "").trim()) {
        throw new Error(L("පුහුණු වැඩසටහනේ නම දෙන්න.", "பயிற்சியின் பெயரை எழுதவும்.", "Enter the programme name."));
      }
      data.atp_offweb = YES;
      data.atp_addhome = NO;
      data.atp_isaddatp = NO;
      data.atp_isinatp = NO;
      data.atp_lastdateapply = "";
      const saved = await api("offweb-save", { method: "POST", body: { data } });
      location.hash = `#console/offweb?atp=${encodeURIComponent(saved.id)}`;
    });
  }
  if (form.id === "attended-filter") {
    event.preventDefault();
    const data = new FormData(form);
    const params = new URLSearchParams();
    params.set("year", chosenYear());
    ["atp", "office", "nid"].forEach((key) => {
      const value = String(data.get(key) || "").trim();
      if (value) params.set(key, value);
    });
    location.hash = `#console/attended?${params}`;
    return;
  }
  if (form.id === "sign-form") {
    event.preventDefault();
    const id = new FormData(form).get("id") || "";
    if (id) await paintSignSheet(id);
  }
  if (form.id === "staff-history-form") {
    event.preventDefault();
    const nid = String(new FormData(form).get("nid") || "").trim();
    const next = `#directory?nid=${encodeURIComponent(nid)}`;
    if (location.hash === next) loadStaffHistory(nid);
    else location.hash = next;
  }
  if (form.id === "profile-form") {
    event.preventDefault();
    const nid = new FormData(form).get("nid");
    try {
      const data = await api("profile", { query: { nid } });
      const person = data.profile;
      const extra = data.full ? `<p>ID ${esc(person.nid)} · ${esc(showDate(person.birth))} · ${esc(person.gender)} · class ${esc(person.class)}</p><p>Blacklist: ${esc(person.blacklisted)}</p><ul class="list">${(person.attendance || []).map((row) => `<li>${esc(showDate(row.tratt_startdate))} · ${esc(row.tratt_atpname)} · ${esc(row.tratt_isparti)}</li>`).join("")}</ul>` : `<p class="muted">Sign in as this officer's office to see the service record and attendance.</p>`;
      $("#paper").innerHTML = `<article class="card person">${person.photo ? `<img class="avatar-lg" alt="" src="${esc(person.photo)}">` : ""}<div><h2>${esc(person.name)}</h2><p>${esc(person.designation)}<br>${esc(person.office)}<br>${esc(person.service)}</p><p>${esc(person.mobile)} ${esc(person.telephone)}<br>${esc(person.email)}</p>${extra}</div></article>`;
    } catch (error) {
      $("#paper").innerHTML = `<div class="error">${esc(error.message)}</div>`;
    }
  }
}

function localToday() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
}

function programmeEnd(item) {
  const days = [];
  for (let n = 1; n <= 10; n += 1) {
    const value = showDate(item["atp_day" + n]);
    if (value) days.push(value);
  }
  planLines(item.atp_moredays).forEach((extra) => {
    const value = showDate(extra);
    if (value) days.push(value);
  });
  days.sort();
  return days.length ? days[days.length - 1] : "";
}

function applyDeadline(item) {
  return showDate(item.atp_lastdateapply);
}

function applyProgrammes(items) {
  const today = localToday();
  return namedPlans(items).filter((item) => {
    if (inPlan(item.atp_offweb)) return false;
    const deadline = applyDeadline(item);
    const last = programmeEndDay(item);
    if (last && last < today) return false;
    return deadline && deadline >= today;
  }).sort((a, b) => applyDeadline(a).localeCompare(applyDeadline(b)) || Number(b.atp_id) - Number(a.atp_id));
}

function honorific(sex) {
  const text = String(sex || "");
  if (text.includes("ස්ත්") || text.toLowerCase() === "female") return "මිය";
  if (text.includes("පුරුෂ") || text.toLowerCase() === "male") return "මයා";
  return "මයා/මිය";
}

function showLetter(data) {
  const paper = $("#paper");
  if (!paper) return;
  paper.innerHTML = `<p class="letter-actions">
    <button class="btn" type="button" data-act="letter-pdf">${esc(L("PDF ලෙස", "PDF ஆக", "Save PDF"))}</button>
    <button class="btn secondary" type="button" data-act="letter-image">${esc(L("ඡායාරූපයක් ලෙස", "படமாக", "Save image"))}</button>
    <span class="muted">${esc(L("A4 පිටුව. ලිපි ශීර්ෂයත් එක්ක.", "A4 பக்கம். தலைப்புச் சேரும்.", "A4 page, including the letterhead."))}</span>
  </p>` + letterHtml(data);
}

function letterHtml(data) {
  const letter = data.letter;
  const officer = letter.officer || {};
  const plan = letter.programme || {};
  const application = letter.application || {};
  const name = officer.stf_Name || "";
  const office = officer.stf_office || application.tapp_office || "";
  const programme = plan.atp_trname || application.tapp_trname || "";
  const target = String(plan.atp_targetgroup || "").trim();
  const days = (letter.days || []).filter(Boolean).map((day) => showDate(day) || day).join(", ");
  const place = String(plan.atp_location || "").trim();
  const facilities = String(plan.atp_otherfacts || "").trim();
  const count = plan.atp_noofparticipants || "";
  const fileNo = plan.atp_fileno || "";
  const letterDate = localToday();
  const dateLabel = "ලිපිය මුද්‍රණය කරන දිනය";
  const signName = letter.signName || "එස්.එම්.පෙත්තාවඩු මහත්මිය";
  const sign = letter.signUrl ? `<img class="letter-sign-img" src="${esc(letter.signUrl)}" alt="">` : "";
  return `<article class="letter nomination" data-file="${esc(fileNo)}" data-date="${esc(letterDate)}" data-datelabel="${esc(dateLabel)}">
    <div class="letter-head-wrap">
      <img class="letter-head" src="images/letterheadtop.jpg" alt="">
      <span class="letter-myno">${esc(fileNo)}</span>
      <span class="letter-ondate"><b>${esc(dateLabel)}</b><br>${esc(letterDate)}</span>
    </div>
    <p>ලේකම් මගින්,</p>
    <p class="who">${esc(name)} ${esc(honorific(officer.stf_sex))}</p>
    <p class="who">${esc(office)}</p>
    <p class="letter-title">${esc(programme)} පිළිබඳ පුහුණු වැඩමුළුව</p>
    <p class="letter-body">වයඹ පළාත් ප්‍රධාන ලේකම් කාර්යාලයීය කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකයේ මෙහෙයවීමෙන් වයඹ පළාත් රාජ්‍ය සේවයේ ${esc(target ? target + " " : "")}නිලධාරින් සඳහා ${esc(programme)} පිළිබඳ පුහුණු වැඩමුළුවක් පැවැත්වීමට අවශ්‍ය කටයුතු සංවිධානය කර ඇත.</p>
    <p class="letter-facts">දිනය/දිනයන් - ${esc(days)}<br>වේලාව - ${esc(plan.atp_stime || "")} සිට ${esc(plan.atp_etime || "")} දක්වා<br>පුහුණුව පවත්වන ස්ථානය - ${esc(place)}<br>පුහුණු පහසුකම් - ${esc(facilities)}</p>
    <p class="letter-body">මෙම පුහුණු වැඩමුළුව සඳහා ඔබ අමාත්‍යංශය / දෙපාර්තමේන්තුව / ආයතනයේ ඉහත නම් සඳහන් නිලධාරියා / නිලධාරිණිය තෝරාගෙන ඇති බැවින් අදාල දිනයන්හි නියමිත වේලාවට වැඩමුළුව සඳහා සහභාගී කරවන මෙන් කාරුණිකව දන්වමි.</p>
    <p class="letter-body">සැ.යු. වැඩමුළුව සඳහා පැමිණීම අනිවාර්ය වන අතර නොවැලැක්විය හැකි හේතුවක් මත වැඩමුළුව සඳහා නොපැමිණෙන්නේ නම් ඒ බව සම්බන්ධීකරණ නිලධාරියා වෙත දැනුවත් කළ යුතු වේ. නොදන්වා නොපැමිණීම ඔබව අසාදු ලේඛනගත කිරීමට හේතු වේ.</p>
    <p class="sign">${sign}${esc(signName)},<br>නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු),<br>වයඹ ප්‍රධාන ලේකම් වෙනුවට.</p>
    <p class="letter-copy">පිටපත - අධ්‍යක්ෂ ${esc(place)} - නිලධාරින් ${esc(count)} දෙනෙකු සඳහා අවශ්‍ය පුහුණු පහසුකම් සැපයීම සඳහා</p>
    <img class="letter-foot" src="images/letterheadfooter.jpg" alt="">
  </article>`;
}

async function renderSignatory(work) {
  const data = await api("signatory");
  const titles = ["මහතා", "මහත්මිය", "මෙනවිය"];
  const title = titles.includes(data.title) ? data.title : "මහත්මිය";
  const options = titles.map((item) => `<option value="${esc(item)}"${item === title ? " selected" : ""}>${esc(item)}</option>`).join("");
  work.innerHTML = `
    <h2 class="classic-title">${esc(L("නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)", "துணைப் பிரதம செயலாளர் (பயிற்சி)", "Deputy Chief Secretary (Training)"))}</h2>
    <form class="classic-form" id="signatory-form">
      <label class="classic-field"><span>${esc(L("මහතා / මහත්මිය / මෙනවිය", "திருமான் / திருமதி / செல்வி", "Mr / Mrs / Miss"))}</span><select name="title" required>${options}</select></label>
      <label class="classic-field"><span>${esc(L("නම", "பெயர்", "Name"))}</span><input name="name" value="${esc(data.name || "")}" required></label>
      <label class="classic-field"><span>${esc(L("ඩිජිටල් අත්සන", "டிஜிட்டல் கையொப்பம்", "Digital signature"))}</span>
        <input type="hidden" name="sign" value="${esc(data.file || "")}">
        <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" data-upload="sign" data-folder="sign">
      </label>
      ${data.url ? `<img class="sign-preview" alt="" src="${esc(data.url)}">` : `<img class="sign-preview" alt="" hidden>`}
      <label class="classic-field"><span>${esc(L("මුල් පිටුවේ ඡායාරූපය", "முகப்புப் புகைப்படம்", "Home-page photograph"))}</span>
        <input type="hidden" name="photo" value="${esc(data.photo || "")}">
        <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" data-upload="photo" data-folder="sign">
      </label>
      ${data.photoUrl ? `<img class="photo-preview" alt="" src="${esc(data.photoUrl)}">` : `<img class="photo-preview" alt="" hidden>`}
      <button type="submit">${esc(L("සුරකින්න", "சேமி", "Save"))}</button>
      <div id="form-msg"></div>
    </form>`;
}

function loadLetterImage(src) {
  return fetch(src).then((response) => {
    if (!response.ok) throw new Error("Letterhead image missing");
    return response.blob();
  }).then((blob) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Letterhead image missing"));
    };
    image.src = url;
  }));
}

function wrapLetterLines(ctx, text, maxWidth) {
  const lines = [];
  String(text || "").split("\n").forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      return;
    }
    let line = "";
    words.forEach((word) => {
      const trial = line ? line + " " + word : word;
      if (ctx.measureText(trial).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = trial;
      }
    });
    lines.push(line);
  });
  return lines;
}

async function drawLetterCanvas() {
  const article = document.querySelector("#paper .letter.nomination");
  if (!article) throw new Error(L("පළමුව ලිපිය අරින්න.", "முதலில் கடிதத்தைத் திறக்கவும்.", "Open the letter first."));
  await document.fonts.ready;
  const signImage = article.querySelector(".letter-sign-img");
  if (signImage && !signImage.complete) {
    await new Promise((resolve) => {
      signImage.onload = resolve;
      signImage.onerror = resolve;
    });
  }
  const head = await loadLetterImage("images/letterheadtop.jpg");
  const foot = await loadLetterImage("images/letterheadfooter.jpg");
  const width = 1240;
  const margin = Math.round(width / 8.27);
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = 4200;
  const ctx = scratch.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, scratch.height);
  ctx.fillStyle = "#111111";
  ctx.textBaseline = "top";
  let y = margin;
  const headW = width - margin * 2;
  const headH = Math.round(headW * head.height / head.width);
  ctx.drawImage(head, margin, y, headW, headH);
  ctx.font = '600 18px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(article.dataset.file || "", margin + headW * 0.22, y + headH * 0.86);
  const dateLabel = article.dataset.datelabel || "ලිපිය මුද්‍රණය කරන දිනය";
  const dateText = article.dataset.date || "";
  ctx.font = '700 15px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const dateBoxW = Math.max(ctx.measureText(dateLabel).width, ctx.measureText(dateText).width) + 18;
  const dateBoxX = margin + headW * 0.99 - dateBoxW;
  const dateBoxY = y + headH * 0.70;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(dateBoxX, dateBoxY, dateBoxW, 48);
  ctx.fillStyle = "#111111";
  ctx.textAlign = "right";
  ctx.fillText(dateLabel, margin + headW * 0.98, dateBoxY + 2);
  ctx.font = '600 16px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  ctx.fillText(dateText, margin + headW * 0.98, dateBoxY + 24);
  ctx.textAlign = "left";
  y += headH + 28;
  const drawJustified = (text, x, maxWidth, lineH) => {
    String(text || "").split("\n").forEach((paragraph) => {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        y += lineH;
        return;
      }
      const lines = [];
      let line = [];
      words.forEach((word) => {
        const trial = [...line, word].join(" ");
        if (ctx.measureText(trial).width > maxWidth && line.length) {
          lines.push(line);
          line = [word];
        } else {
          line.push(word);
        }
      });
      if (line.length) lines.push(line);
      lines.forEach((parts, index) => {
        const last = index === lines.length - 1 || parts.length < 2;
        if (last) {
          ctx.fillText(parts.join(" "), x, y);
        } else {
          const wordsWidth = parts.reduce((sum, word) => sum + ctx.measureText(word).width, 0);
          const gap = (maxWidth - wordsWidth) / (parts.length - 1);
          let cursor = x;
          parts.forEach((word) => {
            ctx.fillText(word, cursor, y);
            cursor += ctx.measureText(word).width + gap;
          });
        }
        y += lineH;
      });
    });
  };
  const blocks = [...article.children].filter((node) => !node.classList.contains("letter-head-wrap") && !node.classList.contains("letter-foot"));
  blocks.forEach((block) => {
    const title = block.classList.contains("letter-title");
    const who = block.classList.contains("who");
    const sign = block.classList.contains("sign");
    const body = block.classList.contains("letter-body");
    const size = title ? 28 : 22;
    ctx.font = `${title || who ? "700" : "400"} ${size}px "Noto Sans Sinhala", "Source Sans 3", sans-serif`;
    const lineH = Math.round(size * 1.55);
    const left = sign ? width - margin - 420 : margin;
    const maxWidth = sign ? 420 : width - margin * 2;
    if (sign) {
      const image = block.querySelector(".letter-sign-img");
      if (image && image.complete && image.naturalWidth) {
        const signH = 78;
        const signW = Math.min(220, signH * image.naturalWidth / image.naturalHeight);
        ctx.drawImage(image, width - margin - signW, y, signW, signH);
        y += signH + 6;
      }
    }
    const text = block.innerText.trim();
    if (body) {
      drawJustified(text, margin, maxWidth, lineH);
      y += 10;
      return;
    }
    ctx.textAlign = title ? "center" : "left";
    wrapLetterLines(ctx, text, title ? width - margin * 2 : maxWidth).forEach((line) => {
      ctx.fillText(line, title ? width / 2 : left, y);
      y += lineH;
    });
    ctx.textAlign = "left";
    y += title ? 14 : 8;
  });
  const footH = Math.round(headW * foot.height / foot.width);
  y += 12;
  ctx.drawImage(foot, margin, y, headW, footH);
  y += footH + margin;
  const pageW = 1240;
  const pageH = 1754;
  const page = document.createElement("canvas");
  page.width = pageW;
  page.height = pageH;
  const out = page.getContext("2d");
  out.fillStyle = "#ffffff";
  out.fillRect(0, 0, pageW, pageH);
  const scale = Math.min(1, pageH / y);
  const drawW = pageW * scale;
  const drawH = y * scale;
  out.drawImage(scratch, 0, 0, pageW, y, (pageW - drawW) / 2, 0, drawW, drawH);
  return page;
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function canvasWrap(ctx, text, maxWidth) {
  const blocks = String(text || "").split("\n");
  const lines = [];
  blocks.forEach((block) => {
    const source = block.replace(/\s+/g, " ").trim();
    if (!source) {
      lines.push("");
      return;
    }
    let line = "";
    for (const ch of source) {
      const trial = line + ch;
      if (ctx.measureText(trial).width <= maxWidth) line = trial;
      else {
        if (line.trim()) lines.push(line.trim());
        line = ch.trim() ? ch : "";
      }
    }
    if (line.trim()) lines.push(line.trim());
  });
  return lines.length ? lines : [""];
}

async function saveNameListPdf() {
  const data = state.namelist;
  if (!data?.programme || !data.programme.atp_id) {
    alert(L("පළමුව නාම ලේඛනය අරින්න.", "முதலில் பெயர்ப்பட்டியலைத் திறக்கவும்.", "Open the name list first."));
    return;
  }
  await document.fonts.ready;
  const plan = data.programme;
  const people = data.rows || [];
  const headers = [
    L("අනු අංකය", "இல.", "No."),
    L("ඉල්ලුම් කල නිලධාරියාගේ ජා.හැ.අ.", "அடையாள எண்", "National ID"),
    L("නිලධාරියාගේ නම", "அதிகாரி பெயர்", "Officer name"),
    L("තනතුරු නාමය", "பதவி", "Designation"),
    L("කාර්යාලය", "அலுவலகம்", "Office"),
    L("ජංගම දුරකථන අංකය", "கைபேசி எண்", "Mobile"),
    L("ස්ත්‍රී/පුරුෂ භාවය", "பாலினம்", "Gender"),
    L("නවාතැන් අවශ්‍යතාවය", "தங்குமிடம்", "Accommodation"),
  ];
  const width = 1240;
  const pageH = 1754;
  const margin = 28;
  const tableW = width - margin * 2;
  const weights = [0.07, 0.15, 0.16, 0.14, 0.16, 0.13, 0.09, 0.1];
  const widths = weights.map((part) => tableW * part);
  const fontSize = 13;
  const lineH = fontSize + 5;
  const fontFor = (header) => `${header ? 700 : 400} ${fontSize}px "Noto Sans Sinhala", "Source Sans 3", sans-serif`;
  const measure = document.createElement("canvas").getContext("2d");
  const layoutRow = (cells, header, blacklisted = false) => {
    measure.font = fontFor(header);
    const wrapped = cells.map((text, index) => canvasWrap(measure, text, Math.max(8, widths[index] - 8)));
    const count = Math.max(...wrapped.map((lines) => lines.length), 1);
    return { wrapped, height: count * lineH + 8, header, blacklisted };
  };
  const headerRow = layoutRow(headers, true);
  const bodyRows = people.length
    ? people.map((row, index) => layoutRow([
      String(index + 1),
      row.tapp_officerNid || "",
      row.stf_Name || row.tratt_name || "",
      row.stf_desig || row.tratt_desig || "",
      row.tapp_office || "",
      row.stf_mobile || row.tratt_mobile || "",
      row.stf_sex || "",
      row.tapp_accomodation || "",
    ], false, row.blacklisted === "Yes"))
    : [layoutRow([L("තොරතුරු කිසිවක් නොමැත...!", "தகவல் இல்லை...!", "No details...!"), ...headers.slice(1).map(() => "")], false)];
  measure.font = '700 26px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const titleLines = canvasWrap(measure, L("සහභාගී වන්නන්ගේ නාම ලේඛනය", "பங்கேற்பாளர் பெயர்ப்பட்டியல்", "Participants' name list"), tableW);
  measure.font = '400 16px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const leftLines = canvasWrap(measure, `${L("පුහුණු වැඩ සටහන", "பயிற்சி", "Programme")} - ${plan.atp_trname || ""}\n${L("පැවැත්වෙන ස්ථානය", "இடம்", "Place")} - ${plan.atp_location || ""}`, tableW * 0.68);
  const dateLines = canvasWrap(measure, `${L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date")} - ${showDate(plan.atp_day1)}`, tableW * 0.3);
  const titleHeight = 20 + titleLines.length * 32 + Math.max(leftLines.length, dateLines.length) * 22 + 16;
  const packs = [];
  let cursor = 0;
  let first = true;
  while (first || cursor < bodyRows.length) {
    const limit = pageH - 20;
    let used = (first ? titleHeight : 16) + headerRow.height;
    const slice = [];
    while (cursor < bodyRows.length && used + bodyRows[cursor].height <= limit) {
      slice.push(bodyRows[cursor]);
      used += bodyRows[cursor].height;
      cursor += 1;
    }
    if (!slice.length && cursor < bodyRows.length) {
      slice.push(bodyRows[cursor]);
      cursor += 1;
    }
    packs.push({ first, slice });
    first = false;
    if (!bodyRows.length) break;
  }
  const images = [];
  for (const pack of packs) {
    const page = document.createElement("canvas");
    page.width = width;
    page.height = pageH;
    const ctx = page.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, pageH);
    ctx.fillStyle = "#111111";
    ctx.textBaseline = "middle";
    let y = 18;
    if (pack.first) {
      ctx.font = '700 26px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
      ctx.textAlign = "center";
      titleLines.forEach((line) => {
        ctx.fillText(line, width / 2, y + 14);
        y += 32;
      });
      ctx.font = '400 16px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
      const blockTop = y;
      ctx.textAlign = "left";
      leftLines.forEach((line, index) => ctx.fillText(line, margin, blockTop + 10 + index * 22));
      ctx.textAlign = "right";
      dateLines.forEach((line, index) => ctx.fillText(line, width - margin, blockTop + 10 + index * 22));
      y = blockTop + Math.max(leftLines.length, dateLines.length) * 22 + 12;
    }
    const drawRow = (row, top) => {
      ctx.font = fontFor(row.header);
      ctx.strokeStyle = "#222222";
      ctx.fillStyle = row.blacklisted ? "#c1121f" : "#111111";
      ctx.lineWidth = 1;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let x = margin;
      row.wrapped.forEach((lines, index) => {
        const cellW = widths[index];
        ctx.strokeRect(x, top, cellW, row.height);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 3, top + 2, Math.max(1, cellW - 6), Math.max(1, row.height - 4));
        ctx.clip();
        lines.forEach((line, lineIndex) => ctx.fillText(line, x + cellW / 2, top + 4 + lineH / 2 + lineIndex * lineH));
        ctx.restore();
        x += cellW;
      });
      return top + row.height;
    };
    y = drawRow(headerRow, y);
    pack.slice.forEach((row) => { y = drawRow(row, y); });
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: page.width, height: page.height });
  }
  saveBlob(jpegPdfPages(images), `nama-lekanaya-${localToday()}.pdf`);
}

async function saveSignPdf() {
  const data = state.signsheet;
  if (!data?.programme) {
    alert(L("පළමුව අත්සන් ලේඛනය අරින්න.", "முதலில் கையொப்பப் பட்டியலைத் திறக்கவும்.", "Open the sign sheet first."));
    return;
  }
  await document.fonts.ready;
  const plan = data.programme;
  const days = (data.days || []).map((day) => showDate(day)).filter(Boolean);
  const people = data.rows || [];
  const headers = [
    L("අනු අංකය", "இல.", "No."),
    L("නිලධාරියාගේ නම", "அதிகாரி பெயர்", "Officer name"),
    L("ජාතික හැඳුනුම්පත් අංකය", "அடையாள எண்", "National ID"),
    L("කාර්යාලය", "அலுவலகம்", "Office"),
    L("දුරකථන අංකය", "தொலைபேசி எண்", "Phone number"),
    ...days,
  ];
  const width = 1754;
  const pageH = 1240;
  const margin = 20;
  const tableW = width - margin * 2;
  const dayCount = days.length;
  let dayW = 0;
  if (dayCount) {
    dayW = Math.min(96, (tableW * 0.4) / dayCount);
    if (dayW < 44) dayW = (tableW * 0.48) / dayCount;
  }
  const rest = Math.max(160, tableW - dayW * dayCount);
  const weights = [0.08, 0.28, 0.2, 0.26, 0.18];
  const raw = [...weights.map((part) => rest * part), ...Array.from({ length: dayCount }, () => dayW)];
  const rawSum = raw.reduce((sum, size) => sum + size, 0) || 1;
  const widths = raw.map((size) => size * tableW / rawSum);
  const fontSize = widths.slice(0, 5).some((size) => size < 110) ? 13 : 15;
  const lineH = fontSize + 6;
  const fontFor = (header) => `${header ? 700 : 400} ${fontSize}px "Noto Sans Sinhala", "Source Sans 3", sans-serif`;
  const measure = document.createElement("canvas").getContext("2d");
  const layoutRow = (cells, header) => {
    measure.font = fontFor(header);
    const wrapped = cells.map((text, index) => canvasWrap(measure, text, Math.max(8, widths[index] - 8)));
    const count = Math.max(...wrapped.map((lines) => lines.length), 1);
    return { wrapped, height: count * lineH + 8, header };
  };
  const headerRow = layoutRow(headers, true);
  const bodyRows = people.length
    ? people.map((row, index) => layoutRow([
      String(index + 1),
      `${row.stf_Name || row.tratt_name || ""}\n${row.stf_desig || row.tratt_desig || ""}`,
      row.tapp_officerNid || "",
      row.tapp_office || "",
      row.stf_mobile || row.tratt_mobile || "",
      ...days.map(() => ""),
    ], false))
    : [layoutRow([L("තෝරාගත් නිලධාරීන් නොමැත.", "தேர்ந்த அதிகாரிகள் இல்லை.", "No selected officers."), ...headers.slice(1).map(() => "")], false)];
  measure.font = '700 26px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const titleLines = canvasWrap(measure, L("සහභාගිවන්නන්ගේ අත්සන් ලේඛනය", "பங்கேற்பாளர் கையொப்பப் பட்டியல்", "Participants' sign sheet"), tableW);
  measure.font = '400 18px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const programmeLines = canvasWrap(measure, `${L("පුහුණු වැඩසටහන", "பயிற்சி", "Programme")} - ${plan.atp_trname || ""}`, tableW);
  const placeLines = canvasWrap(measure, `${L("ආරම්භක දිනය", "தொடக்க திகதி", "Start date")} - ${showDate(plan.atp_day1)}   ${L("ස්ථානය", "இடம்", "Place")} - ${plan.atp_location || ""}`, tableW);
  const titleHeight = 18 + titleLines.length * 32 + programmeLines.length * 24 + placeLines.length * 24 + 8;
  const packs = [];
  let cursor = 0;
  let first = true;
  while (first || cursor < bodyRows.length) {
    const limit = pageH - 16;
    let used = (first ? titleHeight : 16) + headerRow.height;
    const slice = [];
    while (cursor < bodyRows.length && used + bodyRows[cursor].height <= limit) {
      slice.push(bodyRows[cursor]);
      used += bodyRows[cursor].height;
      cursor += 1;
    }
    if (!slice.length && cursor < bodyRows.length) {
      slice.push(bodyRows[cursor]);
      cursor += 1;
    }
    packs.push({ first, slice });
    first = false;
    if (!bodyRows.length) break;
  }
  const images = [];
  for (const pack of packs) {
    const page = document.createElement("canvas");
    page.width = width;
    page.height = pageH;
    const ctx = page.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, pageH);
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let y = 16;
    if (pack.first) {
      ctx.font = '700 26px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
      titleLines.forEach((line) => {
        ctx.fillText(line, width / 2, y + 16);
        y += 32;
      });
      ctx.font = '400 18px "Noto Sans Sinhala", "Source Sans 3", sans-serif';
      programmeLines.forEach((line) => {
        ctx.fillText(line, width / 2, y + 12);
        y += 24;
      });
      placeLines.forEach((line) => {
        ctx.fillText(line, width / 2, y + 12);
        y += 24;
      });
      y += 8;
    }
    const drawRow = (row, top) => {
      ctx.font = fontFor(row.header);
      ctx.strokeStyle = "#222222";
      ctx.fillStyle = "#111111";
      ctx.lineWidth = 1;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let x = margin;
      row.wrapped.forEach((lines, index) => {
        const cellW = widths[index];
        ctx.strokeRect(x, top, cellW, row.height);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 3, top + 2, Math.max(1, cellW - 6), Math.max(1, row.height - 4));
        ctx.clip();
        lines.forEach((line, lineIndex) => ctx.fillText(line, x + cellW / 2, top + 4 + lineH / 2 + lineIndex * lineH));
        ctx.restore();
        x += cellW;
      });
      return top + row.height;
    };
    y = drawRow(headerRow, y);
    pack.slice.forEach((row) => {
      y = drawRow(row, y);
    });
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: page.width, height: page.height });
  }
  saveBlob(jpegPdfPages(images, "841.89", "595.28"), `athsan-lekanaya-${localToday()}.pdf`);
}

async function savePanelPdf() {
  const data = state.panelsign;
  if (!data?.name && !data?.panel) {
    alert(L("පළමුව පුහුණු වැඩසටහන තෝරන්න.", "முதலில் பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme first."));
    return;
  }
  await document.fonts.ready;
  const days = panelDays(data);
  const pageW = 1240;
  const pageH = 1754;
  const margin = Math.round(pageW / 8.27);
  const innerW = pageW - margin * 2;
  const innerH = pageH - margin * 2;
  const canvas = document.createElement("canvas");
  canvas.width = pageW;
  canvas.height = pageH;
  const ctx = canvas.getContext("2d");
  const fontName = '"Noto Sans Sinhala", "Source Sans 3", sans-serif';
  const measureLines = (text, size, weight, width) => {
    ctx.font = `${weight} ${size}px ${fontName}`;
    return canvasWrap(ctx, text, width);
  };
  const titleSize = 22;
  const subSize = 18;
  const titles = [
    measureLines("වයඹ පළාත් සභාව", titleSize, 700, innerW),
    measureLines("කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය", subSize, 700, innerW),
    measureLines(`${data.name || ""} පිළිබඳ පුහුණු වැඩසටහන`, subSize, 700, innerW),
    measureLines(panelDateLine(days), subSize, 700, innerW),
  ];
  let headH = 8;
  titles.forEach((lines, index) => { headH += lines.length * ((index === 0 ? titleSize : subSize) + 6); });
  headH += 16;
  const captionH = 54;
  const staffRows = Math.max(1, (data.staff || []).length);
  const panelRows = Math.max(1, (data.panel || []).length);
  const rowCount = staffRows + panelRows + 2;
  const rowH = Math.max(18, Math.min(52, (innerH - headH - captionH - 40) / rowCount));
  const dayShare = Math.min(0.62, Math.max(0.18, days.length * 0.16));
  const rest = 1 - dayShare;
  const staffWeights = [rest * 0.14, rest * 0.46, rest * 0.40, ...Array.from({ length: days.length }, () => dayShare / days.length)];
  const staffSum = staffWeights.reduce((sum, size) => sum + size, 0) || 1;
  const staffWidths = staffWeights.map((size) => size * innerW / staffSum);
  const panelWeights = [0.1, 0.46, 0.22, 0.22];
  const panelWidths = panelWeights.map((size) => size * innerW);
  const staffHead = ["අනු අංකය", "නම", "තනතුර", ...days.map((day) => panelDayHead(day))];
  const staffBody = (data.staff || []).length
    ? data.staff.map((row, index) => [String(index + 1), row.name || "", row.post || "", ...days.map(() => "")])
    : [["", "තෝරාගත් නිලධාරීන් නොමැත.", "", ...days.map(() => "")]];
  const panelHead = ["අනු අංකය", "නිලධාරියාගේ නම හා තනතුර", "කාර්යභාරය", "අත්සන\nපොදු දිනටම සඳහා"];
  const panelBody = (data.panel || []).map((row, index) => [
    String(index + 1).padStart(2, "0"),
    [row.name, row.post].filter(Boolean).join(", "),
    row.role || "",
    "",
  ]);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pageW, pageH);
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = margin;
  const paintCenter = (lines, size, weight) => {
    ctx.font = `${weight} ${size}px ${fontName}`;
    lines.forEach((line) => {
      y += size;
      ctx.fillText(line, pageW / 2, y);
      y += 6;
    });
  };
  paintCenter(titles[0], titleSize, 700);
  titles.slice(1).forEach((lines) => paintCenter(lines, subSize, 700));
  y += 10;
  const font = Math.max(11, Math.min(16, Math.floor(rowH * 0.38)));
  const paintTable = (widths, header, body, top) => {
    const draw = (cells, headerRow, rowTop) => {
      const height = headerRow ? Math.max(rowH, font * 2 + 14) : rowH;
      let x = margin;
      ctx.font = `${headerRow ? 700 : 400} ${font}px ${fontName}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "#222222";
      ctx.fillStyle = "#111111";
      ctx.lineWidth = 1;
      cells.forEach((text, index) => {
        const cellW = widths[index];
        ctx.strokeRect(x, rowTop, cellW, height);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 3, rowTop + 2, Math.max(1, cellW - 6), Math.max(1, height - 4));
        ctx.clip();
        const lines = canvasWrap(ctx, text, Math.max(8, cellW - 8));
        const lineH = font + 2;
        const block = lines.length * lineH;
        let textY = rowTop + Math.max(2, (height - block) / 2) + lineH / 2;
        lines.forEach((line) => {
          ctx.fillText(line, x + cellW / 2, textY);
          textY += lineH;
        });
        ctx.restore();
        x += cellW;
      });
      return rowTop + height;
    };
    let cursor = draw(header, true, top);
    body.forEach((row) => { cursor = draw(row, false, cursor); });
    return cursor;
  };
  y = paintTable(staffWidths, staffHead, staffBody, y);
  y += 14;
  ctx.font = `700 ${font + 1}px ${fontName}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = "අත්සන් මණ්ඩලය";
  const labelW = ctx.measureText(label).width + 28;
  ctx.fillStyle = "#d9d9d9";
  ctx.fillRect((pageW - labelW) / 2, y, labelW, 24);
  ctx.fillStyle = "#111111";
  ctx.fillText(label, pageW / 2, y + 12);
  y += 32;
  paintTable(panelWidths, panelHead, panelBody.length ? panelBody : [["", "", "", ""]], y);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  const jpeg = new Uint8Array(await blob.arrayBuffer());
  saveBlob(jpegPdfPages([{ jpeg, width: pageW, height: pageH }], "595.28", "841.89"), `athsan-mandalaya-${localToday()}.pdf`);
}

function jpegPdf(jpeg, imageWidth, imageHeight, pageWidthPt, pageHeightPt) {
  return jpegPdfPages([{ jpeg, width: imageWidth, height: imageHeight }], pageWidthPt, pageHeightPt);
}

function jpegPdfPages(images, pageWidthPt, pageHeightPt) {
  const pageW = pageWidthPt || "595.28";
  const pageH = pageHeightPt || "841.89";
  const encoder = new TextEncoder();
  const chunks = [];
  let offset = 0;
  const offsets = [];
  const add = (data) => {
    const bytes = typeof data === "string" ? encoder.encode(data) : data;
    chunks.push(bytes);
    offset += bytes.length;
  };
  add("%PDF-1.4\n");
  const obj = (body) => {
    offsets.push(offset);
    add(body);
  };
  const sheets = images.length ? images : [];
  const kids = sheets.map((_, index) => `${3 + index * 3} 0 R`).join(" ");
  obj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  obj(`2 0 obj\n<< /Type /Pages /Count ${sheets.length} /Kids [${kids}] >>\nendobj\n`);
  sheets.forEach((image, index) => {
    const pageObj = 3 + index * 3;
    const contentObj = 4 + index * 3;
    const imageObj = 5 + index * 3;
    obj(`${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents ${contentObj} 0 R /Resources << /XObject << /Im0 ${imageObj} 0 R >> >> >>\nendobj\n`);
    const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`;
    obj(`${contentObj} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
    offsets.push(offset);
    add(`${imageObj} 0 obj\n`);
    add(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.jpeg.length} >>\nstream\n`);
    add(image.jpeg);
    add("\nendstream\nendobj\n");
  });
  const xref = offset;
  let table = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((pos) => {
    table += String(pos).padStart(10, "0") + " 00000 n \n";
  });
  add(table);
  add(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

function sheetRows(block) {
  return [...block.querySelectorAll("tr.sheet-row")].map((row) => ({
    time: row.querySelector("[name=sessTime]")?.value || "",
    session: row.querySelector("[name=sessName]")?.value || "",
    lecturer: row.querySelector("[name=sessLecturer]")?.value || "",
    points: row.querySelector("[name=sessPoints]")?.value || "",
  })).filter((row) => row.time.trim() || row.session.trim() || row.lecturer.trim() || row.points.trim());
}

function sheetPayload(form) {
  const data = new FormData(form);
  let people = [];
  try {
    people = JSON.parse(data.get("people") || "[]");
  } catch (error) {
    people = [];
  }
  const blocks = [...form.querySelectorAll(".format-day")];
  return {
    id: data.get("id") || "",
    atp: data.get("atp") || "",
    title: data.get("title") || "",
    place: data.get("place") || "",
    target: data.get("target") || "",
    coordinator: data.get("coordinator") || "",
    coordinatorPost: data.get("coordinatorPost") || "",
    supervisor: data.get("supervisor") || "",
    supervisorPost: data.get("supervisorPost") || "",
    people,
    lecturers: (() => {
      try {
        return JSON.parse(data.get("lecturers") || "[]");
      } catch (error) {
        return [];
      }
    })(),
    stime: data.get("stime") || "",
    etime: data.get("etime") || "",
    liaison: {
      name: data.get("liaisonName") || "",
      post: data.get("liaisonPost") || "",
      office: data.get("liaisonOffice") || "",
    },
    dates: blocks.map((block) => block.dataset.date || ""),
    days: blocks.map((block, index) => ({
      title: sheetDate(block.dataset.date) || `දිනය ${index + 1}`,
      body: JSON.stringify({ date: block.dataset.date || "", sessions: sheetRows(block) }),
    })),
  };
}

function downloadModuleExcel(dayCount) {
  const count = Math.max(1, Math.min(60, Number(dayCount) || 10));
  const rows = [["දිනය", "කාලය", "සැසිය", "දේශකයා", "විෂය කරුණු සහ ක්‍රියාකාරකම්"]];
  for (let day = 1; day <= count; day += 1) {
    for (let line = 0; line < 4; line += 1) rows.push([String(day), "", "", "", ""]);
  }
  const xmlEsc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = rows.map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${xmlEsc(cell)}</Data></Cell>`).join("")}</Row>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="module"><Table>${body}</Table></Worksheet>\n</Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "module-format.xls";
  link.click();
  URL.revokeObjectURL(link.href);
}

function sheetHeader(data) {
  const sheet = data.sheet || {};
  return {
    title: data.title || sheet.name || "",
    place: data.place || sheet.place || "",
    target: data.target || sheet.target || "",
    coordinator: data.coordinator || sheet.coordinator || "",
    coordinatorPost: data.coordinatorPost || sheet.coordinatorPost || "",
    supervisor: data.supervisor || sheet.supervisor || "",
    supervisorPost: data.supervisorPost || sheet.supervisorPost || "",
    people: data.people || sheet.people || [],
    lecturers: data.lecturers || sheet.lecturers || [],
    stime: data.stime || sheet.stime || "",
    etime: data.etime || sheet.etime || "",
    liaison: data.liaison || sheet.liaison || {},
    dates: data.dates || sheet.dates || [],
  };
}

function formatModuleCanvas(header, day, index) {
  const parts = moduleDayData(day);
  const date = sheetDate((header.dates || [])[index - 1] || parts.date || "");
  const liaison = header.liaison || {};
  const sessions = (parts.sessions || []).filter((row) => String(row.time || row.session || row.lecturer || row.points || "").trim());
  const plan = lecturePlan(header.lecturers, header.stime, header.etime);
  const many = plan.length > 1 || sessions.some((row) => String(row.lecturer || "").trim());
  const rows = sessions.length ? sessions : [{ time: "", session: "", lecturer: "", points: "" }];
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext("2d");
  const margin = Math.round(1240 / 8.27);
  const width = canvas.width - margin * 2;
  const colW = many
    ? [Math.round(width * 0.18), Math.round(width * 0.20), Math.round(width * 0.22), 0]
    : [Math.round(width * 0.22), Math.round(width * 0.26), 0];
  colW[colW.length - 1] = width - colW.slice(0, -1).reduce((sum, item) => sum + item, 0);
  const draw = (fontSize) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111111";
    ctx.textBaseline = "top";
    const lineH = fontSize + 8;
    let y = margin;
    const center = (text, weight, size) => {
      ctx.font = `${weight} ${size}px "Noto Sans Sinhala", sans-serif`;
      ctx.textAlign = "center";
      wrapLetterLines(ctx, text, width).forEach((line) => {
        if (!line) return;
        ctx.fillText(line, canvas.width / 2, y);
        y += size + 8;
      });
    };
    center("වයඹ පළාත් සභාව", 700, fontSize + 4);
    center("කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය", 700, fontSize + 1);
    if (header.place) center(header.place, 400, fontSize);
    y += 12;
    ctx.textAlign = "left";
    [
      `පුහුණු වැඩසටහනේ නම: ${header.title || ""}`,
      `දිනය: ${date}`,
      `ඉලක්ක කණ්ඩායම: ${header.target || ""}`,
    ].forEach((fact) => {
      ctx.font = `700 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
      wrapLetterLines(ctx, fact, width).forEach((line) => {
        ctx.fillText(line, margin, y);
        y += lineH;
      });
    });
    y += 8;
    if (plan.length) {
      ctx.font = `700 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
      ctx.fillText(plan.length === 1 ? "දේශකයා" : "දේශකයන්", margin, y);
      y += lineH + 2;
      plan.forEach((item) => {
        const who = item.lecturer || {};
        if (item.time || item.part) {
          ctx.font = `700 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
          ctx.fillText([item.part, item.time].filter(Boolean).join(" "), margin, y);
          y += lineH;
        }
        ctx.font = `400 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
        [`නම: ${who.name || ""}`, `තනතුර: ${who.post || ""}`, `ආයතනය: ${who.office || ""}`].forEach((line) => {
          wrapLetterLines(ctx, `•  ${line}`, width).forEach((part) => {
            ctx.fillText(part, margin, y);
            y += lineH;
          });
        });
        y += 4;
      });
    }
    y += 8;
    ctx.font = `400 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
    const headerH = lineH + 14;
    const pointCol = colW.length - 1;
    const measured = rows.map((row) => {
      const packs = [wrapLetterLines(ctx, row.time || " ", colW[0] - 16), wrapLetterLines(ctx, row.session || " ", colW[1] - 16)];
      if (many) packs.push(wrapLetterLines(ctx, row.lecturer || " ", colW[2] - 16));
      packs.push(String(row.points || " ").split(/\n/).flatMap((part) => wrapLetterLines(ctx, part || " ", colW[pointCol] - 16)));
      const count = Math.max(...packs.map((lines) => lines.length), 1);
      return { packs, height: count * lineH + 16 };
    });
    const foot = [
      `•  සමායෝජන සම්බන්ධීකරණය: ${namedPost(header.coordinatorPost, header.coordinator)}`,
      `•  සම්පත්දායක අධීක්ෂණය: ${namedPost(header.supervisorPost, header.supervisor)}`,
      `•  සම්බන්ධීකරණය: ${namedPost(liaison.post, liaison.name)}`,
    ];
    const footHeight = foot.reduce((sum, line) => sum + wrapLetterLines(ctx, line, width).length * lineH, 0) + 20;
    const tableH = headerH + measured.reduce((sum, row) => sum + row.height, 0);
    if (y + tableH + footHeight > canvas.height - margin) return false;
    const labels = many ? ["කාලය", "සැසිය", "දේශකයා", "විෂය කරුණු සහ ක්‍රියාකාරකම්"] : ["කාලය", "සැසිය", "විෂය කරුණු සහ ක්‍රියාකාරකම්"];
    ctx.fillStyle = "#e4e4e4";
    ctx.fillRect(margin, y, width, headerH);
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#111111";
    ctx.font = `700 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
    ctx.textAlign = "center";
    labels.forEach((label, col) => {
      const x = margin + colW.slice(0, col).reduce((sum, item) => sum + item, 0);
      ctx.strokeRect(x, y, colW[col], headerH);
      ctx.fillText(label, x + colW[col] / 2, y + 7);
    });
    y += headerH;
    measured.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        ctx.fillStyle = "#f3f3f3";
        ctx.fillRect(margin, y, width, row.height);
      }
      ctx.strokeStyle = "#222222";
      ctx.fillStyle = "#111111";
      ctx.font = `400 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
      row.packs.forEach((lines, col) => {
        const x = margin + colW.slice(0, col).reduce((sum, item) => sum + item, 0);
        ctx.strokeRect(x, y, colW[col], row.height);
        const left = col >= (many ? 2 : 2) && col === row.packs.length - 1 || (many && col === 2);
        ctx.textAlign = left ? "left" : "center";
        lines.forEach((line, lineIndex) => {
          if (!String(line).trim()) return;
          ctx.fillText(line, left ? x + 8 : x + colW[col] / 2, y + 8 + lineIndex * lineH);
        });
      });
      y += row.height;
    });
    y += 18;
    ctx.textAlign = "left";
    foot.forEach((line) => {
      wrapLetterLines(ctx, line, width).forEach((part) => {
        ctx.fillText(part, margin, y);
        y += lineH;
      });
    });
    return true;
  };
  let size = 22;
  while (size > 12 && !draw(size)) size -= 1;
  draw(size);
  return canvas;
}

function modulePageCanvas(title, day) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext("2d");
  const margin = Math.round(1240 / 8.27);
  const maxW = canvas.width - margin * 2;
  const draw = (fontSize) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111111";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    let y = margin;
    ctx.font = `700 ${fontSize + 8}px "Noto Sans Sinhala", sans-serif`;
    wrapLetterLines(ctx, title, maxW).forEach((line) => {
      ctx.fillText(line, margin, y);
      y += fontSize + 16;
    });
    y += 10;
    ctx.font = `700 ${fontSize + 2}px "Noto Sans Sinhala", sans-serif`;
    const heading = `දිනය ${day.no}${day.title ? "  " + day.title : ""}`;
    wrapLetterLines(ctx, heading, maxW).forEach((line) => {
      ctx.fillText(line, margin, y);
      y += fontSize + 12;
    });
    y += 16;
    ctx.font = `400 ${fontSize}px "Noto Sans Sinhala", sans-serif`;
    const lineH = fontSize + 10;
    let overflow = false;
    wrapLetterLines(ctx, day.body || "", maxW).forEach((line) => {
      if (y + lineH > canvas.height - margin) {
        overflow = true;
        return;
      }
      ctx.fillText(line, margin, y);
      y += lineH;
    });
    return !overflow;
  };
  let size = 26;
  while (size > 16 && !draw(size)) size -= 2;
  draw(size);
  return canvas;
}

async function saveModulePdf(data) {
  const days = (data.days || []).filter((day) => String(day.title || day.body || "").trim());
  if (!days.length) {
    if (data.fileUrl) {
      window.open(data.fileUrl, "_blank", "noopener");
      return;
    }
    throw new Error(L("මුද්‍රණය කරන්න අන්තර්ගතයක් නැත.", "அச்சிட உள்ளடக்கம் இல்லை.", "There is nothing to print."));
  }
  await document.fonts.ready;
  await document.fonts.load("700 32px 'Noto Sans Sinhala'").catch(() => {});
  await document.fonts.load("400 22px 'Noto Sans Sinhala'").catch(() => {});
  const formatted = days.some((day) => String(day.body || "").trim().startsWith("{"));
  const images = [];
  const header = sheetHeader(data);
  for (const [index, day] of days.entries()) {
    const page = formatted
      ? formatModuleCanvas(header, day, index + 1)
      : modulePageCanvas(data.title || "", day);
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
    images.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: page.width, height: page.height });
  }
  saveBlob(jpegPdfPages(images), `module-${localToday()}.pdf`);
}

async function saveLetter(kind) {
  const page = await drawLetterCanvas();
  const stamp = localToday();
  if (kind === "image") {
    const blob = await new Promise((resolve) => page.toBlob(resolve, "image/png"));
    saveBlob(blob, `nomination-letter-${stamp}.png`);
    return;
  }
  const blob = await new Promise((resolve) => page.toBlob(resolve, "image/jpeg", 0.92));
  const jpeg = new Uint8Array(await blob.arrayBuffer());
  saveBlob(jpegPdf(jpeg, page.width, page.height), `nomination-letter-${stamp}.pdf`);
}

async function submitMessage(form, task) {
  const slot = form.querySelector("#form-msg") || $("#form-msg");
  try {
    await task();
  } catch (error) {
    if (slot) slot.innerHTML = `<div class="error">${esc(error.message)}</div>`;
    else alert(error.message);
  }
}

async function addNeedToPlan(need) {
  const today = new Date().toISOString().slice(0, 10);
  await api("save", {
    method: "POST",
    body: {
      table: "cp_atp",
      data: {
        atp_trReqID: need.req_id,
        atp_requestDate: today,
        atp_trname: need.req_training,
        atp_reqdesig: need.req_post,
        atp_reqoffice: need.req_addoffice,
        atp_noofparticipants: need.req_noofemps,
        atp_isinatp: YES,
        atp_isaddatp: YES,
        atp_addhome: NO,
        atp_trtype: TYPE_MDTU,
      },
    },
  });
  await api("save", {
    method: "POST",
    body: { table: "cp_trrequirements", data: { req_id: need.req_id, req_isadd: YES } },
  });
}

async function setPlanMembership(id, included) {
  await api("save", {
    method: "POST",
    body: {
      table: "cp_atp",
      data: { atp_id: id, atp_isaddatp: included ? YES : NO, atp_isinatp: included ? YES : NO },
    },
  });
}

document.body.addEventListener("input", (event) => {
  if (event.target.closest?.("#ahead-form")) {
    const note = document.getElementById("tamil-note");
    if (note) note.textContent = "";
    paintTamilSummary();
  }
  if (event.target.closest?.("#pace-report")) paintPaceLive();
  if (event.target.closest?.("#total-form")) paintTotalSums();
  if (event.target.id === "format-find") {
    paintFormatSearch(event.target.value);
  }
  if (event.target.name === "find" && (event.target.form?.id === "eval-pick" || event.target.form?.id === "message-pick")) {
    const query = String(event.target.value || "").trim().toLowerCase();
    event.target.form.querySelectorAll("[name=atp] option").forEach((option) => {
      option.hidden = query !== "" && !option.textContent.toLowerCase().includes(query);
    });
  }
  const form = event.target.closest?.("#advance-form");
  if (form && (event.target.name === "advance" || event.target.name === "spent")) paintAdvance(form);
  const food = event.target.closest?.("#foodbill-form");
  if (food && event.target.name === "billamount") paintFoodBill(food, true);
  if (food && event.target.name === "food") paintFoodBill(food, false);
  const allowance = event.target.closest?.("#allowance-form");
  if (allowance && ["resource", "coord", "supervise", "liaise", "account", "office"].includes(event.target.name)) paintAllowance(allowance);
});

document.body.addEventListener("change", async (event) => {
  if (event.target.matches("[data-year-pick]")) {
    rememberYear(event.target.value);
    if (event.target.closest("#year-bar")) {
      const raw = location.hash.replace(/^#/, "");
      const cut = raw.indexOf("?");
      const path = "#" + (cut === -1 ? raw : raw.slice(0, cut));
      const params = new URLSearchParams(cut === -1 ? "" : raw.slice(cut + 1));
      params.set("year", event.target.value);
      if (path === "#console/attended") params.delete("atp");
      location.hash = `${path}?${params}`;
    }
  }
  if (event.target.name === "year" && event.target.form?.id === "total-year") {
    rememberYear(event.target.value);
    location.hash = `#console/total?year=${encodeURIComponent(event.target.value)}`;
    return;
  }
  if (event.target.id === "panel-programme") {
    const year = chosenYear();
    const id = event.target.value;
    location.hash = id
      ? `#console/panelsign?year=${encodeURIComponent(year)}&id=${encodeURIComponent(id)}`
      : `#console/panelsign?year=${encodeURIComponent(year)}`;
    return;
  }
  if (event.target.id === "pace-year" || event.target.id === "pace-month" || event.target.id === "pace-date") {
    const year = document.querySelector("#pace-year")?.value || chosenYear();
    rememberYear(year);
    const tab = state.query.get("tab") === "report" ? "report" : "sheet";
    location.hash = paceHash(year, tab, {
      until: document.querySelector("#pace-date")?.value || "",
    });
    return;
  }
  if (event.target.id === "person-year") {
    rememberYear(event.target.value);
    const tab = state.query.get("tab") === "detail" ? "detail" : "summary";
    location.hash = `#console/person?year=${encodeURIComponent(event.target.value)}&tab=${tab}`;
    return;
  }
  if (event.target.closest?.("#total-form")) paintTotalSums();
  if (event.target.id === "module-excel" && event.target.files?.[0]) {
    const form = document.querySelector("#module-format-form");
    const file = event.target.files[0];
    event.target.value = "";
    if (!form) {
      alert(L("පුහුණුවක් තෝරන්න.", "ஒரு பயிற்சியைத் தேர்ந்தெடுக்கவும்.", "Choose a programme."));
      return;
    }
    const body = new FormData();
    body.append("file", file);
    try {
      const saved = await api("module-excel", { method: "POST", form: body });
      (saved.days || []).forEach((day) => {
        const block = form.querySelector(`.format-day[data-no="${day.no}"]`);
        const slot = block?.querySelector("tbody");
        if (!slot || !day.sessions?.length) return;
        slot.innerHTML = day.sessions.map((row) => sheetSessionRow(row)).join("");
        if (day.sessions.some((row) => String(row.lecturer || "").trim())) block.querySelector(".sheet-table")?.classList.remove("solo");
      });
      const slot = form.querySelector("#form-msg");
      if (slot) slot.innerHTML = `<div class="ok">${esc(L("Excel ආකෘතිය පිටුවලට දැම්මා. සුරකින්න.", "Excel படிவம் பக்கங்களில் இடப்பட்டது. சேமிக்கவும்.", "The Excel form was placed on the pages. Save it."))}</div>`;
    } catch (error) {
      alert(error.message);
    }
    return;
  }
  if (event.target.name === "atp" && event.target.form?.id === "message-pick") {
    location.hash = `#console/messages?atp=${encodeURIComponent(event.target.value || "")}`;
    return;
  }
  if (event.target.name === "atp" && event.target.form?.id === "eval-pick") {
    location.hash = `#console/evaluation?atp=${encodeURIComponent(event.target.value || "")}`;
    return;
  }
  if (event.target.name === "officePick") {
    applyOfficePick(event.target);
    return;
  }
  if (event.target.name === "officeNid") {
    fillOfficeName(event.target);
    return;
  }
  if (event.target.name === "year" && event.target.form?.id === "completed-year") {
    rememberYear(event.target.value);
    location.hash = `#console/cp_completedtrainings?year=${encodeURIComponent(event.target.value || "")}`;
    return;
  }
  if (event.target.name === "year" && event.target.form?.id === "advance-year") {
    rememberYear(event.target.value);
    const atp = state.query?.get("atp") || "";
    location.hash = `#console/advance?tab=report&year=${encodeURIComponent(event.target.value || "")}${atp ? `&atp=${encodeURIComponent(atp)}` : ""}`;
    return;
  }
  if (event.target.name === "year" && event.target.form?.id === "provision-year") {
    rememberYear(event.target.value);
    location.hash = `#console/provision?tab=report&year=${encodeURIComponent(event.target.value || "")}`;
    return;
  }
  const nextPlan = event.target.closest("[data-next-plan]");
  if (nextPlan && nextPlan.files[0]) {
    const year = document.querySelector("#next-plan [name=year]")?.value || "";
    const body = new FormData();
    body.append("file", nextPlan.files[0]);
    body.append("year", year);
    try {
      const saved = await api("next-plan", { method: "POST", form: body });
      rememberYear(saved.year || year);
      alert(L("සැලැස්මට ගිය පුහුණු: ", "திட்டத்திற்குச் சென்ற பயிற்சி: ", "Programmes sent to the plan: ") + saved.saved);
      location.hash = `#console/plan?year=${encodeURIComponent(saved.year || year)}`;
    } catch (error) {
      alert(error.message);
    }
    nextPlan.value = "";
    return;
  }
  if (event.target.name === "pv_year" && event.target.form?.id === "provision-form") {
    const year = String(event.target.value || "").replace(/\D/g, "");
    if (year.length === 4) location.hash = `#console/provision?tab=edit&year=${encodeURIComponent(year)}`;
    return;
  }
  if (event.target.name === "nid" && event.target.closest("#apply-form")) {
    fillApplyOfficer(event.target.value);
  }
  const incoming = event.target.closest("[data-import]");
  if (incoming && incoming.files[0]) {
    const body = new FormData();
    body.append("file", incoming.files[0]);
    body.append("table", incoming.dataset.import);
    try {
      const saved = await api("import", { method: "POST", form: body });
      alert(L("ඇතුළත් කළ පේළි: ", "சேமித்த வரிகள்: ", "Rows saved: ") + saved.saved);
      route();
    } catch (error) {
      alert(error.message);
    }
    incoming.value = "";
    return;
  }
  const planDate = event.target.closest("[data-plan-date]");
  if (planDate && (planDate.form?.id === "annual-form" || planDate.form?.id === "offweb-form")) {
    const firstDate = planDate.form.querySelector("#plan-dates input");
    if (planDate === firstDate || planDate.name === "atp_day1") shiftPlanDates(planDate.form);
    else planDate.dataset.touched = "1";
    return;
  }
  const slidePick = event.target.closest("[data-slide-pick]");
  if (slidePick) {
    state.slidePicks = [...(state.slidePicks || []), ...slidePick.files];
    slidePick.value = "";
    paintSlidePicks();
    return;
  }
  const input = event.target.closest("[data-upload]");
  if (!input || !input.files[0]) return;
  const body = new FormData();
  body.append("file", input.files[0]);
  body.append("folder", input.dataset.folder);
  try {
    const saved = await api("upload", { method: "POST", form: body });
    const target = input.form.querySelector(`[name="${input.dataset.upload}"]`);
    if (target) target.value = saved.name;
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("DOMContentLoaded", boot);

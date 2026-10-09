<?php
require_once __DIR__ . '/security.php';
mdtu_security_headers();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MDTU - NWP Certificate Application & Management System</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- html2pdf.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <!-- jsPDF + AutoTable (multi-page text PDF registers) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
    <!-- html2canvas -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <!-- SheetJS (xlsx) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <!-- QR code generator -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Great+Vibes&family=Montserrat:wght@400;600;700;800&family=Inter:wght@300;400;600;700;900&family=Noto+Serif+Sinhala:wght@500;700;800&family=Noto+Sans+Tamil:wght@500;700&family=Tinos:ital,wght@0,400;0,700;1,400&display=swap');

        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-signature { font-family: 'Great Vibes', cursive; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-garamond { font-family: 'Cormorant Garamond', Georgia, serif; }

        /* ---------- Certificates (fixed A4 pixel size at 96dpi so PDF export is exact) ---------- */
        .cert-landscape { width: 1122px; height: 793px; }
        .cert-portrait  { width: 793px;  height: 1122px; }
        .cert-sheet {
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            background: #fffdf6;
            color: #1e1b4b;
            font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .cert-sheet * { box-sizing: border-box; }
        .cert-frame-outer { position: absolute; inset: 18px; border: 10px solid #1e1b4b; }
        .cert-frame-gold  { position: absolute; inset: 32px; border: 3px solid #b8860b; }
        .cert-frame-inner { position: absolute; inset: 40px; border: 1px solid #d4af37; }
        .cert-corner { position: absolute; width: 70px; height: 70px; border-color: #b8860b; border-style: solid; }
        .cert-corner.tl { top: 48px; left: 48px; border-width: 4px 0 0 4px; }
        .cert-corner.tr { top: 48px; right: 48px; border-width: 4px 4px 0 0; }
        .cert-corner.bl { bottom: 48px; left: 48px; border-width: 0 0 4px 4px; }
        .cert-corner.br { bottom: 48px; right: 48px; border-width: 0 4px 4px 0; }
        .cert-corner::after { content: ''; position: absolute; width: 12px; height: 12px; background: #1e1b4b; transform: rotate(45deg); }
        .cert-corner.tl::after { top: 8px; left: 8px; }
        .cert-corner.tr::after { top: 8px; right: 8px; }
        .cert-corner.bl::after { bottom: 8px; left: 8px; }
        .cert-corner.br::after { bottom: 8px; right: 8px; }
        .cert-watermark {
            position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
            pointer-events: none; opacity: 0.06;
        }
        .cert-watermark img { width: 360px; height: 360px; object-fit: contain; }
        .cert-watermark span { font-family: 'Cinzel', serif; font-size: 190px; font-weight: 900; color: #1e1b4b; letter-spacing: 12px; }
        .cert-rule { height: 2px; background: linear-gradient(90deg, transparent, #b8860b, transparent); }
        .cert-seal {
            width: 104px; height: 104px; border-radius: 50%;
            background: radial-gradient(circle at 35% 30%, #fde68a 0%, #d4af37 45%, #92400e 100%);
            border: 4px double #fffbeb; box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            font-family: 'Cinzel', serif; color: #451a03; text-align: center; line-height: 1.1;
        }
        .cert-qr img, .cert-qr canvas { display: block; width: 100% !important; height: 100% !important; }
        .cert-sizer { margin: 0 auto; overflow: hidden; overflow: clip; box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.45); }
        .cert-sizer > .cert-sheet { transform-origin: top left; }
        /* ---------- Attendance certificate on the Chief Secretary's Office letterhead ---------- */
        .lh-sheet { background: #ffffff; color: #1f2937; font-family: 'Tinos', 'Times New Roman', Times, serif; }
        .lh-si { font-family: 'Noto Serif Sinhala', 'Iskoola Pota', 'Nirmala UI', serif; }
        .lh-ta { font-family: 'Noto Sans Tamil', 'Nirmala UI', 'Latha', sans-serif; }
        .lh-en { font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; }
        .lh-maroon { color: #8b1a1a; }
        .lh-rule { height: 2px; background: #8b1a1a; }
        .lh-brace { display: inline-block; font-family: 'Tinos', 'Times New Roman', serif; font-weight: 400; line-height: 1; color: #8b1a1a; transform: scaleX(0.55); transform-origin: center; margin: 0 -4px; }
        .lh-ref { display: flex; align-items: center; gap: 2px; }
        .lh-ref-labels { font-size: 9.5px; line-height: 1.3; color: #8b1a1a; white-space: nowrap; }
        .lh-ref-labels .lh-si { font-weight: 700; }
        .lh-ref-value { font-size: 13.5px; font-weight: 700; color: #111827; white-space: nowrap; }
        .lh-row { display: flex; padding: 6px 0; border-bottom: 1px dotted #cbd5e1; }
        .lh-row > span:first-child { width: 190px; flex-shrink: 0; font-weight: 700; color: #374151; }
        .lh-row > span:last-child { font-weight: 700; color: #111827; }
        .lh-contact { display: flex; align-items: center; gap: 2px; }
        .lh-contact-labels { font-size: 7.2px; line-height: 1.35; color: #8b1a1a; white-space: nowrap; }
        .lh-contact-labels .lh-si, .lh-contact-labels .lh-ta { font-weight: 700; }
        .lh-contact-labels .lh-en-t { font-family: 'Tinos', 'Times New Roman', serif; font-size: 8.6px; }
        .lh-contact-lines { font-size: 8.2px; line-height: 1.4; color: #4b1d1d; white-space: nowrap; }
        .lh-contact-lines b { display: inline-block; width: 26px; font-weight: 400; color: #8b1a1a; }
        .tpl-logo.hidden, .tpl-logo-default.hidden, .tpl-seal.hidden, .tpl-seal-default.hidden, .tpl-signature.hidden, .tpl-signature-default.hidden { display: none !important; }

        /* ---------- Mobile navigation drawer ---------- */
        @media (max-width: 767px) {
            #sidebarNav { transform: translateX(-100%); transition: transform 0.25s ease; }
            #sidebarNav.open { transform: translateX(0); }
        }

        .slide-card {
            width: 100%;
            max-width: 280mm;
            min-height: 157mm;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: #ffffff;
            box-sizing: border-box;
            page-break-after: always;
        }

        @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white; color: black; font-size: 11pt; padding: 0; margin: 0; }
            .card { box-shadow: none; border: 1px solid #aaa; padding: 0 !important; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #666 !important; padding: 6px !important; }
            .page-break { page-break-before: always; margin-top: 2rem; }
            
            @page { size: A4 landscape; margin: 10mm; }
        }
        
        .print-only { display: none; }
        .nav-heading { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; padding: 0 0.5rem 0.25rem; }
        .tab-btn { display: flex; align-items: center; gap: 0.5rem; width: 100%; text-align: left; font-size: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 0.5rem; border-left: 4px solid transparent; transition: background-color 0.15s; }
        .tab-btn:hover { background-color: #1e1b4b; }
        .nav-group { padding-top: 0.5rem; margin-top: 0.25rem; border-top: 1px solid #312e81; }
        .nav-group:first-of-type { border-top: 0; margin-top: 0; }
        .nav-group > summary { list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.5rem; border-radius: 0.375rem; user-select: none; }
        .nav-group > summary::-webkit-details-marker { display: none; }
        .nav-group > summary::after { content: '▸'; font-size: 12px; transition: transform 0.15s; }
        .nav-group[open] > summary::after { transform: rotate(90deg); }
        .nav-group > summary:hover { background-color: #1e1b4b; color: #fff; }
        .nav-group > .tab-btn { margin-top: 0.15rem; }
        .home-tile { display: flex; align-items: center; gap: 0.75rem; text-align: left; padding: 0.9rem 1rem; border-radius: 0.85rem; background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(15,23,42,.06); transition: transform .12s, box-shadow .12s, border-color .12s; }
        .home-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(30,27,75,.12); border-color: #a5b4fc; }
        .home-tile .tile-icon { width: 2.6rem; height: 2.6rem; border-radius: 0.7rem; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; }
        .tab-btn.active {
            border-left: 4px solid #f59e0b;
            color: #ffffff;
            font-weight: bold;
            background-color: #312e81;
        }
        
        #google_translate_element {
            display: inline-block !important;
            vertical-align: middle;
        }
        #google_translate_element .goog-te-gadget {
            font-family: inherit !important;
            color: transparent !important;
            font-size: 0px !important;
        }
        #google_translate_element .goog-te-gadget span {
            display: none !important;
        }
        #google_translate_element select {
            background-color: #090d16 !important;
            color: #fbbf24 !important;
            border: 1.5px solid #f59e0b !important;
            border-radius: 0.5rem !important;
            padding: 0.35rem 0.6rem !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            outline: none !important;
            cursor: pointer !important;
            transition: all 0.2s ease-in-out;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        #google_translate_element select:hover {
            background-color: #1e1b4b !important;
            border-color: #fde047 !important;
            color: #ffffff !important;
        }
        .goog-te-banner-frame.skiptranslate {
            display: none !important;
        }
        body {
            top: 0px !important;
        }
    </style>
</head>
<body class="bg-slate-100 min-h-screen text-slate-800 font-sans flex flex-col justify-between">

<!-- Shown when the database / server cannot be reached -->
<div id="dbStatusBanner" class="hidden bg-rose-700 text-white text-xs font-bold px-4 py-2 text-center no-print"></div>

<div class="w-full">
<!-- Top Navigation & Header Bar -->
<header class="bg-indigo-900 text-white shadow-xl no-print border-b-4 border-amber-500 md:sticky md:top-0 z-30">
    <div id="headerNewsAlertBar" class="bg-red-700 text-white px-3 sm:px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-2 shadow-inner">
        <div class="flex items-center gap-2 overflow-hidden min-w-0">
            <span class="bg-white text-red-700 px-2 py-0.5 rounded text-[10px] font-black uppercase animate-pulse shrink-0">🚨 Alert</span>
            <span id="headerAlertTickerText" class="truncate">Loading...</span>
        </div>
        <button onclick="openManageAlertModal()" class="admin-only hidden shrink-0 bg-red-900 hover:bg-red-800 text-white text-[10px] px-2 py-0.5 rounded border border-red-500">Manage Alert</button>
    </div>

    <div id="headerYellowAlertBar" class="hidden bg-amber-100 text-amber-950 px-3 sm:px-4 py-1.5 text-xs font-semibold border-t border-amber-300 shadow-inner">
        <div id="headerYellowAlertListContainer" class="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-0.5"></div>
    </div>

    <div class="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onclick="toggleMobileSidebar()" class="md:hidden shrink-0 bg-indigo-800 text-amber-300 w-10 h-10 rounded-lg border border-indigo-600 text-xl leading-none" aria-label="Open menu">☰</button>
            <div class="h-12 sm:h-16 flex items-center justify-center shrink-0">
                <img id="headerLogoImg" src="assets/nwp-logo.png" width="219" height="256" class="h-full w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]" alt="North Western Provincial Council Emblem" />
                </div>
            <div class="min-w-0">
                <h1 class="text-sm sm:text-xl font-extrabold tracking-wide uppercase text-red-400 leading-tight">Training Management System</h1>
                <h2 class="text-[10px] sm:text-sm font-black tracking-wide uppercase text-slate-200 leading-tight">Management Development and Training Unit</h2>
                <p class="text-amber-400 font-bold text-[9px] sm:text-xs tracking-wider">MDTU - NORTH WESTERN PROVINCE (NWP)</p>
                </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button id="authBtn" onclick="toggleAuthModal()" class="bg-amber-500 hover:bg-amber-400 text-indigo-950 text-xs font-black px-3 py-1.5 rounded-lg shadow transition">
                🔐 Login
            </button>

            <div class="bg-indigo-950/90 px-2 py-1 rounded-lg border border-indigo-700/80 flex items-center gap-1 shadow-inner">
                <span class="text-[10px] font-black text-amber-400 uppercase tracking-wider">🌐<span class="hidden sm:inline"> Translate:</span></span>
                <div id="google_translate_element"></div>
            </div>

            <div id="liveStatus" class="bg-slate-800 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span> Connecting...
            </div>

            <div class="logged-in-only hidden bg-indigo-950 px-2 py-1 rounded border border-indigo-700 flex items-center gap-1">
                <label for="activeYearSelect" class="text-xs font-semibold text-indigo-200">Year:</label>
                <select id="activeYearSelect" onchange="switchYear()" class="bg-indigo-900 text-white font-bold text-xs px-1 py-0.5 rounded outline-none border border-indigo-500"></select>
            </div>
        </div>
    </div>
</header>

<div id="sidebarOverlay" onclick="closeMobileSidebar()" class="hidden fixed inset-0 bg-slate-900/60 z-40 md:hidden no-print"></div>

<div class="flex flex-1 max-w-7xl w-full mx-auto relative">

    <!-- Left Sidebar Navigation (slide-in drawer on mobile) -->
    <aside id="sidebarNav" class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto md:static md:z-auto md:w-64 md:max-w-none md:overflow-visible md:min-h-screen bg-indigo-950 text-slate-200 p-4 space-y-1 no-print flex-shrink-0 border-r border-indigo-800 shadow-2xl md:shadow-none">
        <div class="flex justify-between items-center md:hidden mb-3 pb-2 border-b border-indigo-800">
            <span class="text-xs font-bold text-amber-400 uppercase">Navigation Menu</span>
            <button onclick="closeMobileSidebar()" class="text-white font-bold text-sm bg-indigo-900 px-3 py-1 rounded" aria-label="Close menu">✕</button>
        </div>
        <div id="sidebarUserBadge" class="logged-in-only hidden mb-3 p-2.5 rounded-lg bg-indigo-900 border border-indigo-700 text-[11px]"></div>

        <div class="logged-in-only hidden mb-2">
            <button onclick="switchTab('home')" id="tab-home" class="tab-btn !text-sm !font-black text-amber-300 bg-indigo-900/60">🏠 My Dashboard</button>
        </div>
        
        <details class="nav-group" data-tile-color="sky" open>
            <summary class="nav-heading">Officers</summary>
            <button onclick="switchTab('add-record')" id="tab-add-record" class="tab-btn active">➕ Add Training Record</button>
            <button onclick="switchTab('attendance-cert')" id="tab-attendance-cert" class="tab-btn">📄 Attendance Certificate</button>
            <button onclick="switchTab('certificate')" id="tab-certificate" class="tab-btn">🎓 e-Certificate (Completion)</button>
            <button onclick="switchTab('verification')" id="tab-verification" class="tab-btn">📜 Training History</button>
            <button onclick="switchTab('notifications-tab')" id="tab-notifications-tab" class="tab-btn text-amber-300">🔔 Notifications & Notes</button>
            <button onclick="switchTab('live-chat-tab')" id="tab-live-chat-tab" class="tab-btn text-emerald-300">💬 Live Support Chat</button>
        </details>

        <details class="nav-group admin-only hidden" data-tile-color="rose">
            <summary class="nav-heading text-rose-300">Administration</summary>
            <button onclick="switchTab('dashboard')" id="tab-dashboard" class="tab-btn">📊 Executive Dashboard</button>
            <button onclick="switchTab('confirm-attendance')" id="tab-confirm-attendance" class="tab-btn">✅ Verify & Confirm Attendance</button>
            <button onclick="switchTab('cert-register')" id="tab-cert-register" class="tab-btn text-amber-200">🧾 Issued Certificates Register</button>
            <button onclick="switchTab('manage-programs')" id="tab-manage-programs" class="tab-btn">⚙️ Programs & Venues</button>
            <button onclick="switchTab('training-namelist-report')" id="tab-training-namelist-report" class="tab-btn">📑 Participant Name List</button>
            <button onclick="switchTab('analytics')" id="tab-analytics" class="tab-btn">📈 Evaluation Analytics</button>
            <button onclick="switchTab('resource-report')" id="tab-resource-report" class="tab-btn">🎓 Lecturer Performance</button>
            <button onclick="switchTab('duty-report')" id="tab-duty-report" class="tab-btn">📋 Duty Hours Report</button>
            <button onclick="switchTab('pending')" id="tab-pending" class="tab-btn">⚠️ Incomplete Officers</button>
            <button onclick="switchTab('completed')" id="tab-completed" class="tab-btn">🟢 Completed Officers</button>
            <button onclick="switchTab('progress-reports')" id="tab-progress-reports" class="tab-btn text-amber-300">📑 Monthly Progress (All Months)</button>
        </details>

        <details class="nav-group super-user-only hidden" data-tile-color="amber">
            <summary class="nav-heading text-amber-400">Superuser Data Entry</summary>
            <button onclick="switchTab('progress-entry')" id="tab-progress-entry" class="tab-btn text-amber-200">📈 Monthly Progress Entry</button>
            <button onclick="switchTab('training-plan-entry')" id="tab-training-plan-entry" class="tab-btn text-teal-200">📝 Annual Training Plan Entry</button>
        </details>

        <details class="nav-group logged-in-only hidden" data-tile-color="indigo">
            <summary class="nav-heading text-indigo-300">Shared Reports</summary>
            <button onclick="switchTab('training-plan-report')" id="tab-training-plan-report" class="tab-btn text-teal-300">📋 Annual Training Plan Report</button>
            <button onclick="switchTab('resource-persons-master-report')" id="tab-resource-persons-master-report" class="tab-btn text-purple-300">👥 Resource Persons Directory</button>
            <button onclick="switchTab('office-report')" id="tab-office-report" class="tab-btn">🏢 Office 12h Status</button>
            <button onclick="switchTab('office-designation-report')" id="tab-office-designation-report" class="tab-btn">📊 Designation Breakdown</button>
        </details>

        <details class="nav-group super-admin-only hidden" data-tile-color="violet">
            <summary class="nav-heading text-rose-400">Super Admin Control</summary>
            <button onclick="switchTab('template-settings')" id="tab-template-settings" class="tab-btn">🔒 Certificate Templates</button>
            <button onclick="switchTab('user-management')" id="tab-user-management" class="tab-btn">👑 User Accounts</button>
            <button onclick="switchTab('audit-log')" id="tab-audit-log" class="tab-btn text-emerald-300">🛡️ Audit Log & Security</button>
            <button onclick="switchTab('resource-upload')" id="tab-resource-upload" class="tab-btn">👥 Upload Resource Master</button>
            <button onclick="switchTab('annual-excel-upload')" id="tab-annual-excel-upload" class="tab-btn">📁 Annual Staff Matrix</button>
            <button onclick="switchTab('archive-tab')" id="tab-archive-tab" class="tab-btn text-indigo-300">🏛️ Database Backup</button>
        </details>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-3 sm:p-6 space-y-6 overflow-x-hidden w-full max-w-full">

        <!-- Back-to-dashboard bar (logged-in users, every page except the dashboard) -->
        <div id="breadcrumbBar" class="hidden no-print flex items-center gap-2 text-xs -mb-2">
            <button onclick="switchTab('home')" class="bg-indigo-900 hover:bg-indigo-800 text-amber-300 font-bold px-3 py-1.5 rounded-lg shadow shrink-0">🏠 Dashboard</button>
            <span class="text-slate-400">›</span>
            <span id="breadcrumbTitle" class="font-bold text-indigo-950 truncate"></span>
        </div>

        <!-- HOME DASHBOARD (all logged-in roles) -->
        <div id="view-home" class="tab-view hidden logged-in-only w-full space-y-5 no-print">
            <div class="rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-800 text-white p-5 sm:p-6 shadow-lg flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
                <img src="assets/nwp-logo.png" alt="" class="absolute right-6 top-1/2 -translate-y-1/2 h-36 opacity-10 pointer-events-none">
                <div class="relative">
                    <p id="homeGreeting" class="text-amber-400 text-[11px] font-black uppercase tracking-widest">Welcome</p>
                    <h2 id="homeUserName" class="text-xl sm:text-2xl font-extrabold"></h2>
                    <p id="homeRoleText" class="text-xs text-indigo-200 mt-1"></p>
                </div>
                <div class="flex flex-wrap gap-2 relative">
                    <button onclick="openChangePasswordModal(false)" class="bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold px-3 py-2 rounded-lg">🔑 Change Password</button>
                    <button onclick="handleLogout()" class="bg-amber-500 hover:bg-amber-400 text-indigo-950 text-xs font-black px-3 py-2 rounded-lg">🔓 Logout</button>
                </div>
            </div>
            <div id="homeStats" class="grid grid-cols-2 lg:grid-cols-4 gap-3"></div>
            <div id="homeTiles" class="space-y-5"></div>
            <p class="text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl p-3">🛡️ For security you are logged out automatically after 30 minutes without activity. Every change made in the system is written to a permanent, tamper-evident audit log.</p>
        </div>

        <!-- ISSUED CERTIFICATES REGISTER (admin / super admin) -->
        <div id="view-cert-register" class="tab-view hidden admin-only w-full space-y-4">
            <div class="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-amber-200 space-y-4 no-print">
                <div class="border-b pb-3">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2"><span>🧾</span> Issued Certificates Register</h2>
                    <p class="text-xs text-slate-500 mt-1">Every attendance certificate and e-certificate that is downloaded or printed is recorded here automatically. Download the list as a PDF for files and audits.</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div class="lg:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 mb-1">Program</label>
                        <select id="regProgram" class="w-full p-2 text-xs border rounded bg-white"></select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Certificate</label>
                        <select id="regType" class="w-full p-2 text-xs border rounded bg-white">
                            <option value="attendance">Certificate of Attendance</option>
                            <option value="completion">e-Certificate (Completion)</option>
                            <option value="any">Both types</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">List</label>
                        <select id="regScope" class="w-full p-2 text-xs border rounded bg-white">
                            <option value="issued">Issued certificates only</option>
                            <option value="confirmed">All confirmed participants</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Issued from</label>
                            <input type="date" id="regFrom" class="w-full p-2 text-xs border rounded bg-white">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">to</label>
                            <input type="date" id="regTo" class="w-full p-2 text-xs border rounded bg-white">
                        </div>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="loadCertRegister()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow">🔍 Show List</button>
                    <button onclick="certRegisterPDF('save')" class="bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow">📥 Download PDF</button>
                    <button onclick="certRegisterPDF('print')" class="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow">🖨️ Print</button>
                    <button onclick="certRegisterExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow">📊 Excel</button>
                </div>
            </div>
            <div id="regSummary" class="grid grid-cols-2 lg:grid-cols-4 gap-3"></div>
            <div class="bg-white rounded-xl shadow-md border border-slate-200 overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse min-w-[980px]">
                    <thead>
                        <tr class="bg-indigo-900 text-white font-bold">
                            <th class="p-2">#</th>
                            <th class="p-2">Certificate No</th>
                            <th class="p-2">Name</th>
                            <th class="p-2">NIC</th>
                            <th class="p-2">Designation / Office</th>
                            <th class="p-2">Program</th>
                            <th class="p-2">Program Dates</th>
                            <th class="p-2 text-center">Hours</th>
                            <th class="p-2">First Issued</th>
                            <th class="p-2 text-center">Times</th>
                        </tr>
                    </thead>
                    <tbody id="regTableBody"></tbody>
                </table>
            </div>
        </div>

        <!-- AUDIT LOG (super admin) -->
        <div id="view-audit-log" class="tab-view hidden super-admin-only w-full space-y-4">
            <div class="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-emerald-200 space-y-4">
                <div class="border-b pb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2"><span>🛡️</span> Audit Log & Security</h2>
                        <p class="text-xs text-slate-500 mt-1 max-w-2xl">A permanent record of logins, failed logins, every change and deletion (with the full deleted data), certificate issues and backups. Entries cannot be edited or deleted, and each entry is sealed to the previous one so any tampering is detected.</p>
                    </div>
                    <button onclick="verifyAuditLog()" class="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow shrink-0">✔️ Verify Integrity</button>
                </div>
                <div id="auditIntegrity" class="hidden text-xs font-bold rounded-lg p-3"></div>
                <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">From</label>
                        <input type="date" id="auditFrom" class="w-full p-2 text-xs border rounded bg-white">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">To</label>
                        <input type="date" id="auditTo" class="w-full p-2 text-xs border rounded bg-white">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">User</label>
                        <select id="auditUser" class="w-full p-2 text-xs border rounded bg-white"><option value="">All users</option></select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Search</label>
                        <input type="text" id="auditSearch" placeholder="e.g. delete, login, NIC" class="w-full p-2 text-xs border rounded bg-white">
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="loadAuditLog()" class="flex-1 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-3 py-2 rounded-lg shadow">🔍 Show</button>
                        <button onclick="auditLogPDF()" class="bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs px-3 py-2 rounded-lg shadow" title="Download PDF">📥 PDF</button>
                        <button onclick="auditLogExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-lg shadow" title="Download Excel">📊</button>
                    </div>
                </div>
                <p id="auditCount" class="text-[11px] text-slate-500"></p>
                <div class="overflow-x-auto border rounded-lg">
                    <table class="w-full text-left text-xs border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-slate-800 text-white font-bold">
                                <th class="p-2">#</th>
                                <th class="p-2">Date & Time</th>
                                <th class="p-2">User</th>
                                <th class="p-2">Action</th>
                                <th class="p-2">Record</th>
                                <th class="p-2">Details</th>
                                <th class="p-2">IP Address</th>
                            </tr>
                        </thead>
                        <tbody id="auditTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 1. ADD RECORD TAB -->
        <div id="view-add-record" class="tab-view max-w-3xl mx-auto no-print w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="border-b pb-4 mb-6">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <span>➕</span> Add New Training Record & Evaluation
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Submit after attending a program. MDTU confirms your attendance, then your certificates can be downloaded.</p>
                </div>
                
                <form id="addTrainingForm" onsubmit="handleSingleSubmit(event)" class="space-y-6">
                    <div class="bg-indigo-50/70 p-3 sm:p-4 rounded-lg border border-indigo-200 space-y-4">
                        <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wider">1. Officer Identification & Auto-Fill</h3>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">NIC / Officer ID * (Smart Auto-Detection)</label>
                                <input type="text" id="nicInput" required inputmode="text" autocomplete="off" oninput="handleNicSmartInput(this.value)" placeholder="e.g. 833161750V or 198331601750" class="w-full p-2.5 text-sm border rounded-lg outline-none uppercase font-mono bg-white focus:ring-2 focus:ring-indigo-500">
                                <span id="nicFormatNotice" class="text-[10px] font-bold text-indigo-600 mt-1 block"></span>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Officer Name * (Auto-filled / Editable)</label>
                                <input type="text" id="nameInput" required list="officerNameDatalist" autocomplete="off" onchange="onOfficerNameChosen()" placeholder="Officer Name" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-white">
                                <datalist id="officerNameDatalist"></datalist>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Designation * (Auto-filled / Select)</label>
                                <input type="text" id="designationInput" list="designationDatalist" required placeholder="Designation" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-white">
                                <datalist id="designationDatalist">
                                    <option value="Management Assistant">
                                    <option value="Development Officer">
                                    <option value="Executive Officer">
                                    <option value="Office Assistant">
                                </datalist>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Office / Department * (Auto-filled / Select)</label>
                                <input type="text" id="officeInput" list="officeDatalist" required placeholder="Type or select Office" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-white">
                                <datalist id="officeDatalist">
                                    <option value="District Secretariat, Kurunegala">
                                </datalist>
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 space-y-4">
                        <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wider">2. Program Details</h3>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Training Program *</label>
                            <select id="trainingNameSelect" required onchange="onProgramSelected()" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-white">
                                <option value="">-- Select the program you attended --</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="sm:col-span-3">
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Venue / Location</label>
                                <input type="text" id="venueInput" readonly placeholder="Filled automatically from the program" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-slate-100 font-semibold text-indigo-950">
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Program Dates</label>
                                <input type="text" id="dateInput" readonly placeholder="Filled automatically" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-slate-100 font-mono">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Hours</label>
                                <input type="text" id="hoursInput" readonly placeholder="-" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-slate-100 font-bold">
                            </div>
                        </div>
                    </div>

                    <div class="bg-amber-50/60 p-3 sm:p-4 rounded-lg border border-amber-200 space-y-4">
                        <h3 class="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">⭐ 3. Program Evaluation & Resource Persons</h3>
                        
                        <div id="resourceRatingsContainer" class="space-y-3">
                            <p class="text-xs text-slate-500">Select a program above to view and evaluate resource persons.</p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Food Evaluation</label>
                                <select id="foodRatingInput" class="w-full p-2 text-xs border rounded font-bold text-amber-600 outline-none">
                                    <option value="5" selected>5 Stars ⭐⭐⭐⭐⭐</option>
                                    <option value="4">4 Stars ⭐⭐⭐⭐</option>
                                    <option value="3">3 Stars ⭐⭐⭐</option>
                                    <option value="2">2 Stars ⭐⭐</option>
                                    <option value="1">1 Star ⭐</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Coordination Evaluation</label>
                                <select id="coordinationRatingInput" class="w-full p-2 text-xs border rounded font-bold text-amber-600 outline-none">
                                    <option value="5" selected>5 Stars ⭐⭐⭐⭐⭐</option>
                                    <option value="4">4 Stars ⭐⭐⭐⭐</option>
                                    <option value="3">3 Stars ⭐⭐⭐</option>
                                    <option value="2">2 Stars ⭐⭐</option>
                                    <option value="1">1 Star ⭐</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Feedback / Constructive Comments</label>
                            <textarea id="feedbackInput" rows="2" placeholder="Write feedback comments here..." class="w-full p-2.5 text-xs border rounded-lg outline-none"></textarea>
                        </div>
                    </div>

                    <button type="submit" id="saveBtn" class="w-full bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-lg shadow-md transition text-sm">
                        Save Training Record & Evaluation
                    </button>
                </form>
            </div>
        </div>

        <!-- SUPERUSER PROGRESS ENTRY TAB -->
        <div id="view-progress-entry" class="tab-view hidden max-w-4xl mx-auto super-user-only space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-amber-300 space-y-6">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <span>📈</span> Superuser Monthly & Annual Progress Submission
                    </h2>
                    <p class="text-xs text-slate-500">Enter your Superuser ID. Your Office Name and Designation will be loaded automatically.</p>
                </div>

                <form onsubmit="handleSaveSuperuserProgress(event)" class="space-y-6">
                    <div class="bg-indigo-50/70 p-3 sm:p-4 rounded-lg border border-indigo-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Superuser ID Number *</label>
                            <input type="text" id="progUserId" required oninput="handleSuperuserIdLookup(this.value)" placeholder="e.g. 198512345678" class="w-full p-2.5 text-xs border rounded uppercase font-mono bg-white">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Office / Department</label>
                            <input type="text" id="progUserOffice" required list="officeDatalist" onchange="autoCalculateOfficeStaffProgress(); populateAutoMdtuPrograms(this.value)" placeholder="Auto-filled / type office" class="w-full p-2.5 text-xs border rounded bg-white font-bold text-indigo-950">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                            <input type="text" id="progUserDesignation" list="designationDatalist" placeholder="Auto-filled / type" class="w-full p-2.5 text-xs border rounded bg-white font-bold text-slate-800">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Reporting Month *</label>
                            <select id="progMonth" required class="w-full p-2.5 text-xs border rounded bg-white font-bold">
                                <option value="January">January</option><option value="February">February</option>
                                <option value="March">March</option><option value="April">April</option>
                                <option value="May">May</option><option value="June">June</option>
                                <option value="July">July</option><option value="August">August</option>
                                <option value="September">September</option><option value="October">October</option>
                                <option value="November">November</option><option value="December">December</option>
                            </select>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 space-y-3">
                        <div class="flex justify-between items-center flex-wrap gap-2">
                            <h3 class="text-xs font-bold text-indigo-900 uppercase">📊 Staff Designation & Hours Summary</h3>
                            <button type="button" onclick="autoCalculateOfficeStaffProgress()" class="bg-indigo-900 text-white text-[10px] font-bold px-3 py-1 rounded">🔄 Refresh Breakdown</button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[500px]">
                                <thead>
                                    <tr class="bg-indigo-900 text-white">
                                        <th class="p-2">Designation</th>
                                        <th class="p-2 text-center">Total Staff</th>
                                        <th class="p-2 text-center text-emerald-300">12h Done</th>
                                        <th class="p-2 text-center text-amber-300">6h Done</th>
                                        <th class="p-2 text-center text-rose-300">None (0h)</th>
                                    </tr>
                                </thead>
                                <tbody id="progMatrixTableBody">
                                    <tr><td colspan="5" class="p-3 text-center text-slate-400">Enter Superuser ID to auto-load staff statistics.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-3 sm:p-4 rounded-lg border space-y-4">
                        <h3 class="text-xs font-bold text-indigo-900 uppercase">🏫 MDTU Training Attendance & In-House Trainings</h3>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">MDTU Auto-Linked Official Programs</label>
                            <div id="progAutoProgramsList" class="p-3 bg-white border rounded text-xs text-slate-700 space-y-1 overflow-x-auto">
                                <span>Enter ID to load official programs.</span>
                            </div>
                        </div>

                        <div class="border-t pt-3 space-y-2">
                            <div class="flex justify-between items-center flex-wrap gap-2">
                                <label class="text-xs font-bold text-slate-700">Internal Trainings Conducted within Office:</label>
                                <button type="button" onclick="addOtherTrainingRow()" class="bg-indigo-900 text-white text-xs font-bold px-2.5 py-1 rounded">+ Add In-House Program</button>
                            </div>
                            <div id="otherTrainingsContainer" class="space-y-2"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="block text-xs font-bold text-slate-700">Special Office Remarks & Milestones</label>
                            <textarea id="progSpecialRemarks" rows="3" placeholder="Enter special achievements..." class="w-full p-2.5 text-xs border rounded bg-white outline-none"></textarea>
                        </div>
                        <div class="space-y-1">
                            <label class="block text-xs font-bold text-slate-700">Productivity Initiatives</label>
                            <textarea id="progProductivityTasks" rows="3" placeholder="Describe efficiency projects..." class="w-full p-2.5 text-xs border rounded bg-white outline-none"></textarea>
                        </div>
                    </div>

                    <div class="bg-amber-50 p-3 sm:p-4 rounded-lg border border-amber-300 space-y-2">
                        <label class="block text-xs font-bold text-amber-950">📎 Attach Supporting Documents / Photos PDF</label>
                        <input type="file" id="progAttachmentPdf" accept=".pdf" class="w-full p-2 text-xs border rounded bg-white">
                    </div>

                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-lg shadow-lg text-xs uppercase tracking-wider">
                        🚀 Submit Progress & Prepare Presentation Slides
                    </button>
                </form>
            </div>
        </div>

        <!-- PROGRESS PRESENTATION SLIDES & REPORTS TAB -->
        <div id="view-progress-reports" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b-2 border-indigo-900 pb-4 text-center">
                    <h3 class="text-xs font-black text-amber-600 uppercase tracking-widest">Management Development and Training Unit - NWP</h3>
                    <h2 class="text-base sm:text-xl font-black text-indigo-950 uppercase mt-0.5">Monthly Progress — All Months</h2>
                    <p class="text-xs text-slate-500">Admin and Super Admin only. January to December in one table, ready for PDF.</p>
                </div>

                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
                    <p class="text-xs text-slate-600 font-medium">Every month is listed for each office. Months with no submission stay in the table.</p>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="downloadPresentationPDF()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-3.5 py-2 rounded shadow">📄 Download PDF</button>
                        <button onclick="exportTableToExcel('progressMonthTable', 'Monthly_Progress_All_Months')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded shadow">📊 Export Excel</button>
                    </div>
                </div>

                <div class="bg-slate-50 p-3 sm:p-4 rounded-lg border no-print max-w-md">
                    <label class="block text-xs font-bold text-slate-700 mb-1">Office</label>
                    <select id="presOfficeSelect" onchange="renderProgressPresentations()" class="w-full p-2 text-xs border rounded bg-white">
                        <option value="all">All Offices</option>
                    </select>
                </div>

                <div class="overflow-x-auto">
                <div id="presentationPdfContainer" class="space-y-3">
                    <div class="text-center border-b pb-3">
                        <h3 class="text-xs font-black text-amber-600 uppercase">Management Development and Training Unit - NWP</h3>
                        <h4 class="text-base font-black text-indigo-950 uppercase">Monthly Progress Report — All Months</h4>
                        <p id="presReportSubtitle" class="text-xs font-semibold text-slate-500 mt-1"></p>
                    </div>
                    <div>
                        <table id="progressMonthTable" class="w-full text-left text-xs border-collapse border border-slate-300 min-w-[900px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-2 border border-indigo-800">Office</th>
                                    <th class="p-2 border border-indigo-800">Month</th>
                                    <th class="p-2 border border-indigo-800">Special Remarks</th>
                                    <th class="p-2 border border-indigo-800">Productivity</th>
                                    <th class="p-2 border border-indigo-800">In-house Trainings</th>
                                    <th class="p-2 border border-indigo-800 text-center">Submitted</th>
                                </tr>
                            </thead>
                            <tbody id="progressMonthTableBody"></tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>
        </div>

        <!-- ANNUAL TRAINING PLAN ENTRY TAB -->
        <div id="view-training-plan-entry" class="tab-view hidden max-w-4xl mx-auto super-user-only space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-teal-300 space-y-6">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-teal-950 flex items-center gap-2">
                        <span>📝</span> Annual Training Plan & Training Needs Identification
                    </h2>
                    <p class="text-xs text-slate-500">Provide required capacity building and outbound development programs for your office.</p>
                </div>

                <form onsubmit="handleSaveTrainingPlan(event)" class="space-y-5">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-teal-50/70 p-3 sm:p-4 rounded-lg border border-teal-200">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Superuser ID Number *</label>
                            <input type="text" id="tpUserId" required oninput="handleTpUserLookup(this.value)" placeholder="Enter User ID..." class="w-full p-2.5 text-xs border rounded uppercase font-mono bg-white">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Office Name</label>
                            <input type="text" id="tpOffice" required list="officeDatalist" placeholder="Auto-filled / type office" class="w-full p-2.5 text-xs border rounded bg-white font-bold text-teal-950">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                            <input type="text" id="tpDesignation" list="designationDatalist" placeholder="Auto-filled / type" class="w-full p-2.5 text-xs border rounded bg-white font-bold text-slate-800">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="block text-xs font-bold text-slate-700">Required General Training Programs *</label>
                            <textarea id="tpRequiredGeneral" required rows="3" placeholder="e.g. IT Skills, Communication..." class="w-full p-2.5 text-xs border rounded bg-white outline-none"></textarea>
                        </div>
                        <div class="space-y-1">
                            <label class="block text-xs font-bold text-slate-700">Specialized Training Requirements</label>
                            <textarea id="tpSpecialized" rows="3" placeholder="e.g. Procurement Guidelines..." class="w-full p-2.5 text-xs border rounded bg-white outline-none"></textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="block text-xs font-bold text-slate-700">Departmental Technical Training</label>
                            <textarea id="tpDepartmental" rows="3" placeholder="e.g. Financial Regulations..." class="w-full p-2.5 text-xs border rounded bg-white outline-none"></textarea>
                        </div>
                        <div class="space-y-1">
                            <label class="block text-xs font-bold text-slate-700">Outbound Training (OBT) Needs</label>
                            <textarea id="tpObt" rows="3" placeholder="e.g. Leadership Outbound..." class="w-full p-2.5 text-xs border rounded bg-white outline-none"></textarea>
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-teal-800 hover:bg-teal-700 text-white font-bold py-3.5 rounded-lg shadow text-xs uppercase tracking-wider">
                        💾 Save Training Plan Record
                    </button>
                </form>
            </div>
        </div>

        <!-- ANNUAL TRAINING PLAN REPORT TAB -->
        <div id="view-training-plan-report" class="tab-view hidden max-w-5xl mx-auto space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b-2 border-indigo-900 pb-4 text-center">
                    <h3 class="text-xs font-black text-amber-600 uppercase tracking-widest">Management Development and Training Unit - NWP</h3>
                    <h2 class="text-base sm:text-xl font-black text-indigo-950 uppercase mt-0.5">Annual Training Needs & Consolidation Plan Report</h2>
                    <p class="text-xs text-slate-500">Accessible to Superuser, Admin, and Super Admin</p>
                </div>

                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
                    <p class="text-xs text-slate-600">Review collected training demands across provincial offices and export to Excel.</p>
                    <button onclick="exportTrainingPlanToExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded shadow">📊 Download Plan Excel</button>
                </div>

                <div class="admin-only hidden bg-slate-50 p-3 sm:p-4 rounded-lg border space-y-3 no-print">
                    <h3 class="text-xs font-bold text-indigo-900 uppercase">📁 Upload Previous Training Plan to Merge</h3>
                    <div class="flex flex-col sm:flex-row gap-3 items-center">
                        <input type="file" id="prevPlanExcelUpload" accept=".xlsx, .xls" class="w-full p-2 text-xs border rounded bg-white">
                        <button onclick="handleMergePrevPlanExcel()" class="bg-indigo-900 text-white text-xs font-bold px-4 py-2.5 rounded shrink-0">Upload & Merge Plan</button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table id="trainingPlanTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[700px]">
                        <thead>
                            <tr class="bg-teal-900 text-white font-bold">
                                <th class="p-3">Office Name</th>
                                <th class="p-3">Officer / Superuser</th>
                                <th class="p-3">Required General Programs</th>
                                <th class="p-3">Specialized Programs</th>
                                <th class="p-3">Departmental Programs</th>
                                <th class="p-3">OBT Requirements</th>
                            </tr>
                        </thead>
                        <tbody id="trainingPlanTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- RESOURCE PERSONS DIRECTORY REPORT -->
        <div id="view-resource-persons-master-report" class="tab-view hidden max-w-5xl mx-auto space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-purple-200 space-y-6">
                <div class="border-b-2 border-indigo-900 pb-4 text-center">
                    <h3 class="text-xs font-black text-amber-600 uppercase tracking-widest">Management Development and Training Unit - NWP</h3>
                    <h2 class="text-base sm:text-xl font-black text-indigo-950 uppercase mt-0.5">Master Resource Persons Official Directory</h2>
                    <p class="text-xs text-slate-500">Provincial Certified Resource Persons and Subject Matter Experts</p>
                </div>

                <div class="flex justify-between items-center flex-wrap gap-2 no-print">
                    <p class="text-xs text-slate-600">Full contact information and domain areas for all registered resource persons.</p>
                    <div class="flex gap-2">
                        <button onclick="exportTableToExcel('resourceSharedTable', 'MDTU_Resource_Persons_Directory')" class="bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded shadow">📊 Export Excel</button>
                        <button onclick="downloadOfficialReportPDF('resourceMasterReportContainer', 'Resource_Persons_Directory')" class="bg-indigo-900 text-white font-bold text-xs px-4 py-2 rounded shadow">📄 Download PDF</button>
                    </div>
                </div>

                <div id="resourceMasterReportContainer" class="space-y-4">
                    <div class="overflow-x-auto">
                        <table id="resourceSharedTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[600px]">
                            <thead class="bg-purple-900 text-white font-bold">
                                <tr>
                                    <th class="p-2.5">Resource Person Name</th>
                                    <th class="p-2.5">Specialization / Domain</th>
                                    <th class="p-2.5">Designation & Institution</th>
                                    <th class="p-2.5">Contact Number</th>
                                    <th class="p-2.5">Email Address</th>
                                </tr>
                            </thead>
                            <tbody id="resourceSharedTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- SUPER ADMIN RESOURCE PERSON LIST EXCEL UPLOAD TAB -->
        <div id="view-resource-upload" class="tab-view hidden max-w-4xl mx-auto super-admin-only space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-purple-300 space-y-6">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-purple-950 flex items-center gap-2">
                        <span>👥</span> Super Admin Resource Persons Master Upload
                    </h2>
                    <p class="text-xs text-slate-500">Upload master Excel file containing resource persons.</p>
                </div>

                <div class="space-y-3 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <label class="block text-xs font-bold text-purple-950 mb-1">Select Excel File (.xlsx, .xls):</label>
                    <input type="file" id="resourcePersonsExcelInput" accept=".xlsx, .xls" class="w-full p-2 text-xs border rounded bg-white">
                    <button onclick="uploadResourcePersonsExcel()" class="bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2.5 rounded shadow">
                        📤 Process & Update Resource Persons
                    </button>
                </div>
            </div>
        </div>

        <!-- SUPERADMIN DATABASE BACKUP TAB -->
        <div id="view-archive-tab" class="tab-view hidden space-y-6 max-w-4xl mx-auto super-admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-indigo-200 space-y-6">
                <div class="bg-indigo-50 p-4 rounded-lg">
                        <h2 class="text-lg sm:text-xl font-bold text-indigo-950 flex items-center gap-2">
                        <span>🏛️</span> Database Backup & Archive
                        </h2>
                    <p class="text-xs text-indigo-700 mt-1">Download a complete copy of every table in the MySQL database (all years). Keep backups in a safe place.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onclick="downloadBackup('xlsx')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 text-xs rounded-lg shadow">
                        📊 Download Full Backup (Excel)
                    </button>
                    <button onclick="downloadBackup('json')" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold px-4 py-3 text-xs rounded-lg shadow">
                        💾 Download Full Backup (JSON)
                        </button>
                </div>

                <div id="archiveLogArea" class="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto space-y-1">
                    <p>[SYSTEM] Ready. Backups are generated directly from the live database.</p>
                </div>

                <div class="border border-indigo-200 rounded-xl p-4 space-y-3">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 class="text-sm font-bold text-indigo-950">🗄️ Automatic Server Backups</h3>
                            <p class="text-[11px] text-slate-600 mt-1 max-w-xl">A full copy of the database (including the audit log) is saved on the server automatically every day.
                                Daily copies are kept for <span id="backupKeepDays">40</span> days and the first copy of every month is kept permanently.
                                For long-term safety, also download a copy every month and keep it on an external disk or in another office.</p>
                        </div>
                        <button onclick="createServerBackup()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow shrink-0">➕ Back Up Now</button>
                    </div>
                    <div class="overflow-x-auto max-h-80 overflow-y-auto border rounded-lg">
                        <table class="w-full text-left text-xs border-collapse min-w-[420px]">
                            <thead class="sticky top-0">
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-2">Backup Date</th>
                                    <th class="p-2">File</th>
                                    <th class="p-2 text-right">Size</th>
                                    <th class="p-2 text-center">Download</th>
                                </tr>
                            </thead>
                            <tbody id="serverBackupsBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTIFICATION TAB -->
        <div id="view-notifications-tab" class="tab-view hidden space-y-6 max-w-4xl mx-auto no-print w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-amber-300">
                <div class="border-b pb-4 mb-6 flex justify-between items-center bg-amber-50 p-4 rounded-lg flex-wrap gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-amber-900 flex items-center gap-2">
                            <span>🔔</span> Official Notifications & Messages
                        </h2>
                        <p class="text-xs text-amber-700 mt-1">Official circulars, notes, and downloadable PDF files issued by Admin / Super Admin.</p>
                    </div>
                </div>

                <div class="admin-only hidden bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-6 space-y-3">
                    <h3 class="text-xs font-bold text-indigo-900 uppercase">📤 Send New Notification / Note / PDF to Users</h3>
                    <form onsubmit="handleSendNotification(event)" class="space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Select User / Recipient *</label>
                                <select id="notifTargetUser" required class="w-full p-2 text-xs border rounded bg-white font-bold text-indigo-900">
                                    <option value="all">📢 All Users & Superusers (Broadcast)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Title / Subject *</label>
                                <input type="text" id="notifTitle" required placeholder="e.g. Training Schedule Update" class="w-full p-2 text-xs border rounded bg-white">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Attach PDF File (Optional)</label>
                                <input type="file" id="notifPdfFile" accept=".pdf" class="w-full p-1.5 text-xs border rounded bg-white">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Message / Circular Text *</label>
                            <textarea id="notifMessage" rows="3" required placeholder="Type notification message here..." class="w-full p-2 text-xs border rounded bg-white"></textarea>
                        </div>
                        <button type="submit" class="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold px-4 py-2 rounded shadow">
                            📢 Send Notification
                        </button>
                    </form>
                </div>

                <div id="userSendMessageCard" class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
                    <h3 class="text-xs font-bold text-slate-900 uppercase">✉️ Send Message to Admin / Super Admin</h3>
                    <form onsubmit="handleUserSendMessage(event)" class="space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ID Number (NIC / Officer ID) *</label>
                                <input type="text" id="userMsgIdNo" required placeholder="e.g. 199012345678" class="w-full p-2 text-xs border rounded bg-white font-mono uppercase">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                                <input type="tel" id="userMsgPhone" required placeholder="e.g. 0712345678" class="w-full p-2 text-xs border rounded bg-white font-mono">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Your Message or Request *</label>
                            <textarea id="userMsgText" rows="2" required placeholder="Type your inquiry or request here..." class="w-full p-2 text-xs border rounded bg-white"></textarea>
                        </div>
                        <button type="submit" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded shadow">
                            🚀 Send Message to Admin
                        </button>
                    </form>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">📥 Active Inbox</h3>
                        <span class="text-[10px] text-slate-500">Official circulars and user inquiries</span>
                    </div>
                    <div id="notificationsContainer" class="space-y-3">
                        <p class="text-xs text-slate-400 text-center py-4">No notifications available.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- LIVE CHAT SUPPORT TAB -->
        <div id="view-live-chat-tab" class="tab-view hidden space-y-6 max-w-4xl mx-auto no-print w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-emerald-300 flex flex-col h-[78vh] sm:h-[650px]">
                <div class="border-b pb-4 mb-4 flex justify-between items-center bg-emerald-50 p-3 rounded-lg flex-wrap gap-2">
                    <div>
                        <h2 class="text-base sm:text-lg font-bold text-emerald-900 flex items-center gap-2">
                            <span>💬</span> Live Chat Support Center
                        </h2>
                        <p class="text-xs text-emerald-700">Confidential messages remain strictly private between participants and administration.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="openNewAlertModal()" class="admin-only hidden bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded text-xs shadow">
                            🚨 Post Alert
                        </button>
                        <div id="chatUserBadge" class="bg-emerald-900 text-white px-3 py-1 rounded text-xs font-bold">
                            User: Active
                        </div>
                    </div>
                </div>

                <div id="chatNewAlertTicker" class="bg-amber-50 border border-amber-300 p-2.5 rounded-lg flex items-center justify-between gap-2 mb-3">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <span class="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase animate-pulse shrink-0">🚨 Alert</span>
                        <p id="chatTickerAlertContent" class="text-xs font-bold text-amber-950 truncate">Welcome to MDTU Live Chat Support System.</p>
                    </div>
                    <div id="chatAlertActionsContainer" class="admin-only hidden flex gap-1 shrink-0">
                        <button onclick="editCurrentAlert()" class="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded">Edit</button>
                        <button onclick="deleteCurrentAlert()" class="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded">Delete</button>
                    </div>
                </div>

                <div id="chatMessagesBox" class="flex-1 overflow-y-auto space-y-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                </div>

                <form onsubmit="handleSendLiveChatMessage(event)" class="mt-4 flex flex-col sm:flex-row gap-2 pt-2 border-t">
                    <select id="chatRecipientSelect" class="p-2.5 text-xs border rounded-lg bg-white font-bold text-indigo-900 outline-none">
                        <option value="all">📢 Broadcast (All Users)</option>
                        <option value="admin">🔒 Admin & Super Admin (Private)</option>
                        <optgroup label="Specific Accounts" id="chatUserListGroup">
                        </optgroup>
                    </select>
                    <input type="text" id="chatInputText" required placeholder="Type support message..." class="flex-1 p-3 text-xs border rounded-lg outline-none bg-white">
                    <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg text-xs shadow">
                        Send 💬
                    </button>
                </form>
            </div>
        </div>

        <!-- MANAGE PROGRAMS TAB -->
        <div id="view-manage-programs" class="tab-view hidden space-y-6 max-w-5xl mx-auto only-admin-and-super w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b pb-4">
                    <h2 id="progFormTitle" class="text-lg sm:text-xl font-bold text-indigo-900">⚙️ Program, Venue & Resource Person Setup</h2>
                    <p class="text-xs text-slate-500">The venue and dates entered here are printed on attendance slips, certificates and the QR verification page.</p>
                </div>

                <form id="programConfigForm" onsubmit="handleSaveProgramConfig(event)" class="space-y-4">
                    <input type="hidden" id="progIdConfig" value="">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Program Name *</label>
                            <input type="text" id="progNameConfig" required placeholder="e.g. Advanced Office Management" class="w-full p-2.5 text-xs border rounded outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Venue / Location *</label>
                            <input type="text" id="progVenueConfig" required list="venueDatalist" placeholder="e.g. MDTU Auditorium, Kurunegala" class="w-full p-2.5 text-xs border rounded outline-none">
                            <datalist id="venueDatalist"></datalist>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="progFileNoConfig" class="block text-xs font-bold text-slate-700 mb-1">File No (My No): <span class="font-normal text-slate-500">printed as "My No" on the attendance certificate letterhead</span></label>
                            <div class="flex rounded border overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 bg-white">
                                <span class="px-3 py-2.5 text-xs font-mono font-bold bg-indigo-900 text-amber-300 select-none shrink-0">NWP/CS/T/2/</span>
                                <input type="text" id="progFileNoConfig" maxlength="80" placeholder="type the rest e.g. 1/5/2026" class="flex-1 min-w-0 p-2.5 text-xs font-mono outline-none uppercase">
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Program Dates * (pick a date and press Add, or type comma separated)</label>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <div class="flex gap-2">
                                <input type="date" id="progDatePicker" class="flex-1 p-2.5 text-xs border rounded outline-none">
                                <button type="button" onclick="addProgramDate()" class="bg-indigo-900 text-white text-xs font-bold px-3 rounded shrink-0">+ Add</button>
                            </div>
                            <input type="text" id="progDatesConfig" required placeholder="2026-10-01, 2026-10-02" oninput="calculateProgramHours()" class="flex-1 p-2.5 text-xs border rounded outline-none font-mono">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">First Day (Auto)</label>
                            <input type="date" id="progFirstDateConfig" readonly class="w-full p-2.5 text-xs border rounded bg-slate-100 font-bold text-indigo-950">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Total Hours (6 hrs/day, editable)</label>
                            <input type="number" id="progHoursConfig" min="1" max="500" class="w-full p-2.5 text-xs border rounded bg-white font-bold text-amber-700">
                        </div>
                    </div>

                    <div class="border-t pt-4 space-y-3">
                        <div class="flex justify-between items-center">
                            <label class="text-xs font-bold text-slate-700">Resource Persons / Lecturers:</label>
                            <button type="button" onclick="addResourcePersonConfigRow()" class="bg-indigo-900 text-white text-xs font-bold px-3 py-1 rounded">+ Add Lecturer</button>
                        </div>
                        <div id="progResourcePersonsContainer" class="space-y-2"></div>
                        <datalist id="resourcePersonDatalist"></datalist>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2">
                        <button type="submit" id="progSaveBtn" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow text-xs uppercase tracking-wider">
                        💾 Save Program Configuration
                    </button>
                        <button type="button" id="progCancelEditBtn" onclick="resetProgramForm()" class="hidden bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-lg text-xs uppercase">
                            Cancel Edit
                        </button>
                    </div>
                </form>

                <div class="pt-6 border-t">
                    <h3 class="text-sm font-bold text-indigo-950 mb-3">Configured Training Programs</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse border min-w-[760px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white"><th class="p-2">Program</th><th class="p-2">Venue</th><th class="p-2">Dates</th><th class="p-2 text-center">Hours</th><th class="p-2">Resource Persons</th><th class="p-2 text-center">Registered</th><th class="p-2 text-center">Actions</th></tr>
                            </thead>
                            <tbody id="configuredProgramsTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- USER MANAGEMENT TAB -->
        <div id="view-user-management" class="tab-view hidden space-y-6 max-w-5xl mx-auto super-admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <span>👑</span> User Account Management
                    </h2>
                    <p class="text-xs text-slate-500">Create, manage passwords, or remove accounts for Superusers, Admins, and Superadmins.</p>
                </div>

                <form onsubmit="handleCreateUser(event)" class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                    <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wider">➕ Create User Account</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                            <input type="text" id="newUsername" required placeholder="e.g. officer1" class="w-full p-2 text-xs border rounded outline-none bg-white">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                            <input type="text" id="newPassword" required minlength="8" autocomplete="off" placeholder="Min 8 chars, letters + numbers" class="w-full p-2 text-xs border rounded outline-none bg-white font-mono">
                            <p class="text-[10px] text-slate-500 mt-1">The user must change it at the first login.</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                            <select id="newRole" required class="w-full p-2 text-xs border rounded outline-none bg-white font-bold text-indigo-950">
                                <option value="superuser">SUPERUSER</option>
                                <option value="admin">ADMIN</option>
                                <option value="super">SUPERADMIN</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow transition">
                        ➕ Register Account
                    </button>
                </form>

                <div class="space-y-3 pt-2">
                    <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">📋 Registered User Accounts</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[680px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-2.5">Username</th>
                                    <th class="p-2.5">System Role</th>
                                    <th class="p-2.5">Password</th>
                                    <th class="p-2.5">Last Login</th>
                                    <th class="p-2.5">Created</th>
                                    <th class="p-2.5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="userAccountsTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- ANNUAL EXCEL UPLOAD TAB -->
        <div id="view-annual-excel-upload" class="tab-view hidden space-y-6 max-w-4xl mx-auto super-admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">📁 Annual Office Staff Matrix Excel Update</h2>
                    <p class="text-xs text-slate-500">Super Admin facility to upload office-wise cadre headcounts by designation.</p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Select Staff Matrix Excel (.xlsx / .xls):</label>
                        <input type="file" id="annualStaffExcelFile" accept=".xlsx, .xls" class="w-full p-2 text-xs border rounded bg-white">
                    </div>
                    <button onclick="uploadAnnualStaffExcel()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-5 py-3 rounded-lg shadow transition">
                        📤 Process & Update Matrix
                    </button>
                </div>

                <div class="pt-6 border-t">
                    <h3 class="text-sm font-bold text-indigo-950 mb-3">Loaded Staff Matrix Headcounts</h3>
                    <div class="overflow-x-auto">
                        <table id="annualStaffMatrixTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[500px]">
                            <thead id="annualStaffMatrixHead" class="bg-indigo-900 text-white"></thead>
                            <tbody id="annualStaffMatrixBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- ATTENDANCE CERTIFICATE TAB -->
        <div id="view-attendance-cert" class="tab-view hidden max-w-5xl mx-auto space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 no-print space-y-4">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <span>📄</span> Certificate of Attendance
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Enter your NIC and choose the program. The official attendance certificate includes the venue, dates, hours and a QR code anyone can scan to verify it.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">National Identity Card (NIC) *</label>
                        <div class="flex gap-2">
                            <input type="text" id="attNicInput" placeholder="Enter NIC..." onkeydown="if(event.key==='Enter'){searchAttendanceRecords()}" class="w-full p-2.5 text-xs border rounded font-mono uppercase">
                            <button onclick="searchAttendanceRecords()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold px-4 rounded text-xs shrink-0">🔍</button>
                    </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-700 mb-1">Training Program *</label>
                        <select id="attProgSelect" onchange="generateAttendanceCertSlip()" disabled class="w-full p-2.5 text-xs border rounded bg-white disabled:bg-slate-100">
                            <option value="">-- Search your NIC first --</option>
                        </select>
                    </div>
                </div>

                <div id="attStatusNotice" class="hidden p-3 rounded-lg border text-xs font-bold"></div>

                <div class="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button id="attDownloadBtn" onclick="downloadAttendancePDF()" disabled class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-lg shadow">📥 Download PDF</button>
                    <button id="attPrintBtn" onclick="printAttendanceCert()" disabled class="bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-lg shadow">🖨️ Print</button>
                    </div>
                </div>

            <div id="attendanceSlipContainer" class="hidden w-full pb-4">
                <div class="cert-sizer">
                    <?php
                    // Letterhead footer contact details. Empty values are not printed.
                    $lhContacts = [
                        ['si' => 'ප්‍රධාන ලේකම් කාර්යාලය', 'ta' => 'பிரதம செயலாளர் அலுவலகம்', 'en' => "Chief Secretary's Office",
                         'lines' => ['Tel' => '037-2231769-72', 'Fax' => '037-2222234', 'Email' => '', 'Web' => 'www.cs.nw.gov.lk']],
                        ['si' => 'කාර්යාලය', 'ta' => 'அலுவலகம்', 'en' => 'Office',
                         'lines' => ['Tel' => '037-2222018', 'Fax' => '037-2223655', 'Email' => '', 'Web' => 'www.mdtu.nw.gov.lk']],
                        ['si' => 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)', 'ta' => 'பிரதிப் பிரதம செயலாளர் (பயிற்சி)', 'en' => 'Deputy Chief Secretary (Training)',
                         'lines' => ['Tel' => '037-2222108', 'Email' => '']],
                    ];
                    ?>
                    <div id="attendanceCertSheet" class="cert-sheet cert-portrait lh-sheet" style="border:1px solid #e5e7eb;">
                        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; opacity:0.05;">
                            <img src="assets/nwp-logo.png" alt="" style="width:400px; height:auto;">
            </div>
                        <div style="position:absolute; inset:28px 34px 20px 34px; display:flex; flex-direction:column;">
                            <!-- Letterhead -->
                            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                                <img class="tpl-emblem" src="assets/sl-emblem.png" alt="Emblem of Sri Lanka" style="height:96px; width:auto; max-width:110px; object-fit:contain;">
                                <div style="flex:1; text-align:center; line-height:1.15;">
                                    <p class="lh-si lh-maroon" style="font-size:27px; font-weight:800;">ප්‍රධාන ලේකම් කාර්යාලය - වයඹ පළාත</p>
                                    <p class="lh-ta lh-maroon" style="font-size:15px; font-weight:700; margin-top:3px;">பிரதம செயலாளர் அலுவலகம் - வடமேல் மாகாணம்</p>
                                    <p class="lh-en lh-maroon" style="font-size:22px; font-weight:700; margin-top:4px;">Chief Secretary’s Office – North Western Province</p>
                                </div>
                                <img src="assets/nwp-logo.png" alt="North Western Provincial Council Emblem" style="height:96px; width:auto;">
                            </div>
                            <p class="lh-maroon" style="text-align:center; font-size:9.5px; font-weight:700; margin-top:12px; white-space:nowrap;">
                                <span class="lh-si">පළාත් සභා කාර්යාල සංකීර්ණය, කුරුණෑගල</span>
                                &nbsp;·&nbsp; <span class="lh-ta">மாகாண சபை அலுவலகத் தொகுதி, குருநாகல்</span>
                                &nbsp;·&nbsp; <span class="lh-en">Provincial Council Office Complex, Kurunegala</span>
                            </p>
                            <p style="text-align:center; font-size:10.5px; color:#111827; margin-top:6px; white-space:nowrap;">
                                <span class="lh-si" style="font-weight:700;">කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය</span>
                                &nbsp;·&nbsp; <span class="lh-ta" style="font-weight:500;">முகாமை அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு</span>
                                &nbsp;·&nbsp; <span class="lh-en">Management Development &amp; Training Unit</span>
                            </p>
                            <div class="lh-rule" style="margin-top:10px;"></div>

                            <!-- My No / Your No / Date -->
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 18px 0;">
                                <div class="lh-ref">
                                    <div class="lh-ref-labels"><div class="lh-si">මගේ අංකය</div><div class="lh-ta">எனது இலக்கம்</div><div>My No</div></div>
                                    <span class="lh-brace" style="font-size:44px;">}</span>
                                    <span id="attSlipFileNo" class="lh-ref-value"></span>
                        </div>
                                <div class="lh-ref">
                                    <div class="lh-ref-labels"><div class="lh-si">ඔබේ අංකය</div><div class="lh-ta">உமது இலக்கம்</div><div>Your No</div></div>
                                    <span class="lh-brace" style="font-size:44px;">}</span>
                                    <span class="lh-ref-value" style="min-width:90px;"></span>
                    </div>
                                <div class="lh-ref">
                                    <div class="lh-ref-labels"><div class="lh-si">දිනය</div><div class="lh-ta">திகதி</div><div>Date</div></div>
                                    <span class="lh-brace" style="font-size:44px;">}</span>
                                    <span id="attSlipIssueDate" class="lh-ref-value"></span>
                    </div>
                </div>

                            <!-- Certificate body -->
                            <div style="padding:0 30px; margin-top:26px;">
                                <div style="text-align:center;">
                                    <p class="lh-si lh-maroon" style="font-size:15px; font-weight:700;">පැමිණීමේ සහතිකය</p>
                                    <h2 style="font-size:25px; font-weight:700; letter-spacing:3px; color:#1e1b4b; text-transform:uppercase; margin-top:2px;">Certificate of Attendance</h2>
                                    <div style="width:220px; height:3px; margin:6px auto 0; border-top:1px solid #8b1a1a; border-bottom:1px solid #8b1a1a;"></div>
                                </div>

                                <div style="font-size:15px; margin-top:22px;">
                                    <div class="lh-row"><span>Officer Name</span><span id="attSlipName" style="color:#1e1b4b; text-transform:uppercase;"></span></div>
                                    <div class="lh-row"><span>Designation</span><span id="attSlipDesignation"></span></div>
                                    <div class="lh-row"><span>Office / Department</span><span id="attSlipOffice"></span></div>
                                    <div class="lh-row"><span>National ID Number</span><span id="attSlipNic" style="font-family:'Courier New', monospace; letter-spacing:1px;"></span></div>
                    </div>

                                <div style="background:#fbf7f2; border:1px solid #e7d3c1; border-left:4px solid #8b1a1a; padding:12px 18px; margin:20px 0 18px; font-size:15px; line-height:1.75;">
                                    <p><strong>Training Program:</strong> <span id="attSlipProg" style="font-weight:700; color:#1e1b4b;"></span></p>
                                    <p><strong>Venue:</strong> <span id="attSlipVenue" style="font-weight:700;"></span></p>
                                    <p><strong>Conducted Dates:</strong> <span id="attSlipDates" style="font-weight:700; color:#7c2d12;"></span></p>
                                    <p id="attSlipAbsentSection" class="hidden" style="color:#be123c; font-weight:700;"><strong>Recorded Absent Dates:</strong> <span id="attSlipAbsentDates"></span></p>
                                    <p><strong>Total Completed Duration:</strong> <span id="attSlipHours" style="font-weight:700; color:#047857;"></span> Hours</p>
                    </div>

                                <p style="font-size:15px; line-height:1.7; text-align:justify;">
                                    This is to certify that the above-named officer has successfully participated in the above program organized by the Management Development and Training Unit, Chief Secretary’s Office, North Western Province.
                    </p>
                                <p style="font-size:13px; font-weight:700; color:#065f46; margin-top:12px;">✓ Participation officially confirmed and verified by the Deputy Chief Secretary (Training).</p>
                </div>

                            <!-- Signature -->
                            <div style="margin-top:auto; padding:0 30px 14px; display:flex; align-items:flex-end; justify-content:space-between; gap:20px;">
                                <div style="display:flex; align-items:flex-end; gap:12px;">
                                    <div id="attSlipQr" class="cert-qr" style="width:92px; height:92px; flex-shrink:0;"></div>
                                    <div style="font-size:11px; color:#4b5563; line-height:1.5;">
                                        <p style="font-weight:700; letter-spacing:1px; color:#8b1a1a;">CERTIFICATE NO.</p>
                                        <p id="attSlipSerial" style="font-family:'Courier New', monospace; font-size:12.5px; font-weight:700; color:#1e1b4b;"></p>
                                        <p style="margin-top:2px;">Scan the QR code to verify online.</p>
                </div>
            </div>
                                <div style="width:290px; text-align:center;">
                                    <div style="height:108px; display:flex; align-items:flex-end; justify-content:center;">
                                        <img class="tpl-signature" src="assets/peththawadu-signature.png" style="max-height:104px; max-width:260px; object-fit:contain;" alt="Signature of Deputy Chief Secretary">
                                        <span class="tpl-signature-default tpl-sig-name-script hidden" style="font-family:'Great Vibes',cursive; font-size:32px; color:#1e1b4b;"></span>
                                    </div>
                                    <div style="border-top:1px dotted #111827; margin:4px 0 5px;"></div>
                                    <p class="tpl-sig-name" style="font-size:14px; font-weight:700; color:#111827;"></p>
                                    <p class="tpl-sig-title" style="font-size:13px; color:#374151;"></p>
                                    <p style="font-size:13px; color:#374151;">North Western Province</p>
                                </div>
                            </div>
                            <p id="attSlipVerifyUrl" style="font-size:9.5px; color:#6b7280; text-align:center; padding-bottom:6px;"></p>

                            <!-- Letterhead footer -->
                            <div class="lh-rule" style="height:1.5px;"></div>
                            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; padding-top:7px;">
                                <?php foreach ($lhContacts as $c): ?>
                                    <div class="lh-contact">
                                        <div class="lh-contact-labels">
                                            <div class="lh-si"><?= htmlspecialchars($c['si']) ?></div>
                                            <div class="lh-ta"><?= htmlspecialchars($c['ta']) ?></div>
                                            <div class="lh-en-t"><?= htmlspecialchars($c['en']) ?></div>
                                        </div>
                                        <span class="lh-brace" style="font-size:40px;">}</span>
                                        <div class="lh-contact-lines">
                                            <?php foreach ($c['lines'] as $label => $value): if ($value === '') continue; ?>
                                                <div><b><?= $label ?></b>: <?= htmlspecialchars($value) ?></div>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CONFIRM ATTENDANCE TAB -->
        <div id="view-confirm-attendance" class="tab-view hidden space-y-6 max-w-6xl mx-auto admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-4">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">✅ Confirm Officers Training Attendance & Mark Absent Days</h2>
                    <p class="text-xs text-slate-500">Certificates can only be downloaded after attendance is confirmed here. Changes are saved to the database immediately.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 sm:p-4 rounded-lg border">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Program</label>
                        <select id="adminConfirmProgramSelect" onchange="renderConfirmAttendanceTable()" class="w-full p-2.5 text-xs border rounded bg-white font-bold outline-none">
                            <option value="">-- All Programs --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Status</label>
                        <select id="adminConfirmStatusSelect" onchange="renderConfirmAttendanceTable()" class="w-full p-2.5 text-xs border rounded bg-white outline-none">
                            <option value="pending">Pending confirmation</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="">All</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Search NIC / Name</label>
                        <input type="text" id="adminConfirmSearch" oninput="renderConfirmAttendanceTable()" placeholder="Type to filter..." class="w-full p-2.5 text-xs border rounded bg-white outline-none">
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span id="confirmAttendanceCount" class="text-xs font-bold text-slate-600"></span>
                    <button onclick="confirmAllShown()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded shadow">✓ Confirm All Shown</button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[860px]">
                        <thead>
                            <tr class="bg-indigo-900 text-white font-bold">
                                <th class="p-3 text-center">Confirm (✓)</th>
                                <th class="p-3">NIC</th>
                                <th class="p-3">Officer Name</th>
                                <th class="p-3">Office</th>
                                <th class="p-3">Program / Venue</th>
                                <th class="p-3 text-center">First Date</th>
                                <th class="p-3 text-center min-w-[200px]">Absent Dates</th>
                                <th class="p-3 text-center">Hours</th>
                                <th class="p-3 text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody id="confirmAttendanceTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- VERIFICATION TAB -->
        <div id="view-verification" class="tab-view max-w-5xl mx-auto space-y-6 hidden w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="border-b pb-4 mb-6 flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                            <span>📜</span> Officer Training History Verification
                        </h2>
                        <p class="text-xs text-slate-500 mt-1">Enter a National Identity Card number to view the full training transcript (all years).</p>
                    </div>
                        <button onclick="exportTableToExcel('vHistoryTable', 'Officer_Verification')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded shadow">📊 Export Excel</button>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 mb-6">
                    <input type="text" id="verifyNicInput" placeholder="Enter Officer NIC Number..." onkeydown="if(event.key==='Enter'){searchOfficerRecords()}" class="flex-1 p-3 text-sm border-2 rounded-lg outline-none focus:border-indigo-600 font-mono font-bold uppercase">
                    <button onclick="searchOfficerRecords()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-lg shadow transition text-xs uppercase tracking-wider">
                        🔍 Search Training History
                    </button>
                </div>

                <div id="verificationResults" class="hidden space-y-6">
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 id="vOfficerName" class="text-base sm:text-lg font-bold text-indigo-950"></h3>
                            <p id="vOfficerDetails" class="text-xs text-slate-600 mt-0.5"></p>
                        </div>
                        <div class="text-left sm:text-right">
                            <span class="text-xs text-slate-500 block">Confirmed Hours (this year / all years):</span>
                            <span id="vTotalHours" class="text-xl sm:text-2xl font-black text-indigo-900"></span>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table id="vHistoryTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[760px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-3">#</th>
                                    <th class="p-3">Program Name</th>
                                    <th class="p-3">Venue</th>
                                    <th class="p-3">Date(s)</th>
                                    <th class="p-3">Absent Dates</th>
                                    <th class="p-3 text-center">Hours</th>
                                    <th class="p-3 text-center">Status</th>
                                    <th class="p-3">Certificate Code</th>
                                </tr>
                            </thead>
                            <tbody id="vHistoryTableBody"></tbody>
                        </table>
                    </div>
                </div>

                <div id="verificationNotFound" class="hidden text-center py-10 text-slate-400">
                    <span class="text-4xl block mb-2">🔍</span>
                    <p class="text-sm font-semibold">No records found for the entered NIC Number.</p>
                </div>
            </div>
        </div>

        <!-- CERTIFICATE TAB -->
        <div id="view-certificate" class="tab-view hidden space-y-6 max-w-7xl mx-auto font-montserrat w-full">
            <div class="bg-slate-800 text-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-indigo-500/30 no-print space-y-5">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 gap-4">
                    <div>
                        <h1 class="text-lg sm:text-2xl font-extrabold text-amber-400 flex items-center gap-2">🎓 e-Certificate of Completion</h1>
                        <p class="text-xs text-slate-300 mt-1">Official certificate with a QR code that links to the online verification page.</p>
                    </div>
                    <div class="grid grid-cols-3 gap-2 w-full md:w-auto">
                        <button onclick="downloadCertPDF()" id="certDownloadBtn" disabled class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-3 sm:px-5 py-3 rounded-xl shadow-lg transition">📥 PDF</button>
                        <button onclick="downloadCertJPEG()" id="certImageBtn" disabled class="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-3 sm:px-5 py-3 rounded-xl shadow-lg transition">🖼️ JPEG</button>
                        <button onclick="printCompletionCert()" id="certPrintBtn" disabled class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-3 sm:px-5 py-3 rounded-xl shadow-lg transition">🖨️ Print</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/90 p-4 rounded-xl border border-indigo-500/30">
                    <div>
                        <label class="block text-xs font-bold text-amber-400 mb-1">1. Search Officer NIC *</label>
                        <div class="flex gap-2">
                            <input type="text" id="certNicSearch" placeholder="e.g. 198512345678" onkeydown="if(event.key==='Enter'){searchOfficerForCert()}" class="w-full p-2.5 bg-slate-800 text-xs font-mono font-bold uppercase border border-slate-700 text-white rounded-lg outline-none">
                            <button onclick="searchOfficerForCert()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 text-xs rounded-lg shadow transition">🔍</button>
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-amber-400 mb-1">2. Select Attended Training Program *</label>
                        <select id="certProgramSelect" onchange="generateSelectedCertificate()" disabled class="w-full p-2.5 bg-slate-800 text-xs font-semibold border border-slate-700 rounded-lg outline-none text-white">
                            <option value="">-- Search officer NIC first --</option>
                        </select>
                    </div>
                </div>
                <div id="certStatusNotice" class="hidden p-3 rounded-lg border text-xs font-bold"></div>
            </div>

            <div id="certificatePreviewArea" class="hidden w-full pb-4">
                <div class="cert-sizer">
                    <div id="certificateContainer" class="cert-sheet cert-landscape">
                        <div class="cert-frame-outer"></div>
                        <div class="cert-frame-gold"></div>
                        <div class="cert-frame-inner"></div>
                        <div class="cert-corner tl"></div><div class="cert-corner tr"></div><div class="cert-corner bl"></div><div class="cert-corner br"></div>
                        <div class="cert-watermark"><img class="tpl-logo tpl-watermark hidden" alt=""><span class="tpl-logo-default">MDTU</span></div>

                        <div style="position:absolute; inset:66px 92px 62px 92px; display:flex; flex-direction:column; align-items:center; text-align:center;">
                            <img class="tpl-emblem" src="assets/sl-emblem.png" alt="Emblem of Sri Lanka" style="position:absolute; top:4px; left:22px; height:104px; width:auto; max-width:120px; object-fit:contain;">
                            <img src="assets/nwp-logo.png" alt="North Western Provincial Council Emblem" style="position:absolute; top:4px; right:22px; height:104px; width:auto;">
                            <p style="font-family:'Cinzel',serif; font-size:11px; letter-spacing:5px; color:#92400e; font-weight:700; margin-top:32px;">NORTH WESTERN PROVINCE · SRI LANKA</p>
                            <h3 style="font-family:'Cinzel',serif; font-size:20px; font-weight:800; color:#1e1b4b; letter-spacing:2px; margin-top:2px;">MANAGEMENT DEVELOPMENT AND TRAINING UNIT</h3>

                            <h1 style="font-family:'Cinzel',serif; font-size:52px; font-weight:900; color:#1e1b4b; letter-spacing:12px; line-height:1; margin-top:20px;">CERTIFICATE</h1>
                            <p style="font-family:'Cinzel',serif; font-size:17px; font-weight:700; color:#b8860b; letter-spacing:8px; margin-top:6px;">OF COMPLETION</p>
                            <div class="cert-rule" style="width:420px; margin-top:10px;"></div>

                            <p style="font-size:21px; font-style:italic; color:#334155; margin-top:auto;">This is to certify that</p>
                            <h2 id="viewStudentName" style="font-family:'Great Vibes',cursive; font-size:56px; line-height:1.15; color:#1e1b4b; white-space:nowrap; max-width:900px; overflow:hidden;"></h2>
                            <div style="width:480px; height:1px; background:#b8860b;"></div>
                            <p id="viewStudentDetails" style="font-size:18px; font-weight:600; color:#334155; margin-top:6px; max-width:900px;"></p>

                            <p style="font-size:19px; font-style:italic; color:#334155; margin-top:8px;">has successfully completed the training programme</p>
                            <h4 id="viewCourseTitle" style="font-family:'Cinzel',serif; font-size:24px; font-weight:800; color:#1e1b4b; line-height:1.25; margin-top:4px; max-width:900px;"></h4>
                            <p style="font-size:17px; color:#334155; margin-top:6px; max-width:900px; line-height:1.4;">
                                held at <strong id="viewCourseVenue" style="color:#1e1b4b;"></strong> on <strong id="viewCourseDate" style="color:#1e1b4b;"></strong>,
                                comprising <strong id="viewCourseHours" style="color:#047857;"></strong> of training.
                            </p>

                            <div style="margin-top:auto; width:100%; display:flex; align-items:flex-end; justify-content:space-between;">
                                <div style="width:240px; display:flex; align-items:flex-end; gap:10px; text-align:left;">
                                    <div id="certQrCode" class="cert-qr" style="width:92px; height:92px; padding:4px; background:#fff; border:1px solid #cbd5e1; flex-shrink:0;"></div>
                                    <div style="font-family:'Montserrat',sans-serif;">
                                        <p style="font-size:8.5px; font-weight:700; color:#64748b; letter-spacing:1px;">CERTIFICATE NO.</p>
                                        <p id="certSerialNo" style="font-family:monospace; font-size:11px; font-weight:800; color:#1e1b4b;"></p>
                                        <p style="font-size:8.5px; font-weight:700; color:#047857; margin-top:3px;">✓ Scan QR to verify online</p>
                            </div>
                        </div>
                                <div style="display:flex; flex-direction:column; align-items:center;">
                                    <img class="tpl-seal hidden" style="width:96px; height:96px; object-fit:contain;" alt="Seal">
                                    <div class="tpl-seal-default cert-seal" style="width:96px; height:96px;"><span style="font-size:16px;">★</span><span style="font-size:10px; font-weight:800;">MDTU</span><span style="font-size:7.5px; font-weight:700;">OFFICIAL SEAL</span><span style="font-size:7.5px;">N.W.P.</span></div>
                                    <p style="font-family:'Montserrat',sans-serif; font-size:9.5px; color:#475569; margin-top:6px;">Date of Issue: <strong id="certIssueDate" style="color:#1e1b4b;"></strong></p>
                                </div>
                                <div style="width:240px; text-align:center;">
                                    <div style="height:92px; display:flex; align-items:flex-end; justify-content:center;">
                                        <img class="tpl-signature" src="assets/peththawadu-signature.png" style="max-height:88px; max-width:220px; object-fit:contain;" alt="Signature of Deputy Chief Secretary">
                                        <span class="tpl-signature-default tpl-sig-name-script hidden" style="font-family:'Great Vibes',cursive; font-size:28px; color:#1e1b4b;"></span>
                            </div>
                                    <div style="height:1px; background:#1e1b4b; margin:4px 0 5px;"></div>
                                    <p class="tpl-sig-name" style="font-family:'Montserrat',sans-serif; font-size:11.5px; font-weight:800; color:#1e1b4b;"></p>
                                    <p class="tpl-sig-title" style="font-family:'Montserrat',sans-serif; font-size:10px; font-weight:600; color:#475569;"></p>
                                    <p style="font-family:'Montserrat',sans-serif; font-size:9.5px; font-weight:700; color:#92400e;">North Western Province</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TEMPLATE SETTINGS TAB -->
        <div id="view-template-settings" class="tab-view hidden space-y-6 max-w-3xl mx-auto super-admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">🔒 Certificate Template & Organisation Settings</h2>
                    <p class="text-xs text-slate-500">Saved in the database and used on every certificate, attendance slip and the verification page.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2 bg-amber-50 p-3 rounded-lg border border-amber-300">
                        <label class="block text-xs font-bold text-slate-700">State Emblem of Sri Lanka (PNG/JPG)</label>
                        <input type="file" accept="image/png, image/jpeg" onchange="uploadTemplateAsset('stateEmblem', event)" class="w-full text-xs">
                        <div class="h-20 flex items-center justify-center bg-white rounded border"><img class="tpl-emblem max-h-16 object-contain" src="assets/sl-emblem.png" alt="State Emblem"></div>
                        <p class="text-[10px] text-slate-500">Printed at the top of the e-Certificate and the attendance certificate. A transparent PNG looks best.</p>
                        <button onclick="removeTemplateAsset('stateEmblem', 'uploaded state emblem')" class="text-[10px] font-bold text-rose-600 hover:underline">Use default emblem</button>
                    </div>
                    <div class="space-y-2 bg-slate-50 p-3 rounded-lg border">
                        <label class="block text-xs font-bold text-slate-700">Official Logo (PNG/JPG)</label>
                        <input type="file" accept="image/png, image/jpeg" onchange="uploadTemplateAsset('logo', event)" class="w-full text-xs">
                        <div class="h-20 flex items-center justify-center bg-white rounded border"><img class="tpl-logo hidden max-h-16 object-contain" alt=""><span class="tpl-logo-default text-[10px] text-slate-400">No logo</span></div>
                        <button onclick="removeTemplateAsset('logo')" class="text-[10px] font-bold text-rose-600 hover:underline">Remove</button>
                    </div>
                    <div class="space-y-2 bg-slate-50 p-3 rounded-lg border">
                        <label class="block text-xs font-bold text-slate-700">Digital Signature (transparent PNG)</label>
                        <input type="file" accept="image/png, image/jpeg" onchange="uploadTemplateAsset('signature', event)" class="w-full text-xs">
                        <div class="h-20 flex items-center justify-center bg-white rounded border"><img class="tpl-signature max-h-16 object-contain" src="assets/peththawadu-signature.png" alt="Signature"><span class="tpl-signature-default hidden text-[10px] text-slate-400">No signature</span></div>
                        <button onclick="removeTemplateAsset('signature')" class="text-[10px] font-bold text-rose-600 hover:underline">Remove</button>
                    </div>
                    <div class="space-y-2 bg-slate-50 p-3 rounded-lg border">
                        <label class="block text-xs font-bold text-slate-700">Official Seal (PNG)</label>
                        <input type="file" accept="image/png, image/jpeg" onchange="uploadTemplateAsset('seal', event)" class="w-full text-xs">
                        <div class="h-20 flex items-center justify-center bg-white rounded border"><img class="tpl-seal hidden max-h-16 object-contain" alt=""><span class="tpl-seal-default text-[10px] text-slate-400">Default gold seal</span></div>
                        <button onclick="removeTemplateAsset('seal')" class="text-[10px] font-bold text-rose-600 hover:underline">Remove</button>
                    </div>
                </div>

                <form onsubmit="saveTemplateDetails(event)" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Signatory Name</label>
                            <input type="text" id="settingMadamName" placeholder="e.g. Ms. S.M. Peththawadu" class="w-full p-2.5 text-xs border rounded">
                </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Signatory Official Title</label>
                            <input type="text" id="settingMadamTitle" placeholder="e.g. Deputy Chief Secretary (Training)" class="w-full p-2.5 text-xs border rounded">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Organisation Address</label>
                            <input type="text" id="settingOrgAddress" placeholder="Chief Secretariat, Kurunegala" class="w-full p-2.5 text-xs border rounded">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Office Phone</label>
                            <input type="text" id="settingOrgPhone" placeholder="037 2222018" class="w-full p-2.5 text-xs border rounded">
                        </div>
                    </div>
                    <div class="bg-amber-50 border border-amber-300 p-3 rounded-lg space-y-1">
                        <label class="block text-xs font-bold text-amber-950">Public Website Address for QR Codes</label>
                        <input type="url" id="settingPublicBaseUrl" placeholder="e.g. https://mdtu.nw.gov.lk/attendance" class="w-full p-2.5 text-xs border rounded bg-white font-mono">
                        <p class="text-[10px] text-amber-800">QR codes open <span class="font-mono">verify.php</span> at this address. Leave empty to use the address in your browser right now (<span id="settingCurrentBaseUrl" class="font-mono"></span>). Phones cannot open "localhost", so set your real website or LAN address here.</p>
                    </div>
                    <button type="submit" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow">💾 Save Template Details</button>
                </form>
            </div>
        </div>

        <!-- DASHBOARD TAB -->
        <div id="view-dashboard" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
                <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-bold text-slate-500 uppercase">Total Trained</p>
                        <h3 id="statTotalOfficers" class="text-xl sm:text-2xl font-black text-slate-800 mt-1">0</h3>
                    </div>
                    <div class="p-3 bg-indigo-50 text-indigo-700 rounded-lg text-xl">👥</div>
                </div>
                <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-bold text-emerald-600 uppercase">12+ Hours (Done)</p>
                        <h3 id="statCompletedOfficers" class="text-xl sm:text-2xl font-black text-emerald-600 mt-1">0</h3>
                    </div>
                    <div class="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xl">✅</div>
                </div>
                <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-bold text-rose-600 uppercase">&lt; 12 Hours</p>
                        <h3 id="statIncompleteOfficers" class="text-xl sm:text-2xl font-black text-rose-600 mt-1">0</h3>
                    </div>
                    <div class="p-3 bg-rose-50 text-rose-700 rounded-lg text-xl">⚠️</div>
                </div>
                <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-bold text-amber-600 uppercase">Completion Rate</p>
                        <h3 id="statCompletionRate" class="text-xl sm:text-2xl font-black text-amber-600 mt-1">0%</h3>
                    </div>
                    <div class="p-3 bg-amber-50 text-amber-700 rounded-lg text-xl">📈</div>
                </div>
            </div>

            <div class="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 space-y-4">
                <div class="flex justify-between items-center flex-wrap gap-2 no-print">
                    <div>
                        <h2 class="text-base sm:text-lg font-bold text-slate-900">📑 Monthly Progress — All Months</h2>
                        <p class="text-xs text-slate-500">January to December for every office. Visible to Admin and Super Admin only.</p>
                    </div>
                    <div class="flex gap-2 flex-wrap items-center">
                        <select id="dashProgressOffice" onchange="renderDashboardProgress()" class="p-2 text-xs border rounded bg-white">
                            <option value="all">All Offices</option>
                        </select>
                        <button onclick="downloadOfficialReportPDF('dashboardProgressPdf', 'Monthly_Progress_All_Months')" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow">📄 Download PDF</button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                <div id="dashboardProgressPdf" class="space-y-3">
                    <div class="text-center border-b pb-3">
                        <h3 class="text-xs font-black text-amber-600 uppercase">Management Development and Training Unit - NWP</h3>
                        <h4 class="text-sm font-black text-indigo-950 uppercase">Monthly Progress Report — All Months</h4>
                        <p id="dashProgressSubtitle" class="text-xs font-semibold text-slate-500 mt-1"></p>
                    </div>
                    <div>
                        <table id="dashboardProgressTable" class="w-full text-left text-xs border-collapse border border-slate-300 min-w-[900px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-2 border border-indigo-800">Office</th>
                                    <th class="p-2 border border-indigo-800">Month</th>
                                    <th class="p-2 border border-indigo-800">Special Remarks</th>
                                    <th class="p-2 border border-indigo-800">Productivity</th>
                                    <th class="p-2 border border-indigo-800">In-house Trainings</th>
                                    <th class="p-2 border border-indigo-800 text-center">Submitted</th>
                                </tr>
                            </thead>
                            <tbody id="dashboardProgressBody"></tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>

            <div class="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-slate-200">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 class="text-base sm:text-lg font-bold text-slate-900">📊 Provincial Officers Training Attendance Register</h2>
                    <button onclick="exportTableToExcel('dashboardTable', 'Executive_Dashboard')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition">📊 Export Excel</button>
                </div>
                <div class="overflow-x-auto">
                    <table id="dashboardTable" class="w-full text-left text-xs border-collapse min-w-[600px]">
                        <thead>
                            <tr class="bg-slate-100 text-slate-700 font-bold border-b">
                                <th class="p-3">Office</th><th class="p-3">NIC</th><th class="p-3">Officer Name</th><th class="p-3">Designation</th><th class="p-3 text-center">Hours</th><th class="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody id="overviewTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- OFFICE REPORT TAB -->
        <div id="view-office-report" class="tab-view hidden space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="flex justify-between items-center border-b pb-4 mb-6 flex-wrap gap-2">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">🏢 Office-wise 12-Hour Status Report</h2>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="exportTableToExcel('officeCompletedTable', 'Office_Wise_Report')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow">📊 Export Excel</button>
                        <button onclick="downloadOfficialReportPDF('officePdfContainer', 'Office_12Hours_Report')" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg">📄 Download PDF</button>
                    </div>
                </div>
                <select id="officeReportSelect" onchange="generateOfficeReport()" class="w-full max-w-md p-2.5 text-xs border rounded-lg mb-6 bg-white">
                    <option value="">-- Choose Office --</option>
                </select>
                <div id="officePdfContainer" class="space-y-6">
                    <div id="officeReportHeader" class="hidden text-center border-b pb-4">
                        <h3 class="text-xs font-black text-amber-600 uppercase">Management Development and Training Unit - NWP</h3>
                        <h4 id="officeReportTitle" class="text-base sm:text-lg font-black text-indigo-950 uppercase"></h4>
                        <p id="officeReportSubtitle" class="text-xs font-semibold text-slate-500 mt-1"></p>
                    </div>
                    <div id="officeCompletedSection" class="hidden space-y-3 overflow-x-auto">
                        <table id="officeCompletedTable" class="w-full text-left text-xs border-collapse border min-w-[500px]">
                            <thead><tr class="bg-indigo-900 text-white"><th class="p-2.5">NIC</th><th class="p-2.5">Name</th><th class="p-2.5">Designation</th><th class="p-2.5 text-center">Hours</th></tr></thead>
                            <tbody id="officeCompletedTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- OFFICE & DESIGNATION SUMMARY REPORT -->
        <div id="view-office-designation-report" class="tab-view hidden space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="flex justify-between items-center border-b pb-4 mb-6 flex-wrap gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-indigo-900">📊 Designation Training Hours Breakdown</h2>
                        <p class="text-xs text-slate-500">Summary count of 12h completed, incomplete, and 6h trained by designation.</p>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="exportTableToExcel('officeDesignationTable', 'Designation_Hours_Summary')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow">📊 Export Excel</button>
                        <button onclick="downloadOfficialReportPDF('officeDesignationContainer', 'Designation_Hours_Summary')" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg">📄 Download PDF</button>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-xs font-bold text-slate-700 mb-1">Select Office:</label>
                    <select id="officeDesignationSelect" onchange="generateOfficeDesignationReport()" class="w-full max-w-md p-2.5 text-xs border rounded-lg bg-white">
                        <option value="">-- Select Office --</option>
                    </select>
                </div>

                <div id="officeDesignationContainer" class="space-y-4">
                    <div id="officeDesignationHeader" class="hidden text-center border-b pb-3">
                        <h3 class="text-xs font-black text-amber-600 uppercase">Management Development and Training Unit - NWP</h3>
                        <h4 id="odReportTitle" class="text-base font-black text-indigo-950 uppercase"></h4>
                        <p id="odReportSubtitle" class="text-xs font-bold text-slate-500 mt-0.5"></p>
                    </div>

                    <div class="overflow-x-auto">
                        <table id="officeDesignationTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[600px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-3">Designation Title</th>
                                    <th class="p-3 text-center">Cadre Strength</th>
                                    <th class="p-3 text-center text-emerald-300">12h Completed</th>
                                    <th class="p-3 text-center text-rose-300">Incomplete</th>
                                    <th class="p-3 text-center text-amber-300">6h Completed</th>
                                </tr>
                            </thead>
                            <tbody id="officeDesignationTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- TRAINING NAMELIST REPORT -->
        <div id="view-training-namelist-report" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="flex justify-between items-center border-b pb-4 mb-6 flex-wrap gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-indigo-900">📑 Program Participant Name List</h2>
                        <p class="text-xs text-slate-500">Filter participants by program date and title.</p>
                    </div>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="exportTableToExcel('trainingNamelistTable', 'Training_Participants_List')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow">📊 Export Excel</button>
                        <button onclick="downloadOfficialReportPDF('trainingNamelistContainer', 'Training_Participants_List')" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg">📄 Download PDF</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">1. Training Date:</label>
                        <input type="date" id="tnFilterDate" onchange="filterTrainingNamelist()" class="w-full p-2.5 text-xs border rounded-lg bg-white outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">2. Training Program:</label>
                        <select id="tnFilterProgram" onchange="filterTrainingNamelist()" class="w-full p-2.5 text-xs border rounded-lg bg-white outline-none">
                            <option value="">-- Choose Program --</option>
                        </select>
                    </div>
                </div>

                <div id="trainingNamelistContainer" class="space-y-4">
                    <div id="tnReportHeader" class="hidden text-center border-b pb-3">
                        <h3 class="text-xs font-black text-amber-600 uppercase">Management Development and Training Unit - NWP</h3>
                        <h4 id="tnReportTitle" class="text-base font-black text-indigo-950 uppercase"></h4>
                        <p id="tnReportSubtitle" class="text-xs font-bold text-slate-500 mt-0.5"></p>
                    </div>

                    <div class="overflow-x-auto">
                        <table id="trainingNamelistTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[600px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-3">#</th>
                                    <th class="p-3">NIC Number</th>
                                    <th class="p-3">Officer Name</th>
                                    <th class="p-3">Office</th>
                                    <th class="p-3">Designation</th>
                                    <th class="p-3 text-center">Hours</th>
                                </tr>
                            </thead>
                            <tbody id="trainingNamelistTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- DUTY REPORT TAB -->
        <div id="view-duty-report" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-slate-200">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">📋 Duty Hours Official Summary</h2>
                    <button onclick="exportTableToExcel('attendanceTable', 'Duty_Hours_Report')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition">📊 Export Excel</button>
                </div>
                <div class="overflow-x-auto">
                    <table id="attendanceTable" class="w-full text-left text-xs border-collapse border min-w-[500px]">
                        <thead><tr class="bg-indigo-900 text-white"><th class="p-3">Office</th><th class="p-3">Designation & Name</th><th class="p-3 text-center">Hours</th><th class="p-3 text-center">Status</th></tr></thead>
                        <tbody id="dutyReportTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ANALYTICS TAB -->
        <div id="view-analytics" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 no-print bg-slate-50 p-3 rounded-lg border">
                    <div class="w-full sm:w-1/2">
                        <label class="block text-xs font-bold text-slate-600 mb-1">Filter Training Program:</label>
                        <select id="analyticsTrainingSelect" onchange="renderAnalytics()" class="w-full p-2 text-xs border rounded-lg bg-white font-bold text-slate-800 outline-none"></select>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto justify-end">
                        <button onclick="exportTableToExcel('analyticsFeedbackTable', 'Analytics_Summary')" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition">📊 Excel</button>
                        <button onclick="downloadAnalyticsPDF()" class="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition">📄 PDF</button>
                    </div>
                </div>
                
                <div id="pdfContentArea" class="space-y-6 bg-white p-2">
                    <div class="border-b-2 border-indigo-900 pb-4 text-center">
                        <h3 class="text-xs font-black text-amber-700 uppercase tracking-wider">Management Development and Training Unit - NWP</h3>
                        <h2 class="text-base sm:text-xl font-black text-indigo-950 uppercase tracking-wide mt-1">Participant Evaluation Analytics</h2>
                        <p id="analyticsHeaderMeta" class="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">
                            Program: All Programs | Date: All Dates
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <h4 class="text-xs font-bold text-indigo-900 text-center uppercase tracking-wider mb-2">Participant Overall Ratings</h4>
                            <div class="relative h-64 flex items-center justify-center">
                                <canvas id="feedbackDoughnutChart"></canvas>
                            </div>
                        </div>

                        <div class="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <h4 class="text-xs font-bold text-indigo-900 text-center uppercase tracking-wider mb-2">Service Evaluation</h4>
                            <div class="relative h-64 flex items-center justify-center">
                                <canvas id="quarterlyBarChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                            <span class="text-[10px] font-bold text-indigo-900 uppercase block">Total Participants</span>
                            <span id="aStatCount" class="text-xl sm:text-2xl font-black text-indigo-900">0</span>
                        </div>
                        <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                            <span class="text-[10px] font-bold text-amber-900 uppercase block">Avg Lecturer</span>
                            <span id="aStatLecturer" class="text-xl sm:text-2xl font-black text-amber-600">0 / 5</span>
                        </div>
                        <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                            <span class="text-[10px] font-bold text-emerald-900 uppercase block">Avg Food</span>
                            <span id="aStatFood" class="text-xl sm:text-2xl font-black text-emerald-600">0 / 5</span>
                        </div>
                        <div class="bg-teal-50 p-4 rounded-xl border border-teal-100 text-center">
                            <span class="text-[10px] font-bold text-teal-900 uppercase block">Avg Coordination</span>
                            <span id="aStatCoordination" class="text-xl sm:text-2xl font-black text-teal-600">0 / 5</span>
                        </div>
                    </div>

                    <div class="space-y-3 pt-2">
                        <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wider">📋 Participant Evaluation Comments</h3>
                        <div class="overflow-x-auto">
                            <table id="analyticsFeedbackTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[500px]">
                                <thead>
                                    <tr class="bg-indigo-900 text-white font-bold">
                                        <th class="p-2.5">Lecturer</th>
                                        <th class="p-2.5 text-center">Food Rating</th>
                                        <th class="p-2.5 text-center">Coordination</th>
                                        <th class="p-2.5">Feedback Comments</th>
                                    </tr>
                                </thead>
                                <tbody id="analyticsFeedbackTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- RESOURCE REPORT TAB -->
        <div id="view-resource-report" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="border-b-2 border-indigo-900 pb-4 mb-6 text-center">
                    <h3 class="text-xs font-black text-amber-600 uppercase">Management Development and Training Unit - NWP</h3>
                    <h2 class="text-base sm:text-xl font-black text-indigo-950 uppercase tracking-wide">
                        Lecturer Performance &amp; Evaluation Report
                    </h2>
                    <p class="text-[11px] text-slate-500 mt-1">Participant ratings of lecturers / resource persons (1 = Poor … 5 = Excellent)</p>
                </div>

                <div class="flex flex-wrap items-end gap-3 mb-4 no-print">
                    <label class="flex-1 min-w-[220px]">
                        <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Program</span>
                        <select id="resourceProgramSelect" onchange="renderResourceReport()" class="w-full p-2 text-xs border rounded-lg bg-white"></select>
                    </label>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="lecturerReportPDF('save')" class="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow">📄 Download PDF</button>
                        <button onclick="lecturerReportPDF('print')" class="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow">🖨️ Print</button>
                        <button onclick="lecturerReportExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow">📊 Excel</button>
                    </div>
                </div>

                <div id="resourceSummary" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4"></div>

                <div class="overflow-x-auto">
                    <table id="resourceReportTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[900px]">
                        <thead>
                            <tr class="bg-indigo-900 text-white font-bold">
                                <th class="p-2.5 text-center">No</th>
                                <th class="p-2.5">Lecturer / Resource Person</th>
                                <th class="p-2.5">Programs Conducted</th>
                                <th class="p-2.5 text-center">Evaluations</th>
                                <th class="p-2.5 text-center">5★</th>
                                <th class="p-2.5 text-center">4★</th>
                                <th class="p-2.5 text-center">3★</th>
                                <th class="p-2.5 text-center">2★</th>
                                <th class="p-2.5 text-center">1★</th>
                                <th class="p-2.5 text-center">Average</th>
                                <th class="p-2.5 text-center">Percentage</th>
                                <th class="p-2.5 text-center">Grade</th>
                            </tr>
                        </thead>
                        <tbody id="resourceReportTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- PENDING TAB -->
        <div id="view-pending" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="bg-white p-4 sm:p-6 rounded-xl shadow-md border">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 class="text-lg sm:text-xl font-bold text-rose-900">⚠️ Incomplete Training Officers (&lt;12 Hours)</h2>
                    <button onclick="exportTableToExcel('pendingGroupedTable', 'Incomplete_Officers_Report')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition">📊 Export Excel</button>
                </div>
                <div class="overflow-x-auto">
                    <table id="pendingGroupedTable" class="w-full text-left text-xs border-collapse min-w-[500px]">
                        <thead><tr class="bg-rose-50 text-rose-900"><th class="p-3">Office</th><th class="p-3 text-center">Incomplete Officers</th><th class="p-3">Officer List</th></tr></thead>
                        <tbody id="pendingGroupedTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- COMPLETED TAB -->
        <div id="view-completed" class="tab-view hidden space-y-6 admin-only w-full">
            <div class="bg-white p-4 sm:p-6 rounded-xl shadow-md border">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 class="text-lg sm:text-xl font-bold text-emerald-900">🟢 Fully Completed Officers (12+ Hours)</h2>
                    <button onclick="exportTableToExcel('completedTable', 'Completed_Officers_Summary')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition">📊 Export Excel</button>
                </div>
                <div class="overflow-x-auto">
                    <table id="completedTable" class="w-full text-left text-xs border-collapse min-w-[500px]">
                        <thead><tr class="bg-emerald-50 text-emerald-900"><th class="p-3">Office</th><th class="p-3">NIC</th><th class="p-3">Name</th><th class="p-3 text-center">Hours</th></tr></thead>
                        <tbody id="completedTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

    </main>
</div>
</div>

<!-- FOOTER -->
<footer class="bg-slate-950 text-slate-400 border-t-2 border-amber-500 no-print mt-auto pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-1 text-[11px] text-center sm:text-left border-b border-slate-800">
        <span class="font-semibold text-slate-300 tracking-wide">Management Development and Training Unit &middot; North Western Province</span>
        <span class="text-slate-500">&copy; 2026 MDTU NWP. All Rights Reserved.</span>
        </div>
    <div class="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap lg:flex-nowrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] whitespace-nowrap">
        <span class="text-slate-400">System Admin &amp; Web Developer</span>
        <span class="font-bold text-amber-400 tracking-wide">M A Wickramanayake</span>
        <span class="hidden sm:inline text-slate-700">|</span>
        <a href="mailto:Anurasiri123@gmail.com" class="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition" title="Email">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            Anurasiri123@gmail.com
        </a>
        <span class="hidden sm:inline text-slate-700">|</span>
        <a href="https://wa.me/94774940944" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition" title="WhatsApp">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z"/></svg>
            077 494 0944 <span class="text-slate-500">(WhatsApp)</span>
        </a>
        <span class="hidden sm:inline text-slate-700">|</span>
        <a href="tel:+94373333018" class="inline-flex items-center gap-1.5 text-slate-300 hover:text-sky-300 transition" title="Office">
            <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>
            037 333 3018 <span class="text-slate-500">(Office)</span>
        </a>
    </div>
</footer>

<!-- FLOATING POPUP PANELS (bottom right) -->
<div class="fixed bottom-4 right-3 sm:right-4 z-40 flex flex-col gap-3 no-print items-end">
    <!-- Active Inbox Floating Popup Panel -->
    <div id="inboxFloatingPanel" class="bg-white rounded-xl shadow-2xl border-2 border-amber-500 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden hidden">
        <div class="bg-amber-700 text-white p-2.5 flex justify-between items-center cursor-pointer" onclick="toggleFloatingInbox()">
            <span class="text-xs font-bold flex items-center gap-1.5">📥 Active Inbox Notifications</span>
            <button class="text-xs font-bold hover:text-amber-200">✖</button>
        </div>
        <div id="inboxPopupBody" class="p-3 max-h-[50vh] overflow-y-auto text-xs bg-slate-50 space-y-2"></div>
        <div class="p-2 bg-amber-50 border-t flex justify-end items-center">
            <button onclick="switchTab('notifications-tab'); toggleFloatingInbox();" class="text-[11px] font-bold text-indigo-900 hover:underline">Full Inbox Tab ➔</button>
        </div>
    </div>

    <!-- Live Chat Floating Popup Panel -->
    <div id="chatFloatingPanel" class="bg-white rounded-xl shadow-2xl border-2 border-emerald-500 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden hidden">
        <div class="bg-emerald-900 text-white p-2.5 flex justify-between items-center cursor-pointer" onclick="toggleFloatingChat()">
            <span class="text-xs font-bold flex items-center gap-1.5">💬 Live Support Chat</span>
            <button class="text-xs font-bold hover:text-amber-300">✖</button>
        </div>
        <div id="chatPopupBody" class="p-3 h-[45vh] max-h-72 overflow-y-auto text-xs bg-slate-50 space-y-2"></div>
        <form onsubmit="handleSendLiveChatMessage(event)" class="p-2 bg-white border-t flex flex-col gap-1.5">
            <select id="chatRecipientSelectFloating" class="p-1.5 text-[11px] border rounded bg-white font-bold text-indigo-900 outline-none">
                <option value="all">📢 Broadcast (All)</option>
                <option value="admin">🔒 Admin Only (Private)</option>
            </select>
            <div class="flex gap-1">
                <input type="text" id="chatInputFloating" required maxlength="1000" placeholder="Type chat..." class="flex-1 p-2 text-xs border rounded outline-none">
                <button type="submit" class="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-xs">Send</button>
            </div>
        </form>
    </div>

    <!-- Floating Buttons -->
    <div class="flex gap-2 items-end">
        <button onclick="toggleFloatingInbox()" title="Active Inbox Notifications" class="bg-amber-600 hover:bg-amber-500 text-white w-12 h-12 rounded-full shadow-xl border-2 border-white flex items-center justify-center text-base font-bold relative">
            📥
            <span id="floatingInboxBadge" class="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black min-w-[1rem] h-4 px-1 rounded-full flex items-center justify-center">0</span>
        </button>
        <button onclick="toggleFloatingChat()" title="Live Chat Support" class="bg-emerald-600 hover:bg-emerald-500 text-white w-12 h-12 rounded-full shadow-xl border-2 border-white flex items-center justify-center text-base font-bold">
            💬
        </button>
    </div>
</div>

<!-- Toast messages -->
<div id="toastContainer" class="fixed top-3 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[calc(100vw-1.5rem)] max-w-md no-print pointer-events-none"></div>

<!-- Busy overlay for PDF generation -->
<div id="busyOverlay" class="hidden fixed inset-0 z-[70] bg-slate-900/50 flex items-center justify-center no-print">
    <div class="bg-white rounded-xl shadow-2xl px-6 py-4 text-sm font-bold text-indigo-950 flex items-center gap-3">
        <span class="w-5 h-5 border-4 border-indigo-200 border-t-indigo-900 rounded-full animate-spin"></span>
        <span id="busyOverlayText">Please wait...</span>
    </div>
</div>

<!-- LOGIN MODAL -->
<div id="authModal" class="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center hidden p-4">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
        <h3 class="text-lg font-bold text-indigo-950 mb-4 text-center">User Authentication</h3>
        <form onsubmit="handleLogin(event)" class="space-y-4">
            <input type="text" id="loginUsername" placeholder="Username" required autocomplete="username" class="w-full p-2.5 text-xs border rounded">
            <input type="password" id="loginPassword" placeholder="Password" required autocomplete="current-password" class="w-full p-2.5 text-xs border rounded">
            <button type="submit" class="w-full bg-indigo-900 text-white font-bold py-2.5 rounded text-xs">Sign In</button>
            <button type="button" onclick="toggleAuthModal()" class="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded text-xs mt-1">Cancel</button>
        </form>
    </div>
</div>

<!-- CHANGE PASSWORD MODAL (forced after first login with a default or reset password) -->
<div id="changePasswordModal" class="fixed inset-0 bg-slate-900/70 z-[55] flex items-center justify-center hidden p-4">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
        <h3 class="text-lg font-bold text-indigo-950 mb-1 text-center">🔑 Change Password</h3>
        <p id="changePasswordReason" class="hidden text-xs text-rose-700 font-semibold text-center mb-3">For security you must choose your own new password before using the system.</p>
        <form onsubmit="handleChangePassword(event)" class="space-y-3 mt-3">
            <input type="text" autocomplete="username" id="cpUsername" class="hidden" tabindex="-1" aria-hidden="true">
            <input type="password" id="cpCurrent" placeholder="Current password" required autocomplete="current-password" class="w-full p-2.5 text-xs border rounded">
            <input type="password" id="cpNew" placeholder="New password" required minlength="8" autocomplete="new-password" class="w-full p-2.5 text-xs border rounded">
            <input type="password" id="cpConfirm" placeholder="Type the new password again" required minlength="8" autocomplete="new-password" class="w-full p-2.5 text-xs border rounded">
            <p class="text-[11px] text-slate-500">At least 8 characters, with both letters and numbers. Do not share your password.</p>
            <button type="submit" class="w-full bg-indigo-900 text-white font-bold py-2.5 rounded text-xs">Save New Password</button>
            <button type="button" id="cpCancelBtn" onclick="closeChangePasswordModal()" class="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded text-xs">Cancel</button>
            <button type="button" id="cpLogoutBtn" onclick="handleLogout()" class="hidden w-full bg-slate-200 text-slate-700 font-bold py-2 rounded text-xs">Logout</button>
        </form>
    </div>
</div>

<!-- NEW ALERT EDIT / POST MODAL -->
<div id="alertManageModal" class="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center hidden p-4">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4 space-y-4">
        <h3 class="text-lg font-bold text-amber-900">🚨 Manage System Alert</h3>
        <form onsubmit="saveNewAlert(event)" class="space-y-3">
            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Alert Message *</label>
                <textarea id="modalAlertTextInput" rows="3" required class="w-full p-2 text-xs border rounded bg-white" placeholder="Type alert text here..."></textarea>
            </div>
            <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded text-xs">Publish Alert</button>
                <button type="button" onclick="closeManageAlertModal()" class="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded text-xs">Cancel</button>
            </div>
        </form>
    </div>
</div>

<script type="text/javascript">
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,si,ta', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
    }
</script>
<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>

<script src="assets/app.js?v=<?= (int) @filemtime(__DIR__ . '/assets/app.js') ?>"></script>
</body>
</html>

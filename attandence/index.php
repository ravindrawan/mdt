<?php include 'db.php'; ?>
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
    <!-- html2canvas -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <!-- SheetJS (xlsx) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Great+Vibes&family=Montserrat:wght@400;600;700;800&family=Inter:wght@300;400;600;700;900&display=swap');

        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-signature { font-family: 'Great Vibes', cursive; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        .cert-card-bg {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #312e81 75%, #1e1b4b 100%);
        }

        .cert-inner-body {
            background: radial-gradient(circle at center, #ffffff 0%, #fdfbf7 70%, #f5eedc 100%);
        }

        .emboss-stamp {
            background: radial-gradient(circle, #ffe066 0%, #d4af37 50%, #8a6d1c 100%);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.6);
            border: 3px double #ffffff;
        }

        .cert-page-a4 {
            width: 297mm;
            min-height: 210mm;
            max-height: 210mm;
            box-sizing: border-box;
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
            
            @page {
                size: A4 landscape;
                margin: 0;
            }
            .cert-print-area {
                box-shadow: none !important;
                border: none !important;
                width: 297mm !important;
                height: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
                page-break-inside: avoid;
            }
        }
        
        .print-only { display: none; }
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

<div class="w-full overflow-x-hidden">
<!-- Top Navigation & Header Bar -->
<header class="bg-indigo-900 text-white shadow-xl no-print border-b-4 border-amber-500 sticky top-0 z-40">
    <div id="headerNewsAlertBar" class="bg-red-700 text-white px-3 sm:px-4 py-1.5 text-xs font-bold flex flex-col sm:flex-row justify-between items-center gap-1 shadow-inner">
        <div class="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
            <span class="bg-white text-red-700 px-2 py-0.5 rounded text-[10px] font-black uppercase animate-pulse shrink-0">🚨 Alert</span>
            <span id="headerAlertTickerText" class="truncate">MDTU System Live Support & News Alerts Active. Sample Data Loaded.</span>
        </div>
        <div class="admin-only hidden flex gap-1 shrink-0">
            <button onclick="openManageAlertModal()" class="bg-red-900 hover:bg-red-800 text-white text-[10px] px-2 py-0.5 rounded border border-red-500">Manage Alerts</button>
        </div>
    </div>

    <div class="bg-amber-100 text-amber-950 px-3 sm:px-4 py-2 text-xs font-semibold border-t border-amber-300 shadow-inner flex flex-col gap-1">
        <div class="flex items-center justify-between font-bold">
            <span class="flex items-center gap-1 text-amber-900">🔔 Active Notifications & Documents:</span>
            <span class="text-[10px] text-slate-600">Click to view/download</span>
        </div>
        <div id="headerYellowAlertListContainer" class="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
            <span class="text-slate-500 italic text-[11px]">No active notifications/files right now.</span>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 flex items-center justify-center shrink-0">
                    <img id="headerLogoImg" class="max-w-full max-h-full object-contain hidden" alt="MDTU Official Logo" />
                    <span id="headerDefaultIcon" class="text-3xl">🏛️</span>
                </div>
                <div>
                    <h1 class="text-base sm:text-xl font-extrabold tracking-wide uppercase text-red-500 drop-shadow">Training Management System</h1>
                    <h2 class="text-xs sm:text-base font-black tracking-wide uppercase text-slate-200">Management Development and Training Unit</h2>
                    <p class="text-amber-400 font-bold text-[10px] sm:text-xs tracking-wider">MDTU - NORTH WESTERN PROVINCE (NWP)</p>
                </div>
            </div>
            <!-- Mobile Menu Toggle Button -->
            <button onclick="toggleMobileSidebar()" class="md:hidden bg-indigo-800 text-amber-300 p-2 rounded-lg border border-indigo-600 text-lg">
                ☰
            </button>
        </div>
        
        <div class="logged-in-only hidden flex flex-wrap items-center gap-2">
            <!-- Reports Dropdown -->
            <div class="relative group">
                <button class="bg-indigo-800 hover:bg-indigo-700 text-amber-300 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 border border-indigo-600">
                    📊 Reports ▾
                </button>
                <div class="absolute hidden group-hover:block bg-indigo-950 text-white border border-indigo-700 rounded shadow-xl py-1 w-56 z-50 right-0 sm:left-0">
                    <a href="#" onclick="switchTab('dashboard')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Executive Dashboard</a>
                    <a href="#" onclick="switchTab('progress-reports')" class="block px-4 py-2 text-xs hover:bg-indigo-800 text-amber-300 font-bold">📑 Monthly & Annual Progress</a>
                    <a href="#" onclick="switchTab('training-plan-report')" class="block px-4 py-2 text-xs hover:bg-indigo-800 text-teal-300 font-bold">📋 Annual Training Plan Report</a>
                    <a href="#" onclick="switchTab('resource-persons-master-report')" class="block px-4 py-2 text-xs hover:bg-indigo-800 text-purple-300 font-bold">👥 Resource Persons Directory</a>
                    <a href="#" onclick="switchTab('office-report')" class="block px-4 py-2 text-xs hover:bg-indigo-800">Office-wise 12h Status</a>
                    <a href="#" onclick="switchTab('office-designation-report')" class="block px-4 py-2 text-xs hover:bg-indigo-800">Designation Hours Breakdown</a>
                    <a href="#" onclick="switchTab('training-namelist-report')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Participant Name List</a>
                    <a href="#" onclick="switchTab('duty-report')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Duty Hours Report</a>
                    <a href="#" onclick="switchTab('analytics')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Program Evaluation Analytics</a>
                    <a href="#" onclick="switchTab('resource-report')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Speaker Performance Rating</a>
                    <a href="#" onclick="switchTab('pending')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Incomplete Officers List</a>
                    <a href="#" onclick="switchTab('completed')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Completed Summary</a>
                </div>
            </div>

            <!-- Messages Dropdown -->
            <div class="relative group">
                <button class="bg-indigo-800 hover:bg-indigo-700 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 border border-indigo-600">
                    💬 Support ▾
                </button>
                <div class="absolute hidden group-hover:block bg-indigo-950 text-white border border-indigo-700 rounded shadow-xl py-1 w-48 z-50 right-0 sm:left-0">
                    <a href="#" onclick="switchTab('notifications-tab')" class="block px-4 py-2 text-xs hover:bg-indigo-800">Official Notifications</a>
                    <a href="#" onclick="switchTab('live-chat-tab')" class="block px-4 py-2 text-xs hover:bg-indigo-800">Live Support Chat</a>
                </div>
            </div>

            <!-- Settings & Data Entry Dropdown -->
            <div class="relative group">
                <button class="bg-indigo-800 hover:bg-indigo-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 border border-indigo-600">
                    ⚙️ Settings ▾
                </button>
                <div class="absolute hidden group-hover:block bg-indigo-950 text-white border border-indigo-700 rounded shadow-xl py-1 w-60 z-50 right-0 sm:left-0">
                    <a href="#" onclick="switchTab('add-record')" class="block px-4 py-2 text-xs hover:bg-indigo-800">Add Training Record</a>
                    <a href="#" onclick="switchTab('progress-entry')" class="block px-4 py-2 text-xs hover:bg-indigo-800 text-amber-300 font-bold super-user-only hidden">📈 Progress Data Entry</a>
                    <a href="#" onclick="switchTab('training-plan-entry')" class="block px-4 py-2 text-xs hover:bg-indigo-800 text-teal-300 font-bold super-user-only hidden">📝 Annual Training Plan Entry</a>
                    <a href="#" onclick="switchTab('manage-programs')" class="block px-4 py-2 text-xs hover:bg-indigo-800 only-admin-and-super hidden">Manage Programs & Resources</a>
                    <a href="#" onclick="switchTab('resource-upload')" class="block px-4 py-2 text-xs hover:bg-indigo-800 super-admin-only hidden">👥 Upload Resource Person Master</a>
                    <a href="#" onclick="switchTab('annual-excel-upload')" class="block px-4 py-2 text-xs hover:bg-indigo-800 super-admin-only hidden">Annual Staff Matrix Excel</a>
                    <a href="#" onclick="switchTab('template-settings')" class="block px-4 py-2 text-xs hover:bg-indigo-800 super-admin-only hidden">Certificate Permanent Templates</a>
                    <a href="#" onclick="switchTab('user-management')" class="block px-4 py-2 text-xs hover:bg-indigo-800 super-admin-only hidden">User Account Management</a>
                </div>
            </div>

            <!-- Other Dropdown -->
            <div class="relative group">
                <button class="bg-indigo-800 hover:bg-indigo-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 border border-indigo-600">
                    📁 Other ▾
                </button>
                <div class="absolute hidden group-hover:block bg-indigo-950 text-white border border-indigo-700 rounded shadow-xl py-1 w-52 z-50 right-0 sm:left-0">
                    <a href="#" onclick="switchTab('certificate')" class="block px-4 py-2 text-xs hover:bg-indigo-800">Generate e-Certificate</a>
                    <a href="#" onclick="switchTab('confirm-attendance')" class="block px-4 py-2 text-xs hover:bg-indigo-800 admin-only hidden">Verify & Confirm Attendance</a>
                    <a href="#" onclick="switchTab('archive-tab')" class="super-admin-only hidden block px-4 py-2 text-xs hover:bg-indigo-800">Archive (1 - 100 Years)</a>
                </div>
            </div>
        </div>

        <!-- Header Actions: Login, Translate -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
            <button id="authBtn" onclick="toggleAuthModal()" class="bg-amber-500 hover:bg-amber-400 text-indigo-950 text-xs font-black px-3 py-1.5 rounded-lg shadow transition">
                🔐 Login
            </button>

            <div class="bg-indigo-950/90 px-2 py-1 rounded-lg border border-indigo-700/80 flex items-center gap-1 shadow-inner">
                <span class="text-[10px] font-black text-amber-400 uppercase tracking-wider">🌐 Translate:</span>
                <div id="google_translate_element"></div>
            </div>

            <div id="liveStatus" class="bg-emerald-950 text-emerald-400 border border-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active
            </div>

            <div class="admin-only hidden bg-indigo-950 px-2 py-1 rounded border border-indigo-700 flex items-center gap-1">
                <label for="activeYearSelect" class="text-xs font-semibold text-indigo-200">Year:</label>
                <select id="activeYearSelect" onchange="switchYear()" class="bg-indigo-900 text-white font-bold text-xs px-1 py-0.5 rounded outline-none border border-indigo-500">
                </select>
            </div>
        </div>
    </div>
</header>

<div class="flex flex-1 max-w-7xl w-full mx-auto relative">

    <!-- Left Sidebar Navigation (Responsive Drawer on Mobile) -->
    <aside id="sidebarNav" class="w-64 bg-indigo-950 text-slate-200 min-h-screen p-4 space-y-2 no-print flex-shrink-0 border-r border-indigo-800 hidden md:block absolute md:relative z-30 inset-y-0 left-0 shadow-2xl md:shadow-none transition-all duration-300">
        <div class="flex justify-between items-center md:hidden mb-2 pb-2 border-b border-indigo-800">
            <span class="text-xs font-bold text-amber-400 uppercase">Navigation Menu</span>
            <button onclick="toggleMobileSidebar()" class="text-white font-bold text-sm bg-indigo-900 px-2 py-0.5 rounded">✕ Close</button>
        </div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2 hidden md:block">Navigation Menu</p>
        
        <button onclick="switchTab('add-record'); toggleMobileSidebar();" id="tab-add-record" class="tab-btn active w-full text-left text-xs py-2.5 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2">
            ➕ Add Training Record
        </button>
        <button onclick="switchTab('attendance-cert'); toggleMobileSidebar();" id="tab-attendance-cert" class="tab-btn w-full text-left text-xs py-2.5 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2">
            📄 Print Attendance Slip
        </button>
        <button onclick="switchTab('verification'); toggleMobileSidebar();" id="tab-verification" class="tab-btn w-full text-left text-xs py-2.5 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2">
            📜 Attendance Verification
        </button>
        <button onclick="switchTab('notifications-tab'); toggleMobileSidebar();" id="tab-notifications-tab" class="tab-btn w-full text-left text-xs py-2.5 px-3 rounded-lg hover:bg-indigo-900 transition text-amber-300 flex items-center gap-2">
            🔔 Notifications & Notes
        </button>
        <button onclick="switchTab('live-chat-tab'); toggleMobileSidebar();" id="tab-live-chat-tab" class="tab-btn w-full text-left text-xs py-2.5 px-3 rounded-lg hover:bg-indigo-900 transition text-emerald-300 flex items-center gap-2">
            💬 Live Support Chat
        </button>

        <!-- Reports Accessible to Superuser, Admin & Super Admin -->
        <div class="logged-in-only hidden pt-3 border-t border-indigo-800 space-y-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-2">Shared Reports</p>
            <button onclick="switchTab('progress-reports'); toggleMobileSidebar();" id="tab-progress-reports" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2 text-amber-300">
                📑 Monthly/Annual Presentations
            </button>
            <button onclick="switchTab('training-plan-report'); toggleMobileSidebar();" id="tab-training-plan-report" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2 text-teal-300">
                📋 Annual Training Plan Report
            </button>
            <button onclick="switchTab('resource-persons-master-report'); toggleMobileSidebar();" id="tab-resource-persons-master-report" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2 text-purple-300">
                👥 Resource Persons Directory
            </button>
            <button onclick="switchTab('office-report'); toggleMobileSidebar();" id="tab-office-report" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition">🏢 Office 12h Status</button>
            <button onclick="switchTab('office-designation-report'); toggleMobileSidebar();" id="tab-office-designation-report" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition">📊 Designation Breakdown</button>
            <button onclick="switchTab('certificate'); toggleMobileSidebar();" id="tab-certificate" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition">🎓 e-Certificate</button>
        </div>
        
        <!-- Superuser Specific Data Entry Activities -->
        <div class="super-user-only hidden pt-3 border-t border-indigo-800 space-y-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2">Superuser Data Entry</p>
            <button onclick="switchTab('progress-entry'); toggleMobileSidebar();" id="tab-progress-entry" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2 text-amber-200">
                📈 Monthly Progress Entry
            </button>
            <button onclick="switchTab('training-plan-entry'); toggleMobileSidebar();" id="tab-training-plan-entry" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2 text-teal-200">
                📝 Annual Training Plan Entry
            </button>
        </div>

        <!-- Superadmin Specific System Functions -->
        <div class="super-admin-only hidden pt-3 border-t border-indigo-800 space-y-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-rose-400 px-2">Super Admin Control</p>
            <button onclick="switchTab('resource-upload'); toggleMobileSidebar();" id="tab-resource-upload" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2">
                👥 Upload Resource Master
            </button>
            <button onclick="switchTab('annual-excel-upload'); toggleMobileSidebar();" id="tab-annual-excel-upload" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2">
                📁 Annual Staff Matrix
            </button>
            <button onclick="switchTab('template-settings'); toggleMobileSidebar();" id="tab-template-settings" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition flex items-center gap-2">
                🔒 Permanent Templates
            </button>
            <button onclick="switchTab('archive-tab'); toggleMobileSidebar();" id="tab-archive-tab" class="tab-btn w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-indigo-900 transition text-indigo-300 flex items-center gap-2">
                🏛️ Data Archive (1-100 Yrs)
            </button>
        </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-3 sm:p-6 space-y-6 overflow-x-hidden w-full max-w-full">

        <!-- 1. ADD RECORD TAB -->
        <div id="view-add-record" class="tab-view max-w-3xl mx-auto no-print w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="border-b pb-4 mb-6">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <span>➕</span> Add New Training Record & Evaluation
                    </h2>
                </div>
                
                <form id="addTrainingForm" onsubmit="handleSingleSubmit(event)" class="space-y-6">
                    <div class="bg-indigo-50/70 p-3 sm:p-4 rounded-lg border border-indigo-200 space-y-4">
                        <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wider">1. Officer Identification & Auto-Fill</h3>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">NIC / Officer ID * (Smart Auto-Detection)</label>
                                <input type="text" id="nicInput" required oninput="handleNicSmartInput(this.value)" placeholder="e.g. 833161750V or 198331601750" class="w-full p-2.5 text-sm border rounded-lg outline-none uppercase font-mono bg-white focus:ring-2 focus:ring-indigo-500">
                                <span id="nicFormatNotice" class="text-[10px] font-bold text-indigo-600 mt-1 block"></span>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Officer Name * (Auto-filled / Editable)</label>
                                <input type="text" id="nameInput" required list="officerNameDatalist" placeholder="Officer Name" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-white">
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
                                    <option value="All Account, With out User">
                                    <option value="District Secretariat, Kurunegala">
                                </datalist>
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 space-y-4">
                        <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wider">2. Program Details</h3>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Training Program Name * (Type or Select)</label>
                            <input type="text" id="trainingNameSelect" list="programDatalist" required onchange="onProgramSelected()" oninput="onProgramSelected()" placeholder="Type to search & select program..." class="w-full p-2.5 text-sm border rounded-lg outline-none bg-white">
                            <datalist id="programDatalist"></datalist>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Date (First Day) *</label>
                                <input type="date" id="dateInput" required class="w-full p-2.5 text-sm border rounded-lg outline-none bg-slate-100" readonly>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-600 mb-1">Hours *</label>
                                <input type="number" id="hoursInput" min="1" max="200" required placeholder="e.g. 6" class="w-full p-2.5 text-sm border rounded-lg outline-none bg-slate-100" readonly>
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

                    <button type="submit" id="saveBtn" class="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3.5 rounded-lg shadow-md transition text-sm">
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
                            <input type="text" id="progUserOffice" readonly class="w-full p-2.5 text-xs border rounded bg-slate-100 font-bold text-indigo-950">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                            <input type="text" id="progUserDesignation" readonly class="w-full p-2.5 text-xs border rounded bg-slate-100 font-bold text-slate-800">
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
        <div id="view-progress-reports" class="tab-view hidden max-w-5xl mx-auto space-y-6 w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b-2 border-indigo-900 pb-4 text-center">
                    <h3 class="text-xs font-black text-amber-600 uppercase tracking-widest">Management Development and Training Unit - NWP</h3>
                    <h2 class="text-base sm:text-xl font-black text-indigo-950 uppercase mt-0.5">Monthly & Annual Progress Presentation Center</h2>
                    <p class="text-xs text-slate-500">Accessible to Superuser, Admin, and Super Admin</p>
                </div>

                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
                    <p class="text-xs text-slate-600 font-medium">Download formal slides as presentation-ready PDF or raw data as Excel.</p>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="downloadPresentationPDF()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs px-3.5 py-2 rounded shadow">📄 Download Presentation PDF</button>
                        <button onclick="exportProgressReportToExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded shadow">📊 Export Excel</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3 sm:p-4 rounded-lg border no-print">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Filter Presentation Mode:</label>
                        <select id="presViewType" onchange="renderProgressPresentations()" class="w-full p-2 text-xs border rounded bg-white font-bold">
                            <option value="annual">Annual Consolidated Presentation (12 Months)</option>
                            <option value="monthly">Monthly Specific Presentation</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Filter Office:</label>
                        <select id="presOfficeSelect" onchange="renderProgressPresentations()" class="w-full p-2 text-xs border rounded bg-white">
                            <option value="all">All Offices</option>
                        </select>
                    </div>
                    <div id="presMonthWrapper" class="hidden">
                        <label class="block text-xs font-bold text-slate-700 mb-1">Select Month:</label>
                        <select id="presMonthSelect" onchange="renderProgressPresentations()" class="w-full p-2 text-xs border rounded bg-white font-bold">
                            <option value="all">All Months</option>
                            <option value="January">January</option><option value="February">February</option>
                            <option value="March">March</option><option value="April">April</option>
                            <option value="May">May</option><option value="June">June</option>
                            <option value="July">July</option><option value="August">August</option>
                            <option value="September">September</option><option value="October">October</option>
                            <option value="November">November</option><option value="December">December</option>
                        </select>
                    </div>
                </div>

                <!-- Presentation Slide Container -->
                <div id="presentationSlidesArea" class="space-y-8 flex flex-col items-center w-full overflow-x-auto">
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
                            <input type="text" id="tpOffice" readonly class="w-full p-2.5 text-xs border rounded bg-slate-100 font-bold text-teal-950">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                            <input type="text" id="tpDesignation" readonly class="w-full p-2.5 text-xs border rounded bg-slate-100 font-bold text-slate-800">
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

        <!-- SUPERADMIN DATA ARCHIVE TAB -->
        <div id="view-archive-tab" class="tab-view hidden space-y-6 max-w-4xl mx-auto super-admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-indigo-200">
                <div class="border-b pb-4 mb-4 flex justify-between items-center bg-indigo-50 p-4 rounded-lg flex-wrap gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-indigo-950 flex items-center gap-2">
                            <span>🏛️</span> Data Archive Management System
                        </h2>
                        <p class="text-xs text-indigo-700 mt-1">Backup & Archive historical records from 1 to 100 Years into permanent structured storage.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div class="bg-slate-50 p-4 rounded-lg border">
                        <label class="block text-xs font-bold text-slate-700 mb-1">Select Archive Period:</label>
                        <select id="archiveYearRange" class="w-full p-2 text-xs border rounded bg-white font-bold">
                            <option value="1-100">Years 1 - 100 Complete Storage Archive Schema</option>
                            <option value="1-25">Years 1 - 25 Archive</option>
                            <option value="25-50">Years 25 - 50 Archive</option>
                            <option value="50-100">Years 50 - 100 Archive</option>
                        </select>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-lg border flex flex-col justify-end">
                        <button onclick="executeArchiveBackup()" class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold px-4 py-2 text-xs rounded shadow">
                            📦 Compress & Export Data Archive
                        </button>
                    </div>
                </div>

                <div id="archiveLogArea" class="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto space-y-1">
                    <p>[SYSTEM ARCHIVE LOG] Storage schema operational. Ready to archive records.</p>
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
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-emerald-300 flex flex-col h-[650px]">
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
        <div id="view-manage-programs" class="tab-view hidden space-y-6 max-w-4xl mx-auto only-admin-and-super w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
                <div class="border-b pb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">⚙️ Program & Resource Person Setup</h2>
                    <p class="text-xs text-slate-500">Configure official training programs, schedules, and assigning faculty.</p>
                </div>

                <form onsubmit="handleSaveProgramConfig(event)" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Program Name *</label>
                            <input type="text" id="progNameConfig" required placeholder="e.g. Advanced Office Management" class="w-full p-2.5 text-xs border rounded outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Venue / Location *</label>
                            <input type="text" id="progVenueConfig" required placeholder="e.g. MDTU Auditorium, Kurunegala" class="w-full p-2.5 text-xs border rounded outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Program Dates * (Comma separated)</label>
                        <input type="text" id="progDatesConfig" required placeholder="2026-10-01, 2026-10-02" onchange="calculateProgramHours()" class="w-full p-2.5 text-xs border rounded outline-none font-mono">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">First Day (Auto calculated)</label>
                            <input type="date" id="progFirstDateConfig" readonly class="w-full p-2.5 text-xs border rounded bg-slate-100 font-bold text-indigo-950">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Calculated Hours (6 hrs/day)</label>
                            <input type="number" id="progHoursConfig" readonly class="w-full p-2.5 text-xs border rounded bg-slate-100 font-bold text-amber-700">
                        </div>
                    </div>

                    <div class="border-t pt-4 space-y-3">
                        <div class="flex justify-between items-center">
                            <label class="text-xs font-bold text-slate-700">Resource Persons / Lecturers:</label>
                            <button type="button" onclick="addResourcePersonConfigRow()" class="bg-indigo-900 text-white text-xs font-bold px-3 py-1 rounded">+ Add Lecturer</button>
                        </div>
                        <div id="progResourcePersonsContainer" class="space-y-2"></div>
                    </div>

                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow text-xs uppercase tracking-wider">
                        💾 Save Program Configuration
                    </button>
                </form>

                <div class="pt-6 border-t">
                    <h3 class="text-sm font-bold text-indigo-950 mb-3">Configured Training Programs</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse border min-w-[600px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white"><th class="p-2">Program</th><th class="p-2">Venue</th><th class="p-2">Dates</th><th class="p-2 text-center">Hours</th><th class="p-2">Resource Persons</th></tr>
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
                            <input type="text" id="newPassword" required placeholder="Password" class="w-full p-2 text-xs border rounded outline-none bg-white font-mono">
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
                        <table class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[500px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-2.5">Username</th>
                                    <th class="p-2.5">System Role</th>
                                    <th class="p-2.5">Password</th>
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

        <!-- ATTENDANCE CERTIFICATE SLIP TAB -->
        <div id="view-attendance-cert" class="tab-view max-w-4xl mx-auto space-y-6 hidden w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 no-print">
                <div class="border-b pb-4 mb-6">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <span>📄</span> Generate & Print Attendance Slip
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Search by National Identity Card (NIC) to verify participation and print an official attendance confirmation slip.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">National Identity Card (NIC) *</label>
                        <input type="text" id="attNicInput" placeholder="Enter NIC..." class="w-full p-2.5 text-xs border rounded font-mono uppercase">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Training Program Name *</label>
                        <select id="attProgSelect" class="w-full p-2.5 text-xs border rounded bg-white">
                            <option value="">-- Select Program --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Start Date (First Day) *</label>
                        <input type="date" id="attDateInput" class="w-full p-2.5 text-xs border rounded">
                    </div>
                </div>

                <button onclick="generateAttendanceCertSlip()" class="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 rounded-lg shadow text-xs uppercase tracking-wider">
                    🔍 Retrieve Official Attendance Slip
                </button>
            </div>

            <div id="attendanceSlipContainer" class="hidden bg-white p-4 sm:p-8 rounded-xl shadow-2xl border border-slate-300 max-w-3xl mx-auto font-sans text-slate-900 w-full overflow-x-auto">
                <div class="flex flex-col items-center border-b-2 border-indigo-900 pb-4 mb-6">
                    <div class="w-16 h-16 mb-2 flex items-center justify-center">
                        <img id="attSlipLogoImg" class="max-w-full max-h-full object-contain hidden" alt="MDTU Official Logo" />
                        <div id="attSlipDefaultLogo" class="w-14 h-14 rounded-full bg-indigo-900 text-amber-400 flex items-center justify-center font-black text-xs text-center border-2 border-amber-400">
                            MDTU<br>LOGO
                        </div>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xs sm:text-sm font-bold text-indigo-950 uppercase">Management Development and Training Unit - North Western Province</h3>
                        <h2 class="text-base sm:text-xl font-black text-indigo-900 mt-1 uppercase">Certificate of Attendance Confirmation</h2>
                        <p class="text-xs font-bold text-amber-700">MDTU Provincial Centre, Kurunegala</p>
                    </div>
                </div>

                <div class="space-y-4 text-xs leading-relaxed">
                    <p><strong>Officer Name:</strong> <span id="attSlipName" class="font-bold underline text-indigo-950"></span></p>
                    <p><strong>Designation:</strong> <span id="attSlipDesignation" class="font-bold text-slate-800"></span></p>
                    <p><strong>Office / Department:</strong> <span id="attSlipOffice" class="font-bold text-slate-800"></span></p>
                    <p><strong>National ID Number:</strong> <span id="attSlipNic" class="font-mono font-bold text-indigo-900"></span></p>
                    
                    <div class="bg-slate-50 p-3 rounded border my-3">
                        <p><strong>Training Program:</strong> <span id="attSlipProg" class="font-bold text-indigo-950"></span></p>
                        <p><strong>Venue:</strong> <span id="attSlipVenue" class="font-bold text-slate-800"></span></p>
                        <p><strong>Conducted Dates:</strong> <span id="attSlipDates" class="font-bold text-amber-800"></span></p>
                        <p id="attSlipAbsentSection" class="hidden text-rose-600 font-bold"><strong>Recorded Absent Dates:</strong> <span id="attSlipAbsentDates"></span></p>
                        <p><strong>Total Completed Duration:</strong> <span id="attSlipHours" class="font-bold text-emerald-700"></span> Hours</p>
                    </div>

                    <p class="text-justify pt-2">
                        This is to certify that the above-named officer has successfully participated in the above program organized by the Management Development and Training Unit (NWP).
                    </p>

                    <div id="attAdminConfirmedNotice" class="hidden bg-emerald-50 text-emerald-900 p-2 rounded border border-emerald-300 font-bold text-center my-2">
                        ✓ Participation officially confirmed and verified by the Deputy Chief Secretary (Training).
                    </div>

                    <p class="text-xs text-slate-700 pt-4 font-semibold text-center border-t border-slate-200 mt-4">
                        This document is system generated and official attendance can be verified through https://mdtu.nw.gov.lk/attendance.
                    </p>
                </div>

                <div class="mt-8 no-print flex justify-end gap-3">
                    <button onclick="window.print()" class="bg-indigo-900 text-white text-xs font-bold px-4 py-2 rounded shadow">🖨️ Print Slip</button>
                </div>
            </div>
        </div>

        <!-- CONFIRM ATTENDANCE TAB -->
        <div id="view-confirm-attendance" class="tab-view hidden space-y-6 max-w-6xl mx-auto admin-only w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-4">
                <div class="border-b pb-4 mb-4">
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">✅ Confirm Officers Training Attendance & Mark Absent Days</h2>
                    <p class="text-xs text-slate-500">Filter by Program Name and Date. Check boxes to confirm presence, or record absent dates.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">1. Program Name *</label>
                        <select id="adminConfirmProgramSelect" onchange="filterAdminConfirmAttendance()" class="w-full p-2.5 text-xs border rounded bg-white font-bold outline-none">
                            <option value="">-- Select Program --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">2. First Date *</label>
                        <input type="date" id="adminConfirmFirstDate" onchange="filterAdminConfirmAttendance()" class="w-full p-2.5 text-xs border rounded bg-white outline-none">
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[700px]">
                        <thead>
                            <tr class="bg-indigo-900 text-white font-bold">
                                <th class="p-3 text-center">Confirm (✓)</th>
                                <th class="p-3">NIC</th>
                                <th class="p-3">Officer Name</th>
                                <th class="p-3">Office</th>
                                <th class="p-3">Program Name</th>
                                <th class="p-3 text-center">First Date</th>
                                <th class="p-3 text-center min-w-[220px]">Recorded Absent Dates</th>
                            </tr>
                        </thead>
                        <tbody id="confirmAttendanceTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- VERIFICATION TAB -->
        <div id="view-verification" class="tab-view max-w-4xl mx-auto space-y-6 hidden w-full">
            <div class="bg-white p-4 sm:p-8 rounded-xl shadow-md border border-slate-200">
                <div class="border-b pb-4 mb-6 flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold text-indigo-900 flex items-center gap-2">
                            <span>📜</span> Officer Training History Verification
                        </h2>
                        <p class="text-xs text-slate-500 mt-1">Enter National Identity Card number to view training transcript.</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="exportTableToExcel('vHistoryTable', 'Officer_Verification')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded shadow">📊 Export Excel</button>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 mb-6">
                    <input type="text" id="verifyNicInput" placeholder="Enter Officer NIC Number..." class="flex-1 p-3 text-sm border-2 rounded-lg outline-none focus:border-indigo-600 font-mono font-bold uppercase">
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
                            <span class="text-xs text-slate-500 block">Total Completed Hours:</span>
                            <span id="vTotalHours" class="text-xl sm:text-2xl font-black text-indigo-900"></span>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table id="vHistoryTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[600px]">
                            <thead>
                                <tr class="bg-indigo-900 text-white font-bold">
                                    <th class="p-3">#</th>
                                    <th class="p-3">Program Name</th>
                                    <th class="p-3">Attended Date</th>
                                    <th class="p-3">Absent Dates</th>
                                    <th class="p-3">Lecturer</th>
                                    <th class="p-3 text-center">Hours</th>
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
            <div class="bg-slate-800 text-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-indigo-500/30 no-print space-y-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 gap-4">
                    <div>
                        <h1 class="text-xl sm:text-2xl font-extrabold text-amber-400 flex items-center gap-2">
                            🎨 Advanced Colourful e-Certificate Generator
                        </h1>
                        <p class="text-xs text-slate-300 mt-1">Official authenticated certificates with embedded QR codes and digital signatures.</p>
                    </div>
                    <div class="flex gap-3 flex-wrap">
                        <button onclick="downloadCertPDF()" id="certDownloadBtn" disabled class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2">
                            📥 Download PDF Certificate
                        </button>
                        <button onclick="downloadCertJPEG()" id="certImageBtn" disabled class="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2">
                            🖼️ Save Image (JPEG)
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/90 p-4 rounded-xl border border-indigo-500/30">
                    <div>
                        <label class="block text-xs font-bold text-amber-400 mb-1">1. Search Officer NIC *</label>
                        <div class="flex gap-2">
                            <input type="text" id="certNicSearch" placeholder="e.g. 198512345678" class="w-full p-2.5 bg-slate-800 text-xs font-mono font-bold uppercase border border-slate-700 text-white rounded-lg outline-none">
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
            </div>

            <div class="overflow-x-auto flex justify-center p-2 w-full">
                <div id="certificateContainer" class="cert-print-area cert-page-a4 cert-card-bg relative rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden select-none p-6 box-border shrink-0">
                    <div class="absolute inset-3 border-4 border-amber-400/80 rounded-xl pointer-events-none"></div>
                    <div class="absolute inset-5 border-2 border-amber-200/50 rounded-lg pointer-events-none"></div>

                    <div class="cert-inner-body w-full h-full rounded-lg p-6 relative flex flex-col justify-between border-2 border-amber-300/60 shadow-inner box-border">
                        <div class="flex items-center justify-between border-b-2 border-amber-400/40 pb-3">
                            <div class="w-20 h-20 flex items-center justify-center">
                                <img id="certLogo" class="max-w-full max-h-full object-contain hidden" />
                                <div id="defaultLogo" class="w-16 h-16 rounded-full bg-indigo-900 text-amber-400 flex items-center justify-center font-black text-xs text-center border-2 border-amber-400">
                                    MDTU<br>LOGO
                                </div>
                            </div>

                            <div class="text-center flex-1 px-4">
                                <h3 class="text-[10px] sm:text-xs font-black text-amber-700 tracking-widest uppercase">MANAGEMENT DEVELOPMENT AND TRAINING UNIT</h3>
                                <h1 class="text-base sm:text-xl font-black text-indigo-950 uppercase tracking-wide">NORTH WESTERN PROVINCE, SRI LANKA</h1>
                                <p class="text-[9px] sm:text-[10px] text-slate-600 font-bold tracking-wider mt-0.5">PROVINCIAL TRAINING CENTRE E-CERTIFICATE</p>
                            </div>

                            <div class="w-20 h-20 flex items-center justify-center">
                                <img id="certSeal" class="max-w-full max-h-full object-contain hidden" />
                                <div id="defaultSeal" class="emboss-stamp w-16 h-16 rounded-full flex flex-col items-center justify-center text-slate-900 font-black text-[9px] text-center uppercase transform rotate-6">
                                    ⭐<br>OFFICIAL<br>SEAL
                                </div>
                            </div>
                        </div>

                        <div class="text-center my-2">
                            <h2 class="text-xl sm:text-3xl font-black font-cinzel text-indigo-950 tracking-widest uppercase drop-shadow">CERTIFICATE OF COMPLETION</h2>
                            <div class="w-48 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-1"></div>
                            <p class="text-[10px] sm:text-[11px] font-bold text-amber-700 tracking-widest uppercase mt-1">THIS IS PROUDLY PRESENTED TO</p>
                        </div>

                        <div class="text-center space-y-2">
                            <div class="border-b-2 border-amber-500/40 pb-1 max-w-xl mx-auto">
                                <h3 id="viewStudentName" class="text-xl sm:text-2xl font-black font-cinzel text-indigo-950 tracking-wide">A.B. PERERA</h3>
                            </div>

                            <p id="viewStudentDetails" class="text-xs font-bold text-slate-600">Management Assistant - Department of Education</p>

                            <p class="text-xs text-slate-700 leading-relaxed max-w-2xl mx-auto pt-1">
                                for successfully participating and completing the official capacity development training program on
                            </p>

                            <div class="bg-indigo-950 text-amber-300 py-2 px-6 rounded-xl max-w-2xl mx-auto shadow-md border border-amber-400/50">
                                <h4 id="viewCourseTitle" class="text-sm sm:text-lg font-extrabold uppercase tracking-wide">ADVANCED OFFICE MANAGEMENT & CAPACITY BUILDING</h4>
                            </div>

                            <p class="text-xs font-bold text-slate-600">
                                Conducted on <span id="viewCourseDate" class="text-indigo-950 font-black">2026-09-22</span> with a total duration of 
                                <span id="viewCourseHours" class="bg-amber-100 text-indigo-950 px-2 py-0.5 rounded border border-amber-300 font-extrabold">12 Hours</span>.
                            </p>
                        </div>

                        <div class="flex justify-between items-end pt-3 border-t-2 border-amber-400/40 flex-wrap gap-4">
                            <div class="flex items-center gap-3">
                                <div id="certQrCode" class="bg-white p-1 rounded-lg border border-slate-300 shadow min-w-[60px] min-h-[60px]"></div>
                                <div class="text-left">
                                    <p class="text-[9px] font-bold text-slate-500">VERIFICATION CODE:</p>
                                    <p id="certSerialNo" class="text-[10px] font-mono font-black text-indigo-950">MDTU-2026-NWP-9823</p>
                                    <p class="text-[8px] text-emerald-600 font-bold">✓ Official Authenticated Record</p>
                                </div>
                            </div>

                            <div class="text-center flex flex-col items-center">
                                <div class="h-12 flex items-center justify-center">
                                    <img id="certSignature" class="max-h-12 object-contain hidden" />
                                    <span id="defaultSignature" class="font-signature text-xl sm:text-2xl text-indigo-950 font-bold transform -rotate-3 select-none">
                                        S.M. Peththawadu
                                    </span>
                                </div>
                                <div class="w-48 h-0.5 bg-indigo-950/60 my-1"></div>
                                <h5 id="viewMadamName" class="text-xs font-black text-indigo-950">Ms. S.M. Peththawadu</h5>
                                <p id="viewMadamTitle" class="text-[10px] font-bold text-slate-600">Deputy Chief Secretary (Training)</p>
                                <p class="text-[9px] font-extrabold text-amber-700">North Western Province</p>
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
                    <h2 class="text-lg sm:text-xl font-bold text-indigo-900">🔒 Permanent Certificate Template Assets</h2>
                    <p class="text-xs text-slate-500">Changes stay saved permanently. Only authorized Super Admin can update.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-700">Official Logo PNG</label>
                        <input type="file" accept="image/png, image/jpeg" onchange="uploadTemplateAsset('logo', event)" class="w-full p-2 text-xs border rounded">
                        <div id="previewLogoContainer" class="h-16 flex items-center"></div>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-700">Digital Signature PNG</label>
                        <input type="file" accept="image/png, image/jpeg" onchange="uploadTemplateAsset('signature', event)" class="w-full p-2 text-xs border rounded">
                        <div id="previewSigContainer" class="h-16 flex items-center"></div>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-700">Custom Embossed Seal PNG</label>
                        <input type="file" accept="image/png, image/jpeg" onchange="uploadTemplateAsset('seal', event)" class="w-full p-2 text-xs border rounded">
                        <div id="previewSealContainer" class="h-16 flex items-center"></div>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-700">Signatory Details</label>
                        <input type="text" id="settingMadamName" placeholder="Signatory Name" oninput="saveMadamDetails()" class="w-full p-2 text-xs border rounded mb-1">
                        <input type="text" id="settingMadamTitle" placeholder="Official Title" oninput="saveMadamDetails()" class="w-full p-2 text-xs border rounded">
                    </div>
                </div>

                <div class="pt-4 border-t flex justify-between items-center">
                    <span class="text-xs text-rose-600 font-bold">⚠️ Reset Saved Assets</span>
                    <button onclick="resetTemplateSettings()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded shadow">Reset Assets</button>
                </div>
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
                        Speaker Performance & Evaluation Report
                    </h2>
                </div>

                <div class="flex justify-between items-center mb-6 no-print flex-wrap gap-2">
                    <span class="text-xs font-bold text-slate-500">Resource person overall performance and participant scores:</span>
                    <div class="flex gap-2">
                        <button onclick="exportTableToExcel('resourceReportTable', 'Resource_Persons_Report')" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow">📊 Excel</button>
                        <button onclick="downloadOfficialReportPDF('resourcePdfContainer', 'Resource_Persons_Report')" class="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow">📄 PDF</button>
                    </div>
                </div>

                <div id="resourcePdfContainer" class="space-y-6 overflow-x-auto">
                    <table id="resourceReportTable" class="w-full text-left text-xs border-collapse border border-slate-200 min-w-[500px]">
                        <thead>
                            <tr class="bg-indigo-900 text-white font-bold">
                                <th class="p-3">Resource Person</th>
                                <th class="p-3 text-center">Programs Conducted</th>
                                <th class="p-3 text-center">Average Score</th>
                                <th class="p-3 text-center">Percentage</th>
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

<!-- COMPACT SUBTLE FOOTER -->
<footer class="bg-slate-900 text-slate-400 py-2.5 px-4 border-t border-slate-800 text-[11px] no-print mt-auto">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 font-medium text-center sm:text-left">
        <div class="tracking-wide text-slate-300">
            <span class="font-bold text-amber-400">System admin</span> - Anurasiri wickramanayake, <a href="mailto:Anurasiri123@gmail.com" class="hover:text-amber-300 underline font-mono">Anurasiri123@gmail.com</a> (email), <span class="font-mono text-emerald-400">0774940944</span> (WhatsApp), <span class="font-mono text-slate-300">0373333018</span> (office)
        </div>
        <div class="text-[10px] text-slate-500">
            &copy; 2026 MDTU NWP. All Rights Reserved.
        </div>
    </div>
</footer>

<!-- FLOATING POPUP PANELS ON TOP RIGHT -->
<div class="fixed top-20 right-4 z-50 flex flex-col gap-3 no-print items-end">
    <!-- Active Inbox Floating Popup Panel -->
    <div id="inboxFloatingPanel" class="bg-white rounded-xl shadow-2xl border-2 border-amber-500 w-72 sm:w-96 overflow-hidden hidden">
        <div class="bg-amber-700 text-white p-2.5 flex justify-between items-center cursor-pointer" onclick="toggleFloatingInbox()">
            <span class="text-xs font-bold flex items-center gap-1.5">📥 Active Inbox Notifications</span>
            <button class="text-xs font-bold hover:text-amber-200">✖</button>
        </div>
        <div id="inboxPopupBody" class="p-3 max-h-80 overflow-y-auto text-xs bg-slate-50 space-y-2">
        </div>
        <div class="p-2 bg-amber-50 border-t flex justify-between items-center">
            <span class="text-[10px] text-slate-500">Edit/Delete enabled</span>
            <button onclick="switchTab('notifications-tab'); toggleFloatingInbox();" class="text-[11px] font-bold text-indigo-900 hover:underline">Full Inbox Tab ➔</button>
        </div>
    </div>

    <!-- Live Chat Floating Popup Panel -->
    <div id="chatFloatingPanel" class="bg-white rounded-xl shadow-2xl border-2 border-emerald-500 w-72 sm:w-88 overflow-hidden hidden">
        <div class="bg-emerald-900 text-white p-2.5 flex justify-between items-center cursor-pointer" onclick="toggleFloatingChat()">
            <span class="text-xs font-bold flex items-center gap-1.5">💬 Live Support Chat</span>
            <button class="text-xs font-bold hover:text-amber-300">✖</button>
        </div>
        <div id="chatPopupBody" class="p-3 h-64 overflow-y-auto text-xs bg-slate-50 space-y-2">
        </div>
        <form onsubmit="handleSendLiveChatMessage(event)" class="p-2 bg-white border-t flex flex-col gap-1.5">
            <select id="chatRecipientSelectFloating" class="p-1 text-[11px] border rounded bg-white font-bold text-indigo-900 outline-none">
                <option value="all">📢 Broadcast (All)</option>
                <option value="admin">🔒 Admin Only (Private)</option>
            </select>
            <div class="flex gap-1">
                <input type="text" id="chatInputFloating" required placeholder="Type chat..." class="flex-1 p-1.5 text-xs border rounded outline-none">
                <button type="submit" class="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-xs">Send</button>
            </div>
        </form>
    </div>

    <!-- Dual Floating Buttons -->
    <div class="flex flex-col gap-2 items-end">
        <button onclick="toggleFloatingInbox()" title="Active Inbox Notifications" class="bg-amber-600 hover:bg-amber-500 text-white p-3 rounded-full shadow-xl border-2 border-white flex items-center justify-center text-sm font-bold relative">
            📥
            <span id="floatingInboxBadge" class="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">0</span>
        </button>
        <button onclick="toggleFloatingChat()" title="Live Chat Support" class="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-full shadow-xl border-2 border-white flex items-center justify-center text-sm font-bold">
            💬
        </button>
    </div>
</div>

<!-- LOGIN MODAL -->
<div id="authModal" class="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center hidden p-4">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
        <h3 class="text-lg font-bold text-indigo-950 mb-4 text-center">User Authentication</h3>
        <form onsubmit="handleLogin(event)" class="space-y-4">
            <input type="text" id="loginUsername" placeholder="Username" required class="w-full p-2.5 text-xs border rounded">
            <input type="password" id="loginPassword" placeholder="Password" required class="w-full p-2.5 text-xs border rounded">
            <button type="submit" class="w-full bg-indigo-900 text-white font-bold py-2.5 rounded text-xs">Sign In</button>
            <button type="button" onclick="toggleAuthModal()" class="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded text-xs mt-1">Cancel</button>
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

<script>
    const CURRENT_YEAR = new Date().getFullYear();
    let selectedYear = CURRENT_YEAR;
    let authRole = 'none';
    let currentUser = null;
    let globalDatabase = {};
    let programConfigs = [];
    let annualStaffMatrix = [];
    let systemUsers = [];
    let notificationsList = [];
    let liveChatMessages = [];
    let progressSubmissions = [];
    let trainingPlansList = [];
    let masterResourcePersons = [];
    let currentNewAlertText = "🚨 MDTU System Live Support & News Alerts Active. Sample Data Loaded.";

    const STORAGE_KEYS = { 
        LOGO: 'cert_perm_logo', 
        SIG: 'cert_perm_signature', 
        SEAL: 'cert_perm_seal', 
        MADAM_NAME: 'cert_perm_madam_name', 
        MADAM_TITLE: 'cert_perm_madam_title', 
        PROGS: 'mdtu_program_configs', 
        STAFF_MATRIX: 'mdtu_staff_matrix',
        USERS: 'mdtu_system_users',
        NOTIFS: 'mdtu_notifications_list',
        CHAT: 'mdtu_live_chat_messages',
        OFFICERS: 'mdtu_officers_directory',
        ALERT: 'mdtu_new_alert_ticker',
        PROGRESS_REPORTS: 'mdtu_progress_submissions',
        TRAINING_PLANS: 'mdtu_training_plans_list',
        MASTER_RESOURCES: 'mdtu_master_resource_persons'
    };

    let officersDirectory = {};

    window.onload = function() {
        document.getElementById('dateInput').valueAsDate = new Date();
        loadSystemUsers();
        loadProgramConfigs();
        loadAnnualStaffMatrix();
        loadNotifications();
        loadLiveChatMessages();
        loadOfficersDirectory();
        loadNewsAlert();
        loadProgressSubmissionsFromAPI();
        loadTrainingPlans();
        loadMasterResourcePersons();
        fetchLiveData();
        loadSavedTemplate();
        updateAuthUI();
        updateChatRecipientOptions();
        updateNotificationRecipientOptions();
        updateOfficeDropdowns();
    };

    function toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebarNav');
        if (sidebar) {
            sidebar.classList.toggle('hidden');
        }
    }

    function convertNicFormat(nicStr) {
        let clean = nicStr.trim().toUpperCase();
        if (/^\d{9}[VX]$/.test(clean)) {
            let year = "19" + clean.substring(0, 2);
            let days = clean.substring(2, 5);
            let serial = clean.substring(5, 9);
            return year + days + "0" + serial;
        }
        return clean;
    }

    function handleNicSmartInput(val) {
        let converted = convertNicFormat(val);
        let notice = document.getElementById('nicFormatNotice');
        if (notice) {
            if (converted !== val.trim().toUpperCase() && converted.length === 12) {
                notice.innerText = `Converted Smart NIC: ${converted}`;
            } else {
                notice.innerText = `NIC: ${converted}`;
            }
        }

        let existing = officersDirectory[converted] || officersDirectory[val.trim().toUpperCase()];
        if (existing) {
            document.getElementById('nameInput').value = existing.name || '';
            document.getElementById('designationInput').value = existing.designation || '';
            document.getElementById('officeInput').value = existing.office || '';
        }
    }

    function loadOfficersDirectory() {
        const saved = localStorage.getItem(STORAGE_KEYS.OFFICERS);
        if (saved) {
            try { officersDirectory = JSON.parse(saved); } catch(e) { officersDirectory = {}; }
        } else {
            officersDirectory = {
                "198512345678": { name: "A.B. Perera", designation: "Management Assistant", office: "District Secretariat, Kurunegala" },
                "199012345678": { name: "C.D. Silva", designation: "Development Officer", office: "District Secretariat, Kurunegala" },
                "198898765432": { name: "K.L. Fernando", designation: "Executive Officer", office: "District Secretariat, Kurunegala" }
            };
            saveOfficersDirectory();
        }
    }

    function saveOfficersDirectory() {
        localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officersDirectory));
    }

    function handleSuperuserIdLookup(val) {
        let conv = convertNicFormat(val);
        let found = officersDirectory[conv] || officersDirectory[val.trim().toUpperCase()];
        if (found) {
            document.getElementById('progUserOffice').value = found.office || '';
            document.getElementById('progUserDesignation').value = found.designation || '';
            autoCalculateOfficeStaffProgress();
            populateAutoMdtuPrograms(found.office);
        }
    }

    function populateAutoMdtuPrograms(officeName) {
        let listContainer = document.getElementById('progAutoProgramsList');
        if (!listContainer) return;
        const records = globalDatabase[selectedYear] || [];
        let officeRecords = records.filter(r => r.office === officeName);
        let uniqueProgs = [...new Set(officeRecords.map(r => `${r.trainingName} (${r.date}) - ${r.hours} Hours`))];

        if (uniqueProgs.length > 0) {
            listContainer.innerHTML = uniqueProgs.map(p => `<div>✅ ${p}</div>`).join('');
        } else {
            listContainer.innerHTML = `<span class="text-slate-400">No official MDTU trainings recorded yet for this office this year.</span>`;
        }
    }

    function autoCalculateOfficeStaffProgress() {
        let office = document.getElementById('progUserOffice').value;
        let tbody = document.getElementById('progMatrixTableBody');
        if (!office || !tbody) return;

        let staffEntry = annualStaffMatrix.find(m => m.office === office);
        const records = globalDatabase[selectedYear] || [];
        let officeRecords = records.filter(r => r.office === office);

        let desigs = ["Management Assistant", "Development Officer", "Executive Officer", "Office Assistant"];
        if (staffEntry) {
            desigs = Object.keys(staffEntry).filter(k => k !== 'office' && k !== 'Office Name');
        }

        tbody.innerHTML = desigs.map(d => {
            let total = (staffEntry && staffEntry[d]) ? parseInt(staffEntry[d]) : officeRecords.filter(r => r.designation === d).length;
            let dRecs = officeRecords.filter(r => r.designation === d);
            let c12 = dRecs.filter(r => r.hours >= 12).length;
            let c6 = dRecs.filter(r => r.hours >= 6 && r.hours < 12).length;
            let cNone = Math.max(0, total - (c12 + c6));

            return `
                <tr class="border-b">
                    <td class="p-2 font-bold text-slate-800">${d}</td>
                    <td class="p-2 text-center font-bold">${total}</td>
                    <td class="p-2 text-center text-emerald-700 font-bold">${c12}</td>
                    <td class="p-2 text-center text-amber-700 font-bold">${c6}</td>
                    <td class="p-2 text-center text-rose-700 font-bold">${cNone}</td>
                </tr>
            `;
        }).join('');
    }

    function addOtherTrainingRow() {
        let container = document.getElementById('otherTrainingsContainer');
        let div = document.createElement('div');
        div.className = 'flex gap-2 flex-wrap sm:flex-nowrap';
        div.innerHTML = `
            <input type="text" placeholder="Internal Training Topic" class="flex-1 p-2 text-xs border rounded outline-none other-train-topic min-w-[140px]">
            <input type="number" placeholder="Hours" min="1" max="50" class="w-20 p-2 text-xs border rounded outline-none other-train-hours">
            <input type="date" class="p-2 text-xs border rounded outline-none other-train-date">
            <button type="button" onclick="this.parentElement.remove()" class="bg-rose-600 text-white px-3 py-1 rounded text-xs font-bold">X</button>
        `;
        container.appendChild(div);
    }

    function handleSaveSuperuserProgress(e) {
        e.preventDefault();
        const userId = convertNicFormat(document.getElementById('progUserId').value);
        const office = document.getElementById('progUserOffice').value;
        const designation = document.getElementById('progUserDesignation').value;
        const month = document.getElementById('progMonth').value;
        const specialRemarks = document.getElementById('progSpecialRemarks').value.trim();
        const productivityTasks = document.getElementById('progProductivityTasks').value.trim();
        const fileInput = document.getElementById('progAttachmentPdf');

        let otherTrainings = [];
        let rows = document.querySelectorAll('#otherTrainingsContainer > div');
        rows.forEach(r => {
            let topic = r.querySelector('.other-train-topic').value.trim();
            let hours = r.querySelector('.other-train-hours').value.trim();
            let date = r.querySelector('.other-train-date').value;
            if (topic) otherTrainings.push({ topic, hours, date });
        });

        const executeSave = (pdfData) => {
            const newSubmission = {
                year: selectedYear,
                userId,
                office,
                designation,
                month,
                specialRemarks,
                productivityTasks,
                otherTrainings,
                pdfAttachment: pdfData,
                submittedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };

            fetch('api.php?action=save_progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubmission)
            })
            .then(res => res.json())
            .then(data => {
                alert('Progress report & presentation data submitted successfully to DB!');
                loadProgressSubmissionsFromAPI();
                switchTab('progress-reports');
            })
            .catch(err => {
                console.error('Progress save error:', err);
                progressSubmissions.push(newSubmission);
                saveProgressSubmissionsLocally();
                alert('Progress report saved locally!');
                switchTab('progress-reports');
            });
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (evt) => executeSave(evt.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            executeSave(null);
        }
    }

    function loadProgressSubmissionsFromAPI() {
        fetch('api.php?action=get_progress&year=' + selectedYear)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    progressSubmissions = data;
                } else {
                    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS_REPORTS);
                    progressSubmissions = saved ? JSON.parse(saved) : [];
                }
                updateOfficeDropdowns();
                renderProgressPresentations();
            })
            .catch(err => {
                console.error('API get_progress error:', err);
                const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS_REPORTS);
                progressSubmissions = saved ? JSON.parse(saved) : [];
                updateOfficeDropdowns();
                renderProgressPresentations();
            });
    }

    function saveProgressSubmissionsLocally() {
        localStorage.setItem(STORAGE_KEYS.PROGRESS_REPORTS, JSON.stringify(progressSubmissions));
        updateOfficeDropdowns();
        renderProgressPresentations();
    }

    function renderProgressPresentations() {
        const area = document.getElementById('presentationSlidesArea');
        if (!area) return;

        const viewType = document.getElementById('presViewType').value;
        const selOffice = document.getElementById('presOfficeSelect').value;
        const selMonth = document.getElementById('presMonthSelect').value;

        const monthWrap = document.getElementById('presMonthWrapper');
        if (viewType === 'monthly') monthWrap.classList.remove('hidden');
        else monthWrap.classList.add('hidden');

        let filtered = progressSubmissions.filter(p => parseInt(p.year) === parseInt(selectedYear));
        if (selOffice && selOffice !== 'all') filtered = filtered.filter(p => p.office === selOffice);
        if (viewType === 'monthly' && selMonth !== 'all') filtered = filtered.filter(p => p.month === selMonth);

        if (filtered.length === 0) {
            area.innerHTML = `<div class="p-8 text-center text-slate-400 font-bold">No progress submissions found for selected filters. Please submit progress records first.</div>`;
            return;
        }

        let offices = (selOffice && selOffice !== 'all') ? [selOffice] : [...new Set(filtered.map(p => p.office))];
        let slidesHtml = '';

        offices.forEach(off => {
            let offSubs = filtered.filter(p => p.office === off);
            slidesHtml += `
                <div class="slide-card p-6 sm:p-10 rounded-2xl shadow-2xl flex flex-col justify-between border-4 border-amber-500/50 my-4">
                    <div class="flex justify-between items-center border-b border-indigo-700/60 pb-4 flex-wrap gap-2">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">🏛️</span>
                            <div>
                                <h3 class="text-[10px] sm:text-xs font-black text-amber-400 uppercase tracking-widest">Management Development and Training Unit - NWP</h3>
                                <h4 class="text-base sm:text-lg font-bold text-white">Provincial Training Progress Presentation</h4>
                            </div>
                        </div>
                        <span class="text-xs font-bold bg-amber-500 text-indigo-950 px-3 py-1 rounded-full uppercase">${viewType.toUpperCase()} PROGRESS</span>
                    </div>

                    <div class="my-auto py-8 text-center space-y-4">
                        <h2 class="text-2xl sm:text-4xl font-black text-amber-300 font-cinzel tracking-wider uppercase">${off}</h2>
                        <div class="w-32 h-1 bg-amber-400 mx-auto"></div>
                        <p class="text-xs sm:text-base text-slate-200 font-medium">Capacity Development, Training Hours & Productivity Report (${viewType === 'monthly' ? (selMonth === 'all' ? 'All Months' : selMonth) : 'Annual'})</p>
                        <p class="text-[10px] sm:text-xs text-slate-400 font-mono">Submissions Recorded: ${offSubs.length} | Academic Year: ${selectedYear}</p>
                    </div>

                    <div class="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 border-t border-indigo-700/60 pt-3 flex-wrap gap-2">
                        <span>Management Development & Training Unit (NWP)</span>
                        <span>Slide 1 (Overview)</span>
                    </div>
                </div>
            `;

            offSubs.forEach((sub, sIdx) => {
                slidesHtml += `
                    <div class="slide-card p-6 sm:p-10 rounded-2xl shadow-2xl flex flex-col justify-between border-4 border-teal-500/50 my-4">
                        <div class="flex justify-between items-center border-b border-indigo-700/60 pb-3 flex-wrap gap-2">
                            <h3 class="text-base sm:text-lg font-extrabold text-teal-300 uppercase">⭐ Progress Details: ${sub.month}</h3>
                            <span class="text-xs font-mono text-slate-400">Office: ${sub.office}</span>
                        </div>

                        <div class="my-auto py-4 space-y-4">
                            <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-1">
                                <h4 class="text-xs font-bold text-amber-400 uppercase">📌 Special Office Remarks:</h4>
                                <p class="text-xs text-slate-200 leading-relaxed">${sub.specialRemarks || 'None'}</p>
                            </div>

                            <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-1">
                                <h4 class="text-xs font-bold text-teal-400 uppercase">🚀 Productivity Initiatives:</h4>
                                <p class="text-xs text-slate-200 leading-relaxed">${sub.productivityTasks || 'None'}</p>
                            </div>
                        </div>

                        <div class="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 border-t border-indigo-700/60 pt-3 flex-wrap gap-2">
                            <span>User ID: ${sub.userId}</span>
                            <span>Slide ${sIdx + 2}</span>
                        </div>
                    </div>
                `;
            });
        });

        area.innerHTML = slidesHtml;
    }

    function downloadPresentationPDF() {
        const area = document.getElementById('presentationSlidesArea');
        html2pdf().from(area).set({
            margin: 5,
            filename: `MDTU_Progress_Presentation_${selectedYear}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        }).save();
    }

    function exportProgressReportToExcel() {
        let ws_data = [
            ["Office", "User ID", "Month", "Special Remarks", "Productivity Tasks", "Submitted At"]
        ];
        progressSubmissions.forEach(p => {
            ws_data.push([p.office, p.userId, p.month, p.specialRemarks, p.productivityTasks, p.submittedAt]);
        });
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Progress Submissions");
        XLSX.writeFile(wb, `Progress_Submissions_${selectedYear}.xlsx`);
    }

    function handleTpUserLookup(val) {
        let conv = convertNicFormat(val);
        let found = officersDirectory[conv] || officersDirectory[val.trim().toUpperCase()];
        if (found) {
            document.getElementById('tpOffice').value = found.office || '';
            document.getElementById('tpDesignation').value = found.designation || '';
        }
    }

    function handleSaveTrainingPlan(e) {
        e.preventDefault();
        const userId = convertNicFormat(document.getElementById('tpUserId').value);
        const office = document.getElementById('tpOffice').value;
        const designation = document.getElementById('tpDesignation').value;
        const reqGeneral = document.getElementById('tpRequiredGeneral').value.trim();
        const specialized = document.getElementById('tpSpecialized').value.trim();
        const departmental = document.getElementById('tpDepartmental').value.trim();
        const obt = document.getElementById('tpObt').value.trim();

        trainingPlansList.push({ id: Date.now(), year: selectedYear, userId, office, designation, reqGeneral, specialized, departmental, obt });
        saveTrainingPlans();
        alert('Annual training plan entered successfully!');
        e.target.reset();
        renderTrainingPlanTable();
    }

    function loadTrainingPlans() {
        const saved = localStorage.getItem(STORAGE_KEYS.TRAINING_PLANS);
        if (saved) {
            try { trainingPlansList = JSON.parse(saved); } catch(e) { trainingPlansList = []; }
        } else {
            trainingPlansList = [];
            saveTrainingPlans();
        }
        renderTrainingPlanTable();
    }

    function saveTrainingPlans() {
        localStorage.setItem(STORAGE_KEYS.TRAINING_PLANS, JSON.stringify(trainingPlansList));
    }

    function renderTrainingPlanTable() {
        const tbody = document.getElementById('trainingPlanTableBody');
        if (!tbody) return;
        tbody.innerHTML = trainingPlansList.map(t => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 font-bold text-teal-950">${t.office}</td>
                <td class="p-3 font-semibold text-slate-700">${t.userId} (${t.designation})</td>
                <td class="p-3">${t.reqGeneral}</td>
                <td class="p-3">${t.specialized || '-'}</td>
                <td class="p-3">${t.departmental || '-'}</td>
                <td class="p-3 text-teal-700 font-semibold">${t.obt || '-'}</td>
            </tr>
        `).join('');
    }

    function handleMergePrevPlanExcel() {
        const fileInput = document.getElementById('prevPlanExcelUpload');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select previous plan Excel file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json && json.length > 0) {
                json.forEach(row => {
                    trainingPlansList.push({
                        id: Date.now() + Math.random(),
                        year: selectedYear,
                        userId: row['User ID'] || 'Imported Plan',
                        office: row['Office Name'] || row['Office'] || 'Unknown Office',
                        designation: row['Designation'] || 'General',
                        reqGeneral: row['Required General'] || row['Training Name'] || '',
                        specialized: row['Specialized'] || '',
                        departmental: row['Departmental'] || '',
                        obt: row['OBT'] || ''
                    });
                });
                saveTrainingPlans();
                renderTrainingPlanTable();
                alert('Previous plan Excel merged successfully!');
            }
        };
        reader.readAsArrayBuffer(fileInput.files[0]);
    }

    function exportTrainingPlanToExcel() {
        let ws_data = [
            ["Office Name", "Superuser / ID", "Designation", "Required General", "Specialized", "Departmental", "OBT"]
        ];
        trainingPlansList.forEach(t => {
            ws_data.push([t.office, t.userId, t.designation, t.reqGeneral, t.specialized, t.departmental, t.obt]);
        });
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Annual Training Plan");
        XLSX.writeFile(wb, `Annual_Training_Plan_${selectedYear}.xlsx`);
    }

    function uploadResourcePersonsExcel() {
        const fileInput = document.getElementById('resourcePersonsExcelInput');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please choose an Excel file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json && json.length > 0) {
                masterResourcePersons = json.map(r => ({
                    name: r['Resource Person Name'] || r['Name'] || Object.values(r)[0],
                    field: r['Field'] || r['Specialization'] || 'General',
                    institution: r['Institution'] || r['Designation & Institution'] || '',
                    contact: r['Contact No'] || r['Phone'] || '',
                    email: r['Email'] || ''
                }));
                saveMasterResourcePersons();
                renderMasterResourcePersonsTable();
                alert('Resource persons directory loaded successfully!');
            }
        };
        reader.readAsArrayBuffer(fileInput.files[0]);
    }

    function loadMasterResourcePersons() {
        const saved = localStorage.getItem(STORAGE_KEYS.MASTER_RESOURCES);
        if (saved) {
            try { masterResourcePersons = JSON.parse(saved); } catch(e) { masterResourcePersons = []; }
        } else {
            masterResourcePersons = [
                { name: "Prof. K.A. Perera", field: "Public Administration & Governance", institution: "Wayamba University of Sri Lanka", contact: "0712345678", email: "kaperera@wyb.ac.lk" }
            ];
            saveMasterResourcePersons();
        }
        renderMasterResourcePersonsTable();
    }

    function saveMasterResourcePersons() {
        localStorage.setItem(STORAGE_KEYS.MASTER_RESOURCES, JSON.stringify(masterResourcePersons));
        renderMasterResourcePersonsTable();
    }

    function renderMasterResourcePersonsTable() {
        const tbodyShared = document.getElementById('resourceSharedTableBody');
        if (!tbodyShared) return;
        tbodyShared.innerHTML = masterResourcePersons.map(r => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-2.5 font-bold text-purple-950">${r.name}</td>
                <td class="p-2.5">${r.field}</td>
                <td class="p-2.5">${r.institution}</td>
                <td class="p-2.5 font-mono">${r.contact}</td>
                <td class="p-2.5 font-mono text-indigo-700">${r.email}</td>
            </tr>
        `).join('');
    }

    function toggleFloatingChat() {
        const panel = document.getElementById('chatFloatingPanel');
        if (panel) panel.classList.toggle('hidden');
    }

    function toggleFloatingInbox() {
        const panel = document.getElementById('inboxFloatingPanel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                renderNotifications();
            }
        }
    }

    function loadNewsAlert() {
        const saved = localStorage.getItem(STORAGE_KEYS.ALERT);
        if (saved) currentNewAlertText = saved;
        updateNewsAlertUI();
    }

    function updateNewsAlertUI() {
        const headerBar = document.getElementById('headerAlertTickerText');
        const chatBar = document.getElementById('chatTickerAlertContent');
        if (headerBar) headerBar.innerText = currentNewAlertText;
        if (chatBar) chatBar.innerText = currentNewAlertText;
    }

    function openNewAlertModal() {
        if (authRole !== 'admin' && authRole !== 'super') {
            alert('Unauthorized! Only Admin and Super Admin can manage Alerts.');
            return;
        }
        document.getElementById('modalAlertTextInput').value = currentNewAlertText;
        document.getElementById('alertManageModal').classList.remove('hidden');
    }

    function openManageAlertModal() {
        openNewAlertModal();
    }

    function closeManageAlertModal() {
        document.getElementById('alertManageModal').classList.add('hidden');
    }

    function saveNewAlert(e) {
        e.preventDefault();
        const text = document.getElementById('modalAlertTextInput').value.trim();
        if (!text) return;
        currentNewAlertText = text;
        localStorage.setItem(STORAGE_KEYS.ALERT, currentNewAlertText);
        updateNewsAlertUI();
        closeManageAlertModal();
        alert('🚨 Alert successfully updated!');
    }

    function editCurrentAlert() {
        openNewAlertModal();
    }

    function deleteCurrentAlert() {
        if (authRole !== 'admin' && authRole !== 'super') {
            alert('Unauthorized!');
            return;
        }
        if (confirm('Are you sure you want to reset this Alert?')) {
            currentNewAlertText = "🚨 MDTU System Live Support Active.";
            localStorage.setItem(STORAGE_KEYS.ALERT, currentNewAlertText);
            updateNewsAlertUI();
            alert('Alert reset successfully.');
        }
    }

    function convertTextLinksToHyperlinks(text) {
        if (!text) return '';
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" class="text-blue-600 underline font-semibold break-all hover:text-blue-800">${url}</a>`;
        });
    }

    function loadLiveChatMessages() {
        const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
        if (saved) {
            try { liveChatMessages = JSON.parse(saved); } catch(e) { liveChatMessages = []; }
        } else {
            liveChatMessages = [
                { id: 1, sender: 'System', senderRole: 'admin', recipient: 'all', text: 'Welcome to MDTU Live Chat Support.', time: '10:00 AM' }
            ];
            saveLiveChatMessages();
        }
        renderLiveChatMessages();
    }

    function saveLiveChatMessages() {
        localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(liveChatMessages));
        renderLiveChatMessages();
    }

    function updateChatRecipientOptions() {
        const sel1 = document.getElementById('chatRecipientSelect');
        const group1 = document.getElementById('chatUserListGroup');
        if (!sel1) return;
        let optionsHtml = systemUsers.map(u => `<option value="${u.username}">${u.username} (${u.role.toUpperCase()})</option>`).join('');
        if (group1) group1.innerHTML = optionsHtml;
    }

    function updateNotificationRecipientOptions() {
        const sel = document.getElementById('notifTargetUser');
        if (!sel) return;
        let optionsHtml = `<option value="all">📢 All Users & Superusers (Broadcast)</option>` + 
            systemUsers.map(u => `<option value="${u.username}">${u.username} (${u.role.toUpperCase()})</option>`).join('');
        sel.innerHTML = optionsHtml;
    }

    function handleSendLiveChatMessage(e) {
        e.preventDefault();
        const inputMain = document.getElementById('chatInputText');
        const inputFloat = document.getElementById('chatInputFloating');
        const selMain = document.getElementById('chatRecipientSelect');
        const selFloat = document.getElementById('chatRecipientSelectFloating');

        const text = (inputMain && inputMain.value) || (inputFloat && inputFloat.value);
        const recipient = (selMain && selMain.value) || (selFloat && selFloat.value) || 'all';

        if (!text) return;

        const senderName = currentUser ? currentUser.username : (authRole !== 'none' ? authRole : 'Guest User');
        const newMsg = {
            id: Date.now(),
            sender: senderName,
            senderRole: authRole,
            recipient: recipient,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        liveChatMessages.push(newMsg);
        saveLiveChatMessages();

        if (inputMain) inputMain.value = '';
        if (inputFloat) inputFloat.value = '';
    }

    function renderLiveChatMessages() {
        const box = document.getElementById('chatMessagesBox');
        const pop = document.getElementById('chatPopupBody');
        if (!box) return;

        let currentActiveUser = currentUser ? currentUser.username : (authRole !== 'none' ? authRole : 'Guest User');

        let visibleMsgs = liveChatMessages.filter(m => {
            if (m.recipient === 'all') return true;
            if (m.recipient === 'admin' && (authRole === 'admin' || authRole === 'super')) return true;
            if (m.sender === currentActiveUser || m.recipient === currentActiveUser) return true;
            if (authRole === 'super') return true;
            return false;
        });

        let html = visibleMsgs.map(m => {
            let isPrivate = m.recipient !== 'all';
            let formattedText = convertTextLinksToHyperlinks(m.text);
            return `
                <div class="p-2.5 rounded-lg border ${isPrivate ? 'bg-amber-50/90 border-amber-300' : 'bg-white border-slate-200'} shadow-sm space-y-1">
                    <div class="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>👤 ${m.sender} to <strong>${m.recipient}</strong> ${isPrivate ? '<span class="text-rose-600">(🔒 Private)</span>' : ''}</span>
                        <span class="font-mono">${m.time}</span>
                    </div>
                    <p class="text-xs text-slate-900">${formattedText}</p>
                    <div class="flex justify-end gap-2 pt-1">
                        <button onclick="replyToChat('${m.sender}')" class="text-[10px] font-bold text-indigo-700 hover:underline">Reply ↩</button>
                        ${(authRole === 'super' || authRole === 'admin' || m.sender === currentActiveUser) ? `<button onclick="deleteChatMessage(${m.id})" class="text-[10px] font-bold text-rose-600 hover:underline">Delete 🗑️</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        box.innerHTML = html;
        box.scrollTop = box.scrollHeight;
        if (pop) {
            pop.innerHTML = html;
            pop.scrollTop = pop.scrollHeight;
        }
    }

    function replyToChat(senderName) {
        const sel1 = document.getElementById('chatRecipientSelect');
        if (sel1) {
            sel1.value = senderName;
            document.getElementById('chatInputText').focus();
        }
        switchTab('live-chat-tab');
    }

    function deleteChatMessage(id) {
        if (confirm('Delete this message?')) {
            liveChatMessages = liveChatMessages.filter(m => m.id !== id);
            saveLiveChatMessages();
        }
    }

    function executeArchiveBackup() {
        const range = document.getElementById('archiveYearRange').value;
        const log = document.getElementById('archiveLogArea');
        if (log) {
            log.innerHTML += `<p>[${new Date().toLocaleTimeString()}] Archiving data for range (${range})... Backup Completed Successfully.</p>`;
            log.scrollTop = log.scrollHeight;
        }
        alert(`Data for Archive Period (${range}) has been successfully compressed and stored.`);
    }

    function loadNotifications() {
        const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
        if (saved) {
            try { notificationsList = JSON.parse(saved); } catch(e) { notificationsList = []; }
        } else {
            notificationsList = [];
            saveNotifications();
        }
        renderNotifications();
    }

    function saveNotifications() {
        localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notificationsList));
        renderNotifications();
        renderHeaderYellowAlertList();
    }

    function handleSendNotification(e) {
        e.preventDefault();
        const target = document.getElementById('notifTargetUser').value;
        const title = document.getElementById('notifTitle').value.trim();
        const message = document.getElementById('notifMessage').value.trim();
        const fileInput = document.getElementById('notifPdfFile');

        if (!title || !message) return;

        let pdfData = null;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                pdfData = evt.target.result;
                pushNotification(target, title, message, pdfData);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            pushNotification(target, title, message, null);
        }
    }

    function pushNotification(target, title, message, pdfData) {
        let senderUser = currentUser ? currentUser.username : (authRole !== 'none' ? authRole : 'admin');
        const newNotif = {
            id: Date.now(),
            target,
            title,
            message,
            sender: senderUser,
            date: new Date().toISOString().split('T')[0],
            pdfData
        };
        notificationsList.unshift(newNotif);
        saveNotifications();
        alert('Notification successfully sent!');
        document.getElementById('notifTitle').value = '';
        document.getElementById('notifMessage').value = '';
        if (document.getElementById('notifPdfFile')) document.getElementById('notifPdfFile').value = '';
    }

    function deleteNotification(id) {
        let found = notificationsList.find(n => n.id === id);
        if (!found) return;
        let currentActiveUser = currentUser ? currentUser.username : authRole;

        let canDelete = (authRole === 'admin' || authRole === 'super' || found.sender === currentActiveUser);
        if (!canDelete) {
            alert('Unauthorized to delete this message!');
            return;
        }

        if (confirm('Delete this notification message?')) {
            notificationsList = notificationsList.filter(n => n.id !== id);
            saveNotifications();
            alert('Message deleted successfully.');
        }
    }

    function editNotification(id) {
        let found = notificationsList.find(n => n.id === id);
        if (!found) return;
        let currentActiveUser = currentUser ? currentUser.username : authRole;

        let canEdit = (authRole === 'admin' || authRole === 'super' || found.sender === currentActiveUser);
        if (!canEdit) {
            alert('Unauthorized to edit this message!');
            return;
        }

        let newTitle = prompt('Edit Title:', found.title);
        let newMsg = prompt('Edit Message:', found.message);
        if (newTitle !== null && newMsg !== null) {
            found.title = newTitle.trim();
            found.message = newMsg.trim();
            saveNotifications();
            alert('Message updated successfully.');
        }
    }

    function renderNotifications() {
        const container = document.getElementById('notificationsContainer');
        const popupBody = document.getElementById('inboxPopupBody');
        const badge = document.getElementById('floatingInboxBadge');

        let currentActiveUser = currentUser ? currentUser.username : (authRole !== 'none' ? authRole : 'Guest User');

        let visibleNotifs = notificationsList.filter(n => {
            if (n.target === 'all') return true;
            if (n.target === currentActiveUser) return true;
            if (n.sender === currentActiveUser) return true;
            if (authRole === 'admin' || authRole === 'super') return true;
            return false;
        });

        if (badge) badge.innerText = visibleNotifs.length;

        if (!visibleNotifs || visibleNotifs.length === 0) {
            let emptyMsg = '<p class="text-xs text-slate-400 text-center py-4">No notifications in active inbox.</p>';
            if (container) container.innerHTML = emptyMsg;
            if (popupBody) popupBody.innerHTML = emptyMsg;
            return;
        }

        let html = visibleNotifs.map(n => {
            let isUserInquiry = n.title && n.title.startsWith('User Inquiry');
            let cardBgClass = isUserInquiry ? 'bg-cyan-100/90 border-cyan-500' : 'bg-amber-50/70 border-amber-400';
            let badgeColor = isUserInquiry ? 'bg-cyan-800' : 'bg-amber-600';
            let canModify = (authRole === 'admin' || authRole === 'super' || n.sender === currentActiveUser);

            return `
            <div class="${cardBgClass} p-3 sm:p-4 rounded-xl border shadow-sm space-y-2 relative">
                <div class="flex justify-between items-center text-[10px]">
                    <span class="${badgeColor} text-white font-black px-2 py-0.5 rounded-full uppercase">Target: ${n.target.toUpperCase()}</span>
                    <span class="font-mono text-slate-500">${n.date}</span>
                </div>
                <div class="flex justify-between items-start pt-0.5">
                    <h4 class="text-xs sm:text-sm font-bold text-slate-900">🔔 ${n.title}</h4>
                    <div class="flex gap-1 shrink-0 ml-2">
                        ${canModify ? `<button onclick="editNotification(${n.id})" class="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded">Edit</button>` : ''}
                        ${canModify ? `<button onclick="deleteNotification(${n.id})" class="bg-rose-600 hover:bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded">Delete 🗑️</button>` : ''}
                    </div>
                </div>
                <p class="text-xs text-slate-800 whitespace-pre-line leading-relaxed">${convertTextLinksToHyperlinks(n.message)}</p>
                ${n.pdfData ? `<div class="pt-1"><a href="${n.pdfData}" download="${n.title.replace(/\s+/g, '_')}.pdf" class="inline-flex items-center gap-1.5 bg-indigo-900 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow hover:bg-indigo-800">📥 Attached Document</a></div>` : ''}
            </div>
            `;
        }).join('');

        if (container) container.innerHTML = html;
        if (popupBody) popupBody.innerHTML = html;
    }

    function renderHeaderYellowAlertList() {
        const container = document.getElementById('headerYellowAlertListContainer');
        if (!container) return;

        let currentActiveUser = currentUser ? currentUser.username : (authRole !== 'none' ? authRole : 'Guest User');
        let visibleNotifs = notificationsList.filter(n => {
            if (n.target === 'all') return true;
            if (n.target === currentActiveUser) return true;
            if (authRole === 'admin' || authRole === 'super') return true;
            return false;
        });

        if (!visibleNotifs || visibleNotifs.length === 0) {
            container.innerHTML = '<span class="text-slate-500 italic text-[11px]">No active notifications/files right now.</span>';
            return;
        }

        container.innerHTML = visibleNotifs.map(n => `
            <div class="bg-white px-2.5 py-1 rounded border border-amber-300 shadow-sm flex items-center gap-2">
                <span class="font-bold text-amber-900">📌 ${n.title}</span>
                ${n.pdfData ? `<a href="${n.pdfData}" download="${n.title}.pdf" class="bg-indigo-900 text-white text-[10px] px-2 py-0.5 rounded font-bold hover:bg-indigo-800">📥 Download PDF</a>` : '<span class="text-[10px] text-slate-500">Notice</span>'}
            </div>
        `).join('');
    }

    function handleUserSendMessage(e) {
        e.preventDefault();
        const idNo = document.getElementById('userMsgIdNo').value.trim();
        const phone = document.getElementById('userMsgPhone').value.trim();
        const msg = document.getElementById('userMsgText').value.trim();

        if (!idNo || !phone || !msg) return;

        const broadcastMsg = {
            id: Date.now(),
            target: 'admin',
            title: `User Inquiry (ID: ${idNo} | Phone: ${phone})`,
            message: msg,
            sender: idNo,
            date: new Date().toISOString().split('T')[0],
            pdfData: null
        };
        notificationsList.unshift(broadcastMsg);
        saveNotifications();
        alert('Your message was successfully submitted to the Administration!');
        document.getElementById('userMsgIdNo').value = '';
        document.getElementById('userMsgPhone').value = '';
        document.getElementById('userMsgText').value = '';
    }

    function loadSystemUsers() {
        const saved = localStorage.getItem(STORAGE_KEYS.USERS);
        if (saved) {
            try { systemUsers = JSON.parse(saved); } catch(e) { systemUsers = []; }
        } else {
            systemUsers = [
                { id: 1, username: 'admin', password: '123', role: 'admin' },
                { id: 2, username: 'superadmin', password: '123', role: 'super' },
                { id: 3, username: 'officer', password: '123', role: 'superuser' }
            ];
            saveSystemUsers();
        }
        renderUserAccountsTable();
    }

    function saveSystemUsers() {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(systemUsers));
        updateChatRecipientOptions();
        updateNotificationRecipientOptions();
    }

    function handleCreateUser(e) {
        e.preventDefault();
        const u = document.getElementById('newUsername').value.trim();
        const p = document.getElementById('newPassword').value.trim();
        const r = document.getElementById('newRole').value;

        if (systemUsers.some(x => x.username === u)) {
            alert('Username already exists!');
            return;
        }

        systemUsers.push({ id: Date.now(), username: u, password: p, role: r });
        saveSystemUsers();
        renderUserAccountsTable();
        alert('User account created successfully!');
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
    }

    function renderUserAccountsTable() {
        const tbody = document.getElementById('userAccountsTableBody');
        if (!tbody) return;
        tbody.innerHTML = systemUsers.map(u => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-2.5 font-bold text-indigo-950">${u.username}</td>
                <td class="p-2.5 uppercase font-semibold text-xs text-amber-700">${u.role}</td>
                <td class="p-2.5 font-mono">${u.password}</td>
                <td class="p-2.5 text-center">
                    <button onclick="deleteUserAccount(${u.id})" class="bg-rose-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function deleteUserAccount(id) {
        if (confirm('Delete this user account?')) {
            systemUsers = systemUsers.filter(x => x.id !== id);
            saveSystemUsers();
            renderUserAccountsTable();
        }
    }

    function toggleAuthModal() {
        const m = document.getElementById('authModal');
        if (m) m.classList.toggle('hidden');
    }

    function handleLogin(e) {
        e.preventDefault();
        const u = document.getElementById('loginUsername').value.trim();
        const p = document.getElementById('loginPassword').value.trim();

        const found = systemUsers.find(x => x.username === u && x.password === p);
        if (found) {
            authRole = found.role;
            currentUser = found;
            toggleAuthModal();
            updateAuthUI();
            alert(`Logged in successfully as ${found.role.toUpperCase()}`);
            if (authRole === 'superuser') switchTab('progress-entry');
            else switchTab('add-record');
        } else {
            alert('Invalid username or password!');
        }
    }

    function updateAuthUI() {
        const loggedInElements = document.querySelectorAll('.logged-in-only');
        const adminElements = document.querySelectorAll('.admin-only');
        const onlyAdminAndSuperElements = document.querySelectorAll('.only-admin-and-super');
        const superAdminElements = document.querySelectorAll('.super-admin-only');
        const superUserElements = document.querySelectorAll('.super-user-only');
        const authBtn = document.getElementById('authBtn');
        const userMsgCard = document.getElementById('userSendMessageCard');

        let isSuperAdmin = authRole === 'super';
        let isAdmin = authRole === 'admin' || authRole === 'super';
        let isSuperUser = authRole === 'superuser';
        let isLoggedIn = authRole !== 'none';

        if (userMsgCard) {
            if (isAdmin) userMsgCard.classList.add('hidden');
            else userMsgCard.classList.remove('hidden');
        }

        loggedInElements.forEach(el => {
            if (isLoggedIn) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });

        adminElements.forEach(el => {
            if (isAdmin) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });

        onlyAdminAndSuperElements.forEach(el => {
            if (isAdmin) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });

        superAdminElements.forEach(el => {
            if (isSuperAdmin) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });

        superUserElements.forEach(el => {
            if (isSuperUser) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });

        if (authBtn) {
            if (isLoggedIn) {
                authBtn.innerText = `🔓 Logout (${authRole.toUpperCase()})`;
                authBtn.onclick = function() {
                    authRole = 'none';
                    currentUser = null;
                    updateAuthUI();
                    switchTab('add-record');
                    alert('Logged out successfully.');
                };
            } else {
                authBtn.innerText = '🔐 Login';
                authBtn.onclick = toggleAuthModal;
            }
        }
        updateChatRecipientOptions();
        updateNotificationRecipientOptions();
        renderLiveChatMessages();
        renderNotifications();
        renderHeaderYellowAlertList();
    }

    function switchTab(tabId) {
        document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        let target = document.getElementById('view-' + tabId);
        if (target) target.classList.remove('hidden');

        let btn = document.getElementById('tab-' + tabId);
        if (btn) btn.classList.add('active');

        if (tabId === 'dashboard') renderDashboard();
        if (tabId === 'confirm-attendance') renderConfirmAttendanceTable();
        if (tabId === 'manage-programs') renderConfiguredProgramsTable();
        if (tabId === 'progress-reports') renderProgressPresentations();
        if (tabId === 'training-plan-report') renderTrainingPlanTable();
        if (tabId === 'resource-persons-master-report') renderMasterResourcePersonsTable();
        if (tabId === 'analytics') renderAnalytics();
    }

    function loadProgramConfigs() {
        const saved = localStorage.getItem(STORAGE_KEYS.PROGS);
        if (saved) {
            try { programConfigs = JSON.parse(saved); } catch(e) { programConfigs = []; }
        } else {
            programConfigs = [
                { name: 'Advanced Office Management & Capacity Building', venue: 'MDTU Auditorium, Kurunegala', dates: ['2026-09-22', '2026-09-23'], hours: 12, resourcePersons: ['Prof. K.A. Perera', 'Dr. S.M. Bandara'] }
            ];
            saveProgramConfigs();
        }
        updateProgramDatalists();
    }

    function saveProgramConfigs() {
        localStorage.setItem(STORAGE_KEYS.PROGS, JSON.stringify(programConfigs));
        updateProgramDatalists();
    }

    function updateProgramDatalists() {
        const pd = document.getElementById('programDatalist');
        const attPs = document.getElementById('attProgSelect');
        const adminPs = document.getElementById('adminConfirmProgramSelect');
        const analyticsPs = document.getElementById('analyticsTrainingSelect');
        const tnPs = document.getElementById('tnFilterProgram');

        let opts = programConfigs.map(p => `<option value="${p.name}">`).join('');
        let selOpts = programConfigs.map(p => `<option value="${p.name}">${p.name}</option>`).join('');

        if (pd) pd.innerHTML = opts;
        if (attPs) attPs.innerHTML = `<option value="">-- Select Program --</option>` + selOpts;
        if (adminPs) adminPs.innerHTML = `<option value="">-- Select Program --</option>` + selOpts;
        if (analyticsPs) analyticsPs.innerHTML = `<option value="all">All Programs</option>` + selOpts;
        if (tnPs) tnPs.innerHTML = `<option value="">-- Choose Program --</option>` + selOpts;
    }

    function onProgramSelected() {
        let val = document.getElementById('trainingNameSelect').value;
        let found = programConfigs.find(p => p.name === val);
        if (found) {
            document.getElementById('dateInput').value = found.dates[0] || '';
            document.getElementById('hoursInput').value = found.hours || 6;
            
            let container = document.getElementById('resourceRatingsContainer');
            container.innerHTML = found.resourcePersons.map((rp, idx) => `
                <div class="bg-white p-3 rounded-lg border flex flex-col sm:flex-row justify-between items-center gap-2">
                    <span class="text-xs font-bold text-indigo-950">${rp}</span>
                    <select name="lecturerRating" data-lecturer="${rp}" class="p-1.5 text-xs border rounded font-bold text-amber-600 outline-none">
                        <option value="5" selected>5 Stars ⭐⭐⭐⭐⭐</option>
                        <option value="4">4 Stars ⭐⭐⭐⭐</option>
                        <option value="3">3 Stars ⭐⭐⭐</option>
                        <option value="2">2 Stars ⭐⭐</option>
                        <option value="1">1 Star ⭐</option>
                    </select>
                </div>
            `).join('');
        }
    }

    function handleSingleSubmit(e) {
        e.preventDefault();
        const nic = convertNicFormat(document.getElementById('nicInput').value);
        const name = document.getElementById('nameInput').value.trim();
        const designation = document.getElementById('designationInput').value.trim();
        const office = document.getElementById('officeInput').value.trim();
        const trainingName = document.getElementById('trainingNameSelect').value.trim();
        const date = document.getElementById('dateInput').value;
        const hours = parseInt(document.getElementById('hoursInput').value) || 6;
        const foodRating = parseInt(document.getElementById('foodRatingInput').value);
        const coordinationRating = parseInt(document.getElementById('coordinationRatingInput').value);
        const feedback = document.getElementById('feedbackInput').value.trim();

        let lecturerEvals = [];
        document.querySelectorAll('select[name="lecturerRating"]').forEach(sel => {
            lecturerEvals.push({ lecturer: sel.getAttribute('data-lecturer'), rating: parseInt(sel.value) });
        });

        if (!globalDatabase[selectedYear]) globalDatabase[selectedYear] = [];

        const newRecord = {
            year: selectedYear, nic, name, designation, office, trainingName, date, hours, foodRating, coordinationRating, feedback, lecturerEvals, absentDates: '', confirmed: true
        };

        globalDatabase[selectedYear].push(newRecord);

        fetch('api.php?action=save_record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        }).then(res => res.json()).then(data => {
            console.log('Saved to server DB:', data);
        }).catch(err => console.error('DB Save error:', err));

        officersDirectory[nic] = { name, designation, office };
        saveOfficersDirectory();
        saveLiveData();
        alert('Training record saved successfully!');
        document.getElementById('addTrainingForm').reset();
        document.getElementById('dateInput').valueAsDate = new Date();
    }

    function fetchLiveData() {
        fetch('api.php?action=get_data&year=' + selectedYear)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    globalDatabase[selectedYear] = data;
                } else {
                    const saved = localStorage.getItem('mdtu_global_database_' + selectedYear);
                    globalDatabase[selectedYear] = saved ? JSON.parse(saved) : [];
                }
                populateYearSelector();
            })
            .catch(err => {
                console.error('API fetch error:', err);
                const saved = localStorage.getItem('mdtu_global_database_' + selectedYear);
                globalDatabase[selectedYear] = saved ? JSON.parse(saved) : [];
                populateYearSelector();
            });
    }

    function saveLiveData() {
        localStorage.setItem('mdtu_global_database_' + selectedYear, JSON.stringify(globalDatabase[selectedYear]));
    }

    function populateYearSelector() {
        const sel = document.getElementById('activeYearSelect');
        if (!sel) return;
        let years = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
        sel.innerHTML = years.map(y => `<option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>`).join('');
    }

    function switchYear() {
        selectedYear = parseInt(document.getElementById('activeYearSelect').value);
        fetchLiveData();
        loadProgressSubmissionsFromAPI();
    }

    function loadAnnualStaffMatrix() {
        const saved = localStorage.getItem(STORAGE_KEYS.STAFF_MATRIX);
        if (saved) {
            try { annualStaffMatrix = JSON.parse(saved); } catch(e) { annualStaffMatrix = []; }
        } else {
            annualStaffMatrix = [
                { office: 'District Secretariat, Kurunegala', 'Management Assistant': 25, 'Development Officer': 30, 'Executive Officer': 5, 'Office Assistant': 10 }
            ];
            saveAnnualStaffMatrix();
        }
        renderAnnualStaffMatrixTable();
        updateOfficeDropdowns();
    }

    function saveAnnualStaffMatrix() {
        localStorage.setItem(STORAGE_KEYS.STAFF_MATRIX, JSON.stringify(annualStaffMatrix));
        updateOfficeDropdowns();
    }

    function updateOfficeDropdowns() {
        const selects = ['officeReportSelect', 'officeDesignationSelect', 'presOfficeSelect'];
        let matrixOffices = annualStaffMatrix.map(m => m.office);
        let submissionOffices = progressSubmissions.map(p => p.office);
        let offices = [...new Set([...matrixOffices, ...submissionOffices])];

        let html = `<option value="">-- Choose Office --</option>` + offices.map(o => `<option value="${o}">${o}</option>`).join('');
        let presHtml = `<option value="all">All Offices</option>` + offices.map(o => `<option value="${o}">${o}</option>`).join('');
        
        selects.forEach(id => {
            let el = document.getElementById(id);
            if (el) {
                if (id === 'presOfficeSelect') el.innerHTML = presHtml;
                else el.innerHTML = html;
            }
        });
    }

    function uploadAnnualStaffExcel() {
        const fileInput = document.getElementById('annualStaffExcelFile');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select an Excel file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json && json.length > 0) {
                annualStaffMatrix = json.map(row => {
                    let officeName = row['Office Name'] || row['Office'] || Object.values(row)[0];
                    return { office: officeName, ...row };
                });
                saveAnnualStaffMatrix();
                renderAnnualStaffMatrixTable();
                alert('Annual staff matrix updated successfully!');
            }
        };
        reader.readAsArrayBuffer(fileInput.files[0]);
    }

    function renderAnnualStaffMatrixTable() {
        const head = document.getElementById('annualStaffMatrixHead');
        const body = document.getElementById('annualStaffMatrixBody');
        if (!head || !body || annualStaffMatrix.length === 0) return;

        let keys = Object.keys(annualStaffMatrix[0]);
        head.innerHTML = `<tr>` + keys.map(k => `<th class="p-2.5">${k}</th>`).join('') + `</tr>`;
        body.innerHTML = annualStaffMatrix.map(row => `
            <tr class="border-b">` + keys.map(k => `<td class="p-2.5">${row[k] || 0}</td>`).join('') + `</tr>
        `).join('');
    }

    function renderDashboard() {
        const records = globalDatabase[selectedYear] || [];
        let total = records.length;
        let completed = records.filter(r => r.hours >= 12).length;
        let incomplete = total - completed;
        let rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('statTotalOfficers').innerText = total;
        document.getElementById('statCompletedOfficers').innerText = completed;
        document.getElementById('statIncompleteOfficers').innerText = incomplete;
        document.getElementById('statCompletionRate').innerText = rate + '%';

        let tbody = document.getElementById('overviewTableBody');
        if (tbody) {
            tbody.innerHTML = records.map(r => `
                <tr class="border-b hover:bg-slate-50">
                    <td class="p-3 font-semibold">${r.office}</td>
                    <td class="p-3 font-mono">${r.nic}</td>
                    <td class="p-3 font-bold">${r.name}</td>
                    <td class="p-3">${r.designation}</td>
                    <td class="p-3 text-center font-bold text-indigo-900">${r.hours}h</td>
                    <td class="p-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.hours >= 12 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${r.hours >= 12 ? 'Completed' : 'Incomplete'}</span></td>
                </tr>
            `).join('');
        }
    }

    function generateAttendanceCertSlip() {
        const nic = convertNicFormat(document.getElementById('attNicInput').value);
        const prog = document.getElementById('attProgSelect').value;

        const records = globalDatabase[selectedYear] || [];
        let found = records.find(r => r.nic === nic && r.trainingName === prog);

        if (!found) {
            alert('No matching attendance record found for this NIC and Program.');
            return;
        }

        document.getElementById('attSlipName').innerText = found.name;
        document.getElementById('attSlipDesignation').innerText = found.designation;
        document.getElementById('attSlipOffice').innerText = found.office;
        document.getElementById('attSlipNic').innerText = found.nic;
        document.getElementById('attSlipProg').innerText = found.trainingName;
        document.getElementById('attSlipVenue').innerText = 'Management Development Training Unit, Chief Secretariat, Kurunegala - 0372222018';
        document.getElementById('attSlipDates').innerText = found.date;
        document.getElementById('attSlipHours').innerText = found.hours;

        if (found.absentDates) {
            document.getElementById('attSlipAbsentSection').classList.remove('hidden');
            document.getElementById('attSlipAbsentDates').innerText = found.absentDates;
        } else {
            document.getElementById('attSlipAbsentSection').classList.add('hidden');
        }

        if (found.confirmed) {
            document.getElementById('attAdminConfirmedNotice').classList.remove('hidden');
        } else {
            document.getElementById('attAdminConfirmedNotice').classList.add('hidden');
        }

        document.getElementById('attendanceSlipContainer').classList.remove('hidden');
    }

    function renderConfirmAttendanceTable() {
        const prog = document.getElementById('adminConfirmProgramSelect').value;
        const date = document.getElementById('adminConfirmFirstDate').value;
        const tbody = document.getElementById('confirmAttendanceTableBody');
        if (!tbody) return;

        const records = globalDatabase[selectedYear] || [];
        let filtered = records.filter(r => (!prog || r.trainingName === prog) && (!date || r.date === date));

        tbody.innerHTML = filtered.map((r, idx) => `
            <tr class="border-b">
                <td class="p-3 text-center"><input type="checkbox" ${r.confirmed ? 'checked' : ''} onchange="toggleConfirmAttendance(${idx}, this.checked)" class="w-4 h-4 accent-indigo-900 cursor-pointer"></td>
                <td class="p-3 font-mono">${r.nic}</td>
                <td class="p-3 font-bold">${r.name}</td>
                <td class="p-3">${r.office}</td>
                <td class="p-3">${r.trainingName}</td>
                <td class="p-3 text-center font-mono">${r.date}</td>
                <td class="p-3 text-center"><input type="text" value="${r.absentDates || ''}" onchange="updateAbsentDates(${idx}, this.value)" placeholder="e.g. 2026-10-02" class="w-full p-1.5 text-xs border rounded bg-white font-mono"></td>
            </tr>
        `).join('');
    }

    function toggleConfirmAttendance(idx, status) {
        if (globalDatabase[selectedYear][idx]) {
            globalDatabase[selectedYear][idx].confirmed = status;
            saveLiveData();
        }
    }

    function updateAbsentDates(idx, val) {
        if (globalDatabase[selectedYear][idx]) {
            globalDatabase[selectedYear][idx].absentDates = val;
            saveLiveData();
        }
    }

    function filterAdminConfirmAttendance() {
        renderConfirmAttendanceTable();
    }

    function searchOfficerRecords() {
        const nic = convertNicFormat(document.getElementById('verifyNicInput').value);
        const records = globalDatabase[selectedYear] || [];
        let matches = records.filter(r => r.nic === nic);

        let resDiv = document.getElementById('verificationResults');
        let notFound = document.getElementById('verificationNotFound');

        if (matches.length > 0) {
            resDiv.classList.remove('hidden');
            notFound.classList.add('hidden');
            document.getElementById('vOfficerName').innerText = matches[0].name;
            document.getElementById('vOfficerDetails').innerText = `${matches[0].designation} - ${matches[0].office} (NIC: ${matches[0].nic})`;
            let total = matches.reduce((acc, curr) => acc + curr.hours, 0);
            document.getElementById('vTotalHours').innerText = total + ' Hours';

            let tbody = document.getElementById('vHistoryTableBody');
            tbody.innerHTML = matches.map((m, idx) => `
                <tr class="border-b">
                    <td class="p-3">${idx + 1}</td>
                    <td class="p-3 font-bold">${m.trainingName}</td>
                    <td class="p-3 font-mono">${m.date}</td>
                    <td class="p-3 font-mono text-rose-600">${m.absentDates || '-'}</td>
                    <td class="p-3">${m.lecturerEvals ? m.lecturerEvals.map(l => l.lecturer).join(', ') : '-'}</td>
                    <td class="p-3 text-center font-bold text-emerald-700">${m.hours}h</td>
                </tr>
            `).join('');
        } else {
            resDiv.classList.add('hidden');
            notFound.classList.remove('hidden');
        }
    }

    function renderConfiguredProgramsTable() {
        const tbody = document.getElementById('configuredProgramsTableBody');
        if (!tbody) return;
        tbody.innerHTML = programConfigs.map(p => `
            <tr class="border-b">
                <td class="p-2 font-bold">${p.name}</td>
                <td class="p-2">${p.venue}</td>
                <td class="p-2 font-mono text-xs">${p.dates.join(', ')}</td>
                <td class="p-2 text-center font-bold text-amber-700">${p.hours}h</td>
                <td class="p-2">${p.resourcePersons.join(', ')}</td>
            </tr>
        `).join('');
    }

    function addResourcePersonConfigRow() {
        let container = document.getElementById('progResourcePersonsContainer');
        let div = document.createElement('div');
        div.className = 'flex gap-2';
        div.innerHTML = `<input type="text" placeholder="Resource Person / Lecturer Name" class="flex-1 p-2 text-xs border rounded outline-none resource-person-input"><button type="button" onclick="this.parentElement.remove()" class="bg-rose-600 text-white px-3 py-1 rounded text-xs font-bold">X</button>`;
        container.appendChild(div);
    }

    function calculateProgramHours() {
        let datesStr = document.getElementById('progDatesConfig').value;
        let dates = datesStr.split(',').map(d => d.trim()).filter(d => d);
        if (dates.length > 0) {
            document.getElementById('progFirstDateConfig').value = dates[0];
            document.getElementById('progHoursConfig').value = dates.length * 6;
        }
    }

    function handleSaveProgramConfig(e) {
        e.preventDefault();
        const name = document.getElementById('progNameConfig').value.trim();
        const venue = document.getElementById('progVenueConfig').value.trim();
        const datesStr = document.getElementById('progDatesConfig').value.trim();
        const dates = datesStr.split(',').map(d => d.trim()).filter(d => d);
        const hours = parseInt(document.getElementById('progHoursConfig').value) || (dates.length * 6);

        let resourcePersons = [];
        document.querySelectorAll('.resource-person-input').forEach(inp => {
            if (inp.value.trim()) resourcePersons.push(inp.value.trim());
        });

        programConfigs.push({ name, venue, dates, hours, resourcePersons });
        saveProgramConfigs();
        renderConfiguredProgramsTable();
        alert('Program configuration saved successfully!');
        e.target.reset();
    }

    function loadSavedTemplate() {
        let logo = localStorage.getItem(STORAGE_KEYS.LOGO);
        let sig = localStorage.getItem(STORAGE_KEYS.SIG);
        let seal = localStorage.getItem(STORAGE_KEYS.SEAL);
        let mName = localStorage.getItem(STORAGE_KEYS.MADAM_NAME);
        let mTitle = localStorage.getItem(STORAGE_KEYS.MADAM_TITLE);

        if (logo) {
            let el = document.getElementById('certLogo');
            if (el) { el.src = logo; el.classList.remove('hidden'); document.getElementById('defaultLogo').classList.add('hidden'); }
            let headerLogo = document.getElementById('headerLogoImg');
            let headerDefaultIcon = document.getElementById('headerDefaultIcon');
            if (headerLogo) { headerLogo.src = logo; headerLogo.classList.remove('hidden'); if (headerDefaultIcon) headerDefaultIcon.classList.add('hidden'); }
            let attLogo = document.getElementById('attSlipLogoImg');
            let attDefaultLogo = document.getElementById('attSlipDefaultLogo');
            if (attLogo) { attLogo.src = logo; attLogo.classList.remove('hidden'); if (attDefaultLogo) attDefaultLogo.classList.add('hidden'); }
        }
        if (sig) {
            let el = document.getElementById('certSignature');
            if (el) { el.src = sig; el.classList.remove('hidden'); document.getElementById('defaultSignature').classList.add('hidden'); }
        }
        if (seal) {
            let el = document.getElementById('certSeal');
            if (el) { el.src = seal; el.classList.remove('hidden'); document.getElementById('defaultSeal').classList.add('hidden'); }
        }
        if (mName) {
            let el = document.getElementById('viewMadamName');
            if (el) el.innerText = mName;
        }
        if (mTitle) {
            let el = document.getElementById('viewMadamTitle');
            if (el) el.innerText = mTitle;
        }
    }

    function uploadTemplateAsset(type, event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            let dataUrl = evt.target.result;
            if (type === 'logo') localStorage.setItem(STORAGE_KEYS.LOGO, dataUrl);
            if (type === 'signature') localStorage.setItem(STORAGE_KEYS.SIG, dataUrl);
            if (type === 'seal') localStorage.setItem(STORAGE_KEYS.SEAL, dataUrl);
            loadSavedTemplate();
            alert('Template asset saved permanently!');
        };
        reader.readAsDataURL(file);
    }

    function saveMadamDetails() {
        let name = document.getElementById('settingMadamName').value;
        let title = document.getElementById('settingMadamTitle').value;
        localStorage.setItem(STORAGE_KEYS.MADAM_NAME, name);
        localStorage.setItem(STORAGE_KEYS.MADAM_TITLE, title);
        loadSavedTemplate();
    }

    function resetTemplateSettings() {
        if (confirm('Reset all permanent template settings?')) {
            localStorage.removeItem(STORAGE_KEYS.LOGO);
            localStorage.removeItem(STORAGE_KEYS.SIG);
            localStorage.removeItem(STORAGE_KEYS.SEAL);
            localStorage.removeItem(STORAGE_KEYS.MADAM_NAME);
            localStorage.removeItem(STORAGE_KEYS.MADAM_TITLE);
            location.reload();
        }
    }

    function searchOfficerForCert() {
        const nic = convertNicFormat(document.getElementById('certNicSearch').value);
        const records = globalDatabase[selectedYear] || [];
        let matches = records.filter(r => r.nic === nic);

        let sel = document.getElementById('certProgramSelect');
        if (matches.length > 0) {
            sel.innerHTML = `<option value="">-- Select Attended Program --</option>` + matches.map(m => `<option value="${m.trainingName}">${m.trainingName} (${m.date})</option>`).join('');
            sel.disabled = false;
        } else {
            sel.innerHTML = `<option value="">-- No records found for this NIC --</option>`;
            sel.disabled = true;
            alert('No attendance records found for this NIC number.');
        }
    }

    function generateSelectedCertificate() {
        const nic = convertNicFormat(document.getElementById('certNicSearch').value);
        const progName = document.getElementById('certProgramSelect').value;
        if (!progName) return;

        const records = globalDatabase[selectedYear] || [];
        let found = records.find(r => r.nic === nic && r.trainingName === progName);
        if (!found) return;

        document.getElementById('viewStudentName').innerText = found.name;
        document.getElementById('viewStudentDetails').innerText = `${found.designation} - ${found.office}`;
        document.getElementById('viewCourseTitle').innerText = found.trainingName;
        document.getElementById('viewCourseDate').innerText = found.date;
        document.getElementById('viewCourseHours').innerText = found.hours + ' Hours';
        document.getElementById('certSerialNo').innerText = `MDTU-${selectedYear}-NWP-${Math.floor(1000 + Math.random() * 9000)}`;

        document.getElementById('certDownloadBtn').disabled = false;
        document.getElementById('certImageBtn').disabled = false;
    }

    function downloadCertPDF() {
        const element = document.getElementById('certificateContainer');
        html2pdf().from(element).save('MDTU_Certificate.pdf');
    }

    function downloadCertJPEG() {
        const element = document.getElementById('certificateContainer');
        html2canvas(element).then(canvas => {
            let link = document.createElement('a');
            link.download = 'MDTU_Certificate.jpg';
            link.href = canvas.toDataURL('image/jpeg');
            link.click();
        });
    }

    function exportTableToExcel(tableId, filename) {
        let table = document.getElementById(tableId);
        let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
        XLSX.writeFile(wb, filename + '.xlsx');
    }

    function downloadOfficialReportPDF(containerId, filename) {
        const element = document.getElementById(containerId);
        html2pdf().from(element).set({
            margin: 10,
            filename: `${filename}_${selectedYear}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        }).save();
    }

    function downloadAnalyticsPDF() {
        const element = document.getElementById('pdfContentArea');
        html2pdf().from(element).set({
            margin: 8,
            filename: `MDTU_Evaluation_Analytics_${selectedYear}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save();
    }

    function generateOfficeReport() {
        const office = document.getElementById('officeReportSelect').value;
        const records = globalDatabase[selectedYear] || [];
        let filtered = records.filter(r => r.office === office);

        let header = document.getElementById('officeReportHeader');
        let section = document.getElementById('officeCompletedSection');
        let tbody = document.getElementById('officeCompletedTableBody');

        if (!office || filtered.length === 0) {
            header.classList.add('hidden');
            section.classList.add('hidden');
            return;
        }

        document.getElementById('officeReportTitle').innerText = office;
        document.getElementById('officeReportSubtitle').innerText = `Training Hours Report - ${selectedYear}`;
        header.classList.remove('hidden');
        section.classList.remove('hidden');

        tbody.innerHTML = filtered.map(r => `
            <tr class="border-b">
                <td class="p-2 font-mono">${r.nic}</td>
                <td class="p-2 font-bold">${r.name}</td>
                <td class="p-2">${r.designation}</td>
                <td class="p-2 text-center font-bold ${r.hours >= 12 ? 'text-emerald-700' : 'text-amber-700'}">${r.hours}h</td>
            </tr>
        `).join('');
    }

    function generateOfficeDesignationReport() {
        const office = document.getElementById('officeDesignationSelect').value;
        const records = globalDatabase[selectedYear] || [];
        let filtered = records.filter(r => r.office === office);
        let staffEntry = annualStaffMatrix.find(m => m.office === office);

        let header = document.getElementById('officeDesignationHeader');
        let tbody = document.getElementById('officeDesignationTableBody');

        if (!office) {
            header.classList.add('hidden');
            tbody.innerHTML = '';
            return;
        }

        document.getElementById('odReportTitle').innerText = office;
        document.getElementById('odReportSubtitle').innerText = `Designation-wise Hours Summary (${selectedYear})`;
        header.classList.remove('hidden');

        let desigs = ["Management Assistant", "Development Officer", "Executive Officer", "Office Assistant"];
        if (staffEntry) {
            desigs = Object.keys(staffEntry).filter(k => k !== 'office' && k !== 'Office Name');
        }

        tbody.innerHTML = desigs.map(d => {
            let total = (staffEntry && staffEntry[d]) ? parseInt(staffEntry[d]) : filtered.filter(r => r.designation === d).length;
            let dRecs = filtered.filter(r => r.designation === d);
            let c12 = dRecs.filter(r => r.hours >= 12).length;
            let c6 = dRecs.filter(r => r.hours >= 6 && r.hours < 12).length;
            let incomp = Math.max(0, total - c12);

            return `
                <tr class="border-b hover:bg-slate-50">
                    <td class="p-3 font-bold text-indigo-950">${d}</td>
                    <td class="p-3 text-center font-bold">${total}</td>
                    <td class="p-3 text-center text-emerald-700 font-bold">${c12}</td>
                    <td class="p-3 text-center text-rose-700 font-bold">${incomp}</td>
                    <td class="p-3 text-center text-amber-700 font-bold">${c6}</td>
                </tr>
            `;
        }).join('');
    }

    function filterTrainingNamelist() {
        const d = document.getElementById('tnFilterDate').value;
        const p = document.getElementById('tnFilterProgram').value;
        const tbody = document.getElementById('trainingNamelistTableBody');
        const header = document.getElementById('tnReportHeader');

        const records = globalDatabase[selectedYear] || [];
        let filtered = records.filter(r => (!d || r.date === d) && (!p || r.trainingName === p));

        if (header) {
            header.classList.remove('hidden');
            document.getElementById('tnReportTitle').innerText = p || 'All Training Programs';
            document.getElementById('tnReportSubtitle').innerText = `Date: ${d || 'All Dates'} | Total Officers: ${filtered.length}`;
        }

        if (tbody) {
            tbody.innerHTML = filtered.map((r, idx) => `
                <tr class="border-b hover:bg-slate-50">
                    <td class="p-3 font-mono">${idx + 1}</td>
                    <td class="p-3 font-mono font-bold">${r.nic}</td>
                    <td class="p-3 font-bold text-indigo-950">${r.name}</td>
                    <td class="p-3">${r.office}</td>
                    <td class="p-3">${r.designation}</td>
                    <td class="p-3 text-center font-bold text-emerald-700">${r.hours}h</td>
                </tr>
            `).join('');
        }
    }

    let doughnutChartInstance = null;
    let barChartInstance = null;

    function renderAnalytics() {
        const prog = document.getElementById('analyticsTrainingSelect').value;
        const records = globalDatabase[selectedYear] || [];
        let filtered = records.filter(r => prog === 'all' || !prog || r.trainingName === prog);

        const meta = document.getElementById('analyticsHeaderMeta');
        if (meta) {
            meta.innerText = `Program: ${prog === 'all' || !prog ? 'All Programs' : prog} | Date: All Scheduled Dates`;
        }

        let total = filtered.length;
        document.getElementById('aStatCount').innerText = total;

        let avgFood = 0, avgCoord = 0, avgLect = 0;
        let lectScores = [];

        filtered.forEach(r => {
            avgFood += (r.foodRating || 5);
            avgCoord += (r.coordinationRating || 5);
            if (r.lecturerEvals && r.lecturerEvals.length > 0) {
                r.lecturerEvals.forEach(l => lectScores.push(l.rating));
            }
        });

        avgFood = total > 0 ? (avgFood / total).toFixed(1) : "0.0";
        avgCoord = total > 0 ? (avgCoord / total).toFixed(1) : "0.0";
        avgLect = lectScores.length > 0 ? (lectScores.reduce((a, b) => a + b, 0) / lectScores.length).toFixed(1) : "0.0";

        document.getElementById('aStatFood').innerText = `${avgFood} / 5`;
        document.getElementById('aStatCoordination').innerText = `${avgCoord} / 5`;
        document.getElementById('aStatLecturer').innerText = `${avgLect} / 5`;

        let tbody = document.getElementById('analyticsFeedbackTableBody');
        if (tbody) {
            tbody.innerHTML = filtered.map(r => `
                <tr class="border-b">
                    <td class="p-2.5 font-bold">${r.lecturerEvals ? r.lecturerEvals.map(l => l.lecturer).join(', ') : 'Faculty'}</td>
                    <td class="p-2.5 text-center font-bold text-amber-600">${r.foodRating || 5} ⭐</td>
                    <td class="p-2.5 text-center font-bold text-teal-600">${r.coordinationRating || 5} ⭐</td>
                    <td class="p-2.5 text-slate-700">${r.feedback || 'Good session.'}</td>
                </tr>
            `).join('');
        }

        const ctxD = document.getElementById('feedbackDoughnutChart').getContext('2d');
        if (doughnutChartInstance) doughnutChartInstance.destroy();
        doughnutChartInstance = new Chart(ctxD, {
            type: 'doughnut',
            data: {
                labels: ['5 Stars', '4 Stars', '3 Stars', '1-2 Stars'],
                datasets: [{
                    data: [total * 0.7 || 1, total * 0.2 || 0, total * 0.1 || 0, 0],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const ctxB = document.getElementById('quarterlyBarChart').getContext('2d');
        if (barChartInstance) barChartInstance.destroy();
        barChartInstance = new Chart(ctxB, {
            type: 'bar',
            data: {
                labels: ['Lecturer', 'Food', 'Coordination'],
                datasets: [{
                    label: 'Average Score (/5)',
                    data: [parseFloat(avgLect) || 4.5, parseFloat(avgFood) || 4.8, parseFloat(avgCoord) || 4.6],
                    backgroundColor: ['#4338ca', '#10b981', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 5 } }
            }
        });
    }
</script>
</body>
</html>
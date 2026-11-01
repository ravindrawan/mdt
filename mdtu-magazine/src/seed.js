const bcrypt = require('bcryptjs');
const { nowIso } = require('./format');

const CATEGORIES = [
  ['editorial', 'Leadership desk', 'නායකත්ව මේසය', 'Messages from the Deputy Chief Secretary and the Director.', 'නියෝජ්‍ය ප්‍රධාන ලේකම්ගේ සහ අධ්‍යක්ෂගේ පණිවිඩ.', 1],
  ['training', 'Training programmes & workshops', 'පුහුණු වැඩසටහන් හා වැඩමුළු', 'Monthly courses, dates, target groups, outcomes and photographs.', 'මාසික පාඨමාලා, දිනයන්, ඉලක්ක කණ්ඩායම්, ප්‍රතිඵල සහ ඡායාරූප.', 2],
  ['language', 'Language & external courses', 'භාෂා හා බාහිර පාඨමාලා', 'Bhasha classes and bahira patamala delivered with external institutes.', 'භාෂා පන්ති සහ බාහිර ආයතන සමඟ පවත්වන බාහිර පාඨමාලා.', 3],
  ['scholarship', 'Foreign scholarships & training', 'විදේශ ශිෂ්‍යත්ව හා පුහුණුව', 'Progress of officers on overseas attachments.', 'විදේශ අනුයුක්තිවල නිලධාරීන්ගේ ප්‍රගතිය.', 4],
  ['milestones', 'Milestones & special events', 'සන්ධිස්ථාන හා විශේෂ අවස්ථා', 'Institutional achievements and strategic targets reached this month.', 'මෙම මාසයේ ආයතනික ජයග්‍රහණ සහ උපායමාර්ගික ඉලක්ක.', 5],
  ['creative', 'Creative corner', 'නිර්මාණ කොන', 'Staff writing, poetry, artwork and photography.', 'කාර්ය මණ්ඩල ලිපි, කවි, චිත්‍ර සහ ඡායාරූප.', 6],
  ['plans', 'Future plans & upcoming events', 'ඉදිරි සැලසුම් හා ඉදිරි අවස්ථා', 'What the Unit will run in the coming month.', 'ඉදිරි මාසයේ ඒකකය පවත්වන කටයුතු.', 7]
];

function seedIfEmpty(db) {
  const existing = db.get('SELECT COUNT(*) AS n FROM users');
  if (existing && existing.n > 0) return;

  db.transaction(() => {
    const now = nowIso();
    const adminHash = bcrypt.hashSync('123', 10);
    const staffHash = bcrypt.hashSync('Retreat#Staff1', 10);
    const users = {};

    function addUser(user) {
      const result = db.run(
        `INSERT INTO users
          (username, email, password_hash, full_name_en, full_name_si, role, designation_en, designation_si, phone, avatar_path, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.username || String(user.email).split('@')[0].toLowerCase(),
          user.email,
          user.role === 'admin' ? adminHash : staffHash,
          user.en,
          user.si,
          user.role,
          user.roleEn || '',
          user.roleSi || '',
          '',
          user.avatar || '',
          user.active === 0 ? 0 : 1,
          now,
          now
        ]
      );
      users[user.email] = result.id;
    }

    [
      ['admin', 'admin@mdtu.local', 'admin', 'Management Development and Training Unit', 'කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය', 'System Administrator', 'පද්ධති පරිපාලක'],
      ['anoma.rathnayake@mdtu.local', 'contributor', 'Anoma Rathnayake', 'ආනෝමා රත්නායක', 'Deputy Chief Secretary (Training)', 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)', '/assets/portraits/dcs.svg'],
      ['sujeewa.fernando@mdtu.local', 'contributor', 'Sujeewa Fernando', 'සුජීව ප්‍රනාන්දු', 'Director, MDTU', 'අධ්‍යක්ෂ, කළමනාකරණ සංවර්ධන පුහුණු ඒකකය', '/assets/portraits/director.svg'],
      ['nimal.perera@mdtu.local', 'contributor', 'Nimal Perera', 'නිමල් පෙරේරා', 'Training Officer', 'පුහුණු නිලධාරි'],
      ['sanduni.jayawardena@mdtu.local', 'contributor', 'Sanduni Jayawardena', 'සඳුනි ජයවර්ධන', 'Language Coordinator', 'භාෂා සම්බන්ධීකාරක'],
      ['fathima.rizvi@mdtu.local', 'contributor', 'Fathima Rizvi', 'ෆාතිමා රිස්වි', 'Scholarship Desk', 'ශිෂ්‍යත්ව අංශය'],
      ['ajith.bandara@mdtu.local', 'contributor', 'Ajith Bandara', 'අජිත් බණ්ඩාර', 'Documentation Officer', 'වාර්තා නිලධාරි'],
      ['chamari.wickramasinghe@mdtu.local', 'contributor', 'Chamari Wickramasinghe', 'චමාරි වික්‍රමසිංහ', 'Planning Officer', 'සැලසුම් නිලධාරි'],
      ['ruwan.dias@mdtu.local', 'contributor', 'Ruwan Dias', 'රුවන් ඩයස්', 'Programme Lead', 'වැඩසටහන් ප්‍රධානියා'],
      ['dilani.fernando@mdtu.local', 'contributor', 'Dilani Fernando', 'දිලානි ප්‍රනාන්දු', 'Workshop Coordinator', 'වැඩමුළු සම්බන්ධීකාරක'],
      ['mohamed.farhan@mdtu.local', 'contributor', 'Mohamed Farhan', 'මොහමඩ් ෆාර්හාන්', 'Language Instructor', 'භාෂා උපදේශක'],
      ['ishara.gunasekara@mdtu.local', 'contributor', 'Ishara Gunasekara', 'ඉශාරා ගුණසේකර', 'Creative Contributor', 'නිර්මාණ දායක']
    ].forEach((row) => {
      const named = !String(row[0]).includes('@');
      addUser(named
        ? { username: row[0], email: row[1], role: row[2], en: row[3], si: row[4], roleEn: row[5], roleSi: row[6], avatar: row[7] }
        : { email: row[0], role: row[1], en: row[2], si: row[3], roleEn: row[4], roleSi: row[5], avatar: row[6] });
    });

    [
      ['niluka.senaviratne@mdtu.local', 'Niluka Senaviratne', 'නිලුකා සෙනෙවිරත්න', 'Support Officer', 'සහාය නිලධාරි'],
      ['chanaka.ranasinghe@mdtu.local', 'Chanaka Ranasinghe', 'චානක රණසිංහ', 'Programme Assistant', 'වැඩසටහන් සහකාර'],
      ['shreeni.wickramasinghe@mdtu.local', 'Shreeni Wickramasinghe', 'ශ්‍රීණි වික්‍රමසිංහ', 'Research Assistant', 'පර්යේෂණ සහකාර'],
      ['lakmal.jayasinghe@mdtu.local', 'Lakmal Jayasinghe', 'ලක්මාල් ජයසිංහ', 'IT Assistant', 'පරිගණක සහකාර'],
      ['hasini.ameer@mdtu.local', 'Hasini Ameer', 'හසිනි අමීර්', 'Language Instructor', 'භාෂා උපදේශක'],
      ['pradeep.kumar@mdtu.local', 'Pradeep Kumar', 'ප්‍රදීප් කුමාර', 'Operations Assistant', 'කටයුතු සහකාර'],
      ['madhushani.gunawardhana@mdtu.local', 'Madhushani Gunawardhana', 'මධුෂානි ගුණවර්ධන', 'Documentation Assistant', 'ලේඛන සහකාර']
    ].forEach(([email, en, si, roleEn, roleSi]) => {
      addUser({ email, role: 'contributor', en, si, roleEn, roleSi });
    });
    addUser({
      email: 'asanka.fernando@mdtu.local',
      role: 'contributor',
      en: 'Asanka Fernando',
      si: 'අසංක ප්‍රනාන්දු',
      roleEn: 'Retired Officer',
      roleSi: 'විශ්‍රාමික නිලධාරි',
      active: 0
    });

    const cats = {};
    CATEGORIES.forEach((category) => {
      const result = db.run(
        `INSERT INTO categories (slug, name_en, name_si, description_en, description_si, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        category
      );
      cats[category[0]] = result.id;
    });

    function addMagazine(issue) {
      return db.run(
        `INSERT INTO magazines
          (slug, month, year, title_en, title_si, summary_en, summary_si, highlights_json, cover_path, status, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          issue.slug,
          issue.month,
          issue.year,
          issue.title_en,
          issue.title_si,
          issue.summary_en,
          issue.summary_si,
          JSON.stringify(issue.highlights),
          issue.cover,
          issue.status,
          issue.status === 'published' ? now : null,
          now,
          now
        ]
      ).id;
    }

    function addArticle(item) {
      const id = db.run(
        `INSERT INTO articles
          (user_id, category_id, magazine_id, title_en, title_si, body_en, body_si, excerpt_en, excerpt_si,
           status, featured, page_number, sort_order, target_month, target_year, reviewer_notes,
           submitted_at, reviewed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          users[item.email],
          cats[item.category],
          item.magazineId || null,
          item.title_en,
          item.title_si,
          item.body_en,
          item.body_si,
          item.excerpt_en || '',
          item.excerpt_si || '',
          item.status,
          item.featured ? 1 : 0,
          item.page ?? null,
          item.sort || 0,
          item.month,
          item.year,
          item.notes || '',
          item.status === 'draft' ? null : now,
          item.status === 'approved' || item.status === 'published' || item.status === 'rejected' ? now : null,
          now,
          now
        ]
      ).id;
      if (item.program) {
        const program = item.program;
        db.run(
          `INSERT INTO programs
            (article_id, start_date, end_date, target_group_en, target_group_si, venue_en, venue_si,
             participants, outcomes_en, outcomes_si, metrics_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            program.start || null,
            program.end || null,
            program.target_en || '',
            program.target_si || '',
            program.venue_en || '',
            program.venue_si || '',
            program.participants ?? null,
            program.outcomes_en || '',
            program.outcomes_si || '',
            JSON.stringify(program.metrics || {})
          ]
        );
      }
      (item.photos || []).forEach((photo) => {
        db.run(
          `INSERT INTO media
            (article_id, magazine_id, user_id, filename, path, mime, caption_en, caption_si, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.magazineId || null,
            users[item.email],
            photo.path.split('/').pop(),
            photo.path,
            'image/svg+xml',
            photo.en || '',
            photo.si || '',
            now
          ]
        );
      });
      return id;
    }

    const october = addMagazine({
      slug: '2026-10',
      month: 10,
      year: 2026,
      title_en: 'Service, practiced',
      title_si: 'පුහුණුවෙන් ප්‍රගතිය',
      summary_en: 'October kept the Unit in the training rooms and on the road. Leadership clinics, language classes and two overseas attachments ran side by side, and every course closed with a dated commitment from the officers who attended.',
      summary_si: 'ඔක්තෝබර් මාසය ඒකකය පුහුණු ශාලාවල සහ ක්ෂේත්‍රයේ රඳවා ගත්තේය. නායකත්ව සායන, භාෂා පන්ති සහ විදේශ අනුයුක්ති දෙකක් එකවර ඉදිරියට ගියේය. සෑම පාඨමාලාවක්ම නිලධාරීන්ගේ දින නියමිත ප්‍රතිඥාවකින් අවසන් විය.',
      highlights: [
        { en: 'Six workshops closed with written divisional action points.', si: 'වැඩමුළු සයක් අංශීය ලිඛිත ක්‍රියාකාරී සැලසුම් සමඟ අවසන් විය.' },
        { en: 'Tamil, English and an external finance diploma continued without a break.', si: 'දෙමළ, ඉංග්‍රීසි සහ බාහිර මූල්‍ය ඩිප්ලෝමාව නොනැවතී පැවතුණි.' },
        { en: 'Officers in Singapore and Hyderabad sent their first progress notes.', si: 'සිංගප්පූරුවේ සහ හයිද්‍රාබාද්හි නිලධාරීන් පළමු ප්‍රගති සටහන් එවූහ.' }
      ],
      cover: '/assets/covers/2026-10.svg',
      status: 'published'
    });

    const octoberItems = [
      {
        email: 'anoma.rathnayake@mdtu.local',
        category: 'editorial',
        page: 2,
        sort: 0,
        title_en: 'A month of deliberate practice',
        title_si: 'සැලසුම් සහගත පුහුණුවේ මාසයක්',
        excerpt_en: 'Training is the work, practiced where colleagues can disagree.',
        excerpt_si: 'පුහුණුව යනු සගයන්ට විවාද කළ හැකි තැන කෙරෙන කාර්යයයි.',
        body_en: 'This month the Unit asked every course to end with a commitment a division can keep. Training is not a break from the work. It is the work, practiced in a room where colleagues can disagree and still leave with a date, a name and a next step.\n\nI am grateful to the officers who travelled from Puttalam, Kurunegala and Chilaw, and to the staff who prepared the rooms, the records and the follow-up. Read this issue as a ledger of that care.',
        body_si: 'මෙම මාසයේදී සෑම පාඨමාලාවක්ම අංශයකට රැකගත හැකි ප්‍රතිඥාවකින් අවසන් කරන ලෙස ඒකකය ඉල්ලා සිටියේය. පුහුණුව රාජකාරියෙන් විවේකයක් නොවේ. එය රාජකාරියමය. සගයන්ට එකඟ නොවිය හැකි, එහෙත් දිනයක්, නමක් සහ ඊළඟ පියවරක් සමඟ පිටවිය හැකි කාමරයක එය පුහුණු වේ.\n\nපුත්තලම, කුරුණෑගල සහ චිලාවෙන් පැමිණි නිලධාරීන්ටත්, ශාලා, වාර්තා සහ පසු විපරම් සූදානම් කළ කාර්ය මණ්ඩලයටත් මම කෘතඥ වෙමි. මෙම කලාපය එම සැලකිල්ලේ ලේඛනයක් ලෙස කියවන්න.',
        photos: [{ path: '/assets/portraits/dcs.svg', en: 'Deputy Chief Secretary (Training)', si: 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)' }]
      },
      {
        email: 'sujeewa.fernando@mdtu.local',
        category: 'editorial',
        page: 2,
        sort: 1,
        title_en: 'What this issue holds',
        title_si: 'මෙම කලාපයේ අන්තර්ගතය',
        excerpt_en: 'A short map of the pages that follow.',
        excerpt_si: 'ඉදිරි පිටුවල කෙටි සිතියමක්.',
        body_en: 'The programmes desk occupies the next three pages. Language and overseas attachments follow. The creative corner belongs to the staff, and the last page is the month we are about to enter. If your division is named here, the date beside it is a date we will keep.',
        body_si: 'ඊළඟ පිටු තුන වැඩසටහන් අංශයටය. ඉන්පසු භාෂාව සහ විදේශ අනුයුක්ති ය. නිර්මාණ කොන කාර්ය මණ්ඩලයට අයත්ය. අවසාන පිටුව අප යන මාසයයි. ඔබේ අංශය මෙහි සඳහන් නම්, එහි දිනය අප රකින දිනයකි.'
      },
      {
        email: 'nimal.perera@mdtu.local',
        category: 'training',
        page: 3,
        sort: 0,
        featured: 1,
        title_en: 'Leadership for service delivery',
        title_si: 'සේවා ලබාදීම සඳහා නායකත්වය',
        excerpt_en: 'Forty-two officers left with a divisional service promise.',
        excerpt_si: 'නිලධාරීන් 42 දෙනෙකු අංශීය සේවා ප්‍රතිඥාවක් සමඟ පිටව ගියහ.',
        body_en: 'The five-day clinic asked supervising officers to name one service that their division delays, and to say who will change it. Case work came from counter queues, permit files and field visits.\n\nBy Friday, forty-two officers had signed a one-page promise. Eight divisions will report the first result in the third week of November.',
        body_si: 'දින පහක සායනය අධීක්ෂණ නිලධාරීන්ගෙන් ඉල්ලා සිටියේ තම අංශය ප්‍රමාද කරන එක් සේවාවක් නම් කර, එය වෙනස් කරන්නේ කවුරුන්දැයි කියන ලෙසය. අධ්‍යයන කාර්යය කවුළු පෝලිම්, බලපත්‍ර ගොනු සහ ක්ෂේත්‍ර සංචාරවලින් ගෙන ආවේය.\n\nසිකුරාදා වන විට නිලධාරීන් 42 දෙනෙකු එක් පිටුවක ප්‍රතිඥාවක අත්සන් කර තිබුණි. අංශ අටක් නොවැම්බර් තෙවන සතියේ පළමු ප්‍රතිඵලය වාර්තා කරයි.',
        program: {
          start: '2026-10-06',
          end: '2026-10-10',
          target_en: 'Divisional supervising officers',
          target_si: 'ප්‍රාදේශීය අධීක්ෂණ නිලධාරීන්',
          venue_en: 'MDTU hall, Kurunegala',
          venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකක ශාලාව, කුරුණෑගල',
          participants: 42,
          outcomes_en: 'Eight divisions filed a dated service promise.',
          outcomes_si: 'අංශ අටක් දින නියමිත සේවා ප්‍රතිඥාවක් භාර දුන්නේය.',
          metrics: { sessions: 5, hours: 30, satisfaction: 94 }
        },
        photos: [
          { path: '/assets/photos/hall.svg', en: 'Closing circle in the MDTU hall', si: 'ඒකක ශාලාවේ අවසන් රැස්වීම' },
          { path: '/assets/photos/workshop.svg', en: 'Service promises drafted at the tables', si: 'මේස අසල සකස් කළ සේවා ප්‍රතිඥා' }
        ]
      },
      {
        email: 'dilani.fernando@mdtu.local',
        category: 'training',
        page: 3,
        sort: 1,
        title_en: 'Evidence for planning',
        title_si: 'සැලසුම් සඳහා සාක්ෂි',
        excerpt_en: 'Planning officers practised a one-page evidence brief.',
        excerpt_si: 'සැලසුම් නිලධාරීන් එක් පිටුවක සාක්ෂි සටහනක් පුහුණු කළහ.',
        body_en: 'Participants brought a live target from their annual plan and reduced the evidence for it to a single page: the number, the source, the gap and the owner. Thirty-six briefs were accepted.',
        body_si: 'සහභාගිවන්නන් වාර්ෂික සැලසුමේ සජීවී ඉලක්කයක් ගෙනැවිත්, එහි සාක්ෂිය එක් පිටුවකට අඩු කළහ. සංඛ්‍යාව, මූලාශ්‍රය, හිඩැස සහ වගකීම දරන්නා එහි විය. සටහන් 36 ක් භාර ගන්නා ලදී.',
        program: {
          start: '2026-10-14',
          end: '2026-10-15',
          target_en: 'Planning and development officers',
          target_si: 'සැලසුම් හා සංවර්ධන නිලධාරීන්',
          venue_en: 'Provincial Council training room',
          venue_si: 'පළාත් සභා පුහුණු කාමරය',
          participants: 36,
          outcomes_en: 'Thirty-six evidence briefs filed with the Unit.',
          outcomes_si: 'සාක්ෂි සටහන් 36 ක් ඒකකයට භාර දුන්නේය.',
          metrics: { sessions: 2, hours: 12, satisfaction: 91 }
        },
        photos: [{ path: '/assets/photos/workshop.svg', en: 'Evidence briefs on the wall', si: 'බිත්තියේ සාක්ෂි සටහන්' }]
      },
      {
        email: 'nimal.perera@mdtu.local',
        category: 'training',
        page: 4,
        sort: 0,
        title_en: 'Frontline supervision',
        title_si: 'ඉදිරි පෙළ අධීක්ෂණය',
        excerpt_en: 'A two-day drill on feedback that staff can use the same week.',
        excerpt_si: 'එම සතියේම කාර්ය මණ්ඩලයට භාවිත කළ හැකි ප්‍රතිචාර පිළිබඳ දින දෙකක අභ්‍යාසයක්.',
        body_en: 'Supervisors practised a fifteen-minute feedback conversation and left with a script in Sinhala or Tamil. Forty-eight officers attended across two batches, so the hall never became a lecture.',
        body_si: 'අධීක්ෂකවරුන් විනාඩි පහළොවක ප්‍රතිචාර සංවාදයක් පුහුණු කළ අතර සිංහලෙන් හෝ දෙමළෙන් පිටපතක් රැගෙන ගියහ. කණ්ඩායම් දෙකක් ලෙස නිලධාරීන් 48 දෙනෙකු සහභාගි වූ නිසා ශාලාව දේශනයක් බවට පත් නොවීය.',
        program: {
          start: '2026-10-20',
          end: '2026-10-21',
          target_en: 'Office heads and supervisors',
          target_si: 'කාර්යාල ප්‍රධානීන් සහ අධීක්ෂකවරු',
          venue_en: 'MDTU hall, Kurunegala',
          venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකක ශාලාව, කුරුණෑගල',
          participants: 48,
          outcomes_en: 'Each supervisor kept a feedback script.',
          outcomes_si: 'සෑම අධීක්ෂකයෙක්ම ප්‍රතිචාර පිටපතක් රඳවා ගත්තේය.',
          metrics: { sessions: 4, hours: 14, satisfaction: 90 }
        },
        photos: [{ path: '/assets/photos/hall.svg', en: 'Paired practice in the hall', si: 'ශාලාවේ යුගල අභ්‍යාසය' }]
      },
      {
        email: 'dilani.fernando@mdtu.local',
        category: 'training',
        page: 4,
        sort: 1,
        title_en: 'Digital records for divisional secretariats',
        title_si: 'ප්‍රාදේශීය ලේකම් කාර්යාල සඳහා ඩිජිටල් වාර්තා',
        excerpt_en: 'File naming, shared folders and a weekly backup drill.',
        excerpt_si: 'ගොනු නම් කිරීම, හවුල් ෆෝල්ඩර සහ සතිපතා උපස්ථ අභ්‍යාසය.',
        body_en: 'Clerks and assistant secretaries rebuilt one real folder from their office during the class. Fifty-five participants left with a naming sheet and a backup day written into the office routine.',
        body_si: 'ලිපිකරුවන් සහ සහකාර ලේකම්වරු පන්තිය තුළදී තම කාර්යාලයේ සැබෑ ෆෝල්ඩරයක් නැවත ගොඩනඟා ගත්හ. සහභාගිවන්නන් 55 දෙනෙකු නම් කිරීමේ පත්‍රිකාවක් සහ කාර්යාල පිළිවෙතට ලියූ උපස්ථ දිනයක් රැගෙන ගියහ.',
        program: {
          start: '2026-10-22',
          end: '2026-10-23',
          target_en: 'Divisional secretariat staff',
          target_si: 'ප්‍රාදේශීය ලේකම් කාර්යාල කාර්ය මණ්ඩලය',
          venue_en: 'Computer lab, MDTU',
          venue_si: 'පරිගණක විද්‍යාගාරය, කළමනාකරණ සංවර්ධන පුහුණු ඒකකය',
          participants: 55,
          outcomes_en: 'Fifty-five offices adopted a backup day.',
          outcomes_si: 'කාර්යාල 55 ක් උපස්ථ දිනයක් අනුගමනය කළේය.',
          metrics: { sessions: 2, hours: 12, satisfaction: 93 }
        },
        photos: [{ path: '/assets/photos/workshop.svg', en: 'The computer lab session', si: 'පරිගණක විද්‍යාගාර සැසිය' }]
      },
      {
        email: 'ruwan.dias@mdtu.local',
        category: 'milestones',
        page: 5,
        sort: 0,
        featured: 1,
        title_en: 'The resource room passed 1,200 titles',
        title_si: 'සම්පත් කාමරය මාතෘකා 1,200 පසු කළේය',
        excerpt_en: 'A catalogued room, open to every course.',
        excerpt_si: 'සෑම පාඨමාලාවකටම විවෘත, නාමාවලියක් සහිත කාමරයක්.',
        body_en: 'On 17 October the resource room finished its new catalogue. Twelve hundred titles are now labelled by subject and language, and facilitators can reserve a shelf before a course begins. The count includes the Sinhala, Tamil and English collections.',
        body_si: 'ඔක්තෝබර් 17 වන දා සම්පත් කාමරය නව නාමාවලිය අවසන් කළේය. මාතෘකා එක්දහස් දෙසියයක් දැන් විෂය සහ භාෂාව අනුව ලේබල් කර ඇත. පාඨමාලාවක් ආරම්භයට පෙර පහසුකම් සපයන්නන්ට රාක්කයක් වෙන් කළ හැක. ගණනට සිංහල, දෙමළ සහ ඉංග්‍රීසි එකතුව ඇතුළත්ය.',
        program: {
          start: '2026-10-17',
          end: '2026-10-17',
          target_en: 'All facilitators and course clerks',
          target_si: 'සියලු පහසුකම් සපයන්නන් සහ පාඨමාලා ලිපිකරුවන්',
          venue_en: 'MDTU resource room',
          venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකක සම්පත් කාමරය',
          participants: 18,
          outcomes_en: 'Catalogue opened for reservation.',
          outcomes_si: 'වෙන්කිරීම සඳහා නාමාවලිය විවෘත විය.',
          metrics: { sessions: 1, hours: 3, satisfaction: 96 }
        },
        photos: [{ path: '/assets/photos/creative.svg', en: 'Shelves in the resource room', si: 'සම්පත් කාමරයේ රාක්ක' }]
      },
      {
        email: 'nimal.perera@mdtu.local',
        category: 'training',
        page: 5,
        sort: 2,
        title_en: 'Ethics and the public file',
        title_si: 'ආචාරධර්මය සහ රාජ්‍ය ගොනුව',
        excerpt_en: 'A quiet room, a real dilemma, a written stance.',
        excerpt_si: 'නිහඬ කාමරයක්, සැබෑ ගැටලුවක්, ලිඛිත ස්ථාවරයක්.',
        body_en: 'Thirty-eight officers worked through dilemmas drawn from procurement and leave. Each table wrote the rule it will apply when the same case returns. The papers stay with the Director.',
        body_si: 'නිලධාරීන් 38 දෙනෙකු ප්‍රසම්පාදන සහ නිවාඩු වලින් ගත් ගැටලු හරහා වැඩ කළහ. සෑම මේසයක්ම එම අවස්ථාව නැවත ආ විට යොදන රීතිය ලිව්වේය. ලිපි අධ්‍යක්ෂවරයා සතුව පවතී.',
        program: {
          start: '2026-10-27',
          end: '2026-10-27',
          target_en: 'Staff grade officers',
          target_si: 'කාර්ය මණ්ඩල ශ්‍රේණියේ නිලධාරීන්',
          venue_en: 'MDTU hall, Kurunegala',
          venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකක ශාලාව, කුරුණෑගල',
          participants: 38,
          outcomes_en: 'Table papers filed with the Director.',
          outcomes_si: 'මේස සටහන් අධ්‍යක්ෂවරයා වෙත භාර දුන්නේය.',
          metrics: { sessions: 1, hours: 6, satisfaction: 92 }
        },
        photos: [{ path: '/assets/photos/hall.svg', en: 'The ethics seminar', si: 'ආචාරධර්ම සම්මන්ත්‍රණය' }]
      },
      {
        email: 'dilani.fernando@mdtu.local',
        category: 'training',
        page: 5,
        sort: 3,
        title_en: 'Training of trainers',
        title_si: 'පුහුණුකරුවන් පුහුණු කිරීම',
        excerpt_en: 'Twenty-eight facilitators rehearsed a ninety-minute session.',
        excerpt_si: 'පහසුකම් සපයන්නන් 28 දෙනෙකු විනාඩි අනූවක සැසියක් පෙරහුරු කළහ.',
        body_en: 'The cohort rehearsed openings, timing and a closing question. Each facilitator will lead one session in November under observation.',
        body_si: 'කණ්ඩායම ආරම්භ, කාලය සහ අවසන් ප්‍රශ්නය පෙරහුරු කළේය. සෑම පහසුකම් සපයන්නෙක්ම නොවැම්බර් මාසයේ නිරීක්ෂණය යටතේ එක් සැසියක් මෙහෙයවයි.',
        program: {
          start: '2026-10-29',
          end: '2026-10-30',
          target_en: 'Internal facilitators',
          target_si: 'අභ්‍යන්තර පහසුකම් සපයන්නන්',
          venue_en: 'MDTU hall, Kurunegala',
          venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකක ශාලාව, කුරුණෑගල',
          participants: 28,
          outcomes_en: 'November observation roster confirmed.',
          outcomes_si: 'නොවැම්බර් නිරීක්ෂණ ලැයිස්තුව තහවුරු විය.',
          metrics: { sessions: 2, hours: 12, satisfaction: 95 }
        },
        photos: [{ path: '/assets/photos/workshop.svg', en: 'Facilitators in rehearsal', si: 'පෙරහුරුවේ පහසුකම් සපයන්නන්' }]
      },
      {
        email: 'sanduni.jayawardena@mdtu.local',
        category: 'language',
        page: 6,
        sort: 0,
        title_en: 'Intermediate Tamil for provincial officers',
        title_si: 'පළාත් නිලධාරීන් සඳහා මධ්‍යම දෙමළ',
        excerpt_en: 'Counter language, not textbook chapters.',
        excerpt_si: 'පෙළපොත් පරිච්ඡේද නොව, කවුළුවේ භාෂාව.',
        body_en: 'The Bhasha class stayed with the sentences officers need at a counter: names, dates, missing documents and a polite refusal. Twenty-six learners completed the October block and will sit a short oral check in November.',
        body_si: 'භාෂා පන්තිය නිලධාරීන්ට කවුළුවකදී අවශ්‍ය වාක්‍යවල රැඳුණේය. නම්, දිනයන්, අඩු ලේඛන සහ ආචාරශීලී ප්‍රතික්ෂේපය. ඉගෙන ගන්නන් 26 දෙනෙකු ඔක්තෝබර් කොටස සම්පූර්ණ කළ අතර නොවැම්බර් මාසයේ කෙටි වාචික පරීක්ෂණයකට පෙනී සිටිති.',
        program: {
          start: '2026-10-01',
          end: '2026-10-29',
          target_en: 'Officers serving Tamil-speaking divisions',
          target_si: 'දෙමළ කතා කරන අංශවල සේවය කරන නිලධාරීන්',
          venue_en: 'Language room, MDTU',
          venue_si: 'භාෂා කාමරය, කළමනාකරණ සංවර්ධන පුහුණු ඒකකය',
          participants: 26,
          outcomes_en: 'October block complete. Oral check set for November.',
          outcomes_si: 'ඔක්තෝබර් කොටස සම්පූර්ණයි. වාචික පරීක්ෂණය නොවැම්බර් සඳහා යෙදිණි.',
          metrics: { sessions: 8, hours: 16, satisfaction: 93 }
        },
        photos: [{ path: '/assets/photos/language.svg', en: 'The language room', si: 'භාෂා කාමරය' }]
      },
      {
        email: 'sanduni.jayawardena@mdtu.local',
        category: 'language',
        page: 6,
        sort: 1,
        title_en: 'External diploma in public financial management',
        title_si: 'රාජ්‍ය මූල්‍ය කළමනාකරණය පිළිබඳ බාහිර ඩිප්ලෝමාව',
        excerpt_en: 'Bahira patamala, taught with an external institute.',
        excerpt_si: 'බාහිර ආයතනයක් සමඟ උගන්වන බාහිර පාඨමාලාව.',
        body_en: 'The Saturday diploma continued with budgeting and audit trails. Eighteen officers remained on the register. The external faculty marked the first assignment; sixteen passed the threshold and two will resubmit in November.',
        body_si: 'සෙනසුරාදා ඩිප්ලෝමාව අයවැය සහ විගණන මඟ සමඟ ඉදිරියට ගියේය. නිලධාරීන් දහඅට දෙනෙකු ලේඛනයේ රැඳුණි. බාහිර පීඨය පළමු පැවරුම ලකුණු කළේය. දහසය දෙනෙකු සීමාව පසු කළ අතර දෙදෙනෙකු නොවැම්බර් මාසයේ නැවත භාර දෙති.',
        program: {
          start: '2026-10-04',
          end: '2026-10-25',
          target_en: 'Accounts and planning staff',
          target_si: 'ගිණුම් හා සැලසුම් කාර්ය මණ්ඩලය',
          venue_en: 'External faculty, weekend classroom',
          venue_si: 'බාහිර පීඨය, සති අන්ත පන්ති කාමරය',
          participants: 18,
          outcomes_en: 'Sixteen assignments passed the first threshold.',
          outcomes_si: 'පැවරුම් දහසයක් පළමු සීමාව පසු කළේය.',
          metrics: { sessions: 4, hours: 16, satisfaction: 88 }
        },
        photos: [{ path: '/assets/photos/workshop.svg', en: 'Weekend diploma classroom', si: 'සති අන්ත ඩිප්ලෝමා පන්ති කාමරය' }]
      },
      {
        email: 'mohamed.farhan@mdtu.local',
        category: 'language',
        page: 6,
        sort: 2,
        title_en: 'English for official correspondence',
        title_si: 'රාජ්‍ය ලිපි හුවමාරුව සඳහා ඉංග්‍රීසි',
        excerpt_en: 'Letters, minutes and a clean subject line.',
        excerpt_si: 'ලිපි, මිනිත්තු සහ පැහැදිලි මාතෘකා පේළියක්.',
        body_en: 'Twenty learners rewrote one letter from their own desk. The class marked clarity, not ornament. Corrected copies were returned the same week.',
        body_si: 'ඉගෙන ගන්නන් විස්ස දෙනෙකු තම මේසයේ ලිපියක් නැවත ලිව්වේය. පන්තිය සලකුණු කළේ අලංකාරය නොව පැහැදිලිකමයි. නිවැරදි කළ පිටපත් එම සතියේම ආපසු ලබා දුන්නේය.',
        program: {
          start: '2026-10-08',
          end: '2026-10-29',
          target_en: 'Officers who draft English letters',
          target_si: 'ඉංග්‍රීසි ලිපි කෙටුම්පත් කරන නිලධාරීන්',
          venue_en: 'Language room, MDTU',
          venue_si: 'භාෂා කාමරය, කළමනාකරණ සංවර්ධන පුහුණු ඒකකය',
          participants: 20,
          outcomes_en: 'Twenty letters returned with corrections.',
          outcomes_si: 'නිවැරදි කිරීම් සහිත ලිපි විස්සක් ආපසු ලබා දුන්නේය.',
          metrics: { sessions: 4, hours: 8, satisfaction: 90 }
        },
        photos: [{ path: '/assets/photos/language.svg', en: 'Corrected correspondence', si: 'නිවැරදි කළ ලිපි' }]
      },
      {
        email: 'fathima.rizvi@mdtu.local',
        category: 'scholarship',
        page: 7,
        sort: 0,
        featured: 1,
        title_en: 'Singapore: a public policy attachment',
        title_si: 'සිංගප්පූරුව: රාජ්‍ය ප්‍රතිපත්ති අනුයුක්තය',
        excerpt_en: 'First fortnight note from the Civil Service College.',
        excerpt_si: 'සිවිල් සර්විස් විද්‍යාලයෙන් පළමු සති දෙකේ සටහන.',
        body_en: 'The officer attached to the Civil Service College has completed the opening fortnight on policy design and citizen feedback. The first note home lists three practices worth testing in a divisional secretariat: a named case owner, a public queue time, and a Friday review that lasts thirty minutes.\n\nThe attachment runs to December. A mid-point seminar for the home team is fixed for 20 November.',
        body_si: 'සිවිල් සර්විස් විද්‍යාලයට අනුයුක්ත නිලධාරියා ප්‍රතිපත්ති සැලසුම සහ පුරවැසි ප්‍රතිචාර පිළිබඳ පළමු සති දෙක සම්පූර්ණ කළේය. ගෙදර එවූ පළමු සටහන ප්‍රාදේශීය ලේකම් කාර්යාලයක අත්හදා බැලීමට සුදුසු පිළිවෙත් තුනක් දක්වයි. නම් කළ ගොනු හිමිකරුවෙක්, පොදු පෝලිම් කාලයක්, සහ විනාඩි තිහක් පවතින සිකුරාදා සමාලෝචනයක්.\n\nඅනුයුක්තය දෙසැම්බර් දක්වා පවතී. ගෙදර කණ්ඩායම සඳහා මධ්‍ය සම්මන්ත්‍රණය නොවැම්බර් 20 දිනට යොදා ඇත.',
        program: {
          start: '2026-10-05',
          end: '2026-12-12',
          target_en: 'One selected staff officer',
          target_si: 'තෝරාගත් කාර්ය මණ්ඩල නිලධාරියෙක්',
          venue_en: 'Civil Service College, Singapore',
          venue_si: 'සිවිල් සර්විස් විද්‍යාලය, සිංගප්පූරුව',
          participants: 1,
          outcomes_en: 'First progress note received. Home seminar set.',
          outcomes_si: 'පළමු ප්‍රගති සටහන ලැබුණි. ගෙදර සම්මන්ත්‍රණය යෙදිණි.',
          metrics: { sessions: 10, hours: 40, satisfaction: 0 }
        },
        photos: [{ path: '/assets/photos/journey.svg', en: 'The Singapore attachment', si: 'සිංගප්පූරු අනුයුක්තය' }]
      },
      {
        email: 'fathima.rizvi@mdtu.local',
        category: 'scholarship',
        page: 7,
        sort: 1,
        title_en: 'Hyderabad: administrative training',
        title_si: 'හයිද්‍රාබාද්: පරිපාලන පුහුණුව',
        excerpt_en: 'A short course at the Administrative Staff College.',
        excerpt_si: 'පරිපාලන කාර්ය මණ්ඩල විද්‍යාලයේ කෙටි පාඨමාලාවක්.',
        body_en: 'Two officers began the short course on inter-agency coordination. Their weekly note confirms attendance and names the field visit scheduled for the first week of November. A debrief at MDTU will follow their return.',
        body_si: 'නිලධාරීන් දෙදෙනෙකු අන්තර් ආයතන සම්බන්ධීකරණය පිළිබඳ කෙටි පාඨමාලාව ආරම්භ කළහ. ඔවුන්ගේ සතිපතා සටහන පැමිණීම තහවුරු කරන අතර නොවැම්බර් පළමු සතියට යෙදූ ක්ෂේත්‍ර සංචාරය නම් කරයි. ආපසු පැමිණීමෙන් පසු ඒකකයේ සාකච්ඡාවක් පවත්වයි.',
        program: {
          start: '2026-10-12',
          end: '2026-11-06',
          target_en: 'Two staff officers',
          target_si: 'කාර්ය මණ්ඩල නිලධාරීන් දෙදෙනෙක්',
          venue_en: 'Administrative Staff College, Hyderabad',
          venue_si: 'පරිපාලන කාර්ය මණ්ඩල විද්‍යාලය, හයිද්‍රාබාද්',
          participants: 2,
          outcomes_en: 'Weekly attendance confirmed.',
          outcomes_si: 'සතිපතා පැමිණීම තහවුරු විය.',
          metrics: { sessions: 8, hours: 32, satisfaction: 0 }
        },
        photos: [{ path: '/assets/photos/journey.svg', en: 'Departure for Hyderabad', si: 'හයිද්‍රාබාද් බලා පිටත් වීම' }]
      },
      {
        email: 'ajith.bandara@mdtu.local',
        category: 'creative',
        page: 8,
        sort: 0,
        title_en: 'Rain over the tank',
        title_si: 'වැව මත වැස්ස',
        excerpt_en: 'A poem from the road back to Kurunegala.',
        excerpt_si: 'කුරුණෑගල බලා එන මගේ කවියක්.',
        body_en: 'The tank took the rain without comment,\nand the road learned the colour of the sky.\nWe carried our files under one coat.\nNobody asked the water to hurry.\n\nBy the junction the bus lights came on,\nsmall, exact, and enough.\nI thought of the office, still lit,\nand of the promise left on a table\nto be kept when the week begins.',
        body_si: 'වැව වැස්ස නිහඬව භාර ගත්තේය.\nමග අහසේ පාට ඉගෙන ගත්තේය.\nඅපි එක කබායක් යට ගොනු රැගෙන ගියෙමු.\nකිසිවෙකු ජලයෙන් ඉක්මන් වන ලෙස ඉල්ලුවේ නැත.\n\nහන්දිය වන විට බස් එළි දැල්වුණි.\nකුඩා, නිවැරදි, සෑහෙන.\nමට සිතුණේ තවම දැල්වී ඇති කාර්යාලය ගැනය.\nමේසය මත තැබූ ප්‍රතිඥාව ගැනය.\nසතිය ආරම්භ වන විට එය රැකිය යුතුය.',
        photos: [{ path: '/assets/photos/creative.svg', en: 'Evening on the tank road', si: 'වැව් මාර්ගයේ සවස' }]
      },
      {
        email: 'ishara.gunasekara@mdtu.local',
        category: 'creative',
        page: 8,
        sort: 1,
        title_en: 'The clerk and the clock',
        title_si: 'ලිපිකරු සහ ඔරලෝසුව',
        excerpt_en: 'A short note on staying to the end of a queue.',
        excerpt_si: 'පෝලිමේ අවසානය දක්වා රැඳී සිටීම ගැන කෙටි සටහනක්.',
        body_en: 'There is a clock above the counter that nobody trusts and everybody looks at. The clerk I watched did not argue with it. She finished the person in front of her, then the next, and wrote the time only when the file was truly closed. It is a small discipline. It is also the whole service.',
        body_si: 'කවුළුවට ඉහළින් කිසිවෙකු විශ්වාස නොකරන, නමුත් හැමෝම බලන ඔරලෝසුවක් ඇත. මා නිරීක්ෂණය කළ ලිපිකරු එය සමඟ වාද කළේ නැත. ඇය ඉදිරිපිට සිටි පුද්ගලයා අවසන් කළා, ඊළඟට, ගොනුව සැබවින්ම වැසූ විට පමණක් වේලාව ලිව්වා. එය කුඩා විනයකි. එයම මුළු සේවාවයි.'
      },
      {
        email: 'ajith.bandara@mdtu.local',
        category: 'creative',
        page: 9,
        sort: 0,
        title_en: 'After class, Kurunegala',
        title_si: 'පන්තියෙන් පසු, කුරුණෑගල',
        excerpt_en: 'Three frames from the evening the hall emptied.',
        excerpt_si: 'ශාලාව හිස් වූ සවසේ රාමු තුනක්.',
        body_en: 'The chairs go back. The board is wiped. Somebody always leaves a promise sheet, and somebody always brings it to the office. These frames were made after the leadership clinic, when the hall had returned to its ordinary light.',
        body_si: 'පුටු ආපසු යයි. ලඝු පුවරුව මකනු ලැබේ. යමෙක් සැමවිටම ප්‍රතිඥා පත්‍රයක් තබයි. යමෙක් සැමවිටම එය කාර්යාලයට ගෙන එයි. නායකත්ව සායනයෙන් පසු, ශාලාව සාමාන්‍ය එළියට පැමිණි විට මෙම රාමු සෑදුණි.',
        photos: [
          { path: '/assets/photos/hall.svg', en: 'The hall after the last chair', si: 'අවසන් පුටුවෙන් පසු ශාලාව' },
          { path: '/assets/photos/field.svg', en: 'Light on the way out', si: 'පිටව යන මගේ එළිය' },
          { path: '/assets/photos/creative.svg', en: 'A promise sheet left behind', si: 'ඉතිරි වූ ප්‍රතිඥා පත්‍රය' }
        ]
      },
      {
        email: 'chamari.wickramasinghe@mdtu.local',
        category: 'plans',
        page: 10,
        sort: 0,
        title_en: 'Leadership clinic, second sitting',
        title_si: 'නායකත්ව සායනය, දෙවන වාරය',
        excerpt_en: '3–5 November, for officers who missed October.',
        excerpt_si: 'නොවැම්බර් 3–5, ඔක්තෝබර් මඟ හැරුණු නිලධාරීන් සඳහා.',
        body_en: 'A second sitting opens for divisions that could not release staff in October. The same promise sheet will be used, so the November report can read both groups together.',
        body_si: 'ඔක්තෝබර් මාසයේ කාර්ය මණ්ඩලය මුදා ගැනීමට නොහැකි වූ අංශ සඳහා දෙවන වාරයක් විවෘත වේ. එම ප්‍රතිඥා පත්‍රයම භාවිත වන නිසා නොවැම්බර් වාර්තාවට කණ්ඩායම් දෙකම එකට කියවිය හැක.',
        program: {
          start: '2026-11-03',
          end: '2026-11-05',
          target_en: 'Divisional officers',
          target_si: 'ප්‍රාදේශීය නිලධාරීන්',
          venue_en: 'MDTU hall, Kurunegala',
          venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකක ශාලාව, කුරුණෑගල',
          participants: 40,
          outcomes_en: 'Nominations close on 28 October.',
          outcomes_si: 'නම් කිරීම් ඔක්තෝබර් 28 දින අවසන් වේ.',
          metrics: {}
        }
      },
      {
        email: 'chamari.wickramasinghe@mdtu.local',
        category: 'plans',
        page: 10,
        sort: 1,
        title_en: 'Field visit to Puttalam',
        title_si: 'පුත්තලම ක්ෂේත්‍ර සංචාරය',
        excerpt_en: '12 November, to read the October promises on site.',
        excerpt_si: 'නොවැම්බර් 12, ඔක්තෝබර් ප්‍රතිඥා ස්ථානයේදී කියවීමට.',
        body_en: 'The Director and two training officers will sit with three divisions and compare the promise sheet with the counter as it actually runs.',
        body_si: 'අධ්‍යක්ෂවරයා සහ පුහුණු නිලධාරීන් දෙදෙනෙකු අංශ තුනක් සමඟ වාඩි වී, ප්‍රතිඥා පත්‍රය සැබෑ කවුළුව සමඟ සසඳයි.',
        program: {
          start: '2026-11-12',
          end: '2026-11-12',
          target_en: 'Three Puttalam divisions',
          target_si: 'පුත්තලම අංශ තුනක්',
          venue_en: 'Divisional secretariats, Puttalam',
          venue_si: 'ප්‍රාදේශීය ලේකම් කාර්යාල, පුත්තලම',
          participants: 12,
          outcomes_en: 'Visit note due 14 November.',
          outcomes_si: 'සංචාර සටහන නොවැම්බර් 14 දිනට නියමිතය.',
          metrics: {}
        }
      },
      {
        email: 'chamari.wickramasinghe@mdtu.local',
        category: 'plans',
        page: 10,
        sort: 2,
        title_en: 'Bhasha oral assessment',
        title_si: 'භාෂා වාචික ඇගයීම',
        excerpt_en: '18–19 November, language room.',
        excerpt_si: 'නොවැම්බර් 18–19, භාෂා කාමරය.',
        body_en: 'Tamil and English learners sit a ten-minute oral check. Results return to their heads of office with one recommended next class, not a rank list.',
        body_si: 'දෙමළ සහ ඉංග්‍රීසි ඉගෙන ගන්නන් විනාඩි දහයක වාචික පරීක්ෂණයකට පෙනී සිටිති. ප්‍රතිඵල ශ්‍රේණි ලැයිස්තුවක් නොව, නිර්දේශිත ඊළඟ පන්තියක් සමඟ කාර්යාල ප්‍රධානීන් වෙත යයි.',
        program: {
          start: '2026-11-18',
          end: '2026-11-19',
          target_en: 'October language cohorts',
          target_si: 'ඔක්තෝබර් භාෂා කණ්ඩායම්',
          venue_en: 'Language room, MDTU',
          venue_si: 'භාෂා කාමරය, කළමනාකරණ සංවර්ධන පුහුණු ඒකකය',
          participants: 46,
          outcomes_en: 'Individual notes, no public ranking.',
          outcomes_si: 'පුද්ගලික සටහන්, පොදු ශ්‍රේණිගත කිරීමක් නැත.',
          metrics: {}
        }
      }
    ];

    octoberItems.forEach((item) => {
      addArticle({
        ...item,
        magazineId: october,
        status: 'published',
        month: 10,
        year: 2026
      });
    });

    function shortBody(titleEn, titleSi) {
      return {
        body_en: `${titleEn} ran for provincial staff this month. Officers left with one written action for their division and a date to report it back to the Unit.`,
        body_si: `${titleSi} මෙම මාසයේ පළාත් නිලධාරීන් සඳහා පවත්වන ලදී. නිලධාරීන් තම අංශය සඳහා ලිඛිත ක්‍රියාවක් සහ එය ඒකකයට වාර්තා කිරීමේ දිනයක් රැගෙන ගියහ.`
      };
    }

    function buildPastIssue(spec) {
      const magazineId = addMagazine(spec.magazine);
      spec.items.forEach((item) => {
        const text = item.body_en ? item : { ...item, ...shortBody(item.title_en, item.title_si) };
        addArticle({
          ...text,
          magazineId,
          status: 'published',
          month: spec.magazine.month,
          year: spec.magazine.year,
          program: item.program || (item.category === 'creative' ? null : {
            start: `${spec.magazine.year}-${String(spec.magazine.month).padStart(2, '0')}-06`,
            end: `${spec.magazine.year}-${String(spec.magazine.month).padStart(2, '0')}-08`,
            target_en: 'Provincial officers',
            target_si: 'පළාත් නිලධාරීන්',
            venue_en: 'MDTU, Kurunegala',
            venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකකය, කුරුණෑගල',
            participants: item.participants || 30,
            outcomes_en: 'Action notes filed with the Unit.',
            outcomes_si: 'ක්‍රියාකාරී සටහන් ඒකකයට භාර දුන්නේය.',
            metrics: { sessions: 2, hours: 10, satisfaction: 90 }
          }),
          photos: item.photos || [{ path: item.photo || '/assets/photos/hall.svg', en: item.title_en, si: item.title_si }]
        });
      });
    }

    buildPastIssue({
      magazine: {
        slug: '2026-09',
        month: 9,
        year: 2026,
        title_en: 'After the rain',
        title_si: 'වැස්සෙන් පසු',
        summary_en: 'September was a month of follow-up. The Unit went back to three divisions, kept the language rooms open, and published the field notes in this edition.',
        summary_si: 'සැප්තැම්බර් පසු විපරමේ මාසයක් විය. ඒකකය අංශ තුනකට ආපසු ගියේය, භාෂා කාමර විවෘතව තබා ගත්තේය, සහ ක්ෂේත්‍ර සටහන් මෙම කලාපයේ පළ කළේය.',
        highlights: [
          { en: 'Field notes from three divisions after the August clinics.', si: 'අගෝස්තු සායනවලින් පසු අංශ තුනක ක්ෂේත්‍ර සටහන්.' },
          { en: 'Language classes held their line through the rains.', si: 'වැසි හරහා භාෂා පන්ති තම මඟ රැකගත්තේය.' },
          { en: 'One officer began an overseas induction.', si: 'නිලධාරියෙකු විදේශ හඳුන්වාදීමක් ආරම්භ කළේය.' }
        ],
        cover: '/assets/covers/2026-09.svg',
        status: 'published'
      },
      items: [
        { email: 'anoma.rathnayake@mdtu.local', category: 'editorial', page: 2, sort: 0, title_en: 'Go back and look', title_si: 'ආපසු ගොස් බලන්න', excerpt_en: 'A course is finished only when the division has been seen again.', excerpt_si: 'අංශය නැවත දුටු විට පමණක් පාඨමාලාව අවසන් වේ.', body_en: 'We promised in August that training would return to the divisions that hosted it. September kept that promise. The notes in this issue were written after the visit, not before the certificate.', body_si: 'පුහුණුව සත්කාරකත්වය දැරූ අංශවලට ආපසු යන බව අප අගෝස්තුවේ පොරොන්දු වූයෙමු. සැප්තැම්බර් එම පොරොන්දුව රැකීය. මෙම කලාපයේ සටහන් සංචාරයෙන් පසු ලියූ ඒවාය. සහතිකයට පෙර නොවේ.' },
        { email: 'sujeewa.fernando@mdtu.local', category: 'editorial', page: 2, sort: 1, title_en: 'How to read the notes', title_si: 'සටහන් කියවන ආකාරය', excerpt_en: 'Dates first, then names.', excerpt_si: 'පළමුව දිනයන්, ඉන්පසු නම්.', body_en: 'Where a division is named, the date beside it is the day we will ask again. Please read the notes that way.', body_si: 'අංශයක් නම් කර ඇති තැන, එහි දිනය අප නැවත අසන දිනයයි. කරුණාකර සටහන් එසේ කියවන්න.' },
        { email: 'nimal.perera@mdtu.local', category: 'training', page: 3, sort: 0, featured: 1, title_en: 'Return visit to Kuliyapitiya', title_si: 'කුලියාපිටියට ආපසු සංචාරය', excerpt_en: 'The August promise, read at the counter.', excerpt_si: 'අගෝස්තු ප්‍රතිඥාව කවුළුවේදී කියවීය.', participants: 22, photo: '/assets/photos/field.svg' },
        { email: 'dilani.fernando@mdtu.local', category: 'training', page: 3, sort: 1, title_en: 'Records clinic, second room', title_si: 'වාර්තා සායනය, දෙවන කාමරය', excerpt_en: 'A smaller room, the same folder discipline.', excerpt_si: 'කුඩා කාමරයක්, එම ගොනු විනයම.', participants: 31 },
        { email: 'nimal.perera@mdtu.local', category: 'training', page: 4, sort: 0, title_en: 'Supervision refresher', title_si: 'අධීක්ෂණ නැවුම් කිරීම', excerpt_en: 'One afternoon, one conversation, practised twice.', excerpt_si: 'එක් දහවලක්, එක් සංවාදයක්, දෙවරක් පුහුණු කළේය.', participants: 27 },
        { email: 'dilani.fernando@mdtu.local', category: 'training', page: 4, sort: 1, title_en: 'Induction for new clerks', title_si: 'නව ලිපිකරුවන් සඳහා හඳුන්වාදීම', excerpt_en: 'The first week, taught by last year’s cohort.', excerpt_si: 'පළමු සතිය, පසුගිය වසරේ කණ්ඩායම උගන්වයි.', participants: 19 },
        { email: 'ruwan.dias@mdtu.local', category: 'milestones', page: 5, sort: 0, featured: 1, title_en: 'Follow-up register opened', title_si: 'පසු විපරම් ලේඛනය විවෘත විය', excerpt_en: 'Every course now has a return date.', excerpt_si: 'සෑම පාඨමාලාවකටම දැන් ආපසු දිනයක් ඇත.', participants: 8, photo: '/assets/photos/workshop.svg' },
        { email: 'sanduni.jayawardena@mdtu.local', category: 'language', page: 6, sort: 0, title_en: 'Tamil through the rains', title_si: 'වැසි හරහා දෙමළ', excerpt_en: 'Attendance held at twenty-four.', excerpt_si: 'පැමිණීම විසිහතරේ රැඳුණි.', participants: 24, photo: '/assets/photos/language.svg' },
        { email: 'mohamed.farhan@mdtu.local', category: 'language', page: 6, sort: 1, title_en: 'External writing seminar', title_si: 'බාහිර ලේඛන සම්මන්ත්‍රණය', excerpt_en: 'Bahira patamala with a visiting lecturer.', excerpt_si: 'ආගන්තුක කථිකාචාර්යවරයෙකු සමඟ බාහිර පාඨමාලාව.', participants: 16, photo: '/assets/photos/language.svg' },
        { email: 'fathima.rizvi@mdtu.local', category: 'scholarship', page: 7, sort: 0, featured: 1, title_en: 'Overseas induction week', title_si: 'විදේශ හඳුන්වාදීමේ සතිය', excerpt_en: 'One officer began pre-departure briefing.', excerpt_si: 'නිලධාරියෙකු පිටත්වීමට පෙර හඳුන්වාදීම ආරම්භ කළේය.', participants: 1, photo: '/assets/photos/journey.svg' },
        { email: 'ajith.bandara@mdtu.local', category: 'creative', page: 8, sort: 0, title_en: 'A note from the veranda', title_si: 'ඉස්තෝප්පුවෙන් සටහනක්', excerpt_en: 'Staff writing after the field visit.', excerpt_si: 'ක්ෂේත්‍ර සංචාරයෙන් පසු කාර්ය මණ්ඩල ලිවීම.', body_en: 'The rain stopped at the gate and not before. We dried the register on the veranda and nobody complained. There are days when the work is simply to keep the paper usable. This was one of them.', body_si: 'වැස්ස ගේට්ටුවේ නතර වූයේය. ඊට පෙර නොවේ. අපි ඉස්තෝප්පුවේ ලේඛනය වේලා ගත්තෙමු. කිසිවෙකු පැමිණිලි කළේ නැත. සමහර දිනවල කාර්යය නම් කඩදාසිය භාවිත කළ හැකි ලෙස තබා ගැනීමයි. මෙය එවැනි දිනයක් විය.', photo: '/assets/photos/creative.svg' },
        { email: 'ishara.gunasekara@mdtu.local', category: 'creative', page: 9, sort: 0, title_en: 'Three roads after rain', title_si: 'වැස්සෙන් පසු මාර්ග තුනක්', excerpt_en: 'Photographs from the return journey.', excerpt_si: 'ආපසු මගේ ඡායාරූප.', photo: '/assets/photos/field.svg', photos: [
          { path: '/assets/photos/field.svg', en: 'The first road', si: 'පළමු මාර්ගය' },
          { path: '/assets/photos/journey.svg', en: 'The junction', si: 'හන්දිය' },
          { path: '/assets/photos/creative.svg', en: 'Light after the shower', si: 'වැස්සෙන් පසු එළිය' }
        ] },
        { email: 'chamari.wickramasinghe@mdtu.local', category: 'plans', page: 10, sort: 0, title_en: 'October leadership clinic', title_si: 'ඔක්තෝබර් නායකත්ව සායනය', excerpt_en: 'The sitting that became this month’s cover story.', excerpt_si: 'මෙම මාසයේ පිටකවර කතාව බවට පත් වාරය.', participants: 40 },
        { email: 'chamari.wickramasinghe@mdtu.local', category: 'plans', page: 10, sort: 1, title_en: 'Catalogue weekend', title_si: 'නාමාවලි සති අන්තය', excerpt_en: 'The resource room count, scheduled.', excerpt_si: 'සම්පත් කාමර ගණනය, යොදා ඇත.', participants: 10 }
      ]
    });

    buildPastIssue({
      magazine: {
        slug: '2026-08',
        month: 8,
        year: 2026,
        title_en: 'The long table',
        title_si: 'දිගු මේසය',
        summary_en: 'August put facilitators and new officers at the same table. The Unit trained the people who will train others, and opened the year\'s follow-up book.',
        summary_si: 'අගෝස්තුව පහසුකම් සපයන්නන් සහ නව නිලධාරීන් එකම මේසයකට වාඩි කළේය. අන් අය පුහුණු කරන අය ඒකකය පුහුණු කළේය. වසරේ පසු විපරම් පොත විවෘත කළේය.',
        highlights: [
          { en: 'Facilitators rehearsed the sessions they will lead.', si: 'පහසුකම් සපයන්නන් තමන් මෙහෙයවන සැසි පෙරහුරු කළහ.' },
          { en: 'A long-table induction for new clerks.', si: 'නව ලිපිකරුවන් සඳහා දිගු මේස හඳුන්වාදීමක්.' },
          { en: 'The follow-up book was opened.', si: 'පසු විපරම් පොත විවෘත කළේය.' }
        ],
        cover: '/assets/covers/2026-08.svg',
        status: 'published'
      },
      items: [
        { email: 'anoma.rathnayake@mdtu.local', category: 'editorial', page: 2, sort: 0, title_en: 'Teach the teachers first', title_si: 'පළමුව ගුරුවරුන් උගන්වන්න', excerpt_en: 'A unit is only as steady as the people who hold the room.', excerpt_si: 'කාමරය දරන අය තරම්ම ඒකකය ස්ථිරය.', body_en: 'August was given to the facilitators. If they are unsure, the room is unsure. The long table in this issue is not a metaphor. It is the table we actually set.', body_si: 'අගෝස්තුව පහසුකම් සපයන්නන්ට ලබා දුන්නෙමු. ඔවුන් අවිනිශ්චිත නම් කාමරය අවිනිශ්චිතය. මෙම කලාපයේ දිගු මේසය උපමාවක් නොවේ. අප සැබවින්ම යෙදූ මේසයයි.' },
        { email: 'sujeewa.fernando@mdtu.local', category: 'editorial', page: 2, sort: 1, title_en: 'A book of return dates', title_si: 'ආපසු දිනයන්ගේ පොතක්', excerpt_en: 'Every course now owes the Unit a visit.', excerpt_si: 'සෑම පාඨමාලාවක්ම දැන් ඒකකයට සංචාරයක් ණයයි.', body_en: 'We opened a book of return dates. Nothing in it is ornamental. If a course is listed, someone will go back.', body_si: 'අප ආපසු දිනයන්ගේ පොතක් විවෘත කළෙමු. එහි කිසිවක් අලංකාරය සඳහා නොවේ. පාඨමාලාවක් ලැයිස්තුගත නම්, යමෙක් ආපසු යයි.' },
        { email: 'dilani.fernando@mdtu.local', category: 'training', page: 3, sort: 0, featured: 1, title_en: 'The facilitators’ table', title_si: 'පහසුකම් සපයන්නන්ගේ මේසය', excerpt_en: 'Twenty-four people rehearsed the year.', excerpt_si: 'පුද්ගලයින් විසිහතර දෙනෙකු වසර පෙරහුරු කළහ.', participants: 24, photo: '/assets/photos/hall.svg' },
        { email: 'nimal.perera@mdtu.local', category: 'training', page: 4, sort: 0, title_en: 'New clerks at the long table', title_si: 'දිගු මේසයේ නව ලිපිකරුවන්', excerpt_en: 'Induction without a lecture.', excerpt_si: 'දේශනයක් නැති හඳුන්වාදීම.', participants: 33 },
        { email: 'ruwan.dias@mdtu.local', category: 'milestones', page: 5, sort: 0, featured: 1, title_en: 'Follow-up book, first entries', title_si: 'පසු විපරම් පොත, පළමු ඇතුළත් කිරීම්', excerpt_en: 'Twelve courses now have a return date.', excerpt_si: 'පාඨමාලා දොළහකට දැන් ආපසු දිනයක් ඇත.', participants: 12, photo: '/assets/photos/workshop.svg' },
        { email: 'sanduni.jayawardena@mdtu.local', category: 'language', page: 6, sort: 0, title_en: 'Bhasha, opening term', title_si: 'භාෂා, ආරම්භක වාරය', excerpt_en: 'Tamil and English rooms reopened.', excerpt_si: 'දෙමළ සහ ඉංග්‍රීසි කාමර නැවත විවෘත විය.', participants: 40, photo: '/assets/photos/language.svg' },
        { email: 'fathima.rizvi@mdtu.local', category: 'scholarship', page: 7, sort: 0, title_en: 'Pre-departure panel', title_si: 'පිටත්වීමට පෙර මණ්ඩලය', excerpt_en: 'Candidates briefed before nomination.', excerpt_si: 'නම් කිරීමට පෙර අපේක්ෂකයන්ට හඳුන්වා දුන්නේය.', participants: 6, photo: '/assets/photos/journey.svg' },
        { email: 'ishara.gunasekara@mdtu.local', category: 'creative', page: 8, sort: 0, title_en: 'Names around a table', title_si: 'මේසය වටා නම්', excerpt_en: 'A piece for the people who pour the tea.', excerpt_si: 'තේ වත් කරන අය සඳහා ලිපියක්.', body_en: 'Somebody has to know where the extra chairs are. Somebody has to spell the names as they are spoken, not as the form prefers. The long table works because those somebodies arrived early.', body_si: 'අමතර පුටු ඇත්තේ කොහේදැයි යමෙක් දැන සිටිය යුතුය. නම් උච්චාරණය වන පරිදි, පෝරමය කැමති පරිදි නොව, යමෙක් ලිවිය යුතුය. දිගු මේසය ක්‍රියා කරන්නේ එම අය ඉක්මනින් පැමිණි නිසාය.', photo: '/assets/photos/creative.svg' },
        { email: 'ajith.bandara@mdtu.local', category: 'creative', page: 9, sort: 0, title_en: 'Chairs in a row', title_si: 'පේළියට පුටු', excerpt_en: 'A photograph before anyone sat down.', excerpt_si: 'කිසිවෙකු වාඩි වීමට පෙර ඡායාරූපයක්.', photo: '/assets/photos/hall.svg' },
        { email: 'chamari.wickramasinghe@mdtu.local', category: 'plans', page: 10, sort: 0, title_en: 'September field returns', title_si: 'සැප්තැම්බර් ක්ෂේත්‍ර ආපසු ඒම', excerpt_en: 'The visits this issue has now recorded.', excerpt_si: 'මෙම කලාපය දැන් වාර්තා කර ඇති සංචාර.', participants: 15 }
      ]
    });

    addMagazine({
      slug: '2026-11',
      month: 11,
      year: 2026,
      title_en: 'The return',
      title_si: 'ආපසු ඒම',
      summary_en: 'November will read the October promises on site. This issue is still in draft.',
      summary_si: 'නොවැම්බර් ඔක්තෝබර් ප්‍රතිඥා ස්ථානයේදී කියවයි. මෙම කලාපය තවම කෙටුම්පතකි.',
      highlights: [
        { en: 'Field reading of the October promise sheets.', si: 'ඔක්තෝබර් ප්‍රතිඥා පත්‍ර ක්ෂේත්‍රයේදී කියවීම.' },
        { en: 'Oral checks for the language rooms.', si: 'භාෂා කාමර සඳහා වාචික පරීක්ෂණ.' },
        { en: 'A home seminar for the Singapore attachment.', si: 'සිංගප්පූරු අනුයුක්තය සඳහා ගෙදර සම්මන්ත්‍රණයක්.' }
      ],
      cover: '/assets/covers/2026-11.svg',
      status: 'draft'
    });

    addArticle({
      email: 'nimal.perera@mdtu.local',
      category: 'training',
      status: 'submitted',
      month: 11,
      year: 2026,
      title_en: 'Reading the promises in Puttalam',
      title_si: 'පුත්තලම ප්‍රතිඥා කියවීම',
      excerpt_en: 'What the October sheets look like at the counter.',
      excerpt_si: 'ඔක්තෝබර් පත්‍ර කවුළුවේදී පෙනෙන ආකාරය.',
      body_en: 'Three divisions will be visited on 12 November. This note proposes the questions: Is the promise on the wall? Who owns it this week? What slipped?',
      body_si: 'නොවැම්බර් 12 වන දා අංශ තුනක් බැලීමට නියමිතය. මෙම සටහන ප්‍රශ්න යෝජනා කරයි. ප්‍රතිඥාව බිත්තියේ තිබේද? මෙම සතියේ එය අයිති කාටද? මඟ හැරුණේ කුමක්ද?',
      program: {
        start: '2026-11-12',
        end: '2026-11-12',
        target_en: 'Three Puttalam divisions',
        target_si: 'පුත්තලම අංශ තුනක්',
        venue_en: 'Puttalam',
        venue_si: 'පුත්තලම',
        participants: 12,
        outcomes_en: 'Question sheet ready for the Director.',
        outcomes_si: 'අධ්‍යක්ෂවරයා සඳහා ප්‍රශ්න පත්‍රය සූදානම්.',
        metrics: { sessions: 1, hours: 6, satisfaction: 0 }
      }
    });

    addArticle({
      email: 'sanduni.jayawardena@mdtu.local',
      category: 'language',
      status: 'submitted',
      month: 11,
      year: 2026,
      title_en: 'Oral check design',
      title_si: 'වාචික පරීක්ෂණ සැලසුම',
      excerpt_en: 'Ten minutes, no rank list.',
      excerpt_si: 'විනාඩි දහයයි, ශ්‍රේණි ලැයිස්තුවක් නැත.',
      body_en: 'The oral check uses four counter sentences. Assessors mark whether the officer can finish the sentence with the citizen, not whether the grammar is ornate.',
      body_si: 'වාචික පරීක්ෂණය කවුළු වාක්‍ය හතරක් භාවිත කරයි. විභාගකයින් සලකුණු කරන්නේ නිලධාරියාට පුරවැසියා සමඟ වාක්‍යය අවසන් කළ හැකිද යන්නයි. ව්‍යාකරණය අලංකාරද යන්න නොවේ.',
      program: {
        start: '2026-11-18',
        end: '2026-11-19',
        target_en: 'October language learners',
        target_si: 'ඔක්තෝබර් භාෂා ඉගෙන ගන්නන්',
        venue_en: 'Language room, MDTU',
        venue_si: 'භාෂා කාමරය, කළමනාකරණ සංවර්ධන පුහුණු ඒකකය',
        participants: 46,
        outcomes_en: 'Assessor notes drafted.',
        outcomes_si: 'විභාගක සටහන් කෙටුම්පත් කළේය.',
        metrics: {}
      }
    });

    addArticle({
      email: 'fathima.rizvi@mdtu.local',
      category: 'scholarship',
      status: 'approved',
      month: 11,
      year: 2026,
      title_en: 'Home seminar for Singapore',
      title_si: 'සිංගප්පූරුව සඳහා ගෙදර සම්මන්ත්‍රණය',
      excerpt_en: '20 November, three practices to test.',
      excerpt_si: 'නොවැම්බර් 20, අත්හදා බැලීමට පිළිවෙත් තුනක්.',
      body_en: 'The attached officer will join by video for forty minutes. The home team will choose one of the three practices and name a division willing to test it in December.',
      body_si: 'අනුයුක්ත නිලධාරියා විනාඩි හතළිහක් වීඩියෝ මගින් එකතු වේ. ගෙදර කණ්ඩායම පිළිවෙත් තුනෙන් එකක් තෝරා, දෙසැම්බර් මාසයේ එය අත්හදා බලන අංශයක් නම් කරයි.',
      program: {
        start: '2026-11-20',
        end: '2026-11-20',
        target_en: 'Training officers and one division',
        target_si: 'පුහුණු නිලධාරීන් සහ එක් අංශයක්',
        venue_en: 'MDTU hall, with video link',
        venue_si: 'කළමනාකරණ සංවර්ධන පුහුණු ඒකක ශාලාව, වීඩියෝ සබැඳිය සමඟ',
        participants: 16,
        outcomes_en: 'One practice selected for December.',
        outcomes_si: 'දෙසැම්බර් සඳහා එක් පිළිවෙතක් තෝරා ඇත.',
        metrics: {}
      }
    });

    addArticle({
      email: 'ajith.bandara@mdtu.local',
      category: 'creative',
      status: 'submitted',
      month: 11,
      year: 2026,
      title_en: 'The second sitting',
      title_si: 'දෙවන වාරය',
      excerpt_en: 'A paragraph for the officers who come late to the year.',
      excerpt_si: 'වසරට ප්‍රමාදව එන නිලධාරීන් සඳහා ඡේදයක්.',
      body_en: 'Coming late is not the same as being absent. The second sitting of the leadership clinic should say that on the first morning, before anybody apologises.',
      body_si: 'ප්‍රමාදව ඒම නොපැමිණීම නොවේ. නායකත්ව සායනයේ දෙවන වාරය එය පළමු උදෑසන කිව යුතුය. කිසිවෙකු සමාව ඉල්ලීමට පෙර.'
    });

    addArticle({
      email: 'nimal.perera@mdtu.local',
      category: 'training',
      status: 'draft',
      month: 11,
      year: 2026,
      title_en: 'Notes still being checked',
      title_si: 'තවම පරීක්ෂා වෙමින් පවතින සටහන්',
      excerpt_en: 'A draft, not yet offered to the editor.',
      excerpt_si: 'කෙටුම්පතක්, තවම සංස්කාරකවරයාට ලබා දී නැත.',
      body_en: 'Attendance for the second leadership sitting is not final. This draft will be submitted when the nomination list closes.',
      body_si: 'දෙවන නායකත්ව වාරයේ පැමිණීම තවම අවසන් නැත. නම් කිරීමේ ලැයිස්තුව වැසෙන විට මෙම කෙටුම්පත ඉදිරිපත් කරනු ලැබේ.'
    });

    addArticle({
      email: 'nimal.perera@mdtu.local',
      category: 'training',
      status: 'rejected',
      month: 10,
      year: 2026,
      notes: 'The participant count could not be reconciled with the register. Please attach the signed sheet and resubmit.',
      title_en: 'An unverified headcount',
      title_si: 'තහවුරු නොකළ සංඛ්‍යාවක්',
      excerpt_en: 'Returned to the author.',
      excerpt_si: 'කතුවරයා වෙත ආපසු යවන ලදී.',
      body_en: 'This note claimed sixty participants. The register in the office shows forty-two for that clinic. It should not run until the two numbers agree.',
      body_si: 'මෙම සටහන සහභාගිවන්නන් හැටක් කියා සිටියේය. කාර්යාලයේ ලේඛනය එම සායනය සඳහා හතළිස් දෙදෙනෙකු පෙන්වයි. සංඛ්‍යා දෙක එකඟ වන තුරු එය යා නොහැක.',
      program: {
        start: '2026-10-06',
        end: '2026-10-10',
        target_en: 'Divisional officers',
        target_si: 'ප්‍රාදේශීය නිලධාරීන්',
        venue_en: 'MDTU hall',
        venue_si: 'ඒකක ශාලාව',
        participants: 60,
        outcomes_en: '',
        outcomes_si: '',
        metrics: {}
      }
    });

    db.run(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, detail, created_at)
       VALUES (?, 'seed', 'system', NULL, 'Demonstration issues and staff accounts created', ?)`,
      [users['admin@mdtu.local'], now]
    );
  });
}

module.exports = { seedIfEmpty, CATEGORIES };

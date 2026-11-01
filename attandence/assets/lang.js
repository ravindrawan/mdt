/* Sinhala officer text follows the header language: English, Sinhala, or Tamil. */
const SI_INITIALS = [
    ['ඩබ්ලිව්.', 'W.'], ['එක්ස්.', 'X.'], ['සෙඩ්.', 'Z.'], ['ඩබ්.', 'W.'], ['ඩබ.', 'W.'],
    ['ආර්.', 'R.'], ['එම්.', 'M.'], ['බී.', 'B.'], ['සී.', 'C.'], ['ඩී.', 'D.'],
    ['ඊ.', 'E.'], ['එෆ්.', 'F.'], ['ජී.', 'G.'], ['එච්.', 'H.'], ['අයි.', 'I.'],
    ['ජේ.', 'J.'], ['කේ.', 'K.'], ['එල්.', 'L.'], ['එන්.', 'N.'], ['ඕ.', 'O.'],
    ['පී.', 'P.'], ['කිව්.', 'Q.'], ['එස්.', 'S.'], ['ටී.', 'T.'], ['යූ.', 'U.'],
    ['වී.', 'V.'], ['වයි.', 'Y.'], ['ඒ.', 'A.']
];

/* Long phrases first. [Sinhala, English, Tamil] */
const SI_PHRASES = [
    ['දිස්ත්‍රික් සෞඛ්‍ය සේවා අධ්‍යක්ෂ කාර්යාලය', 'District Director of Health Services Office', 'மாவட்ட சுகாதார சேவைகள் பணிப்பாளர் அலுவலகம்'],
    ['පවුල් සෞඛ්‍ය සේවා නිලධාරීණි', 'Public Health Midwife', 'பொது சுகாதார மருத்துவச்சி'],
    ['පවුල් සෞඛ්‍ය සේවා නිලධාරි', 'Public Health Midwife', 'பொது சுகாதார மருத்துவச்சி'],
    ['කලාප අධ්‍යාපන කාර්යාලය', 'Zonal Education Office', 'வலயக் கல்வி அலுவலகம்'],
    ['කොට්ඨාශ අධ්‍යාපන කාර්යාලය', 'Divisional Education Office', 'கோட்டக் கல்வி அலுவலகம்'],
    ['මහජන සෞඛ්‍ය පරීක්ෂක', 'Public Health Inspector', 'பொது சுகாதார பரிசோதகர்'],
    ['සත්ව සංවර්ධන උපදේශක', 'Livestock Development Instructor', 'கால்நடை அபிவிருத்தி பயிற்றுநர்'],
    ['සමුපකාර සංවර්ධන නිලධාරි', 'Cooperative Development Officer', 'கூட்டுறவு அபிவிருத்தி அதிகாரி'],
    ['කළමනාකරණ සේවා නිලධාරි', 'Management Services Officer', 'முகாமைத்துவ சேவை அதிகாரி'],
    ['මාර්ගස්ථ මගී ප්‍රවාහන අධිකාරිය', 'Road Passenger Transport Authority', 'வீதிப் பயணிகள் போக்குவரத்து அதிகாரசபை'],
    ['ප්‍රධාන ලේකම් කාර්යාලය', "Chief Secretary's Office", 'பிரதம செயலாளர் அலுவலகம்'],
    ['කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය', 'Management Development and Training Unit', 'முகாமை அபிவிருத்தி மற்றும் பயிற்சிப் பிரிவு'],
    ['සෞඛ්‍ය කාර්යය සහායක', 'Health Service Aide', 'சுகாதார சேவை உதவியாளர்'],
    ['සෞඛ්‍ය කාර්ය සහායක', 'Health Service Aide', 'சுகாதார சேவை உதவியாளர்'],
    ['පාසල් කාර්යය සහායක', 'School Aide', 'பாடசாலை உதவியாளர்'],
    ['පාසල් කාර්ය සහායක', 'School Aide', 'பாடசாலை உதவியாளர்'],
    ['කාර්යාල කාර්ය සහයක', 'Office Aide', 'அலுவலகப் பணி உதவியாளர்'],
    ['කෘෂිකර්ම උපදේශක', 'Agricultural Instructor', 'விவசாய பயிற்றுநர்'],
    ['කෘෂි උපදේශක', 'Agricultural Instructor', 'விவசாய பயிற்றுநர்'],
    ['සංවර්ධන නිලධාරි', 'Development Officer', 'அபிவிருத்தி அதிகாரி'],
    ['කළමනාකරණ සහකාර', 'Management Assistant', 'முகாமைத்துவ உதவியாளர்'],
    ['ආයුර්වේද වෛද්‍ය', 'Ayurvedic Medical Officer', 'ஆயுர்வேத வைத்திய அதிகாரி'],
    ['සමාජ සේවා නිලධාරි', 'Social Services Officer', 'சமூக சேவை அதிகாரி'],
    ['පරිපාලන නිලධාරි', 'Administrative Officer', 'நிர்வாக அதிகாரி'],
    ['කාර්මික නිලධාරි', 'Technical Officer', 'தொழில்நுட்ப அதிகாரி'],
    ['තාක්ෂණ නිලධාරි', 'Technological Officer', 'தொழில்நுட்ப அதிகாரி'],
    ['ක්‍රීඩා නිලධාරි', 'Sports Officer', 'விளையாட்டு அதிகாரி'],
    ['හෙද නිලධාරි', 'Nursing Officer', 'நர்சிங் அதிகாரி'],
    ['සෞඛ්‍ය කම්කරු', 'Health Labourer', 'சுகாதாரத் தொழிலாளர்'],
    ['සනීපාරක්ෂක කම්කරු', 'Sanitary Labourer', 'சுகாதாரப் பணியாளர்'],
    ['පාසල් මුරකරු', 'School Watcher', 'பாடசாலைக் காவலர்'],
    ['මාර්ග කම්කරු', 'Road Labourer', 'வீதித் தொழிலாளர்'],
    ['ක්ෂේත්‍ර කම්කරු', 'Field Labourer', 'களத் தொழிலாளர்'],
    ['වැඩ කම්කරු', 'Works Labourer', 'வேலைத் தொழிலாளர்'],
    ['පෙරපාසල් පාලිකා', 'Preschool Teacher', 'பாலர் ஆசிரியை'],
    ['ඖෂධ සංයෝජක', 'Dispenser', 'மருந்து கலவையாளர்'],
    ['පුස්තකාල සහායක', 'Library Assistant', 'நூலக உதவியாளர்'],
    ['මහ නගර සභාව', 'Municipal Council', 'மாநகர சபை'],
    ['නගර සභාව', 'Urban Council', 'நகர சபை'],
    ['ප්‍රාදේශීය සභාව', 'Pradeshiya Sabha', 'பிரதேச சபை'],
    ['මූලික රෝහල', 'Base Hospital', 'அடிப்படை வைத்தியசாலை'],
    ['වයඹ පළාත්', 'North Western Provincial', 'வடமேல் மாகாண'],
    ['වයඹ පළාත', 'North Western Province', 'வடமேல் மாகாணம்']
];

const SI_WORDS = [
    ['සංවර්ධන', 'Development', 'அபிவிருத்தி'],
    ['නිලධාරීණි', 'Officer', 'அதிகாரி'],
    ['නිලධාරී', 'Officer', 'அதிகாரி'],
    ['නිලධාරි', 'Officer', 'அதிகாரி'],
    ['නිළධාරි', 'Officer', 'அதிகாரி'],
    ['කළමනාකරණ', 'Management', 'முகாமைத்துவம்'],
    ['සහකාර', 'Assistant', 'உதவியாளர்'],
    ['සහායක', 'Assistant', 'உதவியாளர்'],
    ['සහයක', 'Aide', 'உதவியாளர்'],
    ['රියදුරු', 'Driver', 'சாரதி'],
    ['කාර්යාලය', 'Office', 'அலுவலகம்'],
    ['කාර්යාල', 'Office', 'அலுவலக'],
    ['කාර්යය', 'Service', 'சேவை'],
    ['කාර්ය', 'Work', 'பணி'],
    ['හෙද', 'Nursing', 'நர்சிங்'],
    ['සෞඛ්‍ය', 'Health', 'சுகாதார'],
    ['කම්කරු', 'Labourer', 'தொழிலாளர்'],
    ['සේවා', 'Service', 'சேவை'],
    ['මුරකරු', 'Watcher', 'காவலர்'],
    ['පවුල්', 'Family', 'குடும்ப'],
    ['පුස්තකාල', 'Library', 'நூலக'],
    ['කණිෂ්ඨ', 'Junior', 'கனிஷ்ட'],
    ['සාමාන්‍ය', 'General', 'பொது'],
    ['පාසල්', 'School', 'பாடசாலை'],
    ['සනීපාරක්ෂක', 'Sanitary', 'சுகாதார'],
    ['ආයුර්වේද', 'Ayurveda', 'ஆயுர்வேத'],
    ['වෛද්‍ය', 'Medical Officer', 'வைத்திய அதிகாரி'],
    ['උපස්ථායිකා', 'Matron', 'மேற்பார்வையாளர்'],
    ['උපස්ථායක', 'Warden', 'மேற்பார்வையாளர்'],
    ['මාර්ගස්ථ', 'Road', 'வீதி'],
    ['මාර්ග', 'Road', 'வீதி'],
    ['ක්ෂේත්‍ර', 'Field', 'கள'],
    ['මහජන', 'Public', 'பொது'],
    ['පරීක්ෂක', 'Inspector', 'பரிசோதகர்'],
    ['කාර්මික', 'Technical', 'தொழில்நுட்ப'],
    ['තාක්ෂණ', 'Technological', 'தொழில்நுட்ப'],
    ['කෘෂිකර්ම', 'Agriculture', 'விவசாய'],
    ['කෘෂි', 'Agriculture', 'விவசாய'],
    ['උපදේශක', 'Instructor', 'பயிற்றுநர்'],
    ['ඖෂධ', 'Drug', 'மருந்து'],
    ['සංයෝජක', 'Dispenser', 'கலவையாளர்'],
    ['සමුපකාර', 'Cooperative', 'கூட்டுறவு'],
    ['සටහන්කරු', 'Time Keeper', 'நேர பதிவாளர்'],
    ['සටහන්කරැ', 'Time Keeper', 'நேர பதிவாளர்'],
    ['වේලා', 'Time', 'நேர'],
    ['පෙරපාසල්', 'Preschool', 'பாலர்'],
    ['පාලිකා', 'Teacher', 'ஆசிரியை'],
    ['නිෂ්පාදන', 'Production', 'உற்பத்தி'],
    ['සත්ව', 'Livestock', 'கால்நடை'],
    ['ක්‍රීඩා', 'Sports', 'விளையாட்டு'],
    ['සමාජ', 'Social', 'சமூக'],
    ['පරිපාලන', 'Administrative', 'நிர்வாக'],
    ['අධ්‍යාපන', 'Education', 'கல்வி'],
    ['කලාප', 'Zonal', 'வலய'],
    ['දෙපාර්තමේන්තුව', 'Department', 'திணைக்களம்'],
    ['පළාත්', 'Provincial', 'மாகாண'],
    ['පළාත', 'Province', 'மாகாணம்'],
    ['ප්‍රාදේශීය', 'Pradeshiya', 'பிரதேச'],
    ['සභාව', 'Sabha', 'சபை'],
    ['මූලික', 'Base', 'அடிப்படை'],
    ['රෝහල', 'Hospital', 'வைத்தியசாலை'],
    ['නගර', 'Urban', 'நகர'],
    ['දිස්ත්‍රික්', 'District', 'மாவட்ட'],
    ['අධ්‍යක්ෂ', 'Director', 'பணிப்பாளர்'],
    ['කොට්ඨාශ', 'Divisional', 'கோட்ட'],
    ['කර්මාන්ත', 'Industrial', 'கைத்தொழில்'],
    ['පරිවාස', 'Probation', 'நன்னடத்தை'],
    ['ළමාරක්ෂක', 'Childcare', 'சிறுவர் பாதுகாப்பு'],
    ['මගී', 'Passenger', 'பயணி'],
    ['ප්‍රවාහන', 'Transport', 'போக்குவரத்து'],
    ['අධිකාරිය', 'Authority', 'அதிகாரசபை'],
    ['ප්‍රධාන', 'Chief', 'பிரதம'],
    ['ලේකම්', 'Secretary', 'செயலாளர்'],
    ['ඒකකය', 'Unit', 'பிரிவு'],
    ['පුහුණු', 'Training', 'பயிற்சி'],
    ['හා', 'and', 'மற்றும்'],
    ['කුරුණෑගල', 'Kurunegala', 'குருநாகல்'],
    ['පුත්තලම', 'Puttalam', 'புத்தளம்'],
    ['කුලියාපිටිය', 'Kuliyapitiya', 'குளியாபிட்டிய'],
    ['හලාවත', 'Halawatha', 'ஹலாவத்தை'],
    ['නිකවැරටිය', 'Nikaweratiya', 'நிக்கவெரட்டிய'],
    ['මහව', 'Mahawa', 'மாவ'],
    ['වාරියපොල', 'Wariyapola', 'வாரியபொல'],
    ['පොල්ගහවෙල', 'Polgahawela', 'பொல்கஹவெல'],
    ['මාවතගම', 'Mawathagama', 'மாவத்தகம'],
    ['ඉබ්බාගමුව', 'Ibbagamuwa', 'இப்பாகமுவ'],
    ['නාත්තන්ඩිය', 'Nattandiya', 'நாத்தண்டிய'],
    ['මාරවිල', 'Marawila', 'மாரவில'],
    ['වයඹ', 'North Western', 'வடமேல்'],
    ['මිය', '', ''],
    ['මයා', '', '']
];

const SI_VOWEL = { 'අ': 'a', 'ආ': 'aa', 'ඇ': 'ae', 'ඈ': 'ae', 'ඉ': 'i', 'ඊ': 'ii', 'උ': 'u', 'ඌ': 'uu', 'ඍ': 'ru', 'ඎ': 'ru', 'එ': 'e', 'ඒ': 'ee', 'ඓ': 'ai', 'ඔ': 'o', 'ඕ': 'oo', 'ඖ': 'au' };
const SI_SIGN = { 'ා': 'aa', 'ැ': 'ae', 'ෑ': 'ae', 'ි': 'i', 'ී': 'ii', 'ු': 'u', 'ූ': 'uu', 'ෘ': 'ru', 'ෙ': 'e', 'ේ': 'ee', 'ෛ': 'ai', 'ො': 'o', 'ෝ': 'oo', 'ෞ': 'au', 'ෲ': 'ru' };
const SI_CONS = {
    'ක': 'k', 'ඛ': 'kh', 'ග': 'g', 'ඝ': 'gh', 'ඞ': 'ng', 'ඟ': 'ng',
    'ච': 'ch', 'ඡ': 'ch', 'ජ': 'j', 'ඣ': 'jh', 'ඤ': 'ny', 'ඥ': 'gn', 'ඦ': 'nj',
    'ට': 't', 'ඨ': 'th', 'ඩ': 'd', 'ඪ': 'dh', 'ණ': 'n', 'ඬ': 'nd',
    'ත': 't', 'ථ': 'th', 'ද': 'd', 'ධ': 'dh', 'න': 'n', 'ඳ': 'nd',
    'ප': 'p', 'ඵ': 'ph', 'බ': 'b', 'භ': 'bh', 'ම': 'm', 'ඹ': 'mb',
    'ය': 'y', 'ර': 'r', 'ල': 'l', 'ව': 'w', 'ශ': 'sh', 'ෂ': 'sh', 'ස': 's', 'හ': 'h', 'ළ': 'l', 'ෆ': 'f'
};
const TA_VOWEL = { 'අ': 'அ', 'ආ': 'ஆ', 'ඇ': 'எ', 'ඈ': 'ஏ', 'ඉ': 'இ', 'ඊ': 'ஈ', 'උ': 'உ', 'ඌ': 'ஊ', 'එ': 'எ', 'ඒ': 'ஏ', 'ඓ': 'ஐ', 'ඔ': 'ஒ', 'ඕ': 'ஓ', 'ඖ': 'ஔ' };
const TA_SIGN = { 'ා': 'ா', 'ැ': 'ெ', 'ෑ': 'ே', 'ි': 'ி', 'ී': 'ீ', 'ු': 'ு', 'ූ': 'ூ', 'ෙ': 'ெ', 'ේ': 'ே', 'ෛ': 'ை', 'ො': 'ொ', 'ෝ': 'ோ', 'ෞ': 'ௌ' };
const TA_CONS = {
    'ක': 'க', 'ඛ': 'க', 'ග': 'க', 'ඝ': 'க', 'ඞ': 'ங', 'ඟ': 'ங',
    'ච': 'ச', 'ඡ': 'ச', 'ජ': 'ஜ', 'ඣ': 'ஜ', 'ඤ': 'ஞ', 'ඥ': 'ஞ', 'ඦ': 'ஞ',
    'ට': 'ட', 'ඨ': 'ட', 'ඩ': 'ட', 'ඪ': 'ட', 'ණ': 'ண', 'ඬ': 'ண',
    'ත': 'த', 'ථ': 'த', 'ද': 'த', 'ධ': 'த', 'න': 'ந', 'ඳ': 'ந',
    'ප': 'ப', 'ඵ': 'ப', 'බ': 'ப', 'භ': 'ப', 'ම': 'ம', 'ඹ': 'ம',
    'ය': 'ய', 'ර': 'ர', 'ල': 'ல', 'ව': 'வ', 'ශ': 'ஷ', 'ෂ': 'ஷ', 'ස': 'ஸ', 'හ': 'ஹ', 'ළ': 'ள', 'ෆ': 'ஃப'
};

function uiLang() {
    const m = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
    if (!m) return 'en';
    const code = decodeURIComponent(m[1]).split('/').filter(Boolean).pop();
    return code === 'si' || code === 'ta' ? code : 'en';
}

function setUiLang(code) {
    const value = '/en/' + (code === 'si' || code === 'ta' ? code : 'en');
    document.cookie = 'googtrans=' + value + ';path=/';
    document.cookie = 'googtrans=' + value + ';path=/;domain=' + location.hostname;
    location.reload();
}

function normSi(s) {
    return String(s || '').replace(/\u200d/g, '');
}

function shortenLatin(s) {
    return s.replace(/aa/g, 'a').replace(/ii/g, 'i').replace(/uu/g, 'u').replace(/ae/g, 'e').replace(/ee/g, 'e').replace(/oo/g, 'o');
}

function transliterate(s, vowels, signs, cons, latin) {
    const chars = [...s];
    let i = 0;
    let out = '';
    while (i < chars.length) {
        const c = chars[i];
        if (vowels[c]) { out += vowels[c]; i++; continue; }
        if (c === 'ං' || c === 'ඃ') { out += latin ? 'n' : 'ம்'; i++; continue; }
        if (!cons[c]) { i++; continue; }
        const base = cons[c];
        let j = i + 1;
        if (chars[j] === '්') {
            j++;
            if (chars[j] === '\u200d') j++;
            if (cons[chars[j]]) {
                if (c === 'ර') { out += latin ? 'r' : 'ர்'; i = j; continue; }
                if (chars[j] === 'ය') { out += latin ? base + 'y' : base + '்ய'; i = j + 1; continue; }
                if (chars[j] === 'ර') { out += latin ? base + 'r' : base + '்ர'; i = j + 1; continue; }
                out += latin ? base : base + '்';
                i = j;
                continue;
            }
            out += latin ? base : base + '்';
            i = j;
            continue;
        }
        if (signs[chars[j]]) {
            out += latin ? base + signs[chars[j]] : base + signs[chars[j]];
            i = j + 1;
            continue;
        }
        out += latin ? base + 'a' : base;
        i++;
    }
    return latin ? shortenLatin(out) : out;
}

function toEnglishName(block) {
    const raw = transliterate(block, SI_VOWEL, SI_SIGN, SI_CONS, true);
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '';
}

function toTamilName(block) {
    return transliterate(block, TA_VOWEL, TA_SIGN, TA_CONS, false);
}

const txCache = new Map();

function tx(value) {
    const s = String(value ?? '');
    const lang = uiLang();
    if (!s || lang === 'si' || !/[\u0D80-\u0DFF]/.test(s)) return s;
    const key = lang + '\n' + s;
    if (txCache.has(key)) return txCache.get(key);
    const clean = normSi(s);
    let text = clean;
    SI_INITIALS.forEach(([from, to]) => { text = text.split(from).join(to); });
    SI_PHRASES.forEach(([from, en, ta]) => {
        const src = normSi(from);
        if (text.includes(src)) text = text.split(src).join(lang === 'ta' ? ta : en);
    });
    const words = new Map(SI_WORDS.map(([si, en, ta]) => [normSi(si), lang === 'ta' ? ta : en]));
    text = text.replace(/[\u0D80-\u0DFF]+/g, block => {
        if (words.has(block)) return words.get(block);
        return lang === 'ta' ? toTamilName(block) : toEnglishName(block);
    });
    text = text.replace(/\s+/g, ' ').replace(/\s+([,./])/g, '$1').trim();
    text = text.replace(/([.])(?=[A-Za-z\u0B80-\u0BFF])/g, '$1 ');
    if (/(?:^|\s)මිය\.?\s*$/.test(clean)) {
        text = text.replace(/\s+$/, '');
        text = lang === 'ta' ? ('திருமதி ' + text).trim() : ('Mrs. ' + text).trim();
    } else if (/(?:^|\s)මයා\.?\s*$/.test(clean)) {
        text = lang === 'ta' ? ('திரு ' + text).trim() : ('Mr. ' + text).trim();
    }
    txCache.set(key, text);
    return text;
}

function applyLetterheadLang() {
    const lang = uiLang();
    document.querySelectorAll('.lh-si, .lh-ta, .lh-en, .lh-en-t').forEach(el => {
        el.classList.add('notranslate');
        const show = (lang === 'si' && el.classList.contains('lh-si'))
            || (lang === 'ta' && el.classList.contains('lh-ta'))
            || (lang === 'en' && (el.classList.contains('lh-en') || el.classList.contains('lh-en-t')));
        el.style.display = show ? '' : 'none';
    });
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
        const on = btn.getAttribute('data-lang-btn') === lang;
        btn.classList.toggle('bg-amber-400', on);
        btn.classList.toggle('text-indigo-950', on);
        btn.classList.toggle('bg-indigo-950', !on);
        btn.classList.toggle('text-amber-200', !on);
    });
}

applyLetterheadLang();
document.addEventListener('DOMContentLoaded', () => {
    applyLetterheadLang();
    let seen = uiLang();
    setInterval(() => {
        const now = uiLang();
        if (now !== seen) location.reload();
    }, 1000);
});

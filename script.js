/* =========================================================
   گپ v1.0.2 — Custom Wallpaper, Spacing Fix & Owner Warn
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const escRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const icon = (n, s = 20) => `<svg width="${s}" height="${s}"><use href="#i-${n}"/></svg>`;
const KEY = 'pisfon_v3', BACKUP_KEY = 'pisfon_backup_auto', VERSION_KEY = 'pisfon_version';
const APP_VERSION = '1.0.2';

// --- Helper for Date & Badges ---
function getPersianDate(ts = Date.now()) {
  try {
    const parts = new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).formatToParts(new Date(ts));
    const month = parts.find(p => p.type === 'month')?.value || '';
    const year = parts.find(p => p.type === 'year')?.value || '';
    return `\u200F${month} ${year}`;
  } catch { return 'نامشخص'; }
}

const BADGES = {
  blue: { src: 'blue-tick.png', title: 'نشان افراد سرشناس' },
  yellow: { src: 'yellow-tick.png', title: 'نشان سازمانی' },
  green: { src: 'green-tick.png', title: 'نشان تجاری' },
  personal: { src: 'personal-tick.png', title: 'نشان شخصی' }
};

const vfHTML = (badgeType, s = 20) => {
  if (!badgeType || !BADGES[badgeType]) return '';
  return `<img class="vf" src="${BADGES[badgeType].src}" width="${s}" height="${s}" alt="${BADGES[badgeType].title}" loading="lazy">`;
};

const nameWithVf = (n, badgeType, s = 20) => `${esc(n)}${vfHTML(badgeType, s)}`;

/* ---------- viewport ---------- */
const setVP = () => {
  document.documentElement.style.setProperty('--vh', innerHeight * .01 + 'px');
  document.documentElement.style.setProperty('--vw', innerWidth * .01 + 'px');
};
setVP(); addEventListener('resize', setVP);
addEventListener('orientationchange', () => setTimeout(setVP, 200));
if (window.visualViewport) {
  const vv = visualViewport;
  const apply = () => document.documentElement.style.setProperty('--kb', (innerHeight - vv.height - vv.offsetTop) + 'px');
  vv.addEventListener('resize', apply); vv.addEventListener('scroll', apply); apply();
}
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
document.addEventListener('contextmenu', e => {
  if (!e.target.closest('#msg-input') && !e.target.closest('.btext') && !e.target.closest('.modal-box input')) e.preventDefault();
});

/* ---------- constants ---------- */
const CHANGELOG = [
  'رفع باگ های گزارش شده',
  'افزایش سرعت برنامه',
  'افزوده شدن دکمه برسی اپدیت',
  'افزوده شدن امکان تنظیم والپیپر چت',
  'اضافه شدن 3 نشان تایید هویت دیگر'
];
const AV_GRADS = [
  ['#ff6b6b','#c92a2a'],['#51cf66','#2b8a3e'],['#ffd43b','#e67700'],['#4dabf7','#1864ab'],
  ['#b197fc','#5f3dc4'],['#ff8cc8','#c2255c'],['#63e6be','#087f5b'],['#ffa94d','#d9480f'],
  ['#845ef7','#5f3dc4'],['#20c997','#0ca678'],['#f783ac','#a61e4d'],['#74c0fc','#1971c2']
];
const AV_EMOJIS = ['😎','🥰','😮','🤓','🧐','🥳','😺','🦊','🐼','🐨','🦁','🐯','🦄','🐧','🐢','🐣','🌴','🌺','🌊','⚡','💎','🔥','⭐','🎜','🚀','🎨','🎵','📷','🍕','☕','🍀','🌿'];
const QUICK_REACT = ['❤️','😂','👍','🔥','😍','😮','😢','🙏'];
const FAKE_EMOJIS = ['❤️','😂','👍','🔥','😍','😮','🙏','💯','🎉','👏','✨','⭐'];
const CHANNEL_COLORS = ['#60a5fa','#a78bfa','#f472b6','#fbbf24','#4ade80','#22d3ee','#fb923c','#c084fc','#f87171','#34d399','#e879f9','#a3e635','#38bdf8','#fb7185','#facc15','#2dd4bf'];
const MEMBER_POOL = [
  {name:'علی',avatar:{type:'emoji',value:'🧑'}},{name:'سارا',avatar:{type:'emoji',value:'👩'}},
  {name:'رضا',avatar:{type:'emoji',value:'👨'}},{name:'مینا',avatar:{type:'emoji',value:'👧'}},
  {name:'حسین',avatar:{type:'emoji',value:'🧔'}},{name:'نگار',avatar:{type:'emoji',value:'👩‍🎨'}},
  {name:'امیر',avatar:{type:'emoji',value:'👨‍💻'}},{name:'مریم',avatar:{type:'emoji',value:'👩‍🦰'}},
  {name:'کاوه',avatar:{type:'emoji',value:'👦'}},{name:'نیلوفر',avatar:{type:'emoji',value:'👩‍🦱'}},
  {name:'بابک',avatar:{type:'emoji',value:'🧑‍🚀'}},{name:'هستی',avatar:{type:'emoji',value:'👩‍🎤'}}
];
const REPLIES = ['باشه 👍','چه جالب!','الان چک می‌کنم','مرسی 🙏','کاملاً موافقم','بعداً حرف می‌زنیم','عالیه!','دقیقاً','ممنون از پیامت','می‌شه بیشتر توضیح بدی؟','حتماً چشم','من هم همین فکر رو می‌کردم','خبر خوبیه!','🤔','😄'];
const AI_SYS = 'تو دستیار هوشمند گپ هستی. جواب‌ها رو کوتاه (حداکثر ۲ خط)، دوستانه، فارسی خودمونی بده.';
const AI_URL = 'https://text.pollinations.ai/';

const EMOJIS = {
  smileys:{name:'شکلک‌ها',icon:'😀',list:['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤗','🤭','🤔','🤨','😐','😑','😶','😏','😒','🙄','😬','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','💩','🤡','👹','👺','👻','👽','👾','🤖']},
  gestures:{name:'اشاره‌ها',icon:'👍',list:['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','👂','👃','🧠','👀','👁️','👅','👄','💋']},
  hearts:{name:'قلب',icon:'❤️',list:['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💌','💋','😍','🥰','😘','💑','💏','💐','🌹','🌷','🌺','🎂','✨','💫','⭐','🌟','🌠','☀️','🌙']},
  animals:{name:'حیوانات',icon:'🐶',list:['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🐙','🐬','🐳','🐟','🦈','🐊','🦓','🦍','🐘','🐪','🦒','🐕','🐈','🐇','🦝','🦔']},
  food:{name:'غذا',icon:'🍔',list:['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🥦','🥒','🌽','🥕','🥔','🥐','🍞','🥖','🧀','🥚','🍳','🥓','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🥗','🍝','🍜','🍲','🍣','🍱','🍤','🍚','🍙','🍢','🍧','🍨','🍦','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','☕','🍵','🥤','🍺','🍻','🍷','🍸']},
  travel:{name:'سفر',icon:'✈️',list:['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚜','🚲','🛵','🏍️','🚨','🚔','🚃','🚄','🚅','🚂','🚆','🚇','🚉','✈️','🛫','🛬','🚀','🛸','🚁','🛶','⛵','🚤','🛳️','🚢','⚓','🚧','🚦','🗺️','🗿','🗽','🗼','🏰','🏯','🎡','🎢','🎠','⛲','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🏕️','⛺','🏠','🏡','🏢','🏬','🏥','🏦','🏨','🏪','🏫','🏛️','⛪','🕌','🕋','🌅','🌄','🌇','🌆','🏙️','🌃','🌌','🌉']},
  activities:{name:'ورزش',icon:'⚽',list:['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🏹','🎣','🤿','🥊','🥋','🎽','🛹','⛸️','🎿','⛷️','🏂','🏋️','🤸','⛹️','🤺','🏌️','🏇','🧘','🏄','🏊','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🎫','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻','🎲','🎯','🎳','🎮','🎰','🧩']},
  objects:{name:'اشیا',icon:'💡',list:['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿','📷','📸','📹','🎥','📞','☎️','📺','📻','🎙️','⏰','⌛','📡','🔋','🔌','💡','🔦','🕯️','💸','💵','💰','💳','💎','🔧','🔨','⚙️','🔫','💣','🔪','🛡️','⚰️','🏺','🔮','📿','💊','💉','🩸','🧬','🦠','🧪','🧹','🧺','🧻','🚽','🚿','🛁','🔑','🚪','🪑','🛋️','🛏️','🧸','🖼️','🛍️','🛒','🎁','🎈','🎀','📦','📬','📮','📜','📃','📄','📊','📈','📉','📅','🗑️','📁','📂','📚','📖','🔖','🔗','📎','📌','📍','✂️','✏️','📝','🔍','🔒','🔓']},
  symbols:{name:'نمادها',icon:'💯',list:['☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⚛️','☢️','☣️','❌','⭕','🛑','⛔','🚫','💯','💢','♨️','❗','❓','⚠️','♻️','✅','💠','🌀','💤','♿','🅿️','🈳','🚹','🚺','🚻','🎦','📶','ℹ️','🔣','🆗','🆒','🆕','🆓','🔟','🔢','▶️','⏸️','⏹️','⏩','⏪','⬅️','➡️','⬆️','⬇️','🔄','🔀','🔁','🎵','🎶','➕','➖','➗','✖️','♾️','💲','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🔈','🔇','🔊','🔔','🔕','📢','💬','💭','♠️','♣️','♥️','♦️','🃏','🕐','🕑','🕒','🕓','🕔','🕕']},
  flags:{name:'پرچم‌ها',icon:'🏁',list:['🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🇮🇷','🇺🇸','🇬🇧','🇩🇪','🇫🇷','🇮🇹','🇯🇵','🇨🇳','🇷🇺','🇹🇷','🇸🇦','🇦🇪','🇪🇬','🇮🇶','🇸🇾','🇱🇧','🇯🇴','🇰🇼','🇶🇦','🇧🇭','🇴🇲','🇾🇪','🇵🇰','🇦🇫','🇮🇳','🇧🇩','🇲🇾','🇮🇩','🇹🇭','🇻🇳','🇰🇷','🇰🇵','🇦🇺','🇳🇿','🇨🇦','🇲🇽','🇧🇷','🇦🇷','🇨🇱','🇨🇴','🇵🇪','🇪🇸','🇵🇹','🇳🇱','🇧🇪','🇨🇭','🇦🇹','🇸🇪','🇳🇴','🇩🇰','🇫🇮','🇮🇸','🇮🇪','🇵🇱','🇺🇦','🇨🇿','🇬🇷','🇭🇺','🇷🇴','🇧🇬','🇭🇷','🇷🇸']}
};

/* ---------- state ---------- */
const emptyAccount = () => ({
  id: 'acc_' + Date.now() + Math.random().toString(36).slice(2, 6),
  name: 'من', username: '', phone: '',
  avatar: { type: 'gradient', value: 3 },
  coverPhoto: null, badgeType: null, joinedDate: getPersianDate(), chats: [], contacts: []
});

const emptyState = () => ({
  me: emptyAccount(),
  accounts: [],
  _globalDirectory: [],
  bannedUsers: [],
  globalWarner: null,
  theme: 'dark',
  settings: { autoReply: true, enterToSend: true, sounds: false, aiMode: true, notifications: true, autoBackup: true },
  lastBackupAt: 0
});

function normalizeAccount(acc) {
  if (!acc.id) acc.id = 'acc_' + Date.now() + Math.random().toString(36).slice(2, 6);
  if (acc.verified && !acc.badgeType) acc.badgeType = 'blue';
  if (!acc.badgeType) acc.badgeType = null;
  if (!acc.joinedDate) acc.joinedDate = getPersianDate();
  if (!Array.isArray(acc.chats)) acc.chats = [];
  if (!Array.isArray(acc.contacts)) acc.contacts = [];
  if (acc.coverPhoto === undefined) acc.coverPhoto = null;
  return acc;
}

function normalizeChat(c, i) {
  if (!c.avatar) c.avatar = {type:'gradient',value:i % AV_GRADS.length};
  if (c.verified && !c.badgeType) c.badgeType = 'blue';
  if (!c.badgeType) c.badgeType = null;
  if (!c.joinedDate) c.joinedDate = getPersianDate(c.createdAt || Date.now());
  if (typeof c.username !== 'string') c.username = '';
  if (typeof c.isPublic !== 'boolean') c.isPublic = c.type === 'channel';
  if (typeof c.draft !== 'string') c.draft = '';
  if (typeof c.description !== 'string') c.description = '';
  if (c.coverPhoto === undefined) c.coverPhoto = null;
  if (c.wallpaper === undefined) c.wallpaper = null;
  if (c.owner === undefined) c.owner = null;
  if (!Array.isArray(c.admins)) c.admins = [];
  if (!c.permissions) c.permissions = {sendMessages:'all',editInfo:'all'};
  if (typeof c.joined !== 'boolean') c.joined = true;
  if (!Array.isArray(c.messages)) c.messages = [];
  if ((c.type === 'group' || c.type === 'channel') && typeof c.members !== 'number') c.members = c.type === 'group' ? 1 : 0;
  if (c.type === 'group' && Array.isArray(c.membersList) && c.membersList.length > c.members) c.members = c.membersList.length;
  if (c.type === 'group' && !Array.isArray(c.membersList)) c.membersList = [];
  if (typeof c.warner !== 'string') c.warner = '';
  c.messages.forEach(m => {
    if (!m.reactions) m.reactions = {};
    if (typeof m.deleted !== 'boolean') m.deleted = false;
    if (typeof m.editedForAll !== 'boolean') m.editedForAll = false;
    if (typeof m.seenCount !== 'number') m.seenCount = 0;
    if (typeof m.seenTarget !== 'number') m.seenTarget = 0;
    if (m.linkPreview === undefined) m.linkPreview = null;
    if (!m._fakeReactionCounts) m._fakeReactionCounts = {};
  });
  return c;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.chats) && !s.me) return null;
    if (!s.me) s.me = emptyAccount();
    if (!s.accounts) s.accounts = [];
    if (!s.me.chats && Array.isArray(s.chats)) s.me.chats = s.chats;
    if (!s.me.contacts && Array.isArray(s.contacts)) s.me.contacts = s.contacts;
    if (!s._globalDirectory && Array.isArray(s.directory)) s._globalDirectory = s.directory;
    delete s.chats; delete s.contacts; delete s.directory;
    s.me = normalizeAccount(s.me);
    s.accounts = s.accounts.map(normalizeAccount);
    if (!Array.isArray(s._globalDirectory)) s._globalDirectory = [];
    if (!Array.isArray(s.bannedUsers)) s.bannedUsers = [];
    if (s.globalWarner === undefined) s.globalWarner = null;
    s.settings = Object.assign(emptyState().settings, s.settings || {});
    if (s.theme !== 'light' && s.theme !== 'dark') s.theme = 'dark';
    if (typeof s.lastBackupAt !== 'number') s.lastBackupAt = 0;
    s.me.chats = s.me.chats.map(normalizeChat);
    s.accounts.forEach(acc => acc.chats = acc.chats.map(normalizeChat));
    s._globalDirectory = s._globalDirectory.map(normalizeChat);
    return s;
  } catch { return null; }
}

let state = load() || emptyState();

Object.defineProperty(state, 'chats', { get() { return this.me.chats || (this.me.chats = []); }, set(v) { this.me.chats = v; } });
Object.defineProperty(state, 'contacts', { get() { return this.me.contacts || (this.me.contacts = []); }, set(v) { this.me.contacts = v; } });
Object.defineProperty(state, 'directory', { get() { return this._globalDirectory || (this._globalDirectory = []); }, set(v) { this._globalDirectory = v; } });

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const s = JSON.stringify(state);
      localStorage.setItem(KEY, s);
      if (state.settings.autoBackup) try { localStorage.setItem(BACKUP_KEY, s); } catch {}
    } catch {}
  }, 150);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme || 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = 'transparent'; // <--- شفافیت نوتیفیکیشن سنتر
}
applyTheme();

/* ---------- helpers ---------- */
function nameColors(name) {
  const n = String(name || 'x');
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return [`hsl(${hue},68%,55%)`, `hsl(${(hue+32)%360},62%,42%)`];
}
function initials(name) {
  const t = (name || '').trim();
  if (!t) return '?';
  const p = t.split(/\s+/);
  return p.length === 1 ? p[0][0] : p[0][0] + p[1][0];
}
function avatarHTML(e, size = 54) {
  const av = e.avatar || {type:'gradient',value:0};
  const dim = (size === 38 || size === 40) ? ' sm' : (size >= 86 ? ' big' : '');
  const cls = `avatar${dim}`;
  if (av.type === 'image') return `<div class="${cls}" style="background-image:url(&quot;${esc(av.value)}&quot;);background-size:cover;background-position:center"></div>`;
  if (av.type === 'gradient') {
    const g = AV_GRADS[(av.value||0) % AV_GRADS.length];
    return `<div class="${cls}" style="background:linear-gradient(135deg,${g[0]},${g[1]})">${esc(initials(e.name))}</div>`;
  }
  if (av.type === 'emoji') {
    const [c1,c2] = nameColors(e.name);
    return `<div class="${cls}" style="background:linear-gradient(135deg,${c1},${c2})">${av.value}</div>`;
  }
  const [c1,c2] = nameColors(e.name);
  return `<div class="${cls}" style="background:linear-gradient(135deg,${c1},${c2})">${esc(initials(e.name))}</div>`;
}
function avatarBgStyle(e) {
  const av = e.avatar || {type:'gradient',value:0};
  if (av.type === 'image') return `background-image:url(&quot;${esc(av.value)}&quot;);background-size:cover;background-position:center`;
  if (av.type === 'gradient') {
    const g = AV_GRADS[(av.value||0) % AV_GRADS.length];
    return `background:linear-gradient(135deg,${g[0]},${g[1]})`;
  }
  const [c1,c2] = nameColors(e.name);
  return `background:linear-gradient(135deg,${c1},${c2})`;
}
function avatarContent(e) {
  const av = e.avatar || {type:'gradient',value:0};
  if (av.type === 'emoji') return av.value;
  if (av.type === 'image') return '';
  return esc(initials(e.name));
}

function renderTopProfile() {
  const el = $('#top-profile-avatar');
  if (!el || !state.me) return;
  const me = state.me;
  const av = me.avatar || {type:'gradient',value:0};
  el.textContent = ''; el.style.background = ''; el.style.backgroundImage = '';
  if (av.type === 'image' && av.value) {
    el.style.backgroundImage = `url("${av.value}")`;
    el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center';
  } else if (av.type === 'emoji' && av.value) {
    const [c1,c2] = nameColors(me.name);
    el.style.background = `linear-gradient(135deg,${c1},${c2})`;
    el.textContent = av.value;
  } else {
    const idx = (av.type === 'gradient' && typeof av.value === 'number') ? av.value : 0;
    const g = AV_GRADS[idx % AV_GRADS.length];
    el.style.background = `linear-gradient(135deg,${g[0]},${g[1]})`;
    el.textContent = initials(me.name);
  }
}

const fmtTime = ts => new Date(ts).toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit'});
const dayKey = ts => new Date(ts).toDateString();
function fmtDay(ts) {
  const d = new Date(ts), t = new Date();
  const same = (a,b) => a.toDateString() === b.toDateString();
  if (same(d,t)) return 'امروز';
  const y = new Date(t); y.setDate(y.getDate()-1);
  if (same(d,y)) return 'دیروز';
  return d.toLocaleDateString('fa-IR', {day:'numeric',month:'long'});
}
function fmtListTime(ts) {
  const d = new Date(ts), t = new Date();
  if (d.toDateString() === t.toDateString()) return fmtTime(ts);
  const y = new Date(t); y.setDate(y.getDate()-1);
  if (d.toDateString() === y.toDateString()) return 'دیروز';
  return d.toLocaleDateString('fa-IR', {day:'numeric',month:'numeric'});
}
const fmtDur = s => { const t = Math.max(0, Math.floor(s)); return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`; };
const fmtBytes = b => b < 1024 ? b+' B' : b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB';
const fmtNum = n => n.toLocaleString('fa-IR');

let toastTimer;
function toast(t, type = 'info') {
  const el = $('#toast');
  if (!el) return;
  el.className = `show ${type}`;
  el.textContent = t;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.className = '', 2500);
}

const getChat = id => state.chats.find(c => c.id === id);

function getChannelColor(chat) {
  if (!chat._nameColor || !CHANNEL_COLORS.includes(chat._nameColor)) {
    chat._nameColor = CHANNEL_COLORS[Math.floor(Math.random() * CHANNEL_COLORS.length)];
    save();
  }
  return chat._nameColor;
}

const lastMsg = c => c.messages[c.messages.length-1];
const lastTs = c => (lastMsg(c) ? lastMsg(c).ts : c.createdAt || 0);

function chatStatus(c) {
  if (c.typing) return c.type === 'ai' ? 'در حال تایپ…' : 'در حال نوشتن…';
  if (c.type === 'saved') return 'یادداشت‌های شخصی';
  if (c.type === 'ai') return navigator.onLine ? 'آنلاین — هوش مصنوعی' : 'آفلاین — پاسخ آماده';
  if (c.type === 'group') return (c.members||1).toLocaleString('fa-IR') + ' عضو';
  if (c.type === 'channel') return (c.members||0).toLocaleString('fa-IR') + ' عضو';
  return c.online ? 'آنلاین' : (c.lastSeen || 'آخرین بازدید به تازگی');
}
function previewText(c) {
  const m = lastMsg(c);
  if (!m) return 'بدون پیام';
  let t;
  if (m.deleted) t = '🚫 پیام حذف شد';
  else if (m.type === 'voice') t = '🎤 پیام صوتی';
  else if (m.type === 'photo') t = '🖼 عکس';
  else if (m.type === 'file') t = '📎 فایل';
  else if (m.type === 'poll') t = '📊 نظرسنجی';
  else if (m.type === 'location') t = '📍 موقعیت';
  else t = m.text;
  if (c.type === 'group' && !m.out && m.sender) t = m.sender + ': ' + t;
  else if (m.out) t = 'شما: ' + t;
  return t;
}

/* ---------- username ---------- */
const validUser = u => u && typeof u === 'string' && u.length >= 3 && u.length <= 32 && /^[a-zA-Z0-9][a-zA-Z0-9_\-=+]*$/.test(u);
const normUser = u => String(u||'').trim().replace(/\s+/g,'').toLowerCase();
function userTaken(u, exKind = null, exId = null) {
  const low = normUser(u);
  if (!low) return false;
  if (exKind !== 'me' && state.me?.username && normUser(state.me.username) === low) return true;
  if (state.accounts?.some(a => normUser(a.username) === low)) return true;
  if (state.chats.some(c => c.id !== exId && c.username && normUser(c.username) === low)) return true;
  if ((state.directory||[]).some(d => d.username && normUser(d.username) === low)) return true;
  return false;
}
function findByUsername(u) {
  const low = normUser(u);
  if (!low) return null;
  const inDir = (state.directory||[]).find(d => d.username && normUser(d.username) === low);
  if (inDir) return {entity:inDir, source:'directory'};
  const inChats = state.chats.find(c => c.username && normUser(c.username) === low);
  if (inChats) return {entity:inChats, source:'chat'};
  const inAcc = state.accounts.find(a => a.username && normUser(a.username) === low);
  if (inAcc) {
    return { entity: { name: inAcc.name, username: inAcc.username, avatar: inAcc.avatar, coverPhoto: inAcc.coverPhoto, badgeType: inAcc.badgeType, type: 'private', members: 0 }, source: 'local_account' };
  }
  return null;
}

/* ---------- link / mention ---------- */
const URL_RE = /(https?:\/\/[^\s<>"']+)/gi;
const MENTION_RE = /@([a-zA-Z0-9][a-zA-Z0-9_\-=+]{2,31})/g;
const firstUrl = t => { if (!t) return null; const m = t.match(URL_RE); return m ? m[0] : null; };
function domainOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; } }
function buildLinkPreview(url) {
  const domain = domainOf(url);
  return domain ? {url, domain, favicon:`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`} : null;
}
function renderRichText(text) {
  if (!text) return '';
  let out = esc(text);
  out = out.replace(URL_RE, m => `<a href="${m}" target="_blank" rel="noopener" style="color:#6c6c6e;text-decoration:underline">${m}</a>`);
  out = out.replace(MENTION_RE, (f, n) => `<a class="mention-link" data-mention="${esc(n)}">@${esc(n)}</a>`);
  return out;
}
function firstMention(text) {
  if (!text) return null;
  MENTION_RE.lastIndex = 0;
  const m = text.match(MENTION_RE);
  MENTION_RE.lastIndex = 0;
  if (!m || !m.length) return null;
  const match = m[0].match(/@([a-zA-Z0-9][a-zA-Z0-9_\-=+]{2,31})/);
  return match ? match[1] : null;
}
function mentionPreview(username) {
  const f = findByUsername(username);
  if (!f) return null;
  const e = f.entity;
  return {username:e.username, name:e.name, badgeType:e.badgeType, type:e.type, members:e.members||0, source:f.source, id:e.id};
}

/* ---------- AI ---------- */
async function fetchAI(userMsg, history = [], sys = null) {
  if (!navigator.onLine) return null;
  try {
    let prompt = userMsg;
    if (history.length) {
      const ctx = history.slice(-6).map(m => (m.out ? 'کاربر: ' : (m.sender||'دستیار')+': ') + m.text).join('\n');
      prompt = `تاریخچه:\n${ctx}\n\nپیام جدید: ${userMsg}`;
    }
    const url = AI_URL + encodeURIComponent(prompt) + '?model=openai&system=' + encodeURIComponent(sys || AI_SYS);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(url, {signal:ctrl.signal});
    clearTimeout(to);
    if (!res.ok) return null;
    let txt = await res.text();
    txt = (txt||'').trim().replace(/^(دستیار:|Assistant:)\s*/i,'').trim();
    return txt || null;
  } catch { return null; }
}

/* ---------- Local Sync ---------- */
function syncMessageToTargetAccount(targetUsername, messageData, senderInfo) {
  if (!targetUsername) return;
  const targetAcc = state.accounts.find(a => normUser(a.username) === normUser(targetUsername));
  if (!targetAcc) return;
  if (!targetAcc.chats) targetAcc.chats = [];
  let targetChat = targetAcc.chats.find(c => (c.username && normUser(c.username) === normUser(senderInfo.username)) || c.name === senderInfo.name);
  if (!targetChat) {
    targetChat = { id: rid(), name: senderInfo.name, username: senderInfo.username, type: 'private', avatar: senderInfo.avatar, coverPhoto: senderInfo.coverPhoto, badgeType: senderInfo.badgeType, unread: 1, pinned: false, muted: false, draft: '', messages: [], createdAt: Date.now(), joined: true };
    targetAcc.chats.push(targetChat);
  } else {
    targetChat.unread = (targetChat.unread || 0) + 1;
  }
  targetChat.messages.push(Object.assign({}, messageData, { out: false, status: 'read' }));
  save();
}

function findOrCreatePrivateChatWithEntity(account, entity) {
  if (!account.chats) account.chats = [];
  let chat = account.chats.find(c =>
    (entity.username && c.username && normUser(c.username) === normUser(entity.username)) ||
    (!entity.username && c.name === entity.name)
  );
  if (!chat) {
    chat = {
      id: rid(),
      name: entity.name,
      username: entity.username || '',
      type: 'private',
      avatar: entity.avatar,
      coverPhoto: entity.coverPhoto || null,
      badgeType: entity.badgeType || null,
      unread: 0,
      pinned: false,
      muted: false,
      draft: '',
      messages: [],
      createdAt: Date.now(),
      joined: true
    };
    account.chats.push(chat);
  }
  return chat;
}

function isWarnerChat(chat) {
  if (!state.globalWarner || !chat) return false;
  return (chat.username && state.globalWarner.username && normUser(chat.username) === normUser(state.globalWarner.username)) ||
         (!chat.username && state.globalWarner.name === chat.name);
}

/* ---------- render: chat list ---------- */
let chatFilter = 'all';
let searchDebounce;

function renderChatList() {
  const q = ($('#search-input')?.value || '').trim();
  const ql = q.toLowerCase();
  const box = $('#chat-list');
  if (!box) return;
  const cb = $('#search-clear');
  if (cb) cb.classList.toggle('show', q.length > 0);

  if (chatFilter === 'discover') {
    const dirs = (state.directory||[]).filter(d => !q || d.name.toLowerCase().includes(ql) || (d.username||'').toLowerCase().includes(ql));
    if (!dirs.length) {
      box.innerHTML = `<div class="empty">${icon('search',48)}<div class="ttl">چیزی برای کشف نیست</div></div>`;
      return;
    }
    box.innerHTML = `<div class="search-section-title">کانال‌ها و گروه‌ها</div>` + dirs.map(d => `
      <div class="chat-item" data-directory="${d.id}" data-chat-type="${d.type}">
        ${avatarHTML(d)}
        <div class="ci-body">
          <div class="ci-top"><span class="ci-name">${nameWithVf(d.name, d.badgeType, 20)}</span>
          <span class="ci-time" style="font-size:11px">${d.type === 'channel' ? 'کانال' : 'گروه'}</span></div>
          <div class="ci-bot"><span class="ci-prev">${esc(d.description || (d.members ? d.members.toLocaleString('fa-IR')+' عضو' : ''))}</span></div>
        </div>
      </div>`).join('');
    return;
  }

  let list = state.chats.filter(c => !q || c.name.toLowerCase().includes(ql));
  if (chatFilter !== 'all') {
    list = list.filter(c => ({private:c.type==='private',group:c.type==='group',channel:c.type==='channel',ai:c.type==='ai',saved:c.type==='saved'}[chatFilter]));
  }
  list = list.slice().sort((a,b) => (b.pinned - a.pinned) || (lastTs(b) - lastTs(a)));

  let msgRes = '';
  if (q.length >= 2) {
    const results = [];
    state.chats.forEach(c => c.messages.forEach(m => {
      if (m.type === 'text' && m.text && !m.deleted && m.text.toLowerCase().includes(ql)) results.push({chat:c, msg:m});
    }));
    results.sort((a,b) => b.msg.ts - a.msg.ts);
    const top = results.slice(0, 30);
    if (top.length) {
      msgRes = `<div class="search-section-title">پیام‌ها (${results.length.toLocaleString('fa-IR')})</div>` + top.map(r => {
        const t = r.msg.text;
        const idx = t.toLowerCase().indexOf(ql);
        const before = esc(t.slice(Math.max(0,idx-30), idx));
        const match = esc(t.slice(idx, idx+q.length));
        const after = esc(t.slice(idx+q.length, idx+q.length+60));
        const sender = r.msg.out ? 'شما' : (r.msg.sender || r.chat.name);
        return `<div class="msg-search-result" data-result-chat="${r.chat.id}" data-result-msg="${r.msg.id}">
          ${avatarHTML(r.chat, 38)}
          <div class="msr-body">
            <div class="msr-name">${esc(r.chat.name)} — <span style="color:var(--text-3);font-weight:500">${esc(sender)}</span></div>
            <div class="msr-text">…${before}<mark>${match}</mark>${after}…</div>
          </div>
        </div>`;
      }).join('');
    }
  }

  let html;
  if (!list.length && !msgRes) {
    html = state.chats.length
      ? `<div class="empty">${icon('search',48)}<div class="ttl">چیزی پیدا نشد</div></div>`
      : `<div class="empty">${icon('chat-outline',56)}<div class="ttl">هنوز گفتگویی نداری</div>برای شروع روی + بزن</div>`;
  } else {
    html = list.map(c => {
      const m = lastMsg(c);
      const badge = c.unread > 0 ? `<span class="badge ${c.muted?'muted':''}">${c.unread.toLocaleString('fa-IR')}</span>` : '';
      const pin = c.pinned ? `<span class="pin">${icon('pin',14)}</span>` : '';
      const ticks = m && m.out ? `<span class="ticks">${icon(m.status==='read'?'double-check':'check',15)}</span>` : '';
      return `<div class="chat-item" data-id="${c.id}" data-chat-type="${c.type}">
        ${avatarHTML(c)}
        <div class="ci-body">
          <div class="ci-top"><span class="ci-name">${nameWithVf(c.name, c.badgeType, 20)}</span>
          <span class="ci-time">${m?ticks:''}${m?fmtListTime(lastTs(c)):''}</span></div>
          <div class="ci-bot"><span class="ci-prev">${esc(previewText(c))}</span>${pin}${badge}</div>
        </div>
      </div>`;
    }).join('');
  }
  box.innerHTML = msgRes + html;
}

function renderContacts() {
  const box = $('#contacts-list');
  if (!box) return;
  if (!state.contacts.length) {
    box.innerHTML = `<div class="empty">${icon('users',56)}<div class="ttl">مخاطبین خالی است</div>از دکمه + پایین یک چت بساز</div>`;
    return;
  }
  box.innerHTML = state.contacts.map(c => `
    <div class="chat-item" data-contact="${c.id}">
      ${avatarHTML(c)}
      <div class="ci-body"><div class="ci-top"><span class="ci-name">${nameWithVf(c.name, c.badgeType, 20)}</span></div>
      <div class="ci-bot"><span class="ci-prev">برای شروع گفتگو لمس کن</span></div></div>
    </div>`).join('');
}

/* ---------- render: settings ---------- */
function renderSettings() {
  const s = state.settings, me = state.me;
  const themeIcon = state.theme === 'light' ? 'sun' : 'moon';
  const themeLabel = state.theme === 'light' ? 'روشن' : 'تاریک';
  const backupAgo = state.lastBackupAt ? `آخرین پشتیبان: ${fmtListTime(state.lastBackupAt)}` : 'هنوز پشتیبانی نگرفتی';
  const el = $('#settings-body');
  if (!el) return;
  el.innerHTML = `
    <div class="profile-card ${me.coverPhoto ? 'has-cover' : ''}">
      <div class="pc-cover ${me.coverPhoto ? '' : 'empty'}" id="my-cover-btn" style="${me.coverPhoto ? `background-image:url(&quot;${esc(me.coverPhoto)}&quot;)` : ''}">
        ${me.coverPhoto ? '' : `${icon('camera', 22)} افزودن کاور`}
      </div>
      <button class="pc-edit-btn" id="btn-edit-profile">${icon('edit',14)} ویرایش</button>
      <div class="avatar big" id="my-avatar-btn" style="${avatarBgStyle(me)}">${avatarContent(me)}</div>
      <div style="text-align:center">
        <div class="pn">${nameWithVf(me.name, me.badgeType, 26)}</div>
        <div class="pp" dir="ltr" style="text-align:center">${me.phone ? esc(me.phone) : 'شماره ثبت نشده'}</div>
        ${me.username ? `<div class="info-username" style="margin-top:8px">@${esc(me.username)}</div>` : ''}
      </div>
    </div>
    <div class="section-title">حساب کاربری</div>
    <div class="group">
      <div class="row" data-act="edit-name"><span class="r-icon">${icon('edit',20)}</span><span class="r-text">نام</span><span class="r-val">${esc(me.name)}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-act="edit-username"><span class="r-icon" style="background:linear-gradient(180deg,#a78bfa,#8b5cf6)">${icon('user',20)}</span><span class="r-text">آیدی من</span><span class="r-val">${me.username ? '@'+esc(me.username) : 'تنظیم نشده'}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-act="edit-phone"><span class="r-icon">${icon('phone',20)}</span><span class="r-text">شماره تلفن</span><span class="r-val" dir="ltr">${me.phone ? esc(me.phone) : '—'}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-act="set-badge"><span class="r-icon" style="background:#6c6c6e">${icon('verified',20)}</span><span class="r-text">نشان تایید</span><span class="r-val">${me.badgeType ? BADGES[me.badgeType].title : 'بدون نشان'}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-act="edit-joined"><span class="r-icon">${icon('chart',20)}</span><span class="r-text">تاریخ عضویت</span><span class="r-val">${esc(me.joinedDate || getPersianDate())}</span></div>
    </div>
    <div class="section-title">مدیریت اکانت‌ها</div>
    <div class="group" style="padding: 14px;">
       <div id="accounts-list-container"></div>
       <button class="btn-primary" style="width:100%; padding:12px; border-radius:12px; margin-top:8px; background:#6c6c6e; color:#fff; font-weight:700;" onclick="openAddAccountModal()">+ افزودن اکانت جدید</button>
    </div>
    <div class="section-title">ظاهر و برنامه</div>
    <div class="group">
      <div class="row" data-act="toggle-theme"><span class="r-icon">${icon(themeIcon,20)}</span><span class="r-text">تم ${themeLabel}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-act="check-update"><span class="r-icon" style="background:#3b82f6">${icon('refresh',20)}</span><span class="r-text">بررسی بروزرسانی</span><span class="r-val">v${APP_VERSION}</span><span class="chev">${icon('chevron',18)}</span></div>
    </div>
    <div class="section-title">هوش مصنوعی</div>
    <div class="group">
      <div class="row"><span class="r-icon purple">${icon('sparkle',20)}</span><span class="r-text">پاسخ هوشمند</span><label class="switch purple"><input type="checkbox" data-set="aiMode" ${s.aiMode?'checked':''}><span class="sl"></span></label></div>
    </div>
    <div class="section-title">رفتار</div>
    <div class="group">
      <div class="row"><span class="r-icon">${icon('chat-outline',20)}</span><span class="r-text">پاسخ خودکار</span><label class="switch"><input type="checkbox" data-set="autoReply" ${s.autoReply?'checked':''}><span class="sl"></span></label></div>
      <div class="row"><span class="r-icon">${icon('bell',20)}</span><span class="r-text">نوتیفیکیشن</span><label class="switch"><input type="checkbox" data-set="notifications" ${s.notifications?'checked':''}><span class="sl"></span></label></div>
      <div class="row"><span class="r-icon">${icon('bell',20)}</span><span class="r-text">صدا</span><label class="switch"><input type="checkbox" data-set="sounds" ${s.sounds?'checked':''}><span class="sl"></span></label></div>
    </div>
    <div class="section-title">پشتیبان‌گیری</div>
    <div class="group">
      <div class="row"><span class="r-icon" style="background:#22c55e">${icon('save',20)}</span><span class="r-text">پشتیبان‌گیری خودکار</span><label class="switch"><input type="checkbox" data-set="autoBackup" ${s.autoBackup?'checked':''}><span class="sl"></span></label></div>
      <div class="row" data-act="export"><span class="r-icon">${icon('save',20)}</span><span class="r-text">دانلود پشتیبان الان</span><span class="r-val" style="font-size:11.5px">${esc(backupAgo)}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-act="import"><span class="r-icon">${icon('upload',20)}</span><span class="r-text">بازیابی از فایل</span><span class="chev">${icon('chevron',18)}</span></div>
    </div>
    <div class="group">
      <div class="row" data-act="reset"><span class="r-icon" style="background:#e53935">${icon('trash',20)}</span><span class="r-text" style="color:var(--red)">پاک کردن همه داده‌ها</span></div>
    </div>
    <div class="empty" style="padding:20px 40px 40px;font-size:12px;opacity:.55">گپ نسخه ${APP_VERSION} — حجم: ${(JSON.stringify(state).length/1024).toFixed(1)}KB</div>
  `;
  renderAccountsList();
  renderTopProfile();
}

/* ---------- MULTI-ACCOUNT & MODERATION ---------- */
function renderAccountsList() {
  const box = $('#accounts-list-container');
  if (!box) return;
  let html = `
    <div class="account-card active">
      <div class="account-info-wrap">
        ${avatarHTML(state.me, 40).replace('class="avatar', 'class="account-avatar-sm avatar')}
        <div>
          <div class="account-name-sm">${esc(state.me.name)} ${vfHTML(state.me.badgeType, 16)}</div>
          <div class="account-handle-sm">${state.me.username ? '@'+state.me.username : 'بدون آیدی'}</div>
        </div>
      </div>
      <span class="btn-active-label">فعال</span>
    </div>
  `;
  state.accounts.forEach(acc => {
    html += `
      <div class="account-card">
        <div class="account-info-wrap">
          ${avatarHTML(acc, 40).replace('class="avatar', 'class="account-avatar-sm avatar')}
          <div>
            <div class="account-name-sm">${esc(acc.name)} ${vfHTML(acc.badgeType, 16)}</div>
            <div class="account-handle-sm">${acc.username ? '@'+acc.username : 'بدون آیدی'}</div>
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn-switch-acc" onclick="switchAccount('${acc.id}')">تغییر</button>
          <button class="btn-delete-acc" onclick="deleteAccount('${acc.id}')" title="حذف اکانت" style="background:rgba(239,68,68,.12); color:#ef4444; padding:6px 10px; border-radius:10px; border:1px solid rgba(239,68,68,.3);">${icon('trash',16)}</button>
        </div>
      </div>
    `;
  });
  box.innerHTML = html;
}

function deleteAccount(accId) {
  showConfirm('حذف اکانت', 'آیا مطمئن هستید که می‌خواهید این اکانت را برای همیشه حذف کنید؟ تمام پیام‌ها و مخاطبین آن حذف خواهند شد.', () => {
    state.accounts = state.accounts.filter(a => a.id !== accId);
    save();
    renderSettings();
    renderChatList();
    renderContacts();
    toast('اکانت با موفقیت حذف شد', 'success');
  });
}

function switchAccount(targetId) {
  if (!targetId) { toast('اکانت نامعتبر است', 'error'); return; }
  if (targetId === state.me.id) return;
  const targetIdx = state.accounts.findIndex(a => a.id === targetId);
  if (targetIdx === -1) { toast('اکانت پیدا نشد', 'error'); return; }
  const currentUser = state.me;
  const newUser = state.accounts[targetIdx];
  state.accounts[targetIdx] = currentUser;
  state.me = newUser;
  if (!Array.isArray(state.me.chats)) state.me.chats = [];
  if (!Array.isArray(state.me.contacts)) state.me.contacts = [];
  save(); renderSettings(); renderChatList(); renderContacts(); renderTopProfile();
  switchTab('chats');
  toast('اکانت تغییر کرد ✓', 'success');
}

function openAddAccountModal() {
  $('#new-acc-name').value = '';
  $('#new-acc-username').value = '';
  $('#add-account-modal').classList.add('show');
}

$('#btn-save-new-acc').addEventListener('click', () => {
  const name = $('#new-acc-name').value.trim();
  const username = $('#new-acc-username').value.trim().replace(/@/g, '');
  if (!name) { toast('نام نمی‌تواند خالی باشد', 'error'); return; }
  if (username && userTaken(username, 'me')) { toast('این آیدی قبلا گرفته شده', 'error'); return; }
  const newAcc = emptyAccount();
  newAcc.name = name;
  newAcc.username = username;
  newAcc.joinedDate = getPersianDate();
  newAcc.avatar = { type: 'gradient', value: Math.floor(Math.random() * AV_GRADS.length) };
  state.accounts.push(state.me);
  state.me = newAcc;
  save(); renderSettings(); renderChatList(); renderContacts(); renderTopProfile();
  switchTab('chats');
  $('#add-account-modal').classList.remove('show');
  toast('اکانت جدید ساخته شد ✓', 'success');
});

$('#btn-cancel-add-acc').addEventListener('click', () => $('#add-account-modal').classList.remove('show'));

let currentModTargetId = null;

function openWarnModal(chatId) {
  currentModTargetId = chatId;
  $('#warn-reason-input').value = '';
  $('#warn-modal').classList.add('show');
}

$('#btn-submit-warn').addEventListener('click', () => {
  const reason = $('#warn-reason-input').value.trim();
  if (!reason) { toast('دلیل اخطار را بنویسید', 'error'); return; }

  const targetChat = getChat(currentModTargetId);
  if (!targetChat) {
    $('#warn-modal').classList.remove('show');
    toast('چت هدف پیدا نشد', 'error');
    return;
  }

  const warner = state.globalWarner || {
    name: state.me.name,
    username: state.me.username,
    avatar: state.me.avatar,
    badgeType: state.me.badgeType
  };

  const isWarnerMe = warner.username
    ? normUser(warner.username) === normUser(state.me.username)
    : warner.name === state.me.name;

  const warnText = `⚠️ اخطار: ${reason}`;

  const buildMsg = (out) => ({
    id: rid(),
    text: warnText,
    out,
    ts: Date.now(),
    status: out ? 'sent' : 'read',
    type: 'text',
    isWarning: true,
    replyTo: null,
    reactions: {},
    deleted: false,
    editedForAll: false,
    seenCount: 0,
    seenTarget: 0,
    linkPreview: null,
    _fakeReactionCounts: {}
  });

  const isGC = targetChat.type === 'group' || targetChat.type === 'channel';

  /* ============ گروه / کانال: اخطار به سازنده (خصوصی) ============ */
  if (isGC) {
    const owner = targetChat.owner || { name: state.me.name, username: state.me.username || '' };
    const ownerIsMe = owner.username
      ? normUser(owner.username) === normUser(state.me.username)
      : owner.name === state.me.name;

    if (isWarnerMe) {
      if (ownerIsMe) {
        toast('شما خودتان سازنده این گروه/کانال هستید', 'info');
        $('#warn-modal').classList.remove('show');
        return;
      }

      let ownerAccount = null;
      if (owner.username) {
        ownerAccount = state.accounts.find(a => normUser(a.username) === normUser(owner.username));
      }
      if (!ownerAccount) {
        ownerAccount = state.accounts.find(a => a.name === owner.name);
      }

      if (!ownerAccount) {
        toast('سازنده گروه/کانال در این دستگاه پیدا نشد', 'error');
        $('#warn-modal').classList.remove('show');
        return;
      }

      // پیام فقط در چت سازنده با من ذخیره می‌شود (دریافتی)
      const chatInOwner = findOrCreatePrivateChatWithEntity(ownerAccount, {
        name: state.me.name,
        username: state.me.username || '',
        avatar: state.me.avatar,
        badgeType: state.me.badgeType,
        coverPhoto: state.me.coverPhoto
      });
      chatInOwner.messages.push(buildMsg(false));
      chatInOwner.unread = (chatInOwner.unread || 0) + 1;

      // در چت خودم با سازنده چیزی نمایش داده نمی‌شود

    } else {
      if (!ownerIsMe) {
        toast('این اخطار برای شما نیست', 'error');
        $('#warn-modal').classList.remove('show');
        return;
      }

      // من سازنده‌ام و اخطار از طرف یک اکانت دیگر آمده
      const chatInMe = findOrCreatePrivateChatWithEntity(state.me, warner);
      chatInMe.messages.push(buildMsg(false));
      chatInMe.unread = (chatInMe.unread || 0) + 1;

      if (warner.username) {
        const warnerAcc = state.accounts.find(a => normUser(a.username) === normUser(warner.username));
        if (warnerAcc) {
          const chatInWarner = findOrCreatePrivateChatWithEntity(warnerAcc, {
            name: state.me.name,
            username: state.me.username || '',
            avatar: state.me.avatar,
            badgeType: state.me.badgeType,
            coverPhoto: state.me.coverPhoto
          });
          chatInWarner.messages.push(buildMsg(true));
        }
      }
    }

    save();
    renderChatList();
    if (activeChatId) renderMessages(false);
    $('#warn-modal').classList.remove('show');
    toast('اخطار به سازنده گروه/کانال ارسال شد ✓', 'success');
    return;
  }

  /* ============ چت خصوصی ============ */
  if (isWarnerMe) {
    // من اخطار دهنده‌ام → فقط در چت کاربر مقصد ذخیره می‌شود، نه در چت خودم
    let sent = false;
    if (targetChat.username) {
      const targetAcc = state.accounts.find(a => normUser(a.username) === normUser(targetChat.username));
      if (targetAcc) {
        const chatInTarget = findOrCreatePrivateChatWithEntity(targetAcc, {
          name: state.me.name,
          username: state.me.username || '',
          avatar: state.me.avatar,
          badgeType: state.me.badgeType,
          coverPhoto: state.me.coverPhoto
        });
        chatInTarget.messages.push(buildMsg(false));
        chatInTarget.unread = (chatInTarget.unread || 0) + 1;
        sent = true;
      }
    }
    if (!sent) {
      toast('امکان ارسال اخطار به این کاربر وجود ندارد (اکانت مقصد در این دستگاه نیست)', 'error');
      $('#warn-modal').classList.remove('show');
      return;
    }
  } else {
    // من گیرنده‌ام و اخطار از طرف دیگری آمده → در چت خودم دریافتی
    targetChat.messages.push(buildMsg(false));
    targetChat.unread = (targetChat.unread || 0) + 1;

    if (warner.username) {
      const warnerAcc = state.accounts.find(a => normUser(a.username) === normUser(warner.username));
      if (warnerAcc) {
        const chatInWarner = findOrCreatePrivateChatWithEntity(warnerAcc, {
          name: state.me.name,
          username: state.me.username || '',
          avatar: state.me.avatar,
          badgeType: state.me.badgeType,
          coverPhoto: state.me.coverPhoto
        });
        chatInWarner.messages.push(buildMsg(true));
      }
    }
  }

  save();
  renderChatList();
  if (activeChatId === targetChat.id) renderMessages(false);
  if (infoChatId === targetChat.id) renderInfo();

  $('#warn-modal').classList.remove('show');
  toast(`اخطار از طرف «${warner.name}» ارسال شد ✓`, 'success');
});

$('#btn-cancel-warn').addEventListener('click', () => $('#warn-modal').classList.remove('show'));

function banUser(chatId) {
  const chat = getChat(chatId);
  if (!chat) return;
  showConfirm('بن کاربر', `آیا از بن کردن "${chat.name}" مطمئن هستید؟ دسترسی این کاربر قطع می‌شود.`, () => {
    if (!state.bannedUsers.includes(chat.username || chat.name)) {
      state.bannedUsers.push(chat.username || chat.name);
    }
    state.chats = state.chats.filter(c => c.id !== chatId);
    state.contacts = state.contacts.filter(c => c.id !== chatId);
    state.accounts = state.accounts.filter(a => a.name !== chat.name && (a.username !== chat.username || !chat.username));
    if (state.me.name === chat.name || (chat.username && state.me.username === chat.username)) {
      if (state.accounts.length > 0) {
        state.me = state.accounts[0];
        state.accounts = state.accounts.slice(1);
      } else {
        state.me = emptyAccount();
      }
      switchTab('chats');
    }
    closeChat(); closeInfo(); renderChatList(); renderSettings(); save();
    toast('کاربر بن شد و از لیست اکانت‌ها حذف شد ⛔', 'error');
  });
}

/* ---------- render: messages ---------- */
let activeChatId = null, replyToMsg = null;
let msgSearchQuery = '', msgSearchHits = [], msgSearchIndex = -1;
const renderedIds = new Set();

function highlightMatch(text, q) {
  if (!q) return renderRichText(text);
  try {
    return esc(text).replace(new RegExp('('+escRe(q)+')','ig'), '<span class="msg-highlight">$1</span>');
  } catch { return esc(text); }
}

function renderReactions(m) {
  const real = m.reactions || {};
  const fake = m._fakeReactionCounts || {};
  const keys = [...new Set([...Object.keys(real), ...Object.keys(fake)])].filter(k => (real[k]||[]).length > 0 || (fake[k]||0) > 0);
  if (!keys.length) return '';
  return `<div class="msg-reactions">${keys.map(emoji => {
    const names = real[emoji] || [];
    const count = names.length + (fake[emoji] || 0);
    const mine = names.includes('من');
    return `<button class="reaction-pill${mine?' mine':''}" data-react-emoji="${esc(emoji)}" data-react-msg="${esc(m.id)}"><span>${emoji}</span><span class="rp-count">${count.toLocaleString('fa-IR')}</span></button>`;
  }).join('')}</div>`;
}

function votePoll(chatId, msgId, optIdx) {
  const chat = getChat(chatId);
  if (!chat) return;
  const m = chat.messages.find(x => x.id === msgId);
  if (!m || !m.poll || m.poll.votedIndex !== null) return;
  m.poll.options[optIdx].votes++;
  m.poll.votedIndex = optIdx;
  save();
  if (activeChatId === chatId) renderMessages(false);
}

function simulatePollVotes(chat, pollMsg) {
  if (!pollMsg || pollMsg.type !== 'poll') return;
  const totalOptions = pollMsg.poll.options.length;
  let totalVotes = 0;
  if (chat.type === 'group') totalVotes = Math.floor((chat.members || 10) * 0.8);
  else if (chat.type === 'channel') totalVotes = Math.floor((chat.members || 100) * 0.9);
  else return;
  let currentVotes = 0;
  const interval = setInterval(() => {
    const votesToAdd = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < votesToAdd; i++) {
      if (currentVotes >= totalVotes) break;
      const randOpt = Math.floor(Math.random() * totalOptions);
      pollMsg.poll.options[randOpt].votes++;
      currentVotes++;
    }
    save();
    if (activeChatId === chat.id) renderMessages(false);
    if (currentVotes >= totalVotes) clearInterval(interval);
  }, 2000);
}

function msgHTML(chat, m, prevMsg, nextMsg) {
  const isNew = !renderedIds.has(m.id);
  renderedIds.add(m.id);
  const cls = `msg ${m.out?'out':'in'}${isNew?'':' no-anim'}${(chat.type==='ai'&&!m.out)?' ai':''}${msgSearchHits.includes(m.id)?' search-hit':''}`;
  let inner = '';

  if (m.replyTo) {
    const r = chat.messages.find(x => x.id === m.replyTo);
    if (r) {
      const nm = r.out ? 'شما' : (r.sender || chat.name);
      const tx = r.deleted ? 'پیام حذف‌شده' : (r.type === 'text' ? r.text : 'پیوست');
      inner += `<div class="reply-quote"><b>${esc(nm)}</b><p>${esc(tx)}</p></div>`;
    }
  }

  if (chat.type === 'channel') {
    const nameColor = getChannelColor(chat);
    inner += `<div class="ch-head"><div class="ch-name" style="color:${nameColor}">${esc(chat.name)}</div></div>`;
  }

  if (chat.type === 'ai' && !m.out) inner += `<div class="ai-label">${icon('sparkle',12)} دستیار هوشمند</div>`;

  if (m.deleted) {
    inner += `<div class="btext msg-deleted">🚫 این پیام حذف شد</div>`;
  } else if (m.type === 'photo') {
    if (m.dataUrl) inner += `<div class="media" style="background:#000"><img src="${esc(m.dataUrl)}" alt="">${m.text?`<div class="cap">${esc(m.text)}</div>`:''}</div>`;
    else inner += `<div class="media" style="background:${m.bg||'linear-gradient(135deg,#667eea,#764ba2)'}">${icon('camera',56)}${m.text?`<div class="cap">${esc(m.text)}</div>`:''}</div>`;
  } else if (m.type === 'location') {
    inner += `<div class="media" style="background:linear-gradient(135deg,#43cea2,#185a9d)">${icon('location',56)}${m.text?`<div class="cap">${esc(m.text)}</div>`:''}</div>`;
  } else if (m.type === 'file') {
    inner += `<div class="filemsg"><div class="ficon">${icon('file',22)}</div><div class="fmeta"><span class="fname">${esc(m.text)}</span><span class="fsize">${esc(m.size||'2.4 MB')}</span></div></div>`;
  } else if (m.type === 'voice') {
    const bars = Array.from({length:22},(_,i) => `<i style="height:${7+((i*13+(m.dur||3)*7)%16)}px"></i>`).join('');
    inner += `<div class="voice"><button class="vplay" data-play="${m.id}">${icon('play',16)}</button><div class="vwave">${bars}</div><span class="vdur">${fmtDur(m.dur||0)}</span></div>`;
  } else if (m.type === 'poll') {
    const totalVotes = m.poll.options.reduce((sum, o) => sum + o.votes, 0);
    const hasVoted = m.poll.votedIndex !== null;
    inner += `<div class="poll-container" onclick="event.stopPropagation();">
      <div class="poll-q">${esc(m.poll.question)}</div>
      ${m.poll.options.map((opt, i) => {
        const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
        return `<div class="poll-opt ${m.poll.votedIndex===i?'voted':''}" onclick="votePoll('${chat.id}','${m.id}',${i})">
          <div class="poll-opt-bar" style="width:${hasVoted ? pct : 0}%"></div>
          <div class="poll-opt-text"><span>${esc(opt.text)}</span> ${hasVoted ? `<span>${pct}%</span>` : ''}</div>
        </div>`;
      }).join('')}
      <div class="poll-footer">${totalVotes.toLocaleString('fa-IR')} رای ${hasVoted ? '· شما رای داده‌اید' : ''}</div>
    </div>`;
  } else {
    inner += `<div class="btext">${msgSearchQuery ? highlightMatch(m.text, msgSearchQuery) : renderRichText(m.text)}</div>`;
    if (m.linkPreview && m.linkPreview.domain) {
      inner += `<a class="link-preview" href="${esc(m.linkPreview.url)}" target="_blank" rel="noopener"><div class="lp-header"><img class="lp-favicon" src="${esc(m.linkPreview.favicon)}" alt="" onerror="this.style.display='none'"><span class="lp-domain">${esc(m.linkPreview.domain)}</span></div><div class="lp-url">${esc(m.linkPreview.url)}</div></a>`;
    }
    const mention = firstMention(m.text);
    if (mention) {
      const mp = mentionPreview(mention);
      if (mp) inner += `<a class="mention-preview" data-mention-preview="${esc(mp.username)}"><div class="mp-header"><div class="mp-avatar" style="${avatarBgStyle({name:mp.name})}">${esc(initials(mp.name))}</div><span class="mp-name">${esc(mp.name)}${mp.badgeType?vfHTML(mp.badgeType,15):''}</span></div><span class="mp-sub">@${esc(mp.username)} · ${mp.type==='channel'?'کانال':mp.type==='group'?'گروه':'کاربر'}</span></a>`;
    }
  }
  inner += renderReactions(m);

  let ticks = '';
  if (m.out && !m.deleted) {
    if (m.status === 'read') ticks = `<span class="ticks read">${icon('double-check',15)}</span>`;
    else if (m.status === 'delivered') ticks = `<span class="ticks">${icon('double-check',15)}</span>`;
    else ticks = `<span class="ticks">${icon('check',15)}</span>`;
  }
  const metaText = `${fmtTime(m.ts)}${m.editedForAll?' · ویرایش‌شده':(m.edited?' ✎':'')}`;
  const seen = (chat.type === 'channel' && m.out && (m.seenCount || m.seenTarget)) ? `<span class="msg-seen">${icon('eye',13)} ${fmtNum(m.seenCount||0)}</span>` : '';
  const msgInner = `${inner}<div class="meta"><span>${metaText}</span>${seen}${ticks}</div>`;

  if (chat.type === 'group' && !m.out) {
    const sender = m.sender || 'عضو';
    const sameBefore = prevMsg && !prevMsg.out && prevMsg.sender === sender;
    const sameAfter = nextMsg && !nextMsg.out && nextMsg.sender === sender;
    const member = (chat.membersList||[]).find(x => x.name === sender);
    const mAv = member?.avatar || {type:'gradient',value:0};
    const [c1,c2] = nameColors(sender);
    const isAdmin = (chat.admins||[]).includes(sender);
    return `<div class="msg-group-row">
      <div class="msg-group-av${sameAfter?' empty':''}" style="background:linear-gradient(135deg,${c1},${c2})">${sameAfter?'':(mAv.type==='emoji'?mAv.value:initials(sender))}</div>
      <div class="msg-group-wrap">
        ${!sameBefore?`<div class="msg-group-sender" style="color:${c1}">${esc(sender)}${isAdmin?'<span class="admin-badge">ADMIN</span>':''}</div>`:''}
        <div class="${cls}" data-id="${m.id}">${msgInner}</div>
      </div>
    </div>`;
  }
  return `<div class="${cls}" data-id="${m.id}">${msgInner}</div>`;
}

function renderMessages(scroll = true) {
  const chat = getChat(activeChatId);
  const box = $('#messages');
  if (!box) return;
  if (!chat) { box.innerHTML = ''; return; }
  box.setAttribute('data-chat-type', chat.type || 'private');

  if (!chat.messages.length) {
    box.innerHTML = chat.type === 'ai'
      ? `<div class="empty" style="margin:auto;padding:40px">${icon('sparkle',52)}<div class="ttl">دستیار هوشمند گپ</div>هر سوالی داری بپرس 👋</div>`
      : `<div class="empty" style="margin:auto;padding:40px">${icon('chat-outline',52)}<div class="ttl">شروع گفتگو</div>اولین پیامت رو بنویس</div>`;
    return;
  }

  const all = chat.messages;
  const startIdx = Math.max(0, all.length - 300);
  let html = '';
  if (startIdx > 0) html += `<div class="day-sep"><span>${startIdx.toLocaleString('fa-IR')} پیام قدیمی‌تر مخفی شده…</span></div>`;

  let lastDay = '';
  for (let i = startIdx; i < all.length; i++) {
    const m = all[i];
    const d = dayKey(m.ts);
    if (d !== lastDay) { html += `<div class="day-sep"><span>${fmtDay(m.ts)}</span></div>`; lastDay = d; }
    const p = all[i-1], n = all[i+1];
    const prevAdj = (p && dayKey(p.ts) === dayKey(m.ts)) ? p : null;
    const nextAdj = (n && dayKey(n.ts) === dayKey(m.ts)) ? n : null;
    html += msgHTML(chat, m, prevAdj, nextAdj);
  }

  if (chat.typing) {
    const typingCls = chat.type === 'ai' ? ' in typing ai-thinking' : ' in typing';
    if (chat.type === 'group' && chat.typingSender) {
      const member = (chat.membersList||[]).find(x => x.name === chat.typingSender);
      const [c1,c2] = nameColors(chat.typingSender);
      html += `<div class="msg-group-row">
        <div class="msg-group-av" style="background:linear-gradient(135deg,${c1},${c2})">${member?.avatar?.type==='emoji'?member.avatar.value:initials(chat.typingSender)}</div>
        <div class="msg-group-wrap">
          <div class="msg-group-sender" style="color:${c1}">${esc(chat.typingSender)}</div>
          <div class="msg${typingCls}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        </div>
      </div>`;
    } else html += `<div class="msg${typingCls}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  }

  box.innerHTML = html;
  if (scroll) requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
}

function renderChatHeader() {
  const c = getChat(activeChatId);
  if (!c) return;
  const av = $('#chat-avatar');
  if (av) {
    av.textContent = ''; av.style.background = ''; av.style.backgroundImage = '';
    const avData = c.avatar || {type:'gradient',value:0};
    if (avData.type === 'image') {
      av.style.backgroundImage = `url("${avData.value}")`;
      av.style.backgroundSize = 'cover'; av.style.backgroundPosition = 'center';
    } else if (avData.type === 'gradient') {
      const g = AV_GRADS[(avData.value||0) % AV_GRADS.length];
      av.style.background = `linear-gradient(135deg,${g[0]},${g[1]})`;
      av.textContent = initials(c.name);
    } else if (avData.type === 'emoji') {
      const [c1,c2] = nameColors(c.name);
      av.style.background = `linear-gradient(135deg,${c1},${c2})`;
      av.textContent = avData.value;
    }
  }
  const nameEl = $('#chat-name');
  if (nameEl) nameEl.innerHTML = nameWithVf(c.name, c.badgeType, 20);
  const status = $('#chat-status');
  if (status) { status.textContent = chatStatus(c); status.style.color = c.typing ? 'var(--green)' : ''; }
}

/* ---------- Wallpaper & Open/Close ---------- */
const DEFAULT_WALLPAPER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="#131313"/><g fill="#ffffff" fill-opacity="0.04"><path d="M50 50l10-10 10 10-10 10zM150 100l15-15 15 15-15 15zM300 80l20-20 20 20-20 20zM80 250l15-15 15 15-15 15zM250 300l20-20 20 20-20 20zM350 200l10-10 10 10-10 10zM100 350l10-10 10 10-10 10zM200 180l12-12 12 12-12 12z"/><circle cx="200" cy="50" r="20"/><circle cx="50" cy="150" r="15"/><circle cx="350" cy="350" r="25"/><circle cx="300" cy="150" r="10"/><circle cx="100" cy="280" r="18"/></g></svg>')}`;

function applyWallpaper(chat) {
  const box = $('#messages');
  if (!box) return;
  if (chat && chat.wallpaper) {
    box.style.backgroundImage = `url("${chat.wallpaper}")`;
    box.style.backgroundSize = 'cover';
    box.style.backgroundPosition = 'center';
    box.style.backgroundRepeat = 'no-repeat';
  } else {
    box.style.backgroundImage = `url("${DEFAULT_WALLPAPER_SVG}")`;
    box.style.backgroundSize = 'auto';
    box.style.backgroundPosition = 'top left';
    box.style.backgroundRepeat = 'repeat';
  }
}

function openWallpaperPicker(chat) {
  openSheet(`
    <div class="sheet-title">پس‌زمینه چت</div>
    <div class="sheet-item" data-wp="change">${icon('image')}انتخاب عکس از گوشی</div>
    <div class="sheet-item danger" data-wp="default">${icon('trash')}حذف پس‌زمینه (پیش‌فرض)</div>
  `);
  $$('#sheet-content [data-wp]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.wp;
    closeSheet();
    if (act === 'change') {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = () => {
        const f = inp.files[0];
        if (!f) return;
        resizeImage(f, 1920, url => {
          chat.wallpaper = url;
          save();
          if (activeChatId === chat.id) applyWallpaper(chat);
          toast('پس‌زمینه تنظیم شد', 'success');
        });
      };
      inp.click();
    } else if (act === 'default') {
      chat.wallpaper = null;
      save();
      if (activeChatId === chat.id) applyWallpaper(chat);
      toast('پس‌زمینه پیش‌فرض', 'info');
    }
  }));
}

function openChat(id) {
  const c = getChat(id);
  if (!c) return;
  activeChatId = id;
  c.unread = 0; c.typing = false; c.typingSender = null;
  replyToMsg = null; hideReplyBar(); closeMsgSearch(); closeProfilePreview();
  document.body.classList.add('in-chat');
  renderChatHeader(); renderMessages(); renderChatList();
  applyWallpaper(c);
  $('#screen-chat').classList.add('open');
  const inp = $('#msg-input');

  const isWarner = isWarnerChat(c);
  const composer = $('#composer');

  if (isWarner) {
    composer.classList.add('warner-blocked');
    inp.disabled = true;
    inp.value = '';
    inp.placeholder = 'امکان ارسال پیام به این کاربر وجود ندارد';
    $('#btn-send').style.display = 'none';
    $('#btn-photo').style.display = 'none';
    $('#btn-file').style.display = 'none';
    $('#btn-poll').style.display = 'none';
    $('#btn-emoji').style.display = 'none';
    $('#btn-send-text').classList.remove('show');
  } else {
    composer.classList.remove('warner-blocked');
    inp.disabled = false;
    inp.placeholder = 'پیام';
    $('#btn-send').style.display = '';
    $('#btn-photo').style.display = '';
    $('#btn-file').style.display = '';
    $('#btn-poll').style.display = '';
    $('#btn-emoji').style.display = '';
    if (inp) { inp.value = c.draft || ''; autoGrow(); }
  }

  updateSendBtnState();
  save();
}
function closeChat() {
  const c = getChat(activeChatId);
  if (c && $('#msg-input') && !isWarnerChat(c)) c.draft = $('#msg-input').value || '';
  document.body.classList.remove('in-chat');
  $('#screen-chat').classList.remove('open');
  activeChatId = null; replyToMsg = null;
  hideReplyBar(); closeMsgSearch(); renderChatList(); save();
}

/* ---------- info ---------- */
let infoChatId = null;
function openInfo(id) {
  const c = getChat(id);
  if (!c) return;
  infoChatId = id;
  document.body.classList.add('in-info');
  renderInfo();
  $('#screen-info').classList.add('open');
}
function closeInfo() {
  document.body.classList.remove('in-info');
  $('#screen-info').classList.remove('open');
  infoChatId = null;
}

function renderInfo() {
  const c = getChat(infoChatId);
  if (!c) return;
  const isGC = c.type === 'group' || c.type === 'channel';
  const username = c.username || '';
  const isPublic = !!c.isPublic;
  const admins = c.admins || [];
  const perms = c.permissions || {sendMessages:'all', editInfo:'all'};
  const isJoined = c.joined !== false;

  $('#info-title').textContent = c.type === 'channel' ? 'اطلاعات کانال' : c.type === 'group' ? 'اطلاعات گروه' : c.type === 'ai' ? 'دستیار هوشمند' : c.type === 'saved' ? 'پیام‌های ذخیره‌شده' : 'اطلاعات مخاطب';

  let badges = '';
  if (isGC) badges += `<div class="info-badge ${isPublic?'public':'private'}" data-info-act="toggle-public">${isPublic?icon('globe',14)+' عمومی':icon('lock',14)+' خصوصی'}</div>`;
  if (c.badgeType) badges += `<div class="info-badge verified">${vfHTML(c.badgeType, 14)} ${BADGES[c.badgeType].title}</div>`;

  let stats = '';
  if (isGC) stats = `<div class="info-stat editable" data-info-act="edit-members">${icon('users',16)} <b>${(c.members||0).toLocaleString('fa-IR')}</b> عضو</div>`;
  else if (c.type === 'private') stats = `<div class="info-stat">${icon(c.online?'chat-outline':'phone',16)} ${c.online?'آنلاین':'آخرین بازدید به تازگی'}</div>`;
  else if (c.type === 'ai') stats = `<div class="info-stat">${icon(navigator.onLine?'sparkle':'chat-outline',16)} ${navigator.onLine?'آنلاین — پاسخ هوشمند':'آفلاین'}</div>`;

  let joinedDate = `<div class="info-stat">${icon('chart',16)} عضو شده در ${esc(c.joinedDate || getPersianDate())}</div>`;

  const cover = `<div class="info-cover ${c.coverPhoto?'':'empty'}" data-info-act="edit-cover" style="${c.coverPhoto?`background-image:url(&quot;${esc(c.coverPhoto)}&quot;)`:''}">${c.coverPhoto?'':icon('camera',22)+' افزودن کاور'}</div>`;
  const desc = isGC ? `<div class="group"><div class="row" data-info-act="edit-description" style="cursor:pointer"><span class="r-icon">${icon('file',20)}</span><span class="r-text" style="flex:1;white-space:normal;line-height:1.5">${c.description?esc(c.description):'<span style="color:var(--text-3)">+ افزودن توضیحات</span>'}</span></div></div>` : '';

  let membersList = '';
  if (c.type === 'group' && c.membersList && c.membersList.length) {
    membersList = `<div class="section-title">اعضا و مدیران (${c.membersList.length.toLocaleString('fa-IR')})</div><div class="group">${c.membersList.map(m => {
      const [c1,c2] = nameColors(m.name);
      const isAdmin = admins.includes(m.name);
      return `<div class="row" data-member-name="${esc(m.name)}" style="cursor:pointer"><div style="width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;background:linear-gradient(135deg,${c1},${c2})">${(m.avatar?.type==='emoji'?m.avatar.value:initials(m.name))}</div><span class="r-text" style="font-weight:600;color:${c1}">${esc(m.name)}</span>${isAdmin?'<span class="admin-badge">ADMIN</span>':''}<span class="chev">${icon('chevron',18)}</span></div>`;
    }).join('')}</div>`;
  }

  const uBlock = (isGC || c.type === 'private' || c.type === 'ai') ? (username ? `<div class="info-username" data-info-act="edit-username">@${esc(username)}</div>` : `<div class="info-username empty" data-info-act="edit-username">+ افزودن آیدی</div>`) : '';

  const settingsGrp = (isGC || c.type === 'private') ? `
    <div class="section-title">تنظیمات</div>
    <div class="group">
      <div class="row" data-info-act="edit-name"><span class="r-icon">${icon('edit',20)}</span><span class="r-text">نام</span><span class="r-val">${esc(c.name)}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-info-act="edit-username"><span class="r-icon">${icon('user',20)}</span><span class="r-text">آیدی</span><span class="r-val">${username?'@'+esc(username):'—'}</span><span class="chev">${icon('chevron',18)}</span></div>
      ${isGC ? `<div class="row" data-info-act="toggle-public"><span class="r-icon">${icon(isPublic?'globe':'lock',20)}</span><span class="r-text">نوع</span><span class="r-val">${isPublic?'عمومی':'خصوصی'}</span><span class="chev">${icon('chevron',18)}</span></div><div class="row" data-info-act="edit-members"><span class="r-icon">${icon('users',20)}</span><span class="r-text">تعداد اعضا</span><span class="r-val">${(c.members||0).toLocaleString('fa-IR')}</span><span class="chev">${icon('chevron',18)}</span></div>` : ''}
      <div class="row" data-info-act="set-badge"><span class="r-icon" style="background:#6c6c6e">${icon('verified',20)}</span><span class="r-text">نشان تایید</span><span class="r-val">${c.badgeType ? BADGES[c.badgeType].title : 'بدون نشان'}</span><span class="chev">${icon('chevron',18)}</span></div>
    </div>` : '';

  const permsGrp = isGC ? `
    <div class="section-title">مجوزها</div>
    <div class="group">
      <div class="row" data-info-act="perm-send"><span class="r-icon purple">${icon('chat-outline',20)}</span><span class="r-text">ارسال پیام</span><span class="r-val">${perms.sendMessages==='admins'?'فقط مدیران':'همه اعضا'}</span><span class="chev">${icon('chevron',18)}</span></div>
      <div class="row" data-info-act="perm-info"><span class="r-icon purple">${icon('edit',20)}</span><span class="r-text">تغییر اطلاعات</span><span class="r-val">${perms.editInfo==='admins'?'فقط مدیران':'همه اعضا'}</span><span class="chev">${icon('chevron',18)}</span></div>
    </div>` : '';

  const joinLeave = isGC ? `<div class="profile-actions">${isJoined?`<button class="btn-leave" data-info-act="leave-chat">${icon('logout',18)} ترک</button>`:`<button class="btn-join" data-info-act="join-chat">${icon('login',18)} عضویت</button>`}</div>` : '';

  $('#info-body').innerHTML = `
    <div class="info-hero has-cover">${cover}<div class="avatar big info-avatar-overlay" id="info-avatar-btn" style="${avatarBgStyle(c)}">${avatarContent(c)}</div><div class="info-name">${esc(c.name)}${vfHTML(c.badgeType,26)}</div>${uBlock}${badges?`<div class="info-badges">${badges}</div>`:''}${stats}${joinedDate}</div>
    ${desc}${settingsGrp}${permsGrp}${membersList}${joinLeave}
    <div class="section-title">عملیات</div>
    <div class="group">
      <div class="row" data-info-act="toggle-mute"><span class="r-icon">${icon(c.muted?'bell':'bell-off',20)}</span><span class="r-text">${c.muted?'فعال کردن اعلان':'بی‌صدا کردن'}</span></div>
      <div class="row" data-info-act="clear"><span class="r-icon">${icon('trash',20)}</span><span class="r-text">پاک کردن تاریخچه</span></div>
      <div class="row" data-info-act="delete"><span class="r-icon" style="background:#e53935">${icon('trash',20)}</span><span class="r-text" style="color:var(--red)">حذف چت</span></div>
    </div>
    <div class="empty" style="padding:20px 40px 40px;font-size:12px;opacity:.55">شناسه: ${esc(c.id)}<br>ساخته شده در ${new Date(c.createdAt||Date.now()).toLocaleDateString('fa-IR')}</div>
  `;

  $$('#info-body [data-info-act]').forEach(el => el.addEventListener('click', e => {
    if (e.target.tagName === 'INPUT' || e.target.closest('label.switch')) return;
    handleInfoAction(el.dataset.infoAct, c);
  }));
  $$('#info-body [data-member-name]').forEach(el => el.addEventListener('click', e => {
    if (e.target.tagName === 'INPUT' || e.target.closest('label.switch')) return;
    showMemberMenu(c, el.dataset.memberName);
  }));
  const avBtn = $('#info-avatar-btn');
  if (avBtn) avBtn.addEventListener('click', () => { avatarTargetType = 'chat'; avatarTarget = c.id; renderAvatarPicker('gradient'); avatarOverlay.classList.add('show'); });
}

function showMemberMenu(chat, name) {
  const isAdmin = (chat.admins||[]).includes(name);
  openSheet(`<div class="sheet-title">${esc(name)}</div>
    <div class="sheet-item" data-mact="toggle-admin">${icon('verified')}${isAdmin?'برداشتن مدیریت':'ارتقا به مدیر'}</div>
    <div class="sheet-item" data-mact="remove">${icon('trash')}حذف از گروه</div>`);
  $$('#sheet-content [data-mact]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.mact;
    closeSheet();
    setTimeout(() => {
      if (act === 'toggle-admin') {
        chat.admins = chat.admins || [];
        if (isAdmin) { chat.admins = chat.admins.filter(n => n !== name); toast('مدیریت برداشته شد'); }
        else { chat.admins.push(name); toast('به مدیر ارتقا یافت'); }
        renderInfo(); save();
      } else if (act === 'remove') {
        showConfirm('حذف عضو', `${name} از گروه حذف شود؟`, () => {
          chat.membersList = (chat.membersList||[]).filter(m => m.name !== name);
          chat.admins = (chat.admins||[]).filter(n => n !== name);
          chat.members = chat.membersList.length;
          renderInfo(); renderChatHeader(); renderChatList(); save();
          toast('حذف شد');
        });
      }
    }, 120);
  }));
}

function pickCoverImage(chat) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    resizeImage(f, 1920, url => { chat.coverPhoto = url; renderInfo(); save(); toast('کاور تنظیم شد'); });
  };
  inp.click();
}

function handleInfoAction(act, c) {
  if (act === 'join-chat') {
    c.joined = true;
    const di = (state.directory||[]).findIndex(d => d.id === c.id);
    if (di >= 0) { state.directory[di].joined = true; const cp = JSON.parse(JSON.stringify(state.directory[di])); cp.joined = true; if (!state.chats.find(x => x.id === cp.id)) state.chats.push(cp); }
    renderInfo(); renderChatList(); save(); toast('عضو شدی ✓'); return;
  }
  if (act === 'leave-chat') {
    showConfirm('ترک', 'مطمئنی؟', () => {
      c.joined = false;
      const di = (state.directory||[]).findIndex(d => d.id === c.id);
      if (di >= 0) state.directory[di].joined = false;
      else { const cp = JSON.parse(JSON.stringify(c)); cp.joined = false; state.directory = state.directory || []; state.directory.push(cp); }
      state.chats = state.chats.filter(x => x.id !== c.id);
      closeInfo(); closeChat(); renderChatList(); save(); toast('ترک کردی');
    }); return;
  }
  if (act === 'edit-cover') {
    if (c.coverPhoto) {
        openSheet(`<div class="sheet-title">کاور</div>
          <div class="sheet-item" data-cover="change">${icon('image')}تغییر</div>
          <div class="sheet-item danger" data-cover="remove">${icon('trash')}حذف</div>`);
        $$('#sheet-content [data-cover]').forEach(b => b.addEventListener('click', () => {
            if (b.dataset.cover === 'change') { closeSheet(); pickCoverImage(c); }
            else if (b.dataset.cover === 'remove') { c.coverPhoto = null; closeSheet(); renderInfo(); save(); toast('حذف شد'); }
        }));
    } else pickCoverImage(c);
    return;
  }
  if (act === 'edit-description') {
    showPrompt('توضیحات', c.description||'', v => { c.description = v.trim(); renderInfo(); save(); toast('ذخیره شد'); });
    return;
  }
  if (act === 'perm-send') {
    openSheet(`<div class="sheet-title">ارسال پیام</div>
      <div class="sheet-item" data-perm="all">${icon('users')}همه اعضا</div>
      <div class="sheet-item" data-perm="admins">${icon('verified')}فقط مدیران</div>`);
    $$('#sheet-content [data-perm]').forEach(b => b.addEventListener('click', () => {
      if (!c.permissions) c.permissions = {sendMessages:'all', editInfo:'all'};
      c.permissions.sendMessages = b.dataset.perm;
      closeSheet(); renderInfo(); save();
      toast(b.dataset.perm === 'admins' ? 'فقط مدیران می‌توانند پیام بفرستند' : 'همه اعضا می‌توانند پیام بفرستند');
    }));
    return;
  }
  if (act === 'perm-info') {
    openSheet(`<div class="sheet-title">تغییر اطلاعات</div>
      <div class="sheet-item" data-perm="all">${icon('users')}همه اعضا</div>
      <div class="sheet-item" data-perm="admins">${icon('verified')}فقط مدیران</div>`);
    $$('#sheet-content [data-perm]').forEach(b => b.addEventListener('click', () => {
      if (!c.permissions) c.permissions = {sendMessages:'all', editInfo:'all'};
      c.permissions.editInfo = b.dataset.perm;
      closeSheet(); renderInfo(); save();
      toast(b.dataset.perm === 'admins' ? 'فقط مدیران می‌توانند اطلاعات را تغییر دهند' : 'همه اعضا می‌توانند اطلاعات را تغییر دهند');
    }));
    return;
  }
  if (act === 'edit-name') {
    showPrompt('نام جدید', c.name, v => { if (!v.trim()) return; c.name = v.trim(); renderInfo(); renderChatList(); renderChatHeader(); save(); toast('نام تغییر کرد'); });
    return;
  }
  if (act === 'edit-username') {
    showPrompt('آیدی (بدون @)', c.username||'', v => {
      let u = normUser(v);
      if (!u) { c.username = ''; renderInfo(); save(); toast('حذف شد'); return; }
      if (!validUser(u)) { toast('آیدی فقط انگلیسی + عدد + _-='); return; }
      if (userTaken(u, 'chat', c.id)) { toast('گرفته شده'); return; }
      c.username = u; renderInfo(); save(); toast('ذخیره شد: @'+u);
    }, {ltr:true}); return;
  }
  if (act === 'set-badge') {
    openSheet(`
      <div class="sheet-title">انتخاب نشان تایید</div>
      <div class="sheet-item" data-badge="none">${icon('ban')}بدون نشان</div>
      <div class="sheet-item" data-badge="blue">${vfHTML('blue', 20)} نشان افراد سرشناس</div>
      <div class="sheet-item" data-badge="yellow">${vfHTML('yellow', 20)} نشان سازمانی</div>
      <div class="sheet-item" data-badge="green">${vfHTML('green', 20)} نشان تجاری</div>
      <div class="sheet-item" data-badge="personal">${vfHTML('personal', 20)} نشان شخصی</div>
    `);
    $$('#sheet-content [data-badge]').forEach(b => b.addEventListener('click', () => {
      const bType = b.dataset.badge;
      c.badgeType = bType === 'none' ? null : bType;
      closeSheet(); renderInfo(); renderChatList(); renderChatHeader(); save();
      toast('نشان تغییر کرد', 'success');
    }));
    return;
  }
  if (act === 'toggle-public') { c.isPublic = !c.isPublic; renderInfo(); save(); toast(c.isPublic?'عمومی':'خصوصی'); return; }
  if (act === 'edit-members') {
    showPrompt('تعداد اعضا', String(c.members||0), v => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 0) { toast('عدد معتبر'); return; }
      c.members = Math.min(n, 9999999);
      if (c.type === 'group' && Array.isArray(c.membersList)) {
        while (c.membersList.length < Math.min(c.members, 50)) {
          const used = new Set(c.membersList.map(x => x.name));
          const avail = MEMBER_POOL.filter(p => !used.has(p.name));
          if (!avail.length) break;
          c.membersList.push({...avail[Math.floor(Math.random()*avail.length)]});
        }
      }
      renderInfo(); renderChatHeader(); renderChatList(); save(); toast('تغییر کرد');
    }); return;
  }
  if (act === 'toggle-mute') { c.muted = !c.muted; renderInfo(); save(); toast(c.muted?'بی‌صدا':'اعلان فعال'); return; }
  if (act === 'clear') { showConfirm('پاک کردن', 'همه پیام‌ها حذف شوند؟', () => { c.messages = []; renderMessages(); renderInfo(); renderChatList(); save(); toast('پاک شد'); }); return; }
  if (act === 'delete') {
    showConfirm('حذف چت', 'کل چت حذف شود؟', () => {
      state.chats = state.chats.filter(x => x.id !== c.id);
      state.contacts = state.contacts.filter(x => x.id !== c.id);
      state.directory = (state.directory||[]).filter(x => x.id !== c.id);
      closeInfo(); closeChat(); renderChatList(); renderContacts(); save(); toast('حذف شد');
    }); return;
  }
}

/* ---------- profile preview ---------- */
function openProfilePreview(username) {
  const f = findByUsername(username);
  if (!f) { toast('آیدی پیدا نشد', 'error'); return; }
  const e = f.entity;

  if (state.bannedUsers.includes(e.username || e.name)) {
    document.body.classList.add('in-profile');
    $('#profile-body').innerHTML = `
      <div class="empty" style="margin-top:80px;">
        ${icon('ban', 80)}
        <div class="ttl" style="color:var(--red)">حساب مسدود شده</div>
        این کاربر به دلیل نقض قوانین بن شده است.
      </div>
    `;
    $('#screen-profile').classList.add('open');
    return;
  }

  document.body.classList.add('in-profile');
  const isGC = e.type === 'group' || e.type === 'channel';
  const isJoined = state.chats.find(x => x.id === e.id || (e.username && x.username === e.username));

  const cover = `<div class="info-cover ${e.coverPhoto?'':'empty'}" style="${e.coverPhoto?`background-image:url(&quot;${esc(e.coverPhoto)}&quot;)`:''}">${e.coverPhoto?'':'بدون کاور'}</div>`;

  let badges = '';
  if (isGC) badges += `<div class="info-badge ${e.isPublic?'public':'private'}">${e.isPublic?icon('globe',14)+' عمومی':icon('lock',14)+' خصوصی'}</div>`;
  if (e.badgeType) badges += `<div class="info-badge verified">${vfHTML(e.badgeType, 14)} ${BADGES[e.badgeType].title}</div>`;

  let stats = '';
  if (isGC) stats = `<div class="info-stat">${icon('users',16)} <b>${(e.members||0).toLocaleString('fa-IR')}</b> عضو</div>`;
  else if (e.type === 'private') stats = `<div class="info-stat">${icon(e.online?'chat-outline':'phone',16)} ${e.online?'آنلاین':'آخرین بازدید به تازگی'}</div>`;

  let joinedDate = `<div class="info-stat">${icon('chart',16)} عضو شده در ${esc(e.joinedDate || getPersianDate())}</div>`;

  const uBlock = e.username
    ? `<div class="info-username" id="pp-username" style="cursor:pointer" title="برای کپی کلیک کنید">@${esc(e.username)}</div>`
    : `<div class="info-username empty" style="cursor:default">بدون آیدی</div>`;

  let primaryBtn = '';
  if (isGC) {
    primaryBtn = isJoined
      ? `<button class="btn-leave" id="pp-open">${icon('chat-outline',18)} باز کردن چت</button>`
      : `<button class="btn-join" id="pp-join">${icon('login',18)} عضویت</button>`;
  } else {
    primaryBtn = `<button class="btn-join" id="pp-msg">${icon('chat-outline',18)} ارسال پیام</button>`;
  }

  const isWarner = state.globalWarner && (
    (e.username && state.globalWarner.username && normUser(state.globalWarner.username) === normUser(e.username)) ||
    (!e.username && state.globalWarner.name === e.name)
  );

  $('#profile-body').innerHTML = `
    <div class="info-hero has-cover">
      ${cover}
      <div class="avatar big info-avatar-overlay" style="${avatarBgStyle(e)}">${avatarContent(e)}</div>
      <div class="info-name">${esc(e.name)}${vfHTML(e.badgeType,26)}</div>
      ${uBlock}
      ${badges?`<div class="info-badges">${badges}</div>`:''}
      ${stats}
      ${joinedDate}
    </div>
    ${e.description?`<div class="group"><div class="row" style="cursor:default"><span class="r-icon">${icon('file',20)}</span><span class="r-text" style="flex:1;white-space:normal;line-height:1.5">${esc(e.description)}</span></div></div>`:''}
    <div class="profile-actions" style="padding:0 14px 10px;">
      ${primaryBtn}
    </div>
    <div class="profile-actions" style="padding:0 14px 30px;">
      <button id="pp-set-warner" class="btn-join" style="background:${isWarner?'rgba(239,68,68,.14)':'rgba(245,158,11,.14)'}; color:${isWarner?'var(--red)':'#fbbf24'}; border:1px solid ${isWarner?'rgba(239,68,68,.35)':'rgba(245,158,11,.35)'};">
        ${icon('alert',18)} ${isWarner?'لغو اخطار دهنده':'تنظیم به عنوان اخطار دهنده'}
      </button>
    </div>
  `;
  $('#screen-profile').classList.add('open');

  const uEl = $('#pp-username');
  if (uEl && e.username) {
    uEl.onclick = () => {
      copyClip('@' + e.username);
      toast('آیدی کپی شد', 'success');
    };
  }

  const jb = $('#pp-join');
  if (jb) jb.onclick = () => {
    const di = (state.directory||[]).findIndex(d => d.id === e.id);
    let src = e;
    if (di >= 0) { src = state.directory[di]; src.joined = true; }
    if (!state.chats.find(x => x.id === e.id || (e.username && x.username === e.username))) {
      const cp = JSON.parse(JSON.stringify(src)); cp.id = rid(); cp.joined = true; state.chats.push(cp);
    }
    save(); closeProfilePreview(); renderChatList(); toast('عضو شدی ✓');
    setTimeout(() => {
      const newChat = state.chats.find(x => x.username === e.username);
      if(newChat) openChat(newChat.id);
    }, 200);
  };
  const ob = $('#pp-open');
  if (ob) ob.onclick = () => { closeProfilePreview(); setTimeout(() => openChat(isJoined.id), 150); };
  const mb = $('#pp-msg');
  if (mb) mb.onclick = () => {
    let chat = state.chats.find(c => c.username && normUser(c.username) === normUser(e.username));
    if (!chat) {
      chat = { id: rid(), name: e.name, username: e.username, type: 'private', avatar: e.avatar, coverPhoto: e.coverPhoto, badgeType: e.badgeType, unread: 0, pinned: false, muted: false, draft: '', messages: [], createdAt: Date.now(), joined: true };
      state.chats.push(chat);
    }
    save(); closeProfilePreview(); renderChatList(); openChat(chat.id);
  };
  const wb = $('#pp-set-warner');
  if (wb) wb.onclick = () => {
    if (isWarner) {
      state.globalWarner = null;
      toast('از لیست اخطار دهنده‌ها حذف شد', 'info');
    } else {
      state.globalWarner = { name: e.name, username: e.username || '', avatar: e.avatar, badgeType: e.badgeType };
      toast(`«${e.name}» به عنوان اخطار دهنده تنظیم شد ✓`, 'success');
    }
    save();
    closeProfilePreview();
  };
}

function closeProfilePreview() {
  document.body.classList.remove('in-profile');
  $('#screen-profile').classList.remove('open');
}

/* ---------- seen simulation ---------- */
function computeViewTarget(members) {
  if (members < 2) return 0;
  const ratio = 0.75 + Math.random() * 0.17;
  return Math.max(1, Math.min(Math.floor(members * ratio), members - 1));
}
function startSeenSim(chat, msg) {
  if (chat.type !== 'channel') return;
  const total = chat.members || 0;
  if (total < 2) return;
  const target = computeViewTarget(total);
  msg.seenTarget = target; msg.seenCount = 0;
  const dur = target < 100 ? 15000+Math.random()*15000 : target < 10000 ? 25000+Math.random()*20000 : target < 100000 ? 40000+Math.random()*25000 : 60000+Math.random()*30000;
  const start = Date.now();
  const tick = () => {
    const progress = Math.min(1, (Date.now()-start)/dur);
    const eased = 1 - Math.pow(1-progress, 2.5);
    const cnt = Math.floor(target * eased);
    if (cnt > msg.seenCount) {
      msg.seenCount = Math.min(target, cnt);
      if (activeChatId === chat.id) renderMessages(false);
      save();
    }
    if (progress < 1) setTimeout(tick, 600+Math.random()*700);
    else { msg.seenCount = target; if (activeChatId === chat.id) renderMessages(false); save(); }
  };
  setTimeout(tick, 1500);
}

/* ---------- fake reactions ---------- */
function simFakeReactions(chat, m) {
  if (!m || m.deleted || m._faked) return;
  if (m.type === 'warning' || m.isWarning) return;
  if (Math.random() > 0.92) return;
  let total = 0;
  if (chat.type === 'channel') { const vc = m.seenTarget || computeViewTarget(chat.members||0); total = Math.max(1, Math.floor(vc * (0.5+Math.random()*0.3))); }
  else if (chat.type === 'group') { const mc = (chat.membersList||[]).filter(x => x.name !== 'من').length; total = Math.max(1, Math.floor(mc * (0.5+Math.random()*0.5))); }
  else if (chat.type === 'private') total = 1;
  else return;
  m._faked = true;
  if (!m._fakeReactionCounts) m._fakeReactionCounts = {};
  const emojiCount = Math.min(total, 1+Math.floor(Math.random()*3));
  const emojis = FAKE_EMOJIS.slice().sort(()=>Math.random()-0.5).slice(0, emojiCount);
  const weights = emojis.map(()=>0.5+Math.random());
  const wSum = weights.reduce((a,b)=>a+b,0);
  const targets = weights.map(w => Math.max(1, Math.floor(total*w/wSum)));
  let diff = total - targets.reduce((a,b)=>a+b,0);
  if (diff > 0) targets[0] += diff;
  const dur = total < 100 ? 15000+Math.random()*10000 : total < 10000 ? 25000+Math.random()*15000 : total < 100000 ? 40000+Math.random()*20000 : 55000+Math.random()*25000;
  const start = Date.now();
  const tick = () => {
    if (m.deleted) return;
    const progress = Math.min(1, (Date.now()-start)/dur);
    const eased = 1 - Math.pow(1-progress, 2.5);
    let changed = false;
    emojis.forEach((emoji, i) => {
      const cnt = Math.floor(targets[i] * eased);
      if (cnt > (m._fakeReactionCounts[emoji]||0)) { m._fakeReactionCounts[emoji] = cnt; changed = true; }
    });
    if (changed) { if (activeChatId === chat.id) renderMessages(false); save(); }
    if (progress < 1) setTimeout(tick, 600+Math.random()*700);
  };
  setTimeout(tick, 1000+Math.random()*1500);
}

/* ---------- reactions ---------- */
function showReactionPicker(msgEl, chat, m) {
  const old = $('#reaction-picker');
  if (old) old.remove();
  const rect = msgEl.getBoundingClientRect();
  const picker = document.createElement('div');
  picker.id = 'reaction-picker';
  picker.className = 'reaction-picker';
  picker.innerHTML = QUICK_REACT.map(e => `<button data-emoji="${e}">${e}</button>`).join('');
  document.body.appendChild(picker);
  const pr = picker.getBoundingClientRect();
  let left = rect.left + rect.width/2 - pr.width/2;
  let top = rect.top - pr.height - 8;
  if (left < 8) left = 8;
  if (left + pr.width > innerWidth - 8) left = innerWidth - pr.width - 8;
  if (top < 8) top = rect.bottom + 8;
  picker.style.left = left + 'px';
  picker.style.top = top + 'px';
  picker.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    toggleReaction(m, b.dataset.emoji, chat);
    picker.remove();
    renderMessages(false); save();
  }));
  setTimeout(() => {
    const close = e => {
      if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('pointerdown', close, true); }
    };
    document.addEventListener('pointerdown', close, true);
  }, 50);
}

function toggleReaction(m, emoji, chat) {
  if (!m.reactions) m.reactions = {};
  const list = m.reactions[emoji] || [];
  const idx = list.indexOf('من');
  if (idx >= 0) {
    list.splice(idx, 1);
    if (!list.length) delete m.reactions[emoji];
  } else {
    list.push('من');
    m.reactions[emoji] = list;
    if (chat.type === 'group' && Math.random() > 0.5) {
      const others = (chat.membersList||[]).map(x => x.name).filter(n => n !== 'من');
      if (others.length) {
        const rnd = others[Math.floor(Math.random()*others.length)];
        setTimeout(() => {
          const l2 = m.reactions[emoji] || [];
          if (!l2.includes(rnd)) {
            l2.push(rnd);
            m.reactions[emoji] = l2;
            if (activeChatId === chat.id) renderMessages(false);
            save();
          }
        }, 1500 + Math.random()*3000);
      }
    }
  }
}

/* ---------- send ---------- */
function sendMessage(extra = {}, textOverride) {
  const chat = getChat(activeChatId);
  if (!chat) return;

  if (isWarnerChat(chat)) {
    toast('امکان ارسال پیام به این کاربر وجود ندارد', 'error');
    return;
  }

  const inp = $('#msg-input');
  const text = textOverride !== undefined ? textOverride : (inp ? inp.value.trim() : '');
  if (!text && !extra.type) return;
  if (chat.permissions && chat.permissions.sendMessages === 'admins'
      && (chat.type === 'group' || chat.type === 'channel')) {
    const myName = state.me.name;
    const isAdmin = (chat.admins || []).includes(myName);
    if (!isAdmin) { toast('فقط مدیران می‌توانند پیام بفرستند', 'error'); return; }
  }
  const m = Object.assign({
    id:rid(), text, out:true, ts:Date.now(), status:'sent', type:'text',
    replyTo:replyToMsg, reactions:{}, deleted:false, editedForAll:false,
    seenCount:0, seenTarget:0, linkPreview:null, _fakeReactionCounts:{}
  }, extra);
  if (m.type === 'text' && m.text) {
    const u = firstUrl(m.text);
    if (u) m.linkPreview = buildLinkPreview(u);
  }
  chat.messages.push(m);
  if (chat.type === 'private' && chat.username) {
    syncMessageToTargetAccount(chat.username, m, state.me);
  }
  if (textOverride === undefined && inp) {
    inp.value = ''; chat.draft = ''; autoGrow();
    const _tb = $('#btn-send-text');
    if (_tb) _tb.classList.remove('show');
  }
  replyToMsg = null; hideReplyBar();
  renderMessages(); renderChatList();
  if (chat.type === 'channel') startSeenSim(chat, m);
  if (chat.type !== 'saved') simFakeReactions(chat, m);
  setTimeout(() => { m.status = 'delivered'; if (activeChatId === chat.id) renderMessages(false); save(); }, 600);
  setTimeout(() => { m.status = 'read'; if (activeChatId === chat.id) renderMessages(false); save(); }, 1700);
  if (chat.type === 'ai') { if (state.settings.aiMode && navigator.onLine) scheduleAIReply(chat, m.text); else scheduleReply(chat); return; }
  if (state.settings.autoReply && chat.type !== 'saved' && chat.type !== 'channel') {
    if (state.settings.aiMode && navigator.onLine) scheduleAIReply(chat, m.text);
    else scheduleReply(chat);
  }
  if (m.type === 'poll') simulatePollVotes(chat, m);
}

/* ---------- AI reply ---------- */
async function scheduleAIReply(chat, userMsg) {
  const c = getChat(chat.id);
  if (!c) return;
  await new Promise(r => setTimeout(r, 500 + Math.random()*600));
  if (chat.type === 'group') {
    const members = c.membersList || [];
    if (!members.length) return;
    const n = Math.random() > 0.5 ? 2 : 1;
    const shuffled = members.slice().sort(()=>Math.random()-0.5);
    const repliers = shuffled.slice(0, Math.min(n, members.length));
    for (let i = 0; i < repliers.length; i++) {
      const member = repliers[i];
      if (i > 0) await new Promise(r => setTimeout(r, 1400 + Math.random()*1800));
      c.typing = true; c.typingSender = member.name;
      if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
      save();
      const history = c.messages.filter(x => x.type === 'text' && !x.deleted).slice(-6).map(x => ({out:x.out, text:x.text, sender:x.sender}));
      const prompt = `تو نقش «${member.name}» رو داری، عضو گروه «${c.name}» هستی. کوتاه (۲ خط)، فارسی خودمونی، دوستانه.`;
      let reply = await fetchAI(userMsg, history, prompt);
      if (!reply) reply = ['😄','👌','موافقم','دمت گرم','باشه','چه جالب!','منم همینطور','عالیه!','😅','🚀'][Math.floor(Math.random()*10)];
      c.typing = false; c.typingSender = null;
      const rm = { id:rid(), text:reply, out:false, ts:Date.now(), type:'text', replyTo:null, sender:member.name, reactions:{}, deleted:false, editedForAll:false, seenCount:0, seenTarget:0, linkPreview:null, _fakeReactionCounts:{} };
      const u = firstUrl(reply); if (u) rm.linkPreview = buildLinkPreview(u);
      c.messages.push(rm);
      simFakeReactions(c, rm);
      if (activeChatId !== c.id) c.unread = (c.unread||0) + 1;
      if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
      renderChatList(); save();
      if (state.settings.sounds) beep();
      notifyIncoming(c, member.name + ': ' + reply);
    }
    return;
  }
  c.typing = true;
  if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
  save();
  const history = c.messages.filter(x => x.type === 'text' && !x.deleted).slice(-8, -1);
  let reply = await fetchAI(userMsg, history);
  if (!reply) { reply = REPLIES[Math.floor(Math.random()*REPLIES.length)]; if (chat.type === 'ai') reply = '⚠️ اتصال ممکن نشد.\n' + reply; }
  c.typing = false;
  const rm = { id:rid(), text:reply, out:false, ts:Date.now(), type:'text', replyTo:null, sender:null, reactions:{}, deleted:false, editedForAll:false, seenCount:0, seenTarget:0, linkPreview:null, _fakeReactionCounts:{} };
  const u = firstUrl(reply); if (u) rm.linkPreview = buildLinkPreview(u);
  c.messages.push(rm);
  simFakeReactions(c, rm);
  if (activeChatId !== c.id) c.unread = (c.unread||0) + 1;
  if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
  renderChatList(); save();
  if (state.settings.sounds) beep();
  notifyIncoming(c, reply);
}

function scheduleReply(chat) {
  setTimeout(() => {
    const c = getChat(chat.id);
    if (!c) return;
    c.typing = true;
    if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
    save();
    setTimeout(() => {
      c.typing = false;
      let sender = null;
      if (c.type === 'group' && c.membersList?.length) {
        const mem = c.membersList[Math.floor(Math.random()*c.membersList.length)];
        sender = mem.name;
      }
      const reply = REPLIES[Math.floor(Math.random()*REPLIES.length)];
      const msg = { id:rid(), text:reply, out:false, ts:Date.now(), type:'text', replyTo:null, sender, reactions:{}, deleted:false, editedForAll:false, seenCount:0, seenTarget:0, linkPreview:null, _fakeReactionCounts:{} };
      const u = firstUrl(reply); if (u) msg.linkPreview = buildLinkPreview(u);
      c.messages.push(msg);
      simFakeReactions(c, msg);
      if (activeChatId !== c.id) c.unread = (c.unread||0) + 1;
      if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
      renderChatList(); save();
      if (state.settings.sounds) beep();
      notifyIncoming(c, reply);
    }, 900 + Math.random()*1400);
  }, 800 + Math.random()*1400);
}

/* ---------- notifications ---------- */
async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
}
function notifyIncoming(chat, text) {
  if (!state.settings.notifications) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (chat.muted) return;
  if (document.visibilityState === 'visible' && activeChatId === chat.id) return;
  try {
    const n = new Notification(chat.name, { body:text, tag:chat.id, silent:!state.settings.sounds });
    n.onclick = () => { window.focus(); if (chat.id) openChat(chat.id); n.close(); };
  } catch {}
}

/* ---------- beep ---------- */
let audioCtx;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 880; o.type = 'sine';
    g.gain.setValueAtTime(0.001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    o.start(); o.stop(audioCtx.currentTime + 0.26);
  } catch {}
}

/* ---------- composer ---------- */
const inputEl = $('#msg-input');
const sendTextBtn = $('#btn-send-text');
function autoGrow() { if (!inputEl) return; inputEl.style.height = 'auto'; inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px'; }
function updateSendBtnState() { if (!inputEl || !sendTextBtn) return; const has = inputEl.value.trim().length > 0; sendTextBtn.classList.toggle('show', has); }

if (inputEl) {
  inputEl.addEventListener('input', () => {
    autoGrow(); updateSendBtnState();
    const c = getChat(activeChatId);
    if (c && !isWarnerChat(c)) { c.draft = inputEl.value; save(); }
  });
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && state.settings.enterToSend && innerWidth > 820) {
      e.preventDefault();
      const t = inputEl.value.trim();
      if (t) { sendMessage(); }
    }
  });
}
if (sendTextBtn) {
  sendTextBtn.addEventListener('click', e => {
    e.preventDefault();
    const t = inputEl ? inputEl.value.trim() : '';
    if (t) sendMessage();
  });
}

/* ---------- voice recording ---------- */
let recInterval = null, recStart = 0, recActive = false;
let mediaRecorder = null, chunks = [], stream = null;

async function startRec() {
  const chat = getChat(activeChatId);
  if (chat && isWarnerChat(chat)) {
    toast('امکان ارسال پیام به این کاربر وجود ندارد', 'error');
    return;
  }
  recActive = true; recStart = Date.now(); chunks = [];
  $('#composer').style.display = 'none';
  $('#rec-bar').classList.add('show');
  $('#rec-time').textContent = '0:00';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
    mediaRecorder = mime ? new MediaRecorder(stream, {mimeType:mime}) : new MediaRecorder(stream);
    mediaRecorder.ondataavailable = ev => { if (ev.data.size > 0) chunks.push(ev.data); };
    mediaRecorder.start();
  } catch {
    toast('دسترسی به میکروفون داده نشد', 'error');
    recActive = false;
    $('#composer').style.display = 'flex';
    $('#rec-bar').classList.remove('show');
    return;
  }
  recInterval = setInterval(() => {
    const s = (Date.now() - recStart) / 1000;
    $('#rec-time').textContent = fmtDur(s);
    if (s > 60) stopRec(false);
  }, 100);
}

function stopRec(cancel) {
  if (!recActive) return;
  recActive = false;
  clearInterval(recInterval);
  $('#rec-bar').classList.remove('show');
  $('#composer').style.display = 'flex';
  const dur = (Date.now() - recStart) / 1000;
  const cleanup = () => { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } mediaRecorder = null; };
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, {type:mediaRecorder.mimeType || 'audio/webm'});
      cleanup();
      if (cancel || dur < 0.8) { toast('ضبط لغو شد', 'info'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        sendMessage({ type:'voice', dur:Math.round(dur*10)/10, dataUrl:reader.result, size:fmtBytes(blob.size) }, '');
        toast('پیام صوتی ارسال شد', 'success');
      };
      reader.readAsDataURL(blob);
    };
    try { mediaRecorder.stop(); } catch { cleanup(); }
  } else {
    cleanup();
    if (!cancel && dur >= 0.8) toast('ضبط صدا ممکن نشد', 'error');
  }
}

const recCancelBtn = $('#rec-cancel');
if (recCancelBtn) recCancelBtn.addEventListener('click', () => stopRec(true));

/* ---------- reply bar ---------- */
function showReplyBar(m) {
  replyToMsg = m.id;
  const chat = getChat(activeChatId);
  $('#rb-name').textContent = m.out ? 'شما' : (m.sender || chat.name);
  $('#rb-text').textContent = m.deleted ? 'پیام حذف‌شده' : (m.type === 'text' ? m.text : 'پیوست');
  $('#reply-bar').classList.add('show');
  if (inputEl) inputEl.focus();
}
function hideReplyBar() { replyToMsg = null; const el = $('#reply-bar'); if (el) el.classList.remove('show'); }
const rbClose = $('#rb-close');
if (rbClose) rbClose.addEventListener('click', hideReplyBar);

/* ---------- messages click / double tap / long press / right click ---------- */
let currentAudio = null, currentAudioBtn = null;

$('#messages').addEventListener('click', e => {
  const mp = e.target.closest('.mention-preview');
  if (mp) { openProfilePreview(mp.dataset.mentionPreview); return; }
  const ml = e.target.closest('.mention-link');
  if (ml) { e.preventDefault(); openProfilePreview(ml.dataset.mention); return; }
  const rp = e.target.closest('.reaction-pill');
  if (rp) {
    const chat = getChat(activeChatId);
    const m = chat.messages.find(x => x.id === rp.dataset.reactMsg);
    if (m) { toggleReaction(m, rp.dataset.reactEmoji, chat); renderMessages(false); save(); }
    return;
  }
  const btn = e.target.closest('.vplay');
  if (!btn) return;
  const msgEl = btn.closest('.msg');
  const chat = getChat(activeChatId);
  const m = chat.messages.find(x => x.id === msgEl.dataset.id);
  if (!m) return;
  if (currentAudio && currentAudioBtn === btn) {
    if (currentAudio.paused) { currentAudio.play().catch(()=>{}); btn.innerHTML = icon('pause',16); btn.classList.add('playing'); }
    else { currentAudio.pause(); btn.innerHTML = icon('play',16); btn.classList.remove('playing'); }
    return;
  }
  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    if (currentAudioBtn) {
      currentAudioBtn.innerHTML = icon('play',16);
      currentAudioBtn.classList.remove('playing');
      const pm = currentAudioBtn.closest('.msg');
      if (pm) pm.querySelectorAll('.vwave i').forEach(b => b.style.animation = '');
    }
  }
  if (m.dataUrl) {
    currentAudio = new Audio(m.dataUrl);
    currentAudioBtn = btn;
    btn.innerHTML = icon('pause',16);
    btn.classList.add('playing');
    const bars = msgEl.querySelectorAll('.vwave i');
    bars.forEach((b,i) => b.style.animation = `vpulse .45s ${i*0.04}s infinite alternate`);
    const stop = () => {
      btn.innerHTML = icon('play',16);
      btn.classList.remove('playing');
      bars.forEach(b => b.style.animation = '');
      currentAudio = null; currentAudioBtn = null;
    };
    currentAudio.onended = stop;
    currentAudio.onerror = stop;
    currentAudio.play().catch(stop);
    return;
  }
  btn.innerHTML = icon('pause',16);
  btn.classList.add('playing');
  const bars = msgEl.querySelectorAll('.vwave i');
  bars.forEach((b,i) => b.style.animation = `vpulse .45s ${i*0.04}s infinite alternate`);
  setTimeout(() => {
    btn.innerHTML = icon('play',16);
    btn.classList.remove('playing');
    bars.forEach(b => b.style.animation = '');
  }, (m.dur || 3) * 1000);
});

let lastTapTime = 0, lastTapId = null;
$('#messages').addEventListener('pointerup', e => {
  if (e.target.closest('.mention-preview') || e.target.closest('.mention-link') ||
      e.target.closest('.link-preview') || e.target.closest('.reaction-pill') || e.target.closest('.poll-opt')) return;
  const el = e.target.closest('.msg');
  if (!el) return;
  const now = Date.now();
  if (lastTapId === el.dataset.id && now - lastTapTime < 350) {
    const chat = getChat(activeChatId);
    const m = chat.messages.find(x => x.id === el.dataset.id);
    if (m) { toggleReaction(m, '❤️', chat); renderMessages(false); save(); if (navigator.vibrate) navigator.vibrate(12); }
    lastTapId = null;
  } else { lastTapId = el.dataset.id; lastTapTime = now; }
});

let pressTimer = null, pressStart = null, pressedMsgEl = null;
$('#messages').addEventListener('pointerdown', e => {
  if (e.target.closest('.reaction-pill') || e.target.closest('.mention-preview') ||
      e.target.closest('.mention-link') || e.target.closest('.link-preview') || e.target.closest('.poll-opt')) return;
  const el = e.target.closest('.msg');
  if (!el || el.classList.contains('typing')) return;
  pressStart = {x:e.clientX, y:e.clientY};
  pressedMsgEl = el;
  pressTimer = setTimeout(() => {
    if (pressedMsgEl) { if (navigator.vibrate) navigator.vibrate(15); showMsgMenu(pressedMsgEl); }
    pressTimer = null; pressStart = null;
  }, 450);
});
$('#messages').addEventListener('pointermove', e => {
  if (!pressStart) return;
  if (Math.abs(e.clientX - pressStart.x) > 8 || Math.abs(e.clientY - pressStart.y) > 8) {
    clearTimeout(pressTimer); pressTimer = null; pressStart = null;
  }
});
['pointerup','pointercancel'].forEach(ev =>
  $('#messages').addEventListener(ev, () => { clearTimeout(pressTimer); pressTimer = null; pressStart = null; }));

$('#messages').addEventListener('contextmenu', e => {
  const el = e.target.closest('.msg');
  if (!el || el.classList.contains('typing')) return;
  if (e.target.closest('.reaction-pill') || e.target.closest('.mention-preview') ||
      e.target.closest('.mention-link') || e.target.closest('.link-preview') || e.target.closest('.poll-opt') || e.target.closest('.vplay')) return;
  e.preventDefault(); e.stopPropagation();
  showMsgMenu(el);
});

function showMsgMenu(el) {
  const chat = getChat(activeChatId);
  const m = chat.messages.find(x => x.id === el.dataset.id);
  if (!m) return;
  el.classList.add('selected');
  setTimeout(() => el.classList.remove('selected'), 400);
  let items = `<div class="sheet-item" data-mact="reply">${icon('reply')}پاسخ</div>`;
  items += `<div class="sheet-item" data-mact="react">${icon('smile')}واکنش</div>`;
  if (m.type === 'text' && !m.deleted) items += `<div class="sheet-item" data-mact="copy">${icon('copy')}کپی</div>`;
  if (m.out && m.type === 'text' && !m.deleted) items += `<div class="sheet-item" data-mact="edit">${icon('edit')}ویرایش</div>`;
  if (!m.deleted && chat.type !== 'saved') items += `<div class="sheet-item" data-mact="save">${icon('bookmark')}ذخیره</div>`;
  items += `<div class="sheet-item" data-mact="forward">${icon('forward')}هدایت</div>`;
  if (chat.type !== 'ai' && chat.type !== 'saved') {
    items += `<div class="sheet-item" data-mact="give-badge">${icon('verified')}دادن نشان تایید</div>`;
    items += `<div class="sheet-item" data-mact="warn" style="color:#f59e0b">${icon('alert')}ارسال اخطار</div>`;
    items += `<div class="sheet-item" data-mact="set-warner">${icon('user')}تنظیم به عنوان اخطار دهنده</div>`;
    items += `<div class="sheet-item danger" data-mact="ban">${icon('ban')}بن کردن</div>`;
  }
  if (m.out && !m.deleted) items += `<div class="sheet-item danger" data-mact="delete-all">${icon('trash')}حذف برای همه</div>`;
  items += `<div class="sheet-item danger" data-mact="delete">${icon('trash')}حذف</div>`;
  openSheet(`<div class="sheet-title">پیام</div>${items}`);
  $$('#sheet-content [data-mact]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.mact;
    closeSheet();
    if (act === 'react') { setTimeout(() => showReactionPicker(el, chat, m), 200); return; }
    setTimeout(() => handleMsgAction(act, chat, m), 120);
  }));
}

function copyClip(text) {
  if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text);
  return new Promise((res, rej) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta); res();
    } catch (e) { rej(e); }
  });
}

function saveToSaved(chat, m) {
  let saved = state.chats.find(c => c.type === 'saved');
  if (!saved) {
    saved = { id:'saved_msgs', name:'پیام‌های ذخیره‌شده', type:'saved', avatar:{type:'gradient',value:6}, badgeType:null, username:'', isPublic:false, unread:0, pinned:false, muted:false, draft:'', joined:true, createdAt:Date.now(), messages:[] };
    state.chats.push(saved);
  }
  saved.messages.push({
    id:rid(), text:m.text, out:true, ts:Date.now(), status:'sent', type:m.type, replyTo:null,
    dur:m.dur, bg:m.bg, size:m.size, dataUrl:m.dataUrl, savedFrom:chat.name, originalSender:m.sender||null, poll:m.poll,
    reactions:{}, deleted:false, editedForAll:false, seenCount:0, seenTarget:0, linkPreview:m.linkPreview||null, _fakeReactionCounts:{}
  });
  save(); renderChatList(); toast('ذخیره شد ✓', 'success');
}

function handleMsgAction(act, chat, m) {
  if (act === 'reply') { showReplyBar(m); return; }
  if (act === 'copy') { copyClip(m.text||'').then(()=>toast('کپی شد', 'success'), ()=>toast('کپی نشد', 'error')); return; }
  if (act === 'edit') {
    showPrompt('ویرایش پیام', m.text, val => {
      if (!val.trim()) return;
      m.text = val.trim(); m.editedForAll = true; m.edited = true;
      const u = firstUrl(m.text); m.linkPreview = u ? buildLinkPreview(u) : null;
      renderMessages(false); renderChatList(); save(); toast('ویرایش شد', 'success');
    }); return;
  }
  if (act === 'save') { saveToSaved(chat, m); return; }
  if (act === 'forward') {
    if (!state.chats.length) { toast('چتی برای هدایت نیست', 'error'); return; }
    openSheet(`<div class="sheet-title">هدایت به…</div>` + state.chats.map(c => `<div class="sheet-item" data-fwd="${c.id}">${avatarHTML(c,38)}${esc(c.name)}</div>`).join(''));
    $$('#sheet-content [data-fwd]').forEach(b => b.addEventListener('click', () => {
      const t = getChat(b.dataset.fwd);
      t.messages.push({ id:rid(), text:m.text, out:true, ts:Date.now(), status:'sent', type:m.type, replyTo:null, dur:m.dur, bg:m.bg, size:m.size, dataUrl:m.dataUrl, forwarded:true, originalSender:m.sender||null, poll:m.poll, reactions:{}, deleted:false, editedForAll:false, seenCount:0, seenTarget:0, linkPreview:m.linkPreview||null, _fakeReactionCounts:{} });
      closeSheet(); renderChatList(); save(); toast('هدایت شد', 'success');
    })); return;
  }
  if (act === 'warn') { openWarnModal(chat.id); return; }
  if (act === 'set-warner') {
    const targetName = m.sender || chat.name;
    const targetUsername = m.sender ? '' : (chat.username || '');
    state.globalWarner = { name: targetName, username: targetUsername, avatar: m.senderAvatar || chat.avatar, badgeType: m.senderBadge || chat.badgeType };
    save();
    toast(`«${targetName}» به عنوان اخطار دهنده تنظیم شد ✓`, 'success');
    return;
  }
  if (act === 'give-badge') {
    openSheet(`
      <div class="sheet-title">انتخاب نشان تایید</div>
      <div class="sheet-item" data-badge="none">${icon('ban')}بدون نشان</div>
      <div class="sheet-item" data-badge="blue">${vfHTML('blue', 20)} نشان افراد سرشناس</div>
      <div class="sheet-item" data-badge="yellow">${vfHTML('yellow', 20)} نشان سازمانی</div>
      <div class="sheet-item" data-badge="green">${vfHTML('green', 20)} نشان تجاری</div>
      <div class="sheet-item" data-badge="personal">${vfHTML('personal', 20)} نشان شخصی</div>
    `);
    $$('#sheet-content [data-badge]').forEach(b => b.addEventListener('click', () => {
      const bType = b.dataset.badge;
      if (chat.type === 'private') chat.badgeType = bType === 'none' ? null : bType;
      closeSheet(); renderMessages(false); renderChatList(); save();
      toast('نشان داده شد', 'success');
    }));
    return;
  }
  if (act === 'ban') { banUser(chat.id); return; }
  if (act === 'delete-all') {
    showConfirm('حذف برای همه', 'این پیام برای همه حذف شود؟', () => {
      m.deleted = true; m.text = ''; m.dataUrl = null; m.linkPreview = null;
      m.reactions = {}; m._fakeReactionCounts = {};
      renderMessages(false); renderChatList(); save(); toast('حذف شد', 'success');
    }); return;
  }
  if (act === 'delete') {
    showConfirm('حذف پیام', 'فقط برای شما حذف شود؟', () => {
      chat.messages = chat.messages.filter(x => x.id !== m.id);
      renderMessages(false); renderChatList(); save(); toast('حذف شد', 'success');
    }); return;
  }
}

/* ---------- chat list click / long press / right click ---------- */
let chatPressTimer = null, chatPressStart = null, pressedChatItem = null;
let chatLongPressFired = false;

$('#chat-list').addEventListener('pointerdown', e => {
  const item = e.target.closest('.chat-item');
  if (!item || (!item.dataset.id && !item.dataset.directory)) return;
  chatPressStart = {x:e.clientX, y:e.clientY};
  pressedChatItem = item;
  chatLongPressFired = false;
  chatPressTimer = setTimeout(() => {
    if (pressedChatItem) {
      chatLongPressFired = true;
      if (navigator.vibrate) navigator.vibrate(20);
      if (pressedChatItem.dataset.id) showChatMenu(pressedChatItem.dataset.id);
      else if (pressedChatItem.dataset.directory) {
        const d = (state.directory||[]).find(x => x.id === pressedChatItem.dataset.directory);
        if (d && d.username) openProfilePreview(d.username);
      }
    }
    chatPressTimer = null; chatPressStart = null;
  }, 450);
});
$('#chat-list').addEventListener('pointermove', e => {
  if (!chatPressStart) return;
  if (Math.abs(e.clientX - chatPressStart.x) > 8 || Math.abs(e.clientY - chatPressStart.y) > 8) {
    clearTimeout(chatPressTimer); chatPressTimer = null; chatPressStart = null;
  }
});
['pointerup','pointercancel'].forEach(ev =>
  $('#chat-list').addEventListener(ev, () => { clearTimeout(chatPressTimer); chatPressTimer = null; chatPressStart = null; }));

$('#chat-list').addEventListener('contextmenu', e => {
  const item = e.target.closest('.chat-item');
  if (!item) return;
  e.preventDefault(); e.stopPropagation();
  clearTimeout(chatPressTimer);
  chatPressTimer = null; chatPressStart = null;
  if (item.dataset.id) showChatMenu(item.dataset.id);
  else if (item.dataset.directory) {
    const d = (state.directory||[]).find(x => x.id === item.dataset.directory);
    if (d && d.username) openProfilePreview(d.username);
  }
});

$('#chat-list').addEventListener('click', e => {
  if (chatLongPressFired) { chatLongPressFired = false; return; }
  const mr = e.target.closest('.msg-search-result');
  if (mr) {
    const chatId = mr.dataset.resultChat, msgId = mr.dataset.resultMsg;
    $('#search-input').value = ''; $('#searchbar').style.display = 'none'; renderChatList();
    openChat(chatId);
    setTimeout(() => {
      const el = document.querySelector(`.msg[data-id="${msgId}"]`);
      if (el) { el.scrollIntoView({block:'center', behavior:'smooth'}); el.classList.add('selected'); setTimeout(()=>el.classList.remove('selected'), 900); }
    }, 250);
    return;
  }
  const di = e.target.closest('[data-directory]');
  if (di) {
    const d = (state.directory||[]).find(x => x.id === di.dataset.directory);
    if (d) {
      const joinedChat = state.chats.find(c => c.id === d.id || (d.username && c.username === d.username));
      if (joinedChat) {
        openChat(joinedChat.id);
      } else if (d.username) {
        openProfilePreview(d.username);
      }
    }
    return;
  }
  const item = e.target.closest('.chat-item');
  if (item && item.dataset.id) openChat(item.dataset.id);
});

function showChatMenu(id) {
  const c = getChat(id);
  if (!c) return;
  let items = `<div class="sheet-item" data-clact="open">${icon('chat-outline')}باز کردن</div>`;
  if (c.type !== 'ai' && c.type !== 'saved') items += `<div class="sheet-item" data-clact="verified">${icon('verified')}تغییر نشان تایید</div>`;
  items += `<div class="sheet-item" data-clact="pin">${icon('pin')}${c.pinned?'برداشتن سنجاق':'سنجاق'}</div>`;
  items += `<div class="sheet-item" data-clact="mute">${icon(c.muted?'bell':'bell-off')}${c.muted?'فعال کردن اعلان':'بی‌صدا'}</div>`;
  items += `<div class="sheet-item" data-clact="info">${icon('user')}اطلاعات</div>`;
  items += `<div class="sheet-item" data-clact="read">${icon('check')}خوانده‌شده</div>`;
  if (c.type !== 'ai' && c.type !== 'saved') {
    items += `<div class="sheet-item" data-clact="warn" style="color:#f59e0b">${icon('alert')}ارسال اخطار</div>`;
    items += `<div class="sheet-item" data-clact="set-warner">${icon('user')}تنظیم به عنوان اخطار دهنده</div>`;
    items += `<div class="sheet-item danger" data-clact="ban">${icon('ban')}بن کردن</div>`;
  }
  items += `<div class="sheet-item danger" data-clact="delete">${icon('trash')}حذف</div>`;
  openSheet(`<div class="sheet-title">${esc(c.name)}</div>${items}`);
  $$('#sheet-content [data-clact]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.clact;
    closeSheet();
    setTimeout(() => {
      if (act === 'open') { openChat(c.id); return; }
      if (act === 'verified') {
        openSheet(`
          <div class="sheet-title">انتخاب نشان تایید</div>
          <div class="sheet-item" data-badge="none">${icon('ban')}بدون نشان</div>
          <div class="sheet-item" data-badge="blue">${vfHTML('blue', 20)} نشان افراد سرشناس</div>
          <div class="sheet-item" data-badge="yellow">${vfHTML('yellow', 20)} نشان سازمانی</div>
          <div class="sheet-item" data-badge="green">${vfHTML('green', 20)} نشان تجاری</div>
          <div class="sheet-item" data-badge="personal">${vfHTML('personal', 20)} نشان شخصی</div>
        `);
        $$('#sheet-content [data-badge]').forEach(b2 => b2.addEventListener('click', () => {
          const bType = b2.dataset.badge;
          c.badgeType = bType === 'none' ? null : bType;
          closeSheet(); renderChatList(); save();
          toast('نشان تغییر کرد', 'success');
        }));
        return;
      }
      if (act === 'pin') { c.pinned = !c.pinned; toast(c.pinned?'سنجاق شد':'برداشته شد', 'info'); renderChatList(); save(); return; }
      if (act === 'mute') { c.muted = !c.muted; toast(c.muted?'بی‌صدا شد':'اعلان فعال', 'info'); renderChatList(); save(); return; }
      if (act === 'info') { openInfo(c.id); return; }
      if (act === 'read') { c.unread = 0; renderChatList(); save(); toast('خوانده شد', 'success'); return; }
      if (act === 'warn') { openWarnModal(c.id); return; }
      if (act === 'set-warner') {
        state.globalWarner = { name: c.name, username: c.username || '', avatar: c.avatar, badgeType: c.badgeType };
        save();
        toast(`«${c.name}» به عنوان اخطار دهنده تنظیم شد ✓`, 'success');
        return;
      }
      if (act === 'ban') { banUser(c.id); return; }
      if (act === 'delete') {
        showConfirm('حذف گفتگو', 'کل این گفتگو حذف شود؟', () => {
          state.chats = state.chats.filter(x => x.id !== c.id);
          state.contacts = state.contacts.filter(x => x.id !== c.id);
          renderChatList(); renderContacts(); save(); toast('حذف شد', 'success');
        }); return;
      }
    }, 120);
  }));
}

/* ---------- overlays ---------- */
const sheetOverlay = $('#sheet-overlay');
const emojiOverlay = $('#emoji-overlay');
const avatarOverlay = $('#avatar-overlay');
const modalOverlay = $('#modal');

function openSheet(html) { const sc = $('#sheet-content'); if (sc) sc.innerHTML = html; sheetOverlay.classList.add('show'); }
function closeSheet() { sheetOverlay.classList.remove('show'); }
sheetOverlay.addEventListener('click', e => { if (e.target === sheetOverlay) closeSheet(); });

/* ---------- avatar picker ---------- */
let avatarTarget = null, avatarTargetType = null;
function getAvatarEntity() {
  if (avatarTargetType === 'me') return state.me;
  if (avatarTargetType === 'chat') return getChat(avatarTarget);
  if (avatarTargetType === 'contact') return state.contacts.find(c => c.id === avatarTarget);
  return null;
}

function renderAvatarPicker(tab = 'gradient') {
  const e = getAvatarEntity();
  if (!e) return;
  const cur = e.avatar || {type:'gradient',value:0};
  let body = '';
  if (tab === 'gradient') {
    const cv = (typeof cur.value === 'number') ? cur.value : 0;
    body = `<div class="av-grid">${AV_GRADS.map((g,i) => `<button class="av-color${cur.type==='gradient'&&cv===i?' sel':''}" data-grad="${i}" style="background:linear-gradient(135deg,${g[0]},${g[1]})"></button>`).join('')}</div>`;
  } else if (tab === 'emoji') {
    body = `<div class="av-grid" style="grid-template-columns:repeat(6,1fr)">${AV_EMOJIS.map(em => `<button class="${cur.type==='emoji'&&cur.value===em?' sel':''}" data-emo="${em}" style="font-size:24px">${em}</button>`).join('')}</div>`;
  } else {
    body = `<div class="av-upload" id="av-upload-btn">${icon('camera',22)} انتخاب عکس</div><div style="text-align:center;font-size:12px;color:var(--text-3);padding:14px 20px 4px;line-height:1.6">به صورت خودکار کوچک می‌شود</div>`;
  }
  $('#avatar-panel').innerHTML = `
    <div class="av-tabs">
      <button data-avtab="gradient" class="${tab==='gradient'?'active':''}">${icon('palette',20)}رنگ</button>
      <button data-avtab="emoji" class="${tab==='emoji'?'active':''}">${icon('smile',20)}ایموجی</button>
      <button data-avtab="image" class="${tab==='image'?'active':''}">${icon('image',20)}تصویر</button>
    </div>
    <div class="av-preview"><div class="avatar" style="${avatarBgStyle(e)}">${avatarContent(e)}</div></div>
    <div class="av-section">${body}</div>
  `;
  $$('#avatar-panel [data-avtab]').forEach(b => b.addEventListener('click', () => renderAvatarPicker(b.dataset.avtab)));
  $$('#avatar-panel [data-grad]').forEach(b => b.addEventListener('click', () => {
    e.avatar = {type:'gradient', value:parseInt(b.dataset.grad, 10)};
    applyAvatarChange(); renderAvatarPicker('gradient');
  }));
  $$('#avatar-panel [data-emo]').forEach(b => b.addEventListener('click', () => {
    e.avatar = {type:'emoji', value:b.dataset.emo};
    applyAvatarChange(); renderAvatarPicker('emoji');
  }));
  const ub = $('#av-upload-btn');
  if (ub) ub.addEventListener('click', pickImage);
}

function pickImage() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    resizeImage(f, 320, url => {
      const e = getAvatarEntity();
      if (!e) return;
      e.avatar = {type:'image', value:url};
      applyAvatarChange();
    });
  };
  inp.click();
}

function resizeImage(file, maxSize, cb) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      let w = img.width, h = img.height;
      const ratio = Math.min(maxSize/w, maxSize/h, 1);
      w = Math.round(w*ratio); h = Math.round(h*ratio);
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(cv.toDataURL('image/jpeg', 0.85));
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

function applyAvatarChange() {
  save();
  if (avatarTargetType === 'me') { renderSettings(); renderChatList(); }
  else if (avatarTargetType === 'chat') {
    renderChatList();
    if (activeChatId === avatarTarget) renderChatHeader();
    if (infoChatId === avatarTarget) renderInfo();
  } else if (avatarTargetType === 'contact') renderContacts();
  toast('ذخیره شد', 'success');
}

function openAvatarPicker(t, id) { avatarTargetType = t; avatarTarget = id; renderAvatarPicker('gradient'); avatarOverlay.classList.add('show'); }
function closeAvatarPicker() { avatarOverlay.classList.remove('show'); }
avatarOverlay.addEventListener('click', e => { if (e.target === avatarOverlay) closeAvatarPicker(); });

/* ---------- emoji ---------- */
let emojiActiveCat = 'smileys';
function openEmoji() { if (!$('#emoji-panel').innerHTML) renderEmojiPanel(); emojiOverlay.classList.add('show'); }
function renderEmojiPanel() {
  const cats = Object.keys(EMOJIS);
  $('#emoji-panel').innerHTML = `
    <div class="emoji-cats" id="emoji-cats">${cats.map(k => `<button data-cat="${k}" class="${k===emojiActiveCat?'active':''}">${EMOJIS[k].icon}</button>`).join('')}</div>
    <div class="emoji-scroll" id="emoji-scroll">
      <div class="cat-title">${EMOJIS[emojiActiveCat].name}</div>
      <div class="emoji-grid">${EMOJIS[emojiActiveCat].list.map(e => `<button data-emoji="${e}">${e}</button>`).join('')}</div>
    </div>
  `;
  $$('#emoji-cats [data-cat]').forEach(b => b.addEventListener('click', () => {
    emojiActiveCat = b.dataset.cat;
    $$('#emoji-cats [data-cat]').forEach(x => x.classList.toggle('active', x.dataset.cat === emojiActiveCat));
    const sc = $('#emoji-scroll');
    sc.innerHTML = `<div class="cat-title">${EMOJIS[emojiActiveCat].name}</div><div class="emoji-grid">${EMOJIS[emojiActiveCat].list.map(e => `<button data-emoji="${e}">${e}</button>`).join('')}</div>`;
    sc.scrollTop = 0;
    bindEmojis(sc);
  }));
  bindEmojis($('#emoji-scroll'));
}
function bindEmojis(scope) {
  $$('[data-emoji]', scope).forEach(b => b.addEventListener('click', () => {
    if (!inputEl) return;
    inputEl.value += b.dataset.emoji;
    autoGrow();
    updateSendBtnState();
    const c = getChat(activeChatId);
    if (c) { c.draft = inputEl.value; save(); }
  }));
}
emojiOverlay.addEventListener('click', e => { if (e.target === emojiOverlay) emojiOverlay.classList.remove('show'); });

/* ---------- composer action buttons ---------- */
const _btnPhoto = $('#btn-photo');
if (_btnPhoto) _btnPhoto.addEventListener('click', () => pickPhotoForMessage());
const _btnFile = $('#btn-file');
if (_btnFile) _btnFile.addEventListener('click', () => { sendMessage({type:'file', text:'document.pdf', size:'1.8 MB'}, ''); });
const _btnPoll = $('#btn-poll');
if (_btnPoll) _btnPoll.addEventListener('click', () => {
  $('#poll-q-input').value = '';
  $('#poll-options-container').innerHTML = `
    <input type="text" class="poll-opt-input" placeholder="گزینه ۱" style="margin-bottom: 6px; width: 100%; margin: 0 0 6px 0;">
    <input type="text" class="poll-opt-input" placeholder="گزینه ۲" style="margin-bottom: 6px; width: 100%; margin: 0 0 6px 0;">
  `;
  $('#poll-modal').classList.add('show');
});
const _btnAddPollOpt = $('#btn-add-poll-opt');
if (_btnAddPollOpt) _btnAddPollOpt.addEventListener('click', () => {
  const container = $('#poll-options-container');
  if (container.children.length >= 4) { toast('حداکثر ۴ گزینه', 'error'); return; }
  const input = document.createElement('input');
  input.type = 'text'; input.className = 'poll-opt-input'; input.placeholder = `گزینه ${container.children.length + 1}`;
  input.style.marginBottom = '6px'; input.style.width = '100%'; input.style.margin = '0 0 6px 0';
  container.appendChild(input);
});
const _btnCancelPoll = $('#btn-cancel-poll');
if (_btnCancelPoll) _btnCancelPoll.addEventListener('click', () => $('#poll-modal').classList.remove('show'));
const _btnSendPoll = $('#btn-send-poll');
if (_btnSendPoll) _btnSendPoll.addEventListener('click', () => {
  const q = $('#poll-q-input').value.trim();
  const opts = Array.from(document.querySelectorAll('.poll-opt-input')).map(i => i.value.trim()).filter(Boolean);
  if (!q || opts.length < 2) { toast('سوال و حداقل ۲ گزینه لازم است', 'error'); return; }
  const pollData = { question: q, options: opts.map(o => ({ text: o, votes: 0 })), votedIndex: null };
  sendMessage({ type: 'poll', poll: pollData, text: q }, '');
  $('#poll-modal').classList.remove('show');
});
const _btnEmoji = $('#btn-emoji');
if (_btnEmoji) _btnEmoji.addEventListener('click', openEmoji);
const _btnSend = $('#btn-send');
if (_btnSend) _btnSend.addEventListener('click', e => { e.preventDefault(); if (recActive) stopRec(false); else startRec(); });

function pickPhotoForMessage() {
  const chat = getChat(activeChatId);
  if (chat && isWarnerChat(chat)) {
    toast('امکان ارسال پیام به این کاربر وجود ندارد', 'error');
    return;
  }
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*,video/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    if (f.type.startsWith('video/')) {
      sendMessage({type:'file', text:f.name || 'video.mp4', size:fmtBytes(f.size)}, '');
      return;
    }
    resizeImage(f, 1080, url => { sendMessage({type:'photo', text:'', dataUrl:url, size:fmtBytes(f.size)}, ''); });
  };
  inp.click();
}

/* ---------- chat menu (3-line in chat header) ---------- */
$('#btn-chat-menu').addEventListener('click', () => {
  const c = getChat(activeChatId);
  if (!c) return;
  const memberItem = (c.type === 'group' || c.type === 'channel') ? `<div class="sheet-item" data-cact="members">${icon('users')}تعداد اعضا (${(c.members||0).toLocaleString('fa-IR')})</div>` : '';
  const coverItem = (c.type === 'group' || c.type === 'channel') ? `<div class="sheet-item" data-cact="cover">${icon('image')}${c.coverPhoto?'تغییر کاور':'افزودن کاور'}</div>` : '';
  const descItem = (c.type === 'group' || c.type === 'channel') ? `<div class="sheet-item" data-cact="desc">${icon('file')}${c.description?'ویرایش توضیحات':'افزودن توضیحات'}</div>` : '';
  const warnBtn = (c.type !== 'ai' && c.type !== 'saved') ? `<div class="sheet-item" data-cact="warn" style="color:#f59e0b">${icon('alert')}ارسال اخطار</div>` : '';
  const setWarnerBtn = (c.type !== 'ai' && c.type !== 'saved') ? `<div class="sheet-item" data-cact="set-warner">${icon('user')}تنظیم به عنوان اخطار دهنده</div>` : '';
  const banBtn = (c.type !== 'ai' && c.type !== 'saved') ? `<div class="sheet-item danger" data-cact="ban">${icon('ban')}بن کردن</div>` : '';

  openSheet(`
    <div class="sheet-title">${esc(c.name)}</div>
    <div class="sheet-item" data-cact="search">${icon('search')}جستجو در پیام‌ها</div>
    <div class="sheet-item" data-cact="info">${icon('user')}اطلاعات چت</div>
    <div class="sheet-item" data-cact="avatar">${icon('image')}تنظیم پروفایل</div>
    <div class="sheet-item" data-cact="wallpaper">${icon('image')}تغییر پس‌زمینه چت</div>
    ${coverItem}${descItem}
    <div class="sheet-item" data-cact="verified">${icon('verified')}تغییر نشان تایید</div>
    <div class="sheet-item" data-cact="rename">${icon('edit')}تغییر نام</div>
    ${memberItem}
    <div class="sheet-item" data-cact="pin">${icon('pin')}${c.pinned?'برداشتن سنجاق':'سنجاق'}</div>
    <div class="sheet-item" data-cact="mute">${icon(c.muted?'bell':'bell-off')}${c.muted?'فعال کردن اعلان':'بی‌صدا'}</div>
    ${warnBtn}${setWarnerBtn}${banBtn}
    <div class="sheet-item" data-cact="clear">${icon('trash')}پاک کردن تاریخچه</div>
    <div class="sheet-item danger" data-cact="delete">${icon('trash')}حذف گفتگو</div>
  `);

  $$('#sheet-content [data-cact]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.cact;
    closeSheet();
    setTimeout(() => {
      if (act === 'warn') { openWarnModal(c.id); return; }
      if (act === 'set-warner') {
        state.globalWarner = { name: c.name, username: c.username || '', avatar: c.avatar, badgeType: c.badgeType };
        save();
        toast(`«${c.name}» به عنوان اخطار دهنده تنظیم شد ✓`, 'success');
        return;
      }
      if (act === 'ban') { banUser(c.id); return; }
      if (act === 'search') { openMsgSearch(); return; }
      if (act === 'info') { openInfo(c.id); return; }
      if (act === 'avatar') { openAvatarPicker('chat', c.id); return; }
      if (act === 'wallpaper') { openWallpaperPicker(c); return; }
      if (act === 'cover') { pickCoverImage(c); return; }
      if (act === 'desc') { showPrompt('توضیحات', c.description||'', v => { c.description = v.trim(); renderChatList(); save(); toast('ذخیره شد', 'success'); }); return; }
      if (act === 'verified') {
        openSheet(`
          <div class="sheet-title">انتخاب نشان تایید</div>
          <div class="sheet-item" data-badge="none">${icon('ban')}بدون نشان</div>
          <div class="sheet-item" data-badge="blue">${vfHTML('blue', 20)} نشان افراد سرشناس</div>
          <div class="sheet-item" data-badge="yellow">${vfHTML('yellow', 20)} نشان سازمانی</div>
          <div class="sheet-item" data-badge="green">${vfHTML('green', 20)} نشان تجاری</div>
          <div class="sheet-item" data-badge="personal">${vfHTML('personal', 20)} نشان شخصی</div>
        `);
        $$('#sheet-content [data-badge]').forEach(b2 => b2.addEventListener('click', () => {
          const bType = b2.dataset.badge;
          c.badgeType = bType === 'none' ? null : bType;
          closeSheet(); renderChatHeader(); renderChatList(); save();
          toast('نشان تغییر کرد', 'success');
        }));
        return;
      }
      if (act === 'rename') { showPrompt('نام جدید', c.name, v => { if (!v.trim()) return; c.name = v.trim(); renderChatHeader(); renderChatList(); save(); toast('تغییر کرد', 'success'); }); return; }
      if (act === 'members') { showPrompt('تعداد اعضا', String(c.members||0), v => { const n = parseInt(v, 10); if (isNaN(n) || n < 0) { toast('عدد معتبر', 'error'); return; } c.members = Math.min(n, 9999999); renderChatHeader(); renderChatList(); save(); toast('تغییر کرد', 'success'); }); return; }
      if (act === 'pin') { c.pinned = !c.pinned; toast(c.pinned?'سنجاق':'برداشته شد', 'info'); }
      if (act === 'mute') { c.muted = !c.muted; toast(c.muted?'بی‌صدا':'فعال', 'info'); }
      if (act === 'clear') { c.messages = []; toast('پاک شد', 'success'); }
      if (act === 'delete') {
        showConfirm('حذف', 'کل چت حذف شود؟', () => {
          state.chats = state.chats.filter(x => x.id !== c.id);
          state.contacts = state.contacts.filter(x => x.id !== c.id);
          state.directory = (state.directory||[]).filter(x => x.id !== c.id);
          closeChat(); renderChatList(); renderContacts(); save(); toast('حذف شد', 'success');
        }); return;
      }
      renderChatList(); renderMessages(); save();
    }, 120);
  }));
});

/* ---------- message search ---------- */
function openMsgSearch() {
  $('#msg-search-bar').classList.add('show');
  $('#msg-search-input').value = '';
  $('#msg-search-count').textContent = '';
  setTimeout(() => $('#msg-search-input').focus(), 100);
}
function closeMsgSearch() {
  $('#msg-search-bar').classList.remove('show');
  msgSearchQuery = ''; msgSearchHits = []; msgSearchIndex = -1;
  renderMessages(false);
}
$('#msg-search-close').addEventListener('click', closeMsgSearch);

let msgSearchTimer = null;
$('#msg-search-input').addEventListener('input', e => {
  clearTimeout(msgSearchTimer);
  msgSearchTimer = setTimeout(() => {
    msgSearchQuery = e.target.value.trim();
    const chat = getChat(activeChatId);
    if (!chat) return;
    if (msgSearchQuery.length < 2) {
      msgSearchHits = []; msgSearchIndex = -1;
      $('#msg-search-count').textContent = '';
      renderMessages(false); return;
    }
    const q = msgSearchQuery.toLowerCase();
    msgSearchHits = chat.messages.filter(m => m.type === 'text' && m.text && !m.deleted && m.text.toLowerCase().includes(q)).map(m => m.id);
    msgSearchIndex = msgSearchHits.length ? 0 : -1;
    $('#msg-search-count').textContent = msgSearchHits.length ? `${(msgSearchIndex+1).toLocaleString('fa-IR')}/${msgSearchHits.length.toLocaleString('fa-IR')}` : 'یافت نشد';
    renderMessages(false);
    scrollToHit();
  }, 250);
});
function scrollToHit() {
  if (msgSearchIndex < 0) return;
  const el = document.querySelector(`.msg[data-id="${msgSearchHits[msgSearchIndex]}"]`);
  if (el) el.scrollIntoView({block:'center', behavior:'smooth'});
}
$('#msg-search-next').addEventListener('click', () => {
  if (!msgSearchHits.length) return;
  msgSearchIndex = (msgSearchIndex + 1) % msgSearchHits.length;
  $('#msg-search-count').textContent = `${(msgSearchIndex+1).toLocaleString('fa-IR')}/${msgSearchHits.length.toLocaleString('fa-IR')}`;
  scrollToHit();
});
$('#msg-search-prev').addEventListener('click', () => {
  if (!msgSearchHits.length) return;
  msgSearchIndex = (msgSearchIndex - 1 + msgSearchHits.length) % msgSearchHits.length;
  $('#msg-search-count').textContent = `${(msgSearchIndex+1).toLocaleString('fa-IR')}/${msgSearchHits.length.toLocaleString('fa-IR')}`;
  scrollToHit();
});

/* ---------- switch tab ---------- */
function switchTab(tab) {
  $$('.tab-body').forEach(t => t.classList.add('hidden'));
  const target = $('#tab-' + tab);
  if (target) target.classList.remove('hidden');
  const tnav = $('#top-nav');
  if (tnav) tnav.style.display = (tab === 'chats') ? 'flex' : 'none';
  const ncb = $('#btn-new-chat');
  if (ncb) ncb.style.display = (tab === 'chats') ? 'flex' : 'none';
  const titleEl = $('#list-title');
  if (titleEl) {
    const labels = {chats:'گپ', contacts:'مخاطبین', settings:'تنظیمات'};
    titleEl.innerHTML = `<span class="brand-text">${labels[tab] || 'گپ'}</span>`;
  }
  updateHeaderLeftBtn(tab);
  if (tab === 'contacts') renderContacts();
  if (tab === 'settings') renderSettings();
  if (tab === 'chats') renderChatList();
}

function updateHeaderLeftBtn(tab) {
  const btn = $('#btn-profile-top');
  if (!btn) return;
  if (tab === 'chats') {
    btn.classList.add('profile-circle-btn');
    btn.innerHTML = '<span class="profile-square" id="top-profile-avatar"></span>';
    btn.onclick = e => { e.preventDefault(); e.stopPropagation(); switchTab('settings'); };
    renderTopProfile();
  } else {
    btn.classList.remove('profile-circle-btn');
    btn.innerHTML = '<svg width="20" height="20"><use href="#i-back"/></svg>';
    btn.onclick = e => { e.preventDefault(); e.stopPropagation(); switchTab('chats'); };
  }
}

function bindTopNavTabs() {
  document.querySelectorAll('#top-nav .tnav-item').forEach(btn => {
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      chatFilter = btn.dataset.filter;
      document.querySelectorAll('#top-nav .tnav-item').forEach(b => b.classList.toggle('active', b.dataset.filter === chatFilter));
      renderChatList();
    });
  });
}
bindTopNavTabs();

/* ---------- search toggle ---------- */
$('#btn-search-toggle').addEventListener('click', () => {
  const sb = $('#searchbar');
  const open = sb.style.display === 'none';
  sb.style.display = open ? 'block' : 'none';
  if (open) $('#search-input').focus();
  else { $('#search-input').value = ''; renderChatList(); }
});
$('#search-input').addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(renderChatList, 120);
});
$('#search-clear').addEventListener('click', () => {
  $('#search-input').value = ''; renderChatList(); $('#search-input').focus();
});

/* ---------- new chat ---------- */
$('#btn-new-chat').addEventListener('click', () => {
  openSheet(`
    <div class="sheet-title">گفتگوی جدید</div>
    <div class="sheet-item" data-nt="private">${icon('user')}گفتگوی شخصی (با آیدی)</div>
    <div class="sheet-item" data-nt="group">${icon('users')}گروه</div>
    <div class="sheet-item" data-nt="channel">${icon('megaphone')}کانال</div>
    <div class="sheet-item" data-nt="ai">${icon('sparkle')}چت با هوش مصنوعی</div>
    <div class="sheet-item" data-nt="saved">${icon('bookmark')}پیام‌های ذخیره‌شده</div>
  `);
  $$('#sheet-content [data-nt]').forEach(b => b.addEventListener('click', () => {
    const type = b.dataset.nt;
    closeSheet();
    setTimeout(() => promptChatName(type), 150);
  }));
});

function promptChatName(type) {
  if (type === 'saved') {
    let ex = state.chats.find(c => c.type === 'saved');
    if (!ex) createChat({name:'پیام‌های ذخیره‌شده', type:'saved'});
    else { toast('از قبل موجوده', 'info'); setTimeout(() => openChat(ex.id), 150); }
    return;
  }
  if (type === 'ai') { createChat({name:'دستیار گپ', type:'ai', avatar:{type:'gradient',value:4}, badgeType:'blue', username:'gap_ai', online:true, joined:true}); return; }
  if (type === 'private') {
    showPrompt('آیدی کاربر (بدون @)', '', val => {
      const username = val.trim().replace(/@/g, '');
      if (!username) return;
      const f = findByUsername(username);
      if (f && (f.source === 'local_account' || f.source === 'chat' || f.source === 'directory')) {
        if (f.entity.type === 'group' || f.entity.type === 'channel') {
          toast('این یک گروه/کانال است. از بخش کشف عضو شوید.', 'info');
          return;
        }
        let chat = state.chats.find(c => c.username && normUser(c.username) === normUser(username));
        if (!chat) {
          chat = { id: rid(), name: f.entity.name, type: 'private', username: f.entity.username, avatar: f.entity.avatar, coverPhoto: f.entity.coverPhoto, badgeType: f.entity.badgeType, unread: 0, pinned: false, muted: false, draft: '', messages: [], createdAt: Date.now(), joined: true };
          state.chats.push(chat);
        }
        save(); renderChatList(); openChat(chat.id);
        return;
      }
      const name = username;
      const data = { name, type:'private', username: username, avatar:{type:'gradient',value:Math.floor(Math.random()*AV_GRADS.length)}, badgeType:null, online:Math.random()>.5 };
      createChat(data);
    }, {ltr:true});
    return;
  }
  const titles = {group:'نام گروه', channel:'نام کانال'};
  showPrompt(titles[type], '', val => {
    const name = val.trim();
    if (!name) { toast('نام نمی‌تونه خالی باشه', 'error'); return; }
    const data = { name, type, avatar:{type:'gradient',value:Math.floor(Math.random()*AV_GRADS.length)}, badgeType:null, username:'', isPublic:type === 'channel', description:'', coverPhoto:null, admins:[], permissions:{sendMessages:'all',editInfo:'all'}, joined:true };
    if (type === 'private') data.online = true;
    if (type === 'group' || type === 'channel') {
      const def = type === 'group' ? '4' : '100';
      setTimeout(() => {
        showPrompt('تعداد اعضا', def, num => {
          const n = parseInt(num, 10);
          const cnt = (isNaN(n) || n < 0) ? 0 : Math.min(n, 9999999);
          data.members = cnt;
          if (type === 'group') {
            const shuffled = MEMBER_POOL.slice().sort(() => Math.random()-0.5);
            data.membersList = shuffled.slice(0, Math.min(cnt, shuffled.length)).map(m => ({...m}));
            if (data.membersList.length) data.admins = [data.membersList[0].name];
          }
          setTimeout(() => askPublicPrivate(data, type), 200);
        });
      }, 220);
      return;
    }
    finishCreate(data, type);
  });
}

function askPublicPrivate(data, type) {
  openSheet(`
    <div class="sheet-title">${type === 'channel' ? 'کانال' : 'گروه'} چه نوعی باشد؟</div>
    <div class="sheet-item" data-pp="public">${icon('globe')}<div style="flex:1"><div style="font-weight:600">عمومی</div><div style="font-size:12px;color:var(--text-3);margin-top:2px">هر کسی با آیدی پیدا کند</div></div></div>
    <div class="sheet-item" data-pp="private">${icon('lock')}<div style="flex:1"><div style="font-weight:600">خصوصی</div><div style="font-size:12px;color:var(--text-3);margin-top:2px">فقط با دعوت</div></div></div>
  `);
  $$('#sheet-content [data-pp]').forEach(b => b.addEventListener('click', () => {
    data.isPublic = b.dataset.pp === 'public';
    closeSheet();
    if (data.isPublic) {
      setTimeout(() => {
        showPrompt('آیدی عمومی (بدون @)', '', v => {
          let u = normUser(v);
          if (u && validUser(u) && !userTaken(u)) data.username = u;
          finishCreate(data, type);
        }, {ltr:true});
      }, 220);
    } else finishCreate(data, type);
  }));
}

function finishCreate(data, type) {
  createChat(data);
  if (type === 'private') {
    const id = state.chats[state.chats.length-1].id;
    state.contacts.push({id, name:data.name, avatar:data.avatar, badgeType:data.badgeType});
    save(); renderContacts();
  }
}

function createChat(data) {
  const chat = Object.assign({
    id: rid(), unread:0, pinned:false, muted:false, draft:'', messages:[], createdAt:Date.now(),
    description:'', coverPhoto:null, admins:[], permissions:{sendMessages:'all',editInfo:'all'}, joined:true, warner:'',
    joinedDate: getPersianDate(),
    owner: null
  }, data);

  if ((chat.type === 'group' || chat.type === 'channel') && !chat.owner) {
    chat.owner = { name: state.me.name, username: state.me.username || '' };
  }

  state.chats.push(chat);
  if ((chat.type === 'group' || chat.type === 'channel') && chat.isPublic && chat.username) {
    const exists = state.directory.find(d => d.username === chat.username);
    if (!exists) state.directory.push(chat);
  }
  save(); renderChatList();
  toast('«' + chat.name + '» ساخته شد', 'success');
  setTimeout(() => openChat(chat.id), 200);
}

/* ---------- contacts click ---------- */
$('#contacts-list').addEventListener('click', e => {
  const item = e.target.closest('[data-contact]');
  if (!item) return;
  const c = state.contacts.find(x => x.id === item.dataset.contact);
  if (!c) return;
  let chat = state.chats.find(x => x.id === c.id);
  if (!chat) {
    chat = { id:c.id, name:c.name, type:'private', avatar:c.avatar, badgeType:c.badgeType, username:'', online:Math.random()>.5, unread:0, pinned:false, muted:false, draft:'', messages:[], createdAt:Date.now(), joined:true, warner:'' };
    state.chats.push(chat); save();
  }
  openChat(chat.id);
});

/* ---------- navigation buttons ---------- */
$('#btn-back').addEventListener('click', closeChat);
$('#btn-info-back').addEventListener('click', () => { closeInfo(); renderChatList(); });
$('#btn-info-edit').addEventListener('click', () => {
  const c = getChat(infoChatId);
  if (!c) return;
  avatarTargetType = 'chat'; avatarTarget = c.id;
  renderAvatarPicker('gradient'); avatarOverlay.classList.add('show');
});
$('#btn-profile-back').addEventListener('click', closeProfilePreview);

const _chatHdrCenter = $('#chat-hdr-center');
if (_chatHdrCenter) _chatHdrCenter.addEventListener('click', () => { if (activeChatId) openInfo(activeChatId); });
const _chatNameEl = $('#chat-name');
if (_chatNameEl) _chatNameEl.addEventListener('click', e => { e.stopPropagation(); if (activeChatId) openInfo(activeChatId); });
const _chatAvEl = $('#chat-avatar');
if (_chatAvEl) _chatAvEl.addEventListener('click', e => { e.stopPropagation(); if (activeChatId) openInfo(activeChatId); });

/* ---------- settings actions ---------- */
$('#settings-body').addEventListener('click', e => {
  const row = e.target.closest('[data-act]');
  if (row) {
    const act = row.dataset.act;
    if (act === 'edit-name') showPrompt('نام شما', state.me.name, v => { if (!v.trim()) return; state.me.name = v.trim(); renderSettings(); renderChatList(); save(); toast('ذخیره شد', 'success'); });
    if (act === 'edit-username') showPrompt('آیدی شما (بدون @)', state.me.username||'', v => {
      let u = normUser(v);
      if (!u) { state.me.username = ''; renderSettings(); save(); toast('حذف شد', 'info'); return; }
      if (!validUser(u)) { toast('آیدی فقط انگلیسی + عدد + _-=', 'error'); return; }
      if (userTaken(u, 'me')) { toast('گرفته شده', 'error'); return; }
      state.me.username = u; renderSettings(); save(); toast('ذخیره شد: @'+u, 'success');
    }, {ltr:true});
    if (act === 'edit-phone') {
      const cur = state.me.phone || '+98 ';
      showPrompt('شماره تلفن', cur, v => {
        let num = v.trim();
        if (!num || num === '+98') state.me.phone = '';
        else {
          if (!num.startsWith('+98')) { num = num.replace(/^\+?9?8?\s*/, '').replace(/\D/g, ''); num = '+98 ' + num; }
          num = num.replace(/^(\+98)\s*(\d{3})\s*(\d{3})\s*(\d{4}).*$/, '$1 $2 $3 $4');
          state.me.phone = num;
        }
        renderSettings(); save(); toast('ذخیره شد', 'success');
      }, {ltr:true, placeholder:'+98 912 345 6789'});
    }
    if (act === 'edit-joined') showPrompt('تاریخ عضویت', state.me.joinedDate || getPersianDate(), v => { state.me.joinedDate = v.trim() || getPersianDate(); renderSettings(); save(); toast('ذخیره شد', 'success'); });
    if (act === 'set-badge') {
      openSheet(`
        <div class="sheet-title">انتخاب نشان تایید</div>
        <div class="sheet-item" data-badge="none">${icon('ban')}بدون نشان</div>
        <div class="sheet-item" data-badge="blue">${vfHTML('blue', 20)} نشان افراد سرشناس</div>
        <div class="sheet-item" data-badge="yellow">${vfHTML('yellow', 20)} نشان سازمانی</div>
        <div class="sheet-item" data-badge="green">${vfHTML('green', 20)} نشان تجاری</div>
        <div class="sheet-item" data-badge="personal">${vfHTML('personal', 20)} نشان شخصی</div>
      `);
      $$('#sheet-content [data-badge]').forEach(b => b.addEventListener('click', () => {
        const bType = b.dataset.badge;
        state.me.badgeType = bType === 'none' ? null : bType;
        closeSheet(); renderSettings(); renderChatList(); save();
        toast('نشان تغییر کرد', 'success');
      }));
      return;
    }
    if (act === 'check-update') {
      toast('در حال بررسی و به روز رسانی...', 'info');
      setTimeout(async () => {
        try {
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (let name of cacheNames) await caches.delete(name);
          }
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) await reg.unregister();
          }
        } catch (e) { console.log(e); }
        window.location.reload();
      }, 1500);
    }
    if (act === 'toggle-theme') { state.theme = state.theme === 'light' ? 'dark' : 'light'; applyTheme(); renderSettings(); save(); toast(state.theme === 'light' ? 'تم روشن' : 'تم تاریک', 'info'); }
    if (act === 'export') exportBackup();
    if (act === 'import') {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = async () => {
        const f = inp.files[0]; if (!f) return;
        try { await importBackup(f); toast('بازیابی شد ✓', 'success'); } catch { toast('فایل نامعتبر', 'error'); }
      };
      inp.click();
    }
    if (act === 'reset') {
      showConfirm('پاک کردن همه', 'تمام داده‌ها حذف شوند؟', () => {
        localStorage.removeItem(KEY); localStorage.removeItem(BACKUP_KEY);
        state = emptyState(); applyTheme();
        renderChatList(); renderSettings(); renderContacts(); toast('پاک شد', 'info');
      });
    }
  }
  if (e.target.closest('#my-avatar-btn') || e.target.closest('#btn-edit-profile')) { openAvatarPicker('me', null); return; }
  if (e.target.closest('#my-cover-btn')) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      resizeImage(f, 1920, url => {
        state.me.coverPhoto = url;
        renderSettings(); save(); toast('کاور ذخیره شد', 'success');
      });
    };
    inp.click();
    return;
  }
  const sw = e.target.closest('input[data-set]');
  if (sw) {
    const key = sw.dataset.set;
    state.settings[key] = sw.checked;
    save();
    if (key === 'aiMode') { toast(sw.checked ? 'پاسخ هوشمند فعال' : 'غیرفعال', 'info'); if (activeChatId) renderChatHeader(); }
    if (key === 'notifications' && sw.checked) {
      requestNotifPermission().then(() => {
        if (Notification.permission === 'granted') toast('نوتیفیکیشن فعال', 'success');
        else if (Notification.permission === 'denied') { toast('مرورگر اجازه نداد', 'error'); state.settings.notifications = false; renderSettings(); save(); }
      });
    }
    if (key === 'autoBackup' && sw.checked) {
      try { localStorage.setItem(BACKUP_KEY, JSON.stringify(state)); } catch {}
      toast('پشتیبان‌گیری خودکار فعال', 'success');
    }
  }
});

/* ---------- backup ---------- */
function exportBackup(silent = false) {
  try {
    state.lastBackupAt = Date.now();
    save();
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url; a.download = `gap-backup-${date}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (!silent) toast('پشتیبان دانلود شد ✓', 'success');
    return true;
  } catch { if (!silent) toast('پشتیبان‌گیری ناموفق', 'error'); return false; }
}

function importBackup(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.chats)) throw new Error('bad');
        closeChat(); closeInfo(); closeProfilePreview();
        let imported = load();
        if (imported) { state = imported; }
        else {
          state = emptyState();
          if (data.me) state.me = normalizeAccount(data.me);
          if (Array.isArray(data.accounts)) state.accounts = data.accounts.map(normalizeAccount);
          if (Array.isArray(data._globalDirectory)) state._globalDirectory = data._globalDirectory.map(normalizeChat);
          else if (Array.isArray(data.directory)) state._globalDirectory = data.directory.map(normalizeChat);
          if (Array.isArray(data.chats)) state.me.chats = data.chats.map(normalizeChat);
          if (Array.isArray(data.contacts)) state.me.contacts = data.contacts;
          if (data.settings) state.settings = Object.assign(emptyState().settings, data.settings);
          if (data.theme) state.theme = data.theme;
          if (data.globalWarner) state.globalWarner = data.globalWarner;
        }
        localStorage.setItem(KEY, JSON.stringify(state));
        localStorage.setItem(BACKUP_KEY, JSON.stringify(state));
        applyTheme();
        renderChatList(); renderContacts(); renderSettings(); save();
        res(true);
      } catch (e) { rej(e); }
    };
    r.onerror = () => rej(new Error('read'));
    r.readAsText(file);
  });
}

function showBackupWelcome() {
  let ov = $('#backup-welcome');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'backup-welcome';
    ov.className = 'backup-welcome';
    document.body.appendChild(ov);
  }
  ov.innerHTML = `
    <div class="backup-box">
      <div style="width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:#6c6c6e;display:flex;align-items:center;justify-content:center;">${icon('save',30)}</div>
      <h2>خوش آمدی 👋</h2>
      <p>اگر قبلاً پشتیبان گرفته‌ای، همین‌جا بازیابی کن.</p>
      <button class="bbtn primary" id="bw-restore">${icon('upload',18)} بازیابی</button>
      <button class="bbtn secondary" id="bw-new">شروع از صفر</button>
    </div>`;
  ov.classList.add('show');
  $('#bw-new').onclick = () => ov.classList.remove('show');
  $('#bw-restore').onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try { await importBackup(f); ov.classList.remove('show'); toast('بازیابی موفق ✓', 'success'); }
      catch { toast('فایل نامعتبر', 'error'); }
    };
    inp.click();
  };
}
function shouldShowWelcome() {
  try { return !localStorage.getItem(KEY) && !localStorage.getItem(BACKUP_KEY); }
  catch { return false; }
}

/* ---------- modal ---------- */
function showPrompt(title, value, onOk, opts = {}) {
  const box = $('#modal-box');
  const ltr = opts.ltr ? 'dir="ltr" class="ltr"' : '';
  const ph = opts.placeholder || 'بنویس…';
  box.innerHTML = `<h3>${esc(title)}</h3><input id="modal-input" value="${esc(value)}" placeholder="${esc(ph)}" ${ltr}><div class="modal-actions"><button id="modal-cancel">لغو</button><button id="modal-ok" class="ok">ذخیره</button></div>`;
  modalOverlay.classList.add('show');
  const inp = $('#modal-input');
  setTimeout(() => { inp.focus(); inp.select(); }, 60);
  $('#modal-cancel').onclick = () => modalOverlay.classList.remove('show');
  $('#modal-ok').onclick = () => { const v = inp.value; modalOverlay.classList.remove('show'); onOk(v); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') $('#modal-ok').click(); });
}
function showConfirm(title, text, onOk) {
  const box = $('#modal-box');
  box.innerHTML = `<h3>${esc(title)}</h3><p>${esc(text)}</p><div class="modal-actions"><button id="modal-cancel">لغو</button><button id="modal-ok" class="ok" style="color:var(--red)">تأیید</button></div>`;
  modalOverlay.classList.add('show');
  $('#modal-cancel').onclick = () => modalOverlay.classList.remove('show');
  $('#modal-ok').onclick = () => { modalOverlay.classList.remove('show'); onOk(); };
}
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) modalOverlay.classList.remove('show'); });

/* ---------- ESC ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (sheetOverlay.classList.contains('show')) closeSheet();
    else if (emojiOverlay.classList.contains('show')) emojiOverlay.classList.remove('show');
    else if (avatarOverlay.classList.contains('show')) closeAvatarPicker();
    else if (modalOverlay.classList.contains('show')) modalOverlay.classList.remove('show');
    else if ($('#add-account-modal').classList.contains('show')) $('#add-account-modal').classList.remove('show');
    else if ($('#warn-modal').classList.contains('show')) $('#warn-modal').classList.remove('show');
    else if ($('#poll-modal').classList.contains('show')) $('#poll-modal').classList.remove('show');
    else if ($('#screen-profile').classList.contains('open')) closeProfilePreview();
    else if ($('#screen-info').classList.contains('open')) closeInfo();
    else if ($('#screen-chat').classList.contains('open')) closeChat();
  }
});

/* ---------- update notification ---------- */
function showUpdateNotification() {
  const ov = $('#update-overlay');
  if (!ov) return;
  $('#update-changelog').innerHTML = CHANGELOG.map((item, i) => `<div class="cl-item"><span class="cl-num">${i+1}</span><span class="cl-text">${esc(item)}</span></div>`).join('');
  $('#update-version').textContent = APP_VERSION;
  setTimeout(() => ov.classList.add('show'), 800);
  $('#update-ok').addEventListener('click', () => {
    ov.classList.remove('show');
    try { localStorage.setItem(VERSION_KEY, APP_VERSION); } catch {}
    setTimeout(() => { ov.style.display = 'none'; }, 400);
  });
}
function checkVersion() {
  let sv = null;
  try { sv = localStorage.getItem(VERSION_KEY); } catch {}
  if (sv !== APP_VERSION) showUpdateNotification();
  else { const ov = $('#update-overlay'); if (ov) ov.remove(); }
}

/* ---------- scroll bottom ---------- */
const messagesBox = $('#messages');
const scrollBottomBtn = $('#btn-scroll-bottom');
const scrollUnread = $('#scroll-unread');
function updateScrollBottom() {
  if (!messagesBox) return;
  const atBottom = messagesBox.scrollHeight - messagesBox.scrollTop - messagesBox.clientHeight < 80;
  if (atBottom) {
    scrollBottomBtn.style.display = 'none';
    if (scrollUnread) { scrollUnread.style.display = 'none'; scrollUnread.textContent = '0'; }
  } else scrollBottomBtn.style.display = 'flex';
}
if (messagesBox) messagesBox.addEventListener('scroll', updateScrollBottom);
if (scrollBottomBtn) scrollBottomBtn.addEventListener('click', () => {
  messagesBox.scrollTo({top:messagesBox.scrollHeight, behavior:'smooth'});
  if (scrollUnread) scrollUnread.style.display = 'none';
});

/* ---------- INIT ---------- */
state.chats.forEach(c => c.messages.forEach(m => renderedIds.add(m.id)));
renderChatList();
renderContacts();
renderSettings();
switchTab('chats');
checkVersion();
requestNotifPermission();

if (shouldShowWelcome()) setTimeout(showBackupWelcome, 600);

if (state.settings.autoBackup && state.lastBackupAt) {
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  if (Date.now() - state.lastBackupAt > threeDays) {
    setTimeout(() => {
      const rem = document.createElement('div');
      rem.className = 'backup-reminder show';
      rem.innerHTML = `${icon('save',16)} <span>وقتشه پشتیبان بگیری</span>`;
      document.body.appendChild(rem);
      rem.onclick = () => { exportBackup(); rem.remove(); };
      setTimeout(() => rem.remove(), 8000);
    }, 2500);
  }
}

setInterval(() => {
  if (renderedIds.size <= 5000) return;
  const valid = new Set();
  state.chats.forEach(c => c.messages.forEach(m => valid.add(m.id)));
  [...renderedIds].forEach(id => { if (!valid.has(id)) renderedIds.delete(id); });
}, 60000);

addEventListener('online', () => { if (activeChatId) renderChatHeader(); renderChatList(); });
addEventListener('offline', () => { if (activeChatId) renderChatHeader(); renderChatList(); });

if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

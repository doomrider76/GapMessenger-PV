// ============================================================
// extras.js — قابلیت‌های جدید گپ (بعد از script.js / auth.js / features.js لود می‌شود)
// انتخاب چندتایی • سوایپ ریپلای • ارسال زمان‌بندی‌شده • دیده‌شده توسط • موقعیت مکانی
// استیکر و گیف • سرعت ویس • ویس به متن • ترجمه • گزارش پیام • اشتراک‌گذاری
// نخوانده • گالری رسانه • سنجاق‌ها • بی‌صدا با زمان • لینک دعوت • دسترسی مدیران
// قوانین و خوش‌آمد • آمار کانال • حریم خصوصی • اندازه متن • زبان • تماس • استوری
// ============================================================
(() => {
'use strict';
const GIPHY_KEY = '';   // اختیاری: کلید Giphy بگذار تا جستجوی آنلاین گیف فعال شود
const faN = n => Number(n).toLocaleString('fa-IR');
const IC = (n, e) => document.getElementById('i-' + n) ? icon(n) : `<span style="width:20px;text-align:center;display:inline-block">${e}</span>`;
const S = () => state.settings;
const norm = u => String(u || '').replace(/^@/, '').trim().toLowerCase();
const X = () => {
  const a = state.me; if (!a.x) a.x = {};
  a.x.privacy = Object.assign({ lastSeen: 'all', photo: 'all', msg: 'all' }, a.x.privacy || {});
  if (!Array.isArray(a.x.stories)) a.x.stories = [];
  if (!Array.isArray(a.x.storySeen)) a.x.storySeen = [];
  if (!a.x.rulesSeen) a.x.rulesSeen = {};
  return a.x;
};
const mkItem = (label, ic, fn, danger) => {
  const d = document.createElement('div');
  d.className = 'sheet-item' + (danger ? ' danger' : '');
  d.innerHTML = ic + label;
  d.addEventListener('click', () => { closeSheet(); setTimeout(fn, 140); });
  return d;
};
const curMsg = el => { const c = getChat(activeChatId); return c ? c.messages.find(x => x.id === el.dataset.id) : null; };
const isOwner = c => !c.owner || c.owner.name === state.me.name;
const isAdminMe = c => isOwner(c) || (c.admins || []).includes(state.me.name);
const PERMS = [['delete', 'حذف پیام‌های دیگران'], ['pin', 'سنجاق کردن پیام'], ['members', 'افزودن / حذف اعضا'], ['info', 'تغییر اطلاعات'], ['invite', 'مدیریت لینک دعوت']];
const permsOf = (c, name) => Object.assign({ delete: true, pin: true, members: true, info: true, invite: true }, (c.xperm || {})[name] || {});
const can = (c, key) => {
  if (!c || (c.type !== 'group' && c.type !== 'channel')) return true;
  if (isOwner(c)) return true;
  if (!(c.admins || []).includes(state.me.name)) return true;
  return !!permsOf(c, state.me.name)[key];
};
const textModal = (title, value, onOk, ph) => {
  const box = $('#modal-box');
  box.innerHTML = `<h3>${esc(title)}</h3><textarea id="x-ta" rows="6" placeholder="${esc(ph || '')}">${esc(value || '')}</textarea><div class="modal-actions"><button id="modal-cancel">لغو</button><button id="modal-ok" class="ok">ذخیره</button></div>`;
  modalOverlay.classList.add('show');
  $('#modal-cancel').onclick = () => modalOverlay.classList.remove('show');
  $('#modal-ok').onclick = () => { const v = $('#x-ta').value; modalOverlay.classList.remove('show'); onOk(v); };
};
const jumpTo = (chatId, msgId) => {
  $$('.x-ov').forEach(o => o.remove());
  if (typeof closeInfo === 'function' && $('#screen-info').classList.contains('open')) closeInfo();
  if (activeChatId !== chatId) openChat(chatId);
  setTimeout(() => {
    const el = document.querySelector(`#messages .msg[data-id="${msgId}"]`);
    if (!el) { toast('پیام در دسترس نیست', 'info'); return; }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.add('selected'); setTimeout(() => el.classList.remove('selected'), 1100);
  }, 350);
};
const newMsg = (extra) => Object.assign({ id: rid(), text: '', out: true, ts: Date.now(), status: 'sent', type: 'text', author: state.me.name, replyTo: null, reactions: {}, deleted: false, editedForAll: false, seenCount: 0, seenTarget: 0, linkPreview: null, _fakeReactionCounts: {}, comments: [] }, extra);
const copyText = t => (typeof copyClip === 'function' ? copyClip(t) : navigator.clipboard.writeText(t));

/* ============ ۱) انتخاب چندتایی پیام ============ */
let sel = null;
const selBar = () => {
  let b = $('#x-selbar');
  if (!b) {
    b = document.createElement('div'); b.id = 'x-selbar';
    b.innerHTML = '<button data-s="x">✕</button><span class="n"></span><button data-s="copy">⧉</button><button data-s="fwd">➦</button><button data-s="del" class="red">🗑</button>';
    $('#screen-chat').appendChild(b);
    b.addEventListener('click', e => {
      const k = e.target.closest('button')?.dataset.s; if (!k) return;
      const c = getChat(activeChatId); if (!c || !sel) return;
      const list = c.messages.filter(m => sel.has(m.id));
      if (k === 'x') selEnd();
      else if (!list.length) toast('پیامی انتخاب نشده', 'info');
      else if (k === 'copy') { copyText(list.map(m => (m.type === 'text' ? m.text : m.caption) || '').filter(Boolean).join('\n\n')).then(() => toast('کپی شد', 'success'), () => toast('کپی نشد', 'error')); selEnd(); }
      else if (k === 'fwd') fwdMany(list);
      else if (k === 'del') delMany(c, list);
    });
  }
  const n = $('.n', b); if (n) n.textContent = sel ? faN(sel.size) + ' انتخاب‌شده' : '';
  b.classList.toggle('show', !!sel);
};
const markSel = () => $$('#messages .msg[data-id]').forEach(el => el.classList.toggle('x-sel', !!sel && sel.has(el.dataset.id)));
function selStart(id) { sel = new Set(id ? [id] : []); document.body.classList.add('x-selmode'); selBar(); markSel(); }
function selEnd() { sel = null; document.body.classList.remove('x-selmode'); selBar(); markSel(); }
function fwdMany(list) {
  openSheet(`<div class="sheet-title">هدایت ${faN(list.length)} پیام به…</div>` + state.chats.map(c => `<div class="sheet-item" data-xf="${c.id}">${avatarHTML(c, 38)}${esc(c.name)}</div>`).join(''));
  $$('#sheet-content [data-xf]').forEach(b => b.addEventListener('click', () => {
    const t = getChat(b.dataset.xf); if (!t || !checkCanSend(t)) return;
    list.forEach(m => t.messages.push(newMsg(Object.assign({ text: m.text, type: m.type, dur: m.dur, bg: m.bg, size: m.size, dataUrl: m.dataUrl, forwarded: true, originalSender: m.sender || null, poll: m.poll, linkPreview: m.linkPreview || null, lat: m.lat, lng: m.lng, sticker: m.sticker, stickerAnim: m.stickerAnim }, mediaFields(m)))));
    closeSheet(); selEnd(); renderChatList(); save(); toast('هدایت شد', 'success');
  }));
}
function delMany(c, list) {
  const allMine = list.every(m => m.out);
  openSheet(`<div class="sheet-title">حذف ${faN(list.length)} پیام</div><div class="sheet-item" data-xd="me">${IC('trash', '🗑')}حذف فقط برای من</div>${allMine ? `<div class="sheet-item danger" data-xd="all">${IC('trash', '🗑')}حذف برای همه</div>` : ''}`);
  $$('#sheet-content [data-xd]').forEach(b => b.addEventListener('click', () => {
    const ids = new Set(list.map(m => m.id));
    if (b.dataset.xd === 'me') c.messages = c.messages.filter(m => !ids.has(m.id));
    else list.forEach(m => { m.deleted = true; m.pinned = false; m.text = ''; m.dataUrl = null; m.mediaId = null; m.thumbId = null; m.items = null; m.comments = []; m.linkPreview = null; m.reactions = {}; m._fakeReactionCounts = {}; });
    closeSheet(); selEnd(); renderMessages(false); renderChatList(); save(); toast('حذف شد', 'success');
  }));
}
{
  const box = $('#messages');
  box.addEventListener('click', e => {
    if (!sel) return;
    const el = e.target.closest('.msg[data-id]'); if (!el || el.classList.contains('typing')) return;
    e.stopPropagation(); e.preventDefault();
    sel.has(el.dataset.id) ? sel.delete(el.dataset.id) : sel.add(el.dataset.id);
    if (!sel.size) { selEnd(); return; }
    markSel(); selBar();
  }, true);
  ['pointerdown', 'pointerup', 'contextmenu', 'dblclick'].forEach(ev => box.addEventListener(ev, e => { if (sel) { e.stopPropagation(); if (ev === 'contextmenu') e.preventDefault(); } }, true));
  const oc = openChat, cc = closeChat;
  openChat = function (id) { if (sel) selEnd(); return oc.apply(this, arguments); };
  closeChat = function () { if (sel) selEnd(); return cc.apply(this, arguments); };
  const ar = afterRender;
  afterRender = function (b) { ar.apply(this, arguments); try { decorate(b); } catch (e) { console.error(e); } if (sel) markSel(); };
}

/* ============ ۲) سوایپ روی پیام برای ریپلای ============ */
{
  const box = $('#messages'); let st = null;
  box.addEventListener('pointerdown', e => {
    if (sel || e.pointerType === 'mouse') return;
    const el = e.target.closest('.msg[data-id]');
    if (!el || el.classList.contains('typing') || e.target.closest('video,audio,.poll-opt,.x-spd,.reaction-pill')) return;
    st = { el, x: e.clientX, y: e.clientY, dx: 0, lock: false };
  });
  box.addEventListener('pointermove', e => {
    if (!st) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.lock) {
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { st = null; return; }
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) { st.lock = true; st.el.classList.add('x-sw'); }
      else return;
    }
    st.dx = Math.max(-90, Math.min(90, dx));
    st.el.style.transition = 'none'; st.el.style.transform = `translateX(${st.dx}px)`;
    st.el.classList.toggle('x-sw-r', st.dx > 0); st.el.classList.toggle('x-sw-l', st.dx < 0);
  });
  const end = () => {
    if (!st) return;
    const { el, dx, lock } = st; st = null;
    if (!lock) return;
    el.style.transition = 'transform .2s'; el.style.transform = '';
    setTimeout(() => { el.classList.remove('x-sw', 'x-sw-r', 'x-sw-l'); el.style.transition = ''; }, 220);
    if (Math.abs(dx) >= 60) { const m = curMsg(el); if (m && !m.deleted) { showReplyBar(m); if (navigator.vibrate) navigator.vibrate(12); } }
  };
  ['pointerup', 'pointercancel'].forEach(ev => box.addEventListener(ev, end));
}

/* ============ ۳) ارسال زمان‌بندی‌شده ============ */
const schedList = c => (c.xsched = c.xsched || []);
function openSchedule(chatId, text) {
  const c = getChat(chatId); if (!c) return;
  if (!text) { toast('اول متن پیام را در کادر بنویس', 'info'); return; }
  const at = ts => { schedList(c).push({ id: rid(), text, ts }); c.draft = ''; if (activeChatId === c.id && $('#msg-input')) { $('#msg-input').value = ''; autoGrow(); updateSendBtnState(); } closeSheet(); save(); toast('زمان‌بندی شد: ' + new Date(ts).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }), 'success'); };
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
  openSheet(`<div class="sheet-title">ارسال زمان‌بندی‌شده</div>
    <div class="sheet-item" data-xs="${Date.now() + 60e3}">${IC('chart', '⏱')}۱ دقیقه دیگر</div>
    <div class="sheet-item" data-xs="${Date.now() + 36e5}">${IC('chart', '⏱')}۱ ساعت دیگر</div>
    <div class="sheet-item" data-xs="${tomorrow.getTime()}">${IC('chart', '🌅')}فردا ساعت ۹ صبح</div>
    <div class="x-in"><input type="datetime-local" id="x-dt"><button class="fx-btn on" id="x-dt-ok" style="border:none;border-radius:12px;padding:10px;background:var(--accent);color:#fff;font-family:inherit">زمان دلخواه</button></div>`);
  $$('#sheet-content [data-xs]').forEach(b => b.addEventListener('click', () => at(+b.dataset.xs)));
  $('#x-dt-ok').addEventListener('click', () => { const v = $('#x-dt').value; const t = v ? new Date(v).getTime() : 0; if (!t || t < Date.now() + 5e3) { toast('زمان معتبر در آینده انتخاب کن', 'error'); return; } at(t); });
}
function schedSheet(c) {
  const l = schedList(c);
  openSheet(`<div class="sheet-title">پیام‌های زمان‌بندی‌شده</div>` + (l.length ? l.map(s => `<div class="fx-row"><span class="t">${esc(s.text.slice(0, 60))}<small>${new Date(s.ts).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}</small></span><button class="fx-btn" data-xn="${s.id}">الان</button><button class="fx-btn red" data-xr="${s.id}">حذف</button></div>`).join('') : '<div class="fx-empty">پیامی زمان‌بندی نشده</div>'));
  $$('#sheet-content [data-xn]').forEach(b => b.addEventListener('click', () => { const s = l.find(x => x.id === b.dataset.xn); c.xsched = l.filter(x => x !== s); closeSheet(); sendMessage({ replyTo: null, quote: null, quoteName: null }, s.text, c.id); save(); }));
  $$('#sheet-content [data-xr]').forEach(b => b.addEventListener('click', () => { c.xsched = l.filter(x => x.id !== b.dataset.xr); closeSheet(); save(); toast('حذف شد', 'success'); }));
}
setInterval(() => {
  const now = Date.now();
  (state.chats || []).forEach(c => {
    const l = c.xsched; if (!l || !l.length) return;
    const due = l.filter(s => s.ts <= now); if (!due.length) return;
    c.xsched = l.filter(s => s.ts > now);
    due.forEach(s => sendMessage({ replyTo: null, quote: null, quoteName: null }, s.text, c.id));
    save();
  });
  (state.chats || []).forEach(c => { if (c.muted && c.mutedUntil && now > c.mutedUntil) { c.muted = false; delete c.mutedUntil; renderChatList(); save(); } });
}, 4000);
{
  const b = $('#btn-send-text'); let t = null, fired = false;
  b.addEventListener('pointerdown', () => { fired = false; clearTimeout(t); t = setTimeout(() => { fired = true; const c = getChat(activeChatId); if (c && !pendingFiles.length) { if (navigator.vibrate) navigator.vibrate(15); openSchedule(c.id, ($('#msg-input').value || '').trim()); } }, 550); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => clearTimeout(t)));
  b.addEventListener('click', e => { if (fired) { e.stopPropagation(); e.preventDefault(); fired = false; } }, true);
  b.addEventListener('contextmenu', e => e.preventDefault());
}

/* ============ ۶) دیده‌شده توسط ============ */
function seenBy(c, m) {
  if (!m.xseen) {
    const mem = (c.membersList || []).filter(x => x.name !== state.me.name);
    const k = m.status === 'read' ? Math.max(1, Math.round(mem.length * (0.5 + Math.random() * 0.5))) : 0;
    m.xseen = mem.slice().sort(() => Math.random() - .5).slice(0, k).map((x, i) => ({ name: x.name, ts: m.ts + 4000 + i * (20000 + Math.random() * 90000) }));
    save();
  }
  openSheet(`<div class="sheet-title">دیده‌شده توسط ${faN(m.xseen.length)} نفر</div>` + (m.xseen.length ? m.xseen.map(s => { const [c1, c2] = nameColors(s.name); return `<div class="fx-row"><span style="width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;background:linear-gradient(135deg,${c1},${c2})">${esc(initials(s.name))}</span><span class="t">${esc(s.name)}</span><small style="color:var(--text-3)">${fmtTime(s.ts)}</small></div>`; }).join('') : '<div class="fx-empty">هنوز کسی ندیده</div>'));
}

/* ============ ۷) موقعیت مکانی ============ */
function sendLocation() {
  const c = getChat(activeChatId); if (!checkCanSend(c)) return;
  showConfirm('ارسال موقعیت', 'موقعیت فعلی شما برای این چت ارسال شود؟', () => {
    if (!navigator.geolocation) { toast('مرورگر موقعیت‌یابی ندارد', 'error'); return; }
    toast('در حال دریافت موقعیت…', 'info');
    navigator.geolocation.getCurrentPosition(p => sendMessage({ type: 'location', lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) }, '', c.id),
      () => toast('دسترسی به موقعیت داده نشد', 'error'), { enableHighAccuracy: true, timeout: 12000 });
  });
}
const tileUrl = (lat, lng, z = 15) => { const n = 2 ** z, x = Math.floor((lng + 180) / 360 * n), r = lat * Math.PI / 180, y = Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n); return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`; };

/* ============ ۸) استیکر و گیف ============ */
const STICKERS = ['😀','😂','🥰','😍','😎','🤩','😭','😡','🥳','🤯','😴','🤔','👍','👏','🙏','💪','🔥','💯','❤️','💔','🎉','🎂','🌹','☕','🍕','🐱','🐶','🦄','🐼','🦊','🚀','⭐','🌈','⚽','🎮','🎵'];
const ANIMS = ['bounce', 'spin', 'shake', 'pulse', 'float'];
function sendSticker(e, anim) { const c = getChat(activeChatId); if (!checkCanSend(c)) return; closeSheet(); sendMessage({ sticker: true, stickerAnim: anim || null }, e, c.id); }
function openStickers(tab = 'st') {
  const gif = tab === 'gif';
  openSheet(`<div class="x-tabs"><button data-t="st" class="${gif ? '' : 'on'}">استیکر</button><button data-t="gif" class="${gif ? 'on' : ''}">گیف</button></div>` + (gif
    ? `<div class="x-grid">${STICKERS.slice(0, 20).map((e, i) => `<div class="c" data-g="${esc(e)}" data-a="${ANIMS[i % 5]}"><span class="x-anim-${ANIMS[i % 5]}">${e}</span></div>`).join('')}</div>
       <div class="sheet-item" data-xg="dev">${IC('image', '🖼')}انتخاب گیف از دستگاه</div><div class="sheet-item" data-xg="search">${IC('search', '🔍')}جستجوی گیف آنلاین</div>`
    : `<div class="x-grid">${STICKERS.map(e => `<div class="c" data-s="${esc(e)}">${e}</div>`).join('')}</div>`));
  $$('#sheet-content .x-tabs button').forEach(b => b.addEventListener('click', () => openStickers(b.dataset.t)));
  $$('#sheet-content [data-s]').forEach(b => b.addEventListener('click', () => sendSticker(b.dataset.s)));
  $$('#sheet-content [data-g]').forEach(b => b.addEventListener('click', () => sendSticker(b.dataset.g, b.dataset.a)));
  $$('#sheet-content [data-xg]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.xg === 'dev') { closeSheet(); setTimeout(() => pickMedia('image/gif'), 150); return; }
    if (!GIPHY_KEY) { toast('برای جستجوی آنلاین، GIPHY_KEY را در extras.js بگذار', 'info'); return; }
    closeSheet(); setTimeout(() => showPrompt('جستجوی گیف', '', q => giphy(q.trim()), { placeholder: 'مثلاً خنده' }), 150);
  }));
}
async function giphy(q) {
  if (!q) return;
  try {
    const r = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=12&rating=g`); const j = await r.json();
    openSheet(`<div class="sheet-title">نتیجه‌ها</div><div class="x-grid">${j.data.map(g => `<div class="c" data-u="${esc(g.images.fixed_height.url)}"><img src="${esc(g.images.fixed_height_small.url)}" alt=""></div>`).join('')}</div>`);
    $$('#sheet-content [data-u]').forEach(b => b.addEventListener('click', () => { const c = getChat(activeChatId); closeSheet(); sendMessage({ type: 'photo', dataUrl: b.dataset.u }, '', c.id); }));
  } catch { toast('جستجوی گیف ممکن نشد', 'error'); }
}

/* ============ ۹) سرعت پخش ویس ============ */
const SPEEDS = [1, 1.5, 2];
const speed = () => S().xspeed || 1;
{
  const o = toggleVoice;
  toggleVoice = function () {
    const r = o.apply(this, arguments); const t0 = Date.now();
    const iv = setInterval(() => { if (currentAudio) { currentAudio.playbackRate = speed(); clearInterval(iv); } else if (Date.now() - t0 > 4000) clearInterval(iv); }, 80);
    return r;
  };
  $('#messages').addEventListener('click', e => {
    const b = e.target.closest('.x-spd'); if (!b) return;
    e.stopPropagation();
    S().xspeed = SPEEDS[(SPEEDS.indexOf(speed()) + 1) % SPEEDS.length]; save();
    $$('.x-spd').forEach(x => x.textContent = speed() + '×');
    if (currentAudio) currentAudio.playbackRate = speed();
  }, true);
  ['pointerdown', 'pointerup'].forEach(ev => $('#messages').addEventListener(ev, e => { if (e.target.closest('.x-spd')) e.stopPropagation(); }, true));
}

/* ============ ۱۰) ویس به متن (هنگام ضبط، اختیاری از تنظیمات) ============ */
{
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, txt = '';
  const lang = () => (S().xlang === 'en' ? 'en-US' : 'fa-IR');
  const os = startRec, oe = stopRec, om = sendMessage;
  startRec = async function () {
    txt = '';
    const p = os.apply(this, arguments);
    if (SR && S().xstt) { try { rec = new SR(); rec.lang = lang(); rec.continuous = true; rec.interimResults = false; rec.onresult = ev => { for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) txt += ev.results[i][0].transcript + ' '; }; rec.onerror = () => {}; rec.start(); } catch { rec = null; } }
    return p;
  };
  stopRec = function () { try { rec && rec.stop(); } catch {} rec = null; return oe.apply(this, arguments); };
  sendMessage = function (extra, textOverride, chatIdOverride) {
    const r = om.apply(this, arguments);
    if (extra && extra.type === 'voice' && S().xstt) {
      const c = getChat(chatIdOverride || activeChatId), m = c && c.messages[c.messages.length - 1];
      if (m && m.type === 'voice') setTimeout(() => { m.xtr = txt.trim(); save(); }, 1500);
    }
    return r;
  };
}
function voiceText(c, m) {
  if (m.xtr) { m.xtrShow = !m.xtrShow; renderMessages(false); save(); return; }
  toast(m.mediaId ? 'متنی تشخیص داده نشد (قابلیت را در تنظیمات روشن کن و ویس تازه ضبط کن)' : 'این ویس شبیه‌سازی‌شده است و متنی ندارد', 'info');
}

/* ============ ۱۱) ترجمه‌ی پیام ============ */
const LANGS = { fa: 'فارسی', en: 'English', ar: 'العربية', tr: 'Türkçe', de: 'Deutsch', fr: 'Français', ru: 'Русский', es: 'Español' };
async function translateText(text, tl) {
  try { const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + tl + '&dt=t&q=' + encodeURIComponent(text)); const j = await r.json(); const out = j[0].map(x => x[0]).join(''); if (out) return out; } catch {}
  try { const sl = /[\u0600-\u06FF]/.test(text) ? 'fa' : 'en'; const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=${sl}|${tl}`); const j = await r.json(); return j.responseData.translatedText; } catch {}
  return null;
}
function translateMsg(c, m) {
  const src = stripFmt((m.type === 'text' ? m.text : m.caption) || '').trim();
  if (!src) { toast('متنی برای ترجمه نیست', 'info'); return; }
  openSheet(`<div class="sheet-title">ترجمه به…</div>` + Object.entries(LANGS).map(([k, v]) => `<div class="sheet-item" data-xl="${k}">${IC('globe', '🌐')}${v}</div>`).join(''));
  $$('#sheet-content [data-xl]').forEach(b => b.addEventListener('click', async () => {
    const k = b.dataset.xl; closeSheet(); toast('در حال ترجمه…', 'info');
    const out = await translateText(src, k);
    if (!out) { toast('ترجمه ممکن نشد (اینترنت؟)', 'error'); return; }
    m.xtl = { lang: k, text: out }; renderMessages(false); save();
  }));
}

/* ============ ۱۲) گزارش پیام مشخص ============ */
const REASONS = ['اسپم یا تبلیغات', 'توهین یا آزار', 'محتوای نامناسب', 'اطلاعات نادرست', 'سایر'];
function reportMsg(c, m) {
  openSheet(`<div class="sheet-title">گزارش این پیام</div>` + REASONS.map((r, i) => `<div class="sheet-item" data-xr="${i}">${IC('alert', '⚠️')}${r}</div>`).join(''));
  $$('#sheet-content [data-xr]').forEach(b => b.addEventListener('click', () => {
    const reason = REASONS[+b.dataset.xr];
    state.fx = Object.assign({ reports: [] }, state.fx || {});
    state.fx.reports.unshift({ id: rid(), name: m.sender || c.name, username: c.type === 'private' ? (c.username || '') : '', chatType: c.type, reason, preview: String(pinPreview(m) || '').slice(0, 80), by: state.me.username || state.me.name, ts: Date.now(), open: true, msgId: m.id });
    [state.me, ...(state.accounts || [])].filter(a => a && a.role === 'admin').forEach(a => { a.notifs = a.notifs || []; a.notifs.unshift({ id: rid(), type: 'report', text: `گزارش پیام در «${c.name}» — ${reason}`, link: { t: 'admin' }, ts: Date.now(), read: false }); });
    closeSheet(); save(); toast('گزارش ثبت شد. ممنون', 'success');
  }));
}

/* ============ ۱۳) اشتراک‌گذاری ============ */
async function shareMsg(c, m) {
  const text = stripFmt((m.type === 'text' ? m.text : m.caption) || '').trim();
  try {
    if (m.mediaId && navigator.canShare) {
      const blob = await mediaGet(m.mediaId);
      if (blob) { const f = new File([blob], m.fname || m.text || 'file', { type: m.mime || blob.type }); if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text }); return; } }
    }
    if (m.type === 'location' && m.lat) { const u = `https://www.openstreetmap.org/?mlat=${m.lat}&mlon=${m.lng}#map=16/${m.lat}/${m.lng}`; navigator.share ? await navigator.share({ text: 'موقعیت مکانی', url: u }) : await copyText(u); return; }
    if (!text) { toast('این پیام قابل اشتراک‌گذاری نیست', 'info'); return; }
    if (navigator.share) await navigator.share({ text }); else { await copyText(text); toast('مرورگر اشتراک‌گذاری ندارد؛ متن کپی شد', 'info'); }
  } catch (e) { if (!e || e.name !== 'AbortError') toast('اشتراک‌گذاری ممکن نشد', 'error'); }
}

/* ============ ابزار wrap ============ */
const wrap = (name, make) => { try { const o = window[name]; if (typeof o !== 'function') throw 0; window[name] = make(o); } catch { console.warn('extras: cannot wrap', name); } };

/* ============ دکوراسیون پیام‌ها بعد از هر رندر ============ */
function decorate(b) {
  const c = getChat(activeChatId); if (!c) return;
  const map = new Map(c.messages.map(m => [m.id, m]));
  $$('.msg[data-id]', b).forEach(el => {
    const m = map.get(el.dataset.id); if (!m || m.deleted) return;
    if (m.sticker) { el.classList.add('x-sticker'); const t = $('.btext', el); if (t && m.stickerAnim) t.innerHTML = `<span class="x-anim-${m.stickerAnim}">${esc(m.text)}</span>`; }
    if (m.type === 'location' && m.lat != null) {
      const md = $('.media', el);
      if (md) md.outerHTML = `<div class="x-loc" data-xloc="${m.lat},${m.lng}"><div class="x-loc-map" style="background-image:url('${tileUrl(m.lat, m.lng)}'),linear-gradient(135deg,#43cea2,#185a9d)"></div><div class="x-loc-pin">📍</div><div class="x-loc-info"><b>موقعیت مکانی</b><span dir="ltr">${m.lat}, ${m.lng}</span></div></div>`;
    }
    if (m.type === 'voice') {
      const v = $('.voice', el);
      if (v) { v.insertAdjacentHTML('beforeend', `<button class="x-spd" type="button">${speed()}×</button>`); if (m.xtr && m.xtrShow) v.insertAdjacentHTML('afterend', `<div class="x-vtt">${esc(m.xtr)}</div>`); }
    }
    if (m.xtl) { const t = $('.btext', el); if (t) t.insertAdjacentHTML('afterend', `<div class="x-tr">${esc(m.xtl.text)}<small><span>ترجمه به ${LANGS[m.xtl.lang] || ''}</span><b data-xtlx="${m.id}">✕ حذف</b></small></div>`); }
  });
}
$('#messages').addEventListener('click', e => {
  const l = e.target.closest('.x-loc');
  if (l) { const [a, b] = l.dataset.xloc.split(','); window.open(`https://www.openstreetmap.org/?mlat=${a}&mlon=${b}#map=16/${a}/${b}`, '_blank', 'noopener'); return; }
  const x = e.target.closest('[data-xtlx]');
  if (x) { const c = getChat(activeChatId), m = c.messages.find(q => q.id === x.dataset.xtlx); if (m) { delete m.xtl; renderMessages(false); save(); } }
});

/* ============ منوی پیام: آیتم‌های جدید ============ */
wrap('showMsgMenu', o => function (el) {
  o.apply(this, arguments);
  const c = getChat(activeChatId), m = c && c.messages.find(x => x.id === el.dataset.id), box = $('#sheet-content');
  if (!m || !box || m.type === 'warning' || m.isWarning) return;
  let ref = $('[data-mact="reply"]', box);
  const add = it => { ref ? ref.after(it) : box.appendChild(it); ref = it; };
  add(mkItem('انتخاب چندتایی', IC('check', '☑️'), () => selStart(m.id)));
  if (m.deleted) return;
  const hasText = !!((m.type === 'text' ? m.text : m.caption) || '').trim();
  add(mkItem('اشتراک‌گذاری', IC('share', '📤'), () => shareMsg(c, m)));
  if (hasText) add(mkItem('ترجمه', IC('globe', '🌐'), () => translateMsg(c, m)));
  if (m.type === 'voice') add(mkItem(m.xtrShow ? 'پنهان کردن متن ویس' : 'تبدیل ویس به متن', IC('mic', '🎤'), () => voiceText(c, m)));
  if (c.type === 'group' && m.out) add(mkItem('دیده‌شده توسط', IC('eye', '👁'), () => seenBy(c, m)));
  if (!m.out && c.type !== 'saved' && c.type !== 'ai') add(mkItem('گزارش پیام', IC('alert', '⚠️'), () => reportMsg(c, m)));
  if ((c.type === 'group' || c.type === 'channel') && !m.out && isAdminMe(c) && can(c, 'delete'))
    add(mkItem('حذف برای همه (مدیر)', IC('trash', '🗑'), () => showConfirm('حذف پیام عضو', 'این پیام برای همه حذف شود؟', () => { m.deleted = true; m.pinned = false; m.text = ''; m.dataUrl = null; m.mediaId = null; m.items = null; m.comments = []; m.reactions = {}; renderMessages(false); renderChatList(); save(); }), true));
});
wrap('handleMsgAction', o => function (act, chat, m) {
  if (act === 'pin' && !can(chat, 'pin')) { toast('دسترسی سنجاق کردن را نداری', 'error'); return; }
  return o.apply(this, arguments);
});

/* ============ منوی بالای چت + دکمه‌ی «+» کنار نوار ورودی ============ */
wrap('openSheet', o => function () {
  const r = o.apply(this, arguments);
  try {
    const box = $('#sheet-content'), c = getChat(activeChatId);
    if (box && c && box.querySelector('[data-cact="search"]') && !box.querySelector('[data-xh]')) {
      const clear = $('[data-cact="clear"]', box);
      const put = (label, ic, fn) => { const d = mkItem(label, ic, fn); d.dataset.xh = '1'; clear ? clear.before(d) : box.appendChild(d); };
      if (c.type === 'private') { put('تماس صوتی', IC('phone', '📞'), () => startCall(c.id, 'voice')); put('تماس تصویری', IC('camera', '📹'), () => startCall(c.id, 'video')); }
      put('رسانه‌ها، فایل‌ها و لینک‌ها', IC('image', '🖼'), () => openGallery(c));
      const np = getPinned(c).length; if (np) put(`پیام‌های سنجاق‌شده (${faN(np)})`, IC('pin', '📌'), () => pinsSheet(c));
      const ns = schedList(c).length; if (ns) put(`پیام‌های زمان‌بندی‌شده (${faN(ns)})`, IC('chart', '⏱'), () => schedSheet(c));
    }
    // منوی پیوست (دکمه‌ی گیره‌ی کنار نوار تایپ): ابزارهای جدید
    if (box && c && box.querySelector('[data-aact]') && !box.querySelector('[data-xa2]')) {
      const grp = document.createElement('div'); grp.className = 'fx-asheet-group'; grp.textContent = 'ابزارهای بیشتر'; grp.dataset.xa2 = '1'; box.appendChild(grp);
      const put = (label, ic, fn) => box.appendChild(mkItem(label, ic, fn));
      put('استیکر و گیف', IC('smile', '🎭'), () => openStickers());
      put('موقعیت مکانی', IC('location', '📍'), sendLocation);
      put('ارسال زمان‌بندی‌شده (متن کادر)', IC('chart', '⏱'), () => openSchedule(c.id, ($('#msg-input').value || '').trim()));
      if (schedList(c).length) put(`پیام‌های زمان‌بندی‌شده (${faN(schedList(c).length)})`, IC('chart', '📋'), () => schedSheet(c));
    }
  } catch (e) { console.error(e); }
  return r;
});

/* ============ لیست چت‌ها: علامت نخوانده + بی‌صدا با زمان ============ */
let menuChatId = null;
wrap('showChatMenu', o => function (id) {
  menuChatId = id; o.apply(this, arguments);
  const c = getChat(id), box = $('#sheet-content'); if (!c || !box) return;
  if (!c.unread && c.type !== 'saved') {
    const d = mkItem('علامت‌گذاری به‌عنوان نخوانده', IC('bell', '🔵'), () => { c.unread = 1; renderChatList(); save(); toast('نخوانده شد', 'info'); });
    const ref = $('[data-clact="mute"]', box); ref ? ref.after(d) : box.appendChild(d);
  }
});
function muteSheet(c) {
  const H = 36e5;
  openSheet(`<div class="sheet-title">بی‌صدا کردن «${esc(c.name)}»</div>` + [['۱ ساعت', H], ['۸ ساعت', 8 * H], ['۲ روز', 48 * H], ['۱ هفته', 168 * H], ['همیشه', 0]].map(([t, v]) => `<div class="sheet-item" data-xmu="${v}">${IC('bell-off', '🔕')}${t}</div>`).join(''));
  $$('#sheet-content [data-xmu]').forEach(b => b.addEventListener('click', () => {
    const v = +b.dataset.xmu; c.muted = true; c.mutedUntil = v ? Date.now() + v : 0;
    closeSheet(); renderChatList(); if (infoChatId === c.id) renderInfo(); save(); toast(v ? 'بی‌صدا شد' : 'برای همیشه بی‌صدا شد', 'success');
  }));
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-clact="mute"],[data-cact="mute"],[data-info-act="toggle-mute"]'); if (!el) return;
  const id = el.dataset.clact ? menuChatId : el.dataset.cact ? activeChatId : infoChatId, c = getChat(id);
  if (!c) return;
  if (c.muted) { delete c.mutedUntil; return; }
  e.stopPropagation(); e.preventDefault(); closeSheet(); setTimeout(() => muteSheet(c), 160);
}, true);

/* ============ پیام‌های سنجاق‌شده (لیست) ============ */
function pinsSheet(c) {
  const l = getPinned(c).slice().reverse();
  openSheet(`<div class="sheet-title">پیام‌های سنجاق‌شده (${faN(l.length)})</div>` + (l.length ? l.map(m => `<div class="fx-row"><span class="t" data-xj="${m.id}" style="cursor:pointer">${esc((pinPreview(m) || 'پیام').slice(0, 70))}<small>${fmtListTime(m.ts)}</small></span><button class="fx-btn red" data-xu="${m.id}">برداشتن</button></div>`).join('') : '<div class="fx-empty">پیام سنجاق‌شده‌ای نیست</div>'));
  $$('#sheet-content [data-xj]').forEach(b => b.addEventListener('click', () => { closeSheet(); jumpTo(c.id, b.dataset.xj); }));
  $$('#sheet-content [data-xu]').forEach(b => b.addEventListener('click', () => {
    if (!can(c, 'pin')) { toast('دسترسی سنجاق کردن را نداری', 'error'); return; }
    const m = c.messages.find(x => x.id === b.dataset.xu); if (m) { m.pinned = false; delete m.pinTs; } delete pinCursor[c.id];
    renderMessages(false); save(); pinsSheet(c);
  }));
}

/* ============ گالری رسانه / فایل / لینک / ویس ============ */
function openGallery(c, tab = 'media') {
  $$('.x-ov').forEach(o => o.remove());
  const ov = document.createElement('div'); ov.className = 'x-ov'; document.body.appendChild(ov);
  const it = { media: [], file: [], link: [], voice: [] };
  c.messages.forEach(m => {
    if (m.deleted) return;
    const push = (x) => {
      if (x.type === 'photo' || x.type === 'video') { if (x.mediaId || x.dataUrl) it.media.push({ m: m.id, v: x.type === 'video', id: x.thumbId || (x.type === 'photo' ? x.mediaId : null), url: x.dataUrl }); }
      else if (x.type === 'file' || x.type === 'audio') it.file.push({ m: m.id, name: x.fname || x.text || 'فایل', size: x.size || '', ts: m.ts });
    };
    if (m.type === 'album') (m.items || []).forEach(push); else push(m);
    if (m.type === 'voice') it.voice.push({ m: m.id, dur: m.dur, ts: m.ts });
    if (m.type === 'text' && m.text) (m.text.match(/https?:\/\/[^\s<>"']+/g) || []).forEach(u => it.link.push({ m: m.id, url: u, ts: m.ts }));
  });
  const TABS = [['media', 'رسانه'], ['file', 'فایل‌ها'], ['link', 'لینک‌ها'], ['voice', 'ویس']];
  const paint = t => {
    const list = it[t];
    let body = !list.length ? '<div class="fx-empty" style="padding:40px">موردی نیست</div>' :
      t === 'media' ? `<div class="x-gal">${list.map(x => `<div class="x-gi" data-xm="${x.m}">${x.id ? `<img data-xi="${esc(x.id)}" alt="">` : x.url ? `<img src="${esc(x.url)}" alt="">` : '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:30px">🎬</span>'}${x.v ? '<i>▶</i>' : ''}</div>`).join('')}</div>` :
      list.slice().reverse().map(x => `<div class="x-li" data-xm="${x.m}"><span style="font-size:22px">${t === 'file' ? '📎' : t === 'link' ? '🔗' : '🎤'}</span><div class="m" ${t === 'link' ? 'dir="ltr"' : ''}>${esc(t === 'file' ? x.name : t === 'link' ? x.url : 'پیام صوتی · ' + fmtDur(x.dur || 0))}<div class="s">${t === 'file' && x.size ? esc(x.size) + ' · ' : ''}${fmtListTime(x.ts)}</div></div></div>`).join('');
    ov.innerHTML = `<div class="x-ov-h"><button data-xc="1">✕</button><div class="t">${esc(c.name)}</div><span style="width:40px"></span></div>
      <div class="x-tabs">${TABS.map(([k, v]) => `<button data-t="${k}" class="${k === t ? 'on' : ''}">${v}${it[k].length ? ' ' + faN(it[k].length) : ''}</button>`).join('')}</div><div class="x-ov-b">${body}</div>`;
    $$('[data-xi]', ov).forEach(i => mediaUrl(i.dataset.xi).then(u => { if (u) i.src = u; }));
  };
  ov.addEventListener('click', e => {
    if (e.target.closest('[data-xc]')) { ov.remove(); return; }
    const t = e.target.closest('.x-tabs button'); if (t) { paint(t.dataset.t); return; }
    const g = e.target.closest('[data-xm]'); if (g) jumpTo(c.id, g.dataset.xm);
  });
  paint(tab);
}

/* ============ لینک دعوت ============ */
const inviteLink = c => { c.xinv = c.xinv || (rid() + rid()).slice(0, 14); return location.href.split('#')[0] + '#join=' + c.xinv; };
function inviteSheet(c) {
  if (!can(c, 'invite')) { toast('دسترسی مدیریت لینک دعوت را نداری', 'error'); return; }
  const link = inviteLink(c);
  openSheet(`<div class="sheet-title">لینک دعوت «${esc(c.name)}»</div><div class="x-linkbox">${esc(link)}</div>
    <div class="sheet-item" data-xi="copy">${IC('file', '📋')}کپی لینک</div><div class="sheet-item" data-xi="share">${IC('share', '📤')}اشتراک‌گذاری لینک</div><div class="sheet-item danger" data-xi="reset">${IC('trash', '♻️')}ساخت لینک جدید (لینک قبلی باطل می‌شود)</div>`);
  $$('#sheet-content [data-xi]').forEach(b => b.addEventListener('click', async () => {
    const k = b.dataset.xi;
    if (k === 'copy') { await copyText(link); closeSheet(); toast('لینک کپی شد', 'success'); }
    else if (k === 'share') { closeSheet(); try { navigator.share ? await navigator.share({ title: c.name, url: link }) : (await copyText(link), toast('لینک کپی شد', 'success')); } catch {} }
    else { c.xinv = null; save(); closeSheet(); toast('لینک جدید ساخته شد', 'success'); setTimeout(() => inviteSheet(c), 200); }
  }));
}
function handleJoinHash() {
  const m = location.hash.match(/join=([\w-]+)/); if (!m) return;
  const tok = m[1], all = [...state.chats, ...(state.directory || []), ...(state.accounts || []).flatMap(a => a.chats || [])];
  const src = all.find(c => c.xinv === tok);
  history.replaceState(null, '', location.pathname + location.search);
  if (!src) { toast('این لینک دعوت معتبر نیست یا باطل شده', 'error'); return; }
  const mine = state.chats.find(c => c.id === src.id); if (mine) { openChat(mine.id); return; }
  showConfirm('عضویت با لینک دعوت', `به «${src.name}» بپیوندی؟`, () => {
    const cp = JSON.parse(JSON.stringify(src)); cp.joined = true;
    if (!state.chats.find(x => x.id === cp.id)) { if (!state.chats.includes(src)) cp.messages.forEach(q => { q.out = false; }); state.chats.push(cp); }
    const d = (state.directory || []).find(x => x.id === cp.id); if (d) d.joined = true;
    renderChatList(); save(); openChat(cp.id); afterJoin(cp);
  });
}
addEventListener('hashchange', handleJoinHash);
setTimeout(handleJoinHash, 900);

/* ============ مدیران و دسترسی‌ها ============ */
function adminsSheet(c) {
  const ad = c.admins || [];
  openSheet(`<div class="sheet-title">مدیران ${esc(c.name)}</div>` + (ad.length ? ad.map(n => `<div class="fx-row"><span class="t">${esc(n)}</span><button class="fx-btn" data-xp="${esc(n)}">دسترسی‌ها</button><button class="fx-btn red" data-xd="${esc(n)}">عزل</button></div>`).join('') : '<div class="fx-empty">مدیری وجود ندارد</div>') + `<div class="sheet-item" data-xa="add">${IC('user', '➕')}افزودن مدیر</div>`);
  const mgr = isOwner(c);
  $$('#sheet-content [data-xp]').forEach(b => b.addEventListener('click', () => { if (!mgr) { toast('فقط سازنده می‌تواند دسترسی‌ها را تغییر دهد', 'error'); return; } permSheet(c, b.dataset.xp); }));
  $$('#sheet-content [data-xd]').forEach(b => b.addEventListener('click', () => { if (!mgr) { toast('فقط سازنده می‌تواند مدیر را عزل کند', 'error'); return; } c.admins = (c.admins || []).filter(n => n !== b.dataset.xd); if (c.xperm) delete c.xperm[b.dataset.xd]; save(); renderInfo(); adminsSheet(c); }));
  $('#sheet-content [data-xa]').addEventListener('click', () => {
    if (!mgr) { toast('فقط سازنده می‌تواند مدیر اضافه کند', 'error'); return; }
    const addAdmin = n => { n = n.trim(); if (!n) return; c.admins = c.admins || []; if (!c.admins.includes(n)) c.admins.push(n); c.xperm = c.xperm || {}; c.xperm[n] = permsOf(c, n); save(); renderInfo(); permSheet(c, n); };
    if (c.type === 'group' && (c.membersList || []).length) {
      const cand = c.membersList.filter(m => !ad.includes(m.name));
      openSheet(`<div class="sheet-title">انتخاب عضو</div>` + (cand.map(m => `<div class="sheet-item" data-xn="${esc(m.name)}">${esc(m.name)}</div>`).join('') || '<div class="fx-empty">عضوی باقی نمانده</div>'));
      $$('#sheet-content [data-xn]').forEach(b => b.addEventListener('click', () => addAdmin(b.dataset.xn)));
    } else { closeSheet(); setTimeout(() => showPrompt('نام مدیر جدید', '', addAdmin), 160); }
  });
}
function permSheet(c, name) {
  const p = permsOf(c, name);
  openSheet(`<div class="sheet-title">دسترسی‌های «${esc(name)}»</div>` + PERMS.map(([k, t]) => `<div class="row" style="margin:0 8px"><span class="r-text">${t}</span><label class="switch"><input type="checkbox" data-xk="${k}" ${p[k] ? 'checked' : ''}><span class="sl"></span></label></div>`).join(''));
  $$('#sheet-content [data-xk]').forEach(i => i.addEventListener('change', () => { c.xperm = c.xperm || {}; c.xperm[name] = Object.assign(permsOf(c, name), { [i.dataset.xk]: i.checked }); save(); }));
}
wrap('showMemberMenu', o => function (chat, name) {
  if (!can(chat, 'members')) { toast('دسترسی مدیریت اعضا را نداری', 'error'); return; }
  o.apply(this, arguments);
  if ((chat.admins || []).includes(name) && isOwner(chat)) {
    const d = mkItem('دسترسی‌های مدیر', IC('verified', '🛡'), () => permSheet(chat, name)), box = $('#sheet-content'), r = $('[data-mact="toggle-admin"]', box);
    r ? r.after(d) : box.appendChild(d);
  }
});
wrap('handleInfoAction', o => function (act, c) {
  if (/^(edit-|perm-|toggle-public|set-badge|toggle-comments|toggle-sign)/.test(act) && !can(c, 'info')) { toast('دسترسی تغییر اطلاعات را نداری', 'error'); return; }
  const r = o.apply(this, arguments);
  if (act === 'join-chat') afterJoin(c);
  return r;
});

/* ============ قوانین و پیام خوش‌آمد ============ */
function afterJoin(c) {
  if (!c || (c.type !== 'group' && c.type !== 'channel')) return;
  if (c.welcomeOn && c.welcome) {
    c.messages.push(newMsg({ out: false, status: undefined, author: undefined, sender: 'خوش‌آمدگو', text: c.welcome.replace(/\{name\}/g, state.me.name) }));
    if (activeChatId === c.id) renderMessages(); renderChatList(); save();
  }
}
function rulesSheet(c) {
  const adm = isAdminMe(c) && can(c, 'info');
  openSheet(`<div class="sheet-title">قوانین ${esc(c.name)}</div>
    <div class="x-linkbox" style="direction:rtl;text-align:right;white-space:pre-wrap">${c.rules ? esc(c.rules) : '<span style="color:var(--text-3)">قوانینی ثبت نشده</span>'}</div>
    ${adm ? `<div class="sheet-item" data-xr="rules">${IC('edit', '✏️')}ویرایش قوانین</div>
    <div class="row" style="margin:0 8px"><span class="r-text">ارسال پیام خوش‌آمد به عضو جدید</span><label class="switch"><input type="checkbox" id="x-wel" ${c.welcomeOn ? 'checked' : ''}><span class="sl"></span></label></div>
    <div class="sheet-item" data-xr="welcome">${IC('edit', '✏️')}ویرایش پیام خوش‌آمد${c.welcome ? '' : ' (خالی)'}</div>
    <div class="sheet-item" data-xr="test">${IC('send', '🧪')}آزمایش پیام خوش‌آمد</div>` : ''}`);
  if (!adm) return;
  $('#x-wel').addEventListener('change', e => { c.welcomeOn = e.target.checked; save(); });
  $$('#sheet-content [data-xr]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.xr; closeSheet();
    setTimeout(() => {
      if (k === 'rules') textModal('قوانین', c.rules || '', v => { c.rules = v.trim(); save(); toast('ذخیره شد', 'success'); }, 'مثلاً: ۱. احترام به همه');
      else if (k === 'welcome') textModal('پیام خوش‌آمد ({name} = نام عضو)', c.welcome || '', v => { c.welcome = v.trim(); if (c.welcome) c.welcomeOn = true; save(); toast('ذخیره شد', 'success'); }, 'سلام {name}! به گروه خوش آمدی 👋');
      else if (c.welcome) { afterJoin(Object.assign({}, c, { welcomeOn: true, messages: c.messages })); toast('پیام خوش‌آمد فرستاده شد', 'success'); }
      else toast('اول پیام خوش‌آمد را بنویس', 'info');
    }, 160);
  }));
}
wrap('openChat', o => function (id) {
  const r = o.apply(this, arguments);
  const c = getChat(id);
  if (c && (c.type === 'group' || c.type === 'channel') && c.rules && !X().rulesSeen[c.id]) {
    X().rulesSeen[c.id] = 1; save();
    setTimeout(() => { if (activeChatId === c.id) rulesSheet(c); }, 700);
  }
  return r;
});

/* ============ آمار کانال ============ */
function statsSheet(c) {
  const posts = c.messages.filter(m => m.out && !m.deleted && m.type !== 'warning');
  const R = !!S().real, views = R ? 0 : posts.reduce((s, m) => s + (m.seenCount || 0), 0);
  const react = posts.reduce((s, m) => s + Object.values(m.reactions || {}).reduce((a, v) => a + (v || []).length, 0) + (S().real ? 0 : Object.values(m._fakeReactionCounts || {}).reduce((a, v) => a + (+v || 0), 0)), 0);
  const cm = posts.reduce((s, m) => s + (m.comments || []).length, 0);
  const last = posts.slice(-10), vw = m => (R ? 0 : (m.seenCount || 0)), mx = Math.max(1, ...last.map(vw));
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i)); return d; });
  const per = days.map(d => posts.filter(m => new Date(m.ts).toDateString() === d.toDateString()).length), mp = Math.max(1, ...per);
  openSheet(`<div class="sheet-title">آمار «${esc(c.name)}»</div>
    <div class="x-stat"><div><b>${faN(c.members || 0)}</b><span>عضو</span></div><div><b>${faN(posts.length)}</b><span>پست</span></div><div><b>${faN(views)}</b><span>کل بازدید</span></div><div><b>${faN(posts.length ? Math.round(views / posts.length) : 0)}</b><span>میانگین بازدید هر پست</span></div><div><b>${faN(react)}</b><span>واکنش</span></div><div><b>${faN(cm)}</b><span>نظر</span></div></div>
    <div class="fx-sec">بازدید ۱۰ پست آخر</div><div class="x-bars">${last.length ? last.map(m => `<div style="height:${Math.max(4, Math.round(vw(m) / mx * 100))}%"><span>${faN(vw(m))}</span></div>`).join('') : '<div class="fx-empty" style="flex:1">پستی نیست</div>'}</div>
    <div class="fx-sec">پست‌های ۷ روز گذشته</div><div class="x-bars">${per.map(n => `<div style="height:${Math.max(4, Math.round(n / mp * 100))}%"><span>${faN(n)}</span></div>`).join('')}</div>
    <div class="fx-hint" style="padding-top:12px">این آمار از داده‌های همین دستگاه محاسبه می‌شود.</div>`);
}

/* ============ ردیف‌های جدید صفحه‌ی اطلاعات ============ */
wrap('renderInfo', o => function () {
  o.apply(this, arguments);
  const c = getChat(infoChatId), mute = $('#info-body [data-info-act="toggle-mute"]');
  if (!c || !mute || c.type === 'ai') return;
  const grp = mute.closest('.group'), title = grp && grp.previousElementSibling; if (!grp || !title) return;
  const row = (k, ic, t, v) => `<div class="row" data-xinfo="${k}"><span class="r-icon">${ic}</span><span class="r-text">${t}</span>${v ? `<span class="r-val">${v}</span>` : ''}<span class="chev">${icon('chevron', 18)}</span></div>`;
  const gc = c.type === 'group' || c.type === 'channel';
  let rows = row('media', IC('image', '🖼'), 'رسانه‌ها، فایل‌ها و لینک‌ها');
  const np = getPinned(c).length; if (np) rows += row('pins', IC('pin', '📌'), 'پیام‌های سنجاق‌شده', faN(np));
  if (c.type === 'private') rows += row('call-voice', IC('phone', '📞'), 'تماس صوتی') + row('call-video', IC('camera', '📹'), 'تماس تصویری');
  if (gc) rows += row('invite', IC('globe', '🔗'), 'لینک دعوت') + row('admins', IC('verified', '🛡'), 'مدیران و دسترسی‌ها', faN((c.admins || []).length)) + row('rules', IC('file', '📜'), 'قوانین و پیام خوش‌آمد');
  if (c.type === 'channel') rows += row('stats', IC('chart', '📊'), 'آمار کانال');
  const w = document.createElement('div'); w.innerHTML = `<div class="section-title">ابزارها</div><div class="group">${rows}</div>`;
  title.before(...w.childNodes);
});
document.addEventListener('click', e => {
  const r = e.target.closest('[data-xinfo]'); if (!r) return;
  const c = getChat(infoChatId); if (!c) return;
  const k = r.dataset.xinfo;
  if (k === 'media') openGallery(c); else if (k === 'pins') pinsSheet(c);
  else if (k === 'invite') inviteSheet(c); else if (k === 'admins') adminsSheet(c);
  else if (k === 'rules') rulesSheet(c); else if (k === 'stats') statsSheet(c);
  else if (k === 'call-voice') startCall(c.id, 'voice'); else if (k === 'call-video') startCall(c.id, 'video');
});

/* ============ ۲۶) حریم خصوصی ============ */
const acctByUser = u => u ? (state.accounts || []).find(a => a !== state.me && norm(a.username) === norm(u)) : null;
const inContacts = (a, who) => (a.contacts || []).some(c => c.username && who.username && norm(c.username) === norm(who.username));
const allowed = (a, key) => { const v = (a.x && a.x.privacy && a.x.privacy[key]) || 'all'; return v === 'all' || (v === 'contacts' && inContacts(a, state.me)); };
wrap('chatStatus', o => function (c) {
  if (c && c.type === 'private' && c.username && !c.typing) { const a = acctByUser(c.username); if (a && !allowed(a, 'lastSeen')) return 'آخرین بازدید اخیراً'; }
  return o.apply(this, arguments);
});
wrap('avatarHTML', o => function (e, size) {
  if (e && e.username && e.avatar && e.avatar.type === 'image' && e.type !== 'group' && e.type !== 'channel') {
    const a = acctByUser(e.username);
    if (a && !allowed(a, 'photo')) return o.call(this, Object.assign({}, e, { avatar: { type: 'gradient', value: 0 } }), size);
  }
  return o.apply(this, arguments);
});
wrap('syncMessageToTargetAccount', o => function (tu) {
  const a = acctByUser(tu);
  if (a && !allowed(a, 'msg')) { toast('این کاربر فقط از مخاطبینش پیام می‌پذیرد', 'error'); return; }
  return o.apply(this, arguments);
});
const PRIV = { lastSeen: ['آخرین بازدید و آنلاین', 'چه کسی آخرین بازدید شما را ببیند؟'], photo: ['عکس پروفایل', 'چه کسی عکس پروفایل شما را ببیند؟'], msg: ['ارسال پیام به من', 'چه کسی بتواند به شما پیام بدهد؟'] };
const PV = { all: 'همه', contacts: 'مخاطبین من', nobody: 'هیچ‌کس' };
function privSheet(k) {
  const opts = k === 'msg' ? ['all', 'contacts'] : ['all', 'contacts', 'nobody'];
  openSheet(`<div class="sheet-title">${PRIV[k][1]}</div>` + opts.map(v => `<div class="sheet-item" data-xv="${v}">${IC('lock', '🔒')}${PV[v]}${X().privacy[k] === v ? '<span style="margin-right:auto">✓</span>' : ''}</div>`).join(''));
  $$('#sheet-content [data-xv]').forEach(b => b.addEventListener('click', () => { X().privacy[k] = b.dataset.xv; save(); closeSheet(); renderSettings(); }));
}

/* ============ ۲۸) اندازه‌ی متن  /  ۲۹) زبان ============ */
const FS = { sm: 'کوچک', md: 'متوسط', lg: 'بزرگ', xl: 'خیلی بزرگ' };
const applyFs = () => { const v = S().xfs || 'md'; v === 'md' ? document.documentElement.removeAttribute('data-xfs') : document.documentElement.setAttribute('data-xfs', v); };
function fsSheet() {
  openSheet(`<div class="sheet-title">اندازه‌ی متن پیام‌ها</div>` + Object.entries(FS).map(([k, v]) => `<div class="sheet-item" data-xf="${k}">${IC('edit', 'Aa')}${v}${(S().xfs || 'md') === k ? '<span style="margin-right:auto">✓</span>' : ''}</div>`).join('') + `<div class="x-linkbox" style="direction:rtl;text-align:right">پیش‌نمایش: سلام! این یک پیام نمونه است.</div>`);
  $$('#sheet-content [data-xf]').forEach(b => b.addEventListener('click', () => { S().xfs = b.dataset.xf; applyFs(); save(); fsSheet(); renderSettings(); }));
}
const EN = {
  'همه': 'All', 'خصوصی': 'Private', 'گروه': 'Groups', 'کانال': 'Channels', 'هوش مصنوعی': 'AI', 'ذخیره‌شده': 'Saved', 'کشف': 'Discover', 'چت‌ها': 'Chats', 'مخاطبین': 'Contacts', 'تنظیمات': 'Settings', 'گپ': 'Gap',
  'جستجوی چت، پیام یا آیدی…': 'Search chats, messages or IDs…', 'پیام': 'Message', 'بنویس…': 'Type…', 'جستجو در پیام‌های این چت…': 'Search in this chat…',
  'پاسخ': 'Reply', 'سنجاق کردن پیام': 'Pin message', 'برداشتن سنجاق': 'Unpin', 'سنجاق': 'Pin', 'کپی': 'Copy', 'ویرایش': 'Edit', 'هدایت': 'Forward', 'حذف': 'Delete', 'ذخیره': 'Save', 'لغو': 'Cancel', 'تأیید': 'Confirm', 'باز کردن': 'Open', 'بستن': 'Close',
  'نقل قول': 'Quote', 'حذف پیام': 'Delete message', 'حذف برای همه': 'Delete for everyone', 'ارسال اخطار': 'Send warning', 'بن کردن': 'Ban', 'بی‌صدا': 'Mute', 'فعال کردن اعلان': 'Unmute', 'بی‌صدا کردن': 'Mute',
  'اطلاعات': 'Info', 'اطلاعات چت': 'Chat info', 'اطلاعات گروه': 'Group info', 'اطلاعات کانال': 'Channel info', 'اطلاعات مخاطب': 'Contact info', 'جستجو در پیام‌ها': 'Search messages', 'تغییر نام': 'Rename', 'تنظیم پروفایل': 'Set profile photo', 'تغییر پس‌زمینه چت': 'Change wallpaper',
  'پاک کردن تاریخچه': 'Clear history', 'حذف گفتگو': 'Delete chat', 'حذف چت': 'Delete chat', 'عملیات': 'Actions', 'ابزارها': 'Tools', 'تنظیمات کانال': 'Channel settings', 'مجوزها': 'Permissions', 'ارسال پیام': 'Send messages', 'تغییر اطلاعات': 'Edit info', 'فقط مدیران': 'Admins only', 'همه اعضا': 'All members',
  'نام': 'Name', 'آیدی': 'Username', 'نوع': 'Type', 'عمومی': 'Public', 'نشان تایید': 'Verification badge', 'بدون نشان': 'No badge', 'تعداد اعضا': 'Members', 'ترک': 'Leave', 'عضویت': 'Join', 'اعضا و مدیران': 'Members & admins',
  'کامنت زیر پست‌ها': 'Comments under posts', 'امضای پیام‌ها (نام نویسنده)': 'Sign messages (author name)', '+ افزودن توضیحات': '+ Add description', '+ افزودن آیدی': '+ Add username', 'افزودن کاور': 'Add cover',
  'امروز': 'Today', 'دیروز': 'Yesterday', 'آنلاین': 'Online', 'در حال نوشتن…': 'typing…', 'در حال تایپ…': 'typing…', 'بدون پیام': 'No messages', 'یادداشت‌های شخصی': 'Personal notes', 'آخرین بازدید به تازگی': 'Last seen recently', 'آخرین بازدید اخیراً': 'Last seen recently',
  'پیام حذف‌شده': 'Deleted message', '🚫 این پیام حذف شد': '🚫 This message was deleted', '🚫 پیام حذف شد': '🚫 Message deleted', '🎤 پیام صوتی': '🎤 Voice message', '🖼 عکس': '🖼 Photo', '🎬 ویدیو': '🎬 Video', '📍 موقعیت': '📍 Location', '📊 نظرسنجی': '📊 Poll',
  'شروع گفتگو': 'Start chatting', 'اولین پیامت رو بنویس': 'Write your first message', 'هنوز گفتگویی نداری': 'No chats yet', 'برای شروع روی + بزن': 'Tap + to start', 'چیزی پیدا نشد': 'Nothing found', 'مخاطبین خالی است': 'No contacts',
  'کپی شد': 'Copied', 'کپی نشد': 'Could not copy', 'حذف شد': 'Deleted', 'ذخیره شد': 'Saved', 'هدایت شد': 'Forwarded', 'ویرایش شد': 'Edited', 'پیام سنجاق شد': 'Message pinned', 'سنجاق برداشته شد': 'Unpinned', 'دسترسی به میکروفون داده نشد': 'Microphone access denied', 'پیام صوتی ارسال شد': 'Voice message sent', 'ضبط لغو شد': 'Recording cancelled',
  'حریم خصوصی و امنیت': 'Privacy & security', 'حساب خصوصی': 'Private account', 'بلاک‌ها و میوت‌ها': 'Blocks & mutes', 'ظاهر و برنامه': 'Appearance & app', 'مدیریت': 'Administration', 'نقش': 'Role', 'پنل مدیریت': 'Admin panel',
  'انتخاب چندتایی': 'Select multiple', 'اشتراک‌گذاری': 'Share', 'ترجمه': 'Translate', 'تبدیل ویس به متن': 'Voice to text', 'پنهان کردن متن ویس': 'Hide voice text', 'دیده‌شده توسط': 'Seen by', 'گزارش پیام': 'Report message', 'گزارش': 'Report', 'بلاک کردن': 'Block', 'رفع بلاک': 'Unblock',
  'استیکر و گیف': 'Stickers & GIFs', 'استیکر': 'Stickers', 'گیف': 'GIFs', 'موقعیت مکانی': 'Location', 'افزودن': 'Add', 'ارسال زمان‌بندی‌شده': 'Scheduled send', 'ارسال زمان‌بندی‌شده (متن کادر)': 'Schedule send (input text)', 'زمان دلخواه': 'Custom time', '۱ دقیقه دیگر': 'In 1 minute', '۱ ساعت دیگر': 'In 1 hour', 'فردا ساعت ۹ صبح': 'Tomorrow 9 AM',
  'علامت‌گذاری به‌عنوان نخوانده': 'Mark as unread', 'رسانه‌ها، فایل‌ها و لینک‌ها': 'Media, files & links', 'رسانه': 'Media', 'فایل‌ها': 'Files', 'لینک‌ها': 'Links', 'ویس': 'Voice', 'موردی نیست': 'Nothing here',
  'پیام‌های سنجاق‌شده': 'Pinned messages', 'برداشتن': 'Remove', 'ساعت': 'hr', '۱ ساعت': '1 hour', '۸ ساعت': '8 hours', '۲ روز': '2 days', '۱ هفته': '1 week', 'همیشه': 'Forever',
  'لینک دعوت': 'Invite link', 'کپی لینک': 'Copy link', 'اشتراک‌گذاری لینک': 'Share link', 'ساخت لینک جدید (لینک قبلی باطل می‌شود)': 'Create new link (old one is revoked)', 'مدیران و دسترسی‌ها': 'Admins & permissions', 'دسترسی‌ها': 'Permissions', 'عزل': 'Dismiss', 'افزودن مدیر': 'Add admin', 'دسترسی‌های مدیر': 'Admin permissions',
  'حذف پیام‌های دیگران': 'Delete others\' messages', 'سنجاق کردن پیام ': 'Pin messages', 'افزودن / حذف اعضا': 'Add / remove members', 'مدیریت لینک دعوت': 'Manage invite link',
  'قوانین و پیام خوش‌آمد': 'Rules & welcome message', 'ویرایش قوانین': 'Edit rules', 'ویرایش پیام خوش‌آمد': 'Edit welcome message', 'آزمایش پیام خوش‌آمد': 'Test welcome message', 'ارسال پیام خوش‌آمد به عضو جدید': 'Send welcome message to new members', 'آمار کانال': 'Channel stats', 'عضو': 'Members', 'پست': 'Posts', 'کل بازدید': 'Total views', 'واکنش': 'Reactions', 'نظر': 'Comments',
  'آخرین بازدید و آنلاین': 'Last seen & online', 'عکس پروفایل': 'Profile photo', 'ارسال پیام به من': 'Who can message me', 'مخاطبین من': 'My contacts', 'هیچ‌کس': 'Nobody', 'شخصی‌سازی': 'Personalization', 'اندازه‌ی متن پیام‌ها': 'Message text size', 'زبان برنامه': 'App language', 'تبدیل گفتار به متن هنگام ضبط ویس': 'Speech-to-text while recording voice',
  'کوچک': 'Small', 'متوسط': 'Medium', 'بزرگ': 'Large', 'خیلی بزرگ': 'Extra large', 'فارسی': 'Persian',
  'تماس صوتی': 'Voice call', 'تماس تصویری': 'Video call', 'در حال برقراری تماس…': 'Calling…', 'در حال زنگ خوردن…': 'Ringing…', 'متصل شد': 'Connected', 'پاسخ نداد': 'No answer',
  'استوری من': 'My story', 'استوری': 'Story', 'متن': 'Text', 'عکس': 'Photo', 'انتشار': 'Post', 'مشاهده استوری‌های من': 'View my stories', 'افزودن استوری': 'Add story', 'حذف استوری': 'Delete story',
  'ارسال موقعیت': 'Send location', 'خانه': 'Home', 'نظرسنجی': 'Poll', 'ایموجی': 'Emoji', 'ارسال': 'Send', 'پاسخ به': 'Reply to', 'ارسال عکس و فیلم': 'Send photo or video', 'ارسال فایل': 'Send file', 'آنلاین — هوش مصنوعی': 'Online — AI', 'دستیار هوشمند': 'AI assistant', 'پیام‌های ذخیره‌شده': 'Saved messages'
};
const ENP = [[/^(.+) عضو$/, '$1 members'], [/^(.+) رای$/, '$1 votes'], [/^(.+) نظر$/, '$1 comments'], [/^(.+) انتخاب‌شده$/, '$1 selected'], [/^دیده‌شده توسط (.+) نفر$/, 'Seen by $1'], [/^گزارش «(.+)»$/, 'Report “$1”'], [/^(.+) پیام قدیمی‌تر مخفی شده…$/, '$1 older messages hidden…']];
const FA_D = '۰۱۲۳۴۵۶۷۸۹';
function trNode(n) {
  const p = n.parentElement; if (!p || p.closest('.btext,.mcap,.reply-quote,.x-tr,.x-vtt,.fname,textarea,input,script,style')) return;
  const raw = n.nodeValue, t = raw.trim(); if (!t) return;
  let out = EN[t];
  if (out === undefined) for (const [re, rep] of ENP) if (re.test(t)) { out = t.replace(re, rep); break; }
  if (out !== undefined && out !== t) n.nodeValue = raw.replace(t, out);
  else if (/[۰-۹]/.test(raw)) n.nodeValue = raw.replace(/[۰-۹]/g, d => FA_D.indexOf(d));
}
function trAttr(el) { ['placeholder', 'aria-label', 'title'].forEach(a => { const v = el.getAttribute && el.getAttribute(a); if (v && EN[v.trim()]) el.setAttribute(a, EN[v.trim()]); }); }
function trWalk(root) {
  if (root.nodeType === 3) { trNode(root); return; }
  if (root.nodeType !== 1) return;
  trAttr(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) n.nodeType === 3 ? trNode(n) : trAttr(n);
}
if (S().xlang === 'en') {
  document.documentElement.lang = 'en';
  trWalk(document.body);
  new MutationObserver(ms => ms.forEach(m => { if (m.type === 'childList') m.addedNodes.forEach(trWalk); else if (m.type === 'characterData') trNode(m.target); else if (m.type === 'attributes') trAttr(m.target); }))
    .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
}
function langSheet() {
  openSheet(`<div class="sheet-title">زبان برنامه</div>` + [['fa', 'فارسی'], ['en', 'English']].map(([k, v]) => `<div class="sheet-item" data-xl="${k}">${IC('globe', '🌐')}${v}${(S().xlang || 'fa') === k ? '<span style="margin-right:auto">✓</span>' : ''}</div>`).join(''));
  $$('#sheet-content [data-xl]').forEach(b => b.addEventListener('click', () => { S().xlang = b.dataset.xl; save(); closeSheet(); toast('…', 'info'); setTimeout(() => location.reload(), 450); }));
}
applyFs();

/* ============ تنظیمات: حریم خصوصی + شخصی‌سازی ============ */
wrap('renderSettings', o => function () {
  o.apply(this, arguments);
  const body = $('#settings-body'); if (!body) return;
  const row = (k, ic, t, v) => `<div class="row" data-xset="${k}"><span class="r-icon">${ic}</span><span class="r-text">${t}</span><span class="r-val">${v}</span><span class="chev">${icon('chevron', 18)}</span></div>`;
  const pv = X().privacy, titles = $$('.section-title', body);
  const ptitle = titles.find(x => x.textContent.includes('حریم خصوصی'));
  const privRows = Object.keys(PRIV).map(k => row('priv-' + k, IC('lock', '🔒'), PRIV[k][0], PV[pv[k]])).join('');
  if (ptitle && ptitle.nextElementSibling && ptitle.nextElementSibling.classList.contains('group')) ptitle.nextElementSibling.insertAdjacentHTML('beforeend', privRows);
  else { const w = document.createElement('div'); w.innerHTML = `<div class="section-title">حریم خصوصی و امنیت</div><div class="group">${privRows}</div>`; const a = titles.find(x => x.textContent.includes('ظاهر و برنامه')); a ? a.before(...w.childNodes) : body.append(...w.childNodes); }
  const w2 = document.createElement('div');
  w2.innerHTML = `<div class="section-title">شخصی‌سازی</div><div class="group">
    ${row('fs', IC('edit', 'Aa'), 'اندازه‌ی متن پیام‌ها', FS[S().xfs || 'md'])}
    ${row('lang', IC('globe', '🌐'), 'زبان برنامه', S().xlang === 'en' ? 'English' : 'فارسی')}
    <div class="row"><span class="r-icon">${IC('verified', '🛡')}</span><span class="r-text">حالت واقعی (بدون شبیه‌سازی)</span><label class="switch"><input type="checkbox" id="x-real" ${S().real ? 'checked' : ''}><span class="sl"></span></label></div>
    <div class="row"><span class="r-icon">${IC('mic', '🎤')}</span><span class="r-text">تبدیل گفتار به متن هنگام ضبط ویس</span><label class="switch"><input type="checkbox" id="x-stt" ${S().xstt ? 'checked' : ''}><span class="sl"></span></label></div></div>
    <div class="fx-hint">حالت واقعی: بازدید، ریکشن، رأی و کامنت ساختگی، پاسخ خودکار افراد و تنظیم دستی تعداد اعضا غیرفعال می‌شود. چت هوش مصنوعی عادی کار می‌کند.</div>
    <div class="fx-hint">اگر هنگام ضبط ویس صدا قطع می‌شود، تبدیل گفتار به متن را خاموش کن.</div>`;
  const a2 = $$('.section-title', body).find(x => x.textContent.includes('ظاهر و برنامه'));
  a2 ? a2.before(...w2.childNodes) : body.append(...w2.childNodes);
});
$('#settings-body').addEventListener('click', e => {
  const r = e.target.closest('[data-xset]'); if (!r) return;
  const k = r.dataset.xset;
  if (k.startsWith('priv-')) privSheet(k.slice(5)); else if (k === 'fs') fsSheet(); else if (k === 'lang') langSheet();
});
$('#settings-body').addEventListener('change', e => { if (e.target.id === 'x-real') { setReal(e.target.checked); return; } if (e.target.id === 'x-stt') { S().xstt = e.target.checked; save(); toast(e.target.checked ? 'روشن شد' : 'خاموش شد', 'info'); } });

/* ============ ۳۰) تماس صوتی / تصویری (شبیه‌سازی‌شده) ============ */
function startCall(chatId, kind) {
  const c = getChat(chatId); if (!c) return;
  if (c.type !== 'private') { toast('تماس فقط برای چت خصوصی است', 'info'); return; }
  if (isWarnerChat(c)) { toast('امکان تماس با این کاربر وجود ندارد', 'error'); return; }
  if (c.username && (state.me.blocked || []).includes('u:' + norm(c.username))) { toast('این کاربر را بلاک کرده‌اید', 'error'); return; }
  if ($('.x-call')) return;
  const video = kind === 'video';
  const ov = document.createElement('div'); ov.className = 'x-call';
  ov.innerHTML = `<div style="font-size:13px;opacity:.7">${video ? 'تماس تصویری' : 'تماس صوتی'}</div>
    <div class="mid"><div class="x-pulse" id="x-cav">${avatarHTML(c, 98)}</div><div class="nm">${esc(c.name)}</div><div class="st" id="x-cst">در حال برقراری تماس…</div></div>
    <div class="btns"><button data-k="mic">🎤</button><button data-k="spk">🔊</button>${video ? '<button data-k="cam" class="on">📹</button>' : ''}<button data-k="end" class="end">✕</button></div>`;
  document.body.appendChild(ov);
  const st = $('#x-cst'); let stream = null, t1, t2, t3, tick, ring, sec = 0, connected = false, done = false;
  if (video && navigator.mediaDevices) navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(s => { if (done) { s.getTracks().forEach(t => t.stop()); return; } stream = s; const v = document.createElement('video'); v.autoplay = true; v.muted = true; v.playsInline = true; v.srcObject = s; ov.appendChild(v); }).catch(() => toast('دسترسی به دوربین داده نشد', 'error'));
  const finish = (text) => {
    if (done) return; done = true;
    [t1, t2, t3].forEach(clearTimeout); clearInterval(tick); clearInterval(ring);
    if (stream) stream.getTracks().forEach(t => t.stop());
    ov.remove();
    const ch = getChat(c.id); if (!ch) return;
    ch.messages.push(newMsg({ text, callLog: true, status: 'read' }));
    if (activeChatId === ch.id) renderMessages(); renderChatList(); save();
  };
  const end = () => finish(connected ? `${video ? '📹 تماس تصویری' : '📞 تماس صوتی'} · ${fmtDur(sec)}` : `${video ? '📹' : '📞'} تماس لغو شد`);
  ov.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = b.dataset.k;
    if (k === 'end') end();
    else if (k === 'cam') { if (stream) stream.getVideoTracks().forEach(t => t.enabled = !t.enabled); b.classList.toggle('on'); }
    else b.classList.toggle('on');
  });
  ring = setInterval(() => { if (!connected && S().sounds) beep(); }, 1300);
  t1 = setTimeout(() => { st.textContent = 'در حال زنگ خوردن…'; }, 1400);
  t2 = setTimeout(() => {
    if (Math.random() < .85) {
      connected = true; clearInterval(ring); $('#x-cav').classList.remove('x-pulse'); st.textContent = '0:00';
      tick = setInterval(() => { sec++; st.textContent = fmtDur(sec); }, 1000);
    } else { st.textContent = 'پاسخ نداد'; t3 = setTimeout(() => finish(`${video ? '📹' : '📞'} تماس بی‌پاسخ`), 1800); }
  }, 4200);
}

/* ============ ۳۱) استوری ============ */
const DAY = 864e5, BGS = ['linear-gradient(135deg,#667eea,#764ba2)', 'linear-gradient(135deg,#f093fb,#f5576c)', 'linear-gradient(135deg,#43cea2,#185a9d)', 'linear-gradient(135deg,#fa709a,#fee140)', 'linear-gradient(135deg,#30cfd0,#330867)', 'linear-gradient(135deg,#ff9a9e,#fad0c4)', 'linear-gradient(135deg,#434343,#000)'];
const liveStories = a => ((a.x && a.x.stories) || []).filter(s => Date.now() - s.ts < DAY);
let stHtml = '', upl = false, uplDone = false;
const GRAD = '<defs><linearGradient id="xg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3d77"/><stop offset=".2" stop-color="#ff9a3d"/><stop offset=".4" stop-color="#ffe14d"/><stop offset=".6" stop-color="#4dff9a"/><stop offset=".8" stop-color="#3dc8ff"/><stop offset="1" stop-color="#9a5cff"/></linearGradient></defs>';
function renderStories() {
  const old = $('#x-stories'); if (old) old.remove();
  const btn = $('#btn-profile-top'), isChats = !!(btn && btn.classList.contains('profile-circle-btn'));
  const me = X(); me.stories = liveStories(state.me);
  const seen = new Set(me.storySeen);
  if (btn) {
    let ring = $('.x-ring', btn);
    if (!(isChats && (me.stories.length || upl || uplDone))) { if (ring) ring.remove(); btn.style.position = ''; }
    else {
      const k = upl ? 'up' : uplDone ? 'done' : me.stories.every(s => seen.has(s.id)) ? 'seen' : 'new';
      if (!ring) { ring = document.createElement('span'); ring.className = 'x-ring'; if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative'; btn.appendChild(ring); }
      if (ring.dataset.s !== k) {
        ring.dataset.s = k;
        const sq = $('.profile-square', btn) || btn, br = btn.getBoundingClientRect(), sr = sq.getBoundingClientRect();
        const w = sr.width || 38, rx = Math.min(50, (parseFloat(getComputedStyle(sq).borderTopLeftRadius) || w / 2) / w * 100);
        Object.assign(ring.style, { left: (sr.left - br.left) + 'px', top: (sr.top - br.top) + 'px', width: sr.width + 'px', height: sr.height + 'px', inset: 'auto', borderRadius: getComputedStyle(sq).borderTopLeftRadius });
        ring.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${GRAD}<rect class="x-r x-r-${k}" x="2" y="2" width="96" height="96" rx="${rx}" pathLength="100"/></svg>`;
      }
    }
  }
  const pill = $('#list-title'); if (!pill) return;
  let box = $('.x-pill-st', pill);
  if (!box) { box = document.createElement('span'); box.className = 'x-pill-st'; pill.appendChild(box); box.addEventListener('click', e => { const b = e.target.closest('[data-xs]'); const a = b && (state.accounts || []).find(x => x.id === b.dataset.xs); if (a) viewStories(a); }); }
  const html = !isChats ? '' : (state.accounts || []).filter(a => liveStories(a).length).slice(0, 4).map(a => `<span class="x-pst ${liveStories(a).every(s => seen.has(s.id)) ? 'seen' : ''}" data-xs="${esc(a.id)}">${avatarHTML(a, 26)}</span>`).join('');
  if (stHtml !== html) { stHtml = html; box.innerHTML = html; }
}
const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'همین الان' : m < 60 ? faN(m) + ' دقیقه پیش' : faN(Math.floor(m / 60)) + ' ساعت پیش'; };
function myStorySheet() {
  const l = liveStories(state.me);
  openSheet(`<div class="sheet-title">استوری من</div>
    <div class="x-sg"><div class="x-sc" data-xa="text" style="background:${BGS[0]}"><b>Aa</b><span>استوری متنی</span></div><div class="x-sc" data-xa="photo" style="background:${BGS[2]}"><b>📷</b><span>استوری عکس</span></div></div>
    ${l.length ? `<div class="fx-sec">استوری‌های فعال من (۲۴ ساعت)</div>` + l.map((s, i) => `<div class="x-sl" data-xv="${i}"><span class="th" style="${s.kind === 'photo' ? `background-image:url('${esc(s.img)}')` : 'background:' + s.bg}">${s.kind === 'text' ? esc((s.text || '').slice(0, 6)) : ''}</span><span class="t">${s.kind === 'photo' ? (esc(s.text) || 'عکس') : esc((s.text || '').slice(0, 40))}<small>${ago(s.ts)} · 👁 ${faN((s.views || []).length)}</small></span><button class="fx-btn red" data-xd="${s.id}">حذف</button></div>`).join('') : ''}`);
  $$('#sheet-content [data-xa]').forEach(i => i.addEventListener('click', () => { const k = i.dataset.xa; closeSheet(); setTimeout(() => k === 'text' ? textStory() : photoStory(), 160); }));
  $$('#sheet-content [data-xv]').forEach(i => i.addEventListener('click', e => { if (e.target.closest('[data-xd]')) return; const n = +i.dataset.xv; closeSheet(); setTimeout(() => viewStories(state.me, n), 160); }));
  $$('#sheet-content [data-xd]').forEach(i => i.addEventListener('click', () => { const me = X(); me.stories = me.stories.filter(s => s.id !== i.dataset.xd); save(); stHtml = null; renderStories(); myStorySheet(); }));
}
document.addEventListener('click', e => {
  const b = e.target.closest('#btn-profile-top'); if (!b || !b.classList.contains('profile-circle-btn')) return;
  e.stopPropagation(); e.preventDefault();
  openDrawer();
}, true);
const pushStory = s => {
  upl = true; uplDone = false; renderStories(); toast('در حال آپلود استوری…', 'info');
  setTimeout(() => {
    const me = X(); me.stories.push(Object.assign({ id: rid(), ts: Date.now(), views: [] }, s)); if (me.stories.length > 20) me.stories.shift(); save();
    upl = false; uplDone = true; renderStories(); toast('استوری منتشر شد', 'success');
    setTimeout(() => { uplDone = false; const r = $('#btn-profile-top .x-ring'); if (r) r.dataset.s = ''; renderStories(); }, 1100);
  }, 1800);
};
function photoStory() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => { const f = inp.files[0]; if (!f) return; resizeImage(f, 1080, url => showPrompt('کپشن (اختیاری)', '', cap => pushStory({ kind: 'photo', img: url, text: cap.trim().slice(0, 140) }))); };
  inp.click();
}
function textStory() {
  $$('.x-ov').forEach(o => o.remove());
  let bg = BGS[0];
  const ov = document.createElement('div'); ov.className = 'x-ov x-ted'; ov.style.background = bg;
  ov.innerHTML = `<div class="x-ov-h"><button data-k="x">✕</button><div class="t" style="color:#fff">استوری جدید</div><span style="width:40px"></span></div>
    <div class="x-ted-b"><textarea id="x-st-ta" maxlength="200" placeholder="چیزی بنویس…"></textarea></div>
    <div class="x-ted-c"><span id="x-st-n">۰ / ۲۰۰</span></div>
    <div class="x-swatch">${BGS.map((g, i) => `<i data-g="${i}" class="${i ? '' : 'on'}" style="background:${g}"></i>`).join('')}</div>
    <button class="x-pub" data-k="ok">انتشار استوری</button>`;
  document.body.appendChild(ov);
  const ta = $('#x-st-ta', ov), fit = () => { const n = ta.value.length; ta.style.fontSize = (n < 40 ? 32 : n < 90 ? 26 : n < 150 ? 21 : 18) + 'px'; $('#x-st-n', ov).textContent = faN(n) + ' / ۲۰۰'; };
  ta.addEventListener('input', fit); fit();
  ov.addEventListener('click', e => {
    const k = e.target.closest('[data-k]')?.dataset.k, g = e.target.closest('[data-g]');
    if (g) { bg = BGS[+g.dataset.g]; ov.style.background = bg; $$('.x-swatch i', ov).forEach(i => i.classList.toggle('on', i === g)); }
    else if (k === 'x') ov.remove();
    else if (k === 'ok') { const t = ta.value.trim(); if (!t) { toast('متنی بنویس', 'info'); return; } ov.remove(); pushStory({ kind: 'text', text: t, bg }); }
  });
  setTimeout(() => ta.focus(), 120);
}
function viewStories(acc, from = 0) {
  const list = liveStories(acc); if (!list.length) return;
  const mine = acc === state.me, me = X();
  let i = Math.min(from, list.length - 1), raf, paused = false, t0 = 0, pAt = 0, downAt = 0, y0 = 0, dy = 0;
  const ov = document.createElement('div'); ov.className = 'x-sv'; document.body.appendChild(ov);
  const close = () => { cancelAnimationFrame(raf); ov.remove(); save(); stHtml = null; const r = $('#btn-profile-top .x-ring'); if (r) r.dataset.s = ''; renderStories(); };
  const paint = () => {
    const s = list[i];
    if (!me.storySeen.includes(s.id)) me.storySeen.push(s.id);
    if (!mine && !(s.views || []).includes(state.me.name)) (s.views = s.views || []).push(state.me.name);
    const v = s.views || [];
    ov.innerHTML = `<div class="bg" style="${s.kind === 'photo' ? `background-image:url('${esc(s.img)}')` : 'background:' + s.bg}"></div>
      <div class="card" style="${s.kind === 'text' ? 'background:' + s.bg : ''}">
        ${s.kind === 'photo' ? `<img src="${esc(s.img)}" alt="">` : `<div class="txt">${esc(s.text)}</div>`}
        <div class="shade"></div>
        <div class="bars">${list.map((_, k) => `<i><b style="width:${k < i ? 100 : 0}%"></b></i>`).join('')}</div>
        <div class="hd"><span class="av">${avatarHTML(acc, 36)}</span><span class="nm">${esc(acc.name)}<small>${ago(s.ts)}</small></span><button data-k="x" class="cl">✕</button></div>
        ${s.kind === 'photo' && s.text ? `<div class="cap">${esc(s.text)}</div>` : ''}
        ${mine ? `<div class="ft"><span class="pill">👁 ${faN(v.length)} بازدید${v.length ? ' · ' + esc(v.slice(0, 2).join('، ')) : ''}</span><button data-k="del" class="dl">🗑</button></div>` : ''}
      </div>`;
    t0 = performance.now(); paused = false; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  };
  const tick = t => {
    if (!paused) { const p = Math.min(1, (t - t0) / 5000), b = $$('.bars b', ov)[i]; if (b) b.style.width = p * 100 + '%'; if (p >= 1) return go(1); }
    raf = requestAnimationFrame(tick);
  };
  const go = d => { i += d; if (i < 0) i = 0; if (i >= list.length) { close(); return; } paint(); };
  ov.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; downAt = performance.now(); paused = true; pAt = downAt; y0 = e.clientY; dy = 0; });
  ov.addEventListener('pointermove', e => { if (!downAt) return; dy = e.clientY - y0; const c = $('.card', ov); if (dy > 12 && c) { c.style.transition = 'none'; c.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 400) / 2400})`; } });
  ov.addEventListener('pointerup', e => {
    if (e.target.closest('button') && !downAt) return;
    const now = performance.now(), c = $('.card', ov); t0 += now - pAt; paused = false;
    const held = now - downAt; downAt = 0;
    if (dy > 110) { close(); return; }
    if (c) { c.style.transition = 'transform .2s'; c.style.transform = ''; }
    if (held < 250 && dy < 12 && !e.target.closest('button')) { const x = e.clientX / innerWidth; if (x < .4) go(1); else if (x > .6) go(-1); }
  });
  ov.addEventListener('click', e => {
    const k = e.target.closest('button')?.dataset.k;
    if (k === 'x') close();
    else if (k === 'del') { paused = true; showConfirm('حذف استوری', 'این استوری حذف شود؟', () => { me.stories = me.stories.filter(s => s.id !== list[i].id); list.splice(i, 1); if (!list.length) close(); else { if (i >= list.length) i = list.length - 1; paint(); } save(); }); }
  });
  paint();
}
wrap('renderChatList', o => function () { const r = o.apply(this, arguments); try { renderStories(); } catch (e) { console.error(e); } return r; });
renderStories();


/* ============ حالت واقعی (حذف شبیه‌سازی) ============ */
const applyReal = () => document.documentElement.toggleAttribute('data-real', !!S().real);
function cleanFake() {
  state.chats.forEach(c => {
    c.messages.forEach(m => { m.seenCount = 0; m.seenTarget = 0; m._fakeReactionCounts = {}; m._faked = true; });
    if (c.type === 'group' || c.type === 'channel') { c.members = 1; c.membersList = []; c.admins = []; }
  });
  save(); renderChatList(); if (activeChatId) renderMessages(false);
}
function setReal(on, quiet) {
  S().real = !!on; applyReal(); save();
  if (!on || quiet) { if (!quiet) toast('حالت واقعی خاموش شد', 'info'); return; }
  openSheet(`<div class="sheet-title">حالت واقعی روشن شد</div>
    <div class="fx-hint" style="padding:0 18px 8px">از این به بعد هیچ بازدید، ریکشن، رأی یا کامنت ساختگی و پاسخ خودکار افراد ساخته نمی‌شود. با داده‌های ساختگی قبلی چه کنیم؟</div>
    <div class="sheet-item danger" data-xc="clean">${IC('trash', '🧹')}پاک‌سازی (بازدید و ریکشن‌ها صفر، تعداد اعضای گروه/کانال‌ها ۱)</div>
    <div class="sheet-item" data-xc="keep">${IC('check', '✓')}فقط از الان به بعد</div>`);
  $$('#sheet-content [data-xc]').forEach(b => b.addEventListener('click', () => { if (b.dataset.xc === 'clean') { cleanFake(); toast('پاک‌سازی شد', 'success'); } closeSheet(); }));
}
['startSeenSim', 'simFakeReactions', 'simAIComments', 'aiComment', 'aiReplyToComment', 'simulatePollVotes', 'scheduleReply'].forEach(n => wrap(n, o => function () { if (S().real) return; return o.apply(this, arguments); }));
wrap('scheduleAIReply', o => function (chat) { if (S().real && chat && chat.type !== 'ai') return; return o.apply(this, arguments); });
wrap('showPrompt', o => function (title, value, onOk) { if (S().real && title === 'تعداد اعضا') { onOk('0'); return; } return o.apply(this, arguments); });
wrap('finishCreate', o => function (data, type) { if (S().real && (type === 'group' || type === 'channel')) { data.members = 1; data.membersList = []; data.admins = []; } return o.apply(this, arguments); });
wrap('msgHTML', o => function (m) {
  if (!S().real || !m) return o.apply(this, arguments);
  const a = m._fakeReactionCounts, b = m.seenCount, c = m.seenTarget;
  m._fakeReactionCounts = {}; m.seenCount = 0; m.seenTarget = 0;
  try { return o.apply(this, arguments); } finally { m._fakeReactionCounts = a; m.seenCount = b; m.seenTarget = c; }
});
applyReal();

/* ============ پنل پروفایل و استوری ============ */
const DSVG = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  story: '<circle cx="12" cy="12" r="9" stroke-dasharray="3.2 3"/><circle cx="12" cy="12" r="4"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c3 .1 5 2 5 5.2"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  bell: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  spark: '<path d="M12 3l2.2 6L20 11l-5.8 2L12 19l-2.2-6L4 11l5.8-2z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  gear: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.4"/><circle cx="8" cy="17" r="2.4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
const dsvg = (k, c, w = 24) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${DSVG[k]}</svg>`;
function openDrawer() {
  closeDrawer(true);
  const me = X(), has = liveStories(state.me).length, seenAll = has && liveStories(state.me).every(s => me.storySeen.includes(s.id));
  const others = (state.accounts || []).filter(a => a !== state.me);
  const tile = (k, ic, col, label, on) => `<div class="x-dt${on ? ' on' : ''}" data-d="${k}">${dsvg(ic, col)}<span>${label}</span></div>`;
  const ov = document.createElement('div'); ov.className = 'x-dr-ov';
  ov.innerHTML = `<div class="x-dr">
    <div class="x-dr-h"><button data-d="close" aria-label="بستن">✕</button><div class="t">گپ</div><span style="width:40px"></span></div>
    <div class="x-dr-card" data-d="accs"><span class="x-dav ${has ? (seenAll ? 'seen' : 'new') : ''}"><span class="in">${avatarHTML(state.me, 46)}</span></span>
      <div class="inf"><b>${esc(state.me.name || 'من')}</b><small dir="ltr">${state.me.username ? '@' + esc(state.me.username) : ''}</small></div>
      <span class="chv">${others.length ? '⌄' : ''}</span></div>
    <div class="x-dr-accs" style="display:none">${others.map(a => `<div class="x-da" data-acc="${esc(a.id)}">${avatarHTML(a, 34)}<span>${esc(a.name)}</span></div>`).join('')}</div>
    <div class="x-dr-chips"><span class="x-chip" data-d="story">${dsvg('plus', 'currentColor', 22)}افزودن استوری</span><span class="x-chip ic" data-d="mystories" title="استوری‌های من">${dsvg('clock', 'currentColor', 22)}</span></div>
    <div class="x-dr-line"></div>
    <div class="x-dr-grid">
      ${tile('profile', 'user', '#34c38f', 'پروفایل')}${tile('story', 'story', '#ec6aa8', 'استوری')}${tile('contacts', 'users', '#34c38f', 'مخاطبین')}
      ${tile('saved', 'bookmark', '#9a7cc2', 'ذخیره‌شده')}${tile('notifs', 'bell', 'currentColor', 'اعلان‌ها')}${tile('discover', 'compass', '#4aa3e8', 'کشف')}
    </div>
    <div class="x-dr-line"></div>
    <div class="x-dr-ft"><div data-d="settings">${dsvg('gear', 'currentColor', 22)}<span>تنظیمات</span></div><i></i><div data-d="theme">${dsvg('sun', 'currentColor', 22)}<span>${state.theme === 'light' ? 'تم تاریک' : 'تم روشن'}</span></div></div>
  </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('show'));
  const goFilter = f => { switchTab('chats'); const b = $(`#top-nav [data-filter="${f}"]`); if (b) b.click(); };
  ov.addEventListener('click', e => {
    if (e.target === ov) { closeDrawer(); return; }
    const acc = e.target.closest('[data-acc]');
    if (acc) { closeDrawer(true); switchAccount(acc.dataset.acc); return; }
    const d = e.target.closest('[data-d]'); if (!d) return;
    const k = d.dataset.d;
    if (k === 'accs') { const l = $('.x-dr-accs', ov); if (others.length) l.style.display = l.style.display === 'none' ? 'block' : 'none'; return; }
    if (k === 'theme') { state.theme = state.theme === 'light' ? 'dark' : 'light'; if (state.themeMode === 'auto') state.themeMode = 'manual'; applyTheme(); save(); closeDrawer(); return; }
    if (k === 'real') { setReal(!S().real, false); closeDrawer(true); return; }
    closeDrawer();
    setTimeout(() => {
      if (k === 'profile' || k === 'settings') switchTab('settings');
      else if (k === 'story') myStorySheet();
      else if (k === 'mystories') liveStories(state.me).length ? viewStories(state.me) : toast('استوری فعالی نداری', 'info');
      else if (k === 'contacts') { try { switchTab('contacts'); } catch { toast('بخش مخاطبین در دسترس نیست', 'info'); } }
      else if (k === 'saved') goFilter('saved');
      else if (k === 'discover') goFilter('discover');
      else if (k === 'ai') goFilter('ai');
      else if (k === 'notifs') { const b = $('#btn-notifs'); b ? b.click() : toast('اعلانی نیست', 'info'); }
    }, 220);
  });
}
function closeDrawer(now) { const ov = $('.x-dr-ov'); if (!ov) return; if (now) { ov.remove(); return; } ov.classList.remove('show'); setTimeout(() => ov.remove(), 220); }

console.log('extras.js loaded');
})();
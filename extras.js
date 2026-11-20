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
    if (box && /^\s*اعلان‌ها/.test(($('.sheet-title', box) || {}).textContent || '') && box.querySelector('.fx-n, .fx-empty')) box.classList.add('x-nsheet');
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
  const R = !!S().real;
  const posts = c.messages.filter(m => m.out && !m.deleted && m.type !== 'warning');
  const vw = m => R ? 0 : (m.seenCount || 0);
  const views = posts.reduce((n, m) => n + vw(m), 0), avg = posts.length ? Math.round(views / posts.length) : 0;
  const emo = {};
  posts.forEach(m => {
    Object.entries(m.reactions || {}).forEach(([e, arr]) => { emo[e] = (emo[e] || 0) + (arr || []).length; });
    if (!R) Object.entries(m._fakeReactionCounts || {}).forEach(([e, n]) => { emo[e] = (emo[e] || 0) + (+n || 0); });
  });
  const react = Object.values(emo).reduce((n, v) => n + v, 0);
  const cm = posts.reduce((n, m) => n + (m.comments || []).length, 0);
  const er = views ? ((react + cm) / views * 100).toFixed(1) : '0';
  const top = posts.slice().sort((p, q) => vw(q) - vw(p))[0];
  const last = posts.slice(-10), mx = Math.max(1, ...last.map(vw));
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i)); return d; });
  const per = days.map(d => posts.filter(m => new Date(m.ts).toDateString() === d.toDateString()).length), mp = Math.max(1, ...per);
  const best = per.indexOf(Math.max(...per));
  const wd = d => d.toLocaleDateString('fa-IR', { weekday: 'short' });
  const eTop = Object.entries(emo).sort((p, q) => q[1] - p[1]).slice(0, 5), em = Math.max(1, ...eTop.map(x => x[1]));
  const kpi = (ic, col, v, l) => `<div class="k"><i style="background:${col}">${ic}</i><b>${v}</b><span>${l}</span></div>`;
  openSheet(`<div class="sheet-title">آمار کانال</div>
    <div class="x-sth">${avatarHTML(c, 46)}<div><b>${esc(c.name)}</b><small>${faN(c.members || 0)} عضو</small></div><span class="x-sr">${faN(er)}٪ تعامل</span></div>
    <div class="x-sk">
      ${kpi('👥', 'linear-gradient(135deg,#60a5fa,#3b82f6)', faN(c.members || 0), 'عضو')}
      ${kpi('📝', 'linear-gradient(135deg,#a78bfa,#7c3aed)', faN(posts.length), 'پست')}
      ${kpi('👁', 'linear-gradient(135deg,#34d399,#059669)', faN(views), 'کل بازدید')}
      ${kpi('📈', 'linear-gradient(135deg,#fbbf24,#f59e0b)', faN(avg), 'میانگین بازدید هر پست')}
      ${kpi('❤️', 'linear-gradient(135deg,#fb7185,#e11d48)', faN(react), 'واکنش')}
      ${kpi('💬', 'linear-gradient(135deg,#22d3ee,#0891b2)', faN(cm), 'نظر')}
    </div>
    <div class="x-sc2"><h4>بازدید ۱۰ پست آخر</h4>${last.length ? `<div class="x-bars2">${last.map(m => `<div class="c"><span class="v">${faN(vw(m))}</span><i style="height:${Math.max(5, Math.round(vw(m) / mx * 100))}%"></i><span class="l">${esc(new Date(m.ts).toLocaleDateString('fa-IR', { day: 'numeric', month: 'numeric' }))}</span></div>`).join('')}</div>` : '<div class="fx-empty">هنوز پستی نیست</div>'}</div>
    ${top ? `<div class="x-sc2"><h4>برترین پست</h4><div class="x-top"><span class="t">${esc((pinPreview(top) || 'پست').slice(0, 90))}</span><span class="m">👁 ${faN(vw(top))} · ${fmtListTime(top.ts)}</span></div></div>` : ''}
    ${eTop.length ? `<div class="x-sc2"><h4>پرطرفدارترین واکنش‌ها</h4>${eTop.map(([e, n]) => `<div class="x-er"><span class="e">${e}</span><span class="b"><i style="width:${Math.round(n / em * 100)}%"></i></span><span class="n">${faN(n)}</span></div>`).join('')}</div>` : ''}
    <div class="x-sc2"><h4>پست‌های ۷ روز گذشته${posts.length ? ` <small>· پرکارترین روز: ${wd(days[best])}</small>` : ''}</h4><div class="x-bars2 s">${per.map((n, i) => `<div class="c"><span class="v">${faN(n)}</span><i style="height:${Math.max(5, Math.round(n / mp * 100))}%"></i><span class="l">${esc(wd(days[i]))}</span></div>`).join('')}</div></div>
    <div class="fx-hint" style="padding:6px 18px 14px">${R ? 'حالت واقعی روشن است؛ بازدیدها فقط از داده‌ی واقعی شمرده می‌شوند.' : 'آمار از داده‌های همین دستگاه محاسبه می‌شود.'}</div>`);
  const sh = $('#sheet-content'); if (sh) sh.classList.add('x-glass');
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
  if (c.type === 'private') rows += row('call-voice', IC('phone', '📞'), 'تماس صوتی') + row('call-video', IC('camera', '📹'), 'تماس تصویری') + row('vip', '⭐', 'نشان کاربر ویژه', chatEntVip(c) ? 'روشن' : 'خاموش');
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
  else if (k === 'vip') { c.vip = !chatEntVip(c); save(); renderInfo(); renderChatList(); toast(c.vip ? 'نشان کاربر ویژه فعال شد' : 'نشان کاربر ویژه برداشته شد', 'info'); }
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
  { const sb = $('[data-act="set-badge"]', body); if (sb && !$('#x-vip', body)) sb.closest('.group').insertAdjacentHTML('beforeend', `<div class="row x-viprow"><span class="r-icon x-vipic"><img src="vipgold.png" alt="" onerror="this.replaceWith('⭐')"></span><span class="r-text">نشان کاربر ویژه</span><label class="switch"><input type="checkbox" id="x-vip" ${state.me.vip ? 'checked' : ''}><span class="sl"></span></label></div>`); }
  const a2 = $$('.section-title', body).find(x => x.textContent.includes('ظاهر و برنامه'));
  a2 ? a2.before(...w2.childNodes) : body.append(...w2.childNodes);
});
$('#settings-body').addEventListener('click', e => {
  const r = e.target.closest('[data-xset]'); if (!r) return;
  const k = r.dataset.xset;
  if (k.startsWith('priv-')) privSheet(k.slice(5)); else if (k === 'fs') fsSheet(); else if (k === 'lang') langSheet();
});
$('#settings-body').addEventListener('change', e => { if (e.target.id === 'x-vip') { state.me.vip = e.target.checked; save(); renderSettings(); renderChatList(); toast(e.target.checked ? 'نشان کاربر ویژه فعال شد' : 'نشان کاربر ویژه برداشته شد', 'info'); return; } if (e.target.id === 'x-real') { setReal(e.target.checked); return; } if (e.target.id === 'x-stt') { S().xstt = e.target.checked; save(); toast(e.target.checked ? 'روشن شد' : 'خاموش شد', 'info'); } });

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
const GRAD = '<defs><linearGradient id="xg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52d17c"/><stop offset="1" stop-color="#3a93e8"/></linearGradient></defs>';
function renderStories() {
  const old = $('#x-stories'); if (old) old.remove();
  const btn = $('#btn-profile-top'), isChats = !!(btn && btn.classList.contains('profile-circle-btn'));
  const me = X(); me.stories = liveStories(state.me);
  const seen = new Set(me.storySeen);
  if (btn) {
    const sq = $('#top-profile-avatar') || $('.profile-square', btn) || btn;
    let ring = $('.x-ring', sq);
    const allSeen = me.stories.length && me.stories.every(x => seen.has(x.id));
    if (!(isChats && ((me.stories.length && !allSeen) || upl || uplDone))) { if (ring) ring.remove(); btn.classList.remove('x-has-ring'); delete btn.dataset.xs; }
    else {
      const k = upl ? 'up' : uplDone ? 'done' : 'new';
      btn.classList.add('x-has-ring'); btn.dataset.xs = k;
      if (!ring) { ring = document.createElement('span'); ring.className = 'x-ring'; sq.appendChild(ring); }
      if (ring.dataset.s !== k) {
        ring.dataset.s = k;
        const w = sq.getBoundingClientRect().width || 38, ix = 1.2 / w * 100, rx = Math.min(50, (parseFloat(getComputedStyle(sq).borderTopLeftRadius) || w / 3) / w * 100);
        ring.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${GRAD}<rect class="x-r x-r-${k}" x="${ix}" y="${ix}" width="${100 - 2 * ix}" height="${100 - 2 * ix}" rx="${Math.max(0, rx - ix)}" pathLength="100"/></svg>`;
      }
    }
  }
  const pill = $('#list-title'); if (!pill) return;
  let box = $('.x-pill-st', pill);
  if (!box) { box = document.createElement('span'); box.className = 'x-pill-st'; pill.appendChild(box); box.addEventListener('click', e => { const b = e.target.closest('[data-xs]'); const a = b && (state.accounts || []).find(x => x.id === b.dataset.xs); if (a) viewStories(a); }); }
  const newest = a => Math.max(...liveStories(a).map(x => x.ts));
  const list3 = !isChats ? [] : (state.accounts || []).filter(a => liveStories(a).some(x => !seen.has(x.id))).sort((p, q) => newest(q) - newest(p)).slice(0, 3);
  const html = list3.map(a => `<span class="x-pst ${liveStories(a).every(s => seen.has(s.id)) ? 'seen' : ''}" data-xs="${esc(a.id)}" title="${esc(a.name)}"><span class="in">${avatarHTML(a, 37.2)}</span></span>`).join('');
  pill.classList.toggle('x-has-st', !!html);
  pill.style.setProperty('--xn', String(list3.length || 1));
  if (stHtml !== html) { stHtml = html; box.innerHTML = html; }
}
const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'همین الان' : m < 60 ? faN(m) + ' دقیقه پیش' : faN(Math.floor(m / 60)) + ' ساعت پیش'; };
function myStorySheet() {
  const l = liveStories(state.me);
  openSheet(`<div class="sheet-title">استوری من</div>
    <div class="x-addst" data-xa="new"><span class="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="tx"><b>ساخت استوری جدید</b><small>متن، عکس یا فیلم</small></span></div>
    ${l.length ? `<div class="fx-sec">استوری‌های فعال (۲۴ ساعت)</div>` + l.map((s, i) => `<div class="x-sl" data-xv="${i}"><span class="th" style="${s.img ? `background-image:url('${esc(s.img)}')` : 'background:' + (s.bg || BGS[0])}">${s.kind === 'text' ? esc((s.text || '').slice(0, 6)) : s.kind === 'video' ? '▶' : ''}</span><span class="t">${s.kind === 'text' ? esc((s.text || '').slice(0, 40)) : (esc(s.text) || (s.kind === 'video' ? 'فیلم' : 'عکس'))}<small>${ago(s.ts)} · 👁 ${faN((s.views || []).length)}</small></span><button class="fx-btn red" data-xd="${s.id}">حذف</button></div>`).join('') : ''}`);
  const sh = $('#sheet-content'); if (sh) sh.classList.add('x-glass');
  $$('#sheet-content [data-xa]').forEach(i => i.addEventListener('click', () => { closeSheet(); setTimeout(() => storyCreator(), 160); }));
  $$('#sheet-content [data-xv]').forEach(i => i.addEventListener('click', e => { if (e.target.closest('[data-xd]')) return; const n = +i.dataset.xv; closeSheet(); setTimeout(() => viewStories(state.me, n), 160); }));
  $$('#sheet-content [data-xd]').forEach(i => i.addEventListener('click', () => { const me = X(); me.stories = me.stories.filter(s => s.id !== i.dataset.xd); save(); stHtml = null; renderStories(); myStorySheet(); }));
}
wrap('closeSheet', o => function () { const sh = $('#sheet-content'); if (sh) sh.classList.remove('x-glass'); return o.apply(this, arguments); });
wrap('collectMediaIds', o => function () { const ids = o.apply(this, arguments); [state.me, ...(state.accounts || [])].forEach(a => ((a && a.x && a.x.stories) || []).forEach(s => { if (s.vid) ids.add(s.vid); })); return ids; });
document.addEventListener('click', e => {
  const b = e.target.closest('#btn-profile-top');
  if (b && setCat && !$('#tab-settings').classList.contains('hidden')) { e.stopPropagation(); e.preventDefault(); setCat = null; renderSettings(); return; }
  if (!b || !b.classList.contains('profile-circle-btn')) return;
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
const SQ_BGS = ['linear-gradient(135deg,#667eea,#764ba2)', 'linear-gradient(135deg,#f093fb,#f5576c)', 'linear-gradient(135deg,#43cea2,#185a9d)', 'linear-gradient(135deg,#fa709a,#fee140)', 'linear-gradient(135deg,#30cfd0,#330867)', 'linear-gradient(135deg,#ff9a9e,#fad0c4)', 'linear-gradient(135deg,#0f2027,#2c5364)', 'linear-gradient(135deg,#f7971e,#ffd200)', 'linear-gradient(135deg,#11998e,#38ef7d)', 'linear-gradient(135deg,#8e2de2,#4a00e0)', 'linear-gradient(135deg,#e96443,#904e95)', 'linear-gradient(135deg,#232526,#414345)'];
function storyCreator(startMode) {
  $$('.x-ov').forEach(o => o.remove());
  let mode = startMode || 'text', bg = SQ_BGS[0], text = '', cap = '', media = null, busy = false;
  const ov = document.createElement('div'); ov.className = 'x-ov x-cr'; document.body.appendChild(ov);
  const bgOf = () => mode === 'text' ? bg : (media && media.poster ? `url('${media.poster}') center/cover` : SQ_BGS[6]);
  const draw = () => {
    ov.innerHTML = `<div class="x-cr-bg ${mode === 'media' ? 'blur' : ''}" style="background:${bgOf()}"></div>
      <div class="x-cr-top"><button class="x-gb" data-k="x" aria-label="بستن">✕</button>
        <div class="x-seg"><button data-m="text" class="${mode === 'text' ? 'on' : ''}">متن</button><button data-m="media" class="${mode === 'media' ? 'on' : ''}">عکس و فیلم</button></div><span class="x-gb ghost"></span></div>
      <div class="x-cr-body">${mode === 'text'
        ? `<textarea id="x-cr-ta" maxlength="200" placeholder="چیزی بنویس…">${esc(text)}</textarea>`
        : media
          ? `<div class="x-cr-prev">${media.kind === 'video' ? `<video src="${media.url}" autoplay loop muted playsinline></video>` : `<img src="${media.url}" alt="">`}<button class="x-gb sm" data-k="rm" aria-label="حذف">✕</button></div>`
          : `<div class="x-cr-pick" data-k="pick"><span class="pi"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="1.6"/><path d="M21 16l-5-4-7 6"/></svg></span><b>انتخاب عکس یا فیلم</b><small>فیلم تا ۳۰ ثانیه</small></div>`}</div>
      <div class="x-cr-ft">${mode === 'text'
        ? `<div class="x-cr-sw">${SQ_BGS.map((g, i) => `<i data-g="${i}" class="${g === bg ? 'on' : ''}" style="background:${g}"></i>`).join('')}</div>`
        : (media ? `<input id="x-cr-cap" maxlength="140" placeholder="کپشن (اختیاری)" value="${esc(cap)}">` : '')}
        <button class="x-pub" data-k="ok" ${busy ? 'disabled' : ''}>${busy ? 'در حال آماده‌سازی…' : 'انتشار استوری'}</button></div>`;
    const ta = $('#x-cr-ta', ov);
    if (ta) { const fit = () => { text = ta.value; const n = text.length; ta.style.fontSize = (n < 40 ? 32 : n < 90 ? 26 : n < 150 ? 21 : 18) + 'px'; }; ta.addEventListener('input', fit); fit(); setTimeout(() => ta.focus(), 80); }
    const ci = $('#x-cr-cap', ov); if (ci) ci.addEventListener('input', () => { cap = ci.value; });
  };
  const pick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*,video/*';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      if (f.type.startsWith('video/')) {
        if (f.size > 40 * 1024 * 1024) { toast('حجم فیلم باید کمتر از ۴۰ مگابایت باشد', 'error'); return; }
        const url = URL.createObjectURL(f), v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.playsInline = true; v.src = url;
        v.onloadedmetadata = () => {
          if (v.duration > 31) { toast('فیلم استوری حداکثر ۳۰ ثانیه است', 'error'); URL.revokeObjectURL(url); return; }
          v.currentTime = Math.min(0.2, v.duration / 2);
        };
        v.onseeked = () => {
          let poster = ''; try { const cv = document.createElement('canvas'), r = Math.min(360 / v.videoWidth, 640 / v.videoHeight, 1); cv.width = Math.round(v.videoWidth * r); cv.height = Math.round(v.videoHeight * r); cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height); poster = cv.toDataURL('image/jpeg', .7); } catch {}
          media = { kind: 'video', url, file: f, poster, dur: Math.round(v.duration) }; draw();
        };
        v.onerror = () => toast('این فیلم پشتیبانی نمی‌شود', 'error');
      } else resizeImage(f, 1080, u => { media = { kind: 'photo', url: u, poster: u }; draw(); });
    };
    inp.click();
  };
  ov.addEventListener('click', async e => {
    const m = e.target.closest('[data-m]'); if (m) { mode = m.dataset.m; draw(); return; }
    const g = e.target.closest('[data-g]'); if (g) { bg = SQ_BGS[+g.dataset.g]; draw(); return; }
    const k = e.target.closest('[data-k]')?.dataset.k; if (!k) return;
    if (k === 'x') { ov.remove(); }
    else if (k === 'pick') pick();
    else if (k === 'rm') { media = null; draw(); }
    else if (k === 'ok') {
      if (busy) return;
      if (mode === 'text') { const t = text.trim(); if (!t) { toast('متنی بنویس', 'info'); return; } ov.remove(); pushStory({ kind: 'text', text: t, bg }); return; }
      if (!media) { toast('عکس یا فیلم انتخاب کن', 'info'); return; }
      if (media.kind === 'photo') { ov.remove(); pushStory({ kind: 'photo', img: media.url, text: cap.trim().slice(0, 140) }); return; }
      busy = true; draw();
      try { const id = await mediaPut(media.file); ov.remove(); pushStory({ kind: 'video', vid: id, img: media.poster, dur: media.dur, text: cap.trim().slice(0, 140) }); }
      catch { busy = false; draw(); toast('ذخیره‌ی فیلم ممکن نشد', 'error'); }
    }
  });
  draw();
}
function viewStories(acc, from = 0) {
  const list = liveStories(acc); if (!list.length) return;
  const mine = acc === state.me, me = X();
  let i = Math.min(from, list.length - 1), raf, paused = false, t0 = 0, pAt = 0, downAt = 0, y0 = 0, dy = 0, vid = null, frozen = false, lastT = 0;
  const ov = document.createElement('div'); ov.className = 'x-sv'; document.body.appendChild(ov);
  const close = () => { cancelAnimationFrame(raf); ov.remove(); save(); stHtml = null; const r = $('#btn-profile-top .x-ring'); if (r) r.dataset.s = ''; renderStories(); };
  const paint = () => {
    const s = list[i];
    if (!me.storySeen.includes(s.id)) me.storySeen.push(s.id);
    if (!mine && !(s.views || []).includes(state.me.name)) (s.views = s.views || []).push(state.me.name);
    const v = s.views || [];
    ov.innerHTML = `<div class="bg" style="${s.img ? `background-image:url('${esc(s.img)}')` : 'background:' + s.bg}"></div>
      <div class="card" style="${s.kind === 'text' ? 'background:' + s.bg : ''}">
        ${s.kind === 'photo' ? `<img src="${esc(s.img)}" alt="">` : s.kind === 'video' ? `<video playsinline poster="${esc(s.img || '')}"></video>` : `<div class="txt">${esc(s.text)}</div>`}
        <div class="shade"></div>
        <div class="bars">${list.map((_, k) => `<i><b style="width:${k < i ? 100 : 0}%"></b></i>`).join('')}</div>
        <div class="hd"><span class="av">${avatarHTML(acc, 36)}</span><span class="nm">${esc(acc.name)}<small>${ago(s.ts)}</small></span><button data-k="x" class="cl">✕</button></div>
        ${s.kind !== 'text' && s.text ? `<div class="cap">${esc(s.text)}</div>` : ''}
        ${mine ? `<div class="ft"><span class="pill" data-k="info">👁 ${faN(v.length)} · ❤ ${faN(Object.keys(s.reacts || {}).length)} · 💬 ${faN((s.replies || []).length)}</span><button data-k="del" class="dl">🗑</button></div>`
          : `<div class="x-rp"><div class="x-emo" style="display:none">${['❤️', '🔥', '😂', '😮', '😢', '👏'].map(e => `<button data-k="react" data-e="${e}">${e}</button>`).join('')}</div><div class="rpb"><input id="x-rp" placeholder="پاسخ به استوری…" maxlength="300" autocomplete="off"><button data-k="emo" class="e">${esc((s.reacts && s.reacts[state.me.name]) || '☺')}</button><button data-k="send" class="s" aria-label="ارسال"><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3.4 20.4l17.4-7.5a1 1 0 000-1.8L3.4 3.6a.8.8 0 00-1.1.9l1.7 6.1 9.5 1.4-9.5 1.4-1.7 6.1a.8.8 0 001.1.9z"/></svg></button></div></div>`}
      </div>`;
    vid = null;
    if (s.kind === 'video') mediaUrl(s.vid).then(u => { const v = $('video', ov); if (!v || list[i] !== s) return; if (!u) { toast('فیلم در دسترس نیست', 'error'); return; } vid = v; v.src = u; v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }); });
    t0 = performance.now(); paused = false; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  };
  const setFrozen = f => { frozen = f; if (vid) { f ? vid.pause() : vid.play().catch(() => {}); } };
  const floatEmoji = e => { const el = document.createElement('span'); el.className = 'x-fl'; el.textContent = e; el.style.left = (30 + Math.random() * 40) + '%'; $('.card', ov).appendChild(el); setTimeout(() => el.remove(), 1400); };
  const doReact = e => {
    const st = list[i]; st.reacts = st.reacts || {}; st.reacts[state.me.name] = e; save();
    const b = $('.x-rp .e', ov); if (b) b.textContent = e; const t = $('.x-emo', ov); if (t) t.style.display = 'none';
    for (let k = 0; k < 6; k++) setTimeout(() => floatEmoji(e), k * 90);
  };
  const doReply = () => {
    const inp = $('#x-rp', ov), text = inp ? inp.value.trim() : ''; if (!text) return;
    const st = list[i];
    let ch = state.chats.find(c => c.type === 'private' && c.username && acc.username && norm(c.username) === norm(acc.username));
    if (!ch) { ch = normalizeChat({ id: rid(), name: acc.name, type: 'private', username: acc.username || '', avatar: acc.avatar, badgeType: acc.badgeType, createdAt: Date.now(), messages: [] }, 0); state.chats.push(ch); }
    sendMessage({ quote: st.kind === 'text' ? st.text.slice(0, 60) : (st.kind === 'video' ? '🎬 فیلم' : '🖼 عکس'), quoteName: 'استوری' }, text, ch.id);
    (st.replies = st.replies || []).push({ by: state.me.name, text, ts: Date.now() }); save();
    inp.value = ''; inp.blur(); renderChatList(); toast('پاسخ ارسال شد', 'success');
  };
  const showInfo = () => {
    const st = list[i]; setFrozen(true);
    const v = st.views || [], rc = st.reacts || {}, rp = st.replies || [];
    const row = n => { const [c1, c2] = nameColors(n); return `<div class="r"><span class="a" style="background:linear-gradient(135deg,${c1},${c2})">${esc(initials(n))}</span><span class="n">${esc(n)}</span><span class="e">${esc(rc[n] || '')}</span></div>`; };
    const p = document.createElement('div'); p.className = 'x-vs';
    p.innerHTML = `<div class="x-vs-b"><div class="x-vs-h"><b>بازدیدکننده‌ها</b><button data-k="vsx">✕</button></div>
      <div class="x-vs-l">${v.length ? v.map(row).join('') : '<div class="fx-empty">هنوز کسی ندیده</div>'}
      ${rp.length ? `<div class="fx-sec">پاسخ‌ها</div>` + rp.map(r => `<div class="rp"><b>${esc(r.by)}</b><span>${esc(r.text)}</span></div>`).join('') : ''}</div></div>`;
    ov.appendChild(p);
  };
  const durMs = () => { const s = list[i]; return s.kind === 'video' ? Math.min(31, (vid && vid.duration > 0 ? vid.duration : s.dur) || 8) * 1000 : 5000; };
  const tick = t => {
    if (frozen) t0 += t - lastT; lastT = t;
    if (!paused && !frozen) { const sv = list[i].kind === 'video' && vid && vid.duration > 0, p = sv ? (vid.ended ? 1 : Math.min(1, vid.currentTime / vid.duration)) : Math.min(1, (t - t0) / durMs()), b = $$('.bars b', ov)[i]; if (b) b.style.width = p * 100 + '%'; if (p >= 1) return go(1); }
    raf = requestAnimationFrame(tick);
  };
  const go = d => { i += d; if (i < 0) i = 0; if (i >= list.length) { close(); return; } paint(); };
  ov.addEventListener('pointerdown', e => { if (e.target.closest('button,.x-rp,.x-vs')) return; downAt = performance.now(); paused = true; pAt = downAt; y0 = e.clientY; dy = 0; if (vid) vid.pause(); });
  ov.addEventListener('pointermove', e => { if (!downAt) return; dy = e.clientY - y0; const c = $('.card', ov); if (dy > 12 && c) { c.style.transition = 'none'; c.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 400) / 2400})`; } });
  ov.addEventListener('pointerup', e => {
    if (e.target.closest('button,.x-rp,.x-vs') || !downAt) return;
    const now = performance.now(), c = $('.card', ov); t0 += now - pAt; paused = false; if (vid) vid.play().catch(() => {});
    const held = now - downAt; downAt = 0;
    if (dy > 110) { close(); return; }
    if (c) { c.style.transition = 'transform .2s'; c.style.transform = ''; }
    if (held < 250 && dy < 12 && !e.target.closest('button,.x-rp,.x-vs')) { const x = e.clientX / innerWidth; if (x < .4) go(1); else if (x > .6) go(-1); }
  });
  ov.addEventListener('click', e => {
    const bt = e.target.closest('[data-k]'), k = bt?.dataset.k;
    if (e.target.classList && e.target.classList.contains('x-vs')) { e.target.remove(); setFrozen(false); return; }
    if (k === 'vsx') { $('.x-vs', ov)?.remove(); setFrozen(false); return; }
    if (k === 'info') { showInfo(); return; }
    if (k === 'emo') { const t = $('.x-emo', ov); if (t) t.style.display = t.style.display === 'none' ? 'flex' : 'none'; return; }
    if (k === 'react') { doReact(bt.dataset.e); return; }
    if (k === 'send') { doReply(); return; }
    if (k === 'x') close();
    else if (k === 'del') { paused = true; showConfirm('حذف استوری', 'این استوری حذف شود؟', () => { me.stories = me.stories.filter(s => s.id !== list[i].id); list.splice(i, 1); if (!list.length) close(); else { if (i >= list.length) i = list.length - 1; paint(); } save(); }); }
  });
  ov.addEventListener('focusin', e => { if (e.target.id === 'x-rp') setFrozen(true); });
  ov.addEventListener('focusout', e => { if (e.target.id === 'x-rp') setFrozen(false); });
  ov.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'x-rp') { e.preventDefault(); doReply(); } });
  paint();
}
wrap('renderChatList', o => function () { const r = o.apply(this, arguments); try { renderStories(); } catch (e) { console.error(e); } return r; });
renderStories();
{ const sq = $('#top-profile-avatar'); if (sq) new MutationObserver(() => { try { renderStories(); } catch {} }).observe(sq, { childList: true }); }


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
const bdg = a => { try { return (a && a.badgeType ? ' ' + vfHTML(a.badgeType, 15) : '') + (isVipAcc(a) ? vipImg() : ''); } catch { return ''; } };
function openDrawer() {
  closeDrawer(true);
  const me = X(), has = liveStories(state.me).length, seenAll = has && liveStories(state.me).every(s => me.storySeen.includes(s.id));
  const others = (state.accounts || []).filter(a => a !== state.me);
  const tile = (k, ic, col, label, on) => `<div class="x-dt${on ? ' on' : ''}" data-d="${k}">${dsvg(ic, col)}<span>${label}</span></div>`;
  const ov = document.createElement('div'); ov.className = 'x-dr-ov';
  ov.innerHTML = `<div class="x-dr">
    <div class="x-dr-h"><button data-d="close" aria-label="بستن">✕</button><div class="t">گپ</div><span style="width:40px"></span></div>
    <div class="x-dr-card">
      <div class="x-acc cur" data-d="accs"><span class="x-dav cur ${has ? (seenAll ? 'seen' : 'new') : ''}"><span class="in">${avatarHTML(state.me, 46)}</span></span>
        <div class="inf"><b>${esc(state.me.name || 'من')}${bdg(state.me)}</b><small dir="ltr">${state.me.username ? '@' + esc(state.me.username) : ''}</small></div>
        <span class="chv">${others.length ? '⌄' : ''}</span></div>
      ${others.map(a => `<div class="x-acc" data-acc="${esc(a.id)}"><span class="x-dav"><span class="in">${avatarHTML(a, 40)}</span></span><div class="inf"><b>${esc(a.name)}${bdg(a)}</b><small dir="ltr">${a.username ? '@' + esc(a.username) : ''}</small></div></div>`).join('')}
    </div>
    <div class="x-dr-chips"><span class="x-chip" data-d="addstory">${dsvg('plus', 'currentColor', 22)}افزودن استوری</span><span class="x-chip ic" data-d="mystories" title="استوری‌های من">${dsvg('clock', 'currentColor', 22)}</span></div>
    <div class="x-dr-line"></div>
    <div class="x-dr-grid">
      ${tile('profile', 'user', '#34c38f', 'پروفایل')}${tile('story', 'story', '#ec6aa8', 'استوری')}${tile('contacts', 'users', '#34c38f', 'مخاطبین')}
      ${tile('saved', 'bookmark', '#9a7cc2', 'ذخیره‌شده')}${tile('notifs', 'bell', 'currentColor', 'اعلان‌ها')}${tile('discover', 'compass', '#4aa3e8', 'کشف')}
    </div>
    <div class="x-dr-line"></div>
    <div class="x-dr-ft"><div data-d="settings">${dsvg('gear', 'currentColor', 22)}<span>تنظیمات</span></div><i></i><div data-d="theme">${dsvg('sun', 'currentColor', 22)}<span>${state.theme === 'light' ? 'تم تاریک' : 'تم روشن'}</span></div></div>
  </div>`;
  document.body.appendChild(ov);
  { const dr = $('.x-dr', ov), r = dr.getBoundingClientRect(); ov.style.alignItems = 'flex-start'; dr.style.marginTop = Math.max(8, r.top - 20) + 'px'; }
  requestAnimationFrame(() => ov.classList.add('show'));
  const goFilter = f => { switchTab('chats'); const b = $(`#top-nav [data-filter="${f}"]`); if (b) b.click(); };
  ov.addEventListener('click', e => {
    if (e.target === ov) { closeDrawer(); return; }
    const acc = e.target.closest('[data-acc]');
    if (acc) { closeDrawer(true); switchAccount(acc.dataset.acc); return; }
    const d = e.target.closest('[data-d]'); if (!d) return;
    const k = d.dataset.d;
    if (k === 'accs') { if (others.length) $('.x-dr-card', ov).classList.toggle('open'); return; }
    if (k === 'theme') { const nm = state.theme === 'light' ? 'dark' : 'light'; state.themeMode = nm; state.theme = nm; applyTheme(); save(); closeDrawer(true); toast(nm === 'light' ? 'تم روشن' : 'تم تاریک', 'info'); return; }
    if (k === 'real') { setReal(!S().real, false); closeDrawer(true); return; }
    closeDrawer();
    setTimeout(() => {
      if (k === 'profile' || k === 'settings') switchTab('settings');
      else if (k === 'story') myStorySheet();
      else if (k === 'addstory') storyCreator();
      else if (k === 'mystories') liveStories(state.me).length ? viewStories(state.me) : toast('استوری فعالی نداری', 'info');
      else if (k === 'contacts') { try { switchTab('contacts'); } catch { toast('بخش مخاطبین در دسترس نیست', 'info'); } }
      else if (k === 'saved') openSaved();
      else if (k === 'discover') goFilter('discover');
      else if (k === 'ai') goFilter('ai');
      else if (k === 'notifs') { const b = $('#btn-notifs'); b ? b.click() : toast('اعلانی نیست', 'info'); }
    }, 220);
  });
}
function closeDrawer(now) { const ov = $('.x-dr-ov'); if (!ov) return; if (now) { ov.remove(); return; } ov.classList.remove('show'); setTimeout(() => ov.remove(), 220); }


/* ============ تیک‌های تایید: سایز و جای عمودی مثل کد جدید (class: verified-icon) ============ */
const BADGE_LETTER_CENTER = {
  'ا': .40, 'آ': .50, 'أ': .45, 'إ': .35, 'ل': .40, 'ک': .40, 'ك': .40, 'گ': .42, 'ط': .38, 'ظ': .42,
  'ب': .06, 'پ': 0, 'ت': .25, 'ث': .30, 'ن': .02, 'ی': -.10, 'ي': -.10, 'ئ': 0,
  'د': .18, 'ذ': .27, 'ر': .03, 'ز': .12, 'ژ': .15, 'و': .02, 'ؤ': .10,
  'م': -.03, 'ه': .22, 'ة': .22, 'ھ': .22,
  'س': .08, 'ش': .17, 'ص': .10, 'ض': .18, 'ع': -.05, 'غ': 0, 'ف': .15, 'ق': .02,
  'ج': -.12, 'چ': -.15, 'ح': -.05, 'خ': .05
};
function letterCenterEm(ch) {
  if (!ch) return null;
  if (BADGE_LETTER_CENTER[ch] !== undefined) return BADGE_LETTER_CENTER[ch];
  if (/[a-z]/.test(ch)) return /[bdfhklt]/.test(ch) ? .35 : (/[gjpqy]/.test(ch) ? .12 : .25);
  if (/[A-Z0-9۰-۹٠-٩]/.test(ch)) return .35;
  return null;
}
function lastLetterBeforeBadge(img) {
  let n = img.previousSibling;
  while (n) {
    if (n.nodeType === 1 && n.classList.contains('verified-icon')) { n = n.previousSibling; continue; }
    let last = n; while (last.lastChild) last = last.lastChild;
    if (last.nodeType === 1 && last.tagName === 'IMG') return { ch: '', src: n };
    const t = (n.textContent || '').replace(/[\s\u200c\u200d\u200e\u200f\u064B-\u065F\u0670]+$/, '');
    if (t) return { ch: Array.from(t).pop(), src: n };
    n = n.previousSibling;
  }
  return { ch: '', src: null };
}
const BADGE_LIFT_PX = 0;
const BADGE_CENTER_EM = 0.25;   // ارتفاع مرکز نشان از خط پایه (بر حسب em)؛ برای همه‌ی حروف فارسی/انگلیسی/عدد یکسان. بیشتر = بالاتر   // بالا/پایین‌کردن همه‌ی تیک‌ها (پیکسل): مثبت = بالاتر
let _bcCanvas = null;
const _measCache = new Map();
function calcBadge(img, memo) {
  const { ch, src } = lastLetterBeforeBadge(img);
  const holder = (src && src.nodeType === 1) ? src : img.parentElement; if (!holder) return null;
  let f = memo.get(holder);
  if (!f) { const cs = getComputedStyle(holder); f = { fs: parseFloat(cs.fontSize) || 16, font: `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) || 16}px ${cs.fontFamily}` }; memo.set(holder, f); }
  const fs = f.fs, full = (src && src.nodeType === 1 ? src.textContent : (src && src.nodeValue) || ch).replace(/[\s\u200c\u200d\u200e\u200f]+$/, '').trim() || ch;
  const key = f.font;
  let m = _measCache.get(key);
  if (!m) {
    m = { c: BADGE_CENTER_EM, bbc: fs * 0.3 };
    try {
      _bcCanvas = _bcCanvas || document.createElement('canvas');
      const ctx = _bcCanvas.getContext('2d'); ctx.font = f.font;
      const mx = ctx.measureText('x'); if (mx.fontBoundingBoxAscent) m.bbc = (mx.fontBoundingBoxAscent - mx.fontBoundingBoxDescent) / 2;
    } catch (e) {}
    if (_measCache.size > 800) _measCache.clear();
    _measCache.set(key, m);
  }
  const ics = getComputedStyle(img), h = parseFloat(ics.height) || 20, mb = parseFloat(ics.marginBottom) || 0;
  const pe = img.parentElement; let flex = false;
  if (pe) { flex = memo.get(pe); if (flex === undefined) { flex = getComputedStyle(pe).display.includes('flex'); memo.set(pe, flex); } }
  return flex
    ? { img, top: (m.bbc - m.c * fs + mb / 2 - BADGE_LIFT_PX).toFixed(2) + 'px', va: '' }
    : { img, top: '', va: (m.c * fs - h / 2 - mb + BADGE_LIFT_PX).toFixed(2) + 'px' };
}
function normBadge(img) {
  if (img.classList.contains('verified-icon')) return;
  const big = (parseInt(img.getAttribute('width'), 10) || 0) >= 24 || !!img.closest('.info-name,.profile-card');
  img.classList.add('verified-icon'); if (big) img.classList.add('lg');
  img.removeAttribute('width'); img.removeAttribute('height');
  img.loading = 'eager'; img.decoding = 'async';
}
function alignBadges(list) {
  list.forEach(normBadge);
  const todo = list.filter(i => !i.hasAttribute('data-vc')), memo = new Map();
  const res = todo.map(i => calcBadge(i, memo));                  // اول همه‌ی خواندن‌ها
  todo.forEach(i => i.setAttribute('data-vc', '1'));
  res.forEach(r => { if (r) { r.img.style.top = r.top; r.img.style.verticalAlign = r.va; } });   // بعد همه‌ی نوشتن‌ها (بدون layout thrashing)
}
function alignAllBadges(root) { alignBadges([...(root || document).querySelectorAll('img.vf')]); }
function realignAllBadges() {
  document.querySelectorAll('.verified-icon[data-vc]').forEach(i => { i.removeAttribute('data-vc'); i.style.top = ''; i.style.verticalAlign = ''; });
  _measCache.clear(); alignAllBadges();
}
{
  const pend = new Set(); let queued = false;
  new MutationObserver(ms => {
    for (const m of ms) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.tagName === 'IMG' && n.classList.contains('vf')) pend.add(n);
      else if (n.querySelector) n.querySelectorAll('img.vf').forEach(i => pend.add(i));
    }
    if (pend.size && !queued) { queued = true; Promise.resolve().then(() => { queued = false; const l = [...pend].filter(i => i.isConnected); pend.clear(); if (l.length) alignBadges(l); }); }
  }).observe(document.body, { childList: true, subtree: true });
  alignAllBadges();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(realignAllBadges);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(realignAllBadges, 200); });
}

/* ============ بهینه‌سازی تصویر نشان‌ها: یک‌بار کوچک و برش‌خورده، بعد استفاده‌ی همه‌جا ============ */
let vipSrc = 'vipgold.png';
const vipImg = () => `<img class="vf verified-icon vipgold" src="${vipSrc}" alt="کاربر ویژه" title="کاربر ویژه">`;
const _prepP = new Map();
function prepImg(src) {
  if (_prepP.has(src)) return _prepP.get(src);
  const p = new Promise(res => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => {
      try {
        const w = im.naturalWidth, h = im.naturalHeight; if (!w || !h) return res(null);
        const k = Math.min(1, 96 / Math.max(w, h)), cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0, cw, ch);
        const d = cx.getImageData(0, 0, cw, ch).data; let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (d[(y * cw + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) return res(null);
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1, out = document.createElement('canvas'); out.width = bw; out.height = bh;
        out.getContext('2d').drawImage(cv, x0, y0, bw, bh, 0, 0, bw, bh);
        out.toBlob(b => res(b ? URL.createObjectURL(b) : null), 'image/png');
      } catch (e) { res(null); }   // مثلاً file:// ⇒ بدون بهینه‌سازی، تصویر اصلی می‌ماند
    };
    im.onerror = () => res(null); im.src = src;
  });
  _prepP.set(src, p); return p;
}
(async function prepBadges() {
  const orig = {}; const jobs = [];
  Object.keys(BADGES).forEach(k => { const b = BADGES[k]; if (b && b.src && !/^(blob|data):/.test(b.src)) { orig[b.src] = k; jobs.push(prepImg(b.src).then(u => { if (u) { b.optSrc = u; } })); } });
  jobs.push(prepImg('vipgold.png').then(u => { if (u) vipSrc = u; }));
  await Promise.all(jobs);
  Object.keys(BADGES).forEach(k => { const b = BADGES[k]; if (b && b.optSrc) { b.origSrc = b.src; b.src = b.optSrc; } });
  document.querySelectorAll('img.vf').forEach(i => {
    const o = i.getAttribute('src'); if (!o) return;
    const k = orig[o]; if (k && BADGES[k].optSrc) i.src = BADGES[k].optSrc; else if (o === 'vipgold.png' && vipSrc !== o) i.src = vipSrc;
  });
})();

/* ============ شبیه‌سازی هوشمند بازدید/واکنش/پاسخ استوری (در «حالت واقعی» خاموش است) ============ */
const SIM_NAMES = ['سارا', 'علی', 'مینا', 'رضا', 'نیلوفر', 'کیان', 'مهسا', 'آرش', 'هانیه', 'پارسا', 'نگار', 'سینا', 'ترانه', 'بهراد'];
const SIM_EMO = ['❤️', '🔥', '😂', '😍', '👏', '😮'];
const SIM_RPL = ['عالی بود 😍', 'خیلی قشنگه!', 'کجاست این؟', '😂😂', 'ایول 🔥', 'دمت گرم', 'چه خوب!', 'عاشقشم ❤️', 'منم بیام؟', 'کیف کردم'];
const pick1 = a => a[Math.floor(Math.random() * a.length)];
function simPool() {
  const set = new Set([...(state.chats || []).filter(c => c.type === 'private').map(c => c.name), ...(state.chats || []).flatMap(c => (c.membersList || []).map(m => m.name)), ...(state.accounts || []).map(a => a.name), ...SIM_NAMES]);
  set.delete(state.me.name); return [...set];
}
setInterval(() => {
  if (S().real) return;
  const me = X(); let ch = false; const now = Date.now();
  me.stories.forEach(st => {
    if (now - st.ts > DAY) return;
    if (!st.sim) { let t = st.ts; st.sim = simPool().sort(() => Math.random() - .5).slice(0, 4 + Math.floor(Math.random() * 8)).map(n => { t += 3000 + Math.random() * 45000; return { n, t, r: Math.random() < .45 ? pick1(SIM_EMO) : null, x: Math.random() < .2 ? pick1(SIM_RPL) : null }; }); st.simI = 0; ch = true; }
    while (st.simI < st.sim.length && st.sim[st.simI].t <= now) {
      const v = st.sim[st.simI++]; st.views = st.views || [];
      if (!st.views.includes(v.n)) st.views.push(v.n);
      if (v.r) (st.reacts = st.reacts || {})[v.n] = v.r;
      if (v.x) (st.replies = st.replies || []).push({ by: v.n, text: v.x, ts: now });
      ch = true;
    }
  });
  if (ch) { save(); const o = $('.x-sv'); if (!o) return; }
}, 3000);


/* ============ نشان «کاربر ویژه» + کاور اختصاصی + ساده‌سازی پروفایل ============ */
const isVipAcc = a => !!(a && a.vip);
const hx2 = n => n.toString(16).padStart(2, '0');
const rgb2hex = (r, g, b) => '#' + hx2(r) + hx2(g) + hx2(b);
const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mixHex = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(...A.map((v, i) => Math.round(v + (B[i] - v) * t))); };
const autoGradIdx = name => { let h = 0; for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % AV_GRADS.length; };

/* --- پروفایل: فقط عکس؛ بدون ایموجی و بدون انتخاب رنگ مربع --- */
wrap('renderAvatarPicker', o => function () {
  if (avatarTargetType !== 'me') return o.apply(this, arguments);
  const e = state.me;
  if (!e.avatar || e.avatar.type === 'emoji') { e.avatar = { type: 'gradient', value: autoGradIdx(e.name) }; save(); }
  const hasImg = e.avatar.type === 'image' && e.avatar.value;
  $('#avatar-panel').innerHTML = `<div class="av-preview"><div class="avatar" style="${avatarBgStyle(e)}">${avatarContent(e)}</div></div>
    <div class="av-section"><div class="av-upload" id="av-upload-btn">${icon('camera', 22)} ${hasImg ? 'تغییر عکس پروفایل' : 'انتخاب عکس پروفایل'}</div>
    ${hasImg ? `<div class="av-upload" id="av-remove-btn" style="margin-top:10px;color:var(--red,#f87171)">${icon('trash', 20)} حذف عکس</div>` : ''}
    <div style="text-align:center;font-size:12px;color:var(--text-3);padding:14px 20px 4px;line-height:1.7">بدون عکس، مربع پروفایل با رنگ و حرف اول نامت نمایش داده می‌شود.</div></div>`;
  $('#av-upload-btn').addEventListener('click', () => pickImage());
  const rb = $('#av-remove-btn'); if (rb) rb.addEventListener('click', () => { e.avatar = { type: 'gradient', value: autoGradIdx(e.name) }; applyAvatarChange(); renderAvatarPicker(); });
});

wrap('applyAvatarChange', o => function () { const r = o.apply(this, arguments); try { if (avatarTargetType === 'me' && avatarOverlay.classList.contains('show')) renderAvatarPicker(); } catch {} return r; });

/* --- کاور: فقط کاربر ویژه؛ بقیه گرادینت آبیِ کم‌رنگ خاکستری --- */
function applyCover(el, acc, mine, hint) {
  if (!el) return;
  el.removeAttribute('data-hint'); if (hint) el.setAttribute('data-hint', hint);
  el.classList.remove('x-defcover', 'x-gcover'); el.style.removeProperty('--xg');
  const hero = el.closest('.profile-card,.info-hero'), isInfo = el.classList.contains('info-cover');
  const vip = isVipAcc(acc);
  const full = () => { if (isInfo) { el.classList.remove('empty'); if (hero) hero.classList.add('has-cover'); } else el.classList.add('empty'); };   // در اطلاعات مخاطب: کاورِ تمام‌عرض
  if (vip && acc.coverPhoto) {
    if (el.classList.contains('empty')) { el.classList.remove('empty'); el.style.backgroundImage = `url("${acc.coverPhoto}")`; el.textContent = ''; if (isInfo && hero) hero.classList.add('has-cover'); }
    return;
  }
  if (hero) hero.classList.remove('fx-cv');
  if (vip && acc.coverGrad) { el.classList.add('x-gcover'); full(); el.style.backgroundImage = 'none'; el.style.setProperty('--xg', acc.coverGrad); el.textContent = ''; return; }
  if (vip && mine) return;            // کاربر ویژه‌ی بدون کاور: دکمه‌ی «افزودن کاور»
  el.classList.add('x-defcover'); full(); el.style.backgroundImage = 'none'; el.textContent = '';
}
const accOfEntity = e => (!e ? null : (e === state.me || (e.username && norm(e.username) === norm(state.me.username))) ? state.me : acctByUser(e.username));
const canEditInfo = c => isAdminMe(c) ? can(c, 'info') : !!(c.permissions && c.permissions.editInfo === 'all');
const isGC = c => !!c && (c.type === 'group' || c.type === 'channel');
const ownerAcc = c => {
  const o = c && c.owner;
  if (!o || (o.username && norm(o.username) === norm(state.me.username)) || o.name === state.me.name) return state.me;
  return (o.username && acctByUser(o.username)) || (state.accounts || []).find(a => a.name === o.name) || null;
};
const gcVip = c => isVipAcc(ownerAcc(c));                                  // کاور فقط اگر مالک، کاربر ویژه باشد
const canSetGcCover = c => isOwner(c) && isVipAcc(state.me);               // و فقط خودِ مالکِ ویژه می‌تواند بگذارد
const gcCoverSrc = c => ({ vip: gcVip(c), coverPhoto: c.coverPhoto, coverGrad: c.coverGrad });
function coverRefresh(ent) { if (ent === state.me) renderSettings(); else { renderInfo(); renderChatList(); } }
function fixCovers() {
  try {
    applyCover($('#my-cover-btn'), state.me, true);
    const c = getChat(infoChatId);
    if (c && c.type === 'private') applyCover($('#info-body .info-cover'), accOfEntity(c), false);
    else if (isGC(c)) applyCover($('#info-body .info-cover'), gcCoverSrc(c), false, canSetGcCover(c) ? 'افزودن کاور' : '');
  } catch (e) { console.error(e); }
}
wrap('renderSettings', o => function () { const r = o.apply(this, arguments); fixCovers(); return r; });
wrap('renderInfo', o => function () { const r = o.apply(this, arguments); fixCovers(); return r; });
wrap('openProfilePreview', o => function (u) {
  const r = o.apply(this, arguments);
  try { const f = findByUsername(u); if (f && f.entity) { const en = f.entity; if (isGC(en)) applyCover($('#profile-body .info-cover'), gcCoverSrc(en), false); else applyCover($('#profile-body .info-cover'), accOfEntity(en), false); } } catch {}
  return r;
});
wrap('handleInfoAction', o => function (act, c) {
  if (act === 'edit-cover' && c && c.type === 'private') { toast('کاور هر کاربر را خودش تنظیم می‌کند (فقط کاربران ویژه)', 'info'); return; }
  return o.apply(this, arguments);
});
document.addEventListener('click', e => {
  if (!e.target.closest('#my-cover-btn')) return;
  e.stopPropagation(); e.preventDefault();
  if (!isVipAcc(state.me)) { toast('فقط کاربران ویژه می‌توانند کاور بگذارند. نشان «کاربر ویژه» را از تنظیمات ← حساب کاربری فعال کن', 'info'); return; }
  myCoverSheet();
}, true);

function myCoverSheet() {
  const me = state.me, has = !!(me.coverPhoto || me.coverGrad);
  openSheet(`<div class="sheet-title">کاور پروفایل</div>
    <div class="x-cvprev" style="background:${me.coverGrad && !me.coverPhoto ? me.coverGrad : ''}">${me.coverPhoto ? `<img src="${esc(me.coverPhoto)}" alt="">` : (me.coverGrad ? '' : '<span>کاوری تنظیم نشده</span>')}</div>
    <div class="sheet-item" data-xcv="photo">${IC('image', '🖼')}انتخاب عکس برای کاور<small style="margin-right:auto;color:var(--text-3)">تا ۱۰۸۰×۳۸۰</small></div>
    <div class="sheet-item" data-xcv="grad">${IC('palette', '🎨')}گرادینت کاور (پیشنهادی از رنگ عکس پروفایل)</div>
    ${has ? `<div class="sheet-item danger" data-xcv="rm">${IC('trash', '🗑')}حذف کاور</div>` : ''}`);
  const sh = $('#sheet-content'); if (sh) sh.classList.add('x-glass');
  $$('#sheet-content [data-xcv]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.xcv; closeSheet();
    setTimeout(() => {
      if (k === 'photo') coverPick();
      else if (k === 'grad') coverGradSheet();
      else { me.coverPhoto = null; me.coverGrad = null; save(); coverRefresh(me); toast('کاور حذف شد', 'success'); }
    }, 160);
  }));
}
function coverPick(ent = state.me) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => coverCrop(im, ent);
    im.onerror = () => toast('این عکس پشتیبانی نمی‌شود', 'error');
    im.src = url;
  };
  inp.click();
}
function coverCrop(img, ent = state.me) {
  const RW = 1080, RH = 380, MINW = 540, MINH = 190, nw = img.naturalWidth, nh = img.naturalHeight;
  if (nw < MINW || nh < MINH) { toast(`عکس کوچک است؛ حداقل ${faN(MINW)}×${faN(MINH)} پیکسل لازم است`, 'error'); return; }
  $$('.x-ov').forEach(o => o.remove());
  const maxR = Math.min(nw, nh * RW / RH);
  let rw = maxR, cx = nw / 2, cy = nh / 2;
  const Wf = Math.min(innerWidth - 32, 520), Hf = Wf * RH / RW;
  const ov = document.createElement('div'); ov.className = 'x-ov x-cc'; document.body.appendChild(ov);
  ov.innerHTML = `<div class="x-ov-h"><button data-k="x">✕</button><div class="t">کاور پروفایل</div><button data-k="ok" class="okb">تایید</button></div>
    <div class="x-cc-body"><div class="x-cc-stage" style="width:${Wf}px;height:${Hf}px"><img alt="" src="${img.src}"><div class="x-cc-max"><span>حداکثر ${faN(RW)}×${faN(RH)}</span></div><div class="x-cc-min" style="width:${MINW / RW * 100}%;height:${MINH / RH * 100}%"><span>حداقل ${faN(MINW)}×${faN(MINH)}</span></div></div>
      <div class="x-cc-hint">عکس را بکش تا جایش را تنظیم کنی. با اسلایدر یا دو انگشت بزرگ‌نمایی کن.<br>کادر بیرونی = کاور نهایی (حداکثر ${faN(RW)}×${faN(RH)})، خط‌چین = کوچک‌ترین اندازه‌ی مجاز (${faN(MINW)}×${faN(MINH)}).</div>
      <input type="range" class="x-cc-zoom" min="0" max="100" value="0"><div class="x-cc-size" id="x-cc-size"></div></div>`;
  const st = $('.x-cc-stage', ov), im = $('img', st), zoom = $('.x-cc-zoom', ov), sizeEl = $('#x-cc-size', ov);
  const clamp = () => { rw = Math.max(MINW, Math.min(maxR, rw)); const rh = rw * RH / RW; cx = Math.max(rw / 2, Math.min(nw - rw / 2, cx)); cy = Math.max(rh / 2, Math.min(nh - rh / 2, cy)); };
  const draw = () => {
    clamp(); const sc = Wf / rw;
    im.style.width = nw * sc + 'px'; im.style.height = nh * sc + 'px'; im.style.left = (Wf / 2 - cx * sc) + 'px'; im.style.top = (Hf / 2 - cy * sc) + 'px';
    zoom.value = Math.round((maxR - rw) / (maxR - MINW || 1) * 100);
    const ow = Math.min(RW, Math.round(rw)), oh = Math.round(ow * RH / RW);
    sizeEl.textContent = `اندازه‌ی کاور: ${faN(ow)}×${faN(oh)} پیکسل` + (rw < RW ? ' (اندازه‌ی واقعی عکس)' : '');
  };
  draw();
  const ptrs = new Map(); let pinch0 = 0, rw0 = 0;
  st.addEventListener('pointerdown', e => { st.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); rw0 = rw; } });
  st.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch0) rw = rw0 * (pinch0 / d); }
    else { const sc = Wf / rw; cx -= (e.clientX - prev[0]) / sc; cy -= (e.clientY - prev[1]) / sc; }
    draw();
  });
  ['pointerup', 'pointercancel'].forEach(ev => st.addEventListener(ev, e => { ptrs.delete(e.pointerId); pinch0 = 0; }));
  st.addEventListener('wheel', e => { e.preventDefault(); rw *= e.deltaY > 0 ? 1.06 : .94; draw(); }, { passive: false });
  zoom.addEventListener('input', () => { rw = maxR - (zoom.value / 100) * (maxR - MINW); draw(); });
  ov.addEventListener('click', e => {
    const k = e.target.closest('[data-k]')?.dataset.k; if (!k) return;
    if (k === 'x') { ov.remove(); return; }
    clamp(); const rh = rw * RH / RW, ow = Math.min(RW, Math.round(rw)), oh = Math.round(ow * RH / RW);
    const cv = document.createElement('canvas'); cv.width = ow; cv.height = oh;
    cv.getContext('2d').drawImage(img, cx - rw / 2, cy - rh / 2, rw, rh, 0, 0, ow, oh);
    ent.coverPhoto = cv.toDataURL('image/jpeg', .86); ent.coverGrad = null;
    save(); ov.remove(); coverRefresh(ent); toast('کاور ذخیره شد', 'success');
  });
}
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function avatarPalette(acc) {
  const av = acc.avatar || {};
  if (av.type === 'image' && av.value) {
    try {
      const im = await loadImg(av.value), cv = document.createElement('canvas'); cv.width = cv.height = 40;
      const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0, 40, 40);
      const d = cx.getImageData(0, 0, 40, 40).data, bk = {};
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2]; if (d[i + 3] < 200) continue;
        if (Math.max(r, g, b) < 30 || Math.min(r, g, b) > 232) continue;
        const k = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5), o = bk[k] || (bk[k] = { n: 0, r: 0, g: 0, b: 0 }); o.n++; o.r += r; o.g += g; o.b += b;
      }
      const list = Object.values(bk).sort((p, q) => q.n - p.n).map(o => [Math.round(o.r / o.n), Math.round(o.g / o.n), Math.round(o.b / o.n)]);
      const pick = [];
      list.forEach(c => { if (pick.length < 4 && pick.every(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) > 70)) pick.push(c); });
      if (pick.length) return pick.map(c => rgb2hex(...c));
    } catch {}
  }
  if (av.type === 'gradient') { const g = AV_GRADS[(av.value || 0) % AV_GRADS.length]; return [g[0], g[1]]; }
  return nameColors(acc.name || '');
}
function comboGrads(P) {
  const L = h => mixHex(h, '#ffffff', .38), D = h => mixHex(h, '#000000', .38);
  const a = P[0], b = P[1] || D(P[0]), c = P[2] || L(P[0]), d = P[3] || D(b);
  const sets = [[a, b], [b, c], [a, c], [L(a), D(b)], [D(a), L(b)], [a, b, c], [c, a, d], [L(c), D(d)]];
  return [...new Set(sets.map(cs => `linear-gradient(135deg,${cs.join(',')})`))];
}
async function coverGradSheet(ent = state.me) {
  const me = ent, pal = await avatarPalette(me), mine = comboGrads(pal);
  let cur = me.coverGrad || mine[0], c1 = pal[0] || '#4aa3e8', c2 = pal[1] || '#8b5cf6', ang = 135;
  const sw = g => `<i data-g="${esc(g)}" style="background:${g}"></i>`;
  openSheet(`<div class="sheet-title">گرادینت کاور</div>
    <div class="x-cvprev" id="x-gp" style="background:${cur}"></div>
    <div class="fx-sec">پیشنهاد از رنگ‌های عکس پروفایل تو</div><div class="x-gsw">${mine.map(sw).join('')}</div>
    <div class="fx-sec">گرادینت‌های آماده</div><div class="x-gsw">${SQ_BGS.map(sw).join('')}</div>
    <div class="fx-sec">ساخت دلخواه</div>
    <div class="x-gcus"><label><input type="color" id="x-c1" value="${c1}"><span>رنگ اول</span></label><label><input type="color" id="x-c2" value="${c2}"><span>رنگ دوم</span></label>
      <div class="ang">${[135, 90, 180, 45].map(a => `<button data-a="${a}" class="${a === 135 ? 'on' : ''}">${faN(a)}°</button>`).join('')}</div></div>
    <button class="x-pub" id="x-gsave" style="margin:10px 16px 16px;width:calc(100% - 32px);background:linear-gradient(135deg,#52d17c,#3a93e8);color:#fff">ذخیره‌ی گرادینت</button>`);
  const sh = $('#sheet-content'); if (sh) sh.classList.add('x-glass');
  const show = g => { cur = g; $('#x-gp').style.background = g; };
  const custom = () => show(`linear-gradient(${ang}deg,${$('#x-c1').value},${$('#x-c2').value})`);
  $$('#sheet-content .x-gsw i').forEach(i => i.addEventListener('click', () => show(i.dataset.g)));
  $('#x-c1').addEventListener('input', custom); $('#x-c2').addEventListener('input', custom);
  $$('#sheet-content .ang button').forEach(b => b.addEventListener('click', () => { ang = +b.dataset.a; $$('#sheet-content .ang button').forEach(x => x.classList.toggle('on', x === b)); custom(); }));
  $('#x-gsave').addEventListener('click', () => { me.coverGrad = cur; me.coverPhoto = null; save(); closeSheet(); coverRefresh(me); toast('کاور ذخیره شد', 'success'); });
}


/* ============ نشان «کاربر ویژه» (جدا از تیک‌های تایید) ============ */
function migrateVip() { [state.me, ...(state.accounts || [])].forEach(a => { if (a && a.badgeType === 'vip') { a.vip = true; a.badgeType = null; } }); }
migrateVip();
const chatEntVip = c => !!(c && c.type === 'private' && (c.vip || isVipAcc(accOfEntity(c))));
function addVip(el, on) {
  if (!el) return;
  const cur = el.querySelector(':scope > img.vipgold');
  if (on && !cur) el.insertAdjacentHTML('beforeend', vipImg());
  else if (!on && cur) cur.remove();
}
function decorateVip() {
  try {
    migrateVip();
    { const mp = new Map(state.chats.map(c => [c.id, c])); $$('#chat-list .chat-item').forEach(it => { addVip($('.ci-name', it), chatEntVip(mp.get(it.dataset.id))); }); }
    const ac = getChat(activeChatId); if (ac) addVip($('.chat-hdr-name'), chatEntVip(ac));
    const ic = getChat(infoChatId); if (ic) addVip($('#info-body .info-name'), chatEntVip(ic));
    addVip($('#settings-body .profile-card .pn'), isVipAcc(state.me));
  } catch (e) { console.error(e); }
}
['renderChatList', 'renderChatHeader', 'renderInfo'].forEach(n => wrap(n, o => function () { const r = o.apply(this, arguments); decorateVip(); return r; }));
wrap('openProfilePreview', o => function (u) {
  const r = o.apply(this, arguments);
  try { const f = findByUsername(u); if (f && f.entity) addVip($('#profile-body .info-name'), !!(f.entity.vip || isVipAcc(accOfEntity(f.entity)))); } catch {}
  return r;
});

// نشان «کاربر ویژه» همان لحظه‌ی اول هم مثل تیک‌ها نشان داده شود.
// (قبلاً اولین رندر لیست چت‌ها قبل از لود شدن extras.js انجام می‌شد و نشان تا رندر بعدی/باز شدن پروفایل نمی‌آمد)
decorateVip();
(function vipAlways() {
  let q = false;
  const run = () => { q = false; decorateVip(); };
  const mo = new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } });
  ['#chat-list', '#info-body', '#settings-body'].forEach(sel => { const el = $(sel); if (el) mo.observe(el, { childList: true, subtree: true }); });
  document.addEventListener('DOMContentLoaded', decorateVip);
  addEventListener('load', decorateVip);
})();

/* ============ پیام‌های ذخیره‌شده: از پنل/تنظیمات باز می‌شود، بدون «آخرین بازدید» ============ */
function openSaved() {
  let c = state.chats.find(x => x.type === 'saved');
  if (!c) { createChat({ name: 'پیام‌های ذخیره‌شده', type: 'saved' }); c = state.chats.find(x => x.type === 'saved'); }
  if (c) { switchTab('chats'); if (activeChatId !== c.id) openChat(c.id); }
}
wrap('chatStatus', o => function (c) { if (c && c.type === 'saved') return ''; return o.apply(this, arguments); });
if (chatFilter === 'saved') chatFilter = 'all';

/* ============ تنظیمات: دسته‌بندی مثل تلگرام ============ */
Object.assign(DSVG, {
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r="1.1"/><circle cx="12" cy="7.8" r="1.1"/><circle cx="15.6" cy="10.5" r="1.1"/><path d="M12 21c-1.6 0-2.1-1.3-1.4-2.4.5-.9 0-1.6-.9-1.6H8"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.2"/>'
});
let setCat = null;
const SET_CATS = [
  { id: 'acc', t: 'حساب کاربری', ic: 'user', col: '#ef5350', titles: ['حساب کاربری', 'مدیریت اکانت‌ها'] },
  { id: 'priv', t: 'حریم خصوصی و امنیت', ic: 'lock', col: '#8e8e93', titles: ['مدیریت', 'حریم خصوصی و امنیت'] },
  { id: 'beh', t: 'اعلان‌ها و رفتار', ic: 'bell', col: '#ff6b6b', titles: ['رفتار'] },
  { id: 'look', t: 'ظاهر و شخصی‌سازی', ic: 'palette', col: '#38bdf8', titles: ['شخصی‌سازی', 'ظاهر و برنامه'] },
  { id: 'ai', t: 'هوش مصنوعی', ic: 'spark', col: '#7c8cf8', titles: ['هوش مصنوعی'] },
  { id: 'data', t: 'داده و پشتیبان‌گیری', ic: 'db', col: '#34c759', titles: ['پشتیبان‌گیری'] }
];
function regroupSettings() {
  const body = $('#settings-body'); if (!body || body.dataset.xg === 'busy') return;
  const kids = [...body.children]; if (!kids.length || !kids[0].classList.contains('profile-card')) return;
  const profile = kids[0]; let footer = null, cur = null, lastTitle = '';
  const secs = [];
  kids.slice(1).forEach(n => {
    if (n.classList.contains('empty')) { footer = n; return; }
    if (n.classList.contains('section-title')) { const t = n.textContent.trim(); if (t === lastTitle && cur) { n.remove(); return; } lastTitle = t; cur = { t, title: n, nodes: [] }; secs.push(cur); return; }
    if (!cur) { cur = { t: '', title: null, nodes: [] }; secs.push(cur); }
    cur.nodes.push(n);
  });
  const cats = SET_CATS.map(c => Object.assign({ sections: [] }, c));
  secs.forEach(sec => { let c = cats.find(x => x.titles.includes(sec.t)); if (!c) { c = cats.find(x => x.id === 'more') || (cats.push({ id: 'more', t: 'بیشتر', ic: 'info', col: '#a78bfa', titles: [], sections: [] }), cats[cats.length - 1]); } c.sections.push(sec); });
  const used = cats.filter(c => c.sections.some(s => s.nodes.some(n => n.textContent.trim() || n.querySelector('.row'))));
  const frag = document.createDocumentFragment();
  if (setCat && used.find(c => c.id === setCat)) {
    const c = used.find(x => x.id === setCat);
    const multi = c.sections.filter(s => s.title).length > 1;
    c.sections.forEach(sec => { if (multi && sec.title) frag.appendChild(sec.title); sec.nodes.forEach(n => frag.appendChild(n)); });
  } else {
    setCat = null;
    frag.appendChild(profile);
    const row = (k, ic, col, t, v) => `<div class="row x-catrow" data-xcat="${k}"><span class="x-cri" style="background:${col}">${dsvg(ic, '#fff', 20)}</span><span class="r-text">${t}</span>${v ? `<span class="r-val">${v}</span>` : ''}<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg></span></div>`;
    const g1 = document.createElement('div'); g1.className = 'group x-catgrp';
    g1.innerHTML = row('saved', 'bookmark', '#3b82f6', 'پیام‌های ذخیره‌شده') + row('contacts', 'users', '#8b5cf6', 'مخاطبین') + row('mystory', 'story', '#ec6aa8', 'استوری‌های من', faN(liveStories(state.me).length));
    frag.appendChild(g1);
    const mk = ids => { const g = document.createElement('div'); g.className = 'group x-catgrp'; g.innerHTML = ids.map(id => { const c = used.find(x => x.id === id); return c ? row(c.id, c.ic, c.col, c.t) : ''; }).join(''); return g.innerHTML.trim() ? g : null; };
    [mk(['acc', 'priv', 'beh']), mk(['look', 'ai']), mk(['data', ...used.filter(c => !SET_CATS.find(x => x.id === c.id)).map(c => c.id)])].forEach(g => g && frag.appendChild(g));
    if (footer) frag.appendChild(footer);
  }
  body.dataset.xg = 'busy'; body.innerHTML = ''; body.appendChild(frag); delete body.dataset.xg;
  body.classList.toggle('x-subpage', !!setCat);
  { const bt = $('#list-title .brand-text'); if (bt) bt.textContent = setCat ? (used.find(x => x.id === setCat) || {}).t || 'تنظیمات' : 'تنظیمات'; }
  body.scrollTop = 0;
}
wrap('renderSettings', o => function () { const r = o.apply(this, arguments); try { regroupSettings(); decorateVip(); } catch (e) { console.error(e); } return r; });
wrap('switchTab', o => function (tab) { if (tab !== 'settings') setCat = null; const r = o.apply(this, arguments); try { renderStories(); } catch {} return r; });
$('#settings-body').addEventListener('click', e => {
  const c = e.target.closest('[data-xcat]'), b = e.target.closest('[data-xback]');
  if (b) { setCat = null; renderSettings(); return; }
  if (!c) return;
  const k = c.dataset.xcat;
  if (k === 'saved') openSaved();
  else if (k === 'contacts') { try { switchTab('contacts'); } catch { toast('بخش مخاطبین در دسترس نیست', 'info'); } }
  else if (k === 'mystory') myStorySheet();
  else { setCat = k; renderSettings(); }
}, true);

/* ============ نوتیفیکیشن مدرن: بنر پیام‌های ورودی ============ */
let bnTimer = null;
function showBanner(chat, text) {
  let b = $('#x-banner'); if (!b) { b = document.createElement('div'); b.id = 'x-banner'; document.body.appendChild(b); }
  b.innerHTML = `<span class="av">${avatarHTML(chat, 40)}</span><div class="tx"><b>${esc(chat.name)}${chat.badgeType ? vfHTML(chat.badgeType, 14) : ''}</b><span>${esc(String(text || '').slice(0, 90))}</span></div><i>${faN(new Date().getHours())}:${String(new Date().getMinutes()).padStart(2, '0')}</i>`;
  b.onclick = () => { b.classList.remove('show'); if (getChat(chat.id)) { switchTab('chats'); openChat(chat.id); } };
  requestAnimationFrame(() => b.classList.add('show'));
  clearTimeout(bnTimer); bnTimer = setTimeout(() => b.classList.remove('show'), 4200);
}
wrap('notifyIncoming', o => function (chat, text) {
  try { if (S().notifications !== false && chat && !chat.muted && !(document.visibilityState === 'visible' && activeChatId === chat.id && $('#screen-chat').classList.contains('open'))) showBanner(chat, text); } catch {}
  return o.apply(this, arguments);
});


function chatCoverSheet(c) {
  const has = !!(c.coverPhoto || c.coverGrad);
  openSheet(`<div class="sheet-title">کاور ${c.type === 'channel' ? 'کانال' : 'گروه'}</div>
    <div class="x-cvprev" style="background:${c.coverGrad && !c.coverPhoto ? c.coverGrad : ''}">${c.coverPhoto ? `<img src="${esc(c.coverPhoto)}" alt="">` : (c.coverGrad ? '' : '<span>کاوری تنظیم نشده</span>')}</div>
    <div class="sheet-item" data-xcc="photo">${IC('image', '🖼')}انتخاب عکس برای کاور<small style="margin-right:auto;color:var(--text-3)">تا ۱۰۸۰×۳۸۰</small></div>
    <div class="sheet-item" data-xcc="grad">${IC('palette', '🎨')}گرادینت کاور (پیشنهادی از رنگ عکس)</div>
    ${has ? `<div class="sheet-item danger" data-xcc="rm">${IC('trash', '🗑')}حذف کاور</div>` : ''}`);
  const sh = $('#sheet-content'); if (sh) sh.classList.add('x-glass');
  $$('#sheet-content [data-xcc]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.xcc; closeSheet();
    setTimeout(() => { if (k === 'photo') coverPick(c); else if (k === 'grad') coverGradSheet(c); else { c.coverPhoto = null; c.coverGrad = null; save(); coverRefresh(c); toast('کاور حذف شد', 'success'); } }, 160);
  }));
}
document.addEventListener('click', e => {
  const el = e.target.closest('#info-body [data-info-act="edit-cover"], #info-body .info-cover');
  if (!el) return;
  const c = getChat(infoChatId); if (!isGC(c)) return;
  e.stopPropagation(); e.preventDefault();
  if (canSetGcCover(c)) { chatCoverSheet(c); return; }
  if (canEditInfo(c)) toast('فقط مالکِ کاربر ویژه می‌تواند برای ' + (c.type === 'channel' ? 'کانال' : 'گروه') + ' کاور بگذارد', 'info');
}, true);


/* ============ نوشته‌ی «گپ» دقیقاً وسط باکس بالا ============ */
function centerTitle() {
  const t = $('#screen-list .main-hdr #list-title .brand-text'), h = $('#screen-list .main-hdr'); if (!t || !h) return;
  t.style.display = 'inline-block'; t.style.transform = '';
  const hr = h.getBoundingClientRect(), tr = t.getBoundingClientRect(); if (!hr.width || !tr.width) return;
  const d = (hr.left + hr.width / 2) - (tr.left + tr.width / 2);
  t.style.transform = Math.abs(d) > .4 ? `translateX(${d.toFixed(1)}px)` : '';
}
{
  let q = false; const run = () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; centerTitle(); }); };
  const lt = $('#list-title'); if (lt) new MutationObserver(m => { if (m.some(x => x.target && x.target.closest && !x.target.closest('.x-pill-st'))) run(); }).observe(lt, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', run); run();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  wrap('renderChatList', o => function () { const r = o.apply(this, arguments); run(); return r; });
  wrap('renderSettings', o => function () { const r = o.apply(this, arguments); run(); return r; });
}

console.log('extras.js loaded');
})();

/* ============ توضیح نشان‌ها: با زدن روی هر تیک/نشان، باکس معرفی آن باز می‌شود ============ */
(function badgeInfoPopup() {
  // متن توضیحات را از همین‌جا می‌توانی عوض کنی (کلید = عنوان نشان)
  const BADGE_INFO = {
    'نشان افراد سرشناس': 'این نشان به افراد سرشناس و شناخته‌شده مثل هنرمندان، ورزشکاران، نویسندگان و چهره‌های رسانه‌ای و اثرگذار داده می‌شود که هویت‌شان تایید شده است.',
    'نشان سازمانی': 'این نشان برای سازمان‌ها، نهادها و مجموعه‌های رسمی مثل شرکت‌ها، رسانه‌ها، دانشگاه‌ها و ارگان‌ها است که اصالت حساب‌شان تایید شده است.',
    'نشان تجاری': 'این نشان به کسب‌وکارها، فروشگاه‌ها و برندهای تجاری تایید‌شده تعلق می‌گیرد تا کاربران مطمئن باشند با حساب اصلی و معتبر آن برند در ارتباط‌اند.',
    'نشان شخصی': 'این نشان برای حساب‌های شخصی تایید‌شده است؛ یعنی کاربرانی که هویت‌شان بررسی و تایید شده، حتی اگر چهره‌ی سرشناسی نباشند.',
    'کاربر ویژه': 'این نشان مخصوص کاربران ویژه‌ی گپ است. کاربران ویژه به امکانات اختصاصی مثل گذاشتن کاور روی پروفایل دسترسی دارند (و مالک ویژه‌ی گروه یا کانال می‌تواند برای آن کاور بگذارد).'
  };
  let box = null;
  function close() { if (box) { box.remove(); box = null; } }
  function open(img, title) {
    close();
    box = document.createElement('div');
    box.className = 'x-binfo';
    box.innerHTML = '<div class="x-binfo-card" role="dialog" aria-modal="true">' +
      '<img class="x-binfo-ic" alt="">' +
      '<div class="x-binfo-t"></div><div class="x-binfo-d"></div>' +
      '<button type="button" class="x-binfo-ok">متوجه شدم</button></div>';
    box.querySelector('.x-binfo-ic').src = img.currentSrc || img.src;
    box.querySelector('.x-binfo-t').textContent = title;
    box.querySelector('.x-binfo-d').textContent = BADGE_INFO[title];
    box.addEventListener('click', e => { if (e.target === box || e.target.closest('.x-binfo-ok')) close(); });
    document.body.appendChild(box);
  }
  document.addEventListener('click', e => {
    const img = e.target && e.target.closest ? e.target.closest('img.vf') : null;
    if (!img || img.closest('.sheet-item')) return;      // داخل لیست انتخاب نشان، فقط انتخاب انجام شود
    const title = (img.getAttribute('alt') || img.getAttribute('title') || '').trim();
    if (!BADGE_INFO[title]) return;
    e.preventDefault(); e.stopPropagation();
    open(img, title);
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ============================================================
// features.js — قابلیت‌های جدید گپ (بعد از script.js و auth.js لود می‌شود)
//  ۱) بلاک، گزارش، کلمات میوت‌شده، حساب خصوصی (با درخواست پیام)
//  ۲) نقش‌ها (مدیر / کاربر) و پنل مدیریت
//  ۳) تم خودکار (سیستم / روشن / تیره)
//  ۴) اعلان‌های جداگانه برای هر اکانت (زنگوله‌ی بالای صفحه)
//  ۵) هشتگ‌ها و ترندها (تب «کشف»)
//  ۶) کاور پروفایل: نمایش کامل عکس بدون برش (مثل ویراستی)
//  ۷) هدرِ بالای هر بخش یک پنلِ گرد و ۵۰٪ شفاف هم‌اندازه؛ منوی دسته‌بندی ۱ پیکسل زیرش؛ نوار پایین چت (ویس/پیام/نظرسنجی/…) در یک باکس؛ منوها ۵۰٪ شفاف
// این فایل script.js را تغییر نمی‌دهد؛ فقط توابع آن را دور می‌زند (wrap می‌کند).
// ============================================================
(() => {
'use strict';

/* ---------- ابزارها ---------- */
const accounts = () => [state.me, ...(state.accounts || [])].filter(Boolean);
const M = () => { normAcc(state.me); return state.me; };   // اکانت فعال (همیشه نرمال‌شده، حتی بعد از «پاک کردن همه»)
const isAdmin = () => M().role === 'admin';
const FX = () => (state.fx = Object.assign({ reports: [] }, state.fx || {}));
const keyOf = c => c ? (c.username ? 'u:' + normUser(c.username) : 'n:' + (c.name || '')) : '';
const labelOf = k => k.startsWith('u:') ? '@' + k.slice(2) : k.slice(2);
const ago = ts => { try { return fmtListTime(ts); } catch { return ''; } };
const nowDay = 24 * 60 * 60 * 1000;
const faNum = n => Number(n).toLocaleString('fa-IR');
const resolveAccount = ref => ref && accounts().find(a => (ref.username && a.username && normUser(a.username) === normUser(ref.username)) || (!ref.username && !a.username && a.name === ref.name));

/* ---------- نرمال‌سازی داده‌ی اکانت‌ها (نسخه‌ی قدیمی هم کار می‌کند) ---------- */
function normAcc(a) {
    if (!a) return;
    if (!Array.isArray(a.blocked)) a.blocked = [];
    if (!Array.isArray(a.mutedWords)) a.mutedWords = [];
    if (!Array.isArray(a.approved)) a.approved = [];
    if (!Array.isArray(a.requests)) a.requests = [];
    if (!Array.isArray(a.notifs)) a.notifs = [];
    if (typeof a.isPrivate !== 'boolean') a.isPrivate = false;
    if (!a.role) a.role = 'admin';          // اکانت‌های قبلی مدیر حساب می‌شوند
}
// بعد از «پاک کردن همه داده‌ها» گپ state تازه می‌سازد و میان‌برهای state.chats / contacts / directory را از دست می‌دهد؛ اینجا برمی‌گردانیم
function ensureAliases() {
    if (Object.getOwnPropertyDescriptor(state, 'chats')) return;
    Object.defineProperty(state, 'chats', { get() { return this.me.chats || (this.me.chats = []); }, set(v) { this.me.chats = v; }, configurable: true });
    Object.defineProperty(state, 'contacts', { get() { return this.me.contacts || (this.me.contacts = []); }, set(v) { this.me.contacts = v; }, configurable: true });
    Object.defineProperty(state, 'directory', { get() { return this._globalDirectory || (this._globalDirectory = []); }, set(v) { this._globalDirectory = v; }, configurable: true });
}
const normAll = () => { ensureAliases(); accounts().forEach(normAcc); FX(); if (state.themeMode !== 'auto' && state.themeMode !== 'light' && state.themeMode !== 'dark') state.themeMode = state.theme === 'light' ? 'light' : 'dark'; };
normAll();

/* ---------- استایل ---------- */
const css = document.createElement('style');
css.textContent = `
.fx-badge{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--red);color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;box-sizing:border-box;line-height:1}
.fx-bell{position:relative}
.fx-hint{font-size:12px;color:var(--text-3);padding:2px 22px 10px;line-height:1.8}
.fx-sec{font-size:13px;font-weight:700;color:var(--text-2);padding:14px 22px 6px}
.fx-row{display:flex;align-items:center;gap:10px;padding:10px 22px;font-size:14.5px}
.fx-row .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fx-row .t small{display:block;color:var(--text-3);font-size:12px;white-space:normal}
.fx-btn{border:none;border-radius:12px;padding:8px 14px;font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;background:var(--surface-3);color:var(--text)}
.fx-btn.red{background:rgba(239,68,68,.14);color:var(--red)}
.fx-btn.on{background:var(--accent);color:#fff}
.fx-btn:active{opacity:.7}
.fx-empty{text-align:center;color:var(--text-3);font-size:13px;padding:14px 22px}
.fx-add{display:flex;gap:8px;padding:6px 22px 12px}
.fx-add input{flex:1;min-width:0;background:var(--surface-2);border:1px solid var(--line-2);border-radius:12px;padding:10px 12px;color:var(--text);font-family:inherit;font-size:14px;outline:none}
.fx-card{margin:6px 14px;padding:12px 14px;border-radius:14px;background:var(--surface-2);border:1px solid var(--line)}
.fx-card .h{font-size:14px;font-weight:600}
.fx-card .s{font-size:12.5px;color:var(--text-3);margin-top:3px;line-height:1.7;word-break:break-word}
.fx-card .a{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.fx-n{display:flex;gap:12px;align-items:flex-start;padding:12px 18px;border-bottom:1px solid var(--line);cursor:pointer}
.fx-n.un{background:var(--surface-2)}
.fx-n .ic{width:36px;height:36px;border-radius:50%;background:var(--surface-3);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fx-n .ic svg{fill:currentColor}
.fx-n .b{flex:1;min-width:0}
.fx-n .x{font-size:14px;line-height:1.7;word-break:break-word}
.fx-n .m{font-size:11.5px;color:var(--text-3);margin-top:2px}
.fx-seg{display:flex;gap:4px;background:var(--surface-2);border-radius:12px;padding:3px}
.fx-seg button{border:none;background:transparent;color:var(--text-2);font-family:inherit;font-size:13px;font-weight:600;padding:7px 12px;border-radius:9px;cursor:pointer}
.fx-seg button.on{background:var(--accent);color:#fff}
.fx-tags{display:flex;gap:8px;overflow-x:auto;padding:10px 14px 4px;scrollbar-width:none}
.fx-tags::-webkit-scrollbar{display:none}
.fx-tag{flex-shrink:0;border:1px solid var(--line-3);background:var(--surface-2);border-radius:14px;padding:8px 12px;cursor:pointer;direction:rtl}
.fx-tag b{display:block;font-size:14px;color:var(--text)}
.fx-tag small{font-size:11.5px;color:var(--text-3)}
.fx-tag:active{background:var(--surface-3)}
.hashtag-link{color:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.msg.fx-mw .btext{filter:blur(7px);cursor:pointer;user-select:none}
.msg.fx-mw::after{content:'محتوا مخفی شد (کلمه‌ی میوت‌شده) · برای نمایش بزنید';display:block;font-size:11px;opacity:.7;margin-top:4px}
.fx-switch-row{cursor:default}
`;
document.head.appendChild(css);

/* ============================================================
   ۱) بلاک، گزارش، کلمات میوت‌شده
   ============================================================ */
const isBlocked = c => !!c && c.type === 'private' && M().blocked.includes(keyOf(c));
const hitMuted = text => { const t = String(text || '').toLowerCase(); return !!t && M().mutedWords.some(w => w && t.includes(String(w).toLowerCase())); };

function toggleBlock(c) {
    const k = keyOf(c), a = M(), i = a.blocked.indexOf(k);
    if (i > -1) { a.blocked.splice(i, 1); toast('بلاک برداشته شد', 'info'); }
    else {
        a.blocked.push(k); c.unread = 0;
        toast(`«${c.name}» بلاک شد`, 'success');
    }
    save();
    renderChatList();
    if (activeChatId === c.id) { applyComposerLock(c); renderChatHeader(); }
    if ($('#screen-info').classList.contains('open')) renderInfo();
}

const REPORT_REASONS = ['اسپم یا تبلیغات', 'توهین یا آزار', 'محتوای نامناسب', 'اطلاعات نادرست', 'سایر'];
function reportChat(c) {
    openSheet(`<div class="sheet-title">گزارش «${esc(c.name)}»</div>` +
        REPORT_REASONS.map((r, i) => `<div class="sheet-item" data-fxrep="${i}">${icon('alert')}${esc(r)}</div>`).join(''));
    $$('#sheet-content [data-fxrep]').forEach(el => el.addEventListener('click', () => {
        const reason = REPORT_REASONS[+el.dataset.fxrep];
        const last = (c.messages || []).filter(m => !m.out && m.type === 'text' && m.text && !m.deleted).slice(-1)[0];
        FX().reports.unshift({ id: rid(), name: c.name, username: c.username || '', chatType: c.type, reason, preview: last ? String(last.text).slice(0, 80) : '', by: state.me.username || state.me.name, ts: Date.now(), open: true });
        accounts().filter(a => a.role === 'admin').forEach(a => pushNotif(a, 'report', `گزارش جدید: «${c.name}» — ${reason}`, { t: 'admin' }));
        save(); closeSheet(); toast('گزارش ثبت شد. ممنون', 'success');
    }));
}

/* مدیریت بلاک‌ها، چت‌های بی‌صدا و کلمات میوت‌شده */
function blocksSheet() {
    const a = M();
    const muted = (state.chats || []).filter(c => c.muted && c.type !== 'saved' && c.type !== 'ai');
    const row = (label, act, id) => `<div class="fx-row"><span class="t">${esc(label)}</span><button class="fx-btn red" data-fxb="${act}" data-id="${esc(id)}">حذف</button></div>`;
    openSheet(`<div class="sheet-title">بلاک‌ها و میوت‌ها</div>
        <div class="fx-sec">بلاک‌شده‌ها</div>${a.blocked.map(k => row(labelOf(k), 'unblock', k)).join('') || '<div class="fx-empty">خالی</div>'}
        <div class="fx-sec">چت‌های بی‌صدا</div>${muted.map(c => row(c.name, 'unmute', c.id)).join('') || '<div class="fx-empty">خالی</div>'}
        <div class="fx-sec">کلمات میوت‌شده</div><div class="fx-hint">پیام‌های دریافتی که این کلمه‌ها را داشته باشند محو می‌شوند و نوتیفیکیشن نمی‌دهند.</div>
        ${a.mutedWords.map(w => row(w, 'word', w)).join('') || '<div class="fx-empty">خالی</div>'}
        <div class="fx-add"><input id="fx-word" placeholder="کلمه‌ی جدید…"><button class="fx-btn on" data-fxb="addword">افزودن</button></div>`);
    $$('#sheet-content [data-fxb]').forEach(b => b.addEventListener('click', () => {
        const act = b.dataset.fxb, id = b.dataset.id;
        if (act === 'unblock') a.blocked = a.blocked.filter(x => x !== id);
        if (act === 'unmute') { const c = getChat(id); if (c) c.muted = false; }
        if (act === 'word') a.mutedWords = a.mutedWords.filter(x => x !== id);
        if (act === 'addword') { const v = ($('#fx-word').value || '').trim(); if (!v) return; if (!a.mutedWords.includes(v)) a.mutedWords.push(v); }
        save(); renderChatList(); renderMessages(false); blocksSheet();
    }));
}

/* قفل نوشتن در چت بلاک‌شده (همان قفلی که اخطاردهنده دارد) */
{
    const orig = applyComposerLock;
    applyComposerLock = function (c) {
        orig.apply(this, arguments);
        const composer = $('#composer'), inp = $('#msg-input'), msgEl = composer && $('.composer-blocked-msg', composer);
        if (!composer || !inp) return;
        const blocked = isBlocked(c);
        if (msgEl && !msgEl.dataset.def) msgEl.dataset.def = msgEl.textContent;
        if (blocked) {
            composer.classList.add('warner-blocked'); inp.disabled = true; inp.value = '';
            inp.placeholder = 'این کاربر را بلاک کرده‌اید';
            if (msgEl) msgEl.textContent = 'این کاربر را بلاک کرده‌اید. برای ارسال پیام، رفع بلاک کنید.';
            ['#btn-send', '#btn-photo', '#btn-file', '#btn-poll', '#btn-emoji'].forEach(id => { const el = $(id); if (el) el.style.display = 'none'; });
            const st = $('#btn-send-text'); if (st) st.classList.remove('show');
            try { hideReplyBar(); } catch {}
        } else if (msgEl && msgEl.dataset.def) msgEl.textContent = msgEl.dataset.def;
    };
}
{
    const orig = sendMessage;
    sendMessage = function (extra, textOverride, chatIdOverride) {
        const c = getChat(chatIdOverride || activeChatId);
        if (isBlocked(c)) { toast('این کاربر را بلاک کرده‌اید', 'error'); return; }
        return orig.apply(this, arguments);
    };
}
{
    const orig = scheduleReply;
    scheduleReply = function (chat) { if (isBlocked(chat)) return; return orig.apply(this, arguments); };
    const origAI = scheduleAIReply;
    scheduleAIReply = function (chat) { if (isBlocked(chat)) return Promise.resolve(); return origAI.apply(this, arguments); };
}
{
    const orig = notifyIncoming;
    notifyIncoming = function (chat, text) { if (isBlocked(chat) || hitMuted(text)) return; return orig.apply(this, arguments); };
}
{
    const orig = previewText;
    previewText = function (c) {
        if (isBlocked(c)) return '🚫 بلاک شده';
        const m = lastMsg(c);
        if (m && !m.out && !m.deleted && m.type === 'text' && hitMuted(m.text)) return '🔇 پیام مخفی‌شده';
        return orig.apply(this, arguments);
    };
}
const revealed = new Set();
{
    const orig = msgHTML;
    msgHTML = function (chat, m) {
        const html = orig.apply(this, arguments);
        if (m && !m.out && !m.deleted && m.type === 'text' && !revealed.has(m.id) && hitMuted(m.text))
            return html.replace(/class="(msg (?:in|out)[^"]*)"/, 'class="$1 fx-mw"');
        return html;
    };
    document.addEventListener('click', e => {
        const el = e.target.closest('.msg.fx-mw'); if (!el) return;
        e.preventDefault(); e.stopPropagation();
        revealed.add(el.dataset.id); el.classList.remove('fx-mw');
    }, true);
}

/* منوی چت (لیست چت‌ها): بلاک و گزارش + مخفی‌کردن ابزار مدیریتی از کاربر عادی */
{
    const orig = showChatMenu;
    showChatMenu = function (id) {
        orig.apply(this, arguments);
        const c = getChat(id), box = $('#sheet-content'); if (!c || !box) return;
        if (!isAdmin()) $$('[data-clact="warn"],[data-clact="set-warner"],[data-clact="ban"]', box).forEach(x => x.remove());
        if (c.type === 'private' || c.type === 'group' || c.type === 'channel') {
            const add = (act, danger, ic, text) => {
                const d = document.createElement('div');
                d.className = 'sheet-item' + (danger ? ' danger' : '');
                d.innerHTML = icon(ic) + text;
                d.addEventListener('click', () => { closeSheet(); setTimeout(() => act(), 140); });
                const del = $('[data-clact="delete"]', box); del ? del.before(d) : box.appendChild(d);
            };
            if (c.type === 'private') add(() => toggleBlock(c), !isBlocked(c), 'ban', isBlocked(c) ? 'رفع بلاک' : 'بلاک کردن');
            add(() => reportChat(c), false, 'alert', 'گزارش');
        }
    };
    const ow = openWarnModal, ob = banUser;
    openWarnModal = function () { if (!isAdmin()) { toast('فقط مدیر می‌تواند اخطار بدهد', 'error'); return; } return ow.apply(this, arguments); };
    banUser = function () { if (!isAdmin()) { toast('فقط مدیر می‌تواند بن کند', 'error'); return; } return ob.apply(this, arguments); };
}

/* صفحه‌ی اطلاعات چت: ردیف بلاک / گزارش */
{
    const orig = renderInfo;
    renderInfo = function () {
        orig.apply(this, arguments);
        const c = getChat(infoChatId), mute = $('#info-body [data-info-act="toggle-mute"]');
        if (!c || !mute || c.type === 'ai' || c.type === 'saved') return;
        const mk = (act, red, ic, text) => {
            const r = document.createElement('div'); r.className = 'row'; r.dataset.fxinfo = act;
            r.innerHTML = `<span class="r-icon" style="${red ? 'background:#e53935' : ''}">${icon(ic, 20)}</span><span class="r-text" style="${red ? 'color:var(--red)' : ''}">${text}</span>`;
            return r;
        };
        if (c.type === 'private') mute.after(mk('block', !isBlocked(c), 'ban', isBlocked(c) ? 'رفع بلاک' : 'بلاک کردن'));
        const anchor = $('#info-body [data-fxinfo="block"]') || mute;
        anchor.after(mk('report', false, 'alert', 'گزارش'));
    };
    document.addEventListener('click', e => {
        const r = e.target.closest('[data-fxinfo]'); if (!r) return;
        const c = getChat(infoChatId); if (!c) return;
        r.dataset.fxinfo === 'block' ? toggleBlock(c) : reportChat(c);
    });
}

/* ============================================================
   ۲) حساب خصوصی (درخواست پیام)
   ============================================================ */
const isApproved = (target, sender) => {
    if (target.approved.includes(keyOf(sender))) return true;
    // کسی که خودِ صاحب حساب قبلاً به او پیام داده یا در مخاطبینش هست، تأییدشده حساب می‌شود
    const k = keyOf(sender);
    if ((target.contacts || []).some(c => keyOf(c) === k)) return true;
    return (target.chats || []).some(c => c.type === 'private' && keyOf(c) === k && (c.messages || []).some(m => m.out && !m.deleted));
};
function deliver(target, from, msgs) {
    const chat = findOrCreatePrivateChatWithEntity(target, { name: from.name, username: from.username || '', avatar: from.avatar, badgeType: from.badgeType || null, coverPhoto: from.coverPhoto || null });
    msgs.forEach(m => { chat.messages.push(Object.assign({}, m, { out: false, status: 'read' })); chat.unread = (chat.unread || 0) + 1; });
    return chat;
}
function handleRequest(target, reqId, ok) {
    const i = target.requests.findIndex(r => r.id === reqId); if (i < 0) return;
    const r = target.requests.splice(i, 1)[0];
    if (ok) {
        target.approved.push(keyOf(r.from));
        deliver(target, r.from, r.msgs);
        toast(`«${r.from.name}» تأیید شد`, 'success');
    } else toast('درخواست رد شد', 'info');
    target.notifs.forEach(n => { if (n.reqId === reqId) { n.done = ok ? 'ok' : 'no'; n.read = true; } });
    save(); renderChatList(); updBadge();
}
{
    const orig = syncMessageToTargetAccount;
    syncMessageToTargetAccount = function (targetUsername, messageData, senderInfo) {
        const t = (state.accounts || []).find(a => normUser(a.username) === normUser(targetUsername));
        if (!t || !senderInfo) return orig.apply(this, arguments);
        normAcc(t);
        if (t.blocked.includes(keyOf(senderInfo))) return;                 // بلاک‌شده: بی‌صدا دور ریخته می‌شود
        if (t.isPrivate && !isApproved(t, senderInfo)) {
            let r = t.requests.find(x => keyOf(x.from) === keyOf(senderInfo));
            if (!r) {
                r = { id: rid(), from: { name: senderInfo.name, username: senderInfo.username || '', avatar: senderInfo.avatar, badgeType: senderInfo.badgeType || null, coverPhoto: senderInfo.coverPhoto || null }, msgs: [], ts: Date.now() };
                t.requests.push(r);
                pushNotif(t, 'request', `«${senderInfo.name}» می‌خواهد به شما پیام بدهد`, null, { reqId: r.id });
            }
            r.msgs.push(Object.assign({}, messageData));
            save(); return;
        }
        const res = orig.apply(this, arguments);
        const txt = messageData.type === 'text' ? stripFmt(messageData.text || '') : (messageData.caption || 'پیوست');
        pushNotif(t, 'dm', `${senderInfo.name}: ${String(txt).slice(0, 60)}`, { t: 'chat', username: senderInfo.username || '', name: senderInfo.name }, { from: keyOf(senderInfo) });
        return res;
    };
}

/* ============================================================
   ۳) تم خودکار
   ============================================================ */
const sysLight = () => !!(window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches);
{
    const orig = applyTheme;
    applyTheme = function () {
        ensureAliases();
        if (state.themeMode === 'auto') state.theme = sysLight() ? 'light' : 'dark';
        else if (state.themeMode === 'light' || state.themeMode === 'dark') state.theme = state.themeMode;
        return orig.apply(this, arguments);
    };
    if (window.matchMedia) {
        const mq = matchMedia('(prefers-color-scheme: light)');
        const on = () => { if (state.themeMode === 'auto') { applyTheme(); save(); renderSettings(); } };
        mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener && mq.addListener(on);
    }
}
const MODE_FA = { auto: 'خودکار', light: 'روشن', dark: 'تاریک' };
function themeSheet() {
    openSheet(`<div class="sheet-title">تم برنامه</div>` + ['auto', 'light', 'dark'].map(m =>
        `<div class="sheet-item" data-fxtheme="${m}">${icon(m === 'auto' ? 'palette' : m === 'light' ? 'sun' : 'moon')}${MODE_FA[m]}${state.themeMode === m ? '<span style="margin-right:auto">✓</span>' : ''}</div>`).join(''));
    $$('#sheet-content [data-fxtheme]').forEach(el => el.addEventListener('click', () => {
        state.themeMode = el.dataset.fxtheme; applyTheme(); save(); closeSheet(); renderSettings();
        toast('تم ' + MODE_FA[state.themeMode], 'info');
    }));
}

/* ============================================================
   ۴) اعلان‌های هر اکانت
   ============================================================ */
function pushNotif(acc, type, text, link, extra) {
    normAcc(acc);
    const last = acc.notifs[0];
    // پیام‌های پشت‌سرهم از یک نفر یک اعلان می‌شوند
    if (type === 'dm' && last && last.type === 'dm' && !last.read && extra && last.from === extra.from && Date.now() - last.ts < 5 * 60 * 1000) {
        last.text = text; last.ts = Date.now(); last.count = (last.count || 1) + 1;
    } else acc.notifs.unshift(Object.assign({ id: rid(), type, text, link: link || null, ts: Date.now(), read: false }, extra || {}));
    if (acc.notifs.length > 200) acc.notifs.length = 200;
    save(); updBadge();
}
function updBadge() {
    const b = $('#fx-bell-badge'); if (!b) return;
    const n = M().notifs.filter(x => !x.read).length;
    b.textContent = faNum(n > 99 ? 99 : n); b.style.display = n ? 'flex' : 'none';
}
const NICON = { dm: 'chat-outline', request: 'user', report: 'alert', warn: 'alert', mention: 'user', info: 'bell' };
function notifSheet() {
    const a = M(), list = a.notifs.slice(0, 60);
    const html = list.map(n => {
        let acts = '';
        if (n.type === 'request') acts = n.done ? `<div class="m">${n.done === 'ok' ? 'تأیید شد' : 'رد شد'}</div>`
            : `<div class="fx-card" style="margin:8px 0 0;padding:8px"><div class="a" style="margin:0"><button class="fx-btn on" data-fxn="ok" data-id="${n.reqId}">تأیید</button><button class="fx-btn red" data-fxn="no" data-id="${n.reqId}">رد</button></div></div>`;
        return `<div class="fx-n ${n.read ? '' : 'un'}" data-nid="${n.id}"><div class="ic">${icon(NICON[n.type] || 'bell', 18)}</div><div class="b"><div class="x">${esc(n.text)}${n.count > 1 ? ` <small>(${faNum(n.count)} پیام)</small>` : ''}</div>${acts}<div class="m">${ago(n.ts)}</div></div></div>`;
    }).join('') || '<div class="fx-empty" style="padding:40px 22px">هیچ اعلانی ندارید</div>';
    openSheet(`<div class="sheet-title">اعلان‌ها</div>${html}`);
    a.notifs.forEach(n => { if (n.type !== 'request' || n.done) n.read = true; });
    save(); updBadge();
    $$('#sheet-content [data-fxn]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); handleRequest(M(), b.dataset.id, b.dataset.fxn === 'ok'); notifSheet(); }));
    $$('#sheet-content .fx-n').forEach(el => el.addEventListener('click', e => {
        if (e.target.closest('[data-fxn]')) return;
        const n = a.notifs.find(x => x.id === el.dataset.nid); if (!n || !n.link) return;
        closeSheet();
        setTimeout(() => {
            if (n.link.t === 'admin') { if (isAdmin()) adminPanel(); return; }
            if (n.link.t === 'chat') {
                const c = (state.chats || []).find(x => keyOf(x) === (n.link.username ? 'u:' + normUser(n.link.username) : 'n:' + n.link.name));
                if (c) openChat(c.id);
            }
        }, 140);
    }));
}
{   // دکمه‌ی زنگوله در هدر
    const hdr = $('.main-hdr'), search = $('#btn-search-toggle');
    if (hdr && search) {
        const b = document.createElement('button');
        b.className = 'circle-btn fx-bell'; b.id = 'btn-notifs'; b.setAttribute('aria-label', 'اعلان‌ها');
        b.innerHTML = `${icon('bell', 22)}<span class="fx-badge" id="fx-bell-badge"></span>`;
        b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); notifSheet(); });
        search.before(b);
    }
    const orig = switchTab;
    switchTab = function (tab) { orig.apply(this, arguments); const b = $('#btn-notifs'); if (b) b.style.display = tab === 'chats' ? 'flex' : 'none'; updBadge(); };
    const origAcc = switchAccount;
    switchAccount = function () { const r = origAcc.apply(this, arguments); normAll(); updBadge(); return r; };
}
// اخطارِ رسیده برای این اکانت هم اعلان می‌شود
{
    const orig = renderChatList;
    let seenWarn = new Set();
    const scan = () => accounts().forEach(a => (a.chats || []).forEach(c => (c.messages || []).forEach(m => {
        if (!m.isWarning || seenWarn.has(m.id)) return; seenWarn.add(m.id);
        if (!(a.notifs || []).some(n => n.wid === m.id) && Date.now() - m.ts < 3 * nowDay) pushNotif(a, 'warn', `اخطار از طرف «${m.warnBy || 'مدیر'}»: ${m.warnReason || ''}`, { t: 'chat', name: c.name, username: c.username || '' }, { wid: m.id });
    })));
    let lastScan = 0;
    scan();
    renderChatList = function () { ensureAliases(); if (Date.now() - lastScan > 1500) { lastScan = Date.now(); try { scan(); } catch {} } return orig.apply(this, arguments); };
}

/* ============================================================
   ۵) هشتگ‌ها و ترندها
   ============================================================ */
const TAG_RE = /(^|[\s(،؛:.!؟?])#([\w\u0600-\u06FF\u200c]{2,40})/g;
{
    const orig = renderRichText;
    renderRichText = function () {
        const html = orig.apply(this, arguments);
        // فقط متن بیرون از تگ‌ها و بیرون از <code>/<a>
        let skip = 0;
        return html.split(/(<[^>]+>)/).map(part => {
            if (part[0] === '<') {
                if (/^<(code|a)\b/i.test(part)) skip++; else if (/^<\/(code|a)>/i.test(part)) skip = Math.max(0, skip - 1);
                return part;
            }
            return skip ? part : part.replace(TAG_RE, (m, pre, tag) => `${pre}<a class="hashtag-link" data-tag="${tag}">#${tag}</a>`);
        }).join('');
    };
}
function openTag(tag) {
    const bar = $('#searchbar'), inp = $('#search-input');
    if (!inp) return;
    if ($('#screen-chat').classList.contains('open')) closeChat();
    if ($('#screen-info').classList.contains('open')) closeInfo();
    chatFilter = 'all';
    $$('.tnav-item').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    switchTab('chats');
    if (bar) bar.style.display = 'block';
    inp.value = '#' + tag;
    renderChatList();
    toast('نتایج #' + tag, 'info');
}
const SUGGESTED = ['خبر', 'گپ', 'موسیقی', 'فیلم', 'ورزش', 'سفر', 'کتاب', 'برنامه‌نویسی'];
function trends() {
    const since = Date.now() - 2 * nowDay, map = new Map();
    const chats = [...(state.chats || []), ...(state.directory || [])];
    chats.forEach(c => (c.messages || []).forEach(m => {
        if (m.deleted || m.type === 'warning' || !m.text || m.ts < since) return;
        const heat = 1 + Object.values(m.reactions || {}).reduce((s, v) => s + (Array.isArray(v) ? v.length : +v || 0), 0) * .5 + ((m.comments || []).length) * .5;
        const seen = new Set();
        for (const x of String(m.text).matchAll(/(?:^|[\s(،؛:.!؟?])#([\w\u0600-\u06FF\u200c]{2,40})/g)) {
            const t = x[1]; if (seen.has(t)) continue; seen.add(t);
            const o = map.get(t) || { tag: t, n: 0, score: 0 }; o.n++; o.score += heat; map.set(t, o);
        }
    }));
    let list = [...map.values()].sort((a, b) => b.score - a.score || b.n - a.n).slice(0, 10);
    if (list.length < 5) SUGGESTED.forEach(t => { if (list.length < 8 && !list.some(x => x.tag === t)) list.push({ tag: t, n: 0, score: 0, sug: true }); });
    return list;
}
{
    const orig = renderChatList;
    renderChatList = function () {
        orig.apply(this, arguments);
        if (chatFilter !== 'discover') return;
        const box = $('#chat-list'); if (!box) return;
        const t = trends();
        box.insertAdjacentHTML('afterbegin', `<div class="search-section-title">ترند</div><div class="fx-tags">${t.map(x =>
            `<div class="fx-tag" data-tag="${x.tag}"><b>#${esc(x.tag)}</b><small>${x.sug ? 'پیشنهادی' : faNum(x.n) + ' پیام'}</small></div>`).join('')}</div>`);
    };
}
document.addEventListener('click', e => {
    const el = e.target.closest('[data-tag]'); if (!el) return;
    e.preventDefault(); e.stopPropagation(); openTag(el.dataset.tag);
}, true);

/* ============================================================
   ۶) تنظیمات: حریم خصوصی، تم، مدیریت  +  پنل مدیریت
   ============================================================ */
function adminPanel() {
    if (!isAdmin()) return;
    const rep = FX().reports.filter(r => r.open);
    const warns = [];
    accounts().forEach(a => (a.chats || []).forEach(c => (c.messages || []).forEach(m => { if (m.isWarning) warns.push({ to: a.name, by: m.warnBy, reason: m.warnReason, ts: m.ts }); })));
    warns.sort((x, y) => y.ts - x.ts);
    const card = (h, s, a) => `<div class="fx-card"><div class="h">${h}</div>${s ? `<div class="s">${s}</div>` : ''}${a ? `<div class="a">${a}</div>` : ''}</div>`;
    const html = `<div class="sheet-title">پنل مدیریت</div>
        <div class="fx-sec">گزارش‌های باز (${faNum(rep.length)})</div>
        ${rep.map(r => card(`${esc(r.name)}${r.username ? ` <span dir="ltr">@${esc(r.username)}</span>` : ''} · ${esc(r.reason)}`, `${esc(r.preview)}${r.preview ? '<br>' : ''}گزارش‌دهنده: ${esc(r.by)} · ${ago(r.ts)}`,
            `<button class="fx-btn red" data-fxa="ban" data-id="${r.id}">بن</button><button class="fx-btn" data-fxa="dismiss" data-id="${r.id}">رد گزارش</button>`)).join('') || '<div class="fx-empty">گزارشی نیست</div>'}
        <div class="fx-sec">اکانت‌های بن‌شده</div>
        ${(state.bannedUsers || []).map(b => `<div class="fx-row"><span class="t" dir="ltr">${esc(b)}</span><button class="fx-btn" data-fxa="unban" data-id="${esc(b)}">رفع بن</button></div>`).join('') || '<div class="fx-empty">خالی</div>'}
        <div class="fx-sec">سابقه‌ی اخطارها</div>
        ${warns.slice(0, 15).map(w => card(`${esc(w.to)} ← ${esc(w.by || 'مدیر')}`, `${esc(w.reason || '')}<br>${ago(w.ts)}`)).join('') || '<div class="fx-empty">خالی</div>'}
        <div class="fx-sec">نقش اکانت‌ها</div>
        ${accounts().map((a, i) => `<div class="fx-row"><span class="t">${esc(a.name)}<small dir="ltr">${a.username ? '@' + esc(a.username) : 'بدون آیدی'}${a === state.me ? ' · فعال' : ''}</small></span>
            <div class="fx-seg"><button class="${a.role === 'admin' ? 'on' : ''}" data-fxa="role" data-i="${i}" data-v="admin">مدیر</button><button class="${a.role === 'admin' ? '' : 'on'}" data-fxa="role" data-i="${i}" data-v="user">کاربر</button></div></div>`).join('')}`;
    openSheet(html);
    $$('#sheet-content [data-fxa]').forEach(b => b.addEventListener('click', () => {
        const act = b.dataset.fxa, id = b.dataset.id;
        if (act === 'dismiss') { const r = FX().reports.find(x => x.id === id); if (r) r.open = false; }
        if (act === 'unban') { state.bannedUsers = state.bannedUsers.filter(x => x !== id); toast('بن برداشته شد', 'success'); }
        if (act === 'ban') {
            const r = FX().reports.find(x => x.id === id); if (!r) return;
            const key = r.username || r.name;
            if (!state.bannedUsers.includes(key)) state.bannedUsers.push(key);
            state.chats = state.chats.filter(c => !(r.username ? normUser(c.username) === normUser(r.username) : c.name === r.name));
            state.contacts = state.contacts.filter(c => c.name !== r.name);
            state.accounts = state.accounts.filter(a => !(r.username ? normUser(a.username) === normUser(r.username) : a.name === r.name));
            r.open = false; toast('کاربر بن شد ⛔', 'error');
        }
        if (act === 'role') {
            const a = accounts()[+b.dataset.i], v = b.dataset.v; if (!a) return;
            if (v === 'user' && a.role === 'admin' && accounts().filter(x => x.role === 'admin').length < 2) { toast('حداقل یک مدیر لازم است', 'error'); return; }
            a.role = v;
        }
        save(); renderSettings(); renderChatList(); adminPanel();
    }));
}

{
    const orig = renderSettings;
    renderSettings = function () {
        normAll();
        orig.apply(this, arguments);
        const body = $('#settings-body'); if (!body) return;
        const a = M();
        // ردیف تم: انتخاب سه‌حالته
        const tr = $('[data-act="toggle-theme"]', body);
        if (tr) { tr.dataset.act = 'fx-theme'; const t = $('.r-text', tr); if (t) t.textContent = 'تم: ' + MODE_FA[state.themeMode] + (state.themeMode === 'auto' ? ` (${state.theme === 'light' ? 'روشن' : 'تاریک'})` : ''); }
        // بخش‌های جدید قبل از «ظاهر و برنامه»
        const titles = $$('.section-title', body), anchor = titles.find(x => x.textContent.includes('ظاهر و برنامه'));
        const sw = (checked) => `<label class="switch"><input type="checkbox" id="fx-private" ${checked ? 'checked' : ''}><span class="sl"></span></label>`;
        const sec = document.createElement('div');
        sec.innerHTML = `<div class="section-title">حریم خصوصی و امنیت</div>
            <div class="group">
              <div class="row fx-switch-row"><span class="r-icon" style="background:linear-gradient(180deg,#22c55e,#16a34a)">${icon('lock', 20)}</span><span class="r-text">حساب خصوصی</span>${sw(a.isPrivate)}</div>
              <div class="row" data-act="fx-blocks"><span class="r-icon" style="background:#e53935">${icon('ban', 20)}</span><span class="r-text">بلاک‌ها و میوت‌ها</span><span class="r-val">${faNum(a.blocked.length)}</span><span class="chev">${icon('chevron', 18)}</span></div>
            </div>
            <div class="fx-hint">${a.isPrivate ? 'پیام افراد تأییدنشده به‌صورت «درخواست» می‌آید و بعد از تأیید شما تحویل داده می‌شود.' : 'اگر حساب را خصوصی کنید، فقط کسانی که تأیید کرده‌اید می‌توانند مستقیم پیام بدهند.'}</div>
            <div class="section-title">${isAdmin() ? 'مدیریت' : 'نقش'}</div>
            <div class="group">
              ${isAdmin() ? `<div class="row" data-act="fx-admin"><span class="r-icon" style="background:#f59e0b">${icon('settings-outline', 20)}</span><span class="r-text">پنل مدیریت</span><span class="r-val">${faNum(FX().reports.filter(r => r.open).length)} گزارش</span><span class="chev">${icon('chevron', 18)}</span></div>` : ''}
              <div class="row"><span class="r-icon" style="background:#6c6c6e">${icon('user', 20)}</span><span class="r-text">نقش این اکانت</span><span class="r-val">${isAdmin() ? 'مدیر' : 'کاربر عادی'}</span></div>
            </div>`;
        if (anchor) [...sec.childNodes].reverse().forEach(n => anchor.before(n)); else body.appendChild(sec);
    };
    $('#settings-body').addEventListener('click', e => {
        const row = e.target.closest('[data-act]'); if (!row) return;
        const act = row.dataset.act;
        if (act === 'fx-theme') themeSheet();
        else if (act === 'fx-blocks') blocksSheet();
        else if (act === 'fx-admin') adminPanel();
    });
    $('#settings-body').addEventListener('change', e => {
        if (e.target.id !== 'fx-private') return;
        M().isPrivate = e.target.checked; save();
        toast(e.target.checked ? 'حساب شما خصوصی شد' : 'حساب شما عمومی شد', 'info');
        renderSettings();
    });
}

/* ============================================================
   ۷) کاور: نمایش کامل عکس (بدون برش) — مثل ویراستی
   عکس کامل با background-size: contain دیده می‌شود، فضای خالی با همان عکسِ محو پر می‌شود،
   و نسبت قاب از روی خود عکس (بین ۱:۱ و ۳:۱، حداکثر ۳۰۰ پیکسل ارتفاع) تنظیم می‌شود.
   جاهایی که کاور دارند: تنظیمات (.pc-cover)، اطلاعات چت و پیش‌نمایش پروفایل (.info-cover)
   ============================================================ */
{
    const st = document.createElement('style');
    st.textContent = `
.pc-cover:not(.empty),.info-cover:not(.empty){background-size:0 0!important;background-color:var(--surface-2)!important}
.pc-cover:not(.empty)::before,.pc-cover:not(.empty)::after,
.info-cover:not(.empty)::before,.info-cover:not(.empty)::after{content:'';display:block;position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  background-image:inherit;background-position:center;background-repeat:no-repeat;background-color:transparent}
.pc-cover:not(.empty)::before,.info-cover:not(.empty)::before{background-size:cover;filter:blur(18px) brightness(.75);transform:scale(1.2)}
.pc-cover:not(.empty)::after,.info-cover:not(.empty)::after{background-size:contain}
.profile-card.fx-cv{padding-top:min(calc((100% - 28px) / var(--cv-r)),300px)}
.profile-card.fx-cv .pc-cover{height:auto;aspect-ratio:var(--cv-r) / 1;max-height:300px}
.info-hero.fx-cv{padding-top:min(calc(100% / var(--cv-r)),300px)!important}
.info-hero.fx-cv .info-cover{height:auto!important;aspect-ratio:var(--cv-r) / 1;max-height:300px}
`;
    document.head.appendChild(st);

    const SEL = '.pc-cover:not(.empty), .info-cover:not(.empty)';
    const ratios = new Map();                                   // کلیدِ عکس ← نسبت (تا هر بار دوباره دیکد نشود)
    const keyOfUrl = u => u.length + ':' + u.slice(40, 90) + ':' + u.slice(-40);
    const urlOf = el => { const m = /url\(["']?(.*?)["']?\)/.exec(el.style.backgroundImage || ''); return m && m[1]; };
    function apply(el, r) {
        const box = el.parentElement; if (!box) return;
        const v = r.toFixed(3);
        if (box.classList.contains('fx-cv') && box.style.getPropertyValue('--cv-r') === v) return;   // جلوگیری از حلقه‌ی observer
        box.classList.add('fx-cv'); box.style.setProperty('--cv-r', v);
    }
    function fit(el) {
        const url = urlOf(el); if (!url) return;
        const k = keyOfUrl(url);
        if (ratios.has(k)) { apply(el, ratios.get(k)); return; }
        if (el.dataset.cvKey === k) return;
        el.dataset.cvKey = k;
        const im = new Image();
        im.onload = () => {
            if (!im.naturalWidth || !im.naturalHeight) return;
            const r = Math.min(3, Math.max(1, im.naturalWidth / im.naturalHeight));
            if (ratios.size > 30) ratios.delete(ratios.keys().next().value);
            ratios.set(k, r);
            if (el.isConnected && urlOf(el) === url) apply(el, r);
        };
        im.src = url;
    }
    const scan = n => {
        if (!n || n.nodeType !== 1) return;
        if (n.matches(SEL)) fit(n);
        if (n.querySelectorAll) n.querySelectorAll(SEL).forEach(fit);
    };
    new MutationObserver(ms => ms.forEach(m => {
        if (m.type === 'attributes') { if (m.target.matches && m.target.matches(SEL)) fit(m.target); }
        else m.addedNodes.forEach(scan);
    })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    scan(document.body);
}

/* ============================================================
   ۸) هدرها یک پنل هم‌اندازه + منوی دسته‌بندی چسبیده + نوار پایین چت یک باکس + منوهای ۵۰٪ شفاف
   - هدر هر چهار بخش (لیست، چت/کانال، اطلاعات، پیش‌نمایش) یک پنل است و همه هم‌ارتفاع‌اند (--fx-h)؛
     محتوای هر بخش (آواتار، عنوان، اعضا، وضعیت، دکمه‌ها) دست‌نخورده است.
   - منوی دسته‌بندی فقط در صفحه‌ی اصلی است (z-index پایین، مثل اصل برنامه) و دقیقاً (--fx-gap = ۱ پیکسل) زیر هدر می‌نشیند؛
     ارتفاع هدر ثابت است، پس به اندازه‌گیری بستگی ندارد.
   - لیست چت‌ها و کانال‌ها و شکل آواتار دست‌نخورده‌اند.
   - نوار پایین چت: دکمه‌ی ویس، آیکن‌های عکس/فایل/نظرسنجی/ایموجی و کادر پیام همگی داخل یک باکس.
   ============================================================ */
{
    const st = document.createElement('style');
    st.textContent = `
:root{--fx-h:48px;--fx-gap:1px;--fx-glass:rgba(24,24,24,.5);--fx-ring:rgba(255,255,255,.12);--fx-hover:rgba(255,255,255,.10);--fx-active:rgba(255,255,255,.14)}
html[data-theme="light"]{--fx-glass:rgba(255,255,255,.5);--fx-ring:rgba(0,0,0,.09);--fx-hover:rgba(0,0,0,.06);--fx-active:rgba(0,0,0,.08)}

/* ---- هدر هر بخش: یک پنل گرد، هم‌ارتفاع ---- */
#screen-list .main-hdr,#screen-chat .hdr.chat-hdr,#screen-info .hdr,#screen-profile .hdr{
  position:absolute!important;top:0!important;left:0!important;right:0!important;box-sizing:border-box!important;
  height:var(--fx-h)!important;min-height:0!important;padding:0 8px!important;gap:6px!important;
  background:var(--fx-glass)!important;
  backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important;
  border:none!important;border-radius:999px!important;box-shadow:inset 0 0 0 1px var(--fx-ring)!important;
  pointer-events:auto!important}

/* ---- باکس‌های جدای داخل هدر شفاف می‌شوند (همه‌شان یک پنل)؛ اندازه‌ی دکمه‌ها و آواتار دست‌نخورده است ---- */
#screen-list .main-hdr .circle-btn,#screen-chat .hdr.chat-hdr .circle-btn,
#screen-list .main-hdr .brand-pill,#screen-chat .hdr.chat-hdr .chat-hdr-center,
#screen-info .hdr .icon-btn,#screen-profile .hdr .icon-btn{
  background:transparent!important;border:none!important;box-shadow:none!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
#screen-list .main-hdr .circle-btn:hover,#screen-chat .hdr.chat-hdr .circle-btn:hover,
#screen-info .hdr .icon-btn:hover,#screen-profile .hdr .icon-btn:hover{background:var(--fx-hover)!important}
#screen-list .main-hdr .circle-btn:active,#screen-chat .hdr.chat-hdr .circle-btn:active,
#screen-chat .hdr.chat-hdr .chat-hdr-center:active,
#screen-info .hdr .icon-btn:active,#screen-profile .hdr .icon-btn:active{background:var(--fx-active)!important}
#screen-chat .hdr.chat-hdr .chat-hdr-center:hover{background:transparent!important}

/* ---- منوی دسته‌بندی: یک پنل، ۱ پیکسل زیر هدر ---- */
/* فاصله‌ی زیر هدر را با margin می‌دهیم نه padding: sticky در کروم padding والد را هم حساب می‌کند و فاصله دو برابر می‌شد */
#tab-chats{padding-top:0!important}
#tab-chats > #searchbar{margin-top:calc(var(--fx-h) + var(--fx-gap))!important}
#tab-contacts,#tab-settings{padding-top:calc(var(--fx-h) + 10px)!important}
#top-nav{
  position:sticky!important;top:calc(var(--fx-h) + var(--fx-gap))!important;z-index:2;flex-shrink:0;
  box-sizing:border-box;margin:calc(var(--fx-h) + var(--fx-gap)) -8px 8px!important;padding:5px 8px!important;gap:4px!important;align-items:center;
  background:var(--fx-glass)!important;
  backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important;
  border:none!important;border-radius:999px!important;box-shadow:inset 0 0 0 1px var(--fx-ring)!important}
/* وقتی نوار جستجو باز است، خودش زیر هدر می‌نشیند و منوی دسته‌بندی بلافاصله بعد از آن می‌آید */
#searchbar:not([style*="none"]) + #top-nav{margin-top:0!important}
#top-nav .tnav-item:not(.active){
  background:transparent!important;border:none!important;box-shadow:none!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
#top-nav .tnav-item.active{background:var(--fx-active)!important;color:var(--text)!important}

/* ---- نوار پایین چت: ویس + عکس/فایل/نظرسنجی/ایموجی + کادر پیام = یک باکسِ کوچک ---- */
:root{--composer-h:calc(var(--fx-h) + 12px)}
.composer{
  left:8px!important;right:8px!important;bottom:6px!important;box-sizing:border-box;
  padding:4px 6px!important;gap:4px!important;
  background:var(--fx-glass)!important;
  backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important;
  border-radius:24px!important;box-shadow:inset 0 0 0 1px var(--fx-ring)!important}
.composer-voice,.composer-mini,.composer-input-wrap,
.composer.warner-blocked .composer-input-wrap,.composer-input-wrap:focus-within{
  background:transparent!important;border:none!important;box-shadow:none!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.composer-input-area{gap:0!important}
.composer-mini-actions{padding:0 2px!important;gap:4px!important}
.composer-mini{width:24px!important;height:24px!important}
.composer-voice{width:38px!important;height:38px!important}
.composer-input-wrap{min-height:36px!important;padding:0 4px 0 6px!important}
.composer-text-send{width:32px!important;height:32px!important}
.composer-voice:active,.composer-mini:active{background:var(--fx-active)!important}

/* ---- باکس چت یک‌ردیفه: دکمه‌های عکس/فایل/نظرسنجی/ایموجی در یک آیکن (سمت راستِ کادر تایپ) ---- */
.composer-mini-actions{display:none!important}
.composer{left:0!important;right:0!important;min-height:var(--fx-h)!important;padding:0 6px!important}
.composer-voice{display:none!important}
.composer > #btn-emoji.composer-mini{display:flex;align-items:center;justify-content:center;width:36px!important;height:36px!important;border-radius:50%;flex-shrink:0;cursor:pointer;padding:0}
.composer > #btn-emoji svg{width:22px;height:22px}
.composer > #btn-emoji.composer-mini,#btn-attach-menu.composer-mini,.composer-input-wrap .composer-text-send{width:34px!important;height:34px!important;align-self:center!important;margin:0!important}
.composer-input-wrap{align-items:center!important}

/* ---- نوار قالب‌بندی (بولد، نقل قول و...): بالای کل باکس چت، با ۱ پیکسل فاصله ---- */
.composer-input-area,.composer-input-wrap{position:static!important}
.composer .fmt-bar{
  bottom:calc(100% + 1px)!important;right:0!important;left:auto!important;
  background:var(--fx-glass)!important;
  backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important;
  border:none!important;box-shadow:inset 0 0 0 1px var(--fx-ring)!important;
  border-radius:999px!important;height:40px;align-items:center;padding:0 8px!important}
.composer-input-wrap #msg-input,.composer-input-wrap .attach-bar{align-self:center!important;margin:0!important}
.composer{align-items:center!important}
#btn-attach-menu.composer-mini{display:flex;align-items:center;justify-content:center;width:34px!important;height:34px!important;border-radius:50%;flex-shrink:0;cursor:pointer;padding:0}
#btn-attach-menu svg{opacity:.9}
.composer.warner-blocked #btn-attach-menu{display:none!important}
.fx-asheet-group{font-size:12px;font-weight:700;color:var(--text-3);padding:10px 16px 4px}

/* ---- باکس دسته‌بندی: هم‌اندازه‌ی باکس بالایی (هدر) ---- */
#top-nav{height:var(--fx-h)!important;min-height:var(--fx-h)!important;padding:0 8px!important}

/* ---- باکس پین: هم‌اندازه‌ی باکس اطلاعاتِ بالایی (هدر چت) ---- */
/* ---- هدر چت: آواتار، اسم و تعداد اعضا سمت راست‌تر (فاصله‌ی کمتر از دکمه‌ی برگشت) ---- */
#screen-chat .hdr.chat-hdr{gap:5px!important;padding:0 6px!important}
#screen-chat .hdr.chat-hdr .circle-btn{width:34px!important;height:34px!important;flex-shrink:0}
#screen-chat .hdr.chat-hdr .chat-hdr-center{padding:0 0 0 8px!important;gap:8px!important}
.pin-circle{top:calc(var(--fx-h) + var(--fx-gap))!important;left:0!important;right:0!important;height:var(--fx-h)!important;box-sizing:border-box!important;border-radius:999px!important}
#messages.has-pins{padding-top:calc(var(--fx-h) * 2 + var(--fx-gap) + 12px)!important}

`;
    document.head.appendChild(st);
}

/* ---------- دکمه‌ی پیوست: عکس/فایل/نظرسنجی/ایموجی در یک منو ---------- */
{
    const wrap = $('.composer-input-wrap');
    if (wrap && !$('#btn-attach-menu')) {
        const b = document.createElement('button');
        b.id = 'btn-attach-menu'; b.type = 'button'; b.className = 'composer-mini';
        b.setAttribute('aria-label', 'پیوست');
        b.innerHTML = '<svg width="20" height="20"><use href="#i-attach"/></svg>';
        wrap.prepend(b);
        const item = (target, svg, label) =>
            '<div class="sheet-item" data-aact="' + target + '"><svg width="22" height="22"><use href="#' + svg + '"/></svg>' + label + '</div>';
        b.addEventListener('click', e => {
            e.preventDefault(); e.stopPropagation();
            openSheet(
                '<div class="sheet-title">افزودن به پیام</div>' +
                '<div class="fx-asheet-group">رسانه و فایل</div>' +
                item('btn-photo', 'i-camera', 'عکس و فیلم') +
                item('btn-file', 'i-file', 'فایل') +
                '<div class="fx-asheet-group">صدا و نظرسنجی</div>' +
                item('btn-send', 'i-mic', 'ضبط صدا') +
                item('btn-poll', 'i-chart', 'نظرسنجی')
            );
            $$('#sheet-content [data-aact]').forEach(it => it.addEventListener('click', () => {
                const target = $('#' + it.dataset.aact);
                closeSheet();
                setTimeout(() => { if (target) target.click(); }, 160);
            }));
        });
    }
}

/* ---------- ایموجی: بیرون از منو، جای دکمه‌ی ضبط صدا ---------- */
{
    const comp = $('#composer'), em = $('#btn-emoji');
    if (comp && em) comp.prepend(em);
}

/* ---------- شروع ---------- */
normAll(); applyTheme(); updBadge();
const _tab = $('#tab-chats'); if (_tab && !_tab.classList.contains('hidden')) { const b = $('#btn-notifs'); if (b) b.style.display = 'flex'; }
renderSettings(); renderChatList();
})();

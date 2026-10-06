/**
 * Order notifications: email (nodemailer) + WhatsApp (CallMeBot or Meta Cloud API).
 * Put this file at server/src/services/notifications.js
 *
 * Install:  npm i nodemailer
 * Requires Node 18+ (uses the built-in fetch).
 *
 * .env variables:
 *   # Email (example: Gmail with an App Password)
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_USER=youraddress@gmail.com
 *   SMTP_PASS=your-16-char-app-password
 *   NOTIFY_EMAIL=where-you-want-orders@example.com
 *
 *   # WhatsApp: choose ONE provider
 *   WHATSAPP_PROVIDER=callmebot        # or: cloud
 *
 *   # CallMeBot (simple, for notifying your own number)
 *   CALLMEBOT_PHONE=254712345678       # international format, no +
 *   CALLMEBOT_APIKEY=123456
 *
 *   # Meta WhatsApp Cloud API (official)
 *   WA_PHONE_NUMBER_ID=xxxxxxxxxxxx
 *   WA_ACCESS_TOKEN=xxxxxxxxxxxx
 *   WA_TO=254712345678
 */

const nodemailer = require('nodemailer');

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const kes = (n) => `KSh ${Number(n || 0).toLocaleString()}`;

const paymentLabel = (p) => (p === 'MPESA' ? 'M-Pesa' : 'Cash on Delivery');

/**
 * order: { id?, orderNumber?, customerName, phone, location, houseNumber,
 *          deliveryNotes, paymentMethod, deliveryFee, totalAmount }
 * items: [{ name, size, printing, quantity, price }]
 */
const buildText = (order, items) => {
  const ref = order.orderNumber || order.id || '';
  const lines = items.map(
    (i) =>
      `• ${i.name} x${i.quantity} — ${kes(i.price * i.quantity)}` +
      (i.size && i.size !== 'N/A' ? `\n   Size: ${i.size}` : '') +
      (i.printing && i.printing !== 'None' ? `\n   Printing: ${i.printing}` : '')
  );
  return [
    `🛒 NEW ORDER ${ref ? `#${ref}` : ''}`.trim(),
    '',
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Location: ${order.location}`,
    `House/Building: ${order.houseNumber}`,
    order.deliveryNotes ? `Notes: ${order.deliveryNotes}` : null,
    '',
    'Items:',
    ...lines,
    '',
    `Delivery: ${kes(order.deliveryFee)}`,
    `TOTAL: ${kes(order.totalAmount)}`,
    `Payment: ${paymentLabel(order.paymentMethod)}`,
  ]
    .filter((l) => l !== null)
    .join('\n');
};

const buildHtml = (order, items) => {
  const ref = order.orderNumber || order.id || '';
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(i.name)}
          ${i.size && i.size !== 'N/A' ? `<br><small>Size: ${esc(i.size)}</small>` : ''}
          ${i.printing && i.printing !== 'None' ? `<br><small>Printing: ${esc(i.printing)}</small>` : ''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${esc(i.quantity)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${esc(kes(i.price * i.quantity))}</td>
      </tr>`
    )
    .join('');

  return `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2>New order ${ref ? `#${esc(ref)}` : ''}</h2>
    <p><b>Customer:</b> ${esc(order.customerName)}<br>
       <b>Phone:</b> ${esc(order.phone)}<br>
       <b>Location:</b> ${esc(order.location)}<br>
       <b>House/Building:</b> ${esc(order.houseNumber)}<br>
       ${order.deliveryNotes ? `<b>Notes:</b> ${esc(order.deliveryNotes)}<br>` : ''}
       <b>Payment:</b> ${esc(paymentLabel(order.paymentMethod))}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr style="background:#f5f5f5"><th align="left" style="padding:6px 8px">Item</th><th>Qty</th><th align="right" style="padding:6px 8px">Amount</th></tr>
      ${rows}
    </table>
    <p style="text-align:right">Delivery: ${esc(kes(order.deliveryFee))}<br>
       <b style="font-size:16px">Total: ${esc(kes(order.totalAmount))}</b></p>
  </div>`;
};

// ── Email ──────────────────────────────────────────────
let transporter;
const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const sendEmail = async (order, items) => {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_EMAIL) {
    throw new Error('Email not configured (SMTP_HOST / NOTIFY_EMAIL missing)');
  }
  const ref = order.orderNumber || order.id || '';
  const info = await getTransporter().sendMail({
    from: `"Shop Orders" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    subject: `New order ${ref ? `#${ref} ` : ''}— ${order.customerName} — ${kes(order.totalAmount)}`,
    text: buildText(order, items),
    html: buildHtml(order, items),
  });
  return { accepted: info.accepted, rejected: info.rejected, response: info.response };
};

// ── WhatsApp ───────────────────────────────────────────
const sendWhatsApp = async (order, items) => {
  const text = buildText(order, items);
  const provider = process.env.WHATSAPP_PROVIDER;

  if (provider === 'callmebot') {
    const { CALLMEBOT_PHONE, CALLMEBOT_APIKEY } = process.env;
    if (!CALLMEBOT_PHONE || !CALLMEBOT_APIKEY) throw new Error('CallMeBot not configured');
    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(CALLMEBOT_PHONE)}` +
      `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(CALLMEBOT_APIKEY)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CallMeBot failed (${res.status})`);
    return;
  }

  if (provider === 'cloud') {
    const { WA_PHONE_NUMBER_ID, WA_ACCESS_TOKEN, WA_TO } = process.env;
    if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN || !WA_TO) throw new Error('WhatsApp Cloud API not configured');
    const res = await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WA_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: WA_TO,
        type: 'text',
        text: { body: text },
      }),
    });
    if (!res.ok) throw new Error(`WhatsApp Cloud API failed (${res.status}): ${await res.text()}`);
    return;
  }

  throw new Error('WHATSAPP_PROVIDER not set (use "callmebot" or "cloud")');
};

/**
 * Call this after the order is saved. Never throws: a failed notification
 * must not fail the customer's order.
 */
const notifyNewOrder = async (order, items) => {
  console.log(`[notify] Sending notifications for order ${order.orderNumber || order.id}...`);
  const results = await Promise.allSettled([sendEmail(order, items), sendWhatsApp(order, items)]);
  results.forEach((r, i) => {
    const channel = i === 0 ? 'Email' : 'WhatsApp';
    if (r.status === 'rejected') {
      console.error(`[notify] ${channel} failed:`, r.reason?.message || r.reason);
    } else {
      console.log(`[notify] ${channel} OK`, r.value ? JSON.stringify(r.value) : '');
    }
  });
};

module.exports = { notifyNewOrder };
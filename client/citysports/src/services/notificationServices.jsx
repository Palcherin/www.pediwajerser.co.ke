// ── Format order as plain text (WhatsApp) ────────────────────────
const formatOrderText = (order) => {
  const items = order.orderItems
    .map((item, i) => {
      const lines = [
        `  ${i + 1}. ${item.name || `Product ID: ${item.productId}`}`,
        `     Size: ${item.size || 'N/A'}`,
        `     Printing: ${item.printing || 'None'}`,
        `     Qty: ${item.quantity} × KSh ${Number(item.price).toLocaleString()}`,
        `     Subtotal: KSh ${(item.price * item.quantity).toLocaleString()}`,
      ];
      return lines.join('\n');
    })
    .join('\n\n');

  return `
🛒 NEW ORDER - PEDI WA JERSEY

👤 Name:     ${order.customerName}
📞 Phone:    ${order.phone}
📍 Location: ${order.location}
🏠 House:    ${order.houseNumber || 'N/A'}
💳 Payment:  ${order.paymentMethod}
📝 Notes:    ${order.deliveryNotes || 'None'}

📦 ORDER ITEMS:
${items}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL: KSh ${Number(order.totalAmount).toLocaleString()}
🕐 Time:  ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
━━━━━━━━━━━━━━━━━━━━
  `.trim();
};

// ── Format order as HTML (Email) ─────────────────────────────────
const formatOrderHTML = (order) => {
  const itemRows = order.orderItems
    .map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#ffffff'}">
        <td style="padding:12px 14px;font-weight:600;color:#111827">
          ${item.name || `Product #${item.productId}`}
        </td>
        <td style="padding:12px 14px;color:#6b7280;text-align:center">
          ${item.size || 'N/A'}
        </td>
        <td style="padding:12px 14px;color:#6b7280;text-align:center">
          ${item.printing || 'None'}
        </td>
        <td style="padding:12px 14px;text-align:center">
          ${item.quantity}
        </td>
        <td style="padding:12px 14px;text-align:right">
          KSh ${Number(item.price).toLocaleString()}
        </td>
        <td style="padding:12px 14px;text-align:right;font-weight:600;color:#111827">
          KSh ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>`)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#ffffff">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#059669,#047857);padding:28px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#ffffff;margin:0;font-size:22px">🛒 New Order Received!</h1>
        <p style="color:#a7f3d0;margin:6px 0 0;font-size:14px">
          ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
        </p>
      </div>

      <!-- Customer Details -->
      <div style="padding:24px 32px;background:#f0fdf4;border-left:4px solid #059669">
        <h2 style="margin:0 0 16px;font-size:16px;color:#065f46">Customer Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7280;width:120px">Name</td>     <td style="padding:6px 0;font-weight:600;color:#111827">${order.customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Phone</td>    <td style="padding:6px 0;font-weight:600;color:#111827">${order.phone}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Location</td> <td style="padding:6px 0;color:#111827">${order.location}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">House</td>    <td style="padding:6px 0;color:#111827">${order.houseNumber || 'N/A'}</td></tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280">Payment</td>
            <td style="padding:6px 0">
              <span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">
                ${order.paymentMethod}
              </span>
            </td>
          </tr>
          <tr><td style="padding:6px 0;color:#6b7280">Notes</td>    <td style="padding:6px 0;color:#111827;font-style:italic">${order.deliveryNotes || 'None'}</td></tr>
        </table>
      </div>

      <!-- Order Items -->
      <div style="padding:24px 32px">
        <h2 style="margin:0 0 16px;font-size:16px;color:#111827">Order Items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
          <thead>
            <tr style="background:#059669;color:#ffffff">
              <th style="padding:10px 14px;text-align:left">Product</th>
              <th style="padding:10px 14px;text-align:center">Size</th>
              <th style="padding:10px 14px;text-align:center">Printing</th>
              <th style="padding:10px 14px;text-align:center">Qty</th>
              <th style="padding:10px 14px;text-align:right">Unit Price</th>
              <th style="padding:10px 14px;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>

      <!-- Total -->
      <div style="padding:0 32px 24px">
        <div style="background:#111827;color:#ffffff;padding:16px 20px;border-radius:10px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:16px">Total Amount</span>
          <span style="font-size:22px;font-weight:700;color:#34d399">
            KSh ${Number(order.totalAmount).toLocaleString()}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px 28px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6">
        Pedi Wa Jersey · www.pediwajersey.co.ke · +254 743 666 719
      </div>
    </div>
  `;
};
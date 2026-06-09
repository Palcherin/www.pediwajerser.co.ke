import { prisma } from '../config/db.js';

// ── Called on every page load (anonymous) ────────────────────────
export const trackVisit = async (req, res) => {
  try {
    const { sessionId, page, referrer } = req.body;

    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    // Upsert customer — create if new, update lastSeen if returning
    const customer = await prisma.customer.upsert({
      where:  { sessionId },
      update: { lastSeen: new Date() },
      create: {
        sessionId,
        source: referrer?.includes('whatsapp') ? 'whatsapp'
               : referrer?.includes('google')  ? 'google'
               : referrer ? 'referral' : 'direct',
      },
    });

    // Log the page view
    await prisma.pageView.create({
      data: { customerId: customer.id, page, referrer: referrer || '' },
    });

    res.json({ success: true, customerId: customer.id });
  } catch (err) {
    console.error('Track visit error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── Called when customer submits checkout ────────────────────────
export const attachOrderToCustomer = async (req, res) => {
  try {
    const {
      sessionId, customerName, phone, location,
      houseNumber, totalAmount, paymentMethod, items, emailOptIn, email,
    } = req.body;

    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    const customer = await prisma.customer.upsert({
      where:  { sessionId },
      update: {
        name:       customerName,
        phone,
        location,
        lastSeen:   new Date(),
        ...(email     && { email }),
        ...(emailOptIn !== undefined && { emailOptIn }),
      },
      create: {
        sessionId,
        name:      customerName,
        phone,
        location,
        email:     email || null,
        emailOptIn: emailOptIn || false,
      },
    });

    const order = await prisma.customerOrder.create({
      data: {
        customerId:    customer.id,
        customerName,
        phone,
        location:      `${location}, ${houseNumber}`,
        totalAmount:   parseFloat(totalAmount),
        paymentMethod,
        items:         items,
      },
    });

    res.json({ success: true, customerId: customer.id, orderId: order.id });
  } catch (err) {
    console.error('Attach order error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── Admin — get all customers ────────────────────────────────────
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count:  { select: { pageViews: true, orders: true } },
        orders:  { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastSeen: 'desc' },
    });
    res.json({ status: 'success', data: customers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin — get single customer with full history ────────────────
export const getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where:   { id: req.params.id },
      include: {
        pageViews: { orderBy: { createdAt: 'desc' }, take: 20 },
        orders:    { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ status: 'success', data: customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin — toggle active status ─────────────────────────────────
export const toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data:  { isActive: !customer.isActive },
    });
    res.json({ status: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
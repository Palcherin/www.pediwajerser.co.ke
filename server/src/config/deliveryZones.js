/**
 * Delivery zones and fees (server-side source of truth).
 * Save as server/src/config/deliveryZones.js
 *
 * Keep this in sync with DELIVERY_ZONES in CheckoutPage.jsx.
 * fee    = delivery fee when paying by M-Pesa
 * codFee = delivery fee for cash on delivery (null = COD not available)
 */
const DELIVERY_ZONES = {
    'Nairobi CBD & Surrounds': { fee: 150, codFee: 200 },
    'Nairobi Suburbs':         { fee: 350, codFee: 400 },
    'Nairobi Outskirts':       { fee: 250, codFee: 300 },
    'Mombasa':                 { fee: 400, codFee: null },
    'Kisumu':                  { fee: 400, codFee: null },
    'Nakuru':                  { fee: 350, codFee: null },
    'Eldoret':                 { fee: 350, codFee: null },
    'Thika':                   { fee: 300, codFee: 350 },
};

/**
 * location is sent by the checkout as "<area>, <zone>".
 * Returns { zone, fee } or throws an Error with a customer-friendly message.
 */
const getDeliveryFee = (location, paymentMethod) => {
    const zoneName = String(location || '').split(',').pop().trim();
    const zone = DELIVERY_ZONES[zoneName];
    if (!zone) {
        const err = new Error('Invalid delivery zone');
        err.code = 'INVALID_ZONE';
        throw err;
    }

    if (paymentMethod === 'CASH_ON_DELIVERY') {
        if (zone.codFee == null) {
            const err = new Error(`Cash on delivery is not available for ${zoneName}. Please pay with M-Pesa.`);
            err.code = 'COD_NOT_AVAILABLE';
            throw err;
        }
        return { zone: zoneName, fee: zone.codFee };
    }

    return { zone: zoneName, fee: zone.fee };
};

module.exports = { DELIVERY_ZONES, getDeliveryFee };
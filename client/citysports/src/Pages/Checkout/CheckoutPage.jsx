import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaShieldAlt, FaTruck, FaWhatsapp, FaCheck, FaChevronDown, FaMapMarkerAlt, FaMoneyBillWave, FaMobileAlt } from 'react-icons/fa';

const DELIVERY_ZONES = {
  'Nairobi CBD & Surrounds': {
    fee: 150, nearNairobi: true,
    areas: ['CBD', 'Westlands', 'Parklands', 'Ngara', 'Pangani', 'Eastleigh', 'Ngong Road'],
  },
  'Nairobi Suburbs': {
    fee: 200, nearNairobi: true,
    areas: ['Kilimani', 'Lavington', 'Karen', 'Langata', 'South C', 'South B', 'Upperhill', 'Hurlingham'],
  },
  'Nairobi Outskirts': {
    fee: 250, nearNairobi: true,
    areas: ['Kasarani', 'Ruaka', 'Ruiru', 'Kikuyu', 'Rongai', 'Kitengela', 'Embakasi', 'Utawala', 'Syokimau'],
  },
  'Mombasa': {
    fee: 400, nearNairobi: false,
    areas: ['Mombasa Island', 'Nyali', 'Bamburi', 'Likoni', 'Mtwapa'],
  },
  'Kisumu': {
    fee: 400, nearNairobi: false,
    areas: ['Kisumu CBD', 'Milimani', 'Kondele', 'Mamboleo'],
  },
  'Nakuru': {
    fee: 350, nearNairobi: false,
    areas: ['Nakuru CBD', 'Milimani', 'Section 58', 'Lanet'],
  },
  'Eldoret': {
    fee: 350, nearNairobi: false,
    areas: ['Eldoret CBD', 'Langas', 'Pioneer', 'Huruma'],
  },
  'Thika': {
    fee: 300, nearNairobi: true,
    areas: ['Thika CBD', 'Makongeni', 'Ngoigwa'],
  },
};

const PAYMENT_OPTIONS = [
  {
    value: 'cash',
    label: 'Cash on Delivery',
    sub: 'Pay when your order arrives',
    icon: FaMoneyBillWave,
    nairobiOnly: true,
  },
  {
    value: 'mpesa',
    label: 'M-Pesa',
    sub: 'Pay via M-Pesa till/paybill',
    icon: FaMobileAlt,
    nairobiOnly: false,
  },
];

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', phone: '', zone: '', area: '',
    houseNumber: '', notes: '', payment: 'cash',
  });
  const [errors,  setErrors]  = useState({});
  const [placed,  setPlaced]  = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedZoneData = DELIVERY_ZONES[form.zone];
  const deliveryFee      = selectedZoneData?.fee || 0;
  const isNairobi        = selectedZoneData?.nearNairobi ?? true;

  // ✅ Compute subtotal directly from cart — avoids context sync issues
  const subtotal  = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const grandTotal = subtotal + deliveryFee;

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = field === 'zone'
        ? { ...prev, zone: value, area: '', payment: DELIVERY_ZONES[value]?.nearNairobi ? prev.payment : 'mpesa' }
        : { ...prev, [field]: value };
      return updated;
    });
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim() || !/^(?:254|\+254|0)[17]\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid Kenyan number (e.g. 0712 345 678)';
    if (!form.zone)  e.zone = 'Please select a delivery zone';
    if (!form.area)  e.area = 'Please select your specific area';
    if (!form.houseNumber.trim()) e.houseNumber = 'House / building name is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  form.name,
          phone:         form.phone,
          location:      `${form.area}, ${form.zone}`,
          houseNumber:   form.houseNumber,
          deliveryNotes: form.notes || '',
          paymentMethod: form.payment === 'mpesa' ? 'MPESA' : 'CASH_ON_DELIVERY',
          totalAmount:   grandTotal,
          orderItems: cart.map(item => ({
            productId: item.productId || item.id,
            name:      item.name,
            size:      item.size     || 'N/A',
            printing:  item.printing?.type !== 'none'
              ? `${item.printing?.name || ''}${item.printing?.number ? ` #${item.printing.number}` : ''}`
              : 'None',
            quantity:  Number(item.quantity) || 1,
            price:     Number(item.price)    || 0,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');
      setPlaced(true);
      clearCart();
    } catch (err) {
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────
  if (placed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheck className="text-emerald-600 text-3xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-2">
          Thanks, <span className="font-semibold text-gray-800">{form.name}</span>!
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Delivering to <span className="font-medium text-gray-600">{form.area}, {form.zone}</span>.
          We'll confirm via WhatsApp shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-2xl transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  // ── Empty cart ──────────────────────────────────────────────────
  if (!cart.length) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition mt-4"
        >
          Browse Products
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 py-5 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-500" /> Secure
            </span>
            <span className="flex items-center gap-1.5">
              <FaTruck className="text-emerald-500" /> Fast Delivery
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* ── LEFT: Form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1 — Contact */}
          <Section title="Contact Details" step="1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.name}>
                <input
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="John Kamau"
                  className={inputCls(errors.name)}
                />
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <input
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="0712 345 678"
                  className={inputCls(errors.phone)}
                />
              </Field>
            </div>
          </Section>

          {/* Step 2 — Delivery Location */}
          <Section title="Delivery Location" step="2">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Zone dropdown */}
              <Field label="Delivery Zone" error={errors.zone}>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                    <FaMapMarkerAlt className="text-emerald-500 text-sm" />
                  </div>
                  <select
                    value={form.zone}
                    onChange={e => handleChange('zone', e.target.value)}
                    className={selectCls(errors.zone)}
                  >
                    <option value="">Select zone...</option>
                    {Object.entries(DELIVERY_ZONES).map(([zone, { fee }]) => (
                      <option key={zone} value={zone}>
                        {zone} — KSh {fee}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </Field>

              {/* Area dropdown */}
              <Field label="Specific Area" error={errors.area}>
                <div className="relative">
                  <select
                    value={form.area}
                    onChange={e => handleChange('area', e.target.value)}
                    disabled={!form.zone}
                    className={selectCls(errors.area, !form.zone)}
                  >
                    <option value="">{form.zone ? 'Select area...' : 'Select zone first'}</option>
                    {selectedZoneData?.areas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <FaChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </Field>
            </div>

            {/* Delivery fee badge */}
            {form.zone && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm">
                <FaTruck className="text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-800">
                  Delivery to <span className="font-semibold">{form.zone}</span>:{' '}
                  <span className="font-bold">KSh {deliveryFee.toLocaleString()}</span>
                </span>
                {!isNairobi && (
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                    M-Pesa only
                  </span>
                )}
              </div>
            )}

            {/* House number */}
            <Field label="House / Building / Apartment" error={errors.houseNumber}>
              <input
                value={form.houseNumber}
                onChange={e => handleChange('houseNumber', e.target.value)}
                placeholder="e.g. Apt 4B, Kilimani Apts"
                className={inputCls(errors.houseNumber)}
              />
            </Field>

            {/* Delivery notes */}
            <Field label="Delivery Notes (optional)">
              <textarea
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Any instructions for the rider..."
                rows={3}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 resize-none transition-colors"
              />
            </Field>
          </Section>

          {/* Step 3 — Payment */}
          <Section title="Payment Method" step="3">

            {form.zone && !isNairobi && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-2">
                <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">M-Pesa payment required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Cash on delivery is only available within Nairobi and nearby areas.
                    Orders to <span className="font-semibold">{form.zone}</span> must be paid via M-Pesa before dispatch.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map(opt => {
                const isDisabled = opt.nairobiOnly && !isNairobi;
                const isSelected = form.payment === opt.value;
                const Icon       = opt.icon;

                return (
                  <label
                    key={opt.value}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                      ${isDisabled
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : isSelected
                          ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                          : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && handleChange('payment', opt.value)}
                      className="accent-emerald-600"
                    />
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-emerald-600' : 'bg-gray-100'
                    }`}>
                      <Icon className={isSelected ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{opt.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{opt.sub}</p>
                    </div>
                    {isDisabled && (
                      <span className="absolute top-2 right-3 text-xs text-gray-400 font-medium">
                        Nairobi only
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* M-Pesa instructions */}
            {form.payment === 'mpesa' && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
                <p className="font-semibold mb-1">M-Pesa Payment Instructions</p>
                <p>After placing your order, send <strong>KSh {grandTotal.toLocaleString()}</strong> to:</p>
                <div className="mt-2 bg-white rounded-xl px-4 py-2.5 border border-green-200 font-mono text-sm">
                  Paybill: <strong>714888</strong> &nbsp;·&nbsp; Account: <strong>304365</strong>
                </div>
              </div>
            )}
          </Section>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Placing Order...
              </>
            ) : (
              `Place Order — KSh ${grandTotal.toLocaleString()}`
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            By placing your order you agree to our terms. We'll confirm via WhatsApp.
          </p>
        </form>

        {/* ── RIGHT: Order Summary ── */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">

          {/* Cart items */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">
              Order Summary{' '}
              <span className="text-gray-400 font-normal text-sm">
                ({cart.length} item{cart.length !== 1 ? 's' : ''})
              </span>
            </h2>

            <div className="space-y-4 mb-6">
              {cart.map((item, i) => (
                <div key={item.id || i} className="flex gap-3 items-start">
                  <img
                    src={item.image || 'https://placehold.co/64?text=No+Image'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/64?text=No+Image'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
                      {item.name}
                    </p>
                    {item.size && item.size !== 'N/A' && (
                      <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>
                    )}
                    {item.printing?.type !== 'none' && item.printing?.name && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Printing: {item.printing.name}
                        {item.printing.number ? ` #${item.printing.number}` : ''}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity ?? 1}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                    KSh {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span className="flex items-center gap-1.5">
                  Delivery
                  {form.zone && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {form.zone}
                    </span>
                  )}
                </span>
                <span className={deliveryFee ? 'text-gray-700 font-medium' : 'text-gray-300'}>
                  {deliveryFee ? `KSh ${deliveryFee.toLocaleString()}` : '— select zone'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>KSh {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp note */}
          <div className="bg-[#e7f9ee] border border-[#b2eac7] rounded-2xl p-4 flex gap-3 items-start">
            <FaWhatsapp className="text-[#25D366] text-xl flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-900">
              We'll send your order confirmation and delivery updates on <strong>WhatsApp</strong>.
            </p>
          </div>

          {/* Delivery fee reference */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Delivery Fees
            </p>
            <div className="space-y-1.5">
              {Object.entries(DELIVERY_ZONES).map(([zone, { fee, nearNairobi }]) => (
                <div
                  key={zone}
                  className={`flex justify-between items-center text-sm rounded-xl px-3 py-2 transition-colors ${
                    form.zone === zone
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {zone}
                    {!nearNairobi && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">
                        M-Pesa
                      </span>
                    )}
                  </span>
                  <span className="font-medium">KSh {fee}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full border ${err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors`;

const selectCls = (err, disabled = false) =>
  `w-full border ${
    err      ? 'border-red-400 bg-red-50'              :
    disabled ? 'border-gray-100 bg-gray-50 text-gray-400' :
               'border-gray-200 bg-white'
  } rounded-2xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer`;

const Section = ({ title, step, children }) => (
  <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center gap-3 mb-5">
      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {step}
      </span>
      <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

export default CheckoutPage;
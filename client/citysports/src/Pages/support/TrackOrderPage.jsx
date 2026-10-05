import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL, Card, Page, StillNeedHelp, formatKES, inputClass } from './SupportsShared';

const STEPS = [
  { key: 'pending', label: 'Order received', hint: 'We have your order and will confirm it shortly.' },
  { key: 'processing', label: 'Being prepared', hint: 'Your items are being packed.' },
  { key: 'shipped', label: 'Out for delivery', hint: 'Your order is on its way.' },
  { key: 'delivered', label: 'Delivered', hint: 'Enjoy your gear.' },
];

const PAYMENT_LABEL = {
  paid: 'Paid',
  pending: 'Awaiting payment',
  failed: 'Payment failed',
};

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

const TrackOrderPage = () => {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    setError('');
  }, [orderNumber, phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), phone: phone.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(
          res.status === 429
            ? 'Too many attempts. Please wait a few minutes and try again.'
            : json.message || 'Something went wrong. Please try again.'
        );
      }
      setOrder(json.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;
  const cancelled = order?.status === 'cancelled';

  return (
    <Page
      title="Track your order"
      intro="Enter the order number from your confirmation and the phone number you used at checkout."
      width="max-w-3xl"
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
              Order number
            </label>
            <input
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORD-1730000000000-1234"
              autoComplete="off"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712 345 678"
              autoComplete="tel"
              required
              className={inputClass}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Looking up...' : 'Track order'}
          </button>
        </form>
      </Card>

      {order && (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">Order</p>
              <p className="text-lg font-bold text-gray-900 break-all">{order.orderNumber}</p>
              <p className="text-sm text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                order.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.paymentStatus === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.paymentMethod === 'COD' && order.paymentStatus === 'pending'
                ? 'Pay on delivery'
                : PAYMENT_LABEL[order.paymentStatus] || order.paymentStatus}
            </span>
          </div>

          {cancelled ? (
            <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
              This order was cancelled. If you did not ask for this,{' '}
              <Link to="/contact" className="font-semibold underline">
                contact us
              </Link>
              .
            </div>
          ) : (
            <ol className="mt-8 space-y-0">
              {STEPS.map((step, i) => {
                const done = i <= currentIndex;
                const current = i === currentIndex;
                const last = i === STEPS.length - 1;
                return (
                  <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                    {!last && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[15px] top-8 h-full w-0.5 ${
                          i < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        done ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </span>
                    <div>
                      <p className={`font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                        {current && <span className="sr-only"> (current step)</span>}
                      </p>
                      {current && <p className="text-sm text-gray-500 mt-0.5">{step.hint}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {order.trackingNumber && (
            <p className="mt-6 text-sm text-gray-600">
              Courier tracking number: <span className="font-semibold">{order.trackingNumber}</span>
            </p>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-base font-bold text-gray-900">Items</h2>
            <ul className="mt-3 divide-y divide-gray-100">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">
                      {item.name} <span className="text-gray-400">× {item.quantity}</span>
                    </p>
                    {(item.size || item.printing) && (
                      <p className="text-xs text-gray-400">
                        {[item.size && `Size ${item.size}`, item.printing && `Print: ${item.printing}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-gray-700">{formatKES(item.total)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <dt>Delivery{order.city ? ` (${order.city})` : ''}</dt>
                <dd>{formatKES(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900">
                <dt>Total</dt>
                <dd>{formatKES(order.total)}</dd>
              </div>
            </dl>
          </div>
        </Card>
      )}

      <StillNeedHelp />
    </Page>
  );
};

export default TrackOrderPage;
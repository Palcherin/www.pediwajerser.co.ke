import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const token = () => localStorage.getItem('token');

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
};

const OrdersManager = () => {
  const [orders, setOrders]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setError('');
      const res = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not load orders. Check that you are logged in and the server is running.');
    }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-gray-500 font-medium">Order #</th>
              <th className="text-left px-6 py-4 text-gray-500 font-medium">Customer</th>
              <th className="text-left px-6 py-4 text-gray-500 font-medium">Location</th>
              <th className="text-left px-6 py-4 text-gray-500 font-medium">Total</th>
              <th className="text-left px-6 py-4 text-gray-500 font-medium">Payment</th>
              <th className="text-left px-6 py-4 text-gray-500 font-medium">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{order.order_number}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{order.customer_name}</p>
                  <p className="text-gray-400 text-xs">{order.customer_phone}</p>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{order.shipping_city}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  KSh {Number(order.total_amount || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{order.payment_method}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.order_status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {Object.keys(STATUS_COLORS).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelected(order)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {!orders.length && !error && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-xs text-gray-400 font-mono mt-1">{selected.order_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <p><span className="text-gray-500">Name:</span> <span className="font-semibold">{selected.customer_name}</span></p>
                <p><span className="text-gray-500">Phone:</span> {selected.customer_phone}</p>
                <p><span className="text-gray-500">Location:</span> {selected.shipping_city}, {selected.shipping_address}</p>
                {selected.notes && <p><span className="text-gray-500">Notes:</span> {selected.notes}</p>}
                <p><span className="text-gray-500">Payment:</span> {selected.payment_method} ({selected.payment_status})</p>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-3">Items</p>
                {selected.items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-100">
                    <span>
                      {item.product_name} × {item.quantity}
                      {item.size ? ` (${item.size})` : ''}
                    </span>
                    <span className="font-semibold">KSh {Number(item.total_price).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-gray-500">
                  <span>Delivery fee</span>
                  <span>KSh {Number(selected.delivery_fee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 font-bold text-gray-900">
                  <span>Total</span>
                  <span>KSh {Number(selected.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
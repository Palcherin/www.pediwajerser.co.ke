import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const STATUS_COLORS = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-emerald-100 text-emerald-700',
  CANCELLED:  'bg-red-100 text-red-600',
};

const OrdersManager = () => {
  const [orders, setOrders]       = useState([]);
  const [selected, setSelected]   = useState(null);

  useEffect(() => { fetchOrders(); }, []);

const fetchOrders = async () => {
  try {
    const res = await fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setOrders(data.data || []);
  } catch (err) {
    console.error('Failed to fetch orders:', err);
  }
};

  const updateStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, {
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
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{order.orderNumber}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-gray-400 text-xs">{order.phone}</p>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{order.location}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  KSh {order.totalAmount?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{order.paymentMethod}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
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
                <p className="text-xs text-gray-400 font-mono mt-1">{selected.orderNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <p><span className="text-gray-500">Name:</span> <span className="font-semibold">{selected.customerName}</span></p>
                <p><span className="text-gray-500">Phone:</span> {selected.phone}</p>
                <p><span className="text-gray-500">Location:</span> {selected.location}, {selected.houseNumber}</p>
                {selected.deliveryNotes && <p><span className="text-gray-500">Notes:</span> {selected.deliveryNotes}</p>}
                <p><span className="text-gray-500">Payment:</span> {selected.paymentMethod}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-3">Items</p>
                {selected.orderItems?.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span className="font-semibold">KSh {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-bold text-gray-900">
                  <span>Total</span>
                  <span>KSh {selected.totalAmount?.toLocaleString()}</span>
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
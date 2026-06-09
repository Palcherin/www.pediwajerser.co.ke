import React, { useState, useEffect } from 'react';

const API   = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const DashboardHome = () => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API}/products`, {
          headers: { Authorization: `Bearer ${token()}` },
        });

        if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);

        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalProducts  = products.length;
  const inStock        = products.filter(p => (p?.stockQuantity || 0) > 0).length;
  const outOfStock     = products.filter(p => (p?.stockQuantity || 0) <= 0).length;
  const lowStock       = products.filter(p => (p?.stockQuantity || 0) > 0 && (p?.stockQuantity || 0) <= 5);
  const featured       = products.filter(p => p?.featured).length;
  const totalInventory = products.reduce((sum, p) => sum + (p?.stockQuantity || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 p-8 rounded-3xl text-center">
      {error}
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Products"
          value={totalProducts}
          sub="In catalogue"
          icon="👟"
          color="bg-purple-50"
        />
        <StatCard
          label="In Stock"
          value={inStock}
          sub="Available to sell"
          icon="✅"
          color="bg-emerald-50"
        />
        <StatCard
          label="Out of Stock"
          value={outOfStock}
          sub="Needs restocking"
          icon="⚠️"
          color="bg-red-50"
        />
        <StatCard
          label="Total Inventory"
          value={totalInventory.toLocaleString()}
          sub="Units across all products"
          icon="📦"
          color="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Product list */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg">All Products</h3>
            <span className="text-sm text-gray-400">{totalProducts} total</span>
          </div>

          {products.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No products yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Product</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Stock</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.slice(0, 10).map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.brand || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        KSh {(product.price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.stockQuantity ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        {(product.stockQuantity || 0) <= 0 ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                            Out of Stock
                          </span>
                        ) : (product.stockQuantity || 0) <= 5 ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stock breakdown */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <h3 className="font-semibold mb-5">Stock Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'In Stock',     count: inStock,    color: 'bg-emerald-500' },
                { label: 'Low Stock',    count: lowStock.length, color: 'bg-amber-400' },
                { label: 'Out of Stock', count: outOfStock, color: 'bg-red-400' },
                { label: 'Featured',     count: featured,   color: 'bg-purple-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: totalProducts ? `${(count / totalProducts) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="font-semibold text-sm w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock warning */}
          {lowStock.length > 0 && (
            <div className="bg-white rounded-3xl border border-amber-100 p-6">
              <h3 className="font-semibold mb-4 text-amber-700">⚠️ Low Stock Alert</h3>
              <div className="space-y-3">
                {lowStock.slice(0, 6).map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 truncate">{p.name}</span>
                    <span className="text-amber-600 font-bold ml-2 flex-shrink-0">
                      {p.stockQuantity} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, color }) => (
  <div className="bg-white rounded-3xl border border-gray-100 p-6 flex gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

export default DashboardHome;
import React, { useState, useEffect } from 'react';
import { IconPackage, IconAlertTriangle, IconPlus, IconMinus } from '@tabler/icons-react';

const API_BASE = 'http://localhost:5000/api';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, low, out
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newQuantity) => {
    try {
      await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ stockQuantity: newQuantity }),
      });
      fetchInventory(); // Refresh list
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      if (filter === 'low') return matchesSearch && product.stockQuantity <= 10;
      if (filter === 'out') return matchesSearch && product.stockQuantity <= 0;
      return matchesSearch;
    })
    .sort((a, b) => a.stockQuantity - b.stockQuantity);

  const lowStockCount = products.filter(p => p.stockQuantity <= 10).length;
  const outOfStockCount = products.filter(p => p.stockQuantity <= 0).length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading inventory...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-500 mt-1">Monitor and manage stock levels</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500 w-80"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Products</option>
            <option value="low">Low Stock (≤10)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{products.length}</p>
        </div>
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
          <p className="text-sm text-amber-600">Low Stock Items</p>
          <p className="text-4xl font-bold text-amber-700 mt-2">{lowStockCount}</p>
        </div>
        <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
          <p className="text-sm text-red-600">Out of Stock</p>
          <p className="text-4xl font-bold text-red-700 mt-2">{outOfStockCount}</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-5 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Current Inventory</h3>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} items shown
          </span>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Product</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Category</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Current Stock</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Status</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const isLow = product.stockQuantity <= 10;
              const isOut = product.stockQuantity <= 0;

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-2xl"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-600 capitalize">
                    {product.categorySlug?.replace('-', ' ') || '—'}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={product.stockQuantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value);
                          if (!isNaN(newQty)) updateStock(product.id, newQty);
                        }}
                        className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-center focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-xs text-gray-400">units</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-block px-4 py-1.5 text-xs font-semibold rounded-2xl ${
                      isOut 
                        ? 'bg-red-100 text-red-700' 
                        : isLow 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStock(product.id, product.stockQuantity + 1)}
                        className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-600"
                      >
                        <IconPlus size={18} />
                      </button>
                      <button
                        onClick={() => updateStock(product.id, Math.max(0, product.stockQuantity - 1))}
                        className="p-2 hover:bg-red-50 rounded-xl text-red-500"
                      >
                        <IconMinus size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No products found matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;
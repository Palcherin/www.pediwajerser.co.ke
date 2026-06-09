import React, { useState, useEffect } from 'react';
import { IconUsers, IconSearch, IconEye, IconBan, IconUserCheck } from '@tabler/icons-react';

const API_BASE = 'http://localhost:5000/api';

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setCustomers(data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = 
        customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase());
      
      if (statusFilter === 'active') return matchesSearch && customer.isActive !== false;
      if (statusFilter === 'inactive') return matchesSearch && customer.isActive === false;
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive !== false).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-500 mt-1">Manage and monitor your customer base</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <IconSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 border border-gray-200 rounded-2xl px-5 py-3 text-sm w-80 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-4xl font-bold text-gray-900 mt-3">{totalCustomers}</p>
        </div>
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
          <p className="text-sm text-emerald-600">Active Customers</p>
          <p className="text-4xl font-bold text-emerald-700 mt-3">{activeCustomers}</p>
        </div>
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
          <p className="text-sm text-amber-600">New This Month</p>
          <p className="text-4xl font-bold text-amber-700 mt-3">
            {customers.filter(c => {
              const date = new Date(c.createdAt);
              return date.getMonth() === new Date().getMonth();
            }).length}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-5 border-b bg-gray-50">
          <h3 className="font-semibold">All Customers ({filteredCustomers.length})</h3>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Customer</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Contact</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Joined</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Status</th>
              <th className="text-left px-8 py-4 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-2xl flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-400">ID: {customer.id?.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-gray-700">{customer.email}</p>
                  {customer.phone && <p className="text-xs text-gray-400">{customer.phone}</p>}
                </td>
                <td className="px-8 py-5 text-gray-500 text-sm">
                  {new Date(customer.createdAt).toLocaleDateString('en-KE')}
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex px-4 py-1 text-xs font-semibold rounded-2xl ${
                    customer.isActive !== false 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {customer.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <IconEye size={18} />
                      View
                    </button>
                    <button 
                      onClick={() => alert(`Toggle status for ${customer.name}`)}
                      className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      {customer.isActive !== false ? <IconBan size={18} /> : <IconUserCheck size={18} />}
                      {customer.isActive !== false ? 'Ban' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No customers found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManager;
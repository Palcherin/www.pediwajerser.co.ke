import React, { useState, useEffect } from 'react';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconUsers, 
  IconShoppingCart, 
  IconCurrencyDollar 
} from '@tabler/icons-react';

const AnalyticsManager = () => {
  const [dateRange, setDateRange] = useState('30'); // days
  const [loading, setLoading] = useState(false);

  // Mock data (replace with real API calls later)
  const analytics = {
    totalRevenue: 1248750,
    revenueChange: 14.8,
    totalOrders: 1843,
    ordersChange: -3.2,
    avgOrderValue: 678,
    customers: 12450,
    newCustomers: 342,
  };

  const topProducts = [
    { name: "Air Jordan 1 Retro", sales: 124, revenue: 1240000 },
    { name: "Manchester United 24/25 Kit", sales: 98, revenue: 980000 },
    { name: "Nike Phantom GX", sales: 87, revenue: 695000 },
    { name: "Adidas Predator Elite", sales: 65, revenue: 520000 },
  ];

  const monthlyRevenue = [
    { month: "Jan", revenue: 450000 },
    { month: "Feb", revenue: 520000 },
    { month: "Mar", revenue: 480000 },
    { month: "Apr", revenue: 610000 },
    { month: "May", revenue: 580000 },
    { month: "Jun", revenue: 720000 },
    { month: "Jul", revenue: 850000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 mt-1">Performance overview & insights</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="180">Last 6 months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                KSh {analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-emerald-500">
              <IconCurrencyDollar size={32} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-emerald-600 text-sm font-medium">
            <IconTrendingUp size={16} />
            +{analytics.revenueChange}% from last period
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalOrders}</p>
            </div>
            <div className="text-blue-500">
              <IconShoppingCart size={32} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-red-600 text-sm font-medium">
            <IconTrendingDown size={16} />
            {analytics.ordersChange}% from last period
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                KSh {analytics.avgOrderValue}
              </p>
            </div>
            <div className="text-purple-500">
              <IconCurrencyDollar size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.customers.toLocaleString()}
              </p>
            </div>
            <div className="text-amber-500">
              <IconUsers size={32} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-emerald-600 text-sm font-medium">
            <IconTrendingUp size={16} />
            +{analytics.newCustomers} new this month
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8">
          <h3 className="font-semibold text-lg mb-6">Revenue Trend</h3>
          <div className="h-80 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl">
            <div className="text-center">
              <p className="text-gray-400 mb-2">📈 Revenue Chart</p>
              <p className="text-sm text-gray-500">Integrate Recharts or Chart.js here</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8">
          <h3 className="font-semibold text-lg mb-6">Top Selling Products</h3>
          <div className="space-y-5">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
                    👟
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    KSh {product.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-4">📊 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-emerald-100 text-sm">Best Performing Category</p>
            <p className="text-2xl font-bold mt-1">Retro Kits</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Peak Sales Day</p>
            <p className="text-2xl font-bold mt-1">Saturday</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Conversion Rate</p>
            <p className="text-2xl font-bold mt-1">3.8%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;
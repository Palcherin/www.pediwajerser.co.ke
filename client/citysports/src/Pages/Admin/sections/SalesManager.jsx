import React, { useState } from 'react';
import { 
  IconCurrencyDollar, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconCalendar 
} from '@tabler/icons-react';

const SalesManager = () => {
  const [period, setPeriod] = useState('monthly'); // daily, weekly, monthly

  // Mock Data (Replace with real API data later)
  const salesData = {
    totalSales: 2847500,
    salesChange: 12.5,
    totalOrders: 1843,
    avgOrderValue: 1545,
    topCategory: "Retro Kits",
  };

  const monthlySales = [
    { month: "Jan", sales: 420000, orders: 245 },
    { month: "Feb", sales: 510000, orders: 289 },
    { month: "Mar", sales: 480000, orders: 267 },
    { month: "Apr", sales: 650000, orders: 342 },
    { month: "May", sales: 720000, orders: 398 },
    { month: "Jun", sales: 890000, orders: 467 },
    { month: "Jul", sales: 1120000, orders: 521 },
  ];

  const topProducts = [
    { name: "Air Jordan 1 Retro High", sales: 124, revenue: 1240000 },
    { name: "Manchester United Home Kit 24/25", sales: 98, revenue: 980000 },
    { name: "Nike Mercurial Vapor", sales: 87, revenue: 695000 },
    { name: "Adidas Samba OG", sales: 76, revenue: 608000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Sales Management</h2>
          <p className="text-gray-500 mt-1">Track revenue, performance & trends</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-2xl overflow-hidden">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-3 text-sm font-medium transition-all ${
                  period === p 
                    ? 'bg-emerald-600 text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button className="bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            <IconCalendar size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-7 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                KSh {salesData.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="text-emerald-500">
              <IconCurrencyDollar size={40} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-600">
            <IconTrendingUp size={18} />
            <span className="font-medium">+{salesData.salesChange}%</span>
            <span className="text-xs text-gray-400">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">{salesData.totalOrders}</p>
            </div>
            <div className="text-blue-500">
              <IconTrendingUp size={40} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">This {period}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                KSh {salesData.avgOrderValue}
              </p>
            </div>
            <div className="text-purple-500">
              <IconCurrencyDollar size={40} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Best Category</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">{salesData.topCategory}</p>
            </div>
            <div className="text-amber-500 text-4xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold">Sales Trend ({period})</h3>
          <span className="text-sm text-gray-400">July 2025</span>
        </div>

        <div className="h-96 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <div className="text-center">
            <p className="text-6xl mb-4">📈</p>
            <p className="text-gray-400">Revenue Trend Chart</p>
            <p className="text-sm text-gray-500 mt-2">Integrate Recharts or Chart.js here</p>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold mb-6">Top Selling Products</h3>
        <div className="space-y-5">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl">
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

      {/* Sales Insights */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-6">💡 Sales Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-emerald-100">Peak Sales Day</p>
            <p className="text-3xl font-bold mt-2">Saturday</p>
            <p className="text-sm text-emerald-200 mt-1">Highest average revenue</p>
          </div>
          <div>
            <p className="text-emerald-100">Best Performing Product</p>
            <p className="text-3xl font-bold mt-2">Air Jordan 1 Retro</p>
            <p className="text-sm text-emerald-200 mt-1">124 units sold this month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesManager;
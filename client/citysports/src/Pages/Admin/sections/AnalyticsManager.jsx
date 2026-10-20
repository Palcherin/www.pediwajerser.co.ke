import React, { useState, useEffect, useCallback } from 'react';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconShoppingCart,
  IconCurrencyDollar
} from '@tabler/icons-react';

const API = 'https://api.pediwajersey.co.ke';

// NOTE: assumes the admin JWT is stored in localStorage under 'token',
// matching the pattern used elsewhere in the admin dashboard (OrdersManager,
// ProductsManager, etc). Adjust the key below if yours is named differently.
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AnalyticsManager = () => {
  const [dateRange, setDateRange] = useState('30'); // days
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    newCustomers: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [insights, setInsights] = useState({
    bestCategory: null,
    peakSalesDay: null,
    bestProduct: null,
    bestProductSales: null,
    conversionRate: null,
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, trendRes, productsRes, insightsRes] = await Promise.all([
        fetch(`${API}/api/analytics/overview?days=${dateRange}`, { headers: authHeaders() }),
        fetch(`${API}/api/analytics/revenue-trend?days=${dateRange}`, { headers: authHeaders() }),
        fetch(`${API}/api/analytics/top-products?days=${dateRange}&limit=4`, { headers: authHeaders() }),
        fetch(`${API}/api/analytics/insights?days=${dateRange}`, { headers: authHeaders() }),
      ]);

      if (!overviewRes.ok || !trendRes.ok || !productsRes.ok || !insightsRes.ok) {
        throw new Error('Failed to load analytics data');
      }

      const [overviewData, trendData, productsData, insightsData] = await Promise.all([
        overviewRes.json(),
        trendRes.json(),
        productsRes.json(),
        insightsRes.json(),
      ]);

      setAnalytics(overviewData.data);
      setRevenueTrend(trendData.data);
      setTopProducts(productsData.data);
      setInsights(insightsData.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const maxRevenue = Math.max(1, ...revenueTrend.map((r) => r.revenue));

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading analytics…</div>
      ) : (
        <>
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
              <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${analytics.revenueChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {analytics.revenueChange >= 0 ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
                {analytics.revenueChange >= 0 ? '+' : ''}{analytics.revenueChange}% from last period
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
              <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${analytics.ordersChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {analytics.ordersChange >= 0 ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
                {analytics.ordersChange >= 0 ? '+' : ''}{analytics.ordersChange}% from last period
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    KSh {analytics.avgOrderValue.toLocaleString()}
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
                    {analytics.totalCustomers.toLocaleString()}
                  </p>
                </div>
                <div className="text-amber-500">
                  <IconUsers size={32} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-emerald-600 text-sm font-medium">
                <IconTrendingUp size={16} />
                +{analytics.newCustomers} new this period
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend — lightweight CSS bar chart, no extra dependency */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8">
              <h3 className="font-semibold text-lg mb-6">Revenue Trend</h3>
              {revenueTrend.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
                  No revenue data for this period.
                </div>
              ) : (
                <div className="h-80 flex items-end gap-2">
                  {revenueTrend.map((point, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div
                        className="w-full bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-600 relative"
                        style={{ height: `${Math.max(4, (point.revenue / maxRevenue) * 100)}%` }}
                        title={`KSh ${point.revenue.toLocaleString()}`}
                      />
                      <span className="text-[10px] text-gray-400 mt-2 whitespace-nowrap">{point.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8">
              <h3 className="font-semibold text-lg mb-6">Top Selling Products</h3>
              {topProducts.length === 0 ? (
                <p className="text-gray-400 text-sm">No sales recorded for this period.</p>
              ) : (
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
              )}
            </div>
          </div>

          {/* Summary Insights */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-4">📊 Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-emerald-100 text-sm">Best Performing Category</p>
                <p className="text-2xl font-bold mt-1">{insights.bestCategory || '—'}</p>
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Peak Sales Day</p>
                <p className="text-2xl font-bold mt-1">{insights.peakSalesDay || '—'}</p>
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {insights.conversionRate !== null ? `${insights.conversionRate}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsManager;
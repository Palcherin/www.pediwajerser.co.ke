import React, { useState, useEffect, useCallback } from 'react';
import {
  IconCurrencyDollar,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar
} from '@tabler/icons-react';

const API = 'https://api.pediwajersey.co.ke';

// NOTE: assumes the admin JWT is stored in localStorage under 'token',
// matching the pattern used elsewhere in the admin dashboard. Adjust the
// key below if yours is named differently.
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Map the daily/weekly/monthly toggle to a lookback window + bucket size
// for the /api/analytics/revenue-trend endpoint.
const PERIOD_CONFIG = {
  daily: { days: 30, groupBy: 'day' },
  weekly: { days: 90, groupBy: 'week' },
  monthly: { days: 365, groupBy: 'month' },
};

const SalesManager = () => {
  const [period, setPeriod] = useState('monthly'); // daily, weekly, monthly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [salesData, setSalesData] = useState({
    totalSales: 0,
    salesChange: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topCategory: '—',
  });
  const [trend, setTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [insights, setInsights] = useState({
    peakSalesDay: null,
    bestProduct: null,
    bestProductSales: null,
  });

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { days, groupBy } = PERIOD_CONFIG[period];

    try {
      const [overviewRes, trendRes, productsRes, insightsRes] = await Promise.all([
        fetch(`${API}/api/analytics/overview?days=${days}`, { headers: authHeaders() }),
        fetch(`${API}/api/analytics/revenue-trend?days=${days}&groupBy=${groupBy}`, { headers: authHeaders() }),
        fetch(`${API}/api/analytics/top-products?days=${days}&limit=4`, { headers: authHeaders() }),
        fetch(`${API}/api/analytics/insights?days=${days}`, { headers: authHeaders() }),
      ]);

      if (!overviewRes.ok || !trendRes.ok || !productsRes.ok || !insightsRes.ok) {
        throw new Error('Failed to load sales data');
      }

      const [overviewData, trendData, productsData, insightsData] = await Promise.all([
        overviewRes.json(),
        trendRes.json(),
        productsRes.json(),
        insightsRes.json(),
      ]);

      setSalesData({
        totalSales: overviewData.data.totalRevenue,
        salesChange: overviewData.data.revenueChange,
        totalOrders: overviewData.data.totalOrders,
        avgOrderValue: overviewData.data.avgOrderValue,
        topCategory: insightsData.data.bestCategory || '—',
      });
      setTrend(trendData.data);
      setTopProducts(productsData.data);
      setInsights(insightsData.data);
    } catch (err) {
      console.error('Error loading sales data:', err);
      setError('Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const maxRevenue = Math.max(1, ...trend.map((t) => t.revenue));

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading sales data…</div>
      ) : (
        <>
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
              <div className={`flex items-center gap-2 mt-4 ${salesData.salesChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {salesData.salesChange >= 0 ? <IconTrendingUp size={18} /> : <IconTrendingDown size={18} />}
                <span className="font-medium">{salesData.salesChange >= 0 ? '+' : ''}{salesData.salesChange}%</span>
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
              <p className="text-xs text-gray-400 mt-4">This {period.replace('ly', '')} period</p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Average Order Value</p>
                  <p className="text-4xl font-bold text-gray-900 mt-3">
                    KSh {salesData.avgOrderValue.toLocaleString()}
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

          {/* Sales Trend — lightweight CSS bar chart, no extra dependency */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold">Sales Trend ({period})</h3>
            </div>

            {trend.length === 0 ? (
              <div className="h-96 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-400 text-sm">
                No sales data for this period.
              </div>
            ) : (
              <div className="h-96 flex items-end gap-2 px-2">
                {trend.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <span className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      KSh {point.revenue.toLocaleString()}
                    </span>
                    <div
                      className="w-full bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-600"
                      style={{ height: `${Math.max(4, (point.revenue / maxRevenue) * 100)}%` }}
                    />
                    <span className="text-[10px] text-gray-400 mt-2 whitespace-nowrap">{point.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <h3 className="text-xl font-semibold mb-6">Top Selling Products</h3>
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">No sales recorded for this period.</p>
            ) : (
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
            )}
          </div>

          {/* Sales Insights */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-6">💡 Sales Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-emerald-100">Peak Sales Day</p>
                <p className="text-3xl font-bold mt-2">{insights.peakSalesDay || '—'}</p>
                <p className="text-sm text-emerald-200 mt-1">Highest average revenue</p>
              </div>
              <div>
                <p className="text-emerald-100">Best Performing Product</p>
                <p className="text-3xl font-bold mt-2">{insights.bestProduct || '—'}</p>
                <p className="text-sm text-emerald-200 mt-1">
                  {insights.bestProductSales ? `${insights.bestProductSales} units sold this period` : ''}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesManager;
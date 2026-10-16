import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Users, Eye, Calendar, TrendingUp,
  Globe, Clock, BarChart3, Activity,
  Smartphone, Monitor, Link, MapPin,
  ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell, BarChart, Bar
} from 'recharts';

const VisitorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7d'); // '7d', '30d', '90d'
  const { token } = useSelector((state) => state.auth);

  const fetchData = async (range) => {
    setLoading(true);
    try {
      const [statsRes, visitorsRes] = await Promise.all([
        fetch(`/api/admin/visitor-stats?range=${range}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/visitors?page=1&limit=20&range=${range}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!statsRes.ok || !visitorsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const statsData = await statsRes.json();
      const visitorsData = await visitorsRes.json();

      setStats(statsData);
      setVisitors(visitorsData.visitors || []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [token, dateRange]);

  // Helper to format numbers with commas
  const formatNumber = (num) => num?.toLocaleString() ?? 0;

  // Colours for pie charts
  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold">⚠️ Unable to load analytics</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-sm mt-2">Make sure your backend is running and the visit tracking middleware is active.</p>
      </div>
    );
  }

  if (!stats || stats.totalVisits === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-700">
        <p className="font-semibold">📊 No visitor data yet</p>
        <p className="text-sm mt-1">Start by visiting your website – visits will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">User Analytics</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* ---------- STATS CARDS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Visits */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Total Visits</p>
              <p className="text-xl font-bold text-slate-800">{formatNumber(stats.totalVisits)}</p>
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Unique</p>
              <p className="text-xl font-bold text-slate-800">{formatNumber(stats.uniqueVisitors)}</p>
            </div>
          </div>
        </div>

        {/* Today's Visits */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Today</p>
              <p className="text-xl font-bold text-slate-800">{formatNumber(stats.todayVisits)}</p>
            </div>
          </div>
        </div>

        {/* Avg. Session Duration (new) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Avg. Session</p>
              <p className="text-xl font-bold text-slate-800">
                {stats.avgSessionDuration ? `${Math.round(stats.avgSessionDuration / 60)}m` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Bounce Rate (new) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-lg">
              <Activity className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Bounce Rate</p>
              <p className="text-xl font-bold text-slate-800">
                {stats.bounceRate ? `${stats.bounceRate.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Second row of cards: pages/visit, returning visitors, devices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Pages / Visit</p>
          <p className="text-xl font-bold text-slate-800">
            {stats.totalVisits > 0 ? (stats.totalVisits / stats.uniqueVisitors).toFixed(1) : 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Returning %</p>
          <p className="text-xl font-bold text-slate-800">
            {stats.returningRatio ? `${(stats.returningRatio * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Mobile / Desktop</p>
          <p className="text-xl font-bold text-slate-800">
            {stats.deviceBreakdown ? `${stats.deviceBreakdown.mobile || 0} / ${stats.deviceBreakdown.desktop || 0}` : '—'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Top Country</p>
          <p className="text-xl font-bold text-slate-800 truncate">
            {stats.topCountries?.[0]?.country || '—'}
          </p>
        </div>
      </div>

      {/* ---------- CHARTS SECTION ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Daily Visits
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown Pie Chart (new) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Device & OS
          </h3>
          <div className="h-64 flex items-center justify-center">
            {stats.deviceBreakdown && Object.keys(stats.deviceBreakdown).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(stats.deviceBreakdown).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {Object.entries(stats.deviceBreakdown).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">No device data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages and Top Referrers (new) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Top Pages
          </h3>
          <ul className="space-y-2">
            {stats.topPages && stats.topPages.length > 0 ? (
              stats.topPages.slice(0, 5).map((p, i) => (
                <li key={i} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                  <span className="text-slate-600 truncate max-w-[200px]">{p._id}</span>
                  <span className="bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full text-xs">
                    {p.count} views
                  </span>
                </li>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No pages visited yet.</p>
            )}
          </ul>
        </div>

        {/* Top Referrers (new) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
            <Link className="w-4 h-4" /> Top Referrers
          </h3>
          <ul className="space-y-2">
            {stats.topReferrers && stats.topReferrers.length > 0 ? (
              stats.topReferrers.slice(0, 5).map((r, i) => (
                <li key={i} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                  <span className="text-slate-600 truncate max-w-[200px]">{r._id || 'Direct'}</span>
                  <span className="bg-green-50 text-green-600 font-medium px-3 py-1 rounded-full text-xs">
                    {r.count} visits
                  </span>
                </li>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No referrer data yet.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Geograph distribution (new) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Visitor Locations
        </h3>
        <div className="flex flex-wrap gap-3">
          {stats.topCountries && stats.topCountries.length > 0 ? (
            stats.topCountries.slice(0, 6).map((c, i) => (
              <span key={i} className="bg-slate-100 px-3 py-1.5 rounded-full text-sm text-slate-700 flex items-center gap-1">
                <span>{c.country}</span>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{c.count}</span>
              </span>
            ))
          ) : (
            <p className="text-slate-400 text-sm">No location data available.</p>
          )}
        </div>
      </div>

      {/* ---------- VISITOR TABLE (with pagination) ---------- */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Recent Visitors
        </h3>
        <div className="overflow-x-auto">
          {visitors.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">First Visit</th>
                  <th className="px-4 py-3">Last Visit</th>
                  <th className="px-4 py-3">Pages</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{v.ip}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {v.deviceType || '—'} / {v.os || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">{v.country || '—'}</td>
                    <td className="px-4 py-3">{new Date(v.firstVisit).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(v.lastVisit).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-semibold">{v.pageCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-sm py-4">No visitors recorded yet.</p>
          )}
        </div>
        {/* Pagination placeholder – implement if needed */}
        <div className="flex justify-end mt-3 text-sm text-slate-500">
          Showing 20 of {stats?.totalVisitors ?? 0}
        </div>
      </div>
    </div>
  );
};

export default VisitorAnalytics;
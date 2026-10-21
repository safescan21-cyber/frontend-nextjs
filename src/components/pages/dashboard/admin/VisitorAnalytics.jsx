import DangerConfirm from '../../../ui/DangerConfirm';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import getBaseURL from '../../../../utlis/baseURL';
import toast from 'react-hot-toast';
import {
  Users, Eye, Calendar, TrendingUp,
  Globe, Clock, BarChart3, Activity,
  Smartphone, Monitor, Link, MapPin,
  ArrowUpRight, ArrowDownRight, Filter, Trash2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart,
  Pie, Cell, BarChart, Bar
} from 'recharts';

// Admin API calls: the login token is saved in localStorage at sign-in
const authHeaders = (reduxToken) => {
  let token = reduxToken;
  try { token = token || localStorage.getItem('token'); } catch { /* storage blocked */ }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const VisitorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7d'); // '7d', '30d', '90d'
  const [who, setWho] = useState(''); // '' everyone, 'users' logged-in, 'guests'
  const [visitorTotal, setVisitorTotal] = useState(0);
  const [openRow, setOpenRow] = useState(null); // visitor whose pages are expanded
  const { token } = useSelector((state) => state.auth);

  const fetchData = async (range, whoFilter = '') => {
    setLoading(true);
    try {
      const [statsRes, visitorsRes] = await Promise.all([
        fetch(`${getBaseURL()}/api/admin/visitor-stats?range=${range}`, {
          headers: authHeaders(token), credentials: 'include',
        }),
        fetch(`${getBaseURL()}/api/admin/visitors?page=1&limit=50&range=${range}${whoFilter ? `&who=${whoFilter}` : ''}`, {
          headers: authHeaders(token), credentials: 'include',
        })
      ]);

      if (!statsRes.ok || !visitorsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const statsData = await statsRes.json();
      const visitorsData = await visitorsRes.json();

      setStats(statsData);
      setVisitors(visitorsData.visitors || []);
      setVisitorTotal(visitorsData.total || 0);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange, who);
  }, [token, dateRange, who]);

  // ── Selection for "Delete selected" ──
  const [selected, setSelected] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const selectAllRef = useRef(null);
  useEffect(() => { setSelected(new Set()); }, [visitors]); // new list → nothing selected
  const allSelected = visitors.length > 0 && visitors.every((v) => selected.has(v._id));
  const someSelected = selected.size > 0 && !allSelected;
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected; }, [someSelected]);
  const toggleOne = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visitors.map((v) => v._id)));

  // Every visit record, all dates (accounts, orders and Customer Insights stay)
  const deleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch(`${getBaseURL()}/api/admin/visitors/delete-all`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirm: 'DELETE ALL' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Delete failed (${res.status})`);
      toast.success(`Deleted all visitor data (${data.deleted} record${data.deleted === 1 ? '' : 's'})`);
      setConfirmAll(false);
      setSelected(new Set());
      fetchData(dateRange, who);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingAll(false);
    }
  };

  const deleteSelected = async () => {
    const chosen = visitors.filter((v) => selected.has(v._id));
    if (!chosen.length) return;
    const users = chosen.filter((v) => v.user).length;
    const msg =
      `Delete all visit records of ${chosen.length} selected visitor${chosen.length === 1 ? '' : 's'}?` +
      (users ? `\n\n${users} of them ${users === 1 ? 'is a logged-in customer' : 'are logged-in customers'}: every visit linked to their account will be removed too. Accounts and orders are not affected.` : '') +
      '\n\nThis cannot be undone.';
    if (!window.confirm(msg)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch(`${getBaseURL()}/api/admin/visitors/delete-many`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ visitorIds: chosen.map((v) => v._id), includeAccounts: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Delete failed (${res.status})`);
      toast.success(`Deleted ${data.deleted} visit record${data.deleted === 1 ? '' : 's'} from ${chosen.length} visitor${chosen.length === 1 ? '' : 's'}`);
      fetchData(dateRange, who);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  // Delete a visitor's records (for logged-in visitors: everything linked to their account)
  const [deletingId, setDeletingId] = useState(null);
  const deleteVisitor = async (v) => {
    const label = v.user ? `${v.user.name || 'this customer'} (${v.user.email})` : `this guest (${v.ip})`;
    const msg = v.user
      ? `Delete all visit records of ${label}?\n\nThis removes their visits from every browser they used. Their account and orders are not affected. This cannot be undone.`
      : `Delete all visit records of ${label}? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    setDeletingId(v._id);
    try {
      const res = await fetch(`${getBaseURL()}/api/admin/visitors/${encodeURIComponent(v._id)}${v.user ? '?account=1' : ''}`, {
        method: 'DELETE',
        headers: authHeaders(token),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Delete failed (${res.status})`);
      toast.success(`Deleted ${data.deleted} visit record${data.deleted === 1 ? '' : 's'}`);
      fetchData(dateRange, who);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

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
          <select
            value={who}
            onChange={(e) => setWho(e.target.value)}
            aria-label="Which visitors"
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Everyone</option>
            <option value="users">Logged-in users</option>
            <option value="guests">Guests</option>
          </select>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Updated: {new Date().toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => setConfirmAll(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-600 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete all visitor data
          </button>
        </div>
      </div>

      <DangerConfirm
        open={confirmAll}
        title="Delete all visitor data?"
        busy={deletingAll}
        onCancel={() => setConfirmAll(false)}
        onConfirm={deleteAll}
      >
        Every visit record is removed, for all dates, guests and logged-in users. The analytics start again from zero. Accounts, orders and Customer Insights are not affected. <strong>This cannot be undone.</strong>
      </DangerConfirm>

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
        {selected.size > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
            <span className="font-semibold text-red-800">{selected.size} selected</span>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> {bulkDeleting ? 'Deleting…' : 'Delete selected'}
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="text-slate-600 hover:underline">
              Clear
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          {visitors.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label={allSelected ? 'Unselect all visitors' : 'Select all visitors on this page'}
                      title="Select all"
                      className="h-4 w-4 cursor-pointer accent-red-600"
                    />
                  </th>
                  <th className="px-4 py-3">Visitor</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">First Visit</th>
                  <th className="px-4 py-3">Last Visit</th>
                  <th className="px-4 py-3">Pages visited</th>
                  <th className="px-4 py-3"><span className="sr-only">Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => {
                  const pages = (v.websitePages?.length ? v.websitePages : v.pages) || [];
                  const open = openRow === v._id;
                  return (
                    <tr key={v._id} className={`border-b border-slate-100 align-top transition-colors ${selected.has(v._id) ? 'bg-red-50/60' : 'hover:bg-slate-50'}`}>
                      <td className="w-10 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(v._id)}
                          onChange={() => toggleOne(v._id)}
                          aria-label={`Select ${v.user ? v.user.name || v.user.email : `guest ${v.ip}`}`}
                          className="h-4 w-4 cursor-pointer accent-red-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {v.user ? (
                          <div>
                            <p className="font-semibold text-slate-800">{v.user.name || 'Customer'}</p>
                            <a href={`mailto:${v.user.email}`} className="text-xs text-blue-600 hover:underline">{v.user.email}</a>
                          </div>
                        ) : (
                          <p className="text-slate-500">Guest</p>
                        )}
                        <p className="font-mono text-[11px] text-slate-400">{v.ip}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {v.device || '—'}<br />
                        <span className="text-slate-400">{[v.os, v.browser].filter(Boolean).join(' · ')}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(v.firstVisit).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(v.lastVisit).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">
                        {pages.length ? (
                          <>
                            <ul className="space-y-0.5">
                              {(open ? pages : pages.slice(0, 3)).map((pg) => (
                                <li key={pg} className="truncate max-w-[260px]" title={pg}>{pg}</li>
                              ))}
                            </ul>
                            {pages.length > 3 && (
                              <button type="button" onClick={() => setOpenRow(open ? null : v._id)} className="mt-1 text-blue-600 hover:underline">
                                {open ? 'Show less' : `+${pages.length - 3} more`}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">{v.pageCount} requests</p>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteVisitor(v)}
                          disabled={deletingId === v._id}
                          title={v.user ? "Delete this customer's visit records" : "Delete this guest's visit records"}
                          aria-label={`Delete visit records of ${v.user ? v.user.name || v.user.email : `guest ${v.ip}`}`}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-sm py-4">No visitors recorded yet.</p>
          )}
        </div>
        {/* Pagination placeholder – implement if needed */}
        <div className="flex justify-end mt-3 text-sm text-slate-500">
          Showing {visitors.length} of {formatNumber(visitorTotal)} visitors
        </div>
      </div>
    </div>
  );
};

export default VisitorAnalytics;
import React, { useState, useEffect } from 'react';
import { useLogoutUserMutation } from '../../../../redux/features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../../../redux/features/auth/authSlice';
import useOnlineCount from '../../../pages/useOnlineCount';
import { 
  Users, Eye, Calendar, TrendingUp, BarChart3, 
  Activity, Package, Globe, Clock 
} from 'lucide-react';

const navItems = [
  { path: '/dashboard/admin', label: 'Dashboard', icon: BarChart3 },
  { path: '/dashboard/add-product', label: 'Add Product', icon: Activity },
  { path: '/dashboard/manage-products', label: 'Manage Products', icon: Package },
  { path: '/dashboard/users', label: 'Users', icon: Users },
  { path: '/dashboard/manage-orders', label: 'Manage Orders', icon: Package },
  { path: '/dashboard/visitors', label: 'User Analytics', icon: TrendingUp },
];

// ─── User Analytics Component ──────────────────────────────────────────────
const UserAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, visitorsRes] = await Promise.all([
          fetch('/api/admin/visitor-stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/visitors?page=1&limit=20', {
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

    fetchData();
  }, [token]);

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">User Analytics</h2>
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Last updated: {new Date().toLocaleString()}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Total Visits</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalVisits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Unique Visitors</p>
              <p className="text-2xl font-bold text-slate-800">{stats.uniqueVisitors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Today's Visits</p>
              <p className="text-2xl font-bold text-slate-800">{stats.todayVisits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Pages/Visit</p>
              <p className="text-2xl font-bold text-slate-800">
                {stats.totalVisits > 0 ? (stats.totalVisits / stats.uniqueVisitors).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Last 7 Days
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {stats.dailyStats && stats.dailyStats.length > 0 ? (
            stats.dailyStats.map((day) => {
              const max = Math.max(...stats.dailyStats.map(d => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={day._id} className="text-center">
                  <div className="text-xs text-slate-500">{day._id}</div>
                  <div className="mt-1 h-16 bg-slate-100 rounded-lg relative">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-lg transition-all duration-500"
                      style={{ height: `${height}%`, maxHeight: '100%' }}
                    />
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-1">{day.count}</div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-400 text-sm col-span-7">No data for the last 7 days.</p>
          )}
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Top Pages
        </h3>
        <ul className="space-y-2">
          {stats.topPages && stats.topPages.length > 0 ? (
            stats.topPages.map((p, i) => (
              <li key={i} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                <span className="text-slate-600 truncate max-w-md">{p._id}</span>
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

      {/* Visitor Table */}
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
                  <th className="px-4 py-3">First Visit</th>
                  <th className="px-4 py-3">Last Visit</th>
                  <th className="px-4 py-3">Pages</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{v.ip}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{v.userAgent?.substring(0, 40)}…</td>
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
      </div>
    </div>
  );
};

// ─── Dashboard Overview ──────────────────────────────────────────────────
const DashboardOverview = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">Welcome, {user?.name || 'Admin'}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-blue-700">—</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <p className="text-green-600 text-sm font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-green-700">—</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <p className="text-purple-600 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-purple-700">—</p>
        </div>
      </div>
      <p className="text-slate-500 text-sm">Use the sidebar to manage products, orders, and users.</p>
    </div>
  );
};

// ─── Main Admin Dashboard ──────────────────────────────────────────────────
const AdminDMain = () => {
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onlineCount = useOnlineCount();
  const [activeSection, setActiveSection] = useState('Dashboard');

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'User Analytics':
        return <UserAnalytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* ─── Sidebar ─── */}
      <div className="w-64 bg-white shadow-lg flex flex-col justify-between p-6 h-full overflow-y-auto">
        <div>
          <div className="nav__logo">
            <Link to="/" className="text-2xl font-bold text-slate-800">
              Lebaba<span className="text-blue-600">.</span>
            </Link>
            <p className="text-xs italic text-slate-500">Admin dashboard</p>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-700">
              {onlineCount} {onlineCount === 1 ? 'user' : 'users'} online
            </span>
          </div>

          <hr className="mt-5" />
          <ul className="space-y-2 pt-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => setActiveSection(item.label)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                      activeSection === item.label
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <hr className="mb-3" />
          <button
            onClick={handleLogout}
            className="text-white bg-blue-600 hover:bg-blue-700 font-medium px-5 py-2 rounded-lg transition-colors w-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDMain;
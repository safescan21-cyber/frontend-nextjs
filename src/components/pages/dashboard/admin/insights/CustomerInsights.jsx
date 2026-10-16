import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Eye, Heart, ShoppingCart, UserCheck, X, Loader2, RefreshCw, Info, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import getBaseURL from '../../../../../utlis/baseURL';

const api = async (path, method = 'GET') => {
  let token = null;
  try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
  const res = await fetch(`${getBaseURL()}/api/insights${path}`, {
    method,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

const EVENT_LABEL = {
  page_view: 'visited',
  product_view: 'viewed',
  product_like: 'liked ❤️',
  product_unlike: 'removed like from',
  add_to_cart: 'added to cart 🛒',
  product_share: 'shared',
};

const Tile = ({ icon: Icon, label, value, tint }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-2xl font-bold text-gray-800">{Number(value || 0).toLocaleString('en-IN')}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

const ProductCell = ({ id, name, image }) => (
  <Link to={`/shop/${id}`} target="_blank" className="flex min-w-0 items-center gap-2 hover:text-blue-600">
    {image ? (
      <img src={image} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
    ) : (
      <span className="h-9 w-9 shrink-0 rounded bg-gray-100" />
    )}
    <span className="truncate">{name}</span>
  </Link>
);

// Deletes a customer's tracked activity (not their account or orders) after confirming
const deleteCustomerData = async (userId, label) => {
  const ok = window.confirm(
    `Delete all tracked activity for ${label}?\n\n` +
      'Pages and products they viewed, liked or added to cart will be removed from Customer Insights. ' +
      'Their account and orders are not affected. This cannot be undone.'
  );
  if (!ok) return false;
  try {
    const r = await api(`/customer/${userId}`, 'DELETE');
    toast.success(`Deleted ${r.deleted} activity record${r.deleted === 1 ? '' : 's'}`);
    return true;
  } catch (e) {
    toast.error(e.message);
    return false;
  }
};

// Deletes an anonymous visitor's tracked activity after confirming
const deleteVisitorData = async (visitorId, label) => {
  if (!window.confirm(`Delete all tracked activity for ${label}? This cannot be undone.`)) return false;
  try {
    const r = await api(`/visitor/${encodeURIComponent(visitorId)}`, 'DELETE');
    toast.success(`Deleted ${r.deleted} activity record${r.deleted === 1 ? '' : 's'}`);
    return true;
  } catch (e) {
    toast.error(e.message);
    return false;
  }
};

const CustomerDrawer = ({ userId, onClose, onDeleted }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const remove = async () => {
    setDeleting(true);
    const ok = await deleteCustomerData(userId, data?.customer?.name || data?.customer?.email || 'this customer');
    setDeleting(false);
    if (ok) onDeleted();
  };
  useEffect(() => {
    api(`/customer/${userId}`).then(setData).catch((e) => setError(e.message));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        aria-label="Customer details"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{data?.customer?.name || 'Customer'}</h2>
            <p className="text-sm text-gray-500">{data?.customer?.email}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {!data && !error && <p className="flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}

        {data && (
          <>
            <h3 className="mb-2 mt-2 font-semibold text-gray-800">❤️ Liked products ({data.liked.length})</h3>
            {data.liked.length ? (
              <ul className="mb-5 space-y-2">
                {data.liked.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between gap-2 text-sm">
                    <ProductCell id={p.productId} name={p.name} image={p.image} />
                    <span className="shrink-0 text-xs text-gray-400">{ago(p.likedAt)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mb-5 text-sm text-gray-500">No likes yet.</p>}

            <h3 className="mb-2 font-semibold text-gray-800">👀 Most viewed</h3>
            {data.viewed.length ? (
              <ul className="mb-5 space-y-2">
                {data.viewed.slice(0, 15).map((p) => (
                  <li key={p.productId} className="flex items-center justify-between gap-2 text-sm">
                    <ProductCell id={p.productId} name={p.name} image={p.image} />
                    <span className="shrink-0 text-xs text-gray-500">
                      {p.views} view{p.views === 1 ? '' : 's'}{p.cartAdds ? ` · ${p.cartAdds} cart` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="mb-5 text-sm text-gray-500">No product views yet.</p>}

            <h3 className="mb-2 font-semibold text-gray-800">Recent activity</h3>
            <ul className="space-y-1.5 text-sm">
              {data.timeline.slice(0, 60).map((e, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-gray-700">
                    {EVENT_LABEL[e.type]} <span className="font-medium">{e.productName || e.path}</span>
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">{ago(e.at)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete this customer&apos;s tracking data
              </button>
              <p className="mt-1 text-xs text-gray-500">Removes their viewed, liked and cart activity. Their account and orders stay.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

const CustomerInsights = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    api(`/summary?days=${days}`)
      .then((d) => { if (alive) { setData(d); setError(''); } })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [days, reloadKey]);

  const load = () => { setLoading(true); setReloadKey((k) => k + 1); };
  const changeDays = (d) => { setLoading(true); setDays(d); };

  const t = data?.totals || {};

  return (
    <div className="px-4 pb-6 pt-24 md:px-6 xl:pt-32">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer insights</h1>
          <p className="text-sm text-gray-500">Who visits your site and which products they look at and like.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 text-sm">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => changeDays(d)}
                className={`px-3 py-1.5 ${days === d ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {d} days
              </button>
            ))}
          </div>
          <button type="button" onClick={load} aria-label="Refresh" className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <p className="mb-5 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Only visitors who accepted analytics cookies are counted. Names appear for customers who were logged in.
      </p>

      {error && <p className="mb-4 text-red-600">Could not load insights: {error}</p>}

      {data && (
        <div className={loading ? 'opacity-60' : ''}>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Tile icon={Users} label="Visitors" value={t.visitors} tint="bg-blue-100 text-blue-700" />
            <Tile icon={UserCheck} label="Logged-in customers" value={t.customers} tint="bg-indigo-100 text-indigo-700" />
            <Tile icon={Eye} label="Page views" value={t.pageViews} tint="bg-slate-100 text-slate-700" />
            <Tile icon={Eye} label="Product views" value={t.productViews} tint="bg-amber-100 text-amber-700" />
            <Tile icon={Heart} label="Product likes" value={t.likes} tint="bg-rose-100 text-rose-700" />
            <Tile icon={ShoppingCart} label="Added to cart" value={t.cartAdds} tint="bg-green-100 text-green-700" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-800">Most popular products</h2>
              {data.topProducts.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500">
                        <th className="pb-2">Product</th>
                        <th className="pb-2 text-right">Views</th>
                        <th className="pb-2 text-right">People</th>
                        <th className="pb-2 text-right">❤️</th>
                        <th className="pb-2 text-right">🛒</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((p) => (
                        <tr key={p.productId} className="border-t border-gray-100">
                          <td className="max-w-[220px] py-2 pr-2"><ProductCell id={p.productId} name={p.name} image={p.image} /></td>
                          <td className="py-2 text-right">{p.views}</td>
                          <td className="py-2 text-right">{p.uniqueViewers}</td>
                          <td className="py-2 text-right">{p.likes}</td>
                          <td className="py-2 text-right">{p.cartAdds}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-gray-500">No product activity in this period yet.</p>}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-800">Customers who visited</h2>
              {data.customers.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500">
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Last seen</th>
                        <th className="pb-2 text-right">Products viewed</th>
                        <th className="pb-2 text-right">🛒</th>
                        <th className="pb-2"><span className="sr-only">Delete</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.customers.map((c) => (
                        <tr
                          key={c.userId}
                          onClick={() => setSelected(c.userId)}
                          className="cursor-pointer border-t border-gray-100 hover:bg-blue-50"
                        >
                          <td className="py-2 pr-2">
                            <p className="font-medium text-gray-800">{c.name}</p>
                            <p className="truncate text-xs text-gray-500">{c.email}</p>
                          </td>
                          <td className="whitespace-nowrap py-2 text-gray-600">{ago(c.lastSeen)}</td>
                          <td className="py-2 text-right">{c.productsViewed}</td>
                          <td className="py-2 text-right">{c.cartAdds}</td>
                          <td className="py-2 pl-2 text-right">
                            <button
                              type="button"
                              title="Delete this customer's tracking data"
                              aria-label={`Delete tracking data for ${c.name || c.email}`}
                              onClick={async (ev) => {
                                ev.stopPropagation();
                                if (await deleteCustomerData(c.userId, c.name || c.email || 'this customer')) load();
                              }}
                              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-gray-400">Click a customer to see what they liked and viewed.</p>
                </div>
              ) : <p className="text-sm text-gray-500">No logged-in customers in this period yet.</p>}
            </section>
          </div>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-800">Live activity</h2>
            {data.recent.length ? (
              <ul className="space-y-1.5 text-sm">
                {data.recent.map((e, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate text-gray-700">
                      {e.userId ? (
                        <button type="button" onClick={() => setSelected(e.userId)} className="font-medium text-blue-700 hover:underline">{e.who}</button>
                      ) : <span className="text-gray-500">{e.who}</span>}{' '}
                      {EVENT_LABEL[e.type]} <span className="font-medium">{e.productName || e.path}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                      {ago(e.at)}
                      {!e.userId && e.visitorId && (
                        <button
                          type="button"
                          title="Delete this visitor's tracking data"
                          aria-label={`Delete tracking data for ${e.who}`}
                          onClick={async () => { if (await deleteVisitorData(e.visitorId, e.who)) load(); }}
                          className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-500">No activity yet.</p>}
          </section>
        </div>
      )}

      {selected && (
        <CustomerDrawer
          userId={selected}
          onClose={() => setSelected(null)}
          onDeleted={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
};

export default CustomerInsights;

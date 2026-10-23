'use client';
import { formTool } from '../webmcp/webmcpTools';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle, Truck, Home, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import Seo from '../Seo';

const STEPS = [
  { key: 'confirmed', label: 'Order placed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Dispatched', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const STOPPED = {
  cancelled: 'This order was cancelled.',
  payment_failed: 'Payment for this order failed.',
  refunded: 'This order was refunded.',
};

const PAYMENT_LABELS = { cod: 'Cash on Delivery', card: 'Card', upi: 'UPI', wallet: 'Wallet' };

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async (id) => {
    const clean = id.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your order ID.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`${getBaseURL()}/api/orders/track/${encodeURIComponent(clean)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not find this order.');
      setOrder(data);
      setSearchParams({ id: clean }, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Support links like /track-order?id=ORD-123
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) lookup(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;
  const stopped = order && STOPPED[order.status];

  return (
    <>
      <Seo
        title="Track Your Order"
        description="Track your Food Pharma Machinery order with your order ID. See order status, dispatch details and courier tracking link."
        path="/track-order"
      />
      <div className="bg-gray-50 min-h-screen pt-6 pb-28 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Track your order</h1>
          <p className="text-slate-600 mb-6">
            Enter the order ID from your confirmation email or invoice (for example <span className="font-mono">ORD-1760000000000-123</span>).
          </p>

          <form
            {...formTool('trackOrder')}
            onSubmit={(e) => {
              e.preventDefault();
              lookup(orderId);
            }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <label htmlFor="track-order-id" className="sr-only">Order ID</label>
            <input
              id="track-order-id"
              name="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ORD-…"
              autoComplete="off"
              autoCapitalize="characters"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Track
            </button>
          </form>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {order && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Order ID</p>
                  <p className="font-mono font-semibold text-slate-800 break-all">{order.orderId}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Placed on</p>
                  <p className="font-semibold text-slate-800">{formatDate(order.orderDate)}</p>
                </div>
              </div>

              {stopped ? (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-lg px-4 py-3 mb-6">
                  <XCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">{stopped}</span>
                </div>
              ) : (
                <ol className="mb-6">
                  {STEPS.map((step, i) => {
                    const done = i <= stepIndex;
                    const Icon = step.icon;
                    const date =
                      step.key === 'confirmed' ? formatDate(order.orderDate)
                        : step.key === 'shipped' ? formatDate(order.dispatchedAt)
                        : null;
                    return (
                      <li key={step.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className={`flex items-center justify-center w-9 h-9 rounded-full ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Icon className="w-5 h-5" />
                          </span>
                          {i < STEPS.length - 1 && (
                            <span className={`w-0.5 flex-1 min-h-[24px] ${i < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-5">
                          <p className={`font-semibold ${done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                          {done && date && <p className="text-sm text-slate-500">{date}</p>}
                          {step.key === 'delivered' && !done && order.estimatedDelivery && (
                            <p className="text-sm text-slate-500">Expected by {formatDate(order.estimatedDelivery)}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mb-6 transition-colors"
                >
                  <Truck className="w-5 h-5" />
                  Track parcel with courier
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <h2 className="font-semibold text-slate-800 mb-3">Items</h2>
              <ul className="divide-y divide-gray-100 mb-4">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 py-3">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-12 h-12 rounded object-cover border border-gray-100" />
                    ) : (
                      <span className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </span>
                    )}
                    <span className="flex-1 text-slate-700">{item.name}</span>
                    <span className="text-slate-500 text-sm">× {item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap justify-between gap-2 text-sm border-t border-gray-100 pt-4">
                <span className="text-slate-600">
                  Payment: {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} ({order.paymentStatus})
                </span>
                <span className="font-bold text-slate-800">Total: {inr(order.totalAmount)}</span>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500 mt-6">
            Need help with your order? <Link to="/contact" className="text-amber-600 hover:underline">Contact us</Link>.
          </p>
        </div>
      </div>
    </>
  );
};

export default TrackOrder;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import getBaseUrl from '../../utlis/baseURL';

const RESEND_SECONDS = 60;

const apiError = (err, fallback) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err && !err.response) return 'Could not reach the server. Check your connection.';
  return fallback;
};

/**
 * Second login step for admins: the password (or Google) was right, now the
 * 6-digit code we emailed. Backend: POST /api/auth/login/2fa (+ /resend).
 * Props:
 *   challenge        from the first step's reply (valid 15 minutes)
 *   email            masked email the code went to
 *   onSuccess(user)  called after the code is verified (token is already saved)
 *   onBack()         start the login again
 */
const AdminTwoStep = ({ challenge, email, onSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const codeRef = useRef(null);

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (e) => {
    if (e) e.preventDefault();
    if (busy || otp.length !== 6) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const res = await axios.post(`${getBaseUrl()}/api/auth/login/2fa`, { challenge, otp }, { withCredentials: true, timeout: 20000 });
      if (res.data?.token) {
        try {
          localStorage.setItem('token', res.data.token);
        } catch (storageErr) {
          /* private mode: the cookie still logs the user in */
        }
      }
      if (!res.data?.user) throw new Error('No user data received. Please try again.');
      onSuccess(res.data.user);
    } catch (err) {
      setOtp('');
      setError(err?.response ? apiError(err, 'Verification failed.') : err.message || 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (busy || cooldown > 0) return;
    setBusy(true);
    setError('');
    try {
      const res = await axios.post(`${getBaseUrl()}/api/auth/login/2fa/resend`, { challenge }, { withCredentials: true, timeout: 20000 });
      setInfo(res.data?.message || 'A new code has been sent.');
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      if (err?.response?.data?.retryAfter) setCooldown(err.response.data.retryAfter);
      setError(apiError(err, 'Could not send a new code.'));
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300';

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl bg-purple-50 p-3 text-sm text-purple-900">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-purple-600" />
        <p>
          Admin login needs one more step. We emailed a 6-digit code to <strong>{email}</strong>. It is valid for 10 minutes.
        </p>
      </div>
      {error && (
        <div role="alert" className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {info && !error && (
        <div role="status" className="p-3 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 text-sm">
          {info}
        </div>
      )}
      <form onSubmit={verify} className="space-y-5">
        <div>
          <label htmlFor="admin-2fa-code" className="block text-sm font-semibold text-gray-700 mb-2">
            Code from your email
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="admin-2fa-code"
              ref={codeRef}
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className={`${inputClass} text-center tracking-[0.5em] text-xl font-semibold`}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy || otp.length !== 6}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-95 disabled:opacity-60 transition"
        >
          {busy ? 'Checking…' : 'Verify & Login'}
        </button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 hover:underline">
            <ArrowLeft size={15} /> Start again
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={busy || cooldown > 0}
            className="text-purple-600 hover:text-purple-700 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTwoStep;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mail, KeyRound, ArrowLeft, Send } from 'lucide-react';
import getBaseUrl from '../../utlis/baseURL';

const RESEND_SECONDS = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const apiError = (err, fallback) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err && !err.response) return 'Could not reach the server. Check your connection.';
  return fallback;
};

/**
 * Login with a one-time code sent by email.
 * Props:
 *   onSuccess(user)  called after the code is verified (token is already saved)
 *   onBack()         go back to the password form
 *   initialEmail     optional email to pre-fill
 */
const EmailOtpLogin = ({ onSuccess, onBack, initialEmail = '' }) => {
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  const requestCode = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await axios.post(`${getBaseUrl()}/api/auth/otp/request`, { email: clean }, { withCredentials: true, timeout: 20000 });
      setEmail(clean);
      setOtp('');
      setStep('code');
      setCooldown(RESEND_SECONDS);
      setInfo(`We sent a 6-digit code to ${clean}.`);
    } catch (err) {
      if (err?.response?.data?.retryAfter) setCooldown(err.response.data.retryAfter);
      setError(apiError(err, 'Could not send the code. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await axios.post(
        `${getBaseUrl()}/api/auth/otp/verify`,
        { email, otp },
        { withCredentials: true, timeout: 20000 }
      );
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
      setError(err?.response ? apiError(err, 'Verification failed.') : err.message || 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300';

  return (
    <div className="space-y-5">
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

      {step === 'email' ? (
        <form onSubmit={requestCode} className="space-y-5">
          <div>
            <label htmlFor="otp-email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="otp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                required
                className={inputClass}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">We&apos;ll email you a 6-digit code. No password needed.</p>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-95 disabled:opacity-60 transition"
          >
            <Send size={17} />
            {busy ? 'Sending code…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-5">
          <div>
            <label htmlFor="otp-code" className="block text-sm font-semibold text-gray-700 mb-2">
              6-digit code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="otp-code"
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
            {busy ? 'Verifying…' : 'Verify & Login'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
                setInfo('');
              }}
              className="text-gray-500 hover:text-gray-700 hover:underline"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={requestCode}
              disabled={busy || cooldown > 0}
              className="text-purple-600 hover:text-purple-700 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={15} /> Login with password instead
      </button>
    </div>
  );
};

export default EmailOtpLogin;
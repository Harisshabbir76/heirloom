'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [message, setMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const normalizedApiBase = apiBase
    .replace(/\/+$/u, '')
    .replace(/\/api$/u, '');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!apiBase) {
      setError('Missing NEXT_PUBLIC_API_URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${normalizedApiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || 'Login failed');
        return;
      }

      // Check if user has dashboard access (is admin) and redirect accordingly
      const dashboardCheck = await fetch(`${normalizedApiBase}/api/auth/dashboard-access`, {
        credentials: 'include',
      });

      if (dashboardCheck.ok) {
        router.push('/heirloom/admin/panel/dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      let message = 'Login failed';
      if (err instanceof Error) message = err.message;
      setError(message);
      return;
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!apiBase) {
      setError('Missing NEXT_PUBLIC_API_URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${normalizedApiBase}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || 'Unable to send OTP');
        return;
      }

      setMessage('A 6 digit OTP has been sent to your email.');
      setMode('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!apiBase) {
      setError('Missing NEXT_PUBLIC_API_URL');
      return;
    }

    if (!/^\d{6}$/u.test(otp)) {
      setError('Please enter the 6 digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${normalizedApiBase}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || 'Unable to reset password');
        return;
      }

      setPassword('');
      setOtp('');
      setNewPassword('');
      setMode('login');
      setMessage('Password updated successfully. Please sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

        .login-page {
          min-height: 100vh;
          background-color: #fffdf7;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 60px;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 90% 20%, rgba(53, 0, 8, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 10% 80%, rgba(184, 151, 90, 0.07) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .login-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
        }

        .login-eyebrow {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-eyebrow-line {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .login-eyebrow-line::before,
        .login-eyebrow-line::after {
          content: '';
          flex: 1;
          max-width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(184, 151, 90, 0.5));
        }

        .login-eyebrow-line::after {
          background: linear-gradient(270deg, transparent, rgba(184, 151, 90, 0.5));
        }

        .login-eyebrow-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #b8975a;
        }

        .login-card {
          background: rgba(255, 253, 247, 0.95);
          border: 1px solid rgba(184, 151, 90, 0.2);
          border-radius: 4px;
          box-shadow:
            0 2px 0 rgba(184, 151, 90, 0.15),
            0 20px 60px rgba(53, 0, 8, 0.08),
            0 4px 16px rgba(53, 0, 8, 0.04);
          padding: 48px 44px 44px;
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(184, 151, 90, 0.6) 30%, rgba(184, 151, 90, 0.8) 50%, rgba(184, 151, 90, 0.6) 70%, transparent 100%);
        }

        .login-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .login-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 46px;
          font-weight: 300;
          letter-spacing: 2px;
          color: #350008;
          margin: 0 0 8px 0;
          line-height: 1;
        }

        .login-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 18px;
          color: rgba(53, 0, 8, 0.55);
          margin: 0;
          letter-spacing: 0.3px;
        }

        .login-form {
          display: grid;
          gap: 20px;
        }

        .field-group {
          display: grid;
          gap: 8px;
        }

        .field-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(53, 0, 8, 0.6);
        }

        .field-input {
          padding: 13px 16px;
          border-radius: 2px;
          border: 1px solid rgba(53, 0, 8, 0.12);
          border-bottom: 1px solid rgba(53, 0, 8, 0.25);
          outline: none;
          background: rgba(255, 253, 247, 0.5);
          color: #350008;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          letter-spacing: 0.3px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          width: 100%;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }

        .field-input::placeholder {
          color: rgba(53, 0, 8, 0.3);
          font-style: italic;
        }

        .field-input:focus {
          border-color: rgba(184, 151, 90, 0.5);
          border-bottom-color: #b8975a;
          box-shadow: 0 2px 0 rgba(184, 151, 90, 0.15), 0 0 0 3px rgba(184, 151, 90, 0.06);
          background: #fffdf7;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: rgba(176, 0, 32, 0.05);
          border: 1px solid rgba(176, 0, 32, 0.15);
          border-radius: 2px;
          color: #b00020;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: rgba(47, 125, 74, 0.06);
          border: 1px solid rgba(47, 125, 74, 0.16);
          border-radius: 2px;
          color: #2f7d4a;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .forgot-password-btn {
          appearance: none;
          border: 0;
          background: transparent;
          color: #b8975a;
          cursor: pointer;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.3px;
          padding: 0;
          justify-self: end;
          border-bottom: 1px solid rgba(184, 151, 90, 0.4);
        }

        .submit-btn {
          margin-top: 8px;
          padding: 15px 20px;
          border-radius: 2px;
          border: 1px solid #350008;
          background: #350008;
          color: #fffdf7;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          transition: background 0.2s ease, color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
          width: 100%;
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(184, 151, 90, 0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1a0004;
          box-shadow: 0 4px 16px rgba(53, 0, 8, 0.2);
        }

        .submit-btn:hover:not(:disabled)::after {
          opacity: 1;
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 28px;
          text-align: center;
        }

        .login-footer-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .login-footer-divider::before,
        .login-footer-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(53, 0, 8, 0.1);
        }

        .login-footer-divider span {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(53, 0, 8, 0.35);
        }

        .login-footer-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          color: rgba(53, 0, 8, 0.6);
          margin: 0;
        }

        .login-footer-link {
          color: #b8975a;
          text-decoration: none;
          font-weight: 500;
          letter-spacing: 0.3px;
          border-bottom: 1px solid rgba(184, 151, 90, 0.4);
          padding-bottom: 1px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .login-footer-link:hover {
          color: #9a7d48;
          border-color: #9a7d48;
        }

        @media (max-width: 600px) {
          .login-card {
            padding: 36px 28px 32px;
          }
          .login-title {
            font-size: 38px;
          }
        }
      `}</style>

      <main className="login-page">
        <div className="login-wrapper">
          <div className="login-eyebrow">
            <div className="login-eyebrow-line">
              <span className="login-eyebrow-text">Heirloom by SK</span>
            </div>
          </div>

          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">
                {mode === 'login' ? 'Welcome Back' : mode === 'forgot' ? 'Reset Password' : 'Enter OTP'}
              </h1>
              <p className="login-subtitle">
                {mode === 'login'
                  ? 'Every piece has a story. So do you.'
                  : mode === 'forgot'
                    ? 'We will send a 6 digit OTP to your email.'
                    : 'Enter the OTP and choose a new password.'}
              </p>
            </div>

            {mode === 'login' && (
            <form onSubmit={onSubmit} className="login-form">
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <input
                  className="field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  placeholder="Your password"
                />
              </div>

              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setMode('forgot');
                }}
              >
                Forgot password?
              </button>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={onForgotPassword} className="login-form">
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input
                    className="field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={() => {
                    setError(null);
                    setMessage(null);
                    setMode('login');
                  }}
                >
                  Back to sign in
                </button>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={onResetPassword} className="login-form">
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input className="field-input" value={email} readOnly type="email" />
                </div>
                <div className="field-group">
                  <label className="field-label">6 Digit OTP</label>
                  <input
                    className="field-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/gu, '').slice(0, 6))}
                    required
                    inputMode="numeric"
                    placeholder="000000"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">New Password</label>
                  <input
                    className="field-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    type="password"
                    placeholder="New password"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            )}

            <div className="login-footer">
              <div className="login-footer-divider">
                <span>or</span>
              </div>
              <p className="login-footer-text">
                Don&apos;t have an account?{' '}
                <a href="/signup" className="login-footer-link">
                  Create one
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!apiBase) {
      setError('Missing NEXT_PUBLIC_API_URL');
      return;
    }

    setLoading(true);
    try {
      // Avoid double '/api' when NEXT_PUBLIC_API_URL is set to something like `http://localhost:5000/api`
      const normalizedApiBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');

      const res = await fetch(`${normalizedApiBase}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, age: Number(age), password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || 'Signup failed');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

        .signup-page {
          min-height: 100vh;
          background-color: #fffdf7;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 60px;
          position: relative;
          overflow: hidden;
        }

        .signup-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 10% 20%, rgba(53, 0, 8, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 90% 80%, rgba(184, 151, 90, 0.07) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .signup-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 560px;
        }

        .signup-eyebrow {
          text-align: center;
          margin-bottom: 32px;
        }

        .signup-eyebrow-line {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .signup-eyebrow-line::before,
        .signup-eyebrow-line::after {
          content: '';
          flex: 1;
          max-width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(184, 151, 90, 0.5));
        }

        .signup-eyebrow-line::after {
          background: linear-gradient(270deg, transparent, rgba(184, 151, 90, 0.5));
        }

        .signup-eyebrow-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #b8975a;
        }

        .signup-card {
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

        .signup-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(184, 151, 90, 0.6) 30%, rgba(184, 151, 90, 0.8) 50%, rgba(184, 151, 90, 0.6) 70%, transparent 100%);
        }

        .signup-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .signup-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 46px;
          font-weight: 300;
          letter-spacing: 2px;
          color: #350008;
          margin: 0 0 8px 0;
          line-height: 1;
        }

        .signup-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 18px;
          color: rgba(53, 0, 8, 0.55);
          margin: 0;
          letter-spacing: 0.3px;
        }

        .signup-form {
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

        .fields-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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

        .signup-footer {
          margin-top: 28px;
          text-align: center;
        }

        .signup-footer-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .signup-footer-divider::before,
        .signup-footer-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(53, 0, 8, 0.1);
        }

        .signup-footer-divider span {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(53, 0, 8, 0.35);
        }

        .signup-footer-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          color: rgba(53, 0, 8, 0.6);
          margin: 0;
        }

        .signup-footer-link {
          color: #b8975a;
          text-decoration: none;
          font-weight: 500;
          letter-spacing: 0.3px;
          border-bottom: 1px solid rgba(184, 151, 90, 0.4);
          padding-bottom: 1px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .signup-footer-link:hover {
          color: #9a7d48;
          border-color: #9a7d48;
        }

        @media (max-width: 600px) {
          .signup-card {
            padding: 36px 28px 32px;
          }
          .signup-title {
            font-size: 38px;
          }
          .fields-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="signup-page">
        <div className="signup-wrapper">
          <div className="signup-eyebrow">
            <div className="signup-eyebrow-line">
              <span className="signup-eyebrow-text">Heirloom by SK</span>
            </div>
          </div>

          <div className="signup-card">
            <div className="signup-header">
              <h1 className="signup-title">Create Account</h1>
              <p className="signup-subtitle">Begin your story with us.</p>
            </div>

            <form onSubmit={onSubmit} className="signup-form">
              <div className="fields-row">
                <div className="field-group">
                  <label className="field-label">Your Name</label>
                  <input
                    className="field-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    type="text"
                    placeholder="Full name"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Age</label>
                  <input
                    className="field-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    type="number"
                    min={0}
                    max={150}
                    placeholder="Age"
                  />
                </div>
              </div>

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
                  placeholder="Minimum 6 characters"
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating your account...' : 'Create Account'}
              </button>
            </form>

            <div className="signup-footer">
              <div className="signup-footer-divider">
                <span>or</span>
              </div>
              <p className="signup-footer-text">
                Already have an account?{' '}
                <a href="/login" className="signup-footer-link">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
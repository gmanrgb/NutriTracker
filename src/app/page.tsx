'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/api/client';
import { useAuthStore } from '@/stores/auth';

type Mode = 'landing' | 'register' | 'login';

interface LoginResponse {
  id: string;
  username: string;
  weightHandshake?: {
    source: 'supabase';
    status: 'connected' | 'not_configured' | 'not_found' | 'error';
    latestWeight: number | null;
    unit: string | null;
    loggedAt: string | null;
    message?: string;
  };
}

export default function LandingPage() {
  const [mode, setMode] = useState<Mode>('landing');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const router = useRouter();
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    apiFetch<{ id: string; username: string }>('/api/auth/me')
      .then((user) => {
        setUser(user);
        router.replace('/cosmic');
      })
      .catch(() => {
        clearUser();
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, [clearUser, router, setUser]);

  function resetSensitiveFields() {
    setPassword('');
    setConfirmPassword('');
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
    resetSensitiveFields();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setSuccess('Account created. You can log in now.');
      setMode('login');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed');
    } finally {
      resetSensitiveFields();
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const user = await apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setUser({
        id: user.id,
        username: user.username,
        weightHandshake: user.weightHandshake,
      });
      router.push('/cosmic');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed');
    } finally {
      resetSensitiveFields();
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="auth-root">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="spinner" aria-label="Loading" />
        <style jsx>{`
          .auth-root {
            min-height: 100vh;
            display: grid;
            place-items: center;
            position: relative;
            overflow: hidden;
            background: radial-gradient(ellipse at 20% 20%, #1a0a2e 0%, #0a0a1a 40%, #050510 100%);
          }
          .auth-orb {
            position: absolute;
            border-radius: 999px;
            pointer-events: none;
          }
          .auth-orb-one {
            width: 360px;
            height: 360px;
            right: -120px;
            top: -120px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%);
          }
          .auth-orb-two {
            width: 420px;
            height: 420px;
            left: -90px;
            bottom: -160px;
            background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
          }
          .spinner {
            width: 38px;
            height: 38px;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-top-color: #c084fc;
            border-radius: 999px;
            animation: spin 0.8s linear infinite;
            position: relative;
            z-index: 2;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@300;400&family=Outfit:wght@300;500;700;900&display=swap"
      />
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />

      <main className="auth-shell">
        <header className="brand">
          <h1>NutriTrack</h1>
          <p>FUEL YOUR POTENTIAL</p>
        </header>

        {mode === 'landing' && (
          <section className="panel">
            <h2>Mission Control</h2>
            <p>Track nutrition and body progress with secure account-backed data.</p>
            <div className="actions">
              <button type="button" className="primary" onClick={() => switchMode('register')}>
                Create Account
              </button>
              <button type="button" className="secondary" onClick={() => switchMode('login')}>
                Log In
              </button>
            </div>
            <small>Passwords are hashed with Argon2 and sessions use HTTP-only cookies.</small>
          </section>
        )}

        {mode === 'register' && (
          <section className="panel">
            <h2>Create Account</h2>
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}
            <form onSubmit={handleRegister}>
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                  inputMode="text"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label>
                Confirm Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" className="primary wide" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
            <button type="button" className="link" onClick={() => switchMode('login')}>
              Already have an account? Log in
            </button>
          </section>
        )}

        {mode === 'login' && (
          <section className="panel">
            <h2>Log In</h2>
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}
            <form onSubmit={handleLogin}>
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  inputMode="text"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
              <button type="submit" className="primary wide" disabled={loading}>
                {loading ? 'Authenticating...' : 'Log In + Weight Handshake'}
              </button>
            </form>
            <button type="button" className="link" onClick={() => switchMode('register')}>
              Need an account? Register
            </button>
          </section>
        )}
      </main>

      <style jsx>{`
        .auth-root {
          min-height: 100vh;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse at 20% 20%, #1a0a2e 0%, #0a0a1a 40%, #050510 100%);
          color: #e8e0f0;
          font-family: 'DM Sans', sans-serif;
          padding: 20px;
        }
        .auth-orb {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
        }
        .auth-orb-one {
          width: 360px;
          height: 360px;
          right: -120px;
          top: -120px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%);
        }
        .auth-orb-two {
          width: 420px;
          height: 420px;
          left: -90px;
          bottom: -160px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
        }
        .auth-shell {
          width: min(470px, 100%);
          z-index: 2;
        }
        .brand {
          margin-bottom: 16px;
          text-align: center;
        }
        .brand h1 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: clamp(34px, 6vw, 44px);
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand p {
          margin: 6px 0 0;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.08em;
        }
        .panel {
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 24px;
        }
        .panel h2 {
          margin: 0 0 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 700;
        }
        .panel p {
          margin: 0 0 16px;
          color: rgba(255, 255, 255, 0.62);
          font-size: 14px;
          line-height: 1.5;
        }
        .actions {
          display: grid;
          gap: 10px;
        }
        .panel small {
          display: block;
          margin-top: 14px;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          color: rgba(255, 255, 255, 0.42);
          line-height: 1.5;
        }
        form {
          display: grid;
          gap: 12px;
        }
        label {
          display: grid;
          gap: 6px;
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.62);
        }
        input {
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
          color: #f4edff;
          padding: 12px 14px;
          font-size: 15px;
          outline: none;
        }
        input:focus {
          border-color: rgba(192, 132, 252, 0.6);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }
        button {
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .primary {
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 6px 22px rgba(139, 92, 246, 0.35);
          transition: all 0.2s ease;
        }
        .primary:hover {
          filter: brightness(1.08);
        }
        .primary:active {
          transform: scale(0.98);
        }
        .primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .secondary {
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .wide {
          width: 100%;
          margin-top: 4px;
        }
        .link {
          margin-top: 12px;
          width: 100%;
          background: none;
          color: #c084fc;
          font-size: 13px;
        }
        .message {
          margin-bottom: 10px;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
        }
        .message.error {
          background: rgba(255, 107, 107, 0.14);
          border: 1px solid rgba(255, 107, 107, 0.35);
          color: #ffb4b4;
        }
        .message.success {
          background: rgba(52, 211, 153, 0.14);
          border: 1px solid rgba(52, 211, 153, 0.35);
          color: #99f6d0;
        }
      `}</style>
    </div>
  );
}

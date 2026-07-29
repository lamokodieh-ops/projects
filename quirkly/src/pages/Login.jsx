import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND } from '../brand.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';

export function Login() {
  const navigate = useNavigate();
  const { signInLocal } = useQuirkly();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    setError('');
    const res = signInLocal({ email });
    if (!res.ok) {
      setError('No saved profile for this email on this device. Create an account first.');
      return;
    }
    if (!res.profile?.onboardingCompleted) {
      navigate('/onboarding', { replace: true });
      return;
    }
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="page page--narrow">
      <p className="display" style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
        {BRAND.name}
      </p>
      <h1>Welcome back</h1>
      <p className="muted">Pick up where your quirks left off.</p>

      <Card className="auth-card">
        <form className="stack" onSubmit={onSubmit} noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label="Email address"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="field">
            <label className="field__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="field__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="field__hint muted">Password reset isn’t available in this local demo build.</p>
          </div>
          {error ? (
            <p role="alert" className="muted" style={{ color: 'var(--danger)', margin: 0 }}>
              {error}
            </p>
          ) : null}
          <p className="muted" style={{ fontSize: '0.75rem', margin: 0 }}>
            Data stays in this browser only; password is not verified.
          </p>
          <Button type="submit" className="btn--block">
            Sign In
          </Button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </Card>
      <p className="muted" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
        {BRAND.copyright}
      </p>
    </div>
  );
}

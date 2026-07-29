import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND } from '../brand.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useQuirkly();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!agree) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    signUp({ name: name.trim(), email: email.trim() });
    navigate('/onboarding', { replace: true });
  }

  return (
    <div className="page page--narrow">
      <p className="display" style={{ fontSize: '1.35rem' }}>
        {BRAND.name}
      </p>
      <h1>Join Quirkly</h1>
      <p className="muted">A quick quiz, then habits that match how you work.</p>

      <Card className="auth-card">
        <form className="stack" onSubmit={onSubmit}>
          <Input
            id="su-name"
            name="name"
            autoComplete="name"
            label="Full name"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="su-email"
            name="email"
            type="email"
            autoComplete="email"
            label="Email address"
            placeholder="alex@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="su-password"
            name="password"
            type="password"
            autoComplete="new-password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="row" style={{ cursor: 'pointer', gap: '0.5rem' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="muted" style={{ fontSize: '0.9rem' }}>
              I agree to the Terms of Service
            </span>
          </label>
          {error ? (
            <p role="alert" style={{ color: 'var(--danger)', margin: 0, fontSize: '0.9rem' }}>
              {error}
            </p>
          ) : null}
          <Button type="submit" className="btn--block">
            Create Account
          </Button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </Card>
    </div>
  );
}

import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BRAND } from '../brand.js';
import { Button } from '../components/ui/Button.jsx';
import { isDemo } from '../demoData.js';
import { useQuirkly } from '../context/QuirklyContext.jsx';

export function Landing() {
  const navigate = useNavigate();
  const { loadDemo, profile } = useQuirkly();

  // Gallery build seeds Elena + habits and opens the app immediately (like Fortis / Cortex demos).
  if (isDemo && profile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing">
      <header className="landing__top anim-soft-in">
        <Link to="/" className="landing__brand">
          {BRAND.name}
        </Link>
        <Link to="/login">Sign In</Link>
      </header>

      <section className="landing-hero" aria-labelledby="hero-title">
        <p className="display landing__brand anim-fade-up" style={{ marginBottom: '1rem' }}>
          {BRAND.name}
        </p>
        <h1 id="hero-title" className="anim-fade-up-delay">
          {BRAND.heroHeadline}
        </h1>
        <p className="muted landing-hero__support anim-fade-up-late">{BRAND.heroSupport}</p>
        <div className="row anim-fade-up-late">
          <Link to="/signup" className="btn btn--primary">
            Get Started
          </Link>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              loadDemo();
              navigate('/dashboard', { replace: true });
            }}
          >
            View Demo
          </Button>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="why-title">
        <h2 id="why-title">What Quirkly actually does</h2>
        <p className="muted" style={{ maxWidth: '36rem' }}>
          Honest tools for consistency—no fake metrics, no guilt. Your data stays in this browser.
        </p>
        <div className="landing-feature">
          <h3>Personalized starter steps</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            A short quiz tunes encouragement, layout density, and how small your first action should be.
          </p>
        </div>
        <div className="landing-feature">
          <h3>Today, focus, and streaks</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Track daily or weekly habits, run a focus session, and see a week of completion at a glance.
          </p>
        </div>
        <div className="landing-feature">
          <h3>Reschedule without shame</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Push a habit to tomorrow when today is full—then pick it up again without breaking the story.
          </p>
        </div>
      </section>

      <footer className="landing-footer stack">
        <p className="display" style={{ fontSize: '1.1rem', color: 'var(--text)', margin: 0 }}>
          {BRAND.name}
        </p>
        <p style={{ margin: 0 }}>{BRAND.footerBlurb}</p>
        <p style={{ margin: 0 }}>{BRAND.copyright}</p>
      </footer>
    </div>
  );
}

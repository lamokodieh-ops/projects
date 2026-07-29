import { Link, Navigate } from 'react-router-dom';
import { BRAND } from '../brand.js';
import { Card } from '../components/ui/Card.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';

export function QuizResults() {
  const { profile } = useQuirkly();
  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  const score = profile.focusScore ?? 72;
  const challenges = profile.derivedChallenges?.length
    ? profile.derivedChallenges
    : ['Keeping momentum when the schedule gets messy.'];
  const strengths = profile.derivedStrengths?.length
    ? profile.derivedStrengths
    : ['You’re willing to examine how you work—that already puts you ahead.'];

  return (
    <div className="page page--narrow">
      <p className="display" style={{ fontSize: '1.2rem' }}>
        {BRAND.name}
      </p>
      <h1>Your growth profile is ready.</h1>
      <p className="muted">
        We translated your answers into a productivity-style profile—preferences, not diagnoses—to tune nudges and
        layout.
      </p>

      <Card className="stack-lg anim-fade-up" style={{ marginTop: '1rem' }}>
        <span className="badge badge--accent">Quiz complete</span>
        <h2 style={{ marginTop: 0 }}>Focus metric</h2>
        <p className="display timer-display" style={{ fontSize: '2.5rem', margin: 0 }}>
          {score}{' '}
          <span style={{ fontSize: '1rem', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>/ 100</span>
        </p>
        <p className="muted">Illustrative score from your quiz preferences—used to personalize starter steps.</p>
        <div className="stack" style={{ gap: '0.5rem' }}>
          <ProgressBar
            label="Consistency lean"
            value={profile.routinePreference === 'structure' ? Math.min(98, score + 6) : Math.min(90, score - 2)}
          />
          <ProgressBar
            label="Starter ease"
            value={
              profile.taskInitiationDifficulty === 'high'
                ? Math.min(88, score - 8)
                : Math.min(95, score + 2)
            }
          />
          <ProgressBar
            label="Support preference"
            value={
              profile.encouragementPreference === 'supportive'
                ? Math.min(96, score + 4)
                : Math.min(92, score - 1)
            }
          />
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
        <h3>Style identified</h3>
        <p className="display" style={{ fontSize: '1.35rem', marginTop: 0 }}>
          {profile.derivedProfileType || 'The Flexible Finder'}
        </p>
        <p className="muted">{profile.derivedProfileBlurb}</p>
        <div className="stack" style={{ gap: '0.35rem' }}>
          <strong>From your answers — challenges</strong>
          <ul className="muted" style={{ margin: 0 }}>
            {challenges.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <strong>From your answers — strengths</strong>
          <ul className="muted" style={{ margin: 0 }}>
            {strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <blockquote className="quote-block" style={{ borderLeftColor: 'var(--accent)' }}>
          &ldquo;Start where you are. Use what you have. Do what you can.&rdquo; — Arthur Ashe
        </blockquote>
        <Link to="/dashboard" className="btn btn--primary btn--block" style={{ textAlign: 'center' }}>
          Go to dashboard
        </Link>
      </Card>
    </div>
  );
}

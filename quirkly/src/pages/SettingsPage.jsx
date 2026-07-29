import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BRAND, THEMES, badgeFromProfile, levelFromStreak } from '../brand.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';
import { exportStateJson } from '../utils/storage.js';
import { habitStreak } from '../utils/streaks.js';
import { toISODate } from '../utils/dates.js';

export function SettingsPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const {
    profile,
    habits,
    theme,
    morningNudges,
    weeklyReports,
    setTheme,
    setPrefs,
    retakeQuiz,
    logout,
    importJson,
  } = useQuirkly();
  const [msg, setMsg] = useState('');

  if (!profile) return <Navigate to="/" replace />;
  if (!profile.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  const today = toISODate();
  const streak = habits.reduce((m, h) => Math.max(m, habitStreak(h, today)), 0);

  function onExport() {
    const blob = new Blob([exportStateJson({ profile, habits, theme, morningNudges, weeklyReports })], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = BRAND.exportFilename;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Export started.');
  }

  function onImportFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result));
        setMsg('Import successful. Refreshing…');
        window.location.reload();
      } catch {
        setMsg('Could not import file.');
      }
    };
    reader.readAsText(f);
  }

  return (
    <div className="page page--narrow">
      <h1>Your space</h1>
      <p className="muted">Tune the look, review your style profile, and manage local data.</p>

      <Card className="stack-lg" style={{ marginTop: '1rem' }}>
        <div className="row row-between">
          <div>
            <h2 style={{ margin: 0 }}>{profile.name}</h2>
            <p className="muted" style={{ margin: '0.25rem 0 0' }}>
              {profile.derivedProfileType || 'Member'} · since {profile.memberSince}
            </p>
          </div>
          <span className="badge badge--accent">{badgeFromProfile(profile)}</span>
        </div>
        <div className="row" style={{ gap: '1.5rem' }}>
          <div>
            <strong className="display" style={{ fontSize: '1.5rem' }}>
              {streak}
            </strong>
            <p className="muted" style={{ margin: 0 }}>
              Day streak
            </p>
          </div>
          <div>
            <strong className="display" style={{ fontSize: '1.5rem' }}>
              {levelFromStreak(streak)}
            </strong>
            <p className="muted" style={{ margin: 0 }}>
              Level
            </p>
          </div>
        </div>
        <p className="muted">{profile.derivedProfileBlurb}</p>
        <ProgressBar value={profile.focusScore ?? 70} label="Focus score (from quiz)" />
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            retakeQuiz();
            navigate('/onboarding', { replace: true });
          }}
        >
          Retake productivity quiz
        </Button>
      </Card>

      <Card className="stack-lg" style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Settings & preferences</h2>
        <div>
          <p className="field__label">Reminders (local only)</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Saved in this browser. Quirkly does not send push notifications in this build.
          </p>
          <label className="row" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" checked={morningNudges} onChange={(e) => setPrefs(e.target.checked, weeklyReports)} />
            <span>Prefer morning nudges</span>
          </label>
          <label className="row" style={{ gap: '0.5rem' }}>
            <input type="checkbox" checked={weeklyReports} onChange={(e) => setPrefs(morningNudges, e.target.checked)} />
            <span>Prefer weekly reports</span>
          </label>
        </div>
        <div>
          <p className="field__label">Interface theme</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>Ink, Cloud, or Pop.</p>
          <div className="row" style={{ marginTop: '0.5rem' }} role="group" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${theme === t.id ? 'chip--on' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="field__label">Data management</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Your metrics stay in this browser unless you export them.
          </p>
          <div className="row" style={{ marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={onExport}>
              Export data (.json)
            </Button>
            <Button type="button" variant="ghost" onClick={() => fileRef.current?.click()}>
              Import JSON
            </Button>
            <input ref={fileRef} type="file" accept="application/json" className="sr-only" onChange={onImportFile} />
          </div>
          {msg ? (
            <p className="muted" style={{ margin: 0 }}>
              {msg}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (window.confirm(`Clear all local ${BRAND.name} data on this device?`)) logout();
          }}
        >
          Log out & clear session
        </Button>
      </Card>

      <p className="muted" style={{ marginTop: '1.5rem' }}>
        <Link to="/dashboard">← Back to dashboard</Link>
      </p>
    </div>
  );
}

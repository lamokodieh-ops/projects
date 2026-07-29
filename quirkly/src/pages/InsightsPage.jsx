import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { badgeFromProfile, timeGreeting } from '../brand.js';
import { Card } from '../components/ui/Card.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { WeekChart } from '../components/WeekChart.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';
import { bestDayInsight } from '../engine/personalization.js';
import { lastNDays, shortWeekday, toISODate } from '../utils/dates.js';
import { habitStreak } from '../utils/streaks.js';

export function InsightsPage() {
  const { profile, habits } = useQuirkly();
  const [q, setQ] = useState('');

  const today = toISODate();
  const active = habits.filter((h) => h.active);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return active;
    return active.filter((h) => h.title.toLowerCase().includes(s));
  }, [active, q]);

  const last30 = useMemo(() => {
    const days = lastNDays(30);
    let totalSlots = 0;
    let doneSlots = 0;
    days.forEach((d) => {
      active.forEach((h) => {
        totalSlots += 1;
        if (h.completedDates?.includes(d)) doneSlots += 1;
      });
    });
    const pct = totalSlots ? Math.round((doneSlots / totalSlots) * 100) : 0;
    return { pct, doneSlots, totalSlots };
  }, [active]);

  const weekSeries = useMemo(() => {
    const days = lastNDays(7);
    if (!active.length) return days.map((d) => ({ pct: 0, label: shortWeekday(d) }));
    return days.map((d) => ({
      pct: Math.round((active.filter((h) => h.completedDates?.includes(d)).length / active.length) * 100),
      label: shortWeekday(d),
    }));
  }, [active]);

  const bestStreak = active.reduce((m, h) => Math.max(m, habitStreak(h, today)), 0);
  const weekInsight = bestDayInsight(weekSeries);
  const missedRecovery =
    bestStreak === 0 && active.some((h) => (h.completedDates || []).length > 0)
      ? 'A streak reset isn’t a failure—pick the smallest habit and restart today.'
      : null;

  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return (
    <div className="page">
      <div className="row row-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="muted" style={{ margin: 0 }}>
            Stats & history
          </p>
          <h1 style={{ margin: 0 }}>Your rhythm</h1>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {timeGreeting()}, {profile.name}. {badgeFromProfile(profile)} mode.
          </p>
        </div>
        <div className="row">
          <span className="badge badge--accent">Active streak · {bestStreak} days</span>
          <Link to="/dashboard/habit/new" className="btn btn--primary" style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}>
            New habit
          </Link>
        </div>
      </div>

      <label className="sr-only" htmlFor="ins-search">
        Search insights
      </label>
      <input
        id="ins-search"
        className="field__input"
        placeholder="Search habits..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ maxWidth: '400px', marginTop: '1rem' }}
      />

      <div className="dash-grid" style={{ marginTop: '1.5rem' }}>
        <Card className="stack-lg">
          <h2 style={{ marginTop: 0 }}>30-day consistency</h2>
          <p className="display" style={{ fontSize: '2rem', margin: 0 }}>
            {last30.pct}%
          </p>
          <p className="muted">Share of habit slots completed in the last 30 days.</p>
          <ProgressBar value={last30.pct} label="30-day consistency" />
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
            {last30.doneSlots} completions across {last30.totalSlots} tracked day-slots.
          </p>
        </Card>

        <Card className="stack-lg">
          <h2 style={{ marginTop: 0 }}>Weekly rhythm</h2>
          <WeekChart series={weekSeries} ariaLabel="Last seven days completion rate" />
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
            {weekInsight}
          </p>
          {missedRecovery ? (
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
              {missedRecovery}
            </p>
          ) : null}
        </Card>
      </div>

      <Card style={{ marginTop: '1.25rem' }}>
        <h2 style={{ marginTop: 0 }}>Active habits</h2>
        {active.length === 0 ? (
          <p className="muted">No active habits yet. Start with one tiny repeat.</p>
        ) : filtered.length === 0 ? (
          <p className="muted">No matches for that search.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="stack-lg">
            {filtered.map((h) => {
              const doneLast30 = lastNDays(30).filter((d) => h.completedDates?.includes(d)).length;
              return (
                <li key={h.id} className="habit-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="row row-between">
                    <div>
                      <strong>{h.title}</strong>
                      <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                        {doneLast30}/30d logged · streak {habitStreak(h, today)} · {h.frequency}
                      </p>
                    </div>
                    <Link to={`/dashboard/habit/${h.id}/edit`} className="btn btn--ghost" style={{ fontSize: '0.8rem' }}>
                      Edit
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link to="/dashboard" className="muted" style={{ fontWeight: 600, display: 'inline-block', marginTop: '1rem' }}>
          ← Back to today
        </Link>
      </Card>
    </div>
  );
}

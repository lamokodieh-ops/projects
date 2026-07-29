import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BRAND } from '../brand.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { WeekChart } from '../components/WeekChart.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';
import {
  bestDayInsight,
  dashboardHeadline,
  microStepForDifficulty,
  showOneHabitFocus,
  supportCopy,
} from '../engine/personalization.js';
import { lastNDays, shortWeekday, toISODate } from '../utils/dates.js';
import { habitStreak } from '../utils/streaks.js';

function isDueToday(habit, today) {
  if (!habit.active) return false;
  if (habit.snoozeUntil && habit.snoozeUntil > today) return false;
  return true;
}

export function Dashboard() {
  const { profile, habits, toggleCompleteToday, rescheduleHabit } = useQuirkly();
  const [q, setQ] = useState('');
  const [rescheduleMsg, setRescheduleMsg] = useState('');

  const today = toISODate();
  const active = useMemo(() => habits.filter((h) => isDueToday(h, today)), [habits, today]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return active;
    return active.filter((h) => h.title.toLowerCase().includes(s) || (h.description || '').toLowerCase().includes(s));
  }, [active, q]);

  const completedToday = active.filter((h) => h.completedDates?.includes(today)).length;
  const rate = active.length ? Math.round((completedToday / active.length) * 100) : 0;
  const best = active.reduce((m, h) => Math.max(m, habitStreak(h, today)), 0);
  const oneFocus = profile ? showOneHabitFocus(profile) : false;
  const ordered = useMemo(() => {
    const inc = filtered.filter((h) => !h.completedDates?.includes(today));
    const done = filtered.filter((h) => h.completedDates?.includes(today));
    return [...inc, ...done];
  }, [filtered, today]);

  const focusHabit = ordered[0] || null;
  const listHabits = useMemo(() => {
    const base = oneFocus && ordered.length > 1 ? ordered.slice(1) : ordered;
    if (!focusHabit) return base;
    return base.filter((h) => h.id !== focusHabit.id);
  }, [oneFocus, ordered, focusHabit]);

  const weekSeries = useMemo(() => {
    const days = lastNDays(7);
    const allActive = habits.filter((h) => h.active);
    if (!allActive.length) return days.map((d) => ({ pct: 0, label: shortWeekday(d) }));
    return days.map((d) => {
      const done = allActive.filter((h) => h.completedDates?.includes(d)).length;
      return { pct: Math.round((done / allActive.length) * 100), label: shortWeekday(d) };
    });
  }, [habits]);

  const support = supportCopy(profile);
  const weekInsight = bestDayInsight(weekSeries);

  if (!profile) return <Navigate to="/" replace />;
  if (!profile.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  function onReschedule(habit) {
    rescheduleHabit(habit.id);
    setRescheduleMsg(`“${habit.title}” moved to tomorrow.`);
    window.setTimeout(() => setRescheduleMsg(''), 3200);
  }

  return (
    <div className="page">
      <header className="stack anim-fade-up" style={{ marginBottom: '1.25rem' }}>
        <p className="muted" style={{ margin: 0 }}>
          Today · {BRAND.name}
        </p>
        <h1 style={{ marginBottom: 0 }}>Welcome back, {profile.name}.</h1>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          {dashboardHeadline(profile)}
        </p>
        <label className="sr-only" htmlFor="habit-search">
          Search habits
        </label>
        <input
          id="habit-search"
          className="field__input"
          placeholder="Search habits..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: '420px' }}
        />
      </header>

      <div className="dash-grid">
        <div className="stack-lg">
          <Card className="anim-fade-up-delay">
            <div className="row row-between">
              <span className="badge badge--accent">Today&apos;s focus</span>
              <Link
                to={focusHabit ? `/focus/${focusHabit.id}` : '/focus'}
                className="btn btn--secondary"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
              >
                Focus mode
              </Link>
            </div>
            {focusHabit ? (
              <>
                <h2 style={{ marginTop: '0.5rem', marginBottom: 0 }}>{focusHabit.title}</h2>
                <blockquote className="quote-block">
                  &ldquo;It always seems impossible till it&apos;s done.&rdquo; — Nelson Mandela
                </blockquote>
                <p className="muted" style={{ fontSize: '0.9rem' }}>
                  {microStepForDifficulty(
                    profile,
                    focusHabit.suggestedMicroStep || focusHabit.description || 'Open the habit and spend two minutes.',
                  )}
                </p>
                <div className="row" style={{ marginTop: '0.75rem' }}>
                  <Button type="button" onClick={() => toggleCompleteToday(focusHabit.id)}>
                    {focusHabit.completedDates?.includes(today) ? 'Completed' : 'Complete'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onReschedule(focusHabit)}
                    disabled={focusHabit.completedDates?.includes(today)}
                  >
                    Reschedule
                  </Button>
                </div>
                {rescheduleMsg ? <p className="toast-inline">{rescheduleMsg}</p> : null}
              </>
            ) : (
              <div className="stack" style={{ marginTop: '0.75rem' }}>
                <p className="muted" style={{ margin: 0 }}>
                  Nothing due today. Plant a habit or clear a snooze.
                </p>
                <Link to="/dashboard/habit/new" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>
                  Create your first habit
                </Link>
              </div>
            )}
            <div className="row row-between" style={{ marginTop: '1rem' }}>
              <span className="muted">Streak · {best} days</span>
              <span className="muted">Today · {rate}%</span>
            </div>
            <ProgressBar value={rate} label="Today completion across habits" />
          </Card>

          <Card>
            <div className="row row-between">
              <h2 style={{ margin: 0 }}>Your habits</h2>
              <Link
                to="/dashboard/habit/new"
                className="btn btn--primary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
              >
                New habit
              </Link>
            </div>
            {oneFocus && focusHabit ? (
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                Focus-friendly view: one primary habit above; the rest stay accessible below.
              </p>
            ) : null}
            {active.length === 0 ? (
              <div className="stack" style={{ marginTop: '1rem' }}>
                <p className="muted">Quiet day. Add a habit to see today&apos;s rhythm.</p>
                <Link to="/dashboard/habit/new" className="btn btn--secondary btn--block" style={{ textAlign: 'center' }}>
                  Create your first habit
                </Link>
              </div>
            ) : listHabits.length === 0 ? (
              <p className="muted" style={{ marginTop: '1rem' }}>
                {filtered.length === 0 && q ? 'No matches. Try another search.' : 'You’re on your primary habit for now.'}
              </p>
            ) : (
              <div style={{ marginTop: '0.5rem' }}>
                {listHabits.map((h) => (
                  <HabitRow key={h.id} habit={h} today={today} onToggle={() => toggleCompleteToday(h.id)} />
                ))}
              </div>
            )}
            <div className="row" style={{ marginTop: '1rem' }}>
              <Link to="/insights" className="muted" style={{ fontWeight: 600 }}>
                View all insights →
              </Link>
            </div>
          </Card>
        </div>

        <div className="stack-lg">
          <Card>
            <h3 style={{ marginTop: 0 }}>Adaptive insights</h3>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              {weekInsight}
            </p>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              Energy peak from quiz:{' '}
              <strong style={{ color: 'var(--text)' }}>{profile.quizAnswers?.energyPeak || 'not set'}</strong>. Prefer
              harder habits in that window.
            </p>
          </Card>
          <Card>
            <h3 style={{ marginTop: 0 }}>A nudge for you</h3>
            <p className="muted" style={{ fontSize: '0.95rem' }}>
              {support}
            </p>
          </Card>
          <Card>
            <h3 style={{ marginTop: 0 }}>This week</h3>
            <WeekChart series={weekSeries} ariaLabel="Last seven days completion intensity" />
            <p className="muted" style={{ fontSize: '0.8rem', marginBottom: 0 }}>
              Bar height reflects share of habits completed that day.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HabitRow({ habit, today, onToggle }) {
  const done = habit.completedDates?.includes(today);
  const streak = habitStreak(habit, today);
  return (
    <div className="habit-row">
      <div className="habit-row__top">
        <div>
          <strong>{habit.title}</strong>
          {habit.description ? (
            <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              {habit.description}
            </p>
          ) : null}
        </div>
        <div className="row">
          <span className="badge badge--neutral">{habit.frequency}</span>
          <span className="muted" style={{ fontSize: '0.8rem' }}>
            Streak {streak}d
          </span>
        </div>
      </div>
      {habit.progressTarget && habit.progressTarget > 0 ? (
        <ProgressBar value={habit.progressCurrent || 0} max={habit.progressTarget} label="Progress" />
      ) : null}
      <div className="row row-between">
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {done ? 'Completed today' : 'Not started'}
        </span>
        <div className="row">
          <Link
            to={`/dashboard/habit/${habit.id}/edit`}
            className="btn btn--ghost"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          >
            Edit
          </Link>
          <Button type="button" variant={done ? 'secondary' : 'primary'} onClick={onToggle}>
            {done ? 'Undo' : 'Complete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

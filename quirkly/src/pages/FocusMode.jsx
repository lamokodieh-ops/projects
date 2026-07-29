import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';
import { toISODate } from '../utils/dates.js';
import { habitStreak } from '../utils/streaks.js';

const DEFAULT_SEC = 25 * 60;

function formatTime(total) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function SubtaskChecklist({ subtasks }) {
  const [doneSub, setDoneSub] = useState(() => new Set());
  function toggleSub(i) {
    setDoneSub((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }
  return (
    <div>
      <p className="field__label">
        Targets ({[...doneSub].length}/{subtasks.length})
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="stack">
        {subtasks.map((t, i) => (
          <li key={i}>
            <label className="row" style={{ gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={doneSub.has(i)} onChange={() => toggleSub(i)} />
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FocusMode() {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const { profile, habits, toggleCompleteToday } = useQuirkly();
  const activeHabits = useMemo(() => habits.filter((h) => h.active), [habits]);

  const routeValid = Boolean(habitId && activeHabits.some((h) => h.id === habitId));
  const selectedId = routeValid ? habitId : activeHabits[0]?.id || '';

  const current = useMemo(() => activeHabits.find((h) => h.id === selectedId), [activeHabits, selectedId]);

  const [seconds, setSeconds] = useState(DEFAULT_SEC);
  const [running, setRunning] = useState(false);
  const [everStarted, setEverStarted] = useState(false);
  const tick = useRef(null);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick.current);
  }, [running]);

  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  const today = toISODate();
  const streak = current ? habitStreak(current, today) : 0;

  const subtasks = current?.subtasks?.length
    ? current.subtasks
    : ['Open your materials', 'First tiny action', 'Close with a one-line note'];

  const timerLabel = running ? 'Pause' : everStarted ? 'Resume' : 'Start';

  return (
    <div className="page page--narrow">
      <div className="row row-between">
        <Link to="/dashboard" className="muted">
          ← Dashboard
        </Link>
        <span className="badge badge--neutral">Focus session</span>
      </div>
      <h1 style={{ marginTop: '0.5rem' }}>Focus session</h1>
      <p className="muted">Stay with one habit. Pause anytime—this is practice, not a test.</p>

      {!activeHabits.length ? (
        <Card>
          <p className="muted">No active habits. Create one to start a session.</p>
          <Link to="/dashboard/habit/new" className="btn btn--primary">
            New habit
          </Link>
        </Card>
      ) : (
        <Card className="stack-lg anim-fade-up">
          <div>
            <label className="field__label" htmlFor="habit-pick">
              Habit
            </label>
            <select
              id="habit-pick"
              className="field__input"
              value={selectedId}
              onChange={(e) => navigate(`/focus/${e.target.value}`, { replace: true })}
            >
              {activeHabits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>
          {current ? (
            <>
              <div>
                <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                  Focusing on
                </p>
                <h2 style={{ margin: '0.25rem 0 0' }}>{current.title}</h2>
              </div>
              <p className="timer-display" aria-live="polite">
                {formatTime(seconds)}
              </p>
              <div className="row">
                <Button
                  type="button"
                  variant={running ? 'secondary' : 'primary'}
                  onClick={() => {
                    setRunning((r) => {
                      const next = !r;
                      if (next) setEverStarted(true);
                      return next;
                    });
                  }}
                >
                  {timerLabel}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setRunning(false);
                    setSeconds(DEFAULT_SEC);
                    setEverStarted(false);
                  }}
                >
                  Reset
                </Button>
                <Button type="button" variant="secondary" onClick={() => toggleCompleteToday(current.id)}>
                  Mark today done
                </Button>
              </div>
              <SubtaskChecklist key={selectedId} subtasks={subtasks} />
              <p className="muted" style={{ margin: 0 }}>
                Streak · {streak} days
              </p>
              <blockquote className="quote-block" style={{ margin: 0 }}>
                &ldquo;Small focus beats scattered ambition.&rdquo;
              </blockquote>
              <div className="row">
                <Link to="/insights" className="btn btn--ghost">
                  Explore insights
                </Link>
              </div>
            </>
          ) : null}
        </Card>
      )}
    </div>
  );
}

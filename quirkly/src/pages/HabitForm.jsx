import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';
import { microStepForDifficulty } from '../engine/personalization.js';
import { toISODate } from '../utils/dates.js';

export function HabitForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, habits, addHabit, updateHabit, deleteHabit } = useQuirkly();
  const isNew = location.pathname.endsWith('/habit/new');
  const existing = useMemo(() => (isNew ? undefined : habits.find((h) => h.id === id)), [habits, id, isNew]);
  const isEdit = !isNew && Boolean(id);

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [frequency, setFrequency] = useState(existing?.frequency || 'daily');
  const [targetDays, setTargetDays] = useState(existing?.targetDays ?? 3);
  const [category, setCategory] = useState(existing?.category || 'Wellness');
  const [preferredTime, setPreferredTime] = useState(existing?.preferredTime || 'morning');
  const [microStep, setMicroStep] = useState(existing?.suggestedMicroStep || '');
  const [progressTarget, setProgressTarget] = useState(existing?.progressTarget ?? '');
  const [progressCurrent, setProgressCurrent] = useState(existing?.progressCurrent ?? '');
  const [active, setActive] = useState(existing?.active !== false);

  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  if (!isNew && id && !existing) return <Navigate to="/dashboard" replace />;

  function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const baseMicro = microStep.trim() || `Spend 2 minutes on: ${title.trim()}`;
    const suggestedMicroStep = profile ? microStepForDifficulty(profile, baseMicro) : baseMicro;
    const pt = progressTarget === '' ? undefined : Number(progressTarget);
    const pc = progressCurrent === '' ? undefined : Number(progressCurrent);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      frequency,
      targetDays: frequency === 'weekly' ? Math.min(7, Math.max(1, targetDays)) : 1,
      category,
      preferredTime,
      suggestedMicroStep,
      progressTarget: pt,
      progressCurrent: pc,
      active,
      completedDates: existing?.completedDates || [],
      createdAt: existing?.createdAt || toISODate(),
    };
    if (isEdit) {
      updateHabit(id, payload);
    } else {
      addHabit({ ...payload, id: crypto.randomUUID() });
    }
    navigate('/dashboard');
  }

  function onDelete() {
    if (!isEdit || !window.confirm('Delete this habit? Progress stays in history until cleared.')) return;
    deleteHabit(id);
    navigate('/dashboard');
  }

  return (
    <div className="page page--narrow">
      <Link to="/dashboard" className="muted" style={{ fontSize: '0.9rem' }}>
        ← Back to dashboard
      </Link>
      <h1>{isEdit ? 'Edit habit' : 'New habit'}</h1>
      <Card>
        <form className="stack-lg" onSubmit={onSubmit}>
          <Input id="ht" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea id="hd" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div>
            <span className="field__label" id="freq-label">
              Frequency
            </span>
            <p className="muted" style={{ fontSize: '0.8rem', margin: '0.25rem 0 0.35rem' }}>
              Daily = every day. Weekly = hit a target number of days each week.
            </p>
            <div className="row" role="radiogroup" aria-labelledby="freq-label">
              <button
                type="button"
                role="radio"
                aria-checked={frequency === 'daily'}
                className={`chip ${frequency === 'daily' ? 'chip--on' : ''}`}
                onClick={() => setFrequency('daily')}
              >
                Daily
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={frequency === 'weekly'}
                className={`chip ${frequency === 'weekly' ? 'chip--on' : ''}`}
                onClick={() => setFrequency('weekly')}
              >
                Weekly
              </button>
            </div>
          </div>
          {frequency === 'weekly' ? (
            <Input
              id="td"
              type="number"
              min={1}
              max={7}
              label="Target days per week"
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
            />
          ) : null}
          <Input id="cat" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <div>
            <span className="field__label">Preferred time</span>
            <div className="row" style={{ marginTop: '0.35rem' }}>
              {['morning', 'afternoon', 'evening'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`chip ${preferredTime === p ? 'chip--on' : ''}`}
                  onClick={() => setPreferredTime(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            id="ms"
            label={
              profile?.taskInitiationDifficulty === 'high'
                ? 'Starter step (recommended — keep it tiny)'
                : 'Starter step (optional)'
            }
            hint={
              profile?.taskInitiationDifficulty === 'high'
                ? 'Your profile prefers 2-minute starts. We’ll prefix “Starter (2 min)” when helpful.'
                : 'We may shorten this automatically if your profile benefits from smaller starts.'
            }
            value={microStep}
            onChange={(e) => setMicroStep(e.target.value)}
          />
          <Input
            id="pt"
            type="number"
            min={0}
            label="Progress target (optional, e.g. cups per day)"
            value={progressTarget}
            onChange={(e) => setProgressTarget(e.target.value === '' ? '' : e.target.value)}
          />
          <Input
            id="pc"
            type="number"
            min={0}
            label="Progress current (optional)"
            value={progressCurrent}
            onChange={(e) => setProgressCurrent(e.target.value === '' ? '' : e.target.value)}
          />
          <label className="row" style={{ gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span className="muted">Active</span>
          </label>
          <div className="row row-between">
            {isEdit ? (
              <Button type="button" variant="ghost" onClick={onDelete}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit">Save habit</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

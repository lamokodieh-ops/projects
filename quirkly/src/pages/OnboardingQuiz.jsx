import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BRAND } from '../brand.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { ToggleChip } from '../components/ui/ToggleChip.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';

const AREAS = ['Fitness', 'Studying', 'Mental Wellness', 'Career'];
const OVERWHELM = ['Too many small tasks', 'Big ambiguous projects', 'Social pressure', 'Unclear priorities'];
const PROCAST = ['Fear of failure', 'Perfectionism', 'Low energy', 'Distraction'];
const BARRIERS = ['Life got too busy', 'Lost motivation', 'No clear plan', 'Set the bar too high'];

const initialQuiz = () => ({
  improvementAreas: [],
  whyHabits: '',
  sleepNote: '',
  motivationSlider: 6,
  idealDay: '',
  overwhelm: '',
  procrastinationReason: '',
  pastBarriers: [],
  confidenceTopics: '',
  scheduleOutline: '',
  routineStyle: /** @type {'structure' | 'flexibility'} */ ('structure'),
  energyPeak: /** @type {'morning' | 'afternoon' | 'evening'} */ ('morning'),
  accountability: /** @type {'gentle' | 'strict'} */ ('gentle'),
  initialHabitIdeas: [],
  dailyTimeCommitmentMinutes: 30,
  initialHabitCount: 3,
});

export function OnboardingQuiz() {
  const navigate = useNavigate();
  const { profile, completeOnboarding, seedHabitsFromQuiz } = useQuirkly();
  const [step, setStep] = useState(0);
  const [habitInput, setHabitInput] = useState('');
  const [q, setQ] = useState(initialQuiz);

  const pct = useMemo(() => Math.round(((step + 1) / 4) * 100), [step]);

  if (!profile) return <Navigate to="/signup" replace />;

  function toggleArea(a) {
    setQ((prev) => {
      const has = prev.improvementAreas.includes(a);
      return {
        ...prev,
        improvementAreas: has ? prev.improvementAreas.filter((x) => x !== a) : [...prev.improvementAreas, a],
      };
    });
  }

  function toggleBarrier(b) {
    setQ((prev) => {
      const has = prev.pastBarriers.includes(b);
      return {
        ...prev,
        pastBarriers: has ? prev.pastBarriers.filter((x) => x !== b) : [...prev.pastBarriers, b],
      };
    });
  }

  function addHabitChip() {
    const t = habitInput.trim();
    if (!t) return;
    setQ((prev) => ({ ...prev, initialHabitIdeas: [...prev.initialHabitIdeas, t] }));
    setHabitInput('');
  }

  function finish() {
    const ideas =
      q.initialHabitIdeas.length > 0
        ? q.initialHabitIdeas
        : habitInput.trim()
          ? [habitInput.trim()]
          : ['Morning hydration', '10 min walk', 'Evening reflection'];
    completeOnboarding({ ...q, initialHabitIdeas: ideas });
    seedHabitsFromQuiz(ideas, q.initialHabitCount);
    navigate('/onboarding/results', { replace: true });
  }

  return (
    <div className="page page--narrow">
      <div className="row row-between">
        <p className="display" style={{ fontSize: '1.2rem', margin: 0 }}>
          {BRAND.name}
        </p>
        <span className="muted" style={{ fontSize: '0.85rem' }} id="onb-pct">
          Onboarding · {pct}% complete
        </span>
      </div>
      <div
        className="onb-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-labelledby="onb-pct"
      >
        <div className="onb-progress__fill" style={{ width: `${pct}%` }} />
      </div>

      <Card style={{ marginTop: '1.25rem' }}>
        {step === 0 ? (
          <Phase1 q={q} setQ={setQ} toggleArea={toggleArea} />
        ) : step === 1 ? (
          <Phase2 q={q} setQ={setQ} toggleBarrier={toggleBarrier} />
        ) : step === 2 ? (
          <Phase3 q={q} setQ={setQ} />
        ) : (
          <Phase4
            q={q}
            setQ={setQ}
            habitInput={habitInput}
            setHabitInput={setHabitInput}
            addHabitChip={addHabitChip}
          />
        )}

        <div className="row row-between" style={{ marginTop: '1.5rem' }}>
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Previous
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={finish}>
              Confirm & finish setup
            </Button>
          )}
        </div>
        <p className="muted" style={{ fontSize: '0.8rem', marginTop: '1rem', marginBottom: 0 }}>
          {BRAND.name} Guide — your answers personalize nudges and layout. This is not a medical or psychological
          assessment.
        </p>
      </Card>
    </div>
  );
}

function Phase1({ q, setQ, toggleArea }) {
  return (
    <div className="stack-lg">
      <h2 style={{ marginTop: 0 }}>Phase 01 — Goal setting & motivation</h2>
      <p className="muted" id="areas-label">
        What are the main areas you want to improve?
      </p>
      <div className="row" role="group" aria-labelledby="areas-label">
        {AREAS.map((a) => (
          <ToggleChip key={a} selected={q.improvementAreas.includes(a)} onToggle={() => toggleArea(a)}>
            {a}
          </ToggleChip>
        ))}
      </div>
      <Textarea
        id="why"
        label="Why do you want to build these habits?"
        placeholder="Define your deep why..."
        value={q.whyHabits}
        onChange={(e) => setQ({ ...q, whyHabits: e.target.value })}
      />
      <Input
        id="sleep"
        label="Sleep (optional note)"
        placeholder="e.g. 11pm wind-down"
        value={q.sleepNote}
        onChange={(e) => setQ({ ...q, sleepNote: e.target.value })}
      />
      <div>
        <label className="field__label" htmlFor="mot">
          How motivated are you to change right now? ({q.motivationSlider}/10)
        </label>
        <input
          id="mot"
          type="range"
          min={1}
          max={10}
          value={q.motivationSlider}
          onChange={(e) => setQ({ ...q, motivationSlider: Number(e.target.value) })}
          className="field__input"
        />
        <div className="slider-row">
          <span>Gentle curiosity</span>
          <span>Unstoppable force</span>
        </div>
      </div>
      <Textarea
        id="ideal"
        label="What does a successful day look like to you?"
        placeholder="Describe your ideal daily flow..."
        value={q.idealDay}
        onChange={(e) => setQ({ ...q, idealDay: e.target.value })}
      />
    </div>
  );
}

function Phase2({ q, setQ, toggleBarrier }) {
  return (
    <div className="stack-lg">
      <h2 style={{ marginTop: 0 }}>Phase 02 — Understanding your challenges</h2>
      <p className="muted" id="overwhelm-label">
        What tends to overwhelm you most?
      </p>
      <div className="row" role="radiogroup" aria-labelledby="overwhelm-label">
        {OVERWHELM.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={q.overwhelm === o}
            className={`chip ${q.overwhelm === o ? 'chip--on' : ''}`}
            onClick={() => setQ({ ...q, overwhelm: o })}
          >
            {o}
          </button>
        ))}
      </div>
      <p className="muted" id="procast-label">
        Why do you usually put things off?
      </p>
      <div className="row" role="radiogroup" aria-labelledby="procast-label">
        {PROCAST.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={q.procrastinationReason === o}
            className={`chip ${q.procrastinationReason === o ? 'chip--on' : ''}`}
            onClick={() => setQ({ ...q, procrastinationReason: o })}
          >
            {o}
          </button>
        ))}
      </div>
      <p className="muted" id="barriers-label">
        What has stopped you from sticking to habits in the past?
      </p>
      <div className="row" role="group" aria-labelledby="barriers-label">
        {BARRIERS.map((b) => (
          <ToggleChip key={b} selected={q.pastBarriers.includes(b)} onToggle={() => toggleBarrier(b)}>
            {b}
          </ToggleChip>
        ))}
      </div>
      <Textarea
        id="conf"
        label="Which topics or tasks make it harder to feel confident?"
        placeholder="e.g. Public speaking, complex math..."
        value={q.confidenceTopics}
        onChange={(e) => setQ({ ...q, confidenceTopics: e.target.value })}
      />
    </div>
  );
}

function Phase3({ q, setQ }) {
  return (
    <div className="stack-lg">
      <h2 style={{ marginTop: 0 }}>Phase 03 — Lifestyle & preferences</h2>
      <Textarea
        id="sched"
        label="What does your typical daily schedule look like?"
        placeholder="Briefly outline your day..."
        value={q.scheduleOutline}
        onChange={(e) => setQ({ ...q, scheduleOutline: e.target.value })}
      />
      <p className="muted">Routine style preference</p>
      <div className="row">
        <button
          type="button"
          className={`chip ${q.routineStyle === 'structure' ? 'chip--on' : ''}`}
          onClick={() => setQ({ ...q, routineStyle: 'structure' })}
        >
          Structure
        </button>
        <button
          type="button"
          className={`chip ${q.routineStyle === 'flexibility' ? 'chip--on' : ''}`}
          onClick={() => setQ({ ...q, routineStyle: 'flexibility' })}
        >
          Flexibility
        </button>
      </div>
      <p className="muted">When is your energy peak?</p>
      <div className="row">
        {['morning', 'afternoon', 'evening'].map((p) => (
          <button
            key={p}
            type="button"
            className={`chip ${q.energyPeak === p ? 'chip--on' : ''}`}
            onClick={() => setQ({ ...q, energyPeak: p })}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <p className="muted">Preferred accountability style</p>
      <div className="row">
        <button
          type="button"
          className={`chip ${q.accountability === 'gentle' ? 'chip--on' : ''}`}
          onClick={() => setQ({ ...q, accountability: 'gentle' })}
        >
          Gentle reminders
        </button>
        <button
          type="button"
          className={`chip ${q.accountability === 'strict' ? 'chip--on' : ''}`}
          onClick={() => setQ({ ...q, accountability: 'strict' })}
        >
          Strict accountability
        </button>
      </div>
    </div>
  );
}

function Phase4({ q, setQ, habitInput, setHabitInput, addHabitChip }) {
  return (
    <div className="stack-lg">
      <h2 style={{ marginTop: 0 }}>Phase 04 — Habit selection</h2>
      <p className="muted">Specific habits to track (add one at a time)</p>
      <div className="row">
        <input
          className="field__input"
          style={{ flex: 1, minWidth: '160px' }}
          placeholder="e.g. Build: Meditation"
          value={habitInput}
          onChange={(e) => setHabitInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHabitChip())}
        />
        <Button type="button" variant="secondary" onClick={addHabitChip}>
          Add
        </Button>
      </div>
      {q.initialHabitIdeas.length ? (
        <ul className="muted" style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {q.initialHabitIdeas.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : null}
      <div>
        <label className="field__label" htmlFor="mins">
          Daily time commitment (minutes)
        </label>
        <input
          id="mins"
          type="number"
          min={5}
          max={240}
          className="field__input"
          value={q.dailyTimeCommitmentMinutes}
          onChange={(e) => setQ({ ...q, dailyTimeCommitmentMinutes: Number(e.target.value) || 30 })}
        />
      </div>
      <div>
        <label className="field__label" htmlFor="count">
          Number of initial habits
        </label>
        <input
          id="count"
          type="number"
          min={1}
          max={8}
          className="field__input"
          value={q.initialHabitCount}
          onChange={(e) => setQ({ ...q, initialHabitCount: Number(e.target.value) || 3 })}
        />
        <p className="field__hint muted">Recommended: 3–5 habits</p>
      </div>
    </div>
  );
}

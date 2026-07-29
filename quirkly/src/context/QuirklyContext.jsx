import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BRAND } from '../brand.js';
import { buildDemoState, isDemo } from '../demoData.js';
import { derivePersonalization } from '../engine/personalization.js';
import { addDays, toISODate } from '../utils/dates.js';
import { clearState, loadState, saveState } from '../utils/storage.js';

const Ctx = createContext(null);

function defaultState() {
  return {
    profile: null,
    habits: [],
    theme: /** @type {import('../types.js').ThemeId} */ ('ink'),
    morningNudges: true,
    weeklyReports: true,
  };
}

function initialState() {
  const saved = loadState();
  if (saved?.profile) return saved;
  if (isDemo) {
    const demo = buildDemoState();
    saveState(demo);
    return demo;
  }
  return defaultState();
}

export function QuirklyProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = useCallback((patch) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const signUp = useCallback(({ name, email }) => {
    const memberSince = new Date().toLocaleString('en', { month: 'short', year: 'numeric' });
    setState((s) => ({
      ...s,
      profile: {
        name,
        email,
        onboardingCompleted: false,
        motivationLevel: 5,
        focusStyle: 'balanced',
        forgetfulnessLevel: 'medium',
        routinePreference: 'structure',
        taskInitiationDifficulty: 'medium',
        prefersSimpleView: false,
        encouragementPreference: 'minimal',
        quizAnswers: null,
        derivedProfileType: '',
        derivedProfileBlurb: '',
        derivedChallenges: [],
        derivedStrengths: [],
        memberSince,
      },
    }));
  }, []);

  const signInLocal = useCallback(({ email }) => {
    const s = loadState() || defaultState();
    if (!s.profile || s.profile.email !== email.trim()) return { ok: false };
    setState(s);
    return { ok: true, profile: s.profile };
  }, []);

  const completeOnboarding = useCallback((quizAnswers) => {
    const derived = derivePersonalization(quizAnswers);
    setState((s) => {
      if (!s.profile) return s;
      return {
        ...s,
        profile: {
          ...s.profile,
          onboardingCompleted: true,
          quizAnswers,
          motivationLevel: derived.motivationLevel,
          focusStyle: derived.focusStyle,
          forgetfulnessLevel: derived.forgetfulnessLevel,
          routinePreference: derived.routinePreference,
          taskInitiationDifficulty: derived.taskInitiationDifficulty,
          prefersSimpleView: derived.prefersSimpleView,
          encouragementPreference: derived.encouragementPreference,
          derivedProfileType: derived.derivedProfileType,
          derivedProfileBlurb: derived.derivedProfileBlurb,
          derivedChallenges: derived.derivedChallenges,
          derivedStrengths: derived.derivedStrengths,
          focusScore: derived.focusScore,
        },
      };
    });
  }, []);

  const seedHabitsFromQuiz = useCallback((ideas, count) => {
    const n = Math.min(Math.max(count || 3, 1), 8);
    const picked = (ideas || []).slice(0, n);
    const pad = ['Morning hydration', '10 min walk', 'Evening reflection'];
    const titles = picked.length ? picked : pad.slice(0, n);
    const today = toISODate();
    setState((s) => {
      if (s.habits.length > 0) return s;
      const next = [...s.habits];
      titles.forEach((title) => {
        if (!title?.trim()) return;
        next.push({
          id: crypto.randomUUID(),
          title: title.trim(),
          description: '',
          frequency: 'daily',
          targetDays: 1,
          category: 'Wellness',
          preferredTime: 'morning',
          createdAt: today,
          completedDates: [],
          active: true,
          suggestedMicroStep: `Open the app and spend 2 minutes on: ${title.trim()}`,
          subtasks: [],
        });
      });
      return { ...s, habits: next };
    });
  }, []);

  const addHabit = useCallback((habit) => {
    setState((s) => ({
      ...s,
      habits: [...s.habits, { ...habit, id: habit.id || crypto.randomUUID(), completedDates: habit.completedDates || [] }],
    }));
  }, []);

  const updateHabit = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));
  }, []);

  const deleteHabit = useCallback((id) => {
    setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
  }, []);

  const toggleCompleteToday = useCallback((habitId, dateIso = toISODate()) => {
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => {
        if (h.id !== habitId) return h;
        const set = new Set(h.completedDates || []);
        if (set.has(dateIso)) set.delete(dateIso);
        else set.add(dateIso);
        return { ...h, completedDates: [...set].sort(), snoozeUntil: undefined };
      }),
    }));
  }, []);

  /** Push habit off today’s focus until tomorrow */
  const rescheduleHabit = useCallback((habitId) => {
    const tomorrow = addDays(toISODate(), 1);
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === habitId ? { ...h, snoozeUntil: tomorrow } : h)),
    }));
  }, []);

  const setTheme = useCallback((theme) => update({ theme }), [update]);

  const setPrefs = useCallback((morningNudges, weeklyReports) => {
    setState((s) => ({ ...s, morningNudges, weeklyReports }));
  }, []);

  const retakeQuiz = useCallback(() => {
    setState((s) => {
      if (!s.profile) return s;
      return {
        ...s,
        profile: { ...s.profile, onboardingCompleted: false, quizAnswers: null },
      };
    });
  }, []);

  const logout = useCallback(() => {
    setState(defaultState());
    clearState();
  }, []);

  const loadDemo = useCallback(() => {
    const demo = buildDemoState();
    setState(demo);
    saveState(demo);
  }, []);

  const importJson = useCallback((text) => {
    const parsed = JSON.parse(text);
    setState(parsed);
    saveState(parsed);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isDemo,
      update,
      signUp,
      signInLocal,
      completeOnboarding,
      seedHabitsFromQuiz,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompleteToday,
      rescheduleHabit,
      setTheme,
      setPrefs,
      retakeQuiz,
      logout,
      importJson,
      loadDemo,
    }),
    [
      state,
      update,
      signUp,
      signInLocal,
      completeOnboarding,
      seedHabitsFromQuiz,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompleteToday,
      rescheduleHabit,
      setTheme,
      setPrefs,
      retakeQuiz,
      logout,
      importJson,
      loadDemo,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider module
export function useQuirkly() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useQuirkly requires QuirklyProvider');
  return v;
}

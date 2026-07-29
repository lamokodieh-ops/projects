import { addDays, parseISODate, toISODate, weekKey } from './dates.js';

/**
 * @param {import('../types.js').Habit} habit
 * @param {string} todayIso
 */
export function habitStreak(habit, todayIso = toISODate()) {
  if (!habit.active) return 0;
  const dates = new Set(habit.completedDates || []);
  if (habit.frequency === 'weekly') {
    return weeklyStreak(habit, dates, todayIso);
  }
  return dailyStreak(dates, todayIso);
}

function dailyStreak(dates, todayIso) {
  let streak = 0;
  let cursor = todayIso;
  if (!dates.has(todayIso)) {
    cursor = addDays(todayIso, -1);
  }
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Weekly: count consecutive weeks where completions in that week >= targetDays
 * @param {import('../types.js').Habit} habit
 * @param {Set<string>} dates
 * @param {string} todayIso
 */
function weeklyStreak(habit, dates, todayIso) {
  const target = Math.max(1, habit.targetDays || 1);
  let streak = 0;
  let d = parseISODate(todayIso);
  for (let w = 0; w < 520; w++) {
    const iso = toISODate(d);
    const wk = weekKey(iso);
    let count = 0;
    for (const dt of dates) {
      if (weekKey(dt) === wk) count += 1;
    }
    if (count >= target) {
      streak += 1;
      d.setDate(d.getDate() - 7);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * @param {import('../types.js').Habit[]} habits
 * @param {string} todayIso
 */
export function bestStreakAcrossHabits(habits, todayIso) {
  return habits.reduce((m, h) => Math.max(m, habitStreak(h, todayIso)), 0);
}

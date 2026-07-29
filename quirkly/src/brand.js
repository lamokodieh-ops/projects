/** Central brand + copy for Quirkly */

export const BRAND = {
  name: 'Quirkly',
  tagline: 'Habits that fit how you actually work.',
  positioning: 'Personality-aware habit tracking',
  heroHeadline: 'Build habits that feel like you.',
  heroSupport:
    'Quirkly learns your focus style, motivation, and friction points—then keeps starter steps small and reminders honest.',
  footerBlurb: 'A playful habit companion for students and anyone rebuilding routine without the guilt spiral.',
  copyright: `© ${new Date().getFullYear()} Quirkly. Built for clarity, quirks welcome.`,
  storageKey: 'quirkly_state_v1',
  legacyStorageKey: 'atomicflo_state_v1',
  exportFilename: 'quirkly-export.json',
};

export const THEMES = [
  { id: 'ink', label: 'Ink' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'pop', label: 'Pop' },
];

/** Migrate legacy AtomicFlo theme ids */
export function normalizeTheme(theme) {
  const map = { deep: 'ink', mist: 'cloud', moss: 'pop' };
  if (map[theme]) return map[theme];
  if (THEMES.some((t) => t.id === theme)) return theme;
  return 'ink';
}

export function timeGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Streak → display level */
export function levelFromStreak(streak) {
  if (streak >= 14) return 'Legend';
  if (streak >= 7) return 'Quirk';
  if (streak >= 3) return 'Groove';
  return 'Spark';
}

/** Profile → settings badge */
export function badgeFromProfile(profile) {
  if (!profile) return 'Member';
  if (profile.encouragementPreference === 'supportive') return 'Soft starter';
  if (profile.focusStyle === 'deep_work') return 'Deep diver';
  if (profile.routinePreference === 'structure') return 'Steady planner';
  return 'Flexible finder';
}

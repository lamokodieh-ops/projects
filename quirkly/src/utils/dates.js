export function toISODate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function parseISODate(s) {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
}

export function addDays(iso, n) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Monday-based ISO week: YYYY-Www */
export function weekKey(iso) {
  const d = parseISODate(iso);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  const y = d.getFullYear();
  const start = new Date(y, 0, 1);
  const diff = Math.floor((d - start) / 86400000);
  const w = Math.floor(diff / 7) + 1;
  return `${y}-W${String(w).padStart(2, '0')}`;
}

export function lastNDays(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(toISODate(d));
  }
  return out;
}

export function weekdayLabels() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function shortWeekday(iso) {
  return SHORT[parseISODate(iso).getDay()];
}

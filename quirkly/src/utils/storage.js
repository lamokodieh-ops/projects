import { BRAND, normalizeTheme } from '../brand.js';

const STORAGE_KEY = BRAND.storageKey;
const LEGACY_KEY = BRAND.legacyStorageKey;

function migrateState(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ...raw,
    theme: normalizeTheme(raw.theme || 'ink'),
  };
}

/** @returns {import('../types.js').AppState | null} */
export function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        raw = legacy;
        const migrated = migrateState(JSON.parse(legacy));
        if (migrated) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          localStorage.removeItem(LEGACY_KEY);
          return migrated;
        }
      }
      return null;
    }
    return migrateState(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** @param {import('../types.js').AppState} state */
export function saveState(state) {
  const next = migrateState(state) || state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

export function exportStateJson(state) {
  return JSON.stringify(migrateState(state) || state, null, 2);
}

export function importStateJson(text) {
  const parsed = migrateState(JSON.parse(text));
  saveState(parsed);
  return parsed;
}

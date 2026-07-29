import { useEffect } from 'react';
import { normalizeTheme } from '../brand.js';
import { useQuirkly } from '../context/QuirklyContext.jsx';

export function ThemeBinder() {
  const { theme } = useQuirkly();
  useEffect(() => {
    document.documentElement.className = `theme-${normalizeTheme(theme)}`;
  }, [theme]);
  return null;
}

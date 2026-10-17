import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Dark / light switch for every visitor. The choice is kept on this device
// (localStorage "theme"); the inline script in app/layout.jsx applies it before
// the page paints, so there's no white flash. The colours live in dark-theme.css.
export const THEME_KEY = 'theme';

const ThemeToggle = ({ className = '' }) => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem(THEME_KEY, next ? 'dark' : 'light'); } catch { /* storage blocked: still switches for this visit */ }
  };

  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} aria-pressed={dark} className={className}>
      {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;

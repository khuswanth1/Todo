const STORAGE_KEY = 'todo_theme_config';

// Mode-appropriate defaults — kept in sync with defaults() in ThemeSettings.jsx
export const modeDefaults = (isDark) => ({
  primaryColor: '#4f46e5',
  bgColor: isDark ? '#0f172a' : '#f8fafc',
  sidebarColor: isDark ? '#1e293b' : '#ffffff',
  cardColor: isDark ? '#1e293b' : '#ffffff',
  headingColor: isDark ? '#ffffff' : '#0f172a',
  textColor: isDark ? '#cbd5e1' : '#475569',
  buttonBgColor: '#4f46e5',
  buttonTextColor: '#ffffff',
  fontSize: '16px',
  fontFamily: 'Inter',
  borderRadius: '1rem',
  logoImage: null
});

/**
 * Switch light/dark/system mode the same way the Theme Studio mode buttons do:
 * resync the custom surface colors to the new mode, disable custom color
 * overrides, update the CSS variables immediately, notify the rest of the app,
 * and persist to the backend so a reload doesn't revert the switch.
 */
export function applyThemeModeSwitch(newTheme, isSystemDark) {
  localStorage.setItem('theme', newTheme);
  const isDark = newTheme === 'dark' || (newTheme === 'system' && isSystemDark);
  const d = modeDefaults(isDark);

  let saved = null;
  try {
    const savedStr = localStorage.getItem(STORAGE_KEY);
    saved = savedStr ? JSON.parse(savedStr) : null;
  } catch (err) {
    saved = null;
  }

  const nextConfig = {
    ...d,
    ...(saved || {}),
    bgColor: d.bgColor,
    sidebarColor: d.sidebarColor,
    cardColor: d.cardColor,
    headingColor: d.headingColor,
    textColor: d.textColor,
    enableFontFamily: saved?.enableFontFamily ?? true,
    enableBorderRadius: saved?.enableBorderRadius ?? true,
    enableColors: false
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
  } catch (err) {}

  // Update the CSS variables so pages driven by the custom theme switch immediately
  const root = document.documentElement;
  root.style.setProperty('--bg-color', nextConfig.bgColor);
  root.style.setProperty('--sidebar-color', nextConfig.sidebarColor);
  root.style.setProperty('--card-color', nextConfig.cardColor);
  root.style.setProperty('--heading-color', nextConfig.headingColor);
  root.style.setProperty('--text-color', nextConfig.textColor);
  root.classList.remove('theme-colors');

  // Notify App.jsx / ThemeSettings so every mounted page re-applies the theme
  window.dispatchEvent(new Event('storage'));

  // Persist to backend so fetchProfile doesn't revert the switch on reload
  const token = localStorage.getItem('token');
  if (token) {
    fetch('/api/settings/theme', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(nextConfig)
    }).catch(() => {});
  }

  return nextConfig;
}

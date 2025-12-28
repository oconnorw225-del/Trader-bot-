/**
 * Theme Manager
 * Handles dark/light theme switching and persistence
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.setupMediaQueryListener();
  }

  /**
   * Load theme from localStorage or system preference
   */
  loadTheme() {
    const saved = localStorage.getItem('ndax-theme');
    if (saved) {
      return saved;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    this.currentTheme = theme;
    localStorage.setItem('ndax-theme', theme);

    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * Toggle between dark and light theme
   */
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }

  /**
   * Set specific theme
   */
  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') {
      throw new Error('Invalid theme. Must be "dark" or "light"');
    }
    this.applyTheme(theme);
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Check if dark theme is active
   */
  isDark() {
    return this.currentTheme === 'dark';
  }

  /**
   * Listen for system theme changes
   */
  setupMediaQueryListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = localStorage.getItem('ndax-theme');
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(newTheme);
        }
      });
    }
  }

  /**
   * Add listener for theme changes
   */
  onThemeChange(callback) {
    window.addEventListener('themechange', (e) => callback(e.detail.theme));
  }

  /**
   * Remove theme change listener
   */
  offThemeChange(callback) {
    window.removeEventListener('themechange', callback);
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

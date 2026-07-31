(() => {
  const STORAGE_KEY = 'sudoku-theme';
  const DEFAULT_THEME = 'light';

  class SudokuTheme {
    constructor() {
      this.currentTheme = DEFAULT_THEME;
      this.button = document.getElementById('theme-toggle');
      this.init();
    }

    getStoredTheme() {
      try {
        const storedTheme = window.localStorage.getItem(STORAGE_KEY);
        return storedTheme === 'dark' ? 'dark' : DEFAULT_THEME;
      } catch (error) {
        return DEFAULT_THEME;
      }
    }

    applyTheme(theme) {
      const nextTheme = theme === 'dark' ? 'dark' : DEFAULT_THEME;
      document.body.dataset.theme = nextTheme;
      this.currentTheme = nextTheme;

      if (this.button) {
        const isDark = nextTheme === 'dark';
        this.button.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        this.button.setAttribute('aria-pressed', String(isDark));
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (error) {
        // Ignore storage failures gracefully.
      }
    }

    toggle() {
      const nextTheme = this.currentTheme === 'dark' ? DEFAULT_THEME : 'dark';
      this.applyTheme(nextTheme);
    }

    bindEvents() {
      if (!this.button) {
        return;
      }

      this.button.addEventListener('click', () => this.toggle());
    }

    init() {
      this.currentTheme = this.getStoredTheme();
      this.bindEvents();
      this.applyTheme(this.currentTheme);
    }
  }

  window.SudokuTheme = new SudokuTheme();
})();

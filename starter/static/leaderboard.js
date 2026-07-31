(() => {
  const STORAGE_KEY = 'sudoku-leaderboard';
  const MAX_ENTRIES = 10;

  function normalizeEntry(entry) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    const difficulty = typeof entry.difficulty === 'string' ? entry.difficulty : 'easy';
    const timeSeconds = Number(entry.timeSeconds);

    if (!name || Number.isNaN(timeSeconds)) {
      return null;
    }

    return {
      name,
      difficulty,
      timeSeconds: Math.max(0, Math.floor(timeSeconds)),
      completedAt: entry.completedAt || new Date().toISOString()
    };
  }

  class SudokuLeaderboard {
    constructor(tableElement) {
      this.tableElement = tableElement;
      this.storageKey = STORAGE_KEY;
      this.maxEntries = MAX_ENTRIES;
      this.load();
      this.render();
    }

    getEntries() {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (!raw) {
          return [];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed
          .map(normalizeEntry)
          .filter(Boolean)
          .sort((a, b) => a.timeSeconds - b.timeSeconds)
          .slice(0, this.maxEntries);
      } catch (error) {
        return [];
      }
    }

    save(entries) {
      const normalized = entries
        .map(normalizeEntry)
        .filter(Boolean)
        .sort((a, b) => a.timeSeconds - b.timeSeconds)
        .slice(0, this.maxEntries);

      window.localStorage.setItem(this.storageKey, JSON.stringify(normalized));
      return normalized;
    }

    load() {
      this.entries = this.getEntries();
    }

    addEntry({ name, difficulty, timeSeconds }) {
      const trimmedName = typeof name === 'string' ? name.trim() : '';
      const safeName = trimmedName || 'Anonymous';
      const nextEntry = normalizeEntry({
        name: safeName,
        difficulty,
        timeSeconds,
        completedAt: new Date().toISOString()
      });

      if (!nextEntry) {
        return this.entries;
      }

      const updated = [...this.entries, nextEntry]
        .map(normalizeEntry)
        .filter(Boolean)
        .sort((a, b) => a.timeSeconds - b.timeSeconds)
        .slice(0, this.maxEntries);

      this.entries = this.save(updated);
      this.render();
      return this.entries;
    }

    formatTime(totalSeconds) {
      const safeSeconds = Math.max(0, totalSeconds);
      const minutes = Math.floor(safeSeconds / 60);
      const seconds = safeSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    render() {
      if (!this.tableElement) {
        return;
      }

      const rows = this.entries.length ? this.entries : [];
      const tbody = this.tableElement.querySelector('tbody');
      if (!tbody) {
        return;
      }

      tbody.innerHTML = '';

      if (rows.length === 0) {
        const emptyRow = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'No scores yet. Solve a puzzle to claim the top spot!';
        emptyRow.appendChild(cell);
        tbody.appendChild(emptyRow);
        return;
      }

      rows.forEach((entry, index) => {
        const row = document.createElement('tr');

        const rankCell = document.createElement('td');
        rankCell.textContent = String(index + 1);

        const nameCell = document.createElement('td');
        nameCell.textContent = entry.name;

        const timeCell = document.createElement('td');
        timeCell.textContent = this.formatTime(entry.timeSeconds);

        const difficultyCell = document.createElement('td');
        difficultyCell.textContent = entry.difficulty;

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(timeCell);
        row.appendChild(difficultyCell);
        tbody.appendChild(row);
      });
    }
  }

  window.SudokuLeaderboard = SudokuLeaderboard;
})();

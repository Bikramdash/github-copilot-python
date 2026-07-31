(() => {
  const STORAGE_KEY = 'sudoku-statistics';
  const DEFAULT_STATS = {
    gamesPlayed: 0,
    gamesWon: 0,
    bestTimes: {
      easy: null,
      medium: null,
      hard: null,
    },
  };

  function normalizeStats(rawStats) {
    const safeStats = {
      gamesPlayed: Number(rawStats && rawStats.gamesPlayed) || 0,
      gamesWon: Number(rawStats && rawStats.gamesWon) || 0,
      bestTimes: {
        easy: Number(rawStats && rawStats.bestTimes && rawStats.bestTimes.easy) || null,
        medium: Number(rawStats && rawStats.bestTimes && rawStats.bestTimes.medium) || null,
        hard: Number(rawStats && rawStats.bestTimes && rawStats.bestTimes.hard) || null,
      },
    };

    if (safeStats.gamesPlayed < 0) {
      safeStats.gamesPlayed = 0;
    }
    if (safeStats.gamesWon < 0) {
      safeStats.gamesWon = 0;
    }

    Object.keys(safeStats.bestTimes).forEach((difficulty) => {
      const value = safeStats.bestTimes[difficulty];
      if (value !== null && (!Number.isFinite(value) || value < 0)) {
        safeStats.bestTimes[difficulty] = null;
      }
    });

    return safeStats;
  }

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  class SudokuStatistics {
    constructor(panelElement) {
      this.panelElement = panelElement;
      this.currentDifficulty = 'medium';
      this.currentGameSolved = false;
      this.stats = this.load();
      this.render();
    }

    load() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return JSON.parse(JSON.stringify(DEFAULT_STATS));
        }

        const parsed = JSON.parse(raw);
        return normalizeStats({
          ...DEFAULT_STATS,
          ...parsed,
          bestTimes: {
            ...DEFAULT_STATS.bestTimes,
            ...(parsed.bestTimes || {})
          }
        });
      } catch (error) {
        return JSON.parse(JSON.stringify(DEFAULT_STATS));
      }
    }

    save() {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    }

    getWinPercentage() {
      if (this.stats.gamesPlayed === 0) {
        return 0;
      }
      return Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100);
    }

    recordGameStart(difficulty = 'medium') {
      this.currentDifficulty = difficulty;
      this.currentGameSolved = false;
      this.stats.gamesPlayed += 1;
      this.save();
      this.render();
    }

    recordWin(difficulty = this.currentDifficulty, elapsedSeconds) {
      if (this.currentGameSolved) {
        return this.stats;
      }

      this.currentGameSolved = true;
      this.stats.gamesWon += 1;

      const normalizedDifficulty = typeof difficulty === 'string' ? difficulty.toLowerCase() : 'medium';
      const safeTime = Math.max(0, Number(elapsedSeconds) || 0);
      const currentBest = this.stats.bestTimes[normalizedDifficulty];

      if (currentBest === null || safeTime < currentBest) {
        this.stats.bestTimes[normalizedDifficulty] = safeTime;
      }

      this.save();
      this.render();
      return this.stats;
    }

    render() {
      if (!this.panelElement) {
        return;
      }

      const stats = this.stats;
      const winPercentage = this.getWinPercentage();

      const statCards = [
        { label: 'Games Played', value: stats.gamesPlayed },
        { label: 'Games Won', value: stats.gamesWon },
        { label: 'Win %', value: `${winPercentage}%` },
      ];

      const bestTimes = ['easy', 'medium', 'hard'].map((difficulty) => ({
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        value: stats.bestTimes[difficulty] === null ? '—' : formatTime(stats.bestTimes[difficulty]),
      }));

      this.panelElement.innerHTML = `
        <div class="statistics-grid">
          ${statCards.map((card) => `
            <div class="stat-card">
              <div class="stat-label">${card.label}</div>
              <div class="stat-value">${card.value}</div>
            </div>
          `).join('')}
        </div>
        <div class="best-times">
          <h3>Best Times</h3>
          <ul>
            ${bestTimes.map((entry) => `
              <li>
                <span>${entry.difficulty}</span>
                <strong>${entry.value}</strong>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
  }

  window.SudokuStatistics = SudokuStatistics;
})();

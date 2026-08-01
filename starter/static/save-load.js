(() => {
  const STORAGE_KEY = 'sudoku-game-save';
  const MAX_HISTORY_ENTRIES = 100;

  function cloneBoard(board) {
    if (!Array.isArray(board)) {
      return [];
    }

    return board.map((row) => {
      if (!Array.isArray(row)) {
        return [];
      }
      return row.slice();
    });
  }

  function normalizeBoard(board) {
    if (!Array.isArray(board) || board.length !== 9) {
      return [];
    }

    const normalized = board.map((row) => {
      if (!Array.isArray(row) || row.length !== 9) {
        return Array(9).fill(0);
      }
      return row.map((value) => {
        const numericValue = Number(value);
        return Number.isInteger(numericValue) && numericValue >= 0 && numericValue <= 9 ? numericValue : 0;
      });
    });

    return normalized;
  }

  function normalizeHistory(history) {
    if (!Array.isArray(history)) {
      return [];
    }

    return history
      .map((entry) => normalizeBoard(entry))
      .filter((board) => board.length === 9 && board.every((row) => row.length === 9))
      .slice(-MAX_HISTORY_ENTRIES);
  }

  function normalizeDifficulty(difficulty) {
    return typeof difficulty === 'string' && ['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';
  }

  function normalizeNonNegativeInteger(value, fallback = 0) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return fallback;
    }
    return Math.floor(numericValue);
  }

  class SudokuSaveLoad {
    constructor() {
      this.storageKey = STORAGE_KEY;
      this.version = 1;
    }

    buildSnapshot({ board, initialBoard, difficulty, elapsedSeconds, undoStack, redoStack, running, hintsUsed, movesMade }) {
      return {
        version: this.version,
        board: normalizeBoard(board),
        initialBoard: normalizeBoard(initialBoard).length ? normalizeBoard(initialBoard) : normalizeBoard(board),
        difficulty: normalizeDifficulty(difficulty),
        elapsedSeconds: Math.max(0, Number(elapsedSeconds) || 0),
        undoStack: normalizeHistory(undoStack),
        redoStack: normalizeHistory(redoStack),
        running: Boolean(running),
        hintsUsed: normalizeNonNegativeInteger(hintsUsed, 0),
        movesMade: normalizeNonNegativeInteger(movesMade, 0),
        savedAt: Date.now()
      };
    }

    saveGame(gameState) {
      const snapshot = this.buildSnapshot(gameState);
      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
      } catch (error) {
        // Ignore storage write failures gracefully.
      }
      return snapshot;
    }

    loadGame() {
      try {
        const rawValue = window.localStorage.getItem(this.storageKey);
        if (!rawValue) {
          return null;
        }

        const parsed = JSON.parse(rawValue);
        if (!parsed || typeof parsed !== 'object') {
          return null;
        }

        const board = normalizeBoard(parsed.board);
        const initialBoard = normalizeBoard(parsed.initialBoard);
        if (!board.length) {
          return null;
        }

        return {
          version: Number(parsed.version) || this.version,
          board,
          initialBoard: initialBoard.length ? initialBoard : board,
          difficulty: normalizeDifficulty(parsed.difficulty),
          elapsedSeconds: Math.max(0, Number(parsed.elapsedSeconds) || 0),
          undoStack: normalizeHistory(parsed.undoStack),
          redoStack: normalizeHistory(parsed.redoStack),
          running: Boolean(parsed.running),
          hintsUsed: normalizeNonNegativeInteger(parsed.hintsUsed, 0),
          movesMade: normalizeNonNegativeInteger(parsed.movesMade, 0),
          savedAt: Number(parsed.savedAt) || Date.now()
        };
      } catch (error) {
        return null;
      }
    }

    clearGame() {
      try {
        window.localStorage.removeItem(this.storageKey);
      } catch (error) {
        // Ignore storage clean-up failures gracefully.
      }
    }

    promptToResume() {
      const savedGame = this.loadGame();
      if (!savedGame) {
        return null;
      }

      const shouldContinue = window.confirm('A saved game was found. Would you like to continue your previous game?');
      if (!shouldContinue) {
        this.clearGame();
        return null;
      }

      return savedGame;
    }

    resumeTimer(timer, snapshot) {
      if (!timer || !snapshot) {
        return;
      }

      const elapsedSeconds = Math.max(0, Number(snapshot.elapsedSeconds) || 0);
      if (snapshot.running) {
        timer.elapsedSeconds = elapsedSeconds;
        timer.start();
        return;
      }

      timer.elapsedSeconds = elapsedSeconds;
      timer.stop();
      timer.render();
    }
  }

  window.SudokuSaveLoad = new SudokuSaveLoad();
})();

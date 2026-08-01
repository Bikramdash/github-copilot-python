(() => {
  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  class SudokuCompletionModal {
    constructor() {
      this.modal = document.getElementById('completion-modal');
      this.title = document.getElementById('completion-modal-title');
      this.content = document.getElementById('completion-modal-content');
      this.playAgainButton = document.getElementById('completion-play-again');
      this.closeButton = document.getElementById('completion-modal-close');
      this.closeActionButton = document.getElementById('completion-close-button');
      this.playAgainHandler = null;
      this.bindEvents();
    }

    bindEvents() {
      if (this.closeButton) {
        this.closeButton.addEventListener('click', () => this.hide());
      }

      if (this.closeActionButton) {
        this.closeActionButton.addEventListener('click', () => this.hide());
      }

      if (this.modal) {
        this.modal.addEventListener('click', (event) => {
          if (event.target === this.modal) {
            this.hide();
          }
        });
      }

      if (this.playAgainButton) {
        this.playAgainButton.addEventListener('click', () => {
          this.hide();
          if (typeof this.playAgainHandler === 'function') {
            this.playAgainHandler();
          }
        });
      }

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.modal && this.modal.classList.contains('is-visible')) {
          this.hide();
        }
      });
    }

    setPlayAgainHandler(handler) {
      this.playAgainHandler = handler;
    }

    show({ difficulty, elapsedSeconds, hintsUsed, totalMoves }) {
      if (!this.modal) {
        return;
      }

      const safeDifficulty = typeof difficulty === 'string' && difficulty ? difficulty : 'Medium';
      const safeTime = formatTime(elapsedSeconds);
      const safeHints = Number(hintsUsed) || 0;
      const safeMoves = Number(totalMoves) || 0;

      this.title.textContent = 'Puzzle Complete!';
      this.content.innerHTML = `
        <p class="completion-modal-message">Congratulations! You solved the ${safeDifficulty} puzzle.</p>
        <dl class="completion-modal-stats">
          <div>
            <dt>Completion Time</dt>
            <dd>${safeTime}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>${safeDifficulty}</dd>
          </div>
          <div>
            <dt>Hints Used</dt>
            <dd>${safeHints}</dd>
          </div>
          <div>
            <dt>Total Moves</dt>
            <dd>${safeMoves}</dd>
          </div>
        </dl>
      `;

      this.modal.classList.add('is-visible');
      this.modal.setAttribute('aria-hidden', 'false');
    }

    hide() {
      if (!this.modal) {
        return;
      }

      this.modal.classList.remove('is-visible');
      this.modal.setAttribute('aria-hidden', 'true');
    }
  }

  window.SudokuCompletionModal = new SudokuCompletionModal();
})();

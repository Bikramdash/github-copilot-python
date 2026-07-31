(() => {
  class SudokuTimer {
    constructor(displayElement) {
      this.display = displayElement;
      this.elapsedSeconds = 0;
      this.startTimestamp = null;
      this.timerId = null;
      this.running = false;
      this.render();
    }

    static formatMMSS(totalSeconds) {
      const safeSeconds = Math.max(0, totalSeconds);
      const minutes = Math.floor(safeSeconds / 60);
      const seconds = safeSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    render() {
      this.display.textContent = SudokuTimer.formatMMSS(this.elapsedSeconds);
    }

    start() {
      if (this.running) {
        return;
      }

      this.running = true;
      this.startTimestamp = Date.now() - (this.elapsedSeconds * 1000);
      this.timerId = window.setInterval(() => {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTimestamp) / 1000);
        this.render();
      }, 1000);
      this.render();
    }

    reset() {
      this.stop();
      this.elapsedSeconds = 0;
      this.startTimestamp = null;
      this.render();
    }

    stop() {
      this.running = false;
      if (this.timerId !== null) {
        window.clearInterval(this.timerId);
        this.timerId = null;
      }
    }
  }

  window.SudokuTimer = SudokuTimer;
})();

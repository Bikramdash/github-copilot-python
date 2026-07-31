// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let initialBoard = [];
let undoStack = [];
let redoStack = [];
const timer = new window.SudokuTimer(document.getElementById('timer-display'));
const leaderboard = new window.SudokuLeaderboard(document.getElementById('leaderboard-table'));
const statistics = new window.SudokuStatistics(document.getElementById('statistics-panel'));

function attachPanelResetHandlers() {
  const resetLeaderboardButton = document.getElementById('reset-leaderboard');
  const resetStatisticsButton = document.getElementById('reset-statistics');

  if (resetLeaderboardButton) {
    resetLeaderboardButton.addEventListener('click', () => {
      window.localStorage.removeItem('sudoku-leaderboard');
      leaderboard.load();
      leaderboard.render();
    });
  }

  if (resetStatisticsButton) {
    resetStatisticsButton.addEventListener('click', () => {
      window.localStorage.removeItem('sudoku-statistics');
      statistics.stats = statistics.load();
      statistics.render();
    });
  }
}

function cloneBoard(board) {
  return board.map(row => [...row]);
}

function readBoardFromInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function applyBoardState(boardState) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const inp = inputs[idx];
      const val = boardState[i][j];
      inp.value = val === 0 ? '' : String(val);
      inp.disabled = initialBoard[i][j] !== 0;
      inp.className = initialBoard[i][j] !== 0 ? 'sudoku-cell prefilled' : 'sudoku-cell';
    }
  }
}

function updateHistoryButtons() {
  const undoButton = document.getElementById('undo-move');
  const redoButton = document.getElementById('redo-move');
  if (!undoButton || !redoButton) {
    return;
  }
  undoButton.disabled = undoStack.length === 0;
  redoButton.disabled = redoStack.length === 0;
}

function resetHistory() {
  undoStack = [];
  redoStack = [];
  updateHistoryButtons();
}

function captureUserMove(previousBoard) {
  undoStack.push(cloneBoard(previousBoard));
  if (undoStack.length > 100) {
    undoStack.shift();
  }
  redoStack = [];
  updateHistoryButtons();
}

function undoMove() {
  if (undoStack.length === 0) {
    return;
  }
  const currentBoard = readBoardFromInputs();
  redoStack.push(cloneBoard(currentBoard));
  const previousBoard = undoStack.pop();
  applyBoardState(previousBoard);
  updateHistoryButtons();
}

function redoMove() {
  if (redoStack.length === 0) {
    return;
  }
  const currentBoard = readBoardFromInputs();
  undoStack.push(cloneBoard(currentBoard));
  const nextBoard = redoStack.pop();
  applyBoardState(nextBoard);
  updateHistoryButtons();
}

function promptForLeaderboardEntry() {
  const playerName = window.prompt('Congratulations! Enter your name for the leaderboard:', 'Player');
  if (playerName === null) {
    return;
  }

  const name = String(playerName).trim() || 'Player';
  leaderboard.addEntry({
    name,
    difficulty: getSelectedDifficulty(),
    timeSeconds: timer.elapsedSeconds
  });
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('focus', () => {
        input.dataset.previousBoard = JSON.stringify(readBoardFromInputs());
      });
      input.addEventListener('input', (e) => {
        if (e.target.disabled) {
          e.target.value = '';
          return;
        }
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        const previousBoard = input.dataset.previousBoard ? JSON.parse(input.dataset.previousBoard) : readBoardFromInputs();
        const currentBoard = readBoardFromInputs();
        if (JSON.stringify(previousBoard) !== JSON.stringify(currentBoard)) {
          captureUserMove(previousBoard);
        }
        input.dataset.previousBoard = JSON.stringify(currentBoard);
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function setMessage(message, type = 'info') {
  const msg = document.getElementById('message');
  if (!msg) {
    return;
  }
  msg.textContent = message;
  msg.className = `message message-${type}`;
}

function resetCellStyles(inputs) {
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }
    inp.className = 'sudoku-cell';
  }
}

function getSelectedDifficulty() {
  return document.getElementById('difficulty-select').value;
}

function renderPuzzle(puz) {
  puzzle = cloneBoard(puz);
  initialBoard = cloneBoard(puz);
  createBoardElement();
  applyBoardState(puzzle);
  resetHistory();
}

attachPanelResetHandlers();

async function newGame() {
  const difficulty = getSelectedDifficulty();
  timer.reset();
  timer.start();
  statistics.recordGameStart(difficulty);

  const query = new URLSearchParams({difficulty});
  const res = await fetch(`/new?${query}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  setMessage('');
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  if (data.error) {
    setMessage(data.error, 'error');
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));
  resetCellStyles(inputs);
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }
    if (incorrect.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
  if (data.solved) {
    timer.stop();
    const difficulty = getSelectedDifficulty();
    statistics.recordWin(difficulty, timer.elapsedSeconds);
    setMessage('Congratulations! You solved it!', 'success');
    promptForLeaderboardEntry();
    return;
  }

  if (incorrect.size === 0) {
    setMessage('Board is valid so far.', 'info');
  } else {
    setMessage('Some cells are incorrect.', 'error');
  }
}

async function getHint() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  if (data.error) {
    setMessage(data.error, 'error');
    return;
  }
  renderPuzzle(data.puzzle);
  setMessage(`Hint revealed row ${data.row + 1}, column ${data.col + 1}.`, 'info');
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('get-hint').addEventListener('click', getHint);
  document.getElementById('undo-move').addEventListener('click', undoMove);
  document.getElementById('redo-move').addEventListener('click', redoMove);
  updateHistoryButtons();
  // initialize
  newGame();
});
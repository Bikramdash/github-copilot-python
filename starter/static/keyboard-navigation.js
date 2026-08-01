(() => {
  const BOARD_SIZE = 9;

  function getBoard() {
    return document.getElementById('sudoku-board');
  }

  function getEditableCells() {
    const board = getBoard();
    if (!board) {
      return [];
    }

    return Array.from(board.querySelectorAll('.sudoku-cell')).filter((cell) => !cell.disabled);
  }

  function getCell(row, col) {
    const board = getBoard();
    if (!board || row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null;
    }

    return board.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
  }

  function updateSelectedCellState(target) {
    const board = getBoard();
    if (!board || !(target instanceof HTMLElement)) {
      return;
    }

    board.querySelectorAll('.sudoku-cell.is-selected').forEach((cell) => {
      cell.classList.remove('is-selected');
    });

    if (target.classList.contains('sudoku-cell')) {
      target.classList.add('is-selected');
    }
  }

  function moveFocusByDelta(element, rowDelta, colDelta) {
    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);
    let nextCell = getCell(row + rowDelta, col + colDelta);

    while (nextCell && nextCell.disabled) {
      nextCell = getCell(Number(nextCell.dataset.row) + rowDelta, Number(nextCell.dataset.col) + colDelta);
    }

    if (nextCell) {
      nextCell.focus();
      updateSelectedCellState(nextCell);
    }
  }

  function getEditableCellsForRow(rowIndex) {
    return getEditableCells()
      .filter((cell) => Number(cell.dataset.row) === rowIndex)
      .sort((first, second) => Number(first.dataset.col) - Number(second.dataset.col));
  }

  function getNextEditableCell(currentCell) {
    const editableCells = getEditableCells();
    if (editableCells.length === 0) {
      return null;
    }

    const currentRow = Number(currentCell.dataset.row);
    const currentCol = Number(currentCell.dataset.col);
    const rowCells = getEditableCellsForRow(currentRow);
    const currentIndex = rowCells.indexOf(currentCell);

    if (currentIndex >= 0 && currentIndex < rowCells.length - 1) {
      return rowCells[currentIndex + 1];
    }

    for (let rowIndex = currentRow + 1; rowIndex < BOARD_SIZE; rowIndex += 1) {
      const nextRowCells = getEditableCellsForRow(rowIndex);
      if (nextRowCells.length > 0) {
        return nextRowCells[0];
      }
    }

    const nextEditableCell = editableCells.find((cell) => {
      return Number(cell.dataset.row) >= currentRow && Number(cell.dataset.col) > currentCol;
    });
    return nextEditableCell || editableCells[0];
  }

  function getPreviousEditableCell(currentCell) {
    const editableCells = getEditableCells();
    if (editableCells.length === 0) {
      return null;
    }

    const currentRow = Number(currentCell.dataset.row);
    const currentCol = Number(currentCell.dataset.col);
    const rowCells = getEditableCellsForRow(currentRow);
    const currentIndex = rowCells.indexOf(currentCell);

    if (currentIndex > 0) {
      return rowCells[currentIndex - 1];
    }

    for (let rowIndex = currentRow - 1; rowIndex >= 0; rowIndex -= 1) {
      const previousRowCells = getEditableCellsForRow(rowIndex);
      if (previousRowCells.length > 0) {
        return previousRowCells[previousRowCells.length - 1];
      }
    }

    const previousEditableCell = [...editableCells].reverse().find((cell) => {
      return Number(cell.dataset.row) <= currentRow && Number(cell.dataset.col) < currentCol;
    });
    return previousEditableCell || editableCells[0];
  }

  function handleArrowNavigation(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('sudoku-cell') || target.disabled) {
      return;
    }

    const directionMap = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1]
    };

    const delta = directionMap[event.key];
    if (!delta) {
      return;
    }

    event.preventDefault();
    moveFocusByDelta(target, delta[0], delta[1]);
  }

  function handleTabNavigation(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('sudoku-cell') || target.disabled) {
      return;
    }

    const editableCells = getEditableCells();
    const currentIndex = editableCells.indexOf(target);
    if (currentIndex === -1) {
      return;
    }

    const nextCell = event.shiftKey ? editableCells[currentIndex - 1] : editableCells[currentIndex + 1];
    if (!nextCell) {
      return;
    }

    event.preventDefault();
    nextCell.focus();
    updateSelectedCellState(nextCell);
  }

  function handleBackspaceNavigation(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('sudoku-cell') || target.disabled) {
      return;
    }

    if ((event.key === 'Backspace' || event.key === 'Delete') && target.value === '') {
      const previousCell = getPreviousEditableCell(target);
      if (previousCell && previousCell !== target) {
        event.preventDefault();
        previousCell.focus();
        updateSelectedCellState(previousCell);
      }
    }
  }

  function handleDigitAdvance(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('sudoku-cell') || target.disabled) {
      return;
    }

    if (!/^[1-9]$/.test(target.value)) {
      return;
    }

    const nextCell = getNextEditableCell(target);
    if (!nextCell) {
      return;
    }

    window.setTimeout(() => {
      nextCell.focus();
      updateSelectedCellState(nextCell);
    }, 0);
  }

  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.classList.contains('sudoku-cell')) {
      updateSelectedCellState(target);
    }
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('#completion-modal')) {
      return;
    }

    if (!target.classList.contains('sudoku-cell')) {
      return;
    }

    if (event.key === 'Tab') {
      handleTabNavigation(event);
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      handleArrowNavigation(event);
      return;
    }

    if ((event.key === 'Backspace' || event.key === 'Delete') && target.value === '') {
      handleBackspaceNavigation(event);
    }
  }, true);

  document.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('sudoku-cell')) {
      return;
    }

    if (target.disabled) {
      target.value = '';
      return;
    }

    handleDigitAdvance(event);
  }, true);

  window.SudokuKeyboardNavigation = {
    getEditableCells,
    focusNextEditableCell: getNextEditableCell,
    focusPreviousEditableCell: getPreviousEditableCell,
    updateSelectedCellState
  };
})();

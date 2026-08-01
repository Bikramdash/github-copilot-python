import random
import importlib.util
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
STARTER = PROJECT_ROOT / 'starter'
SL_PATH = STARTER / 'sudoku_logic.py'


def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


sudoku_logic = load_module(SL_PATH, 'sudoku_logic')


def test_create_empty_board_shape():
    board = sudoku_logic.create_empty_board()
    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)


def test_fill_board_and_is_safe():
    random.seed(1)
    board = sudoku_logic.create_empty_board()
    ok = sudoku_logic.fill_board(board)
    assert ok is True
    # board should be fully filled (no EMPTY)
    assert all(cell != sudoku_logic.EMPTY for row in board for cell in row)
    # is_safe should detect existing numbers in row/col/box
    num = board[0][0]
    assert not sudoku_logic.is_safe(board, 0, 1, num)
    assert not sudoku_logic.is_safe(board, 1, 0, num)


def test_generate_puzzle_clues_and_solution():
    random.seed(0)
    clues = 30
    puzzle, solution = sudoku_logic.generate_puzzle(clues=clues)
    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    non_empty = sum(1 for r in puzzle for c in r if c != sudoku_logic.EMPTY)
    assert non_empty == clues
    # solution must be fully filled
    assert all(c != sudoku_logic.EMPTY for r in solution for c in r)


def test_generate_puzzle_difficulty_levels():
    expected_clues = {'easy': 40, 'medium': 32, 'hard': 25}
    for difficulty, clues in expected_clues.items():
        puzzle, solution = sudoku_logic.generate_puzzle(difficulty=difficulty)
        non_empty = sum(1 for row in puzzle for cell in row if cell != sudoku_logic.EMPTY)
        assert non_empty == clues
        assert all(cell != sudoku_logic.EMPTY for row in solution for cell in row)


def test_count_solutions_returns_one_for_generated_puzzles():
    for difficulty in ['easy', 'medium', 'hard']:
        for _ in range(5):
            puzzle, _ = sudoku_logic.generate_puzzle(difficulty=difficulty)
            assert sudoku_logic.count_solutions(puzzle, limit=2) == 1


def test_generate_puzzle_uses_unique_solution_constraint():
    for difficulty in ['easy', 'medium', 'hard']:
        for _ in range(5):
            puzzle, _ = sudoku_logic.generate_puzzle(difficulty=difficulty)
            assert sudoku_logic.count_solutions(puzzle, limit=2) == 1

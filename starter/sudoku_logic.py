import copy
import random

SIZE = 9
EMPTY = 0
DIFFICULTY_SETTINGS = {
    'easy': 40,
    'medium': 32,
    'hard': 25,
}


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def count_solutions(board, limit=2):
    working_board = deep_copy(board)
    solution_count = 0

    def backtrack():
        nonlocal solution_count

        if solution_count >= limit:
            return

        for row in range(SIZE):
            for col in range(SIZE):
                if working_board[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(working_board, row, col, num):
                            working_board[row][col] = num
                            backtrack()
                            if solution_count >= limit:
                                working_board[row][col] = EMPTY
                                return
                            working_board[row][col] = EMPTY
                    return
        solution_count += 1

    backtrack()
    return solution_count


def remove_cells(board, clues):
    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            removed_value = board[row][col]
            board[row][col] = EMPTY
            if count_solutions(board, limit=2) != 1:
                board[row][col] = removed_value
            else:
                attempts -= 1


def resolve_clues(clues=None, difficulty=None):
    if difficulty is not None:
        normalized_difficulty = difficulty.lower().strip()
        if normalized_difficulty in DIFFICULTY_SETTINGS:
            return DIFFICULTY_SETTINGS[normalized_difficulty]

    if clues is not None:
        return clues

    return 35


def generate_puzzle(clues=35, difficulty=None):
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    resolved_clues = resolve_clues(clues=clues, difficulty=difficulty)
    remove_cells(board, resolved_clues)
    puzzle = deep_copy(board)
    return puzzle, solution


def get_hint(puzzle, solution):
    if puzzle is None or solution is None:
        return None, None, None, None

    updated_board = deep_copy(puzzle)
    for row in range(SIZE):
        for col in range(SIZE):
            if updated_board[row][col] == EMPTY:
                updated_board[row][col] = solution[row][col]
                return updated_board, row, col, solution[row][col]

    return None, None, None, None


def find_incorrect_cells(board, solution):
    if board is None or solution is None:
        return []

    incorrect = []
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] != EMPTY and board[row][col] != solution[row][col]:
                incorrect.append([row, col])
    return incorrect

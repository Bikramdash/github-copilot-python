import importlib.util
import json
import sys
from pathlib import Path
from copy import deepcopy

PROJECT_ROOT = Path(__file__).resolve().parents[2]
STARTER = PROJECT_ROOT / 'starter'
APP_PATH = STARTER / 'app.py'


def load_module(path, name):
    # Ensure the starter directory is on sys.path so relative imports succeed
    starter_dir = str(path.parent)
    if starter_dir not in sys.path:
        sys.path.insert(0, starter_dir)
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


app_mod = load_module(APP_PATH, 'app_module')
app = app_mod.app
# Ensure Flask knows where to find templates/static when loaded from tests
app.template_folder = str(STARTER / 'templates')
app.static_folder = str(STARTER / 'static')


def test_index_route():
    client = app.test_client()
    res = client.get('/')
    assert res.status_code == 200
    assert b"Sudoku Game" in res.data


def test_new_and_check_routes():
    client = app.test_client()
    # request a new game with a specific clue count
    res = client.get('/new?clues=25')
    assert res.status_code == 200
    data = res.get_json()
    assert 'puzzle' in data
    puzzle = data['puzzle']
    assert len(puzzle) == 9 and all(len(row) == 9 for row in puzzle)

    # Ensure server stored solution
    solution = app_mod.CURRENT.get('solution')
    assert solution is not None
    # submit the correct solution -> no incorrect cells
    res2 = client.post('/check', json={'board': solution})
    assert res2.status_code == 200
    data2 = res2.get_json()
    assert 'incorrect' in data2
    assert data2['incorrect'] == []

    # change one cell to be incorrect
    bad = deepcopy(solution)
    bad[0][0] = (bad[0][0] % 9) + 1
    res3 = client.post('/check', json={'board': bad})
    assert res3.status_code == 200
    data3 = res3.get_json()
    assert len(data3['incorrect']) >= 1


def test_new_game_supports_difficulty_param():
    client = app.test_client()
    res = client.get('/new?difficulty=hard')
    assert res.status_code == 200
    puzzle = res.get_json()['puzzle']
    non_empty = sum(1 for row in puzzle for cell in row if cell != 0)
    assert non_empty == 25


def test_hint_route_reveals_one_correct_value():
    client = app.test_client()
    res = client.get('/new?clues=25')
    assert res.status_code == 200
    puzzle = res.get_json()['puzzle']
    solution = app_mod.CURRENT.get('solution')

    initial_empty_count = sum(1 for row in puzzle for cell in row if cell == 0)
    assert initial_empty_count > 0

    res2 = client.post('/hint', json={'board': puzzle})
    assert res2.status_code == 200
    data = res2.get_json()
    assert 'puzzle' in data and 'row' in data and 'col' in data and 'value' in data

    updated_puzzle = data['puzzle']
    row, col = data['row'], data['col']
    assert updated_puzzle[row][col] == data['value'] == solution[row][col]
    assert sum(1 for row_values in updated_puzzle for cell in row_values if cell == 0) == initial_empty_count - 1

    for i in range(len(puzzle)):
        for j in range(len(puzzle[i])):
            if puzzle[i][j] != 0:
                assert updated_puzzle[i][j] == puzzle[i][j]

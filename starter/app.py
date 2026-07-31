from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty', '').strip().lower() or None
    clues_arg = request.args.get('clues')
    clues = int(clues_arg) if clues_arg is not None else None
    puzzle, solution = sudoku_logic.generate_puzzle(clues=clues, difficulty=difficulty)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    incorrect = sudoku_logic.find_incorrect_cells(board, solution)
    return jsonify({'incorrect': incorrect})

@app.route('/hint', methods=['POST'])
def get_hint():
    data = request.get_json(silent=True) or {}
    board = data.get('board')
    solution = CURRENT.get('solution')

    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    updated_board, row, col, value = sudoku_logic.get_hint(board, solution)
    if updated_board is None:
        return jsonify({'error': 'No empty cells remain'}), 400

    CURRENT['puzzle'] = updated_board
    return jsonify({'puzzle': updated_board, 'row': row, 'col': col, 'value': value})

if __name__ == '__main__':
    app.run(debug=True)
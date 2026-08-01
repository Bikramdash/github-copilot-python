# Sudoku Game

A modern web-based Sudoku game built using **Python**, **Flask**, **HTML**, **CSS**, and **JavaScript** with the help of **GitHub Copilot**. This project enhances a basic Sudoku application by adding modern features, an improved user interface, persistent game data, and a responsive design.

---

## Features

- Generate valid Sudoku puzzles
- Three difficulty levels:
  - Easy
  - Medium
  - Hard
- Timer to track solving time
- Check Puzzle functionality
- Hint system
- Undo and Redo moves
- Leaderboard (Top 10 scores)
- Game Statistics
- Dark Mode with saved preference
- Save and Load Game Progress
- Completion modal displaying:
  - Completion time
  - Difficulty
  - Hints used
  - Total moves
- Responsive design for desktop and mobile devices
- Local Storage support for leaderboard, statistics, theme, and saved games
- Automated testing using Pytest

---

## Technologies Used

- Python 3
- Flask
- HTML5
- CSS3
- JavaScript
- Pytest
- Git
- GitHub
- GitHub Copilot

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Bikramdash/github-copilot-python.git
cd github-copilot-python/starter
```

### 2. Create a virtual environment

Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

---

## Running Tests

Run all tests using:

```bash
pytest -q
```

All tests should pass successfully.

---

## Project Structure

```
starter/
│
├── app.py
├── sudoku_logic.py
├── requirements.txt
├── templates/
├── static/
├── tests/
```

---

## How to Play

1. Select a difficulty level.
2. Click **New Game**.
3. Fill the Sudoku board.
4. Use **Hint** if needed.
5. Use **Undo** and **Redo** to manage moves.
6. Click **Check Puzzle** to verify your solution.
7. When completed:
   - View your completion summary.
   - Enter your name for the leaderboard.
8. Statistics and leaderboard are updated automatically.

---

## Project Highlights

This project demonstrates:

- Flask web development
- Python programming
- JavaScript DOM manipulation
- Responsive web design
- Local Storage usage
- Git and GitHub version control
- GitHub Copilot assisted development
- Automated testing with Pytest

---

## Future Improvements

Possible future enhancements include:

- Keyboard navigation
- Sound effects
- Sudoku puzzle import/export
- Multiplayer mode
- Online leaderboard
- User accounts

---

## Author

**Bikram Dash**

GitHub: https://github.com/Bikramdash

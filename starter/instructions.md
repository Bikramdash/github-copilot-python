# GitHub Copilot Instructions

## Project Overview

This project is a Flask-based Sudoku web application. The goal is to refactor the legacy code into a clean, modular, maintainable application while preserving existing functionality and adding new features.

## Coding Standards

- Follow Python PEP 8 style guidelines.
- Write readable, maintainable code.
- Use meaningful variable and function names.
- Keep functions small and focused.
- Avoid duplicate code.
- Add comments only when necessary.
- Preserve backward compatibility.

## Flask Structure

- Separate business logic from routes.
- Keep Sudoku logic inside sudoku_logic.py or additional modules.
- Use reusable helper functions.
- Keep templates clean.
- Keep JavaScript modular.

## New Features

Implement the following:

- Difficulty selection (Easy, Medium, Hard)
- Unique Sudoku puzzle generation
- Timer
- Hint button
- Check Puzzle button
- Completion detection
- Dark mode
- Responsive design
- Top 10 leaderboard
- Local Storage support

## Testing

- Use pytest.
- Write clean unit tests.
- Ensure existing functionality is never broken.

## UI

- Responsive layout
- Light and dark themes
- Accessible colors
- Consistent spacing
- Alternating colors for 3×3 Sudoku boxes

## General

Always explain proposed changes before generating large amounts of code.

Prefer refactoring over rewriting whenever possible.
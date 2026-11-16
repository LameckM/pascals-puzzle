# Pascal's Puzzle

A modern, responsive number-puzzle game built around Pascal's Triangle. Fill the missing cells, use the addition rule, and build your pattern-recognition skills.

## Features
- Four difficulty levels: Easy, Medium, Hard and Expert
- Interactive Pascal's Triangle board and number bank
- Hints, score, mistakes and elapsed-time tracking
- Progress dashboard saved in browser local storage
- Responsive dark interface for desktop and mobile
- Unit tests for the puzzle engine

## Getting started
Requires Node.js 18 or newer.

    git clone https://github.com/LameckM/pascals-puzzle.git
    cd pascals-puzzle
    npm install
    npm run dev

## Commands
- npm run dev — start the development server
- npm run build — create a production build
- npm run preview — preview the production build
- npm test — run the unit tests

## How to play
1. Select an empty cell in the triangle.
2. Choose a number from the number bank.
3. Every interior cell is the sum of the two cells directly above it.
4. Complete all missing cells to finish the puzzle.
5. Hints reveal a correct answer and reduce the points earned for that answer.

## Tech stack
React, Vite, JavaScript, CSS and Vitest.

## Project structure
- src/App.jsx — main game interface and state
- src/gameEngine.js — triangle generation and puzzle logic
- src/gameEngine.test.js — puzzle engine tests
- src/main.jsx — React entry point
- src/styles.css — responsive application styling

export const DIFFICULTIES = {
  easy: { label: 'Easy', rows: 5, holes: 3, points: 10 },
  medium: { label: 'Medium', rows: 7, holes: 6, points: 15 },
  hard: { label: 'Hard', rows: 9, holes: 10, points: 20 },
  expert: { label: 'Expert', rows: 11, holes: 15, points: 25 }
};

export function buildTriangle(count) {
  const rows = [];
  for (let r = 0; r < count; r += 1) {
    const row = [1];
    for (let c = 1; c < r; c += 1) row.push(rows[r - 1][c - 1] + rows[r - 1][c]);
    if (r > 0) row.push(1);
    rows.push(row);
  }
  return rows;
}

export function createPuzzle(level = 'easy', random = Math.random) {
  const config = DIFFICULTIES[level] || DIFFICULTIES.easy;
  const solution = buildTriangle(config.rows);
  const candidates = [];
  solution.forEach((row, r) => {
    for (let c = 1; c < row.length - 1; c += 1) candidates.push({ row: r, col: c });
  });
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const missing = candidates.slice(0, config.holes).map(({ row, col }) => ({ row, col, answer: solution[row][col] }));
  const rows = solution.map((row) => [...row]);
  missing.forEach(({ row, col }) => { rows[row][col] = null; });
  return { difficulty: level, rows, solution, missing, total: missing.length };
}

export function getNumberOptions(puzzle) {
  const answers = [...new Set(puzzle.missing.map((item) => item.answer))];
  const max = Math.max(...puzzle.solution.flat());
  const extras = [];
  for (let n = 2; extras.length < 4 && n <= max + 8; n += 1) {
    if (!answers.includes(n)) extras.push(n);
  }
  return [...answers, ...extras].sort((a, b) => a - b);
}

export function formatTime(seconds) {
  return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}
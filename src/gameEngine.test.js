import { describe, expect, it } from 'vitest';
import { buildTriangle, createPuzzle, formatTime, getNumberOptions } from './gameEngine';

describe('buildTriangle', () => {
  it('builds the first five rows', () => {
    expect(buildTriangle(5)).toEqual([[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]);
  });
  it('keeps every row symmetrical', () => {
    buildTriangle(12).forEach((row) => expect(row).toEqual([...row].reverse()));
  });
  it('uses the addition rule', () => {
    const rows = buildTriangle(10);
    rows.slice(2).forEach((row, index) => row.slice(1,-1).forEach((value,col) => {
      expect(value).toBe(rows[index+1][col] + rows[index+1][col+1]);
    }));
  });
});

describe('createPuzzle', () => {
  it('hides only interior numbers and keeps the solution', () => {
    const puzzle = createPuzzle('easy', () => 0.42);
    expect(puzzle.total).toBe(3);
    puzzle.missing.forEach(({row,col,answer}) => {
      expect(col).toBeGreaterThan(0);
      expect(col).toBeLessThan(puzzle.rows[row].length-1);
      expect(puzzle.rows[row][col]).toBeNull();
      expect(puzzle.solution[row][col]).toBe(answer);
    });
  });
  it('increases the number of gaps by difficulty', () => {
    expect(createPuzzle('medium').total).toBeGreaterThan(createPuzzle('easy').total);
    expect(createPuzzle('hard').total).toBeGreaterThan(createPuzzle('medium').total);
  });
});

describe('helpers', () => {
  it('includes every answer in the number bank', () => {
    const puzzle = createPuzzle('medium');
    const options = getNumberOptions(puzzle);
    puzzle.missing.forEach(({answer}) => expect(options).toContain(answer));
  });
  it('formats elapsed time', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(125)).toBe('02:05');
  });
});
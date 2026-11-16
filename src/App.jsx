import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Award, Check, CircleHelp, Clock3, Flame, Lightbulb, RotateCcw, Sparkles, Target, Trophy, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { createPuzzle, DIFFICULTIES, formatTime, getNumberOptions } from './gameEngine';

const KEY = 'pascals-puzzle-progress-v1';
function playTone(kind, enabled) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = kind === 'correct' ? [660, 880] : kind === 'win' ? [523, 659, 784, 1047] : kind === 'hint' ? [440, 554] : [190, 145];
    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = kind === 'wrong' ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + index * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + index * 0.11 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.11 + 0.18);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime + index * 0.11);
      oscillator.stop(ctx.currentTime + index * 0.11 + 0.2);
    });
    window.setTimeout(() => ctx.close(), notes.length * 120 + 300);
  } catch { /* Audio is optional; gameplay should never depend on it. */ }
}

const emptyStats = { gamesPlayed: 0, puzzlesSolved: 0, totalPoints: 0, bestScore: 0 };
function loadStats() {
  try { return { ...emptyStats, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return emptyStats; }
}

export default function App() {
  const [difficulty, setDifficulty] = useState('easy');
  const [puzzle, setPuzzle] = useState(() => createPuzzle('easy'));
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState(loadStats);
  const [tab, setTab] = useState('play');
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState('');

  const options = useMemo(() => getNumberOptions(puzzle), [puzzle]);
  const correctCount = puzzle.missing.filter(({row,col}) => answers[row + '-' + col] === puzzle.solution[row][col]).length;
  const complete = started && correctCount === puzzle.total;

  useEffect(() => {
    if (!started || finished || tab !== 'play') return undefined;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, finished, tab]);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(stats)); }, [stats]);
  useEffect(() => {
    if (!notice) return undefined;
    const id = window.setTimeout(() => setNotice(''), 2000);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    if (!feedback) return undefined;
    const id = window.setTimeout(() => setFeedback(''), 350);
    return () => window.clearTimeout(id);
  }, [feedback]);

  useEffect(() => {
    if (!complete || finished) return;
    setFinished(true);
    playTone('win', soundEnabled);
    setStats((old) => ({
      gamesPlayed: old.gamesPlayed + 1,
      puzzlesSolved: old.puzzlesSolved + 1,
      totalPoints: old.totalPoints + score,
      bestScore: Math.max(old.bestScore, score)
    }));
  }, [complete, finished, score, soundEnabled]);

  function newGame(level = difficulty) {
    setDifficulty(level);
    setPuzzle(createPuzzle(level));
    setAnswers({});
    setSelected(null);
    setScore(0);
    setMistakes(0);
    setHints(0);
    setSeconds(0);
    setFinished(false);
    setStarted(false);
    setFeedback('');
    setTab('play');
  }

  function submitNumber(number) {
    if (!selected || finished) { setNotice('Select a missing cell first.'); return; }
    const key = selected.row + '-' + selected.col;
    if (puzzle.solution[selected.row][selected.col] !== number) {
      setFeedback('wrong');
      playTone('wrong', soundEnabled);
      setMistakes((n) => n + 1);
      setNotice('Not quite. Add the two numbers above the cell.');
      return;
    }
    if (answers[key] !== number) setScore((s) => s + DIFFICULTIES[difficulty].points);
    setFeedback('correct');
    playTone('correct', soundEnabled);
    setAnswers((old) => ({ ...old, [key]: number }));
    const next = puzzle.missing.find(({row,col}) => (row !== selected.row || col !== selected.col) && oldValue(answers,row,col,puzzle.solution) === false);
    setSelected(next ? { row: next.row, col: next.col } : null);
    setNotice('Correct. Nice work!');
  }

  function useHint() {
    if (finished) return;
    const target = selected && answers[selected.row + '-' + selected.col] !== puzzle.solution[selected.row][selected.col]
      ? selected
      : puzzle.missing.find(({row,col}) => answers[row + '-' + col] !== puzzle.solution[row][col]);
    if (!target) return;
    const key = target.row + '-' + target.col;
    setSelected(target);
    setAnswers((old) => ({ ...old, [key]: puzzle.solution[target.row][target.col] }));
    setHints((n) => n + 1);
    setFeedback('hint');
    playTone('hint', soundEnabled);
    setScore((s) => Math.max(0, s - 10));
    setNotice('One answer revealed. 10 XP deducted.');
  }

  return <div className="app">
    <header className="topbar">
      <a className="brand" href="#play" onClick={(e) => {e.preventDefault();setTab('play');}}>
        <span className="brand-symbol">1<span>2</span>1</span>
        <span><b>pascal's puzzle</b><small>THINK IN PATTERNS</small></span>
      </a>
      <nav><button className={tab === 'play' ? 'nav active' : 'nav'} onClick={() => setTab('play')}>Play</button><button className={tab === 'stats' ? 'nav active' : 'nav'} onClick={() => setTab('stats')}>Your progress</button></nav>
      <button className="help-icon" aria-label="How to play" onClick={() => setHelp(true)}><CircleHelp size={19}/></button>
    </header>

    <main className={'main ' + (started && !finished && tab === 'play' ? 'has-floating-bank' : '')}>
      {tab === 'play' ? <>
        <section className="intro">
          <div><div className="eyebrow"><Sparkles size={14}/> THE DAILY BRAIN WORKOUT</div><h1>Every number has<br/>a <em>pattern.</em></h1><p>Fill the gaps. Follow the pattern. Give your brain a little workout.</p></div>
          <div className="solved-chip"><span><Flame size={18}/></span><div><b>{stats.puzzlesSolved}</b><small>PUZZLES SOLVED</small></div></div>
        </section>

        <section className="layout">
          <article className="game-card">
            <div className="card-top"><span className="live"><i/> {started ? (finished ? 'PUZZLE COMPLETE' : 'PUZZLE IN PROGRESS') : 'READY WHEN YOU ARE'}</span><div className="card-actions"><button className="sound-btn" onClick={() => setSoundEnabled((v) => !v)} aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}>{soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button><span className="timer"><Clock3 size={15}/>{formatTime(seconds)}</span></div></div>
            {!started ? <div className="ready-panel"><div className="ready-mark"><Sparkles size={27}/></div><span className="eyebrow">YOUR NEXT CHALLENGE</span><h2>Ready to play?</h2><p>Your triangle will appear and the timer will begin when you press Ready.</p><div className="ready-details"><span>{DIFFICULTIES[difficulty].label} difficulty</span><span>{puzzle.total} missing numbers</span><span>{DIFFICULTIES[difficulty].rows} rows</span></div><button className="primary ready-button" onClick={() => { setStarted(true); setSeconds(0); playTone('hint', soundEnabled); }}>Ready — let's play <Zap size={16}/></button></div> : <>
            <div className="game-title"><div><h2>Complete the triangle</h2><p>Each number is the sum of the two above it.</p></div><button className="round-btn" aria-label="Start a new puzzle" onClick={() => newGame()}><RotateCcw size={17}/></button></div>
            <div className="triangle-scroll"><div className="triangle">
              {puzzle.rows.map((row,r) => <div className="triangle-row" key={r}>{row.map((value,c) => {
                const key = r + '-' + c;
                const isGap = value === null;
                const chosen = selected?.row === r && selected?.col === c;
                const answer = answers[key];
                return <button key={key} disabled={!isGap || finished} onClick={() => setSelected({row:r,col:c})} className={'cell ' + (isGap ? 'gap ' : 'fixed ') + (chosen ? 'chosen ' : '') + (answer !== undefined ? 'filled ' : '') + (feedback ? 'feedback-' + feedback : '')} aria-label={isGap ? 'Missing number, row ' + (r+1) + ', position ' + (c+1) : 'Given ' + value}>{isGap ? (answer ?? '?') : value}</button>;
              })}</div>)}
            </div></div>
            <div className="progress"><div><span>YOUR PROGRESS</span><b>{correctCount}/{puzzle.total}</b></div><div className="track"><i style={{width:(correctCount/puzzle.total*100)+'%'}}/></div></div>
            {finished ? <div className="win"><span className="win-icon"><Trophy size={24}/></span><div><b>Triangle complete!</b><small>Solved in {formatTime(seconds)} with {mistakes} mistakes.</small></div><strong>+{score} XP</strong><button className="primary" onClick={() => newGame()}>Next puzzle →</button></div> :
              <div className="answer-area floating-answer-area"><div className="answer-label"><b>CHOOSE A NUMBER</b><span>{selected ? 'Row ' + (selected.row+1) + ' · Position ' + (selected.col+1) : 'Select a highlighted gap'}</span></div>
                <div className="number-bank">{options.map((n) => <button key={n} onClick={() => submitNumber(n)}>{n}</button>)}</div>
                <div className="tools"><button onClick={useHint}><Lightbulb size={16}/> Use a hint <small>−10 XP</small></button><span><Target size={14}/> {mistakes} mistakes</span></div>
              </div>}
            </>}
          </article>

          <aside className="sidebar">
            <section className="side-card"><div className="side-heading"><span className="side-icon"><Zap size={17}/></span><div><b>Difficulty</b><small>Choose your challenge</small></div></div>
              {Object.entries(DIFFICULTIES).map(([key,item]) => <button key={key} className={'level ' + (difficulty === key ? 'selected-level' : '')} onClick={() => newGame(key)}><i className={'dot ' + key}/>{item.label}<small>{difficulty === key ? <Check size={15}/> : item.rows + ' rows'}</small></button>)}
            </section>
            <section className="side-card"><div className="side-heading"><span className="side-icon gold"><Award size={17}/></span><div><b>Your session</b><small>A little progress adds up</small></div></div>
              <div className="score-row"><div><small>CURRENT SCORE</small><b>{score}<i> XP</i></b></div><div><small>BEST SCORE</small><b>{stats.bestScore}<i> XP</i></b></div></div>
              <div className="session-line"><span>Correct answers</span><b>{correctCount}</b></div><div className="session-line"><span>Hints used</span><b>{hints}</b></div>
            </section>
            <section className="tip"><div><Sparkles size={14}/> QUICK TIP</div><p>Look at the two numbers directly above an empty cell. Add them together to find the missing number.</p><button onClick={() => setHelp(true)}>How to play →</button></section>
          </aside>
        </section>
      </> : <section className="stats-page"><div className="eyebrow"><Award size={14}/> YOUR JOURNEY</div><h1>Look how far<br/>you've <em>come.</em></h1><p>Every puzzle makes your pattern recognition stronger.</p><div className="stats-grid"><div><small>PUZZLES SOLVED</small><b>{stats.puzzlesSolved}</b><span>Keep going</span></div><div><small>BEST SCORE</small><b>{stats.bestScore} XP</b><span>Your personal record</span></div><div><small>TOTAL POINTS</small><b>{stats.totalPoints}</b><span>Earned across games</span></div><div><small>GAMES PLAYED</small><b>{stats.gamesPlayed}</b><span>One step at a time</span></div></div><button className="primary" onClick={() => setTab('play')}>Back to puzzle →</button></section>}
    </main>

    {notice && <div className="toast"><Sparkles size={15}/>{notice}</div>}
    {help && <div className="overlay" onClick={() => setHelp(false)}><section className="modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setHelp(false)} aria-label="Close"><X size={18}/></button><div className="eyebrow"><CircleHelp size={14}/> THE RULES</div><h2>How to play</h2><p>Pascal's Triangle starts and ends every row with 1. Every number between the edges is the sum of the two numbers directly above it.</p><div className="example"><span>3</span> + <span>3</span> = <b>6</b></div><ol><li>Select an empty cell in the triangle.</li><li>Choose the number you think belongs there.</li><li>Complete every gap to finish the puzzle and earn points.</li><li>Use hints if you get stuck. Hints reduce your points.</li></ol><button className="primary full" onClick={() => setHelp(false)}>Got it <Check size={16}/></button></section></div>}
    <footer><span>© 2026 PASCAL'S PUZZLE</span><span>BUILT FOR CURIOUS MINDS ✳</span></footer>
  </div>;
}

function oldValue(answers,row,col,solution) {
  return answers[row + '-' + col] === solution[row][col];
}
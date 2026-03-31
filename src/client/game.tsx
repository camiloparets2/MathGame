import { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  QUESTIONS_PER_ROUND, TIME_PER_QUESTION, DIFF_COLOR, DIFF_MULTIPLIER,
  getDayIndex, generateProblems, calcQuestionScore, getMathLevel,
  getTodaysMission, getMathFact, getLetterGrade, getShareText,
} from '../shared/problems';
import type { Problem, Difficulty, DailyMission } from '../shared/problems';
import type { InitResponse, LeaderboardEntry, DifficultyStats, WallEntry } from '../shared/api';

// ─── KaTeX renderers ──────────────────────────────────────────────────────────

const MathInline = ({ tex }: { tex: string }) => {
  try {
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: false, output: 'html' });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span>{tex}</span>;
  }
};

const MathDisplay = ({ tex }: { tex: string }) => {
  try {
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: true, output: 'html' });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span style={{ whiteSpace: 'pre-line' }}>{tex}</span>;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiGet<T>(url: string): Promise<T> {
  return (await fetch(url)).json();
}
async function apiPost<T>(url: string, body: unknown): Promise<T> {
  return (await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })).json();
}

type Phase     = 'loading' | 'menu' | 'countdown' | 'playing' | 'mathfact' | 'results';
type Feedback  = 'none' | 'correct' | 'wrong' | 'timeout';
type ResultTab = 'results' | 'leaderboard' | 'fame' | 'shame';

const DIFF_LABEL: Record<Difficulty, string> = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
const DIFF_TIME:  Record<Difficulty, string> = { easy: '35s', medium: '30s', hard: '25s' };
const DIFF_ICON:  Record<Difficulty, string> = { easy: '&#x25CF;', medium: '&#x25CF;', hard: '&#x25CF;' };
const DIFF_DESC:  Record<Difficulty, string> = {
  easy: 'Addition, subtraction, times tables, fractions, percentages',
  medium: 'Multi-digit multiplication, algebra, geometry, PEMDAS',
  hard: 'Logarithms, factorials, probability, quadratics, exponents',
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// ─── Sound System (Web Audio API — zero dependencies) ─────────────────────────

let _audioCtx: AudioContext | null = null;
let _soundEnabled = (() => {
  try { return localStorage.getItem('mb_sound') !== '0'; } catch { return true; }
})();

function getAudioCtx(): AudioContext | null {
  if (!_soundEnabled) return null;
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return _audioCtx;
  } catch { return null; }
}

function playTone(freq: number, type: OscillatorType, dur: number, vol = 0.25, delay = 0) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.01);
  } catch { /* ignore audio errors */ }
}

const SFX = {
  correct:  () => { playTone(880,  'sine',     0.12, 0.3);   playTone(1108, 'sine', 0.18, 0.22, 0.09); },
  wrong:    () => { playTone(200,  'sawtooth', 0.25, 0.18);  playTone(150,  'sawtooth', 0.2, 0.12, 0.12); },
  streak:   (n: number) => {
    const freqs = [523, 659, 784, 1046];
    const count = Math.min(n - 2, 4);
    for (let i = 0; i < count; i++) playTone(freqs[i]!, 'sine', 0.12, 0.2, i * 0.09);
  },
  timeout:  () => { playTone(330, 'square', 0.18, 0.15); playTone(220, 'square', 0.2, 0.12, 0.15); },
  tick:     () => { playTone(1200, 'square', 0.04, 0.06); },
  countdown:() => { playTone(660,  'sine',   0.1,  0.2); },
  go:       () => { playTone(880, 'sine', 0.1, 0.3); playTone(1100, 'sine', 0.15, 0.25, 0.1); playTone(1320, 'sine', 0.2, 0.2, 0.22); },
  complete: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => playTone(f, 'triangle', 0.22, 0.2, i * 0.11)); },
  levelUp:  () => { [659, 784, 988, 1318].forEach((f, i) => playTone(f, 'sine', 0.18, 0.22, i * 0.09)); },
  hint:     () => { playTone(528,  'sine',     0.15, 0.15); },
};

function setSoundEnabled(val: boolean) {
  _soundEnabled = val;
  try { localStorage.setItem('mb_sound', val ? '1' : '0'); } catch { /* ignore */ }
}

// ─── Daily Streak (localStorage) ──────────────────────────────────────────────

function getDailyStreak(): { streak: number; lastDay: number } {
  try {
    const raw = localStorage.getItem('mb_streak');
    if (!raw) return { streak: 0, lastDay: -1 };
    return JSON.parse(raw) as { streak: number; lastDay: number };
  } catch { return { streak: 0, lastDay: -1 }; }
}

function updateDailyStreak(todayIdx: number): { streak: number; isNew: boolean } {
  try {
    const { streak, lastDay } = getDailyStreak();
    if (lastDay === todayIdx) return { streak, isNew: false };
    const newStreak = lastDay === todayIdx - 1 ? streak + 1 : 1;
    localStorage.setItem('mb_streak', JSON.stringify({ streak: newStreak, lastDay: todayIdx }));
    return { streak: newStreak, isNew: true };
  } catch { return { streak: 1, isNew: true }; }
}

// ─── App ──────────────────────────────────────────────────────────────────────

const App = () => {

  const [username, setUsername]     = useState('player');
  const [dayIndex, setDayIndex]     = useState(0);
  const [serverStats, setStats]     = useState<Record<Difficulty, DifficultyStats> | null>(null);

  const [phase, setPhase]           = useState<Phase>('loading');
  const [difficulty, setDiff]       = useState<Difficulty>('medium');
  const [problems, setProblems]     = useState<Problem[]>([]);
  const [countdown, setCountdown]   = useState(3);

  const [currentIdx, setIdx]        = useState(0);
  const [timeLeft, setTimeLeft]     = useState(15);
  const [selectedOpt, setSelected]  = useState<string | null>(null);
  const [feedback, setFeedback]     = useState<Feedback>('none');

  const [score, setScore]           = useState(0);
  const [correctCount, setCorrect]  = useState(0);
  const [streak, setStreak]         = useState(0);
  const [maxStreak, setMaxStreak]   = useState(0);
  const [history, setHistory]       = useState<boolean[]>([]);
  const [categoryStats, setCatStats] = useState<Record<string, { total: number; correct: number }>>({});
  const [questionScores, setQScores] = useState<number[]>([]);

  // Lifelines
  const [hasHalfUsed, setHalfUsed]    = useState(false);
  const [hasSkipUsed, setSkipUsed]    = useState(false);
  const [hasFreezeUsed, setFreezeUsed] = useState(false);
  const [hasDoubleUsed, setDoubleUsed] = useState(false);
  const [hasHintUsed, setHintUsed]    = useState(false);
  const [hiddenOpts, setHiddenOpts]   = useState<Set<string>>(new Set());
  const [showHint, setShowHint]       = useState(false);
  const [isFrozen, setIsFrozen]       = useState(false);
  const [isDoubleActive, setDoubleActive] = useState(false);

  // Mission
  const [activeMission, setActiveMission] = useState<DailyMission | null>(null);

  // Math fact between questions
  const [mathFact, setMathFact]     = useState('');

  // Learning feedback
  const [showExplanation, setShowExplanation] = useState(false);

  const [resultTab, setResultTab]   = useState<ResultTab>('results');
  const [finalRank, setFinalRank]   = useState<number | null>(null);
  const [finalTotal, setFinalTotal] = useState(0);
  const [isNewBest, setIsNewBest]   = useState(false);
  const [leaderboard, setLB]        = useState<LeaderboardEntry[]>([]);
  const [wallFame, setWallFame]     = useState<WallEntry[]>([]);
  const [wallShame, setWallShame]   = useState<WallEntry[]>([]);

  const [visitStreak, setVisitStreak] = useState(0);
  const [soundOn, setSoundOn] = useState(_soundEnabled);
  const [showTutorial, setShowTutorial] = useState(() => {
    try { return localStorage.getItem('mb_tutorial_seen') !== '1'; } catch { return false; }
  });

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCeilTimeRef = useRef(999);

  // Derived
  const questionCount = activeMission ? activeMission.questionCount : QUESTIONS_PER_ROUND;
  const timeMult = activeMission ? activeMission.timeMultiplier : 1;
  const scoreMult = activeMission ? activeMission.scoreMultiplier : 1;
  const lifelineCount = activeMission ? activeMission.lifelines : 2;

  // ── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    apiGet<InitResponse>('/api/init').then(data => {
      setUsername(data.username);
      setDayIndex(data.dayIndex);
      setStats({ easy: data.easy, medium: data.medium, hard: data.hard });
      setPhase('menu');
    }).catch(() => {
      setDayIndex(getDayIndex());
      setPhase('menu');
    });
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // ── Daily streak visit tracker ───────────────────────────────────────────

  useEffect(() => {
    if (dayIndex === 0) return;
    const { streak } = updateDailyStreak(dayIndex);
    setVisitStreak(streak);
  }, [dayIndex]);

  // ── Tutorial auto-dismiss ─────────────────────────────────────────────────

  useEffect(() => {
    if (!showTutorial) return;
    const t = setTimeout(() => {
      setShowTutorial(false);
      try { localStorage.setItem('mb_tutorial_seen', '1'); } catch { /* ignore */ }
    }, 4500);
    return () => clearTimeout(t);
  }, [showTutorial]);

  // ── Countdown ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      SFX.go();
      setPhase('playing');
      setIdx(0);
      setTimeLeft(Math.floor(TIME_PER_QUESTION[difficulty] * timeMult));
      return;
    }
    SFX.countdown();
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, difficulty, timeMult]);

  // ── Timer ────────────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    stopTimer();
    prevCeilTimeRef.current = 999;
    setTimeLeft(Math.floor(TIME_PER_QUESTION[difficulty] * timeMult));
  }, [currentIdx, phase, difficulty, stopTimer, timeMult]);

  useEffect(() => {
    if (phase !== 'playing' || feedback !== 'none') return;
    if (isFrozen) return; // Time Freeze active
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.11) { stopTimer(); return 0; }
        return Math.round((t - 0.1) * 100) / 100;
      });
    }, 100);
    return stopTimer;
  }, [phase, feedback, currentIdx, stopTimer, isFrozen]);

  useEffect(() => {
    if (phase === 'playing' && feedback === 'none' && timeLeft <= 0) {
      handleAnswer(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ── Low-timer tick sound ─────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'playing' || feedback !== 'none' || isFrozen) return;
    const sec = Math.ceil(timeLeft);
    if (sec <= 5 && sec > 0 && sec !== prevCeilTimeRef.current) {
      prevCeilTimeRef.current = sec;
      SFX.tick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ── Answer handler ───────────────────────────────────────────────────────

  const handleAnswer = useCallback((selected: string | null) => {
    if (feedback !== 'none') return;
    stopTimer();
    setIsFrozen(false);

    const problem = problems[currentIdx];
    if (!problem) return;

    const isCorrect  = selected !== null && selected === problem.answer;
    const maxTime    = Math.floor(TIME_PER_QUESTION[difficulty] * timeMult);
    const newStreak  = isCorrect ? streak + 1 : 0;
    const doubleMul  = isDoubleActive && isCorrect ? 2 : 1;
    const qScore     = calcQuestionScore(isCorrect, timeLeft, maxTime, newStreak, difficulty, scoreMult) * doubleMul;
    const newScore   = score + qScore;
    const newCorrect = correctCount + (isCorrect ? 1 : 0);

    setSelected(selected);
    setFeedback(isCorrect ? 'correct' : selected === null ? 'timeout' : 'wrong');

    // SFX
    if (isCorrect) {
      SFX.correct();
      if (newStreak >= 3) SFX.streak(newStreak);
    } else if (selected === null) {
      SFX.timeout();
    } else {
      SFX.wrong();
    }

    setScore(newScore);
    setCorrect(newCorrect);
    setStreak(newStreak);
    setMaxStreak(m => Math.max(m, newStreak));
    setHistory(h => [...h, isCorrect]);
    setQScores(q => [...q, qScore]);
    setDoubleActive(false);

    setCatStats(prev => {
      const cat = problem.category;
      const existing = prev[cat] ?? { total: 0, correct: 0 };
      return { ...prev, [cat]: { total: existing.total + 1, correct: existing.correct + (isCorrect ? 1 : 0) } };
    });

    // Show explanation for wrong/timeout answers
    if (!isCorrect && problem.explanation) {
      setShowExplanation(true);
    }

    const nextIdx = currentIdx + 1;
    const feedbackDelay = !isCorrect && problem.explanation ? 3500 : 1200;

    feedbackTimerRef.current = setTimeout(() => {
      setShowExplanation(false);
      if (nextIdx >= questionCount) {
        SFX.complete();
        setPhase('results');
        setResultTab('results');
        setFinalRank(null);
        apiPost<{ type: string; rank: number; totalPlayers: number; isPersonalBest: boolean }>(
          '/api/score',
          { difficulty, score: newScore, correct: newCorrect, dayIndex },
        ).then(res => {
          setFinalRank(res.rank);
          setFinalTotal(res.totalPlayers);
          setIsNewBest(res.isPersonalBest);
          return apiGet<{ entries: LeaderboardEntry[]; totalPlayers: number }>(
            `/api/leaderboard?difficulty=${difficulty}`,
          );
        }).then(lb => {
          setLB(lb.entries);
          setFinalTotal(lb.totalPlayers);
          return apiGet<{ fame: WallEntry[]; shame: WallEntry[]; totalPlayers: number }>(
            `/api/walls?difficulty=${difficulty}`,
          );
        }).then(walls => {
          setWallFame(walls.fame);
          setWallShame(walls.shame);
        }).catch(() => {});
      } else {
        // Show math fact between questions (every 3rd question)
        if (nextIdx % 3 === 0 && nextIdx < questionCount) {
          setMathFact(getMathFact(dayIndex * 100 + nextIdx));
          setPhase('mathfact');
          setTimeout(() => {
            setPhase('playing');
            setIdx(nextIdx);
            setSelected(null);
            setFeedback('none');
            setHiddenOpts(new Set());
            setShowHint(false);
          }, 2500);
        } else {
          setIdx(nextIdx);
          setSelected(null);
          setFeedback('none');
          setHiddenOpts(new Set());
          setShowHint(false);
        }
      }
    }, feedbackDelay);
  }, [feedback, problems, currentIdx, difficulty, streak, timeLeft, score, correctCount, dayIndex, stopTimer, questionCount, timeMult, scoreMult, isDoubleActive]);

  // ── Lifeline: 50/50 ───────────────────────────────────────────────────────

  const use5050 = useCallback(() => {
    if (hasHalfUsed || feedback !== 'none') return;
    const problem = problems[currentIdx];
    if (!problem) return;
    setHalfUsed(true);
    const wrongOpts = problem.options.filter(o => o !== problem.answer);
    const toHide = new Set<string>();
    const shuffled = [...wrongOpts].sort(() => Math.random() - 0.5);
    toHide.add(shuffled[0]!);
    toHide.add(shuffled[1]!);
    setHiddenOpts(toHide);
  }, [hasHalfUsed, feedback, problems, currentIdx]);

  // ── Lifeline: Skip ────────────────────────────────────────────────────────

  const useSkip = useCallback(() => {
    if (hasSkipUsed || feedback !== 'none') return;
    setSkipUsed(true);
    const problem = problems[currentIdx];
    if (!problem) return;
    stopTimer();
    setIsFrozen(false);

    setFeedback('timeout');
    setHistory(h => [...h, false]);
    setQScores(q => [...q, 0]);
    setCatStats(prev => {
      const cat = problem.category;
      const existing = prev[cat] ?? { total: 0, correct: 0 };
      return { ...prev, [cat]: { total: existing.total + 1, correct: existing.correct } };
    });

    const nextIdx = currentIdx + 1;
    feedbackTimerRef.current = setTimeout(() => {
      if (nextIdx >= questionCount) {
        setPhase('results');
        setResultTab('results');
        setFinalRank(null);
        apiPost<{ type: string; rank: number; totalPlayers: number; isPersonalBest: boolean }>(
          '/api/score',
          { difficulty, score, correct: correctCount, dayIndex },
        ).then(res => {
          setFinalRank(res.rank);
          setFinalTotal(res.totalPlayers);
          setIsNewBest(res.isPersonalBest);
          return apiGet<{ entries: LeaderboardEntry[]; totalPlayers: number }>(`/api/leaderboard?difficulty=${difficulty}`);
        }).then(lb => {
          setLB(lb.entries);
          setFinalTotal(lb.totalPlayers);
          return apiGet<{ fame: WallEntry[]; shame: WallEntry[]; totalPlayers: number }>(`/api/walls?difficulty=${difficulty}`);
        }).then(walls => {
          setWallFame(walls.fame);
          setWallShame(walls.shame);
        }).catch(() => {});
      } else {
        setIdx(nextIdx);
        setSelected(null);
        setFeedback('none');
        setHiddenOpts(new Set());
        setShowHint(false);
      }
    }, 600);
  }, [hasSkipUsed, feedback, problems, currentIdx, difficulty, score, correctCount, dayIndex, stopTimer, questionCount]);

  // ── Lifeline: Time Freeze ─────────────────────────────────────────────────

  const useTimeFreeze = useCallback(() => {
    if (hasFreezeUsed || feedback !== 'none') return;
    setFreezeUsed(true);
    setIsFrozen(true);
    stopTimer();
    // Auto-unfreeze after 5 seconds
    setTimeout(() => setIsFrozen(false), 5000);
  }, [hasFreezeUsed, feedback, stopTimer]);

  // ── Lifeline: Double Points ───────────────────────────────────────────────

  const useDoublePoints = useCallback(() => {
    if (hasDoubleUsed || feedback !== 'none') return;
    setDoubleUsed(true);
    setDoubleActive(true);
  }, [hasDoubleUsed, feedback]);

  // ── Lifeline: Hint ────────────────────────────────────────────────────────

  const useHintReveal = useCallback(() => {
    if (hasHintUsed || feedback !== 'none') return;
    setHintUsed(true);
    setShowHint(true);
    SFX.hint();
  }, [hasHintUsed, feedback]);

  // ── Start game ───────────────────────────────────────────────────────────

  const startGame = useCallback((diff: Difficulty, mission?: DailyMission) => {
    setDiff(diff);
    setActiveMission(mission ?? null);
    setProblems(generateProblems(dayIndex, diff, mission));
    setIdx(0); setScore(0); setCorrect(0); setStreak(0); setMaxStreak(0);
    setHistory([]); setSelected(null); setFeedback('none');
    setCountdown(3);
    setHalfUsed(false); setSkipUsed(false); setHiddenOpts(new Set());
    setFreezeUsed(false); setDoubleUsed(false); setHintUsed(false);
    setShowHint(false); setIsFrozen(false); setDoubleActive(false);
    setShowExplanation(false);
    setCatStats({}); setQScores([]);
    prevCeilTimeRef.current = 999;
    setPhase('countdown');
  }, [dayIndex]);

  // ── Computed ─────────────────────────────────────────────────────────────

  const maxTime    = Math.floor(TIME_PER_QUESTION[difficulty] * timeMult);
  const timePct    = timeLeft / maxTime;
  const diffColor  = DIFF_COLOR[difficulty];
  const timerColor = isFrozen ? '#38bdf8' : timePct > 0.5 ? '#10b981' : timePct > 0.25 ? '#fbbf24' : '#ef4444';
  const problem    = problems[currentIdx];
  const stats      = serverStats?.['medium'];
  const mult       = DIFF_MULTIPLIER[difficulty];
  const mathLevel  = getMathLevel(difficulty, correctCount, score, maxStreak);
  const todaysMission = getTodaysMission(dayIndex);
  const xpPct = questionCount > 0 ? (currentIdx / questionCount) * 100 : 0;
  const accuracyPct = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;

  // Weak area detection
  const weakCategory = (() => {
    const entries = Object.entries(categoryStats);
    if (entries.length === 0) return null;
    let worst: { cat: string; pct: number } | null = null;
    for (const [cat, { total, correct }] of entries) {
      if (total === 0) continue;
      const pct = correct / total;
      if (!worst || pct < worst.pct) worst = { cat, pct };
    }
    return worst && worst.pct < 1 ? worst.cat : null;
  })();

  // Letter grade + share
  const letterGrade = getLetterGrade(accuracyPct, maxStreak, questionCount);
  const shareText = getShareText(score, correctCount, questionCount, difficulty, letterGrade.grade, mathLevel, dayIndex);

  // Available lifeline count based on mission
  const totalLifelines = lifelineCount;
  const lifelinesAvail = {
    half: totalLifelines >= 1,
    skip: totalLifelines >= 2,
    freeze: totalLifelines >= 2,
    double: totalLifelines >= 1,
    hint: totalLifelines >= 1,
  };

  const optStyle = (opt: string): React.CSSProperties => {
    if (hiddenOpts.has(opt)) return { background: 'rgba(255,255,255,0.01)', color: '#1a1a2e', borderColor: 'rgba(255,255,255,0.02)', pointerEvents: 'none' as const };
    if (feedback === 'none') return {
      background: 'rgba(255,255,255,0.03)', color: '#c7d2fe', borderColor: 'rgba(255,255,255,0.06)',
    };
    const isCorrectAnswer = opt === problem?.answer;
    const isSelected      = opt === selectedOpt;
    if (isCorrectAnswer) return { background: 'rgba(16,185,129,0.12)', color: '#10b981', borderColor: 'rgba(16,185,129,0.4)' };
    if (isSelected)      return { background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' };
    return { background: 'rgba(255,255,255,0.015)', color: '#2a2d4a', borderColor: 'rgba(255,255,255,0.03)' };
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#07070f',
      color: '#e0e7ff',
      fontFamily: FONT,
      userSelect: 'none', WebkitUserSelect: 'none', overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @keyframes slideUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn     { 0% { transform:scale(0); opacity:0; } 60% { transform:scale(1.12); } 100% { transform:scale(1); opacity:1; } }
        @keyframes pulse     { 0%,100% { opacity:0.7; } 50% { opacity:1; transform:scale(1.02); } }
        @keyframes shake     { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer   { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes slideIn   { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes drift     { 0%,100% { transform: translate(0,0); opacity:0.05; } 50% { transform: translate(10px,-8px); opacity:0.1; } }
        @keyframes countPop  { 0% { transform:scale(0.3); opacity:0; } 50% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
        @keyframes timerPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
        @keyframes streakFire { 0%,100% { text-shadow: 0 0 8px rgba(245,158,11,0.4); } 50% { text-shadow: 0 0 16px rgba(245,158,11,0.7); } }
        @keyframes correctFlash { 0% { box-shadow: 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 40px rgba(16,185,129,0.15); } 100% { box-shadow: 0 0 0 rgba(16,185,129,0); } }
        @keyframes wrongFlash { 0% { box-shadow: 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 40px rgba(239,68,68,0.15); } 100% { box-shadow: 0 0 0 rgba(239,68,68,0); } }
        @keyframes badgePulse { 0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.2); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.4); } }
        @keyframes gradeGlow { 0% { text-shadow: 0 0 10px currentColor; } 50% { text-shadow: 0 0 25px currentColor, 0 0 50px currentColor; } 100% { text-shadow: 0 0 10px currentColor; } }
        @keyframes freezePulse { 0%,100% { box-shadow: 0 0 15px rgba(56,189,248,0.2); } 50% { box-shadow: 0 0 30px rgba(56,189,248,0.5); } }
        @keyframes factSlide { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes tutorialBar { from { width:0%; } to { width:100%; } }
        .opt-btn { transition: all 0.2s ease; }
        .opt-btn:active { transform: scale(0.97); }
        .opt-btn:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(139,92,246,0.3) !important; }
        .opt-btn .katex-html { color: inherit; }
        .katex-display { margin: 0 !important; }
        .katex { font-size: clamp(0.75em, 2.8vw, 1.05em) !important; }
        .question-box .katex { font-size: clamp(0.8em, 3.2vw, 1.1em) !important; }
        .question-box .katex-html { white-space: normal !important; word-break: break-word; }
        .opt-btn .katex { font-size: clamp(0.7em, 2.5vw, 1em) !important; }
        .tab-btn { transition: all 0.2s ease; }
        .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .diff-btn { transition: all 0.2s ease; }
        .diff-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important; }
        .diff-btn:active { transform: translateY(0); }
        .lifeline-btn { transition: all 0.15s ease; min-height: 36px; }
        .lifeline-btn:hover:not(:disabled) { transform: scale(1.05); }
        .lifeline-btn:active:not(:disabled) { transform: scale(0.95); }
        .lifeline-btn:disabled { opacity: 0.25; cursor: not-allowed !important; }
        .mission-btn { transition: all 0.2s ease; }
        .mission-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3) !important; }
      `}</style>

      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.04) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '10%', right: '-5%', width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', animation: 'drift 12s ease-in-out infinite',
      }} />

      {/* ── First-time Tutorial Overlay ── */}
      {showTutorial && phase === 'menu' && (
        <div
          onClick={() => { setShowTutorial(false); try { localStorage.setItem('mb_tutorial_seen', '1'); } catch { /* ignore */ } }}
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(7,7,15,0.92)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '18px', padding: '30px',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#4b5079', fontWeight: 700 }}>HOW TO PLAY</div>
          {([
            ['①', '#818cf8', 'Pick a difficulty or tap Today\'s Mission'],
            ['②', '#10b981', 'Answer 4-choice questions before time runs out'],
            ['③', '#f59e0b', 'Use lifelines wisely — each one is limited'],
          ] as [string, string, string][]).map(([n, c, txt]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '280px', width: '100%' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: `${c}18`, border: `1px solid ${c}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: c, fontWeight: 800,
                animation: 'pulse 1.5s infinite',
              }}>{n}</div>
              <div style={{ fontSize: '13px', color: '#c7d2fe', lineHeight: 1.4, fontWeight: 500 }}>{txt}</div>
            </div>
          ))}
          <div style={{ marginTop: '10px', fontSize: '10px', color: '#2a2d4a', letterSpacing: '2px' }}>
            TAP ANYWHERE TO DISMISS
          </div>
          <div style={{
            width: '120px', height: '3px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginTop: '4px',
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, #818cf8, #c084fc)',
              animation: 'tutorialBar 4.5s linear forwards',
            }} />
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {phase === 'loading' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#4b5079', fontSize: '13px', animation: 'pulse 1.5s infinite', letterSpacing: '4px', fontWeight: 600 }}>LOADING</div>
        </div>
      )}

      {/* ── Menu ── */}
      {phase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 16px', overflowY: 'auto', animation: 'slideUp 0.4s ease' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '12px', position: 'relative' }}>
            {/* Sound toggle */}
            <button
              onClick={() => { const next = !soundOn; setSoundOn(next); setSoundEnabled(next); }}
              style={{
                position: 'absolute', right: 0, top: 0,
                background: soundOn ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${soundOn ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '10px', padding: '4px 8px', cursor: 'pointer',
                fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
                color: soundOn ? '#818cf8' : '#3b3d5c', fontFamily: FONT,
              }}
            >
              {soundOn ? '♪ ON' : '♪ OFF'}
            </button>
            <div style={{
              fontSize: '28px', fontWeight: 800, letterSpacing: '5px',
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}>MATHY BLITZ</div>
            <div style={{ fontSize: '10px', color: '#3b3d5c', letterSpacing: '4px', marginTop: '4px', fontWeight: 600 }}>
              CHALLENGE #{dayIndex}
            </div>
            {/* Visit streak badge */}
            {visitStreak >= 2 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                marginTop: '6px', padding: '3px 10px', borderRadius: '20px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                fontSize: '9px', fontWeight: 700, color: '#f59e0b', letterSpacing: '1px',
                animation: 'streakFire 1.2s ease infinite',
              }}>
                &#x1F525; {visitStreak} DAY STREAK
              </div>
            )}
            {visitStreak === 1 && (
              <div style={{
                marginTop: '5px', fontSize: '9px', color: '#3b3d5c', letterSpacing: '1px',
              }}>
                Day 1 &#x2014; come back tomorrow to build your streak!
              </div>
            )}
          </div>

          {/* Today's Mission */}
          {todaysMission && (
            <button className="mission-btn" onClick={() => startGame('medium', todaysMission)} style={{
              width: '100%', padding: '14px 16px', borderRadius: '16px', marginBottom: '12px',
              background: `linear-gradient(135deg, ${todaysMission.color}12, ${todaysMission.color}06)`,
              border: `1px solid ${todaysMission.color}30`,
              cursor: 'pointer', textAlign: 'left',
              boxShadow: `0 4px 24px ${todaysMission.color}15`,
              fontFamily: FONT,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '24px' }} dangerouslySetInnerHTML={{ __html: todaysMission.emoji }} />
                <div>
                  <div style={{ fontSize: '8px', color: todaysMission.color, letterSpacing: '3px', fontWeight: 700, opacity: 0.8 }}>TODAY'S MISSION</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: todaysMission.color, letterSpacing: '1px' }}>{todaysMission.name}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#8b8fad', lineHeight: 1.4, marginBottom: '6px' }}>
                {todaysMission.description}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '8px', padding: '2px 8px', borderRadius: '10px',
                  background: `${todaysMission.color}15`, color: todaysMission.color,
                  fontWeight: 700, letterSpacing: '1px',
                }}>{todaysMission.modifier}</span>
                <span style={{
                  fontSize: '8px', padding: '2px 8px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', color: '#6b7094',
                  fontWeight: 600,
                }}>{todaysMission.questionCount}Q &middot; {todaysMission.lifelines} lifelines</span>
                {todaysMission.scoreMultiplier !== 1 && (
                  <span style={{
                    fontSize: '8px', padding: '2px 8px', borderRadius: '10px',
                    background: 'rgba(16,185,129,0.08)', color: '#10b981',
                    fontWeight: 700,
                  }}>{todaysMission.scoreMultiplier}x SCORE</span>
                )}
              </div>
            </button>
          )}

          {/* Daily challenge */}
          <button onClick={() => startGame('medium')} className="diff-btn" style={{
            width: '100%', padding: '14px 18px', borderRadius: '16px', marginBottom: '12px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
            border: '1px solid rgba(99,102,241,0.15)',
            cursor: 'pointer', textAlign: 'left',
            boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
            fontFamily: FONT,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: '2px' }}>DAILY CHALLENGE</div>
                <div style={{ fontSize: '10px', color: '#3b3d5c', marginTop: '3px' }}>Medium &middot; {DIFF_TIME.medium} per Q &middot; 1.5x pts</div>
              </div>
              {stats != null && stats.totalPlayers > 0 && (
                <div style={{ fontSize: '11px', color: '#3b3d5c', textAlign: 'right' }}>
                  <div style={{ color: '#6366f1', fontWeight: 700, fontSize: '16px' }}>{stats.totalPlayers}</div>
                  <div style={{ fontSize: '9px', letterSpacing: '1px' }}>PLAYERS</div>
                </div>
              )}
            </div>
            {stats?.personalBest != null && (
              <div style={{ fontSize: '10px', color: '#10b981', marginTop: '6px', fontWeight: 600, letterSpacing: '1px' }}>
                YOUR BEST: {stats.personalBest} pts
              </div>
            )}
          </button>

          {/* Difficulty row */}
          <div style={{ fontSize: '9px', color: '#2a2d4a', letterSpacing: '4px', marginBottom: '6px', textAlign: 'center', fontWeight: 600 }}>SELECT DIFFICULTY</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button key={d} className="diff-btn" onClick={() => startGame(d)} style={{
                flex: 1, padding: '12px 4px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${DIFF_COLOR[d]}22`,
                cursor: 'pointer', fontFamily: FONT,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}>
                <div style={{ fontSize: '16px', marginBottom: '2px', color: DIFF_COLOR[d], fontWeight: 900 }} dangerouslySetInnerHTML={{ __html: DIFF_ICON[d] }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: DIFF_COLOR[d], letterSpacing: '1px' }}>{DIFF_LABEL[d]}</div>
                <div style={{ fontSize: '10px', color: '#3b3d5c', marginTop: '2px' }}>{DIFF_TIME[d]}</div>
                <div style={{ fontSize: '10px', color: DIFF_COLOR[d], marginTop: '1px', fontWeight: 600, opacity: 0.7 }}>{DIFF_MULTIPLIER[d]}x pts</div>
                {serverStats?.[d].personalBest != null && (
                  <div style={{ fontSize: '9px', color: '#2a2d4a', marginTop: '4px' }}>best: {serverStats[d].personalBest}</div>
                )}
              </button>
            ))}
          </div>

          {/* Wall buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button className="diff-btn" onClick={() => {
              setDiff('medium');
              setPhase('results');
              setResultTab('fame');
              apiGet<{ fame: WallEntry[]; shame: WallEntry[]; totalPlayers: number }>('/api/walls?difficulty=medium')
                .then(w => { setWallFame(w.fame); setWallShame(w.shame); setFinalTotal(w.totalPlayers); })
                .catch(() => {});
            }} style={{
              flex: 1, padding: '10px', borderRadius: '14px', cursor: 'pointer', fontFamily: FONT,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(250,204,21,0.12)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>&#9733;</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(250,204,21,0.7)', letterSpacing: '2px' }}>WALL OF FAME</div>
            </button>
            <button className="diff-btn" onClick={() => {
              setDiff('medium');
              setPhase('results');
              setResultTab('shame');
              apiGet<{ fame: WallEntry[]; shame: WallEntry[]; totalPlayers: number }>('/api/walls?difficulty=medium')
                .then(w => { setWallFame(w.fame); setWallShame(w.shame); setFinalTotal(w.totalPlayers); })
                .catch(() => {});
            }} style={{
              flex: 1, padding: '10px', borderRadius: '14px', cursor: 'pointer', fontFamily: FONT,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(239,68,68,0.12)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>&#9760;</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(239,68,68,0.7)', letterSpacing: '2px' }}>WALL OF SHAME</div>
            </button>
          </div>

          {/* How to play */}
          <div style={{
            padding: '12px 14px', fontSize: '10px', color: '#3b3d5c', lineHeight: 1.8,
            background: 'rgba(255,255,255,0.015)', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontWeight: 700, color: '#4b5079', marginBottom: '5px', letterSpacing: '3px', fontSize: '9px' }}>HOW IT WORKS</div>
            Solve <span style={{ color: '#c7d2fe', fontWeight: 600 }}>timed math problems</span> spanning arithmetic to calculus-level topics.
            <br/>
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>Lifelines</span>: <span style={{ color: '#fbbf24' }}>50/50</span>, <span style={{ color: '#38bdf8' }}>Skip</span>, <span style={{ color: '#06b6d4' }}>Freeze</span>, <span style={{ color: '#f472b6' }}>2x Pts</span>, <span style={{ color: '#10b981' }}>Hint</span>
            <br/>
            Every wrong answer shows a <span style={{ color: '#10b981', fontWeight: 600 }}>step-by-step solution</span>. Learn while you play.
            <br/>
            A new <span style={{ color: '#f59e0b', fontWeight: 600 }}>daily mission</span> rotates every 24 hours — build your streak to rise in the ranks.
          </div>
        </div>
      )}

      {/* ── Countdown ── */}
      {phase === 'countdown' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {activeMission && (
            <div style={{
              padding: '6px 16px', borderRadius: '20px', marginBottom: '4px',
              background: `${activeMission.color}12`, border: `1px solid ${activeMission.color}30`,
              fontSize: '10px', color: activeMission.color, fontWeight: 700, letterSpacing: '2px',
            }}>
              <span dangerouslySetInnerHTML={{ __html: activeMission.emoji }} /> {activeMission.modifier}
            </div>
          )}
          <div style={{ fontSize: '11px', color: diffColor, letterSpacing: '5px', fontWeight: 700, opacity: 0.7 }}>
            {DIFF_LABEL[difficulty]} &middot; {mult}x POINTS
          </div>
          <div style={{ fontSize: '9px', color: '#3b3d5c', letterSpacing: '2px', maxWidth: '260px', textAlign: 'center', lineHeight: 1.5 }}>
            {activeMission ? activeMission.description : DIFF_DESC[difficulty]}
          </div>
          <div key={countdown} style={{
            fontSize: '100px', fontWeight: 800, animation: 'countPop 0.6s ease',
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.3))',
          }}>
            {countdown === 0 ? 'GO' : countdown}
          </div>
          <div style={{ fontSize: '11px', color: '#2a2d4a', letterSpacing: '2px' }}>
            {questionCount} questions &middot; {maxTime}s each
          </div>
        </div>
      )}

      {/* ── Math Fact Interstitial ── */}
      {phase === 'mathfact' && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '30px', animation: 'factSlide 0.4s ease',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', color: '#6366f1' }}>&#x2234;</div>
          <div style={{ fontSize: '9px', color: '#6366f1', letterSpacing: '4px', fontWeight: 700, marginBottom: '12px' }}>MATHEMATICAL INSIGHT</div>
          <div style={{
            fontSize: '15px', color: '#c7d2fe', fontWeight: 600, textAlign: 'center',
            lineHeight: 1.6, maxWidth: '300px',
            padding: '20px', borderRadius: '18px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(99,102,241,0.12)',
          }}>
            {mathFact}
          </div>
          <div style={{ fontSize: '10px', color: '#2a2d4a', marginTop: '16px', letterSpacing: '2px' }}>
            Q{currentIdx + 1} of {questionCount} &middot; {score} pts
          </div>
        </div>
      )}

      {/* ── Playing ── */}
      {phase === 'playing' && problem && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px', overflow: 'hidden',
          animation: feedback === 'correct' ? 'correctFlash 0.6s ease' : feedback === 'wrong' || feedback === 'timeout' ? 'wrongFlash 0.6s ease' : 'none',
        }}>

          {/* XP Progress Bar */}
          <div style={{
            height: '3px', borderRadius: '2px', marginBottom: '6px',
            background: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
              width: `${xpPct}%`, transition: 'width 0.5s ease',
            }} />
          </div>

          {/* Progress dots + timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <div style={{ flex: 1, display: 'flex', gap: '3px', alignItems: 'center' }}>
              {Array.from({ length: questionCount }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: '3px', borderRadius: '2px',
                  background: i < currentIdx
                    ? (history[i] ? '#10b981' : '#ef4444')
                    : i === currentIdx
                      ? `linear-gradient(90deg, ${timerColor}, ${timerColor}44)`
                      : 'rgba(255,255,255,0.06)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <div style={{
              fontSize: '14px', fontWeight: 700, color: timerColor, minWidth: '36px', textAlign: 'right',
              animation: isFrozen ? 'freezePulse 1s ease infinite' : timePct <= 0.25 ? 'timerPulse 0.5s ease infinite' : 'none',
            }}>
              {isFrozen && <span style={{ fontSize: '10px' }}>&#x2744; </span>}
              {Math.ceil(timeLeft)}s
            </div>
          </div>

          {/* HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#e0e7ff' }}>{score}</span>
              <span style={{ fontSize: '10px', color: '#2a2d4a', marginLeft: '4px', fontWeight: 600 }}>pts</span>
              {mult > 1 && <span style={{ fontSize: '9px', color: diffColor, marginLeft: '6px', fontWeight: 600, opacity: 0.7 }}>{mult}x</span>}
              {isDoubleActive && <span style={{ fontSize: '9px', color: '#f472b6', marginLeft: '6px', fontWeight: 700, animation: 'pulse 0.8s infinite' }}>2x!</span>}
            </div>
            {activeMission && (
              <div style={{
                padding: '2px 8px', borderRadius: '10px',
                background: `${activeMission.color}10`, border: `1px solid ${activeMission.color}20`,
                fontSize: '8px', color: activeMission.color, fontWeight: 700, letterSpacing: '1px',
              }}>
                <span dangerouslySetInnerHTML={{ __html: activeMission.emoji }} /> {activeMission.name.split(' ')[0]}
              </div>
            )}
            <div style={{
              padding: '3px 10px', borderRadius: '20px',
              background: `${diffColor}10`, border: `1px solid ${diffColor}22`,
              fontSize: '9px', color: diffColor, fontWeight: 700, letterSpacing: '2px',
            }}>
              {problem.category.toUpperCase()}
            </div>
            <div style={{ fontSize: '11px', color: '#3b3d5c' }}>
              <span style={{ color: '#c7d2fe', fontWeight: 700 }}>{currentIdx + 1}</span>
              <span style={{ color: '#1e1e3a' }}> / </span>
              {questionCount}
            </div>
          </div>

          {/* Streak */}
          {streak >= 2 && (
            <div style={{
              textAlign: 'center', marginBottom: '3px', fontSize: '12px', fontWeight: 700,
              color: '#f59e0b', animation: 'streakFire 0.8s ease infinite',
            }}>
              {streak}x STREAK &nbsp;+{Math.floor((streak - 1) * 10 * mult)}
            </div>
          )}

          {/* Question */}
          <div className="question-box" style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '10px 12px', marginBottom: '6px',
            background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            minHeight: 0, overflow: 'hidden',
            animation: feedback !== 'none' && feedback !== 'correct' ? 'shake 0.3s ease' : 'none',
          }}>
            <div style={{ textAlign: 'center', width: '100%', maxWidth: '100%', color: '#e0e7ff', overflow: 'hidden', wordBreak: 'break-word' as const }}>
              {problem.latex ? (
                <MathDisplay tex={problem.question} />
              ) : (
                <div style={{ fontSize: 'clamp(14px, 4vw, 24px)', fontWeight: 800, whiteSpace: 'pre-line', lineHeight: 1.5, wordBreak: 'break-word' as const, maxWidth: '100%' }}>
                  {problem.question}
                </div>
              )}
            </div>

            {/* Hint display */}
            {showHint && problem.hint && feedback === 'none' && (
              <div style={{
                marginTop: '8px', padding: '8px 14px', borderRadius: '12px',
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                fontSize: '11px', color: '#10b981', fontWeight: 600, textAlign: 'center',
                animation: 'fadeIn 0.3s ease',
              }}>
                &#x2192; {problem.hint}
              </div>
            )}

            {/* Explanation after wrong answer */}
            {showExplanation && problem.explanation && (
              <div style={{
                marginTop: '8px', padding: '10px 14px', borderRadius: '12px',
                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                fontSize: '11px', color: '#a78bfa', lineHeight: 1.5, textAlign: 'center',
                animation: 'fadeIn 0.3s ease', maxWidth: '100%',
              }}>
                &#x2234; {problem.explanation}
              </div>
            )}
          </div>

          {/* Power-ups */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {lifelinesAvail.half && (
              <button
                className="lifeline-btn"
                disabled={hasHalfUsed || feedback !== 'none'}
                onClick={use5050}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '9px', fontWeight: 700,
                  letterSpacing: '1px', cursor: 'pointer', fontFamily: FONT,
                  background: hasHalfUsed ? 'rgba(255,255,255,0.02)' : 'rgba(251,191,36,0.08)',
                  border: `1px solid ${hasHalfUsed ? 'rgba(255,255,255,0.04)' : 'rgba(251,191,36,0.25)'}`,
                  color: hasHalfUsed ? '#2a2d4a' : '#fbbf24',
                }}
              >
                50/50
              </button>
            )}
            {lifelinesAvail.skip && (
              <button
                className="lifeline-btn"
                disabled={hasSkipUsed || feedback !== 'none'}
                onClick={useSkip}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '9px', fontWeight: 700,
                  letterSpacing: '1px', cursor: 'pointer', fontFamily: FONT,
                  background: hasSkipUsed ? 'rgba(255,255,255,0.02)' : 'rgba(56,189,248,0.08)',
                  border: `1px solid ${hasSkipUsed ? 'rgba(255,255,255,0.04)' : 'rgba(56,189,248,0.25)'}`,
                  color: hasSkipUsed ? '#2a2d4a' : '#38bdf8',
                }}
              >
                SKIP &#x27A1;
              </button>
            )}
            {lifelinesAvail.freeze && (
              <button
                className="lifeline-btn"
                disabled={hasFreezeUsed || feedback !== 'none'}
                onClick={useTimeFreeze}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '9px', fontWeight: 700,
                  letterSpacing: '1px', cursor: 'pointer', fontFamily: FONT,
                  background: hasFreezeUsed ? 'rgba(255,255,255,0.02)' : 'rgba(6,182,212,0.08)',
                  border: `1px solid ${hasFreezeUsed ? 'rgba(255,255,255,0.04)' : 'rgba(6,182,212,0.25)'}`,
                  color: hasFreezeUsed ? '#2a2d4a' : '#06b6d4',
                }}
              >
                &#x2744; FREEZE
              </button>
            )}
            {lifelinesAvail.double && (
              <button
                className="lifeline-btn"
                disabled={hasDoubleUsed || feedback !== 'none'}
                onClick={useDoublePoints}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '9px', fontWeight: 700,
                  letterSpacing: '1px', cursor: 'pointer', fontFamily: FONT,
                  background: hasDoubleUsed ? 'rgba(255,255,255,0.02)' : 'rgba(244,114,182,0.08)',
                  border: `1px solid ${hasDoubleUsed ? 'rgba(255,255,255,0.04)' : 'rgba(244,114,182,0.25)'}`,
                  color: hasDoubleUsed ? '#2a2d4a' : '#f472b6',
                }}
              >
                2x PTS
              </button>
            )}
            {lifelinesAvail.hint && (
              <button
                className="lifeline-btn"
                disabled={hasHintUsed || feedback !== 'none' || !problem.hint}
                onClick={useHintReveal}
                style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '9px', fontWeight: 700,
                  letterSpacing: '1px', cursor: 'pointer', fontFamily: FONT,
                  background: hasHintUsed ? 'rgba(255,255,255,0.02)' : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${hasHintUsed ? 'rgba(255,255,255,0.04)' : 'rgba(16,185,129,0.25)'}`,
                  color: hasHintUsed ? '#2a2d4a' : '#10b981',
                }}
              >
                &#x2192; HINT
              </button>
            )}
          </div>

          {/* Options 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {problem.options.map((opt, oi) => (
              <button
                key={opt}
                className="opt-btn"
                onClick={() => { if (feedback === 'none' && !hiddenOpts.has(opt)) handleAnswer(opt); }}
                style={{
                  padding: '14px 8px',
                  borderRadius: '14px',
                  border: '1px solid',
                  cursor: feedback === 'none' && !hiddenOpts.has(opt) ? 'pointer' : 'default',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: problem.latex ? 'clamp(12px, 3vw, 16px)' : 'clamp(13px, 4vw, 20px)',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  wordBreak: 'break-word' as const,
                  animation: `slideIn 0.2s ease ${oi * 0.05}s both`,
                  ...optStyle(opt),
                }}
              >
                {hiddenOpts.has(opt) ? '' : problem.latex ? <MathInline tex={opt} /> : opt}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback !== 'none' && (
            <div style={{
              textAlign: 'center', marginTop: '6px', fontSize: '13px', fontWeight: 700,
              color: feedback === 'correct' ? '#10b981' : '#ef4444',
              animation: 'fadeIn 0.2s ease',
              letterSpacing: '1px',
            }}>
              {feedback === 'correct' && <span>CORRECT {isDoubleActive ? '' : ''}{questionScores.length > 0 ? `+${questionScores[questionScores.length - 1]}` : ''}</span>}
              {feedback === 'wrong'   && <span>WRONG &#8212; {problem.latex ? <MathInline tex={problem.answer} /> : problem.answer}</span>}
              {feedback === 'timeout' && <span>TIME UP &#8212; {problem.latex ? <MathInline tex={problem.answer} /> : problem.answer}</span>}
            </div>
          )}

          {/* Persistent instruction bar */}
          {feedback === 'none' && (
            <div style={{
              textAlign: 'center', marginTop: '5px',
              fontSize: '9px', letterSpacing: '2px', fontWeight: 600,
              color: '#2a2d4a',
            }}>
              TAP AN ANSWER &nbsp;&#xB7;&nbsp; {currentIdx + 1} OF {questionCount}
            </div>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {phase === 'results' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px', overflowY: 'auto', animation: 'slideUp 0.4s ease' }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: '2px', marginBottom: '12px',
            background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '3px',
          }}>
            {([
              ['results',      'Results',  '#818cf8'],
              ['leaderboard',  'Board',    '#818cf8'],
              ['fame',         'Fame',     '#fbbf24'],
              ['shame',        'Shame',    '#ef4444'],
            ] as [ResultTab, string, string][]).map(([t, label, clr]) => (
              <button key={t} className="tab-btn" onClick={() => setResultTab(t)} style={{
                flex: 1, padding: '8px 4px', borderRadius: '8px',
                border: 'none',
                background: resultTab === t ? `${clr}18` : 'transparent',
                color: resultTab === t ? clr : '#2a2d4a',
                fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', fontWeight: 700,
                fontFamily: FONT,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Results tab ── */}
          {resultTab === 'results' && (
            <>
              {/* Mission badge if applicable */}
              {activeMission && (
                <div style={{
                  textAlign: 'center', marginBottom: '8px', padding: '8px',
                  background: `${activeMission.color}08`, borderRadius: '12px',
                  border: `1px solid ${activeMission.color}20`,
                }}>
                  <span style={{ fontSize: '16px' }} dangerouslySetInnerHTML={{ __html: activeMission.emoji }} />
                  <span style={{ fontSize: '11px', color: activeMission.color, fontWeight: 700, marginLeft: '8px', letterSpacing: '2px' }}>
                    {activeMission.name.toUpperCase()} COMPLETE
                  </span>
                </div>
              )}

              {/* Math Level Badge */}
              <div style={{
                padding: '18px 16px', textAlign: 'center', marginBottom: '10px',
                background: `linear-gradient(135deg, ${mathLevel.color}08, ${mathLevel.color}04)`,
                borderRadius: '20px',
                border: `1px solid ${mathLevel.color}25`,
                animation: 'badgePulse 3s ease-in-out infinite',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '6px', animation: 'popIn 0.5s ease' }}
                  dangerouslySetInnerHTML={{ __html: mathLevel.emoji }} />
                <div style={{
                  fontSize: '10px', color: '#4b5079', letterSpacing: '4px', marginBottom: '4px', fontWeight: 700,
                }}>YOUR MATH LEVEL</div>
                <div style={{
                  fontSize: '22px', fontWeight: 800, color: mathLevel.color,
                  animation: 'gradeGlow 2s ease-in-out infinite',
                  letterSpacing: '2px',
                }}>{mathLevel.grade.toUpperCase()}</div>
                <div style={{
                  fontSize: '14px', fontWeight: 700, marginTop: '4px',
                  background: `linear-gradient(135deg, ${mathLevel.color}, ${mathLevel.color}aa)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{mathLevel.title}</div>
                <div style={{ fontSize: '10px', color: '#4b5079', marginTop: '6px', lineHeight: 1.4, maxWidth: '280px', margin: '6px auto 0' }}>
                  {mathLevel.description}
                </div>
              </div>

              {/* Score card */}
              <div style={{
                padding: '16px 14px', textAlign: 'center', marginBottom: '10px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                {isNewBest && (
                  <div style={{
                    display: 'inline-block', fontSize: '10px', color: '#10b981', fontWeight: 700,
                    letterSpacing: '2px', marginBottom: '6px', padding: '3px 10px',
                    background: 'rgba(16,185,129,0.08)', borderRadius: '20px',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                    NEW PERSONAL BEST
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{
                    fontSize: '44px', fontWeight: 800,
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{score}</div>
                  <div style={{
                    fontSize: '28px', fontWeight: 900, color: letterGrade.color,
                    textShadow: `0 0 20px ${letterGrade.color}40`,
                    lineHeight: 1,
                  }}>
                    {letterGrade.grade}
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#3b3d5c', marginTop: '2px', letterSpacing: '3px', fontWeight: 600 }}>POINTS</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{correctCount}/{questionCount}</div>
                    <div style={{ fontSize: '8px', color: '#2a2d4a', letterSpacing: '2px', marginTop: '2px' }}>CORRECT</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: accuracyPct >= 80 ? '#10b981' : accuracyPct >= 50 ? '#fbbf24' : '#ef4444' }}>{accuracyPct}%</div>
                    <div style={{ fontSize: '8px', color: '#2a2d4a', letterSpacing: '2px', marginTop: '2px' }}>ACCURACY</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>{maxStreak}x</div>
                    <div style={{ fontSize: '8px', color: '#2a2d4a', letterSpacing: '2px', marginTop: '2px' }}>STREAK</div>
                  </div>
                  {finalRank != null && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#6366f1' }}>#{finalRank}</div>
                      <div style={{ fontSize: '8px', color: '#2a2d4a', letterSpacing: '2px', marginTop: '2px' }}>RANK</div>
                    </div>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: diffColor }}>{DIFF_LABEL[difficulty]}</div>
                    <div style={{ fontSize: '8px', color: '#2a2d4a', letterSpacing: '2px', marginTop: '2px' }}>MODE</div>
                  </div>
                </div>
                {finalRank != null && (
                  <div style={{ fontSize: '10px', color: '#2a2d4a', marginTop: '6px' }}>of {finalTotal} players</div>
                )}
              </div>

              {/* Answer history */}
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                {history.map((correct, i) => (
                  <div key={i} style={{
                    width: '26px', height: '26px', borderRadius: '7px',
                    background: correct
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(239,68,68,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, flexShrink: 0,
                    color: correct ? '#10b981' : '#ef4444',
                    border: `1px solid ${correct ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    animation: `slideIn 0.2s ease ${i * 0.05}s both`,
                  }}>
                    {correct ? '\u2713' : '\u2717'}
                  </div>
                ))}
              </div>

              {/* Category Performance Breakdown */}
              {Object.keys(categoryStats).length > 0 && (
                <div style={{
                  marginBottom: '10px', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.015)', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ fontSize: '9px', color: '#4b5079', letterSpacing: '3px', fontWeight: 700, marginBottom: '8px' }}>CATEGORY BREAKDOWN</div>
                  {Object.entries(categoryStats).map(([cat, { total, correct }], i) => {
                    const pct = Math.round((correct / total) * 100);
                    const barColor = pct === 100 ? '#10b981' : pct >= 50 ? '#fbbf24' : '#ef4444';
                    return (
                      <div key={cat} style={{ marginBottom: '6px', animation: `slideIn 0.2s ease ${i * 0.05}s both` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: 600 }}>{cat}</span>
                          <span style={{ fontSize: '10px', color: barColor, fontWeight: 700 }}>{correct}/{total}</span>
                        </div>
                        <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{
                            height: '100%', borderRadius: '2px', background: barColor,
                            width: `${pct}%`, transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Weak area recommendation */}
              {weakCategory && phase === 'results' && (
                <div style={{
                  marginBottom: '10px', padding: '10px 14px',
                  background: 'rgba(249,115,22,0.04)', borderRadius: '12px',
                  border: '1px solid rgba(249,115,22,0.12)',
                  fontSize: '11px', color: '#f97316', lineHeight: 1.5, textAlign: 'center',
                  fontWeight: 600, animation: 'fadeIn 0.3s ease',
                }}>
                  &#x25B3; Focus area: <span style={{ color: '#fb923c', fontWeight: 700 }}>{weakCategory}</span> &#8212; practice this category to improve your score
                </div>
              )}

              {/* Math fact */}
              <div style={{
                marginBottom: '10px', padding: '10px 14px',
                background: 'rgba(99,102,241,0.04)', borderRadius: '12px',
                border: '1px solid rgba(99,102,241,0.1)',
                fontSize: '11px', color: '#8b8fad', lineHeight: 1.5, textAlign: 'center',
              }}>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>&#x2234; Insight:</span> {getMathFact(dayIndex + score)}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="diff-btn" onClick={() => setResultTab('fame')} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', fontFamily: FONT,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.15)',
                  color: 'rgba(250,204,21,0.7)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '1px', cursor: 'pointer',
                }}>FAME</button>
                <button className="diff-btn" onClick={() => setPhase('menu')} style={{
                  flex: 1.5, padding: '12px', borderRadius: '12px', fontFamily: FONT,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: '#fff', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '2px', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}>PLAY AGAIN</button>
                <button className="diff-btn" onClick={() => setResultTab('shame')} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', fontFamily: FONT,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(239,68,68,0.15)',
                  color: 'rgba(239,68,68,0.7)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '1px', cursor: 'pointer',
                }}>SHAME</button>
              </div>

              {/* Share button */}
              <button className="diff-btn" onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareText).then(() => {
                    const btn = document.getElementById('share-btn');
                    if (btn) { btn.textContent = 'COPIED!'; setTimeout(() => { btn.textContent = 'SHARE SCORE'; }, 1500); }
                  }).catch(() => {});
                }
              }} style={{
                width: '100%', padding: '10px', borderRadius: '12px', fontFamily: FONT,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))',
                border: '1px solid rgba(16,185,129,0.2)',
                color: '#10b981', fontSize: '10px', fontWeight: 700,
                letterSpacing: '2px', cursor: 'pointer', marginTop: '8px',
              }}>
                <span id="share-btn">SHARE SCORE</span>
              </button>
            </>
          )}

          {/* ── Leaderboard tab ── */}
          {resultTab === 'leaderboard' && (
            <div>
              <div style={{ fontSize: '10px', color: '#3b3d5c', textAlign: 'center', marginBottom: '12px', letterSpacing: '2px', fontWeight: 600 }}>
                {DIFF_LABEL[difficulty]} &middot; TOP SCORES &middot; {finalTotal} PLAYER{finalTotal !== 1 ? 'S' : ''}
              </div>
              {leaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#2a2d4a', fontSize: '12px', paddingTop: '30px' }}>
                  No scores yet &#8212; you could be first.
                </div>
              ) : leaderboard.map((e, i) => {
                const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
                const isMe = e.username === username;
                return (
                  <div key={e.username} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '12px', marginBottom: '3px',
                    background: isMe ? 'rgba(99,102,241,0.06)' : i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    border: isMe ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                    animation: `slideIn 0.3s ease ${i * 0.04}s both`,
                  }}>
                    <span style={{ fontSize: '14px', width: '26px', textAlign: 'center', color: '#4b5079' }}>{medals[i] ?? `${i + 1}`}</span>
                    <span style={{ flex: 1, fontSize: '13px', color: isMe ? '#818cf8' : '#c7d2fe', fontWeight: isMe ? 700 : 400 }}>
                      {e.username}{isMe ? ' (you)' : ''}
                    </span>
                    <span style={{
                      fontSize: '14px', fontWeight: 700,
                      background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>{e.score}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Wall of Fame tab ── */}
          {resultTab === 'fame' && (
            <div>
              <div style={{
                textAlign: 'center', marginBottom: '14px', padding: '16px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '18px',
                border: '1px solid rgba(250,204,21,0.1)',
              }}>
                <div style={{ fontSize: '26px', marginBottom: '4px' }}>&#9733;</div>
                <div style={{
                  fontSize: '16px', fontWeight: 800, letterSpacing: '5px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s linear infinite',
                }}>WALL OF FAME</div>
                <div style={{ fontSize: '9px', color: '#3b3d5c', marginTop: '4px', letterSpacing: '2px' }}>
                  {DIFF_LABEL[difficulty]} &middot; TOP PERFORMERS &middot; {finalTotal} PLAYER{finalTotal !== 1 ? 'S' : ''}
                </div>
              </div>
              {wallFame.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#2a2d4a', fontSize: '12px', paddingTop: '20px' }}>
                  No legends yet &#8212; be the first.
                </div>
              ) : wallFame.map((e, i) => {
                const isMe = e.username === username;
                return (
                  <div key={e.username} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '12px', marginBottom: '3px',
                    background: i === 0
                      ? 'rgba(250,204,21,0.04)'
                      : isMe ? 'rgba(99,102,241,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    border: i === 0
                      ? '1px solid rgba(250,204,21,0.15)'
                      : isMe ? '1px solid rgba(99,102,241,0.1)' : '1px solid transparent',
                    animation: `slideIn 0.3s ease ${i * 0.04}s both`,
                  }}>
                    <span style={{ fontSize: '13px', width: '26px', textAlign: 'center', color: i === 0 ? '#fbbf24' : '#4b5079', fontWeight: 700 }}>
                      {i + 1}
                    </span>
                    <span style={{
                      flex: 1, fontSize: '13px', fontWeight: i === 0 || isMe ? 700 : 400,
                      color: i === 0 ? '#fbbf24' : isMe ? '#818cf8' : '#c7d2fe',
                    }}>
                      {e.username}{isMe ? ' (you)' : ''}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>{e.score}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Wall of Shame tab ── */}
          {resultTab === 'shame' && (
            <div>
              <div style={{
                textAlign: 'center', marginBottom: '14px', padding: '16px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '18px',
                border: '1px solid rgba(239,68,68,0.1)',
              }}>
                <div style={{ fontSize: '26px', marginBottom: '4px' }}>&#9760;</div>
                <div style={{
                  fontSize: '16px', fontWeight: 800, letterSpacing: '5px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s linear infinite',
                }}>WALL OF SHAME</div>
                <div style={{ fontSize: '9px', color: '#3b3d5c', marginTop: '4px', letterSpacing: '2px' }}>
                  {DIFF_LABEL[difficulty]} &middot; BOTTOM PERFORMERS &middot; {finalTotal} PLAYER{finalTotal !== 1 ? 'S' : ''}
                </div>
              </div>
              {wallShame.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#2a2d4a', fontSize: '12px', paddingTop: '20px' }}>
                  Nobody here yet &#8212; don't be the first.
                </div>
              ) : wallShame.map((e, i) => {
                const isMe = e.username === username;
                return (
                  <div key={e.username} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '12px', marginBottom: '3px',
                    background: i === 0
                      ? 'rgba(239,68,68,0.04)'
                      : isMe ? 'rgba(239,68,68,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    border: i === 0
                      ? '1px solid rgba(239,68,68,0.15)'
                      : isMe ? '1px solid rgba(239,68,68,0.1)' : '1px solid transparent',
                    animation: `slideIn 0.3s ease ${i * 0.04}s both`,
                  }}>
                    <span style={{ fontSize: '13px', width: '26px', textAlign: 'center', color: i === 0 ? '#ef4444' : '#4b5079', fontWeight: 700 }}>
                      {i + 1}
                    </span>
                    <span style={{
                      flex: 1, fontSize: '13px', fontWeight: i === 0 || isMe ? 700 : 400,
                      color: i === 0 ? '#ef4444' : isMe ? '#f87171' : '#c7d2fe',
                    }}>
                      {e.username}{isMe ? ' (you)' : ''}
                    </span>
                    <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: 700 }}>{e.score}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);

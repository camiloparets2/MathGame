import { EASY_PROBLEMS, MEDIUM_PROBLEMS, HARD_PROBLEMS } from './questionBank';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
  question: string;   // plain text OR LaTeX (when latex: true)
  options: string[];  // plain text OR LaTeX (when latex: true)
  answer: string;
  category: string;
  latex?: boolean;    // if true, render question + options with KaTeX
  hint?: string;      // learning hint shown after wrong answer
  explanation?: string; // step-by-step explanation for learning mode
}

export const QUESTIONS_PER_ROUND = 10;

export const TIME_PER_QUESTION: Record<Difficulty, number> = {
  easy: 35,
  medium: 30,
  hard: 25,
};

export const DIFF_COLOR: Record<Difficulty, string> = {
  easy: '#00c87a',
  medium: '#ffd700',
  hard: '#ff4a4a',
};

export function getDayIndex(): number {
  const epoch = new Date('2024-03-05T00:00:00Z').getTime();
  return Math.floor((Date.now() - epoch) / 86_400_000);
}

export const DIFF_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2.5,
};

export function calcQuestionScore(
  isCorrect: boolean,
  timeLeft: number,
  maxTime: number,
  streak: number,
  difficulty: Difficulty = 'medium',
  missionMultiplier: number = 1,
): number {
  if (!isCorrect) return 0;
  const mult = DIFF_MULTIPLIER[difficulty];
  const base = Math.floor(100 * mult);
  const speed = Math.floor((timeLeft / maxTime) * 50 * mult);
  const streakBonus = streak >= 3 ? Math.floor((streak - 2) * 10 * mult) : 0;
  // Speed combo: extra bonus for answering in top 30% of time remaining
  const speedCombo = (timeLeft / maxTime) > 0.7 && streak >= 2 ? Math.floor(25 * mult) : 0;
  return Math.floor((base + speed + streakBonus + speedCombo) * missionMultiplier);
}

// ─── Daily Mission System ────────────────────────────────────────────────────

export interface DailyMission {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  modifier: string;          // short tag for HUD display
  timeMultiplier: number;    // 1 = normal, 0.5 = half time, 1.5 = extra time
  scoreMultiplier: number;   // applied on top of difficulty multiplier
  questionCount: number;     // override QUESTIONS_PER_ROUND
  lifelines: number;         // 0=none, 2=normal, 3=extra
  categories?: string[];     // if set, only these categories are used
  progressive: boolean;      // questions get harder within round
}

const MISSIONS: DailyMission[] = [
  {
    id: 'financial-literacy',
    name: 'Financial Literacy',
    emoji: '&#x2234;',
    description: 'Real-world money problems: budgets, interest, percentages. Extra time for careful calculation.',
    color: '#a78bfa',
    modifier: 'FINANCE FOCUS',
    timeMultiplier: 1.5,
    scoreMultiplier: 1.2,
    questionCount: 10,
    lifelines: 2,
    categories: ['Money Math', 'Finance', 'Percentages'],
    progressive: false,
  },
  {
    id: 'rapid-computation',
    name: 'Rapid Computation',
    emoji: '&#x2261;',
    description: 'Half the time. Triple the reward. Tests raw computational fluency under pressure.',
    color: '#ef4444',
    modifier: '3x SCORE / HALF TIME',
    timeMultiplier: 0.5,
    scoreMultiplier: 3,
    questionCount: 10,
    lifelines: 1,
    progressive: false,
  },
  {
    id: 'applied-science',
    name: 'Applied Science',
    emoji: '&#x2206;',
    description: 'Physics, engineering, and unit conversions. Math meets the physical world.',
    color: '#818cf8',
    modifier: 'SCIENCE + UNITS',
    timeMultiplier: 1.3,
    scoreMultiplier: 1.5,
    questionCount: 10,
    lifelines: 2,
    categories: ['Physics', 'Unit Conversion', 'Distance'],
    progressive: true,
  },
  {
    id: 'spatial-reasoning',
    name: 'Spatial Reasoning',
    emoji: '&#x25B3;',
    description: 'Geometry and measurement. Areas, volumes, Pythagorean theorem -- think in dimensions.',
    color: '#2dd4bf',
    modifier: 'GEOMETRY FOCUS',
    timeMultiplier: 1.3,
    scoreMultiplier: 1.3,
    questionCount: 10,
    lifelines: 2,
    categories: ['Geometry', 'Measurement', 'Roots'],
    progressive: false,
  },
  {
    id: 'endurance-round',
    name: 'Endurance Round',
    emoji: '&#x221E;',
    description: '15 problems, progressive difficulty. Starts with everyday math, ends with advanced applications.',
    color: '#fbbf24',
    modifier: '15 PROBLEMS',
    timeMultiplier: 1,
    scoreMultiplier: 1.2,
    questionCount: 15,
    lifelines: 3,
    progressive: true,
  },
  {
    id: 'pure-recall',
    name: 'Pure Recall',
    emoji: '&#x2205;',
    description: 'No tools. No safety net. Double points reward those who rely on knowledge alone.',
    color: '#dc2626',
    modifier: 'NO AIDS / 2x SCORE',
    timeMultiplier: 0.85,
    scoreMultiplier: 2,
    questionCount: 10,
    lifelines: 0,
    progressive: false,
  },
  {
    id: 'data-driven',
    name: 'Data & Decisions',
    emoji: '&#x2202;',
    description: 'Statistics, probability, and data interpretation. Learn to reason with numbers. Explanations on every miss.',
    color: '#10b981',
    modifier: 'STATS + LEARN',
    timeMultiplier: 1.8,
    scoreMultiplier: 0.8,
    questionCount: 10,
    lifelines: 3,
    categories: ['Statistics', 'Probability', 'Combinatorics', 'Ratios'],
    progressive: true,
  },
  {
    id: 'mental-marathon',
    name: 'Mental Marathon',
    emoji: '&#x2243;',
    description: '12 problems. No calculator mindset — estimation, mental shortcuts, and number sense. Speed bonus doubled.',
    color: '#f97316',
    modifier: 'MENTAL MATH / 2x SPEED',
    timeMultiplier: 0.7,
    scoreMultiplier: 1.8,
    questionCount: 12,
    lifelines: 1,
    categories: ['Estimation', 'Patterns', 'Mental Math', 'Number Sense'],
    progressive: true,
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    emoji: '&#x2295;',
    description: 'Multi-step real-world problems. Logic, algebra, and critical thinking. Extra time, progressive difficulty.',
    color: '#06b6d4',
    modifier: 'LOGIC + CRITICAL THINKING',
    timeMultiplier: 1.6,
    scoreMultiplier: 1.5,
    questionCount: 10,
    lifelines: 2,
    categories: ['Logic', 'Algebra', 'Word Problems', 'Finance'],
    progressive: true,
  },
  {
    id: 'number-theory',
    name: 'Number Theory Gauntlet',
    emoji: '&#x2119;',
    description: 'Primes, factors, divisibility, modular arithmetic, and the deep structure of integers. For the true math enthusiast.',
    color: '#a855f7',
    modifier: 'NUMBER THEORY / 2x SCORE',
    timeMultiplier: 1.2,
    scoreMultiplier: 2.0,
    questionCount: 10,
    lifelines: 2,
    categories: ['Number Theory', 'Divisibility', 'Primes', 'Factorials', 'Patterns'],
    progressive: true,
  },
  {
    id: 'algebra-sprint',
    name: 'Algebra Sprint',
    emoji: '&#x1D465;',
    description: 'Solve for x at full speed. Equations, expressions, inequalities, and systems — pure algebraic thinking under the clock.',
    color: '#84cc16',
    modifier: 'ALGEBRA / 1.8x SCORE',
    timeMultiplier: 0.85,
    scoreMultiplier: 1.8,
    questionCount: 10,
    lifelines: 2,
    categories: ['Algebra', 'Equations', 'Quadratics', 'Inequalities'],
    progressive: true,
  },
];

export function getTodaysMission(dayIndex: number): DailyMission {
  return MISSIONS[dayIndex % MISSIONS.length]!;
}

export function getAllMissions(): DailyMission[] {
  return MISSIONS;
}

// ─── Letter Grade + Share Score ──────────────────────────────────────────────

export function getLetterGrade(correctPct: number, maxStreak: number, questionCount: number): { grade: string; color: string } {
  const streakBonus = maxStreak / questionCount * 10; // 0-10 bonus
  const composite = correctPct + streakBonus;
  if (composite >= 105) return { grade: 'S', color: '#eab308' };
  if (composite >= 95) return { grade: 'A+', color: '#10b981' };
  if (composite >= 85) return { grade: 'A', color: '#10b981' };
  if (composite >= 75) return { grade: 'B+', color: '#38bdf8' };
  if (composite >= 65) return { grade: 'B', color: '#38bdf8' };
  if (composite >= 55) return { grade: 'C+', color: '#fbbf24' };
  if (composite >= 45) return { grade: 'C', color: '#fbbf24' };
  if (composite >= 35) return { grade: 'D', color: '#f97316' };
  return { grade: 'F', color: '#ef4444' };
}

export function getShareText(
  score: number, correct: number, total: number,
  difficulty: Difficulty, grade: string, mathLevel: MathLevel, dayIndex: number,
): string {
  const pct = Math.round((correct / total) * 100);
  const bars = Array.from({ length: total }, (_, i) => i < correct ? '\u2588' : '\u2591').join('');
  return [
    `MATHY BLITZ #${dayIndex}`,
    `${bars}`,
    `${score} pts | ${correct}/${total} (${pct}%) | Grade: ${grade}`,
    `Level: ${mathLevel.grade} - ${mathLevel.title}`,
    `Mode: ${difficulty.toUpperCase()}`,
    `Can you beat my score?`,
  ].join('\n');
}

// ─── Math Facts (shown between questions) ────────────────────────────────────

const MATH_FACTS = [
  'The sum of the first n odd numbers always equals n squared. Example: 1+3+5+7 = 16 = 4^2.',
  'Multiplying by 9: the digits of the result always sum to 9. Example: 9 x 7 = 63, and 6+3 = 9.',
  'Any number divisible by both 3 and 4 is also divisible by 12.',
  'To square a number ending in 5: multiply the tens digit by (tens+1), then append 25. Example: 35^2 = 3x4|25 = 1225.',
  'The difference of two squares: a^2 - b^2 = (a+b)(a-b). Useful for fast mental multiplication.',
  'To multiply by 25: divide by 4 and multiply by 100. Example: 48 x 25 = 48/4 x 100 = 1200.',
  '0.999... repeating equals exactly 1. Proof: let x = 0.999..., then 10x = 9.999..., so 9x = 9, thus x = 1.',
  'Euler\'s identity e^(i*pi) + 1 = 0 connects the five fundamental constants of mathematics.',
  'The Fibonacci sequence ratio converges to the golden ratio phi = (1+sqrt(5))/2 = 1.618...',
  'Every even perfect number has the form 2^(p-1) x (2^p - 1), where 2^p - 1 is prime (Mersenne prime).',
  'The harmonic series 1 + 1/2 + 1/3 + 1/4 + ... diverges to infinity, despite its terms approaching zero.',
  'There are infinitely many primes. Euclid proved this around 300 BCE -- one of the oldest proofs in math.',
  'The number 1729 = 12^3 + 1^3 = 10^3 + 9^3, the smallest number expressible as two different sums of cubes.',
  'To check divisibility by 3: sum the digits. If that sum is divisible by 3, so is the original number.',
  'The Collatz conjecture: start with any positive integer. If even, halve it. If odd, triple it and add 1. It always reaches 1 -- but nobody has proven why.',
  'The Basel problem: 1/1^2 + 1/2^2 + 1/3^2 + ... = pi^2/6. Euler solved this in 1734.',
  'Mental math shortcut: (a+b)^2 = a^2 + 2ab + b^2. For 23^2: 20^2 + 2(20)(3) + 3^2 = 400+120+9 = 529.',
  'A number is divisible by 11 if the alternating sum of its digits is divisible by 11. Example: 918082 -> 9-1+8-0+8-2 = 22.',
  'The prime counting function: there are approximately n/ln(n) primes less than n (Prime Number Theorem).',
  'Fermat\'s Last Theorem: a^n + b^n = c^n has no integer solutions for n > 2. Proven by Andrew Wiles in 1995 after 358 years.',
];

export function getMathFact(seed: number): string {
  return MATH_FACTS[Math.abs(seed) % MATH_FACTS.length]!;
}

// ─── Math Level Assessment ───────────────────────────────────────────────────

export interface MathLevel {
  grade: string;
  title: string;
  description: string;
  color: string;
  emoji: string;
}

export function getMathLevel(
  difficulty: Difficulty,
  correct: number,
  score: number,
  maxStreak: number,
): MathLevel {
  const maxPossibleScore = QUESTIONS_PER_ROUND * Math.floor(150 * DIFF_MULTIPLIER[difficulty]);
  const scorePct = Math.min(score / maxPossibleScore, 1);
  const correctPct = correct / QUESTIONS_PER_ROUND;
  const streakBonus = Math.min(maxStreak / QUESTIONS_PER_ROUND, 1) * 0.1;
  const composite = correctPct * 0.6 + scorePct * 0.3 + streakBonus;

  const diffOffset = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 4 : 8;
  const step = Math.floor(composite * 5.99);
  const gradeIndex = Math.min(diffOffset + step, 17);

  const levels: MathLevel[] = [
    { grade: 'Pre-K',       title: 'Foundational',           description: 'Building number sense. Consistent practice develops fluency.',     color: '#94a3b8', emoji: '&#x2500;' },
    { grade: 'Kindergarten', title: 'Numerate',              description: 'Basic counting and number recognition established.',                color: '#a3e635', emoji: '&#x2502;' },
    { grade: '1st Grade',   title: 'Arithmetic I',           description: 'Single-digit operations are forming. Solid starting foundation.',  color: '#4ade80', emoji: '&#x002B;' },
    { grade: '2nd Grade',   title: 'Arithmetic II',          description: 'Multi-digit addition and subtraction. Operations are clicking.',   color: '#2dd4bf', emoji: '&#x00D7;' },
    { grade: '3rd Grade',   title: 'Computational',          description: 'Multiplication fluency developing. Mental math is sharpening.',    color: '#38bdf8', emoji: '&#x00F7;' },
    { grade: '4th Grade',   title: 'Analytical',             description: 'Strong arithmetic speed. Multi-step reasoning is solid.',          color: '#818cf8', emoji: '&#x2248;' },
    { grade: '5th Grade',   title: 'Problem Solver',         description: 'Handles complexity. Decomposition strategies are effective.',      color: '#a78bfa', emoji: '&#x2260;' },
    { grade: '6th Grade',   title: 'Rational Thinker',       description: 'Fractions, percentages, and ratios are well understood.',          color: '#c084fc', emoji: '&#x2234;' },
    { grade: '7th Grade',   title: 'Pre-Algebraic',          description: 'Variable thinking emerging. Ready for abstract reasoning.',        color: '#e879f9', emoji: '&#x1D465;' },
    { grade: '8th Grade',   title: 'Algebraic',              description: 'Equations and expressions manipulated with confidence.',           color: '#f472b6', emoji: '&#x2261;' },
    { grade: '9th Grade',   title: 'Advanced Algebra',       description: 'Polynomials, factoring, and function reasoning are strong.',       color: '#fb923c', emoji: '&#x222B;' },
    { grade: '10th Grade',  title: 'Geometric Reasoner',     description: 'Spatial and deductive reasoning applied effectively.',             color: '#fbbf24', emoji: '&#x25B3;' },
    { grade: '11th Grade',  title: 'Advanced Mathematics',   description: 'Operating at pre-calculus level. Abstract thinking is sharp.',     color: '#f59e0b', emoji: '&#x2211;' },
    { grade: '12th Grade',  title: 'Calculus-Ready',         description: 'Senior-level mathematical reasoning. Approaching college math.',  color: '#ef4444', emoji: '&#x2202;' },
    { grade: 'College',     title: 'Undergraduate Level',    description: 'University-grade computational and analytical ability.',           color: '#dc2626', emoji: '&#x221E;' },
    { grade: 'Graduate',    title: 'Graduate Level',         description: 'Mental computation rivals systematic calculation methods.',        color: '#b91c1c', emoji: '&#x2207;' },
    { grade: 'Professor',   title: 'Research Level',         description: 'Exceptional mathematical fluency across domains.',                color: '#9333ea', emoji: '&#x2200;' },
    { grade: 'Fields Medal',title: 'Fields Medalist',        description: 'Flawless. Computational mastery at the highest measurable level.',color: '#eab308', emoji: '&#x2205;' },
  ];

  return levels[gradeIndex]!;
}

// ─── PRNG (Mulberry32) ────────────────────────────────────────────────────────

function createRng(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function opts(correct: string, wrong: string[], rng: () => number): string[] {
  const uniq = [...new Set(wrong.filter(w => w !== correct && w.trim() !== ''))];
  let pad = 1;
  while (uniq.length < 3) {
    const cand = String(Number(correct) + pad++);
    if (!uniq.includes(cand) && cand !== correct) uniq.push(cand);
  }
  return shuffle([correct, ...uniq.slice(0, 3)], rng);
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EASY GENERATORS — Real-World Foundations ───────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function easyGroceryBill(rng: () => number): Problem {
  const items = Math.floor(rng() * 5) + 2;
  const price = Math.floor(rng() * 6) + 2;
  const ans = String(items * price);
  return {
    question: `\\text{${items} items at \\$${price} each. Total cost?}`, answer: ans,
    options: opts(ans, [String(items * price + price), String(items + price), String(items * price - items)], rng),
    category: 'Money Math', latex: true,
    hint: `Total = quantity x price per item`,
    explanation: `${items} x $${price} = $${ans}`,
  };
}

function easyMakeChange(rng: () => number): Problem {
  const cost = Math.floor(rng() * 15) + 5;
  const paid = cost + Math.floor(rng() * 12) + 3;
  const ans = String(paid - cost);
  return {
    question: `\\text{Pay \\$${paid} for a \\$${cost} item. Change?}`, answer: ans,
    options: opts(ans, [String(paid - cost + 1), String(paid), String(cost)], rng),
    category: 'Money Math', latex: true,
    hint: `Change = amount paid - cost`,
    explanation: `$${paid} - $${cost} = $${ans}`,
  };
}

function easySplitBill(rng: () => number): Problem {
  const people = Math.floor(rng() * 5) + 2;
  const total = people * (Math.floor(rng() * 12) + 5);
  const ans = String(total / people);
  return {
    question: `\\text{Split \\$${total} evenly among ${people} people?}`, answer: ans,
    options: opts(ans, [String(total / people + people), String(total - people), String(total)], rng),
    category: 'Money Math', latex: true,
    hint: `Divide total by number of people`,
    explanation: `$${total} / ${people} = $${ans} each`,
  };
}

function easyTipCalc(rng: () => number): Problem {
  const bill = (Math.floor(rng() * 18) + 2) * 5;
  const tipPct = pick([10, 15, 20] as const, rng);
  const tip = bill * tipPct / 100;
  const ans = String(tip);
  return {
    question: `\\text{${tipPct}\\% tip on \\$${bill} meal?}`, answer: ans,
    options: opts(ans, [String(tip + 5), String(bill), String(tip * 2)], rng),
    category: 'Percentages', latex: true,
    hint: `${tipPct}% = ${tipPct}/100. Multiply by the bill.`,
    explanation: `${tipPct}% of $${bill} = $${bill} x ${tipPct}/100 = $${ans}`,
  };
}

function easySalePrice(rng: () => number): Problem {
  const original = (Math.floor(rng() * 16) + 4) * 5;
  const discountPct = pick([10, 20, 25, 50] as const, rng);
  const discount = original * discountPct / 100;
  const ans = String(original - discount);
  return {
    question: `\\text{\\$${original} shirt, ${discountPct}\\% off. Sale price?}`, answer: ans,
    options: opts(ans, [String(original), String(discount), String(original - discount + 5)], rng),
    category: 'Percentages', latex: true,
    hint: `Find ${discountPct}% of $${original}, then subtract from original`,
    explanation: `${discountPct}% of $${original} = $${discount}. Sale: $${original} - $${discount} = $${ans}`,
  };
}

function easyTimeCalc(rng: () => number): Problem {
  const startH = Math.floor(rng() * 8) + 7;
  const startM = pick([0, 15, 30, 45] as const, rng);
  const durH = Math.floor(rng() * 3) + 1;
  const durM = pick([0, 15, 30, 45] as const, rng);
  const endM = (startM + durM) % 60;
  const endH = startH + durH + Math.floor((startM + durM) / 60);
  const ans = `${endH}:${String(endM).padStart(2, '0')}`;
  return {
    question: `\\text{Start ${startH}:${String(startM).padStart(2, '0')}, add ${durH}h ${durM}m. End time?}`,
    answer: ans,
    options: opts(ans, [`${endH + 1}:${String(endM).padStart(2, '0')}`, `${endH}:${String((endM + 15) % 60).padStart(2, '0')}`, `${endH - 1}:${String(endM).padStart(2, '0')}`], rng),
    category: 'Time', latex: true,
    hint: `Add hours first, then minutes. Watch for overflow past 60 min.`,
    explanation: `${startH}:${String(startM).padStart(2, '0')} + ${durH}h ${durM}m = ${ans}`,
  };
}

function easyUnitConvert(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const hrs = Math.floor(rng() * 4) + 1 + pick([0, 0.5] as const, rng);
    const ans = String(hrs * 60);
    return {
      question: `\\text{${hrs} hours = ? minutes}`, answer: ans,
      options: opts(ans, [String(hrs * 60 + 30), String(hrs * 100), String(hrs * 30)], rng),
      category: 'Unit Conversion', latex: true,
      hint: `1 hour = 60 minutes`,
      explanation: `${hrs} x 60 = ${ans} minutes`,
    };
  } else if (type === 1) {
    const kg = Math.floor(rng() * 8) + 2;
    const ans = String(kg * 1000);
    return {
      question: `\\text{${kg} kg = ? grams}`, answer: ans,
      options: opts(ans, [String(kg * 100), String(kg * 10000), String(kg * 500)], rng),
      category: 'Unit Conversion', latex: true,
      hint: `1 kg = 1,000 grams`,
      explanation: `${kg} x 1,000 = ${ans} grams`,
    };
  } else {
    const cm = (Math.floor(rng() * 15) + 5) * 100;
    const ans = String(cm / 100);
    return {
      question: `\\text{${cm} cm = ? meters}`, answer: ans,
      options: opts(ans, [String(cm / 10), String(cm / 1000), String(cm)], rng),
      category: 'Unit Conversion', latex: true,
      hint: `100 cm = 1 meter`,
      explanation: `${cm} / 100 = ${ans} meters`,
    };
  }
}

function easyDistance(rng: () => number): Problem {
  const speed = pick([3, 4, 5, 6, 10, 15, 20, 30] as const, rng);
  const time = Math.floor(rng() * 4) + 2;
  const ans = String(speed * time);
  const label = speed <= 6 ? 'walk' : speed <= 20 ? 'cycle' : 'drive';
  return {
    question: `\\text{${label[0]!.toUpperCase() + label.slice(1)} ${speed} km/h for ${time} hours. Distance?}`, answer: ans,
    options: opts(ans, [String(speed + time), String(speed * (time + 1)), String(speed * time + speed)], rng),
    category: 'Distance', latex: true,
    hint: `Distance = speed x time`,
    explanation: `${speed} km/h x ${time}h = ${ans} km`,
  };
}

function easyCookingFractions(rng: () => number): Problem {
  const fracs = [
    { num: 1, den: 2, label: '1/2' }, { num: 1, den: 3, label: '1/3' },
    { num: 1, den: 4, label: '1/4' }, { num: 3, den: 4, label: '3/4' },
    { num: 2, den: 3, label: '2/3' },
  ];
  const f = pick(fracs, rng);
  const mult = pick([2, 3] as const, rng);
  const resultNum = f.num * mult;
  const g = gcd(resultNum, f.den);
  const rN = resultNum / g;
  const rD = f.den / g;
  const ans = rD === 1 ? String(rN) : `${rN}/${rD}`;
  const label = mult === 2 ? 'double' : 'triple';
  return {
    question: `\\text{Recipe: ${f.label} cup. ${label[0]!.toUpperCase() + label.slice(1)} it?}`, answer: ans,
    options: opts(ans, [`${rN + 1}/${rD}`, `${f.num}/${f.den}`, `${rN}/${rD + 1}`], rng),
    category: 'Fractions', latex: true,
    hint: `Multiply ${f.label} by ${mult}`,
    explanation: `${f.label} x ${mult} = ${resultNum}/${f.den} = ${ans}`,
  };
}

function easyAreaRoom(rng: () => number): Problem {
  const w = Math.floor(rng() * 10) + 5;
  const h = Math.floor(rng() * 10) + 5;
  const ans = String(w * h);
  return {
    question: `\\text{Room is ${w}ft x ${h}ft. Area in sq ft?}`, answer: ans,
    options: opts(ans, [String(2 * (w + h)), String(w * h + w), String(w + h)], rng),
    category: 'Measurement', latex: true,
    hint: `Area = length x width`,
    explanation: `${w} x ${h} = ${ans} square feet`,
  };
}

function easyRounding(rng: () => number): Problem {
  const n = Math.floor(rng() * 900) + 100;
  const roundTo = pick([10, 100] as const, rng);
  const ans = String(Math.round(n / roundTo) * roundTo);
  return {
    question: `\\text{Round } ${n} \\text{ to nearest } ${roundTo}`, answer: ans,
    options: opts(ans, [
      String(Math.floor(n / roundTo) * roundTo),
      String(Math.ceil(n / roundTo) * roundTo),
      String(n + roundTo),
    ], rng),
    category: 'Estimation', latex: true,
    hint: `Look at the digit in the ${roundTo === 10 ? 'ones' : 'tens'} place: 5+ rounds up`,
    explanation: `Round ${n} to nearest ${roundTo}: ${roundTo === 10 ? 'ones' : 'tens'} digit determines direction = ${ans}`,
  };
}

function easyEstimate(rng: () => number): Problem {
  const a = Math.floor(rng() * 80) + 20;
  const b = Math.floor(rng() * 80) + 20;
  const exact = a * b;
  const rounded = Math.round(a / 10) * 10 * (Math.round(b / 10) * 10);
  const ans = String(exact);
  const off1 = exact + Math.floor(rng() * 400) + 200;
  const off2 = Math.max(10, exact - Math.floor(rng() * 400) - 200);
  const off3 = exact + Math.floor(rng() * 100) + 50;
  return {
    question: `\\text{Estimate: } ${a} \\times ${b} \\approx \\text{ ?}`, answer: ans,
    options: opts(ans, [String(off1), String(off2), String(off3)], rng),
    category: 'Estimation', latex: true,
    hint: `Round: ~${Math.round(a / 10) * 10} x ~${Math.round(b / 10) * 10} = ~${rounded}`,
    explanation: `${a} x ${b} = ${exact}. Estimation: ${Math.round(a / 10) * 10} x ${Math.round(b / 10) * 10} = ${rounded}`,
  };
}

function easyPattern(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const start = Math.floor(rng() * 10) + 2;
    const step = Math.floor(rng() * 8) + 3;
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const ans = String(start + 4 * step);
    return {
      question: `\\text{Next: } ${seq.join(', ')}, \\text{ ?}`, answer: ans,
      options: opts(ans, [String(+ans + step), String(+ans - 1), String(+ans + 2)], rng),
      category: 'Patterns', latex: true,
      hint: `Find the constant difference between terms`,
      explanation: `Pattern: +${step} each time. ${seq[3]} + ${step} = ${ans}`,
    };
  } else if (type === 1) {
    const start = Math.floor(rng() * 4) + 2;
    const seq = [start, start * 2, start * 4, start * 8];
    const ans = String(start * 16);
    return {
      question: `\\text{Next: } ${seq.join(', ')}, \\text{ ?}`, answer: ans,
      options: opts(ans, [String(start * 12), String(start * 20), String(start * 15)], rng),
      category: 'Patterns', latex: true,
      hint: `Each term is a multiple of the previous`,
      explanation: `Pattern: x2 each time. ${seq[3]} x 2 = ${ans}`,
    };
  } else {
    const start = Math.floor(rng() * 4) + 2;
    const seq = [start * start, (start + 1) ** 2, (start + 2) ** 2, (start + 3) ** 2];
    const ans = String((start + 4) ** 2);
    return {
      question: `\\text{Next: } ${seq.join(', ')}, \\text{ ?}`, answer: ans,
      options: opts(ans, [String(+ans + 2), String(+ans - 1), String((start + 5) ** 2)], rng),
      category: 'Patterns', latex: true,
      hint: `These are consecutive perfect squares`,
      explanation: `${start}^2, ${start + 1}^2, ... ${start + 4}^2 = ${ans}`,
    };
  }
}

function easyMentalMath(rng: () => number): Problem {
  const type = Math.floor(rng() * 4);
  if (type === 0) {
    // Near-doubles: e.g. 48 + 49
    const a = Math.floor(rng() * 40) + 20;
    const b = a + pick([-1, 1] as const, rng);
    const ans = String(a + b);
    return {
      question: `\\text{Quick: } ${a} + ${b} = ?`, answer: ans,
      options: opts(ans, [String(+ans + 2), String(+ans - 2), String(+ans + 1)], rng),
      category: 'Mental Math', latex: true,
      hint: `Double ${Math.min(a, b)} and adjust by 1`,
      explanation: `${Math.min(a, b)} x 2 = ${Math.min(a, b) * 2}, +1 = ${ans}`,
    };
  } else if (type === 1) {
    // Multiply by 11
    const n = Math.floor(rng() * 80) + 12;
    const ans = String(n * 11);
    return {
      question: `\\text{Fast: } ${n} \\times 11 = ?`, answer: ans,
      options: opts(ans, [String(n * 10 + n + 1), String(n * 12), String(n * 11 - n)], rng),
      category: 'Mental Math', latex: true,
      hint: `Multiply by 10, then add the number once more`,
      explanation: `${n} x 10 = ${n * 10}, + ${n} = ${ans}`,
    };
  } else if (type === 2) {
    // Squaring numbers near 50
    const n = 50 + pick([-3, -2, -1, 1, 2, 3] as const, rng);
    const ans = String(n * n);
    return {
      question: `${n}^2 = ?`, answer: ans,
      options: opts(ans, [String(n * n + n), String(n * n - n), String(2500)], rng),
      category: 'Mental Math', latex: true,
      hint: `(50 + d)^2 = 2500 + 100d + d^2`,
      explanation: `${n}^2 = ${ans}`,
    };
  } else {
    // Complement to 100
    const a = Math.floor(rng() * 70) + 15;
    const ans = String(100 - a);
    return {
      question: `\\text{What + } ${a} = 100?`, answer: ans,
      options: opts(ans, [String(+ans + 5), String(+ans - 3), String(a)], rng),
      category: 'Number Sense', latex: true,
      hint: `100 minus the number`,
      explanation: `100 - ${a} = ${ans}`,
    };
  }
}

function easyNumberSense(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    // Divisibility check
    const n = Math.floor(rng() * 200) + 100;
    const by = pick([3, 4, 6, 9] as const, rng);
    const isDivisible = n % by === 0;
    const ans = isDivisible ? 'Yes' : 'No';
    return {
      question: `\\text{Is } ${n} \\text{ divisible by } ${by}?`, answer: ans,
      options: shuffle(['Yes', 'No', 'Only if even', 'Need calculator'], rng),
      category: 'Number Sense', latex: true,
      hint: by === 3 || by === 9 ? `Sum the digits; check if divisible by ${by}` : `Check divisibility rule for ${by}`,
      explanation: `${n} / ${by} = ${(n / by).toFixed(2)}. ${isDivisible ? 'Yes, evenly divisible' : 'No, remainder exists'}`,
    };
  } else if (type === 1) {
    // Place value
    const n = Math.floor(rng() * 90000) + 10000;
    const place = pick(['thousands', 'hundreds', 'tens'] as const, rng);
    const digit = place === 'thousands' ? Math.floor(n / 1000) % 10 : place === 'hundreds' ? Math.floor(n / 100) % 10 : Math.floor(n / 10) % 10;
    const ans = String(digit);
    return {
      question: `\\text{Digit in ${place} place of } ${n.toLocaleString()}?`, answer: ans,
      options: opts(ans, [String((digit + 1) % 10), String((digit + 3) % 10), String((digit + 5) % 10)], rng),
      category: 'Number Sense', latex: true,
      hint: `Count place values from right: ones, tens, hundreds, thousands`,
      explanation: `${n}: the ${place} digit is ${ans}`,
    };
  } else {
    // Closest perfect square
    const n = Math.floor(rng() * 50) + 20;
    const root = Math.round(Math.sqrt(n));
    const ans = String(root * root);
    return {
      question: `\\text{Nearest perfect square to } ${n}?`, answer: ans,
      options: opts(ans, [String((root - 1) * (root - 1)), String((root + 1) * (root + 1)), String(n)], rng),
      category: 'Number Sense', latex: true,
      hint: `Try squares near sqrt(${n})`,
      explanation: `sqrt(${n}) ~ ${Math.sqrt(n).toFixed(1)}. Nearest square: ${root}^2 = ${ans}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MEDIUM GENERATORS — Applied Problem Solving ────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function medFinanceSimple(rng: () => number): Problem {
  const principal = pick([100, 200, 500, 1000] as const, rng);
  const rate = pick([2, 4, 5, 8, 10] as const, rng);
  const interest = principal * rate / 100;
  const total = principal + interest;
  const ans = String(total);
  return {
    question: `\\text{\\$${principal} at ${rate}\\% annual interest, 1 year. Total?}`, answer: ans,
    options: opts(ans, [String(principal), String(total + interest), String(total - 10)], rng),
    category: 'Finance', latex: true,
    hint: `Interest = principal x rate. Total = principal + interest`,
    explanation: `Interest: $${principal} x ${rate}% = $${interest}. Total: $${principal} + $${interest} = $${ans}`,
  };
}

function medWageCalc(rng: () => number): Problem {
  const rate = Math.floor(rng() * 20) + 12;
  const hours = pick([20, 25, 30, 35, 37.5, 40] as const, rng);
  const ans = String(rate * hours);
  return {
    question: `\\text{\\$${rate}/hr for ${hours} hrs/week. Weekly pay?}`, answer: ans,
    options: opts(ans, [String(rate + hours), String(rate * hours + rate), String(rate * (hours + 5))], rng),
    category: 'Finance', latex: true,
    hint: `Pay = hourly rate x hours worked`,
    explanation: `$${rate} x ${hours} = $${ans}`,
  };
}

function medBudgetPercent(rng: () => number): Problem {
  const salary = pick([2000, 2500, 3000, 4000, 5000] as const, rng);
  const expense = pick([500, 600, 750, 800, 1000, 1200, 1500] as const, rng);
  const pct = Math.round(expense / salary * 100);
  const ans = String(pct);
  return {
    question: `\\text{\\$${expense} rent on \\$${salary} salary. What \\%?}`, answer: ans,
    options: opts(ans, [String(pct + 5), String(pct - 5), String(Math.round(salary / expense))], rng),
    category: 'Finance', latex: true,
    hint: `Percentage = (part / whole) x 100`,
    explanation: `$${expense} / $${salary} x 100 = ${pct}%`,
  };
}

function medDistanceSpeed(rng: () => number): Problem {
  const type = Math.floor(rng() * 2);
  if (type === 0) {
    const dist = pick([120, 150, 180, 200, 240, 300, 360] as const, rng);
    const speed = pick([40, 50, 60, 80, 100, 120] as const, rng);
    const time = dist / speed;
    const ans = String(time);
    return {
      question: `\\text{${dist} km at ${speed} km/h. Hours?}`, answer: ans,
      options: opts(ans, [String(time + 1), String(dist + speed), String(speed / dist)], rng),
      category: 'Physics', latex: true,
      hint: `Time = distance / speed`,
      explanation: `${dist} / ${speed} = ${time} hours`,
    };
  } else {
    const speed = pick([50, 60, 80, 100] as const, rng);
    const time = pick([2, 2.5, 3, 4, 5] as const, rng);
    const ans = String(speed * time);
    return {
      question: `\\text{Drive ${speed} km/h for ${time} hrs. Distance?}`, answer: ans,
      options: opts(ans, [String(speed + time), String(speed * (time + 1)), String(speed * time + 50)], rng),
      category: 'Physics', latex: true,
      hint: `Distance = speed x time`,
      explanation: `${speed} x ${time} = ${ans} km`,
    };
  }
}

function medUnitConvert(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const miles = Math.floor(rng() * 8) + 2;
    const km = miles * 1.6;
    const ans = String(km);
    return {
      question: `\\text{${miles} miles in km? (1 mi} \\approx \\text{1.6 km)}`, answer: ans,
      options: opts(ans, [String(km + 1.6), String(miles), String(km / 2)], rng),
      category: 'Unit Conversion', latex: true,
      hint: `Multiply miles by 1.6`,
      explanation: `${miles} x 1.6 = ${ans} km`,
    };
  } else if (type === 1) {
    const kmh = pick([36, 54, 72, 90, 108] as const, rng);
    const ms = kmh / 3.6;
    const ans = String(ms);
    return {
      question: `\\text{${kmh} km/h = ? m/s}`, answer: ans,
      options: opts(ans, [String(ms + 5), String(kmh), String(ms * 2)], rng),
      category: 'Unit Conversion', latex: true,
      hint: `Divide by 3.6 to convert km/h to m/s`,
      explanation: `${kmh} / 3.6 = ${ans} m/s`,
    };
  } else {
    const tempC = pick([0, 20, 25, 30, 37, 100] as const, rng);
    const tempF = tempC * 9 / 5 + 32;
    const ans = String(tempF);
    return {
      question: `\\text{${tempC}}^{\\circ}\\text{C in Fahrenheit?}`, answer: ans,
      options: opts(ans, [String(tempF + 10), String(tempC), String(tempF - 10)], rng),
      category: 'Unit Conversion', latex: true,
      hint: `F = C x 9/5 + 32`,
      explanation: `${tempC} x 9/5 + 32 = ${tempC * 9 / 5} + 32 = ${ans} F`,
    };
  }
}

function medGeometryApplied(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const r = Math.floor(rng() * 8) + 3;
    const area = Math.round(Math.PI * r * r * 10) / 10;
    const ans = String(area);
    return {
      question: `\\text{Circle r=${r}m. Area? (use } \\pi \\approx 3.14 \\text{)}`, answer: ans,
      options: opts(ans, [String(Math.round(2 * Math.PI * r * 10) / 10), String(r * r), String(area + r)], rng),
      category: 'Geometry', latex: true,
      hint: `Area = pi x r^2`,
      explanation: `pi x ${r}^2 = 3.14 x ${r * r} = ${ans} m^2`,
    };
  } else if (type === 1) {
    const w = Math.floor(rng() * 15) + 5;
    const h = Math.floor(rng() * 15) + 5;
    const fence = 2 * (w + h);
    const ans = String(fence);
    return {
      question: `\\text{Fence a ${w}m x ${h}m yard. How much fencing?}`, answer: ans,
      options: opts(ans, [String(w * h), String(w + h), String(fence + w)], rng),
      category: 'Geometry', latex: true,
      hint: `Perimeter = 2(length + width)`,
      explanation: `2 x (${w} + ${h}) = 2 x ${w + h} = ${ans} m`,
    };
  } else {
    const base = (Math.floor(rng() * 8) + 3) * 2;
    const height = Math.floor(rng() * 10) + 4;
    const ans = String(base * height / 2);
    return {
      question: `\\text{Triangle: base=${base}m, height=${height}m. Area?}`, answer: ans,
      options: opts(ans, [String(base * height), String(base + height), String(base * height / 3)], rng),
      category: 'Geometry', latex: true,
      hint: `Area of triangle = (base x height) / 2`,
      explanation: `(${base} x ${height}) / 2 = ${base * height} / 2 = ${ans} m^2`,
    };
  }
}

function medPythagoras(rng: () => number): Problem {
  const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15]];
  const t = pick(triples, rng);
  const [a, b, c] = t;
  const ans = String(c);
  return {
    question: `\\text{Right triangle: legs ${a} and ${b}. Hypotenuse?}`, answer: ans,
    options: opts(ans, [String(a! + b!), String(c! + 1), String(c! - 1)], rng),
    category: 'Geometry', latex: true,
    hint: `a^2 + b^2 = c^2. Compute ${a}^2 + ${b}^2`,
    explanation: `${a}^2 + ${b}^2 = ${a! * a!} + ${b! * b!} = ${a! * a! + b! * b!}. sqrt = ${c}`,
  };
}

function medStatistics(rng: () => number): Problem {
  const count = Math.floor(rng() * 3) + 4;
  const avg = Math.floor(rng() * 30) + 15;
  const nums: number[] = [];
  let sum = 0;
  for (let i = 0; i < count - 1; i++) {
    const n = avg + Math.floor(rng() * 10) - 5;
    nums.push(n); sum += n;
  }
  nums.push(avg * count - sum);
  const shuffled = shuffle(nums, rng);
  const ans = String(avg);
  return {
    question: `\\text{Mean of } ${shuffled.join(', ')} = ?`, answer: ans,
    options: opts(ans, [String(avg + 2), String(avg - 1), String(avg + 5)], rng),
    category: 'Statistics', latex: true,
    hint: `Sum all values, divide by count (${count})`,
    explanation: `Sum = ${shuffled.reduce((a, b) => a + b, 0)}. Mean = ${shuffled.reduce((a, b) => a + b, 0)} / ${count} = ${ans}`,
  };
}

function medSolveForX(rng: () => number): Problem {
  const x = Math.floor(rng() * 15) + 2;
  const a = Math.floor(rng() * 8) + 2;
  const b = Math.floor(rng() * 20) + 1;
  const result = a * x + b;
  const ans = String(x);
  return {
    question: `${a}x + ${b} = ${result}, \\quad x = ?`, answer: ans,
    options: opts(ans, [String(x + 1), String(x - 1), String(x + 3)], rng),
    category: 'Algebra', latex: true,
    hint: `Subtract ${b}, then divide by ${a}`,
    explanation: `${a}x = ${result} - ${b} = ${result - b}. x = ${result - b} / ${a} = ${ans}`,
  };
}

function medRatio(rng: () => number): Problem {
  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 5) + 1;
  const total = (a + b) * (Math.floor(rng() * 6) + 2);
  const partA = (total / (a + b)) * a;
  const larger = Math.max(partA, total - partA);
  const smaller = Math.min(partA, total - partA);
  return {
    question: `\\text{Divide } ${total} \\text{ in ratio } ${a}:${b}. \\text{ Larger part?}`,
    answer: String(larger),
    options: opts(String(larger), [String(smaller), String(total), String(larger + a)], rng),
    category: 'Ratios', latex: true,
    hint: `Total parts = ${a + b}. Each part = ${total / (a + b)}`,
    explanation: `${a + b} parts. Each = ${total / (a + b)}. Larger = ${Math.max(a, b)} x ${total / (a + b)} = ${larger}`,
  };
}

function medPemdas(rng: () => number): Problem {
  const a = Math.floor(rng() * 15) + 3;
  const b = Math.floor(rng() * 8) + 2;
  const c = Math.floor(rng() * 8) + 2;
  const d = Math.floor(rng() * 8) + 1;
  const ans = String((a + b) * c - d);
  return {
    question: `(${a} + ${b}) \\times ${c} - ${d} = ?`, answer: ans,
    options: opts(ans, [String(a + b * c - d), String((a + b) * (c - d)), String(a * b + c * d)], rng),
    category: 'Order of Ops', latex: true,
    hint: `Parentheses first, then multiply, then subtract`,
    explanation: `(${a}+${b}) = ${a + b}. x${c} = ${(a + b) * c}. -${d} = ${ans}`,
  };
}

function medFractionOps(rng: () => number): Problem {
  const d = pick([2, 3, 4, 5, 6, 8] as const, rng);
  const n1 = Math.floor(rng() * (d - 1)) + 1;
  const n2 = Math.floor(rng() * (d - 1)) + 1;
  const sumN = n1 + n2;
  const g = gcd(sumN, d);
  const rN = sumN / g;
  const rD = d / g;
  const ans = rD === 1 ? String(rN) : `${rN}/${rD}`;
  return {
    question: `\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}} = ?`, answer: ans,
    options: shuffle([ans, `${rN + 1}/${rD}`, `${rN}/${rD + 1}`, `${Math.max(1, rN - 1)}/${rD}`], rng),
    category: 'Fractions', latex: false,
    hint: `Same denominator: add numerators`,
    explanation: `${n1}/${d} + ${n2}/${d} = ${sumN}/${d} = ${ans}`,
  };
}

function medWordProblem(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const rate = Math.floor(rng() * 30) + 15;
    const hours = Math.floor(rng() * 4) + 3;
    const materials = Math.floor(rng() * 50) + 20;
    const total = rate * hours + materials;
    const ans = String(total);
    return {
      question: `\\text{Plumber: \\$${rate}/hr x ${hours}hrs + \\$${materials} parts. Total?}`,
      answer: ans,
      options: opts(ans, [String(rate * hours), String(materials), String(total + rate)], rng),
      category: 'Word Problems', latex: true,
      hint: `Total = (rate x hours) + materials`,
      explanation: `$${rate} x ${hours} + $${materials} = $${rate * hours} + $${materials} = $${ans}`,
    };
  } else if (type === 1) {
    const mpg = pick([25, 30, 35, 40] as const, rng);
    const gallons = Math.floor(rng() * 10) + 5;
    const ans = String(mpg * gallons);
    return {
      question: `\\text{Car gets ${mpg} mpg, ${gallons} gallon tank. Range?}`,
      answer: ans,
      options: opts(ans, [String(mpg + gallons), String(mpg * (gallons + 5)), String(mpg * gallons + mpg)], rng),
      category: 'Word Problems', latex: true,
      hint: `Range = miles per gallon x gallons`,
      explanation: `${mpg} mpg x ${gallons} gal = ${ans} miles`,
    };
  } else {
    const people = Math.floor(rng() * 8) + 3;
    const slicesPerPizza = 8;
    const slicesPerPerson = Math.floor(rng() * 2) + 2;
    const totalSlices = people * slicesPerPerson;
    const pizzas = Math.ceil(totalSlices / slicesPerPizza);
    const ans = String(pizzas);
    return {
      question: `\\text{${people} people, ${slicesPerPerson} slices each. Pizzas needed (8 slices/pizza)?}`,
      answer: ans,
      options: opts(ans, [String(pizzas + 1), String(pizzas - 1), String(totalSlices)], rng),
      category: 'Word Problems', latex: true,
      hint: `Total slices = ${people} x ${slicesPerPerson} = ${totalSlices}. Divide by 8, round up`,
      explanation: `${totalSlices} slices / 8 = ${totalSlices / 8}. Round up: ${ans} pizzas`,
    };
  }
}

function medDataInterpret(rng: () => number): Problem {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = Array.from({ length: 6 }, () => Math.floor(rng() * 40) + 20);
  const maxVal = Math.max(...values);
  const maxMonth = months[values.indexOf(maxVal)]!;
  const ans = maxMonth;
  return {
    question: `\\text{Sales: ${months.map((m, i) => `${m}=${values[i]}`).join(', ')}. Best month?}`,
    answer: ans,
    options: shuffle([maxMonth, months[Math.floor(rng() * 6)]!, months[Math.floor(rng() * 6)]!, months[(values.indexOf(maxVal) + 3) % 6]!].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).concat([maxMonth]).slice(0, 4), rng),
    category: 'Data Interpretation', latex: true,
    hint: `Compare all values to find the largest`,
    explanation: `${maxMonth} had the highest sales at ${maxVal}`,
  };
}

function medPercentComparison(rng: () => number): Problem {
  const total = pick([200, 250, 400, 500, 800, 1000] as const, rng);
  const part = Math.floor(rng() * (total * 0.6)) + Math.floor(total * 0.1);
  const pct = Math.round(part / total * 100);
  const ans = String(pct);
  return {
    question: `\\text{${part} out of ${total}. What percent?}`, answer: ans + '%',
    options: opts(ans + '%', [String(pct + 5) + '%', String(pct - 3) + '%', String(Math.round(total / part)) + '%'], rng),
    category: 'Percentages', latex: true,
    hint: `(part / whole) x 100`,
    explanation: `${part} / ${total} x 100 = ${ans}%`,
  };
}

function medLogicReasoning(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    // Age problem
    const age = Math.floor(rng() * 20) + 10;
    const yearsAgo = Math.floor(rng() * 5) + 3;
    const ans = String(age);
    return {
      question: `\\text{In ${yearsAgo} years I'll be ${age + yearsAgo}. How old am I?}`, answer: ans,
      options: opts(ans, [String(age + yearsAgo), String(age - yearsAgo), String(age + 1)], rng),
      category: 'Logic', latex: true,
      hint: `Subtract ${yearsAgo} from the future age`,
      explanation: `${age + yearsAgo} - ${yearsAgo} = ${ans} years old`,
    };
  } else if (type === 1) {
    // Profit/loss
    const cost = (Math.floor(rng() * 15) + 5) * 10;
    const sell = cost + pick([-20, -10, 10, 15, 20, 25, 30, 50] as const, rng);
    const profit = sell - cost;
    const ans = String(profit);
    return {
      question: `\\text{Buy at \\$${cost}, sell at \\$${sell}. Profit/loss?}`, answer: '$' + ans,
      options: opts('$' + ans, ['$' + String(profit + 10), '$' + String(cost), '$' + String(sell)], rng),
      category: 'Logic', latex: true,
      hint: `Profit = selling price - cost price`,
      explanation: `$${sell} - $${cost} = $${profit} ${profit >= 0 ? 'profit' : 'loss'}`,
    };
  } else {
    // Work rate
    const rateA = Math.floor(rng() * 4) + 2;
    const rateB = Math.floor(rng() * 4) + 2;
    const hours = Math.floor(rng() * 3) + 2;
    const total = (rateA + rateB) * hours;
    const ans = String(total);
    return {
      question: `\\text{A does ${rateA}/hr, B does ${rateB}/hr. Together in ${hours} hrs?}`, answer: ans,
      options: opts(ans, [String(rateA * hours), String(rateB * hours), String(total + rateA)], rng),
      category: 'Logic', latex: true,
      hint: `Combined rate x time`,
      explanation: `(${rateA} + ${rateB}) x ${hours} = ${rateA + rateB} x ${hours} = ${ans}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HARD GENERATORS — Advanced Applied Mathematics ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function hardCompoundInterest(rng: () => number): Problem {
  const principal = pick([500, 1000, 2000] as const, rng);
  const rate = pick([5, 8, 10] as const, rng);
  const years = pick([2, 3] as const, rng);
  let total = principal;
  for (let i = 0; i < years; i++) total = Math.round(total * (1 + rate / 100) * 100) / 100;
  const ans = String(total);
  return {
    question: `\\text{\\$${principal} at ${rate}\\% compound, ${years} yrs. Total?}`, answer: ans,
    options: opts(ans, [String(principal + principal * rate / 100 * years), String(total + principal * rate / 100), String(principal)], rng),
    category: 'Finance', latex: true,
    hint: `Compound: multiply by ${1 + rate / 100} each year, ${years} times`,
    explanation: `$${principal} x (1.${String(rate).padStart(2, '0')})^${years} = $${ans}`,
  };
}

function hardPercentChange(rng: () => number): Problem {
  const type = Math.floor(rng() * 2);
  if (type === 0) {
    const drop = pick([10, 20, 25, 30, 40, 50] as const, rng);
    const rise = Math.round(drop / (100 - drop) * 10000) / 100;
    const ans = String(rise);
    return {
      question: `\\text{Price drops ${drop}\\%. Rise needed to restore?}`, answer: ans + '%',
      options: opts(ans + '%', [drop + '%', String(rise + 5) + '%', String(drop + 10) + '%'], rng),
      category: 'Finance', latex: true,
      hint: `If 100 drops to ${100 - drop}, what % of ${100 - drop} = ${drop}?`,
      explanation: `100 drops ${drop}% to ${100 - drop}. Need ${drop}/${100 - drop} x 100 = ${ans}% rise`,
    };
  } else {
    const old = pick([40, 50, 60, 80, 100, 120, 200] as const, rng);
    const newVal = old + pick([10, 15, 20, 25, 30, 40] as const, rng);
    const pctChange = Math.round((newVal - old) / old * 100);
    const ans = String(pctChange);
    return {
      question: `\\text{Price: \\$${old} to \\$${newVal}. Percent increase?}`, answer: ans + '%',
      options: opts(ans + '%', [String(pctChange + 5) + '%', String(newVal - old) + '%', String(Math.round(old / newVal * 100)) + '%'], rng),
      category: 'Finance', latex: true,
      hint: `% change = (new - old) / old x 100`,
      explanation: `($${newVal} - $${old}) / $${old} x 100 = ${newVal - old}/${old} x 100 = ${ans}%`,
    };
  }
}

function hardPhysics(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const mass = Math.floor(rng() * 20) + 5;
    const accel = Math.floor(rng() * 8) + 2;
    const force = mass * accel;
    const ans = String(force);
    return {
      question: `\\text{F=ma. Mass=${mass}kg, a=${accel} m/s}^2\\text{. Force in N?}`, answer: ans,
      options: opts(ans, [String(mass + accel), String(force + mass), String(force - accel)], rng),
      category: 'Physics', latex: true,
      hint: `Force = mass x acceleration`,
      explanation: `F = ${mass} x ${accel} = ${ans} Newtons`,
    };
  } else if (type === 1) {
    const a = pick([2, 3, 5, 10] as const, rng);
    const t = Math.floor(rng() * 6) + 3;
    const d = Math.round(0.5 * a * t * t);
    const ans = String(d);
    return {
      question: `\\text{From rest, accel ${a} m/s}^2\\text{ for ${t}s. Distance?}`, answer: ans,
      options: opts(ans, [String(a * t), String(d + a), String(d * 2)], rng),
      category: 'Physics', latex: true,
      hint: `d = 1/2 x a x t^2 (starting from rest)`,
      explanation: `d = 0.5 x ${a} x ${t}^2 = 0.5 x ${a} x ${t * t} = ${ans} m`,
    };
  } else {
    const m = pick([2, 5, 10, 20, 50] as const, rng);
    const g = 10;
    const h = Math.floor(rng() * 15) + 5;
    const pe = m * g * h;
    const ans = String(pe);
    return {
      question: `\\text{PE=mgh. m=${m}kg, h=${h}m, g=10. Energy in J?}`, answer: ans,
      options: opts(ans, [String(m * h), String(pe + m), String(pe / 2)], rng),
      category: 'Physics', latex: true,
      hint: `Potential energy = mass x gravity x height`,
      explanation: `PE = ${m} x 10 x ${h} = ${ans} J`,
    };
  }
}

function hardAlgebraApplied(rng: () => number): Problem {
  const type = Math.floor(rng() * 2);
  if (type === 0) {
    const r1 = Math.floor(rng() * 8) + 1;
    const r2 = Math.floor(rng() * 8) + 1;
    const b = -(r1 + r2);
    const c = r1 * r2;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const ans = String(r1 + r2);
    return {
      question: `x^2 ${bStr}x ${cStr} = 0. \\quad x_1 + x_2 = ?`, answer: ans,
      options: opts(ans, [String(r1 * r2), String(r1 + r2 + 1), String(Math.abs(b) + 1)], rng),
      category: 'Algebra', latex: true,
      hint: `Vieta's formulas: sum of roots = -b/a`,
      explanation: `Roots: ${r1} and ${r2}. Sum = ${r1} + ${r2} = ${ans}`,
    };
  } else {
    const base = Math.floor(rng() * 5) + 3;
    const monthly = Math.floor(rng() * 15) + 5;
    const months = Math.floor(rng() * 8) + 4;
    const total = base + monthly * months;
    const ans = String(months);
    return {
      question: `\\text{Plan: \\$${base} + \\$${monthly}/mo. ${months} months = \\$${total}. Months?}`, answer: ans,
      options: opts(ans, [String(months + 1), String(months - 1), String(total / monthly)], rng),
      category: 'Algebra', latex: true,
      hint: `${base} + ${monthly}x = ${total}. Solve for x.`,
      explanation: `${monthly}x = ${total} - ${base} = ${total - base}. x = ${total - base}/${monthly} = ${ans}`,
    };
  }
}

function hardProbability(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const target = Math.floor(rng() * 7) + 4;
    let ways = 0;
    for (let i = 1; i <= 6; i++) { if (target - i >= 1 && target - i <= 6) ways++; }
    const ans = String(ways);
    return {
      question: `\\text{Two dice: ways to sum } ${target}?`, answer: ans,
      options: opts(ans, [String(ways + 1), String(ways - 1), String(ways + 2)], rng),
      category: 'Probability', latex: true,
      hint: `List pairs (a,b) where a+b = ${target}, 1 <= a,b <= 6`,
      explanation: `Pairs summing to ${target}: ${ways} ways out of 36`,
    };
  } else if (type === 1) {
    const n = Math.floor(rng() * 6) + 4;
    const comb = (n * (n - 1)) / 2;
    const ans = String(comb);
    return {
      question: `\\text{Choose 2 from ${n} people. Combinations?}`, answer: ans,
      options: opts(ans, [String(n * (n - 1)), String(n * 2), String(comb + n)], rng),
      category: 'Combinatorics', latex: true,
      hint: `C(n,2) = n(n-1)/2`,
      explanation: `C(${n},2) = ${n} x ${n - 1} / 2 = ${ans}`,
    };
  } else {
    const n = Math.floor(rng() * 4) + 3;
    let fact = 1;
    for (let i = 2; i <= n; i++) fact *= i;
    const ans = String(fact);
    return {
      question: `\\text{Arrange ${n} books on shelf. How many ways?}`, answer: ans,
      options: opts(ans, [String(fact + n), String(n * n), String(fact * 2)], rng),
      category: 'Combinatorics', latex: true,
      hint: `Arrangements of n items = n!`,
      explanation: `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' x ')} = ${ans}`,
    };
  }
}

function hardGeometryAdvanced(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const r = Math.floor(rng() * 6) + 3;
    const vol = Math.round(4 / 3 * Math.PI * r * r * r * 10) / 10;
    const ans = String(vol);
    return {
      question: `\\text{Sphere r=${r}. Volume? (} V = \\frac{4}{3}\\pi r^3 \\text{)}`, answer: ans,
      options: opts(ans, [String(Math.round(Math.PI * r * r * 10) / 10), String(r * r * r), String(vol + r)], rng),
      category: 'Geometry', latex: true,
      hint: `V = 4/3 x pi x ${r}^3 = 4/3 x pi x ${r * r * r}`,
      explanation: `V = (4/3) x 3.14 x ${r * r * r} = ${ans}`,
    };
  } else if (type === 1) {
    const r = Math.floor(rng() * 8) + 4;
    const h = Math.floor(rng() * 12) + 5;
    const vol = Math.round(Math.PI * r * r * h * 10) / 10;
    const ans = String(vol);
    return {
      question: `\\text{Cylinder r=${r}, h=${h}. Volume?}`, answer: ans,
      options: opts(ans, [String(Math.round(2 * Math.PI * r * h * 10) / 10), String(r * r * h), String(vol + r)], rng),
      category: 'Geometry', latex: true,
      hint: `V = pi x r^2 x h`,
      explanation: `V = pi x ${r}^2 x ${h} = 3.14 x ${r * r} x ${h} = ${ans}`,
    };
  } else {
    const n = Math.floor(rng() * 20) + 5;
    const sq = n * n;
    const ans = String(n);
    return {
      question: `\\sqrt{${sq}} = ?`, answer: ans,
      options: opts(ans, [String(n + 1), String(n - 1), String(n + 2)], rng),
      category: 'Roots', latex: true,
      hint: `What number times itself = ${sq}?`,
      explanation: `${n} x ${n} = ${sq}, so sqrt(${sq}) = ${ans}`,
    };
  }
}

function hardDataAnalysis(rng: () => number): Problem {
  const type = Math.floor(rng() * 2);
  if (type === 0) {
    const data = Array.from({ length: 7 }, () => Math.floor(rng() * 30) + 10).sort((a, b) => a - b);
    const q1 = data[1]!;
    const q3 = data[5]!;
    const iqr = q3 - q1;
    const ans = String(iqr);
    return {
      question: `\\text{Data: ${data.join(', ')}. IQR?}`, answer: ans,
      options: opts(ans, [String(data[6]! - data[0]!), String(q3), String(q1)], rng),
      category: 'Statistics', latex: true,
      hint: `IQR = Q3 - Q1. Q1 = 2nd value, Q3 = 6th value in sorted data`,
      explanation: `Q1=${q1}, Q3=${q3}. IQR = ${q3} - ${q1} = ${ans}`,
    };
  } else {
    const data = Array.from({ length: 5 }, () => Math.floor(rng() * 40) + 10).sort((a, b) => a - b);
    const median = data[2]!;
    const ans = String(median);
    return {
      question: `\\text{Median of } ${shuffle(data, rng).join(', ')} = ?`, answer: ans,
      options: opts(ans, [String(Math.round(data.reduce((a, b) => a + b, 0) / 5)), String(median + 1), String(data[0])], rng),
      category: 'Statistics', latex: true,
      hint: `Sort the values, pick the middle one`,
      explanation: `Sorted: ${data.join(', ')}. Middle value = ${ans}`,
    };
  }
}

function hardExponents(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const base = Math.floor(rng() * 3) + 2;
    const m = Math.floor(rng() * 3) + 2;
    const n = Math.floor(rng() * 3) + 1;
    const ans = String(Math.pow(base, m + n));
    return {
      question: `${base}^{${m}} \\times ${base}^{${n}} = ?`, answer: ans,
      options: opts(ans, [String(Math.pow(base, m * n)), String(Math.pow(base, m) + Math.pow(base, n)), String(+ans + base)], rng),
      category: 'Exponent Rules', latex: true,
      hint: `a^m x a^n = a^(m+n)`,
      explanation: `${base}^${m + n} = ${ans}`,
    };
  } else if (type === 1) {
    const exp = Math.floor(rng() * 6) + 5;
    const ans = String(Math.pow(2, exp));
    return {
      question: `2^{${exp}} = ?`, answer: ans,
      options: opts(ans, [String(+ans * 2), String(+ans / 2), String(+ans + 2)], rng),
      category: 'Powers of 2', latex: true,
      hint: `Double from 2^${exp - 1} = ${Math.pow(2, exp - 1)}`,
      explanation: `2^${exp} = ${ans}`,
    };
  } else {
    const base = pick([2, 3, 10] as const, rng);
    const exp = base === 10 ? Math.floor(rng() * 4) + 1 : base === 3 ? Math.floor(rng() * 4) + 2 : Math.floor(rng() * 7) + 2;
    const val = Math.pow(base, exp);
    const ans = String(exp);
    return {
      question: `\\log_{${base}}(${val}) = ?`, answer: ans,
      options: opts(ans, [String(exp + 1), String(exp - 1), String(base)], rng),
      category: 'Logarithms', latex: true,
      hint: `${base} to what power = ${val}?`,
      explanation: `${base}^${exp} = ${val}, so log_${base}(${val}) = ${ans}`,
    };
  }
}

function hardScientific(rng: () => number): Problem {
  const contexts = [
    { label: 'Speed of light', coeff: 3, exp: 8, unit: 'm/s' },
    { label: 'Earth-Sun distance', coeff: 1.5, exp: 8, unit: 'km' },
    { label: 'World population', coeff: 8, exp: 9, unit: 'people' },
    { label: 'Atom diameter', coeff: 1, exp: -10, unit: 'm' },
    { label: 'US national debt', coeff: 3.5, exp: 13, unit: 'dollars' },
  ];
  const ctx = pick(contexts, rng);
  const ans = String(ctx.coeff) + ' x 10^' + ctx.exp;
  return {
    question: `\\text{${ctx.label}: } ${ctx.coeff} \\times 10^{${ctx.exp}} \\text{ ${ctx.unit}. In standard form?}`,
    answer: ans,
    options: shuffle([
      ans,
      `${ctx.coeff} x 10^${ctx.exp + 1}`,
      `${ctx.coeff * 10} x 10^${ctx.exp - 1}`,
      `${ctx.coeff} x 10^${ctx.exp - 2}`,
    ], rng),
    category: 'Scientific Notation', latex: false,
    hint: `Scientific notation: coefficient x 10^power`,
    explanation: `${ctx.coeff} x 10^${ctx.exp} is already in standard scientific notation`,
  };
}

function hardNegatives(rng: () => number): Problem {
  const a = -(Math.floor(rng() * 12) + 3);
  const b = rng() < 0.5 ? -(Math.floor(rng() * 10) + 2) : Math.floor(rng() * 12) + 3;
  const ans = String(a * b);
  const sign = (a < 0 && b < 0) ? 'positive' : 'negative';
  return {
    question: `(${a}) \\times (${b}) = ?`, answer: ans,
    options: opts(ans, [String(-a * b), String(a + b), String(Math.abs(a * b) + 1)], rng),
    category: 'Negative Numbers', latex: true,
    hint: `Neg x ${b < 0 ? 'Neg = Pos' : 'Pos = Neg'}`,
    explanation: `(${a}) x (${b}) = ${ans}. Result is ${sign}.`,
  };
}

function hardLogicPuzzle(rng: () => number): Problem {
  const type = Math.floor(rng() * 4);
  if (type === 0) {
    // Consecutive integers
    const n = Math.floor(rng() * 15) + 8;
    const sum = n + (n + 1) + (n + 2);
    const ans = String(n);
    return {
      question: `\\text{3 consecutive integers sum to } ${sum}\\text{. Smallest?}`, answer: ans,
      options: opts(ans, [String(n + 1), String(n - 1), String(n + 2)], rng),
      category: 'Logic', latex: true,
      hint: `If smallest = x, then x + (x+1) + (x+2) = ${sum}`,
      explanation: `3x + 3 = ${sum}. 3x = ${sum - 3}. x = ${ans}`,
    };
  } else if (type === 1) {
    // Mixture problem
    const priceA = pick([3, 4, 5, 6] as const, rng);
    const priceB = priceA + pick([2, 3, 4] as const, rng);
    const kgA = Math.floor(rng() * 4) + 2;
    const kgB = Math.floor(rng() * 4) + 2;
    const totalCost = priceA * kgA + priceB * kgB;
    const ans = String(totalCost);
    return {
      question: `\\text{${kgA}kg at \\$${priceA}/kg + ${kgB}kg at \\$${priceB}/kg. Total cost?}`, answer: '$' + ans,
      options: opts('$' + ans, ['$' + String(totalCost + priceA), '$' + String(totalCost - priceB), '$' + String((kgA + kgB) * priceA)], rng),
      category: 'Logic', latex: true,
      hint: `Total = (quantity1 x price1) + (quantity2 x price2)`,
      explanation: `${kgA} x $${priceA} + ${kgB} x $${priceB} = $${kgA * priceA} + $${kgB * priceB} = $${ans}`,
    };
  } else if (type === 2) {
    // Rate problem
    const rateA = Math.floor(rng() * 6) + 4;
    const rateB = Math.floor(rng() * 6) + 4;
    const combinedTime = Math.round(rateA * rateB / (rateA + rateB) * 10) / 10;
    const ans = String(combinedTime);
    return {
      question: `\\text{A finishes a job in ${rateA} hrs, B in ${rateB} hrs. Together?}`, answer: ans + ' hrs',
      options: opts(ans + ' hrs', [String(Math.round((rateA + rateB) / 2 * 10) / 10) + ' hrs', String(Math.min(rateA, rateB)) + ' hrs', String(rateA + rateB) + ' hrs'], rng),
      category: 'Logic', latex: true,
      hint: `1/A + 1/B = 1/T. T = (A x B)/(A + B)`,
      explanation: `T = (${rateA} x ${rateB}) / (${rateA} + ${rateB}) = ${rateA * rateB} / ${rateA + rateB} = ${ans} hrs`,
    };
  } else {
    // Break-even
    const fixedCost = pick([100, 200, 300, 500] as const, rng);
    const costPer = pick([5, 8, 10, 12] as const, rng);
    const pricePer = costPer + pick([3, 5, 8, 10] as const, rng);
    const breakEven = Math.ceil(fixedCost / (pricePer - costPer));
    const ans = String(breakEven);
    return {
      question: `\\text{Fixed cost \\$${fixedCost}. Make at \\$${costPer}, sell at \\$${pricePer}. Break-even units?}`, answer: ans,
      options: opts(ans, [String(breakEven + 2), String(Math.floor(fixedCost / pricePer)), String(breakEven - 1)], rng),
      category: 'Finance', latex: true,
      hint: `Break-even = fixed cost / (price - cost per unit)`,
      explanation: `$${fixedCost} / ($${pricePer} - $${costPer}) = $${fixedCost} / $${pricePer - costPer} = ${ans} units`,
    };
  }
}

function hardMentalMath(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    // Near-100 multiplication
    const a = 100 - Math.floor(rng() * 8) - 1;
    const b = 100 - Math.floor(rng() * 8) - 1;
    const ans = String(a * b);
    return {
      question: `${a} \\times ${b} = ?`, answer: ans,
      options: opts(ans, [String(+ans + 100), String(+ans - 50), String(a + b)], rng),
      category: 'Mental Math', latex: true,
      hint: `Both near 100: (100-${100 - a}) x (100-${100 - b})`,
      explanation: `${a} x ${b} = ${ans}. Shortcut: ${a + b - 100} * 100 + ${(100 - a) * (100 - b)} = ${(a + b - 100) * 100 + (100 - a) * (100 - b)}`,
    };
  } else if (type === 1) {
    // Percentage of percentage
    const pctA = pick([20, 25, 30, 40, 50] as const, rng);
    const pctB = pick([10, 20, 25, 50] as const, rng);
    const total = pick([200, 400, 500, 800, 1000] as const, rng);
    const result = Math.round(total * pctA / 100 * pctB / 100);
    const ans = String(result);
    return {
      question: `\\text{${pctB}\\% of ${pctA}\\% of ${total} = ?}`, answer: ans,
      options: opts(ans, [String(result + 10), String(total * pctA / 100), String(result * 2)], rng),
      category: 'Mental Math', latex: true,
      hint: `First find ${pctA}% of ${total}, then find ${pctB}% of that`,
      explanation: `${pctA}% of ${total} = ${total * pctA / 100}. ${pctB}% of ${total * pctA / 100} = ${ans}`,
    };
  } else {
    // Successive discounts
    const price = pick([100, 200, 250, 400, 500] as const, rng);
    const d1 = pick([10, 20, 25] as const, rng);
    const d2 = pick([10, 15, 20] as const, rng);
    const after1 = price * (100 - d1) / 100;
    const after2 = Math.round(after1 * (100 - d2) / 100);
    const ans = String(after2);
    return {
      question: `\\text{\\$${price} item, ${d1}\\% off then ${d2}\\% off. Final?}`, answer: '$' + ans,
      options: opts('$' + ans, ['$' + String(price * (100 - d1 - d2) / 100), '$' + String(after2 + 10), '$' + String(price - after2)], rng),
      category: 'Finance', latex: true,
      hint: `Apply discounts sequentially, not added together`,
      explanation: `$${price} x ${(100 - d1) / 100} = $${after1}. $${after1} x ${(100 - d2) / 100} = $${ans}`,
    };
  }
}

function hardRealWorld(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    // Fuel economy comparison
    const dist = pick([300, 400, 500, 600] as const, rng);
    const mpgA = pick([25, 30, 35] as const, rng);
    const mpgB = pick([40, 45, 50] as const, rng);
    const pricePerGal = pick([3, 4, 5] as const, rng);
    const costA = Math.round(dist / mpgA * pricePerGal);
    const costB = Math.round(dist / mpgB * pricePerGal);
    const savings = costA - costB;
    const ans = String(savings);
    return {
      question: `\\text{${dist}mi trip. Car A: ${mpgA}mpg, Car B: ${mpgB}mpg. Gas \\$${pricePerGal}/gal. Savings with B?}`,
      answer: '$' + ans,
      options: opts('$' + ans, ['$' + String(savings + 5), '$' + String(costA), '$' + String(costB)], rng),
      category: 'Word Problems', latex: true,
      hint: `Fuel cost = (distance/mpg) x price. Find difference.`,
      explanation: `A: ${dist}/${mpgA} x $${pricePerGal} = $${costA}. B: ${dist}/${mpgB} x $${pricePerGal} = $${costB}. Save $${ans}`,
    };
  } else if (type === 1) {
    // Mortgage-style payment
    const principal = pick([10000, 15000, 20000] as const, rng);
    const annualRate = pick([5, 6, 8, 10] as const, rng);
    const years = pick([1, 2] as const, rng);
    const interest = Math.round(principal * annualRate / 100 * years);
    const monthly = Math.round((principal + interest) / (years * 12));
    const ans = String(monthly);
    return {
      question: `\\text{Loan \\$${principal.toLocaleString()}, ${annualRate}\\% simple interest, ${years}yr. Monthly payment?}`,
      answer: '$' + ans,
      options: opts('$' + ans, ['$' + String(monthly + 50), '$' + String(Math.round(principal / (years * 12))), '$' + String(monthly - 30)], rng),
      category: 'Finance', latex: true,
      hint: `Total = principal + (principal x rate x time). Divide by total months.`,
      explanation: `Interest: $${principal} x ${annualRate}% x ${years} = $${interest}. Total: $${principal + interest}. Monthly: $${principal + interest}/${years * 12} = $${ans}`,
    };
  } else {
    // Unit pricing comparison
    const sizeA = pick([6, 8, 12] as const, rng);
    const priceA = Math.round(sizeA * (Math.floor(rng() * 3) + 2) * 0.8);
    const sizeB = pick([16, 20, 24] as const, rng);
    const priceB = Math.round(sizeB * (Math.floor(rng() * 3) + 2) * 0.65);
    const unitA = Math.round(priceA / sizeA * 100) / 100;
    const unitB = Math.round(priceB / sizeB * 100) / 100;
    const better = unitA < unitB ? 'A' : 'B';
    const ans = better;
    return {
      question: `\\text{Pack A: ${sizeA}oz for \\$${priceA}. Pack B: ${sizeB}oz for \\$${priceB}. Better deal?}`,
      answer: ans,
      options: shuffle(['A', 'B', 'Same price', 'Need more info'], rng),
      category: 'Logic', latex: true,
      hint: `Compare unit price: price / size for each`,
      explanation: `A: $${priceA}/${sizeA} = $${unitA}/oz. B: $${priceB}/${sizeB} = $${unitB}/oz. ${better} is cheaper per oz`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── WORD PROBLEM / LOGIC GENERATORS ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function medMultiStepWord(rng: () => number): Problem {
  const type = Math.floor(rng() * 4);
  if (type === 0) {
    // Profit & loss
    const buy = (Math.floor(rng() * 10) + 5) * 10;
    const sellPct = pick([10, 20, 25, 30] as const, rng);
    const sell = buy + buy * sellPct / 100;
    const ans = String(sell);
    return {
      question: `\\text{Buy at \\$${buy}, sell at ${sellPct}\\% profit. Sell price?}`, answer: '$' + ans,
      options: opts('$' + ans, ['$' + String(buy + sellPct), '$' + String(sell + 10), '$' + String(buy)], rng),
      category: 'Word Problems', latex: true,
      hint: `Profit = ${sellPct}% of cost. Add to cost.`,
      explanation: `${sellPct}% of $${buy} = $${buy * sellPct / 100}. Sell: $${buy} + $${buy * sellPct / 100} = $${ans}`,
    };
  } else if (type === 1) {
    // Age problem
    const childAge = Math.floor(rng() * 8) + 5;
    const parentMult = Math.floor(rng() * 2) + 3; // 3x or 4x
    const parentAge = childAge * parentMult;
    const sum = childAge + parentAge;
    const ans = String(parentAge);
    return {
      question: `\\text{Parent is ${parentMult}x child's age. Sum = ${sum}. Parent's age?}`, answer: ans,
      options: opts(ans, [String(childAge), String(parentAge + childAge), String(sum)], rng),
      category: 'Word Problems', latex: true,
      hint: `Let child = x, parent = ${parentMult}x. x + ${parentMult}x = ${sum}`,
      explanation: `${parentMult + 1}x = ${sum} → x = ${childAge}. Parent = ${parentMult} × ${childAge} = ${ans}`,
    };
  } else if (type === 2) {
    // Mixture cost
    const priceA = pick([3, 4, 5, 6] as const, rng);
    const priceB = priceA + pick([2, 3, 4] as const, rng);
    const kgA = Math.floor(rng() * 4) + 2;
    const kgB = Math.floor(rng() * 4) + 2;
    const totalCost = priceA * kgA + priceB * kgB;
    const ans = String(totalCost);
    return {
      question: `\\text{${kgA}kg at \\$${priceA}/kg + ${kgB}kg at \\$${priceB}/kg. Total?}`, answer: '$' + ans,
      options: opts('$' + ans, ['$' + String(totalCost + priceA), '$' + String(priceA * (kgA + kgB)), '$' + String(totalCost - kgA)], rng),
      category: 'Word Problems', latex: true,
      hint: `Total = (${kgA} × $${priceA}) + (${kgB} × $${priceB})`,
      explanation: `$${priceA * kgA} + $${priceB * kgB} = $${ans}`,
    };
  } else {
    // Work rate
    const hrsA = pick([2, 3, 4, 5, 6] as const, rng);
    const hrsB = pick([3, 4, 5, 6, 8] as const, rng);
    const combined = Math.round(hrsA * hrsB / (hrsA + hrsB) * 10) / 10;
    const ans = String(combined);
    return {
      question: `\\text{A paints in ${hrsA}h, B in ${hrsB}h. Together?}`, answer: ans + ' hrs',
      options: opts(ans + ' hrs', [String((hrsA + hrsB) / 2) + ' hrs', String(Math.min(hrsA, hrsB)) + ' hrs', String(combined + 1) + ' hrs'], rng),
      category: 'Logic', latex: true,
      hint: `Rate A = 1/${hrsA}, Rate B = 1/${hrsB}. Combined rate = sum.`,
      explanation: `1/${hrsA} + 1/${hrsB} = ${hrsA + hrsB}/${hrsA * hrsB}. Time = ${hrsA * hrsB}/${hrsA + hrsB} = ${ans} hrs`,
    };
  }
}

function hardAppliedLogic(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    // Meeting point
    const speedA = pick([40, 50, 60] as const, rng);
    const speedB = pick([50, 60, 80] as const, rng);
    const dist = (speedA + speedB) * pick([2, 3, 4] as const, rng);
    const time = dist / (speedA + speedB);
    const ans = String(time);
    return {
      question: `\\text{Two cars ${dist}km apart drive toward each other at ${speedA} and ${speedB} km/h. Meet in?}`,
      answer: ans + ' hrs',
      options: opts(ans + ' hrs', [String(time + 1) + ' hrs', String(dist / speedA) + ' hrs', String(time * 2) + ' hrs'], rng),
      category: 'Logic', latex: true,
      hint: `Combined speed = ${speedA} + ${speedB} = ${speedA + speedB} km/h`,
      explanation: `Time = ${dist} / (${speedA} + ${speedB}) = ${dist} / ${speedA + speedB} = ${ans} hrs`,
    };
  } else if (type === 1) {
    // Upstream / downstream
    const boatSpeed = pick([12, 15, 18, 20] as const, rng);
    const current = pick([2, 3, 4, 5] as const, rng);
    const dist = (boatSpeed + current) * pick([2, 3] as const, rng);
    const downstream = dist / (boatSpeed + current);
    const upstream = dist / (boatSpeed - current);
    const totalTime = Math.round((downstream + upstream) * 10) / 10;
    const ans = String(totalTime);
    return {
      question: `\\text{Boat: ${boatSpeed}km/h, current: ${current}km/h. Round trip ${dist}km each way. Total time?}`,
      answer: ans + ' hrs',
      options: opts(ans + ' hrs', [String(2 * dist / boatSpeed) + ' hrs', String(totalTime + 1) + ' hrs', String(downstream * 2) + ' hrs'], rng),
      category: 'Word Problems', latex: true,
      hint: `Downstream speed = ${boatSpeed + current}, upstream = ${boatSpeed - current}`,
      explanation: `Down: ${dist}/${boatSpeed + current} = ${downstream}h. Up: ${dist}/${boatSpeed - current} = ${upstream}h. Total: ${ans}h`,
    };
  } else {
    // Coin/bill denomination
    const numQuarters = Math.floor(rng() * 6) + 4;
    const numDimes = Math.floor(rng() * 8) + 3;
    const total = numQuarters * 25 + numDimes * 10;
    const totalDollars = (total / 100).toFixed(2);
    const ans = String(numQuarters + numDimes);
    return {
      question: `\\text{Only quarters and dimes totaling \\$${totalDollars}. ${numQuarters} quarters. How many coins total?}`,
      answer: ans,
      options: opts(ans, [String(+ans + 2), String(numDimes), String(+ans - 1)], rng),
      category: 'Logic', latex: true,
      hint: `${numQuarters} quarters = $${(numQuarters * 0.25).toFixed(2)}. Remainder in dimes.`,
      explanation: `${numQuarters} quarters = $${(numQuarters * 0.25).toFixed(2)}. Remaining $${(numDimes * 0.10).toFixed(2)} = ${numDimes} dimes. Total: ${ans} coins`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ALGEBRA SPRINT GENERATORS ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function easyLinearEq(rng: () => number): Problem {
  // ax + b = c
  const a = Math.floor(rng() * 5) + 2;
  const x = Math.floor(rng() * 10) + 1;
  const b = Math.floor(rng() * 8) + 1;
  const c = a * x + b;
  const ans = String(x);
  return {
    question: `${a}x + ${b} = ${c}. \\quad x = ?`, answer: ans,
    options: opts(ans, [String(x + 1), String(x - 1), String(Math.floor(c / a))], rng),
    category: 'Equations', latex: true,
    hint: `Subtract ${b} from both sides, then divide by ${a}`,
    explanation: `${a}x = ${c} - ${b} = ${c - b}. x = ${c - b}/${a} = ${ans}`,
  };
}

function easyInequalityBasic(rng: () => number): Problem {
  const a = Math.floor(rng() * 4) + 2;
  const b = Math.floor(rng() * 12) + 4;
  const symbol = rng() > 0.5 ? '>' : '<';
  const sols = Array.from({ length: 6 }, (_, i) => i + 1);
  const correct = symbol === '>'
    ? sols.filter(x => a * x > b)
    : sols.filter(x => a * x < b);
  const wrong = sols.filter(x => !correct.includes(x));
  if (correct.length === 0 || wrong.length === 0) {
    // Fallback: simple valid case
    const ans = `x ${symbol} ${Math.ceil(b / a)}`;
    return {
      question: `${a}x ${symbol} ${b}. \\quad \\text{Solve for } x.`, answer: ans,
      options: opts(ans, [`x ${symbol} ${Math.ceil(b / a) + 1}`, `x ${symbol === '>' ? '<' : '>'} ${Math.ceil(b / a)}`, `x = ${Math.ceil(b / a)}`], rng),
      category: 'Inequalities', latex: true,
      hint: `Divide both sides by ${a}`,
      explanation: `${a}x ${symbol} ${b} → x ${symbol} ${b}/${a} = ${(b / a).toFixed(2)}`,
    };
  }
  const testVal = correct[0]!;
  const ans = String(testVal);
  return {
    question: `${a}x ${symbol} ${b}. \\quad \\text{Which value satisfies it?}`, answer: ans,
    options: opts(ans, wrong.slice(0, 3).map(String), rng),
    category: 'Inequalities', latex: true,
    hint: `Substitute each option: is ${a} × value ${symbol} ${b}?`,
    explanation: `${a} × ${testVal} = ${a * testVal} ${symbol} ${b}. ✓`,
  };
}

function medAlgebraSystem(rng: () => number): Problem {
  // x + y = s, x - y = d  → x = (s+d)/2, y = (s-d)/2
  const x = Math.floor(rng() * 8) + 2;
  const y = Math.floor(rng() * 6) + 1;
  const s = x + y;
  const d = x - y;
  const ans = String(x);
  const dStr = d >= 0 ? `x - y = ${d}` : `x - y = ${d}`;
  return {
    question: `x + y = ${s}, \\quad ${dStr}. \\quad x = ?`, answer: ans,
    options: opts(ans, [String(x + 1), String(y), String(s)], rng),
    category: 'Algebra', latex: true,
    hint: `Add the two equations to eliminate y`,
    explanation: `Adding: 2x = ${s + d}. x = ${(s + d) / 2} = ${ans}`,
  };
}

function medQuadraticFactor(rng: () => number): Problem {
  const r1 = Math.floor(rng() * 6) + 1;
  const r2 = Math.floor(rng() * 6) + 1;
  const b = r1 + r2;
  const c = r1 * r2;
  // Ask for one of the roots or the product
  const askProduct = rng() > 0.5;
  if (askProduct) {
    const ans = String(c);
    return {
      question: `x^2 - ${b}x + ${c} = 0. \\quad x_1 \\cdot x_2 = ?`, answer: ans,
      options: opts(ans, [String(b), String(c + r1), String(c - 1)], rng),
      category: 'Quadratics', latex: true,
      hint: `By Vieta's: product of roots = c/a = ${c}/1`,
      explanation: `Roots: ${r1} and ${r2}. Product = ${r1} × ${r2} = ${ans}`,
    };
  } else {
    const ans = String(r1 + r2);
    return {
      question: `x^2 - ${b}x + ${c} = 0. \\quad x_1 + x_2 = ?`, answer: ans,
      options: opts(ans, [String(c), String(b + 1), String(b - 1)], rng),
      category: 'Quadratics', latex: true,
      hint: `By Vieta's: sum of roots = b/a = ${b}/1`,
      explanation: `Roots: ${r1} and ${r2}. Sum = ${r1} + ${r2} = ${ans}`,
    };
  }
}

function hardAlgebraSprint(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    // Absolute value equation: |ax + b| = c
    const a = Math.floor(rng() * 3) + 1;
    const b = Math.floor(rng() * 6) + 1;
    const c = Math.floor(rng() * 8) + 4;
    // |ax + b| = c → ax + b = c or ax + b = -c
    // x = (c - b)/a  or  x = (-c - b)/a
    const x1 = (c - b) / a;
    const x2 = (-c - b) / a;
    // Only use integer solutions
    if (Number.isInteger(x1) && Number.isInteger(x2)) {
      const larger = Math.max(x1, x2);
      const ans = String(larger);
      return {
        question: `|${a === 1 ? '' : a}x + ${b}| = ${c}. \\quad \\text{Larger solution?}`, answer: ans,
        options: opts(ans, [String(x2), String(x1 + 1), String(c / a)], rng),
        category: 'Equations', latex: true,
        hint: `Two cases: ${a}x + ${b} = ${c} and ${a}x + ${b} = -${c}`,
        explanation: `x = (${c}-${b})/${a} = ${x1} or x = (-${c}-${b})/${a} = ${x2}. Larger = ${ans}`,
      };
    }
    // fallback to simple quadratic
  }
  // Completing the square or discriminant
  const a2 = 1;
  const bCoef = (Math.floor(rng() * 6) + 2) * 2; // even so discriminant is nice
  const c2 = Math.floor(rng() * 8) + 1;
  const disc = bCoef * bCoef - 4 * a2 * c2;
  if (disc > 0 && Number.isInteger(Math.sqrt(disc))) {
    const sqrtD = Math.sqrt(disc);
    const x1 = (-bCoef + sqrtD) / 2;
    const x2 = (-bCoef - sqrtD) / 2;
    const ans = String(Math.max(x1, x2));
    return {
      question: `x^2 + ${bCoef}x + ${c2} = 0. \\quad \\text{Larger root?}`, answer: ans,
      options: opts(ans, [String(Math.min(x1, x2)), String(-bCoef), String(c2)], rng),
      category: 'Quadratics', latex: true,
      hint: `Discriminant = b²-4ac = ${disc}. Use quadratic formula.`,
      explanation: `x = (-${bCoef} ± √${disc}) / 2 = (-${bCoef} ± ${sqrtD}) / 2. Larger = ${ans}`,
    };
  }
  // Final fallback: function evaluation
  const k = Math.floor(rng() * 5) + 2;
  const m = Math.floor(rng() * 4) + 1;
  const xVal = Math.floor(rng() * 4) + 1;
  const result = k * xVal * xVal - m;
  const ans = String(result);
  return {
    question: `f(x) = ${k}x^2 - ${m}. \\quad f(${xVal}) = ?`, answer: ans,
    options: opts(ans, [String(result + k), String(k * xVal - m), String(result - 1)], rng),
    category: 'Algebra', latex: true,
    hint: `Substitute x = ${xVal} into the function`,
    explanation: `f(${xVal}) = ${k}(${xVal})² - ${m} = ${k * xVal * xVal} - ${m} = ${ans}`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NUMBER THEORY GENERATORS ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function easyDivisibility(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    const divisors = [2, 3, 4, 5, 6, 8, 9, 10];
    const d = pick(divisors, rng);
    const isDivisible = rng() > 0.45; // ~55% Yes, ~45% No for slight positivity bias
    let num: number;
    if (isDivisible) {
      const q = Math.floor(rng() * 20) + 2;
      num = d * q;
    } else {
      // Generate a number that is NOT divisible by d
      const base = (Math.floor(rng() * 20) + 2) * d;
      num = base + Math.floor(rng() * (d - 1)) + 1; // offset by 1..(d-1)
    }
    const ans = isDivisible ? 'Yes' : 'No';
    return {
      question: `\\text{Is ${num} divisible by ${d}?}`, answer: ans,
      options: ['Yes', 'No', 'Maybe', 'Not always'],
      category: 'Divisibility', latex: true,
      hint: `Find the remainder when ${num} is divided by ${d}`,
      explanation: isDivisible
        ? `${num} ÷ ${d} = ${num / d}. Remainder 0. Yes.`
        : `${num} ÷ ${d} = ${Math.floor(num / d)} remainder ${num % d}. Not divisible.`,
    };
  } else if (type === 1) {
    const n = Math.floor(rng() * 50) + 4;
    const factors: number[] = [];
    for (let i = 1; i <= n; i++) { if (n % i === 0) factors.push(i); }
    const ans = String(factors.length);
    return {
      question: `\\text{How many factors does ${n} have?}`, answer: ans,
      options: opts(ans, [String(+ans + 1), String(+ans - 1), String(+ans + 2)], rng),
      category: 'Number Theory', latex: true,
      hint: `Count pairs of factors: 1 × ${n}, 2 × ?, etc.`,
      explanation: `Factors of ${n}: ${factors.join(', ')}. Count = ${ans}`,
    };
  } else {
    const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25];
    const isPrime = rng() > 0.5;
    const num = isPrime ? pick(PRIMES, rng) : pick(composites, rng);
    const ans = isPrime ? 'Prime' : 'Composite';
    return {
      question: `\\text{Is ${num} prime or composite?}`, answer: ans,
      options: ['Prime', 'Composite', 'Neither', 'Both'],
      category: 'Primes', latex: true,
      hint: `A prime has exactly 2 factors: 1 and itself.`,
      explanation: isPrime ? `${num} is prime — divisible only by 1 and ${num}.` : `${num} = ${num > 1 ? [2,3,5,7].find(p => num % p === 0) ?? '...' : ''}  × ... It is composite.`,
    };
  }
}

function medNumberTheory(rng: () => number): Problem {
  const type = Math.floor(rng() * 4);
  if (type === 0) {
    // GCD
    const a = (Math.floor(rng() * 8) + 2) * (Math.floor(rng() * 4) + 2);
    const b = (Math.floor(rng() * 6) + 2) * (Math.floor(rng() * 4) + 2);
    const g = gcd(a, b);
    const ans = String(g);
    return {
      question: `\\gcd(${a},\\ ${b}) = ?`, answer: ans,
      options: opts(ans, [String(g * 2), String(Math.min(a, b)), String(g + 1)], rng),
      category: 'Number Theory', latex: true,
      hint: `Use the Euclidean algorithm: divide larger by smaller, repeat with remainder.`,
      explanation: `GCD(${a}, ${b}) = ${ans}. Both divisible by ${ans}.`,
    };
  } else if (type === 1) {
    // LCM
    const a = Math.floor(rng() * 8) + 3;
    const b = Math.floor(rng() * 8) + 3;
    const lcm = (a * b) / gcd(a, b);
    const ans = String(lcm);
    return {
      question: `\\text{lcm}(${a},\\ ${b}) = ?`, answer: ans,
      options: opts(ans, [String(a * b), String(lcm + a), String(lcm - gcd(a,b))], rng),
      category: 'Number Theory', latex: true,
      hint: `LCM = (a × b) / GCD(a, b)`,
      explanation: `GCD(${a},${b})=${gcd(a,b)}. LCM = ${a}×${b}/${gcd(a,b)} = ${ans}`,
    };
  } else if (type === 2) {
    // Modular arithmetic
    const a = Math.floor(rng() * 50) + 10;
    const m = Math.floor(rng() * 7) + 3;
    const r = a % m;
    const ans = String(r);
    return {
      question: `${a} \\bmod ${m} = ?`, answer: ans,
      options: opts(ans, [String((r + 1) % m), String(m - r), String(r + m)], rng),
      category: 'Number Theory', latex: true,
      hint: `Remainder when ${a} is divided by ${m}`,
      explanation: `${a} = ${Math.floor(a / m)} × ${m} + ${r}. Remainder = ${ans}`,
    };
  } else {
    // Sum of divisors
    const n = pick([6, 10, 12, 15, 20, 24, 28, 36] as const, rng);
    let sum = 0;
    for (let i = 1; i < n; i++) { if (n % i === 0) sum += i; }
    const ans = String(sum);
    const isPerfect = sum === n;
    return {
      question: `\\text{Sum of proper divisors of ${n}?}`, answer: ans,
      options: opts(ans, [String(sum + 1), String(n), String(sum - 1)], rng),
      category: 'Number Theory', latex: true,
      hint: `Proper divisors of ${n} are all factors except ${n} itself.`,
      explanation: `Proper divisors of ${n} sum to ${ans}.${isPerfect ? ` (${n} is a perfect number!)` : ''}`,
    };
  }
}

function hardNumberTheory(rng: () => number): Problem {
  const type = Math.floor(rng() * 3);
  if (type === 0) {
    // Prime factorization
    const bases = [2, 3, 5, 7];
    const b1 = pick(bases, rng);
    const b2 = pick(bases.filter(x => x !== b1), rng);
    const e1 = Math.floor(rng() * 3) + 2;
    const e2 = Math.floor(rng() * 2) + 1;
    const n = Math.pow(b1, e1) * Math.pow(b2, e2);
    if (n > 10000) {
      const a2 = Math.floor(rng() * 40) + 30;
      const r = a2 % 7;
      return {
        question: `${a2}^2 \\bmod 7 = ?`, answer: String(Math.pow(a2, 2) % 7),
        options: opts(String(Math.pow(a2, 2) % 7), [String((r + 1) % 7), String((r + 2) % 7), String((r + 3) % 7)], rng),
        category: 'Number Theory', latex: true,
        hint: `First find ${a2} mod 7, then square it mod 7`,
        explanation: `${a2} mod 7 = ${r}. ${r}^2 = ${r * r}. ${r * r} mod 7 = ${(r * r) % 7}`,
      };
    }
    return {
      question: `\\text{Highest power of ${b1} dividing } ${n}?`, answer: String(e1),
      options: opts(String(e1), [String(e1 + 1), String(e1 - 1), String(e2)], rng),
      category: 'Number Theory', latex: true,
      hint: `${n} = ${b1}^? × ${b2}^${e2}. How many times does ${b1} appear in the prime factorization?`,
      explanation: `${n} = ${b1}^${e1} × ${b2}^${e2}. Highest power of ${b1} is ${e1}.`,
    };
  } else if (type === 1) {
    // Fermat's little theorem / modular exponentiation
    const p = pick([5, 7, 11, 13] as const, rng);
    const base = Math.floor(rng() * (p - 2)) + 2;
    // base^(p-1) ≡ 1 (mod p) by Fermat
    const ans = '1';
    return {
      question: `${base}^{${p - 1}} \\bmod ${p} = ?`, answer: ans,
      options: ['1', String(base), String(p - 1), '0'],
      category: 'Number Theory', latex: true,
      hint: `Fermat's Little Theorem: if p is prime, a^(p-1) ≡ 1 (mod p)`,
      explanation: `${p} is prime. By Fermat's Little Theorem, ${base}^${p-1} ≡ 1 (mod ${p}).`,
    };
  } else {
    // Euler's totient
    const n = pick([6, 8, 10, 12, 15, 20, 24] as const, rng);
    let phi = 0;
    for (let k = 1; k <= n; k++) { if (gcd(k, n) === 1) phi++; }
    const ans = String(phi);
    return {
      question: `\\varphi(${n}) = ?`, answer: ans,
      options: opts(ans, [String(phi + 1), String(phi - 1), String(n - 1)], rng),
      category: 'Number Theory', latex: true,
      hint: `φ(n) counts integers from 1 to n that are coprime to n.`,
      explanation: `φ(${n}) = ${ans}. Count integers 1..${n} with GCD(k,${n})=1.`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Public API ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const EASY_GEN = [
  easyGroceryBill, easyMakeChange, easySplitBill,
  easyTipCalc, easySalePrice,
  easyTimeCalc, easyUnitConvert, easyDistance,
  easyCookingFractions, easyAreaRoom,
  easyRounding, easyEstimate, easyPattern,
  easyMentalMath, easyNumberSense, easyDivisibility,
  easyLinearEq, easyInequalityBasic,
];

const MEDIUM_GEN = [
  medFinanceSimple, medWageCalc, medBudgetPercent,
  medDistanceSpeed, medUnitConvert,
  medGeometryApplied, medPythagoras,
  medStatistics, medSolveForX, medRatio,
  medPemdas, medFractionOps, medWordProblem,
  medDataInterpret, medPercentComparison, medLogicReasoning,
  medNumberTheory, medAlgebraSystem, medQuadraticFactor,
  medMultiStepWord,
];

const HARD_GEN = [
  hardCompoundInterest, hardPercentChange,
  hardPhysics, hardAlgebraApplied,
  hardProbability, hardGeometryAdvanced,
  hardDataAnalysis, hardExponents,
  hardScientific, hardNegatives,
  hardLogicPuzzle, hardMentalMath, hardRealWorld,
  hardNumberTheory, hardAlgebraSprint, hardAppliedLogic,
];

// Category-filtered generators
const ALL_GEN = [...EASY_GEN, ...MEDIUM_GEN, ...HARD_GEN];

function getFilteredGens(categories: string[], difficulty: Difficulty): ((rng: () => number) => Problem)[] {
  const diffGens = difficulty === 'easy' ? EASY_GEN : difficulty === 'medium' ? MEDIUM_GEN : HARD_GEN;
  // Try difficulty-specific first, then fall back to all
  const filtered = diffGens.filter(gen => {
    // Generate a test problem to check category
    const testRng = createRng(12345);
    const p = gen(testRng);
    return categories.some(c => p.category.toLowerCase().includes(c.toLowerCase()));
  });
  if (filtered.length >= 3) return filtered;
  // Fallback: search all generators
  const allFiltered = ALL_GEN.filter(gen => {
    const testRng = createRng(12345);
    const p = gen(testRng);
    return categories.some(c => p.category.toLowerCase().includes(c.toLowerCase()));
  });
  return allFiltered.length >= 2 ? allFiltered : diffGens;
}

// Static curated problem banks by difficulty
const STATIC_BANKS: Record<Difficulty, Problem[]> = {
  easy: EASY_PROBLEMS,
  medium: MEDIUM_PROBLEMS,
  hard: HARD_PROBLEMS,
};

function getStaticFiltered(categories: string[], difficulty: Difficulty): Problem[] {
  return STATIC_BANKS[difficulty].filter(p =>
    categories.some(c => p.category.toLowerCase().includes(c.toLowerCase()))
  );
}

export function generateProblems(dayIndex: number, difficulty: Difficulty, mission?: DailyMission): Problem[] {
  const count = mission?.questionCount ?? QUESTIONS_PER_ROUND;
  const seed = dayIndex * 7919 + (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3) + (mission ? 100 : 0);
  const rng = createRng(seed);

  let gens: ((rng: () => number) => Problem)[];
  if (mission?.categories) {
    gens = getFilteredGens(mission.categories, difficulty);
  } else {
    gens = difficulty === 'easy' ? EASY_GEN : difficulty === 'medium' ? MEDIUM_GEN : HARD_GEN;
  }

  // Get static curated problems to mix in
  const staticPool = mission?.categories
    ? getStaticFiltered(mission.categories, difficulty)
    : STATIC_BANKS[difficulty];

  const problems: Problem[] = [];

  if (mission?.progressive) {
    const easySlice = EASY_GEN;
    const medSlice = MEDIUM_GEN;
    const hardSlice = HARD_GEN;
    for (let i = 0; i < count; i++) {
      const progress = i / count;
      // Mix in ~25% static curated problems for variety
      if (staticPool.length > 0 && rng() < 0.25) {
        problems.push(pick(staticPool, rng));
      } else {
        let pool: ((rng: () => number) => Problem)[];
        if (mission!.categories) {
          pool = gens;
        } else if (progress < 0.3) {
          pool = difficulty === 'hard' ? medSlice : easySlice;
        } else if (progress < 0.7) {
          pool = difficulty === 'easy' ? easySlice : medSlice;
        } else {
          pool = difficulty === 'easy' ? medSlice : hardSlice;
        }
        problems.push(pick(pool, rng)(rng));
      }
    }
  } else {
    for (let i = 0; i < count; i++) {
      // Mix in ~20% static curated problems for variety
      if (staticPool.length > 0 && rng() < 0.2) {
        problems.push(pick(staticPool, rng));
      } else {
        problems.push(pick(gens, rng)(rng));
      }
    }
  }

  return problems;
}

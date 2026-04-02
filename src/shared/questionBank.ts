import type { Problem } from './problems';

// ═══════════════════════════════════════════════════════════════════════════════
// Static question bank — real-world applied mathematics
// These supplement the procedural generators with curated, varied problems
// ═══════════════════════════════════════════════════════════════════════════════

export const EASY_PROBLEMS: Problem[] = [
  // ── Everyday Arithmetic ───────────────────────────────────────────────────────
  { question: "\\text{You have \\$20 and spend \\$13.50. Change?}", options: ["$6.50", "$7.50", "$6.00", "$5.50"], answer: "$6.50", category: "Money Math", latex: true,
    hint: "Subtract: 20 - 13.50", explanation: "$20.00 - $13.50 = $6.50" },
  { question: "\\text{3 notebooks at \\$4 each. Total?}", options: ["$12", "$7", "$15", "$10"], answer: "$12", category: "Money Math", latex: true,
    hint: "Multiply: 3 x 4", explanation: "3 x $4 = $12" },
  { question: "\\text{Split \\$45 equally among 5 people}", options: ["$9", "$8", "$10", "$7"], answer: "$9", category: "Money Math", latex: true,
    hint: "Divide: 45 / 5", explanation: "$45 / 5 = $9 each" },

  // ── Measurement & Cooking ─────────────────────────────────────────────────────
  { question: "\\text{A recipe needs } \\frac{3}{4} \\text{ cup. Double it?}", options: ["1.5 cups", "1 cup", "2 cups", "1.25 cups"], answer: "1.5 cups", category: "Measurement", latex: true,
    hint: "Multiply 3/4 by 2", explanation: "3/4 x 2 = 6/4 = 1.5 cups" },
  { question: "\\text{How many minutes in 2.5 hours?}", options: ["150", "120", "160", "130"], answer: "150", category: "Unit Conversion", latex: true,
    hint: "1 hour = 60 minutes", explanation: "2.5 x 60 = 150 minutes" },
  { question: "\\text{A room is 12ft x 10ft. Area in sq ft?}", options: ["120", "44", "100", "130"], answer: "120", category: "Measurement", latex: true,
    hint: "Area = length x width", explanation: "12 x 10 = 120 square feet" },

  // ── Time & Speed ──────────────────────────────────────────────────────────────
  { question: "\\text{Walk 3 km/h for 2 hours. Distance?}", options: ["6 km", "5 km", "8 km", "4 km"], answer: "6 km", category: "Distance", latex: true,
    hint: "Distance = speed x time", explanation: "3 km/h x 2h = 6 km" },
  { question: "\\text{A train leaves at 9:15, arrives 11:45. Duration?}", options: ["2h 30m", "2h 15m", "3h", "2h 45m"], answer: "2h 30m", category: "Time", latex: true,
    hint: "Count from 9:15 to 11:45", explanation: "9:15 to 11:15 = 2h, plus 30m = 2h 30m" },

  // ── Percentages & Tips ────────────────────────────────────────────────────────
  { question: "\\text{10\\% tip on a \\$35 meal?}", options: ["$3.50", "$3.00", "$4.00", "$5.00"], answer: "$3.50", category: "Percentages", latex: true,
    hint: "Move decimal one place left", explanation: "10% of $35 = $35/10 = $3.50" },
  { question: "\\text{A \\$80 shirt is 25\\% off. Sale price?}", options: ["$60", "$55", "$65", "$70"], answer: "$60", category: "Percentages", latex: true,
    hint: "25% of 80 = 20, then subtract", explanation: "25% of $80 = $20 off. $80 - $20 = $60" },

  // ── Fractions in Context ──────────────────────────────────────────────────────
  { question: "\\text{Ate } \\frac{3}{8} \\text{ of 24 cookies. How many?}", options: ["9", "8", "6", "12"], answer: "9", category: "Fractions", latex: true,
    hint: "24 / 8 = 3, then x 3", explanation: "3/8 of 24: 24/8 = 3, x 3 = 9 cookies" },
  { question: "\\text{Tank is } \\frac{2}{5} \\text{ full (50L tank). Liters?}", options: ["20", "25", "15", "30"], answer: "20", category: "Fractions", latex: true,
    hint: "50 / 5 = 10, then x 2", explanation: "2/5 of 50L = 50/5 x 2 = 20 liters" },

  // ── Estimation & Rounding ─────────────────────────────────────────────────────
  { question: "\\text{Round 4,678 to nearest hundred}", options: ["4700", "4600", "4680", "5000"], answer: "4700", category: "Rounding", latex: true,
    hint: "Look at tens digit: 7 >= 5, round up", explanation: "4,678 -> tens digit 7 >= 5 -> round up to 4,700" },
  { question: "\\text{Estimate: } 49 \\times 21 \\approx ?", options: ["1000", "900", "1100", "800"], answer: "1000", category: "Estimation", latex: true,
    hint: "Round: ~50 x ~20", explanation: "49 ~ 50, 21 ~ 20. 50 x 20 = 1,000 (exact: 1,029)" },

  // ── Patterns & Sequences ──────────────────────────────────────────────────────
  { question: "\\text{Next: } 2, 6, 18, 54, \\text{ ?}", options: ["162", "108", "72", "180"], answer: "162", category: "Patterns", latex: true,
    hint: "Each term is multiplied by...", explanation: "Pattern: x3 each time. 54 x 3 = 162" },
  { question: "\\text{Next: } 1, 4, 9, 16, 25, \\text{ ?}", options: ["36", "30", "35", "49"], answer: "36", category: "Patterns", latex: true,
    hint: "These are perfect squares", explanation: "1^2, 2^2, 3^2, 4^2, 5^2, 6^2 = 36" },

  // ── Mental Math ────────────────────────────────────────────────────────────────
  { question: "\\text{Quick: } 99 + 47 = ?", options: ["146", "145", "147", "136"], answer: "146", category: "Mental Math", latex: true,
    hint: "100 + 47 - 1", explanation: "99 + 47: think 100 + 47 - 1 = 146" },
  { question: "\\text{Fast: } 25 \\times 8 = ?", options: ["200", "175", "225", "180"], answer: "200", category: "Mental Math", latex: true,
    hint: "25 x 4 = 100, then double", explanation: "25 x 8 = 25 x 4 x 2 = 100 x 2 = 200" },
  { question: "\\text{What + 67 = 100?}", options: ["33", "37", "43", "23"], answer: "33", category: "Number Sense", latex: true,
    hint: "100 minus the number", explanation: "100 - 67 = 33" },

  // ── Logic ──────────────────────────────────────────────────────────────────────
  { question: "\\text{I'm thinking of a number. Double it, add 6 = 22. Number?}", options: ["8", "10", "11", "7"], answer: "8", category: "Logic", latex: true,
    hint: "Work backwards: subtract 6, then halve", explanation: "(22 - 6) / 2 = 16 / 2 = 8" },
  { question: "\\text{A book costs \\$5 more than a pen. Together \\$13. Book price?}", options: ["$9", "$8", "$10", "$7"], answer: "$9", category: "Logic", latex: true,
    hint: "pen = x, book = x+5, sum = 13", explanation: "pen + (pen+5) = 13 -> 2pen = 8 -> pen=$4, book=$9" },

  // ── Number Sense ───────────────────────────────────────────────────────────────
  { question: "\\text{Is 144 a perfect square?}", options: ["Yes", "No", "Only if even", "Need calculator"], answer: "Yes", category: "Number Sense", latex: true,
    hint: "What number times itself = 144?", explanation: "12 x 12 = 144. Yes, it's a perfect square." },
  { question: "\\text{Which is bigger: } \\frac{3}{7} \\text{ or } \\frac{2}{5}?", options: ["3/7", "2/5", "They're equal", "Can't tell"], answer: "3/7", category: "Number Sense", latex: true,
    hint: "Cross multiply: 3x5 vs 2x7", explanation: "3x5=15 > 2x7=14. So 3/7 > 2/5" },
  { question: "\\text{Closest estimate: } 198 \\times 5 \\approx ?", options: ["1000", "900", "1100", "950"], answer: "1000", category: "Estimation", latex: true,
    hint: "Round 198 to 200", explanation: "198 ~ 200. 200 x 5 = 1,000 (exact: 990)" },

  // ── Logic & Number Sense ───────────────────────────────────────────────────
  { question: "\\text{I am 30. My sister is 5 years younger. Her age?}", options: ["25", "35", "30", "20"], answer: "25", category: "Logic", latex: true,
    hint: "Subtract 5", explanation: "30 - 5 = 25" },
  { question: "\\text{What number + 38 = 100?}", options: ["62", "68", "72", "58"], answer: "62", category: "Number Sense", latex: true,
    hint: "100 - 38 = ?", explanation: "100 - 38 = 62" },
  { question: "\\text{Multiply 6 \\times 7, add 4, divide by 2. Result?}", options: ["23", "25", "22", "24"], answer: "23", category: "Mental Math", latex: true,
    hint: "Follow order: 6x7=42, +4=46, /2=?", explanation: "6×7=42. 42+4=46. 46/2=23" },

  // ── Number Theory (Easy) ───────────────────────────────────────────────────
  { question: "\\text{How many factors does 12 have?}", options: ["6", "4", "5", "3"], answer: "6", category: "Number Theory", latex: true,
    hint: "Factors of 12: 1, 2, 3, ...", explanation: "Factors: 1, 2, 3, 4, 6, 12. Count = 6" },
  { question: "\\text{Is 7 prime or composite?}", options: ["Prime", "Composite", "Neither", "Both"], answer: "Prime", category: "Primes", latex: true,
    hint: "Can it be divided by anything other than 1 and 7?", explanation: "7 is only divisible by 1 and 7. It is prime." },
  { question: "\\text{List all factors of 18. How many?}", options: ["6", "5", "4", "8"], answer: "6", category: "Number Theory", latex: true,
    hint: "1, 2, 3, ...", explanation: "Factors of 18: 1, 2, 3, 6, 9, 18. Count = 6" },

  // ── Patterns ───────────────────────────────────────────────────────────────
  { question: "\\text{Next: } 3, 7, 13, 21, 31, \\text{ ?}", options: ["43", "41", "45", "39"], answer: "43", category: "Patterns", latex: true,
    hint: "Differences: 4, 6, 8, 10, ...", explanation: "Differences increase by 2: +4,+6,+8,+10,+12. 31+12=43" },
  { question: "\\text{Next: } 3, 6, 9, 12, \\text{ ?}", options: ["15", "14", "18", "13"], answer: "15", category: "Patterns", latex: true,
    hint: "Add 3 each time", explanation: "12 + 3 = 15" },

  // ── Word Problems & Logic (Easy) ───────────────────────────────────────────
  { question: "\\text{Alice has \\$45. She earns \\$12 babysitting. She spends \\$18. How much left?}", options: ["$39", "$57", "$33", "$27"], answer: "$39", category: "Word Problems", latex: true,
    hint: "Start: 45. Add earnings, subtract spending.", explanation: "$45 + $12 - $18 = $39" },
  { question: "\\text{A car travels 60 km in 1.5 hours. Speed in km/h?}", options: ["40", "45", "50", "90"], answer: "40", category: "Word Problems", latex: true,
    hint: "Speed = distance ÷ time", explanation: "60 ÷ 1.5 = 40 km/h" },
  { question: "\\text{A bag has 3 red, 5 blue, 2 green marbles. P(red)?}", options: ["3/10", "1/3", "3/5", "1/5"], answer: "3/10", category: "Probability", latex: true,
    hint: "Probability = favourable / total", explanation: "Total = 10. P(red) = 3/10" },
  { question: "\\text{Tom is twice Ali's age. Together they are 36. Tom's age?}", options: ["24", "18", "12", "20"], answer: "24", category: "Logic", latex: true,
    hint: "Let Ali = x, Tom = 2x. Sum = 36.", explanation: "3x = 36 → x = 12. Tom = 24" },
  { question: "\\text{A rectangle's perimeter is 34. Width is 7. Length?}", options: ["10", "13", "17", "20"], answer: "10", category: "Geometry", latex: true,
    hint: "P = 2(l + w). Solve for l.", explanation: "34 = 2(l + 7) → l + 7 = 17 → l = 10" },
  { question: "\\text{Solve: } 2x + 3 = 11. \\quad x = ?", options: ["4", "3", "5", "2"], answer: "4", category: "Algebra", latex: true,
    hint: "Subtract 3, then divide by 2", explanation: "2x = 8, x = 4" },

  // ── Equations & Algebra (Easy) ─────────────────────────────────────────────
  { question: "5x = 35. \\quad x = ?", options: ["7", "6", "8", "5"], answer: "7", category: "Equations", latex: true,
    hint: "Divide both sides by 5", explanation: "x = 35 ÷ 5 = 7" },
  { question: "x - 9 = 14. \\quad x = ?", options: ["23", "5", "22", "24"], answer: "23", category: "Equations", latex: true,
    hint: "Add 9 to both sides", explanation: "x = 14 + 9 = 23" },
  { question: "\\frac{x}{4} = 8. \\quad x = ?", options: ["32", "2", "12", "28"], answer: "32", category: "Equations", latex: true,
    hint: "Multiply both sides by 4", explanation: "x = 8 × 4 = 32" },
  { question: "\\text{Rectangle: length 14m, width 6m. Area?}", options: ["84 m²", "20 m²", "40 m²", "168 m²"], answer: "84 m²", category: "Geometry", latex: true,
    hint: "Area = length × width", explanation: "14 × 6 = 84 m²" },
];

export const MEDIUM_PROBLEMS: Problem[] = [
  // ── Personal Finance ──────────────────────────────────────────────────────────
  { question: "\\text{\\$500 at 4\\% annual interest for 1 year?}", options: ["$520", "$540", "$504", "$510"], answer: "$520", category: "Finance", latex: true,
    hint: "Interest = principal x rate", explanation: "500 x 0.04 = $20. Total: $520" },
  { question: "\\text{Earn \\$18/hr, work 37.5 hrs/week. Weekly pay?}", options: ["$675", "$650", "$700", "$625"], answer: "$675", category: "Finance", latex: true,
    hint: "Multiply: 18 x 37.5", explanation: "$18 x 37.5 = $675" },
  { question: "\\text{Monthly rent \\$1,200. What \\% of \\$4,000 salary?}", options: ["30%", "25%", "35%", "28%"], answer: "30%", category: "Finance", latex: true,
    hint: "Divide rent by salary, x 100", explanation: "1200/4000 = 0.30 = 30%" },

  // ── Data & Statistics ─────────────────────────────────────────────────────────
  { question: "\\text{Scores: 82, 91, 76, 88, 93. Mean?}", options: ["86", "88", "84", "90"], answer: "86", category: "Statistics", latex: true,
    hint: "Sum / count", explanation: "Sum: 82+91+76+88+93 = 430. Mean: 430/5 = 86" },
  { question: "\\text{Data: 3, 5, 7, 7, 8, 9, 12. Median?}", options: ["7", "8", "7.5", "6"], answer: "7", category: "Statistics", latex: true,
    hint: "Middle value of sorted data", explanation: "7 values sorted. Middle (4th) value = 7" },

  // ── Ratios & Proportions ──────────────────────────────────────────────────────
  { question: "\\text{Map scale 1:50,000. 3cm on map = ? km}", options: ["1.5", "1", "3", "0.5"], answer: "1.5", category: "Ratios", latex: true,
    hint: "3 x 50,000 = 150,000 cm. Convert to km.", explanation: "3 x 50,000 = 150,000 cm = 1,500 m = 1.5 km" },
  { question: "\\text{Concrete mix 1:2:4 (cement:sand:gravel). Sand for 21kg total?}", options: ["6 kg", "3 kg", "9 kg", "12 kg"], answer: "6 kg", category: "Ratios", latex: true,
    hint: "Total parts = 1+2+4 = 7", explanation: "7 parts total. Sand = 2/7 of 21 = 6 kg" },

  // ── Geometry in Practice ──────────────────────────────────────────────────────
  { question: "\\text{Circular garden, r=7m. Area? (use } \\pi \\approx 3.14 \\text{)}", options: ["154 m^2", "44 m^2", "22 m^2", "308 m^2"], answer: "154 m^2", category: "Geometry", latex: true,
    hint: "Area = pi x r^2", explanation: "pi x 7^2 = 3.14 x 49 = 153.86 ~ 154 m^2" },
  { question: "\\text{Fence a 25m x 18m yard. Perimeter?}", options: ["86 m", "450 m", "43 m", "96 m"], answer: "86 m", category: "Geometry", latex: true,
    hint: "Perimeter = 2(L + W)", explanation: "2 x (25 + 18) = 2 x 43 = 86 m" },
  { question: "\\text{Ladder 10m, base 6m from wall. Height reached?}", options: ["8 m", "6 m", "9 m", "7 m"], answer: "8 m", category: "Geometry", latex: true,
    hint: "Pythagorean: a^2 + b^2 = c^2", explanation: "10^2 - 6^2 = 100 - 36 = 64. sqrt(64) = 8 m" },

  // ── Algebra Applied ───────────────────────────────────────────────────────────
  { question: "\\text{Taxi: \\$3 base + \\$2/km. Fare for 8km?}", options: ["$19", "$16", "$22", "$13"], answer: "$19", category: "Linear Equations", latex: true,
    hint: "Total = 3 + 2 x distance", explanation: "$3 + $2 x 8 = $3 + $16 = $19" },
  { question: "3x + 7 = 22, \\quad x = ?", options: ["5", "6", "4", "7"], answer: "5", category: "Solve for X", latex: true,
    hint: "Subtract 7, then divide by 3", explanation: "3x = 22 - 7 = 15. x = 15/3 = 5" },

  // ── Unit Conversion ───────────────────────────────────────────────────────────
  { question: "\\text{Convert 5 miles to km (1 mi} \\approx \\text{1.6 km)}", options: ["8 km", "7.5 km", "6 km", "10 km"], answer: "8 km", category: "Unit Conversion", latex: true,
    hint: "Multiply by 1.6", explanation: "5 x 1.6 = 8 km" },
  { question: "\\text{72 km/h in m/s?}", options: ["20", "25", "15", "30"], answer: "20", category: "Unit Conversion", latex: true,
    hint: "Divide by 3.6", explanation: "72 / 3.6 = 20 m/s" },

  // ── Probability & Risk ────────────────────────────────────────────────────────
  { question: "\\text{2 dice rolled. P(sum=7)? Express as X/36}", options: ["6/36", "5/36", "7/36", "4/36"], answer: "6/36", category: "Probability", latex: true,
    hint: "List pairs: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1)", explanation: "6 favorable outcomes out of 36 total = 6/36 = 1/6" },

  // ── Order of Operations ───────────────────────────────────────────────────────
  { question: "8 + 5 \\times 4 - 3^2 = ?", options: ["19", "43", "28", "11"], answer: "19", category: "Order of Ops", latex: true,
    hint: "Powers first, then multiply, then add/subtract", explanation: "3^2=9, 5x4=20. 8+20-9 = 19" },
  { question: "(15 - 3) \\times 4 + 6^2 = ?", options: ["84", "48", "72", "96"], answer: "84", category: "Order of Ops", latex: true,
    hint: "Parentheses, then exponent, then multiply, then add", explanation: "(12) x 4 + 36 = 48 + 36 = 84" },

  // ── Data Interpretation ────────────────────────────────────────────────────────
  { question: "\\text{Sales: Mon=12, Tue=18, Wed=15, Thu=21. Average?}", options: ["16.5", "18", "15", "17"], answer: "16.5", category: "Data Interpretation", latex: true,
    hint: "Sum all values, divide by 4", explanation: "(12+18+15+21)/4 = 66/4 = 16.5" },
  { question: "\\text{Budget: 40\\% rent, 25\\% food, 15\\% transport. Savings \\%?}", options: ["20%", "15%", "25%", "10%"], answer: "20%", category: "Data Interpretation", latex: true,
    hint: "100% minus all expenses", explanation: "100 - 40 - 25 - 15 = 20%" },

  // ── Logic & Reasoning ──────────────────────────────────────────────────────────
  { question: "\\text{In 5 years I'll be twice my age 4 years ago. My age?}", options: ["13", "12", "14", "11"], answer: "13", category: "Logic", latex: true,
    hint: "x + 5 = 2(x - 4). Solve for x.", explanation: "x + 5 = 2x - 8 -> 13 = x" },
  { question: "\\text{Buy at \\$60, sell at \\$75. Profit percentage?}", options: ["25%", "20%", "15%", "30%"], answer: "25%", category: "Logic", latex: true,
    hint: "Profit% = (profit/cost) x 100", explanation: "Profit=$15. 15/60 x 100 = 25%" },
  { question: "\\text{A and B paint 3 walls/hr and 2 walls/hr. Together in 4 hrs?}", options: ["20", "12", "14", "24"], answer: "20", category: "Logic", latex: true,
    hint: "Combined rate x time", explanation: "(3 + 2) x 4 = 5 x 4 = 20 walls" },

  // ── Percent Comparison ─────────────────────────────────────────────────────────
  { question: "\\text{150 out of 600. What percent?}", options: ["25%", "20%", "30%", "15%"], answer: "25%", category: "Percentages", latex: true,
    hint: "(part / whole) x 100", explanation: "150/600 x 100 = 25%" },

  // ── Mental Math (Medium) ───────────────────────────────────────────────────────
  { question: "\\text{Fast: } 15^2 = ?", options: ["225", "215", "250", "200"], answer: "225", category: "Mental Math", latex: true,
    hint: "Numbers ending in 5: tens x (tens+1), append 25", explanation: "1 x 2 = 2, append 25 -> 225" },
  { question: "\\text{Quick: } 4 \\times 37 \\times 25 = ?", options: ["3700", "3600", "4000", "3500"], answer: "3700", category: "Mental Math", latex: true,
    hint: "Rearrange: 4 x 25 = 100, then x 37", explanation: "4 x 25 = 100. 100 x 37 = 3,700" },

  // ── More Logic ─────────────────────────────────────────────────────────────────
  { question: "\\text{A number tripled, minus 7, equals 20. The number?}", options: ["9", "8", "10", "7"], answer: "9", category: "Logic", latex: true,
    hint: "3x - 7 = 20. Solve for x.", explanation: "3x = 27. x = 9" },
  { question: "\\text{Train A: 80km/h, Train B: 60km/h, opposite dirs. Gap after 2h?}", options: ["280 km", "160 km", "240 km", "320 km"], answer: "280 km", category: "Logic", latex: true,
    hint: "Combined speed = 80 + 60 = 140 km/h", explanation: "(80 + 60) x 2 = 140 x 2 = 280 km" },

  // ── Algebra Word Problems ──────────────────────────────────────────────────────
  { question: "\\text{Gym: \\$50 joining + \\$25/mo. Total after 6 months?}", options: ["$200", "$150", "$175", "$225"], answer: "$200", category: "Word Problems", latex: true,
    hint: "Total = fixed + (monthly x months)", explanation: "$50 + $25 x 6 = $50 + $150 = $200" },

  // ── Number Theory (Medium) ─────────────────────────────────────────────────
  { question: "\\gcd(48,\\ 36) = ?", options: ["12", "6", "18", "9"], answer: "12", category: "Number Theory", latex: true,
    hint: "Use Euclidean algorithm: 48 = 1×36 + 12, 36 = 3×12 + 0", explanation: "48 = 1×36 + 12. 36 = 3×12. GCD = 12" },
  { question: "\\text{lcm}(4,\\ 6) = ?", options: ["12", "24", "8", "6"], answer: "12", category: "Number Theory", latex: true,
    hint: "LCM = (4 × 6) / GCD(4,6)", explanation: "GCD(4,6)=2. LCM = 4×6/2 = 12" },
  { question: "47 \\bmod 5 = ?", options: ["2", "3", "1", "4"], answer: "2", category: "Number Theory", latex: true,
    hint: "47 = 9×5 + ?", explanation: "47 = 9×5 + 2. Remainder = 2" },
  { question: "\\text{How many prime numbers between 1 and 20?}", options: ["8", "6", "7", "9"], answer: "8", category: "Primes", latex: true,
    hint: "List them: 2, 3, 5, 7, ...", explanation: "Primes: 2,3,5,7,11,13,17,19. Count = 8" },

  // ── Logic & Algebra ────────────────────────────────────────────────────────
  { question: "\\text{Sum of interior angles of a hexagon?}", options: ["720°", "540°", "360°", "900°"], answer: "720°", category: "Geometry", latex: true,
    hint: "(n-2) × 180°, where n = 6", explanation: "(6-2) × 180° = 4 × 180° = 720°" },
  { question: "\\text{Train A: 60 mph. Train B: 80 mph, same direction. Gap closes in?} \\text{ (start 100mi apart)}", options: ["5 hrs", "4 hrs", "10 hrs", "2 hrs"], answer: "5 hrs", category: "Word Problems", latex: true,
    hint: "Relative speed = 80 - 60 = 20 mph", explanation: "Relative speed = 20 mph. 100/20 = 5 hours to close gap" },

  // ── Statistics & Data ──────────────────────────────────────────────────────
  { question: "\\text{Dataset: 5, 5, 7, 8, 10. What is the mode?}", options: ["5", "7", "8", "10"], answer: "5", category: "Statistics", latex: true,
    hint: "Which value appears most often?", explanation: "5 appears twice. Mode = 5" },
  { question: "\\text{Scores: 70, 80, 90, 100. Weighted avg (30, 20, 30, 20)?}", options: ["82", "85", "80", "88"], answer: "82", category: "Statistics", latex: true,
    hint: "Sum(score × weight) / 100", explanation: "70×30 + 80×20 + 90×30 + 100×20 = 8200. /100 = 82" },

  // ── Problem Solving / Logic (Medium) ──────────────────────────────────────
  { question: "\\text{Two pipes fill a tank in 4h and 6h. Together?}", options: ["2.4 hrs", "2 hrs", "5 hrs", "3 hrs"], answer: "2.4 hrs", category: "Logic", latex: true,
    hint: "1/4 + 1/6 = 1/T. Find T.", explanation: "Rate = 1/4 + 1/6 = 5/12 per hr. T = 12/5 = 2.4 hours" },
  { question: "\\text{A tank is 40\\% full. Adding 30L makes it 70\\%. Capacity?}", options: ["100 L", "75 L", "120 L", "90 L"], answer: "100 L", category: "Word Problems", latex: true,
    hint: "30% of capacity = 30 L", explanation: "0.30 × C = 30. C = 100 L" },
  { question: "\\text{Cost \\$100, marked up 50\\%, then 20\\% discount. Profit?}", options: ["$20", "$30", "$50", "$10"], answer: "$20", category: "Finance", latex: true,
    hint: "Sell price = 100 × 1.5 × 0.8", explanation: "$100 × 1.5 = $150. $150 × 0.8 = $120. Profit = $120 - $100 = $20" },
  { question: "\\text{If } 3x - 7 = 2(x + 4), \\text{ find } x.", options: ["15", "9", "1", "7"], answer: "15", category: "Algebra", latex: true,
    hint: "Expand, collect x terms on one side.", explanation: "3x - 7 = 2x + 8 → x = 15" },
  { question: "\\text{A train 200m long passes a pole in 10s. Speed in m/s?}", options: ["20", "25", "10", "40"], answer: "20", category: "Word Problems", latex: true,
    hint: "Speed = length ÷ time", explanation: "200 m ÷ 10 s = 20 m/s" },
  { question: "\\text{P(A)=0.4, P(B)=0.5, independent. P(A and B)?}", options: ["0.2", "0.9", "0.45", "0.1"], answer: "0.2", category: "Probability", latex: true,
    hint: "P(A∩B) = P(A) × P(B) for independent events", explanation: "0.4 × 0.5 = 0.2" },
];

export const HARD_PROBLEMS: Problem[] = [
  // ── Compound Interest & Investment ────────────────────────────────────────────
  { question: "\\text{\\$1,000 at 5\\% compound interest, 2 years?}", options: ["$1,102.50", "$1,100", "$1,105", "$1,050"], answer: "$1,102.50", category: "Finance", latex: true,
    hint: "Year 1: x 1.05. Year 2: x 1.05 again", explanation: "1000 x 1.05 = 1050. 1050 x 1.05 = 1102.50" },
  { question: "\\text{Stock drops 20\\%, then rises 25\\%. Net change?}", options: ["0%", "+5%", "-5%", "+1%"], answer: "0%", category: "Finance", latex: true,
    hint: "Start with 100. Apply each change.", explanation: "100 x 0.80 = 80. 80 x 1.25 = 100. Net: 0% change" },

  // ── Physics & Engineering ─────────────────────────────────────────────────────
  { question: "\\text{F = ma. Mass 15kg, accel 4 m/s}^2\\text{. Force?}", options: ["60 N", "45 N", "75 N", "19 N"], answer: "60 N", category: "Physics", latex: true,
    hint: "Multiply mass by acceleration", explanation: "F = 15 x 4 = 60 Newtons" },
  { question: "\\text{v = d/t. 300km in 2.5 hours. Avg speed?}", options: ["120 km/h", "100 km/h", "150 km/h", "75 km/h"], answer: "120 km/h", category: "Physics", latex: true,
    hint: "Divide distance by time", explanation: "300 / 2.5 = 120 km/h" },

  // ── Advanced Algebra ──────────────────────────────────────────────────────────
  { question: "x^2 - 7x + 12 = 0. \\quad x_1 \\times x_2 = ?", options: ["12", "7", "3", "4"], answer: "12", category: "Algebra", latex: true,
    hint: "By Vieta's: product of roots = c/a", explanation: "Roots are 3 and 4. Product = 12 (or c/a = 12/1)" },
  { question: "\\text{Simplify: } \\frac{x^2 - 9}{x + 3}", options: ["x - 3", "x + 3", "x^2 - 3", "x - 9"], answer: "x - 3", category: "Algebra", latex: true,
    hint: "Factor numerator: difference of squares", explanation: "(x+3)(x-3)/(x+3) = x - 3" },
  { question: "x^2 + 5x + 6 = 0. \\quad x_1 + x_2 = ?", options: ["-5", "5", "-6", "6"], answer: "-5", category: "Quadratics", latex: true,
    hint: "Sum of roots = -b/a", explanation: "Roots: -2, -3. Sum = -5 (or -b/a = -5/1)" },
  { question: "|2x - 6| = 10. \\quad \\text{Larger solution?}", options: ["8", "-2", "3", "10"], answer: "8", category: "Equations", latex: true,
    hint: "Two cases: 2x-6=10 and 2x-6=-10", explanation: "2x=16 → x=8, or 2x=-4 → x=-2. Larger = 8" },
  { question: "f(x) = 3x^2 - 2. \\quad f(4) = ?", options: ["46", "48", "44", "50"], answer: "46", category: "Algebra", latex: true,
    hint: "Substitute x = 4", explanation: "3(16) - 2 = 48 - 2 = 46" },

  // ── Combinatorics ─────────────────────────────────────────────────────────────
  { question: "\\text{8 people, choose a committee of 3. Ways?}", options: ["56", "336", "24", "40320"], answer: "56", category: "Combinatorics", latex: true,
    hint: "C(8,3) = 8!/(3! x 5!)", explanation: "C(8,3) = (8x7x6)/(3x2x1) = 336/6 = 56" },
  { question: "\\text{How many ways to arrange letters in MATH?}", options: ["24", "16", "12", "256"], answer: "24", category: "Combinatorics", latex: true,
    hint: "4 distinct letters: 4!", explanation: "4! = 4 x 3 x 2 x 1 = 24" },

  // ── Logarithms & Exponents ────────────────────────────────────────────────────
  { question: "\\log_{2}(64) = ?", options: ["6", "5", "7", "8"], answer: "6", category: "Logarithms", latex: true,
    hint: "2 to what power = 64?", explanation: "2^6 = 64, so log_2(64) = 6" },
  { question: "3^2 \\times 3^3 = ?", options: ["243", "81", "729", "27"], answer: "243", category: "Exponent Rules", latex: true,
    hint: "a^m x a^n = a^(m+n)", explanation: "3^(2+3) = 3^5 = 243" },

  // ── Data Analysis ─────────────────────────────────────────────────────────────
  { question: "\\text{Dataset: 4,7,7,8,9,10,15. IQR?}", options: ["3", "5", "7", "11"], answer: "3", category: "Statistics", latex: true,
    hint: "IQR = Q3 - Q1", explanation: "Q1=7, Q3=10. IQR = 10 - 7 = 3" },

  // ── Applied Geometry ──────────────────────────────────────────────────────────
  { question: "\\text{Sphere r=3. Volume? (} V = \\frac{4}{3}\\pi r^3 \\text{)}", options: ["113.1", "84.8", "36", "28.3"], answer: "113.1", category: "Geometry", latex: true,
    hint: "4/3 x pi x 27", explanation: "(4/3) x 3.14 x 27 = 113.1" },
  { question: "\\text{Right triangle: legs 5 and 12. Hypotenuse?}", options: ["13", "17", "11", "15"], answer: "13", category: "Geometry", latex: true,
    hint: "a^2 + b^2 = c^2", explanation: "5^2 + 12^2 = 25 + 144 = 169. sqrt(169) = 13" },

  // ── Scientific Notation ───────────────────────────────────────────────────────
  { question: "\\text{Distance to Sun: } 1.5 \\times 10^8 \\text{ km. In km?}", options: ["150,000,000", "15,000,000", "1,500,000,000", "1,500,000"], answer: "150,000,000", category: "Scientific Notation", latex: true,
    hint: "Move decimal 8 places right", explanation: "1.5 x 10^8 = 150,000,000 km" },

  // ── Advanced Logic ─────────────────────────────────────────────────────────────
  { question: "\\text{Price rises 10\\%, then drops 10\\%. Net change?}", options: ["-1%", "0%", "-2%", "+1%"], answer: "-1%", category: "Logic", latex: true,
    hint: "Start with 100. Apply each change.", explanation: "100 x 1.10 = 110. 110 x 0.90 = 99. Net: -1%" },
  { question: "\\text{A is 3x B's age. Sum is 48. A's age?}", options: ["36", "32", "24", "40"], answer: "36", category: "Logic", latex: true,
    hint: "B + 3B = 48", explanation: "4B = 48, B=12, A = 3x12 = 36" },

  // ── Negative Number Operations ─────────────────────────────────────────────────
  { question: "(-8) \\times (-7) + (-3) = ?", options: ["53", "59", "56", "-59"], answer: "53", category: "Negative Numbers", latex: true,
    hint: "Neg x Neg = Pos, then add the negative", explanation: "(-8)x(-7) = 56. 56 + (-3) = 53" },

  // ── Quadratic Applications ─────────────────────────────────────────────────────
  { question: "\\text{Ball thrown up: } h = 40t - 5t^2\\text{. Max height?}", options: ["80 m", "60 m", "100 m", "40 m"], answer: "80 m", category: "Physics", latex: true,
    hint: "Max at t = -b/(2a) = 40/10 = 4s", explanation: "t=4: h = 40(4) - 5(16) = 160 - 80 = 80 m" },

  // ── Probability Advanced ───────────────────────────────────────────────────────
  { question: "\\text{Deck of 52 cards. P(heart OR face card)?}", options: ["22/52", "25/52", "16/52", "13/52"], answer: "22/52", category: "Probability", latex: true,
    hint: "P(A or B) = P(A) + P(B) - P(A and B)", explanation: "13 hearts + 12 face cards - 3 heart face cards = 22/52" },

  // ── Hard Logic ─────────────────────────────────────────────────────────────────
  { question: "\\text{3 consecutive even integers sum to 78. Largest?}", options: ["28", "26", "30", "24"], answer: "28", category: "Logic", latex: true,
    hint: "n + (n+2) + (n+4) = 78", explanation: "3n + 6 = 78 -> n=24. Largest: 24+4 = 28" },
  { question: "\\text{Worker A: 6hrs, B: 4hrs for same job. Together?}", options: ["2.4 hrs", "5 hrs", "3 hrs", "2 hrs"], answer: "2.4 hrs", category: "Logic", latex: true,
    hint: "1/6 + 1/4 = 1/T", explanation: "1/6 + 1/4 = 5/12. T = 12/5 = 2.4 hours" },

  // ── Successive Changes ─────────────────────────────────────────────────────────
  { question: "\\text{\\$200 item: 20\\% off, then 10\\% off. Final price?}", options: ["$144", "$140", "$150", "$136"], answer: "$144", category: "Finance", latex: true,
    hint: "Apply discounts one at a time, not added", explanation: "$200 x 0.80 = $160. $160 x 0.90 = $144" },

  // ── Hard Mental Math ───────────────────────────────────────────────────────────
  { question: "97 \\times 96 = ?", options: ["9312", "9216", "9408", "9120"], answer: "9312", category: "Mental Math", latex: true,
    hint: "(100-3)(100-4) = 10000 - 700 + 12", explanation: "97 x 96 = (100-3)(100-4) = 10000 - 400 - 300 + 12 = 9312" },
  { question: "\\text{25\\% of 40\\% of 500 = ?}", options: ["50", "100", "75", "40"], answer: "50", category: "Mental Math", latex: true,
    hint: "40% of 500 first, then 25% of that", explanation: "40% of 500 = 200. 25% of 200 = 50" },

  // ── Hard Real-World ────────────────────────────────────────────────────────────
  { question: "\\text{Loan \\$10,000 at 6\\% simple interest, 2yrs. Total owed?}", options: ["$11,200", "$11,260", "$10,600", "$12,000"], answer: "$11,200", category: "Finance", latex: true,
    hint: "Interest = P x r x t", explanation: "$10,000 x 0.06 x 2 = $1,200. Total: $11,200" },
  { question: "\\text{Car A: 30mpg, Car B: 45mpg. 450mi trip. Fuel saved at \\$4/gal?}", options: ["$20", "$16", "$24", "$30"], answer: "$20", category: "Word Problems", latex: true,
    hint: "Find gallons for each, then cost difference", explanation: "A: 450/30=15gal=$60. B: 450/45=10gal=$40. Save $20" },

  // ── Number Theory (Hard) ───────────────────────────────────────────────────
  { question: "\\varphi(12) = ?", options: ["4", "6", "3", "8"], answer: "4", category: "Number Theory", latex: true,
    hint: "Count integers 1-12 coprime to 12", explanation: "1,5,7,11 are coprime to 12. φ(12) = 4" },
  { question: "\\varphi(7) = ?", options: ["6", "7", "5", "4"], answer: "6", category: "Number Theory", latex: true,
    hint: "7 is prime: φ(p) = p-1", explanation: "7 is prime. φ(7) = 7 - 1 = 6" },
  { question: "3^4 \\bmod 5 = ?", options: ["1", "3", "4", "2"], answer: "1", category: "Number Theory", latex: true,
    hint: "3^1=3, 3^2=9≡4, 3^3=27≡2, 3^4=81≡?", explanation: "3^4=81. 81=16×5+1. 81 mod 5 = 1" },
  { question: "\\text{Sum of proper divisors of 28?}", options: ["28", "14", "56", "27"], answer: "28", category: "Number Theory", latex: true,
    hint: "Proper divisors: 1,2,4,7,14", explanation: "1+2+4+7+14=28. 28 is a perfect number!" },

  // ── Advanced Logic & Reasoning ─────────────────────────────────────────────
  { question: "\\text{P is prime. P divides } n^2 \\text{. Does P divide n?}", options: ["Always", "Never", "Sometimes", "Only if P > n"], answer: "Always", category: "Number Theory", latex: true,
    hint: "If p is prime and p|ab, then p|a or p|b", explanation: "By Euclid's lemma: p prime, p|n², so p|n. Always true." },
  { question: "\\text{How many zeros end 100! (factorial)?}", options: ["24", "20", "25", "22"], answer: "24", category: "Factorials", latex: true,
    hint: "Count factors of 5: ⌊100/5⌋ + ⌊100/25⌋", explanation: "⌊100/5⌋=20, ⌊100/25⌋=4. Total = 24 trailing zeros" },

  // ── Advanced Probability ───────────────────────────────────────────────────
  { question: "\\text{P(A)=0.6, P(B)=0.5, P(A∩B)=0.3. P(A∪B)?}", options: ["0.8", "0.7", "1.1", "0.9"], answer: "0.8", category: "Probability", latex: true,
    hint: "P(A∪B) = P(A) + P(B) - P(A∩B)", explanation: "0.6 + 0.5 - 0.3 = 0.8" },
  { question: "\\text{Roll two dice. P(sum = 7)?}", options: ["1/6", "1/4", "1/5", "1/8"], answer: "1/6", category: "Probability", latex: true,
    hint: "How many pairs (a,b) sum to 7 out of 36?", explanation: "6 pairs sum to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). P = 6/36 = 1/6" },

  // ── Hard Problem Solving / Logic ───────────────────────────────────────────
  { question: "\\text{A and B run a 1km race. A beats B by 100m. Then A gives B a 100m head start. Who wins?}", options: ["A wins", "B wins", "Tie", "Cannot tell"], answer: "A wins", category: "Logic", latex: true,
    hint: "When B has run 900m, A runs 1000m. With 100m start, when B runs 1000m, how far does A run?", explanation: "A's speed ratio = 1000:900 = 10:9. With head start: A runs 900m while B runs 900m, so A arrives first. A wins." },
  { question: "\\text{5 workers complete a job in 12 days. How many days for 9 workers?}", options: ["6.67 days", "8 days", "10 days", "4 days"], answer: "6.67 days", category: "Word Problems", latex: true,
    hint: "Inverse proportion: workers × days = constant", explanation: "5 × 12 = 60 worker-days. 60 ÷ 9 = 6.67 days" },
  { question: "\\text{Clock shows 3:15. Angle between hands?}", options: ["7.5°", "0°", "15°", "90°"], answer: "7.5°", category: "Logic", latex: true,
    hint: "Hour hand moves 0.5° per minute from the hour mark", explanation: "Hour hand: 90° + 15×0.5° = 97.5°. Minute: 90°. Angle = 7.5°" },
  { question: "\\text{A 20\\% salt solution + 50\\% salt solution = 30L of 30\\% solution. How much 20\\% solution?}", options: ["20 L", "10 L", "15 L", "25 L"], answer: "20 L", category: "Algebra", latex: true,
    hint: "Let x = amount of 20% solution. Set up: 0.2x + 0.5(30-x) = 0.3(30)", explanation: "0.2x + 15 - 0.5x = 9. -0.3x = -6. x = 20 L" },
  { question: "\\text{Sequence: } a_n = 2n^2 - 1. \\quad a_5 = ?", options: ["49", "51", "47", "25"], answer: "49", category: "Algebra", latex: true,
    hint: "Substitute n = 5 into the formula", explanation: "a₅ = 2(5²) - 1 = 2(25) - 1 = 50 - 1 = 49" },

  // ── Hard Algebra / Equations ───────────────────────────────────────────────
  { question: "x^2 - 5x - 14 = 0. \\quad \\text{Positive root?}", options: ["7", "2", "5", "14"], answer: "7", category: "Quadratics", latex: true,
    hint: "Factor: (x-7)(x+2) = 0", explanation: "Roots: 7 and -2. Positive root = 7" },
  { question: "\\text{If } f(x) = x^3 - 8, \\text{ solve } f(x) = 0.", options: ["2", "4", "8", "-2"], answer: "2", category: "Algebra", latex: true,
    hint: "x³ = 8. Cube root of 8?", explanation: "x³ = 8 → x = ∛8 = 2" },
  { question: "\\text{System: } x+y=10, \\; 2x-y=5. \\quad x = ?", options: ["5", "3", "7", "4"], answer: "5", category: "Algebra", latex: true,
    hint: "Add the two equations to eliminate y", explanation: "3x = 15 → x = 5. Then y = 5." },
];

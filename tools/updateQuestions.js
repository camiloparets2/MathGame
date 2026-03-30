import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of math topics to cycle through
const topics = [
  'Arithmetic',
  'Algebra',
  'Geometry',
  'Statistics',
  'Probability',
  'Finance',
  'Measurement',
  'Logic',
  'Patterns',
  'Mental Math'
];

// Get current day of the year (0-364)
const now = new Date();
const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
const topicIndex = dayOfYear % topics.length;
const currentTopic = topics[topicIndex];

console.log(`Updating question bank for topic: ${currentTopic} (Day ${dayOfYear})`);

// Function to generate questions based on topic
function generateQuestions(topic) {
  const questions = [];

  switch (topic) {
    case 'Arithmetic':
      // Generate addition, subtraction, multiplication, division
      for (let i = 0; i < 3; i++) {
        const a = Math.floor(Math.random() * 100) + 1;
        const b = Math.floor(Math.random() * 100) + 1;
        const op = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
        let answer, question;
        if (op === '/') {
          // Make divisible
          const product = a * b;
          question = `${product} \\div ${a} = ?`;
          answer = b.toString();
        } else {
          question = `${a} ${op === '*' ? '\\times' : op} ${b} = ?`;
          answer = eval(`${a} ${op} ${b}`).toString();
        }
        const options = [answer, (parseInt(answer) + Math.floor(Math.random() * 10) - 5).toString(),
                         (parseInt(answer) + Math.floor(Math.random() * 20) - 10).toString(),
                         (parseInt(answer) - Math.floor(Math.random() * 10) + 5).toString()];
        questions.push({
          question: `\\text{${question}}`,
          options,
          answer,
          category: 'Arithmetic',
          latex: true,
          hint: 'Calculate step by step',
          explanation: `${a} ${op} ${b} = ${answer}`
        });
      }
      break;

    case 'Algebra':
      // Simple linear equations
      questions.push({
        question: `\\text{Solve: } 2x + 3 = 11`,
        options: ['4', '3', '5', '2'],
        answer: '4',
        category: 'Algebra',
        latex: true,
        hint: 'Subtract 3, then divide by 2',
        explanation: '2x = 8, x = 4'
      });
      // Add more...
      break;

    case 'Geometry':
      // Area of rectangle
      const l = Math.floor(Math.random() * 20) + 5;
      const w = Math.floor(Math.random() * 20) + 5;
      const area = l * w;
      questions.push({
        question: `\\text{Rectangle: length ${l}m, width ${w}m. Area?}`,
        options: [`${area}`, `${l + w}`, `${l * 2 + w * 2}`, `${(l + w) * 2}`],
        answer: `${area}`,
        category: 'Geometry',
        latex: true,
        hint: 'Area = length × width',
        explanation: `${l} × ${w} = ${area} m²`
      });
      break;

    case 'Statistics':
      // Mean of numbers
      const nums = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];
      const mean = (nums.reduce((a,b) => a+b) / nums.length).toFixed(1);
      questions.push({
        question: `\\text{Numbers: ${nums.join(', ')}. Mean?}`,
        options: [mean, (parseFloat(mean) + 1).toString(), (parseFloat(mean) - 1).toString(), (parseFloat(mean) * 2).toString()],
        answer: mean,
        category: 'Statistics',
        latex: true,
        hint: 'Sum divided by count',
        explanation: `(${nums.join(' + ')}) / ${nums.length} = ${mean}`
      });
      break;

    case 'Probability':
      // Simple probability
      questions.push({
        question: `\\text{Fair die. P(even number)?}`,
        options: ['1/2', '1/3', '1/6', '1/4'],
        answer: '1/2',
        category: 'Probability',
        latex: true,
        hint: '3 even numbers out of 6',
        explanation: '3/6 = 1/2'
      });
      break;

    case 'Finance':
      // Simple interest
      const principal = Math.floor(Math.random() * 1000) + 500;
      const rate = 5;
      const time = 2;
      const interest = (principal * rate * time / 100);
      const total = principal + interest;
      questions.push({
        question: `\\text{\\$ ${principal} at ${rate}\\% simple interest for ${time} years. Total?}`,
        options: [`$${total}`, `$${principal + rate}`, `$${principal * rate}`, `$${interest}`],
        answer: `$${total}`,
        category: 'Finance',
        latex: true,
        hint: 'Interest = P × r × t / 100',
        explanation: `$${principal} + $${interest} = $${total}`
      });
      break;

    case 'Measurement':
      // Unit conversion
      const km = Math.floor(Math.random() * 10) + 1;
      const miles = (km * 0.621371).toFixed(1);
      questions.push({
        question: `\\text{${km} km in miles? (1 km ≈ 0.62 mi)}`,
        options: [miles, (parseFloat(miles) + 1).toString(), (parseFloat(miles) - 1).toString(), (km * 2).toString()],
        answer: miles,
        category: 'Unit Conversion',
        latex: true,
        hint: 'Multiply by 0.62',
        explanation: `${km} × 0.62 ≈ ${miles} miles`
      });
      break;

    case 'Logic':
      // Age problems
      questions.push({
        question: `\\text{I am 30. My sister is 5 years younger. Her age?}`,
        options: ['25', '35', '30', '20'],
        answer: '25',
        category: 'Logic',
        latex: true,
        hint: 'Subtract 5',
        explanation: '30 - 5 = 25'
      });
      break;

    case 'Patterns':
      // Next in sequence
      questions.push({
        question: `\\text{Next: 3, 6, 9, 12, ?}`,
        options: ['15', '14', '18', '13'],
        answer: '15',
        category: 'Patterns',
        latex: true,
        hint: 'Add 3 each time',
        explanation: '12 + 3 = 15'
      });
      break;

    case 'Mental Math':
      // Quick calculation
      const x = Math.floor(Math.random() * 10) + 10;
      const y = Math.floor(Math.random() * 10) + 10;
      const prod = x * y;
      questions.push({
        question: `\\text{${x} × ${y} = ?}`,
        options: [prod.toString(), (prod + 10).toString(), (prod - 10).toString(), (x + y).toString()],
        answer: prod.toString(),
        category: 'Mental Math',
        latex: true,
        hint: 'Multiply step by step',
        explanation: `${x} × ${y} = ${prod}`
      });
      break;

    default:
      break;
  }

  return questions;
}

// Generate questions for current topic
const newQuestions = generateQuestions(currentTopic);

// Read the current questionBank.ts
const filePath = path.join(__dirname, '..', 'src', 'shared', 'questionBank.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find where to insert: before the ]; of EASY_PROBLEMS
const easyStart = content.indexOf('export const EASY_PROBLEMS');
const easyEndIndex = content.indexOf('];', easyStart) + 1; // position after ]

const insertPoint = easyEndIndex - 1; // before ]

const newContent = content.slice(0, insertPoint) +
  ',\n  // ── ' + currentTopic + ' ──────────────────────────────────────────────────────\n' +
  newQuestions.map(q => `  ${JSON.stringify(q, null, 2).replace(/\n/g, '\n  ')}`).join(',\n') +
  '\n' +
  content.slice(insertPoint);

// Write back
fs.writeFileSync(filePath, newContent);

console.log(`Added ${newQuestions.length} new questions for ${currentTopic}`);
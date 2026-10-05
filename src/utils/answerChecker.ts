import confetti from 'canvas-confetti';
import { Riddle } from '../types';

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"“”]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(a|an|the)\s+/, '')
    .trim();
}

// Simple Levenshtein distance for forgiving minor 1-letter typos
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion, deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function checkAnswer(userInput: string, riddle: Riddle): { isCorrect: boolean; feedback?: string } {
  const cleanedInput = normalizeString(userInput);
  if (!cleanedInput) return { isCorrect: false, feedback: 'Please type an answer first!' };

  const targets = [riddle.answer, ...riddle.acceptableAnswers].map(normalizeString);

  // Exact match with any acceptable normalized target
  if (targets.some(t => t === cleanedInput)) {
    return { isCorrect: true };
  }

  // Check if input contains the essential keyword if target is longer
  for (const target of targets) {
    if (target.length >= 4 && cleanedInput === target) {
      return { isCorrect: true };
    }
    // Allow 1 typo for words of length 5 or greater
    if (target.length >= 5 && levenshteinDistance(cleanedInput, target) <= 1) {
      return { isCorrect: true, feedback: 'Almost exact! Counted as correct!' };
    }
  }

  return { isCorrect: false };
}

export function triggerConfettiBurst() {
  try {
    // Stage 1: Left and right celebratory cannons
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7']
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7']
    });

    // Stage 2: Central fireworks starburst after a slight delay
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981']
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti animation error:', err);
  }
}

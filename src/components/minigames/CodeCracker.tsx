import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Riddle } from '../../types';
import { sound } from '../../utils/audio';
import { triggerConfettiBurst, normalizeString } from '../../utils/answerChecker';
import { RotateCcw, Heart, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface CodeCrackerProps {
  riddles: Riddle[];
  onReward: (points: number, gems: number) => void;
  onBack: () => void;
}

export const CodeCracker: React.FC<CodeCrackerProps> = ({
  riddles,
  onReward,
  onBack,
}) => {
  const [currentRiddle, setCurrentRiddle] = useState<Riddle | null>(null);
  const [cleanAnswer, setCleanAnswer] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [livesLeft, setLivesLeft] = useState<number>(6);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const setupPuzzle = () => {
    // Pick suitable single-word answer riddle
    const valid = riddles.filter((r) => {
      const c = normalizeString(r.answer);
      return c.length >= 4 && c.length <= 8 && !c.includes(' ');
    });

    const chosen = valid[Math.floor(Math.random() * valid.length)] || riddles[0];
    const word = normalizeString(chosen.answer).toUpperCase();

    setCurrentRiddle(chosen);
    setCleanAnswer(word);
    setGuessedLetters(new Set());
    setLivesLeft(6);
    setGameState('playing');
  };

  useEffect(() => {
    setupPuzzle();
  }, []);

  const handleLetterGuess = (letter: string) => {
    if (gameState !== 'playing' || guessedLetters.has(letter)) return;

    sound.playClick();
    const nextGuessed = new Set(guessedLetters);
    nextGuessed.add(letter);
    setGuessedLetters(nextGuessed);

    if (cleanAnswer.includes(letter)) {
      sound.playSuccess();
      // Check if all letters guessed
      const isComplete = cleanAnswer.split('').every((char) => nextGuessed.has(char));
      if (isComplete) {
        setGameState('won');
        sound.playLevelUp();
        triggerConfettiBurst();
        onReward(150, 6);
      }
    } else {
      sound.playWrong();
      const nextLives = livesLeft - 1;
      setLivesLeft(nextLives);
      if (nextLives <= 0) {
        setGameState('lost');
      }
    }
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  if (!currentRiddle) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
        >
          &larr; Back to Mini Games
        </button>

        {/* Lives Counter */}
        <div className="flex items-center gap-1">
          {[...Array(6)].map((_, idx) => (
            <span
              key={idx}
              className={`text-lg transition-all ${
                idx < livesLeft ? 'opacity-100 scale-100' : 'opacity-25 grayscale scale-90'
              }`}
            >
              🔍
            </span>
          ))}
        </div>
      </div>

      {/* Main Riddle Container */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl text-center">
        <div className="text-xs font-extrabold uppercase text-amber-400 mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Detective Code Cracker</span>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-6 leading-snug">
          "{currentRiddle.question}"
        </h3>

        {/* Mystery Masked Answer Slots */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {cleanAnswer.split('').map((char, idx) => {
            const isRevealed = guessedLetters.has(char) || gameState !== 'playing';
            return (
              <div
                key={idx}
                className={`w-11 h-13 md:w-13 md:h-15 rounded-2xl border-2 font-black text-2xl flex items-center justify-center transition-all ${
                  isRevealed
                    ? gameState === 'lost' && !guessedLetters.has(char)
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                      : 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 border-slate-700 text-transparent'
                }`}
              >
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Game Status Messages */}
        {gameState === 'won' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50"
          >
            <div className="text-xl font-black text-emerald-400 mb-1">
              Case Cracked! +150 Pts & 6 Gems 💎
            </div>
            <p className="text-xs text-slate-300 mb-3">
              {currentRiddle.explanation}
            </p>
            <button
              onClick={() => { sound.playClick(); setupPuzzle(); }}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-lg"
            >
              <span>Next Case</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {gameState === 'lost' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50"
          >
            <div className="text-xl font-black text-rose-400 mb-1">
              Out of Clues!
            </div>
            <p className="text-xs text-slate-300 mb-3">
              The answer was <strong className="text-amber-300">{cleanAnswer}</strong>.
            </p>
            <button
              onClick={() => { sound.playClick(); setupPuzzle(); }}
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Another Mystery</span>
            </button>
          </motion.div>
        )}

        {/* On-Screen Keyboard */}
        {gameState === 'playing' && (
          <div className="space-y-1.5 select-none">
            {keyboardRows.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1 md:gap-1.5">
                {row.map((letter) => {
                  const used = guessedLetters.has(letter);
                  const isCorrect = used && cleanAnswer.includes(letter);
                  const isWrong = used && !cleanAnswer.includes(letter);

                  return (
                    <button
                      key={letter}
                      disabled={used}
                      onClick={() => handleLetterGuess(letter)}
                      className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl font-black text-sm md:text-base border transition-all ${
                        isCorrect
                          ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300'
                          : isWrong
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 opacity-40'
                          : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-100 hover:border-amber-400 active:scale-95'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

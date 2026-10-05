import React, { useState, useEffect, useRef } from 'react';
import { Zap, Timer, Trophy, RotateCcw, CheckCircle2, XCircle, ArrowRight, Play } from 'lucide-react';
import { Riddle } from '../types';
import { checkAnswer, triggerConfettiBurst } from '../utils/answerChecker';
import { sound } from '../utils/audio';

interface SpeedRunModeProps {
  riddles: Riddle[];
  onBonusScore: (score: number) => void;
}

export const SpeedRunMode: React.FC<SpeedRunModeProps> = ({ riddles, onBonusScore }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [activeList, setActiveList] = useState<Riddle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [summary, setSummary] = useState<{ correct: number; total: number; rank: string }>({
    correct: 0,
    total: 0,
    rank: 'C'
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRush = () => {
    // Pick 10 random riddles
    const shuffled = [...riddles].sort(() => 0.5 - Math.random()).slice(0, 10);
    setActiveList(shuffled);
    setCurrentIndex(0);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setUserGuess('');
    setFeedback(null);
    setGameState('playing');
    sound.playLevelUp();
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, score]);

  const handleGameOver = () => {
    setGameState('gameover');
    sound.playVictorySound();
    triggerConfettiBurst();

    let rank = 'C';
    if (score >= 800) rank = 'S';
    else if (score >= 600) rank = 'A';
    else if (score >= 400) rank = 'B';

    setSummary({
      correct: Math.floor(score / 100),
      total: 10,
      rank
    });

    onBonusScore(score);
  };

  const currentRiddle = activeList[currentIndex];

  const handleAnswerSubmit = (guessToTest?: string) => {
    const guess = guessToTest || userGuess;
    if (!guess.trim() || !currentRiddle) return;

    const result = checkAnswer(guess, currentRiddle);

    if (result.isCorrect) {
      sound.playSuccess();
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = 100 + (newStreak > 1 ? newStreak * 15 : 0);
      setScore((prev) => prev + points);

      setTimeout(() => {
        setFeedback(null);
        setUserGuess('');
        if (currentIndex + 1 >= activeList.length) {
          handleGameOver();
        } else {
          setCurrentIndex((prev) => prev + 1);
          inputRef.current?.focus();
        }
      }, 400);
    } else {
      sound.playWrong();
      setFeedback('wrong');
      setStreak(0);

      setTimeout(() => {
        setFeedback(null);
        // Allow re-trying or skip
      }, 500);
    }
  };

  const handleSkip = () => {
    sound.playClick();
    setStreak(0);
    setUserGuess('');
    setFeedback(null);
    if (currentIndex + 1 >= activeList.length) {
      handleGameOver();
    } else {
      setCurrentIndex((prev) => prev + 1);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* IDLE SCREEN */}
      {gameState === 'idle' && (
        <div className="text-center p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/30 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-amber-500/20">
            ⚡
          </div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight mb-2">
            60-Second Speed Rush
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto mb-6">
            Test your quick-thinking agility! You have 60 seconds to crack up to 10 random riddles. Maintain a streak for multiplier points!
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-8 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-amber-400 font-black text-lg">60s</div>
              <div className="text-slate-400">Time Limit</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-emerald-400 font-black text-lg">10</div>
              <div className="text-slate-400">Riddles</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-orange-400 font-black text-lg">Combo</div>
              <div className="text-slate-400">Streak Bonus</div>
            </div>
          </div>

          <button
            onClick={startRush}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/30 transform hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Speed Rush!</span>
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && currentRiddle && (
        <div className="space-y-4">
          {/* Header Stats Bar */}
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-lg font-black text-amber-400">
                <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`} />
                <span>{timeLeft}s</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="text-xs text-slate-400 font-bold">
                Q {currentIndex + 1} / {activeList.length}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {streak > 1 && (
                <div className="text-xs font-black text-orange-400 animate-bounce">
                  🔥 {streak}x Streak!
                </div>
              )}
              <div className="text-lg font-black text-emerald-400">
                {score} pts
              </div>
            </div>
          </div>

          {/* Riddle Card */}
          <div className={`p-6 rounded-3xl border transition-all ${
            feedback === 'correct'
              ? 'bg-emerald-950/60 border-emerald-500'
              : feedback === 'wrong'
              ? 'bg-rose-950/60 border-rose-500'
              : 'bg-slate-800/90 border-slate-700'
          }`}>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              {currentRiddle.category}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-6 leading-snug">
              "{currentRiddle.question}"
            </h3>

            {/* Multiple Choice quick taps */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {currentRiddle.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSubmit(opt)}
                  className="p-3 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-left font-bold text-slate-200 text-xs md:text-sm border border-slate-600 hover:border-amber-400 transition-all flex items-center justify-between"
                >
                  <span className="truncate">{opt}</span>
                  <span className="text-slate-400 font-mono text-xs">{String.fromCharCode(65 + idx)}</span>
                </button>
              ))}
            </div>

            {/* Type guess fallback */}
            <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Or type here..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs"
              >
                Skip
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GAMEOVER SUMMARY */}
      {gameState === 'gameover' && (
        <div className="text-center p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-slate-100 mb-1">Speed Rush Finished!</h2>
          <p className="text-slate-400 text-sm mb-6">Great mental workout!</p>

          <div className="inline-block p-6 rounded-2xl bg-slate-900/80 border border-slate-700/80 mb-6 min-w-[240px]">
            <div className="text-xs uppercase font-extrabold text-slate-400 mb-1">Rank Achieved</div>
            <div className="text-5xl font-black text-amber-400 mb-3">Rank {summary.rank}</div>
            <div className="text-2xl font-black text-emerald-400 mb-1">+{score} pts</div>
            <div className="text-xs text-slate-400">Added to your total score!</div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={startRush}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

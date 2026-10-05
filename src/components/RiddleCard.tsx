import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Send, 
  Flame, 
  Volume2,
  VolumeX,
  ListFilter,
  Type,
  Grid,
  Clock,
  Shuffle
} from 'lucide-react';
import { Riddle, RiddleSolveRecord, GameSettings, Powerups } from '../types';
import { checkAnswer, triggerConfettiBurst, normalizeString } from '../utils/answerChecker';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';

interface RiddleCardProps {
  riddle: Riddle;
  currentIndex: number;
  totalRiddles: number;
  record?: RiddleSolveRecord;
  currentStreak: number;
  settings: GameSettings;
  powerups: Powerups;
  onUsePowerup: (type: keyof Powerups) => boolean;
  onSolve: (riddleId: number, hintsUsed: number, scoreEarned: number, usedMCQ: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (idx: number) => void;
}

export const RiddleCard: React.FC<RiddleCardProps> = ({
  riddle,
  currentIndex,
  totalRiddles,
  record,
  currentStreak,
  settings,
  powerups,
  onUsePowerup,
  onSolve,
  onNext,
  onPrev,
  onSelectIndex
}) => {
  const isSolved = record?.solved ?? false;

  const [inputGuess, setInputGuess] = useState('');
  const [activeHintLevel, setActiveHintLevel] = useState<number>(record?.hintsUsed ?? 0);
  const [selectedMCQ, setSelectedMCQ] = useState<string | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [revealedLetters, setRevealedLetters] = useState<number[]>([]);
  const [inputMode, setInputMode] = useState<'type' | 'mcq' | 'tiles'>(settings.defaultInputMode);
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfirmReveal, setShowConfirmReveal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Timer challenge (45s)
  const [timerSeconds, setTimerSeconds] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Letter tiles bank
  const [placedLetterTiles, setPlacedLetterTiles] = useState<string[]>([]);
  const [bankLetterTiles, setBankLetterTiles] = useState<{ id: string; char: string }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when switching riddles
  useEffect(() => {
    setInputGuess('');
    setSelectedMCQ(null);
    setEliminatedOptions([]);
    setRevealedLetters([]);
    setFeedback(null);
    setShowConfirmReveal(false);
    setActiveHintLevel(record?.hintsUsed ?? 0);
    setTimerSeconds(45);
    speech.stop();
    setIsSpeaking(false);

    // Prepare Letter Tiles
    const cleanWord = normalizeString(riddle.answer).toUpperCase();
    const letters = cleanWord.split('').filter(c => /[A-Z0-9]/.test(c));
    // Add 2 random distractors
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractors = [
      alphabet[Math.floor(Math.random() * alphabet.length)],
      alphabet[Math.floor(Math.random() * alphabet.length)],
    ];
    const all = [...letters, ...distractors]
      .sort(() => 0.5 - Math.random())
      .map((char, i) => ({ id: `${char}-${i}-${Math.random()}`, char }));
    setBankLetterTiles(all);
    setPlacedLetterTiles(new Array(letters.length).fill(''));

    if (!isSolved && inputMode === 'type') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [riddle.id, isSolved]);

  // 45-Second countdown timer if enabled
  useEffect(() => {
    if (settings.timerEnabled && !isSolved) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [settings.timerEnabled, riddle.id, isSolved]);

  // SpeechSynthesis read aloud
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      sound.playClick();
      speech.speak(riddle.question, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleUnlockHint = (level: number, isFreePass: boolean = false) => {
    if (activeHintLevel < level) {
      sound.playHint();
      setActiveHintLevel(level);
    }
  };

  // Power-Up: 50:50 Lifeline
  const handleUseFiftyFifty = () => {
    if (eliminatedOptions.length > 0) return;
    const canUse = onUsePowerup('fiftyFifty');
    if (!canUse) {
      sound.playWrong();
      setFeedback({ message: 'Need a 50:50 Lifeline! Visit Options or spin the wheel.', type: 'error' });
      return;
    }

    sound.playLevelUp();
    // Keep the correct option, eliminate 2 random incorrect options
    const correctNormalized = normalizeString(riddle.answer);
    const incorrects = riddle.options.filter(
      (opt) => normalizeString(opt) !== correctNormalized
    );
    const shuffledIncorrects = [...incorrects].sort(() => 0.5 - Math.random());
    const toEliminate = shuffledIncorrects.slice(0, 2);

    setEliminatedOptions(toEliminate);
    setInputMode('mcq');
    setFeedback({ message: '🎯 50:50 Activated! Two wrong options vanished!', type: 'success' });
  };

  // Power-Up: Letter Reveal
  const handleUseLetterReveal = () => {
    const cleanWord = normalizeString(riddle.answer).toUpperCase();
    const unrevealedIndices = cleanWord
      .split('')
      .map((_, i) => i)
      .filter((i) => !revealedLetters.includes(i));

    if (unrevealedIndices.length === 0) return;

    const canUse = onUsePowerup('letterReveal');
    if (!canUse) {
      sound.playWrong();
      setFeedback({ message: 'Need a Letter Reveal! Visit Options or spin the wheel.', type: 'error' });
      return;
    }

    sound.playHint();
    const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    const newRevealed = [...revealedLetters, randomIndex];
    setRevealedLetters(newRevealed);

    // Auto-fill into input guess if in typing mode
    const letterToReveal = cleanWord[randomIndex];
    setFeedback({ message: `🔠 Revealed Letter '${letterToReveal}' at position ${randomIndex + 1}!`, type: 'success' });
  };

  // Power-Up: Free Hint Pass
  const handleUseFreeHint = () => {
    if (activeHintLevel >= 3) return;
    const canUse = onUsePowerup('freeHint');
    if (!canUse) {
      sound.playWrong();
      setFeedback({ message: 'Need a Free Hint Pass! Visit Options or spin the wheel.', type: 'error' });
      return;
    }

    handleUnlockHint(activeHintLevel + 1, true);
    setFeedback({ message: '💡 Free Hint Pass used! No points deducted.', type: 'success' });
  };

  // Guess submission
  const handleGuessSubmit = (customGuess?: string) => {
    if (isSolved) return;

    let guess = '';
    if (customGuess) {
      guess = customGuess;
    } else if (inputMode === 'type') {
      guess = inputGuess;
    } else if (inputMode === 'mcq') {
      guess = selectedMCQ ?? '';
    } else if (inputMode === 'tiles') {
      guess = placedLetterTiles.join('');
    }

    if (!guess.trim()) {
      setFeedback({ message: 'Please enter or select a guess first!', type: 'error' });
      return;
    }

    const result = checkAnswer(guess, riddle);

    if (result.isCorrect) {
      sound.playSuccess();
      triggerConfettiBurst();

      // Points calculation
      const hintPenalty = settings.practiceMode ? 0 : activeHintLevel * 15;
      const basePoints = Math.max(30, 100 - hintPenalty);
      const streakBonus = currentStreak >= 3 ? Math.min(50, currentStreak * 10) : 0;
      const finalScore = basePoints + streakBonus;

      setFeedback({ 
        message: result.feedback || (streakBonus > 0 ? `Brilliant! +${finalScore} pts (🔥 +${streakBonus} streak bonus!)` : `Brilliant! +${finalScore} pts`), 
        type: 'success' 
      });

      onSolve(riddle.id, activeHintLevel, finalScore, inputMode === 'mcq');
    } else {
      sound.playWrong();
      setIsShaking(true);
      setFeedback({ message: 'Not quite! Think carefully, use a lifeline, or unlock a hint.', type: 'error' });
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleGiveUpAndReveal = () => {
    setShowConfirmReveal(false);
    sound.playHint();
    onSolve(riddle.id, 3, 0, false);
  };

  // Letter Tile Bank Handlers
  const handleBankTileTap = (tile: { id: string; char: string }) => {
    const emptyIndex = placedLetterTiles.findIndex((t) => !t);
    if (emptyIndex === -1) return;

    sound.playClick();
    const newPlaced = [...placedLetterTiles];
    newPlaced[emptyIndex] = tile.char;
    setPlacedLetterTiles(newPlaced);
    setBankLetterTiles((prev) => prev.filter((t) => t.id !== tile.id));

    // Auto-check if full
    if (newPlaced.every(Boolean)) {
      handleGuessSubmit(newPlaced.join(''));
    }
  };

  const handlePlacedTileTap = (index: number) => {
    const char = placedLetterTiles[index];
    if (!char) return;

    sound.playClick();
    const newPlaced = [...placedLetterTiles];
    newPlaced[index] = '';
    setPlacedLetterTiles(newPlaced);
    setBankLetterTiles((prev) => [...prev, { id: `${char}-${Math.random()}`, char }]);
  };

  // Difficulty badge styling
  const difficultyBadge = {
    'Easy': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Medium': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Brain Buster': 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  }[riddle.difficulty];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4">
      {/* Navigation & Progress Header */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Riddle #{riddle.id}</span>
          <span>•</span>
          <span className="font-medium text-slate-300">{riddle.realmName}</span>
        </div>

        <div className="flex items-center gap-3">
          {settings.timerEnabled && !isSolved && (
            <div className={`flex items-center gap-1 font-mono font-bold ${
              timerSeconds <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{timerSeconds}s</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { sound.playClick(); onPrev(); }}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Riddle"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-slate-300">
              {currentIndex + 1} / {totalRiddles}
            </span>
            <button
              onClick={() => { sound.playClick(); onNext(); }}
              disabled={currentIndex === totalRiddles - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Riddle"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Interactive Riddle Card */}
      <motion.div
        layout
        className={`relative rounded-3xl border transition-all duration-300 shadow-2xl overflow-hidden ${
          isSolved
            ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-emerald-500/40 shadow-emerald-950/40'
            : 'bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-slate-700/70 shadow-slate-950/60'
        }`}
      >
        {/* Top Status & Tags Bar */}
        <div className="px-6 pt-5 pb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${difficultyBadge}`}>
              {riddle.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/40 text-slate-300 border border-slate-700">
              {riddle.category}
            </span>
            {settings.practiceMode && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                🛡️ Practice Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Read Aloud Button */}
            <button
              onClick={handleToggleSpeak}
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Read Riddle Aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">
                {isSpeaking ? 'Reading...' : 'Listen'}
              </span>
            </button>

            {isSolved && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Solved (+{record?.scoreEarned ?? 0} pts)</span>
              </div>
            )}
          </div>
        </div>

        {/* The Riddle Question */}
        <div className="px-6 py-6 md:py-8">
          <div className="text-xs uppercase tracking-wider font-extrabold text-amber-400/90 mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>The Riddle</span>
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-100 leading-snug tracking-tight">
            "{riddle.question}"
          </h2>
        </div>

        {/* REVEALED / SOLVED STATE */}
        <AnimatePresence>
          {isSolved && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="mx-6 mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-800 to-emerald-950/60 border border-emerald-500/30 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-emerald-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Solution Revealed</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-amber-300 tracking-tight">
                    {riddle.answer}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Score Earned</div>
                  <div className="text-lg font-black text-emerald-400">
                    +{record?.scoreEarned ?? 0} pts
                  </div>
                </div>
              </div>

              {/* Educational Explanation */}
              <div className="mt-4 pt-3 border-t border-emerald-500/20 text-slate-300 text-sm leading-relaxed">
                <span className="font-bold text-emerald-300">Why it makes sense: </span>
                {riddle.explanation}
              </div>

              {/* Next riddle action */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  {record?.hintsUsed === 0 ? '🏆 Solved with 0 hints! Pure genius!' : `Used ${record?.hintsUsed} hint(s).`}
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onNext();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.03]"
                >
                  <span>Next Riddle</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UNSOLVED: Lifelines Bar */}
        {!isSolved && (
          <div className="px-6 pb-2">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Lifeline Power-Ups:</span>
              </div>

              <div className="flex items-center gap-2">
                {/* 50:50 */}
                <button
                  onClick={handleUseFiftyFifty}
                  disabled={eliminatedOptions.length > 0}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1 text-purple-300 disabled:opacity-40"
                  title="Remove 2 wrong multiple choice answers"
                >
                  <span>🎯 50:50</span>
                  <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded-full font-mono">
                    {powerups.fiftyFifty}
                  </span>
                </button>

                {/* Letter Reveal */}
                <button
                  onClick={handleUseLetterReveal}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1 text-pink-300"
                  title="Reveal a random letter"
                >
                  <span>🔠 Reveal</span>
                  <span className="text-[10px] bg-pink-500/20 px-1.5 py-0.5 rounded-full font-mono">
                    {powerups.letterReveal}
                  </span>
                </button>

                {/* Free Hint */}
                <button
                  onClick={handleUseFreeHint}
                  disabled={activeHintLevel >= 3}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1 text-yellow-300 disabled:opacity-40"
                  title="Unlock hint without point loss"
                >
                  <span>💡 Free Hint</span>
                  <span className="text-[10px] bg-yellow-500/20 px-1.5 py-0.5 rounded-full font-mono">
                    {powerups.freeHint}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UNSOLVED: Progressive Hint System */}
        {!isSolved && (
          <div className="px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Progressive Hints</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {settings.practiceMode ? 'Free in Practice Mode' : '(-15 pts per hint)'}
              </span>
            </div>

            {/* 3 Progressive Hint Toggles */}
            <div className="space-y-2">
              {/* Hint 1 */}
              <div className="rounded-xl border border-slate-700/70 bg-slate-800/50 overflow-hidden">
                {activeHintLevel >= 1 ? (
                  <div className="p-3 text-sm text-amber-200 bg-amber-500/10 flex items-start gap-2.5">
                    <span className="font-extrabold text-amber-400 text-xs shrink-0 mt-0.5">HINT 1:</span>
                    <p>{riddle.hint1}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlockHint(1)}
                    className="w-full px-4 py-2 text-xs font-bold text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 flex items-center justify-between transition-colors"
                  >
                    <span>💡 Hint 1: Conceptual Clue</span>
                    <span className="text-amber-400 text-[11px] font-mono">
                      {settings.practiceMode ? 'Free' : 'Unlock (-15 pts)'}
                    </span>
                  </button>
                )}
              </div>

              {/* Hint 2 */}
              <div className="rounded-xl border border-slate-700/70 bg-slate-800/50 overflow-hidden">
                {activeHintLevel >= 2 ? (
                  <div className="p-3 text-sm text-sky-200 bg-sky-500/10 flex items-start gap-2.5">
                    <span className="font-extrabold text-sky-400 text-xs shrink-0 mt-0.5">HINT 2:</span>
                    <p>{riddle.hint2}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlockHint(2)}
                    disabled={activeHintLevel < 1}
                    className={`w-full px-4 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                      activeHintLevel < 1 
                        ? 'text-slate-600 cursor-not-allowed bg-slate-900/40' 
                        : 'text-slate-300 hover:text-sky-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🔍 Hint 2: Word Structure & Letters</span>
                    <span className="text-sky-400 text-[11px] font-mono">
                      {activeHintLevel < 1 ? 'Locked' : settings.practiceMode ? 'Free' : 'Unlock (-15 pts)'}
                    </span>
                  </button>
                )}
              </div>

              {/* Hint 3 */}
              <div className="rounded-xl border border-slate-700/70 bg-slate-800/50 overflow-hidden">
                {activeHintLevel >= 3 ? (
                  <div className="p-3 text-sm text-purple-200 bg-purple-500/10 flex items-start gap-2.5">
                    <span className="font-extrabold text-purple-400 text-xs shrink-0 mt-0.5">HINT 3:</span>
                    <p>{riddle.hint3}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlockHint(3)}
                    disabled={activeHintLevel < 2}
                    className={`w-full px-4 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                      activeHintLevel < 2 
                        ? 'text-slate-600 cursor-not-allowed bg-slate-900/40' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🔠 Hint 3: Letter Scramble Clue</span>
                    <span className="text-purple-400 text-[11px] font-mono">
                      {activeHintLevel < 2 ? 'Locked' : settings.practiceMode ? 'Free' : 'Unlock (-15 pts)'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* UNSOLVED: Input Guessing Section with 3 Tabs */}
        {!isSolved && (
          <div className="px-6 pt-2 pb-6 border-t border-slate-700/40 bg-slate-900/40">
            {/* Input Mode Selector: Type / 4 Choices / Letter Tiles */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-300">Your Answer</div>

              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => { sound.playClick(); setInputMode('type'); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'type' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Type</span>
                </button>
                <button
                  onClick={() => { sound.playClick(); setInputMode('mcq'); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'mcq' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>4 Choices</span>
                </button>
                <button
                  onClick={() => { sound.playClick(); setInputMode('tiles'); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'tiles' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Tiles</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Typing Input */}
            {inputMode === 'type' && (
              <form onSubmit={(e) => { e.preventDefault(); handleGuessSubmit(); }} className="space-y-3">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputGuess}
                    onChange={(e) => setInputGuess(e.target.value)}
                    placeholder="Type your guess here... (e.g. towel, clock)"
                    className={`w-full px-4 py-3.5 rounded-2xl bg-slate-800/90 border text-slate-100 text-base md:text-lg font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all ${
                      isShaking ? 'border-rose-500 ring-2 ring-rose-500/40 animate-shake' : 'border-slate-700'
                    }`}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
                  >
                    <span>Check</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Mode 2: Multiple Choice Options */}
            {inputMode === 'mcq' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {riddle.options.map((option, idx) => {
                    const isEliminated = eliminatedOptions.includes(option);
                    return (
                      <button
                        key={idx}
                        disabled={isEliminated}
                        onClick={() => {
                          sound.playClick();
                          setSelectedMCQ(option);
                        }}
                        className={`p-3.5 rounded-2xl border text-left text-sm md:text-base font-bold transition-all flex items-center justify-between ${
                          isEliminated
                            ? 'opacity-25 bg-slate-900 border-dashed border-slate-700 cursor-not-allowed line-through'
                            : selectedMCQ === option
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                            : 'bg-slate-800/80 hover:bg-slate-700/60 border-slate-700 text-slate-200'
                        }`}
                      >
                        <span>{option}</span>
                        <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-xs font-mono text-slate-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleGuessSubmit()}
                  disabled={!selectedMCQ}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <span>Submit Selected Answer</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mode 3: Interactive Letter Tiles Bank */}
            {inputMode === 'tiles' && (
              <div className="space-y-4">
                {/* Placed target slots */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {placedLetterTiles.map((char, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePlacedTileTap(idx)}
                      className={`w-10 h-12 md:w-11 md:h-13 rounded-xl border-2 font-black text-lg flex items-center justify-center transition-all ${
                        char
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-800/80 border-dashed border-slate-700 text-transparent'
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>

                {/* Bank letters to tap */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-slate-800">
                  {bankLetterTiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => handleBankTileTap(tile)}
                      className="w-10 h-12 md:w-11 md:h-13 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100 font-black text-lg flex items-center justify-center shadow-md active:scale-95 transition-all"
                    >
                      {tile.char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Message */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                    feedback.type === 'error'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <span>{feedback.message}</span>
                  <button
                    onClick={() => setFeedback(null)}
                    className="underline text-[11px] ml-2 opacity-80 hover:opacity-100"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Give Up / Reveal Button */}
            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Stuck after all hints?</span>
              {showConfirmReveal ? (
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">Give up and reveal?</span>
                  <button
                    onClick={handleGiveUpAndReveal}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Yes, Reveal (0 pts)
                  </button>
                  <button
                    onClick={() => setShowConfirmReveal(false)}
                    className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { sound.playClick(); setShowConfirmReveal(true); }}
                  className="text-slate-400 hover:text-amber-400 underline transition-colors"
                >
                  Reveal Solution
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

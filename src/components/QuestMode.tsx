import React, { useState } from 'react';
import { Riddle, RiddleSolveRecord, GameSettings, Powerups } from '../types';
import { RiddleCard } from './RiddleCard';
import { sound } from '../utils/audio';
import { CHAPTER_CONFIG } from '../data/riddles';
import { isChapterUnlocked, getChapterStats, REQUIRED_CORRECT, QUESTIONS_PER_CHAPTER } from '../utils/chapterGates';
import { Lock, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

interface QuestModeProps {
  riddles: Riddle[];
  currentIndex: number;
  solvedIds: number[];
  records: Record<number, RiddleSolveRecord>;
  currentStreak: number;
  settings: GameSettings;
  powerups: Powerups;
  onUsePowerup: (type: keyof Powerups) => boolean;
  onSolve: (riddleId: number, hintsUsed: number, scoreEarned: number, usedMCQ: boolean) => void;
  onSelectIndex: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const QuestMode: React.FC<QuestModeProps> = ({
  riddles,
  currentIndex,
  solvedIds,
  records,
  currentStreak,
  settings,
  powerups,
  onUsePowerup,
  onSolve,
  onSelectIndex,
  onNext,
  onPrev,
}) => {
  const currentRiddle = riddles[currentIndex] || riddles[0];
  const [lockedModalChapter, setLockedModalChapter] = useState<number | null>(null);

  const currentChapterConfig = CHAPTER_CONFIG.find(c => c.chapter === currentRiddle.chapter) || CHAPTER_CONFIG[0];

  const handleSelectChapter = (chapterNum: number) => {
    const gate = isChapterUnlocked(chapterNum, solvedIds);
    if (!gate.unlocked) {
      sound.playWrong();
      setLockedModalChapter(chapterNum);
      return;
    }

    sound.playClick();
    const config = CHAPTER_CONFIG.find(c => c.chapter === chapterNum) || CHAPTER_CONFIG[0];
    onSelectIndex(config.range[0] - 1);
  };

  return (
    <div className="space-y-4">
      {/* 5 Chapters Navigation Carousel / Grid */}
      <div className="max-w-5xl mx-auto px-4 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {CHAPTER_CONFIG.map((chap) => {
            const gate = isChapterUnlocked(chap.chapter, solvedIds);
            const stats = getChapterStats(chap.chapter, solvedIds);
            const isCurrent = currentChapterConfig.chapter === chap.chapter;

            return (
              <button
                key={chap.chapter}
                onClick={() => handleSelectChapter(chap.chapter)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden select-none ${
                  isCurrent
                    ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/20 shadow-lg scale-102'
                    : gate.unlocked
                    ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-900/60 border-dashed border-slate-800 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-xl">{chap.icon}</span>
                  {gate.unlocked ? (
                    <span className={`font-mono text-[10px] font-black ${stats.isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {stats.solvedCount}/{QUESTIONS_PER_CHAPTER}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      <Lock className="w-3 h-3 text-rose-400" />
                      <span>Lock</span>
                    </span>
                  )}
                </div>

                <div className="text-xs font-black text-slate-200 truncate">
                  Ch. {chap.chapter}: {chap.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {chap.difficultyLabel}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-700/40">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.isComplete
                        ? 'bg-emerald-400'
                        : stats.percentage >= 50
                        ? 'bg-amber-400'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${(stats.solvedCount / QUESTIONS_PER_CHAPTER) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* 20 Questions Stepper for Current Chapter */}
        <div className="flex items-center justify-center gap-1 mt-3 py-2 overflow-x-auto no-scrollbar">
          {riddles
            .slice(currentChapterConfig.range[0] - 1, currentChapterConfig.range[1])
            .map((r, i) => {
              const rIndex = currentChapterConfig.range[0] - 1 + i;
              const isSelected = rIndex === currentIndex;
              const isSolved = solvedIds.includes(r.id);

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectIndex(rIndex);
                  }}
                  className={`min-w-[32px] h-8 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 scale-110 shadow-md shadow-amber-400/25 ring-2 ring-amber-300'
                      : isSolved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                  title={`Riddle #${r.id} (${isSolved ? 'Solved' : 'Unsolved'})`}
                >
                  {isSolved && !isSelected ? '✓' : r.id}
                </button>
              );
            })}
        </div>
      </div>

      {/* The Riddle Card */}
      <RiddleCard
        riddle={currentRiddle}
        currentIndex={currentIndex}
        totalRiddles={riddles.length}
        record={records[currentRiddle.id]}
        currentStreak={currentStreak}
        settings={settings}
        powerups={powerups}
        onUsePowerup={onUsePowerup}
        onSolve={onSolve}
        onNext={onNext}
        onPrev={onPrev}
        onSelectIndex={onSelectIndex}
      />

      {/* Chapter Gate Modal (Shown when clicking locked chapter) */}
      {lockedModalChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/50 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mb-3 shadow-inner">
              🔒
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
              Chapter {lockedModalChapter} Locked
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              95% Mastery Required to Proceed
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              To proceed to Chapter {lockedModalChapter}, you must solve at least <strong>95% ({REQUIRED_CORRECT} out of {QUESTIONS_PER_CHAPTER} questions)</strong> in Chapter {lockedModalChapter - 1}.
              <br /><br />
              <span className="text-amber-400 font-bold">
                Solve {isChapterUnlocked(lockedModalChapter, solvedIds).remainingToUnlock} more question(s) in Chapter {lockedModalChapter - 1} to unlock this gate!
              </span>
            </p>

            <button
              onClick={() => {
                sound.playClick();
                setLockedModalChapter(null);
              }}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition-colors"
            >
              Back to Active Chapter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Riddle, RiddleSolveRecord } from '../types';
import { RiddleCard } from './RiddleCard';
import { sound } from '../utils/audio';

interface QuestModeProps {
  riddles: Riddle[];
  currentIndex: number;
  solvedIds: number[];
  records: Record<number, RiddleSolveRecord>;
  currentStreak: number;
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
  onSolve,
  onSelectIndex,
  onNext,
  onPrev,
}) => {
  const currentRiddle = riddles[currentIndex];

  const realms = [
    { name: 'The Logic Forest', icon: '🌲', start: 1, end: 10, color: 'from-emerald-500/20 to-teal-500/10' },
    { name: 'The Science Lab', icon: '🔬', start: 11, end: 20, color: 'from-cyan-500/20 to-blue-500/10' },
    { name: 'The Number Nexus', icon: '📐', start: 21, end: 30, color: 'from-amber-500/20 to-orange-500/10' },
    { name: 'The Word Vault', icon: '📚', start: 31, end: 40, color: 'from-purple-500/20 to-pink-500/10' },
    { name: 'The Mystery Citadel', icon: '🏰', start: 41, end: 50, color: 'from-rose-500/20 to-red-500/10' },
  ];

  // Determine which realm the current riddle belongs to
  const currentRealm = realms.find(
    r => currentRiddle.id >= r.start && currentRiddle.id <= r.end
  ) || realms[0];

  return (
    <div className="space-y-4">
      {/* Realm Selection Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {realms.map((realm) => {
            const realmRiddles = riddles.slice(realm.start - 1, realm.end);
            const realmSolved = realmRiddles.filter(r => solvedIds.includes(r.id)).length;
            const isCurrent = currentRealm.name === realm.name;

            return (
              <button
                key={realm.name}
                onClick={() => {
                  sound.playClick();
                  onSelectIndex(realm.start - 1);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-lg">{realm.icon}</span>
                  <span className="font-mono text-[10px] font-black text-amber-400">
                    {realmSolved}/{realm.end - realm.start + 1}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">
                  {realm.name}
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(realmSolved / 10) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick horizontal stepper for the 10 riddles in current realm */}
        <div className="flex items-center justify-center gap-1.5 mt-3 py-2 overflow-x-auto">
          {riddles
            .slice(currentRealm.start - 1, currentRealm.end)
            .map((r, i) => {
              const rIndex = currentRealm.start - 1 + i;
              const isSelected = rIndex === currentIndex;
              const isSolved = solvedIds.includes(r.id);

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectIndex(rIndex);
                  }}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center ${
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
        onSolve={onSolve}
        onNext={onNext}
        onPrev={onPrev}
        onSelectIndex={onSelectIndex}
      />
    </div>
  );
};

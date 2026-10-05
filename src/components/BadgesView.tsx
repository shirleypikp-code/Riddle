import React from 'react';
import { Trophy, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { BADGES_LIST } from '../data/riddles';
import { UserStats } from '../types';

interface BadgesViewProps {
  stats: UserStats;
}

export const BadgesView: React.FC<BadgesViewProps> = ({ stats }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Achievements Hall</span>
        </div>
        <h2 className="text-3xl font-black text-slate-100 tracking-tight">
          Primary 6 Trophy Case
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Unlocked {stats.unlockedBadges.length} of {BADGES_LIST.length} Badges
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES_LIST.map((badge) => {
          const isUnlocked = stats.unlockedBadges.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isUnlocked
                  ? 'bg-gradient-to-br from-amber-950/40 via-slate-800 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/50 border-slate-700/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                  isUnlocked ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700/40 border border-slate-700'
                }`}>
                  {badge.icon}
                </div>

                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <h4 className="text-base font-black text-slate-100 mb-1">
                {badge.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

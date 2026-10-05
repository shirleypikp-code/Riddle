import React from 'react';
import { X, Sliders, Check, Sparkles, Volume2, Clock, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { GameSettings, Powerups } from '../types';
import { sound } from '../utils/audio';

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  powerups: Powerups;
  gems: number;
  onBuyPowerup: (type: keyof Powerups, cost: number) => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  powerups,
  gems,
  onBuyPowerup,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">
                Game Options & Power-Ups
              </h3>
              <p className="text-xs text-slate-400">
                Customize rules, gameplay modes, and equip lifelines.
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Lifelines & Power-Ups Shop */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Lifeline Power-Ups</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                <span>💎</span>
                <span>{gems} Gems</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* 50:50 */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between text-center">
                <div>
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs font-black text-slate-200">50:50 Lifeline</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Owned: {powerups.fiftyFifty}</div>
                </div>
                <button
                  onClick={() => onBuyPowerup('fiftyFifty', 10)}
                  disabled={gems < 10}
                  className="mt-2 py-1 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-[11px] transition-all"
                >
                  Buy (10 💎)
                </button>
              </div>

              {/* Letter Reveal */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between text-center">
                <div>
                  <div className="text-2xl mb-1">🔠</div>
                  <div className="text-xs font-black text-slate-200">Letter Reveal</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Owned: {powerups.letterReveal}</div>
                </div>
                <button
                  onClick={() => onBuyPowerup('letterReveal', 8)}
                  disabled={gems < 8}
                  className="mt-2 py-1 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-[11px] transition-all"
                >
                  Buy (8 💎)
                </button>
              </div>

              {/* Free Hint */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between text-center">
                <div>
                  <div className="text-2xl mb-1">💡</div>
                  <div className="text-xs font-black text-slate-200">Free Hint</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Owned: {powerups.freeHint}</div>
                </div>
                <button
                  onClick={() => onBuyPowerup('freeHint', 6)}
                  disabled={gems < 6}
                  className="mt-2 py-1 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-[11px] transition-all"
                >
                  Buy (6 💎)
                </button>
              </div>
            </div>
          </div>

          {/* Gameplay Options */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gameplay Modes & Filters
            </div>

            {/* Practice Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Practice Mode (Zero Point Loss)</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Unlock hints without any score penalties.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.practiceMode}
                onChange={(e) => {
                  sound.playClick();
                  onUpdateSettings({ practiceMode: e.target.checked });
                }}
                className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 45-Second Riddle Challenge Timer */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>45-Second Riddle Timer</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Adds a 45-second countdown clock to each riddle.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.timerEnabled}
                onChange={(e) => {
                  sound.playClick();
                  onUpdateSettings({ timerEnabled: e.target.checked });
                }}
                className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Default Input Preference */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-sm font-bold text-slate-200 mb-2">
                Default Input Preference
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['type', 'mcq', 'tiles'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({ defaultInputMode: mode });
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      settings.defaultInputMode === mode
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {mode === 'type' ? '⌨️ Type' : mode === 'mcq' ? '🔘 4 Choices' : '🧩 Tiles'}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-sm font-bold text-slate-200 mb-2">
                Difficulty Filter
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['All', 'Easy', 'Medium', 'Brain Buster'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({ difficultyFilter: diff });
                    }}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      settings.difficultyFilter === diff
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

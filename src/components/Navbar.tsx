import React from 'react';
import { Volume2, VolumeX, Flame, Trophy, Printer, Users, Grid, Zap, Map, Gamepad2, Sliders } from 'lucide-react';
import { ActiveTab, UserStats } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  stats: UserStats;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAvatarModal: () => void;
  onOpenPrintModal: () => void;
  onOpenOptionsModal: () => void;
  onToggleSound: () => void;
  solvedCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  activeTab,
  setActiveTab,
  onOpenAvatarModal,
  onOpenPrintModal,
  onOpenOptionsModal,
  onToggleSound,
  solvedCount,
  totalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-xl font-black text-white">
            🧩
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent">
                BrainSpark 50
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Primary 6
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              50 Interactive Brain-Teasers & Logic Quests
            </p>
          </div>
        </div>

        {/* Live Gamification Bar: Score, Gems, Streak, Solved */}
        <div className="flex items-center gap-2 md:gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
          {/* Score */}
          <div className="flex items-center gap-1.5" title="Total Points">
            <span className="text-base">🪙</span>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Score</div>
              <div className="text-sm md:text-base font-black text-amber-400 leading-none">
                {stats.totalScore.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-0.5" />

          {/* Gems Currency */}
          <div className="flex items-center gap-1.5" title="Gems for Lifelines">
            <span className="text-base">💎</span>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Gems</div>
              <div className="text-sm md:text-base font-black text-cyan-400 leading-none">
                {stats.gems ?? 0}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-0.5" />

          {/* Streak */}
          <div className="flex items-center gap-1.5" title="Current Streak">
            <Flame className={`w-4 h-4 ${stats.streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-500'}`} />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Streak</div>
              <div className="text-sm md:text-base font-black text-orange-400 leading-none">
                {stats.streak}x
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-0.5" />

          {/* Progress */}
          <div className="flex items-center gap-1.5" title="Solved Riddles">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Solved</div>
              <div className="text-sm md:text-base font-black text-emerald-400 leading-none">
                {solvedCount}/{totalCount}
              </div>
            </div>
          </div>
        </div>

        {/* Player Profile & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Options & Settings Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenOptionsModal();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors border border-slate-700/50 flex items-center gap-1.5 text-xs font-semibold"
            title="Options, Lifeline Shop & Filters"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Options</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
            title={stats.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label="Toggle sound"
          >
            {stats.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Print / Teacher Worksheet */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenPrintModal();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50 flex items-center gap-1.5 text-xs font-semibold"
            title="Classroom Printable Worksheet & Answer Key"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Avatar Profile */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAvatarModal();
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700/80 hover:border-amber-500/50 border border-slate-700 transition-all text-xs font-bold text-slate-200 shadow-sm"
            title="Change Avatar & Name"
          >
            <span className="text-lg leading-none">{stats.avatar}</span>
            <span className="max-w-[75px] truncate">{stats.playerName}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 pb-2 pt-1 flex items-center justify-start md:justify-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => { sound.playClick(); setActiveTab('quest'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'quest'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Riddle Quest</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('minigames'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'minigames'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-pink-400" />
          <span>Mini-Games (4)</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('grid'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'grid'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>All 50 Grid</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('speedrun'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'speedrun'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Speed Rush</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('duo'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'duo'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>2-Player Battle</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('badges'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'badges'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          <span>Trophies ({stats.unlockedBadges.length})</span>
        </button>
      </div>
    </header>
  );
};

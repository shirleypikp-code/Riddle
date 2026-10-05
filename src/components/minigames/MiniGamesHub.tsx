import React, { useState } from 'react';
import { Riddle, Powerups } from '../../types';
import { AnagramScramble } from './AnagramScramble';
import { MemoryMatch } from './MemoryMatch';
import { SpinWheel } from './SpinWheel';
import { CodeCracker } from './CodeCracker';
import { sound } from '../../utils/audio';
import { Sparkles, Play, Award, Zap, Shuffle, Gamepad2 } from 'lucide-react';

interface MiniGamesHubProps {
  riddles: Riddle[];
  gems: number;
  onReward: (points: number, gems: number, powerup?: keyof Powerups) => void;
  onSpendGems: (amount: number) => boolean;
}

type SelectedGame = 'hub' | 'anagram' | 'memory' | 'wheel' | 'cracker';

export const MiniGamesHub: React.FC<MiniGamesHubProps> = ({
  riddles,
  gems,
  onReward,
  onSpendGems,
}) => {
  const [activeGame, setActiveGame] = useState<SelectedGame>('hub');

  const games = [
    {
      id: 'anagram' as SelectedGame,
      title: 'Anagram Scramble',
      tag: 'Spell & Arrange',
      icon: '🧩',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      description: 'Tap & rearrange floating letter tiles to spell out the secret riddle answers!',
      reward: '+120 Pts • 5 Gems',
    },
    {
      id: 'memory' as SelectedGame,
      title: 'Riddle Memory Pairs',
      tag: 'Concentration Card Match',
      icon: '🃏',
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30',
      description: 'Flip 12 cards and match 6 riddles with their matching answers before moves run out!',
      reward: 'Up to +250 Pts • 12 Gems',
    },
    {
      id: 'wheel' as SelectedGame,
      title: 'Spin the Riddle Wheel',
      tag: 'Luck & Power-Ups',
      icon: '🎡',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
      description: 'Spin the prize wheel for free daily points, gems, and in-game lifelines!',
      reward: 'Up to 500 Pts • 20 Gems',
    },
    {
      id: 'cracker' as SelectedGame,
      title: 'Detective Code Cracker',
      tag: 'Word Sleuth',
      icon: '🕵️',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      description: 'Guess letters to decode hidden answers with 6 magnifying glasses before you run out of lives!',
      reward: '+150 Pts • 6 Gems',
    },
  ];

  if (activeGame === 'anagram') {
    return (
      <AnagramScramble
        riddles={riddles}
        onReward={(p, g) => onReward(p, g)}
        onBack={() => { sound.playClick(); setActiveGame('hub'); }}
      />
    );
  }

  if (activeGame === 'memory') {
    return (
      <MemoryMatch
        riddles={riddles}
        onReward={(p, g) => onReward(p, g)}
        onBack={() => { sound.playClick(); setActiveGame('hub'); }}
      />
    );
  }

  if (activeGame === 'wheel') {
    return (
      <SpinWheel
        gems={gems}
        onReward={(p, g, pow) => onReward(p, g, pow)}
        onSpendGems={onSpendGems}
        onBack={() => { sound.playClick(); setActiveGame('hub'); }}
      />
    );
  }

  if (activeGame === 'cracker') {
    return (
      <CodeCracker
        riddles={riddles}
        onReward={(p, g) => onReward(p, g)}
        onBack={() => { sound.playClick(); setActiveGame('hub'); }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Interactive Mini-Games Arcade</span>
        </div>
        <h2 className="text-3xl font-black text-slate-100 tracking-tight">
          Primary 6 Brain Games
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          Play 4 interactive mini-games to practice riddle-solving skills, earn bonus score, and collect gems for in-game power-ups!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => (
          <div
            key={g.id}
            className={`p-6 rounded-3xl border bg-gradient-to-br ${g.color} flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 shadow-xl`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{g.icon}</span>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {g.reward}
                </span>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {g.tag}
              </div>
              <h3 className="text-xl font-black text-slate-100 mb-2">
                {g.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {g.description}
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setActiveGame(g.id);
              }}
              className="w-full py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-current text-amber-400" />
              <span>Launch Mini-Game</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

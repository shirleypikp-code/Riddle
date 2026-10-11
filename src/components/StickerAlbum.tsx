import React, { useState } from 'react';
import { Sparkles, Lock, Star, Trophy, Filter } from 'lucide-react';
import { RIDDLES, CHAPTER_CONFIG } from '../data/riddles';
import { Riddle } from '../types';
import { sound } from '../utils/audio';

interface StickerAlbumProps {
  unlockedStickers: number[];
  onSelectRiddle: (riddleId: number) => void;
}

export const StickerAlbum: React.FC<StickerAlbumProps> = ({
  unlockedStickers,
  onSelectRiddle,
}) => {
  const [activeChapter, setActiveChapter] = useState<number | 'all'>('all');
  const [selectedStickerRiddle, setSelectedStickerRiddle] = useState<Riddle | null>(null);

  const totalCollected = unlockedStickers.length;

  const filteredRiddles = RIDDLES.filter(r => {
    if (activeChapter === 'all') return true;
    return r.chapter === activeChapter;
  });

  const rarityColor = {
    'Common': 'border-slate-700 bg-slate-800/80',
    'Rare': 'border-cyan-500/40 bg-cyan-950/20',
    'Epic': 'border-purple-500/40 bg-purple-950/20',
    'Legendary': 'border-amber-400/50 bg-gradient-to-br from-amber-950/30 via-slate-900 to-rose-950/30 shadow-lg shadow-amber-500/10',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Collectible Sticker Album</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight">
          100 Riddle Mastery Stickers
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Every correct answer awards a unique collectable badge of honor. Complete all 5 chapters to assemble the legendary set!
        </p>

        {/* Total Progress Bar */}
        <div className="max-w-md mx-auto mt-5 p-3 rounded-2xl bg-slate-800 border border-slate-700">
          <div className="flex justify-between text-xs font-black mb-1">
            <span className="text-slate-300">Stickers Collected</span>
            <span className="text-amber-400">{totalCollected} / 100</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${(totalCollected / 100) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <button
          onClick={() => { sound.playClick(); setActiveChapter('all'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeChapter === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All 100
        </button>

        {CHAPTER_CONFIG.map(c => {
          const countInChapter = unlockedStickers.filter(id => id >= c.range[0] && id <= c.range[1]).length;
          return (
            <button
              key={c.chapter}
              onClick={() => { sound.playClick(); setActiveChapter(c.chapter); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeChapter === c.chapter
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{c.icon}</span>
              <span>Ch. {c.chapter}</span>
              <span className="text-[10px] opacity-75 font-mono">({countInChapter}/20)</span>
            </button>
          );
        })}
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredRiddles.map(riddle => {
          const isUnlocked = unlockedStickers.includes(riddle.id);
          const s = riddle.sticker;

          return (
            <div
              key={riddle.id}
              onClick={() => {
                if (isUnlocked) {
                  sound.playClick();
                  setSelectedStickerRiddle(riddle);
                } else {
                  sound.playClick();
                  onSelectRiddle(riddle.id);
                }
              }}
              className={`p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col justify-between group select-none ${
                isUnlocked
                  ? `${rarityColor[s.rarity]} hover:scale-105 shadow-md`
                  : 'bg-slate-900/60 border-dashed border-slate-800 hover:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2">
                <span className="font-mono font-bold">#{riddle.id}</span>
                {isUnlocked && (
                  <span className={`px-1.5 py-0.5 rounded font-black uppercase text-[9px] ${
                    s.rarity === 'Legendary' ? 'text-amber-300 bg-amber-500/20' :
                    s.rarity === 'Epic' ? 'text-purple-300 bg-purple-500/20' :
                    s.rarity === 'Rare' ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-400'
                  }`}>
                    {s.rarity}
                  </span>
                )}
              </div>

              {/* Sticker Emoji */}
              <div className="my-2">
                {isUnlocked ? (
                  <div className="text-4xl sm:text-5xl transform group-hover:scale-110 transition-transform">
                    {s.emoji}
                  </div>
                ) : (
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-600">
                    <Lock className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div>
                <div className={`text-xs font-black line-clamp-1 ${isUnlocked ? 'text-slate-100' : 'text-slate-600'}`}>
                  {isUnlocked ? s.name : `Locked Sticker`}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {isUnlocked ? riddle.answer : `Solve Riddle #${riddle.id}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticker Detail Popup Modal */}
      {selectedStickerRiddle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl text-center">
            <div className="text-6xl my-3">{selectedStickerRiddle.sticker.emoji}</div>
            <div className="text-xs font-mono text-amber-400 font-bold mb-1">
              Riddle #{selectedStickerRiddle.id} Master Sticker
            </div>
            <h3 className="text-xl font-black text-white mb-1">
              {selectedStickerRiddle.sticker.name}
            </h3>
            <div className="text-xs text-emerald-400 font-bold mb-3">
              Answer: {selectedStickerRiddle.answer}
            </div>
            <p className="text-xs text-slate-300 italic mb-6">
              "{selectedStickerRiddle.sticker.quote}"
            </p>
            <button
              onClick={() => setSelectedStickerRiddle(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

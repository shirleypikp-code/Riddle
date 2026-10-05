import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Riddle } from '../../types';
import { sound } from '../../utils/audio';
import { triggerConfettiBurst, normalizeString } from '../../utils/answerChecker';
import { RotateCcw, Shuffle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface AnagramScrambleProps {
  riddles: Riddle[];
  onReward: (points: number, gems: number) => void;
  onBack: () => void;
}

interface LetterTile {
  id: string;
  char: string;
}

export const AnagramScramble: React.FC<AnagramScrambleProps> = ({
  riddles,
  onReward,
  onBack,
}) => {
  const [currentRiddle, setCurrentRiddle] = useState<Riddle | null>(null);
  const [targetAnswer, setTargetAnswer] = useState<string>('');
  const [bankTiles, setBankTiles] = useState<LetterTile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<(LetterTile | null)[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [round, setRound] = useState(1);

  // Initialize a round with a suitable riddle (answer length 3-10 chars without long sentences)
  const setupRound = () => {
    const candidates = riddles.filter(r => {
      const clean = normalizeString(r.answer);
      return clean.length >= 3 && clean.length <= 9 && !clean.includes(' ');
    });

    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || riddles[0];
    const cleanWord = normalizeString(chosen.answer).toUpperCase();

    const tiles: LetterTile[] = cleanWord.split('').map((char, idx) => ({
      id: `${char}-${idx}-${Math.random()}`,
      char,
    }));

    // Shuffle the tiles
    const shuffled = [...tiles].sort(() => 0.5 - Math.random());

    setCurrentRiddle(chosen);
    setTargetAnswer(cleanWord);
    setBankTiles(shuffled);
    setPlacedTiles(new Array(cleanWord.length).fill(null));
    setIsSolved(false);
  };

  useEffect(() => {
    setupRound();
  }, [round]);

  // Click on a tile in the bank to place it in the first empty slot
  const handleBankTileClick = (tile: LetterTile) => {
    if (isSolved) return;
    const emptyIndex = placedTiles.findIndex((t) => t === null);
    if (emptyIndex === -1) return;

    sound.playClick();
    const newPlaced = [...placedTiles];
    newPlaced[emptyIndex] = tile;
    setPlacedTiles(newPlaced);
    setBankTiles((prev) => prev.filter((t) => t.id !== tile.id));

    // Check if word is complete
    const filledCount = newPlaced.filter(Boolean).length;
    if (filledCount === targetAnswer.length) {
      const spelled = newPlaced.map((t) => t?.char).join('');
      if (spelled === targetAnswer) {
        // Victory!
        sound.playSuccess();
        triggerConfettiBurst();
        setIsSolved(true);
        onReward(120, 5);
      } else {
        sound.playWrong();
      }
    }
  };

  // Click on placed tile to return it to the bank
  const handlePlacedTileClick = (index: number) => {
    if (isSolved) return;
    const tile = placedTiles[index];
    if (!tile) return;

    sound.playClick();
    const newPlaced = [...placedTiles];
    newPlaced[index] = null;
    setPlacedTiles(newPlaced);
    setBankTiles((prev) => [...prev, tile]);
  };

  // Shuffle remaining bank tiles
  const handleShuffleBank = () => {
    sound.playClick();
    setBankTiles((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  // Clear placed tiles back to bank
  const handleClear = () => {
    sound.playClick();
    const allTiles = [...bankTiles, ...placedTiles.filter((t): t is LetterTile => t !== null)];
    setBankTiles(allTiles.sort(() => 0.5 - Math.random()));
    setPlacedTiles(new Array(targetAnswer.length).fill(null));
  };

  if (!currentRiddle) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
        >
          &larr; Back to Mini Games
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400">Round {round}</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
            +120 Pts & 5 Gems
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-amber-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Riddle Anagram Vault</span>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-6 leading-snug">
          "{currentRiddle.question}"
        </h3>

        {/* Target Slots */}
        <div className="mb-8">
          <div className="text-xs font-bold text-slate-400 mb-2 text-center uppercase tracking-wider">
            Tap letters to spell the solution ({targetAnswer.length} letters)
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {placedTiles.map((tile, idx) => (
              <button
                key={idx}
                onClick={() => handlePlacedTileClick(idx)}
                className={`w-11 h-13 md:w-13 md:h-15 rounded-2xl border-2 font-black text-xl md:text-2xl flex items-center justify-center transition-all ${
                  tile
                    ? isSolved
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-100 hover:bg-amber-400'
                    : 'bg-slate-900/80 border-dashed border-slate-700 text-transparent'
                }`}
              >
                {tile ? tile.char : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Letter Bank */}
        {!isSolved && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {bankTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleBankTileClick(tile)}
                  className="w-11 h-13 md:w-12 md:h-14 rounded-2xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100 font-black text-xl flex items-center justify-center shadow-md active:scale-95 transition-all"
                >
                  {tile.char}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={handleShuffleBank}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory Banner */}
        {isSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center mb-4"
          >
            <div className="text-xl font-black text-emerald-400 mb-1">
              🎉 Brilliant Spellwork!
            </div>
            <p className="text-xs text-slate-300 mb-3">
              {currentRiddle.explanation}
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setRound((prev) => prev + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Next Anagram Riddle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

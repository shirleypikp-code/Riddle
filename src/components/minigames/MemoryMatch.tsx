import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Riddle } from '../../types';
import { sound } from '../../utils/audio';
import { triggerConfettiBurst } from '../../utils/answerChecker';
import { RotateCcw, Timer, Trophy, Star } from 'lucide-react';

interface MemoryMatchProps {
  riddles: Riddle[];
  onReward: (points: number, gems: number) => void;
  onBack: () => void;
}

interface MemoryCard {
  id: string;
  pairId: number;
  type: 'question' | 'answer';
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatch: React.FC<MemoryMatchProps> = ({
  riddles,
  onReward,
  onBack,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const initGame = () => {
    // Pick 6 random riddles
    const chosen = [...riddles].sort(() => 0.5 - Math.random()).slice(0, 6);

    const deck: MemoryCard[] = [];
    chosen.forEach((r) => {
      // Question card
      deck.push({
        id: `q-${r.id}`,
        pairId: r.id,
        type: 'question',
        content: r.question,
        isFlipped: false,
        isMatched: false,
      });
      // Answer card
      deck.push({
        id: `a-${r.id}`,
        pairId: r.id,
        type: 'answer',
        content: r.answer,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    setCards(deck.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMoves(0);
    setSeconds(0);
    setIsGameOver(false);
    setIsLocked(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleCardClick = (card: MemoryCard) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    sound.playClick();

    // Flip card
    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);

      const [first, second] = newSelected;
      if (first.pairId === second.pairId && first.type !== second.type) {
        // Matched!
        setTimeout(() => {
          sound.playSuccess();
          const matchedDeck = cards.map((c) =>
            c.pairId === first.pairId ? { ...c, isFlipped: true, isMatched: true } : c
          );
          setCards(matchedDeck);
          setSelectedCards([]);
          setIsLocked(false);

          // Check if all matched
          const allMatched = matchedDeck.every((c) => c.isMatched);
          if (allMatched) {
            handleVictory();
          }
        }, 500);
      } else {
        // Mismatched: flip back after 1s
        setTimeout(() => {
          sound.playWrong();
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleVictory = () => {
    setIsGameOver(true);
    sound.playLevelUp();
    triggerConfettiBurst();

    let bonusGems = 5;
    let bonusScore = 150;
    if (moves <= 10) {
      bonusGems = 12;
      bonusScore = 250;
    } else if (moves <= 15) {
      bonusGems = 8;
      bonusScore = 200;
    }
    onReward(bonusScore, bonusGems);
  };

  const starCount = moves <= 10 ? 3 : moves <= 15 ? 2 : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
        >
          &larr; Back to Mini Games
        </button>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1 text-slate-300">
            <Timer className="w-4 h-4 text-sky-400" />
            <span>{seconds}s</span>
          </div>
          <div className="text-slate-300">
            Moves: <span className="text-amber-400">{moves}</span>
          </div>
          <button
            onClick={() => { sound.playClick(); initGame(); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reset Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-black text-slate-100">
          Riddle Pairs: Memory Match
        </h3>
        <p className="text-xs text-slate-400">
          Flip cards to match each Riddle Question with its canonical Answer!
        </p>
      </div>

      {/* Grid of 12 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => {
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched || isLocked}
              className={`h-32 sm:h-36 p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center relative select-none ${
                card.isMatched
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/20'
                  : card.isFlipped
                  ? card.type === 'question'
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-lg'
                    : 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-lg'
                  : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-500 shadow-md cursor-pointer'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <div className="w-full">
                  <div className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">
                    {card.type === 'question' ? '❓ Riddle' : '💡 Answer'}
                  </div>
                  <div
                    className={`font-bold line-clamp-3 ${
                      card.type === 'question'
                        ? 'text-xs text-slate-100'
                        : 'text-sm md:text-base text-amber-300'
                    }`}
                  >
                    {card.content}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-black text-slate-600">
                  🧩
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Modal */}
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 rounded-3xl bg-slate-800 border border-amber-500/40 text-center shadow-2xl max-w-md mx-auto"
        >
          <div className="flex justify-center gap-1.5 mb-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${
                  s <= starCount
                    ? 'text-amber-400 fill-amber-400 animate-bounce'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>

          <h4 className="text-2xl font-black text-slate-100 mb-1">
            Memory Master!
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Completed in {moves} moves and {seconds} seconds.
          </p>

          <button
            onClick={() => { sound.playClick(); initGame(); }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Another Set</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

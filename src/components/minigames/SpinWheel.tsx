import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/audio';
import { triggerConfettiBurst } from '../../utils/answerChecker';
import { Sparkles, Trophy, Award } from 'lucide-react';
import { Powerups } from '../../types';

interface SpinWheelProps {
  gems: number;
  onReward: (points: number, gems: number, powerup?: keyof Powerups) => void;
  onSpendGems: (amount: number) => boolean;
  onBack: () => void;
}

interface WheelPrize {
  label: string;
  sub: string;
  color: string;
  points: number;
  gems: number;
  powerup?: keyof Powerups;
}

const PRIZES: WheelPrize[] = [
  { label: '+100 Pts', sub: 'Score Boost', color: '#f59e0b', points: 100, gems: 0 },
  { label: '+5 Gems', sub: '💎 Gem Chest', color: '#06b6d4', points: 0, gems: 5 },
  { label: '50:50', sub: '🎯 Lifeline', color: '#8b5cf6', points: 0, gems: 0, powerup: 'fiftyFifty' },
  { label: '+250 Pts', sub: 'Big Score', color: '#10b981', points: 250, gems: 0 },
  { label: 'Letter Clue', sub: '🔠 Reveal', color: '#ec4899', points: 0, gems: 0, powerup: 'letterReveal' },
  { label: '+15 Gems', sub: '💎 Ruby Bag', color: '#3b82f6', points: 0, gems: 15 },
  { label: 'Free Hint', sub: '💡 No Penalty', color: '#eab308', points: 0, gems: 0, powerup: 'freeHint' },
  { label: 'JACKPOT!', sub: '🌟 500 Pts + 20 💎', color: '#f43f5e', points: 500, gems: 20 },
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
  gems,
  onReward,
  onSpendGems,
  onBack,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);
  const [hasFreeSpin, setHasFreeSpin] = useState(true);

  const numSlices = PRIZES.length;
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (isSpinning) return;

    if (!hasFreeSpin) {
      const success = onSpendGems(5);
      if (!success) {
        sound.playWrong();
        return;
      }
    } else {
      setHasFreeSpin(false);
    }

    setIsSpinning(true);
    setWonPrize(null);
    sound.playClick();

    // Pick a random prize index
    const prizeIndex = Math.floor(Math.random() * numSlices);
    const targetSliceCenter = prizeIndex * sliceAngle + sliceAngle / 2;

    // Spin at least 5-7 full rotations + alignment to pointer at 270 degrees (top)
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    // Top pointer is at 270 deg (or 0 with rotation)
    const finalDegree = rotation + extraRotations + (360 - (targetSliceCenter % 360)) + 90;

    setRotation(finalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const landedPrize = PRIZES[prizeIndex];
      setWonPrize(landedPrize);
      sound.playLevelUp();
      triggerConfettiBurst();
      onReward(landedPrize.points, landedPrize.gems, landedPrize.powerup);
    }, 4500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 text-center">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
        >
          &larr; Back to Mini Games
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-400">
          <span>💎</span>
          <span>{gems} Gems</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-2xl font-black text-slate-100 flex items-center justify-center gap-2">
          <span>Spin the Riddle Wheel</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h3>
        <p className="text-xs text-slate-400">
          Win points, gems, and lifeline power-ups for your riddle quest!
        </p>
      </div>

      {/* Wheel Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-4 flex items-center justify-center">
        {/* Top Pointer Needle */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-lg" />

        {/* The Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.15, 0.85, 0.25, 1] }}
          className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-2xl relative overflow-hidden bg-slate-900"
        >
          {PRIZES.map((prize, idx) => {
            const angle = idx * sliceAngle;
            return (
              <div
                key={idx}
                className="absolute top-0 left-0 w-full h-full flex justify-center items-start pt-3"
                style={{
                  transform: `rotate(${angle + sliceAngle / 2}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <div
                  className="w-20 text-center font-black text-[11px] leading-tight select-none pt-2"
                  style={{ color: prize.color }}
                >
                  <div className="drop-shadow-md">{prize.label}</div>
                  <div className="text-[9px] opacity-80 text-white font-semibold">
                    {prize.sub}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Slices dividing lines */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-40">
            {PRIZES.map((_, idx) => {
              const deg = idx * sliceAngle;
              return (
                <line
                  key={idx}
                  x1="50%"
                  y1="50%"
                  x2={`${50 + 50 * Math.cos((deg * Math.PI) / 180)}%`}
                  y2={`${50 + 50 * Math.sin((deg * Math.PI) / 180)}%`}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </motion.div>

        {/* Center Hub */}
        <div className="absolute z-10 w-16 h-16 rounded-full bg-slate-900 border-4 border-amber-400 flex items-center justify-center text-xl shadow-lg">
          🎡
        </div>
      </div>

      {/* Spin Button */}
      <div className="mt-6">
        <button
          onClick={handleSpin}
          disabled={isSpinning || (!hasFreeSpin && gems < 5)}
          className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all ${
            isSpinning
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : hasFreeSpin
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30 scale-105'
              : gems >= 5
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSpinning ? (
            'Spinning...'
          ) : hasFreeSpin ? (
            '🎁 Free Daily Spin!'
          ) : (
            `Spin for 5 Gems 💎`
          )}
        </button>

        {!hasFreeSpin && gems < 5 && (
          <p className="text-xs text-rose-400 mt-2">
            Need 5 gems to spin again! Solve riddles or play mini games to earn gems.
          </p>
        )}
      </div>

      {/* Won Prize Popup */}
      {wonPrize && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-400/50 max-w-sm mx-auto text-center"
        >
          <div className="text-xs font-bold text-amber-300 uppercase mb-1">
            🎉 Prize Awarded!
          </div>
          <div className="text-xl font-black text-white">
            {wonPrize.label}
          </div>
          <div className="text-xs text-slate-300">
            {wonPrize.sub} added to your account!
          </div>
        </motion.div>
      )}
    </div>
  );
};

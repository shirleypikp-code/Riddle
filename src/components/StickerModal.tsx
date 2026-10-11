import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Share2, Award } from 'lucide-react';
import { RiddleSticker } from '../types';
import { sound } from '../utils/audio';

interface StickerModalProps {
  sticker: RiddleSticker | null;
  riddleId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const StickerModal: React.FC<StickerModalProps> = ({
  sticker,
  riddleId,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !sticker) return null;

  const rarityBadge = {
    'Common': 'bg-slate-700 text-slate-300 border-slate-600',
    'Rare': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'Epic': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'Legendary': 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-300 border-amber-400/50 shadow-lg shadow-amber-500/20',
  }[sticker.rarity];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-400/60 p-6 text-center shadow-2xl overflow-hidden"
        >
          {/* Confetti / Aura rings */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>New Sticker Unlocked!</span>
          </div>

          {/* Sticker badge display */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-28 h-28 mx-auto my-3 rounded-3xl bg-slate-800/90 border-4 border-amber-400 flex items-center justify-center text-6xl shadow-2xl shadow-amber-500/30"
          >
            {sticker.emoji}
          </motion.div>

          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1">
            Riddle #{riddleId} Reward
          </div>

          <h3 className="text-xl font-black text-white mb-2">
            {sticker.name}
          </h3>

          <div className="inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border mb-4">
            <span className={rarityBadge}>{sticker.rarity}</span>
          </div>

          <p className="text-xs text-slate-300 italic mb-6 px-4">
            "{sticker.quote}"
          </p>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Add to Sticker Album</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

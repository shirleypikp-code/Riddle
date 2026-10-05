import React, { useState } from 'react';
import { X, Check, RotateCcw, User } from 'lucide-react';
import { AVATARS } from '../data/riddles';
import { sound } from '../utils/audio';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  currentName: string;
  onSave: (avatar: string, name: string) => void;
  onResetProgress: () => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  currentName,
  onSave,
  onResetProgress,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [nameInput, setNameInput] = useState(currentName);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playClick();
    onSave(selectedAvatar, nameInput.trim() || 'P6 Detective');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-black text-slate-100">Detective Profile</h3>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Name */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Student / Detective Name
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={20}
            placeholder="Enter your name..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Choose Avatar */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Choose Your Avatar
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedAvatar(av.emoji);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all ${
                  selectedAvatar === av.emoji
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-3xl">{av.emoji}</span>
                <span className="text-[10px] font-bold truncate max-w-full">{av.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>

        {/* Reset Progress Section */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          {confirmReset ? (
            <div className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <span className="text-rose-400 font-bold">Reset all 50 riddles?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Progress</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

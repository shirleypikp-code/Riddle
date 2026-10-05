/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RIDDLES, BADGES_LIST } from './data/riddles';
import { ActiveTab, UserStats } from './types';
import { Navbar } from './components/Navbar';
import { QuestMode } from './components/QuestMode';
import { RiddleGrid } from './components/RiddleGrid';
import { SpeedRunMode } from './components/SpeedRunMode';
import { DuoBattleMode } from './components/DuoBattleMode';
import { BadgesView } from './components/BadgesView';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
import { AvatarModal } from './components/AvatarModal';
import { sound } from './utils/audio';

const STORAGE_KEY = 'brainspark_p6_riddles_v1';

const defaultStats: UserStats = {
  playerName: 'P6 Sleuth',
  avatar: '🦉',
  totalScore: 0,
  streak: 0,
  bestStreak: 0,
  solvedIds: [],
  records: {},
  unlockedBadges: [],
  soundEnabled: true,
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultStats, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.warn('Could not read from localStorage:', err);
    }
    return defaultStats;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('quest');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Sync audio mute state
  useEffect(() => {
    sound.setMuted(!stats.soundEnabled);
  }, [stats.soundEnabled]);

  // Persist stats whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }
  }, [stats]);

  // Check and unlock badges whenever stats update
  const checkBadges = (newStats: UserStats): string[] => {
    const unlocked = [...newStats.unlockedBadges];
    let newlyAwarded = false;

    BADGES_LIST.forEach((badge) => {
      if (!unlocked.includes(badge.id)) {
        const canUnlock = badge.check(
          newStats.solvedIds.length,
          newStats.bestStreak,
          newStats.solvedIds,
          newStats.records
        );
        if (canUnlock) {
          unlocked.push(badge.id);
          newlyAwarded = true;
        }
      }
    });

    if (newlyAwarded) {
      sound.playLevelUp();
    }
    return unlocked;
  };

  const handleSolveRiddle = (
    riddleId: number,
    hintsUsed: number,
    scoreEarned: number,
    usedMCQ: boolean
  ) => {
    setStats((prev) => {
      const alreadySolved = prev.solvedIds.includes(riddleId);
      const newSolvedIds = alreadySolved ? prev.solvedIds : [...prev.solvedIds, riddleId];
      const newStreak = scoreEarned > 0 ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      const newScore = prev.totalScore + scoreEarned;

      const updatedRecords = {
        ...prev.records,
        [riddleId]: {
          solved: true,
          hintsUsed,
          attempts: (prev.records[riddleId]?.attempts ?? 0) + 1,
          scoreEarned,
          solvedAt: Date.now(),
          solvedWithMCQ: usedMCQ,
        },
      };

      const intermediateStats: UserStats = {
        ...prev,
        totalScore: newScore,
        streak: newStreak,
        bestStreak: newBestStreak,
        solvedIds: newSolvedIds,
        records: updatedRecords,
      };

      const updatedBadges = checkBadges(intermediateStats);
      return {
        ...intermediateStats,
        unlockedBadges: updatedBadges,
      };
    });
  };

  const handleBonusScore = (bonus: number) => {
    setStats((prev) => ({
      ...prev,
      totalScore: prev.totalScore + bonus,
    }));
  };

  const handleSaveProfile = (avatar: string, playerName: string) => {
    setStats((prev) => ({
      ...prev,
      avatar,
      playerName,
    }));
  };

  const handleResetProgress = () => {
    const reset = {
      ...defaultStats,
      playerName: stats.playerName,
      avatar: stats.avatar,
      soundEnabled: stats.soundEnabled,
    };
    setStats(reset);
    setCurrentIndex(0);
    sound.playClick();
  };

  const handleNextRiddle = () => {
    if (currentIndex < RIDDLES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevRiddle = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelectRiddleFromGrid = (id: number) => {
    const targetIdx = RIDDLES.findIndex((r) => r.id === id);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      setActiveTab('quest');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased selection:bg-amber-400 selection:text-slate-900">
      {/* Top App Bar & Navigation */}
      <Navbar
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onToggleSound={() =>
          setStats((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        solvedCount={stats.solvedIds.length}
        totalCount={RIDDLES.length}
      />

      {/* Main Game Screen depending on Tab */}
      <main className="flex-1 pb-16">
        {activeTab === 'quest' && (
          <QuestMode
            riddles={RIDDLES}
            currentIndex={currentIndex}
            solvedIds={stats.solvedIds}
            records={stats.records}
            currentStreak={stats.streak}
            onSolve={handleSolveRiddle}
            onSelectIndex={setCurrentIndex}
            onNext={handleNextRiddle}
            onPrev={handlePrevRiddle}
          />
        )}

        {activeTab === 'grid' && (
          <RiddleGrid
            riddles={RIDDLES}
            stats={stats}
            onSelectRiddle={handleSelectRiddleFromGrid}
          />
        )}

        {activeTab === 'speedrun' && (
          <SpeedRunMode riddles={RIDDLES} onBonusScore={handleBonusScore} />
        )}

        {activeTab === 'duo' && <DuoBattleMode riddles={RIDDLES} />}

        {activeTab === 'badges' && <BadgesView stats={stats} />}
      </main>

      {/* Footer Info & Quick Stats */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            BrainSpark 50 • Designed for Primary 6 / Grade 6 Students
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>✨ 50 Curated Riddles</span>
            <span>💡 3-Stage Hints</span>
            <span>🏆 8 Unlockable Badges</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrintWorksheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        riddles={RIDDLES}
      />

      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={stats.avatar}
        currentName={stats.playerName}
        onSave={handleSaveProfile}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RIDDLES, BADGES_LIST, CHAPTER_CONFIG } from './data/riddles';
import { ActiveTab, UserStats, GameSettings, Powerups, RiddleSticker } from './types';
import { Navbar } from './components/Navbar';
import { QuestMode } from './components/QuestMode';
import { StickerAlbum } from './components/StickerAlbum';
import { StickerModal } from './components/StickerModal';
import { FriendChallenge } from './components/FriendChallenge';
import { RiddleGrid } from './components/RiddleGrid';
import { MiniGamesHub } from './components/minigames/MiniGamesHub';
import { SpeedRunMode } from './components/SpeedRunMode';
import { DuoBattleMode } from './components/DuoBattleMode';
import { BadgesView } from './components/BadgesView';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
import { AvatarModal } from './components/AvatarModal';
import { OptionsMenu } from './components/OptionsMenu';
import { sound } from './utils/audio';
import { isChapterUnlocked, REQUIRED_CORRECT } from './utils/chapterGates';

const STORAGE_KEY = 'brainspark_p6_riddles_v3_100';

const defaultSettings: GameSettings = {
  practiceMode: false,
  defaultInputMode: 'type',
  timerEnabled: false,
  difficultyFilter: 'All',
  categoryFilter: 'All',
  readAloudAuto: false,
};

const defaultPowerups: Powerups = {
  fiftyFifty: 3,
  letterReveal: 3,
  freeHint: 3,
};

const defaultStats: UserStats = {
  playerName: 'P6 Sleuth',
  avatar: '🦉',
  totalScore: 0,
  gems: 30, // Starter gems for students
  streak: 0,
  bestStreak: 0,
  solvedIds: [],
  unlockedStickers: [],
  records: {},
  unlockedBadges: [],
  soundEnabled: true,
  powerups: defaultPowerups,
  settings: defaultSettings,
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultStats,
          ...parsed,
          unlockedStickers: parsed.unlockedStickers || parsed.solvedIds || [],
          powerups: { ...defaultPowerups, ...(parsed.powerups || {}) },
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
        };
      }
    } catch (err) {
      console.warn('Could not read from localStorage:', err);
    }
    return defaultStats;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('quest');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Sticker Reward Modal
  const [newlyUnlockedSticker, setNewlyUnlockedSticker] = useState<{
    sticker: RiddleSticker;
    riddleId: number;
  } | null>(null);

  // Check URL query parameters for incoming friend challenge on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('challenge')) {
        setActiveTab('friends');
      }
    }
  }, []);

  // Filter riddles by difficulty or category if configured in settings
  const filteredRiddles = RIDDLES.filter((r) => {
    const matchDiff =
      stats.settings.difficultyFilter === 'All' ||
      r.difficulty === stats.settings.difficultyFilter;
    const matchCat =
      stats.settings.categoryFilter === 'All' ||
      r.category === stats.settings.categoryFilter;
    return matchDiff && matchCat;
  });

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
        if (badge.isUnlocked(newStats)) {
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
    const currentRiddleData = RIDDLES.find((r) => r.id === riddleId);

    setStats((prev) => {
      const alreadySolved = prev.solvedIds.includes(riddleId);
      const newSolvedIds = alreadySolved ? prev.solvedIds : [...prev.solvedIds, riddleId];
      const newStickers = prev.unlockedStickers?.includes(riddleId)
        ? prev.unlockedStickers
        : [...(prev.unlockedStickers || []), riddleId];

      const newStreak = scoreEarned > 0 ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      const newScore = prev.totalScore + scoreEarned;
      const earnedGems = scoreEarned > 0 ? (alreadySolved ? 1 : 3) : 0;

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
        gems: (prev.gems ?? 0) + earnedGems,
        streak: newStreak,
        bestStreak: newBestStreak,
        solvedIds: newSolvedIds,
        unlockedStickers: newStickers,
        records: updatedRecords,
      };

      // Check if this answer just completed a chapter (reached 19/20)
      if (currentRiddleData && !alreadySolved) {
        const chapRiddles = RIDDLES.filter((r) => r.chapter === currentRiddleData.chapter);
        const chapSolvedNow = chapRiddles.filter((r) => newSolvedIds.includes(r.id)).length;
        if (chapSolvedNow === REQUIRED_CORRECT) {
          // Just unlocked the next chapter! Play chapter fanfare!
          setTimeout(() => sound.playChapterUnlock(), 800);
        }
      }

      // Show sticker unlock modal on first solve!
      if (!alreadySolved && currentRiddleData?.sticker) {
        setNewlyUnlockedSticker({
          sticker: currentRiddleData.sticker,
          riddleId,
        });
      }

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

  const handleMiniGameReward = (
    points: number,
    gems: number,
    powerup?: keyof Powerups
  ) => {
    setStats((prev) => {
      const newPowerups = { ...prev.powerups };
      if (powerup) {
        newPowerups[powerup] = (newPowerups[powerup] || 0) + 1;
      }
      return {
        ...prev,
        totalScore: prev.totalScore + points,
        gems: (prev.gems || 0) + gems,
        powerups: newPowerups,
      };
    });
  };

  const handleSpendGems = (amount: number): boolean => {
    if ((stats.gems || 0) >= amount) {
      setStats((prev) => ({ ...prev, gems: (prev.gems || 0) - amount }));
      return true;
    }
    return false;
  };

  const handleBuyPowerup = (type: keyof Powerups, cost: number) => {
    if (handleSpendGems(cost)) {
      sound.playLevelUp();
      setStats((prev) => ({
        ...prev,
        powerups: {
          ...prev.powerups,
          [type]: (prev.powerups[type] || 0) + 1,
        },
      }));
    } else {
      sound.playWrong();
    }
  };

  const handleUsePowerup = (type: keyof Powerups): boolean => {
    if ((stats.powerups[type] || 0) > 0) {
      setStats((prev) => ({
        ...prev,
        powerups: {
          ...prev.powerups,
          [type]: prev.powerups[type] - 1,
        },
      }));
      return true;
    }
    return false;
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setStats((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
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
    if (currentIndex < filteredRiddles.length - 1) {
      const nextRiddle = filteredRiddles[currentIndex + 1];
      // Check if next riddle is in a locked chapter
      const gate = isChapterUnlocked(nextRiddle.chapter, stats.solvedIds);
      if (!gate.unlocked) {
        sound.playWrong();
        return;
      }
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevRiddle = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelectRiddleFromGrid = (id: number) => {
    const targetIdx = filteredRiddles.findIndex((r) => r.id === id);
    if (targetIdx !== -1) {
      const targetRiddle = filteredRiddles[targetIdx];
      const gate = isChapterUnlocked(targetRiddle.chapter, stats.solvedIds);
      if (!gate.unlocked) {
        sound.playWrong();
        setActiveTab('quest');
        return;
      }
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
        onOpenOptionsModal={() => setIsOptionsModalOpen(true)}
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
            riddles={filteredRiddles.length > 0 ? filteredRiddles : RIDDLES}
            currentIndex={currentIndex}
            solvedIds={stats.solvedIds}
            records={stats.records}
            currentStreak={stats.streak}
            settings={stats.settings}
            powerups={stats.powerups}
            onUsePowerup={handleUsePowerup}
            onSolve={handleSolveRiddle}
            onSelectIndex={setCurrentIndex}
            onNext={handleNextRiddle}
            onPrev={handlePrevRiddle}
          />
        )}

        {activeTab === 'stickers' && (
          <StickerAlbum
            unlockedStickers={stats.unlockedStickers || stats.solvedIds}
            onSelectRiddle={handleSelectRiddleFromGrid}
          />
        )}

        {activeTab === 'friends' && (
          <FriendChallenge
            stats={stats}
            onReward={(pts, g) => handleMiniGameReward(pts, g)}
          />
        )}

        {activeTab === 'minigames' && (
          <MiniGamesHub
            riddles={RIDDLES}
            gems={stats.gems || 0}
            onReward={handleMiniGameReward}
            onSpendGems={handleSpendGems}
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
            BrainSpark 100 • Primary 6 Academic Riddle Quest
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>📚 5 Chapters (20 Qs each)</span>
            <span>🔒 95% Gates</span>
            <span>🌟 100 Collectible Stickers</span>
            <span>👥 Friend Multiplayer</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StickerModal
        isOpen={Boolean(newlyUnlockedSticker)}
        sticker={newlyUnlockedSticker?.sticker || null}
        riddleId={newlyUnlockedSticker?.riddleId || 1}
        onClose={() => setNewlyUnlockedSticker(null)}
      />

      <OptionsMenu
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        settings={stats.settings}
        onUpdateSettings={handleUpdateSettings}
        powerups={stats.powerups}
        gems={stats.gems || 0}
        onBuyPowerup={handleBuyPowerup}
      />

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

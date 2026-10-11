export type RiddleCategory = 
  | 'Logic & Mind Benders'
  | 'Science & Nature'
  | 'Math & Numbers'
  | 'Wordplay & Clever Puns'
  | 'Everyday Mysteries'
  | 'History & Lore'
  | 'Space & Earth';

export type RiddleDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Brain Buster';

export interface RiddleSticker {
  emoji: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  quote: string;
}

export interface Riddle {
  id: number;
  chapter: number; // 1 to 5 (20 questions per chapter)
  question: string;
  answer: string;
  acceptableAnswers: string[];
  category: RiddleCategory;
  difficulty: RiddleDifficulty;
  options: string[]; // 4 choices for multiple-choice mode
  hint1: string; // Subtle clue / category riddle
  hint2: string; // Letter length & structure
  hint3: string; // Anagram or key letter hint
  explanation: string; // Why it makes sense & educational fun fact
  realmName: string; // Chapter theme name
  sticker: RiddleSticker;
}

export interface RiddleSolveRecord {
  solved: boolean;
  hintsUsed: number;
  attempts: number;
  scoreEarned: number;
  solvedAt?: number;
  solvedWithMCQ?: boolean;
}

export interface Powerups {
  fiftyFifty: number;     // Removes 2 incorrect choices in MCQ
  letterReveal: number;   // Reveals 1 correct letter in answer box
  freeHint: number;       // Unlocks hint without point deduction
}

export interface GameSettings {
  practiceMode: boolean;       // Free hints without score deduction
  defaultInputMode: 'type' | 'mcq' | 'tiles'; // Default guessing mode
  timerEnabled: boolean;       // Optional 45s timer per riddle for challenge
  difficultyFilter: 'All' | 'Easy' | 'Medium' | 'Hard' | 'Brain Buster';
  categoryFilter: string;      // 'All' or specific category
  readAloudAuto: boolean;      // Automatically speak riddles
}

export interface UserStats {
  playerName: string;
  avatar: string;
  totalScore: number;
  gems: number;               // Currency for lifelines and store
  streak: number;
  bestStreak: number;
  solvedIds: number[];
  unlockedStickers: number[]; // Riddle IDs of unlocked stickers
  records: Record<number, RiddleSolveRecord>;
  unlockedBadges: string[];
  soundEnabled: boolean;
  powerups: Powerups;
  settings: GameSettings;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: (stats: UserStats) => boolean;
}

export interface FriendChallengeData {
  code: string;
  creatorName: string;
  riddleIds: number[];
  timeLimitSec: number;
  createdAt: number;
}

export type ActiveTab = 'quest' | 'stickers' | 'friends' | 'grid' | 'minigames' | 'speedrun' | 'duo' | 'badges';

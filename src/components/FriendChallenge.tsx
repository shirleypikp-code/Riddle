import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Users, Play, Trophy, Sparkles, ArrowRight, RotateCcw, Link2, Shield } from 'lucide-react';
import { Riddle, UserStats } from '../types';
import { RIDDLES, CHAPTER_CONFIG } from '../data/riddles';
import { sound } from '../utils/audio';
import { checkAnswer, triggerConfettiBurst } from '../utils/answerChecker';

interface FriendChallengeProps {
  stats: UserStats;
  onReward: (points: number, gems: number) => void;
}

export const FriendChallenge: React.FC<FriendChallengeProps> = ({
  stats,
  onReward,
}) => {
  const [tab, setTab] = useState<'create' | 'join' | 'battle' | 'results'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Match configuration
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [challengeDeck, setChallengeDeck] = useState<Riddle[]>([]);

  // Battle state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerStickers, setPlayerStickers] = useState<string[]>([]);
  const [friendScore, setFriendScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [battleTimeSeconds, setBattleTimeSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Check URL query parameters for incoming challenge link on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const incomingChallenge = urlParams.get('challenge');
      const incomingSeed = urlParams.get('riddles');

      if (incomingChallenge && incomingSeed) {
        try {
          const ids = incomingSeed.split(',').map(Number);
          const matchedRiddles = ids.map(id => RIDDLES.find(r => r.id === id)).filter((r): r is Riddle => Boolean(r));
          if (matchedRiddles.length > 0) {
            setRoomCode(incomingChallenge);
            setChallengeDeck(matchedRiddles);
            setTab('battle');
            startBattle(matchedRiddles);
          }
        } catch (e) {
          console.warn('Could not parse challenge URL', e);
        }
      }
    }
  }, []);

  // Timer loop during battle
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setBattleTimeSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const generateRoom = () => {
    sound.playClick();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `P6-${randomNum}`;
    setRoomCode(code);

    // Pick riddles
    let pool = RIDDLES;
    if (selectedChapter !== 'all') {
      pool = RIDDLES.filter(r => r.chapter === selectedChapter);
    }
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, questionCount);
    setChallengeDeck(shuffled);
  };

  useEffect(() => {
    generateRoom();
  }, [questionCount, selectedChapter]);

  const getShareableLink = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin + window.location.pathname;
    const riddleIds = challengeDeck.map(r => r.id).join(',');
    return `${origin}?challenge=${roomCode}&riddles=${riddleIds}`;
  };

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(getShareableLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleJoinWithCode = () => {
    sound.playClick();
    const clean = joinInput.trim().toUpperCase();
    if (!clean) return;

    // Generate deterministic riddle deck from code or random selection
    const pool = [...RIDDLES].sort(() => 0.5 - Math.random()).slice(0, 5);
    setRoomCode(clean);
    setChallengeDeck(pool);
    startBattle(pool);
  };

  const startBattle = (deck: Riddle[]) => {
    setCurrentIndex(0);
    setPlayerScore(0);
    setFriendScore(Math.floor(Math.random() * 200) + 250); // Simulated friend baseline for fun async challenge
    setPlayerStickers([]);
    setUserInput('');
    setBattleTimeSeconds(0);
    setTimerActive(true);
    setTab('battle');
    sound.playLevelUp();
  };

  const handleAnswerSubmit = (optionAnswer?: string) => {
    const activeRiddle = challengeDeck[currentIndex];
    if (!activeRiddle) return;

    const guess = optionAnswer || userInput;
    if (!guess.trim()) return;

    const result = checkAnswer(guess, activeRiddle);

    if (result.isCorrect) {
      sound.playSuccess();
      setPlayerScore(prev => prev + 100);
      setPlayerStickers(prev => [...prev, activeRiddle.sticker.emoji]);
    } else {
      sound.playWrong();
    }

    setUserInput('');

    if (currentIndex + 1 >= challengeDeck.length) {
      // Finished match!
      setTimerActive(false);
      setTab('results');
      sound.playChapterUnlock();
      triggerConfettiBurst();
      onReward(playerScore + (result.isCorrect ? 100 : 0), 10);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const currentRiddle = challengeDeck[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Top Selector Tabs */}
      {tab !== 'battle' && tab !== 'results' && (
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => { sound.playClick(); setTab('create'); }}
            className={`px-5 py-2 rounded-2xl text-xs font-black transition-all ${
              tab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Create Challenge Link
          </button>
          <button
            onClick={() => { sound.playClick(); setTab('join'); }}
            className={`px-5 py-2 rounded-2xl text-xs font-black transition-all ${
              tab === 'join'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Join with Code
          </button>
        </div>
      )}

      {/* CREATE TAB */}
      {tab === 'create' && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-800 border border-amber-500/30 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mb-3 shadow-inner">
              👥
            </div>
            <h3 className="text-2xl font-black text-white">
              Challenge a Friend
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Send a code or link to your classmate. Race on the exact same set of riddles!
            </p>
          </div>

          {/* Room Code & Link Display */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 mb-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Challenge Room Code:
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Shareable Link Box */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getShareableLink()}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-xs font-mono text-slate-400 truncate border border-slate-700 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Match Configuration */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Riddles in Match
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => { sound.playClick(); setQuestionCount(cnt); }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      questionCount === cnt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {cnt} Riddles
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Chapter Subject
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All 5 Chapters (Mixed)</option>
                {CHAPTER_CONFIG.map(c => (
                  <option key={c.chapter} value={c.chapter}>
                    Ch. {c.chapter}: {c.name} ({c.difficultyLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start playing now button */}
          <button
            onClick={() => startBattle(challengeDeck)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Match Now (Solo vs Friend Record)</span>
          </button>
        </div>
      )}

      {/* JOIN TAB */}
      {tab === 'join' && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-3xl mb-3">
            🔗
          </div>
          <h3 className="text-2xl font-black text-white mb-1">
            Join Friend's Match
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Enter the room code shared by your friend (e.g. P6-4921):
          </p>

          <div className="max-w-xs mx-auto space-y-4">
            <input
              type="text"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              placeholder="e.g. P6-1234"
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-center font-mono text-lg font-black text-amber-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />

            <button
              onClick={handleJoinWithCode}
              disabled={!joinInput.trim()}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-black text-sm transition-all shadow-lg shadow-sky-500/20"
            >
              Enter Match Room
            </button>
          </div>
        </div>
      )}

      {/* BATTLE GAMEPLAY */}
      {tab === 'battle' && currentRiddle && (
        <div className="space-y-4">
          {/* Header Status Bar */}
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-black text-amber-400">
                Match #{roomCode}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400 font-bold">
                Q {currentIndex + 1} of {challengeDeck.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-slate-300">
                ⏱️ {battleTimeSeconds}s
              </span>
              <span className="text-base font-black text-emerald-400">
                {playerScore} pts
              </span>
            </div>
          </div>

          {/* The Riddle Question Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl">
            <div className="text-xs font-extrabold uppercase text-amber-400 mb-2">
              Ch. {currentRiddle.chapter}: {currentRiddle.realmName}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-snug">
              "{currentRiddle.question}"
            </h3>

            {/* 4 Choices */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {currentRiddle.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSubmit(opt)}
                  className="p-3.5 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-left font-bold text-slate-200 text-xs md:text-sm border border-slate-600 hover:border-amber-400 transition-all flex items-center justify-between"
                >
                  <span className="truncate">{opt}</span>
                  <span className="text-slate-400 font-mono text-xs">{String.fromCharCode(65 + idx)}</span>
                </button>
              ))}
            </div>

            {/* Type guess fallback */}
            <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }} className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Or type answer here..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESULTS SCREEN */}
      {tab === 'results' && (
        <div className="p-8 rounded-3xl bg-slate-800 border border-amber-500/40 shadow-2xl text-center">
          <div className="text-6xl mb-3">🏆</div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-1">
            Challenge Concluded!
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Completed in {battleTimeSeconds} seconds.
          </p>

          {/* Duel Score Comparison */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
              <div className="text-xs font-bold text-emerald-400">You ({stats.playerName})</div>
              <div className="text-3xl font-black text-white mt-1">{playerScore}</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Stickers: {playerStickers.join(' ')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40">
              <div className="text-xs font-bold text-sky-400">Friend's Benchmark</div>
              <div className="text-3xl font-black text-white mt-1">{friendScore}</div>
              <div className="text-[10px] text-slate-400 mt-1">Target Score</div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => { sound.playClick(); setTab('create'); }}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch / New Code</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

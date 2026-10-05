import React, { useState } from 'react';
import { Users, Trophy, Play, Check, X, RotateCcw, Sparkles } from 'lucide-react';
import { Riddle } from '../types';
import { checkAnswer, triggerConfettiBurst } from '../utils/answerChecker';
import { sound } from '../utils/audio';

interface DuoBattleModeProps {
  riddles: Riddle[];
}

export const DuoBattleMode: React.FC<DuoBattleModeProps> = ({ riddles }) => {
  const [battleState, setBattleState] = useState<'setup' | 'playing' | 'winner'>('setup');
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [roundLimit, setRoundLimit] = useState<number>(6); // total rounds (3 each)
  const [currentRound, setCurrentRound] = useState(1);
  const [activeDeck, setActiveDeck] = useState<Riddle[]>([]);
  const [inputGuess, setInputGuess] = useState('');
  const [revealedResult, setRevealedResult] = useState<{
    correct: boolean;
    who: string;
    answer: string;
    explanation: string;
  } | null>(null);

  const startBattle = () => {
    const shuffled = [...riddles].sort(() => 0.5 - Math.random()).slice(0, roundLimit);
    setActiveDeck(shuffled);
    setCurrentRound(1);
    setCurrentTurn(1);
    setP1Score(0);
    setP2Score(0);
    setInputGuess('');
    setRevealedResult(null);
    setBattleState('playing');
    sound.playLevelUp();
  };

  const currentRiddle = activeDeck[currentRound - 1];

  const handleGuessSubmit = (optionSelected?: string) => {
    const guess = optionSelected || inputGuess;
    if (!guess.trim() || !currentRiddle) return;

    const result = checkAnswer(guess, currentRiddle);
    const activePlayerName = currentTurn === 1 ? p1Name : p2Name;

    if (result.isCorrect) {
      sound.playSuccess();
      if (currentTurn === 1) setP1Score(prev => prev + 100);
      else setP2Score(prev => prev + 100);

      setRevealedResult({
        correct: true,
        who: activePlayerName,
        answer: currentRiddle.answer,
        explanation: currentRiddle.explanation
      });
    } else {
      sound.playWrong();
      setRevealedResult({
        correct: false,
        who: activePlayerName,
        answer: currentRiddle.answer,
        explanation: currentRiddle.explanation
      });
    }
  };

  const handleNextTurn = () => {
    sound.playClick();
    setInputGuess('');
    setRevealedResult(null);

    if (currentRound >= roundLimit) {
      setBattleState('winner');
      sound.playSuccess();
      triggerConfettiBurst();
    } else {
      setCurrentRound(prev => prev + 1);
      setCurrentTurn(prev => (prev === 1 ? 2 : 1));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* SETUP SCREEN */}
      {battleState === 'setup' && (
        <div className="p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
            ⚔️
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-center text-slate-100 mb-2">
            2-Player Pass-and-Play Battle
          </h2>
          <p className="text-center text-sm text-slate-400 mb-6">
            Challenge your desk-mate or classmate! Take turns solving riddles on the same screen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Player 1 Setup */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/40">
              <div className="flex items-center gap-2 mb-2 font-bold text-amber-400 text-sm">
                <span>🦊 Team 1 (Gold)</span>
              </div>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                placeholder="Player 1 Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Player 2 Setup */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-sky-500/40">
              <div className="flex items-center gap-2 mb-2 font-bold text-sky-400 text-sm">
                <span>🦉 Team 2 (Cyan)</span>
              </div>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                placeholder="Player 2 Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 font-bold focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Round selector */}
          <div className="mb-8 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Match Length
            </span>
            <div className="inline-flex gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-700">
              {[6, 10, 14].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setRoundLimit(cnt)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    roundLimit === cnt
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cnt} Riddles ({cnt / 2} each)
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startBattle}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-black text-lg shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Class Battle!</span>
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {battleState === 'playing' && currentRiddle && (
        <div className="space-y-4">
          {/* Live Duel Header */}
          <div className="grid grid-cols-2 gap-3">
            {/* Player 1 Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              currentTurn === 1
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10 scale-102 ring-2 ring-amber-500/30'
                : 'bg-slate-800/60 border-slate-700 opacity-60'
            }`}>
              <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                <span>🦊 {p1Name}</span>
                {currentTurn === 1 && <span className="animate-pulse">Active Turn</span>}
              </div>
              <div className="text-2xl font-black text-slate-100 mt-1">
                {p1Score} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>

            {/* Player 2 Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              currentTurn === 2
                ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10 scale-102 ring-2 ring-sky-500/30'
                : 'bg-slate-800/60 border-slate-700 opacity-60'
            }`}>
              <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                <span>🦉 {p2Name}</span>
                {currentTurn === 2 && <span className="animate-pulse">Active Turn</span>}
              </div>
              <div className="text-2xl font-black text-slate-100 mt-1">
                {p2Score} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>
          </div>

          {/* Current Turn Question Box */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-slate-700 text-slate-300">
                Round {currentRound} of {roundLimit}
              </span>
              <span className={`text-xs font-bold ${currentTurn === 1 ? 'text-amber-400' : 'text-sky-400'}`}>
                👉 Hand device to {currentTurn === 1 ? p1Name : p2Name}
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-6 leading-snug">
              "{currentRiddle.question}"
            </h3>

            {/* If answer was submitted, show result overlay */}
            {revealedResult ? (
              <div className={`p-5 rounded-2xl border mb-4 ${
                revealedResult.correct
                  ? 'bg-emerald-950/60 border-emerald-500/40'
                  : 'bg-rose-950/60 border-rose-500/40'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {revealedResult.correct ? (
                    <span className="text-emerald-400 font-black flex items-center gap-1">
                      <Check className="w-5 h-5" /> Correct! +100 pts for {revealedResult.who}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-black flex items-center gap-1">
                      <X className="w-5 h-5" /> Incorrect! No points earned.
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-200">
                  Answer: <span className="text-amber-300">{revealedResult.answer}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {revealedResult.explanation}
                </div>

                <button
                  onClick={handleNextTurn}
                  className="mt-4 w-full py-3 rounded-xl bg-slate-200 hover:bg-white text-slate-950 font-black text-sm transition-all"
                >
                  Continue to Next Turn &rarr;
                </button>
              </div>
            ) : (
              <div>
                {/* 4 Choices */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {currentRiddle.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGuessSubmit(opt)}
                      className="p-3.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-left font-bold text-slate-200 text-xs md:text-sm border border-slate-600 hover:border-amber-400 transition-all flex items-center justify-between"
                    >
                      <span className="truncate">{opt}</span>
                      <span className="text-slate-400 font-mono text-xs">{String.fromCharCode(65 + idx)}</span>
                    </button>
                  ))}
                </div>

                {/* Freeform type */}
                <form onSubmit={(e) => { e.preventDefault(); handleGuessSubmit(); }} className="flex gap-2">
                  <input
                    type="text"
                    value={inputGuess}
                    onChange={(e) => setInputGuess(e.target.value)}
                    placeholder="Or type answer..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                  >
                    Submit
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WINNER SCREEN */}
      {battleState === 'winner' && (
        <div className="text-center p-8 md:p-12 rounded-3xl bg-slate-800 border border-purple-500/30 shadow-2xl">
          <div className="text-6xl mb-4">👑</div>
          <h2 className="text-3xl font-black text-slate-100 mb-2">Battle Concluded!</h2>

          {p1Score === p2Score ? (
            <div className="text-xl font-bold text-amber-400 mb-6">
              It's an Epic Tie! ({p1Score} - {p2Score})
            </div>
          ) : (
            <div className="text-2xl font-black text-amber-400 mb-2">
              🏆 {p1Score > p2Score ? p1Name : p2Name} Wins the Trophy!
            </div>
          )}

          <div className="flex justify-center gap-6 my-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 min-w-[120px]">
              <div className="text-amber-400 font-bold">🦊 {p1Name}</div>
              <div className="text-2xl font-black text-slate-100">{p1Score} pts</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 min-w-[120px]">
              <div className="text-sky-400 font-bold">🦉 {p2Name}</div>
              <div className="text-2xl font-black text-slate-100">{p2Score} pts</div>
            </div>
          </div>

          <button
            onClick={() => setBattleState('setup')}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Rematch</span>
          </button>
        </div>
      )}
    </div>
  );
};

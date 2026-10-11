import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Lock, Sparkles, Filter } from 'lucide-react';
import { Riddle, UserStats } from '../types';
import { CHAPTER_CONFIG } from '../data/riddles';
import { sound } from '../utils/audio';

interface RiddleGridProps {
  riddles: Riddle[];
  stats: UserStats;
  onSelectRiddle: (id: number) => void;
}

export const RiddleGrid: React.FC<RiddleGridProps> = ({
  riddles,
  stats,
  onSelectRiddle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'solved' | 'unsolved'>('all');

  const filteredRiddles = useMemo(() => {
    return riddles.filter(r => {
      // Search query check
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        r.question.toLowerCase().includes(query) || 
        r.answer.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.sticker.name.toLowerCase().includes(query) ||
        String(r.id) === query;

      // Chapter check
      const matchChapter = selectedChapter === 'all' || r.chapter === selectedChapter;

      // Solved status check
      const isSolved = stats.solvedIds.includes(r.id);
      const matchStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'solved' && isSolved) ||
        (filterStatus === 'unsolved' && !isSolved);

      return matchSearch && matchChapter && matchStatus;
    });
  }, [riddles, searchQuery, selectedChapter, filterStatus, stats.solvedIds]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header & Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>All 100 Riddles Directory</span>
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {stats.solvedIds.length} / 100 Solved
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Search by question, answer, topic, or sticker name.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100 riddles, stickers, answers..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-bold">Chapters:</span>
          </div>

          <button
            onClick={() => { sound.playClick(); setSelectedChapter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedChapter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All 5 Chapters (100)
          </button>

          {CHAPTER_CONFIG.map(chap => (
            <button
              key={chap.chapter}
              onClick={() => { sound.playClick(); setSelectedChapter(chap.chapter); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedChapter === chap.chapter
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{chap.icon}</span>
              <span>Ch. {chap.chapter}</span>
            </button>
          ))}

          <div className="h-4 w-px bg-slate-700 mx-2" />

          {/* Status filter */}
          <button
            onClick={() => { sound.playClick(); setFilterStatus('all'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              filterStatus === 'all' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { sound.playClick(); setFilterStatus('solved'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              filterStatus === 'solved' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Solved Only
          </button>
          <button
            onClick={() => { sound.playClick(); setFilterStatus('unsolved'); }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              filterStatus === 'unsolved' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unsolved Only
          </button>
        </div>
      </div>

      {/* Grid of Riddle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRiddles.map(riddle => {
          const isSolved = stats.solvedIds.includes(riddle.id);
          const record = stats.records[riddle.id];

          return (
            <button
              key={riddle.id}
              onClick={() => {
                sound.playClick();
                onSelectRiddle(riddle.id);
              }}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between h-52 select-none ${
                isSolved
                  ? 'bg-gradient-to-br from-emerald-950/40 via-slate-800 to-slate-900 border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80 hover:border-amber-400/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <span>#{riddle.id}</span>
                    <span className="text-[10px] text-slate-500 font-sans">Ch.{riddle.chapter}</span>
                  </span>

                  {isSolved ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>+{record?.scoreEarned ?? 0}</span>
                    </span>
                  ) : (
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                      riddle.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                      riddle.difficulty === 'Medium' ? 'bg-cyan-500/10 text-cyan-400' :
                      riddle.difficulty === 'Hard' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {riddle.difficulty}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 line-clamp-3 font-semibold group-hover:text-amber-200 transition-colors">
                  {riddle.question}
                </p>
              </div>

              {/* Bottom sticker & action bar */}
              <div className="pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                  <span className="text-base leading-none">{riddle.sticker.emoji}</span>
                  <span className="truncate text-[10px] font-bold">{riddle.sticker.name}</span>
                </div>

                {isSolved ? (
                  <span className="font-bold text-emerald-400 truncate max-w-[80px]">
                    {riddle.answer}
                  </span>
                ) : (
                  <span className="text-amber-400 group-hover:text-amber-300 font-bold">
                    Solve &rarr;
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredRiddles.length === 0 && (
        <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-slate-800">
          <p className="text-lg font-bold text-slate-300">No riddles matched your criteria</p>
          <p className="text-sm text-slate-500 mt-1">Try resetting the search or category filters.</p>
        </div>
      )}
    </div>
  );
};

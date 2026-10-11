import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { Riddle } from '../types';
import { sound } from '../utils/audio';

interface PrintWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  riddles: Riddle[];
}

export const PrintWorksheetModal: React.FC<PrintWorksheetModalProps> = ({
  isOpen,
  onClose,
  riddles,
}) => {
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>('all');

  if (!isOpen) return null;

  const getFilteredRiddles = () => {
    if (selectedRange === 'ch1') return riddles.slice(0, 20);
    if (selectedRange === 'ch2') return riddles.slice(20, 40);
    if (selectedRange === 'ch3') return riddles.slice(40, 60);
    if (selectedRange === 'ch4') return riddles.slice(60, 80);
    if (selectedRange === 'ch5') return riddles.slice(80, 100);
    if (selectedRange === '1-50') return riddles.slice(0, 50);
    if (selectedRange === '51-100') return riddles.slice(50, 100);
    return riddles;
  };

  const printableList = getFilteredRiddles();

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">
                Print Classroom Worksheet
              </h3>
              <p className="text-xs text-slate-400">
                Print riddle worksheets and master answer keys for Primary 6.
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls */}
        <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Selection:</span>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none"
            >
              <option value="all">All 100 Riddles</option>
              <option value="ch1">Chapter 1 (Q1 - 20) Easy</option>
              <option value="ch2">Chapter 2 (Q21 - 40) Easy-Med</option>
              <option value="ch3">Chapter 3 (Q41 - 60) Medium</option>
              <option value="ch4">Chapter 4 (Q61 - 80) Hard</option>
              <option value="ch5">Chapter 5 (Q81 - 100) Brain Buster</option>
              <option value="1-50">Chapters 1 & 2 (1-50)</option>
              <option value="51-100">Chapters 3, 4 & 5 (51-100)</option>
            </select>
          </div>

          {/* Toggle Answer Key */}
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={includeAnswers}
              onChange={(e) => setIncludeAnswers(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer"
            />
            <span>Include Teacher Answer Key & Explanations</span>
          </label>
        </div>

        {/* Preview Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans bg-slate-950/40 print-preview-area">
          <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-md printable-document">
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Primary 6 Riddle Challenge
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  {includeAnswers ? 'TEACHER MASTER KEY & EXPLANATIONS' : 'STUDENT WORKSHEET'} • 100 Progressive Brain Sparks
                </p>
              </div>
              {!includeAnswers && (
                <div className="text-xs space-y-1 font-semibold text-right">
                  <div>Name: ______________________</div>
                  <div>Class: Primary 6 ____ Date: _______</div>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4 text-sm">
              {printableList.map((r) => (
                <div key={r.id} className="pb-3 border-b border-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900 min-w-[28px]">
                      {r.id}.
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {r.question}
                      </p>

                      {includeAnswers ? (
                        <div className="mt-2 text-xs bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg">
                          <div className="font-black text-emerald-900">
                            Answer: {r.answer} ({r.sticker.name} {r.sticker.emoji})
                          </div>
                          <div className="text-emerald-800 mt-0.5">
                            Explanation: {r.explanation}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-slate-400 font-mono">
                          Answer: __________________________________________________
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <span className="text-xs text-slate-400">
            Ready to print {printableList.length} riddles
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Worksheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

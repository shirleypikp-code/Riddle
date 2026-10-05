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
  const [selectedRange, setSelectedRange] = useState<'all' | '1-25' | '26-50'>('all');

  if (!isOpen) return null;

  const getFilteredRiddles = () => {
    if (selectedRange === '1-25') return riddles.slice(0, 25);
    if (selectedRange === '26-50') return riddles.slice(25, 50);
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
                Generate printer-friendly riddle challenge sheets for Primary 6.
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
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Range:</span>
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setSelectedRange('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedRange === 'all' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                All 50
              </button>
              <button
                onClick={() => setSelectedRange('1-25')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedRange === '1-25' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                1 to 25
              </button>
              <button
                onClick={() => setSelectedRange('26-50')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedRange === '26-50' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                26 to 50
              </button>
            </div>
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
                  {includeAnswers ? 'TEACHER MASTER KEY & EXPLANATIONS' : 'STUDENT WORKSHEET'} • 50 Brain Sparks
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
            <div className="space-y-5 text-sm">
              {printableList.map((r, idx) => (
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
                            Answer: {r.answer}
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

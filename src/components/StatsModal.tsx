import React from 'react';
import { X, Trophy, Flame, Target, Award, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { ModalWrapper } from './ModalWrapper';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    totalBasras: number;
    totalJackBasras: number;
    totalEatenCards: number;
    highestMatchScore: number;
    coinsEarned: number;
  };
  playerName: string;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  playerName,
}) => {
  const winRate = stats.matchesPlayed > 0
    ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100)
    : 0;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="relative w-full flex flex-col bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        
        {/* Header */}
        <div className="relative flex flex-col items-center pt-4 pb-3 border-b border-[#5C442A] bg-gradient-to-b from-[#2A1D13] to-[#1A120B]">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#E8C288]">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black font-['El_Messiri',serif] tracking-wide">
              إحصائيات المعلم {playerName}
            </h2>
          </div>
          <p className="text-xs text-amber-200/70 mt-1">سجل إنجازاتك وبطولاتك على ترابيزة القهوة</p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            
            <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/80 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">الماتشات المكسوبة</span>
                <span className="text-lg font-black text-amber-300 font-mono tabular-nums">
                  {stats.matchesWon} <span className="text-xs font-normal text-neutral-500">من {stats.matchesPlayed}</span>
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">نسبة الفوز</span>
                <span className="text-lg font-black text-emerald-400 font-mono tabular-nums">
                  %{winRate}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-950/80 flex items-center justify-center text-red-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">إجمالي الباصرات</span>
                <span className="text-lg font-black text-red-300 font-mono tabular-nums">
                  {stats.totalBasras}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950/80 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">باصرة ولد (J)</span>
                <span className="text-lg font-black text-purple-300 font-mono tabular-nums">
                  {stats.totalJackBasras}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950/80 flex items-center justify-center text-blue-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">أعلى سكور بماتش</span>
                <span className="text-lg font-black text-blue-300 font-mono tabular-nums">
                  {stats.highestMatchScore}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-900/60 flex items-center justify-center text-amber-300">
                <span className="text-lg">🪙</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">إجمالي ذهب المعلم</span>
                <span className="text-lg font-black text-amber-400 font-mono tabular-nums">
                  {stats.coinsEarned}
                </span>
              </div>
            </div>

          </div>

          <div className="p-3 rounded-lg bg-neutral-900/70 border border-neutral-800 text-center text-xs text-neutral-400">
            أكمل اللعب واصنع باصرات متتالية لتحطيم أرقامك القياسية!
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#120C07] border-t border-[#4A3722] flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-5 py-1.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

import React from 'react';
import { X, Calendar, Gift, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { DailyChallenge } from '../types/game';
import { soundFx } from '../utils/soundEffects';
import { ModalWrapper } from './ModalWrapper';
import confetti from 'canvas-confetti';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: DailyChallenge;
  onClaimReward: () => void;
  onPlayNow: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  challenge,
  onClaimReward,
  onPlayNow,
}) => {
  const progressPct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  const canClaim = challenge.completed && !challenge.claimed;

  const handleClaim = () => {
    soundFx.playCoin();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FCD34D', '#10B981', '#FFFFFF'],
      });
    } catch {}
    onClaimReward();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="relative w-full bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        
        {/* Top Header */}
        <div className="relative flex flex-col items-center pt-5 pb-4 border-b border-[#5C442A] bg-gradient-to-b from-[#2A1D13] to-[#1A120B]">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-300">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-black font-['El_Messiri',serif] tracking-wide">
              التحدي اليومي لقهوة الباصرة
            </h2>
          </div>
          <p className="text-xs text-amber-200/70 mt-1">مهمة يومية متجددة لجمع ذهب المعلمين</p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Main Card with glowing border */}
          <div className="p-4 rounded-xl bg-[#24170E] border border-amber-600/50 shadow-inner flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 text-[10px] font-bold border border-amber-600/40 inline-block mb-1">
                  تحدي اليوم
                </span>
                <h3 className="text-lg font-black text-amber-200">
                  {challenge.title}
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {challenge.description}
                </p>
              </div>

              {/* Reward Icon badge */}
              <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-[#1A120B] border border-amber-500/60 shadow shrink-0">
                <Gift className="w-6 h-6 text-amber-400 animate-pulse" />
                <span className="font-mono font-black text-sm text-amber-300 mt-1">
                  +{challenge.rewardCoins}
                </span>
                <span className="text-[10px] text-amber-400 font-bold">ذهب 🪙</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-neutral-400">معدل التقدم:</span>
                <span className="text-amber-300 font-mono">
                  {challenge.progress} / {challenge.target} ({progressPct}%)
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-amber-900/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Timer countdown placeholder */}
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
              <Clock className="w-3.5 h-3.5 text-amber-400/80" />
              <span>يتجدد التحدي تلقائياً كل ليلة (الساعة ١٢:٠٠ منتصف الليل)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {canClaim ? (
              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-base shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all animate-bounce flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5 fill-current" />
                <span>استلم المكافأة الآن (+{challenge.rewardCoins} ذهب) 🎉</span>
              </button>
            ) : challenge.claimed ? (
              <div className="w-full py-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>تم إنجاز التحدي واستلام الجائزة بنجاح! نراك غداً 👋</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                  onPlayNow();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7D1E1E] to-[#992626] hover:from-[#8F2323] hover:to-[#B32D2D] border border-red-500/60 text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ابدأ اللعب لتنفيذ التحدي الآن 🃏</span>
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="w-full py-2 rounded-xl bg-transparent hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200 text-xs font-bold transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>

        </div>

      </div>
    </ModalWrapper>
  );
};

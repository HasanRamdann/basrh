import React, { useState } from 'react';
import { X, Check, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { Achievement, StoreItem } from '../types/game';
import { soundFx } from '../utils/soundEffects';

interface StoreAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onUpdateCoins: (newCoins: number) => void;
  achievements: Achievement[];
  onClaimAchievement: (id: string) => void;
  storeItems: StoreItem[];
  selectedFrameId: string;
  onSelectFrame: (id: string) => void;
  selectedCardBackId: string;
  onSelectCardBack: (id: string) => void;
  onUnlockItem: (id: string, price: number) => void;
  playerName: string;
  playerAvatar: string;
}

export const StoreAchievementsModal: React.FC<StoreAchievementsModalProps> = ({
  isOpen,
  onClose,
  coins,
  achievements,
  onClaimAchievement,
  storeItems,
  selectedFrameId,
  onSelectFrame,
  onUnlockItem,
  playerName,
  playerAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'store'>('achievements');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        
        {/* Header matching screenshot 4 */}
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

          <h2 className="text-2xl sm:text-3xl font-black text-[#E8C288] font-['El_Messiri',serif] tracking-wide">
            المتجر والإنجازات
          </h2>
          
          <div className="w-24 h-0.5 bg-[#8C6D46] mt-1 mb-2 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-[#E8C288] border border-[#5C442A]" />
          </div>

          {/* Coins Bar */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-600/50 shadow-inner">
            <span className="text-xl font-black text-amber-300 font-mono tabular-nums">{coins}</span>
            <span className="text-xl">🪙</span>
            <span className="text-xs text-amber-200 font-bold mr-1">ذهب المعلم</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-3 p-1 bg-[#120C07] rounded-xl border border-[#4A3722]">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('achievements');
              }}
              className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-[#8B2323] to-[#A93226] text-white shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>الإنجازات والجوائز</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('store');
              }}
              className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'store'
                  ? 'bg-gradient-to-r from-[#8B2323] to-[#A93226] text-white shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>إطارات الكوتشينة</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'achievements' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {achievements.map((ach) => {
                const progressPct = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100));
                const canClaim = ach.currentProgress >= ach.maxProgress && !ach.completed;

                return (
                  <div
                    key={ach.id}
                    className={`relative p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      ach.completed
                        ? 'bg-[#1e1710]/90 border-amber-900/40 opacity-75'
                        : canClaim
                        ? 'bg-gradient-to-br from-[#2D1E12] to-[#3B2818] border-amber-500 ring-1 ring-amber-400 shadow-lg'
                        : 'bg-[#1A120B] border-[#4A3722]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-amber-100 text-sm sm:text-base flex items-center gap-1.5">
                          {ach.completed && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                          <span>{ach.title}</span>
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{ach.description}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 bg-amber-950/70 border border-amber-700/40 px-2 py-0.5 rounded-full text-xs font-bold text-amber-300">
                        <span>+{ach.rewardCoins}</span>
                        <span>🪙</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-neutral-400 font-bold mb-1">
                        <span>التقدم</span>
                        <span className="font-mono tabular-nums">
                          {ach.currentProgress} / {ach.maxProgress}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            ach.completed
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-amber-500 to-amber-300'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {canClaim && (
                      <button
                        onClick={() => {
                          soundFx.playCoin();
                          onClaimAchievement(ach.id);
                        }}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 shadow-md transition-all animate-pulse"
                      >
                        استلام المكافأة (+{ach.rewardCoins} 🪙)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Preview */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#2A1D13] to-[#1E140C] border border-[#5C442A] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 ${
                    selectedFrameId === 'frame_royal_blue'
                      ? 'border-blue-400 ring-4 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                      : selectedFrameId === 'frame_pharaoh_gold'
                      ? 'border-amber-400 ring-4 ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                      : selectedFrameId === 'frame_vintage_wood'
                      ? 'border-amber-800 ring-2 ring-amber-900 shadow-md'
                      : 'border-neutral-500'
                  }`}>
                    <img
                      src={playerAvatar}
                      alt={playerName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-100 text-base">{playerName}</h3>
                    <p className="text-xs text-amber-300/80">المستوى: معلّم القهوة · الباصرة المصرية</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs text-neutral-400">الإطار المختار:</span>
                  <p className="text-xs font-bold text-amber-300">
                    {storeItems.find(i => i.id === selectedFrameId)?.name || 'الافتراضي'}
                  </p>
                </div>
              </div>

              {/* Frames Grid */}
              <div>
                <h4 className="text-sm font-bold text-amber-200 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>إطارات البروفايل الملكية</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {storeItems.filter(i => i.type === 'frame').map((item) => {
                    const isSelected = item.id === selectedFrameId;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#2A1D13] border-amber-400 ring-1 ring-amber-400 shadow-lg'
                            : 'bg-[#1A120B] border-[#4A3722]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center border-2 ${
                            item.id === 'frame_royal_blue'
                              ? 'border-blue-400 ring-2 ring-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                              : item.id === 'frame_pharaoh_gold'
                              ? 'border-amber-400 ring-2 ring-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : item.id === 'frame_vintage_wood'
                              ? 'border-amber-800'
                              : 'border-neutral-500'
                          }`}>
                            <span className="text-xl">👑</span>
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-neutral-100">{item.name}</h5>
                            <span className="text-xs text-amber-300/80">
                              {item.unlocked ? 'تم الفتح' : `${item.price} 🪙`}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isSelected ? (
                            <span className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                              مُفعّل ✓
                            </span>
                          ) : item.unlocked ? (
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                onSelectFrame(item.id);
                              }}
                              className="px-3 py-1 rounded-lg bg-amber-700/60 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                            >
                              استخدام
                            </button>
                          ) : (
                            <button
                              disabled={coins < item.price}
                              onClick={() => {
                                if (coins >= item.price) {
                                  soundFx.playCoin();
                                  onUnlockItem(item.id, item.price);
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                coins >= item.price
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md'
                                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              }`}
                            >
                              <span>شراء</span>
                              <span>({item.price} 🪙)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

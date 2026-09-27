import React from 'react';
import { X, Volume2, VolumeX, Eye, Zap, Flame } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundFx } from '../utils/soundEffects';
import { ModalWrapper } from './ModalWrapper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
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

          <h2 className="text-2xl font-black text-[#E8C288] font-['El_Messiri',serif] tracking-wide">
            إعدادات اللعبة
          </h2>
          <p className="text-xs text-amber-200/70 mt-1">تخصيص قواعد الباصرة وأجواء اللعب</p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Target Score */}
          <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24]">
            <label className="text-xs font-bold text-amber-300 block mb-2">
              نقاط الفوز بالماتش (Target Score):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[51, 101, 151].map((score) => (
                <button
                  key={score}
                  onClick={() => {
                    soundFx.playClick();
                    onUpdateSettings({ targetScore: score });
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    settings.targetScore === score
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  {score === 51 ? '٥١ (سريع)' : score === 101 ? '١٠١ (كلاسيكي)' : '١٥١ (طويل)'}
                </button>
              ))}
            </div>
          </div>

          {/* Jack Basra points */}
          <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 block">قيمة باصرة الولد على الولد:</span>
                <span className="text-[11px] text-neutral-400">كم نقطة يستحق الولد على الولد؟</span>
              </div>
              <div className="flex gap-1.5">
                {[10, 20].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => {
                      soundFx.playClick();
                      onUpdateSettings({ jackBasraValue: pts as 10 | 20 });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      settings.jackBasraValue === pts
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {pts} نقطة
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio volume slider */}
          <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                {settings.soundVolume > 0 ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
                <span>مستوى المؤثرات الصوتية</span>
              </span>
              <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                soundFx.setVolume(val);
                onUpdateSettings({ soundVolume: val });
              }}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-900 rounded-lg"
            />
          </div>

          {/* Show hints toggle */}
          <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-neutral-200 block">مساعد الأكل (توهج الكروت)</span>
                <span className="text-[11px] text-neutral-400">إضاءة الكروت التي يمكنك أكلها تلقائياً</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onUpdateSettings({ showHints: !settings.showHints });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.showHints ? 'bg-amber-600' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.showHints ? 'right-1' : 'right-6'
                }`}
              />
            </button>
          </div>

          {/* Fast Animations */}
          <div className="p-3 rounded-xl bg-[#24170E] border border-[#543D24] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-neutral-200 block">تسريع حركات الكروت</span>
                <span className="text-[11px] text-neutral-400">رمي وتوزيع سريع بدون تأخير</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onUpdateSettings({ fastAnimations: !settings.fastAnimations });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.fastAnimations ? 'bg-amber-600' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.fastAnimations ? 'right-1' : 'right-6'
                }`}
              />
            </button>
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
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

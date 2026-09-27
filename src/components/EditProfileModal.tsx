import React, { useState } from 'react';
import { X, Check, User, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { ModalWrapper } from './ModalWrapper';

import avatarAhmed from '../assets/images/avatar_ahmed_tarboosh_1790479644347.jpg';
import avatarRadwan from '../assets/images/avatar_hag_radwan_1790479654465.jpg';
import avatarYoung from '../assets/images/avatar_young_cairo_1790480291364.jpg';
import avatarWoman from '../assets/images/avatar_egyptian_woman_1790480302953.jpg';
import avatarMaster from '../assets/images/avatar_m_cairo_1790480870823.jpg';
import avatarModern from '../assets/images/avatar_modern_guy_1790480886004.jpg';
import avatarPharaoh from '../assets/images/avatar_pharaoh_king_1790480899802.jpg';
import avatarGirl from '../assets/images/avatar_girl_cairo_1790480910596.jpg';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatar: string;
  currentFrameId: string;
  onSaveProfile: (name: string, avatar: string) => void;
}

const AVATAR_OPTIONS = [
  { id: 'av_young', name: 'حسن الشاب الحريف', title: 'حريف الكوتشينة', src: avatarYoung },
  { id: 'av_master', name: 'المعلم كابتن القهوة', title: 'كبير القعدة', src: avatarMaster },
  { id: 'av_ahmed', name: 'أحمد أفندي (بالطربوش)', title: 'ابن البلد', src: avatarAhmed },
  { id: 'av_pharaoh', name: 'الملك الفرعوني', title: 'أسطورة النيل', src: avatarPharaoh },
  { id: 'av_modern', name: 'الشاب العصري كول', title: 'صياد البواصر', src: avatarModern },
  { id: 'av_woman', name: 'أميرة الباصرة', title: 'سيدة القصر', src: avatarWoman },
  { id: 'av_girl', name: 'نورا القاهرية', title: 'نجمة اللعبة', src: avatarGirl },
  { id: 'av_radwan', name: 'الحاج رضوان (الحكيم)', title: 'حكيم القهوة', src: avatarRadwan },
];

const POPULAR_NAME_PRESETS = [
  'حسن رمضان',
  'المعلم حسن',
  'الباشا حسن',
  'قناص البواصر',
  'حوت الكوتشينة',
  'البرنس',
  'ملك الكومي',
  'الجوكر المصري',
  'سلطان اللعب',
  'كبير القهاوي',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentAvatar,
  currentFrameId,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('من فضلك اكتب اسمك أو لقبك الحقيقي');
      return;
    }
    if (trimmed.length > 20) {
      setError('الاسم يجب ألا يتعدى 20 حرف');
      return;
    }
    soundFx.playCoin();
    onSaveProfile(trimmed, selectedAvatar);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="relative w-full bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        
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
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-black font-['El_Messiri',serif] tracking-wide">
              تعديل اسمك وبروفايلك
            </h2>
          </div>
          <p className="text-xs text-amber-200/70 mt-1">اكتب اسمك الحقيقي واصنع هيبتك على ترابيزة القهوة</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-3 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Active Preview */}
          <div className="flex items-center justify-center gap-3 bg-[#24170E] p-2.5 rounded-xl border border-[#4D351F]">
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 ${
              currentFrameId === 'frame_royal_blue'
                ? 'border-blue-400 ring-4 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                : currentFrameId === 'frame_pharaoh_gold'
                ? 'border-amber-400 ring-4 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : 'border-amber-800'
            }`}>
              <img
                src={selectedAvatar}
                alt="معاينة البروفايل"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-amber-300 font-bold block">معاينة الهوية باللعبة:</span>
              <span className="text-base sm:text-lg font-black text-white">
                {name.trim() || 'اسم اللاعب'}
              </span>
              <span className="text-[10px] text-amber-200/60 block">جاهز للمنافسة على التربيزة</span>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-200 flex items-center justify-between">
              <span>اسمك الحقيقي أو لقبك:</span>
              <span className="text-[10px] text-neutral-400 font-normal">حتى 20 حرف</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="اكتب اسمك الحقيقي هنا..."
                maxLength={20}
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#24170E] border border-[#543D24] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-neutral-100 placeholder-neutral-500 text-sm font-bold outline-none transition-all"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-400 font-bold">{error}</p>}

            {/* Quick Nickname Chips */}
            <div className="pt-1">
              <span className="text-[10px] text-amber-300/80 font-bold block mb-1">
                ألقاب وأسامي سريعة مقترحة (اضغط للاختيار):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-0.5">
                {POPULAR_NAME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setName(preset);
                      setError(null);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all font-bold ${
                      name === preset
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                        : 'bg-[#2E1D11] hover:bg-[#3D2717] text-neutral-300 border-[#5A3F26]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Avatar Selection (8 distinct avatars) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-200 flex items-center justify-between">
              <span>اختر شخصيتك (8 شخصيات مميزة):</span>
              <span className="text-[10px] text-amber-400 font-bold">
                {AVATAR_OPTIONS.find(a => a.src === selectedAvatar)?.name || ''}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatar === av.src;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedAvatar(av.src);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 group ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400 scale-105 shadow-lg'
                        : 'border-[#4A3722] hover:border-amber-600/70 opacity-75 hover:opacity-100'
                    }`}
                    title={av.name}
                  >
                    <img
                      src={av.src}
                      alt={av.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 py-0.5 px-1 text-[9px] text-center text-amber-200 truncate">
                      {av.title}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-[10px] font-black shadow">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="flex-1 py-2 sm:py-2.5 rounded-xl bg-[#24170E] hover:bg-[#332114] border border-[#543D24] text-neutral-300 font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-2 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ الاسم والشخصية</span>
            </button>
          </div>

        </form>

      </div>
    </ModalWrapper>
  );
};

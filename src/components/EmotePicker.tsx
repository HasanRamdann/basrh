import React, { useState, useRef, useEffect } from 'react';
import { Smile, Flame, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export interface EmoteItem {
  id: string;
  emoji: string;
  label: string;
  soundName?: 'click' | 'coin' | 'basra';
  category: 'joy' | 'worry' | 'laughter' | 'ahwa';
}

export const POPULAR_EGYPTIAN_EMOTES: EmoteItem[] = [
  // فرح وفخر (Joy & Pride)
  { id: 'joy_1', emoji: '🔥', label: 'ولعت!', category: 'joy' },
  { id: 'joy_2', emoji: '👑', label: 'يا معلم!', category: 'joy' },
  { id: 'joy_3', emoji: '😎', label: 'حريف!', category: 'joy' },
  { id: 'joy_4', emoji: '👏', label: 'عاش يا برنس', category: 'joy' },
  { id: 'joy_5', emoji: '🎯', label: 'باصرة!', category: 'joy' },
  { id: 'joy_6', emoji: '💪', label: 'وحش اللعبة', category: 'joy' },

  // ضحك وطقطقة (Laughter & Banter)
  { id: 'laugh_1', emoji: '😂', label: 'ههههه!', category: 'laughter' },
  { id: 'laugh_2', emoji: '🤣', label: 'مش قادر!', category: 'laughter' },
  { id: 'laugh_3', emoji: '😜', label: 'اتعلم بقى', category: 'laughter' },
  { id: 'laugh_4', emoji: '☕', label: 'شاي على حسابك', category: 'ahwa' },

  // قلق وحظ وصدمة (Worry & Shock)
  { id: 'worry_1', emoji: '😱', label: 'يا نهار!', category: 'worry' },
  { id: 'worry_2', emoji: '😅', label: 'إيه الحظ ده!', category: 'worry' },
  { id: 'worry_3', emoji: '👀', label: 'مراقبك صح', category: 'worry' },
  { id: 'worry_4', emoji: '🤦‍♂️', label: 'ضيعت الولد!', category: 'worry' },
  { id: 'worry_5', emoji: '😭', label: 'حرام كده', category: 'worry' },
  { id: 'worry_6', emoji: '⏳', label: 'الصبر طيب', category: 'worry' },
];

interface EmotePickerProps {
  onSelectEmote: (emote: EmoteItem) => void;
}

export const EmotePicker: React.FC<EmotePickerProps> = ({ onSelectEmote }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'joy' | 'laughter' | 'worry'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handlePick = (emote: EmoteItem) => {
    soundFx.playClick();
    onSelectEmote(emote);
    setIsOpen(false);
  };

  const filtered = filterCategory === 'all'
    ? POPULAR_EGYPTIAN_EMOTES
    : POPULAR_EGYPTIAN_EMOTES.filter(e => e.category === filterCategory || (filterCategory === 'laughter' && e.category === 'ahwa'));

  return (
    <div ref={containerRef} className="relative z-30 inline-block">
      {/* Trigger Button positioned directly over user avatar */}
      <button
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
        }}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all active:scale-90 ${
          isOpen
            ? 'bg-amber-400 text-neutral-950 border-amber-300 ring-2 ring-amber-400/50 scale-105'
            : 'bg-[#2A180E]/95 hover:bg-[#3D2515] text-amber-300 hover:text-white border-amber-500/80 hover:scale-105'
        }`}
        title="أرسل تعبير / ملصق فوق صورتك"
      >
        <Smile className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse" />
      </button>

      {/* Floating Emote Menu Popup */}
      {isOpen && (
        <div className="absolute bottom-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mb-2 w-64 sm:w-72 bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-[#2A180E] to-[#1A120B] border-b border-[#5C442A] flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
              <span>🎭 تعبيرات وملصقات اللعب</span>
            </span>
            <span className="text-[10px] text-amber-200/70">تظهر فوق صورتك</span>
          </div>

          {/* Categories Tab */}
          <div className="grid grid-cols-4 border-b border-[#5C442A] bg-[#120B06] text-[10px] font-bold">
            <button
              onClick={() => setFilterCategory('all')}
              className={`py-1.5 text-center transition-colors ${
                filterCategory === 'all'
                  ? 'bg-[#2A180E] text-amber-300 border-b-2 border-amber-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterCategory('joy')}
              className={`py-1.5 text-center transition-colors ${
                filterCategory === 'joy'
                  ? 'bg-[#2A180E] text-amber-300 border-b-2 border-amber-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🔥 فرح
            </button>
            <button
              onClick={() => setFilterCategory('laughter')}
              className={`py-1.5 text-center transition-colors ${
                filterCategory === 'laughter'
                  ? 'bg-[#2A180E] text-amber-300 border-b-2 border-amber-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              😂 ضحك
            </button>
            <button
              onClick={() => setFilterCategory('worry')}
              className={`py-1.5 text-center transition-colors ${
                filterCategory === 'worry'
                  ? 'bg-[#2A180E] text-amber-300 border-b-2 border-amber-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              😱 قلق
            </button>
          </div>

          {/* Emote Grid */}
          <div className="p-2 grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
            {filtered.map((emote) => (
              <button
                key={emote.id}
                onClick={() => handlePick(emote)}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#24170E] hover:bg-[#3D2515] border border-[#523A23] hover:border-amber-400 text-neutral-100 transition-all hover:scale-105 active:scale-95 group shadow-sm"
              >
                <span className="text-2xl mb-1 transform group-hover:scale-125 transition-transform">
                  {emote.emoji}
                </span>
                <span className="text-[10px] font-bold text-amber-200 text-center truncate w-full">
                  {emote.label}
                </span>
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

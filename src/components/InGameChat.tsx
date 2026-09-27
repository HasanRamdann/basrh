import React, { useState } from 'react';
import { MessageSquare, Smile, X, Send } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface InGameChatProps {
  onSendMessage: (text: string) => void;
  onSendSticker: (emoji: string, label: string) => void;
}

const QUICK_MESSAGES = [
  'يا مساء الفل يا معلّم! ☕',
  'الباصرة دي جاية جاية! 🎯',
  'عاش اللعب يا حريف! 👏',
  'يا نهار أبيض على الحظ! 😅',
  'الصبر طيب يا صاحبي ⏳',
  'الولد القشاش في جيبي! 👑',
  'متستعجلش.. اللعبة لسه طويلة! 🃏',
  'هات شاي يا معلّم على حساب الخسران! 🫖',
];

const STICKERS = [
  { emoji: '🔥', label: 'ولعت!' },
  { emoji: '👑', label: 'الملك' },
  { emoji: '😎', label: 'حريف' },
  { emoji: '☕', label: 'شاي' },
  { emoji: '🎯', label: 'باصرة' },
  { emoji: '😂', label: 'ضحك' },
  { emoji: '👏', label: 'عاش' },
  { emoji: '😱', label: 'صدمة' },
  { emoji: '💪', label: 'جامد' },
  { emoji: '👀', label: 'مراقبك' },
  { emoji: '💸', label: 'فلست' },
  { emoji: '🏆', label: 'كأس' },
];

export const InGameChat: React.FC<InGameChatProps> = ({
  onSendMessage,
  onSendSticker,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'phrases' | 'stickers' | 'custom'>('phrases');
  const [customText, setCustomText] = useState('');

  const handleSendPhrase = (phrase: string) => {
    soundFx.playClick();
    onSendMessage(phrase);
    setIsOpen(false);
  };

  const handleSendSticker = (emoji: string, label: string) => {
    soundFx.playClick();
    onSendSticker(emoji, label);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customText.trim();
    if (!trimmed) return;
    soundFx.playClick();
    onSendMessage(trimmed);
    setCustomText('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A120B]/90 border border-[#5C442A] text-amber-300 hover:text-white hover:border-amber-400 text-xs font-bold shadow-lg transition-all active:scale-95"
        title="رسائل وملصقات سريعة أثناء اللعب"
      >
        <MessageSquare className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">شات وملصقات</span>
        <Smile className="w-3.5 h-3.5 text-amber-300" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 sm:right-auto sm:left-0 z-50 w-72 sm:w-84 bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#2A1D13] border-b border-[#5C442A]">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black">
              <span>دردشة القهوة والملصقات</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#5C442A] bg-[#160E07] text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('phrases')}
              className={`flex-1 py-1.5 text-center transition-colors ${
                activeTab === 'phrases'
                  ? 'bg-[#2A1D13] text-amber-300 border-b-2 border-amber-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              💬 جمل القهوة
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex-1 py-1.5 text-center transition-colors ${
                activeTab === 'stickers'
                  ? 'bg-[#2A1D13] text-amber-300 border-b-2 border-amber-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🎭 ملصقات
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 text-center transition-colors ${
                activeTab === 'custom'
                  ? 'bg-[#2A1D13] text-amber-300 border-b-2 border-amber-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              ✍️ رسالة خاصة
            </button>
          </div>

          {/* Content Area */}
          <div className="p-2.5 max-h-56 overflow-y-auto">
            {activeTab === 'phrases' && (
              <div className="flex flex-col gap-1.5">
                {QUICK_MESSAGES.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPhrase(msg)}
                    className="w-full text-right px-3 py-2 rounded-lg bg-[#24170E] hover:bg-[#382315] border border-[#4D351F] text-neutral-200 text-xs font-bold transition-colors active:scale-98"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'stickers' && (
              <div className="grid grid-cols-4 gap-2">
                {STICKERS.map((stk, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendSticker(stk.emoji, stk.label)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#24170E] hover:bg-[#3D2515] border border-[#523A23] hover:border-amber-500/70 transition-all hover:scale-105"
                  >
                    <span className="text-2xl mb-1">{stk.emoji}</span>
                    <span className="text-[10px] text-amber-200 font-bold">{stk.label}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'custom' && (
              <form onSubmit={handleCustomSubmit} className="space-y-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="اكتب رسالتك للخصم..."
                  maxLength={40}
                  className="w-full px-3 py-2 rounded-xl bg-[#24170E] border border-[#543D24] focus:border-amber-400 text-neutral-100 placeholder-neutral-500 text-xs font-bold outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الرسالة</span>
                </button>
              </form>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

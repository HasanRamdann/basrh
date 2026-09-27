import React from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { ModalWrapper } from './ModalWrapper';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="relative w-full max-h-[90vh] flex flex-col bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        
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
            <BookOpen className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-black font-['El_Messiri',serif] tracking-wide">
              دستور وقوانين الباصرة المصرية
            </h2>
          </div>
          <p className="text-xs text-amber-200/70 mt-1">كوتشينة على أصولها كما تُلعب في قهاوي مصر الشعبية</p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm leading-relaxed">
          
          {/* Section 1: The Basics */}
          <div className="p-4 rounded-xl bg-[#24170E] border border-[#543D24]">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>١. توزيع الكوتشينة وبداية اللعبة</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-300 pr-1">
              <li>تُلعب اللعبة بكامل كروت الكوتشينة (٥٢ ورقة).</li>
              <li>في بداية الصكة، يُرمى على الأرضية <strong>٤ كروت مكشوفة</strong>. إذا ظهر ولد (J) أو سبعة كومي (♦7) يتم إعادتها للكوتشينة فوراً لضمان العدالة.</li>
              <li>يأخذ كل لاعب <strong>٤ كروت</strong> في يده. عند نفادها، يتم توزيع ٤ كروت أخرى من الكوتشينة حتى ينتهي الورق بالكامل (٦ جولات توزيع).</li>
            </ul>
          </div>

          {/* Section 2: Eating Rules */}
          <div className="p-4 rounded-xl bg-[#24170E] border border-[#543D24]">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>٢. قواعد "الأكل" (Akl)</span>
            </h3>
            <p className="text-neutral-300 mb-2">
              عند لعب ورقة من يدك، يمكنك أن تأكل كروت الأرض بالطرق التالية معاً:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#180E07] border border-amber-900/40">
                <span className="font-bold text-amber-200 block text-xs mb-1">أكل المتطابق (نفس الرقم):</span>
                <span className="text-xs text-neutral-400">إذا لعبت ٨، تأكل أي ورقة ٨ على الأرض.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#180E07] border border-amber-900/40">
                <span className="font-bold text-amber-200 block text-xs mb-1">أكل المجموع (Sum):</span>
                <span className="text-xs text-neutral-400">إذا لعبت ٨، تأكل (٥ + ٣) أو (٤ + ٤) أو (٦ + ٢) معاً!</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#180E07] border border-amber-900/40">
                <span className="font-bold text-amber-200 block text-xs mb-1">الولد القشاش (J):</span>
                <span className="text-xs text-neutral-400">الولد يمسح ويقش كل الكروت الموجودة على الأرض بدون استثناء.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#180E07] border border-amber-900/40">
                <span className="font-bold text-amber-200 block text-xs mb-1">السبعة الكومي (♦7):</span>
                <span className="text-xs text-neutral-400">السبعة الديناري هي ورقة سحرية، تقش كل الكروت مثل الولد!</span>
              </div>
            </div>
            <p className="text-xs text-amber-300/80 mt-2">
              * ملاحظة: البنات (Q) والشايب (K) لا تأكل بالمجموع أبداً؛ البنت تأكل البنت والشايب يأكل الشايب فقط.
            </p>
          </div>

          {/* Section 3: Basra Rules */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#2F1410] to-[#1E0E0A] border border-red-800/60">
            <h3 className="text-base font-bold text-red-300 flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-red-400" />
              <span>٣. الباصرة (Basra) - قمة المتعة!</span>
            </h3>
            <p className="text-neutral-300 mb-2">
              تحدث "الباصرة" عندما تأكل وتترك الترابيزة <strong>فارغة تماماً</strong> من أي ورق:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-300 text-xs pr-1">
              <li><strong>باصرة عادية (+١٠ نقاط):</strong> عندما تكون الأرض بها ورقة واحدة وتلعب مثلها (مثلاً ٦ على ٦)، أو كروت مجموعها يساوي ورقتك وتمسح الأرض.</li>
              <li><strong>باصرة الولد على الولد (+٢٠ نقطة):</strong> إذا رُمي ولد وحيد على الأرض ولعبت ولداً فوقه، فهذه باصرة كبرى! (أما الولد على عدة كروت فقش فقط).</li>
              <li><strong>باصرة السبعة الكومي (+١٠ أو ٢٠ نقطة):</strong> مسح الأرض بسبعة الكومي على كارت وحيد.</li>
            </ul>
          </div>

          {/* Section 4: Final Scoring */}
          <div className="p-4 rounded-xl bg-[#24170E] border border-[#543D24]">
            <h3 className="text-base font-bold text-amber-300 mb-2">
              ٤. حساب النقاط والفوز بالصكة
            </h3>
            <div className="space-y-2 text-xs text-neutral-300">
              <p>
                <strong>الكومة (اللمة الكبيرة - ٣٠ نقطة):</strong> في نهاية الكوتشينة (بعد لعب الـ ٥٢ ورقة)، يحسب كل لاعب عدد كروته. اللاعب الذي جمع ٢٧ ورقة أو أكثر يكسب <strong>٣٠ نقطة كاملة</strong>!
              </p>
              <p>
                <strong>آخر أكلة:</strong> الكروت المتبقية على الأرض بعد آخر ورقة في اللعبة تذهب للاعب الذي أكل آخر أكلة.
              </p>
              <p>
                <strong>نهاية الجولة والماتش:</strong> يضاف مجموع الباصرات إلى نقاط الكومة. أول لاعب يصل إلى <strong>١٠١ نقطة</strong> (أو ٥١ حسب اختيارك) يفوز بالماتش ويتربع على عرش القهوة!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#120C07] border-t border-[#4A3722] flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-md transition-all"
          >
            فهمت القوانين.. يلا نلعب!
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

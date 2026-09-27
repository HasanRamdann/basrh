import React, { useState } from 'react';
import { X, CheckCircle, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { Card } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { calculateEatResult } from '../utils/basraLogic';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface TutorialStep {
  title: string;
  instruction: string;
  tableCards: Card[];
  handCards: Card[];
  targetCardId: string; // The optimal card to play
  expectedOutcome: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'الدرس الأول: أكل نفس الرقم (Rank Matching)',
    instruction: 'الأرض فيها ٨ سباتي و٣ هاص. العب ورقة من يدك تأكل الورقة المتطابقة على الأرض.',
    tableCards: [
      { id: 't-8', suit: 'clubs', rank: '8', value: 8 },
      { id: 't-3', suit: 'hearts', rank: '3', value: 3 },
    ],
    handCards: [
      { id: 'h-8', suit: 'diamonds', rank: '8', value: 8 },
      { id: 'h-5', suit: 'spades', rank: '5', value: 5 },
      { id: 'h-K', suit: 'hearts', rank: 'K', value: 13 },
    ],
    targetCardId: 'h-8',
    expectedOutcome: 'ممتاز! الثمانية أكلت الثمانية بنجاح.',
  },
  {
    title: 'الدرس الثاني: أكل المجموع (Sum Eating)',
    instruction: 'الأرض فيها ٤ ديناري و ٥ سنك. العب ورقة تجمع الاثنين معاً وتأكلهما في رمية واحدة!',
    tableCards: [
      { id: 't-4', suit: 'diamonds', rank: '4', value: 4 },
      { id: 't-5', suit: 'spades', rank: '5', value: 5 },
      { id: 't-K', suit: 'clubs', rank: 'K', value: 13 },
    ],
    handCards: [
      { id: 'h-9', suit: 'hearts', rank: '9', value: 9 },
      { id: 'h-2', suit: 'clubs', rank: '2', value: 2 },
      { id: 'h-Q', suit: 'diamonds', rank: 'Q', value: 12 },
    ],
    targetCardId: 'h-9',
    expectedOutcome: 'يا عيني! التسعة أكلت (٤ + ٥ = ٩) دفعة واحدة!',
  },
  {
    title: 'الدرس الثالث: الباصرة الذهبية (Clear the Table)',
    instruction: 'الأرض فيها كارت واحد فقط (٦ قلب). العب كارتك لمسح الترابيزة بالكامل وتحقيق باصرة (+١٠ نقاط)!',
    tableCards: [
      { id: 't-6', suit: 'hearts', rank: '6', value: 6 },
    ],
    handCards: [
      { id: 'h-6', suit: 'spades', rank: '6', value: 6 },
      { id: 'h-4', suit: 'clubs', rank: '4', value: 4 },
      { id: 'h-10', suit: 'diamonds', rank: '10', value: 10 },
    ],
    targetCardId: 'h-6',
    expectedOutcome: 'باصرة يا معلم!! مسحت الترابيزة وخدت ١٠ نقاط فوراً!',
  },
  {
    title: 'الدرس الرابع: باصرة المجموع (Sum Basra)',
    instruction: 'الأرض فيها ٢ و ٨. العب كارتك لمسح الترابيزة وتحقيق باصرة بمجموع الكروت!',
    tableCards: [
      { id: 't-2', suit: 'hearts', rank: '2', value: 2 },
      { id: 't-8', suit: 'spades', rank: '8', value: 8 },
    ],
    handCards: [
      { id: 'h-10', suit: 'clubs', rank: '10', value: 10 },
      { id: 'h-3', suit: 'diamonds', rank: '3', value: 3 },
      { id: 'h-7', suit: 'spades', rank: '7', value: 7 },
    ],
    targetCardId: 'h-10',
    expectedOutcome: 'الله عليك! العشرة أكلت (٢ + ٨ = ١٠) والأرض فضيت تماماً: باصرة!',
  },
  {
    title: 'الدرس الخامس: باصرة الولد على الولد (+٢٠ نقطة)',
    instruction: 'خصمك رمى ولد (J) على الأرض وحيداً. العب الولد من يدك لتحقيق أقوى باصرة في اللعبة!',
    tableCards: [
      { id: 't-J', suit: 'spades', rank: 'J', value: 11, isJack: true },
    ],
    handCards: [
      { id: 'h-J', suit: 'hearts', rank: 'J', value: 11, isJack: true },
      { id: 'h-5', suit: 'clubs', rank: '5', value: 5 },
    ],
    targetCardId: 'h-J',
    expectedOutcome: 'باصرة ولد على ولد!! ٢٠ نقطة كاملة ورعب في القعدة!',
  },
];

interface TutorialPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTutorial: () => void;
}

export const TutorialPractice: React.FC<TutorialPracticeProps> = ({
  isOpen,
  onClose,
  onCompleteTutorial,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIdx];

  const handlePlayCard = (card: Card) => {
    soundFx.playCardSlide();
    const result = calculateEatResult(card, currentStep.tableCards, 20);

    if (card.id === currentStep.targetCardId) {
      if (result.isBasra) {
        soundFx.playBasra();
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {}
      } else {
        soundFx.playEat();
      }

      setIsSuccess(true);
      setFeedback(currentStep.expectedOutcome);
      if (!completedSteps.includes(currentStepIdx)) {
        setCompletedSteps([...completedSteps, currentStepIdx]);
      }
    } else {
      soundFx.playClick();
      setIsSuccess(false);
      setFeedback('حاول تختار ورقة أخرى تحقق الأكلة أو الباصرة المطلوبة!');
    }
  };

  const handleNextStep = () => {
    soundFx.playClick();
    setFeedback(null);
    setIsSuccess(false);
    if (currentStepIdx < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Completed all
      onCompleteTutorial();
      onClose();
    }
  };

  const handleReset = () => {
    soundFx.playClick();
    setFeedback(null);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        
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
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black font-['El_Messiri',serif] tracking-wide">
              مدرسة الباصرة (دربني)
            </h2>
          </div>
          <p className="text-xs text-amber-200/70 mt-1">تعلّم واختبر مهارات الأكل والباصرة خطوة بخطوة</p>

          {/* Steps Indicator */}
          <div className="flex items-center gap-2 mt-3">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFx.playClick();
                  setCurrentStepIdx(idx);
                  setFeedback(null);
                  setIsSuccess(false);
                }}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  idx === currentStepIdx
                    ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-300'
                    : completedSteps.includes(idx)
                    ? 'bg-emerald-700 text-white'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Practice Arena */}
        <div className="p-4 sm:p-6 space-y-6">
          
          <div className="p-3.5 rounded-xl bg-[#24170E] border border-[#543D24]">
            <h4 className="font-bold text-amber-300 text-sm mb-1">{currentStep.title}</h4>
            <p className="text-xs sm:text-sm text-neutral-200">{currentStep.instruction}</p>
          </div>

          {/* Table Area */}
          <div className="relative p-5 rounded-2xl bg-[#0F3520] border-2 border-[#1E4D2B] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-emerald-300/70 mb-3">كروت الأرض (على الترابيزة)</span>
            <div className="flex flex-wrap items-center justify-center gap-3 min-h-[90px]">
              {currentStep.tableCards.map((c) => (
                <PlayingCard key={c.id} card={c} size="md" />
              ))}
            </div>
          </div>

          {/* Hand Area */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-300/80 mb-2">اختر كارت من يدك لتلعبه:</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentStep.handCards.map((c) => (
                <PlayingCard
                  key={c.id}
                  card={c}
                  isSelectable={!isSuccess}
                  size="md"
                  onClick={() => handlePlayCard(c)}
                />
              ))}
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-bold ${
                isSuccess
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-red-950/80 border-red-500 text-red-200'
              }`}
            >
              <span>{feedback}</span>
              {isSuccess ? (
                <button
                  onClick={handleNextStep}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <span>{currentStepIdx < TUTORIAL_STEPS.length - 1 ? 'الدرس التالي' : 'إنهاء التدريب'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="p-1 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

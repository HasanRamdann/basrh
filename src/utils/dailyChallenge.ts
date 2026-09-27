import { DailyChallenge } from '../types/game';

// Preset pool of daily challenges
export const CHALLENGE_TEMPLATES = [
  {
    type: 'no_sevens' as const,
    title: 'تحدي المعلم: بدون سبعات!',
    description: 'اكسب مباراة كاملة دون لعب أي ورقة رقم 7 (بما فيها الكومي)!',
    rewardCoins: 75,
    target: 1,
    icon: '🚫',
  },
  {
    type: 'three_basras' as const,
    title: 'قناص القهوة: 3 باصرات في مباراة',
    description: 'حقق 3 باصرات أو أكثر في مباراة واحدة لفرض هيبتك!',
    rewardCoins: 60,
    target: 3,
    icon: '🎯',
  },
  {
    type: 'jack_basra' as const,
    title: 'ضربة المعلمين: باصرة بالولد',
    description: 'اصطد خصمك وحقق باصرة ولد على ولد (+20 نقطة) في أي جولة!',
    rewardCoins: 90,
    target: 1,
    icon: '👑',
  },
  {
    type: 'majority_win' as const,
    title: 'حوت الكوتشينة: لمّة الكومة (+30)',
    description: 'اجمع 27 ورقة أو أكثر واكسب نقاط الكومة في صكتين!',
    rewardCoins: 50,
    target: 2,
    icon: '🃏',
  },
  {
    type: 'speed_win' as const,
    title: 'اكتساح سريع: فوز ساحق',
    description: 'اهزم خصمك بفارق 30 نقطة أو أكثر في الماتش!',
    rewardCoins: 80,
    target: 1,
    icon: '⚡',
  },
];

/**
 * Returns deterministic daily challenge based on current date (YYYY-MM-DD)
 */
export function getTodayChallenge(): DailyChallenge {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Deterministic seed from dateKey
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CHALLENGE_TEMPLATES.length;
  const template = CHALLENGE_TEMPLATES[index];

  return {
    id: `daily_${dateKey}_${template.type}`,
    type: template.type,
    title: template.title,
    description: template.description,
    rewardCoins: template.rewardCoins,
    dateKey,
    progress: 0,
    target: template.target,
    completed: false,
    claimed: false,
    icon: template.icon,
  };
}

export function loadSavedDailyChallenge(): DailyChallenge {
  const currentToday = getTodayChallenge();
  try {
    const saved = localStorage.getItem('basra_daily_challenge');
    if (saved) {
      const parsed: DailyChallenge = JSON.parse(saved);
      // Check if it's still today's challenge
      if (parsed.dateKey === currentToday.dateKey) {
        return parsed;
      }
    }
  } catch {}

  // If first time today, save new template
  try {
    localStorage.setItem('basra_daily_challenge', JSON.stringify(currentToday));
  } catch {}
  return currentToday;
}

export function saveDailyChallenge(challenge: DailyChallenge) {
  try {
    localStorage.setItem('basra_daily_challenge', JSON.stringify(challenge));
  } catch {}
}

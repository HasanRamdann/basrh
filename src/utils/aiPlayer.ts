import { Card, AIDifficulty } from '../types/game';
import { calculateEatResult } from './basraLogic';

export interface AIMoveChoice {
  card: Card;
  reason: string;
}

export function chooseAIMove(
  hand: Card[],
  tableCards: Card[],
  difficulty: AIDifficulty = 'medium',
  opponentCollectedCount: number = 0,
  aiCollectedCount: number = 0
): AIMoveChoice {
  if (hand.length === 0) {
    throw new Error('Hand is empty');
  }

  // 1. EASY AI: Random move, or plays first card that eats
  if (difficulty === 'easy') {
    // 50% chance to just play anything, 50% to make an eat if possible
    if (Math.random() < 0.5) {
      const eatMoves = hand.filter(c => calculateEatResult(c, tableCards).eatenCards.length > 0);
      if (eatMoves.length > 0) {
        return { card: eatMoves[Math.floor(Math.random() * eatMoves.length)], reason: 'أكل عشوائي' };
      }
    }
    const randomCard = hand[Math.floor(Math.random() * hand.length)];
    return { card: randomCard, reason: 'لعب عادي' };
  }

  // Evaluate all possible moves for hand
  const evaluatedMoves = hand.map(card => {
    const result = calculateEatResult(card, tableCards);
    return {
      card,
      result,
      isBasra: result.isBasra,
      isJackBasra: result.isJackBasra,
      eatenCount: result.eatenCards.length,
      isJack: card.isJack,
      isKommy: card.isKommy,
    };
  });

  // 2. HARD AI: Professional Egyptian Ahwa Master ("المعلم / الحريف")
  if (difficulty === 'hard') {
    // Rule 1: Always take an immediate Basra! (10 or 20 points)
    const basraMove = evaluatedMoves.find(m => m.isBasra);
    if (basraMove) {
      return { card: basraMove.card, reason: 'باصرة يا معلم!' };
    }

    // Rule 2: If table has 3 or more cards, playing a Jack or Kommy yields a huge sweep towards 30-point majority
    const bigSweep = evaluatedMoves.find(m => (m.isJack || m.isKommy) && m.eatenCount >= 3);
    if (bigSweep) {
      return { card: bigSweep.card, reason: 'قش الكوتشينة كلها' };
    }

    // Rule 3: Regular eat that isn't a Jack/Kommy (preserve special cards if small eat)
    const regularEats = evaluatedMoves
      .filter(m => !m.isJack && !m.isKommy && m.eatenCount > 0)
      .sort((a, b) => b.eatenCount - a.eatenCount);

    if (regularEats.length > 0) {
      return { card: regularEats[0].card, reason: `أكل ${regularEats[0].eatenCount} ورقات` };
    }

    // Rule 4: If we only have special cards (Jack/Kommy) and table has at least 1 card
    const specialEat = evaluatedMoves.find(m => (m.isJack || m.isKommy) && m.eatenCount > 0);
    // If end of game or many cards to get majority, use Jack
    if (specialEat && (tableCards.length >= 2 || aiCollectedCount + tableCards.length + 1 >= 27)) {
      return { card: specialEat.card, reason: 'استخدام الولد للسيطرة على الكومة' };
    }

    // Rule 5: Discard safely:
    // Avoid throwing a Jack or Kommy on empty table if we have other cards!
    const nonSpecialDiscards = evaluatedMoves.filter(m => !m.isJack && !m.isKommy);
    const candidates = nonSpecialDiscards.length > 0 ? nonSpecialDiscards : evaluatedMoves;

    // Discarding preference:
    // Don't discard a card that sums easily to a small table (e.g. if table has 2, don't throw 5 or 6 if avoidable)
    // High cards (K, Q) are very safe to throw because they can only be eaten by another K or Q, never by sum!
    const safeFaceCard = candidates.find(m => m.card.rank === 'K' || m.card.rank === 'Q');
    if (safeFaceCard) {
      return { card: safeFaceCard.card, reason: 'رمية آمنة (شايب أو بنت)' };
    }

    // Otherwise discard lowest value or card that doesn't easily create a sum
    candidates.sort((a, b) => a.card.value - b.card.value);
    return { card: candidates[0].card, reason: 'رمي ورقة آمنة' };
  }

  // 3. MEDIUM AI: Standard Ahwa player ("قهوجي")
  // Prioritize Basra > Best regular eat > Sweep > Safe discard
  const basra = evaluatedMoves.find(m => m.isBasra);
  if (basra) return { card: basra.card, reason: 'باصرة!' };

  const eats = evaluatedMoves.filter(m => m.eatenCount > 0).sort((a, b) => b.eatenCount - a.eatenCount);
  if (eats.length > 0) {
    return { card: eats[0].card, reason: 'أكل متاح' };
  }

  // Discard non-Jack if possible
  const safe = evaluatedMoves.filter(m => !m.isJack && !m.isKommy);
  if (safe.length > 0) {
    return { card: safe[Math.floor(Math.random() * safe.length)].card, reason: 'تنزيل ورقة' };
  }

  return { card: hand[0], reason: 'تنزيل' };
}

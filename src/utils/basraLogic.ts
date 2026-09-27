import { Card, EatResult } from '../types/game';

/**
 * Finds combinations of table cards that sum to targetValue,
 * using greedy disjoint subsets to maximize the number of captured cards.
 */
function findSumSubsets(availableCards: Card[], targetValue: number): Card[][] {
  const resultSubsets: Card[][] = [];
  let remaining = [...availableCards].filter(c => c.value < 11); // Only Ace through 10 participate in sum

  function findSingleCombination(cards: Card[], target: number): Card[] | null {
    // Check combinations of length 2, 3, 4, etc.
    function backtrack(startIndex: number, currentSum: number, combo: Card[]): Card[] | null {
      if (currentSum === target && combo.length >= 2) {
        return combo;
      }
      if (currentSum >= target) return null;

      for (let i = startIndex; i < cards.length; i++) {
        const found = backtrack(i + 1, currentSum + cards[i].value, [...combo, cards[i]]);
        if (found) return found;
      }
      return null;
    }

    return backtrack(0, 0, []);
  }

  // Iteratively find and extract disjoint combinations that sum to targetValue
  let keepSearching = true;
  while (keepSearching && remaining.length >= 2) {
    const combo = findSingleCombination(remaining, targetValue);
    if (combo) {
      resultSubsets.push(combo);
      // Remove used cards from remaining pool
      const usedIds = new Set(combo.map(c => c.id));
      remaining = remaining.filter(c => !usedIds.has(c.id));
    } else {
      keepSearching = false;
    }
  }

  return resultSubsets;
}

/**
 * Core Egyptian Basra eating evaluator.
 * Evaluates what cards are eaten by a played card, and whether a Basra occurred.
 */
export function calculateEatResult(
  playedCard: Card,
  tableCards: Card[],
  jackBasraValue: 10 | 20 = 20
): EatResult {
  // If table is completely empty, card is simply placed down.
  if (tableCards.length === 0) {
    return {
      playedCard,
      eatenCards: [],
      isBasra: false,
      isJackBasra: false,
      basraPoints: 0,
      reason: 'no_eat',
    };
  }

  // 1. Case: Played a Jack (ولد)
  if (playedCard.isJack) {
    // If the table has exactly ONE card and that card is also a Jack -> Jack Basra!
    if (tableCards.length === 1 && tableCards[0].isJack) {
      return {
        playedCard,
        eatenCards: [...tableCards],
        isBasra: true,
        isJackBasra: true,
        basraPoints: jackBasraValue,
        reason: 'jack_sweep',
      };
    }

    // Otherwise, Jack sweeps ALL cards from table (قش بدون باصرة)
    return {
      playedCard,
      eatenCards: [...tableCards],
      isBasra: false,
      isJackBasra: false,
      basraPoints: 0,
      reason: 'jack_sweep',
    };
  }

  // 2. Case: Played 7 of Diamonds (السبعة الكومي)
  // In Egyptian rules: Kommy sweeps the entire table like a Jack,
  // OR if table had a single 7 or single card/sum, it can be a Basra!
  if (playedCard.isKommy) {
    // If table has cards:
    // Can eat everything on the table!
    const isBasra = tableCards.length === 1; // Basra if clearing a single card
    return {
      playedCard,
      eatenCards: [...tableCards],
      isBasra,
      isJackBasra: false,
      basraPoints: isBasra ? 10 : 0,
      reason: 'kommy_sweep',
    };
  }

  // 3. Case: Face cards Queen (Q) or King (K)
  // Q only eats Q, K only eats K. Cannot be summed.
  if (playedCard.rank === 'Q' || playedCard.rank === 'K') {
    const matching = tableCards.filter(c => c.rank === playedCard.rank);
    if (matching.length > 0) {
      const isBasra = matching.length === tableCards.length;
      return {
        playedCard,
        eatenCards: matching,
        isBasra,
        isJackBasra: false,
        basraPoints: isBasra ? 10 : 0,
        reason: 'rank_match',
      };
    }
    return {
      playedCard,
      eatenCards: [],
      isBasra: false,
      isJackBasra: false,
      basraPoints: 0,
      reason: 'no_eat',
    };
  }

  // 4. Case: Number cards A through 10
  // Can eat:
  // a) Same rank cards (e.g. 8 eats 8)
  // b) Combinations of cards whose sum equals playedCard.value (e.g. 8 eats 5+3, 4+4)
  const eaten: Card[] = [];

  // Exact rank matches
  const exactMatches = tableCards.filter(c => c.rank === playedCard.rank);
  eaten.push(...exactMatches);

  // Cards remaining for sum calculation
  const exactIds = new Set(exactMatches.map(c => c.id));
  const candidateForSum = tableCards.filter(c => !exactIds.has(c.id));

  // Find disjoint sum combinations
  const sumCombos = findSumSubsets(candidateForSum, playedCard.value);
  for (const combo of sumCombos) {
    eaten.push(...combo);
  }

  if (eaten.length > 0) {
    // Check if table is cleared completely
    const isBasra = eaten.length === tableCards.length;
    const reason = exactMatches.length > 0 && sumCombos.length > 0
      ? 'sum_match'
      : exactMatches.length > 0
      ? 'rank_match'
      : 'sum_match';

    return {
      playedCard,
      eatenCards: eaten,
      isBasra,
      isJackBasra: false,
      basraPoints: isBasra ? 10 : 0,
      reason,
    };
  }

  // No eat possible
  return {
    playedCard,
    eatenCards: [],
    isBasra: false,
    isJackBasra: false,
    basraPoints: 0,
    reason: 'no_eat',
  };
}

/**
 * Calculates end-of-round score for Egyptian Basra:
 * - Most cards collected ("الكومة / اللمة"):
 *   Whoever has 27 or more cards gets 30 points (in a 2-player game).
 *   If tied at 26-26, no one gets the 30 points.
 * - Basra points: Each Basra is 10 points (Jack Basra 20 points).
 */
export function calculateRoundScores(
  player1CardsCount: number,
  player1BasraCount: number,
  player1JackBasraCount: number,
  player2CardsCount: number,
  player2BasraCount: number,
  player2JackBasraCount: number,
  jackBasraValue: 10 | 20 = 20
) {
  let p1MajorityPoints = 0;
  let p2MajorityPoints = 0;

  if (player1CardsCount > 26) {
    p1MajorityPoints = 30;
  } else if (player2CardsCount > 26) {
    p2MajorityPoints = 30;
  }

  const p1BasraPoints = (player1BasraCount * 10) + (player1JackBasraCount * jackBasraValue);
  const p2BasraPoints = (player2BasraCount * 10) + (player2JackBasraCount * jackBasraValue);

  return {
    player1: {
      cardsCount: player1CardsCount,
      majorityPoints: p1MajorityPoints,
      basraPoints: p1BasraPoints,
      totalRoundScore: p1MajorityPoints + p1BasraPoints,
    },
    player2: {
      cardsCount: player2CardsCount,
      majorityPoints: p2MajorityPoints,
      basraPoints: p2BasraPoints,
      totalRoundScore: p2MajorityPoints + p2BasraPoints,
    },
  };
}

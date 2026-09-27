import { Card, Rank, Suit } from '../types/game';

export const SUITS: { suit: Suit; symbol: string; color: string; arabicName: string }[] = [
  { suit: 'hearts', symbol: '♥', color: '#DC2626', arabicName: 'هاص (قلب)' },
  { suit: 'diamonds', symbol: '♦', color: '#DC2626', arabicName: 'كاروه (ديناري)' },
  { suit: 'clubs', symbol: '♣', color: '#1F2937', arabicName: 'سباتي (شجرة)' },
  { suit: 'spades', symbol: '♠', color: '#1F2937', arabicName: 'بستوني (سنك)' },
];

export const RANKS: { rank: Rank; value: number; label: string; arabicName: string }[] = [
  { rank: 'A', value: 1, label: 'A', arabicName: 'إكيك (واحد)' },
  { rank: '2', value: 2, label: '2', arabicName: 'اثنين' },
  { rank: '3', value: 3, label: '3', arabicName: 'ثلاثة' },
  { rank: '4', value: 4, label: '4', arabicName: 'أربعة' },
  { rank: '5', value: 5, label: '5', arabicName: 'خمسة' },
  { rank: '6', value: 6, label: '6', arabicName: 'ستة' },
  { rank: '7', value: 7, label: '7', arabicName: 'سبعة' },
  { rank: '8', value: 8, label: '8', arabicName: 'ثمانية' },
  { rank: '9', value: 9, label: '9', arabicName: 'تسعة' },
  { rank: '10', value: 10, label: '10', arabicName: 'عشرة' },
  { rank: 'J', value: 11, label: 'J', arabicName: 'ولد (شاب)' },
  { rank: 'Q', value: 12, label: 'Q', arabicName: 'بنت' },
  { rank: 'K', value: 13, label: 'K', arabicName: 'شايب' },
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      const isKommy = s.suit === 'diamonds' && r.rank === '7';
      const isJack = r.rank === 'J';
      deck.push({
        id: `${s.suit}-${r.rank}-${Math.random().toString(36).substring(2, 7)}`,
        suit: s.suit,
        rank: r.rank,
        value: r.value,
        isKommy,
        isJack,
      });
    }
  }
  return deck;
}

export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * In Egyptian Basra, dealing the initial 4 cards to the table:
 * If a Jack (ولد) or 7 of Diamonds (السبعة الكومي) is dealt to the table at the very beginning,
 * it is traditionally returned to the deck and replaced, so players don't have an unfair start.
 */
export function dealInitialTableCards(deck: Card[]): { tableCards: Card[]; remainingDeck: Card[] } {
  let currentDeck = [...deck];
  const tableCards: Card[] = [];

  while (tableCards.length < 4 && currentDeck.length > 0) {
    const card = currentDeck.shift()!;
    if (card.isJack || card.isKommy) {
      // Put back deep in the deck and pick another
      currentDeck.push(card);
      currentDeck = shuffleDeck(currentDeck);
    } else {
      tableCards.push(card);
    }
  }

  return { tableCards, remainingDeck: currentDeck };
}

export function dealCardsToPlayers(
  deck: Card[],
  playerCount: number = 2,
  cardsPerPlayer: number = 4
): { hands: Card[][]; remainingDeck: Card[] } {
  const currentDeck = [...deck];
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);

  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let p = 0; p < playerCount; p++) {
      if (currentDeck.length > 0) {
        hands[p].push(currentDeck.shift()!);
      }
    }
  }

  return { hands, remainingDeck: currentDeck };
}

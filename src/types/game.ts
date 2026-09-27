export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // A=1, 2-10=2-10, J=11, Q=12, K=13
  isKommy?: boolean; // 7 of Diamonds
  isJack?: boolean;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'vs_ai' | 'pass_and_play' | 'online_sim' | 'training';

export interface PlayerStats {
  id: string;
  name: string;
  avatar: string;
  frameId: string;
  isAI: boolean;
  difficulty?: AIDifficulty;
  hand: Card[];
  capturedCards: Card[];
  basraCount: number;
  jackBasraCount: number;
  roundScore: number;
  totalScore: number;
}

export interface GameSettings {
  targetScore: number; // 51, 101, 151
  soundVolume: number;
  ambientSound: boolean;
  voiceCallouts: boolean;
  showHints: boolean;
  cardBackId: string;
  fastAnimations: boolean;
  jackBasraValue: 10 | 20; // Some play with 20 for Jack Basra, others 10
}

export interface DailyChallenge {
  id: string;
  type: 'no_sevens' | 'three_basras' | 'jack_basra' | 'majority_win' | 'speed_win';
  title: string;
  description: string;
  rewardCoins: number;
  dateKey: string; // YYYY-MM-DD
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  currentProgress: number;
  maxProgress: number;
  completed: boolean;
  category: 'wins' | 'basras' | 'games';
}

export interface StoreItem {
  id: string;
  type: 'frame' | 'card_back';
  name: string;
  price: number;
  previewColor: string;
  unlocked: boolean;
  borderStyle?: string;
  image?: string;
}

export interface EatResult {
  playedCard: Card;
  eatenCards: Card[];
  isBasra: boolean;
  isJackBasra: boolean;
  basraPoints: number;
  reason: 'rank_match' | 'sum_match' | 'jack_sweep' | 'kommy_sweep' | 'no_eat';
}

export interface RoundHistoryEntry {
  playerId: string;
  playerName: string;
  playedCard: Card;
  eatResult: EatResult;
  timestamp: number;
}

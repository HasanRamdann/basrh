import React, { useState, useEffect, useCallback } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX, ArrowLeft, Trophy, Flame, HelpCircle } from 'lucide-react';
import { Card, PlayerStats, GameSettings, EatResult, RoundHistoryEntry, AIDifficulty } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { InGameChat } from './InGameChat';
import { EmotePicker, EmoteItem } from './EmotePicker';
import { createDeck, shuffleDeck, dealInitialTableCards, dealCardsToPlayers } from '../utils/cardDeck';
import { calculateEatResult, calculateRoundScores } from '../utils/basraLogic';
import { chooseAIMove } from '../utils/aiPlayer';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

import tableFeltImg from '../assets/images/table_felt_texture_1790479618945.jpg';
import cardBackImg from '../assets/images/kotshina_card_back_1790479632765.jpg';
import avatarAhmed from '../assets/images/avatar_ahmed_tarboosh_1790479644347.jpg';
import avatarRadwan from '../assets/images/avatar_hag_radwan_1790479654465.jpg';

interface TableBoardProps {
  difficulty: AIDifficulty;
  settings: GameSettings;
  userProfile: {
    name: string;
    avatar: string;
    frameId: string;
  };
  onBackToMenu: () => void;
  onMatchFinished: (
    won: boolean,
    basras: number,
    jackBasras: number,
    score: number,
    telemetry?: {
      playedAnySeven: boolean;
      scoreDifference: number;
      wonMajorityRounds: number;
    }
  ) => void;
  isMultiplayer?: boolean;
}

export const TableBoard: React.FC<TableBoardProps> = ({
  difficulty,
  settings,
  userProfile,
  onBackToMenu,
  onMatchFinished,
  isMultiplayer = false,
}) => {
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [player1, setPlayer1] = useState<PlayerStats>({
    id: 'p1',
    name: userProfile.name,
    avatar: userProfile.avatar,
    frameId: userProfile.frameId,
    isAI: false,
    hand: [],
    capturedCards: [],
    basraCount: 0,
    jackBasraCount: 0,
    roundScore: 0,
    totalScore: 0,
  });

  const [player2, setPlayer2] = useState<PlayerStats>({
    id: 'p2',
    name: isMultiplayer ? 'اللاعب الثاني' : difficulty === 'hard' ? 'المعلم أبو عبيد' : 'الحاج رضوان',
    avatar: difficulty === 'hard' ? avatarAhmed : avatarRadwan,
    frameId: 'frame_vintage_wood',
    isAI: !isMultiplayer,
    difficulty,
    hand: [],
    capturedCards: [],
    basraCount: 0,
    jackBasraCount: 0,
    roundScore: 0,
    totalScore: 0,
  });

  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [currentDealRound, setCurrentDealRound] = useState(1); // 1 to 6 (for 52 cards: 4 table + 6 deals * 8 cards = 52)
  const [lastEater, setLastEater] = useState<'p1' | 'p2' | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isTableShaking, setIsTableShaking] = useState(false);
  const [lastThrownCardId, setLastThrownCardId] = useState<string | null>(null);
  const [eatenCardIds, setEatenCardIds] = useState<Set<string>>(new Set());

  // Daily Challenge telemetry tracking
  const [playerPlayedSeven, setPlayerPlayedSeven] = useState(false);
  const [playerWonMajorityRounds, setPlayerWonMajorityRounds] = useState(0);

  // Banner effects
  const [activeBasraBanner, setActiveBasraBanner] = useState<{
    text: string;
    subText: string;
    points: number;
    isJack: boolean;
  } | null>(null);

  const [lastActionText, setLastActionText] = useState<string>('بداية الصكة! وزّعنا ٤ كروت على الأرض');
  const [botBanter, setBotBanter] = useState<string | null>(null);
  const [playerChatBubble, setPlayerChatBubble] = useState<{ text?: string; emoji?: string; label?: string } | null>(null);
  
  // Floating emote visible directly on top of the player profile avatar
  const [playerActiveEmote, setPlayerActiveEmote] = useState<EmoteItem | null>(null);

  const handleSelectEmote = (emote: EmoteItem) => {
    setPlayerActiveEmote(emote);
    setTimeout(() => {
      setPlayerActiveEmote(null);
    }, 3200);

    // Opponent reacts to emotes based on category
    setTimeout(() => {
      let botReaction = '';
      if (emote.category === 'joy') {
        const joyReplies = ['ما تفرحش أوي.. لسه بدري! 😉', 'يا سيدي على الروقان! 😎', 'الضحك في الآخر يا غالي!'];
        botReaction = joyReplies[Math.floor(Math.random() * joyReplies.length)];
      } else if (emote.category === 'laughter') {
        const laughReplies = ['بتضحك على إيه؟ استنى بس! 😂', 'اضحك اضحك.. الدور جاي عليك! 🎲', 'هات شاي للمعلم! ☕'];
        botReaction = laughReplies[Math.floor(Math.random() * laughReplies.length)];
      } else if (emote.category === 'worry') {
        const worryReplies = ['قلقان ليه؟ متخافش اللعب أصول! 💪', 'معلش تتعوض في الصكة الجاية! ⏳', 'ركز في الورق اللي نازل!'];
        botReaction = worryReplies[Math.floor(Math.random() * worryReplies.length)];
      } else {
        botReaction = '☕ أحلى شاي كشري في قهوة القاهرة!';
      }
      setBotBanter(botReaction);
      setTimeout(() => setBotBanter(null), 3000);
    }, 1200);
  };

  const handlePlayerSendMessage = (text: string) => {
    setPlayerChatBubble({ text });
    setTimeout(() => setPlayerChatBubble(null), 3500);

    // Opponent smart coffeehouse reply
    setTimeout(() => {
      const botReplies = [
        'يا عيني عليك يا حريف! 😂',
        'العبرة بالنهاية والكومة في الآخر! 😉',
        'ولا يهمك، القعدة لسه طويلة يا غالي ☕',
        'ماشي يا معلم.. هردها لك في الصكة الجاية! 🔥',
        'كتر خيرك يا ريس.. العب بس! 🃏',
      ];
      const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
      setBotBanter(randomReply);
      setTimeout(() => setBotBanter(null), 3500);
    }, 1200);
  };

  const handlePlayerSendSticker = (emoji: string, label: string) => {
    setPlayerChatBubble({ emoji, label });
    setTimeout(() => setPlayerChatBubble(null), 3500);

    setTimeout(() => {
      const stickerResponses = ['👏', '🔥', '☕', '😎', '👌'];
      const pick = stickerResponses[Math.floor(Math.random() * stickerResponses.length)];
      setBotBanter(`${pick} تسلم يا غالي!`);
      setTimeout(() => setBotBanter(null), 3000);
    }, 1000);
  };

  // Round / Match Over states
  const [isRoundSummaryOpen, setIsRoundSummaryOpen] = useState(false);
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [roundScoresData, setRoundScoresData] = useState<any>(null);

  // Initialize a fresh 52-card game round
  const startNewRound = useCallback(() => {
    soundFx.playCardSlide();
    const fullDeck = shuffleDeck(createDeck());
    const { tableCards: initialTable, remainingDeck: deckAfterTable } = dealInitialTableCards(fullDeck);
    const { hands, remainingDeck } = dealCardsToPlayers(deckAfterTable, 2, 4);

    setDeck(remainingDeck);
    setTableCards(initialTable);
    setCurrentDealRound(1);
    setLastEater(null);
    setSelectedCardId(null);
    setIsRoundSummaryOpen(false);
    setRoundScoresData(null);
    setCurrentTurn('p1');

    setPlayer1(prev => ({
      ...prev,
      hand: hands[0],
      capturedCards: [],
      basraCount: 0,
      jackBasraCount: 0,
      roundScore: 0,
    }));

    setPlayer2(prev => ({
      ...prev,
      hand: hands[1],
      capturedCards: [],
      basraCount: 0,
      jackBasraCount: 0,
      roundScore: 0,
    }));

    setLastActionText('تم توزيع ٤ كروت للأرض و٤ لكل لاعب. دورك يا معلم!');
    if (!isMultiplayer) {
      setBotBanter('يلا يا باشا، ورّينا اللعب على أصوله!');
    }
  }, [isMultiplayer]);

  // Initial mount
  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  // Determine which cards on the table will be eaten by current selected or hovered card
  const activeCardId = selectedCardId || hoveredCardId;
  const activeHandCard =
    currentTurn === 'p1'
      ? player1.hand.find(c => c.id === activeCardId)
      : isMultiplayer
      ? player2.hand.find(c => c.id === activeCardId)
      : null;

  const previewEatResult = activeHandCard && settings.showHints
    ? calculateEatResult(activeHandCard, tableCards, settings.jackBasraValue)
    : null;

  const highlightedCardIds = new Set(previewEatResult?.eatenCards.map(c => c.id) || []);

  // Handle playing a card
  const executePlayCard = (card: Card, playerId: 'p1' | 'p2') => {
    soundFx.playCardSlide();

    const isP1 = playerId === 'p1';
    const player = isP1 ? player1 : player2;
    const opponent = isP1 ? player2 : player1;

    // Track if player played a 7 (for "no_sevens" challenge)
    if (isP1 && card.rank === '7') {
      setPlayerPlayedSeven(true);
    }

    // Remove card from player hand
    const updatedHand = player.hand.filter(c => c.id !== card.id);

    // Calculate eating result
    const eatResult = calculateEatResult(card, tableCards, settings.jackBasraValue);

    let updatedTable = [...tableCards];
    let updatedCaptured = [...player.capturedCards];
    let newBasraCount = player.basraCount;
    let newJackBasraCount = player.jackBasraCount;
    let newRoundScore = player.roundScore;

    if (eatResult.eatenCards.length > 0) {
      // Cards eaten!
      setLastEater(playerId);
      const eatenIds = new Set(eatResult.eatenCards.map(c => c.id));
      setEatenCardIds(eatenIds);

      // Trigger shake when Basra happens!
      if (eatResult.isBasra) {
        setIsTableShaking(true);
        setTimeout(() => setIsTableShaking(false), 700);

        soundFx.playBasra();
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#FFFFFF'],
          });
        } catch {}

        if (eatResult.isJackBasra) {
          newJackBasraCount += 1;
          newRoundScore += settings.jackBasraValue;
          setActiveBasraBanner({
            text: 'باصرة ولد على ولد!!',
            subText: `أقوى باصرة (+${settings.jackBasraValue} نقطة)!`,
            points: settings.jackBasraValue,
            isJack: true,
          });
          setLastActionText(`${player.name} عمل باصرة ولد تاريخية (+${settings.jackBasraValue} نقطة)!`);
        } else {
          newBasraCount += 1;
          newRoundScore += 10;
          setActiveBasraBanner({
            text: 'باصرة مصرية!!',
            subText: '+١٠ نقاط على القهوة!',
            points: 10,
            isJack: false,
          });
          setLastActionText(`${player.name} مسح الأرض وعمل باصرة (+١٠ نقاط)!`);
        }

        setTimeout(() => setActiveBasraBanner(null), 2500);
      } else {
        // Regular eat or sweep
        if (eatResult.reason === 'jack_sweep') {
          soundFx.playSweep();
          setLastActionText(`${player.name} قش الترابيزة بالولد (${eatResult.eatenCards.length} كروت)!`);
        } else {
          soundFx.playEat();
          setLastActionText(`${player.name} أكل ${eatResult.eatenCards.length} كروت بالكارت [${card.rank}]`);
        }
      }

      updatedTable = updatedTable.filter(c => !eatenIds.has(c.id));
      updatedCaptured = [...updatedCaptured, card, ...eatResult.eatenCards];
    } else {
      // Discard card to table with smooth sliding animation
      setLastThrownCardId(card.id);
      setTimeout(() => setLastThrownCardId(null), 600);
      updatedTable.push(card);
      setLastActionText(`${player.name} نزّل الكارت [${card.rank}] على الأرض`);
    }

    // Update current player state
    if (isP1) {
      setPlayer1(prev => ({
        ...prev,
        hand: updatedHand,
        capturedCards: updatedCaptured,
        basraCount: newBasraCount,
        jackBasraCount: newJackBasraCount,
        roundScore: newRoundScore,
      }));
    } else {
      setPlayer2(prev => ({
        ...prev,
        hand: updatedHand,
        capturedCards: updatedCaptured,
        basraCount: newBasraCount,
        jackBasraCount: newJackBasraCount,
        roundScore: newRoundScore,
      }));
    }

    setTableCards(updatedTable);
    setSelectedCardId(null);
    setHoveredCardId(null);

    // Check if both players hands are now empty
    const nextP1HandCount = isP1 ? updatedHand.length : player1.hand.length;
    const nextP2HandCount = isP1 ? player2.hand.length : updatedHand.length;

    if (nextP1HandCount === 0 && nextP2HandCount === 0) {
      // Deal next batch of 4 cards, or end round if deck is empty
      handleDealNextCards(updatedTable, playerId, isP1 ? updatedCaptured : player1.capturedCards, !isP1 ? updatedCaptured : player2.capturedCards, newBasraCount, newJackBasraCount);
    } else {
      // Switch turn
      const nextTurn = playerId === 'p1' ? 'p2' : 'p1';
      setCurrentTurn(nextTurn);
    }
  };

  // Deal next 4 cards or finalize round
  const handleDealNextCards = (
    currentTable: Card[],
    lastPlayerMoved: 'p1' | 'p2',
    p1Captured: Card[],
    p2Captured: Card[],
    pBasras: number,
    pJackBasras: number
  ) => {
    if (deck.length > 0) {
      // Deal next 4 cards to each player
      soundFx.playCardDeal();
      const { hands, remainingDeck } = dealCardsToPlayers(deck, 2, 4);
      setDeck(remainingDeck);
      setCurrentDealRound(prev => prev + 1);

      setPlayer1(prev => ({ ...prev, hand: hands[0] }));
      setPlayer2(prev => ({ ...prev, hand: hands[1] }));

      // Switch turn
      const nextTurn = lastPlayerMoved === 'p1' ? 'p2' : 'p1';
      setCurrentTurn(nextTurn);
      setLastActionText(`جولة توزيع جديدة (${currentDealRound + 1} من ٦)`);
    } else {
      // ALL 52 CARDS PLAYED! End of Round
      finalizeRound(currentTable, p1Captured, p2Captured);
    }
  };

  // End of Round calculations
  const finalizeRound = (finalTable: Card[], p1Captured: Card[], p2Captured: Card[]) => {
    // In Egyptian Basra: Any cards left on the table go to the LAST player who made an eat
    let p1FinalCaptured = [...p1Captured];
    let p2FinalCaptured = [...p2Captured];

    if (finalTable.length > 0) {
      if (lastEater === 'p1') {
        p1FinalCaptured = [...p1FinalCaptured, ...finalTable];
      } else if (lastEater === 'p2') {
        p2FinalCaptured = [...p2FinalCaptured, ...finalTable];
      } else {
        // Neither player ate anything (rare)
      }
    }

    setTableCards([]);

    const scores = calculateRoundScores(
      p1FinalCaptured.length,
      player1.basraCount,
      player1.jackBasraCount,
      p2FinalCaptured.length,
      player2.basraCount,
      player2.jackBasraCount,
      settings.jackBasraValue
    );

    let nextMajorityWonRounds = playerWonMajorityRounds;
    if (scores.player1.majorityPoints > 0) {
      nextMajorityWonRounds += 1;
      setPlayerWonMajorityRounds(nextMajorityWonRounds);
    }

    const newP1Total = player1.totalScore + scores.player1.totalRoundScore;
    const newP2Total = player2.totalScore + scores.player2.totalRoundScore;

    setPlayer1(prev => ({
      ...prev,
      capturedCards: p1FinalCaptured,
      totalScore: newP1Total,
    }));

    setPlayer2(prev => ({
      ...prev,
      capturedCards: p2FinalCaptured,
      totalScore: newP2Total,
    }));

    setRoundScoresData(scores);
    setIsRoundSummaryOpen(true);

    // Check match victory (reaching targetScore e.g. 101 or 51)
    if (newP1Total >= settings.targetScore || newP2Total >= settings.targetScore) {
      setIsMatchOver(true);
      const won = newP1Total > newP2Total;
      soundFx.playBasra();
      onMatchFinished(won, player1.basraCount, player1.jackBasraCount, newP1Total, {
        playedAnySeven: playerPlayedSeven,
        scoreDifference: Math.max(0, newP1Total - newP2Total),
        wonMajorityRounds: nextMajorityWonRounds,
      });
    }
  };

  // Bot Turn Logic
  useEffect(() => {
    if (currentTurn === 'p2' && player2.isAI && !isPaused && player2.hand.length > 0 && !isRoundSummaryOpen) {
      setIsBotThinking(true);

      const delay = settings.fastAnimations ? 600 : 1200;
      const timer = setTimeout(() => {
        try {
          const move = chooseAIMove(
            player2.hand,
            tableCards,
            player2.difficulty || 'medium',
            player1.capturedCards.length,
            player2.capturedCards.length
          );

          if (move.reason && Math.random() < 0.4) {
            setBotBanter(move.reason);
            setTimeout(() => setBotBanter(null), 3000);
          }

          executePlayCard(move.card, 'p2');
        } catch {
          // Fallback if needed
          executePlayCard(player2.hand[0], 'p2');
        } finally {
          setIsBotThinking(false);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, player2.isAI, player2.hand, tableCards, isPaused, isRoundSummaryOpen]);

  // User click on hand card - Instant Single-Click Play as requested!
  const handleUserCardClick = (card: Card) => {
    if (currentTurn !== 'p1') return;

    // Direct, immediate play upon click without needing a second confirmation click!
    executePlayCard(card, 'p1');
  };

  return (
    <div
      className={`relative w-full h-[100dvh] min-h-[520px] max-h-screen overflow-hidden flex flex-col justify-between select-none bg-neutral-950 font-['Cairo',sans-serif] ${
        isTableShaking ? 'animate-basra-shake' : ''
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(16, 56, 32, 0.7) 0%, rgba(5, 20, 12, 0.95) 100%), url(${tableFeltImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Table Felt Decorative Border Rim matching screenshots */}
      <div className="absolute inset-0 pointer-events-none border-[8px] sm:border-[16px] lg:border-[20px] border-[#2A180E] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-0" />
      <div className="absolute inset-[6px] sm:inset-[14px] lg:inset-[18px] pointer-events-none border border-[#8C6D46]/40 z-0" />

      {/* TOP BAR: Opponent info, Pause, and Match Status */}
      <div className="relative z-10 w-full px-2.5 sm:px-8 pt-2 sm:pt-4 flex items-center justify-between gap-1.5">
        
        {/* Opponent Badge (Top) matching screenshot 1 & 2 */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-[#1A120B]/90 border border-[#5C442A] p-1 sm:p-2 rounded-xl shadow-lg">
          <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 border-amber-800 shadow shrink-0">
            <img
              src={player2.avatar}
              alt={player2.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-[11px] sm:text-sm text-neutral-100">{player2.name}</span>
              {currentTurn === 'p2' && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-300">
              <span>نقاط: <strong className="font-mono text-xs sm:text-sm">{player2.totalScore}</strong></span>
              <span>·</span>
              <span>لمة: <strong className="font-mono">{player2.capturedCards.length}</strong></span>
              {player2.basraCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-red-400 font-bold">باصرة: {player2.basraCount}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center Round Banner */}
        <div className="flex flex-col items-center">
          <div className="px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full bg-black/60 border border-amber-900/40 text-amber-200 text-[10px] sm:text-xs font-bold shadow-inner text-center">
            هدف الماتش: {settings.targetScore}
          </div>
          <span className="text-[9px] sm:text-[11px] text-neutral-300 mt-0.5 hidden xs:inline sm:inline">
            توزيعة {currentDealRound} من ٦ · كوتشينة: {deck.length}
          </span>
        </div>

        {/* Controls: Pause / Sound */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsPaused(!isPaused);
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1A120B]/80 border border-[#5C442A] flex items-center justify-center text-amber-200 hover:text-white transition-colors shadow"
          >
            {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onBackToMenu();
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1A120B]/80 border border-[#5C442A] flex items-center justify-center text-amber-200 hover:text-white transition-colors shadow"
            title="خروج للقائمة"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* TOP: Opponent Hand (Face Down) */}
      <div className="relative z-10 flex flex-col items-center -mt-1 sm:mt-1">
        {botBanter && (
          <div className="mb-2 px-3 py-1.5 rounded-2xl bg-amber-950/95 border-2 border-amber-500 text-amber-200 text-xs sm:text-sm font-black animate-in fade-in zoom-in duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            💬 {botBanter}
          </div>
        )}
        <div className="flex items-center justify-center -space-x-4 sm:-space-x-6">
          {player2.hand.map((card, idx) => (
            <div
              key={card.id || idx}
              className="animate-card-slide-top"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <PlayingCard
                card={card}
                isFaceUp={false}
                size="sm"
                className="transform hover:-translate-y-1 transition-transform"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Table Felt Playing Surface matching screenshot 1 & 2 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2">
        
        {/* Deck stack on the side */}
        <div className="absolute left-2 sm:left-auto sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none opacity-80 sm:opacity-100">
          <div className="relative w-11 h-16 sm:w-16 sm:h-24">
            {deck.length > 0 ? (
              <>
                <div className="absolute inset-0 bg-red-950 rounded-md border border-amber-900/50 shadow-md translate-x-0.5 translate-y-0.5" />
                <PlayingCard
                  card={{ id: 'deck-top', suit: 'hearts', rank: 'A', value: 1 }}
                  isFaceUp={false}
                  size="sm"
                />
              </>
            ) : (
              <div className="w-11 h-16 sm:w-16 sm:h-24 rounded-md border-2 border-dashed border-amber-700/40 flex items-center justify-center text-[9px] sm:text-[10px] text-amber-400 font-bold">
                فرغت
              </div>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-200 mt-0.5 font-mono tabular-nums">
            {deck.length} ورقة
          </span>
        </div>

        {/* Center Cards on the Table */}
        <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-2xl min-h-[120px] sm:min-h-[160px] p-3 rounded-2xl bg-black/20 backdrop-blur-[2px] border border-emerald-900/30">
          {tableCards.length === 0 ? (
            <div className="text-center text-emerald-200/60 font-bold text-sm sm:text-base py-6 animate-pulse">
              الترابيزة ممسوحة! ارمي ورقة من يدك
            </div>
          ) : (
            tableCards.map((card, idx) => {
              const isWillBeEaten = highlightedCardIds.has(card.id);
              const isNewlyThrown = lastThrownCardId === card.id;
              // Deterministic slight angle for authentic messy table look
              const rotationDeg = ((idx % 5) - 2) * 2.5;

              return (
                <div
                  key={card.id}
                  style={
                    {
                      '--rot': `${rotationDeg}deg`,
                      transform: isNewlyThrown ? undefined : `rotate(${rotationDeg}deg)`,
                    } as React.CSSProperties
                  }
                >
                  <PlayingCard
                    card={card}
                    isFaceUp={true}
                    size="md"
                    isHighlighted={isWillBeEaten}
                    isThrowing={isNewlyThrown}
                    isBasraShaking={isTableShaking}
                    className="transition-all duration-300"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Action / Eating Status Bar */}
        <div className="mt-3 px-4 py-1.5 rounded-full bg-[#120C07]/80 border border-[#5C442A] text-amber-200 text-xs sm:text-sm font-bold shadow-md flex items-center gap-2">
          {currentTurn === 'p1' ? (
            <span className="text-emerald-400">● دورك:</span>
          ) : (
            <span className="text-amber-400">● دور الخصم:</span>
          )}
          <span>{lastActionText}</span>
        </div>

        {/* Basra Celebration Banner (Overlay Popup) */}
        {activeBasraBanner && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-in zoom-in-75 duration-300">
            <div className="flex flex-col items-center px-8 py-5 rounded-2xl bg-gradient-to-b from-[#8B1A1A] to-[#4A0E0E] border-4 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.8)] text-center">
              <span className="text-4xl sm:text-5xl font-black text-amber-300 font-['El_Messiri',serif] tracking-wider drop-shadow-lg animate-bounce">
                {activeBasraBanner.text}
              </span>
              <span className="text-lg sm:text-xl font-bold text-white mt-1">
                {activeBasraBanner.subText}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM: Player Hand and Player Profile matching screenshot 1, 2, 3 */}
      <div className="relative z-10 w-full px-2 sm:px-8 pb-2 sm:pb-4 flex flex-col items-center">
        
        {/* Player Chat Bubble */}
        {playerChatBubble && (
          <div className="mb-2 px-3.5 py-1.5 rounded-2xl bg-amber-500 text-neutral-950 text-xs sm:text-sm font-black animate-in fade-in zoom-in duration-200 shadow-[0_4px_25px_rgba(245,158,11,0.7)] flex items-center gap-1.5 border-2 border-amber-300">
            {playerChatBubble.emoji && <span className="text-2xl">{playerChatBubble.emoji}</span>}
            <span>{playerChatBubble.text || playerChatBubble.label}</span>
          </div>
        )}

        {/* Interactive Hand Cards */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-2">
          {player1.hand.map((card, idx) => {
            const isSelected = selectedCardId === card.id;
            return (
              <div
                key={card.id}
                className="animate-card-slide-bottom"
                style={{ animationDelay: `${idx * 0.07}s` }}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <PlayingCard
                  card={card}
                  isFaceUp={true}
                  isSelectable={currentTurn === 'p1'}
                  isSelected={isSelected}
                  onClick={() => handleUserCardClick(card)}
                  size="lg"
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Profile Bar matching Screenshot 1 & 2 */}
        <div className="w-full flex items-center justify-between gap-2">
          
          {/* Left Actions: Chat & Status */}
          <div className="flex items-center gap-2">
            <InGameChat
              onSendMessage={handlePlayerSendMessage}
              onSendSticker={handlePlayerSendSticker}
            />

            <div className="text-[11px] sm:text-xs text-amber-200/90 font-bold hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-amber-900/40">
              <span className="text-amber-400">⚡</span>
              <span>اضغط على أي كارت للنزول فوراً على الترابيزة</span>
            </div>
          </div>

          {/* User Profile Badge (Right Side) matching screenshot */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#1A120B]/90 border border-[#5C442A] p-1.5 sm:p-2 rounded-xl shadow-lg shrink-0">
            <div className="text-left sm:text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-bold text-xs sm:text-sm text-neutral-100">{player1.name}</span>
                {currentTurn === 'p1' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-amber-300">
                <span>النقاط: <strong className="font-mono text-sm">{player1.totalScore}</strong></span>
                <span>·</span>
                <span>اللمة: <strong className="font-mono">{player1.capturedCards.length}</strong></span>
                {player1.basraCount > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-red-400 font-bold">باصرات: {player1.basraCount}</span>
                  </>
                )}
              </div>
            </div>

            {/* Profile Picture with Frame & Emote Button positioned right on top */}
            <div className="relative">
              {/* Floating Emote Overlay popping above avatar */}
              {playerActiveEmote && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none animate-in zoom-in duration-200">
                  <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 text-xs font-black shadow-[0_4px_25px_rgba(245,158,11,0.8)] border-2 border-white flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-xl animate-bounce">{playerActiveEmote.emoji}</span>
                    <span>{playerActiveEmote.label}</span>
                  </div>
                  {/* Speech bubble pointer arrow */}
                  <div className="w-2.5 h-2.5 bg-amber-500 rotate-45 -mt-1 shadow-sm border-r-2 border-b-2 border-white" />
                </div>
              )}

              {/* Emote Trigger Button placed right above profile avatar */}
              <div className="absolute -top-2.5 -right-2.5 z-20">
                <EmotePicker onSelectEmote={handleSelectEmote} />
              </div>

              {/* Avatar Image Container */}
              <div className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 ${
                userProfile.frameId === 'frame_royal_blue'
                  ? 'border-blue-400 ring-2 ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                  : userProfile.frameId === 'frame_pharaoh_gold'
                  ? 'border-amber-400 ring-2 ring-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  : 'border-amber-800'
              }`}>
                <img
                  src={player1.avatar}
                  alt={player1.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ROUND / MATCH SUMMARY MODAL */}
      {isRoundSummaryOpen && roundScoresData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#1A120B] border-2 border-[#8C6D46] rounded-2xl shadow-2xl p-5 sm:p-6 text-neutral-100 text-center">
            
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-950/80 border border-amber-600 flex items-center justify-center text-amber-300 mb-3">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-amber-300 font-['El_Messiri',serif]">
              {isMatchOver
                ? player1.totalScore > player2.totalScore
                  ? 'مبروك! كسبت الماتش يا معلّم! 🎉'
                  : 'هارد لك! الخصم كسب الماتش'
                : 'نهاية الصكة! جدول حساب النقاط'}
            </h3>

            <p className="text-xs text-neutral-400 mt-1 mb-5">
              توزيعة كاملة (٥٢ ورقة) · حساب الكومة والباصرات على أصولها
            </p>

            {/* Scoreboard table */}
            <div className="grid grid-cols-3 gap-2 bg-[#24170E] p-3 rounded-xl border border-[#543D24] text-xs sm:text-sm font-bold mb-5">
              <div className="text-neutral-400">البند</div>
              <div className="text-amber-300">{player1.name}</div>
              <div className="text-amber-300">{player2.name}</div>

              {/* Cards collected */}
              <div className="text-right text-neutral-300">اللمة (الكومة):</div>
              <div className="font-mono">{roundScoresData.player1.cardsCount} ورقة</div>
              <div className="font-mono">{roundScoresData.player2.cardsCount} ورقة</div>

              {/* Majority points (30 pts) */}
              <div className="text-right text-neutral-300">نقاط الكومة (+٣٠):</div>
              <div className="text-emerald-400 font-mono">+{roundScoresData.player1.majorityPoints}</div>
              <div className="text-emerald-400 font-mono">+{roundScoresData.player2.majorityPoints}</div>

              {/* Basra points */}
              <div className="text-right text-neutral-300">نقاط الباصرات:</div>
              <div className="text-red-400 font-mono">+{roundScoresData.player1.basraPoints}</div>
              <div className="text-red-400 font-mono">+{roundScoresData.player2.basraPoints}</div>

              {/* Total round score */}
              <div className="text-right border-t border-[#543D24] pt-2 text-white">مجموع الصكة:</div>
              <div className="border-t border-[#543D24] pt-2 text-amber-400 font-black font-mono text-base">
                +{roundScoresData.player1.totalRoundScore}
              </div>
              <div className="border-t border-[#543D24] pt-2 text-amber-400 font-black font-mono text-base">
                +{roundScoresData.player2.totalRoundScore}
              </div>

              {/* Match total */}
              <div className="text-right border-t border-[#543D24] pt-2 text-amber-200">السكور التراكمي:</div>
              <div className="border-t border-[#543D24] pt-2 text-white font-black font-mono text-lg">
                {player1.totalScore}
              </div>
              <div className="border-t border-[#543D24] pt-2 text-white font-black font-mono text-lg">
                {player2.totalScore}
              </div>
            </div>

            <div className="flex gap-3">
              {isMatchOver ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onBackToMenu();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-sm shadow-md hover:from-amber-500 hover:to-amber-600 transition-all"
                >
                  العودة للقائمة الرئيسية
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    startNewRound();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-sm shadow-md hover:from-emerald-500 hover:to-emerald-600 transition-all"
                >
                  بدء الصكة التالية 🃏
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-2xl bg-[#1A120B] border-2 border-[#8C6D46] shadow-2xl flex flex-col items-center max-w-sm text-center">
            <h3 className="text-2xl font-black text-amber-300 font-['El_Messiri',serif] mb-4">
              اللعبة متوقفة مؤقتاً
            </h3>
            <div className="space-y-3 w-full">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors"
              >
                استئناف اللعب
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  startNewRound();
                  setIsPaused(false);
                }}
                className="w-full py-2 rounded-xl bg-[#2A1D13] hover:bg-[#3B2818] border border-[#5C442A] text-amber-200 font-bold text-sm transition-colors"
              >
                إعادة بدء الصكة
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onBackToMenu();
                }}
                className="w-full py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 font-bold text-sm transition-colors"
              >
                خروج للقائمة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

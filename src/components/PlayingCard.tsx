import React from 'react';
import { Card } from '../types/game';

// High-fidelity art assets
import luxCardBack from '../assets/images/lux_card_back_1790479981628.jpg';
import jackArt from '../assets/images/jack_court_art_1790479992886.jpg';
import queenArt from '../assets/images/queen_court_art_1790480004373.jpg';
import kingArt from '../assets/images/king_court_art_1790480014039.jpg';
import kommyArt from '../assets/images/kommy_art_1790480025041.jpg';

interface PlayingCardProps {
  card: Card;
  isFaceUp?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean; // For table cards about to be eaten
  isThrowing?: boolean; // Thrown onto table animation
  isDrawing?: boolean; // Dealt / drawn from deck animation
  isBasraShaking?: boolean; // Basra celebration vibration on card
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceUp = true,
  isSelectable = false,
  isSelected = false,
  isHighlighted = false,
  isThrowing = false,
  isDrawing = false,
  isBasraShaking = false,
  onClick,
  size = 'md',
  className = '',
  style = {},
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitColor = isRed ? '#C91818' : '#171717';

  const suitSymbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const suitSymbol = suitSymbols[card.suit] || '♠';

  // Sizing definitions with perfect 2.5:3.5 playing card aspect ratio
  const sizeStyles = {
    sm: 'w-11 h-16 sm:w-14 sm:h-20 text-[9px] sm:text-[10px] rounded-md sm:rounded-lg',
    md: 'w-16 h-24 sm:w-22 sm:h-32 text-[10px] sm:text-xs rounded-lg sm:rounded-xl',
    lg: 'w-20 h-28 sm:w-28 sm:h-40 text-xs sm:text-sm rounded-lg sm:rounded-xl',
  }[size];

  // Back of Card (Face Down)
  if (!isFaceUp) {
    return (
      <div
        className={`relative ${sizeStyles} overflow-hidden select-none transition-all duration-300 transform group ${
          isSelectable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-95' : ''
        } ${isDrawing ? 'animate-card-slide-top' : ''} ${className}`}
        style={{
          boxShadow: '0 8px 18px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.5)',
          ...style,
        }}
      >
        <img
          src={luxCardBack}
          alt="ظهر الكوتشينة المصرية"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-[inherit] pointer-events-none"
        />
        {/* Subtle glossy sheen line across card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 border-[1.5px] border-[#DEB887]/60 rounded-[inherit] pointer-events-none" />
      </div>
    );
  }

  // Determine Court Character / Special Illustration
  const isJack = card.rank === 'J';
  const isQueen = card.rank === 'Q';
  const isKing = card.rank === 'K';
  const isKommy = card.isKommy;

  const courtImage = isKommy
    ? kommyArt
    : isJack
    ? jackArt
    : isQueen
    ? queenArt
    : isKing
    ? kingArt
    : null;

  // Render Pip Grid for number cards A - 10
  const renderPips = () => {
    if (courtImage) return null;

    if (card.rank === 'A') {
      return (
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-4xl sm:text-5xl font-black filter drop-shadow-sm select-none"
            style={{ color: suitColor }}
          >
            {suitSymbol}
          </span>
          <span className="text-[9px] font-bold tracking-widest text-neutral-400 mt-0.5">
            إكيك
          </span>
        </div>
      );
    }

    const num = card.value; // 2 to 10
    return (
      <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[70px]">
          {Array.from({ length: Math.min(num, 6) }).map((_, i) => (
            <span
              key={i}
              className="text-base sm:text-lg leading-none"
              style={{ color: suitColor }}
            >
              {suitSymbol}
            </span>
          ))}
        </div>
        <span
          className="text-lg sm:text-xl font-black tracking-tighter opacity-80"
          style={{ color: suitColor }}
        >
          {card.rank}
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={isSelectable && onClick ? onClick : undefined}
      className={`relative ${sizeStyles} bg-[#FCFBF7] flex flex-col justify-between p-1.5 sm:p-2 select-none transition-all duration-300 ease-out border border-neutral-300/80 ${
        isSelectable ? 'cursor-pointer hover:-translate-y-3.5 hover:shadow-2xl active:scale-95' : ''
      } ${
        isSelected
          ? '-translate-y-4 ring-4 ring-amber-400 shadow-[0_18px_32px_rgba(245,158,11,0.65)] scale-105 z-20'
          : ''
      } ${
        isHighlighted
          ? 'ring-4 ring-emerald-400 bg-emerald-50/70 scale-105 shadow-[0_0_25px_rgba(52,211,153,0.85)] animate-pulse z-10'
          : ''
      } ${
        isThrowing ? 'animate-table-card-in' : ''
      } ${
        isDrawing ? 'animate-card-slide-bottom' : ''
      } ${
        isBasraShaking ? 'animate-basra-shake ring-4 ring-amber-400' : ''
      } ${className}`}
      style={{
        boxShadow: isHighlighted
          ? '0 0 25px rgba(52, 211, 153, 0.7)'
          : isSelected
          ? '0 18px 30px rgba(0,0,0,0.6)'
          : '0 8px 18px rgba(0,0,0,0.35), 0 2px 5px rgba(0,0,0,0.15)',
        ...style,
      }}
    >
      {/* Linen paper texture subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-neutral-100/60 rounded-[inherit] pointer-events-none" />

      {/* TOP LEFT INDEX (Rank & Pip) */}
      <div
        className="flex flex-col items-center leading-none font-bold z-10"
        style={{ color: suitColor }}
      >
        <span className="text-xs sm:text-sm font-black tracking-tighter font-mono">
          {card.rank}
        </span>
        <span className="text-xs sm:text-base -mt-0.5 filter drop-shadow-sm">
          {suitSymbol}
        </span>
      </div>

      {/* CENTER CONTENT: Either high-res Court Portrait or Beautiful Pips */}
      <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
        {courtImage ? (
          <div className="relative w-12 h-16 sm:w-16 sm:h-22 rounded-md overflow-hidden border border-amber-600/40 shadow-inner bg-amber-50 flex items-center justify-center">
            <img
              src={courtImage}
              alt={card.rank}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-105"
            />
            {/* Fine golden frame */}
            <div className="absolute inset-0 border border-amber-400/50 pointer-events-none" />
            
            {/* Arabic name badge at bottom of portrait */}
            <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[#F5E6CC] text-[8px] sm:text-[9px] font-bold text-center py-0.5 backdrop-blur-[1px]">
              {isKommy ? 'الكومي ٧♦' : isJack ? 'الولد (قشاش)' : isQueen ? 'البنت' : 'الشايب'}
            </div>
          </div>
        ) : (
          renderPips()
        )}
      </div>

      {/* BOTTOM RIGHT INDEX (Rotated 180 deg) */}
      <div
        className="flex flex-col items-center leading-none font-bold z-10 rotate-180 self-end"
        style={{ color: suitColor }}
      >
        <span className="text-xs sm:text-sm font-black tracking-tighter font-mono">
          {card.rank}
        </span>
        <span className="text-xs sm:text-base -mt-0.5 filter drop-shadow-sm">
          {suitSymbol}
        </span>
      </div>

      {/* Special golden foil emblem for 7 of Diamonds (Kommy) */}
      {isKommy && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
          ★ كومي
        </div>
      )}

      {/* Subtle Jack sweep badge */}
      {isJack && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-700 to-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
          قشاش
        </div>
      )}
    </div>
  );
};

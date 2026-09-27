/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { TableBoard } from './components/TableBoard';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatsModal } from './components/StatsModal';
import { StoreAchievementsModal } from './components/StoreAchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialPractice } from './components/TutorialPractice';
import { EditProfileModal } from './components/EditProfileModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { AIDifficulty, GameSettings, Achievement, StoreItem, DailyChallenge } from './types/game';
import { soundFx } from './utils/soundEffects';
import { loadSavedDailyChallenge, saveDailyChallenge } from './utils/dailyChallenge';

import avatarYoung from './assets/images/avatar_young_cairo_1790480291364.jpg';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_5_wins',
    title: 'حماسية - اكسب 5 ماتشات',
    description: 'اثبت جدارتك على ترابيزة القهوة واكسب ٥ مباريات',
    rewardCoins: 15,
    currentProgress: 1,
    maxProgress: 5,
    completed: false,
    category: 'wins',
  },
  {
    id: 'ach_15_wins',
    title: 'نجم القهوة - اكسب 15 ماتش',
    description: 'كن سيد القعدة واهزم كل المعلمين ١٥ مرة',
    rewardCoins: 25,
    currentProgress: 1,
    maxProgress: 15,
    completed: false,
    category: 'wins',
  },
  {
    id: 'ach_10_basras',
    title: 'قناص الباصرات - اعمل 10 باصرات',
    description: 'امسح الترابيزة واعمل ١٠ باصرات في المباريات',
    rewardCoins: 15,
    currentProgress: 3,
    maxProgress: 10,
    completed: false,
    category: 'basras',
  },
  {
    id: 'ach_30_basras',
    title: 'رعب القعدة - اعمل 30 باصرة',
    description: 'اجعل خصمك يرتعب من رميتك بـ ٣٠ باصرة',
    rewardCoins: 30,
    currentProgress: 3,
    maxProgress: 30,
    completed: false,
    category: 'basras',
  },
  {
    id: 'ach_friends',
    title: 'عال الشيشة - اكسب ماتش مع صحابك',
    description: 'العب ماتش محلي pass-and-play مع صديقك واكسبه',
    rewardCoins: 10,
    currentProgress: 0,
    maxProgress: 1,
    completed: false,
    category: 'games',
  },
  {
    id: 'ach_50_pts',
    title: 'دوانة معتقة - اجمع 50 نقطة',
    description: 'اجمع ٥٠ نقطة أو أكثر في صكة واحدة بفضل الكومة والباصرات',
    rewardCoins: 20,
    currentProgress: 24,
    maxProgress: 50,
    completed: false,
    category: 'games',
  },
  {
    id: 'ach_jack_basra',
    title: 'ولد الحريف - باصرة ولد على ولد',
    description: 'حقق الضربة القاضية بباصرة ولد على ولد (+٢٠ نقطة)',
    rewardCoins: 25,
    currentProgress: 0,
    maxProgress: 1,
    completed: false,
    category: 'basras',
  },
];

const INITIAL_STORE_ITEMS: StoreItem[] = [
  {
    id: 'frame_royal_blue',
    type: 'frame',
    name: 'إطار أزرق ملكي متوهج',
    price: 0,
    previewColor: '#3B82F6',
    unlocked: true,
  },
  {
    id: 'frame_pharaoh_gold',
    type: 'frame',
    name: 'إطار ذهبي فرعوني',
    price: 80,
    previewColor: '#F59E0B',
    unlocked: false,
  },
  {
    id: 'frame_vintage_wood',
    type: 'frame',
    name: 'إطار خشب قهوة بلدي',
    price: 40,
    previewColor: '#92400E',
    unlocked: true,
  },
  {
    id: 'frame_diamond',
    type: 'frame',
    name: 'إطار ألماسي فاخر',
    price: 150,
    previewColor: '#06B6D4',
    unlocked: false,
  },
];

interface UserProfile {
  name: string;
  avatar: string;
  frameId: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game'>('menu');
  const [activeDifficulty, setActiveDifficulty] = useState<AIDifficulty>('medium');
  const [isMultiplayer, setIsMultiplayer] = useState(false);

  // Modals
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);

  // Daily Challenge state
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(() => loadSavedDailyChallenge());

  // User Profile with localStorage memory
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('basra_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      name: 'حسن رمضان',
      avatar: avatarYoung,
      frameId: 'frame_royal_blue',
    };
  });

  const handleSaveProfile = (name: string, avatar: string) => {
    const updated: UserProfile = { ...userProfile, name, avatar };
    setUserProfile(updated);
    try {
      localStorage.setItem('basra_user_profile', JSON.stringify(updated));
    } catch {}
  };

  // Currency & Progress
  const [coins, setCoins] = useState(150); // Initial 150 matching screenshot 4
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [storeItems, setStoreItems] = useState<StoreItem[]>(INITIAL_STORE_ITEMS);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    targetScore: 101,
    soundVolume: 0.8,
    ambientSound: true,
    voiceCallouts: true,
    showHints: true,
    cardBackId: 'classic_red',
    fastAnimations: false,
    jackBasraValue: 20,
  });

  // Stats
  const [stats, setStats] = useState({
    matchesPlayed: 4,
    matchesWon: 3,
    totalBasras: 7,
    totalJackBasras: 1,
    totalEatenCards: 68,
    highestMatchScore: 112,
    coinsEarned: 240,
  });

  const handleStartGame = (diff: AIDifficulty, multiplayer: boolean = false) => {
    setActiveDifficulty(diff);
    setIsMultiplayer(multiplayer);
    setCurrentScreen('game');
  };

  const handleMatchFinished = (
    won: boolean,
    basras: number,
    jackBasras: number,
    score: number,
    telemetry?: {
      playedAnySeven: boolean;
      scoreDifference: number;
      wonMajorityRounds: number;
    }
  ) => {
    const earnedCoins = won ? 30 : 10;
    setCoins(prev => prev + earnedCoins);

    // Update Daily Challenge progress if not completed
    setDailyChallenge(prev => {
      if (prev.completed) return prev;

      let newProgress = prev.progress;
      if (prev.type === 'no_sevens' && won && !telemetry?.playedAnySeven) {
        newProgress = 1;
      } else if (prev.type === 'three_basras' && basras >= 3) {
        newProgress = Math.max(newProgress, basras);
      } else if (prev.type === 'jack_basra' && jackBasras >= 1) {
        newProgress = 1;
      } else if (prev.type === 'majority_win' && (telemetry?.wonMajorityRounds || 0) > 0) {
        newProgress = Math.min(prev.target, prev.progress + (telemetry?.wonMajorityRounds || 0));
      } else if (prev.type === 'speed_win' && won && (telemetry?.scoreDifference || 0) >= 30) {
        newProgress = 1;
      }

      const isCompleted = newProgress >= prev.target;
      const updatedChallenge: DailyChallenge = {
        ...prev,
        progress: newProgress,
        completed: isCompleted,
      };
      saveDailyChallenge(updatedChallenge);
      return updatedChallenge;
    });

    setStats(prev => ({
      ...prev,
      matchesPlayed: prev.matchesPlayed + 1,
      matchesWon: won ? prev.matchesWon + 1 : prev.matchesWon,
      totalBasras: prev.totalBasras + basras,
      totalJackBasras: prev.totalJackBasras + jackBasras,
      highestMatchScore: Math.max(prev.highestMatchScore, score),
      coinsEarned: prev.coinsEarned + earnedCoins,
    }));

    // Update achievements progress
    setAchievements(prev =>
      prev.map(ach => {
        if (ach.id === 'ach_5_wins' && won) {
          const next = Math.min(ach.maxProgress, ach.currentProgress + 1);
          return { ...ach, currentProgress: next };
        }
        if (ach.id === 'ach_15_wins' && won) {
          const next = Math.min(ach.maxProgress, ach.currentProgress + 1);
          return { ...ach, currentProgress: next };
        }
        if (ach.id === 'ach_10_basras') {
          const next = Math.min(ach.maxProgress, ach.currentProgress + basras);
          return { ...ach, currentProgress: next };
        }
        if (ach.id === 'ach_30_basras') {
          const next = Math.min(ach.maxProgress, ach.currentProgress + basras);
          return { ...ach, currentProgress: next };
        }
        if (ach.id === 'ach_jack_basra' && jackBasras > 0) {
          return { ...ach, currentProgress: 1 };
        }
        if (ach.id === 'ach_50_pts' && score > ach.currentProgress) {
          return { ...ach, currentProgress: Math.min(ach.maxProgress, score) };
        }
        if (ach.id === 'ach_friends' && isMultiplayer && won) {
          return { ...ach, currentProgress: 1 };
        }
        return ach;
      })
    );
  };

  const handleClaimAchievement = (id: string) => {
    const ach = achievements.find(a => a.id === id);
    if (!ach || ach.completed) return;

    setCoins(prev => prev + ach.rewardCoins);
    setAchievements(prev =>
      prev.map(a => (a.id === id ? { ...a, completed: true } : a))
    );
  };

  const handleClaimDailyChallenge = () => {
    if (!dailyChallenge.completed || dailyChallenge.claimed) return;
    setCoins(prev => prev + dailyChallenge.rewardCoins);
    const updated: DailyChallenge = {
      ...dailyChallenge,
      claimed: true,
    };
    setDailyChallenge(updated);
    saveDailyChallenge(updated);
  };

  const handleSelectFrame = (id: string) => {
    setUserProfile(prev => ({ ...prev, frameId: id }));
  };

  const handleUnlockItem = (id: string, price: number) => {
    if (coins < price) return;
    setCoins(prev => prev - price);
    setStoreItems(prev =>
      prev.map(item => (item.id === id ? { ...item, unlocked: true } : item))
    );
    setUserProfile(prev => ({ ...prev, frameId: id }));
  };

  return (
    <main className="w-full h-screen bg-neutral-950 text-neutral-100 select-none overflow-hidden font-['Cairo',sans-serif]">
      {currentScreen === 'menu' ? (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenStore={() => setIsStoreOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
          dailyChallenge={dailyChallenge}
          coins={coins}
          userProfile={userProfile}
        />
      ) : (
        <TableBoard
          difficulty={activeDifficulty}
          settings={settings}
          userProfile={userProfile}
          onBackToMenu={() => setCurrentScreen('menu')}
          onMatchFinished={handleMatchFinished}
          isMultiplayer={isMultiplayer}
        />
      )}

      {/* MODALS */}
      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => setIsDailyChallengeOpen(false)}
        challenge={dailyChallenge}
        onClaimReward={handleClaimDailyChallenge}
        onPlayNow={() => handleStartGame('medium', false)}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentName={userProfile.name}
        currentAvatar={userProfile.avatar}
        currentFrameId={userProfile.frameId}
        onSaveProfile={handleSaveProfile}
      />

      <TutorialPractice
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onCompleteTutorial={() => {
          soundFx.playCoin();
          setCoins(prev => prev + 20);
        }}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        playerName={userProfile.name}
      />

      <StoreAchievementsModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        coins={coins}
        onUpdateCoins={setCoins}
        achievements={achievements}
        onClaimAchievement={handleClaimAchievement}
        storeItems={storeItems}
        selectedFrameId={userProfile.frameId}
        onSelectFrame={handleSelectFrame}
        selectedCardBackId={settings.cardBackId}
        onSelectCardBack={(id) => setSettings(prev => ({ ...prev, cardBackId: id }))}
        onUnlockItem={handleUnlockItem}
        playerName={userProfile.name}
        playerAvatar={userProfile.avatar}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
      />
    </main>
  );
}

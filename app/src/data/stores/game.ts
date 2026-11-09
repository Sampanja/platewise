import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, STORAGE_PREFIX } from '../storage';

/**
 * What has already been celebrated. XP, levels and achievements themselves
 * are derived from the diary and other data (domain/gamification.ts); this
 * only remembers which ones the user has seen, so each is celebrated once.
 */
type GameSeenState = {
  /** False until the first computation: existing progress is then marked seen silently. */
  initialized: boolean;
  seenAchievements: string[];
  seenLevel: number;
  markSeen: (achievements: string[], level: number) => void;
  reset: () => void;
};

export const useGameStore = create<GameSeenState>()(
  persist(
    (set) => ({
      initialized: false,
      seenAchievements: [],
      seenLevel: 1,
      markSeen: (achievements, level) =>
        set((state) => ({
          initialized: true,
          seenAchievements: [...new Set([...state.seenAchievements, ...achievements])],
          seenLevel: Math.max(state.seenLevel, level),
        })),
      reset: () => set({ initialized: false, seenAchievements: [], seenLevel: 1 }),
    }),
    { name: `${STORAGE_PREFIX}game`, storage: deviceStorage, version: 1 },
  ),
);

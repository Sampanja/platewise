import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { newId } from '@/lib/id';
import type { ChatMessage, ChatRole } from '@/services/assistant';

import { deviceStorage, STORAGE_PREFIX } from '../storage';

/**
 * Chat history on the device (it can contain health topics: never logged or
 * sent to analytics). The daily counter is the client side of the cost limit;
 * the backend enforces its own.
 */
const KEEP_MESSAGES = 100;

type ChatState = {
  messages: ChatMessage[];
  /** Messages sent per local date. */
  sentByDate: Record<string, number>;
  add: (role: ChatRole, text: string, recipeIds?: string[]) => ChatMessage;
  countSent: (date: string) => void;
  clear: () => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      sentByDate: {},
      add: (role, text, recipeIds) => {
        const message: ChatMessage = { id: newId(), role, text, createdAt: new Date().toISOString(), recipeIds };
        set((state) => ({ messages: [...state.messages, message].slice(-KEEP_MESSAGES) }));
        return message;
      },
      countSent: (date) => set((state) => ({ sentByDate: { [date]: (state.sentByDate[date] ?? 0) + 1 } })),
      clear: () => set({ messages: [] }),
      reset: () => set({ messages: [], sentByDate: {} }),
    }),
    { name: `${STORAGE_PREFIX}chat`, storage: deviceStorage, version: 1 },
  ),
);

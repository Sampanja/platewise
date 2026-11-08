import { create } from 'zustand';

/** Short confirmation shown at the bottom, optionally with one action ("Kumoa"). */
export type ToastMessage = {
  id: number;
  message: string;
  action?: { label: string; onPress: () => void };
};

type ToastState = {
  current: ToastMessage | null;
  show: (message: string, action?: ToastMessage['action']) => void;
  hide: (id: number) => void;
};

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, action) => set({ current: { id: nextId++, message, action } }),
  hide: (id) => set((state) => (state.current?.id === id ? { current: null } : state)),
}));

export function showToast(message: string, action?: ToastMessage['action']): void {
  useToastStore.getState().show(message, action);
}

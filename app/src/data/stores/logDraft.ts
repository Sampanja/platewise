import { create } from 'zustand';

import type { RecognizedFood } from '@/services/foodRecognition';

/**
 * Text or speech → the review screen. Not persisted: an unsaved meal draft is
 * simply dropped, like an unsaved photo result.
 */
type LogDraftState = {
  text: string;
  foods: RecognizedFood[];
  unmatched: string[];
  set: (draft: { text: string; foods: RecognizedFood[]; unmatched: string[] }) => void;
};

export const useLogDraftStore = create<LogDraftState>()((set) => ({
  text: '',
  foods: [],
  unmatched: [],
  set: (draft) => set(draft),
}));

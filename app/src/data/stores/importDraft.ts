import { create } from 'zustand';

import type { ImportedRecipe } from '../types';

/** Link or typed recipe → the ingredient review. Not persisted: an unsaved import is dropped. */
export type ImportDraft = Omit<ImportedRecipe, 'id' | 'createdAt'> & { id?: string };

type ImportDraftState = {
  draft: ImportDraft | null;
  set: (draft: ImportDraft) => void;
  clear: () => void;
};

export const useImportDraftStore = create<ImportDraftState>()((set) => ({
  draft: null,
  set: (draft) => set({ draft }),
  clear: () => set({ draft: null }),
}));

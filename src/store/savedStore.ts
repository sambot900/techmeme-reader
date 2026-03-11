import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArticleSummary, SavedArticle } from '@/types';

interface SavedStore {
  saved: SavedArticle[];
  saveArticle: (article: ArticleSummary) => void;
  unsaveArticle: (id: string) => void;
  isArticleSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      saved: [],

      saveArticle: (article) => {
        if (get().saved.some(s => s.id === article.id)) return;
        const bookmark: SavedArticle = {
          id:      article.id,
          title:   article.title,
          url:     article.url,
          source:  article.source,
          savedAt: new Date().toISOString(),
        };
        set(s => ({ saved: [bookmark, ...s.saved] }));
      },

      unsaveArticle: (id) => set(s => ({ saved: s.saved.filter(a => a.id !== id) })),

      isArticleSaved: (id) => get().saved.some(a => a.id === id),
    }),
    {
      name: 'saved-articles',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

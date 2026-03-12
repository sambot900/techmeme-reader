import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, TextSize, TechmemeSection, ArticleView, AccentColor, FontFamily } from '@/types';

interface SettingsStore extends Settings {
  toggleNightMode: () => void;
  setTextSize: (size: TextSize) => void;
  setDefaultSection: (section: TechmemeSection) => void;
  setDefaultArticleView: (view: ArticleView) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontFamily: (font: FontFamily) => void;
  toggleDevMode: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      nightMode: true,
      textSize: 'medium',
      defaultSection: 'top',
      defaultArticleView: 'reader',
      accentColor: 'blue',
      fontFamily: 'system',
      devMode: false,
      toggleNightMode: () => set(s => ({ nightMode: !s.nightMode })),
      setTextSize: (textSize) => set({ textSize }),
      setDefaultSection: (defaultSection) => set({ defaultSection }),
      setDefaultArticleView: (defaultArticleView) => set({ defaultArticleView }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      toggleDevMode: () => set(s => ({ devMode: !s.devMode })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

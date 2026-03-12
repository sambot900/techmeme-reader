import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryStore {
  readIds: string[];
  markRead: (id: string) => void;
  isRead: (id: string) => boolean;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      readIds: [],
      markRead: (id) => {
        if (get().readIds.includes(id)) return;
        set(s => ({ readIds: [...s.readIds, id] }));
      },
      isRead: (id) => get().readIds.includes(id),
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

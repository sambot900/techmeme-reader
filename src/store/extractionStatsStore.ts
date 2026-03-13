import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Per-domain extraction outcome tracking.
// After MIN_ATTEMPTS, if success rate is at or below MAX_SUCCESS_RATE, the domain
// is considered "skip" — extraction is bypassed and the browser view shown immediately.

const MIN_ATTEMPTS = 3;
const MAX_SUCCESS_RATE = 0.05; // 5%

interface DomainStats {
  successes: number;
  failures: number; // includes 'failed' and 'restricted'
}

interface ExtractionStatsStore {
  domains: Record<string, DomainStats>;
  recordSuccess: (url: string) => void;
  recordFailure: (url: string) => void;
  shouldSkip: (url: string) => boolean;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export const useExtractionStatsStore = create<ExtractionStatsStore>()(
  persist(
    (set, get) => ({
      domains: {},

      recordSuccess: (url) => {
        const host = hostnameOf(url);
        if (!host) return;
        set(s => {
          const prev = s.domains[host] ?? { successes: 0, failures: 0 };
          return { domains: { ...s.domains, [host]: { ...prev, successes: prev.successes + 1 } } };
        });
      },

      recordFailure: (url) => {
        const host = hostnameOf(url);
        if (!host) return;
        set(s => {
          const prev = s.domains[host] ?? { successes: 0, failures: 0 };
          return { domains: { ...s.domains, [host]: { ...prev, failures: prev.failures + 1 } } };
        });
      },

      shouldSkip: (url) => {
        const host = hostnameOf(url);
        if (!host) return false;
        const stats = get().domains[host];
        if (!stats) return false;
        const total = stats.successes + stats.failures;
        if (total < MIN_ATTEMPTS) return false;
        return (stats.successes / total) <= MAX_SUCCESS_RATE;
      },
    }),
    {
      name: 'extraction-stats',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

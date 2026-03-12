import { create } from 'zustand';
import { ArticleContent, ArticleSummary, ExtractionMethod } from '@/types';
import { ExtractionResult, extractArticle } from '@/api/extractor';

interface ContentStore {
  content: Record<string, ArticleContent>;
  pendingExtractions: Record<string, string>;

  fetchContent: (id: string, url: string) => void;
  completeExtraction: (id: string, result: ExtractionResult) => void;
  // Background pre-extraction: all top-level articles first, then all related sources
  preExtractAll: (articles: ArticleSummary[]) => void;
}

// Tracks whether a background extraction run is already in progress
let bgRunning = false;
const bgQueue: { id: string; url: string }[] = [];

function enqueueBg(id: string, url: string) {
  const store = useContentStore.getState();
  const existing = store.content[id];
  if (existing && existing.status !== 'failed') return; // already done/in-progress
  if (bgQueue.some(q => q.id === id)) return; // already queued
  bgQueue.push({ id, url });
}

async function processBgQueue() {
  if (bgRunning) return;
  bgRunning = true;
  while (bgQueue.length > 0) {
    const item = bgQueue.shift()!;
    const store = useContentStore.getState();
    // Skip if already extracted since we queued it
    const existing = store.content[item.id];
    if (existing && existing.status !== 'failed') continue;

    // Set loading state
    useContentStore.setState(s => ({
      content: { ...s.content, [item.id]: { id: item.id, status: 'loading' } },
    }));

    // Try fast CSS path
    try {
      const result = await extractArticle(item.url);
      if (result.status === 'success' || result.status === 'restricted') {
        useContentStore.setState(s => ({
          content: {
            ...s.content,
            [item.id]: {
              id: item.id,
              extractedTitle: result.title,
              extractedText: result.text,
              status: result.status,
              method: 'axios' as ExtractionMethod,
            },
          },
        }));
        continue;
      }
    } catch { /* fall through to WebView */ }

    // Fast path failed — queue for WebView and wait for it to complete
    useContentStore.setState(s => ({
      pendingExtractions: { ...s.pendingExtractions, [item.id]: item.url },
    }));
    // Wait for the WebView to process this item before moving on
    await new Promise<void>(resolve => {
      const unsub = useContentStore.subscribe(state => {
        if (!state.pendingExtractions[item.id]) {
          unsub();
          resolve();
        }
      });
    });
  }
  bgRunning = false;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  content: {},
  pendingExtractions: {},

  fetchContent: (id, url) => {
    const existing = get().content[id];
    if (existing && (existing.status === 'success' || existing.status === 'loading' || existing.status === 'restricted')) return;
    set(s => ({
      content: { ...s.content, [id]: { id, status: 'loading' } },
    }));

    // Fast path first
    extractArticle(url).then(result => {
      if (result.status === 'success' || result.status === 'restricted') {
        set(s => ({
          content: {
            ...s.content,
            [id]: { id, extractedTitle: result.title, extractedText: result.text, status: result.status, method: 'axios' as ExtractionMethod },
          },
        }));
      } else {
        set(s => ({
          pendingExtractions: { ...s.pendingExtractions, [id]: url },
        }));
      }
    });
  },

  preExtractAll: (articles) => {
    // Phase 1: queue all top-level articles
    for (const a of articles) {
      enqueueBg(a.id, a.url);
    }
    // Phase 2: queue all related source articles
    for (const a of articles) {
      for (const link of a.relatedLinks ?? []) {
        enqueueBg(link.url, link.url);
      }
    }
    processBgQueue();
  },

  completeExtraction: (id, result) => {
    set(s => {
      const { [id]: _removed, ...remaining } = s.pendingExtractions;
      return {
        pendingExtractions: remaining,
        content: {
          ...s.content,
          [id]: {
            id,
            extractedTitle: result.title,
            extractedText: result.text,
            status: result.status,
            method: 'webview' as ExtractionMethod,
          },
        },
      };
    });
  },
}));

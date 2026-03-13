import { create } from 'zustand';
import { ArticleContent, ExtractionMethod } from '@/types';
import { ExtractionResult, extractArticle } from '@/api/extractor';

interface ContentStore {
  content: Record<string, ArticleContent>;
  pendingExtractions: Record<string, string>;

  fetchContent: (id: string, url: string) => void;
  completeExtraction: (id: string, result: ExtractionResult) => void;
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
        // Axios couldn't extract — fall back to WebView
        set(s => ({
          pendingExtractions: { ...s.pendingExtractions, [id]: url },
        }));
      }
    }).catch(() => {
      // Extraction threw unexpectedly — mark failed, don't risk WebView on a problematic URL
      set(s => ({
        content: { ...s.content, [id]: { id, status: 'failed' } },
      }));
    });
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

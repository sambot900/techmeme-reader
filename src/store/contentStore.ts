import { create } from 'zustand';
import { ArticleContent } from '@/types';
import { ExtractionResult, extractArticle } from '@/api/extractor';

interface ContentStore {
  // Keyed by article ID (URL-derived). One entry per article, shared across sections.
  content: Record<string, ArticleContent>;
  // Articles queued for WebView Readability extraction: id -> url
  pendingExtractions: Record<string, string>;

  // Called by ArticleScreen to queue an extraction.
  fetchContent: (id: string, url: string) => void;
  // Called by ReadabilityExtractor when extraction completes.
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

    // Fast path: try CSS-based extraction via axios (sub-second)
    extractArticle(url).then(result => {
      if (result.status === 'success' || result.status === 'restricted') {
        // Fast path succeeded — use it directly, no WebView needed
        set(s => ({
          content: {
            ...s.content,
            [id]: {
              id,
              extractedTitle: result.title,
              extractedText: result.text,
              status: result.status,
            },
          },
        }));
      } else {
        // Fast path failed — queue for WebView Readability extraction
        set(s => ({
          pendingExtractions: { ...s.pendingExtractions, [id]: url },
        }));
      }
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
          },
        },
      };
    });
  },
}));

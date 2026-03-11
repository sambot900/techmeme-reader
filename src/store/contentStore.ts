import { create } from 'zustand';
import { ArticleContent } from '@/types';
import { ExtractionResult } from '@/api/extractor';

interface ContentStore {
  // Keyed by article ID (URL-derived). One entry per article, shared across sections.
  content: Record<string, ArticleContent>;
  // Articles queued for Readability extraction: id -> url
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
    if (existing && (existing.status === 'success' || existing.status === 'loading')) return;
    set(s => ({
      content: { ...s.content, [id]: { id, status: 'loading' } },
      pendingExtractions: { ...s.pendingExtractions, [id]: url },
    }));
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

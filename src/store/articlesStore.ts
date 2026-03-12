import { create } from 'zustand';
import { ArticleSummary, TechmemeSection } from '@/types';
import { fetchSection } from '@/api/techmeme';
import { useContentStore } from '@/store/contentStore';

type SectionMap<T> = Record<TechmemeSection, T>;

const emptySectionMap = <T>(value: T): SectionMap<T> => ({
  top:    value,
  newest: value,
  more:   value,
  river:  value,
  events: value,
});

interface ArticlesStore {
  articles: SectionMap<ArticleSummary[]>;
  loading:  SectionMap<boolean>;
  error:    SectionMap<string | null>;
  fetchArticles: (section: TechmemeSection) => Promise<void>;
}

export const useArticlesStore = create<ArticlesStore>((set) => ({
  articles: emptySectionMap([]),
  loading:  emptySectionMap(false),
  error:    emptySectionMap(null),

  fetchArticles: async (section) => {
    set(s => ({
      loading: { ...s.loading, [section]: true },
      error:   { ...s.error,   [section]: null },
    }));
    try {
      const articles = await fetchSection(section);
      set(s => ({
        articles: { ...s.articles, [section]: articles },
        loading:  { ...s.loading,  [section]: false },
      }));
      // Pre-extract the first 3 articles so reader content is ready when tapped
      const { fetchContent } = useContentStore.getState();
      for (const a of articles.slice(0, 3)) {
        fetchContent(a.id, a.url);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      set(s => ({
        loading: { ...s.loading, [section]: false },
        error:   { ...s.error,   [section]: message },
      }));
    }
  },
}));

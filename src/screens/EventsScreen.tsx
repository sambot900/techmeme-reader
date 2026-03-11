import React, { useEffect } from 'react';
import { useArticlesStore } from '@/store/articlesStore';
import { ArticleList } from '@/components/ArticleList';

export default function EventsScreen() {
  const articles = useArticlesStore(s => s.articles.events);
  const loading  = useArticlesStore(s => s.loading.events);
  const error    = useArticlesStore(s => s.error.events);
  const fetch    = useArticlesStore(s => s.fetchArticles);

  useEffect(() => { fetch('events'); }, [fetch]);

  return <ArticleList articles={articles} loading={loading} error={error} onRefresh={() => fetch('events')} section="events" />;
}

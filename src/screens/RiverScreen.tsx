import React, { useEffect } from 'react';
import { useArticlesStore } from '@/store/articlesStore';
import { ArticleList } from '@/components/ArticleList';

export default function RiverScreen() {
  const articles = useArticlesStore(s => s.articles.river);
  const loading  = useArticlesStore(s => s.loading.river);
  const error    = useArticlesStore(s => s.error.river);
  const fetch    = useArticlesStore(s => s.fetchArticles);

  useEffect(() => { fetch('river'); }, [fetch]);

  return <ArticleList articles={articles} loading={loading} error={error} onRefresh={() => fetch('river')} section="river" />;
}

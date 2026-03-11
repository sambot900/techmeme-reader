import React, { useEffect } from 'react';
import { useArticlesStore } from '@/store/articlesStore';
import { ArticleList } from '@/components/ArticleList';

export default function TopNewsScreen() {
  const articles = useArticlesStore(s => s.articles.top);
  const loading  = useArticlesStore(s => s.loading.top);
  const error    = useArticlesStore(s => s.error.top);
  const fetch    = useArticlesStore(s => s.fetchArticles);

  useEffect(() => { fetch('top'); }, [fetch]);

  return <ArticleList articles={articles} loading={loading} error={error} onRefresh={() => fetch('top')} section="top" />;
}

import React, { useEffect } from 'react';
import { useArticlesStore } from '@/store/articlesStore';
import { ArticleList } from '@/components/ArticleList';

export default function NewestScreen() {
  const articles = useArticlesStore(s => s.articles.newest);
  const loading  = useArticlesStore(s => s.loading.newest);
  const error    = useArticlesStore(s => s.error.newest);
  const fetch    = useArticlesStore(s => s.fetchArticles);

  useEffect(() => { fetch('newest'); }, [fetch]);

  return <ArticleList articles={articles} loading={loading} error={error} onRefresh={() => fetch('newest')} section="newest" />;
}

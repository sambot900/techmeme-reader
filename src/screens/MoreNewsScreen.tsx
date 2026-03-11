import React, { useEffect } from 'react';
import { useArticlesStore } from '@/store/articlesStore';
import { ArticleList } from '@/components/ArticleList';

export default function MoreNewsScreen() {
  const articles = useArticlesStore(s => s.articles.more);
  const loading  = useArticlesStore(s => s.loading.more);
  const error    = useArticlesStore(s => s.error.more);
  const fetch    = useArticlesStore(s => s.fetchArticles);

  useEffect(() => { fetch('more'); }, [fetch]);

  return <ArticleList articles={articles} loading={loading} error={error} onRefresh={() => fetch('more')} section="more" />;
}

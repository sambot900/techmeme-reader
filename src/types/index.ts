export type TextSize = 'small' | 'medium' | 'large' | 'xlarge' | 'huge';
export type TechmemeSection = 'top' | 'newest' | 'more' | 'river' | 'events';
export type ArticleView = 'reader' | 'browser';
export type ExtractionStatus = 'pending' | 'loading' | 'success' | 'failed' | 'restricted';
export type AccentColor = 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'teal';
export type FontFamily = 'system' | 'serif' | 'monospace' | 'condensed';

export interface RelatedLink {
  title: string;
  url: string;
  source: string;
}

// What the feed list renders. ID is derived from the article URL only — stable
// across sections so the same story is the same article regardless of where it appears.
export interface ArticleSummary {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceUrl: string;
  timestamp: string;
  relatedLinks?: RelatedLink[];
}

// Extracted reader content — fetched on demand and cached by article ID.
// Kept separate from ArticleSummary so the feed list never carries extraction state.
export interface ArticleContent {
  id: string;
  extractedTitle?: string;
  extractedText?: string;
  status: ExtractionStatus;
}

// A saved bookmark. Stores only what's needed to render the saved list.
// savedAt is not a property of the article itself — it belongs on the bookmark record.
export interface SavedArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  savedAt: string;
}

export interface Settings {
  nightMode: boolean;
  textSize: TextSize;
  defaultSection: TechmemeSection;
  defaultArticleView: ArticleView;
  accentColor: AccentColor;
  fontFamily: FontFamily;
}

export type RootStackParamList = {
  Main: undefined;
  // section is navigation context for looking up the summary, not part of article data.
  // inlineTitle/inlineSource are fallbacks for related-link articles that aren't in the feed store.
  Article: { articleId: string; section: TechmemeSection; inlineTitle?: string; inlineSource?: string };
  // articleId + section identify the parent ArticleSummary whose relatedLinks are displayed
  ClusterSources: { articleId: string; section: TechmemeSection };
};

export type DrawerParamList = {
  TopNews: undefined;
  Newest: undefined;
  MoreNews: undefined;
  River: undefined;
  Events: undefined;
  Saved: undefined;
  Settings: undefined;
};

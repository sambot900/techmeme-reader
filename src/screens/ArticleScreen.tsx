import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ArticleView } from '@/types';
import { useArticlesStore } from '@/store/articlesStore';
import { useContentStore } from '@/store/contentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/theme';

type RouteProps = RouteProp<RootStackParamList, 'Article'>;
type Nav = StackNavigationProp<RootStackParamList>;

export default function ArticleScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { articleId, section, inlineTitle, inlineSource } = useRoute<RouteProps>().params;

  const defaultView = useSettingsStore(s => s.defaultArticleView);
  const [activeView, setActiveView] = useState<ArticleView>(defaultView);

  // Resolve title/source — from store if primary article, from inline params if cluster source
  const summary = useArticlesStore(s => s.articles[section].find(a => a.id === articleId));
  const title  = summary?.title  ?? inlineTitle  ?? '';
  const source = summary?.source ?? inlineSource ?? '';
  const url    = summary?.url    ?? articleId;   // articleId is the URL for related-link articles
  const sourceCount = (summary?.relatedLinks?.length ?? 0) + 1;

  const content     = useContentStore(s => s.content[articleId]);
  const fetchContent = useContentStore(s => s.fetchContent);

  useEffect(() => {
    navigation.setOptions({ title: source || '' });
  }, [source, navigation]);

  useEffect(() => {
    if (activeView === 'reader') {
      fetchContent(articleId, url);
    }
  }, [activeView, articleId, url, fetchContent]);

  const renderToggle = () => (
    <View style={[styles.toggle, { backgroundColor: theme.surfaceElevated, borderBottomColor: theme.border }]}>
      <TouchableOpacity
        onPress={() => setActiveView(activeView === 'reader' ? 'browser' : 'reader')}
        style={[styles.toggleBtn, { backgroundColor: theme.accentSoft }]}
      >
        <Text style={[styles.toggleText, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
          {activeView === 'reader' ? 'Browser View' : 'Reader View'}
        </Text>
      </TouchableOpacity>
      {summary && sourceCount > 1 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('ClusterSources', { articleId, section })}
          style={[styles.toggleBtn, { backgroundColor: theme.surfaceElevated }]}
        >
          <Text style={[styles.toggleText, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
            {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderReader = () => {
    if (!content || content.status === 'loading') {
      return (
        <View style={[styles.centered, { backgroundColor: theme.background }]}>
          <ActivityIndicator color={theme.accent} size="large" />
        </View>
      );
    }

    if (content.status === 'restricted') {
      return (
        <View style={[styles.centered, { backgroundColor: theme.background }]}>
          <Text style={[styles.infoText, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
            This article is behind a paywall or requires a login.
          </Text>
          <TouchableOpacity onPress={() => setActiveView('browser')} style={[styles.actionBtn, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.actionBtnText, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
              View on External Site
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (content.status === 'failed') {
      return (
        <View style={[styles.centered, { backgroundColor: theme.background }]}>
          <Text style={[styles.infoText, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
            Could not extract article text.
          </Text>
          <TouchableOpacity onPress={() => setActiveView('browser')} style={[styles.actionBtn, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.actionBtnText, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
              View on External Site
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.readerContent}>
        {(content.extractedTitle || title) ? (
          <Text style={[styles.readerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.large }]}>
            {content.extractedTitle || title}
          </Text>
        ) : null}
        <Text style={[styles.readerSource, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
          {source}
        </Text>
        <Text style={[styles.readerBody, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          {content.extractedText}
        </Text>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderToggle()}
      {activeView === 'reader'
        ? renderReader()
        : <WebView source={{ uri: url }} style={{ flex: 1 }} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggle: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleText: {
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionBtnText: {
    fontWeight: '600',
  },
  readerContent: {
    padding: 20,
  },
  readerTitle: {
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 30,
  },
  readerSource: {
    marginBottom: 16,
    fontWeight: '500',
  },
  readerBody: {
    lineHeight: 26,
  },
});


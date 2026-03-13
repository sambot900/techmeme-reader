import React from 'react';
import { FlatList, View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { ArticleSummary, TechmemeSection } from '@/types';
import { useTheme } from '@/theme';
import { ArticleCard } from './ArticleCard';

interface Props {
  articles: ArticleSummary[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  section: TechmemeSection;
}

export function ArticleList({ articles, loading, error, onRefresh, section }: Props) {
  const theme = useTheme();

  if (loading && articles.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.surface }]}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.surface }]}>
        <Text style={[styles.message, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          {error}
        </Text>
        <TouchableOpacity onPress={onRefresh} style={[styles.retryButton, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.retryText, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.surface }]}>
        <Text style={[styles.message, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          No articles found.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ArticleCard article={item} section={section} />}
      style={{ backgroundColor: theme.surface }}
      onRefresh={onRefresh}
      refreshing={loading}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    fontWeight: '600',
  },
});

// placeholder

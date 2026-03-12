import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArticleSummary, RootStackParamList, TechmemeSection } from '@/types';
import { useTheme } from '@/theme';
import { useSavedStore } from '@/store/savedStore';
import { Svg, Path } from 'react-native-svg';

type Nav = StackNavigationProp<RootStackParamList>;

interface Props {
  article: ArticleSummary;
  section: TechmemeSection;
}

export function ArticleCard({ article, section }: Props) {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const isSaved = useSavedStore(s => s.isArticleSaved(article.id));
  const saveArticle = useSavedStore(s => s.saveArticle);
  const unsaveArticle = useSavedStore(s => s.unsaveArticle);

  const sourceCount = article.relatedLinks?.length ?? 0;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Article', { articleId: article.id, section })}
      style={[styles.card, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      activeOpacity={0.7}
    >
      {article.timestamp ? (
        <Text style={[styles.timestamp, { color: theme.textMuted, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
          {article.timestamp}
        </Text>
      ) : null}

      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.title }]}>
        {article.title}
      </Text>

      <View style={styles.meta}>
        <Text style={[styles.source, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
          {article.source}
        </Text>

        <View style={styles.actions}>
          {sourceCount > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ClusterSources', { articleId: article.id, section })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M4 7h1V4h13v14H5v-3H4V7zm2-1v12h14V4H6v2zm-2 1h12v12H4V7z"
                  fill={theme.accent}
                />
              </Svg>
              <Text style={{ color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small, fontWeight: '600' }}>
                {sourceCount + 1}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => isSaved ? unsaveArticle(article.id) : saveArticle(article)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.537A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1z"
                fill={isSaved ? '#F5C518' : 'none'}
                stroke={isSaved ? '#F5C518' : theme.textMuted}
                strokeWidth={2}
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timestamp: {
    marginBottom: 4,
  },
  title: {
    lineHeight: 22,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  source: {
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chipText: {
    fontWeight: '500',
  },
});

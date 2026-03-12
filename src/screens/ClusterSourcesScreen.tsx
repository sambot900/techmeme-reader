import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import { useArticlesStore } from '@/store/articlesStore';
import { useTheme } from '@/theme';

type RouteProps = RouteProp<RootStackParamList, 'ClusterSources'>;
type Nav = StackNavigationProp<RootStackParamList>;

export default function ClusterSourcesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { articleId, section } = useRoute<RouteProps>().params;

  const summary = useArticlesStore(s => s.articles[section].find(a => a.id === articleId));

  if (!summary) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }}>
          Article not found.
        </Text>
      </View>
    );
  }

  type Row = { id: string; title: string; source: string; isPrimary: boolean };

  const rows: Row[] = [
    { id: summary.id, title: summary.title, source: summary.source, isPrimary: true },
    ...(summary.relatedLinks ?? []).map(link => ({
      id: link.url,
      title: link.title,
      source: link.source,
      isPrimary: false,
    })),
  ];

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      data={rows}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Article', {
              articleId: item.id,
              section,
              ...(item.isPrimary ? {} : { inlineTitle: item.title, inlineSource: item.source }),
            })
          }
          style={[styles.row, { borderBottomColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.source, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
            {item.source}
          </Text>
          {item.title !== item.source && item.title !== '' && (
            <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
              {item.title}
            </Text>
          )}
        </TouchableOpacity>
      )}
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
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  source: {
    marginBottom: 4,
    fontWeight: '500',
  },
  title: {
    lineHeight: 20,
  },
});


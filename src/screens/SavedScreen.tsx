import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import { useSavedStore } from '@/store/savedStore';
import { useTheme } from '@/theme';

type Nav = StackNavigationProp<RootStackParamList>;

export default function SavedScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const saved = useSavedStore(s => s.saved);
  const unsaveArticle = useSavedStore(s => s.unsaveArticle);

  if (saved.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }}>
          No saved articles.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.surface }}
      data={saved}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Article', { articleId: item.id, section: 'top', inlineTitle: item.title, inlineSource: item.source })}
          style={[styles.card, { borderBottomColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.source, { color: theme.accent, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
            {item.source}
          </Text>
          <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.title }]}>
            {item.title}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.date, { color: theme.textMuted, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
              {new Date(item.savedAt).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              onPress={() => unsaveArticle(item.id)}
              style={[styles.removeBtn, { backgroundColor: theme.surfaceElevated }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.removeText, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
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
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  source: {
    marginBottom: 4,
    fontWeight: '500',
  },
  title: {
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {},
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  removeText: {},
});


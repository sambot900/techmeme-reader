import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { useTheme, ACCENTS, ACCENT_LABELS, FONT_FAMILY_LABELS } from '@/theme';
import { useSettingsStore } from '@/store/settingsStore';
import {
  AccentColor,
  FontFamily,
  TextSize,
  TechmemeSection,
  ArticleView,
} from '@/types';

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'xlarge', label: 'XL' },
  { value: 'huge', label: 'XXL' },
];

const SECTION_OPTIONS: { value: TechmemeSection; label: string }[] = [
  { value: 'top', label: 'Top News' },
  { value: 'newest', label: 'Newest' },
  { value: 'more', label: 'More News' },
  { value: 'river', label: 'River' },
  { value: 'events', label: 'Events' },
];

const FONT_OPTIONS: FontFamily[] = ['system', 'serif', 'monospace', 'condensed'];
const ACCENT_OPTIONS: AccentColor[] = ['blue', 'purple', 'green', 'amber', 'red', 'teal'];

function SectionHeader({ label, theme }: { label: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <Text style={[styles.sectionHeader, { color: theme.textMuted, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
      {label}
    </Text>
  );
}

function Row({ children, last, theme }: { children: React.ReactNode; last?: boolean; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderBottomColor: last ? 'transparent' : theme.border }]}>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsStore();

  const showPrivacyPolicy = () => {
    Alert.alert('Privacy Policy', "I don't collect data. Shut up.");
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>

      <SectionHeader label="APPEARANCE" theme={theme} />

      <Row theme={theme}>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Dark Mode
        </Text>
        <Switch
          value={settings.nightMode}
          onValueChange={settings.toggleNightMode}
          trackColor={{ false: theme.border, true: theme.accentSoft }}
          thumbColor={settings.nightMode ? theme.accent : theme.textMuted}
        />
      </Row>

      <Row theme={theme} last>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Accent Color
        </Text>
        <View style={styles.swatches}>
          {ACCENT_OPTIONS.map(color => (
            <TouchableOpacity
              key={color}
              onPress={() => settings.setAccentColor(color)}
              style={[
                styles.swatch,
                { backgroundColor: ACCENTS[color].primary },
                settings.accentColor === color && styles.swatchSelected,
              ]}
              accessibilityLabel={ACCENT_LABELS[color]}
            />
          ))}
        </View>
      </Row>

      <SectionHeader label="TEXT" theme={theme} />

      <Row theme={theme}>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Text Size
        </Text>
        <View style={styles.chips}>
          {TEXT_SIZE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => settings.setTextSize(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: settings.textSize === opt.value ? theme.accent : theme.surfaceElevated,
                  borderColor: settings.textSize === opt.value ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: settings.textSize === opt.value ? theme.background : theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Row>

      <Row theme={theme} last>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Font
        </Text>
        <View style={styles.chips}>
          {FONT_OPTIONS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => settings.setFontFamily(f)}
              style={[
                styles.chip,
                {
                  backgroundColor: settings.fontFamily === f ? theme.accent : theme.surfaceElevated,
                  borderColor: settings.fontFamily === f ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: settings.fontFamily === f ? theme.background : theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
                {FONT_FAMILY_LABELS[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Row>

      <SectionHeader label="DEFAULTS" theme={theme} />

      <Row theme={theme}>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Opening Section
        </Text>
        <View style={styles.chips}>
          {SECTION_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => settings.setDefaultSection(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: settings.defaultSection === opt.value ? theme.accent : theme.surfaceElevated,
                  borderColor: settings.defaultSection === opt.value ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: settings.defaultSection === opt.value ? theme.background : theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Row>

      <Row theme={theme} last>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Article View
        </Text>
        <View style={styles.chips}>
          {(['reader', 'browser'] as ArticleView[]).map(v => (
            <TouchableOpacity
              key={v}
              onPress={() => settings.setDefaultArticleView(v)}
              style={[
                styles.chip,
                {
                  backgroundColor: settings.defaultArticleView === v ? theme.accent : theme.surfaceElevated,
                  borderColor: settings.defaultArticleView === v ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: settings.defaultArticleView === v ? theme.background : theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.small }]}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Row>

      <SectionHeader label="ABOUT" theme={theme} />

      <TouchableOpacity onPress={() => Linking.openURL('mailto:techmemereader@proton.me')}>
        <Row theme={theme}>
          <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
            Send Feedback
          </Text>
          <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
        </Row>
      </TouchableOpacity>

      <TouchableOpacity onPress={showPrivacyPolicy}>
        <Row theme={theme}>
          <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
            Privacy Policy
          </Text>
          <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
        </Row>
      </TouchableOpacity>

      <Row theme={theme} last>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Version
        </Text>
        <Text style={[{ color: theme.textMuted, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          1.0.0
        </Text>
      </Row>

      <SectionHeader label="DEVELOPER" theme={theme} />

      <Row theme={theme} last>
        <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Dev Mode
        </Text>
        <Switch
          value={settings.devMode}
          onValueChange={settings.toggleDevMode}
          trackColor={{ false: theme.border, true: theme.accentSoft }}
          thumbColor={settings.devMode ? theme.accent : theme.textMuted}
        />
      </Row>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 4,
    marginHorizontal: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
    marginRight: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    flex: 1,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '500',
  },
  swatches: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  swatchSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
  },
});


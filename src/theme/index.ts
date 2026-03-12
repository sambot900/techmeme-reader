import { useMemo } from 'react';
import { AccentColor, FontFamily, TextSize } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';

// ─── Accent palettes ──────────────────────────────────────────────────────────
// primary   — links, active states, interactive elements
// secondary — pressed/deep states, filled buttons
// tertiary  — subtle chip/badge backgrounds, tinted surfaces
interface AccentPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

export const ACCENTS: Record<AccentColor, AccentPalette> = {
  blue:   { primary: '#3D8EF0', secondary: '#1A5EB8', tertiary: '#112444' },
  purple: { primary: '#9B6DFF', secondary: '#5B3D9E', tertiary: '#1E1030' },
  green:  { primary: '#3DBF7C', secondary: '#1A7A4A', tertiary: '#0E2E1C' },
  amber:  { primary: '#5BC0EB', secondary: '#2A7FA8', tertiary: '#0E2A3A' },
  red:    { primary: '#FF5C5C', secondary: '#BF2020', tertiary: '#2E0808' },
  teal:   { primary: '#26D7C0', secondary: '#128F7E', tertiary: '#092622' },
};

export const ACCENT_LABELS: Record<AccentColor, string> = {
  blue:   'Blue',
  purple: 'Purple',
  green:  'Green',
  amber:  'Sky',
  red:    'Red',
  teal:   'Teal',
};

// ─── Base palettes ────────────────────────────────────────────────────────────
interface BasePalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  headerBackground: string;
  headerText: string;
}

const DARK: BasePalette = {
  background:       '#0F0F0F',
  surface:          '#1A1A1A',
  surfaceElevated:  '#242424',
  textPrimary:      '#F0F0F0',
  textSecondary:    '#8A8A8A',
  textMuted:        '#4A4A4A',
  border:           '#2C2C2C',
  headerBackground: '#141414',
  headerText:       '#F0F0F0',
};

const LIGHT: BasePalette = {
  background:       '#FAFAFA',
  surface:          '#FFFFFF',
  surfaceElevated:  '#F0F0F0',
  textPrimary:      '#111111',
  textSecondary:    '#555555',
  textMuted:        '#999999',
  border:           '#E0E0E0',
  headerBackground: '#FFFFFF',
  headerText:       '#111111',
};

// ─── Font families ────────────────────────────────────────────────────────────
// On Android: serif → Noto Serif, monospace → Droid Sans Mono,
// condensed → Roboto Condensed. undefined uses the platform default (Roboto).
export const FONT_FAMILIES: Record<FontFamily, string | undefined> = {
  system:    undefined,
  serif:     'serif',
  monospace: 'monospace',
  condensed: 'sans-serif-condensed',
};

export const FONT_FAMILY_LABELS: Record<FontFamily, string> = {
  system:    'System Default',
  serif:     'Serif',
  monospace: 'Monospace',
  condensed: 'Condensed',
};

// ─── Text size scale ──────────────────────────────────────────────────────────
export interface FontSizes {
  small: number;   // captions, timestamps, source labels
  body: number;    // article body, list descriptions
  title: number;   // card headlines
  header: number;  // screen header title (use at design discretion per font)
  large: number;   // section headings, reader subheadings
}

export const TEXT_SIZES: Record<TextSize, FontSizes> = {
  small:  { small: 11, body: 13, title: 15, header: 16, large: 17 },
  medium: { small: 12, body: 15, title: 17, header: 18, large: 20 },
  large:  { small: 13, body: 17, title: 20, header: 20, large: 23 },
  xlarge: { small: 14, body: 19, title: 23, header: 22, large: 26 },
  huge:   { small: 16, body: 22, title: 27, header: 25, large: 30 },
};

// ─── Theme ────────────────────────────────────────────────────────────────────
export interface Theme extends BasePalette {
  accent: string;      // primary accent — links, active
  accentDeep: string;  // secondary — pressed, filled buttons
  accentSoft: string;  // tertiary — tinted chip/badge backgrounds
  fontFamily: string | undefined;
  fontSize: FontSizes;
  isDark: boolean;
}

export function buildTheme(
  nightMode: boolean,
  accentColor: AccentColor,
  fontFamily: FontFamily,
  textSize: TextSize,
): Theme {
  const base = nightMode ? DARK : LIGHT;
  const acc  = ACCENTS[accentColor];
  return {
    ...base,
    accent:     acc.primary,
    accentDeep: acc.secondary,
    accentSoft: acc.tertiary,
    fontFamily: FONT_FAMILIES[fontFamily],
    fontSize:   TEXT_SIZES[textSize],
    isDark:     nightMode,
  };
}

// Memoized hook — re-computes only when a relevant setting actually changes.
export function useTheme(): Theme {
  const nightMode   = useSettingsStore(s => s.nightMode);
  const accentColor = useSettingsStore(s => s.accentColor);
  const fontFamily  = useSettingsStore(s => s.fontFamily);
  const textSize    = useSettingsStore(s => s.textSize);
  return useMemo(
    () => buildTheme(nightMode, accentColor, fontFamily, textSize),
    [nightMode, accentColor, fontFamily, textSize],
  );
}


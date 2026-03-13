import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@/theme';

const ICON_SIZE = 20;

// ─── SVG icon paths (all 24×24 viewBox) ────────────────────────────────────
function FireIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M12 23C7.03 23 3 18.97 3 14c0-3.13 1.53-6.09 4.09-7.9l1.09-.78.29 1.32C8.83 8.44 9.73 9.76 11 10.58V10c0-3.24 1.69-6.27 4.46-8.05L16.54 1l.39 1.42C17.6 5.04 19 7.47 19 10c0 1-.18 1.95-.5 2.83A6.42 6.42 0 0 0 21 14c0 4.97-4.03 9-9 9zm-3.72-12.3C6.87 12.27 5 14.67 5 17.5 5 19.43 6.57 21 8.5 21c.31 0 .61-.04.9-.11A7.01 7.01 0 0 1 7 16c0-2.07.88-4.03 2.28-5.3zM12 21c3.87 0 7-3.13 7-7 0-1.1-.26-2.16-.73-3.1A7.98 7.98 0 0 1 12 15a7.98 7.98 0 0 1-5-1.73V14c0 3.87 3.13 7 5 7z"
        fill={color}
      />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"
        fill={color}
      />
    </Svg>
  );
}

function MoreDotsIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill={color}
      />
    </Svg>
  );
}

function RiverIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M3.5 18.5l3-3 3 3 3-3 3 3 3-3 3 3"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 12.5l3-3 3 3 3-3 3 3 3-3 3 3"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 6.5l3-3 3 3 3-3 3 3 3-3 3 3"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
        fill={color}
      />
    </Svg>
  );
}

function BookmarkIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.537A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

function GearIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 9.87a.49.49 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94 0 .31.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Route → icon mapping ───────────────────────────────────────────────────
const ROUTE_ICONS: Record<string, React.FC<{ color: string }>> = {
  TopNews:  FireIcon,
  Newest:   ClockIcon,
  MoreNews: MoreDotsIcon,
  River:    RiverIcon,
  Events:   CalendarIcon,
  Saved:    BookmarkIcon,
  Settings: GearIcon,
};

export default function DrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const { state, descriptors, navigation } = props;

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.surface }}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: theme.fontSize.body }]}>
          Techmeme Reader
        </Text>
      </View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const focused = state.index === index;

        const IconComponent = ROUTE_ICONS[route.name];
        const iconColor = focused ? theme.accent : theme.textSecondary;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[
              styles.item,
              focused && { backgroundColor: theme.accentSoft },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              {IconComponent ? <IconComponent color={iconColor} /> : null}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: focused ? theme.accent : theme.textPrimary,
                  fontFamily: theme.fontFamily,
                  fontSize: theme.fontSize.body,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    marginBottom: 4,
  },
  headerText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  label: {
    fontWeight: '500',
  },
});

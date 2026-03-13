import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { DrawerParamList, RootStackParamList } from '@/types';
import { useTheme } from '@/theme';

import TopNewsScreen from '@/screens/TopNewsScreen';
import NewestScreen from '@/screens/NewestScreen';
import MoreNewsScreen from '@/screens/MoreNewsScreen';
import RiverScreen from '@/screens/RiverScreen';
import EventsScreen from '@/screens/EventsScreen';
import SavedScreen from '@/screens/SavedScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ArticleScreen from '@/screens/ArticleScreen';
import ClusterSourcesScreen from '@/screens/ClusterSourcesScreen';
import DrawerContent from '@/navigation/DrawerContent';

const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack  = createStackNavigator<RootStackParamList>();

function HamburgerButton() {
  const navigation = useNavigation();
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ marginLeft: 16 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={{ width: 22, height: 18, justifyContent: 'space-between' }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ height: 2.5, borderRadius: 1, backgroundColor: theme.headerText }} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

function DrawerNavigator() {
  const theme = useTheme();

  const screenOptions = {
    headerStyle: { backgroundColor: theme.headerBackground },
    headerTintColor: theme.headerText,
    headerTitleStyle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.header,
      fontWeight: '600' as const,
      marginLeft: 4,
    },
    headerLeft: () => <HamburgerButton />,
    drawerStyle: { backgroundColor: theme.surface },
    drawerLabelStyle: {
      fontFamily: theme.fontFamily,
      color: theme.textPrimary,
      fontSize: theme.fontSize.body,
    },
    drawerActiveTintColor: theme.accent,
    drawerInactiveTintColor: theme.textSecondary,
  };

  return (
    <Drawer.Navigator
      initialRouteName="TopNews"
      screenOptions={screenOptions}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="TopNews"  component={TopNewsScreen}  options={{ title: 'Top News' }} />
      <Drawer.Screen name="Newest"   component={NewestScreen}   options={{ title: 'Newest' }} />
      <Drawer.Screen name="MoreNews" component={MoreNewsScreen} options={{ title: 'More News' }} />
      <Drawer.Screen name="River"    component={RiverScreen}    options={{ title: 'River' }} />
      <Drawer.Screen name="Events"   component={EventsScreen}   options={{ title: 'Events' }} />
      <Drawer.Screen name="Saved"    component={SavedScreen}    options={{ title: 'Saved' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Drawer.Navigator>
  );
}

const quickTransition = {
  open: {
    animation: 'timing' as const,
    config: { duration: 200 },
  },
  close: {
    animation: 'timing' as const,
    config: { duration: 200 },
  },
} as const;

export function AppNavigator() {
  const theme = useTheme();

  const navTheme = useMemo(() => ({
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme : DefaultTheme).colors,
      background: theme.background,
      card: theme.headerBackground,
      text: theme.textPrimary,
      border: theme.border,
      primary: theme.accent,
    },
  }), [theme]);

  const stackHeaderOptions = {
    headerStyle: { backgroundColor: theme.headerBackground },
    headerTintColor: theme.headerText,
    headerTitleStyle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.header,
      fontWeight: '600' as const,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.background },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          transitionSpec: quickTransition,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen
          name="Article"
          component={ArticleScreen}
          options={{ headerShown: true, title: '', ...stackHeaderOptions }}
        />
        <Stack.Screen
          name="ClusterSources"
          component={ClusterSourcesScreen}
          options={{ headerShown: true, title: 'All Coverage', ...stackHeaderOptions }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

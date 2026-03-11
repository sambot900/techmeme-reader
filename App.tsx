import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import ReadabilityExtractor from '@/components/ReadabilityExtractor';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <ReadabilityExtractor />
    </SafeAreaProvider>
  );
}

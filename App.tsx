import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import ReadabilityExtractor from '@/components/ReadabilityExtractor';

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={ebStyles.container}>
          <Text style={ebStyles.title}>Something went wrong</Text>
          <Text style={ebStyles.subtitle}>The app hit an unexpected error.</Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={ebStyles.button}
          >
            <Text style={ebStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const ebStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0F0F', padding: 24 },
  title: { color: '#F0F0F0', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  subtitle: { color: '#8A8A8A', fontSize: 15, marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: '#1E1E1E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#F0F0F0', fontSize: 15, fontWeight: '500' },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <AppNavigator />
          <ReadabilityExtractor />
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

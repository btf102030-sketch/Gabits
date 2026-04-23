import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    const t = setTimeout(() => { SplashScreen.hideAsync().catch(() => {}); }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          />
        </View>
      </AuthProvider>
    </ErrorBoundary>
  );
}

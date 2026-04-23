import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme';

export default function Index() {
  const { isLoading, isAuthenticated, needsOnboarding } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  if (needsOnboarding) return <Redirect href="/onboarding" />;
  return <Redirect href="/tabs" />;
}

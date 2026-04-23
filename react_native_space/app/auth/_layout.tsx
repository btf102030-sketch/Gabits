import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (isAuthenticated) return <Redirect href="/tabs" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
  );
}

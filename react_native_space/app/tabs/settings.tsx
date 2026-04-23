import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/theme';
import { useAuth } from '../../src/contexts/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#12061F']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Signed in as</Text>
            <Text style={styles.name}>{user?.name ?? '—'}</Text>
            <Text style={styles.email}>{user?.email ?? '—'}</Text>
          </View>
          <Pressable onPress={onLogout} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.lg },
  card: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  name: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  email: { color: colors.textMuted, marginTop: 2 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.error, marginTop: spacing.md },
  logoutText: { color: colors.error, fontWeight: '700' },
});

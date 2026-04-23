import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../src/theme';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={styles.c}>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.sub}>The screen you're looking for doesn't exist.</Text>
      <Pressable style={styles.btn} onPress={() => router.replace('/')}>
        <Text style={styles.btnText}>Go home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.sm },
  sub: { color: colors.textMuted, marginBottom: spacing.lg },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.md },
  btnText: { color: '#fff', fontWeight: '600' },
});

import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
};

export const GradientButton: React.FC<Props> = ({ title, onPress, loading, disabled, style, textStyle, icon }) => {
  const handlePress = () => {
    if (loading || disabled) return;
    if (Platform.OS !== 'web') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
    onPress?.();
  };
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { transform: [{ scale: pressed ? 0.97 : 1 }], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.inner}>
            {icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

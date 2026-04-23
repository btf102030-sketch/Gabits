import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export const TextField: React.FC<Props> = ({ label, error, isPassword, style, onFocus, onBlur, ...rest }) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const active = focused || !!rest.value;
  return (
    <View style={styles.wrap}>
      <View style={[styles.field, { borderColor: error ? colors.error : focused ? colors.primary : colors.border }]}>
        <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive, error ? { color: colors.error } : null]}>
          {label}
        </Text>
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.textDim}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          secureTextEntry={isPassword && !show}
          autoCapitalize={rest.autoCapitalize ?? 'none'}
        />
        {isPassword ? (
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={10} accessibilityLabel="Toggle password visibility">
            <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 18,
    paddingBottom: 8,
    minHeight: 58,
  },
  label: { position: 'absolute', left: spacing.md },
  labelActive: { top: 6, fontSize: 11, color: colors.textMuted },
  labelInactive: { top: 18, fontSize: 15, color: colors.textMuted },
  input: { flex: 1, color: colors.text, fontSize: 16, padding: 0 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: spacing.sm },
});

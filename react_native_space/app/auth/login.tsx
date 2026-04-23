import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../src/theme';
import { TextField } from '../../src/components/TextField';
import { GradientButton } from '../../src/components/GradientButton';
import { useAuth } from '../../src/contexts/AuthContext';
import { apiErrorMessage } from '../../src/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email?.trim()) e.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrors({ form: apiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#1A0D26']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>                                                                                    //fixes SafeAreaView style error
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.brand}>gabits</Text>
              <Text style={styles.tagline}>Build your goals, one milestone at a time.</Text>
            </View>
            <View style={styles.form}>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
                error={errors.password}
              />
              {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}
              <GradientButton title="Log In" onPress={onSubmit} loading={loading} />
              <Pressable onPress={() => router.push('/auth/signup')} style={styles.link} accessibilityRole="link">
                <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign Up</Text></Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { color: colors.text, fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  formError: { color: colors.error, marginBottom: spacing.sm, textAlign: 'center' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textMuted },
  linkAccent: { color: colors.accent, fontWeight: '700' },
});

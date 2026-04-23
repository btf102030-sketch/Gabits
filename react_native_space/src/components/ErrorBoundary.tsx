import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, spacing, radius } from '../theme';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error?.message ?? 'Unknown error'}</Text>
          <Pressable style={styles.btn} onPress={this.reset}><Text style={styles.btnText}>Try Again</Text></Pressable>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.bg, justifyContent: 'center' },
  title: { color: colors.error, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  msg: { color: colors.text, fontSize: 14, marginBottom: spacing.lg },
  btn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});

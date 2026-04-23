import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../src/theme';
import { GradientButton } from '../src/components/GradientButton';
import { Scene3D } from '../src/components/Scene3D';
import { useAuth } from '../src/contexts/AuthContext';
import { apiErrorMessage, SceneState } from '../src/services/api';

const DEMO_SCENE: SceneState = {
  goalCount: 6,
  overallCompletion: 0,
  totalMilestones: 0,
  completedMilestones: 0,
  vertices: [
    { goalId: 'demo-0', title: '', priority: 'MEDIUM', vertexIndex: 0, totalMilestones: 0, completedMilestones: 0, growth: 0.4 },
    { goalId: 'demo-1', title: '', priority: 'MEDIUM', vertexIndex: 1, totalMilestones: 0, completedMilestones: 0, growth: 0.0 },
    { goalId: 'demo-2', title: '', priority: 'MEDIUM', vertexIndex: 2, totalMilestones: 0, completedMilestones: 0, growth: 0.25 },
    { goalId: 'demo-3', title: '', priority: 'MEDIUM', vertexIndex: 3, totalMilestones: 0, completedMilestones: 0, growth: 0 },
    { goalId: 'demo-4', title: '', priority: 'MEDIUM', vertexIndex: 4, totalMilestones: 0, completedMilestones: 0, growth: 0.6 },
    { goalId: 'demo-5', title: '', priority: 'MEDIUM', vertexIndex: 5, totalMilestones: 0, completedMilestones: 0, growth: 0 },
  ],
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFinish = async () => {
    setErr(null); setLoading(true);
    try {
      await completeOnboarding();
      router.replace('/tabs');
    } catch (e) { setErr(apiErrorMessage(e)); }
    finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={['#0A0A0A', '#12061F']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.brand}>gabits</Text>
          <Text style={styles.title}>A single form. Your goals, in motion.</Text>
          <Text style={styles.subtitle}>
            Every goal is a vertex on one shape. Add goals and the form evolves — from a point, to a segment, through the platonic solids, all the way to the icosahedron.
          </Text>

          <View style={styles.sceneWrap}>
            <Scene3D scene={DEMO_SCENE} size={300} />
          </View>

          <View style={styles.howWrap}>
            <Text style={styles.howItem}>• Up to <Text style={styles.bold}>12 goals</Text>, one per vertex.</Text>
            <Text style={styles.howItem}>• Each completed <Text style={styles.bold}>milestone</Text> elongates that vertex outward.</Text>
            <Text style={styles.howItem}>• Select a goal to rotate its vertex to the front and light it up.</Text>
          </View>

          {err ? <Text style={styles.err}>{err}</Text> : null}
          <GradientButton title="Enter the Scene" onPress={onFinish} loading={loading} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  brand: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginTop: spacing.md },
  title: { color: colors.text, fontSize: 26, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 },
  sceneWrap: { alignItems: 'center', marginVertical: spacing.lg },
  howWrap: { marginTop: spacing.md, marginBottom: spacing.lg },
  howItem: { color: colors.textMuted, marginBottom: 8, lineHeight: 22 },
  bold: { color: colors.text, fontWeight: '700' },
  err: { color: colors.error, textAlign: 'center', marginVertical: spacing.md },
});

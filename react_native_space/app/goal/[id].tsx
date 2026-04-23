import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/theme';
import { GoalsAPI, MilestonesAPI, GoalSummary, Milestone, apiErrorMessage, PRIORITY_LABELS, PriorityLevel, VERTEX_COLORS } from '../../src/services/api';

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  LOW: '#64748B', MEDIUM: '#06B6D4', HIGH: '#F59E0B', CRITICAL: '#EF4444',
};

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = String(id ?? '');
  const [goal, setGoal] = useState<GoalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMs, setNewMs] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!goalId) return;
    try {
      const g = await GoalsAPI.get(goalId);
      setGoal(g);
    } catch (e) { Alert.alert('Error', apiErrorMessage(e)); }
    finally { setLoading(false); }
  }, [goalId]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addMilestone = async () => {
    if (!newMs.trim() || !goal) return;
    setSaving(true);
    try {
      await MilestonesAPI.create(goal.id, { title: newMs.trim() });
      setNewMs('');
      await load();
    } catch (e) { Alert.alert('Error', apiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const toggleMs = async (m: Milestone) => {
    try { await MilestonesAPI.update(m.id, { completed: !m.completed }); await load(); }
    catch (e) { Alert.alert('Error', apiErrorMessage(e)); }
  };

  //patch to fix delete milestone
  const deleteMs = async (m: Milestone) => {
  const doIt = async () => {
    try {
      await MilestonesAPI.remove(m.id);
      await load();
    } catch (e) { Alert.alert('Error', apiErrorMessage(e)); }
  };

  if (Platform.OS === 'web') {
    if (confirm(`Delete milestone: ${m.title}?`)) doIt();
  } else {
    Alert.alert('Delete Milestone?', m.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doIt },
    ]);
  }
};

  //patch to fix delete goals
const deleteGoal = async () => {
  if (!goal) return;
  const doIt = async () => {
    try {
      await GoalsAPI.remove(goal.id);
      router.replace('/tabs'); // Use replace to ensure we leave the deleted record page
    } catch (e) { Alert.alert('Error', apiErrorMessage(e)); }
  };

  if (Platform.OS === 'web') {
    if (confirm('Delete this goal and all its milestones?')) doIt();
  } else {
    Alert.alert('Delete Goal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doIt },
    ]);
  }
};

  if (loading || !goal) {
    return (
      <LinearGradient colors={['#0A0A0A', '#12061F']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>                                                //patch style error
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>        
          <Text style={{ color: colors.textMuted }}>Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const color = VERTEX_COLORS[goal.vertexIndex % VERTEX_COLORS.length];

  return (
    <LinearGradient colors={['#0A0A0A', '#12061F']} style={{ flex: 1 }}>
      <Stack.Screen options={{
        title: '',
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: colors.text,
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Pressable onPress={() => router.push({ pathname: '/goal/create', params: { id: goal.id } })}>
              <Ionicons name="create-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={deleteGoal}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          </View>
        ),
      }} />
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
          <View style={[styles.banner, { borderColor: color }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.bannerText, { color }]}>Vertex {goal.vertexIndex + 1}</Text>
          </View>
          <Text style={styles.title}>{goal.title}</Text>
          {goal.description ? <Text style={styles.desc}>{goal.description}</Text> : null}

          <View style={styles.metaRow}>
            <View style={[styles.pill, { backgroundColor: PRIORITY_COLORS[goal.priority] + '22', borderColor: PRIORITY_COLORS[goal.priority] }]}>
              <Text style={[styles.pillText, { color: PRIORITY_COLORS[goal.priority] }]}>{PRIORITY_LABELS[goal.priority]}</Text>
            </View>
            <Text style={styles.progText}>{goal.completedMilestones}/{goal.totalMilestones} · {Math.round(goal.progressPercent)}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${goal.progressPercent}%`, backgroundColor: color }]} />
          </View>

          <Text style={styles.section}>Milestones</Text>
          <View style={styles.addRow}>
            <TextInput
              value={newMs}
              onChangeText={setNewMs}
              placeholder="Add a milestone"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              onSubmitEditing={addMilestone}
              returnKeyType="done"
            />
            <Pressable onPress={addMilestone} disabled={saving || !newMs.trim()} style={[styles.addBtn, (!newMs.trim() || saving) && { opacity: 0.5 }]}>
              <Ionicons name="add" size={22} color="#fff" />
            </Pressable>
          </View>

          {goal.milestones.length === 0 ? (
            <Text style={styles.emptyMs}>No milestones yet. Add one to elongate this vertex.</Text>
          ) : (
            goal.milestones.map((m) => (
              <View key={m.id} style={styles.msRow}>
                <Pressable onPress={() => toggleMs(m)} style={styles.checkbox}>
                  {m.completed ? <Ionicons name="checkmark-circle" size={24} color={color} /> : <Ionicons name="ellipse-outline" size={24} color={colors.textMuted} />}
                </Pressable>
                <Text style={[styles.msTitle, m.completed && { color: colors.textMuted, textDecorationLine: 'line-through' }]}>{m.title}</Text>
                <Pressable onPress={() => deleteMs(m)} style={{ padding: 6 }}>
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  bannerText: { fontSize: 11, fontWeight: '700' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  desc: { color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  pillText: { fontSize: 11, fontWeight: '700' },
  progText: { color: colors.textMuted, fontSize: 13 },
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 999 },
  section: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  input: { flex: 1, color: colors.text, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  emptyMs: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  msRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  checkbox: { padding: 4, marginRight: 6 },
  msTitle: { flex: 1, color: colors.text, fontSize: 15 },
});

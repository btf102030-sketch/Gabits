import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Scene3D } from '../../src/components/Scene3D';
import { SHAPE_NAMES } from '../../src/components/Polyhedra';
import { colors, spacing, radius } from '../../src/theme';
import {
  GoalsAPI, SceneAPI, GoalSummary, SceneState,
  PRIORITY_LABELS, PriorityLevel, VERTEX_COLORS, MAX_GOALS,
} from '../../src/services/api';

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  LOW: '#64748B', MEDIUM: '#06B6D4', HIGH: '#F59E0B', CRITICAL: '#EF4444',
};

const CARD_WIDTH = 200;

export default function DashboardScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [scene, setScene] = useState<SceneState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [g, s] = await Promise.all([GoalsAPI.list(), SceneAPI.state()]);
      setGoals(g?.goals ?? []);
      setScene(s ?? null);
    } catch (e) { console.warn('fetch fail', e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const completion = scene?.overallCompletion ?? 0;
  const completionPct = Math.round(completion * 100);
  const canCreate = goals.length < MAX_GOALS;
  const shapeName = SHAPE_NAMES[scene?.goalCount ?? 0] ?? '';
  const sceneSize = Math.min(340, Dimensions.get('window').width - 32);

  return (
    <LinearGradient colors={['#0A0A0A', '#12061F']} style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          <View style={styles.header}>
            <Text style={styles.brand}>gabits</Text>
            <Text style={styles.shapeName}>{shapeName} · {goals.length}/{MAX_GOALS}</Text>
            <View style={styles.progressTrack}>
              <LinearGradient colors={['#7C3AED', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${completionPct}%` }]} />
            </View>
            <Text style={styles.completionText}>{scene?.completedMilestones ?? 0}/{scene?.totalMilestones ?? 0} milestones · {completionPct}% complete</Text>
          </View>

          <View style={styles.sceneWrap}>
            <Scene3D scene={scene} selectedVertexIndex={selected} size={sceneSize} />
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Goals</Text>
            {canCreate ? (
              <Pressable
                onPress={() => router.push(`/goal/${g.id}`)}
                hitSlop={10}
                style={styles.msBtn}
              >
                <Text style={styles.msBtnText}>+ MS</Text>
              </Pressable>
            ) : null}
          </View>

          {goals.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Begin with a single point.</Text>
              <Text style={styles.emptySub}>Add your first goal. As more arrive, the form evolves.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardRow}
              snapToInterval={CARD_WIDTH + 12}
              decelerationRate="fast"
            >
              {goals.map((g) => {
                const color = VERTEX_COLORS[g.vertexIndex % VERTEX_COLORS.length];
                const isSel = selected === g.vertexIndex;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => setSelected(isSel ? null : g.vertexIndex)}
                    style={[
                      styles.goalCard,
                      { width: CARD_WIDTH },
                      isSel && { borderColor: color, backgroundColor: color + '18' },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.cardDot, { backgroundColor: color }]} />
                      <Text style={styles.cardIdx}>V{g.vertexIndex + 1}</Text>
                      <Pressable                                                    //change for > to text button
                        onPress={() => router.push(`/goal/${g.id}`)}
                        hitSlop={10}
                        style={styles.msBtn}
                      >
                        <Text style={styles.msBtnText}>+ MS</Text>
                      </Pressable> 
                    </View>
                    <Text numberOfLines={2} style={styles.cardTitle}>{g.title}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.priorityPill, { backgroundColor: PRIORITY_COLORS[g.priority] + '22', borderColor: PRIORITY_COLORS[g.priority] }]}>
                        <Text style={[styles.priorityText, { color: PRIORITY_COLORS[g.priority] }]}>{PRIORITY_LABELS[g.priority]}</Text>
                      </View>
                      <Text style={styles.msCount}>{g.completedMilestones}/{g.totalMilestones}</Text>
                    </View>
                    <View style={styles.msTrack}>
                      <View style={[styles.msFill, { width: `${g.progressPercent}%`, backgroundColor: color }]} />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {selected != null ? (
            <Text style={styles.hint}>Tap again to release · chevron opens the goal</Text>
          ) : null}
        </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  brand: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  shapeName: { color: colors.textMuted, marginTop: 2, fontSize: 13 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  completionText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  sceneWrap: { alignItems: 'center', marginVertical: spacing.sm },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  listTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#7C3AED' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: spacing.md, paddingHorizontal: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptySub: { color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  cardRow: { paddingHorizontal: spacing.lg, gap: 12, paddingBottom: 4 },
  goalCard: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  cardIdx: { color: colors.textMuted, fontSize: 11, fontWeight: '700', flex: 1 },
  cardChev: { padding: 4 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700', minHeight: 38 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  priorityPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  msCount: { color: colors.textMuted, fontSize: 12 },
  msTrack: { marginTop: 8, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' },
  msFill: { height: '100%', borderRadius: 999 },
  hint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: spacing.sm },
  msBtn: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#7C3AED' },
  msBtnText: {color: '#fff', fontSize: 11, fontWeight: '700' },
});

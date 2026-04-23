import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../src/theme';
import { TextField } from '../../src/components/TextField';
import { GradientButton } from '../../src/components/GradientButton';
import { GoalsAPI, apiErrorMessage, PriorityLevel, ALL_PRIORITIES, PRIORITY_LABELS, VERTEX_COLORS } from '../../src/services/api';

export default function GoalCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params?.id && params.id !== 'create' ? String(params.id) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [vertexIndex, setVertexIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (editingId) {
          const g = await GoalsAPI.get(editingId);
          setTitle(g.title);
          setDescription(g.description ?? '');
          setPriority(g.priority);
          setVertexIndex(g.vertexIndex);
        }
      } catch (e) { setErr(apiErrorMessage(e)); }
      finally { setInitial(false); }
    })();
  }, [editingId]);

  const submit = async () => {
    setErr(null);
    if (!title.trim()) { setErr('Title is required'); return; }
    setLoading(true);
    try {
      if (editingId) {
        await GoalsAPI.update(editingId, { title: title.trim(), description: description.trim() || undefined, priority });
      } else {
        await GoalsAPI.create({ title: title.trim(), description: description.trim() || undefined, priority });
      }
      router.back();
    } catch (e) { setErr(apiErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const previewColor = vertexIndex != null ? VERTEX_COLORS[vertexIndex % VERTEX_COLORS.length] : '#7C3AED';

  return (
    <LinearGradient colors={['#0A0A0A', '#12061F']} style={{ flex: 1 }}>
      <Stack.Screen options={{ title: editingId ? 'Edit Goal' : 'New Goal', headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: colors.text }} />
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
            {editingId && vertexIndex != null ? (
              <View style={[styles.vertexBanner, { borderColor: previewColor }]}>
                <View style={[styles.dot, { backgroundColor: previewColor }]} />
                <Text style={[styles.vertexLabel, { color: previewColor }]}>Vertex {vertexIndex + 1}</Text>
              </View>
            ) : (
              <Text style={styles.assignNote}>A vertex will be assigned automatically when you create the goal.</Text>
            )}

            <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Read 12 books this year" />
            <TextField label="Description (optional)" value={description} onChangeText={setDescription} multiline />

            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.row}>
              {ALL_PRIORITIES.map(p => (
                <Pressable key={p} onPress={() => setPriority(p)} style={[styles.pill, priority === p && styles.pillActive]}>
                  <Text style={[styles.pillText, priority === p && styles.pillTextActive]}>{PRIORITY_LABELS[p]}</Text>
                </Pressable>
              ))}
            </View>

            {err ? <Text style={styles.err}>{err}</Text> : null}
            <GradientButton title={editingId ? 'Save' : 'Create Goal'} onPress={submit} loading={loading || initial} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  vertexBanner: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, marginBottom: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  vertexLabel: { fontSize: 12, fontWeight: '700' },
  assignNote: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  sectionLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' },
  pillActive: { borderColor: '#EC4899', backgroundColor: '#EC489922' },
  pillText: { color: colors.textMuted, fontWeight: '600' },
  pillTextActive: { color: colors.text },
  err: { color: colors.error, textAlign: 'center', marginVertical: spacing.md },
});

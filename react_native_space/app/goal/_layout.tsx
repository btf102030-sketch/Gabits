import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function GoalLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: colors.text }} />
  );
}

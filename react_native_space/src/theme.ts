export const colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceElevated: '#222222',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F5F5F5',
  textMuted: '#9CA3AF',
  textDim: '#6B7280',
  primary: '#7C3AED',
  accent: '#EC4899',
  track: '#2A2A2A',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F97316',
  info: '#6366F1',
};

export const priorityColors: Record<string, string> = {
  foundational: '#10B981',
  priority: '#F97316',
  important: '#6366F1',
  'would-be-nice': '#64748B',
};

export const priorityLabels: Record<string, string> = {
  foundational: 'Foundational',
  priority: 'Priority',
  important: 'Important',
  'would-be-nice': 'Would be nice',
};

export const categoryColors = [
  '#10B981', '#F97316', '#8B5CF6', '#EAB308', '#EC4899',
  '#06B6D4', '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6',
];

export function colorForCategoryName(name: string | undefined | null): string {
  if (!name) return '#64748B';
  const presets: Record<string, string> = {
    Health: '#10B981',
    Career: '#F97316',
    'Personal Development': '#8B5CF6',
    Financial: '#EAB308',
    Relationships: '#EC4899',
    relationships: '#EC4899',
  };
  if (presets[name]) return presets[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return categoryColors[hash % categoryColors.length] ?? '#64748B';
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 9999 };

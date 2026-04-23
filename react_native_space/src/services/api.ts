import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3000';

const TOKEN_KEY = 'gabits_token';
export async function saveToken(t: string) { try { await AsyncStorage.setItem(TOKEN_KEY, t); } catch {} }
export async function getToken(): Promise<string | null> { try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; } }
export async function clearToken() { try { await AsyncStorage.removeItem(TOKEN_KEY); } catch {} }

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
  transformRequest: [(data, _headers) => {
    if (data && typeof data === 'object' && !(data instanceof FormData)) return JSON.stringify(data);
    return data;
  }],
});

client.interceptors.request.use(async (config) => {
  const t = await getToken();
  if (t) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${t}` } as any;
  return config;
});

export function apiErrorMessage(e: unknown): string {
  const ae = e as AxiosError<any>;
  const d = ae?.response?.data;
  if (typeof d === 'string') return d;
  const msg = (d as any)?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return (ae?.message as string) || 'Something went wrong';
}

export const MAX_GOALS = 12;

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export const ALL_PRIORITIES: PriorityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const PRIORITY_LABELS: Record<PriorityLevel, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' };

// 12 color palette keyed by vertex index
export const VERTEX_COLORS: string[] = [
  '#F97316', // orange
  '#7C3AED', // violet
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#10B981', // emerald
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#EF4444', // red
  '#84CC16', // lime
  '#A855F7', // purple
  '#14B8A6', // teal
  '#EAB308', // yellow
];

export type User = { id: string; email: string; name: string; onboardingCompleted: boolean };

export type Milestone = { id: string; title: string; order: number; completed: boolean; completedAt: string | null };

export type GoalSummary = {
  id: string;
  title: string;
  description: string | null;
  priority: PriorityLevel;
  vertexIndex: number;
  totalMilestones: number;
  completedMilestones: number;
  progressPercent: number;
  milestones: Milestone[];
};

export type SceneVertex = {
  goalId: string;
  title: string;
  priority: PriorityLevel;
  vertexIndex: number;
  totalMilestones: number;
  completedMilestones: number;
  growth: number;
};

export type SceneState = {
  goalCount: number;
  overallCompletion: number;
  totalMilestones: number;
  completedMilestones: number;
  vertices: SceneVertex[];
};

export const AuthAPI = {
  login: async (email: string, password: string) => (await client.post('/api/auth/login', { email, password })).data,
  signup: async (email: string, password: string, name: string) => (await client.post('/api/signup', { email, password, name })).data,
};

export const UsersAPI = {
  me: async (): Promise<User> => (await client.get('/api/users/me')).data,
  updateOnboarding: async (data: { onboardingCompleted?: boolean }): Promise<User> => (await client.patch('/api/users/me/onboarding', data)).data,
};

export const GoalsAPI = {
  list: async (): Promise<{ goals: GoalSummary[] }> => (await client.get('/api/goals')).data,
  get: async (id: string): Promise<GoalSummary> => (await client.get(`/api/goals/${id}`)).data,
  create: async (data: { title: string; description?: string; priority: PriorityLevel }): Promise<GoalSummary> => (await client.post('/api/goals', data)).data,
  update: async (id: string, data: Partial<{ title: string; description: string; priority: PriorityLevel; vertexIndex: number }>): Promise<GoalSummary> => (await client.patch(`/api/goals/${id}`, data)).data,
  remove: async (id: string) => (await client.delete(`/api/goals/${id}`)).data,
};

export const MilestonesAPI = {
  listForGoal: async (goalId: string): Promise<Milestone[]> => (await client.get(`/api/goals/${goalId}/milestones`)).data,
  create: async (goalId: string, data: { title: string }): Promise<Milestone> => (await client.post(`/api/goals/${goalId}/milestones`, data)).data,
  update: async (id: string, data: Partial<{ title: string; completed: boolean; order: number }>): Promise<Milestone> => (await client.patch(`/api/milestones/${id}`, data)).data,
  remove: async (id: string) => (await client.delete(`/api/milestones/${id}`)).data,
};

export const SceneAPI = {
  state: async (): Promise<SceneState> => (await client.get('/api/scene/state')).data,
};

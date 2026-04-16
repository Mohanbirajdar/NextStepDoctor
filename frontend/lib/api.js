import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('nextstep-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const endpoints = {
  chatStream: `${API_URL}/api/chat/stream`,
  conversations: `${API_URL}/api/conversations`,
  conversation: (id) => `${API_URL}/api/conversations/${id}`,
  compare: `${API_URL}/api/compare`,
  health: `${API_URL}/api/health`,
  authRegister: `${API_URL}/api/auth/register`,
  authLogin: `${API_URL}/api/auth/login`,
  authMe: `${API_URL}/api/auth/me`,
  authProfile: `${API_URL}/api/auth/profile`,
};

export async function fetchConversations() {
  const { data } = await api.get('/api/conversations');
  return data.conversations;
}

export async function deleteConversation(id) {
  await api.delete(`/api/conversations/${id}`);
}

export async function fetchConversation(id) {
  const { data } = await api.get(`/api/conversations/${id}`);
  return data.conversation;
}

export async function compareRequest(payload) {
  const { data } = await api.post('/api/compare', payload);
  return data;
}

export async function registerRequest(payload) {
  const { data } = await api.post('/api/auth/register', payload);
  return data;
}

export async function loginRequest(payload) {
  const { data } = await api.post('/api/auth/login', payload);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/api/auth/me');
  return data.user;
}

export async function updateProfileRequest(payload) {
  const { data } = await api.put('/api/auth/profile', payload);
  return data.user;
}

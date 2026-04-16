import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const endpoints = {
  chatStream: `${API_URL}/api/chat/stream`,
  conversations: `${API_URL}/api/conversations`,
  conversation: (id) => `${API_URL}/api/conversations/${id}`,
  compare: `${API_URL}/api/compare`,
  health: `${API_URL}/api/health`,
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

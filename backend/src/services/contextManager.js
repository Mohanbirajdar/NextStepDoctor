import Conversation from '../models/Conversation.js';
import { logger } from '../utils/logger.js';

export async function getOrCreateConversation(conversationId, context, firstMessage) {
  if (conversationId) {
    const existing = await Conversation.findById(conversationId);
    if (existing) return existing;
  }

  const title = firstMessage?.substring(0, 60) || 'New Conversation';
  const conv = new Conversation({ title, context, messages: [] });
  await conv.save();
  return conv;
}

export async function saveMessage(conversationId, messageData) {
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new Error(`Conversation ${conversationId} not found`);
  conv.messages.push(messageData);
  await conv.save();
  return conv;
}

export async function getConversationHistory(conversationId) {
  const conv = await Conversation.findById(conversationId).lean();
  if (!conv) return [];
  return conv.messages.map((m) => ({
    role: m.role,
    content: m.content || m.structured?.conditionOverview || '',
  }));
}

export async function listConversations() {
  return Conversation.find({}, 'title context createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();
}

export async function deleteConversation(conversationId) {
  return Conversation.findByIdAndDelete(conversationId);
}

export async function getConversation(conversationId) {
  return Conversation.findById(conversationId).lean();
}

import Conversation from '../models/Conversation.js';
import { logger } from '../utils/logger.js';

export async function getOrCreateConversation(conversationId, context, firstMessage, userId) {
  if (!userId) throw new Error('User required');
  if (conversationId) {
    const existing = await Conversation.findOne({ _id: conversationId, userId });
    if (existing) return existing;
  }

  const title = firstMessage?.substring(0, 60) || 'New Conversation';
  const conv = new Conversation({ title, context, messages: [], userId });
  await conv.save();
  return conv;
}

export async function saveMessage(conversationId, messageData, userId) {
  const conv = await Conversation.findOne({ _id: conversationId, userId });
  if (!conv) throw new Error(`Conversation ${conversationId} not found`);
  conv.messages.push(messageData);
  await conv.save();
  return conv;
}

export async function getConversationHistory(conversationId, userId) {
  const conv = await Conversation.findOne({ _id: conversationId, userId }).lean();
  if (!conv) return [];
  return conv.messages.map((m) => ({
    role: m.role,
    content: m.content || m.structured?.conditionOverview || '',
  }));
}

export async function listConversations(userId) {
  return Conversation.find({ userId }, 'title context createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();
}

export async function deleteConversation(conversationId, userId) {
  return Conversation.findOneAndDelete({ _id: conversationId, userId });
}

export async function getConversation(conversationId, userId) {
  return Conversation.findOne({ _id: conversationId, userId }).lean();
}
